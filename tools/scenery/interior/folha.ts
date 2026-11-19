/**
 * Tilesheets de interior: public/assets/tiles/<nome>.png + .json, um bloco por TEMA.
 * Cada caractere da legenda aparece numa coluna de 16×48 (2 tiles de parede + o tile), 4 quadros lado a lado;
 * os obstáculos removíveis (`din-c`, `din-p`, `din-r`) saem soltos, transparentes, para o motor desenhar.
 * Uso: tsx tools/scenery/interior/folha.ts [--previa=pasta]  (a prévia grava uma sala-legenda por tema, 2×)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZonaDef } from '../../../src/core/tipos';
import { CATALOGO_INTERIOR } from '../../../src/data/catalogo-interiores';
import { Tela, png } from '../arenas/nucleo';
import { Img } from '../../pixel/tile';
import { DADOS_INTERIOR } from './index';
import { montarTema } from './tema';
import { PECAS, T } from './tiles';
import { pintarZonaInterior, PADRAO } from './zona';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const previa = process.argv.find((a) => a.startsWith('--previa='))?.split('=')[1];
const NOMES: Record<string, string> = { '.': 'piso', ',': 'decorado', ':': 'caminho', ';': 'alternativo', '"': 'grama-alta', '%': 'encontro', '~': 'agua', d: 'funda', w: 'cascata', '=': 'ponte', '#': 'parede', T: 'arvore', t: 'sacudivel', b: 'arbusto', f: 'cerca', c: 'cipo', p: 'pedregulho', r: 'rachada', e: 'trepadeira', v: 'saliencia-s', '<': 'saliencia-o', '>': 'saliencia-l', g: 'gelo', l: 'lama', x: 'perigo', C: 'canteiro', o: 'buraco', '+': 'tapete', M: 'movel' };
const zonaDe = (mapaChars: string[], objetos: ZonaDef['objetos'] = []): ZonaDef => ({ id: '_folha', nome: '', mapa: 'A', tipo: 'interior', tileset: '', musica: '', arena: '', mapaChars, objetos, warps: [] });
const tela = (i: { w: number; h: number; d: Int32Array }) => { const t = new Tela(i.w, i.h); t.px.set(i.d); return t; };
const LEGENDA = [
  '####################', '#####eee############', '#..,,..::::..;;;;.T#', '#.++...:..:..;%%;.t#', '#.++.M.:..:..""..b.#', '#....M.::::..""..C.#',
  '#~~~=~~~..ggg..lll.#', '#~d~=~w~..ggg..lll.#', '#~~~=~~~.xxx..o..f.#', '#........xxx.cpr.f.#', '#.vv.<.>.........f.#', '#..................#', '####################',
];

for (const ts of DADOS_INTERIOR) {
  const chars = Object.keys(NOMES), COLS = 4, CW = 64, CH = 48, DIN = 16;
  const altTema = Math.ceil(chars.length / COLS) * CH + DIN;
  const folha = new Tela(COLS * CW, altTema * ts.temas.length);
  const pecas: Record<string, { x: number; y: number; w: number; h: number; quadros: number }> = {};
  const temas: Record<string, { desc: string; y: number; altura: number; piso: string; parede: string }> = {};
  ts.temas.forEach((def, ti) => {
    const tema = montarTema(ts, def), y0 = ti * altTema;
    temas[def.id] = { desc: def.desc, y: y0, altura: altTema, piso: def.piso, parede: def.parede };
    chars.forEach((c, i) => {
      const meio = c === '#' ? '.' : c, linha2 = c === 'e' ? '#e#' : '###';
      const z = pintarZonaInterior(ts, zonaDe(['###', linha2, `.${meio}.`, '...']), CATALOGO_INTERIOR, tema, true);
      const x = (i % COLS) * CW, y = y0 + Math.floor(i / COLS) * CH;
      z.quadros.forEach((q, f) => { const t = tela(q); t.colar(tela(z.alto)); folha.colar(t.recorte(T, 0, T, CH), x + f * T, y); });
      pecas[`${def.id}/${NOMES[c]}`] = { x, y, w: T, h: CH, quadros: 4 };
    });
    ['c', 'p', 'r'].forEach((c, i) => {
      const t = new Tela(T, T), nome = def.pecas?.[c] ?? PADRAO[c];
      PECAS[nome]({ t, ox: 0, oy: 0, gx: 1, gy: 1, q: 0, tema, viz: { n: '.', s: '.', l: '.', o: '.' } });
      const y = y0 + altTema - DIN;
      folha.colar(t, i * T, y);
      pecas[`${def.id}/din-${c}`] = { x: i * T, y, w: T, h: T, quadros: 1 };
      if (ti === 0) pecas[`din-${c}`] = pecas[`${def.id}/din-${c}`];
    });
    if (previa) {
      const z = pintarZonaInterior(ts, zonaDe(LEGENDA), CATALOGO_INTERIOR, tema, true), t = tela(z.quadros[0]);
      t.colar(tela(z.alto));
      mkdirSync(previa, { recursive: true });
      writeFileSync(resolve(previa, `${ts.nome}-${def.id}.png`), png(t.ampliar(2)));
    }
  });
  const pasta = resolve(RAIZ, 'public/assets/tiles');
  mkdirSync(pasta, { recursive: true });
  const img = new Img(folha.w, folha.h); img.d.set(folha.px); img.salvar(resolve(pasta, `${ts.nome}.png`));
  writeFileSync(resolve(pasta, `${ts.nome}.json`), JSON.stringify({ nome: ts.nome, tile: 16, periodos: ['dia'], alturaPeriodo: folha.h, temas, porZona: ts.porZona, rodizio: ts.rodizio, pecas }));
  console.log(`✔ tiles/${ts.nome}.png ${folha.w}×${folha.h} · ${ts.temas.length} temas · ${Object.keys(pecas).length} peças`);
}
