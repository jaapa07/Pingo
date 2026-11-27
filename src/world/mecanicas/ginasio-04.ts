/**
 * Ginásio 4 (Encanto, A5) — espelhos de renda refletem raios de luz.
 * Cada vitral (na parede) lança um raio em linha reta. O raio para em parede, móvel ou cortina fechada e é
 * desviado em 90° pelos espelhos, que giram entre `/` e `\` quando o jogador interage. Tile com raio fica
 * intransitável (a luz ofusca). Estrela de cristal que recebe um raio acende; com as duas acesas, a cortina do
 * salão da líder abre. O estado vive só na visita: ao sair, espelhos e cortina voltam ao começo.
 */
import type { Dir } from '../../core/tipos';
import { registrarMecanica } from '../registro';
import { M, Enfeites, recolocar, Ladrilho, DX, DY, laco, cena, falar, avisar, sfx, quadros, naZona, chave } from './_pecas';
import { tr } from '../../i18n';

const ZONA = 'A5-ginasio';
type Giro = '/' | '\\';
interface Espelho { x: number; y: number; g: Giro }
const VITRAIS: { x: number; y: number; d: Dir }[] = [{ x: 3, y: 13, d: 's' }, { x: 0, y: 10, d: 'l' }, { x: 18, y: 6, d: 'o' }];
const ESTRELAS: [number, number][] = [[0, 5], [12, 3]];
const CORTINA: [number, number] = [9, 3];
const INICIAL: Espelho[] = [{ x: 3, y: 14, g: '\\' }, { x: 6, y: 10, g: '/' }, { x: 6, y: 5, g: '/' }, { x: 12, y: 6, g: '/' }];
const REFLEXO: Record<Giro, Record<Dir, Dir>> = { '/': { n: 'l', l: 'n', s: 'o', o: 's' }, '\\': { n: 'o', o: 'n', s: 'l', l: 's' } };
const enf = new Enfeites();
let espelhos: Espelho[] = [], raio = new Set<string>(), acesas: boolean[] = [false, false], aberta = false;

const BARRA = ['......kkk', '.....kwwk', '....kwwk.', '...kwwk..', '..kwwk...', '.kwwk....', 'kwwk.....', 'kwk......', 'kk.......'];
const CONTRA = BARRA.map((l) => l.split('').reverse().join(''));
const ESTRELA = ['....k....', '...kwk...', 'kkkkwkkkk', 'kwwwwwwwk', '.kwwwwwk.', '..kwwwk..', '.kwwkwwk.', '.kwk.kwk.', '.kk...kk.'];
const VITRAL = ['.kkkkk.', 'kywywyk', 'kwywywk', 'kywywyk', 'kwywywk', '.kkkkk.'];

function tracar() {
  const novo = new Set<string>(), luz = [false, false];
  for (const v of VITRAIS) {
    let x = v.x, y = v.y, d = v.d;
    for (let n = 0; n < 80; n++) {
      x += DX[d]; y += DY[d];
      const e = espelhos.find((m) => m.x === x && m.y === y);
      if (e) { d = REFLEXO[e.g][d]; continue; }
      const s = ESTRELAS.findIndex(([a, b]) => a === x && b === y);
      if (s >= 0) { luz[s] = true; break; }
      if (!'.,:;+'.includes(M.zv.ch(x, y)) || (x === CORTINA[0] && y === CORTINA[1] && !aberta) || M.zv.objeto(x, y)) break;
      novo.add(chave(x, y));
    }
  }
  for (const k of raio) if (!novo.has(k)) { const [x, y] = k.split(',').map(Number); M.zv.bloquear(x, y, false); enf.tirar('r' + k); }
  for (const k of novo) if (!raio.has(k)) { const [x, y] = k.split(',').map(Number); M.zv.bloquear(x, y, true); enf.tile('r' + k, 'perigo', x, y); }
  raio = novo;
  const antes = acesas; acesas = luz;
  ESTRELAS.forEach(([x, y], i) => enf.pix('e' + i, [ESTRELA], luz[i] ? { k: '#946414', w: '#fffcc0' } : { k: '#3c2c5c', w: '#8c7cac' }, x, y, { dx: 3, dy: 3, z: 3 }));
  return luz.some((l, i) => l && !antes[i]);
}
function pintarEspelho(e: Espelho) { enf.pix(`m${e.x},${e.y}`, [e.g === '/' ? BARRA : CONTRA], { w: '#fce46c', k: '#5c2c7c' }, e.x, e.y, { dx: 3, dy: -4, z: e.y * 16 + 20 }); }
function cortina(fechada: boolean) {
  const [x, y] = CORTINA;
  M.zv.bloquear(x, y, fechada);
  if (fechada) enf.tile('cortina', 'parede', x, y, 2); else enf.tirar('cortina');
}
async function girar(e: Espelho) {
  e.g = e.g === '/' ? '\\' : '/';
  sfx('ui-ok'); pintarEspelho(e);
  await quadros(8);
  const acendeu = tracar();
  if (acendeu) { sfx('item-obtido'); avisar(acesas.every(Boolean) ? 'As duas estrelas de cristal estão acesas!' : 'Uma estrela de cristal acendeu!'); }
  const abrir = acesas.every(Boolean);
  if (abrir !== aberta) {
    aberta = abrir; cortina(!aberta); tracar();
    M.cena.tremer(6); sfx(aberta ? 'porta' : 'batida');
    await falar(aberta ? 'A cortina de renda do salão da líder se abriu!' : 'Uma estrela apagou e a cortina de renda se fechou de novo.');
  }
}

registrarMecanica(ZONA, {
  entrar() {
    // jogo retomado (Continuar ou app que voltou do segundo plano) lá dentro: os espelhos recomeçam do zero e
    // quem estava além da entrada podia ficar sem caminho nenhum (ex.: no salão do líder depois da insígnia)
    if (M.jog.y <= 12) { recolocar(8, 16, 'n'); cena(() => falar('Os espelhos voltaram ao lugar enquanto você estava fora.\nA Iracema mandou você recomeçar pela entrada do salão.')); }
    enf.esquecer(); raio = new Set(); acesas = [false, false]; aberta = false;
    espelhos = INICIAL.map((e) => ({ ...e }));
    espelhos.forEach(pintarEspelho);
    for (const [i, v] of VITRAIS.entries()) enf.pix('v' + i, [VITRAL], { k: '#946414', y: '#fce46c', w: '#fffcf0' }, v.x, v.y, { dx: 4, dy: 5, z: 3 });
    cortina(true);
    tracar();
    let f = 0;
    laco(() => naZona(ZONA), (q) => { if (q % 12) return; f++; for (const k of raio) enf.pegar<Ladrilho>('r' + k)?.quadro(f); });
  },
  interagir(x, y) {
    const e = espelhos.find((m) => m.x === x && m.y === y);
    if (e) { cena(() => girar(e)); return true; }
    if (raio.has(chave(x, y))) { cena(() => falar('Um raio de luz forte demais para encarar. Só girando um espelho ele sai do caminho.')); return true; }
    if (x === CORTINA[0] && y === CORTINA[1] && !aberta) { cena(() => falar(tr('Uma cortina de renda grossa fecha o salão da líder.\nEla só abre com as duas estrelas de cristal acesas ({n} de 2).', { n: acesas.filter(Boolean).length }))); return true; }
    const s = ESTRELAS.findIndex(([a, b]) => a === x && b === y);
    if (s >= 0) { cena(() => falar(acesas[s] ? 'A estrela de cristal brilha com a luz do vitral.' : 'Uma estrela de cristal apagada, presa à parede. Falta luz.')); return true; }
    if (VITRAIS.some((v) => v.x === x && v.y === y)) { cena(() => falar('Um vitral amarelo. A luz do sol entra por ele num raio só, reto como linha de bilro.')); return true; }
    return false;
  },
  sair() { espelhos = []; raio = new Set(); enf.esquecer(); },
});
