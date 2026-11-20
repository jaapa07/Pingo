// Cuieira → artesão (dia seguinte) → cuia; Viveiro do Seu Aroeira (deixar casal, ovo, aviso no rádio, recolher);
// troca com Dona Quitéria (A3) e desobediência da trocada em batalha.
import { abrir } from './lib.mjs';
const t = await abrir('?zona=A-R2&x=14&y=10&dir=n&equipe=2:30,2:30,13:12&insignias=6&itens=radio-cipo&dinheiro=5000&semente=3');
const { page } = t;
await t.pronto(); await t.assentar();
const save = () => t.ev(() => window.__pingo.jogo.save);
const falas = (n = 4) => t.falas(n);
/* ---------- cuieira ---------- */
await t.virar('n'); await t.k('z', 600); await t.foto('cuieira-colheu'); await t.assentar(30000, 'z');
t.ok((await save()).mochila['cabaca-verde'] === 1, 'colheu uma Cabaça Verde', JSON.stringify(await falas(2)));
await t.k('z', 600); await t.assentar(30000, 'z');
t.ok((await save()).mochila['cabaca-verde'] === 1 && /Amanhã tem mais/.test((await falas(1)).join()), 'a mesma árvore não dá outra no mesmo dia');
/* ---------- artesão em A2 (37,7) ---------- */
await t.ev(() => window.__pingo.mundo.irPara('A2', 37, 8, 'n', 'nenhuma')); await t.assentar();
await t.k('z', 500); await t.k('z', 300); // abre o menu das cabaças (a 1ª opção é a verde)
await t.assentar(30000, 'z');
let s = await save();
t.ok(!s.mochila['cabaca-verde'] && s.flags['artesao-cuia'] === 'cuia-amiga', 'artesão recebeu a cabaça', JSON.stringify(await falas(2)));
await t.k('z', 500); await t.assentar(30000, 'z');
t.ok(!(await save()).mochila['cuia-amiga'], 'no mesmo dia ainda não está pronta', (await falas(1)).join());
await t.ev(() => { window.__pingo.jogo.save.relogio.deslocamentoMin += 1440; });
await t.k('z', 500); await t.foto('artesao-entrega'); await t.assentar(30000, 'z');
t.ok((await save()).mochila['cuia-amiga'] === 1, 'no dia seguinte recebeu a Cuia Amiga', (await falas(2)).join(' / '));
/* ---------- Viveiro do Seu Aroeira ---------- */
await t.ev(() => { const e = window.__pingo.jogo.save.equipe; e[0].sexo = 'F'; e[1].sexo = 'M'; });
await t.ev(() => window.__pingo.mundo.irPara('A2-casa-aroeira', 6, 3, 'n', 'nenhuma')); await t.assentar();
// 1ª conversa: apresentação + menu → Deixar → 1ª da lista (fêmea)
await t.k('z', 500);
for (let i = 0; i < 12; i++) { await t.k('z', 350); if ((await save()).criadouro?.casal?.length) break; }
await t.assentar(30000, 'x');
await t.k('z', 500); await t.k('z', 350); await t.k('z', 350); // Deixar → 1ª da lista (o macho agora)
await t.foto('ninho-menu'); await t.assentar(30000, 'x');
s = await save();
t.ok(s.criadouro?.casal?.length === 2 && s.equipe.length === 1, 'casal deixado no ninho', JSON.stringify(s.criadouro?.casal?.map((c) => c.especie + c.sexo)));
// ovo: força um sorteio (passos) pelo módulo real
await t.ev(async () => { const N = await import('/src/world/ninhos.ts'); const { rng } = await import('/src/core/rng.ts'); rng.seed(2); for (let i = 0; i < 256 * 20 && !window.__pingo.jogo.save.criadouro.ovo; i++) N.passoCriadouro(); });
await t.espera(1500); await t.foto('radio-ovo');
const fRadio = (await falas(4)).join(' / ');
t.ok(/Trim|ovo/.test(fRadio), 'o casal avisou pelo Rádio Cipó', fRadio);
await t.assentar(30000, 'z');
await t.k('z', 500); for (let i = 0; i < 6; i++) await t.k('z', 350);
await t.assentar(30000, 'x');
s = await save();
t.ok(s.equipe.some((c) => c.ovo && c.especie === 1), 'recolheu o ovo (Tamanduí, forma base)', JSON.stringify(s.equipe.map((c) => [c.especie, c.ovo])));
await t.ev(() => import('/src/ui/dialogo.ts').then((d) => d.abrirTela('equipe'))); await t.espera(1500); await t.foto('equipe-ovo'); await t.k('x', 600);
await t.assentar(30000, 'x');
/* ---------- troca em A3 (Dona Quitéria, 8,17) ---------- */
await t.ev(() => window.__pingo.mundo.irPara('A3', 8, 18, 'n', 'nenhuma')); await t.assentar();
await t.k('z', 500); for (let i = 0; i < 10; i++) await t.k('z', 400);
await t.assentar(30000, 'z');
s = await save();
const pipoca = s.equipe.find((c) => c.apelido === 'Pipoca');
t.ok(pipoca && pipoca.especie === 22 && pipoca.item === 'caju' && pipoca.treinadorOriginal === 'Dona Quitéria' && !s.equipe.some((c) => c.especie === 13), 'troca feita: Saguinho "Pipoca" com caju', (await falas(2)).join(' / '));
/* ---------- obediência: Pipoca nv 45 com 0 insígnias ---------- */
await t.ev(() => { const s = window.__pingo.jogo.save; s.insignias = []; const p = s.equipe.find((c) => c.apelido === 'Pipoca'); p.nivel = 45; s.equipe = [p, ...s.equipe.filter((c) => c !== p)]; window.__fim = null; window.__pingo.bus.on('batalha-fim', (d) => { window.__fim = d.resultado; }); });
await t.ev(async () => { const E = await import('/src/battle/engine.ts'); window.__msgs = []; const m = E.Batalha.prototype.msg; E.Batalha.prototype.msg = function (x) { window.__msgs.push(x); return m.call(this, x); }; });
await t.ev(() => { void window.__pingo.mundo.batalhaSelvagem(13, 30); });
let desob = false;
for (let i = 0; i < 160 && !(await t.ev(() => window.__fim)); i++) {
  await t.k('z', 250);
  const f = await t.ev(() => window.__msgs.slice(-4).join(' '));
  if (/ignorou a ordem|corpo mole|não obedeceu/.test(f)) { if (!desob) await t.foto('desobedece'); desob = true; }
}
const ultimas = await t.ev(() => window.__msgs.filter((x) => /Pipoca/.test(x)).slice(-6));
t.ok(desob, 'Pipoca (troca, nv 45, 0 insígnias) desobedeceu em batalha', ultimas.join(' / '));
console.log('erros', t.erros.slice(0, 5));
await t.browser.close();
