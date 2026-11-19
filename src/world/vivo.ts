/** Estado vivo do mapa (uma zona carregada por vez) e utilidades compartilhadas pelos módulos do mundo. */
import type { NpcDef, TreinadorDef, Portao, AmuletoId, CriaturaInst, TipoId } from '../core/tipos';
import { bus } from '../core/events';
import { jogo, temAmuleto } from '../core/estado';
import type { Ator } from './ator';
import type { Cena } from './cena';
import type { ZonaViva } from './zonas';
import { tiposDe } from './deps';

export interface NpcVivo { id: string; def: NpcDef; ator: Ator; ox: number; oy: number; espera: number; rotaI: number; treinador?: TreinadorDef }
export interface Guarda { p: Portao; ator: Ator }

export const M = {
  cena: null as unknown as Cena,
  zv: null as unknown as ZonaViva,
  jog: null as unknown as Ator,
  parceira: null as Ator | null,
  npcs: [] as NpcVivo[],
  guardas: [] as Guarda[],
  /** atores avulsos (ajudante de Amuleto, props de mecânicas): atualizados e desenhados até serem removidos */
  extras: [] as Ator[],
  pronto: false, carregando: false, pausado: false,
  /** > 0 enquanto um script, diálogo, transição ou animação de campo está em curso */
  ocupado: 0,
  quadro: 0,
  passosSeguros: 0, passos: 0,
  forca: false,
  sacudidas: new Set<number>(),
  viraT: 0, batidaT: 0, parouEm: -9, travaDir: null as string | null,
  musica: '',
  debugForcado: false,
  /** observadores por quadro; devolvem true para sair da lista */
  vigias: [] as (() => boolean | void)[],
};

export async function ocupar<T>(f: () => Promise<T>): Promise<T> { M.ocupado++; try { return await f(); } finally { M.ocupado--; } }
export const sfx = (id: string) => bus.emit('sfx', { id });
export function musica(id: string | undefined, forcar = false) { if (!id || (id === M.musica && !forcar)) return; M.musica = id; bus.emit('musica', id); }
export const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** espera `n` quadros de simulação do mapa; `cada` roda de forma síncrona por quadro e encerra antes se devolver true */
export function quadros(n: number, cada?: (i: number) => boolean | void): Promise<boolean> {
  return new Promise((res) => { let i = 0; M.vigias.push(() => { if (cada?.(i) === true) { res(true); return true; } if (++i >= n) { res(false); return true; } }); });
}
export function rodarVigias() { for (let i = M.vigias.length - 1; i >= 0; i--) if (M.vigias[i]() === true) M.vigias.splice(i, 1); }

export const npcEm = (x: number, y: number): NpcVivo | undefined => M.npcs.find((n) => n.ator.visivel && n.ator.x === x && n.ator.y === y);
/** algum ator sólido ocupa o tile? (jogador, NPC, guarda de portão) */
export function atorEm(x: number, y: number, menos?: Ator): boolean {
  if (M.jog !== menos && M.jog.x === x && M.jog.y === y) return true;
  if (M.npcs.some((n) => n.ator !== menos && n.ator.visivel && n.ator.x === x && n.ator.y === y)) return true;
  return M.guardas.some((g) => g.ator.x === x && g.ator.y === y);
}

/* ------------------------------ Amuletos de Campo (spec 4.4) ------------------------------ */
export const AMULETOS: Record<AmuletoId, { nome: string; art: string; tipos: TipoId[] | null; obst: string }> = {
  facao: { nome: 'Facão', art: 'o', tipos: ['mata', 'inseto', 'ginga'], obst: 'Cipós grossos fecham a passagem. Só um bom facão daria jeito.' },
  remo: { nome: 'Remo', art: 'o', tipos: ['rio'], obst: 'A água é funda. Dá para ver peixes passando lá embaixo.' },
  forca: { nome: 'Força', art: 'a', tipos: ['terra', 'pedra', 'ginga'], obst: 'Um pedregulho enorme. Nem se mexe.' },
  lampiao: { nome: 'Lampião', art: 'o', tipos: ['brasa', 'trovao', 'encanto'], obst: 'Não dá para enxergar quase nada aqui.' },
  'quebra-pedra': { nome: 'Quebra-pedra', art: 'o', tipos: ['pedra', 'terra', 'ferro', 'ginga'], obst: 'Uma rocha cheia de rachaduras. Uma pancada certeira a partiria.' },
  escalar: { nome: 'Escalar', art: 'o', tipos: ['ginga', 'comum', 'inseto'], obst: 'Um paredão coberto de trepadeiras firmes.' },
  cachoeira: { nome: 'Cachoeira', art: 'a', tipos: ['rio', 'lenda'], obst: 'A cascata despenca com força. Não dá para subir assim.' },
  mergulho: { nome: 'Mergulho', art: 'o', tipos: ['rio'], obst: 'A água aqui é escura e muito funda.' },
  voo: { nome: 'Voo', art: 'o', tipos: ['vento'], obst: '' },
  faro: { nome: 'Faro', art: 'o', tipos: null, obst: '' },
};
/**
 * criatura da equipe que pode usar o Amuleto (tipo certo; Faro: amizade ≥ 150). Espécie sem dados
 * registrados (teste isolado, antes de `criaturas.ts` existir) é aceita.
 */
export function ajudante(id: AmuletoId): CriaturaInst | null {
  if (!temAmuleto(id)) return null;
  const a = AMULETOS[id];
  for (const c of jogo.save.equipe) {
    if (c.ovo) continue;
    if (!a.tipos) { if (c.amizade >= 150) return c; continue; }
    const t = tiposDe(c.especie);
    if (!t || t.some((x) => a.tipos!.includes(x))) return c;
  }
  return null;
}
