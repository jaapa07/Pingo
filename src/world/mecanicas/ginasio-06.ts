/**
 * Ginásio 6 (Assombro, A7) — salas escuras; só a lamparina mostra o caminho real.
 * A mecânica cuida do breu (máscara de escuro própria, independente do Lampião de campo): com a lamparina de
 * mão acesa o jogador enxerga um círculo largo e os alçapões a até 2 tiles; apagada, só um palmo em volta.
 * Cada lamparina de pé (`gin-lamparina`) reabastece 16 passos de óleo. Alçapão pisado = queda: o jogador volta
 * ao começo da sala e a chama apaga. Vencida a líder, os lustres acendem e os alçapões ficam à mostra.
 * Ao sair, tudo recomeça.
 */
import { flag } from '../../core/estado';
import { registrarMecanica } from '../registro';
import { M, Enfeites, laco, cair, cena, falar, avisar, sfx, naZona, chave } from './_pecas';

const ZONA = 'A7-ginasio';
const OLEO = 16;
/** `o` = alçapão (linhas do mapa; as demais não têm armadilha) */
const ALCAPOES: Record<number, string> = {
  4: '#o.......ooooo...o#', 5: '#o.ooo.....ooooo.o#', 6: '#..ooo.ooo.......o#', 7: '#o.....oo...oooooo#',
  9: '#ooo.....o.....ooo#', 10: '#ooo.ooo.ooooo.ooo#', 11: '#o....oo........oo#',
  13: '#ooo.........ooooo#', 14: '#ooooooooooo.ooooo#',
};
const LAMPARINAS: [number, number][] = [[13, 16], [2, 11], [15, 11], [11, 7], [1, 6]];
/** começo de cada sala (para onde a queda devolve), pela linha em que o jogador caiu */
const volta = (y: number): [number, number] => (y >= 13 ? [12, 15] : y >= 9 ? [4, 11] : [10, 7]);
const enf = new Enfeites();
let oleo = 0, claro = false;

const vencido = () => !!flag('ginasio-06-vencido');
const alcapao = (x: number, y: number) => ALCAPOES[y]?.[x] === 'o';
function revelar() {
  const j = M.jog, tudo = vencido();
  for (const ys of Object.keys(ALCAPOES)) {
    const y = Number(ys);
    for (let x = 1; x < 18; x++) {
      if (!alcapao(x, y)) continue;
      const ver = tudo || (oleo > 0 && Math.max(Math.abs(x - j.x), Math.abs(y - j.y)) <= 2);
      const k = 'a' + chave(x, y);
      if (ver && !enf.tem(k)) enf.tile(k, 'buraco', x, y); else if (!ver && enf.tem(k)) enf.tirar(k);
    }
  }
}
function luz() { M.cena.definirEscuro(vencido() ? 0 : oleo > 0 ? (oleo <= 4 ? 44 : 60) : 22); }
async function acender() {
  if (vencido()) { await falar('Os lustres do sobrado estão acesos desde a sua vitória. A lamparina pode descansar.'); return; }
  oleo = OLEO; sfx('item-obtido');
  luz(); revelar();
  avisar(`Lamparina acesa: óleo para ${OLEO} passos.`);
}
async function queda(x: number, y: number) {
  const [vx, vy] = volta(y);
  enf.tile('a' + chave(x, y), 'buraco', x, y);
  sfx('quebrar'); M.cena.tremer(8);
  await cair(vx, vy, 'n');
  oleo = 0; luz(); revelar();
  await falar('NHEEEC… PLOFT! Um alçapão se abriu debaixo dos seus pés.\nVocê escorregou por um tobogã empoeirado até o começo da sala, e a lamparina apagou.');
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer(); oleo = 0; claro = vencido();
    luz(); revelar();
    // o motor reaplica a luz da zona depois de batalhas e roteiros: a mecânica mantém a sua
    laco(() => naZona(ZONA), () => { luz(); if (vencido() && !claro) { claro = true; revelar(); } });
  },
  passo(x, y) {
    if (vencido()) return false;
    if (alcapao(x, y)) { cena(() => queda(x, y)); return true; }
    if (oleo > 0) {
      oleo--;
      if (oleo === 4) avisar('A chama da lamparina está fraquinha…');
      if (oleo === 0) { sfx('ui-erro'); avisar('A lamparina apagou!'); }
    }
    luz(); revelar();
    return false;
  },
  interagir(x, y) {
    if (LAMPARINAS.some(([a, b]) => a === x && b === y)) { cena(acender); return true; }
    return false;
  },
  sair() { enf.esquecer(); oleo = 0; M.cena.definirEscuro(0); },
});
