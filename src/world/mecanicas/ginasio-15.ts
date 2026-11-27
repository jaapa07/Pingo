/**
 * Ginásio 15 (Mente, B8) — teletransportes entre constelações.
 * Ilhas de chão no meio do campo mental (`x`, bloqueado). Cada portal (`o`) mostra, em cada uma das quatro horas do
 * céu, uma constelação (ou nenhuma: apagado). Pisar num portal leva ao outro portal que mostra a MESMA constelação
 * naquela hora. Pisar numa estrela-guia (`,`) gira o céu uma hora adiante. O desenho da constelação fica aceso sobre
 * cada portal. Ao sair do ginásio, o céu volta ao anoitecer.
 */
import { flag } from '../../core/estado';
import { registrarMecanica } from '../registro';
import { M, Enfeites, cena, recolocar, falar, avisar, sfx, quadros } from './_pecas';
import { tr } from '../../i18n';

const ZONA = 'B8-ginasio';
type Const = 'ema' | 'anta' | 'homem-velho' | 'veado' | 'cruzeiro' | 'tres-marias' | 'eixu';
const NOME_HORAS = ['anoitecer', 'meia-noite', 'madrugada', 'alvorada'];
/** portais: posição e constelação em cada hora (null = apagado); pares por hora conferidos pela busca do diário */
const PORTAIS: { x: number; y: number; c: (Const | null)[] }[] = [
  { x: 5, y: 15, c: ['ema', 'veado', 'eixu', 'homem-velho'] }, // P0 entrada
  { x: 11, y: 15, c: [null, 'cruzeiro', 'ema', 'veado'] }, // P1 entrada
  { x: 2, y: 10, c: ['anta', 'cruzeiro', 'anta', 'cruzeiro'] }, // P2 oeste
  { x: 6, y: 10, c: ['homem-velho', 'tres-marias', 'eixu', null] }, // P3 oeste
  { x: 4, y: 12, c: ['veado', 'eixu', 'homem-velho', 'tres-marias'] }, // P4 oeste
  { x: 11, y: 8, c: ['cruzeiro', 'ema', 'veado', 'eixu'] }, // P5 meio
  { x: 15, y: 8, c: ['tres-marias', 'anta', 'cruzeiro', 'homem-velho'] }, // P6 meio
  { x: 20, y: 10, c: ['cruzeiro', 'anta', 'homem-velho', 'veado'] }, // P7 leste
  { x: 24, y: 10, c: ['anta', 'tres-marias', 'tres-marias', 'tres-marias'] }, // P8 leste
  { x: 22, y: 13, c: ['veado', 'ema', 'anta', 'ema'] }, // P9 leste
  { x: 20, y: 3, c: ['eixu', 'homem-velho', 'veado', 'anta'] }, // P10 nordeste
  { x: 24, y: 5, c: ['ema', null, 'tres-marias', 'eixu'] }, // P11 nordeste
  { x: 2, y: 3, c: ['homem-velho', null, 'ema', 'cruzeiro'] }, // P12 noroeste
  { x: 6, y: 3, c: ['eixu', 'eixu', null, 'ema'] }, // P13 noroeste
  { x: 4, y: 6, c: ['tres-marias', 'veado', 'cruzeiro', null] }, // P14 noroeste
  { x: 13, y: 3, c: [null, 'homem-velho', null, 'anta'] }, // P15 ilha da líder
];
const NOME: Record<Const, string> = { ema: 'a Ema', anta: 'a Anta', 'homem-velho': 'o Homem Velho', veado: 'o Veado', cruzeiro: 'o Cruzeiro do Sul', 'tres-marias': 'as Três Marias', eixu: 'o Eixu' };
const CONST_SEM_ARTIGO: Record<Const, string> = { ema: 'Ema', anta: 'Anta', 'homem-velho': 'Homem Velho', veado: 'Veado', cruzeiro: 'Cruzeiro do Sul', 'tres-marias': 'Três Marias', eixu: 'Eixu' };
/* desenhos 7×7 das constelações (a = estrela), cada uma com a sua cor */
const DESENHO: Record<Const, string[]> = {
  ema: ['....aa.', '.....a.', '.....a.', '.aaaaa.', 'aaaaaa.', '..a.a..', '..a.a..'],
  anta: ['.......', 'aaaaa..', 'aaaaaaa', 'aaaaa.a', 'a.a.a..', 'a.a.a..', '.......'],
  'homem-velho': ['..a....', '.aaa...', '..a....', '.aaa...', '..a.a..', '.a...a.', 'a.....a'],
  veado: ['a.a....', '.a.a...', '..aa...', '..aaaaa', '..aaaaa', '..a...a', '..a...a'],
  cruzeiro: ['...a...', '...a...', 'aaaaaaa', '...a...', '...a...', '...a...', '...a...'],
  'tres-marias': ['a......', '.a.....', '.......', '...a...', '.......', '.....a.', '......a'],
  eixu: ['.a..a..', 'a.a..a.', '.a.a...', '...a.a.', '.a.....', '.......', '.......'],
};
const COR: Record<Const, string> = { ema: '#ffffff', anta: '#f4a040', 'homem-velho': '#74b0ff', veado: '#7ce05c', cruzeiro: '#fcd834', 'tres-marias': '#f080c0', eixu: '#5ce0e0' };
const quadro = (d: string[]) => ['kkkkkkkkk', ...d.map((l) => 'k' + l.replace(/\./g, 'f') + 'k'), 'kkkkkkkkk'];
const APAGADO = quadro(Array.from({ length: 7 }, () => '.......'));

const ESTRELA = [['.....y.....', '.....y.....', '....yyy....', '....ywy....', 'yyyyywyyyyy', '.yyywwwyyy.', '...yywyy...', '...yy.yy...', '..yy...yy..', '.yy.....yy.', '...........']];
const enf = new Enfeites();
let hora = 0;
const portalEm = (x: number, y: number) => PORTAIS.findIndex((p) => p.x === x && p.y === y);
const vencido = () => !!flag('ginasio-15-vencido');

function pintar() {
  PORTAIS.forEach((p, i) => {
    const c = p.c[hora];
    const pal = c ? { k: '#2a1c4a', f: '#141848', a: COR[c] } : { k: '#2a1c4a', f: '#0c0c2c', a: '#0c0c2c' };
    enf.pix('p' + i, [c ? quadro(DESENHO[c]) : APAGADO], pal, p.x, p.y, { dx: 3, dy: -11, z: p.y * 16 + 300 });
  });
}
async function girar() {
  hora = (hora + 1) % NOME_HORAS.length;
  sfx('g-mente'); M.cena.tremer(3);
  pintar();
  avisar(tr('O céu girou: {hora}.', { hora: NOME_HORAS[hora] }));
}
async function saltar(i: number) {
  const p = PORTAIS[i], c = p.c[hora];
  const j = c ? PORTAIS.findIndex((q, k) => k !== i && q.c[hora] === c) : -1;
  if (j < 0) { sfx('ui-erro'); await falar(c ? tr('O portal mostra {n}, mas nenhum outro portal brilha com ela nesta hora.', { n: NOME[c] }) : tr('O portal está apagado: nenhuma constelação passa por ele no céu da {hora}.', { hora: NOME_HORAS[hora] })); return; }
  sfx('warp');
  await quadros(14, (k) => { M.jog.visivel = k % 4 < 2; });
  recolocar(PORTAIS[j].x, PORTAIS[j].y, M.jog.dir);
  await quadros(12, (k) => { M.jog.visivel = k % 4 < 2; });
  M.jog.visivel = true;
  avisar(tr('Constelação: {nome}', { nome: CONST_SEM_ARTIGO[c!] }));
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer(); hora = 0;
    for (let y = 0; y < M.zv.h; y++) for (let x = 0; x < M.zv.w; x++) if (M.zv.ch(x, y) === 'x') M.zv.bloquear(x, y, true);
    for (let y = 0; y < M.zv.h; y++) for (let x = 0; x < M.zv.w; x++) if (M.zv.ch(x, y) === ',') enf.pix(`e${x},${y}`, ESTRELA, { y: '#fcd85c', w: '#fffcc0' }, x, y, { dx: 2, dy: 2, z: 3 });
    pintar();
  },
  passo(x, y) {
    const ch = M.zv.ch(x, y);
    if (ch === ',') { cena(girar); return true; }
    const i = portalEm(x, y);
    if (i >= 0) { cena(() => saltar(i)); return true; }
    return false;
  },
  interagir(x, y) {
    const i = portalEm(x, y);
    if (i >= 0) { const c = PORTAIS[i].c[hora]; cena(() => falar(c ? tr('Um portal de constelação. No céu da {hora}, ele mostra {n}.', { hora: NOME_HORAS[hora], n: NOME[c] }) : tr('Um portal apagado. No céu da {hora}, nenhuma constelação passa por ele.', { hora: NOME_HORAS[hora] }))); return true; }
    if (M.zv.ch(x, y) === 'x') { cena(() => falar(vencido() ? 'O campo mental zumbe baixinho. Nem a vitória deixa alguém atravessar pensamento puro.' : 'Um campo mental: o ar treme como água e empurra a gente de volta. Só os portais atravessam.')); return true; }
    if (M.zv.ch(x, y) === ',') { cena(() => falar(tr('Uma estrela-guia no chão. Pisar nela gira o céu uma hora adiante. Agora é {hora}.', { hora: NOME_HORAS[hora] }))); return true; }
    return false;
  },
  sair() { enf.esquecer(); hora = 0; },
});
