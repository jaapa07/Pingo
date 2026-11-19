/**
 * Dados derivados para as telas: zonas (habitats por espécie, raras do dia), treinadores (contatos do Rádio Cipó)
 * e acesso tardio aos módulos do mundo e do áudio (carregados só quando uma tela precisa deles).
 */
import type { ZonaDef, TreinadorDef, Encontro, MetodoEncontro, Habitat, Periodo } from '../../core/tipos';
import { jogo, diaSemana } from '../../core/estado';
import { baseZona } from './mapa-dados';

const gz = import.meta.glob('../../data/zonas/*.ts'), gt = import.meta.glob('../../data/treinadores/*.ts');
const gMundo = import.meta.glob('../../world/index.ts'), gAudio = import.meta.glob('../../audio/index.ts');

const _zonas = new Map<string, ZonaDef>(), _trein = new Map<string, TreinadorDef>();
let _hab: Map<number, Avistamento[]> | undefined;
/** carrega um módulo de dados por vez; um arquivo com erro (em desenvolvimento) não derruba os outros */
async function carregar(g: Record<string, () => Promise<unknown>>, cada: (v: unknown) => void) {
  await Promise.all(Object.values(g).map(async (f) => { try { for (const v of Object.values((await f()) as Record<string, unknown>)) cada(v); } catch { /* arquivo indisponível neste pacote */ } }));
}
const porTreinador = (v: unknown) => { const t = v as TreinadorDef; if (t && typeof t === 'object' && typeof t.id === 'string' && Array.isArray(t.equipe)) _trein.set(t.id, t); };
/** resolve quando as zonas e os treinadores estiverem na memória (as telas chamam antes de precisar deles) */
export const dadosProntos: Promise<void> = Promise.all([
  carregar(gz, (v) => { if (v && typeof v === 'object' && Array.isArray((v as ZonaDef).mapaChars)) { _zonas.set((v as ZonaDef).id, v as ZonaDef); _hab = undefined; } }),
  carregar(gt, (v) => { if (Array.isArray(v)) v.forEach(porTreinador); else porTreinador(v); }),
]).then(() => undefined);
export const zona = (id: string): ZonaDef | undefined => _zonas.get(id);
export const todasZonas = (): ZonaDef[] => [..._zonas.values()];
export const treinador = (id: string): TreinadorDef | undefined => _trein.get(id);

export type PeriodoTabela = 'manha' | 'dia' | 'noite';
export interface Avistamento { local: string; metodos: MetodoEncontro[]; periodos: PeriodoTabela[]; /** menor peso com que aparece (quanto menor, mais rara) */ peso: number }
export const NOME_METODO: Record<MetodoEncontro, string> = { grama: 'capim alto', caverna: 'caverna', agua: 'sobre a água', 'pesca-velha': 'pesca', 'pesca-boa': 'pesca', 'pesca-mestra': 'pesca', arvore: 'sacudindo árvores', rocha: 'quebrando rochas', mergulho: 'mergulho' };
const PERIODOS: PeriodoTabela[] = ['manha', 'dia', 'noite'];
function tabelasDe(h: Habitat): { t: Encontro[]; p: PeriodoTabela[] }[] {
  const r: { t: Encontro[]; p: PeriodoTabela[] }[] = [];
  for (const fonte of [h, ...(h.camadas ?? [])]) {
    if (fonte.todos) r.push({ t: fonte.todos, p: PERIODOS.filter((p) => !fonte[p]) });
    for (const p of PERIODOS) if (fonte[p]) r.push({ t: fonte[p]!, p: [p] });
  }
  return r;
}
/** onde cada espécie aparece solta, derivado das tabelas de `habitats` de todas as zonas (agrupado por local do mapa) */
export function habitatsDe(num: number): Avistamento[] {
  if (!_hab) {
    _hab = new Map();
    for (const z of todasZonas()) {
      const base = baseZona(z.id); if (!base || z.id.startsWith('_')) continue;
      for (const h of z.habitats ?? []) for (const { t, p } of tabelasDe(h)) for (const e of t) {
        const lista = _hab.get(e.e) ?? _hab.set(e.e, []).get(e.e)!;
        let a = lista.find((x) => x.local === base); if (!a) { a = { local: base, metodos: [], periodos: [], peso: e.peso }; lista.push(a); }
        if (!a.metodos.includes(h.metodo)) a.metodos.push(h.metodo);
        for (const q of p.length ? p : PERIODOS) if (!a.periodos.includes(q)) a.periodos.push(q);
        a.peso = Math.min(a.peso, e.peso);
      }
    }
  }
  return _hab.get(num) ?? [];
}
/** a espécie mais rara de cada local nas tabelas em vigor no período dado (programa "Bicho do Dia" do Rádio Cipó) */
export function rarasDoDia(p: Periodo): { local: string; especie: number; metodo: MetodoEncontro }[] {
  const per: PeriodoTabela = p === 'tarde' ? 'dia' : p;
  const porLocal = new Map<string, { e: Encontro; metodo: MetodoEncontro }[]>();
  for (const z of todasZonas()) {
    const base = baseZona(z.id); if (!base || z.id.startsWith('_')) continue;
    for (const h of z.habitats ?? []) {
      const cam = [...(h.camadas ?? [])].sort((a, b) => b.apos - a.apos).find((c) => jogo.save.insignias.includes(c.apos));
      const t = cam?.[per] ?? cam?.todos ?? h[per] ?? h.todos ?? [];
      const raras = t.filter((e) => e.peso <= 15);
      const lista = porLocal.get(base) ?? porLocal.set(base, []).get(base)!;
      for (const e of raras) lista.push({ e, metodo: h.metodo });
    }
  }
  const dia = diaDoAno(), r: { local: string; especie: number; metodo: MetodoEncontro }[] = [];
  for (const [loc, lista] of porLocal) { if (!lista.length) continue; const x = lista[(dia + loc.length * 7 + loc.charCodeAt(loc.length - 1)) % lista.length]; r.push({ local: loc, especie: x.e.e, metodo: x.metodo }); }
  return r;
}
/** dia corrido do relógio do jogo (muda à meia-noite do aparelho + deslocamento) */
export function diaDoAno(): number { const d = new Date(Date.now() + jogo.save.relogio.deslocamentoMin * 60000); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); }
export const NOME_DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const hoje = () => NOME_DIA[diaSemana()];

type Modulo = Record<string, unknown>;
async function tardio(g: Record<string, () => Promise<unknown>>): Promise<Modulo | null> { const f = Object.values(g)[0]; if (!f) return null; try { return (await f()) as Modulo; } catch { return null; } }
/** módulo do mundo (null se não existir neste pacote) */
export const moduloMundo = () => tardio(gMundo);
/** lista de músicas disponíveis no motor de áudio */
export async function musicasDisponiveis(): Promise<string[]> { const m = await tardio(gAudio); return (m?.audio as { listMusic?(): string[] } | undefined)?.listMusic?.() ?? []; }
