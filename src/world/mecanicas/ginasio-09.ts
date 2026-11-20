/**
 * Ginásio 9 (Terra, B2) — pisos de lama que afundam.
 * Cada cercado é um campo de lama (`l` no mapa). O tile de lama afunda (vira buraco e bloqueia) quando o jogador
 * sai dele. A porteira do cercado (tile `:` na cerca) só abre quando toda a lama daquele cercado já levou pisada;
 * passando por ela, o cercado vira chão firme. Sair pela passarela antes disso, ficar sem saída ("atolou") ou tocar
 * o sino do cercado faz os peões alisarem a lama de novo. Os fardos (`p`) ficam amarrados (a Força não os move).
 * Vencida a líder, todos os cercados ficam firmes. Ao sair da zona, tudo recomeça.
 */
import { TILE } from '../../core/tipos';
import { flag } from '../../core/estado';
import { bus } from '../../core/events';
import { registrarMecanica } from '../registro';
import { M, Enfeites, DX, DY, DIRS, cena, falar, avisar, sfx, quadros, recolocar, chave } from './_pecas';

const ZONA = 'B2-ginasio';
interface Cercado {
  nome: string;
  /** fileiras de lama do cercado */
  y0: number; y1: number;
  porteira: [number, number];
  sino: [number, number];
  /** onde o jogador atolado é devolvido */
  volta: [number, number];
  lama: [number, number][];
  pisada: Set<string>; afundada: Set<string>;
  aberta: boolean; firme: boolean;
}
const PLANTA: Omit<Cercado, 'lama' | 'pisada' | 'afundada' | 'aberta' | 'firme'>[] = [
  { nome: 'primeiro', y0: 14, y1: 15, porteira: [10, 13], sino: [4, 15], volta: [8, 16] },
  { nome: 'segundo', y0: 9, y1: 11, porteira: [6, 8], sino: [3, 11], volta: [6, 12] },
  { nome: 'terceiro', y0: 4, y1: 6, porteira: [7, 3], sino: [2, 6], volta: [9, 7] },
];
const enf = new Enfeites();
let cercados: Cercado[] = [];
let ultimo: [number, number] | null = null;

const vencido = () => !!flag('ginasio-09-vencido');
const doCercado = (x: number, y: number) => cercados.find((c) => c.lama.some(([a, b]) => a === x && b === y));
const naPorteira = (c: Cercado, x: number, y: number) => c.porteira[0] === x && c.porteira[1] === y;

function fecharPorteira(c: Cercado) {
  const [x, y] = c.porteira;
  c.aberta = false; M.zv.bloquear(x, y, true);
  enf.tile('porteira' + c.nome, 'cerca', x, y, y * TILE + 15);
}
function abrirPorteira(c: Cercado) {
  const [x, y] = c.porteira;
  c.aberta = true; M.zv.bloquear(x, y, false); enf.tirar('porteira' + c.nome);
}
/** os peões alisam a lama: tudo volta ao começo, porteira fechada */
function alisar(c: Cercado) {
  for (const [x, y] of c.lama) { M.zv.bloquear(x, y, false); enf.tirar('b' + chave(x, y)); enf.tirar('f' + chave(x, y)); }
  c.pisada.clear(); c.afundada.clear(); c.firme = false;
  fecharPorteira(c);
}
/** cercado vencido: a lama seca e vira chão firme, porteira aberta */
function firmar(c: Cercado) {
  for (const [x, y] of c.lama) { M.zv.bloquear(x, y, false); enf.tirar('b' + chave(x, y)); enf.tile('f' + chave(x, y), 'piso', x, y); }
  c.pisada.clear(); c.afundada.clear(); c.firme = true;
  abrirPorteira(c);
}
function afundar(c: Cercado, x: number, y: number) {
  const k = chave(x, y);
  if (c.afundada.has(k)) return;
  c.afundada.add(k); M.zv.bloquear(x, y, true);
  enf.tile('b' + k, 'buraco', x, y);
  sfx('passo-lama');
}
/** o jogador, em cima da lama do cercado, ainda tem para onde ir? */
function temSaida(c: Cercado, x: number, y: number) {
  return DIRS.some((d) => {
    const nx = x + DX[d], ny = y + DY[d];
    if (naPorteira(c, nx, ny)) return c.aberta;
    const outro = doCercado(nx, ny);
    if (outro === c) return !c.afundada.has(chave(nx, ny)) && !c.pisada.has(chave(nx, ny));
    return M.zv.chao(nx, ny);
  });
}
async function atolar(c: Cercado) {
  sfx('passo-lama'); M.cena.tremer(6);
  await quadros(20, (i) => { M.jog.ey = Math.min(8, i >> 1); });
  M.jog.ey = 0;
  await falar('Ixe, atolou! Não sobrou lama firme em volta para dar o próximo passo.\nDois peões puxam você pelo cinto e alisam o cercado de novo.');
  alisar(c);
  recolocar(c.volta[0], c.volta[1], 'n');
  ultimo = [...c.volta];
}
async function tocarSino(c: Cercado) {
  if (c.firme) { await falar(`O sino do ${c.nome} cercado. A lama dele já secou: o chão está firme.`); return; }
  sfx('saveiro-sino');
  await quadros(16);
  const mexida = c.pisada.size > 0;
  alisar(c);
  await falar(mexida ? 'DLEM, DLEM! Os peões correm com o rodo e alisam a lama do cercado. Pode começar de novo.' : 'DLEM, DLEM! O sino chama os peões, mas a lama do cercado ainda está lisinha, sem nenhuma pegada.');
}

// a insígnia chegou: o curral inteiro seca na hora
bus.on('insignia', (n: number) => { if (n === 9 && M.zv?.def.id === ZONA) cercados.forEach(firmar); });

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer();
    const z = M.zv;
    cercados = PLANTA.map((p) => {
      const lama: [number, number][] = [];
      for (let y = p.y0; y <= p.y1; y++) for (let x = 0; x < z.w; x++) if (z.ch(x, y) === 'l') lama.push([x, y]);
      return { ...p, lama, pisada: new Set<string>(), afundada: new Set<string>(), aberta: false, firme: false };
    });
    // a lama pesa na arte, mas o passo segue normal (o atraso do `l` cansaria o quebra-cabeça); fardos ficam amarrados
    for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) { if (z.ch(x, y) === 'l') z.set(x, y, ':'); else if (z.ch(x, y) === 'p') z.set(x, y, 'M'); }
    for (const c of cercados) if (vencido()) firmar(c); else alisar(c);
    ultimo = [M.jog.x, M.jog.y];
  },
  passo(x, y) {
    const ant = ultimo; ultimo = [x, y];
    if (!ant || (ant[0] === x && ant[1] === y)) return false;
    const de = doCercado(ant[0], ant[1]), para = doCercado(x, y);
    if (de && !de.firme) afundar(de, ant[0], ant[1]);
    if (para && !para.firme) {
      if (para.pisada.size === 0) avisar(`Lama do ${para.nome} cercado!`);
      para.pisada.add(chave(x, y));
      if (para.pisada.size === para.lama.length && !para.aberta) {
        abrirPorteira(para); sfx('porta'); M.cena.tremer(4);
        avisar('A porteira abriu!');
      }
      if (!temSaida(para, x, y)) { cena(() => atolar(para)); return true; }
      return false;
    }
    if (de && !de.firme) {
      if (naPorteira(de, x, y)) {
        firmar(de); sfx('item-obtido');
        avisar(`O ${de.nome} cercado secou!`);
      } else {
        alisar(de);
        cena(() => falar('Você saiu do cercado antes de pisar a lama toda.\nOs peões já passaram o rodo: a lama está lisinha outra vez.'));
        return true;
      }
    }
    return false;
  },
  interagir(x, y) {
    const s = cercados.find((c) => c.sino[0] === x && c.sino[1] === y);
    if (s) { cena(() => tocarSino(s)); return true; }
    const c = doCercado(x, y);
    if (c && !c.firme) {
      cena(() => falar(c.afundada.has(chave(x, y)) ? 'Ali a lama engoliu a pegada: ficou um buraco fundo, cheio de água barrenta.' : 'Lama mole do Pantanal. Pisou e saiu, ela afunda.'));
      return true;
    }
    const p = cercados.find((q) => naPorteira(q, x, y));
    if (p && !p.aberta) { cena(() => falar('A porteira está trancada com tramela.\nUm aviso pendurado: "Só abre depois que o cercado inteiro levar pisada."')); return true; }
    if (M.zv.ch(x, y) === 'M' && M.zv.def.mapaChars[y]?.[x] === 'p') { cena(() => falar('Um fardo de feno amarrado ao mourão com corda de couro. Nem a Força tira ele do lugar.')); return true; }
    return false;
  },
  sair() { cercados = []; ultimo = null; enf.esquecer(); },
});
