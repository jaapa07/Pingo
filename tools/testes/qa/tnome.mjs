// tela de nome com teclado físico: Z e X são A/B do jogo e não podem virar letras
import { abrir } from './piloto.mjs';
const t = await abrir({ nome: 'tnome', query: '?tela=nome', turbo: 1 });
const nome = () => t.ev(() => { const el = document.querySelector('.tela-nome'); return el ? null : 'fechou'; });
await t.espera(500);
const k = t.page.keyboard;
await k.press('z'); await t.espera(200); await k.press('z'); await t.espera(200); await k.press('x'); await t.espera(200);
await k.type('Bia'); await t.espera(200); await k.press('z'); await t.espera(300);
await t.foto('a');
await k.press('Enter'); await t.espera(400);
console.log('depois do Enter:', await nome());
await t.fim();
