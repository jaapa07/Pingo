/**
 * IA DE BATALHA — 4 níveis (novato, treinador, líder, conselho) + ajuste por dificuldade.
 *
 * Sem trapaça: a IA decide ANTES de conhecer a ação do jogador (ela nem é passada para cá) e só usa informação pública:
 *  - da própria equipe: tudo;
 *  - do adversário: espécie, nível, fração da barra de vida, status, estágios e condições visíveis, golpes que ele JÁ usou
 *    nesta batalha, quantas reservas restam e quais criaturas já apareceram. Atributos do adversário são ESTIMADOS a partir
 *    da espécie e do nível (genes médios, sem esforço, sem personalidade) — nunca lidos da instância.
 * O acaso da IA também passa pelo `rng`. A dificuldade muda apenas o nível da IA e o uso de itens; nunca vida ou dano.
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
/** treinadores usam itens de cura a partir do nível líder; no veterano, todos usam */
export const iaUsaItens = (nivelBase: NivelIA, dificuldade: Opcoes['dificuldade']) => dificuldade === 'veterano' || NIVEIS_IA.indexOf(nivelEfetivo(nivelBase, dificuldade)) >= 2;

export interface OpcoesIA {
  /** pode usar os itens do próprio lado */
  usaItens?: boolean;
  /** criatura errante: tenta fugir no primeiro turno */
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
 * Escolhe a ação da posição `p` no nível dado. Não recebe (nem consulta) a ação do outro lado.
 */
export function escolherAcaoIA(b: Batalha, p: Pos, nivel: NivelIA, o: OpcoesIA = {}): Acao {
  if (o.foge && b.turno === 0 && p.lado === 1 && b.selvagem) return { tipo: 'fuga' };
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
  const podeTrocarAgora = b.turno - mem.ultimaTroca[p.lado] >= 3;
  const troca = podeTrocarAgora ? melhorTroca(b, p, nivel) : null;

  /* treinador: maior dano esperado; troca em desvantagem grave */
  if (nivel === 'treinador') {
    if (troca && risco >= 0.5 && melhor.valor < 0.25 && troca.ganho > 0.4 && rng.chance(0.7)) { mem.ultimaTroca[p.lado] = b.turno; return { tipo: 'troca', para: troca.para }; }
    return melhor.valor > 0 ? comoAcao(melhor) : golpeAleatorio(b, p);
  }

  /* líder e conselho */
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
  const as = nivel === 'conselho' ? indiceDoAs(b.lados[lado].equipe) : -1;
  const candidatos = res.length > 1 ? res.filter((i) => i !== as) : res;
  if (!adv.length) return candidatos[0];
  const nota = (i: number) => Math.min(...adv.map((q) => confronto(b, b.lados[lado].equipe[i], q)));
  return candidatos.reduce((a, i) => (nota(i) > nota(a) ? i : a));
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
