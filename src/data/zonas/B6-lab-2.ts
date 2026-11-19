/**
 * B6-lab-2 · Laboratório do Cartel, 2º subsolo (jaulas e esteiras).
 * Quebra-cabeça: a comporta do núcleo (centro) só abre com as DUAS alavancas — a da ala das jaulas (sudoeste)
 * e a da sala de destilação (nordeste). Na cela das jaulas está o Doutor Peçonha, que cura a equipe com antídotos.
 */
import type { ZonaDef } from '../../core/tipos';
import { Grade, npc, tr } from './_b2-lib';

const g = new Grade(32, 24, '#');
g.r(2, 3, 8, 4, '.').r(10, 4, 12, 1, ':').r(22, 3, 8, 6, '.').r(4, 7, 2, 5, ':').r(2, 12, 10, 8, '.').r(25, 9, 2, 4, ':').r(20, 13, 10, 7, '.');
g.r(12, 16, 8, 1, ':').r(13, 8, 6, 5, '.').r(15, 13, 2, 3, ':').p('x', 23, 7, 24, 7, 24, 8, 28, 16, 28, 17, 27, 17, 7, 18, 8, 18).r(14, 10, 4, 1, ',').r(21, 15, 5, 1, ':').r(21, 17, 5, 1, ':');

const zona: ZonaDef = {
  id: 'B6-lab-2', nome: 'Laboratório do Cartel — Jaulas', mapa: 'B', tipo: 'dungeon', tileset: 'industrial', musica: 'cartel-tema', arena: 'usina', passo: 13,
  mapaChars: g.fim(),
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cartel' },
    { o: 'escada-sobe', x: 2, y: 4 }, { o: 'tambor', x: 8, y: 3 }, { o: 'caixote', x: 9, y: 3 }, { o: 'painel', x: 5, y: 3, texto: ['ESTEIRAS: LIGADAS.\nDESTINO DAS JAULAS: "COMPRADORES — COSTA DO SOL".'] },
    { o: 'tanque', x: 22, y: 3 }, { o: 'tanque', x: 24, y: 3 }, { o: 'mesa-lab', x: 26, y: 5, texto: ['Frascos de peçonha rotulados por espécie. Há uma tabela de preços. Dá vontade de quebrar tudo.'] }, { o: 'alavanca', x: 29, y: 3, script: 'b2-lab-alavanca-b' },
    { o: 'jaula', x: 2, y: 12, texto: ['Sapos-cururu espremidos, olhando para você.'] }, { o: 'jaula', x: 4, y: 12, texto: ['Uma Jararaquinha enrolada num canto, tremendo.'] }, { o: 'jaula', x: 6, y: 12, texto: ['Pererequinhas. Uma delas acena. Ou é impressão.'] },
    { o: 'jaula', x: 8, y: 12 }, { o: 'jaula', x: 8, y: 13, texto: ['A tranca desta cela é diferente: tem um teclado. E alguém lá dentro assobiando para uma cobra.'] }, { o: 'jaula', x: 8, y: 14 }, { o: 'jaula', x: 9, y: 15 }, { o: 'jaula', x: 10, y: 15 }, { o: 'jaula', x: 11, y: 15 },
    { o: 'alavanca', x: 2, y: 19, script: 'b2-lab-alavanca-a' }, { o: 'tambor', x: 11, y: 19 },
    { o: 'gerador', x: 20, y: 13 }, { o: 'tanque', x: 23, y: 13 }, { o: 'computador-cartel', x: 27, y: 13, texto: ['PROJETO CAIPORA\n"O espécime resiste à sedação. Onde ele pisa, brota mato no concreto. O Coronel quer o segredo dele até a lua cheia."'] }, { o: 'caixote', x: 29, y: 19 }, { o: 'vagonete', x: 20, y: 19 },
    { o: 'escada-desce', x: 17, y: 9 }, { o: 'tanque', x: 13, y: 8 }, { o: 'tambor', x: 18, y: 12 },
  ],
  warps: [
    { x: 2, y: 4, para: { zona: 'B6-lab-1', x: 19, y: 4, dir: 'o' }, tipo: 'escada' },
    { x: 17, y: 9, para: { zona: 'B6-lab-3', x: 4, y: 5, dir: 'l' }, tipo: 'escada' },
  ],
  portoes: [{ x: 15, y: 14, w: 2, requer: 'flag:b2-lab-a&flag:b2-lab-b', fala: 'Comporta do núcleo. Duas luzes vermelhas piscam: "ALAVANCA A" e "ALAVANCA B".\nEnquanto as duas não ficarem verdes, nada feito.' }],
  npcs: [
    tr('B6-lab-4', 'capanga-f', 7, 5, 'o', { visao: 4, se: '!flag:laboratorio-ok' }),
    tr('B6-lab-5', 'capanga-m', 27, 7, 'n', { visao: 3, se: '!flag:laboratorio-ok' }),
    tr('B6-lab-6', 'capanga-m', 5, 17, 'n', { visao: 4, se: '!flag:laboratorio-ok' }),
    tr('B6-lab-7', 'capanga-f', 24, 16, 'n', { visao: 3, se: '!flag:laboratorio-ok' }),
    tr('B6-lab-8', 'capanga-m', 15, 11, 's', { visao: 4, se: '!flag:laboratorio-ok' }),
    npc('peconha', 'Doutor Peçonha', 'lider-13', 9, 13, 'o', null, { script: 'b2-peconha-cela', se: '!flag:laboratorio-ok' }),
  ],
  itens: [
    { x: 29, y: 8, item: 'elixir-andiroba', flag: 'B6-lab-i4' },
    { x: 6, y: 15, item: 'cuia-ouro', qtd: 3, flag: 'B6-lab-i5' },
    { x: 21, y: 19, item: 'engrenagem-velha', flag: 'B6-lab-i6' },
    { x: 3, y: 6, item: 'pomada-copaiba', oculto: true, flag: 'B6-lab-o2' },
    { x: 18, y: 8, item: 'rapadura', oculto: true, flag: 'B6-lab-o3' },
  ],
};
export default zona;
