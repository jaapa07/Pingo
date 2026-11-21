/** Opções: volumes, texto, dificuldade, batalha, vibração, parceira, qualidade, tela cheia e teclas. */
import { jogo } from '../../core/estado';
import { bus } from '../../core/events';
import { input, ACOES, NOME_ACAO, type Acao } from '../../core/input';
import { gravarOpcoes } from '../../core/save';
import { plataforma } from '../../core/plataforma';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, som } from '../kit';
import { Lista, type ItemLista } from '../componentes/lista';

interface Linha { rotulo: string; valor(): string; mudar?(d: number): void; acao?(): void; dica: string }
const nivel = (v: number) => '•'.repeat(Math.round(v * 10)) + '·'.repeat(10 - Math.round(v * 10));
const simNao = (b: boolean) => (b ? 'Sim' : 'Não');
const passo = (v: number, d: number) => Math.max(0, Math.min(1, Math.round((v + d * 0.1) * 10) / 10));
export const aplicarVolumes = () => bus.emit('volumes', { musica: jogo.opcoes.musica, sfx: jogo.opcoes.sfx, ambiente: jogo.opcoes.sfx * 0.8 });

export function criarOpcoes(): Tela {
  const el = elTela('ui', 'tela-opcoes', 'fundo-azul');
  el.style.backgroundImage = 'repeating-linear-gradient(to bottom, #1f4f7a 0 8px, #1c4870 8px 16px)';
  const o = jogo.opcoes;
  let telaCheia = !!document.fullscreenElement;
  let sub: Lista | null = null, capturando: Acao | null = null;
  const DIF = ['explorador', 'aventureiro', 'veterano'] as const, NOME_DIF = { explorador: 'Explorador', aventureiro: 'Aventureiro (Recomendado)', veterano: 'Veterano' };
  const linhas: Linha[] = [
    { rotulo: 'Música', valor: () => nivel(o.musica), mudar: (d) => { o.musica = passo(o.musica, d); aplicarVolumes(); }, dica: 'Volume da música.' },
    { rotulo: 'Efeitos', valor: () => nivel(o.sfx), mudar: (d) => { o.sfx = passo(o.sfx, d); aplicarVolumes(); som('ui-ok'); }, dica: 'Volume dos efeitos e gritos das criaturas.' },
    { rotulo: 'Vozes nas falas', valor: () => simNao(!!o.vozes), mudar: () => { o.vozes = !o.vozes; }, dica: 'Personagens "falam" com sons enquanto o texto aparece.' },
    { rotulo: 'Velocidade do texto', valor: () => ['Calma', 'Normal', 'Ligeira'][o.velTexto - 1], mudar: (d) => { o.velTexto = (((o.velTexto - 1 + d + 3) % 3) + 1) as 1 | 2 | 3; }, dica: 'Ritmo das letras nas caixas de fala.' },
    { rotulo: 'Dificuldade', valor: () => NOME_DIF[o.dificuldade], mudar: (d) => { o.dificuldade = DIF[(DIF.indexOf(o.dificuldade) + d + 3) % 3]; }, dica: 'Explorador: leve. Aventureiro (recomendado): equilíbrio. Veterano: rivais espertos.' },
    { rotulo: 'Animações de batalha', valor: () => simNao(o.animBatalha), mudar: () => { o.animBatalha = !o.animBatalha; }, dica: 'Mostra as animações dos golpes.' },
    { rotulo: 'Números de dano', valor: () => simNao(o.numerosDano), mudar: () => { o.numerosDano = !o.numerosDano; }, dica: 'Mostra quanto de vida cada golpe tirou.' },
    { rotulo: 'Vibração', valor: () => simNao(o.vibrar), mudar: () => { o.vibrar = !o.vibrar; input.vibrar(30, true); }, dica: 'Vibra em críticos, capturas e insígnias (celular e controle).' },
    { rotulo: 'Parceira segue', valor: () => simNao(o.parceiraSegue), mudar: () => { o.parceiraSegue = !o.parceiraSegue; }, dica: 'A 1ª criatura da equipe anda atrás de você. Também se liga pela tela da Equipe.' },
    { rotulo: 'Qualidade', valor: () => (o.qualidade === 'pc' ? 'PC' : 'Celular'), mudar: () => { o.qualidade = o.qualidade === 'pc' ? 'celular' : 'pc'; }, dica: 'Celular: menos efeitos de cenário, para poupar bateria.' },
    ...(plataforma.alvo === 'ios' || plataforma.alvo === 'android' ? [] : [{ rotulo: 'Tela cheia', valor: () => simNao(telaCheia), mudar: () => { telaCheia = !telaCheia; plataforma.telaCheia(telaCheia); }, dica: 'Usa a tela inteira do aparelho.' } as Linha]),
    { rotulo: 'Teclas…', valor: () => '', acao: abrirTeclas, dica: 'Escolha as teclas de cada ação.' },
    { rotulo: 'Voltar', valor: () => '', acao: sair, dica: 'Guarda as opções e volta.' },
  ];
  const cx = moldura('azulejo', 304, 172, 8, 4); el.append(cx);
  cx.append(em(texto('OPÇÕES', { tamanho: 12, cor: 'azul', largura: 280, alinhar: 'centro' }), 12, 10));
  const itens = (): ItemLista[] => linhas.map((l) => ({ rotulo: l.rotulo, valor: l.valor() }));
  const lista = new Lista({ itens: itens(), moldura: null, largura: 270, visiveis: 9, circular: true, aoEscolher: (i) => { const l = linhas[i]; if (l.acao) l.acao(); else { l.mudar?.(1); lista.definirValor(i, l.valor()); } }, aoCancelar: sair, aoMover: pintarDica });
  cx.append(em(lista.el, 14, 24));
  const dica = texto('', { cor: 'chumbo', largura: 270 }); cx.append(em(dica, 17, 140));
  function pintarDica() { escrever(dica, capturando ? `Aperte a nova tecla para "${NOME_ACAO[capturando]}"…` : sub ? 'A: trocar a tecla.  B: voltar.' : linhas[lista.indice].dica); }
  function sair() { gravarOpcoes(); fechar(tela); }

  function itensTeclas(): ItemLista[] { return [...ACOES.map((a) => ({ rotulo: NOME_ACAO[a], valor: input.teclasDe(a).map(input.nomeTecla).join(', ') })), { rotulo: 'Restaurar o padrão' }, { rotulo: 'Voltar' }]; }
  function abrirTeclas() {
    lista.el.style.display = 'none';
    sub = new Lista({ itens: itensTeclas(), moldura: null, largura: 270, visiveis: 9, aoCancelar: fecharTeclas, aoEscolher: (i) => {
      if (i === ACOES.length) { input.restaurarTeclas(); sub!.definirItens(itensTeclas()); return; }
      if (i > ACOES.length) { fecharTeclas(); return; }
      capturando = ACOES[i]; pintarDica();
      void input.capturarTecla().then((c) => { const a = capturando; capturando = null; if (c && a) { input.remapear(a, [c]); som('ui-ok'); } sub?.definirItens(itensTeclas()); pintarDica(); input.limpar(); });
    } });
    cx.append(em(sub.el, 14, 24)); pintarDica();
  }
  function fecharTeclas() { sub?.el.remove(); sub = null; lista.el.style.display = ''; pintarDica(); }

  const tela: Tela = {
    el,
    entrar: pintarDica,
    sair() { input.cancelarCaptura(); },
    atualizar(dt) {
      if (capturando) { if (input.apertou('b') && input.modo !== 'teclado') input.cancelarCaptura(); return; }
      if (sub) { sub.atualizar(dt); return; }
      const l = linhas[lista.indice];
      if (l.mudar && (input.repetiu('dir') || input.repetiu('esq'))) { l.mudar(input.repetiu('dir') ? 1 : -1); lista.definirValor(lista.indice, l.valor()); som('ui-mover'); }
      lista.atualizar(dt);
    },
  };
  return tela;
}
