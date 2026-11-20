// Rival semanal numa terça (spec 10A item 27) e Quiz do Rádio com 4 e com 3 acertos (item 31).
import { abrir } from './lib.mjs';

const t = await abrir('?zona=A-GE&x=46&y=6&dir=l&insignias=8&flags=liga-vencida,inicial,inicial-rio,usina-ok&equipe=178:100,177:100,173:100&itens=radio-cipo', { turbo: 3 });
await t.pronto();
// batalhas sem tela (piloto padrão do motor): o teste é do fluxo das regras, não da tela de batalha
await t.ev(() => import('/src/battle/index.ts').then((m) => m.definirHeadless(true)));
const relogio = (dia, min) => t.ev(([dia, min]) => { const s = window.__pingo.jogo.save, d = new Date(); s.relogio.diaSemana0 = (dia - d.getDay() + 7) % 7; s.relogio.deslocamentoMin = min - (d.getHours() * 60 + d.getMinutes()); }, [dia, min]);
const recarregar = () => t.ev(() => window.__pingo.mundo.recarregar()).then(() => t.espera(900)).then(() => t.pronto());

// segunda: a Tainá não está
await relogio(1, 14 * 60); await recarregar();
let npcs = await t.ev(() => window.__pingo.mundo.npcs.map((n) => n.id));
t.ok(!npcs.includes('rival-semanal'), 'segunda: rival semanal ausente');
// terça: aparece
await relogio(2, 14 * 60); await recarregar(); await t.espera(600);
npcs = await t.ev(() => window.__pingo.mundo.npcs.map((n) => n.id));
t.ok(npcs.includes('rival-semanal'), 'terça: rival semanal na Gruta do Eco', npcs.join(','));
await t.foto('t2-rival');
const din0 = await t.ev(() => window.__pingo.jogo.save.jogador.dinheiro);
await t.virar('l'); await t.k('z', 400);
await t.assentar(300000, 'z');
const eq = await t.ev(() => window.__pingo.mundo.ultimaBatalha?.inimigos.map((c) => `${c.especie}:${c.nivel}`).join(' '));
const din1 = await t.ev(() => window.__pingo.jogo.save.jogador.dinheiro);
const f = await t.ev(() => { const x = window.__pingo.jogo.save.flags; return { v: x['rival-semanal-vitorias'], d: x['rival-semanal-dia'] }; });
t.ok(f.v === 1 && din1 > din0, 'rival semanal vencida (fase 3)', `equipe ${eq} · +${din1 - din0}`);
npcs = await t.ev(() => window.__pingo.mundo.npcs.map((n) => n.id));
t.ok(!npcs.includes('rival-semanal'), 'depois da luta ela sai (1 por dia)');
await recarregar();
npcs = await t.ev(() => window.__pingo.mundo.npcs.map((n) => n.id));
t.ok(!npcs.includes('rival-semanal'), 'mesmo dia, de novo na gruta: não volta');

// QUIZ — Rádio Farol (A6)
await t.ev(() => window.__pingo.mundo.irPara('A6', 28, 26, 'l', 'nenhuma')); await t.espera(900); await t.pronto();
const quiz = await t.ev(() => import('/src/data/quiz.ts').then((m) => m.QUIZ_FAUNA.map((q) => [q.p, q.r])));
const resposta = new Map(quiz);
async function jogarQuiz(errar) {
  let n = 0, erradas = 0; const vistas = new Set();
  await t.ev(() => { void window.__pingo.mundo.rodarEvento('quiz-radio'); });
  for (let guarda = 0; guarda < 400; guarda++) {
    const st = await t.st();
    if (!st.oc && st.telas <= 1) break;
    const ult = await t.ev(() => { const f = window.__pingo.mundo.falas; return f[f.length - 1]; });
    const m = ult && ult.t === 'escolher' ? /^Pergunta (\d): (.*)$/.exec(ult.texto) : null;
    const topo = await t.ev(() => window.__pingo.telas.topo?.el.className ?? '');
    if (m && !vistas.has(m[1]) && /escolh|menu|sim/i.test(topo + ' escolher')) {
      vistas.add(m[1]); n++;
      await t.espera(300);
      const certa = resposta.get(m[2]);
      const responder = erradas < errar ? !certa : certa; if (erradas < errar) erradas++;
      if (!responder) await t.k('ArrowDown', 150);
      await t.k('z', 300);
      continue;
    }
    await t.k('z', 140);
  }
  return n;
}
const n4 = await jogarQuiz(1);
const r4 = await t.ev(() => ({ a: window.__pingo.jogo.save.flags['quiz-acertos'], c: window.__pingo.jogo.save.mochila['cartao-radio'] ?? 0 }));
t.ok(n4 === 5 && r4.a === 4 && r4.c === 1, 'quiz com 4 acertos dá o Cartão do Rádio', JSON.stringify(r4));
// no mesmo dia: recusa
await t.ev(() => { void window.__pingo.mundo.rodarEvento('quiz-radio'); }); await t.espera(400);
let fs = await t.falas(1); await t.assentar(20000, 'z');
t.ok(/já foi ao ar/.test(fs[0] ?? ''), 'um quiz por dia');
// dia seguinte, 3 acertos, num save sem o cartão
await t.ev(() => { const s = window.__pingo.jogo.save; delete s.mochila['cartao-radio']; s.relogio.deslocamentoMin += 1440; });
const n3 = await jogarQuiz(2);
const r3 = await t.ev(() => ({ a: window.__pingo.jogo.save.flags['quiz-acertos'], c: window.__pingo.jogo.save.mochila['cartao-radio'] ?? 0 }));
t.ok(n3 === 5 && r3.a === 3 && r3.c === 0, 'quiz com 3 acertos não dá o cartão', JSON.stringify(r3));
fs = await t.falas(12);
t.ok(fs.some((x) => /A resposta é (SIM|NÃO)/.test(x)), 'cada resposta vem explicada');
console.log('erros de página:', t.erros.length ? t.erros.slice(0, 5).join(' | ') : 'nenhum');
console.log('FALHAS:', t.falhas ?? 0);
await t.browser.close();
