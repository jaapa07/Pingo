import type { TreinadorDef } from '../../core/tipos';

/**
 * Ginásio do Vento (Vila Caiçara): a turma do píer e o líder Mestre Gaivota.
 * Níveis medidos no jogo honesto (tools/testes/qa): quem chega aqui só passou pela Trilha do Ipê e tem o inicial no nv 8
 * e capturas de nv 2–5. A turma (nv 5–7, duas criaturas cada: com três, as equipes honestas dos três iniciais caíam no 2º ou 3º treinador)
 * leva o inicial ao nv 10–11; o ás do líder é nv 10 (faixa 7–10 da tabela 4.5), por decisão do autor.
 */
export const TREINADORES_GINASIO_01: TreinadorDef[] = [
  { id: 'g01-1', classe: 'Garoto', nome: 'Tico Pipa', sprite: 'cl-crianca-m', ia: 'novato', premio: 280,
    equipe: [{ e: 10, nv: 5 }, { e: 45, nv: 6 }],
    desafio: 'Minha pipa voa mais alto que qualquer uma da vila! Quer ver?', derrota: 'Enroscou a linha…', depois: 'Quem entra na rajada antes do primeiro mastro para nele. É por ali que se chega à prancha da esquerda.' },
  { id: 'g01-2', classe: 'Pescador', nome: 'Seu Dito', sprite: 'cl-pescador', ia: 'novato', premio: 320,
    equipe: [{ e: 107, nv: 6 }, { e: 10, nv: 6 }],
    desafio: 'Peixe bom vem com vento sul. Treinador bom, eu pesco na hora!', derrota: 'Esse escapou do anzol.', depois: 'Depois do segundo mastro não tem corda nenhuma: quem entra ali vai parar no mar.' },
  { id: 'g01-3', classe: 'Observadora', nome: 'Marina', sprite: 'cl-observadora', ia: 'novato', premio: 360,
    equipe: [{ e: 43, nv: 6 }, { e: 49, nv: 7 }],
    desafio: 'Psiu! Estou contando gaivotas. Já que espantou todas, batalhe comigo!', derrota: 'Voaram todas… e a minha vitória também.', depois: 'A alavanca vira os cata-ventos. A prancha por onde você subiu passa a soprar de volta.' },
  { id: 'g01-4', classe: 'Surfista', nome: 'Kai', sprite: 'cl-surfista', ia: 'treinador', premio: 400,
    equipe: [{ e: 167, nv: 7 }, { e: 51, nv: 7 }],
    desafio: 'Vento terral, mar liso… só falta uma batalha para o dia ficar perfeito!', derrota: 'Tomei um caldo.', depois: 'A última corrente leva direto ao Mestre. Respira fundo e vai!' },
  /*
   * LÍDER — Mestre Gaivota (Vento). Fraquezas do Vento: Trovão, Geada e Pedra.
   * No começo cada criatura a mais do líder pesa demais, então o primeiro ginásio tem só duas. A equipe foi escolhida
   * para os TRÊS iniciais sofrerem parecido (antes: Quero-querinho 10 + Ararinha 12 só de Bicada davam Mata 9%, Brasa 80%,
   * Rio 83% com a equipe de referência): a Garcinha (Vento/Rio) abre com Esguicho, que pesa no inicial de Brasa; o ás é
   * o Tucaninho, que bica (dói em Mata) e usa Sorver Seiva (dói em Rio). Chuva de Sementes ficou de fora: golpe de 2 a 5
   * acertos em nível baixo derrubava o Botinho nv 12 de uma vez só (cada acerto soma o mínimo de dano).
   * 3ª mão do QA: o ás desceu de nv 10 para 9; o autor o devolveu ao nv 10. 4ª mão: com o ás 10, a Garcinha (nv 7, piso da faixa)
   * trocou a Bicada por Faro Fino (sem golpe de Vento ela não esmaga o Tamanduí antes do ás; o Esguicho segue pesando
   * no Guaraxim). Motor puro contra as equipes honestas que chegam ao líder (inicial nv 10–11 + capturas nv 2–9),
   * piloto esperto / jogador que bebe chá abaixo da metade: antes Mata 10/27%, Brasa 45/84%, Rio 34/35%; agora Mata
   * 21/40%, Brasa 43/82%, Rio 48/47%. Mata segue abaixo (o Tucaninho resiste a tudo que o Tamanduí sabe), como no
   * gênero: um nível a mais no inicial vale ~25 pontos. Números em docs/QA-TRECHO-1.md.
   * Mata ganhou uma ferramenta só dele (decisão do autor, 20/11): o Seu Aroeira dá um Jabutim nv 6 (Mata/Pedra) a quem tem o
   * Tamanduí (src/data/eventos/a1.ts, evento 'aroeira'). Mata 21/39% → 35/54%; Brasa e Rio sem mudança (docs/AJUSTES-MATA.md).
   * Cura: 1 Chá de Erva-Cidreira definido, que o motor só libera a partir do 8º ginásio no Aventureiro.
   */
  { id: 'lider-01', classe: 'Líder', nome: 'Mestre Gaivota', sprite: 'lider-01', ia: 'lider', premio: 1200, insignia: 1, musica: 'batalha-lider', flag: 'ginasio-01-vencido',
    itens: ['cha-cidreira'],
    equipe: [
      { e: 107, nv: 7, golpes: ['esguicho', 'faro-fino'] },
      { e: 49, nv: 10, golpes: ['bicada', 'sorver-seiva', 'cara-feia'] },
    ],
    desafio: 'Sessenta anos soltando pipa neste píer. O vento me conta tudo… e ele disse que você vinha. Mostre o que sabe!',
    derrota: 'Eita! Você cortou a minha linha em pleno céu.', depois: 'Vento bom é o que empurra a gente para a frente.' },
];
