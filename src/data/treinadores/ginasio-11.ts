import type { TreinadorDef } from '../../core/tipos';

/**
 * Ginásio da Brasa (nº 11, Arraial Brasa): ferreiros e repentistas do arraial e a líder Ferreira Labareda.
 * Mapa B, depois da Liga: líder com ás 53 (tabela 4.5, faixa 51–53); a turma fica de 47 a 51 (ás − 2 a − 6).
 * Linhas de Brasa disponíveis nesses níveis, todas no estágio final: Calangão (30), Tucanuçu (30), Dourado-Rei (30),
 * Leão-Dourado (Pedra Solar) e Lobo-Fornalha (36).
 */
export const TREINADORES_GINASIO_11: TreinadorDef[] = [
  { id: 'g11-1', classe: 'Ferreiro', nome: 'Bigode de Fogo', sprite: 'cl-ferreiro', ia: 'treinador', premio: 1920,
    equipe: [{ e: 42, nv: 47 }, { e: 50, nv: 47 }, { e: 38, nv: 48 }],
    desafio: 'Martelo na bigorna, faísca no ar! Quem passa pela forja leva uma marretada!', derrota: 'Esfriou o meu ferro…', depois: 'O Zé do Fole toca e a fogueira certa pisca. É só repetir a música, nota por nota.' },
  { id: 'g11-2', classe: 'Repentista', nome: 'Chico Rima', sprite: 'cl-repentista', ia: 'treinador', premio: 1960,
    equipe: [{ e: 50, nv: 48 }, { e: 68, nv: 49 }],
    desafio: 'Vou fazer um repente pra quem chegou agora: minha brasa é quente e a sua vai embora!', derrota: 'Perdi a rima e a peleja.', depois: 'Anarriê é a quadrilha voltando. A música da Quitéria acende ao contrário: comece pela última nota.' },
  { id: 'g11-3', classe: 'Ferreira', nome: 'Severina Bigorna', sprite: 'cl-ferreiro', ia: 'treinador', premio: 1960,
    equipe: [{ e: 42, nv: 48 }, { e: 38, nv: 49 }, { e: 34, nv: 49 }],
    desafio: 'Aqui no arraial a gente forja sino, ferradura e campeão. Vamos ver de que metal você é!', derrota: 'Metal bom, o seu.', depois: 'Fogueira acesa fora da música não tem conserto: apaga tudo e começa de novo.' },
  { id: 'g11-4', classe: 'Repentista', nome: 'Zabé do Pandeiro', sprite: 'cl-repentista', ia: 'treinador', premio: 2000,
    equipe: [{ e: 68, nv: 49 }, { e: 50, nv: 49 }, { e: 42, nv: 50 }],
    desafio: 'No terceiro terreiro o fogo não pisca, mas o meu pandeiro sim!', derrota: 'Desafinou foi tudo.', depois: 'O Seu Lua só canta o nome. Leia a bandeirinha de cada fogueira antes de acender.' },
  { id: 'g11-5', classe: 'Ferreiro', nome: 'Mestre Brasão', sprite: 'cl-ferreiro', ia: 'treinador', premio: 2040,
    equipe: [{ e: 38, nv: 50 }, { e: 68, nv: 50 }, { e: 42, nv: 51 }],
    desafio: 'Fui eu que ensinei a Labareda a segurar o martelo. Antes dela, passa por mim!', derrota: 'A aluna passou o mestre, e você também.', depois: 'A Labareda cura a equipe com remédio da feira no meio da luta. Água, terra e pedra apagam o fogo dela.' },
  /*
   * LÍDER — Ferreira Labareda (Brasa). Quem bate forte na Brasa: Rio, Terra e Pedra.
   * Estratégia: o Tucanuçu (Vento/Brasa) abre com Queimada e Pé de Vento (anula Terra); o Dourado-Rei (Rio/Brasa)
   * responde Brasa e Pedra com Cachoeirada e morde com Mordida de Piranha; o Calangão (Brasa/Pedra) aguenta Brasa e
   * Vento e bate com Lasca Afiada; o Jabutipiranga (Mata/Pedra) é a cobertura contra Rio e Terra; o Leão-Dourado,
   * o mais rápido, usa Labareda e Meia-Lua. O ás Lobo-Fornalha (Brasa/Ginga) levanta a Fogueira de São João (ataque e
   * velocidade) e vem com Carreira em Chamas e Martelo; segura um Pequi contra paralisia.
   * Cura: Elixir de Andiroba e 2 Garrafadas (depois do 8º ginásio o líder usa remédios — spec 7A).
   */
  { id: 'lider-11', classe: 'Líder', nome: 'Ferreira Labareda', sprite: 'lider-10', ia: 'lider', premio: 5300, insignia: 11, musica: 'batalha-lider', flag: 'ginasio-11-vencido',
    itens: ['elixir-andiroba', 'garrafada', 'garrafada'],
    equipe: [
      { e: 50, nv: 50, golpes: ['queimada', 'pe-de-vento', 'bafo-quente', 'rasante'] },
      { e: 38, nv: 50, golpes: ['patada-ardente', 'cachoeirada', 'mordida-de-piranha', 'toca-e-foge'] },
      { e: 42, nv: 51, golpes: ['patada-ardente', 'lasca-afiada', 'pedregulho-rolante', 'couraca-de-pedra'] },
      { e: 82, nv: 51, golpes: ['espinho-de-mandacaru', 'deslizamento', 'soterrar', 'couraca-de-pedra'] },
      { e: 68, nv: 51, golpes: ['labareda', 'meia-lua', 'ginga', 'rasteira'] },
      { e: 6, nv: 53, golpes: ['carreira-em-chamas', 'martelo', 'fogueira-de-sao-joao', 'patada-ardente'], item: 'pequi' },
    ],
    desafio: 'Bem-vindo ao arraial! Aqui a gente dança quadrilha de dia e bate ferro de noite. E batalha… a qualquer hora!',
    derrota: 'Ufa! Você é ferro bem temperado: entrou na brasa e saiu mais forte.', depois: 'Fogo bom é o que esquenta sem queimar. Cuide da sua chama.' },
];
