import { abrir } from './lib.mjs';
const t = await abrir('?zona=X-EA&x=18&y=9&dir=n&insignias=16&amuletos=todos&equipe=9:70&flags=ea-rota');
await t.pronto(); await t.espera(1500);
await t.tecla('n');
for (let i = 0; i < 40; i++) { const s = await t.st(); if (s.telas > 1 || s.oc || s.mov) { if (s.telas > 1) await t.k('z', 300); else await t.espera(200); continue; } break; }
await t.espera(800);
await t.tecla('o'); // mexeu durante a dança
for (let i = 0; i < 40; i++) { const f = (await t.falas(1))[0] ?? ''; if (f.includes('assustou')) break; await t.espera(300); }
const f1 = (await t.falas(1))[0] ?? '';
t.ok(f1.includes('assustou'), 'galo se assustou com o movimento');
await t.assentar();
const sem = await t.ev(() => window.__pingo.mundo.batalhas.length);
t.ok(sem === 0, 'sem batalha depois do susto');
const conta = async () => (await t.ev(() => window.__pingo.mundo.falas.filter((f) => f.texto.includes('dança de corte')).length));
const c0 = await conta();
await t.passo('s');
for (let k = 0; k < 4; k++) { const s = await t.st(); if (s.x === 18) break; await t.tecla(s.x < 18 ? 'l' : 'o'); await t.assentar(); }
console.log('antes de voltar', JSON.stringify(await t.st()));
await t.tecla('n'); await t.espera(2500);
const c1 = await conta();
t.ok(c1 > c0, 'voltou a dançar depois de sair e entrar', JSON.stringify(await t.st()) + ' ' + c0 + '→' + c1);
console.log('erros', t.erros); await t.browser.close();
