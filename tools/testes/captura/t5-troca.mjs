// Troca com Dona Quitéria (A3) e desobediência da trocada (parte final de t3, separada para rodar rápido).
import { abrir } from './lib.mjs';
const t = await abrir('?zona=A3&x=8&y=18&dir=n&equipe=13:12,7:20&insignias=1&semente=5');
await t.pronto(); await t.assentar();
const save = () => t.ev(() => window.__pingo.jogo.save);
const falas = (n = 4) => t.falas(n);
let s;
/* ---------- troca em A3 (Dona Quitéria, 8,17) ---------- */
await t.k('z', 500); for (let i = 0; i < 10; i++) await t.k('z', 400);
await t.assentar(30000, 'z');
s = await save();
const pipoca = s.equipe.find((c) => c.apelido === 'Pipoca');
t.ok(pipoca && pipoca.especie === 22 && pipoca.item === 'caju' && pipoca.treinadorOriginal === 'Dona Quitéria' && !s.equipe.some((c) => c.especie === 13), 'troca feita: Saguinho "Pipoca" com caju', (await falas(2)).join(' / '));
/* ---------- obediência: Pipoca nv 45 com 0 insígnias ---------- */
await t.ev(() => { const s = window.__pingo.jogo.save; s.insignias = []; const p = s.equipe.find((c) => c.apelido === 'Pipoca'); p.nivel = 45; s.equipe = [p, ...s.equipe.filter((c) => c !== p)]; window.__fim = null; window.__pingo.bus.on('batalha-fim', (d) => { window.__fim = d.resultado; }); });
await t.ev(async () => { const E = await import('/src/battle/engine.ts'); window.__msgs = []; const m = E.Batalha.prototype.msg; E.Batalha.prototype.msg = function (x) { window.__msgs.push(x); return m.call(this, x); }; });
await t.ev(() => { void window.__pingo.mundo.batalhaSelvagem(13, 30); });
let desob = false;
for (let i = 0; i < 160 && !(await t.ev(() => window.__fim)); i++) {
  await t.k('z', 250);
  const f = await t.ev(() => window.__msgs.slice(-4).join(' '));
  if (/ignorou a ordem|corpo mole|não obedeceu/.test(f)) { if (!desob) await t.foto('desobedece'); desob = true; }
}
const ultimas = await t.ev(() => window.__msgs.filter((x) => /Pipoca/.test(x)).slice(-6));
t.ok(desob, 'Pipoca (troca, nv 45, 0 insígnias) desobedeceu em batalha', ultimas.join(' / '));
console.log('erros', t.erros.slice(0, 5));
await t.browser.close();
