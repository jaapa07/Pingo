/**
 * PACOTE PUBLICADO: confere, dentro de um `dist/` (de preferência o do build limpo), que tudo o que o jogo
 * carrega (mapas A e B, Pico, pós-jogo e visitantes) está lá: zonas assadas (zona.json + todos os pedaços de todos os períodos), tilesets,
 * decoração, FX, interface, arenas (todas as camadas), sprites de gente e de criaturas (pelo atlas) e os
 * arquivos citados pelo index.html e pelo manifest. O áudio é sintetizado em código (src/audio): não há arquivos.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Comando } from '../../src/core/tipos';
import { ESPECIES, VISITANTES } from '../../src/data/criaturas';
import { carregar, cadaComando, novoAchado, type Achado } from './dados';
import { encontrosDe } from './integridade';

interface Atlas { [id: string]: { categoria: string; vistas: Record<string, { src: string }> } }
const mb = (b: number) => (b / 1048576).toFixed(1) + ' MB';

export async function pacote(dist: string, rotulo: string): Promise<Achado> {
  const a = novoAchado(), d = await carregar();
  const tem = (c: string) => { const p = join(dist, c); return existsSync(p) && statSync(p).size > 0; };
  const json = <T>(c: string): T | null => { try { return JSON.parse(readFileSync(join(dist, c), 'utf8')) as T; } catch { return null; } };
  let n = 0;
  const exige = (c: string, quem: string, pendente = false) => { n++; if (tem(c)) return true; (pendente ? a.pendentes : a.erros).push(`${rotulo}/${c}: ausente ou vazio (${quem})`); return false; };

  /* página, manifest, ícones */
  const html = existsSync(join(dist, 'index.html')) ? readFileSync(join(dist, 'index.html'), 'utf8') : '';
  if (!html) { a.erros.push(`${rotulo}/index.html: ausente`); return a; }
  for (const m of html.matchAll(/(?:src|href)="([^"#?]+)"/g)) if (!/^(https?:|data:)/.test(m[1])) exige(m[1].replace(/^\.\//, ''), 'citado pelo index.html');
  const man = json<{ icons?: { src: string }[] }>('manifest.webmanifest');
  if (!man) a.erros.push(`${rotulo}/manifest.webmanifest: ausente ou inválido`); else for (const i of man.icons ?? []) exige(i.src.replace(/^\.\//, ''), 'ícone do manifest');

  /* interface, FX, decoração */
  const kit = JSON.parse(readFileSync(new URL('../../src/ui/gerado/kit.json', import.meta.url), 'utf8')) as { atlas: { src: string }; fontes: Record<string, { src: string }>; camadas: Record<string, unknown> };
  exige(kit.atlas.src, 'atlas da interface');
  for (const f of Object.values(kit.fontes)) exige(f.src, 'fonte da interface');
  for (const c of Object.keys(kit.camadas)) exige(`assets/ui/camadas/${c}.png`, 'camada da interface');
  exige('assets/fx/fx.png', 'efeitos de golpe');
  exige('assets/tiles/decoracao.png', 'decoração'); exige('assets/tiles/decoracao.json', 'decoração');

  /* zonas: bake completo */
  let zonasA = 0, pedacos = 0; const tilesets = new Set<string>(), arenas = new Set<string>();
  for (const z of d.zonas.values()) {
    const doA = true, arq = d.arquivoDaZona.get(z.id) ?? z.id, base = `assets/zonas/${z.id}/`;
    zonasA++; tilesets.add(z.tileset); arenas.add(z.arena);
    if (!exige(base + 'zona.json', `bake da zona ${z.id}; rode npm run bake`)) continue;
    const j = json<{ largura?: number; altura?: number; w?: number; h?: number; tileset?: string; periodos?: string[]; chunks?: ({ cx: number; cy: number; alto?: boolean; anim?: boolean } | string)[] }>(base + 'zona.json');
    if (!j) { a.erros.push(`${rotulo}/${base}zona.json: JSON inválido`); continue; }
    const w = j.largura ?? j.w, h = j.altura ?? j.h;
    if (w !== z.mapaChars[0].length || h !== z.mapaChars.length) (doA ? a.erros : a.pendentes).push(`${arq}: o bake publicado tem ${w}×${h} tiles e a zona tem ${z.mapaChars[0].length}×${z.mapaChars.length} — bake antigo (rode npm run bake e versione public/assets/zonas/${z.id})`);
    if (j.tileset && j.tileset !== z.tileset) (doA ? a.erros : a.pendentes).push(`${arq}: o bake publicado usa o tileset "${j.tileset}" e a zona pede "${z.tileset}" — bake antigo`);
    let faltam = 0, primeiro = '';
    for (const per of j.periodos ?? ['dia']) for (const c of j.chunks ?? []) {
      const k = typeof c === 'string' ? c : `${c.cx}_${c.cy}`, alto = typeof c === 'string' || !!c.alto, anim = typeof c === 'string' || !!c.anim;
      for (const cam of ['chao', ...(alto ? ['alto'] : []), ...(anim ? ['anim'] : [])]) { pedacos++; n++; if (!tem(`${base}${cam}-${per}-${k}.png`)) { faltam++; primeiro ||= `${cam}-${per}-${k}.png`; } }
    }
    if (faltam) (doA ? a.erros : a.pendentes).push(`${rotulo}/${base}: faltam ${faltam} pedaço(s) do bake (ex.: ${primeiro})`);
  }
  for (const t of tilesets) { exige(`assets/tiles/${t}.png`, 'tileset'); exige(`assets/tiles/${t}.json`, 'tileset'); }

  /* arenas: todas as camadas e animações citadas */
  for (const id of arenas) {
    if (!exige(`assets/arenas/${id}/arena.json`, 'arena de batalha')) continue;
    const j = json<{ camadas?: { arquivos: Record<string, string> }[]; anims?: { arquivos: Record<string, string> }[] }>(`assets/arenas/${id}/arena.json`);
    for (const c of [...(j?.camadas ?? []), ...(j?.anims ?? [])]) for (const f of Object.values(c.arquivos)) exige(`assets/arenas/${id}/${f}`, `arena ${id}`);
  }

  /* sprites: gente e criaturas do mapa A, pelo atlas */
  const atlas = json<Atlas>('assets/atlas.json');
  if (!atlas) a.erros.push(`${rotulo}/assets/atlas.json: ausente ou inválido`);
  else {
    const usados = new Map<string, string>();
    const usa = (s: string | undefined, onde: string) => { if (s && !usados.has(s)) usados.set(s, onde); };
    const idEsp = (num: number) => (ESPECIES.find((e) => e.num === num) ?? VISITANTES.find((e) => e.num === num))?.id;
    usa('kaue', 'jogador'); usa('ayra', 'jogadora');
    const treinadoresA = new Set<string>();
    for (const z of d.zonas.values()) {
      for (const np of z.npcs ?? []) { usa(np.sprite.startsWith('c:') ? np.sprite.slice(2) : np.sprite, `NPC ${np.id} de ${z.id}`); if (np.treinador) treinadoresA.add(np.treinador); }
      for (const p of z.portoes ?? []) if (p.sprite) usa(p.sprite.startsWith('c:') ? p.sprite.slice(2) : p.sprite, `portão de ${z.id}`);
      for (const hb of z.habitats ?? []) for (const e of encontrosDe(hb)) usa(idEsp(e.e), `habitat de ${z.id}`);
    }
    for (const ev of d.eventos.values()) { const arq = d.arquivoDoEvento.get(ev.id) ?? ''; if (/\/_/.test(arq)) continue; cadaComando(ev.passos, (c: Comando) => { if (c[0] === 'batalha') treinadoresA.add(String(c[1])); if (['darCriatura', 'selvagem', 'darOvo', 'errante', 'vis-lendario'].includes(String(c[0])) && Number(c[1]) > 0) usa(idEsp(Number(c[1])), `evento ${ev.id}`); }); }
    // todo treinador (revanches do Rádio, rival semanal, Conselho) e toda espécie pode aparecer por evolução ou troca
    for (const t of d.treinadores.values()) treinadoresA.add(t.id);
    for (const e of [...ESPECIES, ...VISITANTES]) usa(e.id, `espécie ${e.num}`);
    for (const id of treinadoresA) { const t = d.treinadores.get(id); if (!t) continue; usa(t.sprite.startsWith('c:') ? t.sprite.slice(2) : t.sprite, `treinador ${id}`); for (const m of t.equipe) usa(idEsp(m.e), `equipe de ${id}`); }
    for (const [id, onde] of usados) {
      const m = atlas[id]; n++;
      if (!m) { a.erros.push(`${rotulo}/assets/atlas.json: o sprite "${id}" (${onde}) não está no atlas`); continue; }
      for (const v of Object.values(m.vistas)) exige(v.src, `sprite ${id}, ${onde}`);
    }
    // o atlas não pode citar arquivo que não foi publicado (qualquer espécie pode aparecer por evolução ou troca)
    let orfas = 0; for (const m of Object.values(atlas)) for (const v of Object.values(m.vistas)) if (!tem(v.src)) orfas++;
    if (orfas) a.erros.push(`${rotulo}/assets/atlas.json: ${orfas} imagem(ns) citada(s) pelo atlas não está(ão) no pacote`);
  }

  /* resumo por pasta */
  const soma = (dir: string): [number, number] => { let q = 0, b = 0; const anda = (p: string) => { for (const f of readdirSync(p)) { const c = join(p, f), s = statSync(c); if (s.isDirectory()) anda(c); else { q++; b += s.size; } } }; if (existsSync(join(dist, dir))) anda(join(dist, dir)); return [q, b]; };
  const partes = ['assets/zonas', 'assets/sprites', 'assets/arenas', 'assets/tiles', 'assets/ui', 'assets/fx'].map((p) => { const [q, b] = soma(p); return `${p.slice(7)} ${q} arq. ${mb(b)}`; });
  a.info.push(`${n} arquivos exigidos pelo jogo conferidos em ${rotulo} (${zonasA} zonas dos mapas A e B, ${pedacos} pedaços de bake, ${arenas.size} arenas, ${tilesets.size} tilesets)`);
  a.info.push(partes.join(' · ') + ' · áudio: sintetizado em código, sem arquivos');
  return a;
}
