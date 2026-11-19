/** Medição offline (pico e RMS) de músicas, efeitos e gritos, para nivelar volumes. Só a página de teste importa este módulo. */
import { criaMixer } from './mixer';
import { compilar } from './notation';
import { Tocador } from './sequencer';
import { tocaPreset } from './sfxEngine';
import { duracaoGrito, tocaGrito } from './grito';
import { FAIXAS } from '../data/music';
import { SFX, SONS_AMB } from '../data/sfx';
import { GRITOS } from '../data/gritos';

export interface Medida { pico: number; rms: number; seg: number }

function contexto(seg: number): AudioContext {
  const C = window.OfflineAudioContext;
  // os motores só usam a parte comum aos dois tipos de contexto
  return new C(2, Math.ceil(44100 * seg), 44100) as unknown as AudioContext;
}

async function medir(c: AudioContext): Promise<Medida> {
  const buf = await (c as unknown as OfflineAudioContext).startRendering();
  let pico = 0;
  let soma = 0;
  let n = 0;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < d.length; i++) {
      const a = Math.abs(d[i]);
      if (a > pico) pico = a;
      // RMS com porta: ignora o silêncio antes e depois do som
      if (a > 0.002) { soma += a * a; n++; }
    }
  }
  return { pico, rms: n ? Math.sqrt(soma / n) : 0, seg: n / buf.numberOfChannels / 44100 };
}

export function medirMusica(id: string, nivel = 1, seg = 24): Promise<Medida> {
  const comp = compilar(FAIXAS[id]);
  const total = Math.min(seg, (comp.total * 60) / (comp.faixa.bpm * 4) + 2);
  const c = contexto(total);
  const m = criaMixer(c);
  m.envioMusica.gain.value = comp.faixa.envio ?? 0.3;
  m.musica.gain.value = 0.6 * nivel;
  const t = new Tocador(c, comp, m.musica, 0.05, () => 1, () => { /* sem batidas */ });
  t.fadeIn(0);
  t.agendarAte(total);
  return medir(c);
}

export function medirSfx(id: string, nivel = 1): Promise<Medida> {
  const def = SFX[id] ?? SONS_AMB[id];
  let dur = 0;
  for (const cam of def.c) dur = Math.max(dur, (cam.ini ?? 0) + (cam.rep ? (cam.rep[0] - 1) * cam.rep[1] : 0) + cam.dur + (cam.k === 'notas' ? cam.passo * cam.seq.length : 0));
  const c = contexto(dur + 1.5);
  const m = criaMixer(c);
  tocaPreset(c, def, m.sfx, m.sfxRev, { vol: nivel }, 0);
  return medir(c);
}

export function medirGrito(n: number, nivel = 1): Promise<Medida> {
  const g = GRITOS[n];
  const c = contexto(duracaoGrito(g) + 1.5);
  const m = criaMixer(c);
  tocaGrito(c, g, m.sfx, m.sfxRev, { vol: nivel }, n, 0.01);
  return medir(c);
}
