/** NPCs do mapa: parado / vagar / olhar / rota, treinadores com linha de visão, lojas e guardas de portão. */
import type { NpcDef, Dir, TreinadorDef } from '../core/tipos';
import { cond, flag, setFlag, jogo } from '../core/estado';
import { rng } from '../core/rng';
import { bus } from '../core/events';
import { Ator } from './ator';
import { M, atorEm, quadros, sfx, type NpcVivo } from './vivo';
import { DX, DY, OPOSTO } from './zonas';
import { treinador, falar, abrirTela, criarCriatura } from './deps';
import { lutar } from './encontros';
import { rodarEvento } from './eventos';

const DIRS: Dir[] = ['n', 's', 'l', 'o'];
const chaveOculto = (id: string) => `oculto:${M.zv.def.id}:${id}`;
export const flagVitoria = (t: TreinadorDef) => t.flag ?? 'venceu:' + t.id;
const existe = (d: NpcDef) => cond(d.se) && !flag(chaveOculto(d.id));

function criar(d: NpcDef): NpcVivo {
  const ator = new Ator(d.sprite, M.cena.sprites, d.x, d.y, d.dir ?? 's');
  return { id: d.id, def: d, ator, ox: d.x, oy: d.y, espera: rng.int(40, 160), rotaI: 0, treinador: d.treinador ? treinador(d.treinador) : undefined };
}
/** cria/remove NPCs e guardas conforme as condições atuais (`se`, flags de oculto, `requer` dos portões) */
export function sincronizarNpcs() {
  const z = M.zv.def;
  for (const d of z.npcs ?? []) {
    const i = M.npcs.findIndex((n) => n.id === d.id), ok = existe(d);
    if (ok && i < 0 && !(M.jog && M.jog.x === d.x && M.jog.y === d.y)) M.npcs.push(criar(d));
    else if (!ok && i >= 0) { M.npcs[i].ator.remover(); M.npcs.splice(i, 1); }
  }
  for (const p of z.portoes ?? []) {
    const i = M.guardas.findIndex((g) => g.p === p), fechado = !cond(p.requer);
    if (fechado && i < 0 && p.sprite) M.guardas.push({ p, ator: new Ator(p.sprite, M.cena.sprites, p.x, p.y, 's') });
    else if (!fechado && i >= 0) { M.guardas[i].ator.remover(); M.guardas.splice(i, 1); }
  }
}
export function limparNpcs() { for (const n of M.npcs) n.ator.remover(); for (const g of M.guardas) g.ator.remover(); M.npcs = []; M.guardas = []; }
export function ocultarNpc(id: string, oculto: boolean) { setFlag(chaveOculto(id), oculto); sincronizarNpcs(); }

const podePisar = (x: number, y: number, a: Ator) => M.zv.chao(x, y) && !M.zv.warp(x, y) && !atorEm(x, y, a);
export function atualizarNpcs() {
  if (M.ocupado) return;
  for (const n of M.npcs) {
    const a = n.ator, mov = n.def.mov ?? 'parado';
    if (a.movendo || mov === 'parado') continue;
    if (--n.espera > 0) continue;
    if (mov === 'vagar') {
      n.espera = rng.int(50, 170);
      const d = rng.escolha(DIRS), x = a.x + DX[d], y = a.y + DY[d];
      if (Math.abs(x - n.ox) <= 2 && Math.abs(y - n.oy) <= 2 && podePisar(x, y, a)) void a.mover(d, 20); else a.virar(d);
    } else if (mov === 'olhar') {
      n.espera = rng.int(80, 200);
      a.virar(rng.escolha(DIRS));
      checarVisaoAgora();
    } else if (mov === 'rota' && n.def.rota?.length) {
      const d = n.def.rota[n.rotaI % n.def.rota.length];
      if (podePisar(a.x + DX[d], a.y + DY[d], a)) { n.rotaI++; n.espera = 6; void a.mover(d, 16, {}, checarVisaoAgora); } else { a.virar(d); n.espera = 20; }
    }
  }
}

/* ------------------------------ treinadores ------------------------------ */
/** treinador não vencido que enxerga o jogador em linha reta e sem obstáculo */
export function quemVe(): NpcVivo | undefined {
  const j = M.jog;
  for (const n of M.npcs) {
    const t = n.treinador; if (!t || flag(flagVitoria(t)) || n.ator.movendo) continue;
    const a = n.ator, alcance = n.def.visao ?? 4;
    for (let k = 1; k <= alcance; k++) {
      const x = a.x + DX[a.dir] * k, y = a.y + DY[a.dir] * k;
      if (x === j.x && y === j.y) return n;
      if (!M.zv.chao(x, y) || atorEm(x, y, a)) break;
    }
  }
  return undefined;
}
function checarVisaoAgora() {
  if (M.ocupado || M.jog.movendo || !jogo.save.equipe.length) return;
  const n = quemVe();
  if (n) { M.ocupado++; void abordagem(n).finally(() => M.ocupado--); }
}
/** "!" sobre a cabeça, caminhada até o jogador e desafio */
export async function abordagem(n: NpcVivo) {
  const a = n.ator, j = M.jog;
  sfx('ui-erro'); a.emote('!', 40);
  await quadros(40);
  while (Math.abs(a.x - j.x) + Math.abs(a.y - j.y) > 1) await a.mover(a.dir, 12);
  j.virar(OPOSTO[a.dir]);
  await desafiar(n.treinador!, n);
}
export async function desafiar(t: TreinadorDef, n?: NpcVivo, extra: { semDerrota?: boolean } = {}): Promise<boolean> {
  const quem = { nome: `${t.classe} ${t.nome}`, retrato: t.sprite };
  await falar(t.desafio, quem);
  const inimigos = t.equipe.map((m) => criarCriatura(m.e, m.nv, m.item ? { item: m.item } : undefined));
  const r = await lutar({ tipo: 'treinador', inimigos, treinador: t, arena: M.zv.def.arena, clima: M.zv.def.clima, dupla: t.dupla, musica: t.musica, ...extra });
  if (r.resultado !== 'vitoria') return false;
  setFlag(flagVitoria(t));
  if (t.insignia && !jogo.save.insignias.includes(t.insignia)) { jogo.save.insignias.push(t.insignia); bus.emit('insignia', t.insignia); }
  bus.emit('treinador-vencido', { id: t.id });
  if (n) n.ator.olharPara(M.jog.x, M.jog.y);
  return true;
}

export async function interagirNpc(n: NpcVivo) {
  const d = n.def, t = n.treinador;
  n.ator.olharPara(M.jog.x, M.jog.y);
  if (t && !flag(flagVitoria(t))) {
    if (jogo.save.equipe.length) { await desafiar(t, n); return; }
  } else if (t && !d.script && !d.fala) { await falar(t.depois ?? t.derrota, { nome: `${t.classe} ${t.nome}`, retrato: t.sprite }); return; }
  if (d.script) { await rodarEvento(d.script); return; }
  const nome = (d as NpcDef & { nome?: string }).nome;
  for (const f of d.fala ?? []) await falar(f, { nome, retrato: d.sprite });
  if (d.loja) await abrirTela('loja', { itens: d.loja });
}
