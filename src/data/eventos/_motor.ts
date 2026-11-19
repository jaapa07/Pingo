/** Eventos de TESTE do motor de mundo (usados pelas zonas `_teste-*`): exercitam os comandos do interpretador. */
import type { EventoDef } from '../../core/tipos';

export const EVENTOS_TESTE_MOTOR: EventoDef[] = [
  {
    id: 'teste-motor-roteiro',
    passos: [
      ['falar', 'roteirista', 'Vou testar os comandos de roteiro.'],
      ['simnao', 'Quer um presente?', 'teste-quis'],
      ['se', 'flag:teste-quis', [['dar', 'cha-cidreira', 2], ['dinheiro', 50]], [['falar', null, 'Tudo bem, fica para depois.']]],
      ['emote', 'roteirista', '!'],
      ['mover', 'roteirista', ['l', 'l']],
      ['virar', 'roteirista', 'o'],
      ['camera', 10, 16, 400],
      ['esperar', 200],
      ['camera', 'jogador'],
      ['tremor', 200],
      ['flag', 'teste-roteiro-ok'],
      ['flag', 'teste-aparece'],
      ['chamar', 'teste-motor-fim'],
    ],
  },
  { id: 'teste-motor-fim', passos: [['sfx', 'ui-ok'], ['flag', 'teste-chamar-ok', 7]] },
  { id: 'teste-motor-gatilho', passos: [['falar', null, 'Você pisou no gatilho de teste.'], ['flag', 'teste-gatilho-ok']] },
  {
    id: 'teste-motor-silencioso',
    passos: [
      ['flag', 'a1'], ['tirar', 'cha-cidreira', 1], ['dinheiro', -100], ['insignia', 2], ['amuleto', 'facao'], ['musica', 'rota-1'], ['sfx', 'ui-ok'],
      ['mover', 'jogador', ['s', 's']], ['virar', 'jogador', 'l'], ['esperar', 50], ['fade', 'fora'], ['fade', 'dentro'], ['esconder', 'velho'], ['curar'],
      ['errante', 99, 40], ['salvar'], ['cinematica', 'teste-cine'], ['warp', '_teste-a', 6, 22, 'n'], ['mostrar', 'velho'], ['flag', 'teste-silencioso-ok'],
    ],
  },
];
