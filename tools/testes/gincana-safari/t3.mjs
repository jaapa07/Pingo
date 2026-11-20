import { abrir } from './lib.mjs';
const prova = process.argv[2] ?? 'forca';
const idx = { agilidade: 0, forca: 1, salto: 2 }[prova];
const vp = process.argv[3] === 'iphone' ? 'iphone' : 'pc';
const t = await abrir('?zona=A-GN&x=16&y=9&dir=n&flags=liga-vencida,gincana-visitou&equipe=23:45,102:45,98:45&itens=cupuacu:2,buriti:2&dinheiro=3000');
const { page } = t;
await t.pronto(); await t.espera(800);
const topo = () => page.evaluate(() => window.__pingo.telas.topo?.el.className ?? '');
const ate = async (classe, tecla = 'z', max = 60) => { for (let i = 0; i < max; i++) { if ((await topo()).includes(classe)) return true; await t.k(tecla, 250); } return false; };
await t.k('z', 1200);
for (let i = 0; i < idx; i++) await t.k('ArrowDown', 300);
await t.foto(`t3-${prova}-01-menu`);
t.ok(await ate('tela-equipe'), 'escolha de criatura');
await t.k('z', 1000);
t.ok((await topo()).includes('tela-gincana'), 'prova aberta');
await t.espera(1200); await t.foto(`t3-${prova}-02-contagem`);
// robô simples dentro da página
await page.evaluate((p) => {
  const tecla = (tipo) => document.dispatchEvent(new KeyboardEvent(tipo, { code: 'KeyZ', key: 'z', bubbles: true }));
  const tx = (el) => { const m = /translate\((-?\d+)px/.exec(el.style.transform); return m ? Number(m[1]) : NaN; };
  let ult = 0, solto = true;
  const f = (agora) => {
    if (!document.querySelector('.tela-gincana')) return;
    if (!solto) { tecla('keyup'); solto = true; }
    else if (agora - ult > 160) {
      let ok = false;
      if (p === 'forca') { const z = document.querySelector('.gn-ritmo-zona'), m = document.querySelector('.gn-ritmo-marca'); if (z && m) { const zx = parseInt(z.style.left), zw = parseInt(z.style.width), mx = tx(m); ok = mx >= zx + 2 && mx <= zx + zw - 2; } }
      if (p === 'salto') for (const o of document.querySelectorAll('.gn-ob')) { const x = tx(o); if (x - 72 > 6 && x - 72 < 30) ok = true; }
      if (ok) { tecla('keydown'); solto = false; ult = agora; }
    }
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}, prova);
const fim = async () => { for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!document.querySelector('.tela-gincana .mol-madeira'))) return true; if (i === 20) await t.foto(`t3-${prova}-03-meio`); await t.espera(500); } return false; };
t.ok(await fim(), 'resultado na tela');
await t.foto(`t3-${prova}-04-resultado`);
await t.k('z', 1200); await t.foto(`t3-${prova}-05-fala`);
await t.assentar(60000);
console.log(await page.evaluate(() => Object.fromEntries(Object.entries(window.__pingo.jogo.save.flags).filter(([k]) => k.startsWith('gincana')))));
console.log('erros', t.erros);
await t.browser.close();
