import type { TreinadorDef } from '../../core/tipos';

/**
 * Ginásio da Ginga (nº 12, Cidade Ginga): capoeiristas da academia e o líder Mestre Gingado.
 * Mapa B, depois da Liga: líder com ás 63 (tabela 4.5, faixa 59–63); a turma fica de 57 a 61 (ás − 2 a − 6).
 * Estágios coerentes: Harpia só depois do 45, Pintada depois do 40, Prego-Mestre depois do 36; as demais linhas de
 * Ginga evoluem entre 25 e 34.
 */
export const TREINADORES_GINASIO_12: TreinadorDef[] = [
  { id: 'g12-1', classe: 'Capoeirista', nome: 'Calango', sprite: 'cl-capoeirista', ia: 'treinador', premio: 2000,
    equipe: [{ e: 46, nv: 57 }, { e: 104, nv: 57 }, { e: 158, nv: 58 }],
    desafio: 'Ê, chegou visita na academia! Antes da roda, uma ginga comigo!', derrota: 'Caí na rasteira…', depois: 'O Sabiá joga devagar, no toque de Angola. Olhe a seta em cima dele e guarde a sequência inteira.' },
  { id: 'g12-2', classe: 'Capoeirista', nome: 'Mandingueira', sprite: 'cl-capoeirista', ia: 'treinador', premio: 2040,
    equipe: [{ e: 96, nv: 58 }, { e: 74, nv: 58 }, { e: 23, nv: 59 }],
    desafio: 'Na roda, quem tem mandinga não apanha. Vamos ver a sua!', derrota: 'Sua mandinga é mais forte.', depois: 'Não corra na frente do berimbau. A seta vale quando a batida soa: espere o "dom".' },
  { id: 'g12-3', classe: 'Capoeirista', nome: 'Saracura', sprite: 'cl-capoeirista', ia: 'treinador', premio: 2040,
    equipe: [{ e: 114, nv: 58 }, { e: 140, nv: 59 }, { e: 64, nv: 59 }],
    desafio: 'Psiu! Antes do Corisco, joga comigo aqui no canto!', derrota: 'Rodei e caí.', depois: 'No Benguela são três voltas. Numa volta você pode tropeçar uma vez, não duas.' },
  { id: 'g12-4', classe: 'Capoeirista', nome: 'Beija-Flor', sprite: 'cl-capoeirista', ia: 'treinador', premio: 2080,
    equipe: [{ e: 158, nv: 59 }, { e: 66, nv: 60 }, { e: 102, nv: 60 }],
    desafio: 'Leve feito beija-flor, rápido feito o São Bento Grande!', derrota: 'Voei longe.', depois: 'O Gavião chama até seis golpes de uma vez. Cante a sequência baixinho enquanto ele joga: Armada, Meia-lua…' },
  { id: 'g12-5', classe: 'Capoeirista', nome: 'Contramestra Jurema', sprite: 'cl-capoeirista', ia: 'treinador', premio: 2120,
    equipe: [{ e: 110, nv: 60 }, { e: 104, nv: 60 }, { e: 72, nv: 61 }],
    desafio: 'Passou pelas três rodas? Então você merece jogar com quem ensina a roda!', derrota: 'Axé, camará. Você está pronto.', depois: 'O Mestre Gingado cura a turma no meio do jogo e troca de criatura feito quem troca de ginga. Vento, Mente e Encanto desequilibram a Ginga.' },
  /*
   * LÍDER — Mestre Gingado (Ginga). Quem bate forte na Ginga: Vento, Mente e Encanto.
   * Estratégia: o Bugio-Trovão (Ginga/Trovão) abre e derruba Vento com Tempestade de Raios; o Ariranhão (Rio/Ginga),
   * rápido, castiga Brasa e Pedra; o Emaçu (Terra/Ginga) pune Trovão, Veneno e Ferro com Tremor de Terra; o
   * Prego-Mestre (Ginga/Ferro) é a cobertura contra Mente e Encanto (aguenta os dois e devolve Bigornada no Encanto);
   * a Harpia (Vento/Ginga) responde Mata e Inseto com Mergulho de Gavião. O ás Pintada (Comum/Ginga), de ataque altíssimo,
   * levanta a Ginga (ataque e velocidade) e bate com Arpão de Cabeça e Martelo; segura um Açaí para repor PG.
   * Cura: Elixir de Andiroba e 2 Garrafadas (depois do 8º ginásio o líder usa remédios — spec 7A).
   */
  { id: 'lider-12', classe: 'Líder', nome: 'Mestre Gingado', sprite: 'lider-11', ia: 'lider', premio: 5500, insignia: 12, musica: 'batalha-lider', flag: 'ginasio-12-vencido',
    itens: ['elixir-andiroba', 'garrafada', 'garrafada'],
    equipe: [
      { e: 64, nv: 60, golpes: ['tempestade-de-raios', 'meia-lua', 'estrondo', 'grito-de-guerra'] },
      { e: 74, nv: 60, golpes: ['cachoeirada', 'queixada', 'mordida-de-piranha', 'rasteira'] },
      { e: 102, nv: 61, golpes: ['tremor-de-terra', 'armada', 'pisao-de-anta', 'esquiva'] },
      { e: 66, nv: 61, golpes: ['bigornada', 'martelo', 'lasca-afiada', 'amolar-garras'] },
      { e: 110, nv: 62, golpes: ['mergulho-de-gaviao', 'queixada', 'bico-furador', 'vento-a-favor'] },
      { e: 72, nv: 63, golpes: ['ginga', 'arpao-de-cabeca', 'martelo', 'queixada'], item: 'acai' },
    ],
    desafio: 'Iê! A roda está formada e o berimbau chamou. Camará, a capoeira é diálogo: eu pergunto com o corpo, você responde. Vamos jogar!',
    derrota: 'Iê, viva meu mestre! Viva você também, camará: jogou com malícia e com respeito.', depois: 'Na roda e na vida, quem ginga não cai.' },
];
