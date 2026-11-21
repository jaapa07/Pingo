/**
 * Apoio dos testes da demo e dos pacotes do itch.io (tools/testes/demo/*.mts). Controla o jogo numa página ou num
 * iframe (Playwright `Frame`), por toque (CDP, iPhone emulado) ou teclado.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const req = createRequire(import.meta.url);
/* eslint-disable @typescript-eslint/no-explicit-any */
export let pw: any; try { pw = req('playwright'); } catch { pw = req('/opt/node-tools/node_modules/playwright'); }
export const RAIZ = new URL('../../..', import.meta.url).pathname;
export const FOTOS = (process.env.FOTOS_DEMO ?? '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/demo-fotos') + '/';
mkdirSync(FOTOS, { recursive: true });
export const ARGS_CHROMIUM = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

export type Acao = 'a' | 'b' | 'menu' | 'select' | 'cima' | 'baixo' | 'esq' | 'dir';
const TECLA: Record<Acao, string> = { a: 'KeyZ', b: 'KeyX', menu: 'Escape', select: 'KeyV', cima: 'ArrowUp', baixo: 'ArrowDown', esq: 'ArrowLeft', dir: 'ArrowRight' };
export interface St { telas: string[]; cortina: boolean; pronto: boolean; oc: boolean; zona: string; x: number; y: number; mov: boolean; equipe: string[]; nome: string; ins: number[]; slot: number }
export const topo = (s: St) => s.telas[s.telas.length - 1] ?? '';
export const livre = (s: St) => s.pronto && !s.oc && !s.cortina && s.telas.length === 1 && /mundo/.test(topo(s)) && !s.mov;

/** acelera o relógio do jogo (rAF e setTimeout) para os testes andarem mais rápido */
export const TURBO = (k: number) => {
  const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => cb(t * k));
  const st = window.setTimeout.bind(window); (window as any).setTimeout = (f: TimerHandler, ms?: number, ...a: unknown[]) => st(f, (ms || 0) / k, ...a);
};

export function controle(page: any, alvo: any, modo: 'toque' | 'teclado', cdp?: any) {
  const dormir = (ms: number) => page.waitForTimeout(ms);
  const st = (): Promise<St> => alvo.evaluate(() => {
    const p = (window as any).__pingo, m = p?.mundo, s = p?.jogo?.save;
    return { telas: (p?.telas?.pilha ?? []).map((t: any) => String(t.el.className)), cortina: !!p?.telas?.ocupada,
      pronto: !!m?.pronto, oc: !!m?.ocupado, zona: m?.pronto ? (m.zona?.id as string) : '', x: m?.jogador?.x, y: m?.jogador?.y, mov: !!m?.jogador?.movendo,
      equipe: (s?.equipe ?? []).map((c: any) => `${c.especie}:${c.nivel}`), nome: s?.jogador?.nome, ins: [...(s?.insignias ?? [])], slot: p?.jogo?.slot };
  });
  const ponto = (a: Acao): Promise<[number, number]> => alvo.evaluate((acao: string) => {
    const idx: Record<string, number> = { a: 1, b: 2, menu: 3, select: 4 };
    const q = (document.querySelectorAll('#toque > .tq')[acao in idx ? idx[acao] : 0] as HTMLElement).getBoundingClientRect();
    const d: Record<string, [number, number]> = { cima: [0, -0.32], baixo: [0, 0.32], esq: [-0.32, 0], dir: [0.32, 0] };
    const [dx, dy] = d[acao] ?? [0, 0];
    return [q.left + q.width / 2 + dx * q.width, q.top + q.height / 2 + dy * q.height] as [number, number];
  }, a);
  const baixar = async (a: Acao) => {
    if (modo === 'teclado') { await page.keyboard.down(TECLA[a]); return; }
    const [x, y] = await ponto(a); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  };
  const soltar = async (a: Acao) => { if (modo === 'teclado') await page.keyboard.up(TECLA[a]); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const apertar = async (a: Acao, ms = 50) => { await baixar(a); await dormir(ms); await soltar(a); await dormir(60); };
  const avancar = async (ate: (s: St) => boolean, max = 120000, oque = '') => {
    const t0 = Date.now();
    for (;;) {
      const s = await st(); if (ate(s)) return s;
      if (Date.now() - t0 > max) throw new Error(`tempo esgotado esperando ${oque}: ${JSON.stringify(s)}`);
      if (s.cortina) await dormir(80); else await apertar('a');
      await dormir(90);
    }
  };
  const andar = async (d: Acao): Promise<boolean> => {
    const a = await st(); await baixar(d);
    const t0 = Date.now(); let b = a;
    while (Date.now() - t0 < 900) { b = await st(); if (b.x !== a.x || b.y !== a.y || b.zona !== a.zona || !livre({ ...b, mov: false })) break; await dormir(15); }
    await soltar(d);
    for (let i = 0; i < 40; i++) { b = await st(); if (!b.mov) break; await dormir(20); }
    return b.x !== a.x || b.y !== a.y || b.zona !== a.zona;
  };
  /** da tela de título até o mundo, pelo Jogo `slot` (Continuar) */
  const continuarSlot = async (slot: number) => {
    await avancar((k) => /tela-saves/.test(topo(k)) && !k.cortina, 60000, 'tela de jogos');
    await dormir(300);
    for (let i = 0; i < slot; i++) { await apertar('baixo'); await dormir(200); }
    await apertar('a'); await dormir(500);
    for (let i = 0; i < 8; i++) { const f = await alvo.evaluate(() => [...document.querySelectorAll('.foco')].map((e) => (e.textContent ?? '').trim()).join('|')); if (/Continuar|Retomar/.test(f)) break; await apertar('cima'); await dormir(150); }
    return avancar((k) => livre(k) && k.zona !== '', 90000, 'continuar');
  };
  return { st, apertar, baixar, soltar, avancar, andar, dormir, continuarSlot };
}

/** escreve o save `dados` no Jogo `slot` pela API do jogo (como faria uma partida salva) */
export const gravarNoSlot = (alvo: any, dados: unknown, slot: number) => alvo.evaluate(({ d, i }: { d: any; i: number }) => {
  const p = (window as any).__pingo; const atual = p.jogo.slot; p.jogo.carregar(d); p.jogo.slot = i; p.save.gravarSlot(i); p.jogo.slot = atual;
}, { d: dados, i: slot });

/** registra erros da página e respostas ≥ 400 */
export function vigiar(page: any, falhas: string[], ignorar: RegExp = /$^/) {
  page.on('pageerror', (e: unknown) => falhas.push('erro na página: ' + String(e).slice(0, 300)));
  page.on('console', (m: any) => { if (m.type() === 'error' && !ignorar.test(m.text())) falhas.push('console: ' + m.text().slice(0, 300)); });
  page.on('response', (q: any) => { if (q.status() >= 400 && !ignorar.test(q.url())) falhas.push(`resposta ${q.status()}: ${q.url()}`); });
}
