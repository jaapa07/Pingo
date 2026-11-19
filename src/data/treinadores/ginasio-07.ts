import type { TreinadorDef } from '../../core/tipos';

/**
 * Ginásio do Ferro (nº 7, Vila Ferrugem): os operários da fábrica e a líder Engenheira Bigorna. Líder nv 34–36.
 * No Diário, o tipo Ferro só aparece em estágios finais (soma ≥ 500), que cabem apenas a partir do nível 36:
 * por isso só o ás, o Herculão de nível 36, é de Ferro; os outros são as criaturas que viram Ferro ao evoluir
 * (Besourim, Sirizim, Preguinho, Escorpim), ainda no estágio anterior.
 */
export const TREINADORES_GINASIO_07: TreinadorDef[] = [
  { id: 'g07-1', classe: 'Ferreiro', nome: 'Zé Rebite', sprite: 'cl-ferreiro', ia: 'treinador', premio: 1240,
    equipe: [{ e: 143, nv: 31 }, { e: 161, nv: 31 }],
    desafio: 'Crachá, capacete e batalha: sem os três ninguém sobe na esteira!', derrota: 'Bati o ponto mais cedo.', depois: 'A esteira da porta está descendo. A engrenagem vermelha ali do canto resolve.' },
  { id: 'g07-2', classe: 'Garimpeiro', nome: 'Nonô Sucata', sprite: 'cl-garimpeiro', ia: 'treinador', premio: 1280,
    equipe: [{ e: 33, nv: 32 }, { e: 129, nv: 32 }, { e: 143, nv: 32 }],
    desafio: 'Tudo que cai da esteira é meu. Você caiu?', derrota: 'Virei sucata.', depois: 'A esteira do meio parece o caminho mais curto. É: o mais curto até a prensa.' },
  { id: 'g07-3', classe: 'Ferreira', nome: 'Tonha Malho', sprite: 'cl-ferreiro', ia: 'treinador', premio: 1320,
    equipe: [{ e: 65, nv: 33 }, { e: 143, nv: 33 }, { e: 145, nv: 33 }],
    desafio: 'Subiu pela azul? Esperta… esperto… agora aguenta a martelada!', derrota: 'Entortei o malho.', depois: 'A engrenagem vermelha deste andar inverte de novo o circuito. A esteira do canto noroeste só sobe assim.' },
  { id: 'g07-4', classe: 'Montanhista', nome: 'Guto Polia', sprite: 'cl-montanhista', ia: 'treinador', premio: 1360,
    equipe: [{ e: 129, nv: 33 }, { e: 161, nv: 34 }, { e: 65, nv: 34 }],
    desafio: 'Escalo chaminé de fábrica nas horas vagas. Você é a minha hora vaga!', derrota: 'Escorreguei na graxa.', depois: 'Lá no mezanino tem a última engrenagem azul. Sem girar, a esteira da Bigorna empurra você de volta.' },
  { id: 'g07-5', classe: 'Ferreiro', nome: 'Mestre Torno', sprite: 'cl-ferreiro', ia: 'treinador', premio: 1400,
    equipe: [{ e: 145, nv: 34 }, { e: 33, nv: 34 }, { e: 143, nv: 35 }],
    desafio: 'Trinta anos de chão de fábrica. Ninguém chega à engenheira sem passar pelo meu controle de qualidade!', derrota: 'Aprovado. Com louvor.', depois: 'A Bigorna endurece a defesa antes de bater. Golpe especial atravessa melhor que pancada.' },
  /*
   * LÍDER — Engenheira Bigorna (Ferro). Fraquezas do Ferro: Brasa, Ginga e Terra.
   * Estratégia: o Besourim (Inseto/Ferro) abre com Casulo e Pião de Ferro; o Sirizim (Rio) é a resposta a Brasa e
   * Terra com Bolhas do Mangue; o Preguinho (Ginga) pune os outros Ferro e os Pedra que o desafiante traz, e afia
   * as garras antes; o Escorpim (Veneno/Terra) envenena com Leite de Cururu e bate em Brasa com Tatu-Bola.
   * O ás é o Herculão (Inseto/Ferro) de nível 36: Bigornada no mesmo tipo, Terra Batida contra Brasa e Mordida de
   * Saúva contra Mata e Mente.
   * Cura: 1 Garrafada definida (no Aventureiro o motor só libera itens a partir do 8º ginásio); o ás segura uma Pitanga.
   */
  { id: 'lider-07', classe: 'Líder', nome: 'Engenheira Bigorna', sprite: 'lider-12', ia: 'lider', premio: 3600, insignia: 7, musica: 'batalha-lider', flag: 'ginasio-07-vencido',
    itens: ['garrafada'],
    equipe: [
      { e: 34, nv: 34, golpes: ['tatu-bola', 'unha-de-aco', 'jogar-areia'] },
      { e: 130, nv: 34, golpes: ['rabanada', 'unha-de-aco', 'casulo'] },
      { e: 65, nv: 35, golpes: ['meia-lua', 'pedrada', 'amolar-garras'] },
      { e: 162, nv: 36, golpes: ['unha-de-aco', 'dentada', 'tatu-bola', 'jogar-areia'] },
    ],
    desafio: 'Projetei cada parafuso desta fábrica, e você desmontou o meu circuito em dez minutos. Agora quero ver o seu projeto de batalha. Liguem as máquinas!',
    derrota: 'Parada geral! Meu projeto tinha uma falha: não contava com você.', depois: 'Toda engrenagem importa. Até a menor.' },
];
