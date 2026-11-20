// QA pós-Liga 10 — estrela de rara: Viveiro (onde o Mandizinho do lago foi parar), Equipe, Resumo e Diário.
import { abrir, lerSave } from './lib.mjs';
import { preparar, tecla, topo } from './comum.mjs';
const t = await abrir(lerSave('pos-r8-lago'), { anim: true });
await preparar(t);
const abrirTela = (id, a) => t.q(([id, a]) => import('/src/ui/dialogo.ts').then((d) => { void d.abrirTela(id, a); }), [id, a]);
try {
  await abrirTela('viveiro'); await t.espera(1500); await t.foto('r10-viveiro');
  // navega até o Mandizinho na caixa (o 1º vazio antes dele: procura pela posição)
  const pos = await t.q(() => { const s = window.__pingo.jogo.save; for (const [b, cx] of s.viveiro.entries()) { const i = cx.findIndex((c) => c?.rara); if (i >= 0) return [b, i]; } return null; });
  console.log('   rara no viveiro em', JSON.stringify(pos));
  await tecla(t, 'b', 3, 10); await t.assentar();
  // o jogador pega o Mandizinho no Viveiro (aqui direto no save) e confere na Equipe e no Resumo
  await t.q(() => { const s = window.__pingo.jogo.save; for (const cx of s.viveiro) { const i = cx.findIndex((c) => c?.rara); if (i >= 0) { const c = cx[i]; cx[i] = s.equipe.pop(); s.equipe.push(c); break; } } });
  await abrirTela('equipe'); await t.espera(1200); await t.foto('r10-equipe');
  await t.q(() => import('/src/ui/dialogo.ts').then((d) => { void d.abrirTela('resumo', { indice: 5 }); })); await t.espera(1500); await t.foto('r10-resumo');
  await tecla(t, 'b', 4, 10); await t.assentar();
  await abrirTela('diario', { especie: 39 }); await t.espera(1500); await t.foto('r10-diario');
  await tecla(t, 'a', 1, 10); await t.espera(600); await t.foto('r10-diario-a');
  await tecla(t, 'b', 4, 10);
} catch (e) { console.log('FALHOU:', e.message); await t.foto('r10-erro'); }
await t.fim();
