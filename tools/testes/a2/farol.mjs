// Farol inteiro: Ilha do Farol → capangas do cabo → térreo → alavanca do 2º andar → buraco/depósito → grade →
// rival-4 no 3º andar → tenente Rebite (Lampião) → remédio da Faísca → ginásio aberto
import { abrir } from './lib.mjs';
const t = await abrir('A6', 9, 15, '&dir=l&insignias=4&amuletos=facao,remo&flags=inicial-mata');
const so = (r) => t.flags(r);
try {
  await t.confere((await t.plano(16, 8)) === null, 'ginásio trancado antes do Farol');
  let s = await t.irAte(37, 4); await t.confere(s.zona === 'A6-farol-1', `entrou no farol (batalhas=${s.nb})`);
  await t.confere(s.nb >= 1, 'capanga do caminho do cabo desafiou');
  await t.foto('farol-1');
  await t.confere((await t.plano(14, 2)) === null, 'escada leste fechada pela grade');
  s = await t.irAte(1, 2); await t.confere(s.zona === 'A6-farol-2', '2º andar (lado oeste)');
  await t.confere((await t.plano(14, 11)) === null, 'do lado oeste não se chega à escada do 3º andar');
  await t.usar(1, 11); await t.confere((await so('farol')).flags.includes('farol-grade'), 'alavanca: ' + (await t.falas(1))[0].slice(0, 60));
  await t.foto('farol-2');
  s = await t.irAte(6, 9); await t.confere(s.zona === 'A6-farol-1' && s.x === 8 && s.y === 3, `caiu no depósito do térreo (${s.zona} ${s.x},${s.y})`);
  await t.agir('s'); await t.confere(((await so('x')).mochila['pt-19'] ?? 0) === 1, 'pegou o pergaminho do depósito');
  await t.ir('ss'); s = await t.st(); await t.confere(s.y === 6, `pulou a mureta (${s.x},${s.y})`);
  s = await t.irAte(14, 2); await t.confere(s.zona === 'A6-farol-2' && s.x === 13, '2º andar (lado leste) pela grade aberta');
  s = await t.irAte(14, 11); await t.confere(s.zona === 'A6-farol-3', '3º andar');
  s = await t.irAte(4, 8); s = await t.assentar();
  let f = await so('rival|batalha'); await t.confere(f.flags.includes('rival-4'), 'rival-4 lutou e curou: ' + (await t.falas(2)).map((x) => x.slice(0, 50)).join(' | '));
  await t.confere(!(await t.pagina(() => window.__pingo.mundo.npcs.map((q) => q.id))).includes('taina'), 'Tainá saiu de cena');
  await t.foto('farol-3');
  s = await t.irAte(1, 2); await t.confere(s.zona === 'A6-farol-4', 'sala da lanterna');
  const nb0 = s.nb;
  await t.ir('sssss'); s = await t.assentar();
  f = await so('farol|venceu:A6|m-xarope'); console.log('   flags:', f.flags.join(' '), '| amuletos:', f.amuletos.join(','), '| batalhas na sala:', s.nb - nb0);
  await t.confere(f.flags.includes('farol-ok') && f.amuletos.includes('lampiao') && s.nb - nb0 === 3, 'Rebite vencido depois dos 2 capangas: farol-ok + Lampião');
  await t.confere(!f.mochila['bilhete-saveiro'], 'o Farol não dá mais o Bilhete do Saveiro');
  await t.foto('farol-4');
  await t.usar(11, 3); console.log('   Volta:', (await t.falas(1))[0].slice(0, 90));
  await t.usar(6, 9); console.log('   aquário:', (await t.falas(1))[0].slice(0, 90));
  await t.pagina(() => { window.__pingo.jogo.save.flags['xarope-na-mao'] = true; });
  await t.usar(11, 3); f = await so('farol'); await t.confere(f.flags.includes('farol-remedio'), 'xarope entregue: farol-remedio');
  await t.confere(!(await t.pagina(() => window.__pingo.mundo.npcs.map((q) => q.id))).some((i) => /volta/.test(i)), 'o Volta desceu para o ginásio');
  // descida e ginásio
  s = await t.irAte(1, 2); s = await t.irAte(14, 11); s = await t.irAte(14, 2); s = await t.irAte(7, 13);
  await t.confere(s.zona === 'A6', `saiu do farol (${s.zona} ${s.x},${s.y})`);
  await t.confere(!(await t.pagina(() => window.__pingo.mundo.npcs.map((q) => q.id))).some((i) => /^A6-[23]$/.test(i)), 'capangas do cabo foram embora');
  s = await t.irAte(35, 12); await t.ir('s'); s = await t.st(); await t.confere(s.y === 14, `pulou a saliência do platô (${s.x},${s.y})`);
  s = await t.irAte(16, 8); await t.confere(s.zona === 'A6-ginasio', `ginásio aberto (${s.zona})`);
  console.log('batalhas no total:', s.nb);
} catch (e) { console.log('FALHA', e.message, JSON.stringify(await t.st()), await t.falas(3)); await t.foto('erro'); }
await t.fim();
