/**
 * Kit de interface em pixel art: molduras 9-slice, sprites do atlas, barras, ícones, cursor de mão e botões.
 * Tudo em px nativos inteiros. Ver src/ui/README.md.
 */
import kit from './gerado/kit.json';
import type { Bolso, StatusId, TipoId } from '../core/tipos';
import { precarregar } from '../core/assets';
import { texto, em, type CorTexto, type Tamanho } from './fonte';
export { em } from './fonte';

export type TipoMoldura = 'madeira' | 'cipo' | 'azulejo' | 'texto' | 'placa' | 'tinta' | 'botao' | 'botao-foco' | 'botao-ap' | 'trilho' | 'selecao' | 'bisel';
type Ret = [number, number, number, number];
const SPR = kit.sprites as unknown as Record<string, Ret>;
const MOL = kit.molduras as unknown as Record<string, { fatia: number; centro: string | null; h: string; v: string; c?: string }>;
export const PALETA = kit.paleta as Record<string, string>;
export const CORES_TIPO = kit.coresTipo as unknown as Record<TipoId, [string, string, string]>;
export const NOME_TIPO: Record<TipoId, string> = { comum: 'Comum', mata: 'Mata', brasa: 'Brasa', rio: 'Rio', trovao: 'Trovão', geada: 'Geada', ginga: 'Ginga', veneno: 'Veneno', terra: 'Terra', vento: 'Vento', mente: 'Mente', inseto: 'Inseto', pedra: 'Pedra', assombro: 'Assombro', lenda: 'Lenda', ferro: 'Ferro', encanto: 'Encanto' };
export const NOME_INSIGNIA = ['Pena', 'Casulo', 'Concha', 'Folha', 'Barro', 'Estrela', 'Raio', 'Lamparina', 'Cristal', 'Chama', 'Berimbau', 'Engrenagem', 'Espinho', 'Floco', 'Olho', 'Escama'];
export const NOME_STATUS: Record<StatusId | 'desmaiado', string> = { queimado: 'Queimado', envenenado: 'Envenenado', paralisado: 'Paralisado', dormindo: 'Dormindo', congelado: 'Congelado', encantado: 'Encantado', desmaiado: 'Desmaiado' };
export const NOME_BOLSO: Record<Bolso, string> = { itens: 'Itens', remedios: 'Remédios', cuias: 'Cuias', pergaminhos: 'Pergaminhos', frutos: 'Frutos', chave: 'Itens-chave' };

/** injeta o CSS que depende do índice gerado (folhas de fonte, atlas, molduras) e pré-carrega as imagens */
export function iniciarKit(): Promise<unknown> {
  let css = '';
  for (const [t, f] of Object.entries(kit.fontes)) css += `.g${t}{position:absolute;height:${f.ch}px;background-image:url(${f.src});background-repeat:no-repeat}`;
  css += `.k,.mol>.mq{background-image:url(${kit.atlas.src});background-repeat:no-repeat}`;
  for (const [n, m] of Object.entries(MOL)) {
    const s = m.fatia, c = (p: string) => { const [x, y] = SPR[`mol-${n}-${p}`]; return `background-position:-${x}px -${y}px;width:${s}px;height:${s}px;`; };
    css += `.mol-${n}>.nw{${c('nw')}left:0;top:0}.mol-${n}>.ne{${c('ne')}right:0;top:0}.mol-${n}>.sw{${c('sw')}left:0;bottom:0}.mol-${n}>.se{${c('se')}right:0;bottom:0}`;
    css += `.mol-${n}>.mn,.mol-${n}>.ms{left:${s}px;right:${s}px;height:${s}px;background:url(${m.h}) 0 0 repeat-x}.mol-${n}>.mn{top:0}.mol-${n}>.ms{bottom:0;background-position:0 -${s}px}`;
    css += `.mol-${n}>.mo,.mol-${n}>.ml{top:${s}px;bottom:${s}px;width:${s}px;background:url(${m.v}) 0 0 repeat-y}.mol-${n}>.mo{left:0}.mol-${n}>.ml{right:0;background-position:-${s}px 0}`;
    css += `.mol-${n}>.mc{left:${s}px;top:${s}px;right:${s}px;bottom:${s}px;${m.c ? `background:url(${m.c})` : m.centro ? `background:${m.centro}` : ''}}`;
  }
  const st = document.createElement('style'); st.textContent = css; document.head.append(st);
  return Promise.all([kit.atlas.src, ...Object.values(kit.fontes).map((f) => f.src), ...Object.keys(kit.camadas).map((n) => `assets/ui/camadas/${n}.png`)].map(precarregar));
}

/** sprite do atlas do kit (nomes em src/ui/README.md) */
export function spr(nome: string, classe = ''): HTMLElement {
  const el = document.createElement('div'); el.className = 'k ' + classe;
  trocarSpr(el, nome); return el;
}
export function trocarSpr(el: HTMLElement, nome: string) {
  const r = SPR[nome]; if (!r) throw new Error('sprite de UI desconhecido: ' + nome);
  el.style.width = r[2] + 'px'; el.style.height = r[3] + 'px'; el.style.backgroundPosition = `-${r[0]}px -${r[1]}px`;
}
export const tamanhoSpr = (nome: string): [number, number] => [SPR[nome][2], SPR[nome][3]];
/** camada grande/repetível (assets/ui/camadas): devolve url e tamanho */
export function camada(nome: string): { url: string; w: number; h: number } { const [w, h] = (kit.camadas as unknown as Record<string, number[]>)[nome]; return { url: `assets/ui/camadas/${nome}.png`, w, h }; }

const PARTES = ['mc', 'mn', 'ms', 'mo', 'ml', 'mq nw', 'mq ne', 'mq sw', 'mq se'];
/** moldura 9-slice. O conteúdo é anexado direto no elemento devolvido (coordenadas a partir do canto da moldura). */
export function moldura(tipo: TipoMoldura, w: number, h: number, x?: number, y?: number): HTMLElement {
  const el = document.createElement('div'); el.className = 'mol mol-' + tipo;
  el.innerHTML = PARTES.map((p) => `<b class="${p}"></b>`).join('');
  el.style.width = w + 'px'; el.style.height = h + 'px';
  if (x != null) { el.style.left = x + 'px'; el.style.top = (y ?? 0) + 'px'; }
  return el;
}
export function trocarMoldura(el: HTMLElement, tipo: TipoMoldura) { el.className = el.className.replace(/mol-[a-z-]+/, 'mol-' + tipo); }
export const fatiaDe = (tipo: TipoMoldura) => MOL[tipo].fatia;

/** cursor de mão animado (aponta para a direita); posicione com `em(cursor, x, y)` */
export function cursorMao(): HTMLElement { const c = document.createElement('div'); c.className = 'cursor-mao'; c.append(spr('cursor')); return c; }
export const seta = (dir: 'cima' | 'baixo' | 'esq' | 'dir', pisca = false) => spr('seta-' + dir, pisca ? 'pisca' : '');
export const iconeTipo = (t: TipoId) => spr('tipo-' + t);
export const iconeStatus = (s: StatusId | 'desmaiado', mini = false) => spr(`status-${s}${mini ? '-mini' : ''}`);
/** insígnia 1..16; `tem = false` mostra a silhueta */
export const insignia = (n: number, tem = true) => spr(`insignia-${n}${tem ? '' : '-vazia'}`);
export const iconeBolso = (b: Bolso) => spr('bolso-' + b);

/** etiqueta de tipo: ícone 12×12 + nome sobre a cor do tipo */
export function chipTipo(t: TipoId, largura = 50): HTMLElement {
  const [base, escura] = CORES_TIPO[t];
  const el = document.createElement('div'); el.className = 'chip-tipo';
  el.style.cssText = `width:${largura}px;height:12px;background:${base};box-shadow:inset -1px -1px 0 ${escura}`;
  el.append(em(iconeTipo(t), 0, 0), em(texto(NOME_TIPO[t].toUpperCase(), { sombra: true }), 14, 2));
  return el;
}

/** botão do kit com rótulo; `definirFoco`/`definirApertado` trocam a moldura */
export function botao(rotulo: string, largura?: number, o: { tamanho?: Tamanho; cor?: CorTexto } = {}) {
  const t = texto(rotulo, { tamanho: o.tamanho ?? 8, cor: o.cor ?? 'tinta' });
  const w = largura ?? parseInt(t.style.width) + 12, h = (o.tamanho ?? 8) === 12 ? 18 : 14;
  const el = moldura('botao', w, h);
  el.classList.add('botao');
  el.append(em(t, Math.floor((w - parseInt(t.style.width)) / 2), (o.tamanho ?? 8) === 12 ? 2 : 3));
  return { el, definirFoco(f: boolean) { trocarMoldura(el, f ? 'botao-foco' : 'botao'); }, definirApertado(a: boolean) { trocarMoldura(el, a ? 'botao-ap' : 'botao'); } };
}

export interface Barra { el: HTMLElement; /** fração 0..1; `animar` faz o enchimento andar 1 px por vez em `atualizar` */ definir(frac: number, animar?: boolean): void; /** devolve true enquanto ainda está andando */ atualizar(dt: number): boolean; readonly px: number; readonly largura: number }
/**
 * Barra de vida (verde → amarelo → vermelho, em passos de 1 px) ou de experiência.
 * `largura` é a largura total com o trilho; a de vida tem 6 px de altura e a de experiência 4.
 */
export function barra(tipo: 'vida' | 'exp', largura: number, aoAndar?: (px: number, max: number) => void): Barra {
  const h = tipo === 'vida' ? 6 : 4, max = largura - 2;
  const el = moldura('trilho', largura, h); el.classList.add('barra');
  const ench = document.createElement('div'); ench.className = 'barra-ench ' + tipo; el.append(ench);
  let alvo = max, atual = max, acc = 0;
  const pintar = () => {
    ench.style.width = atual + 'px';
    if (tipo === 'vida') { const f = atual / max; ench.className = 'barra-ench vida ' + (f > 0.5 ? 'verde' : f > 0.2 ? 'amarelo' : 'vermelho'); }
  };
  pintar();
  return {
    el, largura: max,
    get px() { return atual; },
    definir(frac, animar = false) { alvo = Math.max(0, Math.min(max, frac > 0 ? Math.max(1, Math.round(frac * max)) : 0)); if (!animar) { atual = alvo; pintar(); } },
    atualizar(dt) {
      if (atual === alvo) return false;
      acc += dt * 45; // 45 px por segundo
      while (acc >= 1 && atual !== alvo) { acc -= 1; atual += atual < alvo ? 1 : -1; pintar(); aoAndar?.(atual, max); }
      return atual !== alvo;
    },
  };
}

/** fileira das 16 insígnias em miniatura (8 por linha) para saves e perfil */
export function fileiraInsignias(tem: number[], porLinha = 8, passo = 17): HTMLElement {
  const el = document.createElement('div'); el.className = 'fileira';
  el.style.width = porLinha * passo + 'px'; el.style.height = Math.ceil(16 / porLinha) * passo + 'px';
  for (let n = 1; n <= 16; n++) el.append(em(insignia(n, tem.includes(n)), ((n - 1) % porLinha) * passo, Math.floor((n - 1) / porLinha) * passo));
  return el;
}
/** tempo de jogo "12:05" a partir de segundos */
export const fmtTempo = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
/** som de interface pelo barramento (o áudio escuta 'sfx') */
import { bus } from '../core/events';
export const som = (id: 'ui-mover' | 'ui-ok' | 'ui-voltar' | 'ui-erro' | 'texto' | 'salvar' | string) => bus.emit('sfx', { id });
