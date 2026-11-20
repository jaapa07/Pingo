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
 * Calibração (checkpoints do QA em tools/testes/qa3/saves): 7 selvagens por zona e FATOR 2,1 reproduzem a equipe
 * medida jogando — na cidade do ginásio 9: 55 / média 52; 10: 60 / 59; 11: 65 / 64; Cidade Ginga: 68 / 67.
 *
 * Uso: npx tsx tools/estima-chegada-b.ts [--selvagens 7] [--fator 2.2] [--opcionais] [--sementes 20]
 *      [--delta 9:6,10:9]      soma k níveis a todos os treinadores/chefes do passo (prever antes de editar)
 *      [--delta-selvagem 9:3]  idem para os selvagens das zonas do passo
 *      [--ajustar 3]           procura a curva autoconsistente: ás de cada chefe = chegada + 3, turma e rotas do
 *                              passo sobem junto com o líder (e os selvagens na fração --selvagem-acompanha, 0–1)
 *      [--fator-exp 0.75]      experiência × fator (FATOR_EXP_POS_LIGA do motor depois da Liga)
 *      [--mult-treinador 1.5] [--div 7] [--frac 1]  "e se": bônus de treinador, divisor da fórmula, fração dos
 *                              treinadores de rota enfrentados (os de ginásio, chefes e líderes sempre)
 */
import { readFileSync } from 'node:fs';
import type { CriaturaInst, TreinadorDef, ZonaDef, Habitat } from '../src/core/tipos';
import { carregarDados, rng } from './equilibrio-referencia';
import { especie, expParaNivel, NIVEL_MAX } from '../src/battle/criatura';

const arg = (k: string) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : undefined; };
/** modelo mecânico (--limiar L): quem derruba é a mais forte com chance --frente, senão uma ao acaso; a reserva L+ níveis
 *  atrás ganha metade (regra do Chocalho no motor: L = 2 até a Liga, 5 depois de `liga-vencida`) */
const LIMIAR = arg('limiar') !== undefined ? Number(arg('limiar')) : undefined, FRENTE = Number(arg('frente') ?? 0.2);
const N_SELV = Number(arg('selvagens') ?? 7), FATOR = Number(arg('fator') ?? 2.1), SEMENTES = Number(arg('sementes') ?? 40), OPCIONAIS = process.argv.includes('--opcionais');
const MULT_T = Number(arg('mult-treinador') ?? 1.5), FATOR_EXP = Number(arg('fator-exp') ?? 1), DIV = Number(arg('div') ?? 7), FRAC = Number(arg('frac') ?? 1);
const AJUSTAR = arg('ajustar') !== undefined ? Number(arg('ajustar')) : undefined, SEL_ACOMP = Number(arg('selvagem-acompanha') ?? 0);
const lerDelta = (s?: string) => new Map((s ?? '').split(',').filter(Boolean).map((p) => { const [a, b] = p.split(':'); return [Number(a), Number(b)] as [number, number]; }));
const DELTA0 = lerDelta(arg('delta')), DELTA_S0 = lerDelta(arg('delta-selvagem'));

/** caminho do jogador, passo a passo (passo k = o que se enfrenta antes do líder k; 17 = Pico até o Conselho) */
const CAMINHO: { passo: number; zonas: string[]; opcionais: string[]; chefes: string[]; lider: string[] }[] = [
  { passo: 9, zonas: ['B-R1', 'B-CE', 'B-PA', 'B2', 'B2-ginasio'], opcionais: [], chefes: [], lider: ['lider-09'] },
  { passo: 10, zonas: ['B9', 'B-R2', 'B3', 'B3-mina-1', 'B3-mina-2', 'B3-ginasio'], opcionais: ['A-RS'], chefes: ['B-PA-arame', 'B3-rebite'], lider: ['lider-10'] },
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
function selvagensDe(z: ZonaDef, ds: number): Inimigo[] {
  const hs = (z.habitats ?? []).filter((h) => ['grama', 'caverna', 'agua', 'arvore', 'rocha', 'mergulho'].includes(h.metodo) && !(h as { apos?: number }).apos && tabelaBase(h).length);
  if (!hs.length) return [];
  const out: Inimigo[] = [];
  for (let i = 0; i < N_SELV; i++) {
    const h = hs[i % hs.length], esc = rng.peso(tabelaBase(h));
    out.push({ e: esc.e, nv: rng.int(esc.nv[0], esc.nv[1]) + ds, treinador: false });
  }
  return out;
}
const daEquipe = (t: TreinadorDef, dt: number): Inimigo[] => t.equipe.map((m) => ({ e: m.e, nv: m.nv + dt, treinador: true }));

/**
 * Modelo "equipe por igual": o QA terminou cada trecho com a equipe a 1–3 níveis do ás (o piloto troca muito e o
 * Chocalho puxa quem fica 2+ atrás). Cada criatura derrubada rende a experiência do motor (`expDerrota`: base × nível
 * / 7, ×1,5 de treinador) × FATOR, repartida igualmente entre as seis. FATOR = quanto a equipe inteira ganha por ponto
 * de uma derrubada: 1 sem Chocalho; até 3,5 com uma na frente e cinco na reserva. Medido nos checkpoints do QA: 2,0–2,5.
 */
function derrotar(eq: CriaturaInst[], inim: Inimigo) {
  const nv = Math.min(NIVEL_MAX, Math.max(1, inim.nv)), b = Math.floor((especie(inim.e).expBase * nv) / DIV);
  const ganho = Math.max(1, Math.floor((inim.treinador ? Math.floor(b * MULT_T) : b) * FATOR_EXP));
  if (LIMIAR !== undefined) {
    const topo = Math.max(...eq.map((c) => c.nivel)), forte = eq.find((c) => c.nivel === topo)!;
    const quem = rng.f() < FRENTE ? forte : rng.escolha(eq);
    const reserva = eq.filter((c) => c !== quem && c.nivel <= topo - LIMIAR);
    for (const c of [quem, ...reserva]) {
      const q = c === quem ? ganho : Math.max(1, Math.floor(ganho / 2)), curva = especie(c.especie).crescimento;
      c.exp = Math.min(c.exp + q, expParaNivel(curva, NIVEL_MAX));
      while (c.nivel < NIVEL_MAX && c.exp >= expParaNivel(curva, c.nivel + 1)) c.nivel++;
    }
    return;
  }
  const cada = Math.floor((ganho * FATOR) / eq.length);
  for (const c of eq) {
    const curva = especie(c.especie).crescimento;
    c.exp = Math.min(c.exp + cada, expParaNivel(curva, NIVEL_MAX));
    while (c.nivel < NIVEL_MAX && c.exp >= expParaNivel(curva, c.nivel + 1)) c.nivel++;
  }
}

interface Linha { as: number; media: number; treinadores: number; selvagens: number; asAntes: number; mediaAntes: number }
const nivelDe = (eq: CriaturaInst[]) => [Math.max(...eq.map((c) => c.nivel)), eq.reduce((a, c) => a + c.nivel, 0) / eq.length];
/** simula o caminho inteiro; `ate` corta depois do passo dado */
function simular(delta: Map<number, number>, deltaS: Map<number, number>, ate = 17): Record<number, Linha> {
  const soma: Record<number, Linha> = {};
  for (let s = 0; s < SEMENTES; s++) {
    rng.seed(4242 + s * 7919);
    const eq = sv.equipe.filter((c) => !c.ovo).map((c) => ({ ...c }));
    for (const p of CAMINHO) {
      if (p.passo > ate) break;
      const dt = delta.get(p.passo) ?? 0, ds = deltaS.get(p.passo) ?? 0;
      const r = (soma[p.passo] ??= { as: 0, media: 0, treinadores: 0, selvagens: 0, asAntes: 0, mediaAntes: 0 });
      let nt = 0, ns = 0;
      const lutar = (xs: Inimigo[]) => { for (const x of xs) { derrotar(eq, x); if (!x.treinador) ns++; } };
      const zonas = [...p.zonas, ...(OPCIONAIS ? p.opcionais : [])];
      // ordem: zonas do caminho e chefes de evento; a turma do ginásio por último (marca a chegada à cidade)
      for (const zid of [...zonas.filter((z) => !z.endsWith('-ginasio')), '#chefes', ...zonas.filter((z) => z.endsWith('-ginasio'))]) {
        if (zid === '#chefes') {
          const [a0, m0] = nivelDe(eq); r.asAntes += a0 / SEMENTES; r.mediaAntes += m0 / SEMENTES;
          for (const id of p.chefes) { const t = d.treinadores.get(id); if (t) { lutar(daEquipe(t, dt)); nt++; } }
          continue;
        }
        const z = zona.get(zid); if (!z) { console.error('zona ausente: ' + zid); continue; }
        lutar(selvagensDe(z, ds));
        const gin = zid.endsWith('-ginasio');
        for (const n of z.npcs ?? []) if (n.treinador && (OPCIONAIS || !PULAVEIS.has(n.treinador)) && (gin || FRAC >= 1 || rng.f() < FRAC)) { const t = d.treinadores.get(n.treinador); if (t) { lutar(daEquipe(t, dt)); nt++; } }
      }
      const [a1, m1] = nivelDe(eq); r.as += a1 / SEMENTES; r.media += m1 / SEMENTES;
      r.treinadores = nt; r.selvagens = ns;
      for (const id of p.lider) { const t = d.treinadores.get(id); if (t) lutar(daEquipe(t, dt)); }
    }
  }
  return soma;
}
const asChefe = (p: (typeof CAMINHO)[number]) => Math.max(...p.lider.map((id) => d.treinadores.get(id)).filter(Boolean).map((t) => Math.max(...t!.equipe.map((m) => m.nv))));

let delta = new Map(DELTA0), deltaS = new Map(DELTA_S0);
if (AJUSTAR !== undefined) {
  // passo a passo: o delta do passo k muda a própria chegada (turma e rotas sobem junto), então itera até parar
  for (const p of CAMINHO) {
    for (let it = 0; it < 6; it++) {
      const r = simular(delta, deltaS, p.passo)[p.passo];
      const quer = Math.round(r.as + AJUSTAR - asChefe(p));
      if (quer === (delta.get(p.passo) ?? 0)) break;
      delta.set(p.passo, quer); deltaS.set(p.passo, Math.round(quer * SEL_ACOMP));
    }
  }
}
const soma = simular(delta, deltaS);
console.log(`fator de experiência ${FATOR_EXP} · selvagens por zona: ${N_SELV} · ${LIMIAR !== undefined ? `modelo mecânico: Chocalho a ${LIMIAR}+ níveis, a mais forte derruba ${FRENTE * 100}% + sorteio` : 'fator ' + FATOR} · treinador ×${MULT_T} · divisor ${DIV} · fração de treinadores de rota ${FRAC}${OPCIONAIS ? ' · com zonas/treinadores opcionais' : ''} · ${SEMENTES} sementes`);
if (delta.size) console.log('delta dos treinadores por passo: ' + [...delta].map(([k, v]) => `${k}:${v}`).join(',') + (deltaS.size ? ' · selvagens: ' + [...deltaS].map(([k, v]) => `${k}:${v}`).join(',') : ''));
console.log('| Passo | Treinadores no caminho | Selvagens | Ás do chefe | Antes dos chefes de evento e da turma (ás / média) | Chegada ao chefe (ás da equipe) | Média da equipe | Δ (chegada − ás) |');
console.log('|---|---|---|---|---|---|---|---|');
for (const p of CAMINHO) {
  const r = soma[p.passo], a = asChefe(p) + (delta.get(p.passo) ?? 0);
  console.log(`| ${p.passo === 17 ? 'Conselho' : 'Líder ' + p.passo} | ${r.treinadores} | ${r.selvagens} | ${a} | ${r.asAntes.toFixed(1)} / ${r.mediaAntes.toFixed(1)} | ${r.as.toFixed(1)} | ${r.media.toFixed(1)} | ${(r.as - a >= 0 ? '+' : '') + (r.as - a).toFixed(1)} |`);
}
