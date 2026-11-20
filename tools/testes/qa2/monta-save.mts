/**
 * Save de referência do passo 4 (logo depois do 4º ginásio, em Cidade Coral) para o QA do trecho 2.
 * Equipe = equipeReferencia(passo 4) de tools/equilibrio-referencia.ts com o inicial de Rio (é quem puxa a canoa do Remo:
 * sem criatura de Rio o jogador não teria chegado a Cidade Coral), golpes por nível, um pouco de esforço; 4 insígnias,
 * Amuletos faro/facão/remo, flags da história até ali, treinadores do caminho vencidos, mochila e dinheiro plausíveis.
 * Uso: npx tsx tools/testes/qa2/monta-save.mts [inicial=7]
 */
import { writeFileSync } from 'node:fs';
import { carregarDados, equipeReferencia, formaNoNivel, instanciar, rng } from '../../equilibrio-referencia';
import { novoSave } from '../../../src/core/estado';

const inicial = Number(process.argv[2] ?? 7);
rng.seed(20261119);
const d = await carregarDados();
const s = novoSave();
s.jogador = { ...s.jogador, nome: 'Kauê', avatar: 'kaue', id: '31415', zona: 'A5', x: 34, y: 17, dir: 's', modo: 'pe' };
// equipeReferencia(passo 4) é a equipe ao CHEGAR ao líder 4 (ás 23). Vencer o ginásio (5 treinadores + líder, ~16 criaturas
// de nível 22–26, ~6 mil pontos de experiência) rende perto de 2 níveis ao ás e 1 a cada uma das outras: é esse o ponto de partida.
const ref = equipeReferencia(d, inicial, 4).map((m, i) => { const nv = m.nv + (i === 0 ? 2 : 1); return { ...m, nv, e: formaNoNivel(m.linha, nv) }; });
s.equipe = instanciar(ref);
for (const c of s.equipe) { c.treinadorOriginal = 'Kauê'; c.amizade = 120; c.cuia = 'cuia'; }
s.equipe[0].amizade = 170; // o inicial já fareja (Faro pede amizade ≥ 150)
s.insignias = [1, 2, 3, 4];
s.amuletos = ['faro', 'facao', 'remo'];
const flags = ['abertura-ok', 'intro-ok', 'prof-conheceu', 'ovo-no-aroeira', 'ovo-entregue', 'diario', 'tutorial-captura', 'faro-missao', 'faro-achou', 'faro-ok',
  'rival-1', 'rival-2', 'rival-3', 'usina-energia', 'usina-grade', 'usina-ok', 'vara-velha-ok', 'venceu:lider-01', 'venceu:lider-02', 'venceu:lider-03', 'venceu:lider-04',
  { 1: 'inicial-mata', 4: 'inicial-brasa', 7: 'inicial-rio' }[inicial]!];
for (const f of flags) s.flags[f] = true;
s.flags['inicial'] = inicial;
// treinadores do caminho principal até o passo 4 (rotas, Usina, Baía Azul e ginásios 1–4): todos vencidos
let premios = 0;
const CAMINHO = /^(A-R[1-4]|A-MS|A-GE|A-US-\d|A-BA|A[1-5]|A[1-5]-ginasio)$/;
for (const [id, t] of d.treinadores) {
  const z = d.zonaDoTreinador.get(id);
  const lider = t.insignia !== undefined && t.insignia <= 4;
  if (!lider && !(z && z.mapa === 'A' && CAMINHO.test(z.id))) continue;
  if (/^rival-/.test(id)) continue;
  s.flags[t.flag ?? 'venceu:' + id] = true; premios += t.premio ?? 0;
}
for (const z of d.zonas) if (z.tipo === 'cidade' && /^A[1-5]$/.test(z.id)) s.flags['visitou:' + z.id] = true;
// dinheiro: 3000 do começo + prêmios, menos o que um jogador comum gastou em cuias e remédios pelo caminho (~55%)
s.jogador.dinheiro = Math.round((3000 + premios) * 0.45 / 10) * 10;
s.mochila = { 'diario-de-campo': 1, 'radio-cipo': 1, 'vara-velha': 1, 'vara-boa': 1, 'amuleto-faro': 1, 'amuleto-facao': 1, 'amuleto-remo': 1,
  cuia: 6, 'cuia-rede': 3, 'cha-cidreira': 2, garrafada: 2, 'mel-puro': 1, unguento: 1 };
const vistos = new Set<number>();
for (const z of d.zonas) if (z.mapa === 'A' && (z.passo ?? 99) <= 4) for (const h of z.habitats ?? []) for (const t of [h.todos, h.dia, h.manha, h.noite]) for (const e of t ?? []) vistos.add(e.e);
for (const c of s.equipe) vistos.add(c.especie);
s.diario = { visto: [...vistos].sort((a, b) => a - b), capturado: [...new Set(s.equipe.map((c) => c.especie))] };
s.ultimoPosto = { zona: 'A5-posto', x: 6, y: 8 };
s.tempoJogo = 6 * 3600;
s.rng = 424242;
writeFileSync(new URL('./saves/passo-4.json', import.meta.url), JSON.stringify(s));
console.log('equipe:', s.equipe.map((c) => `${c.especie}:${c.nivel} [${c.golpes.map((g) => g.id).join(',')}]`).join(' | '));
console.log('dinheiro:', s.jogador.dinheiro, '(prêmios até o passo 4:', premios, ') flags:', Object.keys(s.flags).length);
