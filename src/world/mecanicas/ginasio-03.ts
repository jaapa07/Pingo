/**
 * Ginásio 3 (Rio, A4) — comportas que mudam o nível da água.
 * Quatro canais, cada um cheio ou vazio. Canal cheio: a água assada do mapa aparece, a balsa encosta no cais
 * (vira ponte) e a passarela de pedra some debaixo d'água. Canal vazio: o leito molhado aparece, a passarela de
 * pedra fica à mostra e a balsa encalha no fundo. Três volantes (`gin-comporta`) alternam os canais em grupo.
 * Tudo recomeça vazio ao sair.
 */
import { registrarMecanica } from '../registro';
import { M, Enfeites, Ladrilho, laco, cena, falar, avisar, sfx, quadros, naZona } from './_pecas';

const ZONA = 'A4-ginasio';
type Canal = 'A' | 'B' | 'C' | 'D';
const NOME: Record<Canal, string> = { A: 'canal da entrada', B: 'canal do meio', C: 'canal do líder', D: 'braço que divide o salão' };
/** retângulos [x0, y0, x1, y1] de cada canal */
const AREA: Record<Canal, [number, number, number, number]> = { A: [1, 12, 17, 13], B: [1, 7, 17, 8], C: [1, 3, 17, 4], D: [11, 9, 12, 11] };
const BALSA: Record<string, Canal> = { '8,12': 'A', '8,13': 'A', '14,3': 'C', '14,4': 'C' };
const PASSARELA: Record<string, Canal> = { '4,7': 'B', '4,8': 'B', '11,10': 'D', '12,10': 'D' };
const VOLANTES: { x: number; y: number; canais: Canal[] }[] = [
  { x: 4, y: 15, canais: ['A', 'B'] },
  { x: 2, y: 9, canais: ['B', 'D'] },
  { x: 16, y: 9, canais: ['C'] },
];
const enf = new Enfeites();
let cheio: Record<Canal, boolean> = { A: false, B: false, C: false, D: false };

const RAFT = ['................', '................', '................', '..kkkkkkkkkkkk..', '..kmnmmnmmnmmk..', '..kmnmmnmmnmmk..', '..kkkkkkkkkkkk..', '..kmmnmmnmmnmk..', '..kmmnmmnmmnmk..', '..kkkkkkkkkkkk..', '..kmnmmnmmnmmk..', '..kmnmmnmmnmmk..', '..kkkkkkkkkkkk..', '................', '................', '................'];
const PAL_RAFT = { k: '#241c30', m: '#5c4838', n: '#44342c' };

function canalEm(x: number, y: number): Canal | undefined {
  return (Object.keys(AREA) as Canal[]).find((c) => { const [x0, y0, x1, y1] = AREA[c]; return x >= x0 && x <= x1 && y >= y0 && y <= y1; });
}
function aplicar(c: Canal) {
  const [x0, y0, x1, y1] = AREA[c], z = M.zv, alto = cheio[c];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const k = `${x},${y}`;
    enf.tirar('t' + k); enf.tirar('r' + k);
    if (PASSARELA[k]) {
      z.bloquear(x, y, alto);
      if (alto) enf.tile('t' + k, 'agua', x, y);
    } else if (BALSA[k]) {
      z.set(x, y, alto ? '=' : '~');
      if (alto) enf.tile('t' + k, 'ponte', x, y);
      else { enf.tile('t' + k, 'gelo', x, y); enf.pix('r' + k, [RAFT], PAL_RAFT, x, y, { z: 2 }); }
    } else if (!alto) enf.tile('t' + k, 'gelo', x, y);
  }
}
async function girar(v: (typeof VOLANTES)[number]) {
  sfx('empurrar'); M.cena.tremer(10);
  await quadros(14);
  sfx('cachoeira');
  for (const c of v.canais) { cheio[c] = !cheio[c]; aplicar(c); }
  await quadros(10);
  avisar(v.canais.map((c) => `${NOME[c]}: ${cheio[c] ? 'CHEIO' : 'VAZIO'}`).join(' · '));
  await falar('O volante range e a água corre pelas comportas.\n' + v.canais.map((c) => `O ${NOME[c]} ${cheio[c] ? 'encheu' : 'esvaziou'}.`).join(' '));
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer();
    cheio = { A: false, B: false, C: false, D: false };
    (Object.keys(AREA) as Canal[]).forEach(aplicar);
    // a água sobre as passarelas submersas acompanha a animação do canal
    let f = 0;
    laco(() => naZona(ZONA), (q) => { if (q % 15) return; f++; for (const k of Object.keys(PASSARELA)) enf.pegar<Ladrilho>('t' + k)?.quadro(f); });
  },
  interagir(x, y) {
    const v = VOLANTES.find((o) => o.x === x && o.y === y);
    if (v) { cena(() => girar(v)); return true; }
    const c = canalEm(x, y);
    if (!c) return false;
    const k = `${x},${y}`;
    if (M.zv.chao(x, y)) return false;
    let t: string;
    if (BALSA[k]) t = 'A balsa está encalhada no fundo do canal. Só com o canal cheio ela sobe até o cais.';
    else if (PASSARELA[k]) t = 'Dá para ver uma passarela de pedra debaixo d\'água. Com o canal vazio ela ficaria à mostra.';
    else if (cheio[c]) t = 'A água do canal corre forte e funda. Sem balsa, nada feito.';
    else t = 'O leito do canal fica dois metros abaixo do piso, liso de limo. Só a passarela de pedra atravessa.';
    cena(() => falar(t));
    return true;
  },
  sair() { enf.esquecer(); cheio = { A: false, B: false, C: false, D: false }; },
});
