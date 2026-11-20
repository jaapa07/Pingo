/**
 * MOTOR DE BATALHA — máquina de estados determinística e pura (sem DOM; roda em Node).
 * Recebe os dois lados e as ações de cada turno; produz uma fila de `EventoBatalha` que a view reproduz.
 * Todo acaso usa `rng`. O motor altera as `CriaturaInst` recebidas (vida, status, PG, exp, nível) e os itens dos lados.
 *
 * Ciclo:  b.iniciar() → enquanto b.fase !== 'fim':
 *   'acoes'      → b.executarTurno([{ lado, pos, acao }…])   (uma ação para cada pedido de b.pedidos())
 *   'substituir' → b.substituir([{ lado, pos, para }…])
 *   'oferta'     → b.responderOferta(indice | null)          (troca "de graça" depois de nocautear, 1×1 contra treinador)
 * Cada chamada devolve os eventos novos (também acumulados em b.eventos).
 */
import type { ClimaId, CriaturaInst, Periodo, Stat, StatusId, TipoId } from '../core/tipos';
import { rng } from '../core/rng';
import { DESESPERO, golpe as defGolpe, type Efeito, type GolpeDef, type StatEst } from '../data/golpes';
import { eficaciaContra } from '../data/tabela-tipos';
import { item as defItem, temItemDef, type UsoItem } from '../data/itens';
import { bonusArtesanal, chanceObedecer, deOutroTreinador, AMIZADE_CUIA_AMIGA } from './cuias';
import { aprenderGolpe, atributos, especie, expDerrota, expParaNivel, ganharEsforco, mudarAmizade, NIVEL_MAX, nomeDe, podeEvoluir, subirNivel } from './criatura';

/* ============================== tipos públicos ============================== */
/**
 * Chocalho do Mutirão: a reserva só aprende olhando quando está ESTES níveis (ou mais) atrás da mais forte.
 * Depois da Liga (`liga-vencida`) o limiar sobe para 5 (decisão do autor, docs/EQUILIBRIO-MAPA-B.md): o Chocalho continua
 * pondo uma captura nova em dia, mas deixa de levar a equipe nivelada inteira junto pelo mapa B.
 */
export const LIMIAR_CHOCALHO = { antesDaLiga: 2, depoisDaLiga: 5 } as const;
/**
 * Experiência das batalhas depois da Liga (`liga-vencida`): 55% da fórmula (corte de 45%, decisão do autor depois de ver 25%, 40% e 50%;
 * docs/EQUILIBRIO-MAPA-B.md). O mapa A (antes da Liga) recebe a experiência inteira.
 */
export const FATOR_EXP_POS_LIGA = 0.55;
/**
 * Prêmio em patacas dos treinadores da jornada do mapa B (decisão do autor, docs/DECISOES-FINAIS.md): ×1,5. Vale para as
 * batalhas travadas nas zonas do mapa B (ids `B…`), do Pico Pindorama (`PP…`) e nas áreas do mapa A que só se abrem
 * nessa jornada (Rio Cachoeira-Véu `A-R6`, Monte Tupã `A-MT…`, Cidade `A9…` do ginásio 16). Revanches, rival semanal e Torre
 * (mapa A) ficam como estão. Fica no prêmio que o treinador PAGA (a mensagem "Você ganhou N patacas" já mostra o valor final).
 */
export const FATOR_PREMIO_MAPA_B = 1.5;
const ZONAS_PREMIO_MAPA_B = /^(B|PP|A-R6$|A-MT|A9)/;
/** fator do prêmio em patacas pela zona onde a batalha acontece */
export function fatorPremioDaZona(zonaId: string): number { return ZONAS_PREMIO_MAPA_B.test(zonaId) ? FATOR_PREMIO_MAPA_B : 1; }
export interface Pos { lado: 0 | 1; pos: number }
export type Acao =
  /** slot do golpe (−1 = Desespero, quando não há PG). `alvo`: adversário visado (duplas). `trocaPara`: quem entra depois de um golpe de bater-e-voltar. */
  | { tipo: 'golpe'; slot: number; alvo?: Pos; trocaPara?: number }
  | { tipo: 'troca'; para: number }
  /** `alvo`: índice na equipe de quem recebe o remédio (padrão: a ativa); `slot`: golpe que recebe PG */
  | { tipo: 'item'; item: string; alvo?: number; slot?: number }
  | { tipo: 'fuga' };
export interface AcaoDe extends Pos { acao: Acao }
export type FaseBatalha = 'inicio' | 'acoes' | 'substituir' | 'oferta' | 'fim';
export type ResultadoId = 'vitoria' | 'derrota' | 'fuga' | 'captura';
export interface Pedido extends Pos { tipo: 'acao' | 'substituir' | 'oferta' }

export interface ConfigLado { equipe: CriaturaInst[]; itens?: Record<string, number>; nome?: string }
export interface ConfigBatalha {
  tipo: 'selvagem' | 'treinador' | 'lendario';
  /** lado 0 = jogador; lado 1 = adversário */
  lados: [ConfigLado, ConfigLado];
  clima?: ClimaId;
  dupla?: boolean;
  semFuga?: boolean;
  semCaptura?: boolean;
  /** período do dia (Cuia Noturna e evoluções por horário) */
  periodo?: Periodo;
  /** oferece troca ao jogador quando o treinador rival vai mandar a próxima (padrão: true; false no modo veterano) */
  trocaGratis?: boolean;
  /** o lado 0 ganha experiência e esforço (padrão: true) */
  ganhaExp?: boolean;
  /** Chocalho do Mutirão: quem ficou na reserva, está de pé e `limiarPartilha` níveis ou mais abaixo da mais forte da equipe recebe metade do que cada participante ganhou. Padrão: false. */
  expPartilhada?: boolean;
  /** quantos níveis atrás da mais forte a reserva tem de estar para o Chocalho valer (padrão 2; 5 depois da Liga: `LIMIAR_CHOCALHO`) */
  limiarPartilha?: number;
  /** multiplica a experiência de cada derrubada (padrão 1; `FATOR_EXP_POS_LIGA` depois de `liga-vencida`) */
  fatorExp?: number;
  /** com 4 golpes, um golpe novo substitui sozinho o mais fraco (IA/headless). Padrão: false → fica em `golpesPendentes`. */
  autoAprender?: boolean;
  /** o encontro veio da pesca (Cuia de Isca) */
  pescada?: boolean;
  /** obediência (spec 10A-13): criaturas do lado 0 de outro treinador acima de `limite` podem desobedecer */
  obediencia?: { limite: number; dono: string };
}

export interface ResumoCriatura { uid: string; especie: number; nome: string; nivel: number; vida: number; vidaMax: number; status: StatusId | null; sexo: 'F' | 'M' | null; expNivel: number; expProx: number; exp: number }
export type VolatilId = 'confuso' | 'preso' | 'atordoado' | 'semente';
export type EventoBatalha =
  | { t: 'msg'; texto: string }
  | { t: 'entra'; lado: 0 | 1; pos: number; indice: number; criatura: ResumoCriatura; inicial?: boolean }
  | { t: 'sai'; lado: 0 | 1; pos: number; uid: string }
  /** animação de golpe: `anim` é um id de anims-usadas.ts; `alvos` já descontados os erros */
  | { t: 'golpe'; lado: 0 | 1; pos: number; golpe: string; anim: string; alvos: Pos[] }
  /** golpe de 2 turnos. `solta` ausente = está preparando (`some` = o sprite sai de cena); `solta: true` = voltou à cena (vai golpear ou foi interrompido) */
  | { t: 'carga'; lado: 0 | 1; pos: number; golpe: string; some: boolean; solta?: boolean }
  | { t: 'errou'; lado: 0 | 1; pos: number; alvo: Pos; motivo: 'precisao' | 'protecao' | 'fora' | 'imune' | 'falhou' }
  | { t: 'dano'; lado: 0 | 1; pos: number; uid: string; de: number; para: number; max: number; eficacia: number; critico: boolean; origem: 'golpe' | 'recuo' | 'status' | 'clima' | 'confusao' | 'semente' | 'armadilha' | 'espinhos' | 'tombo' }
  | { t: 'cura'; lado: 0 | 1; pos: number; uid: string; de: number; para: number; max: number }
  | { t: 'status'; lado: 0 | 1; pos: number; uid: string; status: StatusId | null }
  | { t: 'volatil'; lado: 0 | 1; pos: number; v: VolatilId; ativo: boolean }
  | { t: 'estagio'; lado: 0 | 1; pos: number; stat: StatEst; delta: number; valor: number }
  | { t: 'clima'; clima: ClimaId }
  | { t: 'campo'; lado: 0 | 1; efeito: 'barreira-fisico' | 'barreira-especial' | 'barreira-status' | 'espinhos'; ativo: boolean }
  | { t: 'anim'; anim: string; lado: 0 | 1; pos: number }
  | { t: 'desmaio'; lado: 0 | 1; pos: number; uid: string }
  | { t: 'item'; lado: 0 | 1; item: string; uid: string }
  | { t: 'exp'; uid: string; ganho: number; de: number; para: number }
  | { t: 'nivel'; uid: string; nivel: number; antes: Record<Stat, number>; depois: Record<Stat, number> }
  | { t: 'novo-golpe'; uid: string; golpe: string; esqueceu?: string }
  /** a criatura quer aprender, mas já tem 4 golpes: a view pergunta e chama b.aprender(uid, golpe, slot | −1) */
  | { t: 'golpe-pendente'; uid: string; golpe: string }
  | { t: 'evolucao-pendente'; uid: string; para: number }
  /** arremesso de cuia: `balancos` 0–3 antes de escapar; em caso de sucesso sempre 3 */
  | { t: 'captura'; cuia: string; lado: 0 | 1; pos: number; balancos: number; sucesso: boolean }
  | { t: 'fuga'; lado: 0 | 1; sucesso: boolean }
  /** o treinador rival vai mandar `proxima`; o jogador pode trocar antes */
  | { t: 'oferta-troca'; proxima: ResumoCriatura }
  | { t: 'fim'; resultado: ResultadoId };

/** condições voláteis de quem está em campo (zeram ao sair) */
export interface Volatil {
  est: Record<StatEst, number>;
  confuso: number; preso: number; atordoado: boolean; semente: Pos | null;
  protegido: boolean; protUsos: number;
  carga: { golpe: string; alvo?: Pos } | null; some: boolean; recarga: boolean;
  foco: number; danoTurno: number; turnos: number;
}
export interface LadoBatalha {
  equipe: CriaturaInst[]; ativos: number[]; vol: Volatil[]; itens: Record<string, number>; nome: string;
  barreira: { fisico: number; especial: number; status: number }; espinhos: boolean;
  /** último golpe usado por este lado (o encantado adversário imita este) */
  ultimoGolpe: string | null;
  /** índices da equipe que já entraram em campo */
  vistos: Set<number>;
  /** golpes já mostrados em batalha, por uid (informação pública para a IA) */
  revelados: Map<string, Set<string>>;
}

/* ============================== tabelas ============================== */
export const NOME_STAT: Record<StatEst, string> = { atq: 'Ataque', def: 'Defesa', atqEsp: 'Ataque Especial', defEsp: 'Defesa Especial', vel: 'Velocidade', prec: 'Precisão', eva: 'Evasão' };
const IMUNE_STATUS: Record<StatusId, TipoId[]> = { queimado: ['brasa'], envenenado: ['veneno', 'ferro'], paralisado: ['trovao'], congelado: ['geada'], dormindo: [], encantado: ['encanto'] };
const MSG_STATUS: Record<StatusId, string> = { queimado: 'ficou queimando!', envenenado: 'foi envenenado!', paralisado: 'ficou paralisado! Talvez não consiga se mexer!', dormindo: 'pegou no sono!', congelado: 'virou um bloco de gelo!', encantado: 'ficou encantado!' };
const MSG_CURA_STATUS: Record<StatusId, string> = { queimado: 'não está mais queimando.', envenenado: 'ficou livre do veneno.', paralisado: 'voltou a se mexer.', dormindo: 'acordou!', congelado: 'descongelou!', encantado: 'saiu do encantamento.' };
const MSG_CLIMA_INICIO: Record<ClimaId, string> = { limpo: 'O tempo abriu.', sol: 'O sol ficou forte!', chuva: 'Começou a chover!', garoa: 'Uma garoa gelada começou a cair!', nevoa: 'Uma névoa espessa cobriu o campo!', poeira: 'A poeira subiu!' };
const MSG_CLIMA_FIM: Record<ClimaId, string> = { limpo: '', sol: 'O sol forte passou.', chuva: 'A chuva parou.', garoa: 'A garoa gelada parou.', nevoa: 'A névoa se desfez.', poeira: 'A poeira baixou.' };
/** multiplicador de estágio para atributos (−6…+6) */
export const multEstagio = (n: number) => (n >= 0 ? (2 + n) / 2 : 2 / (2 - n));
/** multiplicador de estágio para precisão/evasão */
export const multPrecisao = (n: number) => (n >= 0 ? (3 + n) / 3 : 3 / (3 - n));
const limitar = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const novoVol = (): Volatil => ({ est: { atq: 0, def: 0, atqEsp: 0, defEsp: 0, vel: 0, prec: 0, eva: 0 }, confuso: 0, preso: 0, atordoado: false, semente: null, protegido: false, protUsos: 0, carga: null, some: false, recarga: false, foco: 0, danoTurno: 0, turnos: 0 });

/* ============================== fórmulas puras ============================== */
/** Dano base do contrato: floor(floor(floor(2·Nv/5 + 2)·Poder·A/D)/50) + 2 */
export function danoBase(nivel: number, poder: number, a: number, d: number): number { return Math.floor(Math.floor((Math.floor((2 * nivel) / 5 + 2) * poder * a) / Math.max(1, d)) / 50) + 2; }
/** multiplicador do clima sobre o tipo do golpe */
export function multClima(clima: ClimaId, tipo: TipoId): number {
  if (clima === 'sol') return tipo === 'brasa' ? 1.5 : tipo === 'rio' ? 0.5 : 1;
  if (clima === 'chuva') return tipo === 'rio' ? 1.5 : tipo === 'brasa' ? 0.5 : 1;
  return 1;
}
/** valor `a` da fórmula de captura (≥ 255 = captura garantida) */
export function valorCaptura(vidaMaxima: number, vida: number, taxa: number, bonusCuia: number, bonusStatus: number): number {
  return Math.max(1, Math.floor(((3 * vidaMaxima - 2 * vida) * taxa * bonusCuia * bonusStatus) / (3 * vidaMaxima)));
}
export const bonusStatusCaptura = (s: StatusId | null): number => (s === 'dormindo' || s === 'congelado' ? 2 : s ? 1.5 : 1);
/** bônus da cuia conforme o alvo e a situação */
export function bonusCuia(cuia: string, tipos: readonly TipoId[], periodo: Periodo | undefined, turno: number): number {
  const u = temItemDef(cuia) ? defItem(cuia).uso?.cuia : undefined;
  if (!u) return 1;
  if (u.contraTipos && tipos.some((t) => u.contraTipos!.includes(t))) return u.bonusTipos ?? u.bonus;
  if (u.noite && periodo === 'noite') return u.noite;
  if (u.primeiroTurno && turno <= 1) return u.primeiroTurno;
  return u.bonus;
}
/**
 * Arremesso de cuia pelo método clássico de 4 testes: cada teste passa com probabilidade (a/255)^(1/4),
 * de modo que a chance total é a/255. `balancos` = testes vencidos antes de escapar (máx. 3).
 */
export function tentarCaptura(a: number): { sucesso: boolean; balancos: number } {
  if (a >= 255) return { sucesso: true, balancos: 3 };
  const b = Math.floor(65536 * Math.pow(a / 255, 0.25));
  for (let k = 0; k < 4; k++) if (rng.int(0, 65535) >= b) return { sucesso: false, balancos: Math.min(3, k) };
  return { sucesso: true, balancos: 3 };
}
/** chance de fuga (0..1) pela Velocidade e pelo nº de tentativas já feitas */
export function chanceFuga(velJogador: number, velInimigo: number, tentativas: number): number {
  if (velJogador >= velInimigo) return 1;
  return limitar((Math.floor((velJogador * 128) / Math.max(1, velInimigo)) + 30 * tentativas) / 256, 0, 1);
}
/** eficácia do golpe contra os tipos (o Desespero não tem tipo: sempre ×1) */
export const eficaciaGolpe = (g: GolpeDef, tipos: readonly TipoId[]): number => (g.id === DESESPERO.id ? 1 : eficaciaContra(g.tipo, tipos));
const temEf = <K extends Efeito['t']>(g: GolpeDef, t: K) => g.efeitos.find((e) => e.t === t) as Extract<Efeito, { t: K }> | undefined;

/* ============================== a batalha ============================== */
export class Batalha {
  readonly cfg: ConfigBatalha;
  readonly lados: [LadoBatalha, LadoBatalha];
  readonly porLado: number;
  fase: FaseBatalha = 'inicio';
  turno = 0;
  clima: ClimaId;
  /** turnos restantes do clima vindo de golpe (0 = clima da zona, permanente) */
  climaTurnos = 0;
  readonly climaBase: ClimaId;
  resultado: ResultadoId | null = null;
  capturada: CriaturaInst | null = null;
  eventos: EventoBatalha[] = [];
  /** golpes que esperam decisão (criatura com 4 golpes) */
  golpesPendentes: { uid: string; golpe: string }[] = [];
  /** evoluções a aplicar depois da batalha */
  evolucoes: { uid: string; para: number }[] = [];
  tentativasFuga = 0;
  private marca = 0;
  private subiu = new Set<string>();
  /** uid do inimigo → uids do lado 0 que o enfrentaram */
  private participantes = new Map<string, Set<string>>();
  private ofertaPara: number | null = null;

  constructor(cfg: ConfigBatalha) {
    this.cfg = cfg;
    this.porLado = cfg.dupla ? 2 : 1;
    this.climaBase = this.clima = cfg.clima ?? 'limpo';
    const lado = (c: ConfigLado, i: number): LadoBatalha => ({ equipe: c.equipe, ativos: [], vol: [], itens: c.itens ?? {}, nome: c.nome ?? (i ? '' : 'Você'), barreira: { fisico: 0, especial: 0, status: 0 }, espinhos: false, ultimoGolpe: null, vistos: new Set(), revelados: new Map() });
    this.lados = [lado(cfg.lados[0], 0), lado(cfg.lados[1], 1)];
    if (!this.vivos(0).length || !this.vivos(1).length) throw new Error('batalha sem criaturas aptas em um dos lados');
  }

  /* ---------------------------- consultas ---------------------------- */
  get selvagem() { return this.cfg.tipo !== 'treinador'; }
  criatura(p: Pos): CriaturaInst | null { const i = this.lados[p.lado].ativos[p.pos]; const c = i === undefined || i < 0 ? null : this.lados[p.lado].equipe[i]; return c ?? null; }
  vol(p: Pos): Volatil { return this.lados[p.lado].vol[p.pos]; }
  /** em campo e de pé */
  ativo(p: Pos): boolean { const c = this.criatura(p); return !!c && c.vida > 0; }
  /** índices da equipe aptos (vida > 0, não ovo) */
  vivos(lado: 0 | 1): number[] { return this.lados[lado].equipe.map((c, i) => (c.vida > 0 && !c.ovo ? i : -1)).filter((i) => i >= 0); }
  /** índices aptos que não estão em campo */
  reservas(lado: 0 | 1): number[] { const l = this.lados[lado]; return this.vivos(lado).filter((i) => !l.ativos.includes(i)); }
  posicoes(lado: 0 | 1): Pos[] { return Array.from({ length: this.porLado }, (_, pos) => ({ lado, pos })); }
  ativosDe(lado: 0 | 1): Pos[] { return this.posicoes(lado).filter((p) => this.ativo(p)); }
  adversarios(p: Pos): Pos[] { return this.ativosDe((1 - p.lado) as 0 | 1); }
  tipos(p: Pos): TipoId[] { return especie(this.criatura(p)!.especie).tipos; }
  /** atributo em batalha, com estágios (e paralisia na Velocidade) */
  stat(p: Pos, s: Exclude<Stat, 'vida'>): number {
    const c = this.criatura(p)!; let v = atributos(c)[s] * multEstagio(this.vol(p).est[s]);
    if (s === 'vel' && c.status === 'paralisado') v /= 4;
    return Math.max(1, Math.floor(v));
  }
  nome(p: Pos): string { const c = this.criatura(p)!; return p.lado === 0 ? nomeDe(c) : `${nomeDe(c)} ${this.selvagem ? 'selvagem' : 'rival'}`; }
  resumo(c: CriaturaInst): ResumoCriatura {
    const e = especie(c.especie), a = atributos(c);
    return { uid: c.uid, especie: c.especie, nome: nomeDe(c), nivel: c.nivel, vida: c.vida, vidaMax: a.vida, status: c.status, sexo: c.sexo, exp: c.exp, expNivel: expParaNivel(e.crescimento, c.nivel), expProx: expParaNivel(e.crescimento, Math.min(NIVEL_MAX, c.nivel + 1)) };
  }
  /** a posição precisa escolher uma ação neste turno? (não, se estiver carregando ou descansando) */
  livre(p: Pos): boolean { const v = this.vol(p); return this.ativo(p) && !v.carga && !v.recarga; }
  /** decisões que o motor espera agora */
  pedidos(): Pedido[] {
    if (this.fase === 'acoes') return ([0, 1] as const).flatMap((l) => this.posicoes(l).filter((p) => this.livre(p)).map((p) => ({ ...p, tipo: 'acao' as const })));
    if (this.fase === 'substituir') return this.vagas().map((p) => ({ ...p, tipo: 'substituir' as const }));
    if (this.fase === 'oferta') return [{ lado: 0, pos: 0, tipo: 'oferta' }];
    return [];
  }
  /** slots de golpe utilizáveis (com PG). Vazio → use slot −1 (Desespero). */
  golpesValidos(p: Pos): number[] { return this.criatura(p)!.golpes.map((g, i) => (g.pg > 0 ? i : -1)).filter((i) => i >= 0); }
  podeTrocar(p: Pos): boolean { return this.ativo(p) && this.vol(p).preso <= 0 && this.reservas(p.lado).length > 0; }
  podeFugir(): boolean { return this.selvagem && !this.cfg.semFuga; }
  podeCapturar(): boolean { return this.cfg.tipo !== 'treinador' && !this.cfg.semCaptura && this.ativosDe(1).length === 1; }
  /** o item teria efeito neste alvo (índice na equipe)? */
  itemServe(lado: 0 | 1, id: string, alvo: number, slot?: number): boolean {
    if (!temItemDef(id)) return false;
    const u = defItem(id).uso, c = this.lados[lado].equipe[alvo];
    if (!u || !u.emBatalha || !c || c.ovo) return false;
    if (u.cuia) return lado === 0;
    if (u.reanima) return c.vida <= 0;
    if (c.vida <= 0) return false;
    if (u.cura && c.vida < atributos(c).vida) return true;
    if (u.curaStatus && ((c.status && (u.curaStatus === 'todos' || u.curaStatus.includes(c.status))) || (u.curaStatus === 'todos' && this.volDe(lado, alvo)?.confuso))) return true;
    if (u.pg) return u.pgTodos ? c.golpes.some((g) => g.pg < g.pgMax) : slot !== undefined ? !!c.golpes[slot] && c.golpes[slot].pg < c.golpes[slot].pgMax : c.golpes.some((g) => g.pg < g.pgMax);
    return false;
  }
  private volDe(lado: 0 | 1, indice: number): Volatil | null { const pos = this.lados[lado].ativos.indexOf(indice); return pos >= 0 ? this.lados[lado].vol[pos] : null; }
  private posDe(lado: 0 | 1, indice: number): Pos | null { const pos = this.lados[lado].ativos.indexOf(indice); return pos >= 0 ? { lado, pos } : null; }
  private vagas(): Pos[] {
    const r: Pos[] = [];
    for (const l of [0, 1] as const) { let livres = this.reservas(l).length; for (const p of this.posicoes(l)) if (!this.ativo(p) && livres > 0) { r.push(p); livres--; } }
    return r;
  }

  /* ---------------------------- fila de eventos ---------------------------- */
  private ev(e: EventoBatalha) { this.eventos.push(e); }
  private msg(texto: string) { this.eventos.push({ t: 'msg', texto }); }
  private novos(): EventoBatalha[] { const r = this.eventos.slice(this.marca); this.marca = this.eventos.length; return r; }

  /* ---------------------------- início ---------------------------- */
  iniciar(): EventoBatalha[] {
    if (this.fase !== 'inicio') throw new Error('a batalha já começou');
    for (const l of [1, 0] as const) {
      const v = this.vivos(l).slice(0, this.porLado);
      this.lados[l].ativos = Array.from({ length: this.porLado }, (_, i) => v[i] ?? -1);
      this.lados[l].vol = Array.from({ length: this.porLado }, novoVol);
    }
    const ini = this.posicoes(1).filter((p) => this.ativo(p));
    if (this.selvagem) this.msg(ini.length > 1 ? `${ini.map((p) => nomeDe(this.criatura(p)!)).join(' e ')} selvagens apareceram!` : `${this.cfg.tipo === 'lendario' ? 'O lendário' : 'Um'} ${nomeDe(this.criatura(ini[0])!)}${this.cfg.tipo === 'lendario' ? '' : ' selvagem'} apareceu!`);
    else this.msg(`${this.lados[1].nome || 'A treinadora rival'} quer batalhar!`);
    for (const l of [1, 0] as const) for (const p of this.posicoes(l)) if (this.ativo(p)) this.anunciarEntrada(p, true);
    if (this.clima !== 'limpo') { this.ev({ t: 'clima', clima: this.clima }); this.msg(MSG_CLIMA_INICIO[this.clima]); }
    this.fase = 'acoes';
    return this.novos();
  }
  private anunciarEntrada(p: Pos, inicial = false) {
    const l = this.lados[p.lado], c = this.criatura(p)!;
    l.vistos.add(l.ativos[p.pos]);
    this.ev({ t: 'entra', lado: p.lado, pos: p.pos, indice: l.ativos[p.pos], criatura: this.resumo(c), ...(inicial ? { inicial } : {}) });
    if (p.lado === 0) this.msg(`Vai, ${nomeDe(c)}!`);
    else if (!this.selvagem) this.msg(`${l.nome || 'A rival'} enviou ${nomeDe(c)}!`);
    // quem está em campo junto passa a contar para a experiência
    for (const q of this.ativosDe(1)) { const ini = this.criatura(q)!; let s = this.participantes.get(ini.uid); if (!s) this.participantes.set(ini.uid, (s = new Set())); for (const j of this.ativosDe(0)) s.add(this.criatura(j)!.uid); }
  }
  private entrar(p: Pos, indice: number) {
    const l = this.lados[p.lado];
    l.ativos[p.pos] = indice; l.vol[p.pos] = novoVol();
    this.anunciarEntrada(p);
    if (l.espinhos && !this.tipos(p).includes('vento')) {
      this.ev({ t: 'anim', anim: 'espinhos', lado: p.lado, pos: p.pos });
      this.msg(`${this.nome(p)} se feriu nos espinhos!`);
      this.ferir(p, Math.max(1, Math.floor(atributos(this.criatura(p)!).vida / 8)), 'espinhos');
      this.checarDesmaio(p);
    }
  }
  private sair(p: Pos) {
    const c = this.criatura(p); if (!c) return;
    this.ev({ t: 'sai', lado: p.lado, pos: p.pos, uid: c.uid });
    // quem prendia ou sugava a partir desta posição deixa de fazê-lo
    for (const l of [0, 1] as const) for (const q of this.posicoes(l)) { const v = this.lados[l].vol[q.pos]; if (v?.semente && v.semente.lado === p.lado && v.semente.pos === p.pos) v.semente = null; }
  }

  /* ---------------------------- turno ---------------------------- */
  executarTurno(acoes: AcaoDe[]): EventoBatalha[] {
    if (this.fase !== 'acoes') throw new Error('fase inválida para executarTurno: ' + this.fase);
    this.turno++;
    interface Item { p: Pos; acao: Acao; pri: number; vel: number; r: number; uid: string }
    const fila: Item[] = [];
    for (const l of [0, 1] as const) for (const p of this.posicoes(l)) {
      if (!this.ativo(p)) continue;
      const v = this.vol(p); v.danoTurno = 0; v.atordoado = false; v.protegido = false; v.turnos++;
      let acao: Acao | undefined = v.carga || v.recarga ? { tipo: 'golpe', slot: -2 } : acoes.find((a) => a.lado === p.lado && a.pos === p.pos)?.acao;
      if (!acao) throw new Error(`faltou a ação de ${p.lado}:${p.pos}`);
      acao = this.normalizar(p, acao);
      const g = acao.tipo === 'golpe' ? this.golpeDaAcao(p, acao) : null;
      const pri = acao.tipo === 'fuga' ? 9 : acao.tipo === 'troca' ? 8 : acao.tipo === 'item' ? 7 : (g?.prioridade ?? 0);
      fila.push({ p, acao, pri, vel: this.stat(p, 'vel'), r: rng.f(), uid: this.criatura(p)!.uid });
    }
    fila.sort((a, b) => b.pri - a.pri || b.vel - a.vel || b.r - a.r);
    let fugaTentada = false;
    for (const it of fila) {
      if (this.resultado) break;
      const c = this.criatura(it.p);
      if (!c || c.uid !== it.uid || c.vida <= 0) continue; // desmaiou ou foi trocada antes de agir
      switch (it.acao.tipo) {
        case 'fuga': if (!fugaTentada) { fugaTentada = true; this.tentarFuga(it.p); } break;
        case 'troca': this.trocar(it.p, it.acao.para); break;
        case 'item': this.usarItem(it.p, it.acao); break;
        case 'golpe': this.agir(it.p, it.acao); break;
      }
      this.checarFim();
    }
    if (!this.resultado) { this.fimDeTurno(); this.checarFim(); }
    if (!this.resultado) this.fase = this.vagas().length ? 'substituir' : 'acoes';
    return this.novos();
  }
  /** corrige ações impossíveis (sem PG, troca inválida) para algo válido, sem lançar erro */
  private normalizar(p: Pos, a: Acao): Acao {
    if (a.tipo === 'golpe' && a.slot !== -2) {
      const ok = this.golpesValidos(p);
      if (!ok.length) return { ...a, slot: -1 };
      if (!ok.includes(a.slot)) return { ...a, slot: ok[0] };
    }
    if (a.tipo === 'troca' && (!this.reservas(p.lado).includes(a.para))) return this.normalizar(p, { tipo: 'golpe', slot: this.golpesValidos(p)[0] ?? -1 });
    return a;
  }
  private golpeDaAcao(p: Pos, a: Extract<Acao, { tipo: 'golpe' }>): GolpeDef | null {
    const v = this.vol(p);
    if (v.recarga) return null;
    if (v.carga) return defGolpe(v.carga.golpe);
    return a.slot === -1 ? DESESPERO : defGolpe(this.criatura(p)!.golpes[a.slot].id);
  }

  /* ---------------------------- ações que não são golpes ---------------------------- */
  private tentarFuga(p: Pos) {
    if (p.lado === 1) { // selvagem que foge (errantes)
      if (!this.selvagem || this.vol(p).preso > 0) { this.msg(`${this.nome(p)} tentou fugir, mas não conseguiu!`); this.ev({ t: 'fuga', lado: 1, sucesso: false }); return; }
      this.ev({ t: 'fuga', lado: 1, sucesso: true }); this.msg(`${this.nome(p)} fugiu!`); this.terminar('fuga'); return;
    }
    if (!this.selvagem) { this.msg('Não dá para fugir de uma batalha contra treinador!'); this.ev({ t: 'fuga', lado: 0, sucesso: false }); return; }
    if (this.cfg.semFuga) { this.msg('Não dá para fugir desta batalha!'); this.ev({ t: 'fuga', lado: 0, sucesso: false }); return; }
    if (this.ativosDe(0).some((q) => this.vol(q).preso > 0)) { this.msg(`${this.nome(p)} está preso e não consegue fugir!`); this.ev({ t: 'fuga', lado: 0, sucesso: false }); return; }
    const velI = Math.max(...this.ativosDe(1).map((q) => this.stat(q, 'vel')));
    const ok = rng.f() < chanceFuga(this.stat(p, 'vel'), velI, this.tentativasFuga++);
    this.ev({ t: 'fuga', lado: 0, sucesso: ok });
    if (ok) { this.msg('Você escapou em segurança!'); this.terminar('fuga'); } else this.msg('Não deu para escapar!');
  }
  private trocar(p: Pos, para: number) {
    if (this.vol(p).preso > 0) { this.msg(`${this.nome(p)} está preso e não pode sair!`); return; }
    if (!this.reservas(p.lado).includes(para)) return;
    this.msg(p.lado === 0 ? `Volta, ${nomeDe(this.criatura(p)!)}!` : `${this.lados[1].nome || 'A rival'} chamou ${nomeDe(this.criatura(p)!)} de volta!`);
    this.sair(p); this.entrar(p, para);
  }
  private usarItem(p: Pos, a: Extract<Acao, { tipo: 'item' }>) {
    const l = this.lados[p.lado];
    if (!temItemDef(a.item) || (l.itens[a.item] ?? 0) <= 0) { this.msg('O item acabou!'); return; }
    const d = defItem(a.item), u: UsoItem = d.uso ?? {};
    if (u.cuia) { this.arremessarCuia(p, a.item); return; }
    const alvo = a.alvo ?? l.ativos[p.pos], c = l.equipe[alvo];
    if (!this.itemServe(p.lado, a.item, alvo, a.slot)) { this.msg(`${d.nome} não teria efeito.`); return; }
    this.gastar(p.lado, a.item);
    this.ev({ t: 'item', lado: p.lado, item: a.item, uid: c.uid });
    this.msg(p.lado === 0 ? `Você usou ${d.nome}!` : `${l.nome || 'A rival'} usou ${d.nome}!`);
    this.aplicarRemedio(p.lado, alvo, u, a.slot);
    if (p.lado === 0) mudarAmizade(c, 1);
  }
  private gastar(lado: 0 | 1, id: string) { const it = this.lados[lado].itens; if ((it[id] ?? 0) <= 1) delete it[id]; else it[id]--; }
  private aplicarRemedio(lado: 0 | 1, indice: number, u: UsoItem, slot?: number) {
    const c = this.lados[lado].equipe[indice], max = atributos(c).vida, q = this.posDe(lado, indice), pos = q?.pos ?? -1, n = nomeDe(c);
    if (u.reanima && c.vida <= 0) { c.vida = Math.max(1, Math.floor((max * u.reanima) / 100)); c.status = null; this.ev({ t: 'cura', lado, pos, uid: c.uid, de: 0, para: c.vida, max }); this.msg(`${n} se levantou!`); }
    if (u.cura && c.vida > 0 && c.vida < max) { const de = c.vida; c.vida = u.cura === 'total' ? max : Math.min(max, c.vida + u.cura); this.ev({ t: 'cura', lado, pos, uid: c.uid, de, para: c.vida, max }); this.msg(`${n} recuperou ${c.vida - de} de vida.`); }
    if (u.curaStatus) {
      if (c.status && (u.curaStatus === 'todos' || u.curaStatus.includes(c.status))) { const s = c.status; c.status = null; delete c.sonoTurnos; this.ev({ t: 'status', lado, pos, uid: c.uid, status: null }); this.msg(`${n} ${MSG_CURA_STATUS[s]}`); }
      if (u.curaStatus === 'todos' && q && this.vol(q).confuso) { this.vol(q).confuso = 0; this.ev({ t: 'volatil', ...q, v: 'confuso', ativo: false }); this.msg(`${n} não está mais confuso.`); }
    }
    if (u.pg) {
      const alvos = u.pgTodos ? c.golpes : [c.golpes[slot ?? c.golpes.findIndex((g) => g.pg < g.pgMax)]].filter(Boolean);
      for (const g of alvos) g.pg = Math.min(g.pgMax, g.pg + u.pg);
      this.msg(`${n} recuperou PG.`);
    }
  }
  private arremessarCuia(p: Pos, cuia: string) {
    const nomeCuia = defItem(cuia).nome;
    if (p.lado !== 0) return;
    if (this.cfg.tipo === 'treinador') { this.msg('A rival rebateu a cuia! Não se desfaz a parceria dos outros.'); return; }
    if (this.cfg.semCaptura) { this.msg('A cuia não funciona aqui!'); return; }
    const alvos = this.ativosDe(1);
    if (alvos.length !== 1) { this.msg('São duas criaturas! Não dá para mirar a cuia.'); return; }
    const q = alvos[0], c = this.criatura(q)!, e = especie(c.especie);
    this.gastar(0, cuia);
    this.msg(`Você arremessou a ${nomeCuia}!`);
    if (this.vol(q).some) { this.ev({ t: 'captura', cuia, ...q, balancos: 0, sucesso: false }); this.msg('A cuia não alcançou a criatura!'); return; }
    const garantida = !!defItem(cuia).uso?.cuia?.garantida;
    const art = defItem(cuia).uso?.cuia?.artesanal;
    const bonus = art ? bonusArtesanal(art, { alvo: c, minha: this.criatura({ lado: 0, pos: 0 }), pescada: this.cfg.pescada }) : bonusCuia(cuia, e.tipos, this.cfg.periodo, this.turno);
    const a = garantida ? 255 : valorCaptura(atributos(c).vida, c.vida, e.taxaCaptura, bonus, bonusStatusCaptura(c.status));
    const r = tentarCaptura(a);
    this.ev({ t: 'captura', cuia, ...q, balancos: r.balancos, sucesso: r.sucesso });
    if (!r.sucesso) { this.msg(['Ah, não! A criatura escapou!', 'Puxa! Parecia que ia dar certo!', 'Quase! Faltou tão pouco!', 'Aaah! Foi por um triz!'][r.balancos]); return; }
    c.cuia = cuia; if (cuia === 'cuia-mel') c.amizade = Math.max(c.amizade, 200);
    if (art === 'amiga') c.amizade = Math.max(c.amizade, AMIZADE_CUIA_AMIGA);
    this.capturada = c;
    this.msg(`Parceria firmada! ${nomeDe(c)} agora anda com você.`);
    this.terminar('captura');
  }

  /* ---------------------------- golpes ---------------------------- */
  private agir(p: Pos, a: Extract<Acao, { tipo: 'golpe' }>) {
    const c = this.criatura(p)!, v = this.vol(p), n = this.nome(p);
    const cancelar = () => { if (v.carga) { v.carga = null; if (v.some) { v.some = false; this.ev({ t: 'carga', ...p, golpe: '', some: false, solta: true }); } } };
    if (v.recarga) { v.recarga = false; this.msg(`${n} precisa descansar!`); return; }
    if (c.status === 'dormindo') {
      c.sonoTurnos = (c.sonoTurnos ?? 1) - 1;
      if (c.sonoTurnos > 0) { this.ev({ t: 'anim', anim: 'status-dormindo', ...p }); this.msg(`${n} está dormindo.`); cancelar(); return; }
      this.curarStatus(p);
    }
    if (c.status === 'congelado') {
      if (!rng.chance(0.2)) { this.ev({ t: 'anim', anim: 'status-congelado', ...p }); this.msg(`${n} está congelado!`); cancelar(); return; }
      this.curarStatus(p);
    }
    if (v.atordoado) { this.msg(`${n} ficou atordoado e não agiu!`); cancelar(); return; }
    if (v.confuso > 0) {
      v.confuso--;
      if (v.confuso <= 0) { this.ev({ t: 'volatil', ...p, v: 'confuso', ativo: false }); this.msg(`${n} não está mais confuso.`); }
      else {
        this.msg(`${n} está confuso!`);
        if (rng.chance(1 / 3)) {
          this.ev({ t: 'anim', anim: 'confusao-auto', ...p }); this.msg('Atrapalhou-se e acabou se machucando!');
          const dano = Math.max(1, Math.floor(danoBase(c.nivel, 40, this.stat(p, 'atq'), this.stat(p, 'def')) * (rng.int(85, 100) / 100)));
          this.ferir(p, dano, 'confusao'); cancelar(); this.checarDesmaio(p); return;
        }
      }
    }
    if (c.status === 'paralisado' && rng.chance(0.25)) { this.ev({ t: 'anim', anim: 'status-paralisado', ...p }); this.msg(`${n} está paralisado e não consegue se mexer!`); cancelar(); return; }
    // obediência (spec 10A-13): criatura recebida em troca acima do limite das insígnias pode ignorar a ordem
    const ob = this.cfg.obediencia, pObedece = p.lado === 0 && ob && !v.carga && a.slot >= 0 ? chanceObedecer(c, ob.dono, ob.limite) : 1;
    if (pObedece < 1 && !rng.chance(pObedece)) {
      const outros = this.golpesValidos(p).filter((i) => i !== a.slot);
      if (outros.length && rng.chance(0.4)) { this.msg(`${n} não obedeceu e fez o que quis!`); a = { ...a, slot: rng.escolha(outros) }; }
      else { this.msg(rng.escolha([`${n} ignorou a ordem!`, `${n} está fazendo corpo mole…`, `${n} virou a cara e não obedeceu!`])); cancelar(); return; }
    }

    // qual golpe?
    let g: GolpeDef, alvoEscolhido = a.alvo, carregado = false;
    if (v.carga) { g = defGolpe(v.carga.golpe); alvoEscolhido = v.carga.alvo; v.carga = null; carregado = true; if (v.some) { v.some = false; this.ev({ t: 'carga', ...p, golpe: g.id, some: false, solta: true }); } }
    else {
      if (a.slot === -1) g = DESESPERO;
      else { const s = c.golpes[a.slot]; s.pg = Math.max(0, s.pg - 1); g = defGolpe(s.id); }
      if (a.slot === -1) this.msg(`${n} não tem mais PG!`);
      const imitado = this.lados[(1 - p.lado) as 0 | 1].ultimoGolpe;
      if (c.status === 'encantado' && imitado && a.slot !== -1 && rng.chance(0.5)) {
        this.ev({ t: 'anim', anim: 'status-encantado', ...p }); this.msg(`${n} está encantado e imita o adversário!`);
        g = defGolpe(imitado);
      }
    }
    if (!temEf(g, 'protecao')) v.protUsos = 0;
    this.msg(`${n} usou ${g.nome}!`);
    this.lados[p.lado].ultimoGolpe = g.id === DESESPERO.id ? this.lados[p.lado].ultimoGolpe : g.id;
    let rev = this.lados[p.lado].revelados.get(c.uid); if (!rev) this.lados[p.lado].revelados.set(c.uid, (rev = new Set())); if (g.id !== DESESPERO.id) rev.add(g.id);

    // golpe de dois turnos: prepara agora
    const carga = temEf(g, 'carga');
    if (carga && !carregado && carga.semCargaNoClima !== this.clima) {
      v.carga = { golpe: g.id, alvo: alvoEscolhido }; v.some = !!carga.some;
      this.ev({ t: 'carga', ...p, golpe: g.id, some: v.some }); this.msg(`${n} ${carga.msg}`);
      return;
    }
    this.executarGolpe(p, g, alvoEscolhido, a.trocaPara);
  }

  private alvosDe(p: Pos, g: GolpeDef, escolhido?: Pos): Pos[] {
    const adv = this.adversarios(p);
    switch (g.alvo) {
      case 'proprio': return [p];
      case 'campo': return [];
      case 'adversarios': return adv;
      case 'todos': return [...adv, ...this.ativosDe(p.lado).filter((q) => q.pos !== p.pos)];
      default: {
        if (escolhido && escolhido.lado !== p.lado && this.ativo(escolhido)) return [escolhido];
        return adv.length ? [adv.length > 1 && !escolhido ? adv[rng.int(0, adv.length - 1)] : adv[0]] : [];
      }
    }
  }
  private acerta(p: Pos, g: GolpeDef, q: Pos): boolean {
    if (g.precisao === 0) return true;
    if (g.efeitos.some((e) => e.t === 'certeiroNoClima' && e.c === this.clima)) return true;
    let chance = (g.precisao / 100) * multPrecisao(limitar(this.vol(p).est.prec - this.vol(q).est.eva, -6, 6));
    if (this.clima === 'nevoa' && !this.tipos(p).some((t) => t === 'assombro' || t === 'mente')) chance *= 0.8;
    return rng.f() < chance;
  }
  /** calcula o dano de um acerto (sem aplicar) */
  private calcular(p: Pos, g: GolpeDef, q: Pos, espalhado: boolean): { dano: number; critico: boolean; eficacia: number } {
    const c = this.criatura(p)!, alvo = this.criatura(q)!, ef = eficaciaGolpe(g, this.tipos(q));
    if (ef === 0) return { dano: 0, critico: false, eficacia: 0 };
    const fixo = temEf(g, 'fixo');
    if (fixo) return { dano: Math.max(1, fixo.v === 'nivel' ? c.nivel : fixo.v === 'metade' ? Math.floor(alvo.vida / 2) : fixo.v), critico: false, eficacia: 1 };
    const fis = g.cat === 'fisico';
    let poder = g.poder;
    for (const e of g.efeitos) if (e.t === 'poder') {
      const vm = atributos(c).vida, vma = atributos(alvo).vida;
      if ((e.modo === 'vidaBaixa' && c.vida * 2 < vm) || (e.modo === 'alvoFerido' && alvo.vida * 2 < vma) || (e.modo === 'alvoComStatus' && alvo.status) || (e.modo === 'revide' && this.vol(p).danoTurno > 0) || (e.modo === 'climaAtivo' && this.clima !== 'limpo')) poder *= 2;
    }
    const estagioCrit = this.vol(p).foco + (temEf(g, 'critico') ? 2 : 0);
    const critico = rng.f() < [1 / 16, 1 / 8, 1 / 4, 1 / 3, 1 / 2][Math.min(4, estagioCrit)];
    let m = critico ? 2 : 1;
    if (g.id !== DESESPERO.id && this.tipos(p).includes(g.tipo)) m *= 1.5;
    m *= ef;
    m *= rng.int(85, 100) / 100;
    if (fis && c.status === 'queimado') m *= 0.5;
    m *= multClima(this.clima, g.tipo);
    if (!critico && this.lados[q.lado].barreira[fis ? 'fisico' : 'especial'] > 0 && q.lado !== p.lado) m *= 0.5;
    if (espalhado) m *= 0.75;
    const base = danoBase(c.nivel, poder, this.stat(p, fis ? 'atq' : 'atqEsp'), this.stat(q, fis ? 'def' : 'defEsp'));
    return { dano: Math.max(1, Math.floor(base * m)), critico, eficacia: ef };
  }
  /** tira vida e emite o evento; devolve o dano efetivo */
  private ferir(q: Pos, dano: number, origem: Extract<EventoBatalha, { t: 'dano' }>['origem'], eficacia = 1, critico = false): number {
    const c = this.criatura(q)!, de = c.vida;
    c.vida = Math.max(0, c.vida - Math.max(0, Math.floor(dano)));
    if (origem === 'golpe') this.vol(q).danoTurno += de - c.vida;
    this.ev({ t: 'dano', ...q, uid: c.uid, de, para: c.vida, max: atributos(c).vida, eficacia, critico, origem });
    return de - c.vida;
  }
  private curar(q: Pos, qtd: number): number {
    const c = this.criatura(q)!, max = atributos(c).vida, de = c.vida;
    if (c.vida <= 0 || c.vida >= max || qtd <= 0) return 0;
    c.vida = Math.min(max, c.vida + Math.max(1, Math.floor(qtd)));
    this.ev({ t: 'cura', ...q, uid: c.uid, de, para: c.vida, max });
    return c.vida - de;
  }

  private executarGolpe(p: Pos, g: GolpeDef, escolhido: Pos | undefined, trocaPara: number | undefined) {
    const c = this.criatura(p)!, n = this.nome(p);
    // efeitos de campo e do próprio usuário não passam por teste de acerto
    if (g.alvo === 'campo' || g.alvo === 'proprio') {
      this.ev({ t: 'golpe', ...p, golpe: g.id, anim: g.anim, alvos: g.alvo === 'proprio' ? [p] : [] });
      let fez = false;
      for (const e of g.efeitos) fez = this.efeitoProprio(p, e, true) || fez;
      if (!fez) this.msg('Mas não aconteceu nada!');
      return;
    }
    const alvos = this.alvosDe(p, g, escolhido);
    if (!alvos.length) { this.msg('Mas não havia alvo!'); return; }
    const acertados: Pos[] = [];
    const exige = temEf(g, 'exige');
    for (const q of alvos) {
      const nq = this.nome(q);
      if (this.vol(q).some) { this.ev({ t: 'errou', ...p, alvo: q, motivo: 'fora' }); this.msg(`${nq} está fora de alcance!`); continue; }
      if (this.vol(q).protegido) { this.ev({ t: 'errou', ...p, alvo: q, motivo: 'protecao' }); this.msg(`${nq} se protegeu!`); continue; }
      if (exige && exige.cond === 'alvoDormindo' && this.criatura(q)!.status !== 'dormindo') { this.ev({ t: 'errou', ...p, alvo: q, motivo: 'falhou' }); this.msg('Mas não funcionou!'); continue; }
      if (g.cat !== 'status' && eficaciaGolpe(g, this.tipos(q)) === 0) { this.ev({ t: 'errou', ...p, alvo: q, motivo: 'imune' }); this.msg(`Não afeta ${nq}…`); continue; }
      if (!this.acerta(p, g, q)) { this.ev({ t: 'errou', ...p, alvo: q, motivo: 'precisao' }); this.msg(`O golpe de ${n} errou!`); continue; }
      acertados.push(q);
    }
    if (!acertados.length) {
      if (temEf(g, 'tombo')) { this.msg(`${n} caiu de mau jeito!`); this.ferir(p, Math.max(1, Math.floor(atributos(c).vida / 8)), 'tombo'); this.checarDesmaio(p); }
      return;
    }
    this.ev({ t: 'golpe', ...p, golpe: g.id, anim: g.anim, alvos: acertados });
    let danoTotal = 0;
    for (const q of acertados) {
      const alvo = this.criatura(q)!;
      if (g.cat !== 'status') {
        const multi = temEf(g, 'multi');
        const vezes = multi ? (multi.min === multi.max ? multi.min : limitar(rng.escolha([2, 2, 2, 3, 3, 3, 4, 5]), multi.min, multi.max)) : 1;
        let feitos = 0, ef = 1, crit = false;
        for (let k = 0; k < vezes && alvo.vida > 0 && c.vida > 0; k++) {
          const r = this.calcular(p, g, q, acertados.length > 1);
          danoTotal += this.ferir(q, r.dano, 'golpe', r.eficacia, r.critico); feitos++; ef = r.eficacia; crit = crit || r.critico;
        }
        if (crit) this.msg('Acertou em cheio!');
        if (!temEf(g, 'fixo')) { if (ef > 1) this.msg('É super eficaz!'); else if (ef < 1) this.msg('Não é muito eficaz…'); }
        if (multi) this.msg(`Acertou ${feitos} ${feitos === 1 ? 'vez' : 'vezes'}!`);
        if (g.tipo === 'brasa' && alvo.status === 'congelado' && alvo.vida > 0) this.curarStatus(q);
      }
      // efeitos sobre o alvo
      if (alvo.vida > 0) for (const e of g.efeitos) this.efeitoNoAlvo(p, q, e, g);
    }
    // efeitos sobre quem usou (uma vez, se acertou alguém)
    const dreno = temEf(g, 'dreno'), recuo = temEf(g, 'recuo');
    if (dreno && danoTotal > 0 && c.vida > 0 && this.curar(p, Math.max(1, Math.floor((danoTotal * dreno.pct) / 100)))) this.msg(`${n} recuperou energia!`);
    if (recuo && danoTotal > 0 && c.vida > 0) { this.msg(`${n} sofreu com o recuo!`); this.ferir(p, Math.max(1, Math.floor((danoTotal * recuo.pct) / 100)), 'recuo'); }
    if (c.vida > 0) for (const e of g.efeitos) this.efeitoProprio(p, e, false);
    for (const q of acertados) this.checarDesmaio(q);
    this.checarDesmaio(p);
    // bater e voltar
    if (temEf(g, 'bateVolta') && c.vida > 0 && !this.resultado && this.criatura(p) === c && this.vol(p).preso <= 0) {
      const res = this.reservas(p.lado);
      if (res.length) { this.msg(p.lado === 0 ? `${nomeDe(c)} voltou correndo para a cuia!` : `${n} voltou para a cuia!`); this.sair(p); this.entrar(p, trocaPara !== undefined && res.includes(trocaPara) ? trocaPara : res[0]); }
    }
  }

  /** efeitos que recaem sobre o alvo acertado */
  private efeitoNoAlvo(p: Pos, q: Pos, e: Efeito, g: GolpeDef) {
    const principal = g.cat === 'status';
    const passa = (chance?: number) => chance === undefined || chance >= 100 || rng.f() < chance / 100;
    switch (e.t) {
      case 'status': if (passa(e.chance)) this.aplicarStatus(q, e.s, p, principal); break;
      case 'volatil':
        if (e.eu || !passa(e.chance)) break;
        if (e.v === 'atordoado') { this.vol(q).atordoado = true; }
        else if (e.v === 'confuso') this.confundir(q, principal);
        else if (e.v === 'semente') {
          if (this.vol(q).semente || this.tipos(q).includes('mata')) { if (principal) this.msg('Mas não funcionou!'); break; }
          this.vol(q).semente = { ...p }; this.ev({ t: 'volatil', ...q, v: 'semente', ativo: true }); this.msg(`Uma parasita brotou em ${this.nome(q)}!`);
        }
        break;
      case 'estagio': if (!e.eu && passa(e.chance)) this.mudarEstagio(q, e.s, e.n, p); break;
      case 'armadilha':
        if (this.vol(q).preso <= 0) { this.vol(q).preso = rng.int(4, 5); this.ev({ t: 'volatil', ...q, v: 'preso', ativo: true }); this.msg(`${this.nome(q)} ficou preso!`); }
        break;
      case 'trocaForcada': this.forcarTroca(p, q); break;
    }
  }
  /** efeitos sobre o usuário ou o campo. `direto` = golpe de alvo próprio/campo (mostra falhas). Retorna se fez algo. */
  private efeitoProprio(p: Pos, e: Efeito, direto: boolean): boolean {
    const c = this.criatura(p)!, v = this.vol(p), n = this.nome(p), l = this.lados[p.lado], outro = this.lados[(1 - p.lado) as 0 | 1];
    const passa = (chance?: number) => chance === undefined || chance >= 100 || rng.f() < chance / 100;
    switch (e.t) {
      case 'estagio': if (e.eu && passa(e.chance)) { this.mudarEstagio(p, e.s, e.n, p); return true; } return false;
      case 'volatil': if (e.eu && e.v === 'confuso') { this.confundir(p, false); return true; } return false;
      case 'cura': if (this.curar(p, (atributos(c).vida * e.pct) / 100)) { this.msg(`${n} recuperou vida!`); return true; } if (direto) this.msg(`A vida de ${n} já está cheia!`); return direto;
      case 'descanso': {
        if (c.vida >= atributos(c).vida) { this.msg(`${n} não está com sono.`); return true; }
        c.status = 'dormindo'; c.sonoTurnos = 3; this.ev({ t: 'status', ...p, uid: c.uid, status: 'dormindo' });
        this.curar(p, atributos(c).vida); this.msg(`${n} dormiu e recuperou as forças!`); return true;
      }
      case 'curaStatus': {
        let fez = false;
        if (e.equipe) { for (const [i, m] of l.equipe.entries()) if (m.status && m.vida > 0) { m.status = null; delete m.sonoTurnos; const q = this.posDe(p.lado, i); this.ev({ t: 'status', lado: p.lado, pos: q?.pos ?? -1, uid: m.uid, status: null }); fez = true; } this.msg(fez ? 'A equipe ficou livre dos status!' : 'Ninguém precisava de cura.'); return true; }
        if (c.status) { this.curarStatus(p); fez = true; }
        return fez;
      }
      case 'foco': if (v.foco < 2) { v.foco++; this.msg(`${n} está pronto para acertar em cheio!`); return true; } return false;
      case 'protecao': {
        const ok = rng.f() < 1 / Math.pow(2, v.protUsos);
        v.protUsos++;
        if (ok) { v.protegido = true; this.msg(`${n} se preparou para se proteger!`); } else this.msg('Mas falhou!');
        return true;
      }
      case 'recarga': v.recarga = true; return true;
      case 'clima': {
        if (this.clima === e.c) { this.msg('O tempo já está assim.'); return true; }
        this.clima = e.c; this.climaTurnos = 5; this.ev({ t: 'clima', clima: e.c }); this.msg(MSG_CLIMA_INICIO[e.c]); return true;
      }
      case 'barreira': {
        if (l.barreira[e.b] > 0) { this.msg('A proteção já está de pé.'); return true; }
        l.barreira[e.b] = 5; this.ev({ t: 'campo', lado: p.lado, efeito: `barreira-${e.b}`, ativo: true });
        this.msg(e.b === 'fisico' ? 'Um muro invisível protege a equipe de golpes físicos!' : e.b === 'especial' ? 'Uma cortina de brilho protege a equipe de golpes especiais!' : 'Uma simpatia protege a equipe de status!');
        return true;
      }
      case 'espinhos': {
        if (outro.espinhos) { this.msg('O chão já está coberto de espinhos.'); return true; }
        outro.espinhos = true; this.ev({ t: 'campo', lado: (1 - p.lado) as 0 | 1, efeito: 'espinhos', ativo: true }); this.msg('Espinhos cobriram o chão do outro lado!'); return true;
      }
      case 'limpaEstagios': {
        for (const s of [0, 1] as const) for (const q of this.ativosDe(s)) { const est = this.vol(q).est; for (const k of Object.keys(est) as StatEst[]) est[k] = 0; }
        this.msg('Todas as mudanças de atributo foram desfeitas!'); return true;
      }
      default: return false;
    }
  }

  private aplicarStatus(q: Pos, s: StatusId, origem: Pos | null, avisar: boolean): boolean {
    const c = this.criatura(q)!, nq = this.nome(q);
    const falha = (t = 'Mas não funcionou!') => { if (avisar) this.msg(t); return false; };
    if (c.vida <= 0) return false;
    if (c.status) return falha(c.status === s ? `${nq} já está assim!` : undefined);
    if (this.tipos(q).some((t) => IMUNE_STATUS[s].includes(t))) return falha(`Não afeta ${nq}…`);
    if (s === 'congelado' && this.clima === 'sol') return falha();
    if (origem && origem.lado !== q.lado && this.lados[q.lado].barreira.status > 0) return falha(`A simpatia protegeu ${nq}!`);
    c.status = s;
    if (s === 'dormindo') c.sonoTurnos = rng.int(2, 4); else if (s === 'encantado') c.sonoTurnos = rng.int(2, 4); else delete c.sonoTurnos;
    this.ev({ t: 'status', ...q, uid: c.uid, status: s });
    this.msg(`${nq} ${MSG_STATUS[s]}`);
    this.comerFruto(q);
    return true;
  }
  private curarStatus(q: Pos) {
    const c = this.criatura(q)!, s = c.status; if (!s) return;
    c.status = null; delete c.sonoTurnos;
    this.ev({ t: 'status', ...q, uid: c.uid, status: null }); this.msg(`${this.nome(q)} ${MSG_CURA_STATUS[s]}`);
  }
  private confundir(q: Pos, avisar: boolean) {
    const v = this.vol(q);
    if (v.confuso > 0) { if (avisar) this.msg(`${this.nome(q)} já está confuso!`); return; }
    if (this.lados[q.lado].barreira.status > 0) { if (avisar) this.msg(`A simpatia protegeu ${this.nome(q)}!`); return; }
    v.confuso = rng.int(2, 5); this.ev({ t: 'volatil', ...q, v: 'confuso', ativo: true }); this.msg(`${this.nome(q)} ficou confuso!`);
  }
  private mudarEstagio(q: Pos, s: StatEst, n: number, _origem: Pos) {
    const v = this.vol(q), antes = v.est[s], depois = limitar(antes + n, -6, 6), nq = this.nome(q);
    const art = s === 'atq' || s === 'atqEsp' ? 'O' : 'A';
    if (depois === antes) { this.msg(`${art} ${NOME_STAT[s]} de ${nq} não pode ${n > 0 ? 'subir' : 'cair'} mais!`); return; }
    v.est[s] = depois;
    this.ev({ t: 'estagio', ...q, stat: s, delta: depois - antes, valor: depois });
    this.msg(`${art} ${NOME_STAT[s]} de ${nq} ${n > 0 ? 'subiu' : 'caiu'}${Math.abs(n) > 1 ? ' muito' : ''}!`);
  }
  private forcarTroca(p: Pos, q: Pos) {
    if (this.selvagem) {
      if (this.cfg.tipo === 'lendario' || this.cfg.semFuga || this.porLado > 1) { this.msg('Mas não funcionou!'); return; }
      this.msg(q.lado === 1 ? `${this.nome(q)} fugiu assustado!` : `${nomeDe(this.criatura(q)!)} foi espantado para longe!`);
      this.ev({ t: 'fuga', lado: q.lado, sucesso: true }); this.terminar('fuga'); return;
    }
    const res = this.reservas(q.lado);
    if (!res.length) { this.msg('Mas não funcionou!'); return; }
    this.msg(`${this.nome(q)} foi arrastado de volta para a cuia!`);
    this.sair(q); this.entrar(q, rng.escolha(res));
    void p;
  }

  /* ---------------------------- desmaio, experiência, fim ---------------------------- */
  private desmaiados = new Set<string>();
  private checarDesmaio(q: Pos) {
    const c = this.criatura(q);
    if (!c || c.vida > 0 || this.desmaiados.has(c.uid)) return;
    this.desmaiados.add(c.uid);
    c.status = null; delete c.sonoTurnos;
    const v = this.vol(q); v.carga = null; v.some = false; v.recarga = false;
    this.ev({ t: 'desmaio', ...q, uid: c.uid }); this.msg(`${this.nome(q)} desmaiou!`);
    for (const l of [0, 1] as const) for (const r of this.posicoes(l)) { const w = this.lados[l].vol[r.pos]; if (w?.semente && w.semente.lado === q.lado && w.semente.pos === q.pos) w.semente = null; }
    if (q.lado === 0) mudarAmizade(c, -1);
    else if (this.cfg.ganhaExp !== false) this.darExp(c);
  }
  private darExp(inimigo: CriaturaInst) {
    const quem = [...(this.participantes.get(inimigo.uid) ?? [])].map((uid) => this.lados[0].equipe.find((c) => c.uid === uid)!).filter((c) => c && c.vida > 0);
    if (!quem.length) return;
    const inteira = Math.max(1, Math.floor((expDerrota(inimigo, this.cfg.tipo === 'treinador') * (this.cfg.fatorExp ?? 1)) / quem.length));
    const esforco = especie(inimigo.especie).esforco;
    // Chocalho do Mutirão: a reserva de pé aprende olhando — metade da experiência de um participante, sem esforço e sem tirar nada de quem lutou
    // Só quem ficou para trás escuta: a reserva 2 níveis ou mais abaixo da mais forte da equipe (senão as três da frente
    // subiam em dobro e o jogador chegava aos líderes 6–8 acima do ás deles; docs/QA-TRECHO-2.md); 5 depois da Liga
    // (`limiarPartilha`, docs/EQUILIBRIO-MAPA-B.md).
    const topo = Math.max(...this.lados[0].equipe.filter((c) => !c.ovo).map((c) => c.nivel));
    const reserva = this.cfg.expPartilhada ? this.lados[0].equipe.filter((c) => c.vida > 0 && !c.ovo && !quem.includes(c) && c.nivel <= topo - (this.cfg.limiarPartilha ?? LIMIAR_CHOCALHO.antesDaLiga)) : [];
    for (const c of [...quem, ...reserva]) {
      // criatura recebida em troca aprende mais depressa: ×1,5 (spec 10A-12 e 24)
      const trocada = !!this.cfg.obediencia && deOutroTreinador(c, this.cfg.obediencia.dono);
      const olhando = reserva.includes(c), cada0 = olhando ? Math.max(1, Math.floor(inteira / 2)) : inteira, cada = trocada ? Math.floor(cada0 * 1.5) : cada0;
      if (olhando) { if (c.nivel >= NIVEL_MAX) continue; }
      else {
      // o esforço pode aumentar a vida máxima na hora: a vida atual sobe junto (senão a criatura ficava "19/20" de vida cheia)
      const vidaAntes = atributos(c).vida;
      ganharEsforco(c, esforco);
      const ganhoVida = atributos(c).vida - vidaAntes;
      if (ganhoVida > 0 && c.vida > 0) c.vida += ganhoVida;
      if (c.nivel >= NIVEL_MAX) continue;
      }
      const curva = especie(c.especie).crescimento, de = c.exp;
      c.exp = Math.min(c.exp + cada, expParaNivel(curva, NIVEL_MAX));
      this.ev({ t: 'exp', uid: c.uid, ganho: c.exp - de, de, para: c.exp });
      this.msg(`${nomeDe(c)} ganhou ${c.exp - de} pontos de experiência${trocada ? ' com bônus de troca' : ''}!`);
      while (c.nivel < NIVEL_MAX && c.exp >= expParaNivel(curva, c.nivel + 1)) {
        const s = subirNivel(c);
        this.subiu.add(c.uid);
        this.ev({ t: 'nivel', uid: c.uid, nivel: s.nivel, antes: s.antes, depois: s.depois });
        this.msg(`${nomeDe(c)} subiu para o nível ${s.nivel}!`);
        for (const id of s.golpes) this.oferecerGolpe(c, id);
      }
    }
  }
  private oferecerGolpe(c: CriaturaInst, id: string) {
    if (c.golpes.some((g) => g.id === id)) return;
    if (c.golpes.length < 4) { aprenderGolpe(c, id); this.ev({ t: 'novo-golpe', uid: c.uid, golpe: id }); this.msg(`${nomeDe(c)} aprendeu ${defGolpe(id).nome}!`); return; }
    if (this.cfg.autoAprender) {
      // troca o golpe de menor valor (poder × precisão; status vale 45) se o novo for melhor
      const valor = (gid: string) => { const g = defGolpe(gid); return g.cat === 'status' ? 45 : g.poder * (g.precisao || 100) / 100; };
      let pior = 0; for (let i = 1; i < 4; i++) if (valor(c.golpes[i].id) < valor(c.golpes[pior].id)) pior = i;
      if (valor(id) > valor(c.golpes[pior].id)) this.aprender(c.uid, id, pior);
      return;
    }
    this.golpesPendentes.push({ uid: c.uid, golpe: id });
    this.ev({ t: 'golpe-pendente', uid: c.uid, golpe: id });
  }
  /** resolve um `golpe-pendente`: `slot` 0–3 esquece aquele golpe; −1 desiste de aprender. Pode ser chamado em qualquer fase. */
  aprender(uid: string, id: string, slot: number): EventoBatalha[] {
    const c = this.lados[0].equipe.find((x) => x.uid === uid) ?? this.lados[1].equipe.find((x) => x.uid === uid);
    this.golpesPendentes = this.golpesPendentes.filter((g) => !(g.uid === uid && g.golpe === id));
    if (c) {
      if (slot < 0 || slot >= c.golpes.length) this.msg(`${nomeDe(c)} não aprendeu ${defGolpe(id).nome}.`);
      else { const velho = c.golpes[slot].id; if (aprenderGolpe(c, id, slot)) { this.ev({ t: 'novo-golpe', uid, golpe: id, esqueceu: velho }); this.msg(`${nomeDe(c)} esqueceu ${defGolpe(velho).nome} e aprendeu ${defGolpe(id).nome}!`); } }
    }
    return this.novos();
  }
  private checarFim() {
    if (this.resultado) return;
    if (!this.vivos(0).length) this.terminar('derrota');
    else if (!this.vivos(1).length) this.terminar('vitoria');
  }
  private terminar(r: ResultadoId) {
    if (this.resultado) return;
    this.resultado = r; this.fase = 'fim';
    if (r === 'derrota') this.msg(`${this.lados[0].nome} não tem mais criaturas em condições de lutar!`);
    if (r === 'vitoria' && !this.selvagem) this.msg(`${this.lados[1].nome || 'A rival'} foi vencida!`);
    if (r !== 'derrota') for (const c of this.lados[0].equipe) {
      if (!this.subiu.has(c.uid) || c.vida <= 0) continue;
      const evo = podeEvoluir(c, { periodo: this.cfg.periodo });
      if (evo) { this.evolucoes.push({ uid: c.uid, para: evo.para }); this.ev({ t: 'evolucao-pendente', uid: c.uid, para: evo.para }); }
    }
    this.ev({ t: 'fim', resultado: r });
  }

  /* ---------------------------- fim de turno ---------------------------- */
  private fimDeTurno() {
    const ordem = ([0, 1] as const).flatMap((l) => this.ativosDe(l)).sort((a, b) => this.stat(b, 'vel') - this.stat(a, 'vel') || a.lado - b.lado);
    for (const p of ordem) {
      const c = this.criatura(p)!; if (c.vida <= 0) continue;
      const max = atributos(c).vida, n = this.nome(p), v = this.vol(p), tipos = this.tipos(p);
      const parte = (d: number) => Math.max(1, Math.floor(max / d));
      if (this.clima === 'garoa' && !tipos.includes('geada') && !v.some) { this.ev({ t: 'anim', anim: 'clima-garoa', ...p }); this.msg(`A garoa gelada castiga ${n}!`); this.ferir(p, parte(16), 'clima'); }
      if (this.clima === 'poeira' && !tipos.some((t) => t === 'terra' || t === 'pedra' || t === 'ferro') && !v.some && c.vida > 0) { this.ev({ t: 'anim', anim: 'clima-poeira', ...p }); this.msg(`A poeira castiga ${n}!`); this.ferir(p, parte(16), 'clima'); }
      if (c.vida > 0 && c.status === 'queimado') { this.ev({ t: 'anim', anim: 'status-queimado', ...p }); this.msg(`${n} sofre com a queimadura!`); this.ferir(p, parte(16), 'status'); }
      if (c.vida > 0 && c.status === 'envenenado') { this.ev({ t: 'anim', anim: 'status-envenenado', ...p }); this.msg(`${n} sofre com o veneno!`); this.ferir(p, parte(8), 'status'); }
      if (c.vida > 0 && v.semente) {
        const dono = v.semente;
        this.ev({ t: 'anim', anim: 'semente', ...p }); this.msg(`A parasita suga a energia de ${n}!`);
        const tirou = this.ferir(p, parte(8), 'semente');
        if (this.ativo(dono)) this.curar(dono, tirou);
      }
      if (c.vida > 0 && v.preso > 0) {
        v.preso--;
        if (v.preso <= 0) { this.ev({ t: 'volatil', ...p, v: 'preso', ativo: false }); this.msg(`${n} se soltou!`); }
        else { this.ev({ t: 'anim', anim: 'armadilha', ...p }); this.msg(`${n} continua preso e se machuca!`); this.ferir(p, parte(16), 'armadilha'); }
      }
      if (c.vida > 0 && c.status === 'encantado') { c.sonoTurnos = (c.sonoTurnos ?? 1) - 1; if (c.sonoTurnos <= 0) this.curarStatus(p); }
      if (c.vida > 0) this.comerFruto(p);
      this.checarDesmaio(p);
    }
    for (const l of [0, 1] as const) for (const b of ['fisico', 'especial', 'status'] as const) {
      const bar = this.lados[l].barreira;
      if (bar[b] > 0 && --bar[b] === 0) { this.ev({ t: 'campo', lado: l, efeito: `barreira-${b}`, ativo: false }); this.msg(`${b === 'fisico' ? 'O muro invisível' : b === 'especial' ? 'A cortina de brilho' : 'A simpatia'} ${l === 0 ? 'da sua equipe' : 'da equipe rival'} se desfez.`); }
    }
    if (this.climaTurnos > 0 && --this.climaTurnos === 0) {
      this.msg(MSG_CLIMA_FIM[this.clima]); this.clima = this.climaBase; this.ev({ t: 'clima', clima: this.clima });
      if (this.clima !== 'limpo') this.msg(MSG_CLIMA_INICIO[this.clima]);
    }
  }
  /** fruto segurado: a criatura come sozinha quando ele serve */
  private comerFruto(p: Pos) {
    const c = this.criatura(p)!;
    if (!c.item || c.vida <= 0 || !temItemDef(c.item)) return;
    const d = defItem(c.item), u = d.uso;
    if (!u?.segurar) return;
    const max = atributos(c).vida;
    const serve = (u.cura && c.vida * 2 <= max) || (u.curaStatus && c.status && (u.curaStatus === 'todos' || u.curaStatus.includes(c.status))) || (u.pg && c.golpes.some((g) => g.pg === 0));
    if (!serve) return;
    delete c.item;
    this.ev({ t: 'item', lado: p.lado, item: d.id, uid: c.uid }); this.msg(`${this.nome(p)} comeu ${d.nome}!`);
    this.aplicarRemedio(p.lado, this.lados[p.lado].ativos[p.pos], u, u.pg ? c.golpes.findIndex((g) => g.pg === 0) : undefined);
  }

  /* ---------------------------- substituições ---------------------------- */
  substituir(escolhas: { lado: 0 | 1; pos: number; para: number }[]): EventoBatalha[] {
    if (this.fase !== 'substituir') throw new Error('fase inválida para substituir: ' + this.fase);
    const vagas = this.vagas();
    // oferta de troca "de graça": 1×1 contra treinador, só o rival precisa repor
    if (this.cfg.tipo === 'treinador' && this.porLado === 1 && this.cfg.trocaGratis !== false && this.ofertaPara === null && vagas.length === 1 && vagas[0].lado === 1 && this.reservas(0).length > 0) {
      const e = escolhas.find((x) => x.lado === 1);
      const para = e && this.reservas(1).includes(e.para) ? e.para : this.reservas(1)[0];
      this.ofertaPara = para; this.fase = 'oferta';
      this.msg(`${this.lados[1].nome || 'A rival'} vai enviar ${nomeDe(this.lados[1].equipe[para])}.`);
      this.ev({ t: 'oferta-troca', proxima: this.resumo(this.lados[1].equipe[para]) });
      return this.novos();
    }
    const usados = new Set<number>();
    for (const p of vagas) {
      const res = this.reservas(p.lado).filter((i) => !(p.lado === 0 ? usados.has(i) : usados.has(100 + i)));
      if (!res.length) continue;
      const e = escolhas.find((x) => x.lado === p.lado && x.pos === p.pos);
      const para = e && res.includes(e.para) ? e.para : res[0];
      usados.add(p.lado === 0 ? para : 100 + para);
      this.entrar(p, para);
    }
    this.checarFim();
    if (!this.resultado) this.fase = this.vagas().length ? 'substituir' : 'acoes';
    return this.novos();
  }
  /** resposta à oferta de troca: índice da reserva que entra, ou null para manter */
  responderOferta(para: number | null): EventoBatalha[] {
    if (this.fase !== 'oferta' || this.ofertaPara === null) throw new Error('não há oferta de troca');
    const p: Pos = { lado: 0, pos: 0 };
    if (para !== null && this.reservas(0).includes(para) && this.ativo(p)) { this.msg(`Volta, ${nomeDe(this.criatura(p)!)}!`); this.sair(p); this.entrar(p, para); }
    const rival = this.ofertaPara; this.ofertaPara = null;
    if (!this.resultado) {
      this.entrar({ lado: 1, pos: 0 }, rival);
      this.checarFim();
      if (!this.resultado) this.fase = this.vagas().length ? 'substituir' : 'acoes';
    }
    this.ofertaPara = null;
    return this.novos();
  }
}
