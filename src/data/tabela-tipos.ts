/** Tabela de eficácia 17×17 — exatamente a do spec 6.1. Dono: time de batalha. */
import { TIPOS, type TipoId } from '../core/tipos';

/** atacante → [fortes ×2, fracos ×0,5, nulos ×0] */
const REGRAS: Record<TipoId, [TipoId[], TipoId[], TipoId[]]> = {
  comum: [[], ['pedra', 'ferro'], ['assombro']],
  mata: [['rio', 'terra', 'pedra'], ['brasa', 'mata', 'veneno', 'vento', 'inseto', 'lenda', 'ferro'], []],
  brasa: [['mata', 'geada', 'inseto', 'ferro'], ['brasa', 'rio', 'pedra', 'lenda'], []],
  rio: [['brasa', 'terra', 'pedra'], ['rio', 'mata', 'lenda'], []],
  trovao: [['rio', 'vento'], ['trovao', 'mata', 'lenda'], ['terra']],
  geada: [['mata', 'terra', 'vento', 'lenda'], ['brasa', 'rio', 'geada', 'ferro'], []],
  ginga: [['comum', 'geada', 'pedra', 'ferro'], ['veneno', 'vento', 'mente', 'inseto', 'encanto'], ['assombro']],
  veneno: [['mata', 'encanto'], ['veneno', 'terra', 'pedra', 'assombro'], ['ferro']],
  terra: [['brasa', 'trovao', 'veneno', 'pedra', 'ferro'], ['mata', 'inseto'], ['vento']],
  vento: [['mata', 'ginga', 'inseto'], ['trovao', 'pedra', 'ferro'], []],
  mente: [['ginga', 'veneno'], ['mente', 'ferro', 'assombro'], []],
  inseto: [['mata', 'mente'], ['brasa', 'ginga', 'veneno', 'vento', 'assombro', 'ferro', 'encanto'], []],
  pedra: [['brasa', 'geada', 'vento', 'inseto'], ['ginga', 'terra', 'ferro'], []],
  assombro: [['mente', 'assombro'], ['encanto'], ['comum']],
  lenda: [['lenda'], ['ferro'], ['encanto']],
  ferro: [['geada', 'pedra', 'encanto'], ['brasa', 'rio', 'trovao', 'ferro'], []],
  encanto: [['ginga', 'lenda', 'assombro'], ['brasa', 'veneno', 'ferro'], []],
};

/** TABELA[atacante][defensor] = 0 | 0.5 | 1 | 2 */
export const TABELA: Record<TipoId, Record<TipoId, number>> = Object.fromEntries(
  TIPOS.map((a) => [a, Object.fromEntries(TIPOS.map((d) => {
    const [f, fr, n] = REGRAS[a];
    return [d, n.includes(d) ? 0 : f.includes(d) ? 2 : fr.includes(d) ? 0.5 : 1];
  }))]),
) as Record<TipoId, Record<TipoId, number>>;

/** multiplicador de um tipo de golpe contra um tipo defensor */
export const eficacia = (atq: TipoId, def: TipoId): number => TABELA[atq][def];
/** multiplicador contra uma criatura de um ou dois tipos (os multiplicadores se multiplicam) */
export const eficaciaContra = (atq: TipoId, tipos: readonly TipoId[]): number => tipos.reduce((m, d) => m * TABELA[atq][d], 1);

export const NOME_TIPO: Record<TipoId, string> = {
  comum: 'Comum', mata: 'Mata', brasa: 'Brasa', rio: 'Rio', trovao: 'Trovão', geada: 'Geada', ginga: 'Ginga', veneno: 'Veneno', terra: 'Terra',
  vento: 'Vento', mente: 'Mente', inseto: 'Inseto', pedra: 'Pedra', assombro: 'Assombro', lenda: 'Lenda', ferro: 'Ferro', encanto: 'Encanto',
};
