/** As 180 espécies do Diário de Campo (tabela 6.4 do spec), reunidas das três partes. */
import type { EspecieDef } from '../core/tipos';
import { especies as p1 } from './criaturas/parte-001-060';
import { especies as p2 } from './criaturas/parte-061-120';
import { especies as p3 } from './criaturas/parte-121-180';
export const ESPECIES: EspecieDef[] = [...p1, ...p2, ...p3];
export const especiePorNum = (n: number) => ESPECIES.find((e) => e.num === n);
