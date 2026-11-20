/** Registro das pessoas (jogadores, personagens da história, líderes, Conselho, treinadores e NPCs). */
import type { PixModel } from '../../render/types';
import { principais } from './principais';
import { lideres } from './lideres';
import { conselho } from './conselho';
import { classes } from './classes';
import { npcs } from './npcs';
import { liga } from './liga';
import { sertao } from './sertao';

export const modelos: PixModel[] = [...principais, ...lideres, ...conselho, ...classes, ...npcs, ...liga, ...sertao];
