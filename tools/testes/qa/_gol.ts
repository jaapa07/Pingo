import { ESPECIES } from '../../../src/data/criaturas';
import { golpe } from '../../../src/data/golpes';
import { golpesDeJogador } from '../../equilibrio-referencia';
import { especie } from '../../../src/battle/criatura';
for (const a of process.argv.slice(2)) { const [e, nv] = a.split(':').map(Number); const s = ESPECIES.find((x) => x.num === e)!;
 console.log(e, s.nome, s.tipos.join('/'), JSON.stringify(s.base), 'aprende<=nv:', s.golpes.filter(([n]) => n <= nv).map(([n, g]) => `${n}:${g}(${golpe(g).tipo},${golpe(g).cat},${golpe(g).poder})`).join(' '));
}
