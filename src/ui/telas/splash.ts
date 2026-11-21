/** Abertura curta: a Cuia de Captura cai, quica e o nome do jogo aparece. Qualquer toque segue para o título. */
import { input, tocavel } from '../../core/input';
import type { Tela } from '../telas';
import { elTela } from '../base';
import { texto, em } from '../fonte';
import { spr } from '../kit';

export function criarSplash(args: { aoFim(): void }): Tela {
  const el = elTela('ui', 'splash', 'fundo-noite');
  const cuia = spr('bolso-cuias'); el.append(cuia);
  const nome = texto('ADVENTURES OF PINGO', { tamanho: 12, cor: 'ouro', sombra: true, largura: 320, alinhar: 'centro' });
  const sub = texto('Uma aventura pelas terras de Pingorama', { cor: 'creme', largura: 320, alinhar: 'centro' });
  const dica = texto(input.modo === 'toque' ? 'Toque para começar' : 'Aperte Z ou Enter', { cor: 'cinza', largura: 320, alinhar: 'centro' });
  dica.classList.add('pisca');
  el.append(em(nome, 0, 92), em(sub, 0, 110), em(dica, 0, 150));
  nome.style.visibility = sub.style.visibility = dica.style.visibility = 'hidden';
  // queda com dois quiques, em px inteiros
  const QUEDA = [-20, -8, 6, 22, 40, 58, 66, 60, 56, 54, 56, 60, 66, 63, 62, 63, 66];
  let t = 0, saiu = false;
  const sair = () => { if (saiu) return; saiu = true; args.aoFim(); };
  tocavel(el, sair);
  return {
    el,
    atualizar(dt) {
      t += dt;
      const q = Math.min(QUEDA.length - 1, Math.floor(t * 20));
      em(cuia, 152, QUEDA[q]);
      if (t > 0.9) nome.style.visibility = '';
      if (t > 1.2) sub.style.visibility = '';
      if (t > 1.6) dica.style.visibility = '';
      if (t > 0.4 && (input.apertou('a') || input.apertou('menu') || input.apertou('b'))) sair();
      if (t > 6) sair();
    },
  };
}
