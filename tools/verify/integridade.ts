/**
 * Integridade de dados: todo id referenciado existe (golpe, item, espécie, sprite, arena, tileset, música,
 * script, treinador, zona de warp), nos mapas A e B, no Pico e no pós-jogo.
 */
import { existsSync, readdirSync } from 'node:fs';
import type { Comando, Encontro, Habitat } from '../../src/core/tipos';
import { ESPECIES, VISITANTES } from '../../src/data/criaturas';
import { temGolpe } from '../../src/data/golpes';
import { temItemDef } from '../../src/data/itens';
import { FAIXAS } from '../../src/data/music';
import { COMANDOS_CONHECIDOS } from './progressao';
import { comandosExtras } from '../../src/world/registro';
import { RAIZ, carregar, cadaComando, novoAchado, temObjeto, type Achado } from './dados';

const pasta = (p: string) => (existsSync(RAIZ + p) ? new Set(readdirSync(RAIZ + p)) : new Set<string>());
export const encontrosDe = (h: Habitat): Encontro[] => [...(h.todos ?? []), ...(h.manha ?? []), ...(h.dia ?? []), ...(h.noite ?? []), ...(h.camadas ?? []).flatMap((c) => [...(c.todos ?? []), ...(c.manha ?? []), ...(c.dia ?? []), ...(c.noite ?? [])])];


export async function integridade(): Promise<Achado> {
  const a = novoAchado(), d = await carregar();
  const especies = new Map([...ESPECIES, ...VISITANTES].map((e) => [e.num, e]));
  const pessoas = pasta('public/assets/sprites/pessoa'), criaturas = pasta('public/assets/sprites/criatura'), arenas = pasta('public/assets/arenas'), tiles = pasta('public/assets/tiles');
  // o mapa B, o Pico e o pós-jogo estão completos em zonas, ginásios e eventos (20/11): referência quebrada é erro em qualquer mapa
  const E = (arq: string | undefined, m: string) => { a.erros.push(`${arq ?? '?'}: ${m}`); };
  for (const f of d.falhasDeCarga) a.erros.push(f);
  const temScript = (id: string) => d.eventos.has(id) || d.eventosEmCodigo.has(id);
  const spriteOk = (s: string) => (s.startsWith('c:') ? criaturas.has(s.slice(2)) : pessoas.has(s));
  let nRef = 0;

  /* espécies: golpes e evoluções */
  const arqEsp = (n: number) => `src/data/criaturas/parte-${n <= 60 ? '001-060' : n <= 120 ? '061-120' : n <= 180 ? '121-180' : '181-182'}.ts`;
  for (const e of especies.values()) {
    for (const [, g] of e.golpes) { nRef++; if (!temGolpe(g)) E(arqEsp(e.num), `espécie ${e.num} ${e.id}: golpe "${g}" não existe`); }
    for (const v of e.evolui ?? []) { nRef++; if (!especies.has(v.para)) E(arqEsp(e.num), `espécie ${e.num} ${e.id}: evolui para ${v.para}, que não existe`); if (v.item && !temItemDef(v.item)) E(arqEsp(e.num), `espécie ${e.num} ${e.id}: item de evolução "${v.item}" não existe`); }
  }
  /* treinadores */
  for (const t of d.treinadores.values()) {
    const arq = d.arquivoDoTreinador.get(t.id);
    nRef++; if (!spriteOk(t.sprite)) E(arq, `treinador ${t.id}: sprite "${t.sprite}" sem pasta em public/assets/sprites/pessoa`);
    if (t.musica && !FAIXAS[t.musica]) E(arq, `treinador ${t.id}: música "${t.musica}" não existe`);
    for (const i of t.itens ?? []) if (!temItemDef(i)) E(arq, `treinador ${t.id}: item "${i}" não existe`);
    if (!t.equipe.length) E(arq, `treinador ${t.id}: equipe vazia`);
    for (const m of t.equipe) {
      nRef++; if (!especies.has(m.e)) { E(arq, `treinador ${t.id}: espécie ${m.e} não existe`); continue; }
      for (const g of m.golpes ?? []) if (!temGolpe(g)) E(arq, `treinador ${t.id}: golpe "${g}" não existe`);
      if (m.item && !temItemDef(m.item)) E(arq, `treinador ${t.id}: item segurado "${m.item}" não existe`);
    }
  }
  /* eventos */
  const conhecidos = new Set([...COMANDOS_CONHECIDOS, ...d.comandosEmCodigo, ...comandosExtras.keys()]);
  for (const ev of d.eventos.values()) {
    const arq = d.arquivoDoEvento.get(ev.id);
    if (arq?.includes('/_')) continue; // roteiros de teste do motor
    cadaComando(ev.passos, (c: Comando) => {
      const [n, x, y, z] = c as [string, unknown, unknown, unknown]; nRef++;
      if (n === 'chamar' && !temScript(String(x))) E(arq, `evento ${ev.id}: chama "${x}", que não existe`);
      if (n === 'batalha' && !d.treinadores.has(String(x))) E(arq, `evento ${ev.id}: batalha com "${x}", que não existe`);
      if ((n === 'dar' || n === 'tirar') && !temItemDef(String(x))) E(arq, `evento ${ev.id}: item "${x}" não existe`);
      if ((n === 'darCriatura' || n === 'selvagem' || n === 'darOvo' || n === 'errante') && !especies.has(Number(x))) E(arq, `evento ${ev.id}: espécie ${x} não existe`);
      if (n === 'musica' && !FAIXAS[String(x)]) E(arq, `evento ${ev.id}: música "${x}" não existe`);
      if (n === 'warp') { const zd = d.zonas.get(String(x)); if (!zd) E(arq, `evento ${ev.id}: warp para a zona "${x}", que não existe`); else if (zd.mapaChars[Number(z)]?.[Number(y)] === undefined) E(arq, `evento ${ev.id}: warp para ${x} (${y},${z}) fora do mapa`); }
      if (!arq?.includes('_motor') && !conhecidos.has(n) && n.length > 2) a.avisos.push(`${arq}: evento ${ev.id} usa o comando "${n}", que o motor de eventos não conhece`);
    });
  }
  /* zonas */
  for (const z of d.zonas.values()) {
    const arq = d.arquivoDaZona.get(z.id);
    nRef += 3;
    if (!tiles.has(z.tileset + '.png')) E(arq, `tileset "${z.tileset}" sem public/assets/tiles/${z.tileset}.png`);
    if (!arenas.has(z.arena)) E(arq, `arena "${z.arena}" sem pasta em public/assets/arenas`);
    if (!FAIXAS[z.musica]) E(arq, `música "${z.musica}" não existe em src/data/music`);
    if (!existsSync(`${RAIZ}public/assets/zonas/${z.id}/zona.json`)) E(arq, `zona sem bake em public/assets/zonas/${z.id}/ (rode npm run bake)`);
    for (const o of z.objetos ?? []) { nRef++; if (!temObjeto(o.o)) E(arq, `objeto "${o.o}" fora dos catálogos`); if (typeof o.script === 'string' && !temScript(o.script)) E(arq, `objeto ${o.o}: script "${o.script}" não existe`); }
    for (const w of z.warps) {
      nRef++;
      if (d.zonas.has(w.para.zona)) { if (d.zonas.get(w.para.zona)!.mapaChars[w.para.y]?.[w.para.x] === undefined) E(arq, `warp (${w.x},${w.y}) chega em ${w.para.zona} (${w.para.x},${w.para.y}), fora do mapa`); continue; }
      E(arq, `warp (${w.x},${w.y}) leva à zona "${w.para.zona}", que não existe`);
    }
    for (const n of z.npcs ?? []) {
      nRef++;
      if (!spriteOk(n.sprite)) E(arq, `NPC ${n.id}: sprite "${n.sprite}" sem pasta em public/assets/sprites`);
      if (n.treinador && !d.treinadores.has(n.treinador)) E(arq, `NPC ${n.id}: treinador "${n.treinador}" não existe`);
      if (n.script && !temScript(n.script)) E(arq, `NPC ${n.id}: script "${n.script}" não existe`);
      for (const i of n.loja ?? []) if (!temItemDef(i)) E(arq, `NPC ${n.id}: vende "${i}", que não existe`);
    }
    for (const p of z.portoes ?? []) if (p.sprite && !spriteOk(p.sprite)) E(arq, `portão (${p.x},${p.y}): sprite "${p.sprite}" sem pasta em public/assets/sprites`);
    for (const g of z.gatilhos ?? []) { nRef++; if (!temScript(g.script)) E(arq, `gatilho (${g.x},${g.y}): script "${g.script}" não existe`); }
    for (const i of z.itens ?? []) { nRef++; if (!temItemDef(i.item)) E(arq, `item de chão "${i.item}" não existe`); }
    for (const h of z.habitats ?? []) for (const e of encontrosDe(h)) { nRef++; if (!especies.has(e.e)) E(arq, `habitat ${h.metodo}: espécie ${e.e} não existe`); }
  }
  a.info.push(`${nRef} referências conferidas em ${d.zonas.size} zonas, ${d.treinadores.size} treinadores, ${d.eventos.size} eventos, ${especies.size} espécies`);
  return a;
}
