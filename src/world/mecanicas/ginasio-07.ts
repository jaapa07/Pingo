/**
 * Ginásio 7 (Ferro, A8) — esteiras e engrenagens que mudam de direção.
 * Cada esteira pertence a um circuito (vermelho ou azul) e tem um sentido "normal"; a engrenagem da cor inverte
 * todas as esteiras do circuito. Quem termina um passo sobre a esteira é carregado tile a tile até sair dela ou
 * encostar em algo; se o fim da linha é a prensa de vapor (`x`), leva um jato e volta à entrada.
 * Vencida a líder, as esteiras param. Ao sair, os circuitos voltam ao sentido inicial.
 */
import type { Dir } from '../../core/tipos';
import { flag } from '../../core/estado';
import { OPOSTO } from '../zonas';
import { registrarMecanica } from '../registro';
import { M, Enfeites, DIVISAS, DX, DY, laco, arrastar, cair, cena, livre, olharTreinadores, falar, avisar, sfx, quadros, naZona } from './_pecas';
import { tr } from '../../i18n';

const ZONA = 'A8-ginasio';
const INICIO: [number, number] = [8, 16];
type Cor = 'vermelho' | 'azul';
interface Esteira { cor: Cor; tiles: [number, number][]; normal: Dir }
/** `normal` = sentido com o circuito no estado inicial */
const ESTEIRAS: Esteira[] = [
  { cor: 'vermelho', tiles: [[8, 12], [8, 13]], normal: 's' }, // porta → 1º andar (sobe só invertida)
  { cor: 'vermelho', tiles: [[3, 8], [3, 9]], normal: 'n' }, // esquerda: sobe só com o vermelho normal
  { cor: 'vermelho', tiles: [[9, 8], [9, 9]], normal: 's' }, // meio: invertida, leva à prensa
  { cor: 'azul', tiles: [[14, 8], [14, 9]], normal: 's' }, // direita: sobe com o azul invertido
  { cor: 'vermelho', tiles: [[2, 3], [2, 4], [2, 5]], normal: 'n' }, // 2º andar → mezanino
  { cor: 'azul', tiles: [[4, 2], [5, 2], [6, 2]], normal: 'l' }, // mezanino → líder (só com o azul normal)
];
const ENGRENAGENS: { x: number; y: number; cor: Cor }[] = [
  { x: 3, y: 15, cor: 'vermelho' }, { x: 16, y: 10, cor: 'azul' }, { x: 16, y: 6, cor: 'vermelho' }, { x: 1, y: 1, cor: 'azul' },
];
const PAL: Record<Cor, Record<string, string>> = { vermelho: { w: '#f0503c' }, azul: { w: '#4cb4f0' } };
const enf = new Enfeites();
let invertido: Record<Cor, boolean> = { vermelho: false, azul: false };

const vencido = () => !!flag('ginasio-07-vencido');
const esteiraEm = (x: number, y: number) => ESTEIRAS.find((e) => e.tiles.some(([a, b]) => a === x && b === y));
function sentido(x: number, y: number): Dir | undefined {
  const e = esteiraEm(x, y);
  if (!e || vencido()) return undefined;
  return invertido[e.cor] ? OPOSTO[e.normal] : e.normal;
}
function pintar() {
  for (const e of ESTEIRAS) for (const [x, y] of e.tiles) {
    const d = sentido(x, y);
    if (d) enf.pix(`s${x},${y}`, [DIVISAS[d]], PAL[e.cor], x, y, { dx: 3, dy: 3, z: 2 }); else enf.tirar(`s${x},${y}`);
  }
  ENGRENAGENS.forEach((g, i) => enf.pix('g' + i, [['.kkk.', 'kwwwk', 'kwwwk', 'kwwwk', '.kkk.']], { k: '#201c28', ...PAL[g.cor] }, g.x, g.y, { dx: 5, dy: -7, z: g.y * 16 + 30 }));
}
async function rolar() {
  const j = M.jog;
  for (let n = 0; n < 40; n++) {
    const d = sentido(j.x, j.y);
    if (!d) break;
    const nx = j.x + DX[d], ny = j.y + DY[d];
    if (M.zv.ch(nx, ny) === 'x') {
      await arrastar(d, 6);
      sfx('cachoeira'); M.cena.tremer(10);
      await cair(INICIO[0], INICIO[1], 'n');
      await falar('PSSSSH! A prensa de vapor soltou um jato bem na sua cara.\nOs operários carregaram você, tossindo, de volta para a entrada.');
      break;
    }
    if (!livre(nx, ny)) break;
    if (n === 0) sfx('empurrar');
    await arrastar(d, 7);
  }
  await olharTreinadores();
}
async function girar(g: (typeof ENGRENAGENS)[number]) {
  if (vencido()) { await falar('As esteiras estão paradas desde a sua vitória. A engrenagem gira em falso.'); return; }
  sfx('empurrar'); M.cena.tremer(8);
  await quadros(12);
  invertido[g.cor] = !invertido[g.cor];
  pintar(); sfx('trem');
  avisar(g.cor === 'vermelho' ? 'Circuito VERMELHO invertido!' : 'Circuito AZUL invertido!');
  await falar(g.cor === 'vermelho' ? 'CLANC-CLANC! Todas as esteiras de seta vermelha mudaram de sentido.' : 'CLANC-CLANC! Todas as esteiras de seta azul mudaram de sentido.');
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer(); invertido = { vermelho: false, azul: false };
    pintar();
    let fase = 0, parou = vencido();
    laco(() => naZona(ZONA), (q) => {
      if (vencido() && !parou) { parou = true; pintar(); }
      if (q % 8) return;
      fase++;
      for (const e of ESTEIRAS) for (const [x, y] of e.tiles) { const d = sentido(x, y); if (d) enf.pegar(`s${x},${y}`)?.pos(x * 16 + 3 + DX[d] * (fase % 3), y * 16 + 3 + DY[d] * (fase % 3)); }
    });
  },
  passo(x, y) {
    if (vencido()) return false;
    if (M.zv.ch(x, y) === 'x') { cena(async () => { sfx('cachoeira'); M.cena.tremer(10); await cair(INICIO[0], INICIO[1], 'n'); await falar('PSSSSH! Você pisou bem debaixo da prensa de vapor.\nOs operários carregaram você de volta para a entrada.'); }); return true; }
    if (!sentido(x, y)) return false;
    cena(rolar);
    return true;
  },
  interagir(x, y) {
    const g = ENGRENAGENS.find((o) => o.x === x && o.y === y);
    if (g) { cena(() => girar(g)); return true; }
    const e = esteiraEm(x, y);
    if (e && !vencido()) { cena(() => falar(tr('Uma esteira do circuito {cor}. Ela carrega tudo o que encosta para onde a seta aponta.', { cor: e.cor }))); return true; }
    if (M.zv.ch(x, y) === 'x') { cena(() => falar('A prensa de vapor bufa a cada dois segundos. Melhor não ficar embaixo.')); return true; }
    return false;
  },
  sair() { enf.esquecer(); invertido = { vermelho: false, azul: false }; },
});
