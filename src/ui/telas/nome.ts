/**
 * Tela de nome/apelido: teclado em grade (maiúsculas, minúsculas, acentos, apagar, fim), navegável por
 * direcional, por toque e também digitando no teclado físico.
 */
import { input, tocavel } from '../../core/input';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, som } from '../kit';

const PAGINAS = [
  ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'ÁÀÂÃÉÊÍÓÔÕÚÜÇ', "0123456789-'."],
  ['abcdefghijklm', 'nopqrstuvwxyz', 'áàâãéêíóôõúüç', "0123456789-'."],
];
const COLS = 13, LW = 20, LH = 16;
const COMANDOS = ['abc', 'Espaço', 'Apagar', 'Fim'];

export interface ArgsNome { titulo: string; max: number; padrao?: string }
export function criarTelaNome(args: ArgsNome): Tela {
  const el = elTela('ui', 'tela-nome', 'fundo-mata');
  const max = Math.max(1, Math.min(12, args.max || 8));
  let nome = (args.padrao ?? '').slice(0, max), pagina = nome ? 1 : 0;
  // nome já sugerido: o cursor nasce em "Fim", para que Confirmar aceite a sugestão em vez de acrescentar letras
  let lin = nome ? 4 : 0, col = nome ? 3 : 0;
  el.style.backgroundImage = 'repeating-linear-gradient(to bottom, #2f6b3a 0 8px, #2a6236 8px 16px)';
  const tit = texto(args.titulo, { tamanho: 12, cor: 'creme', sombra: true, largura: 300, alinhar: 'centro' });
  el.append(em(tit, 10, 3));
  const campo = moldura('texto', 152, 26, 84, 19); el.append(campo);
  const tNome = em(texto('', { tamanho: 12, cor: 'tinta' }), 12, 6); campo.append(tNome);
  const cont = em(texto('', { cor: 'chumbo' }), 0, 9); campo.append(cont);
  const quadro = moldura('madeira', 292, 128, 14, 48); el.append(quadro);
  const teclas: HTMLElement[][] = [[], [], [], [], []];
  const letrasEl: HTMLElement[][] = [[], [], [], []];
  for (let j = 0; j < 4; j++) for (let i = 0; i < COLS; i++) {
    const c = document.createElement('div'); c.className = 'tecla'; c.style.width = LW - 2 + 'px'; c.style.height = LH - 1 + 'px';
    const t = texto('', { tamanho: 12, cor: 'tinta' }); c.append(t); letrasEl[j].push(t);
    em(c, 17 + i * LW, 13 + j * LH); quadro.append(c); teclas[j].push(c);
    tocavel(c, () => { mover(j, i, true); apertar(); }, () => mover(j, i, true));
  }
  const rotCmd: HTMLElement[] = [];
  COMANDOS.forEach((r, i) => {
    const c = moldura('botao', 60, 16, 20 + i * 64, 84); c.classList.add('tecla');
    const t = texto(r, { cor: 'tinta' }); c.append(em(t, Math.floor((60 - parseInt(t.style.width)) / 2), 4)); rotCmd.push(t);
    quadro.append(c); teclas[4].push(c);
    tocavel(c, () => { mover(4, i, true); apertar(); }, () => mover(4, i, true));
  });
  const dica = texto(input.modo === 'toque' ? 'Toque nas letras. B apaga.' : `Digite ou use as setas. ${input.nomeTecla(input.teclasDe('a')[0] ?? 'Enter')} escolhe, Enter confirma.`, { cor: 'marrom', largura: 260, alinhar: 'centro' });
  quadro.append(em(dica, 16, 107));

  function pintarLetras() {
    for (let j = 0; j < 4; j++) for (let i = 0; i < COLS; i++) { const t = letrasEl[j][i], ch = PAGINAS[pagina][j][i]; escrever(t, ch); em(t, Math.floor((LW - 2 - parseInt(t.style.width)) / 2), 1); }
    escrever(rotCmd[0], pagina === 0 ? 'abc' : 'ABC'); rotCmd[0].style.left = Math.floor((60 - parseInt(rotCmd[0].style.width)) / 2) + 'px';
  }
  function pintarNome() {
    escrever(tNome, nome + (nome.length < max ? '_' : ''));
    escrever(cont, `${nome.length}/${max}`); cont.style.left = 152 - 10 - parseInt(cont.style.width) + 'px';
  }
  function pintarFoco() { teclas.forEach((l, j) => l.forEach((c, i) => c.classList.toggle('foco', j === lin && i === col))); }
  function mover(j: number, i: number, quieto = false) { if (j === lin && i === col) return; lin = j; col = i; pintarFoco(); if (!quieto) som('ui-mover'); }
  function por(ch: string) {
    if (nome.length >= max) { som('ui-erro'); return; }
    nome += ch; som('ui-ok'); pintarNome();
    if (nome.length === 1 && pagina === 0) { pagina = 1; pintarLetras(); } // depois da inicial, minúsculas
    if (nome.length >= max) mover(4, 3, true);
  }
  function apagar() { if (!nome) { som('ui-erro'); return; } nome = nome.slice(0, -1); som('ui-voltar'); pintarNome(); if (!nome && pagina === 1) { pagina = 0; pintarLetras(); } }
  function fim() {
    const final = nome.trim() || (args.padrao ?? '').trim();
    if (!final) { som('ui-erro'); return; }
    som('ui-ok'); fechar(tela, final);
  }
  function apertar() {
    if (lin < 4) { por(PAGINAS[pagina][lin][col]); return; }
    if (col === 0) { pagina = 1 - pagina; som('ui-mover'); pintarLetras(); }
    else if (col === 1) { if (nome && !nome.endsWith(' ')) por(' '); else som('ui-erro'); }
    else if (col === 2) apagar();
    else fim();
  }
  const tela: Tela = {
    el,
    entrar() {
      pintarLetras(); pintarNome(); pintarFoco();
      // as teclas físicas de Confirmar e Voltar (Z e X no padrão) continuam sendo botões do jogo: escolhem a letra do
      // cursor e apagam; essas duas letras entram pelo teclado da tela. O resto do teclado físico digita direto.
      const botoes = new Set([...input.teclasDe('a'), ...input.teclasDe('b')]);
      input.digitar((k, codigo) => {
        if (botoes.has(codigo) && k !== 'Enter') return false;
        if (k === 'Backspace') { apagar(); return true; }
        if (k === 'Enter') { fim(); return true; } // "Enter confirma" onde quer que o cursor esteja
        if (k.length === 1 && k !== ' ' && PAGINAS.some((p) => p.some((l) => l.includes(k)))) { por(k); return true; }
        if (k === ' ') { if (nome && !nome.endsWith(' ')) por(' '); return true; }
        return false;
      });
    },
    sair() { input.digitar(null); },
    atualizar() {
      if (input.repetiu('dir')) mover(lin, (col + 1) % teclas[lin].length);
      else if (input.repetiu('esq')) mover(lin, (col + teclas[lin].length - 1) % teclas[lin].length);
      else if (input.repetiu('baixo')) { if (lin < 3) mover(lin + 1, col); else if (lin === 3) mover(4, Math.min(3, Math.floor((col * 4) / COLS))); else mover(0, Math.min(COLS - 1, col * 3 + 2)); }
      else if (input.repetiu('cima')) { if (lin === 4) mover(3, Math.min(COLS - 1, col * 3 + 2)); else if (lin > 0) mover(lin - 1, col); else mover(4, Math.min(3, Math.floor((col * 4) / COLS))); }
      if (input.apertou('a')) { input.consumir('a'); apertar(); }
      else if (input.apertou('b')) { input.consumir('b'); apagar(); }
      else if (input.apertou('select')) { pagina = 1 - pagina; som('ui-mover'); pintarLetras(); }
      else if (input.apertou('menu')) mover(4, 3);
    },
  };
  return tela;
}
