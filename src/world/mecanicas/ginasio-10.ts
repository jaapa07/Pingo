/**
 * Ginásio 10 (Pedra, B3) — vagonetes e desvios.
 * Os trilhos (`:`) cruzam o abismo (`o`); só o vagonete passa. Cada entroncamento obedece a uma chave de desvio
 * (`gin-desvio`), que pode estar longe dele. No fim da linha o jogador salta para a plataforma; se o trilho acaba
 * num para-choque sobre o abismo, o vagonete volta sozinho. Tudo recomeça ao sair (o estado vive só na visita).
 */
import type { Dir } from '../../core/tipos';
import { TILE } from '../../core/tipos';
import { registrarMecanica } from '../registro';
import { M, sfx, quadros } from '../vivo';
import { DX, DY, OPOSTO, dirPara } from '../zonas';
import { falar, simNao, avisar } from '../deps';
import type { Pix } from '../pixel';
import { DIRS, NOME_DIR, pix, pixSeta, enfeite, passoForcado, vigiar, livre, acao, gravarPos } from './_apoio-9a16';

const ZONA = 'B3-ginasio';
interface Desvio { jx: number; jy: number; ops: [Dir, Dir]; est: 0 | 1; ax: number; ay: number }
interface Carro { x: number; y: number; p: Pix }
let desvios: Desvio[] = [], carros: Carro[] = [];

const VAGONETE = [
  '................', '................', '................', '................', '................', '................',
  '.kkkkkkkkkkkkkk.', '.kmMMMMMMMMMMmk.', '.kmmmmmmmmmmmmk.', '.kfmmmmmmmmmmfk.', '.kfmmmmmmmmmmfk.', '..kffffffffffk..',
  '..kkkkkkkkkkkk..', '..kwk.kkkk.kwk..', '...k........k...', '................',
];
const pixVagonete = pix([VAGONETE], { k: '#241020', m: '#7c8c9c', M: '#b8c8c8', f: '#48546c', w: '#c89414' });

const ehTrilho = (x: number, y: number) => M.zv.ch(x, y) === ':';
const ehAbismo = (x: number, y: number) => M.zv.ch(x, y) === 'o';

function proximo(x: number, y: number, ant: [number, number] | null): Dir | undefined {
  const viz = DIRS.filter((d) => ehTrilho(x + DX[d], y + DY[d]) && !(ant && ant[0] === x + DX[d] && ant[1] === y + DY[d]));
  const dv = desvios.find((v) => v.jx === x && v.jy === y);
  if (!dv) return viz[0];
  const veioDeRamo = !!ant && dv.ops.some((o) => x + DX[o] === ant[0] && y + DY[o] === ant[1]);
  return veioDeRamo ? viz.find((d) => !dv.ops.includes(d)) : dv.ops[dv.est];
}
function pintarDesvio(v: Desvio) { enfeite(v.ax, v.ay, 'seta', pixSeta(v.ops[v.est]), 5, -6, 2); }
function estacionar(c: Carro) { c.p.pos(c.x * TILE, c.y * TILE, c.y * TILE + 16); M.zv.bloquear(c.x, c.y, true); }

async function rodar(c: Carro, caminho: Dir[]): Promise<void> {
  const j = M.jog;
  let ant: [number, number] | null = null;
  const segue = () => { c.p.pos(j.px, j.py + 2, j.py + 18); return false; };
  M.vigias.push(segue);
  sfx('empurrar');
  for (let n = 0; n < 200; n++) {
    const d = caminho.length ? caminho.shift() : proximo(j.x, j.y, ant);
    if (!d) break;
    ant = [j.x, j.y];
    await passoForcado(d, 5, { virar: true });
    if (n % 3 === 2) sfx('passo-madeira');
    feito.push(d);
  }
  M.vigias.splice(M.vigias.indexOf(segue), 1);
  c.x = j.x; c.y = j.y;
}
let feito: Dir[] = [];
async function viajar(c: Carro) {
  const j = M.jog;
  if (!(await simNao('Um vagonete de mina. Subir e soltar o freio?'))) return;
  M.zv.bloquear(c.x, c.y, false);
  sfx('pulo-saliencia');
  await passoForcado(dirPara(c.x - j.x, c.y - j.y), 12, { salto: 6, virar: true });
  feito = [];
  await rodar(c, []);
  let saida = [j.dir, ...DIRS].find((d) => livre(j.x + DX[d], j.y + DY[d]) && !ehTrilho(j.x + DX[d], j.y + DY[d]));
  if (!saida) {
    sfx('batida'); M.cena.tremer(12);
    await falar('BLAM! O trilho acaba num para-choque sobre o abismo.\nO vagonete volta sozinho pelo mesmo caminho…');
    const volta = feito.slice().reverse().map((d) => OPOSTO[d]);
    feito = [];
    await rodar(c, volta);
    saida = [j.dir, ...DIRS].find((d) => livre(j.x + DX[d], j.y + DY[d]) && !ehTrilho(j.x + DX[d], j.y + DY[d]));
  }
  if (saida) { sfx('pulo-saliencia'); await passoForcado(saida, 12, { salto: 6, virar: true }); }
  estacionar(c);
  gravarPos();
  await vigiar();
}

registrarMecanica(ZONA, {
  entrar() {
    const z = M.zv;
    desvios = [
      { jx: 10, jy: 12, ops: ['o', 'l'], est: 0, ax: 12, ay: 14 },
      { jx: 3, jy: 5, ops: ['l', 'n'], est: 0, ax: 18, ay: 7 },
    ];
    carros = [{ x: 10, y: 14 }, { x: 3, y: 7 }].map((c) => ({ ...c, p: enfeite(c.x, c.y, 'carro', pixVagonete) }));
    for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) {
      if (ehAbismo(x, y) || (ehTrilho(x, y) && DIRS.some((d) => ehAbismo(x + DX[d], y + DY[d])))) z.bloquear(x, y, true);
    }
    carros.forEach(estacionar);
    desvios.forEach(pintarDesvio);
  },
  interagir(x, y) {
    const c = carros.find((v) => v.x === x && v.y === y);
    if (c) { acao(() => viajar(c)); return true; }
    const v = desvios.find((d) => d.ax === x && d.ay === y);
    if (v) {
      v.est = v.est ? 0 : 1; pintarDesvio(v); sfx('ui-ok'); M.cena.tremer(4);
      avisar(`Desvio virado para o ${NOME_DIR[v.ops[v.est]]}.`);
      acao(async () => { await quadros(10); });
      return true;
    }
    if (ehTrilho(x, y) && !M.zv.chao(x, y)) { acao(() => falar('Os dormentes balançam sobre o abismo. Só o vagonete passa por aqui.')); return true; }
    if (ehAbismo(x, y)) { acao(() => falar('Um abismo escuro. Dá para ouvir água correndo lá no fundo.')); return true; }
    return false;
  },
  sair() { desvios = []; carros = []; },
});
