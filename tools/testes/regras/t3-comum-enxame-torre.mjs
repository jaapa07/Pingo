// Revanche de treinador comum pelo rádio (dia certo/errado, fase), tabela de Revanches, enxame do dia e Torre de Desafios.
import { abrir } from './lib.mjs';

const t = await abrir('?zona=A-LG&x=4&y=54&dir=n&insignias=8&flags=liga-vencida,inicial,inicial-mata,usina-ok&equipe=178:100,177:100,173:100,12:60&itens=radio-cipo', { turbo: 3 });
await t.pronto();
await t.ev(() => import('/src/battle/index.ts').then((m) => m.definirHeadless(true)));
const relogio = (dia, min) => t.ev(([dia, min]) => { const s = window.__pingo.jogo.save, d = new Date(); s.relogio.diaSemana0 = (dia - d.getDay() + 7) % 7; s.relogio.deslocamentoMin = min - (d.getHours() * 60 + d.getMinutes()); }, [dia, min]);
const MIN = { manha: 8 * 60, dia: 13 * 60, noite: 21 * 60 };
const fecharTudo = async () => { for (let i = 0; i < 12; i++) { const n = await t.ev(() => window.__pingo.telas.pilha.length); if (n <= 1) break; await t.k('x', 200); } };

// comum com contato: A-R1-2 (Trilha do Ipê)
const id = 'A-R1-2';
const ag = await t.ev((id) => Promise.all([import('/src/data/revancha.ts'), import('/src/ui/telas/dados.ts')]).then(async ([r, d]) => { await d.dadosProntos; const tr = d.treinador(id); return { ...r.agendaDe(tr), eq: r.equipeDaFase(tr, 3, (n) => window.__pingo.jogo && undefined) && null }; }), id);
await t.ev((id) => { window.__pingo.jogo.save.contatos = [id, 'lider-01', 'lider-05', 'rival-2-mata']; }, id);
// dia errado
await relogio((ag.dia + 1) % 7, MIN[ag.periodo]);
await t.ev(() => import('/src/ui/dialogo.ts').then((d) => { void d.abrirTela('radio'); })); await t.espera(700);
await t.k('ArrowDown'); await t.k('z', 500); await t.k('z', 300);
for (let i = 0; i < 4; i++) await t.k('z', 250);
t.ok(!(await t.ev((id) => window.__pingo.jogo.save.flags['revanche:' + id], id)), `comum ${id} recusa fora do dia (agenda: dia ${ag.dia}, ${ag.periodo})`);
await fecharTudo();
// tabela de revanches
await relogio(ag.dia, MIN[ag.periodo]);
await t.ev(() => import('/src/ui/dialogo.ts').then((d) => { void d.abrirTela('radio'); })); await t.espera(700);
await t.k('ArrowDown'); await t.k('ArrowDown'); await t.k('z', 600);
await t.foto('t3-tabela-revanches');
await fecharTudo();
// dia certo: revanche pelo rádio (fase 3)
const din0 = await t.ev(() => window.__pingo.jogo.save.jogador.dinheiro);
await t.ev(() => import('/src/ui/dialogo.ts').then((d) => { void d.abrirTela('radio'); })); await t.espera(700);
await t.k('ArrowDown'); await t.k('z', 500); await t.k('z', 300);
for (let i = 0; i < 25; i++) { await t.k('z', 250); if (await t.ev((id) => window.__pingo.jogo.save.flags['revanche-venceu:' + id], id)) break; }
for (let i = 0; i < 4; i++) await t.k('z', 200);
const din1 = await t.ev(() => window.__pingo.jogo.save.jogador.dinheiro);
const eq = await t.ev(() => window.__pingo.mundo.ultimaBatalha?.inimigos.map((c) => `${c.especie}:${c.nivel}`).join(' '));
t.ok(din1 > din0 && !!(await t.ev((id) => window.__pingo.jogo.save.flags['revanche-venceu:' + id], id)), `revanche do comum pelo rádio, fase 3`, `equipe ${eq ?? '(ver flags)'} · +${din1 - din0}`);
await fecharTudo();
await t.assentar(20000, 'x');

// enxame do dia: a zona de hoje tem a espécie a 40% no capim (de dia: algumas zonas não têm tabela de manhã)
await relogio(ag.dia, MIN.dia);
const en = await t.ev(() => Promise.all([import('/src/data/revancha.ts'), import('/src/world/zonas.ts')]).then(([r, z]) => { const s = window.__pingo.jogo.save, d = r.diaCorrido(s.relogio.deslocamentoMin), e = r.enxameDoDia(z.listaZonas(), d); return e && { zona: e.zona.id, e: e.e }; }));
await t.ev((z) => window.__pingo.mundo.irPara(z, 1, 1, 's', 'nenhuma'), en.zona); await t.espera(900); await t.pronto();
const tab = await t.ev(() => window.__pingo.mundo.tabela('grama'));
const soma = tab.reduce((a, x) => a + x.peso, 0), p = (tab.find((x) => x.e === en.e)?.peso ?? 0) / soma;
t.ok(Math.abs(p - 0.4) < 0.03, `enxame do dia em ${en.zona}: espécie ${en.e} com ${(100 * p).toFixed(0)}% do capim`);

// Torre de Desafios (Platô da Liga)
await t.ev(() => window.__pingo.mundo.irPara('A-LG', 4, 54, 'n', 'nenhuma')); await t.espera(900); await t.pronto();
t.ok(await t.ev(() => window.__pingo.mundo.npcs.some((n) => n.id === 'a-lg-torre')), 'Juiz da Torre no Platô depois da Liga');
const antes = await t.ev(() => window.__pingo.jogo.save.equipe.map((c) => `${c.especie}:${c.nivel}:${c.exp}`).join(' '));
const moch0 = await t.ev(() => JSON.stringify(window.__pingo.jogo.save.mochila));
await t.ev(() => { void window.__pingo.mundo.rodarEvento('torre-desafios'); }); await t.espera(400);
await t.k('z', 300); // Desafio do dia
await t.assentar(120000, 'z');
const depois = await t.ev(() => window.__pingo.jogo.save.equipe.map((c) => `${c.especie}:${c.nivel}:${c.exp}`).join(' '));
const bat = await t.ev(() => { const b = window.__pingo.mundo.ultimaBatalha; return { inimigos: b?.inimigos.map((c) => c.nivel).join(','), semExp: b?.semExp }; });
const tf = await t.ev(() => { const f = window.__pingo.jogo.save.flags; return { p: f['torre-pontos'], d: f['torre-dia'], v: f['torre-vitorias'] }; });
t.ok(antes === depois && moch0 === (await t.ev(() => JSON.stringify(window.__pingo.jogo.save.mochila))), 'Torre: equipe e mochila intactas (sem experiência)', depois);
t.ok(bat.inimigos && /^50(,50)*$/.test(bat.inimigos) && bat.semExp === true && tf.p === 3, 'Torre: desafiantes no nível 50, vitória vale 3 pontos', JSON.stringify({ bat, tf }));
await t.ev(() => { void window.__pingo.mundo.rodarEvento('torre-desafios'); }); await t.espera(400);
await t.k('z', 300); await t.espera(300);
const fs = await t.falas(1); await t.assentar(20000, 'z');
t.ok(/já foi/.test(fs[0] ?? ''), 'Torre: 1 batalha por dia', fs[0]);
console.log('erros de página:', t.erros.length ? t.erros.slice(0, 5).join(' | ') : 'nenhum');
console.log('FALHAS:', t.falhas ?? 0);
await t.browser.close();
