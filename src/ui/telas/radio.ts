/**
 * RÁDIO CIPÓ — Contatos (telefone: conversa e revanche, uma por dia por contato; líderes só no pós-jogo),
 * Bicho do Dia (a criatura mais rara de cada local hoje, pelas tabelas de habitat), Hora da Música,
 * Notícias do Cartel (pelas flags da história), Recado do dia e o Mapa de Pingorama.
 * Os contatos são ids de treinador em `jogo.save.contatos`. Revanche do dia: `flags['revanche:<id>']` = dia.
 */
import type { TreinadorDef } from '../../core/tipos';
import { jogo, cond, periodo, diaSemana, flag } from '../../core/estado';
import { bus } from '../../core/events';
import { iniciarBatalha, criarDeMembro, especie } from '../../battle/index';
import { agendaDe, naAgenda, faseDoProgresso, treinadorDaFase, equipeDaFase, agendaLider, enxameDoDia, revancheLiderLiberada, quandoAbreRevanche, NOME_DIA_CURTO, NOME_DIA_LONGO, NOME_PERIODO, NOME_FASE, TREINO, RIVAL_SEMANAL, type Fase } from '../../data/revancha';
import { MAPA_B_ABERTO } from '../../core/progresso';
import { CANTIGAS_LENDAS, agendaDoDia } from '../../data/radio';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { em } from '../fonte';
import { moldura, som } from '../kit';
import { Lista } from '../componentes/lista';
import { informar } from '../componentes/confirmacao';
import { abrirTela, falar, simNao } from '../dialogo';
import { faixaDica, placaTitulo, escolherEm, caixa, rotulo, nomeEsp, pix } from './comum';
import { local } from './mapa-dados';
import { treinador, zona, todasZonas, rarasDoDia, diaDoAno, musicasDisponiveis, dadosProntos, NOME_MEIO, hoje, moduloMundo } from './dados';
import { lerCarta as lerCartaInteira } from './pc-quarto';
import { quebrar, texto as txtFonte } from '../fonte';
import { caber } from './mochila';
import { NOTICIAS, FAIXAS_RADIO, RECADOS_SEMANA, FALAS_CONTATO } from '../../data/radio';
import { T } from '../../data/textos-ui';
import { t as traduz, tr } from '../../i18n';

/**
 * o papel de `lerCarta` (pc-quarto.ts) tem espaço para poucas linhas: textos longos do rádio (agenda do dia, cantigas)
 * passavam da borda de baixo. Aqui o texto é quebrado na largura do papel e mostrado em páginas (A passa a página).
 */
async function lerCarta(c: { de: string; assunto: string; texto: string }) {
  const h1 = parseInt(txtFonte('A', { tamanho: 12 }).style.height, 10), entre = parseInt(txtFonte('A\nA', { tamanho: 12 }).style.height, 10) - h1;
  const cabe = Math.max(1, Math.floor((134 - 3 - 42 - h1) / Math.max(1, entre)) + 1);
  // traduz a carta inteira antes de quebrar: o catálogo tem o texto completo, não cada linha (docs/I18N.md)
  const linhas = traduz(c.texto).split('\n').flatMap((p) => (p ? quebrar(p, 236, 12) : ['']));
  const paginas: string[][] = [[]];
  for (const l of linhas) { const pg = paginas[paginas.length - 1]; if (pg.length >= cabe) { if (l) paginas.push([l]); continue; } if (l || pg.length) pg.push(l); }
  const ps = paginas.map((pg) => { while (pg.length && !pg[pg.length - 1]) pg.pop(); return pg.join('\n'); }).filter(Boolean);
  if (ps.length <= 1) { await lerCartaInteira(c); return; }
  for (let i = 0; i < ps.length; i++) await lerCartaInteira({ de: c.de, assunto: `${traduz(c.assunto)} (${i + 1}/${ps.length})`, texto: ps[i] });
}

const ANTENA = ['......k.....', '.....k......', '....k.......', '.kkkkkkkkkk.', 'kaaaaaaaaaak', 'kakkkkakkbak', 'kakwwkakkaak', 'kakkkkakkbak', 'kaaaaaaaaaak', '.kkkkkkkkkk.'];
const NOME_PER = { manha: 'manhã', dia: 'dia', tarde: 'tarde', noite: 'noite' };

export function criarRadio(): Tela {
  const s = jogo.save;
  const el = elTela('ui', 'tela-radio', 'fundo-roxo');
  placaTitulo(el, 'RÁDIO CIPÓ', 2, 1, 100);
  el.append(em(pix(ANTENA, { k: '#1a1423', a: '#c98f4e', w: '#8fd45a', b: '#e0483c' }), 8, 4));
  const painel = moldura('tinta', 164, 146, 154, 18); el.append(painel);
  const corpo = caixa('', 152, 136); painel.append(em(corpo, 6, 5));
  // agenda do dia (spec 10A item 39) abre o rádio; Revanches = tabela de quem luta em que dia (itens 25/26); Cantigas só com o Cartão do Rádio (item 31)
  const cartao = (s.mochila['cartao-radio'] ?? 0) > 0;
  const ops = ['Agenda do dia', 'Contatos', 'Revanches', 'Bicho do Dia', 'Hora da Música', 'Notícias', 'Recado do dia', ...(cartao ? ['Cantiga das Lendas'] : []), 'Mapa', 'Desligar'];
  const fase = (): Fase => faseDoProgresso(s.insignias.length, s.flags);
  const agendaHoje = () => agendaDoDia({ dia: diaSemana(), periodo: periodo(), liga: !!flag('liga-vencida'), contatos: contatos().filter((t) => podeHoje(t)).map((t) => tr('{classe} {nome}', { classe: t.classe, nome: t.nome })), enxame: enxameHoje(), cartao, mergulho: s.amuletos.includes('mergulho') });
  const enxameHoje = () => { const e = enxameDoDia(todasZonas(), diaDoAno(), MAPA_B_ABERTO); return e ? { local: e.zona.nome, especie: s.diario.visto.includes(e.e) ? nomeEsp(e.e) : '' } : null; };
  const ehRival = (t: TreinadorDef) => /^rival-/.test(t.id);
  /** pode lutar hoje: no dia e período da agenda, sem revanche hoje; líder só depois da Liga */
  const liberado = (t: TreinadorDef) => !t.insignia || revancheLiderLiberada(t.insignia, s.insignias.length, s.flags);
  const podeHoje = (t: TreinadorDef) => !ehRival(t) && liberado(t) && naAgenda(agendaDe(t), diaSemana(), periodo()) && Number(s.flags['revanche:' + t.id] ?? -1) !== diaDoAno();
  let ocupado = false, viva = true, tocando = '', onda = 0;
  const lista = new Lista({ itens: ops, x: 2, y: 18, largura: 150, tamanho: 12, visiveis: 7, aoMover: pintar, aoEscolher: (i) => void escolher(i), aoCancelar: () => fechar(tela) });
  el.append(lista.el);
  faixaDica(el)('A: escolher   B: desligar');
  const barras = Array.from({ length: 12 }, (_, i) => { const b = caixa('', 3, 2); b.style.background = '#8fd45a'; el.append(em(b, 108 + i * 4, 12)); return b; });
  const noticias = () => NOTICIAS.filter((n) => cond(n.se)).reverse();
  const contatos = () => s.contatos.map((id) => treinador(id)).filter((t): t is TreinadorDef => !!t);
  function pintar() {
    corpo.replaceChildren();
    const i = lista.indice;
    rotulo(corpo, traduz(ops[i]).toUpperCase(), 0, 0, 'amarelo', { sombra: true });
    const op = ops[i];
    const txt = op === 'Agenda do dia' ? tr('{resumo}\n\nA: ouvir tudo', { resumo: agendaHoje().resumo })
      : op === 'Revanches' ? tr('Quem aceita revanche em cada dia da semana. Hoje: {c:amarelo}{n}{/c} disponível(is).', { n: contatos().filter(podeHoje).length })
      : op === 'Cantiga das Lendas' ? 'Programa do Cartão do Rádio: as cantigas antigas sobre as criaturas lendárias de Pingorama.'
      : [
      tr('Ligue para treinadores que deixaram o número. Contatos: {c:amarelo}{n}{/c}', { n: contatos().length }),
      tr('Onde andam as criaturas raras nesta {periodo}. O programa muda todo dia.', { periodo: NOME_PER[periodo()] }),
      tocando ? tr('Tocando agora: {c:verde}{tocando}{/c} ♪', { tocando: FAIXAS_RADIO.find((f) => f.id === tocando)?.nome ?? tocando }) : 'Escolha uma faixa. Ao desligar o rádio, volta a música do lugar.',
      tr('O que se sabe do Cartel Ferrugem. Última: {c:amarelo}{titulo}{/c}', { titulo: noticias()[0]?.titulo ?? '—' }),
      tr('Hoje é {hoje}.\n\n{diaSemana}', { hoje: hoje(), diaSemana: RECADOS_SEMANA[diaSemana()] }),
      'O mapa de Pingorama: Costa do Sol e Sertão das Névoas.', 'Desliga o rádio.',
    ][['Contatos', 'Bicho do Dia', 'Hora da Música', 'Notícias', 'Recado do dia', 'Mapa', 'Desligar'].indexOf(op)];
    rotulo(corpo, txt, 0, 14, 'creme', { largura: 150 });
  }
  async function ligar(t: TreinadorDef) {
    const quem = { nome: t.nome, retrato: t.sprite }, F = FALAS_CONTATO, k = (t.id.length + diaDoAno()) % 4;
    som('radio');
    await falar(tr(F.atende[k], { N: t.nome }) + '\f' + traduz(t.depois ?? F.conversa[(k + t.nome.length) % 4]), quem);
    // rival: não luta pelo rádio; conta onde treina (item 27)
    if (ehRival(t)) { await falar(flag('liga-vencida') ? tr(F.rival, { L: RIVAL_SEMANAL.lugar }) : F.rivalAntes, quem); return; }
    if (t.insignia && !liberado(t)) { await falar(t.insignia <= 8 ? F.lider : F.liderSertao, quem); return; }
    const ag = agendaDe(t), quando = `${traduz(NOME_DIA_LONGO[ag.dia])}, ${traduz(NOME_PERIODO[ag.periodo])}`;
    if (Number(s.flags['revanche:' + t.id] ?? -1) === diaDoAno()) { await falar(T.radio.revancheHoje, quem); return; }
    if (!naAgenda(ag, diaSemana(), periodo())) { await falar(tr(F.foraDaAgenda, { Q: quando }), quem); return; }
    // líder: marca a revanche no Ginásio de Treino (item 25); a luta é lá, hoje
    if (t.insignia) {
      if (s.flags['treino:' + t.id] === diaDoAno()) { await falar(tr(F.treinoMarcado, { G: TREINO.nome }), quem); return; }
      await falar(tr(F.treino, { G: TREINO.nome, L: agendaLider(t.id)?.lugar ?? '' }), quem);
      s.flags['treino:' + t.id] = diaDoAno(); s.flags['treino-hoje:' + t.id] = true;
      return;
    }
    await falar(F.propoe, quem);
    if (!(await simNao('Aceitar a revanche?'))) return;
    if (!s.equipe.some((c) => !c.ovo && c.vida > 0)) { await informar(T.radio.semEquipe); return; }
    const forte: TreinadorDef = treinadorDaFase(t, fase(), especie);
    s.flags['revanche:' + t.id] = diaDoAno();
    const r = await iniciarBatalha({ tipo: 'treinador', treinador: forte, inimigos: forte.equipe.map((m) => criarDeMembro(m, t.nome)), arena: zona(s.jogador.zona)?.arena ?? 'campo' });
    const mz = zona(s.jogador.zona)?.musica; if (mz) bus.emit('musica', mz);
    if (r.resultado === 'vitoria') s.flags['revanche-venceu:' + t.id] = true;
    if (r.resultado === 'vitoria') await falar(tr('{venceu}\fO prêmio da revanche foi de {premio} patacas.', { venceu: F.venceu, premio: forte.premio }), quem);
    else {
      await falar(F.perdeu, quem);
      // sem criaturas de pé: derrota de verdade (último Posto, metade das patacas); o rádio e os menus fecham
      if (r.resultado === 'derrota') { const m = await moduloMundo(); const f = m?.derrotaNoCampo as (() => Promise<void>) | undefined; if (f) await f(); else for (const c of s.equipe) if (!c.ovo) c.vida = Math.max(1, c.vida); }
    }
  }
  async function verContatos() {
    let ind = 0;
    for (;;) {
      const cs = contatos(); if (!cs.length) { await informar(T.radio.semContatos); return; }
      ind = await escolherEm('CONTATOS', cs.map((t) => ({ rotulo: caber(t.nome, 96), valor: caber(t.classe, 66) })), { inicial: Math.min(ind, cs.length - 1), descricao: (k) => tr('{classe} {nome}\n\n{agenda}\n\nA: ligar', { classe: cs[k].classe, nome: cs[k].nome, agenda: descAgenda(cs[k]) }) });
      if (ind < 0) return;
      await ligar(cs[ind]);
    }
  }
  function descAgenda(t: TreinadorDef): string {
    if (ehRival(t)) return flag('liga-vencida') ? 'Treina na Gruta do Eco às terças e quintas.' : 'Sua rival. Ainda anda pela estrada.';
    const ag = agendaDe(t), q = `${traduz(NOME_DIA_LONGO[ag.dia])}, ${traduz(NOME_PERIODO[ag.periodo])}`;
    if (t.insignia && !liberado(t)) return tr('Líder de ginásio. Revanche {quando}: {agenda}.', { quando: quandoAbreRevanche(t.insignia), agenda: q });
    if (Number(s.flags['revanche:' + t.id] ?? -1) === diaDoAno()) return 'Já batalhou com você hoje.';
    return (t.insignia && !/l[ií]der/i.test(t.classe) ? traduz('Líder de ginásio.') + ' ' : '') + tr('Revanche: {agenda}.', { agenda: q }) + (podeHoje(t) ? ' {c:verde}' + traduz('Hoje!') + '{/c}' : '');
  }
  /** tabela da semana (itens 25/26): cada contato com dia, período, lugar e a equipe da fase atual */
  async function verRevanches() {
    // só o que está liberado (líderes 9–16 só com as 16 insígnias; docs/DECISOES-FINAIS.md)
    const cs = contatos().filter((t) => !ehRival(t) && liberado(t)).sort((a, b) => ((agendaDe(a).dia + 6) % 7) - ((agendaDe(b).dia + 6) % 7) || ['manha', 'dia', 'noite'].indexOf(agendaDe(a).periodo) - ['manha', 'dia', 'noite'].indexOf(agendaDe(b).periodo));
    if (!cs.length) { await informar(T.radio.semContatos); return; }
    const PER = { manha: 'manhã', dia: 'dia', noite: 'noite' } as const;
    let ind = 0;
    for (;;) {
      ind = await escolherEm('REVANCHES', cs.map((t) => ({ rotulo: caber(t.nome, 96), valor: `${traduz(NOME_DIA_CURTO[agendaDe(t).dia])} ${traduz(PER[agendaDe(t).periodo])}`, cor: podeHoje(t) ? 'verde' as const : undefined })), {
        inicial: ind,
        descricao: (k) => { const t = cs[k], eq = equipeDaFase(t, t.insignia ? Math.max(3, fase()) as Fase : fase(), especie); return [tr('{classe} {nome}', { classe: t.classe, nome: t.nome }), descAgenda(t), t.insignia ? tr('No {lugar}.', { lugar: TREINO.nome }) : traduz('Luta pelo rádio.'), tr('Fase: {fase}', { fase: NOME_FASE[t.insignia ? Math.max(3, fase()) as Fase : fase()] }), tr('Equipe: {n} criaturas, nível até {nivel}.', { n: eq.length, nivel: Math.max(...eq.map((m) => m.nv)) }), '', traduz('A: ligar')].join('\n'); },
      });
      if (ind < 0) return;
      await ligar(cs[ind]);
    }
  }
  function dicaCaptura(n: number): string {
    let tx = 255; try { tx = especie(n).taxaCaptura; } catch { /* espécie fora do pacote */ }
    const base = tx >= 150 ? 'Dica: fácil de pegar, a Cuia comum resolve' : tx >= 75 ? 'Dica: deixe a vida no amarelo e use Cuia Trançada' : 'Dica: arisca! Vida no vermelho, faça dormir e use Cuia de Ouro';
    return traduz(base) + (periodo() === 'noite' ? traduz('; à noite a Cuia Noturna ajuda.') : '.');
  }
  async function cantigas() {
    let ind = 0;
    for (;;) {
      ind = await escolherEm('CANTIGA DAS LENDAS', CANTIGAS_LENDAS.map((c) => ({ rotulo: caber(c.titulo, 150) })), { inicial: ind, descricao: (k) => caber(CANTIGAS_LENDAS[k].dica, 116 * 9) });
      if (ind < 0) return;
      await lerCarta({ de: 'Rádio Cipó', assunto: CANTIGAS_LENDAS[ind].titulo, texto: CANTIGAS_LENDAS[ind].versos });
    }
  }
  async function bichoDoDia() {
    await dadosProntos;
    const rs = rarasDoDia(periodo()).filter((r) => local(r.local));
    if (!rs.length) { await informar('Hoje o locutor não tem nenhuma pista. Tente em outro período do dia.'); return; }
    let ind = 0;
    for (;;) {
      const viu = (n: number) => s.diario.visto.includes(n);
      ind = await escolherEm('BICHO DO DIA', rs.map((r) => ({ rotulo: caber(local(r.local)!.nome, 150) })), { inicial: ind, descricao: (k) => tr('Ouvintes avisam: {nome} foi vista em {local} ({meio}).', { nome: viu(rs[k].especie) ? nomeEsp(rs[k].especie) : 'uma criatura que você ainda não registrou', local: local(rs[k].local)!.nome, meio: NOME_MEIO[rs[k].metodo] }) + (cartao ? '\n' + dicaCaptura(rs[k].especie) : '') + (viu(rs[k].especie) ? '\n\n' + traduz('A: abrir a ficha') : '') });
      if (ind < 0) return;
      if (viu(rs[ind].especie)) await abrirTela('diario', { especie: rs[ind].especie }); else som('ui-erro');
    }
  }
  async function musica() {
    const tem = await musicasDisponiveis();
    // com o Cartão do Rádio entram as músicas dos lugares já visitados (item 31)
    const visitadas = cartao ? todasZonas().filter((z) => z.tipo === 'cidade' && flag('visitou:' + z.id) && z.musica).map((z) => ({ id: z.musica, nome: z.nome })) : [];
    const fs = [...FAIXAS_RADIO.filter((f) => cond(f.se)), ...visitadas].filter((f, k, a) => a.findIndex((x) => x.id === f.id) === k && (!tem.length || tem.includes(f.id)));
    let ind = Math.max(0, fs.findIndex((f) => f.id === tocando));
    for (;;) {
      ind = await escolherEm('HORA DA MÚSICA', fs.map((f) => ({ rotulo: caber(f.nome, 140), valor: f.id === tocando ? '♪' : '' })), { inicial: ind, descricao: (k) => (fs[k].id === tocando ? 'Tocando agora.\n\nA: parar e voltar à música do lugar' : 'A: pedir esta música') });
      if (ind < 0) return;
      if (fs[ind].id === tocando) { tocando = ''; restaurar(); } else { tocando = fs[ind].id; bus.emit('musica', tocando); }
    }
  }
  function restaurar() { const m = zona(s.jogador.zona)?.musica; if (m) bus.emit('musica', m); }
  async function verNoticias() {
    let ind = 0;
    for (;;) {
      const ns = noticias();
      ind = await escolherEm('NOTÍCIAS', ns.map((n) => ({ rotulo: caber(n.titulo, 150) })), { inicial: ind, descricao: (k) => caber(ns[k].texto, 116 * 9) });
      if (ind < 0) return;
      await lerCarta({ de: 'Rádio Cipó', assunto: ns[ind].titulo, texto: ns[ind].texto });
    }
  }
  async function escolher(i: number) {
    if (ocupado) return; ocupado = true;
    try {
      const op = ops[i];
      if (op === 'Agenda do dia') { await dadosProntos; await lerCarta({ de: 'Rádio Cipó', assunto: tr('Agenda de {hoje}', { hoje: hoje() }), texto: agendaHoje().texto }); }
      else if (op === 'Contatos') { await dadosProntos; await verContatos(); } else if (op === 'Revanches') { await dadosProntos; await verRevanches(); }
      else if (op === 'Bicho do Dia') await bichoDoDia(); else if (op === 'Hora da Música') await musica(); else if (op === 'Notícias') await verNoticias();
      else if (op === 'Recado do dia') await lerCarta({ de: 'Rádio Cipó', assunto: tr('Recado de {hoje}', { hoje: hoje() }), texto: RECADOS_SEMANA[diaSemana()] });
      else if (op === 'Cantiga das Lendas') await cantigas();
      else if (op === 'Mapa') await abrirTela('mapa-mundi'); else { fechar(tela); return; }
    } finally { ocupado = false; if (viva) pintar(); }
  }
  const tela: Tela = {
    el,
    entrar() { som('radio'); pintar(); void dadosProntos.then(() => { if (viva && !ocupado) pintar(); }); },
    sair() { viva = false; if (tocando) restaurar(); },
    atualizar(dt) {
      onda += dt; barras.forEach((b, k) => { const h = 2 + Math.floor((Math.sin(onda * (tocando ? 9 : 3) + k * 1.3) + 1) * (tocando ? 3 : 1)); b.style.height = h + 'px'; b.style.top = 14 - h + 'px'; });
      if (!ocupado) lista.atualizar(dt);
    },
  };
  return tela;
}

