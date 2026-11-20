/**
 * 181 · GALO-MANAÓ (Vento/Rio) — galo-da-serra do Encontro das Águas. Visitante lendário.
 * Traços: crista em leque que cobre o bico, como a do galo-da-serra · plumagem partida ao meio numa linha nítida:
 * o lado direito escuro como o rio Negro, o esquerdo cor de areia como o Solimões, sem se misturar ·
 * filamentos de seda nas asas · cauda em duas ondas, uma de cada água · anel de água bicolor girando aos pés ·
 * pose de dança de corte, asas entreabertas.
 */
import { criatura, ave, animsAve, blob, calota, pena, tube, ring, slab, par, m, lz, ly, qz, qy, D2R, type V2, type V3 } from './kits';

const paleta = {
  rampas: [
    ['#1a1420', '#3a2a36', '#6a4c50'], // 0 rio Negro: preto-chá
    ['#b5793e', '#e9bd76', '#fff0bf'], // 1 Solimões: areia barrenta
    ['#c8401c', '#ff7a1e', '#ffc04a'], // 2 laranja do galo-da-serra: crista, peito e filamentos
    ['#5a3a48', '#f4e8d8', '#ffffff'], // 3 linha de espuma do encontro, bico e pés (trio: sombra, marfim, branco)
  ] as [string, string, string][],
  contorno: '#150f1a',
  extras: { w: '#ffffff', p: '#150f1a', f: '#ff7a1e', a: '#ffc04a' },
};

/** A linha do encontro é um plano vertical girado GIRA graus em Y: contém a direção das câmeras de batalha (frente e costas),
 *  então a divisão corre pelo MEIO do sprite, de cima a baixo — metade escura, metade areia, lado a lado e sem se misturar.
 *  (Rolada só no flanco, como antes, a câmera de frente via quase só a areia.) */
const GIRA = 50;

/** Meia-casca: metade (+Z ou −Z) de um elipsoide, para pintar um lado só do corpo. */
const metade = (r: V3, lado: number, mat: ReturnType<typeof m>, pos: V3 = [0, 0, 0]) =>
  calota(r, mat, { de: 0, ate: 180, arco: 180, arco0: (lado > 0 ? 0 : 180) + GIRA, pos }); // o corte gira em Y; o elipsoide segue alinhado ao corpo

/** Leque da crista: meia-lua de pé no plano XY (o galo-da-serra esconde o bico atrás dela). */
function leque(R: number, mat: ReturnType<typeof m>, esp: number) {
  const pts: V2[] = [];
  for (let i = 0; i <= 12; i++) { const a = (-20 + (i / 12) * 200) * D2R; pts.push([Math.cos(a) * R, Math.sin(a) * R * 1.05]); }
  pts.push([-R * 0.5, -R * 0.2], [R * 0.5, -R * 0.2]);
  return slab(pts, esp, mat);
}

function build() {
  const co: V3 = [0.31, 0.28, 0.26], ca: V3 = [0.2, 0.19, 0.19];
  const { rig, ref } = ave({
    corpo: co, ergue: 34,
    pescoco: { len: 0.12, ang: 64, r: 0.15 },
    cabeca: ca,
    bico: { len: 0.11, r: 0.05, y: -0.2, achata: 0.9, inferior: 0.8 },
    asa: { len: 0.5, larg: 0.3, cai: 16, ponta: 0.55 },
    cauda: { len: 0.2, larg: 0.1, ang: -6, penas: 1, abre: 0 },
    pernas: { alt: 0.26, r: 0.04, z: 0.5, x: -0.02, dedo: 0.14 },
    olho: { r: 0.028, pos: [0.1, 0.0, 0.165] },
    rampas: { corpo: 0, cabeca: 0, asa: 0, asaPonta: 0, cauda: 0, bico: 3, perna: 3 },
  });
  // AS DUAS ÁGUAS: lado esquerdo (−Z, o que a câmera de frente vê) cor de areia; o direito fica escuro
  rig.add('tronco', metade([co[0] * 1.03, co[1] * 1.03, co[2] * 1.03], -1, m(1)));
  rig.add('cabeca', metade([ca[0] * 1.04, ca[1] * 1.04, ca[2] * 1.04], -1, m(1)));
  rig.add('pescoco', metade([0.17, 0.2, 0.17], -1, m(1), [0.02, 0.03, 0]));
  // linha nítida do encontro: filete claro no plano do meio, do bico à cauda
  const rm = (co[0] + co[2]) / 2 * 1.03;
  rig.add('tronco', ring(rm, 0.024, m.luz(3), { scale: [1, co[1] / rm, 1], rot: [0, GIRA, 0] }));
  rig.add('cabeca', ring(ca[0] * 1.045, 0.02, m.luz(3), { rot: [0, GIRA, 0] }));
  // asa DIREITA de areia e a esquerda escura (a asa da frente cobre o flanco: escura, ela mostra a metade rio Negro
  // ao lado do peito de areia — a divisão lê como metade/metade na câmera de batalha); perna esquerda de areia
  for (const o of ['asa_d', 'asa2_d']) rig.bones[o].traverse((x) => { const mesh = x as { isMesh?: boolean; material?: unknown }; if (mesh.isMesh) mesh.material = m(1); });
  rig.add('perna_e', blob([0.1, 0.13, 0.09], m(1), { pos: [0, -0.04, 0], seg: 12 })); rig.add('perna_d', blob([0.1, 0.13, 0.09], m(0), { pos: [0, -0.04, 0], seg: 12 }));
  // peito laranja em escudo estreito e CRISTA em leque cobrindo o bico
  rig.add('tronco', blob([0.1, 0.17, 0.12], m(2), { pos: [0.25, 0.0, 0], rot: [0, 0, -20], seg: 14 }));
  rig.bone('crista', 'cabeca', [0.1, 0.02, 0], [0, 0, -12]);
  const lq = leque(0.3, m(2), 0.07); lq.position.z = -0.035; rig.add('crista', lq);
  const borda = leque(0.33, m.sombra(2), 0.03); borda.position.z = -0.015; rig.add('crista', borda);
  rig.add('crista', blob([0.2, 0.2, 0.06], m.luz(2), { pos: [0.02, 0.1, 0], seg: 12 }));
  // asas entreabertas na dança, com filamentos de seda laranja
  par((l, s) => {
    rig.bones['asa_' + l].rotation.set(0, 32 * s * D2R, -30 * D2R);
    for (let i = 0; i < 3; i++) rig.add('asa_' + l, tube([[-0.14 - i * 0.1, 0.1, 0.07 * s], [-0.3 - i * 0.1, 0.02, 0.13 * s], [-0.44 - i * 0.1, -0.16, 0.12 * s]], (t) => 0.03 - t * 0.012, m.luz(2), { seg: 8, radial: 6 }));
    // CAUDA em duas ondas, uma de cada água
    rig.bone('onda_' + l, 'cauda1', [-0.06, 0, 0.08 * s], [0, -14 * s, 0]);
    const pts: V3[] = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([-t * 0.6, Math.sin(t * Math.PI * 1.6) * 0.14 + t * 0.2, Math.sin(t * Math.PI) * 0.1 * s]); }
    rig.add('onda_' + l, tube(pts, (t) => 0.085 - t * 0.04, s > 0 ? m(0) : m(1), { seg: 20, radial: 10 }), blob([0.09, 0.07, 0.05], s > 0 ? m.luz(0) : m.luz(1), { pos: pts[10], seg: 10 }), blob([0.05, 0.04, 0.055], m.luz(3), { pos: pts[10], seg: 8 }));
  });
  // ANEL de água bicolor aos pés: meia-volta escura, meia-volta barrenta, com crista de espuma
  rig.bone('agua', 'base', [0, 0.05, 0]);
  rig.add('agua', ring(0.5, 0.055, m(0), { rot: [90, 0, 0], arc: 180 }), ring(0.5, 0.055, m(1), { rot: [-90, 0, 0], arc: 180 }));
  for (const sx of [-1, 1]) rig.add('agua', blob([0.08, 0.06, 0.07], m.luz(3), { pos: [0.5 * sx, 0.03, 0], seg: 10 }));
  for (const [a, lado] of [[50, 1], [130, 1], [230, -1], [310, -1]] as const) rig.add('agua', blob([0.07, 0.11, 0.05], lado > 0 ? m.luz(0) : m.luz(1), { pos: [Math.cos(a * D2R) * 0.5, 0.07, Math.sin(a * D2R) * 0.5], rot: [0, -a, 20], seg: 10 }));
  void ref;
  return rig;
}

const anims = animsAve({ u: 1.1, hPerna: 0.26, mole: 0.8 }, {
  idle: { crista: lz([0, 3, 6, 2]), onda_d: lz([0, 6, 10, 4]), onda_e: lz([0, -5, -9, -3]), agua: ly([0, 6, 12, 6]) },
  fisico: { crista: qz([6, 12, -16, -6, 0]), onda_d: qz([8, 14, -18, -6, 0]), onda_e: qz([8, 14, -18, -6, 0]) },
  especial: { crista: qz([0, 8, 12, -14, -4, 0]), onda_d: qz([0, 14, 20, -26, -8, 0]), onda_e: qz([0, 14, 20, -26, -8, 0]), agua: qy([0, 30, 60, 120, 160, 180]) },
  dano: { crista: qz([14, 6, 0]) },
  desmaio: { onda_d: qz([0, -6, -14, -22, -20]), onda_e: qz([0, -6, -14, -22, -20]) },
  andar: { agua: ly([0, 10, 20, 10]) },
});

export const galoManao = criatura({
  num: 181, id: 'galo-manao', nome: 'Galo-Manaó', porte: 'L', estagio: 'lendario', paleta, build, anims,
  olho: {
    frente: ['.ppp.', 'pwwap', 'pwpap', '.ppp.'],
    fechado: ['.....', 'p...p', '.ppp.', '.....'],
    mapa: ['w', 'p'],
  },
});
