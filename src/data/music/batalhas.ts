/** Músicas de batalha (com introdução tocada uma vez), vitórias e derrota. */
import type { Faixa } from './types';

const rep = (compasso: string, n: number): string => Array.from({ length: n }, () => compasso).join(' | ');
const V8 = rep('-', 8);

export const batalhaSelvagem: Faixa = {
  id: 'batalha-selvagem', titulo: 'Encontro na Grama Alta', bpm: 168, loop: true, voltaEm: 4, envio: 0.16,
  inst: { melodia: 'pulso25', contra: 'pulso12', baixo: 'tri', harmonia: 'pulso' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 1], passo: 1, oitava: 4 },
  vol: { contra: 0.45, harmonia: 0.32, baixo: 0.9 },
  bateria: {
    i: { chipBumbo: 'X...X...X...X...', chipHat: 'xxxxxxxxxxxxxxxx' },
    a: { chipBumbo: 'X..X..X.X..X..X.', chipCaixa: '....X.......X...', chipHat: 'x.xxx.xxx.xxx.xx', triF: '..x...x...x...x.' },
    v: { chipBumbo: 'X..X..X.X..X....', chipCaixa: '....X.......XXXX', chipHat: 'x.xxx.xxx.xx....' },
  },
  secoes: {
    intro: {
      melodia: 'a5:1 g#5 a5 c6 a5 g#5 a5 c6 e6 c6 e6 a6 e6 c6 e6 a6 | a6:1 e6 c6 a5 e6 c6 a5 e5 c6 a5 e5 c5 a5 e5 c5 a4 | bb4:1 d5 f5 bb5 d5 f5 bb5 d6 f5 bb5 d6 f6 bb5 d6 f6 bb6 | e6:2 r:1 e6:1 r:2 e6:2 g#6:2 b6:2 e6:4',
      contra: '-', baixo: '@1.1.1.1.1.1.1.1.', acordes: 'Am | Am | Bb | E7', bateria: 'i i i v',
      estilo: { tipo: 'stab', grade: 'x...x...x...x...', oitava: 4 },
    },
    A: {
      melodia: 'a5:4 e6:2 a5:2 c6:3 b5:3 a5:2 | e5:2 a5 c6 e6 d6:3 c6:3 a5:2 | f5:4 c6:2 f5:2 a5:3 g5:3 f5:2 | g5:2 b5 d6 g6 f6:3 d6:3 b5:2 | a5:4 e6:2 a5:2 c6:3 d6:3 e6:2 | a6:6 g6:2 e6:4 c6:4 | f6:2 e6 c6 a5 f5:2 a5 c6 f6 | e6:6 g#6:2 b6:4 e6:4',
      contra: 'c5:8 e5:8 | c5:8 a4:8 | a4:8 c5:8 | b4:8 d5:8 | c5:8 e5:8 | e5:8 c5:8 | c5:8 a4:8 | b4:8 g#4:8',
      baixo: '@1.1.8.1.1.1.8.5.', acordes: 'Am | Am | F | G | Am | Am | F | E', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'd6:3 f6:3 a6:2 g6:2 f6 e6 d6 | c6:3 e6:3 a6:2 e6:8 | b5:2 d6 e6 g#6 b6:4 g#6:4 | a6:2 e6 c6 e6 a5:8 | f6:3 d6:3 a5:2 d6:2 f6 a6 f6 | e6:3 c6:3 a5:2 c6:2 e6 a6 e6 | d#6:4 f#6:2 b5:2 d#6:4 f#6:4 | e6:2 r:2 e6:2 r:2 g#6:2 b6:2 d6:2 e6:2',
      contra: V8, baixo: '@1.1.8.1.1.1.8.5.', acordes: 'Dm | Am | E7 | Am | Dm | Am | B7 | E7', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'c6:8 a5:4 f5:4 | d6:8 b5:4 g5:4 | e6:6 g6:2 b6:8 | a6:8 e6:8 | a5:2 c6 f6:4 a6:2 f6 c6:4 | b5:2 d6 g6:4 b6:2 g6 d6:4 | e6:1 g#6 b6 g#6 e6 g#6 b6 g#6 e6:2 d6 b5 g#5 | e6:1 e6 r e6 e6 r e6 e6 r:2 e6:2 g#6:2 b6:2',
      contra: 'a4:2 c5 f5 c5 a4 c5 f5 c5 | b4:2 d5 g5 d5 b4 d5 g5 d5 | b4:2 e5 g5 e5 b4 e5 g5 e5 | c5:2 e5 a5 e5 c5 e5 a5 e5 | - | - | - | -',
      baixo: '@1.1.1.1.1.1.1.1.', acordes: 'F | G | Em | Am | F | G | E7 | E7', bateria: 'a a a a a a a v',
      estilo: { tipo: 'pad', oitava: 4 },
    },
  },
  ordem: ['intro', 'A', 'B', 'C'],
};

export const batalhaTreinador: Faixa = {
  id: 'batalha-treinador', titulo: 'Desafio de Treinador', bpm: 160, loop: true, voltaEm: 4, envio: 0.16,
  inst: { melodia: 'pulso25', contra: 'pulso12', baixo: 'tri', harmonia: 'viola' },
  estilo: { tipo: 'ritmo', grade: 'x..x..x.x..x..x.', oitava: 4 },
  vol: { contra: 0.45, harmonia: 0.45, baixo: 0.9 },
  bateria: {
    i: { zabumba: 'X.......X.......', chipCaixa: '....x.......x.xx' },
    a: { zabumba: 'X..x..x.X..x..x.', chipCaixa: '....X.......X...', chipHat: 'x.x.x.x.x.x.x.x.', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.' },
    v: { zabumba: 'X..x..x.X..x....', chipCaixa: '....X.....x.XXXX', triA: '..x...x...x.....' },
  },
  secoes: {
    intro: {
      melodia: 'e5:2 e5:1 e5:1 r:2 e5:2 g5:2 e5:2 b5:4 | e5:2 e5:1 e5:1 r:2 e5:2 g5:2 b5:2 e6:4 | d5:2 d5:1 d5:1 r:2 d5:2 f#5:2 a5:2 d6:4 | b5:1 d#6 f#6 b6 f#6 d#6 b5 d#6 f#6:2 a6:2 b6:4',
      contra: '-', baixo: '@1.11...1.1.5...', acordes: 'Em | Em | D | B7', bateria: 'i i i v',
    },
    A: {
      melodia: 'b5:3 e6:3 g6:2 f#6:2 e6 d6 b5 | c6:3 e6:3 g6:2 e6:8 | a5:3 d6:3 f#6:2 e6:2 d6 c6 a5 | b5:6 g5:2 e5:8 | b5:3 e6:3 g6:2 a6:2 g6 f#6 e6 | g6:3 e6:3 c6:2 e6:4 g6:4 | f#6:2 d6 a5 d6 f#6:2 a6 f#6 d6 | d#6:4 f#6:4 b6:4 r:4',
      contra: V8, baixo: '@1.1.5.1.1.1.5.8.', acordes: 'Em | C | D | Em | Em | C | D | B7', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'd6:4 b5:2 g5:2 b5:4 d6:4 | f#6:4 d6:2 a5:2 d6:4 f#6:4 | e6:2 c6 a5 c6 e6:4 a6:4 | g6:6 f#6:2 e6:8 | g6:2 d6 b5 d6 g6:2 b6 g6:4 | a6:2 f#6 d6 f#6 a6:2 f#6 d6:4 | e6:2 g6 c6 e6 g5:2 c6 e6 g6 | f#6:2 d#6 b5 d#6 f#6:2 a6 b6:4',
      contra: 'b4:8 d5:8 | a4:8 d5:8 | c5:8 e5:8 | b4:8 e5:8 | b4:8 d5:8 | a4:8 f#5:8 | g4:8 c5:8 | f#4:8 b4:8',
      baixo: '@1.1.5.1.1.1.5.8.', acordes: 'G | D | Am | Em | G | D | C | B7', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'a5:2 c6 e6:4 a6:6 e6:2 | b5:2 d#6 f#6:4 a6:6 f#6:2 | g6:3 e6:3 b5:2 e6:3 g6:3 b6:2 | e6:8 r:2 b5:2 e6:2 g6:2 | a6:2 e6 c6 e6 a5:2 c6 e6 a6 | b6:2 f#6 d#6 f#6 b5:2 d#6 f#6 a6 | g6:4 e6:4 b5:4 e6:4 | d6:2 f#6 a6:4 b5:2 d#6 f#6:4',
      contra: V8, baixo: '@1.1.1.1.5.5.1.a.', acordes: 'Am | B7 | Em | Em | Am | B7 | Em | D B7', bateria: 'a a a a a a a v',
      inst: { melodia: 'sanfona' },
    },
  },
  ordem: ['intro', 'A', 'B', 'C'],
};

const BERIMBAU_RIVAL = 'd4:2 d4:1 d4:1 e4:2 d4:2 d4:2 d4:1 d4:1 e4:2 e4:2';

export const batalhaRival: Faixa = {
  id: 'batalha-rival', titulo: 'Tainá Quer Revanche', bpm: 172, loop: true, voltaEm: 4, envio: 0.16,
  inst: { melodia: 'pulso25', contra: 'berimbau', baixo: 'tri', harmonia: 'pulso12' },
  estilo: { tipo: 'arpejo', padrao: [0, 2, 1, 2], passo: 1, oitava: 4 },
  vol: { contra: 0.7, harmonia: 0.3, baixo: 0.9 },
  bateria: {
    i: { atabaque: 'x..x..x.x..x..x.', caxixi: 'x.x.x.x.x.x.x.x.' },
    a: { chipBumbo: 'X.....X.X.....X.', chipCaixa: '....X.......X...', atabaque: '..x..x.x..x..x.x', caxixi: 'x.x.x.x.x.x.x.x.', pandeiro: '....x.......x...' },
    v: { chipBumbo: 'X.....X.X.......', chipCaixa: '....X.....X.XXXX', atabaque: '..x..x.x..x.....' },
  },
  secoes: {
    intro: {
      melodia: 'd5:2 r:1 d5 e5:2 r:1 e5 f5:2 r:1 f5 a5:2 r:2 | d6:2 r:1 d6 c6:2 r:1 c6 a5:2 r:1 a5 f5:2 r:2 | eb5:1 g5 bb5 eb6 g5 bb5 eb6 g6 bb5 eb6 g6 bb6 g6 eb6 bb5 g5 | a5:2 c#6 e6 g6 a6:4 r:4',
      contra: rep(BERIMBAU_RIVAL, 4), baixo: '@1.......1.......', acordes: 'Dm | Dm | Eb | A7', bateria: 'i i i v',
      estilo: { tipo: 'stab', grade: 'x.......x.......', oitava: 4 },
    },
    A: {
      melodia: 'd6:2 a5:1 d6:1 f6:4 e6:2 d6:2 a5:4 | d6:2 bb5:1 d6:1 f6:4 g6:2 f6:2 d6:4 | e6:2 c6:1 e6:1 g6:4 f6:2 e6:2 c6:4 | d6:3 f6:3 a6:2 d6:8 | d6:2 a5:1 d6:1 f6:4 a6:2 g6:2 f6:4 | bb6:2 f6:1 d6:1 bb5:4 d6:2 f6:2 bb6:4 | g6:2 e6 c6 e6 g6:2 c6 e6 g6 | a6:4 e6:2 c#6:2 a5:4 e6:4',
      contra: rep(BERIMBAU_RIVAL, 8), baixo: '@1.8.1.8.1.8.1.5.', acordes: 'Dm | Bb | C | Dm | Dm | Bb | C | A7', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'bb5:3 d6:3 g6:2 f6:2 d6 bb5 g5 | a5:3 d6:3 f6:2 d6:8 | c#6:2 e6 g6 e6 c#6:2 a5 e6:4 | f6:2 e6 d6 a5 d6:8 | g6:3 bb6:3 g6:2 d6:2 bb5 d6 g6 | f6:3 a6:3 f6:2 d6:2 a5 d6 f6 | e6:2 g#6 b6:4 g#6:2 e6 b5:4 | a5:1 c#6 e6 a6 e6 c#6 a5 c#6 e6:2 g6:2 a6:4',
      contra: rep(BERIMBAU_RIVAL, 8), baixo: '@1.8.1.8.1.8.1.5.', acordes: 'Gm | Dm | A7 | Dm | Gm | Dm | E7 | A7', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'a6:6 f6:2 c6:8 | g6:6 e6:2 c6:8 | f6:4 d6:4 a5:6 d6:2 | e6:8 c6:4 a5:4 | d6:2 f6 bb6:4 f6:2 d6 bb5:4 | c6:2 f6 a6:4 f6:2 c6 a5:4 | bb5:2 d6 g6:4 a6:2 g6 e6:4 | d6:8 r:2 a5:2 d6:2 f6:2',
      contra: V8, baixo: '@1.1.1.1.5.5.1.a.', acordes: 'F | C | Dm | Am | Bb | F | Gm A7 | Dm', bateria: 'a a a a a a a v',
      inst: { melodia: 'flauta' },
    },
  },
  ordem: ['intro', 'A', 'B', 'C'],
};

export const batalhaLider: Faixa = {
  id: 'batalha-lider', titulo: 'Pela Insígnia!', bpm: 152, loop: true, voltaEm: 4, envio: 0.2,
  inst: { melodia: 'pulso25', contra: 'metais', baixo: 'baixo', harmonia: 'pulso12' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 3, 2, 1], passo: 1, oitava: 4 },
  vol: { contra: 0.55, harmonia: 0.3, baixo: 0.8, bateria: 0.75 },
  bateria: {
    i: { alfaia: 'X.......X.......', caixa: 'o.ooo.ooo.ooo.oo', prato: 'x...............' },
    a: { alfaia: 'X..X..x.X.xx..x.', chipCaixa: '....X.......X...', chipHat: 'x.xxx.xxx.xxx.xx', gongue: 'X..x.xx.X..x.xx.' },
    v: { alfaia: 'X..X..X..X..X.XX', chipCaixa: '....X.....x.XXXX', gongue: 'X..X..X..X..X...' },
  },
  secoes: {
    intro: {
      melodia: 'c5:4 g5:4 c6:4 eb6:4 | ab5:4 c6:4 eb6:4 ab6:4 | bb5:4 d6:4 f6:4 bb6:4 | g6:2 g6:1 g6:1 r:2 g6:2 b6:2 d6:2 g6:4',
      contra: '-', baixo: '@1...............', acordes: 'Cm | Ab | Bb | G', bateria: 'i i i v',
      estilo: { tipo: 'pad', oitava: 4 }, inst: { harmonia: 'cordas' },
    },
    A: {
      melodia: 'c6:6 g5:2 c6:2 d6:2 eb6:4 | d6:3 c6:3 g5:2 c6:8 | c6:6 ab5:2 c6:2 d6:2 eb6:4 | f6:3 d6:3 bb5:2 d6:8 | eb6:6 c6:2 eb6:2 f6:2 g6:4 | f6:3 eb6:3 c6:2 g5:8 | ab5:2 c6 eb6 ab6 g6:2 eb6 c6:4 | d6:4 b5:4 g5:2 b5 d6 g6',
      contra: 'g4:8 c5:8 | g4:8 eb5:8 | ab4:8 c5:8 | bb4:8 d5:8 | g4:8 c5:8 | g4:8 eb5:8 | ab4:8 eb5:8 | b4:8 d5:8',
      baixo: '@1.1.8.1.1.1.5.8.', acordes: 'Cm | Cm | Ab | Bb | Cm | Cm | Ab | G', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'g6:4 eb6:2 bb5:2 eb6:4 g6:4 | f6:4 d6:2 bb5:2 d6:4 f6:4 | eb6:2 d6 c6 g5 c6:4 eb6:4 | d6:6 bb5:2 g5:8 | c6:2 eb6 ab6:4 g6:2 eb6 c6:4 | bb5:2 eb6 g6:4 f6:2 eb6 bb5:4 | ab5:2 c6 f6:4 eb6:2 c6 ab5:4 | g5:2 b5 d6 g6 b6:4 g6:4',
      contra: V8, baixo: '@1.1.8.1.1.1.5.8.', acordes: 'Eb | Bb | Cm | Gm | Ab | Eb | Fm | G', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'f6:3 ab6:3 f6:2 c6:3 f6:3 ab6:2 | g6:3 eb6:3 c6:2 eb6:8 | d6:2 g6 b6:4 g6:2 d6 b5:4 | c6:2 eb6 g6 eb6 c6:8 | ab6:3 f6:3 c6:2 f6:3 ab6:3 c6:2 | g6:2 eb6 c6 g5 c6:4 eb6:4 | f#6:4 d6:2 a5:2 d6:4 f#6:4 | g6:2 r:2 g6:2 r:2 b5:2 d6:2 g6:2 b6:2',
      contra: V8, baixo: '@1.1.1.1.5.5.1.a.', acordes: 'Fm | Cm | G | Cm | Fm | Cm | D7 | G', bateria: 'a a a a a a a v',
    },
    D: {
      melodia: 'c6:8 eb6:4 ab6:4 | d6:8 f6:4 bb6:4 | g6:6 f6:2 eb6:8 | eb6:6 d6:2 c6:8 | ab6:2 g6 eb6 c6 eb6:4 ab5:4 | bb6:2 ab6 f6 d6 f6:4 bb5:4 | g6:1 d6 b5 d6 g6 d6 b5 d6 g6:2 b6 d6 g6 | g6:4 r:4 g5:2 b5 d6 g6',
      contra: 'ab4:8 c5:8 | bb4:8 d5:8 | bb4:8 eb5:8 | g4:8 c5:8 | ab4:8 c5:8 | bb4:8 f5:8 | b4:8 d5:8 | b4:4 r:12',
      baixo: '@1.1.8.1.1.1.5.8.', acordes: 'Ab | Bb | Eb | Cm | Ab | Bb | G | G', bateria: 'a a a a a a a v',
    },
  },
  ordem: ['intro', 'A', 'B', 'C', 'D'],
};

const RIFF_G = 'g2:2 g2:1 g2:1 bb2:2 g2:2 c#3:2 d3:2 g2:4';
const RIFF_EB = 'eb2:2 eb2:1 eb2:1 g2:2 eb2:2 a2:2 bb2:2 eb2:4';
const RIFF_D = 'd2:2 d2:1 d2:1 f#2:2 d2:2 a2:2 c3:2 d3:4';

export const batalhaCartel: Faixa = {
  id: 'batalha-cartel', titulo: 'Cartel Ferrugem Ataca', bpm: 148, loop: true, voltaEm: 2, envio: 0.18,
  inst: { melodia: 'lead', contra: 'pulso12', baixo: 'baixoDist', harmonia: 'pulso' },
  estilo: { tipo: 'stab', grade: '..x..x....x..x..', oitava: 4 },
  vol: { melodia: 1, harmonia: 0.4, baixo: 0.85, bateria: 0.75 },
  bateria: {
    i: { bumbo: 'X.......X.......', metal: '....x.......x...' },
    a: { bumbo: 'X..x..X...x.X...', caixa: '....X.......X...', chimbal: 'x.x.x.x.x.x.x.x.', metal: '..........x.....' },
    b: { bumbo: 'X.X...X.X.X...X.', caixa: '....X.......X..x', chimbal: 'xxxxxxxxxxxxxxxx', bigorna: 'x...............' },
    v: { bumbo: 'X..x..X...x.....', caixa: '....X.....X.XXXX', metal: 'x.......x.......' },
  },
  secoes: {
    intro: {
      melodia: '- | -', contra: '-', baixo: `${RIFF_G} | ${RIFF_G}`, acordes: 'Gm | Gm', bateria: 'i v',
    },
    A: {
      melodia: 'r:4 g5:2 bb5:2 d6:3 c#6:3 d6:2 | g6:6 f6:2 d6:4 bb5:4 | r:4 eb5:2 g5:2 bb5:3 a5:3 bb5:2 | a5:2 f#5 d5 f#5 a5:4 d6:4 | r:4 g5:2 bb5:2 d6:3 c#6:3 d6:2 | bb6:6 a6:2 g6:4 d6:4 | g6:2 eb6 bb5 eb6 g6:2 bb6 g6:4 | f#6:4 d6:4 a5:2 c6 d6 f#6',
      contra: V8, baixo: `${RIFF_G} | ${RIFF_G} | ${RIFF_EB} | ${RIFF_D} | ${RIFF_G} | ${RIFF_G} | ${RIFF_EB} | ${RIFF_D}`,
      acordes: 'Gm | Gm | Eb | D | Gm | Gm | Eb | D', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'c6:3 eb6:3 g6:2 f6:2 eb6 d6 c6 | bb5:3 d6:3 g6:2 d6:8 | c6:2 a5 f#5 a5 c6:2 d6 f#6:4 | g6:2 d6 bb5 d6 g5:8 | eb6:3 g6:3 c6:2 eb6:2 g6 eb6 c6 | d6:3 g6:3 bb6:2 g6:8 | c#6:2 e6 g6:4 e6:2 c#6 a5:4 | d6:2 r:2 d6:2 r:2 f#6:2 a6:2 c6:2 d6:2',
      contra: V8, baixo: '@1.1.1.1.5.5.1.a.', acordes: 'Cm | Gm | D7 | Gm | Cm | Gm | A7 | D7', bateria: 'b b b b b b b v',
    },
    C: {
      melodia: 'bb5:8 g5:4 eb5:4 | c6:8 a5:4 f5:4 | d6:6 c#6:2 d6:8 | g5:2 bb5 d6 g6 c#6:4 d6:4 | g6:8 eb6:4 bb5:4 | a6:8 f6:4 c6:4 | f#6:2 d6 a5 d6 f#6:2 a6 f#6:4 | d6:1 d6 r d6 d6 r d6 d6 r:2 d6:2 f#6:2 a6:2',
      contra: 'g4:2 bb4 eb5 bb4 g4 bb4 eb5 bb4 | a4:2 c5 f5 c5 a4 c5 f5 c5 | g4:2 bb4 d5 bb4 g4 bb4 d5 bb4 | g4:2 bb4 d5 bb4 g4 bb4 d5 bb4 | - | - | - | -',
      baixo: '@1.1.1.1.1.1.1.1.', acordes: 'Eb | F | Gm | Gm | Eb | F | D | D', bateria: 'a a a a b b b v',
    },
  },
  ordem: ['intro', 'A', 'B', 'C'],
};

export const batalhaConselho: Faixa = {
  id: 'batalha-conselho', titulo: 'Conselho dos Guardiões', bpm: 164, loop: true, voltaEm: 4, envio: 0.24,
  inst: { melodia: 'pulso25', contra: 'metais', baixo: 'baixo', harmonia: 'cordas' },
  estilo: { tipo: 'ritmo', grade: 'x...x...x...x...', oitava: 4 },
  vol: { contra: 0.55, harmonia: 0.55, baixo: 0.8, bateria: 0.75 },
  bateria: {
    i: { surdo: 'X.......X.......', caixa: 'o.ooo.ooo.ooo.oo' },
    a: { chipBumbo: 'X.....X.X..X....', chipCaixa: '....X.......X...', chipHat: 'x.xxx.xxx.xxx.xx', surdo: 'x.......x.......', triA: '..x...x...x...x.' },
    c: { surdo: 'X.......X.....x.', caixa: 'x.oox.oox.oox.oo', prato: 'x...............' },
    v: { chipBumbo: 'X.....X.X.......', chipCaixa: '....X.....X.XXXX', surdo: 'x.......x...x.x.' },
  },
  secoes: {
    intro: {
      melodia: 'e6:1 b5 g5 b5 e6 b5 g5 b5 e6 b5 g5 b5 e6 b5 g5 b5 | e6:1 c6 g5 c6 e6 c6 g5 c6 e6 c6 g5 c6 e6 c6 g5 c6 | e6:1 c6 a5 c6 e6 c6 a5 c6 e6 c6 a5 c6 e6 c6 a5 c6 | d#6:1 b5 f#5 b5 d#6 b5 f#5 b5 f#6:2 b6:2 r:4',
      contra: 'e4:16 | e4:16 | e4:16 | f#4:8 b4:4 r:4', baixo: '@1...............', acordes: 'Em | C | Am | B', bateria: 'i i i v',
      estilo: { tipo: 'pad', oitava: 4 },
    },
    A: {
      melodia: 'e6:6 b5:2 e6:2 f#6:2 g6:4 | f#6:6 d6:2 a5:8 | e6:6 c6:2 e6:2 f#6:2 g6:4 | f#6:4 d#6:4 b5:8 | g6:6 e6:2 g6:2 a6:2 b6:4 | a6:6 f#6:2 d6:8 | g6:2 e6 c6 e6 g6:2 e6 c6:4 | b5:2 d#6 f#6 b6 a6:2 f#6 d#6:4',
      contra: V8, baixo: '@1.1.8.1.1.1.5.8.', acordes: 'Em | D | C | B | Em | D | C | B', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'a5:2 c6 e6:4 a6:2 g6 e6:4 | g6:2 e6 b5:4 e6:2 g6 b6:4 | a6:2 f#6 d#6 b5 d#6:4 f#6:4 | e6:8 r:2 b5:2 e6:2 g6:2 | a6:3 e6:3 c6:2 e6:3 a6:3 c6:2 | b6:3 g6:3 e6:2 g6:3 b6:3 e6:2 | c6:2 e6 g6 e6 c6:2 e6 g6:4 | f#6:2 d#6 b5 d#6 f#6:2 a6 b6:4',
      contra: V8, baixo: '@1.1.8.1.1.1.5.8.', acordes: 'Am | Em | B7 | Em | Am | Em | C | B7', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'd6:8 b5:4 g5:4 | f#6:8 d6:4 a5:4 | g6:6 f#6:2 e6:8 | f#6:6 d6:2 b5:8 | e6:4 g6:4 c6:6 e6:2 | d6:4 g6:4 b6:8 | a6:2 g6 e6 c6 a5:4 c6:4 | b5:4 d#6:4 f#6:4 b6:4',
      contra: 'b4:8 d5:8 | a4:8 d5:8 | b4:8 e5:8 | b4:8 d5:8 | c5:8 e5:8 | b4:8 d5:8 | c5:8 e5:8 | d#5:8 f#5:8',
      baixo: '@1.....1.5...1...', acordes: 'G | D | Em | Bm | C | G | Am | B', bateria: 'c c c c c c c v',
      estilo: { tipo: 'pad', oitava: 4 },
    },
    D: {
      melodia: 'e6:2 r:1 e6 g6:2 r:1 g6 b6:2 r:1 b6 g6:2 e6:2 | b5:2 r:1 b5 e6:2 r:1 e6 g6:2 r:1 g6 e6:2 b5:2 | c6:2 r:1 c6 e6:2 r:1 e6 g6:2 r:1 g6 e6:2 c6:2 | d6:2 f#6 a6:4 f#6:2 d6 a5:4 | e6:2 r:1 e6 g6:2 r:1 g6 b6:2 r:1 b6 e6:2 g6:2 | b6:6 g6:2 e6:8 | c6:2 e6 g6:4 d6:2 f#6 a6:4 | e6:8 r:8',
      contra: V8, baixo: '@1.1.8.1.1.1.5.8.', acordes: 'Em | Em | C | D | Em | Em | C D | Em', bateria: 'a a a a a a a v',
    },
  },
  ordem: ['intro', 'A', 'B', 'C', 'D'],
};

const BERIMBAU_LENDA = 'd3:3 d3:3 e3:2 d3:3 d3:3 e3:2';

export const batalhaLendario: Faixa = {
  id: 'batalha-lendario', titulo: 'Diante da Lenda', bpm: 138, loop: true, voltaEm: 4, envio: 0.34,
  inst: { melodia: 'lead', contra: 'berimbau', baixo: 'baixoSub', harmonia: 'cordas' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 1, contra: 0.8, harmonia: 0.6, baixo: 0.9, bateria: 0.75 },
  bateria: {
    i: { caxixi: 'x.x.x.x.x.x.x.x.', alfaia: 'X...............' },
    j: { caxixi: 'x.x.x.x.x.x.x.x.', alfaia: 'X..X..X.X..X..X.', atabaque: '..x..x.x..x..xxx' },
    a: { alfaia: 'X..X..X.X..X..X.', atabaque: '..x..x.x..x..x.x', caxixi: 'x.x.x.x.x.x.x.x.', chipCaixa: '....x.......x...' },
    c: { alfaia: 'X..X..X.X..X..X.', atabaque: '..x..x.x..x..x.x', caxixi: 'xxxxxxxxxxxxxxxx', chipCaixa: '....X.......X...', prato: 'x...............' },
    v: { alfaia: 'X..X..X..X..X.XX', atabaque: 'x.xx.xx.xxxxxxxx' },
  },
  secoes: {
    intro: {
      melodia: '- | - | r:8 d5:8 | eb5:8 a5:8', contra: rep(BERIMBAU_LENDA, 4), baixo: '@1...............', acordes: 'D5 | D5 | D5 | D5', bateria: 'i i j v',
    },
    A: {
      melodia: 'd5:8 a5:6 g5:2 | f5:4 eb5:2 d5:2 a4:8 | eb5:8 bb5:6 a5:2 | g5:4 f5:2 eb5:2 d5:8 | d5:4 a5:4 d6:6 c6:2 | a5:4 g5:2 f5:2 d5:8 | eb6:6 d6:2 bb5:4 g5:4 | a5:8 c#6:4 e6:4',
      contra: rep(BERIMBAU_LENDA, 8), baixo: '@1.....1.1.......', acordes: 'Dm | Dm | Eb | Dm | Dm | Dm | Eb | A', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'g5:2 bb5 d6:4 g6:6 f6:2 | f6:4 d6:4 a5:8 | g6:2 eb6 bb5:4 eb6:6 g6:2 | e6:4 c#6:4 a5:8 | bb5:2 d6 g6:4 bb6:6 a6:2 | a6:4 f6:4 d6:8 | eb6:4 g6:4 e6:4 c#6:4 | d6:12 r:4',
      contra: rep(BERIMBAU_LENDA, 8), baixo: '@1..1..1.1..1..5.', acordes: 'Gm | Dm | Eb | A | Gm | Dm | Eb A | Dm', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'd6:3 d6:3 f6:2 d6:3 bb5:3 d6:2 | e6:3 e6:3 g6:2 e6:3 c6:3 e6:2 | f6:3 f6:3 a6:2 g6:3 f6:3 e6:2 | d6:8 a5:8 | f6:3 f6:3 bb6:2 f6:3 d6:3 f6:2 | g6:3 g6:3 c6:2 e6:3 g6:3 e6:2 | a6:6 g6:2 e6:4 c#6:4 | a5:2 c#6 e6 a6 e6:2 c#6 a5:4',
      contra: V8, baixo: '@1..1..1.1..1..5.', acordes: 'Bb | C | Dm | Dm | Bb | C | A | A', bateria: 'c c c c c c c v',
      inst: { melodia: 'metais' },
    },
    D: {
      melodia: 'a6:8 f6:4 d6:4 | c6:4 f6:4 a6:8 | g6:8 e6:4 c6:4 | d6:4 g6:4 bb6:8 | a6:2 f6 d6 f6 a5:2 d6 f6 a6 | c6:2 f6 a6 f6 c6:2 a5 f5:4 | e6:4 a6:4 g6:4 e6:4 | d6:8 r:8',
      contra: rep(BERIMBAU_LENDA, 8), baixo: '@1..1..1.1..1..5.', acordes: 'Dm | F | C | Gm | Dm | F | A | Dm', bateria: 'c c c c c c c v',
    },
  },
  ordem: ['intro', 'A', 'B', 'C', 'D'],
};

export const vitoriaSelvagem: Faixa = {
  id: 'vitoria-selvagem', titulo: 'Vitória na Trilha', bpm: 140, loop: true, voltaEm: 2, envio: 0.22,
  inst: { melodia: 'pulso25', contra: 'pulso12', baixo: 'tri', harmonia: 'cavaquinho' },
  estilo: { tipo: 'ritmo', grade: 'x.xx.xx.x.xx.xx.', oitava: 4 },
  vol: { contra: 0.45, harmonia: 0.5 },
  bateria: {
    f: { chipCaixa: 'x..x..x.x..x..xx', prato: 'x...............' },
    a: { chipBumbo: 'X.....X.X.......', chipCaixa: '....X.......X...', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.' },
  },
  secoes: {
    fanfarra: {
      melodia: 'g5:3 c6:3 e6:2 g6:3 e6:3 c6:2 | d6:2 g6:2 b6:4 g6:8',
      contra: 'e5:3 g5:3 c6:2 e6:3 c6:3 g5:2 | b5:2 d6:2 g6:4 d6:8', baixo: '@1..1..1.1..1..1.', acordes: 'C | G', bateria: 'f',
    },
    A: {
      melodia: 'e6:3 c6:3 g5:2 c6:3 e6:3 g6:2 | f6:3 c6:3 a5:2 c6:8 | e6:3 c6:3 g5:2 c6:3 e6:3 g6:2 | d6:2 b5 g5 b5 d6:8 | e6:4 c6:2 a5:2 c6:4 e6:4 | f6:2 a6 f6 c6 a5:4 c6:4 | b5:2 d6 g6:4 f6:2 d6 b5:4 | c6:8 r:2 g5:2 c6:2 r:2',
      contra: V8, baixo: '@1...5...1...5.a.', acordes: 'C | F | C | G | Am | F | G | C', bateria: 'a',
    },
  },
  ordem: ['fanfarra', 'A'],
};

export const vitoriaTreinador: Faixa = {
  id: 'vitoria-treinador', titulo: 'Vitória de Treinador', bpm: 132, loop: true, voltaEm: 2, envio: 0.22,
  inst: { melodia: 'sanfona', contra: 'pulso12', baixo: 'tri', harmonia: 'violao' },
  estilo: { tipo: 'ritmo', grade: 'x..x..x.x..x..x.', oitava: 4 },
  vol: { contra: 0.45, harmonia: 0.5 },
  bateria: {
    f: { zabumba: 'X..X..X.X..X..XX', prato: 'x...............' },
    a: { zabumba: 'X..x....X..x....', bacalhau: '....x.x.....x.x.', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.' },
  },
  secoes: {
    fanfarra: {
      melodia: 'd6:2 d6:1 d6:1 g6:2 b6:2 d6:2 g6:2 b6:4 | a6:2 f#6 d6 c6 a5:2 c6 d6 f#6',
      contra: '-', baixo: '@1..1..1.1..1..1.', acordes: 'G | D7', bateria: 'f',
    },
    A: {
      melodia: 'b5:2 d6 g6:4 f#6:2 e6 d6:4 | c6:2 e6 g6:4 e6:2 c6 g5:4 | b5:2 d6 g6:4 a6:2 g6 d6:4 | a5:2 d6 f#6 a6 f#6:8 | g6:3 e6:3 b5:2 e6:3 g6:3 b6:2 | g6:3 e6:3 c6:2 e6:8 | f#6:2 e6 d6 c6 a5:2 d6 f#6:4 | g6:8 r:2 d6:2 g6:2 r:2',
      contra: V8, baixo: '@1..1..5.1..1..5.', acordes: 'G | C | G | D | Em | C | D | G', bateria: 'a',
    },
  },
  ordem: ['fanfarra', 'A'],
};

export const vitoriaLider: Faixa = {
  id: 'vitoria-lider', titulo: 'Insígnia Conquistada', bpm: 126, loop: true, voltaEm: 4, envio: 0.3,
  inst: { melodia: 'metais', contra: 'pulso25', baixo: 'tri', harmonia: 'viola' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 3, 2, 1, 2, 1], passo: 2, oitava: 4 },
  vol: { contra: 0.5, harmonia: 0.5 },
  bateria: {
    f: { surdo: 'X.......X.......', caixa: 'o.ooo.ooo.ooo.oo', prato: 'x...............' },
    v: { surdo: 'X...X...X...X...', caixa: 'x.xxx.xxxxxxXXXX' },
    a: { zabumba: 'X..x....X..x....', bacalhau: '......x.......x.', caixa: '....x.......x...', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.' },
  },
  secoes: {
    fanfarra: {
      melodia: 'd5:4 f#5:4 a5:4 d6:4 | g5:4 b5:4 d6:4 g6:4 | a5:2 c#6 e6 a6 c#6:2 e6 a6:4 | a6:8 r:2 a5:2 c#6:2 e6:2',
      contra: 'a4:4 d5:4 f#5:4 a5:4 | d5:4 g5:4 b5:4 d6:4 | e5:8 a5:8 | e6:8 r:8', baixo: '@1.......1.......', acordes: 'D | G | A | A', bateria: 'f f f v',
      estilo: { tipo: 'pad', oitava: 4 },
    },
    A: {
      melodia: 'f#6:6 d6:2 a5:4 d6:4 | e6:6 c#6:2 a5:8 | d6:6 b5:2 f#5:4 b5:4 | d6:4 b5:4 g5:8 | a5:2 d6 f#6:4 a6:6 f#6:2 | e6:2 c#6 a5:4 c#6:4 e6:4 | g6:2 b6 g6 d6 a6:2 e6 c#6 e6 | d6:12 r:4',
      contra: 'a5:8 f#5:8 | a5:8 e5:8 | f#5:8 d5:8 | g5:8 d5:8 | f#5:8 d6:8 | a5:8 c#6:8 | b5:8 c#6:8 | a5:12 r:4',
      baixo: '@1..1..5.1..1..5.', acordes: 'D | A/C# | Bm | G | D | A | G A | D', bateria: 'a',
    },
  },
  ordem: ['fanfarra', 'A'],
};

export const derrota: Faixa = {
  id: 'derrota', titulo: 'De Volta ao Posto', bpm: 72, loop: false, envio: 0.5,
  inst: { melodia: 'flauta', contra: 'kalimba', baixo: 'baixoSub', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { harmonia: 0.65 },
  bateria: { a: { surdo: 'x...............' } },
  secoes: {
    A: {
      melodia: 'e5:8 c5:8 | a4:8 c5:8 | d5:6 e5:2 f5:8 | e5:8 g#4:8 | a4:16 | r:16',
      contra: 'r:8 e5:4 a5:4 | r:8 f5:4 a5:4 | r:8 a5:4 d6:4 | r:8 b5:4 e6:4 | r:4 e5:4 a5:4 c6:4 | e6:16',
      baixo: '@1...............', acordes: 'Am | F | Dm | E | Am | Am', bateria: 'a a a a a -',
    },
  },
  ordem: ['A'],
};

/**
 * Batalha do visitante boreal (spec 6.5: a única com sonoridade de fora do Brasil). Dança nórdica em 3/4 (polska):
 * violino de cordas simpáticas em ré dórico com a sexta maior e toques de quarta aumentada, bordão de quintas
 * abertas nas cordas, flauta de salgueiro no contracanto, tambor de moldura grave e um canto de pastoreio na seção C.
 */
export const borealce: Faixa = {
  id: 'borealce', titulo: 'Galhada de Aurora', bpm: 152, passos: 12, loop: true, voltaEm: 4, envio: 0.36,
  inst: { melodia: 'hardanger', contra: 'flauta', baixo: 'baixoSub', harmonia: 'cordas' },
  estilo: { tipo: 'pad', oitava: 3 },
  vol: { melodia: 1, contra: 0.6, harmonia: 0.5, baixo: 0.85, bateria: 0.75 },
  bateria: {
    i: { surdo: 'X...........' },
    j: { surdo: 'X.......x...', tom: '....x.......' },
    a: { surdo: 'X.......X...', tom: '....x...x.x.', aro: '....x.......', ganza: 'x.x.x.x.x.x.' },
    s: { surdo: 'X...........', tom: '........x...', ganza: 'x...x...x...' },
    c: { surdo: 'X...x...X...', tom: '..x...x...xx', caixa: '....X.......', chimbal: 'x.x.x.x.x.x.', prato: 'x...........' },
    v: { surdo: 'X..X..X..X..', tom: 'x.xx.xx.xxxx' },
  },
  secoes: {
    intro: {
      melodia: '- | - | a4:6 d5:6 | e5:4 f5:4 g#5:4', contra: 'a5:12 | e5:12 | - | -', baixo: '@1...........', acordes: 'D5 | D5 | Dm | E', bateria: 'i i j v',
    },
    A: {
      melodia: 'd5:2 e5:2 f5:2 a5:2 d6:4 | c6:2 a5:2 g5:2 e5:2 c5:4 | d5:2 e5:2 f5:2 a5:2 b5:2 d6:2 | c6:3 b5:1 a5:4 e5:4 | f5:2 g5:2 a5:2 d6:2 e6:2 f6:2 | e6:2 d6:2 c6:2 a5:2 g5:4 | a5:2 b5:2 c6:2 b5:2 a5:2 g#5:2 | d6:8 a5:4',
      contra: 'a4:12 | g4:12 | a4:12 | a4:6 c5:6 | a4:12 | g4:12 | b4:6 g#4:6 | a4:12',
      baixo: '@1.....5.....', acordes: 'Dm | C | Dm6 | Am | Dm | C | E | Dm', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'a5:2 d6:2 f6:2 e6:2 d6:2 a5:2 | g#5:2 a5:2 b5:2 d6:2 e6:2 b5:2 | a5:2 c6:2 e6:2 a6:2 g6:2 e6:2 | f6:3 e6:1 d6:4 a5:4 | bb5:2 d6:2 f6:2 bb6:4 a6:2 | g6:2 f6:2 e6:2 c6:2 e6:4 | f6:2 e6:2 d6:2 c#6:2 a5:2 e6:2 | d6:6 a5:3 d6:3',
      contra: 'd5:12 | b4:12 | c5:12 | a4:12 | d5:12 | e5:12 | c#5:12 | d5:12',
      baixo: '@1.....5.....', acordes: 'Dm | E | Am | Dm | Bb | C | A | Dm', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'a6:8 g6:2 a6:2 | d6:12 | c6:2 d6:2 e6:8 | g5:12 | a6:8 b6:2 a6:2 | f6:6 e6:6 | d6:4 e6:4 g#6:4 | a6:12',
      contra: 'd5:2 a5:2 d6:2 a5:2 f5:2 a5:2 | d5:2 a5:2 d6:2 a5:2 f5:2 a5:2 | c5:2 g5:2 c6:2 g5:2 e5:2 g5:2 | b4:2 d5:2 g5:2 d5:2 b4:2 d5:2 | d5:2 a5:2 b5:2 a5:2 f5:2 a5:2 | f5:2 a5:2 c6:2 a5:2 f5:2 a5:2 | e5:2 g#5:2 b5:2 g#5:2 e5:2 b4:2 | a4:2 c#5:2 e5:2 a5:2 e5:2 c#5:2',
      baixo: '@1...........', acordes: 'Dm | Dm | C | G | Dm6 | F | E | A', bateria: 's s s s s s s v',
      inst: { melodia: 'flauta', contra: 'hardanger' },
    },
    D: {
      melodia: 'd6:1 e6:1 f6:1 g6:1 a6:2 f6:2 d6:2 a5:2 | c6:1 d6:1 e6:1 f6:1 g6:2 e6:2 c6:2 g5:2 | bb5:1 c6:1 d6:1 e6:1 f6:2 d6:2 bb5:2 f5:2 | a5:2 c#6:2 e6:2 a6:6 | d6:1 e6:1 f6:1 g6:1 a6:2 b6:2 a6:2 f6:2 | g6:2 e6:2 c6:2 e6:2 g6:4 | f6:2 e6:2 d6:2 e6:2 g#6:2 b6:2 | a6:6 a5:6',
      contra: 'a5:12 | g5:12 | f5:12 | e5:12 | f5:12 | e5:12 | g#5:12 | a5:12',
      baixo: '@1.....5.....', acordes: 'Dm | C | Bb | A | Dm6 | C | E | A', bateria: 'c c c c c c c v',
    },
  },
  ordem: ['intro', 'A', 'B', 'C', 'D'],
};
