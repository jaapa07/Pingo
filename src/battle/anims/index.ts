/**
 * Registro das animações de golpe: uma função por id de `ANIMS_USADAS` (golpes) e de `ANIMS_MOTOR` (efeitos do motor).
 * Cada animação é composta de FX em pixel art (assets-src/fx → tools/build-fx.ts) e dura de 0,4 a 1,2 s.
 */
import { ANIMS_MOTOR, ANIMS_USADAS } from '../anims-usadas';
import type { AnimGolpe } from './nucleo';
import { TIPOS_1 } from './tipos-1';
import { TIPOS_2 } from './tipos-2';
import { APOIOS, FISICOS, MOTOR } from './gerais';

export type { AnimGolpe, Golpeio } from './nucleo';
export const ANIMS: Record<string, AnimGolpe> = { ...TIPOS_1, ...TIPOS_2, ...FISICOS, ...APOIOS, ...MOTOR };
/** ids pedidos pelos dados que ainda não têm animação (deve ser sempre vazio) */
export const animsFaltando = (): string[] => [...ANIMS_USADAS, ...ANIMS_MOTOR].filter((id) => !ANIMS[id]);
