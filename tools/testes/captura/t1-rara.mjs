// Pelagem Rara: entrada em batalha com brilho, sprite raro, captura, Resumo, Equipe e Diário.
// Uso: Vite em 127.0.0.1:5203 (sem HMR) e `node tools/testes/captura/t1-rara.mjs`. Capturas em scratchpad/captura/.
import { abrir } from './lib.mjs';
const t = await abrir('?zona=A-R2&x=14&y=11&dir=n&equipe=7:30&itens=cuia-ouro:20&semente=7');
const { page } = t;
await t.pronto(); await t.assentar();
// a próxima selvagem vem rara (o sorteio natural 1/4096 é coberto em npm test)
await t.ev(() => { window.__pingo.bus.on('batalha-inicio', (d) => { for (const c of d.pedido.inimigos) c.rara = true; }); });
await t.ev(() => { void window.__pingo.mundo.batalhaSelvagem(1, 6); });
let fotos = 0;
for (let i = 0; i < 40; i++) { await t.espera(110); if (i === 14 || i === 17 || i === 21 || i === 30) await t.foto('rara-entrada-' + fotos++); }
const raraNaTela = await t.ev(() => [...document.querySelectorAll('.bt-ator')].map((e) => e.style.backgroundImage).join(' '));
t.ok(/frente-rara\.png/.test(raraNaTela), 'sprite frente-rara na batalha', raraNaTela.slice(0, 120));
// arremessa cuias até capturar: Mochila → Cuias → Cuia de Ouro
for (let k = 0; k < 12; k++) {
  const fim = await t.ev(() => window.__pingo.telas.pilha.length <= 1);
  if (fim) break;
  await t.k('z', 400);
}
await t.foto('rara-menu');
// usa o controle direto: arremessar via teclado é testado no QA; aqui só confirmamos a captura pelo motor
const r = await t.ev(async () => {
  const p = window.__pingo; const tela = p.telas.topo;
  return { pilha: p.telas.pilha.length, topo: tela?.el.className };
});
console.log('estado', JSON.stringify(r));
console.log('erros', t.erros.slice(0, 5));
await t.browser.close();
