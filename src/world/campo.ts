/**
 * Ações de campo: interação com A, Amuletos (pergunta + animação da criatura ajudante — spec 4.4),
 * pesca, árvores sacudíveis, canteiros de frutos, itens no chão/ocultos, bicicleta e repelente.
 */
import type { AmuletoId, CriaturaInst, Dir, MetodoEncontro, ItemChao } from '../core/tipos';
import { TILE } from '../core/tipos';
import { jogo, flag, setFlag, darItem, tirarItem, qtdItem, temAmuleto } from '../core/estado';
import { rng } from '../core/rng';
import { bus } from '../core/events';
import { Ator } from './ator';
import { M, AMULETOS, ajudante, ocupar, sfx, quadros, npcEm, atorEm } from './vivo';
import { DX, DY, OPOSTO, ehAgua } from './zonas';
import { falar, simNao, escolher, avisar, abrirTela, nomeCriatura, nomeItem, especie, item as itemDef, usoItem, entrada } from './deps';
import { pixObstaculo, pixItem, pixCanteiro, pixPlanta, pixFolha, pixPoeira, pixBrilho, pixBolha, type TileVivo } from './pixel';
import { mecanicas } from './registro';
import { interagirNpc } from './npcs';
import { rodarEvento } from './eventos';
import { sortear, batalhaSelvagem, tabela } from './encontros';
import { irPara, zonaDef, atualizarLuz } from './index';
import { andarJogador, baseDoModo } from './jogador';

export const IDS = { bike: 'bike-bambu', varas: { velha: 'vara-velha', boa: 'vara-boa', mestra: 'vara-mestra' } as const };
const FRUTOS = ['caju', 'pitanga', 'jabuticaba', 'cupuacu', 'pequi', 'buriti', 'acai', 'acerola'];
const pisoBase = () => (M.zv.def.tipo === 'caverna' || M.zv.def.tipo === 'dungeon' ? '%' : '.');

/* ------------------------------ props dos tiles vivos ------------------------------ */
const kTile = (x: number, y: number) => `t:${x},${y}`;
const kItem = (i: ItemChao) => `i:${i.x},${i.y}`;
const kCant = (x: number, y: number) => `${M.zv.def.id}:${x},${y}`;
export const agoraJogo = () => Date.now() + jogo.save.relogio.deslocamentoMin * 60000;
/** 0 vazio · 1 broto · 2 muda · 3 maduro (20 min, 60 min) */
export function estagioCanteiro(x: number, y: number): number {
  const c = jogo.save.canteiros[kCant(x, y)]; if (!c) return 0;
  const min = (agoraJogo() - c.plantado) / 60000;
  return min < 20 ? 1 : min < 60 ? 2 : 3;
}
const fabObstaculo = (c: string) => M.cena.peca('din-' + c, (p) => pixObstaculo(c as TileVivo, p));
export function pintarTile(x: number, y: number) {
  const ch = M.zv.ch(x, y), k = kTile(x, y);
  M.cena.tirarProp(k);
  if (ch === 'c' || ch === 'p' || ch === 'r') M.cena.prop(k, fabObstaculo(ch), x * TILE, y * TILE);
  else if (ch === 'C') M.cena.prop(k, M.cena.debug ? pixCanteiro : pixPlanta, x * TILE, y * TILE).quadro(estagioCanteiro(x, y));
}
export function montarProps() {
  const z = M.zv;
  for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) if ('cprC'.includes(z.ch(x, y))) pintarTile(x, y);
  for (const i of z.def.itens ?? []) if (!i.oculto && !flag(i.flag)) M.cena.prop(kItem(i), pixItem, i.x * TILE, i.y * TILE);
}
export function atualizarCanteiros() { const z = M.zv; for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) if (z.ch(x, y) === 'C') pintarTile(x, y); }
export const itemEm = (x: number, y: number): ItemChao | undefined => M.zv.def.itens?.find((i) => i.x === x && i.y === y && !flag(i.flag));
/** item visível no chão bloqueia a passagem */
export const itemBloqueia = (x: number, y: number) => { const i = itemEm(x, y); return !!i && !i.oculto; };

/* ------------------------------ Amuletos ------------------------------ */
/** confere Amuleto + criatura do tipo certo, pergunta e devolve a ajudante (ou null) */
export async function pedirAmuleto(id: AmuletoId, pergunta?: string): Promise<CriaturaInst | null> {
  const a = AMULETOS[id];
  if (!temAmuleto(id)) { if (a.obst) await falar(a.obst); return null; }
  const c = ajudante(id);
  if (!c) {
    const tipos = a.tipos ? `do tipo ${a.tipos.map((t) => t[0].toUpperCase() + t.slice(1)).join(', ').replace(/, ([^,]*)$/, ' ou $1')}` : 'com muita amizade';
    await falar(`${a.obst ? a.obst + '\n' : ''}${a.art === 'a' ? 'A' : 'O'} ${a.nome} precisa de uma criatura ${tipos} na equipe.`);
    return null;
  }
  if (!(await simNao(pergunta ?? `Usar ${a.art} ${a.nome}?`))) return null;
  return c;
}
/** a criatura ajudante salta do jogador até o alvo, faz a ação e volta */
export async function animarAjudante(c: CriaturaInst, id: AmuletoId, dir: Dir, efeito?: () => void) {
  avisar(`${nomeCriatura(c)} usou ${AMULETOS[id].art} ${AMULETOS[id].nome}!`);
  bus.emit('amuleto-usado', { id, especie: c.especie });
  const a = new Ator('c:' + (especie(c.especie)?.id ?? 'especie-' + c.especie), M.cena.sprites, M.jog.x, M.jog.y, dir);
  a.solido = false; M.extras.push(a);
  await a.mover(dir, 10, { salto: 6 });
  efeito?.();
  await quadros(14, (i) => { a.ey = i % 6 < 3 ? -2 : 0; });
  a.ey = 0;
  await a.mover(OPOSTO[dir], 8, { semVirar: true });
  a.remover();
}
const soltar = (fab: typeof pixFolha, x: number, y: number, n: number) => { for (let k = 0; k < n; k++) M.cena.particula(fab, x * TILE + 2 + ((k * 5) % 12), y * TILE + 4 + ((k * 3) % 8), (k % 2 ? 0.5 : -0.5) * (1 + (k % 3) * 0.3), -0.6 + (k % 3) * 0.2, 18 + k * 2); };

async function cortarCipo(x: number, y: number, d: Dir) {
  const c = await pedirAmuleto('facao'); if (!c) return;
  await animarAjudante(c, 'facao', d, () => { sfx('facao'); soltar(pixFolha, x, y, 6); M.zv.set(x, y, pisoBase()); pintarTile(x, y); });
}
async function quebrarRocha(x: number, y: number, d: Dir) {
  const c = await pedirAmuleto('quebra-pedra'); if (!c) return;
  await animarAjudante(c, 'quebra-pedra', d, () => { sfx('quebrar'); M.cena.tremer(10); soltar(pixPoeira, x, y, 5); M.zv.set(x, y, pisoBase()); pintarTile(x, y); });
  if (rng.chance(0.3)) { const s = sortear(M.zv.def, 'rocha'); if (s) await batalhaSelvagem(s.e, s.nv); }
}
async function ativarForca(d: Dir) {
  if (M.forca) { await falar('A Força já está valendo: é só empurrar o pedregulho.'); return; }
  const c = await pedirAmuleto('forca'); if (!c) return;
  await animarAjudante(c, 'forca', d, () => { sfx('empurrar'); M.cena.tremer(6); });
  M.forca = true;
  await falar(`${nomeCriatura(c)} vai ajudar a empurrar os pedregulhos daqui!`);
}
/** empurra o pedregulho 1 tile (com a Força ativa); devolve se moveu */
export function empurrar(x: number, y: number, d: Dir): boolean {
  const bx = x + DX[d], by = y + DY[d], z = M.zv;
  if (!z.chao(bx, by) || atorEm(bx, by) || z.warp(bx, by) || itemBloqueia(bx, by)) return false;
  const p = M.cena.prop(kTile(x, y), fabObstaculo('p'), x * TILE, y * TILE);
  z.set(x, y, pisoBase()); z.set(bx, by, 'p');
  sfx('empurrar');
  void ocupar(async () => {
    await quadros(16, (i) => { p.pos(x * TILE + DX[d] * (i + 1), y * TILE + DY[d] * (i + 1), y * TILE + DY[d] * (i + 1) + 16); });
    M.cena.tirarProp(kTile(x, y)); pintarTile(bx, by);
    mecanicas.get(z.def.id)?.passo?.(M.jog.x, M.jog.y);
  });
  return true;
}
async function escalar(d: Dir) {
  const j = M.jog, z = M.zv;
  if (d !== 'n' && d !== 's') { await falar('O paredão só dá passagem subindo ou descendo.'); return; }
  let n = 0; while (z.ch(j.x, j.y + DY[d] * (n + 1)) === 'e') n++;
  const fy = j.y + DY[d] * (n + 1);
  if (!z.chao(j.x, fy) || atorEm(j.x, fy)) { await falar('Não há onde se firmar do outro lado.'); return; }
  const c = await pedirAmuleto('escalar'); if (!c) return;
  avisar(`${nomeCriatura(c)} usou o Escalar!`); sfx('escalar');
  await andarJogador(d, 14 * (n + 1), { tiles: n + 1, base: 'escalar', semVirar: d === 's' });
}
async function embarcar(d: Dir) {
  const c = await pedirAmuleto('remo', 'A água está calma. Usar o Remo?'); if (!c) return false;
  avisar(`${nomeCriatura(c)} puxa a canoa!`); sfx('remo');
  jogo.save.jogador.modo = 'remo';
  await andarJogador(d, 16, { salto: 6, base: 'remar' });
  return true;
}
/** sobe a cascata à frente (modo remo, olhando para o norte) */
export async function subirCascata() {
  const j = M.jog, z = M.zv;
  let n = 0; while (z.ch(j.x, j.y - 1 - n) === 'w') n++;
  if (!z.agua(j.x, j.y - 1 - n)) { await falar('Não dá para subir por aqui.'); return; }
  const c = await pedirAmuleto('cachoeira'); if (!c) return;
  avisar(`${nomeCriatura(c)} usou a Cachoeira!`); sfx('cachoeira');
  soltar(pixBolha, j.x, j.y - 1, 5);
  await andarJogador('n', 12 * (n + 1), { tiles: n + 1 });
}
async function mergulhar() {
  const j = M.jog, w = M.zv.warp(j.x, j.y);
  const sobe = !!M.zv.def.submerso;
  if (!w) { await falar(sobe ? 'Não dá para subir à superfície por aqui.' : 'Não há nada para ver lá embaixo.'); return; }
  const c = await pedirAmuleto('mergulho', sobe ? 'Subir à superfície?' : 'A água é funda aqui. Usar o Mergulho?'); if (!c) return;
  avisar(`${nomeCriatura(c)} usou o Mergulho!`); sfx('mergulho');
  soltar(pixBolha, j.x, j.y, 6);
  await quadros(20, (i) => { j.ey = sobe ? -i : i >> 1; });
  j.ey = 0;
  await irPara(w.para.zona, w.para.x, w.para.y, w.para.dir ?? j.dir);
}
/** usa um Amuleto pelo menu (Voo, Faro, Lampião) ou o da frente */
export async function usarAmuleto(id: AmuletoId): Promise<boolean> {
  return ocupar(async () => {
    const z = M.zv.def;
    if (id === 'voo') {
      if (['interior', 'ginasio', 'caverna', 'dungeon'].includes(z.tipo) || z.submerso) { await falar('Não dá para levantar voo aqui dentro.'); return false; }
      const c = await pedirAmuleto('voo', 'Levantar voo e viajar?'); if (!c) return false;
      const r = (await abrirTela('mapa-mundi', { modo: 'voo' })) as string | { zona?: string } | undefined;
      const destino = typeof r === 'string' ? r : r?.zona;
      const dz = destino ? zonaDef(destino) : undefined;
      if (!dz) return false;
      avisar(`${nomeCriatura(c)} usou o Voo!`); sfx('voo');
      await quadros(40, (i) => { M.jog.ey = -i * 4; });
      M.jog.ey = 0; jogo.save.jogador.modo = 'pe';
      const [px, py] = dz.pouso ?? [Math.floor(dz.mapaChars[0].length / 2), Math.floor(dz.mapaChars.length / 2)];
      await irPara(dz.id, px, py, 's');
      return true;
    }
    if (id === 'faro') {
      const c = await pedirAmuleto('faro', 'Pedir para farejar por perto?'); if (!c) return false;
      const n = farejar(8);
      await falar(n ? `${nomeCriatura(c)} farejou algo escondido por perto!` : `${nomeCriatura(c)} não sentiu cheiro de nada escondido.`);
      return true;
    }
    if (id === 'lampiao') { atualizarLuz(true); return !!ajudante('lampiao'); }
    await interagir();
    return true;
  });
}
/** brilho sobre itens ocultos a até `raio` tiles; devolve quantos */
export function farejar(raio: number): number {
  let n = 0;
  for (const i of M.zv.def.itens ?? []) {
    if (!i.oculto || flag(i.flag) || Math.abs(i.x - M.jog.x) > raio || Math.abs(i.y - M.jog.y) > raio) continue;
    n++; M.cena.particula(pixBrilho, i.x * TILE + 5, i.y * TILE + 4, 0, -0.1, 40, { cada: 8 });
  }
  return n;
}

/* ------------------------------ pesca ------------------------------ */
const NOME_VARA = { velha: 'Vara Velha', boa: 'Vara Boa', mestra: 'Vara Mestra' };
export const melhorVara = (): keyof typeof NOME_VARA | null => (qtdItem(IDS.varas.mestra) ? 'mestra' : qtdItem(IDS.varas.boa) ? 'boa' : qtdItem(IDS.varas.velha) ? 'velha' : null);
/** minijogo de fisgar: espera o "!" e aperta A a tempo */
export async function pescar(vara: keyof typeof NOME_VARA): Promise<boolean> {
  const j = M.jog, e = entrada();
  if (!ehAgua(M.zv.ch(j.x + DX[j.dir], j.y + DY[j.dir]))) { await falar('Não tem água para pescar aqui.'); return false; }
  const metodo = ('pesca-' + vara) as MetodoEncontro;
  sfx('passo-agua'); j.emote('...', 600);
  M.cena.particula(pixBolha, (j.x + DX[j.dir]) * TILE + 6, (j.y + DY[j.dir]) * TILE + 6, 0, 0, 30, { cada: 10 });
  const cedo = await quadros(rng.int(70, 170), (i) => i > 8 && (e.apertou('a') || e.apertou('b')));
  if (cedo) { j.emote('?', 30); await falar('Puxou a linha cedo demais…'); return false; }
  const morde = tabela(M.zv.def, metodo) && rng.chance({ velha: 0.5, boa: 0.7, mestra: 0.85 }[vara]);
  if (!morde) { j.emote('...', 1); await falar('Nada mordeu a isca…'); return false; }
  j.emote('!', 44); sfx('ui-erro'); M.cena.tremer(4);
  const fisgou = await quadros(44, () => e.apertou('a'));
  if (!fisgou) { await falar('A criatura escapou com a isca!'); return false; }
  const s = sortear(M.zv.def, metodo)!;
  await falar('Fisgou! Tem alguma coisa na linha!');
  await batalhaSelvagem(s.e, s.nv);
  return true;
}

/* ------------------------------ árvores, canteiros, itens ------------------------------ */
async function sacudir(x: number, y: number) {
  if (!(await simNao('A árvore tem o tronco bem grosso. Sacudir?'))) return;
  sfx('batida'); M.cena.tremer(12); soltar(pixFolha, x, y - 1, 6);
  await quadros(24);
  const k = M.zv.i(x, y), ja = M.sacudidas.has(k);
  M.sacudidas.add(k);
  const s = !ja && rng.chance(0.4) ? sortear(M.zv.def, 'arvore') : null;
  if (s) { await falar('Alguma coisa caiu da árvore!'); await batalhaSelvagem(s.e, s.nv); } else await falar('Só caíram algumas folhas.');
}
const ehFruto = (id: string) => (itemDef(id) ? itemDef(id)!.bolso === 'frutos' : FRUTOS.some((f) => id === f || id.endsWith('-' + f)));
async function canteiro(x: number, y: number) {
  const k = kCant(x, y), c = jogo.save.canteiros[k], est = estagioCanteiro(x, y);
  if (est === 3 && c) {
    const n = rng.int(2, 4);
    delete jogo.save.canteiros[k]; darItem(c.fruto, n); pintarTile(x, y); sfx('item-obtido');
    await falar(`{JOGADOR} colheu ${n}× ${nomeItem(c.fruto)}!\nA terra ficou fofa de novo.`);
    return;
  }
  if (c) { await falar(est === 1 ? `Um brotinho de ${nomeItem(c.fruto)} acabou de nascer.` : `O pé de ${nomeItem(c.fruto)} está crescendo bem. Volte mais tarde.`); return; }
  const frutos = Object.keys(jogo.save.mochila).filter(ehFruto);
  if (!frutos.length) { await falar('Um canteiro de terra fofa. Dá para plantar um fruto aqui.'); return; }
  const i = await escolher('Plantar qual fruto?', [...frutos.map(nomeItem), 'Deixar para depois']);
  if (i < 0 || i >= frutos.length) return;
  tirarItem(frutos[i]); jogo.save.canteiros[k] = { fruto: frutos[i], plantado: agoraJogo() }; pintarTile(x, y);
  await falar(`{JOGADOR} plantou ${nomeItem(frutos[i])}.`);
}
async function pegar(i: ItemChao) {
  const q = i.qtd ?? 1;
  setFlag(i.flag); darItem(i.item, q); M.cena.tirarProp(kItem(i)); sfx('item-obtido');
  bus.emit('item-obtido', { id: i.item, qtd: q });
  await falar(`{JOGADOR} achou ${q > 1 ? q + '× ' : ''}${nomeItem(i.item)}!`);
}

/* ------------------------------ itens usados no campo ------------------------------ */
export async function alternarBike(): Promise<boolean> {
  const s = jogo.save.jogador, z = M.zv.def;
  if (s.modo === 'bike') { s.modo = 'pe'; M.jog.base = 'andar'; M.jog.pose(); return true; }
  if (s.modo !== 'pe' || ['interior', 'ginasio'].includes(z.tipo)) { await ocupar(() => falar('Não dá para pedalar aqui.')); return false; }
  s.modo = 'bike'; M.jog.base = baseDoModo(false); M.jog.pose(); sfx('ui-ok');
  return true;
}
/** uso de item pelo menu/atalho quando o mapa está no topo: bicicleta, varas e repelente. true = teve efeito */
export async function usarItemNoCampo(id: string): Promise<boolean> {
  if (id === IDS.bike) return alternarBike();
  const rep = usoItem(id)?.repelente ?? (/^(repelente|fumaca-andiroba)/.test(id) ? 100 : 0);
  if (rep) {
    if (jogo.save.repelente > 0) { await ocupar(() => falar('A fumaça da outra ainda está no ar.')); return false; }
    if (!tirarItem(id)) return false;
    jogo.save.repelente = rep; sfx('ui-ok');
    await ocupar(() => falar(`{JOGADOR} acendeu a ${nomeItem(id)}.\nAs criaturas mais fracas vão manter distância.`));
    return true;
  }
  for (const v of ['velha', 'boa', 'mestra'] as const) if (id === IDS.varas[v]) return ocupar(() => pescar(v));
  return false;
}
/** botão select: bicicleta, se tiver; senão pesca com a melhor vara */
export async function atalho() {
  if (qtdItem(IDS.bike)) { await alternarBike(); return; }
  const v = melhorVara();
  if (v) await ocupar(() => pescar(v));
}

/* ------------------------------ interação com A ------------------------------ */
export function interagir(): Promise<void> {
  return ocupar(async () => {
    const j = M.jog, z = M.zv, d = j.dir, x = j.x + DX[d], y = j.y + DY[d], modo = jogo.save.jogador.modo;
    if (mecanicas.get(z.def.id)?.interagir?.(x, y) === true) return;
    const n = npcEm(x, y) ?? ('M#'.includes(z.ch(x, y)) || z.temObjeto(x, y) ? npcEm(x + DX[d], y + DY[d]) : undefined);
    if (n) { await interagirNpc(n); return; }
    if (M.parceira?.visivel && M.parceira.x === x && M.parceira.y === y) { const c = jogo.save.equipe[0]; M.parceira.olharPara(j.x, j.y); M.parceira.emote(c.amizade >= 150 ? 'coracao' : 'nota', 50); await falar(`${nomeCriatura(c)} ${c.amizade >= 150 ? 'está radiante ao seu lado!' : 'olha curiosa para você.'}`); return; }
    const g = M.guardas.find((q) => q.ator.x === x && q.ator.y === y)?.p ?? z.portao(x, y);
    if (g) { await falar(g.fala); return; }
    const it = itemEm(x, y);
    if (it) { await pegar(it); return; }
    const placa = z.def.placas?.find((p) => p.x === x && p.y === y);
    if (placa) { await falar(placa.texto); return; }
    const o = z.objeto(x, y);
    if (o && (o.script || o.texto || o.tela)) {
      if (typeof o.script === 'string') await rodarEvento(o.script);
      else if (o.texto) for (const t of Array.isArray(o.texto) ? (o.texto as string[]) : [String(o.texto)]) await falar(t);
      else if (typeof o.tela === 'string') await abrirTela(o.tela, o.args);
      return;
    }
    const ch = z.ch(x, y), aqui = z.ch(j.x, j.y);
    if (ch === 'c') return cortarCipo(x, y, d);
    if (ch === 'r') return quebrarRocha(x, y, d);
    if (ch === 'p') return ativarForca(d);
    if (ch === 'e' && modo !== 'remo') return escalar(d);
    if (ch === 't') return sacudir(x, y);
    if (ch === 'C') return canteiro(x, y);
    if ((modo === 'remo' && aqui === 'd') || (modo === 'mergulho' && (aqui === 'd' || z.warp(j.x, j.y)))) return mergulhar();
    if (modo === 'remo' && ch === 'w' && d === 'n') return subirCascata();
    if (z.agua(x, y) && modo !== 'mergulho') {
      const vara = melhorVara();
      if (modo === 'pe' || modo === 'bike') {
        if (temAmuleto('remo') && ajudante('remo')) { if (await embarcar(d)) return; }
        else if (!vara) { await pedirAmuleto('remo'); return; }
      }
      if (vara && (await simNao(`Pescar com a ${NOME_VARA[vara]}?`))) await pescar(vara);
    }
  });
}
