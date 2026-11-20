// mede memória/DOM numa zona: node tmem.mjs <save> <zona> [segundos]
import { abrir } from './piloto.mjs';
const t = await abrir({ nome: 'tmem', turbo: 5 });
await t.carregar(process.argv[2]);
const m = async (r) => { const x = await t.ev(() => ({ heap: Math.round((performance.memory?.usedJSHeapSize ?? 0) / 1e6), dom: document.getElementsByTagName('*').length, canv: document.getElementsByTagName('canvas').length, img: document.images.length })); t.log(r, JSON.stringify(x)); };
await m('início');
await t.viajar(process.argv[3]); await m('chegou ' + process.argv[3]);
for (let i = 0; i < Number(process.argv[4] ?? 6); i++) { await t.espera(10000); await m('+' + (i + 1) * 10 + 's'); }
await t.fim();
