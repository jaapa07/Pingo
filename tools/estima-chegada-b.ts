/**
 * CHEGADA ESPERADA nos líderes 9–16 e no Conselho (docs/EQUILIBRIO-MAPA-B.md).
 *
 * Soma a experiência que o jogador honesto ganha no caminho do mapa B — todos os treinadores das zonas do caminho
 * (campo `passo` da zona), os chefes de evento (Cartel, rival), a turma de cada ginásio, o próprio líder e N
 * encontros selvagens por zona com habitat — e aplica as regras do motor: `expDerrota` (base × nível / 7, ×1,5 de
 * treinador), divisão entre participantes, Chocalho do Mutirão (a reserva 2+ níveis atrás da mais forte ganha
 * metade) e `expParaNivel` pela curva de cada espécie. A equipe de partida é a do checkpoint do Campeão do QA
 * (tools/testes/qa3/saves/campeao.json). Quem derruba cada criatura é sorteado pelo `rng` (média de várias sementes).
 *
 * Calibração: com N = 7 selvagens por zona o modelo reproduz as chegadas medidas pelo QA jogando (55 / 60 / 65 / 68).
 *
 * Uso: npx tsx tools/estima-chegada-b.ts [--selvagens 7] [--opcionais] [--sementes 40]
 *      [--delta 9:+6,10:+9]   soma k níveis a todos os treinadores/chefes do passo (para prever antes de editar)
 *      [--delta-selvagem 9:+3] idem para os selvagens das zonas do passo
 */
import { readFileSync } from 'node:fs';
import type { CriaturaInst, TreinadorDef, ZonaDef, Habitat } from '../src/core/tipos';
import { carregarDados, rng } from './equilibrio-referencia';
import { especie, expParaNivel, expDerrota, criarCriatura, NIVEL_MAX } from '../src/battle/criatura';

const arg = (k: string) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : undefined; };
const N_SELV = Number(arg('selvagens') ?? 7), FATOR = Number(arg('fator') ?? 2.2), SEMENTES = Number(arg('sementes') ?? 40), OPCIONAIS = process.argv.includes('--opcionais');
const lerDelta = (s?: string) => new Map((s ?? '').split(',').filter(Boolean).map((p) => { const [a, b] = p.split(':'); return [Number(a), Number(b)] as [number, number]; }));
const DELTA = lerDelta(arg('delta')), DELTA_S = lerDelta(arg('delta-selvagem'));

/** caminho do jogador, passo a passo (passo k = o que se enfrenta antes do líder k; 17 = Pico até o Conselho) */
const CAMINHO: { passo: number; zonas: string[]; opcionais: string[]; chefes: string[]; lider: string[] }[] = [
  { passo: 9, zonas: ['B-R1', 'B-CE', 'B-PA', 'B2', 'B2-ginasio'], opcionais: [], chefes: ['B-PA-arame'], lider: ['lider-09'] },
  { passo: 10, zonas: ['B9', 'B-R2', 'B3', 'B3-mina-1', 'B3-mina-2', 'B3-ginasio'], opcionais: ['A-RS'], chefes: ['B3-rebite'], lider: ['lider-10'] },
  { passo: 11, zonas: ['B-CH', 'B-CV', 'B4', 'B4-ginasio'], opcionais: [], chefes: ['rival-6-rio'], lider: ['lider-11'] },
  { passo: 12, zonas: ['B-R3', 'B5', 'B5-ginasio'], opcionais: [], chefes: [], lider: ['lider-12'] },
  { passo: 13, zonas: ['B-TA', 'B-TA-gruta', 'B6', 'B6-lab-1', 'B6-lab-2', 'B-VV', 'B6-ginasio'], opcionais: ['A-R6'], chefes: ['B6-porteiro', 'B6-lab-zinabre', 'B6-lab-lata'], lider: ['lider-13'] },
  { passo: 14, zonas: ['B-R4', 'B7', 'B7-ginasio'], opcionais: ['B-SG', 'B-LG'], chefes: ['rival-7-rio'], lider: ['lider-14'] },
  { passo: 15, zonas: ['B-R5', 'B8', 'B8-ginasio'], opcionais: [], chefes: [], lider: ['lider-15'] },
  { passo: 16, zonas: ['A-MT', 'A-MT-gruta', 'A9', 'A9-ginasio'], opcionais: [], chefes: [], lider: ['lider-16'] },
  { passo: 17, zonas: ['PP', 'PP-gruta'], opcionais: [], chefes: ['garrote', 'rival-8-rio'], lider: ['conselho-1', 'conselho-2', 'conselho-3', 'conselho-4', 'conselho-5'] },
];
/** treinadores de ilha/opcionais dentro de zona do caminho (o jogador honesto pode pular) */
const PULAVEIS = new Set(['g15-1', 'g15-3', 'g15-5']);

const d = await carregarDados();
const zona = new Map(d.zonas.map((z) => [z.id, z]));
const sv = JSON.parse(readFileSync(new URL('./testes/qa3/saves/campeao.json', import.meta.url), 'utf8')) as { equipe: CriaturaInst[] };

interface Inimigo { e: number; nv: number; treinador: boolean }
const tabelaBase = (h: Habitat) => [...(h.todos ?? []), ...(h.manha ?? []), ...(h.dia ?? []), ...(h.noite ?? [])];
function selvagensDe(z: ZonaDef, passo: number): Inimigo[] {
  const hs = (z.habitats ?? []).filter((h) => ['grama', 'caverna', 'agua', 'arvore', 'rocha', 'mergulho'].includes(h.metodo) && !(h as { apos?: number }).apos && tabelaBase(h).length);
  if (!hs.length) return [];
  const out: Inimigo[] = [];
  for (let i = 0; i < N_SELV; i++) {
    const h = hs[i % hs.length], t = tabelaBase(h), tot = t.reduce((s, e) => s + e.peso, 0);
    let r = rng.f() * tot, esc = t[0]; for (const e of t) { r -= e.peso; if (r <= 0) { esc = e; break; } }
    const nv = esc.nv[0] + Math.floor(rng.f() * (esc.nv[1] - esc.nv[0] + 1)) + (DELTA_S.get(passo) ?? 0);
    out.push({ e: esc.e, nv, treinador: false });
  }
  return out;
}
const daEquipe = (t: TreinadorDef, passo: number): Inimigo[] => t.equipe.map((m) => ({ e: m.e, nv: m.nv + (DELTA.get(passo) ?? 0), treinador: true }));

/**
 * Modelo "equipe por igual": o QA terminou cada trecho com a equipe a 1–3 níveis do ás (o piloto troca muito e o
 * Chocalho puxa quem fica 2+ atrás). Cada criatura derrubada rende `expDerrota` × FATOR, repartido igualmente entre as
 * seis. FATOR = quanto a equipe inteira ganha por ponto de experiência de uma derrubada: 1 sem Chocalho com uma só na
 * frente; até 3,5 com uma na frente e cinco na reserva. Medido nos checkpoints do QA: 2,0–2,5 (padrão 2,2).
 */
function derrotar(eq: CriaturaInst[], inim: Inimigo) {
  const vivo = criarCriatura(inim.e, Math.min(NIVEL_MAX, Math.max(1, inim.nv)));
  const cada = Math.floor((expDerrota(vivo, inim.treinador) * FATOR) / eq.length);
  for (const c of eq) {
    const curva = especie(c.especie).crescimento;
    c.exp = Math.min(c.exp + cada, expParaNivel(curva, NIVEL_MAX));
    while (c.nivel < NIVEL_MAX && c.exp >= expParaNivel(curva, c.nivel + 1)) c.nivel++;
  }
}

const soma: Record<number, { as: number; media: number; treinadores: number; selvagens: number; asAntes: number; mediaAntes: number }> = {};
const nivelDe = (eq: CriaturaInst[]) => [Math.max(...eq.map((c) => c.nivel)), eq.reduce((a, c) => a + c.nivel, 0) / eq.length];
for (let s = 0; s < SEMENTES; s++) {
  rng.seed(4242 + s * 7919);
  const eq = sv.equipe.filter((c) => !c.ovo).map((c) => ({ ...c }));
  for (const p of CAMINHO) {
    const r = (soma[p.passo] ??= { as: 0, media: 0, treinadores: 0, selvagens: 0, asAntes: 0, mediaAntes: 0 });
    let nt = 0, ns = 0;
    const lutar = (xs: Inimigo[]) => { for (const x of xs) { derrotar(eq, x); if (!x.treinador) ns++; } };
    const zonas = [...p.zonas, ...(OPCIONAIS ? p.opcionais : [])];
    // ordem: zonas do caminho e chefes de evento; a turma do ginásio por último (marca a chegada à cidade)
    for (const zid of [...zonas.filter((z) => !z.endsWith('-ginasio')), '#chefes', ...zonas.filter((z) => z.endsWith('-ginasio'))]) {
      if (zid === '#chefes') {
        for (const id of p.chefes) { const t = d.treinadores.get(id); if (t) { lutar(daEquipe(t, p.passo)); nt++; } }
        const [a0, m0] = nivelDe(eq); r.asAntes += a0 / SEMENTES; r.mediaAntes += m0 / SEMENTES;
        continue;
      }
      const z = zona.get(zid); if (!z) { console.error('zona ausente: ' + zid); continue; }
      lutar(selvagensDe(z, p.passo));
      for (const n of z.npcs ?? []) if (n.treinador && (OPCIONAIS || !PULAVEIS.has(n.treinador))) { const t = d.treinadores.get(n.treinador); if (t) { lutar(daEquipe(t, p.passo)); nt++; } }
    }
    const [a1, m1] = nivelDe(eq); r.as += a1 / SEMENTES; r.media += m1 / SEMENTES;
    r.treinadores = nt; r.selvagens = ns;
    for (const id of p.lider) { const t = d.treinadores.get(id); if (t) lutar(daEquipe(t, p.passo)); }
  }
}
const asChefe = (ids: string[]) => ids.map((id) => d.treinadores.get(id)).filter(Boolean).map((t) => Math.max(...t!.equipe.map((m) => m.nv)));
console.log(`selvagens por zona: ${N_SELV}${OPCIONAIS ? ' · com zonas/treinadores opcionais' : ''} · ${SEMENTES} sementes`);
console.log('| Passo | Treinadores no caminho | Selvagens | Ás do chefe | Na cidade, antes da turma (ás / média) | Chegada ao chefe (ás da equipe) | Média da equipe | Δ (chegada − ás) |');
console.log('|---|---|---|---|---|---|---|---|');
for (const p of CAMINHO) {
  const r = soma[p.passo], a = Math.max(...asChefe(p.lider)) + (DELTA.get(p.passo) ?? 0);
  console.log(`| ${p.passo === 17 ? 'Conselho' : 'Líder ' + p.passo} | ${r.treinadores} | ${r.selvagens} | ${a} | ${r.asAntes.toFixed(1)} / ${r.mediaAntes.toFixed(1)} | ${r.as.toFixed(1)} | ${r.media.toFixed(1)} | ${(r.as - a >= 0 ? '+' : '') + (r.as - a).toFixed(1)} |`);
}
