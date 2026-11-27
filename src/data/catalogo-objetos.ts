/**
 * Catálogo de objetos grandes de mapa (parte EXTERIOR). Os de interior ficam em `catalogo-interiores.ts`.
 * Contrato (docs/ZONAS.md e docs/BAKE.md): um objeto colocado em (x, y) ocupa `w`×`h` tiles com (x, y) no
 * canto inferior esquerdo do rodapé; `alto` = linhas extras acima do rodapé, desenhadas POR CIMA do jogador;
 * `colisao` = `h` linhas (de cima para baixo) com `#` bloqueia · `.` livre · `~` só de barco não passa (água sob o objeto);
 * `porta` = [dx, dy]: o tile da porta é (x + dx, y − dy) e é sempre livre (o warp fica nele).
 */
export interface ObjetoCatalogo {
  w: number; h: number; alto: number;
  colisao: string[];
  porta?: [number, number];
  /** 4 quadros no bake (fonte, fogueira…) */
  animado?: boolean;
  /** acende à noite (janela, lâmpada, brasa) */
  luz?: boolean;
  desc: string;
}

const cheio = (w: number, h: number): string[] => Array.from({ length: h }, () => '#'.repeat(w));
const livre = (w: number, h: number): string[] => Array.from({ length: h }, () => '.'.repeat(w));
/** prédio maciço com a porta aberta na linha de baixo */
function predio(w: number, h: number, alto: number, portaDx: number, desc: string, extra: Partial<ObjetoCatalogo> = {}): ObjetoCatalogo {
  const col = cheio(w, h);
  col[h - 1] = col[h - 1].slice(0, portaDx) + '.' + col[h - 1].slice(portaDx + 1);
  return { w, h, alto, colisao: col, porta: [portaDx, 0], luz: true, desc, ...extra };
}
const bloco = (w: number, h: number, alto: number, desc: string, extra: Partial<ObjetoCatalogo> = {}): ObjetoCatalogo => ({ w, h, alto, colisao: cheio(w, h), desc, ...extra });

export const CATALOGO_EXTERIOR: Record<string, ObjetoCatalogo> = {
  /* ---- casas ---- */
  'casa-a': predio(4, 3, 2, 1, 'casa caiçara branca de telha de barro, porta azul à esquerda'),
  'casa-b': predio(4, 3, 2, 2, 'casa amarela com chaminé e floreira'),
  'casa-c': predio(5, 3, 2, 2, 'casa larga com alpendre e duas janelas'),
  'casa-d': predio(4, 3, 2, 1, 'casa de madeira com telhado de zinco'),
  'casa-e': predio(3, 3, 2, 1, 'casinha estreita de porta e janela'),
  'casa-f': predio(5, 3, 2, 3, 'casa de esquina com varal e caixa-d\'água'),
  'casa-palafita': predio(4, 3, 2, 1, 'casa de madeira sobre estacas, com escada e telhado de palha'),
  'casa-colonial-a': predio(4, 3, 3, 1, 'sobrado colonial amarelo com sacadas de ferro'),
  'casa-colonial-b': predio(4, 3, 3, 2, 'sobrado colonial azul com barra de azulejos'),
  'casa-colonial-c': predio(5, 3, 3, 2, 'sobrado colonial rosa de três janelas'),
  /* ---- serviços ---- */
  posto: predio(5, 3, 2, 2, 'Posto Guardião: telhado verde-água, emblema da folha e lampião na porta'),
  venda: predio(4, 3, 2, 1, 'Venda: toldo listrado, vitrine e caixotes'),
  ginasio: predio(6, 4, 3, 3, 'Ginásio: fachada de pedra com colunas, frontão e estandartes'),
  laboratorio: predio(6, 3, 2, 2, 'laboratório: telhado plano, janelões e antena'),
  estacao: predio(8, 3, 2, 4, 'estação de trem: frontão com relógio e marquise de madeira'),
  mercado: predio(6, 3, 2, 3, 'mercado: barracas de toldo com peixe e frutas'),
  oficina: predio(5, 3, 2, 2, 'oficina: portão de enrolar e engrenagem na placa'),
  observatorio: predio(4, 3, 3, 1, 'observatório: torre redonda com cúpula e luneta'),
  forja: predio(4, 3, 2, 1, 'forja: pedra, chaminé e fornalha acesa'),
  igreja: predio(4, 3, 4, 1, 'igrejinha colonial com torre, sino e cruz'),
  farol: predio(2, 2, 5, 0, 'farol listrado; a lanterna acende à noite'),
  'usina-fachada': predio(8, 4, 3, 4, 'fachada da usina: tijolo, chaminés e portão de ferro'),
  'mina-entrada': { w: 3, h: 2, alto: 1, colisao: ['###', '#.#'], porta: [1, 0], desc: 'boca de mina escorada com madeira e trilho' },
  'caverna-entrada': { w: 3, h: 2, alto: 1, colisao: ['###', '#.#'], porta: [1, 0], desc: 'boca de caverna na rocha' },
  coreto: { w: 3, h: 3, alto: 2, colisao: ['###', '###', '#.#'], desc: 'coreto de praça com gradil e telhado cônico' },
  /* ---- transporte ---- */
  cais: { w: 4, h: 2, alto: 0, colisao: livre(4, 2), desc: 'cais de madeira com cabeços de amarração (anda por cima)' },
  saveiro: bloco(5, 2, 3, 'saveiro de vela içada atracado'),
  trem: bloco(8, 2, 1, 'locomotiva e vagão do Trem Serra-Sol'),
  barco: bloco(3, 2, 0, 'barco de pesca pintado'),
  jangada: bloco(3, 1, 2, 'jangada de vela triangular'),
  canoa: bloco(2, 1, 0, 'canoa de tronco'),
  /* ---- mobiliário de rua ---- */
  placa: bloco(1, 1, 0, 'placa de madeira'),
  poste: bloco(1, 1, 2, 'poste de lampião (aceso à noite)', { luz: true }),
  banco: bloco(2, 1, 0, 'banco de praça'),
  fonte: bloco(2, 2, 1, 'fonte de pedra com água correndo', { animado: true }),
  fogueira: bloco(1, 1, 0, 'fogueira de São João', { animado: true, luz: true }),
  estatua: bloco(1, 1, 1, 'estátua de guardião em pedestal'),
  totem: bloco(1, 1, 1, 'totem entalhado'),
  ninho: bloco(1, 1, 0, 'ninho de gravetos com ovos'),
  /* ---- natureza ---- */
  cupinzeiro: bloco(1, 1, 1, 'cupinzeiro do cerrado'),
  'ipe-amarelo': bloco(1, 1, 2, 'ipê-amarelo florido'),
  'ipe-roxo': bloco(1, 1, 2, 'ipê-roxo florido'),
  coqueiro: bloco(1, 1, 2, 'coqueiro'),
  araucaria: bloco(1, 1, 3, 'araucária'),
  buriti: bloco(1, 1, 3, 'buriti'),
  cacto: bloco(1, 1, 2, 'mandacaru'),
  bromelia: bloco(1, 1, 0, 'bromélia'),
  'tronco-caido': bloco(2, 1, 0, 'tronco caído com cogumelos'),
  'pedra-grande': bloco(2, 2, 0, 'matacão'),
  cuieira: bloco(1, 1, 2, 'cuieira (árvore da cuia) com cabaças coloridas; a cor vem do spawn `cor` — colheita: src/data/eventos/captura.ts'),
};

/** Todos os nomes exteriores (o catálogo completo = este + o de interiores). */
export const NOMES_EXTERIOR = Object.keys(CATALOGO_EXTERIOR);
