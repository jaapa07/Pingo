/**
 * CAPTURA E CRIAÇÃO — regras puras (sem DOM; roda em Node e nos testes):
 *  - Pelagem Rara (spec 10A-5): 1 chance em 4096 por encontro selvagem.
 *  - Item segurado de selvagens (spec 10A-9): 5% um fruto do tipo, 1% um achado raro.
 *  - Cuias artesanais (spec 10A-6): o bônus de cada uma na fórmula de captura (docs/BATALHA.md).
 *  - Obediência (spec 10A-12/13): criatura de outro treinador acima do limite das insígnias pode desobedecer.
 * Todo acaso passa por `rng`.
 */
import type { CriaturaInst, EspecieDef, TipoId } from '../core/tipos';
import { rng } from '../core/rng';
import { especie, temEspecie } from './criatura';

/* ------------------------------ Pelagem Rara ------------------------------ */
export const CHANCE_RARA = 1 / 4096;
/** sorteia a Pelagem Rara (1 em 4096) */
export const sortearRara = (): boolean => rng.int(0, 4095) === 0;

/* ------------------------------ item segurado de selvagens ------------------------------ */
/** fruto que a espécie costuma carregar (5%), pelo tipo principal */
const FRUTO_DO_TIPO: Record<TipoId, string> = {
  comum: 'caju', mata: 'jabuticaba', brasa: 'pitanga', rio: 'acai', trovao: 'pequi', geada: 'buriti', ginga: 'caju', veneno: 'jabuticaba', terra: 'pequi',
  vento: 'acerola', mente: 'acerola', inseto: 'cupuacu', pedra: 'pequi', assombro: 'cupuacu', lenda: 'acai', ferro: 'pequi', encanto: 'acerola',
};
/** achado raro (1%), pelo tipo principal */
const ACHADO_DO_TIPO: Record<TipoId, string> = {
  comum: 'pena-colorida', mata: 'folha-ancestral', brasa: 'pedra-solar', rio: 'concha-rara', trovao: 'pedra-solar', geada: 'pedra-mare', ginga: 'pedra-solar', veneno: 'pedra-lunar',
  terra: 'pepita', vento: 'pena-colorida', mente: 'pedra-lunar', inseto: 'folha-ancestral', pedra: 'pepita', assombro: 'pedra-lunar', lenda: 'concha-rara', ferro: 'engrenagem-velha', encanto: 'pedra-lunar',
};
/** item que uma criatura selvagem desta espécie traz consigo (ou nada): 1% achado raro, 5% fruto */
export function itemSelvagem(e: EspecieDef): string | undefined {
  const r = rng.f(), t = e.tipos[0];
  return r < 0.01 ? ACHADO_DO_TIPO[t] : r < 0.06 ? FRUTO_DO_TIPO[t] : undefined;
}
/** prepara uma criatura selvagem recém-criada: Pelagem Rara e item segurado */
export function prepararSelvagem(c: CriaturaInst): CriaturaInst {
  if (sortearRara()) c.rara = true;
  if (!c.item && temEspecie(c.especie)) { const it = itemSelvagem(especie(c.especie)); if (it) c.item = it; }
  return c;
}

/* ------------------------------ cuias artesanais ------------------------------ */
export type CuiaArtesanal = 'ligeira' | 'pesada' | 'lua' | 'amiga' | 'isca' | 'nivel' | 'amor';
export interface ContextoCuia {
  alvo: CriaturaInst;
  /** a criatura do jogador em campo */
  minha?: CriaturaInst | null;
  /** o encontro veio da pesca */
  pescada?: boolean;
}
/** a espécie (ou alguém da sua linha adiante) evolui com pedra/objeto, ou só à noite? (Cuia da Lua) */
function evoluiComLua(num: number, visto = new Set<number>()): boolean {
  if (visto.has(num) || !temEspecie(num)) return false;
  visto.add(num);
  return (especie(num).evolui ?? []).some((ev) => !!ev.item || ev.periodo === 'noite' || evoluiComLua(ev.para, visto));
}
/**
 * Multiplicador da cuia artesanal (entra no lugar de `bônusCuia` da fórmula):
 *  ligeira ×4 em quem tem Velocidade base ≥ 100 · pesada ×1,5/×2,5/×4 a partir de 10/100/300 kg ·
 *  lua ×4 em quem evolui com pedra/objeto ou à noite · amiga ×1 (chega com amizade 220) · isca ×3 se veio da pesca ·
 *  nível ×2/×4/×8 se a sua criatura tem nível maior / o dobro / o quádruplo · amor ×8 na mesma espécie de sexo oposto.
 */
export function bonusArtesanal(tipo: CuiaArtesanal, ctx: ContextoCuia): number {
  const a = ctx.alvo, e = temEspecie(a.especie) ? especie(a.especie) : null;
  switch (tipo) {
    case 'ligeira': return e && e.base.vel >= 100 ? 4 : 1;
    case 'pesada': { const p = e?.peso ?? 0; return p >= 300 ? 4 : p >= 100 ? 2.5 : p >= 10 ? 1.5 : 1; }
    case 'lua': return evoluiComLua(a.especie) ? 4 : 1;
    case 'amiga': return 1;
    case 'isca': return ctx.pescada ? 3 : 1;
    case 'nivel': { const m = ctx.minha?.nivel ?? 0; return m >= a.nivel * 4 ? 8 : m >= a.nivel * 2 ? 4 : m > a.nivel ? 2 : 1; }
    case 'amor': { const m = ctx.minha; return m && m.especie === a.especie && m.sexo && a.sexo && m.sexo !== a.sexo ? 8 : 1; }
  }
}
/** amizade com que a criatura chega, conforme a cuia artesanal */
export const AMIZADE_CUIA_AMIGA = 220;

/* ------------------------------ obediência ------------------------------ */
/** nível máximo que uma criatura de outro treinador obedece: 20 · 30 (2 insígnias) · 50 (4) · 70 (6) · todas (8, a Liga) */
export function limiteObediencia(insignias: number): number {
  return insignias >= 8 ? Infinity : insignias >= 6 ? 70 : insignias >= 4 ? 50 : insignias >= 2 ? 30 : 20;
}
/** a criatura veio de outro treinador (troca)? Presentes de história (sem treinador original) e capturas próprias obedecem. */
export const deOutroTreinador = (c: CriaturaInst, dono: string): boolean => !!c.treinadorOriginal && c.treinadorOriginal !== dono;
/** chance de obedecer a uma ordem: 1 até o limite; acima dele, limite ÷ nível */
export function chanceObedecer(c: CriaturaInst, dono: string, limite: number): number {
  if (!deOutroTreinador(c, dono) || c.nivel <= limite) return 1;
  return Math.max(0, Math.min(1, limite / c.nivel));
}
