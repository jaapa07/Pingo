// Ginásio de Treino: recepção (agenda), porta de saída (gatilho) e equipe da fase 4 com 16 insígnias.
import { abrir } from './lib.mjs';

const t = await abrir('?zona=A4-treino&x=9&y=13&dir=n&insignias=16&flags=liga-vencida,inicial,inicial-brasa,usina-ok&equipe=178:100,177:100&itens=radio-cipo', { turbo: 3 });
await t.pronto();
await t.ev(() => import('/src/battle/index.ts').then((m) => m.definirHeadless(true)));
await t.ev(() => { const s = window.__pingo.jogo.save, d = new Date(); s.relogio.diaSemana0 = (1 - d.getDay() + 7) % 7; s.relogio.deslocamentoMin = 8 * 60 - (d.getHours() * 60 + d.getMinutes()); });
// recepção
await t.virar('n'); await t.k('z', 400);
await t.espera(300); await t.k('z', 400); await t.foto('t4-recepcao');
let fs = await t.falas(2);
t.ok(fs.some((x) => /Quem aceita revanche hoje: .*Mestre Gaivota \(de manhã\)/.test(x)), 'recepção lê a agenda de hoje', fs.join(' | ').slice(0, 160));
await t.assentar(30000, 'z');
fs = await t.falas(3);
t.ok(fs.some((x) => /SEGUNDA-FEIRA: /.test(x)), 'recepção lê a agenda da semana', fs.join(' | ').slice(0, 200));
// fase 4: revanche marcada, luta e equipe
await t.ev(() => { const s = window.__pingo.jogo.save; s.flags['treino:lider-01'] = Math.floor((Date.now() + s.relogio.deslocamentoMin * 60000 - new Date().getTimezoneOffset() * 60000) / 86400000); });
await t.ev(() => { void window.__pingo.mundo.rodarEvento('treino-lider-01'); });
await t.assentar(120000, 'z');
const eq = await t.ev(() => window.__pingo.mundo.ultimaBatalha?.inimigos.map((c) => `${c.especie}:${c.nivel}`).join(' '));
t.ok(/^108:64 12:67 106:67 52:67 110:67 50:68$/.test(eq ?? ''), 'fase 4 (16 insígnias): Mestre Gaivota com 6 criaturas até o nível 68', eq);
// porta de saída
const st0 = await t.st();
await t.ev(() => window.__pingo.mundo.irPara('A4-treino', 9, 15, 's', 'nenhuma')); await t.espera(700);
await t.passo('s');
await t.assentar(20000, 'z');
const st = await t.st();
t.ok(st.zona === 'A4' && st.x === 17 && st.y === 18, 'a porta do salão leva de volta ao guia em A4', `${st0.zona} → ${st.zona} (${st.x},${st.y})`);
console.log('erros de página:', t.erros.length ? t.erros.slice(0, 5).join(' | ') : 'nenhum');
console.log('FALHAS:', t.falhas ?? 0);
await t.browser.close();
