/**
 * Ginásio 2 (Inseto, A3) — pontes de teia que só se atravessam na ordem certa.
 * Cada ponte tem de 1 a 7 nós (desenhados nas duas pontas). A ponte da vez aguenta o peso; atravessada de ponta
 * a ponta, fica firme (nós dourados) e pode ser usada sempre. Pisar numa ponte adiantada, ou no vão entre os
 * galhos, derruba o jogador na rede de segurança: ele volta à entrada (as pontes já firmes continuam firmes).
 * Ao sair do ginásio tudo recomeça.
 */
import { registrarMecanica } from '../registro';
import { M, Enfeites, cair, cena, falar, avisar, sfx, chave, olharTreinadores } from './_pecas';
import { tr } from '../../i18n';

const ZONA = 'A3-ginasio';
const INICIO: [number, number] = [8, 16];
interface Ponte { n: number; tiles: [number, number][]; firme: boolean; pisados: Set<string> }
const PLANTA: [number, [number, number][]][] = [
  [1, [[8, 14], [8, 13], [8, 12]]],
  [2, [[10, 10], [11, 10]]],
  [3, [[14, 8], [14, 7], [14, 6]]],
  [4, [[6, 10], [5, 10]]],
  [5, [[2, 8], [2, 7], [2, 6]]],
  [6, [[4, 2], [5, 2]]],
  [7, [[12, 2], [11, 2]]],
];
const enf = new Enfeites();
let pontes: Ponte[] = [], proxima = 1, emCurso: Ponte | null = null;

const ponteEm = (x: number, y: number) => pontes.find((p) => p.tiles.some(([a, b]) => a === x && b === y));
/** n nós em fila (3×3 px cada), centralizados no tile */
function nos(n: number): string[] {
  const linha = Array.from({ length: n }, () => 'kwwk').join('').slice(0, n * 4) + 'k';
  const borda = 'k'.repeat(linha.length);
  return [borda, linha.replace(/kww/g, 'kww'), linha, borda];
}
function pintar(p: Ponte) {
  const pal = p.firme ? { k: '#5a3a08', w: '#fcd834' } : p.n === proxima ? { k: '#1c2a3a', w: '#ffffff' } : { k: '#1c2a3a', w: '#9fb4c4' };
  const g = nos(p.n), larg = g[0].length;
  for (const [i, [x, y]] of [p.tiles[0], p.tiles[p.tiles.length - 1]].entries()) enf.pix(`n${p.n}-${i}`, [g], pal, x, y, { dx: Math.floor((16 - larg) / 2), dy: 6, z: 2 });
}
const plural = (n: number) => (n === 1 ? '1 nó' : tr('{n} nós', { n }));

async function queda(texto: string) {
  emCurso?.pisados.clear(); emCurso = null;
  sfx('quebrar'); M.cena.tremer(8);
  await cair(INICIO[0], INICIO[1], 'n');
  await falar(texto);
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer(); proxima = 1; emCurso = null;
    pontes = PLANTA.map(([n, tiles]) => ({ n, tiles, firme: false, pisados: new Set<string>() }));
    pontes.forEach(pintar);
  },
  passo(x, y) {
    const p = ponteEm(x, y);
    if (p) {
      if (!p.firme && p.n !== proxima) {
        cena(() => queda(tr('CRAC! A teia de {n} arrebentou sob os seus pés.\nA rede de segurança devolveu você à entrada. A ponte da vez é a de {proxima}.', { n: plural(p.n), proxima: plural(proxima) })));
        return true;
      }
      if (!p.firme) { if (emCurso !== p) { emCurso?.pisados.clear(); emCurso = p; sfx('passo-madeira'); } p.pisados.add(chave(x, y)); }
      return false;
    }
    if (M.zv.ch(x, y) === 'o') {
      cena(() => queda('Não tem galho nenhum ali! Você despencou na rede de segurança e voltou à entrada.'));
      return true;
    }
    // chegou a uma plataforma: a ponte em curso firmou se foi pisada inteira
    const c = emCurso; emCurso = null;
    if (c && !c.firme) {
      if (c.pisados.size === c.tiles.length) {
        c.firme = true; proxima = Math.max(proxima, c.n + 1);
        sfx('item-obtido'); pontes.forEach(pintar);
        avisar(c.n >= 6 ? tr('A teia de {n} ficou firme!', { n: plural(c.n) }) : tr('A teia de {n} ficou firme! Agora a de {proxima} aguenta.', { n: plural(c.n), proxima: plural(proxima) }));
        cena(olharTreinadores);
        return true;
      }
      c.pisados.clear();
    }
    return false;
  },
  interagir(x, y) {
    const p = ponteEm(x, y);
    if (p) { cena(() => falar(p.firme ? tr('Uma ponte de teia com {n} dourados. Está firme como corda de viola.', { n: plural(p.n) }) : tr(p.n === proxima ? 'Uma ponte de teia com {n}. Os fios estão esticados, prontos para o peso.' : 'Uma ponte de teia com {n}. Os fios ainda estão frouxos.', { n: plural(p.n) }))); return true; }
    if (M.zv.ch(x, y) === 'c') { cena(() => falar('Um casulo morno, do tamanho de uma jaca. Algo se mexe lá dentro… melhor deixar dormir.')); return true; }
    if (M.zv.ch(x, y) === 'o') { cena(() => falar('Daqui se vê o chão da floresta, lá embaixo, e uma rede de segurança no meio do caminho.')); return true; }
    return false;
  },
  sair() { pontes = []; emCurso = null; proxima = 1; enf.esquecer(); },
});
