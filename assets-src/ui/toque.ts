/** Controles de toque desenhados à mão: braços do direcional, miolo, pino do polegar, botões A/B e pílulas. */
import type { Arte } from './icones';

export interface ArteToque extends Arte { apertavel?: boolean; rotulo?: { txt: string; fonte: 8 | 12; y: number; cor: string; sombra: string } }

const BRACO = [
  '...0000000000...',
  '..044444444440..',
  '.04433333333420.',
  '0443333333333420',
  '0433333773333320',
  '0433337777333320',
  '0433377777733320',
  '0433777777773320',
  '0433322222233320',
  '0433333333333320',
  '0433333333333320',
  '0433333333333320',
  '0433333333333320',
  '0433333333333320',
  '0433333333333320',
  '0433333333333320',
];
/** gira 90° no sentido horário (a arte do braço é desenhada apontando para cima) */
const girar = (l: string[]) => l[0].split('').map((_, x) => l.map((linha) => linha[x]).reverse().join(''));
const DIR = girar(BRACO), BAIXO = girar(DIR), ESQ = girar(BAIXO);

/** metade esquerda de um botão redondo; X/Y/Z = cor do botão (base, sombra, brilho) */
const REDONDO = [
  '........0000',
  '......004444',
  '....00444444',
  '...044433333',
  '..0443300000',
  '..04330XXXXX',
  '.04330XZZZZZ',
  '.0430XZZXXXX',
  '04430XZXXXXX',
  '04330XZXXXXX',
  '0430XZXXXXXX',
  '0430XXXXXXXX',
  '0430XXXXXXXX',
  '0430XXXXXXXX',
  '04330XXXXXXX',
  '03330XXXXXYY',
  '.0330XXXXYYY',
  '.03220YYYYYY',
  '..03220YYYYY',
  '..0322200000',
  '...022222222',
  '....00222222',
  '......002222',
  '........0000',
];
const N = 36; // miolo da pílula (largura total 40)
const PILULA = [
  '..' + '0'.repeat(N) + '..',
  '.0' + '4'.repeat(N) + '0.',
  '04' + '3'.repeat(N) + '20',
  ...Array.from({ length: 6 }, () => '04' + '3'.repeat(N) + '20'),
  '03' + '2'.repeat(N) + '20',
  '.0' + '2'.repeat(N) + '0.',
  '..' + '0'.repeat(N) + '..',
];

export const TOQUE: { artes: ArteToque[]; medidas: Record<string, number> } = {
  medidas: { braco: 16, botao: 24, pino: 14, pilulaW: 40, pilulaH: 12 },
  artes: [
    { nome: 'dpad-cima', linhas: BRACO }, { nome: 'dpad-dir', linhas: DIR }, { nome: 'dpad-baixo', linhas: BAIXO }, { nome: 'dpad-esq', linhas: ESQ },
    { nome: 'dpad-cima-ap', linhas: BRACO, cores: { '7': '#f9c22b', '3': '#c98f4e', '4': '#e8c07a' } }, { nome: 'dpad-dir-ap', linhas: DIR, cores: { '7': '#f9c22b', '3': '#c98f4e', '4': '#e8c07a' } },
    { nome: 'dpad-baixo-ap', linhas: BAIXO, cores: { '7': '#f9c22b', '3': '#c98f4e', '4': '#e8c07a' } }, { nome: 'dpad-esq-ap', linhas: ESQ, cores: { '7': '#f9c22b', '3': '#c98f4e', '4': '#e8c07a' } },
    { nome: 'dpad-miolo', linhas: [
      '3333333333333333',
      '3333333333333333',
      '3333333333333333',
      '3333333333333333',
      '3333332222333333',
      '3333322222233333',
      '3333222222223333',
      '3333222222224333',
      '3333222222224333',
      '3333222222224333',
      '3333322222243333',
      '3333334444433333',
      '3333333333333333',
      '3333333333333333',
      '3333333333333333',
      '3333333333333333',
    ] },
    { nome: 'dpad-pino', linhas: [
      '....000000....',
      '..00pppppp00..',
      '.0ppqqqqqqpp0.',
      '.0pqqrrqqqqp0.',
      '0pqqrrqqqqqqp0',
      '0pqqrqqqqqqqp0',
      '0pqqqqqqqqqqp0',
      '0pqqqqqqqqqqp0',
      '0pqqqqqqqqqpp0',
      '0ppqqqqqqqqpp0',
      '.0pqqqqqqqpp0.',
      '.0ppqqqqqppp0.',
      '..00pppppp00..',
      '....000000....',
    ] },
    { nome: 'botao-a', linhas: REDONDO, espelhoX: true, apertavel: true, cores: { X: '#e0483c', Y: '#a32638', Z: '#f58a4b' }, rotulo: { txt: 'A', fonte: 12, y: 6, cor: '7', sombra: 'g' } },
    { nome: 'botao-b', linhas: REDONDO, espelhoX: true, apertavel: true, cores: { X: '#2f86c4', Y: '#1f4f7a', Z: '#6fc7e8' }, rotulo: { txt: 'B', fonte: 12, y: 6, cor: '7', sombra: 'c' } },
    { nome: 'pilula-menu', linhas: PILULA, apertavel: true, rotulo: { txt: 'MENU', fonte: 8, y: 3, cor: '7', sombra: '1' } },
    { nome: 'pilula-select', linhas: PILULA, apertavel: true, rotulo: { txt: 'SELECT', fonte: 8, y: 3, cor: '7', sombra: '1' } },
  ],
};
