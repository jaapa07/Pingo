import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, entrada, bordas, saidas, gente, duelista, item, placa } from './_b1-lib';

/**
 * B9 · Porto Pantaneiro — cidade sem ginásio, cais do Saveiro (ligação com A5 Cidade Coral; chegada em (10, 24) olhando
 * para o norte, contrato de docs/HISTORIA.md). Norte: o canal sobe para o Pantanal Alagado (fechado pela rede do Cartel até
 * `pantanal-ok`). Leste: Estrada Vermelha para a Chapada Rubra — a Polícia Ambiental só abre a porteira depois do ninhal
 * salvo. Visível e fora de alcance: o Mirante do Porto, no alto do paredão do nordeste (Escalar, insígnia 10).
 */
const p = new Pincel(44, 32, '.').borda('T');
p.r(20, 0, 4, 22, '~').r(1, 22, 42, 1, ';').r(1, 25, 42, 6, '~').r(4, 23, 28, 2, '=').r(10, 25, 1, 1, '=').r(30, 25, 2, 3, '=');
p.via(':', 2, 1, 14, 41, 14).r(20, 14, 4, 2, '=').via(':', 1, 6, 16, 6, 21).via(':', 1, 32, 16, 32, 21);
p.q(33, 2, 10, 6, '#').r(34, 3, 8, 4, ',').p('e', 38, 7);
p.r(2, 2, 6, 3, '"').r(25, 3, 5, 3, '"').p('C', 13, 19, 15, 19).p('b', 18, 10, 25, 10, 2, 9);
p.r(42, 8, 1, 6, 'f').r(42, 16, 1, 6, 'f').t(43, 14, 'Z', 'Z').t(20, 0, 'NNNN');
p.t(4, 12, 'P').t(12, 12, 'A').t(26, 12, 'V').t(34, 12, 'B').t(25, 21, 'G').t(2, 21, 'I').t(8, 27, 'S').t(10, 25, 'X');
p.t(9, 16, 'a').t(31, 16, 'n').t(37, 8, 'h').t(12, 22, 'm');
p.t(16, 17, '1').t(36, 18, '2').t(14, 24, '3').t(28, 9, '4').t(8, 9, '5').t(33, 22, '6').t(39, 16, '7').t(17, 6, '8');
p.t(39, 4, 'k').t(3, 3, 'j').t(31, 27, 'z');
p.t(16, 3, 'u').t(10, 6, 'u').t(41, 20, 'u').t(19, 18, 'y');
const g = grade('B9', p.fim(), {
  Z: ':', N: '~', P: '.', A: '.', V: '.', B: '.', G: '.', I: '.', S: '~', X: '=', a: '.', n: '.', h: '.', m: ';',
  '1': '.', '2': '.', '3': '=', '4': '.', '5': '.', '6': ';', '7': '.', '8': '.', k: ',', j: '"', z: '=', u: '.', y: '.',
});
const placas = [
  placa(g, 'a', 'PORTO PANTANEIRO\nCais do Saveiro: Cidade Coral, na Costa do Sol, rio abaixo.\nNorte: canal do Pantanal. Leste: Estrada Vermelha.'),
  placa(g, 'n', 'ESTRADA VERMELHA ⇢ CHAPADA RUBRA\nTerra roxa, rocha rachada e sol na cabeça. Leve água.'),
  placa(g, 'h', 'MIRANTE DO PORTO\nDaqui de cima se conta os barcos. Daí de baixo, se conta os degraus que faltam.'),
  placa(g, 'm', 'CAIS DO SAVEIRO\nEmbarque pela prancha. Bilhete na mão, criatura na cuia, chapéu amarrado.'),
];
const zona: ZonaDef = {
  id: 'B9', nome: 'Porto Pantaneiro', mapa: 'B', tipo: 'cidade', tileset: 'pantanal', musica: 'cidade-choro', arena: 'pantanal', passo: 10,
  pouso: [6, 13],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'P', 'posto'), obj(g, 'A', 'casa-c'), obj(g, 'V', 'venda'), obj(g, 'B', 'casa-a'), obj(g, 'G', 'mercado'), obj(g, 'I', 'igreja'),
    obj(g, 'S', 'saveiro'),
    ...objs(g, 'u', 'buriti'), ...objs(g, 'y', 'ipe-roxo'),
    { o: 'cabeco-amarra', x: 5, y: 24 }, { o: 'cabeco-amarra', x: 21, y: 24 }, { o: 'ancora', x: 28, y: 23 },
    { o: 'barco', x: 16, y: 28 }, { o: 'canoa', x: 36, y: 27 }, { o: 'poste', x: 11, y: 13 }, { o: 'poste', x: 25, y: 13 }, { o: 'poste', x: 18, y: 22 },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...bordas(g, 'N', 'B-PA', 26, 54, 'n', 1, 0),
    ...bordas(g, 'Z', 'B-R2', 1, 14, 'l', 0, 1),
    ...saidas(g, 'X', 'A5', 30, 34, 'n', 'saveiro', { requer: 'item:bilhete-saveiro', recusa: 'O mestre do Saveiro confere a mochila:\n— Sem o Bilhete do Saveiro não desço o rio, Campeão. O Cacique Aracê entrega um junto com o Passe do Trem.' }),
    entrada(g, 'P', 'posto', 'B9-posto', 6, 8),
    entrada(g, 'V', 'venda', 'B9-venda', 5, 7),
    entrada(g, 'A', 'casa-c', 'B9-casa-1', 5, 7),
    entrada(g, 'B', 'casa-a', 'B9-casa-2', 5, 7),
  ],
  portoes: [{ x: 42, y: 14, w: 1, h: 2, requer: 'flag:pantanal-ok', sprite: 'npc-homem-2', fala: 'Um guarda da Polícia Ambiental fecha a porteira da Estrada Vermelha:\n— Estrada interditada! O Cartel Ferrugem está escoando bicho roubado do ninhal por aqui.\f— Enquanto aquele tenente de arame farpado mandar no ninhal, ninguém sobe para a Chapada. Se alguém der um jeito nele… aí eu abro.' }],
  npcs: [
    duelista(g, '1', 'B9-1', 'cl-pescador', 'l', 3),
    duelista(g, '2', 'B9-2', 'cl-surfista', 'o', 4),
    gente(g, '3', 'b9-mestre-saveiro', 'npc-marinheiro', 'Mestre Arapuã', { dir: 's', fala: ['Saveiro de volta para a água, Campeão! Tábua nova, vela nova, mestre velho.', 'Desce o rio até Cidade Coral quando quiser. É só subir a prancha, aí atrás de você.'] }),
    gente(g, '4', 'b9-menino', 'cl-crianca-m', 'Pedrinho Bagre', { mov: 'vagar', fala: ['Meu pai diz que a Estrada Vermelha é só pedra rachada. Quem não tem Quebra-pedra volta de ré.', 'Eu tenho um Quebra-pedra. É o meu dente da frente. Quebrou numa rapadura.'] }),
    gente(g, '5', 'b9-capinzeiro', 'npc-homem-1', 'Seu Capim-Açu', { dir: 's', fala: ['O mirante lá no alto do paredão tem a melhor vista do porto e uma pedra que brilha.', 'Só sobe quem escala. O Garimpeiro Topázio, da Chapada Rubra, dá o Amuleto de Escalar para quem o vence.'] }),
    gente(g, '6', 'b9-estivadora', 'npc-mulher-4', 'Estivadora Cida', { dir: 'n', mov: 'olhar', fala: ['Carreguei caixote do Cartel sem saber o que tinha dentro. Um caixote miou. Outro grasnou.', 'Larguei o serviço no mesmo dia. Agora só carrego peixe. Peixe não reclama.'] }),
    gente(g, '7', 'b9-guarda', 'npc-homem-2', 'Guarda Ambiental Sebastião', { dir: 'o', se: 'flag:pantanal-ok', fala: ['Porteira aberta! O tenente Arame saiu do ninhal correndo, e o Cartel com ele.', 'Mas ouvi no rádio que levaram as gaiolas para a Chapada Rubra, para a mina velha. Cuidado na estrada.'] }),
    gente(g, '8', 'b9-pescadora', 'cl-pescador', 'Pescadora Lambari', { dir: 's', fala: ['Do cais dá Piranhão e Dourado-Rei na Vara Boa. No canal, de noite, até Arraião.', 'Água boa de pesca é água calma. Água calma do Pantanal é aquela que tem jacaré dormindo em cima.'] }),
  ],
  itens: [item(g, 'k', 'pedra-solar'), item(g, 'j', 'cuia-rapida', 2, true), item(g, 'z', 'pt-34')],
  habitats: [
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [22, 28], peso: 60 }, { e: 113, nv: [22, 28], peso: 40 }] },
    { metodo: 'pesca-boa', todos: [{ e: 114, nv: [45, 47], peso: 40 }, { e: 38, nv: [45, 47], peso: 40 }, { e: 118, nv: [45, 47], peso: 20 }] },
  ],
};
export default zona;
