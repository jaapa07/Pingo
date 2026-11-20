/**
 * GRUPOS DE NINHO (spec 10 item 9 e 10A item 11) — quem pode formar casal no Viveiro do Seu Aroeira.
 * Duas criaturas de sexos opostos que dividem pelo menos um grupo podem deixar ovo. O grupo segue a biologia do bicho
 * real (o que importa é o jeito de viver e de criar filhote), não o tipo de batalha:
 *   campo       mamíferos de chão: tamanduás, canídeos, felinos, cutias, antas, veados, tatus, roedores de pedra
 *   copa        mamíferos de árvore: macacos, preguiças, serelepes, quatis e ouriços (também andam no chão)
 *   voador      aves (as que voam e as corredoras, como ema e seriema) e morcegos
 *   nadador     vida na água com fôlego de ar: botos, lontras, ariranhas, peixes-boi, baleias, capivaras e pinguins
 *   reptil      lagartos, jabutis, tartarugas, jacarés e serpentes
 *   anfibio     pererecas e sapos
 *   peixe       peixes de rio e de mar, arraias e cavalos-marinhos
 *   marinho     invertebrados de água: caranguejos, siris, caramujos, polvos, estrelas e águas-vivas
 *   artropode   insetos e aracnídeos
 *   escavador   quem vive cavando: tatus, tuco-tucos, minhocuçus e cupins (segundo grupo)
 *   sem-ninho   lendários: nunca deixam ovo
 */
export type GrupoNinho = 'campo' | 'copa' | 'voador' | 'nadador' | 'reptil' | 'anfibio' | 'peixe' | 'marinho' | 'artropode' | 'escavador' | 'sem-ninho';

export const NOME_GRUPO: Record<GrupoNinho, string> = {
  campo: 'Bichos do Campo', copa: 'Bichos de Copa', voador: 'Asas', nadador: 'Nadadores', reptil: 'Répteis', anfibio: 'Anfíbios',
  peixe: 'Peixes', marinho: 'Bichos do Mar', artropode: 'Miúdos de Seis e Oito Patas', escavador: 'Cavadores', 'sem-ninho': 'Sem ninho',
};

type G = GrupoNinho[];
const C: G = ['campo'], CO: G = ['copa'], V: G = ['voador'], N: G = ['nadador'], R: G = ['reptil'], A: G = ['anfibio'], P: G = ['peixe'], M: G = ['marinho'], I: G = ['artropode'];
const L: G = ['sem-ninho'];

/** grupos de cada espécie, por número (1..180); a linha evolutiva inteira divide os mesmos grupos */
export const GRUPOS_NINHO: Record<number, G> = {
  1: C, 2: C, 3: C, // tamanduás
  4: C, 5: C, 6: C, // lobo-guará
  7: N, 8: N, 9: N, // botos
  10: V, 11: V, 12: V, // pipira, bem-te-vi, gavião
  13: C, 14: C, // cutias
  15: I, 16: I, 17: I, // lagarta, casulo, mariposa
  18: I, 19: I, // saúvas
  20: ['campo', 'copa'], 21: ['campo', 'copa'], // gambás (marsupiais que sobem em árvore)
  22: CO, 23: CO, // saguis
  24: A, 25: A, 26: A, // pererecas e cururu
  27: I, 28: I, 29: I, // joaninha e vaga-lumes
  30: V, 31: V, 32: V, // morcegos
  33: ['campo', 'escavador'], 34: ['campo', 'escavador'], // tatus
  35: M, 36: M, // caranguejo e guaiamum
  37: P, 38: P, 39: P, 40: P, // piaba, dourado, mandi, jaú
  41: R, 42: R, // calangos
  43: V, 44: V, 45: V, 46: V, 47: V, 48: V, 49: V, 50: V, 51: V, 52: V, 53: V, 54: V, 55: V, 56: V, // corujas, quero-queros, beija-flores, tucanos, araras, papagaios, urubus
  57: ['campo', 'nadador'], 58: ['campo', 'nadador'], // capivaras
  59: ['copa', 'campo'], 60: ['copa', 'campo'], // ouriços-cacheiros
  61: CO, 62: CO, 63: CO, 64: CO, 65: CO, 66: CO, 67: CO, 68: CO, // preguiças, bugios, macacos-prego, micos-leões
  69: C, 70: C, 71: C, 72: C, // jaguatiricas e onças
  73: N, 74: N, 75: N, 76: N, 77: N, 78: N, // ariranhas, lontras, peixes-boi
  79: R, 80: R, 81: R, 82: R, 83: R, 84: R, 85: R, 86: R, 87: R, 88: R, 89: R, 90: R, 91: R, 92: R, // tartarugas, jabutis, jacarés, serpentes
  93: C, 94: C, // graxains
  95: ['campo', 'copa'], 96: ['campo', 'copa'], // quatis
  97: C, 98: C, 99: C, 100: C, // antas e veados
  101: ['voador', 'campo'], 102: ['voador', 'campo'], 103: ['voador', 'campo'], 104: ['voador', 'campo'], // emas e seriemas (aves corredoras)
  105: V, 106: V, 107: V, 108: V, 109: V, 110: V, // tuiuiús, garças, harpias
  111: P, 112: P, 113: P, 114: P, 115: P, 116: P, 117: P, 118: P, 119: P, 120: P, // pirarucus, piranhas, poraquês, arraias, cavalos-marinhos
  121: M, 122: M, 123: M, 124: M, 125: M, 126: M, 127: M, 128: M, 129: M, 130: M, // polvos, estrelas, águas-vivas, aruás, siris
  131: N, 132: N, // baleias
  133: ['voador', 'nadador'], 134: ['voador', 'nadador'], // pinguins
  135: V, 136: V, // gralhas
  137: CO, 138: CO, // serelepes
  139: ['campo', 'copa'], 140: ['campo', 'copa'], // maracajás
  141: I, 142: I, 143: I, 144: I, 145: I, 146: I, 147: I, 148: I, 149: I, 150: I, 151: I, 152: I, 153: I, 154: I, 155: I, 156: I, 157: I, 158: I, // grilos … louva-a-deus
  159: ['escavador'], 160: ['escavador'], // minhocuçus
  161: ['campo', 'escavador'], 162: ['campo', 'escavador'], // tuco-tucos
  163: ['artropode', 'escavador'], 164: ['artropode', 'escavador'], // cupins
  165: C, 166: C, // mocós
  167: V, 168: V, 169: V, 170: V, // andorinhões e urutaus
  171: CO, 172: CO, // macacos-da-noite
  173: L, 174: L, 175: L, 176: L, 177: L, 178: L, 179: L, 180: L, // lendários
};

export const gruposDe = (num: number): GrupoNinho[] => GRUPOS_NINHO[num] ?? L;
/** passos para chocar, pela curva de crescimento da espécie do filhote */
export const PASSOS_OVO: Record<'rapido' | 'medio' | 'lento', number> = { rapido: 1024, medio: 1536, lento: 2560 };
