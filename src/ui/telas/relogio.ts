/** Acerto do relógio do Rádio Cipó: dia da semana e hora. Grava o deslocamento em relação ao relógio do aparelho. */
import { jogo, minutosAgora, diaSemana } from '../../core/estado';
import { input, tocavel } from '../../core/input';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, seta, spr, botao, som, trocarSpr } from '../kit';

export const DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const nomePeriodo = (m: number) => (m < 300 ? 'Noite' : m < 600 ? 'Manhã' : m < 1020 ? 'Dia' : m < 1140 ? 'Tarde' : 'Noite');

export function criarRelogio(args?: { titulo?: string }): Tela {
  const el = elTela('ui', 'tela-relogio', 'fundo-azul');
  el.style.backgroundImage = 'repeating-linear-gradient(to bottom, #1f4f7a 0 8px, #1c4870 8px 16px)';
  let dia = diaSemana(), min = minutosAgora(), campo = 0;
  const cx = moldura('azulejo', 240, 140, 40, 20); el.append(cx);
  cx.append(em(texto(args?.titulo ?? 'Que dia e que horas são?', { tamanho: 12, cor: 'tinta', largura: 216, alinhar: 'centro' }), 12, 12));
  const tDia = texto('', { tamanho: 12, cor: 'azul', largura: 130, alinhar: 'centro' }), tHora = texto('', { tamanho: 12, cor: 'tinta' }), tMin = texto('', { tamanho: 12, cor: 'tinta' });
  const tPer = texto('', { cor: 'chumbo' }), astro = spr('sol');
  cx.append(em(tDia, 55, 44), em(tHora, 96, 78), em(texto(':', { tamanho: 12, cor: 'tinta' }), 116, 78), em(tMin, 124, 78), em(astro, 160, 77), em(tPer, 176, 81));
  const ok = botao('Pronto', 60); cx.append(em(ok.el, 90, 108));
  // setas tocáveis de cada campo
  const sEsq = em(seta('esq'), 40, 46), sDir = em(seta('dir'), 193, 46);
  const setas = [[em(seta('cima'), 100, 67), em(seta('baixo'), 100, 93)], [em(seta('cima'), 128, 67), em(seta('baixo'), 128, 93)]];
  cx.append(sEsq, sDir, ...setas.flat());
  const mudar = (c: number, d: number) => {
    campo = c;
    if (c === 0) dia = (dia + d + 7) % 7; else if (c === 1) min = (min + d * 60 + 1440) % 1440; else if (c === 2) min = Math.floor(min / 60) * 60 + ((min % 60) + d + 60) % 60;
    som('ui-mover'); pintar();
  };
  tocavel(sEsq, () => mudar(0, -1)); tocavel(sDir, () => mudar(0, 1));
  setas.forEach((par, i) => { tocavel(par[0], () => mudar(i + 1, 1)); tocavel(par[1], () => mudar(i + 1, -1)); });
  const concluir = () => {
    const agora = new Date();
    jogo.save.relogio.deslocamentoMin = (((min - (agora.getHours() * 60 + agora.getMinutes())) % 1440) + 1440) % 1440;
    jogo.save.relogio.diaSemana0 = (dia - agora.getDay() + 7) % 7;
    som('ui-ok'); fechar(tela, { dia, minutos: min });
  };
  tocavel(ok.el, concluir);
  function pintar() {
    escrever(tDia, DIAS[dia], { cor: campo === 0 ? 'azul' : 'tinta' });
    escrever(tHora, String(Math.floor(min / 60)).padStart(2, '0'), { cor: campo === 1 ? 'azul' : 'tinta' });
    escrever(tMin, String(min % 60).padStart(2, '0'), { cor: campo === 2 ? 'azul' : 'tinta' });
    escrever(tPer, nomePeriodo(min)); trocarSpr(astro, min >= 300 && min < 1140 ? 'sol' : 'lua');
    sEsq.style.visibility = sDir.style.visibility = campo === 0 ? '' : 'hidden';
    setas.forEach((par, i) => par.forEach((s) => { s.style.visibility = campo === i + 1 ? '' : 'hidden'; }));
    ok.definirFoco(campo === 3);
  }
  const tela: Tela = {
    el,
    entrar: pintar,
    atualizar() {
      if (campo === 0) { if (input.repetiu('dir')) mudar(0, 1); else if (input.repetiu('esq')) mudar(0, -1); else if (input.repetiu('baixo')) { campo = 1; som('ui-mover'); pintar(); } }
      else if (campo === 1 || campo === 2) {
        if (input.repetiu('cima')) mudar(campo, 1);
        else if (input.repetiu('baixo')) mudar(campo, -1);
        else if (input.apertou('dir')) { campo = campo === 1 ? 2 : 3; som('ui-mover'); pintar(); }
        else if (input.apertou('esq')) { campo = campo === 2 ? 1 : 0; som('ui-mover'); pintar(); }
      } else if (input.apertou('esq') || input.apertou('cima')) { campo = 2; som('ui-mover'); pintar(); }
      if (input.apertou('a')) { input.consumir('a'); if (campo === 3) concluir(); else { campo++; som('ui-mover'); pintar(); } }
      else if (input.apertou('b') && campo > 0) { campo--; som('ui-voltar'); pintar(); }
    },
  };
  return tela;
}
