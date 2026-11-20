import { casa } from './_b1-lib';

/** Casa de madeira do violeiro Seu Zabelê (porta em (5, 22) na cidade): missão da carta na asa (`b1-violeiro`). */
export default casa({
  id: 'B1-casa-2', nome: 'Casa do Violeiro', tema: 'sertaneja', musica: 'cidade-catira', arena: 'cerrado', passo: 9, volta: [5, 23],
  canto: 'rede', parede: 'quadro',
  estante: ['Uma viola de dez cordas pendurada e um caderno de modas. A última página tem só um título: "Saudade de Porto Pantaneiro".'],
  bau: ['Cordas de viola, palhetas de chifre e um retrato de uma moça na beira do rio, com dedicatória borrada de tanto ser lida.'],
  cantoTexto: ['A rede listrada balança sozinha. O violeiro jura que é o vento. Não tem janela aberta.'],
  moradores: [
    { id: 'b1-violeiro', sprite: 'cl-repentista', nome: 'Seu Zabelê', dir: 's', script: 'b1-violeiro' },
    { id: 'b1-sabia', sprite: 'c:bem-te-vico', nome: 'Bem-te-viço', mov: 'vagar', fala: ['(O Bem-te-viço do violeiro canta três notas e fica esperando você completar a moda.)'] },
  ],
});
