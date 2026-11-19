/** Janela de confirmação no centro da tela (Sim/Não ou opções próprias). Empilha uma tela sobreposta. */
import { telas, type Tela } from '../telas';
import { elTela, retirar } from '../base';
import { texto, em } from '../fonte';
import { moldura } from '../kit';
import { Lista } from './lista';

/** devolve o índice escolhido (−1 = cancelou com B) */
export function perguntar(pergunta: string, opcoes: string[], padrao = 0): Promise<number> {
  return new Promise((resolver) => {
    const el = elTela('ui', 'confirmacao');
    const t = texto(pergunta, { tamanho: 8, cor: 'tinta', largura: 180, alinhar: 'centro' });
    const lista = new Lista({ itens: opcoes, moldura: null, inicial: padrao, aoEscolher: (i) => fim(i), aoCancelar: () => fim(-1) });
    const w = Math.max(200, lista.largura + 24), h = parseInt(t.style.height) + lista.visiveis * lista.alt + 34;
    const cx = moldura('madeira', w, h, Math.floor((320 - w) / 2), Math.floor((180 - h) / 2));
    cx.append(em(t, Math.floor((w - 180) / 2), 13), em(lista.el, Math.floor((w - lista.largura) / 2), parseInt(t.style.height) + 18));
    el.append(cx);
    const tela: Tela = { el, sobreposta: true, atualizar: (dt) => lista.atualizar(dt) };
    const fim = (i: number) => { retirar(tela); resolver(i); };
    telas.empilhar(tela);
  });
}
/** pergunta de sim ou não; B responde "Não" */
export const confirmar = (pergunta: string, padraoSim = true): Promise<boolean> => perguntar(pergunta, ['Sim', 'Não'], padraoSim ? 0 : 1).then((i) => i === 0);
/** mensagem com um único "OK" */
export const informar = (mensagem: string): Promise<void> => perguntar(mensagem, ['OK']).then(() => undefined);
