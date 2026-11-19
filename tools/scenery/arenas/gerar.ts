/**
 * Gera as arenas de batalha em pixel art: public/assets/arenas/<id>/{fundo,cenario,chao}-{dia|noite}.png,
 * tiras anim-<nome>-<periodo>.png (4 quadros lado a lado) e arena.json.
 * Uso: tsx tools/scenery/arenas/gerar.ts [id ...] [--previa=/pasta]  (a prévia grava a composição ampliada 2×)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Tela, png, resolverPaleta, paraHex, APOIO, W, H, type ArenaDef, type Ctx } from './nucleo';
import { ARENAS } from './index';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith('--'));
const previa = args.find((a) => a.startsWith('--previa='))?.split('=')[1];
const QUADROS = 4;

function pintarArena(a: ArenaDef, noite: boolean): Ctx {
  const c: Ctx = { fundo: new Tela(), cenario: new Tela(), chao: new Tela(), P: resolverPaleta(a.paleta, noite), noite };
  a.pintar(c);
  // o fundo é sempre opaco: frestas herdam a cor do pixel de cima
  for (let x = 0; x < W; x++) for (let y = 1; y < H; y++) if (c.fundo.px[y * W + x] < 0) c.fundo.px[y * W + x] = c.fundo.px[(y - 1) * W + x];
  return c;
}

for (const a of ARENAS) {
  if (ids.length && !ids.some((p) => (p.endsWith('*') ? a.id.startsWith(p.slice(0, -1)) : p === a.id))) continue;
  const dir = resolve(ROOT, 'public/assets/arenas', a.id);
  mkdirSync(dir, { recursive: true });
  const periodos = a.interna ? (['dia'] as const) : (['dia', 'noite'] as const);
  const paletas: Record<string, string[]> = {};
  const animsJson: Record<string, unknown>[] = [];
  let maxCores = 0;
  for (const per of periodos) {
    const c = pintarArena(a, per === 'noite');
    const cores = new Set<number>([...c.fundo.cores(), ...c.cenario.cores(), ...c.chao.cores()]);
    writeFileSync(resolve(dir, `fundo-${per}.png`), png(c.fundo));
    writeFileSync(resolve(dir, `cenario-${per}.png`), png(c.cenario));
    writeFileSync(resolve(dir, `chao-${per}.png`), png(c.chao));
    const quadros0: Tela[] = [];
    for (const an of a.anims) {
      if (an.so && an.so !== per) continue;
      const tira = new Tela(an.w * QUADROS, an.h);
      for (let q = 0; q < QUADROS; q++) {
        const cheio = new Tela();
        an.pintar(cheio, q, c);
        tira.colar(cheio.recorte(an.x, an.y, an.w, an.h), q * an.w, 0);
        if (q === 0) quadros0.push(cheio);
      }
      for (const k of tira.cores()) cores.add(k);
      writeFileSync(resolve(dir, `anim-${an.id}-${per}.png`), png(tira));
      const ja = animsJson.find((j) => j.id === an.id) as { arquivos: Record<string, string> } | undefined;
      if (ja) ja.arquivos[per] = `anim-${an.id}-${per}.png`;
      else animsJson.push({ id: an.id, arquivos: { [per]: `anim-${an.id}-${per}.png` }, x: an.x, y: an.y, w: an.w, h: an.h, quadros: QUADROS, fps: an.fps, sobre: an.sobre });
    }
    paletas[per] = [...cores].sort((x, y) => x - y).map(paraHex);
    maxCores = Math.max(maxCores, cores.size);
    if (previa) {
      const comp = new Tela();
      comp.colar(c.fundo); comp.colar(c.cenario); comp.colar(c.chao);
      for (const q of quadros0) comp.colar(q);
      // marcas dos apoios só na prévia (sombras elípticas das criaturas)
      const sombra = c.P[a.sombra][0];
      comp.elipse(APOIO.inimigo.x, APOIO.inimigo.y, 20, 4, sombra); comp.elipse(APOIO.jogador.x, APOIO.jogador.y, 26, 5, sombra);
      mkdirSync(previa, { recursive: true });
      writeFileSync(resolve(previa, `${a.id}-${per}.png`), png(comp.ampliar(2)));
    }
  }
  const P = resolverPaleta(a.paleta, false), PN = resolverPaleta(a.paleta, true);
  const json = {
    id: a.id, nome: a.nome, tipo: a.interna ? 'interna' : 'externa', largura: W, altura: H, periodos: [...periodos],
    /** ordem de desenho: fundo → cenario → chao → criaturas → anims com sobre:'frente' */
    camadas: (['fundo', 'cenario', 'chao'] as const).map((id, i) => ({ id, parallax: i, arquivos: Object.fromEntries(periodos.map((p) => [p, `${id}-${p}.png`])) })),
    apoios: {
      inimigo: { ...APOIO.inimigo, rx: a.apoio?.inimigo[0] ?? 30, ry: a.apoio?.inimigo[1] ?? 8 },
      jogador: { ...APOIO.jogador, rx: a.apoio?.jogador[0] ?? 40, ry: a.apoio?.jogador[1] ?? 11 },
    },
    sombra: a.interna ? { dia: paraHex(P[a.sombra][0]) } : { dia: paraHex(P[a.sombra][0]), noite: paraHex(PN[a.sombra][0]) },
    anims: animsJson,
    paleta: paletas,
  };
  writeFileSync(resolve(dir, 'arena.json'), JSON.stringify(json));
  console.log(`✔ ${a.id.padEnd(11)} ${periodos.length} período(s) · ${animsJson.length} anim · até ${maxCores} cores`);
}
