import type { TreinadorDef, MembroEquipe } from '../../core/tipos';

/**
 * Treinadores das missões dos Visitantes (spec 6.5): os quatro guardiões das Lanternas Boreais da "Expedição Boreal"
 * (182, Borealce). São pesquisadores do navio da Drª Solveig espalhados pelas zonas geladas do mapa B (B7, B-SG, B-LG,
 * B-R5), cada um com uma lanterna e uma equipe só de criaturas de Geada — pós-jogo (depois do Conselho, nv 64–70):
 * equipes de 66 a 70, sempre no estágio final (as linhas de Geada evoluem entre 28 e 40).
 * Ids começam por `B-` (curva do mapa B no verificador); o NPC de cada um é um script (`vis-lanterna-<n>`), não linha de visão.
 */
const exp = (id: string, classe: string, nome: string, sprite: string, equipe: MembroEquipe[], desafio: string, derrota: string, depois: string): TreinadorDef =>
  ({ id, classe, nome, sprite, equipe, ia: 'conselho', premio: 60 * Math.max(...equipe.map((m) => m.nv)), desafio, derrota, depois, itens: ['garrafada'], contato: false });

export const TREINADORES_VISITANTES: TreinadorDef[] = [
  exp('B-EXP-1', 'Glacióloga', 'Ingrid', 'pesquisadora-boreal',
    [{ e: 136, nv: 66 }, { e: 138, nv: 66 }, { e: 134, nv: 67 }],
    'Lanterna? Esta aqui? Eu a guardo desde que o navio encalhou. A Solveig disse para entregar só a quem aguentasse o frio do norte!',
    'Brrr. Você é mais quente do que parece.',
    'Na minha terra a neve dura meio ano. Aqui na serra ela dura uma manhã, e o povo ainda reclama.'),
  exp('B-EXP-2', 'Meteorologista', 'Halvard', 'pesquisador-boreal',
    [{ e: 134, nv: 67 }, { e: 140, nv: 67 }, { e: 136, nv: 68 }],
    'Pressão caindo, vento virando para o sul… e um desafiante subindo o morro. Previsão: batalha!',
    'Errei a previsão. Acontece até com satélite.',
    'O frio daqui vem do sul, com o minuano. O nosso vem do polo. Os dois cortam igual a orelha.'),
  exp('B-EXP-3', 'Mergulhadora Polar', 'Sigrid', 'pesquisadora-boreal',
    [{ e: 132, nv: 68 }, { e: 134, nv: 68 }, { e: 140, nv: 69 }],
    'A lagoa gelada é a coisa mais parecida com casa que eu achei por aqui. A lanterna fica comigo até alguém me tirar da água!',
    'Saí da água. Molhada e derrotada.',
    'Debaixo do gelo fino da lagoa tem Pinguimares dormindo em fila. Parecem uma família de casaco igual.'),
  exp('B-EXP-4', 'Navegador', 'Eirik', 'pesquisador-boreal',
    [{ e: 138, nv: 68 }, { e: 136, nv: 69 }, { e: 132, nv: 70 }],
    'Eu traço o rumo da expedição, e o rumo da última lanterna passa por mim. Bússola na mão, criaturas na neve!',
    'O norte é para lá. E a lanterna é sua.',
    'Com as quatro na mochila, suba ao alto do Pico Pindorama de noite e acenda todas juntas. Lá em cima o céu fica perto demais para mentir.'),
];
