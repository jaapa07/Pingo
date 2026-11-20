import type { ZonaDef } from '../../core/tipos';
import { grade, saidas, gente, duelista, item, placa, subBosque } from './_a1-grade';

/**
 * A-R7 · Estrada do Buriti (Vila Ferrugem a oeste → Vila Buriti a leste). A estrada velha dos tropeiros, tomada por
 * pedregulhos que rolaram da serra: três paredões só abrem empurrando a pedra (Amuleto da Força, insígnia 7).
 * O atalho do sul passa por rocha rachada (Quebra-pedra). Segredos: o cofre das três pedras (empurrar na ordem certa),
 * a ilhota do açude (Remo), o platô da trepadeira (Escalar, só depois do mapa B) e as saliências da encosta.
 */
const g = grade('A-R7', [
  '##########|##########|##########|##########|##########|##########|##########|##########',
  '##########|##########|##########|##########|##########|##########|##########|##########',
  '##......T.|##..""""..|...T......|....T##...|..""""""..|.....T....|.##...T...|.......T##',
  '##.,......|##."""""".|..........|.....##..t|."""""""".|..........|.##.......|..,.....##',
  '##........|##."""""".|..####e###|#....##...|."""""""".|...###r###|.##.."""".|........##',
  '##..t.....|##..""""..|..#.......|#....##...|..""""""..|...#.....#|.##.""""".|........##',
  '##........|##........|..#..a....|#....##...|..........|...#..h..#|.##.."""".|....T...##',
  '##........|##...1....|..########|#....##...|.....3....|...#######|.##.......|........##',
  '##........|##........|..........|.....##...|..........|..........|.##.......|........##',
  '##....T...|##........|..........|:::::p.:::|::::::::::|::::::::::|:##.......|........##',
  '##........|##....,...|..........|:....##...|..........|..........|:##....6..|........##',
  '##........|##........|...t......|:....##...|....""""..|..........|:##.......|...,....##',
  '##........|##........|..........|:....##...|..."""""".|..........|:##.......|........##',
  '##........|##........|..........|:....##...|...""""...|....T.....|:##.......|........##',
  '##......s.|##........|..........|:....##...|..........|..........|:##.......|.......q##',
  'W:::::::::|p.::::::::|::::::::::|:....##...|..........|..........|:p.:::::::|:::::::::E',
  'W:::::::::|##.:......|..........|.....##...|...4......|..........|.##.......|.........E',
  '##........|##.:......|...""""...|.....##...|..........|.......5..|.##.......|........##',
  '##........|##.:......|..""""""..|.....##...|vvvvvvvvvv|vvvvvv....|.##...C.C.|........##',
  '##...,....|##.:..2...|..""""""..|.....##...|..........|..........|.##.......|.....7..##',
  '##........|##.:......|...""""...|.....##...|.,..""""..|...#pp#...|.##.......|........##',
  '##..T.....|##.:......|..........|.....##...|..""""""..|...#..#...|.##.......|........##',
  '##........|##.:::::::|::::::::::|:::::r.:::|:::::.....|...#k.#...|.##.......|........##',
  '##........|##........|..........|.....##...|..""""""..|...####...|.##.......|........##',
  '##........|##...~~~~~|~~~.......|.....##...|...""""...|..........|.##...T...|.....t..##',
  '##...t....|##..~~~~~~|~~~~......|....t##...|..........|.....t....|.##.......|........##',
  '##........|##..~~;;~~|~~~~......|.....##.i.|..........|..........|.##.......|........##',
  '##........|##..~~;n~~|~~~.......|.....##...|......T...|..........|.##.......|........##',
  '##########|##########|##########|##########|##########|##########|##########|##########',
  '##########|##########|##########|##########|##########|##########|##########|##########',
], {
  W: ':', E: ':', s: '.', q: '.', a: '.', h: '.', k: '.', n: ';', i: '.',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.',
});
const placas = [
  placa(g, 's', 'ESTRADA DO BURITI\nOeste: Vila Ferrugem · Leste: Vila Buriti → Platô da Liga\nPedra no caminho? Empurre. Sem o Amuleto da Força e uma parceira de Terra, Pedra ou Ginga, nem tente: dá hérnia.'),
  placa(g, 'q', 'VILA BURITI logo ali.\n"Última insígnia da Costa do Sol. Respire fundo."'),
];
const zona: ZonaDef = {
  id: 'A-R7', nome: 'Estrada do Buriti', mapa: 'A', tipo: 'rota', tileset: 'serra', musica: 'rota-dia-A', arena: 'mata', passo: 8,
  mapaChars: subBosque(g.mapa, false),
  objetos: [...placas.map((p) => p.objeto), { o: 'cuieira', x: 17, y: 12, cor: 'branca', script: 'cuieira' }],
  placas: placas.map((p) => p.placa),
  warps: [...saidas(g, 'W', 'A8', 58, 15, 'o'), ...saidas(g, 'E', 'A10', 1, 15, 'l')],
  npcs: [
    // Parque Safári (spec 10A item 33): o lenhador dá o Tronco Oco depois da Liga (src/data/eventos/posliga.ts)
    { id: 'safari-lenhador', sprite: 'npc-homem-3', x: 6, y: 11, dir: 's', se: 'flag:liga-vencida', script: 'safari-do-tronco' },
    duelista(g, '1', 'A-R7-1', 'cl-montanhista', 's', 4),
    duelista(g, '2', 'A-R7-2', 'cl-vaqueiro', 'o', 3),
    duelista(g, '3', 'A-R7-3', 'cl-garimpeiro', 's', 3),
    duelista(g, '4', 'A-R7-4', 'cl-capoeirista', 'o', 4),
    duelista(g, '5', 'A-R7-5', 'cl-ferreiro', 'o', 4, { mov: 'olhar' }),
    duelista(g, '6', 'A-R7-6', 'cl-biologa', 'o', 4),
    duelista(g, '7', 'A-R7-7', 'cl-repentista', 'o', 4),
  ],
  itens: [
    item(g, 'a', 'A-R7', 'pt-46'),
    item(g, 'h', 'A-R7', 'pepita'),
    item(g, 'k', 'A-R7', 'pt-24'),
    item(g, 'n', 'A-R7', 'pedra-mare'),
    item(g, 'i', 'A-R7', 'elixir-andiroba'),
    { x: 5, y: 26, item: 'buriti', qtd: 3, oculto: true, flag: 'item:A-R7:5,26' },
    { x: 74, y: 3, item: 'rapadura', oculto: true, flag: 'item:A-R7:74,3' },
  ],
  // tabela 6.4 não lista a Estrada do Buriti (zona nova): espécies do mapa A já vistas em rotas anteriores, em 2º estágio
  habitats: [
    {
      metodo: 'grama', taxa: 0.1,
      dia: [{ e: 11, nv: [33, 36], peso: 24 }, { e: 96, nv: [33, 36], peso: 24 }, { e: 34, nv: [34, 37], peso: 20 }, { e: 42, nv: [34, 37], peso: 20 }, { e: 82, nv: [35, 37], peso: 12 }],
      noite: [{ e: 21, nv: [33, 36], peso: 30 }, { e: 44, nv: [34, 37], peso: 26 }, { e: 60, nv: [33, 36], peso: 24 }, { e: 34, nv: [34, 37], peso: 20 }],
      camadas: [{ apos: 12, dia: [{ e: 12, nv: [40, 43], peso: 25 }, { e: 96, nv: [40, 43], peso: 25 }, { e: 34, nv: [40, 44], peso: 20 }, { e: 42, nv: [40, 44], peso: 20 }, { e: 82, nv: [41, 44], peso: 10 }], noite: [{ e: 21, nv: [40, 43], peso: 30 }, { e: 44, nv: [40, 44], peso: 30 }, { e: 60, nv: [40, 43], peso: 20 }, { e: 34, nv: [40, 44], peso: 20 }] }],
    },
    { metodo: 'arvore', dia: [{ e: 154, nv: [33, 36], peso: 45 }, { e: 150, nv: [33, 36], peso: 30 }, { e: 23, nv: [34, 37], peso: 25 }], noite: [{ e: 60, nv: [33, 36], peso: 60 }, { e: 44, nv: [34, 37], peso: 40 }] },
    { metodo: 'rocha', todos: [{ e: 167, nv: [33, 36], peso: 60 }, { e: 168, nv: [35, 38], peso: 40 }] },
    { metodo: 'agua', taxa: 0.08, todos: [{ e: 58, nv: [33, 37], peso: 55 }, { e: 25, nv: [33, 36], peso: 45 }] },
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [14, 18], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 37, nv: [24, 28], peso: 60 }, { e: 39, nv: [26, 30], peso: 40 }] },
    { metodo: 'pesca-mestra', todos: [{ e: 38, nv: [34, 38], peso: 55 }, { e: 40, nv: [36, 39], peso: 45 }] },
  ],
};
export default zona;
