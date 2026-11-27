/**
 * Pontes entre o mundo, os menus e a batalha: ícone de Amuleto no HUD (`bus 'obstaculo'`), contatos do Rádio Cipó
 * depois das batalhas, itens-chave dos Amuletos (para o menu poder usá-los) e a derrota fora do fluxo do mapa
 * (revanche pelo rádio).
 */
import type { AmuletoId, TreinadorDef } from '../core/tipos';
import { jogo, qtdItem, darItem } from '../core/estado';
import { bus } from '../core/events';
import { telas } from '../ui/telas';
import { M, ajudante, ocupar } from './vivo';
import { DX, DY } from './zonas';
import { treinador, avisar, item as itemDef } from './deps';
import { derrota } from './encontros';
import { tr, classeDe } from '../i18n';

/* ------------------------------ obstáculo à frente → HUD ------------------------------ */
let ultimo = '';
function obstaculoAFrente(): AmuletoId | null {
  if (M.ocupado || M.jog.movendo) return null;
  const j = M.jog, z = M.zv, x = j.x + DX[j.dir], y = j.y + DY[j.dir], ch = z.ch(x, y), modo = jogo.save.jogador.modo;
  if (ch === 'c') return 'facao';
  if (ch === 'r') return 'quebra-pedra';
  if (ch === 'p') return M.forca ? null : 'forca';
  if (ch === 'e' && modo !== 'remo') return 'escalar';
  if (modo === 'remo' && ch === 'w' && j.dir === 'n') return 'cachoeira';
  if ((modo === 'remo' && z.ch(j.x, j.y) === 'd') || (modo === 'mergulho' && !!z.warp(j.x, j.y))) return 'mergulho';
  if ((modo === 'pe' || modo === 'bike') && z.agua(x, y)) return 'remo';
  return null;
}
/** chamado a cada quadro do mapa: avisa o HUD só quando o obstáculo à frente muda */
export function vigiarObstaculo() {
  const id = obstaculoAFrente(), pode = id ? !!ajudante(id) : false, chave = id ? `${id}:${pode}` : '';
  if (chave === ultimo) return;
  ultimo = chave;
  bus.emit('obstaculo', { amuleto: id, pode });
}
bus.on('zona', () => { ultimo = ''; garantirItensDeAmuleto(); });

/* ------------------------------ Amuletos como itens-chave ------------------------------ */
/** cada Amuleto de Campo tem um item-chave na Mochila (é por ele que o menu usa Voo, Faro e Lampião) */
export function garantirItensDeAmuleto() {
  for (const a of jogo.save.amuletos) { const id = 'amuleto-' + a; if (itemDef(id) && !qtdItem(id)) darItem(id); }
}

/* ------------------------------ contatos do Rádio Cipó ------------------------------ */
/** quem passa o número depois de vencido: `contato` no treinador decide; sem ele, líderes, a rival e cerca de 1 em 3 treinadores comuns */
export function daContato(t: TreinadorDef): boolean {
  if (t.contato !== undefined) return t.contato;
  if (t.ia === 'conselho' || /cartel|capang|ferrugem|recruta|mestre|campe/i.test(t.classe)) return false;
  if (t.insignia !== undefined || /rival/i.test(t.classe)) return true;
  let h = 0; for (const ch of t.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 3 === 0;
}
bus.on('treinador-vencido', (d: { id?: string } | undefined) => {
  const t = d?.id ? treinador(d.id) : undefined, c = jogo.save.contatos;
  if (!t || c.includes(t.id) || !qtdItem('radio-cipo') || !daContato(t)) return;
  c.push(t.id);
  avisar(tr('{classe} {nome} deixou o número no seu Rádio Cipó!', { classe: classeDe(t), nome: t.nome }));
  bus.emit('contato', { id: t.id });
});

/* ------------------------------ derrota fora do fluxo do mapa ------------------------------ */
/** derrota numa batalha iniciada por um menu (revanche do rádio): fecha o que estiver sobre o mapa e leva ao último Posto */
export async function derrotaNoCampo() {
  const base = telas.pilha.findIndex((t) => t.el === M.cena.el);
  if (base < 0) return;
  while (telas.pilha.length > base + 1) telas.desempilhar();
  await ocupar(() => derrota());
}
