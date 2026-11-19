import type { TreinadorDef } from '../../core/tipos';

/** Ginásio do Vento (Vila Caiçara): a turma do píer e o líder Mestre Gaivota. Líder nv 10–12 (tabela 4.5). */
export const TREINADORES_GINASIO_01: TreinadorDef[] = [
  { id: 'g01-1', classe: 'Garoto', nome: 'Tico Pipa', sprite: 'cl-crianca-m', ia: 'novato', premio: 280,
    equipe: [{ e: 10, nv: 7 }, { e: 45, nv: 7 }],
    desafio: 'Minha pipa voa mais alto que qualquer uma da vila! Quer ver?', derrota: 'Enroscou a linha…', depois: 'Quem entra na rajada antes do primeiro mastro para nele. É por ali que se chega à prancha da esquerda.' },
  { id: 'g01-2', classe: 'Pescador', nome: 'Seu Dito', sprite: 'cl-pescador', ia: 'novato', premio: 320,
    equipe: [{ e: 107, nv: 8 }, { e: 10, nv: 8 }],
    desafio: 'Peixe bom vem com vento sul. Treinador bom, eu pesco na hora!', derrota: 'Esse escapou do anzol.', depois: 'Depois do segundo mastro não tem corda nenhuma: quem entra ali vai parar no mar.' },
  { id: 'g01-3', classe: 'Observadora', nome: 'Marina', sprite: 'cl-observadora', ia: 'novato', premio: 360,
    equipe: [{ e: 43, nv: 8 }, { e: 49, nv: 9 }],
    desafio: 'Psiu! Estou contando gaivotas. Já que espantou todas, batalhe comigo!', derrota: 'Voaram todas… e a minha vitória também.', depois: 'A alavanca vira os cata-ventos. A prancha por onde você subiu passa a soprar de volta.' },
  { id: 'g01-4', classe: 'Surfista', nome: 'Kai', sprite: 'cl-surfista', ia: 'treinador', premio: 400,
    equipe: [{ e: 167, nv: 9 }, { e: 45, nv: 9 }, { e: 51, nv: 9 }],
    desafio: 'Vento terral, mar liso… só falta uma batalha para o dia ficar perfeito!', derrota: 'Tomei um caldo.', depois: 'A última corrente leva direto ao Mestre. Respira fundo e vai!' },
  /*
   * LÍDER — Mestre Gaivota (Vento). Fraquezas do Vento: Trovão, Geada e Pedra.
   * Estratégia: abre com o Quero-querinho jogando areia para baixar a precisão de quem vem de Pedra; a Garcinha
   * (Vento/Rio) responde a Pedra e Brasa com Esguicho; o Andorim (Vento/Pedra) segura Geada e Trovão com Estilingue.
   * O ás é a Ararinha de nível 12, que bate com Lufada (mesmo tipo) e assusta com Assobio Agudo antes do golpe forte.
   * Cura: 1 Chá de Erva-Cidreira definido (o motor só libera itens a partir do 8º ginásio no Aventureiro); a Ararinha segura um Caju.
   */
  { id: 'lider-01', classe: 'Líder', nome: 'Mestre Gaivota', sprite: 'lider-01', ia: 'lider', premio: 1200, insignia: 1, musica: 'batalha-lider', flag: 'ginasio-01-vencido',
    itens: ['cha-cidreira'],
    equipe: [
      { e: 45, nv: 10, golpes: ['bicada', 'jogar-areia', 'bote-ligeiro', 'berro'] },
      { e: 107, nv: 10, golpes: ['esguicho', 'lufada', 'bicada', 'faro-fino'] },
      { e: 167, nv: 11, golpes: ['estilingue', 'lufada', 'bicada', 'faro-fino'] },
      { e: 51, nv: 12, golpes: ['lufada', 'bicada', 'assobio-agudo', 'berro'], item: 'caju' },
    ],
    desafio: 'Sessenta anos soltando pipa neste píer. O vento me conta tudo… e ele disse que você vinha. Mostre o que sabe!',
    derrota: 'Eita! Você cortou a minha linha em pleno céu.', depois: 'Vento bom é o que empurra a gente para a frente.' },
];
