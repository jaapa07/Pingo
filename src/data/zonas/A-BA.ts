import type { ZonaDef, Encontro } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A-BA Baía Azul (passo 4). Tudo aqui se faz de canoa: o cais de Porto Sereia só solta a amarra com o Remo
 * e com a Usina religada. Oeste: píer de Porto Sereia, praia dos caranguejos e a boca do Manguezal (norte).
 * Pelo canal das boias chega-se a Cidade Coral (sul, livre). A Ilha do Farol (leste) e a Praia das Tartarugas
 * (norte) só abrem com a insígnia Estrela. Para voltar depois: três poços de Mergulho (Recife Submerso)
 * e a ilhota de pedra com trepadeira (Escalar).
 */
const g = grade('A-BA', 90, [
  'TTTTTTTTTT|##~~######|##########|##########|##########|##########|~~########|##########|##########',
  'TTTTTTTT##|#~~~~#####|####~~~~~~|##~~~~~~##|##########|##########|~~########|####~~~~~~|~~~~~~~###',
  'TTTT;;;;##|~~~~~~~###|#~~~~~~~~~|##~~~~~~~~|~~~####~~~|~~~~~~~~~#|NN#~~~~~~~|~~~~~~~~~~|~~~~~~~~##',
  'TT;;;;;;;~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~#',
  'T;;""";;~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~;;;~|~~~~~~~~~~|~~~~~~~~~#',
  'T;""""";~~|~~~~~~~~~~|~~~~~;;~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~;;2;;|~~~~~~~~~~|~~~~~~~~~#',
  'T;;""";;~~|~~~~~~~~~~|~~~~;;1;~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~;;;~|~~~~~~~~~~|~~~~~~~~~#',
  'TT;;;i;~~~|~~~~~~~~~~|~~~~~;;~~~|##~~~~~~~~|~~~~~~~~~~|~~~~######|#~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~#',
  'TTT;;;~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~#.,..k|#~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~#',
  'TTTT~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~#...t.|#~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~#',
  'TTT~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~###e##|#~~~~~~~~~|~~~~~~~~~~|~~~~~~~~##',
  'TT~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~X~~~~~~~|~~~~;;;;;;|;~~~~~~~~~|~~~~~~~~~~|~~~~~~~###',
  'T~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~;;;;~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~###',
  'T~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~#####',
  '##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~F~~~',
  '###~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '####~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~#####',
  '###~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~;;;;;~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~###',
  '##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~;;""";;;~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~##',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|;;"""""3;;|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~#',
  'W=======~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|;P""""";j;|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~#',
  '~~~~~~=~~~|~~~~~~~~~~|~~~~~~~~~~|G~~~~~~~~~|;;;"""";;;|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~#',
  '~~~~~~=~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~;;;;;;;;~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~#',
  'TT;;;;=;;~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~;;;;~~~|~~~~~~~~~~|~~~~~~Z~~~|~~~~~~~~~~|~~~~~~~~~#',
  'T;;;;;:;;;|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~#',
  'T;,;;;:;;;|;~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~;;;~~~|~~~~~~~~~#',
  'T;;""":"";|;;~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~;;4;;~~|~~~~~~~~##',
  'T;"""":"""|;;~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~;;;~~~|~~~~~~~###',
  'T;"""":"";|;;;~~~~~~~|~~~~~~;;~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~####',
  'T;;a;;:::;|5;;~~~~~~~|~~~~~;;m;~|##~~~~~~~~|~~~~~~~~~~|~~Y~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~#####',
  'T;;;;;;;;;|;;~~~~~~~~|~~~~~~;;~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~######',
  'TT;;CC;;h;|;~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~#######',
  'TTT;;;;;;~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~########',
  'TTTT;;;~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~;;;;~~|~~~~~~~~~~|~#########',
  'TTTTT~~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~;;HHH;~|~~~~~~~~~#|##########',
  'TTTTTT~~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~;;BHH;~|~~~~~~~~##|##########',
  'TTTTTTT~~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~;q;;~~|~~~~~~~###|##########',
  'TTTTTTTT~~|~~~~~~~~~~|~~~~~~~~~~|##~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~####|##########',
  'TTTTTTTTT~|~~~~~~~~~~|~~~~~~~~~~|###~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~#####|##########',
  'TTTTTTTTTT|~~~~~~~~~~|~~~~~~~~~~|####~~~~~~|~~~~~~~~;;|;;~~~~~~~~|~~~~~~~~~~|~~~#######|##########',
  'TTTTTTTTTT|T~~~~~~~~~|~~~~~~~~~#|######~~~~|~~~~~~~;;6|;;;~~~~~~~|~~~~~~~~~#|##########|##########',
  'TTTTTTTTTT|TTT~~~~~~#|##########|########~~|~~~~~~~~;;|;;~~~~~~~~|~~~~~~####|##########|##########',
  'TTTTTTTTTT|TTTTTT####|##########|##########|####~~~~~~|~~~~######|##########|##########|##########',
  'TTTTTTTTTT|TTTTTT####|##########|##########|##########|~~########|##########|##########|##########',
], { W: '=', N: '~', F: '~', G: '~', X: 'd', Y: 'd', Z: 'd', '1': ';', '2': ';', '3': ';', '4': ';', '5': ';', '6': ';', i: ';', j: ';', m: ';', q: ';', P: ';', a: ';', h: ';' });

const N = g.todos('N')[0];
const agua = (d: number): Encontro[] => [{ e: 79, nv: [21 + d, 24 + d], peso: 25 }, { e: 125, nv: [21 + d, 24 + d], peso: 25 }, { e: 123, nv: [21 + d, 24 + d], peso: 20 }, { e: 117, nv: [22 + d, 25 + d], peso: 14 }, { e: 37, nv: [20 + d, 23 + d], peso: 7 }, { e: 77, nv: [22 + d, 25 + d], peso: 4 }, { e: 131, nv: [22 + d, 25 + d], peso: 5, estacao: 'fria' }];
const aguaNoite = (d: number): Encontro[] => [{ e: 125, nv: [21 + d, 24 + d], peso: 30 }, { e: 79, nv: [21 + d, 24 + d], peso: 22 }, { e: 123, nv: [21 + d, 24 + d], peso: 18 }, { e: 117, nv: [22 + d, 25 + d], peso: 14 }, { e: 121, nv: [22 + d, 25 + d], peso: 8 }, { e: 77, nv: [22 + d, 25 + d], peso: 3 }, { e: 131, nv: [22 + d, 25 + d], peso: 5, estacao: 'fria' }];
/** camada das águas depois da insígnia 8: os adultos chegam (Medusão à noite; Jubartão, raríssimo) */
const adultos = (l: Encontro[], noite: boolean): Encontro[] => [...l, ...(noite ? [{ e: 126, nv: [36, 39] as [number, number], peso: 16 }] : []), { e: 132, nv: [40, 44] as [number, number], peso: 2 }];

const zona: ZonaDef = {
  id: 'A-BA', nome: 'Baía Azul', mapa: 'A', tipo: 'agua', tileset: 'costa', musica: 'agua', arena: 'baia', passo: 4,
  mapaChars: g.mapa,
  objetos: [
    { o: 'placa', ...g.p('P'), texto: 'ILHOTA DO MEIO\nSul: Cidade Coral · Leste: Ilha do Farol · Norte: Praia das Tartarugas.\nNão alimente as águas-vivas. Elas não agradecem.' },
    { o: 'barco', ...g.p('B'), texto: 'Um barco de pesca encalhado. No casco, quase apagado: "CARTEL FERR…". Alguém perdeu a carga aqui.' },
    { o: 'coqueiro', x: 3, y: 30 }, { o: 'coqueiro', x: 8, y: 24 }, { o: 'coqueiro', x: 2, y: 3 }, { o: 'coqueiro', x: 41, y: 19 }, { o: 'coqueiro', x: 48, y: 21 },
    { o: 'canoa', x: 8, y: 32 }, { o: 'cabeco-amarra', x: 7, y: 19 },
  ],
  warps: [
    { ...g.p('W'), para: { zona: 'A4', x: 30, y: 43, dir: 'n' }, tipo: 'borda' },
    { x: 12, y: 0, para: { zona: 'A-MG', x: 40, y: 34, dir: 'n' }, tipo: 'borda' }, { x: 13, y: 0, para: { zona: 'A-MG', x: 41, y: 34, dir: 'n' }, tipo: 'borda' },
    { x: 60, y: 0, para: { zona: 'A-PR', x: 34, y: 33, dir: 'n' }, tipo: 'borda' }, { x: 61, y: 0, para: { zona: 'A-PR', x: 35, y: 33, dir: 'n' }, tipo: 'borda' },
    { x: 89, y: 14, para: { zona: 'A6', x: 1, y: 16, dir: 'l' }, tipo: 'borda' }, { x: 89, y: 15, para: { zona: 'A6', x: 1, y: 17, dir: 'l' }, tipo: 'borda' },
    { x: 50, y: 43, para: { zona: 'A5', x: 24, y: 1, dir: 's' }, tipo: 'borda' }, { x: 51, y: 43, para: { zona: 'A5', x: 25, y: 1, dir: 's' }, tipo: 'borda' },
    { ...g.p('X'), para: { zona: 'A-RS', x: 14, y: 8 } },
    { ...g.p('Z'), para: { zona: 'A-RS', x: 44, y: 18 } },
    { ...g.p('Y'), para: { zona: 'A-RS', x: 30, y: 30 } },
  ],
  portoes: [
    { ...N, w: 2, h: 1, requer: 'insignia:4', sprite: 'cl-biologa', fala: 'Projeto Tartaruí: a Praia das Tartarugas está em época de desova.\nSó entra quem tem a insígnia Estrela, da Iracema Lua, de Cidade Coral. Ela ensina a pisar leve.' },
    { ...g.p('F'), w: 1, h: 2, requer: 'insignia:4', sprite: 'npc-marinheiro', fala: 'O farol da ilha apagou e o canal está um breu de pedra e correnteza.\nSem a insígnia Estrela de Cidade Coral eu não deixo canoa nenhuma seguir para o leste.' },
  ],
  npcs: [
    { id: 'pescador-praia', sprite: 'cl-pescador', ...g.p('a'), dir: 'l', fala: ['Aqui na beirada dá Piabinha até com vara velha.', 'Na estação fria a baía enche de visita: baleia com filhote, e uns pinguins perdidos lá na praia do norte.', 'Baleia não se pesca, viu? Baleia a gente espera, de canoa e de boca fechada.'] },
    { id: 'catadora', sprite: 'npc-mulher-1', ...g.p('h'), mov: 'vagar', fala: ['Cato caranguejo no capim da praia desde menina. Só levo os grandes e só fora da andada.', 'A boca do Manguezal fica ao norte daqui, entre as pedras. Lá é o berçário de tudo quanto é bicho da baía.'] },
    { id: 't1', sprite: 'cl-pescador', ...g.p('1'), dir: 's', treinador: 'A-BA-1', visao: 1 },
    { id: 't2', sprite: 'cl-surfista', ...g.p('2'), dir: 's', mov: 'olhar', treinador: 'A-BA-2', visao: 1 },
    { id: 't3', sprite: 'cl-surfista', ...g.p('3'), dir: 'o', treinador: 'A-BA-3', visao: 4 },
    { id: 't4', sprite: 'cl-mergulhador', ...g.p('4'), dir: 'n', mov: 'olhar', treinador: 'A-BA-4', visao: 1 },
    { id: 't5', sprite: 'cl-pescador', ...g.p('5'), dir: 'o', treinador: 'A-BA-5', visao: 3 },
    { id: 't6', sprite: 'cl-rendeira', ...g.p('6'), dir: 'o', mov: 'olhar', treinador: 'A-BA-6', visao: 1 },
  ],
  itens: [
    { ...g.p('i'), item: 'cuia-rede', qtd: 2, flag: 'item:A-BA:enseada' },
    { ...g.p('j'), item: 'pedra-mare', flag: 'item:A-BA:ilhota' },
    { ...g.p('k'), item: 'pt-14', flag: 'item:A-BA:pedra' },
    { ...g.p('m'), item: 'concha-rara', oculto: true, flag: 'item:A-BA:banco' },
    { ...g.p('q'), item: 'pepita', oculto: true, flag: 'item:A-BA:naufragio' },
    { x: 3, y: 26, item: 'garrafada', flag: 'item:A-BA:praia' },
  ],
  habitats: [
    { metodo: 'grama', taxa: 0.1, todos: [{ e: 35, nv: [21, 24], peso: 70 }, { e: 129, nv: [21, 24], peso: 20 }, { e: 107, nv: [21, 24], peso: 10 }], noite: [{ e: 35, nv: [21, 24], peso: 60 }, { e: 123, nv: [21, 24], peso: 25 }, { e: 129, nv: [21, 24], peso: 15 }], camadas: [{ apos: 8, todos: [{ e: 35, nv: [26, 27], peso: 50 }, { e: 36, nv: [38, 41], peso: 30 }, { e: 129, nv: [30, 33], peso: 20 }] }] },
    { metodo: 'agua', taxa: 0.06, todos: agua(0), noite: aguaNoite(0), camadas: [{ apos: 8, todos: adultos(agua(8), false), noite: adultos(aguaNoite(8), true) }] },
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [12, 18], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 37, nv: [20, 24], peso: 70 }, { e: 117, nv: [21, 25], peso: 20 }, { e: 125, nv: [21, 25], peso: 10 }] },
    { metodo: 'pesca-mestra', todos: [{ e: 37, nv: [28, 29], peso: 40 }, { e: 117, nv: [30, 31], peso: 35 }, { e: 121, nv: [32, 35], peso: 20 }, { e: 77, nv: [34, 38], peso: 5 }] },
  ],
};
export default zona;
