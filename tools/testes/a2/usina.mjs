// Usina Velha inteira: Estrada da Usina → capangas do pátio → alavanca → porão (chave geral) → passarelas → tenente Lata
import { abrir } from './lib.mjs';
const t = await abrir('A-R4', 1, 12, '&dir=l&insignias=3&amuletos=facao,remo');
try {
  let s = await t.irAte(70, 11); await t.confere(s.zona === 'A-US-1', `entrou na Usina (${s.zona} ${s.x},${s.y}) batalhas=${s.nb}`);
  await t.confere(s.nb >= 2, 'os dois capangas do pátio desafiaram');
  await t.foto('usina-1');
  // sem a alavanca, a grade fecha a sala leste
  await t.confere((await t.plano(28, 2)) === null, 'escada leste fechada pela grade');
  await t.usar(5, 2); let f = await t.flags('usina'); await t.confere(f.flags.includes('usina-grade'), 'alavanca soltou a grade: ' + (await t.falas(1)));
  s = await t.irAte(1, 2); await t.confere(s.zona === 'A-US-3', 'desceu ao porão');
  await t.foto('usina-3');
  await t.usar(24, 2); f = await t.flags('usina'); await t.confere(f.flags.includes('usina-energia'), 'chave geral ligada: ' + (await t.falas(1)));
  await t.usar(2, 13); console.log('   jaula:', (await t.falas(1))[0].slice(0, 70));
  s = await t.irAte(1, 2); await t.confere(s.zona === 'A-US-1', 'voltou ao térreo');
  s = await t.irAte(28, 2); await t.confere(s.zona === 'A-US-2', 'subiu às passarelas');
  await t.foto('usina-2');
  s = await t.irAte(14, 5); s = await t.assentar();
  f = await t.flags('usina|venceu:A-US'); console.log('   flags:', f.flags.join(' '));
  await t.confere(f.flags.includes('usina-ok'), 'tenente Lata vencida: usina-ok');
  await t.confere((f.mochila['pt-18'] ?? 0) === 1 && !f.mochila['passe-trem'], 'recompensa sem Passe do Trem');
  console.log('   falas finais:', (await t.falas(4)).map((x) => x.slice(0, 80)));
  await t.foto('usina-fim');
  // buraco da passarela → depósito oeste → mureta
  s = await t.irAte(12, 12); await t.confere(s.zona === 'A-US-1' && s.x === 2 && s.y === 14, `caiu no depósito oeste (${s.zona} ${s.x},${s.y})`);
  await t.usar(1, 13); await t.ir('l'); s = await t.st(); await t.confere(s.x === 4 && s.y === 14, `pulou a mureta (${s.x},${s.y})`);
  s = await t.irAte(15, 21); await t.confere(s.zona === 'A-R4', 'saiu para a estrada');
  const n = await t.pagina(() => window.__pingo.mundo.npcs.map((q) => q.id));
  await t.confere(!n.includes('capanga-a') && n.includes('eletricista-2'), 'pátio sem capangas e eletricista com a fala nova');
  console.log('batalhas no total:', s.nb);
} catch (e) { console.log('FALHA', e.message, JSON.stringify(await t.st()), await t.falas(3)); await t.foto('erro'); }
await t.fim();
