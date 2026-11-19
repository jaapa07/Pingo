/**
 * Mapa de Pindorama para o mapa-múndi e para o minimapa de habitat do Diário: as duas regiões (A Costa do Sol,
 * B Sertão das Névoas) em grades de caracteres (1 caractere = 1 célula de terreno), os locais das tabelas 4.1/4.2
 * do spec com a posição na grade, as ligações a pé e as duas linhas de transporte (trem e Saveiro).
 */
import { jogo } from '../../core/estado';
import { mosaico, caixa } from './comum';

/* legenda: ~ mar · - raso · . areia · , campo · T mata · ^ serra · A cume nevado · % mangue · c cerrado · p pantanal · v chapada · x brejo · * geada · n planalto */
export const GRADE_A = [
  '~~~~~~~~-.,,,,,,,,,,,,,,,,,,,,,^^^^^',
  '~~~~~-..,,,,,,,,,,,,,,,,,,,,,^^A^^^^',
  '~~~~-.,,,,,,,,,,,,,,,,,,,,^^^AAAAA^^',
  '~~~--.,,,,,,,,,,,,,,,,,,,^^^AAAAAAA^',
  '~~--.,,,,,,T,,,,,,,,,,,,,^^^^AAAAAA^',
  '~~-.,,,,,TTTTT,,,,,,,,,,^^^^^^^A^^A^',
  '~~-.,,,,TTTTTTT,,,,,,,,,,^^^^^^^^^A^',
  '~~-.,,,TTTTTTTTT,,,,,,,,,^^^^^^^^AAA',
  '~~-.,,,,TTTTTTT,,,,T,,,,,,^^^^^^^^A^',
  '~--.,,,,,TTTTT,,,TTTTT,,,,,,,^^^^^A^',
  '~-.,,,,,,,,T,,,TTTTTTTT,,,,,^^^^^^^^',
  '~--.,,,,,,,,TTTTTTTTTTTT,,,^^^^^^^^^',
  '~~-.,,,,,,,TTTTTTTTTTTT,,^^^^^^^^^^^',
  '~~-.,,,,,,TTTTTTTTTTTT,,,^^^^^^^^^^^',
  '~~-.,,,,,,,TTTTTTTTT,,,,^^^^^^^^^^^^',
  '~~-.,,,,,,,,TTTTTTT,,,,,,^^^^^^^^^^^',
  '~~--.,,,,,,,,,,T,,,,,,,,,^^^^^^^^^^^',
  '~~~-.,,,,,,,,,,,,,,,,,,,,,,^^^^^^^^^',
  '~~~-.,,,,,,,,,,,,,,,,,,,,,,,,,^^^^^^',
  '~~--.,,,,,,,,,,,,,,,,,,,,,,,,,,^^^^^',
  '~~-.,,,,,,,,,,,,,,,,,,,,,,,,,,,^^^^^',
  '~~--.,,,,,,,,,,,,,,,,,,,,,,,,,,,,^^^',
  '~~~-.,,,,,,,,.................,,,,,,',
  '~~~-.,,,,,,..----------------%%%%%%.',
  '~~~--......---~~~~~~~~~~~~~~-%%%%%--',
  '~~~~--------~~~~~~~~~~~~~~~~~-----~~',
  '~~~~~~~~~~~~~~~~~~~-...-~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~~~~-.,,..-~-.-~~~~~~~',
  '~~~~~~~~~~~~~~~~~~~-...-~-.,.-~~~~~~',
  '~~~~~~~~~~~~~~~~~~~~---~~~-.-~~~~~~~',
];
export const GRADE_B = [
  '^^^^^ccccccc*****ccccccccccccccTTccc',
  '^^A^^^^cccc*********ccccccccccTTTTTc',
  '^AAA^^^^c****-********cccccccTTTTTTT',
  '^AAA^^^^c***---*********nnnccTTTTTTT',
  'AAAAA^^^*****-********nnnnnnnTTTTTTT',
  '^AAA^^^^^************nnnnnnnnTTTTTTT',
  '^AAA^^^^c***********nnnnnnnnnTTTTTTT',
  '^^A^^^^^ccc*********cnnnnnnnnnTTTTTc',
  '^^^^^^^^cccccccxccccccnnnnnnnnnccccc',
  '^^^^^^^ccccccxxxxxcccccnnnnnnncccccc',
  '^^^^^^ccccccxxxxxxxccccccccccccccccc',
  '^^^^^^cccccxxxxxxxxxcccccccccccccccc',
  '^^^^^^ccccxxxxxxxxxccccccccccccccvcc',
  '^^^^^^cccxxxxxxxxxcccccccccccvvvvvvc',
  '^^^^^^^cccxxxxxxcccccccccccvvvvvvvvv',
  '^^^^^^ccccccxcccccccccccccvvvvvvv^^^',
  '^^^^^^cccccccccccccccccccccvvvvvv^^^',
  '^^^^^^cccccccccccccccccccccccvvvv^^^',
  '^^^^^^ccccccccccccccccccccccvvvvvvvv',
  '^^^^^^ccccc,,,,ccccccccccccvvvvvvvvv',
  '^^^^^^c,,,,,,,,,,ccccccccccvvvvvvvvv',
  '^^^^^^,,,,,,,,,,,,ccccpppccvvvvvvvvv',
  '^^^^^^,,,,,,,,,,,ccpppppppvvvvvvvvvv',
  '^^^^^,,,,,,,,,,,ccpppppppppvvvvvvvvv',
  '^^^^^^,,,,,,,,,ccppppppppppvvvvvvvvv',
  '^^^^^c,,,,,,,,,cccpppppppppvvvvvvvvv',
  '^^^^^cc,,,,,,,cccpppppppppppvvvvvvvc',
  '^^^^^cccccccccccccpppppppppppppccccc',
  '^^^^ccccccccccccccccppppppppppcccccc',
  '^^^^pppppppppppppppppppppppppppppppp',
];
export const MAPA_W = 36, MAPA_H = 30;

export type TipoLocal = 'cidade' | 'rota' | 'mata' | 'caverna' | 'agua' | 'serra' | 'ruina';
export interface Local { id: string; nome: string; mapa: 'A' | 'B' | 'PP'; x: number; y: number; tipo: TipoLocal; nota: string; /** nº da insígnia do ginásio da cidade */ ginasio?: number }
const L = (id: string, nome: string, x: number, y: number, tipo: TipoLocal, nota: string, ginasio?: number): Local => ({ id, nome, mapa: id === 'PP' ? 'PP' : (id[0] as 'A' | 'B'), x, y, tipo, nota, ginasio });
export const LOCAIS: Local[] = [
  L('A1', 'Vila Jacarandá', 8, 21, 'cidade', 'Casa da família e laboratório da Profª Ipê.'),
  L('A-R1', 'Trilha do Ipê', 8, 18, 'rota', 'Caminho de terra entre ipês amarelos.'),
  L('A2', 'Vila Caiçara', 8, 15, 'cidade', 'Vila de pescadores de pipa.', 1),
  L('A-R2', 'Campos de Restinga', 10, 12, 'rota', 'Dunas baixas e cajueiros.'),
  L('A-MS', 'Mata dos Sabiás', 13, 12, 'mata', 'Labirinto de árvores; vale sacudir os galhos.'),
  L('A3', 'Bosque Alto', 17, 11, 'cidade', 'Cidade nas copas, ligada por pontes de corda.', 2),
  L('A-R3', 'Trilha dos Cipós', 20, 13, 'rota', 'Cipós grossos e um riacho bom de pesca.'),
  L('A-GE', 'Gruta do Eco', 21, 16, 'caverna', 'Toda palavra volta três vezes.'),
  L('A4', 'Porto Sereia', 19, 20, 'cidade', 'Estação do trem, cais e mercado de peixe.', 3),
  L('A-R4', 'Estrada da Usina', 23, 20, 'rota', 'Postes velhos acompanham a estrada.'),
  L('A-US', 'Usina Velha', 27, 20, 'ruina', 'Usina abandonada; faíscas no escuro.'),
  L('A-BA', 'Baía Azul', 16, 25, 'agua', 'Águas calmas que ligam o porto às ilhas.'),
  L('A5', 'Cidade Coral', 21, 27, 'cidade', 'Ilha das rendeiras e cais do Saveiro.', 6),
  L('A6', 'Ilha do Farol', 27, 28, 'cidade', 'O farol do inventor ilumina a baía.', 7),
  L('A-PR', 'Praia das Tartarugas', 11, 24, 'rota', 'Ninhos na areia em noites de lua.'),
  L('A-MG', 'Manguezal', 31, 23, 'mata', 'Raízes, caranguejos e jacarés.'),
  L('A-GB', 'Gruta Breu', 24, 24, 'caverna', 'Escuridão completa sem o Lampião.'),
  L('A7', 'Serra Fumaça', 27, 16, 'cidade', 'Casario colonial envolto em neblina.', 8),
  L('A-R5', 'Encosta da Fumaça', 30, 18, 'rota', 'Trilha de pedra ao redor da serra.'),
  L('A-R6', 'Rio Cachoeira-Véu', 27, 12, 'agua', 'Quedas d’água em degraus.'),
  L('A8', 'Vila Ferrugem', 26, 8, 'cidade', 'Antiga cidade operária.', 12),
  L('A-RS', 'Recife Submerso', 13, 27, 'agua', 'Corais sob a Baía Azul.'),
  L('A-MT', 'Monte Tupã', 29, 5, 'serra', 'Paredões, grutas e cascatas.'),
  L('A9', 'Aldeia Tupã', 32, 2, 'cidade', 'Aldeia no topo do monte.', 16),
  L('B1', 'Vila Buriti', 10, 23, 'cidade', 'Estação do trem e quintal da Drª Buriti.', 4),
  L('B-R1', 'Vereda dos Buritis', 13, 21, 'rota', 'Palmeiras em fila ao longo do brejo.'),
  L('B-CE', 'Cerrado Aberto', 17, 19, 'rota', 'Cupinzeiros, ipês e emas.'),
  L('B-PA', 'Pantanal Alagado', 21, 23, 'agua', 'Água rasa a perder de vista.'),
  L('B2', 'Pantanal Grande', 25, 22, 'cidade', 'Cidade sobre palafitas.', 5),
  L('B9', 'Porto Pantaneiro', 23, 27, 'cidade', 'Cais do Saveiro no Sertão.'),
  L('B-R2', 'Estrada Vermelha', 28, 25, 'rota', 'Terra roxa e rochas rachadas.'),
  L('B3', 'Chapada Rubra', 31, 22, 'cidade', 'Cidade de garimpo junto à mina.', 9),
  L('B-CH', 'Chapada dos Paredões', 31, 18, 'serra', 'Paredões vermelhos com trepadeiras.'),
  L('B-CV', 'Caverna Vulcânica', 34, 16, 'caverna', 'O chão é morno; dizem que algo dorme lá.'),
  L('B4', 'Arraial Brasa', 29, 14, 'cidade', 'Forjas e fogueira de São João.', 10),
  L('B-R3', 'Trilha da Roda', 25, 15, 'rota', 'O som do berimbau vem de longe.'),
  L('B5', 'Cidade Ginga', 21, 15, 'cidade', 'Rodas de capoeira e mercado.', 11),
  L('B-TA', 'Túnel Alagado', 18, 13, 'caverna', 'Passagem submersa até o brejo.'),
  L('B6', 'Brejo Roxo', 15, 11, 'cidade', 'Vila de palafitas sobre o lodo roxo.', 13),
  L('B-VV', 'Vale do Veneno', 11, 13, 'mata', 'Pântano de névoa arroxeada.'),
  L('B-R4', 'Subida da Serra', 10, 8, 'serra', 'Subida íngreme com pedregulhos.'),
  L('B7', 'Serra da Geada', 15, 5, 'cidade', 'Araucárias brancas de geada.', 14),
  L('B-SG', 'Campos de Altitude', 19, 3, 'rota', 'Capim dourado e vento frio.'),
  L('B-LG', 'Lagoa Gelada', 13, 2, 'agua', 'Espelho d’água entre as araucárias.'),
  L('B-R5', 'Caminho das Névoas', 22, 6, 'rota', 'Só o Lampião abre a névoa.'),
  L('B8', 'Planalto Lume', 27, 6, 'cidade', 'Observatório à beira dos cânions.', 15),
  L('B-FA', 'Floresta Ancestral', 32, 4, 'mata', 'Árvores mais velhas que as cidades.'),
  L('PP', 'Pico Pindorama', 0, 4, 'serra', 'Portão dos Guardiões e salão do Conselho.'),
];
const POR_ID = new Map(LOCAIS.map((l) => [l.id, l]));
export const local = (id: string) => POR_ID.get(id);
export const LIGACOES: [string, string][] = [
  ['A1', 'A-R1'], ['A-R1', 'A2'], ['A2', 'A-R2'], ['A-R2', 'A-MS'], ['A-MS', 'A3'], ['A3', 'A-R3'], ['A-R3', 'A-GE'], ['A-GE', 'A4'], ['A4', 'A-R4'], ['A-R4', 'A-US'],
  ['A4', 'A-BA'], ['A-BA', 'A5'], ['A5', 'A6'], ['A-BA', 'A-PR'], ['A-BA', 'A-RS'], ['A6', 'A-MG'], ['A5', 'A-GB'], ['A-GB', 'A7'], ['A7', 'A-R5'], ['A7', 'A-R6'], ['A-R6', 'A8'], ['A8', 'A-MT'], ['A-MT', 'A9'], ['A-MT', 'PP'],
  ['B1', 'B-R1'], ['B-R1', 'B-CE'], ['B-CE', 'B-PA'], ['B1', 'B-PA'], ['B-PA', 'B2'], ['B-PA', 'B9'], ['B9', 'B-R2'], ['B-R2', 'B3'], ['B3', 'B-CH'], ['B-CH', 'B4'], ['B-CH', 'B-CV'], ['B4', 'B-R3'], ['B-R3', 'B5'], ['B5', 'B-TA'], ['B-TA', 'B6'],
  ['B6', 'B-VV'], ['B6', 'B-R4'], ['B-R4', 'B7'], ['B7', 'B-SG'], ['B7', 'B-LG'], ['B7', 'B-R5'], ['B-R5', 'B8'], ['B8', 'B-FA'], ['B-R4', 'PP'],
];
export const NOME_TIPO_LOCAL: Record<TipoLocal, string> = { cidade: 'Cidade', rota: 'Rota', mata: 'Mata', caverna: 'Caverna', agua: 'Águas', serra: 'Serra', ruina: 'Ruína' };

/** local do mapa a que uma zona pertence ('A1-quarto' → 'A1', 'A-US-2' → 'A-US') */
export function baseZona(id: string): string | undefined {
  let melhor: string | undefined;
  for (const l of LOCAIS) if ((id === l.id || id.startsWith(l.id + '-')) && (!melhor || l.id.length > melhor.length)) melhor = l.id;
  return melhor;
}
export const nomeLocal = (zona: string | undefined) => (zona ? local(baseZona(zona) ?? '')?.nome ?? zona : '—');
export const visitou = (id: string) => !!jogo.save.flags['visitou:' + id];
export function marcarVisita(zona: string) { const b = baseZona(zona); if (b) jogo.save.flags['visitou:' + b] = true; }
export const localAtual = () => baseZona(jogo.save.jogador.zona);

function fundos(cel: number): Record<string, string> {
  const f = (base: string, det: string, dx = 0, dy = 0) => (cel < 4 ? base : `linear-gradient(${base} 0 3px,transparent 3px) ${dx}px ${dy}px/4px 4px,linear-gradient(90deg,${det} 0 1px,transparent 1px) ${dx + 1}px 0/4px 4px,${base}`);
  const onda = (base: string, det: string) => (cel < 4 ? base : `linear-gradient(${base} 0 3px,transparent 3px) 0 0/8px 4px,linear-gradient(90deg,${det} 0 3px,transparent 3px) 1px 0/8px 4px,${base}`);
  return {
    '~': onda('#1f4f7a', '#2f86c4'), '-': onda('#2f86c4', '#6fc7e8'), '.': f('#f6e6b8', '#e8c07a'), ',': f('#8fd45a', '#4fa346'), T: f('#2f6b3a', '#4fa346', 2, 2),
    '^': f('#9c6434', '#6b4226', 1, 1), A: f('#c4c6d4', '#fff8e7', 2, 1), '%': f('#1f7a6c', '#3fbfa0', 1, 2), c: f('#e8c07a', '#c98f4e', 2, 0), p: onda('#3fbfa0', '#2f86c4'),
    v: f('#f58a4b', '#a32638', 1, 2), x: f('#9a5fc4', '#5b3a8c', 0, 1), '*': f('#c8f0f4', '#6fc7e8', 2, 2), n: f('#c4c6d4', '#8a8aa0', 3, 1),
  };
}
export interface MapaDuplo { el: HTMLElement; w: number; h: number; /** centro do local em px, relativo ao elemento */ pos(id: string): [number, number] }
/** desenha as duas regiões lado a lado (`cel` px por célula) com o Pico Pindorama no vão entre elas */
export function criarMapaDuplo(cel: number, vao: number, ligacoes = true): MapaDuplo {
  const wm = MAPA_W * cel, h = MAPA_H * cel, w = wm * 2 + vao;
  const el = caixa('mapa-duplo', w, h);
  const fs = fundos(cel);
  const a = mosaico(GRADE_A, fs, cel), b = mosaico(GRADE_B, fs, cel); b.style.left = wm + vao + 'px';
  const serra = caixa('mapa-vao', vao, h); serra.style.left = wm + 'px';
  serra.style.background = cel < 4 ? '#6b4226' : `linear-gradient(#6b4226 0 3px,transparent 3px) 0 0/4px 4px,linear-gradient(90deg,#3b2a35 0 1px,transparent 1px) 1px 0/4px 4px,#6b4226`;
  el.append(a, serra, b);
  const pos = (id: string): [number, number] => {
    const l = local(id); if (!l) return [0, 0];
    if (l.mapa === 'PP') return [wm + Math.floor(vao / 2), l.y * cel + Math.floor(cel / 2)];
    return [(l.mapa === 'B' ? wm + vao : 0) + l.x * cel + Math.floor(cel / 2), l.y * cel + Math.floor(cel / 2)];
  };
  if (ligacoes) for (const [de, para] of LIGACOES) {
    const [x1, y1] = pos(de), [x2, y2] = pos(para);
    const agua = local(de)?.tipo === 'agua' || local(para)?.tipo === 'agua';
    const cor = agua ? '#c8f0f4' : '#fff8e7';
    const hz = caixa('mapa-via'), vt = caixa('mapa-via');
    hz.style.cssText += `left:${Math.min(x1, x2)}px;top:${y1}px;width:${Math.abs(x2 - x1) + 1}px;height:1px;background:${cor}`;
    vt.style.cssText += `left:${x2}px;top:${Math.min(y1, y2)}px;width:1px;height:${Math.abs(y2 - y1) + 1}px;background:${cor}`;
    el.append(hz, vt);
  }
  return { el, w, h, pos };
}
