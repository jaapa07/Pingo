/**
 * Peças compartilhadas pelas telas de menu (equipe, mochila, diário, viveiro…): pixel art em DOM por grades de
 * caracteres, ícones e figuras de criaturas (com reserva desenhada à mão quando o sprite ainda não existe),
 * faixa de dica, e as regras de uso de itens fora de batalha (cura, nível, pergaminho, pedra de evolução).
 */
import type { CriaturaInst, EspecieDef, TipoId } from '../../core/tipos';
import { jogo, marcarCapturado, periodo } from '../../core/estado';
import { bus } from '../../core/events';
import { vista, vistaCriatura } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { ESPECIES, VISITANTES } from '../../data/criaturas';
import { item as itemDef, type ItemInfo } from '../../data/itens';
import { golpe, temGolpe } from '../../data/golpes';
import { atributos, podeEvoluir, evoluir, aprenderGolpe, ganharExp, expParaNivel, amizadePor, mudarAmizade } from '../../battle/index';
import { telas, criarTela, temTela } from '../telas';
import { texto, escrever, em, type CorTexto } from '../fonte';
import { moldura, CORES_TIPO, iconeTipo, NOME_STATUS, som } from '../kit';
import { botaoVoltar, larguraVoltar, separarDicaB } from '../componentes/voltar';
import { perguntar, informar } from '../componentes/confirmacao';
import { Lista, type ItemLista } from '../componentes/lista';
import { input } from '../../core/input';
import { elTela, retirar } from '../base';
import type { Tela } from '../telas';

/* ------------------------------ espécies (tolerante a lotes ainda não entregues) ------------------------------ */
// os Visitantes (181–182, spec 6.5) também têm nome, figura e ficha, fora do total de 180
const MAPA_ESP = new Map<number, EspecieDef>([...ESPECIES, ...VISITANTES].map((e) => [e.num, e]));
export const TOTAL_DIARIO = 180;
export const esp = (n: number): EspecieDef | undefined => MAPA_ESP.get(n);
export const nomeEsp = (n: number) => esp(n)?.nome ?? `Criatura nº ${n}`;
export const nomeCri = (c: CriaturaInst) => (c.ovo ? 'Ovo' : c.apelido || nomeEsp(c.especie));
export const tiposDe = (n: number): TipoId[] => esp(n)?.tipos ?? ['comum'];
export const vidaMaxDe = (c: CriaturaInst) => (esp(c.especie) ? atributos(c).vida : Math.max(1, c.vida));
export const sexoTxt = (c: CriaturaInst) => (c.ovo ? '' : c.sexo === 'F' ? '{c:rosa}♀{/c}' : c.sexo === 'M' ? '{c:azul}♂{/c}' : '');
export const n3 = (n: number) => String(n).padStart(3, '0');
export const patacas = (n: number) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ------------------------------ pixel art por grade ------------------------------ */
/** desenho de 1 px por caractere (sombras de 1 px); `escala` inteira amplia sem suavizar */
export function pix(grade: string[], pal: Record<string, string>, escala = 1): HTMLElement {
  const el = document.createElement('div'); el.className = 'px';
  const w = grade[0].length, h = grade.length;
  el.style.width = w * escala + 'px'; el.style.height = h * escala + 'px';
  const q = document.createElement('i'); const s: string[] = [];
  grade.forEach((l, y) => { for (let x = 0; x < l.length; x++) { const c = pal[l[x]]; if (c) s.push(`${x + 1}px ${y + 1}px 0 0 ${c}`); } });
  q.style.boxShadow = s.join(',');
  if (escala !== 1) { q.style.transform = `scale(${escala})`; q.style.transformOrigin = '1px 1px'; }
  el.append(q); return el;
}
/** mosaico de células quadradas (mapas): cada caractere vira um bloco com o fundo CSS indicado; carreiras iguais são unidas */
export function mosaico(linhas: string[], fundos: Record<string, string>, cel: number): HTMLElement {
  const el = document.createElement('div'); el.className = 'mosaico';
  el.style.width = linhas[0].length * cel + 'px'; el.style.height = linhas.length * cel + 'px';
  linhas.forEach((l, y) => {
    let x = 0;
    while (x < l.length) {
      let f = x; while (f < l.length && l[f] === l[x]) f++;
      const bg = fundos[l[x]];
      if (bg) { const d = document.createElement('b'); d.style.cssText = `left:${x * cel}px;top:${y * cel}px;width:${(f - x) * cel}px;height:${cel}px;background:${bg}`; el.append(d); }
      x = f;
    }
  });
  return el;
}
export const caixa = (classe = '', w?: number, h?: number): HTMLElement => { const d = document.createElement('div'); d.className = classe; d.style.position = 'absolute'; if (w != null) d.style.width = w + 'px'; if (h != null) d.style.height = h + 'px'; return d; };

const BICHO = ['................', '.....kkkkkk.....', '...kkllllllkk...', '..kllbbbbbbbbk..', '.klbbbbbbbbbbbk.', '.kbbkbbbbbbkbbk.', 'kbbbkkbbbbkkbbbk', 'kbbbkkbbbbkkbbbk', 'kbbbbbbbbbbbbbbk', 'kbbbbbbkkbbbbbdk', 'kbbbbbbbbbbbbddk', '.kbbbbbbbbbbddk.', '.kdbbbbbbbbdddk.', '..kddddddddddk..', '...kkkkkkkkkk...', '................'];
const OVO = ['................', '......kkkk......', '....kkllllkk....', '...kllbbbbbbk...', '..klbbbbmmbbbk..', '..kbbbbbmmbbbk..', '.kbbmmbbbbbbbbk.', '.kbbmmbbbbbmmbk.', '.kbbbbbbbbbmmbk.', '.kbbbbmmbbbbbdk.', '.kbbbbmmbbbbddk.', '..kbbbbbbbbddk..', '..kdbbbbbbdddk..', '...kddddddddk...', '....kkkkkkkk....', '................'];
const INTERROGA = ['................', '.....kkkkkk.....', '....kqqqqqqk....', '...kqqkkkkqqk...', '...kqqk..kqqk...', '....kk...kqqk...', '........kqqk....', '.......kqqk.....', '......kqqk......', '......kqqk......', '......kkkk......', '......kqqk......', '......kqqk......', '......kkkk......', '................', '................'];
const palTipo = (t: TipoId) => { const [b, d, l] = CORES_TIPO[t]; return { k: '#1a1423', b, d, l, m: d }; };

/** estrelinha da Pelagem Rara (spec 10A-5), 7×7 */
const ESTRELA = ['...k...', '..kyk..', '.kkykk.', 'kyywyyk', '.kkykk.', '..kyk..', '...k...'];
export const estrelaRara = (escala = 1): HTMLElement => pix(ESTRELA, { k: '#1a1423', y: '#ffd84a', w: '#fff8e7' }, escala);
export interface Icone { el: HTMLElement; atualizar(dt: number): void; /** anda no lugar (em foco) ou fica parada */ animar(b: boolean): void; sprite?: Sprite }
/** ícone 24×24 da criatura: sprite `mapa` olhando para baixo; sem sprite, um bichinho na cor do tipo */
export function iconeCriatura(num: number, ovo = false, rara = false): Icone {
  const el = caixa('ic-cri', 24, 24);
  const e = esp(num), vm = e ? vistaCriatura(e.id, 'mapa', rara) : 'mapa', m = e && !ovo ? vista(e.id, vm) : undefined;
  if (m && e) {
    const s = new Sprite(e.id, vm, el); s.x = m.px + Math.floor((24 - m.cw) / 2); s.y = m.py + (24 - m.ch);
    const parada = s.tem('idle-s') ? 'idle-s' : 'andar-s';
    s.tocar(parada); s.desenhar();
    return { el, sprite: s, atualizar(dt) { s.atualizar(dt); s.desenhar(); }, animar(b) { s.tocar(b && s.tem('andar-s') ? 'andar-s' : parada); s.desenhar(); } };
  }
  const p = em(pix(ovo ? OVO : BICHO, ovo ? { k: '#1a1423', b: '#fff8e7', l: '#ffffff', d: '#e8c07a', m: '#8fd45a' } : palTipo(tiposDe(num)[0])), 4, 6); el.append(p);
  if (!ovo) el.append(em(iconeTipo(tiposDe(num)[0]), 12, 12));
  let t = 0, anda = false;
  return { el, atualizar(dt) { if (!anda) return; t += dt; p.style.top = (Math.floor(t * 4) % 2 ? 5 : 6) + 'px'; }, animar(b) { anda = b; if (!b) p.style.top = '6px'; } };
}
/** figura grande (vista `frente`) centrada numa caixa; `silhueta` escurece (vista mas não capturada); `misterio` = nunca vista */
export function figura(num: number, w = 96, h = 96, o: { silhueta?: boolean; misterio?: boolean; /** Pelagem Rara */ rara?: boolean } = {}): Icone {
  const el = caixa('fig-cri', w, h);
  const e = esp(num), vf = e ? vistaCriatura(e.id, 'frente', o.rara && !o.silhueta) : 'frente', m = e && !o.misterio ? vista(e.id, vf) : undefined;
  if (m && e) {
    const s = new Sprite(e.id, vf, el); s.x = m.px + Math.floor((w - m.cw) / 2); s.y = m.py + Math.floor((h - m.ch) / 2);
    s.tocar(s.tem('idle') ? 'idle' : Object.keys(m.anims)[0]); s.desenhar();
    if (o.silhueta) s.el.classList.add('silhueta');
    return { el, sprite: s, atualizar(dt) { s.atualizar(dt); s.desenhar(); }, animar() { /* a figura sempre respira */ } };
  }
  const esc = Math.max(1, Math.min(4, Math.floor(Math.min(w, h) / 20)));
  const p = pix(o.misterio ? INTERROGA : BICHO, o.misterio ? { k: '#1a1423', q: '#8a8aa0' } : palTipo(tiposDe(num)[0]), esc);
  if (o.silhueta) p.classList.add('silhueta');
  el.append(em(p, Math.floor((w - 16 * esc) / 2), Math.floor((h - 16 * esc) / 2)));
  let t = 0;
  return { el, atualizar(dt) { t += dt; p.style.top = Math.floor((h - 16 * esc) / 2) + (Math.floor(t * 2) % 2) + 'px'; }, animar() { /* idem */ } };
}

/* ------------------------------ peças de tela ------------------------------ */
/** faixa de dica no rodapé (placa escura); devolve a função que troca o texto */
export function faixaDica(pai: HTMLElement, y = 166, x = 2, w = 316): (s: string) => void {
  const cx = moldura('placa', w, 13, x, y); cx.classList.add('faixa-dica');
  const t = texto('', { cor: 'creme' }); cx.append(em(t, 6, 3)); pai.append(cx);
  // o trecho "B: voltar" (ou desligar, sair, cancelar…) vira um botão "◀ Voltar" tocável na ponta direita da faixa
  // (feedback de jogador: no celular o B não é óbvio). O alvo de toque sobe 5 px acima da faixa e vai até a borda.
  let atual = '', bt: HTMLElement | null = null, rotB = '';
  return (s) => {
    if (s === atual) return; atual = s;
    const [resto, rot] = separarDicaB(s);
    escrever(t, resto);
    if (rot === rotB) return;
    rotB = rot ?? ''; bt?.remove(); bt = null;
    if (rot) { bt = botaoVoltar({ rotulo: rot, altura: 13, folga: [4, 5, 0, 0] }); cx.append(em(bt, w - larguraVoltar(rot), 0)); }
  };
}
/** título entalhado numa placa */
export function placaTitulo(pai: HTMLElement, str: string, x = 2, y = 2, w = 120): HTMLElement {
  const cx = moldura('placa', w, 15, x, y); cx.append(em(texto(str, { cor: 'amarelo', sombra: true, largura: w - 8, alinhar: 'centro' }), 4, 4)); pai.append(cx); return cx;
}
export const rotulo = (pai: HTMLElement, str: string, x: number, y: number, cor: CorTexto = 'tinta', o: { largura?: number; alinhar?: 'esq' | 'centro' | 'dir'; tamanho?: 8 | 12; sombra?: boolean } = {}): HTMLElement => { const t = texto(str, { cor, ...o }); pai.append(em(t, x, y)); return t; };
/** espera `s` segundos de jogo dentro de uma tela (a tela chama `tique(dt)` no seu atualizar) */
export class Esperas {
  private fila: { t: number; f: () => void }[] = [];
  apos(s: number, f: () => void) { this.fila.push({ t: s, f }); }
  dormir(s: number): Promise<void> { return new Promise((r) => this.apos(s, r)); }
  tique(dt: number) { for (const e of [...this.fila]) { e.t -= dt; if (e.t <= 0) { this.fila.splice(this.fila.indexOf(e), 1); e.f(); } } }
  get vazia() { return !this.fila.length; }
}

/**
 * Janela de escolha com descrição: lista à esquerda (madeira) e painel escuro à direita com o texto de `descricao(i)`.
 * Devolve o índice escolhido ou −1 (B). Usada pelo PC do quarto, pela loja e pelo rádio.
 */
export function escolherEm(titulo: string, itens: ItemLista[], o: { descricao?(i: number): string; inicial?: number; vazio?: string; fundo?: string } = {}): Promise<number> {
  return new Promise((resolver) => {
    const el = elTela('ui', 'janela-escolha', o.fundo ?? 'fundo-roxo');
    placaTitulo(el, titulo, 2, 1, 186);
    const painel = moldura('madeira', 186, 146, 2, 17), info = moldura('tinta', 128, 146, 190, 17); el.append(painel, info);
    const d = texto('', { cor: 'creme', largura: 116 }); info.append(em(d, 6, 6));
    const pintar = (i: number) => escrever(d, itens.length ? (o.descricao?.(i) ?? '') : (o.vazio ?? ''));
    const fim = (i: number) => { retirar(tela); resolver(i); };
    const lista = new Lista({ itens, moldura: null, largura: 170, visiveis: 10, inicial: o.inicial ?? 0, aoMover: pintar, aoEscolher: (i) => fim(i), aoCancelar: () => fim(-1) });
    painel.append(em(lista.el, 8, 10)); pintar(lista.indice); faixaDica(el)('A: escolher   B: voltar');
    const tela: Tela = { el, sobreposta: true, atualizar(dt) { if (!itens.length) { if (input.apertou('a') || input.apertou('b')) { input.consumir('a'); input.consumir('b'); fim(-1); } return; } lista.atualizar(dt); } };
    telas.empilhar(tela);
  });
}

/* ------------------------------ uso de itens fora de batalha ------------------------------ */
export interface ResultadoUso { ok: boolean; msg: string; /** gasta 1 unidade */ gasta: boolean }
const nada = (msg = 'Não teria efeito.'): ResultadoUso => ({ ok: false, msg, gasta: false });

/** ensina um golpe (pergunta qual esquecer se já houver 4). true = aprendeu */
export async function ensinar(c: CriaturaInst, golpeId: string): Promise<boolean> {
  if (!temGolpe(golpeId)) return false;
  const g = golpe(golpeId), nome = nomeCri(c);
  if (c.golpes.some((x) => x.id === golpeId)) { await informar(`${nome} já sabe ${g.nome}.`); return false; }
  if (c.golpes.length < 4) { aprenderGolpe(c, golpeId); som('item-obtido'); await informar(`${nome} aprendeu ${g.nome}!`); return true; }
  const i = await perguntar(`${nome} quer aprender ${g.nome}, mas já sabe 4 golpes. Esquecer qual?`, [...c.golpes.map((x) => golpe(x.id).nome), 'Não aprender'], 4);
  if (i < 0 || i >= c.golpes.length) { await informar(`${nome} não aprendeu ${g.nome}.`); return false; }
  const velho = golpe(c.golpes[i].id).nome;
  aprenderGolpe(c, golpeId, i); som('item-obtido');
  await informar(`1, 2 e… pronto! ${nome} esqueceu ${velho} e aprendeu ${g.nome}!`);
  return true;
}
/** roda a evolução (cinemática da tela 'evolucao', se existir) e trata os golpes novos. true = evoluiu */
export async function evoluirCom(c: CriaturaInst, para: number): Promise<boolean> {
  const de = c.especie, antes = nomeCri(c);
  let cancelou = false;
  if (temTela('evolucao')) {
    cancelou = await new Promise<boolean>((ok) => {
      let feito = false;
      const t = telas.empilhar(criarTela('evolucao', { criatura: c, de, para, concluir: (x: boolean) => { if (feito) return; feito = true; telas.desempilhar(t); ok(!!x); } }));
    });
  } else { som('evolucao'); await informar(`O quê? ${antes} está evoluindo!`); }
  if (cancelou) { await informar(`${antes} parou de evoluir.`); return false; }
  const pendentes = evoluir(c, para);
  marcarCapturado(para); bus.emit('evoluiu', { uid: c.uid, de, para });
  await informar(`Parabéns! ${antes} evoluiu para ${nomeEsp(para)}!`);
  for (const g of pendentes) await ensinar(c, g);
  return true;
}
/** aplica um item numa criatura da equipe. Pode abrir janelas (escolha de golpe, evolução). */
export async function usarItemEm(id: string, c: CriaturaInst): Promise<ResultadoUso> {
  const it: ItemInfo = itemDef(id), u = it.uso, nome = nomeCri(c);
  if (!u) return nada('Este item não se usa numa criatura.');
  if (c.ovo) return nada('O ovo ainda não pode usar isso.');
  if (!esp(c.especie)) return nada();
  const max = atributos(c).vida;
  if (u.golpe) {
    if (!esp(c.especie)!.pergaminhos.includes(id)) return nada(`${nome} não consegue aprender ${golpe(u.golpe).nome}.`);
    const ok = await ensinar(c, u.golpe);
    return { ok, msg: '', gasta: false };
  }
  if (u.evolui) {
    const ev = podeEvoluir(c, { item: id, periodo: periodo() });
    if (!ev) return nada(`A ${it.nome} não reage a ${nome}.`);
    const ok = await evoluirCom(c, ev.para);
    return { ok, msg: '', gasta: ok };
  }
  if (u.nivel) {
    if (c.nivel >= 100) return nada(`${nome} já está no nível máximo.`);
    const curva = esp(c.especie)!.crescimento;
    const subidas = ganharExp(c, Math.max(1, expParaNivel(curva, c.nivel + 1) - c.exp));
    som('subir-nivel');
    await informar(`${nome} subiu para o nível ${c.nivel}!`);
    for (const s of subidas) for (const g of s.golpes) if (!c.golpes.some((x) => x.id === g)) await ensinar(c, g); else await informar(`${nome} aprendeu ${golpe(g).nome}!`);
    const ev = podeEvoluir(c, { periodo: periodo() });
    if (ev) await evoluirCom(c, ev.para);
    return { ok: true, msg: '', gasta: true };
  }
  if (u.esforco) {
    // vitaminas da Gincana (src/data/itens.ts): esforço num atributo, até o teto só com vitaminas e o teto geral da batalha
    const { stat, qtd, teto } = u.esforco, total = Object.values(c.esf).reduce((x, y) => x + y, 0);
    const n = Math.min(qtd, teto - c.esf[stat], 252 - c.esf[stat], 510 - total);
    if (n <= 0) return nada(`A vitamina não faz mais efeito em ${nome}.`);
    const antes = atributos(c).vida; c.esf[stat] += n;
    if (stat === 'vida' && c.vida > 0) c.vida = Math.min(atributos(c).vida, c.vida + atributos(c).vida - antes);
    mudarAmizade(c, 2); som('cura-posto');
    return { ok: true, msg: `${nome} tomou a vitamina e ficou mais forte!`, gasta: true };
  }
  if (u.amizade) {
    if (c.amizade >= 255) return nada(`${nome} já é sua amiga do peito.`);
    mudarAmizade(c, u.amizade); return { ok: true, msg: `${nome} adorou! Ficou mais amiga.`, gasta: true };
  }
  let fez = false; const partes: string[] = [];
  if (u.reanima) {
    if (c.vida > 0) return nada(`${nome} não está desmaiada.`);
    c.vida = Math.max(1, Math.floor((max * u.reanima) / 100)); c.status = null; fez = true; partes.push(`${nome} voltou a si!`);
  } else if (c.vida <= 0) return nada(`${nome} está desmaiada.`);
  if (u.cura && c.vida < max) { const antes = c.vida; c.vida = u.cura === 'total' ? max : Math.min(max, c.vida + u.cura); fez = true; partes.push(`${nome} recuperou ${c.vida - antes} de vida.`); }
  if (u.curaStatus && c.status && (u.curaStatus === 'todos' || u.curaStatus.includes(c.status))) { const s = NOME_STATUS[c.status].toLowerCase(); c.status = null; delete c.sonoTurnos; fez = true; partes.push(`${nome} não está mais ${s}.`); }
  if (u.pg) {
    const faltam = c.golpes.filter((g) => g.pg < g.pgMax);
    if (faltam.length) {
      if (u.pgTodos) { for (const g of c.golpes) g.pg = g.pgMax; fez = true; partes.push(`Os PG de ${nome} foram restaurados.`); }
      else {
        const i = await perguntar('Restaurar os PG de qual golpe?', [...c.golpes.map((g) => `${golpe(g.id).nome}  ${g.pg}/${g.pgMax}`), 'Desistir']);
        const g = c.golpes[i];
        if (g && g.pg < g.pgMax) { g.pg = Math.min(g.pgMax, g.pg + u.pg); fez = true; partes.push(`${golpe(g.id).nome} recuperou PG.`); }
        else if (g) return nada(`${golpe(g.id).nome} já está com todos os PG.`);
        else return { ok: false, msg: '', gasta: false };
      }
    }
  }
  if (!fez) return nada();
  if (it.bolso === 'remedios') amizadePor(c, 'remedio');
  som('cura-posto');
  return { ok: true, msg: partes.join(' '), gasta: true };
}
/** o item pede a escolha de uma criatura da equipe? */
export const itemPedeCriatura = (it: ItemInfo) => { const u = it.uso; return !!u && !!(u.cura || u.curaStatus || u.reanima || u.pg || u.nivel || u.amizade || u.evolui || u.golpe || u.esforco); };
/** nome curto do local guardado no save */
export const tempoRelogio = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
export { jogo };
