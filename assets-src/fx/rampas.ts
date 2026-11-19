/** Rampas de cor dos FX: [contorno, sombra, base, luz, brilho]. As dos 17 tipos seguem as cores dos ícones de tipo do kit. */
import type { Rampa } from './pincel';

export const R: Record<string, Rampa> = {
  comum: ['#2e2a26', '#6e6858', '#a8a090', '#d0c8b8', '#fff8e7'],
  mata: ['#14331f', '#2f6b3a', '#4fa346', '#8fd45a', '#d9f07a'],
  brasa: ['#5a1020', '#a32638', '#e0483c', '#f58a4b', '#fff07a'],
  rio: ['#12304e', '#1f4f7a', '#2f86c4', '#6fc7e8', '#e8ffff'],
  trovao: ['#5a3a08', '#9a6410', '#e0a81c', '#fff07a', '#fffbe0'],
  geada: ['#164a5c', '#2a7f96', '#5fc4d8', '#c8f0f4', '#ffffff'],
  ginga: ['#4a2010', '#7a3a18', '#c8662a', '#f0a060', '#ffe0b0'],
  veneno: ['#30144a', '#5b2a7c', '#9a4fb8', '#d08ae8', '#f4d0ff'],
  terra: ['#3b2414', '#6b4226', '#b0784a', '#e0b080', '#f6e6b8'],
  vento: ['#283c6c', '#4a68a8', '#7fa8e0', '#c0dcf8', '#ffffff'],
  mente: ['#5a1436', '#9c2a5e', '#e85a9a', '#f8a8cc', '#fff0f8'],
  inseto: ['#30400a', '#5a7214', '#9ab82a', '#d0e86a', '#f4ffc0'],
  pedra: ['#2c2418', '#524630', '#8a7a5c', '#c0b08a', '#e8dcc0'],
  assombro: ['#171030', '#2e2452', '#5a4a8c', '#9a8ad0', '#d8d0ff'],
  lenda: ['#0e1850', '#1e2e86', '#3a5ad0', '#8aa0f0', '#e0e8ff'],
  ferro: ['#242a34', '#454f5e', '#7a8a9c', '#b8c4d0', '#f0f4f8'],
  encanto: ['#5c1c40', '#a83a78', '#f07ab8', '#fcc0e0', '#fff4fa'],
  branco: ['#3b2a35', '#c4c6d4', '#fff8e7', '#ffffff', '#ffffff'],
  ouro: ['#5a3a08', '#c98f4e', '#f9c22b', '#fff07a', '#fffbe0'],
  cura: ['#1f5a3a', '#3fbfa0', '#8fe8b0', '#d9ffd0', '#ffffff'],
  sangue: ['#4a1020', '#a32638', '#e0483c', '#fff8e7', '#ffffff'],
  azul: ['#12304e', '#1f4f7a', '#2f86c4', '#6fc7e8', '#e8ffff'],
};
