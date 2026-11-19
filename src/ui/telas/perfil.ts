/** PERFIL — cartão do jogador: nome, nº de identidade, patacas, tempo de jogo, insígnias e Diário. `A` abre o estojo de insígnias. */
import { jogo } from '../../core/estado';
import { input, tocavel } from '../../core/input';
import { vista } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, em } from '../fonte';
import { moldura, fileiraInsignias, fmtTempo, som } from '../kit';
import { abrirTela } from '../dialogo';
import { faixaDica, placaTitulo, caixa, rotulo, patacas, TOTAL_DIARIO } from './comum';
import { nomeLocal } from './mapa-dados';

export function criarPerfil(): Tela {
  const s = jogo.save, j = s.jogador;
  const el = elTela('ui', 'tela-perfil', 'fundo-azulejo');
  const cartao = moldura('cipo', 304, 158, 8, 4); el.append(cartao);
  const papel = caixa('papel-cartao', 288, 142); cartao.append(em(papel, 8, 8));
  placaTitulo(papel, 'CARTÃO DE TREINADOR', 6, 4, 150);
  rotulo(papel, `Nº ${j.id}`, 200, 8, 'marrom', { largura: 80, alinhar: 'dir' });
  const quadro = moldura('tinta', 76, 76, 6, 24); papel.append(quadro);
  const rec = caixa('recorte', 68, 68); quadro.append(em(rec, 4, 4));
  let spr: Sprite | null = null;
  const m = vista(j.avatar, 'batalha') ?? vista(j.avatar, 'retrato');
  if (m) { spr = new Sprite(j.avatar, vista(j.avatar, 'batalha') ? 'batalha' : 'retrato', rec); spr.x = m.px + Math.floor((68 - m.cw) / 2); spr.y = m.py + Math.floor((68 - m.ch) / 2); spr.tocar(spr.tem('idle') ? 'idle' : 'neutro'); spr.desenhar(); }
  const linha = (rot: string, val: string, y: number) => { rotulo(papel, rot, 90, y, 'marrom'); rotulo(papel, val, 150, y, 'tinta', { largura: 130, alinhar: 'dir' }); const l = caixa('linha-div', 190, 1); papel.append(em(l, 90, y + 10)); };
  linha('Nome', j.nome, 26); linha('Patacas', patacas(j.dinheiro), 40); linha('Tempo de jogo', fmtTempo(s.tempoJogo), 54);
  linha('Diário', `${s.diario.capturado.length} capturadas de ${TOTAL_DIARIO}`, 68); linha('Avistadas', String(s.diario.visto.length), 82);
  rotulo(papel, nomeLocal(j.zona), 6, 104, 'chumbo', { largura: 76, alinhar: 'centro' });
  rotulo(papel, `Insígnias ${s.insignias.length}/16`, 90, 98, 'marrom');
  const fil = fileiraInsignias(s.insignias, 8, 17); papel.append(em(fil, 90, 108));
  const bt = moldura('botao-foco', 52, 14); bt.append(em(texto('A: Estojo', { cor: 'tinta' }), 5, 3)); papel.append(em(bt, 230, 124)); tocavel(bt, () => void estojo());
  rotulo(papel, `Amuletos de Campo: ${s.amuletos.length}/10`, 6, 128, 'chumbo');
  faixaDica(el)('A: estojo de insígnias   B: voltar');
  let ocupado = false;
  async function estojo() { if (ocupado) return; ocupado = true; som('ui-ok'); await abrirTela('insignias'); ocupado = false; }
  const tela: Tela = {
    el,
    atualizar(dt) {
      if (spr) { spr.atualizar(dt); spr.desenhar(); }
      if (ocupado) return;
      if (input.apertou('a')) { input.consumir('a'); void estojo(); }
      else if (input.apertou('b') || input.apertou('menu')) { input.consumir('b'); som('ui-voltar'); fechar(tela); }
    },
  };
  return tela;
}
