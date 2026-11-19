/** Temas de cidade: oito variações regionais brasileiras (forró, frevo, samba de roda, baião, maracatu, choro, catira e música gaúcha). */
import type { Faixa } from './types';

const V8 = '- | - | - | - | - | - | - | -';

export const cidadeForro: Faixa = {
  id: 'cidade-forro', titulo: 'Arraial em Festa (forró)', bpm: 128, loop: true, envio: 0.22,
  inst: { melodia: 'sanfona', contra: 'pulso12', baixo: 'tri', harmonia: 'violao' },
  estilo: { tipo: 'ritmo', grade: 'x..x..x.x..x..x.', oitava: 4 },
  vol: { melodia: 1, contra: 0.45, harmonia: 0.5 },
  bateria: {
    a: { zabumba: 'X..x....X..x....', bacalhau: '....x.x.....x.x.', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.' },
    b: { zabumba: 'X..x..x.X..x..x.', bacalhau: '....x.......x...', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.', pandeiro: '....x.......x...' },
    v: { zabumba: 'X..x..X..x..X.X.', bacalhau: '..x..x..x..x.x.x', triA: '..x...x...x...x.' },
  },
  secoes: {
    A: {
      melodia: 'a5:2 f#5:1 a5:1 d6:2 c6:2 b5:2 a5:2 f#5:2 a5:2 | g#5:2 a5 b5 a5 f#5:4 d5:4 | g5:2 e5:1 g5:1 c6:2 b5:2 a5:2 g5:2 e5:2 g5:2 | f#5:2 g#5 a5 f#5 d5:8 | a5:2 f#5:1 a5:1 d6:2 e6:2 f#6:2 e6:2 d6:2 c6:2 | b5:2 d6 g6 d6 b5:4 g5:4 | a5:2 c#6 e6 g6 f#6:2 e6 c#6 a5 | d6:8 r:2 a5:2 d6:2 r:2',
      contra: V8, baixo: '@1..1..5.1..1..5.', acordes: 'D | D | C | D | D | G | A7 | D', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'b5:3 d6:3 g6:2 f#6:2 e6 d6 b5 | a5:3 d6:3 f#6:2 e6:2 d6 c6 a5 | g5:2 a5 c#6 e6 g6:4 e6:4 | f#6:6 d6:2 a5:8 | g6:2 f#6 e6 d6 b5:2 d6 g5:4 | f#6:2 e6 d6 c6 a5:2 d6 f#5:4 | g#5:2 b5 d6 e6 g#6:4 e6:4 | a5:2 c#6 e6 a6 g6:4 e6:4',
      contra: V8, baixo: '@1..1..5.1..5..8.', acordes: 'G | D | A7 | D | G | D | E7 | A7', bateria: 'b b b b b b b v',
    },
    C: {
      melodia: 'f#5:4 b5:4 d6:6 c#6:2 | b5:6 g5:2 e5:8 | c#6:2 e6 g6:4 e6:2 c#6 a5:4 | f#5:2 a5 d6:4 a5:8 | b5:4 d6:4 f#6:6 e6:2 | e6:6 b5:2 g5:8 | g6:2 e6 c#6 a5 g5:2 a5 c#6:4 | d6:12 r:4',
      contra: 'd5:8 f#5:8 | e5:8 b4:8 | e5:8 c#5:8 | d5:8 f#5:8 | f#5:8 b4:8 | g5:8 e5:8 | e5:8 a4:8 | f#5:12 r:4',
      baixo: '@1..1..5.1..1..5.', acordes: 'Bm | Em | A7 | D | Bm | Em | A7 | D', bateria: 'a',
    },
    D: {
      melodia: 'd6:1 e6 f#6:2 a6:2 f#6:2 d6:2 f#6:2 a5:2 d6:2 | c6:1 d6 e6:2 g6:2 e6:2 c6:2 e6:2 g5:2 c6:2 | b5:2 d6 g6:4 d6:2 b5 g5:4 | a5:2 f#5 a5 d6 f#6:8 | d6:1 e6 f#6:2 a6:2 f#6:2 d6:2 f#6:2 a6:2 f#6:2 | e6:1 f#6 g6:2 e6:2 c6:2 g5:2 c6:2 e6:2 g6:2 | e6:2 c#6 a5 c#6 e6:2 g6 a6:4 | d6:8 a5:4 d5:4',
      contra: V8, baixo: '@1..1..5.1..5..8.', acordes: 'D | C | G | D | D | C | A7 | D', bateria: 'b b b b b b b v',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const cidadeFrevo: Faixa = {
  id: 'cidade-frevo', titulo: 'Ladeiras do Porto (frevo)', bpm: 144, loop: true, envio: 0.2,
  inst: { melodia: 'metais', contra: 'pulso25', baixo: 'tri', harmonia: 'cavaquinho' },
  estilo: { tipo: 'stab', grade: '..x...x...x...x.', oitava: 4 },
  vol: { melodia: 1, contra: 0.5, harmonia: 0.55, bateria: 0.7 },
  bateria: {
    a: { surdo: 'x...X...x...X...', caixa: 'x.oxx.oxx.oxx.ox', pandeiro: '..x...x...x...x.' },
    v: { surdo: 'x...X...x...X...', caixa: 'x.oxx.oxxxxxXxXx', pandeiro: '..x...x...x...x.', prato: '............x...' },
    c: { surdo: 'x.......x.......', caixa: 'o.ooo.ooo.ooo.oo', pandeiro: '..x...x...x...x.' },
  },
  secoes: {
    A: {
      melodia: 'r:2 c5:1 d5:1 f5:2 a5:2 c6:3 a5:1 f5:2 a5:2 | c6:2 d6:1 c6:1 a5:2 f5:2 a5:4 r:4 | r:2 d5:1 f5:1 g5:2 bb5:2 d6:3 bb5:1 g5:2 bb5:2 | e6:2 d6:1 c6:1 bb5:2 g5:2 e5:4 r:4 | r:2 g5:1 a5:1 bb5:2 d6:2 g6:3 f6:1 d6:2 bb5:2 | c6:2 e6:1 g6:1 bb6:2 a6:2 g6:2 e6:2 c6:2 bb5:2 | a5:3 c6:3 f6:2 a6:3 f6:3 c6:2 | f6:4 r:2 c6:2 f6:4 r:4',
      contra: '- | r:8 r:4 c5:2 f5:2 | - | r:8 r:4 c5:2 e5:2 | - | - | - | r:4 a5:2 r:2 r:4 c5:2 a4:2',
      baixo: '@1...5...1...5...', acordes: 'F | F | Gm | C7 | Gm | C7 | F | F', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'd6:2 d6:1 d6:1 f6:2 d6:2 bb5:3 d6:1 f6:4 | g6:2 f6 d6 bb5 d6:4 r:4 | c6:2 c6:1 c6:1 f6:2 c6:2 a5:3 c6:1 f6:4 | a6:2 f6 c6 a5 c6:4 r:4 | bb5:2 bb5:1 bb5:1 e6:2 c6:2 g5:3 bb5:1 e6:4 | g6:2 e6 c6 bb5 g5:2 a5 bb5 b5 | c6:3 f6:3 a6:2 g6:3 f6:3 c6:2 | f6:6 r:2 r:8',
      contra: '- | r:8 r:4 f5:2 bb5:2 | - | r:8 r:4 f5:2 a5:2 | - | - | - | r:8 c6:2 a5 f5 c5',
      baixo: '@1...5...1...5...', acordes: 'Bb | Bb | F | F | C7 | C7 | F | F', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'a5:3 d6:3 f6:2 e6:2 d6 c#6 d6 | a5:6 f5:2 d5:8 | g5:3 a5:3 c#6:2 e6:2 g6 f6 e6 | c#6:6 a5:2 e5:8 | f6:3 e6:3 d6:2 a5:3 d6:3 f6:2 | g6:2 f6 d6 bb5 g5:4 bb5:4 | e6:2 d6 c6 bb5 g5:2 bb5 c6 e6 | f6:4 c6:4 a5:4 f5:4',
      contra: V8, baixo: '@1...5...1...5.a.', acordes: 'Dm | Dm | A7 | A7 | Dm | Gm | C7 | F', bateria: 'c c c c a a a v',
      inst: { melodia: 'pulso25' },
    },
    D: {
      melodia: 'f5:1 a5 c6 f6 a6:2 f6:2 c6:2 a5:2 c6:4 | f#5:1 a5 c6 d6 f#6:2 d6:2 c6:2 a5:2 c6:4 | bb5:2 d6 g6:4 f6:2 d6 bb5:4 | a5:2 bb5 d6 g6 bb6:4 g6:4 | f6:2 f6:1 f6:1 d6:2 bb5:2 d6:3 f6:1 bb6:4 | a6:2 f6 c6 a5 c6:2 f6 a6:4 | g6:2 e6 c6 bb5 g5:2 c6 e6 g6 | f6:4 r:2 f6:2 f6:4 r:4',
      contra: V8, baixo: '@1...5...1...5...', acordes: 'F | D7 | Gm | Gm | Bb | F | C7 | F', bateria: 'a a a a a a a v',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const cidadeSamba: Faixa = {
  id: 'cidade-samba', titulo: 'Roda na Praça (samba de roda)', bpm: 100, loop: true, envio: 0.22,
  inst: { melodia: 'viola', contra: 'flauta', baixo: 'tri', harmonia: 'cavaquinho' },
  estilo: { tipo: 'ritmo', grade: 'x..x.x.xx.x.x.x.', oitava: 4 },
  vol: { melodia: 1, contra: 0.5, harmonia: 0.45, bateria: 0.7 },
  bateria: {
    a: { pandeiro: 'xoxxxoxxxoxxxoxx', palmas: 'x..x..x...x.x...', atabaque: '..x...x...xx..x.', surdo: '....x.......x...' },
    b: { pandeiro: 'xoxxxoxxxoxxxoxx', palmas: 'x..x..x...x.x...', atabaque: '..x...xx..xx..x.', surdo: '....x.......x...', reco: 'x...x...x...x...' },
    v: { pandeiro: 'xoxxxoxxxoxxxxxx', palmas: 'x..x..x...x.x.x.', atabaque: '..x...x.x.xxx.xx', surdo: '....x.......x.x.' },
  },
  secoes: {
    A: {
      melodia: 'r:2 e5:2 g5:1 a5:2 g5:1 c6:3 a5:1 g5:4 | e5:3 g5:1 _:2 e5:2 c5:4 r:4 | r:2 d5:2 f5:1 g5:2 f5:1 b5:3 g5:1 f5:4 | d5:3 f5:1 _:2 d5:2 b4:4 r:4 | r:2 f5:2 a5:1 d6:2 a5:1 f5:3 a5:1 d6:4 | b5:3 g5:1 _:2 f5:2 d5:2 f5 g5 b5 | c6:3 g5:1 _:2 e5:2 g5:3 c6:1 _:4 | c6:4 r:4 r:8',
      contra: V8, baixo: '@1.....5.1.....5.', acordes: 'C | C | G7 | G7 | Dm | G7 | C | C', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'a5:3 c6:1 _:2 f6:2 e6:3 d6:1 _:2 c6:2 | a5:3 c6:1 _:2 a5:2 f5:4 r:4 | g5:3 c6:1 _:2 e6:2 d6:3 c6:1 _:2 g5:2 | e5:3 g5:1 _:2 e5:2 c5:4 r:4 | b5:3 d6:1 _:2 g6:2 f6:3 d6:1 _:2 b5:2 | g5:2 a5 b5 d6 f6:4 d6:4 | e6:3 c6:1 _:2 g5:2 e6:3 c6:1 _:2 g5:2 | bb5:4 g5:4 e5:4 c5:4',
      contra: '- | r:8 a5:2 c6 f6:4 | - | r:8 g5:2 c6 e6:4 | - | - | - | -',
      baixo: '@1.....5.1...5.a.', acordes: 'F | F | C | C | G7 | G7 | C | C7', bateria: 'b b b b b b b v',
    },
    C: {
      melodia: 'e5:2 a5 c6:4 b5:2 a5 e5:4 | f5:2 a5 d6:4 c6:2 a5 f5:4 | g5:2 b5 d6 f6 e6:2 d6 b5:4 | c6:6 g5:2 e5:8 | a5:2 c6 e6:4 d6:2 c6 a5:4 | d6:2 f6 a6:4 f6:2 d6 a5:4 | g#5:2 b5 d6 e6 d6:2 b5 g#5:4 | a5:12 r:4',
      contra: V8, baixo: '@1.....5.1.....5.', acordes: 'Am | Dm | G7 | C | Am | Dm | E7 | Am', bateria: 'a',
      inst: { melodia: 'pulso25' },
    },
    D: {
      melodia: 'g5:3 c6:1 _:2 e6:2 g6:3 e6:1 _:2 c6:2 | a5:3 c#6:1 _:2 e6:2 g6:3 e6:1 _:2 c#6:2 | d6:3 f6:1 _:2 a6:2 f6:4 d6:4 | b5:2 d6 f6 g6 f6:2 d6 b5:4 | c6:3 e6:1 _:2 g6:2 e6:3 c6:1 _:2 g5:2 | c#6:3 e6:1 _:2 a5:2 g5:4 e5:4 | f5:2 a5 d6:4 b5:2 d6 g5:4 | c6:8 r:8',
      contra: V8, baixo: '@1.....5.1...5.a.', acordes: 'C | A7 | Dm | G7 | C | A7 | Dm G7 | C', bateria: 'b b b b b b b v',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const cidadeBaiao: Faixa = {
  id: 'cidade-baiao', titulo: 'Feira da Chapada (baião)', bpm: 108, loop: true, envio: 0.25,
  inst: { melodia: 'flauta', contra: 'flauta', baixo: 'tri', harmonia: 'viola' },
  estilo: { tipo: 'ritmo', grade: 'x..x..x.x..x..x.', oitava: 3 },
  vol: { melodia: 0.9, contra: 0.6, harmonia: 0.5 },
  bateria: {
    a: { zabumba: 'X..X....X..X....', bacalhau: '......x.......x.', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.' },
    b: { zabumba: 'X..X..x.X..X..x.', bacalhau: '....x.......x...', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.', caixa: '....o..o....o.oo' },
    v: { zabumba: 'X..X..X..X..X.X.', bacalhau: '..x..x..x..x...x', caixa: '........o.ooxxxx' },
  },
  secoes: {
    A: {
      melodia: 'g5:3 b5:3 d6:2 f6:3 e6:3 d6:2 | b5:3 d6:3 g5:2 b5:8 | a5:3 c6:3 f6:2 e6:3 c6:3 a5:2 | b5:2 a5 g5 b5 d6:8 | g5:3 b5:3 d6:2 f6:3 g6:3 f6:2 | e6:3 c6:3 g5:2 c6:8 | f6:2 e6 c6 a5 c6:4 f5:4 | g5:8 r:2 d5:2 g5:2 r:2',
      contra: 'e5:3 g5:3 b5:2 d6:3 c6:3 b5:2 | g5:3 b5:3 d5:2 g5:8 | f5:3 a5:3 c6:2 c6:3 a5:3 f5:2 | g5:2 f5 d5 g5 b5:8 | e5:3 g5:3 b5:2 d6:3 e6:3 d6:2 | c6:3 g5:3 e5:2 g5:8 | c6:2 c6 a5 f5 a5:4 c5:4 | d5:8 r:8',
      baixo: '@1..1..5.1..1..5.', acordes: 'G | G | F | G | G | C | F | G', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'e6:2 g6 e6 c6 e6:4 g5:4 | d6:2 g6 d6 b5 d6:4 g5:4 | f6:2 a6 f6 d6 f6:4 a5:4 | g6:6 f6:2 d6:8 | c6:2 e6 g6:4 e6:2 c6 g5:4 | b5:2 d6 g6:4 d6:2 b5 g5:4 | a5:2 c6 f6 a6 g6:2 f6 e6 c6 | d6:8 b5:4 g5:4',
      contra: V8, baixo: '@1..1..5.1..5..8.', acordes: 'C | G | Dm | G | C | G | F | G', bateria: 'b b b b b b b v',
      inst: { melodia: 'viola' }, estilo: { tipo: 'ritmo', grade: 'x..x..x.x..x..x.', oitava: 4 },
    },
    C: {
      melodia: 'd6:4 b5:2 g5:2 b5:4 d6:4 | c#6:4 a5:2 e5:2 a5:4 c#6:4 | d6:2 e6 f6 e6 d6:4 b5:4 | c#6:2 e6 a6:4 g6:2 e6 c#6:4 | b5:4 e6:4 g6:6 e6:2 | e6:6 c#6:2 a5:8 | f#5:2 a5 c6 d6 f#6:4 d6:4 | g6:8 d6:4 b5:4',
      contra: 'b5:4 g5:2 d5:2 g5:4 b5:4 | a5:4 e5:2 c#5:2 e5:4 a5:4 | b5:2 c6 d6 c6 b5:4 g5:4 | a5:2 c#6 e6:4 e6:2 c#6 a5:4 | g5:4 b5:4 e6:6 b5:2 | c#6:6 a5:2 e5:8 | d5:2 f#5 a5 c6 d6:4 a5:4 | b5:8 g5:8',
      baixo: '@1..1..5.1..1..5.', acordes: 'G | A | G | A | Em | A | D7 | G', bateria: 'a a a a a a a v',
    },
    D: {
      melodia: 'g6:3 f6:3 d6:2 b5:3 d6:3 g6:2 | a6:3 f6:3 c6:2 a5:3 c6:3 f6:2 | e6:2 g6 e6 c6 g5:4 c6:4 | b5:2 d6 g6:4 d6:8 | g6:3 f6:3 d6:2 f6:3 g6:3 b6:2 | a6:3 f6:3 c6:2 f6:3 a6:3 c6:2 | e6:4 c6:4 d6:4 f#6:4 | g6:12 r:4',
      contra: V8, baixo: '@1..1..5.1..5..8.', acordes: 'G | F | C | G | G | F | C D | G', bateria: 'b b b b b b b v',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const cidadeMaracatu: Faixa = {
  id: 'cidade-maracatu', titulo: 'Cortejo de Coral (maracatu)', bpm: 100, loop: true, envio: 0.28,
  inst: { melodia: 'metais', contra: 'pulso25', baixo: 'baixo', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 0.95, contra: 0.5, harmonia: 0.55, bateria: 0.75 },
  bateria: {
    a: { alfaia: 'X..X..x.X.xx..x.', gongue: 'X..x.xx.X..x.xx.', caixa: 'o.ooo.ooo.ooo.oo', ganza: 'x.x.x.x.x.x.x.x.' },
    b: { alfaia: 'X..X..x.X.xx.xx.', gongue: 'X..x.xx.X..x.xx.', caixa: 'x.oox.oox.oox.oo', ganza: 'x.x.x.x.x.x.x.x.' },
    v: { alfaia: 'X..X..X..X..X.XX', gongue: 'X..X..X..X..X...', caixa: 'x.xxx.xxxxxxXxXx' },
  },
  secoes: {
    A: {
      melodia: 'd5:4 f5:2 a5:6 g5:2 f5:2 | a5:3 g5:3 f5:2 d5:8 | c5:4 e5:2 g5:6 f5:2 e5:2 | f5:3 e5:3 d5:2 a4:8 | d5:4 f5:2 a5:6 c6:2 d6:2 | d6:3 bb5:3 g5:2 bb5:8 | a5:2 c#6 e6:4 g6:2 e6 c#6:4 | d6:8 r:8',
      contra: '- | r:8 a4:2 d5 f5 a5 | - | r:8 a4:2 c5 e5 a5 | - | r:8 d5:2 g5 bb5 d6 | - | r:4 a5:2 f5:2 d5:4 r:4',
      baixo: '@1.....1.5.....5.', acordes: 'Dm | Dm | C | Dm | Dm | Gm | A7 | Dm', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'c6:3 a5:3 f5:2 a5:3 c6:3 f6:2 | e6:3 c6:3 g5:2 c6:8 | d6:3 bb5:3 g5:2 bb5:3 d6:3 g6:2 | f6:6 d6:2 a5:8 | a5:2 c6 f6:4 e6:2 c6 a5:4 | g5:2 c6 e6:4 d6:2 c6 g5:4 | a5:4 c#6:4 e6:6 g6:2 | e6:8 c#6:4 a5:4',
      contra: V8, baixo: '@1.....1.5..1..5.', acordes: 'F | C | Gm | Dm | F | C | A7 | A7', bateria: 'b b b b b b b v',
    },
    C: {
      melodia: 'd6:4 d6:2 f6:6 d6:4 | e6:4 e6:2 g6:6 e6:4 | f6:3 e6:3 d6:2 a5:8 | a5:2 c6 d6:4 r:8 | bb5:4 d6:2 f6:6 d6:4 | c6:4 e6:2 g6:6 e6:4 | a6:3 g6:3 f6:2 d6:8 | d6:8 r:8',
      contra: 'bb4:8 d5:8 | c5:8 e5:8 | d5:8 f5:8 | r:8 a4:2 c5 d5 f5 | bb4:8 d5:8 | c5:8 g5:8 | f5:8 a5:8 | r:8 d5:2 f5 a5 d6',
      baixo: '@1.....1.5.....5.', acordes: 'Bb | C | Dm | Dm | Bb | C | Dm | Dm', bateria: 'a a a a a a a v',
    },
    D: {
      melodia: 'f5:2 a5 d6:4 f6:2 d6 a5:4 | e5:2 a5 c6:4 e6:2 c6 a5:4 | d5:2 f5 bb5:4 d6:2 bb5 f5:4 | c6:6 a5:2 f5:8 | g5:2 bb5 d6 g6 f6:4 d6:4 | a5:2 d6 f6 a6 g6:4 f6:4 | e6:4 c#6:4 a5:2 c#6 e6 g6 | d6:12 r:4',
      contra: V8, baixo: '@1.....1.5..1..5.', acordes: 'Dm | Am | Bb | F | Gm | Dm | A7 | Dm', bateria: 'b b b b b b b v',
      inst: { melodia: 'pulso25' },
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const cidadeChoro: Faixa = {
  id: 'cidade-choro', titulo: 'Sobrados da Serra (choro)', bpm: 92, loop: true, envio: 0.24,
  inst: { melodia: 'flauta', contra: 'pulso12', baixo: 'violao', harmonia: 'cavaquinho' },
  estilo: { tipo: 'ritmo', grade: 'x..x.xx.x..x.xx.', oitava: 4 },
  vol: { melodia: 0.95, contra: 0.45, harmonia: 0.45, baixo: 1, bateria: 0.6 },
  bateria: {
    a: { pandeiro: 'XoxxXoxxXoxxXoxx' },
    v: { pandeiro: 'XoxxXoxxXoxxXxXx' },
    c: { pandeiro: 'x.o.x.o.x.o.x.o.' },
  },
  secoes: {
    A: {
      melodia: 'r:1 a4 d5 f5 a5 d6 f6 e6 d6:2 a5:2 f5:4 | r:1 a4 c#5 e5 g5 bb5 a5 g5 f5:2 e5:2 c#5:4 | r:1 d5 f5 a5 d6 f6 a6 g6 f6:2 d6:2 a5:4 | r:1 d5 f#5 a5 c6 eb6 d6 c6 bb5:2 a5:2 f#5:4 | r:1 g5 bb5 d6 g6 f6 eb6 d6 c6:2 bb5:2 g5:4 | r:1 f5 a5 d6 f6 e6 d6 c#6 d6:2 a5:2 f5:4 | e5:1 g#5 b5 d6 e6 d6 b5 g#5 a5:1 c#6 e6 g6 a6 g6 e6 c#6 | d6:4 r:2 a5:2 d5:4 r:4',
      contra: V8, baixo: '@1...5..a|1..3.5.a', acordes: 'Dm | A7 | Dm | D7 | Gm | Dm | E7 A7 | Dm', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'c6:2 a5:1 c6:1 f6:2 e6:1 f6:1 a6:2 f6:2 c6:4 | bb5:2 g5:1 bb5:1 e6:2 d6:1 e6:1 g6:2 e6:2 c6:4 | a5:1 c6 f6 a6 g6 f6 e6 f6 c6:2 a5:2 f5:4 | f#5:1 a5 c6 d6 f#6 d6 c6 a5 f#5:2 a5:2 d6:4 | d6:2 bb5:1 d6:1 g6:2 f#6:1 g6:1 bb6:2 g6:2 d6:4 | c6:1 e6 g6 bb6 a6 g6 e6 c6 bb5:2 g5:2 e5:4 | f5:1 a5 c6 f6 a6 f6 c6 a5 f5:4 a5:4 | a5:1 c#6 e6 g6 f6 e6 c#6 a5 g5:2 e5:2 c#5:4',
      contra: V8, baixo: '@1..3.5.a|1...5..a', acordes: 'F | C7 | F | D7 | Gm | C7 | F | A7', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'd6:6 f6:2 bb5:8 | d6:6 bb5:2 g5:8 | c6:6 a5:2 f5:4 a5:4 | c6:4 a5:4 f#5:6 a5:2 | bb5:4 d6:4 g6:6 f6:2 | e6:6 g6:2 bb5:8 | a5:4 c6:4 f6:8 | e6:4 c#6:4 a5:2 g5 e5 c#5',
      contra: 'f5:8 d5:8 | bb4:8 d5:8 | a4:8 c5:8 | a4:8 c5:8 | d5:8 bb4:8 | c5:8 e5:8 | c5:8 a4:8 | c#5:8 e5:8',
      baixo: '@1.....5.1...3.a.', acordes: 'Bb | Gm | F | D7 | Gm | C7 | F | A7', bateria: 'c',
      estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 1], passo: 2, oitava: 4 },
    },
    D: {
      melodia: 'd6:1 e6 f6 a6 d6:2 a5:2 f5:1 a5 d6 f6 a5:4 | g5:1 bb5 d6 g6 bb5:2 g5:2 d5:1 g5 bb5 d6 g5:4 | a5:1 c#6 e6 g6 bb6 a6 g6 e6 c#6:2 a5:2 e5:4 | f5:1 a5 d6 f6 a6:2 f6:2 d6:4 a5:4 | bb5:1 d6 f6 bb6 a6 f6 d6 bb5 f5:2 bb5:2 d6:4 | e6:1 g#6 b6 g#6 e6 d6 b5 g#5 e5:2 g#5:2 b5:4 | c#6:1 e6 g6 e6 c#6 a5 g5 e5 a5:2 c#6:2 e6:4 | d6:8 r:2 a5:2 d5:2 r:2',
      contra: V8, baixo: '@1...5..a|1..3.5.a', acordes: 'Dm | Gm | A7 | Dm | Bb | E7 | A7 | Dm', bateria: 'a a a a a a a v',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const cidadeCatira: Faixa = {
  id: 'cidade-catira', titulo: 'Varanda do Buriti (catira)', bpm: 112, loop: true, envio: 0.24,
  inst: { melodia: 'viola', contra: 'viola', baixo: 'tri', harmonia: 'violao' },
  estilo: { tipo: 'ritmo', grade: 'x..xx.x.x..xx.x.', oitava: 3 },
  vol: { melodia: 0.95, contra: 0.65, harmonia: 0.5, bateria: 0.7 },
  bateria: {
    a: { sapato: 'x.......x.......', palmas: '....x.......x...', ganza: 'x.x.x.x.x.x.x.x.' },
    p: { palmas: 'x.xx.x.xx.xx.x.x', sapato: 'X...x...X.x.x...' },
    v: { palmas: 'x.xx.x.xx.x.x.x.', sapato: 'X..X..X.X.X.XXXX' },
  },
  secoes: {
    A: {
      melodia: 'b5:2 b5:2 d6:4 b5:2 d6:2 g6:4 | f#6:2 e6 d6 b5 d6:8 | c6:2 c6:2 e6:4 c6:2 e6:2 f#6:4 | e6:2 d6 c6 a5 c6:8 | a5:2 c6 e6:4 f#6:2 e6 c6:4 | d6:2 c6 a5 f#5 a5:8 | b5:2 d6 g6:4 f#6:2 e6 d6:4 | g6:8 d6:4 b5:4',
      contra: 'g5:2 g5:2 b5:4 g5:2 b5:2 d6:4 | d6:2 c6 b5 g5 b5:8 | a5:2 a5:2 c6:4 a5:2 c6:2 d6:4 | c6:2 b5 a5 f#5 a5:8 | f#5:2 a5 c6:4 d6:2 c6 a5:4 | b5:2 a5 f#5 d5 f#5:8 | g5:2 b5 d6:4 d6:2 c6 b5:4 | b5:8 b5:4 g5:4',
      baixo: '@1...5...1...5...', acordes: 'G | G | D7 | D7 | D7 | D7 | G | G', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'e6:4 g6:2 e6:2 c6:4 e6:4 | g6:6 e6:2 c6:8 | d6:4 g6:2 d6:2 b5:4 d6:4 | g6:6 d6:2 b5:8 | c6:2 d6 e6 f#6 a6:4 f#6:4 | e6:2 d6 c6 a5 f#5:4 a5:4 | g5:2 b5 d6 g6 b6:4 g6:4 | f6:8 d6:4 b5:4',
      contra: 'c6:4 e6:2 c6:2 g5:4 c6:4 | e6:6 c6:2 g5:8 | b5:4 d6:2 b5:2 g5:4 b5:4 | d6:6 b5:2 g5:8 | a5:2 b5 c6 d6 f#6:4 d6:4 | c6:2 b5 a5 f#5 d5:4 f#5:4 | d5:2 g5 b5 d6 g6:4 d6:4 | d6:8 b5:4 g5:4',
      baixo: '@1...5...1...5...', acordes: 'C | C | G | G | D7 | D7 | G | G7', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'e5:2 g5 b5 e6 r:2 e6 r:2 e6 | d6:2 b5 g5 e5 g5:4 b5:4 | c6:2 e6 g6 e6 r:2 e6 r:2 e6 | d6:2 b5 g5 d5 g5:8 | e5:2 g5 b5 e6 g6:4 e6:4 | f#6:2 e6 d6 b5 e6:8 | c#6:2 e6 g6:4 e6:2 c#6 a5:4 | f#6:4 d6:4 c6:4 a5:4',
      contra: V8, baixo: '@1.......5...1...', acordes: 'Em | Em | C | G | Em | Em | A7 | D7', bateria: 'p p p p p p p v',
      estilo: { tipo: 'stab', grade: 'x.......x.......', oitava: 3 },
    },
    D: {
      melodia: 'd6:2 g6 b6:4 a6:2 g6 d6:4 | e6:2 g6 b6:4 g6:2 e6 b5:4 | c6:2 e6 g6:4 e6:2 g6 c6:4 | a5:2 c6 f#6:4 e6:2 d6 c6:4 | b5:2 d6 g6:4 b6:2 a6 g6:4 | g6:6 e6:2 b5:8 | e6:4 c6:4 f#6:4 a6:4 | g6:12 r:4',
      contra: 'b5:2 d6 g6:4 f#6:2 d6 b5:4 | b5:2 e6 g6:4 e6:2 b5 g5:4 | g5:2 c6 e6:4 c6:2 e6 g5:4 | f#5:2 a5 d6:4 c6:2 a5 f#5:4 | g5:2 b5 d6:4 g6:2 f#6 d6:4 | e6:6 b5:2 g5:8 | c6:4 g5:4 d6:4 f#6:4 | b5:12 r:4',
      baixo: '@1...5...1...5...', acordes: 'G | Em | C | D7 | G | Em | C D7 | G', bateria: 'a a a a a a a v',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const cidadeGaucha: Faixa = {
  id: 'cidade-gaucha', titulo: 'Galpão da Geada (rancheira gaúcha)', bpm: 138, passos: 12, loop: true, envio: 0.26,
  inst: { melodia: 'sanfona', contra: 'pulso12', baixo: 'tri', harmonia: 'violao' },
  estilo: { tipo: 'ritmo', grade: '....x...x...', oitava: 4 },
  vol: { melodia: 1, contra: 0.4, harmonia: 0.55, bateria: 0.6 },
  bateria: {
    a: { surdo: 'x...........', aro: '....x...x...' },
    b: { surdo: 'x...........', aro: '....x...x...', caxixi: 'x.x.x.x.x.x.' },
    v: { surdo: 'x.......x...', aro: '....x.x.x.xx' },
  },
  secoes: {
    A: {
      melodia: 'e5:4 a5:4 c6:4 | e6:8 c6:4 | d6:4 b5:4 g#5:4 | e5:8 r:4 | e5:4 g#5:4 b5:4 | d6:8 b5:4 | c6:4 a5:4 e5:4 | a5:8 r:4',
      contra: V8, baixo: '@1.......5...', acordes: 'Am | Am | E7 | E7 | E7 | E7 | Am | Am', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'f6:6 e6:2 d6:4 | a5:4 d6:4 f6:4 | e6:6 d6:2 c6:4 | a5:4 c6:4 e6:4 | d6:2 e6 d6 b5:4 g#5:2 | b5:4 e6:4 g#6:4 | a6:8 e6:4 | c#6:4 e6:4 g6:4',
      contra: V8, baixo: '@1.......5...', acordes: 'Dm | Dm | Am | Am | E7 | E7 | Am | A7', bateria: 'b b b b b b b v',
    },
    C: {
      melodia: 'g5:4 c6:4 e6:4 | g6:6 e6:2 c6:4 | f6:4 d6:4 b5:4 | g5:8 b5:4 | d6:2 e6 f6 e6:2 d6 b5 | g5:4 b5:4 d6:4 | e6:6 d6:2 c6:4 | c6:8 r:4',
      contra: 'e5:12 | e5:12 | d5:12 | d5:12 | f5:12 | f5:12 | e5:12 | e5:8 r:4',
      baixo: '@1.......5...', acordes: 'C | C | G7 | G7 | G7 | G7 | C | C', bateria: 'a a a a a a a v',
    },
    D: {
      melodia: 'a5:4 c6:4 f6:4 | a6:6 f6:2 c6:4 | g5:4 c6:4 e6:4 | g6:6 e6:2 c6:4 | b5:2 d6 f6 g6 f6 d6 | b5:4 d6:4 g6:4 | e6:8 c6:4 | e6:4 d6:4 b5:4',
      contra: V8, baixo: '@1.......5...', acordes: 'F | F | C | C | G7 | G7 | C | E7', bateria: 'b b b b b b b v',
    },
    E: {
      melodia: 'a5:2 c6 e6 a6:4 e6:2 | f6:2 e6 d6 a5:4 d6:2 | b5:2 d6 f6 g6:4 f6:2 | e6:4 c6:4 g5:4 | a5:2 c6 f6 a6:4 f6:2 | d6:2 f6 a6 f6:4 d6:2 | e6:4 g#6:4 b5:4 | a5:8 r:4',
      contra: V8, baixo: '@1.......5...', acordes: 'Am | Dm | G7 | C | F | Dm | E7 | Am', bateria: 'b b b b b b b v',
    },
  },
  ordem: ['A', 'B', 'C', 'D', 'E'],
};
