/**
 * Palco: mede a janela, escolhe a maior escala inteira (em pixels do aparelho) para a tela 320×180,
 * posiciona o quadro, o bisel, o fundo trançado e a camada de toque (em pé: embaixo; deitado: laterais).
 */
import { TELA_H, TELA_W } from '../core/tipos';
import { plataforma } from '../core/plataforma';
import { camada, moldura } from './kit';

export const palco = {
  /** escala CSS do quadro (inteira em pixels do aparelho) */
  escala: 1,
  modo: 'desktop' as 'desktop' | 'retrato' | 'paisagem',
  /** retângulo da tela do jogo em px CSS */
  x: 0, y: 0, w: TELA_W, h: TELA_H,
  /** área segura do aparelho */
  seguro: { t: 0, r: 0, b: 0, l: 0 },
  vw: 0, vh: 0, dpr: 1,
  aoAjustar: [] as (() => void)[],
};
let sonda: HTMLElement;
const noPixel = (v: number) => Math.round(v * palco.dpr) / palco.dpr;

export function ajustarPalco() {
  const quadro = document.getElementById('quadro')!, fundo = document.getElementById('fundo')!;
  const cs = getComputedStyle(sonda);
  const s = palco.seguro = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
  const vw = palco.vw = window.innerWidth, vh = palco.vh = window.innerHeight, dpr = palco.dpr = window.devicePixelRatio || 1;
  palco.modo = !plataforma.toque ? 'desktop' : vh >= vw ? 'retrato' : 'paisagem';
  const areaW = vw - s.l - s.r, areaH = vh - s.t - s.b;
  // em pé, a metade de baixo fica para os controles: a tela usa no máximo 46% da altura
  const altUtil = palco.modo === 'retrato' ? Math.max(TELA_H, areaH * 0.46) : areaH;
  const k = Math.max(1, Math.floor(Math.min((areaW * dpr) / TELA_W, (altUtil * dpr) / TELA_H) + 1e-6));
  const e = palco.escala = k / dpr;
  palco.w = TELA_W * e; palco.h = TELA_H * e;
  palco.x = noPixel(s.l + (areaW - palco.w) / 2);
  palco.y = palco.modo === 'retrato' ? noPixel(s.t + Math.min(8 * e, Math.max(0, (altUtil - palco.h) / 2))) : noPixel(s.t + (areaH - palco.h) / 2);
  quadro.style.transform = `translate(${palco.x}px, ${palco.y}px) scale(${e})`;
  const p = camada('palha');
  fundo.style.backgroundImage = `url(${p.url})`;
  fundo.style.backgroundSize = `${p.w * e}px ${p.h * e}px`;
  fundo.style.backgroundPosition = `${palco.x}px ${palco.y}px`;
  document.documentElement.dataset.modo = palco.modo;
  for (const f of palco.aoAjustar) f();
}

export function iniciarPalco(): HTMLElement {
  sonda = document.createElement('div'); sonda.id = 'sonda-segura'; document.body.append(sonda);
  document.getElementById('quadro')!.append(moldura('bisel', TELA_W + 14, TELA_H + 14));
  ajustarPalco();
  window.addEventListener('resize', ajustarPalco);
  window.addEventListener('orientationchange', () => setTimeout(ajustarPalco, 60));
  window.visualViewport?.addEventListener('resize', ajustarPalco);
  // sem zoom, sem rolagem elástica, sem menu de contexto
  const barrar = (e: Event) => e.preventDefault();
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend', 'contextmenu', 'dragstart', 'selectstart']) document.addEventListener(ev, barrar);
  document.addEventListener('touchmove', barrar, { passive: false });
  document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  return document.getElementById('tela')!;
}
