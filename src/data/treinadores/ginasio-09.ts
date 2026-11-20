import type { TreinadorDef } from '../../core/tipos';

/**
 * Ginásio da Terra (nº 9, Pantanal Grande): peões e pantaneiros do curral e a líder Boiadeira Zefa.
 * Primeiro ginásio depois da Liga: líder com ás 55 (tabela 4.5, faixa 51–55; curva de docs/EQUILIBRIO-MAPA-B.md); a turma fica de 49 a 53 (ás − 2 a − 6).
 * Estágios coerentes: Jacaretinga só até o 44 (vira Jacaruçu no 45), Emaçu e Antão depois do 34, Sucurião depois do 38.
 */
export const TREINADORES_GINASIO_09: TreinadorDef[] = [
  { id: 'g09-1', classe: 'Vaqueiro', nome: 'Tonho Berrante', sprite: 'cl-vaqueiro', ia: 'treinador', premio: 1720,
    equipe: [{ e: 102, nv: 49 }, { e: 92, nv: 49 }],
    desafio: 'Ôôô, boi! Quem entra no curral da Zefa passa primeiro pelo meu berrante!', derrota: 'Desafinou o berrante…', depois: 'No primeiro cercado, bota o pé numa das pontas ou bem no meio. Do lado delas, atola na certa.' },
  { id: 'g09-2', classe: 'Pescador', nome: 'Seu Dito Pacu', sprite: 'cl-pescador', ia: 'treinador', premio: 1760,
    equipe: [{ e: 40, nv: 50 }, { e: 85, nv: 50 }, { e: 87, nv: 50 }],
    desafio: 'Peixe de lama é o que mais briga. Olha só!', derrota: 'Escapou da rede…', depois: 'O cercado do meio tem um fardo amarrado no canto. Comece pelo lado da porteira, colado na cerca ou duas colunas adiante.' },
  { id: 'g09-3', classe: 'Bióloga', nome: 'Drª Iracy', sprite: 'cl-biologa', ia: 'treinador', premio: 1800,
    equipe: [{ e: 19, nv: 51 }, { e: 89, nv: 51 }, { e: 98, nv: 51 }],
    desafio: 'Estudo o solo do Pantanal há vinte anos. Este barro aqui tem bicho de todo tamanho!', derrota: 'Amostra perdida.', depois: 'Pense na lama como um tabuleiro de dama, casa clara e casa escura. O caminho tem de terminar bem debaixo da porteira.' },
  { id: 'g09-4', classe: 'Vaqueiro', nome: 'Zé Laço', sprite: 'cl-vaqueiro', ia: 'treinador', premio: 1840,
    equipe: [{ e: 34, nv: 51 }, { e: 102, nv: 52 }, { e: 92, nv: 52 }],
    desafio: 'Laço armado! Daqui ninguém chega no último cercado sem passar por mim!', derrota: 'Arrebentou a corda.', depois: 'No último cercado só tem um começo: entre os dois fardos. Lá dentro, vá ao leste primeiro e deixe o canto da porteira para o fim.' },
  { id: 'g09-5', classe: 'Mateira', nome: 'Benedita', sprite: 'cl-mateira', ia: 'treinador', premio: 1880,
    equipe: [{ e: 160, nv: 52 }, { e: 87, nv: 52 }, { e: 19, nv: 53 }],
    desafio: 'Passou pelos três cercados sem atolar? A Zefa vai gostar de você. Eu, nem tanto!', derrota: 'Barro na cara, que vergonha.', depois: 'A Zefa cura a boiada no meio da luta. Leve criatura de Rio, Mata ou Geada: a terra dela não gosta.' },
  /*
   * LÍDER — Boiadeira Zefa (Terra). Quem bate forte na Terra: Mata, Rio e Geada.
   * Estratégia: a Saúva-Rainha abre e castiga Mata com Sanguessuga (e Golpe de Asa); o Jararacuçu envenena e tira a
   * velocidade com Atoleiro; o Sucurião (Rio/Terra) aguenta Rio e Brasa e devolve Cachoeirada; o Emaçu (Terra/Ginga),
   * ligeiro, responde a Geada com Armada; o Antão (Terra/Mata) é a cobertura contra Rio, com Espinho de Mandacaru e
   * Barro Curativo. O ás Tatucanastra (Terra/Ferro) levanta a Couraça de Pedra e bate com Tremor de Terra e Marretada
   * (Ferro contra Geada); segura um Buriti contra congelamento.
   * Cura: 2 Garrafadas (depois do 8º ginásio o líder usa remédios — spec 7A).
   */
  { id: 'lider-09', classe: 'Líder', nome: 'Boiadeira Zefa', sprite: 'lider-05', ia: 'lider', premio: 4900, insignia: 9, musica: 'batalha-lider', flag: 'ginasio-09-vencido',
    itens: ['garrafada', 'garrafada'],
    equipe: [
      { e: 19, nv: 51, golpes: ['tremor-de-terra', 'sanguessuga', 'golpe-de-asa', 'terra-batida'] },
      { e: 89, nv: 51, golpes: ['bote-de-jararaca', 'vocoroca', 'atoleiro', 'curare'] },
      { e: 87, nv: 52, golpes: ['cachoeirada', 'tremor-de-terra', 'canoa-virada', 'fincar-pe'] },
      { e: 102, nv: 52, golpes: ['tremor-de-terra', 'armada', 'pisao-de-anta', 'esquiva'] },
      { e: 98, nv: 53, golpes: ['casco-pesado', 'espinho-de-mandacaru', 'barro-curativo', 'pisao-de-anta'] },
      { e: 34, nv: 55, golpes: ['tremor-de-terra', 'marretada', 'couraca-de-pedra', 'soterrar'], item: 'buriti' },
    ],
    desafio: 'Eita, chegou com as botas limpas? Pois aqui no curral se aprende de baixo para cima: pé no barro primeiro!',
    derrota: 'Arre égua! Você tem raiz funda, menino. Dessas que nem enchente arranca.', depois: 'O Pantanal ensina: a água sobe, a água desce, e quem tem chão firme fica.' },
];
