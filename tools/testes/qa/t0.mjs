import { abrir } from './piloto.mjs';
const t = await abrir({ nome: 't0' });
t.respostas.unshift([/dificuldade/i, 'Aventureiro (Recomendado)']);
try {
  for (let i = 0; i < 400; i++) {
    const s = await t.snap();
    if (i % 25 === 0) { console.log(i, JSON.stringify(s)); await t.foto('ab' + String(i).padStart(3, '0')); }
    if (s.pronto && !s.oc && s.telas === 1 && s.zona) break;
    if (s.dlg?.fase === 'escolhendo') { console.log('ESCOLHA', s.dlg); const alvo = /dificuldade/i.test(s.dlg.texto) ? 1 : 0; for (let k = 0; k < (alvo - s.dlg.indice + s.dlg.opcoes.length) % s.dlg.opcoes.length; k++) await t.toque('ArrowDown'); await t.toque('KeyZ', 150); continue; }
    if (/tela-nome/.test(s.topo)) { await t.foto('nome'); await t.toque('Enter', 200); continue; }
    await t.toque('KeyZ', 120);
  }
  console.log(JSON.stringify(await t.snap()), JSON.stringify(await t.resumo()));
  await t.foto('fim');
} catch (e) { console.log('FALHA', e.message); await t.foto('erro'); }
await t.fim();
