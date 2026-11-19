import { CORES_BASE, type TilesetInterior } from './casa';

/** INDUSTRIAL: Usina Velha, mina abandonada e laboratório secreto do Cartel Ferrugem. */
export const industrial: TilesetInterior = {
  nome: 'industrial', desc: 'Usina, mina e laboratório do Cartel', base: CORES_BASE,
  temas: [
    { id: 'usina', desc: 'Usina Velha: concreto manchado, tijolo e passarelas de grade; `x` = fio desencapado, `:` = passarela', piso: 'cimento', corredor: 'grade', alt: 'chapa', parede: 'tijolo', perigo: 'choque',
      cores: { piso: ['#242838', '#3c4450', '#586068', '#7c8480'], piso2: ['#1c2438', '#38485c', '#607888', '#98b0b4'], parede: ['#241c30', '#44303c', '#644444', '#845c50'], rodape: ['#201c28', '#201c28', '#e8b82c', '#e8b82c'], teto: ['#100c1c', '#1c1830', '#2c2840', '#443c54'], perigo: ['#c88c14', '#fcd834', '#fff8a0', '#ffffff'], tapete: ['#5c2418', '#984424', '#cc7434', '#f0b05c'] } },
    { id: 'mina', desc: 'mina abandonada: rocha vermelha escorada; `:` = trilho, `%` = cascalho com encontros, `r` = veio a quebrar', piso: 'rocha', corredor: 'rocha', alt: 'terra', parede: 'rocha',
      cores: { piso: ['#3c2430', '#5c3c3c', '#84584c', '#a87c60'], piso2: ['#242838', '#48546c', '#7c8c9c', '#b8c8c8'], parede: ['#2c1428', '#4c2430', '#74383c', '#9c5848'], rodape: ['#2c1428', '#4c2430', '#74383c', '#9c5848'], teto: ['#140810', '#241020', '#3c1c28', '#5c2c34'], tapete: ['#a85c14', '#f0a02c', '#fcdc6c', '#fffcd0'] }, pecas: { ':': 'trilho', T: 'escora' } },
    { id: 'cartel', desc: 'laboratório do Cartel Ferrugem: chapa fria, parede blindada com faixa ferrugem; `x` = vazamento tóxico, `:` = esteira', piso: 'chapa', corredor: 'grade', alt: 'xadrez', parede: 'metal', perigo: 'toxico',
      cores: { piso: ['#1c2030', '#343c50', '#505c70', '#788890'], piso2: ['#1c2030', '#343c50', '#788890', '#a0b0b0'], parede: ['#181c2c', '#2c3448', '#485468', '#70808c'], rodape: ['#4c1c1c', '#843424', '#bc6030', '#e8a058'], teto: ['#0c0e1a', '#181c2c', '#2c3448', '#485468'], perigo: ['#1c5c2c', '#34a43c', '#84e45c', '#e4fca4'], tapete: ['#4c1c1c', '#843424', '#bc6030', '#e8a058'] }, pecas: { C: 'terrario' } },
  ],
  porZona: [['US|usina', 'usina'], ['mina', 'mina'], ['cartel|lab', 'cartel']],
  rodizio: ['usina'],
};
