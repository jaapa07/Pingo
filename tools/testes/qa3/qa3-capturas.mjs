// QA 3 — capturas de conferência (texto cortado, vulto, sobreposição, NPC tapando passagem) nos marcos do trecho B-1.
// Usa o último checkpoint (todas as flags já ganhas jogando) e só reposiciona o jogador para FOTOGRAFAR; não conta como jogo.
// Também confere o que acontece ao entrar na porta do ginásio de Cidade Ginga (B5-ginasio ainda não existe).
// Uso: qa3-run.sh qa3-capturas.mjs <seg> [save=b5]
import { abrir, lerSave } from './qa3-lib.mjs';
const t = await abrir(lerSave(process.argv[2] ?? 'b5'), { semente: 3 });
const Qr = (fn, arg) => t.q(fn, arg);
const LUGARES = [
  ['cap-b1-praca', 'B1', 21, 12, 's'], ['cap-b1-salao', 'B1-salao', 8, 6, 'n'], ['cap-b-pa-ninhal', 'B-PA', 29, 31, 'n'],
  ['cap-b2', 'B2', 23, 11, 'n'], ['cap-b2-centro', 'B2-centro', 8, 6, 'n'], ['cap-b9', 'B9', 22, 14, 'n'],
  ['cap-b3', 'B3', 23, 6, 'n'], ['cap-mina-2', 'B3-mina-2', 18, 13, 'n'], ['cap-b-ch', 'B-CH', 20, 60, 'n'],
  ['cap-b-cv-salao', 'B-CV', 20, 6, 'n'], ['cap-b4', 'B4', 25, 20, 'n'], ['cap-gin11', 'B4-ginasio', 8, 16, 'n'], ['cap-b5', 'B5', 26, 10, 'n'],
];
try {
  for (const [nome, z, x, y, d] of LUGARES) {
    await Qr(([z, x, y, d]) => window.__pingo.mundo.irPara(z, x, y, d, 'nenhuma'), [z, x, y, d]);
    await t.assentar(); await Qr(() => window.Q.quadros(90)); await t.page.waitForTimeout(2500);
    console.log(nome, JSON.stringify(await t.st()), 'npcs perto:', JSON.stringify((await t.npcs()).filter((n) => Math.abs(n.x - x) + Math.abs(n.y - y) <= 3)));
    await t.foto(nome);
  }
  // porta do ginásio de Cidade Ginga
  await Qr(() => window.__pingo.mundo.irPara('B5', 26, 10, 'n', 'nenhuma')); await t.assentar();
  const w = await Qr(() => window.__pingo.mundo.zona.warps.filter((w) => w.para.zona === 'B5-ginasio'));
  console.log('warps para B5-ginasio:', JSON.stringify(w));
  if (w.length) {
    await Qr(([x, y]) => window.Q.irAte(x, y + 1), [w[0].x, w[0].y]);
    await t.ir('n'); await Qr(() => window.Q.quadros(120)); await t.page.waitForTimeout(2000);
    console.log('depois da porta:', JSON.stringify(await t.st()), JSON.stringify(await t.falas(3)));
    await t.foto('cap-b5-porta-ginasio');
    await t.ir('s'); console.log('ainda anda?', JSON.stringify(await t.st()));
  }
} catch (e) { console.log('FALHA', e.message.split('\n')[0], JSON.stringify(await t.st().catch(() => 0))); await t.foto('cap-erro'); }
await t.fim();
