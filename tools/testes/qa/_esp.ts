import { ESPECIES } from '../../../src/data/criaturas';
const ids = process.argv.slice(2).map(Number);
for (const e of ESPECIES) if (!ids.length || ids.includes(e.num)) { const s = Object.values(e.base).reduce((a,x)=>a+x,0); console.log(e.num, e.id, e.tipos.join('/'), s, JSON.stringify(e.base), 'golpes', e.golpes.filter(([n])=>n<=12).map(([n,g])=>n+':'+g).join(' '), 'evolui', JSON.stringify(e.evolui??[]), 'cap', e.taxaCaptura); }
