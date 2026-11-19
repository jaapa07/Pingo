import { casaSimples } from './_a1-grade';

/** Casa do Seu Turno, operário aposentado: explica as áreas de retorno (Cachoeira-Véu e Monte Tupã). */
export default casaSimples({
  id: 'A8-casa-2', nome: 'Casa do Seu Turno', tema: 'serrana', musica: 'cidade-maracatu', arena: 'usina', passo: 7, volta: [37, 22],
  estante: ['Cartões de ponto guardados como figurinhas. Trinta e cinco anos sem um atraso. Um está emoldurado: "o do dia da enchente".'],
  bau: ['Uma marmita de alumínio areada até brilhar.'],
  moradores: [
    { id: 'a8-turno', sprite: 'npc-idoso', nome: 'Seu Turno', fala: ['O açude lá de cima é a nascente do Rio Cachoeira-Véu. Ele desce pulando até Serra Fumaça.', 'Tem bicho ali que não se vê em mais lugar nenhum: lontra, ariranha, mico de juba dourada.', 'Mas é rio de gente grande. Volte quando subir cascata.'] },
    { id: 'a8-neta', sprite: 'cl-crianca-f', nome: 'Porquinha', mov: 'vagar', fala: ['Meu apelido é Porquinha por causa da porca de parafuso. É o que eu digo para todo mundo.'] },
  ],
});
