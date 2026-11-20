/**
 * Curva de níveis (spec 4.5, "Regra de coerência de níveis") e sprites das espécies do mapa A.
 * A faixa de cada treinador vem da própria simulação de progressão: quem fica alcançável com k insígnias
 * é enfrentado antes do líder k+1, então não pode passar do ás desse líder.
 */
import { existsSync, statSync } from 'node:fs';
import type { Comando, TreinadorDef } from '../../src/core/tipos';
import { ESPECIES, VISITANTES } from '../../src/data/criaturas';
import { RAIZ, carregar, cadaComando, novoAchado, type Achado } from './dados';
import { encontrosDe } from './integridade';
import type { ResultadoProgressao } from './progressao';

/** faixas do spec 4.5 para a equipe de cada líder do mapa A */
// líder 1: 7–10 (era 10–12). Medido no jogo honesto (tools/testes/qa): quem chega ao 1º ginásio tem o inicial no nv 8 e
// capturas de nv 2–5; com o ás no 12 essa equipe vencia 0–17% das vezes. Spec 4.5 atualizado junto.
const FAIXA_LIDER: [number, number][] = [[7, 10], [15, 17], [20, 22], [24, 26], [28, 30], [31, 33], [34, 36], [38, 40]];
const LIGA: [number, number] = [41, 46];
const as = (t: TreinadorDef) => Math.max(...t.equipe.map((m) => m.nv));

export async function niveis(prog: ResultadoProgressao): Promise<Achado> {
  const a = novoAchado(), d = await carregar();
  const arq = (id: string) => d.arquivoDoTreinador.get(id) ?? 'src/data/treinadores';
  const nome = (n: number) => { const e = ESPECIES.find((q) => q.num === n) ?? VISITANTES.find((q) => q.num === n); return e ? `${e.nome} (nº ${n})` : `nº ${n}`; };
  /* líderes 1..8 e Liga: a curva só sobe */
  const lideres: TreinadorDef[] = [];
  for (let n = 1; n <= 8; n++) {
    const t = [...d.treinadores.values()].find((q) => q.insignia === n);
    if (!t) { a.erros.push(`src/data/treinadores: não existe líder que dê a insígnia ${n}`); continue; }
    lideres[n] = t;
    const [lo, hi] = FAIXA_LIDER[n - 1];
    for (const m of t.equipe) if (m.nv < lo || m.nv > hi) a.erros.push(`${arq(t.id)}: líder ${n} (${t.id}) tem ${nome(m.e)} no nível ${m.nv}, fora da faixa ${lo}–${hi} do spec 4.5`);
    if (as(t) !== hi) a.erros.push(`${arq(t.id)}: o ás do líder ${n} (${t.id}) está no nível ${as(t)}; o spec 4.5 pede o limite superior da faixa (${hi})`);
    if (n > 1 && lideres[n - 1] && as(t) <= as(lideres[n - 1])) a.erros.push(`${arq(t.id)}: o ás do líder ${n} (nv ${as(t)}) não passa o do líder ${n - 1} (nv ${as(lideres[n - 1])})`);
  }
  const topo: number[] = [5]; for (let n = 1; n <= 8; n++) topo[n] = lideres[n] ? as(lideres[n]) : FAIXA_LIDER[n - 1][1];
  topo[9] = LIGA[1];
  const liga = [1, 2, 3, 4, 5].map((n) => d.treinadores.get('liga-' + n));
  liga.forEach((t, i) => {
    if (!t) { a.erros.push(`src/data/treinadores/liga.ts: falta o treinador liga-${i + 1}`); return; }
    const x = as(t);
    if (x <= topo[8]) a.erros.push(`${arq(t.id)}: ${t.id} tem ás no nível ${x}; a Liga tem de ficar acima do líder 8 (nv ${topo[8]})`);
    if (x < LIGA[0] || x > LIGA[1]) a.erros.push(`${arq(t.id)}: ${t.id} tem ás no nível ${x}, fora da faixa da Liga ${LIGA[0]}–${LIGA[1]}`);
    for (const m of t.equipe) if (m.nv < FAIXA_LIDER[7][0] || m.nv > LIGA[1]) a.erros.push(`${arq(t.id)}: ${t.id} tem ${nome(m.e)} no nível ${m.nv}, fora de ${FAIXA_LIDER[7][0]}–${LIGA[1]}`);
    const ant = liga[i - 1]; if (i > 0 && ant && x < as(ant)) a.erros.push(`${arq(t.id)}: o ás de ${t.id} (nv ${x}) é menor que o de ${ant.id} (nv ${as(ant)})`);
  });
  if (liga[4] && as(liga[4]) !== LIGA[1]) a.erros.push(`src/data/treinadores/liga.ts: o Campeão (liga-5) tem ás no nível ${as(liga[4])}; o spec 4.5 pede ${LIGA[1]}`);
  /* líderes 9+: curva do mapa B */
  for (const t of d.treinadores.values()) if ((t.insignia ?? 0) > 8) { const esperado = 47 + (t.insignia! - 9) * 2; if (as(t) < esperado) a.pendentes.push(`${arq(t.id)}: líder ${t.insignia} com ás no nível ${as(t)} (a curva nova pede ${esperado}–${esperado + 2}; mapa B)`); }

  /* treinadores do mapa A dentro da faixa do passo em que ficam alcançáveis */
  const preEvo = new Map<number, number>(); for (const e of [...ESPECIES, ...VISITANTES]) for (const v of e.evolui ?? []) if (v.nivel) preEvo.set(v.para, Math.min(v.nivel, preEvo.get(v.para) ?? 999));
  let conferidos = 0, retorno = 0; const semPasso: string[] = [];
  const zonaDe = new Map<string, string>(); for (const z of d.zonas.values()) for (const n of z.npcs ?? []) if (n.treinador) zonaDe.set(n.treinador, z.id);
  /** passo declarado da zona (campo `passo`): acima de 8 é área de retorno, com níveis do mapa B */
  const passoDaZona = (zid: string | undefined) => (zid ? d.zonas.get(zid)?.passo : undefined);
  for (const t of d.treinadores.values()) {
    const k = prog.treinadorNoPasso.get(t.id);
    const doA = k !== undefined && (passoDaZona(zonaDe.get(t.id)) ?? 0) <= 8;
    if (k !== undefined && !doA) retorno++;
    if (!doA) { if (k === undefined && !/^(B|b\d|g09|g1\d|lider-(09|1\d))/.test(t.id) && !(t.insignia && t.insignia > 8)) semPasso.push(t.id); }
    for (const m of t.equipe) {
      const min = preEvo.get(m.e);
      if (min && m.nv < min) (doA ? a.erros : a.pendentes).push(`${arq(t.id)}: ${t.id} usa ${nome(m.e)} no nível ${m.nv}, antes do nível em que a forma anterior evolui (${min})`);
    }
    if (!doA || t.insignia || /^liga-/.test(t.id)) continue;
    conferidos++;
    // enfrenta antes do líder p: o da zona (campo `passo`) ou o seguinte às insígnias com que fica alcançável
    const p = Math.min(9, Math.max(k + 1, passoDaZona(zonaDe.get(t.id)) ?? 0));
    const teto = topo[p], piso = p <= 1 ? 2 : Math.max(2, topo[p - 1] - 9);
    for (const m of t.equipe) {
      if (m.nv > teto) a.erros.push(`${arq(t.id)}: ${t.id} (alcançável com ${k} insígnia(s)) tem ${nome(m.e)} no nível ${m.nv}, acima do ás do ${p <= 8 ? 'líder ' + p : 'Campeão'} (nv ${teto})`);
      else if (m.nv < piso) a.avisos.push(`${arq(t.id)}: ${t.id} (alcançável com ${k} insígnia(s)) tem ${nome(m.e)} no nível ${m.nv}, bem abaixo da faixa (${piso}–${teto})`);
    }
  }
  if (retorno) a.pendentes.push(`${retorno} treinador(es) em áreas de retorno do mapa A (zonas com passo > 8): níveis do mapa B, conferir com a curva nova`);
  // a simulação escolhe o inicial de Mata: as outras duas versões da rival ficam de fora por construção
  const longe = semPasso.filter((id) => (passoDaZona(zonaDe.get(id)) ?? 0) > 8);
  if (longe.length) a.pendentes.push(`${longe.length} treinador(es) em áreas de retorno que só abrem depois do mapa B: ${longe.join(', ')}`);
  const outros = semPasso.filter((id) => !/^rival-\d-(rio|mata)$/.test(id) && !longe.includes(id));
  if (outros.length) a.avisos.push(`${outros.length} treinador(es) do mapa A fora do caminho da simulação (áreas de retorno, revanches ou sem NPC): faixa não conferida — ${outros.join(', ')}`);

  /* selvagens: média da tabela base ≤ ás do próximo líder − 2 (spec 16.2) */
  let tabelas = 0;
  for (const z of d.zonas.values()) {
    const k = prog.zonaNoPasso.get(z.id); if (z.mapa !== 'A' || k === undefined) continue;
    if ((z.passo ?? 0) > 8) {
      if (z.habitats?.length || (z.npcs ?? []).some((n) => n.treinador)) a.avisos.push(`${d.arquivoDaZona.get(z.id)}: área de retorno (passo ${z.passo}) já alcançável com ${k} insígnia(s) — conferir se há portão antes dos encontros de nível alto`);
      continue;
    }
    for (const h of z.habitats ?? []) {
      if (!['grama', 'caverna', 'agua'].includes(h.metodo)) continue;
      const base = [...(h.todos ?? []), ...(h.manha ?? []), ...(h.dia ?? []), ...(h.noite ?? [])]; if (!base.length) continue;
      tabelas++;
      const peso = base.reduce((s, e) => s + e.peso, 0) || 1, media = base.reduce((s, e) => s + ((e.nv[0] + e.nv[1]) / 2) * e.peso, 0) / peso;
      // a água só se anda com o Remo (insígnia 3): a faixa de quem rema é a do passo 3 em diante
      const p = Math.min(9, Math.max(k + 1, z.passo ?? 0, h.metodo === 'agua' ? 4 : 0)), limite = topo[p] - 2;
      if (media > limite && media <= limite + 1) a.avisos.push(`${d.arquivoDaZona.get(z.id)}: selvagens de ${h.metodo} com média de nível ${media.toFixed(1)}, no limite de ${limite} (ás do líder ${p} − 2)`);
      else if (media > limite) a.erros.push(`${d.arquivoDaZona.get(z.id)}: selvagens de ${h.metodo} com média de nível ${media.toFixed(1)}, acima de ${limite} (ás do próximo líder − 2; zona alcançável com ${k} insígnia(s))`);
      for (const e of base) { const min = preEvo.get(e.e); if (min && e.nv[0] < min) a.erros.push(`${d.arquivoDaZona.get(z.id)}: ${nome(e.e)} selvagem no nível ${e.nv[0]}, antes do nível em que a forma anterior evolui (${min})`); }
    }
  }
  a.info.push(`ás dos líderes 1–8: ${topo.slice(1, 9).join(', ')} · Liga: ${liga.map((t) => (t ? as(t) : '?')).join(', ')} · ${conferidos} treinadores e ${tabelas} tabelas de selvagens do mapa A dentro da faixa`);
  return a;
}

/** toda espécie de habitat, equipe ou evento do mapa A tem sprite de batalha (frente/costas) e de mapa */
export async function sprites(prog: ResultadoProgressao): Promise<Achado> {
  const a = novoAchado(), d = await carregar();
  const usadas = new Map<number, string>();
  const usa = (n: number, onde: string) => { if (!usadas.has(n)) usadas.set(n, onde); };
  for (const z of d.zonas.values()) if (z.mapa === 'A') for (const h of z.habitats ?? []) for (const e of encontrosDe(h)) usa(e.e, `habitat de ${z.id}`);
  for (const t of d.treinadores.values()) if (prog.treinadorNoPasso.has(t.id)) for (const m of t.equipe) usa(m.e, `equipe de ${t.id}`);
  for (const ev of d.eventos.values()) { const arq = d.arquivoDoEvento.get(ev.id) ?? ''; if (/\/(_|b\d|ginasio-(09|1\d))/.test(arq)) continue; cadaComando(ev.passos, (c: Comando) => { if (['darCriatura', 'selvagem', 'darOvo', 'errante', 'vitrine', 'grito'].includes(String(c[0])) && Number(c[1]) > 0) usa(Number(c[1]), `evento ${ev.id}`); }); }
  // as evoluções por nível das espécies do mapa A também aparecem na mão do jogador antes da Liga
  for (let mudou = true; mudou;) { mudou = false; for (const e of ESPECIES) if (usadas.has(e.num)) for (const v of e.evolui ?? []) if (v.nivel && v.nivel <= 46 && !usadas.has(v.para)) { usadas.set(v.para, `evolução de ${e.nome} no nível ${v.nivel}`); mudou = true; } }
  const faltam: string[] = [], quebrados: string[] = [];
  for (const [n, onde] of [...usadas].sort((x, y) => x[0] - y[0])) {
    const e = ESPECIES.find((q) => q.num === n) ?? VISITANTES.find((q) => q.num === n); if (!e) continue;
    const dir = `${RAIZ}public/assets/sprites/criatura/${e.id}/`;
    if (!existsSync(dir)) { faltam.push(`${n} ${e.id} (${onde})`); continue; }
    for (const f of ['frente.png', 'costas.png', 'mapa.png', 'meta.json']) if (!existsSync(dir + f) || statSync(dir + f).size < (f.endsWith('.png') ? 600 : 50)) quebrados.push(`public/assets/sprites/criatura/${e.id}/${f}: ausente ou vazio`);
  }
  for (const q of quebrados) a.erros.push(q);
  if (faltam.length) a.avisos.push(`${faltam.length} de ${usadas.size} espécie(s) do mapa A ainda sem sprite em public/assets/sprites/criatura/ (lotes em andamento): ${faltam.join('; ')}`);
  a.info.push(`${usadas.size - faltam.length} de ${usadas.size} espécies do mapa A com sprite (frente, costas, mapa)`);
  return a;
}
