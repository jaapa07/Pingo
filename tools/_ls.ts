import { ESPECIES } from '../src/data/criaturas';
import { golpe, temGolpe } from '../src/data/golpes';
for (const a of process.argv.slice(2)) { const [n, nv] = a.split(':').map(Number); const e = ESPECIES.find((x) => x.num === n)!;
  console.log(`${n} ${e.nome} ${e.tipos.join('/')} nv${nv} [${Object.values(e.base).join(',')}]: ` + e.golpes.filter(([l, id]) => l <= nv && temGolpe(id)).map(([l, id]) => { const g = golpe(id); return `${id}(${g.tipo.slice(0, 4)} ${g.cat[0]}${g.poder || ''}${g.efeitos.map((x: any) => ' ' + x.t + (x.s ? ':' + x.s : '') + (x.v && typeof x.v === 'string' ? ':' + x.v : '')).join('')})`; }).join(' ')); }
