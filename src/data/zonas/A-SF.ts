import type { ZonaDef } from '../../core/tipos';
import { grade, obj, entrada, saidas, gente, placa } from './_a1-grade';

/**
 * A-SF · Portaria do Parque Safári do Buriti-Alto (spec 10A item 33, pós-Liga). A cerca ao norte é o parque;
 * a bilheteira Dona Ingá cobra a entrada, entrega as Cuias-Safári e abre a porteira (evento `safari-porteira`,
 * src/data/eventos/posliga.ts). A casa do dono, Seu Jatobá (`A-SF-casa`), é onde se entregam os objetos de
 * ambiente que abrem os setores novos. Oeste: Vale do Buriti-Alto (`A-GN`).
 */
const g = grade('A-SF', [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTT',
  'TTTTffffff|ffffffffff|ffTTTT',
  'TT........|P.I.......|..A.TT',
  'TT........|..:.......|....TT',
  'TT..B.....|..:.......|....TT',
  'TT........|..:.......|....TT',
  'TT....K...|..:.......|....TT',
  'TT........|..:.......|....TT',
  'TT........|..:....H..|....TT',
  'W:::::::::|::::::::::|....TT',
  'W.........|..........|....TT',
  'TT.....J..|..........|....TT',
  'TT..,.....|,......,..|.,..TT',
  'TTbbB....b|b.....B...|.bbbTT',
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTT',
], { P: '.', I: '.', A: '.', B: '.', K: '.', H: '.', J: '.', W: ':' });
const placas = [
  placa(g, 'P', 'PARQUE SAFÁRI DO BURITI-ALTO\nEntrada: 500 patacas. 30 Cuias-Safári e 500 passos.\nLá dentro não se luta: isca, pedra, paciência e cuia.'),
  placa(g, 'J', 'O parque cresce com a ajuda de quem visita. Achou pedra de rio, muda de buriti ou tronco oco pela Costa do Sol? Leve ao Seu Jatobá.'),
];
const zona: ZonaDef = {
  id: 'A-SF', nome: 'Portaria do Safári', mapa: 'A', tipo: 'cidade', tileset: 'cerrado', musica: 'cidade-catira', arena: 'cerrado', passo: 9,
  pouso: [12, 9],
  mapaChars: g.mapa,
  objetos: [
    ...g.todos('B').map(([x, y]) => ({ o: 'buriti', x, y })),
    obj(g, 'H', 'casa-c'),
    obj(g, 'A', 'ipe-amarelo'),
    ...placas.map((p) => p.objeto),
  ],
  placas: placas.map((p) => p.placa),
  warps: [
    ...saidas(g, 'W', 'A-GN', 30, 10, 'o'),
    entrada(g, 'H', 'casa-c', 'A-SF-casa', 5, 7),
  ],
  npcs: [
    gente(g, 'I', 'safari-bilheteira', 'npc-mulher-1', 'Bilheteira Dona Ingá', { dir: 's', script: 'safari-porteira' }),
    gente(g, 'K', 'safari-guia', 'cl-observadora', 'Guia Jaci', { mov: 'vagar', script: 'safari-guia' }),
  ],
};
export default zona;
