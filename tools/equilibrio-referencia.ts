/**
 * EQUILÍBRIO — base do simulador (tools/sim-equilibrio.ts) e dos testes de monotonia (tools/test-batalha.ts).
 *
 *  - carrega zonas e treinadores direto dos arquivos de dados (sem Vite);
 *  - monta a EQUIPE DE REFERÊNCIA do jogador em cada passo do mapa A, derivada das tabelas de habitat das zonas
 *    (inicial + 3 a 5 capturas das rotas já abertas, ás 2 a 4 níveis abaixo do ás do próximo líder, golpes por nível,
 *    alguns remédios comprados);
 *  - três pilotos para o lado do jogador: "bobo" (sempre o golpe de maior poder), "esperto" (melhor golpe por
 *    eficácia/mesmo-tipo, troca em desvantagem clara, remédio abaixo de 1/3 da vida) e a própria IA do jogo;
 *  - `lutar`: uma batalha headless no motor puro. Todo acaso passa pelo `rng` (sementes fixas em quem chama).
 */
import { readdirSync } from 'node:fs';
import type { CriaturaInst, EspecieDef, MembroEquipe, Stat, TipoId, TreinadorDef, ZonaDef, Encontro } from '../src/core/tipos';
import { rng } from '../src/core/rng';
import { ESPECIES, VISITANTES } from '../src/data/criaturas';
import { golpe as defGolpe, temGolpe, type GolpeDef } from '../src/data/golpes';
import { item as defItem, temItemDef } from '../src/data/itens';
import { eficaciaContra } from '../src/data/tabela-tipos';
import { Batalha, danoBase, multEstagio, type Acao, type AcaoDe, type Pos } from '../src/battle/engine';
import { escolherAcaoIA, escolherSubstitutoIA, type NivelIA } from '../src/battle/ia';
import { atributos, atributosDe, criarCriatura, criarDeMembro, especie, novoSlot, registrarEspecies } from '../src/battle/criatura';

registrarEspecies(ESPECIES); registrarEspecies(VISITANTES);

/* ============================== dados ============================== */
export interface Dados { zonas: ZonaDef[]; treinadores: Map<string, TreinadorDef>; zonaDoTreinador: Map<string, ZonaDef> }
let _dados: Dados | undefined;
/** lê src/data/zonas/*.ts e src/data/treinadores/*.ts. Um arquivo que não carrega é avisado e pulado. */
export async function carregarDados(): Promise<Dados> {
  if (_dados) return _dados;
  const zonas: ZonaDef[] = [], treinadores = new Map<string, TreinadorDef>(), zonaDoTreinador = new Map<string, ZonaDef>();
  const ler = async (pasta: string, cada: (v: unknown) => void) => {
    const dir = new URL(`../src/data/${pasta}/`, import.meta.url);
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts') && !x.startsWith('_')).sort()) {
      try { const m = (await import(new URL(f, dir).href)) as Record<string, unknown>; for (const v of Object.values(m)) cada(v); }
      catch (e) { console.error(`[equilibrio] ${pasta}/${f} não carregou: ${(e as Error).message.split('\n')[0]}`); }
    }
  };
  await ler('zonas', (v) => { const z = v as ZonaDef; if (z && typeof z === 'object' && Array.isArray(z.mapaChars)) zonas.push(z); });
  await ler('treinadores', (v) => { if (Array.isArray(v)) for (const t of v as TreinadorDef[]) if (t && typeof t.id === 'string' && Array.isArray(t.equipe)) treinadores.set(t.id, t); });
  for (const z of zonas) for (const n of z.npcs ?? []) if (n.treinador) zonaDoTreinador.set(n.treinador, z);
  return (_dados = { zonas, treinadores, zonaDoTreinador });
}

/* ============================== espécies ============================== */
const somaBase = (e: EspecieDef) => Object.values(e.base).reduce((a, x) => a + x, 0);
const anterior = new Map<number, number>();
for (const e of ESPECIES) for (const ev of e.evolui ?? []) if (!anterior.has(ev.para)) anterior.set(ev.para, e.num);
/** primeira forma da linha evolutiva */
export function raiz(num: number): number { let n = num; while (anterior.has(n)) n = anterior.get(n)!; return n; }
/** forma que a linha de `num` tem no nível dado, contando só evoluções por nível (pedra e amizade ficam de fora) */
export function formaNoNivel(num: number, nivel: number): number {
  let n = raiz(num);
  for (;;) { const ev = especie(n).evolui?.find((x) => x.nivel !== undefined && !x.item && nivel >= x.nivel); if (!ev) return n; n = ev.para; }
}
const valorGolpe = (id: string) => { const g = defGolpe(id); return g.cat === 'status' ? 0 : (g.poder * (g.precisao || 100)) / 100 * (g.efeitos.some((e) => e.t === 'carga' || e.t === 'recarga') ? 0.6 : 1); };
/**
 * Os 4 golpes de um jogador comum: os três melhores golpes de dano que a espécie já aprendeu (poder × precisão, com
 * preferência por um do próprio tipo e por tipos variados) e, se houver, o golpe de status mais recente.
 */
export function golpesDeJogador(num: number, nivel: number): string[] {
  const e = especie(num), ids: string[] = [];
  for (const [n, id] of e.golpes) if (n <= nivel && temGolpe(id) && !ids.includes(id)) ids.push(id);
  const dano = ids.filter((id) => defGolpe(id).cat !== 'status'), status = ids.filter((id) => defGolpe(id).cat === 'status');
  const r: string[] = [];
  const nota = (id: string) => valorGolpe(id) * (e.tipos.includes(defGolpe(id).tipo) ? 1.5 : 1) * (r.some((x) => defGolpe(x).tipo === defGolpe(id).tipo) ? 0.6 : 1);
  const vagasDano = status.length ? 3 : 4;
  while (r.length < vagasDano) { const livres = dano.filter((id) => !r.includes(id)); if (!livres.length) break; r.push(livres.reduce((a, id) => (nota(id) > nota(a) ? id : a))); }
  for (const id of status.slice().reverse()) { if (r.length >= 4) break; r.push(id); }
  return r.length ? r : ['encontrao'];
}

/* ============================== curva e equipe de referência ============================== */
export const INICIAIS = [1, 4, 7] as const;
export const NOME_INICIAL: Record<number, string> = { 1: 'Mata', 4: 'Brasa', 7: 'Rio' };
/** passo 9 = Liga */
export const PASSO_LIGA = 9;
export const IDS_LIGA = ['liga-1', 'liga-2', 'liga-3', 'liga-4', 'liga-5'];
export function lider(d: Dados, passo: number): TreinadorDef | undefined { return [...d.treinadores.values()].find((t) => t.insignia === passo); }
export const asDe = (t: TreinadorDef) => Math.max(...t.equipe.map((m) => m.nv));
/** ás do "chefe" do passo: líder 1–8, ou o Campeão da Liga no passo 9 */
export function asDoChefe(d: Dados, passo: number): number {
  const t = passo >= PASSO_LIGA ? d.treinadores.get('liga-5') : lider(d, passo);
  if (!t) throw new Error('sem líder para o passo ' + passo);
  return asDe(t);
}
/** nível do ás do jogador de referência (faixa do spec: 2 a 4 abaixo do ás do líder): 2 abaixo nos passos 1–3, em que um nível pesa muito mais, 3 abaixo do 4 ao 8 e 4 abaixo do ás do Campeão na Liga */
export function asDoJogador(d: Dados, passo: number): number { return asDoChefe(d, passo) - (passo >= PASSO_LIGA ? 4 : passo <= 3 ? 2 : 3); }

interface Candidato { linha: number; nvMin: number; peso: number; passo: number }
/** linhas evolutivas capturáveis em cada passo, pelas tabelas de habitat (grama, caverna e árvore; sem camadas pós-insígnia) */
function candidatos(d: Dados): Candidato[] {
  const mapa = new Map<number, Candidato>();
  const PESO_METODO: Record<string, number> = { grama: 1, caverna: 1, arvore: 0.4 };
  for (const z of d.zonas) {
    if (z.mapa !== 'A' || !z.passo || z.passo > 8) continue;
    for (const h of z.habitats ?? []) {
      const pm = PESO_METODO[h.metodo]; if (!pm) continue;
      const tabelas: [Encontro[] | undefined, number][] = [[h.todos, 1], [h.dia, 1], [h.manha, 0.6], [h.noite, 0.5]];
      for (const [tab, pt] of tabelas) for (const e of tab ?? []) {
        // a zona conta para o passo em que o jogador de fato a atravessa: o primeiro em que o nível mínimo cabe no ás dele
        // (conta o nível máximo do encontro: uma rota de selvagens acima do ás do jogador ainda não foi atravessada)
        let passo = z.passo; while (passo < 8 && e.nv[1] > asDoJogador(d, passo) + 1) passo++;
        if (e.nv[1] > asDoJogador(d, passo) + 1) continue;
        const linha = raiz(e.e), c = mapa.get(linha), peso = e.peso * pm * pt;
        if (!c || passo < c.passo) mapa.set(linha, { linha, nvMin: e.nv[0], peso: c && passo === c.passo ? c.peso + peso : peso, passo });
        else if (passo === c.passo) { c.peso += peso; c.nvMin = Math.min(c.nvMin, e.nv[0]); }
      }
    }
  }
  return [...mapa.values()].filter((c) => !INICIAIS.includes(raiz(c.linha) as 1 | 4 | 7) && !especie(c.linha).lendario);
}
/** capturas novas por passo (1, 2, 3…): três na primeira rota, depois uma por passo até 5; daí em diante, uma troca por passo */
const NOVAS_POR_PASSO = [3, 1, 1];
const RECUO_NIVEL = [1, 2, 2, 3, 3];
export interface MembroRef { e: number; nv: number; linha: number; nvCaptura: number }
/**
 * Equipe que um jogador comum teria ao chegar ao chefe do `passo` (1–8 líderes, 9 Liga) com o inicial dado.
 * `as`: nível do ás (padrão: o da curva). As capturas ficam 1 a 3 níveis abaixo do ás.
 */
export function equipeReferencia(d: Dados, inicial: number, passo: number, as = asDoJogador(d, passo)): MembroRef[] {
  const cands = candidatos(d);
  const linhas: Candidato[] = [];
  const tiposDaEquipe = () => new Set<TipoId>([...especie(inicial).tipos, ...linhas.flatMap((c) => especie(c.linha).tipos)]);
  const nota = (c: Candidato) => { const t = tiposDaEquipe(); return c.peso * (especie(c.linha).tipos.some((x) => !t.has(x)) ? 1.6 : 0.6); };
  for (let k = 1; k <= Math.min(passo, 8); k++) {
    const asK = asDoJogador(d, k);
    const livres = () => cands.filter((c) => c.passo === k && !linhas.includes(c)).sort((a, b) => nota(b) - nota(a) || a.linha - b.linha);
    for (let i = 0; i < (NOVAS_POR_PASSO[k - 1] ?? 0) && linhas.length < 5; i++) { const c = livres()[0]; if (c) linhas.push(c); }
    if (k > NOVAS_POR_PASSO.length && linhas.length) {
      // do passo 4 em diante o jogador renova a equipe: troca a captura mais fraca (soma dos atributos da forma que ela tem
      // no nível do ás) pela melhor que as rotas já abertas oferecem, com leve preferência por um tipo que ainda não tem
      const forca = (c: Candidato) => somaBase(especie(formaNoNivel(c.linha, asK)));
      const tipos = tiposDaEquipe();
      const novo = cands.filter((c) => c.passo <= k && c.peso >= 8 && !linhas.includes(c)).map((c) => ({ c, f: forca(c) * (especie(formaNoNivel(c.linha, asK)).tipos.some((x) => !tipos.has(x)) ? 1.1 : 1) + c.peso / 1000 })).sort((a, b) => b.f - a.f || a.c.linha - b.c.linha)[0]?.c;
      if (novo) {
        if (linhas.length < 5) linhas.push(novo);
        else { let pior = 0; for (let i = 1; i < linhas.length; i++) if (forca(linhas[i]) < forca(linhas[pior])) pior = i; if (forca(novo) > forca(linhas[pior])) linhas[pior] = novo; }
      }
    }
  }
  const eq: MembroRef[] = [{ e: formaNoNivel(inicial, as), nv: as, linha: inicial, nvCaptura: 5 }];
  // só entram capturas que o jogador já poderia ter com este ás (importa nos treinadores do começo da rota)
  linhas.filter((c) => c.nvMin <= as).forEach((c, i) => { const nv = Math.max(2, as - RECUO_NIVEL[Math.min(i, RECUO_NIVEL.length - 1)]); eq.push({ e: formaNoNivel(c.linha, nv), nv, linha: c.linha, nvCaptura: c.nvMin }); });
  return eq;
}
/** instancia a equipe de referência: genes e personalidade ao acaso (rng), um pouco de esforço acumulado, golpes de jogador comum */
export function instanciar(eq: readonly { e: number; nv: number }[]): CriaturaInst[] {
  return eq.map((m) => {
    const c = criarCriatura(m.e, m.nv, { treinadorOriginal: 'Ref' });
    const esf = Math.min(60, Math.floor(m.nv * 0.8));
    for (const s of Object.keys(c.esf) as Stat[]) c.esf[s] = esf;
    c.golpes = golpesDeJogador(m.e, m.nv).map(novoSlot);
    c.vida = atributos(c).vida;
    return c;
  });
}
/** remédios que o jogador de referência leva para o chefe do passo (compras modestas na venda da cidade) */
export function itensReferencia(passo: number): Record<string, number> {
  if (passo <= 1) return { 'cha-cidreira': 3 };
  if (passo === 2) return { 'cha-cidreira': 4 };
  if (passo === 3) return { 'cha-cidreira': 3, garrafada: 2 };
  if (passo === 4) return { garrafada: 4 };
  if (passo === 5) return { garrafada: 5 };
  if (passo === 6) return { garrafada: 6 };
  if (passo === 7) return { garrafada: 6, 'elixir-andiroba': 1 };
  if (passo === 8) return { garrafada: 6, 'elixir-andiroba': 2 };
  // Liga: cinco lutas seguidas pedem mochila cheia (o prêmio dos treinadores do mapa A paga isso com folga)
  return { garrafada: 15, 'elixir-andiroba': 10, 'cha-guarana': 6, 'pomada-copaiba': 4, garapa: 6 };
}
/** contra treinador de rota o jogador gasta pouco: no máximo dois remédios simples */
export function itensDeRota(passo: number): Record<string, number> { return passo <= 3 ? { 'cha-cidreira': 2 } : { garrafada: 2 }; }

/* ============================== pilotos do jogador ============================== */
export type PilotoId = 'bobo' | 'esperto' | 'ia';
interface Memoria { ultimaTroca: number; curas: Map<string, number> }
export interface Piloto { acao(b: Batalha, p: Pos, m: Memoria): Acao; substituto(b: Batalha, m: Memoria): number; oferta(b: Batalha, proxima: number, m: Memoria): number | null }

const GEN8: Record<Stat, number> = { vida: 8, atq: 8, def: 8, atqEsp: 8, defEsp: 8, vel: 8 }, ESF0: Record<Stat, number> = { vida: 0, atq: 0, def: 0, atqEsp: 0, defEsp: 0, vel: 0 };
interface Visao { c: CriaturaInst; tipos: TipoId[]; nivel: number; a: Record<Stat, number>; vida: number; vidaMax: number }
/** o que o jogador sabe: tudo das suas; das adversárias, espécie, nível e a barra de vida (atributos estimados pela espécie) */
function visao(b: Batalha, c: CriaturaInst, minha: boolean, p?: Pos): Visao {
  const a = { ...(minha ? atributos(c) : atributosDe(especie(c.especie).base, GEN8, ESF0, c.nivel, '')) };
  if (p) { const est = b.vol(p).est; for (const s of ['atq', 'def', 'atqEsp', 'defEsp', 'vel'] as const) a[s] = Math.max(1, Math.floor(a[s] * multEstagio(est[s]))); if (c.status === 'paralisado') a.vel = Math.floor(a.vel / 4); }
  const max = atributos(c).vida;
  return { c, tipos: especie(c.especie).tipos, nivel: c.nivel, a, vidaMax: a.vida, vida: Math.max(1, Math.round((a.vida * c.vida) / max)) };
}
/** dano médio de um golpe (com precisão) */
function danoDe(de: Visao, g: GolpeDef, em: Visao): number {
  if (g.cat === 'status') return 0;
  const ef = eficaciaContra(g.tipo, em.tipos); if (ef === 0) return 0;
  let fixo: number | null = null, vezes = 1, mult = 1;
  for (const e of g.efeitos) {
    if (e.t === 'fixo') fixo = e.v === 'nivel' ? de.nivel : e.v === 'metade' ? Math.floor(em.vida / 2) : e.v;
    if (e.t === 'exige' && em.c.status !== 'dormindo') return 0;
    if (e.t === 'multi') vezes = e.min === e.max ? e.min : 3;
    if (e.t === 'carga') mult *= 0.55;
    if (e.t === 'recarga') mult *= 0.7;
  }
  const acc = g.precisao === 0 ? 1 : g.precisao / 100;
  if (fixo !== null) return fixo * acc;
  const fis = g.cat === 'fisico';
  let m = 0.925 * ef * (de.tipos.includes(g.tipo) ? 1.5 : 1);
  if (fis && de.c.status === 'queimado') m *= 0.5;
  return Math.max(1, Math.floor(danoBase(de.nivel, g.poder, fis ? de.a.atq : de.a.atqEsp, fis ? em.a.def : em.a.defEsp) * m)) * vezes * acc * mult;
}
const golpesCom = (c: CriaturaInst) => c.golpes.map((s, i) => ({ i, s, g: defGolpe(s.id) })).filter((x) => x.s.pg > 0);
/** melhor dano que `de` causa em `em` com os golpes que ainda têm PG */
function melhorDano(de: Visao, em: Visao): { slot: number; dano: number } {
  let r = { slot: -1, dano: 0 };
  for (const x of golpesCom(de.c)) { const d = danoDe(de, x.g, em); if (d > r.dano || r.slot < 0) r = { slot: x.i, dano: d }; }
  return r;
}
/** o que o jogador supõe do adversário: golpes já vistos + um golpe de poder 70 de cada tipo dele */
function ameaca(b: Batalha, ele: Visao, eu: Visao): number {
  const vistos = [...(b.lados[1].revelados.get(ele.c.uid) ?? [])].map(defGolpe);
  const cat = ele.a.atq >= ele.a.atqEsp ? 'fisico' : 'especial';
  const gen = ele.tipos.map((t): GolpeDef => ({ id: '?' + t, nome: '', tipo: t, cat, poder: 70, precisao: 100, pg: 1, desc: '', anim: '', efeitos: [], alvo: 'um' }));
  return Math.max(0, ...[...vistos, ...gen].map((g) => danoDe(ele, g, eu)));
}
/** nota de confronto de uma criatura minha contra a adversária em campo (>0 = vantagem) */
function confronto(b: Batalha, meu: CriaturaInst, ele: Visao, p?: Pos): number {
  const eu = visao(b, meu, true, p);
  return Math.min(1.5, melhorDano(eu, ele).dano / ele.vidaMax) - Math.min(1.5, ameaca(b, ele, eu) / eu.vidaMax) + 0.3 * (meu.vida / atributos(meu).vida) + (eu.a.vel > ele.a.vel ? 0.1 : 0);
}
function melhorReserva(b: Batalha, ele: Visao): { para: number; nota: number } | null {
  let r: { para: number; nota: number } | null = null;
  for (const i of b.reservas(0)) { const n = confronto(b, b.lados[0].equipe[i], ele); if (!r || n > r.nota) r = { para: i, nota: n }; }
  return r;
}

const P0: Pos = { lado: 0, pos: 0 }, P1: Pos = { lado: 1, pos: 0 };
/** "bobo": sempre o golpe de maior poder que ainda tem PG; nunca troca, nunca usa item; quem desmaia dá lugar à próxima da fila */
export const pilotoBobo: Piloto = {
  acao(b, p) { const ok = golpesCom(b.criatura(p)!); if (!ok.length) return { tipo: 'golpe', slot: -1 }; return { tipo: 'golpe', slot: ok.reduce((a, x) => (x.g.poder > a.g.poder ? x : a)).i }; },
  substituto: (b) => b.reservas(0)[0],
  oferta: () => null,
};
/** "esperto": melhor golpe por eficácia e mesmo-tipo, troca em desvantagem clara, remédio abaixo de 1/3 da vida */
export const pilotoEsperto: Piloto = {
  acao(b, p, m) {
    const c = b.criatura(p)!, q = b.adversarios(p)[0];
    if (!q) return { tipo: 'golpe', slot: b.golpesValidos(p)[0] ?? -1 };
    const eu = visao(b, c, true, p), ele = visao(b, b.criatura(q)!, false, q);
    const mel = melhorDano(eu, ele), risco = ameaca(b, ele, eu);
    const nocauteio = mel.dano >= ele.vida, maisRapido = eu.a.vel > ele.a.vel;
    // remédio abaixo de 1/3 da vida, se a cura compensa o que o adversário tira
    const max = atributos(c).vida;
    // (só cura quem aguenta pelo menos dois golpes depois de curado, e no máximo duas vezes a mesma criatura por luta)
    const curasDela = m.curas.get(c.uid) ?? 0;
    if (c.vida * 3 < max && !(nocauteio && maisRapido) && curasDela < 2 && max > risco * 2.2) {
      const itens = b.lados[0].itens, indice = b.lados[0].ativos[p.pos];
      const curas = Object.keys(itens).filter((id) => itens[id] > 0 && temItemDef(id) && defItem(id).uso?.cura && b.itemServe(0, id, indice))
        .map((id) => { const u = defItem(id).uso!.cura!; return { id, v: u === 'total' ? max - c.vida : Math.min(u, max - c.vida) }; }).sort((x, y) => x.v - y.v);
      const boa = curas.find((x) => x.v >= (max - c.vida) * 0.7 && x.v > risco * 1.2) ?? curas.filter((x) => x.v > risco * 1.2).pop();
      if (boa) { m.curas.set(c.uid, curasDela + 1); return { tipo: 'item', item: boa.id, alvo: indice }; }
    }
    // troca em desvantagem clara: bato pouco, apanho muito e há alguém bem melhor na reserva
    if (b.podeTrocar(p) && b.turno - m.ultimaTroca >= 3) {
      const res = melhorReserva(b, ele);
      const fraco = mel.dano < ele.vidaMax * 0.34, apanho = risco >= eu.vida * 0.4;
      if (res && ((fraco && apanho && res.nota - confronto(b, c, ele, p) > 0.5) || (mel.dano === 0 && res.nota > -0.5))) { m.ultimaTroca = b.turno; return { tipo: 'troca', para: res.para }; }
    }
    return { tipo: 'golpe', slot: mel.slot };
  },
  substituto(b) { const q = b.adversarios(P0)[0] ?? b.ativosDe(1)[0]; if (!q) return b.reservas(0)[0]; return melhorReserva(b, visao(b, b.criatura(q)!, false, q))?.para ?? b.reservas(0)[0]; },
  oferta(b, proxima, m) {
    const ele = visao(b, b.lados[1].equipe[proxima], false), res = melhorReserva(b, ele);
    if (!res || !b.ativo(P0)) return null;
    if (res.nota - confronto(b, b.criatura(P0)!, ele) > 0.45) { m.ultimaTroca = b.turno; return res.para; }
    return null;
  },
};
/** a IA do próprio jogo pilotando o lado do jogador (nível "treinador" por padrão) */
export const pilotoIA = (nivel: NivelIA = 'treinador'): Piloto => ({
  acao: (b, p) => escolherAcaoIA(b, p, nivel),
  substituto: (b) => escolherSubstitutoIA(b, 0, nivel),
  oferta: () => null,
});
export const PILOTOS: Record<PilotoId, Piloto> = { bobo: pilotoBobo, esperto: pilotoEsperto, ia: pilotoIA() };

/* ============================== batalha headless ============================== */
export interface OpcoesLuta { ia?: NivelIA; itensIA?: Record<string, number>; maxTurnos?: number; /** o jogador ganha experiência e sobe de nível durante a luta (sequência da Liga) */ ganhaExp?: boolean; /** Chocalho do Mutirão na mochila: a reserva de pé ganha metade */ expPartilhada?: boolean; /** limiar do Chocalho (2 até a Liga, 5 depois) */ limiarPartilha?: number }
export interface ResultadoLuta { vitoria: boolean; turnos: number; empacou: boolean }
/** uma batalha jogador × treinador no motor puro. Altera as criaturas e os itens recebidos (vida, PG, status). */
export function lutarContra(equipe: CriaturaInst[], itens: Record<string, number>, inimigos: CriaturaInst[], nome: string, piloto: Piloto, ia: NivelIA, o: OpcoesLuta = {}): ResultadoLuta {
  const itensIA = o.itensIA ?? {};
  const b = new Batalha({ tipo: 'treinador', lados: [{ equipe, itens, nome: 'Ref' }, { equipe: inimigos, itens: itensIA, nome }], trocaGratis: true, ganhaExp: !!o.ganhaExp, expPartilhada: !!o.expPartilhada, limiarPartilha: o.limiarPartilha, autoAprender: true });
  const mem: Memoria = { ultimaTroca: -9, curas: new Map() }, max = o.maxTurnos ?? 300, usaItens = Object.keys(itensIA).length > 0;
  b.iniciar();
  while (b.fase !== 'fim') {
    if (b.turno > max) return { vitoria: false, turnos: b.turno, empacou: true };
    if (b.fase === 'acoes') {
      // a IA decide antes (não vê a escolha do jogador), como em ControleBatalha.agir
      const acoes: AcaoDe[] = b.pedidos().filter((p) => p.lado === 1).map((p) => ({ lado: 1, pos: p.pos, acao: escolherAcaoIA(b, p, ia, { usaItens }) }));
      for (const p of b.pedidos().filter((x) => x.lado === 0)) acoes.push({ lado: 0, pos: p.pos, acao: piloto.acao(b, p, mem) });
      b.executarTurno(acoes);
    } else if (b.fase === 'substituir') {
      b.substituir(b.pedidos().map((p) => ({ lado: p.lado, pos: p.pos, para: p.lado === 1 ? escolherSubstitutoIA(b, 1, ia) : piloto.substituto(b, mem) })));
    } else if (b.fase === 'oferta') {
      const prox = b.eventos.slice().reverse().find((e) => e.t === 'oferta-troca');
      const idx = prox && prox.t === 'oferta-troca' ? b.lados[1].equipe.findIndex((c) => c.uid === prox.proxima.uid) : -1;
      b.responderOferta(idx >= 0 ? piloto.oferta(b, idx, mem) : null);
    }
  }
  return { vitoria: b.resultado === 'vitoria', turnos: b.turno, empacou: false };
}
/** itens que o treinador usa no Aventureiro: só quem tem `itens` e só do 8º ginásio em diante (7 insígnias) — spec 7A */
export function itensDoTreinador(t: TreinadorDef, insignias: number): Record<string, number> {
  const r: Record<string, number> = {};
  if (insignias >= 7) for (const id of t.itens ?? []) r[id] = (r[id] ?? 0) + 1;
  return r;
}
export const inimigosDe = (t: TreinadorDef) => t.equipe.map((m: MembroEquipe) => criarDeMembro(m, t.nome));
export { P0, P1 };

/** cuidados entre duas lutas seguidas (Liga): sem cura grátis, só os remédios da mochila */
export function cuidarEntreLutas(equipe: CriaturaInst[], itens: Record<string, number>) {
  const gastar = (id: string) => { if ((itens[id] ?? 0) <= 1) delete itens[id]; else itens[id]--; };
  for (const c of equipe) {
    const max = atributos(c).vida;
    if (c.vida <= 0 && itens['cha-guarana']) { c.vida = Math.floor(max / 2); c.status = null; gastar('cha-guarana'); }
    if (c.vida <= 0) continue;
    if (c.status && itens['pomada-copaiba']) { c.status = null; delete c.sonoTurnos; gastar('pomada-copaiba'); }
    for (const g of c.golpes) if (g.pg <= 2 && itens.garapa) { g.pg = Math.min(g.pgMax, g.pg + 10); gastar('garapa'); }
    while (c.vida < max * 0.75) {
      if (max - c.vida > 90 && itens['elixir-andiroba']) { c.vida = max; gastar('elixir-andiroba'); }
      else if (itens.garrafada) { c.vida = Math.min(max, c.vida + 50); gastar('garrafada'); }
      else if (itens['elixir-andiroba']) { c.vida = max; gastar('elixir-andiroba'); }
      else break;
    }
  }
}
export { rng };
