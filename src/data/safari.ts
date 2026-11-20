/**
 * PARQUE SAFÁRI DO BURITI-ALTO (spec 10A item 33, pós-Liga) — dados.
 * O parque (`A-SF-parque`) tem 4 setores; só o 1º existe no começo. O dono, Seu Jatobá, monta os outros
 * conforme o jogador traz objetos de ambiente achados pelo mapa A (itens-chave novos no fim de src/data/itens.ts).
 * Encontros só dali (não há `habitats` no parque: a mecânica src/world/mecanicas/safari.ts sorteia destas tabelas)
 * com espécies raras do mapa A e algumas do mapa B (tabela 6.4), níveis da curva pós-Liga (40–48).
 */
import type { Encontro } from '../core/tipos';

export const SAFARI = {
  /** preço da entrada (patacas) */
  entrada: 500,
  /** cuias-safári entregues na porteira (devolvidas ao sair) */
  cuias: 30,
  /** passos por passeio */
  passos: 500,
  /** chance de encontro por passo na grama alta do parque */
  taxa: 0.12,
  item: 'cuia-safari',
} as const;

export interface SetorSafari {
  n: 1 | 2 | 3 | 4;
  nome: string;
  /** retângulo do setor no mapa do parque (tiles, inclusivo) */
  x0: number; y0: number; x1: number; y1: number;
  /** objeto de ambiente que o dono pede para abrir o setor (o 1º já vem aberto) */
  objeto?: string;
  /** flag marcada quando o setor abre */
  flag: string;
  arena: string;
  /** tabelas por período (a de 'tarde' usa a de 'dia'; `todos` vale quando o período não tem tabela) */
  todos?: Encontro[]; dia?: Encontro[]; noite?: Encontro[];
  /** fala do dono ao receber o objeto */
  pedido: string;
}

/** grade do parque: 44 × 34 tiles, quatro quadrantes (ver src/data/zonas/A-SF-parque.ts) */
export const SETORES: SetorSafari[] = [
  {
    n: 1, nome: 'Vereda dos Buritis', x0: 0, y0: 17, x1: 21, y1: 33, flag: 'safari-setor-1', arena: 'cerrado',
    pedido: 'A vereda já está pronta: buriti, capim e bicho do cerrado.',
    dia: [
      { e: 102, nv: [40, 43], peso: 22 }, { e: 104, nv: [40, 43], peso: 22 }, { e: 98, nv: [41, 43], peso: 18 },
      { e: 62, nv: [40, 42], peso: 14 }, { e: 67, nv: [40, 42], peso: 16 }, { e: 68, nv: [42, 43], peso: 3 },
    ],
    noite: [
      { e: 70, nv: [40, 43], peso: 26 }, { e: 98, nv: [41, 43], peso: 20 }, { e: 62, nv: [40, 42], peso: 22 },
      { e: 104, nv: [40, 42], peso: 16 }, { e: 67, nv: [40, 42], peso: 12 }, { e: 68, nv: [42, 43], peso: 4 },
    ],
  },
  {
    n: 2, nome: 'Lagoa das Garças', x0: 22, y0: 17, x1: 43, y1: 33, objeto: 'pedra-de-rio', flag: 'safari-setor-2', arena: 'pantanal',
    pedido: 'Pedra de rio! Com ela eu calço a margem e a lagoa segura água o ano inteiro. Volte amanhã… brincadeira, já está pronta!',
    dia: [
      { e: 108, nv: [41, 44], peso: 22 }, { e: 58, nv: [41, 44], peso: 20 }, { e: 106, nv: [42, 44], peso: 18 },
      { e: 84, nv: [41, 44], peso: 16 }, { e: 36, nv: [41, 43], peso: 18 }, { e: 100, nv: [43, 44], peso: 6 },
    ],
    noite: [
      { e: 26, nv: [41, 44], peso: 26 }, { e: 84, nv: [41, 44], peso: 22 }, { e: 58, nv: [41, 44], peso: 18 },
      { e: 36, nv: [41, 43], peso: 18 }, { e: 108, nv: [42, 44], peso: 10 }, { e: 100, nv: [43, 44], peso: 6 },
    ],
  },
  {
    n: 3, nome: 'Mata Ciliar', x0: 0, y0: 0, x1: 21, y1: 16, objeto: 'muda-de-buriti', flag: 'safari-setor-3', arena: 'mata',
    pedido: 'Muda de buriti da Vila Buriti! Onde tem buriti tem água, e onde tem água a mata volta. Pode ir ver: já tem bugio gritando lá.',
    dia: [
      { e: 64, nv: [43, 46], peso: 20 }, { e: 23, nv: [43, 46], peso: 20 }, { e: 50, nv: [43, 46], peso: 18 },
      { e: 47, nv: [43, 45], peso: 14 }, { e: 27, nv: [43, 45], peso: 14 }, { e: 150, nv: [44, 46], peso: 10 }, { e: 90, nv: [45, 46], peso: 4 },
    ],
    noite: [
      { e: 64, nv: [43, 46], peso: 24 }, { e: 50, nv: [43, 46], peso: 16 }, { e: 27, nv: [43, 45], peso: 16 },
      { e: 23, nv: [43, 46], peso: 16 }, { e: 150, nv: [44, 46], peso: 12 }, { e: 90, nv: [45, 46], peso: 6 },
    ],
  },
  {
    n: 4, nome: 'Toca dos Troncos Ocos', x0: 22, y0: 0, x1: 43, y1: 16, objeto: 'tronco-oco', flag: 'safari-setor-4', arena: 'mata',
    pedido: 'Um tronco oco inteirinho! É casa para coruja, para urutau, para quem gosta de escuro. A toca está aberta, mas cuidado: lá dentro tem bicho grande.',
    dia: [
      { e: 94, nv: [45, 48], peso: 22 }, { e: 144, nv: [45, 48], peso: 22 }, { e: 109, nv: [45, 47], peso: 14 },
      { e: 44, nv: [45, 47], peso: 18 }, { e: 172, nv: [45, 47], peso: 14 }, { e: 72, nv: [47, 48], peso: 4 },
    ],
    noite: [
      { e: 44, nv: [45, 48], peso: 22 }, { e: 172, nv: [45, 48], peso: 22 }, { e: 170, nv: [45, 48], peso: 18 },
      { e: 94, nv: [45, 48], peso: 18 }, { e: 109, nv: [45, 47], peso: 8 }, { e: 72, nv: [47, 48], peso: 6 },
    ],
  },
];
export const setorEm = (x: number, y: number): SetorSafari | undefined => SETORES.find((s) => x >= s.x0 && x <= s.x1 && y >= s.y0 && y <= s.y1);
/** tabela em vigor no setor para o período (a 'tarde' usa a do 'dia') */
export function tabelaSetor(s: SetorSafari, periodo: string): Encontro[] {
  const p = periodo === 'noite' ? s.noite : s.dia;
  return p ?? s.todos ?? [];
}

/**
 * Regras da batalha de safári (sem golpes). Estado da criatura: `raiva` e `comendo` contam turnos (0 = nada);
 * `perto` = quantas vezes o jogador se aproximou (máx. 2).
 * - Isca: come por 1–5 turnos → foge bem menos, mas a cuia pega pior.
 * - Pedra: fica brava por 1–5 turnos → a cuia pega melhor, mas ela foge mais.
 * - Aproximar: a cuia pega melhor a cada passo; ela pode se assustar (foge mais).
 */
export const REGRA = {
  bonusCuia: 1.5,
  pedraCaptura: 2, iscaCaptura: 0.5, pertoCaptura: [1, 1.35, 1.7],
  /** fuga por turno = clamp((vel + 30) / 512 × fatores) */
  iscaFuga: 0.3, pedraFuga: 2, pertoFuga: [1, 1.3, 1.6],
  fugaMin: 0.03, fugaMax: 0.6,
};
