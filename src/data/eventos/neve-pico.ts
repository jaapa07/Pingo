/**
 * Neve brilhante do Cume (spec 10A item 37): no dia 20 de novembro (relógio do aparelho mais o deslocamento do jogo),
 * depois do Conselho (`pos-jogo`, como diz o Seu Floco-Velho em `pp-neve`), o alto do Pico Pindorama (zona PP, acima
 * da muralha do Cume) ganha faíscas de cor piscando na neve e alguns flocos brilhantes descendo devagar.
 * Camada própria em DOM/CSS, em coordenadas do mapa (rola com a câmera), logo depois do chão (z 0) e por baixo dos atores (z 1).
 * Posições fixas por hash (sem sorteio): a neve é sempre a mesma.
 */
import { bus } from '../../core/events';
import { cond, jogo } from '../../core/estado';

/** retângulo do Cume em tiles (entre a borda e a muralha da linha 12 de src/data/zonas/PP.ts) */
const CUME = { x: 1, y: 1, w: 38, h: 11 };
/** faíscas saturadas (aparecem na neve branca de dia e na azulada de noite); o miolo acende em branco */
const CORES = ['#3fc8ff', '#ff5ab4', '#ffb43c', '#9a6aff', '#2fd88a', '#ff7a5a'];
const hash = (i: number, s: number) => (Math.imul(i + 1, 2654435761) ^ Math.imul(s + 7, 40503)) >>> 0;

/** hoje é o dia da neve brilhante? */
export function diaDaNeve(): boolean {
  const d = new Date(Date.now() + (jogo.save?.relogio?.deslocamentoMin ?? 0) * 60000);
  return d.getMonth() === 10 && d.getDate() === 20;
}

let estiloPronto = false;
function estilo() {
  if (estiloPronto) return; estiloPronto = true;
  const s = document.createElement('style');
  s.textContent = `
.neve-pico{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:0}
.neve-pico i{position:absolute;width:1px;height:1px}
.neve-pico .fa{background:currentColor;animation:np-pisca 2.4s steps(1) infinite}
.neve-pico .fl{animation:np-cai 6s steps(36) infinite}
@keyframes np-pisca{0%{opacity:.45;box-shadow:none}35%{opacity:1;background:#fff;box-shadow:-1px 0 0 currentColor,1px 0 0 currentColor,0 -1px 0 currentColor,0 1px 0 currentColor}50%{opacity:1;box-shadow:none}70%{opacity:.45;box-shadow:none}100%{opacity:.45;box-shadow:none}}
@keyframes np-cai{0%{transform:translateY(0);opacity:0}12%{opacity:1}80%{opacity:1}100%{transform:translateY(36px);opacity:0}}`;
  document.head.append(s);
}

let camada: HTMLElement | null = null;
async function mostrar() {
  const { M } = await import('../../world/vivo');
  const cena = M.cena;
  if (!cena?.cam || !cena.sprites || !M.zv) return;
  estilo(); camada?.remove();
  const el = document.createElement('div'); el.className = 'neve-pico'; el.dataset.neveBrilhante = '1';
  let html = '';
  // faíscas paradas na neve (fora das rochas e da muralha)
  for (let i = 0, n = 0; i < 400 && n < 90; i++) {
    const a = hash(i, 1), px = CUME.x * 16 + (a % (CUME.w * 16)), py = CUME.y * 16 + ((a >>> 11) % (CUME.h * 16));
    const tx = Math.floor(px / 16), ty = Math.floor(py / 16), ch = M.zv.ch(tx, ty);
    if (ch === '#' || ch === ' ' || M.zv.temObjeto(tx, ty)) continue;
    const cor = CORES[(a >>> 5) % CORES.length], atraso = ((a >>> 3) % 24) / 10;
    html += `<i class="fa" style="left:${px}px;top:${py}px;color:${cor};animation-delay:-${atraso}s"></i>`;
    n++;
  }
  // flocos brilhantes descendo devagar
  for (let i = 0; i < 28; i++) {
    const a = hash(i, 9), px = CUME.x * 16 + (a % (CUME.w * 16)), py = CUME.y * 16 - 8 + ((a >>> 12) % (CUME.h * 16 - 24));
    const cor = CORES[(a >>> 4) % CORES.length], atraso = ((a >>> 7) % 60) / 10;
    html += `<i class="fl" style="left:${px}px;top:${py}px;background:${cor};animation-delay:-${atraso}s"></i>`;
  }
  el.innerHTML = html;
  cena.cam.insertBefore(el, cena.sprites);
  camada = el;
}
function esconder() { camada?.remove(); camada = null; }

if (typeof document !== 'undefined') bus.on('zona', (e: unknown) => {
  const id = (e as { id?: string } | undefined)?.id;
  esconder();
  if (id === 'PP' && cond('pos-jogo') && diaDaNeve()) void mostrar();
});
