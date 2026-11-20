/**
 * Missões dos VISITANTES (spec 6.5): os dois lendários secretos do pós-jogo, fora das 180 do Diário.
 *
 * 181 GALO-MANAÓ — "O Encontro das Águas" (16 insígnias):
 *   Seu Tarumã, canoeiro do Amazonas, no cais de Porto Sereia (A4) → dá 2 Frascos Vazios (`ea-missao`) → água escura
 *   colhida de noite com Mergulho no Poço do Breu (A-R6) (`ea-frasco-escuro`) e água barrenta colhida de dia no poço da
 *   cascata seca da Estrada Vermelha (B-R2, só se chega com Cachoeira) (`ea-frasco-barrento`) — pontos de colheita em
 *   src/world/mecanicas/x-ea.ts → entrega dos frascos (`ea-rota`) → canoa até a zona X-EA (exige Remo) → quebra-cabeça
 *   de correnteza e dança de corte (mecânica) → `vis-galo-batalha` (nv 60, taxa de captura 3). Capturado: `galo-manao-ok`.
 *   Enquanto o jogador não tiver um Galo-Manaó (soltou, derrotou, fugiu), ele volta a dançar na ilhota.
 *
 * 182 BOREALCE — "A Expedição Boreal" (depois de `conselho-vencido`):
 *   navio de pesquisa encalhado no cais de Porto Pantaneiro (B9, desenhado aqui por cima do mapa) e a Drª Solveig
 *   (`boreal-missao`) → 4 Lanternas Boreais, cada uma com um pesquisador da expedição (treinadores B-EXP-1..4, Geada
 *   nv 66–70; `boreal-lanterna-1..4`) em B7, B-SG, B-LG e B-R5 → acender no alto do Pico Pindorama, de noite
 *   (`vis-pico-aurora`, aurora em camada própria) → Borealce nv 65 (`boreal-acesa`, `borealce-ok`). Reencontro igual ao 181.
 *   As zonas geladas e o Pico são de outros times e podem ainda não existir: os NPCs e o ponto do Pico ficam definidos
 *   AQUI por coordenada (`PONTOS_VISITANTES`) e entram na zona em memória quando ela existir (o arquivo da zona não muda).
 *
 * Flags: docs/HISTORIA.md (linhas "missões dos visitantes"). Diário da missão: docs/VISITANTES.md.
 */
import type { EventoDef, Comando, NpcDef, Gatilho, ZonaDef } from '../../core/tipos';
import { jogo, flag, setFlag, periodo, qtdItem } from '../../core/estado';
import { bus } from '../../core/events';
import { registrarComando } from '../../world/registro';
import { registrarEspecies } from '../../battle/criatura';
import { VISITANTES } from '../criaturas';
import './comuns';

/* o módulo de batalha só registra as 180 (src/battle/index.ts): os visitantes entram aqui */
registrarEspecies(VISITANTES);

/* ------------------------------ comandos ------------------------------ */
/** o jogador tem (equipe ou Viveiro) uma criatura desta espécie que não seja ovo? */
const possui = (n: number) => {
  const s = jogo.save, ok = (c: { especie: number; ovo?: number } | null) => !!c && c.especie === n && !c.ovo;
  return s.equipe.some(ok) || s.viveiro.some((cx) => cx.some(ok));
};
/** ['vis-estado'] → flags derivadas: `vis-tem-galo`, `vis-tem-borealce`, `vis-frascos` (os dois cheios), `vis-lanternas` (as 4), `vis-noite` */
registrarComando('vis-estado', () => {
  setFlag('vis-tem-galo', possui(181));
  setFlag('vis-tem-borealce', possui(182));
  setFlag('vis-frascos', qtdItem('frasco-agua-escura') > 0 && qtdItem('frasco-agua-barrenta') > 0);
  setFlag('vis-lanternas', [1, 2, 3, 4].every((n) => !!flag(`boreal-lanterna-${n}`)));
  setFlag('vis-n-lanternas', [1, 2, 3, 4].filter((n) => !!flag(`boreal-lanterna-${n}`)).length);
  setFlag('vis-noite', periodo() === 'noite');
});
/**
 * ['vis-lendario', especie, nivel, arena?, musica?] — encontro lendário com arena/música escolhidas. Resultado em
 * `vis-capturou` / `vis-venceu` / `vis-fugiu` / `vis-perdeu` (a derrota já leva ao Posto pelo motor).
 */
registrarComando('vis-lendario', async ([e, nv, arena, mus]) => {
  const [{ lutar }, { criarCriatura }, { M }] = await Promise.all([import('../../world/encontros'), import('../../world/deps'), import('../../world/vivo')]);
  const r = await lutar({ tipo: 'lendario', inimigos: [criarCriatura(Number(e), Number(nv))], arena: String(arena ?? M.zv.def.arena), clima: M.zv.def.clima, musica: mus ? String(mus) : undefined });
  setFlag('ultima-batalha', r.resultado);
  setFlag('vis-capturou', r.resultado === 'captura'); setFlag('vis-venceu', r.resultado === 'vitoria');
  setFlag('vis-fugiu', r.resultado === 'fuga'); setFlag('vis-perdeu', r.resultado === 'derrota');
});

/* ------------------------------ navio, lanternas e aurora (camadas próprias, DOM/CSS) ------------------------------ */
/** desenho à mão por retângulos numa grade de caracteres (w × h) */
function grade(w: number, h: number, rets: [number, number, number, number, string][]): string[] {
  const g = Array.from({ length: h }, () => Array.from({ length: w }, () => '.'));
  for (const [x, y, rw, rh, c] of rets) for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) if (y + j < h && x + i < w && y + j >= 0 && x + i >= 0) g[y + j][x + i] = c;
  return g.map((l) => l.join(''));
}
/** navio de pesquisa polar (casco vermelho, ponte branca, flâmula azul de cruz branca), encalhado e meio adernado */
const NAVIO = grade(56, 34, [
  [27, 0, 1, 12, 'm'], [28, 1, 7, 4, 'B'], [30, 1, 1, 4, 'w'], [28, 2, 7, 1, 'w'],
  [18, 10, 16, 4, 'k'], [19, 11, 14, 2, 'g'], [20, 11, 2, 1, 'b'], [24, 11, 2, 1, 'b'], [28, 11, 2, 1, 'b'],
  [12, 14, 28, 6, 'k'], [13, 15, 26, 4, 'w'], [14, 16, 3, 2, 'b'], [19, 16, 3, 2, 'b'], [24, 16, 3, 2, 'b'], [29, 16, 3, 2, 'b'], [34, 16, 3, 2, 'b'],
  [40, 15, 3, 5, 'k'], [41, 16, 1, 4, 'y'],
  [2, 20, 52, 1, 'k'], [3, 21, 50, 4, 'r'], [3, 21, 50, 1, 'w'], [4, 25, 48, 3, 'R'], [6, 28, 44, 2, 'R'], [2, 20, 1, 6, 'k'], [53, 20, 1, 6, 'k'],
  [3, 25, 1, 3, 'k'], [52, 25, 1, 3, 'k'], [5, 28, 1, 2, 'k'], [50, 28, 1, 2, 'k'], [6, 30, 44, 1, 'k'],
  [8, 22, 10, 1, 'Y'], [38, 22, 10, 1, 'Y'],
  [0, 30, 56, 1, 'a'], [1, 31, 54, 1, 'A'], [4, 32, 48, 1, 'a'], [10, 33, 36, 1, 'A'],
]);
const PAL_NAVIO = { m: '#5a4a3a', B: '#2f5fa8', w: '#f4f6f8', k: '#1a1423', g: '#9aa6b8', b: '#2a4a7a', y: '#f9c22b', r: '#c8323e', R: '#7a1e2a', Y: '#fff07a', a: '#cfe8f0', A: '#8fc4d4' };
const LANTERNA = [['..kk..', '.kyyk.', 'kgGGgk', 'kGwwGk', 'kgGGgk', '.kkkk.']];
const PAL_LANTERNA = { k: '#1a1423', y: '#c98f4e', g: '#2fa87a', G: '#6ff0b8', w: '#e8fff4' };

/** colunas de altura variável (cortina de aurora) num SVG de 160×72, em pixels inteiros; `cume` = tabela periódica de alturas */
function cortina(cume: number[], cores: [string, string, string]): string {
  const W = 160, H = 72, n = cume.length;
  let r = '';
  for (let x = 0; x < W; x += 2) {
    const t = (x / W) * n, i = Math.floor(t), f = t - i;
    const alto = Math.round(cume[i % n] * (1 - f) + cume[(i + 1) % n] * f), baixo = alto + 26 + ((x * 7) % 5);
    r += `<rect x='${x}' y='${alto}' width='2' height='6' fill='${cores[0]}'/>`;
    r += `<rect x='${x}' y='${alto + 6}' width='2' height='${baixo - alto - 10}' fill='${cores[1]}'/>`;
    r += `<rect x='${x}' y='${baixo - 4}' width='2' height='4' fill='${cores[2]}'/>`;
  }
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' shape-rendering='crispEdges'>${r}</svg>`)}")`;
}
let estiloAurora = false;
function estilo() {
  if (estiloAurora) return; estiloAurora = true;
  const s = document.createElement('style');
  s.textContent = `
.vis-aurora{position:absolute;left:0;top:0;width:320px;height:180px;pointer-events:none;overflow:hidden}
.vis-aurora .ceu{position:absolute;inset:0;background:linear-gradient(#06102a 0 14%,#0a1838 14% 24%,#0e1f44 24% 31%,rgba(14,31,68,.55) 31% 36%,rgba(14,31,68,.25) 36% 40%,transparent 40%);opacity:.7}
.vis-aurora .faixa{position:absolute;left:0;width:320px;height:72px;background-repeat:repeat-x;mix-blend-mode:screen;image-rendering:pixelated}
.vis-aurora .f1{top:2px;animation:vis-a1 9s steps(40) infinite,vis-pulso 3.2s steps(4) infinite alternate}
.vis-aurora .f2{top:14px;animation:vis-a2 14s steps(40) infinite reverse,vis-pulso 4.4s steps(4) infinite alternate-reverse}
.vis-aurora .f3{top:-6px;animation:vis-a1 21s steps(40) infinite,vis-pulso 2.6s steps(3) infinite alternate}
.vis-aurora .estrela{position:absolute;width:1px;height:1px;background:#fff8e7;animation:vis-pisca 1.6s steps(2) infinite}
.vis-aurora.nascendo{animation:vis-nasce 3s steps(6) both}
@keyframes vis-a1{from{background-position-x:0}to{background-position-x:160px}}
@keyframes vis-a2{from{background-position-x:0}to{background-position-x:-160px}}
@keyframes vis-pulso{from{opacity:.55}to{opacity:.95}}
@keyframes vis-pisca{0%{opacity:1}100%{opacity:.2}}
@keyframes vis-nasce{from{opacity:0}to{opacity:1}}`;
  document.head.append(s);
}
const ESTRELAS: [number, number][] = [[12, 6], [37, 19], [58, 4], [83, 27], [101, 9], [126, 22], [149, 3], [171, 15], [196, 7], [213, 30], [238, 12], [257, 4], [279, 24], [301, 10], [16, 38], [142, 41], [266, 44]];
let aurora: HTMLElement | null = null;
/** liga a camada da aurora sobre o mapa (abaixo da interface); `nascer` = surge aos poucos */
export async function mostrarAurora(nascer = false) {
  if (typeof document === 'undefined') return;
  const { M } = await import('../../world/vivo');
  if (!M.cena?.el) return;
  estilo(); aurora?.remove();
  const a = document.createElement('div'); a.className = 'vis-aurora' + (nascer ? ' nascendo' : ''); a.dataset.visAurora = '1';
  a.innerHTML = `<div class="ceu"></div>${ESTRELAS.map(([x, y]) => `<i class="estrela" style="left:${x}px;top:${y}px;animation-delay:${(x % 7) * 0.2}s"></i>`).join('')}`;
  const faixa = (classe: string, img: string) => { const f = document.createElement('div'); f.className = 'faixa ' + classe; f.style.backgroundImage = img; a.append(f); };
  faixa('f3', cortina([14, 6, 10, 2, 8, 12, 4, 9], ['#3a2a7a', '#5a3ab0', '#8a6ae0']));
  faixa('f1', cortina([10, 2, 6, 14, 4, 8, 0, 12], ['#9a5fc4', '#3fd08a', '#c8fff0']));
  faixa('f2', cortina([4, 12, 2, 8, 14, 6, 10, 3], ['#5fc4e0', '#2fa87a', '#e0fff4']));
  const cam = M.cena.el.firstElementChild;
  M.cena.el.insertBefore(a, cam ? cam.nextSibling : null);
  aurora = a;
}
export function esconderAurora() { aurora?.remove(); aurora = null; }

let navio: HTMLElement | null = null;
async function desenharNavio() {
  const [{ M }, { Pix }] = await Promise.all([import('../../world/vivo'), import('../../world/pixel')]);
  navio?.remove(); navio = null;
  if (!M.cena?.sprites) return;
  const p = new Pix([NAVIO], PAL_NAVIO, M.cena.sprites);
  p.pos(NAVIO_B9[0] * 16 - 4, NAVIO_B9[1] * 16 - 18, NAVIO_B9[1] * 16 + 8);
  p.el.style.transform += ' rotate(-3deg)';
  navio = p.el;
}
/** canto superior esquerdo (tile) do navio encalhado em B9: na ponta do cais leste, sobre a água */
const NAVIO_B9: [number, number] = [32, 26];

/* ------------------------------ NPCs e pontos por coordenada (zonas de outros times) ------------------------------ */
/**
 * Entram em memória na zona quando ela existe (o arquivo da zona não muda; assim os verificadores de cada time, que só
 * conhecem os próprios eventos, não acusam script de fora). Se o tile proposto não for chão livre,
 * o NPC vai para o chão livre mais próximo (busca em anel, determinística). As zonas B7/B-SG/B-LG/B-R5/PP são dos
 * times B2 (escolhidas nas grades de 20/11): o time dono pode trocar o número AQUI, ou pôr o NPC no próprio arquivo com
 * o mesmo id (aí este não é acrescentado).
 */
export const PONTOS_VISITANTES: { zona: string; npc?: NpcDef; gatilho?: Gatilho }[] = [
  // canoeiro Seu Tarumã no cais de Porto Sereia (praia ao lado do píer) e a Drª Solveig no cais de Porto Pantaneiro
  { zona: 'A4', npc: { id: 'vis-taruma', sprite: 'seu-taruma', x: 32, y: 38, dir: 'o', script: 'vis-canoeiro' } },
  { zona: 'B9', npc: { id: 'vis-solveig', sprite: 'dra-solveig', x: 30, y: 24, dir: 's', se: 'flag:conselho-vencido', script: 'vis-solveig' } },
  // os quatro pesquisadores da expedição (só depois de falar com a Drª Solveig)
  { zona: 'B7', npc: { id: 'vis-exp-1', sprite: 'pesquisador-boreal', x: 30, y: 6, dir: 's', se: 'flag:boreal-missao', script: 'vis-lanterna-1' } },
  { zona: 'B-SG', npc: { id: 'vis-exp-2', sprite: 'pesquisador-boreal', x: 30, y: 16, dir: 's', se: 'flag:boreal-missao', script: 'vis-lanterna-2' } },
  { zona: 'B-LG', npc: { id: 'vis-exp-3', sprite: 'pesquisador-boreal', x: 44, y: 19, dir: 'o', se: 'flag:boreal-missao', script: 'vis-lanterna-3' } },
  { zona: 'B-R5', npc: { id: 'vis-exp-4', sprite: 'pesquisador-boreal', x: 32, y: 6, dir: 's', se: 'flag:boreal-missao', script: 'vis-lanterna-4' } },
  // "Pedra das Lanternas" reservada pelo B2-norte no Cume do PP (tiles 8..11, 3..6; docs/ZONAS-B2-NORTE.md): gatilho noturno
  { zona: 'PP', gatilho: { x: 9, y: 4, w: 2, h: 2, script: 'vis-pico-aurora', se: 'flag:boreal-missao&periodo:noite' } },
];
const LIVRE = new Set('.,:;"%=+');
function chaoLivre(z: ZonaDef, x: number, y: number, ocupados: Set<string>): [number, number] | null {
  const h = z.mapaChars.length, w = z.mapaChars[0]?.length ?? 0;
  const ok = (a: number, b: number) => a > 0 && b > 0 && a < w - 1 && b < h - 1 && LIVRE.has(z.mapaChars[b][a]) && !ocupados.has(a + ',' + b) && !(z.warps ?? []).some((q) => q.x === a && q.y === b);
  for (let r = 0; r <= 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    if (ok(x + dx, y + dy)) return [x + dx, y + dy];
  }
  return null;
}
const encaixados = new Set<string>();
/** acrescenta os NPCs/gatilhos das missões às zonas que já existem (uma vez por zona) */
export async function encaixar(): Promise<string[]> {
  const { zonaDef } = await import('../../world/zonas');
  const feitos: string[] = [];
  for (const p of PONTOS_VISITANTES) {
    const z = zonaDef(p.zona), chave = p.zona + ':' + (p.npc?.id ?? p.gatilho?.script);
    if (!z || encaixados.has(chave)) continue;
    encaixados.add(chave);
    const ocupados = new Set([...(z.npcs ?? []).map((n) => n.x + ',' + n.y), ...(z.objetos ?? []).map((o) => o.x + ',' + o.y)]);
    if (p.npc && !(z.npcs ?? []).some((n) => n.id === p.npc!.id)) {
      const pos = chaoLivre(z, p.npc.x, p.npc.y, ocupados); if (!pos) continue;
      (z.npcs ??= []).push({ ...p.npc, x: pos[0], y: pos[1] }); feitos.push(chave);
    }
    if (p.gatilho && !(z.gatilhos ?? []).some((g) => g.script === p.gatilho!.script)) {
      const pos = chaoLivre(z, p.gatilho.x, p.gatilho.y, new Set()); if (!pos) continue;
      (z.gatilhos ??= []).push({ ...p.gatilho, x: pos[0], y: pos[1] }); feitos.push(chave);
    }
  }
  return feitos;
}

if (typeof document !== 'undefined') bus.on('zona', (e: unknown) => {
  const id = (e as { id?: string } | undefined)?.id;
  void (async () => {
    const novos = await encaixar();
    if (novos.some((k) => k.startsWith(id + ':'))) { const { sincronizarNpcs } = await import('../../world/npcs'); sincronizarNpcs(); }
    navio?.remove(); navio = null; esconderAurora();
    if (id === 'B9' && flag('conselho-vencido')) await desenharNavio();
    if (id === 'PP' && flag('boreal-acesa') && periodo() === 'noite') await mostrarAurora();
  })();
});

/** ['vis-acender'] — cinemática do acendimento: quatro lanternas em volta do jogador, aurora e o Borealce descendo */
registrarComando('vis-acender', async () => {
  const [{ M, quadros, sfx }, { Pix }, { Ator }] = await Promise.all([import('../../world/vivo'), import('../../world/pixel'), import('../../world/ator')]);
  const j = M.jog, luzes: InstanceType<typeof Pix>[] = [];
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const l = new Pix(LANTERNA, PAL_LANTERNA, M.cena.sprites);
    l.pos((j.x + dx) * 16 + 5, (j.y + dy) * 16 + 6, (j.y + dy) * 16 + 15);
    l.el.style.filter = 'drop-shadow(0 0 3px #6ff0b8)';
    luzes.push(l); sfx('item-obtido'); await quadros(24);
  }
  await mostrarAurora(true); sfx('lendario-aparece'); M.cena.tremer(20); await quadros(120);
  const b = new Ator('c:borealce', M.cena.sprites, j.x, Math.max(1, j.y - 4), 's'); M.extras.push(b);
  b.spr.opacidade = 0;
  await quadros(40, (i) => { b.spr.opacidade = i / 40; });
  for (let k = 0; k < 3; k++) await b.mover('s', 22);
  b.emote('!', 40); await quadros(40);
  setTimeout(() => { b.remover(); for (const l of luzes) l.remover(); }, 1500);
});

/* ------------------------------ roteiros ------------------------------ */
const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const f = (quem: unknown, texto: string): Comando => ['falar', quem, texto];
const TARUMA = { nome: 'Seu Tarumã', retrato: 'seu-taruma' };
const SOLVEIG = { nome: 'Drª Solveig', retrato: 'dra-solveig' };

const lanterna = (n: number, onde: string): EventoDef => ({
  id: `vis-lanterna-${n}`,
  passos: [
    se(`flag:boreal-lanterna-${n}`, [f(null, n === 4 ? 'O navegador confere a bússola e aponta para o alto da serra: o Pico Pindorama.' : 'O pesquisador da expedição anota alguma coisa num caderno molhado de neve e acena para você.')], [
      f(null, `Um pesquisador da expedição da Drª Solveig guarda uma Lanterna Boreal ${onde}.`),
      ['batalha', `B-EXP-${n}`],
      ['dar', 'lanterna-boreal', 1],
      ['flag', `boreal-lanterna-${n}`],
      ['vis-estado'],
      se('flag:vis-lanternas', [f(null, 'As quatro Lanternas Boreais estão na mochila! O vidro verde brilha sozinho quando sopra o vento frio.\fAgora é subir ao alto do Pico Pindorama, de noite, e acendê-las.')],
        [f(null, 'Mais uma Lanterna Boreal! Faltam as dos outros pesquisadores, espalhados pelas terras geladas da serra.')]),
    ]),
  ],
});

export const EVENTOS_VISITANTES: EventoDef[] = [
  /* ============================== 181 · O ENCONTRO DAS ÁGUAS ============================== */
  {
    id: 'vis-canoeiro',
    passos: [
      ['vis-estado'],
      se('!insignias:16', [
        f(TARUMA, 'Eu sou o Tarumã, canoeiro lá do Amazonas. Desci o rio atrás de uma história e vim parar neste porto.\fLá na minha terra tem um lugar onde um rio preto e um rio barrento correm lado a lado e não se misturam. E tem uma ave que só dança ali.'),
        f(TARUMA, 'Mas essa ave não dança para quem ainda está de passagem. Quando você tiver as dezesseis insígnias de Pindorama, volte para conversar.'),
      ], [
        se('!flag:ea-missao', [
          f(TARUMA, 'Dezesseis insígnias! Então você já remou, mergulhou e subiu cascata por esta terra inteira. É de você que eu preciso.'),
          f(TARUMA, 'Escute: a ave que eu procuro é o Galo-Manaó. Metade das penas é escura como o rio Negro, metade é cor de areia como o Solimões, e as duas metades nunca se misturam.\fEle só dança onde duas águas correm juntas. Eu sei abrir esse caminho, mas preciso de duas águas para chamar o encontro.'),
          f(TARUMA, 'Uma água ESCURA, colhida de NOITE no fundo de um rio daqui da Costa do Sol. O Poço do Breu, no fim do Rio Cachoeira-Véu, perto de Serra Fumaça. Tem que mergulhar.\fE uma água BARRENTA, colhida de DIA num rio do Sertão. O poço da cascata seca da Estrada Vermelha, perto de Porto Pantaneiro. Tem que subir a cascata.'),
          ['dar', 'frasco-vazio', 2],
          ['flag', 'ea-missao'],
          f(TARUMA, 'Dois frascos de vidro grosso, com rolha de cortiça. Encha um em cada poço e traga para mim, aqui no cais.'),
        ], [
          se('!flag:ea-rota', [
            se('flag:vis-frascos', [
              f(TARUMA, 'As duas águas! Deixe eu ver contra a luz… Escura como café de coador, e barrenta como café com leite. É isso mesmo.'),
              ['tirar', 'frasco-agua-escura', 1], ['tirar', 'frasco-agua-barrenta', 1],
              ['sfx', 'mergulho'], ['tremor', 400],
              f(null, 'Seu Tarumã despeja os dois frascos na água do porto, um de cada lado da canoa.\fA água escura escorre para a esquerda, a barrenta para a direita… e entre elas se abre uma linha fina, reta como um fio esticado.'),
              ['flag', 'ea-rota'],
              f(TARUMA, 'O encontro respondeu. Agora eu sei o caminho até a ilhota onde o galo dança. Lá a canoa é sua: reme sempre em cima da linha onde as águas se encontram.\fSe escapar para um lado só, a correnteza leva você de volta. E quando o galo dançar, nem respire.'),
            ], [
              f(TARUMA, 'Ainda faltam águas. Lembre: a ESCURA é de noite, no Poço do Breu, no fim do Rio Cachoeira-Véu, com Mergulho.\fA BARRENTA é de dia, no poço da cascata seca da Estrada Vermelha, no Sertão, subindo a cascata.'),
              se('!item:frasco-vazio', [se('!flag:ea-frasco-escuro|!flag:ea-frasco-barrento', [f(TARUMA, 'Quebrou um frasco? Tome outro. Vidro é que nem promessa: tem que levar com cuidado.'), ['dar', 'frasco-vazio', 1]])]),
            ]),
          ]),
          se('flag:ea-rota', [
            se('flag:galo-manao-ok&flag:vis-tem-galo', [f(TARUMA, 'O Galo-Manaó viajando com você! Lá no Amazonas ninguém vai acreditar. Vou ter que levar você para contar a história.')]),
            se('!amuleto:remo', [f(TARUMA, 'Sem o Amuleto do Remo não adianta: no Encontro das Águas quem rema é você.')], [
              ['simnao', 'Vamos para o Encontro das Águas?', 'vis-ir'],
              se('flag:vis-ir', [
                f(TARUMA, 'Segura firme! Daqui até lá é rio que não acaba mais.'),
                ['sfx', 'remo'], ['fade', 'fora'], ['warp', 'X-EA', 18, 45, 'n'], ['fade', 'dentro'],
                f(TARUMA, 'Chegamos. Olhe a água: preta de um lado, barrenta do outro. A ilhota fica lá no norte.\fQuando quiser voltar, fale comigo aqui na praia.'),
              ], [f(TARUMA, 'Quando quiser, é só falar. O rio espera.')]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'vis-taruma-volta',
    passos: [
      ['simnao', 'Voltar para Porto Sereia na canoa do Seu Tarumã?', 'vis-voltar'],
      se('flag:vis-voltar', [
        ['sfx', 'remo'], ['fade', 'fora'], ['warp', 'A4', 31, 38, 'l'], ['fade', 'dentro'],
        f(TARUMA, 'Porto Sereia! Quando quiser voltar ao encontro, é só falar comigo.'),
      ], [f(TARUMA, 'Pode ir. A canoa espera, e eu fico aqui contando boto.')]),
    ],
  },
  {
    id: 'vis-galo-batalha',
    passos: [
      ['grito', 181], ['tremor', 500],
      f(null, 'O GALO-MANAÓ desce da crista de pedra para lutar!'),
      ['vis-lendario', 181, 60, 'mata'],
      se('flag:vis-capturou', [
        ['flag', 'galo-manao-ok'],
        f(null, 'O Galo-Manaó se aquietou na cuia. Por um instante, a água escura e a barrenta brilharam juntas em volta da ilhota.'),
      ]),
      se('flag:vis-venceu', [f(null, 'O Galo-Manaó bate as asas e some sobre a mata. Ele vai voltar a dançar na ilhota outra vez.')]),
      se('flag:vis-fugiu', [f(null, 'Você se afastou. O Galo-Manaó sacode as penas e volta para o alto da pedra.')]),
    ],
  },

  /* ============================== 182 · A EXPEDIÇÃO BOREAL ============================== */
  {
    id: 'vis-solveig',
    passos: [
      ['vis-estado'],
      se('!flag:boreal-missao', [
        f(SOLVEIG, 'Olá! Desculpe a bagunça: o nosso navio encalhou no banco de areia na noite em que chegamos. Eu sou a Drª Solveig, chefe desta expedição de pesquisa.\fViemos de muito ao norte, de onde o inverno dura meio ano, estudando um animal que nunca tinha saído das nossas montanhas.'),
        f(SOLVEIG, 'É um alce, mas não um alce qualquer: quando a noite esfria, a galhada dele acende em faixas verdes e violeta, como a aurora boreal. Nós o chamamos de Borealce.\fNo calor do porto ele ficou inquieto… e uma noite pulou do convés e subiu a serra atrás de frio.'),
        f(SOLVEIG, 'Ele só se acalma debaixo da aurora. Aqui não existe aurora, mas trouxemos quatro Lanternas Boreais que imitam a luz dela, e os meus pesquisadores subiram a serra com elas.\fTraga as quatro, acenda-as no lugar mais alto e mais frio desta terra, de noite, e ele vai aparecer.'),
        f(SOLVEIG, 'A Ingrid está em Serra da Geada, o Halvard nos Campos de Altitude, a Sigrid na Lagoa Gelada e o Eirik no Caminho das Névoas.\fSó que eles prometeram entregar as lanternas apenas a quem vencesse uma batalha. Pesquisador do norte é teimoso.'),
        ['flag', 'boreal-missao'],
      ], [
        se('flag:borealce-ok&flag:vis-tem-borealce', [
          f(SOLVEIG, 'Ele está com você, e calmo! Eu escrevi uma nota no seu Diário de Campo, na página dos Visitantes: o Borealce não é da fauna daqui, é um visitante do norte.\fCuide dele com frio, sombra e água gelada. E, de vez em quando, olhe para o céu com ele.'),
          ['flag', 'borealce-nota'],
        ], [
          se('flag:boreal-acesa', [f(SOLVEIG, 'Você acendeu as lanternas no Pico! Se ele fugiu, volte lá de noite: debaixo da aurora ele sempre reaparece.')], [
            se('flag:vis-lanternas', [f(SOLVEIG, 'As quatro lanternas! Agora suba ao alto do Pico Pindorama, de noite, e acenda todas juntas. Eu fico aqui, tentando desencalhar o navio.')], [
              f(SOLVEIG, 'Ainda faltam lanternas. Os meus pesquisadores só entregam a quem vence uma batalha com eles.'),
              se('!flag:boreal-lanterna-1', [f(SOLVEIG, 'A da Ingrid, em Serra da Geada.')]),
              se('!flag:boreal-lanterna-2', [f(SOLVEIG, 'A do Halvard, nos Campos de Altitude.')]),
              se('!flag:boreal-lanterna-3', [f(SOLVEIG, 'A da Sigrid, na Lagoa Gelada.')]),
              se('!flag:boreal-lanterna-4', [f(SOLVEIG, 'A do Eirik, no Caminho das Névoas.')]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
  lanterna(1, 'no alto de Serra da Geada'),
  lanterna(2, 'nos Campos de Altitude'),
  lanterna(3, 'na beira da Lagoa Gelada'),
  lanterna(4, 'no Caminho das Névoas'),
  {
    id: 'vis-pico-aurora',
    passos: [
      ['vis-estado'],
      se('!flag:vis-noite', [f(null, 'O alto do Pico Pindorama. Daqui se vê o mar da Costa do Sol de um lado e o Sertão das Névoas do outro.\fA Drª Solveig disse que as lanternas só fazem efeito de noite.')], [
        se('flag:boreal-acesa', [
          se('!flag:vis-tem-borealce', [
            f(null, 'Debaixo da aurora, uma galhada acende entre as nuvens. O Borealce voltou!'),
            ['vis-acender'], ['chamar', 'vis-borealce-batalha'],
          ], [f(null, 'A aurora dança sobre o Pico. O Borealce, na cuia, parece sonhar com ela.')]),
        ], [
          se('!flag:vis-lanternas', [f(null, 'Um platô de pedra fria, varrido pelo vento. Seria o lugar certo para as Lanternas Boreais da Drª Solveig, mas ainda não há quatro na mochila.')], [
            f(null, 'Lá no alto, o vento de serra assobia frio. {JOGADOR} põe as quatro Lanternas Boreais sobre a pedra, uma em cada canto.\fUma a uma, elas acendem em verde.'),
            ['vis-acender'],
            ['tirar', 'lanterna-boreal', 4], ['flag', 'boreal-acesa'],
            f(null, 'O céu do Pico se rasga em faixas verdes e violeta: uma aurora boreal, em plena Pindorama!\fDescendo das nuvens, com a galhada acesa como a própria aurora, vem o BOREALCE!'),
            ['chamar', 'vis-borealce-batalha'],
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'vis-borealce-batalha',
    passos: [
      ['grito', 182],
      ['vis-lendario', 182, 65, 'geada'],
      se('flag:vis-capturou', [
        ['flag', 'borealce-ok'],
        f(null, 'O Borealce entrou na cuia. Lá no alto, a aurora ainda brilhou um pouco, como quem se despede.\fA Drª Solveig vai querer saber disso, lá em Porto Pantaneiro.'),
      ]),
      se('flag:vis-venceu', [f(null, 'O Borealce recua para dentro das nuvens. Debaixo da aurora, ele vai voltar.')]),
      se('flag:vis-fugiu', [f(null, 'O Borealce sacode a galhada e fica olhando o céu. Ele continua por perto.')]),
    ],
  },
];
