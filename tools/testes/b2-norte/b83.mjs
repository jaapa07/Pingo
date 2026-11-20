import { abrir } from './lib.mjs';
const t = await abrir('B8', 34, 13, '&dir=l&insignias=14&amuletos=todos&flags=inicial-mata', 1);
t.page.on('console', (m) => { if (!/vite|HMR/.test(m.text())) console.log('[console]', m.type(), m.text().slice(0, 200)); });
try {
  await t.page.keyboard.down('ArrowRight'); await t.espera(400); await t.page.keyboard.up('ArrowRight');
  for (let i = 0; i < 16; i++) {
    for (let k = 0; k < 6; k++) { await t.page.keyboard.press('z'); await t.espera(250); }
    const s = await t.st();
    const info = await t.page.evaluate(() => { const p = window.__pingo; const top = p.telas.pilha[p.telas.pilha.length - 1]; return { cls: top?.el?.className, html: top?.el?.innerHTML?.length, txt: [...(top?.el?.querySelectorAll('[aria-label],[data-texto],[title]') ?? [])].slice(0, 8).map((e) => e.getAttribute('aria-label') || e.getAttribute('data-texto') || e.getAttribute('title')) }; });
    console.log(i, s.oc, s.telas, JSON.stringify(info));
    if (!s.oc && s.telas <= 1 && i > 2) break;
  }
  await t.page.screenshot({ path: `${'/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/b2n'}/b83.png`, timeout: 15000 }).catch((e) => console.log('foto', e.message.slice(0, 80)));
} catch (e) { console.log('FALHA', e.message); }
await t.fim();
