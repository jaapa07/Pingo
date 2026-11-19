import { casaSimples } from './_a1-grade';

/** Casa da Dona Graúna, mãe do Nico (o menino que se perdeu na Mata dos Sabiás). */
export default casaSimples({
  id: 'A3-casa-1', nome: 'Casa da Dona Graúna', tema: 'palafita', musica: 'cidade-choro', arena: 'mata', passo: 2, volta: [5, 7],
  estante: ['Potes de geleia etiquetados: "pitanga", "jabuticaba", "NÃO MEXER, NICO".'],
  tv: ['Novela das seis. A mocinha acabou de descobrir que o vilão é o próprio irmão gêmeo. De novo.'],
  bau: ['Um baú de brinquedos: pião, peteca e um estilingue confiscado.'],
  moradores: [
    { id: 'a3-grauna', sprite: 'npc-mulher-4', nome: 'Dona Graúna', script: 'm-perdido-mae' },
    { id: 'a3-avo', sprite: 'npc-idoso', nome: 'Vô Cedro', mov: 'olhar', fala: ['Quando eu era menino, também me perdi na Mata dos Sabiás.', 'Fiquei três dias comendo pitanga. Melhores férias da minha vida.'] },
  ],
});
