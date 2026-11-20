/**
 * Ginásio 13 (Veneno, B6) — piso tóxico; as plantas-antídoto marcam o caminho.
 * Três tanques de poça tóxica (`x`). Dentro de um tanque o jogador tem FÔLEGO (3, medidor sobre a cabeça):
 * cada passo na poça gasta 1; sem fôlego, o passo seguinte na poça é desmaio (volta à boca do tanque).
 * Chão limpo não gasta nem devolve. A planta-antídoto (`,`) devolve o fôlego inteiro e murcha na hora (vira poça).
 * Saindo do tanque, o fôlego volta e as plantas daquele tanque rebrotam. Vencido o líder, os exaustores limpam o ar
 * e a poça não gasta mais fôlego. Ao sair do ginásio, tudo recomeça.
 */
import { flag } from '../../core/estado';
import { registrarMecanica } from '../registro';
import { M, Enfeites, laco, cena, cair, falar, avisar, sfx, quadros, naZona } from './_pecas';

const ZONA = 'B6-ginasio';
const FOLEGO = 3;
interface Tanque { nome: string; x0: number; y0: number; x1: number; y1: number; boca: [number, number] }
/** interiores dos tanques (inclusive) e a boca por onde se entra */
const TANQUES: Tanque[] = [
  { nome: 'A', x0: 3, y0: 11, x1: 13, y1: 14, boca: [8, 15] },
  { nome: 'B', x0: 18, y0: 11, x1: 27, y1: 15, boca: [18, 16] },
  { nome: 'C', x0: 13, y0: 1, x1: 27, y1: 5, boca: [26, 6] },
];
const enf = new Enfeites();
/** plantas originais (chave x,y) e as já murchas nesta tentativa */
let plantas: [number, number][] = [];
const murchas = new Set<string>();
let folego = FOLEGO, atual: Tanque | null = null;

const vencido = () => !!flag('ginasio-13-vencido');
const tanqueEm = (x: number, y: number) => TANQUES.find((t) => x >= t.x0 && x <= t.x1 && y >= t.y0 && y <= t.y1) ?? null;
const dentro = (t: Tanque, x: number, y: number) => x >= t.x0 && x <= t.x1 && y >= t.y0 && y <= t.y1;

/* medidor de fôlego: três gotas verdes sobre a cabeça (0..3 cheias) */
const MEDIDOR = [0, 1, 2, 3].map((n) => {
  const linha = (c: string) => 'k' + [0, 1, 2].map((i) => (i < n ? c : 'e').repeat(3)).join('k') + 'k';
  return ['k'.repeat(13), linha('g'), linha('v'), 'k'.repeat(13)];
});
const PAL_MEDIDOR = { k: '#1a1020', g: '#a4e47c', v: '#4cac5c', e: '#3c2c5c' };
function medidor() {
  if (!atual || vencido()) { enf.tirar('medidor'); return; }
  const p = enf.tem('medidor') ? enf.pegar('medidor')! : enf.pix('medidor', MEDIDOR, PAL_MEDIDOR, 0, 0, { z: 9000 });
  p.quadro(folego);
}

function murchar(x: number, y: number) {
  murchas.add(x + ',' + y);
  M.zv.set(x, y, 'x');
  enf.tile('m' + x + ',' + y, 'perigo', x, y, 2);
}
function rebrotar(t: Tanque) {
  for (const [x, y] of plantas) if (dentro(t, x, y) && murchas.delete(x + ',' + y)) { M.zv.set(x, y, ','); enf.tirar('m' + x + ',' + y); }
}
async function desmaiar(t: Tanque) {
  sfx('desmaio'); M.cena.tremer(6);
  await quadros(24, (i) => { M.jog.visivel = i % 6 < 3; });
  M.jog.visivel = true;
  rebrotar(t); folego = FOLEGO; atual = null; medidor();
  await cair(t.boca[0], t.boca[1] + 1, 'n');
  await falar('O vapor da poça embrulhou o seu estômago e as pernas amoleceram…\nOs assistentes do Doutor Peçonha levaram você de volta à boca do tanque. As plantas-antídoto já rebrotaram.');
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer(); murchas.clear(); folego = FOLEGO; atual = null;
    plantas = [];
    for (const t of TANQUES) for (let y = t.y0; y <= t.y1; y++) for (let x = t.x0; x <= t.x1; x++) if (M.zv.ch(x, y) === ',') plantas.push([x, y]);
    // o medidor acompanha o jogador quadro a quadro (inclusive no meio do passo)
    laco(() => naZona(ZONA), () => {
      const p = enf.pegar('medidor');
      if (p) p.pos(M.jog.px + 2, M.jog.py - 14 + M.jog.ey, M.jog.py + 400);
    });
  },
  passo(x, y) {
    const t = tanqueEm(x, y);
    if (atual && t !== atual) { rebrotar(atual); folego = FOLEGO; atual = null; medidor(); }
    if (!t) return false;
    if (vencido()) return false;
    atual = t;
    const ch = M.zv.ch(x, y);
    if (ch === ',') {
      folego = FOLEGO; murchar(x, y); sfx('cura'); medidor();
      avisar('Fôlego renovado! A planta murchou.');
      return false;
    }
    if (ch === 'x') {
      if (folego <= 0) { cena(() => desmaiar(t)); return true; }
      folego--; sfx('status-veneno'); medidor();
      if (folego === 0) avisar('Sem fôlego! Mais um passo na poça e você desmaia.');
    }
    medidor();
    return false;
  },
  interagir(x, y) {
    const ch = M.zv.ch(x, y);
    if (ch === 'C') { cena(() => falar('Um terrário do Doutor Peçonha. Lá dentro, uma jararaca dorme enrolada em cima de uma plaquinha:\n"Peçonha é remédio na mão de quem estuda."')); return true; }
    if (!tanqueEm(x, y)) return false;
    if (ch === ',') { cena(() => falar('Uma planta-antídoto. Pisando nela você respira fundo e recupera todo o fôlego… mas ela murcha logo em seguida.')); return true; }
    if (ch === 'x') { cena(() => falar(vencido() ? 'Os exaustores limparam o ar desde a sua vitória. A poça já não faz mal.' : 'Poça tóxica, cor de jabuticaba. Cada passo nela gasta um pouco do seu fôlego.')); return true; }
    return false;
  },
  sair() { enf.esquecer(); murchas.clear(); plantas = []; atual = null; folego = FOLEGO; },
});

