import { abrir } from './lib.mjs';
const V = process.argv[2] ?? '13';
const t = await abrir(`?zona=A1&x=7&y=13&equipe=1:8,${V}:6&itens=radio-cipo,bike-bambu,vara-velha,passe-trem&amuletos=voo&flags=visitou:A2,visitou:A1,intro-ok&periodo=dia`);
try {
  await t.pronto(); await t.espera(300);
  await t.ev(() => { window.__pingo.jogo.opcoes.velTexto = 3; });
  await t.k('Escape', 400); await t.k('ArrowDown', 200); await t.k('z', 500);
  for (let i = 0; i < 5; i++) await t.k('ArrowRight', 150);
  await t.k('ArrowDown', 200); await t.k('z', 400); await t.foto('m-3'); await t.k('z', 700);
  let s = await t.st(); t.ok(s.modo === 'bike' && s.telas === 1, 'menu → Mochila → Bicicleta → Usar: fecha os menus e monta', JSON.stringify(s));
  await t.k('v', 300);
  // Voo
  await t.k('Escape', 400); await t.k('z', 500);
  for (let i = 0; i < 4; i++) await t.k('ArrowDown', 150);
  await t.k('z', 400); await t.k('z', 900); await t.foto('voo-1');
  console.log(await t.falas(2));
  await t.k('z', 1200); s = await t.st(); t.ok(/mapa/.test(s.topo), "Voo abre a tela 'mapa-mundi' no modo voo", s.topo); await t.foto('voo-2');
  await t.k('ArrowRight', 300); await t.k('ArrowUp', 300); await t.foto('voo-3'); await t.k('z', 600); await t.foto('voo-4'); await t.k('z', 600);
  await t.espera(3000); s = await t.assentar(15000, null).catch(() => t.st()); t.ok(s.zona === 'A2', 'Voo leva à cidade escolhida', JSON.stringify(s)); await t.foto('voo-fim');
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0)); await t.foto('erro'); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
