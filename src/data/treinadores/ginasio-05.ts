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
   * Estratégia: o Grilinho abre jogando areia para atrapalhar quem vem de Terra e bate com Zunido de Alta Tensão;
   * o Vagalumim cega com Luz de Lamparina e usa Nuvem de Mosquitos contra Terra/Mata; a Ararinha (Vento) é a
   * cobertura: imune a Terra, castiga Mata e Inseto com Brisa da Serra e se cura com Barro Curativo.
   * O ás é o Poraquim (Rio/Trovão) de nível 30: Bolhas do Mangue derruba os tipos Terra, Choque de Poraquê paralisa
   * e Zunido de Alta Tensão fecha a conta.
   * Cura: 1 Garrafada definida (no Aventureiro o motor só libera itens a partir do 8º ginásio); o ás segura um Caju.
   */
  { id: 'lider-05', classe: 'Líder', nome: 'Faroleiro Volta', sprite: 'lider-07', ia: 'lider', premio: 3000, insignia: 5, musica: 'batalha-lider', flag: 'ginasio-05-vencido',
    itens: ['garrafada'],
    equipe: [
      { e: 141, nv: 28, golpes: ['zunido-de-alta-tensao', 'faisca-dupla', 'jogar-areia', 'nuvem-de-mosquitos'] },
      { e: 28, nv: 28, golpes: ['zunido-de-alta-tensao', 'faisca-dupla', 'luz-de-lamparina', 'nuvem-de-mosquitos'] },
      { e: 51, nv: 29, golpes: ['brisa-da-serra', 'rasante', 'barro-curativo', 'assobio-agudo'] },
      { e: 115, nv: 30, golpes: ['zunido-de-alta-tensao', 'bolhas-do-mangue', 'choque-de-poraque', 'faisca-dupla'], item: 'caju' },
    ],
    desafio: 'Eureca! Um desafiante que entende de circuito! Eu sou o Volta: acendo o farol, conserto rádio e dou choque em treinador distraído. Liga a chave, que lá vai descarga!',
    derrota: 'Curto-circuito geral! Mas que beleza de apagão…', depois: 'Energia boa é a que chega aonde precisa. A sua chega.' },
];
