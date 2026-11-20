// QA 4 — sonda: abre um checkpoint e lista os warps (tipo, requisito) e NPCs das zonas pedidas (não joga nada).
// Uso: qa4-run.sh qa4-sonda.mjs <seg> <save> <zona> [zona...]
import { abrir, lerSave } from './qa4-lib.mjs';
const [save, ...zonas] = process.argv.slice(2);
const t = await abrir(lerSave(save), { semente: 3 });
for (const z of zonas) console.log(await t.q(async (z) => { const Z = await import('/src/world/zonas.ts'); const d = Z.zonaDef(z); if (!d) return z + ' NÃO EXISTE';
  return `${z} ${d.mapaChars[0].length}x${d.mapaChars.length} passo ${d.passo} pouso ${JSON.stringify(d.pouso)}\n` + d.warps.map((w) => `   (${w.x},${w.y}) → ${w.para.zona} (${w.para.x},${w.para.y}) ${w.tipo ?? ''} ${w.requer ?? ''}`).join('\n') + '\n   npcs: ' + (d.npcs ?? []).map((n) => `${n.id}@${n.x},${n.y}${n.treinador ? '[T]' : ''}${n.se ? '{' + n.se + '}' : ''}`).join(' '); }, z));
await t.fim();
