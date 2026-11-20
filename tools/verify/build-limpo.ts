/**
 * BUILD LIMPO: refaz o que o GitHub Actions faz, fora desta pasta. Clona o HEAD com `git clone` para uma pasta
 * temporária, aplica por cima o que um `git add -A && git commit` levaria agora (arquivos alterados e novos NÃO
 * ignorados; os apagados somem), liga o `node_modules` por link simbólico e roda `npm run build` lá.
 * Pega antes do push o que só quebra fora desta máquina: arquivo usado mas ignorado pelo .gitignore, import de
 * pacote que não está no package.json, package-lock fora de sincronia, asset que só existe no disco local.
 *
 * `PINGO_LIMPO=/pasta` troca o destino (padrão: <tmp>/pingo-build-limpo). `soHead`: não aplica as alterações locais.
 */
import { spawn, execFileSync } from 'node:child_process';
import { builtinModules } from 'node:module';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { RAIZ, novoAchado, type Achado } from './dados';

export const PASTA_LIMPA = process.env.PINGO_LIMPO ?? join(tmpdir(), 'pingo-build-limpo');
export interface ResultadoLimpo extends Achado { /** dist/ gerado na cópia limpa (só se o build passou) */ dist?: string; pasta: string }

const git = (args: string[], cwd = RAIZ) => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 });
const listaZ = (args: string[]) => git(args).split('\0').filter(Boolean);

function rodar(cmd: string, argv: string[], cwd: string, limiteMs: number): Promise<{ codigo: number; saida: string }> {
  return new Promise((ok) => {
    const p = spawn(cmd, argv, { cwd, env: { ...process.env, FORCE_COLOR: '0', CI: '1' } });
    let saida = ''; const junta = (b: Buffer) => { saida += b.toString(); };
    p.stdout.on('data', junta); p.stderr.on('data', junta);
    const t = setTimeout(() => { saida += '\n(tempo esgotado)'; p.kill('SIGKILL'); }, limiteMs);
    p.on('close', (c) => { clearTimeout(t); ok({ codigo: c ?? 1, saida }); });
    p.on('error', (e) => { clearTimeout(t); ok({ codigo: 1, saida: saida + String(e) }); });
  });
}
function arquivosDe(dir: string, saida: string[] = []): string[] {
  for (const n of readdirSync(dir)) { const p = join(dir, n); if (statSync(p).isDirectory()) arquivosDe(p, saida); else saida.push(p); }
  return saida;
}

/** todo pacote importado em src/ e tools/ tem de estar no package.json: no CI só existe o que o `npm ci` instala */
function conferirImports(pasta: string, a: Achado) {
  const pk = JSON.parse(readFileSync(join(pasta, 'package.json'), 'utf8')) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  const declarados = new Set([...Object.keys(pk.dependencies ?? {}), ...Object.keys(pk.devDependencies ?? {})]);
  const nativos = new Set(builtinModules);
  const re = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)(['"])([^'"\n]+)\1/g;
  // pastas que o tsconfig exclui (roteiros de teste locais dos QAs, cache): nem o tsc nem o build do CI as tocam
  let fora: string[] = [];
  try { fora = ((JSON.parse(readFileSync(join(pasta, 'tsconfig.json'), 'utf8')) as { exclude?: string[] }).exclude ?? []).map((x) => x.replace(/\/+$/, '') + '/'); } catch { fora = []; }
  let n = 0;
  for (const base of ['src', 'tools']) for (const f of arquivosDe(join(pasta, base))) {
    if (!/\.(ts|mts|tsx)$/.test(f)) continue;
    const txt = readFileSync(f, 'utf8'), rel = f.slice(pasta.length + 1);
    if (fora.some((x) => rel.startsWith(x))) continue;
    n++;
    for (const m of txt.matchAll(re)) {
      const alvo = m[2];
      if (alvo.startsWith('.') || alvo.startsWith('node:') || alvo.startsWith('virtual:')) continue;
      const linha = txt.slice(0, m.index).split('\n').length;
      if (alvo.startsWith('/')) { a.erros.push(`${rel}:${linha}: importa o caminho absoluto "${alvo}", que só existe nesta máquina`); continue; }
      const pacote = alvo.startsWith('@') ? alvo.split('/').slice(0, 2).join('/') : alvo.split('/')[0];
      if (nativos.has(pacote) || declarados.has(pacote)) continue;
      a.erros.push(`${rel}:${linha}: importa o pacote "${pacote}", que não está no package.json (o npm ci do GitHub não o instala)`);
    }
  }
  // o `npm ci` recusa package-lock.json fora de sincronia com o package.json
  const trava = join(pasta, 'package-lock.json');
  if (!existsSync(trava)) a.erros.push('package-lock.json: não está versionado (o npm ci do GitHub exige)');
  else {
    const raiz = (JSON.parse(readFileSync(trava, 'utf8')) as { packages?: Record<string, { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }> }).packages?.[''] ?? {};
    for (const campo of ['dependencies', 'devDependencies'] as const) {
      const x = pk[campo] ?? {}, y = raiz[campo] ?? {};
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) if (x[k] !== y[k]) a.erros.push(`package-lock.json: "${k}" está ${y[k] ?? 'ausente'} na trava e ${x[k] ?? 'ausente'} no package.json (rode npm install e versione a trava)`);
    }
  }
  return n;
}

export async function buildLimpo(soHead = false): Promise<ResultadoLimpo> {
  const a: ResultadoLimpo = { ...novoAchado(), pasta: PASTA_LIMPA };
  let cabeca = '';
  try { cabeca = git(['rev-parse', '--short', 'HEAD']).trim(); } catch { a.erros.push('.git: esta pasta não é um repositório git (sem ele não há o que publicar)'); return a; }

  /* 1. o que o jogo usa e o git ignora nunca chega ao site */
  for (const f of listaZ(['ls-files', '-z', '--others', '--ignored', '--exclude-standard', '--', 'public', 'src', 'index.html', 'package.json', 'package-lock.json', 'vite.config.ts', 'tsconfig.json', '.github']))
    a.erros.push(`${f}: existe no disco mas é ignorado pelo .gitignore — não vai para o site`);
  const novos = listaZ(['ls-files', '-z', '--others', '--exclude-standard']);
  const novosDoJogo = novos.filter((f) => /^(public|src)\//.test(f));
  if (novosDoJogo.length) a.avisos.push(`${novosDoJogo.length} arquivo(s) do jogo ainda fora do git (entram no próximo commit com git add -A): ${novosDoJogo.slice(0, 6).join(', ')}${novosDoJogo.length > 6 ? '…' : ''}`);

  /* 2. cópia limpa: clone do HEAD + alterações locais que um commit levaria */
  rmSync(PASTA_LIMPA, { recursive: true, force: true }); mkdirSync(dirname(PASTA_LIMPA), { recursive: true });
  try { git(['clone', '--quiet', '--no-hardlinks', RAIZ, PASTA_LIMPA]); } catch (e) { a.erros.push('.git: o git clone local falhou — ' + String((e as Error).message).slice(0, 300)); return a; }
  let aplicados = 0;
  if (!soHead) {
    const mexidos = new Set([...listaZ(['ls-files', '-z', '--modified', '--deleted']), ...novos]);
    for (const f of mexidos) {
      const de = join(RAIZ, f), para = join(PASTA_LIMPA, f);
      if (!existsSync(de)) { rmSync(para, { force: true }); aplicados++; continue; }
      if (statSync(de).isDirectory()) continue;
      mkdirSync(dirname(para), { recursive: true }); cpSync(de, para); aplicados++;
    }
  }
  if (!existsSync(join(RAIZ, 'node_modules'))) { a.erros.push('node_modules: ausente — rode npm ci'); return a; }
  symlinkSync(join(RAIZ, 'node_modules'), join(PASTA_LIMPA, 'node_modules'), 'dir');

  /* 3. dependências declaradas */
  const fontes = conferirImports(PASTA_LIMPA, a);

  /* 4. o mesmo comando do workflow (.github/workflows/pages.yml) */
  const t0 = Date.now();
  const r = await rodar('npm', ['run', 'build'], PASTA_LIMPA, 600000);
  let nTs = 0;
  for (const l of r.saida.split('\n')) {
    const m = /^(.+?)\((\d+),\d+\): error (TS\d+): (.*)$/.exec(l.trim());
    if (m) { nTs++; if (nTs <= 30) a.erros.push(`${m[1]}:${m[2]}: ${m[3]} ${m[4]} (só na cópia limpa: confira se o arquivo importado está versionado)`); }
  }
  if (nTs > 30) a.erros.push(`… e mais ${nTs - 30} erro(s) de TypeScript na cópia limpa`);
  if (r.codigo && !nTs) a.erros.push(`package.json: \`npm run build\` falhou na cópia limpa — ${r.saida.trim().split('\n').slice(-6).join(' | ').slice(0, 600)}`);
  const dist = join(PASTA_LIMPA, 'dist');
  if (!r.codigo && !existsSync(join(dist, 'sw.js'))) a.erros.push('tools/build-sw.ts: o build terminou sem gerar dist/sw.js');
  if (!r.codigo && existsSync(join(dist, 'sw.js'))) a.dist = dist;
  a.info.push(`git clone do HEAD ${cabeca}${soHead ? '' : ` + ${aplicados} arquivo(s) alterado(s)/novo(s) do disco`} em ${PASTA_LIMPA}; ${fontes} fontes com imports conferidos; npm run build ${r.codigo ? 'FALHOU' : 'passou'} em ${((Date.now() - t0) / 1000).toFixed(0)} s (Node ${process.version}; o CI usa o 22)`);
  return a;
}
