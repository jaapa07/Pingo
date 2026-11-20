// Revanche de líder por agenda (spec 10A itens 25/26): ligar no dia errado, no dia certo, luta no Ginásio de Treino (vitória e derrota).
import { abrir } from './lib.mjs';

const t = await abrir('?zona=A4&x=17&y=18&dir=n&insignias=8&flags=liga-vencida,inicial,inicial-rio,usina-ok&equipe=178:100,177:100,173:100&itens=radio-cipo', { turbo: 3 });
await t.pronto();
// batalhas sem tela (piloto padrão do motor): o teste é do fluxo das regras, não da tela de batalha
await t.ev(() => import('/src/battle/index.ts').then((m) => m.definirHeadless(true)));
const relogio = (dia, min) => t.ev(([dia, min]) => { const s = window.__pingo.jogo.save, d = new Date(); s.relogio.diaSemana0 = (dia - d.getDay() + 7) % 7; s.relogio.deslocamentoMin = min - (d.getHours() * 60 + d.getMinutes()); }, [dia, min]);
await t.ev(() => { window.__pingo.jogo.save.contatos = ['lider-01', 'lider-02', 'lider-03']; });
await relogio(1, 8 * 60); // segunda, 8h (manhã)
const abrirRadio = () => t.ev(() => import('/src/ui/dialogo.ts').then((d) => { void d.abrirTela('radio'); }));
const falasAte = async (f, max = 60) => { for (let i = 0; i < max; i++) { const fs = await t.falas(4); if (fs.some(f)) return fs; await t.k('z', 120); } return t.falas(4); };

// 1) rádio abre na Agenda do dia
await abrirRadio(); await t.espera(800);
await t.foto('t1-radio-agenda');
// 2) Contatos → Mestre Gaivota? A lista vem na ordem dos contatos: 0 lider-01, 1 lider-02
await t.k('ArrowDown'); await t.k('z', 500);
await t.k('ArrowDown'); await t.foto('t1-contatos'); await t.k('z', 300);
// o rádio fala pela caixa de diálogo da UI (fora do diário do mundo): foto da recusa + nenhuma marcação
for (let i = 0; i < 3; i++) await t.k('z', 250);
await t.foto('t1-recusa-lider2');
let fs = [];
t.ok(!(await t.ev(() => window.__pingo.jogo.save.flags['treino:lider-02'])), 'líder 2 recusa na segunda de manhã (foto t1-recusa-lider2)');
await t.assentar(8000, 'z').catch(() => {});
// sai da conversa e liga para o líder 1
for (let i = 0; i < 6; i++) { const top = await t.ev(() => window.__pingo.telas.topo?.el.className); if (/janela-escolha/.test(top)) break; await t.k('z', 200); }
await t.k('ArrowUp'); await t.k('z', 300);
for (let i = 0; i < 3; i++) await t.k('z', 250);
await t.foto('t1-aceite-lider1');
for (let i = 0; i < 6; i++) await t.k('z', 150);
const marcado = await t.ev(() => { const f = window.__pingo.jogo.save.flags; return [f['treino:lider-01'], f['treino-hoje:lider-01']]; });
t.ok(typeof marcado[0] === 'number' && marcado[1] === true, 'flags treino:lider-01 / treino-hoje', JSON.stringify(marcado));
// fecha o rádio
for (let i = 0; i < 8; i++) { const n = await t.ev(() => window.__pingo.telas.pilha.length); if (n <= 1) break; await t.k('x', 250); }
await t.assentar(20000, 'x');
// 3) guia do treino → Ginásio de Treino
await t.virar('n'); await t.k('z', 400);
await t.assentar(20000, 'z');
let st = await t.st();
t.ok(st.zona === 'A4-treino', 'guia leva ao Ginásio de Treino', st.zona);
const npcs = await t.ev(() => window.__pingo.mundo.npcs.map((n) => n.id));
t.ok(npcs.includes('treino-lider-01') && !npcs.includes('treino-lider-02'), 'só o líder marcado aparece no salão', npcs.join(','));
await t.foto('t1-treino');
// 4) revanche vencida
const din0 = await t.ev(() => window.__pingo.jogo.save.jogador.dinheiro);
await t.ev(() => { void window.__pingo.mundo.rodarEvento('treino-lider-01'); });
await t.assentar(240000, 'z');
const eq = await t.ev(() => window.__pingo.mundo.ultimaBatalha?.inimigos.map((c) => `${c.especie}:${c.nivel}`).join(' '));
const din1 = await t.ev(() => window.__pingo.jogo.save.jogador.dinheiro);
const fl = await t.ev(() => { const f = window.__pingo.jogo.save.flags; return { v: f['revanche-venceu:lider-01'], hoje: f['treino-hoje:lider-01'], rv: f['revanches-vencidas'] }; });
t.ok(fl.v === true && din1 > din0, 'revanche do líder 1 vencida (fase 3) com prêmio', `equipe ${eq} · +${din1 - din0} · ${JSON.stringify(fl)}`);
t.ok(!(await t.ev(() => window.__pingo.mundo.npcs.some((n) => n.id === 'treino-lider-01'))), 'líder sai do salão depois da revanche');
// 5) de novo no mesmo dia: recusa
await t.ev(() => { void window.__pingo.mundo.rodarEvento('treino-lider-01'); });
await t.espera(400); fs = await t.falas(2); await t.assentar(20000, 'z');
t.ok(fs.some((x) => /Já tivemos a nossa revanche hoje/.test(x)), 'uma revanche por dia');
// 6) revanche perdida: terça de dia, líder 2, equipe fraca
await relogio(2, 13 * 60);
await t.ev(() => { const s = window.__pingo.jogo.save; s.flags['treino:lider-02'] = Math.floor((Date.now() + s.relogio.deslocamentoMin * 60000 - new Date().getTimezoneOffset() * 60000) / 86400000); s.equipe.splice(1); s.equipe[0].nivel = 5; s.equipe[0].vida = 1; s.jogador.dinheiro = 1000; });
await t.ev(() => { void window.__pingo.mundo.rodarEvento('treino-lider-02'); });
await t.assentar(240000, 'z');
st = await t.st();
const d2 = await t.ev(() => window.__pingo.jogo.save.jogador.dinheiro);
const p2 = await t.ev(() => window.__pingo.jogo.save.flags['revanche-venceu:lider-02']);
t.ok(st.zona !== 'A4-treino' && d2 === 500 && !p2, 'revanche perdida: volta ao último Posto (aqui a casa do save de teste) com metade das patacas', `${st.zona} ${d2}`);
console.log('erros de página:', t.erros.length ? t.erros.slice(0, 5).join(' | ') : 'nenhum');
console.log('FALHAS:', t.falhas ?? 0);
await t.browser.close();
