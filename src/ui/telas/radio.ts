/**
 * RÁDIO CIPÓ — Contatos (telefone: conversa e revanche, uma por dia por contato; líderes só no pós-jogo),
 * Bicho do Dia (a criatura mais rara de cada local hoje, pelas tabelas de habitat), Hora da Música,
 * Notícias do Cartel (pelas flags da história), Recado do dia e o Mapa de Pindorama.
 * Os contatos são ids de treinador em `jogo.save.contatos`. Revanche do dia: `flags['revanche:<id>']` = dia.
 */
import type { TreinadorDef } from '../../core/tipos';
import { jogo, cond, periodo, diaSemana, flag } from '../../core/estado';
import { bus } from '../../core/events';
import { iniciarBatalha, criarDeMembro } from '../../battle/index';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { em } from '../fonte';
import { moldura, som } from '../kit';
import { Lista } from '../componentes/lista';
import { informar } from '../componentes/confirmacao';
import { abrirTela, falar, simNao } from '../dialogo';
import { faixaDica, placaTitulo, escolherEm, caixa, rotulo, nomeEsp, pix } from './comum';
import { local } from './mapa-dados';
import { treinador, zona, rarasDoDia, diaDoAno, musicasDisponiveis, dadosProntos, NOME_MEIO, hoje } from './dados';
import { lerCarta } from './pc-quarto';
import { caber } from './mochila';
import { NOTICIAS, FAIXAS_RADIO, RECADOS_SEMANA, FALAS_CONTATO } from '../../data/radio';
import { T } from '../../data/textos-ui';

const ANTENA = ['......k.....', '.....k......', '....k.......', '.kkkkkkkkkk.', 'kaaaaaaaaaak', 'kakkkkakkbak', 'kakwwkakkaak', 'kakkkkakkbak', 'kaaaaaaaaaak', '.kkkkkkkkkk.'];
const NOME_PER = { manha: 'manhã', dia: 'dia', tarde: 'tarde', noite: 'noite' };

export function criarRadio(): Tela {
  const s = jogo.save;
  const el = elTela('ui', 'tela-radio', 'fundo-roxo');
  placaTitulo(el, 'RÁDIO CIPÓ', 2, 1, 100);
  el.append(em(pix(ANTENA, { k: '#1a1423', a: '#c98f4e', w: '#8fd45a', b: '#e0483c' }), 8, 4));
  const painel = moldura('tinta', 164, 146, 154, 18); el.append(painel);
  const corpo = caixa('', 152, 136); painel.append(em(corpo, 6, 5));
  const ops = ['Contatos', 'Bicho do Dia', 'Hora da Música', 'Notícias', 'Recado do dia', 'Mapa', 'Desligar'];
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
    rotulo(corpo, ops[i].toUpperCase(), 0, 0, 'amarelo', { sombra: true });
    const txt = [
      `Ligue para treinadores que deixaram o número. Contatos: {c:amarelo}${contatos().length}{/c}`,
      `Onde andam as criaturas raras nesta ${NOME_PER[periodo()]}. O programa muda todo dia.`,
      tocando ? `Tocando agora: {c:verde}${FAIXAS_RADIO.find((f) => f.id === tocando)?.nome ?? tocando}{/c} ♪` : 'Escolha uma faixa. Ao desligar o rádio, volta a música do lugar.',
      `O que se sabe do Cartel Ferrugem. Última: {c:amarelo}${noticias()[0]?.titulo ?? '—'}{/c}`,
      `Hoje é ${hoje()}.\n\n${RECADOS_SEMANA[diaSemana()]}`,
      'O mapa de Pindorama: Costa do Sol e Sertão das Névoas.', 'Desliga o rádio.',
    ][i];
    rotulo(corpo, txt, 0, 14, 'creme', { largura: 150 });
  }
  async function ligar(t: TreinadorDef) {
    const quem = { nome: t.nome, retrato: t.sprite }, F = FALAS_CONTATO, k = (t.id.length + diaDoAno()) % 4;
    som('radio');
    await falar(`${F.atende[k].replace('{N}', t.nome)}\f${t.depois ?? F.conversa[(k + t.nome.length) % 4]}`, quem);
    if (t.insignia && !flag('conselho-vencido')) { await falar(F.lider, quem); return; }
    if (Number(s.flags['revanche:' + t.id] ?? -1) === diaDoAno()) { await falar(T.radio.revancheHoje, quem); return; }
    await falar(F.propoe, quem);
    if (!(await simNao('Aceitar a revanche?'))) return;
    if (!s.equipe.some((c) => !c.ovo && c.vida > 0)) { await informar(T.radio.semEquipe); return; }
    const bonus = 2 + Math.floor(s.insignias.length / 2) + (flag('conselho-vencido') ? 8 : 0);
    const forte: TreinadorDef = { ...t, id: t.id, insignia: undefined, flag: 'revanche-venceu:' + t.id, equipe: t.equipe.map((m) => ({ ...m, nv: Math.min(100, m.nv + bonus) })) };
    s.flags['revanche:' + t.id] = diaDoAno();
    const r = await iniciarBatalha({ tipo: 'treinador', treinador: forte, inimigos: forte.equipe.map((m) => criarDeMembro(m, t.nome)), arena: zona(s.jogador.zona)?.arena ?? 'campo' });
    const mz = zona(s.jogador.zona)?.musica; if (mz) bus.emit('musica', mz);
    if (r.resultado === 'vitoria') { s.jogador.dinheiro += forte.premio; await falar(`${F.venceu}\f{JOGADOR} recebeu ${forte.premio} patacas.`, quem); }
    else await falar(F.perdeu, quem);
  }
  async function verContatos() {
    let ind = 0;
    for (;;) {
      const cs = contatos(); if (!cs.length) { await informar(T.radio.semContatos); return; }
      ind = await escolherEm('CONTATOS', cs.map((t) => ({ rotulo: caber(t.nome, 96), valor: caber(t.classe, 66) })), { inicial: Math.min(ind, cs.length - 1), descricao: (k) => `${cs[k].classe} ${cs[k].nome}\n\n${cs[k].insignia ? 'Líder de ginásio. ' : ''}${Number(s.flags['revanche:' + cs[k].id] ?? -1) === diaDoAno() ? 'Já batalhou com você hoje.' : 'Topa uma revanche.'}\n\nA: ligar` });
      if (ind < 0) return;
      await ligar(cs[ind]);
    }
  }
  async function bichoDoDia() {
    await dadosProntos;
    const rs = rarasDoDia(periodo()).filter((r) => local(r.local));
    if (!rs.length) { await informar('Hoje o locutor não tem nenhuma pista. Tente em outro período do dia.'); return; }
    let ind = 0;
    for (;;) {
      const viu = (n: number) => s.diario.visto.includes(n);
      ind = await escolherEm('BICHO DO DIA', rs.map((r) => ({ rotulo: caber(local(r.local)!.nome, 150) })), { inicial: ind, descricao: (k) => `Ouvintes avisam: ${viu(rs[k].especie) ? nomeEsp(rs[k].especie) : 'uma criatura que você ainda não registrou'} foi vista em ${local(rs[k].local)!.nome} (${NOME_MEIO[rs[k].metodo]}).${viu(rs[k].especie) ? '\n\nA: abrir a ficha' : ''}` });
      if (ind < 0) return;
      if (viu(rs[ind].especie)) await abrirTela('diario', { especie: rs[ind].especie }); else som('ui-erro');
    }
  }
  async function musica() {
    const tem = await musicasDisponiveis();
    const fs = FAIXAS_RADIO.filter((f) => cond(f.se) && (!tem.length || tem.includes(f.id)));
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
      if (i === 0) { await dadosProntos; await verContatos(); } else if (i === 1) await bichoDoDia(); else if (i === 2) await musica(); else if (i === 3) await verNoticias();
      else if (i === 4) await lerCarta({ de: 'Rádio Cipó', assunto: `Recado de ${hoje()}`, texto: RECADOS_SEMANA[diaSemana()] });
      else if (i === 5) await abrirTela('mapa-mundi'); else { fechar(tela); return; }
    } finally { ocupado = false; if (viva) pintar(); }
  }
  const tela: Tela = {
    el,
    entrar() { som('radio'); pintar(); },
    sair() { viva = false; if (tocando) restaurar(); },
    atualizar(dt) {
      onda += dt; barras.forEach((b, k) => { const h = 2 + Math.floor((Math.sin(onda * (tocando ? 9 : 3) + k * 1.3) + 1) * (tocando ? 3 : 1)); b.style.height = h + 'px'; b.style.top = 14 - h + 'px'; });
      if (!ocupado) lista.atualizar(dt);
    },
  };
  return tela;
}

