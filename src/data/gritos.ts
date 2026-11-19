/**
 * Gritos das 180 criaturas (índice = número no Diário de Campo). Cada espécie tem parâmetros escritos à mão,
 * coerentes com o animal que a inspira; evoluções partem do grito da forma anterior, mais grave e encorpado.
 * Tocados por `src/audio/grito.ts`.
 */
export type OndaGrito = 'p50' | 'p25' | 'p12' | 'tri' | 'serra' | 'seno';

export interface Grito {
  /** timbre da voz principal: pulso 50/25/12,5 %, triângulo, serra ou seno */
  o: OndaGrito;
  /** altura base (Hz) */
  f: number;
  /** contorno de altura: multiplicadores em pontos igualmente espaçados ao longo do grito */
  c: number[];
  /** duração de cada emissão (s) */
  d: number;
  /** vibrato/trinado [Hz, semitons] */
  v?: [number, number];
  /** pulsação de amplitude [Hz, profundidade 0–1]: coaxar, zumbir, chocalhar */
  a?: [number, number];
  /** quantidade de ruído (sopro, chiado, aspereza) */
  r?: number;
  /** banda do ruído, de → até (Hz) */
  rb?: [number, number];
  /** formante [Hz, Q]: tamanho da "boca" */
  q?: [number, number];
  /** saturação (rosnado) */
  x?: number;
  /** repetições [quantas, intervalo entre inícios em s] */
  n?: [number, number];
  /** fator de altura aplicado a cada repetição */
  np?: number;
  /** suboitava: corpo */
  s?: number;
  /** segunda voz [razão de altura, volume] */
  h?: [number, number];
  /** nível da voz principal (padrão 1); baixo para silvos feitos quase só de ruído */
  m?: number;
  /** envio de reverb */
  e?: number;
  /** ganho */
  g?: number;
  /** ataque (s) */
  at?: number;
  /** envelope percussivo (estalos, bicadas) */
  p?: boolean;
}

/** Forma evoluída: mesmo grito, mais grave (fator k), mais longo e com mais corpo; `x` traz os ajustes próprios da espécie. */
const ev = (b: Grito, k: number, x: Partial<Grito> = {}): Grito => ({
  ...b,
  f: Math.round(b.f * k),
  d: Math.round(b.d * 118) / 100,
  s: Math.min(0.7, (b.s ?? 0) + 0.2),
  ...x,
});

const G: Grito[] = [];
// índice 0 não é usado; serve de grito neutro para números fora da tabela
G[0] = { o: 'p50', f: 600, c: [1, 1.2, 0.9], d: 0.25 };

// 1–9 iniciais
G[1] = { o: 'tri', f: 560, c: [1, 1.3, 0.85], d: 0.34, r: 0.3, rb: [1800, 900], a: [18, 0.3] };                    // Tamanduí: fungada curiosa
G[2] = ev(G[1], 0.78, { c: [1, 1.35, 0.8, 0.9] });
G[3] = ev(G[2], 0.72, { x: 4, r: 0.4, c: [1, 1.3, 0.7, 0.75], d: 0.6 });
G[4] = { o: 'p25', f: 480, c: [0.8, 1.3, 1], d: 0.2, n: [2, 0.26], r: 0.15, rb: [900, 1500], q: [1300, 2] };       // Guaraxim: latido rouco de lobo-guará
G[5] = ev(G[4], 0.8, { n: [2, 0.3] });
G[6] = ev(G[5], 0.7, { x: 6, r: 0.3, d: 0.34, n: [2, 0.42], c: [0.7, 1.25, 0.8] });
G[7] = { o: 'seno', f: 1500, c: [1, 1.8, 1.2, 2], d: 0.3, v: [22, 0.6], h: [1.5, 0.3], a: [45, 0.4] };            // Botinho: assobio com cliques de boto
G[8] = ev(G[7], 0.82);
G[9] = ev(G[8], 0.76, { e: 0.4, h: [1.5, 0.5], d: 0.55 });

// 10–23 bichos da trilha
G[10] = { o: 'p12', f: 2600, c: [1, 1.4, 0.9], d: 0.07, n: [3, 0.11] };                                           // Pipirim: piados de pardal
G[11] = ev(G[10], 0.82, { d: 0.1, n: [3, 0.15], np: 1.1 });                                                       // "bem-te-vi" em três sílabas
G[12] = ev(G[11], 0.7, { n: [2, 0.3], np: 0.96, d: 0.24, c: [1.2, 1, 0.8], r: 0.2, rb: [2500, 2000] });           // guincho de gavião
G[13] = { o: 'p50', f: 900, c: [1, 0.8], d: 0.09, n: [2, 0.14], q: [1800, 3] };                                   // Cotiazinha: latidinho de cutia
G[14] = ev(G[13], 0.78, { n: [3, 0.15] });
G[15] = { o: 'tri', f: 700, c: [1, 1.1, 0.9, 1], d: 0.25, a: [14, 0.6], g: 0.9 };                                 // Lagartim: ondulação mole
G[16] = ev(G[15], 0.7, { a: [0, 0], p: true, d: 0.14, n: [2, 0.2], r: 0.2, rb: [600, 500] });                     // batida dentro do casulo
G[17] = ev(G[16], 0.85, { p: false, a: [32, 0.8], d: 0.5, n: [1, 0], c: [1, 1.4, 1.2, 1.6], r: 0.25, rb: [3000, 5000], e: 0.3, o: 'p12' }); // asas de mariposa
G[18] = { o: 'p12', f: 1800, c: [1, 1.05], d: 0.22, a: [55, 1], r: 0.3, rb: [5000, 6000] };                       // Formigaço: estridulação
G[19] = ev(G[18], 0.75, { d: 0.4, a: [48, 1], h: [0.5, 0.4] });
G[20] = { o: 'serra', f: 380, c: [1, 0.9, 1.1], d: 0.3, r: 0.6, rb: [2500, 3500], a: [26, 0.5], q: [1500, 1.5] }; // Gambazinho: chiado de gambá
G[21] = ev(G[20], 0.78);
G[22] = { o: 'seno', f: 3200, c: [0.9, 1.1, 1.05], d: 0.28, v: [28, 0.4], n: [2, 0.36] };                         // Saguinho: assobio fino
G[23] = ev(G[22], 0.82, { n: [3, 0.34], h: [2, 0.15] });

// 24–29 brejo e noite
G[24] = { o: 'p50', f: 1400, c: [0.9, 1.1], d: 0.06, n: [4, 0.12], q: [2000, 4] };                                // Pererequinha: pios de perereca
G[25] = ev(G[24], 0.6, { d: 0.1, n: [3, 0.2], a: [60, 0.9] });
G[26] = ev(G[25], 0.5, { d: 0.5, n: [1, 0], a: [32, 1], c: [0.95, 1.05, 1], s: 0.4 });                            // trinado longo de cururu
G[27] = { o: 'p12', f: 1500, c: [1, 1.3], d: 0.12, a: [80, 0.9], n: [2, 0.18] };                                  // Pintinhas: zumbidinho
G[28] = { o: 'p50', f: 1200, c: [1, 2, 1], d: 0.18, a: [40, 0.7], h: [2, 0.3] };                                  // Vagalumim: lampejo elétrico
G[29] = ev(G[28], 0.8, { d: 0.3, r: 0.25, rb: [4000, 7000], x: 3 });

// 30–36 grutas e mangue
G[30] = { o: 'p12', f: 4200, c: [1.3, 0.7], d: 0.045, n: [5, 0.07] };                                             // Morceguim: estalos de ecolocalização
G[31] = ev(G[30], 0.78, { n: [4, 0.085], r: 0.2, rb: [5000, 3000] });
G[32] = ev(G[31], 0.8, { n: [3, 0.11], d: 0.09, e: 0.35, x: 2 });
G[33] = { o: 'tri', f: 300, c: [1, 1.2, 0.9], d: 0.16, n: [2, 0.2], r: 0.4, rb: [700, 1100] };                    // Tatuzim: fungado grunhido
G[34] = ev(G[33], 0.7, { x: 5, h: [2.76, 0.2] });
G[35] = { o: 'p25', f: 1700, c: [1, 0.6], d: 0.035, n: [4, 0.075], p: true, r: 0.5, rb: [3000, 2500] };           // Caranguejim: estalos de pinça
G[36] = ev(G[35], 0.65, { n: [3, 0.11], d: 0.06 });

// 37–42 peixes e calangos
G[37] = { o: 'seno', f: 700, c: [1, 2.2], d: 0.07, n: [3, 0.1], np: 1.15 };                                       // Piabinha: bolhinhas
G[38] = ev(G[37], 0.7, { n: [3, 0.13], r: 0.2, rb: [1500, 3500], h: [1.5, 0.3] });
G[39] = { o: 'p25', f: 190, c: [1, 0.9], d: 0.14, a: [45, 1], n: [2, 0.2], q: [500, 2] };                         // Mandizinho: ronco de bagre
G[40] = ev(G[39], 0.55, { d: 0.4, n: [2, 0.5], s: 0.5 });
G[41] = { o: 'p12', f: 1100, c: [1, 1.2, 0.8], d: 0.12, r: 0.5, rb: [4000, 6000], n: [2, 0.16] };                 // Calanguinho: estalo seco
G[42] = ev(G[41], 0.6, { x: 5, d: 0.3, n: [1, 0], r: 0.6, rb: [2500, 900] });

// 43–56 aves
G[43] = { o: 'seno', f: 1250, c: [1, 1.03, 1], d: 0.09, n: [5, 0.17], h: [2, 0.1], e: 0.3 };                      // Corujinha: série de pios de caburé
G[44] = ev(G[43], 0.38, { d: 0.28, n: [3, 0.42], v: [5, 0.2] });                                                  // "hu-hu-hu" grave
G[45] = { o: 'p25', f: 2000, c: [1.15, 1, 1.2, 1], d: 0.22, a: [9, 1], n: [2, 0.3], q: [2600, 2] };               // Quero-querinho: alarme estridente
G[46] = ev(G[45], 0.82, { n: [3, 0.29], x: 2 });
G[47] = { o: 'p12', f: 5200, c: [1, 1.2, 0.95], d: 0.05, n: [4, 0.065], a: [60, 0.5] };                           // Beija-florzim: tsip agudíssimo
G[48] = ev(G[47], 0.85, { n: [6, 0.07], np: 1.04, e: 0.35 });
G[49] = { o: 'serra', f: 520, c: [1, 1.1, 0.95], d: 0.2, a: [38, 1], q: [1400, 2.5], n: [2, 0.3] };               // Tucaninho: "rrrek" de tucano
G[50] = ev(G[49], 0.76, { n: [3, 0.3], x: 4, r: 0.2, rb: [2000, 3000] });
G[51] = { o: 'serra', f: 900, c: [0.9, 1.25, 1], d: 0.3, a: [30, 0.8], q: [2000, 1.5], r: 0.3, rb: [2500, 3500], x: 5 }; // Ararinha: grasnado
G[52] = ev(G[51], 0.8, { d: 0.42, h: [1.5, 0.25] });
G[53] = { o: 'p25', f: 1000, c: [1, 1.4, 1.1, 0.8, 1.3, 1.2], d: 0.45, a: [5, 0.9], q: [1700, 2], r: 0.15, rb: [2500, 2500] }; // Papagaiozim: quase fala
G[54] = ev(G[53], 0.85, { d: 0.6, c: [1, 1.4, 1.1, 0.8, 1.3, 1.2, 0.7, 1.5] });
G[55] = { o: 'serra', f: 210, c: [1, 0.85], d: 0.4, r: 0.8, rb: [1800, 900], q: [800, 1], g: 1.1 };               // Urubuzim: bufo
G[56] = ev(G[55], 0.75, { d: 0.6, x: 4, e: 0.3 });

// 57–72 mamíferos da mata
G[57] = { o: 'seno', f: 1900, c: [1, 1.5, 1.2], d: 0.1, n: [3, 0.15], h: [0.5, 0.2] };                            // Capivarinha: assobios em série
G[58] = ev(G[57], 0.6, { d: 0.16, n: [2, 0.24], a: [20, 0.4] });
G[59] = { o: 'tri', f: 800, c: [1, 1.15, 1, 1.2], d: 0.4, v: [9, 0.5], r: 0.2, rb: [2000, 2400] };                // Ouriço-Mirim: choramingo
G[60] = ev(G[59], 0.75, { r: 0.4, a: [24, 0.5] });
G[61] = { o: 'seno', f: 1700, c: [0.9, 1.05, 1], d: 0.7, v: [4, 0.2], h: [2, 0.08], at: 0.08 };                   // Preguicim: "aí" comprido
G[62] = ev(G[61], 0.7, { d: 0.95 });
G[63] = { o: 'serra', f: 240, c: [0.8, 1.1, 1, 0.85], d: 0.5, x: 6, a: [22, 0.5], q: [700, 1.5], r: 0.35, rb: [600, 900] }; // Bugiozinho: ronco de bugio
G[64] = ev(G[63], 0.7, { d: 0.9, e: 0.5, s: 0.5, x: 9 });
G[65] = { o: 'p25', f: 1300, c: [1.2, 0.9], d: 0.1, n: [3, 0.16], q: [2000, 2] };                                 // Preguinho: "hic hic" de macaco-prego
G[66] = ev(G[65], 0.75, { h: [2.76, 0.2], n: [3, 0.18], x: 3 });
G[67] = { o: 'p12', f: 3600, c: [1.2, 1, 0.85, 0.7], d: 0.6, v: [18, 1], a: [14, 0.5] };                          // Mico-Leãozim: trinado descendente
G[68] = ev(G[67], 0.7, { d: 0.75, x: 3, r: 0.15, rb: [3000, 1500] });
G[69] = { o: 'p25', f: 820, c: [0.9, 1.3, 1.1, 0.8], d: 0.4, q: [1500, 2.5], v: [7, 0.3] };                       // Jaguatirim: miado
G[70] = ev(G[69], 0.68, { x: 4, e: 0.45, r: 0.25, rb: [900, 600], d: 0.55 });
G[71] = { o: 'serra', f: 520, c: [0.9, 1.25, 0.9], d: 0.38, x: 4, q: [1100, 2], r: 0.25, rb: [1000, 800], a: [30, 0.3] }; // Onçinha: miado rouco
G[72] = ev(G[71], 0.3, { d: 0.3, n: [4, 0.36], np: 0.96, a: [38, 0.8], x: 12, s: 0.6, r: 0.5, rb: [500, 300], q: [450, 1.2], e: 0.35 }); // esturro serrado de onça

// 73–87 rios, mangues e pantanal
G[73] = { o: 'p25', f: 1100, c: [1, 1.5, 1.3, 1.6, 1], d: 0.4, a: [11, 0.6], q: [2100, 2], x: 2 };                // Ariranhinha: guincho ondulado
G[74] = ev(G[73], 0.78, { n: [2, 0.5], r: 0.3, rb: [1500, 2500] });
G[75] = { o: 'tri', f: 1500, c: [0.8, 1.3], d: 0.08, n: [3, 0.13], np: 1.06 };                                    // Lontrinha: chilros
G[76] = ev(G[75], 0.8, { n: [4, 0.11], r: 0.2, rb: [2000, 5000] });
G[77] = { o: 'seno', f: 2400, c: [1, 1.3, 0.9], d: 0.2, v: [30, 0.5], n: [2, 0.3], e: 0.5, h: [0.5, 0.2] };       // Manatim: pios debaixo d'água
G[78] = ev(G[77], 0.7, { d: 0.35, n: [2, 0.48] });
G[79] = { o: 'tri', f: 500, c: [1, 0.8], d: 0.2, r: 0.5, rb: [1200, 700], at: 0.05, g: 1.1 };                     // Tartaruí: sopro curto
G[80] = ev(G[79], 0.55, { d: 0.6, s: 0.5, e: 0.4, c: [1, 0.85, 0.7] });
G[81] = { o: 'p50', f: 260, c: [1, 1.15, 0.9], d: 0.14, n: [2, 0.24], q: [600, 2], r: 0.2, rb: [700, 700] };      // Jabutim: grunhido "hum hum"
G[82] = ev(G[81], 0.7, { n: [3, 0.3], s: 0.4 });
G[83] = { o: 'p25', f: 900, c: [0.8, 1.4, 0.9], d: 0.09, n: [3, 0.15], q: [1300, 3] };                            // Jacarezinho: chamado de filhote
G[84] = ev(G[83], 0.35, { d: 0.5, n: [1, 0], a: [24, 1], x: 6, r: 0.4, rb: [400, 300], q: [420, 1.5], c: [1, 0.9, 0.8] }); // urro que faz a água vibrar
G[85] = ev(G[84], 0.7, { d: 0.9, e: 0.5, s: 0.6 });
G[86] = { o: 'p12', f: 700, c: [1, 0.9], d: 0.5, r: 1, rb: [5000, 3200], g: 0.9, at: 0.08, m: 0.15 };             // Sucurizinha: silvo
G[87] = ev(G[86], 0.7, { d: 0.8, rb: [3600, 1800], s: 0.3, m: 0.25 });

// 88–92 serpentes
G[88] = { o: 'p12', f: 900, c: [1, 1.1], d: 0.35, r: 1, rb: [6500, 4500], m: 0.1, a: [28, 0.4] };                 // Jararaquinha: silvo com cauda vibrando
G[89] = ev(G[88], 0.75, { d: 0.5, x: 2 });
G[90] = { o: 'seno', f: 1800, c: [1, 1.5, 1, 1.5, 1], d: 0.4, r: 0.6, rb: [6000, 7000], m: 0.5, e: 0.3 };         // Coralzinha: silvo em anéis
G[91] = { o: 'p12', f: 1300, c: [1, 1], d: 0.5, r: 1, rb: [4200, 4600], a: [52, 1], m: 0.12 };                    // Cascavelzim: chocalho
G[92] = ev(G[91], 0.75, { d: 0.8, a: [42, 1], s: 0.3, m: 0.25 });

// 93–104 campo e cerrado
G[93] = { o: 'p25', f: 760, c: [0.8, 1.3, 1.2, 0.9], d: 0.3, n: [2, 0.36], q: [1300, 2], r: 0.15, rb: [1200, 1200] }; // Graxaim: ganido
G[94] = ev(G[93], 0.8, { e: 0.7, v: [5, 0.6], d: 0.6, n: [1, 0], at: 0.12, o: 'tri' });                           // uivo de neblina
G[95] = { o: 'p50', f: 1700, c: [1, 1.2, 0.9], d: 0.05, n: [5, 0.08], np: 0.97, q: [2400, 2] };                   // Quatinho: tagarelar de quati
G[96] = ev(G[95], 0.75, { n: [4, 0.1], r: 0.2, rb: [2000, 2000] });
G[97] = { o: 'seno', f: 2100, c: [0.7, 1.2, 1.1], d: 0.35, h: [2, 0.1], r: 0.1, rb: [2500, 2500] };               // Tapirinho: assobio de anta
G[98] = ev(G[97], 0.6, { d: 0.5, s: 0.4, r: 0.3, rb: [700, 500] });
G[99] = { o: 'p25', f: 980, c: [1, 1.1, 0.85], d: 0.22, v: [26, 0.5], q: [1600, 2] };                             // Catingueirinho: balido
G[100] = ev(G[99], 0.7, { d: 0.45, e: 0.45, h: [1.5, 0.2] });
G[101] = { o: 'seno', f: 2300, c: [1.1, 0.9, 0.8], d: 0.3, n: [2, 0.4] };                                         // Ema-Mirim: piado triste
G[102] = ev(G[101], 0.1, { o: 'tri', d: 0.5, s: 0.6, n: [2, 0.6], c: [1, 0.85], e: 0.3 });                        // ronco profundo de ema macho
G[103] = { o: 'p25', f: 1500, c: [1, 1.25, 1.1], d: 0.1, n: [5, 0.15], np: 1.03, q: [2200, 2] };                  // Seriemim: gargalhada de seriema
G[104] = ev(G[103], 0.8, { n: [7, 0.13], x: 2, e: 0.3 });

// 105–110 aves grandes
G[105] = { o: 'p50', f: 600, c: [1, 0.8], d: 0.03, n: [6, 0.07], p: true, r: 0.6, rb: [1500, 1200] };             // Tuiuiuzim: matraquear de bico
G[106] = ev(G[105], 0.75, { n: [8, 0.075], s: 0.3 });
G[107] = { o: 'serra', f: 420, c: [1, 1.1, 0.9], d: 0.25, a: [34, 1], q: [1300, 1.5], r: 0.3, rb: [1800, 1500] }; // Garcinha: "graa"
G[108] = ev(G[107], 0.75, { d: 0.4, x: 3 });
G[109] = { o: 'p12', f: 2800, c: [0.9, 1.15, 1.1, 0.95], d: 0.5, v: [7, 0.2] };                                   // Harpinha: assobio penetrante
G[110] = ev(G[109], 0.72, { d: 0.7, n: [2, 0.8], r: 0.15, rb: [3000, 2500], e: 0.4, x: 2 });

// 111–132 águas
G[111] = { o: 'seno', f: 300, c: [1, 2.4], d: 0.09, n: [2, 0.2], r: 0.3, rb: [600, 1800], s: 0.3 };               // Pirarucinho: boiada para respirar
G[112] = ev(G[111], 0.6, { d: 0.16, n: [2, 0.34], e: 0.4, x: 3 });
G[113] = { o: 'p25', f: 320, c: [1, 0.8], d: 0.07, a: [60, 1], n: [3, 0.11], r: 0.4, rb: [2500, 2500] };          // Piranhinha: latido tamborilado
G[114] = ev(G[113], 0.75, { n: [5, 0.09], x: 4 });
G[115] = { o: 'p50', f: 240, c: [1, 1, 3, 1], d: 0.3, a: [70, 1], r: 0.3, rb: [5000, 8000], h: [4, 0.3] };        // Poraquim: descarga
G[116] = ev(G[115], 0.8, { d: 0.5, x: 5, c: [1, 1, 3, 1, 4, 1] });
G[117] = { o: 'tri', f: 440, c: [1, 0.7, 1.8], d: 0.3, r: 0.4, rb: [900, 3500], at: 0.05 };                       // Arraiazinha: abanada e ferroada
G[118] = ev(G[117], 0.7, { d: 0.45, s: 0.4 });
G[119] = { o: 'p12', f: 2200, c: [1, 1.5], d: 0.04, n: [3, 0.09], e: 0.5, h: [1.5, 0.4] };                        // Hipocampim: estalinhos
G[120] = ev(G[119], 0.75, { n: [4, 0.1], np: 1.12, d: 0.07 });
G[121] = { o: 'seno', f: 500, c: [1, 0.6, 1.6], d: 0.22, v: [12, 1.5], r: 0.3, rb: [800, 2200] };                 // Polvinho: esguicho
G[122] = ev(G[121], 0.7, { d: 0.4, h: [1.41, 0.3], e: 0.4 });
G[123] = { o: 'seno', f: 2600, c: [1, 1.5, 1.25, 2], d: 0.3, a: [20, 0.8], e: 0.5 };                              // Estrelinha: cintilar
G[124] = ev(G[123], 0.75, { d: 0.5, h: [1.41, 0.35], v: [6, 1] });
G[125] = { o: 'tri', f: 900, c: [1, 1.2, 0.9, 1.1], d: 0.5, v: [5, 2], at: 0.1, e: 0.5, a: [40, 0.3] };           // Medusim: ondular gelatinoso
G[126] = ev(G[125], 0.7, { d: 0.7, r: 0.25, rb: [5000, 7000] });
G[127] = { o: 'tri', f: 350, c: [0.8, 1.4], d: 0.3, at: 0.1, r: 0.3, rb: [500, 1500], q: [700, 3] };              // Aruá: sorvo lento
G[128] = ev(G[127], 0.7, { d: 0.5, s: 0.4 });
G[129] = { o: 'p12', f: 2100, c: [1, 0.7], d: 0.03, n: [6, 0.055], p: true, r: 0.5, rb: [3500, 3000] };           // Sirizim: estalos ligeiros
G[130] = ev(G[129], 0.7, { h: [2.76, 0.3], n: [5, 0.07], x: 3 });
G[131] = { o: 'seno', f: 300, c: [0.8, 1, 1.5, 1.3], d: 0.8, v: [4, 0.3], at: 0.15, e: 0.7, h: [2, 0.15] };       // Baleiazinha: gemido ascendente
G[132] = ev(G[131], 0.6, { d: 1.3, c: [0.8, 1, 1.6, 1.2, 2, 1.1], s: 0.5 });                                      // canto de jubarte

// 133–140 frio
G[133] = { o: 'p25', f: 900, c: [1.2, 1.25, 0.8, 0.8], d: 0.4, a: [30, 0.7], q: [1500, 2], r: 0.2, rb: [2000, 2000] }; // Pinguinzinho: zurro
G[134] = ev(G[133], 0.8, { n: [2, 0.5], x: 2 });
G[135] = { o: 'serra', f: 1200, c: [1, 1.15, 0.95], d: 0.14, a: [45, 0.9], n: [2, 0.22], q: [2500, 1.5], r: 0.3, rb: [3000, 3000] }; // Gralhinha: "craa craa"
G[136] = ev(G[135], 0.8, { n: [3, 0.21], e: 0.3 });
G[137] = { o: 'p12', f: 2400, c: [1.2, 0.8], d: 0.04, n: [6, 0.075], r: 0.4, rb: [4000, 3000] };                  // Serelepim: "tchk-tchk"
G[138] = ev(G[137], 0.75, { n: [5, 0.09], h: [0.5, 0.3] });
G[139] = { o: 'p25', f: 1100, c: [0.85, 1.25, 1], d: 0.35, v: [8, 0.3], q: [1900, 2.5] };                         // Maracajim: miado fino
G[140] = ev(G[139], 0.7, { d: 0.5, r: 0.3, rb: [4000, 6000], e: 0.4, x: 3 });

// 141–158 insetos e aracnídeos
G[141] = { o: 'seno', f: 4500, c: [1, 1], d: 0.12, a: [36, 1], n: [3, 0.2] };                                     // Grilinho: cri-cri
G[142] = ev(G[141], 0.75, { o: 'p50', h: [2, 0.3], n: [3, 0.24], d: 0.18, r: 0.2, rb: [6000, 8000] });
G[143] = { o: 'serra', f: 150, c: [1, 1.15, 1], d: 0.4, a: [85, 0.9], q: [900, 1], at: 0.06 };                    // Besourim: voo pesado
G[144] = ev(G[143], 0.75, { d: 0.6, h: [5.4, 0.15], x: 5 });
G[145] = { o: 'p12', f: 1500, c: [1, 0.8], d: 0.04, n: [3, 0.1], p: true, r: 0.7, rb: [5000, 5000] };             // Escorpim: estalos de pinça
G[146] = ev(G[145], 0.7, { h: [2.76, 0.3], n: [4, 0.11], x: 3 });
G[147] = { o: 'serra', f: 260, c: [1, 0.9], d: 0.35, r: 1, rb: [3000, 4500], a: [44, 0.9], m: 0.3 };              // Caranguejeirinha: estridulação
G[148] = ev(G[147], 0.7, { d: 0.55, s: 0.3 });
G[149] = { o: 'serra', f: 420, c: [1, 1.12, 0.95, 1.08], d: 0.4, a: [110, 0.6], q: [1500, 1.5], at: 0.05 };       // Jataí: zumbido miúdo
G[150] = ev(G[149], 0.75, { d: 0.6, h: [2, 0.25], e: 0.3 });
G[151] = { o: 'p25', f: 330, c: [1, 1.2, 1, 1.3], d: 0.35, a: [130, 0.7], x: 3 };                                 // Marimbinho: zumbido bravo
G[152] = ev(G[151], 0.75, { d: 0.55, x: 6, r: 0.2, rb: [3000, 3000] });
G[153] = { o: 'serra', f: 2800, c: [0.9, 1, 1.05], d: 0.6, a: [75, 1], q: [3200, 3], at: 0.2 };                   // Cigarrim: canto que cresce
G[154] = ev(G[153], 0.8, { d: 0.9, c: [0.85, 1, 1.08, 1.1], h: [1.5, 0.3], x: 3 });
G[155] = { o: 'p12', f: 300, c: [1, 1.3, 1], d: 0.3, a: [48, 1], r: 0.4, rb: [4000, 6000] };                      // Lavadeirim: asas de libélula
G[156] = ev(G[155], 0.7, { d: 0.6, e: 0.5, h: [3, 0.25], c: [1, 1.3, 1, 1.5] });
G[157] = { o: 'p12', f: 1700, c: [1, 2.2], d: 0.1, r: 0.5, rb: [3000, 8000], n: [2, 0.17] };                      // Louvadeuzim: golpes no ar
G[158] = ev(G[157], 0.75, { n: [3, 0.15], x: 2 });

// 159–172 subsolo, pedra e noite
G[159] = { o: 'tri', f: 170, c: [1, 1.4, 0.8], d: 0.35, r: 0.4, rb: [300, 700], a: [13, 0.5], s: 0.3 };           // Minhocuçu: deslizar úmido
G[160] = ev(G[159], 0.55, { d: 0.9, e: 0.5, x: 5, s: 0.6 });
G[161] = { o: 'p50', f: 330, c: [1, 0.75], d: 0.05, n: [4, 0.13], p: true, q: [700, 2] };                         // Tuquim: "tuc-tuc" na toca
G[162] = ev(G[161], 0.7, { n: [5, 0.12], h: [2.76, 0.2] });
G[163] = { o: 'p12', f: 2600, c: [1, 0.8], d: 0.02, n: [7, 0.045], p: true, r: 0.4, rb: [4000, 4000] };           // Cupinzim: batidas de cabeça
G[164] = ev(G[163], 0.2, { d: 0.08, n: [4, 0.16], s: 0.5, r: 0.6, rb: [500, 300] });                              // o cupinzeiro inteiro pisa
G[165] = { o: 'seno', f: 2700, c: [1, 1.2, 1.2], d: 0.13, n: [2, 0.2], h: [2, 0.12] };                            // Mocozim: assobio de alerta
G[166] = ev(G[165], 0.72, { n: [3, 0.19], r: 0.15, rb: [1200, 1000] });
G[167] = { o: 'p12', f: 4200, c: [1, 1.1, 0.9], d: 0.3, v: [35, 0.6], a: [35, 0.4] };                             // Andorim: grito de andorinhão
G[168] = ev(G[167], 0.8, { d: 0.45, r: 0.3, rb: [1500, 3000], e: 0.4 });
G[169] = { o: 'seno', f: 1100, c: [1, 0.95], d: 0.3, n: [4, 0.36], np: 0.84, v: [5, 0.2], e: 0.6, at: 0.04 };     // Urutauzim: lamento em degraus
G[170] = ev(G[169], 0.75, { d: 0.4, n: [5, 0.45], h: [1.5, 0.15] });
G[171] = { o: 'tri', f: 520, c: [0.9, 1.05, 0.9], d: 0.2, n: [3, 0.3], e: 0.5, q: [900, 2] };                     // Noitim: "hu" de macaco-da-noite
G[172] = ev(G[171], 0.72, { d: 0.3, n: [3, 0.4], v: [6, 0.4], h: [2, 0.15] });

// 173–180 lendários: longos, em camadas e com muita ambiência
G[173] = { o: 'serra', f: 110, c: [0.7, 1, 1.6, 1.2, 2, 0.9], d: 1.5, x: 10, r: 0.8, rb: [600, 4500], a: [17, 0.5], s: 0.6, h: [1.5, 0.4], e: 0.7, at: 0.15 }; // Boitatá: labareda que serpenteia
G[174] = { o: 'tri', f: 82, c: [1, 0.8, 1.3, 0.7, 0.6], d: 1.8, r: 0.7, rb: [2500, 300], v: [3, 0.8], s: 0.7, h: [2, 0.3], e: 0.8, x: 6, at: 0.25 };          // Boiúna: o rio inteiro se move
G[175] = { o: 'serra', f: 70, c: [1, 1.3, 1.1, 0.8], d: 1.6, x: 14, a: [21, 0.6], q: [380, 1.2], r: 0.5, rb: [400, 250], s: 0.7, e: 0.7, at: 0.1 };           // Mapinguari: brado ancestral
G[176] = { o: 'p25', f: 190, c: [1, 1.4, 0.9, 1.5, 0.8], d: 1.1, x: 8, a: [28, 0.9], r: 0.5, rb: [900, 1600], q: [800, 1.3], s: 0.5, e: 0.55, h: [1.5, 0.3] }; // Queixada-Caipora: bater de queixo
G[177] = { o: 'seno', f: 1800, c: [1, 1.5, 1.25, 2, 1.5, 2.25, 1.68, 2.5, 2], d: 1.6, a: [9, 0.85], v: [6, 0.15], h: [2, 0.2], e: 0.8 };                      // Uirapuru: canto de flauta
G[178] = { o: 'p12', f: 1500, c: [1.4, 1.2, 1, 0.75, 0.6], d: 1.2, x: 5, r: 0.6, rb: [5000, 900], a: [45, 0.4], h: [0.5, 0.5], s: 0.3, e: 0.7 };              // Gavião-Tupã: grito que vira trovão
G[179] = { o: 'tri', f: 330, c: [0.7, 1, 1.5, 1.5, 1.45, 1.1], d: 2.0, v: [5, 0.3], h: [1.5, 0.35], e: 0.9, at: 0.2, r: 0.1, rb: [800, 800], s: 0.3 };        // Lobo-Jaci: uivo para a lua
G[180] = { o: 'serra', f: 105, c: [0.8, 1.2, 1, 0.7], d: 0.5, n: [3, 0.56], np: 0.94, x: 14, a: [36, 0.8], q: [480, 1.2], r: 0.6, rb: [700, 2500], s: 0.7, h: [2, 0.3], e: 0.6 }; // Onça-Guaraci: esturro solar

export const GRITOS: readonly Grito[] = G;
export const TOTAL_GRITOS = 180;
