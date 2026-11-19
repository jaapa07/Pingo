/**
 * Base dos kits de anatomia: esqueleto padrão, peças paramétricas reutilizáveis e utilitários.
 *
 * Hierarquia comum a TODOS os kits (os nomes dos ossos são o contrato das bibliotecas de animação):
 *   root → base (no chão: squash/stretch, investida, tombo) → corpo (centro do tronco) → resto.
 * Convenções do pipeline: o modelo olha para +X, +Y é para cima, lado D = +Z, origem = apoio no chão.
 */
import { Rig, blob, limb, olho, tom, THREE, D2R, applyDeform, type V3, type Deformer, type PartOpts } from '../../../render/sculpt';

export type Mat = THREE.Material;
export type Obj = THREE.Object3D;
export const LADOS = [['d', 1], ['e', -1]] as const;
export type Lado = 'd' | 'e';

/** O que todo kit devolve: o rig pronto + pontos de referência para a criatura pendurar os traços únicos. */
export interface Kit<R extends string = string> {
  rig: Rig;
  /** pontos úteis no espaço LOCAL do osso indicado no nome (ex.: ref.testa está no espaço de `cabeca`) */
  ref: Record<R, V3>;
}

/** Cria o rig com os dois ossos comuns: `base` (chão) e `corpo` (centro do tronco, a `alt` do chão). */
export function novoRig(altCorpo: number, xCorpo = 0): Rig {
  const r = new Rig('root');
  r.bone('base', 'root', [0, 0, 0]);
  r.bone('corpo', 'base', [xCorpo, altCorpo, 0]);
  return r;
}

/** Cápsula afinada entre dois pontos (pernas, pescoços, dedos, hastes). r0 em `a`, r1 em `b`. */
export function segmento(a: V3, b: V3, r0: number, r1: number, mat: Mat, deform: Deformer[] = []) {
  const va = new THREE.Vector3(...a), d = new THREE.Vector3(...b).sub(va);
  const m = limb(Math.max(d.length(), 0.001), r0, r1, mat, { pos: a, deform });
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize());
  return m;
}

/**
 * Calota: faixa de casca de elipsoide entre dois ângulos polares (graus a partir do polo +Y local).
 * Serve para manchas limpas por cima de um blob: barriga, sela, máscara, capuz, colete.
 * Use semi-eixos ~4–8% maiores que os do blob de baixo e gire com `rot` para apontar o polo.
 */
export function calota(r: V3, mat: Mat, o: PartOpts & { de?: number; ate?: number; arco?: number; arco0?: number; seg?: number } = {}) {
  const seg = o.seg ?? 28;
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.6), (o.arco0 ?? 0) * D2R, (o.arco ?? 360) * D2R, (o.de ?? 0) * D2R, ((o.ate ?? 70) - (o.de ?? 0)) * D2R);
  g.scale(r[0], r[1], r[2]);
  applyDeform(g, o.deform ?? []);
  const m = new THREE.Mesh(g, mat);
  if (o.pos) m.position.set(...o.pos);
  if (o.rot) m.rotation.set(o.rot[0] * D2R, o.rot[1] * D2R, o.rot[2] * D2R);
  if (o.scale !== undefined) { if (typeof o.scale === 'number') m.scale.setScalar(o.scale); else m.scale.set(...o.scale); }
  m.castShadow = false; m.receiveShadow = true;
  return m;
}

/** Espelha um ponto/rotação para o lado esquerdo (−Z). */
export const espPos = (p: V3, s: number): V3 => [p[0], p[1], p[2] * s];
export const espRot = (r: V3, s: number): V3 => [r[0] * s, r[1] * s, r[2]];

/** Chama `fn` para os dois lados: ('d', +1) e ('e', −1). */
export function par(fn: (lado: Lado, s: number) => void) { for (const [l, s] of LADOS) fn(l, s); }

/**
 * Marcadores dos dois olhos num osso. `pos` é o olho DIREITO (+Z); o esquerdo é espelhado.
 * Cada marcador fica num osso próprio (`olho_d`, `olho_e`): a miniatura de mapa os amplia para o
 * carimbo aparecer também em 24 px, e a criatura pode animá-los (arregalar no dano, por exemplo).
 */
export function olhos(rig: Rig, osso: string, r: number, pos: V3) {
  rig.bone('olho_d', osso, pos); rig.bone('olho_e', osso, [pos[0], pos[1], -pos[2]]);
  rig.add('olho_d', olho('D', r, [0, 0, 0])); rig.add('olho_e', olho('E', r, [0, 0, 0]));
}

export interface PernaP {
  /** altura total do quadril até o chão (o pé encosta em y = −alt no espaço do osso) */ alt: number;
  /** raios: quadril, joelho, tornozelo */ r0: number; r1: number; r2: number;
  /** dobra do joelho em graus (+ = joelho para a frente, − = jarrete para trás) */ dobra?: number;
  /** fração da coxa no comprimento da perna (padrão 0.5) */ coxa?: number;
  /** pé: semi-eixos [comp, alt, larg] e avanço em X; null = sem pé */ pe?: { r: V3; x?: number } | null;
  mCoxa: Mat; mCanela: Mat; mPe?: Mat;
  /** nome do segundo osso (padrão: `canela` + sufixo do primeiro) */ segundo?: string;
}

/**
 * Perna de 2 segmentos: osso `<nome>` (quadril/ombro) → osso `canela<sufixo>` (joelho); o pé fica preso
 * à canela. Ex.: `perna_fd` cria também `canela_fd`. O pé cai exatamente embaixo do quadril.
 */
export function perna(rig: Rig, nome: string, pai: string, pos: V3, p: PernaP) {
  const canela = p.segundo ?? 'canela' + nome.replace(/^[a-z]+/, '');
  const d = ((p.dobra ?? 0) * D2R) / 2;
  const hPe = p.pe ? p.pe.r[1] : p.r2;
  const L = (p.alt - hPe) / Math.cos(d), fr = p.coxa ?? 0.5;
  // coxa inclinada +d, canela −d (ponderadas para o pé cair embaixo do quadril)
  const j: V3 = [Math.sin(d) * L * fr * (1 - fr) * 2, -Math.cos(d) * L * fr, 0];
  const f: V3 = [-j[0], -Math.cos(d) * L * (1 - fr), 0];
  rig.bone(nome, pai, pos);
  rig.add(nome, segmento([0, 0, 0], j, p.r0, p.r1, p.mCoxa));
  rig.bone(canela, nome, j);
  rig.add(canela, segmento([0, 0, 0], f, p.r1, p.r2, p.mCanela));
  if (p.pe) rig.add(canela, blob(p.pe.r, p.mPe ?? p.mCanela, { pos: [f[0] + (p.pe.x ?? 0), f[1], 0], seg: 16 }));
  return canela;
}

/**
 * Membro de 2 segmentos por pontos: osso `nome` em `pos`, primeiro segmento até `j` (joelho/cotovelo,
 * relativo a `pos`), osso `nome2` em `j`, segundo segmento até `f` (relativo a `j`). Para patas de inseto,
 * aranha, lagarto, braços compridos: qualquer membro que não desça reto.
 */
export function membro2(rig: Rig, nome: string, nome2: string, pai: string, pos: V3, j: V3, f: V3, r: [number, number, number], m1: Mat, m2: Mat = m1) {
  rig.bone(nome, pai, pos);
  rig.add(nome, segmento([0, 0, 0], j, r[0], r[1], m1));
  rig.bone(nome2, nome, j);
  rig.add(nome2, segmento([0, 0, 0], f, r[1], r[2], m2));
  return nome2;
}

export interface CaudaP {
  /** número de ossos (cauda1..caudaN) */ segs: number;
  /** comprimento total */ len: number;
  /** raio na base e na ponta */ r0: number; r1: number;
  /** ângulo inicial acima da horizontal (graus; a cauda sai para −X) */ ang?: number;
  /** curvatura por segmento (graus; + enrola para cima) */ curva?: number;
  mat: Mat;
  /** material da ponta (último segmento), se diferente */ matPonta?: Mat;
  prefixo?: string;
}

/** Cauda em cadeia `cauda1..N` saindo para −X. Devolve o nome do último osso e o comprimento do segmento. */
export function cauda(rig: Rig, pai: string, pos: V3, p: CaudaP) {
  const px = p.prefixo ?? 'cauda';
  const sl = p.len / p.segs;
  let anterior = pai;
  for (let i = 1; i <= p.segs; i++) {
    const nome = px + i;
    rig.bone(nome, anterior, i === 1 ? pos : [-sl, 0, 0], [0, 0, i === 1 ? -(p.ang ?? 0) : -(p.curva ?? 0)]);
    const ra = p.r0 + (p.r1 - p.r0) * ((i - 1) / p.segs), rb = p.r0 + (p.r1 - p.r0) * (i / p.segs);
    rig.add(nome, segmento([0, 0, 0], [-sl, 0, 0], ra, rb, i === p.segs && p.matPonta ? p.matPonta : p.mat));
    anterior = nome;
  }
  return { ultimo: anterior, seg: sl };
}

/** Atalho de materiais: m(3) = tom(3); m.plano(3); m.luz(3); m.sombra(3). */
export const m = Object.assign((i: number) => tom(i), {
  plano: (i: number) => tom(i, { plano: true }),
  luz: (i: number) => tom(i, { vies: 1 }),
  sombra: (i: number) => tom(i, { vies: -1 }),
});

export { Rig, tom, THREE, D2R };
export type { V3, Deformer };
