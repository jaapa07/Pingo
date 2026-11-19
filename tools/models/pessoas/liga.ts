/**
 * Liga dos Guardiões (Platô da Liga, A-LG — spec 5): quatro Mestres e o Campeão.
 * Cada um parte da ficha do kit e ganha peças próprias (objeto de ofício, chapéu, capa), esculpidas aqui.
 * Rampas: 0 pele · 1 cabelo · 2 roupa A · 3 roupa B · 4 detalhe.
 */
import { pessoa } from './kit/pessoa';
import type { Ficha } from './kit/pessoa';
import { R_PELE, R_CAB, R_A, R_B, R_D } from './kit/paletas';
import type { Rampa } from './kit/paletas';
import { HY } from './kit/pecas';
import { blob, lathe, tube, slab, ring, spike, taper, tom } from '../../render/sculpt';
import type { Rig, V3 } from '../../render/sculpt';
import type { PixModel } from '../../render/types';

const M = { batalha: true, retrato: true } as const;
const h = (x: number, y: number, z: number): V3 => [x, HY + y, z];
const luz = (i: number) => tom(i, { vies: 1 });
const som = (i: number) => tom(i, { vies: -1 });
const chapa = (i: number) => tom(i, { plano: true });

/** Ficha do kit + peças próprias. `someNoMapa`: ossos próprios que não aparecem no sprite de mapa. */
function mestre(f: Ficha, extra: (r: Rig) => void, someNoMapa: string[] = []): PixModel {
  const m = pessoa(f);
  const base = m.build;
  m.build = () => {
    const r = base();
    extra(r);
    r.root.traverse((o) => { o.castShadow = false; });
    return r;
  };
  for (const a of Object.values(m.vistas.mapa.anims)) for (const b of someNoMapa) (a.keys[b] ??= []).push({ t: 0, s: 0.001 });
  m.minMalhas = 40;
  return m;
}

const pena = (len: number, w: number, i: number, pos: V3, rot: V3, plano = false) =>
  slab([[0, 0], [w, len * 0.35], [w * 0.8, len * 0.8], [0, len], [-w * 0.8, len * 0.8], [-w, len * 0.35]], 0.022, plano ? chapa(i) : tom(i), { pos, rot, bevel: 0.008 });

/* ---------------------------------------------------------------------------------------------- */
/* 1 · Mestra Maré — pescadora de mangue (Rio/Veneno): chapéu de palha, jereré, samburá com aratu   */
/* ---------------------------------------------------------------------------------------------- */
const ROXO_MANGUE: Rampa = ['#3a1c52', '#6e3a9e', '#b078d8'];
const mare = mestre({
  id: 'liga-mare', pele: 'castanha', cabelo: 'azeviche', a: 'turquesa', b: ROXO_MANGUE, d: 'palha', iris: '#1a8a8a', ...M, zoomBatalha: 0.84, dxBatalha: 3,
  v: { cabelo: 'trancas', laco: R_A, chapeu: 'aba-larga', rChapeu: R_D, rChapeuFaixa: R_B, manga: 'curta', listra: R_B, baixo: 'short', rBaixo: R_B, pes: 'bota', rPes: R_B, cinto: R_D,
    pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_A, brinco: R_A, costas: 'cesto', rCostas: R_D, rCostasFaixa: R_B, propBraco: 28, propNoMapa: true },
}, (r) => {
  // jereré: vara comprida, aro e saco de rede com um peixe dentro
  r.add('prop',
    tube([[-0.1, -0.33, 0], [0.24, 0.4, 0]], 0.024, tom(R_D), { seg: 4, radial: 8 }),
    ring(0.14, 0.026, tom(R_D), { pos: [0.36, 0.44, 0], rot: [90, 0, 0] }),
    lathe([[0.135, 0], [0.125, -0.12], [0.075, -0.24], [0.001, -0.29], [0.001, 0]], tom(R_A), { pos: [0.36, 0.44, 0], seg: 14 }),
    ring(0.105, 0.016, som(R_A), { pos: [0.36, 0.31, 0], rot: [90, 0, 0] }),
    blob([0.06, 0.04, 0.035], chapa(R_B), { pos: [0.36, 0.48, 0] }));
  // aratu roxo espiando do samburá
  r.bone('aratu', 'cabeca', h(-0.04, 0.4, 0));
  r.add('aratu', blob([0.1, 0.065, 0.13], tom(R_B), { pos: [0, 0.03, 0] }), blob([0.02, 0.03, 0.02], chapa(R_D), { pos: [0.09, 0.08, 0.04] }), blob([0.02, 0.03, 0.02], chapa(R_D), { pos: [0.09, 0.08, -0.04] }));
  for (const s of [1, -1]) r.add('aratu',
    tube([[0, 0.03, 0.1 * s], [0.04, 0.1, 0.2 * s], [0.07, 0.2, 0.17 * s]], 0.03, tom(R_B), { seg: 6, radial: 6 }),
    blob([0.05, 0.06, 0.05], luz(R_B), { pos: [0.07, 0.22, 0.16 * s] }));
  // fieira de peixes na cintura (lado da câmera) e conchas no chapéu
  r.add('cabeca', blob([0.04, 0.045, 0.05], luz(R_A), { pos: h(0.25, 0.2, -0.12) }), blob([0.035, 0.04, 0.04], luz(R_B), { pos: h(0.27, 0.2, 0.02) }));
});

/* ---------------------------------------------------------------------------------------------- */
/* 2 · Ferreiro Brasa-Viva — forjador de sinos (Brasa/Ferro): barba em brasa, sino de bronze, malho  */
/* ---------------------------------------------------------------------------------------------- */
const BRASA: Rampa = ['#8e2a1e', '#e8601e', '#ffc83c'];
const BRONZE: Rampa = ['#7a4a1e', '#c8922e', '#ffe078'];
const brasaViva = mestre({
  id: 'liga-brasa-viva', pele: 'castanha', cabelo: BRASA, a: 'carvao', b: 'couro', d: BRONZE, iris: '#d2601a', ...M, zoomBatalha: 0.96,
  v: { porte: 'forte', cabelo: 'raspado', barba: 'longa', sobrancelha: 'grossa', chapeu: 'faixa', rChapeu: R_D, manga: 'sem', rTorso: R_B, sobre: 'avental', rSobre: R_A, rSobreFaixa: R_D, rBaixo: R_B,
    pes: 'bota', rPes: R_A, luvas: R_A, cinto: R_D, propBraco: 62, propNoMapa: true },
}, (r) => {
  // sino grande pendurado na mão direita (o osso `prop` fica sempre na vertical)
  r.add('prop',
    ring(0.045, 0.02, som(R_D), { pos: [0, -0.04, 0], rot: [0, 90, 0] }),
    lathe([[0.001, -0.07], [0.05, -0.075], [0.085, -0.13], [0.1, -0.27], [0.155, -0.36], [0.15, -0.385], [0.001, -0.36]], tom(R_D), { seg: 20 }),
    ring(0.15, 0.022, luz(R_D), { pos: [0, -0.365, 0], rot: [90, 0, 0] }),
    ring(0.088, 0.014, som(R_D), { pos: [0, -0.15, 0], rot: [90, 0, 0] }),
    blob([0.04, 0.05, 0.04], som(R_A), { pos: [0, -0.41, 0] }));
  // malho de forja apoiado na mão esquerda
  r.bone('malho', 'maoE', [0, 0, 0]);
  r.add('malho', tube([[0, 0.06, 0], [0.02, -0.26, 0]], 0.024, tom(R_B), { seg: 4, radial: 8 }),
    blob([0.1, 0.075, 0.075], tom(R_A, { vies: 1 }), { pos: [0.02, -0.29, 0] }), blob([0.025, 0.06, 0.06], tom(R_D), { pos: [0.115, -0.29, 0] }));
  // sininhos de prova pendurados no cinto e ombreira de couro
  for (const z of [-0.2, -0.1]) r.add('corpo', blob([0.04, 0.055, 0.04], luz(R_D), { pos: [0.1 + (z + 0.2) * 0.5, -0.03, z * 1.05] }));
  r.add('tronco', blob([0.1, 0.055, 0.1], tom(R_B), { pos: [0, 0.3, -0.21] }), blob([0.035, 0.03, 0.035], luz(R_D), { pos: [0.06, 0.33, -0.21] }));
  // fagulhas presas na barba e brasa no topete raspado
  r.add('cabeca', blob([0.035, 0.035, 0.035], chapa(R_CAB), { pos: h(0.24, -0.38, 0.05) }), spike(0.16, 0.07, luz(R_CAB), { pos: h(0.05, 0.24, 0), rot: [0, 0, -20] }), spike(0.12, 0.055, tom(R_CAB), { pos: h(-0.07, 0.23, 0.05), rot: [10, 0, 10] }));
}, ['malho']);

/* ---------------------------------------------------------------------------------------------- */
/* 3 · Pajé Neblina — contador de lendas (Mente/Assombro): manto cor de névoa, cajado de voluta      */
/* ---------------------------------------------------------------------------------------------- */
const NEVOA: Rampa = ['#5e5a8e', '#a2a4d0', '#e2e8fa'];
const SEMENTE: Rampa = ['#9a6a2a', '#dcae4e', '#fff0a4'];
const neblina = mestre({
  id: 'liga-neblina', pele: 'canela', cabelo: 'branco', a: NEVOA, b: 'jabuticaba', d: SEMENTE, iris: '#7a5ac2', ...M, zoomBatalha: 0.84,
  v: { porte: 'idoso', cabelo: 'longo', sobrancelha: 'grossa', chapeu: 'faixa', rChapeu: R_B, manga: 'longa', rTorso: R_A, baixo: 'saia-longa', rBaixo: R_A, rBarra: R_B, cinto: R_D, pes: 'descalco',
    pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_D, propBraco: 38, propNoMapa: true },
}, (r) => {
  // manto roxo-jabuticaba que cai dos ombros até o chão, com barra de névoa
  r.add('tronco',
    blob([0.085, 0.34, 0.34], tom(R_B), { pos: [-0.14, 0.0, 0], deform: [taper('y', -0.34, 0.34, 1.2, 0.72)] }),
    blob([0.19, 0.075, 0.275], tom(R_B), { pos: [-0.01, 0.285, 0] }),
    blob([0.06, 0.13, 0.085], tom(R_B), { pos: [0.13, 0.17, 0.13] }), blob([0.06, 0.13, 0.085], tom(R_B), { pos: [0.13, 0.17, -0.13] }),
    blob([0.09, 0.035, 0.36], luz(R_A), { pos: [-0.165, -0.31, 0] }));
  // duas penas claras presas na faixa, caídas para trás (adereço discreto de quem conta histórias)
  r.add('cabeca', pena(0.25, 0.06, R_D, h(-0.12, 0.1, -0.27), [0, 0, 38], true), pena(0.2, 0.05, R_B, h(-0.19, 0.08, -0.25), [0, 0, 62], true));
  // cajado torto com voluta, cabaça luminosa e fiapos de neblina
  r.add('prop',
    tube([[0, -0.42, 0], [0.02, 0.1, 0], [-0.03, 0.5, 0], [0.03, 0.7, 0], [0.16, 0.76, 0], [0.25, 0.66, 0], [0.19, 0.55, 0], [0.11, 0.6, 0]], (t) => 0.032 - t * 0.008, tom(R_D), { seg: 30, radial: 8 }),
    blob([0.07, 0.075, 0.07], chapa(R_A), { pos: [0.13, 0.65, 0] }), blob([0.035, 0.04, 0.035], luz(R_A), { pos: [0.12, 0.67, -0.04] }),
    blob([0.04, 0.035, 0.04], chapa(R_A), { pos: [0.2, 0.86, 0] }), blob([0.028, 0.025, 0.028], luz(R_A), { pos: [0.13, 0.94, 0] }),
    blob([0.04, 0.05, 0.04], som(R_D), { pos: [0.0, 0.36, 0.03] }),
    pena(0.15, 0.04, R_B, [0, 0.42, -0.02], [-155, 0, 0], true));
  // neblina rasteira em volta dos pés
  r.bone('nevoa', 'root', [0, 0, 0]);
  for (const [x, z, e] of [[0.2, 0.2, 1], [-0.22, 0.12, 0.85], [0.08, -0.28, 1.1], [-0.2, -0.22, 0.8], [0.3, -0.06, 0.7]] as const)
    r.add('nevoa', blob([0.15 * e, 0.045 * e, 0.12 * e], chapa(R_A), { pos: [x, 0.03, z] }), blob([0.08 * e, 0.04 * e, 0.07 * e], luz(R_A), { pos: [x + 0.06, 0.06, z + 0.03] }));
}, ['nevoa']);

/* ---------------------------------------------------------------------------------------------- */
/* 4 · Domadora Pampa — rodeio (Comum/Ginga): chapéu campeiro de copa chata, lenço, laço armado      */
/* ---------------------------------------------------------------------------------------------- */
const CAMPO: Rampa = ['#2c4a40', '#487a52', '#8ab868'];
/** laço: elipse inclinada ~22° para a câmera de batalha, para ler como laçada e não como aro */
const LACO: V3[] = (() => {
  const c = [0.3, 0.2, -0.02], R = 0.25, u = [-0.77, 0, -0.64], cam = [0.64, 0, -0.77], t = (22 * Math.PI) / 180;
  const n = [cam[0] * Math.sin(t), Math.cos(t), cam[2] * Math.sin(t)];
  const v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
  const o: V3[] = [];
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; o.push([c[0] + R * (u[0] * Math.cos(a) + v[0] * Math.sin(a)), c[1] + R * (u[1] * Math.cos(a) + v[1] * Math.sin(a)), c[2] + R * (u[2] * Math.cos(a) + v[2] * Math.sin(a))]); }
  return o;
})();
const pampa = mestre({
  id: 'liga-pampa', pele: 'morena', cabelo: 'ruivo', a: 'cru', b: CAMPO, d: 'couro', iris: '#3a7a3a', ...M, zoomBatalha: 0.88, dxBatalha: 5, dyRetrato: 2,
  v: { cabelo: 'tranca', laco: R_B, manga: 'longa', rTorso: R_A, baixo: 'bombacha', rBaixo: R_B, pes: 'bota', rPes: R_D, cinto: R_D, sobre: 'colete', rSobre: R_D,
    pescoco: 'lenco', rPescoco: R_CAB, brinco: R_A, propBraco: 115 },
}, (r) => {
  // chapéu campeiro: copa baixa e chata, aba larga e reta, fita verde e barbicacho
  r.add('cabeca',
    lathe([[0.001, 0.32], [0.27, 0.32], [0.31, 0.29], [0.315, 0.09], [0.001, 0.09]], tom(R_D), { pos: h(0.0, 0, 0), scale: [1.05, 1, 1.1], seg: 24 }),
    lathe([[0.2, 0.115], [0.47, 0.105], [0.485, 0.085], [0.47, 0.07], [0.2, 0.075]], tom(R_D), { pos: h(-0.02, 0, 0), seg: 28 }),
    ring(0.318, 0.03, tom(R_B), { pos: h(-0.02, 0.15, 0), rot: [90, 0, 0], scale: [1, 1.08, 1] }),
    blob([0.03, 0.04, 0.04], luz(R_A), { pos: h(0.3, 0.16, 0) }));
  // guaiaca (cinturão largo) com fivela e boleadeiras
  r.add('corpo', blob([0.03, 0.05, 0.06], luz(R_A), { pos: [0.14, 0.07, 0] }));
  for (const [i, z] of [[0, -0.19], [1, -0.13]] as const) r.add('corpo', tube([[0.05, 0.05, -0.19], [0.06 + i * 0.05, -0.08, z - 0.02]], 0.012, som(R_D), { seg: 3, radial: 5 }), blob([0.04, 0.04, 0.04], luz(R_A), { pos: [0.06 + i * 0.05, -0.1, z - 0.02] }));
  // esporas
  for (const b of ['pernaD', 'pernaE']) r.add(b, blob([0.035, 0.03, 0.03], luz(R_A), { pos: [-0.075, -0.22, 0] }));
  // laço armado acima da cabeça
  r.add('prop',
    tube([[0, -0.02, 0], [0.03, 0.08, 0], [0.08, 0.12, 0.01]], 0.02, tom(R_D), { seg: 6, radial: 6 }),
    tube(LACO, 0.024, luz(R_D), { seg: 40, radial: 6, closed: true }),
    ring(0.07, 0.02, tom(R_D), { pos: [0.03, -0.06, 0], rot: [0, 90, 0] }));
});

/* ---------------------------------------------------------------------------------------------- */
/* 5 · Campeão Cacique Aracê ("aurora"): capa de alvorada até o chão, cocar baixo, bastão do sol      */
/* ---------------------------------------------------------------------------------------------- */
const ALVORADA: Rampa = ['#a2302e', '#ea6a36', '#ffbe5e'];
const ANIL_FUNDO: Rampa = ['#1a1c4a', '#2c387e', '#5a6aba'];
const arace = mestre({
  id: 'liga-arace', pele: 'morena', cabelo: 'preto', a: ALVORADA, b: ANIL_FUNDO, d: 'ouro', iris: '#c8861a', ...M, zoomBatalha: 0.86,
  v: { porte: 'forte', cabelo: 'longo', sobrancelha: 'grossa', chapeu: 'faixa', rChapeu: R_D, manga: 'sem', rTorso: R_B, baixo: 'calca', rBaixo: R_B, cinto: R_D, pes: 'sandalia', rPes: R_D,
    pescoco: 'colar', rPescoco: R_D, rPescocoFaixa: R_A, propBraco: 36, propNoMapa: true },
}, (r) => {
  // capa de alvorada: do ombro ao chão, mais larga embaixo, com barra de ouro; manto curto nos ombros
  r.add('tronco',
    blob([0.1, 0.32, 0.37], tom(R_A), { pos: [-0.15, 0.0, 0], deform: [taper('y', -0.32, 0.32, 1.22, 0.74)] }),
    blob([0.105, 0.035, 0.43], tom(R_D), { pos: [-0.17, -0.29, 0] }),
    blob([0.13, 0.08, 0.31], tom(R_A), { pos: [-0.09, 0.29, 0] }),
    blob([0.1, 0.06, 0.1], tom(R_A), { pos: [0, 0.3, 0.22] }), blob([0.1, 0.06, 0.1], tom(R_A), { pos: [0, 0.3, -0.22] }),
    blob([0.045, 0.055, 0.055], luz(R_D), { pos: [0.14, 0.2, 0] }));
  // faixa cruzada no peito e saiote curto sobre a calça
  r.add('tronco', tube([[0.0, 0.3, -0.17], [0.15, 0.16, 0.0], [0.05, 0.02, 0.19]], 0.032, tom(R_D), { seg: 10, radial: 8 }));
  r.add('corpo', lathe([[0.001, 0.07], [0.18, 0.06], [0.225, -0.09], [0.215, -0.11], [0.001, -0.09]], luz(R_B), { scale: [0.74, 1, 1], seg: 20 }),
    lathe([[0.215, -0.06], [0.232, -0.1], [0.222, -0.12], [0.205, -0.07]], tom(R_D), { scale: [0.75, 1, 1.01], seg: 20 }));
  // braçadeiras
  for (const b of ['bracoD', 'bracoE']) r.add(b, ring(0.062, 0.02, tom(R_D), { pos: [0, -0.07, 0], rot: [90, 0, 0] }));
  // cocar baixo: sete penas curtas em leque atrás da faixa, pontas escuras
  for (let i = -3; i <= 3; i++) {
    const a = i * 24, s = Math.sin((a * Math.PI) / 180), c = Math.cos((a * Math.PI) / 180), len = 0.15 - Math.abs(i) * 0.014;
    r.add('cabeca', pena(len, 0.052, R_A, h(-0.06, 0.03 + c * 0.24, s * 0.285), [a, 90, 0]),
      blob([0.025, 0.03, 0.035], som(R_B), { pos: h(-0.05, 0.03 + c * (0.24 + len), s * (0.285 + len)) }));
  }
  // bastão do sol nascente: disco de ouro com raios
  r.add('prop', tube([[0, -0.42, 0], [0, 0.56, 0]], 0.028, tom(R_B, { vies: 1 }), { seg: 4, radial: 8 }),
    blob([0.045, 0.11, 0.11], luz(R_D), { pos: [0, 0.68, 0] }), ring(0.11, 0.024, tom(R_D), { pos: [0, 0.68, 0], rot: [0, 90, 0] }),
    ring(0.04, 0.016, tom(R_A), { pos: [0, 0.5, 0], rot: [90, 0, 0] }), ring(0.04, 0.016, tom(R_A), { pos: [0, -0.1, 0], rot: [90, 0, 0] }));
  for (let i = 0; i < 7; i++) { const a = -90 + i * 30; r.add('prop', spike(0.07, 0.03, chapa(R_A), { pos: [0, 0.68 + Math.cos((a * Math.PI) / 180) * 0.13, Math.sin((a * Math.PI) / 180) * 0.13], rot: [a, 0, 0] })); }
  // porte de campeão: um pouco mais alto que os Mestres
  r.bones.escala.scale.multiplyScalar(1.06);
});

export const liga: PixModel[] = [mare, brasaViva, neblina, pampa, arace];
void R_PELE;
