/**
 * Tilesets de INTERIOR (dados puros). Quem desenha é tools/scenery/interior (pintor próprio, usado pelo bake).
 * Um tileset de interior tem vários TEMAS; cada tema escolhe paleta (rampas de 4 tons escritas à mão),
 * o padrão de piso/parede e as peças de cada caractere da legenda de docs/ZONAS.md.
 * O tema de uma zona vem, nesta ordem: do pseudo-objeto `{ o: 'tema', x: 0, y: 0, tema: '<id>' }` em `objetos`,
 * das regras `porZona` (expressão sobre o id da zona) e, por fim, do rodízio `rodizio` (casas nunca repetem).
 */
export type RampaHex = [string, string, string, string]; // escuro (contorno), sombra, base, luz
export type PisoTipo = 'tabuas' | 'tabuasV' | 'ladrilho' | 'xadrez' | 'hidraulico' | 'cimento' | 'pedra' | 'terra' | 'grade' | 'chapa' | 'deck' | 'gelo' | 'carpete' | 'esteira' | 'rocha' | 'grama' | 'areia' | 'estrelas' | 'renda';
export type ParedeTipo = 'reboco' | 'azulejo' | 'tabuas' | 'tijolo' | 'pedra' | 'metal' | 'rocha' | 'toras' | 'taipa' | 'vidro' | 'cortina' | 'cupula' | 'papel';
export type PerigoTipo = 'toxico' | 'espinho' | 'lava' | 'choque' | 'vento' | 'breu' | 'brasa' | 'vapor' | 'luz' | 'prova';
export interface CoresInterior {
  piso: RampaHex; piso2: RampaHex; parede: RampaHex; rodape: RampaHex; teto: RampaHex; tapete: RampaHex;
  agua: RampaHex; perigo: RampaHex; madeira: RampaHex; metal: RampaHex; tecido: RampaHex; planta: RampaHex;
  barro: RampaHex; luz: RampaHex; claro: RampaHex;
}
export interface TemaInterior {
  id: string; desc: string;
  cores: Partial<CoresInterior>;
  piso: PisoTipo; corredor: PisoTipo; alt: PisoTipo; parede: ParedeTipo;
  perigo?: PerigoTipo;
  /** peça especial por caractere da legenda (ver tools/scenery/interior/tiles.ts) */
  pecas?: Record<string, string>;
}
export interface TilesetInterior {
  nome: string; desc: string;
  base: CoresInterior;
  temas: TemaInterior[];
  /** [expressão regular sobre o id da zona, id do tema] — a primeira que casar vale */
  porZona: [string, string][];
  /** temas usados em rodízio quando nenhuma regra casa (a escolha depende só do id da zona) */
  rodizio: string[];
}

export const CORES_BASE: CoresInterior = {
  piso: ['#4a2c38', '#7c5040', '#a87850', '#cc9c68'], piso2: ['#5c3440', '#8c4c40', '#b86c48', '#dc9460'],
  parede: ['#8c8494', '#c8c0b8', '#f0e8d8', '#fffcf0'], rodape: ['#3c2434', '#644038', '#8c6444', '#b48c58'],
  teto: ['#1c1830', '#2c2844', '#443c5c', '#645c78'], tapete: ['#7c2434', '#b83c44', '#e06c54', '#f8b47c'],
  agua: ['#1c4c94', '#2c7cc4', '#5cb0e0', '#c4ecf4'], perigo: ['#4c1c74', '#8430b0', '#c058dc', '#f0a8f8'],
  madeira: ['#3c2434', '#6c4438', '#9c6c48', '#c89c64'], metal: ['#2c3048', '#566078', '#8c98a8', '#c8d4d8'],
  tecido: ['#1c4c8c', '#2c7cc4', '#6cb4e4', '#d4f0fc'], planta: ['#143c34', '#24744c', '#44a850', '#94d860'],
  barro: ['#6c2c1c', '#a85030', '#d88048', '#f4b880'], luz: ['#c87c14', '#fcc02c', '#fff08c', '#fffce0'],
  claro: ['#8c94a8', '#c4ccd4', '#ecf0f0', '#ffffff'],
};

/** CASA: moradias brasileiras — cada tema é um jeito de morar de uma região do jogo. */
export const casa: TilesetInterior = {
  nome: 'casa', desc: 'Casas: caiçara, colonial, palafita, sertaneja e serrana', base: CORES_BASE,
  temas: [
    { id: 'caicara', desc: 'casa caiçara: assoalho claro, parede caiada com barra azul, esteira de palha', piso: 'tabuas', corredor: 'esteira', alt: 'ladrilho', parede: 'reboco',
      cores: { rodape: ['#143c74', '#1c5ca4', '#3c8cd0', '#84c0ec'], piso2: ['#8c6c34', '#c4a04c', '#e4c870', '#f8e8a0'] } },
    { id: 'colonial', desc: 'sobrado colonial: assoalho escuro encerado, barrado de azulejo e ladrilho hidráulico', piso: 'tabuas', corredor: 'hidraulico', alt: 'hidraulico', parede: 'azulejo',
      cores: { piso: ['#2c1828', '#50282c', '#7c4434', '#a46844'], piso2: ['#3c3c5c', '#b4a488', '#e8dcc0', '#c4583c'], parede: ['#9c8c74', '#e0cc94', '#f8e8b4', '#fffcdc'], rodape: ['#1c3c84', '#3468b8', '#f0f0e8', '#84b4e4'], tapete: ['#143c54', '#1c6c7c', '#3ca49c', '#a4e4c4'] } },
    { id: 'palafita', desc: 'palafita pantaneira: tábuas largas com frestas, parede de tábua e rede armada', piso: 'deck', corredor: 'esteira', alt: 'tabuasV', parede: 'tabuas',
      cores: { piso: ['#33243a', '#5c4040', '#8a644a', '#b89060'], parede: ['#4c3038', '#7c5440', '#a88050', '#d0ac70'], rodape: ['#33243a', '#5c4040', '#8a644a', '#b89060'], piso2: ['#7c6424', '#b89838', '#dcc45c', '#f4e890'], tapete: ['#1c5c3c', '#2c8c4c', '#5cbc5c', '#b4e47c'] } },
    { id: 'sertaneja', desc: 'casa do sertão: chão de cimento queimado vermelho, parede de taipa e fogão a lenha', piso: 'cimento', corredor: 'ladrilho', alt: 'terra', parede: 'taipa',
      cores: { piso: ['#5c1c20', '#8c2c28', '#b44434', '#d46c4c'], piso2: ['#6c4c2c', '#a47844', '#c8a064', '#e4c88c'], parede: ['#8c5c3c', '#c4905c', '#e4b880', '#f8dcac'], rodape: ['#5c2c1c', '#8c4828', '#b46c3c', '#d89858'], tapete: ['#8c5c14', '#d09424', '#f4cc4c', '#fff4a4'] } },
    { id: 'serrana', desc: 'casa da serra: assoalho de pinho, parede de toras e tapete de lã', piso: 'tabuasV', corredor: 'carpete', alt: 'pedra', parede: 'toras',
      cores: { piso: ['#3c2430', '#6c4434', '#a07444', '#cca464'], parede: ['#2c1c30', '#50343c', '#7c5444', '#a47c5c'], rodape: ['#2c1c30', '#50343c', '#7c5444', '#a47c5c'], piso2: ['#44506c', '#6c7c94', '#98a8b4', '#c8d4d4'], tapete: ['#7c1c2c', '#b83440', '#e4d4b4', '#f8f0dc'] } },
    { id: 'quarto', desc: 'quarto do jogador: assoalho de madeira clara, papel de parede listrado e tapete redondo', piso: 'tabuas', corredor: 'carpete', alt: 'carpete', parede: 'papel',
      cores: { piso: ['#5c3c34', '#94683c', '#c49454', '#e4c07c'], parede: ['#5c84a4', '#a4cce0', '#d4ecf0', '#f4fcfc'], rodape: ['#5c3c34', '#94683c', '#c49454', '#f4f0e4'], piso2: ['#1c6c5c', '#2ca47c', '#6cd49c', '#c4f4c4'], tapete: ['#a43c1c', '#e4742c', '#fcb44c', '#fff0a4'] } },
  ],
  porZona: [['casa-jogador-quarto|quarto', 'quarto'], ['^A1-casa-jogador', 'caicara'], ['^A7|^A8', 'colonial'], ['^B2|^B9|^A4', 'palafita'], ['^B7|^B8|^A9', 'serrana'], ['^B[13456]', 'sertaneja']],
  rodizio: ['caicara', 'colonial', 'palafita', 'sertaneja', 'serrana'],
};
