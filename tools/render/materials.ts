/**
 * Materiais do pipeline de pixel art. Não há cores aqui: cada malha aponta para uma RAMPA da paleta
 * autoral do modelo (índice 0..15). O render faz dois passes — identidade (qual rampa) e luz (quão
 * iluminado) — e a pixelização escolhe o tom [sombra, base, luz] da rampa. Resultado: pixel art
 * limpa, 100% dentro da paleta.
 */
import * as THREE from 'three';

export const ID_OLHO_E = 30;
export const ID_OLHO_D = 31;
export interface TomOpts { plano?: boolean; /** deslocamento de luz: +1 força tom claro, -1 força sombra */ vies?: number }

const cache = new Map<string, THREE.Material>();
function make(id: number, o: TomOpts) {
  const key = id + ':' + (o.plano ? 1 : 0) + ':' + (o.vies ?? 0);
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    // passe de identidade: R = id da rampa, G = plano, B = viés de luz
    m.userData.idMat = new THREE.MeshBasicMaterial({ color: new THREE.Color((id + 1) * 8 / 255, o.plano ? 1 : 0, ((o.vies ?? 0) + 1) / 2), side: THREE.DoubleSide });
    cache.set(key, m);
  }
  return m;
}
/** Material da rampa i da paleta do modelo. `plano` = sempre o tom base (brilhos, luzes, detalhes chapados). */
export function tom(i: number, o: TomOpts = {}): THREE.Material {
  if (i < 0 || i > 15) throw new Error('rampa fora de 0..15: ' + i);
  return make(i, o);
}
export function tomOlho(lado: 'E' | 'D'): THREE.Material { return make(lado === 'E' ? ID_OLHO_E : ID_OLHO_D, { plano: true }); }
