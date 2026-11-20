// utilidades do QA do pós-Liga: relógio do save, teclas, registro de textos das caixas, viagem curta
export async function preparar(t) {
  await t.q(() => {
    const Q = window.Q; Q.textos = [];
    import('/src/ui/dialogo.ts').then((DLG) => { const def = DLG.CaixaTexto.prototype.definir; DLG.CaixaTexto.prototype.definir = function (str, ...r) { Q.textos.push(String(str)); if (Q.textos.length > 400) Q.textos.shift(); return def.call(this, str, ...r); }; });
  });
}
/** muda o relógio do save como a tela "relógio" faria: dia da semana (0 = domingo) e hora do dia em minutos */
export const relogio = (t, dia, min) => t.q(([dia, min]) => { const s = window.__pingo.jogo.save, d = new Date(); s.relogio.diaSemana0 = (dia - d.getDay() + 7) % 7; s.relogio.deslocamentoMin = ((min - (d.getHours() * 60 + d.getMinutes())) % 1440 + 1440) % 1440; }, [dia, min]);
/** avança o dia corrido (amanhã) mantendo a hora: soma 24 h ao deslocamento e passa o dia da semana */
export const amanha = (t) => t.q(() => { const s = window.__pingo.jogo.save; s.relogio.deslocamentoMin += 1440; s.relogio.diaSemana0 = (s.relogio.diaSemana0 + 1) % 7; });
export const tecla = (t, k, n = 1, q = 6) => t.q(async ([k, n, q]) => { for (let i = 0; i < n; i++) { await window.Q.toque(k); await window.Q.quadros(q); } }, [k, n, q]);
export const textos = (t, n = 8) => t.q((n) => window.Q.textos.slice(-n), n);
export const limparTextos = (t) => t.q(() => { window.Q.textos.length = 0; });
export const topo = (t) => t.q(() => window.__pingo.telas.topo?.el.className ?? '');
export const pilha = (t) => t.q(() => window.__pingo.telas.pilha.map((x) => x.el.className.replace(/\s+/g, '.')));
/** índice com foco na lista mais alta da tela do topo */
export const foco = (t) => t.q(() => { const r = window.__pingo.telas.topo?.el; const ls = [...(r?.querySelectorAll('.lista-item') ?? [])]; return { n: ls.length, i: ls.findIndex((l) => l.classList.contains('foco')) }; });
/** leva o foco da lista do topo ao índice dado e aperta A */
export async function escolherIdx(t, idx, apertar = true) {
  for (let k = 0; k < 40; k++) { const f = await foco(t); if (f.i === idx) break; await tecla(t, f.i < idx ? 'baixo' : 'cima'); }
  if (apertar) await tecla(t, 'a', 1, 10);
}
/** aperta A enquanto houver caixa de diálogo sem lista no topo; para em listas (sim/não) e telas */
export async function passarFalas(t, max = 40) {
  for (let k = 0; k < max; k++) {
    const tp = await topo(t);
    if (!/dialogo/.test(tp)) return tp;
    const temLista = await t.q(() => !!document.querySelector('.tela.dialogo .lista'));
    if (temLista) return 'escolha';
    await tecla(t, 'a', 1, 8);
  }
  return topo(t);
}
export const flags = (t, re) => t.q((r) => { const s = window.__pingo.jogo.save, x = new RegExp(r); return Object.fromEntries(Object.entries(s.flags).filter(([f]) => x.test(f))); }, re);
export const irPara = (t, z, x, y, d = 's') => t.q(async ([z, x, y, d]) => { await window.__pingo.mundo.irPara(z, x, y, d); }, [z, x, y, d]).then(() => t.assentar());
