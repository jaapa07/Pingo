/**
 * Formato dos tilesets EXTERIORES (dados puros; quem desenha é tools/scenery/exterior + tools/bake-maps.ts).
 *
 * Paleta do bioma: até 32 cores, cada uma com uma letra fixa (a mesma letra em todos os biomas, para
 * que a arte comum sirva a todos por troca de paleta):
 *   g G l L  chão-base (escuro, base, claro, brilho)     t T U  caminho (escuro, base, claro)
 *   s S Z    areia / chão alternativo                    a A e E  água (funda, base, clara, espuma)
 *   r R q Q  rocha                                       f F v V  folhagem
 *   m M n    madeira / tronco                            y p w    flores e detalhes do bioma
 *   x X o    perigo do bioma (lava, lodo tóxico, espinho) k       contorno
 * Arte = grade de caracteres; '.' é o tom base da textura (em texturas cheias) ou transparente (em sprites).
 */
export type Arte = string[];
export type LetraCor = 'g' | 'G' | 'l' | 'L' | 't' | 'T' | 'U' | 's' | 'S' | 'Z' | 'a' | 'A' | 'e' | 'E' | 'r' | 'R' | 'q' | 'Q' | 'f' | 'F' | 'v' | 'V' | 'm' | 'M' | 'n' | 'y' | 'p' | 'w' | 'x' | 'X' | 'o' | 'k';
export type PaletaBioma = Record<LetraCor, string>;

/** Cores de construção do bioma (objetos do catálogo): rampas [sombra, base, luz]. */
export interface PaletaConstrucao {
  parede: [string, string, string];
  telhado: [string, string, string];
  /** portas, janelas, barrado e detalhes pintados */
  detalhe: [string, string, string];
  /** segunda cor de fachada (casario colorido) */
  detalhe2: [string, string, string];
  pedra: [string, string, string];
  metal: [string, string, string];
  /** vidro de janela de dia e aceso à noite */
  vidro: string; vidroNoite: string;
  /** lâmpada/chama de dia e à noite */
  luz: string; luzNoite: string;
  /** telhados com neve acumulada (geada, pico) */
  neve?: boolean;
}

export interface ArteTileset {
  /** texturas cheias 16×16 ('.' = tom base) */
  chao: Arte[]; caminho: Arte[]; alt: Arte[]; encontro: Arte[]; piso: Arte[];
  gelo: Arte[]; lama: Arte[]; paredeTopo: Arte[]; paredeFace: Arte[];
  /** quadros de animação (texturas cheias) */
  agua: Arte[]; cascata: Arte[]; perigo: Arte[];
  /** sprites com transparência */
  funda: Arte[]; decor: Arte[]; gramaAlta: Arte[]; gramaPassagem: Arte[]; arbusto: Arte[];
  cercaPoste: Arte; cercaH: Arte; cercaV: Arte;
  cipo: Arte; pedregulho: Arte; rachada: Arte; trepadeira: Arte;
  salienciaV: Arte; salienciaE: Arte;
  ponte: Arte; canteiro: Arte; buraco: Arte; movel: Arte;
  /** flores animadas (2 quadros) espalhadas em alguns tiles de chão decorado */
  flor: Arte[];
}

export interface TilesetExterior {
  nome: string;
  /** false = um só conjunto ('dia'): cavernas e fundo do mar não mudam com o período */
  periodos: boolean;
  paleta: PaletaBioma;
  /** letra base de cada textura cheia (o '.' da arte) */
  base: { chao: LetraCor; caminho: LetraCor; alt: LetraCor; encontro: LetraCor; piso: LetraCor; gelo: LetraCor; lama: LetraCor; paredeTopo: LetraCor; agua: LetraCor; perigo: LetraCor };
  arte: ArteTileset;
  /** espécie de árvore para `T` e `t` (pintores em tools/scenery/exterior/arvores.ts) */
  arvore: string[]; arvoreSacudivel: string;
  construcao: PaletaConstrucao;
  /** borda do caminho: 'organica' (terra batida) ou 'reta' (calçada) */
  bordaCaminho: 'organica' | 'reta';
  /** letras da paleta que não escurecem à noite (lava, fungos e cristais luminosos) */
  acesas?: LetraCor[];
  descricao: string;
}

/** Sombra projetada: cada cor escurece para o tom de baixo da própria rampa. */
export const SOMBRA: Partial<Record<LetraCor, LetraCor>> = {
  L: 'l', l: 'G', G: 'g', U: 'T', T: 't', Z: 'S', S: 's', E: 'e', e: 'A', A: 'a',
  Q: 'q', q: 'R', R: 'r', V: 'v', v: 'F', F: 'f', n: 'M', M: 'm', w: 'p', y: 'M', o: 'X', X: 'x',
};
