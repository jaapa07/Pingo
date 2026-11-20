import { casa } from './_b1-lib';

/** Sobrado rosa (porta em (40, 25) na cidade): a casa do sanfoneiro e da quadrilheira. */
export default casa({
  id: 'B4-casa-1', nome: 'Sobrado da Quadrilha', tema: 'colonial', musica: 'cidade-catira', arena: 'vulcao', passo: 11, volta: [40, 26],
  canto: 'maquina-costura', parede: 'quadro',
  estante: ['Chapéus de palha com remendo de chita, bandeirinhas dobradas e um caderno de marcação de quadrilha: "Olha a chuva! É mentira!"'],
  bau: ['Vestidos de festa junina e um bigode postiço guardado num vidro, como relíquia.'],
  cantoTexto: ['A máquina de costura está no meio de um vestido xadrez. O pedal ainda está quente.'],
  moradores: [
    { id: 'b4-quadrilheira', sprite: 'npc-mulher-1', nome: 'Dona Pamonha', dir: 's', fala: ['Costuro os vestidos da quadrilha desde menina. Este ano, a Ferreira Labareda pediu um com faísca bordada.', 'Faísca bordada pega fogo? Pega. Já estou no terceiro vestido.'] },
    { id: 'b4-quadrilheiro', sprite: 'npc-idoso', nome: 'Seu Anarriê', dir: 'o', fala: ['Fui marcador de quadrilha quarenta anos. "Balancê! Caminho da roça!"', 'Hoje só marco a hora do café. "Anarriê para a cozinha!"'] },
  ],
});
