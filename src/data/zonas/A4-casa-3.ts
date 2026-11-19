import { casaSimples } from './_a1-grade';

/** Clube do Anzol: os pescadores de Porto Sereia e suas histórias (todas verdadeiras, segundo eles). */
export default casaSimples({
  id: 'A4-casa-3', nome: 'Clube do Anzol', tema: 'caicara', musica: 'cidade-frevo', arena: 'praia', passo: 3, volta: [51, 27], parede: 'rede-pesca',
  estante: ['Troféus de pescaria. O maior diz: "Ao peixe que escapou, com respeito."'],
  bau: ['Anzóis, chumbadas, boias e uma lata de minhoca com tampa furada.'],
  moradores: [
    { id: 'a4-presidente', sprite: 'cl-pescador', nome: 'Presidente Robalo', fala: ['Vara Velha pega Piabinha. Vara Boa pega o que tem no fundo. Vara Mestra pega lenda.', 'A Mestra eu só vi uma vez, na mão de um velho em Pantanal Grande. Lá no Sertão das Névoas, do outro lado da serra, onde só Campeão da Liga desembarca.'] },
    { id: 'a4-socio', sprite: 'npc-homem-1', nome: 'Sócio Baiacu', mov: 'olhar', fala: ['Uma vez pesquei um Mandizinho que me olhou nos olhos e eu soltei.', 'Os outros dizem que ele só estava vesgo. Inveja.'] },
  ],
});
