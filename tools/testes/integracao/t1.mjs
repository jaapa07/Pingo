import { abrir, S } from './lib.mjs';
const t = await abrir('?zona=A1-quarto&x=5&y=5&equipe=1:8&itens=radio-cipo,bike-bambu,vara-velha');
try {
  await t.pronto(); await t.espera(400);
  await t.foto('q-1');
  let n = await t.ev(() => document.querySelectorAll('.deco').length); t.ok(n >= 5, 'decoração montada', n);
  // cama
  await t.ir('lll'); let s = await t.st(); console.log('pos', s.x, s.y);
  await t.ev(() => window.__pingo.mundo.irPara('A1-quarto', 8, 3, 'l', 'nenhuma')); await t.espera(300);
  await t.k('z', 400); let f = await t.falas(1); t.ok(/cama/i.test(f[0]), 'exame da cama', f[0]); await t.assentar();
  // troca tapete e pelucia via bus
  await t.ev(() => { const p = window.__pingo; p.jogo.save.decoracao.tapete = 'tapete-b'; p.jogo.save.decoracao.pelucia = 'pelucia-b'; p.jogo.save.decoracao.poster = 'poster-b'; p.jogo.save.decoracao.movel = ''; p.bus.emit('decoracao', { categoria: 'tapete', id: 'tapete-b' }); });
  await t.espera(200); await t.foto('q-2');
  await t.k('z', 400); f = await t.falas(1); t.ok(/simples/i.test(f[0]), 'cama simples após trocar', f[0]); await t.assentar();
  // pelúcia bloqueia (1,6)
  const blo = await t.ev(() => { const z = window.__pingo.mundo; return [z.tile(1, 6)]; }); console.log(blo);
  // pc-quarto pelo objeto: (1,2) → de (1,3) olhando n
  await t.ev(() => window.__pingo.mundo.irPara('A1-quarto', 1, 3, 'n', 'nenhuma')); await t.espera(300);
  await t.k('z', 500); await t.k('z', 600); await t.k('z', 600);
  s = await t.st(); t.ok(/pc/.test(s.topo), 'script pc-quarto abre a tela real', s.topo); await t.foto('q-pc');
  await t.k('x', 300); await t.k('x', 300); await t.assentar(20000, 'x');
  // scripts viveiro, radio, loja
  for (const [ev, re] of [['viveiro', /viveiro/], ['radio', /radio/]]) {
    t.ev((id) => { void window.__pingo.mundo.rodarEvento(id); }, ev);
    await t.espera(500); for (let i = 0; i < 4; i++) { const q = await t.st(); if (re.test(q.topo)) break; await t.k('z', 400); }
    s = await t.st(); t.ok(re.test(s.topo), `script ${ev} abre a tela real`, s.topo); await t.foto('tela-' + ev);
    await t.assentar(20000, 'x');
  }
  t.ev(() => { void window.__pingo.mundo.rodarPassos([['loja', ['cuia-simples', 'cha-cidreira']]]); }); await t.espera(600);
  s = await t.st(); t.ok(/loja/.test(s.topo), 'comando loja abre a tela real', s.topo); await t.foto('tela-loja'); await t.assentar(20000, 'x');
  // diálogo sobre a cortina
  t.ev(() => { void window.__pingo.mundo.rodarPassos([['fade', 'fora'], ['falar', null, 'Tudo escuro… mas a fala aparece por cima da cortina.'], ['fade', 'dentro']]); });
  await t.espera(1400); await t.foto('fade-fala');
  const z = await t.ev(() => { const d = document.querySelector('.tela.dialogo'), c = document.querySelector('.cortina'); return [d && getComputedStyle(d).zIndex, c && getComputedStyle(c).zIndex, c && getComputedStyle(c).opacity]; });
  t.ok(Number(z[0]) > Number(z[1]) && z[2] === '1', 'diálogo acima da cortina fechada', z.join(','));
  await t.assentar();
  // cinemática
  t.ev(() => { void window.__pingo.mundo.rodarPassos([['cinematica', 'trem']]); }); await t.espera(1800); await t.foto('cine-trem');
  s = await t.st(); t.ok(/cinematica/.test(s.topo), 'tela cinematica (trem)', s.topo);
  await t.espera(4200); s = await t.st(); t.ok(!/cinematica/.test(s.topo), 'cinemática termina sozinha', s.topo);
  t.ev(() => { void window.__pingo.mundo.rodarPassos([['cinematica', 'saveiro']]); }); await t.espera(1500); await t.foto('cine-saveiro');
  await t.k('z', 300); s = await t.st(); t.ok(!/cinematica/.test(s.topo), 'cinemática pulável com A', s.topo);
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0)); await t.foto('erro'); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
