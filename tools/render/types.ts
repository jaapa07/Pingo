import type { Rig } from './sculpt';
import type { AnimSet } from './anim';

/** Paleta autoral de um modelo: até 16 rampas de 3 tons escritos à mão + contorno. */
export interface Paleta {
  /** rampas[i] = [sombra, base, luz] em hex '#rrggbb' — é o índice usado em tom(i) */
  rampas: [string, string, string][];
  /** cor do contorno de 1 px (escura, puxada para a cor dominante) */
  contorno: string;
  /** cores extras usadas pelos carimbos de olho e retoques: chave de 1 letra → hex */
  extras?: Record<string, string>;
}

/** Uma vista = uma câmera + um conjunto de animações → um spritesheet PNG. */
export interface Vista {
  /** tamanho da célula em pixels NATIVOS (o jogo roda em 320×180) */
  cell: [number, number];
  /** onde a origem do modelo (pés) cai na célula, em px nativos */
  pivot: [number, number];
  /** quantas unidades do modelo cabem na altura da célula */
  altura: number;
  /** azimute (graus, de +X para +Z) e elevação da câmera; o modelo olha para +X */
  yaw: number; pitch: number;
  anims: AnimSet;
  /**
   * Carimbo de olho desenhado à mão para esta vista (linhas de caracteres; '.' = não mexe).
   * Letras: k contorno · w branco · p pupila (contorno) · qualquer chave de paleta.extras.
   * Desenhe o olho DIREITO (+Z); o esquerdo é espelhado. Sem carimbo, o olho vira 1 px de contorno.
   */
  olho?: string[];
  olhoFechado?: string[];
}

export interface Retoque { vista: string; anim: string; quadro: number | '*'; px: [number, number, string][] }

export interface PixModel {
  id: string;
  categoria: 'criatura' | 'pessoa' | 'objeto' | 'fx' | 'cenario';
  paleta: Paleta;
  build(): Rig;
  vistas: Record<string, Vista>;
  /** pixels escritos à mão por cima do resultado (x, y na célula; cor = hex ou chave de extras/k/w) */
  retoques?: Retoque[];
  /** limiares de luz [sombra→base, base→luz], padrão [0.62, 0.98] */
  limiares?: [number, number];
  /** malhas mínimas exigidas pelo verificador (preenchido pelos helpers) */
  minMalhas?: number;
}
