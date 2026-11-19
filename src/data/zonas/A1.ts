import type { ZonaDef } from '../../core/tipos';
import { grade, obj, entrada, saidas, gente, item, placa } from './_a1-grade';

/**
 * A1 · Vila Jacarandá — a vila onde tudo começa: a casa do jogador, o laboratório da Profª Ipê e a praia.
 * Segredos para voltar depois: o bosque fechado por cipó (Facão), a ilhota da lagoa (Remo) e a toca de pedra da praia (Facão).
 */
const g = grade('A1', [
  'TTTTTTTTTTTTTTTTTTTNNTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTTTTT::TTTTTTTTTTTTTTTTTTT',
  'TTTTTTT...,....tTTfGfTTt...,....~~~~~TTT',
  'TTk.c..........,...::e.........~~~~j~~TT',
  'TTTTT..,...........::..,.......~~~~~~~TT',
  'TT..........b......::...........~~~~~.TT',
  'TT...,.............::......1.....,....TT',
  'TT...........C.C...::.................TT',
  'TT.................::...............t.TT',
  'TT...H.............::.................TT',
  'TT.....:...2....I..::.................TT',
  'TT.q...::::::::::::::..........I......TT',
  'TT.....,.........y.::..............,..TT',
  'TT...........B.....::.................TT',
  'TT..I..............::...L......3......TT',
  'TT..,..............::::::::r..........TT',
  'TT.................::.............,...TT',
  'TT...,.......4.....::....,............TT',
  'TT.................::.................TT',
  'TT.................::...............b.TT',
  'TT......Z..........::.................TT',
  'TT.......:.........::.......R.........TT',
  'TT...s...::::::::::::::::::::::..u....TT',
  'TT.......,.........::.................TT',
  'TT;;;;;;;....5.....::........;;;;;;;;;TT',
  'T;;;;;;;;;;;;;;;;;;::;;;;;;;;;;;;;;;;;;T',
  'T;;o;;;;;;;;;;6;;;;==;;;;;;;;;;;##c##;;T',
  'T;;~~~~~;;;;~~~~~~~==~~~~~~~;;;;#;;i#~~T',
  'T~~~~~~~~~~~~~~~~~~h=~~~~~~~~~~~#####~~T',
  '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
], {
  N: ':', G: ':', H: '.', L: '.', R: '.', Z: '.', k: '.', j: ';', i: ';', o: ';', h: '=', e: '.', q: '.', r: '.', s: '.', u: '.',
  I: '.', y: '.', B: '.', '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': ';',
});
const placas = [
  placa(g, 'e', 'VILA JACARANDÁ\n"Onde a sombra é roxa e o café é forte."'),
  placa(g, 'q', 'Casa de {JOGADOR}.'),
  placa(g, 'r', 'LABORATÓRIO DA PROFª IPÊ AMARELO\nPesquisa de criaturas de Pindorama. Bata antes de entrar (ninguém bate).'),
  placa(g, 's', 'Casa da Vó Zica.\nVendem-se cocadas (quando sobram).'),
  placa(g, 'u', 'Casa da família da {RIVAL}.\n"Cuidado com a campeã" (a placa foi ela que pintou).'),
];
const zona: ZonaDef = {
  id: 'A1', nome: 'Vila Jacarandá', mapa: 'A', tipo: 'cidade', tileset: 'costa', musica: 'vila-jacaranda', arena: 'restinga', passo: 1,
  pouso: [7, 10],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'H', 'casa-b'), obj(g, 'L', 'laboratorio'), obj(g, 'R', 'casa-a'), obj(g, 'Z', 'casa-e'),
    ...g.todos('I').map(([x, y]) => ({ o: 'ipe-roxo', x, y })),
    obj(g, 'y', 'poste'), obj(g, 'B', 'banco'),
    obj(g, 'h', 'cabeco-amarra', { script: 'm-chapeu-pier' }),
    ...placas.map((p) => p.objeto),
  ],
  placas: placas.map((p) => p.placa),
  warps: [
    ...saidas(g, 'N', 'A-R1', 14, 78, 'n'),
    entrada(g, 'H', 'casa-b', 'A1-casa-jogador', 5, 8),
    entrada(g, 'L', 'laboratorio', 'A1-lab', 7, 10),
    entrada(g, 'R', 'casa-a', 'A1-casa-1', 5, 7),
    entrada(g, 'Z', 'casa-e', 'A1-casa-2', 5, 7),
  ],
  portoes: [{ x: g.p('G')[0], y: g.p('G')[1], requer: 'flag:inicial', sprite: 'npc-homem-2', fala: 'Opa, {JOGADOR}, devagar com o andor! A grama alta da Trilha do Ipê é cheia de criatura arisca.\fSem uma parceira do lado, você não passa. A Profª Ipê está no laboratório — fala com ela!' }],
  npcs: [
    gente(g, '1', 'a1-jardineira', 'npc-mulher-2', 'Dona Flor', { mov: 'vagar', fala: ['Jacarandá florido é sinal de prova chegando, dizia minha mãe.', 'Por via das dúvidas, eu varro as flores e não estudo nada.'] }),
    gente(g, '2', 'a1-menino', 'cl-crianca-m', 'Tico', { mov: 'olhar', fala: ['Sabia que dá pra plantar fruto nos canteiros de terra fofa?', 'Planta, espera um tempinho e colhe um punhado. O difícil é esperar!'] }),
    gente(g, '3', 'a1-assistente', 'npc-homem-1', 'Assistente Juca', { fala: ['A professora mandou eu contar quantos Pipirins passam por dia.', 'Já contei 212. Ou foi o mesmo Pipirim 212 vezes. Ciência é dúvida.'] }),
    gente(g, '4', 'a1-zica', 'npc-idosa', 'Vó Zica', { script: 'm-chapeu' }),
    gente(g, '5', 'a1-pescador', 'cl-pescador', 'Seu Bento', { dir: 's', fala: ['Do outro lado da Baía Azul fica a Cidade Coral. De canoa é um pulo.', 'A pé é um pulo também, mas você afunda.'] }),
    gente(g, '6', 'a1-menina', 'cl-crianca-f', 'Lili', { mov: 'vagar', fala: ['Tem uma toca de pedra ali no canto da praia, fechada de cipó.', 'Meu irmão jura que viu uma coisa brilhando lá dentro!'] }),
  ],
  itens: [
    item(g, 'k', 'A1', 'cuia-trancada', 2),
    item(g, 'j', 'A1', 'pedra-mare'),
    item(g, 'i', 'A1', 'pt-14'),
    item(g, 'o', 'A1', 'concha-rara', 1, true),
  ],
};
export default zona;
