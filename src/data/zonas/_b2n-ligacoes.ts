/**
 * Ligações do time B2-norte com zonas de outros times (coordenadas de chegada nas zonas DELES).
 * Contrato em docs/HISTORIA.md ("Ligações entre times"). Quando o time B2-sul publicar as saídas de B7 e B-R4, só
 * estes números mudam; as nossas chegadas (no lado de cá) ficam fixas:
 *   B-LG (24..25, 42) 'n' · B-SG (6..7, 38) 'n' · B-R5 (1, 16..17) 'l' · PP (34, 52) 'n' (e (6, 52) vindo de A-MT).
 */
/** tile de B7 onde se chega vindo de B-R5 (B7 sai pela borda norte, (24..25, 0)) */
export const B7_PARA_BR5: [number, number] = [24, 1];
/** tile de B7 onde se chega vindo de B-SG (B7 sai pela borda oeste, (0, 19..20)) */
export const B7_PARA_BSG: [number, number] = [1, 19];
/** tile de B7 onde se chega vindo de B-LG (B7 sai pela borda leste, (49, 19..20)) */
export const B7_PARA_BLG: [number, number] = [48, 19];
/** tile de B-R4 onde se chega descendo do Pico (docs/HISTORIA.md) */
export const BR4_PARA_PP: [number, number] = [24, 3];
/** tile de A-MT onde se chega descendo do Pico (docs/HISTORIA.md) */
export const AMT_PARA_PP: [number, number] = [20, 3];
