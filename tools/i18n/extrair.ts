/**
 * `npm run i18n:extrair`: varre src/ e gera/atualiza o catálogo EN em src/i18n/en/<área>.json (docs/I18N.md).
 *  - chave: o texto PT exato (frase pronta) ou o modelo de `tr('…{x}…')`;
 *  - `en`: a tradução ("" = a traduzir; traduções existentes são preservadas);
 *  - `ctx`: onde aparece (arquivo:linha, quem fala, campo) para ajudar o tradutor.
 * Entradas que sumiram do código saem do catálogo (com tradução, vão para src/i18n/en/_orfas.json, para não se perder).
 * Também lista as "montagens" que ainda não passam por `tr` (template literal / concatenação / .replace com texto em
 * português): elas não seriam traduzidas. Opções: `--montagens` mostra todas; `--seco` não grava nada.
 */
import ts from 'typescript';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { AREAS, PASTA_EN, RAIZ, areaDe, lerArea, gravarArea, palavras, type Area, type Catalogo } from './comum';
import { ESPECIES, VISITANTES } from '../../src/data/criaturas';

process.stdout.on('error', () => undefined); // saída cortada por head/tail não interrompe a gravação
const args = process.argv.slice(2);
const SECO = args.includes('--seco'), MOSTRAR = args.includes('--montagens');

function arquivos(dir: string, r: string[] = []): string[] {
  for (const n of readdirSync(dir).sort()) { const p = join(dir, n); if (statSync(p).isDirectory()) arquivos(p, r); else if (/\.ts$/.test(n)) r.push(p); }
  return r;
}

/** nomes de criaturas: passam sem tradução e nunca entram no catálogo */
const CRIATURAS = new Set([...ESPECIES, ...VISITANTES].map((e) => e.nome));

/** parece texto de jogo (frase, rótulo, nome) e não id/caminho/CSS/condição? */
export function pareceTexto(s: string): boolean {
  const t = s.trim();
  if (t.length < 2 || !/[A-Za-zÀ-ÿ]/.test(t)) return false;
  if (CRIATURAS.has(t)) return false;
  if (/^https?:|^\.{0,2}\//.test(t) || (!/ /.test(t) && /\.(png|json|js|ts|webp|mp3|ogg|bin|css|html|svg|pingo)$/.test(t))) return false;
  if (/(^|[;{ ])[a-z-]+:\s*[^ ]+;|\bpx\b|\d+px|rgba?\(|url\(|gradient\(|^#[0-9a-f]{3,8}$|translate[XY]?\(|cubic-bezier/i.test(t)) return false;
  if (!/[A-ZÀ-ÿ]/.test(t)) {
    // minúsculas: só vale como texto se for frase (tem espaço e palavras de verdade, sem cara de condição/classe CSS)
    if (!/ /.test(t) || /[&|<>=]|![a-z]|^[a-z0-9-]+:[a-z0-9-]/.test(t)) return false;
    if ((t.match(/[a-z]{2,}/g) ?? []).length < 2) return false;
  }
  if (/[A-Za-z]\(|[~^]{2}|\.\.|,,/.test(t)) return false; // css, grades de pixel
  if (!/ /.test(t)) {
    if (!/^[A-Za-zÀ-ÿºª'.!?:,;…/+-]+$/.test(t)) return false; // sem espaço, só vale palavra de letras
    if (/([A-Z:;])\1{3,}/.test(t) && !/[a-zß-ÿ]/.test(t)) return false; // TTTTNNTTTT: linha de grade de zona
    if (!/^([A-ZÀ-Þ][a-zß-ÿ]*|[A-ZÀ-Þ]+|[a-zß-ÿ]+)([^A-Za-zÀ-ÿ]+([A-ZÀ-Þ][a-zß-ÿ]*|[A-ZÀ-Þ]+|[a-zß-ÿ]+))*[^A-Za-zÀ-ÿ]*$/.test(t)) return false; // gG, kTTt…: grade de pixels
    if (/^[A-Z0-9_-]+$/.test(t) && (t.length < 4 || /[0-9_-]/.test(t))) return false; // A1, B2-N, PP, MAPA_B
    if (/^[A-Z][A-Za-z0-9]*[A-Z][a-z]/.test(t) && !/[À-ÿ]/.test(t)) return false; // CamelCase de código (HTMLElement)
    if (/^[A-Za-z]+[0-9]+[A-Za-z0-9-]*$/.test(t) || /^[A-Z][A-Z0-9]*-[A-Za-z0-9-]+$/.test(t)) return false; // A1-lab, Key9
    if (/^(Escape|Enter|Shift|Space|Arrow\w+|Key\w|Digit\w|Backspace|Tab|Numpad\w+|Mozilla|Android|iPhone|iPad|Macintosh|Windows|Linux|Chrome|Safari|Electron|Capacitor)$/.test(t)) return false;
  }
  return true;
}

interface Achado { texto: string; arq: string; linha: number; ctx: string; modelo: boolean }
interface Montagem { arq: string; linha: number; trecho: string; tipo: string }
const achados: Achado[] = [];
const montagens: Montagem[] = [];

/** nomes de comandos de evento (docs/MOTOR.md + os registrados com registrarComando): o 1º elemento das tuplas */
const COMANDOS = new Set(['falar', 'escolha', 'simnao', 'mover', 'virar', 'esperar', 'emote', 'dar', 'tirar', 'dinheiro', 'darCriatura', 'darOvo', 'batalha', 'selvagem', 'flag', 'insignia', 'amuleto', 'se', 'musica', 'sfx', 'tela', 'fade', 'warp', 'camera', 'tremor', 'curar', 'loja', 'mostrar', 'esconder', 'cinematica', 'salvar', 'chamar', 'pedirNome', 'avisar', 'placa', 'texto', 'perguntar']);
for (const f of arquivos(join(RAIZ, 'src'))) for (const m of readFileSync(f, 'utf8').matchAll(/registrarComando\(\s*'([^']+)'/g)) COMANDOS.add(m[1]);
const CHAMADAS_FORA = /^(div|elTela|console\.\w+|Error|TypeError|RangeError|bus\.(emit|on|off)|som|spr|trocarSpr|camada|vista|sfx|musica|classList\.\w+|\w+\.classList\.\w+|document\.\w+|\w+\.querySelector(All)?|\w+\.setAttribute|\w+\.getAttribute|localStorage\.\w+|\w+\.(getItem|setItem|removeItem)|registrarTela|criarTela|temTela|registrarComando|registrarMecanica|import|require|cond|temFlag|setFlag|flag|rodarEvento|irPara|playSfx|playMusic|fetch|new URL|URL|RegExp|new RegExp|\w+\.addEventListener|addEventListener|\w+\.postMessage|\w+\.dataset\.\w+|matchMedia|window\.\w+|\w+\.emit|\w+\.tocar|\w+\.tocarAte|new Sprite|Sprite|carregar\w*|abrirTela|tocarSfx|sfxDe|audio\.\w+|\w+\.startsWith|\w+\.endsWith|\w+\.includes|\w+\.split|\w+\.indexOf|\w+\.lastIndexOf)$/;
const PROPS_FORA = new Set(['id', 'retrato', 'voz', 'modelo', 'sprite', 'anim', 'sfx', 'musica', 'som', 'icone', 'classe_css', 'cena', 'arena', 'requer', 'cond', 'se', 'flag', 'evento', 'zona', 'tela', 'emote', 'vista', 'cor', 'tipo', 'chave', 'cls', 'className', 'src', 'href', 'url', 'key', 'code', 'grade', 'legenda', 'mapa', 'tileset', 'bioma', 'ambiente', 'warp', 'para', 'destino', 'base', 'clima', 'periodo', 'estilo', 'fx', 'efeito', 'status', 'mov', 'ia', 'personalidade', 'lado', 'jeito', 'pele', 'textura', 'modo', 'dir', 'forma', 'categoria_id', 'flagDoResultado']);

function propNome(n: ts.PropertyName): string { return ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n) ? n.text : n.getText(); }

/** o literal está num lugar que nunca vira texto de tela? */
function foraDeTela(n: ts.Node): boolean {
  const p = n.parent;
  if (!p) return false;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || ts.isExternalModuleReference(p) || ts.isImportTypeNode(p)) return true;
  if (ts.isPropertyAssignment(p) && p.name === n) return true; // chave de objeto
  if (ts.isPropertyAssignment(p) && p.initializer === n && PROPS_FORA.has(propNome(p.name)) && !tabelaDeTexto(n)) return true;
  if (ts.isElementAccessExpression(p) && p.argumentExpression === n) return true;
  if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.InKeyword].includes(p.operatorToken.kind)) return true;
  if (ts.isCaseClause(p)) return true;
  if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && /\.(className|id|cssText)$/.test(p.left.getText())) return true;
  if ((ts.isCallExpression(p) || ts.isNewExpression(p)) && p.arguments?.includes(n as ts.Expression)) {
    const nome = ts.isNewExpression(p) ? 'new ' + p.expression.getText() : p.expression.getText();
    if (CHAMADAS_FORA.test(nome) || CHAMADAS_FORA.test(nome.replace(/^new /, ''))) return true;
  }
  if (ts.isCallExpression(p) && p.expression.getText() === 'tr' && p.arguments[0] !== n) return true;
  if (ts.isArrayLiteralExpression(p)) {
    // linhas da grade de uma zona (`mapaChars: ['T::b::::b::T', …]`): desenho do mapa, nunca texto de tela
    if (ts.isPropertyAssignment(p.parent) && p.parent.initializer === p && propNome(p.parent.name) === 'mapaChars') return true;
    // comandos de evento: só o texto de falar/escolha/simnao/avisar e as opções de escolha
    const cab = p.elements[0];
    if (cab && ts.isStringLiteral(cab) && COMANDOS.has(cab.text)) {
      const c = cab.text, i = p.elements.indexOf(n as ts.Expression);
      if (i === 0) return true;
      if (['falar', 'avisar', 'placa', 'texto'].includes(c)) return i !== p.elements.length - 1 && !(c === 'falar' && i === 2);
      if (['escolha', 'simnao', 'pedirNome', 'perguntar'].includes(c)) return i !== 1;
      if (/^(se|flag|warp|mover|virar|emote|dar|tirar|batalha|selvagem|darCriatura|darOvo|insignia|amuleto|musica|sfx|tela|fade|camera|mostrar|esconder|cinematica|chamar|esperar|tremor|curar|salvar|dinheiro)$/.test(c)) return true;
    }
  }
  return false;
}

/** contexto para o tradutor: arquivo:linha + quem fala / campo / função */
function contexto(n: ts.Node, sf: ts.SourceFile, rel: string): string {
  const linha = sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
  let extra = '';
  for (let p: ts.Node | undefined = n.parent, d = 0; p && d < 6 && !extra; p = p.parent, d++) {
    if (ts.isPropertyAssignment(p)) extra = 'campo ' + propNome(p.name);
    else if (ts.isArrayLiteralExpression(p) && p.elements[0] && ts.isStringLiteral(p.elements[0])) {
      const c = p.elements[0].text;
      if (c === 'falar') { const q = p.elements[1]; extra = 'fala de ' + (q ? q.getText(sf).replace(/\s+/g, ' ').slice(0, 60) : '?'); }
      else if (['escolha', 'simnao'].includes(c)) extra = 'pergunta/opção';
    } else if (ts.isCallExpression(p)) {
      const f = p.expression.getText(sf);
      if (f === 'tr') continue;
      if (/^(falar|escolher|simNao|avisar|informar|confirmar|perguntar|f|fala|msg|this\.msg)$/.test(f) || /\.(msg|falar)$/.test(f)) extra = f + '()';
      else if (f.length < 24 && /^[a-zA-Z_.]+$/.test(f)) extra = f + '()';
    }
  }
  return `${rel}:${linha}${extra ? ' · ' + extra : ''}`;
}

/** literal dentro de uma tabela de nomes/frases (const NOME_…, DIA, PER, MSG_…): palavras soltas em minúsculas também são texto de tela */
function tabelaDeTexto(n: ts.Node): boolean {
  for (let p = n.parent, d = 0; p && d < 4; p = p.parent, d++) {
    if (ts.isVariableDeclaration(p)) return /^(NOME|MSG|ROTULO|TXT|TEXTO|FRASE|DICA)|^(DIA|PER)$/.test(p.name.getText());
    if (!ts.isObjectLiteralExpression(p) && !ts.isArrayLiteralExpression(p) && !ts.isPropertyAssignment(p) && !ts.isAsExpression(p) && !ts.isSatisfiesExpression(p)) return false;
  }
  return false;
}
const temTextoPt = (s: string) => { const est = s.replace(/\$\{[^}]*\}/g, ''); if (/<[a-z\/!]/i.test(est)) return false; return /[A-Za-zÀ-ÿ]{2,}/.test(est) && /[ À-ÿ]/.test(est) && pareceTexto(s.replace(/\$\{[^}]*\}/g, ' Pingo ')); };

function varrer(arq: string) {
  const rel = relative(RAIZ, arq).split('\\').join('/');
  if (!areaDe(rel)) return;
  // mensagens de validação para quem desenvolve (grades de zona, desenho em pixels): não são texto de jogo
  const semMontagens = /data\/zonas\/_.*-(lib|grade)\.ts$|world\/(zonas|pixel)\.ts$/.test(rel);
  const src = readFileSync(arq, 'utf8');
  const sf = ts.createSourceFile(arq, src, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const linhasSrc = src.split('\n');
  /** `// i18n-ok` na linha: montagem conferida (só números/nomes, ou já feita com tr por dentro) */
  const ok = (n: ts.Node) => linhasSrc[sf.getLineAndCharacterOfPosition(n.getStart()).line]?.includes('i18n-ok');
    const visitar = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const p = n.parent;
      const ehModelo = !!p && ts.isCallExpression(p) && p.expression.getText(sf) === 'tr' && p.arguments[0] === n;
      if (ehModelo || ((pareceTexto(n.text) || (tabelaDeTexto(n) && /[a-zà-ÿ]{2,}/i.test(n.text))) && !foraDeTela(n))) achados.push({ texto: n.text, arq: rel, linha: 0, ctx: contexto(n, sf, rel), modelo: ehModelo });
    } else if (ts.isTemplateExpression(n)) {
      const cru = n.getText(sf).slice(1, -1);
      if (!semMontagens && !ok(n) && temTextoPt(cru) && !foraDeTela(n)) montagens.push({ arq: rel, linha: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, trecho: cru.slice(0, 110), tipo: 'template' });
    } else if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const lados = [n.left, n.right];
      const lit = lados.find((x) => ts.isStringLiteral(x) && /[A-Za-zÀ-ÿ]{2,}/.test(x.text) && / /.test(x.text));
      if (!semMontagens && !ok(n) && lit && !(ts.isBinaryExpression(n.parent) && n.parent.operatorToken.kind === ts.SyntaxKind.PlusToken) && !foraDeTela(n))
        montagens.push({ arq: rel, linha: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, trecho: n.getText(sf).replace(/\s+/g, ' ').slice(0, 110), tipo: 'concatenação' });
    } else if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'replace') {
      const a0 = n.arguments[0];
      const alvo = a0 && (ts.isStringLiteral(a0) ? a0.text : ts.isRegularExpressionLiteral(a0) ? a0.text : '');
      if (alvo && /\\?\{[A-Za-z]/.test(alvo) && !/JOGADOR|RIVAL/.test(alvo))
        montagens.push({ arq: rel, linha: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, trecho: n.getText(sf).replace(/\s+/g, ' ').slice(0, 110), tipo: '.replace de marcador' });
    }
    ts.forEachChild(n, visitar);
  };
  visitar(sf);
}

for (const f of arquivos(join(RAIZ, 'src'))) varrer(f);
// o "quem" das falas, os nomes de NPC etc. são texto de tela; nomes de criatura nunca

/* ------------------------------ monta o catálogo ------------------------------ */
const antigos = new Map<Area, Catalogo>(); for (const a of AREAS) antigos.set(a, lerArea(a));
const traducao = new Map<string, { en: string; obs?: string }>();
for (const c of antigos.values()) for (const [k, v] of Object.entries(c)) if (v.en) traducao.set(k, { en: v.en, obs: v.obs });
const orfasArq = join(PASTA_EN, '_orfas.json');
const orfas: Catalogo = existsSync(orfasArq) ? JSON.parse(readFileSync(orfasArq, 'utf8')) : {};
for (const [k, v] of Object.entries(orfas)) if (v.en && !traducao.has(k)) traducao.set(k, { en: v.en, obs: v.obs });

/** onde cada texto mora: a área em que já estava (para não embaralhar o trabalho de quem traduz) ou a de maior prioridade */
const ondeEstava = new Map<string, Area>();
for (const [a, c] of antigos) for (const k of Object.keys(c)) if (!ondeEstava.has(k)) ondeEstava.set(k, a);
const porTexto = new Map<string, Achado[]>();
for (const x of achados) { const l = porTexto.get(x.texto) ?? []; l.push(x); porTexto.set(x.texto, l); }
const novos = new Map<Area, Catalogo>(); for (const a of AREAS) novos.set(a, {});
for (const [txt, lista] of porTexto) {
  const areas = lista.map((x) => areaDe(x.arq)!).sort((a, b) => AREAS.indexOf(a) - AREAS.indexOf(b));
  const a = ondeEstava.get(txt) ?? areas[0];
  const ctx = [...new Set(lista.map((x) => x.ctx))];
  const t = traducao.get(txt);
  novos.get(a)![txt] = { en: t?.en ?? '', ctx: ctx.slice(0, 3).join(' | ') + (ctx.length > 3 ? ` | +${ctx.length - 3}` : ''), ...(t?.obs ? { obs: t.obs } : {}) };
}
// traduções que perderam a entrada vão para _orfas.json
const novasOrfas: Catalogo = {};
for (const [k, v] of traducao) if (!porTexto.has(k)) novasOrfas[k] = { en: v.en, ctx: 'sumiu do código', ...(v.obs ? { obs: v.obs } : {}) };

console.log('Catálogo EN (src/i18n/en/):');
let tE = 0, tP = 0, tT = 0;
for (const a of AREAS) {
  const c = novos.get(a)!, ks = Object.keys(c), feitas = ks.filter((k) => c[k].en).length, pal = ks.reduce((s, k) => s + palavras(k), 0);
  tE += ks.length; tP += pal; tT += feitas;
  console.log(`  ${(a + '.json').padEnd(16)} ${String(ks.length).padStart(5)} entradas · ${String(pal).padStart(6)} palavras · ${feitas} traduzidas`);
}
console.log(`  ${'total'.padEnd(16)} ${String(tE).padStart(5)} entradas · ${String(tP).padStart(6)} palavras · ${tT} traduzidas`);
if (Object.keys(novasOrfas).length) console.log(`  ${Object.keys(novasOrfas).length} tradução(ões) sem entrada no código → src/i18n/en/_orfas.json`);
console.log(`\nMontagens com texto em português fora de tr(): ${montagens.length}`);
for (const m of MOSTRAR ? montagens : montagens.slice(0, 15)) console.log(`  ${m.arq}:${m.linha} [${m.tipo}] ${m.trecho}`);
if (!MOSTRAR && montagens.length > 15) console.log(`  … e mais ${montagens.length - 15} (use --montagens)`);

if (!SECO) {
  mkdirSync(PASTA_EN, { recursive: true });
  for (const a of AREAS) gravarArea(a, novos.get(a)!);
  if (Object.keys(novasOrfas).length) writeFileSync(orfasArq, JSON.stringify(novasOrfas, null, 1) + '\n');
  else if (existsSync(orfasArq)) writeFileSync(orfasArq, '{}\n');
  writeFileSync(join(PASTA_EN, '_montagens.txt'), montagens.map((m) => `${m.arq}:${m.linha} [${m.tipo}] ${m.trecho}`).join('\n') + '\n');
}
