/**
 * PC DO QUARTO — guardar, retirar e descartar itens (`jogo.save.pcItens`), ler as Cartas (conforme a história) e
 * escolher a Decoração do Quarto por categoria (grava `jogo.save.decoracao[categoria]` e avisa o mundo por
 * `bus.emit('decoracao', { categoria, id })`).
 */
import { jogo, qtdItem, darItem, tirarItem, cond } from '../../core/estado';
import { input } from '../../core/input';
import { bus } from '../../core/events';
import { ITENS, type ItemInfo } from '../../data/itens';
import { telas, type Tela } from '../telas';
import { elTela, fechar, retirar } from '../base';
import { texto, em } from '../fonte';
import { moldura, som } from '../kit';
import { Lista } from '../componentes/lista';
import { informar, confirmar } from '../componentes/confirmacao';
import { substituir } from '../dialogo';
import { faixaDica, placaTitulo, escolherEm, pix, caixa, rotulo } from './comum';
import { pedirQuantidade } from './quantidade';
import { caber } from './mochila';
import { CATEGORIAS, pecasDe, temPeca, decoracaoAtual, type CategoriaDeco } from '../../data/decoracao';
import { CARTAS, T } from '../../data/textos-ui';

const ARTE: Record<CategoriaDeco, string[]> = {
  tapete: ['............', '............', '.f.f.f.f.f.f', 'kkkkkkkkkkkk', 'kabababababk', 'kbabababab.k', 'kabababababk', 'kbabababab.k', 'kkkkkkkkkkkk', '.f.f.f.f.f.f', '............', '............'],
  poster: ['.kkkkkkkkkk.', '.kwwwwwwwwk.', '.kwaaaaaawk.', '.kwaabbaawk.', '.kwabbbbawk.', '.kwaabbaawk.', '.kwaaaaaawk.', '.kwwwwwwwwk.', '.kwffffffwk.', '.kwwwwwwwwk.', '.kkkkkkkkkk.', '............'],
  planta: ['....a..a....', '.a..aa.a..a.', '.aa.ab.a.aa.', '..abab.aba..', '...ababab...', '....abab....', '..kkkkkkkk..', '..kffffffk..', '...kffffk...', '...kffffk...', '...kkkkkk...', '............'],
  pelucia: ['.kk......kk.', 'kaak....kaak', 'kaakkkkkkaak', '.kaaaaaaaak.', '.kakaaaakak.', '.kaaaaaaaak.', '.kaawbbwaak.', '.kaaawwaaak.', '..kaaaaaak..', '...kkkkkk...', '............', '............'],
  console: ['............', '............', '.kkkkkkkkkk.', '.kaaaaaaaak.', '.kabbbbbbak.', '.kaaaaaaaak.', '.kafaawawak.', '.kkkkkkkkkk.', '..k......k..', '.kk.....kk..', '.kfk....kfk.', '.kkk....kkk.'],
  movel: ['............', 'kk..........', 'kak.........', 'kakkkkkkkkkk', 'kawwkbbbbbbk', 'kawwkbfbbfbk', 'kakkkbbbbbbk', 'kaaaaaaaaaak', 'kkkkkkkkkkkk', 'kk........kk', 'kk........kk', '............'],
};
const PAL: Record<CategoriaDeco, Record<string, string>> = {
  tapete: { k: '#1a1423', a: '#e0483c', b: '#f9c22b', f: '#f6e6b8' }, poster: { k: '#1a1423', w: '#fff8e7', a: '#6fc7e8', b: '#f9c22b', f: '#8a8aa0' }, planta: { k: '#1a1423', a: '#4fa346', b: '#8fd45a', f: '#c98f4e' },
  pelucia: { k: '#1a1423', a: '#c98f4e', b: '#3b2a35', w: '#f6e6b8' }, console: { k: '#1a1423', a: '#c4c6d4', b: '#4a4a5e', f: '#e0483c', w: '#2f86c4' }, movel: { k: '#1a1423', a: '#9c6434', b: '#2f86c4', w: '#fff8e7', f: '#f9c22b' },
};

/** mostra uma carta em papel; fecha com A ou B */
function lerCarta(c: (typeof CARTAS)[number]): Promise<void> {
  return new Promise((ok) => {
    const el = elTela('ui', 'veu');
    const papel = moldura('texto', 264, 150, 28, 14); el.append(papel);
    papel.append(em(texto(`De: {c:azul}${c.de}{/c}`, { cor: 'tinta' }), 14, 12), em(texto(c.assunto, { cor: 'marrom' }), 14, 24), em(caixa('linha-div', 236, 1), 14, 36));
    papel.append(em(texto(substituir(c.texto), { tamanho: 12, cor: 'tinta', largura: 236 }), 14, 42));
    papel.append(em(texto('A: fechar', { cor: 'cinza' }), 204, 134));
    const tela: Tela = { el, sobreposta: true, atualizar() { if (input.apertou('a') || input.apertou('b')) { input.consumir('a'); input.consumir('b'); som('ui-voltar'); retirar(tela); ok(); } } };
    telas.empilhar(tela);
  });
}

export function criarPcQuarto(): Tela {
  const s = jogo.save;
  const el = elTela('ui', 'tela-pc', 'fundo-azulejo');
  placaTitulo(el, T.pc.titulo, 2, 1, 150);
  const monitor = moldura('tinta', 164, 146, 154, 18); el.append(monitor);
  const corpo = caixa('', 152, 136); monitor.append(em(corpo, 6, 5));
  const ops = [T.pc.guardar, T.pc.retirar, T.pc.descartar, T.pc.cartas, T.pc.decoracao, T.pc.desligar];
  const AJUDA = ['Passe para o PC o que pesa na mochila. Itens-chave ficam com você.', 'Pegue de volta o que está guardado.', 'Apague de vez itens guardados no PC.', 'Recados da família, dos amigos e de quem mais escrever.', 'Tapete, pôster, planta, pelúcia, console e cama: o quarto fica com a sua cara.', 'Desliga o computador.'];
  let ocupado = false, viva = true;
  const lista = new Lista({ itens: ops, x: 2, y: 18, largura: 150, tamanho: 12, visiveis: 6, aoMover: pintar, aoEscolher: (i) => void escolher(i), aoCancelar: () => fechar(tela) });
  el.append(lista.el);
  faixaDica(el)(T.pc.dica);
  const cartas = () => CARTAS.filter((c) => cond(c.se));
  function pintar() {
    corpo.replaceChildren();
    rotulo(corpo, ops[lista.indice].toUpperCase(), 0, 0, 'amarelo', { sombra: true });
    rotulo(corpo, AJUDA[lista.indice], 0, 14, 'creme', { largura: 150 });
    const nPc = Object.values(s.pcItens).reduce((a, b) => a + b, 0);
    if (lista.indice < 3) rotulo(corpo, `No PC: {c:amarelo}${nPc}{/c} ${nPc === 1 ? 'item' : 'itens'}`, 0, 60, 'cinza');
    else if (lista.indice === 3) rotulo(corpo, `Cartas: {c:amarelo}${cartas().length}{/c}`, 0, 60, 'cinza');
    else if (lista.indice === 4) CATEGORIAS.forEach((c, i) => { const id = decoracaoAtual(c.id), p = pecasDe(c.id).find((x) => x.id === id); corpo.append(em(pix(ARTE[c.id], PAL[c.id]), (i % 2) * 76, 58 + Math.floor(i / 2) * 26)); rotulo(corpo, caber(p?.nome ?? c.vazio, 58), (i % 2) * 76 + 15, 60 + Math.floor(i / 2) * 26, p ? 'creme' : 'cinza', { largura: 60 }); });
  }
  const linha = (i: ItemInfo, q: number) => ({ rotulo: caber(i.nome, 124), valor: `×${q}` });
  async function mover(titulo: string, deMochila: boolean, descartar = false) {
    let ind = 0;
    for (;;) {
      const fonte = deMochila ? s.mochila : s.pcItens;
      const its = ITENS.filter((i) => (fonte[i.id] ?? 0) > 0 && (!deMochila || i.bolso !== 'chave'));
      if (!its.length) { await informar(deMochila ? T.pc.nadaGuardar : T.pc.nadaPc); return; }
      ind = await escolherEm(titulo, its.map((i) => linha(i, fonte[i.id])), { inicial: Math.min(ind, its.length - 1), descricao: (k) => `${its[k].nome}\n\n${its[k].desc}` });
      if (ind < 0) return;
      const it = its[ind], q = await pedirQuantidade(descartar ? 'Descartar quantos?' : deMochila ? 'Guardar quantos?' : 'Retirar quantos?', fonte[it.id]);
      if (!q) continue;
      if (descartar && !(await confirmar(`Apagar ${q}× ${it.nome} do PC?`, false))) continue;
      if (deMochila) { tirarItem(it.id, q); s.pcItens[it.id] = (s.pcItens[it.id] ?? 0) + q; }
      else { const r = s.pcItens[it.id] - q; if (r > 0) s.pcItens[it.id] = r; else delete s.pcItens[it.id]; if (!descartar) darItem(it.id, q); }
      som('ui-ok');
    }
  }
  async function verCartas() {
    let ind = 0;
    for (;;) {
      const cs = cartas(); if (!cs.length) { await informar(T.pc.semCartas); return; }
      ind = await escolherEm('CARTAS', cs.map((c) => ({ rotulo: caber(c.assunto, 150), cor: s.flags['carta-lida:' + c.id] ? ('chumbo' as const) : undefined })), { inicial: ind, descricao: (k) => `De: ${cs[k].de}\n\n${s.flags['carta-lida:' + cs[k].id] ? 'Já lida.' : 'Carta nova!'}` });
      if (ind < 0) return;
      s.flags['carta-lida:' + cs[ind].id] = true; som('ui-ok'); await lerCarta(cs[ind]);
    }
  }
  async function decorar() {
    let ic = 0;
    for (;;) {
      ic = await escolherEm('DECORAÇÃO DO QUARTO', CATEGORIAS.map((c) => { const p = pecasDe(c.id).find((x) => x.id === decoracaoAtual(c.id)); return { rotulo: c.nome, valor: caber(p?.nome ?? c.vazio, 100) }; }), { inicial: ic, descricao: (k) => `Escolha ${CATEGORIAS[k].id === 'planta' || CATEGORIAS[k].id === 'pelucia' || CATEGORIAS[k].id === 'movel' ? 'a' : 'o'} ${CATEGORIAS[k].nome.toLowerCase()} do quarto.\n\nVocê tem ${pecasDe(CATEGORIAS[k].id).filter(temPeca).length} de ${pecasDe(CATEGORIAS[k].id).length} peças.` });
      if (ic < 0) return;
      const cat = CATEGORIAS[ic], pecas = pecasDe(cat.id), atual = decoracaoAtual(cat.id);
      const ops2 = [...pecas.map((p) => ({ rotulo: caber(p.nome, 130), valor: p.id === atual ? '★' : '', cor: temPeca(p) ? undefined : ('marrom' as const) })), { rotulo: cat.vazio, valor: atual === '' ? '★' : '' }];
      const ip = await escolherEm(cat.nome.toUpperCase(), ops2, { inicial: Math.max(0, pecas.findIndex((p) => p.id === atual)), descricao: (k) => (pecas[k] ? `${pecas[k].nome}\n\n${pecas[k].desc[0].toUpperCase() + pecas[k].desc.slice(1)}.\n\n${temPeca(pecas[k]) ? 'Na sua coleção.' : 'Ainda não é sua. ' + pecas[k].origem}` : 'Deixa o lugar vazio.') });
      if (ip < 0) continue;
      const p = pecas[ip];
      if (p && !temPeca(p)) { som('ui-erro'); await informar(`${T.pc.naoTem} ${p.origem}`); continue; }
      s.decoracao[cat.id] = p ? p.id : ''; bus.emit('decoracao', { categoria: cat.id, id: s.decoracao[cat.id] }); som('ui-ok');
      await informar(T.pc.aplicado);
    }
  }
  async function escolher(i: number) {
    if (ocupado) return; ocupado = true;
    try {
      if (i === 0) await mover('GUARDAR NO PC', true); else if (i === 1) await mover('RETIRAR DO PC', false); else if (i === 2) await mover('DESCARTAR DO PC', false, true);
      else if (i === 3) await verCartas(); else if (i === 4) await decorar(); else { fechar(tela); return; }
    } finally { ocupado = false; if (viva) pintar(); }
  }
  const tela: Tela = { el, entrar() { som('ui-ok'); pintar(); }, sair() { viva = false; }, atualizar(dt) { if (!ocupado) lista.atualizar(dt); } };
  return tela;
}
