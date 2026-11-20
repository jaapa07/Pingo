import type { TreinadorDef } from '../../core/tipos';

/**
 * Ginásio do Veneno (nº 13, Brejo Roxo): os assistentes do serpentário e o líder Doutor Peçonha. Ás nv 57 (tabela 4.5:
 * 55–57); a turma fica entre 51 e 55 (ás − 2 a − 6). Todas as linhas de Veneno já passaram da evolução nesses níveis,
 * então só aparecem formas finais. Do 8º ginásio em diante o líder usa remédios no Aventureiro (spec 7A).
 */
export const TREINADORES_GINASIO_13: TreinadorDef[] = [
  { id: 'g13-1', classe: 'Bióloga', nome: 'Drª Urtiga', sprite: 'cl-biologa', ia: 'treinador', premio: 2040,
    equipe: [{ e: 126, nv: 52 }, { e: 21, nv: 51 }],
    desafio: 'Máscara no rosto e luva na mão! Quem entra no serpentário tem de passar pelo controle de qualidade.', derrota: 'Reprovou o meu controle de qualidade.', depois: 'No tanque da entrada, a planta da esquerda lá em cima parece fora do caminho. Não é.' },
  { id: 'g13-2', classe: 'Raizeira', nome: 'Dona Babosa', sprite: 'cl-mateira', ia: 'treinador', premio: 2080,
    equipe: [{ e: 60, nv: 52 }, { e: 148, nv: 52 }],
    desafio: 'Babosa no corte, arruda no quebranto e batalha para quem passa ligeiro!', derrota: 'Vou precisar de um chá de boldo.', depois: 'Conte as poças antes de sair da planta. Três passos e acabou o ar.' },
  { id: 'g13-3', classe: 'Garoto', nome: 'Tonico', sprite: 'cl-crianca-m', ia: 'treinador', premio: 2080,
    equipe: [{ e: 92, nv: 52 }, { e: 152, nv: 52 }],
    desafio: 'Meu pai disse que eu podia ajudar no ginásio se não chorasse. Não vou chorar!', derrota: 'Não estou chorando, é o vapor da poça!', depois: 'O tanque do meio é traiçoeiro: só tem um jeito de passar. Começa subindo pela beira da esquerda.' },
  { id: 'g13-4', classe: 'Bióloga', nome: 'Drª Íris', sprite: 'cl-biologa', ia: 'treinador', premio: 2160,
    equipe: [{ e: 118, nv: 53 }, { e: 90, nv: 53 }, { e: 126, nv: 52 }],
    desafio: 'Estou catalogando quem sai vivo do tanque do meio. Você é o número… deixa eu ver… dois!', derrota: 'Anotado: forte e bonzinho com as plantas.', depois: 'No tanque de cima, a planta do canto direito parece um beco. Pegue-a primeiro e volte pela fila de baixo dela.' },
  { id: 'g13-5', classe: 'Vaqueiro', nome: 'Zé Cascavel', sprite: 'cl-vaqueiro', ia: 'treinador', premio: 2200,
    equipe: [{ e: 92, nv: 54 }, { e: 89, nv: 53 }],
    desafio: 'Laço cobra desde menino. Agora vou laçar a sua vitória!', derrota: 'O laço escorregou.', depois: 'Lá em cima, o caminho atravessa a quarta fila de leste a oeste, de planta em planta. Quem pula planta, desmaia.' },
  { id: 'g13-6', classe: 'Observadora', nome: 'Luzia', sprite: 'cl-observadora', ia: 'treinador', premio: 2200,
    equipe: [{ e: 32, nv: 54 }, { e: 146, nv: 54 }, { e: 26, nv: 53 }],
    desafio: 'Atravessou os três tanques? Então já sabe dosar. Agora dose isto!', derrota: 'Dose certa, a sua.', depois: 'O Doutor guarda Elixir e Garrafada no jaleco. E o sapo dele cospe um caldo que dobra de força em quem já está doente.' },
  /*
   * LÍDER — Doutor Peçonha, herpetólogo (Veneno). Fraquezas do Veneno: Terra e Mente.
   * Estratégia: abre com a Coralzinha (Veneno/Encanto), que envenena com Leite de Cururu e ergue a Cortina de Brilho
   * para a equipe; Ciranda (Encanto) castiga Assombro. A Vampirinha (Veneno/Vento) é imune a Terra e entra contra quem
   * traz Terra; Sombra Rasteira responde a Mente. O Escorpião-Rei (Veneno/Ferro) não sofre Veneno e devolve Terra com
   * Tremor de Terra. O Marimbondão (Inseto/Veneno) caça Mente com Voo de Mamangava. O Jararacuçu (Veneno/Terra) segura
   * Trovão e Ferro. O ás é o Sapo-Cururuí (Rio/Veneno) de nível 57: Leite de Cururu e Peçonha Forte (poder dobrado em
   * quem já tem status), Chorume e Enxurrada (Rio contra Terra); segura uma Jabuticaba.
   * Cura: Elixir de Andiroba e Garrafada (spec 7A).
   */
  { id: 'lider-13', classe: 'Líder', nome: 'Doutor Peçonha', sprite: 'lider-13', ia: 'lider', premio: 5700, insignia: 13, musica: 'batalha-lider', flag: 'ginasio-13-vencido',
    itens: ['elixir-andiroba', 'garrafada'],
    equipe: [
      { e: 90, nv: 54, golpes: ['leite-de-cururu', 'borra-de-timbo', 'ciranda', 'cortina-de-brilho'] },
      { e: 32, nv: 55, golpes: ['bote-de-jararaca', 'mergulho-de-gaviao', 'sombra-rasteira', 'pouso-no-galho'] },
      { e: 146, nv: 55, golpes: ['bote-de-jararaca', 'tremor-de-terra', 'unha-de-aco', 'blindagem'] },
      { e: 152, nv: 54, golpes: ['bote-de-jararaca', 'voo-de-mamangava', 'sanguessuga', 'grito-de-guerra'] },
      { e: 89, nv: 55, golpes: ['tremor-de-terra', 'bote-de-jararaca', 'curare', 'pele-amarga'] },
      { e: 26, nv: 57, golpes: ['leite-de-cururu', 'peconha-forte', 'chorume', 'enxurrada'], item: 'jabuticaba' },
    ],
    desafio: 'Não tenha medo da jararaca, tenha respeito. Medo faz a gente errar a dose. Vamos ver se você aprendeu isso nos meus tanques!',
    derrota: 'Que beleza! Uma batalha dessas devia virar artigo científico.', depois: 'Veneno na dose certa vira remédio. Batalha também.' },
];
