/**
 * Gravação de trechos de gameplay para divulgação. Passo 2 de 2: corta e monta os vídeos com o ffmpeg.
 *
 *  - cada tomada bruta (tools/divulgacao/gravar.mts) vira um vídeo-base 320×180 a 30 q/s, sem perdas, com o som alinhado;
 *  - cada clipe sai em dois formatos, H.264 yuv420p 30 q/s, pixel art ampliada por vizinho mais próximo (sem borrar):
 *      <clipe>-horizontal.mp4  1920×1080 (×6)
 *      <clipe>-vertical.mp4    1080×1920 (jogo ×3 no centro, fundo = a própria imagem desfocada e escurecida,
 *                              com espaço livre em cima e embaixo para os textos da rede social)
 *  - montagem vertical de ~28 s seguindo o roteiro de docs/DIVULGACAO.md §5, com os textos na fonte bitmap do jogo
 *    (desenhada a partir de dist/assets/ui/fonte12.png + src/ui/gerado/kit.json, ampliada por vizinho mais próximo);
 *  - GIFs curtos de 640 px de largura (≤ 8 MB) para X e Reddit.
 *
 * Uso: npx tsx tools/divulgacao/montar.mts [base|clipes|montagem|gifs|lendarios|mundo|extras ...]
 *   (lendarios / mundo / extras: vídeos A, B e C de 45–55 s, vertical e horizontal, com legendas)   (sem argumentos: tudo)
 * Entrada: $PINGO_BRUTOS (o mesmo do gravar.mts). Saída: docs/divulgacao/clipes/ (fora do git: ver .gitignore).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const RAIZ = new URL('../..', import.meta.url).pathname;
const BRUTOS = process.env.PINGO_BRUTOS ?? join(tmpdir(), 'pingo-divulgacao', 'brutos');
const TMP = join(BRUTOS, '..', 'montagem'); mkdirSync(TMP, { recursive: true });
const SAIDA = join(RAIZ, 'docs/divulgacao/clipes'); mkdirSync(SAIDA, { recursive: true });
const FPS = 30;

function ff(args: string[]) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status !== 0) throw new Error('ffmpeg falhou: ' + args.join(' ').slice(0, 400));
}
const duracao = (arq: string) => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq]).stdout.toString().trim());
const mb = (arq: string) => (statSync(arq).size / 1048576).toFixed(1) + ' MB';

/* ------------------------------ 1. vídeo-base de cada tomada ------------------------------ */
/** quadros com horário → vídeo 30 q/s de taxa constante (cada quadro fica na tela até o próximo), som alinhado */
function base(tomada: string) {
  const dir = join(BRUTOS, tomada);
  const { tempos, fim } = JSON.parse(readFileSync(join(dir, 'quadros.json'), 'utf8')) as { tempos: number[]; fim: number };
  const linhas: string[] = [];
  tempos.forEach((t, i) => { linhas.push(`file 'q/${String(i).padStart(5, '0')}.png'`, `duration ${Math.max(0.001, (i + 1 < tempos.length ? tempos[i + 1] : fim) - t).toFixed(4)}`); });
  linhas.push(`file 'q/${String(tempos.length - 1).padStart(5, '0')}.png'`);
  writeFileSync(join(dir, 'lista.txt'), linhas.join('\n'));
  const saida = join(TMP, `${tomada}.mkv`);
  const som = existsSync(join(dir, 'som.webm'));
  const atraso = som ? Math.max(0, Math.round(JSON.parse(readFileSync(join(dir, 'som.json'), 'utf8')).inicio * 1000)) : 0;
  ff([
    '-f', 'concat', '-safe', '0', '-i', join(dir, 'lista.txt'),
    ...(som ? ['-i', join(dir, 'som.webm')] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']),
    '-filter_complex', `[0:v]fps=${FPS},format=rgb24[v];[1:a]aresample=48000,adelay=${atraso}|${atraso},apad,atrim=0:${fim.toFixed(3)}[a]`,
    '-map', '[v]', '-map', '[a]', '-t', fim.toFixed(3), '-c:v', 'ffv1', '-c:a', 'flac', saida,
  ]);
  console.log(`base ${tomada}: ${duracao(saida).toFixed(1)} s`);
}

/* ------------------------------ 2. clipes ------------------------------ */
type Ponto = [marca: string, desvio: number];
interface Trecho { tomada: string; de: Ponto; ate: Ponto }
/** os clipes pedidos (marcas gravadas em marcas.json de cada tomada; desvios em segundos) */
const CLIPES: Record<string, Trecho[]> = {
  '1-titulo': [{ tomada: 'titulo', de: ['titulo', -0.3], ate: ['titulo', 5.7] }],
  '2-cidade-vila-caicara': [{ tomada: 'cidade', de: ['inicio', 0], ate: ['fim', 0.3] }],
  '3-grama-encontro': [{ tomada: 'grama', de: ['encontro', -3.0], ate: ['menu', -0.2] }],
  '4-batalha-super-eficaz': [{ tomada: 'grama', de: ['menu', 0.2], ate: ['pos-golpe', 1.3] }],
  '5-captura-cuia': [{ tomada: 'grama', de: ['cuia', -1.6], ate: ['cuia', 6.4] }],
  '6-iniciais-lab': [
    { tomada: 'lab', de: ['antes-mata', -0.5], ate: ['mata', 2.2] },
    { tomada: 'lab', de: ['antes-brasa', -0.5], ate: ['brasa', 2.2] },
    { tomada: 'lab', de: ['antes-rio', -0.5], ate: ['rio', 2.3] },
  ],
  '7-mapa-b': [
    { tomada: 'mapa-b', de: ['pantanal', 0], ate: ['pantanal', 2.8] },
    { tomada: 'mapa-b', de: ['cascavel', 0], ate: ['cascavel', 2.8] },
    { tomada: 'mapa-b', de: ['pico', 0], ate: ['pico', 2.9] },
  ],
  '7a-pantanal-grande': [{ tomada: 'mapa-b', de: ['pantanal', 0], ate: ['fim-pantanal', 0.2] }],
  '7b-vila-cascavel': [{ tomada: 'mapa-b', de: ['cascavel', 0], ate: ['fim-cascavel', 0.2] }],
  '7c-pico-pindorama': [{ tomada: 'mapa-b', de: ['pico', 0], ate: ['fim-pico', 0.2] }],
  '8-diario-equipe': [
    { tomada: 'diario', de: ['diario', -0.3], ate: ['diario', 3.2] },
    { tomada: 'diario', de: ['equipe', -0.5], ate: ['equipe', 1.2] },
    { tomada: 'diario', de: ['ficha', 0.1], ate: ['ficha', 3.1] },
  ],
  '9-evolucao': [{ tomada: 'evolucao', de: ['evolucao', 1.4], ate: ['evolucao', 9.4] }],
};
const marcas = (t: string): Record<string, number> => JSON.parse(readFileSync(join(BRUTOS, t, 'marcas.json'), 'utf8'));
const instante = (t: string, [m, d]: Ponto) => { const v = marcas(t)[m]; if (v === undefined) throw new Error(`marca ${m} ausente em ${t}`); return Math.max(0, v + d); };

/** corta e junta os trechos num vídeo 320×180 sem perdas (com um respiro de som nas emendas) */
function nativo(nome: string, trechos: Trecho[]) {
  const partes: string[] = [];
  trechos.forEach((tr, i) => {
    const a = instante(tr.tomada, tr.de), b = instante(tr.tomada, tr.ate), d = b - a;
    const p = join(TMP, `${nome}-${i}.mkv`);
    const fade = trechos.length > 1 ? `afade=t=in:d=0.06,afade=t=out:st=${(d - 0.1).toFixed(3)}:d=0.1` : 'anull';
    ff(['-ss', a.toFixed(3), '-t', d.toFixed(3), '-i', join(TMP, `${tr.tomada}.mkv`), '-af', fade, '-c:v', 'ffv1', '-c:a', 'flac', p]);
    partes.push(p);
  });
  const saida = join(TMP, `${nome}.mkv`);
  const n = partes.length;
  ff([...partes.flatMap((p) => ['-i', p]), '-filter_complex', partes.map((_, i) => `[${i}:v][${i}:a]`).join('') + `concat=n=${n}:v=1:a=1[v][a]`, '-map', '[v]', '-map', '[a]', '-c:v', 'ffv1', '-c:a', 'flac', saida]);
  return saida;
}

const X264 = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart'];
/** conversão RGB → YUV 4:2:0 BT.709 depois da ampliação */
const YUV = 'scale=out_color_matrix=bt709:out_range=tv:flags=neighbor,format=yuv420p';
/** filtro vertical 1080×1920: fundo = a imagem reduzida a 18×32, desfocada e escurecida (só manchas de cor) + jogo ×3 (960×540) no centro */
const VERTICAL = `split[f][j];[f]scale=-2:32:flags=area,crop=18:32,scale=1080:1920:flags=bicubic,gblur=sigma=36,eq=brightness=-0.28:saturation=0.8[fd];` +
  `[j]scale=960:540:flags=neighbor[jg];[fd][jg]overlay=60:690`;

function exportar(nome: string, origem: string) {
  const h = join(SAIDA, `${nome}-horizontal.mp4`), v = join(SAIDA, `${nome}-vertical.mp4`);
  ff(['-i', origem, '-vf', `scale=1920:1080:flags=neighbor,${YUV}`, ...X264, h]);
  ff(['-i', origem, '-filter_complex', `[0:v]${VERTICAL},${YUV}[v]`, '-map', '[v]', '-map', '0:a', ...X264, v]);
  console.log(`${nome}: ${duracao(h).toFixed(1)} s · horizontal ${mb(h)} · vertical ${mb(v)}`);
}

/* ------------------------------ 3. textos na fonte do jogo ------------------------------ */
interface Fonte { cw: number; ch: number; cols: number; topo: number; altura: number; espaco: number; bw: number; bh: number; vcols: number; cores: string[]; glifos: Record<string, number[]> }
/** desenha `linhas` (marcação {c:cor}…{/c}) com a fonte 12 do jogo num PNG nativo, com contorno escuro de 1 px */
async function legenda(linhas: string[], arq: string) {
  const req = createRequire(import.meta.url);
  let pw: any; try { pw = req('playwright'); } catch { pw = req('/opt/node-tools/node_modules/playwright'); }
  const kit = JSON.parse(readFileSync(join(RAIZ, 'src/ui/gerado/kit.json'), 'utf8'));
  const f = kit.fontes['12'] as Fonte;
  const folha = 'data:image/png;base64,' + readFileSync(join(RAIZ, 'dist/assets/ui/fonte12.png')).toString('base64');
  const browser = await pw.chromium.launch();
  try {
    const page = await browser.newPage();
    await page.evaluate('window.__name = (f) => f'); // tsx/esbuild injeta __name nas funções
    const b64: string = await page.evaluate(async ({ f, folha, linhas }: { f: Fonte; folha: string; linhas: string[] }) => {
      const img = new Image(); img.src = folha; await img.decode();
      type L = { ch: string; cor: number };
      const parse = (s: string) => { const r: L[] = []; let cor = -1; const re = /\{c:([a-z]+)\}|\{\/c\}/g; let u = 0, m: RegExpExecArray | null; const por = (x: string) => { for (const ch of x) r.push({ ch, cor }); }; while ((m = re.exec(s))) { por(s.slice(u, m.index)); cor = m[1] ? f.cores.indexOf(m[1]) : -1; u = re.lastIndex; } por(s.slice(u)); return r; };
      const larg = (l: L[]) => l.reduce((w, g) => w + (g.ch === ' ' ? f.espaco : (f.glifos[g.ch] ?? f.glifos['?'])[1]) + 1, 0) - 1;
      const ls = linhas.map(parse); const entre = 15, pad = 2;
      const W = Math.max(...ls.map(larg)) + pad * 2, H = (ls.length - 1) * entre + f.altura + pad * 2 + 1;
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x2 = c.getContext('2d')!; x2.imageSmoothingEnabled = false;
      const desenhar = (corFixa: number | null, dx: number, dy: number) => ls.forEach((l, j) => {
        let x = pad + Math.floor((W - pad * 2 - larg(l)) / 2); const y = pad + j * entre - f.topo;
        for (const g of l) {
          if (g.ch === ' ') { x += f.espaco + 1; continue; }
          const [i, w] = f.glifos[g.ch] ?? f.glifos['?'];
          const v = (corFixa ?? (g.cor >= 0 ? g.cor : f.cores.indexOf('branco'))) * 2;
          const bx = (v % f.vcols) * f.bw + (i % f.cols) * f.cw, by = Math.floor(v / f.vcols) * f.bh + Math.floor(i / f.cols) * f.ch;
          x2.drawImage(img, bx, by, w, f.ch, x + dx, y + dy, w, f.ch); x += w + 1;
        }
      });
      const tinta = f.cores.indexOf('tinta');
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1], [1, 2], [0, 2], [-1, 2]]) desenhar(tinta, dx, dy);
      desenhar(null, 0, 0);
      return c.toDataURL('image/png').split(',')[1];
    }, { f, folha, linhas });
    writeFileSync(arq, Buffer.from(b64, 'base64'));
  } finally { await browser.close(); }
}

/* ------------------------------ 4. montagem vertical (roteiro §5) ------------------------------ */
const ROTEIRO: { trechos: Trecho[]; texto: string[] }[] = [
  { trechos: [{ tomada: 'titulo', de: ['titulo', 0.2], ate: ['titulo', 3.0] }], texto: ['Fiz um Pokémon Gold…', 'só que {c:amarelo}brasileiro{/c}'] },
  { trechos: [{ tomada: 'grama', de: ['encontro', -1.9], ate: ['encontro', 2.6] }], texto: ['Com {c:amarelo}182 criaturas{/c}', 'da nossa fauna'] },
  { trechos: [{ tomada: 'grama', de: ['golpe', -1.0], ate: ['pos-golpe', 0.9] }], texto: ['Batalha por turnos,', 'tipos, clima…'] },
  { trechos: [{ tomada: 'grama', de: ['cuia', 1.0], ate: ['cuia', 6.3] }], texto: ['Você captura', 'com uma {c:amarelo}CUIA{/c}'] },
  { trechos: [
    { tomada: 'mapa-b', de: ['pantanal', 1.6], ate: ['pantanal', 3.5] },
    { tomada: 'mapa-b', de: ['pico', 0.1], ate: ['pico', 2.0] },
    { tomada: 'mapa-b', de: ['cascavel', 0.1], ate: ['cascavel', 2.0] },
  ], texto: ['Dois mapas inteiros', 'pra explorar'] },
  { trechos: [
    { tomada: 'lab', de: ['mata', 0.0], ate: ['mata', 1.0] },
    { tomada: 'lab', de: ['brasa', 0.0], ate: ['brasa', 1.0] },
    { tomada: 'lab', de: ['rio', 0.0], ate: ['rio', 1.0] },
  ], texto: ['Qual seria', 'o seu {c:amarelo}inicial{/c}?'] },
  { trechos: [{ tomada: 'titulo', de: ['titulo', 3.2], ate: ['titulo', 6.2] }], texto: ['{c:amarelo}Demo grátis{/c}', 'Link na bio'] },
];

type Secao = { trechos: Trecho[]; texto: string[] };
/**
 * Junta as seções de um roteiro com a legenda de cada uma (fonte do jogo). Sai em vertical (legenda ×5 na faixa de cima,
 * fora da imagem do jogo) e, se pedido, em horizontal (legenda ×4 por cima do jogo, no alto e centrada).
 */
async function montarRoteiro(nome: string, secoes: Secao[], horizontal: boolean) {
  const formatos: [string, string][] = [['vertical', `[0:v]${VERTICAL}[base];[1:v]scale=iw*5:ih*5:flags=neighbor[t];[base][t]overlay=(W-w)/2:430-h/2,format=rgb24[v]`]];
  if (horizontal) formatos.push(['horizontal', `[0:v]scale=1920:1080:flags=neighbor[base];[1:v]scale=iw*4:ih*4:flags=neighbor[t];[base][t]overlay=(W-w)/2:56,format=rgb24[v]`]);
  for (const [fmt, filtro] of formatos) {
    const partes: string[] = [];
    for (const [i, sec] of secoes.entries()) {
      const nat = nativo(`${nome}-${i}`, sec.trechos);
      const png = join(TMP, `${nome}-legenda-${i}.png`); await legenda(sec.texto, png);
      const d = duracao(nat);
      const p = join(TMP, `${nome}-${i}-${fmt}.mkv`);
      ff(['-i', nat, '-i', png, '-filter_complex', filtro,
        '-map', '[v]', '-map', '0:a', '-af', `afade=t=in:d=0.05,afade=t=out:st=${(d - 0.12).toFixed(3)}:d=0.12`, '-c:v', 'ffv1', '-c:a', 'flac', p]);
      partes.push(p);
    }
    const saida = join(SAIDA, `${nome}-${fmt}.mp4`);
    ff([...partes.flatMap((p) => ['-i', p]), '-filter_complex', partes.map((_, i) => `[${i}:v][${i}:a]`).join('') + `concat=n=${partes.length}:v=1:a=1[v0][a];[v0]${YUV}[v]`,
      '-map', '[v]', '-map', '[a]', ...X264, saida]);
    console.log(`${nome}-${fmt}: ${duracao(saida).toFixed(1)} s · ${mb(saida)}`);
  }
}
async function montagem() {
  for (const f of readdirSync(TMP)) if (/legenda/.test(f)) rmSync(join(TMP, f));
  await montarRoteiro('montagem-roteiro', ROTEIRO, false);
}

const FIM: Secao = { trechos: [{ tomada: 'titulo', de: ['titulo', 3.2], ate: ['titulo', 6.6] }], texto: ['{c:amarelo}Demo grátis{/c}', 'Link na bio'] };
/** vídeo A: lendários (tomadas lenda-*) */
const LENDARIOS: Secao[] = [
  { trechos: [{ tomada: 'lenda-gaviao', de: ['inicio', 0.2], ate: ['batalha', 1.2] }], texto: ['{c:amarelo}Lendários{/c} do', 'folclore brasileiro'] },
  { trechos: [{ tomada: 'lenda-gaviao', de: ['golpe', -0.8], ate: ['antes-cuia', -0.2] }], texto: ['Lendários aparecem', '{c:amarelo}UMA vez só{/c}'] },
  { trechos: [{ tomada: 'lenda-gaviao', de: ['cuia', -0.3], ate: ['cuia', 6.0] }], texto: ['Cuia Guardiã:', '{c:amarelo}nunca falha{/c}'] },
  { trechos: [{ tomada: 'lenda-boitata', de: ['evento', -0.6], ate: ['batalha', 1.6] }], texto: ['O {c:laranja}Boitatá{/c} dorme', 'na Caverna Vulcânica'] },
  { trechos: [
    { tomada: 'lenda-boitata', de: ['golpe-final', 0.9], ate: ['venceu', -0.8] },
    { tomada: 'lenda-boitata', de: ['venceu', 0.9], ate: ['fim', 0.5] },
  ], texto: ['Derrotou sem capturar?', '{c:amarelo}Sumiu pra sempre{/c}'] },
  { trechos: [
    { tomada: 'lenda-borealce', de: ['evento', 6.3], ate: ['evento', 13.8] },
    { tomada: 'lenda-borealce', de: ['batalha', -0.2], ate: ['batalha', 2.8] },
  ], texto: ['Alguns só aparecem', '{c:agua}sob a aurora{/c}'] },
  FIM,
];
/** vídeo C: atividades extras (tomadas extra-*) */
const EXTRAS: Secao[] = [
  { trechos: [{ tomada: 'extra-bike', de: ['inicio', 0], ate: ['fim', 0] }], texto: ['Pedale pela cidade'] },
  { trechos: [
    { tomada: 'extra-gincana', de: ['fala', -0.2], ate: ['fala', 2.4] },
    { tomada: 'extra-gincana', de: ['corrida', 3.6], ate: ['corrida', 9.6] },
  ], texto: ['Corra na {c:amarelo}Gincana{/c}'] },
  { trechos: [{ tomada: 'extra-gincana', de: ['resultado', -0.2], ate: ['resultado', 3.4] }], texto: ['e bata o', '{c:amarelo}recorde do dia{/c}'] },
  { trechos: [
    { tomada: 'extra-safari', de: ['encontro', 1.2], ate: ['isca', 3.0] },
    { tomada: 'extra-safari', de: ['cuia', -0.3], ate: ['cuia', 4.9] },
  ], texto: ['{c:verde}Safári:{/c} capture', 'com isca'] },
  { trechos: [{ tomada: 'extra-ninho', de: ['ninho', -0.6], ate: ['batalha', 2.6] }], texto: ['{c:amarelo}Ninhos Raros{/c}', 'na floresta'] },
  { trechos: [{ tomada: 'extra-quiz', de: ['pergunta-0', -0.3], ate: ['resposta-0', 3.3] }], texto: ['Quiz da fauna', 'no rádio'] },
  { trechos: [{ tomada: 'extra-rara', de: ['inicio', 0.3], ate: ['batalha', 2.6] }], texto: ['{c:amarelo}Pelagens raras ★{/c}'] },
  { trechos: [{ tomada: 'extra-radio', de: ['radio', -0.3], ate: ['radio', 3.6] }], texto: ['Rádio Cipó:', '{c:amarelo}enxame do dia{/c}'] },
  FIM,
];
/** vídeo B: mais do mundo (tomadas mundo-*) */
const MUNDO: Secao[] = [
  { trechos: [{ tomada: 'mundo-bike', de: ['inicio', 0], ate: ['fim', 0] }], texto: ['Cidades grandes', 'pra explorar'] },
  { trechos: [
    { tomada: 'mundo-lider', de: ['fala', -0.3], ate: ['fala', 3.0] },
    { tomada: 'mundo-lider', de: ['batalha', -0.4], ate: ['batalha', 4.0] },
    { tomada: 'mundo-lider', de: ['golpe', 0.3], ate: ['golpe', 3.0] },
  ], texto: ['{c:amarelo}16 líderes{/c}', 'de ginásio'] },
  { trechos: [{ tomada: 'mundo-pesca', de: ['inicio', 0.4], ate: ['batalha', 3.0] }], texto: ['Pesque no rio'] },
  { trechos: [{ tomada: 'mundo-remo', de: ['inicio', 0], ate: ['fim', 0] }], texto: ['Reme pelo mar'] },
  { trechos: [{ tomada: 'mundo-noite', de: ['dia', 0.2], ate: ['noite', 3.5] }], texto: ['{c:amarelo}Dia e noite{/c}', 'de verdade'] },
  { trechos: [{ tomada: 'mundo-trem', de: ['inicio', 0.1], ate: ['inicio', 3.5] }], texto: ['Pegue o trem', 'pro Sertão'] },
  FIM,
];

/* ------------------------------ 5. GIFs ------------------------------ */
const GIFS: Record<string, { trechos: Trecho[]; fps: number }> = {
  'gif-batalha-super-eficaz': { trechos: [{ tomada: 'grama', de: ['golpe', -0.9], ate: ['pos-golpe', 0.9] }], fps: 20 },
  'gif-captura-cuia': { trechos: [{ tomada: 'grama', de: ['cuia', -0.2], ate: ['cuia', 6.3] }], fps: 20 },
  'gif-mapa-b': { trechos: [
    { tomada: 'mapa-b', de: ['pantanal', 0], ate: ['pantanal', 2.4] },
    { tomada: 'mapa-b', de: ['pico', 0], ate: ['pico', 2.4] },
  ], fps: 20 },
};
function gif(nome: string, def: { trechos: Trecho[]; fps: number }) {
  const nat = nativo(nome, def.trechos);
  const saida = join(SAIDA, `${nome}.gif`);
  ff(['-i', nat, '-filter_complex', `[0:v]fps=${def.fps},scale=640:360:flags=neighbor,split[a][b];[a]palettegen=max_colors=128:stats_mode=full[p];[b][p]paletteuse=dither=none`, '-loop', '0', saida]);
  console.log(`${nome}: ${duracao(nat).toFixed(1)} s · ${mb(saida)}`);
}

const etapas = process.argv.slice(2).length ? process.argv.slice(2) : ['base', 'clipes', 'montagem', 'gifs', 'lendarios', 'mundo', 'extras'];
if (etapas.includes('base')) for (const t of readdirSync(BRUTOS)) if (existsSync(join(BRUTOS, t, 'quadros.json'))) base(t);
if (etapas.includes('clipes')) for (const [nome, tr] of Object.entries(CLIPES)) { try { exportar(nome, nativo(nome, tr)); } catch (e) { console.log(`${nome}: não montado (${String(e).slice(0, 160)})`); } }
if (etapas.includes('montagem')) await montagem();
if (etapas.includes('lendarios')) await montarRoteiro('video-a-lendarios', LENDARIOS, true);
if (etapas.includes('mundo')) await montarRoteiro('video-b-mais-do-mundo', MUNDO, true);
if (etapas.includes('extras')) await montarRoteiro('video-c-atividades-extras', EXTRAS, true);
if (etapas.includes('gifs')) for (const [nome, d] of Object.entries(GIFS)) gif(nome, d);
if (process.env.PINGO_LIMPAR) rmSync(TMP, { recursive: true, force: true });
