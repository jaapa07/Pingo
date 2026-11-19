/**
 * Arte comum dos tilesets exteriores, desenhada à mão em grades 16×16 com as letras da paleta de bioma
 * (ver tipos.ts). Cada bioma parte daqui e troca o que tem de próprio (decoração, arbustos, texturas).
 */
import type { Arte, ArteTileset, PaletaBioma, PaletaConstrucao } from './tipos';

/* ------------------------------ texturas cheias ('.' = tom base) ------------------------------ */
export const GRAMA: Arte[] = [
  [
    '................', '................', '...l............', '..l..........g..',
    '............g...', '................', '.......g........', '......g.....l...',
    '...........l....', '................', '..g.............', '.g......l.......',
    '.......l........', '................', '.............l..', '............l...',
  ],
  [
    '................', '.........l......', '........l.......', '................',
    '..g.............', '.g............l.', '.............l..', '.....l..........',
    '....l...........', '..........g.....', '.........g......', '................',
    '...l............', '..l.........g...', '...........g....', '................',
  ],
  [
    '................', '....l...........', '...l.l....g.....', '...l.....g......',
    '................', '...........l....', '..........l.l...', '..g.......l.....',
    '.g..............', '......l.........', '.....l.l........', '.....l.......g..',
    '............g...', '..l.............', '.l..............', '................',
  ],
  [
    '................', '................', '.....g..........', '....g...........',
    '................', '............l...', '...........l....', '................',
    '................', '..l.............', '.l..............', '.........g......',
    '........g.......', '................', '................', '................',
  ],
  [
    '................', '......l.........', '.....l......L...', '.g..............',
    'g.......l.......', '.......l........', '..............g.', '...L.........g..',
    '................', '..........l.....', '.........l......', '....g...........',
    '...g..........l.', '.............l..', '.......L........', '................',
  ],
];
export const TERRA: Arte[] = [
  [
    '................', '....U...........', '...........t....', '..........tt....',
    '................', '..t.............', '................', '.......UU.......',
    '.......U........', '.............t..', '................', '...t............',
    '..........U.....', '................', '......t.........', '................',
  ],
  [
    '................', '..........U.....', '..t.............', '.tt.............',
    '......U.........', '.............UU.', '.............U..', '................',
    '....t...........', '................', '.........t......', '........ttU.....',
    '................', '..U.............', '............t...', '................',
  ],
  [
    '................', '................', '.....t..........', '............U...',
    '................', '................', '..U.............', '..........t.....',
    '................', '................', '.....U..........', '.............t..',
    '................', '...t............', '................', '................',
  ],
];
/** calçada de pedra (pé-de-moleque) para vilas: usa a rampa do caminho */
export const CALCADA: Arte[] = [
  [
    '.t...U.t....t...', '.t.....t....t.U.', 'tttttttttttttttt', '....t.....t.....',
    '.U..t.....t..U..', '....t.....t.....', 'tttttttttttttttt', '.t......t....t..',
    '.t..U...t....t..', '.t......t.U..t..', 'tttttttttttttttt', '...t......t.....',
    '...t.U....t...U.', '...t......t.....', 'tttttttttttttttt', '.t...U.t....t...',
  ],
  [
    '.t.....t.U..t...', '.t.U...t....t...', 'tttttttttttttttt', '....t.....t.....',
    '....t..U..t.....', '.U..t.....t...U.', 'tttttttttttttttt', '.t......t....t..',
    '.t......t..U.t..', '.t.U....t....t..', 'tttttttttttttttt', '...t......t.....',
    '...t......t.U...', '.U.t......t.....', 'tttttttttttttttt', '.t.....t....t...',
  ],
];
export const AREIA: Arte[] = [
  [
    '................', '...ZZZ..........', '..Z.............', '...........ss...',
    '..........s.....', '................', '......ZZ........', '.....Z..........',
    '.............ZZ.', '............Z...', '..ss............', '.s..............',
    '........s.......', '.......s.s......', '................', '................',
  ],
  [
    '................', '.........ZZZ....', '........Z.......', '..s.............',
    '.s..............', '............s...', '................', '...ZZ...........',
    '..Z.......ss....', '.........s......', '................', '.............Z..',
    '......Z.....Z...', '.....Z..........', '................', '................',
  ],
  [
    '................', '................', '....s...........', '...........Z....',
    '..........Z.....', '................', '.Z..............', 'Z.......s.......',
    '.......s........', '................', '.............s..', '....ZZ..........',
    '...Z............', '................', '..........Z.....', '................',
  ],
];
export const LAJOTA: Arte[] = [
  [
    'rrrrrrrrrrrrrrrr', 'r.......r.......', 'r.Q.....r.......', 'r.......r....Q..',
    'r.......r.......', 'r.......r.......', 'r.......r.......', 'r.......r.......',
    'rrrrrrrrrrrrrrrr', '....r.......r...', '....r.Q.....r...', '....r.......r...',
    '....r.......r...', '....r.......r...', '....r.......r...', '....r.......r...',
  ],
];
export const CASCALHO: Arte[] = [
  [
    '................', '..qq.......r....', '.qRRr.....rr....', '..rr....q.......',
    '.......qRr......', '........rr...q..', '...r........qRr.', '..rr.........rr.',
    '................', '.....qq.........', '....qRRr....r...', '.....rr....rr...',
    '..q.............', '.qRr.....qq.....', '..rr....qRRr....', '.........rr.....',
  ],
  [
    '................', '.......qq.......', '......qRRr...r..', '..r....rr...rr..',
    '.rr.............', '...........q....', '....q.....qRr...', '...qRr.....rr...',
    '....rr..........', '..............q.', '.q.......r...qRr', 'qRr.....rr....rr',
    '.rr.............', '......qq........', '.....qRRr.......', '......rr........',
  ],
];
export const GELO: Arte[] = [
  [
    '................', '...w............', '..w.....ee......', '.w.....e........',
    '..............w.', '.............w..', '....ee......w...', '...e............',
    '................', '.........w......', '........w.......', '.e.....w.....ee.',
    'e...........e...', '................', '.....e..........', '................',
  ],
  [
    '................', '..........w.....', '.........w......', '..ee....w.......',
    '.e..............', '.............e..', '............e...', '.....w..........',
    '....w...........', '...w.......ee...', '..........e.....', '................',
    '..e...........w.', '.e...........w..', '................', '................',
  ],
];
export const LAMA: Arte[] = [
  [
    '................', '....TT..........', '...T..T.....k...', '....TT..........',
    '..........TTT...', '.........T...T..', '..k.......TTT...', '................',
    '.....k..........', '............T...', '...TTT.....T.T..', '..T...T.....T...',
    '...TTT..........', '.........k......', '................', '................',
  ],
  [
    '................', '..........TT....', '.k.......T..T...', '..........TT....',
    '....T...........', '...T.T......k...', '....T...........', '................',
    '........TTT.....', '.......T...T....', '..k.....TTT.....', '.............T..',
    '............T.T.', '.....k.......T..', '................', '................',
  ],
];
export const ROCHA_TOPO: Arte[] = [
  [
    '................', '................', '....qq..........', '...q........r...',
    '...........r....', '................', '................', '......r.........',
    '.....rr.....q...', '...........qq...', '................', '..q.............',
    '.qq.......r.....', '..........r.....', '................', '................',
  ],
  [
    '................', '..........q.....', '.........qq.....', '..r.............',
    '..r.............', '...r............', '............r...', '...........rr...',
    '................', '....q...........', '...qq...........', '.............q..',
    '............q...', '.......r........', '......r.........', '................',
  ],
];
export const ROCHA_FACE: Arte[] = [
  [
    'QQQQQQQQQQQQQQQQ', 'qqqQqqqqqqqQqqqq', 'RRRqRRRRrRRRRRqR', 'RRRRRRRrRRRRRRRR',
    'RqRRRRRrRRRqRRRR', 'RRRRrRRrRRRRRRrR', 'RRRRrRRRRRRRRRrR', 'rRRRrRRRRqRRRRrR',
    'rRRRRRRRRRRrRRRR', 'rRRqRRRRRRRrRRRR', 'RRRRRRrRRRRrRRqR', 'RRRRRRrRRRRRRRRR',
    'RrRRRRrRRRqRRrRR', 'rrRRRrrRRRRRRrRr', 'rrrRrrrrRRrRrrrr', 'kkrrrkkrrrrrkkrr',
  ],
  [
    'QQQQQQQQQQQQQQQQ', 'qqqqqQqqqqqqqQqq', 'RRRRRRqRRRrRRRRR', 'RRrRRRRRRRrRRRRR',
    'RRrRRRRRRRRRRqRR', 'RRrRRqRRRRRRRRRR', 'RRRRRRRRrRRRRRRr', 'RRRRRRRRrRRRRRRr',
    'RqRRRRRRrRRRrRRR', 'RRRRrRRRRRRRrRRR', 'RRRRrRRRRRqRrRRR', 'rRRRrRRRRRRRRRRR',
    'rRRRRRRRrRRRRRrR', 'rrRRRrRRrrRRRrrR', 'rrrrRrrrrrrRrrrr', 'rkkrrrrkkrrrrkkr',
  ],
];
/* quadros de água: brilhos que respiram e cintilam */
export const AGUA: Arte[] = [
  [
    '................', '..eee...........', '.e..............', '................',
    '................', '.........eeee...', '........e.......', '................',
    '................', '................', '....ee..........', '...e........E...',
    '................', '.............ee.', '............e...', '................',
  ],
  [
    '................', '...eee..........', '..e.............', '................',
    '................', '..........eee...', '.........e......', '................',
    '................', '................', '.....ee.........', '....e...........',
    '................', '..............ee', '.............e..', '................',
  ],
  [
    '................', '....ee..........', '...e............', '................',
    '................', '...........eee..', '..........e.....', '................',
    '................', '................', '......ee........', '.....e..........',
    '................', '..............e.', '.............e..', '................',
  ],
  [
    '................', '...eee..........', '..e.............', '................',
    '.........E......', '..........eeee..', '.........e......', '................',
    '................', '................', '.....ee.........', '....e...........',
    '................', '.............ee.', '............e...', '................',
  ],
];
/* água funda (ponto de mergulho): mancha escura com um anel de bolhas */
export const FUNDA: Arte[] = [
  [
    '................', '.....aaaaaa.....', '...aaaaaaaaaa...', '..aaaaaaeaaaaa..',
    '.aaaaaaaaaaaaaa.', '.aaaaaaaaaaaaaa.', '.aaaeaaaaaaaEaa.', '.aaaaaaaaaaaaaa.',
    '.aaaaaaaaaaaaaa.', '.aaaaaaaEaaaaaa.', '.aaaaaaaaaaaaaa.', '..aaaaaaaaaaaa..',
    '...aaaaaaaaaa...', '.....aaaaaa.....', '................', '................',
  ],
  [
    '................', '.....aaaaaa.....', '...aaaaaaaaaa...', '..aaaaaaaaaaaa..',
    '.aaaaaaaeaaaaaa.', '.aaaeaaaaaaaEaa.', '.aaaaaaaaaaaaaa.', '.aaaaaaaaaaaaaa.',
    '.aaaaaaaEaaaaaa.', '.aaaaaaaaaaaaaa.', '.aaaaaaaaaaeaaa.', '..aaaaaaaaaaaa..',
    '...aaaaaaaaaa...', '.....aaaaaa.....', '................', '................',
  ],
];
/* cascata: fios verticais; os quadros descem 4 px cada (calculado no bake) */
export const CASCATA: Arte[] = [
  [
    '.e...E..a.e...E.', '.e...E..a.e...E.', '.e...e..a.e...E.', '.e...e....e...e.',
    '.E...e....E...e.', '.E..a.....E...e.', '.E..a..e..E.a...', '.e..a..e..e.a...',
    '.e.....e..e.a.e.', '.e...e.E..e...e.', '.....e.E......E.', '.a...E.E..a...E.',
    '.a...E.e..a.e.E.', '.a...E.e..a.e.e.', '.e...e......e.e.', '.e...E..a.e.E...',
  ],
];
/* perigo líquido (lava, lodo tóxico): bolhas que crescem e estouram */
export const LIQUIDO: Arte[] = [
  [
    '................', '...oo.......x...', '..o..o.....x.x..', '...oo.......x...',
    '................', '.........xx.....', '....x...x..x....', '...x.....xx.....',
    '................', '.............o..', '..xx............', '.x..x.....oo....',
    '..xx.....o..o...', '..........oo....', '.....x..........', '................',
  ],
  [
    '................', '..oooo......x...', '.o....o.........', '..oooo..........',
    '..........x.....', '.........x.x....', '....x.....x.....', '................',
    '.............oo.', '...x.........oo.', '..x.x...........', '...x......oo....',
    '.........o..o...', '..........oo....', '......x.........', '................',
  ],
  [
    '................', '...o..o.........', '............x...', '...o..o....x.x..',
    '............x...', '..........x.....', '.....x..........', '....x.x.........',
    '.....x......oooo', '...........o....', '...x........oooo', '..........o.....',
    '.........ooo....', '..........o.....', '................', '................',
  ],
  [
    '................', '............x...', '....oo.....x.x..', '....oo......x...',
    '................', '.........xx.....', '....x...x..x....', '...x.....xx.....',
    '..............o.', '.............o.o', '..xx..........o.', '.x..x...........',
    '..xx......oo....', '.........o..o...', '.....x....oo....', '................',
  ],
];

/* ------------------------------ sprites ('.' = transparente) ------------------------------ */
export const GRAMA_ALTA: Arte[] = [
  [
    '................', '................', '...v.......v....', '..vF..v...vFv...',
    '..vFv.vF..vFf.v.', '.vFFvvFFv.FFfvFv', '.vFfFvFfFvFFfvFf', 'vFFfFFFfFFFfFFFf',
    'FFffFvFffFvFfFFf', 'FfvfFvFfvFvFfvFf', 'fFvFffvFvFfvFvFf', 'fvFFfvFFFvfFFFvf',
    'fFFffFFfFFfFFfFf', 'ffFfffFfffFffFff', 'kffkfffkffkfffkf', '.kk.kkk.kk.kkk.k',
  ],
];
/** metade da frente da moita de grama alta: o motor desenha sobre os pés de quem passa */
export const GRAMA_PASSAGEM: Arte[] = [
  [
    '................', '................', '................', '................',
    '................', '................', '................', '................',
    '.....v....v.....', '.v...v.v..v..v..', '.Fv.vF.Fv.Fv.Fv.', 'fvFFfvFFFvfFFFvf',
    'fFFffFFfFFfFFfFf', 'ffFfffFfffFffFff', 'kffkfffkffkfffkf', '.kk.kkk.kk.kkk.k',
  ],
  [
    '................', '................', '................', '................',
    '................', '................', '................', '................',
    '......v....v....', '..v...v.v..v..v.', '.Fv.vF.Fv.Fv.Fv.', 'fvFFfvFFFvfFFFvf',
    'fFFffFFfFFfFFfFf', 'ffFfffFfffFffFff', 'kffkfffkffkfffkf', '.kk.kkk.kk.kkk.k',
  ],
];
export const ARBUSTO: Arte[] = [
  [
    '................', '................', '.....kkkk.......', '...kkvvVvkk.....',
    '..kvvVVvvFvkkk..', '.kvVVvvFFvvvVvk.', '.kvVvFFvvFvVVvk.', 'kvvvFFvvFFFvvvFk',
    'kFvFFvFFFfFFvFFk', 'kFFFfFFFfFFFFFfk', 'kfFFFFfFFFfFFffk', '.kfFffFFfFFfffk.',
    '.kffFfffFfffffk.', '..kkfffffffkkk..', '....kkkkkkk.....', '................',
  ],
  [
    '................', '.......kkkk.....', '.....kkvVVvkk...', '..kkkvVVvvFvvk..',
    '.kvVvvvvFFvvVvk.', '.kVVvFFvFvvVVvk.', 'kvvvFFvvFFvvvFFk', 'kFvFFFvFFfFFvFFk',
    'kFFFfFFFfFFFFFfk', 'kfFFFFfFFFfFFffk', 'kffFffFFfFFffffk', '.kfFfffFffffffk.',
    '..kkffffffffkk..', '....kkkkkkkk....', '................', '................',
  ],
];
export const CERCA_POSTE: Arte = [
  '................', '................', '......kkkk......', '......knnk......',
  '......kMnk......', '......kMMk......', '......kMMk......', '......kMMk......',
  '......kMMk......', '......kMMk......', '......kMMk......', '......kMmk......',
  '......kmmk......', '......kmmk......', '......kkkk......', '................',
];
export const CERCA_H: Arte = [
  '................', '................', '................', '................',
  'kkkkkkkkkkkkkkkk', 'nnnnnnnnnnnnnnnn', 'MMMMMMMMMMMMMMMM', 'kkkkkkkkkkkkkkkk',
  '................', 'kkkkkkkkkkkkkkkk', 'nnnnnnnnnnnnnnnn', 'mmmmmmmmmmmmmmmm',
  'kkkkkkkkkkkkkkkk', '................', '................', '................',
];
export const CERCA_V: Arte = Array.from({ length: 16 }, () => '......knMk......');
export const CIPO: Arte = [
  '..kk........kk..', '.kFvk......kvFk.', '.kFFvk....kvFfk.', '..kfFvkkkkvFfk..',
  '...kfFvvvvFfk...', '..kkkfFFFFfkkk..', '.kvvkkffffkkvvk.', 'kvFFvkkffkkvFFvk',
  'kFffFvkFFkvFffFk', '.kkkfFvFFvFfkkk.', '...kkfFFFFfkk...', '..kvvkfFFfkvvk..',
  '.kvFFvkffkvFFvk.', '.kFffFkffkFffFk.', '..kkkfkkkkfkkk..', '....kk....kk....',
];
export const PEDREGULHO: Arte = [
  '................', '.....kkkkkk.....', '...kkqqQQqqkk...', '..kqqQQQqqqRRk..',
  '.kqqQQqqqRRRRRk.', '.kqQQqqqRRRRRrk.', 'kqqQqqRRRRRRRrrk', 'kqqqqRRRRRRRrrrk',
  'kqqRRRRRRRRrrrrk', 'kRRRRRRRRRrrrrrk', 'kRRRRRRRRrrrrrrk', '.kRRRRRrrrrrrrk.',
  '.krRRrrrrrrrrrk.', '..kkrrrrrrrrkk..', '....kkkkkkkk....', '................',
];
export const RACHADA: Arte = [
  '................', '....kkkkkkk.....', '...kqqQqqRRkk...', '..kqQQqkRRRRRk..',
  '.kqqQqqkRRRRRrk.', '.kqqqqRRkRRrRrk.', 'kqqRRRRkkRRkrrrk', 'kqRRkRRRkRkRrrrk',
  'kRRRRkkRkkRRrrrk', 'kRRRRRRkkRRrrrrk', 'kRrRRRkRRkRrrrrk', '.kRRRkRRRRkrrrk.',
  '.krRkRRrrrrkrrk.', '..kkrrrrrrrrkk..', '....kkkkkkkk....', '................',
];
/** trepadeira sobre a face do paredão (apoios para escalar) */
export const TREPADEIRA: Arte = [
  '...v........v...', '..vFv......vF...', '...Ff.......Fv..', '...F...vv...F...',
    '..vF..vFFv.vF...', '...Fv..Ff...Ff..', '...F...F....F...', '..vFv..Fv..vFv..',
    '...F..vF....F...', '...Ff..F....Ff..', '..vF...Ff..vF...', '...F..vF....F...',
    '...Fv..F....Fv..', '..vF...Fv..vF...', '...F...F....F...', '...f...f....f...',
];
export const SALIENCIA_V: Arte = [
  '................', '................', '................', '................',
  '................', '................', '................', '.l..l.....l...l.',
  'lLlLLllLlLLLlLlL', 'gTgTTgTTgTTgTTTg', 'TTtTTTTtTTTTtTTT', 'tTtttTtttTtttTtt',
  'mttmmtmmtmmmtmmt', 'kkkkkkkkkkkkkkkk', '................', '................',
];
/** saliência que pula para a ESQUERDA (`<`); a da direita é o espelho */
export const SALIENCIA_E: Arte = [
  '....ktTTtl......', '....ktTTtL......', '....kTTttl......', '....ktTTtLl.....',
  '....ktTTtl......', '....kTtTtL......', '....ktTTtl......', '....ktTTtLl.....',
  '....kTTttl......', '....ktTTtL......', '....ktTTtl......', '....kTtTtLl.....',
  '....ktTTtl......', '....ktTTtL......', '....kTTttl......', '....ktTTtl......',
];
export const PONTE: Arte = [
  'kkkkkkkkkkkkkkkk', 'nnnnnnnnnnnnnnnn', 'mmmmmmmmmmmmmmmm', 'MMMmMMMmMMMmMMMm',
  'MnMmMnMmMnMmMnMm', 'MMMmMMMmMMMmMMMm', 'MMMmMnMmMMMmMMMm', 'MMMmMMMmMMMmMnMm',
  'MnMmMMMmMnMmMMMm', 'MMMmMMMmMMMmMMMm', 'MMMmMnMmMMMmMMMm', 'MMMmMMMmMMMmMnMm',
  'MMMmMMMmMMMmMMMm', 'nnnnnnnnnnnnnnnn', 'mmmmmmmmmmmmmmmm', 'kkkkkkkkkkkkkkkk',
];
export const CANTEIRO: Arte = [
  '................', '.kkkkkkkkkkkkkk.', 'kmMMMMMMMMMMMMmk', 'kMttttttttttttMk',
  'kMtTtttTtttTttMk', 'kMttttttttttttMk', 'kMtttTtttTttttMk', 'kMttttttttttttMk',
  'kMtTtttTtttTttMk', 'kMttttttttttttMk', 'kMtttTtttTttttMk', 'kMttttttttttttMk',
  'kMttttttttttttMk', 'kmMMMMMMMMMMMMmk', '.kkkkkkkkkkkkkk.', '................',
];
export const BURACO: Arte = [
  '................', '................', '....tttttttt....', '..tttkkkkkkttt..',
  '.ttkkkkkkkkkktt.', '.tkkkkkkkkkkkkt.', 'ttkkkkkkkkkkkktt', 'tkkkkkkkkkkkkkkt',
  'tkkkkkkkkkkkkkkt', 'tTkkkkkkkkkkkkTt', '.tTkkkkkkkkkkTt.', '.tTTkkkkkkkkTTt.',
  '..tTTTTkkTTTTt..', '....ttTTTTtt....', '................', '................',
];
export const CAIXOTE: Arte = [
  '................', '.kkkkkkkkkkkkkk.', '.knnnnnnnnnnnnk.', '.knMMMMMMMMMMmk.',
  '.kkkkkkkkkkkkkk.', '.kMnMMmkkMnMMmk.', '.kMMnMmkkMMnMmk.', '.kMMMnmkkMMMnmk.',
  '.kMmMMmkkMmMMmk.', '.kMMmMmkkMMmMmk.', '.kMMMmmkkMMMmmk.', '.kmmmmmkkmmmmmk.',
  '.kkkkkkkkkkkkkk.', '.kMMMMMMMMMMMMk.', '.kkkkkkkkkkkkkk.', '................',
];
/* decoração genérica: florzinhas, pedrinhas, tufos */
export const DECOR_FLORES: Arte[] = [
  [
    '................', '................', '...y............', '..yoy.....p.....',
    '...y.....pwp....', '...f......p.....', '..........f.....', '................',
    '................', '......w.........', '.....wyw....y...', '......w....yoy..',
    '......f.....y...', '............f...', '................', '................',
  ],
  [
    '................', '..........w.....', '.........wyw....', '..p.......w.....',
    '.pwp......f.....', '..p.............', '..f.............', '................',
    '.......y........', '......yoy.......', '.......y.....p..', '.......f....pwp.',
    '.............p..', '.............f..', '................', '................',
  ],
  [
    '................', '................', '.....kk.........', '....kqRk........',
    '....kRrk...l.l..', '.....kk....lLl..', '............l...', '................',
    '..l.l...........', '..lLl.....kkk...', '...l.....kqqRk..', '.........kRRrk..',
    '..........kkk...', '................', '................', '................',
  ],
];
/* florzinha que abre e fecha (2 quadros) */
export const FLOR: Arte[] = [
  [
    '................', '................', '................', '................',
    '................', '.......p........', '......pyp.......', '.......p........',
    '.......f........', '......ff........', '................', '................',
    '................', '................', '................', '................',
  ],
  [
    '................', '................', '................', '................',
    '......p.p.......', '.......y........', '......p.p.......', '.......f........',
    '.......f........', '......ff........', '................', '................',
    '................', '................', '................', '................',
  ],
];

export const ARTE_COMUM: ArteTileset = {
  chao: GRAMA, caminho: TERRA, alt: AREIA, encontro: CASCALHO, piso: LAJOTA,
  gelo: GELO, lama: LAMA, paredeTopo: ROCHA_TOPO, paredeFace: ROCHA_FACE,
  agua: AGUA, funda: FUNDA, cascata: CASCATA, perigo: LIQUIDO,
  decor: DECOR_FLORES, gramaAlta: GRAMA_ALTA, gramaPassagem: GRAMA_PASSAGEM, arbusto: ARBUSTO,
  cercaPoste: CERCA_POSTE, cercaH: CERCA_H, cercaV: CERCA_V,
  cipo: CIPO, pedregulho: PEDREGULHO, rachada: RACHADA, trepadeira: TREPADEIRA,
  salienciaV: SALIENCIA_V, salienciaE: SALIENCIA_E,
  ponte: PONTE, canteiro: CANTEIRO, buraco: BURACO, movel: CAIXOTE, flor: FLOR,
};

/* ------------------------------ variações usadas por alguns biomas ------------------------------ */
/** reaproveita uma arte trocando letras (ex.: ondas de areia desenhadas na rampa do chão-base) */
export function trocarLetras(artes: Arte[], mapa: Record<string, string>): Arte[] {
  return artes.map((a) => a.map((l) => [...l].map((ch) => mapa[ch] ?? ch).join('')));
}
/** espinheiro (perigo fixo): galhos com espinhos sobre o chão-base */
export const ESPINHOS: Arte[] = [
  [
    '................', '..k.....k.......', '.kXk...kok..k...', '..kXkkkXk..kXk..',
    '...kXXXk....kXk.', '..kokkXk.kkkXk..', '...k.kXkkXXXk...', '.....kXXXkkok...',
    '..k...kXk..k....', '.kXk.kXk........', '..kXkXk...k.....', '...kXXkkkkXk....',
    '..kokkXXXXkok...', '...k..kkkk.k....', '................', '................',
  ],
];
/** campo de algas baixas (chão de encontro do fundo do mar) */
export const ALGAS: Arte[] = [
  [
    '................', '..v.....F....v..', '..F..v..F....F..', '.vF..F.vF..v.F..',
    '..F..F..f..F.f..', '..f..f.....F....', '...........f....', '.....v..........',
    '.v...F....v...F.', '.F..vF....F..vF.', '.F...F.v..F...F.', '.f...f.F.vF...f.',
    '.......F..f.....', '.......f........', '................', '................',
  ],
];
/** chapas rebitadas (piso de vila operária) */
export const CHAPA: Arte[] = [
  [
    'rrrrrrrrrrrrrrrr', 'rQ............Qr', 'r..............r', 'r....q.........r',
    'r...q..........r', 'r..............r', 'r.........q....r', 'r........q.....r',
    'r..............r', 'r..............r', 'r...q..........r', 'r..q...........r',
    'r..............r', 'r..............r', 'rQ............Qr', 'rrrrrrrrrrrrrrrr',
  ],
];
/** arbusto com neve em cima: as folhas claras do topo viram neve */
export function nevar(artes: Arte[], linhas = 6): Arte[] {
  return artes.map((a) => { let n = 0; return a.map((l) => { if (/[vVF]/.test(l) && n < linhas) { n++; return l.replace(/[vV]/g, 'w'); } return l; }); });
}
const METAL: [string, string, string] = ['#4a5068', '#7c86a0', '#c0c8d8'];
/** monta a paleta de construção de um bioma: a pedra segue a rampa de rocha da paleta */
export function construcao(p: PaletaBioma, o: Pick<PaletaConstrucao, 'parede' | 'telhado' | 'detalhe' | 'detalhe2'> & Partial<PaletaConstrucao>): PaletaConstrucao {
  return { pedra: [p.r, p.R, p.q], metal: METAL, vidro: '#5a86b8', vidroNoite: '#ffe07a', luz: '#f8e8a0', luzNoite: '#fff6b0', ...o };
}
