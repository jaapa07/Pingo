import type { TreinadorDef } from '../../core/tipos';

/** Ginásio da Pedra (Chapada Rubra): garimpeiros da mina e o líder Garimpeiro Topázio. Líder nv 41–43 (tabela 4.5). */
export const TREINADORES_GINASIO_09: TreinadorDef[] = [
  { id: 'g09-1', classe: 'Garimpeiro', nome: 'Juca Bateia', sprite: 'cl-garimpeiro', ia: 'treinador', premio: 1520,
    equipe: [{ e: 165, nv: 37 }, { e: 127, nv: 37 }, { e: 166, nv: 38 }],
    desafio: 'Epa! Ninguém mexe no meu desvio sem antes peneirar comigo!', derrota: 'Só cascalho na minha bateia…', depois: 'A chave ao lado do trilho escolhe para que lado o vagonete vira lá no meio do abismo.' },
  { id: 'g09-2', classe: 'Montanhista', nome: 'Rosa Paredão', sprite: 'cl-montanhista', ia: 'treinador', premio: 1560,
    equipe: [{ e: 167, nv: 38 }, { e: 163, nv: 38 }, { e: 36, nv: 39 }],
    desafio: 'Subi essa chapada no braço. Você veio de vagonete? Que moleza!', derrota: 'Escorreguei feio.', depois: 'O vagonete daqui só sobe quando o desvio lá do leste aponta para o norte.' },
  { id: 'g09-3', classe: 'Garimpeiro', nome: 'Tião Pepita', sprite: 'cl-garimpeiro', ia: 'treinador', premio: 1600,
    equipe: [{ e: 42, nv: 39 }, { e: 128, nv: 39 }, { e: 164, nv: 40 }],
    desafio: 'Guardo esta galeria faz trinta anos. Pedra por pedra!', derrota: 'Desmoronei…', depois: 'A chave do canto vira o trilho de cima. Depois é voltar e mandar o primeiro vagonete para o oeste de novo.' },
  { id: 'g09-4', classe: 'Escoteira', nome: 'Lia Quartzo', sprite: 'cl-escoteira', ia: 'treinador', premio: 1640,
    equipe: [{ e: 166, nv: 40 }, { e: 36, nv: 40 }, { e: 42, nv: 40 }, { e: 128, nv: 40 }],
    desafio: 'Chegou até aqui? Então me mostra se brilha mesmo!', derrota: 'Você é pedra preciosa.', depois: 'O Topázio começa devagar e termina feito avalanche.' },
  /*
   * LÍDER — Garimpeiro Topázio (Pedra). Fraquezas da Pedra: Rio, Mata, Ginga, Terra e Ferro.
   * Estratégia: abre com Aruazão (Rio/Pedra), que anula Brasa e Terra e joga Atoleiro para tirar a velocidade de quem
   * vem bater primeiro; o Cupinzeiro-Vivo (Pedra/Inseto) e o Calangão (Brasa/Pedra) punem os tipos Mata e Ferro que o
   * desafiante traz; o Guaiamuque devolve Rio contra Terra. O ás Mocó-da-Rocha levanta a Couraça de Pedra no primeiro
   * turno e passa a bater com Lasca Afiada e Brilho de Cristal (especial, pega quem só investiu em Defesa).
   * Cura: 2 Garrafadas, guardadas para o Mocó e o Aruazão.
   */
  { id: 'lider-09', classe: 'Líder', nome: 'Garimpeiro Topázio', sprite: 'lider-09', ia: 'lider', premio: 4300, insignia: 9, musica: 'batalha-lider', flag: 'ginasio-09-vencido',
    itens: ['garrafada', 'garrafada'],
    equipe: [
      { e: 128, nv: 41, golpes: ['cachoeirada', 'deslizamento', 'atoleiro', 'couraca-de-pedra'] },
      { e: 164, nv: 41, golpes: ['soterrar', 'mordida-de-sauva', 'cuspe-acido', 'danca-do-vaga-lume'] },
      { e: 42, nv: 42, golpes: ['patada-ardente', 'lasca-afiada', 'cinzas-quentes', 'couraca-de-pedra'] },
      { e: 36, nv: 42, golpes: ['cachoeirada', 'deslizamento', 'canoa-virada', 'terra-batida'] },
      { e: 166, nv: 43, golpes: ['couraca-de-pedra', 'lasca-afiada', 'brilho-de-cristal', 'dentada'], item: 'pequi' },
    ],
    desafio: 'Trinta anos cavando me ensinaram: pressão é o que faz o cristal. Vamos ver o que a pressão faz com você!',
    derrota: 'Rá! Lapidado na batalha… você é joia rara.', depois: 'Com o Escalar, os paredões da chapada viram escada.' },
];
