/**
 * Ginásio 11 (Brasa, B4) — fogueiras de São João acesas em sequência musical.
 * Três terreiros; cada fogueira (`b`) tem uma nota e cada terreiro, um sanfoneiro com a sua música. Acender as
 * fogueiras do terreiro na ordem pedida apaga as brasas (`x`) da passagem para o terreiro seguinte; uma fogueira fora
 * da ordem faz todas as daquele terreiro apagarem. O 1º sanfoneiro mostra a música (a fogueira pisca na nota), a 2ª
 * mostra mas pede a ordem invertida ("anarriê!") e o 3º só canta o nome das notas. Vencida a líder, tudo fica aceso.
 * Ao sair, os terreiros recomeçam.
 */
import { TILE } from '../../core/tipos';
import { flag } from '../../core/estado';
import { bus } from '../../core/events';
import { simNao } from '../deps';
import { registrarMecanica } from '../registro';
import { M, Enfeites, cena, falar, avisar, sfx, quadros, laco, naZona, chave } from './_pecas';

const ZONA = 'B4-ginasio';
type Nota = 'DÓ' | 'RÉ' | 'MI' | 'FÁ' | 'SOL';
const ALTURA: Record<Nota, number> = { 'DÓ': 1, 'RÉ': 9 / 8, 'MI': 5 / 4, 'FÁ': 4 / 3, 'SOL': 3 / 2 };
interface Fogueira { x: number; y: number; nota: Nota }
interface Terreiro {
  sanfoneiro: string; nome: string;
  fogueiras: Fogueira[];
  /** a música tocada (índices em `fogueiras`) */
  musica: number[];
  /** ordem em que se acende (igual à música, ou ao contrário no "anarriê") */
  ordem: number[];
  mostra: boolean;
  brasas: [number, number][];
  fala: string;
}
const T = (x: number, y: number, nota: Nota): Fogueira => ({ x, y, nota });
const TERREIROS: Terreiro[] = [
  { sanfoneiro: 'sanfoneiro-1', nome: 'Zé do Fole', fogueiras: [T(5, 13, 'DÓ'), T(10, 13, 'MI'), T(15, 13, 'SOL')], musica: [2, 0, 1], ordem: [2, 0, 1], mostra: true, brasas: [[11, 11], [12, 11], [13, 11]],
    fala: 'Ô sanfona boa! Olhe e escute, que a fogueira que pisca é a nota.\nDepois acenda as fogueiras na mesma ordem da música.' },
  { sanfoneiro: 'sanfoneiro-2', nome: 'Dona Quitéria', fogueiras: [T(4, 9, 'RÉ'), T(8, 9, 'FÁ'), T(12, 9, 'DÓ'), T(16, 9, 'MI')], musica: [2, 1, 3, 0], ordem: [0, 3, 1, 2], mostra: true, brasas: [[7, 7], [8, 7], [9, 7]],
    fala: 'Eu sou a marcadora da quadrilha! Preste atenção na música…\fE agora: ANARRIÊ! Quando a marcadora grita anarriê, a quadrilha volta.\nAcenda as fogueiras de trás para a frente: da última nota até a primeira.' },
  { sanfoneiro: 'sanfoneiro-3', nome: 'Seu Lua', fogueiras: [T(3, 5, 'MI'), T(6, 5, 'DÓ'), T(9, 5, 'SOL'), T(12, 5, 'FÁ'), T(15, 5, 'RÉ')], musica: [2, 0, 3, 4, 1], ordem: [2, 0, 3, 4, 1], mostra: false, brasas: [[9, 3], [10, 3], [11, 3]],
    fala: 'Aqui no último terreiro, fogueira nenhuma pisca para ajudar. Eu canto o nome das notas e você acende na mesma ordem.\nCada fogueira tem a sua nota escrita na bandeirinha: chegue perto e leia.' },
];
const enf = new Enfeites();
/** quantas fogueiras do terreiro já estão acesas na ordem certa */
let acesas: number[] = [];
let resolvido: boolean[] = [];

const CHAMA = [
  ['.....r......', '....ry......', '....ryr..r..', '...ryyr..r..', '..ryywyr.ry.', '..ryywyyrry.', '.ryywwyyyyr.', '.ryywwwyyyr.', 'rryywwwyyyrr', 'ryyywwyyyyr.', '.ryyyyyyyrr.', '..rryyyyrr..'],
  ['......r.....', '..r..yr.....', '..r.ryr.....', '..ryryyr....', '.ryyywyr.r..', '.ryywwyyrry.', 'ryyywwyyyyr.', '.ryywwwyyyr.', '.rryywwyyyrr', 'ryyywwwyyyr.', '.ryyyyyyyrr.', '..rryyyyrr..'],
];
const PAL = { r: '#d8401c', y: '#fcb42c', w: '#fff48c' };
const BRILHO = [['..w..w..w..', '...........', 'w.........w', '...........', '..w..w..w..']];

const vencido = () => !!flag('ginasio-11-vencido');
const fogueiraEm = (x: number, y: number): [Terreiro, number] | undefined => {
  for (const t of TERREIROS) { const i = t.fogueiras.findIndex((f) => f.x === x && f.y === y); if (i >= 0) return [t, i]; }
  return undefined;
};
function tocarNota(n: Nota) { bus.emit('sfx', { id: 'saveiro-sino', pitch: 0.5 * ALTURA[n] }); }
function acender(f: Fogueira) { enf.pix('chama' + chave(f.x, f.y), CHAMA, PAL, f.x, f.y, { dx: 2, dy: -6, z: f.y * TILE + 18 }); }
function apagar(f: Fogueira) { enf.tirar('chama' + chave(f.x, f.y)); }
function esfriar(t: Terreiro) {
  for (const [x, y] of t.brasas) { M.zv.bloquear(x, y, false); enf.tile('cinza' + chave(x, y), 'caminho', x, y); }
}
function acender3(k: number) {
  const t = TERREIROS[k];
  resolvido[k] = true; acesas[k] = t.ordem.length;
  t.fogueiras.forEach(acender); esfriar(t);
}

async function tocarMusica(t: Terreiro) {
  const k = TERREIROS.indexOf(t);
  await falar(t.fala, { nome: t.nome });
  for (const i of t.musica) {
    const f = t.fogueiras[i];
    tocarNota(f.nota);
    if (t.mostra) { enf.pix('pisca', [BRILHO[0]], { w: '#fff48c' }, f.x, f.y, { dx: 3, dy: -10, z: 4000 }); if (!(acesas[k] > t.ordem.indexOf(i))) acender(f); }
    else avisar(f.nota + '…');
    await quadros(34);
    enf.tirar('pisca');
    if (t.mostra && !(resolvido[k] || t.ordem.indexOf(i) < acesas[k])) apagar(f);
    await quadros(8);
  }
  const nomes = t.musica.map((i) => t.fogueiras[i].nota).join(', ');
  await falar(t.mostra ? (t === TERREIROS[1] ? `A música foi: ${nomes}. ANARRIÊ!` : `Foi assim: ${nomes}. Agora é com você!`) : `Lá vai de novo, devagarinho: ${nomes}.`, { nome: t.nome });
}

async function mexerNaFogueira(t: Terreiro, i: number) {
  const k = TERREIROS.indexOf(t), f = t.fogueiras[i];
  if (resolvido[k]) { await falar(`A fogueira do ${f.nota} estala e espalha faísca. Viva São João!`); return; }
  if (t.ordem.indexOf(i) < acesas[k]) { await falar(`A fogueira do ${f.nota} já está acesa.`); return; }
  if (!(await simNao(`Uma fogueira de São João apagada. A bandeirinha diz "${f.nota}".\nAcender?`))) return;
  sfx('fogueira'); acender(f); tocarNota(f.nota);
  await quadros(20);
  if (t.ordem[acesas[k]] === i) {
    acesas[k]++;
    if (acesas[k] === t.ordem.length) {
      resolvido[k] = true;
      await quadros(10);
      sfx('item-obtido'); M.cena.tremer(6);
      esfriar(t);
      avisar('As brasas da passagem esfriaram!');
      await falar(`Que arrasta-pé! As ${t.ordem.length} fogueiras queimam juntas e as brasas da passagem viram cinza fria.`);
    }
    return;
  }
  sfx('ui-erro'); M.cena.tremer(4);
  await quadros(10);
  acesas[k] = 0;
  t.fogueiras.forEach(apagar);
  await falar(`PUF! Nota fora da música. Um sopro de fumaça e as fogueiras deste terreiro apagam todas.\nFale com ${t.nome.startsWith('Dona') ? 'a' : 'o'} ${t.nome} para ouvir a música de novo.`);
}

bus.on('insignia', (n: number) => { if (n === 11 && M.zv?.def.id === ZONA) TERREIROS.forEach((_, k) => acender3(k)); });

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer();
    acesas = TERREIROS.map(() => 0); resolvido = TERREIROS.map(() => false);
    for (const t of TERREIROS) for (const [x, y] of t.brasas) M.zv.bloquear(x, y, true);
    if (vencido()) TERREIROS.forEach((_, k) => acender3(k));
    laco(() => naZona(ZONA), (q) => { if (q % 9 === 0) for (const t of TERREIROS) for (const f of t.fogueiras) enf.pegar('chama' + chave(f.x, f.y))?.quadro(q / 9 + f.x); });
  },
  interagir(x, y) {
    const fg = fogueiraEm(x, y);
    if (fg) { cena(() => mexerNaFogueira(fg[0], fg[1])); return true; }
    const t = TERREIROS.find((q) => { const n = M.npcs.find((v) => v.id === q.sanfoneiro); return n && n.ator.x === x && n.ator.y === y; });
    if (t) {
      const n = M.npcs.find((v) => v.id === t.sanfoneiro)!;
      cena(async () => {
        const dx = M.jog.x - n.ator.x, dy = M.jog.y - n.ator.y;
        n.ator.virar(dx > 0 ? 'l' : dx < 0 ? 'o' : dy > 0 ? 's' : 'n');
        if (resolvido[TERREIROS.indexOf(t)]) await falar('Arrasta-pé bonito, sô! As brasas já esfriaram. Pode seguir que a festa continua lá em cima.', { nome: t.nome });
        else await tocarMusica(t);
      });
      return true;
    }
    if (M.zv.ch(x, y) === 'x' && TERREIROS.some((q, k) => !resolvido[k] && q.brasas.some(([a, b]) => a === x && b === y))) {
      cena(() => falar('Brasas vivas no chão, de fazer chiar a sola da botina.\nSó esfriam quando as fogueiras do terreiro acenderem na ordem da música.'));
      return true;
    }
    return false;
  },
  sair() { enf.esquecer(); acesas = []; resolvido = []; },
});
