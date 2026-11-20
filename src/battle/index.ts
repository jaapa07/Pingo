/**
 * BATALHA — interface com o resto do jogo (contrato de docs/BATALHA.md).
 *
 * PONTO DE INTEGRAÇÃO DA VIEW (src/battle/view.ts, escrita à parte):
 *   registrarTela('batalha', (args: ArgsTelaBatalha) => Tela)
 *     - a tela recebe `args.controle` (ControleBatalha) e conduz tudo por ele:
 *         controle.iniciar()                → eventos de abertura
 *         controle.pedidosJogador()         → o que o jogador precisa decidir agora ('acao' | 'substituir' | 'oferta')
 *         controle.agir({ [pos]: Acao })    → roda o turno (a IA do rival é resolvida aqui dentro) e devolve os eventos
 *         controle.substituir({ [pos]: indiceDaEquipe }) · controle.responderOferta(indice | null) · controle.aprender(uid, golpe, slot | −1)
 *       reproduz os `EventoBatalha` na ordem e, quando `controle.terminou`, chama `args.concluir()` (uma vez).
 *     - a view não decide nada e não altera o save; `iniciarBatalha` aplica prêmio, Diário, captura e evoluções.
 *   registrarTela('evolucao', (args: ArgsTelaEvolucao) => Tela)   → só a cinemática; chama args.concluir(cancelou).
 * Sem a tela 'batalha' registrada (ou sem DOM), `iniciarBatalha` roda em modo headless: um piloto automático joga pelo jogador.
 */
import type { ClimaId, CriaturaInst, TreinadorDef } from '../core/tipos';
import { jogo, marcarCapturado, marcarVisto, periodo, receberCriatura, darItem } from '../core/estado';
import { bus } from '../core/events';
import { telas, criarTela, temTela } from '../ui/telas';
import { Batalha, type Acao, type AcaoDe, type ConfigBatalha, type EventoBatalha, type Pedido, type ResultadoId } from './engine';
import { escolherAcaoIA, escolherSubstitutoIA, iaUsaItens, nivelEfetivo, type NivelIA, type OpcoesIA } from './ia';
import { amizadePor, curarCriatura, evoluir, nomeDe, registrarEspecies, totalEspecies } from './criatura';

export { criarCriatura, criarDeMembro, atributos, registrarEspecies, especie, podeEvoluir, evoluir, expParaNivel, nomeDe, mudarAmizade, amizadePor, aprenderGolpe, ganharExp, curarCriatura } from './criatura';
export { Batalha } from './engine';
export type { Acao, EventoBatalha, Pedido, Pos, ConfigBatalha, ResumoCriatura, FaseBatalha } from './engine';
export type { NivelIA } from './ia';

/* ------------------------------ espécies ------------------------------ */
// No navegador (Vite), registra ESPECIES de src/data/criaturas.ts assim que o arquivo existir. Em Node o glob não existe: os testes registram à mão.
try {
  const mods = import.meta.glob('../data/criaturas.ts', { eager: true }) as Record<string, { ESPECIES?: Parameters<typeof registrarEspecies>[0] }>;
  for (const m of Object.values(mods)) if (m.ESPECIES) registrarEspecies(m.ESPECIES);
} catch { /* fora do Vite */ }

/* ------------------------------ contrato ------------------------------ */
export interface PedidoBatalha {
  tipo: 'selvagem' | 'treinador' | 'lendario'; inimigos: CriaturaInst[]; treinador?: TreinadorDef; arena: string; clima?: ClimaId;
  dupla?: boolean; semFuga?: boolean; semCaptura?: boolean; tutorial?: boolean; musica?: string;
  /** criatura errante: tenta fugir no primeiro turno */
  errante?: boolean;
}
export interface ResultadoBatalha {
  resultado: 'vitoria' | 'derrota' | 'fuga' | 'captura'; capturada?: CriaturaInst;
  /** onde a capturada foi parar */
  destino?: 'equipe' | 'viveiro' | 'cheio';
  /** golpes que uma evolução ofereceu e não couberam (a tela de Resumo pode perguntar depois) */
  golpesPendentes?: { uid: string; golpe: string }[];
}
export interface ArgsTelaBatalha { controle: ControleBatalha; pedido: PedidoBatalha; concluir(): void }
export interface ArgsTelaEvolucao { criatura: CriaturaInst; de: number; para: number; concluir(cancelou: boolean): void }

/**
 * Conduz uma batalha do ponto de vista do jogador (lado 0): recebe só as decisões dele e resolve a IA do lado 1.
 * A IA escolhe antes de as ações do jogador serem lidas.
 */
export class ControleBatalha {
  readonly b: Batalha;
  constructor(readonly pedido: PedidoBatalha, cfg: ConfigBatalha, readonly nivelIA: NivelIA, readonly opcoesIA: OpcoesIA = {}, private premio = 0) { this.b = new Batalha(cfg); }
  get fase() { return this.b.fase; }
  get terminou() { return this.b.fase === 'fim'; }
  get resultado(): ResultadoId | null { return this.b.resultado; }
  iniciar(): EventoBatalha[] { return this.b.iniciar(); }
  /** decisões que cabem ao jogador agora (pode vir vazio na fase 'acoes' se as criaturas dele estão carregando: chame agir({})) */
  pedidosJogador(): Pedido[] { return this.b.pedidos().filter((p) => p.lado === 0); }
  /** ações do jogador por posição (0, ou 0 e 1 nas duplas). Aceita uma única `Acao` no 1×1. */
  agir(acoes: Record<number, Acao> | Acao): EventoBatalha[] {
    const rival: AcaoDe[] = this.b.pedidos().filter((p) => p.lado === 1).map((p) => ({ lado: 1, pos: p.pos, acao: escolherAcaoIA(this.b, p, this.nivelIA, this.opcoesIA) }));
    const mapa: Record<number, Acao> = 'tipo' in acoes ? { 0: acoes as Acao } : acoes;
    const meus: AcaoDe[] = this.pedidosJogador().map((p) => ({ lado: 0, pos: p.pos, acao: mapa[p.pos] ?? { tipo: 'golpe', slot: this.b.golpesValidos(p)[0] ?? -1 } }));
    return this.depois(this.b.executarTurno([...meus, ...rival]));
  }
  /** quem entra em cada posição vaga do jogador: { [pos]: índice na equipe } */
  substituir(escolhas: Record<number, number>): EventoBatalha[] {
    const usados: number[] = [];
    const todas = this.b.pedidos().map((p) => {
      if (p.lado === 0) return { lado: p.lado, pos: p.pos, para: escolhas[p.pos] ?? this.b.reservas(0)[0] };
      const para = escolherSubstitutoIA(this.b, 1, this.nivelIA, usados); usados.push(para); return { lado: p.lado, pos: p.pos, para };
    });
    return this.depois(this.b.substituir(todas));
  }
  responderOferta(para: number | null): EventoBatalha[] { return this.depois(this.b.responderOferta(para)); }
  aprender(uid: string, golpe: string, slot: number): EventoBatalha[] { return this.b.aprender(uid, golpe, slot); }
  /** resolve sozinho o que só depende do rival e acrescenta a mensagem do prêmio */
  private depois(evs: EventoBatalha[]): EventoBatalha[] {
    while (this.b.fase === 'substituir' && this.pedidosJogador().length === 0) evs = evs.concat(this.substituir({}));
    if (this.b.fase === 'fim' && this.b.resultado === 'vitoria' && this.premio > 0) { evs = evs.concat([{ t: 'msg', texto: `Você ganhou ${this.premio} patacas!` }]); this.premio = -this.premio; }
    return evs;
  }
  /** prêmio em patacas desta batalha (0 se não houver) */
  get patacas() { return Math.abs(this.premio); }
}

/** monta o controle de uma batalha a partir do pedido e do save atual */
export function prepararBatalha(p: PedidoBatalha, o: { autoAprender?: boolean } = {}): ControleBatalha {
  const s = jogo.save, dif = jogo.opcoes.dificuldade, t = p.treinador;
  const nivel: NivelIA = p.tipo === 'treinador' ? nivelEfetivo(t?.ia ?? 'treinador', dif) : p.tipo === 'lendario' ? nivelEfetivo('treinador', dif) : 'novato';
  const itens: Record<string, number> = {};
  // Aventureiro: quem tem itens definidos só os usa a partir do 8º ginásio (7 insígnias já conquistadas); antes disso o desafio é por estratégia
  const usaItens = p.tipo === 'treinador' && iaUsaItens(t?.ia ?? 'treinador', dif, { temItens: !!t?.itens?.length, insignias: s.insignias.length });
  if (usaItens) {
    for (const id of t?.itens ?? []) itens[id] = (itens[id] ?? 0) + 1;
    if (!Object.keys(itens).length && dif === 'veterano') { const nv = Math.max(...p.inimigos.map((c) => c.nivel)); itens[nv < 20 ? 'cha-cidreira' : nv < 45 ? 'garrafada' : 'elixir-andiroba'] = 1; }
  }
  const cfg: ConfigBatalha = {
    tipo: p.tipo,
    lados: [{ equipe: s.equipe, itens: s.mochila, nome: s.jogador.nome }, { equipe: p.inimigos, itens, nome: t ? `${t.classe} ${t.nome}` : '' }],
    clima: p.clima, dupla: p.dupla ?? t?.dupla, semFuga: p.semFuga, semCaptura: p.semCaptura, periodo: periodo(),
    trocaGratis: dif !== 'veterano', autoAprender: o.autoAprender, expPartilhada: (s.mochila['chocalho-mutirao'] ?? 0) > 0,
  };
  return new ControleBatalha(p, cfg, nivel, { usaItens, foge: p.errante }, p.tipo === 'treinador' ? (t?.premio ?? 0) : 0);
}

/* ------------------------------ headless ------------------------------ */
let forcarHeadless = false;
/** força o modo sem tela (testes) mesmo que a tela 'batalha' esteja registrada */
export function definirHeadless(v: boolean) { forcarHeadless = v; }
export type Piloto = (c: ControleBatalha) => void;
/** piloto padrão: joga pelo jogador com a IA de nível 'treinador', recusa ofertas de troca e nunca foge */
export const pilotoPadrao: Piloto = (c) => {
  const b = c.b; let guarda = 0;
  if (b.fase === 'inicio') c.iniciar();
  while (!c.terminou) {
    if (++guarda > 5000) throw new Error('batalha headless não terminou');
    if (b.fase === 'acoes') c.agir(Object.fromEntries(c.pedidosJogador().map((p) => [p.pos, escolherAcaoIA(b, p, 'treinador')])));
    else if (b.fase === 'substituir') { const usados: number[] = []; c.substituir(Object.fromEntries(c.pedidosJogador().map((p) => { const para = escolherSubstitutoIA(b, 0, 'treinador', usados); usados.push(para); return [p.pos, para]; }))); }
    else if (b.fase === 'oferta') c.responderOferta(null);
  }
};
let piloto: Piloto = pilotoPadrao;
/** troca o piloto do modo headless (ex.: um roteiro de teste que arremessa cuias) */
export function definirPiloto(p: Piloto | null) { piloto = p ?? pilotoPadrao; }
const semTela = () => forcarHeadless || typeof document === 'undefined' || !temTela('batalha') || !telas.raiz;

/* ------------------------------ iniciarBatalha ------------------------------ */
/** Empilha a tela 'batalha' e resolve ao terminar, já com experiência, evoluções, prêmio em dinheiro e Diário aplicados. */
export async function iniciarBatalha(p: PedidoBatalha): Promise<ResultadoBatalha> {
  if (!totalEspecies()) throw new Error('nenhuma espécie registrada (src/data/criaturas.ts ou registrarEspecies)');
  if (!jogo.save.equipe.some((c) => c.vida > 0 && !c.ovo)) return { resultado: 'derrota' };
  const headless = semTela();
  const controle = prepararBatalha(p, { autoAprender: headless });
  bus.emit('batalha-inicio', { pedido: p });
  if (p.musica ?? p.treinador?.musica) bus.emit('musica', p.musica ?? p.treinador?.musica);
  if (headless) piloto(controle);
  else {
    await new Promise<void>((ok) => {
      let feito = false;
      const tela = telas.empilhar(criarTela('batalha', { controle, pedido: p, concluir: () => { if (feito) return; feito = true; telas.desempilhar(tela); ok(); } } satisfies ArgsTelaBatalha));
    });
  }
  if (!controle.terminou) throw new Error('a tela de batalha concluiu antes do fim da batalha');
  return finalizar(controle, headless);
}

async function finalizar(controle: ControleBatalha, headless: boolean): Promise<ResultadoBatalha> {
  const b = controle.b, p = controle.pedido, s = jogo.save, resultado = b.resultado!;
  const r: ResultadoBatalha = { resultado };
  for (const i of b.lados[1].vistos) marcarVisto(p.inimigos[i].especie);
  if (resultado === 'vitoria' && p.tipo === 'treinador') {
    s.jogador.dinheiro = Math.min(999999, s.jogador.dinheiro + controle.patacas);
    if (p.treinador?.insignia !== undefined) for (const c of s.equipe) if (c.vida > 0 && !c.ovo) amizadePor(c, 'vitoria-lider');
  }
  if (resultado === 'captura' && b.capturada) {
    const c = b.capturada;
    c.treinadorOriginal = s.jogador.nome; c.localCaptura = s.jogador.zona; c.nivelCaptura = c.nivel;
    r.capturada = c; r.destino = receberCriatura(c);
  }
  // evoluções pendentes (nunca depois de derrota)
  const pendentes: { uid: string; golpe: string }[] = [...b.golpesPendentes];
  for (const ev of b.evolucoes) {
    const c = s.equipe.find((x) => x.uid === ev.uid); if (!c) continue;
    let cancelou = false;
    if (!headless && temTela('evolucao')) cancelou = await new Promise<boolean>((ok) => { let feito = false; const tela = telas.empilhar(criarTela('evolucao', { criatura: c, de: c.especie, para: ev.para, concluir: (x: boolean) => { if (feito) return; feito = true; telas.desempilhar(tela); ok(x); } } satisfies ArgsTelaEvolucao)); });
    if (cancelou) continue;
    const de = nomeDe(c);
    for (const g of evoluir(c, ev.para)) pendentes.push({ uid: c.uid, golpe: g });
    marcarCapturado(c.especie);
    bus.emit('evoluiu', { uid: c.uid, de, para: ev.para });
  }
  if (pendentes.length) r.golpesPendentes = pendentes;
  // único emissor de 'batalha-fim' do jogo (o mundo não repete o evento)
  bus.emit('batalha-fim', { tipo: p.tipo, resultado, pedido: p, capturada: r.capturada });
  return r;
}

/** Cura toda a equipe (vida, status e PG). Com `posto: true` no modo explorador, o Posto Guardião ainda dá um Chá de Erva-Cidreira. */
export function curarEquipe(o: { posto?: boolean } = {}): void {
  for (const c of jogo.save.equipe) curarCriatura(c);
  if (o.posto && jogo.opcoes.dificuldade === 'explorador') darItem('cha-cidreira', 1);
}
