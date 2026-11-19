import { casaSimples } from './_a1-grade';

/** Casa da Dona Enseada, rendeira e central de notícias de Porto Sereia. */
export default casaSimples({
  id: 'A4-casa-2', nome: 'Casa da Dona Enseada', tema: 'caicara', musica: 'cidade-frevo', arena: 'praia', passo: 3, volta: [21, 27],
  estante: ['Almofadas de bilro, linhas e um caderno: "Quem casou, quem brigou, quem deve".'],
  tv: ['Previsão do tempo: "Sol na Costa, névoa no Sertão e faísca na Usina Velha."'],
  bau: ['Toalhas de renda. Uma delas tem o desenho do Trem Serra-Sol, vagão por vagão.'],
  moradores: [
    { id: 'a4-enseada', sprite: 'cl-rendeira', nome: 'Dona Enseada', fala: ['Viu uns sujeitos de macacão cor de ferrugem descendo a Estrada da Usina?', 'Carregavam gaiola coberta com pano. Gente boa não cobre gaiola, meu bem.'] },
    { id: 'a4-comadre', sprite: 'npc-mulher-2', nome: 'Comadre Restinga', mov: 'olhar', fala: ['A Capitã Marola abre e fecha comporta dentro do ginásio para mudar a altura da água.', 'Meu sobrinho entrou seco e saiu ensopado três vezes. Aprendeu a ler placa.'] },
  ],
});
