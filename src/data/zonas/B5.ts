/**
 * B5 · Cidade Ginga — passo 11. Ginásio Ginga (Mestre Gingado), rodas de capoeira na praça e a Feira.
 * A leste fica a Lagoa do Berimbau: do píer se vê o poço fundo (Mergulho, insígnia 12) que leva ao Túnel Alagado.
 */
import type { ZonaDef } from '../../core/tipos';
import { Grade, npc } from './_b2-lib';

const g = new Grade(52, 40, '.');
g.q(0, 0, 52, 40, 'T').r(0, 1, 52, 1, 'T').r(0, 38, 52, 1, 'T');
g.t(1, 2, 'TTT', 'TT', 'T').t(8, 2, 'TT_TTT', '_T__T').t(30, 2, 'TTTT_TTTT', '_TT___TT').t(1, 33, 'T', 'TT', 'TTT', 'TTTT', 'TTTTT').t(41, 36, 'TTTTTTTTTT', 'TTTTTTTTTT');
// Lagoa do Berimbau, areia da margem, píer e ilhota
g.r(42, 4, 9, 32, '~').r(41, 5, 1, 31, ';').r(40, 16, 1, 9, ';').r(42, 2, 9, 2, 'T').p('~', 41, 9, 41, 10, 41, 11, 41, 28, 41, 29);
g.r(42, 20, 4, 2, '=').r(47, 12, 3, 3, 'd').r(45, 28, 4, 3, ';').p('T', 46, 28).p(',', 47, 29);
// ruas: a principal (oeste-leste) e a avenida do ginásio
g.r(0, 20, 42, 2, ':').r(25, 8, 2, 29, ':').p('T', 0, 21);
g.via(':', 14, 18, 14, 19).via(':', 33, 18, 33, 19).via(':', 6, 13, 6, 19).via(':', 40, 13, 40, 19).via(':', 19, 13, 19, 19);
g.via(':', 9, 31, 9, 32, 24, 32).via(':', 38, 31, 38, 32, 27, 32).r(26, 36, 15, 1, ':');
// praça da roda: areia batida, roda grande e canteiros de flores
g.r(15, 23, 21, 8, ';').r(25, 23, 2, 8, ':').t(17, 24, '_,,,,,_', ',:::::,', ',:::::,', ',:::::,', ',:::::,', '_,,,,,_');
g.p(',', 15, 23, 35, 23, 15, 30, 35, 30, 28, 30, 33, 24).p('b', 16, 23, 34, 30);
// barracas ao ar livre da feira (balcões) e cercas
g.r(28, 34, 4, 1, 'M').r(34, 34, 4, 1, 'M').r(28, 33, 10, 1, '.').r(3, 24, 1, 6, 'f').r(13, 34, 8, 1, 'f');
// jardim do ginásio e canteiros de frutos
g.r(21, 8, 4, 2, ',').r(27, 8, 4, 2, ',').p('b', 21, 7, 22, 7, 29, 7, 30, 7).p('C', 10, 9, 11, 9, 44 - 34, 10);
g.p('T', 4, 8, 16, 8, 22, 12, 30, 13, 36, 8, 37, 16, 10, 16, 3, 18, 22, 17, 29, 17, 5, 36, 12, 37, 22, 36, 39, 26, 39, 34).p('t', 9, 14, 36, 14, 14, 36);
g.p(',', 8, 18, 17, 19, 23, 14, 31, 19, 36, 19, 6, 24, 8, 26, 11, 24, 37, 24, 38, 28, 20, 34, 17, 36).p('b', 4, 22, 12, 22, 38, 22, 23, 18, 28, 18);

const zona: ZonaDef = {
  id: 'B5', nome: 'Cidade Ginga', mapa: 'B', tipo: 'cidade', tileset: 'cerrado', musica: 'cidade-samba', arena: 'cerrado', passo: 11, pouso: [14, 18],
  mapaChars: g.fim(),
  objetos: [
    { o: 'ginasio', x: 23, y: 7, cor: '#7a3b12,#c9702a,#f2b25a' }, { o: 'posto', x: 12, y: 17 }, { o: 'venda', x: 32, y: 17 }, { o: 'mercado', x: 6, y: 30 },
    { o: 'casa-colonial-a', x: 5, y: 12 }, { o: 'casa-colonial-b', x: 38, y: 12 }, { o: 'casa-colonial-c', x: 36, y: 30 }, { o: 'casa-e', x: 18, y: 12 },
    { o: 'coreto', x: 29, y: 28 }, { o: 'fonte', x: 31, y: 24 }, { o: 'banco', x: 21, y: 30 }, { o: 'banco', x: 31, y: 30 }, { o: 'banco', x: 35, y: 19 },
    { o: 'poste', x: 24, y: 19 }, { o: 'poste', x: 27, y: 22 }, { o: 'poste', x: 39, y: 22 }, { o: 'poste', x: 11, y: 19 }, { o: 'poste', x: 24, y: 31 },
    { o: 'placa', x: 2, y: 19 }, { o: 'placa', x: 27, y: 10 }, { o: 'placa', x: 39, y: 19 }, { o: 'placa', x: 11, y: 31 },
    { o: 'ipe-amarelo', x: 17, y: 22 }, { o: 'ipe-roxo', x: 34, y: 22 }, { o: 'estatua', x: 23, y: 10 }, { o: 'canoa', x: 42, y: 24 }, { o: 'coqueiro', x: 40, y: 8 }, { o: 'coqueiro', x: 40, y: 30 },
  ],
  placas: [
    { x: 2, y: 19, texto: 'CIDADE GINGA\n"Quem não ginga, tropeça."' },
    { x: 27, y: 10, texto: 'GINÁSIO DE CIDADE GINGA\nLíder: Mestre Gingado, o pé que canta.\nInsígnia Berimbau.' },
    { x: 39, y: 19, texto: 'LAGOA DO BERIMBAU\nO poço fundo no meio é a boca do Túnel Alagado.\nProibido mergulhar sem Amuleto. (O salva-vidas é uma capivara e ela está de folga.)' },
    { x: 11, y: 31, texto: 'FEIRA DA CIDADE GINGA\nFrutos, cuias de artesão e pergaminhos.\nÀs quintas tem prova grátis de cocada.' },
  ],
  warps: [
    { x: 0, y: 20, para: { zona: 'B-R3', x: 98, y: 16, dir: 'o' }, tipo: 'borda' },
    { x: 26, y: 7, para: { zona: 'B5-ginasio', x: 8, y: 17, dir: 'n' }, tipo: 'porta' },
    { x: 14, y: 17, para: { zona: 'B5-posto', x: 6, y: 8, dir: 'n' }, tipo: 'porta' },
    { x: 33, y: 17, para: { zona: 'B5-venda', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { x: 9, y: 30, para: { zona: 'B5-feira', x: 8, y: 9, dir: 'n' }, tipo: 'porta' },
    { x: 6, y: 12, para: { zona: 'B5-casa-1', x: 4, y: 6, dir: 'n' }, tipo: 'porta' },
    { x: 40, y: 12, para: { zona: 'B5-casa-2', x: 4, y: 6, dir: 'n' }, tipo: 'porta' },
    { x: 38, y: 30, para: { zona: 'B5-casa-3', x: 6, y: 8, dir: 'n' }, tipo: 'porta' },
    { x: 19, y: 12, para: { zona: 'B5-casa-4', x: 4, y: 6, dir: 'n' }, tipo: 'porta' },
    ...[47, 48, 49].flatMap((x) => [12, 13, 14].map((y) => ({ x, y, para: { zona: 'B-TA', x: 5, y: 5, dir: 's' as const } }))),
  ],
  npcs: [
    npc('berimbau', 'Tocador Caxixi', 'cl-repentista', 20, 23, 's', ['♪ Tim, tim, tim, dom, dom… ♪', 'Na roda só entra quem bate palma no tempo. Você bate palma igual a quem espanta mosquito, mas tudo bem.']),
    npc('roda-a', 'Capoeirista Besouro', 'cl-capoeirista', 18, 26, 'l', ['Aqui a gente treina com as criaturas, não contra elas.', 'Criatura do tipo Ginga derruba Pedra, Ferro e Geada. Mas se aparecer um passarinho… a gente perde o rebolado.']),
    npc('roda-b', 'Capoeirista Maré', 'cl-capoeirista', 22, 27, 'o', ['O Mestre Gingado luta em dupla: duas criaturas de cada lado, no compasso.', 'Se a sua equipe não conversa entre si, ele dança em cima de você.']),
    npc('guia', 'Seu Dedé', 'npc-idoso', 24, 11, 'l', ['O ginásio é uma academia: cada duelo acontece no toque do berimbau.', 'Tipo Vento e tipo Mente fazem o povo do Mestre perder o passo. Tipo Encanto também.', 'Eu? Eu só guardo os chinelos da turma.'], { mov: 'olhar' }),
    npc('pier', 'Pescador Tainha', 'cl-pescador', 41, 19, 'l', ['Tá vendo a água escura lá no meio? É fundo que não acaba mais.', 'O túnel por baixo sai lá no Brejo Roxo. Meu avô atravessava prendendo o fôlego. Meu avô mentia muito.', 'Sem o Amuleto do Mergulho da Engenheira Bigorna, de Vila Ferrugem, nem tente.']),
    npc('menina', 'Ritinha', 'cl-crianca-f', 29, 25, 's', ['Eu sei dar estrela, ponte e bananeira!', 'A minha Quatizão só sabe dar trabalho.'], { mov: 'vagar' }),
    npc('fofoqueira', 'Dona Marocas', 'npc-mulher-2', 10, 22, 'l', ['Menino, passou por aqui um povo de macacão cor de ferrugem comprando sacos e mais sacos de cal.', 'Disseram que iam "limpar" o Brejo Roxo. Desde quando brejo se limpa?', 'Eu não sou de falar da vida alheia. Mas que é esquisito, é.']),
    npc('feirante-1', 'Seu Quiabo', 'npc-homem-1', 29, 33, 's', ['Olha a garrafada! Levanta até defunto de criatura!', 'Levanta nada. Mas cura que é uma beleza.'], { loja: ['garrafada', 'elixir-andiroba', 'cha-guarana', 'garapa', 'pomada-copaiba'] }),
    npc('feirante-2', 'Dona Cocada', 'npc-mulher-3', 35, 33, 's', ['Biscoito de polvilho, rapadura e fumaça de andiroba!', 'A rapadura é dura. O preço também.'], { loja: ['biscoito-de-polvilho', 'rapadura', 'fumaca-andiroba', 'fumaca-andiroba-forte', 'corda-de-cipo'] }),
    npc('turista', 'Turista Evaristo', 'npc-homem-4', 33, 36, 'n', ['Vim de Porto Sereia só para a feira.', 'Já comprei um berimbau, dois caxixis e uma dor nas costas tentando dar um aú.']),
    npc('vigia-lagoa', 'Mergulhador Baiacu', 'cl-mergulhador', 40, 23, 'l', ['Eu treino apneia aqui. Meu recorde é dois minutos.', 'A minha Poraquê aguenta vinte. E ainda acende a luz lá embaixo.', 'No Túnel Alagado o caminho sobe para uma gruta com ar no meio. Guarde fôlego e remédio.']),
    npc('espiao', 'Homem de Macacão', 'capanga-m', 3, 31, 'l', ['…', 'Tá olhando o quê? Estou só… contando caixotes.', 'Circulando, circulando.'], { se: '!flag:laboratorio-ok' }),
    npc('porteiro-mestre', 'Contramestre Zumbi', 'cl-capoeirista', 39, 31, 'o', ['A casa de azulejo é a Academia do Mestre Cabaça, o mais velho da cidade.', 'Ele anda procurando três alunos fujões. Se quiser ajudar, entre.']),
  ],
  itens: [
    { x: 47, y: 30, item: 'pedra-mare', flag: 'B5-i1' },
    { x: 5, y: 26, item: 'cuia-rapida', qtd: 2, flag: 'B5-i2' },
    { x: 37, y: 9, item: 'garapa', oculto: true, flag: 'B5-o1' },
    { x: 16, y: 30, item: 'pena-colorida', oculto: true, flag: 'B5-o2' },
    { x: 20, y: 37, item: 'mel-puro', qtd: 2, oculto: true, flag: 'B5-o3' },
  ],
};
export default zona;
