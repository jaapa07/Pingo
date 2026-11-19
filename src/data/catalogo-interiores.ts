/**
 * Catálogo de objetos de INTERIOR (móveis, serviços, peças de ginásio e decorações do quarto do jogador).
 * Mesmo contrato do catálogo exterior (docs/ZONAS.md): (x, y) = canto inferior esquerdo do rodapé; `alto` =
 * linhas acima do rodapé desenhadas por cima do jogador; `colisao` = `h` linhas de cima para baixo.
 * Os pintores ficam em tools/scenery/interior/moveis.ts (mesmos nomes).
 */
import type { ObjetoCatalogo } from './catalogo-objetos';

export interface ObjetoInterior extends ObjetoCatalogo {
  /** decoração que o jogador pode comprar/colocar no quarto */
  decoracao?: 'tapete' | 'poster' | 'planta' | 'pelucia' | 'movel' | 'console';
  /** fica pendurado na parede (coloque sobre um tile `#` de face de parede) */
  parede?: boolean;
  /** interage com A (texto/serviço definido pelo mundo) */
  interage?: boolean;
}
const o = (w: number, h: number, alto: number, desc: string, extra: Partial<ObjetoInterior> = {}): ObjetoInterior => ({ w, h, alto, colisao: Array.from({ length: h }, () => '#'.repeat(w)), desc, ...extra });
const chao = (w: number, h: number, desc: string, extra: Partial<ObjetoInterior> = {}): ObjetoInterior => ({ w, h, alto: 0, colisao: Array.from({ length: h }, () => '.'.repeat(w)), desc, ...extra });
const naParede = (desc: string, extra: Partial<ObjetoInterior> = {}): ObjetoInterior => o(1, 1, 0, desc, { parede: true, ...extra });

export const CATALOGO_INTERIOR: Record<string, ObjetoInterior> = {
  /* ---- pseudo-objeto: escolhe o tema do tileset (não desenha nada) ---- */
  tema: { w: 0, h: 0, alto: 0, colisao: [], desc: 'pseudo-objeto: `tema: "<id>"` escolhe o tema de interior da zona' },
  /* ---- móveis de casa ---- */
  cama: o(1, 2, 0, 'cama de solteiro com colcha de retalhos', { interage: true }),
  'cama-casal': o(2, 2, 0, 'cama de casal com colcha de chenile'),
  mesa: o(2, 1, 0, 'mesa de madeira com toalha de chita'),
  'mesa-centro': o(1, 1, 0, 'mesinha com jarro de flores'),
  cadeira: o(1, 1, 0, 'cadeira de palhinha'),
  banquinho: o(1, 1, 0, 'tamborete de três pés'),
  sofa: o(2, 1, 0, 'sofá de dois lugares com almofadas'),
  estante: o(2, 1, 1, 'estante de livros e lembranças', { interage: true }),
  armario: o(1, 1, 1, 'guarda-roupa de duas portas'),
  cristaleira: o(1, 1, 1, 'cristaleira com louça de festa'),
  pc: o(1, 1, 1, 'escrivaninha com computador (acesso ao Viveiro em casa)', { interage: true }),
  tv: o(1, 1, 1, 'televisão de tubo sobre a cômoda', { interage: true, animado: true }),
  radio: o(1, 1, 1, 'rádio de válvula sobre a mesinha (Rádio Cipó)', { interage: true }),
  'fogao-lenha': o(2, 1, 1, 'fogão a lenha de tijolo com chapa, panela e chaminé', { animado: true, luz: true }),
  rede: o(2, 1, 1, 'rede de dormir listrada armada nos ganchos'),
  'filtro-barro': o(1, 1, 1, 'filtro de barro com copo de alumínio sobre o banquinho', { interage: true }),
  oratorio: o(1, 1, 1, 'oratório de madeira com vela e fitas', { animado: true, luz: true }),
  'maquina-costura': o(1, 1, 1, 'máquina de costura de pedal'),
  geladeira: o(1, 1, 1, 'geladeira arredondada com pinguim em cima', { interage: true }),
  pia: o(1, 1, 1, 'pia de cozinha com escorredor'),
  lareira: o(2, 1, 1, 'lareira de pedra da serra', { animado: true, luz: true }),
  bau: o(1, 1, 0, 'baú de couro tacheado', { interage: true }),
  'pote-barro': o(1, 1, 0, 'pote de barro de guardar água'),
  cesto: o(1, 1, 0, 'cesto de palha trançada'),
  planta: o(1, 1, 1, 'vaso de espada-de-são-jorge', { decoracao: 'planta' }),
  'planta-b': o(1, 1, 1, 'samambaia em vaso de xaxim', { decoracao: 'planta' }),
  'planta-c': o(1, 1, 0, 'vasinho de violetas', { decoracao: 'planta' }),
  'tapete-a': chao(2, 2, 'tapete de retalhos vermelho', { decoracao: 'tapete' }),
  'tapete-b': chao(3, 2, 'passadeira listrada verde e amarela', { decoracao: 'tapete' }),
  'tapete-c': chao(2, 2, 'tapete redondo de fuxico azul', { decoracao: 'tapete' }),
  'escada-sobe': chao(1, 1, 'escada para o andar de cima (warp sobre ela)', { alto: 1 }),
  'escada-desce': chao(1, 1, 'escada para o andar de baixo (warp sobre ela)'),
  /* ---- parede ---- */
  janela: naParede('janela de veneziana com cortina', { luz: true }),
  quadro: naParede('quadro de paisagem'),
  'quadro-ex-voto': naParede('quadro de ex-voto com fitas'),
  relogio: naParede('relógio de parede de pêndulo', { animado: true }),
  'poster-a': naParede('pôster do Conselho dos Guardiões', { decoracao: 'poster' }),
  'poster-b': naParede('pôster do Trem Serra-Sol', { decoracao: 'poster' }),
  'poster-c': naParede('pôster de mapa da Costa do Sol', { decoracao: 'poster' }),
  'mapa-linhas': naParede('mapa das linhas do trem'),
  'rede-pesca': naParede('rede de pesca com boias pendurada'),
  /* ---- quarto do jogador ---- */
  'cama-jogador': o(1, 2, 0, 'cama do jogador com colcha de estrela', { interage: true, decoracao: 'movel' }),
  console: o(1, 1, 0, 'videogame de cartucho com dois controles', { interage: true, decoracao: 'console' }),
  'pelucia-a': o(1, 1, 0, 'pelúcia de tamanduá', { decoracao: 'pelucia' }),
  'pelucia-b': o(1, 1, 0, 'pelúcia de capivara', { decoracao: 'pelucia' }),
  'pelucia-c': o(1, 1, 0, 'pelúcia de arara', { decoracao: 'pelucia' }),
  'pelucia-d': o(1, 1, 0, 'pelúcia de boto', { decoracao: 'pelucia' }),
  /* ---- Posto Guardião, Venda, laboratório ---- */
  balcao: o(3, 1, 0, 'balcão de atendimento com tampo claro', { interage: true }),
  'maquina-cura': o(2, 1, 1, 'máquina de cura do Posto: seis berços de cuia e luz verde', { interage: true, animado: true, luz: true }),
  viveiro: o(1, 1, 1, 'terminal do Viveiro (guarda criaturas)', { interage: true, animado: true }),
  prateleira: o(2, 1, 1, 'prateleira de mercadorias da Venda', { interage: true }),
  balanca: o(1, 1, 0, 'balança de pratos sobre o caixote'),
  'saco-graos': o(1, 1, 0, 'sacos de farinha e feijão'),
  caixote: o(1, 1, 0, 'caixote de feira'),
  barril: o(1, 1, 0, 'barril'),
  'mesa-lab': o(2, 1, 1, 'bancada de laboratório com microscópio e frascos', { interage: true }),
  'mesa-cuias': o(3, 1, 1, 'mesa das 3 cuias iniciais da Profª Ipê', { interage: true }),
  'estante-lab': o(2, 1, 1, 'estante de pastas e amostras em vidro'),
  /* ---- estação e cais ---- */
  bilheteria: o(2, 1, 1, 'bilheteria da estação com guichê', { interage: true }),
  'banco-estacao': o(2, 1, 0, 'banco de espera de ripas'),
  'relogio-estacao': o(1, 1, 1, 'relógio de coluna da plataforma', { animado: true }),
  ancora: o(1, 1, 0, 'âncora encostada'),
  'cabeco-amarra': o(1, 1, 0, 'cabeço de amarração com corda'),
  /* ---- industrial ---- */
  gerador: o(2, 1, 1, 'gerador da usina com bobinas', { animado: true }),
  turbina: o(2, 2, 1, 'turbina com hélice', { animado: true }),
  painel: o(2, 1, 1, 'painel de controle com luzes', { interage: true, animado: true, luz: true }),
  tambor: o(1, 1, 0, 'tambor de óleo'),
  tanque: o(1, 1, 1, 'tanque de espécime do Cartel', { animado: true, luz: true }),
  jaula: o(1, 1, 1, 'jaula de ferro do Cartel', { interage: true }),
  'computador-cartel': o(2, 1, 1, 'terminal do Cartel Ferrugem', { interage: true, animado: true, luz: true }),
  vagonete: o(1, 1, 0, 'vagonete de minério'),
  alavanca: o(1, 1, 0, 'alavanca de chão', { interage: true }),
  /* ---- peças de ginásio ---- */
  'gin-estatua': o(1, 1, 1, 'estátua de entrada do ginásio (lista os vencedores)', { interage: true }),
  'gin-pedestal': chao(1, 1, 'marca do líder no piso'),
  'gin-ventilador': o(1, 1, 1, 'cata-vento que gera a corrente (Vento)', { animado: true }),
  'gin-comporta': o(1, 1, 1, 'volante de comporta (Rio)', { interage: true }),
  'gin-espelho': o(1, 1, 1, 'espelho de renda giratório (Encanto)', { interage: true }),
  'gin-no-circuito': chao(1, 1, 'nó de circuito no piso (Trovão)', { animado: true }),
  'gin-lamparina': o(1, 1, 1, 'lamparina de pé (Assombro)', { animado: true, luz: true }),
  'gin-desvio': o(1, 1, 0, 'chave de desvio dos trilhos (Pedra)', { interage: true }),
  'gin-fogueira': o(1, 1, 1, 'fogueira de São João acesa (Brasa)', { animado: true, luz: true }),
  'gin-berimbau': o(1, 1, 1, 'berimbau no suporte (Ginga)', { interage: true }),
  'gin-engrenagem': o(1, 1, 0, 'engrenagem de piso que inverte as esteiras (Ferro)', { interage: true, animado: true }),
  'gin-antidoto': o(1, 1, 0, 'canteiro de planta-antídoto (Veneno)'),
  'gin-bloco-gelo': o(1, 1, 0, 'bloco de gelo que para o deslize (Geada)'),
  'gin-portal': chao(1, 1, 'portal de constelação (Mente)', { animado: true, luz: true }),
  'gin-totem-fogo': o(1, 1, 1, 'totem da prova do fogo (Lenda)', { animado: true, luz: true }),
  'gin-totem-agua': o(1, 1, 1, 'totem da prova da água (Lenda)', { animado: true }),
  'gin-totem-terra': o(1, 1, 1, 'totem da prova da terra (Lenda)', { animado: true }),
  'gin-totem-vento': o(1, 1, 1, 'totem da prova do vento (Lenda)', { animado: true }),
};
export const NOMES_INTERIOR = Object.keys(CATALOGO_INTERIOR);
/** mesmo catálogo com o nome previsto em docs/BAKE.md */
export const CATALOGO_INTERIORES = CATALOGO_INTERIOR;
