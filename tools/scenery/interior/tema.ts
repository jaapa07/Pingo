/** Resolve o tema de interior de uma zona e converte as rampas hex em cores. */
import type { ZonaDef } from '../../../src/core/tipos';
import { CORES_BASE, type CoresInterior, type TemaInterior, type TilesetInterior } from '../../../src/data/tilesets/casa';
import { hex } from '../arenas/nucleo';

export type Ramp = number[];
export interface Tema { def: TemaInterior; R: Record<keyof CoresInterior, Ramp>; k: number }

export function montarTema(ts: TilesetInterior, def: TemaInterior): Tema {
  const R = {} as Record<keyof CoresInterior, Ramp>;
  for (const key of Object.keys(CORES_BASE) as (keyof CoresInterior)[]) R[key] = (def.cores[key] ?? ts.base[key]).map(hex);
  return { def, R, k: R.teto[0] };
}
export function temaDaZona(ts: TilesetInterior, zona: Pick<ZonaDef, 'id' | 'objetos'>): Tema {
  const achar = (id: unknown) => ts.temas.find((t) => t.id === id || t.id === `g${String(id).padStart(2, '0')}`);
  const pseudo = zona.objetos?.find((o) => o.o === 'tema');
  let def = pseudo ? achar(pseudo.tema) : undefined;
  if (!def) for (const [er, id] of ts.porZona) if (new RegExp(er).test(zona.id)) { def = achar(id); break; }
  if (!def) { let s = 0; for (const ch of zona.id) s = (s * 31 + ch.charCodeAt(0)) >>> 0; def = achar(ts.rodizio[s % ts.rodizio.length]); }
  return montarTema(ts, def ?? ts.temas[0]);
}
