// Captura de uma rara com Cuia de Nível pela Mochila da batalha; depois Equipe, Resumo e Diário mostram a marca.
import { abrir } from './lib.mjs';
const t = await abrir('?zona=A-R2&x=14&y=11&dir=n&equipe=7:40&itens=cuia-nivel:9,cuia-ligeira:2&semente=11');
const { page } = t;
await t.pronto(); await t.assentar();
await t.ev(() => { window.__pingo.bus.on('batalha-inicio', (d) => { for (const c of d.pedido.inimigos) c.rara = true; }); });
await t.ev(() => { void window.__pingo.mundo.batalhaSelvagem(1, 6); });
const topo = () => t.ev(() => window.__pingo.telas.topo?.el.className ?? '');
// espera o menu de ações
const menu = async () => { for (let i = 0; i < 120; i++) { if (await t.ev(() => !!document.querySelector('.bt-menu'))) return true; await t.k('z', 200); } return false; };
let capturou = false;
for (let tent = 0; tent < 6 && !capturou; tent++) {
  if (!(await menu())) break;
  await t.k('ArrowDown', 250); await t.k('z', 500); // MOCHILA
  if (tent === 0) await t.foto('mochila-batalha');
  // procura a Cuia de Nível na lista
  for (let j = 0; j < 8; j++) { const sel = await t.ev(() => document.querySelector('.bt-mochila .bt-desc')?.textContent ?? ''); if (/urucum/.test(sel)) break; await t.k('ArrowDown', 150); }
  await t.k('z', 300);
  for (let i = 0; i < 60; i++) { await t.espera(150); const r = await t.ev(() => window.__pingo.jogo.save.equipe.length); if (r > 1) { capturou = true; break; } if (await t.ev(() => !!document.querySelector('.bt-menu'))) break; if (i % 6 === 5) await t.k('z', 50); }
}
for (let i = 0; i < 40 && (await t.ev(() => window.__pingo.telas.pilha.length > 1)); i++) { await t.k('x', 250); await t.k('z', 250); }
const eq = await t.ev(() => window.__pingo.jogo.save.equipe.map((c) => ({ e: c.especie, rara: !!c.rara, cuia: c.cuia, nv: c.nivel })));
t.ok(capturou && eq.some((c) => c.rara && c.cuia === 'cuia-nivel'), 'rara capturada com a Cuia de Nível', JSON.stringify(eq));
t.ok(await t.ev(() => !!window.__pingo.jogo.save.flags['rara:1']), 'Diário marcou a Pelagem Rara do nº 1');
await t.assentar(20000, 'x');
// telas: Equipe e Resumo
await t.ev(() => { const p = window.__pingo; void p.telas && import('/src/ui/dialogo.ts').then((d) => d.abrirTela('equipe')); });
await t.espera(1500); await t.foto('equipe-rara');
await t.ev(() => import('/src/ui/dialogo.ts').then((d) => d.abrirTela('resumo', { lista: window.__pingo.jogo.save.equipe, indice: 1 })));
await t.espera(1500); await t.foto('resumo-rara');
await t.ev(() => import('/src/ui/dialogo.ts').then((d) => d.abrirTela('diario', { especie: 1 })));
await t.espera(1500); await t.foto('diario-rara');
console.log('topo', await topo());
console.log('erros', t.erros.slice(0, 5));
await t.browser.close();
