/**
 * Pintores dos objetos de interior para zonas de tileset EXTERIOR/caverna (ex.: `escada-desce` numa gruta):
 * o bake junta este registro aos pintores exteriores. Usa as rampas-base de interiores.
 */
import { casa } from '../../../src/data/tilesets/casa';
import { CATALOGO_INTERIOR } from '../../../src/data/catalogo-interiores';
import { Img } from '../../pixel/tile';
import type { PintorObjeto } from '../exterior/objetos';
import { montarTema } from './tema';
import { pintarMovel } from './moveis';

const TEMA = montarTema(casa, { ...casa.temas[0], cores: {} });
export const PINTORES_INTERIOR: Record<string, PintorObjeto> = {};
for (const [nome, info] of Object.entries(CATALOGO_INTERIOR)) {
  if (!info.w) continue;
  PINTORES_INTERIOR[nome] = () => {
    const fazer = (q: number) => { const t = pintarMovel(nome, info.w, info.h, info.alto, TEMA, q)!; const i = new Img(t.w, t.h); i.d.set(t.px); return i; };
    return info.animado ? { img: fazer(0), quadros: [0, 1, 2, 3].map(fazer), sombra: 'nenhuma' } : { img: fazer(0), sombra: 'nenhuma' };
  };
}
