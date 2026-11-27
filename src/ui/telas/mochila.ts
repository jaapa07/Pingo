/**
 * MOCHILA — seis bolsos (Itens, Remédios, Cuias, Pergaminhos, Frutos, Itens-chave).
 * Modos:
 *  - menu (padrão): Usar / Dar / Registrar no SELECT / Descartar. Devolve `{ campo: id }` ou `{ amuleto: id }` quando o
 *    item precisa do mapa (bicicleta, vara, Voo…): quem abriu fecha os menus e chama o mundo. Sem isso devolve undefined.
 *  - `{ modo: 'escolher', filtro?: 'dar' }`: devolve o id do item escolhido (null se cancelar). Não gasta nada.
 *  - `{ modo: 'batalha' }`: só itens usáveis em batalha; devolve o id (null se cancelar). A batalha aplica o efeito.
 * O item registrado no SELECT fica em `jogo.save.flags['atalho']`.
 */
import type { Bolso, AmuletoId } from '../../core/tipos';
import { jogo, qtdItem, tirarItem, darItem } from '../../core/estado';
import { input } from '../../core/input';
import { ITENS, item as itemDef, type ItemInfo } from '../../data/itens';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em, medir } from '../fonte';
import { moldura, iconeBolso, NOME_BOLSO, som } from '../kit';
import { Abas } from '../componentes/abas';
import { Lista } from '../componentes/lista';
import { perguntar, informar, confirmar } from '../componentes/confirmacao';
import { abrirTela } from '../dialogo';
import { faixaDica, itemPedeCriatura, nomeCri, rotulo, caixa } from './comum';
import { pedirQuantidade } from './quantidade';
import { T } from '../../data/textos-ui';
import { t, tr } from '../../i18n';

export interface ArgsMochila { modo?: 'menu' | 'escolher' | 'batalha'; filtro?: 'dar'; titulo?: string }
export const BOLSOS: Bolso[] = ['itens', 'remedios', 'cuias', 'pergaminhos', 'frutos', 'chave'];
const TELA_ITEM: Record<string, string> = { 'radio-cipo': 'radio', 'diario-de-campo': 'diario', 'estojo-de-insignias': 'insignias', 'camera-de-bolso': 'foto' };
const DE_CAMPO = new Set(['bike-bambu', 'vara-velha', 'vara-boa', 'vara-mestra']);
const AMULETO_MENU: AmuletoId[] = ['voo', 'faro', 'lampiao'];
/** encurta com reticências para caber em `w` px */
export function caber(s: string, w: number): string { s = t(s); if (medir(s) <= w) return s; let r = s; while (r.length > 1 && medir(r + '…') > w) r = r.slice(0, -1); return r.trimEnd() + '…'; }
export const itemRegistrado = () => String(jogo.save.flags['atalho'] ?? '');
/** itens de um bolso que o jogador tem, na ordem do catálogo */
export function itensDoBolso(b: Bolso, fonte: Record<string, number> = jogo.save.mochila): ItemInfo[] { return ITENS.filter((i) => i.bolso === b && (fonte[i.id] ?? 0) > 0); }

let ultimoBolso = 0;
export function criarMochila(args: ArgsMochila = {}): Tela {
  const modo = args.modo ?? 'menu';
  const el = elTela('ui', 'tela-mochila', 'fundo-terra');
  const serve = (i: ItemInfo) => (modo === 'batalha' ? !!i.uso?.emBatalha : args.filtro === 'dar' ? i.bolso !== 'chave' && i.bolso !== 'pergaminhos' : true);
  const bolsos = BOLSOS.filter((b) => (modo === 'batalha' ? b === 'remedios' || b === 'cuias' || b === 'frutos' : args.filtro === 'dar' ? b !== 'chave' && b !== 'pergaminhos' : true));
  const abas = new Abas({ rotulos: bolsos.map(() => ''), icones: bolsos.map(iconeBolso), x: 2, y: 1, largura: 22, inicial: Math.min(ultimoBolso, bolsos.length - 1), aoTrocar: () => montar(0) });
  el.append(abas.el);
  const placa = moldura('placa', 320 - 4 - bolsos.length * 23 - 2, 15, 4 + bolsos.length * 23, 4); el.append(placa);
  const titulo = texto('', { cor: 'amarelo', sombra: true }); placa.append(em(titulo, 6, 4));
  const painel = moldura('madeira', 186, 140, 2, 23), info = moldura('tinta', 128, 140, 190, 23); el.append(painel, info);
  const dica = faixaDica(el);
  let lista: Lista | null = null, atuais: ItemInfo[] = [], ocupado = false, viva = true;
  const corpo = caixa('', 120, 132); info.append(em(corpo, 5, 5));

  function montar(indice = lista?.indice ?? 0) {
    const b = bolsos[abas.indice]; ultimoBolso = abas.indice;
    escrever(titulo, (args.titulo ? t(args.titulo) + ' · ' : '') + t(NOME_BOLSO[b]).toUpperCase());
    atuais = itensDoBolso(b).filter(serve);
    lista?.el.remove();
    const reg = itemRegistrado();
    lista = new Lista({
      itens: atuais.map((i) => { const v = i.bolso === 'chave' ? (i.id === reg ? 'SEL' : '') : `×${qtdItem(i.id)}`; return { rotulo: caber(i.nome, 150 - medir(v) - 6), valor: v }; }),
      moldura: null, largura: 170, visiveis: 10, inicial: Math.min(indice, Math.max(0, atuais.length - 1)), aoMover: pintarInfo, aoEscolher: (i) => void escolher(atuais[i]), aoCancelar: sair,
    });
    painel.append(em(lista.el, 8, 9));
    [...painel.querySelectorAll('.vazio')].forEach((x) => x.remove());
    if (!atuais.length) { const v = texto(T.mochila.vazio, { cor: 'marrom', largura: 160, alinhar: 'centro' }); v.classList.add('vazio'); painel.append(em(v, 13, 60)); }
    pintarInfo();
    dica(modo === 'menu' ? T.mochila.dica : T.mochila.dicaEscolher);
  }
  function pintarInfo() {
    corpo.replaceChildren();
    const it = atuais[lista?.indice ?? 0];
    corpo.append(em(iconeBolso(bolsos[abas.indice]), 0, 0));
    if (!it) return;
    const n = rotulo(corpo, it.nome, 20, 0, 'amarelo', { largura: 98 });
    const y = Math.max(20, parseInt(n.style.height) + 6);
    const d = rotulo(corpo, it.desc, 0, y, 'creme', { largura: 118 });
    let yy = y + parseInt(d.style.height) + 6;
    if (it.bolso !== 'chave' && yy <= 122) { rotulo(corpo, tr('Na mochila: {c:amarelo}×{qtd}{/c}', { qtd: qtdItem(it.id) }), 0, yy, 'cinza'); yy += 10; }
    if (it.id === itemRegistrado() && yy <= 122) rotulo(corpo, 'No botão SELECT', 0, yy, 'agua');
    else if (it.preco > 0 && it.bolso !== 'chave' && yy <= 122) rotulo(corpo, tr('Venda: {preco} patacas', { preco: Math.floor(it.preco / 2) }), 0, yy, 'cinza');
  }
  function sair() { fechar(tela, modo === 'menu' ? undefined : null); }

  function usavel(it: ItemInfo): boolean {
    const u = it.uso;
    return itemPedeCriatura(it) || !!u?.repelente || DE_CAMPO.has(it.id) || !!TELA_ITEM[it.id] || (!!u?.amuleto && AMULETO_MENU.includes(u.amuleto));
  }
  async function usar(it: ItemInfo) {
    const u = it.uso;
    if (TELA_ITEM[it.id]) { await abrirTela(TELA_ITEM[it.id]); return; }
    if (itemPedeCriatura(it)) {
      if (!jogo.save.equipe.length) { som('ui-erro'); await informar(T.mochila.semEquipe); return; }
      await abrirTela('equipe', { modo: 'usar', item: it.id }); return;
    }
    if (u?.repelente) {
      if (jogo.save.repelente > 0) { som('ui-erro'); await informar(T.mochila.repelenteAtivo); return; }
      tirarItem(it.id); jogo.save.repelente = u.repelente; som('ui-ok');
      await informar(tr('{jogador} acendeu a {item}. Por {repelente} passos, as criaturas mais fracas vão manter distância.', { jogador: jogo.save.jogador.nome, item: it.nome, repelente: u.repelente })); return;
    }
    if (DE_CAMPO.has(it.id)) { fechar(tela, { campo: it.id }); return; }
    if (u?.amuleto) { fechar(tela, { amuleto: u.amuleto }); return; }
    som('ui-erro'); await informar(T.mochila.naoAqui);
  }
  async function dar(it: ItemInfo) {
    const i = (await abrirTela('equipe', { modo: 'escolher', titulo: 'DAR A QUEM?', pode: (c: { ovo?: number }) => (c.ovo ? 'Um ovo não segura itens.' : true) })) as number;
    const c = jogo.save.equipe[i]; if (!c || !tirarItem(it.id)) return;
    const velho = c.item; c.item = it.id; if (velho) darItem(velho);
    await informar(velho ? tr('{n} trocou {velho} por {item}.', { n: nomeCri(c), velho: itemDef(velho).nome, item: it.nome }) : tr('{n} agora segura {item}.', { n: nomeCri(c), item: it.nome }));
  }
  async function descartar(it: ItemInfo) {
    const q = await pedirQuantidade(`Descartar quantos?`, qtdItem(it.id)); if (!q) return;
    if (await confirmar(tr('Jogar fora {n}× {item}?', { n: q, item: it.nome }), false)) { tirarItem(it.id, q); som('ui-ok'); }
  }
  async function registrar(it: ItemInfo) {
    if (itemRegistrado() === it.id) { delete jogo.save.flags['atalho']; await informar(tr('{item} {acao}', { item: it.nome, acao: T.mochila.desregistrado })); }
    else { jogo.save.flags['atalho'] = it.id; som('ui-ok'); await informar(tr('{item} {acao}', { item: it.nome, acao: T.mochila.registrado })); }
  }
  async function escolher(it: ItemInfo | undefined) {
    if (!it || ocupado) return;
    if (modo !== 'menu') { fechar(tela, it.id); return; }
    ocupado = true;
    try {
      const ops: string[] = [];
      if (usavel(it)) ops.push(it.uso?.golpe ? 'Ensinar' : 'Usar');
      if (it.bolso !== 'chave' && it.bolso !== 'pergaminhos' && jogo.save.equipe.length) ops.push('Dar');
      if (DE_CAMPO.has(it.id)) ops.push(itemRegistrado() === it.id ? 'Tirar do SELECT' : 'Registrar no SELECT');
      if (it.bolso !== 'chave') ops.push('Descartar');
      if (it.uso?.amuleto && !AMULETO_MENU.includes(it.uso.amuleto)) ops.push('Como funciona');
      ops.push('Voltar');
      const op = ops[await perguntar(it.nome, ops)];
      if (op === 'Usar' || op === 'Ensinar') await usar(it);
      else if (op === 'Dar') await dar(it);
      else if (op === 'Descartar') await descartar(it);
      else if (op === 'Como funciona') await informar(T.mochila.amuleto);
      else if (op?.includes('SELECT')) await registrar(it);
    } finally { ocupado = false; if (viva) montar(); }
  }
  const tela: Tela = {
    el,
    entrar() { montar(0); },
    sair() { viva = false; },
    voltar() { if (viva && !ocupado) montar(); },
    atualizar(dt) {
      if (ocupado) return;
      if (abas.atualizar(dt)) return;
      if (modo === 'menu' && input.apertou('select')) { const it = atuais[lista?.indice ?? 0]; if (it && DE_CAMPO.has(it.id)) { ocupado = true; void registrar(it).finally(() => { ocupado = false; if (viva) montar(); }); } else som('ui-erro'); return; }
      lista?.atualizar(dt);
    },
  };
  return tela;
}
