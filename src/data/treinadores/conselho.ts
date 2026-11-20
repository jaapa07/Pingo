import type { TreinadorDef, MembroEquipe } from '../../core/tipos';

/**
 * A SEQUÊNCIA FINAL do Pico Pindorama (spec 4.5, 5 e 7A; docs/HISTORIA.md): Coronel Garrote do Cartel Ferrugem, a rival
 * Tainá no encontro 8 e o CONSELHO DOS GUARDIÕES — cinco lutas seguidas, sem sair do Salão e sem cura grátis.
 * Curva (spec 4.5): líder 16 com ás 63 < Garrote (62–64) < rival 8 (63–65) < Conselho 64–70, com o Guardião-Mor no topo e
 * o lendário dele no nível 70. Todos usam remédios (spec 7A: do 8º ginásio em diante), IA `conselho` no Salão.
 * Tamanho das equipes medido no simulador (tools/equilibrio-referencia.ts, piloto esperto, 6 Elixires, 4 Chás de Guaraná,
 * 6 Garrafadas, cuidados entre as lutas): 3/3/3/4/4 criaturas, escoltas abaixo do ás. Equipe do Sertão no nv 63–65: 44–74%
 * de vitória na sequência inteira; equipe só com capturas do mapa A: 4–24%. Com 4–5 criaturas por Guardião dava 0%.
 * O jogador ganha 2 Elixires e 2 Chás de Guaraná na oferenda do Portão. Só estágios finais (nível ≥ 60); nenhum inicial; o único lendário é o do Guardião-Mor.
 */
const guardiao = (id: string, classe: string, nome: string, sprite: string, equipe: MembroEquipe[], premio: number, desafio: string, derrota: string, itens: string[]): TreinadorDef =>
  ({ id, classe, nome, sprite, equipe, ia: 'conselho', premio, desafio, derrota, itens, musica: 'batalha-conselho', contato: false });

export const TREINADORES_CONSELHO: TreinadorDef[] = [
  /*
   * Coronel Garrote (chefe do Cartel Ferrugem) — veneno e couraça: Escorpião-Rei e Jararacuçu envenenam, Tatucanastra
   * aguenta, Marimbondão cobre Mata, e o ás Sucurião (Rio/Terra) prende e esmaga. Fraquezas: Mente e Terra (venenosos),
   * Mata (Sucurião, Tatucanastra), Brasa (Escorpião-Rei, Tatucanastra).
   */
  {
    id: 'garrote', classe: 'Coronel do Cartel', nome: 'Garrote', sprite: 'coronel-garrote', ia: 'lider', premio: 12800, musica: 'batalha-cartel', contato: false,
    flag: 'garrote-vencido', itens: ['elixir-andiroba', 'garrafada'],
    equipe: [{ e: 152, nv: 72 }, { e: 146, nv: 72 }, { e: 34, nv: 73 }, { e: 89, nv: 73 }, { e: 87, nv: 74 }],
    desafio: 'Dezesseis insígnias… Então é você que fecha as minhas usinas, solta os meus ninhos e explode os meus laboratórios.\fSabe o que tem dentro desse Salão? Cinco velhos e a maior coleção de criaturas raras de Pindorama. Eu vim buscar. E você veio me atrapalhar pela última vez!',
    derrota: 'Impossível… Uma criança e um punhado de bichos de mato.\fO Cartel Ferrugem… acabou aqui. Mas lembre: enquanto houver gente querendo gaiola, vai haver gente querendo vender.',
  },

  /* Rival Tainá, encontro 8 (antes do Conselho). Sufixo = tipo do inicial DELA. Ás 65, logo acima do Garrote. */
  ...(['brasa', 'rio', 'mata'] as const).map((dela): TreinadorDef => ({
    id: `rival-8-${dela}`, classe: 'Rival', nome: 'Tainá', sprite: 'taina', ia: 'lider', premio: 7800, musica: 'batalha-rival', flag: 'rival-8', itens: ['elixir-andiroba', 'garrafada'], contato: false,
    equipe: [{ e: 12, nv: 73 }, { e: 29, nv: 73 }, { e: dela === 'brasa' ? 26 : dela === 'rio' ? 17 : 42, nv: 64 }, { e: 64, nv: 74 }, { e: 108, nv: 74 }, { e: dela === 'brasa' ? 6 : dela === 'rio' ? 9 : 3, nv: 65 }],
    desafio: '{JOGADOR}! Eu vi o Garrote descendo a trilha algemado pelos Guardiões. Você fez isso, né? Claro que fez.\fAntes de você entrar aí, uma última vez: eu e você, equipe completa, como na primeira manhã no laboratório da Profª Ipê. Sem desculpa de cansaço!',
    derrota: 'Pronto. Agora eu sei: você não é o meu rival. Você é o meu parâmetro. Entra lá e mostra para eles quem a Costa e o Sertão criaram.',
  })),

  /*
   * 1 · Guardiã do Mar Iara Costa (Rio/Encanto). Fraquezas: Trovão e Mata (Rio); Veneno e Ferro (Encanto).
   * Cobertura: Jubartão (Rio/Geada) castiga Mata e Vento; Estrelaça (Rio/Mente) responde ao Veneno; ás Cervo-do-Pantanal.
   */
  guardiao('conselho-1', 'Guardiã do Mar', 'Iara Costa', 'guardia-iara',
    [{ e: 124, nv: 74 }, { e: 132, nv: 74 }, { e: 100, nv: 74 }], 13000,
    'Eu sou Iara Costa, Guardiã do Mar. Guardo os rios que descem da serra e o mar que os recebe.\fA água não tem pressa, {JOGADOR}: ela contorna, ela espera e, quando chega a enchente, leva tudo. Vamos ver se você sabe nadar.',
    'A maré virou, e virou bonita. Siga: o Cauã já ouviu os seus passos na mata.', ['garrafada']),
  /*
   * 2 · Guardião da Mata Cauã (Mata/Inseto). Fraquezas: Brasa, Vento e Inseto/Veneno.
   * Cobertura: Herculão (Inseto/Ferro) e Jabutipiranga (Mata/Pedra) aguentam Brasa; Antão (Terra/Mata) bate em Brasa;
   * ás Lavadeira-Dragão (Inseto/Lenda).
   */
  guardiao('conselho-2', 'Guardião da Mata', 'Cauã', 'guardiao-caua',
    [{ e: 98, nv: 74 }, { e: 144, nv: 74 }, { e: 156, nv: 75 }], 13200,
    'Cauã, Guardião da Mata. Cada árvore desta serra me conhece pelo nome.\fNa mata ninguém luta sozinho: a formiga, a anta e o jabuti trabalham juntos. Mostre que a sua equipe também é uma floresta!',
    'A mata abriu caminho para você. Isso ela não faz para qualquer um. A Jandaia espera no céu.', ['garrafada']),
  /*
   * 3 · Guardiã do Céu Jandaia (Vento/Trovão). Fraquezas: Pedra, Geada e Terra (no Poraquê).
   * Cobertura: Poraquê (Rio/Trovão) segura Pedra; Bugio-Trovão (Ginga/Trovão) bate em Pedra e Geada; ás Araracanga.
   */
  guardiao('conselho-3', 'Guardiã do Céu', 'Jandaia', 'guardia-jandaia',
    [{ e: 110, nv: 74 }, { e: 116, nv: 75 }, { e: 52, nv: 76 }], 13400,
    'Jandaia, Guardiã do Céu! Daqui de cima eu vejo as nuvens nascerem.\fDuas vitórias e você ainda está de pé? Então segure o chapéu, porque aqui venta, troveja e cai raio!',
    'Que tempestade foi essa? Foi a sua. Passe: o Moacir é paciente como pedra, mas não gosta de esperar.', ['garrafada', 'garrafada']),
  /*
   * 4 · Guardião da Terra Moacir (Terra/Pedra/Ferro). Fraquezas: Rio, Mata e Ginga; Brasa no Ferro.
   * Cobertura: Tartaruga-Gigante (Rio/Pedra) apaga Brasa; Prego-Mestre (Ginga/Ferro) bate em Pedra e Geada; Cupinzeiro-Vivo
   * castiga Vento; ás Minhocão (Terra/Lenda).
   */
  guardiao('conselho-4', 'Guardião da Terra', 'Moacir', 'guardiao-moacir',
    [{ e: 162, nv: 75 }, { e: 80, nv: 75 }, { e: 66, nv: 76 }, { e: 160, nv: 77 }], 13600,
    'Moacir. Guardião da Terra. Sou o chão onde você pisa desde que saiu de casa.\fUm… dois… três… eu conto devagar porque a pedra não tem pressa. Vamos ver quanto tempo você aguenta debaixo da montanha.',
    'A montanha tremeu. Faz tempo que isso não acontecia. Vá, o Guardião-Mor sabe o seu nome desde que você nasceu.', ['elixir-andiroba', 'garrafada']),
  /*
   * 5 · Guardião-Mor Arandu — equipe mista e um lendário, o Gavião-Tupã (Lenda/Trovão), guardado para o fim.
   * Pintada (Comum/Ginga) abre rápido; Urutau-Fantasma (Assombro/Mente) confunde; Leão-Dourado (Brasa/Ginga) queima Mata,
   * Geada, Inseto e Ferro; Pirarucão (Rio/Lenda) aguenta Brasa e Pedra; o Gavião-Tupã fecha com trovão.
   */
  guardiao('conselho-5', 'Guardião-Mor', 'Arandu', 'guardiao-arandu',
    [
      { e: 72, nv: 77 }, { e: 68, nv: 78 }, { e: 112, nv: 78 },
      { e: 178, nv: 80, golpes: ['trovoada', 'relampago', 'rasante', 'pulso-das-eras'] },
    ], 18000,
    'Arandu quer dizer "o que guarda a memória". Eu guardo a de Pindorama inteira: o mar da Iara, a mata do Cauã, o céu da Jandaia, a terra do Moacir.\fVocê veio da Vila Jacarandá até o topo do mundo, {JOGADOR}. Agora mostre-me o que aprendeu no caminho — com tudo o que tem.',
    'Eis a memória nova de Pindorama. Você e as suas criaturas lutam como quem cuida. Era isso que o Conselho esperava.', ['elixir-andiroba', 'garrafada']),
];
export default TREINADORES_CONSELHO;
