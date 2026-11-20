import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente, placa } from './_a1-grade';
import { RIVAIS } from '../gincana';

/**
 * A-GN · Vale do Buriti-Alto — anexo do Platô da Liga, só depois de `liga-vencida` (o carreiro do terreiro de A-LG
 * traz e leva). Aqui fica a GINCANA DE CRIATURAS (spec 10A item 32): arena cercada com as três provas, a Juíza,
 * o quadro do ranking do dia e três rivais; a barraca de sucos do Seu Graviola (liquidificador: fruto → suco) e a
 * tesouraria (pontos → itens, tela `loja`). A saída leste dá na Portaria do Parque Safári (`A-SF`).
 * Eventos: src/data/eventos/posliga.ts. Sem grama alta: não há encontros no vale.
 */
const g = grade('A-GN', [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TT',
  'TT.B.....B|.........B|.....B..B.|TT',
  'TT..ffffff|ffffffffff|ffffffff..|TT',
  'TT..f;;;;;|;;;;;;;;;;|;;;;;;;f..|TT',
  'TT..f;;K;;|;;;;Q;;;;;|;;;S;;;f..|TT',
  'TT..f;;,,;|;;;;;;;;;;|;;;;;;;f..|TT',
  'TT..f;;;;;|;;;;;;;;;;|;;;;;;;f..|TT',
  'TT..ffffff|ffffffffff|ffffffff..|TT',
  'TT.....H..|...R..U...|I....J....|TT',
  'TT........|..........|.......L..|TT',
  'TT.:::::::|::::::::::|::::::::::|:E',
  'TTY:::::::|::::::::::|::::::::::|:E',
  'TT....4...|..........|..........|TT',
  'TT........|.........5|..........|TT',
  'TT........|..........|........6.|TT',
  'TT........|..........|..........|TT',
  'TT........|.....F....|..........|TT',
  'TT..D.....|..........|..V.......|TT',
  'TT.....G..|....Z.....|...N......|TT',
  'TT..,.....|.,.......,|......,...|TT',
  'TTbbb.....|.....bb...|......bbbb|TT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TT',
], {
  B: '.', K: ';', Q: ';', S: ';', H: '.', R: '.', U: '.', I: '.', J: '.', L: '.', E: ':', Y: '.',
  D: '.', V: '.', F: '.', G: '.', Z: '.', N: '.', '4': '.', '5': '.', '6': '.',
});
export const GN_CHEGADA: [number, number] = [3, 11];
const placas = [
  placa(g, 'H', 'PROVA DE AGILIDADE\nCorrida da Vereda: troque de raia, desvie de pedra e cupinzeiro, pegue estrelas. Conta a Velocidade.'),
  placa(g, 'I', 'PROVA DE FORÇA\nEmpurra-Tora: no ritmo certo a tora sobe o morro. Conta o Ataque; a Defesa segura o recuo.'),
  placa(g, 'J', 'PROVA DE SALTO\nSalto do Riacho: pule os troncos na hora certa. Velocidade dá tempo no ar; Defesa amortece o tombo.'),
  placa(g, 'L', 'Leste: PARQUE SAFÁRI DO BURITI-ALTO\nOeste: o carreiro desce para o Platô da Liga.'),
];
const [rx, ry] = g.p('R');
const zona: ZonaDef = {
  id: 'A-GN', nome: 'Vale do Buriti-Alto', mapa: 'A', tipo: 'cidade', tileset: 'cerrado', musica: 'cidade-catira', arena: 'cerrado', passo: 9,
  pouso: GN_CHEGADA,
  mapaChars: g.mapa,
  objetos: [
    ...g.todos('B').map(([x, y]) => ({ o: 'buriti', x, y })),
    obj(g, 'K', 'cupinzeiro', { texto: ['O cupinzeiro da Corrida da Vereda. Já levou tanto encontrão que os cupins pediram mudança.'] }),
    obj(g, 'Q', 'pedra-grande', { texto: ['O matacão do Empurra-Tora: a tora tem que passar dele para valer ponto.'] }),
    obj(g, 'S', 'tronco-caido', { texto: ['O tronco do Salto do Riacho, gasto de tanta pata e casco.'] }),
    obj(g, 'D', 'mercado', { texto: ['Barraca de Sucos do Seu Graviola: caju, pitanga, cupuaçu, pequi, jabuticaba, buriti, acerola e açaí.'] }),
    obj(g, 'V', 'venda', { texto: ['Tesouraria da Gincana: pontos de prova viram prêmio aqui.'] }),
    obj(g, 'F', 'fonte'),
    // quadro do ranking do dia (abre a tela `gincana-ranking`)
    { o: 'placa', x: rx, y: ry, script: 'gincana-quadro' },
    ...placas.map((p) => p.objeto),
  ],
  placas: placas.map((p) => p.placa),
  warps: [
    ...saidas(g, 'E', 'A-SF', 1, 9, 'l'),
  ],
  npcs: [
    gente(g, 'Y', 'carreiro-volta', 'npc-idoso', 'Carreiro Tião', { dir: 'l', script: 'carreiro-volta' }),
    gente(g, 'U', 'gincana-juiza', 'cl-escoteira', 'Juíza Bia Corrida', { dir: 's', script: 'gincana-juiza' }),
    gente(g, 'G', 'gincana-graviola', 'npc-vendedor', 'Seu Graviola', { dir: 's', script: 'gincana-sucos' }),
    gente(g, 'N', 'gincana-tesoureiro', 'npc-mulher-4', 'Tesoureira Pataca', { dir: 's', script: 'gincana-troca' }),
    gente(g, 'Z', 'gincana-curandeira', 'npc-idosa', 'Benzedeira Dona Fiota', { dir: 's', script: 'gincana-cura' }),
    ...RIVAIS.map((r, i) => gente(g, String(4 + i), r.id, r.sprite, r.nome, { mov: 'vagar' as const, script: `gincana-rival-${i + 1}` })),
  ],
};
export default zona;
