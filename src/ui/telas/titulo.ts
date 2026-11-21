/**
 * Tela de título: logo "ADVENTURES OF PINGO" em pixel art sobre uma paisagem em camadas
 * (céu em faixas, sol, nuvens, serra, mar, morros e mata) com parallax de deslocamentos inteiros.
 */
import type { Tela } from '../telas';
import { elTela, div } from '../base';
import { texto, em } from '../fonte';
import { camada } from '../kit';
import { Lista } from '../componentes/lista';
import { plataforma } from '../../core/plataforma';
import { DEMO, TEXTOS_DEMO } from '../../core/demo';

function faixa(nome: string, y: number, pai: HTMLElement, altura?: number): HTMLElement {
  const c = camada(nome), d = div('', pai);
  d.style.cssText = `position:absolute;left:0;top:${y}px;width:320px;height:${altura ?? c.h}px;background:url(${c.url}) 0 0 repeat-x`;
  if (altura) d.style.backgroundRepeat = 'repeat';
  return d;
}
function solto(nome: string, x: number, y: number, pai: HTMLElement): HTMLElement {
  const c = camada(nome), d = div('', pai);
  d.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${c.w}px;height:${c.h}px;background:url(${c.url}) no-repeat`;
  return d;
}

export function criarTitulo(args: { aoJogar(): void; aoOpcoes(): void }): Tela {
  const el = elTela('ui', 'titulo');
  // céu do amanhecer em faixas chapadas
  el.style.background = 'linear-gradient(to bottom, #2f6fb4 0 14px, #3f86c8 14px 30px, #58a2d8 30px 48px, #7fc0e4 48px 66px, #a8d8ea 66px 82px, #f6e6b8 82px 96px, #f9d28a 96px 110px, #2f86c4 110px)';
  solto('sol', 222, 62, el);
  const nuvens = [solto('nuvem', 30, 26, el), solto('nuvem', 180, 44, el), solto('nuvem', 270, 16, el)];
  const serra = faixa('serra', 76, el), mar = faixa('mar', 110, el, 16), morros = faixa('morros', 112, el);
  const chao = div('', el); chao.style.cssText = 'position:absolute;left:0;top:138px;width:320px;height:42px;background:#2a7a4a';
  const mata = faixa('mata', 150, el);
  const lSub = camada('logo-sub'), lPingo = camada('logo-pingo');
  const logo = div('', el); logo.style.cssText = 'position:absolute;left:0;top:0;width:320px;height:80px';
  solto('logo-sub', Math.floor((320 - lSub.w) / 2), 12, logo);
  solto('logo-pingo', Math.floor((320 - lPingo.w) / 2), 27, logo);
  const itens = ['Jogar', 'Opções', ...(plataforma.podeSair ? ['Sair'] : [])];
  const menu = new Lista({ itens, tamanho: 12, circular: true, aoEscolher: (i) => { if (i === 0) args.aoJogar(); else if (i === 1) args.aoOpcoes(); else plataforma.sair(); } });
  em(menu.el, Math.floor((320 - menu.largura) / 2), 176 - parseInt(menu.el.style.height) - 2);
  el.append(menu.el);
  if (DEMO) { const v = texto(`${TEXTOS_DEMO.selo} · v1.0`, { cor: 'creme', sombra: true }); el.append(em(v, 316 - (parseInt(v.style.width) || 60), 170)); }
  else el.append(em(texto('v1.0', { cor: 'creme', sombra: true }), 296, 170));
  let t = 0;
  const BASE_NUVEM = [60, 210, 300];
  const BALANCO = [0, 0, 1, 1, 2, 1, 1, 0];
  return {
    el,
    atualizar(dt) { t += dt; menu.atualizar(dt); },
    desenhar() {
      // parallax: cada camada anda um número inteiro de pixels
      serra.style.backgroundPositionX = -Math.floor(t * 2) + 'px';
      mar.style.backgroundPositionX = -Math.floor(t * 5) + 'px';
      morros.style.backgroundPositionX = -Math.floor(t * 8) + 'px';
      mata.style.backgroundPositionX = -Math.floor(t * 16) + 'px';
      nuvens.forEach((n, i) => { n.style.left = ((((BASE_NUVEM[i] - Math.floor(t * (3 + i * 2))) % 360) + 360) % 360) - 30 + 'px'; });
      logo.style.transform = `translateY(${BALANCO[Math.floor(t * 3) % BALANCO.length]}px)`;
    },
  };
}
