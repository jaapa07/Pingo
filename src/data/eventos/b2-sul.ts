/**
 * Eventos do time B2-sul (Sertão das Névoas, passos 12–14).
 * História: o laboratório secreto do Cartel no Brejo Roxo (5º evento: porteiro, alavancas, a cela do Doutor Peçonha,
 * a Doutora Zinabre e o tenente Lata → `laboratorio-ok`), a fuga da Queixada-Caipora (`b2-caipora-solta`: passa a
 * vagar pelo mapa B ao sair do ginásio com a insígnia 13) e a rival Tainá no encontro 7 (`b2-rival-7`, Serra da Geada).
 * Missões paralelas (regras aprovadas do spec 10A e exemplos da seção 9.3):
 *   m-alunos       os três alunos fujões do Mestre Cabaça (Cidade Ginga → Trilha da Roda)
 *   m-dende        o tabuleiro da Dona Dendê na Feira (pequi, caju e açaí)
 *   b2-feira-quinta  banca de cuias de encomenda da Artesã Cabacinha, só às quintas (10A-2 e 10A-39)
 *   b2-roda-sabado   revanche por agenda: a Contramestra Maré, aos sábados, depois da insígnia 14 (10A-25/26)
 *   m-filhotes     devolver as cinco Pererequinhas à Dona Rã (seção 9.3; Brejo Roxo e Vale do Veneno)
 *   m-carta-serra  carta do Brejo Roxo para a Serra da Geada e a resposta de volta (10A-29)
 *   m-troca-b7     troca com morador: Tuco-Escavador por uma Gralha-Azul apelidada (10A-12)
 *   m-pinhoes      mostrar um Serelepão ao Seu Pinhão-Manso (Subida da Serra)
 *   b2-payada      as adivinhas do Payador no Galpão do CTG: três por dia, de escolher (cultura do Sul; o quiz do
 *                  rádio do spec 10A-31 é da Rádio Farol, A6, time de regras)
 *   b2-chimarrao   a roda de chimarrão do CTG (cura; à noite, causo e presente)
 * Flags e marcos: docs/HISTORIA.md e docs/ZONAS-B2-SUL.md.
 */
import type { EventoDef, Comando } from '../../core/tipos';
import { jogo, setFlag, diaSemana } from '../../core/estado';
import { registrarComando } from '../../world/registro';
import { tr } from '../../i18n';
import './comuns'; // comandos extras: temItens, temEspecie, grito, opcao…

/* ------------------------------ comandos do time ------------------------------ */
/** número do dia no relógio do jogo (o deslocamento do relógio conta) */
const hoje = () => Math.floor((Date.now() / 60000 + jogo.save.relogio.deslocamentoMin) / 1440);
/** `b2-quinta`, `b2-sabado`, `b2-terca-quinta` (dia da semana do relógio do jogo) */
registrarComando('b2s-calendario', () => { const d = diaSemana(); setFlag('b2-quinta', d === 4); setFlag('b2-sabado', d === 6); setFlag('b2-terca-quinta', d === 2 || d === 4); });
/** ['b2s-marcar-dia', flag] guarda o dia de hoje na flag */
registrarComando('b2s-marcar-dia', ([f]) => { setFlag(String(f), hoje()); });
/** ['b2s-dia-livre', flagDoDia, flagSaida] → saída = nunca marcado ou já virou o dia desde o marcado */
registrarComando('b2s-dia-livre', ([marca, saida]) => { const v = jogo.save.flags[String(marca)]; setFlag(String(saida), typeof v !== 'number' || hoje() > v); });
/** ['b2s-soma', flag] soma 1 a uma flag numérica; ['b2s-pelo-menos', flag, n, saida] compara */
registrarComando('b2s-soma', ([f]) => { const v = jogo.save.flags[String(f)]; setFlag(String(f), (typeof v === 'number' ? v : 0) + 1); });
registrarComando('b2s-pelo-menos', ([f, n, saida]) => { const v = jogo.save.flags[String(f)]; setFlag(String(saida), typeof v === 'number' && v >= Number(n)); });
/**
 * ['b2s-trocar', especieDada, especieRecebida, nivel, apelido, item, dono, local, flagOk]: tira da equipe a primeira
 * criatura da espécie dada (que não seja ovo) e entrega a recebida, com apelido, item segurado e treinador original.
 */
registrarComando('b2s-trocar', async ([dar, receber, nivel, apelido, it, dono, local, ok]) => {
  const eq = jogo.save.equipe, i = eq.findIndex((c) => c.especie === Number(dar) && !c.ovo);
  setFlag(String(ok), i >= 0);
  if (i < 0) return;
  const { criarCriatura } = await import('../../world/deps');
  const nova = criarCriatura(Number(receber), Number(nivel), { apelido: String(apelido), item: String(it), treinadorOriginal: String(dono), localCaptura: String(local), nivelCaptura: Number(nivel) });
  eq.splice(i, 1, nova);
  const v = jogo.save.diario, n = Number(receber); if (!v.visto.includes(n)) v.visto.push(n); if (!v.capturado.includes(n)) v.capturado.push(n);
});

/* ------------------------------ atalhos de roteiro ------------------------------ */
const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const f = (quem: unknown, texto: string): Comando => ['falar', quem, texto];
const TAINA = { nome: 'Tainá', retrato: 'taina' };
const LATA = { nome: 'Tenente Lata', retrato: 'tenente-lata' };
const ZINABRE = { nome: 'Doutora Zinabre', retrato: 'capanga-f' };
const PECONHA = { nome: 'Doutor Peçonha', retrato: 'lider-13' };
const GARROTE = { nome: 'Coronel Garrote (rádio)', retrato: 'coronel-garrote' };
const RADIO = { nome: 'Rádio Cipó' };
const PAYADOR = { nome: 'Payador Juvenal', retrato: 'cl-repentista' };
/** a Tainá usa o inicial que vence o do jogador */
const contraInicial = (pre: string): Comando[] => [
  se('flag:inicial-mata', [['batalha', `${pre}-brasa`, { segue: true }]]),
  se('flag:inicial-brasa', [['batalha', `${pre}-rio`, { segue: true }]]),
  se('flag:inicial-rio', [['batalha', `${pre}-mata`, { segue: true }]]),
  se('!flag:inicial-mata&!flag:inicial-brasa&!flag:inicial-rio', [['batalha', `${pre}-brasa`, { segue: true }]]),
];
/** aluno fujão do Mestre Cabaça achado na Trilha da Roda */
const aluno = (n: number, npc: string, fala: string): EventoDef => ({
  id: `b2-aluno-${n}`,
  passos: [
    ['emote', npc, '!'],
    f(npc, fala),
    f(null, '{JOGADOR} contou que o Mestre Cabaça está procurando os alunos.'),
    f(npc, 'O Mestre?! Ele vai me botar para treinar ginga até o galo cantar… Tá bom, tá bom, eu volto!'),
    ['fade', 'fora'], ['esconder', npc], ['flag', `b2-aluno-${n}`], ['fade', 'dentro'],
    ['sfx', 'ui-ok'],
  ],
});
/** Pererequinha fujona da Dona Rã */
const filhote = (n: number): EventoDef => ({
  id: `b2-filhote-${n}`,
  passos: [
    ['grito', 24], ['emote', `filhote-${n}`, 'nota'],
    f(null, 'Uma Pererequinha de bolinha roxa no pescoço: é da Dona Rã! Ela pula direto para a mão de {JOGADOR}.'),
    ['esconder', `filhote-${n}`], ['flag', `b2-filhote-${n}`], ['sfx', 'item-obtido'],
    f(null, 'Leve-a de volta ao charco do Brejo Roxo.'),
  ],
});
/** alavancas do laboratório */
const alavanca = (id: string, flag: string, texto: string): EventoDef => ({
  id,
  passos: [
    se(`flag:${flag}`, [f(null, 'A alavanca já está para baixo. A luz em cima dela está verde.')], [
      f(null, 'Uma alavanca grossa, com a placa "NÃO MEXER". {JOGADOR} mexeu.'),
      ['sfx', 'empurrar'], ['tremor', 300], ['flag', flag],
      f(null, texto),
    ]),
  ],
});

/** adivinhas do Payador: [adivinha, opções, índice da certa, explicação] */
const ADIVINHAS: [string, string[], number, string][] = [
  ['Tem coroa e não é rei, tem escama e não é peixe. O que é, o que é?', ['Abacaxi', 'Pinhão', 'Jacaré'], 0, 'O abacaxi! Coroa de folha em cima e escama na casca. Fruta brasileira de nascença, viu?'],
  ['Cai do alto da serra, vem vestido de escama marrom, e se ninguém comer vira árvore de duzentos anos. O que é?', ['Granizo', 'Pinhão', 'Gralha'], 1, 'O pinhão, semente da araucária! A gralha-azul enterra e esquece, e a serra agradece.'],
  ['Quanto mais se tira, maior fica. O que é, o que é?', ['Saudade', 'Pinhão', 'Buraco'], 2, 'O buraco! Saudade até cresce, mas é com o tempo, não tirando.'],
];
const payada: Comando[] = ADIVINHAS.flatMap(([q, op, certa, exp], i): Comando[] => [
  ['escolha', q, op, `b2-adv${i + 1}`], ['opcao', `b2-adv${i + 1}`],
  se(`flag:b2-adv${i + 1}-${certa}`, [['sfx', 'ui-ok'], ['b2s-soma', 'b2-payada-pontos'], f(PAYADOR, tr('Acertou, vivente! {exp}', { exp }))], [['sfx', 'ui-erro'], f(PAYADOR, tr('Errou, tchê! {exp}', { exp }))]),
]);

export const EVENTOS_B2S: EventoDef[] = [
  /* ============================== CIDADE GINGA: alunos do Mestre Cabaça ============================== */
  {
    id: 'b2-cabaca',
    passos: [
      se('flag:m-alunos-ok', [f('cabaca', 'Os três agora treinam até de domingo. Por medo de você ir buscar de novo, eu acho.\fVolte quando quiser jogar uma roda com o velho.')], [
        se('flag:m-alunos', [
          se('flag:b2-aluno-1&flag:b2-aluno-2&flag:b2-aluno-3', [
            f('cabaca', 'Bimba, Dandara e Pastinha voltaram, cada um com uma desculpa pior que a outra! Ê, mocidade.'),
            f('cabaca', 'Leve este pergaminho. Ensina uma rasteira que aprendi com o meu mestre, que aprendeu com o mestre dele. Ginga não se inventa: se herda.'),
            ['dar', 'pt-42'], ['dar', 'cuia-ouro', 2], ['flag', 'm-alunos-ok'],
          ], [f('cabaca', 'Ainda falta aluno. Eles adoram a Trilha da Roda: um perto da fogueira, um lá em cima do Tabuleiro e um no capinzal do leste.')]),
        ], [
          f('cabaca', 'Ê, visitante. Três alunos meus fugiram do treino para jogar capoeira na Trilha da Roda. Sem roupa de treino, sem aquecimento, sem juízo.'),
          ['simnao', 'Procurar os três alunos do Mestre Cabaça?', 'b2-sim'],
          se('flag:b2-sim', [['flag', 'm-alunos'], f('cabaca', 'Bimba, Dandara e Pastinha. Fale meu nome que eles voltam correndo. De medo, mas voltam.')], [f('cabaca', 'Tudo bem. O berimbau espera; o aluno é que não.')]),
        ]),
      ]),
    ],
  },
  aluno(1, 'aluno-1', 'Ô, não conta para ninguém! Eu só vim treinar na roda da fogueira. A fogueira é mais quentinha que a academia.'),
  aluno(2, 'aluno-2', 'Eu subi o Tabuleiro pela trepadeira! Daqui de cima a roda parece uma formiga. Uma formiga que joga capoeira.'),
  aluno(3, 'aluno-3', 'Psiu! Estou tentando chegar perto de um Quatizão para aprender a meia-lua dele. Ele não deixa.'),

  /* ============================== FEIRA: Dona Dendê e a banca de quinta ============================== */
  {
    id: 'b2-dende',
    passos: [
      se('flag:m-dende-ok', [f('dende', 'O tabuleiro está cheio graças a você! Acarajé não, que aqui é cocada de açaí com caju e pequi. Invenção minha. Ninguém pede, mas todo mundo come.')], [
        ['temItens', 'pequi', 1, 'b2-tem-pequi'], ['temItens', 'caju', 1, 'b2-tem-caju'], ['temItens', 'acai', 1, 'b2-tem-acai'],
        se('flag:b2-tem-pequi&flag:b2-tem-caju&flag:b2-tem-acai', [
          f('dende', 'Pequi, caju e açaí! Meu tabuleiro está completo de novo!'),
          ['tirar', 'pequi', 1], ['tirar', 'caju', 1], ['tirar', 'acai', 1],
          f('dende', 'Tome: um pergaminho que um freguês deixou de pagamento e uma rapadura das grandes. A rapadura é de verdade. O pergaminho, espero que também.'),
          ['dar', 'pt-34'], ['dar', 'rapadura'], ['flag', 'm-dende-ok'],
        ], [f('dende', 'Ai, meu tabuleiro… Me faltam um pequi, um caju e um açaí. O Seu Cajá ali vende fruto, mas meu dinheiro foi todo no óleo.\fSe você trouxer os três, eu pago com o que tenho de melhor.')]),
      ]),
    ],
  },
  {
    id: 'b2-feira-quinta',
    passos: [
      ['b2s-calendario'],
      se('flag:b2-quinta', [
        f('cuias', 'Quinta-feira, dia de feira de verdade! Hoje tem cuia de encomenda, trançada a noite inteira.'),
        ['loja', ['cuia-rede', 'cuia-noturna', 'cuia-rapida', 'cuia-mel', 'cuia-ouro', 'cuia-trancada']],
      ], [
        f('cuias', 'Cuia boa é cuia com história. Cada trançado destes levou uma novela inteira.'),
        f('cuias', 'As de encomenda (Rede, Noturna, Rápida e de Mel) eu só trago às quintas. Hoje só tenho a de todo dia.'),
        ['loja', ['cuia-trancada', 'cuia-ouro']],
      ]),
    ],
  },
  {
    id: 'b2-lambari',
    passos: [
      se('!item:vara-boa', [
        f('lambari', 'Vai para o Túnel Alagado sem vara de respeito? Leve a minha Vara Boa. Eu já estou velho para o Jaú.'),
        ['dar', 'vara-boa'],
      ], [
        se('flag:b2-lambari-ok', [f('lambari', 'Na gruta do túnel, o Jaú-Gigante morde mais com Vara Mestra. Com Vara Boa ele só fica curioso.')], [
          f('lambari', 'Você já tem vara boa! Então leve estas cuias de rede: bicho de água se enrosca nelas que é uma beleza.'),
          ['dar', 'cuia-rede', 3], ['flag', 'b2-lambari-ok'],
        ]),
      ]),
    ],
  },
  {
    id: 'b2-roda-sabado',
    passos: [
      se('!flag:venceu:B5-mare', [
        f('roda-b', 'O Mestre Gingado luta em dupla: duas criaturas de cada lado, no compasso.\fQuer sentir o gosto? Eu sou a contramestra da Roda Grande. Vem!'),
        ['batalha', 'B5-mare'],
        f('roda-b', 'Jogou bonito. Agora é com o Mestre.'),
      ], [
        se('!insignia:14', [f('roda-b', 'Sábado a Roda Grande é aberta. Volte quando tiver a Insígnia Floco da Serra da Geada: aí eu trago a equipe de gente grande.')], [
          ['b2s-calendario'], ['b2s-dia-livre', 'b2-roda-dia', 'b2-roda-livre'],
          se('flag:b2-sabado&flag:b2-roda-livre', [
            ['b2s-marcar-dia', 'b2-roda-dia'],
            ['batalha', 'B5-mare-2'],
            f('roda-b', 'Valeu a roda. Sábado que vem tem mais.'),
          ], [
            se('flag:b2-sabado', [f('roda-b', 'Hoje já teve roda. O berimbau também precisa descansar.')], [f('roda-b', 'A Roda Grande é aos sábados. Durante a semana, só treino e fofoca.')]),
          ]),
        ]),
      ]),
    ],
  },

  /* ============================== BREJO ROXO ============================== */
  {
    id: 'b2-babosa',
    passos: [
      se('flag:b2-babosa-ok', [f('esposa', 'Meu marido fica plantado na porta do ginásio. Ele trata as cobras do Doutor melhor do que trata o meu feijão.')], [
        f('esposa', 'Meu marido fica plantado na porta do ginásio esperando o Doutor Peçonha voltar.'),
        f('esposa', 'Leve isto, você vai precisar mais do que eu. Brejo Roxo é lugar de picada.'),
        ['dar', 'pomada-copaiba', 2], ['dar', 'mel-puro', 2], ['flag', 'b2-babosa-ok'],
      ]),
    ],
  },
  {
    id: 'b2-filhotes',
    passos: [
      se('flag:m-filhotes-ok', [f('mae-perereca', 'As cinco dormem no balde, de barriguinha cheia. E o ovinho? Já chocou? Cuide bem, que é neto meu.')], [
        se('flag:m-filhotes', [
          se('flag:b2-filhote-1&flag:b2-filhote-2&flag:b2-filhote-3&flag:b2-filhote-4&flag:b2-filhote-5', [
            f('mae-perereca', 'Uma, duas, três, quatro… CINCO! Todas de volta! E nenhuma ficou roxa!'),
            f('mae-perereca', 'Desde que o Cartel montou o curtume, elas fugiam de medo. Obrigada, criança.\fLeve este ovo. Foi posto ontem no balde. Quero que ele cresça viajando, não com medo.'),
            ['darOvo', 24], ['dar', 'cuia-mel', 3], ['flag', 'm-filhotes-ok'],
          ], [f('mae-perereca', 'Ainda faltam Pererequinhas! Três pularam pelo Brejo Roxo e duas foram parar no Vale do Veneno, uma delas numa ilha da lagoa.')]),
        ], [
          f('mae-perereca', 'Ai, ai… Eu criava cinco Pererequinhas soltas no quintal. Com a fumaceira do curtume, fugiram todas.'),
          ['simnao', 'Procurar as cinco Pererequinhas da Dona Rã?', 'b2-sim'],
          se('flag:b2-sim', [['flag', 'm-filhotes'], f('mae-perereca', 'Elas têm uma bolinha roxa no pescoço, que eu pintei com urucum misturado com jenipapo. Não tem como confundir!')], [f('mae-perereca', 'Tudo bem… Elas sabem nadar. Eu é que não sei esperar.')]),
        ]),
      ]),
    ],
  },
  filhote(1), filhote(2), filhote(3), filhote(4), filhote(5),
  {
    id: 'b2-carta',
    passos: [
      se('flag:m-carta-serra-ok', [f('b6-carteiro', 'A Dorinha respondeu, eu entreguei, e a vizinha já sabe de tudo. Correio de brejo é assim: chega antes da carta.')], [
        se('flag:m-carta-serra-resposta', [
          f('b6-carteiro', 'A resposta da Dorinha! O meu sobrinho vai chorar de alegria. Ou de frio, se ele resolver subir a serra para visitar.'),
          f('b6-carteiro', 'Tome. É o que o correio paga pelos serviços extraordinários: um pergaminho e o meu muito obrigado carimbado.'),
          ['dar', 'pt-17'], ['dinheiro', 3000], ['flag', 'm-carta-serra-ok'],
        ], [
          se('flag:m-carta-serra', [f('b6-carteiro', 'A carta é para a Prenda Dorinha, na Serra da Geada, lá no alto da Subida da Serra. Eu não subo: tenho medo de altura e de araucária.')], [
            f('b6-carteiro', 'Ô, Campeão! Você vai subir a serra? Meu sobrinho escreveu uma carta de amor para uma prenda da Serra da Geada, e eu tenho medo de altura.'),
            ['simnao', 'Levar a carta para a Prenda Dorinha?', 'b2-sim'],
            se('flag:b2-sim', [['flag', 'm-carta-serra'], ['sfx', 'item-obtido'], f(null, '{JOGADOR} guardou a carta do sobrinho do Carteiro Sapé, cheirando a perfume de jasmim.')], [f('b6-carteiro', 'Tudo bem. O amor espera. O sobrinho, nem tanto.')]),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'b2-lab-porteiro',
    passos: [
      ['emote', 'porteiro-lab', '!'],
      f('porteiro-lab', 'Ei! O curtume está fechado. Para obras. Obras de… curtume. Circulando!'),
      ['batalha', 'B6-porteiro'],
      f('porteiro-lab', 'Tá bom, tá bom! Eu vou… tomar um ar. Lá longe.'),
      ['fade', 'fora'], ['esconder', 'porteiro-lab'], ['flag', 'b2-lab-porteiro'], ['fade', 'dentro'],
    ],
  },

  /* ============================== LABORATÓRIO DO CARTEL ============================== */
  alavanca('b2-lab-alavanca-1', 'b2-lab-alavanca-1', 'Um estalo ecoa pelos canos. Lá no corredor, a porta blindada destrancou.'),
  alavanca('b2-lab-alavanca-a', 'b2-lab-a', 'Uma luz verde acende no corredor do núcleo: "ALAVANCA A — OK".'),
  alavanca('b2-lab-alavanca-b', 'b2-lab-b', 'Uma luz verde acende no corredor do núcleo: "ALAVANCA B — OK".'),
  {
    id: 'b2-peconha-cela',
    passos: [
      se('flag:b2-peconha-falou', [
        f(PECONHA, 'Deixe-me ver essa equipe… Um pouco de antídoto de jararaca aqui, uma compressa de babosa ali…'),
        ['curar'],
        f(PECONHA, 'Prontinho. Agora vá. As duas alavancas abrem a comporta do núcleo, e o núcleo é onde a coisa toda acontece.'),
      ], [
        ['emote', 'peconha', '!'],
        f(PECONHA, 'Ora, ora! Um Campeão da Costa no porão do Cartel! Sou o Doutor Peçonha, líder do ginásio do Brejo Roxo. Eles me prenderam quando vim investigar a fumaça roxa.'),
        f(PECONHA, 'Lá embaixo, no núcleo, a Doutora Zinabre estuda uma criatura lendária: a Queixada-Caipora, guardiã da mata. Querem o segredo dela para fazer mato brotar onde for lucro.'),
        f(PECONHA, 'Esta cela tem teclado e eu não sei a senha. Mas sei de antídoto. Deixe eu cuidar da sua equipe antes de você descer.'),
        ['curar'], ['flag', 'b2-peconha-falou'],
        f(PECONHA, 'A comporta do núcleo abre com as duas alavancas: a das jaulas, aqui no sudoeste, e a da destilaria, no nordeste. Vá!'),
      ]),
    ],
  },
  {
    id: 'b2-lab-terminal',
    passos: [
      f(null, 'PROJETO CAIPORA — DIÁRIO DA DRA. ZINABRE\n"Dia 41: o espécime 176 partiu o terceiro sedativo. Onde ele pisa, o concreto racha e brota capim."'),
      f(null, '"Dia 42: o Coronel quer o resultado antes da lua cheia. O tenente Lata veio da Usina para apressar. Pressa não funciona com lenda."'),
      f(null, '"Dia 43: a jaula reforçada aguenta. Eu acho."'),
    ],
  },
  {
    id: 'b2-lab-final',
    passos: [
      se('!flag:b2-zinabre-ok', [
        ['musica', 'cartel-tema'],
        ['emote', 'zinabre', '!'], ['emote', 'lata', '!'],
        f(ZINABRE, 'Quem deixou essa criança entrar no núcleo?! Estamos no meio de uma medição!'),
        f(LATA, 'Eu conheço essa cara. Foi ela que acabou com a festa na Usina Velha! Doutora, deixa comigo… depois de você.'),
        f(ZINABRE, 'Muito bem. Vamos medir a sua resistência, criança. Para a ciência!'),
        ['batalha', 'B6-lab-zinabre'],
        ['flag', 'b2-zinabre-ok'],
        f(ZINABRE, 'Os gráficos mentiram… Tenente, é com você. E não deixe a 176 sair!'),
        // intervalo entre as duas lutas (decisão do autor, docs/DECISOES-FINAIS.md): com elas coladas o jogador honesto
        // vencia o Lata 12% das vezes no simulador; o tenente quer revanche "limpa" e deixa a equipe descansar na maca
        f(LATA, 'Calma aí, Doutora. Da última vez ela disse que eu só ganhava de equipe cansada. Hoje não!\fCriança, deita esses bichos na maca da enfermaria. Quando eu te derrotar, quero que seja no ferro, sem desculpa.'),
        ['fade', 'fora'], ['curar'], ['fade', 'dentro'],
        f(null, 'A maca do laboratório zumbe por um instante. A equipe de {JOGADOR} recuperou as forças!'),
      ]),
      f(LATA, 'Desde a Usina eu treino para este dia. Ferro novo, criança! Nada de ferrugem desta vez!'),
      ['batalha', 'B6-lab-lata'],
      f(LATA, 'De novo… DE NOVO! Como é que uma criança vence o Cartel Ferrugem duas vezes?!'),
      ['tremor', 600], ['sfx', 'quebrar'], ['grito', 176], ['emote', 'caipora', 'raiva'],
      f(null, 'CRAAAC! A jaula reforçada estoura. O piso de concreto racha, e capim verde brota pelas frestas.'),
      f(ZINABRE, 'A 176! Ela rompeu a jaula! Fechem as comportas, fechem tudo!'),
      ['esconder', 'caipora'],
      f(null, 'A Queixada-Caipora passa pelo corredor como um vento de mato e some escada acima, deixando um rastro de folhas.'),
      ['sfx', 'radio'],
      f(GARROTE, '…Lata? Zinabre? Que barulho é esse? Ela escapou?! Bando de inúteis! Saiam daí antes que os Guardiões cheguem. Levem os papéis, deixem as jaulas!'),
      f(LATA, 'Você ouviu o Coronel. Retirada! E você, criança… a gente se vê no Pico.'),
      ['fade', 'fora'], ['esconder', 'zinabre'], ['esconder', 'lata'], ['flag', 'laboratorio-ok'], ['fade', 'dentro'],
      ['musica', 'laboratorio'],
      f(null, 'Um zumbido corre pelos canos: todas as celas do laboratório destrancam ao mesmo tempo.'),
      f(PECONHA, 'Livre, finalmente! Ouvi tudo pelos canos, Campeão. As criaturas das jaulas já estão voltando para o brejo. Os sapos vão cantar a noite inteira.'),
      f(PECONHA, 'E a Queixada… a guardiã da mata não volta para jaula nenhuma. Ela vai se esconder no Sertão até a mata dela estar segura.'),
      f(PECONHA, 'O meu ginásio está aberto. Venha quando quiser — e traga criaturas de Terra ou de Mente, que as minhas cobras ficam nervosas.'),
      ['dar', 'mel-puro', 3], ['dar', 'pt-27'],
      f(RADIO, 'Rádio Cipó, edição extraordinária! O esconderijo do Cartel Ferrugem no Brejo Roxo foi desmontado por um treinador visitante! Os animais resgatados voltam hoje ao brejo.'),
      ['warp', 'B6', 43, 8, 's'],
      ['salvar'],
    ],
  },
  {
    id: 'b2-caipora-solta',
    passos: [
      ['flag', 'b2-caipora-solta'],
      ['grito', 176],
      f(null, 'Um bater de queixo ecoa do lado da serra. Por um instante, a garoa cheira a mato novo.'),
      f(PECONHA, 'Ouviu isso? É ela, a Queixada-Caipora! Saiu do esconderijo agora que o brejo sarou.'),
      f(PECONHA, 'De agora em diante ela anda pelas rotas do Sertão, cada dia num lugar. Se encontrar, tenha Cuia boa e paciência: guardiã não se entrega fácil.'),
      ['errante', 176, 63],
      f(RADIO, 'Rádio Cipó avisa: tropeiros relatam uma queixada enorme cruzando as estradas do Sertão, com capim brotando atrás dela. Quem encontrar, respeite!'),
    ],
  },
  {
    id: 'b2-timbo',
    passos: [
      se('!insignia:13', [f('jardineiro', 'O Horto é do Doutor Peçonha. Sem a Insígnia Espinho, nem eu entro. E eu moro aqui.')], [
        se('flag:b2-timbo-ok', [f('jardineiro', 'O portão do Horto está aberto. Não pise nas mudas, não morda as frutas e não converse com a planta carnívora: ela é fofoqueira.')], [
          f('jardineiro', 'A Insígnia Espinho! O Doutor mandou abrir o Horto para você. Leve este mel: é das abelhas que cuidam das flores daqui.'),
          ['dar', 'mel-puro', 3], ['flag', 'b2-timbo-ok'],
        ]),
      ]),
    ],
  },

  /* ============================== SUBIDA DA SERRA ============================== */
  {
    id: 'b2-pinhoes',
    passos: [
      se('flag:m-pinhoes-ok', [f('b-r4-pinhoeiro', 'O Serelepão é o guarda-florestal da serra: esconde pinhão e planta araucária. E você é o guarda-florestal dele. Bom trabalho.')], [
        ['temEspecie', 138, 'b2-tem-serelepao'],
        se('flag:b2-tem-serelepao', [
          f('b-r4-pinhoeiro', 'Um Serelepão! Olha essa cauda! Olha esse bochecho cheio de pinhão!'),
          f('b-r4-pinhoeiro', 'Tome. É um pergaminho que eu guardava para o primeiro que me mostrasse um Serelepão de perto. Trinta anos esperando.'),
          ['dar', 'pt-39'], ['dar', 'cha-guarana', 2], ['flag', 'm-pinhoes-ok'],
        ], [f('b-r4-pinhoeiro', 'Sabe o Serelepão? O serelepe guardião das araucárias. Eu nunca vi um de perto. Ele vive nas araucárias do topo: sacuda uma.\fSe você pegar um e me mostrar, eu dou um presente que guardo há trinta anos.')]),
      ]),
    ],
  },

  /* ============================== SERRA DA GEADA ============================== */
  {
    id: 'b2-rival-7',
    passos: [
      se('!flag:rival-7', [
        ['emote', 'taina-b7', '!'],
        f(TAINA, '{JOGADOR}! Subi a serra pela trilha dos tropeiros só para chegar antes de você. E cheguei!'),
        f(TAINA, 'Desde o Arraial eu treinei na roda, no brejo e no gelo. A Gaúcha Pinhão é a próxima. Mas primeiro, você!'),
        // decisão do autor (docs/DECISOES-FINAIS.md): a Subida da Serra (B-R4) é de mão única e sem Posto, então a Tainá
        // cura a equipe do jogador antes da luta — ninguém chega aqui inteiro
        f(TAINA, 'Bah, mas olha essa equipe… subiu a serra no osso! Assim não vale.\fToma: chimarrão bem quente e uma garrafada para cada um. Agora sim, de igual para igual!'),
        ['fade', 'fora'], ['curar'], ['fade', 'dentro'],
        f(null, 'A equipe de {JOGADOR} recuperou as forças!'),
        ...contraInicial('rival-7'),
        se('flag:batalha-perdida', [f(TAINA, 'GANHEI! No frio, no alto, na frente da serra inteira! Bah!\fVá ao Posto. Uma Campeã que se preza não ganha de equipe cansada duas vezes.')], [
          f(TAINA, 'Bah… até o sotaque daqui eu peguei, menos a vitória.'),
          f(TAINA, 'Sabe o que eu aprendi lá embaixo? Que o Cartel quer as lendárias. A Queixada, o Boitatá… e dizem que o Coronel Garrote está no Pico Pingorama.\fTerças e quintas eu treino na Gruta do Eco, lá na Costa. Passe lá quando quiser apanhar… quer dizer, quando quiser revanche!'),
        ]),
        ['fade', 'fora'], ['esconder', 'taina-b7'], ['flag', 'rival-7'], ['fade', 'dentro'],
      ]),
    ],
  },
  {
    id: 'b2-carta-b7',
    passos: [
      se('flag:m-carta-serra-resposta', [f('b7-moca', 'Já mandei a resposta. Agora é esperar. Esperar é o que a gente mais faz na serra: a geada, o pinhão, a carta…')], [
        se('flag:m-carta-serra', [
          f('b7-moca', 'Uma carta para mim? Do Brejo Roxo? É… é do Juca, o sobrinho do carteiro!'),
          f(null, 'A Prenda Dorinha lê a carta três vezes, fica vermelha e escreve a resposta ali mesmo, apoiada na mureta.'),
          f('b7-moca', 'Leve a resposta para o Carteiro Sapé, por favor. E diga ao Juca que na serra faz frio, mas o chimarrão é quente.'),
          ['sfx', 'item-obtido'], ['flag', 'm-carta-serra-resposta'],
        ], [f('b7-moca', 'Tem gente que espera carta a vida inteira. Eu espero de um rapaz do Brejo Roxo que conheci na festa de São João. Ele disse que escrevia.')]),
      ]),
    ],
  },
  {
    id: 'b2-troca-b7',
    passos: [
      se('flag:m-troca-b7-ok', [f('b7-trocador', 'O Tuco já cavou a horta inteira e começou a cavar a do vizinho. E a Azulina, está plantando araucária onde você passa?')], [
        f('b7-trocador', 'Buenas! Eu crio gralhas, mas preciso de um Tuco-Escavador para cavar a horta. Gralha só planta pinheiro onde não deve.'),
        ['simnao', 'Trocar um Tuco-Escavador pela Gralha-Azul "Azulina"?', 'b2-sim'],
        se('flag:b2-sim', [
          ['b2s-trocar', 162, 136, 55, 'Azulina', 'pena-colorida', 'Tchê Barbosa', 'Serra da Geada', 'b2-trocou'],
          se('flag:b2-trocou', [
            ['sfx', 'evolucao'], f(null, '{JOGADOR} trocou o Tuco-Escavador pela Gralha-Azul Azulina!'),
            f('b7-trocador', 'Cuide bem da Azulina. Ela segura uma pena colorida que achou no ninho e não larga por nada.'),
            ['flag', 'm-troca-b7-ok'],
          ], [f('b7-trocador', 'Ué, cadê o Tuco? Tem que estar na equipe, tchê. Tem Tuquim e Tuco-Escavador na Subida da Serra, no capim e nas rochas rachadas.')]),
        ], [f('b7-trocador', 'Sem problema. A gralha não vai a lugar nenhum. Vai, sim: voa. Mas volta.')]),
      ]),
    ],
  },
  {
    id: 'b2-chimarrao',
    passos: [
      f('b7-patrao', 'Buenas, vivente! Chegue perto do fogo de chão. Aqui no CTG a cuia de chimarrão passa de mão em mão, e ninguém fica com frio.'),
      ['curar'],
      f(null, '{JOGADOR} tomou um gole de chimarrão. Amargo! Mas a equipe toda se aqueceu em volta do fogo.'),
      se('periodo:noite&!flag:b2-chimarrao-ok', [
        f('b7-patrao', 'De noite a roda é de causo. Conta a lenda que a Gralha-Azul era uma ave preta que pediu a Tupã para ajudar a mata. Ganhou a cor do céu e o trabalho de plantar pinhão.'),
        f('b7-patrao', 'Gostou? Então leve isto. Causo bom se paga com presente bom.'),
        ['dar', 'pt-45'], ['flag', 'b2-chimarrao-ok'],
      ], [se('!flag:b2-chimarrao-ok', [f('b7-patrao', 'Volte de noite, que a roda de chimarrão vira roda de causo. E causo bom tem presente no fim.')])]),
    ],
  },
  {
    id: 'b2-payada',
    passos: [
      ['b2s-dia-livre', 'b2-payada-dia', 'b2-payada-livre'],
      se('flag:b2-payada-livre', [
        f(PAYADOR, 'Buenas, vivente! Payada de adivinha: eu pergunto em verso, você responde em prosa. Três adivinhas por dia; acertou as três, leva prenda.'),
        ['flag', 'b2-payada-pontos', 0], ['b2s-marcar-dia', 'b2-payada-dia'],
        ...payada,
        ['b2s-pelo-menos', 'b2-payada-pontos', 3, 'b2-payada-passou'],
        se('flag:b2-payada-passou', [
          ['sfx', 'insignia'],
          se('flag:b2-payada-ok', [f(PAYADOR, 'Três de três de novo! A prenda de hoje é uma Cuia de Ouro, que o Bolicheiro Valdir me deu fiado.'), ['dar', 'cuia-ouro']], [
            f(PAYADOR, 'Três de três! Bah, que cabeça! Teu nome vai para o quadro de honra do CTG, ao lado dos campeões do laço.'),
            ['dar', 'pt-22'], ['dar', 'pedra-mare'], ['flag', 'b2-payada-ok'],
          ]),
        ], [f(PAYADOR, 'Quase, quase. Amanhã tem payada de novo, com as mesmas adivinhas. Quem perde hoje, ganha amanhã.')]),
      ], [f(PAYADOR, 'A payada de hoje já foi. Adivinha demais cansa a cabeça e a gaita. Volte amanhã, vivente.')]),
    ],
  },
];
export default EVENTOS_B2S;
