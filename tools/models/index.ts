/** Registro de todos os modelos. Cada lote/pasta é de um dono diferente (ver docs/MOTOR.md). */
import type { PixModel } from '../render/types';
import { tamanduiTeste } from './teste/tamandui';
import { modelos as c1 } from './criaturas/lote-001-012';
import { modelos as c2 } from './criaturas/lote-013-036';
import { modelos as c3 } from './criaturas/lote-037-060';
import { modelos as c4 } from './criaturas/lote-061-084';
import { modelos as c5 } from './criaturas/lote-085-108';
import { modelos as c6 } from './criaturas/lote-109-132';
import { modelos as c7 } from './criaturas/lote-133-156';
import { modelos as c8 } from './criaturas/lote-157-180';
import { modelos as pessoas } from './pessoas/index';
import { modelos as objetos } from './objetos/index';
import { modelos as fx } from './fx/index';
import { modelos as cenario } from '../scenery/index';

export const MODELOS: PixModel[] = [tamanduiTeste, ...c1, ...c2, ...c3, ...c4, ...c5, ...c6, ...c7, ...c8, ...pessoas, ...objetos, ...fx, ...cenario];
