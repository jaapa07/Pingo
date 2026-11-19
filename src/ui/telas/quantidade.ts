/** Janela de quantidade (comprar, vender, guardar, descartar): cima/baixo ±1, esquerda/direita ±10. Devolve 0 se cancelar. */
import { input, tocavel } from '../../core/input';
import { telas, type Tela } from '../telas';
import { elTela, retirar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, seta, botao, som } from '../kit';
import { patacas } from './comum';

export function pedirQuantidade(titulo: string, max: number, o: { preco?: number; inicial?: number } = {}): Promise<number> {
  return new Promise((resolver) => {
    max = Math.max(1, Math.floor(max));
    let n = Math.max(1, Math.min(max, o.inicial ?? 1));
    const el = elTela('ui', 'janela-qtd');
    const cx = moldura('madeira', 150, o.preco != null ? 76 : 64, 85, 52); el.append(cx);
    cx.append(em(texto(titulo, { cor: 'tinta', largura: 130, alinhar: 'centro' }), 10, 11));
    const num = texto('', { tamanho: 12, cor: 'tinta' }), total = texto('', { cor: 'marrom', largura: 130, alinhar: 'centro' });
    const sC = em(seta('cima', true), 71, 22), sB = em(seta('baixo', true), 71, 45), sE = em(seta('esq'), 44, 33), sD = em(seta('dir'), 100, 33);
    cx.append(em(num, 60, 29), sC, sB, sE, sD); if (o.preco != null) cx.append(em(total, 10, 54));
    const ok = botao('OK', 36), nao = botao('Voltar', 44); ok.definirFoco(true);
    cx.append(em(ok.el, 26, o.preco != null ? 57 : 45), em(nao.el, 88, o.preco != null ? 57 : 45));
    if (o.preco != null) total.style.top = '44px';
    if (o.preco != null) { ok.el.style.top = '56px'; nao.el.style.top = '56px'; } else { sB.style.top = '40px'; ok.el.style.top = '45px'; nao.el.style.top = '45px'; ok.el.style.left = '10px'; nao.el.style.left = '96px'; }
    const pintar = () => { escrever(num, `×${n}`); num.style.left = Math.floor((150 - parseInt(num.style.width)) / 2) + 'px'; if (o.preco != null) escrever(total, `Total: ${patacas(n * o.preco)} patacas`); };
    const mudar = (d: number) => { const v = d === 1 && n === max ? 1 : d === -1 && n === 1 ? max : Math.max(1, Math.min(max, n + d)); if (v !== n) { n = v; som('ui-mover'); pintar(); } };
    const tela: Tela = { el, sobreposta: true, atualizar() {
      if (input.repetiu('cima')) mudar(1); else if (input.repetiu('baixo')) mudar(-1); else if (input.repetiu('dir')) mudar(10); else if (input.repetiu('esq')) mudar(-10);
      if (input.apertou('a')) { input.consumir('a'); som('ui-ok'); fim(n); } else if (input.apertou('b')) { input.consumir('b'); som('ui-voltar'); fim(0); }
    } };
    const fim = (v: number) => { retirar(tela); resolver(v); };
    tocavel(sC, () => mudar(1)); tocavel(sB, () => mudar(-1)); tocavel(sD, () => mudar(10)); tocavel(sE, () => mudar(-10));
    tocavel(ok.el, () => { som('ui-ok'); fim(n); }); tocavel(nao.el, () => { som('ui-voltar'); fim(0); });
    pintar(); telas.empilhar(tela);
  });
}
