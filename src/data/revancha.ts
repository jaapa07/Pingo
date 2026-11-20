/**
 * REVANCHES POR AGENDA (spec 10A, itens 25, 26 e 27) — dados e regras puras (sem DOM, sem mundo).
 *
 *  - FASES da equipe dos treinadores com contato no Rádio Cipó (item 26):
 *      1 início · 2 depois do Cartel na Usina (`usina-ok`) · 3 com 8 insígnias e a Liga vencida (`liga-vencida`) · 4 com 16 insígnias.
 *    As equipes de cada fase saem da equipe original do treinador: o ás sobe até o alvo da fase (curva do spec 4.5),
 *    as outras acompanham com a mesma distância (no máximo 4 níveis atrás), cada criatura aparece no estágio que teria
 *    naquele nível e, nas fases 3 e 4, equipes pequenas ganham reforço. Líderes têm reforços escolhidos à mão.
 *  - AGENDA: cada contato aceita revanche num DIA da semana e num PERÍODO fixos (manhã / dia, que inclui a tarde / noite).
 *    Treinadores comuns: dia e período sorteados pelo id (fixos para sempre). Líderes: tabela abaixo; só depois da Liga
 *    e no Ginásio de Treino de Porto Sereia (`A4-treino`).
 *  - RIVAL SEMANAL (item 27): depois da Liga, a Tainá treina na Gruta do Eco às terças e quintas; 1 batalha por dia.
 *
 * Quem usa: src/ui/telas/radio.ts (agenda, ligações, tabela), src/data/eventos/regras.ts (Ginásio de Treino, rival),
 * tools/sim-revancha.ts (medição das fases).
 */
import type { EspecieDef, MembroEquipe, Periodo, TreinadorDef, ZonaDef, Encontro } from '../core/tipos';

export type Fase = 1 | 2 | 3 | 4;
export type PeriodoAgenda = 'manha' | 'dia' | 'noite';
export const NOME_FASE: Record<Fase, string> = { 1: 'início', 2: 'depois da Usina', 3: 'depois da Liga', 4: '16 insígnias' };
export const NOME_PERIODO: Record<PeriodoAgenda, string> = { manha: 'de manhã', dia: 'de dia', noite: 'à noite' };
export const NOME_DIA_LONGO = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
export const NOME_DIA_CURTO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** fase atual pelo progresso do save */
export function faseDoProgresso(insignias: number, flags: Record<string, unknown>): Fase {
  if (insignias >= 16) return 4;
  if (insignias >= 8 && flags['liga-vencida']) return 3;
  if (flags['usina-ok']) return 2;
  return 1;
}
/** o período do relógio (4 valores) cai em qual faixa da agenda: a tarde conta como "dia" */
export const faixaDoPeriodo = (p: Periodo): PeriodoAgenda => (p === 'tarde' ? 'dia' : p);

/* ============================== alvos de nível por fase (spec 4.5) ============================== */
/**
 * Ás de cada fase. Comuns: fase 2 ≈ líder 5 (o jogador passa a Usina na insígnia 3 e segue até a 8), fase 3 ≈ ás do
 * Campeão (o mapa B começa em 44–48), fase 4 ≈ líder 16. Líderes ficam acima: fase 3 entre os líderes 10 e 11 e
 * fase 4 no nível do Conselho. Nunca abaixo do ás original + 2 (a revanche é sempre mais forte que a 1ª luta).
 */
export const ALVO_COMUM: Record<Fase, number> = { 1: 0, 2: 28, 3: 48, 4: 64 };
export const ALVO_LIDER: Record<Fase, number> = { 1: 0, 2: 0, 3: 54, 4: 68 };
export const ALVO_RIVAL: Record<Fase, number> = { 1: 0, 2: 0, 3: 52, 4: 68 };

/* ============================== líderes (item 25) ============================== */
export interface AgendaLider {
  id: string; insignia: number; dia: number; periodo: PeriodoAgenda;
  /** onde ele diz que dá para encontrá-lo fora do ginásio (só sabor; a luta é no Ginásio de Treino) */
  lugar: string;
  /** criaturas que entram na equipe na fase 3 e (mais) na fase 4; o nível é o do ás − 1 */
  reforco3: number[]; reforco4: number[];
}
/** dois líderes por dia (no máximo três), espalhados pelos períodos */
export const LIDERES_AGENDA: AgendaLider[] = [
  { id: 'lider-01', insignia: 1, dia: 1, periodo: 'manha', lugar: 'no píer de Vila Caiçara', reforco3: [12, 106, 52], reforco4: [110] },
  { id: 'lider-02', insignia: 2, dia: 2, periodo: 'dia', lugar: 'nas copas de Bosque Alto', reforco3: [144, 150], reforco4: [156] },
  { id: 'lider-03', insignia: 3, dia: 3, periodo: 'noite', lugar: 'nas eclusas de Porto Sereia', reforco3: [40], reforco4: [132] },
  { id: 'lider-04', insignia: 4, dia: 4, periodo: 'noite', lugar: 'no mirante de Cidade Coral', reforco3: [150], reforco4: [9] },
  { id: 'lider-05', insignia: 5, dia: 5, periodo: 'manha', lugar: 'na Oficina do Volta', reforco3: [64], reforco4: [116] },
  { id: 'lider-06', insignia: 6, dia: 6, periodo: 'noite', lugar: 'no cemitério velho', reforco3: [94], reforco4: [] },
  { id: 'lider-07', insignia: 7, dia: 0, periodo: 'manha', lugar: 'na forja de Vila Ferrugem', reforco3: [144], reforco4: [146] },
  { id: 'lider-08', insignia: 8, dia: 0, periodo: 'dia', lugar: 'no buritizal de Vila Buriti', reforco3: [160], reforco4: [] },
  { id: 'lider-09', insignia: 9, dia: 1, periodo: 'dia', lugar: 'no barreiro do Sertão', reforco3: [], reforco4: [80] },
  { id: 'lider-10', insignia: 10, dia: 2, periodo: 'manha', lugar: 'na Chapada Rubra', reforco3: [], reforco4: [] },
  { id: 'lider-11', insignia: 11, dia: 3, periodo: 'dia', lugar: 'no Arraial Brasa', reforco3: [], reforco4: [] },
  { id: 'lider-12', insignia: 12, dia: 5, periodo: 'dia', lugar: 'na roda de capoeira da Cidade Ginga', reforco3: [], reforco4: [] },
  { id: 'lider-13', insignia: 13, dia: 6, periodo: 'manha', lugar: 'no Brejo Roxo', reforco3: [], reforco4: [] },
  { id: 'lider-14', insignia: 14, dia: 4, periodo: 'dia', lugar: 'no galpão da geada', reforco3: [], reforco4: [] },
  { id: 'lider-15', insignia: 15, dia: 6, periodo: 'dia', lugar: 'no observatório', reforco3: [], reforco4: [] },
  { id: 'lider-16', insignia: 16, dia: 0, periodo: 'noite', lugar: 'no Monte Tupã', reforco3: [], reforco4: [] },
];
export const agendaLider = (id: string) => LIDERES_AGENDA.find((l) => l.id === id);
/** Ginásio de Treino (interior criado para as revanches dos líderes) */
export const TREINO = { zona: 'A4-treino', nome: 'Ginásio de Treino de Porto Sereia' };
/** posição de cada líder no salão do Ginásio de Treino (x, y), na ordem da insígnia */
export const TREINO_POSICOES: [number, number][] = [
  [3, 4], [5, 4], [7, 4], [11, 4], [13, 4], [15, 4], [3, 8], [5, 8], [13, 8], [15, 8], [3, 12], [5, 12], [13, 12], [15, 12], [7, 2], [11, 2],
];
/** sprite de cada líder no salão (os mesmos dos arquivos de ginásio; o motor confere com o treinador real ao abrir a zona) */
export const SPRITE_LIDER: Record<string, string> = {
  'lider-01': 'lider-01', 'lider-02': 'lider-02', 'lider-03': 'lider-03', 'lider-04': 'lider-06', 'lider-05': 'lider-07', 'lider-06': 'lider-08',
  'lider-07': 'lider-12', 'lider-08': 'lider-04', 'lider-09': 'lider-09', 'lider-10': 'lider-10', 'lider-11': 'lider-11', 'lider-12': 'lider-05',
  'lider-13': 'lider-13', 'lider-14': 'lider-14', 'lider-15': 'lider-15', 'lider-16': 'lider-16',
};
/** o jogo troca esta busca pela do treinador real (src/data/eventos/regras.ts); fora do jogo vale a tabela */
export const buscaSpriteLider: { fn: (id: string) => string | undefined } = { fn: () => undefined };
export const spriteDoLider = (id: string) => buscaSpriteLider.fn(id) ?? SPRITE_LIDER[id] ?? 'npc-homem-1';

/* ============================== rival semanal (item 27) ============================== */
export const RIVAL_SEMANAL = {
  dias: [2, 4], zona: 'A-GE', lugar: 'na Gruta do Eco, perto da saída para Porto Sereia', x: 47, y: 6,
};
/** tipo do inicial DA TAINÁ: o que vence o do jogador (mesma regra dos duelos de história) */
export function inicialDaRival(flags: Record<string, unknown>): 'brasa' | 'rio' | 'mata' {
  return flags['inicial-mata'] ? 'brasa' : flags['inicial-brasa'] ? 'rio' : 'mata';
}
/** equipe da Tainá no treino semanal: a do Platô (rival-5) crescida até o alvo da fase */
export function equipeRivalSemanal(fase: Fase, dela: 'brasa' | 'rio' | 'mata'): MembroEquipe[] {
  const as = ALVO_RIVAL[Math.max(3, fase) as Fase];
  const meio = dela === 'brasa' ? 26 : dela === 'rio' ? 17 : 42, ini = dela === 'brasa' ? 6 : dela === 'rio' ? 9 : 3;
  return [{ e: 12, nv: as - 3 }, { e: 29, nv: as - 3 }, { e: meio, nv: as - 2 }, { e: 64, nv: as - 2 }, { e: 108, nv: as - 1 }, { e: ini, nv: as }];
}
export function rivalSemanalDef(fase: Fase, dela: 'brasa' | 'rio' | 'mata'): TreinadorDef {
  return {
    id: 'rival-semanal', classe: 'Rival', nome: 'Tainá', sprite: 'taina', ia: 'lider', musica: 'batalha-rival', contato: false,
    premio: fase >= 4 ? 7400 : 5800, itens: fase >= 4 ? ['elixir-andiroba', 'garrafada'] : ['garrafada', 'garrafada'],
    flag: 'rival-semanal-venceu', equipe: equipeRivalSemanal(fase, dela),
    desafio: fase >= 4 ? 'Dezesseis insígnias, hein? Eu conto as minhas toda terça e quinta aqui embaixo. Hoje a gruta vai ecoar o MEU nome!'
      : 'Achou meu esconderijo! Terça e quinta eu treino aqui, no escuro, que é para ninguém copiar. Uma batalha. Só uma. Vale o dia!',
    derrota: 'O eco repete "perdeu, perdeu, perdeu"… Até a gruta é sua torcida. Volta no próximo dia de treino!',
  };
}

/* ============================== treinadores comuns ============================== */
function hash(t: string): number { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
const PERIODOS: PeriodoAgenda[] = ['manha', 'dia', 'noite'];
/** classes que acordam cedo ou só saem à noite (o sorteio respeita o costume do personagem) */
const NOTURNOS = /coruj|notívag|notivag|assombr|vigia|seresteir|astr|boêmi|boemi/i, MADRUGADORES = /pescad|vaqueir|mateir|feirant|escoteir|observador/i;
export interface Agenda { dia: number; periodo: PeriodoAgenda; lugar?: string }
/** dia e período de revanche de qualquer contato (líderes pela tabela; comuns pelo id, fixos para sempre) */
export function agendaDe(t: Pick<TreinadorDef, 'id' | 'classe'>): Agenda {
  const l = agendaLider(t.id); if (l) return { dia: l.dia, periodo: l.periodo, lugar: TREINO.nome };
  if (/^rival-/.test(t.id)) return { dia: RIVAL_SEMANAL.dias[0], periodo: 'dia', lugar: 'Gruta do Eco' };
  const h = hash(t.id);
  const periodo = NOTURNOS.test(t.classe) ? 'noite' : MADRUGADORES.test(t.classe) ? (h & 8 ? 'manha' : 'dia') : PERIODOS[(h >>> 4) % 3];
  return { dia: h % 7, periodo };
}
/** a agenda vale agora? */
export const naAgenda = (a: Agenda, dia: number, p: Periodo) => a.dia === dia && a.periodo === faixaDoPeriodo(p);

/* ============================== equipes por fase ============================== */
export type BuscaEspecie = (num: number) => EspecieDef | undefined;
/** forma que a linha evolutiva tem no nível dado (evolução por nível; por pedra/amizade a partir do nível 36) */
export function formaNoNivel(num: number, nivel: number, esp: BuscaEspecie): number {
  let n = num;
  for (let guarda = 0; guarda < 4; guarda++) {
    const evs = esp(n)?.evolui ?? [];
    const ev = evs.find((x) => x.nivel !== undefined && !x.item && nivel >= x.nivel) ?? (nivel >= 36 ? evs.find((x) => x.nivel === undefined && !x.sexo) : undefined);
    if (!ev || !esp(ev.para)) return n;
    n = ev.para;
  }
  return n;
}
/**
 * Equipe do treinador na fase. Fase 1 = a equipe original com +2 níveis (o treinador também treinou).
 * Demais: ás = máx(alvo da fase, ás original + 2); cada criatura mantém a distância ao ás (até 4 níveis), evolui para o
 * estágio do nível e perde os golpes escritos à mão (aprende os do nível novo); itens segurados continuam.
 */
export function equipeDaFase(t: Pick<TreinadorDef, 'id' | 'equipe' | 'insignia' | 'classe'>, fase: Fase, esp: BuscaEspecie): MembroEquipe[] {
  const orig = t.equipe, asOrig = Math.max(...orig.map((m) => m.nv));
  if (fase === 1 && t.insignia === undefined) return orig.map((m) => ({ ...m, nv: Math.min(100, m.nv + 2) }));
  const lider = t.insignia !== undefined ? agendaLider(t.id) : undefined;
  const alvo = (lider ? ALVO_LIDER : ALVO_COMUM)[fase];
  // líder 16 e o Conselho já são mais fortes que o alvo da fase 3: a revanche nunca é mais fraca que a 1ª luta
  const as = Math.min(100, Math.max(alvo, asOrig + 2 + (lider && fase === 4 ? 3 : 0)));
  const eq: MembroEquipe[] = orig.map((m) => {
    const nv = as - Math.min(4, asOrig - m.nv), e = formaNoNivel(m.e, nv, esp);
    return { e, nv, ...(m.item ? { item: m.item } : {}), ...(e === m.e && nv - m.nv <= 6 && m.golpes ? { golpes: m.golpes } : {}) };
  });
  const extra = lider ? [...(fase >= 3 ? lider.reforco3 : []), ...(fase >= 4 ? lider.reforco4 : [])] : [];
  for (const e of extra) if (eq.length < 6 && esp(e)) eq.splice(Math.max(0, eq.length - 1), 0, { e: formaNoNivel(e, as - 1, esp), nv: as - 1 });
  // comuns de equipe pequena ganham reforço da mesma linha nas fases 3 (≥ 3 criaturas) e 4 (≥ 4)
  if (!lider) for (let i = 0; eq.length < (fase === 4 ? 4 : fase === 3 ? 3 : 0); i++) { const m = eq[i % orig.length]; eq.splice(0, 0, { e: m.e, nv: Math.max(2, m.nv - 2) }); }
  return eq;
}
/** prêmio da revanche: cresce com a fase */
export const premioDaFase = (t: Pick<TreinadorDef, 'premio' | 'insignia'>, fase: Fase, as = 0) => Math.max(Math.round(t.premio * (t.insignia !== undefined ? 1 + fase * 0.35 : 1 + (fase - 1) * 0.9)), as * (t.insignia !== undefined ? 80 : 36));
/** o treinador da revanche, pronto para o motor (id próprio para não marcar o original nem virar contato de novo) */
export function treinadorDaFase(t: TreinadorDef, fase: Fase, esp: BuscaEspecie): TreinadorDef {
  const forte = fase >= 3, equipe = equipeDaFase(t, fase, esp);
  return {
    ...t, id: 'revanche:' + t.id, insignia: undefined, contato: false, flag: 'revanche-venceu:' + t.id,
    equipe, premio: premioDaFase(t, fase, Math.max(...equipe.map((m) => m.nv))),
    ia: t.ia === 'novato' && fase >= 2 ? 'treinador' : t.ia,
    itens: t.itens?.length ? t.itens : forte && t.insignia !== undefined ? ['elixir-andiroba', 'garrafada'] : t.itens,
  };
}

/* ============================== enxame do dia (item 4, anunciado na agenda do item 39) ============================== */
/** zonas candidatas: rotas e matas do mapa A (e do B, quando aberto) com capim alto */
export function zonasDeEnxame(zonas: readonly ZonaDef[], mapaB: boolean): ZonaDef[] {
  return zonas.filter((z) => !z.id.startsWith('_') && (z.mapa === 'A' || (mapaB && z.mapa === 'B')) && (z.tipo === 'rota' || z.tipo === 'floresta') && z.habitats?.some((h) => h.metodo === 'grama' && (h.todos ?? h.dia)?.length)).sort((a, b) => (a.id < b.id ? -1 : 1));
}
/**
 * Enxame do dia: uma zona por dia corrido (rodízio fixo) e, nela, a espécie mais rara da tabela base de capim
 * (todos/dia). Durante o dia inteiro essa espécie tem 40% dos encontros de capim da zona.
 */
export function enxameDoDia(zonas: readonly ZonaDef[], dia: number, mapaB = false): { zona: ZonaDef; e: number; nv: [number, number] } | null {
  const cs = zonasDeEnxame(zonas, mapaB); if (!cs.length) return null;
  const z = cs[((dia * 5) % cs.length + cs.length) % cs.length];
  const h = z.habitats!.find((x) => x.metodo === 'grama')!, t = (h.todos ?? h.dia)!;
  const rara = t.reduce((a, x) => (x.peso < a.peso ? x : a));
  return { zona: z, e: rara.e, nv: rara.nv };
}
/** aplica o enxame a uma tabela em vigor: a espécie passa a 40% (se não estiver na tabela deste período, entra) */
export function aplicarEnxame(t: Encontro[], e: number, nv: [number, number]): Encontro[] {
  const outros = t.filter((x) => x.e !== e), soma = outros.reduce((a, x) => a + x.peso, 0);
  if (!soma) return t;
  return [...outros, { e, nv, peso: Math.max(1, Math.round((soma * 0.4) / 0.6)) }];
}

/* ============================== dia corrido ============================== */
/** dia corrido do relógio do jogo (igual a `diaDoAno` das telas): muda à meia-noite do aparelho + deslocamento */
export function diaCorrido(deslocamentoMin: number, agora = Date.now()): number {
  const d = new Date(agora + deslocamentoMin * 60000);
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
}
