/**
 * Pixel art em DOM puro para os elementos dinâmicos do mapa (obstáculos de Amuleto, itens no chão,
 * canteiros, balões de emoção, respingos). Cada desenho é uma grade de caracteres escrita à mão,
 * renderizada como sombras de 1 px (sem imagem, sem canvas). Posição sempre em px nativos inteiros.
 */
export class Pix {
  el = document.createElement('div');
  private qs: HTMLElement[] = [];
  w: number; h: number;
  constructor(quadros: string[][], pal: Record<string, string>, pai?: HTMLElement) {
    this.w = quadros[0][0].length; this.h = quadros[0].length;
    this.el.className = 'pix';
    this.el.style.width = this.w + 'px'; this.el.style.height = this.h + 'px';
    for (const linhas of quadros) {
      const q = document.createElement('i');
      const s: string[] = [];
      linhas.forEach((l, y) => { for (let x = 0; x < l.length; x++) { const c = pal[l[x]]; if (c) s.push(`${x + 1}px ${y + 1}px 0 0 ${c}`); } });
      q.style.boxShadow = s.join(',');
      this.qs.push(q); this.el.append(q);
    }
    this.quadro(0);
    pai?.append(this.el);
  }
  quadro(i: number): this { this.qs.forEach((q, k) => (q.style.display = k === i % this.qs.length ? '' : 'none')); return this; }
  pos(x: number, y: number, z?: number): this { this.el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`; if (z !== undefined) this.el.style.zIndex = String(Math.round(z)); return this; }
  ver(b: boolean): this { this.el.style.display = b ? '' : 'none'; return this; }
  remover() { this.el.remove(); }
}

const VERDE = { k: '#1d3a1a', g: '#3f8f3a', G: '#6fc24a' };
const PEDRA = { k: '#2b2a33', s: '#5b5a6b', c: '#8d8c9c', l: '#c3c2cf' };
const RACHA = { k: '#3a2a22', s: '#7a5a44', c: '#a8825f', l: '#d4b48c' };
const CUIA = { k: '#3b2413', m: '#b5772f', l: '#e3b055', p: '#f2e3a1' };
const HORTA = { k: '#3b2413', t: '#7a4e2a', T: '#9a6a3a', g: '#2f7d32', G: '#6fc24a', r: '#d8423a', y: '#f2c63a' };

const CIPO = ['..k..kk....k..k.', '.kgk.kGk..kgkkgk', '.kgkkgGk..kgkkGk', '..kgGgk..kgGkgk.', '..kgGk..kgGgkk..', '.kgGgk..kgGk.kk.', '.kgGk.kkkgGkkgGk', 'kgGgkkgGkkgkkgGk', 'kgGkkgGgk.kgkgk.', 'kgGkkgGk.kgGkgk.', '.kgGkgGk.kgGgGk.', '.kgGgGgk..kgGgk.', '..kgGgk..kkgGk..', '..kgGkkkkgGgGk..', '.kgGgGGgGgGkgGk.', '..kkkkkkkkk.kk..'];
const PEDREGULHO = ['................', '....kkkkkkk.....', '..kkcccclllkk...', '.kccccclllllck..', '.kcccccclllcck..', 'kccccccccccccsk.', 'kcccccccccccssk.', 'kccccccccccsssk.', 'kccsccccccssssk.', 'kcssccccsssssskk', 'kssscccsssssssk.', '.kssssssssssssk.', '.kkssssssssskk..', '...kkkkkkkkk....', '................', '................'];
const ROCHA = ['................', '.....kkkkkk.....', '...kkclllllkk...', '..kcccllkllcck..', '.kccccckllcccck.', '.kcccckkccccsck.', 'kcccckccckccssk.', 'kccckkccckkcssk.', 'kcckccccccksssk.', 'kckkccsccckkssk.', 'kcccccscssskssk.', '.kcsssskssssssk.', '.kkssskkssssskk.', '...kkkkkkkkkk...', '................', '................'];
const ITEM = ['................', '................', '................', '................', '......kkkk......', '....kkppppkk....', '...kpllppllpk...', '...kmlllllmmk...', '..kmmllllmmmmk..', '..kmmmmmmmmmmk..', '..kmpmpmpmpmmk..', '...kmmmmmmmmk...', '...kkmmmmmmkk...', '.....kkkkkk.....', '................', '................'];
const TERRA = ['.kkkkkkkkkkkkkk.', 'kTTtTTTtTTTtTTTk', 'ktTTTtTTTtTTTtTk', 'kTTtTTTtTTTtTTtk', 'kttttttttttttttk', '.kkkkkkkkkkkkkk.'];
const V = '................';
const canteiro = (topo: string[]) => [...Array.from({ length: 10 - topo.length }, () => V), ...topo, ...TERRA];
const CANTEIRO = [
  canteiro([]),
  canteiro(['.......G........', '......gGg.......', '.......g........']),
  canteiro(['......G.G.......', '.....GgGgG......', '....GgggggG.....', '.....gGgGg......', '......ggg.......', '.......k........']),
  canteiro(['.....kkkkk......', '...kkGGgGGkk....', '..kGgrGGgGgGk...', '..kgGGgGrGGgk...', '.kGgGrgGGgrGGk..', '.kgGGgGgGGgGgk..', '..kGrGgGrGgGk...', '...kkgGgGgkk....', '.....kkmkk......', '.......k........']),
];
const GRAMA = [['..G....G.....G..', '.GgG..GgG...GgG.', 'GgggGGgggG.GgggG', 'gggggggggggggggg', 'gkggkgggkggkgggk', 'gggggggggggggggg'], ['.G....G.....G...', 'GgG..GgG...GgG..', 'gggGGgggG.GgggGG', 'gggggggggggggggg', 'ggkggkgggkggkggg', 'gggggggggggggggg']];
const RESPINGO = [['.....', '.w.w.', '..w..'], ['w...w', '.....', '.....']];
const BRILHO = [['..y..', '..y..', 'yywyy', '..y..', '..y..'], ['.....', '..y..', '.ywy.', '..y..', '.....']];
const FOLHA = [['Gg', 'g.'], ['.g', 'gG']];
const BOLHA = [['.ww.', 'w..w', 'w..w', '.ww.'], ['....', '.ww.', '.ww.', '....']];
const POEIRA = [['.cc.', 'cccc', '.cc.'], ['c..c', '....', 'c..c']];
const PESSOA = ['....kkkk....', '...khhhhk...', '..khhhhhhk..', '..khsssshk..', '..kssssssk..', '..kskssksk..', '..kssssssk..', '...kssssk...', '..kkcccckk..', '.kcccccccck.', '.kcccccccck.', 'kskccccccksk', 'kskccccccksk', '.kkcccccckk.', '..kcccccck..', '..kcckkcck..', '..kcck.kcck.', '..kbbk.kbbk.', '..kbbk.kbbk.', '...kk...kk..'];
const BICHO = ['............', '..kk....kk..', '.kcck..kcck.', '.kcckkkkcck.', '.kcccccccck.', 'kccwkcckwcck', 'kccckcckccck', 'kcccssssccck', '.kcccccccck.', '.kcccccccck.', '..kcckkcck..', '...kk..kk...'];

const SIMBOLOS: Record<string, string[]> = {
  '!': ['..rrr..', '..rrr..', '..rrr..', '..rrr..', '...r...', '.......', '..rrr..'],
  '?': ['.bbbbb.', 'bb...bb', '....bb.', '...bb..', '...bb..', '.......', '...bb..'],
  coracao: ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'],
  zzz: ['bbbb...', '..b....', '.b..bbb', 'bbbb..b', '.....b.', '....bbb', '.......'],
  raiva: ['.r...r.', '.rr.rr.', '.......', 'rr...rr', '.......', '.rr.rr.', '.r...r.'],
  nota: ['...ggg.', '...g.g.', '...g.g.', '...g.g.', '.ggg.gg', '.ggg.gg', '.......'],
  '...': ['.......', '.......', '.......', '.......', '.......', 'b..b..b', '.......'],
};
const BALAO = { k: '#2a1a0e', w: '#fff8e6', r: '#d8423a', b: '#2f5fb3', g: '#2f8f4a' };
export type Emote = '!' | '?' | 'coracao' | 'zzz' | 'raiva' | 'nota' | '...';
export function pixEmote(tipo: string, pai: HTMLElement): Pix {
  const s = SIMBOLOS[tipo] ?? SIMBOLOS['!'];
  const linhas = ['.kkkkkkkkk.', 'kwwwwwwwwwk', ...s.map((l) => 'kw' + l.replace(/\./g, 'w') + 'wk'), 'kwwwwwwwwwk', '.kkkkwkkkk.', '.....k.....'];
  return new Pix([linhas], BALAO, pai);
}
export type TileVivo = 'c' | 'p' | 'r';
export const pixObstaculo = (c: TileVivo, pai: HTMLElement) => (c === 'c' ? new Pix([CIPO], VERDE, pai) : c === 'p' ? new Pix([PEDREGULHO], PEDRA, pai) : new Pix([ROCHA], RACHA, pai));
export const pixItem = (pai: HTMLElement) => new Pix([ITEM], CUIA, pai);
export const pixCanteiro = (pai: HTMLElement) => new Pix(CANTEIRO, { ...HORTA, m: '#7a4e2a' }, pai);
export const pixGrama = (pai: HTMLElement) => new Pix(GRAMA, { k: '#1d4a22', g: '#2f7d32', G: '#58b04a' }, pai);
export const pixRespingo = (pai: HTMLElement) => new Pix(RESPINGO, { w: '#d6ecff' }, pai);
export const pixBrilho = (pai: HTMLElement) => new Pix(BRILHO, { y: '#ffe066', w: '#ffffff' }, pai);
export const pixFolha = (pai: HTMLElement) => new Pix(FOLHA, { g: '#2f7d32', G: '#7fd15a' }, pai);
export const pixBolha = (pai: HTMLElement) => new Pix(BOLHA, { w: '#cfeaff' }, pai);
export const pixPoeira = (pai: HTMLElement) => new Pix(POEIRA, { c: '#d9c8a3' }, pai);
/** boneco de reserva para modelos que ainda não estão no atlas (cor derivada do id) */
export function pixBoneco(id: string, pai: HTMLElement): Pix {
  let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cor = `hsl(${h % 360} 62% 52%)`, cabelo = `hsl(${(h >> 8) % 360} 40% 26%)`;
  return id.startsWith('c:') ? new Pix([BICHO], { k: '#2a1a0e', c: cor, s: '#f4d7b0', w: '#ffffff' }, pai) : new Pix([PESSOA], { k: '#2a1a0e', h: cabelo, s: '#f0c8a0', c: cor, b: '#4a3524' }, pai);
}

/* ------------------------------ padrões repetidos (clima, máscara) ------------------------------ */
export type Ret = [x: number, y: number, w: number, h: number, cor: string, op?: number];
/** imagem de fundo CSS com retângulos de pixel (SVG inline com bordas duras) */
export function padrao(w: number, h: number, rs: Ret[]): string {
  const corpo = rs.map(([x, y, a, b, c, o]) => `<rect x='${x}' y='${y}' width='${a}' height='${b}' fill='${c}'${o !== undefined ? ` fill-opacity='${o}'` : ''}/>`).join('');
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${corpo}</svg>`)}")`;
}

let estiloOk = false;
export function injetarEstilo() {
  if (estiloOk) return; estiloOk = true;
  const s = document.createElement('style');
  s.dataset.dono = 'mundo';
  s.textContent = `
.mundo{position:absolute;left:0;top:0;width:320px;height:180px;overflow:hidden;background:#000;image-rendering:pixelated}
.mundo .cam,.mundo .cam>div,.mundo .conj{position:absolute;left:0;top:0}
.mundo .cam{will-change:transform}
.mundo .baixo{z-index:0}.mundo .sprites{z-index:1}.mundo .alto{z-index:2;pointer-events:none}
.mundo .conj{transition:opacity 1s linear}
.mundo .spr,.mundo .pix,.mundo .chunk,.mundo .dbg{position:absolute;left:0;top:0;image-rendering:pixelated;background-repeat:no-repeat}
.mundo .pix>i{position:absolute;left:-1px;top:-1px;width:1px;height:1px}
.mundo .clima,.mundo .escuro,.mundo .sobre{position:absolute;left:0;top:0;width:320px;height:180px;pointer-events:none;image-rendering:pixelated}
.mundo .clima>div{position:absolute;left:0;top:0;width:320px;height:180px;image-rendering:pixelated}
.mundo .escuro>div{position:absolute;left:0;top:0;image-rendering:pixelated}
.mundo .dbg-t{position:absolute;width:16px;height:16px;box-sizing:border-box}
.mundo .conj.per-manha .dbg{filter:brightness(1.05) sepia(.25)}
.mundo .conj.per-tarde .dbg{filter:brightness(.92) sepia(.45) saturate(1.3)}
.mundo .conj.per-noite .dbg{filter:brightness(.5) saturate(.8) hue-rotate(20deg)}
.mundo .flash{position:absolute;left:0;top:0;width:320px;height:180px;background:#fff;pointer-events:none;display:none}`;
  document.head.append(s);
}
