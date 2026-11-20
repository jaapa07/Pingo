import type { TreinadorDef } from '../../core/tipos';

/**
 * Casa de Provas da Aldeia Tupã (ginásio nº 16): os guardiões das provas e o Pajé Trovão-Velho. Ás nv 63 (tabela 4.5:
 * 61–63); a turma fica entre 57 e 61 (ás − 2 a − 6). Só formas finais (as linhas de Lenda evoluem entre 34 e 45).
 * O Pajé usa a IA 'conselho', a mais fina do jogo antes do Conselho dos Guardiões, e remédios no Aventureiro (spec 7A).
 */
export const TREINADORES_GINASIO_16: TreinadorDef[] = [
  { id: 'g16-1', classe: 'Guardiã da Prova', nome: 'Jaciara', sprite: 'cl-mateira', ia: 'treinador', premio: 2320,
    equipe: [{ e: 156, nv: 58 }, { e: 68, nv: 57 }],
    desafio: 'Seja bem-vindo à casa de provas. Antes de caminhar com os quatro elementos, caminhe com a minha equipe.', derrota: 'Você tem passo firme.', depois: 'Na prova do Fogo, as brasas acendem em ondas. Olhe a brasa vermelha: é ela que queima no seu próximo passo.' },
  { id: 'g16-2', classe: 'Pescador', nome: 'Seu Arapuã', sprite: 'cl-pescador', ia: 'treinador', premio: 2360,
    equipe: [{ e: 112, nv: 58 }, { e: 120, nv: 58 }],
    desafio: 'O rio ensina paciência. Vamos ver se você aprendeu.', derrota: 'O rio levou a minha vitória.', depois: 'Na prova da Água, o seu reflexo anda ao contrário: você vai para o leste, ele vai para o oeste. A água que segura um não segura o outro.' },
  { id: 'g16-3', classe: 'Guardiã da Prova', nome: 'Iracy', sprite: 'cl-escoteira', ia: 'treinador', premio: 2400,
    equipe: [{ e: 160, nv: 59 }, { e: 110, nv: 58 }],
    desafio: 'A terra guarda tudo o que a gente faz nela. Mostre o que você faz numa batalha.', derrota: 'A terra também guarda derrota.', depois: 'Na prova da Terra, pedra empurrada para o lugar errado não volta. Pense antes de empurrar; se errar, saia da ala e recomece.' },
  { id: 'g16-4', classe: 'Contador de Histórias', nome: 'Seu Ubiratã', sprite: 'cl-repentista', ia: 'treinador', premio: 2440,
    equipe: [{ e: 85, nv: 59 }, { e: 52, nv: 59 }],
    desafio: 'Os mais velhos contam que o trovão é a voz de quem cuida do céu. Hoje quem ronca é a minha equipe!', derrota: 'Essa vai virar história para contar na roda.', depois: 'Na prova do Vento, quem manda é a direção do vento, não a sua. Cada pena vira o vento um quarto de volta, como o ponteiro do relógio.' },
  { id: 'g16-5', classe: 'Guardiã da Prova', nome: 'Moema', sprite: 'cl-mateira', ia: 'treinador', premio: 2480,
    equipe: [{ e: 120, nv: 60 }, { e: 160, nv: 60 }, { e: 156, nv: 59 }],
    desafio: 'Os quatro totens acesos! Então você é quem o Pajé esperava. Mas a última guardiã sou eu.', derrota: 'Pode passar. O Pajé está esperando.', depois: 'O Pajé traz uma criatura de cada elemento e as águas antigas do Pirarucão. Leve remédio e respeito.' },
  /*
   * LÍDER — Pajé Trovão-Velho (Lenda). Fraquezas da Lenda: Geada, Lenda e Encanto.
   * Estratégia (IA 'conselho'): uma criatura para cada prova. A Lavadeira-Dragão (Inseto/Lenda, o vento) abre com
   * Pulso das Eras e queima Geada com Labareda. O Hipocampo (Rio/Lenda, a água) acumula Chamado Antigo e solta Estrela
   * Cadente; Cortina de Brilho segura golpes especiais. O Leão-Dourado (Brasa/Ginga, o fogo) é a resposta à Geada:
   * Fogo de Coivara e Rabo-de-Arraia. O Minhocão (Terra/Lenda, a terra) bate com Garra Ancestral e Tremor de Terra e
   * castiga Encanto com Borra de Timbó. A Araracanga (Vento/Trovão) é o trovão do nome do Pajé: Trovoada e Ventania.
   * O ás é o Pirarucão (Rio/Lenda) de nível 63: Garra Ancestral, Cachoeirada, Tremor de Terra e Escama Sagrada;
   * segura um Caju.
   * Cura: Elixir de Andiroba e Garrafada (spec 7A).
   */
  { id: 'lider-16', classe: 'Pajé', nome: 'Trovão-Velho', sprite: 'lider-16', ia: 'conselho', premio: 6300, insignia: 16, musica: 'batalha-lider', flag: 'ginasio-16-vencido',
    itens: ['elixir-andiroba', 'garrafada'],
    equipe: [
      { e: 156, nv: 60, golpes: ['pulso-das-eras', 'labareda', 'voo-de-mamangava', 'sopro-ancestral'] },
      { e: 120, nv: 61, golpes: ['chamado-antigo', 'estrela-cadente', 'enxurrada', 'cortina-de-brilho'] },
      { e: 68, nv: 60, golpes: ['fogo-de-coivara', 'rabo-de-arraia', 'sol-a-pino', 'labareda'] },
      { e: 160, nv: 61, golpes: ['garra-ancestral', 'tremor-de-terra', 'borra-de-timbo', 'vocoroca'] },
      { e: 52, nv: 61, golpes: ['trovoada', 'ventania', 'rasante', 'relampago'] },
      { e: 112, nv: 63, golpes: ['garra-ancestral', 'cachoeirada', 'tremor-de-terra', 'escama-sagrada'], item: 'caju' },
    ],
    desafio: 'Você acendeu os quatro totens. O fogo, a terra, o vento e a água conversaram com você. Agora é a minha vez de ouvir o que a sua equipe tem a dizer.',
    derrota: 'O trovão se cala quando ouve uma voz verdadeira. Você venceu, caminhante.', depois: 'Quem cuida da terra é cuidado por ela. Não esqueça.' },
];
