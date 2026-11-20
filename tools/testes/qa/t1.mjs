import { abrir } from './piloto.mjs';
const t = await abrir({ nome: 't1', turbo: Number(process.argv[2] ?? 12) });
await t.espera(1000);
await t.page.evaluate(() => { window.__qaFoto = true; }); await t.espera(300);
let a = Date.now();
await t.page.screenshot({ path: '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/x.png', timeout: 20000 }).then(() => console.log('pw ok', Date.now() - a), (e) => console.log('pw falhou', String(e).slice(0, 400)));
process.exit(0);
