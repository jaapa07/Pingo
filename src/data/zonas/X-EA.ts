import type { ZonaDef } from '../../core/tipos';

/**
 * X-EA · Encontro das Águas — zona secreta do pós-jogo (spec 6.5, missão "O Encontro das Águas", lendário 181 Galo-Manaó).
 * Um rio largo onde uma água escura (oeste) e uma água barrenta (leste) correm lado a lado sem se misturar, como o rio
 * Negro e o Solimões diante de Manaus. Só se chega pela canoa do Seu Tarumã, em Porto Sereia (A4), depois de levar a ele
 * os dois frascos. Ao sul, a praia de desembarque (linhas 43–47); ao norte, a ilhota de pedra onde o Galo-Manaó dança.
 * Quebra-cabeça de correnteza (src/world/mecanicas/x-ea.ts): entre as linhas 12 e 40 só se rema NA LINHA DO ENCONTRO
 * — tile de água barrenta (`~`) que encosta (inclusive na diagonal) na água escura (`d`). Pisar na água escura ou se
 * afastar dela devolve a canoa ao último remanso. As margens dessa faixa são mata fechada (`T`): não há atalho a pé.
 * A cor das duas águas é pintada pela mecânica por cima do bake (o tileset `mata` tem uma água só).
 * Grade gerada por regras escritas à mão (nenhum sorteio): `MARGEM_ESCURA[y]` é a primeira coluna barrenta da linha y.
 */
export const LARG = 36, ALT = 50;
/** faixa do quebra-cabeça (linhas inclusive) */
export const FAIXA: [number, number] = [12, 40];
/** primeira coluna de água barrenta em cada linha (à esquerda dela, de x = 3 em diante, a água é escura) */
const TRECHOS: [number, number, number][] = [
  // [linha de cima, linha de baixo, coluna]
  [0, 15, 18], [16, 19, 19], [20, 23, 23], [24, 27, 20], [28, 31, 16], [32, 35, 19], [36, 49, 17],
];
export const MARGEM_ESCURA: number[] = Array.from({ length: ALT }, (_, y) => TRECHOS.find(([a, b]) => y >= a && y <= b)![2]);
/** ilhota de pedra (norte): retângulo x 11..25, y 1..10; arena por dentro; vão de entrada em x 17..19 na linha 9 */
export const ILHOTA = { x0: 11, x1: 25, y0: 1, y1: 10 };
/** tile da entrada da arena (o jogador para aqui para assistir à dança) e onde o Galo-Manaó dança */
export const ENTRADA_ARENA: [number, number] = [18, 8];
export const PALCO_GALO: [number, number] = [18, 4];
/** remansos (pontos de retorno da canoa) na linha do encontro */
export const REMANSOS: [number, number][] = [[17, 41], [19, 32], [23, 21]];
/** chegada pela canoa do Seu Tarumã (praia sul) */
export const CHEGADA: [number, number] = [18, 45];

function linha(y: number): string {
  let s = '';
  for (let x = 0; x < LARG; x++) {
    const ilhota = x >= ILHOTA.x0 && x <= ILHOTA.x1 && y >= ILHOTA.y0 && y <= ILHOTA.y1;
    let c: string;
    if (x <= 1 || x >= LARG - 2) c = 'T';
    else if (y >= 48) c = 'T';
    else if (y >= 43) c = x <= 3 || x >= LARG - 4 ? 'T' : ';';
    else if (x === 2 || x === LARG - 3) c = y >= FAIXA[0] && y <= FAIXA[1] ? 'T' : y <= 0 ? 'T' : ';';
    else c = '~';
    if (ilhota) {
      const borda = x === ILHOTA.x0 || x === ILHOTA.x1;
      if (y === ILHOTA.y0) c = 'T';
      else if (y === ILHOTA.y1) c = borda ? '~' : ';';
      else if (y === 9) c = x >= 17 && x <= 19 ? ':' : '#';
      else if (borda || y === 2) c = '#';
      else if (y === 3) c = x === 12 || x === 24 ? 'T' : ',';
      else c = x >= 15 && x <= 21 && y >= 4 && y <= 7 ? ':' : ',';
    }
    if (y === 0) c = 'T';
    s += c;
  }
  return s;
}

const zona: ZonaDef = {
  id: 'X-EA', nome: 'Encontro das Águas', mapa: 'A', tipo: 'agua', tileset: 'mata', musica: 'agua', arena: 'mangue', passo: 17,
  mapaChars: Array.from({ length: ALT }, (_, y) => linha(y)),
  objetos: [
    { o: 'canoa', x: 13, y: 44 },
    { o: 'totem', x: 13, y: 4 }, { o: 'totem', x: 23, y: 4 },
    { o: 'pedra-grande', x: 14, y: 8 }, { o: 'pedra-grande', x: 21, y: 8 },
    { o: 'placa', x: 23, y: 44, texto: 'ENCONTRO DAS ÁGUAS\nÁgua escura de um lado, barrenta do outro. Elas correm juntas por léguas e não se misturam.\nQuem rema na linha do encontro chega à ilhota. Quem se distrai, volta para a praia.' },
  ],
  warps: [],
  npcs: [
    { id: 'xea-taruma', sprite: 'seu-taruma', x: 20, y: 44, dir: 's', script: 'vis-taruma-volta' },
  ],
};
export default zona;
