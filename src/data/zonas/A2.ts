import type { ZonaDef } from '../../core/tipos';
import { grade, obj, entrada, saidas, gente, item, placa } from './_a1-grade';

/**
 * A2 · Vila Caiçara — vila de pescadores e de pipas, Ginásio do Vento (Mestre Gaivota) e a casa-viveiro do Seu Aroeira.
 * A saída leste (Campos de Restinga) só abre com a Insígnia da Pena. A ilhota da enseada pede o Remo.
 */
const g = grade('A2', [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTT',
  '~~~~~~;;TT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTT',
  '~~~~~~;;;.|..........|......,...|..........|.kTT',
  '~~~~~~~;;.|..I.......|......I...|......,...|..TT',
  '~~~~~~~;;.|...,......|..........|..........|..TT',
  '~j~~~~~;;;|..........|..........|..........|I.TT',
  '~~~~~~~;;;|..........|..........|..........|..TT',
  '~~~~~~~;;;|.5......G.|......y...|.A........|..TT',
  '~~~~~~;;;;|..g.....e.|.:........|...:a.....|..TT',
  '~~4===;;;:|::::::::::|::::::::::|::::::::::|:.TT',
  '~~~~~~;;;.|..........|.:........|..........|..TT',
  '~~~~~~;;;.|....y.....|.:...,....|...1......|..TT',
  '~~~~~~~;;.|..........|.:........|..........|..TT',
  '~~~~~~~;B.|..........|.:........|......b...|..TT',
  '~~~~~~~;;.|...P......|.:..V.....|..........|.fff',
  '~~~~~~;;;:|::::::::::|::::::::::|::::::::::|:Q:E',
  '~~~~~~;;;.|..p.......|.::...v...|..........|:::E',
  '~~~~~~;;;.|..........|.::.......|..........|.fff',
  '~~~~~~;;;;|......,...|.::.......|....C.C...|..TT',
  '~~~~~;;;;;|..........|.::..F....|..........|..TT',
  '~~~~~;;6;;|..........|.::.......|....C.C...|..TT',
  '~~~~~;;;;.|..........|.::.....2.|..........|..TT',
  '~~~~;;;;;.|...H......|.::.......|J.........|..TT',
  '~~~~;;;;;.|..::::::::|::::::::::|::........|..TT',
  '~~~~;;o;;.|..h.......|.::.......|...u......|..TT',
  '~~~~~;;;;.|...3......|.::....,..|..........|..TT',
  '~~i~~;;;;;|..........|.::.......|.....t....|..TT',
  '~~~~~~;;;;|..,.......|.::.......|..........|..TT',
  '~~~~~~;;;;|;.........|.::s......|..........|..TT',
  '~~~~~~~;;;|;;........|.::.......|......,...|..TT',
  '~~~~~~~~;;|;;;TTTTTTT|T::TTTTTTT|TTTTTTTTTT|TTTT',
  '~~~~~~~~~~|TTTTTTTTTT|TSSTTTTTTT|TTTTTTTTTT|TTTT',
], {
  S: ':', E: ':', Q: ':', G: '.', A: '.', P: '.', V: '.', H: '.', J: '.', F: '.', I: '.', y: '.', B: ';', j: '~', k: '.', i: ';', o: ';',
  g: '.', e: '.', a: '.', p: '.', v: '.', h: '.', u: '.', s: '.', '1': '.', '2': '.', '3': '.', '4': '=', '5': '.', '6': ';',
});
const placas = [
  placa(g, 'g', 'VILA CAIÇARA\n"Aqui o vento manda e a gente empina."'),
  placa(g, 'e', 'GINÁSIO DE VILA CAIÇARA\nLíder: Mestre Gaivota — "o velho que conversa com o vento".'),
  placa(g, 'a', 'VIVEIRO DO SEU AROEIRA\nCuida-se de ovo, filhote e visita com fome.'),
  placa(g, 'p', 'POSTO GUARDIÃO\nCura grátis para criaturas e conselho grátis para treinadores.'),
  placa(g, 'v', 'VENDA DA CAIÇARA\nCuias, chás e fofoca fresquinha.'),
  placa(g, 'h', 'Casa da Dona Maré.'),
  placa(g, 'u', 'Casa dos Pipeiros.\nNão puxe a linha!'),
  placa(g, 's', 'Sul: Trilha do Ipê → Vila Jacarandá\nLeste: Campos de Restinga'),
];
const [qx, qy] = g.p('Q');
const zona: ZonaDef = {
  id: 'A2', nome: 'Vila Caiçara', mapa: 'A', tipo: 'cidade', tileset: 'costa', musica: 'cidade-samba', arena: 'praia', passo: 1,
  pouso: [15, 15],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'G', 'ginasio', { cor: '#3b6f9a,#6fb4d8,#c9ecf5' }), obj(g, 'A', 'casa-c'), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'), obj(g, 'H', 'casa-a'), obj(g, 'J', 'casa-d'),
    obj(g, 'F', 'fonte'), obj(g, 'j', 'jangada'), obj(g, 'B', 'barco'),
    ...g.todos('I').map(([x, y]) => ({ o: 'coqueiro', x, y })), ...g.todos('y').map(([x, y]) => ({ o: 'poste', x, y })),
    ...placas.map((p) => p.objeto),
  ],
  placas: placas.map((p) => p.placa),
  warps: [
    ...saidas(g, 'S', 'A-R1', 14, 1, 's'),
    ...saidas(g, 'E', 'A-R2', 1, 14, 'l'),
    entrada(g, 'G', 'ginasio', 'A2-ginasio', 8, 17),
    entrada(g, 'A', 'casa-c', 'A2-casa-aroeira', 6, 8),
    entrada(g, 'P', 'posto', 'A2-posto', 6, 8),
    entrada(g, 'V', 'venda', 'A2-venda', 5, 7),
    entrada(g, 'H', 'casa-a', 'A2-casa-1', 5, 7),
    entrada(g, 'J', 'casa-d', 'A2-casa-2', 5, 7),
  ],
  portoes: [{ x: qx, y: qy, h: 2, requer: 'insignia:1', sprite: 'npc-homem-4', fala: 'Alto lá! O vento nos Campos de Restinga hoje arranca até chapéu colado.\fO Mestre Gaivota mandou segurar a porteira: só passa quem tiver a Insígnia da Pena e souber ler o vento.' }],
  npcs: [
    { id: 'a2-cabaceiro', sprite: 'npc-idoso', x: 37, y: 7, dir: 's', script: 'artesao-cuias' }, // Mestre Cabaceiro, cuias artesanais (src/data/eventos/captura.ts)
    gente(g, '1', 'a2-pipeiro', 'cl-crianca-m', 'Pipeiro Zeca', { mov: 'vagar', fala: ['Minha pipa subiu tanto que um Pipirim fez ninho nela.', 'Agora eu não tenho coragem de puxar a linha.'] }),
    gente(g, '2', 'a2-moca', 'npc-mulher-1', 'Moça da Fonte', { mov: 'olhar', fala: ['Criaturas do tipo Vento voam por cima dos golpes de Terra. Nem sentem!', 'Mas um bom choque do tipo Trovão derruba qualquer passarinho metido.'] }),
    gente(g, '3', 'a2-pintinhas', 'cl-crianca-f', 'Bela', { script: 'm-pintinhas' }),
    gente(g, '4', 'a2-pescador', 'cl-pescador', 'Pescador Raimundo', { dir: 'o', script: 'pescador-vara' }),
    gente(g, '5', 'a2-idoso', 'npc-idoso', 'Seu Nonô', { fala: ['O Mestre Gaivota perdeu de mim no dominó em 1974.', 'Desde então ele só batalha. Diz que no vento ninguém rouba.'] }),
    gente(g, '6', 'a2-surfista', 'cl-surfista', 'Surfista Kiko', { mov: 'olhar', fala: ['Tá vendo aquela ilhota lá embaixo, na enseada? Tem coisa lá.', 'Só chega quem rema. E canoa, por aqui, só anda com criatura do tipo Rio puxando.'] }),
  ],
  itens: [
    item(g, 'k', 'A2', 'mel-puro', 1, true),
    item(g, 'i', 'A2', 'cuia-rede', 3),
    item(g, 'o', 'A2', 'concha-rara', 1, true),
  ],
  gatilhos: [{ x: 21, y: 8, script: 'faro-chamada', se: 'insignia:1&!flag:faro-missao', umaVez: true }],
};
export default zona;
