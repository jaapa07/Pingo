/**
 * QA FINAL — converte um checkpoint de QA (jogado com o inicial de Rio) para Mata ou Brasa: a linha do Botinho (7→8→9)
 * vira a do inicial pedido na forma do mesmo nível (golpes do nível, mesmos genes/esforço/experiência), e as flags
 * `inicial`/`inicial-*` e o Diário acompanham. Uso: npx tsx tools/testes/qa-final/trocar-inicial.mts <save.json> <mata|brasa> <saida.json>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { criarCriatura, especie } from '../../../src/battle/criatura';
import { formaNoNivel } from '../../equilibrio-referencia';
const [arq, ini, saida] = process.argv.slice(2);
const base = ini === 'mata' ? 1 : 4, s = JSON.parse(readFileSync(arq, 'utf8'));
let n = 0;
const trocar = (c: any) => {
  if (!c || ![7, 8, 9].includes(c.especie)) return c;
  const e = formaNoNivel(base, c.nivel), novo = criarCriatura(e, c.nivel);
  n++;
  return { ...c, especie: e, golpes: novo.golpes, vida: Math.round((c.vida / Math.max(1, especie(c.especie).base.vida)) * especie(e).base.vida) || c.vida };
};
s.equipe = s.equipe.map(trocar);
s.viveiro = s.viveiro.map((cx: any[]) => cx.map(trocar));
for (const k of ['inicial-rio', 'inicial-mata', 'inicial-brasa']) delete s.flags[k];
s.flags.inicial = base; s.flags['inicial-' + ini] = true;
for (const x of [base, base + 1, base + 2]) { if (!s.diario.visto.includes(x)) s.diario.visto.push(x); }
if (!s.diario.capturado.includes(base)) s.diario.capturado.push(base);
writeFileSync(saida, JSON.stringify(s));
console.log(`${arq} → ${saida}: ${n} criatura(s) da linha de Rio trocadas por ${ini}; equipe ${s.equipe.map((c: any) => especie(c.especie).nome + ' ' + c.nivel).join(', ')}`);
