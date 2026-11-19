import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/** Viveiro do Seu Aroeira: ninhos, ovos chocando perto do fogão e a rede onde ele "só descansa os olhos". */
const g = grade('A2-casa-aroeira', [
  '##############',
  '##W###K###W###',
  '#FF.N.N.N.EE.#',
  '#............#',
  '#..1.....hmmh#',
  '#............#',
  '#rr....2...C.#',
  '#.....aa.....#',
  '#.....aa.....#',
  '######DD######',
], { W: '#', K: '#', F: '.', N: '.', E: '.', h: '.', m: '.', r: '.', C: '.', a: ',', D: '+', '1': '.', '2': '.' });
const h = g.todos('h');
const zona: ZonaDef = {
  id: 'A2-casa-aroeira', nome: 'Viveiro do Seu Aroeira', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'cidade-samba', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'palafita' },
    ...g.todos('W').map(([x, y]) => ({ o: 'janela', x, y })), obj(g, 'K', 'quadro'),
    { o: 'fogao-lenha', x: g.todos('F')[0][0], y: g.todos('F')[0][1], texto: ['O fogão fica aceso dia e noite: ovo gosta de calor e Seu Aroeira gosta de café.'] },
    ...g.todos('N').map(([x, y], i) => ({ o: 'cesto', x, y, texto: [['Um ninho com três ovos pintadinhos. Um deles deu um pulinho!', 'Um ninho forrado de paina. O ovo daqui é verde com listras.', 'Ninho vazio, ainda morno. Alguém nasceu faz pouco.'][i]] })),
    { o: 'estante', x: g.todos('E')[0][0], y: g.todos('E')[0][1], texto: ['Cadernos de anotação: "Ovo nº 412 — chocou cantando." "Ovo nº 413 — era uma batata. Erro meu."'] },
    { o: 'cadeira', x: h[0][0], y: h[0][1] }, { o: 'mesa', x: h[0][0] + 1, y: h[0][1] }, { o: 'cadeira', x: h[1][0], y: h[1][1] },
    { o: 'rede', x: g.todos('r')[0][0], y: g.todos('r')[0][1], texto: ['A rede do Seu Aroeira. Ainda balança.'] },
    obj(g, 'C', 'cesto', { texto: ['Um cesto de frutos para os filhotes: pitanga, caju e acerola.'] }),
    { o: 'tapete-c', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
  ],
  warps: saidas(g, 'D', 'A2', 33, 8, 's', 'porta'),
  npcs: [
    gente(g, '1', 'aroeira', 'seu-aroeira', 'Seu Aroeira', { script: 'aroeira' }),
    gente(g, '2', 'pacoca', 'c:cotiazinha', 'Paçoca', { mov: 'vagar', se: 'flag:faro-ok', fala: ['(A Paçoca fareja o seu bolso, acha uma migalha e sai toda prosa.)'] }),
  ],
};
export default zona;
