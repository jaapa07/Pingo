/**
 * IA DE BATALHA — 4 níveis (novato, treinador, líder, conselho) + ajuste por dificuldade.
 *
 * Sem trapaça: a IA decide ANTES de conhecer a ação do jogador (ela nem é passada para cá) e só usa informação pública:
 *  - da própria equipe: tudo;
 *  - do adversário: espécie, nível, fração da barra de vida, status, estágios e condições visíveis, golpes que ele JÁ usou
 *    nesta batalha, quantas reservas restam e quais criaturas já apareceram. Atributos do adversário são ESTIMADOS a partir
 *    da espécie e do nível (genes médios, sem esforço, sem personalidade) — nunca lidos da instância.
 * O acaso da IA também passa pelo `rng`. A dificuldade muda apenas o nível da IA e o uso de itens; nunca vida ou dano.
 *
 * A escada (cada degrau vence mais que o anterior com as mesmas equipes — números em docs/EQUILIBRIO.md):
 *  - novato: 70% golpe ao acaso, 30% o mais forte;
 *  - treinador: prefere o golpe forte e super-eficaz (poder × eficácia × mesmo-tipo, sem conta de atributos), distrai-se
 *    uma vez em quatro e troca em desvantagem grave;
 *  - líder: pensa o 1×1 como uma corrida (quem derruba quem primeiro) e dá valor a status, reforços, cura e troca pelo
 *    que mudam nessa corrida; usa remédios (quando a regra de itens permite); erra pouco;
 *  - conselho: a mesma conta sem deslizes, com estimativa mais fina do adversário, troca mais cedo, prefere o nocaute
 *    mais seguro (prioridade quando é mais lento), prepara varridas e guarda o ás para o fim.
 * Nenhum nível troca a criatura que acabou de entrar antes de ela agir um turno: quem abre a batalha é sempre a 1ª da lista.
 */
import type { CriaturaInst, Opcoes, Stat, StatusId, TipoId } from '../core/tipos';
import { rng } from '../core/rng';
import { DESESPERO, golpe as defGolpe, type GolpeDef } from '../data/golpes';
import { temItemDef, item as defItem } from '../data/itens';
import { atributos, atributosDe, especie } from './criatura';
import { danoBase, eficaciaGolpe, multClima, multEstagio, multPrecisao, type Acao, type Batalha, type Pos } from './engine';

export type NivelIA = 'novato' | 'treinador' | 'lider' | 'conselho';
export const NIVEIS_IA: NivelIA[] = ['novato', 'treinador', 'lider', 'conselho'];
/** explorador: um nível abaixo; veterano: um nível acima */
export function nivelEfetivo(base: NivelIA, dificuldade: Opcoes['dificuldade']): NivelIA {
  const d = dificuldade === 'explorador' ? -1 : dificuldade === 'veterano' ? 1 : 0;
  return NIVEIS_IA[Math.max(0, Math.min(3, NIVEIS_IA.indexOf(base) + d))];
}
/**
 * Quem usa itens de cura em batalha (spec 7A, decisão do autor):
 *  - veterano: todos, sempre;
 *  - aventureiro: só quem tem `itens` definidos (rival, líderes, chefes, Liga, Conselho) e só do 8º ginásio em diante (7+ insígnias);
 *  - explorador: como no aventureiro, mas só a IA de nível conselho.
 */
export function iaUsaItens(nivelBase: NivelIA, dificuldade: Opcoes['dificuldade'], o: { temItens?: boolean; insignias?: number } = {}): boolean {
  if (dificuldade === 'veterano') return true;
  if (!o.temItens || (o.insignias ?? 0) < 7) return false;
  return dificuldade === 'aventureiro' || nivelBase === 'conselho';
}

export interface OpcoesIA {
  /** pode usar os itens do próprio lado */
  usaItens?: boolean;
  /** criatura errante: age no 1º turno e tenta fugir a partir do 2º (decisão do autor) */
  foge?: boolean;
}

/* ------------------------------ memória por batalha ------------------------------ */
interface Memoria { ultimaTroca: [number, number] }
const memorias = new WeakMap<Batalha, Memoria>();
const memoria = (b: Batalha): Memoria => { let m = memorias.get(b); if (!m) memorias.set(b, (m = { ultimaTroca: [-9, -9] })); return m; };

/* ------------------------------ estimativas (informação pública) ------------------------------ */
const GEN_MEDIO: Record<Stat, number> = { vida: 8, atq: 8, def: 8, atqEsp: 8, defEsp: 8, vel: 8 };
const ESF_ZERO: Record<Stat, number> = { vida: 0, atq: 0, def: 0, atqEsp: 0, defEsp: 0, vel: 0 };
/** atributos estimados de uma criatura adversária (espécie + nível) */
const estimados = (c: CriaturaInst) => atributosDe(especie(c.especie).base, GEN_MEDIO, ESF_ZERO, c.nivel, '');
const tiposDe = (c: CriaturaInst): TipoId[] => especie(c.especie).tipos;
/** fração da vida (o que a barra mostra) */
const fracVida = (c: CriaturaInst) => c.vida / atributos(c).vida;
const media = (g: GolpeDef) => { const m = g.efeitos.find((e) => e.t === 'multi'); return m && m.t === 'multi' ? (m.min === m.max ? m.min : 3) : 1; };

interface Lutador { c: CriaturaInst; tipos: TipoId[]; nivel: number; atq: number; def: number; atqEsp: number; defEsp: number; vel: number; vida: number; vidaMax: number; status: StatusId | null }
/** visão de uma criatura em campo: `real` (é minha) ou estimada (é do adversário) */
function lutador(b: Batalha, p: Pos, real: boolean): Lutador {
  const c = b.criatura(p)!, v = b.vol(p), a = real ? atributos(c) : estimados(c);
  const s = (k: Exclude<Stat, 'vida'>) => Math.max(1, Math.floor(a[k] * multEstagio(v.est[k]) * (k === 'vel' && c.status === 'paralisado' ? 0.25 : 1)));
  return { c, tipos: tiposDe(c), nivel: c.nivel, atq: s('atq'), def: s('def'), atqEsp: s('atqEsp'), defEsp: s('defEsp'), vel: s('vel'), vidaMax: a.vida, vida: Math.max(1, Math.round(a.vida * fracVida(c))), status: c.status };
}
/** o mesmo para uma criatura na reserva (sem estágios) */
function lutadorReserva(c: CriaturaInst, real: boolean): Lutador {
  const a = real ? atributos(c) : estimados(c);
  return { c, tipos: tiposDe(c), nivel: c.nivel, atq: a.atq, def: a.def, atqEsp: a.atqEsp, defEsp: a.defEsp, vel: a.vel, vidaMax: a.vida, vida: Math.max(1, Math.round(a.vida * fracVida(c))), status: c.status };
}
/** dano médio esperado de um acerto (sem contar precisão) */
export function danoEsperado(b: Batalha, de: Lutador, g: GolpeDef, em: Lutador, barreira = false): number {
  if (g.cat === 'status') return 0;
  const ef = eficaciaGolpe(g, em.tipos);
  if (ef === 0) return 0;
  for (const e of g.efeitos) {
    if (e.t === 'fixo') return e.v === 'nivel' ? de.nivel : e.v === 'metade' ? Math.floor(em.vida / 2) : e.v;
    if (e.t === 'exige' && e.cond === 'alvoDormindo' && em.status !== 'dormindo') return 0;
  }
  let poder = g.poder;
  for (const e of g.efeitos) if (e.t === 'poder') {
    if ((e.modo === 'vidaBaixa' && de.vida * 2 < de.vidaMax) || (e.modo === 'alvoFerido' && em.vida * 2 < em.vidaMax) || (e.modo === 'alvoComStatus' && em.status) || (e.modo === 'climaAtivo' && b.clima !== 'limpo')) poder *= 2;
  }
  const fis = g.cat === 'fisico';
  let m = 0.925 * ef * multClima(b.clima, g.tipo);
  if (g.id !== DESESPERO.id && de.tipos.includes(g.tipo)) m *= 1.5;
  if (fis && de.status === 'queimado') m *= 0.5;
  if (barreira) m *= 0.5;
  return Math.max(1, Math.floor(danoBase(de.nivel, poder, fis ? de.atq : de.atqEsp, fis ? em.def : em.defEsp) * m)) * media(g);
}
function chanceAcerto(b: Batalha, p: Pos, g: GolpeDef, q: Pos): number {
  if (g.precisao === 0 || g.efeitos.some((e) => e.t === 'certeiroNoClima' && e.c === b.clima)) return 1;
  let c = (g.precisao / 100) * multPrecisao(Math.max(-6, Math.min(6, b.vol(p).est.prec - b.vol(q).est.eva)));
  if (b.clima === 'nevoa' && !b.tipos(p).some((t) => t === 'assombro' || t === 'mente')) c *= 0.8;
  return Math.min(1, c);
}
/** golpes que a IA supõe que o adversário tem: os já revelados + um golpe genérico (poder 70) de cada tipo dele */
function golpesSupostos(b: Batalha, q: Pos): GolpeDef[] {
  const c = b.criatura(q)!, rev = [...(b.lados[q.lado].revelados.get(c.uid) ?? [])].map(defGolpe).filter((g) => g.cat !== 'status');
  const a = estimados(c), cat = a.atq >= a.atqEsp ? 'fisico' : 'especial';
  const genericos = tiposDe(c).map((t): GolpeDef => ({ id: '?' + t, nome: '', tipo: t, cat, poder: 70, precisao: 100, pg: 1, desc: '', anim: '', efeitos: [], alvo: 'um' }));
  return [...rev, ...genericos];
}
/** maior dano que o adversário `q` deve causar em mim (`eu`) num turno */
function ameaca(b: Batalha, q: Pos, eu: Lutador, meuLado: 0 | 1): number {
  const ele = lutador(b, q, false);
  return Math.max(0, ...golpesSupostos(b, q).map((g) => danoEsperado(b, ele, g, eu, b.lados[meuLado].barreira[g.cat === 'fisico' ? 'fisico' : 'especial'] > 0)));
}
/** nota de confronto de uma criatura minha contra um adversário em campo: >0 = vantagem */
function confronto(b: Batalha, meu: CriaturaInst, q: Pos): number {
  const eu = lutadorReserva(meu, true), ele = lutador(b, q, false);
  const melhor = Math.max(0, ...meu.golpes.filter((s) => s.pg > 0).map((s) => defGolpe(s.id)).map((g) => danoEsperado(b, eu, g, ele) / ele.vidaMax));
  const pior = Math.max(0, ...golpesSupostos(b, q).map((g) => danoEsperado(b, ele, g, eu) / eu.vidaMax));
  return Math.min(1.5, melhor) - Math.min(1.5, pior) + 0.3 * fracVida(meu) + (eu.vel > ele.vel ? 0.1 : 0);
}
/** a criatura que a IA guarda para o fim: lendária, ou a de maior nível / soma de atributos base */
function indiceDoAs(equipe: CriaturaInst[]): number {
  let melhor = -1, nota = -1;
  equipe.forEach((c, i) => {
    if (c.vida <= 0) return;
    const e = especie(c.especie), soma = Object.values(e.base).reduce((a, x) => a + x, 0);
    const n = (e.lendario ? 100000 : 0) + c.nivel * 1000 + soma;
    if (n > nota) { nota = n; melhor = i; }
  });
  return melhor;
}

/* ------------------------------ avaliação de golpes ------------------------------ */
const VALOR_STATUS: Record<StatusId, number> = { dormindo: 0.55, congelado: 0.5, paralisado: 0.4, queimado: 0.35, encantado: 0.35, envenenado: 0.3 };
const IMUNES: Record<StatusId, TipoId[]> = { queimado: ['brasa'], envenenado: ['veneno', 'ferro'], paralisado: ['trovao'], congelado: ['geada'], dormindo: [], encantado: ['encanto'] };

interface Avaliacao { valor: number; alvo?: Pos; nocauteia: boolean }
/** valor de um golpe em "frações da vida do alvo" (dano) somado ao valor tático dos efeitos (níveis líder e conselho) */
function avaliar(b: Batalha, p: Pos, g: GolpeDef, nivel: NivelIA): Avaliacao {
  const tatico = nivel === 'lider' || nivel === 'conselho';
  const eu = lutador(b, p, true), adv = b.adversarios(p), lado = b.lados[p.lado], outro = b.lados[(1 - p.lado) as 0 | 1];
  const minhaFrac = eu.vida / eu.vidaMax;
  const risco = Math.max(0, ...adv.map((q) => ameaca(b, q, eu, p.lado))) / eu.vida; // ≥1 = posso cair neste turno
  let valor = 0, alvo: Pos | undefined, nocauteia = false;

  const porAlvo = (q: Pos): { v: number; ko: boolean } => {
    const ele = lutador(b, q, false), volQ = b.vol(q), acc = chanceAcerto(b, p, g, q);
    if (volQ.some && !g.efeitos.some((e) => e.t === 'carga')) return { v: 0, ko: false };
    let v = 0, ko = false;
    if (g.cat !== 'status') {
      const d = danoEsperado(b, eu, g, ele, outro.barreira[g.cat === 'fisico' ? 'fisico' : 'especial'] > 0) * (adv.length > 1 && g.alvo !== 'um' ? 0.75 : 1);
      const frac = Math.min(1, d / ele.vida);
      ko = d >= ele.vida;
      v = frac * acc + (ko ? 0.5 * acc : 0);
      if (g.efeitos.some((e) => e.t === 'recarga') && !ko) v *= 0.7;
      if (g.efeitos.some((e) => e.t === 'carga' && e.semCargaNoClima !== b.clima)) v *= 0.6;
      if (g.efeitos.some((e) => e.t === 'tombo')) v *= 0.9;
      const rec = g.efeitos.find((e) => e.t === 'recuo'); if (rec && rec.t === 'recuo' && !ko) v *= 1 - rec.pct / 400;
      if (d === 0) return { v: 0, ko: false };
    }
    if (!tatico) return { v, ko };
    const saudavel = ele.vida / ele.vidaMax > 0.4 ? 1 : 0.3;
    for (const e of g.efeitos) {
      const ch = ('chance' in e && e.chance !== undefined ? e.chance : 100) / 100;
      switch (e.t) {
        case 'status':
          if (!ele.status && !ele.tipos.some((t) => IMUNES[e.s].includes(t)) && outro.barreira.status <= 0) {
            let s = VALOR_STATUS[e.s];
            if (e.s === 'paralisado' && ele.vel > eu.vel) s += 0.2;
            if (e.s === 'queimado' && ele.atq > ele.atqEsp) s += 0.15;
            v += s * ch * acc * saudavel * (g.cat === 'status' ? 1 : 0.6);
          }
          break;
        case 'volatil':
          if (e.eu) v -= 0.1;
          else if (e.v === 'confuso' && volQ.confuso <= 0) v += 0.3 * ch * acc * saudavel * (g.cat === 'status' ? 1 : 0.6);
          else if (e.v === 'semente' && !volQ.semente && !ele.tipos.includes('mata')) v += 0.35 * acc * saudavel;
          else if (e.v === 'atordoado' && eu.vel > ele.vel) v += 0.15 * ch;
          break;
        case 'estagio':
          if (!e.eu && e.n < 0 && volQ.est[e.s] > -2) v += 0.18 * -e.n * ch * acc * saudavel * (g.cat === 'status' ? 1 : 0.5);
          break;
        case 'armadilha': if (volQ.preso <= 0) v += 0.12; break;
        case 'trocaForcada': {
          const soma = volQ.est.atq + volQ.est.atqEsp + volQ.est.def + volQ.est.defEsp + volQ.est.vel;
          if (!b.selvagem && b.reservas(q.lado).length) v += soma >= 2 ? 0.5 : outro.espinhos ? 0.2 : 0.03;
          break;
        }
      }
    }
    return { v, ko };
  };

  if (g.alvo === 'um') { for (const q of adv) { const r = porAlvo(q); if (r.v > valor || !alvo) { valor = r.v; alvo = q; nocauteia = r.ko; } } }
  else if (g.alvo === 'adversarios' || g.alvo === 'todos') {
    for (const q of adv) { const r = porAlvo(q); valor += r.v; nocauteia = nocauteia || r.ko; }
    if (g.alvo === 'todos') for (const q of b.ativosDe(p.lado)) if (q.pos !== p.pos) { const al = lutador(b, q, true); valor -= Math.min(1, danoEsperado(b, eu, g, al) * 0.75 / al.vida) * 1.2; }
  }
  if (!tatico) return { valor, alvo, nocauteia };

  // efeitos sobre mim e sobre o campo
  const tenhoFisico = b.criatura(p)!.golpes.some((s) => defGolpe(s.id).cat === 'fisico'), tenhoEspecial = b.criatura(p)!.golpes.some((s) => defGolpe(s.id).cat === 'especial');
  const v = b.vol(p);
  for (const e of g.efeitos) {
    switch (e.t) {
      case 'estagio':
        if (e.eu && e.n > 0 && g.cat === 'status') {
          const util = e.s === 'atq' ? tenhoFisico : e.s === 'atqEsp' ? tenhoEspecial : e.s === 'vel' ? adv.some((q) => lutador(b, q, false).vel >= eu.vel) : e.s !== 'eva';
          if (util && v.est[e.s] < 2 && minhaFrac > 0.6 && risco < 0.45) valor += 0.22 * e.n;
        } else if (e.eu && e.n < 0) valor -= 0.05 * -e.n;
        break;
      case 'cura': if (g.cat === 'status') valor += minhaFrac < 0.45 && risco < 0.9 * (e.pct / 100) * (eu.vidaMax / eu.vida) ? 0.7 : minhaFrac < 0.3 ? 0.3 : 0; break;
      case 'descanso': valor += minhaFrac < 0.3 && risco < 0.5 ? 0.6 : 0; break;
      case 'curaStatus': valor += (e.equipe ? lado.equipe.filter((c) => c.vida > 0 && c.status).length : eu.status ? 1 : 0) * 0.3; break;
      case 'foco': if (v.foco < 1 && minhaFrac > 0.7 && risco < 0.4) valor += 0.15; break;
      case 'protecao': valor += v.protUsos > 0 ? 0 : adv.some((q) => b.vol(q).carga || b.vol(q).semente || b.criatura(q)!.status === 'envenenado' || b.criatura(q)!.status === 'queimado') ? 0.4 : nivel === 'conselho' && risco >= 1 && b.reservas(p.lado).length === 0 ? 0.2 : 0.02; break;
      case 'clima': {
        if (b.clima === e.c) break;
        const tipoBom: TipoId | null = e.c === 'sol' ? 'brasa' : e.c === 'chuva' ? 'rio' : null;
        const meus = lado.equipe.filter((c) => c.vida > 0);
        let ganho = 0;
        if (tipoBom) {
          ganho += b.criatura(p)!.golpes.some((s) => { const x = defGolpe(s.id); return x.tipo === tipoBom && x.cat !== 'status'; }) ? 0.3 : 0;
          ganho += Math.min(0.3, 0.1 * meus.filter((c) => c.golpes.some((s) => { const x = defGolpe(s.id); return x.tipo === tipoBom && x.cat !== 'status'; })).length);
          const tipoRuim: TipoId = e.c === 'sol' ? 'rio' : 'brasa';
          if (adv.some((q) => tiposDe(b.criatura(q)!).includes(tipoRuim))) ganho += 0.2;
          if (meus.some((c) => c.golpes.some((s) => { const x = defGolpe(s.id); return x.efeitos.some((f) => (f.t === 'carga' && f.semCargaNoClima === e.c) || (f.t === 'certeiroNoClima' && f.c === e.c)); }))) ganho += 0.2;
        } else if (e.c === 'garoa' || e.c === 'poeira') {
          const imune = (t: TipoId[]) => (e.c === 'garoa' ? t.includes('geada') : t.some((x) => x === 'terra' || x === 'pedra' || x === 'ferro'));
          ganho += (imune(eu.tipos) ? 0.15 : -0.1) + (adv.some((q) => !imune(tiposDe(b.criatura(q)!))) ? 0.15 : 0);
          if (meus.some((c) => c.golpes.some((s) => defGolpe(s.id).efeitos.some((f) => f.t === 'certeiroNoClima' && f.c === e.c)))) ganho += 0.2;
        } else if (e.c === 'nevoa') ganho += eu.tipos.some((t) => t === 'assombro' || t === 'mente') ? 0.3 : 0;
        // desfazer um clima que favorece o adversário também vale
        if ((b.clima === 'sol' && adv.some((q) => tiposDe(b.criatura(q)!).includes('brasa'))) || (b.clima === 'chuva' && adv.some((q) => tiposDe(b.criatura(q)!).includes('rio')))) ganho += 0.2;
        valor += Math.max(0, ganho) * (nivel === 'conselho' ? 1.3 : 1) * (minhaFrac > 0.35 ? 1 : 0.3);
        break;
      }
      case 'barreira':
        if (lado.barreira[e.b] <= 0) {
          const fisicos = adv.filter((q) => { const a = estimados(b.criatura(q)!); return a.atq >= a.atqEsp; }).length;
          valor += e.b === 'status' ? 0.15 : (e.b === 'fisico' ? fisicos : adv.length - fisicos) > 0 ? 0.35 : 0.08;
        }
        break;
      case 'espinhos': if (!outro.espinhos) valor += Math.min(0.45, 0.15 * b.reservas((1 - p.lado) as 0 | 1).length); break;
      case 'limpaEstagios': {
        const deles = adv.reduce((a, q) => a + Object.values(b.vol(q).est).reduce((x, y) => x + y, 0), 0), meusEst = Object.values(v.est).reduce((x, y) => x + y, 0);
        valor += deles - meusEst >= 2 ? 0.5 : 0; break;
      }
      case 'bateVolta': if (b.reservas(p.lado).length && risco > 0.6) valor += 0.15; break;
    }
  }
  return { valor, alvo, nocauteia };
}

/* ------------------------------ decisão ------------------------------ */
function golpeAleatorio(b: Batalha, p: Pos): Acao {
  const ok = b.golpesValidos(p);
  if (!ok.length) return { tipo: 'golpe', slot: -1 };
  const adv = b.adversarios(p);
  return { tipo: 'golpe', slot: rng.escolha(ok), ...(adv.length > 1 ? { alvo: rng.escolha(adv) } : {}) };
}
/** melhor troca disponível: índice da reserva e o quanto ela melhora o confronto atual */
function melhorTroca(b: Batalha, p: Pos, nivel: NivelIA): { para: number; ganho: number } | null {
  if (!b.podeTrocar(p)) return null;
  const adv = b.adversarios(p); if (!adv.length) return null;
  const lado = b.lados[p.lado], as = nivel === 'conselho' ? indiceDoAs(lado.equipe) : -1;
  const nota = (c: CriaturaInst) => Math.min(...adv.map((q) => confronto(b, c, q)));
  const atual = nota(b.criatura(p)!);
  let melhor: { para: number; ganho: number } | null = null;
  for (const i of b.reservas(p.lado)) {
    if (i === as && b.reservas(p.lado).length > 1) continue;
    const ganho = nota(lado.equipe[i]) - atual;
    if (!melhor || ganho > melhor.ganho) melhor = { para: i, ganho };
  }
  return melhor;
}
/** item de cura que vale a pena usar agora (líder+ ou veterano) */
function itemUtil(b: Batalha, p: Pos): Acao | null {
  const lado = b.lados[p.lado], c = b.criatura(p)!, indice = lado.ativos[p.pos], frac = fracVida(c);
  const ids = Object.keys(lado.itens).filter((id) => lado.itens[id] > 0 && temItemDef(id) && defItem(id).uso?.emBatalha && !defItem(id).uso?.cuia);
  if (!ids.length) return null;
  if (frac < 0.3) {
    const max = atributos(c).vida;
    const curas = ids.filter((id) => defItem(id).uso?.cura && b.itemServe(p.lado, id, indice)).sort((x, y) => { const v = (id: string) => { const u = defItem(id).uso!.cura!; return u === 'total' ? max : u; }; return v(y) - v(x); });
    if (curas.length) return { tipo: 'item', item: curas[0], alvo: indice };
  }
  if (c.status === 'dormindo' || c.status === 'congelado' || (c.status === 'paralisado' && frac > 0.5)) {
    const cura = ids.find((id) => defItem(id).uso?.curaStatus && b.itemServe(p.lado, id, indice));
    if (cura) return { tipo: 'item', item: cura, alvo: indice };
  }
  return null;
}

/**
 * Ajustes finos da IA (medidos em tools/sim-equilibrio.ts; ver docs/EQUILIBRIO.md):
 *  - distracaoTreinador: chance de o treinador comum soltar um golpe qualquer em vez do melhor;
 *  - deslizeLider: chance de o líder escolher outro golpe que não o melhor (o conselho não erra);
 *  - margemL / margemC: quanto a reserva precisa ser melhor para líder / conselho trocarem;
 *  - folgaAs: o ás do conselho só sai antes do fim se for melhor que as outras opções por esta folga;
 *  - varrida: valor que o conselho dá a um reforço de atributo por adversária que ainda resta;
 *  - troca / status / as: chaves de estudo (desligam trocas, golpes de status e a guarda do ás).
 */
export const AJ = { troca: true, as: true, status: true, margemL: 0.45, margemC: 0.3, distracaoTreinador: 0.25, deslizeLider: 0.1, folgaAs: 0.5, varrida: 0.05 };
/* ------------------------------ duelo 1×1 (líder e conselho) ------------------------------ */
/**
 * Líder e Conselho pensam o 1×1 como uma CORRIDA: quem derruba quem primeiro, com o que cada ação muda nessa conta
 * (dormir o adversário rende turnos livres, paralisar inverte a ordem, subir Ataque encurta a corrida, curar alonga…).
 * Só entram estimativas públicas (ver cabeçalho). A nota vai de −1 (perco sem arranhar) a +1 (ganho com a vida cheia).
 */
interface Duelo {
  eu: number; euMax: number; ele: number; eleMax: number;
  /** dano médio por turno: meu (`D`) e dele (`A`) */
  D: number; A: number;
  /** dano só deste turno (padrão: `D`) */
  d1?: number;
  primeiro: boolean;
  /** desgaste por turno (veneno, queimadura, parasita): positivo = perde vida */
  chipEle: number; chipEu: number;
  /** turnos sem agir */
  eleParado: number; euParado: number;
}
function corrida(d: Duelo): number {
  let eu = d.eu, ele = d.ele, eleParado = d.eleParado, euParado = d.euParado;
  for (let t = 0; t < 14; t++) {
    const meu = euParado >= 1 ? 0 : t === 0 && d.d1 !== undefined ? d.d1 : d.D, dele = eleParado >= 1 ? 0 : d.A;
    euParado = Math.max(0, euParado - 1); eleParado = Math.max(0, eleParado - 1);
    if (d.primeiro) { ele -= meu; if (ele <= 0) break; eu -= dele; if (eu <= 0) break; }
    else { eu -= dele; if (eu <= 0) break; ele -= meu; if (ele <= 0) break; }
    ele -= d.chipEle; if (ele <= 0) break;
    eu = Math.min(d.euMax, eu - d.chipEu); if (eu <= 0) break;
  }
  if (ele <= 0) return 0.5 + (0.5 * Math.max(0, eu)) / d.euMax;
  if (eu <= 0) return -Math.min(1, ele / d.eleMax);
  return 0.25 * (eu / d.euMax - ele / d.eleMax);
}
/** gasto o turno num efeito: se sou mais lento, apanho antes de o efeito valer */
function aposEfeito(base: Duelo, aplicar: (d: Duelo) => void): number {
  const d = { ...base };
  if (base.primeiro) { aplicar(d); d.d1 = 0; return corrida(d); }
  if (base.eleParado < 1) { d.eu -= base.A; if (d.eu <= 0) return -Math.min(1, d.ele / d.eleMax); }
  d.eleParado = Math.max(0, d.eleParado - 1);
  d.ele -= d.chipEle; d.eu = Math.min(d.euMax, d.eu - d.chipEu);
  if (d.ele <= 0) return 0.5 + (0.5 * Math.max(0, d.eu)) / d.euMax;
  if (d.eu <= 0) return -Math.min(1, d.ele / d.eleMax);
  aplicar(d);
  return corrida(d);
}
const CATEGORIA = (a: Record<Stat, number>) => (a.atq >= a.atqEsp ? 'fisico' : 'especial');
/** poder do golpe "genérico" que a IA supõe no adversário, conforme o nível dele */
const poderSuposto = (nivel: number) => Math.max(45, Math.min(90, 35 + nivel));
/** maior dano que `ele` deve causar em `eu` por turno (golpes já vistos + um golpe suposto de cada tipo dele) */
function ameacaDe(b: Batalha, ele: Lutador, eu: Lutador, ladoDele: 0 | 1, fino: boolean): number {
  const vistos = [...(b.lados[ladoDele].revelados.get(ele.c.uid) ?? [])].map(defGolpe).filter((g) => g.cat !== 'status');
  const cat = CATEGORIA(estimados(ele.c)), poder = fino ? poderSuposto(ele.nivel) : 70;
  const genericos = ele.tipos.map((t): GolpeDef => ({ id: '?' + t, nome: '', tipo: t, cat, poder, precisao: 100, pg: 1, desc: '', anim: '', efeitos: [], alvo: 'um' }));
  const barreira = (g: GolpeDef) => b.lados[(1 - ladoDele) as 0 | 1].barreira[g.cat === 'fisico' ? 'fisico' : 'especial'] > 0;
  return Math.max(0, ...[...vistos, ...genericos].map((g) => danoEsperado(b, ele, g, eu, barreira(g)) * (g.precisao === 0 ? 1 : g.precisao / 100)));
}
interface NotaDuelo { slot: number; g: GolpeDef; nota: number; nocauteia: boolean; acerto: number }
/** nota de cada golpe utilizável de `p` contra o único adversário `q` */
function notasDeDuelo(b: Batalha, p: Pos, q: Pos, nivel: NivelIA): { notas: NotaDuelo[]; base: Duelo; eu: Lutador; ele: Lutador } {
  const fino = nivel === 'conselho';
  const c = b.criatura(p)!, eu = lutador(b, p, true), ele = lutador(b, q, false), v = b.vol(p), volQ = b.vol(q);
  const lado = b.lados[p.lado], outro = b.lados[q.lado];
  const golpes = b.golpesValidos(p).map((slot) => ({ slot, g: defGolpe(c.golpes[slot].id) }));
  const danoDe = (g: GolpeDef) => (volQ.some && !g.efeitos.some((e) => e.t === 'carga') ? 0 : danoEsperado(b, eu, g, ele, outro.barreira[g.cat === 'fisico' ? 'fisico' : 'especial'] > 0));
  // dano "de cruzeiro": o melhor golpe repetido (recarga e carga rendem metade; precisão entra na média)
  const cruzeiro = (g: GolpeDef) => danoDe(g) * chanceAcerto(b, p, g, q) * (g.efeitos.some((e) => e.t === 'recarga' || (e.t === 'carga' && e.semCargaNoClima !== b.clima)) ? 0.5 : 1);
  const melhor = golpes.filter((x) => x.g.cat !== 'status').reduce<{ g: GolpeDef; d: number } | null>((a, x) => { const d = cruzeiro(x.g); return !a || d > a.d ? { g: x.g, d } : a; }, null);
  const A = ameacaDe(b, ele, eu, q.lado, fino);
  const catDele = CATEGORIA(estimados(ele.c)), catMinha = melhor?.g.cat ?? 'fisico';
  const base: Duelo = {
    eu: eu.vida, euMax: eu.vidaMax, ele: ele.vida, eleMax: ele.vidaMax, D: melhor?.d ?? 0, A, primeiro: eu.vel > ele.vel,
    chipEle: (ele.status === 'envenenado' ? ele.vidaMax / 8 : ele.status === 'queimado' ? ele.vidaMax / 16 : 0) + (volQ.semente ? ele.vidaMax / 8 : 0),
    chipEu: (eu.status === 'envenenado' ? eu.vidaMax / 8 : eu.status === 'queimado' ? eu.vidaMax / 16 : 0) + (v.semente ? eu.vidaMax / 8 : 0),
    eleParado: ele.status === 'dormindo' ? 1 : ele.status === 'congelado' ? 2 : volQ.recarga ? 1 : 0, euParado: 0,
  };
  const razao = (est: number, n: number) => multEstagio(Math.max(-6, Math.min(6, est + n))) / multEstagio(est);
  /** efeito de status principal sobre o adversário */
  const comStatus = (s: StatusId) => (d: Duelo) => {
    if (s === 'dormindo') d.eleParado += 2;
    else if (s === 'congelado') d.eleParado += 3;
    else if (s === 'paralisado') { if (ele.vel / 4 < eu.vel) d.primeiro = true; d.A *= 0.75; }
    else if (s === 'queimado') { d.chipEle += ele.vidaMax / 16; if (catDele === 'fisico') d.A *= 0.5; }
    else if (s === 'envenenado') d.chipEle += ele.vidaMax / 8;
    else if (s === 'encantado') d.A *= 0.7;
  };
  const podeStatus = (s: StatusId) => !ele.status && !ele.tipos.some((t) => IMUNES[s].includes(t)) && outro.barreira.status <= 0 && !(s === 'congelado' && b.clima === 'sol');
  const notas: NotaDuelo[] = golpes.map(({ slot, g }) => {
    const acerto = chanceAcerto(b, p, g, q);
    /** modificações que o golpe deixa no duelo quando acerta, cada uma com a sua chance */
    const efeitos: { ch: number; f: (d: Duelo) => void }[] = [];
    let bonus = 0; // valor tático que a corrida não enxerga (campo, equipe)
    for (const e of g.efeitos) {
      const ch = ('chance' in e && e.chance !== undefined ? e.chance : 100) / 100;
      switch (e.t) {
        case 'status': if (podeStatus(e.s)) efeitos.push({ ch, f: comStatus(e.s) }); break;
        case 'volatil':
          if (e.eu) efeitos.push({ ch: 1, f: (d) => { d.D *= 0.8; } });
          else if (e.v === 'confuso' && volQ.confuso <= 0 && outro.barreira.status <= 0) efeitos.push({ ch, f: (d) => { d.A *= 0.7; d.chipEle += ele.vidaMax * 0.04; } });
          else if (e.v === 'semente' && !volQ.semente && !ele.tipos.includes('mata')) efeitos.push({ ch, f: (d) => { d.chipEle += ele.vidaMax / 8; d.chipEu -= ele.vidaMax / 8; } });
          else if (e.v === 'atordoado' && eu.vel > ele.vel) efeitos.push({ ch, f: (d) => { d.eleParado = Math.max(d.eleParado, 1); } });
          break;
        case 'estagio': {
          const quem = e.eu ? v : volQ, r = razao(quem.est[e.s], e.n);
          if (r === 1) break;
          if (e.eu) {
            if ((e.s === 'atq' && catMinha === 'fisico') || (e.s === 'atqEsp' && catMinha === 'especial')) efeitos.push({ ch, f: (d) => { d.D *= r; } });
            else if ((e.s === 'def' && catDele === 'fisico') || (e.s === 'defEsp' && catDele === 'especial')) efeitos.push({ ch, f: (d) => { d.A /= r; } });
            else if (e.s === 'vel') efeitos.push({ ch, f: (d) => { d.primeiro = eu.vel * r > ele.vel; } });
            else if (e.s === 'eva') efeitos.push({ ch, f: (d) => { d.A *= e.n > 0 ? 0.75 : 1.2; } });
            else if (e.s === 'prec') efeitos.push({ ch, f: (d) => { d.D *= e.n > 0 ? 1.1 : 0.8; } });
          } else {
            if ((e.s === 'def' && catMinha === 'fisico') || (e.s === 'defEsp' && catMinha === 'especial')) efeitos.push({ ch, f: (d) => { d.D /= r; } });
            else if ((e.s === 'atq' && catDele === 'fisico') || (e.s === 'atqEsp' && catDele === 'especial')) efeitos.push({ ch, f: (d) => { d.A *= r; } });
            else if (e.s === 'vel') efeitos.push({ ch, f: (d) => { d.primeiro = eu.vel > ele.vel * r; } });
            else if (e.s === 'prec') efeitos.push({ ch, f: (d) => { d.A *= e.n < 0 ? 0.75 : 1; } });
            else if (e.s === 'eva') efeitos.push({ ch, f: (d) => { d.D *= e.n < 0 ? 1.15 : 0.8; } });
          }
          break;
        }
        case 'cura': if (g.cat === 'status') efeitos.push({ ch: 1, f: (d) => { d.eu = Math.min(d.euMax, d.eu + (d.euMax * e.pct) / 100); } }); break;
        case 'descanso': efeitos.push({ ch: 1, f: (d) => { d.eu = d.euMax; d.euParado += 2; d.chipEu = 0; } }); break;
        case 'curaStatus': if (eu.status) efeitos.push({ ch: 1, f: (d) => { d.chipEu = 0; if (eu.status === 'paralisado') d.primeiro = eu.vel * 4 > ele.vel; if (eu.status === 'queimado' && catMinha === 'fisico') d.D *= 2; } }); bonus += e.equipe ? 0.08 * lado.equipe.filter((m) => m.vida > 0 && m.status && m !== c).length : 0; break;
        case 'barreira':
          if (lado.barreira[e.b] <= 0) { if (e.b === 'status') bonus += 0.04; else if (e.b === catDele) { efeitos.push({ ch: 1, f: (d) => { d.A *= 0.5; } }); bonus += 0.05 * Math.min(2, b.reservas(p.lado).length); } }
          break;
        case 'espinhos': if (!outro.espinhos) bonus += Math.min(0.3, 0.1 * b.reservas(q.lado).length); break;
        case 'armadilha': if (volQ.preso <= 0) efeitos.push({ ch: 1, f: (d) => { d.chipEle += ele.vidaMax / 16; } }); break;
        case 'foco': if (v.foco < 1) efeitos.push({ ch: 1, f: (d) => { d.D *= 1.08; } }); break;
        case 'protecao': if (v.protUsos === 0 && (volQ.carga || base.chipEle > 0)) bonus += 0.15; break;
        case 'limpaEstagios': {
          const deles = Object.values(volQ.est).reduce((x, y) => x + y, 0), meusEst = Object.values(v.est).reduce((x, y) => x + y, 0);
          if (deles - meusEst >= 2) bonus += 0.3; break;
        }
        case 'trocaForcada': {
          const soma = volQ.est.atq + volQ.est.atqEsp + volQ.est.def + volQ.est.defEsp + volQ.est.vel;
          if (!b.selvagem && b.reservas(q.lado).length) bonus += soma >= 2 ? 0.3 : outro.espinhos ? 0.1 : 0; break;
        }
        case 'clima': {
          if (b.clima === e.c) break;
          const bom: TipoId | null = e.c === 'sol' ? 'brasa' : e.c === 'chuva' ? 'rio' : null, ruim: TipoId | null = e.c === 'sol' ? 'rio' : e.c === 'chuva' ? 'brasa' : null;
          if (bom && melhor && melhor.g.tipo === bom) efeitos.push({ ch: 1, f: (d) => { d.D *= 1.5; } });
          if (ruim && ele.tipos.includes(ruim)) efeitos.push({ ch: 1, f: (d) => { d.A *= 0.75; } });
          if (bom) bonus += Math.min(0.12, 0.04 * lado.equipe.filter((m) => m.vida > 0 && m !== c && m.golpes.some((x) => { const y = defGolpe(x.id); return y.tipo === bom && y.cat !== 'status'; })).length);
          if (e.c === 'garoa' || e.c === 'poeira') {
            const imune = (t: TipoId[]) => (e.c === 'garoa' ? t.includes('geada') : t.some((x) => x === 'terra' || x === 'pedra' || x === 'ferro'));
            efeitos.push({ ch: 1, f: (d) => { if (!imune(ele.tipos)) d.chipEle += ele.vidaMax / 16; if (!imune(eu.tipos)) d.chipEu += eu.vidaMax / 16; } });
          }
          if (e.c === 'nevoa' && eu.tipos.some((t) => t === 'assombro' || t === 'mente') && !ele.tipos.some((t) => t === 'assombro' || t === 'mente')) efeitos.push({ ch: 1, f: (d) => { d.A *= 0.8; } });
          break;
        }
      }
    }
    // conselho: reforço que fica em campo vale também contra as próximas adversárias (varrida), se dá tempo de usá-lo
    if (fino && AJ.varrida && g.cat === 'status' && A * 3 < eu.vida) {
      const restam = b.reservas(q.lado).length;
      for (const e of g.efeitos) if (e.t === 'estagio' && e.eu && e.n > 0 && v.est[e.s] < 2 && ((e.s === 'atq' && catMinha === 'fisico') || (e.s === 'atqEsp' && catMinha === 'especial') || e.s === 'vel')) bonus += Math.min(0.3, AJ.varrida * e.n * restam);
    }
    const todos = (d: Duelo) => { for (const x of efeitos) x.f(d); };
    const chEfeito = efeitos.length ? Math.max(...efeitos.map((x) => x.ch)) : 0;
    let nota: number, nocauteia = false;
    if (g.cat === 'status') {
      const pega = g.alvo === 'proprio' || g.alvo === 'campo' ? 1 : acerto * chEfeito;
      nota = efeitos.length ? pega * aposEfeito(base, todos) + (1 - pega) * aposEfeito(base, () => {}) : aposEfeito(base, () => {});
    } else {
      const d = danoDe(g), carga = g.efeitos.some((e) => e.t === 'carga' && e.semCargaNoClima !== b.clima), recarga = g.efeitos.some((e) => e.t === 'recarga');
      nocauteia = d >= ele.vida && !carga;
      const rec = g.efeitos.find((e) => e.t === 'recuo'), dre = g.efeitos.find((e) => e.t === 'dreno');
      const golpear = (comEf: boolean): number => {
        const x: Duelo = { ...base, d1: carga ? 0 : d };
        if (rec && rec.t === 'recuo') x.eu -= (Math.min(d, ele.vida) * rec.pct) / 100;
        if (dre && dre.t === 'dreno') x.eu = Math.min(x.euMax, x.eu + (Math.min(d, ele.vida) * dre.pct) / 100);
        if (recarga && d < ele.vida) x.euParado = 1.5; // descansa no turno seguinte
        if (comEf) todos(x);
        if (carga) { const y = { ...x, d1: 0 }; const some = g.efeitos.some((e) => e.t === 'carga' && e.some); if (some) y.eleParado = Math.max(y.eleParado, 1); y.D = Math.max(y.D, d * 0.5); return corrida(y); }
        return corrida(x);
      };
      const acertou = efeitos.length ? chEfeito * golpear(true) + (1 - chEfeito) * golpear(false) : golpear(false);
      nota = d <= 0 ? aposEfeito(base, () => {}) - 0.05 : acerto * acertou + (1 - acerto) * aposEfeito(base, () => {});
      if (g.efeitos.some((e) => e.t === 'bateVolta') && b.reservas(p.lado).length && base.A >= eu.vida * 0.6) bonus += 0.08;
    }
    return { slot, g, nota: nota + bonus, nocauteia, acerto };
  });
  return { notas, base, eu, ele };
}
/** nota de uma criatura da reserva contra o adversário em campo; `apanhaAoEntrar`: troca voluntária (leva um golpe na entrada) */
function notaReserva(b: Batalha, lado: 0 | 1, indice: number, q: Pos, apanhaAoEntrar: boolean, fino: boolean): number {
  const meu = b.lados[lado].equipe[indice], eu = lutadorReserva(meu, true), ele = lutador(b, q, false);
  const D = Math.max(0, ...meu.golpes.filter((x) => x.pg > 0).map((x) => defGolpe(x.id)).filter((g) => g.cat !== 'status').map((g) => danoEsperado(b, eu, g, ele) * (g.precisao === 0 ? 1 : g.precisao / 100) * (g.efeitos.some((e) => e.t === 'recarga' || e.t === 'carga') ? 0.5 : 1)));
  const A = ameacaDe(b, ele, eu, q.lado, fino);
  const espinhos = b.lados[lado].espinhos && !eu.tipos.includes('vento') ? eu.vidaMax / 8 : 0;
  const d: Duelo = { eu: eu.vida - espinhos - (apanhaAoEntrar ? A : 0), euMax: eu.vidaMax, ele: ele.vida, eleMax: ele.vidaMax, D, A, primeiro: eu.vel > ele.vel, chipEle: 0, chipEu: 0, eleParado: 0, euParado: 0 };
  if (d.eu <= 0) return -1;
  return corrida(d);
}
/** decisão de líder e conselho no 1×1 */
function decidirDuelo(b: Batalha, p: Pos, q: Pos, nivel: NivelIA, o: OpcoesIA): Acao {
  const fino = nivel === 'conselho', mem = memoria(b), c = b.criatura(p)!;
  const { notas, base, eu, ele } = notasDeDuelo(b, p, q, nivel);
  const reservaPadrao = b.reservas(p.lado)[0];
  const comoAcao = (n: NotaDuelo): Acao => ({ tipo: 'golpe', slot: n.slot, ...(n.g.efeitos.some((e) => e.t === 'bateVolta') && reservaPadrao !== undefined ? { trocaPara: melhorReservaDuelo(b, p, q, nivel)?.para ?? reservaPadrao } : {}) });
  if (!AJ.status) for (const n of notas) if (n.g.cat === 'status') n.nota = -9;
  let melhor = notas.reduce((a, n) => (n.nota > a.nota ? n : a));
  // nocaute à mão: o mais certeiro; mais lento e em risco, o de prioridade
  const kos = notas.filter((n) => n.nocauteia);
  if (kos.length) {
    const emRisco = !base.primeiro && base.A >= eu.vida && base.eleParado < 1;
    const seguro = (n: NotaDuelo) => n.acerto + ((n.g.prioridade ?? 0) > 0 && emRisco ? 0.6 : 0) - (n.g.efeitos.some((e) => e.t === 'recarga' || e.t === 'recuo') ? 0.03 : 0);
    melhor = kos.reduce((a, n) => (seguro(n) > seguro(a) ? n : a));
    if (!emRisco || (melhor.g.prioridade ?? 0) > 0 || !b.podeTrocar(p)) return comoAcao(melhor);
  } else if (!fino && notas.length > 1 && rng.chance(AJ.deslizeLider)) {
    // o líder joga bem, mas não é perfeito: de vez em quando escolhe outro golpe
    melhor = rng.escolha(notas.filter((n) => n !== melhor));
  } else if (fino) {
    // entre opções quase iguais, o conselho fica com a mais precisa
    const perto = notas.filter((n) => n.nota >= melhor.nota - 0.03);
    melhor = perto.reduce((a, n) => (n.acerto > a.acerto ? n : a), melhor);
  }
  // remédio: abaixo de ~1/3 da vida e só se alongar a corrida vale mais do que bater
  if (o.usaItens && eu.vida / eu.vidaMax < 0.34 && !melhor.nocauteia) {
    const lado = b.lados[p.lado], indice = lado.ativos[p.pos], max = atributos(c).vida;
    const curas = Object.keys(lado.itens).filter((id) => lado.itens[id] > 0 && temItemDef(id) && defItem(id).uso?.cura && b.itemServe(p.lado, id, indice))
      .map((id) => { const u = defItem(id).uso!.cura!; return { id, v: u === 'total' ? max - c.vida : Math.min(u, max - c.vida) }; }).sort((x, y) => y.v - x.v);
    if (curas.length) {
      const fator = eu.vidaMax / max, nota = aposEfeito(base, (d) => { d.eu = Math.min(d.euMax, d.eu + curas[0].v * fator); });
      if (!fino || nota > melhor.nota + 0.02 || base.A < curas[0].v * fator * 0.8) return { tipo: 'item', item: curas[0].id, alvo: indice };
    }
  }
  if (o.usaItens && (c.status === 'dormindo' || c.status === 'congelado')) { const it = itemUtil(b, p); if (it) return it; }
  // troca: só depois de a criatura ter agido ao menos um turno em campo (quem abre a luta luta) e com folga entre trocas
  if (AJ.troca && b.podeTrocar(p) && b.vol(p).turnos >= 1 && b.turno - mem.ultimaTroca[p.lado] >= 3) {
    const t = melhorReservaDuelo(b, p, q, nivel);
    const margem = fino ? AJ.margemC : AJ.margemL;
    if (t && melhor.nota < 0.5 && t.nota - melhor.nota > margem && t.nota > 0) { mem.ultimaTroca[p.lado] = b.turno; return { tipo: 'troca', para: t.para }; }
  }
  return comoAcao(melhor);
}
function melhorReservaDuelo(b: Batalha, p: Pos, q: Pos, nivel: NivelIA): { para: number; nota: number } | null {
  const res = b.reservas(p.lado), as = AJ.as && nivel === 'conselho' ? indiceDoAs(b.lados[p.lado].equipe) : -1;
  let r: { para: number; nota: number } | null = null;
  let notaAs = -9;
  for (const i of res) { const n = notaReserva(b, p.lado, i, q, true, nivel === 'conselho'); if (i === as && res.length > 1) { notaAs = n; continue; } if (!r || n > r.nota) r = { para: i, nota: n }; }
  // o ás fica guardado para o fim; só sai antes se for, de longe, a melhor resposta
  if (r && notaAs - r.nota > AJ.folgaAs + 0.4) r = { para: as, nota: notaAs };
  return r;
}

/**
 * Escolhe a ação da posição `p` no nível dado. Não recebe (nem consulta) a ação do outro lado.
 */
export function escolherAcaoIA(b: Batalha, p: Pos, nivel: NivelIA, o: OpcoesIA = {}): Acao {
  if (o.foge && b.turno >= 1 && p.lado === 1 && b.selvagem) return { tipo: 'fuga' };
  const ok = b.golpesValidos(p);
  if (!ok.length) return { tipo: 'golpe', slot: -1 };
  const c = b.criatura(p)!, adv = b.adversarios(p);
  if (!adv.length) return golpeAleatorio(b, p);
  const reservaPadrao = b.reservas(p.lado)[0];
  const notas = ok.map((slot) => ({ slot, g: defGolpe(c.golpes[slot].id), ...avaliar(b, p, defGolpe(c.golpes[slot].id), nivel) }));
  const comoAcao = (n: (typeof notas)[number]): Acao => ({ tipo: 'golpe', slot: n.slot, ...(n.alvo && adv.length > 1 ? { alvo: n.alvo } : {}), ...(n.g.efeitos.some((e) => e.t === 'bateVolta') && reservaPadrao !== undefined ? { trocaPara: melhorTroca(b, p, nivel)?.para ?? reservaPadrao } : {}) });
  const riscoAgora = Math.max(0, ...adv.map((q) => ameaca(b, q, lutador(b, p, true), p.lado))) / Math.max(1, c.vida);
  if (nivel === 'lider' || nivel === 'conselho') {
    // um turno sem causar dano custa caro: preparação só vale se nenhum golpe já resolve bem
    const maiorDano = Math.max(0, ...notas.filter((n) => n.g.cat !== 'status').map((n) => n.valor));
    for (const n of notas) if (n.g.cat === 'status') n.valor *= maiorDano >= 1 ? 0.15 : maiorDano >= 0.34 || riscoAgora >= 0.5 ? 0.45 : 1;
  }
  const melhorPor = (f: (n: (typeof notas)[number]) => number) => notas.reduce((a, n) => (f(n) > f(a) ? n : a));

  /* novato: 70% ao acaso, 30% o mais forte */
  if (nivel === 'novato') return rng.chance(0.7) ? golpeAleatorio(b, p) : comoAcao(melhorPor((n) => n.valor));

  const mem = memoria(b);
  const eu = lutador(b, p, true);
  const risco = Math.max(0, ...adv.map((q) => ameaca(b, q, eu, p.lado))) / eu.vida;
  const melhor = melhorPor((n) => n.valor);
  // quem acabou de entrar luta pelo menos um turno antes de ser trocada (a criatura que abre a batalha é sempre a 1ª da lista e fica)
  const podeTrocarAgora = b.turno - mem.ultimaTroca[p.lado] >= 3 && b.vol(p).turnos >= 1;
  const troca = podeTrocarAgora ? melhorTroca(b, p, nivel) : null;

  /* treinador: prefere o golpe forte e super-eficaz (poder × eficácia × mesmo-tipo, sem fazer conta de atributos); troca em desvantagem grave */
  if (nivel === 'treinador') {
    if (troca && risco >= 0.5 && melhor.valor < 0.25 && troca.ganho > 0.4 && rng.chance(0.7)) { mem.ultimaTroca[p.lado] = b.turno; return { tipo: 'troca', para: troca.para }; }
    // de vez em quando se distrai e solta qualquer golpe (inclusive de status)
    if (rng.chance(AJ.distracaoTreinador)) return golpeAleatorio(b, p);
    const meusTipos = tiposDe(c);
    const simples = notas.map((n) => {
      if (n.g.cat === 'status') return { n, v: 0, alvo: n.alvo };
      const fixo = n.g.efeitos.some((e) => e.t === 'fixo'), lento = n.g.efeitos.some((e) => e.t === 'recarga' || (e.t === 'carga' && e.semCargaNoClima !== b.clima));
      const base = (fixo ? 60 : n.g.poder * media(n.g)) * (n.g.id !== DESESPERO.id && meusTipos.includes(n.g.tipo) ? 1.5 : 1) * (lento ? 0.6 : 1) * (n.g.precisao === 0 ? 1 : n.g.precisao / 100);
      let v = 0, alvo = n.alvo;
      for (const q of adv) { const x = base * (fixo ? (eficaciaGolpe(n.g, b.tipos(q)) === 0 ? 0 : 1) : eficaciaGolpe(n.g, b.tipos(q))) * (b.vol(q).some ? 0 : 1); if (x > v) { v = x; alvo = q; } }
      return { n, v, alvo };
    });
    const top = simples.reduce((a, x) => (x.v > a.v ? x : a));
    return top.v > 0 ? comoAcao({ ...top.n, alvo: top.alvo }) : golpeAleatorio(b, p);
  }

  /* líder e conselho */
  if (b.porLado === 1 && adv.length === 1) return decidirDuelo(b, p, adv[0], nivel, o);
  if (o.usaItens) { const it = itemUtil(b, p); if (it && !melhor.nocauteia) return it; }
  const maisRapido = adv.every((q) => eu.vel > lutador(b, q, false).vel);
  if (nivel === 'conselho') {
    // posso nocautear: escolho o nocaute mais seguro; se sou mais lento e corro risco, prefiro um com prioridade
    const kos = notas.filter((n) => n.nocauteia && n.alvo);
    if (kos.length) {
      const seguro = (n: (typeof notas)[number]) => chanceAcerto(b, p, n.g, n.alvo!) + ((n.g.prioridade ?? 0) > 0 && !maisRapido ? 0.5 : 0) - (n.g.efeitos.some((e) => e.t === 'recarga' || e.t === 'recuo' || e.t === 'carga') ? 0.05 : 0);
      if (maisRapido || risco < 1 || kos.some((n) => (n.g.prioridade ?? 0) > 0)) return comoAcao(kos.reduce((a, n) => (seguro(n) > seguro(a) ? n : a)));
    }
    // o adversário está em desvantagem grave e tem reservas: provavelmente troca → valorizo preparação e golpes de cobertura
    const outroLado = (1 - p.lado) as 0 | 1;
    const provavelTroca = adv.length === 1 && !b.selvagem && b.reservas(outroLado).length > 0 && melhor.valor >= 0.6 && risco < 0.3 && b.vol(adv[0]).preso <= 0;
    if (provavelTroca) {
      const vistos = [...b.lados[outroLado].vistos].filter((i) => b.reservas(outroLado).includes(i)).map((i) => lutadorReserva(b.lados[outroLado].equipe[i], false));
      for (const n of notas) {
        if (n.g.cat === 'status' && n.g.efeitos.some((e) => e.t === 'espinhos' || (e.t === 'estagio' && e.eu && e.n > 0) || e.t === 'barreira')) n.valor += 0.25;
        else if (n.g.cat !== 'status' && vistos.length) { const cobertura = Math.min(...vistos.map((r) => Math.min(1, danoEsperado(b, eu, n.g, r) / r.vida))); n.valor = 0.6 * n.valor + 0.4 * cobertura; }
      }
    }
    // entre opções parecidas, a mais precisa
    const topo = melhorPor((n) => n.valor), candidatos = notas.filter((n) => n.valor >= topo.valor * 0.9);
    const final = candidatos.reduce((a, n) => ((n.g.precisao || 101) > (a.g.precisao || 101) ? n : a), topo);
    if (troca && final.valor < 0.15 && risco >= 0.4 && troca.ganho > 0.6) { mem.ultimaTroca[p.lado] = b.turno; return { tipo: 'troca', para: troca.para }; }
    return final.valor > 0 ? comoAcao(final) : golpeAleatorio(b, p);
  }
  // líder: troca para manter a vantagem quando o confronto é ruim e não há boa jogada
  if (troca && risco >= 0.5 && melhor.valor < 0.25 && troca.ganho > 0.5) { mem.ultimaTroca[p.lado] = b.turno; return { tipo: 'troca', para: troca.para }; }
  return melhor.valor > 0 ? comoAcao(melhor) : golpeAleatorio(b, p);
}

/** Quem entra no lugar de uma criatura desmaiada. `excluir`: índices já escolhidos para outra vaga neste mesmo momento. */
export function escolherSubstitutoIA(b: Batalha, lado: 0 | 1, nivel: NivelIA, excluir: number[] = []): number {
  const res = b.reservas(lado).filter((i) => !excluir.includes(i));
  if (!res.length) return b.reservas(lado)[0] ?? -1;
  if (nivel === 'novato') return res[0];
  const adv = b.ativosDe((1 - lado) as 0 | 1);
  const as = AJ.as && nivel === 'conselho' ? indiceDoAs(b.lados[lado].equipe) : -1;
  const candidatos = res.length > 1 ? res.filter((i) => i !== as) : res;
  if (!adv.length) return candidatos[0];
  const duelo = (nivel === 'lider' || nivel === 'conselho') && b.porLado === 1 && adv.length === 1;
  const nota = (i: number) => (duelo ? notaReserva(b, lado, i, adv[0], false, nivel === 'conselho') : Math.min(...adv.map((q) => confronto(b, b.lados[lado].equipe[i], q))));
  const escolhido = candidatos.reduce((a, i) => (nota(i) > nota(a) ? i : a));
  // o ás do conselho fica para o fim, a não ser que as outras opções sejam claramente piores
  if (duelo && as >= 0 && res.includes(as) && !candidatos.includes(as) && nota(as) - nota(escolhido) > AJ.folgaAs) return as;
  return escolhido;
}

/**
 * Resolve a batalha inteira com IA nos dois lados (testes e modo headless). Lança erro se passar de `maxTurnos`.
 */
export function resolverComIA(b: Batalha, niveis: [NivelIA, NivelIA], o: { maxTurnos?: number; opcoes?: [OpcoesIA, OpcoesIA] } = {}): void {
  const max = o.maxTurnos ?? 1000, op = o.opcoes ?? [{}, {}];
  if (b.fase === 'inicio') b.iniciar();
  while (b.fase !== 'fim') {
    if (b.turno > max) throw new Error(`batalha não terminou em ${max} turnos`);
    if (b.fase === 'acoes') b.executarTurno(b.pedidos().map((p) => ({ lado: p.lado, pos: p.pos, acao: escolherAcaoIA(b, p, niveis[p.lado], op[p.lado]) })));
    else if (b.fase === 'substituir') {
      const usados: [number[], number[]] = [[], []];
      b.substituir(b.pedidos().map((p) => { const para = escolherSubstitutoIA(b, p.lado, niveis[p.lado], usados[p.lado]); usados[p.lado].push(para); return { lado: p.lado, pos: p.pos, para }; }));
    } else if (b.fase === 'oferta') b.responderOferta(null);
  }
}
