import { abrir } from './lib.mjs';
const Q = '?zona=A4&x=31&y=38&dir=l&insignias=16&amuletos=todos&equipe=9:70,100:70&flags=liga-vencida,usina-ok,rival-3,intro-ok,diario';
const t = await abrir(Q);
await t.pronto(); await t.assentar();
await t.foto('a4-canoeiro');
// fala com o canoeiro (a leste)
await t.virar('l'); await t.k('z', 300); const s = await t.assentar();
console.log(await t.falas(8));
const st = await t.ev(() => ({ m: window.__pingo.jogo.save.mochila['frasco-vazio'], f: window.__pingo.jogo.save.flags['ea-missao'] }));
t.ok(st.m === 2 && st.f, 'canoeiro deu 2 frascos e ea-missao', JSON.stringify(st));
// segunda conversa: lembra o que falta
await t.k('z', 300); await t.assentar();
console.log((await t.falas(3)).join('\n---\n'));
console.log('erros', t.erros);
await t.browser.close();
