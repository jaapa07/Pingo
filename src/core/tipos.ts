/**
 * TIPOS CENTRAIS — o contrato de dados entre todos os módulos de Adventures of Pingo.
 * Mudanças aqui afetam todo mundo: só acrescente campos opcionais.
 */

/* ============================== básicos ============================== */
export const TILE = 16; // px nativos
export const TELA_W = 320, TELA_H = 180;

export type TipoId = 'comum' | 'mata' | 'brasa' | 'rio' | 'trovao' | 'geada' | 'ginga' | 'veneno' | 'terra' | 'vento' | 'mente' | 'inseto' | 'pedra' | 'assombro' | 'lenda' | 'ferro' | 'encanto';
export const TIPOS: TipoId[] = ['comum', 'mata', 'brasa', 'rio', 'trovao', 'geada', 'ginga', 'veneno', 'terra', 'vento', 'mente', 'inseto', 'pedra', 'assombro', 'lenda', 'ferro', 'encanto'];
export type Stat = 'vida' | 'atq' | 'def' | 'atqEsp' | 'defEsp' | 'vel';
export const STATS: Stat[] = ['vida', 'atq', 'def', 'atqEsp', 'defEsp', 'vel'];
export type Dir = 'n' | 's' | 'l' | 'o';
export type Periodo = 'manha' | 'dia' | 'tarde' | 'noite';
export type StatusId = 'queimado' | 'envenenado' | 'paralisado' | 'dormindo' | 'congelado' | 'encantado';
export type ClimaId = 'limpo' | 'sol' | 'chuva' | 'garoa' | 'nevoa' | 'poeira';
export type AmuletoId = 'facao' | 'remo' | 'forca' | 'lampiao' | 'quebra-pedra' | 'escalar' | 'cachoeira' | 'mergulho' | 'voo' | 'faro';

/**
 * Condição textual usada em portões, warps, NPCs e eventos. Termos unidos por '&' (e) ou '|' (ou, sem misturar):
 *  'insignia:3' (tem a insígnia nº 3) · 'insignias:15' (tem ≥ 15) · 'flag:usina-ok' · '!flag:x' · 'amuleto:remo'
 *  'item:passe-trem' · 'diario:150' (≥ 150 capturadas) · 'periodo:noite' · 'pos-jogo' · 'mapa-b' (mapa B aberto neste pacote)
 */
export type Cond = string;

/* ============================== criaturas ============================== */
export type Porte = 'P' | 'M' | 'G' | 'L'; // célula de batalha: P 64 · M 80 · G 96 · L 96 (lendário)
export interface Evolucao { para: number; nivel?: number; item?: string; amizade?: boolean; periodo?: Periodo; sexo?: 'F' | 'M' }
export interface EspecieDef {
  num: number; // 1..180
  id: string; // slug sem acento, ex.: 'tamandui' (= id do modelo/sprite)
  nome: string;
  tipos: [TipoId] | [TipoId, TipoId];
  base: Record<Stat, number>;
  /** [nível, id do golpe] — 8 a 14 entradas, em ordem crescente de nível (nível 1 = já sabe) */
  golpes: [number, string][];
  /** ids de Pergaminhos de Técnica compatíveis */
  pergaminhos: string[];
  evolui?: Evolucao[];
  taxaCaptura: number; // 3 (lendário) .. 255 (muito fácil)
  expBase: number;
  esforco: Partial<Record<Stat, number>>;
  crescimento: 'rapido' | 'medio' | 'lento';
  /** proporção de fêmeas 0..1; null = sem sexo */
  femeas: number | null;
  diario: string; // 2 frases, informação real e curiosa sobre o animal
  altura: number; peso: number; // m, kg
  habitat: string;
  porte: Porte;
  lendario?: boolean;
}

export interface GolpeSlot { id: string; pg: number; pgMax: number }
export interface CriaturaInst {
  uid: string;
  especie: number;
  apelido?: string;
  nivel: number;
  exp: number;
  vida: number; // vida atual
  status: StatusId | null;
  sonoTurnos?: number;
  golpes: GolpeSlot[]; // 1..4
  gen: Record<Stat, number>; // genes 0..15
  esf: Record<Stat, number>; // esforço acumulado
  personalidade: string; // id (10 autorais; +10% / −10%)
  sexo: 'F' | 'M' | null;
  amizade: number; // 0..255
  cuia: string; // id do item da cuia usada
  treinadorOriginal: string;
  localCaptura?: string; nivelCaptura?: number;
  item?: string; // item segurado
  ovo?: number; // passos restantes, se for ovo
}

export interface GolpeDefBase {
  id: string; nome: string; tipo: TipoId;
  cat: 'fisico' | 'especial' | 'status';
  poder: number; // 0 para status
  precisao: number; // 0 = nunca erra
  pg: number;
  prioridade?: number;
  desc: string;
  /** id da animação (src/battle/anims) */
  anim: string;
}

/* ============================== itens ============================== */
export type Bolso = 'itens' | 'remedios' | 'cuias' | 'pergaminhos' | 'frutos' | 'chave';
export interface ItemDef { id: string; nome: string; bolso: Bolso; preco: number; desc: string; icone?: string }

/* ============================== treinadores ============================== */
export interface MembroEquipe { e: number; nv: number; golpes?: string[]; item?: string }
export interface TreinadorDef {
  id: string;
  classe: string; // 'Pescador', 'Capoeirista'… (= sprite de classe)
  nome: string;
  sprite: string; // id do modelo de pessoa
  equipe: MembroEquipe[];
  ia: 'novato' | 'treinador' | 'lider' | 'conselho';
  desafio: string; derrota: string; depois?: string;
  premio: number; // patacas
  dupla?: boolean;
  itens?: string[]; // itens de cura que a IA pode usar
  musica?: string;
  /** dá esta insígnia ao ser vencido */
  insignia?: number;
  /** flag marcada ao ser vencido (padrão: 'venceu:<id>') */
  flag?: string;
  /** passa (true) ou nunca passa (false) o número para o Rádio Cipó depois de vencido; sem o campo vale a regra de src/world/integracao.ts */
  contato?: boolean;
}

/* ============================== zonas ============================== */
export interface Encontro { e: number; nv: [number, number]; peso: number; estacao?: 'fria' | 'quente' }
export type MetodoEncontro = 'grama' | 'caverna' | 'agua' | 'pesca-velha' | 'pesca-boa' | 'pesca-mestra' | 'arvore' | 'rocha' | 'mergulho';
export interface Habitat {
  metodo: MetodoEncontro;
  /** tabela usada em qualquer período; as específicas (manha/dia/noite) substituem-na naquele período. 'tarde' usa a de 'dia'. */
  todos?: Encontro[]; manha?: Encontro[]; dia?: Encontro[]; noite?: Encontro[];
  /** camadas pós-insígnia: a de maior `apos` satisfeita substitui as tabelas acima */
  camadas?: { apos: number; todos?: Encontro[]; manha?: Encontro[]; dia?: Encontro[]; noite?: Encontro[] }[];
  /** chance de encontro por passo (grama/caverna/água), 0..1; padrão 0.10 */
  taxa?: number;
}
export interface Warp {
  x: number; y: number;
  para: { zona: string; x: number; y: number; dir?: Dir };
  tipo?: 'porta' | 'escada' | 'caverna' | 'borda' | 'buraco' | 'trem' | 'saveiro';
  requer?: Cond; // se não cumprir, mostra `recusa`
  recusa?: string;
}
export interface NpcDef {
  id: string;
  sprite: string; // id do modelo de pessoa (ou de criatura, prefixo 'c:')
  x: number; y: number; dir?: Dir;
  mov?: 'parado' | 'vagar' | 'olhar' | 'rota';
  rota?: Dir[];
  /** falas simples (cada string = uma caixa de texto). Para algo mais complexo use `script`. */
  fala?: string[];
  script?: string; // id de evento em src/data/eventos
  treinador?: string; // id em treinadores.ts; `visao` = alcance em tiles (padrão 4)
  visao?: number;
  loja?: string[]; // ids de itens vendidos
  /** só existe se a condição valer */
  se?: Cond;
}
export interface ItemChao { x: number; y: number; item: string; qtd?: number; oculto?: boolean; flag: string }
export interface Gatilho { x: number; y: number; w?: number; h?: number; script: string; se?: Cond; umaVez?: boolean }
export interface ObjetoSpawn { o: string; x: number; y: number; [k: string]: unknown }
export interface Portao { x: number; y: number; w?: number; h?: number; requer: Cond; fala: string; sprite?: string }

export interface ZonaDef {
  id: string; // 'A1', 'A-R1', 'A1-casa-jogador', 'A2-ginasio'…
  nome: string;
  mapa: 'A' | 'B' | 'PP';
  tipo: 'cidade' | 'rota' | 'floresta' | 'caverna' | 'agua' | 'dungeon' | 'interior' | 'ginasio';
  tileset: string;
  musica: string;
  arena: string; // fundo de batalha
  clima?: ClimaId;
  escuro?: boolean; // exige Lampião
  nevoa?: boolean; // exige Lampião para enxergar
  submerso?: boolean;
  /** grade de caracteres (legenda em docs/ZONAS.md), linhas de mesma largura */
  mapaChars: string[];
  objetos?: ObjetoSpawn[];
  warps: Warp[];
  npcs?: NpcDef[];
  placas?: { x: number; y: number; texto: string }[];
  itens?: ItemChao[];
  gatilhos?: Gatilho[];
  portoes?: Portao[];
  habitats?: Habitat[];
  /** ponto de pouso do Voo e de retorno após derrota (cidades) */
  pouso?: [number, number];
  /** nível médio esperado (verificação da curva) e passo de progressão em que fica acessível (1..17) */
  passo?: number;
  correnteza?: { x: number; y: number; w: number; h: number; dir: Dir }[];
  /** vagas da Decoração do Quarto: categoria → canto inferior esquerdo da peça (desenhadas pelo mundo, fora do bake) */
  decoracao?: Record<string, [number, number]>;
}

/* ============================== eventos (scripts declarativos) ============================== */
/** Ver docs/MOTOR.md para a lista de comandos. Cada comando é uma tupla ['nome', ...args]. */
export type Comando = [string, ...unknown[]];
export interface EventoDef { id: string; passos: Comando[] }

/* ============================== save ============================== */
export interface Opcoes { musica: number; sfx: number; velTexto: 1 | 2 | 3; dificuldade: 'explorador' | 'aventureiro' | 'veterano'; animBatalha: boolean; numerosDano: boolean; vibrar: boolean; parceiraSegue: boolean; teclas: Record<string, string[]>; qualidade: 'pc' | 'celular' }
export interface SaveData {
  versao: 1;
  jogador: { nome: string; avatar: 'kaue' | 'ayra'; id: string; zona: string; x: number; y: number; dir: Dir; dinheiro: number; poupanca: number; modo: 'pe' | 'bike' | 'remo' | 'mergulho' };
  equipe: CriaturaInst[];
  viveiro: (CriaturaInst | null)[][]; // 16 caixas × 30
  mochila: Record<string, number>;
  pcItens: Record<string, number>;
  flags: Record<string, number | boolean | string>;
  insignias: number[];
  amuletos: AmuletoId[];
  diario: { visto: number[]; capturado: number[] };
  relogio: { deslocamentoMin: number; diaSemana0: number };
  rng: number;
  tempoJogo: number;
  ultimoPosto: { zona: string; x: number; y: number };
  decoracao: Record<string, string>;
  contatos: string[];
  canteiros: Record<string, { fruto: string; plantado: number }>;
  repelente: number;
}
