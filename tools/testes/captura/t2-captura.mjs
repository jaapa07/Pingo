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
await t.ev(() => { window.__fim = null; window.__pingo.bus.on('batalha-fim', (d) => { window.__fim = d.resultado; }); });
let capturou = false;
for (let tent = 0; tent < 6 && !capturou; tent++) {
  if (!(await menu())) break;
  await t.k('ArrowLeft', 200); await t.k('ArrowDown', 250); await t.k('z', 500); // MOCHILA (o menu lembra a última ação: volta ao LUTAR antes)
  if (tent === 0) await t.k('ArrowRight', 400); // bolso Cuias (a escolha fica lembrada)
  await t.k('ArrowDown', 250); // a 2ª da lista: Cuia de Nível
  await t.k('z', 300);
  for (let i = 0; i < 200; i++) {
    await t.espera(150);
    const fim = await t.ev(() => window.__fim);
    if (fim) { capturou = fim === 'captura'; break; }
    if (await t.ev(() => !!document.querySelector('.bt-menu'))) break;
    if (i % 5 === 4) await t.k('x', 50); // avança o texto e recusa o apelido
  }
  if (tent === 0) await t.foto('depois-arremesso');
}
for (let i = 0; i < 60 && (await t.ev(() => window.__pingo.telas.pilha.length > 1)); i++) await t.k('x', 250);
const eq = await t.ev(() => window.__pingo.jogo.save.equipe.map((c) => ({ e: c.especie, rara: !!c.rara, cuia: c.cuia, nv: c.nivel })));
t.ok(capturou && eq.some((c) => c.rara && c.cuia === 'cuia-nivel'), 'rara capturada com a Cuia de Nível', JSON.stringify(eq));
t.ok(await t.ev(() => !!window.__pingo.jogo.save.flags['rara:1']), 'Diário marcou a Pelagem Rara do nº 1');
await t.assentar(20000, 'x');
// telas: Equipe e Resumo
await t.ev(() => { void import('/src/ui/dialogo.ts').then((d) => d.abrirTela('equipe')); });
await t.espera(1500); await t.foto('equipe-rara'); await t.k('x', 800);
await t.ev(() => { void import('/src/ui/dialogo.ts').then((d) => d.abrirTela('resumo', { lista: window.__pingo.jogo.save.equipe, indice: 1 })); });
await t.espera(1500); await t.foto('resumo-rara'); await t.k('x', 800);
await t.ev(() => { void import('/src/ui/dialogo.ts').then((d) => d.abrirTela('diario', { especie: 1 })); });
await t.espera(1500); await t.foto('diario-rara');
console.log('topo', await topo());
console.log('erros', t.erros.slice(0, 5));
await t.browser.close();
