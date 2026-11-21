/**
 * Menus da batalha: ações (LUTAR em cartão grande ilustrado + MOCHILA, EQUIPE, FUGIR), os 4 golpes com tipo, PG e
 * eficácia conhecida, escolha de alvo (duplas), mochila por bolsos, equipe (trocar / usar item) e esquecer golpe.
 * Cada menu é um `Modal`: a tela chama `atualizar` no que está aberto; todo item responde a teclado, controle e toque.
 */
import type { Bolso, CriaturaInst, TipoId } from '../../core/tipos';
import { input, tocavel } from '../../core/input';
import { vista } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { barra, chipTipo, cursorMao, iconeBolso, iconeStatus, iconeTipo, moldura, NOME_BOLSO, seta, som, trocarMoldura } from '../../ui/kit';
import { em, escrever, medir, texto } from '../../ui/fonte';
import { Lista } from '../../ui/componentes/lista';
import { Abas } from '../../ui/componentes/abas';
import { golpe as defGolpe } from '../../data/golpes';
import { ITENS, item as defItem, temItemDef } from '../../data/itens';
import { atributos, especie, nomeDe, temEspecie } from '../criatura';
import { fxUi, temFx } from './cena';
import { div, type Ator } from './palco';
import { painel } from './hud';

export interface Modal { el: HTMLElement; atualizar(dt: number): void; fechar?(): void }
const CAT = { fisico: 'Físico', especial: 'Especial', status: 'Apoio' } as const;

/* ------------------------------ menu de ações ------------------------------ */
export type OpcaoAcao = 'lutar' | 'mochila' | 'equipe' | 'fugir';
let ultimaAcao = 0;
export function menuAcao(o: { fugir: string; voltar: boolean; aoEscolher(a: OpcaoAcao | 'voltar'): void }): Modal {
  const el = div('bt-menu');
  const cartao = div('bt-lutar', el); const arte = fxUi('ui-lutar', 0); cartao.append(em(arte.el, 7, 1));
  cartao.append(em(texto('LUTAR', { sombra: true, tamanho: 12 }), Math.floor((58 - medir('LUTAR', 12)) / 2), 30));
  const rot: [OpcaoAcao, string, string][] = [['mochila', 'MOCHILA', 'ui-mochila'], ['equipe', 'EQUIPE', 'ui-equipe'], ['fugir', o.fugir, 'ui-fugir']];
  const botoes = rot.map(([, r, ic], i) => { const b = moldura('botao', 76, 14, 62, i * 15); b.classList.add('bt-botao'); b.append(em(fxUi(ic).el, 4, 0), em(texto(r, { cor: 'tinta' }), 22, 3)); el.append(b); return b; });
  const cursor = cursorMao(); el.append(cursor);
  let i = ultimaAcao, t = 0;
  const pintar = () => {
    cartao.classList.toggle('foco', i === 0); arte.quadro = i === 0 ? 1 : 0; arte.desenhar();
    botoes.forEach((b, j) => trocarMoldura(b, j + 1 === i ? 'botao-foco' : 'botao'));
    if (i === 0) em(cursor, -12, 18); else em(cursor, 50, (i - 1) * 15 + 2);
  };
  const ir = (n: number) => { if (n === i) return; i = n; som('ui-mover'); pintar(); };
  const ok = () => { ultimaAcao = i; som('ui-ok'); o.aoEscolher(i === 0 ? 'lutar' : rot[i - 1][0]); };
  tocavel(cartao, () => { i = 0; pintar(); ok(); }, () => ir(0));
  botoes.forEach((b, j) => tocavel(b, () => { i = j + 1; pintar(); ok(); }, () => ir(j + 1)));
  pintar();
  return {
    el,
    atualizar(dt) {
      t += dt; if (i === 0) { const q = Math.floor(t * 3) % 2; arte.el.style.top = 1 - q + 'px'; }
      if (input.repetiu('dir') && i === 0) ir(1);
      else if (input.repetiu('esq') && i > 0) ir(0);
      else if (input.repetiu('baixo')) ir(i === 0 ? 1 : Math.min(3, i + 1));
      else if (input.repetiu('cima') && i > 1) ir(i - 1);
      if (input.apertou('a')) { input.consumir('a'); ok(); }
      else if (input.apertou('b')) { input.consumir('b'); if (o.voltar) { som('ui-voltar'); o.aoEscolher('voltar'); } else ir(3); }
    },
  };
}

/* ------------------------------ golpes ------------------------------ */
export interface InfoEficacia { texto: string; cor: 'verde' | 'vermelho' | 'cinza' | 'tinta' }
const ultimoGolpe = new Map<string, number>();
/** painel de detalhes de um golpe (tipo, PG, categoria, poder e eficácia conhecida) */
function fichaGolpe(pai: HTMLElement, x: number, y: number, larg = 70) {
  const cx = div('bt-ficha', pai); em(cx, x, y);
  const pg = texto('', { cor: 'tinta' }), ef = texto('', { cor: 'tinta' }), cat = texto('', { cor: 'marrom' });
  let chip: HTMLElement | null = null;
  // chip na linha 1 e textos a cada 9 px logo abaixo dele: a linha de eficácia termina 3 px acima da borda de baixo
  cx.append(em(pg, 0, 13), em(cat, 0, 22), em(ef, 0, 31));
  return (id: string, pgAtual: number | null, pgMax: number, e: InfoEficacia | null) => {
    const g = defGolpe(id);
    chip?.remove(); chip = chipTipo(g.tipo, larg); cx.append(em(chip, 0, 1));
    escrever(pg, pgAtual === null ? `PG ${pgMax}` : `PG {c:${pgAtual === 0 ? 'vermelho' : pgAtual <= pgMax / 4 ? 'laranja' : 'tinta'}}${pgAtual}{/c}/${pgMax}`);
    escrever(cat, `${CAT[g.cat]}${g.poder ? ' · ' + g.poder : ''}`);
    escrever(ef, e ? `{c:${e.cor}}${e.texto}{/c}` : '');
  };
}
export function menuGolpes(o: { c: CriaturaInst; eficacia(id: string): InfoEficacia | null; aoEscolher(slot: number): void }): Modal {
  const p = painel(312, 45, 'bt-golpes'), el = p.el, m = p.miolo;
  const gs = o.c.golpes, cels: HTMLElement[] = [];
  const cursor = cursorMao(); m.append(cursor);
  const ficha = fichaGolpe(m, 237, 1);
  div('bt-divisa', m).style.cssText = 'left:232px;top:3px;height:37px';
  let i = Math.min(ultimoGolpe.get(o.c.uid) ?? 0, gs.length - 1);
  if (gs[i].pg <= 0) i = Math.max(0, gs.findIndex((g) => g.pg > 0));
  const pintar = () => {
    cels.forEach((c, j) => c.classList.toggle('foco', j === i));
    em(cursor, 2 + (i % 2) * 108, 7 + Math.floor(i / 2) * 20);
    ficha(gs[i].id, gs[i].pg, gs[i].pgMax, o.eficacia(gs[i].id));
  };
  const ir = (n: number) => { if (n === i || n < 0 || n >= gs.length) return; i = n; som('ui-mover'); pintar(); };
  const ok = () => { if (gs[i].pg <= 0) { som('ui-erro'); return; } ultimoGolpe.set(o.c.uid, i); som('ui-ok'); o.aoEscolher(i); };
  for (let j = 0; j < 4; j++) {
    const c = div('bt-golpe', m); em(c, 18 + (j % 2) * 108, 3 + Math.floor(j / 2) * 20); cels.push(c);
    const g = gs[j];
    if (!g) { c.append(em(texto('—', { cor: 'cinza' }), 17, 5)); continue; }
    const d = defGolpe(g.id);
    let nome = d.nome; while (medir(nome) > 84 && nome.length > 3) nome = nome.slice(0, -1);
    c.append(em(iconeTipo(d.tipo), 2, 3), em(texto(nome, { cor: g.pg > 0 ? 'tinta' : 'cinza' }), 17, 5));
    tocavel(c, () => { i = j; pintar(); ok(); }, () => ir(j));
  }
  pintar();
  return {
    el,
    atualizar() {
      if (input.repetiu('dir')) ir(i % 2 === 0 ? i + 1 : i);
      else if (input.repetiu('esq')) ir(i % 2 === 1 ? i - 1 : i);
      else if (input.repetiu('baixo')) ir(i + 2);
      else if (input.repetiu('cima')) ir(i - 2);
      if (input.apertou('a')) { input.consumir('a'); ok(); }
      else if (input.apertou('b')) { input.consumir('b'); som('ui-voltar'); o.aoEscolher(-1); }
    },
  };
}

/* ------------------------------ alvo (duplas) ------------------------------ */
export function menuAlvo(o: { alvos: Ator[]; camada: HTMLElement; aoEscolher(i: number): void }): Modal {
  const el = div('bt-alvos');
  const marcas = o.alvos.map((a, j) => {
    const s = seta('baixo'); s.classList.add('quica'); const zona = div('bt-zona-alvo', el);
    zona.style.cssText = `left:${a.x - a.larg - 4}px;top:${a.y - a.alt - 4}px;width:${a.larg * 2 + 8}px;height:${a.alt + 8}px`;
    el.append(em(s, a.x - 3, a.y - a.alt - 12));
    tocavel(zona, () => { i = j; pintar(); som('ui-ok'); o.aoEscolher(j); }, () => { if (i !== j) { i = j; som('ui-mover'); pintar(); } });
    return s;
  });
  let i = 0;
  const pintar = () => marcas.forEach((m, j) => { m.style.visibility = j === i ? '' : 'hidden'; });
  pintar();
  return {
    el,
    atualizar() {
      if (input.repetiu('dir') || input.repetiu('esq') || input.repetiu('cima') || input.repetiu('baixo')) { i = (i + 1) % o.alvos.length; som('ui-mover'); pintar(); }
      if (input.apertou('a')) { input.consumir('a'); som('ui-ok'); o.aoEscolher(i); }
      else if (input.apertou('b')) { input.consumir('b'); som('ui-voltar'); o.aoEscolher(-1); }
    },
  };
}

/* ------------------------------ sim / não e listas curtas ------------------------------ */
export function menuOpcoes(o: { opcoes: string[]; x?: number; y?: number; padrao?: number; aoEscolher(i: number): void }): Modal {
  const l = new Lista({ itens: o.opcoes, tamanho: 12, moldura: 'madeira', inicial: o.padrao ?? 0, aoEscolher: (i) => o.aoEscolher(i), aoCancelar: () => o.aoEscolher(-1) });
  em(l.el, o.x ?? 190 - l.largura, o.y ?? 136 - parseInt(l.el.style.height));
  return { el: l.el, atualizar: (dt) => l.atualizar(dt) };
}

/* ------------------------------ mochila ------------------------------ */
const BOLSOS_BATALHA: Bolso[] = ['remedios', 'cuias', 'frutos'];
let ultimoBolso = 0;
export function menuMochila(o: { mochila: Record<string, number>; podeCuia: boolean; motivoCuia: string; aoEscolher(id: string | null): void }): Modal {
  const el = moldura('madeira', 232, 138, 44, 0); el.classList.add('bt-mochila');
  const desc = texto('', { cor: 'tinta', largura: 208 }); const fundoDesc = div('bt-desc', el); em(fundoDesc, 10, 96); fundoDesc.append(em(desc, 3, 3));
  const itensDe = (b: Bolso) => ITENS.filter((it) => it.bolso === b && it.uso?.emBatalha && (o.mochila[it.id] ?? 0) > 0);
  let lista: Lista | null = null;
  const montar = (bi: number) => {
    ultimoBolso = bi; lista?.el.remove();
    const b = BOLSOS_BATALHA[bi], its = itensDe(b);
    const mini = (id: string) => (b === 'cuias' ? (() => { const f = fxUi(temFx(id) ? id : 'cuia', 0); f.el.style.marginTop = '-2px'; return f.el; })() : undefined);
    lista = new Lista({
      itens: its.length ? its.map((it) => ({ rotulo: it.nome, valor: '×' + o.mochila[it.id], icone: mini(it.id), desabilitado: b === 'cuias' && !o.podeCuia })) : [{ rotulo: 'Nada neste bolso.', desabilitado: true }],
      x: 10, y: 30, largura: 212, visiveis: 4, moldura: null, tamanho: 12,
      aoMover: (i) => escrever(desc, its[i]?.desc ?? ''),
      aoEscolher: (i) => { if (its[i]) o.aoEscolher(its[i].id); },
      aoCancelar: () => o.aoEscolher(null),
    });
    el.append(lista.el);
    escrever(desc, its[0] ? (b === 'cuias' && !o.podeCuia ? o.motivoCuia : its[0].desc) : `Sem ${NOME_BOLSO[b].toLowerCase()} que sirvam em batalha.`);
  };
  const abas = new Abas({ rotulos: BOLSOS_BATALHA.map((b) => NOME_BOLSO[b]), icones: BOLSOS_BATALHA.map((b) => iconeBolso(b)), x: 10, y: 8, inicial: ultimoBolso, aoTrocar: montar });
  el.append(abas.el);
  const sair = moldura('botao', 34, 14, 190, 11); sair.append(em(texto('Sair', { cor: 'tinta' }), 8, 3)); el.append(sair); tocavel(sair, () => { som('ui-voltar'); o.aoEscolher(null); });
  montar(ultimoBolso);
  return { el, atualizar(dt) { if (!abas.atualizar(dt)) lista?.atualizar(dt); } };
}

/* ------------------------------ equipe ------------------------------ */
/** miniatura 24×24 da criatura (sprite de mapa; sem sprite, o ícone do tipo) */
function miniatura(c: CriaturaInst): { el: HTMLElement; atualizar(dt: number, anda: boolean): void } {
  const el = div('bt-mini'); const e = temEspecie(c.especie) ? especie(c.especie) : null, m = e ? vista(e.id, 'mapa') : undefined;
  if (e && m) {
    const s = new Sprite(e.id, 'mapa', el); s.x = m.px + Math.floor((24 - m.cw) / 2); s.y = m.py + (24 - m.ch); s.tocar(s.tem('idle-s') ? 'idle-s' : 'andar-s'); s.desenhar();
    return { el, atualizar(dt, anda) { s.tocar(anda && s.tem('andar-s') ? 'andar-s' : s.tem('idle-s') ? 'idle-s' : 'andar-s'); s.atualizar(dt); s.desenhar(); } };
  }
  const v = fxUi('ui-vulto-mini', 0); el.append(em(v.el, 4, 5)); if (e) el.append(em(iconeTipo(e.tipos[0]), 12, 12));
  let t = 0;
  return { el, atualizar(dt, anda) { t += dt; v.el.style.top = (anda && Math.floor(t * 4) % 2 ? 4 : 5) + 'px'; } };
}
export interface OpEquipe {
  equipe: CriaturaInst[]; titulo: string;
  /** índices em campo (marcados com "em campo") */
  emCampo: number[];
  /** true = pode escolher; texto = motivo de não poder */
  pode(i: number): true | string;
  /** sem saída com B (substituição obrigatória) */
  obrigatorio?: boolean;
  aoEscolher(i: number): void;
}
export function menuEquipe(o: OpEquipe): Modal {
  const el = div('bt-equipe');
  const placa = moldura('placa', 150, 15, 2, 1); placa.append(em(texto(o.titulo, { cor: 'amarelo', sombra: true, largura: 142, alinhar: 'centro' }), 4, 4)); el.append(placa);
  const dica = moldura('placa', 316, 13, 2, 166); const tdica = texto('', { cor: 'creme' }); dica.append(em(tdica, 6, 3)); el.append(dica);
  const minis: ReturnType<typeof miniatura>[] = [], cartoes: HTMLElement[] = [];
  const cursor = cursorMao(); el.append(cursor);
  o.equipe.forEach((c, j) => {
    const cx = moldura('tinta', 148, 46, 14 + (j % 2) * 155, 18 + Math.floor(j / 2) * 49); cx.classList.add('bt-cartao'); el.append(cx); cartoes.push(cx);
    const mi = miniatura(c); minis.push(mi); cx.append(em(mi.el, 5, 11));
    if (c.ovo) { cx.append(em(texto('Ovo', { cor: 'creme' }), 34, 6)); tocavel(cx, () => { i = j; pintar(); ok(); }, () => ir(j)); return; }
    const max = atributos(c).vida, sexo = c.sexo === 'F' ? ' {c:rosa}♀{/c}' : c.sexo === 'M' ? ' {c:agua}♂{/c}' : '';
    const nv = texto(`Nv${c.nivel}`, { cor: 'amarelo' });
    const bv = barra('vida', 72); bv.definir(c.vida / max);
    cx.append(em(texto(nomeDe(c) + sexo, { cor: 'creme' }), 34, 6), em(nv, 142 - medir(`Nv${c.nivel}`), 6), em(texto('VD', { cor: 'amarelo' }), 34, 18), em(bv.el, 48, 19), em(texto(`${c.vida}/${max}`, { cor: 'creme' }), 34, 30));
    const s = c.vida <= 0 ? 'desmaiado' : c.status; if (s) cx.append(em(iconeStatus(s), 73, 30));
    if (o.emCampo.includes(j)) { const t = texto('em campo', { cor: 'agua' }); cx.append(em(t, 142 - medir('em campo'), 30)); }
    tocavel(cx, () => { i = j; pintar(); ok(); }, () => ir(j));
  });
  if (!o.obrigatorio) { const sair = moldura('botao', 40, 14, 276, 2); sair.append(em(texto('Voltar', { cor: 'tinta' }), 6, 3)); el.append(sair); tocavel(sair, () => { som('ui-voltar'); o.aoEscolher(-1); }); }
  let i = Math.max(0, o.equipe.findIndex((_, j) => o.pode(j) === true));
  const pintar = () => {
    cartoes.forEach((c, j) => c.classList.toggle('foco', j === i));
    em(cursor, (i % 2) * 155, 18 + Math.floor(i / 2) * 49 + 18);
    const p = o.pode(i); escrever(tdica, p === true ? 'Confirmar: escolher' + (o.obrigatorio ? '' : '   Voltar: cancelar') : `{c:laranja}${p}{/c}`);
  };
  const ir = (n: number) => { if (n === i || n < 0 || n >= o.equipe.length) return; i = n; som('ui-mover'); pintar(); };
  const ok = () => { const p = o.pode(i); if (p !== true) { som('ui-erro'); pintar(); return; } som('ui-ok'); o.aoEscolher(i); };
  pintar();
  return {
    el,
    atualizar(dt) {
      minis.forEach((m, j) => m.atualizar(dt, j === i));
      if (input.repetiu('dir')) ir(i % 2 === 0 ? i + 1 : i);
      else if (input.repetiu('esq')) ir(i % 2 === 1 ? i - 1 : i);
      else if (input.repetiu('baixo')) ir(i + 2 < o.equipe.length ? i + 2 : i);
      else if (input.repetiu('cima')) ir(i - 2);
      if (input.apertou('a')) { input.consumir('a'); ok(); }
      else if (input.apertou('b')) { input.consumir('b'); if (o.obrigatorio) som('ui-erro'); else { som('ui-voltar'); o.aoEscolher(-1); } }
    },
  };
}

/* ------------------------------ escolher um golpe (esquecer / receber PG) ------------------------------ */
export function menuGolpeDe(o: { c: CriaturaInst; titulo: string; novo?: string; aoEscolher(slot: number): void }): Modal {
  const el = moldura('madeira', 276, 122, 22, 6); el.classList.add('bt-esquecer');
  el.append(em(texto(o.titulo, { cor: 'tinta', largura: 256, alinhar: 'centro' }), 10, 9));
  const ids = [...o.c.golpes.map((g) => g.id), ...(o.novo ? [o.novo] : [])];
  const fundo = div('bt-desc', el); em(fundo, 148, 22); fundo.style.width = '118px'; fundo.style.height = '88px';
  const ficha = fichaGolpe(fundo, 3, 3, 76); const desc = texto('', { cor: 'tinta', largura: 112 }); fundo.append(em(desc, 3, 44));
  const mostra = (i: number) => { const g = o.c.golpes[i]; ficha(ids[i], g ? g.pg : null, g ? g.pgMax : defGolpe(ids[i]).pg, null); escrever(desc, defGolpe(ids[i]).desc); };
  const lista = new Lista({
    itens: ids.map((id, i) => ({ rotulo: defGolpe(id).nome, icone: iconeTipo(defGolpe(id).tipo), cor: o.novo && i === ids.length - 1 ? 'verde' as const : undefined })),
    x: 8, y: 22, largura: 138, visiveis: 5, moldura: null,
    aoMover: mostra, aoEscolher: (i) => o.aoEscolher(i), aoCancelar: () => o.aoEscolher(-1),
  });
  el.append(lista.el); mostra(0);
  return { el, atualizar: (dt) => lista.atualizar(dt) };
}

/** nome curto de um item, com reserva se o id não existir nos dados */
export const nomeItem = (id: string) => (temItemDef(id) ? defItem(id).nome : id);
export type { TipoId };
