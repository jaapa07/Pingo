/**
 * Ginásio 5 (Trovão, A6) — circuitos ligam pontes elétricas.
 * O gerador alimenta um único caminho por vez, escolhido por três chaves em cadeia (árvore de desvios):
 *   chave 1 → [ponte oeste] ou [chave 2]; chave 2 → [ponte leste] ou [ponte norte + chave 3];
 *   chave 3 → [piso eletrificado] ou [ponte do líder].
 * Ponte com energia fica estendida sobre o vão; sem energia, recolhida. O piso de teste dá choque (bloqueia)
 * enquanto recebe corrente. Lâmpadas ao lado de cada ponte e setas sobre as chaves mostram o estado.
 * Depois da vitória sobre o líder tudo fica ligado. Ao sair, as chaves voltam ao começo.
 */
import { flag } from '../../core/estado';
import { registrarMecanica } from '../registro';
import { M, Enfeites, Ladrilho, laco, cena, falar, avisar, sfx, quadros, naZona, bloco } from './_pecas';
import { tr } from '../../i18n';

const ZONA = 'A6-ginasio';
type Ramo = 'oeste' | 'leste' | 'norte' | 'lider' | 'piso';
const PONTES: Record<Exclude<Ramo, 'piso'>, [number, number][]> = {
  oeste: [[4, 12], [4, 13]], leste: [[14, 12], [14, 13]], norte: [[14, 8], [14, 9]], lider: [[9, 3], [9, 4]],
};
const PISO: [number, number][] = [[8, 5], [9, 5], [10, 5], [8, 6], [9, 6], [10, 6]];
const CHAVES: { x: number; y: number; a: string; b: string }[] = [
  { x: 12, y: 15, a: 'a ponte oeste', b: 'o relé do meio' },
  { x: 2, y: 10, a: 'a ponte leste', b: 'a linha de cima' },
  { x: 3, y: 6, a: 'o piso de teste', b: 'a ponte do líder' },
];
const enf = new Enfeites();
/** false = saída A, true = saída B */
let pos: boolean[] = [false, true, false], festa = false;

const vencido = () => !!flag('ginasio-05-vencido');
function ligados(): Set<Ramo> {
  if (vencido()) return new Set<Ramo>(['oeste', 'leste', 'norte', 'lider']);
  const r = new Set<Ramo>();
  if (!pos[0]) r.add('oeste');
  else if (!pos[1]) r.add('leste');
  else { r.add('norte'); r.add(pos[2] ? 'lider' : 'piso'); }
  return r;
}
/** a chave i está recebendo corrente? */
const comEnergia = (i: number) => !vencido() && (i === 0 || (i === 1 && pos[0]) || (i === 2 && pos[0] && pos[1]));
const LAMPADA = ['.kkk.', 'kwwwk', 'kwwwk', 'kwwwk', '.kkk.'];
const SETA_O = ['..k..', '.kwk.', 'kwwwk', '.kwk.', '..k..'];
function aplicar() {
  const on = ligados(), z = M.zv;
  for (const [nome, tiles] of Object.entries(PONTES) as [Exclude<Ramo, 'piso'>, [number, number][]][]) {
    const liga = on.has(nome);
    for (const [x, y] of tiles) { z.bloquear(x, y, !liga); if (liga) enf.tirar(`p${x},${y}`); else enf.tile(`p${x},${y}`, 'buraco', x, y); }
    const [x, y] = tiles[tiles.length - 1];
    enf.pix('l' + nome, [LAMPADA], liga ? { k: '#201c28', w: '#7cf07c' } : { k: '#201c28', w: '#a02c2c' }, x + 1, y + 1, { dx: -3, dy: 1, z: 3 });
  }
  const choque = on.has('piso');
  for (const [x, y] of PISO) { z.bloquear(x, y, choque); if (choque) enf.tirar(`x${x},${y}`); else enf.tile(`x${x},${y}`, 'piso', x, y); }
  CHAVES.forEach((c, i) => {
    enf.pix('c' + i, [bloco(7, 3)], { a: comEnergia(i) ? '#fcd834' : '#58708c' }, c.x, c.y, { dx: pos[i] ? 8 : 1, dy: -5, z: c.y * 16 + 30 });
    enf.pix('s' + i, [SETA_O], { k: '#201c28', w: comEnergia(i) ? '#fff8a0' : '#90b0bc' }, c.x, c.y, { dx: pos[i] ? 13 : -2, dy: -6, z: c.y * 16 + 31 });
  });
}
async function virar(i: number) {
  const c = CHAVES[i];
  if (vencido()) { await falar('O Faroleiro deixou tudo ligado depois da sua vitória. A chave nem precisa mais de dono.'); return; }
  pos[i] = !pos[i];
  sfx('ui-ok'); M.cena.tremer(4);
  await quadros(10);
  aplicar();
  const para = pos[i] ? c.b : c.a;
  if (comEnergia(i)) { sfx('trovao'); avisar(tr('Chave {n}: energia para {para}.', { n: i + 1, para })); await falar(tr('CLAC! A corrente agora segue para {para}.\nO ramo que estava ligado ficou sem energia.', { para })); }
  else await falar(tr('CLAC! A chave {n} agora aponta para {para}.\nMas não chega corrente aqui: nada mudou… por enquanto.', { n: i + 1, para }));
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer(); pos = [false, true, false]; festa = false;
    const z = M.zv;
    for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) if (z.ch(x, y) === 'o') z.bloquear(x, y, true);
    aplicar();
    let f = 0;
    laco(() => naZona(ZONA), (q) => { if (q % 20) return; f++; if (vencido() && !festa) { festa = true; aplicar(); } for (const [x, y] of PISO) enf.pegar<Ladrilho>(`x${x},${y}`)?.quadro(f); });
  },
  interagir(x, y) {
    const i = CHAVES.findIndex((c) => c.x === x && c.y === y);
    if (i >= 0) { cena(() => virar(i)); return true; }
    if (PISO.some(([a, b]) => a === x && b === y) && !M.zv.chao(x, y)) { cena(() => falar('ZZZT! O piso de teste está eletrificado. Os pelos do braço arrepiam só de chegar perto.')); return true; }
    const ponte = (Object.values(PONTES) as [number, number][][]).some((t) => t.some(([a, b]) => a === x && b === y));
    if (ponte && !M.zv.chao(x, y)) { cena(() => falar('A ponte elétrica está recolhida: a lâmpada ao lado está vermelha. Falta energia neste ramo.')); return true; }
    if (M.zv.ch(x, y) === 'o') { cena(() => falar('Um vão fundo, cheio de cabos e isoladores. Lá embaixo o mar bate na base do farol.')); return true; }
    return false;
  },
  sair() { enf.esquecer(); pos = [false, true, false]; },
});
