import type { TreinadorDef } from '../../core/tipos';

/**
 * Ginásio da Pedra (nº 10, Chapada Rubra): garimpeiros da mina e o líder Garimpeiro Topázio.
 * Mapa B, depois da Liga: líder com ás 51 (tabela 4.5, faixa 49–51); a turma do ginásio fica de 45 a 49 (ás − 2 a − 6).
 * Todas as espécies aparecem no estágio que teriam no nível (Mocó evolui no 30, Aruá no 32, Cupinzim no 34…).
 */
export const TREINADORES_GINASIO_10: TreinadorDef[] = [
  { id: 'g10-1', classe: 'Garimpeiro', nome: 'Juca Bateia', sprite: 'cl-garimpeiro', ia: 'treinador', premio: 1840,
    equipe: [{ e: 166, nv: 45 }, { e: 128, nv: 45 }, { e: 162, nv: 46 }],
    desafio: 'Epa! Ninguém mexe no meu desvio sem antes peneirar comigo!', derrota: 'Só cascalho na minha bateia…', depois: 'A chave ao lado do trilho escolhe para que lado o vagonete vira lá no meio do abismo.' },
  { id: 'g10-2', classe: 'Montanhista', nome: 'Rosa Paredão', sprite: 'cl-montanhista', ia: 'treinador', premio: 1880,
    equipe: [{ e: 164, nv: 46 }, { e: 36, nv: 46 }, { e: 166, nv: 47 }],
    desafio: 'Subi essa chapada no braço. Você veio de vagonete? Que moleza!', derrota: 'Escorreguei feio.', depois: 'O vagonete daqui só sobe quando o desvio lá do leste aponta para o norte. Senão, bate no para-choque.' },
  { id: 'g10-3', classe: 'Garimpeiro', nome: 'Tião Pepita', sprite: 'cl-garimpeiro', ia: 'treinador', premio: 1920,
    equipe: [{ e: 42, nv: 47 }, { e: 128, nv: 47 }, { e: 34, nv: 48 }],
    desafio: 'Guardo esta galeria faz trinta anos. Pedra por pedra!', derrota: 'Desmoronei…', depois: 'A chave do canto vira o trilho de cima. Depois é voltar e mandar o primeiro vagonete para o oeste de novo.' },
  { id: 'g10-4', classe: 'Escoteira', nome: 'Lia Quartzo', sprite: 'cl-escoteira', ia: 'treinador', premio: 1960,
    equipe: [{ e: 166, nv: 48 }, { e: 36, nv: 48 }, { e: 42, nv: 48 }, { e: 82, nv: 49 }],
    desafio: 'Chegou até aqui? Então me mostra se brilha mesmo!', derrota: 'Você é pedra preciosa.', depois: 'O Topázio começa devagar e termina feito avalanche. E ele cura a equipe no meio da luta.' },
  /*
   * LÍDER — Garimpeiro Topázio (Pedra). Quem bate forte na Pedra: Rio, Mata, Ginga, Terra e Ferro.
   * Estratégia: abre com o Aruazão (Rio/Pedra), que aguenta Brasa e Terra e joga Atoleiro para tirar a velocidade de
   * quem vem bater primeiro. O Jabutipiranga (Mata/Pedra) é a
   * cobertura contra Rio e Terra, as duas ameaças mais comuns; o Calangão (Brasa/Pedra) queima Mata e Ferro; o
   * Cupinzeiro-Vivo segura pancada e responde Mata com Enxame. O ás Mocó-da-Rocha levanta a Couraça de Pedra, bate
   * com Lasca Afiada (crítico fácil) e Pedra Preciosa (especial, pega quem só investiu em Defesa).
   * Cura: Elixir de Andiroba e Garrafada (depois do 8º ginásio o líder usa remédios — spec 7A).
   */
  { id: 'lider-10', classe: 'Líder', nome: 'Garimpeiro Topázio', sprite: 'lider-09', ia: 'lider', premio: 5100, insignia: 10, musica: 'batalha-lider', flag: 'ginasio-10-vencido',
    itens: ['elixir-andiroba', 'garrafada'],
    equipe: [
      { e: 128, nv: 48, golpes: ['cachoeirada', 'deslizamento', 'atoleiro', 'couraca-de-pedra'] },
      { e: 164, nv: 49, golpes: ['pedregulho-rolante', 'enxame', 'soterrar', 'couraca-de-pedra'] },
      { e: 42, nv: 49, golpes: ['patada-ardente', 'lasca-afiada', 'cinzas-quentes', 'couraca-de-pedra'] },
      { e: 82, nv: 50, golpes: ['espinho-de-mandacaru', 'deslizamento', 'folhas-ao-vento', 'couraca-de-pedra'] },
      { e: 166, nv: 51, golpes: ['couraca-de-pedra', 'lasca-afiada', 'pedra-preciosa', 'cabeca-dura'], item: 'pequi' },
    ],
    desafio: 'Trinta anos cavando me ensinaram: pressão é o que faz o cristal. Vamos ver o que a pressão faz com você!',
    derrota: 'Rá! Lapidado na batalha… você é joia rara.', depois: 'Com o Escalar, os paredões da chapada viram escada.' },
];
