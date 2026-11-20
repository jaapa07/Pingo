/**
 * Dependências de outros módulos, resolvidas pelo CONTRATO (docs/MOTOR.md, docs/BATALHA.md) com
 * tolerância à ausência: cada módulo é procurado por `import.meta.glob`; se ainda não existir,
 * entra uma reserva mínima (ver reserva.ts) para o motor de mundo poder rodar e ser testado sozinho.
 */
import type { CriaturaInst, EspecieDef, ItemDef, TreinadorDef, EventoDef, ClimaId, Stat, TipoId, MembroEquipe } from '../core/tipos';
import { jogo } from '../core/estado';
import { bus } from '../core/events';
import { temTela } from '../ui/telas';
import { rng } from '../core/rng';
import { treinadoresExtras, eventosExtras } from './registro';
import { entradaReserva, pollReserva, ligarEntrada, falarR, escolherR, pedirNomeR, avisarR, abrirTelaR, type Entrada } from './reserva';

type Mod = Record<string, any>;
const primeiro = (g: Record<string, unknown>): Mod | undefined => Object.values(g)[0] as Mod | undefined;
const gInput = import.meta.glob('../core/input.ts', { eager: true });
const gDialogo = import.meta.glob('../ui/dialogo.ts', { eager: true });
const gBatalha = import.meta.glob('../battle/index.ts', { eager: true });
const gCatalogo = import.meta.glob('../data/catalogo-*.ts', { eager: true });
const gCriaturas = import.meta.glob('../data/criaturas.ts', { eager: true });
const gItens = import.meta.glob('../data/itens.ts', { eager: true });
const gSave = import.meta.glob('../core/save.ts', { eager: true });
const gTreinadores = import.meta.glob('../data/treinadores/*.ts', { eager: true });
const gEventos = import.meta.glob('../data/eventos/*.ts', { eager: true });

/* ------------------------------ entrada ------------------------------ */
export const temInputReal = () => !!primeiro(gInput)?.input;
export const entrada = (): Entrada => (primeiro(gInput)?.input as Entrada | undefined) ?? entradaReserva;
/** só faz algo quando a entrada é a reserva (a real é lida pelo laço principal) */
export function pollEntrada() { if (!temInputReal()) pollReserva(); }
ligarEntrada(entrada, pollEntrada);

/* ------------------------------ diálogo ------------------------------ */
export interface Quem { nome?: string; retrato?: string; expressao?: 'neutro' | 'feliz' | 'bravo'; voz?: string }
const dlg = () => primeiro(gDialogo);
/** registro dos textos mostrados (inspeção em testes via window.__pingo.mundo.falas) */
export const diarioFalas: { t: 'falar' | 'escolher' | 'avisar'; texto: string }[] = [];
const anotar = (t: 'falar' | 'escolher' | 'avisar', texto: string) => { diarioFalas.push({ t, texto }); if (diarioFalas.length > 200) diarioFalas.shift(); };
export const falar = (texto: string, quem?: Quem): Promise<void> => { anotar('falar', texto); return (dlg()?.falar ?? falarR)(texto, quem); };
export const escolher = (p: string, o: string[], padrao?: number): Promise<number> => { anotar('escolher', p); return (dlg()?.escolher ?? escolherR)(p, o, padrao); };
export const simNao = (p: string): Promise<boolean> => escolher(p, ['Sim', 'Não']).then((i) => i === 0);
export const pedirNome = (t: string, max: number, padrao?: string): Promise<string> => (dlg()?.pedirNome ?? pedirNomeR)(t, max, padrao);
export const avisar = (t: string): void => { anotar('avisar', t); (dlg()?.avisar ?? avisarR)(t); };
/** empilha uma tela registrada e resolve quando ela fecha; tela ainda não registrada = aviso no console e segue */
export function abrirTela(id: string, args?: unknown): Promise<unknown> {
  if (!temTela(id)) { console.warn('[mundo] tela não registrada:', id); return Promise.resolve(undefined); }
  return (dlg()?.abrirTela ?? abrirTelaR)(id, args);
}

/* ------------------------------ batalha ------------------------------ */
export interface PedidoBatalha { tipo: 'selvagem' | 'treinador' | 'lendario'; inimigos: CriaturaInst[]; treinador?: TreinadorDef; arena: string; clima?: ClimaId; dupla?: boolean; semFuga?: boolean; semCaptura?: boolean; tutorial?: boolean; /** derrota sem voltar ao Posto: a equipe é curada e o roteiro segue (duelos de história) */ semDerrota?: boolean; musica?: string; /** criatura errante: tenta fugir no primeiro turno */ errante?: boolean; /** sem experiência para o jogador (Torre de Desafios) */ semExp?: boolean; /** fisgada na pesca (Cuia de Isca) */ pescada?: boolean }
export interface ResultadoBatalha { resultado: 'vitoria' | 'derrota' | 'fuga' | 'captura'; capturada?: CriaturaInst }
const bat = () => primeiro(gBatalha);
export const temBatalha = () => typeof bat()?.iniciarBatalha === 'function';
/** registro das batalhas pedidas (inspeção em testes via window.__pingo.mundo.ultimaBatalha) */
export const diarioBatalhas: PedidoBatalha[] = [];
export async function iniciarBatalha(p: PedidoBatalha): Promise<ResultadoBatalha> {
  diarioBatalhas.push(p); if (diarioBatalhas.length > 20) diarioBatalhas.shift();
  const f = bat()?.iniciarBatalha;
  if (f) return f(p);
  // sem o módulo de batalha (teste isolado): anuncia e devolve vitória
  const e = p.inimigos[0];
  await falar(p.treinador ? `${p.treinador.classe} ${p.treinador.nome} quer batalhar!` : `Um ${nomeCriatura(e)} selvagem apareceu!`);
  const resultado = (jogo.save.flags['teste-resultado-batalha'] as ResultadoBatalha['resultado']) ?? 'vitoria';
  // com o módulo de batalha, quem emite 'batalha-fim' é ele (uma vez só); aqui é o substituto do teste isolado
  bus.emit('batalha-fim', { tipo: p.tipo, resultado, pedido: p });
  return { resultado };
}
const ST: Stat[] = ['vida', 'atq', 'def', 'atqEsp', 'defEsp', 'vel'];
const zeros = () => Object.fromEntries(ST.map((s) => [s, 0])) as Record<Stat, number>;
export function criarCriatura(especie: number, nivel: number, o?: Partial<CriaturaInst>): CriaturaInst {
  const f = bat()?.criarCriatura;
  if (f) return f(especie, nivel, o);
  const gen = zeros(); for (const s of ST) gen[s] = rng.int(0, 15);
  return { uid: 'c' + rng.int(1, 0x7fffffff).toString(36), especie, nivel, exp: nivel ** 3, vida: 10 + nivel * 3, status: null, golpes: [], gen, esf: zeros(), personalidade: 'serena', sexo: null, amizade: 70, cuia: 'cuia-simples', treinadorOriginal: jogo.save.jogador.nome, ...o };
}
/** criatura de treinador: usa os `golpes` escolhidos à mão em `MembroEquipe`, quando o módulo de batalha está carregado */
export function criarDeMembro(m: MembroEquipe, dono = ''): CriaturaInst {
  const f = bat()?.criarDeMembro;
  if (f) return f(m, dono);
  return criarCriatura(m.e, m.nv, m.item ? { item: m.item } : undefined);
}
export function curarEquipe(o?: { posto?: boolean }) {
  const f = bat()?.curarEquipe;
  if (f) return f(o);
  for (const c of jogo.save.equipe) { c.status = null; c.vida = Math.max(c.vida, 10 + c.nivel * 3); for (const g of c.golpes) g.pg = g.pgMax; }
}

/* ------------------------------ dados ------------------------------ */
function coletar<T>(g: Record<string, unknown>, ok: (v: any) => boolean): T[] {
  const out: T[] = [];
  const ver = (v: any, fundo: number) => {
    if (!v || typeof v !== 'object') return;
    if (ok(v)) { out.push(v); return; }
    if (fundo > 0) for (const x of Array.isArray(v) ? v : Object.values(v)) ver(x, fundo - 1);
  };
  for (const m of Object.values(g)) ver(m, 2);
  return out;
}
let _esp: Map<number, EspecieDef> | undefined;
function especies() { return (_esp ??= new Map(coletar<EspecieDef>(gCriaturas, (v) => typeof v.num === 'number' && Array.isArray(v.tipos)).map((e) => [e.num, e]))); }
/** dados da espécie: `src/data/criaturas.ts` ou, na falta dele, o registro do módulo de batalha */
export function especie(n: number): EspecieDef | undefined {
  const e = especies().get(n);
  if (e) return e;
  try { return bat()?.especie?.(n); } catch { return undefined; }
}
export const tiposDe = (n: number): TipoId[] | undefined => especie(n)?.tipos;
export const nomeCriatura = (c: CriaturaInst | undefined) => (c ? c.apelido ?? especie(c.especie)?.nome ?? `Criatura nº ${c.especie}` : 'criatura');
let _itens: Map<string, ItemDef> | undefined;
function itens() { return (_itens ??= new Map(coletar<ItemDef>(gItens, (v) => typeof v.id === 'string' && typeof v.bolso === 'string').map((i) => [i.id, i]))); }
export const item = (id: string): ItemDef | undefined => itens().get(id);
export const nomeItem = (id: string) => item(id)?.nome ?? id.replace(/-/g, ' ');
let _trein: Map<string, TreinadorDef> | undefined;
export function treinador(id: string): TreinadorDef | undefined {
  _trein ??= new Map(coletar<TreinadorDef>(gTreinadores, (v) => typeof v.id === 'string' && Array.isArray(v.equipe)).map((t) => [t.id, t]));
  return treinadoresExtras.get(id) ?? _trein.get(id);
}
let _ev: Map<string, EventoDef> | undefined;
export function evento(id: string): EventoDef | undefined {
  _ev ??= new Map(coletar<EventoDef>(gEventos, (v) => typeof v.id === 'string' && Array.isArray(v.passos)).map((e) => [e.id, e]));
  return eventosExtras.get(id) ?? _ev.get(id);
}
/** união de todos os catálogos (`src/data/catalogo-*.ts`): qualquer export que seja um mapa nome → { w, h, … } */
let _cat: Record<string, any> | undefined;
export function catalogoBruto(): Record<string, any> {
  if (_cat) return _cat;
  _cat = {};
  const ehObj = (v: any) => v && typeof v === 'object' && typeof v.w === 'number' && typeof v.h === 'number';
  for (const m of Object.values(gCatalogo) as Mod[]) for (const v of Object.values(m)) {
    if (!v || typeof v !== 'object') continue;
    if (Array.isArray(v)) { for (const o of v) if (ehObj(o) && (o.id ?? o.nome ?? o.o)) _cat[o.id ?? o.nome ?? o.o] = o; }
    else for (const [k, o] of Object.entries(v)) if (ehObj(o)) _cat[k] = o;
  }
  return _cat;
}
/** passos de repelente / método de pesca de um item, pelos dados de `itens.ts` (campo `uso`) */
export const usoItem = (id: string): { repelente?: number; pesca?: string } | undefined => (item(id) as (ItemDef & { uso?: { repelente?: number; pesca?: string } }) | undefined)?.uso;
export async function gravar() { const s = primeiro(gSave); try { await s?.gravarSlot?.(jogo.slot); } catch { /* sem armazenamento: segue em memória */ } }
