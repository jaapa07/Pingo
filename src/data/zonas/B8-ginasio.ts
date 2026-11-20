import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio da Mente (nº 15, Planalto Lume) — observatório da Astrônoma Jaci. Tema g15.
 * Quebra-cabeça (src/world/mecanicas/ginasio-15.ts): sete ilhas de chão no meio do campo mental (`x`, não se anda).
 * Os portais (`o`) mostram uma constelação; pisar num portal leva ao OUTRO portal que mostra a mesma constelação.
 * O céu tem quatro horas (anoitecer, meia-noite, madrugada, alvorada) e cada portal muda de constelação com a hora.
 * Pisar numa estrela-guia (`,`, nas ilhas oeste, leste e noroeste) gira o céu uma hora adiante. Portal sem par na
 * hora fica apagado. Sair do ginásio devolve o céu ao anoitecer.
 * Ilhas: E entrada (portais P0 (5, 15) e P1 (11, 15)) · O oeste (P2 (2, 10), P3 (6, 10), P4 (4, 12), estrela (1, 12)) ·
 * M meio (P5 (11, 8), P6 (15, 8)) · L leste (P7 (20, 10), P8 (24, 10), P9 (22, 13), estrela (25, 13)) ·
 * NE nordeste (P10 (20, 3), P11 (24, 5)) · NO noroeste (P12 (2, 3), P13 (6, 3), P14 (4, 6), estrela (1, 5)) ·
 * T topo, da líder (P15 (13, 3)).
 * Solução mais curta (busca em ilha × hora; 7 saltos e 3 giros): no anoitecer, P0 (Ema) → P11 e P10 (Eixu) → P13;
 * três giros na estrela do noroeste (alvorada); P13 (Ema) → P9; P7 (Veado) → P1; P0 (Homem Velho) → P6;
 * P5 (Eixu) → P11; P10 (Anta) → P15, na ilha da líder.
 * De qualquer ilha alcançável há caminho de volta à entrada (conferido pela mesma busca).
 */
const zona: ZonaDef = {
  id: 'B8-ginasio', nome: 'Ginásio do Planalto Lume', mapa: 'B', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-15', passo: 15,
  mapaChars: [
    '###########################',
    '#xxxxxxxxx.......xxxxxxxxx#',
    '#xxxxxxxxx.......xxxxxxxxx#',
    '#.o...o.xx...o...xx.o.....#',
    '#.......xxxxxxxxxxx.......#',
    '#,......xxxxxxxxxxx.....o.#',
    '#...o...xxxxxxxxxxxxxxxxxx#',
    '#xxxxxxxxx.......xxxxxxxxx#',
    '#xxxxxxxxx.o...o.xxxxxxxxx#',
    '#xxxxxxxxx.......xxxxxxxxx#',
    '#.o...o.xxxxxxxxxxx.o...o.#',
    '#.......xxxxxxxxxxx.......#',
    '#,..o...xxxxxxxxxxx.......#',
    '#xxxxxxxxxxxxxxxxxx...o..,#',
    '#xxxxxxxxxxxxxxxxxxxxxxxxx#',
    '#xxx.o.....o.xxxxxxxxxxxxx#',
    '#xxx.........xxxxxxxxxxxxx#',
    '#xxx....+....xxxxxxxxxxxxx#',
    '########+##################',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g15' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DO PLANALTO LUME\nLíder: Astrônoma Jaci\n"Quem aprende a ler o céu nunca se perde."', 'Os portais ligam constelações iguais: pise num portal e você sai no outro que mostra o mesmo desenho de estrelas.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['O céu daqui tem quatro horas: anoitecer, meia-noite, madrugada e alvorada. Pisar numa estrela-guia gira o céu uma hora adiante, e as constelações dos portais mudam junto.', 'Os mais velhos da Aldeia Tupã ensinaram à Jaci os nomes das estrelas: a Ema, a Anta, o Homem Velho, o Veado e o Eixu, a colmeia que nós chamamos de Plêiades.'] },
    { o: 'gin-pedestal', x: 13, y: 2 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'B8', x: 23, y: 9, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g15-1', sprite: 'cl-observadora', x: 3, y: 11, dir: 'o', treinador: 'g15-1', visao: 1 },
    { id: 'g15-2', sprite: 'cl-crianca-m', x: 13, y: 7, dir: 's', treinador: 'g15-2', visao: 1 },
    { id: 'g15-3', sprite: 'cl-observadora', x: 24, y: 12, dir: 'l', treinador: 'g15-3', visao: 1 },
    { id: 'g15-4', sprite: 'cl-repentista', x: 22, y: 5, dir: 'n', treinador: 'g15-4', visao: 1 },
    { id: 'g15-5', sprite: 'cl-observadora', x: 2, y: 4, dir: 'l', treinador: 'g15-5', visao: 2 },
    { id: 'lider', sprite: 'lider-15', x: 13, y: 1, dir: 's', script: 'ginasio-15-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
