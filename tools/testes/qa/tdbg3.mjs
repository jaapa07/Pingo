import { abrir } from './piloto.mjs';
const t = await abrir({ nome: 'tdbg3', turbo: 6 }); t.inicial = 'mata';
await t.carregar('mata-passo-8');
await t.viajar('A-R4');
await t.irAte(3, 16);
t.log('em', JSON.stringify(await t.snap()));
await t.virar?.('l');
await t.toque('KeyZ', 400);
for (let i = 0; i < 6; i++) { const s = await t.snap(); t.log(JSON.stringify(s.dlg ?? null), s.x, s.y, s.modo); await t.foto('remo' + i); if (s.dlg?.fase === 'escolhendo') { await t.toque('KeyZ', 400); } else await t.toque('KeyZ', 300); }
t.log(JSON.stringify(await t.falas(4)), JSON.stringify(await t.snap()));
t.log(JSON.stringify(await t.ev(() => ({ am: window.__pingo.jogo.save.amuletos, ins: window.__pingo.jogo.save.insignias }))));
await t.fim();
