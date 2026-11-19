/**
 * Registros de extensão do motor de mundo. Módulo-folha (sem dependências de dados):
 * zonas, eventos e ginásios podem importar daqui sem criar ciclo de avaliação.
 */
import type { TreinadorDef, EventoDef } from '../core/tipos';

export type FnComando = (args: unknown[]) => Promise<void> | void;
export interface Mecanica {
  entrar?(): void;
  /** chamado quando o jogador termina um passo em (x, y); `true` = a mecânica tratou o passo (pula warps/encontros) */
  passo?(x: number, y: number): boolean | void;
  /** chamado ao apertar A olhando para (x, y); `true` = tratou */
  interagir?(x: number, y: number): boolean | void;
  sair?(): void;
}
export const comandosExtras = new Map<string, FnComando>();
export const mecanicas = new Map<string, Mecanica>();
export const cinematicas = new Map<string, () => Promise<void> | void>();
export const treinadoresExtras = new Map<string, TreinadorDef>();
export const eventosExtras = new Map<string, EventoDef>();

/** comando novo de script (ou substituição de um comando padrão) */
export function registrarComando(nome: string, fn: FnComando) { comandosExtras.set(nome, fn); }
/** quebra-cabeça/mecânica própria de uma zona (ginásios) */
export function registrarMecanica(zonaId: string, m: Mecanica) { mecanicas.set(zonaId, m); }
/** cinemática chamada por ['cinematica', id] e pelos warps `trem`/`saveiro` (ids 'trem' e 'saveiro') */
export function registrarCinematica(id: string, fn: () => Promise<void> | void) { cinematicas.set(id, fn); }
/** treinador definido fora de src/data/treinadores (testes, ginásios) */
export function registrarTreinador(t: TreinadorDef) { treinadoresExtras.set(t.id, t); }
/** evento definido fora de src/data/eventos */
export function registrarEvento(e: EventoDef) { eventosExtras.set(e.id, e); }
