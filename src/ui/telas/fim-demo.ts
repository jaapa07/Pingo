/**
 * FIM DA DEMO (só no pacote `npm run build:demo`; docs/DEMO.md): aparece uma vez, logo depois da 2ª insígnia.
 * Agradece, diz onde o jogo completo vai estar e como levar o save. A ou B (depois de um instante) fecha e o jogo segue
 * dentro das zonas liberadas. Textos e lojas em src/core/demo.ts.
 */
import { input, tocavel } from '../../core/input';
import { jogo } from '../../core/estado';
import { bus } from '../../core/events';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, em } from '../fonte';
import { camada, som } from '../kit';
import { caixa } from './comum';
import { TEXTOS_DEMO, LOJAS } from '../../core/demo';

export function criarFimDemo(): Tela {
  const el = elTela('ui', 'tela-fim-demo');
  el.style.background = 'linear-gradient(#1a1423 0 120px, #241c3a 120px 150px, #2f6b3a 150px)';
  const c = camada('mata'), mata = caixa('', 320 + c.w, c.h); mata.style.background = `url(${c.url}) repeat-x`; el.append(em(mata, 0, 180 - c.h));
  const nome = (t: string) => t.replace(/\{JOGADOR\}/g, jogo.save.jogador.nome);
  el.append(em(texto(TEXTOS_DEMO.titulo, { tamanho: 12, cor: 'amarelo', sombra: true, largura: 320, alinhar: 'centro' }), 0, 6));
  const comLink = LOJAS.filter((l) => l.url);
  const paragrafos: [string, 'creme' | 'ouro'][] = [
    [nome(TEXTOS_DEMO.agradecimento), 'creme'],
    [TEXTOS_DEMO.completo, 'creme'],
    [TEXTOS_DEMO.lojas, 'ouro'],
    ...comLink.map((l) => [`${l.nome}: ${l.url}`, 'ouro'] as [string, 'ouro']),
    [TEXTOS_DEMO.save, 'creme'],
    [TEXTOS_DEMO.seguir, 'creme'],
  ];
  let y = 26;
  for (const [t, cor] of paragrafos) {
    const p = texto(t, { cor, sombra: true, largura: 296, alinhar: 'centro' });
    el.append(em(p, 12, y)); y += (parseInt(p.style.height) || 10) + (comLink.length ? 3 : 5);
  }
  const rodape = texto(TEXTOS_DEMO.rodape, { cor: 'branco', sombra: true, largura: 320, alinhar: 'centro' });
  el.append(em(rodape, 0, 168));
  let t = 0, fim = false, x = 0;
  const sair = () => { if (fim || t < 1) return; fim = true; som('ui-ok'); fechar(tela); };
  tocavel(el, sair);
  const tela: Tela = {
    el,
    entrar() { bus.emit('musica', 'creditos'); },
    atualizar(dt) {
      t += dt;
      x = (x + dt * 12) % c.w; mata.style.left = -Math.floor(x) + 'px';
      rodape.style.visibility = t < 1 || Math.floor(t * 2) % 2 ? 'visible' : 'hidden';
      if (input.apertou('a') || input.apertou('b') || input.apertou('menu')) { input.consumir('a'); input.consumir('b'); sair(); }
    },
  };
  return tela;
}
