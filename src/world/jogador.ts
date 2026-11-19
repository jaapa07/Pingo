/** Jogador: movimento em grade (andar, correr, bicicleta, remar, mergulhar), saliências, gelo, lama, correnteza, warps e gatilhos. */
import type { Dir, Warp, Gatilho } from '../core/tipos';
import { jogo, cond, flag, setFlag } from '../core/estado';
import { rng } from '../core/rng';
import { M, ocupar, sfx, atorEm, quadros } from './vivo';
import { DX, DY, SALIENCIA, zonaDef, zonaExiste, AVISO_EM_OBRAS } from './zonas';
import { entrada, falar, abrirTela } from './deps';
import type { OpMover } from './ator';
import { mecanicas, cinematicas } from './registro';
import { interagir, atalho, empurrar, itemBloqueia, subirCascata } from './campo';
import { quemVe, abordagem } from './npcs';
import { tentarEncontro, passoDaEquipe } from './encontros';
import { rodarEvento } from './eventos';
import { irPara } from './index';
import { MAPA_B_ABERTO, EM_OBRAS } from '../core/progresso';
import { seguirParceira, recolherParceira, passoDaParceira } from './parceira';

export const baseDoModo = (correndo: boolean) => ({ pe: correndo ? 'correr' : 'andar', bike: 'bike', remo: 'remar', mergulho: 'mergulhar' })[jogo.save.jogador.modo];
/** trem/saveiro que leva para fora do mapa A enquanto o mapa B não abre (src/core/progresso.ts) */
const emObras = (w: Warp) => !MAPA_B_ABERTO && (w.tipo === 'trem' || w.tipo === 'saveiro') && zonaDef(w.para.zona)?.mapa !== 'A';
const ehEntrada = (w: Warp | undefined) => !!w && w.tipo !== 'borda' && w.tipo !== 'buraco' && w.tipo !== undefined;
/** o jogador pode pisar em (x, y) a pé? (chão livre ou tile de porta/escada/caverna) */
const pisavel = (x: number, y: number) => (M.zv.chao(x, y) || (ehEntrada(M.zv.warp(x, y)) && M.zv.dentro(x, y) && !M.zv.agua(x, y))) && !itemBloqueia(x, y);

function salvarPos() { const s = jogo.save.jogador, j = M.jog; s.zona = M.zv.def.id; s.x = j.x; s.y = j.y; s.dir = j.dir; jogo.save.rng = rng.estado(); }
function bater() { if (M.quadro - M.batidaT > 26) { M.batidaT = M.quadro; sfx('batida'); } }
const seguir = seguirParceira;
/** inicia um passo do jogador; `aoChegar` roda no quadro da chegada */
function andar(d: Dir, dur: number, o: OpMover = {}, correndo = false) {
  const j = M.jog, ox = j.x, oy = j.y;
  j.base = o.base ?? baseDoModo(correndo);
  void j.mover(d, dur, o, aoChegar);
  seguir(ox, oy, dur);
}
/** passo dirigido por script de campo (escalar, embarcar, cascata): espera chegar e trata a chegada */
export async function andarJogador(d: Dir, dur: number, o: OpMover = {}) {
  const j = M.jog, ox = j.x, oy = j.y;
  j.base = o.base ?? baseDoModo(false);
  seguirDepois(ox, oy);
  await j.mover(d, dur, o);
  j.base = baseDoModo(false); j.pose();
  salvarPos();
}
function seguirDepois(ox: number, oy: number) { recolherParceira(ox, oy); }

function recusar(texto: string, d: Dir) { M.travaDir = d; void ocupar(() => falar(texto)); }

function tentarAndar(d: Dir) {
  const j = M.jog, z = M.zv, tx = j.x + DX[d], ty = j.y + DY[d], modo = jogo.save.jogador.modo, e = entrada();
  if (!z.dentro(tx, ty)) {
    const w = z.warp(j.x, j.y);
    if (w && !ehEntrada(w) && w.tipo !== 'buraco') { if (!zonaExiste(w.para.zona)) recusar(AVISO_EM_OBRAS, d); else if (cond(w.requer) && !emObras(w)) void usarWarp(w); else recusar(w.recusa ?? 'O caminho está fechado por enquanto.', d); } else bater();
    return;
  }
  const portao = z.portao(tx, ty);
  if (portao) { recusar(portao.fala, d); return; }
  const w = z.warp(tx, ty);
  if (w && !cond(w.requer) && z.ch(tx, ty) !== 'd') { recusar(w.recusa ?? 'O caminho está fechado por enquanto.', d); return; }
  if (w && emObras(w)) { recusar(EM_OBRAS[w.tipo as 'trem' | 'saveiro'], d); return; }
  if (w && !zonaExiste(w.para.zona)) { recusar(AVISO_EM_OBRAS, d); return; }
  if (atorEm(tx, ty)) { bater(); return; }
  const ch = z.ch(tx, ty);
  if (modo === 'remo') {
    if (z.agua(tx, ty)) {
      if (ch === 'w') {
        if (d === 'n') { M.travaDir = d; void ocupar(subirCascata); }
        else if (d === 's') { let n = 0; while (z.ch(tx, ty + n + 1) === 'w') n++; if (z.agua(tx, ty + n + 1)) { sfx('cachoeira'); andar(d, 6 * (n + 2), { tiles: n + 2 }); } else bater(); }
        else bater();
        return;
      }
      andar(d, 8); return;
    }
    if (pisavel(tx, ty) && !SALIENCIA[ch]) { jogo.save.jogador.modo = 'pe'; sfx('passo-terra'); andar(d, 16, { salto: 6 }); return; }
    bater(); return;
  }
  const sal = SALIENCIA[ch];
  if (sal && modo !== 'mergulho') {
    const lx = tx + DX[d], ly = ty + DY[d];
    if (sal === d && pisavel(lx, ly) && !atorEm(lx, ly)) { sfx('pulo-saliencia'); andar(d, 24, { tiles: 2, salto: 8 }); } else bater();
    return;
  }
  if (ch === 'p' && M.forca) { if (!empurrar(tx, ty, d)) bater(); return; }
  if (pisavel(tx, ty)) {
    const correndo = modo === 'pe' && e.segurando('b');
    const dur = ch === 'l' ? (modo === 'bike' ? 12 : 26) : modo === 'bike' ? 5 : modo === 'mergulho' ? 16 : correndo ? 8 : 16;
    andar(d, dur, {}, correndo);
    return;
  }
  bater();
}

function gatilhoEm(x: number, y: number): Gatilho | undefined {
  return M.zv.def.gatilhos?.find((g) => x >= g.x && y >= g.y && x < g.x + (g.w ?? 1) && y < g.y + (g.h ?? 1) && cond(g.se) && !(g.umaVez && flag(chaveGatilho(g))));
}
const chaveGatilho = (g: Gatilho) => `gatilho:${M.zv.def.id}:${g.script}:${g.x},${g.y}`;

/** tratamento síncrono do fim de cada passo do jogador */
function aoChegar() {
  const j = M.jog, z = M.zv, x = j.x, y = j.y, ch = z.ch(x, y), modo = jogo.save.jogador.modo;
  M.parouEm = M.quadro; M.passos++;
  salvarPos();
  passoDaEquipe(); passoDaParceira();
  if (mecanicas.get(z.def.id)?.passo?.(x, y) === true) return;
  const w = z.warp(x, y);
  if (w && ch !== 'd' && !z.def.submerso && cond(w.requer) && !emObras(w)) { void usarWarp(w); return; }
  const g = gatilhoEm(x, y);
  if (g) { if (g.umaVez) setFlag(chaveGatilho(g)); void ocupar(() => rodarEvento(g.script)); return; }
  if (jogo.save.equipe.length) { const t = quemVe(); if (t) { void ocupar(() => abordagem(t)); return; } }
  if (ch === 'g' && modo !== 'mergulho') {
    const tx = x + DX[j.dir], ty = y + DY[j.dir];
    if (pisavel(tx, ty) && !SALIENCIA[z.ch(tx, ty)] && !atorEm(tx, ty) && !z.portao(tx, ty)) { andar(j.dir, 6, { base: 'idle' }); return; }
  }
  const cz = z.correnteza(x, y);
  if (cz) {
    const tx = x + DX[cz], ty = y + DY[cz];
    if ((modo === 'remo' ? z.agua(tx, ty) && z.ch(tx, ty) !== 'w' : pisavel(tx, ty)) && !atorEm(tx, ty)) { andar(cz, 8, { semVirar: true }); return; }
  }
  if (ch === '"') { M.cena.farfalhar(x, y); if (M.passos % 2 === 0) sfx('passo-grama'); }
  tentarEncontro(ch, modo);
}

/** troca de zona por warp, com som e transição conforme o tipo */
export function usarWarp(w: Warp): Promise<void> {
  return ocupar(async () => {
    if (!zonaExiste(w.para.zona)) { await falar(AVISO_EM_OBRAS); return; }
    const j = M.jog, t = w.tipo ?? 'borda';
    if (t === 'porta') sfx('porta'); else if (t === 'escada' || t === 'caverna') sfx('escada');
    else if (t === 'buraco') { sfx('pulo-saliencia'); await quadros(16, (i) => { j.ey = i; j.visivel = i < 12; }); j.ey = 0; }
    else if (t === 'trem' || t === 'saveiro') {
      sfx(t);
      const cine = cinematicas.get(t);
      if (cine) await cine(); else await abrirTela('cinematica', { id: t });
    }
    await irPara(w.para.zona, w.para.x, w.para.y, w.para.dir ?? j.dir);
    j.visivel = true;
  });
}

export function atualizarJogador() {
  const j = M.jog, e = entrada();
  if (M.ocupado || j.movendo) return;
  if (e.apertou('a')) { void interagir(); return; }
  if (e.apertou('menu')) { void ocupar(async () => { await abrirTela('menu'); }); return; }
  if (e.apertou('select')) { void atalho(); return; }
  const d = e.eixo();
  if (!d) { M.viraT = 0; M.travaDir = null; return; }
  if (M.travaDir === d) return;
  M.travaDir = null;
  if (d !== j.dir) { j.virar(d); if (M.quadro - M.parouEm > 2) M.viraT = 5; }
  if (M.viraT > 0) { M.viraT--; return; }
  j.base = baseDoModo(false);
  tentarAndar(d);
}
