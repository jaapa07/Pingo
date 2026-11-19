import type { TreinadorDef } from '../../core/tipos';

/**
 * Ginásio do Trovão (nº 5, Ilha do Farol): os ajudantes da oficina e o líder Faroleiro Volta. Líder nv 28–30.
 * Todas as linhas de Trovão do Diário têm estágio final (soma ≥ 500), que só cabe em equipes de nível ≥ 36:
 * aqui as criaturas de Trovão aparecem ainda sem evoluir, e o ás é o Poraquim de nível 30.
 */
export const TREINADORES_GINASIO_05: TreinadorDef[] = [
  { id: 'g05-1', classe: 'Ferreiro', nome: 'Tonho Solda', sprite: 'cl-ferreiro', ia: 'treinador', premio: 1000,
    equipe: [{ e: 141, nv: 25 }, { e: 28, nv: 25 }],
    desafio: 'Não pise nos cabos! Quer dizer… pise em mim, não: batalhe comigo!', derrota: 'Queimou o fusível.', depois: 'A ponte daqui só fica estendida enquanto a chave 1 manda energia para ela. Virou a chave, ela recolhe.' },
  { id: 'g05-2', classe: 'Garoto', nome: 'Faísca', sprite: 'cl-crianca-m', ia: 'treinador', premio: 1040,
    equipe: [{ e: 28, nv: 26 }, { e: 115, nv: 26 }, { e: 141, nv: 26 }],
    desafio: 'O vô Volta disse que eu sou o relé mais rápido da ilha!', derrota: 'Desarmei…', depois: 'O relé está sem corrente agora, mas dá para deixar ele apontado para a ponte leste. Depois é voltar e virar a chave 1.' },
  { id: 'g05-3', classe: 'Pescador', nome: 'Seu Lume', sprite: 'cl-pescador', ia: 'treinador', premio: 1080,
    equipe: [{ e: 115, nv: 27 }, { e: 51, nv: 27 }],
    desafio: 'Pesco poraquê com vara de bambu seco. Sabe por quê? Você vai descobrir!', derrota: 'Levei o choque eu mesmo.', depois: 'Agora o relé tem corrente. Vire-o para a linha de cima e a ponte do salão norte estende.' },
  { id: 'g05-4', classe: 'Observadora', nome: 'Aurora', sprite: 'cl-observadora', ia: 'treinador', premio: 1120,
    equipe: [{ e: 141, nv: 27 }, { e: 115, nv: 28 }, { e: 28, nv: 28 }],
    desafio: 'Conto os relâmpagos do alto do farol. Hoje vou contar os seus tropeços!', derrota: 'Um, dois… perdi a conta.', depois: 'O piso de teste só dá choque enquanto a chave 3 manda corrente para ele. Vire a chave e a ponte do Volta estende.' },
  /*
   * LÍDER — Faroleiro Volta (Trovão). Fraqueza do Trovão: Terra (que é imune a Trovão).
   * Equipe refeita pela regra do spec 4.5 (cada criatura na forma que teria no nível): três do tipo e uma cobertura.
   * O Poraquim (Rio/Trovão, só evolui no 34) abre e derruba os tipos Terra com Bolhas do Mangue; a Ararinha (Vento,
   * só evolui no 34) é a cobertura: imune a Terra, castiga Mata e Inseto; o Vagalampo (Inseto/Trovão, evoluído no 27)
   * cega com Luz de Lamparina e bate com Corisco e Ferroada. O ás é o Grilão-Elétrico (Inseto/Trovão, evoluído no 26) de nível 30: Zunido de Alta
   * Tensão no mesmo tipo, Nuvem de Mosquitos contra Mata e Terra e areia nos olhos de quem tenta resistir.
   * Cura: 1 Garrafada definida, que o motor só libera a partir do 8º ginásio no Aventureiro.
   */
  { id: 'lider-05', classe: 'Líder', nome: 'Faroleiro Volta', sprite: 'lider-07', ia: 'lider', premio: 3000, insignia: 5, musica: 'batalha-lider', flag: 'ginasio-05-vencido',
    itens: ['garrafada'],
    equipe: [
      { e: 115, nv: 28, golpes: ['bolhas-do-mangue', 'faisca-dupla', 'choque-de-poraque'] },
      { e: 51, nv: 28, golpes: ['brisa-da-serra', 'rasante'] },
      { e: 29, nv: 28, golpes: ['ferroada', 'corisco', 'luz-de-lamparina'] },
      { e: 142, nv: 30, golpes: ['zunido-de-alta-tensao', 'nuvem-de-mosquitos', 'jogar-areia'] },
    ],
    desafio: 'Eureca! Um desafiante que entende de circuito! Eu sou o Volta: acendo o farol, conserto rádio e dou choque em treinador distraído. Liga a chave, que lá vai descarga!',
    derrota: 'Curto-circuito geral! Mas que beleza de apagão…', depois: 'Energia boa é a que chega aonde precisa. A sua chega.' },
];
