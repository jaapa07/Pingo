/** API pública de áudio do Adventures of Pingo (Web Audio, tudo sintetizado; nada é carregado da rede). */
import { ativo, getCtx } from './core';
import { abaixaMusica, mixer, submerso, trocaReverb, volumes } from './mixer';
import { compilar, type Compilada } from './notation';
import { Tocador, type OuvinteBatida } from './sequencer';
import { tocaPreset } from './sfxEngine';
import { tocaAmbiente } from './ambience';
import { balbuciar } from './babble';
import { duracaoGrito, tocaGrito } from './grito';
import { variar } from './rng';
import { NIVEL_GRITO, NIVEL_MUSICA, NIVEL_SFX } from './niveis';
import type { PresetReverb } from './reverb';
import { FAIXAS } from '../data/music';
import { AMBIENTES, SFX, SONS_AMB } from '../data/sfx';
import { GRITOS } from '../data/gritos';
import { bus } from '../core/events';
import { jogo } from '../core/estado';

export type { PresetReverb } from './reverb';

interface Vols { musica: number; sfx: number; ambiente: number }

const compiladas = new Map<string, Compilada>();
const ouvintes = new Set<OuvinteBatida>();
let tocador: Tocador | null = null;
let musicaAtual: string | null = null;
let tempoMult = 1;
let bomba: ReturnType<typeof setInterval> | null = null;
let ambDesejado: string | null = null;
let musicaPendente: { id: string; fade: number } | null = null;
let vols: Vols = { musica: 0.7, sfx: 0.85, ambiente: 0.7 };
/** alguém já chamou setVolumes; senão, o primeiro unlock lê as opções do jogo */
let volumesDefinidos = false;
let debaixoDagua = false;
let reverbAtual: PresetReverb = 'mata';
/** o jogador já fez um gesto e o contexto foi liberado ao menos uma vez */
let liberado = false;
/** suspenso porque a aba/app foi para segundo plano */
let emSegundoPlano = false;

function faixa(id: string): Compilada | null {
  const pronta = compiladas.get(id);
  if (pronta) return pronta;
  const f = FAIXAS[id];
  if (!f) { console.warn('[audio] música desconhecida:', id); return null; }
  const comp = compilar(f);
  compiladas.set(id, comp);
  return comp;
}

function ligaBomba(): void {
  if (bomba) return;
  bomba = setInterval(() => { tocador?.bombear(); }, 25);
}

function avisaBatida(b: number): void {
  for (const cb of ouvintes) { try { cb(b); } catch (e) { console.error(e); } }
}

function iniciaMusica(c: AudioContext, id: string, fade: number): void {
  const comp = faixa(id);
  if (!comp) return;
  const m = mixer(c);
  if (tocador) tocador.parar(Math.max(0.05, fade));
  const f = comp.faixa;
  m.envioMusica.gain.setTargetAtTime(f.envio ?? 0.3, c.currentTime, 0.2);
  m.musica.gain.setTargetAtTime(0.6 * (NIVEL_MUSICA[id] ?? 1), c.currentTime, 0.05);
  tocador = new Tocador(c, comp, m.musica, c.currentTime + 0.06, () => tempoMult, avisaBatida);
  tocador.fadeIn(fade);
  musicaAtual = id;
  tocador.bombear();
  ligaBomba();
}

/** Assina a batida (semínima) da música atual. beat % 4 === 0 é o tempo forte do compasso 4/4. Retorna função para cancelar. */
export function onBeat(cb: (beat: number) => void): () => void {
  ouvintes.add(cb);
  return () => { ouvintes.delete(cb); };
}

export const audio = {
  /** Libera o áudio (precisa de um gesto do jogador no navegador). É chamado sozinho no primeiro toque/tecla. */
  unlock(): void {
    const c = getCtx();
    if (!c) return;
    const m = mixer(c);
    if (!volumesDefinidos) {
      const o = jogo.opcoes;
      vols = { musica: o.musica, sfx: o.sfx, ambiente: Math.min(1, o.sfx * 0.85) };
    }
    volumes(m, vols);
    const seguir = () => {
      liberado = true;
      if (musicaPendente) { const p = musicaPendente; musicaPendente = null; iniciaMusica(c, p.id, p.fade); }
      if (ambDesejado) tocaAmbiente(c, m.amb, m.ambRev, ambDesejado);
      if (debaixoDagua) submerso(m, true);
      trocaReverb(m, reverbAtual);
    };
    if (c.state === 'running') seguir();
    else if (!emSegundoPlano) c.resume().then(seguir, (e) => console.warn('[audio] não foi possível liberar o áudio', e));
  },

  /** true depois que o áudio foi liberado por um gesto */
  get liberado(): boolean { return liberado; },

  /** Volumes de 0 a 1 (as opções do jogo trazem `musica` e `sfx`; `ambiente` acompanha o de efeitos se omitido). */
  setVolumes(v: { musica?: number; sfx?: number; ambiente?: number } = {}): void {
    volumesDefinidos = true;
    const sfx = v.sfx ?? vols.sfx;
    vols = { musica: v.musica ?? vols.musica, sfx, ambiente: v.ambiente ?? (v.sfx !== undefined ? Math.min(1, sfx * 0.85) : vols.ambiente) };
    const c = getCtx();
    if (c) volumes(mixer(c), vols);
  },

  playMusic(id: string, o?: { fade?: number }): void {
    const fade = o?.fade ?? 0.5;
    if (musicaAtual === id && tocador && !tocador.parado && !tocador.terminou) return;
    if (musicaPendente?.id === id) return;
    const c = ativo();
    if (!c) { if (FAIXAS[id]) musicaPendente = { id, fade }; else console.warn('[audio] música desconhecida:', id); return; }
    iniciaMusica(c, id, fade);
  },

  stopMusic(fade = 0.8): void {
    musicaPendente = null;
    if (tocador) tocador.parar(fade);
    tocador = null;
    musicaAtual = null;
  },

  /** id da música tocando (ou aguardando a liberação do áudio) */
  currentMusic(): string | null { return musicaPendente?.id ?? musicaAtual ?? null; },

  /**
   * Toca uma faixa curta por cima da música atual (que abaixa e volta sozinha). Retorna a duração em ms,
   * para o chamador poder esperar o fim (0 se o áudio estiver bloqueado ou o id não existir).
   */
  jingle(id: string): number {
    const c = ativo();
    const comp = faixa(id);
    if (!comp) return 0;
    const seg = (comp.total * 60) / (comp.faixa.bpm * 4);
    if (!c) return Math.round(seg * 1000);
    const m = mixer(c);
    const dest = c.createGain();
    dest.gain.value = NIVEL_MUSICA[id] ?? 1;
    dest.connect(m.jingle);
    const t = new Tocador(c, { ...comp, faixa: { ...comp.faixa, loop: false } }, dest, c.currentTime + 0.03, () => 1, () => { /* jingles não marcam batida */ });
    t.fadeIn(0);
    t.agendarAte(c.currentTime + seg + 1);
    abaixaMusica(m, seg * 1000);
    setTimeout(() => { try { dest.disconnect(); } catch { /* já desligado */ } }, (seg + 4) * 1000);
    return Math.round(seg * 1000);
  },

  setMusicTempo(mult: number): void {
    tempoMult = Math.max(0.25, Math.min(4, Number.isFinite(mult) ? mult : 1));
    tocador?.atualizaTempo();
  },

  duckMusic(ms: number): void {
    const c = ativo();
    if (c) abaixaMusica(mixer(c), ms);
  },

  playSfx(id: string, o?: { vol?: number; pitch?: number; pan?: number }): void {
    const c = ativo();
    if (!c) return;
    // sons de ambiente (pássaro, gota, trovão ao longe…) também podem ser disparados como efeito pontual
    const def = SFX[id] ?? SONS_AMB[id];
    if (!def) { console.warn('[audio] sfx desconhecido:', id); return; }
    const m = mixer(c);
    tocaPreset(c, def, m.sfx, m.sfxRev, { ...o, vol: (o?.vol ?? 1) * (NIVEL_SFX[id] ?? 1) }, def.var ? variar(def.var) : 0);
  },

  /** Grito da espécie (número do Diário de Campo). Retorna a duração em ms. `pitch` < 1 serve para o grito de desmaio. */
  grito(especie: number, o?: { vol?: number; pitch?: number; pan?: number }): number {
    const n = Number.isInteger(especie) && especie >= 1 && especie < GRITOS.length ? especie : 0;
    const g = GRITOS[n];
    const ms = Math.round(duracaoGrito(g) * 1000);
    const c = ativo();
    if (!c) return ms;
    const m = mixer(c);
    tocaGrito(c, g, m.sfx, m.sfxRev, { ...o, vol: (o?.vol ?? 1) * (NIVEL_GRITO[n] ?? 1) }, n);
    return ms;
  },

  playAmbience(id: string | null): void {
    ambDesejado = id;
    const c = ativo();
    if (!c) return;
    const m = mixer(c);
    tocaAmbiente(c, m.amb, m.ambRev, id);
  },

  setUnderwater(on: boolean): void {
    debaixoDagua = on;
    const c = ativo();
    if (c) submerso(mixer(c), on);
  },

  setReverb(preset: PresetReverb): void {
    reverbAtual = preset;
    const c = ativo();
    if (c) trocaReverb(mixer(c), preset);
  },

  /** Fala balbuciada de um personagem (ver `VOZES` em babble.ts; ids desconhecidos ganham uma voz genérica estável). */
  babble(voice: string, text: string): void {
    const c = ativo();
    if (!c) return;
    balbuciar(c, mixer(c).sfx, voice, text);
  },

  /** Pausa tudo (aba oculta, app em segundo plano). */
  suspender(): void {
    emSegundoPlano = true;
    const c = getCtx();
    if (c && c.state === 'running') void c.suspend();
  },

  /** Retoma depois de `suspender()` (só se o áudio já tinha sido liberado por um gesto). */
  retomar(): void {
    emSegundoPlano = false;
    if (liberado) audio.unlock();
  },

  listMusic(): string[] { return Object.keys(FAIXAS); },
  listSfx(): string[] { return Object.keys(SFX); },
  listAmbience(): string[] { return Object.keys(AMBIENTES); },
};

// ---------------------------------------------------------------- ponte com o barramento de eventos
type Carga = string | number | null | undefined | Record<string, unknown>;
const campo = (d: Carga, ...nomes: string[]): unknown => {
  if (d && typeof d === 'object') for (const n of nomes) if (d[n] !== undefined) return d[n];
  return d;
};
const num = (x: unknown): number | undefined => (typeof x === 'number' && Number.isFinite(x) ? x : undefined);

bus.on('sfx', (d: Carga) => {
  const id = campo(d, 'id');
  if (typeof id !== 'string') return;
  const o = d && typeof d === 'object' ? d : {};
  // `x` (0–320, posição na tela) vira panorama suave
  const x = num(o.x);
  audio.playSfx(id, { vol: num(o.vol), pitch: num(o.pitch), pan: num(o.pan) ?? (x !== undefined ? Math.max(-0.6, Math.min(0.6, (x - 160) / 260)) : undefined) });
});
const aoPedirMusica = (d: Carga): void => {
  const id = campo(d, 'id');
  const fade = d && typeof d === 'object' ? num(d.fade) : undefined;
  if (id === null || id === '' || id === 'nenhuma') audio.stopMusic(fade);
  else if (typeof id === 'string') audio.playMusic(id, fade !== undefined ? { fade } : undefined);
};
bus.on('musica', aoPedirMusica);
bus.on('music', aoPedirMusica);
bus.on('jingle', (d: Carga) => { const id = campo(d, 'id'); if (typeof id === 'string') audio.jingle(id); });
bus.on('babble', (d: Carga) => {
  if (!d || typeof d !== 'object') return;
  const voz = d.voz ?? d.voice;
  const texto = d.texto ?? d.text;
  if (typeof texto === 'string') audio.babble(typeof voz === 'string' ? voz : 'jogador', texto);
});
bus.on('grito', (d: Carga) => {
  const n = num(campo(d, 'especie', 'id', 'n'));
  if (n === undefined) return;
  const o = d && typeof d === 'object' ? d : {};
  audio.grito(n, { vol: num(o.vol), pitch: num(o.pitch), pan: num(o.pan) });
});
bus.on('ambiente', (d: Carga) => { const id = campo(d, 'id'); audio.playAmbience(typeof id === 'string' && id ? id : null); });
bus.on('volumes', (d: Carga) => { if (d && typeof d === 'object') audio.setVolumes({ musica: num(d.musica), sfx: num(d.sfx), ambiente: num(d.ambiente) }); });

// ---------------------------------------------------------------- primeiro gesto e segundo plano
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const gestos = ['pointerdown', 'touchend', 'mousedown', 'keydown', 'click'] as const;
  const destravar = (): void => {
    audio.unlock();
    // alguns navegadores só aceitam o resume() em certos tipos de gesto: os ouvintes saem quando o contexto estiver rodando
    setTimeout(() => {
      if (ativo()) for (const g of gestos) window.removeEventListener(g, destravar, true);
    }, 300);
  };
  for (const g of gestos) window.addEventListener(g, destravar, { capture: true, passive: true });
  window.addEventListener('gamepadconnected', destravar);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.suspender();
    else audio.retomar();
  });
  // iOS congela a página sem avisar por visibilitychange em alguns casos
  window.addEventListener('pagehide', () => audio.suspender());
  window.addEventListener('pageshow', () => { if (!document.hidden) audio.retomar(); });
}

export default audio;
