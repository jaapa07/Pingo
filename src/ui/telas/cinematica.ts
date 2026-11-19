/**
 * CINEMÁTICA de viagem (warps `trem` e `saveiro`, comando ['cinematica', id] sem cinemática própria): a paisagem
 * passa em camadas (parallax) atrás do vagão da Maria-Fumaça ou do Saveiro. Dura ~5 s; A, B ou um toque pulam.
 * Tudo em DOM: cada camada é um fundo repetido desenhado com retângulos de pixel (sem canvas).
 */
import { periodo } from '../../core/estado';
import { bus } from '../../core/events';
import { input, tocavel } from '../../core/input';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, em } from '../fonte';
import { moldura } from '../kit';

type Ret = [number, number, number, number, string];
const fundo = (w: number, h: number, rs: Ret[]) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${rs.map(([x, y, a, b, c]) => `<rect x='${x}' y='${y}' width='${a}' height='${b}' fill='${c}'/>`).join('')}</svg>`)}")`;
/** silhueta em degraus de 4 px a partir de um perfil de alturas */
function serra(perfil: number[], h: number, cor: string, luz: string): { w: number; img: string } {
  const rs: Ret[] = [];
  perfil.forEach((a, i) => { rs.push([i * 4, h - a, 4, a, cor]); rs.push([i * 4, h - a, 4, 1, luz]); });
  return { w: perfil.length * 4, img: fundo(perfil.length * 4, h, rs) };
}
const onda = (n: number, base: number, amp: number, passo: number, fase = 0) => Array.from({ length: n }, (_, i) => Math.round(base + amp * Math.sin((i / n) * Math.PI * 2 * passo + fase) + (amp / 3) * Math.sin((i / n) * Math.PI * 2 * passo * 3 + 1)));

const CEU = {
  manha: ['#ffd9a8', '#ffe9c4', '#bfe6f2', '#8fd0ee'], dia: ['#6fc0ef', '#8fd0f2', '#b4e2f6', '#d8f1f8'],
  tarde: ['#f08a4b', '#f6b060', '#f9d58a', '#fbe9b8'], noite: ['#141a3c', '#1c2450', '#263062', '#33407a'],
};
const TOM = {
  manha: { longe: '#8fa9c9', meio: '#5f9a6a', perto: '#3c7a48', chao: '#c9a56a', luz: '#fff2c8' },
  dia: { longe: '#86b0d6', meio: '#58a85a', perto: '#2f7d32', chao: '#d2b074', luz: '#fff8e7' },
  tarde: { longe: '#b07a8a', meio: '#7a7a4a', perto: '#4a5a2a', chao: '#b88a54', luz: '#ffe0a0' },
  noite: { longe: '#2c3a6a', meio: '#1f3a48', perto: '#142a2e', chao: '#3a3550', luz: '#9fb4ff' },
};
interface Camada { el: HTMLElement; w: number; vel: number; x: number }

function trem(): HTMLElement {
  const k = '#1a1423', r = '#c8382e', R = '#8f2420', f = '#f9c22b', v = '#2f6b3a', V = '#1f4a28', j = '#bfe9ff', m = '#5a5560', c = '#fff8e7';
  const rs: Ret[] = [
    // locomotiva (à direita, puxando para a direita)
    [112, 14, 46, 20, k], [113, 15, 44, 18, r], [113, 28, 44, 5, R], [150, 4, 8, 12, k], [151, 5, 6, 10, m], [148, 2, 12, 3, k],
    [100, 6, 20, 28, k], [101, 7, 18, 26, r], [104, 10, 10, 9, k], [105, 11, 8, 7, j], [98, 4, 24, 3, k], [158, 22, 6, 12, k], [159, 26, 8, 8, f],
    [128, 10, 8, 5, k], [129, 11, 6, 3, f],
    // vagão de passageiros
    [8, 8, 84, 26, k], [9, 9, 82, 24, v], [9, 26, 82, 7, V], [6, 5, 88, 4, k], [7, 6, 86, 2, c], [92, 24, 8, 3, k],
    ...[16, 34, 52, 70].map((x): Ret => [x, 12, 14, 11, k]), ...[16, 34, 52, 70].map((x): Ret => [x + 1, 13, 12, 9, j]),
    // rodas
    ...[18, 40, 70, 108, 126, 144].map((x): Ret => [x, 32, 10, 10, k]), ...[18, 40, 70, 108, 126, 144].map((x): Ret => [x + 3, 35, 4, 4, m]),
  ];
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;width:168px;height:42px;background-image:${fundo(168, 42, rs)};background-repeat:no-repeat;image-rendering:pixelated`;
  return el;
}
function saveiro(): HTMLElement {
  const k = '#1a1423', m = '#9c6434', M = '#6b4423', c = '#fff8e7', C = '#e6d9b8', r = '#e0483c';
  const rs: Ret[] = [
    [44, 2, 3, 46, k], [47, 4, 2, 2, r], [49, 4, 6, 4, r],
    ...Array.from({ length: 18 }, (_, i): Ret => [46 - i * 2, 8 + i * 2, i * 2 + 1, 2, k]), ...Array.from({ length: 17 }, (_, i): Ret => [47 - i * 2, 10 + i * 2, i * 2, 2, i % 4 === 3 ? C : c]),
    ...Array.from({ length: 12 }, (_, i): Ret => [49, 12 + i * 3, 4 + i * 2, 3, i % 3 === 2 ? C : c]), [49, 46, 30, 2, k],
    [6, 48, 84, 4, k], [8, 52, 80, 4, k], [12, 56, 72, 4, k], [18, 60, 60, 3, k],
    [8, 49, 80, 3, m], [10, 52, 76, 4, m], [14, 56, 68, 3, M], [20, 59, 56, 2, M], [10, 50, 76, 1, c],
  ];
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;width:96px;height:64px;background-image:${fundo(96, 64, rs)};background-repeat:no-repeat;image-rendering:pixelated`;
  return el;
}

export interface ArgsCinematica { id?: string; ms?: number; titulo?: string }
export function criarCinematica(args: ArgsCinematica = {}): Tela {
  const barco = args.id === 'saveiro', per = periodo(), ceu = CEU[per], tom = TOM[per];
  const el = elTela('ui', 'tela-cinematica');
  el.style.background = `linear-gradient(to bottom, ${ceu[0]} 0 24px, ${ceu[1]} 24px 48px, ${ceu[2]} 48px 76px, ${ceu[3]} 76px 180px)`;
  const camadas: Camada[] = [];
  const camada = (img: string, w: number, h: number, y: number, vel: number) => {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;left:0;top:${y}px;width:${320 + w}px;height:${h}px;background-image:${img};background-repeat:repeat-x;image-rendering:pixelated;will-change:transform`;
    el.append(d); camadas.push({ el: d, w, vel, x: 0 });
  };
  // sol ou lua
  const astro = document.createElement('div');
  astro.style.cssText = `position:absolute;left:236px;top:${per === 'tarde' ? 44 : 14}px;width:18px;height:18px;background:${per === 'noite' ? '#e8ecff' : '#fff07a'};box-shadow:0 0 0 2px ${per === 'noite' ? '#aab4e8' : '#f9c22b'}`;
  el.append(astro);
  const nuvem: Ret[] = [[6, 6, 30, 6, tom.luz], [12, 2, 14, 4, tom.luz], [40, 10, 16, 4, tom.luz], [90, 4, 22, 5, tom.luz], [96, 1, 10, 3, tom.luz]];
  camada(fundo(160, 16, nuvem), 160, 16, 18, 4);
  const longe = serra(onda(60, 26, 10, 2), 44, tom.longe, tom.luz), meio = serra(onda(48, 18, 8, 3, 2), 34, tom.meio, tom.perto);
  camada(longe.img, longe.w, 44, barco ? 62 : 58, 10);
  if (barco) {
    camada(meio.img, meio.w, 34, 80, 18);
    const agua: Ret[] = [[0, 0, 32, 70, '#2f7fc4'], [0, 0, 32, 2, '#bfe9ff'], [2, 8, 10, 1, '#6fc7e8'], [18, 14, 9, 1, '#6fc7e8'], [6, 24, 12, 1, '#6fc7e8'], [20, 34, 8, 1, '#6fc7e8'], [4, 46, 10, 1, '#1f5f9a'], [16, 58, 12, 1, '#1f5f9a']];
    camada(fundo(32, 70, agua), 32, 70, 110, 46);
    const marola: Ret[] = [[0, 0, 12, 2, '#fff8e7'], [20, 3, 9, 1, '#bfe9ff'], [34, 1, 6, 1, '#fff8e7']];
    camada(fundo(48, 6, marola), 48, 6, 138, 90);
  } else {
    camada(meio.img, meio.w, 34, 80, 22);
    const mata: Ret[] = [];
    [0, 22, 40, 66, 84, 110].forEach((x, i) => { const h = 22 + (i % 3) * 6; mata.push([x + 5, 40 - 8, 3, 8, '#4a3524'], [x, 40 - h, 14, h - 6, tom.perto], [x + 2, 40 - h - 3, 10, 4, tom.perto], [x + 2, 40 - h, 4, 2, tom.meio]); });
    camada(fundo(128, 40, mata), 128, 40, 92, 60);
    const chao: Ret[] = [[0, 0, 16, 48, tom.chao], [0, 0, 16, 2, tom.meio], [3, 9, 4, 1, tom.perto], [10, 30, 3, 1, tom.perto]];
    camada(fundo(16, 48, chao), 16, 48, 132, 150);
    const trilho: Ret[] = [[0, 0, 16, 2, '#5a5560'], [0, 2, 16, 1, '#1a1423'], [2, 3, 5, 4, '#6b4423'], [10, 3, 5, 4, '#6b4423'], [0, 7, 16, 2, '#5a5560'], [0, 9, 16, 1, '#1a1423']];
    camada(fundo(16, 10, trilho), 16, 10, 152, 220);
    const poste: Ret[] = [[60, 0, 3, 60, '#4a3524'], [52, 4, 19, 2, '#4a3524'], [0, 5, 240, 1, '#1a1423']];
    camada(fundo(240, 60, poste), 240, 60, 94, 220);
  }
  const veiculo = barco ? saveiro() : trem(), vx = barco ? 112 : 70, vy = barco ? 84 : 112;
  el.append(em(veiculo, vx, vy));
  const fumaca: { el: HTMLElement; x: number; y: number; t: number }[] = [];
  const placa = moldura('placa', 150, 17, 85, 6); placa.append(em(texto(args.titulo ?? (barco ? 'Saveiro do Rio Grande' : 'Trem Serra-Sol'), { cor: 'creme', sombra: true, largura: 138, alinhar: 'centro' }), 6, 5)); el.append(placa);
  const dica = em(texto('A: pular', { cor: per === 'noite' ? 'creme' : 'tinta' }), 268, 168); el.append(dica);
  const dur = (args.ms ?? 5000) / 1000;
  let t = 0, feito = false, somT = 0, fumoT = 0;
  const sair = () => { if (feito) return; feito = true; fechar(tela); };
  tocavel(el, sair);
  const tela: Tela = {
    el,
    entrar() { bus.emit('musica', barco ? 'saveiro' : 'trem'); bus.emit('cinematica', args.id ?? 'trem'); },
    atualizar(dt) {
      if (feito) return;
      t += dt;
      for (const c of camadas) { c.x = (c.x + c.vel * dt) % c.w; c.el.style.transform = `translate(${-Math.floor(c.x)}px,0)`; }
      const q = Math.floor(t * 8);
      em(veiculo, vx + (barco ? 0 : q % 2), vy + (barco ? Math.round(Math.sin(t * 2.4) * 2) : q % 4 === 0 ? 1 : 0));
      if (barco) veiculo.style.transform = `rotate(${Math.round(Math.sin(t * 2.4 + 1) * 2)}deg)`;
      somT -= dt; if (somT <= 0) { somT = barco ? 2.4 : 1.15; bus.emit('sfx', { id: barco ? 'saveiro' : 'trem' }); }
      if (!barco) {
        fumoT -= dt;
        if (fumoT <= 0) { fumoT = 0.22; const f = document.createElement('div'); f.style.cssText = 'position:absolute;width:6px;height:6px;background:#fff8e7;box-shadow:0 0 0 1px #c4c6d4'; el.insertBefore(f, veiculo); fumaca.push({ el: f, x: vx + 151, y: vy - 2, t: 0 }); }
        for (let i = fumaca.length - 1; i >= 0; i--) {
          const f = fumaca[i]; f.t += dt; f.x -= 70 * dt; f.y -= 14 * dt;
          const lado = 6 + Math.floor(f.t * 6); f.el.style.width = f.el.style.height = lado + 'px';
          em(f.el, f.x, f.y);
          if (f.t > 1.2) { f.el.remove(); fumaca.splice(i, 1); }
        }
      }
      if (t > 0.4 && (input.apertou('a') || input.apertou('b'))) { input.consumir('a'); input.consumir('b'); sair(); return; }
      if (t >= dur) sair();
    },
  };
  return tela;
}
