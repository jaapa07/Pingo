/**
 * REGRAS CLÁSSICAS (spec 10A) — eventos e comandos de roteiro de:
 *  - item 25/26: Ginásio de Treino de Porto Sereia (`A4-treino`): guia na porta (A4), recepção com a agenda e a revanche
 *    de cada líder no dia em que o jogador ligou para ele pelo Rádio Cipó (dados e fases em src/data/revancha.ts);
 *  - item 27: rival semanal (Tainá na Gruta do Eco às terças e quintas, depois da Liga; 1 batalha por dia);
 *  - item 31: Quiz do Rádio (Locutora Sabiá na Rádio Farol, A6; dados em src/data/quiz.ts) → Cartão do Rádio;
 *  - item 4: enxame do dia (a espécie mais rara do capim de uma rota passa a 40% dos encontros, a zona muda todo dia);
 *  - item 35: Torre de Desafios no Platô da Liga (1 batalha por dia, todos no nível 50, sem experiência, pontos por itens).
 *
 * Flags: `treino:<lider>` = dia corrido em que a revanche foi marcada pelo rádio · `revanche:<id>` = dia da última
 * revanche (a mesma do rádio) · `treino-hoje:<lider>` e `rival-semana-hoje` = NPC visível agora (recalculadas a cada
 * troca de zona) · `rival-semanal-dia` · `quiz-dia`, `quiz-acertos` · `torre-dia`, `torre-pontos`, `torre-vitorias`.
 * Como `comuns.ts`, este arquivo só importa o núcleo e o registro do mundo; o resto do mundo vem na hora (import dinâmico),
 * para continuar importável fora do navegador.
 */
import type { EventoDef, Comando, CriaturaInst } from '../../core/tipos';
import { jogo, setFlag, diaSemana, darItem } from '../../core/estado';
import { rng } from '../../core/rng';
import { bus } from '../../core/events';
import { MAPA_B_ABERTO } from '../../core/progresso';
import { registrarComando, registrarTreinador, ajustesDeEncontro } from '../../world/registro';
import {
  LIDERES_AGENDA, RIVAL_SEMANAL, NOME_DIA_LONGO, NOME_PERIODO, TREINO, buscaSpriteLider, agendaLider, diaCorrido, faseDoProgresso, revancheLiderLiberada,
  treinadorDaFase, rivalSemanalDef, inicialDaRival, enxameDoDia, aplicarEnxame, type Fase,
} from '../revancha';
import { QUIZ_FAUNA, QUIZ_RODADA, QUIZ_META, LOCUTORA } from '../quiz';
import { TORRE, PREMIOS_TORRE, adversarioDaTorre } from '../torre';
import { t, t as traduzir, tr } from '../../i18n';

const mundoDeps = () => import('../../world/deps');
const hoje = () => diaCorrido(jogo.save.relogio.deslocamentoMin);
export const faseAtual = (): Fase => faseDoProgresso(jogo.save.insignias.length, jogo.save.flags);
const flags = () => jogo.save.flags;
/** revanche deste líder já liberada (1–8 depois da Liga; 9–16 com as 16 insígnias) */
const liberada = (l: { insignia: number }) => revancheLiderLiberada(l.insignia, jogo.save.insignias.length, jogo.save.flags);
function limpar(k: string, v: boolean) { if (v) setFlag(k); else delete flags()[k]; }

/* ------------------------------ agenda: NPCs que aparecem hoje ------------------------------ */
let enxameHoje: ReturnType<typeof enxameDoDia> = null, enxameDia = -1;
/** recalcula quem aparece hoje (líderes no Ginásio de Treino, rival na gruta) e o enxame do dia */
export async function atualizarAgenda() {
  const s = jogo.save, d = hoje(), dia = diaSemana();
  for (const l of LIDERES_AGENDA) limpar('treino-hoje:' + l.id, liberada(l) && s.flags['treino:' + l.id] === d && s.flags['revanche:' + l.id] !== d);
  limpar('rival-semana-hoje', !!s.flags['liga-vencida'] && RIVAL_SEMANAL.dias.includes(dia) && s.flags['rival-semanal-dia'] !== d);
  if (enxameDia !== d) {
    try { const { listaZonas } = await import('../../world/zonas'); enxameHoje = enxameDoDia(listaZonas(), d, MAPA_B_ABERTO); enxameDia = d; } catch { enxameHoje = null; }
  }
}
if (typeof window !== 'undefined') {
  bus.on('zona', () => { void atualizarAgenda().then(async () => { const m = await import('../../world/index'); m.reavaliar(); }); });
  void import('../../world/deps').then((d) => { buscaSpriteLider.fn = (id) => d.treinador(id)?.sprite; }).catch(() => undefined);
}
ajustesDeEncontro.push((z, metodo, t) => (metodo === 'grama' && enxameHoje && enxameHoje.zona.id === z.id && enxameDia === hoje() ? aplicarEnxame(t, enxameHoje.e, enxameHoje.nv) : t));
/** o enxame anunciado hoje (para o Rádio Cipó) */
export const enxameAnunciado = () => (enxameDia === hoje() ? enxameHoje : null);

/* ------------------------------ Ginásio de Treino (itens 25/26) ------------------------------ */
const RECEPCAO = { nome: 'Recepcionista do Treino', retrato: 'npc-atendente-posto' };
const GUIA = { nome: 'Guia do Treino', retrato: 'npc-homem-2' };

registrarComando('agendaTreino', async () => {
  const d = await mundoDeps(), dia = diaSemana(), s = jogo.save;
  const ORDEM = ['manha', 'dia', 'noite'];
  const linha = (dd: number) => LIDERES_AGENDA.filter((l) => l.dia === dd && liberada(l) && d.treinador(l.id)).sort((a, b) => ORDEM.indexOf(a.periodo) - ORDEM.indexOf(b.periodo)).map((l) => `${t(d.treinador(l.id)!.nome)} (${t(NOME_PERIODO[l.periodo])})`).join(', ');
  const marcados = LIDERES_AGENDA.filter((l) => liberada(l) && s.flags['treino:' + l.id] === hoje() && s.flags['revanche:' + l.id] !== hoje()).map((l) => d.treinador(l.id)?.nome).filter(Boolean).map((n) => t(n!));
  await d.falar(tr('Bem-vindo ao {lugar}! Hoje é {dia}.', { lugar: TREINO.nome, dia: NOME_DIA_LONGO[dia] }) + '\f' + tr('Quem aceita revanche hoje: {lista}.', { lista: linha(dia) || 'ninguém' }) + '\f' + (marcados.length ? tr('Já confirmaram presença: {lista}. Estão no salão!', { lista: marcados.join(', ') }) : t('Ninguém marcou hoje. Ligue pelo Rádio Cipó no dia e no período do líder: ele vem para cá.')), RECEPCAO);
  if (!(await d.simNao('Quer ouvir a agenda da semana inteira?'))) return;
  // um dia por caixa: cabe nas duas linhas do diálogo
  await d.falar([1, 2, 3, 4, 5, 6, 0].map((dd) => `${t(NOME_DIA_LONGO[dd]).toUpperCase()}: ${linha(dd) || t('ninguém')}.`).join('\f'), RECEPCAO);
});
/** ['revPreparar', idLider] → `rev-ok` = pode lutar agora; registra o treinador `revanche:<id>` com a equipe da fase */
registrarComando('revPreparar', async ([idArg]) => {
  const id = String(idArg), d = await mundoDeps(), t = d.treinador(id), s = jogo.save;
  setFlag('rev-ok', false);
  if (!t) return;
  const quem = { nome: tr('{classe} {nome}', { classe: t.classe, nome: t.nome }), retrato: t.sprite };
  const ag = agendaLider(id);
  if (ag && !liberada(ag)) { await d.falar('Revanche comigo só depois que você vencer os dezesseis ginásios. Termine a jornada pelo Sertão!', quem); return; }
  if (s.flags['revanche:' + id] === hoje()) { await d.falar('Já tivemos a nossa revanche hoje. Ligue na próxima semana, no mesmo dia!', quem); return; }
  if (s.flags['treino:' + id] !== hoje()) { const a = agendaLider(id)!; await d.falar(tr('Só treino aqui nas {dia}s, {periodo}. Ligue antes pelo Rádio Cipó!', { dia: NOME_DIA_LONGO[a.dia], periodo: NOME_PERIODO[a.periodo] }), quem); return; }
  const def = treinadorDaFase(t, faseAtual(), (n) => d.especie(n));
  def.desafio = tr('{JOGADOR}! Treinei a semana inteira para este momento. Aqui não tem quebra-cabeça nem insígnia: só a equipe que eu tenho hoje.\f{desafio}', { desafio: t.desafio });
  registrarTreinador(def);
  s.flags['revanche:' + id] = hoje();
  setFlag('rev-ok', true);
});
/**
 * ['revLutar', idTreinador] → luta com um treinador registrado na hora (revanche, rival semanal); `rev-venceu` = resultado.
 * A derrota segue a regra do mapa (último Posto, metade das patacas), como em qualquer batalha de treinador.
 */
registrarComando('revLutar', async ([idArg]) => {
  const [d, { desafiar }] = await Promise.all([mundoDeps(), import('../../world/npcs')]), t = d.treinador(String(idArg));
  setFlag('rev-venceu', false);
  if (!t) return;
  setFlag('rev-venceu', await desafiar(t));
});
registrarComando('revFim', async ([idArg]) => {
  const id = String(idArg), d = await mundoDeps(), t = d.treinador(id); if (!t) return;
  setFlag('revanches-vencidas', Number(flags()['revanches-vencidas'] ?? 0) + 1);
  await d.falar(tr('{derrota}\fVocê está mais forte a cada semana. Me ligue de novo no meu dia!', { derrota: t.derrota }), { nome: tr('{classe} {nome}', { classe: t.classe, nome: t.nome }), retrato: t.sprite });
  limpar('treino-hoje:' + id, false);
});

/* ------------------------------ rival semanal (item 27) ------------------------------ */
const TAINA = () => ({ nome: String(flags()['rival'] ?? 'Tainá'), retrato: 'taina' });
registrarComando('rivalPreparar', async () => {
  const d = await mundoDeps(), s = jogo.save;
  setFlag('rev-ok', false);
  if (!s.flags['liga-vencida'] || !RIVAL_SEMANAL.dias.includes(diaSemana())) { await d.falar('Hoje não é dia de treino. Terça e quinta, sacou? Terça e quinta!', TAINA()); return; }
  if (s.flags['rival-semanal-dia'] === hoje()) { await d.falar('Uma por dia, combinado é combinado. Minha equipe precisa descansar… e eu preciso pensar numa estratégia nova.', TAINA()); return; }
  registrarTreinador(rivalSemanalDef(faseAtual(), inicialDaRival(s.flags)));
  s.flags['rival-semanal-dia'] = hoje();
  setFlag('rev-ok', true);
});
registrarComando('rivalFim', async () => {
  const d = await mundoDeps();
  setFlag('rival-semanal-vitorias', Number(flags()['rival-semanal-vitorias'] ?? 0) + 1);
  await d.falar(diaSemana() === 2 ? 'Tá, hoje foi seu. Quinta eu volto com outra formação!' : 'Hoje foi seu. Terça que vem a gruta ecoa outro nome!', TAINA());
  limpar('rival-semana-hoje', false);
});

/* ------------------------------ Quiz do Rádio (item 31) ------------------------------ */
registrarComando('quizRadio', async () => {
  const d = await mundoDeps(), s = jogo.save, tem = (s.mochila['cartao-radio'] ?? 0) > 0;
  if (s.flags['quiz-dia'] === hoje()) { await d.falar('O quiz de hoje já foi ao ar! Amanhã tem perguntas novas. Fique ligado na Rádio Cipó!', LOCUTORA); return; }
  await d.falar(tr('Alô, alô, ouvinte! Aqui é a {locutora}, direto da Rádio Farol para todo o Rádio Cipó.\fNo QUIZ DA FAUNA são {n} perguntas de Sim ou Não sobre os bichos do Brasil.', { locutora: LOCUTORA.nome, n: QUIZ_RODADA }) + ' ' + (tem ? t('Você já tem o Cartão do Rádio, mas jogar é sempre bom!') : tr('Acertando {meta} ou mais, você ganha o Cartão do Rádio!', { meta: QUIZ_META })), LOCUTORA);
  if (!(await d.simNao('Topa entrar no ar?'))) { await d.falar('Sem problema! O microfone fica aqui esperando.', LOCUTORA); return; }
  s.flags['quiz-dia'] = hoje();
  const livres = QUIZ_FAUNA.map((_, i) => i), sorteio: number[] = [];
  while (sorteio.length < QUIZ_RODADA && livres.length) sorteio.push(livres.splice(rng.int(0, livres.length - 1), 1)[0]);
  let acertos = 0;
  for (let k = 0; k < sorteio.length; k++) {
    const q = QUIZ_FAUNA[sorteio[k]];
    bus.emit('sfx', { id: 'radio' });
    const sim = await d.simNao(tr('Pergunta {n}: {pergunta}', { n: k + 1, pergunta: q.p }));
    const certo = sim === q.r;
    if (certo) acertos++;
    await d.falar(t(certo ? 'Resposta CERTA!' : 'Ihh, resposta errada…') + ' ' + t(q.r ? 'A resposta é SIM.' : 'A resposta é NÃO.') + '\f' + t(q.porque), LOCUTORA);
  }
  setFlag('quiz-acertos', acertos);
  if (acertos >= QUIZ_META) {
    if (!tem) {
      await d.falar(tr('{acertos} de {total}! Que ouvinte! Isto aqui é seu:', { acertos, total: QUIZ_RODADA }), LOCUTORA);
      darItem('cartao-radio'); bus.emit('sfx', { id: 'item-obtido' }); bus.emit('item-obtido', { id: 'cartao-radio', qtd: 1 });
      await d.falar('{JOGADOR} recebeu o Cartão do Rádio!\fCom ele, o Rádio Cipó libera a Cantiga das Lendas, as músicas dos lugares visitados e as dicas de captura do Bicho do Dia.');
    } else await d.falar(tr('{acertos} de {total}! Você sabe tudo de bicho. Volte amanhã!', { acertos, total: QUIZ_RODADA }), LOCUTORA);
  } else await d.falar(tr(tem ? '{acertos} de {total}. Faltou pouco! Amanhã tem perguntas novas.' : '{acertos} de {total}. Faltou pouco! Precisa de {meta} para o Cartão do Rádio. Amanhã tem perguntas novas.', { acertos, total: QUIZ_RODADA, meta: QUIZ_META }), LOCUTORA);
});

/* ------------------------------ Torre de Desafios (item 35) ------------------------------ */
const JUIZ = { nome: 'Juiz da Torre', retrato: 'npc-homem-4' };
registrarComando('torre', async () => {
  const d = await mundoDeps(), s = jogo.save, pontos = () => Number(s.flags['torre-pontos'] ?? 0);
  const op = await d.escolher(tr('TORRE DE DESAFIOS — você tem {n} ponto(s). O que vai ser?', { n: pontos() }), ['Desafio do dia', 'Trocar pontos', 'Regras', 'Sair']);
  if (op === 2) { await d.falar(tr('Uma batalha por dia. Todas as criaturas, as suas e as do desafiante, lutam no nível {nivel}.\fNinguém ganha experiência e nada de mochila: só estratégia. Vitória vale {pontosVitoria} pontos; a 7ª vitória seguida vale o dobro.\fOs pontos se trocam aqui por itens raros.', { nivel: TORRE.nivel, pontosVitoria: TORRE.pontosVitoria }), JUIZ); return; }
  if (op === 1) {
    for (;;) {
      const i = await d.escolher(tr('Pontos: {pontos}. Escolha um prêmio:', { pontos: pontos() }), [...PREMIOS_TORRE.map((p) => `${traduzir(d.nomeItem(p.item))} (${p.custo})`), 'Voltar']);
      if (i < 0 || i >= PREMIOS_TORRE.length) return;
      const p = PREMIOS_TORRE[i];
      if (pontos() < p.custo) { await d.falar('Pontos insuficientes. Volte depois de mais algumas vitórias.', JUIZ); continue; }
      setFlag('torre-pontos', pontos() - p.custo); darItem(p.item); bus.emit('sfx', { id: 'item-obtido' });
      await d.falar(tr('{JOGADOR} recebeu {item}!', { item: d.nomeItem(p.item) }));
    }
  }
  if (op !== 0) return;
  if (s.flags['torre-dia'] === hoje()) { await d.falar('O desafio de hoje já foi. A Torre abre de novo amanhã cedo.', JUIZ); return; }
  const vivos = s.equipe.filter((c) => !c.ovo);
  if (vivos.length < 3) { await d.falar('A Torre pede pelo menos três criaturas na equipe.', JUIZ); return; }
  const seq = Number(s.flags['torre-seguidas'] ?? 0), t = adversarioDaTorre(hoje(), seq, (n) => d.especie(n));
  await d.falar(tr('Desafio nº {seq} da sequência: {classe} {nome}. Tudo no nível {nivel}. Pronto?', { seq: seq + 1, classe: t.classe, nome: t.nome, nivel: TORRE.nivel }), JUIZ);
  if (!(await d.simNao('Começar o desafio?'))) return;
  s.flags['torre-dia'] = hoje();
  // a equipe luta com cópias no nível 50 (curadas); as originais ficam guardadas e voltam intactas
  const originais = s.equipe, mochila = s.mochila, copias: CriaturaInst[] = vivos.slice(0, 6).map((c) => nivelada(c, d));
  s.equipe = copias; s.mochila = {};
  let r: { resultado: string };
  try { r = await d.iniciarBatalha({ tipo: 'treinador', treinador: t, inimigos: t.equipe.map((m) => d.criarDeMembro(m, t.nome)), arena: 'planalto', musica: 'batalha-lider', semExp: true }); }
  finally { s.equipe = originais; s.mochila = mochila; }
  bus.emit('musica', 'pico');
  if (r.resultado === 'vitoria') {
    const ganho = TORRE.pontosVitoria * ((seq + 1) % 7 === 0 ? 2 : 1);
    setFlag('torre-pontos', pontos() + ganho); setFlag('torre-seguidas', seq + 1); setFlag('torre-vitorias', Number(s.flags['torre-vitorias'] ?? 0) + 1);
    await d.falar(tr('Vitória! +{ganho} pontos (total: {pontos}). Sequência: {seq}.', { ganho, pontos: pontos(), seq: seq + 1 }), JUIZ);
  } else { setFlag('torre-seguidas', 0); await d.falar('Derrota. A sequência volta ao começo, mas os pontos ficam. Até amanhã!', JUIZ); }
});
type Deps = Awaited<ReturnType<typeof mundoDeps>>;
/** cópia da criatura no nível da Torre: mesmos genes, esforço, golpes e personalidade; vida e PG cheios */
function nivelada(c: CriaturaInst, d: Deps): CriaturaInst {
  const { uid, especie, apelido, golpes, gen, esf, personalidade, sexo, amizade, cuia, treinadorOriginal } = c;
  return d.criarCriatura(especie, TORRE.nivel, { uid, apelido, golpes: golpes.map((g) => ({ ...g, pg: g.pgMax })), gen: { ...gen }, esf: { ...esf }, personalidade, sexo, amizade, cuia, treinadorOriginal });
}

/* ------------------------------ eventos ------------------------------ */
const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
export const EVENTOS_REGRAS: EventoDef[] = [
  {
    id: 'treino-guia',
    passos: [
      ['falar', GUIA, 'Campeão da Liga! Nos fundos do ginásio do porto funciona o Ginásio de Treino: lá os líderes de Pingorama aceitam revanche.\fCada líder treina num dia e num período da semana. Ligue pelo Rádio Cipó na hora certa e ele vem para cá.'],
      ['simnao', 'Entrar no Ginásio de Treino?', 'treino-entrar'],
      se('flag:treino-entrar', [['sfx', 'porta'], ['warp', TREINO.zona, 9, 15, 'n']]),
    ],
  },
  { id: 'treino-recepcao', passos: [['agendaTreino']] },
  ...LIDERES_AGENDA.map((l): EventoDef => ({ id: 'treino-' + l.id, passos: [['revPreparar', l.id], se('flag:rev-ok', [['revLutar', 'revanche:' + l.id], se('flag:rev-venceu', [['revFim', l.id]])])] })),
  { id: 'rival-semanal', passos: [['rivalPreparar'], se('flag:rev-ok', [['revLutar', 'rival-semanal'], se('flag:rev-venceu', [['rivalFim']])])] },
  // a porta do salão devolve ao lado do guia, em A4 (por gatilho: o salão não tem porta própria no mapa da cidade)
  { id: 'treino-saida', passos: [['sfx', 'porta'], ['warp', 'A4', 17, 18, 's']] },
  { id: 'quiz-radio', passos: [['quizRadio']] },
  { id: 'torre-desafios', passos: [['torre']] },
];
