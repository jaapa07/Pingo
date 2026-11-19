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
    const tit = texto(titulo, { cor: 'tinta', largura: 130, alinhar: 'centro' });
    const y0 = 12 + parseInt(tit.style.height) + 3, yT = y0 + 31, yB = yT + (o.preco != null ? 13 : 0), h = yB + 25;
    const cx = moldura('madeira', 150, h, 85, Math.floor((180 - h) / 2)); el.append(cx);
    cx.append(em(tit, 10, 11));
    const num = texto('', { tamanho: 12, cor: 'tinta' }), total = texto('', { cor: 'marrom', largura: 130, alinhar: 'centro' });
    const sC = em(seta('cima', true), 71, y0), sB = em(seta('baixo', true), 71, y0 + 23), sE = em(seta('esq'), 44, y0 + 11), sD = em(seta('dir'), 100, y0 + 11);
    cx.append(em(num, 60, y0 + 8), sC, sB, sE, sD); if (o.preco != null) cx.append(em(total, 10, yT));
    const ok = botao('OK', 36), nao = botao('Voltar', 44); ok.definirFoco(true);
    cx.append(em(ok.el, 26, yB), em(nao.el, 88, yB));
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
