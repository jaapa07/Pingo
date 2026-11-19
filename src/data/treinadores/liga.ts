import type { TreinadorDef, MembroEquipe } from '../../core/tipos';

/**
 * LIGA DOS GUARDIÕES (Platô da Liga, A-LG) — fim do mapa A, depois da 8ª insígnia (spec 4.5 e 5). Cinco lutas seguidas.
 * Níveis: Mestres com ás 41–44, Campeão com ás 46 (acima do líder 8, ás 40; abaixo do líder 9, 47–49).
 * Todos usam cura (spec 7A: do 8º ginásio em diante). Só estágios finais (nível ≥ 36) e sem os iniciais nem lendários.
 * Cada Mestre junta dois tipos e leva uma ou duas criaturas que cobrem a fraqueza comum do tema.
 * EQUILÍBRIO (docs/EQUILIBRIO.md): golpes escolhidos à mão e tamanho das equipes (4, 4, 4, 4 e 4) definidos pelo simulador
 * para a sequência inteira — cinco lutas sem cura grátis — ficar em 35–55% de vitória para o jogador de referência.
 * Com 5–6 criaturas por Mestre a sequência não passava de 0–2%, mesmo com cada luta isolada em 80–95%.
 */
const mestre = (id: string, classe: string, nome: string, sprite: string, equipe: MembroEquipe[], premio: number, desafio: string, derrota: string, extra: Partial<TreinadorDef> = {}): TreinadorDef =>
  ({ id, classe, nome, sprite, equipe, ia: 'lider', premio, desafio, derrota, itens: ['garrafada', 'garrafada'], musica: 'batalha-lider', ...extra });

export const TREINADORES_LIGA: TreinadorDef[] = [
  /*
   * 1 · Mestra Maré (Rio/Veneno) — pescadora de mangue. Fraquezas do tema: Trovão e Mata (no Rio), Terra e Mente (no Veneno).
   * Cobertura: Jararacuçu (Veneno/Terra) e o ás Jaú-Gigante (Rio/Terra) anulam Trovão; os venenosos castigam quem vem de Mata;
   * o Sapo-Cururuí nina o adversário com Cantiga de Ninar.
   */
  mestre('liga-1', 'Mestra', 'Maré', 'cl-pescador',
    [
      { e: 126, nv: 40, golpes: ['peconha-forte', 'bolhas-do-mangue', 'leite-de-cururu', 'luz-de-lamparina'] },
      { e: 89, nv: 40, golpes: ['curare', 'pisao-de-anta', 'presa-dupla', 'toca-e-foge'] },
      { e: 26, nv: 40, golpes: ['jato-de-igarape', 'cantiga-de-ninar', 'agua-de-cacimba', 'leite-de-cururu'] },
      { e: 40, nv: 41, golpes: ['vocoroca', 'rabanada', 'atoleiro', 'agua-de-cacimba'] },
    ], 4100,
    'Sou a Maré, primeira Mestra. No mangue a água sobe devagar e quando você vê já está no pescoço. Assim é a minha equipe: veneno primeiro, enchente depois!',
    'A maré virou… e virou para o seu lado. Passe, desafiante: a forja do Brasa-Viva já está acesa.'),
  /*
   * 2 · Ferreiro Brasa-Viva (Brasa/Ferro) — forjador de sinos. Fraquezas: Rio, Terra, Pedra (na Brasa); Brasa, Ginga, Terra (no Ferro).
   * Cobertura: Tucanuçu (Vento/Brasa) voa por cima da Terra e bica quem vem de Ginga; Siri-Couraça (Rio/Ferro) apaga Brasa e Pedra alheias.
   */
  mestre('liga-2', 'Ferreiro', 'Brasa-Viva', 'cl-ferreiro',
    [
      { e: 42, nv: 41, golpes: ['patada-ardente', 'pedrada', 'cinzas-quentes', 'couraca-de-pedra'] },
      { e: 50, nv: 41, golpes: ['pe-de-vento', 'brasa-viva', 'bico-furador', 'pouso-no-galho'] },
      { e: 130, nv: 41, golpes: ['canoa-virada', 'unha-de-aco', 'casulo', 'bote-ligeiro'] },
      { e: 146, nv: 42, golpes: ['curare', 'unha-de-aco', 'tatu-bola', 'leite-de-cururu'] },
    ], 4200,
    'Brasa-Viva, segundo Mestre! Sino bom se faz batendo: ferro na brasa, martelo no ferro. Vamos ver de que liga é feita a sua equipe!',
    'Rachou o meu sino… e que som bonito ele fez. Vá, a neblina do Pajé está à sua espera.'),
  /*
   * 3 · Pajé Neblina (Mente/Assombro) — contador de lendas. Fraqueza comum: Assombro (bate em Mente e em Assombro).
   * Cobertura: Jaguatiricão (Comum/Assombro) é imune a Assombro; Polvão (Rio/Mente) segura Brasa; o ás Noitão fecha com
   * sono (Olho de Coruja) e susto.
   */
  mestre('liga-3', 'Pajé', 'Neblina', 'npc-idoso',
    [
      { e: 44, nv: 42, golpes: ['onda-mental', 'pe-de-vento', 'cisma', 'pouso-no-galho'] },
      { e: 122, nv: 42, golpes: ['dor-de-cabeca', 'jato-de-igarape', 'cisma'] },
      { e: 70, nv: 42, golpes: ['sombra-rasteira', 'dentada', 'toca-e-foge'] },
      { e: 172, nv: 43, golpes: ['assombracao', 'pressentimento', 'olho-de-coruja', 'sombra-rasteira'] },
    ], 4300,
    'Sente, desafiante. Eu sou o Neblina, e toda luta minha começa com uma história: era uma vez uma equipe que entrou nesta sala… e não lembrava como saiu.',
    'Essa história eu não conhecia: a do desafiante que atravessou a neblina. Vou contar aos meus netos. A Pampa é a próxima porteira.'),
  /*
   * 4 · Domadora Pampa (Comum/Ginga) — treinadora de bichos de rodeio. Fraquezas: Ginga (no Comum); Vento, Mente e Encanto (na Ginga).
   * Cobertura: Emaçu (Terra/Ginga) e Capivarona (Comum/Rio) seguram Brasa e Pedra; contra Assombro (imune a Comum e a
   * Ginga) ela conta com a água da Capivarona e o Bico Furador do Seriemão.
   */
  mestre('liga-4', 'Domadora', 'Pampa', 'cl-vaqueiro',
    [
      { e: 104, nv: 43, golpes: ['meia-lua', 'bico-furador', 'patada', 'toca-e-foge'] },
      { e: 102, nv: 43, golpes: ['casco-pesado', 'queixada', 'pisoteio', 'esquiva'] },
      { e: 58, nv: 43, golpes: ['jato-de-igarape', 'cabecada', 'cafune'] },
      { e: 72, nv: 44, golpes: ['queixada', 'dentada', 'bote-ligeiro'] },
    ], 4400,
    'Eita, chegou longe! Sou a Pampa, última porteira antes do Campeão. Bicho meu não é domado no grito: é no compasso. Segura o tranco, que o rodeio vai começar!',
    'Me derrubou da sela, e com classe! Atrás daquela porta está o Cacique Aracê. Tire o chapéu ao entrar.', { itens: ['garrafada', 'elixir-andiroba'] }),
  /*
   * 5 · Campeão Cacique Aracê — equipe mista com uma criatura de tipo Lenda não lendária (Pirarucão, Rio/Lenda) como ás.
   * Cada membro cobre a fraqueza de outro: Gaviãozão (Comum/Vento) abre o jogo com velocidade; Poraquê (Rio/Trovão)
   * derruba Vento e Rio e paralisa; Leão-Dourado (Brasa/Ginga) queima Mata, Geada e Inseto que ameaçam o ás.
   * É a única IA de nível "conselho" do mapa A: troca na hora certa e guarda o Pirarucão para o fim.
   */
  { id: 'liga-5', classe: 'Campeão', nome: 'Cacique Aracê', sprite: 'npc-homem-3', ia: 'conselho', premio: 9200, musica: 'batalha-conselho',
    equipe: [
      { e: 12, nv: 42, golpes: ['bico-furador', 'rasante', 'chuva-de-penas'] },
      { e: 116, nv: 43, golpes: ['zunido-de-alta-tensao', 'jato-de-igarape', 'choque-de-poraque'] },
      { e: 68, nv: 44, golpes: ['patada-ardente', 'meia-lua'] },
      { e: 112, nv: 46, golpes: ['rabanada', 'cabecada', 'rabada'] },
    ],
    itens: ['garrafada', 'garrafada'],
    desafio: 'Aracê quer dizer "o nascer do dia". Há vinte anos eu vejo o sol nascer deste Platô, e há vinte anos ninguém me tira daqui.\fVocê trouxe oito insígnias e venceu quatro Mestres. Falta um amanhecer. Mostre-me a sua equipe inteira, {JOGADOR}!',
    derrota: 'O sol… nasceu do outro lado hoje. Vinte anos! E perdi sorrindo. Você e as suas criaturas lutam como quem conversa.' },

  /* Rival Tainá, encontro 5: no terreiro do Platô, logo depois da Liga. Sufixo = tipo do inicial DELA (o que vence o do jogador). */
  ...(['brasa', 'rio', 'mata'] as const).map((dela): TreinadorDef => ({
    id: `rival-5-${dela}`, classe: 'Rival', nome: 'Tainá', sprite: 'taina', ia: 'lider', premio: 4500, musica: 'batalha-rival', flag: 'rival-5', itens: ['garrafada'],
    equipe: [{ e: 12, nv: 42 }, { e: 29, nv: 42 }, { e: dela === 'brasa' ? 26 : dela === 'rio' ? 17 : 42, nv: 42 }, { e: 64, nv: 43 }, { e: 108, nv: 43 }, { e: dela === 'brasa' ? 6 : dela === 'rio' ? 9 : 3, nv: 45 }],
    desafio: 'CAMPEÃO?! Você?! Eu estava presa no terceiro Mestre e ouvi o sino do Platô tocar para VOCÊ!\fNão, não, não. Antes de qualquer festa, {JOGADOR}: eu e você, aqui, agora. Equipe completa!',
    derrota: 'Tá. Tá bom! Você é o Campeão e eu sou… a próxima. Anota: a PRÓXIMA.',
  })),
];
