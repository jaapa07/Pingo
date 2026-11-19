/** Feira coberta da Cidade Ginga: frutos, cuias de artesão, pergaminhos de luta e pedras raras. Missão do tabuleiro da Dona Dendê. */
import type { ZonaDef } from '../../core/tipos';
import { sala, npc } from './_b2-lib';

const g = sala(17, 11, 8);
g.r(1, 6, 15, 1, ':').r(8, 6, 1, 4, ':').p(',', 2, 8, 14, 8, 5, 9, 11, 9);

const zona: ZonaDef = {
  id: 'B5-feira', nome: 'Feira da Cidade Ginga', mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'venda', arena: 'cerrado', passo: 11,
  mapaChars: g.fim(),
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'venda' },
    { o: 'balcao', x: 1, y: 4 }, { o: 'balcao', x: 5, y: 4 }, { o: 'balcao', x: 9, y: 4 }, { o: 'balcao', x: 13, y: 4 },
    { o: 'caixote', x: 4, y: 3 }, { o: 'saco-graos', x: 8, y: 3 }, { o: 'barril', x: 12, y: 3 }, { o: 'cesto', x: 4, y: 2 }, { o: 'pote-barro', x: 12, y: 2 },
    { o: 'rede-pesca', x: 6, y: 1 }, { o: 'quadro-ex-voto', x: 10, y: 1 }, { o: 'janela', x: 2, y: 1 }, { o: 'janela', x: 14, y: 1 },
    { o: 'mesa', x: 2, y: 9 }, { o: 'banquinho', x: 4, y: 9 }, { o: 'caixote', x: 15, y: 9 }, { o: 'cesto', x: 14, y: 9 }, { o: 'planta-b', x: 1, y: 7 },
  ],
  warps: [{ x: 8, y: 10, para: { zona: 'B5', x: 9, y: 31, dir: 's' }, tipo: 'porta' }],
  npcs: [
    npc('frutos', 'Seu Cajá', 'npc-homem-2', 2, 3, 's', ['Fruto fresco, colhido hoje! Plante nos canteiros e volte daqui a uma hora.', 'Se a criatura segurar o fruto, ela come sozinha na hora do aperto. Mais educada que muita gente.'], { loja: ['caju', 'pitanga', 'jabuticaba', 'cupuacu', 'pequi', 'buriti', 'acai', 'acerola'] }),
    npc('cuias', 'Artesã Cabacinha', 'cl-rendeira', 6, 3, 's', ['Cuia boa é cuia com história. Cada trançado destes levou uma novela inteira.'], { loja: ['cuia-rede', 'cuia-noturna', 'cuia-rapida', 'cuia-mel', 'cuia-ouro'] }),
    npc('pergaminhos', 'Mestre Rabo-de-Arraia', 'cl-capoeirista', 10, 3, 's', ['Pergaminhos de Técnica: Armada, Martelo, Rasante… Golpe de livro, mas dói igual.'], { loja: ['pt-23', 'pt-24', 'pt-31', 'pt-04', 'pt-05'] }),
    npc('pedras', 'Garimpeira Faísca', 'cl-garimpeiro', 14, 3, 's', ['Pedra Solar, Maré, Lunar… Vieram da Chapada no lombo de mula.', 'Compro Pepita também. Pago em sorriso. Brincadeira: pago em patacas.'], { loja: ['pedra-solar', 'pedra-mare', 'pedra-lunar', 'engrenagem-velha'] }),
    npc('dende', 'Dona Dendê', 'npc-idosa', 3, 8, 'l', null, { script: 'b2-dende' }),
    npc('provador', 'Seu Gaspar', 'npc-idoso', 12, 8, 'o', ['Eu provo de tudo antes de comprar.', 'Hoje já provei cocada, pé de moleque, queijo coalho e a paciência da feira inteira.']),
    npc('crianca', 'Tico', 'cl-crianca-m', 9, 8, 'n', ['Moço, moça, me empresta dez patacas?', 'É para comprar uma Cuia de Mel. A minha Jataí merece.'], { mov: 'vagar' }),
  ],
  itens: [{ x: 15, y: 7, item: 'acerola', qtd: 3, oculto: true, flag: 'B5-feira-o1' }],
};
export default zona;
