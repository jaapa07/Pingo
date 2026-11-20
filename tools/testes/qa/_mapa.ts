const z = (await import(`../../../src/data/zonas/${process.argv[2]}.ts`)).default;
const [y0, y1] = (process.argv[3] ?? '0-999').split('-').map(Number);
console.log('   ' + Array.from({ length: z.mapaChars[0].length }, (_, i) => String(i % 10)).join(''));
z.mapaChars.forEach((r: string, y: number) => { if (y >= y0 && y <= y1) console.log(String(y).padStart(2) + ' ' + r); });
for (const n of z.npcs ?? []) if (n.y >= y0 && n.y <= y1) console.log('npc', n.id, n.x, n.y);
for (const o of z.objetos ?? []) if (o.y >= y0 && o.y <= y1) console.log('obj', o.o, o.x, o.y);
