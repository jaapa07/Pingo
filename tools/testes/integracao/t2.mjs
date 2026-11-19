import { abrir } from './lib.mjs';
const t = await abrir('?zona=A1&equipe=1:8,10:6&itens=radio-cipo,bike-bambu,vara-velha,amuleto-voo&amuletos=voo,remo&flags=visitou:A2,visitou:A1,intro-ok&parceira=1&periodo=dia');
try {
  await t.pronto(); await t.espera(300);
  await t.ev(() => { window.__obs = []; window.__pingo.bus.on('obstaculo', (d) => window.__obs.push(d)); window.__pingo.jogo.opcoes.velTexto = 3; });
  let s = await t.st(); console.log('início', s);
  // parceira: anda e confere
  const livre = await t.ev(() => { const m = window.__pingo.mundo; const r = {}; for (const [d, dx, dy] of [['n', 0, -1], ['s', 0, 1], ['l', 1, 0], ['o', -1, 0]]) r[d] = '.,:;'.includes(m.tile(m.jogador.x + dx, m.jogador.y + dy)); return r; });
  const d = 's'; console.log('direção livre', d, livre);
  await t.ir(d + d);
  let p = await t.ev(() => { const a = window.__pingo.mundo.parceira; return a && { x: a.x, y: a.y, v: a.visivel, modelo: a.modelo, sprite: !!a.spr.meta }; });
  s = await t.st(); t.ok(p && p.v && Math.abs(p.x - s.x) + Math.abs(p.y - s.y) === 1, 'parceira segue um tile atrás', JSON.stringify(p) + ' jog ' + s.x + ',' + s.y);
  await t.foto('parceira-1');
  // tocar na parceira
  const op = { n: 's', s: 'n', l: 'o', o: 'l' }[d];
  await t.virar(op); await t.k('z', 500); let f = await t.falas(1); t.ok(f[0] && !/quer batalhar/.test(f[0]), 'fala ao tocar', f[0]); await t.foto('parceira-fala'); await t.assentar();
  // passos do companheiro
  await t.ev(() => { window.__pingo.jogo.save.flags['passos-parceira'] = 998; window.__am = window.__pingo.jogo.save.equipe[0].amizade; });
  await t.ir(d + d + d);
  let a = await t.ev(() => ({ achado: window.__pingo.jogo.save.flags['parceira-achado'], am: window.__pingo.jogo.save.equipe[0].amizade - window.__am, passos: window.__pingo.jogo.save.flags['passos-parceira'] }));
  t.ok(!!a.achado && a.am >= 3, 'Passos do Companheiro: achado e amizade', JSON.stringify(a));
  await t.virar(op); await t.k('z', 500); f = await t.falas(1); t.ok(/recebeu/.test(f[0]), 'entrega o achado', f[0]); await t.assentar();
  a = await t.ev(() => ({ moch: window.__pingo.jogo.save.mochila, achado: window.__pingo.jogo.save.flags['parceira-achado'] })); console.log(JSON.stringify(a));
  // atalho: bike registrada
  await t.ev(() => { window.__pingo.jogo.save.flags['atalho'] = 'bike-bambu'; });
  await t.k('v', 300); s = await t.st(); t.ok(s.modo === 'bike', 'atalho (SELECT) usa o item registrado: bicicleta', s.modo);
  await t.ir(d); p = await t.ev(() => window.__pingo.mundo.parceira?.visivel); t.ok(p === false, 'parceira some na bicicleta', p);
  await t.foto('bike'); await t.k('v', 300); s = await t.st(); t.ok(s.modo === 'pe', 'atalho de novo desce da bicicleta', s.modo);
  // atalho: rádio (item de tela)
  await t.ev(() => { window.__pingo.jogo.save.flags['atalho'] = 'radio-cipo'; });
  await t.k('v', 600); s = await t.st(); t.ok(/radio/.test(s.topo), 'atalho abre o Rádio Cipó', s.topo); await t.assentar(20000, 'x');
  // desligar a opção: a parceira some
  await t.ev(() => { window.__pingo.jogo.opcoes.parceiraSegue = false; }); await t.espera(200);
  p = await t.ev(() => window.__pingo.mundo.parceira); t.ok(p === null, 'opção desligada: sem parceira', p);
  await t.ev(() => { window.__pingo.jogo.opcoes.parceiraSegue = true; }); await t.espera(200); await t.ir(op);
  p = await t.ev(() => window.__pingo.mundo.parceira?.visivel); t.ok(p === true, 'religada: volta a seguir', p);
  // noite: dorme parada
  await t.ev(() => window.__pingo.mundo.relogio.forcarPeriodo('noite')); await t.espera(5200); await t.foto('parceira-noite');
  // contato: líder vencido
  await t.ev(() => window.__pingo.mundo.relogio.forcarPeriodo('dia'));
  const c = await t.ev(async () => { const p = window.__pingo; const m = await import('/src/world/deps.ts'); const ids = ['g01-lider', 'lider-01', 'ginasio-01-lider']; const tr = await import('/src/data/treinadores/ginasio-01.ts'); const lista = Object.values(tr).flat().filter((x) => x && x.id); const lider = lista.find((x) => x.insignia); p.bus.emit('treinador-vencido', { id: lider.id }); p.bus.emit('treinador-vencido', { id: lider.id }); return { lider: lider.id, contatos: p.jogo.save.contatos }; });
  t.ok(c.contatos.length === 1 && c.contatos[0] === c.lider, 'contato do líder entra (uma vez) em save.contatos', JSON.stringify(c));
  // obstáculo: procura água vizinha a chão
  const alvo = await t.ev(() => { const m = window.__pingo.mundo, z = m.zona; for (let y = 1; y < z.mapaChars.length - 1; y++) for (let x = 1; x < z.mapaChars[0].length - 1; x++) if ('.,:;'.includes(m.tile(x, y)) && m.tile(x, y - 1) === '~' && !m.npcs.some((n) => n.ator.x === x && n.ator.y === y)) return [x, y]; return null; });
  console.log('água ao norte de', alvo);
  if (alvo) {
    await t.ev(([x, y]) => window.__pingo.mundo.irPara('A1', x, y, 'n', 'nenhuma'), alvo); await t.espera(500);
    let o = await t.ev(() => window.__obs.slice(-1)[0]); t.ok(o && o.amuleto === 'remo', "bus 'obstaculo' { amuleto: remo }", JSON.stringify(o)); await t.foto('obstaculo');
    await t.virar('s'); await t.espera(150); o = await t.ev(() => window.__obs.slice(-1)[0]); t.ok(o && o.amuleto === null, "obstáculo some ao virar", JSON.stringify(o));
  }
  // clima
  const cl = await t.ev(() => { const p = window.__pingo; let r = null; p.bus.on('clima', (d) => { r = d; }); p.mundo.definirClima('chuva'); return r; }); t.ok(cl && cl.id === 'chuva', "bus 'clima'", JSON.stringify(cl));
  await t.espera(300); await t.foto('clima'); await t.ev(() => window.__pingo.mundo.definirClima('limpo'));
  // menu → mochila → bicicleta
  await t.k('Escape', 500); s = await t.st(); t.ok(/menu/.test(s.topo), 'menu abre a partir do mundo', s.topo); await t.foto('menu');
  const rot = await t.ev(() => [...document.querySelectorAll('.tela-menu .lista > *, .tela-menu [class*=item]')].length); console.log('itens no menu', rot);
} catch (e) { console.log('FALHA', e.message, await t.st().catch(() => 0)); await t.foto('erro'); }
console.log('erros', t.erros.slice(0, 8));
await t.browser.close();
