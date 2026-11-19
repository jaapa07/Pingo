/** Vitrine do kit (`?tela=vitrine-kit`): todas as peças na tela, para conferir a arte e servir de exemplo de uso. */
import { TIPOS, type Bolso, type StatusId } from '../../core/tipos';
import { input } from '../../core/input';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, em } from '../fonte';
import { moldura, iconeTipo, chipTipo, iconeStatus, insignia, iconeBolso, barra, botao, cursorMao, seta, type TipoMoldura } from '../kit';
import { Abas } from '../componentes/abas';

export function criarVitrine(): Tela {
  const el = elTela('ui', 'fundo-mata');
  const molduras: TipoMoldura[] = ['madeira', 'cipo', 'azulejo', 'texto', 'placa', 'tinta'];
  molduras.forEach((m, i) => { const c = moldura(m, 50, 30, 4 + i * 52, 4); c.append(em(texto(m, { cor: m === 'placa' || m === 'tinta' ? 'creme' : 'tinta' }), 9, 11)); el.append(c); });
  TIPOS.forEach((t, i) => el.append(em(iconeTipo(t), 4 + i * 14, 38)));
  (['mata', 'brasa', 'rio', 'trovao', 'assombro'] as const).forEach((t, i) => el.append(em(chipTipo(t, 58), 4 + i * 62, 53)));
  for (let n = 1; n <= 16; n++) el.append(em(insignia(n, n <= 11), 4 + (n - 1) * 18, 68));
  (['queimado', 'envenenado', 'paralisado', 'dormindo', 'congelado', 'encantado'] as StatusId[]).forEach((s, i) => { el.append(em(iconeStatus(s), 4 + i * 34, 88), em(iconeStatus(s, true), 212 + i * 11, 88)); });
  (['itens', 'remedios', 'cuias', 'pergaminhos', 'frutos', 'chave'] as Bolso[]).forEach((b, i) => el.append(em(iconeBolso(b), 4 + i * 18, 100)));
  const caixa = moldura('tinta', 104, 34, 118, 100);
  const vida = barra('vida', 64), exp = barra('exp', 64);
  caixa.append(em(texto('Tamanduí ♂', { cor: 'creme' }), 6, 5), em(texto('Nv12', { cor: 'amarelo' }), 76, 5), em(texto('VD', { cor: 'amarelo' }), 6, 16), em(vida.el, 22, 16), em(exp.el, 22, 25));
  el.append(caixa);
  const b1 = botao('Botão'), b2 = botao('Foco'), b3 = botao('Apertado'); b2.definirFoco(true); b3.definirApertado(true);
  el.append(em(b1.el, 226, 100), em(b2.el, 262, 100), em(b3.el, 226, 118), em(cursorMao(), 290, 120));
  (['cima', 'baixo', 'esq', 'dir'] as const).forEach((d, i) => el.append(em(seta(d), 276 + i * 10, 103)));
  const abas = new Abas({ rotulos: ['Itens', 'Remédios', 'Cuias'], x: 4, y: 121 }); el.append(abas.el);
  const cx = moldura('texto', 312, 38, 4, 140);
  cx.append(em(texto('A Profª Ipê disse: "{c:vermelho}Pingo{/c}, coração de mãe não se engana!" Ç á é í õ ü ♂♀ ←→↑↓ ★', { tamanho: 12, cor: 'tinta', largura: 290 }), 11, 6));
  el.append(cx);
  let t = 0;
  const tela: Tela = {
    el,
    atualizar(dt) {
      t += dt; abas.atualizar(dt);
      if (Math.floor(t / 2.5) !== Math.floor((t - dt) / 2.5)) { const f = [1, 0.45, 0.15, 0, 0.8][Math.floor(t / 2.5) % 5]; vida.definir(f, true); exp.definir(1 - f, true); }
      vida.atualizar(dt); exp.atualizar(dt);
      if (input.apertou('b')) fechar(tela);
    },
  };
  return tela;
}
