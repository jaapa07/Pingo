import { progressao } from './progressao';
import { integridade } from './integridade';
const p = await progressao();
for (const s of p.passos) console.log(s.insignias, 'disp', s.disponiveis, 'am', s.amuletos.join(','), 'novas', s.zonasNovas.join(' '), '| flags', s.flags.join(','));
console.log('ERROS', p.erros); console.log('PEND', p.pendentes); console.log(p.info);
const i = await integridade(); console.log('INT ERROS', i.erros.length, i.erros.slice(0, 40)); console.log(i.avisos.slice(0, 10), i.pendentes, i.info);
