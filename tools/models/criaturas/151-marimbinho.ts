/**
 * 151 · MARIMBINHO (Inseto/Veneno) — marimbondo filhote que ainda não sabe construir e mora num chapéu de palha esquecido na cerca.
 * Traços únicos: CHAPÉU DE PALHA na cabeça · cintura fininha de vespa · abdômen em gota de cintas amarelas ·
 * ferrãozinho com gota roxa de veneno · asas âmbar estreitas · pernas compridas penduradas.
 * O construtor `vespa` é reaproveitado pelo Marimbondão.
 */
import { criatura, inseto, animsInseto, blob, lathe, ring, spike, segmento, par, m, ls, lz, qz, qp, type Rig, type V3 } from './kits';

export const paletaVespa = {
  rampas: [
    ['#681c2c', '#ba422c', '#f48c52'], // 0 castanho-avermelhado
    ['#b4860e', '#f8d234', '#fffaa4'], // 1 amarelo das cintas e da palha
    ['#aa6630', '#eeb468', '#ffe8ba'], // 2 asas âmbar
    ['#562a98', '#a662e8', '#e6c8ff'], // 3 roxo-veneno
  ] as [string, string, string][],
  contorno: '#2a1228',
  extras: { w: '#ffffff', p: '#22101e', f: '#ba422c', a: '#f8d234' },
};

export interface VespaP { k: number; flutua: number; /** abdômen [comp, alt, larg] e comprimento da cintura */ abd: V3; cintura: number; ferrao: number; asa: [number, number] }

/** Vespa: inseto voador do kit com o abdômen refeito (cintura fina + gota de cintas + ferrão num osso). */
export function vespa(p: VespaP): Rig {
  const k = p.k, [ax, ay, az] = p.abd;
  const { rig } = inseto({
    torax: [0.14 * k, 0.13 * k, 0.13 * k], abdomen: [0.02, 0.02, 0.02], cabeca: [0.13 * k, 0.13 * k, 0.15 * k], alt: 0.14 * k, flutua: p.flutua, caiAbdomen: 40,
    patas: { abre: 0.1 * k, r: 0.022 * k, joelho: 0.03 * k }, antenas: { len: 0.17 * k, r: 0.016 * k, abre: 30 },
    asas: { len: p.asa[0], larg: p.asa[1], pares: 1 },
    olho: { r: 0.032 * Math.min(k, 1.15), pos: [0.14 * k, 0.02 * k, 0.105 * k] },
    rampas: { torax: 0, abdomen: 0, cabeca: 0, patas: 1, antenas: 0, asas: 2 },
  });
  // cintura fininha e abdômen em gota, com duas cintas amarelas
  rig.add('abdomen', segmento([0, 0, 0], [-p.cintura, 0, 0], 0.035 * k, 0.035 * k, m.sombra(0)));
  const c0 = -p.cintura - ax * 0.8;
  rig.add('abdomen', lathe([[0.001, ax], [ay * 0.6, ax * 0.7], [ay, ax * 0.1], [ay * 0.8, -ax * 0.5], [ay * 0.3, -ax * 0.95], [0.001, -ax * 1.05]], m(0), { seg: 16, rot: [0, 0, -90], pos: [c0, 0, 0], deform: [(v) => { v.z *= az / ay; }] }));
  for (const [x, r] of [[0.25, 1.03], [-0.3, 0.92]] as const) rig.add('abdomen', blob([ax * 0.13, ay * r, az * r], m(1), { pos: [c0 + ax * x, 0, 0], seg: 14, castShadow: false }));
  rig.bone('ferrao', 'abdomen', [c0 - ax * 1.0, 0, 0]);
  rig.add('ferrao', spike(p.ferrao, p.ferrao * 0.3, m.sombra(0), { rot: [0, 0, 90] }), blob([p.ferrao * 0.36, p.ferrao * 0.44, p.ferrao * 0.36], m.plano(3), { pos: [-p.ferrao * 1.05, -p.ferrao * 0.1, 0], seg: 8 }));
  // máscara amarela do rosto e mandíbulas
  rig.add('cabeca', blob([0.06 * k, 0.085 * k, 0.11 * k], m(1), { pos: [0.165 * k, -0.035 * k, 0], seg: 12 }));
  par((l, s) => {
    rig.add('cabeca', blob([0.03 * k, 0.035 * k, 0.03 * k], m.sombra(0), { pos: [0.2 * k, -0.1 * k, 0.04 * k * s], seg: 8 }));
    // ombro amarelo e asas estreitas mais para cima
    rig.add('corpo', blob([0.05 * k, 0.05 * k, 0.04 * k], m(1), { pos: [0.05 * k, 0.09 * k, 0.1 * k * s], seg: 8 }));
    rig.bones['asa_' + l].rotation.set(-0.5 * s, 0.5 * s, -0.25);
  });
  return rig;
}

/** Chapéu de palha: copa, aba e fita, num osso (para balançar). `aba` = raio da aba. */
export function chapeu(rig: Rig, pos: V3, copa: number, aba: number, tomba = -10) {
  rig.bone('chapeu', 'cabeca', pos, [0, 0, tomba]);
  rig.add('chapeu', lathe([[aba, 0], [aba * 0.96, 0.025], [copa * 1.1, 0.03], [copa, 0.05], [copa * 0.92, copa * 0.9], [copa * 0.6, copa * 1.15], [0.001, copa * 1.2]], m(1), { seg: 18 }),
    ring(copa * 1.02, copa * 0.16, m(0), { pos: [0, copa * 0.3, 0], rot: [90, 0, 0] }), ring(aba * 0.98, 0.018, m.sombra(1), { rot: [90, 0, 0], pos: [0, 0.012, 0] }));
  // palhinha solta espetada
  rig.add('chapeu', spike(copa * 0.9, 0.016, m.luz(1), { pos: [-copa * 0.5, copa * 0.9, 0.02], rot: [0, 0, 40] }));
}

function build() {
  const rig = vespa({ k: 1, flutua: 0.3, abd: [0.17, 0.12, 0.12], cintura: 0.07, ferrao: 0.09, asa: [0.3, 0.13] });
  chapeu(rig, [0.07, 0.11, 0], 0.11, 0.22);
  return rig;
}

/** pousa em vez de despencar: o abdômen pendurado não atravessa o chão */
export const pousa = (f: number) => ({ corpo: qp([[0, 0.01, 0], [0, -f * 0.15, 0], [0, -f * 0.4, 0], [0, -f * 0.62, 0], [0, -f * 0.6, 0]]), abdomen: qz([0, -8, -18, -30, -28]) });
export const gotaVeneno = { idle: { ferrao: ls([1, 1.08, 1.16, 1.05]) } };
const anims = animsInseto({ u: 0.5, alt: 0.14, flutua: 0.3, asas: true, mole: 1.2 }, {
  idle: { ...gotaVeneno.idle, chapeu: lz([0, 3, 6, 2]), abdomen: lz([0, 4, 8, 3]) },
  dano: { chapeu: [...qz([24, 8, 0]), { t: 0, p: [0, 0.06, 0] }, { t: 1, p: [0, 0, 0] }] },
  desmaio: pousa(0.3),
  fisico: { abdomen: qz([-8, -18, 34, 12, 0]), chapeu: qz([6, 12, -10, -4, 0]) },
});

export const marimbinho = criatura({
  num: 151, id: 'marimbinho', nome: 'Marimbinho', porte: 'P', estagio: 'basico', paleta: paletaVespa, build, anims,
  olho: {
    frente: ['.pp.', 'pwpp', 'pppp', '.pp.'],
    fechado: ['ffff', 'pffp', '.pp.', 'ffff'],
    mapa: ['p', 'p'],
  },
});
