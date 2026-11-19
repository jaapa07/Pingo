/**
 * B6-lab-1 · Laboratório do Cartel, 1º subsolo (depósito) — 5º evento do Cartel Ferrugem, passo 13.
 * A porta blindada do norte só abre com a alavanca da sala de máquinas (leste). O depósito (oeste) guarda os itens.
 */
import type { ZonaDef } from '../../core/tipos';
import { Grade, npc, tr } from './_b2-lib';

const g = new Grade(30, 22, '#');
g.r(11, 15, 8, 6, '.').p('+', 15, 21, 15, 20).r(14, 6, 2, 9, ':').r(2, 8, 9, 6, '.').r(11, 10, 3, 1, '.').r(19, 8, 9, 6, '.').r(16, 10, 3, 1, '.').r(8, 3, 14, 3, '.');
g.p('x', 3, 12, 4, 12, 4, 13, 8, 9, 9, 9, 23, 12, 24, 12).r(21, 9, 5, 1, ':').r(10, 4, 9, 1, ',');

const zona: ZonaDef = {
  id: 'B6-lab-1', nome: 'Laboratório do Cartel — Depósito', mapa: 'B', tipo: 'dungeon', tileset: 'industrial', musica: 'cartel-tema', arena: 'usina', passo: 13,
  mapaChars: g.fim(),
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cartel' },
    { o: 'tambor', x: 2, y: 8 }, { o: 'tambor', x: 3, y: 8 }, { o: 'caixote', x: 10, y: 8 }, { o: 'caixote', x: 10, y: 9 }, { o: 'barril', x: 2, y: 13 }, { o: 'jaula', x: 6, y: 8, texto: ['Uma jaula vazia. Na plaqueta: "Lote 12 — sapos-cururu — ENVIADO AO NÍVEL 2".'] },
    { o: 'gerador', x: 19, y: 8 }, { o: 'painel', x: 22, y: 8, texto: ['PRESSÃO DAS CALDEIRAS DE PEÇONHA: ALTA.\nAlguém colou um bilhete: "não encostar, Rebite, isso é com você".'] }, { o: 'alavanca', x: 26, y: 9, script: 'b2-lab-alavanca-1' }, { o: 'tambor', x: 27, y: 13 },
    { o: 'escada-desce', x: 20, y: 4 }, { o: 'computador-cartel', x: 9, y: 3, texto: ['REGISTRO DE CARGA\n• 212 anfíbios do Brejo Roxo\n• 38 serpentes do Vale\n• 1 "espécime especial" (jaula reforçada, nível 3)\n• 1 herpetólogo intrometido (cela, nível 2)'] },
    { o: 'tanque', x: 14, y: 3 }, { o: 'tanque', x: 16, y: 3 }, { o: 'caixote', x: 11, y: 19 }, { o: 'tambor', x: 18, y: 19 }, { o: 'caixote', x: 18, y: 15 },
  ],
  warps: [
    { x: 15, y: 21, para: { zona: 'B6', x: 43, y: 8, dir: 's' }, tipo: 'porta' },
    { x: 20, y: 4, para: { zona: 'B6-lab-2', x: 3, y: 4, dir: 'l' }, tipo: 'escada' },
  ],
  portoes: [{ x: 14, y: 6, w: 2, requer: 'flag:b2-lab-alavanca-1', fala: 'Uma porta blindada com o emblema da engrenagem enferrujada.\nUm cabo grosso sai dela e segue pela parede para o leste.' }],
  npcs: [
    tr('B6-lab-1', 'capanga-m', 13, 17, 'l', { visao: 4, se: '!flag:laboratorio-ok' }),
    tr('B6-lab-2', 'capanga-f', 5, 10, 'l', { visao: 5, se: '!flag:laboratorio-ok' }),
    tr('B6-lab-3', 'capanga-m', 24, 10, 'o', { visao: 5, se: '!flag:laboratorio-ok' }),
    npc('faxineiro', 'Faxineiro Contratado', 'npc-homem-4', 17, 16, 'o', ['Eu só fui contratado para passar pano. Ninguém me avisou que o pano ia derreter.', 'A porta lá de cima? Abre na alavanca da sala das máquinas. Eu não falei nada.'], { se: '!flag:laboratorio-ok' }),
  ],
  itens: [
    { x: 3, y: 10, item: 'garrafada', qtd: 2, flag: 'B6-lab-i1' },
    { x: 9, y: 13, item: 'pt-26', flag: 'B6-lab-i2' },
    { x: 21, y: 13, item: 'cha-guarana', flag: 'B6-lab-i3' },
    { x: 7, y: 12, item: 'unguento', qtd: 2, oculto: true, flag: 'B6-lab-o1' },
  ],
};
export default zona;
