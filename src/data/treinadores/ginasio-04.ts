import type { TreinadorDef } from '../../core/tipos';

/**
 * Ginásio da Mata (Vila Buriti): as aprendizes da estufa e a líder Dona Buriti. Líder nv 24–26 (tabela 4.5).
 * Nesta altura só existem duas linhas do tipo Mata no Diário (Tamanduí e Jabutim); as equipes completam o
 * jardim com insetos polinizadores e bichos de canteiro que usam golpes de Mata.
 */
export const TREINADORES_GINASIO_04: TreinadorDef[] = [
  { id: 'g04-1', classe: 'Mateira', nome: 'Jurema', sprite: 'cl-mateira', ia: 'treinador', premio: 800,
    equipe: [{ e: 1, nv: 20 }, { e: 16, nv: 20 }, { e: 81, nv: 20 }],
    desafio: 'Cuidado onde pisa, que aqui tudo brota! Inclusive batalha.', derrota: 'Podaram a minha equipe…', depois: 'Viu o cipó correndo pela fila de cima? Ele fecha a portinhola do canto. Se fechar, é só borrifar o vaso.' },
  { id: 'g04-2', classe: 'Bióloga', nome: 'Drª Flora', sprite: 'cl-biologa', ia: 'treinador', premio: 880,
    equipe: [{ e: 149, nv: 21 }, { e: 81, nv: 22 }, { e: 17, nv: 22 }],
    desafio: 'Estou medindo quanto o cipó cresce por passo. Fique parado… ou melhor, batalhe parado!', derrota: 'Dados perdidos, que pena.', depois: 'Batalha não conta passo. O cipó do norte só acorda no 10º passo depois do vaso e fecha a subida no 16º.' },
  { id: 'g04-3', classe: 'Garota', nome: 'Margarida', sprite: 'cl-crianca-f', ia: 'treinador', premio: 840,
    equipe: [{ e: 27, nv: 21 }, { e: 1, nv: 21 }],
    desafio: 'Achou que por aqui tinha saída? Tem é eu!', derrota: 'Murchei.', depois: 'Este lado é beco. A saída de verdade fica no canto de cima, depois da fila do meio.' },
  { id: 'g04-4', classe: 'Escoteira', nome: 'Violeta', sprite: 'cl-escoteira', ia: 'treinador', premio: 880,
    equipe: [{ e: 153, nv: 22 }, { e: 2, nv: 22 }],
    desafio: 'Montei acampamento no canto mais sossegado da estufa. Até você aparecer!', derrota: 'Desmonta a barraca, pessoal.', depois: 'O vaso do meio tem dois lados. Só o lado de cima serve para alcançar a saída a tempo.' },
  { id: 'g04-5', classe: 'Mateira', nome: 'Dona Arruda', sprite: 'cl-mateira', ia: 'treinador', premio: 960,
    equipe: [{ e: 81, nv: 23 }, { e: 17, nv: 23 }, { e: 2, nv: 23 }],
    desafio: 'Quarenta anos de mato e nunca vi desafiante passar pelos cipós tão ligeiro. Deixa eu ver de perto!', derrota: 'Ligeiro mesmo.', depois: 'A Dona Buriti cura a equipe com seiva no meio da luta. Não deixe a batalha se arrastar.' },
  /*
   * LÍDER — Dona Buriti (Mata). Fraquezas da Mata: Brasa, Geada, Vento, Inseto e Veneno.
   * Estratégia: a Bruxaluz abre pondo o adversário para dormir com Pólen Dorminhoco e suga vida com Sorver Seiva;
   * o Jabutim (Mata/Pedra) é a resposta a Brasa, Vento, Inseto e Geada com Pedrada; o Pererecão, a "perereca da
   * estufa", apaga os tipos Brasa com Jato de Igarapé e adormece com Cantiga de Ninar. O ás é o Tamanduá-Copa de
   * nível 26: prende com Laço de Cipó, bate com Folhas ao Vento e Patada e se recupera com Sorver Seiva.
   * Cura: 2 Garrafadas (Jabutim e Tamanduá-Copa, que segura uma Pitanga contra queimadura).
   */
  { id: 'lider-04', classe: 'Líder', nome: 'Dona Buriti', sprite: 'lider-04', ia: 'lider', premio: 2600, insignia: 4, musica: 'batalha-lider', flag: 'ginasio-04-vencido',
    itens: ['garrafada', 'garrafada'],
    equipe: [
      { e: 17, nv: 24, golpes: ['polen-dorminhoco', 'sorver-seiva', 'poeira-de-estrela', 'lufada'] },
      { e: 81, nv: 24, golpes: ['pedrada', 'chuva-de-sementes', 'sorver-seiva', 'fincar-pe'] },
      { e: 25, nv: 25, golpes: ['jato-de-igarape', 'redemoinho', 'cantiga-de-ninar', 'dar-o-troco'] },
      { e: 2, nv: 26, golpes: ['laco-de-cipo', 'folhas-ao-vento', 'patada', 'sorver-seiva'], item: 'pitanga' },
    ],
    desafio: 'Menino, menina… senta aí que eu vou contar: toda planta tem um veneno e um remédio. Vamos ver qual dos dois você trouxe!',
    derrota: 'Arre! Você é erva boa. Dessas que curam.', depois: 'Raiz forte não se vê. Cuide da sua.' },
];
