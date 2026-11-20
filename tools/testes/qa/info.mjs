// resumo das zonas pedidas (NPCs, warps, gatilhos, portões, itens): node info.mjs A1 A1-lab …
import { abrir } from './piloto.mjs';
const t = await abrir({ nome: 'info', turbo: 1 });
const r = await t.ev(async (ids) => {
  const { zonaDef } = await import('/src/world/zonas.ts'); const out = [];
  for (const id of ids) { const z = zonaDef(id); if (!z) { out.push(id + ': NÃO EXISTE'); continue; }
    out.push(`## ${id} "${z.nome}" ${z.mapaChars[0].length}x${z.mapaChars.length} passo ${z.passo ?? '-'} pouso ${z.pouso ?? '-'}`);
    out.push(' warps: ' + z.warps.map((w) => `(${w.x},${w.y})→${w.para.zona}${w.requer ? '[' + w.requer + ']' : ''}`).join(' '));
    out.push(' npcs: ' + (z.npcs ?? []).map((n) => `${n.id}@${n.x},${n.y}${n.treinador ? ' T:' + n.treinador : ''}${n.script ? ' S:' + n.script : ''}${n.loja ? ' LOJA' : ''}${n.se ? ' se[' + n.se + ']' : ''}`).join(' | '));
    if (z.gatilhos?.length) out.push(' gatilhos: ' + z.gatilhos.map((g) => `(${g.x},${g.y} ${g.w ?? 1}x${g.h ?? 1}) ${g.script}${g.se ? ' se[' + g.se + ']' : ''}`).join(' | '));
    if (z.portoes?.length) out.push(' portões: ' + z.portoes.map((g) => `(${g.x},${g.y} ${g.w ?? 1}x${g.h ?? 1}) [${g.requer}]`).join(' | '));
    if (z.itens?.length) out.push(' itens: ' + z.itens.map((i) => `${i.item}@${i.x},${i.y}${i.oculto ? '*' : ''}`).join(' '));
    const sc = (z.objetos ?? []).filter((o) => o.script || o.tela); if (sc.length) out.push(' objetos c/ script: ' + sc.map((o) => `${o.o}@${o.x},${o.y}:${o.script ?? o.tela}`).join(' '));
    if (z.habitats?.length) out.push(' habitats: ' + z.habitats.map((h) => h.metodo + ':' + (h.todos ?? h.dia ?? []).map((e) => `${e.e}(${e.nv})x${e.peso}`).join(',')).join(' ; '));
  }
  return out.join('\n');
}, process.argv.slice(2));
console.log(r); await t.browser.close();
