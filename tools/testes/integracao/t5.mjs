import { abrir, pw } from './lib.mjs';
const casos = [['iPhone 13', 'ip13-pe'], ['iPhone 13 landscape', 'ip13-deitado'], ['iPhone SE landscape', 'se-deitado'], ['iPhone SE', 'se-pe'], ['iPad Mini landscape', 'ipad-deitado']];
for (const [dev, nome] of casos.filter((c) => !process.argv[2] || c[1].includes(process.argv[2]))) {
  const t = await abrir('?zona=A1&x=7&y=13&equipe=1:8,30:6&itens=radio-cipo,bike-bambu&flags=intro-ok&periodo=dia', { contexto: { ...pw.devices[dev] } });
  try {
    await t.pronto(); await t.espera(400);
    const info = await t.ev(async () => { const p = window.__pingo.palco; const m = await import('/src/ui/toque.ts'); const r = m.retangulosToque(); const o = {}; for (const k in r) o[k] = [Math.round(r[k].left), Math.round(r[k].top), Math.round(r[k].width), Math.round(r[k].height)]; return { modo: p.modo, ctrl: p.controles, escala: p.escala, dpr: p.dpr, vw: p.vw, vh: p.vh, palco: [p.x, p.y, p.w, p.h], r: o }; });
    console.log(nome, JSON.stringify(info));
    // sobreposição com o palco
    const P = info.palco; const cobre = Object.entries(info.r).filter(([, r]) => r[0] < P[0] + P[2] && r[0] + r[2] > P[0] && r[1] < P[1] + P[3] && r[1] + r[3] > P[1]).map(([k]) => k);
    t.ok(cobre.length === 0 || info.ctrl === 'sobre', `${nome}: controles fora do palco`, cobre.join(','));
    await t.foto(nome + '-mundo');
    // diálogo
    t.ev(() => { void window.__pingo.mundo.rodarPassos([['falar', { nome: 'Mãe' }, 'Filho, não esquece o casaco! Lá na serra faz um frio de rachar e a neblina não perdoa ninguém.']]); }); await t.espera(1500); await t.foto(nome + '-fala');
    // toque no botão A fecha a fala
    const A = info.r.a; await t.page.touchscreen.tap(A[0] + A[2] / 2, A[1] + A[3] / 2); await t.espera(400); await t.page.touchscreen.tap(A[0] + A[2] / 2, A[1] + A[3] / 2); await t.espera(600);
    let s = await t.st(); t.ok(s.telas === 1, `${nome}: botão A por toque avança a fala`, s.topo);
    // direcional por toque: anda para baixo
    const D = info.r.dpad; const y0 = s.y;
    await t.ev(([x, y]) => { const el = document.elementFromPoint(x, y); const mk = (tipo) => new PointerEvent(tipo, { pointerId: 7, clientX: x, clientY: y, bubbles: true, pointerType: 'touch' }); el.dispatchEvent(mk('pointerdown')); window.__sol = () => el.dispatchEvent(mk('pointerup')); }, [D[0] + D[2] / 2, D[1] + D[3] * 0.85]);
    await t.espera(700); await t.ev(() => window.__sol()); await t.espera(400); s = await t.st(); t.ok(s.y > y0, `${nome}: direcional por toque anda`, `${y0}→${s.y}`);
    // menu por toque
    const M = info.r.menu; await t.page.touchscreen.tap(M[0] + M[2] / 2, M[1] + M[3] / 2); await t.espera(600); s = await t.st(); t.ok(/menu/.test(s.topo), `${nome}: botão Menu por toque`, s.topo); await t.foto(nome + '-menu');
    const B = info.r.b; await t.page.touchscreen.tap(B[0] + B[2] / 2, B[1] + B[3] / 2); await t.espera(500);
    // batalha
    t.ev(() => { void window.__pingo.mundo.batalhaSelvagem(10, 4); }); await t.espera(6000); await t.foto(nome + '-batalha');
  } catch (e) { console.log('FALHA', nome, e.message); await t.foto('erro-' + nome); }
  if (t.erros.length) console.log('erros', t.erros.slice(0, 5));
  await t.browser.close();
}
