/**
 * Gravação de trechos de gameplay para divulgação (TikTok, Reels, X). Passo 1 de 2: grava as "tomadas" brutas.
 *
 * Cada tomada abre o build (dist/) num Chromium headless com a tela do jogo em 320×180 nativo (modo desktop: sem
 * controles de toque, sem moldura), dirige o jogo pelo teclado em ritmo humano e grava:
 *   - os quadros reais do compositor (CDP Page.startScreencast, PNG sem perdas) com o horário de cada um;
 *   - o som do jogo (WebAudio → MediaStreamDestination → MediaRecorder, opus);
 *   - marcas de tempo (`marcas.json`) usadas pelo passo 2 para cortar os clipes.
 * O relógio do jogo é fixado de manhã (10h20) para o HUD não mostrar a hora real da gravação.
 *
 * Uso:  npm run build && npx tsx tools/divulgacao/gravar.mts [tomada ...]
 *       (sem argumentos grava todas; tomadas: titulo cidade grama evolucao lab mapa-b diario)
 * Saída: $PINGO_BRUTOS (padrão: <tmp>/pingo-divulgacao/brutos)/<tomada>/
 * Depois: npx tsx tools/divulgacao/montar.mts
 */
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { servir } from '../verify/servidor';

const req = createRequire(import.meta.url);
/* eslint-disable @typescript-eslint/no-explicit-any */
let pw: any; try { pw = req('playwright'); } catch { pw = req('/opt/node-tools/node_modules/playwright'); }
const RAIZ = new URL('../..', import.meta.url).pathname;
export const BRUTOS = process.env.PINGO_BRUTOS ?? join(tmpdir(), 'pingo-divulgacao', 'brutos');
const PORTA = Number(process.env.PINGO_PORTA ?? 5437);
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'];

type Tecla = 'a' | 'b' | 'menu' | 'cima' | 'baixo' | 'esq' | 'dir';
const TECLA: Record<Tecla, string> = { a: 'KeyZ', b: 'KeyX', menu: 'Escape', cima: 'ArrowUp', baixo: 'ArrowDown', esq: 'ArrowLeft', dir: 'ArrowRight' };

/** roda antes do jogo: relógio de manhã e captura do som (todo nó ligado ao destino também vai para o gravador) */
function preparo() {
  const W = window as any;
  // relógio: mesma data, 10h20 + o tempo decorrido (só o horário mostrado no jogo muda)
  const Real = Date; const agora = Real.now(); const alvo = new Real(agora); alvo.setHours(10, 20, 0, 0); const DESVIO = alvo.getTime() - agora;
  class Relogio extends Real {
    constructor(...a: any[]) { if (a.length) super(...(a as [])); else super(Real.now() + DESVIO); }
    static now() { return Real.now() + DESVIO; }
  }
  W.Date = Relogio;
  const ligar = AudioNode.prototype.connect as any;
  W.__som = { destinos: new Map(), pedacos: [] as Blob[], gravador: null, stream: null };
  (AudioNode.prototype as any).connect = function (d: any, ...r: any[]) {
    const res = ligar.call(this, d, ...r);
    if (d instanceof AudioDestinationNode) {
      let m = W.__som.destinos.get(d.context);
      if (!m) { m = (d.context as AudioContext).createMediaStreamDestination(); W.__som.destinos.set(d.context, m); W.__som.stream = m.stream; }
      ligar.call(this, m, ...r);
    }
    return res;
  };
  W.__gravarSom = () => {
    const s = W.__som.stream; if (!s) return 0;
    W.__som.pedacos = [];
    const g = new MediaRecorder(s, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 160000 });
    g.ondataavailable = (e) => W.__som.pedacos.push(e.data); g.start(250); W.__som.gravador = g;
    return performance.timeOrigin + performance.now();
  };
  W.__pararSom = () => new Promise((ok) => {
    const g = W.__som.gravador; if (!g) { ok(''); return; }
    g.onstop = async () => {
      const buf = new Uint8Array(await new Blob(W.__som.pedacos).arrayBuffer()); let s = '';
      for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      ok(btoa(s));
    };
    g.stop();
  });
}

interface Estado { telas: string[]; cortina: boolean; pronto: boolean; oc: boolean; zona: string; x: number; y: number; mov: boolean; equipe: string[] }
const topo = (s: Estado) => s.telas[s.telas.length - 1] ?? '';
const livre = (s: Estado) => s.pronto && !s.oc && !s.cortina && s.telas.length === 1 && !s.mov;

class Tomada {
  page: any; cdp: any; t0 = 0; quadros: { t: number; png: Buffer }[] = []; marcas: Record<string, number> = {}; somT0 = 0; gravando = false;
  constructor(public nome: string, page: any, cdp: any) { this.page = page; this.cdp = cdp; }
  dormir = (ms: number) => this.page.waitForTimeout(ms);
  agora = () => Date.now() / 1000 - this.t0;
  marca(n: string) { this.marcas[n] = this.agora(); console.log(`    · ${n} @ ${this.marcas[n].toFixed(2)} s`); }
  st = (): Promise<Estado> => this.page.evaluate(() => {
    const p = (window as any).__pingo, m = p?.mundo, s = p?.jogo?.save;
    return { telas: (p?.telas?.pilha ?? []).map((t: any) => String(t.el.className)), cortina: !!p?.telas?.ocupada, pronto: !!m?.pronto, oc: !!m?.ocupado,
      zona: m?.pronto ? m.zona?.id : '', x: m?.jogador?.x, y: m?.jogador?.y, mov: !!m?.jogador?.movendo, equipe: (s?.equipe ?? []).map((c: any) => `${c.especie}:${c.nivel}`) };
  });
  async esperar(cond: (s: Estado) => boolean, max = 30000, oque = '') {
    const t = Date.now();
    for (;;) { const s = await this.st(); if (cond(s)) return s; if (Date.now() - t > max) throw new Error(`${this.nome}: tempo esgotado esperando ${oque} ${JSON.stringify(s)}`); await this.dormir(40); }
  }
  async apertar(k: Tecla, depois = 0) { await this.page.keyboard.down(TECLA[k]); await this.dormir(70); await this.page.keyboard.up(TECLA[k]); if (depois) await this.dormir(depois); }
  /** anda `n` casas segurando a direção (como um jogador), e solta no começo do último passo */
  async andar(d: Tecla, n: number) {
    let s = await this.st(); let px = s.x, py = s.y, feitos = 0; const t = Date.now();
    await this.page.keyboard.down(TECLA[d]);
    while (feitos < n && Date.now() - t < n * 900 + 600) {
      await this.dormir(12); s = await this.st();
      if (s.x !== px || s.y !== py) { feitos++; px = s.x; py = s.y; }
      if (!s.pronto || s.oc) break;
    }
    await this.page.keyboard.up(TECLA[d]);
    for (let i = 0; i < 60 && (await this.st()).mov; i++) await this.dormir(15);
    return feitos;
  }
  async iniciar() {
    this.quadros = []; this.marcas = {};
    this.cdp.on('Page.screencastFrame', (f: any) => {
      void this.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => undefined);
      if (this.gravando) this.quadros.push({ t: f.metadata.timestamp - this.t0, png: Buffer.from(f.data, 'base64') });
    });
    this.t0 = Date.now() / 1000; this.gravando = true;
    await this.cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
    const somT0 = await this.page.evaluate(() => (window as any).__gravarSom());
    this.somT0 = somT0 ? somT0 / 1000 - this.t0 : 0;
    // primeiro quadro garantido (o screencast só manda quadro quando a tela muda)
    this.quadros.push({ t: 0, png: await this.page.screenshot({ type: 'png' }) });
  }
  async parar(dir: string) {
    const fim = this.agora();
    await this.cdp.send('Page.stopScreencast'); this.gravando = false;
    const som = await this.page.evaluate(() => (window as any).__pararSom());
    rmSync(dir, { recursive: true, force: true }); mkdirSync(join(dir, 'q'), { recursive: true });
    const qs = this.quadros.filter((q) => q.t >= 0).sort((a, b) => a.t - b.t);
    qs.forEach((q, i) => writeFileSync(join(dir, 'q', `${String(i).padStart(5, '0')}.png`), q.png));
    writeFileSync(join(dir, 'quadros.json'), JSON.stringify({ tempos: qs.map((q) => +q.t.toFixed(4)), fim }));
    writeFileSync(join(dir, 'marcas.json'), JSON.stringify(this.marcas, null, 1));
    if (som) { writeFileSync(join(dir, 'som.webm'), Buffer.from(som, 'base64')); writeFileSync(join(dir, 'som.json'), JSON.stringify({ inicio: this.somT0 })); }
    const fps = qs.length / Math.max(0.01, fim);
    console.log(`    ${qs.length} quadros em ${fim.toFixed(1)} s (${fps.toFixed(0)} q/s), som: ${som ? 'sim' : 'não'}`);
  }
}

const FAIXA = (q: string) => `?periodo=dia&${q}`;
/** abre o jogo numa URL, libera o áudio (como o primeiro toque do jogador) e espera o mundo (ou a tela pedida) */
async function abrir(page: any, url: string, mundo = true) {
  await page.goto(url);
  await page.waitForFunction(() => (window as any).__pingo?.telas?.pilha?.length > 0, null, { timeout: 90000 });
  await page.evaluate(() => { window.dispatchEvent(new Event('pointerdown')); const p = (window as any).__pingo; p.jogo.opcoes.velTexto = 3; });
  if (mundo) await page.waitForFunction(() => { const p = (window as any).__pingo; return p?.mundo?.pronto && !p.telas.ocupada; }, null, { timeout: 90000 });
}
const repelente = (page: any) => page.evaluate(() => { (window as any).__pingo.jogo.save.repelente = 999; });

/** escolhe o golpe `id` no menu de golpes da batalha (grade 2×2 na ordem dos golpes da criatura) */
async function golpe(g: Tomada, id: string) {
  const i = await g.page.evaluate((x: string) => (window as any).__pingo.jogo.save.equipe[0].golpes.findIndex((k: any) => (k.id ?? k) === x), id);
  if (i < 0) throw new Error('golpe ausente: ' + id);
  await g.apertar('a', 450);
  if (i % 2) await g.apertar('dir', 250);
  if (i >= 2) await g.apertar('baixo', 250);
  await g.dormir(250); await g.apertar('a');
}
const naBatalha = (s: Estado) => /batalha/.test(topo(s));

const TOMADAS: Record<string, { url: string; mundo?: boolean; rodar(g: Tomada): Promise<boolean | void> }> = {
  /** tela de abertura → título com a música */
  titulo: {
    url: '', mundo: false,
    async rodar(g) {
      await g.dormir(1500); await g.apertar('a');
      await g.esperar((s) => /titulo/.test(topo(s)) && !s.cortina, 15000, 'título');
      g.marca('titulo');
      await g.dormir(7000);
      await g.apertar('baixo', 700); await g.apertar('cima', 1200);
      g.marca('fim');
    },
  },
  /** passeio por Vila Caiçara (mapa A), com a parceira seguindo */
  cidade: {
    url: FAIXA('zona=A2&x=9&y=15&dir=l&equipe=4:18&parceira=1'),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1800);
      await g.andar('dir', 1); await g.dormir(300);
      g.marca('inicio');
      await g.andar('dir', 12); await g.dormir(200);
      await g.andar('baixo', 8); await g.dormir(250);
      await g.andar('dir', 5);
      g.marca('fim'); await g.dormir(800);
    },
  },
  /** grama alta da Trilha do Ipê → encontro → golpe super eficaz → captura com a Cuia (repete até a captura dar certo) */
  grama: {
    url: FAIXA('zona=A-R1&x=13&y=40&dir=l&equipe=7:11&itens=cuia:10'),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1500);
      g.marca('inicio');
      await g.andar('dir', 6); await g.dormir(150);
      await g.andar('baixo', 2); await g.dormir(120);
      await g.andar('dir', 2);
      g.marca('encontro');
      void g.page.evaluate(() => { void (window as any).__pingo.mundo.batalhaSelvagem(33, 13); });
      await g.esperar(naBatalha, 10000, 'batalha');
      await g.dormir(3300);
      await g.apertar('a', 900);
      g.marca('menu');
      await g.dormir(600);
      await golpe(g, 'esguicho'); g.marca('golpe');
      await g.dormir(2600); g.marca('pos-golpe');
      // passa as mensagens até o menu voltar
      for (let i = 0; i < 6; i++) { await g.dormir(900); await g.apertar('a'); }
      await g.dormir(800);
      g.marca('antes-cuia');
      await g.apertar('dir', 350); await g.apertar('a', 700); await g.apertar('dir', 600); await g.apertar('a', 500);
      g.marca('cuia');
      await g.dormir(9000);
      const s = await g.st();
      g.marca('fim');
      const ok = s.equipe.length > 1 || /Tatuzim/.test(await g.page.evaluate(() => JSON.stringify((window as any).__pingo.jogo.save.viveiro ?? '')));
      const cap = await g.page.evaluate(() => (window as any).__pingo.jogo.save.diario.capturado.includes(33));
      return ok || cap;
    },
  },
  /** vitória → sobe de nível → Botinho evolui para Botorosa */
  evolucao: {
    url: FAIXA('zona=A-R1&x=15&y=40&equipe=7:15'),
    async rodar(g) {
      await repelente(g.page);
      await g.page.evaluate(() => { (window as any).__pingo.jogo.save.equipe[0].exp = 4090; });
      void g.page.evaluate(() => { void (window as any).__pingo.mundo.batalhaSelvagem(41, 5); });
      await g.esperar(naBatalha, 10000, 'batalha'); await g.dormir(2400);
      await g.apertar('a', 900); await golpe(g, 'esguicho');
      g.marca('golpe');
      for (let i = 0; i < 12; i++) { await g.dormir(1100); if (/evolucao/.test(topo(await g.st()))) break; await g.apertar('a'); }
      await g.esperar((s) => /evolucao/.test(topo(s)), 15000, 'evolução');
      g.marca('evolucao');
      await g.dormir(9000);
      await g.apertar('a', 1500);
      g.marca('fim');
    },
  },
  /** laboratório da Profª Ipê: as três cuias na mesa (Tamanduí, Guaraxim, Botinho) */
  lab: {
    url: FAIXA('zona=A1-lab&x=6&y=6&dir=n&flags=prof-conheceu'),
    async rodar(g) {
      await g.dormir(1200);
      for (const [i, n] of [[0, 'mata'], [1, 'brasa'], [2, 'rio']] as const) {
        if (i > 0) { await g.andar('dir', 1); await g.dormir(200); await g.apertar('cima', 300); }
        g.marca('antes-' + n);
        await g.apertar('a');
        await g.page.waitForFunction(() => /dialogo/.test(String((window as any).__pingo.telas.pilha.at(-1)?.el.className)), null, { timeout: 8000 });
        g.marca(n);
        await g.dormir(2600); await g.apertar('a', 1500); await g.apertar('a', 1600);
        // "Você vai escolher…?" → Não
        await g.apertar('baixo', 300); await g.apertar('a', 900);
        g.marca('fim-' + n);
        for (let k = 0; k < 4 && !livre(await g.st()); k++) await g.apertar('a', 700);
        await g.esperar(livre, 8000, 'livre');
      }
    },
  },
  /** mapa B: Pantanal Grande, Vila Cascavel e o Pico Pindorama nevado */
  'mapa-b': {
    url: FAIXA('zona=B2&x=8&y=15&dir=l&equipe=6:50&parceira=1&insignias=16&flags=campeao'),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1500);
      g.marca('pantanal'); await g.andar('dir', 17); g.marca('fim-pantanal');
      await g.page.evaluate(() => (window as any).__pingo.mundo.irPara('B1', 9, 16, 'l', 'nenhuma'));
      await g.esperar(livre, 20000, 'B1'); await repelente(g.page); await g.dormir(900);
      g.marca('cascavel'); await g.andar('dir', 12); await g.andar('cima', 6); g.marca('fim-cascavel');
      await g.page.evaluate(() => (window as any).__pingo.mundo.irPara('PP', 19, 29, 'n', 'nenhuma'));
      await g.esperar(livre, 20000, 'PP'); await repelente(g.page); await g.dormir(900);
      g.marca('pico'); await g.andar('cima', 8); await g.andar('dir', 1); await g.andar('cima', 8); g.marca('fim-pico');
      await g.dormir(500);
    },
  },
  /** Diário de Campo e Equipe num save de fim de jogo */
  diario: {
    url: FAIXA('zona=B2'),
    async rodar(g) {
      const save = JSON.parse(readFileSync(join(RAIZ, 'tools/testes/qa4/saves/campeao-b.json'), 'utf8'));
      // save de fim de jogo do QA: as espécies vistas viram fichas completas (para o Diário mostrar as criaturas)
      save.diario.capturado = [...new Set([...save.diario.capturado, ...save.diario.visto])];
      save.jogador.zona = 'B2'; save.jogador.x = 12; save.jogador.y = 14;
      await g.page.evaluate(async (d: any) => { const p = (window as any).__pingo; p.jogo.carregar(d); p.jogo.opcoes.velTexto = 3; await p.mundo.irPara('B2', 12, 14, 's', 'nenhuma'); }, save);
      await g.esperar(livre, 20000, 'mundo'); await g.dormir(1200);
      g.marca('inicio');
      await g.apertar('menu', 700);
      await g.apertar('a', 1200);
      g.marca('diario');
      for (let i = 0; i < 14; i++) await g.apertar('baixo', 260);
      await g.dormir(500);
      await g.apertar('dir', 700); await g.apertar('dir', 700);
      for (let i = 0; i < 5; i++) await g.apertar('baixo', 300);
      await g.dormir(600);
      g.marca('fim-diario');
      await g.apertar('b', 600);
      g.marca('equipe-ini');
      await g.apertar('baixo', 400); await g.apertar('a', 1200);
      g.marca('equipe');
      for (let i = 0; i < 5; i++) await g.apertar('baixo', 450);
      await g.apertar('a', 900);
      g.marca('ficha');
      await g.dormir(1200);
      await g.apertar('a', 1000);
      for (let i = 0; i < 3; i++) await g.apertar('baixo', 900);
      g.marca('fim');
    },
  },
};

async function main() {
  const pedidas = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TOMADAS);
  const srv = await servir(join(RAIZ, 'dist'), PORTA, '/Pingo/');
  const browser = await pw.chromium.launch({ args: ARGS });
  try {
    for (const nome of pedidas) {
      const def = TOMADAS[nome]; if (!def) throw new Error('tomada desconhecida: ' + nome);
      for (let tentativa = 1; tentativa <= 8; tentativa++) {
        console.log(`== ${nome} (tentativa ${tentativa})`);
        const ctx = await browser.newContext({ viewport: { width: 320, height: 180 }, deviceScaleFactor: 1, serviceWorkers: 'block', timezoneId: 'America/Sao_Paulo', locale: 'pt-BR' });
        await ctx.addInitScript({ content: 'var __name = (f) => f;(' + preparo.toString() + ')();' }); // tsx/esbuild injeta __name nas classes
        const page = await ctx.newPage();
        page.on('pageerror', (e: unknown) => console.log('    erro na página:', String(e).slice(0, 200)));
        const cdp = await ctx.newCDPSession(page);
        await abrir(page, srv.url + def.url, def.mundo !== false);
        const g = new Tomada(nome, page, cdp);
        await g.iniciar();
        let ok: boolean | void = true;
        try { ok = await def.rodar(g); } catch (e) { console.log('    falhou:', String(e).slice(0, 300)); ok = false; }
        await g.parar(join(BRUTOS, nome));
        await ctx.close();
        if (ok !== false) break;
        console.log('    resultado não serviu; gravando de novo');
      }
    }
  } finally { await browser.close(); await srv.fechar(); }
}
await main();
