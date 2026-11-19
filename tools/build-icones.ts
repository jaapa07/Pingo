/**
 * Gera os ícones do PWA em `public/icones/` a partir da arte do jogo (sol e mar do título, Tamanduí de frente).
 * Roda só quando a arte mudar: `npx tsx tools/build-icones.ts`. Usa o navegador do Playwright como
 * montador de imagem (ferramenta de build; nada disso vai para o jogo).
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { launch } from './lib/pw';

const RAIZ = new URL('..', import.meta.url).pathname;
const pub = (c: string) => 'file://' + RAIZ + 'public/' + c;
mkdirSync(RAIZ + 'public/icones', { recursive: true });

/** `margem`: fração de respiro em volta do desenho (ícones "maskable" são recortados em círculo) */
function pagina(lado: number, margem: number): string {
  const u = lado / 64; // o desenho é pensado numa grade de 64 px
  const m = lado * margem, k = (lado - 2 * m) / lado;
  return `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0;width:${lado}px;height:${lado}px;overflow:hidden;image-rendering:pixelated}
  #f{position:absolute;inset:0;background:linear-gradient(#3fa7d6 0 34%,#6cc5e0 34% 52%,#f6d28b 52% 62%,#f0b35e 62% 100%)}
  #g{position:absolute;left:${m}px;top:${m}px;width:${lado}px;height:${lado}px;transform-origin:0 0;transform:scale(${k})}
  .p{position:absolute;image-rendering:pixelated;background-repeat:no-repeat}
  #sol{left:${36 * u}px;top:${3 * u}px;width:32px;height:32px;transform-origin:0 0;transform:scale(${u * 0.8});background-image:url(${pub('assets/ui/camadas/sol.png')})}
  #mar{left:0;top:${m + 30 * u * k}px;width:${Math.ceil(64 / k)}px;height:8px;transform-origin:0 0;transform:scale(${u * k});background-image:url(${pub('assets/ui/camadas/mar.png')});background-repeat:repeat-x}
  #chao{left:0;top:${m + 50 * u * k}px;width:${lado}px;height:${lado}px;background:#5aa646;box-shadow:inset 0 ${u}px 0 #8fd16a, inset 0 ${2 * u}px 0 #74bd58}
  #bicho{left:${-2 * u}px;top:${4 * u}px;width:64px;height:64px;transform-origin:0 0;transform:scale(${u * 0.95});background-image:url(${pub('assets/sprites/criatura/tamandui/frente.png')});background-position:-320px 0}
  </style><div id="f"></div><div class="p" id="mar"></div><div class="p" id="chao"></div><div id="g"><div class="p" id="sol"></div><div class="p" id="bicho"></div></div>`;
}

const SAIDAS: [string, number, number][] = [
  ['apple-touch-icon.png', 180, 0], ['icone-192.png', 192, 0], ['icone-512.png', 512, 0],
  ['icone-maskable-192.png', 192, 0.12], ['icone-maskable-512.png', 512, 0.12], ['favicon-32.png', 32, 0],
];
const b = await launch();
for (const [nome, lado, margem] of SAIDAS) {
  const pg = await b.newPage({ viewport: { width: lado, height: lado }, deviceScaleFactor: 1 });
  // arquivo temporário dentro de public/icones: a página precisa ser file:// para ler a arte local
  const tmp = RAIZ + 'public/icones/_montagem.html';
  writeFileSync(tmp, pagina(lado, margem));
  await pg.goto('file://' + tmp, { waitUntil: 'load' });
  rmSync(tmp);
  await pg.waitForTimeout(150);
  await pg.screenshot({ path: RAIZ + 'public/icones/' + nome });
  await pg.close();
  console.log('ícone', nome, lado + 'px');
}
await b.close();
