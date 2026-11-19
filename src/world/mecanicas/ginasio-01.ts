/**
 * Ginásio 1 (Vento, A2) — correntes de vento sobre o píer.
 * Quem termina um passo num tile de vento (`x`) é empurrado na direção da corrente, tile a tile, até sair dela
 * ou encostar em algo firme (mastro, corda, deque ocupado). Corrente que acaba no mar derruba o jogador na água:
 * ele volta para a entrada. A alavanca do deque nordeste inverte, juntas, as duas pranchas do norte.
 * O estado vive só na visita (ao sair, os cata-ventos voltam à posição inicial).
 */
import type { Dir } from '../../core/tipos';
import { registrarMecanica } from '../registro';
import { M, Enfeites, DIVISAS, DX, DY, laco, arrastar, cair, cena, livre, olharTreinadores, falar, avisar, sfx, quadros, naZona } from './_pecas';

const ZONA = 'A2-ginasio';
const INICIO: [number, number] = [8, 16];
const ALAVANCA: [number, number] = [14, 3];
const enf = new Enfeites();
let invertido = false;

/** direção da corrente em (x, y), se houver */
function vento(x: number, y: number): Dir | undefined {
  if (M.zv.ch(x, y) !== 'x') return undefined;
  if (x === 8 && y >= 12 && y <= 14) return 'n';
  if (y === 10 || y === 4) return 'l';
  if (x === 3) return invertido ? 'n' : 's';
  if (x === 13) return invertido ? 's' : 'n';
  return undefined;
}
const PAL = { w: '#f4fbff' };
function pintar() {
  const z = M.zv;
  for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) {
    const d = vento(x, y);
    if (d) enf.pix(`v${x},${y}`, [DIVISAS[d], DIVISAS[d]], PAL, x, y, { dx: 3, dy: 3, z: 2 });
  }
}
async function soprar() {
  const j = M.jog;
  for (let n = 0; n < 40; n++) {
    const d = vento(j.x, j.y);
    if (!d) break;
    const nx = j.x + DX[d], ny = j.y + DY[d];
    if (M.zv.agua(nx, ny)) {
      await arrastar(d, 6);
      sfx('passo-agua'); M.cena.tremer(6);
      await cair(INICIO[0], INICIO[1], 'n');
      await falar('TCHIBUM! O vento jogou você no mar.\nUm pescador puxou você de volta para a entrada do píer.');
      break;
    }
    if (!livre(nx, ny)) break;
    if (n === 0) sfx('voo');
    await arrastar(d, 6);
  }
  await olharTreinadores();
}

registrarMecanica(ZONA, {
  entrar() {
    invertido = false; enf.esquecer();
    pintar();
    let fase = 0;
    laco(() => naZona(ZONA), (q) => {
      if (q % 10) return;
      fase++;
      // as divisas "andam" 1 px na direção do vento, em 3 posições
      const z = M.zv;
      for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) {
        const d = vento(x, y); if (!d) continue;
        enf.pegar(`v${x},${y}`)?.pos(x * 16 + 3 + DX[d] * (fase % 3), y * 16 + 3 + DY[d] * (fase % 3));
      }
    });
  },
  passo(x, y) {
    if (!vento(x, y)) return false;
    cena(soprar);
    return true;
  },
  interagir(x, y) {
    if (x === ALAVANCA[0] && y === ALAVANCA[1]) {
      cena(async () => {
        invertido = !invertido;
        sfx('ui-ok'); M.cena.tremer(4);
        await quadros(10);
        pintar(); sfx('voo');
        avisar('Os cata-ventos das pranchas do norte viraram!');
        await falar(invertido ? 'A prancha da direita agora sopra para o sul, e a da esquerda para o norte.' : 'A prancha da direita voltou a soprar para o norte, e a da esquerda para o sul.');
      });
      return true;
    }
    if (M.zv.agua(x, y)) { cena(() => falar('O mar bate forte nas estacas do píer. Aqui só se anda sobre as tábuas.')); return true; }
    const d = vento(x, y);
    if (d) { cena(() => falar('Uma corrente de vento varre as tábuas. Quem pisar ali vai junto com ela.')); return true; }
    return false;
  },
  sair() { invertido = false; enf.esquecer(); },
});
