import { casaSimples } from './_a1-grade';

/** Casa da família do faroleiro-ajudante: dicas sobre o farol e as criaturas de Trovão presas. */
export default casaSimples({
  id: 'A6-casa-1', nome: 'Casa do Ajudante de Faroleiro', tema: 'caicara', musica: 'cidade-choro', arena: 'praia', passo: 5, volta: [13, 19], parede: 'mapa-linhas',
  estante: ['"Manual do Farol, edição do Volta": metade é desenho de invenção, metade é receita de moqueca.'],
  bau: ['Um capacete com uma lâmpada colada com esparadrapo. Etiqueta: "protótipo 14 — não lamber".'],
  moradores: [
    { id: 'a6-ajudante', sprite: 'npc-homem-1', nome: 'Ajudante Fagulha', fala: ['O farol tem quatro andares. A grade do segundo lance só solta numa alavanca lá de cima.', 'Eu desci correndo quando a turma do Cartel chegou. O Volta ficou. Ele nunca larga a lanterna.'] },
    { id: 'a6-filha', sprite: 'cl-crianca-f', nome: 'Clarinha', mov: 'vagar', fala: ['A lanterna do farol quem acende é a Faísca, a Poraquê do Volta. Ela mora num aquário gigante lá em cima!', 'Será que ela está com fome?'] },
  ],
});
