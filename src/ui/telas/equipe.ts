/**
 * EQUIPE — até 6 criaturas em cartões (ícone do sprite `mapa`, nível, vida, status).
 * Modos: menu (resumo, mover, dar/tirar item), `{ modo: 'escolher' }` (devolve o índice, −1 se cancelar; a batalha e
 * os eventos usam; `pode(c, i)` devolve true ou o motivo da recusa) e `{ modo: 'usar', item }` (aplica um item da mochila).
 */
import type { CriaturaInst } from '../../core/tipos';
import { jogo, qtdItem, tirarItem, darItem } from '../../core/estado';
import { input } from '../../core/input';
import { gravarOpcoes } from '../../core/save';
import { item as itemDef, temItemDef } from '../../data/itens';
import { podeEvoluir } from '../../battle/index';
import { periodo } from '../../core/estado';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, barra, iconeStatus, som, type Barra } from '../kit';
import { Grade } from '../componentes/grade';
import { perguntar, informar } from '../componentes/confirmacao';
import { abrirTela } from '../dialogo';
import { iconeCriatura, nomeCri, sexoTxt, vidaMaxDe, esp, faixaDica, placaTitulo, usarItemEm, type Icone, estrelaRara } from './comum';
import { T } from '../../data/textos-ui';
import { t, tr } from '../../i18n';

export interface ArgsEquipe { modo?: 'menu' | 'escolher' | 'usar'; item?: string; titulo?: string; pode?(c: CriaturaInst, i: number): boolean | string }
interface Cartao { el: HTMLElement; ic: Icone; vida?: Barra; tag: HTMLElement; pintar(animar?: boolean): void }

export function criarEquipe(args: ArgsEquipe = {}): Tela {
  const modo = args.modo === 'escolher' || args.modo === 'usar' ? args.modo : 'menu';
  const el = elTela('ui', 'tela-equipe', 'fundo-trama');
  const eq = jogo.save.equipe;
  placaTitulo(el, args.titulo ?? (modo === 'usar' && args.item ? t(itemDef(args.item).nome).toUpperCase() : 'EQUIPE'), 2, 1, 150);
  const dica = faixaDica(el);
  let cartoes: Cartao[] = [], grade: Grade | null = null, movendo = -1, ocupado = false, usou = false;
  const camada = document.createElement('div'); el.append(camada);

  function nota(c: CriaturaInst): string {
    if (modo !== 'usar' || !args.item || c.ovo) return '';
    const it = itemDef(args.item), e = esp(c.especie);
    if (it.uso?.golpe) return c.golpes.some((g) => g.id === it.uso!.golpe) ? '{c:cinza}Já sabe{/c}' : e?.pergaminhos.includes(it.id) ? '{c:verde}Aprende{/c}' : '{c:vermelho}Não aprende{/c}';
    if (it.uso?.evolui) return podeEvoluir(c, { item: it.id, periodo: periodo() }) ? '{c:verde}Reage!{/c}' : '{c:cinza}Sem reação{/c}';
    return '';
  }
  function cartao(c: CriaturaInst, i: number): Cartao {
    const cx = moldura('tinta', 156, 46); cx.classList.add('cartao-cri');
    const ic = iconeCriatura(c.especie, !!c.ovo, !!c.rara); cx.append(em(ic.el, 5, 11));
    if (c.rara && !c.ovo) cx.append(em(estrelaRara(), 3, 4)); // Pelagem Rara
    const nome = texto('', { cor: 'creme' }), nv = texto('', { cor: 'amarelo' }), num = texto('', { cor: 'creme' }), obs = texto('', { cor: 'creme' });
    cx.append(em(nome, 34, 6), em(nv, 118, 6), em(num, 34, 30), em(obs, 84, 30));
    const st = document.createElement('div'); cx.append(em(st, 122, 18));
    let vida: Barra | undefined;
    if (!c.ovo) { vida = barra('vida', 72, (px, max) => escrever(num, `${Math.round((px / max) * vidaMaxDe(c))}/${vidaMaxDe(c)}`)); cx.append(em(texto('VD', { cor: 'amarelo' }), 34, 18), em(vida.el, 48, 19)); }
    const ordem = em(texto(String(i + 1), { cor: 'cinza' }), 147, 36); cx.append(ordem);
    // etiqueta da troca de lugar ("MOVENDO" na criatura escolhida, "TROCAR AQUI" no destino); some fora do modo mover
    const tag = document.createElement('div'); tag.className = 'etiqueta-troca'; cx.append(tag);
    const pintar = (animar = false) => {
      const max = vidaMaxDe(c);
      escrever(nome, `${nomeCri(c)} ${sexoTxt(c)}`); escrever(nv, c.ovo ? '' : tr('Nv{n}', { n: c.nivel })); nv.style.left = 150 - parseInt(nv.style.width) + 'px';
      st.replaceChildren();
      if (c.ovo) { escrever(num, c.ovo > 1200 ? 'Vai demorar…' : c.ovo > 300 ? 'Às vezes se mexe.' : 'Quase chocando!'); return; }
      vida!.definir(c.vida / max, animar);
      if (!animar) escrever(num, `${c.vida}/${max}`);
      const s = c.vida <= 0 ? 'desmaiado' : c.status; if (s) st.append(iconeStatus(s));
      const n = nota(c); escrever(obs, n || (c.item && temItemDef(c.item) ? `{c:agua}${t(itemDef(c.item).nome).slice(0, 11)}{/c}` : ''));
      obs.style.left = 142 - parseInt(obs.style.width) + 'px';
    };
    pintar();
    return { el: cx, ic, vida, tag, pintar };
  }
  function montar(indice = grade?.indice ?? 0) {
    camada.replaceChildren();
    cartoes = eq.map(cartao);
    if (!eq.length) { camada.append(em(texto(T.equipe.vazia, { cor: 'creme', sombra: true, largura: 280, alinhar: 'centro' }), 20, 80)); grade = null; return; }
    grade = new Grade({ colunas: 2, celulas: cartoes.map((c) => c.el), w: 156, h: 46, vao: 2, x: 3, y: 19, inicial: Math.min(indice, eq.length - 1), aoEscolher: (i) => void escolher(i), aoCancelar: voltar, aoMover: pintarFoco });
    camada.append(grade.el); pintarFoco();
  }
  function pintarFoco() {
    const i = grade?.indice ?? 0;
    cartoes.forEach((c, k) => {
      const origem = movendo >= 0 && k === movendo, alvo = movendo >= 0 && k === i && k !== movendo;
      c.ic.animar(k === i || origem);
      c.el.classList.toggle('movendo', origem); c.el.classList.toggle('alvo-troca', alvo);
      c.el.classList.toggle('foco-cartao', k === i && movendo < 0); // criatura selecionada bem visível (feedback: o cursor sumia no celular)
      const rot = origem ? 'MOVENDO' : alvo ? 'TROCAR AQUI' : '';
      c.tag.replaceChildren(); c.tag.style.display = rot ? '' : 'none';
      if (rot) { const t = texto(rot, { cor: origem ? 'tinta' : 'creme' }); c.tag.append(t); c.tag.style.width = parseInt(t.style.width) + 6 + 'px'; c.tag.style.left = Math.round((156 - parseInt(t.style.width) - 6) / 2) + 'px'; }
    });
    const nomeDe = (k: number) => (eq[k] ? nomeCri(eq[k]) : '');
    dica(movendo >= 0
      ? (i === movendo ? tr(T.equipe.dicaMover, { nome: nomeDe(movendo) }) : tr(T.equipe.dicaTrocar, { a: nomeDe(movendo), b: nomeDe(i) }))
      : modo === 'escolher' ? T.equipe.dicaEscolher : modo === 'usar' ? T.equipe.dicaUsar : T.equipe.dicaMenu);
  }
  function voltar() {
    if (movendo >= 0) { movendo = -1; pintarFoco(); return; }
    fechar(tela, modo === 'escolher' ? -1 : usou);
  }
  function trocar(a: number, b: number) { [eq[a], eq[b]] = [eq[b], eq[a]]; movendo = -1; som('ui-ok'); montar(b); }
  async function escolher(i: number) {
    if (ocupado) return; const c = eq[i]; if (!c) return;
    if (movendo >= 0) { if (movendo === i) { movendo = -1; pintarFoco(); } else trocar(movendo, i); return; }
    ocupado = true;
    try {
      if (modo === 'escolher') {
        const r = args.pode ? args.pode(c, i) : true;
        if (r !== true) { som('ui-erro'); await informar(typeof r === 'string' ? r : tr('{n} não pode ser escolhida agora.', { n: nomeCri(c) })); return; }
        fechar(tela, i); return;
      }
      if (modo === 'usar' && args.item) {
        const antes = c.especie;
        const r = await usarItemEm(args.item, c);
        if (r.gasta) { tirarItem(args.item); usou = true; }
        cartoes[i]?.pintar(true);
        if (c.especie !== antes) montar(i);
        if (r.msg) { if (!r.ok) som('ui-erro'); await informar(r.msg); }
        if (r.gasta && !qtdItem(args.item)) fechar(tela, true);
        return;
      }
      // atalho da criatura que segue (spec 10A item 40): liga/desliga `opcoes.parceiraSegue`; quem segue é sempre a 1ª da equipe
      const segue = jogo.opcoes.parceiraSegue && i === 0;
      const ops = ['Resumo', ...(eq.length > 1 ? ['Mover'] : []), ...(c.ovo ? [] : [c.item ? 'Tirar item' : 'Dar item', segue ? 'Parar de seguir' : 'Seguir você']), 'Voltar'];
      const op = ops[await perguntar(nomeCri(c), ops)];
      if (op === 'Resumo') { const r = (await abrirTela('resumo', { lista: eq, indice: i })) as number | undefined; montar(typeof r === 'number' ? r : i); }
      else if (op === 'Mover') { movendo = i; pintarFoco(); }
      else if (op === 'Parar de seguir') { jogo.opcoes.parceiraSegue = false; gravarOpcoes(); som('ui-ok'); await informar(tr('{n} volta para a cuia e não segue mais você no mapa.', { n: nomeCri(c) })); }
      else if (op === 'Seguir você') {
        jogo.opcoes.parceiraSegue = true; gravarOpcoes(); som('ui-ok');
        if (i > 0) { [eq[0], eq[i]] = [eq[i], eq[0]]; montar(0); }
        await informar(c.vida > 0 ? tr('{n} vai na frente da equipe e anda atrás de você no mapa!', { n: nomeCri(c) }) : tr('{n} vai seguir você assim que se recuperar.', { n: nomeCri(c) }));
      }
      else if (op === 'Tirar item' && c.item) { darItem(c.item); const n = temItemDef(c.item) ? itemDef(c.item).nome : c.item; delete c.item; cartoes[i].pintar(); await informar(tr('{nome} voltou para a mochila.', { nome: n })); }
      else if (op === 'Dar item') {
        const id = (await abrirTela('mochila', { modo: 'escolher', filtro: 'dar', titulo: 'DAR QUAL ITEM?' })) as string | null;
        if (id && tirarItem(id)) { c.item = id; cartoes[i].pintar(); await informar(tr('{n} agora segura {item}.', { n: nomeCri(c), item: itemDef(id).nome })); }
      }
    } finally { ocupado = false; if (telaViva) pintarFoco(); }
  }
  let telaViva = true;
  const tela: Tela = {
    el,
    entrar() { montar(0); },
    sair() { telaViva = false; },
    voltar() { if (telaViva) cartoes.forEach((c) => c.pintar()); },
    atualizar(dt) {
      for (const c of cartoes) { c.ic.atualizar(dt); c.vida?.atualizar(dt); }
      if (ocupado) return;
      if (!grade) { if (input.apertou('b') || input.apertou('a')) { som('ui-voltar'); voltar(); } return; }
      if (modo === 'menu' && input.apertou('select') && eq.length > 1) { if (movendo < 0) { movendo = grade.indice; som('ui-ok'); pintarFoco(); } else void escolher(grade.indice); return; }
      grade.atualizar(dt);
    },
  };
  return tela;
}
