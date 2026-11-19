/**
 * Criaturas: registro de espécies, criação de instâncias, atributos, experiência, evolução e amizade.
 * Puro (sem DOM). Todo acaso passa por `rng`.
 */
import { STATS, type CriaturaInst, type EspecieDef, type Evolucao, type GolpeSlot, type MembroEquipe, type Periodo, type Stat } from '../core/tipos';
import { rng } from '../core/rng';
import { golpe, temGolpe } from '../data/golpes';
import { PERSONALIDADES, multPersonalidade } from '../data/personalidades';

/* ------------------------------ registro de espécies ------------------------------ */
const especies = new Map<number, EspecieDef>();
/** Registra (ou substitui) espécies. O jogo registra `ESPECIES` de src/data/criaturas.ts na carga (ver src/battle/index.ts). */
export function registrarEspecies(lista: readonly EspecieDef[]) { for (const e of lista) especies.set(e.num, e); }
export function especie(num: number): EspecieDef { const e = especies.get(num); if (!e) throw new Error('espécie não registrada: ' + num); return e; }
export const temEspecie = (num: number) => especies.has(num);
export const totalEspecies = () => especies.size;
export const nomeDe = (c: CriaturaInst): string => c.apelido || especie(c.especie).nome;

/* ------------------------------ atributos ------------------------------ */
export const NIVEL_MAX = 100;
export const ESF_MAX_ATRIBUTO = 252, ESF_MAX_TOTAL = 510;
/** Fórmulas do contrato (docs/BATALHA.md). */
export function atributosDe(base: Record<Stat, number>, gen: Record<Stat, number>, esf: Record<Stat, number>, nivel: number, personalidadeId: string): Record<Stat, number> {
  const r = {} as Record<Stat, number>;
  for (const s of STATS) {
    const nucleo = Math.floor(((2 * base[s] + gen[s] * 2 + Math.floor(esf[s] / 4)) * nivel) / 100);
    r[s] = s === 'vida' ? nucleo + nivel + 10 : Math.floor((nucleo + 5) * multPersonalidade(personalidadeId, s));
  }
  return r;
}
export function atributos(c: CriaturaInst): Record<Stat, number> { return atributosDe(especie(c.especie).base, c.gen, c.esf, c.nivel, c.personalidade); }
export const vidaMax = (c: CriaturaInst): number => atributos(c).vida;

/* ------------------------------ experiência ------------------------------ */
export type Curva = EspecieDef['crescimento'];
const FATOR: Record<Curva, number> = { rapido: 0.8, medio: 1, lento: 1.25 };
/** experiência total necessária para estar no nível `n` (nível 1 = 0) */
export function expParaNivel(curva: Curva, n: number): number { return n <= 1 ? 0 : Math.floor(FATOR[curva] * n * n * n); }
export function nivelPorExp(curva: Curva, exp: number): number { let n = 1; while (n < NIVEL_MAX && exp >= expParaNivel(curva, n + 1)) n++; return n; }
/** experiência rendida por uma criatura derrotada (antes de dividir entre participantes) */
export function expDerrota(derrotada: CriaturaInst, deTreinador: boolean): number { const b = Math.floor((especie(derrotada.especie).expBase * derrotada.nivel) / 7); return Math.max(1, deTreinador ? Math.floor(b * 1.5) : b); }
/** soma esforço respeitando 252 por atributo e 510 no total; retorna o que foi de fato somado */
export function ganharEsforco(c: CriaturaInst, ganho: Partial<Record<Stat, number>>): Partial<Record<Stat, number>> {
  const somado: Partial<Record<Stat, number>> = {};
  for (const s of STATS) {
    const g = ganho[s] ?? 0; if (g <= 0) continue;
    const total = STATS.reduce((a, k) => a + c.esf[k], 0);
    const n = Math.max(0, Math.min(g, ESF_MAX_ATRIBUTO - c.esf[s], ESF_MAX_TOTAL - total));
    if (n > 0) { c.esf[s] += n; somado[s] = n; }
  }
  return somado;
}
/** golpes que a espécie aprende exatamente neste nível */
export function golpesDoNivel(num: number, nivel: number): string[] { return especie(num).golpes.filter(([n, id]) => n === nivel && temGolpe(id)).map(([, id]) => id); }
export const novoSlot = (id: string): GolpeSlot => { const g = golpe(id); return { id, pg: g.pg, pgMax: g.pg }; };
/** ensina um golpe: em vaga livre, ou no lugar de `slot`. Retorna false se já conhece ou não há vaga. */
export function aprenderGolpe(c: CriaturaInst, id: string, slot?: number): boolean {
  if (c.golpes.some((g) => g.id === id)) return false;
  if (c.golpes.length < 4) { c.golpes.push(novoSlot(id)); return true; }
  if (slot === undefined || slot < 0 || slot >= c.golpes.length) return false;
  c.golpes[slot] = novoSlot(id); return true;
}
export interface SubidaNivel { nivel: number; antes: Record<Stat, number>; depois: Record<Stat, number>; golpes: string[] }
/** sobe exatamente um nível (ajusta a vida atual pela diferença da vida máxima). Não mexe em `exp`. */
export function subirNivel(c: CriaturaInst): SubidaNivel {
  const antes = atributos(c);
  c.nivel = Math.min(NIVEL_MAX, c.nivel + 1);
  const depois = atributos(c);
  if (c.vida > 0) c.vida = Math.min(depois.vida, c.vida + (depois.vida - antes.vida));
  mudarAmizade(c, c.amizade < 100 ? 5 : c.amizade < 200 ? 3 : 2);
  return { nivel: c.nivel, antes, depois, golpes: golpesDoNivel(c.especie, c.nivel).filter((id) => !c.golpes.some((g) => g.id === id)) };
}
/** dá experiência e aplica as subidas de nível (aprende sozinha só se houver vaga). Uso fora de batalha (Rapadura, creche). */
export function ganharExp(c: CriaturaInst, qtd: number): SubidaNivel[] {
  const curva = especie(c.especie).crescimento, subidas: SubidaNivel[] = [];
  if (c.nivel >= NIVEL_MAX) return subidas;
  c.exp = Math.min(c.exp + qtd, expParaNivel(curva, NIVEL_MAX));
  while (c.nivel < NIVEL_MAX && c.exp >= expParaNivel(curva, c.nivel + 1)) { const s = subirNivel(c); for (const id of s.golpes) aprenderGolpe(c, id); subidas.push(s); }
  return subidas;
}

/* ------------------------------ criação ------------------------------ */
let contador = 0;
const novoUid = () => 'c' + rng.int(0, 0xffffff).toString(36) + (contador++).toString(36);
const zeros = (): Record<Stat, number> => ({ vida: 0, atq: 0, def: 0, atqEsp: 0, defEsp: 0, vel: 0 });
/**
 * Os até 4 golpes mais recentes que a espécie conhece neste nível — garantindo, quando ela já os aprendeu, pelo menos
 * dois golpes de dano e um de dano do próprio tipo (os "4 mais recentes" puros deixavam criaturas só com golpes de status).
 */
export function golpesIniciais(num: number, nivel: number): GolpeSlot[] {
  const e = especie(num), ids: string[] = [];
  for (const [n, id] of e.golpes) if (n <= nivel && temGolpe(id) && !ids.includes(id)) ids.push(id);
  const r = ids.slice(-4);
  const dano = (id: string) => golpe(id).cat !== 'status', doTipo = (id: string) => dano(id) && e.tipos.includes(golpe(id).tipo);
  // troca o golpe de status mais antigo (ou, na falta, o de dano mais antigo que não seja do tipo) pelo golpe pedido
  const encaixar = (id: string, manter: (x: string) => boolean) => { let i = r.findIndex((x) => !dano(x)); if (i < 0) i = r.findIndex((x) => !manter(x)); if (i >= 0) { r.splice(i, 1); r.push(id); } };
  const fora = () => ids.filter((x) => !r.includes(x)).reverse();
  if (!r.some(doTipo)) { const id = fora().find(doTipo); if (id) encaixar(id, doTipo); }
  while (r.filter(dano).length < 2) { const id = fora().find(dano); if (!id || !r.some((x) => !dano(x))) break; encaixar(id, dano); }
  return (r.length ? r : ['encontrao']).map(novoSlot);
}
/** Cria uma criatura: genes, personalidade, sexo e golpes do nível são sorteados no `rng` (salvo o que vier em `o`). */
export function criarCriatura(num: number, nivel: number, o: Partial<CriaturaInst> = {}): CriaturaInst {
  const e = especie(num);
  nivel = Math.max(1, Math.min(NIVEL_MAX, Math.floor(nivel)));
  const gen = zeros(); for (const s of STATS) gen[s] = rng.int(0, 15);
  const pers = rng.escolha(PERSONALIDADES).id;
  const sexo = e.femeas === null ? null : rng.f() < e.femeas ? 'F' : 'M';
  const c: CriaturaInst = {
    uid: novoUid(), especie: num, nivel, exp: expParaNivel(e.crescimento, nivel), vida: 0, status: null,
    golpes: golpesIniciais(num, nivel), gen, esf: zeros(), personalidade: pers, sexo, amizade: 70, cuia: 'cuia', treinadorOriginal: '',
    ...o,
  };
  // vida cheia por padrão; se vier em `o`, nunca acima do máximo (o máximo depende de genes/esforço/nível, que também podem vir em `o`)
  const max = atributos(c).vida;
  c.vida = o.vida === undefined ? max : Math.max(0, Math.min(max, Math.floor(o.vida)));
  return c;
}
/** Cria a criatura de um treinador a partir de `MembroEquipe` (golpes fixos, se dados). */
export function criarDeMembro(m: MembroEquipe, dono = ''): CriaturaInst {
  const c = criarCriatura(m.e, m.nv, { treinadorOriginal: dono, ...(m.item ? { item: m.item } : {}) });
  if (m.golpes?.length) c.golpes = m.golpes.filter(temGolpe).slice(0, 4).map(novoSlot);
  if (!c.golpes.length) c.golpes = golpesIniciais(m.e, m.nv);
  return c;
}
/** cura completa: vida, status e PG */
export function curarCriatura(c: CriaturaInst) { if (c.ovo) return; c.vida = atributos(c).vida; c.status = null; delete c.sonoTurnos; for (const g of c.golpes) g.pg = g.pgMax; }

/* ------------------------------ amizade ------------------------------ */
export const AMIZADE_EVOLUCAO = 220, AMIZADE_MAX = 255;
export const AMIZADE_FARO = 200;
/** muda a amizade (0..255). A Cuia de Mel aumenta em 50% os ganhos. Retorna o novo valor. */
export function mudarAmizade(c: CriaturaInst, delta: number): number {
  if (delta > 0 && c.cuia === 'cuia-mel') delta = Math.ceil(delta * 1.5);
  c.amizade = Math.max(0, Math.min(AMIZADE_MAX, c.amizade + delta));
  return c.amizade;
}
export type EventoAmizade = 'cafune' | 'passos' | 'vitoria-lider' | 'desmaio' | 'remedio' | 'posto';
const DELTA_AMIZADE: Record<EventoAmizade, number> = { cafune: 3, passos: 1, 'vitoria-lider': 4, desmaio: -1, remedio: 1, posto: 0 };
/** 'passos' deve ser chamado a cada 256 passos com a criatura na equipe; 'cafune' no máximo algumas vezes por dia (controle de quem chama). */
export function amizadePor(c: CriaturaInst, ev: EventoAmizade): number { return mudarAmizade(c, DELTA_AMIZADE[ev]); }

/* ------------------------------ evolução ------------------------------ */
export interface ContextoEvolucao { item?: string; periodo?: Periodo }
const periodoBate = (quer: Periodo, agora?: Periodo) => agora !== undefined && (quer === agora || (quer === 'dia' && agora === 'tarde'));
/**
 * Evolução disponível agora, ou null.
 * Sem `ctx.item`: avalia as evoluções por nível/amizade/período/sexo (chamar depois de subir de nível).
 * Com `ctx.item`: avalia só as evoluções que pedem aquele item (as demais condições da mesma entrada também valem).
 */
export function podeEvoluir(c: CriaturaInst, ctx: ContextoEvolucao = {}): Evolucao | null {
  if (c.ovo || !temEspecie(c.especie)) return null;
  for (const ev of especie(c.especie).evolui ?? []) {
    if (!temEspecie(ev.para)) continue;
    if (ev.item ? ctx.item !== ev.item : ctx.item !== undefined) continue;
    if (ev.nivel !== undefined && c.nivel < ev.nivel) continue;
    if (ev.amizade && c.amizade < AMIZADE_EVOLUCAO) continue;
    if (ev.periodo && !periodoBate(ev.periodo, ctx.periodo)) continue;
    if (ev.sexo && c.sexo !== ev.sexo) continue;
    if (!ev.item && ev.nivel === undefined && !ev.amizade && !ev.periodo) continue;
    return ev;
  }
  return null;
}
/** Evolui a criatura (mantém o dano já sofrido). Golpes que a nova forma aprende neste nível entram sozinhos se houver vaga; retorna os que não couberam (pedem escolha de qual esquecer). */
export function evoluir(c: CriaturaInst, para: number): string[] {
  const antes = atributos(c).vida;
  c.especie = para;
  const depois = atributos(c).vida;
  if (c.vida > 0) c.vida = Math.max(1, Math.min(depois, c.vida + (depois - antes)));
  const novos = golpesDoNivel(para, c.nivel).filter((id) => !c.golpes.some((g) => g.id === id));
  return novos.filter((id) => !aprenderGolpe(c, id));
}
