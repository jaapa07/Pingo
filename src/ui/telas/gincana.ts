/**
 * GINCANA DE CRIATURAS (spec 10A item 32) — telas `gincana` (as três provas) e `gincana-ranking`, mais os comandos
 * de roteiro usados pelos NPCs do Vale do Buriti-Alto (src/data/eventos/posliga.ts):
 *   ['gincanaJuiza'] · ['gincanaSucos'] · ['gincanaTroca'] · ['gincanaRival', i]
 * Provas em DOM/CSS: fundo e cenário das arenas de batalha (assets/arenas), criatura com a vista `mapa` ampliada
 * ×2 (escala inteira), obstáculos desenhados à mão em grades de pixel e FX do atlas de batalha.
 * Jogáveis por teclado (setas, Z/A, X/B) e por toque (tocar nas raias / em qualquer lugar da pista).
 * O acaso de jogo (posição dos obstáculos) passa pelo `rng`; partículas usam `cosmetico`.
 */
import '../../styles/gincana.css';
import type { CriaturaInst } from '../../core/tipos';
import { jogo, periodo, qtdItem, tirarItem, darItem, flag, setFlag } from '../../core/estado';
import { rng } from '../../core/rng';
import { input, tocavel } from '../../core/input';
import { vista } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { atributos } from '../../battle/index';
import { Fx } from '../../battle/view/cena';
import { elipsePx } from '../../battle/view/palco';
import { registrarComando } from '../../world/registro';
import { item as itemDef } from '../../data/itens';
import {
  PROVA, PROVAS, RIVAIS, SUCOS, NOME_ALVO, TROCA, norma, bonusSuco, sucoDe, tomarSuco, registrarProva, ranking, recordeHoje,
  pontosGincana, gastarPontos, pontosRival, type ProvaId,
} from '../../data/gincana';
import { registrarTela, type Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, som } from '../kit';
import { perguntar } from '../componentes/confirmacao';
import { falar, escolher, abrirTela, avisar } from '../dialogo';
import { pix, faixaDica, placaTitulo, nomeCri, esp, iconeCriatura } from './comum';

const div = (classe: string, pai?: HTMLElement): HTMLElement => { const d = document.createElement('div'); d.className = classe; pai?.append(d); return d; };
/** faixa de marcas do chão que rola para dar a sensação de velocidade */
const tracos = (pai: HTMLElement, classe: string, y: number): HTMLElement => em(div('gn-tracos ' + classe, pai), 0, y);
const rolarEm = (els: HTMLElement[], px: number) => { for (const e of els) e.style.backgroundPosition = `${-Math.round(px)}px 0`; };
/** posiciona por transform (o navegador só recompõe a camada, sem repintar) */
const mover = (el: HTMLElement, x: number, y: number, extra = '') => { el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)${extra}`; };
/** escreve só se o texto mudou (texto bitmap refaz o DOM) */
const escreverSe = (el: HTMLElement, s: string) => { if (el.dataset.s !== s) { el.dataset.s = s; escrever(el, s); } };
const cacheImg = new Map<string, string>();
/** grade de pixels → imagem SVG (rasterizada uma vez pelo navegador; nada de canvas), ampliada ×`esc` (inteiro) como a criatura */
function pixImg(grade: string[], pal: Record<string, string>, esc = 2): HTMLElement {
  const chave = grade.join('|');
  let url = cacheImg.get(chave);
  if (!url) {
    let r = '';
    grade.forEach((l, y) => { let x = 0; while (x < l.length) { let f = x; while (f < l.length && l[f] === l[x]) f++; const c = pal[l[x]]; if (c) r += `<rect x="${x}" y="${y}" width="${f - x}" height="1" fill="${c}"/>`; x = f; } });
    url = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${grade[0].length}" height="${grade.length}" shape-rendering="crispEdges">${r}</svg>`)}")`;
    cacheImg.set(chave, url);
  }
  const el = div('gn-img'); el.style.width = grade[0].length * esc + 'px'; el.style.height = grade.length * esc + 'px'; el.style.backgroundImage = url; el.style.backgroundSize = '100% 100%';
  return el;
}

/* ------------------------------ peças desenhadas à mão ------------------------------ */
const PAL = { k: '#2c1c2c', r: '#8c3c2c', R: '#b85c38', o: '#dc8850', c: '#a8823c', C: '#d0a848', s: '#745040', S: '#a07c58', g: '#3c7048', G: '#6c9c50', w: '#e8eef0', q: '#b0b8cc', Q: '#8c9cc0' };
const PEDRA = ['....kkkkkk....', '..kkqqqqwqkk..', '.kqqqqqqqqwqk.', 'kQqqqqqqqqqqqk', 'kQQqqqqqqqqqqk', 'kQQQqqqqqqqqQk', '.kQQQQqqqqQQk.', '..kkkkkkkkkk..'];
const CUPIM = ['....kkk.....', '...kRRrk....', '...kRRrk....', '..kRRRrrk...', '..kRoRrrk...', '.kRRRRrrrk..', '.kRoRRRrrk..', '.kRRRRRrrrk.', 'kRRRoRRRrrrk', 'kRRRRRRRRrrk', 'kRoRRRRoRrrk', 'kkkkkkkkkkkk'];
const TRONCO = ['..kkkkkkkkkkkkkkkk..', '.kSSSSSSSSSSSSSSSSkk', 'kSssSSSSSSSSSSSSSkCk', 'kSSSSSSsSSSSSSsSSkck', 'kSSsSSSSSSSSSSSSSkCk', 'ksssssssssssssssskck', '.kkkkkkkkkkkkkkkkkk.'];
const TORA = [
  '....kkkkkkkkkkkkkkkkkkkkkkk.....', '..kkSSSSSSSSSSSSSSSSSSSSSSSkkk..', '.kSSSSsSSSSSSSSSSSSsSSSSSSSkCCk.', 'kSSsSSSSSSSSSSsSSSSSSSSSSSSkCcCk',
  'kSSSSSSSSSSSSSSSSSSSSSSSsSSkCcck', 'kSSSSSSsSSSSSSSSSSSSSSSSSSSkcCck', 'kSsSSSSSSSSSSSSSSSSSsSSSSSSkCcCk', 'kSSSSSSSSSSSSSsSSSSSSSSSSSSkCCck',
  'ksssssssssssssssssssssssssskcCck', '.kssssssssssssssssssssssssskcck.', '..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
];
const ESTACA = ['.kk.', 'kCCk', 'kCck', 'kCck', 'kCck', 'kCck', 'kCck', 'kkkk'];

/** criatura da equipe correndo de lado: vista `mapa` (andar-l) ampliada ×2, com sombra elíptica */
class Corredor {
  el = div('gn-cri'); sombra: HTMLElement; private s: Sprite | null = null; private ic: ReturnType<typeof iconeCriatura> | null = null;
  x = 0; y = 0; alt = 0; private ax = 12; private ay = 20; piscar = 0;
  constructor(pai: HTMLElement, num: number, readonly esc = 2) {
    this.sombra = elipsePx(11, 3, 'rgba(44,28,44,0.45)'); this.sombra.classList.add('gn-sombra'); pai.append(this.sombra, this.el);
    const e = esp(num), m = e ? vista(e.id, 'mapa') : undefined;
    if (e && m) { this.s = new Sprite(e.id, 'mapa', this.el); this.ax = m.px; this.ay = m.py; this.s.x = m.px; this.s.y = m.py; this.s.tocar(this.s.tem('andar-l') ? 'andar-l' : 'andar-s'); this.s.desenhar(); this.el.style.width = m.cw + 'px'; this.el.style.height = m.ch + 'px'; }
    else { this.ic = iconeCriatura(num); this.el.append(this.ic.el); this.ic.animar(true); this.el.style.width = this.el.style.height = '24px'; }
  }
  /** anda (ou fica parada de lado, no 1º quadro do andar) */
  andar(b: boolean, vel = 1) { if (this.s) { this.s.tocar(this.s.tem('andar-l') ? 'andar-l' : 'andar-s'); this.s.vel = b ? vel : 0; } this.ic?.animar(b); }
  atualizar(dt: number) { this.s?.atualizar(dt); this.s?.desenhar(); this.ic?.atualizar(dt); if (this.piscar > 0) this.piscar -= dt; }
  desenhar() {
    mover(this.el, this.x - this.ax * this.esc, this.y - this.alt - this.ay * this.esc, ` scale(${this.esc})`);
    mover(this.sombra, this.x - 11, this.y - 3);
    this.el.style.visibility = this.piscar > 0 && Math.floor(this.piscar * 12) % 2 ? 'hidden' : '';
  }
}

/** efeitos soltos (FX do atlas e textos que sobem) */
class Efeitos {
  private fxs: Fx[] = []; private txts: { el: HTMLElement; t: number; y: number }[] = [];
  constructor(private pai: HTMLElement) {}
  fx(id: string, x: number, y: number) { try { const f = new Fx(id, x, y); this.pai.append(f.el); this.fxs.push(f); } catch { /* FX ausente no atlas */ } }
  txt(s: string, x: number, y: number, cor: 'amarelo' | 'verde' | 'vermelho' | 'branco' = 'amarelo') { const el = texto(s, { cor, sombra: true }); this.pai.append(em(el, x - Math.floor(parseInt(el.style.width) / 2), y)); el.classList.add('gn-txt'); this.txts.push({ el, t: 0, y }); }
  atualizar(dt: number) {
    for (const f of this.fxs) { f.atualizar(dt); f.desenhar(); } this.fxs = this.fxs.filter((f) => f.vivo);
    for (const t of this.txts) { t.t += dt; t.el.style.top = Math.round(t.y - t.t * 24) + 'px'; if (t.t > 0.8) t.el.remove(); } this.txts = this.txts.filter((t) => t.t <= 0.8);
  }
}

/* ------------------------------ as provas ------------------------------ */
interface Prova { pista: HTMLElement; pontos: number; dica: string; atualizar(dt: number, t: number): void }
interface Ctx { c: CriaturaInst; bonus: number; vel: number; atq: number; def: number; fx: Efeitos }

/**
 * Corrida da Vereda: 3 raias, obstáculos vêm da direita, estrelas valem ponto.
 * Pontuação (decisão do autor, docs/DECISOES-FINAIS.md: o 1º lugar pede um bom jogo e tocar sem mirar não vence):
 * 1 ponto a cada 40 px, estrela 10, tropeço −25 (e o tropeço dura mais). Antes era 1/32 px, estrela 15 e tropeço sem
 * custo: gente fazia 430–490 e tocar as raias em rodízio fazia ~300, acima de todos os rivais (≤ 260).
 */
const CORRIDA = { pxPorPonto: 40, estrela: 10, tropeco: 25 };
function provaAgilidade(raiz: HTMLElement, x: Ctx): Prova {
  const pista = div('gn-pista gn-raias', raiz);
  const RAIAS = [112, 132, 152], CX = 64;
  const marcas = [tracos(pista, 'gn-faixa', 117), tracos(pista, 'gn-faixa', 137), tracos(pista, 'gn-pedrisco', 100), tracos(pista, 'gn-pedrisco', 156)];
  RAIAS.forEach((y, i) => { const z = div('gn-raia-toque', raiz); em(z, 0, y - 16); tocavel(z, () => { raia = i; }); });
  const cri = new Corredor(pista, x.c.especie); cri.x = CX; cri.y = RAIAS[1];
  let raia = 1, dist = 0, prox = 120, estrelas = 0, tropecos = 0, trope = 0, rolar = 0;
  const vel = (95 + 85 * x.vel) * (1 + x.bonus), tTrope = 1.1 - 0.5 * x.def;
  interface Ob { el: HTMLElement; x: number; r: number; t: 'pedra' | 'cupim' | 'estrela'; feito?: boolean; fx?: Fx }
  let obs: Ob[] = [];
  const criar = (t: Ob['t'], r: number) => {
    let el: HTMLElement;
    if (t === 'estrela') { el = div('gn-ob'); try { const f = new Fx('comum-estrela', 0, 0, { loop: true }); el.append(f.el); obs.push({ el, x: 336, r, t, fx: f }); pista.append(el); return; } catch { el.append(pix(['..k..', '.kyk.', 'kyyyk', '.kyk.', '..k..'], { k: '#a86c14', y: '#fcd834' }, 2)); } }
    else el = pixImg(t === 'pedra' ? PEDRA : CUPIM, PAL);
    el.classList.add('gn-ob'); pista.append(el); obs.push({ el, x: 336, r, t });
  };
  return {
    pista, get pontos() { return Math.max(0, Math.floor(dist / CORRIDA.pxPorPonto) + estrelas * CORRIDA.estrela - tropecos * CORRIDA.tropeco); },
    dica: 'CIMA/BAIXO ou toque na raia: trocar de raia   B: desistir',
    atualizar(dt, t) {
      if (t > 0) {
        if (input.apertou('cima')) raia = Math.max(0, raia - 1);
        if (input.apertou('baixo')) raia = Math.min(2, raia + 1);
      }
      const alvo = RAIAS[raia]; if (cri.y !== alvo) { const d = Math.sign(alvo - cri.y) * Math.max(1, Math.round(dt * 160)); cri.y = Math.abs(alvo - cri.y) <= Math.abs(d) ? alvo : cri.y + d; }
      const v = t <= 0 ? 0 : trope > 0 ? vel * 0.3 : vel;
      if (trope > 0) trope -= dt;
      const passo = v * dt; dist += passo; rolar = (rolar + passo) % 32;
      rolarEm(marcas, rolar);
      cri.andar(v > 0, v > 0 ? Math.max(0.6, v / 110) : 1);
      if (t > 0) {
        prox -= passo;
        if (prox <= 0) {
          prox = rng.int(70, 130) * (1 + x.vel * 0.3);
          const r1 = rng.int(0, 2); criar(rng.chance(0.5) ? 'pedra' : 'cupim', r1);
          if (rng.chance(0.3)) { const r2 = (r1 + rng.int(1, 2)) % 3; criar(rng.chance(0.5) ? 'pedra' : 'cupim', r2); }
          else if (rng.chance(0.55)) criar('estrela', (r1 + rng.int(1, 2)) % 3);
        }
      }
      for (const o of obs) {
        o.x -= passo;
        const w = parseInt(o.el.style.width) || 14, h = parseInt(o.el.style.height) || 10;
        if (o.fx) { o.fx.atualizar(dt); o.fx.x = 0; o.fx.y = 0; o.fx.desenhar(); mover(o.el, o.x, RAIAS[o.r] - 10); }
        else mover(o.el, o.x - w / 2, RAIAS[o.r] - h + 2);
        o.el.style.zIndex = String(RAIAS[o.r]);
        if (!o.feito && o.r === raia && Math.abs(o.x - CX) < (o.t === 'estrela' ? 12 : w / 2 + 4) && Math.abs(cri.y - RAIAS[o.r]) < 8) {
          o.feito = true;
          if (o.t === 'estrela') { estrelas++; som('ui-ok'); x.fx.fx('comum-estrela', CX, cri.y - 30); x.fx.txt('+' + CORRIDA.estrela, CX, cri.y - 44); o.el.remove(); }
          else if (trope <= 0) { trope = tTrope; tropecos++; cri.piscar = tTrope; som('batida'); x.fx.fx('fis-poeira', CX + 8, cri.y - 8); x.fx.txt('-' + CORRIDA.tropeco, CX, cri.y - 44, 'vermelho'); input.vibrar(30); }
        }
      }
      obs = obs.filter((o) => { if (o.x < -24 || (o.t === 'estrela' && o.feito)) { o.el.remove(); return false; } return true; });
      cri.el.style.zIndex = cri.sombra.style.zIndex = String(cri.y + 1);
      cri.atualizar(dt); cri.desenhar();
    },
  };
}

/** Empurra-Tora: marca que vai e volta numa barra; A na faixa verde empurra a tora */
function provaForca(raiz: HTMLElement, x: Ctx): Prova {
  const pista = div('gn-pista gn-chao', raiz);
  const CHAO = 150, CX = 112;
  const pedras = [tracos(pista, 'gn-pedrisco', 156), tracos(pista, 'gn-pedrisco', 162)];
  const estacas: HTMLElement[] = [];
  for (let i = 0; i < 7; i++) { const e = pixImg(ESTACA, PAL); pista.append(e); estacas.push(e); }
  const marcas = estacas.map(() => { const t = texto('', { cor: 'creme', sombra: true }); pista.append(em(t, 0, 0)); return t; });
  const tora = pixImg(TORA, PAL); pista.append(tora);
  const cri = new Corredor(pista, x.c.especie); cri.x = CX; cri.y = CHAO;
  // barra de ritmo
  const caixaR = moldura('tinta', 204, 24, 58, 22); raiz.append(caixaR);
  const W = 188, trilho = div('gn-ritmo', caixaR); em(trilho, 8, 8); trilho.style.width = W + 'px';
  const zona = div('gn-ritmo-zona', trilho), centro = div('gn-ritmo-centro', trilho), marca = div('gn-ritmo-marca', trilho);
  const larg = Math.round(30 + 18 * x.def);
  let zx = Math.round((W - larg) / 2), mx = 0, md = 1, pos = 0, alvo = 0, combo = 0, flex = 0, aperto = false;
  const pintarZona = () => { em(zona, zx, 0); zona.style.width = larg + 'px'; em(centro, zx + Math.floor(larg / 2) - 3, 0); };
  pintarZona();
  const forca = (10 + 14 * x.atq) * (1 + x.bonus), recuo = 9 * (1 - 0.6 * x.def), desliza = 5 * (1 - 0.6 * x.def);
  const empurrar = () => {
    if (aperto) return; aperto = true;
    const meio = zx + larg / 2;
    if (mx >= zx && mx <= zx + larg) {
      const perfeito = Math.abs(mx - meio) <= 3;
      combo = Math.min(4, combo + 1);
      alvo += forca * (perfeito ? 1.6 : 1) * (1 + 0.25 * (combo - 1));
      som(perfeito ? 'empurrar' : 'ui-ok'); flex = 0.25;
      x.fx.fx('terra-poeira', CX - 6, CHAO - 4);
      x.fx.txt(perfeito ? 'PERFEITO!' : combo > 1 ? `×${combo}` : 'Boa!', CX + 20, CHAO - 64, perfeito ? 'amarelo' : 'verde');
      // a faixa muda de lugar a cada acerto
      zx = rng.int(6, W - larg - 6); pintarZona();
    } else { combo = 0; alvo = Math.max(0, alvo - recuo); som('ui-erro'); x.fx.txt('Escorregou!', CX + 20, CHAO - 64, 'vermelho'); input.vibrar(20); }
  };
  tocavel(raiz, empurrar);
  return {
    pista, get pontos() { return Math.floor(pos / 4); },
    dica: 'A ou toque: empurrar na faixa verde   B: desistir',
    atualizar(dt, t) {
      if (t > 0) {
        const sp = (120 + 5 * Math.min(30, t)) * (1 - 0.15 * x.bonus);
        mx += md * sp * dt; if (mx >= W - 2) { mx = W - 2; md = -1; } if (mx <= 0) { mx = 0; md = 1; }
        if (input.apertou('a')) empurrar();
        alvo = Math.max(0, alvo - desliza * dt);
      }
      aperto = false;
      pos += (alvo - pos) * Math.min(1, dt * 8);
      mover(marca, mx, -2);
      if (flex > 0) flex -= dt;
      cri.andar(flex > 0, 1.6);
      cri.alt = 0; cri.x = CX + (flex > 0 ? 2 : 0);
      mover(tora, CX + 18 + (flex > 0 ? 2 : 0), CHAO - 20);
      // estacas do caminho a cada 16 m (64 px) andando para trás conforme a tora sobe
      estacas.forEach((e, i) => {
        const k = Math.floor(pos / 64) + i - 2, px = Math.round(CX + 30 + k * 64 - pos);
        mover(e, px - 4, CHAO - 10); escreverSe(marcas[i], `${Math.max(0, k) * 16}m`); mover(marcas[i], px - 4, CHAO + 8);
        e.style.visibility = marcas[i].style.visibility = k >= 0 ? '' : 'hidden';
      });
      rolarEm(pedras, pos % 32);
      cri.atualizar(dt); cri.desenhar();
    },
  };
}

/** Salto do Riacho: troncos e pedras vêm pelo chão; A pula. Pular bem no meio vale salto perfeito */
function provaSalto(raiz: HTMLElement, x: Ctx): Prova {
  const pista = div('gn-pista gn-chao', raiz);
  em(div('gn-agua', pista), 0, 130);
  const CHAO = 148, CX = 72, ALT = 44;
  const agua = [tracos(pista, 'gn-brilho', 134)], chao = [tracos(pista, 'gn-pedrisco', 154), tracos(pista, 'gn-pedrisco', 160)];
  const cri = new Corredor(pista, x.c.especie); cri.x = CX; cri.y = CHAO;
  const vel = (105 + 55 * x.vel) * (1 + x.bonus * 0.5), dur = (0.55 + 0.2 * x.vel) * (1 + x.bonus * 0.5), tTrope = 0.85 * (1 - 0.5 * x.def);
  let noAr = -1, prox = 160, pts = 0, combo = 0, trope = 0, rolar = 0;
  interface Ob { el: HTMLElement; x: number; w: number; h: number; feito?: boolean }
  let obs: Ob[] = [];
  const pular = () => { if (noAr < 0 && trope <= 0) { noAr = 0; som('pulo-saliencia'); x.fx.fx('fis-poeira', CX - 4, CHAO - 4); } };
  tocavel(raiz, () => pular());
  return {
    pista, get pontos() { return pts; },
    dica: 'A ou toque: pular   B: desistir',
    atualizar(dt, t) {
      const v = t <= 0 ? 0 : trope > 0 ? vel * 0.4 : vel;
      if (t > 0 && input.apertou('a')) pular();
      if (trope > 0) trope -= dt;
      if (noAr >= 0) { noAr += dt / dur; if (noAr >= 1) noAr = -1; }
      cri.alt = noAr >= 0 ? Math.round(ALT * 4 * noAr * (1 - noAr)) : 0;
      const passo = v * dt; rolar = (rolar + passo) % 32;
      rolarEm(chao, rolar); rolarEm(agua, rolar / 2);
      cri.andar(v > 0 && noAr < 0, Math.max(0.6, v / 110));
      if (t > 0) {
        prox -= passo;
        if (prox <= 0) {
          prox = rng.int(110, 200) * (1 + x.vel * 0.25);
          const tronco = rng.chance(0.6), el = pixImg(tronco ? TRONCO : PEDRA, PAL);
          el.classList.add('gn-ob'); pista.append(el);
          obs.push({ el, x: 340, w: tronco ? 40 : 28, h: tronco ? 14 : 16 });
        }
      }
      for (const o of obs) {
        o.x -= passo; mover(o.el, o.x - o.w / 2, CHAO - o.h + 2);
        if (o.feito) continue;
        if (Math.abs(o.x - CX) < (o.w / 2 + 4) && cri.alt < o.h) {
          o.feito = true; combo = 0; trope = tTrope; cri.piscar = tTrope; noAr = -1;
          som('batida'); x.fx.fx('fis-impacto', CX + 6, CHAO - 10); x.fx.txt('Tropeçou!', CX, CHAO - 60, 'vermelho'); input.vibrar(30);
        } else if (o.x < CX - o.w / 2 - 6) {
          o.feito = true; combo = Math.min(4, combo + 1);
          // perfeito: passou por baixo bem no topo do pulo
          const perfeito = (o as Ob & { meio?: boolean }).meio === true;
          const ganho = 4 + combo + (perfeito ? 4 : 0); pts += ganho;
          x.fx.txt(perfeito ? `PERFEITO +${ganho}` : `+${ganho}`, CX, CHAO - 60, perfeito ? 'amarelo' : 'verde');
          if (perfeito) { som('ui-ok'); x.fx.fx('comum-estrela', CX, CHAO - ALT - 12); }
        }
        if (Math.abs(o.x - CX) < 3 && noAr >= 0.3 && noAr <= 0.7) (o as Ob & { meio?: boolean }).meio = true;
      }
      obs = obs.filter((o) => { if (o.x < -30) { o.el.remove(); return false; } return true; });
      cri.atualizar(dt); cri.desenhar();
    },
  };
}

/* ------------------------------ tela da prova ------------------------------ */
export interface ArgsGincana { prova: ProvaId; uid: string }
const ARENA: Record<ProvaId, string> = { agilidade: 'cerrado', forca: 'chapada', salto: 'pantanal' };

function criarGincana(args: ArgsGincana): Tela {
  const def = PROVA[args.prova];
  const c = jogo.save.equipe.find((x) => x.uid === args.uid) ?? jogo.save.equipe[0];
  const at = atributos(c);
  const ctxBase = { c, bonus: bonusSuco(c, args.prova), vel: norma(at.vel), atq: norma(at.atq), def: norma(at.def) };
  const el = elTela('ui', 'tela-gincana');
  const per = periodo() === 'noite' ? 'noite' : 'dia', arena = ARENA[args.prova];
  for (const cam of ['fundo', 'cenario']) { const d = div('gn-camada', el); d.style.backgroundImage = `url(assets/arenas/${arena}/${cam}-${per}.png)`; }
  const toque = div('gn-toque', el);
  const camFx = div('gn-fx', el);
  const fx = new Efeitos(camFx);
  const ctx: Ctx = { ...ctxBase, fx };
  const prova = args.prova === 'agilidade' ? provaAgilidade(toque, ctx) : args.prova === 'forca' ? provaForca(toque, ctx) : provaSalto(toque, ctx);
  // placar
  const placar = moldura('placa', 316, 15, 2, 2); el.append(placar);
  const tNome = texto(def.nome.toUpperCase(), { cor: 'amarelo', sombra: true }); placar.append(em(tNome, 6, 4));
  const tTempo = texto('', { cor: 'creme', sombra: true }); placar.append(tTempo);
  const tPts = texto('', { cor: 'creme', sombra: true }); placar.append(tPts);
  if (ctx.bonus > 0) { const s = sucoDe(c); const tb = texto(`${s?.nome ?? 'Suco'} +${Math.round(ctx.bonus * 100)}%`, { cor: 'verde', sombra: true }); el.append(em(tb, 4, 19)); }
  const dica = faixaDica(el);
  dica(prova.dica);
  // placa da contagem / FIM (só aparece com texto)
  const cxAviso = moldura('placa', 96, 24, 112, 54); cxAviso.classList.add('gn-aviso'); el.append(cxAviso);
  const aviso = texto('', { tamanho: 12, cor: 'amarelo', sombra: true, largura: 88, alinhar: 'centro' }); cxAviso.append(em(aviso, 4, 6));
  const mostrarAviso = (str: string) => { escreverSe(aviso, str); cxAviso.style.visibility = str ? '' : 'hidden'; };
  let fase: 'conta' | 'jogo' | 'fim' | 'res' = 'conta', t = 3.2, resto = def.duracao, pausado = false, res: HTMLElement | null = null;
  const pintarPlacar = () => {
    escreverSe(tTempo, `Tempo ${Math.ceil(Math.max(0, resto))}s`); em(tTempo, 160 - Math.floor(parseInt(tTempo.style.width) / 2), 4);
    escreverSe(tPts, `Pontos ${prova.pontos}`); em(tPts, 310 - parseInt(tPts.style.width), 4);
  };
  const mostrarResultado = () => {
    fase = 'res';
    const rec = recordeHoje(args.prova), pts = prova.pontos;
    res = moldura('madeira', 200, 92, 60, 40); res.classList.add('gn-res'); el.append(res);
    const linhas = [`${nomeCri(c)} fez`, `{c:vermelho}${pts} pontos{/c}`, pts > rec ? 'Recorde do dia!' : `Recorde do dia: ${rec}`];
    res.append(em(texto(linhas.join('\n'), { tamanho: 12, cor: 'tinta', largura: 184, alinhar: 'centro' }), 8, 12));
    const ok = texto('A: continuar', { cor: 'marrom' }); res.append(em(ok, 100 - Math.floor(parseInt(ok.style.width) / 2), 72));
    tocavel(res, () => fechar(tela, { pontos: pts }));
    dica('A: continuar');
  };
  async function desistir() {
    pausado = true;
    const i = await perguntar('Desistir da prova? Os pontos desta rodada não contam.', ['Continuar', 'Desistir'], 0);
    pausado = false; if (i === 1) fechar(tela, null);
  }
  const tela: Tela = {
    el,
    atualizar(dt) {
      if (pausado) return;
      if (fase === 'res') { if (input.apertou('a') || input.apertou('b')) fechar(tela, { pontos: prova.pontos }); return; }
      if (fase === 'conta') {
        const n = Math.ceil(t - 0.2); mostrarAviso(n > 0 ? String(n) : 'JÁ!');
        const antes = t; t -= dt; if (Math.ceil(antes - 0.2) !== Math.ceil(t - 0.2)) som(t < 0.2 ? 'ui-ok' : 'ui-mover');
        if (t <= 0) { fase = 'jogo'; mostrarAviso(''); }
        prova.atualizar(dt, 0);
      } else if (fase === 'jogo') {
        if (input.apertou('b')) { void desistir(); return; }
        resto -= dt; prova.atualizar(dt, def.duracao - resto);
        if (resto <= 0) { fase = 'fim'; t = 1.4; mostrarAviso('FIM!'); som('insignia'); }
      } else { prova.atualizar(dt, 0); t -= dt; if (t <= 0) { mostrarAviso(''); mostrarResultado(); } }
      fx.atualizar(dt); pintarPlacar();
    },
  };
  pintarPlacar();
  return tela;
}

/* ------------------------------ ranking do dia ------------------------------ */
function criarRanking(): Tela {
  const el = elTela('ui', 'tela-gincana-ranking', 'fundo-terra');
  placaTitulo(el, 'RANKING DO DIA', 2, 1, 150);
  const cxP = moldura('placa', 160, 15, 158, 1); el.append(cxP);
  cxP.append(em(texto(`Pontos da Gincana: {c:amarelo}${pontosGincana()}{/c}`, { cor: 'creme', sombra: true }), 6, 4));
  const quadro = moldura('madeira', 316, 146, 2, 18); el.append(quadro);
  const COL = [8, 116, 182, 248];
  ['Participante', 'Agilidade', 'Força', 'Salto'].forEach((h, i) => quadro.append(em(texto(h, { cor: 'marrom' }), COL[i], 10)));
  const nomes = [jogo.save.jogador.nome, ...RIVAIS.map((r) => r.nome)];
  const linhas = nomes.map((n) => ({ n, jog: n === jogo.save.jogador.nome, pts: PROVAS.map((p) => (n === jogo.save.jogador.nome ? recordeHoje(p) : pontosRival(RIVAIS.find((r) => r.nome === n)!, p))) }));
  const posDe = (p: number, n: string) => ranking(PROVAS[p]).findIndex((l) => (l.jogador ? jogo.save.jogador.nome : l.nome) === n) + 1;
  linhas.forEach((l, j) => {
    const y = 28 + j * 22;
    if (l.jog) { const f = div('gn-linha-jog', quadro); em(f, 6, y - 3); }
    quadro.append(em(texto(l.n, { cor: l.jog ? 'vermelho' : 'tinta', tamanho: 12 }), COL[0], y));
    l.pts.forEach((pt, i) => {
      const pos = posDe(i, l.n);
      quadro.append(em(texto(l.jog && !pt ? '—' : `${pos}º {c:${pos === 1 ? 'vermelho' : 'tinta'}}${pt}{/c}`, { cor: 'marrom', tamanho: 12 }), COL[i + 1], y));
    });
  });
  quadro.append(em(texto('Pódio de cada prova vale pontos extras uma vez por dia: 1º 30, 2º 15, 3º 5. Os rivais treinam de novo amanhã.', { cor: 'marrom', largura: 296 }), 8, 118));
  faixaDica(el)('A ou B: fechar');
  const tela: Tela = { el, atualizar() { if (input.apertou('a') || input.apertou('b')) fechar(tela); } };
  tocavel(el, () => fechar(tela));
  return tela;
}

registrarTela('gincana', criarGincana);
registrarTela('gincana-ranking', criarRanking);

/* ------------------------------ comandos dos NPCs do vale ------------------------------ */
const JUIZA = { nome: 'Juíza Bia Corrida', retrato: 'cl-escoteira' };
const GRAVIOLA = { nome: 'Seu Graviola', retrato: 'npc-vendedor' };
async function escolherCriatura(titulo: string): Promise<CriaturaInst | null> {
  const i = (await abrirTela('equipe', { modo: 'escolher', titulo, pode: (c: CriaturaInst) => (c.ovo ? 'Ovo não corre.' : c.vida <= 0 ? 'Desmaiada não dá para correr.' : true) })) as number | undefined;
  return typeof i === 'number' && i >= 0 ? jogo.save.equipe[i] ?? null : null;
}
registrarComando('gincanaJuiza', async () => {
  if (!flag('gincana-visitou')) {
    setFlag('gincana-visitou');
    await falar('Bem-vindo à Gincana de Criaturas do Buriti-Alto! Aqui ninguém briga: as criaturas correm, empurram e pulam.', JUIZA);
    await falar('Três provas: AGILIDADE (Velocidade), FORÇA (Ataque) e SALTO (Velocidade e Defesa). O recorde do dia em cada prova rende pontos da Gincana, e o pódio do dia rende mais.', JUIZA);
    await falar('O Seu Graviola bate suco de fruto que deixa a criatura mais disposta até o fim do dia. Os pontos a Tesoureira Pataca troca por vitamina, pedra e pergaminho.', JUIZA);
  }
  const op = await escolher('Qual prova vai ser?', ['Agilidade', 'Força', 'Salto', 'Ver o ranking', 'Agora não']);
  if (op === 3) { await abrirTela('gincana-ranking'); return; }
  if (op < 0 || op > 2) { await falar('Volte quando quiser. A pista não sai daqui.', JUIZA); return; }
  const p = PROVAS[op];
  await falar(PROVA[p].regra, JUIZA);
  const c = await escolherCriatura(`${PROVA[p].nome.toUpperCase()}: QUEM VAI?`);
  if (!c) return;
  const s = sucoDe(c);
  if (s) await falar(`${nomeCri(c)} tomou ${s.nome} hoje: ${s.alvo === p || s.alvo === 'todas' ? `+${s.pct}% nesta prova!` : `só vale para ${NOME_ALVO[s.alvo]}.`}`, JUIZA);
  const r = (await abrirTela('gincana', { prova: p, uid: c.uid })) as { pontos: number } | null | undefined;
  if (!r) { await falar('Desistiu? Sem problema. Respira, toma uma água e volta.', JUIZA); return; }
  const f = registrarProva(p, r.pontos);
  await falar(`${nomeCri(c)} fez ${f.pontos} pontos ${p === 'salto' ? 'no' : 'na'} ${PROVA[p].nome}!${f.recorde ? ' É o seu melhor resultado de hoje.' : ''}`, JUIZA);
  // a posição é a desta rodada; se ela não bateu o recorde, a Juíza lembra a posição que vale no ranking (a do recorde)
  const posTxt = `Posição desta rodada no ranking de hoje: ${f.posRodada}º lugar.${!f.recorde && f.pos !== f.posRodada ? ` No quadro vale o seu recorde: ${f.pos}º.` : ''}`;
  const ganhoTxt = f.ganhos ? `Você ganhou ${f.ganhos} pontos da Gincana (total: ${pontosGincana()}).` : `Sem pontos novos: só o recorde do dia vale pontos (total: ${pontosGincana()}).`;
  await falar(`${posTxt}${f.premio ? ` Prêmio de pódio: +${f.premio}!` : ''}\f${ganhoTxt}`, JUIZA);
});
registrarComando('gincanaSucos', async () => {
  if (!flag('gincana-sucos-presente')) {
    setFlag('gincana-sucos-presente');
    await falar('Freguês novo! Olha o liquidificador: fruto entra inteiro, sai suco que dá gás na criatura até o fim do dia.', GRAVIOLA);
    await falar('Para começar, a casa dá três cajus. Caju é bom para correr.', GRAVIOLA);
    darItem('caju', 3); som('item-obtido'); avisar('Recebeu 3× Caju!');
  }
  const tem = SUCOS.filter((s) => qtdItem(s.fruto) > 0);
  if (!tem.length) { await falar('Sem fruto não tem suco. Caju, pitanga, cupuaçu, pequi, jabuticaba, buriti, acerola ou açaí: colha nos canteiros e nas árvores e traga aqui.', GRAVIOLA); return; }
  const i = await escolher('Qual fruto vai no liquidificador?', [...tem.map((s) => `${itemDef(s.fruto).nome} (×${qtdItem(s.fruto)}): ${NOME_ALVO[s.alvo]} +${s.pct}%`), 'Nenhum']);
  if (i < 0 || i >= tem.length) { await falar('Tá certo. O liquidificador fica ligado na tomada esperando.', GRAVIOLA); return; }
  const s = tem[i];
  const c = await escolherCriatura('QUEM BEBE O SUCO?');
  if (!c) return;
  const antes = sucoDe(c);
  if (antes && antes.fruto !== s.fruto) await falar(`${nomeCri(c)} já tomou ${antes.nome} hoje. O suco novo toma o lugar do outro.`, GRAVIOLA);
  tirarItem(s.fruto, 1); tomarSuco(c, s); som('cura-posto');
  await falar(`Vrrrrrrum! ${s.nome} na cuia! ${nomeCri(c)} bebeu tudinho: +${s.pct}% em ${NOME_ALVO[s.alvo]} até o fim do dia.`, GRAVIOLA);
});
registrarComando('gincanaTroca', async () => {
  await abrirTela('loja', { titulo: 'Tesouraria', itens: Object.keys(TROCA), moeda: { nome: 'pontos', saldo: pontosGincana, gastar: gastarPontos, preco: (id: string) => TROCA[id] ?? 999 } });
});
registrarComando('gincanaRival', async ([n]) => {
  const r = RIVAIS[Number(n) || 0]; if (!r) return;
  const quem = { nome: r.nome, retrato: r.sprite };
  await falar(r.fala, quem);
  const pts = PROVAS.map((p) => `${PROVA[p].nome}: ${pontosRival(r, p)}`);
  await falar(`Hoje eu fiz… ${pts.join(' · ')}. Bate isso se for capaz!`, quem);
});
