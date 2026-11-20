/**
 * Missão "O Encontro das Águas" (spec 6.5, lendário 181 Galo-Manaó) — mecânicas de campo.
 *
 * 1. Zona X-EA (src/data/zonas/X-EA.ts): pinta por cima do bake as duas águas (escura a oeste, barrenta a leste) e a
 *    espuma da linha do encontro; QUEBRA-CABEÇA DE CORRENTEZA: dentro da faixa `FAIXA`, a canoa só pode ficar em água
 *    barrenta que encosta (inclusive na diagonal) na escura. Cruzar para a escura ou se afastar dela faz a correnteza
 *    levar a canoa de volta ao último remanso (`REMANSOS`, marcados por folhas de aguapé).
 *    DANÇA DE CORTE: na entrada da arena da ilhota o Galo-Manaó desce e dança; a batalha (evento `vis-galo-batalha`)
 *    só começa se o jogador assistir à dança inteira sem andar nem virar. Mexeu: ele foge; sair da arena e voltar
 *    chama de novo. Enquanto o jogador não tiver um Galo-Manaó (soltou, derrotou ou fugiu), ele volta a aparecer.
 * 2. Os dois frascos (pontos de colheita em zonas de outros times, sem mexer nos arquivos delas):
 *    - A-R6 Rio Cachoeira-Véu, Poço do Breu (15, 53): de NOITE, parando a canoa ali, Mergulho → água escura.
 *    - B-R2 Estrada Vermelha, poço da cascata seca (84, 22): só se chega subindo a cascata (Cachoeira); de DIA → água barrenta.
 *    A mecânica dessas zonas é ANEXADA (se a zona já tiver uma mecânica registrada, ela roda antes e tem prioridade).
 */
import type { Dir } from '../../core/tipos';
import { jogo, flag, setFlag, qtdItem, darItem, tirarItem, periodo } from '../../core/estado';
import { bus } from '../../core/events';
import { mecanicas, registrarMecanica, type Mecanica } from '../registro';
import { Ator } from '../ator';
import { pedirAmuleto } from '../campo';
import { simNao } from '../deps';
import { rodarEvento } from '../eventos';
import { M, mundo, Enfeites, cena, falar, avisar, sfx, quadros, recolocar, laco, naZona, TILE } from './_pecas';
import { FAIXA, MARGEM_ESCURA, REMANSOS, ENTRADA_ARENA, PALCO_GALO, ILHOTA, LARG, ALT } from '../../data/zonas/X-EA';

const ZONA = 'X-EA';
const GALO = 181;

/* ------------------------------ utilidades ------------------------------ */
/** o jogador tem (equipe ou Viveiro) uma criatura desta espécie que não seja ovo? */
export function possui(especie: number): boolean {
  const s = jogo.save, ok = (c: { especie: number; ovo?: number } | null) => !!c && c.especie === especie && !c.ovo;
  return s.equipe.some(ok) || s.viveiro.some((cx) => cx.some(ok));
}
/** anexa uma mecânica a uma zona sem apagar a que já estiver lá (a existente tem prioridade em passo/interagir) */
function anexar(zona: string, m: Mecanica) {
  const antes = mecanicas.get(zona);
  if (!antes) { registrarMecanica(zona, m); return; }
  registrarMecanica(zona, {
    entrar() { antes.entrar?.(); m.entrar?.(); },
    sair() { antes.sair?.(); m.sair?.(); },
    passo(x, y) { return antes.passo?.(x, y) === true || m.passo?.(x, y) === true; },
    interagir(x, y) { return antes.interagir?.(x, y) === true || m.interagir?.(x, y) === true; },
  });
}
let estiloOk = false;
function estilo() {
  if (estiloOk) return; estiloOk = true;
  const s = document.createElement('style');
  s.textContent = `
.xea-agua{position:absolute;left:0;top:0;pointer-events:none;z-index:1}
.xea-escura,.xea-barrenta{position:absolute;left:0;top:0;pointer-events:none}
.xea-escura{background:rgba(18,10,4,.64)}
.xea-barrenta{background:rgba(214,140,60,.64)}
.xea-espuma{position:absolute;left:0;top:0;pointer-events:none;background:#f4ead2;animation:xea-espuma 1.2s steps(2) infinite}
@keyframes xea-espuma{0%{opacity:.9}100%{opacity:.35}}`;
  document.head.append(s);
}
/** retângulo de px no mapa (camada dos sprites, atrás dos atores) */
function ret(pai: HTMLElement, classe: string, x: number, y: number, w: number, h: number, z = 1) {
  const d = document.createElement('div'); d.className = classe;
  d.style.cssText = `width:${w}px;height:${h}px;transform:translate(${x}px,${y}px);z-index:${z}`;
  pai.append(d); return d;
}

/* ------------------------------ X-EA: águas, correnteza e dança ------------------------------ */
const enf = new Enfeites();
let pintura: HTMLElement | null = null;
let remanso: [number, number] = REMANSOS[0];
let galo: Ator | null = null;
/** 'longe' (não está), 'pousado' (esperando), 'dancando', 'assustado' (fugiu até o jogador sair da arena) */
let estadoGalo: 'longe' | 'pousado' | 'dancando' | 'assustado' = 'longe';
let visita = 0;

const ehAgua = (x: number, y: number) => M.zv.agua(x, y);
const escura = (x: number, y: number) => ehAgua(x, y) && x < MARGEM_ESCURA[y];
const naFaixa = (y: number) => y >= FAIXA[0] && y <= FAIXA[1];
/** tile da linha do encontro: barrenta encostada (8 vizinhos) na escura */
export function naLinha(x: number, y: number): boolean {
  if (!ehAgua(x, y) || escura(x, y)) return false;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && y + dy >= 0 && y + dy < ALT && escura(x + dx, y + dy)) return true;
  return false;
}
const naArena = (x: number, y: number) => x > ILHOTA.x0 && x < ILHOTA.x1 && y > ILHOTA.y0 + 1 && y < 9;

function pintarAguas() {
  estilo();
  pintura?.remove();
  const p = document.createElement('div'); p.className = 'xea-agua'; pintura = p;
  for (let y = 0; y < ALT; y++) {
    // trechos contínuos de água de cada cor nesta linha
    let x = 0;
    while (x < LARG) {
      if (!ehAgua(x, y)) { x++; continue; }
      const cor = escura(x, y); let x2 = x;
      while (x2 + 1 < LARG && ehAgua(x2 + 1, y) && escura(x2 + 1, y) === cor) x2++;
      ret(p, cor ? 'xea-escura' : 'xea-barrenta', x * TILE, y * TILE, (x2 - x + 1) * TILE, TILE);
      x = x2 + 1;
    }
    // espuma da linha: borda vertical entre as duas águas e degrau horizontal quando a margem muda de coluna
    const m = MARGEM_ESCURA[y];
    if (ehAgua(m, y) && ehAgua(m - 1, y)) ret(p, 'xea-espuma', m * TILE - 1, y * TILE, 2, TILE, 2);
    if (y > 0 && MARGEM_ESCURA[y - 1] !== m) {
      const a = Math.min(m, MARGEM_ESCURA[y - 1]), b = Math.max(m, MARGEM_ESCURA[y - 1]);
      for (let k = a; k < b; k++) if (ehAgua(k, y) && ehAgua(k, y - 1)) ret(p, 'xea-espuma', k * TILE, y * TILE - 1, TILE, 2, 2);
    }
  }
  M.cena.baixo.append(p);
  // folhas de aguapé nos remansos
  const AGUAPE = [['..gg..', '.gGGg.', 'gGGGGg', 'gGrrGg', '.gGGg.', '..gg..']];
  REMANSOS.forEach(([x, y], i) => enf.pix('remanso' + i, AGUAPE, { g: '#2f6b2a', G: '#6fc24a', r: '#e58ad0' }, x, y, { dx: 10, dy: 1, z: 3 }));
}

/** a correnteza leva a canoa de volta ao último remanso */
async function arrastado(paraEscura: boolean, d: Dir) {
  sfx('cachoeira');
  const j = M.jog;
  await quadros(18, (i) => { j.ex = (d === 'l' ? 1 : d === 'o' ? -1 : 0) * Math.min(i, 10); j.ey = (d === 's' ? 1 : d === 'n' ? -1 : 0) * Math.min(i, 10); });
  j.ex = 0; j.ey = 0;
  recolocar(remanso[0], remanso[1], 'n');
  await falar(paraEscura
    ? 'A água escura puxou a canoa para o lado dela, rápida e fria!\nA correnteza devolveu você ao último remanso.'
    : 'Longe da linha do encontro, a água barrenta arrastou a canoa rio abaixo!\nA correnteza devolveu você ao último remanso.');
  avisar('Reme sempre colado à linha onde as duas águas se encontram.');
}

function galoDisponivel() { return !!flag('ea-rota') && !possui(GALO); }
function tirarGalo() { if (galo) { galo.remover(); M.extras = M.extras.filter((a) => a !== galo); galo = null; } }
function porGalo() {
  tirarGalo();
  galo = new Ator('c:galo-manao', mundo.camadaSprites, PALCO_GALO[0], PALCO_GALO[1], 's');
  M.extras.push(galo);
  estadoGalo = 'pousado';
}

/** sequência da dança: passos de lado, saltos e o leque da crista (balões de nota) */
const PASSOS_DANCA: { d?: Dir; pulo?: boolean; nota?: boolean; pausa: number }[] = [
  { nota: true, pausa: 30 }, { d: 'o', pausa: 10 }, { pulo: true, pausa: 16 }, { d: 'l', pausa: 10 }, { d: 'l', pausa: 10 }, { pulo: true, pausa: 16 },
  { d: 'o', pausa: 10 }, { nota: true, pausa: 30 }, { pulo: true, pausa: 12 }, { pulo: true, pausa: 12 }, { d: 'o', pausa: 10 }, { d: 'l', pausa: 10 },
  { nota: true, pausa: 24 }, { pulo: true, pausa: 16 }, { pausa: 40 },
];
function dancar() {
  if (!galo) return;
  const a = galo, j = M.jog, x0 = j.x, y0 = j.y, dir0 = j.dir, v = visita;
  estadoGalo = 'dancando';
  let i = 0, espera = 50, pulo = 0;
  sfx('cuia-balanco');
  laco(() => naZona(ZONA) && visita === v && estadoGalo === 'dancando', () => {
    // o jogador se mexeu (andou ou virou)? o galo se assusta e foge
    if (j.x !== x0 || j.y !== y0 || j.dir !== dir0 || j.movendo) { assustar(); return; }
    if (M.ocupado) return;
    if (pulo > 0) { pulo--; a.ey = -Math.round(Math.sin((pulo / 12) * Math.PI) * 5); }
    if (--espera > 0 || a.movendo) return;
    const p = PASSOS_DANCA[i++];
    if (!p) { estadoGalo = 'pousado'; a.virar('s'); cena(batalhar); return; }
    espera = p.pausa;
    if (p.d) { void a.mover(p.d, 10); a.virar('s'); }
    if (p.pulo) { pulo = 12; sfx('pulo-saliencia'); }
    if (p.nota) { a.emote('nota', 40); bus.emit('grito', { especie: GALO, vol: 0.6 }); }
  });
}
function assustar() {
  if (estadoGalo !== 'dancando' || !galo) return;
  estadoGalo = 'assustado';
  const a = galo;
  a.emote('!', 30);
  sfx('voo');
  cena(async () => {
    await quadros(36, (i) => { a.ey = -i * 3; a.spr.opacidade = Math.max(0, 1 - i / 36); });
    tirarGalo();
    await falar('O Galo-Manaó se assustou com o seu movimento e voou para o alto das árvores!\nSaia da arena e volte devagar. Para ver a dança, é preciso ficar imóvel até o fim.');
  });
}
async function batalhar() {
  await falar('O Galo-Manaó abre a crista em leque, metade escura, metade cor de areia, e encara você.\nA dança terminou: ele aceitou o desafio!');
  await rodarEvento('vis-galo-batalha');
  if (!naZona(ZONA)) return;
  if (!galoDisponivel()) tirarGalo();
  else { tirarGalo(); estadoGalo = 'assustado'; }
}

registrarMecanica(ZONA, {
  entrar() {
    visita++; enf.esquecer(); pintura = null; galo = null; estadoGalo = 'longe';
    remanso = REMANSOS[0];
    pintarAguas();
    if (galoDisponivel()) porGalo();
  },
  sair() { enf.esquecer(); pintura = null; galo = null; estadoGalo = 'longe'; },
  passo(x, y) {
    const modo = jogo.save.jogador.modo, j = M.jog;
    // correnteza: dentro da faixa, só na linha do encontro
    if (modo === 'remo' && naFaixa(y) && ehAgua(x, y) && !naLinha(x, y)) {
      const d = j.dir, e = escura(x, y);
      cena(() => arrastado(e, d));
      return true;
    }
    if (modo === 'remo') {
      const r = REMANSOS.find(([a, b]) => a === x && b === y);
      if (r && r !== remanso) { remanso = r; sfx('ui-ok'); avisar('Remanso: a correnteza volta para cá.'); }
      if (y < FAIXA[0]) remanso = [MARGEM_ESCURA[FAIXA[0] - 1], FAIXA[0] - 1];
    }
    // dança de corte
    if (x === ENTRADA_ARENA[0] && y === ENTRADA_ARENA[1]) {
      if (estadoGalo === 'pousado' && galo) {
        cena(async () => {
          sfx('encontro');
          galo!.emote('!', 40);
          await quadros(40);
          await falar('O Galo-Manaó salta para o meio da arena e arrepia a crista.\nÉ a dança de corte! Fique PARADO e assista: um passo, um giro, e ele vai embora.');
          dancar();
        });
        return true;
      }
      return false;
    }
    if (estadoGalo === 'assustado' && !naArena(x, y) && galoDisponivel()) porGalo();
    return false;
  },
});

/* ------------------------------ os dois frascos ------------------------------ */
const BOLHAS = [
  ['..........', '...ww.....', '..w..w....', '...ww...w.', '.......w.w', '........w.'],
  ['....w.....', '...w.w....', '....w.....', '..........', '.w....ww..', 'w.w..w..w.'],
];
const REDEMOINHO = [
  ['..bbbb..', '.b....b.', 'b..bb..b', 'b.b..b.b', 'b..b...b', '.b....b.'],
  ['.bbbb...', 'b....b..', 'b.bb..b.', 'b.b.b.b.', '.b..b..b', '..bbbb..'],
];
interface Ponto { zona: string; x: number; y: number; flagOk: string; item: string; marca: string[][]; pal: Record<string, string>; /** retângulo [x, y, w, h] de água pintada de barro (depois de `ea-missao`) */ barro?: [number, number, number, number] }
const POCO_BREU: Ponto = { zona: 'A-R6', x: 15, y: 53, flagOk: 'ea-frasco-escuro', item: 'frasco-agua-escura', marca: BOLHAS, pal: { w: '#cfe8ff' } };
const POCO_BARRO: Ponto = { zona: 'B-R2', x: 84, y: 22, flagOk: 'ea-frasco-barrento', item: 'frasco-agua-barrenta', marca: REDEMOINHO, pal: { b: '#e8c07a' }, barro: [83, 20, 5, 3] };
const precisa = (p: Ponto) => !!flag('ea-missao') && !flag(p.flagOk) && qtdItem('frasco-vazio') > 0;

function pontoDeColheita(p: Ponto, colher: () => Promise<void>, aviso: () => string | null) {
  const marca = new Enfeites();
  let avisado = false, v = 0, tinta: HTMLElement | null = null;
  anexar(p.zona, {
    entrar() {
      marca.esquecer(); avisado = false; v++; tinta = null;
      if (p.barro && flag('ea-missao')) {
        estilo();
        const [bx, by, bw, bh] = p.barro, t = document.createElement('div'); t.className = 'xea-agua'; tinta = t;
        for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) if (M.zv.agua(x, y) && M.zv.ch(x, y) !== 'w') ret(t, 'xea-barrenta', x * TILE, y * TILE, TILE, TILE);
        M.cena.baixo.append(t);
      }
      if (!precisa(p)) return;
      const k = marca.pix('m', p.marca, p.pal, p.x, p.y, { dx: 3, dy: 5, z: 3 }), meu = v;
      let q = 0;
      laco(() => naZona(p.zona) && v === meu && precisa(p), () => { if (++q % 20 === 0) k.quadro(q / 20); });
    },
    sair() { marca.esquecer(); tinta = null; },
    passo(x, y) {
      if (x !== p.x || y !== p.y || jogo.save.jogador.modo !== 'remo' || !precisa(p)) return false;
      const a = aviso();
      if (a) { if (!avisado) { avisado = true; cena(() => falar(a)); return true; } return false; }
      cena(async () => { await colher(); if (flag(p.flagOk)) marca.limpar(); });
      return true;
    },
  });
}
pontoDeColheita(POCO_BREU, async () => {
  const c = await pedirAmuleto('mergulho', 'No Poço do Breu a água é preta como café e funda que não se vê o fim.\nMergulhar até o fundo para encher o frasco?');
  if (!c) return;
  avisar('Mergulho!'); sfx('mergulho');
  const j = M.jog;
  await quadros(24, (i) => { j.ey = Math.min(8, i >> 1); j.spr.opacidade = i > 12 ? 0.4 : 1; });
  await quadros(30);
  await quadros(16, (i) => { j.ey = 8 - (i >> 1); j.spr.opacidade = 1; });
  j.ey = 0; j.spr.opacidade = 1;
  await colheu(POCO_BREU, 'Lá no fundo, onde a luz da lua não chega, {JOGADOR} encheu o frasco de água escura, preta como café.\nA rolha de cortiça fecha bem: não vaza uma gota.');
}, () => (periodo() === 'noite' ? null : 'O Poço do Breu. De dia o sol bate no fundo e a água fica só esverdeada.\nO Seu Tarumã disse: a água escura de verdade só aparece à noite.'));
pontoDeColheita(POCO_BARRO, async () => {
  if (!(await simNao('A água deste poço é grossa, cor de barro vermelho, de tanta terra da chapada.\nEncher um frasco aqui?'))) return;
  await colheu(POCO_BARRO, '{JOGADOR} encheu o frasco com a água barrenta, cor de café com leite.\nAté a rolha ficou vermelha de terra.');
}, () => (periodo() === 'noite' ? 'À noite o poço fica escuro e não dá para ver a cor da água.\nMelhor voltar de dia para colher a água barrenta.' : null));

async function colheu(p: Ponto, texto: string) {
  tirarItem('frasco-vazio', 1); darItem(p.item, 1); setFlag(p.flagOk);
  sfx('item-obtido');
  await falar(texto);
}
