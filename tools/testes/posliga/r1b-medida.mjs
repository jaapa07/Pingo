// MEDIDA (não é jogo honesto): a mesma revanche de líder com a equipe do Campeão subida +k níveis, na tela de batalha.
// Uso: run.sh r1b-medida.mjs <seg> <lider> <dia> <min> <k> [semente]
import { abrir, lerSave } from './lib.mjs';
import { preparar, relogio, flags } from './comum.mjs';
const [lider, DIA, MIN, K, SEM] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), Number(process.argv[5]), Number(process.argv[6] ?? 7)];
const t = await abrir(lerSave('campeao'), { semente: SEM });
await preparar(t);
await relogio(t, DIA, MIN);
await t.q(async ([lider, k]) => {
  const C = await import('/src/battle/criatura.ts'); const s = window.__pingo.jogo.save;
  for (const c of s.equipe) { c.nivel += k; c.exp = C.expParaNivel(C.especie(c.especie).curva, c.nivel); c.vida = C.atributos(c).vida; for (const g of c.golpes) g.pg = g.pgMax; c.status = null; }
  const D = await import('/src/world/deps.ts'); const R = await import('/src/data/revancha.ts'); const d = Math.floor((Date.now() + s.relogio.deslocamentoMin * 60000 - new Date().getTimezoneOffset() * 60000) / 86400000);
  s.flags['treino:' + lider] = R.diaCorrido(s.relogio.deslocamentoMin); s.flags['treino-hoje:' + lider] = true;
  await window.__pingo.mundo.irPara('A4-treino', 9, 13, 'n');
}, [lider, K]);
await t.assentar();
const nb = (await t.st()).nb;
await t.falarCom('treino-' + lider).catch((e) => 0);
await t.assentar().catch(() => 0);
const bs = await t.relato(nb);
console.log(`MEDIDA ${lider} k=+${K} sem=${SEM}: ${bs.map((b) => b.resultado + ' t=' + b.turnos + ' depois ' + b.depois).join(' | ')}`);
await t.fim();
