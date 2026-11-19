import { casaSimples } from './_a1-grade';

/** Casa da Dona Bilro, a senhora do registro: avalia a parceira da frente e conta onde vocês se conheceram (regra clássica aprovada). */
export default casaSimples({
  id: 'A5-casa-1', nome: 'Casa da Dona Bilro', tema: 'caicara', musica: 'cidade-frevo', arena: 'praia', passo: 4, volta: [37, 10], parede: 'quadro',
  estante: ['Cadernos e mais cadernos: "Registro de Parceiras de Cidade Coral — volume 31".', 'Na lombada do último: "{JOGADOR}: a conferir".'],
  bau: ['Almofadas de renda com alfinetes espetados no formato de uma Estrelinha.'],
  moradores: [
    { id: 'a5-bilro', sprite: 'npc-idosa', nome: 'Dona Bilro', script: 'a2-m-registro' },
    { id: 'a5-neto', sprite: 'cl-crianca-m', nome: 'Tico', mov: 'vagar', fala: ['A vó sabe de cor onde cada criatura da ilha foi encontrada. Menos onde ela deixou os óculos.', 'Estão na cabeça dela. Não conta que eu contei.'] },
  ],
});
