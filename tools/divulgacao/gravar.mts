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
 *       (sem argumentos grava todas; tomadas: titulo cidade grama evolucao lab mapa-b diario,
 *        lenda-gaviao lenda-boitata lenda-borealce, mundo-bike mundo-lider mundo-pesca mundo-remo mundo-noite mundo-trem,
 *        extra-bike extra-gincana extra-safari extra-ninho extra-quiz extra-rara extra-radio)
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
  // relógio: mesma data, 10h20 (ou `?hora=HH:MM`) + o tempo decorrido (só o horário mostrado no jogo muda);
  // `__hora(h, m)` adianta o relógio no meio da tomada (dia virando noite)
  const Real = Date; let DESVIO = 0;
  W.__hora = (h: number, m: number) => { const agora = Real.now(); const alvo = new Real(agora); alvo.setHours(h, m, 0, 0); DESVIO = alvo.getTime() - agora; };
  const [hh, mm] = (new URLSearchParams(location.search).get('hora') ?? '10:20').split(':').map(Number); W.__hora(hh, mm);
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
  /** segura a direção por `ms` (bicicleta e remo, que andam mais de uma casa por vez) */
  async segurar(d: Tecla, ms: number) { await this.page.keyboard.down(TECLA[d]); await this.dormir(ms); await this.page.keyboard.up(TECLA[d]); for (let i = 0; i < 60 && (await this.st()).mov; i++) await this.dormir(15); }
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
  await page.evaluate('window.__name = (f) => f'); // tsx/esbuild injeta __name nas funções passadas ao navegador
  await page.evaluate(() => { window.dispatchEvent(new Event('pointerdown')); const p = (window as any).__pingo; p.jogo.opcoes.velTexto = 3; });
  if (mundo) await page.waitForFunction(() => { const p = (window as any).__pingo; return p?.mundo?.pronto && !p.telas.ocupada; }, null, { timeout: 90000 });
}
const repelente = (page: any) => page.evaluate(() => { (window as any).__pingo.jogo.save.repelente = 999; });

/** escolhe o golpe `id` no menu de golpes da batalha (grade 2×2 na ordem dos golpes da criatura) */
async function golpe(g: Tomada, id: string) {
  const i = await g.page.evaluate((x: string) => (window as any).__pingo.jogo.save.equipe[0].golpes.findIndex((k: any) => (k.id ?? k) === x), id);
  if (i < 0) throw new Error('golpe ausente: ' + id);
  await menuDeComandos(g);
  await g.apertar('esq', 200); await g.apertar('a', 450);
  if (i % 2) await g.apertar('dir', 250);
  if (i >= 2) await g.apertar('baixo', 250);
  await g.dormir(250); await g.apertar('a');
}
/** avança as mensagens (A) até a batalha voltar ao menu de comandos (Lutar/Mochila/Equipe/Fugir) */
async function menuDeComandos(g: Tomada, max = 20000) {
  const t = Date.now();
  const temMenu = () => g.page.evaluate(() => [...document.querySelectorAll('.bt-botao')].some((e) => (e as HTMLElement).offsetParent !== null && getComputedStyle(e).visibility !== 'hidden'));
  while (Date.now() - t < max) { if (await temMenu()) return; await g.dormir(700); if (await temMenu()) return; await g.apertar('a'); }
  throw new Error('o menu de comandos não voltou');
}
const naBatalha = (s: Estado) => /batalha/.test(topo(s));


/* ------------------------------ apoio das tomadas dos vídeos A (lendários) e B (mais do mundo) ------------------------------ */
const menuVisivel = (g: Tomada) => g.page.evaluate(() => [...document.querySelectorAll('.bt-botao')].some((e) => (e as HTMLElement).offsetParent !== null));
/** o golpe mais forte (da lista de preferência) que a criatura da frente conhece */
const golpeDe = (g: Tomada, pref: string[]) => g.page.evaluate((p: string[]) => {
  const gs: string[] = (window as any).__pingo.jogo.save.equipe[0].golpes.map((k: any) => k.id ?? k);
  return p.find((x) => gs.includes(x)) ?? gs[gs.length - 1];
}, pref);
/** escolhe golpes até a batalha acabar (vitória); devolve o instante de cada golpe */
async function lutarAteVencer(g: Tomada, pref: string[], max = 60000) {
  const t = Date.now();
  while (Date.now() - t < max) {
    const s = await g.st();
    if (!naBatalha(s)) return;
    if (await menuVisivel(g)) { g.marca('golpe-final'); /* fica a marca do último golpe */ await golpe(g, await golpeDe(g, pref)); await g.dormir(1500); continue; }
    await g.dormir(700); if (!(await menuVisivel(g)) && naBatalha(await g.st())) await g.apertar('a');
  }
  throw new Error('a batalha não acabou');
}
/** Mochila → bolso de cuias → a 1ª cuia (o bolso fica lembrado nas vezes seguintes) */
async function jogarCuia(g: Tomada, primeira = true) {
  await menuDeComandos(g);
  await g.apertar('dir', 350); await g.apertar('a', 700);
  if (primeira) await g.apertar('dir', 600);
  await g.apertar('a', 300);
}
/** passa falas (A) até o mundo ficar livre; recusa apelido ("Não") se perguntarem */
async function ateLivre(g: Tomada, max = 30000) {
  const t = Date.now();
  while (Date.now() - t < max) {
    const s = await g.st(); if (livre(s)) return;
    if (/tela-nome/.test(topo(s))) { await g.apertar('b', 400); continue; }
    await g.dormir(600); await g.apertar('a');
  }
}

/**
 * lê o texto da tela do topo (caixa de fala, pergunta) a partir dos glifos da fonte bitmap: cada letra é um <i> com a
 * folha de glifos de fundo, e a posição do fundo diz qual é a letra. Devolve o texto SEM espaços (os espaços não viram <i>).
 */
const KIT = JSON.parse(readFileSync(join(RAIZ, 'src/ui/gerado/kit.json'), 'utf8'));
const lerTela = (g: Tomada): Promise<string> => g.page.evaluate((fontes: Record<string, any>) => {
  const p = (window as any).__pingo; const topo = p.telas.pilha[p.telas.pilha.length - 1]?.el as HTMLElement | undefined;
  if (!topo) return '';
  const inv: Record<string, string[]> = {};
  for (const [t, f] of Object.entries(fontes)) { inv[t] = []; for (const [ch, [i]] of Object.entries(f.glifos as Record<string, number[]>)) inv[t][i] = ch; }
  return [...topo.querySelectorAll('i.g8, i.g12')].map((el) => {
    const t = el.classList.contains('g12') ? '12' : '8', f = fontes[t];
    const [bx, by] = (el as HTMLElement).style.backgroundPosition.split(' ').map((v) => -parseFloat(v));
    const col = Math.round((bx % f.bw) / f.cw), lin = Math.round((by % f.bh) / f.ch);
    return inv[t][lin * f.cols + col] ?? '';
  }).join('');
}, KIT.fontes);
const semEspaco = (t: string) => t.replace(/\s+/g, '');
const EQUIPE_FORTE = 'equipe=3:72,9:76,6:74,12:72,34:71,14:72&insignias=16&amuletos=todos';

const TOMADAS: Record<string, { url: string; mundo?: boolean; semente?: number; /** CSS só da gravação (ex.: esconder a faixa de dica dos controles) */ css?: string; rodar(g: Tomada): Promise<boolean | void> }> = {
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
      void g.page.evaluate(() => { void (window as any).__pingo.mundo.batalhaSelvagem(41, 13); });
      await g.esperar(naBatalha, 10000, 'batalha');
      await g.dormir(3300);
      await menuDeComandos(g);
      g.marca('menu');
      await g.dormir(600);
      await golpe(g, 'esguicho'); g.marca('golpe');
      await g.dormir(4300); g.marca('pos-golpe'); await g.dormir(1500);
      // passa as mensagens até o menu de comandos voltar
      await menuDeComandos(g);
      await g.dormir(800);
      // a cuia: se a criatura escapar, joga outra (a mochila lembra o bolso e o menu lembra a Mochila)
      for (let n = 0; n < 5; n++) {
        g.marca(n ? `antes-cuia-${n}` : 'antes-cuia');
        if (n === 0) { await g.apertar('dir', 350); await g.apertar('a', 700); await g.apertar('dir', 600); await g.apertar('a', 500); }
        else { await g.apertar('a', 700); await g.apertar('a', 500); }
        g.marca('cuia');
        // escapou: o menu de comandos volta; capturou: vêm "Parceria firmada!" e a pergunta do apelido (o menu não volta)
        const t = Date.now(); let voltou = false;
        while (Date.now() - t < 10000 && !voltou) {
          await g.dormir(250);
          voltou = await g.page.evaluate(() => [...document.querySelectorAll('.bt-botao')].some((e) => (e as HTMLElement).offsetParent !== null));
        }
        if (!voltou) { g.marca('fim'); await g.apertar('baixo', 300); await g.apertar('a', 1500); return true; }
        await g.dormir(500);
      }
      g.marca('fim');
      return false;
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
      await golpe(g, 'esguicho');
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
        await g.dormir(2600); await g.apertar('a', 1500); await g.apertar('a', 1500); await g.apertar('a', 1000);
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
    url: FAIXA('zona=B2&x=21&y=15&dir=l&equipe=6:50&parceira=1&insignias=16&flags=campeao'),
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
  /* ============ vídeo A: lendários ============ */
  /** Aldeia Tupã: subida até a Pedra do Trovão → o Gavião-Tupã desce → golpe forte → Cuia Guardiã (nunca falha) */
  'lenda-gaviao': {
    url: FAIXA(`zona=A9&x=20&y=12&dir=n&${EQUIPE_FORTE}&itens=cuia-guardia:1&parceira=1`),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1500);
      g.marca('inicio'); await g.andar('cima', 7); await g.dormir(300);
      await g.apertar('cima', 300);
      g.marca('evento'); await g.apertar('a');
      // falas do evento (trovão, tremor, grito) até a batalha
      for (let i = 0; i < 20 && !naBatalha(await g.st()); i++) { await g.dormir(1300); if (!naBatalha(await g.st())) await g.apertar('a'); }
      await g.esperar(naBatalha, 15000, 'batalha'); g.marca('batalha');
      await menuDeComandos(g); g.marca('menu');
      await golpe(g, await golpeDe(g, ['terremoto', 'pisao-de-anta', 'avalanche', 'terra-viva'])); g.marca('golpe');
      await menuDeComandos(g, 30000); g.marca('antes-cuia');
      await jogarCuia(g); g.marca('cuia');
      await g.dormir(9000); g.marca('fim');
      await ateLivre(g);
    },
  },
  /** Caverna Vulcânica: o Boitatá desperta → vencido sem captura → some para sempre */
  'lenda-boitata': {
    url: FAIXA(`zona=B-CV&x=20&y=12&dir=n&equipe=9:80,3:72&insignias=16&amuletos=todos`),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1500);
      g.marca('inicio'); await g.andar('cima', 7);
      for (let i = 0; i < 20 && !naBatalha(await g.st()); i++) { if (i === 0) g.marca('evento'); await g.dormir(1300); if (!naBatalha(await g.st())) await g.apertar('a'); }
      await g.esperar(naBatalha, 15000, 'batalha'); g.marca('batalha');
      await lutarAteVencer(g, ['pororoca', 'enxurrada', 'chuva-de-verao', 'mergulho-fundo']);
      g.marca('venceu');
      await g.dormir(1200); g.marca('sumiu');
      await ateLivre(g); g.marca('fim'); await g.dormir(600);
    },
  },
  /** Pico Pindorama de noite: quatro Lanternas Boreais, a aurora e o Borealce descendo das nuvens */
  'lenda-borealce': {
    url: FAIXA(`zona=PP&x=9&y=9&dir=n&hora=21:40&periodo=noite&${EQUIPE_FORTE}&flags=boreal-missao,boreal-lanterna-1,boreal-lanterna-2,boreal-lanterna-3,boreal-lanterna-4&itens=lanterna-boreal:4`).replace('periodo=dia&', ''),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1500);
      g.marca('inicio'); await g.andar('cima', 4);
      g.marca('evento');
      for (let i = 0; i < 25 && !naBatalha(await g.st()); i++) { await g.dormir(1500); if (!naBatalha(await g.st())) await g.apertar('a'); }
      await g.esperar(naBatalha, 20000, 'batalha'); g.marca('batalha');
      await menuDeComandos(g); g.marca('menu'); await g.dormir(800); g.marca('fim');
    },
  },

  /* ============ vídeo B: mais do mundo ============ */
  /** de bicicleta pelas ruas de Porto Sereia */
  'mundo-bike': {
    url: FAIXA('zona=A4&x=4&y=20&dir=l&modo=bike&equipe=4:30'),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1500);
      g.marca('inicio'); await g.segurar('dir', 3200); await g.segurar('cima', 700); await g.segurar('dir', 2600); g.marca('fim'); await g.dormir(400);
    },
  },
  /** ginásio de Pantanal Grande: a fala da Boiadeira Zefa e a batalha */
  'mundo-lider': {
    url: FAIXA(`zona=B2-ginasio&x=7&y=2&dir=l&${EQUIPE_FORTE}`),
    async rodar(g) {
      await g.dormir(1200);
      g.marca('inicio'); await g.andar('dir', 2); await g.apertar('cima', 300);
      g.marca('fala'); await g.apertar('a');
      for (let i = 0; i < 20 && !naBatalha(await g.st()); i++) { await g.dormir(1500); if (!naBatalha(await g.st())) await g.apertar('a'); }
      await g.esperar(naBatalha, 15000, 'batalha'); g.marca('batalha');
      await menuDeComandos(g); g.marca('menu');
      await golpe(g, await golpeDe(g, ['terremoto', 'pisao-de-anta'])); g.marca('golpe');
      await g.dormir(6000); g.marca('fim');
    },
  },
  /** pesca no Rio Cachoeira-Véu: espera, fisga no "!" e a batalha começa */
  'mundo-pesca': {
    url: FAIXA('zona=A-R6&x=6&y=13&dir=l&equipe=9:40&itens=vara-boa'),
    async rodar(g) {
      await repelente(g.page);
      await g.page.evaluate(() => { const w = window as any; w.__pingo.bus.on('sfx', (d: any) => { if (d?.id === 'ui-erro') w.__morde = 1; }); });
      await g.dormir(1200);
      g.marca('inicio'); await g.andar('dir', 4); await g.apertar('dir', 300);
      for (let n = 0; n < 6; n++) {
        // como o jogador: A de frente para a água → "Pescar com a Vara Boa?" → Sim
        await g.page.evaluate(() => { (window as any).__morde = 0; });
        g.marca(n ? `isca-${n}` : 'isca');
        await g.apertar('a', 700); await g.apertar('a');
        const t = Date.now(); let mordeu = false;
        while (Date.now() - t < 6000) { await g.dormir(30); if (await g.page.evaluate(() => (window as any).__morde)) { mordeu = true; break; } }
        if (mordeu) { await g.dormir(150); await g.apertar('a'); g.marca('fisgou'); break; }
        await g.dormir(800); await ateLivre(g, 6000); await g.dormir(500);
      }
      for (let i = 0; i < 8 && !naBatalha(await g.st()); i++) { await g.dormir(900); if (!naBatalha(await g.st())) await g.apertar('a'); }
      await g.esperar(naBatalha, 15000, 'batalha'); g.marca('batalha');
      await g.dormir(3500); g.marca('fim');
    },
  },
  /** de remo pela Baía Azul */
  'mundo-remo': {
    url: FAIXA('zona=A-BA&x=3&y=13&dir=l&modo=remo&equipe=9:40'),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1500);
      g.marca('inicio'); await g.segurar('dir', 3500); await g.segurar('baixo', 1000); await g.segurar('dir', 2500); g.marca('fim'); await g.dormir(400);
    },
  },
  /** Cidade Coral: a tarde cai e a noite acende os postes (relógio e período mudando) */
  'mundo-noite': {
    url: FAIXA('zona=A5&x=9&y=17&dir=l&hora=11:05&equipe=4:30&parceira=1'),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1500);
      g.marca('dia'); await g.andar('dir', 6); await g.dormir(300);
      await g.page.evaluate(() => { const w = window as any; w.__hora(17, 40); w.__pingo.mundo.relogio.forcarPeriodo('tarde'); });
      g.marca('tarde'); await g.andar('dir', 6); await g.dormir(300);
      await g.page.evaluate(() => { const w = window as any; w.__hora(21, 15); w.__pingo.mundo.relogio.forcarPeriodo('noite'); });
      g.marca('noite'); await g.andar('dir', 7); g.marca('fim'); await g.dormir(400);
    },
  },
  /** a viagem de trem da Estação de Porto Sereia */
  'mundo-trem': {
    url: FAIXA('zona=A4-estacao&equipe=4:30&flags=campeao&insignias=16'),
    async rodar(g) {
      await g.dormir(1200);
      g.marca('inicio');
      void g.page.evaluate(() => (window as any).__pingo.mundo.rodarPassos([['cinematica', 'trem']]));
      await g.dormir(9000); g.marca('fim');
    },
  },

  /* ============ vídeo C: atividades extras ============ */
  /** de bicicleta (Bicicleta de Bambu) pelas ruas de Porto Sereia */
  'extra-bike': {
    url: FAIXA('zona=A4&x=4&y=20&dir=l&itens=bike-bambu&equipe=4:30'),
    async rodar(g) {
      await repelente(g.page); await g.dormir(900);
      await g.page.evaluate(() => (window as any).__pingo.mundo.usarItem('bike-bambu')); await g.dormir(700);
      g.marca('inicio'); await g.segurar('dir', 2600); await g.segurar('cima', 600); await g.segurar('dir', 2200); g.marca('fim'); await g.dormir(400);
    },
  },
  /** Gincana do Vale do Buriti-Alto: prova de Agilidade (Corrida da Vereda) com a Emaçu, até o placar e o recorde */
  'extra-gincana': {
    css: '.faixa-dica, .gn-res > :last-child { visibility: hidden !important; }',
    url: FAIXA('zona=A-GN&x=16&y=11&dir=n&flags=liga-vencida,gincana-visitou&equipe=23:45,102:45,98:45'),
    async rodar(g) {
      await g.dormir(1000);
      g.marca('inicio'); await g.andar('cima', 2); await g.apertar('cima', 300);
      g.marca('fala'); await g.apertar('a', 1300);
      // "Qual prova vai ser?" → Agilidade; as regras; a escolha da criatura (Emaçu, a 2ª)
      for (let i = 0; i < 12 && !/tela-equipe/.test(topo(await g.st())); i++) await g.apertar('a', 1100);
      await g.dormir(600); await g.apertar('dir', 500); await g.apertar('a', 600);
      await g.esperar((s) => /tela-gincana/.test(topo(s)), 10000, 'gincana');
      g.marca('corrida');
      // troca de raia como um jogador: desvia de vez em quando
      // piloto da corrida (como um jogador atento): desvia das pedras e cupinzeiros e busca as estrelas da raia vizinha
      await g.page.evaluate(() => {
        const W = window as any; W.__raia = 1; let espera = 0;
        const tecla = (code: string) => { window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code })); setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code })), 60); };
        W.__piloto = setInterval(() => {
          const pista = document.querySelector('.tela-gincana .gn-pista'); if (!pista || Date.now() < espera) return;
          const obs = [...pista.querySelectorAll('.gn-ob')].map((el) => {
            const e = el as HTMLElement, m = /translate\((-?\d+)px, (-?\d+)px\)/.exec(e.style.transform), w = parseInt(e.style.width);
            return { estrela: !w, x: m ? Number(m[1]) + (w ? w / 2 : 0) : 999, r: [112, 132, 152].indexOf(Number(e.style.zIndex)) };
          });
          const CX = 64, perigo = (l: number) => obs.some((o) => !o.estrela && o.r === l && o.x > CX - 16 && o.x < CX + 72);
          const estrela = (l: number) => obs.some((o) => o.estrela && o.r === l && o.x > CX + 8 && o.x < CX + 90);
          const r = W.__raia, viz = [r - 1, r + 1].filter((l) => l >= 0 && l <= 2);
          let alvo = r;
          if (perigo(r)) alvo = viz.filter((l) => !perigo(l)).sort((a, b) => Number(estrela(b)) - Number(estrela(a)))[0] ?? r;
          else if (!estrela(r)) alvo = viz.find((l) => estrela(l) && !perigo(l)) ?? r;
          if (alvo !== r) { tecla(alvo < r ? 'ArrowUp' : 'ArrowDown'); W.__raia = alvo; espera = Date.now() + 260; }
        }, 30);
      });
      await g.page.waitForFunction(() => !!document.querySelector('.tela-gincana .gn-res'), null, { timeout: 70000 });
      await g.page.evaluate(() => clearInterval((window as any).__piloto));
      g.marca('resultado'); await g.dormir(4000);
      await ateLivre(g, 20000); g.marca('fim');
    },
  },
  /** Parque Safári: capim do parque → encontro → isca → Cuia-Safári até pegar (refaz a tomada se a criatura fugir) */
  'extra-safari': {
    url: FAIXA('zona=A-SF-parque&x=10&y=26&dir=n&flags=liga-vencida,safari-ativo,safari-setor-2&itens=cuia-safari:30&equipe=23:45,102:45'),
    async rodar(g) {
      await g.page.evaluate(() => { (window as any).__pingo.jogo.save.flags['safari-passos'] = 300; });
      await g.dormir(1200);
      g.marca('inicio'); await g.andar('cima', 3);
      void g.page.evaluate(() => (window as any).__pingo.mundo.rodarPassos([['tela', 'safari-encontro', { especie: 108, nivel: 42, arena: 'pantanal', setor: 2 }]]));
      await g.esperar((s) => /tela-safari/.test(topo(s)), 10000, 'safári'); g.marca('encontro');
      await g.dormir(2600); await g.apertar('a', 900);
      g.marca('isca'); await g.apertar('baixo', 400); await g.apertar('a', 2600); await g.apertar('a', 1000);
      for (let n = 0; n < 8; n++) {
        if (!/tela-safari/.test(topo(await g.st()))) break;
        await g.apertar('cima', 300); g.marca('cuia'); await g.apertar('a', 1500);
        // espera o desfecho do arremesso: escapou, fugiu ou "Parceria firmada!"
        let txt = '';
        for (let i = 0; i < 40; i++) { txt = await lerTela(g); if (/Escapou|fugiu|foiembora|Parceria/i.test(txt) || !/tela-safari/.test(topo(await g.st()))) break; await g.dormir(150); }
        if (/Parceria/.test(txt)) { g.marca('capturou'); await g.dormir(2500); break; }
        if (/fugiu|foiembora/i.test(txt) || !/tela-safari/.test(topo(await g.st()))) { g.marca('fim'); return false; }
        await g.dormir(1200); await g.apertar('a', 1200);
      }
      g.marca('fim'); await ateLivre(g, 15000);
      return g.page.evaluate(() => (window as any).__pingo.jogo.save.diario.capturado.includes(108));
    },
  },
  /** Floresta Ancestral de manhãzinha: o Ninho Raro da Brasa e o Lobo-Fornalha que o protege */
  'extra-ninho': {
    url: FAIXA('zona=B-FA&x=53&y=12&dir=n&hora=06:40&equipe=3:72&insignias=16').replace('periodo=dia', 'periodo=manha'),
    async rodar(g) {
      await repelente(g.page); await g.dormir(1200);
      g.marca('inicio'); await g.andar('cima', 4); await g.apertar('cima', 300);
      g.marca('ninho'); await g.apertar('a');
      for (let i = 0; i < 10 && !naBatalha(await g.st()); i++) { await g.dormir(1300); if (!naBatalha(await g.st())) await g.apertar('a'); }
      await g.esperar(naBatalha, 10000, 'batalha'); g.marca('batalha'); await g.dormir(4000); g.marca('fim');
    },
  },
  /** Ilha do Farol: Quiz da Fauna da Rádio Farol (responde certo lendo a pergunta na tela) */
  'extra-quiz': {
    url: FAIXA('zona=A6&x=28&y=26&dir=l&equipe=3:72&insignias=16&flags=liga-vencida'),
    async rodar(g) {
      const { QUIZ_FAUNA } = await import('../../src/data/quiz');
      await g.dormir(1200); await g.apertar('dir', 300);
      g.marca('inicio'); await g.apertar('a', 1500);
      for (let i = 0; i < 6; i++) { if (/Topaentrar/.test(await lerTela(g))) break; await g.apertar('a', 1300); }
      await g.dormir(500); await g.apertar('a', 1200); // Sim
      for (let k = 0; k < 2; k++) {
        let q: (typeof QUIZ_FAUNA)[number] | undefined;
        for (let i = 0; i < 20 && !q; i++) { const t = semEspaco(await lerTela(g)); q = QUIZ_FAUNA.find((x) => t.includes(semEspaco(x.p).slice(0, 25))); if (!q) await g.dormir(250); }
        if (!q) throw new Error('pergunta não lida');
        g.marca(`pergunta-${k}`); await g.dormir(2400);
        if (!q.r) await g.apertar('baixo', 500);
        await g.apertar('a', 300); g.marca(`resposta-${k}`);
        await g.dormir(3200); await g.apertar('a', 2600); await g.apertar('a', 600);
      }
      g.marca('fim');
    },
  },
  /** Gruta Breu, Lago do Fundo: o Mandizinho de Pelagem Rara (escamas furta-cor) salta do lago */
  'extra-rara': {
    url: FAIXA('zona=A-GB-2&equipe=3:72&insignias=16'),
    async rodar(g) {
      await g.dormir(1200);
      g.marca('inicio'); void g.page.evaluate(() => (window as any).__pingo.mundo.rodarPassos([['lagoRaro']]));
      await g.dormir(1800); await g.apertar('a');
      await g.esperar(naBatalha, 10000, 'batalha'); g.marca('batalha'); await g.dormir(4500); g.marca('fim');
    },
  },
  /** Rádio Cipó: a agenda do dia (enxame, revanches, torre, quiz) */
  'extra-radio': {
    url: FAIXA('zona=A2&x=15&y=15&equipe=3:72&insignias=16&flags=liga-vencida,intro-ok&itens=radio-cipo'),
    async rodar(g) {
      await g.dormir(1200);
      g.marca('inicio'); void g.page.evaluate(() => (window as any).__pingo.mundo.rodarPassos([['tela', 'radio']]));
      await g.esperar((s) => /tela-radio/.test(topo(s)), 8000, 'rádio'); await g.dormir(1500);
      await g.apertar('a', 1600); g.marca('radio');
      await g.apertar('a', 3200); await g.apertar('a', 3000); await g.apertar('a', 3000);
      g.marca('fim'); await g.apertar('a', 600);
    },
  },

};

async function main() {
  // promessas soltas (void page.evaluate) podem falhar quando a tomada fecha a página: não derrubam a gravação
  process.on('unhandledRejection', (e) => { if (!/closed/.test(String(e))) console.log('    aviso:', String(e).slice(0, 200)); });
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
        // a semente do RNG muda a cada tentativa (o resultado de uma tomada com a mesma semente tende a se repetir)
        const semente = (def.semente ?? 1) + (tentativa - 1) * 7919;
        await abrir(page, srv.url + def.url + (def.url.includes('zona=') ? `&semente=${semente}` : ''), def.mundo !== false);
        if (tentativa > 1 || def.semente) console.log(`    semente ${semente}`);
        if (def.css) await page.addStyleTag({ content: def.css });
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
