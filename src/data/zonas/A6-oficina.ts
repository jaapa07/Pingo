import { casaSimples } from './_a1-grade';

/** Oficina do Volta: a aprendiz cuida da bancada; missão do Xarope de Algas (o "remédio do farol") depois do evento. */
export default casaSimples({
  id: 'A6-oficina', nome: 'Oficina do Volta', tema: 'sertaneja', musica: 'cidade-choro', arena: 'praia', passo: 5, volta: [29, 19], parede: 'relogio',
  estante: ['Rádios abertos, relógios parados em horas diferentes e um bilhete: "NÃO arrumar o que está funcionando. De novo."'],
  tv: ['A tela só mostra chuvisco. No canto, um adesivo: "consertada pelo Volta" — e outro por cima: "duas vezes".'],
  bau: ['Fios, válvulas, um ferro de solda frio e meia rapadura.'],
  moradores: [
    { id: 'a6-aprendiz', sprite: 'npc-mulher-2', nome: 'Aprendiz Centelha', script: 'a2-m-xarope' },
    { id: 'a6-cliente', sprite: 'npc-homem-4', nome: 'Seu Ondas-Curtas', mov: 'olhar', fala: ['Trouxe meu rádio para o Volta arrumar faz um mês. Ele devolveu funcionando e fazendo café.', 'Não reclamei.'] },
  ],
});
