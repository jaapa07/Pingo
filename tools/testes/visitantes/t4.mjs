import { abrir } from './lib.mjs';
const Q = '?zona=A4&x=31&y=38&dir=l&insignias=16&amuletos=todos&equipe=9:70,100:70&flags=liga-vencida,usina-ok,rival-3,ea-missao,ea-frasco-escuro,ea-frasco-barrento&itens=frasco-agua-escura:1,frasco-agua-barrenta:1,cuia-guardia:1,cuia-ouro:20';
const t = await abrir(Q);
await t.pronto(); await t.assentar();
await t.virar('l'); await t.k('z', 300); let s = await t.assentar();
console.log((await t.falas(6)).join('\n--- '));
console.log('zona', JSON.stringify(s));
t.ok(s.zona === 'X-EA' && s.x === 18 && s.y === 45, 'chegou à X-EA');
const fl = await t.ev(() => ({ rota: window.__pingo.jogo.save.flags['ea-rota'], esc: window.__pingo.jogo.save.mochila['frasco-agua-escura'] ?? 0 }));
t.ok(fl.rota && fl.esc === 0, 'frascos entregues e rota aberta', JSON.stringify(fl));
await t.foto('xea-chegada');
// embarca
s = await t.ir(['n', 'n']); await t.virar('n'); await t.k('z', 300); s = await t.assentar(); console.log('embarque', JSON.stringify(s));
await t.foto('xea-agua');
// erro de propósito: sobe e vira para a água escura
s = await t.ir(['o', 'n', 'n', 'n']); console.log('na linha', JSON.stringify(s));
await t.tecla('o'); await t.espera(400); await t.foto('xea-arrastado'); s = await t.assentar(); console.log('depois do erro', JSON.stringify(s), (await t.falas(2)).join(' | '));
t.ok(s.x === 17 && s.y === 41, 'correnteza devolveu ao remanso');
// caminho certo
const rota = 'n,n,n,n,n,l,l,n,n,n,n,n,o,o,o,n,n,n,l,l,l,l,n,n,n,n,l,l,l,n,n,n,n,n,o,o,o,o,n,n,n,n,o,n,n,n,n,n,n,n'.split(',');
for (const d of rota) { s = await t.passo(d); if (s.x === 17 && s.y === 41 && d !== 'n') { console.log('VOLTOU AO REMANSO em', d); break; } }
console.log('fim da rota', JSON.stringify(s));
console.log('foto...'); await t.foto('xea-ilhota'); console.log('foto feita');
t.ok(s.y <= 10, 'atravessou a correnteza até a ilhota', JSON.stringify(s));
// dança: fica parado
for (let i = 0; i < 40; i++) { const q = await t.st(); if (q.telas > 1 && q.nb > 0) break; if (i === 3) await t.foto('xea-danca'); await t.espera(500); }
const b = await t.st(); console.log('depois da dança', JSON.stringify(b), (await t.falas(3)).join(' | '));
t.ok(b.nb > 0, 'batalha começou depois da dança');
await t.espera(2500); await t.foto('xea-batalha');
console.log('erros', t.erros);
await t.ev(() => { window.__salvo = JSON.stringify(window.__pingo.jogo.save); });
await t.browser.close();
