/**
 * HUD do mapa (discreto, canto superior direito, dentro da tela do mundo): relógio com sol/lua do período, clima
 * da zona e o ícone do Amuleto de Campo quando há um obstáculo à frente.
 * Escuta o barramento: 'zona' { id } (troca o clima e prende o HUD à cena), 'clima' { id } (clima mudou durante a
 * visita) e 'obstaculo' { amuleto: AmuletoId | null, pode?: boolean } (mostra/esconde o ícone; `pode: false` = falta
 * a parceira do tipo certo, o ícone fica apagado). A placa com o nome da zona é do mundo (`avisar`), não daqui.
 */
import type { AmuletoId, ClimaId, TipoId } from '../core/tipos';
import { jogo, minutosAgora, periodo } from '../core/estado';
import { bus } from '../core/events';
import { telas } from './telas';
import { texto, escrever, em } from './fonte';
import { moldura, spr, trocarSpr, iconeTipo } from './kit';
import { pix, caixa, tempoRelogio } from './telas/comum';
import { zona, dadosProntos } from './telas/dados';

const CLIMA: Partial<Record<ClimaId, { g: string[]; p: Record<string, string>; nome: string }>> = {
  chuva: { nome: 'Chuva', g: ['..wwww...', '.wwwwwww.', 'wwwwwwwww', '.wwwwwww.', '.........', '.a..a..a.', 'a..a..a..', '.........', '.a..a..a.'], p: { w: '#c4c6d4', a: '#6fc7e8' } },
  garoa: { nome: 'Garoa', g: ['..wwww...', '.wwwwwww.', 'wwwwwwwww', '.wwwwwww.', '.........', '..a...a..', '.........', '.a...a...', '.........'], p: { w: '#c4c6d4', a: '#6fc7e8' } },
  nevoa: { nome: 'Névoa', g: ['.........', '.wwwwww..', '.........', '..wwwwwww', '.........', 'wwwwww...', '.........', '..wwwww..', '.........'], p: { w: '#c8f0f4' } },
  poeira: { nome: 'Poeira', g: ['.........', '..a...a..', '.a.aaa...', '...a..aa.', '.aa..a...', '....aa..a', '.a.a.....', '...a..a..', '.........'], p: { a: '#e8c07a' } },
  sol: { nome: 'Sol forte', g: ['....a....', '.a.....a.', '...aaa...', '..aaaaa..', 'a.aaaaa.a', '..aaaaa..', '...aaa...', '.a.....a.', '....a....'], p: { a: '#f9c22b' } },
};
const MEDALHAO = ['...kkkkkk...', '..kooooook..', '.kollllllok.', 'kol......lok', 'kol......lok', 'kol......lok', 'kol......lok', 'kol......lok', 'kol......lok', '.kollllllok.', '..kooooook..', '...kkkkkk...'];
const AMULETO: Record<AmuletoId, { nome: string; tipo: TipoId }> = {
  facao: { nome: 'Facão', tipo: 'mata' }, remo: { nome: 'Remo', tipo: 'rio' }, forca: { nome: 'Força', tipo: 'terra' }, lampiao: { nome: 'Lampião', tipo: 'brasa' }, 'quebra-pedra': { nome: 'Quebra-pedra', tipo: 'pedra' },
  escalar: { nome: 'Escalar', tipo: 'ginga' }, cachoeira: { nome: 'Cachoeira', tipo: 'rio' }, mergulho: { nome: 'Mergulho', tipo: 'rio' }, voo: { nome: 'Voo', tipo: 'vento' }, faro: { nome: 'Faro', tipo: 'comum' },
};

let raiz: HTMLElement | null = null, tHora: HTMLElement, astro: HTMLElement, cxClima: HTMLElement, cxAmuleto: HTMLElement, iniciado = false, climaAtual: ClimaId = 'limpo';
function montar() {
  raiz = caixa('hud-mapa', 0, 0); raiz.style.zIndex = '50'; raiz.style.pointerEvents = 'none';
  const rel = moldura('tinta', 48, 16, 270, 2); astro = spr('sol'); tHora = texto('', { cor: 'creme' }); rel.append(em(astro, 3, 2), em(tHora, 18, 4));
  cxClima = moldura('tinta', 17, 17, 301, 19); cxAmuleto = moldura('tinta', 18, 18, 300, 38); cxClima.style.display = 'none'; cxAmuleto.style.display = 'none';
  raiz.append(rel, cxClima, cxAmuleto);
}
function relogio() { if (!raiz) return; escrever(tHora, tempoRelogio(minutosAgora())); trocarSpr(astro, periodo() === 'noite' ? 'lua' : 'sol'); }
function pintarClima(c: ClimaId | undefined) {
  climaAtual = c ?? 'limpo'; const d = CLIMA[climaAtual];
  cxClima.replaceChildren(...[...cxClima.children].filter((x) => x.tagName === 'B'));
  cxClima.style.display = d ? '' : 'none'; if (d) cxClima.append(em(pix(d.g, d.p), 4, 4));
  cxAmuleto.style.top = (d ? 38 : 19) + 'px';
}
function pintarAmuleto(id: AmuletoId | null | undefined, pode = true) {
  const a = id ? AMULETO[id] : undefined;
  cxAmuleto.replaceChildren(...[...cxAmuleto.children].filter((x) => x.tagName === 'B'));
  cxAmuleto.style.display = a ? '' : 'none'; if (!a) return;
  const t = texto(a.nome, { cor: pode ? 'amarelo' : 'cinza', sombra: true }), w = parseInt(t.style.width) + 26;
  cxAmuleto.style.width = w + 'px'; cxAmuleto.style.left = 318 - w + 'px';
  const ic = iconeTipo(a.tipo); if (!pode) ic.style.opacity = '0.45';
  cxAmuleto.append(em(pix(MEDALHAO, { k: '#1a1423', o: '#f9c22b', l: '#fff07a' }), 3, 3), em(ic, 3, 3), em(t, 19, 5));
  cxAmuleto.classList.toggle('pisca-lento', pode);
}
/** prende o HUD à tela do mundo (a cena marca `data-zona` no próprio elemento) */
function prender() {
  const cena = document.querySelector<HTMLElement>('[data-zona]'); if (!cena || !raiz) return;
  const pai = cena.closest<HTMLElement>('.tela') ?? cena;
  if (raiz.parentElement !== pai) pai.append(raiz);
  if (!vigia && telas.raiz) { vigia = new MutationObserver(visibilidade); vigia.observe(telas.raiz, { childList: true }); }
  visibilidade();
}
let vigia: MutationObserver | null = null;
/** o HUD só aparece com o mapa no topo da pilha (menus, batalha e diálogos escondem) */
function visibilidade() {
  if (!raiz) return;
  const dona = telas.pilha.find((t) => t.el.contains(raiz));
  raiz.style.display = (dona ? telas.topo === dona : telas.pilha.length <= 1) ? '' : 'none';
}
/** liga o HUD ao barramento (chamado uma vez por src/ui/telas/registro.ts) */
export function iniciarHud() {
  if (iniciado || typeof document === 'undefined') return; iniciado = true;
  montar(); relogio();
  setInterval(relogio, 5000);
  bus.on('zona', (d: { id?: string } | undefined) => {
    const id = d?.id ?? jogo.save.jogador.zona;
    prender(); relogio(); pintarAmuleto(null);
    const z = zona(id); pintarClima(z?.clima ?? (z?.nevoa ? 'nevoa' : 'limpo'));
    if (!z) void dadosProntos.then(() => { if (jogo.save.jogador.zona === id) { const q = zona(id); pintarClima(q?.clima ?? (q?.nevoa ? 'nevoa' : 'limpo')); } });
  });
  bus.on('clima', (d: { id?: ClimaId } | ClimaId | undefined) => pintarClima(typeof d === 'string' ? d : d?.id));
  bus.on('obstaculo', (d: { amuleto?: AmuletoId | null; id?: AmuletoId | null; pode?: boolean } | null | undefined) => pintarAmuleto(d?.amuleto ?? d?.id ?? null, d?.pode !== false));
}
export const hudClima = () => climaAtual;
