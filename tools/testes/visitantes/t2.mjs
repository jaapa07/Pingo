import { abrir } from './lib.mjs';
for (const per of ['dia', 'noite']) {
  const Q = `?zona=A-R6&x=15&y=55&dir=n&modo=remo&periodo=${per}&insignias=16&amuletos=todos&equipe=9:70&flags=ea-missao&itens=frasco-vazio:2`;
  const t = await abrir(Q);
  await t.pronto(); await t.assentar();
  await t.passo('n'); await t.foto('ar6-' + per + '-antes');
  await t.tecla('n'); await t.espera(600); await t.foto('ar6-' + per + '-prompt');
  await t.assentar();
  console.log(per, (await t.falas(4)).join(' | '));
  const st = await t.ev(() => ({ m: window.__pingo.jogo.save.mochila, f: window.__pingo.jogo.save.flags['ea-frasco-escuro'], p: [window.__pingo.mundo.jogador.x, window.__pingo.mundo.jogador.y] }));
  console.log(JSON.stringify(st));
  t.ok(per === 'noite' ? st.f === true && st.m['frasco-agua-escura'] === 1 && st.m['frasco-vazio'] === 1 : !st.f, 'frasco escuro ' + per);
  console.log('erros', t.erros);
  await t.browser.close();
}
