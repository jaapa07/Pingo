import type { ZonaDef, NpcDef } from '../../core/tipos';
import { grade, obj, entrada, saidas, gente, duelista, item, placa } from './_a1-grade';

/**
 * A4 · Porto Sereia — cidade portuária: Estação do Trem Serra-Sol (norte), Ginásio do Rio (Capitã Marola), mercado de
 * peixe, praia e o cais sul, de onde se rema para a Baía Azul. A boca da Gruta do Eco fica no paredão do noroeste.
 * A estrada leste (Usina Velha) só abre com a Insígnia da Concha. O cais sul pede o Remo (insígnia 3) E a luz da Usina
 * (`usina-ok`, que religa o guincho das canoas). A estação reabre com a luz, mas o trem é só para Campeões da Liga.
 * Para depois: o platô da trepadeira (Escalar), a ilhota do sudoeste (Remo) e a toca de pedra do cipó (Facão).
 */
const g = grade('A4', [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TT########|#######TTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TT########|#.....#TTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TT########|#..Z..#T..|..........|...I......|..........|.......TTT',
  'TT###G####|###e###...|.,........|..........|..........|.......TTT',
  'TT....:...|..........|..........|..........|..........|.......TTT',
  'TT....:...|....t.....|......,...|..........|..........|.......TTT',
  'TT....:.a.|..........|..........|..........|S.......q.|.......TTT',
  'TT....::::|::::::::::|::::::::::|::::::::::|::::::....|.......TTT',
  'TT........|..........|.........:|:.........|..........|..t....TTT',
  'TT.,......|....I.....|.........:|:.........|.....y....|.......TTT',
  'TT........|..........|.........:|:.........|..........|...,...TTT',
  'TT........|..........|P........:|:..V......|..........|.......TTT',
  'TT........|..........|..:.m....:|:...:.n...|..........|.......TTT',
  'TT........|..........|..::::::::|:::::.....|...I......|.......TTT',
  'TT........|..........|.........:|:.........|..........|.......TTT',
  'TT........|Y.....u...|.........:|:.........|..........|.......TTT',
  'TT........|...:......|.........:|:....1....|..........|..b....TTT',
  'TT...I....|...:......|....F....:|:.........|......2...|.......TTT',
  'TT........|...:......|.........:|:.........|..........|.....fffTT',
  'TT::::::::|::::::::::|::::::::::|::::::::::|::::::::::|:::::Q::WE',
  'TT........|..........|.........:|:s........|..........|.....fffTT',
  'TT........|..........|.........:|:.........|..........|.......TTT',
  'TT........|...I......|.........:|:.........|..........|.......TTT',
  'TT........|..........|.........:|:.....K...|..j.y.....|.......TTT',
  'TT........|..........|.........:|::::::::::|:.........|.......TTT',
  'TT......A.|.........B|.........:|:.....3...|........H.|...4...TTT',
  'TT........|:.........|.:.i.....:|:.........|..........|.:.....TTT',
  'TT.......h|::::::::::|::::::::::|:.........|..........|k:.....TTT',
  'TT........|..........|.........:|::::::::::|::::::::::|::.....TTT',
  'TT........|....C.C...|.........:|:.........|...C.C....|.......TTT',
  'TT..,.....|..........|.........:|:.........|..........|.......TTT',
  'TT........|..........|.....5...:|:.........|..........|..,....TTT',
  'TT;;;;;;;;|;;;;......|.........:|:.........|......;;;;|;;;;;;;TTT',
  'TT;;;;;;;;|;;;;;;;;;;|;;;;;;;;;:|:;;;;;;;;;|;;;;;;;;;;|;;;;;;;;TT',
  'T;;;;;;;;;|;;;;;;;;;;|;;;;;;;;;:|:;;;;;;;;;|;;;;;;;;;;|;;;;;;;;;T',
  'T;;##;;;;;|;;;6;;;;;;|;;;;;;;;;:|:;;;;;;;;;|;;7;;;;;;;|;;;;;;;;;T',
  'T;###;;;;;|;;;;;;;;;;|;;;;;;;;;;|=;;;;;;;;;|;;;;;;;;;;|;;;##c##;T',
  'T~~~~~;;;;|;;;;;~~~~~|~~~~~~;;;;|=;;;;~~~~~|~~~~;;;;;;|;;;#;;z#;T',
  '~~~~~~~~;;|;;;~~~~~~~|~~~~~~~~~~|=~~~~~~~~~|~~~~~~~;;;|;;;#####~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~==|===~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~;;~~~~~|~~~~~~~~~~|~~~~~~~~8=|=9=~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~;;X;~~~~|~~~~~~~~~~|~~~~~~~~~~|=~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~;;~~~~~|~~~~~~~~~~|~~~~~~~~~~|=~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|D~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
], {
  G: '#', Y: '.', S: '.', P: '.', V: '.', K: '.', A: '.', B: '.', H: '.', F: '.', I: '.', y: '.', Z: '.', z: ';', X: ';',
  a: '.', q: '.', m: '.', n: '.', u: '.', j: '.', h: '.', i: '.', k: '.', s: '.',
  Q: ':', W: ':', E: ':', D: '=',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': ';', '7': ';', '8': '=', '9': '=',
});
const placas = [
  placa(g, 'a', 'GRUTA DO ECO\nAtalho para a Trilha dos Cipós e Bosque Alto. Grite "oi" lá dentro: ela responde com juros.'),
  placa(g, 'q', 'ESTAÇÃO DE PORTO SEREIA\nTrem Serra-Sol — Porto Sereia ↔ Sertão das Névoas.\nLinha da serra: embarque só para Campeões da Liga dos Guardiões.'),
  placa(g, 'm', 'POSTO GUARDIÃO\nCura grátis. Sal grosso na porta por conta da casa.'),
  placa(g, 'n', 'VENDA DO PORTO\nCuias, remédios e novidade que chega de trem.'),
  placa(g, 'u', 'GINÁSIO DE PORTO SEREIA\nLíder: Capitã Marola — "quem não sabe remar, que aprenda a nadar".'),
  placa(g, 'j', 'MERCADO DE PEIXE\nPeixe fresco, fruto maduro e raridade de além-mar. Feira todo dia.'),
  placa(g, 'h', 'Casa do Mestre Remendo, o veleiro.'),
  placa(g, 'i', 'Casa da Dona Enseada.\nRendas e fofocas sob encomenda.'),
  placa(g, 'k', 'Casa do Clube do Anzol.\nSócio paga com história de pescador.'),
  placa(g, 's', 'PORTO SEREIA\n"Onde o rio encontra o mar e o trem encontra os dois."\nNorte: Estação · Leste: Estrada da Usina · Sul: Cais'),
];
const [qx, qy] = g.p('Q'), [dx, dy] = g.p('D');
const zona: ZonaDef = {
  id: 'A4', nome: 'Porto Sereia', mapa: 'A', tipo: 'cidade', tileset: 'costa', musica: 'cidade-frevo', arena: 'praia', passo: 3,
  pouso: [22, 13],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'G', 'caverna-entrada'), obj(g, 'S', 'estacao'), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'), obj(g, 'K', 'mercado'),
    obj(g, 'A', 'casa-c'), obj(g, 'B', 'casa-b'), obj(g, 'H', 'casa-f'),
    obj(g, 'F', 'fonte'),
    ...g.todos('I').map(([x, y]) => ({ o: 'ipe-amarelo', x, y })), ...g.todos('y').map(([x, y]) => ({ o: 'poste', x, y })),
    obj(g, 'Y', 'ginasio', { cor: '#1f5f8f,#3f9fd0,#bfe8f5' }),
    { o: 'barco', x: 34, y: 42 }, { o: 'saveiro', x: 18, y: 43 }, { o: 'jangada', x: 14, y: 39 }, { o: 'canoa', x: 26, y: 42 },
    { o: 'coqueiro', x: 5, y: 34 }, { o: 'coqueiro', x: 17, y: 34 }, { o: 'coqueiro', x: 41, y: 34 }, { o: 'coqueiro', x: 50, y: 35 }, { o: 'coqueiro', x: 9, y: 37 },
    ...placas.map((p) => p.objeto),
  ],
  placas: placas.map((p) => p.placa),
  warps: [
    entrada(g, 'G', 'caverna-entrada', 'A-GE', 45, 2, { tipo: 'caverna', para: { zona: 'A-GE', x: 45, y: 2, dir: 's' } }),
    entrada(g, 'S', 'estacao', 'A4-estacao', 8, 9),
    entrada(g, 'P', 'posto', 'A4-posto', 6, 8),
    entrada(g, 'V', 'venda', 'A4-venda', 5, 7),
    entrada(g, 'K', 'mercado', 'A4-mercado', 7, 8),
    entrada(g, 'A', 'casa-c', 'A4-casa-1', 5, 7),
    entrada(g, 'B', 'casa-b', 'A4-casa-2', 5, 7),
    entrada(g, 'H', 'casa-f', 'A4-casa-3', 5, 7),
    entrada(g, 'Y', 'ginasio', 'A4-ginasio', 8, 17),
    ...saidas(g, 'E', 'A-R4', 1, 12, 'l'),
    { x: dx, y: dy, para: { zona: 'A-BA', x: 4, y: 20, dir: 'l' }, tipo: 'borda', requer: 'amuleto:remo&flag:usina-ok', recusa: 'O cais termina aqui. Para lá é só Baía Azul.\fSem o Amuleto do Remo ninguém sai do porto — e, enquanto a Usina Velha não devolver a luz, o guincho das canoas não desce nem com reza.' },
  ],
  portoes: [
    { x: qx, y: qy, requer: 'insignia:3', sprite: 'npc-homem-2', fala: 'Estrada da Usina interditada! Tem fio solto cuspindo faísca por todo lado.\fA Capitã Marola mandou liberar só para quem tiver a Insígnia da Concha. Ordem é ordem, e a dela vem com apito.' },
    { x: 44, y: 8, requer: 'flag:usina-ok', sprite: 'npc-maquinista', fala: 'Estação fechada, freguesia. Sem energia da Usina Velha, a Maria-Fumaça não apita nem para espantar galinha.\fQuando a luz voltar eu abro a porta. Embarcar já é outra conversa: a linha da serra é só para Campeões da Liga.' },
  ],
  npcs: [
    // Ginásio de Treino (revanches dos líderes, spec 10A item 25): o guia leva até o salão; eventos em src/data/eventos/regras.ts
    { id: 'a4-guia-treino', sprite: 'npc-homem-2', x: 17, y: 17, dir: 'o', se: 'flag:liga-vencida', script: 'treino-guia', nome: 'Guia do Treino' } as NpcDef,
    gente(g, '1', 'a4-moca', 'npc-mulher-2', 'Moça do Guarda-sol', { mov: 'olhar', fala: ['Criatura do tipo Rio apaga Brasa, afoga Terra e desgasta Pedra.', 'Para enfrentar a Capitã Marola, leve Mata ou Trovão. E um casaco: lá dentro respinga.'] }),
    gente(g, '2', 'a4-menino', 'cl-crianca-m', 'Biu', { mov: 'vagar', fala: ['Quando eu crescer vou ser maquinista do Trem Serra-Sol!', 'Ou sorveteiro. O que tiver menos fila.'] }),
    gente(g, '3', 'a4-feirante', 'npc-vendedor', 'Feirante Deodato', { script: 'm-peixe' }),
    gente(g, '4', 'a4-senhora', 'npc-idosa', 'Dona Maroca', { fala: ['No meu tempo, a luz da Usina Velha nunca piscava.', 'Agora pisca tanto que meu rádio aprendeu código Morse sozinho.'] }),
    gente(g, '5', 'a4-surfista', 'cl-surfista', 'Surfista Lua', { mov: 'vagar', fala: ['A Baía Azul liga tudo: a Cidade Coral, a Ilha do Farol, a Praia das Tartarugas.', 'Mas sem Remo e sem parceira do tipo Rio, você só liga para a sua mãe vir buscar.'] }),
    gente(g, '9', 'a4-marinheiro', 'npc-marinheiro', 'Marinheiro Bartô', { dir: 'o', script: 'm-carta-barto' }),
    { id: 'taina', sprite: 'taina', x: 31, y: 36, dir: 'o', se: 'flag:usina-ok&!flag:rival-3', script: 'rival-3' },
    // missão "O Encontro das Águas" (Galo-Manaó, spec 6.5): roteiro em src/data/eventos/visitantes.ts
    { id: 'vis-taruma', sprite: 'npc-idoso', x: 32, y: 38, dir: 'o', script: 'vis-canoeiro' },
    duelista(g, '6', 'A4-1', 'cl-surfista', 'l', 4),
    duelista(g, '7', 'A4-2', 'cl-rendeira', 'o', 4, { mov: 'olhar' }),
    duelista(g, '8', 'A4-3', 'cl-pescador', 'l', 2),
  ],
  itens: [
    item(g, 'Z', 'A4', 'pt-31'),
    item(g, 'z', 'A4', 'pt-15'),
    item(g, 'X', 'A4', 'pedra-mare'),
    { x: 3, y: 35, item: 'concha-rara', oculto: true, flag: 'item:A4:3,35' },
    { x: 46, y: 38, item: 'concha-rara', oculto: true, flag: 'item:A4:46,38' },
    { x: 55, y: 3, item: 'rapadura', oculto: true, flag: 'item:A4:55,3' },
  ],
  gatilhos: [{ x: 29, y: 35, w: 3, h: 4, script: 'rival-3', se: 'flag:usina-ok&!flag:rival-3' }],
};
export default zona;
