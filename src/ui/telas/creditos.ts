/** CRÉDITOS — rolagem sobre a paisagem do título. Segurar A acelera; B (ou o fim da rolagem) fecha. Chama `args.aoFim` se vier. */
import { input, tocavel } from '../../core/input';
import { bus } from '../../core/events';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, em } from '../fonte';
import { camada } from '../kit';
import { caixa } from './comum';
import { CREDITOS } from '../../data/textos-ui';

export function criarCreditos(args: { aoFim?(): void; musica?: boolean } = {}): Tela {
  const el = elTela('ui', 'tela-creditos');
  el.style.background = 'linear-gradient(#1a1423 0 70px, #241c3a 70px 110px, #1f4f7a 110px 150px, #2f6b3a 150px)';
  const faixa = (nome: string, y: number) => { const c = camada(nome), d = caixa('', 320 + c.w, c.h); d.style.background = `url(${c.url}) repeat-x`; el.append(em(d, 0, y)); return { d, w: c.w, x: 0 }; };
  const serra = faixa('serra', 110), morros = faixa('morros', 132), mata = faixa('mata', 150);
  const rolo = caixa('', 320, 10); el.append(rolo);
  let y = 0;
  for (const l of CREDITOS) {
    const tipo = Array.isArray(l) ? l[0] : '', str = Array.isArray(l) ? l[1] : l;
    if (tipo === 'titulo') { y += 10; rolo.append(em(texto(str, { tamanho: 12, cor: 'amarelo', sombra: true, largura: 320, alinhar: 'centro' }), 0, y)); y += 22; }
    else if (tipo === 'secao') { y += 6; rolo.append(em(texto(str, { cor: 'ouro', sombra: true, largura: 320, alinhar: 'centro' }), 0, y)); y += 14; }
    else { if (str) rolo.append(em(texto(str, { cor: 'creme', sombra: true, largura: 320, alinhar: 'centro' }), 0, y)); y += 12; }
  }
  const total = y; let pos = 180, t = 0, fim = false;
  const sair = () => { if (fim) return; fim = true; fechar(tela); args.aoFim?.(); };
  tocavel(el, () => input.pulsar('a'));
  const tela: Tela = {
    el,
    entrar() { if (args.musica !== false) bus.emit('musica', 'creditos'); },
    atualizar(dt) {
      t += dt;
      const vel = input.segurando('a') ? 90 : 16;
      pos -= dt * vel; em(rolo, 0, Math.round(pos));
      for (const [f, v] of [[serra, 3], [morros, 6], [mata, 12]] as const) { f.x = (f.x + dt * v) % f.w; f.d.style.left = -Math.floor(f.x) + 'px'; }
      if (pos < -total - 20 || (t > 0.5 && (input.apertou('b') || input.apertou('menu')))) sair();
    },
  };
  return tela;
}
