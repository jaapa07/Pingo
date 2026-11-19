import { progressao } from './progressao';
import { niveis, sprites } from './niveis';
const p = await progressao(); console.log('PROG', p.erros, p.info);
const n = await niveis(p); console.log('NIV ERROS', n.erros.length, n.erros.slice(0, 30), 'AVISOS', n.avisos.length, n.avisos.slice(0, 8), n.pendentes.slice(0, 5), n.info);
const s = await sprites(p); console.log('SPR', s.erros.slice(0, 5), s.avisos, s.info);
