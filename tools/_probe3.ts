import { readdirSync } from 'node:fs';
import { ESPECIES } from '../src/data/criaturas';
import { temGolpe } from '../src/data/golpes';
const E = new Map(ESPECIES.map((e) => [e.num, e]));
const pre = new Map<number, number>(); for (const e of ESPECIES) for (const ev of e.evolui ?? []) if (ev.nivel) pre.set(ev.para, ev.nivel);
const dir = new URL('../src/data/treinadores/', import.meta.url);
for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts')).sort()) {
  const m = await import(new URL(f, dir).href);
  console.log('### ' + f);
  for (const v of Object.values(m)) for (const t of (Array.isArray(v) ? v : []) as any[]) {
    if (!t?.equipe) continue;
    const eq = t.equipe.map((x: any) => { const e = E.get(x.e)!; const al: string[] = []; if ((pre.get(x.e) ?? 0) > x.nv) al.push('<evo' + pre.get(x.e)); const ev = e.evolui?.find((k) => k.nivel && x.nv >= k.nivel + 6); if (ev) al.push('>evo' + ev.nivel); for (const g of x.golpes ?? []) if (!temGolpe(g)) al.push('golpe?' + g); return `${e.nome}${x.nv}${x.golpes ? 'g' : ''}${x.item ? '+' + x.item : ''}${al.length ? '[' + al.join(' ') + ']' : ''}`; }).join(' ');
    console.log(`${t.id} | ${t.ia}${t.dupla ? ' DUPLA' : ''}${t.insignia ? ' INS' + t.insignia : ''} | ${eq}${t.itens ? ' | itens ' + t.itens.join(',') : ''}`);
  }
}
