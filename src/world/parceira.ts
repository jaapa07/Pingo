/**
 * CRIATURA QUE SEGUE (spec 10A, itens 40 e 42 — decisão do autor: opção liga/desliga `opcoes.parceiraSegue`).
 * Ligada: a 1ª criatura da equipe anda um tile atrás do jogador com o sprite `mapa` (vulto discreto se a espécie
 * ainda não tiver sprite), não bloqueia ninguém, some na bicicleta, no remo, no mergulho e em interiores pequenos,
 * solta balões de emoção, fala ao ser tocada conforme a amizade, dorme à noite quando o jogador fica parado e, a
 * cada ~1000 passos juntos ("Passos do Companheiro"), ganha amizade e acha um item. Desligada: nada disto acontece.
 */
import type { CriaturaInst, Dir } from '../core/tipos';
import { jogo, periodo, darItem, flag, setFlag } from '../core/estado';
import { rng, cosmetico } from '../core/rng';
import { bus } from '../core/events';
import { Ator } from './ator';
import { M, sfx } from './vivo';
import { falar, avisar, especie, nomeCriatura, nomeItem, item as itemDef } from './deps';
import { pixBrilho } from './pixel';
import { TILE } from '../core/tipos';

const PASSOS_ACHADO = 1000;
/** interiores com menos tiles que isto não têm espaço para a parceira */
const AREA_MINIMA = 150;
let dona = '', paradaT = 0, balaoT = 0, dormindo = false, brilhoT = 0;

/** a criatura que segue: a 1ª da equipe, se não for ovo nem estiver desmaiada */
export function parceiraAtual(): CriaturaInst | null {
  const c = jogo.save.equipe[0];
  return jogo.opcoes.parceiraSegue && c && !c.ovo && c.vida > 0 ? c : null;
}
const ehRara = (c: CriaturaInst) => { const x = c as CriaturaInst & { rara?: boolean; variante?: string }; return !!x.rara || x.variante === 'rara'; };
function cabeNaZona(): boolean {
  const z = M.zv.def;
  if (z.submerso) return false;
  return !['interior', 'ginasio'].includes(z.tipo) || M.zv.w * M.zv.h >= AREA_MINIMA;
}
function remover() { M.parceira?.remover(); M.parceira = null; dona = ''; dormindo = false; }
/** cria, troca ou remove o ator conforme a opção, a equipe e a zona (chamado a cada carga de zona e a cada quadro) */
export function sincronizarParceira(recriar = false) {
  const c = parceiraAtual(), chave = c && cabeNaZona() ? `${c.uid}:${c.especie}` : '';
  if (recriar && M.parceira) remover();
  if (chave === dona && (!!M.parceira || !chave)) return;
  const antes = M.parceira;
  const x = antes?.x ?? M.jog.x, y = antes?.y ?? M.jog.y, visivel = antes?.visivel ?? false;
  remover();
  if (!c || !chave) return;
  const a = new Ator('c:' + (especie(c.especie)?.id ?? 'especie-' + c.especie), M.cena.sprites, x, y, M.jog.dir);
  a.solido = false; a.balaoDy = 7; a.visivel = visivel && !(x === M.jog.x && y === M.jog.y);
  // sem sprite: o boneco de reserva vira um vulto discreto
  if (a.boneco) { a.boneco.el.style.opacity = '0.45'; a.boneco.el.style.filter = 'grayscale(1) brightness(0.55)'; }
  if (ehRara(c)) a.spr.el.style.filter = 'hue-rotate(150deg) saturate(1.35)';
  M.parceira = a; dona = chave; paradaT = 0; balaoT = 240 + Math.floor(cosmetico() * 300);
}
/** o jogador saiu de (ox, oy) num passo de `dur` quadros: a parceira ocupa o tile que ele deixou */
export function seguirParceira(ox: number, oy: number, dur: number) {
  const p = M.parceira; if (!p) return;
  paradaT = 0; acordar();
  const aPe = jogo.save.jogador.modo === 'pe', mesmo = ox === M.jog.x && oy === M.jog.y;
  if (!aPe || mesmo) { p.teleportar(ox, oy); p.visivel = false; return; }
  const dx = ox - p.x, dy = oy - p.y;
  if (!p.visivel || Math.abs(dx) + Math.abs(dy) !== 1) { p.teleportar(ox, oy); p.visivel = true; p.olharPara(M.jog.x, M.jog.y); return; }
  p.visivel = true;
  void p.mover((dx > 0 ? 'l' : dx < 0 ? 'o' : dy > 0 ? 's' : 'n') as Dir, dur);
}
/** esconde a parceira sobre o tile do jogador (saltos de script, embarque, escalada) */
export function recolherParceira(x = M.jog.x, y = M.jog.y) { const p = M.parceira; if (p) { p.teleportar(x, y); p.visivel = false; } }
function acordar() { if (dormindo) { dormindo = false; if (M.parceira) M.parceira.spr.vel = 1; } }

/* ------------------------------ Passos do Companheiro (item 42) ------------------------------ */
const ACHADOS: { id: string; peso: number; apos?: number }[] = [
  { id: 'pitanga', peso: 30 }, { id: 'caju', peso: 26 }, { id: 'cha-cidreira', peso: 22 }, { id: 'cuia-simples', peso: 18 },
  { id: 'jabuticaba', peso: 14, apos: 2 }, { id: 'acerola', peso: 12, apos: 2 }, { id: 'cuia-boa', peso: 10, apos: 3 },
  { id: 'acai', peso: 8, apos: 4 }, { id: 'pequi', peso: 8, apos: 5 }, { id: 'buriti', peso: 6, apos: 6 },
];
function sortearAchado(): string | null {
  const n = jogo.save.insignias.length;
  const ops = ACHADOS.filter((a) => (a.apos ?? 0) <= n && itemDef(a.id));
  return ops.length ? rng.peso(ops).id : null;
}
/** chamado a cada passo do jogador (depois de a parceira começar a seguir) */
export function passoDaParceira() {
  const c = parceiraAtual(), p = M.parceira;
  if (!c || !p || !p.visivel) return;
  const n = Number(flag('passos-parceira') ?? 0) + 1;
  if (n < PASSOS_ACHADO) { setFlag('passos-parceira', n); return; }
  setFlag('passos-parceira', 0);
  c.amizade = Math.min(255, c.amizade + 3);
  if (flag('parceira-achado')) return; // ainda guarda o achado anterior
  const id = sortearAchado(); if (!id) return;
  setFlag('parceira-achado', id);
  p.emote('!', 70); sfx('ui-ok');
  avisar(`${nomeCriatura(c)} achou alguma coisa no caminho!`);
  bus.emit('parceira-achado', { item: id });
}

/* ------------------------------ fala ao ser tocada ------------------------------ */
const FALAS: [number, string[]][] = [
  [220, ['{N} encosta a cabeça em você. Não troca essa caminhada por nada.', '{N} dá uma volta inteira em torno de você, toda contente!', '{N} olha para você como quem diz: "para onde for, eu vou".']],
  [150, ['{N} está radiante ao seu lado!', '{N} cantarola baixinho enquanto anda.', '{N} cutuca a sua mão pedindo carinho.']],
  [90, ['{N} segue você de perto, atenta ao caminho.', '{N} fareja o ar e olha para você, animada.', '{N} parece estar gostando do passeio.']],
  [40, ['{N} olha curiosa para você.', '{N} ainda está se acostumando com a viagem.', '{N} mantém uma distância educada.']],
  [0, ['{N} desvia o olhar, meio emburrada.', '{N} vem atrás, mas resmungando.']],
];
export const parceiraEm = (x: number, y: number) => !!M.parceira?.visivel && M.parceira.x === x && M.parceira.y === y;
export async function falarComParceira() {
  const c = parceiraAtual(), p = M.parceira; if (!c || !p) return;
  const nome = nomeCriatura(c), estavaDormindo = dormindo;
  acordar(); paradaT = 0;
  p.olharPara(M.jog.x, M.jog.y);
  bus.emit('grito', { especie: c.especie });
  const achado = String(flag('parceira-achado') || '');
  if (achado) {
    setFlag('parceira-achado', false); darItem(achado);
    p.emote('nota', 50); sfx('item-obtido'); bus.emit('item-obtido', { id: achado, qtd: 1 });
    await falar(`${nome} trouxe uma coisa guardada com todo o cuidado.\f{JOGADOR} recebeu ${nomeItem(achado)}!`);
    return;
  }
  if (estavaDormindo) { p.emote('?', 50); await falar(`${nome} acorda num susto, boceja e se ajeita para seguir viagem.`); return; }
  const max = jogo.save.equipe.length ? c.vida / Math.max(1, vidaCheia(c)) : 1;
  if (c.status) { p.emote('...', 50); await falar(`${nome} não parece bem. Melhor passar num Posto Guardião.`); return; }
  if (max < 0.3) { p.emote('...', 50); await falar(`${nome} está exausta, mas não sai do seu lado.`); return; }
  const faixa = FALAS.find(([min]) => c.amizade >= min) ?? FALAS[FALAS.length - 1];
  p.emote(c.amizade >= 150 ? 'coracao' : c.amizade >= 40 ? 'nota' : '...', 50);
  await falar(faixa[1][(M.passos + c.amizade) % faixa[1].length].replace('{N}', nome));
}
/** estimativa da vida cheia só para o humor da fala (a batalha tem a conta exata) */
function vidaCheia(c: CriaturaInst): number { const b = especie(c.especie)?.base.vida ?? 50; return Math.floor(((b * 2 + c.gen.vida * 2) * c.nivel) / 100) + c.nivel + 10; }

/* ------------------------------ vida própria (balões, sono, brilho da variante rara) ------------------------------ */
export function atualizarParceira(dt: number) {
  sincronizarParceira();
  const p = M.parceira; if (!p) return;
  p.atualizar(dt);
  const c = parceiraAtual(); if (!c) return;
  if (jogo.save.jogador.modo !== 'pe' && p.visivel) recolherParceira();
  if (!p.visivel || M.ocupado) { paradaT = 0; return; }
  if (M.jog.movendo || p.movendo) { paradaT = 0; return; }
  paradaT++;
  if (ehRara(c) && ++brilhoT >= 50) { brilhoT = 0; M.cena.particula(pixBrilho, p.px + 3 + Math.floor(cosmetico() * 10), p.py - 4 + Math.floor(cosmetico() * 10), 0, -0.15, 26); }
  // à noite, depois de ~4 s parada, ela dorme em pé
  if (periodo() === 'noite' && paradaT > 240) {
    if (!dormindo) { dormindo = true; p.spr.vel = 0; }
    if (paradaT % 120 === 1) p.emote('zzz', 80);
    return;
  }
  if (--balaoT <= 0) {
    balaoT = 420 + Math.floor(cosmetico() * 480);
    const achado = !!flag('parceira-achado');
    p.emote(achado ? '!' : c.amizade >= 150 ? 'coracao' : c.amizade >= 70 ? 'nota' : '...', 60);
    if (!achado && p.x !== M.jog.x) p.virar(cosmetico() < 0.5 ? 's' : p.dir);
  }
}
export const parceiraDormindo = () => dormindo;
