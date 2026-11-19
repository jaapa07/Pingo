/** Sintetizador dos gritos de criatura: canais de pulso/triângulo/ruído com contorno de altura, pulsação, formante e corpo. */
import { curvaDist, filtro, fonteRuido, ganho, inicia } from './core';
import { ondaPulso } from './instruments';
import type { Grito } from '../data/gritos';

const LARGURA: Record<string, number> = { p50: 0.5, p25: 0.25, p12: 0.125 };
const BASICA: Record<string, OscillatorType> = { tri: 'triangle', serra: 'sawtooth', seno: 'sine' };

function voz(c: AudioContext, onda: string, dest: AudioNode): OscillatorNode {
  const o = c.createOscillator();
  if (onda in LARGURA) o.setPeriodicWave(ondaPulso(c, LARGURA[onda]));
  else o.type = BASICA[onda] ?? 'square';
  o.connect(dest);
  return o;
}

function contorno(p: AudioParam, f: number, curva: number[], t: number, d: number): void {
  p.setValueAtTime(Math.max(20, f * curva[0]), t);
  for (let i = 1; i < curva.length; i++) p.exponentialRampToValueAtTime(Math.max(20, f * curva[i]), t + (d * i) / (curva.length - 1));
}

function uma(c: AudioContext, g: Grito, t: number, afina: number, saida: AudioNode, semente: number): void {
  const d = g.d;
  const f = g.f * afina;
  const env = ganho(c, 0, saida);
  const at = Math.min(g.at ?? 0.008, d * 0.5);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(1, t + at);
  if (g.p) env.gain.exponentialRampToValueAtTime(0.0001, t + d);
  else {
    const solta = Math.min(0.09, d * 0.3);
    env.gain.setValueAtTime(1, t + d - solta);
    env.gain.exponentialRampToValueAtTime(0.0001, t + d);
  }
  const nos: (OscillatorNode | AudioBufferSourceNode)[] = [];
  // pulsação de amplitude (coaxar, zumbir, chocalhar)
  let alvo: AudioNode = env;
  if (g.a && g.a[0] > 0 && g.a[1] > 0) {
    const [hz, prof] = g.a;
    const am = ganho(c, 1 - prof * 0.5, env);
    const lfo = c.createOscillator();
    lfo.type = prof > 0.85 ? 'square' : 'sine';
    lfo.frequency.value = hz;
    lfo.connect(ganho(c, prof * 0.5, am.gain));
    nos.push(lfo);
    alvo = am;
  }
  // voz principal → saturação → formante
  let entrada: AudioNode;
  if (g.q) {
    const b = filtro(c, 'bandpass', g.q[0] * Math.sqrt(afina), g.q[1], ganho(c, 1 + g.q[1] * 0.35, alvo));
    entrada = b;
    // um pouco do som direto mantém a altura legível
    const direto = filtro(c, 'lowpass', 5000, 0.5, ganho(c, 0.25, alvo));
    const junta = c.createGain(); junta.connect(b); junta.connect(direto);
    entrada = junta;
  } else entrada = filtro(c, 'lowpass', 8000, 0.5, alvo);
  if (g.x) {
    const ws = c.createWaveShaper(); ws.curve = curvaDist(g.x); ws.connect(ganho(c, 0.7, entrada));
    entrada = ws;
  }
  const afinaveis: OscillatorNode[] = [];
  const principal = voz(c, g.o, ganho(c, 0.3 * (g.m ?? 1), entrada));
  contorno(principal.frequency, f, g.c, t, d);
  afinaveis.push(principal);
  if (g.s) {
    const sub = voz(c, 'tri', ganho(c, 0.45 * g.s, entrada));
    contorno(sub.frequency, f / 2, g.c, t, d);
    afinaveis.push(sub);
  }
  if (g.h) {
    const h = voz(c, 'p25', ganho(c, 0.3 * g.h[1], entrada));
    contorno(h.frequency, f * g.h[0], g.c, t, d);
    afinaveis.push(h);
  }
  if (g.v && g.v[0] > 0) {
    const lfo = c.createOscillator();
    lfo.frequency.value = g.v[0];
    const prof = ganho(c, g.v[1] * 100);
    lfo.connect(prof);
    for (const o of afinaveis) prof.connect(o.detune);
    nos.push(lfo);
  }
  nos.push(...afinaveis);
  if (g.r) {
    const [de, ate] = g.rb ?? [2000, 2000];
    const b = filtro(c, 'bandpass', de * Math.sqrt(afina), 1.3, ganho(c, 0.55 * g.r, alvo));
    b.frequency.setValueAtTime(de * Math.sqrt(afina), t);
    b.frequency.exponentialRampToValueAtTime(Math.max(40, ate * Math.sqrt(afina)), t + d);
    nos.push(fonteRuido(c, 'branco', b, (semente * 0.173) % 1.7));
  }
  inicia(nos, t, t + d);
}

/** Duração total do grito em segundos (para a batalha esperar o fim). */
export function duracaoGrito(g: Grito): number {
  const [n, cada] = g.n ?? [1, 0];
  return (n - 1) * cada + g.d;
}

export function tocaGrito(c: AudioContext, g: Grito, dest: AudioNode, envio: AudioNode, o: { vol?: number; pitch?: number; pan?: number }, semente: number, quando = c.currentTime + 0.01): void {
  const saida = ganho(c, (g.g ?? 1) * (o.vol ?? 1));
  if (o.pan) {
    const sp = c.createStereoPanner();
    sp.pan.value = Math.max(-1, Math.min(1, o.pan));
    saida.connect(sp); sp.connect(dest);
    if (g.e) sp.connect(ganho(c, g.e, envio));
  } else {
    saida.connect(dest);
    if (g.e) saida.connect(ganho(c, g.e, envio));
  }
  const [n, cada] = g.n ?? [1, 0];
  for (let k = 0; k < n; k++) uma(c, g, quando + k * cada, (o.pitch ?? 1) * Math.pow(g.np ?? 1, k), saida, semente + k);
  setTimeout(() => { try { saida.disconnect(); } catch { /* já desligado */ } }, (duracaoGrito(g) + 4) * 1000);
}
