/** Encontros (spec 6.3): tabelas por período/camada/estação, taxa por passo, repelente, lendários errantes, derrota. */
import type { Encontro, Habitat, MetodoEncontro, ZonaDef, CriaturaInst } from '../core/tipos';
import { jogo, periodo, temInsignia, estacaoFria, flag, setFlag } from '../core/estado';
import { rng } from '../core/rng';
import { bus } from '../core/events';
import { M, ocupar, sfx, musica } from './vivo';
import { iniciarBatalha, criarCriatura, curarEquipe, falar, avisar, nomeCriatura, especie, type PedidoBatalha, type ResultadoBatalha } from './deps';
import { listaZonas, zonaDef } from './zonas';
import { irPara, reavaliar } from './index';

/** tabela em vigor para o método nesta zona (camada pós-insígnia → período → estação) */
export function tabela(z: ZonaDef, metodo: MetodoEncontro): { h: Habitat; t: Encontro[] } | null {
  const h = z.habitats?.find((x) => x.metodo === metodo);
  if (!h) return null;
  const p = periodo() === 'tarde' ? 'dia' : (periodo() as 'manha' | 'dia' | 'noite');
  const camada = [...(h.camadas ?? [])].sort((a, b) => b.apos - a.apos).find((c) => temInsignia(c.apos));
  const bruta = camada?.[p] ?? camada?.todos ?? h[p] ?? h.todos ?? [];
  const fria = estacaoFria();
  const t = bruta.filter((e) => !e.estacao || (e.estacao === 'fria') === fria);
  return t.length ? { h, t } : null;
}
export function sortear(z: ZonaDef, metodo: MetodoEncontro): { e: number; nv: number } | null {
  const r = tabela(z, metodo);
  if (!r) return null;
  const s = rng.peso(r.t);
  return { e: s.e, nv: rng.int(s.nv[0], s.nv[1]) };
}
const lider = (): CriaturaInst | undefined => jogo.save.equipe.find((c) => !c.ovo && c.vida > 0);

/** batalha com piscada de tela; cuida da música da zona e da derrota */
export async function lutar(p: PedidoBatalha): Promise<ResultadoBatalha> {
  sfx('encontro');
  await M.cena.piscar(2);
  const r = await iniciarBatalha(p);
  musica(M.zv.def.musica, true);
  M.passosSeguros = 4;
  if (r.resultado === 'derrota' && p.semDerrota) { curarEquipe(); reavaliar(); }
  else if (r.resultado === 'derrota') await derrota();
  else reavaliar();
  return r;
}
export function batalhaSelvagem(e: number, nv: number, o: Partial<PedidoBatalha> = {}): Promise<ResultadoBatalha> {
  return lutar({ tipo: 'selvagem', inimigos: [criarCriatura(e, nv)], arena: M.zv.def.arena, clima: M.zv.def.clima, ...o });
}
/** derrota: volta ao último Posto com a equipe curada e metade do dinheiro */
export async function derrota() {
  const s = jogo.save;
  await falar('{JOGADOR} ficou sem criaturas para lutar!\nVocê corre até o último Posto Guardião…');
  s.jogador.dinheiro = Math.floor(s.jogador.dinheiro / 2);
  curarEquipe();
  s.jogador.modo = 'pe';
  const posto = zonaDef(s.ultimoPosto.zona);
  if (posto) await irPara(posto.id, s.ultimoPosto.x, s.ultimoPosto.y, 's');
  else { const [x, y] = M.zv.def.pouso ?? [M.jog.x, M.jog.y]; await irPara(M.zv.def.id, x, y, 's'); }
  await falar('Sua equipe foi curada. Cuide bem dela!');
}

/** sorteio por passo; devolve true se começou um encontro */
export function tentarEncontro(ch: string, modo: string): boolean {
  const z = M.zv.def, s = jogo.save;
  if (!lider()) return false;
  const metodo: MetodoEncontro | null = modo === 'remo' ? 'agua' : ch === '"' ? 'grama' : ch === '%' ? (z.submerso ? 'mergulho' : 'caverna') : null;
  if (!metodo) return false;
  if (M.passosSeguros > 0) { M.passosSeguros--; return false; }
  const r = tabela(z, metodo);
  const err = metodo === 'grama' || metodo === 'caverna' ? errantesAqui() : [];
  if (!r && !err.length) return false;
  if (!rng.chance(r?.h.taxa ?? 0.1)) return false;
  if (err.length && rng.chance(0.25)) { void ocupar(() => encontrarErrante(err[0])); return true; }
  if (!r) return false;
  const e = rng.peso(r.t), nv = rng.int(e.nv[0], e.nv[1]);
  if (s.repelente > 0 && nv < (lider()?.nivel ?? 0)) return false;
  void ocupar(() => batalhaSelvagem(e.e, nv));
  return true;
}

/* ------------------------------ lendários errantes ------------------------------ */
/** flags: `errante:<n>` = id da zona atual (ou 'fim'), `errante-nv:<n>`, `errante-vida:<n>` */
export function soltarErrante(esp: number, nivel: number) { setFlag(`errante-nv:${esp}`, nivel); setFlag(`errante:${esp}`, M.zv?.def.id ?? ''); moverErrantes(true); }
const ativos = (): number[] => Object.keys(jogo.save.flags).filter((k) => /^errante:\d+$/.test(k) && flag(k) !== 'fim').map((k) => Number(k.slice(8)));
const errantesAqui = () => ativos().filter((n) => flag(`errante:${n}`) === M.zv.def.id);
/** a cada troca de zona cada errante pula para outra rota do mesmo mapa */
export function moverErrantes(todos = false) {
  for (const n of ativos()) {
    const onde = listaZonas().find((z) => z.id === flag(`errante:${n}`));
    const mapa = onde?.mapa ?? M.zv?.def.mapa ?? 'A';
    const rotas = listaZonas().filter((z) => z.mapa === mapa && (z.tipo === 'rota' || z.tipo === 'floresta') && !z.id.startsWith('_') && z.habitats?.some((h) => h.metodo === 'grama'));
    if (rotas.length && (todos || rng.chance(0.7))) setFlag(`errante:${n}`, rng.escolha(rotas).id);
  }
}
async function encontrarErrante(n: number) {
  const c = criarCriatura(n, Number(flag(`errante-nv:${n}`) ?? 50));
  const vida = flag(`errante-vida:${n}`);
  if (typeof vida === 'number' && vida > 0) c.vida = Math.min(c.vida, vida);
  const r = await lutar({ tipo: 'lendario', inimigos: [c], arena: M.zv.def.arena, clima: M.zv.def.clima, errante: true });
  if (r.resultado === 'captura' || r.resultado === 'vitoria') setFlag(`errante:${n}`, 'fim');
  else if (r.resultado === 'fuga') { setFlag(`errante-vida:${n}`, Math.max(1, c.vida)); moverErrantes(true); avisar(`${especie(n)?.nome ?? 'A criatura'} sumiu na mata…`); }
}

/* ------------------------------ ovos e amizade por passo ------------------------------ */
export function passoDaEquipe() {
  const s = jogo.save;
  if (M.passos % 128 === 0) for (const c of s.equipe) if (!c.ovo) c.amizade = Math.min(255, c.amizade + 1);
  for (const c of s.equipe) {
    if (!c.ovo) continue;
    if (--c.ovo > 0) continue;
    delete c.ovo;
    void ocupar(async () => {
      sfx('subir-nivel');
      if (!s.diario.visto.includes(c.especie)) s.diario.visto.push(c.especie);
      if (!s.diario.capturado.includes(c.especie)) s.diario.capturado.push(c.especie);
      bus.emit('ovo-chocou', { especie: c.especie });
      await falar(`Opa! O ovo está se mexendo…\fNasceu ${nomeCriatura(c)}!`);
    });
    break;
  }
  if (s.repelente > 0 && --s.repelente === 0) avisar('O cheiro da Fumaça de Andiroba se dissipou.');
}
