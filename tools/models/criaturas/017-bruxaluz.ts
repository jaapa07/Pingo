/**
 * 017 · BRUXALUZ (Inseto/Encanto) — mariposa-bruxa de olhos nas asas. Estágio final.
 * Mantém da linha: ameixa-castanho, dourado e os "olhos de coruja" (agora enormes, nas asas).
 * Cresce: quatro asas recortadas abertas em leque com faixa lilás em ziguezague · gola de pelúcia creme ·
 * antenas de pluma · abdômen de anéis · poeira encantada lilás orbitando.
 * Anatomia: kit do inseto voador; as asas são peças próprias nos ossos asa_d/asa_e.
 */
import { criatura, inseto, animsInseto, blob, slab, tufo, par, m, lz, qz, lp, ls, type V2, type V3 } from './kits';
import { paletaBruxa } from './015-lagartim';

const paleta = {
  ...paletaBruxa, extras: { w: '#ffffff', p: '#1e1226', f: '#eedccb', a: '#f0b83a' },
  rampas: [paletaBruxa.rampas[0], paletaBruxa.rampas[1],
    ['#6e4e96', '#ab86d2', '#e6ccf6'], // 2 lilás da faixa e da poeira encantada
    ['#b89a94', '#eedccb', '#fffaf0'], // 3 pelúcia creme
  ] as [string, string, string][],
};

const TOMBA = 0.32; // quanto a asa deita para trás
/** placa de asa: contorno em [envergadura, altura] → espaço do osso (Z = envergadura, deitada para trás) */
export const placaAsa = (pts: V2[], s: number, mat: ReturnType<typeof m>, tomba: number, esp = 0.035) =>
  slab(pts, esp, mat, { deform: [(p) => { const x = p.x, z = p.z; p.x = z - p.y * tomba; p.z = x * s; }] });
const placa = (pts: V2[], s: number, mat: ReturnType<typeof m>) => placaAsa(pts, s, mat, TOMBA);
/** ponto sobre a asa: face = +1 frente, −1 costas */
const naAsa = (env: number, alt: number, s: number, face: number): V3 => [-alt * TOMBA + 0.03 * face, alt, env * s];

function build() {
  const { rig, ref } = inseto({
    torax: [0.15, 0.14, 0.14], abdomen: [0.19, 0.11, 0.11], cabeca: [0.12, 0.12, 0.13], alt: 0.2, flutua: 0.24, caiAbdomen: 38,
    patas: { abre: 0.1, r: 0.022 }, antenas: { len: 0.2, r: 0.016, abre: 30 },
    olho: { r: 0.034, pos: [0.115, 0.03, 0.095] },
    rampas: { torax: 3, abdomen: 0, cabeca: 3, patas: 0, antenas: 3 },
  });
  // gola de pelúcia e anéis do abdômen
  rig.add('corpo', blob([0.12, 0.15, 0.18], m.luz(3), { pos: [0.06, 0.01, 0], seg: 18 }));
  for (const x of [-0.1, -0.2, -0.3]) rig.add('abdomen', blob([0.03, 0.105 + x * 0.1, 0.105 + x * 0.1], m(1), { pos: [x, 0, 0], seg: 12 }));
  // antenas de pluma
  par((l) => rig.add('antena_' + l, tufo(3, 0.13, 0.03, m(3), { pos: [0.1, 0.11, 0], rot: [0, 0, -40], abre: 34 })));
  // ASAS: anterior grande e posterior recortada, com olho de coruja e faixa lilás nas duas faces
  par((l, s) => {
    rig.bone('asa_' + l, 'corpo', [-0.03, 0.07, 0.09 * s]);
    rig.add('asa_' + l,
      placa([[0, -0.02], [0.1, 0.3], [0.36, 0.56], [0.62, 0.6], [0.72, 0.5], [0.66, 0.34], [0.7, 0.2], [0.52, 0.06], [0.24, -0.04]], s, m(0)),
      placa([[0.02, 0.04], [0.3, 0.02], [0.5, -0.06], [0.56, -0.2], [0.44, -0.26], [0.42, -0.4], [0.28, -0.36], [0.2, -0.46], [0.06, -0.2]], s, m.sombra(0)));
    for (const face of [1, -1]) {
      // olho de coruja
      const c = naAsa(0.45, 0.36, s, face);
      rig.add('asa_' + l,
        blob([0.02, 0.12, 0.12], m.plano(1), { pos: c, seg: 16, castShadow: false }),
        blob([0.02, 0.07, 0.07], m.sombra(0), { pos: [c[0] + 0.012 * face, c[1], c[2]], seg: 12, castShadow: false }),
        blob([0.02, 0.028, 0.028], m.luz(3), { pos: [c[0] + 0.02 * face, c[1] + 0.03, c[2] - 0.03 * s], seg: 8, castShadow: false }));
      // faixa lilás em ziguezague + olhinho da asa de trás
      for (const [e, a, r] of [[0.14, 0.2, 0.05], [0.25, 0.12, 0.055], [0.38, 0.14, 0.05], [0.5, 0.1, 0.045], [0.22, -0.14, 0.05], [0.36, -0.2, 0.05]] as const)
        rig.add('asa_' + l, blob([0.018, r, r * 1.3], m.plano(2), { pos: naAsa(e, a, s, face), seg: 10, castShadow: false }));
      rig.add('asa_' + l, blob([0.018, 0.045, 0.045], m.plano(1), { pos: naAsa(0.4, -0.08, s, face), seg: 10, castShadow: false }));
    }
  });
  // poeira encantada
  const po: [string, V3, number][] = [['po1', [0.3, 0.42, -0.5], 0.05], ['po2', [0.25, -0.3, 0.45], 0.04], ['po3', [-0.2, 0.62, 0.2], 0.04]];
  for (const [nome, pos, r] of po) { rig.bone(nome, 'corpo', pos); rig.add(nome, blob([r, r, r], m.luz(2), { seg: 10 }), blob([r * 0.45, r * 0.45, r * 0.45], m.luz(3), { pos: [-r * 0.2, r * 0.3, -r * 0.3], seg: 8 })); }
  void ref;
  return rig;
}

const sobe = (a: number): V3[] => [[0, 0, 0], [0, a, 0], [0, a * 1.6, 0], [0, a * 0.6, 0]];
const pisca = (i: number) => { const v = [1, 1.3, 0.7, 1.1]; return ls([...v.slice(i), ...v.slice(0, i)]); };
const anims = animsInseto({ u: 0.9, alt: 0.2, flutua: 0.24, asas: true, mole: 0.8, mapa: { comp: 1, larg: 1, frontal: 1 } }, {
  todas: { po1: pisca(0), po2: pisca(1), po3: pisca(2) },
  idle: { po1: [...pisca(0), ...lp(sobe(0.04))], po2: [...pisca(1), ...lp(sobe(-0.03))], po3: [...pisca(2), ...lp(sobe(0.03))], abdomen: lz([0, 4, 8, 3]) },
  especial: { abdomen: qz([4, 10, 12, -22, -8, 0]) },
});
// 3ª rodada: o bater de asas do kit (±60°) no especial e no físico apertava o enquadre e a mariposa ficava a 64% da célula;
// na batalha as asas batem com metade da abertura
for (const v of [anims.frente, anims.costas]) for (const n of ['ataque-especial', 'ataque-fisico'] as const) {
  const a = v[n];
  v[n] = { ...a, keys: Object.fromEntries(Object.entries(a.keys).map(([o, ks]) => [o, /asa|elitro/.test(o) ? ks.map((q) => (q.r ? { ...q, r: q.r.map((g) => g * 0.5) as [number, number, number] } : q)) : ks])) };
}
// e no desmaio ela pousa no chão em vez de afundar abaixo dele (a queda do kit passava da altura do voo)
for (const v of [anims.frente, anims.costas]) {
  const a = v.desmaio;
  v.desmaio = { ...a, keys: { ...a.keys, corpo: a.keys.corpo.map((q) => (q.p ? { ...q, p: q.p.map((x) => x * 0.6) as [number, number, number] } : q)) } };
}

export const bruxaluz = criatura({
  num: 17, id: 'bruxaluz', nome: 'Bruxaluz', porte: 'M', estagio: 'final', paleta, build, anims,
  olho: {
    frente: ['.ppp.', 'ppwpp', 'paapp', 'ppppp', '.ppp.'],
    fechado: ['fffff', 'fffff', 'pfffp', '.ppp.', 'fffff'],
    mapa: ['a', 'p'],
  },
});
