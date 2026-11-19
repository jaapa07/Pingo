/**
 * Ginásio 4 (Mata, B1) — labirinto de cipós que cresce a cada passo.
 * Cada cipó tem uma raiz, uma rota (tiles em ordem) e um atraso em passos. A cada passo do jogador, o cipó que já
 * "acordou" avança um tile pela rota (não cresce sobre gente). Os vasos de extrato (`C`) fazem todos murcharem
 * e zeram a contagem; o Facão (com criatura de Mata, Inseto ou Ginga) corta um cipó, que recomeça da raiz.
 * Depois de vencida a líder, os cipós ficam murchos. Ao sair, tudo recomeça.
 */
import type { Dir } from '../../core/tipos';
import { TILE } from '../../core/tipos';
import { flag } from '../../core/estado';
import { ajudante } from '../vivo';
import { nomeCriatura } from '../deps';
import { registrarMecanica } from '../registro';
import { M, Enfeites, DX, DY, cena, falar, avisar, sfx, quadros, livre } from './_pecas';

const ZONA = 'B1-ginasio';
interface Cipo { tiles: [number, number][]; atraso: number; nasc: number; n: number }
const PLANTA: { de: [number, number]; rota: string; atraso: number }[] = [
  { de: [1, 14], rota: 'llllllllllllll', atraso: 0 }, // salão sul: corre pela fila 14 até a portinhola
  { de: [13, 12], rota: 'oooo', atraso: 8 }, // fila 12: fecha o caminho do bolsão sul
  { de: [17, 4], rota: 'ooooss', atraso: 9 }, // corredor norte: desce a coluna 13 e fecha a subida no 16º passo
  { de: [3, 6], rota: 'lll', atraso: 7 }, // fila 6: fecha a saída para o noroeste no 10º passo
];
const enf = new Enfeites();
let cipos: Cipo[] = [], passos = 0;

const vencido = () => flag('ginasio-04-vencido');
const cipoEm = (x: number, y: number) => cipos.find((c) => c.tiles.slice(0, c.n).some(([a, b]) => a === x && b === y));
function murchar(c: Cipo, i: number) {
  for (let k = 0; k < c.n; k++) { const [x, y] = c.tiles[k]; M.zv.bloquear(x, y, false); enf.tirar(`c${i}-${k}`); }
  c.n = 0; c.nasc = passos;
}
function crescer() {
  if (vencido()) { cipos.forEach((c, i) => { if (c.n) murchar(c, i); }); return; }
  let cresceu = false;
  cipos.forEach((c, i) => {
    if (c.n >= c.tiles.length || c.n >= passos - c.nasc - c.atraso) return;
    const [x, y] = c.tiles[c.n];
    if (!livre(x, y) || (M.jog.x === x && M.jog.y === y)) return;
    M.zv.bloquear(x, y, true);
    enf.tile(`c${i}-${c.n}`, 'din-c', x, y, y * TILE + 15);
    c.n++; cresceu = true;
  });
  if (cresceu && passos % 2 === 0) sfx('passo-grama');
}
async function borrifar() {
  sfx('chuva');
  await quadros(12);
  cipos.forEach(murchar);
  passos = 0; for (const c of cipos) c.nasc = 0;
  M.cena.tremer(4);
  avisar('Os cipós murcharam!');
  await falar(vencido() ? 'O extrato de raiz amarga perfuma a estufa. Os cipós já dormem desde a sua vitória.' : 'Você borrifou o extrato de raiz amarga. Todos os cipós da estufa murcharam…\nmas já estão brotando de novo. Cada passo conta!');
}
async function cortar(c: Cipo) {
  const a = ajudante('facao');
  if (!a) { await falar('Um cipó grosso e vivo fechou a passagem.\nSem o Facão e uma criatura que saiba usá-lo, só o extrato dos vasos faz o cipó murchar.'); return; }
  sfx('facao');
  await quadros(10);
  murchar(c, cipos.indexOf(c));
  await falar(`${nomeCriatura(a)} cortou o cipó com o Facão! Ele murchou até a raiz… e já começa a brotar de novo.`);
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer(); passos = 0;
    cipos = PLANTA.map((p) => {
      let [x, y] = p.de; const tiles: [number, number][] = [[x, y]];
      for (const d of p.rota as unknown as Dir[]) { x += DX[d]; y += DY[d]; tiles.push([x, y]); }
      return { tiles, atraso: p.atraso, nasc: 0, n: 0 };
    });
  },
  passo() { passos++; crescer(); return false; },
  interagir(x, y) {
    if (M.zv.ch(x, y) === 'C') { cena(borrifar); return true; }
    const c = cipoEm(x, y);
    if (c) { cena(() => cortar(c)); return true; }
    return false;
  },
  sair() { cipos = []; passos = 0; enf.esquecer(); },
});
