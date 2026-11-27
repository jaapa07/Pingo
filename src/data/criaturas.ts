/** As 180 espécies do Diário de Campo (tabela 6.4 do spec), reunidas das três partes. */
import type { EspecieDef } from '../core/tipos';
import { especies as p1 } from './criaturas/parte-001-060';
import { especies as p2 } from './criaturas/parte-061-120';
import { especies as p3 } from './criaturas/parte-121-180';
import { especies as visitantes } from './criaturas/parte-181-182';
import { nomesFixos } from '../i18n';
export const ESPECIES: EspecieDef[] = [...p1, ...p2, ...p3];
/** Visitantes do pós-jogo (181-182, seção 6.5 do spec): fora das 180 do Diário, numa página à parte. */
export const VISITANTES: EspecieDef[] = [...visitantes];
// os nomes das criaturas não se traduzem (lista de textos sem tradução, só em desenvolvimento)
nomesFixos([...ESPECIES, ...VISITANTES].map((e) => e.nome));
export const especiePorNum = (n: number) => ESPECIES.find((e) => e.num === n) ?? VISITANTES.find((e) => e.num === n);
