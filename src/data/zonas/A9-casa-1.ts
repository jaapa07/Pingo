import { casaSimples } from './_a1-grade';

/** Oca do Guardador de Histórias: conta do Gavião-Tupã e da trilha do Pico. */
export default casaSimples({
  id: 'A9-casa-1', nome: 'Oca do Guardador de Histórias', tema: 'palafita', musica: 'cidade-catira', arena: 'pico', passo: 16, volta: [14, 11], parede: 'mapa-linhas',
  estante: ['Cordas com nós, uma para cada líder que subiu o monte. São poucas cordas. A última ainda está sem nó.'],
  bau: ['Penas compridas que estalam quando se toca. Guardadas em pano, uma por trovão.'],
  moradores: [
    { id: 'a9-guardador', sprite: 'npc-idoso', nome: 'Guardador Tibiriçá', fala: ['O Gavião-Tupã não se captura com pressa nem com força. Ele pousa para quem o céu já conhece.', 'Depois da Escama, suba a trilha do meio até a Pedra do Trovão. E segure o chapéu.'] },
    { id: 'a9-aprendiz', sprite: 'cl-crianca-m', nome: 'Aprendiz Poti', mov: 'vagar', fala: ['Eu estou decorando as dezesseis insígnias na ordem. Empaco sempre na do Casulo.'] },
  ],
});
