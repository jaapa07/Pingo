import type { TreinadorDef } from '../../core/tipos';

/** Ginásio do Inseto (Bosque Alto): a equipe de pesquisa das copas e a líder Lia Teia. Líder nv 15–17 (tabela 4.5). */
export const TREINADORES_GINASIO_02: TreinadorDef[] = [
  { id: 'g02-1', classe: 'Garota', nome: 'Bia Joaninha', sprite: 'cl-crianca-f', ia: 'novato', premio: 480,
    equipe: [{ e: 15, nv: 11 }, { e: 16, nv: 12 }, { e: 153, nv: 12 }],
    desafio: 'Meus bichinhos cabem numa caixa de fósforo, mas mordem que é uma beleza!', derrota: 'Voltem para a caixinha, pessoal…', depois: 'A ponte de 3 nós sai daqui e sobe para o nordeste. Depois é voltar tudo: a de 4 fica do outro lado.' },
  { id: 'g02-2', classe: 'Bióloga', nome: 'Drª Cecília', sprite: 'cl-biologa', ia: 'treinador', premio: 560,
    equipe: [{ e: 149, nv: 13 }, { e: 28, nv: 13 }, { e: 151, nv: 13 }],
    desafio: 'Não pise nas minhas amostras! Aliás, já que subiu até aqui, vamos coletar uns dados de batalha.', derrota: 'Resultado inesperado. Vou anotar.', depois: 'A ponte de 7 nós parece atalho para a Lia, não parece? Pois é a última da fila.' },
  { id: 'g02-3', classe: 'Escoteira', nome: 'Juju Trilha', sprite: 'cl-escoteira', ia: 'treinador', premio: 560,
    equipe: [{ e: 18, nv: 13 }, { e: 157, nv: 14 }],
    desafio: 'Sempre alerta! Principalmente com formiga na bota.', derrota: 'Formigueiro desfeito.', depois: 'Ponte firme fica dourada. Use as douradas para ir e voltar sem medo.' },
  { id: 'g02-4', classe: 'Mateira', nome: 'Dona Nair', sprite: 'cl-mateira', ia: 'treinador', premio: 600,
    equipe: [{ e: 147, nv: 14 }, { e: 143, nv: 14 }, { e: 155, nv: 14 }],
    desafio: 'Conheço cada galho desta copa. E cada ferrão também!', derrota: 'Ai! Dessa vez a ferroada foi em mim.', depois: 'A de 6 nós leva até a Lia. Ela tece armadilha em batalha do mesmo jeito que tece ponte.' },
  /*
   * LÍDER — Lia Teia (Inseto). Fraquezas do Inseto: Brasa, Vento e Pedra.
   * Equipe e golpes definidos pelo simulador de equilíbrio (docs/EQUILIBRIO.md). O Cupinzim (Inseto/Pedra) abre e
   * apaga Brasa e Vento com Pedrada; o Vagalumim (Inseto/Trovão) derruba as aves com Choquinho, que ainda paralisa;
   * o ás é a Caranguejeirinha (Inseto/Veneno) de nível 17: prende com Formigueiro, baixa a Defesa com Cara Feia
   * e tira a velocidade com Teia Pegajosa.
   * QA jogado (4ª mão, docs/QA-TRECHO-1.md): o Mata honesto chega aqui com o Tamanduá-Copa nv 19–20 e reserva fraca
   * (nv 3–14) e precisou de 3 treinos extras (nv 23) e 4 tentativas; motor puro dava Mata 20–23% contra 96–100% de Brasa
   * e Rio (Inseto e Veneno valem o dobro no Mata). O Cupinzim trocou a Mordida de Saúva por Cara Feia (fica a Pedrada,
   * o papel dele) e o ás perdeu o Espinho Peçonhento: Mata nv 20–21 sobe para 32–36%; Brasa e Rio seguem ~97%.
   * Cura: 1 Garrafada definida, que o motor só libera a partir do 8º ginásio no Aventureiro.
   */
  { id: 'lider-02', classe: 'Líder', nome: 'Lia Teia', sprite: 'lider-02', ia: 'lider', premio: 1700, insignia: 2, musica: 'batalha-lider', flag: 'ginasio-02-vencido',
    itens: ['garrafada'],
    equipe: [
      { e: 163, nv: 15, golpes: ['pedrada', 'casulo', 'cara-feia'] },
      { e: 28, nv: 16, golpes: ['choquinho', 'ferroada'] },
      { e: 147, nv: 17, golpes: ['arranhao', 'teia-pegajosa', 'cara-feia', 'formigueiro'] },
    ],
    desafio: 'Passei três anos morando nesta copa para entender uma única aranha. Vamos ver quanto tempo você leva para entender a minha equipe!',
    derrota: 'Você desfez a minha teia fio por fio. Que beleza de se ver!', depois: 'Toda teia começa com um fio só. Continue tecendo a sua.' },
];
