/**
 * Pessoas da 2ª rodada de arte: guardiões do Sertão (Portão do Pico, Caminho das Névoas, Floresta Ancestral),
 * o Andarilho do Cume e os visitantes (Expedição Boreal e o canoeiro de Manaus).
 * Mesmo esquema da Liga: ficha do kit + peças próprias esculpidas aqui.
 * Rampas: 0 pele · 1 cabelo · 2 roupa A · 3 roupa B · 4 detalhe.
 */
import { pessoa } from './kit/pessoa';
import type { Ficha } from './kit/pessoa';
import { R_CAB, R_A, R_B, R_D } from './kit/paletas';
import type { Rampa } from './kit/paletas';
import { HY } from './kit/pecas';
import { blob, lathe, tube, slab, ring, taper, wobble, tom } from '../../render/sculpt';
import type { Rig, V3 } from '../../render/sculpt';
import type { PixModel } from '../../render/types';

const M = { batalha: true, retrato: true } as const;
const h = (x: number, y: number, z: number): V3 => [x, HY + y, z];
const luz = (i: number) => tom(i, { vies: 1 });
const som = (i: number) => tom(i, { vies: -1 });
const chapa = (i: number) => tom(i, { plano: true });

function especial(f: Ficha, extra: (r: Rig) => void, someNoMapa: string[] = []): PixModel {
  const m = pessoa(f);
  const base = m.build;
  m.build = () => {
    const r = base();
    extra(r);
    r.root.traverse((o) => { o.castShadow = false; });
    return r;
  };
  for (const a of Object.values(m.vistas.mapa.anims)) for (const b of someNoMapa) (a.keys[b] ??= []).push({ t: 0, s: 0.001 });
  m.minMalhas = 36;
  return m;
}

const pena = (len: number, w: number, mat: ReturnType<typeof tom>, pos: V3, rot: V3) =>
  slab([[0, 0], [w, len * 0.35], [w * 0.8, len * 0.8], [0, len], [-w * 0.8, len * 0.8], [-w, len * 0.35]], 0.022, mat, { pos, rot, bevel: 0.008 });
const folha = (len: number, w: number, mat: ReturnType<typeof tom>, pos: V3, rot: V3) =>
  slab([[0, 0], [w, len * 0.3], [w * 0.7, len * 0.75], [0, len], [-w * 0.7, len * 0.75], [-w, len * 0.3]], 0.02, mat, { pos, rot, bevel: 0.008 });
/** casaco/manto comprido preso ao tronco: do ombro até `fim` (y do tronco), aberto na frente se `aberto` */
const casacao = (fim: number, larg: number, mat: ReturnType<typeof tom>) =>
  lathe([[0.001, 0.36], [0.17, 0.355], [0.222, 0.24], [0.222, 0.05], [larg, fim + 0.02], [larg - 0.01, fim], [0.001, fim]], mat, { scale: [0.76, 1, 1], seg: 22 });

/* ---------------------------------------------------------------------------------------------- */
/* Guardião Tibiriçá — Portão dos Guardiões (Pico Pindorama): cocar de penas de gavião, cajado      */
/* ---------------------------------------------------------------------------------------------- */
const GAVIAO: Rampa = ['#4e2e2a', '#86563a', '#c08a5a'];
const PENACHO: Rampa = ['#a89884', '#e6dcc4', '#fffaf0'];
const tibirica = especial({
  id: 'guardiao-tibirica', pele: 'morena', cabelo: 'azeviche', a: PENACHO, b: GAVIAO, d: 'urucum', iris: '#6a3a1a', ...M, zoomBatalha: 0.86,
  v: { porte: 'forte', cabelo: 'longo', sobrancelha: 'grossa', chapeu: 'faixa', rChapeu: R_D, manga: 'sem', rTorso: R_A, listra: R_D, baixo: 'calca', rBaixo: R_B, cinto: R_D,
    pes: 'sandalia', rPes: R_B, pescoco: 'colar', rPescoco: R_A, rPescocoFaixa: R_D, propBraco: 34, propNoMapa: true },
}, (r) => {
  // cocar de gavião: leque alto de penas pardas e creme, pontas escuras, preso atrás da faixa
  for (let i = -5; i <= 5; i++) {
    const a = i * 15.5, s = Math.sin((a * Math.PI) / 180), c = Math.cos((a * Math.PI) / 180), len = 0.27 - Math.abs(i) * 0.02;
    const m = i % 2 === 0 ? tom(R_B) : chapa(R_A);
    r.add('cabeca', pena(len, 0.06, m, h(-0.09, 0.04 + c * 0.24, s * 0.28), [a, 90, 0]),
      blob([0.024, 0.034, 0.04], som(R_B), { pos: h(-0.08, 0.04 + c * (0.24 + len * 0.92), s * (0.28 + len * 0.92)) }));
  }
  // penas pendentes nas têmporas e braçadeiras de urucum
  for (const z of [0.3, -0.3]) r.add('cabeca', pena(0.13, 0.035, tom(R_A), h(0.02, -0.1, z), [180, 90, 0]));
  for (const b of ['bracoD', 'bracoE']) r.add(b, ring(0.062, 0.02, tom(R_D), { pos: [0, -0.05, 0], rot: [90, 0, 0] }), ring(0.058, 0.014, som(R_B), { pos: [0, -0.15, 0], rot: [90, 0, 0] }));
  // faixa trançada a tiracolo
  r.add('tronco', tube([[0.0, 0.33, 0.17], [0.15, 0.18, 0.02], [0.06, 0.0, -0.19]], 0.03, tom(R_A), { seg: 10, radial: 8 }));
  // cajado do portão: madeira escura, penas e chocalho de cabaça
  r.add('prop',
    tube([[0, -0.42, 0], [0.01, 0.6, 0]], 0.028, som(R_B), { seg: 4, radial: 8 }),
    blob([0.065, 0.075, 0.065], tom(R_D), { pos: [0.01, 0.66, 0] }), ring(0.05, 0.016, tom(R_A), { pos: [0.01, 0.6, 0], rot: [90, 0, 0] }),
    pena(0.17, 0.04, chapa(R_A), [0.01, 0.56, 0.03], [160, 0, 0]), pena(0.15, 0.04, tom(R_B), [0.01, 0.56, -0.03], [-160, 0, 0]));
});

/* ---------------------------------------------------------------------------------------------- */
/* Andarilho do Cume — misterioso: chapéu de aba larga, poncho comprido de viagem, cajado e trouxa   */
/* ---------------------------------------------------------------------------------------------- */
const PONCHO: Rampa = ['#262a44', '#3e4868', '#6a7896'];
const andarilho = especial({
  id: 'andarilho-cume', pele: 'canela', cabelo: 'grisalho', a: 'carvao', b: PONCHO, d: 'couro', iris: '#4a5a8a', ...M, zoomBatalha: 0.86, dyRetrato: 1,
  v: { cabelo: 'curto', barba: 'cavanhaque', sobrancelha: 'grossa', chapeu: 'aba-larga', rChapeu: R_D, rChapeuFaixa: R_A, manga: 'longa', rTorso: R_A, baixo: 'calca', rBaixo: R_A,
    pes: 'bota', rPes: R_D, luvas: R_D, propBraco: 30, propNoMapa: true },
}, (r) => {
  // poncho até os joelhos, franja clara na barra e gola alta
  // poncho de lã até o quadril, com duas listras (clara e couro) e franja; gola baixa
  r.add('tronco', lathe([[0.001, 0.35], [0.16, 0.345], [0.25, 0.22], [0.31, -0.02], [0.32, -0.1], [0.3, -0.115], [0.001, -0.1]], tom(R_B), { scale: [0.74, 1, 1], seg: 24 }),
    lathe([[0.3, 0.08], [0.322, 0.01], [0.31, 0.005], [0.29, 0.075]], luz(R_B), { scale: [0.75, 1, 1.01], seg: 24 }),
    lathe([[0.318, -0.02], [0.33, -0.06], [0.318, -0.065], [0.305, -0.025]], tom(R_D), { scale: [0.75, 1, 1.01], seg: 24 }),
    blob([0.16, 0.05, 0.21], som(R_B), { pos: [0.0, 0.31, 0] }));
  for (let i = 0; i < 11; i++) { const a = -150 + i * 30, c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180); r.add('tronco', blob([0.02, 0.035, 0.02], luz(R_B), { pos: [c * 0.31 * 0.74, -0.14, s * 0.31] })); }
  // trouxa pequena enrolada nas costas
  r.add('tronco', tube([[-0.2, 0.26, -0.15], [-0.23, 0.28, 0.0], [-0.2, 0.26, 0.15]], 0.06, tom(R_A, { vies: 1 }), { seg: 10, radial: 10 }));
  // chapéu mais fundo (cobre a testa) e uma pena cinza na fita
  r.add('cabeca', pena(0.16, 0.035, luz(R_B), h(-0.2, 0.17, 0.2), [0, 90, -55]));
  // cajado alto de viagem com tira de pano no topo
  r.add('prop',
    tube([[0, -0.42, 0], [0.02, 0.35, 0], [0.0, 0.7, 0]], 0.026, tom(R_D), { seg: 10, radial: 8 }),
    blob([0.04, 0.05, 0.04], som(R_D), { pos: [0.0, 0.71, 0] }),
    tube([[0.01, 0.6, 0.02], [-0.06, 0.52, 0.04], [-0.1, 0.42, 0.03]], 0.02, luz(R_B), { seg: 8, radial: 6 }));
});

/* ---------------------------------------------------------------------------------------------- */
/* Guarda da Névoa (B-R5) — pala de lã, gorro laranja para ser visto na cerração, cajado com lampião */
/* ---------------------------------------------------------------------------------------------- */
const LA: Rampa = ['#3a4466', '#64729a', '#a2b0cc'];
const guardaNevoa = especial({
  id: 'guarda-nevoa', pele: 'oliva', cabelo: 'castanhoEscuro', a: LA, b: 'chumbo', d: 'laranja', iris: '#4a6a7a', ...M, zoomBatalha: 0.86, dxBatalha: 2,
  v: { cabelo: 'curto', barba: 'bigode', sobrancelha: 'grossa', chapeu: 'pantaneiro', rChapeu: R_B, rChapeuFaixa: R_D, manga: 'longa', rTorso: R_B, baixo: 'calca', rBaixo: R_B,
    pes: 'bota', rPes: R_B, luvas: R_D, sobre: 'pala', rSobre: R_A, rSobreFaixa: R_D, pescoco: 'cachecol', rPescoco: R_D, rPescocoFaixa: R_D, cinto: R_D, propBraco: 26, propNoMapa: true },
}, (r) => {
  // cajado ferrado com gancho e lampião pendurado
  r.add('prop',
    tube([[0, -0.42, 0], [0, 0.62, 0]], 0.026, tom(R_B, { vies: 1 }), { seg: 4, radial: 8 }),
    tube([[0, 0.6, 0], [0.04, 0.68, 0], [0.13, 0.68, 0], [0.16, 0.6, 0]], 0.018, tom(R_B), { seg: 10, radial: 6 }),
    tube([[0.16, 0.6, 0], [0.16, 0.52, 0]], 0.01, som(R_B), { seg: 2, radial: 4 }),
    lathe([[0.001, 0.52], [0.045, 0.5], [0.06, 0.46], [0.06, 0.38], [0.045, 0.35], [0.001, 0.35]], chapa(R_D), { pos: [0.16, 0, 0], seg: 12 }),
    blob([0.035, 0.045, 0.035], luz(R_D), { pos: [0.19, 0.42, 0] }),
    ring(0.062, 0.014, tom(R_B), { pos: [0.16, 0.51, 0], rot: [90, 0, 0] }), ring(0.062, 0.014, tom(R_B), { pos: [0.16, 0.36, 0], rot: [90, 0, 0] }));
  // bornal de lona do lado esquerdo e fiapos de névoa nos pés
  r.add('corpo', blob([0.08, 0.1, 0.05], tom(R_A, { vies: -1 }), { pos: [0.0, -0.04, -0.23] }), blob([0.05, 0.02, 0.055], tom(R_D), { pos: [0.02, 0.03, -0.25] }));
  r.bone('nevoa', 'root', [0, 0, 0]);
  for (const [x, z, e] of [[0.22, 0.18, 1], [-0.2, 0.14, 0.8], [0.1, -0.26, 1], [-0.18, -0.2, 0.8]] as const)
    r.add('nevoa', blob([0.14 * e, 0.04 * e, 0.11 * e], chapa(R_A), { pos: [x, 0.03, z] }), blob([0.07 * e, 0.035 * e, 0.06 * e], luz(R_A), { pos: [x + 0.05, 0.05, z + 0.02] }));
}, ['nevoa']);

/* ---------------------------------------------------------------------------------------------- */
/* Guardiã da Floresta (B8) — manto de folhas, cabelo longo com flores, lança de taquara            */
/* ---------------------------------------------------------------------------------------------- */
const MATA_FUNDA: Rampa = ['#17402e', '#26704a', '#4ea65a'];
const FOLHA_NOVA: Rampa = ['#4a7a22', '#86b834', '#cce86a'];
const TAQUARA: Rampa = ['#8a7a34', '#c8b45a', '#f0e49a'];
const guardiaFloresta = especial({
  id: 'guardia-floresta', pele: 'castanha', cabelo: 'azeviche', a: MATA_FUNDA, b: FOLHA_NOVA, d: TAQUARA, iris: '#3a8a3a', ...M, zoomBatalha: 0.84, dxBatalha: 2,
  v: { porte: 'magro', cabelo: 'longo', chapeu: 'faixa', rChapeu: R_B, manga: 'sem', rTorso: R_A, baixo: 'saia-longa', rBaixo: R_A, rBarra: R_B, cinto: R_D,
    pes: 'descalco', pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_B, brinco: R_B, propBraco: 32, propNoMapa: true },
}, (r) => {
  // manto de folhas: capa verde-escura nas costas e, em cada ombro, um leque de folhas novas caindo para fora
  r.add('tronco', blob([0.05, 0.32, 0.25], tom(R_A, { vies: -1 }), { pos: [-0.15, 0.04, 0], deform: [taper('y', -0.32, 0.32, 1.25, 0.8), wobble(0.012, 14)] }));
  for (const sz of [1, -1]) for (let i = 0; i < 4; i++) {
    const ang = -30 + i * 22;
    r.add('tronco', folha(0.2 - i * 0.012, 0.07, i % 2 ? tom(R_B) : luz(R_B), [0.07 - i * 0.07, 0.36, sz * 0.2], [180 + sz * (38 + i * 4), 90 + ang * 0.0, ang * 0.4]));
  }
  // folhas e flor de maracujá no cabelo
  r.add('cabeca', folha(0.2, 0.06, tom(R_B), h(-0.12, 0.2, 0.22), [-40, 90, 20]), folha(0.17, 0.055, tom(R_A, { vies: 1 }), h(-0.18, 0.17, 0.12), [-15, 90, 40]));
  r.add('cabeca', blob([0.04, 0.04, 0.035], tom(R_D, { vies: 1 }), { pos: h(0.04, 0.19, 0.275) }));
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; r.add('cabeca', blob([0.045, 0.045, 0.025], chapa(R_B), { pos: h(0.04 + Math.cos(a) * 0.06, 0.19 + Math.sin(a) * 0.06, 0.262) })); }
  // pinturas de jenipapo nos braços
  for (const b of ['bracoD', 'bracoE']) r.add(b, ring(0.06, 0.014, som(R_A), { pos: [0, -0.06, 0], rot: [90, 0, 0] }), ring(0.058, 0.014, som(R_A), { pos: [0, -0.11, 0], rot: [90, 0, 0] }));
  // lança de taquara: gomos marcados e ponta de folha
  r.add('prop', tube([[0, -0.42, 0], [0, 0.62, 0]], 0.03, tom(R_D), { seg: 4, radial: 8 }));
  for (const y of [-0.2, 0.05, 0.3, 0.52]) r.add('prop', ring(0.028, 0.01, som(R_D), { pos: [0, y, 0], rot: [90, 0, 0] }));
  r.add('prop', folha(0.26, 0.075, luz(R_B), [0, 0.6, 0], [0, 90, 0]), folha(0.26, 0.075, luz(R_B), [0, 0.6, 0], [0, 0, 0]), tube([[0.0, 0.58, 0.02], [0.05, 0.5, 0.05], [0.06, 0.4, 0.04]], 0.012, tom(R_B), { seg: 6, radial: 5 }));
});

/* ---------------------------------------------------------------------------------------------- */
/* Drª Solveig — pesquisadora-chefe da Expedição Boreal: parka vermelha, gorro de tricô, caderno    */
/* ---------------------------------------------------------------------------------------------- */
const PARKA: Rampa = ['#143a48', '#1f6a76', '#48a6a2'];
const PELO: Rampa = ['#6a4a3a', '#a07a5a', '#d8b48a'];
const LOIRO_NORTE: Rampa = ['#a08250', '#e2cc8e', '#fff6d0'];
const LA_VERMELHA: Rampa = ['#8a2232', '#cf3a3e', '#f47a5c'];
const solveig = especial({
  id: 'dra-solveig', pele: 'clara', cabelo: LOIRO_NORTE, a: PARKA, b: PELO, d: LA_VERMELHA, iris: '#3a6ab4', ...M, zoomBatalha: 0.9,
  v: { porte: 'magro', cabelo: 'tranca', laco: R_A, chapeu: 'gorro', rChapeu: R_D, rChapeuFaixa: R_B, manga: 'longa', rTorso: R_A, baixo: 'calca', rBaixo: R_B,
    pes: 'bota', rPes: R_B, luvas: R_B, sobre: 'jaleco', rSobre: R_A, rSobreFaixa: R_B, pescoco: 'cachecol', rPescoco: R_D, rPescocoFaixa: R_B, prop: 'livro', rProp: R_D, rPropFaixa: R_B, propBraco: 48 },
}, (r) => {
  // gola de pelo baixa (não cobre o queixo), bolsos e punhos de pelo
  r.add('tronco', blob([0.03, 0.05, 0.07], som(R_A), { pos: [0.16, -0.06, 0.12] }), blob([0.03, 0.05, 0.07], som(R_A), { pos: [0.16, -0.06, -0.12] }));
  for (const b of ['bracoD', 'bracoE']) r.add(b, ring(0.066, 0.018, luz(R_B), { pos: [0, -0.17, 0], rot: [90, 0, 0] }));
  // lápis preso no caderno
  r.add('prop', tube([[0.1, 0.13, 0.08], [0.1, -0.06, 0.1]], 0.012, luz(R_B), { seg: 2, radial: 5 }));
});

/* ---------------------------------------------------------------------------------------------- */
/* Pesquisador(a) boreal — os quatro da expedição: parka azul com capuz de pelo, lanterna boreal      */
/* ---------------------------------------------------------------------------------------------- */
const PARKA_AZUL: Rampa = ['#1c2c5a', '#2e4c8e', '#5a82c4'];
const AURORA: Rampa = ['#1a7a72', '#3ad2a0', '#b8ffd8'];
const pesquisador = especial({
  id: 'pesquisador-boreal', pele: 'rosada', cabelo: 'ruivo', a: PARKA_AZUL, b: 'cinza', d: AURORA, iris: '#3a7a6a', ...M, zoomBatalha: 0.9,
  v: { cabelo: 'careca', manga: 'longa', rTorso: R_A, baixo: 'calca', rBaixo: R_B, pes: 'bota', rPes: R_B, luvas: R_B, sobre: 'jaleco', rSobre: R_A, rSobreFaixa: R_B,
    costas: 'mochila', rCostas: R_B, rCostasFaixa: R_D, propBraco: 30, propNoMapa: true },
}, (r) => {
  // capuz levantado com borda de pelo cinza-claro
  r.add('cabeca', blob([0.32, 0.3, 0.345], tom(R_A), { pos: h(-0.07, 0.04, 0), deform: [taper('x', -0.3, 0.3, 1.04, 0.92)] }),
    ring(0.27, 0.05, luz(R_B), { pos: h(0.13, -0.02, 0), rot: [0, 90, 0], scale: [1, 1.1, 1] }),
    blob([0.05, 0.045, 0.17], tom(R_CAB), { pos: h(0.2, 0.17, 0) }));
  // faixa refletiva verde-aurora no peito e nos braços
  r.add('tronco', lathe([[0.226, 0.14], [0.23, 0.1], [0.222, 0.1], [0.218, 0.14]], chapa(R_D), { scale: [0.78, 1, 1.01], seg: 22 }));
  for (const b of ['bracoD', 'bracoE']) r.add(b, ring(0.066, 0.016, chapa(R_D), { pos: [0, -0.1, 0], rot: [90, 0, 0] }));
  // lanterna boreal pendurada na mão: alça, armação e luz de aurora
  r.add('prop',
    tube([[0, 0.02, 0], [0.0, -0.06, 0]], 0.014, som(R_B), { seg: 2, radial: 4 }),
    ring(0.05, 0.016, tom(R_B), { pos: [0, -0.07, 0], rot: [0, 90, 0], arc: 180 }),
    lathe([[0.001, -0.1], [0.075, -0.11], [0.095, -0.16], [0.095, -0.33], [0.075, -0.37], [0.001, -0.37]], chapa(R_D), { seg: 12 }),
    blob([0.055, 0.08, 0.055], luz(R_D), { pos: [0.045, -0.235, 0] }),
    ring(0.097, 0.02, tom(R_B), { pos: [0, -0.12, 0], rot: [90, 0, 0] }), ring(0.097, 0.02, tom(R_B), { pos: [0, -0.36, 0], rot: [90, 0, 0] }));
});

/* ---------------------------------------------------------------------------------------------- */
/* Seu Tarumã — canoeiro de Manaus: chapéu de palha, camisa aberta, remo de pá larga, paneiro       */
/* ---------------------------------------------------------------------------------------------- */
const taruma = especial({
  id: 'seu-taruma', pele: 'castanha', cabelo: 'grisalho', a: 'cru', b: 'jeans', d: 'palha', iris: '#5a3a1a', ...M, zoomBatalha: 0.88,
  v: { porte: 'idoso', cabelo: 'curto', barba: 'bigode', sobrancelha: 'grossa', chapeu: 'palha', rChapeu: R_D, rChapeuFaixa: R_B, manga: 'curta', rTorso: R_A, baixo: 'short', rBaixo: R_B,
    pes: 'descalco', cinto: R_D, propBraco: 22, propNoMapa: true },
}, (r) => {
  // camisa aberta no peito (pele à mostra) e calça arregaçada abaixo do joelho
  r.add('tronco', blob([0.03, 0.1, 0.06], tom(0), { pos: [0.128, 0.24, 0] }));
  for (const b of ['pernaD', 'pernaE']) r.add(b, limbo(0.07, tom(R_B), -0.07), ring(0.07, 0.02, luz(R_B), { pos: [0, -0.115, 0], rot: [90, 0, 0] }));
  // remo de pá larga de madeira escura
  r.add('prop', tube([[0, -0.3, 0], [0, 0.48, 0]], 0.024, tom(R_D, { vies: -1 }), { seg: 4, radial: 8 }),
    slab([[0, 0], [0.075, 0.06], [0.08, 0.26], [0, 0.34], [-0.08, 0.26], [-0.075, 0.06]], 0.03, chapa(R_D), { pos: [0, 0.44, 0], rot: [0, 90, 0], bevel: 0.01 }),
    blob([0.035, 0.03, 0.05], som(R_D), { pos: [0, -0.31, 0] }));
  // paneiro de arumã nas costas com um peixe
  r.add('tronco', lathe([[0.001, -0.13], [0.1, -0.13], [0.13, 0.1], [0.11, 0.12], [0.001, 0.1]], tom(R_D), { pos: [-0.22, 0.16, 0], seg: 14 }),
    ring(0.125, 0.02, som(R_D), { pos: [-0.22, 0.27, 0], rot: [90, 0, 0] }),
    blob([0.04, 0.09, 0.03], luz(R_B), { pos: [-0.22, 0.32, 0.03], rot: [0, 0, 20] }));
});
/** pedaço de calça arregaçada (tubo curto) */
function limbo(len: number, mat: ReturnType<typeof tom>, y: number) {
  return tube([[0, y + len / 2, 0], [0, y - len / 2, 0]], 0.075, mat, { seg: 2, radial: 10 });
}

export const sertao: PixModel[] = [tibirica, andarilho, guardaNevoa, guardiaFloresta, solveig, pesquisador, taruma];
