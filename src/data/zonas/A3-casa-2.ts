import { casaSimples } from './_a1-grade';

/** Oficina do Mestre Imbuia: quem cuida da bancada é a aprendiz, porque o mestre vive olhando a ponte quebrada. */
export default casaSimples({
  id: 'A3-casa-2', nome: 'Oficina do Mestre Imbuia', tema: 'palafita', musica: 'cidade-choro', arena: 'mata', passo: 2, volta: [35, 23], parede: 'mapa-linhas',
  estante: ['Plantas de pontes: "ponte pênsil", "ponte de tábua", "ponte que eu ainda vou inventar".'],
  bau: ['Ferramentas: serrote, formão, plaina e um martelo com nome gravado: "Convencedor".'],
  moradores: [
    { id: 'a3-aprendiz', sprite: 'npc-mulher-1', nome: 'Aprendiz Jurubeba', fala: ['O mestre só fala da ponte da casa-da-árvore. Dorme pensando em corda, acorda pensando em corda.', 'Corda de Cipó vende na Venda do Galho. Três rolos resolvem a vida dele — e a minha.'] },
    { id: 'a3-cliente', sprite: 'npc-homem-4', nome: 'Seu Angico', mov: 'olhar', fala: ['Trouxe minha cadeira de balanço para consertar em março.', 'Não disse de que ano. Erro meu.'] },
  ],
});
