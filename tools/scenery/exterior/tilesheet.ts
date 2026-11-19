/**
 * Tilesheet de um tileset exterior: public/assets/tiles/<nome>.png (um bloco por período, empilhados)
 * + <nome>.json com a posição de cada peça. O jogo usa daqui os sprites que NÃO vão no bake:
 * obstáculos removíveis (cipó, pedregulho, rocha rachada) e a grama de passagem.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Arte, TilesetExterior } from '../../../src/data/tilesets/tipos';
import { Img, PERIODOS, hex, tabelaPeriodo, type Periodo } from '../../pixel/tile';
import { ARVORES } from './arvores';
import { arteImg, coresDoTileset } from './compositor';

interface Peca { nome: string; quadros: Img[] }
export function pecasDoTileset(ts: TilesetExterior): Peca[] {
  const a = ts.arte, b = ts.base, c = coresDoTileset(ts);
  const cheia = (nome: string, artes: Arte[], base: Parameters<typeof arteImg>[2]) => artes.map((x, i) => ({ nome: `${nome}-${i}`, quadros: [arteImg(ts, x, base)] }));
  const anim = (nome: string, artes: Arte[], base?: Parameters<typeof arteImg>[2]) => ({ nome, quadros: artes.map((x) => arteImg(ts, x, base)) });
  const um = (nome: string, arte: Arte) => ({ nome, quadros: [arteImg(ts, arte)] });
  const pecas: Peca[] = [
    ...cheia('chao', a.chao, b.chao), ...cheia('caminho', a.caminho, b.caminho), ...cheia('alt', a.alt, b.alt),
    ...cheia('encontro', a.encontro, b.encontro), ...cheia('piso', a.piso, b.piso), ...cheia('gelo', a.gelo, b.gelo), ...cheia('lama', a.lama, b.lama),
    ...cheia('parede-topo', a.paredeTopo, b.paredeTopo), ...cheia('parede-face', a.paredeFace, 'R'),
    anim('agua', a.agua, b.agua), anim('funda', a.funda), anim('cascata', a.cascata, b.agua), anim('perigo', a.perigo, b.perigo),
    ...a.decor.map((x, i) => um(`decor-${i}`, x)), anim('flor', a.flor), anim('grama-alta', a.gramaAlta), anim('grama-passagem', a.gramaPassagem),
    ...a.arbusto.map((x, i) => um(`arbusto-${i}`, x)),
    um('cerca-poste', a.cercaPoste), um('cerca-h', a.cercaH), um('cerca-v', a.cercaV), um('trepadeira', a.trepadeira),
    um('saliencia-v', a.salienciaV), um('saliencia-e', a.salienciaE), um('ponte', a.ponte), um('canteiro', a.canteiro), um('buraco', a.buraco), um('movel', a.movel),
    um('din-c', a.cipo), um('din-p', a.pedregulho), um('din-r', a.rachada),
  ];
  for (const especie of new Set([...ts.arvore, ts.arvoreSacudivel])) pecas.push({ nome: `arvore-${especie}`, quadros: [ARVORES[especie](c, 0).img] });
  return pecas;
}

export function gravarTilesheet(ts: TilesetExterior, pasta: string): void {
  const pecas = pecasDoTileset(ts), c0 = coresDoTileset(ts);
  const LARG = 256;
  // empacotamento em prateleiras
  const pos: Record<string, { x: number; y: number; w: number; h: number; quadros: number }> = {};
  let x = 0, y = 0, altLinha = 0;
  for (const p of pecas) {
    const w = p.quadros[0].w * p.quadros.length, h = p.quadros[0].h;
    if (x + w > LARG) { x = 0; y += altLinha; altLinha = 0; }
    pos[p.nome] = { x, y, w: p.quadros[0].w, h, quadros: p.quadros.length };
    x += Math.ceil(w / 16) * 16; altLinha = Math.max(altLinha, Math.ceil(h / 16) * 16);
  }
  const altBloco = y + altLinha;
  const periodos: Periodo[] = ts.periodos ? PERIODOS : ['dia'];
  const dia = new Img(LARG, altBloco);
  for (const p of pecas) p.quadros.forEach((q, i) => dia.colar(q, pos[p.nome].x + i * q.w, pos[p.nome].y));
  const folha = new Img(LARG, altBloco * periodos.length);
  const acesas = new Map<number, number>([[hex(ts.construcao.vidro), hex(ts.construcao.vidroNoite)], [hex(ts.construcao.luz), hex(ts.construcao.luzNoite)]]);
  for (const l of ts.acesas ?? []) acesas.set(c0(l), c0(l));
  periodos.forEach((p, i) => folha.colar(p === 'dia' ? dia : dia.trocar(tabelaPeriodo(dia.cores(), p, acesas)), 0, i * altBloco));
  mkdirSync(pasta, { recursive: true });
  folha.salvar(resolve(pasta, `${ts.nome}.png`));
  writeFileSync(resolve(pasta, `${ts.nome}.json`), JSON.stringify({ nome: ts.nome, tile: 16, periodos, alturaPeriodo: altBloco, paleta: ts.paleta, pecas: pos }));
}
