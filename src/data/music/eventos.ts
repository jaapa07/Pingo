/** Músicas de lugares fechados e de eventos: Posto Guardião, Venda, laboratório, ginásio, evolução, captura, trem, Saveiro, Cartel e créditos. */
import type { Faixa } from './types';
import { temaTitulo, vilaJacaranda } from './cenario';

const V8 = '- | - | - | - | - | - | - | -';

export const posto: Faixa = {
  id: 'posto', titulo: 'Posto Guardião', bpm: 96, loop: true, envio: 0.34,
  inst: { melodia: 'kalimba', contra: 'flauta', baixo: 'tri', harmonia: 'violao' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 1], passo: 2, oitava: 4 },
  vol: { melodia: 1, contra: 0.45, harmonia: 0.55, bateria: 0.45 },
  bateria: { a: { ganza: 'x.o.x.o.x.o.x.o.', triF: '....x.......x...' } },
  secoes: {
    A: {
      melodia: 'd6:4 b5:4 g5:6 b5:2 | a5:4 f#5:4 d5:8 | g5:4 b5:4 e6:6 d6:2 | c6:4 e6:4 g5:8 | d6:4 b5:4 g6:6 f#6:2 | f#6:4 d6:4 a5:8 | e6:4 c6:4 g5:4 c6:4 | a5:8 d6:8',
      contra: V8, baixo: '@1.......5...1...', acordes: 'G | D/F# | Em | C | G | D | C | D', bateria: 'a',
    },
    B: {
      melodia: 'g5:4 b5:4 e6:8 | f#6:4 d6:4 b5:8 | e6:2 g6 e6 c6 g5:4 c6:4 | d6:6 b5:2 g5:8 | c6:4 e6:4 a5:6 c6:2 | b5:4 d6:4 g6:8 | e6:4 g6:4 f#6:4 a5:4 | g5:12 r:4',
      contra: 'b4:16 | b4:16 | c5:16 | b4:16 | a4:16 | b4:16 | c5:8 d5:8 | b4:12 r:4',
      baixo: '@1.......5...1...', acordes: 'Em | Bm | C | G | Am | G | C D | G', bateria: 'a',
    },
  },
  ordem: ['A', 'B'],
};

export const venda: Faixa = {
  id: 'venda', titulo: 'A Venda (xote)', bpm: 104, swing: 0.28, loop: true, envio: 0.22,
  inst: { melodia: 'sanfona', contra: 'pulso12', baixo: 'tri', harmonia: 'violao' },
  estilo: { tipo: 'stab', grade: '..x...x...x...x.', oitava: 4 },
  vol: { harmonia: 0.55, bateria: 0.6 },
  bateria: { a: { zabumba: 'X.....x.X.......', bacalhau: '....x.......x...', triF: 'x.xxx.xxx.xxx.xx', triA: '..x...x...x...x.' } },
  secoes: {
    A: {
      melodia: 'e5:2 g5 c6:4 a5:2 g5 e5:4 | g5:2 e5 c5 e5 g5:8 | a5:2 c6 f6:4 d6:2 c6 a5:4 | g5:2 c6 e6 c6 g5:8 | f5:2 g5 b5:4 d6:2 b5 g5:4 | b5:2 d6 f6 d6 b5:4 g5:4 | c6:2 e6 g6:4 e6:2 c6 g5:4 | c6:8 r:2 g5:2 c6:2 r:2',
      contra: V8, baixo: '@1.....5.1...5...', acordes: 'C | C | F | C | G7 | G7 | C | C', bateria: 'a',
    },
    B: {
      melodia: 'a5:4 c6:2 f6:6 e6:2 d6:2 | c6:2 a5 f5 a5 c6:8 | g5:4 c6:2 e6:6 d6:2 c6:2 | g5:2 e5 c5 e5 g5:8 | f#5:2 a5 c6 d6 f#6:4 d6:4 | f6:2 d6 b5 g5 b5:4 d6:4 | e6:2 c6 g5 c6 e6:4 c6:4 | d6:2 b5 g5 b5 d6:2 f6 g6:4',
      contra: V8, baixo: '@1.....5.1...5.a.', acordes: 'F | F | C | C | D7 | G7 | C | G7', bateria: 'a',
    },
  },
  ordem: ['A', 'B'],
};

export const laboratorio: Faixa = {
  id: 'laboratorio', titulo: 'Laboratório da Profª Ipê', bpm: 112, loop: true, envio: 0.26,
  inst: { melodia: 'pizz', contra: 'pulso12', baixo: 'tri', harmonia: 'kalimba' },
  estilo: { tipo: 'arpejo', padrao: [0, 2, 1, 2], passo: 2, oitava: 4 },
  vol: { melodia: 1, contra: 0.4, harmonia: 0.5, bateria: 0.5 },
  bateria: { a: { aro: '....x.......x...', caxixi: 'x.x.x.x.x.x.x.x.', gota: '..........o.....' } },
  secoes: {
    A: {
      melodia: 'e5:2 r a5 r c#6:2 e6 a5:4 | f#5:2 r a5 r c#6:2 f#6 c#6:4 | d5:2 r f#5 r a5:2 d6 a5:4 | e5:2 g#5 b5 e6 d6:2 b5 g#5:4 | e5:2 r a5 r c#6:2 e6 a6:4 | f#6:2 r c#6 r a5:2 c#6 f#5:4 | b5:2 d6 f#6:4 d6:2 b5 f#5:4 | e6:4 g#5:4 b5:4 e5:4',
      contra: V8, baixo: '@1.....5.1.......', acordes: 'A | F#m | D | E | A | F#m | Bm | E', bateria: 'a',
    },
    B: {
      melodia: 'f#6:6 d6:2 a5:8 | e6:6 c#6:2 a5:8 | d6:4 b5:4 f#5:6 b5:2 | c#6:8 a5:4 f#5:4 | a5:2 d6 f#6:4 a6:2 f#6 d6:4 | c#6:2 e6 a6:4 e6:2 c#6 a5:4 | b5:2 e6 g#6:4 e6:2 b5 g#5:4 | a5:12 r:4',
      contra: 'a4:8 d5:8 | a4:8 c#5:8 | f#4:8 b4:8 | a4:8 c#5:8 | - | - | - | -',
      baixo: '@1.....5.1...5...', acordes: 'D | A | Bm | F#m | D | A | E | A', bateria: 'a',
      inst: { melodia: 'flauta' },
    },
  },
  ordem: ['A', 'B'],
};

export const ginasio: Faixa = {
  id: 'ginasio', titulo: 'Salão do Ginásio', bpm: 120, loop: true, envio: 0.3,
  inst: { melodia: 'metais', contra: 'pulso12', baixo: 'tri', harmonia: 'cordas' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { contra: 0.4, harmonia: 0.55, bateria: 0.65 },
  bateria: {
    a: { surdo: 'X.......x.......', caixa: '....o.oo....o.oo', triA: '........x.......' },
    b: { surdo: 'X.......x.....x.', caixa: 'o.oox.ooo.oox.oo', triA: '....x.......x...' },
  },
  secoes: {
    A: {
      melodia: 'd5:4 a5:4 f5:3 e5:3 d5:2 | e5:4 g5:4 c6:8 | d6:4 bb5:4 f5:3 g5:3 bb5:2 | a5:6 c#6:2 e6:8 | d6:4 a5:4 f6:3 e6:3 d6:2 | e6:4 c6:4 g5:8 | f5:2 bb5 d6:4 e6:2 c#6 a5:4 | d6:12 r:4',
      contra: V8, baixo: '@1...1...5...1...', acordes: 'Dm | C | Bb | A | Dm | C | Bb A | Dm', bateria: 'a',
    },
    B: {
      melodia: 'c6:6 a5:2 f5:4 a5:4 | g5:6 c6:2 e6:8 | d6:4 bb5:4 g5:3 bb5:3 d6:2 | f6:6 d6:2 a5:8 | d6:2 f6 bb6:4 f6:2 d6 bb5:4 | c6:2 f6 a6:4 f6:8 | g6:4 d6:4 c#6:4 e6:4 | d6:8 a5:4 d5:4',
      contra: 'a4:2 c5 f5 c5 a4 c5 f5 c5 | g4:2 c5 e5 c5 g4 c5 e5 c5 | g4:2 bb4 d5 bb4 g4 bb4 d5 bb4 | a4:2 d5 f5 d5 a4 d5 f5 d5 | - | - | - | -',
      baixo: '@1...1...5...1...', acordes: 'F | C | Gm | Dm | Bb | F | Gm A7 | Dm', bateria: 'b',
    },
  },
  ordem: ['A', 'B'],
};

export const evolucao: Faixa = {
  id: 'evolucao', titulo: 'Metamorfose', bpm: 120, loop: true, envio: 0.45,
  eco: { passos: 3, fb: 0.35, mix: 0.25 },
  inst: { melodia: 'sino', contra: 'pulso12', baixo: 'baixoSub', harmonia: 'kalimba' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 3, 4, 3, 2, 1], passo: 1, oitava: 4 },
  vol: { melodia: 0.9, contra: 0.4, harmonia: 0.55, bateria: 0.5 },
  bateria: {
    a: { triA: 'x.......x.......', caxixi: 'x.x.x.x.x.x.x.x.' },
    b: { triA: 'x...x...x...x...', caxixi: 'xxxxxxxxxxxxxxxx', chipBumbo: 'x...x...x...x...' },
  },
  secoes: {
    A: {
      melodia: 'g5:8 c6:8 | e6:8 c6:8 | a5:8 c6:8 | d6:8 b5:8 | g5:4 c6:4 e6:8 | a5:4 c6:4 e6:8 | f5:4 a5:4 c6:4 f6:4 | g5:4 b5:4 d6:4 g6:4',
      contra: V8, baixo: '@1...............', acordes: 'C | Am | F | G | C | Am | F | G', bateria: 'a',
    },
    B: {
      melodia: 'c6:4 eb6:4 ab6:8 | d6:4 f6:4 bb6:8 | e6:2 g6 c6 e6 g6:8 | c6:2 e6 g6 e6 c6:8 | ab5:2 c6 eb6 ab6 eb6:4 c6:4 | bb5:2 d6 f6 bb6 f6:4 d6:4 | c6:2 e6 g6:4 e6:2 c6 g5:4 | c6:12 r:4',
      contra: 'eb5:8 c5:8 | f5:8 d5:8 | g5:8 e5:8 | g5:8 e5:8 | - | - | - | -',
      baixo: '@1.......1.......', acordes: 'Ab | Bb | C | C | Ab | Bb | C | C', bateria: 'b',
    },
  },
  ordem: ['A', 'B'],
};

export const captura: Faixa = {
  id: 'captura', titulo: 'Cuia Fechada!', bpm: 140, loop: false, envio: 0.28,
  inst: { melodia: 'pulso25', contra: 'pulso12', baixo: 'tri', harmonia: 'viola' },
  estilo: { tipo: 'ritmo', grade: 'x..x..x.x..x..x.', oitava: 4 },
  vol: { contra: 0.5, harmonia: 0.5 },
  bateria: { a: { zabumba: 'X..x..x.X..x..x.', triA: '..x...x...x...x.' }, f: { zabumba: 'X...X...X.......', prato: '........x.......' } },
  secoes: {
    A: {
      melodia: 'b5:2 d6 g6:4 d6:2 g6 b6:4 | c6:2 e6 g6:4 a6:2 f#6 d6:4 | g6:2 r:2 g6:2 d6:2 g6:8',
      contra: 'g5:2 b5 d6:4 b5:2 d6 g6:4 | g5:2 c6 e6:4 f#6:2 d6 a5:4 | b5:2 r:2 b5:2 b5:2 b5:8',
      baixo: '@1..1..5.1..1..5.|1..1..5.1..1..5.|1...1...1.......', acordes: 'G | C D | G', bateria: 'a a f',
    },
  },
  ordem: ['A'],
};

export const trem: Faixa = {
  id: 'trem', titulo: 'Trem da Serra', bpm: 132, loop: true, envio: 0.22,
  inst: { melodia: 'viola', contra: 'sanfona', baixo: 'tri', harmonia: 'violao' },
  estilo: { tipo: 'ritmo', grade: 'x.xxx.xxx.xxx.xx', oitava: 3 },
  vol: { melodia: 1, contra: 0.5, harmonia: 0.4, bateria: 0.65 },
  bateria: {
    a: { vapor: 'x...o...x...o...', caixa: 'o.ooo.ooo.ooo.oo', zabumba: 'X.......X.......', ganza: 'x.xxx.xxx.xxx.xx' },
    v: { vapor: 'x...o...x...o...', caixa: 'o.ooo.ooo.oox.xx', zabumba: 'X.......X.......', bigorna: '............x...' },
  },
  secoes: {
    A: {
      melodia: 'd5:2 g5 b5 d6 b5:4 g5:4 | b5:2 d6 g6 d6 b5:8 | e6:2 c6 g5 c6 e6:4 g6:4 | d6:6 b5:2 g5:8 | f#5:2 a5 c6 d6 f#6:4 d6:4 | c6:2 a5 f#5 a5 c6:8 | b5:2 d6 g6:4 f#6:2 e6 d6:4 | g5:8 r:8',
      contra: '- | - | - | r:8 d5:8 | - | - | - | r:4 b4:2 d5 g5:8',
      baixo: '@1...5...1...5...', acordes: 'G | G | C | G | D7 | D7 | G | G', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'g6:6 e6:2 c6:8 | d6:6 b5:2 g5:8 | f#6:2 e6 d6 c6 a5:4 f#5:4 | g5:2 b5 d6 g6 d6:8 | e6:3 g6:3 e6:2 c6:3 e6:3 g6:2 | d6:3 g6:3 d6:2 b5:8 | c#6:2 e6 a6:4 g6:2 e6 c#6:4 | d6:4 f#6:4 a6:4 c6:4',
      contra: V8, baixo: '@1...5...1...5...', acordes: 'C | G | D7 | G | C | G | A7 | D7', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'b5:8 e6:8 | d6:8 f#6:8 | e6:4 g6:4 c6:8 | d6:4 b5:4 g5:8 | g5:4 b5:4 e6:6 g6:2 | f#6:6 d6:2 b5:8 | e6:4 c6:4 d6:4 f#6:4 | g6:12 r:4',
      contra: 'g5:8 b5:8 | f#5:8 b5:8 | g5:8 e5:8 | g5:8 d5:8 | e5:8 g5:8 | d5:8 f#5:8 | g5:8 a5:8 | b5:12 r:4',
      baixo: '@1...5...1...5...', acordes: 'Em | Bm | C | G | Em | Bm | C D | G', bateria: 'a a a a a a a v',
      inst: { melodia: 'flauta' },
    },
  },
  ordem: ['A', 'B', 'C'],
};

export const saveiro: Faixa = {
  id: 'saveiro', titulo: 'Travessia de Saveiro', bpm: 96, passos: 12, loop: true, envio: 0.36,
  inst: { melodia: 'flauta', contra: 'sanfona', baixo: 'tri', harmonia: 'viola' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 3, 2, 1], passo: 2, oitava: 4 },
  vol: { melodia: 0.95, contra: 0.45, harmonia: 0.5, bateria: 0.5 },
  bateria: {
    a: { ganza: 'x.ox.ox.ox.o', surdo: 'x...........' },
    b: { ganza: 'x.ox.ox.ox.o', surdo: 'x.....x.....', triA: '......x.....' },
  },
  secoes: {
    A: {
      melodia: 'f#5:6 a5:6 | d6:8 a5:4 | b5:6 g5:6 | a5:8 f#5:4 | e5:6 a5:6 | c#6:8 e6:4 | d6:6 a5:6 | f#5:8 r:4',
      contra: V8, baixo: '@1.....5.....', acordes: 'D | D | G | D | A | A | D | D', bateria: 'a',
    },
    B: {
      melodia: 'b5:4 d6:4 g6:4 | f#6:8 d6:4 | e6:4 g6:4 b5:4 | a5:8 c#6:4 | d6:4 b5:4 g5:4 | a5:4 d6:4 f#6:4 | e6:6 c#6:6 | d6:8 r:4',
      contra: 'd5:12 | a4:12 | b4:12 | c#5:12 | b4:12 | a4:12 | g4:6 a4:6 | f#4:8 r:4',
      baixo: '@1.....5.....', acordes: 'G | D | Em | A | G | D | A | D', bateria: 'b',
    },
    C: {
      melodia: 'f#6:8 d6:4 | c#6:8 a5:4 | b5:4 d6:4 g6:4 | f#6:6 a5:6 | d6:4 f#6:4 b6:4 | a6:8 f#6:4 | g6:6 e6:6 | d6:8 r:4',
      contra: V8, baixo: '@1.....5.....', acordes: 'Bm | F#m | G | D | Bm | F#m | G A | D', bateria: 'b',
    },
  },
  ordem: ['A', 'B', 'C'],
};

export const cartelTema: Faixa = {
  id: 'cartel-tema', titulo: 'Sombras do Cartel Ferrugem', bpm: 100, loop: true, envio: 0.26,
  inst: { melodia: 'pizz', contra: 'pulso12', baixo: 'baixoDist', harmonia: 'pulso' },
  estilo: { tipo: 'stab', grade: '....x.......x...', oitava: 4 },
  vol: { melodia: 1, harmonia: 0.35, baixo: 0.7, bateria: 0.6 },
  bateria: {
    a: { bumbo: 'x.....x...x.....', aro: '....x.......x...', metal: '..............x.' },
    b: { bumbo: 'x.....x...x.....', aro: '....x.......x...', chimbal: 'x.x.x.x.x.x.x.x.', bigorna: 'x...............' },
  },
  secoes: {
    A: {
      melodia: 'g5:2 r:2 bb5:2 r:2 d6:2 c#6:2 d6:4 | g5:2 r:2 bb5:2 r:2 a5:2 f#5:2 g5:4 | eb5:2 r:2 g5:2 r:2 bb5:2 a5:2 bb5:4 | a5:2 r:2 f#5:2 r:2 d5:8 | g5:2 r:2 bb5:2 r:2 d6:2 c#6:2 d6:4 | g6:2 r:2 f6:2 r:2 d6:2 bb5:2 g5:4 | a5:2 c#6 e6:4 g6:2 e6 c#6:4 | d6:8 f#5:4 a5:4',
      contra: V8, baixo: '@1.....1.5.a.....|1.....1.5...1...', acordes: 'Gm | Gm | Eb | D | Gm | Gm | A7 | D', bateria: 'a',
    },
    B: {
      melodia: 'c6:4 eb6:4 g6:6 f6:2 | d6:4 bb5:4 g5:8 | c6:2 a5 f#5:4 a5:2 c6 d6:4 | bb5:6 a5:2 g5:8 | eb6:4 c6:4 g5:6 c6:2 | d6:4 g6:4 bb6:8 | a6:2 f#6 d6 c6 a5:4 f#5:4 | g5:12 r:4',
      contra: 'g4:8 c5:8 | g4:8 d5:8 | f#4:8 a4:8 | g4:8 d5:8 | - | - | - | -',
      baixo: '@1.....1.5.a.....|1.....1.5...1...', acordes: 'Cm | Gm | D7 | Gm | Cm | Gm | D7 | Gm', bateria: 'b',
      inst: { melodia: 'lead' },
    },
  },
  ordem: ['A', 'B'],
};

export const creditos: Faixa = {
  id: 'creditos', titulo: 'Até a Próxima Trilha', bpm: 104, loop: true, envio: 0.34,
  inst: { melodia: 'flauta', contra: 'pulso12', baixo: 'tri', harmonia: 'viola' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 3, 2, 1, 2, 1], passo: 2, oitava: 4 },
  vol: { melodia: 0.95, contra: 0.45, harmonia: 0.5, bateria: 0.6 },
  bateria: {
    s: { triF: 'x...x...x...x...' },
    a: { zabumba: 'X..x....X..x....', bacalhau: '......x.......x.', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.' },
    c: { ganza: 'x.o.x.o.x.o.x.o.', aro: '....x.......x...' },
  },
  secoes: {
    // o tema do título, agora na flauta e sem pressa
    A: { melodia: temaTitulo.secoes.A.melodia, contra: temaTitulo.secoes.A.contra, baixo: '@1.......5...1...', acordes: temaTitulo.secoes.A.acordes, bateria: 's' },
    B: {
      melodia: 'b5:6 d6:2 g6:8 | a6:6 e6:2 c#6:8 | a5:4 c#6:4 f#6:6 e6:2 | d6:8 b5:8 | g5:2 b5 d6:4 g6:2 d6 b5:4 | a5:2 c#6 e6:4 a6:2 e6 c#6:4 | f#6:6 e6:2 d6:8 | d6:8 r:8',
      contra: V8, baixo: '@1..1..5.1..1..5.', acordes: 'G | A | F#m | Bm | G | A | D | D', bateria: 'a',
      inst: { melodia: 'pulso25' },
    },
    C: {
      melodia: 'f#5:4 b5:4 d6:6 c#6:2 | b5:6 g5:2 d5:8 | f#5:4 a5:4 d6:6 f#6:2 | e6:8 c#6:8 | d6:4 f#6:4 b6:6 a6:2 | g6:6 d6:2 b5:8 | c#6:4 e6:4 a6:8 | a6:8 e6:4 c#6:4',
      contra: 'd5:8 f#5:8 | d5:8 b4:8 | d5:8 a4:8 | c#5:8 e5:8 | f#5:8 d5:8 | d5:8 g5:8 | e5:8 c#5:8 | e5:8 a4:8',
      baixo: '@1..1..5.1..1..5.', acordes: 'Bm | G | D | A | Bm | G | A | A', bateria: 'a',
      inst: { melodia: 'sanfona' },
    },
    // lembrança da Vila Jacarandá (sol maior, a subdominante)
    D: { melodia: vilaJacaranda.secoes.D.melodia, contra: '-', baixo: '@1.....5.1...5...', acordes: vilaJacaranda.secoes.D.acordes, bateria: 'c', inst: { harmonia: 'violao' } },
    E: {
      melodia: 'a5:3 d6:3 f#6:2 a6:3 f#6:3 d6:2 | b5:3 d6:3 f#6:2 b6:3 f#6:3 d6:2 | g5:3 b5:3 d6:2 g6:3 d6:3 b5:2 | a5:2 c#6 e6 a6 e6:8 | f#6:4 d6:2 a5:2 d6:4 f#6:4 | f#6:4 d6:2 b5:2 d6:4 f#6:4 | g6:4 e6:4 e6:4 c#6:4 | d6:12 r:4',
      contra: V8, baixo: '@1..1..5.1..5..8.', acordes: 'D | Bm | G | A | D | Bm | Em A | D', bateria: 'a',
      inst: { melodia: 'pulso25' },
    },
    F: {
      melodia: 'd6:8 b5:8 | a5:8 d6:8 | g5:4 b5:4 e6:8 | c#6:8 e6:8 | b5:4 d6:4 g6:8 | a6:8 e6:8 | f#6:16 | d6:12 r:4',
      contra: 'b4:16 | a4:16 | b4:16 | a4:16 | d5:16 | c#5:16 | a4:16 | f#4:12 r:4',
      baixo: '@1.......5.......', acordes: 'G | D/F# | Em | A | G | A | D | D', bateria: 's',
      estilo: { tipo: 'pad', oitava: 4 }, inst: { harmonia: 'cordas' },
    },
  },
  ordem: ['A', 'B', 'C', 'D', 'E', 'F'],
};
