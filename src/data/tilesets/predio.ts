import { CORES_BASE, type TilesetInterior } from './casa';

/** PRÉDIO: serviços das cidades — Posto Guardião, Venda, laboratório da Profª Ipê, estação de trem e cais. */
export const predio: TilesetInterior = {
  nome: 'predio', desc: 'Posto Guardião, Venda, laboratório, estação e cais', base: CORES_BASE,
  temas: [
    { id: 'posto', desc: 'Posto Guardião: ladrilho verde-água, parede clara com faixa da folha, tapete de acolhida', piso: 'ladrilho', corredor: 'carpete', alt: 'xadrez', parede: 'reboco',
      cores: { piso: ['#3c7c84', '#74b8a8', '#c4e8d0', '#f0fce8'], piso2: ['#a43c2c', '#e4643c', '#f89c5c', '#ffd49c'], parede: ['#8ca4a4', '#d0e0d4', '#f4f8e8', '#ffffff'], rodape: ['#145c54', '#249484', '#54c4a4', '#b4f0d0'], tapete: ['#a43c2c', '#e4643c', '#f89c5c', '#ffd49c'] } },
    { id: 'venda', desc: 'Venda: assoalho gasto, parede de tábua pintada e passadeira listrada', piso: 'tabuas', corredor: 'carpete', alt: 'cimento', parede: 'tabuas',
      cores: { piso: ['#4c3034', '#7c5440', '#a88050', '#d0ac70'], parede: ['#7c6c34', '#c4b458', '#ecdc84', '#fcf8c0'], rodape: ['#7c2c24', '#b8443c', '#e4745c', '#f8b494'], piso2: ['#7c2c24', '#b8443c', '#f0f0e0', '#f8b494'], tapete: ['#7c2c24', '#b8443c', '#e4745c', '#f8b494'] } },
    { id: 'laboratorio', desc: 'laboratório da Profª Ipê: piso xadrez claro, azulejo branco e bancada com as 3 cuias', piso: 'xadrez', corredor: 'ladrilho', alt: 'cimento', parede: 'azulejo',
      cores: { piso: ['#8c94a8', '#c4ccd4', '#ecf0f0', '#ffffff'], piso2: ['#a4841c', '#e8c02c', '#f8e06c', '#fffcc0'], parede: ['#8c94a8', '#d4d8dc', '#f4f4f0', '#ffffff'], rodape: ['#a4841c', '#e8c02c', '#f4f4f0', '#fff4a4'], tapete: ['#5c2c8c', '#8c4cc4', '#bc84e4', '#e8ccf8'] } },
    { id: 'estacao', desc: 'estação do Trem Serra-Sol: ladrilho hidráulico, lambri de madeira e plataforma de pedra', piso: 'hidraulico', corredor: 'pedra', alt: 'tabuas', parede: 'tijolo',
      cores: { piso: ['#4c3c3c', '#c4b494', '#ecdcb8', '#fff8dc'], piso2: ['#2c4c5c', '#34748c', '#c4583c', '#e49c5c'], parede: ['#5c2424', '#8c3c30', '#b85c40', '#dc8c60'], rodape: ['#2c1c2c', '#4c3034', '#745040', '#a07c58'], tapete: ['#144c3c', '#1c7c54', '#4cac6c', '#a4e49c'] } },
    { id: 'cais', desc: 'armazém do cais: deck salgado, parede de tábua azul e água entre as estacas', piso: 'deck', corredor: 'tabuas', alt: 'pedra', parede: 'tabuas',
      cores: { piso: ['#33243a', '#5c4040', '#8a644a', '#b89060'], parede: ['#1c3c64', '#2c6494', '#5494c0', '#a4cce4'], rodape: ['#33243a', '#5c4040', '#8a644a', '#f0f0e0'], piso2: ['#4c3034', '#7c5440', '#a88050', '#d0ac70'], tapete: ['#a43c2c', '#e4643c', '#f0f0e0', '#ffd49c'] } },
  ],
  porZona: [['-posto', 'posto'], ['-venda', 'venda'], ['laboratorio|-lab$', 'laboratorio'], ['estacao', 'estacao'], ['cais|saveiro|porto', 'cais']],
  rodizio: ['posto'],
};
