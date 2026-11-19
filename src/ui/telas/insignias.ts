/** ESTOJO DE INSÍGNIAS — as 16 em duas fileiras de veludo; cada uma mostra o tipo, o líder, a cidade e o lema. */
import type { TipoId } from '../../core/tipos';
import { jogo } from '../../core/estado';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { moldura, insignia, chipTipo, NOME_INSIGNIA } from '../kit';
import { Grade } from '../componentes/grade';
import { faixaDica, placaTitulo, caixa, rotulo } from './comum';
import { LIDERES, T } from '../../data/textos-ui';
import { em } from '../fonte';

export const TIPO_INSIGNIA: TipoId[] = ['vento', 'inseto', 'rio', 'mata', 'terra', 'encanto', 'trovao', 'assombro', 'pedra', 'brasa', 'ginga', 'ferro', 'veneno', 'geada', 'mente', 'lenda'];
export function criarInsignias(): Tela {
  const el = elTela('ui', 'tela-insignias', 'fundo-azulejo');
  const tem = (n: number) => jogo.save.insignias.includes(n);
  placaTitulo(el, `ESTOJO DE INSÍGNIAS  ${jogo.save.insignias.length}/16`, 60, 2, 200);
  const estojo = moldura('madeira', 312, 98, 4, 19); el.append(estojo);
  const veludo = caixa('veludo', 296, 82); estojo.append(em(veludo, 8, 8));
  const celulas = Array.from({ length: 16 }, (_, i) => {
    const c = caixa('cel-insignia', 36, 40);
    const s = insignia(i + 1, tem(i + 1)); s.style.transform = 'scale(2)'; s.style.transformOrigin = '0 0'; c.append(em(s, 2, 4));
    if (tem(i + 1)) { const b = caixa('brilho', 2, 2); b.style.animationDelay = `${(i % 5) * 0.3}s`; c.append(em(b, 8 + (i % 3) * 8, 8 + (i % 4) * 4)); }
    return c;
  });
  const grade = new Grade({ colunas: 8, celulas, w: 36, h: 40, vao: 1, x: 0, y: 0, aoMover: pintar, aoEscolher: pintar, aoCancelar: () => fechar(tela) });
  veludo.append(grade.el);
  const info = moldura('tinta', 312, 46, 4, 118); el.append(info);
  const corpo = caixa('', 264, 38); info.append(em(corpo, 24, 4));
  faixaDica(el)(T.insignias.dica);
  function pintar() {
    const i = grade.indice, l = LIDERES[i];
    corpo.replaceChildren();
    rotulo(corpo, `${i + 1}. Insígnia ${/^[AEO]/.test(NOME_INSIGNIA[i]) ? 'do' : 'da'} ${NOME_INSIGNIA[i]}`.replace('do Estrela', 'da Estrela').replace('do Engrenagem', 'da Engrenagem').replace('do Escama', 'da Escama').replace('da Casulo', 'do Casulo').replace('da Barro', 'do Barro').replace('da Raio', 'do Raio').replace('da Cristal', 'do Cristal').replace('da Berimbau', 'do Berimbau').replace('da Floco', 'do Floco').replace('da Espinho', 'do Espinho'), 0, 1, 'amarelo', { sombra: true });
    corpo.append(em(chipTipo(TIPO_INSIGNIA[i], 56), 208, 0));
    rotulo(corpo, `Líder: {c:agua}${l.lider}{/c}, de ${l.cidade}`, 0, 14, 'creme');
    rotulo(corpo, tem(i + 1) ? `"${l.frase}"` : T.insignias.falta, 0, 26, tem(i + 1) ? 'creme' : 'cinza');
  }
  const tela: Tela = { el, entrar() { pintar(); }, atualizar(dt) { grade.atualizar(dt); } };
  return tela;
}
