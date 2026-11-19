/**
 * criatura({...}) → PixModel com as 3 vistas do contrato (frente, costas, mapa), células e câmeras
 * padrão por porte, `minMalhas` por estágio e ENQUADRAMENTO AUTOMÁTICO que enche a célula.
 *
 * O enquadramento é calculado dentro de build(): mede a silhueta em repouso e em todos os quadros de
 * todas as animações de cada vista e escolhe `altura`/`pivot` para que
 *   - a pose de repouso ocupe a célula menos a margem de respiro (≈ 10% de cada lado), e
 *   - nenhum quadro encoste a menos de 2 px da borda (sobra o 1 px do contorno).
 * No mapa o X do pivô é fixo no centro para o sprite não "pular" ao trocar de direção.
 */
import { THREE, type Rig } from '../../../render/sculpt';
import { storeRest, resetPose, applyAnim, frameT, type AnimSet } from '../../../render/anim';
import type { PixModel, Paleta, Vista, Retoque } from '../../../render/types';
import type { AnimsCriatura } from './animacao';

export type Porte = 'P' | 'M' | 'G' | 'L';
export type Estagio = 'basico' | 'medio' | 'final' | 'lendario';

export const CELULAS: Record<Porte, { frente: number; costas: number; mapa: number }> = {
  P: { frente: 64, costas: 64, mapa: 24 },
  M: { frente: 80, costas: 80, mapa: 24 },
  G: { frente: 96, costas: 80, mapa: 24 },
  L: { frente: 96, costas: 96, mapa: 32 },
};
export const MIN_MALHAS: Record<Estagio, number> = { basico: 25, medio: 25, final: 40, lendario: 60 };
export const CAMERAS = { frente: { yaw: -50, pitch: 12 }, costas: { yaw: 140, pitch: 22 }, mapa: { yaw: 0, pitch: 40 } };

const CONTRATO: Record<'frente' | 'costas' | 'mapa', Record<string, [number, number]>> = {
  frente: { entrada: [4, 6], idle: [4, 6], 'ataque-fisico': [4, 6], 'ataque-especial': [4, 6], dano: [2, 3], desmaio: [4, 5], status: [2, 4] },
  costas: { idle: [4, 6], 'ataque-fisico': [4, 6], 'ataque-especial': [4, 6], dano: [2, 3], desmaio: [4, 5] },
  mapa: { 'andar-s': [4, 4], 'andar-l': [4, 4], 'andar-n': [4, 4], 'andar-o': [4, 4], 'idle-s': [2, 2] },
};

export interface Ajuste {
  /** multiplica o tamanho calculado (ex.: 0.92 para deixar mais ar) */ zoom?: number;
  /** desloca o pivô em px nativos */ dx?: number; dy?: number;
  /** ignora o cálculo e fixa os valores do contrato à mão */ altura?: number; pivot?: [number, number];
}

export interface CriaturaDef {
  /** número no Diário de Campo (1..180) */ num: number;
  /** slug do nome, sem acento (vira a pasta do sprite) */ id: string;
  nome: string;
  porte: Porte;
  estagio: Estagio;
  paleta: Paleta;
  /** carimbos de olho desenhados à mão, olhando para a DIREITA da tela (o pipeline espelha) */
  olho: { frente: string[]; fechado: string[]; costas?: string[]; costasFechado?: string[]; mapa?: string[] };
  build(): Rig;
  anims: AnimsCriatura;
  enquadre?: { frente?: Ajuste; costas?: Ajuste; mapa?: Ajuste };
  retoques?: Retoque[];
  limiares?: [number, number];
}

export interface InfoVista { escala: number; repouso: [number, number]; apertadoPorAnim: boolean; /** animação de maior silhueta */ maisLarga: string; olhoPx: number }
export interface PixCriatura extends PixModel {
  num: number; nome: string; porte: Porte; estagio: Estagio;
  /** preenchido depois do primeiro build(): medidas do enquadramento (usado por kits/checar.ts) */
  info?: { malhas: number; vistas: Record<string, InfoVista> };
}

interface Caixa { u0: number; u1: number; v0: number; v1: number }
const vazia = (): Caixa => ({ u0: Infinity, u1: -Infinity, v0: Infinity, v1: -Infinity });
const une = (a: Caixa, b: Caixa) => { a.u0 = Math.min(a.u0, b.u0); a.u1 = Math.max(a.u1, b.u1); a.v0 = Math.min(a.v0, b.v0); a.v1 = Math.max(a.v1, b.v1); };

function eixos(yaw: number, pitch: number) {
  const a = (yaw * Math.PI) / 180, p = (pitch * Math.PI) / 180;
  const z = new THREE.Vector3(Math.cos(a) * Math.cos(p), Math.sin(p), Math.sin(a) * Math.cos(p));
  const x = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x);
  return { x, y };
}

function malhasDe(rig: Rig) {
  const ms: { mesh: THREE.Mesh; pos: THREE.BufferAttribute; olho: boolean }[] = [];
  rig.root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const id = ((mesh.material as THREE.Material).userData.idMat as THREE.MeshBasicMaterial | undefined)?.color.r ?? 0;
    ms.push({ mesh, pos: mesh.geometry.getAttribute('position') as THREE.BufferAttribute, olho: Math.round((id * 255) / 8) - 1 >= 30 });
  });
  return ms;
}

function caixa(ms: ReturnType<typeof malhasDe>, ex: ReturnType<typeof eixos>, passo: number): Caixa {
  const c = vazia(), v = new THREE.Vector3();
  for (const { mesh, pos } of ms) {
    for (let i = 0; i < pos.count; i += passo) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      const u = v.dot(ex.x), w = v.dot(ex.y);
      if (u < c.u0) c.u0 = u; if (u > c.u1) c.u1 = u; if (w < c.v0) c.v0 = w; if (w > c.v1) c.v1 = w;
    }
  }
  return c;
}

function enquadrar(rig: Rig, ms: ReturnType<typeof malhasDe>, v: Vista, modo: 'batalha' | 'mapa', aj: Ajuste = {}): InfoVista {
  const [cw, ch] = v.cell;
  const R = vazia(), U = vazia();
  resetPose(rig.bones);
  rig.root.updateMatrixWorld(true);
  const cams = new Map<string, ReturnType<typeof eixos>>();
  for (const an of Object.values(v.anims)) { const y = an.yaw ?? v.yaw, p = an.pitch ?? v.pitch; cams.set(y + ':' + p, eixos(y, p)); }
  for (const ex of cams.values()) une(R, caixa(ms, ex, 1));
  let pior = '', piorArea = 0;
  for (const [nome, an] of Object.entries(v.anims)) {
    const ex = eixos(an.yaw ?? v.yaw, an.pitch ?? v.pitch), A = vazia();
    for (let f = 0; f < an.frames; f++) {
      applyAnim(rig.bones, an, frameT(an, f));
      rig.root.updateMatrixWorld(true);
      une(A, caixa(ms, ex, 3));
    }
    const folga = Math.max((A.u1 - A.u0) / cw, (A.v1 - Math.min(A.v0, 0)) / ch);
    if (folga > piorArea) { piorArea = folga; pior = nome; }
    une(U, A);
  }
  resetPose(rig.bones);
  rig.root.updateMatrixWorld(true);
  une(U, R);
  const raioOlho = Math.max(0, ...ms.filter((x) => x.olho).map((x) => { x.mesh.geometry.computeBoundingSphere(); return x.mesh.geometry.boundingSphere!.radius; }));
  let s: number, px: number, py: number, apertado = false;
  if (modo === 'batalha') {
    const m = Math.round(cw / 10); // respiro da pose de repouso
    const rv0 = Math.min(R.v0, 0);
    const s1 = Math.min((cw - 2 * m) / (R.u1 - R.u0), (ch - 2 * m) / (R.v1 - rv0));
    const s2 = Math.min((cw - 4) / (U.u1 - U.u0), (ch - 4) / (U.v1 - Math.min(U.v0, 0)));
    apertado = s2 < s1 * 0.999;
    s = Math.min(s1, s2) * (aj.zoom ?? 1);
    px = cw / 2 - (s * (R.u0 + R.u1)) / 2;
    py = ch - 3 + s * rv0;
    if (px + s * U.u0 < 2) px = 2 - s * U.u0;
    if (px + s * U.u1 > cw - 2) px = cw - 2 - s * U.u1;
    if (py - s * U.v1 < 2) py = 2 + s * U.v1;
    if (py - s * Math.min(U.v0, 0) > ch - 2) py = ch - 2 + s * Math.min(U.v0, 0);
  } else {
    // mapa: X do pivô fixo no centro; em Y a silhueta de todos os quadros encosta 2 px acima da base
    px = cw / 2;
    const lado = Math.max(-U.u0, U.u1);
    s = Math.min((cw / 2 - 2) / lado, (ch - 4) / (U.v1 - Math.min(U.v0, 0))) * (aj.zoom ?? 1);
    py = ch - 2 + s * Math.min(U.v0, 0);
  }
  px = Math.round(px + (aj.dx ?? 0)); py = Math.round(py + (aj.dy ?? 0));
  v.altura = aj.altura ?? ch / s;
  v.pivot = aj.pivot ?? [px, py];
  const sf = ch / v.altura;
  return { escala: sf, repouso: [Math.round((R.u1 - R.u0) * sf), Math.round((R.v1 - Math.min(R.v0, 0)) * sf)], apertadoPorAnim: apertado, maisLarga: pior, olhoPx: raioOlho * 2 * sf };
}

function validar(d: CriaturaDef) {
  const erro = (m: string) => { throw new Error(`criatura ${d.id}: ${m}`); };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id)) erro('id deve ser slug minúsculo sem acento');
  if (d.paleta.rampas.length < 2 || d.paleta.rampas.length > 4) erro('paleta precisa de 2 a 4 rampas');
  for (const vista of ['frente', 'costas', 'mapa'] as const) {
    const set: AnimSet = d.anims[vista];
    for (const [nome, [a, b]] of Object.entries(CONTRATO[vista])) {
      const an = set[nome];
      if (!an) erro(`falta a animação ${vista}/${nome}`);
      if (an.frames < a || an.frames > b) erro(`${vista}/${nome} tem ${an.frames} quadros (contrato: ${a}–${b})`);
    }
    for (const nome of Object.keys(set)) if (!CONTRATO[vista][nome]) erro(`animação fora do contrato: ${vista}/${nome}`);
  }
  const larg = (s: string[]) => s.every((l) => l.length === s[0].length);
  for (const [k, s] of Object.entries(d.olho)) if (s && !larg(s)) erro(`carimbo de olho '${k}' com linhas de larguras diferentes`);
}

export function criatura(d: CriaturaDef): PixCriatura {
  validar(d);
  const c = CELULAS[d.porte];
  const vista = (n: 'frente' | 'costas' | 'mapa', olho?: string[], olhoFechado?: string[]): Vista => ({
    cell: [c[n], c[n]], pivot: [c[n] / 2, c[n] - 3], altura: 2, ...CAMERAS[n], anims: d.anims[n],
    ...(olho ? { olho } : {}), ...(olhoFechado ? { olhoFechado } : {}),
  });
  const model: PixCriatura = {
    id: d.id, categoria: 'criatura', num: d.num, nome: d.nome, porte: d.porte, estagio: d.estagio,
    paleta: d.paleta,
    vistas: {
      frente: vista('frente', d.olho.frente, d.olho.fechado),
      costas: vista('costas', d.olho.costas ?? d.olho.frente, d.olho.costasFechado ?? d.olho.fechado),
      mapa: vista('mapa', d.olho.mapa ?? ['p', 'p'], d.olho.mapa ?? ['p', 'p']),
    },
    minMalhas: MIN_MALHAS[d.estagio],
    ...(d.retoques ? { retoques: d.retoques } : {}),
    ...(d.limiares ? { limiares: d.limiares } : {}),
    build() {
      const rig = d.build();
      if (!rig.bones.base || !rig.bones.corpo) throw new Error(`criatura ${d.id}: o rig precisa dos ossos 'base' e 'corpo' (use novoRig ou um kit)`);
      storeRest(rig.bones);
      const ms = malhasDe(rig);
      model.info = {
        malhas: ms.length,
        vistas: {
          frente: enquadrar(rig, ms, model.vistas.frente, 'batalha', d.enquadre?.frente),
          costas: enquadrar(rig, ms, model.vistas.costas, 'batalha', d.enquadre?.costas),
          mapa: enquadrar(rig, ms, model.vistas.mapa, 'mapa', d.enquadre?.mapa),
        },
      };
      return rig;
    },
  };
  return model;
}
