/** Monta um PixModel de pessoa a partir de uma ficha (paleta + visual + vistas). */
import type { PixModel, Vista, Paleta } from '../../../render/types';
import { PELES, CABELOS, TONS, lum } from './paletas';
import type { NomePele, NomeCabelo, NomeTom, Rampa } from './paletas';
import { construir, PORTES, HIP } from './corpo';
import type { Visual } from './corpo';
import { HY, TOPO } from './pecas';
import { animsMapa, animsBatalha, animsCostas, animsRetrato } from './anims';

export interface Ficha {
  id: string;
  pele: NomePele;
  cabelo: NomeCabelo | Rampa;
  /** roupa A, roupa B e detalhe */
  a: NomeTom | Rampa; b: NomeTom | Rampa; d: NomeTom | Rampa;
  /** cor da íris nos carimbos de batalha/retrato */
  iris?: string;
  contorno?: string;
  v: Visual;
  /** vistas além de `mapa` */
  batalha?: boolean; retrato?: boolean; jogador?: boolean;
  /** ajustes finos de enquadramento */
  zoomBatalha?: number; dxBatalha?: number; dyRetrato?: number;
}

const CONTORNO: Record<NomePele, string> = { clara: '#3b2236', rosada: '#3d2034', oliva: '#35222e', canela: '#33202e', morena: '#2f1c2c', castanha: '#2a1a2a', retinta: '#241626' };
const ton = (t: NomeTom | Rampa): Rampa => (typeof t === 'string' ? (TONS[t] as Rampa) : t);

/* Carimbos de olho (desenhados olhando para a DIREITA da tela). p pupila · w brilho · i íris · s pele · t sombra da pele */
const OLHO_MAPA = ['p', 'p'];
const OLHO_BAT = ['pp', 'wp', 'pi'];
const OLHO_BAT_FECHADO = ['ssss', 'pppp', 'ssss'];
const OLHO_RET = ['.ppp', 'pwpp', 'pppp', 'piip', '.ii.'];
const OLHO_RET_FELIZ = ['ssss', 'spps', 'pssp', 'ssss', 'ssss'];

export function pessoa(f: Ficha): PixModel {
  const rampas: Rampa[] = [PELES[f.pele] as Rampa, typeof f.cabelo === 'string' ? (CABELOS[f.cabelo] as Rampa) : f.cabelo, ton(f.a), ton(f.b), ton(f.d)];
  let escuro = 1;
  for (let i = 2; i < rampas.length; i++) if (lum(rampas[i][0]) < lum(rampas[escuro][0])) escuro = i;
  const paleta: Paleta = {
    rampas,
    contorno: f.contorno ?? CONTORNO[f.pele],
    extras: { p: '#1b1524', w: '#ffffff', i: f.iris ?? '#5a3a2a', s: rampas[0][1], t: rampas[0][0] },
  };
  const v = f.v;
  const P = PORTES[v.porte ?? 'adulto'];
  const topo = Math.max(v.chapeu ? TOPO[v.chapeu] : 0, v.chapeu2 ? TOPO[v.chapeu2] : 0, v.cabelo === 'black' ? 0.14 : v.cabelo === 'coque' || v.cabelo === 'rabo-alto' ? 0.1 : 0.03);
  const vistas: Record<string, Vista> = {
    mapa: { cell: [24, 32], pivot: [12, 30], altura: 1.6, yaw: 0, pitch: 15, anims: animsMapa(!!f.jogador, !!v.propNoMapa, v.propBraco), olho: OLHO_MAPA },
  };
  // proporção de batalha: pernas e tronco esticam, cabeça encolhe (ver anims.compor)
  const base = P.e[1] * (HIP * P.perna + 0.02 + 0.31 * P.tronco);
  const kc = P.cab * P.cabBat;
  const alt = base + kc * (HY + 0.28 + topo);
  if (f.batalha) {
    const ppu = Math.min(40, 57 / alt) * (f.zoomBatalha ?? 1);
    vistas.batalha = { cell: [64, 64], pivot: [33 + (f.dxBatalha ?? 0), 61], altura: 64 / ppu, yaw: -50, pitch: 10, anims: animsBatalha(P, 28, v.propBraco), olho: OLHO_BAT, olhoFechado: OLHO_BAT_FECHADO };
  }
  if (f.jogador) {
    const ppu = Math.min(44, 58 / alt);
    vistas.costas = { cell: [64, 64], pivot: [30, 61], altura: 64 / ppu, yaw: 140, pitch: 16, anims: animsCostas(P), olho: ['.'] };
  }
  if (f.retrato) {
    const ppu = (27 / (kc * 0.6)) / (1 + topo * 0.9);
    const yc = base + kc * HY;
    vistas.retrato = { cell: [48, 48], pivot: [25, Math.round(25 + (f.dyRetrato ?? 0) + topo * ppu * 0.45 + yc * Math.cos((6 * Math.PI) / 180) * ppu)], altura: 48 / ppu, yaw: -58, pitch: 6, anims: animsRetrato(P, 38), olho: OLHO_RET, olhoFechado: OLHO_RET_FELIZ };
  }
  return { id: f.id, categoria: 'pessoa', paleta, build: () => construir(v, escuro, !!f.jogador), vistas, minMalhas: 20, limiares: [0.58, 0.98] };
}
