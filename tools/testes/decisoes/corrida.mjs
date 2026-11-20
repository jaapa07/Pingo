// Corrida da Vereda medida como gente (tools/testes/posliga/humano.js) e "tocando sem mirar" (toques nas raias em rodízio
// a cada 350 ms, como o QA do pós-Liga no iPhone). Abre a prova direto (tela `gincana`) com a melhor corredora do
// Campeão do QA (save tools/testes/posliga/saves/pos-r5-gincana.json), em tempo real, e imprime os pontos.
// Uso: run.sh corrida.mjs <seg> <gente|toque|parado> [semente=1] [rodadas=1] [suco=caju|nenhum]
import { readFileSync } from 'node:fs';
import { abrir } from './lib.mjs';
const [MODO, SEM, N, SUCO] = [process.argv[2] ?? 'gente', Number(process.argv[3] ?? 1), Number(process.argv[4] ?? 1), process.argv[5] ?? 'caju'];
const sv = JSON.parse(readFileSync(new URL('../posliga/saves/pos-r5-gincana.json', import.meta.url), 'utf8'));
const t = await abrir(sv, { rapido: false, anim: true });
await t.page.addScriptTag({ content: readFileSync(new URL('../posliga/humano.js', import.meta.url), 'utf8') });
const res = [];
try {
  for (let i = 0; i < N; i++) {
    const info = await t.q(async (suco) => {
      const B = await import('/src/battle/index.ts'), G = await import('/src/data/gincana.ts'), D = await import('/src/world/deps.ts');
      const eq = window.__pingo.jogo.save.equipe;
      const nota = (c) => { const a = B.atributos(c); return a.vel + 0.3 * a.def; };
      let k = 0; eq.forEach((c, j) => { if (!c.ovo && nota(c) > nota(eq[k])) k = j; });
      const c = eq[k];
      if (suco !== 'nenhum') G.tomarSuco(c, G.SUCOS.find((s) => s.fruto === suco)); else delete window.__pingo.jogo.save.flags['gincana-suco:' + c.uid];
      window.__fim = null;
      void D.abrirTela('gincana', { prova: 'agilidade', uid: c.uid }).then((r) => { window.__fim = r; });
      return { especie: c.especie, vel: B.atributos(c).vel, def: B.atributos(c).def, rivais: G.RIVAIS.map((r) => G.pontosRival(r, 'agilidade')) };
    }, SUCO);
    await t.page.waitForSelector('.tela-gincana', { timeout: 20000 });
    if (MODO === 'gente') {
      await t.q(([p, o]) => window.H.jogar(p, o), ['agilidade', { semente: SEM + i }]);
    } else {
      // toque à toa: rodízio das raias a cada 350 ms (ou nada, no modo "parado")
      await t.q(async (modo) => {
        let k = 0;
        while (!document.querySelector('.tela-gincana .gn-res')) {
          if (modo === 'toque') {
            const zs = [...document.querySelectorAll('.tela-gincana .gn-raia-toque')];
            const z = zs[k++ % 3];
            if (z) for (const tp of ['pointerdown', 'pointerup']) z.dispatchEvent(new PointerEvent(tp, { bubbles: true, pointerType: 'touch' }));
          }
          await new Promise((r) => setTimeout(r, 350));
        }
      }, MODO);
    }
    const pts = await t.q(() => Number(/(\d+) pontos/.exec(document.querySelector('.tela-gincana .gn-res')?.textContent ?? '')?.[1] ?? -1));
    await t.q(async () => { const I = await import('/src/core/input.ts'); document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyZ', key: 'z', bubbles: true })); await new Promise((r) => setTimeout(r, 120)); document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyZ', key: 'z', bubbles: true })); void I; });
    await t.page.waitForFunction(() => window.__fim, null, { timeout: 10000 }).catch(() => 0);
    res.push(pts);
    console.log(`corrida ${MODO} semente ${SEM + i}: ${pts} pontos (criatura ${info.especie}, vel ${info.vel}, def ${info.def}; suco ${SUCO}; rivais hoje ${info.rivais.join('/')})`);
  }
  console.log(`RESUMO ${MODO}: ${res.join(', ')}`);
} finally { await t.fim(); }
