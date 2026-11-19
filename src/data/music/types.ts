/** Formato das faixas: tudo é dado (notas escritas à mão em notação de texto), lido por `src/audio/notation.ts`. */

/** Instrumentos melódicos. Os quatro primeiros são as ondas de portátil clássico (pulso em três larguras e triângulo). */
export type InstId =
  | 'pulso' | 'pulso25' | 'pulso12' | 'tri'
  | 'sanfona' | 'viola' | 'cavaquinho' | 'violao' | 'flauta' | 'berimbau'
  | 'marimba' | 'kalimba' | 'sino' | 'pizz' | 'cordas' | 'metais' | 'pad' | 'padBrilho'
  | 'baixo' | 'baixoSub' | 'baixoDist' | 'guitarra' | 'lead';

/** Peças de percussão (uma letra por passo nas grades: X forte, x médio, o fantasma, . silêncio). */
export type PecaId =
  | 'chipBumbo' | 'chipCaixa' | 'chipHat'
  | 'zabumba' | 'bacalhau' | 'triF' | 'triA' | 'pandeiro' | 'alfaia' | 'gongue' | 'reco' | 'atabaque' | 'sapato'
  | 'bumbo' | 'caixa' | 'aro' | 'chimbal' | 'aberto' | 'prato' | 'surdo' | 'tom' | 'agogoA' | 'agogoB'
  | 'ganza' | 'caxixi' | 'palmas' | 'tamborim' | 'metal' | 'bigorna' | 'vapor' | 'gota';

export type Parte = 'melodia' | 'contra' | 'baixo' | 'harmonia' | 'bateria';

/** Como a cifra vira acompanhamento. */
export interface EstiloHarmonia {
  tipo: 'pad' | 'arpejo' | 'ritmo' | 'stab';
  oitava?: number;
  /** arpejo: índices das notas do acorde (≥ nº de notas sobe uma oitava) */
  padrao?: number[];
  /** arpejo: passos entre notas */
  passo?: number;
  /** ritmo/stab: grade de um compasso ('x' toca, 'X' acentua, '.' sustenta, '-' cala) */
  grade?: string;
}

export type PadraoBateria = Partial<Record<PecaId, string>>;

/**
 * Seção: compassos separados por `|`.
 * Notas: `nome[#|b]oitava[:passos][!|?]` (c4 = dó central; a duração vale até ser trocada), `r` pausa, `_` liga, `-` compasso vazio.
 * Baixo: notas como acima, ou `@grade` para derivar da cifra (1 fundamental, 3 terça, 5 quinta, 7 sétima, 8 oitava,
 * `a` aproximação cromática ao próximo acorde, `.` sustenta, `-` cala); várias grades separadas por `|` se alternam.
 */
export interface Secao {
  melodia: string;
  contra: string;
  baixo: string;
  acordes: string;
  /** ids de padrões de bateria, um por compasso (repete em ciclo); `-` = sem bateria */
  bateria: string;
  estilo?: EstiloHarmonia;
  inst?: Partial<Record<Exclude<Parte, 'bateria'>, InstId>>;
}

export interface Faixa {
  id: string;
  titulo: string;
  bpm: number;
  /** passos (semicolcheias) por compasso: 16 = 4/4, 12 = 3/4 ou 6/8 */
  passos?: number;
  swing?: number;
  loop: boolean;
  /** compasso para onde o laço volta (introduções tocam uma vez só) */
  voltaEm?: number;
  /** envio de reverb da faixa */
  envio?: number;
  vol?: Partial<Record<Parte, number>>;
  eco?: { passos: number; fb: number; mix: number };
  inst: Record<Exclude<Parte, 'bateria'>, InstId>;
  estilo: EstiloHarmonia;
  bateria: Record<string, PadraoBateria>;
  secoes: Record<string, Secao>;
  ordem: string[];
}
