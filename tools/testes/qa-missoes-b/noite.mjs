// B7 de noite: a cena fica preta? (abre já de noite; depois troca de dia para noite com o jogo rodando)
import { abrir, montar, FORTE, hora, junto } from './lib.mjs';
const sv = montar('B7', 24, 30, { insignias: 14 });
const t = await abrir(sv, { equipe: FORTE, hora: 22 });
await junto(t, 'B7', 'b7-patrao');
await t.page.evaluate(async () => { await window.Q.quadros(120); });
await t.foto('b7-noite-direto');
console.log('periodo', await t.page.evaluate(() => window.__pingo.mundo.relogio?.periodo?.()));
await hora(t, 13);
await t.page.evaluate(async () => { await window.Q.quadros(300); });
await t.foto('b7-dia-depois');
await hora(t, 22);
await t.page.evaluate(async () => { await window.Q.quadros(300); });
await t.foto('b7-noite-depois');
await t.page.evaluate(async () => { await new Promise((r) => setTimeout(r, 3000)); await window.Q.quadros(60); });
await t.foto('b7-noite-depois-2');
await t.fim();
