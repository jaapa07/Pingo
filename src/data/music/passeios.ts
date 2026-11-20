/** Músicas do pós-Liga no Vale do Buriti-Alto: a Gincana (festa do interior) e o Parque Safári (campo tranquilo). */
import type { Faixa } from './types';

const V8 = '- | - | - | - | - | - | - | -';

/** Festa de interior em compasso de marcha de quadrilha: sanfona, viola no ritmo, zabumba, triângulo e bate-pé. */
export const gincana: Faixa = {
  id: 'gincana', titulo: 'Festa no Buriti-Alto (Gincana)', bpm: 136, loop: true, envio: 0.2,
  inst: { melodia: 'sanfona', contra: 'pulso12', baixo: 'tri', harmonia: 'viola' },
  estilo: { tipo: 'ritmo', grade: 'x...x.x.x...x.x.', oitava: 4 },
  vol: { melodia: 1, contra: 0.5, harmonia: 0.45, bateria: 0.8 },
  bateria: {
    a: { zabumba: 'X..x..x.X..x..x.', triF: 'x.xxx.xxx.xxx.xx', triA: '..x...x...x...x.', pandeiro: '....x.......x...' },
    c: { zabumba: 'X...X...X...X...', palmas: '..x...x...x...x.', sapato: 'x.x.x.x.x.x.x.x.', triA: '..x...x...x...x.' },
    v: { zabumba: 'X.X.X.X.X..XX.X.', bacalhau: 'x.x.x.x.x.x.x.x.', prato: '............x...' },
  },
  secoes: {
    A: {
      melodia: 'd5:2 g5:2 g5:2 a5:2 b5:4 g5:4 | c6:2 b5:2 a5:2 g5:2 a5:8 | d5:2 a5:2 a5:2 b5:2 c6:4 a5:4 | b5:2 a5:2 g5:2 f#5:2 g5:8 | b5:2 d6:2 d6:2 e6:2 d6:4 b5:4 | c6:2 e6:2 e6:2 d6:2 c6:4 a5:4 | b5:2 g5:2 a5:2 b5:2 a5:2 f#5:2 d5:4 | g5:4 b5:2 d6:2 g6:8',
      contra: V8, baixo: '@1...5...1...5...', acordes: 'G | D7 | D7 | G | G | C | D7 | G', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'e6:3 d6:1 b5:4 e6:3 d6:1 b5:4 | a5:2 b5:2 c6:2 b5:2 a5:8 | d6:3 c6:1 a5:4 d6:3 c6:1 a5:4 | g5:2 a5:2 b5:2 a5:2 g5:8 | e6:3 d6:1 b5:4 g6:3 f#6:1 e6:4 | c6:2 d6:2 e6:2 g6:2 e6:8 | d6:2 e6:2 f#6:2 a6:2 f#6:2 d6:2 c6:4 | b5:4 g5:4 g5:2 a5:2 b5:2 d6:2',
      contra: 'b4:8 g4:8 | c5:8 e5:8 | c5:8 f#4:8 | b4:8 d5:8 | b4:8 e5:8 | e5:8 g5:8 | f#5:8 c5:8 | d5:16',
      baixo: '@1...5...1...5...', acordes: 'Em | Am | D7 | G | Em | C | D7 | G', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'g6:2 r:2 g6:2 r:2 f#6:2 e6:2 d6:4 | e6:2 r:2 e6:2 r:2 d6:2 c6:2 b5:4 | c6:2 r:2 c6:2 r:2 b5:2 a5:2 g5:4 | a5:2 b5:2 c6:2 d6:2 e6:2 f#6:2 a6:4 | g6:2 r:2 g6:2 r:2 f#6:2 e6:2 d6:4 | e6:2 g6:2 e6:2 c6:2 e6:8 | d6:2 r:2 a5:2 r:2 c6:2 b5:2 a5:4 | g5:4 d5:4 g5:4 r:4',
      contra: 'r:2 d6:1 d6:1 r:2 d6:1 d6:1 r:8 | r:2 c6:1 c6:1 r:2 c6:1 c6:1 r:8 | r:2 a5:1 a5:1 r:2 a5:1 a5:1 r:8 | - | r:2 d6:1 d6:1 r:2 d6:1 d6:1 r:8 | - | r:2 f#5:1 f#5:1 r:2 f#5:1 f#5:1 r:8 | -',
      baixo: '@1...5...1...5...', acordes: 'G | C | Am | D7 | G | C | D7 | G', bateria: 'c c c c c c c v',
    },
  },
  ordem: ['A', 'B', 'A', 'C'],
};

/** Campo aberto ao entardecer: flauta, violão dedilhado, cordas e um chocalho baixinho. */
export const safari: Faixa = {
  id: 'safari', titulo: 'Capim, Vento e Cuia (Safári)', bpm: 88, loop: true, envio: 0.3,
  inst: { melodia: 'flauta', contra: 'cordas', baixo: 'baixo', harmonia: 'violao' },
  estilo: { tipo: 'arpejo', padrao: [0, 2, 1, 2, 3, 2, 1, 2], passo: 2, oitava: 4 },
  vol: { melodia: 1, contra: 0.35, harmonia: 0.55, baixo: 0.7, bateria: 0.45 },
  bateria: {
    a: { ganza: 'o.x.o.x.o.x.o.x.', bumbo: 'x.......x.......', aro: '....o.......o...' },
    g: { ganza: 'o.x.o.x.o.x.o.x.', bumbo: 'x.......x.......', aro: '....o.......o...', gota: '..........x.....' },
    s: { ganza: 'o...o...o...o...' },
  },
  secoes: {
    A: {
      melodia: 'c5:4 f5:4 a5:6 g5:2 | f5:4 e5:4 c5:8 | d5:4 f5:4 bb5:6 a5:2 | g5:4 f5:2 e5:2 f5:8 | a5:4 c6:4 d6:6 c6:2 | bb5:4 a5:2 g5:2 a5:8 | g5:4 a5:2 bb5:2 c6:4 e5:4 | f5:12 r:4',
      contra: V8, baixo: '@1.......5.......', acordes: 'F | C/E | Bb | F | Dm | Bb | C | F', bateria: 's a a g a a a g',
    },
    B: {
      melodia: 'a5:3 bb5:1 c6:4 f6:8 | e6:4 d6:4 c6:8 | d6:3 c6:1 bb5:4 g5:8 | a5:4 g5:4 f5:8 | bb5:4 a5:4 g5:4 f5:4 | a5:4 g5:4 f5:4 e5:4 | d5:4 e5:4 g5:4 c6:4 | c6:16',
      contra: 'f5:8 c5:8 | e5:8 c5:8 | d5:8 bb4:8 | c5:16 | d5:8 c5:8 | c5:8 e5:8 | d5:8 e5:8 | e5:16',
      baixo: '@1.......5.......', acordes: 'F | Am | Gm | F | Bb | Am | Gm7 C | C7', bateria: 'a a a g a a a g',
    },
    C: {
      melodia: 'f6:4 e6:2 c6:2 a5:8 | g5:2 a5:2 bb5:2 c6:2 d6:8 | c6:4 a5:2 f5:2 g5:8 | e5:2 f5:2 g5:2 a5:2 bb5:4 g5:4 | a5:6 g5:2 f5:4 a5:4 | bb5:6 a5:2 g5:4 d6:4 | c6:4 bb5:2 a5:2 g5:4 e5:4 | f5:16',
      contra: 'a4:16 | bb4:16 | c5:16 | bb4:16 | a4:16 | bb4:16 | bb4:8 g4:8 | a4:16',
      baixo: '@1.......5.......', acordes: 'F | Bb | F/A | C7 | Dm | Gm | C7 | F', bateria: 'g a a a g a a s',
    },
  },
  ordem: ['A', 'B', 'C'],
};
