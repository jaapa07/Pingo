/**
 * Efeitos sonoros do Adventures of Pingo: presets autorais em camadas (osciladores, ruído, FM, sequências de notas e vozes),
 * tocados por `src/audio/sfxEngine.ts`. A base é de portátil clássico (onda quadrada/triângulo/ruído) com acabamento moderno.
 */
import type { CorRuido } from '../audio/core';

export interface Filt { t: BiquadFilterType; f: number; f2?: number; q?: number }

interface Base {
  vol: number;
  /** duração da camada (em `notas`: queda de cada nota) */
  dur: number;
  at?: number;
  sus?: boolean;
  /** atraso de início (s) */
  ini?: number;
  /** repetições [quantas, intervalo s] */
  rep?: [number, number];
  pan?: number;
  /** tremolo quadrado [Hz, profundidade 0–1] */
  trem?: [number, number];
  filt?: Filt;
}
export type Camada =
  | (Base & { k: 'osc'; onda: OscillatorType; f: number; f2?: number; lin?: boolean; vib?: [number, number]; dist?: number })
  | (Base & { k: 'ruido'; cor?: CorRuido; f0?: number })
  | (Base & { k: 'fm'; onda?: OscillatorType; f: number; f2?: number; razao: number; ind: number; ind2?: number })
  | (Base & { k: 'notas'; onda: OscillatorType; base: number; seq: (number | null)[]; passo: number })
  | (Base & { k: 'voz'; onda?: OscillatorType; f: number; f2?: number; vib?: [number, number]; formante?: number; vogais: string; aspero?: number });

export interface Sfx { c: Camada[]; vol?: number; rev?: number; var?: number }

type Extra = Partial<Base> & { lin?: boolean; vib?: [number, number]; dist?: number };
const Q: OscillatorType = 'square';
const T: OscillatorType = 'triangle';
const S: OscillatorType = 'sine';
const W: OscillatorType = 'sawtooth';
/** oscilador: onda, de→até (Hz; 0 = fixo), duração, volume */
const o = (onda: OscillatorType, f: number, f2: number, dur: number, vol: number, x: Extra = {}): Camada => ({ k: 'osc', onda, f, f2: f2 || undefined, dur, vol, ...x });
/** ruído filtrado */
const r = (cor: CorRuido, filt: Filt, dur: number, vol: number, x: Partial<Base> & { f0?: number } = {}): Camada => ({ k: 'ruido', cor, filt, dur, vol, ...x });
const fm = (f: number, f2: number, razao: number, ind: number, dur: number, vol: number, x: Partial<Base> & { ind2?: number; onda?: OscillatorType } = {}): Camada => ({ k: 'fm', f, f2: f2 || undefined, razao, ind, dur, vol, ...x });
/** sequência de notas (semitons a partir de `base` MIDI) */
const nt = (onda: OscillatorType, base: number, seq: (number | null)[], passo: number, dur: number, vol: number, x: Partial<Base> = {}): Camada => ({ k: 'notas', onda, base, seq, passo, dur, vol, ...x });
const vz = (f: number, f2: number, vogais: string, dur: number, vol: number, x: Partial<Base> & { formante?: number; aspero?: number; vib?: [number, number]; onda?: OscillatorType } = {}): Camada => ({ k: 'voz', f, f2: f2 || undefined, vogais, dur, vol, ...x });
const bp = (f: number, q = 1, f2?: number): Filt => ({ t: 'bandpass', f, q, f2 });
const lp = (f: number, q = 0.7, f2?: number): Filt => ({ t: 'lowpass', f, q, f2 });
const hp = (f: number, q = 0.7, f2?: number): Filt => ({ t: 'highpass', f, q, f2 });

export const SFX: Record<string, Sfx> = {
  // ------------------------------------------------------------------ interface
  'ui-mover': { c: [o(Q, 1180, 0, 0.035, 0.16), o(T, 590, 0, 0.03, 0.12)], var: 0.02 },
  'ui-ok': { c: [nt(Q, 79, [0, 5], 0.055, 0.09, 0.17), o(T, 1568, 0, 0.12, 0.08, { ini: 0.055 })] },
  'ui-voltar': { c: [nt(Q, 74, [0, -5], 0.05, 0.08, 0.16)] },
  'ui-erro': { c: [o(Q, 147, 0, 0.09, 0.2), o(Q, 139, 0, 0.14, 0.2, { ini: 0.11 }), r('branco', lp(900), 0.05, 0.08)] },
  'ui-abrir': { c: [nt(T, 72, [0, 4, 7, 12], 0.028, 0.07, 0.24), r('branco', hp(5000), 0.05, 0.03)] },
  'ui-fechar': { c: [nt(T, 72, [12, 7, 4, 0], 0.028, 0.07, 0.22)] },
  'ui-aba': { c: [o(Q, 698, 1047, 0.05, 0.14), r('branco', bp(3000, 2), 0.03, 0.04)] },
  'ui-confirmar': { c: [nt(Q, 72, [0, 4, 7, 12, 16], 0.045, 0.12, 0.15), nt(T, 60, [0, null, 7, null, 12], 0.045, 0.14, 0.16)], rev: 0.15 },
  'ui-negar': { c: [nt(Q, 62, [0, -1], 0.08, 0.1, 0.17)] },
  'ui-pausa': { c: [nt(Q, 81, [0, -5, 0], 0.06, 0.08, 0.15)] },
  'ui-digitar': { c: [o(Q, 1480, 0, 0.022, 0.12), r('branco', hp(4000), 0.012, 0.05)], var: 0.05 },
  'ui-apagar': { c: [o(Q, 520, 310, 0.05, 0.14)] },
  'ui-limite': { c: [o(T, 220, 180, 0.05, 0.22)] },
  'ui-pagina': { c: [r('branco', bp(2400, 1.2, 5200), 0.09, 0.1), o(T, 900, 1300, 0.04, 0.06, { ini: 0.05 })] },
  'ui-alternar': { c: [nt(Q, 84, [0, 3], 0.03, 0.04, 0.13)] },
  'texto': { c: [o(Q, 1240, 0, 0.016, 0.085)], var: 0.07 },
  'texto-fim': { c: [o(T, 1560, 1170, 0.06, 0.16)] },
  'salvar': { c: [nt(T, 67, [0, 5, 9, 12, null, 17], 0.07, 0.2, 0.22), nt(Q, 79, [null, null, null, 0, null, 5], 0.07, 0.16, 0.07), r('branco', hp(6000), 0.3, 0.02, { ini: 0.3 })], rev: 0.3 },

  // ------------------------------------------------------------------ passos
  'passo-grama': { c: [r('branco', bp(3400, 0.9, 2200), 0.07, 0.11), r('rosa', lp(500), 0.04, 0.08)], var: 0.12 },
  'passo-grama-alta': { c: [r('branco', bp(4200, 0.8, 1800), 0.13, 0.14), r('branco', hp(6000), 0.05, 0.05, { ini: 0.04 })], var: 0.12 },
  'passo-terra': { c: [r('rosa', lp(900, 0.8), 0.06, 0.2), o(S, 110, 70, 0.04, 0.1)], var: 0.1 },
  'passo-madeira': { c: [o(T, 215, 150, 0.05, 0.2), r('rosa', bp(700, 2), 0.035, 0.16)], var: 0.08 },
  'passo-agua': { c: [r('branco', bp(1300, 1.4, 2800), 0.12, 0.14), o(S, 420, 900, 0.07, 0.08, { ini: 0.02 })], var: 0.12 },
  'passo-areia': { c: [r('branco', bp(2200, 0.6, 1200), 0.1, 0.12)], var: 0.12 },
  'passo-pedra': { c: [o(Q, 310, 0, 0.012, 0.09), r('branco', bp(1700, 2), 0.035, 0.15)], var: 0.08 },
  'passo-neve': { c: [r('branco', bp(900, 2.5, 1500), 0.1, 0.16), r('branco', hp(5000), 0.04, 0.03)], var: 0.1 },
  'passo-lama': { c: [r('marrom', lp(700), 0.1, 0.3), o(S, 190, 330, 0.06, 0.07, { ini: 0.05 })], var: 0.12 },
  'passo-ponte': { c: [o(T, 170, 130, 0.07, 0.2), r('rosa', bp(500, 3), 0.05, 0.14), o(S, 760, 0, 0.03, 0.03, { ini: 0.04 })], var: 0.1 },
  'passo-metal': { c: [fm(520, 0, 2.71, 2, 0.08, 0.1), r('branco', bp(2600, 3), 0.025, 0.1)], var: 0.06 },
  'passo-gelo': { c: [r('branco', hp(4500, 0.7, 7500), 0.16, 0.07), o(S, 1900, 2300, 0.14, 0.03)], var: 0.08 },

  // ------------------------------------------------------------------ mundo
  'porta': { c: [o(T, 180, 120, 0.06, 0.2), r('rosa', bp(600, 1.5), 0.05, 0.16), o(Q, 620, 0, 0.02, 0.06, { ini: 0.09 }), r('marrom', lp(400), 0.12, 0.2, { ini: 0.1 })] },
  'porta-fechar': { c: [r('marrom', lp(500), 0.1, 0.3), o(T, 140, 90, 0.07, 0.22), o(Q, 480, 0, 0.015, 0.05, { ini: 0.02 })] },
  'porta-correr': { c: [r('branco', bp(1800, 1, 3600), 0.22, 0.08), nt(S, 84, [0, 4], 0.11, 0.2, 0.1, { ini: 0.04 })] },
  'escada': { c: [o(T, 240, 180, 0.04, 0.16, { rep: [4, 0.085] }), r('rosa', bp(800, 2), 0.03, 0.1, { rep: [4, 0.085] })] },
  'pulo-saliencia': { c: [o(Q, 330, 880, 0.13, 0.13), o(T, 165, 440, 0.13, 0.14), r('rosa', lp(700), 0.06, 0.2, { ini: 0.24 }), o(S, 120, 60, 0.07, 0.2, { ini: 0.24 })] },
  'batida': { c: [o(T, 150, 95, 0.07, 0.3), r('rosa', lp(600), 0.05, 0.16)] },
  'bau': { c: [o(T, 160, 240, 0.09, 0.16), r('rosa', bp(900, 1.5), 0.08, 0.1), nt(Q, 76, [0, 4, 7], 0.05, 0.12, 0.12, { ini: 0.12 })] },
  'placa': { c: [o(T, 420, 0, 0.03, 0.14), o(T, 330, 0, 0.04, 0.14, { ini: 0.05 })] },
  'sacudir-arvore': { c: [r('branco', bp(3800, 0.7, 2200), 0.09, 0.14, { rep: [4, 0.1] }), o(T, 120, 90, 0.05, 0.14, { rep: [2, 0.2] })] },
  'fruta-cair': { c: [o(S, 880, 300, 0.16, 0.12), r('rosa', lp(800), 0.05, 0.2, { ini: 0.17 })] },
  'pesca-lancar': { c: [r('branco', bp(2500, 3, 6000), 0.2, 0.08), o(S, 500, 1100, 0.06, 0.12, { ini: 0.3 }), r('branco', bp(1500, 1.5), 0.1, 0.1, { ini: 0.3 })] },
  'pesca-fisgada': { c: [nt(Q, 88, [0, 0, 0], 0.07, 0.05, 0.16), r('branco', bp(1700, 1.4, 3000), 0.2, 0.1)] },
  'pesca-puxar': { c: [r('branco', bp(1200, 1.2, 3600), 0.3, 0.16), o(S, 300, 950, 0.22, 0.1), nt(Q, 76, [0, 7, 12], 0.05, 0.1, 0.1, { ini: 0.22 })] },
  'bike-sino': { c: [fm(2100, 0, 1.41, 1.2, 0.3, 0.12), fm(2100, 0, 1.41, 1.2, 0.4, 0.12, { ini: 0.12 })], rev: 0.15 },
  'pc-ligar': { c: [nt(Q, 72, [0, 7, 12, 19], 0.06, 0.07, 0.13), o(S, 60, 0, 0.3, 0.05, { sus: true })] },
  'pc-desligar': { c: [nt(Q, 72, [19, 12, 7, 0], 0.06, 0.07, 0.13)] },
  'telefone': { c: [o(Q, 1320, 0, 0.05, 0.1, { rep: [5, 0.07], trem: [28, 0.8] }), o(Q, 1760, 0, 0.05, 0.07, { rep: [5, 0.07], ini: 0.035 })] },
  'relogio': { c: [o(Q, 2400, 0, 0.012, 0.08), o(Q, 1900, 0, 0.012, 0.07, { ini: 0.5 })] },
  'exclamacao': { c: [nt(Q, 83, [0, 5], 0.045, 0.1, 0.18), o(T, 494, 988, 0.08, 0.14)] },
  'interrogacao': { c: [nt(T, 79, [0, -2, 3], 0.07, 0.1, 0.2)] },
  'emote-coracao': { c: [nt(S, 84, [0, 4, 7, 4, 12], 0.06, 0.14, 0.18)], rev: 0.2 },
  'emote-raiva': { c: [o(W, 180, 120, 0.1, 0.1, { filt: lp(1200), rep: [2, 0.13] }), r('rosa', bp(700, 1), 0.08, 0.1, { rep: [2, 0.13] })] },
  'emote-zzz': { c: [o(T, 300, 180, 0.3, 0.14, { rep: [2, 0.5] }), r('rosa', bp(600, 1), 0.3, 0.05, { rep: [2, 0.5] })] },
  'emote-nota': { c: [nt(T, 76, [0, 4, 7, 12, 9, 12], 0.08, 0.14, 0.18)] },
  'dinheiro': { c: [nt(Q, 91, [0, 5], 0.05, 0.16, 0.12), fm(3100, 0, 1.5, 0.8, 0.2, 0.06)] },
  'compra': { c: [fm(2600, 0, 2.2, 1, 0.12, 0.1), nt(Q, 84, [null, 0, 7, 12], 0.05, 0.12, 0.12), r('branco', bp(4000, 2), 0.04, 0.06)] },
  'item-obtido': { c: [nt(Q, 72, [0, 4, 7, 12, null, 7, 12, 16], 0.06, 0.14, 0.14), nt(T, 60, [0, null, 7, null, null, 4, null, 12], 0.06, 0.2, 0.18)], rev: 0.2 },
  'item-raro': { c: [nt(Q, 74, [0, 4, 7, 11, 12, 16, 19, 24], 0.07, 0.2, 0.13), nt(T, 62, [0, 7, 12, 7, 16, 12, 19, 24], 0.07, 0.24, 0.17), fm(3200, 0, 1.4, 0.6, 0.6, 0.04, { ini: 0.5 })], rev: 0.35 },
  'amuleto-obtido': { c: [nt(Q, 67, [0, 5, 7, 12, 14, 19, null, 24], 0.085, 0.24, 0.13), nt(T, 55, [0, null, 7, null, 14, null, null, 12], 0.085, 0.3, 0.2), nt(S, 91, [null, null, null, null, null, null, 0, 5], 0.085, 0.4, 0.08)], rev: 0.4 },
  'insignia': { c: [nt(Q, 72, [0, 0, 0, 4, null, 2, 4, null, 7, null, null, 12], 0.075, 0.2, 0.13), nt(T, 60, [0, null, 0, null, 5, null, 7, null, 4, null, null, 12], 0.075, 0.26, 0.2), nt(Q, 76, [null, null, null, 3, null, null, 3, null, 3, null, null, 4], 0.075, 0.2, 0.07), r('branco', hp(7000), 0.5, 0.025, { ini: 0.82 })], rev: 0.4 },
  'diario-registro': { c: [nt(T, 79, [0, 2, 4, 7, 9, 12], 0.04, 0.08, 0.2), r('branco', bp(2600, 1.2, 4800), 0.1, 0.07)] },
  'foto': { c: [r('branco', hp(3000), 0.03, 0.2), o(Q, 2200, 0, 0.01, 0.1), r('branco', bp(1800, 2), 0.06, 0.14, { ini: 0.07 })] },
  'conquista': { c: [nt(Q, 76, [0, 3, 7, 12, 15, 19], 0.05, 0.16, 0.13), nt(S, 88, [null, null, null, null, null, 0, 7], 0.05, 0.5, 0.1)], rev: 0.4 },
  'repelente': { c: [r('branco', hp(3500, 0.7, 6500), 0.35, 0.12), o(S, 1800, 2600, 0.3, 0.03)] },
  'repelente-fim': { c: [nt(T, 76, [0, -3, -7], 0.09, 0.12, 0.18)] },
  'lampiao': { c: [r('branco', bp(2000, 1, 5000), 0.08, 0.1), o(T, 440, 880, 0.2, 0.12, { ini: 0.05 }), nt(S, 88, [0, 7], 0.08, 0.3, 0.08, { ini: 0.1 })], rev: 0.3 },
  'faro': { c: [r('rosa', bp(900, 2, 1800), 0.09, 0.14, { rep: [3, 0.13] }), nt(T, 81, [null, null, null, 0, 5], 0.1, 0.12, 0.14)] },
  'tremor': { c: [r('marrom', lp(220), 0.9, 0.7, { sus: true, trem: [14, 0.6] }), o(S, 48, 38, 0.9, 0.3, { sus: true })] },
  'queda': { c: [o(Q, 900, 140, 0.4, 0.12), o(T, 450, 70, 0.4, 0.14), r('rosa', lp(600), 0.1, 0.3, { ini: 0.42 }), o(S, 90, 45, 0.12, 0.3, { ini: 0.42 })] },
  'gelo-deslize': { c: [r('branco', bp(5200, 1.5, 3000), 0.3, 0.07), o(S, 2400, 1700, 0.3, 0.03)] },
  'correnteza': { c: [r('branco', bp(900, 0.8, 2000), 0.45, 0.18, { at: 0.08 }), r('marrom', lp(400), 0.45, 0.2, { at: 0.08 })] },
  'warp': { c: [o(T, 300, 1800, 0.35, 0.12, { vib: [18, 0.6] }), o(Q, 150, 900, 0.35, 0.06), r('branco', hp(5000), 0.25, 0.04, { ini: 0.15 })], rev: 0.4 },
  'ovo-rachar': { c: [r('branco', bp(2800, 3), 0.025, 0.2, { rep: [3, 0.11] }), o(Q, 700, 500, 0.02, 0.08, { rep: [3, 0.11] })] },
  'ovo-nascer': { c: [r('branco', bp(2400, 1.5), 0.08, 0.2), nt(Q, 72, [0, 4, 7, 12, 16, 19, 24], 0.055, 0.16, 0.13, { ini: 0.1 }), nt(T, 60, [0, 7, 12, 16], 0.11, 0.3, 0.18, { ini: 0.1 })], rev: 0.35 },
  'curar-tom': { c: [nt(S, 76, [0, 4, 7], 0.09, 0.3, 0.2)], rev: 0.3 },
  'cura-posto': { c: [nt(Q, 76, [0, null, 0, null, 0, 4, 7, null, 12], 0.11, 0.2, 0.11), nt(T, 64, [0, null, -5, null, 0, null, 7, null, 12], 0.11, 0.28, 0.2), nt(S, 88, [null, null, null, null, null, null, null, 0, 7], 0.11, 0.5, 0.08)], rev: 0.35 },
  'sino-igreja': { c: [fm(392, 0, 2.76, 2.2, 2.2, 0.18, { ind2: 0.3 }), o(S, 196, 0, 1.8, 0.08)], rev: 0.6 },
  'galo': { c: [vz(520, 760, 'oeio', 0.5, 0.2, { formante: 1.5, aspero: 0.2, onda: Q }), vz(760, 420, 'oou', 0.5, 0.2, { ini: 0.5, formante: 1.5, aspero: 0.2, onda: Q, vib: [9, 0.5] })], rev: 0.4 },
  'fogueira': { c: [r('rosa', bp(1200, 0.6), 0.5, 0.1, { sus: true }), r('branco', hp(4000), 0.012, 0.14, { rep: [5, 0.093] }), r('branco', bp(2400, 4), 0.02, 0.12, { ini: 0.05, rep: [3, 0.161] })] },
  'vento': { c: [r('rosa', bp(500, 1.6, 1100), 0.9, 0.26, { at: 0.35 }), r('branco', bp(2400, 2, 1500), 0.9, 0.05, { at: 0.4 })] },
  'onda-praia': { c: [r('rosa', lp(900, 0.6, 2400), 1.1, 0.3, { at: 0.5 }), r('branco', hp(3500), 0.9, 0.06, { ini: 0.6, at: 0.2 })] },
  'chuva': { c: [r('branco', hp(2400, 0.5), 1.4, 0.1, { sus: true, at: 0.15 }), r('rosa', bp(900, 0.5), 1.4, 0.1, { sus: true, at: 0.15 }), o(S, 2400, 1500, 0.03, 0.04, { rep: [6, 0.21], ini: 0.1 })] },
  'trovao': { c: [r('branco', lp(3000, 0.7, 300), 0.12, 0.5), r('marrom', lp(260), 1.8, 0.9, { ini: 0.06, trem: [9, 0.35] }), o(S, 70, 32, 1.4, 0.4, { ini: 0.06 })], rev: 0.6 },
  'radio': { c: [r('branco', bp(2200, 3, 900), 0.22, 0.1), o(S, 600, 2800, 0.14, 0.05, { vib: [30, 2] }), o(S, 2800, 1100, 0.1, 0.05, { ini: 0.14 }), nt(Q, 79, [null, null, null, 0, 4, 7], 0.07, 0.07, 0.08, { filt: bp(1800, 2) })] },
  'radio-chiado': { c: [r('branco', bp(1800, 1.5, 2600), 0.5, 0.12, { sus: true, trem: [17, 0.4] }), o(S, 1200, 1900, 0.5, 0.025, { vib: [11, 3] })] },

  // ------------------------------------------------------------------ amuletos e transportes
  'facao': { c: [r('branco', bp(3200, 2.5, 7500), 0.11, 0.2), o(W, 1600, 500, 0.07, 0.05, { filt: hp(1500) }), r('branco', bp(2200, 0.8, 1200), 0.16, 0.16, { ini: 0.1 }), o(T, 150, 100, 0.05, 0.14, { ini: 0.1 })] },
  'remo': { c: [r('branco', bp(900, 1.2, 2200), 0.22, 0.18), o(S, 320, 640, 0.1, 0.08, { ini: 0.05 }), r('marrom', lp(420), 0.3, 0.26, { ini: 0.05 }), o(T, 130, 105, 0.05, 0.1)] },
  'empurrar': { c: [r('marrom', lp(340, 1.2), 0.45, 0.7, { sus: true, trem: [22, 0.5] }), r('rosa', bp(900, 2), 0.4, 0.08, { sus: true }), o(S, 80, 60, 0.12, 0.3, { ini: 0.42 })] },
  'quebrar': { c: [r('branco', lp(4000, 0.7, 500), 0.2, 0.4), o(T, 130, 60, 0.12, 0.4), r('branco', bp(2400, 3), 0.03, 0.2, { ini: 0.12, rep: [4, 0.065] }), o(Q, 480, 240, 0.03, 0.08, { ini: 0.12, rep: [3, 0.09] })] },
  'escalar': { c: [r('rosa', bp(1500, 2), 0.05, 0.2, { rep: [3, 0.16] }), o(T, 190, 250, 0.06, 0.16, { rep: [3, 0.16] }), r('branco', bp(3000, 1), 0.07, 0.06, { ini: 0.08, rep: [3, 0.16] })] },
  'cachoeira': { c: [r('branco', bp(1400, 0.5, 2600), 1.0, 0.3, { at: 0.2, sus: true }), r('marrom', lp(500), 1.0, 0.5, { at: 0.2, sus: true }), o(T, 180, 520, 0.9, 0.08, { at: 0.2 })], rev: 0.3 },
  'mergulho': { c: [r('branco', bp(1800, 1, 400), 0.4, 0.3), o(S, 500, 90, 0.4, 0.2), o(S, 600, 1500, 0.07, 0.1, { ini: 0.32, rep: [5, 0.09] })], rev: 0.4 },
  'emergir': { c: [o(S, 120, 620, 0.35, 0.2), r('branco', bp(500, 1, 2600), 0.4, 0.26), r('branco', hp(3000), 0.3, 0.1, { ini: 0.33 })], rev: 0.3 },
  'voo': { c: [r('rosa', bp(400, 1.5, 1400), 0.16, 0.3, { rep: [3, 0.21] }), r('branco', bp(1800, 1, 5000), 0.7, 0.1, { ini: 0.5, at: 0.3 }), o(T, 260, 780, 0.7, 0.08, { ini: 0.5, at: 0.2 })], rev: 0.3 },
  'trem': { c: [r('branco', bp(1100, 0.8), 0.09, 0.2, { rep: [8, 0.14] }), o(T, 95, 70, 0.07, 0.24, { rep: [8, 0.14] }), fm(1900, 0, 2.3, 1.5, 0.05, 0.05, { ini: 0.07, rep: [4, 0.28] })] },
  'trem-apito': { c: [o(Q, 622, 0, 0.9, 0.1, { sus: true, at: 0.05, filt: bp(1300, 1) }), o(Q, 740, 0, 0.9, 0.09, { sus: true, at: 0.05, filt: bp(1500, 1) }), r('branco', bp(2400, 1), 0.9, 0.08, { sus: true, at: 0.04 })], rev: 0.5 },
  'saveiro': { c: [o(W, 147, 0, 1.1, 0.16, { sus: true, at: 0.12, filt: lp(700, 2) }), o(W, 110, 0, 1.1, 0.14, { sus: true, at: 0.12, filt: lp(600, 2) }), r('rosa', bp(500, 1), 1.1, 0.08, { sus: true, at: 0.1 })], rev: 0.55 },
  'saveiro-sino': { c: [fm(1250, 0, 2.4, 1.6, 0.7, 0.14), fm(1250, 0, 2.4, 1.6, 0.9, 0.14, { ini: 0.32 })], rev: 0.4 },
  'vela': { c: [r('rosa', bp(600, 1, 1500), 0.3, 0.26), r('branco', bp(2400, 1), 0.07, 0.1, { ini: 0.22 })] },

  // ------------------------------------------------------------------ batalha: fluxo
  'encontro': { c: [nt(Q, 60, [0, 6, 1, 7, 2, 8, 3, 9, 4, 10, 5, 11], 0.045, 0.06, 0.15), nt(T, 48, [0, null, 6, null, 0, null, 6, null, 0, null, 6, null], 0.045, 0.08, 0.22), r('branco', hp(3000, 0.7, 9000), 0.55, 0.07)] },
  'encontro-treinador': { c: [nt(Q, 67, [0, null, 0, 3, null, 3, 6, null, 6, 7], 0.055, 0.08, 0.15), nt(T, 43, [0, 0, null, 3, 3, null, 6, 6, null, 7], 0.055, 0.08, 0.22)] },
  'lendario-aparece': { c: [o(W, 55, 41, 1.6, 0.25, { filt: lp(300, 3, 900), at: 0.4 }), fm(110, 220, 1.5, 4, 1.6, 0.12, { at: 0.5 }), r('rosa', bp(300, 1, 2000), 1.6, 0.14, { at: 0.8 }), nt(S, 81, [null, null, null, 0, 6, 12], 0.25, 0.8, 0.07)], rev: 0.7 },
  'cuia-arremesso': { c: [r('branco', bp(1400, 2, 4200), 0.24, 0.13), o(T, 360, 820, 0.24, 0.1)] },
  'cuia-abrir': { c: [o(T, 260, 520, 0.05, 0.2), r('branco', bp(2600, 1.2, 5200), 0.16, 0.14), o(Q, 900, 2600, 0.14, 0.06, { ini: 0.02 })] },
  'cuia-quique': { c: [o(T, 300, 190, 0.06, 0.24), r('rosa', bp(900, 2), 0.035, 0.14), fm(700, 0, 1.6, 1, 0.04, 0.06)], var: 0.05 },
  'cuia-balanco': { c: [o(T, 250, 190, 0.05, 0.2), o(T, 210, 260, 0.06, 0.18, { ini: 0.09 }), r('branco', bp(4300, 3), 0.03, 0.08, { rep: [2, 0.09] })] },
  'cuia-sucesso': { c: [o(Q, 1320, 0, 0.03, 0.12), r('branco', bp(3000, 3), 0.02, 0.14), nt(Q, 76, [null, null, 0, 4, 7, 12], 0.06, 0.16, 0.13), fm(2640, 0, 1.5, 0.8, 0.5, 0.05, { ini: 0.36 })], rev: 0.3 },
  'cuia-falha': { c: [r('branco', bp(2400, 1, 6000), 0.14, 0.2), o(Q, 420, 1300, 0.1, 0.1), nt(T, 70, [null, null, 0, -4], 0.07, 0.1, 0.16)] },
  'cuia-estrelas': { c: [nt(S, 91, [0, 7, 4, 12, 9, 16], 0.05, 0.2, 0.09), r('branco', hp(7000), 0.3, 0.02)], rev: 0.4 },
  'entrada-criatura': { c: [r('branco', bp(1500, 1, 5000), 0.18, 0.14), o(T, 220, 660, 0.14, 0.14), o(Q, 660, 990, 0.08, 0.07, { ini: 0.12 })] },
  'retorno-criatura': { c: [o(T, 700, 200, 0.16, 0.14), r('branco', bp(5000, 1, 1200), 0.18, 0.12), o(Q, 1400, 500, 0.12, 0.05)] },
  'troca': { c: [nt(Q, 76, [0, 5, 0, 7], 0.04, 0.05, 0.13), r('branco', bp(2400, 1.5), 0.08, 0.06)] },
  'fuga': { c: [nt(T, 72, [0, 2, 4, 5, 7, 9, 11, 12], 0.03, 0.05, 0.2), r('branco', bp(1200, 1, 3600), 0.28, 0.1)] },
  'fuga-falha': { c: [nt(T, 72, [0, 2, 4, 2, 0], 0.035, 0.05, 0.2), o(Q, 150, 120, 0.12, 0.14, { ini: 0.18 })] },
  'xp-barra': { c: [o(Q, 520, 1400, 0.5, 0.07, { lin: true, trem: [24, 0.5] })] },
  'vida-baixa': { c: [o(Q, 880, 0, 0.07, 0.11, { rep: [2, 0.16] }), o(Q, 660, 0, 0.07, 0.11, { ini: 0.08, rep: [2, 0.16] })] },
  'subir-nivel': { c: [nt(Q, 72, [0, 2, 4, 7, null, 4, 7, 12], 0.065, 0.14, 0.14), nt(T, 60, [0, null, 4, null, null, 7, null, 12], 0.065, 0.22, 0.2), nt(Q, 79, [null, null, null, null, null, null, null, 4], 0.065, 0.3, 0.07)], rev: 0.25 },
  'aprender-golpe': { c: [nt(Q, 69, [0, 3, 7, 10, 12, 15], 0.06, 0.14, 0.13), nt(T, 57, [0, null, 7, null, 12, 15], 0.06, 0.2, 0.2), r('branco', bp(2400, 1, 6000), 0.2, 0.05, { ini: 0.3 })], rev: 0.25 },
  'esquecer-golpe': { c: [nt(T, 76, [0, -1, -3, -6, -10], 0.06, 0.1, 0.2), r('branco', bp(4000, 1, 800), 0.3, 0.07)] },
  'pergaminho': { c: [r('branco', bp(2600, 1, 4600), 0.14, 0.12), r('branco', bp(3600, 1, 2000), 0.14, 0.1, { ini: 0.16 }), nt(S, 79, [null, null, null, 0, 7, 12], 0.09, 0.3, 0.14)], rev: 0.3 },
  'evolucao': { c: [nt(Q, 60, [0, 4, 7, 12, 4, 7, 12, 16, 7, 12, 16, 19, 12, 16, 19, 24], 0.055, 0.1, 0.12), o(T, 131, 1047, 0.9, 0.12, { at: 0.3 }), r('branco', hp(4000, 0.7, 9000), 0.9, 0.05, { at: 0.5 }), nt(S, 84, [0, 7, 12], 0.12, 0.8, 0.12, { ini: 0.9 })], rev: 0.5 },
  'evolucao-cancelada': { c: [o(T, 880, 160, 0.4, 0.14), nt(Q, 67, [null, null, null, 0, -1, -5], 0.1, 0.14, 0.14)] },
  'desmaio': { c: [o(Q, 620, 82, 0.55, 0.14, { filt: lp(2400) }), o(T, 310, 41, 0.55, 0.16), r('rosa', lp(500), 0.14, 0.3, { ini: 0.5 }), o(S, 80, 40, 0.14, 0.3, { ini: 0.5 })] },
  'item-usar': { c: [nt(T, 79, [0, 5, 9], 0.05, 0.09, 0.2), r('branco', bp(3400, 1.5), 0.06, 0.06)] },

  // ------------------------------------------------------------------ batalha: impactos e resultados
  'golpe-fraco': { c: [r('branco', bp(1500, 1.2), 0.06, 0.2), o(T, 240, 160, 0.05, 0.16)], var: 0.06 },
  'golpe-normal': { c: [r('branco', lp(3800, 0.7, 700), 0.09, 0.32), o(T, 190, 90, 0.08, 0.3), o(Q, 380, 120, 0.05, 0.08)], var: 0.05 },
  'golpe-forte': { c: [r('branco', lp(6000, 0.7, 500), 0.16, 0.4), o(T, 170, 55, 0.16, 0.42), o(Q, 520, 90, 0.09, 0.1), r('marrom', lp(300), 0.22, 0.4, { ini: 0.02 })], var: 0.04 },
  'critico': { c: [o(Q, 2200, 0, 0.02, 0.1), r('branco', hp(2500), 0.05, 0.28), r('branco', lp(6000, 0.7, 400), 0.2, 0.4, { ini: 0.03 }), o(T, 200, 50, 0.2, 0.42, { ini: 0.03 }), nt(Q, 96, [0, 5, 0], 0.03, 0.06, 0.07, { ini: 0.04 })] },
  'super-eficaz': { c: [nt(Q, 79, [0, 4, 9], 0.045, 0.1, 0.14), r('branco', hp(5000), 0.14, 0.05)] },
  'pouco-eficaz': { c: [nt(T, 67, [0, -2], 0.07, 0.1, 0.2), r('rosa', lp(700), 0.07, 0.12)] },
  'sem-efeito': { c: [o(T, 180, 150, 0.09, 0.2), r('rosa', bp(500, 2), 0.06, 0.08)] },
  'errou': { c: [r('branco', bp(2000, 2, 5200), 0.16, 0.12), o(S, 900, 1500, 0.14, 0.03)] },
  'atrib-sobe': { c: [nt(Q, 69, [0, 2, 4, 5, 7, 9, 11, 12, 14, 16], 0.035, 0.06, 0.11), o(T, 220, 880, 0.36, 0.1, { lin: true })] },
  'atrib-desce': { c: [nt(Q, 81, [0, -2, -4, -5, -7, -9, -11, -12, -14, -16], 0.035, 0.06, 0.11), o(T, 660, 165, 0.36, 0.1, { lin: true })] },
  'status-veneno': { c: [o(S, 300, 520, 0.07, 0.16, { rep: [4, 0.1] }), o(Q, 150, 110, 0.4, 0.07, { filt: lp(700), trem: [12, 0.8] }), r('rosa', bp(700, 3, 400), 0.4, 0.07)] },
  'status-queimadura': { c: [r('branco', bp(2600, 0.7, 900), 0.4, 0.2), r('branco', hp(5000), 0.015, 0.16, { rep: [5, 0.07] }), o(W, 180, 90, 0.35, 0.07, { filt: lp(600) })] },
  'status-paralisia': { c: [o(Q, 1900, 0, 0.3, 0.09, { trem: [43, 1] }), o(Q, 1270, 0, 0.3, 0.07, { trem: [31, 1] }), r('branco', hp(6000), 0.3, 0.05, { trem: [37, 1] })] },
  'status-sono': { c: [nt(S, 76, [0, -3, -7, -12], 0.16, 0.3, 0.2), o(T, 330, 220, 0.5, 0.07, { ini: 0.3, vib: [3, 0.4] })], rev: 0.35 },
  'status-congelado': { c: [fm(2400, 3400, 1.9, 1.4, 0.3, 0.1), r('branco', hp(6000), 0.3, 0.07), nt(S, 96, [0, 5, 10, 3], 0.05, 0.16, 0.07)], rev: 0.4 },
  'status-confusao': { c: [o(T, 700, 0, 0.6, 0.14, { vib: [7, 4] }), o(Q, 1050, 0, 0.6, 0.05, { vib: [5.3, 5] })] },
  'status-curado': { c: [nt(S, 79, [0, 5, 9, 12], 0.05, 0.2, 0.17), r('branco', hp(7000), 0.2, 0.025)], rev: 0.3 },
  'cura': { c: [nt(S, 72, [0, 4, 7, 12, 16, 19], 0.055, 0.22, 0.16), o(T, 330, 990, 0.4, 0.07, { lin: true }), r('branco', hp(7000), 0.4, 0.03)], rev: 0.4 },
  'cura-total': { c: [nt(S, 72, [0, 4, 7, 12, 16, 19, 24, 28], 0.06, 0.3, 0.15), nt(Q, 84, [null, null, null, null, 0, 4, 7, 12], 0.06, 0.16, 0.06), o(T, 262, 1047, 0.6, 0.08, { lin: true })], rev: 0.5 },
  'protecao': { c: [fm(880, 0, 3.01, 2, 0.4, 0.12), o(Q, 440, 660, 0.12, 0.08), r('branco', bp(3000, 4), 0.2, 0.05)], rev: 0.3 },
  'drenar': { c: [o(S, 900, 300, 0.12, 0.14, { rep: [4, 0.1] }), r('rosa', bp(1500, 3, 500), 0.4, 0.08)] },
  'carga': { c: [o(Q, 110, 880, 0.7, 0.1, { at: 0.3, trem: [30, 0.6] }), o(T, 220, 1760, 0.7, 0.08, { at: 0.3 }), r('branco', hp(2000, 0.7, 8000), 0.7, 0.06, { at: 0.5 })] },
  'clima-sol': { c: [nt(S, 84, [0, 4, 7, 12], 0.07, 0.4, 0.12), o(T, 880, 1320, 0.5, 0.05)], rev: 0.4 },
  'clima-chuva': { c: [r('branco', hp(2400, 0.5), 0.9, 0.12, { at: 0.3 }), o(S, 2200, 1300, 0.03, 0.05, { rep: [7, 0.11] })], rev: 0.2 },
  'clima-geada': { c: [r('branco', bp(5000, 2, 2500), 0.8, 0.1, { at: 0.3 }), nt(S, 93, [0, -2, -5, -9], 0.12, 0.3, 0.08)], rev: 0.45 },
  'clima-areia': { c: [r('rosa', bp(1200, 0.8, 2800), 0.9, 0.24, { at: 0.3, trem: [8, 0.3] })] },

  // ------------------------------------------------------------------ golpes por natureza
  'g-corte': { c: [r('branco', bp(4200, 3, 9000), 0.09, 0.24), o(W, 2400, 700, 0.06, 0.05, { filt: hp(2000) }), r('branco', lp(3000, 0.7, 600), 0.07, 0.2, { ini: 0.07 })] },
  'g-arranhao': { c: [r('branco', bp(3400, 4, 6800), 0.05, 0.2, { rep: [3, 0.055] }), o(Q, 900, 400, 0.04, 0.05, { rep: [3, 0.055] })] },
  'g-mordida': { c: [o(T, 420, 140, 0.05, 0.26), r('branco', bp(2400, 2), 0.03, 0.26), o(Q, 1800, 0, 0.012, 0.1, { ini: 0.005 }), r('rosa', lp(900), 0.08, 0.2, { ini: 0.03 })] },
  'g-pancada': { c: [o(T, 160, 62, 0.13, 0.45), r('rosa', lp(1400, 0.7, 300), 0.1, 0.36), o(Q, 320, 80, 0.05, 0.08)] },
  'g-chicote': { c: [r('branco', bp(900, 2, 6500), 0.12, 0.14, { at: 0.08 }), r('branco', hp(3500), 0.035, 0.36, { ini: 0.12 }), o(Q, 2800, 900, 0.03, 0.08, { ini: 0.12 })] },
  'g-canto': { c: [vz(520, 660, 'aoa', 0.6, 0.2, { formante: 1.3, vib: [6, 0.5], onda: Q }), vz(780, 990, 'aoa', 0.6, 0.1, { formante: 1.3, vib: [6, 0.5], onda: T }), nt(S, 84, [0, 4, 7, 4], 0.15, 0.3, 0.06)], rev: 0.5 },
  'g-rugido': { c: [vz(140, 78, 'aoou', 0.7, 0.3, { formante: 0.75, aspero: 0.7, vib: [27, 0.8] }), o(W, 70, 46, 0.7, 0.18, { dist: 12, filt: lp(700) }), r('rosa', bp(800, 0.8, 300), 0.7, 0.2)], rev: 0.4 },
  'g-explosao': { c: [r('branco', lp(7000, 0.7, 180), 0.7, 0.55), o(S, 130, 28, 0.6, 0.6), r('marrom', lp(200), 0.9, 0.7, { ini: 0.03 }), o(Q, 300, 40, 0.2, 0.12, { dist: 6 })], rev: 0.5 },
  'g-pisao': { c: [o(S, 110, 40, 0.2, 0.6), r('marrom', lp(500), 0.22, 0.5), r('branco', bp(1400, 1), 0.04, 0.14)] },
  'g-investida': { c: [r('rosa', bp(500, 1, 2200), 0.18, 0.2, { at: 0.12 }), o(T, 140, 320, 0.18, 0.12, { at: 0.1 }), r('branco', lp(3000, 0.7, 500), 0.1, 0.36, { ini: 0.18 }), o(T, 180, 70, 0.1, 0.4, { ini: 0.18 })] },
  'g-bicada': { c: [o(Q, 1500, 700, 0.025, 0.14, { rep: [3, 0.07] }), r('branco', bp(2800, 3), 0.02, 0.2, { rep: [3, 0.07] }), o(T, 300, 200, 0.03, 0.14, { rep: [3, 0.07] })] },
  'g-raio': { c: [o(Q, 1800, 300, 0.45, 0.1, { vib: [40, 1.5] }), o(W, 900, 150, 0.45, 0.07, { filt: bp(1800, 2, 600) }), r('branco', bp(4000, 1, 1200), 0.45, 0.1)], rev: 0.3 },
  'g-sopro': { c: [r('rosa', bp(700, 1, 2600), 0.5, 0.3, { at: 0.2 }), r('branco', hp(4000), 0.5, 0.05, { at: 0.3 })] },
  'g-pedrada': { c: [r('branco', bp(1100, 2), 0.04, 0.3, { rep: [3, 0.1] }), o(T, 210, 110, 0.06, 0.3, { rep: [3, 0.1] }), r('marrom', lp(400), 0.08, 0.3, { rep: [3, 0.1] })] },
  'g-po': { c: [r('branco', bp(5200, 1.2, 2600), 0.5, 0.1, { at: 0.15, trem: [19, 0.5] }), nt(S, 91, [0, -1, 3, -4, 2], 0.09, 0.12, 0.05)] },
  'g-teia': { c: [o(S, 2600, 900, 0.3, 0.07, { vib: [22, 1] }), r('branco', bp(6000, 3, 2500), 0.3, 0.09), o(T, 500, 380, 0.06, 0.12, { ini: 0.28 })] },
  'g-giro': { c: [r('rosa', bp(700, 2, 2400), 0.11, 0.2, { rep: [3, 0.12] }), o(T, 260, 520, 0.11, 0.1, { rep: [3, 0.12] }), r('branco', lp(3000, 0.7, 600), 0.08, 0.3, { ini: 0.36 })] },

  // ------------------------------------------------------------------ golpes por tipo (um por tipo do jogo)
  'g-comum': { c: [r('branco', lp(4200, 0.7, 800), 0.1, 0.32), o(T, 220, 100, 0.09, 0.3), o(Q, 660, 330, 0.04, 0.07)] },
  'g-mata': { c: [r('branco', bp(4600, 1.2, 2200), 0.07, 0.16, { rep: [4, 0.06] }), o(T, 520, 780, 0.3, 0.1, { vib: [14, 0.6] }), r('rosa', bp(900, 1), 0.12, 0.2, { ini: 0.25 }), o(T, 180, 110, 0.08, 0.2, { ini: 0.25 })] },
  'g-brasa': { c: [r('branco', bp(700, 0.7, 3600), 0.5, 0.3, { at: 0.06 }), o(W, 110, 240, 0.45, 0.12, { dist: 8, filt: lp(900, 1, 2400) }), r('branco', hp(4500), 0.014, 0.16, { ini: 0.1, rep: [6, 0.063] }), o(S, 90, 45, 0.3, 0.26, { ini: 0.2 })] },
  'g-rio': { c: [r('branco', bp(700, 1.2, 3200), 0.4, 0.26, { at: 0.08 }), o(S, 300, 1100, 0.09, 0.12, { rep: [4, 0.085] }), r('marrom', lp(500), 0.3, 0.4, { ini: 0.15 }), r('branco', hp(3800), 0.25, 0.08, { ini: 0.28 })] },
  'g-trovao': { c: [o(Q, 2600, 180, 0.09, 0.14), r('branco', hp(1800), 0.06, 0.34), o(Q, 1400, 0, 0.3, 0.09, { ini: 0.07, trem: [53, 1] }), r('branco', bp(3200, 1), 0.3, 0.1, { ini: 0.07, trem: [41, 1] }), r('marrom', lp(260), 0.5, 0.5, { ini: 0.08 })], rev: 0.3 },
  'g-geada': { c: [fm(3100, 1900, 1.83, 1.6, 0.35, 0.1), r('branco', bp(6500, 2, 3000), 0.4, 0.14, { at: 0.1 }), nt(S, 96, [0, -3, 2, -5, 0, -7], 0.045, 0.12, 0.07), r('branco', bp(2600, 4), 0.03, 0.2, { ini: 0.36 })], rev: 0.35 },
  'g-ginga': { c: [fm(196, 0, 1, 3, 0.16, 0.2, { filt: lp(1800, 4, 600) }), r('rosa', bp(600, 1, 2800), 0.14, 0.16, { ini: 0.1, at: 0.09 }), r('branco', lp(3600, 0.7, 500), 0.09, 0.36, { ini: 0.24 }), o(T, 200, 75, 0.1, 0.4, { ini: 0.24 }), o(Q, 880, 0, 0.02, 0.07, { ini: 0.24 })] },
  'g-veneno': { c: [o(S, 240, 620, 0.08, 0.16, { rep: [5, 0.075] }), r('rosa', bp(900, 4, 350), 0.5, 0.14), o(Q, 130, 92, 0.5, 0.08, { filt: lp(600), trem: [15, 0.7] }), r('branco', bp(2400, 1), 0.1, 0.1, { ini: 0.38 })] },
  'g-terra': { c: [r('marrom', lp(320, 1.4), 0.6, 0.8, { trem: [18, 0.5] }), o(S, 75, 36, 0.5, 0.5), r('branco', bp(900, 1), 0.05, 0.2, { rep: [4, 0.11] }), r('rosa', lp(1400, 0.7, 300), 0.2, 0.3, { ini: 0.35 })] },
  'g-vento': { c: [r('rosa', bp(500, 2.5, 3200), 0.45, 0.32, { at: 0.2 }), r('branco', bp(2600, 3, 7000), 0.3, 0.1, { ini: 0.15, at: 0.15 }), o(S, 700, 1700, 0.4, 0.03, { at: 0.2 }), r('branco', bp(3600, 3, 8000), 0.07, 0.2, { ini: 0.42 })] },
  'g-mente': { c: [o(S, 660, 0, 0.6, 0.12, { vib: [9, 2.5], at: 0.1 }), o(S, 990, 0, 0.6, 0.07, { vib: [6.5, 3.5], at: 0.1 }), fm(1320, 660, 3.5, 2, 0.6, 0.06, { at: 0.2 }), o(Q, 2640, 0, 0.03, 0.06, { ini: 0.5, rep: [2, 0.05] })], rev: 0.45 },
  'g-inseto': { c: [o(W, 210, 260, 0.35, 0.12, { trem: [95, 1], filt: bp(1800, 1.5) }), o(Q, 420, 520, 0.35, 0.06, { trem: [95, 1] }), r('branco', bp(4800, 3), 0.02, 0.2, { ini: 0.3, rep: [3, 0.045] }), o(T, 260, 160, 0.05, 0.2, { ini: 0.34 })] },
  'g-pedra': { c: [r('marrom', lp(600), 0.25, 0.6, { trem: [26, 0.5] }), o(T, 150, 70, 0.14, 0.5, { ini: 0.2 }), r('branco', bp(1300, 1.5), 0.05, 0.4, { ini: 0.2 }), r('branco', bp(2400, 3), 0.025, 0.16, { ini: 0.32, rep: [3, 0.07] })] },
  'g-assombro': { c: [vz(210, 150, 'uou', 0.8, 0.2, { formante: 0.9, vib: [5, 1.2], aspero: 0.3, onda: T, at: 0.25 }), o(S, 440, 311, 0.8, 0.07, { vib: [4, 2], at: 0.3 }), r('rosa', bp(400, 3, 1600), 0.8, 0.1, { at: 0.4 })], rev: 0.7 },
  'g-lenda': { c: [o(W, 82, 0, 0.9, 0.16, { filt: lp(400, 3, 2400), at: 0.2, dist: 5 }), nt(Q, 62, [0, 7, 12, 15, 19, 24], 0.07, 0.3, 0.1), fm(294, 588, 2, 3, 0.9, 0.08, { at: 0.3 }), r('branco', lp(5000, 0.7, 300), 0.4, 0.4, { ini: 0.5 }), o(S, 110, 36, 0.4, 0.4, { ini: 0.5 })], rev: 0.6 },
  'g-ferro': { c: [fm(740, 0, 2.76, 4, 0.5, 0.16, { ind2: 0.4 }), fm(1130, 0, 1.93, 3, 0.3, 0.08), r('branco', hp(3000), 0.03, 0.3), o(T, 170, 90, 0.08, 0.3)], rev: 0.35 },
  'g-encanto': { c: [nt(S, 88, [0, 4, 7, 11, 12, 16, 19, 23], 0.04, 0.22, 0.1), nt(T, 76, [0, 7, 12, 19], 0.08, 0.2, 0.1), r('branco', hp(8000), 0.4, 0.03), o(S, 1760, 2640, 0.35, 0.04, { vib: [12, 0.5] })], rev: 0.5 },
};

// ---------------------------------------------------------------------- sons pontuais de ambiente
export const SONS_AMB: Record<string, Sfx> = {
  'amb-passaro': { c: [o(S, 2600, 3400, 0.07, 0.1, { rep: [3, 0.1] }), o(S, 3400, 2500, 0.09, 0.08, { ini: 0.33 })], rev: 0.5 },
  'amb-sabia': { c: [nt(S, 88, [0, 3, 7, 3, 8, 5], 0.13, 0.12, 0.1), o(T, 1560, 1900, 0.2, 0.03, { ini: 0.8, vib: [16, 1] })], rev: 0.5 },
  'amb-bem-te-vi': { c: [o(Q, 2100, 2500, 0.08, 0.05, { filt: bp(2400, 3) }), o(Q, 2500, 2300, 0.07, 0.05, { ini: 0.12, filt: bp(2400, 3) }), o(Q, 2900, 2000, 0.22, 0.06, { ini: 0.24, filt: bp(2600, 3) })], rev: 0.5 },
  'amb-grilo': { c: [o(S, 4300, 0, 0.3, 0.05, { trem: [36, 1], sus: true })] },
  'amb-cigarra': { c: [o(W, 3100, 3300, 1.4, 0.03, { trem: [70, 0.9], at: 0.5, filt: bp(3300, 4) })] },
  'amb-sapo': { c: [o(Q, 190, 230, 0.12, 0.1, { trem: [38, 1], filt: bp(700, 3), rep: [2, 0.22] })], rev: 0.3 },
  'amb-coruja': { c: [o(S, 420, 380, 0.25, 0.1, { at: 0.05 }), o(S, 400, 350, 0.4, 0.1, { ini: 0.4, at: 0.05 })], rev: 0.6 },
  'amb-gota': { c: [o(S, 900, 2100, 0.06, 0.14)], rev: 0.9 },
  'amb-onda': { c: [r('rosa', lp(700, 0.6, 2200), 2.2, 0.3, { at: 1.1 }), r('branco', hp(3200), 1.6, 0.05, { ini: 1.2, at: 0.3 })] },
  'amb-gaivota': { c: [o(Q, 1500, 1100, 0.3, 0.04, { filt: bp(1900, 4), vib: [11, 0.6] }), o(Q, 1600, 1000, 0.4, 0.04, { ini: 0.4, filt: bp(1900, 4), vib: [11, 0.6] })], rev: 0.5 },
  'amb-rajada': { c: [r('rosa', bp(400, 2, 900), 2.4, 0.3, { at: 1.2 })] },
  'amb-trovao-longe': { c: [r('marrom', lp(180), 2.6, 0.6, { at: 0.3, trem: [6, 0.3] })], rev: 0.7 },
  'amb-bolhas': { c: [o(S, 400, 1300, 0.06, 0.1, { rep: [4, 0.11] })], rev: 0.6 },
  'amb-faisca': { c: [o(Q, 1800, 0, 0.12, 0.05, { trem: [57, 1] }), r('branco', hp(5000), 0.1, 0.05, { trem: [47, 1] })] },
  'amb-bugio': { c: [vz(150, 110, 'ouo', 1.2, 0.12, { formante: 0.8, aspero: 0.6, vib: [20, 0.5], at: 0.3 })], rev: 0.8 },
  'amb-pingo-lata': { c: [fm(1500, 0, 2.3, 1.5, 0.12, 0.06)], rev: 0.5 },
};

// ---------------------------------------------------------------------- ambientes em laço
export interface Leito { vol: number; cor: CorRuido; filt: Filt; pan?: number; lfo?: [number, number] }
export interface Zumbido { vol: number; onda: OscillatorType; f: number; filt?: Filt; trem?: [number, number] }
export interface EventoAmb { som: string; cada: [number, number]; vol: [number, number]; pitch: [number, number]; pan: [number, number] }
export interface Ambiente { semente: number; leitos: Leito[]; zumbidos?: Zumbido[]; eventos: EventoAmb[] }

const ev = (som: string, de: number, ate: number, vMin = 0.5, vMax = 1, pMin = 0.9, pMax = 1.15): EventoAmb => ({ som, cada: [de, ate], vol: [vMin, vMax], pitch: [pMin, pMax], pan: [-0.8, 0.8] });

export const AMBIENTES: Record<string, Ambiente> = {
  'mata-dia': { semente: 1101, leitos: [{ vol: 0.05, cor: 'rosa', filt: bp(1800, 0.5), lfo: [0.13, 400] }], eventos: [ev('amb-passaro', 2.5, 7), ev('amb-sabia', 6, 15, 0.4, 0.8), ev('amb-bem-te-vi', 8, 20, 0.4, 0.8), ev('amb-cigarra', 9, 22, 0.3, 0.6)] },
  'mata-noite': { semente: 1102, leitos: [{ vol: 0.04, cor: 'rosa', filt: bp(900, 0.5), lfo: [0.09, 200] }], eventos: [ev('amb-grilo', 0.7, 2.2, 0.3, 0.7, 0.95, 1.08), ev('amb-sapo', 3, 8, 0.4, 0.8, 0.8, 1.2), ev('amb-coruja', 9, 24, 0.4, 0.7)] },
  'cerrado': { semente: 1103, leitos: [{ vol: 0.06, cor: 'rosa', filt: bp(700, 0.6), lfo: [0.07, 250] }], eventos: [ev('amb-cigarra', 4, 10, 0.4, 0.8), ev('amb-passaro', 5, 13), ev('amb-rajada', 10, 22, 0.3, 0.6)] },
  'praia': { semente: 1104, leitos: [{ vol: 0.07, cor: 'rosa', filt: lp(900), lfo: [0.11, 350] }], eventos: [ev('amb-onda', 4.5, 7.5, 0.6, 1, 0.9, 1.1), ev('amb-gaivota', 7, 19, 0.3, 0.7)] },
  'pantanal': { semente: 1105, leitos: [{ vol: 0.05, cor: 'rosa', filt: bp(1200, 0.5), lfo: [0.1, 300] }], eventos: [ev('amb-sapo', 1.5, 5, 0.4, 0.9, 0.7, 1.3), ev('amb-passaro', 4, 11), ev('amb-bolhas', 6, 14, 0.3, 0.6)] },
  'caverna': { semente: 1106, leitos: [{ vol: 0.08, cor: 'marrom', filt: lp(300), lfo: [0.05, 80] }], eventos: [ev('amb-gota', 1.2, 4.5, 0.4, 1, 0.7, 1.4)] },
  'serra': { semente: 1107, leitos: [{ vol: 0.09, cor: 'rosa', filt: bp(500, 1.2), lfo: [0.17, 220] }, { vol: 0.02, cor: 'branco', filt: bp(2600, 2), lfo: [0.23, 900] }], eventos: [ev('amb-rajada', 5, 12, 0.4, 0.9)] },
  'chuva': { semente: 1108, leitos: [{ vol: 0.09, cor: 'branco', filt: hp(2200, 0.5) }, { vol: 0.1, cor: 'rosa', filt: bp(800, 0.5), lfo: [0.21, 200] }], eventos: [ev('amb-trovao-longe', 12, 30, 0.4, 0.9, 0.8, 1.2), ev('amb-gota', 0.4, 1.1, 0.2, 0.5, 1.2, 1.8)] },
  'submerso': { semente: 1109, leitos: [{ vol: 0.14, cor: 'marrom', filt: lp(260), lfo: [0.08, 90] }], zumbidos: [{ vol: 0.02, onda: 'sine', f: 62, trem: [0.3, 0.6] }], eventos: [ev('amb-bolhas', 2, 6, 0.4, 0.9, 0.6, 1.3)] },
  'usina': { semente: 1110, leitos: [{ vol: 0.04, cor: 'marrom', filt: lp(400) }], zumbidos: [{ vol: 0.03, onda: 'sawtooth', f: 60, filt: lp(300), trem: [0.4, 0.3] }, { vol: 0.012, onda: 'square', f: 120, filt: bp(480, 3) }], eventos: [ev('amb-faisca', 3, 9, 0.4, 0.9), ev('amb-pingo-lata', 2, 6, 0.4, 0.8)] },
  'cidade': { semente: 1111, leitos: [{ vol: 0.03, cor: 'rosa', filt: bp(600, 0.5), lfo: [0.06, 150] }], eventos: [ev('amb-passaro', 5, 14, 0.3, 0.6), ev('amb-bem-te-vi', 9, 22, 0.3, 0.6)] },
  'floresta-ancestral': { semente: 1112, leitos: [{ vol: 0.06, cor: 'rosa', filt: bp(1100, 0.5), lfo: [0.07, 300] }], eventos: [ev('amb-bugio', 14, 32, 0.4, 0.8, 0.8, 1.1), ev('amb-sabia', 5, 12, 0.4, 0.8), ev('amb-gota', 2, 6, 0.3, 0.6)] },
};
