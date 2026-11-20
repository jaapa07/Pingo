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
  /** onde ficam os controles de toque: 'embaixo' (em pé), 'fora' (deitado, nas margens ao lado da tela) ou 'sobre' (sem margem: por cima, translúcidos) */
  controles: 'embaixo' as 'embaixo' | 'fora' | 'sobre',
  aoAjustar: [] as (() => void)[],
};
let sonda: HTMLElement;
/** largura mínima (px CSS) de cada margem lateral para os controles de toque ficarem fora da tela, deitado */
const MARGEM_CONTROLES = 84;
/** em pé, aceita escala de meio pixel do aparelho quando a inteira deixa o texto pequeno demais */
const MEIO_PASSO_RETRATO = true;
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
  const cabe = Math.min((areaW * dpr) / TELA_W, (altUtil * dpr) / TELA_H) + 1e-6;
  let k = Math.max(1, Math.floor(cabe));
  palco.controles = 'embaixo';
  if (palco.modo === 'retrato') {
    // em pé a largura manda: com menos de 4 pixels do aparelho por pixel do jogo, meio passo a mais (3 → 3,5) deixa o texto legível
    if (k < 4 && MEIO_PASSO_RETRATO && Math.floor(cabe * 2) / 2 > k) k = Math.floor(cabe * 2) / 2;
  } else if (palco.modo === 'paisagem') {
    // deitado os controles ficam FORA da tela: se as margens laterais não comportam um direcional, a tela desce
    // um passo de escala (até 60% da maior) para abrir espaço; sem jeito, eles vão por cima, translúcidos
    const margem = (kk: number) => Math.min(s.l + (areaW - (TELA_W * kk) / dpr) / 2, s.r + (areaW - (TELA_W * kk) / dpr) / 2);
    // desce de meio em meio passo; meio passo só vale em telas pequenas (até 4 px do aparelho por pixel do jogo)
    let kk = k; const piso = Math.max(1, Math.ceil(k * 0.6));
    while (kk > piso && margem(kk) < MARGEM_CONTROLES) kk -= 0.5;
    if (kk > 4) kk = Math.floor(kk);
    if (margem(kk) >= MARGEM_CONTROLES) { k = kk; palco.controles = 'fora'; } else palco.controles = 'sobre';
  }
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
  document.documentElement.dataset.controles = palco.modo === 'desktop' ? '' : palco.controles;
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
  // (o campo de texto do código de transferência fica livre: o menu Colar/Copiar do iOS depende dele)
  const barrar = (e: Event) => { if ((e.target as Element | null)?.closest?.('textarea')) return; e.preventDefault(); };
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend', 'contextmenu', 'dragstart', 'selectstart']) document.addEventListener(ev, barrar);
  document.addEventListener('touchmove', barrar, { passive: false });
  document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  return document.getElementById('tela')!;
}
