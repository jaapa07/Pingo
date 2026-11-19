/** Gancho do bake para interiores (docs/BAKE.md): tilesets com pintor próprio e pintores de objetos. */
import { casa, type TilesetInterior } from '../../../src/data/tilesets/casa';
import { predio } from '../../../src/data/tilesets/predio';
import { ginasio } from '../../../src/data/tilesets/ginasio';
import { industrial } from '../../../src/data/tilesets/industrial';
import { tilesetProprio } from './zona';

export const DADOS_INTERIOR: TilesetInterior[] = [casa, predio, ginasio, industrial];
export const TILESETS_INTERIOR = DADOS_INTERIOR.map(tilesetProprio);
export { PINTORES_INTERIOR } from './objetos';
