/**
 * Eventos do time A2 (Costa do Sol, passos 3–8 e áreas de retorno): Usina Velha (tenente Lata → `usina-ok`), Farol
 * (rival-4, tenente Rebite → `farol-ok` + Lampião, remédio da Faísca → `farol-remedio`), ovo da Praia das Tartarugas
 * (`inicial-extra-2`), Boiúna, Gavião-Tupã, guardião do Monte Tupã e as missões paralelas: a carta da rendeira, a
 * senhora do registro, o rádio da ilha, o galho que se mexe, o sucateiro, a tartaruga das sextas e os ninhos da noite.
 * Flags e marcos: docs/HISTORIA.md (o bloco da reestrutura da Liga vale sobre o resto).
 */
import type { EventoDef, Comando } from '../../core/tipos';
import { jogo, setFlag, diaSemana, estacaoFria } from '../../core/estado';
import { registrarComando } from '../../world/registro';
import './comuns'; // comandos extras: temItens, temEspecie, grito…

/** marca `hoje-sexta` (relógio do jogo) e `estacao-fria` para os roteiros que dependem do calendário */
const semana = () => Math.floor((Date.now() + jogo.save.relogio.deslocamentoMin * 60000) / 604800000);
registrarComando('a2-calendario', () => { setFlag('hoje-sexta', diaSemana() === 5); setFlag('estacao-fria', estacaoFria()); setFlag('sexta-capturada', jogo.save.flags['sexta-semana'] === semana()); });
/** senhora do registro: conta onde e em que nível cada parceira da equipe foi encontrada */
registrarComando('a2-registro', async () => {
  const { falar, nomeCriatura } = await import('../../world/deps');
  const quem = { nome: 'Dona Bilro', retrato: 'npc-idosa' };
  for (const c of jogo.save.equipe) {
    if (c.ovo) { await falar('Esse aí ainda é ovo. Ovo eu registro quando nascer, que eu não sou de adivinhar.', quem); continue; }
    const onde = c.localCaptura ?? 'um lugar que nem o caderno sabe', nv = c.nivelCaptura ?? c.nivel;
    const cresceu = c.nivel - nv;
    await falar(`${nomeCriatura(c)}: conheceu você em ${onde}, no nível ${nv}.\n${cresceu >= 20 ? 'Cresceu que foi uma beleza! Isso é comida boa e batalha honesta.' : cresceu >= 5 ? 'Já engordou uns níveis. Está no caminho.' : 'Ainda está com cheirinho de capim novo.'}`, quem);
  }
});

const TAINA = { nome: 'Tainá', retrato: 'taina' };
const LATA = { nome: 'Tenente Lata', retrato: 'tenente-lata' };
const REBITE = { nome: 'Tenente Rebite', retrato: 'tenente-rebite' };
const VOLTA = { nome: 'Faroleiro Volta', retrato: 'lider-05' };
const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const f = (quem: unknown, texto: string): Comando => ['falar', quem, texto];
const batalhaRival4: Comando[] = [
  se('flag:inicial-mata', [['batalha', 'rival-4-brasa', { segue: true }]]),
  se('flag:inicial-brasa', [['batalha', 'rival-4-rio', { segue: true }]]),
  se('flag:inicial-rio', [['batalha', 'rival-4-mata', { segue: true }]]),
  se('!flag:inicial-mata&!flag:inicial-brasa&!flag:inicial-rio', [['batalha', 'rival-4-brasa', { segue: true }]]),
];

export const EVENTOS_A2: EventoDef[] = [
  /* ============================== USINA VELHA ============================== */
  {
    id: 'a2-usina-alavanca',
    passos: [
      se('flag:usina-grade', [f(null, 'A alavanca já está abaixada. Lá do outro lado do salão, a grade continua aberta.')], [
        f(null, 'Uma alavanca de ferro, lubrificada com capricho. Na plaquinha: "GRADE DA ESCADA LESTE".'),
        ['simnao', 'Puxar a alavanca?', 'a2-sim'],
        se('flag:a2-sim', [['sfx', 'empurrar'], ['tremor', 300], ['flag', 'usina-grade'], f(null, 'CLANC! Do outro lado do salão, uma grade pesada sobe rangendo.')]),
      ]),
    ],
  },
  {
    id: 'a2-usina-chave-geral',
    passos: [
      se('flag:usina-energia', [f(null, 'A chave geral está ligada. O painel zumbe baixinho, satisfeito.')], [
        f(null, 'CHAVE GERAL DA USINA. Alguém colou um aviso do Cartel por cima: "NÃO LIGAR. ORDEM DA TENENTE."\fO aviso está preso com chiclete.'),
        ['simnao', 'Ligar a chave geral?', 'a2-sim'],
        se('flag:a2-sim', [['sfx', 'trovao'], ['tremor', 400], ['flag', 'usina-energia'], f(null, 'As lâmpadas do porão acendem uma a uma.\fLá em cima, a porta elétrica da sala de controle faz "clique".')]),
      ]),
    ],
  },
  {
    id: 'a2-usina-jaula',
    passos: [
      se('flag:usina-ok', [f(null, 'A jaula está vazia e de porta aberta. Ficou só um fiapo de capim e um cheiro de tempestade.')], [
        ['grito', 28],
        f(null, 'Uma jaula do Cartel Ferrugem. Lá dentro, um Vagalumim pisca fraco, em código de socorro.\fO cadeado é elétrico: só abre da sala de controle.'),
      ]),
    ],
  },
  {
    id: 'a2-usina-lata',
    passos: [
      se('!flag:usina-ok', [
        ['emote', 'lata', '!'],
        ['virar', 'lata', 's'],
        f(LATA, 'Quem ligou a chave geral?! Eu mandei colar um aviso! Com chiclete do bom!'),
        f(LATA, 'Ah, é só uma criança enxerida. Escute aqui: esta usina agora é uma fábrica de "baterias vivas" do Cartel Ferrugem.\fCada criatura de Trovão vale uma nota no mercado. E você não vai estragar a minha cota do mês!'),
        ['batalha', 'A-US-lata'],
        f(LATA, 'Amassada por uma criança… O Coronel Garrote vai me mandar para o ferro-velho.'),
        f(LATA, 'Fique com a sua usina! A carga boa já saiu de barco, de qualquer jeito. O Rebite cuida do resto, lá no farol.\fOps. Eu não disse farol. Eu disse… faról. É outra coisa.'),
        ['fade', 'fora'], ['esconder', 'lata'], ['flag', 'usina-ok'], ['sfx', 'trovao'], ['esperar', 500], ['fade', 'dentro'],
        ['tremor', 500],
        f(null, 'A tenente Lata e os capangas fugiram pela passarela.\fOs geradores da Usina Velha voltam a girar. As jaulas do porão se abrem sozinhas!'),
        f({ nome: 'Engenheira-chefe', retrato: 'npc-mulher-4' }, 'Você religou a Usina! Eu estava trancada no almoxarifado há três dias, à base de biscoito de polvilho.\fCom a energia de volta, o guindaste do cais de Porto Sereia já pode descer as canoas. A Baía Azul está aberta para quem tem o Remo!'),
        f({ nome: 'Engenheira-chefe', retrato: 'npc-mulher-4' }, 'A estação também acendeu, mas o maquinista só embarca Campeão da Liga dos Guardiões. Regra da linha da serra.\fTome, é da gaveta do diretor. Ele não vai dar falta.'),
        ['dar', 'pt-18'], ['dar', 'biscoito-de-polvilho', 3],
        ['musica', 'rota-dia-A'],
      ]),
    ],
  },

  /* ============================== CIDADE CORAL ============================== */
  {
    // a moça do cais não promete viagem enquanto o mapa B não abre (src/core/progresso.ts)
    id: 'a2-a5-moca-cais',
    passos: [
      f('moca-cais', 'O Saveiro sobe o rio até Porto Pantaneiro, lá no Sertão das Névoas.'),
      se('mapa-b', [f('moca-cais', 'Mas o mestre só leva quem venceu a Liga dos Guardiões. Diz que o Sertão não é passeio de domingo.')],
        [f('moca-cais', 'Subia, quer dizer. O barco está no estaleiro, de casco para cima, e o mestre jura que volta para a água em breve.\fE mesmo depois da reforma ele só leva quem venceu a Liga dos Guardiões. Diz que o Sertão não é passeio de domingo.')]),
    ],
  },
  {
    id: 'a2-a5-bilheteiro',
    passos: [
      se('flag:liga-vencida', [
        se('item:bilhete-saveiro', [se('mapa-b',
          [f('bilheteiro', 'Campeão a bordo! Bilhete conferido. O Saveiro está na ponta do cais: é só subir a prancha.\fPróxima parada: Porto Pantaneiro, Sertão das Névoas. Enjoo por conta do passageiro.')],
          [f('bilheteiro', 'Campeão da Liga no meu cais! Bilhete conferido, tudo certo… menos o barco.\fO Saveiro está no estaleiro, em reforma: tábua nova, vela nova. Guarde o bilhete: ele vale assim que o casco voltar para a água. Em breve, diz o mestre. O Rádio Cipó avisa.')])],
          [f('bilheteiro', 'Campeão da Liga e sem bilhete? O Cacique Aracê entrega um para cada Campeão, lá no Platô. Dá uma conferida na mochila.')]),
      ], [
        f('bilheteiro', 'Cais do Saveiro, linha Cidade Coral ⇄ Porto Pantaneiro. Bonito, né? Pois é só para olhar.\fO mestre só sobe o rio com Campeão da Liga dos Guardiões a bordo, e de bilhete na mão.'),
        f('bilheteiro', 'A Liga fica no Platô, depois de Vila Buriti. Oito insígnias para entrar, cinco lutas seguidas para sair Campeão.\fVocê tem cara de quem chega lá. Eu tenho cara de quem vende bilhete. Cada um com o seu talento.'),
      ]),
    ],
  },
  /* missão: a carta da rendeira (entrega de carta: Cidade Coral → Serra Fumaça → volta) */
  {
    id: 'a2-missao-renda',
    passos: [
      se('flag:m-carta-fim', [f('rendeira-praca', 'A mãe respondeu a carta com três páginas e uma receita de broa. Você é o melhor carteiro que a Gruta Breu já viu!')], [
        se('flag:m-carta-entregue', [
          f('rendeira-praca', 'Você entregou?! E ela mandou resposta?! Deixa eu ver… "Minha filha, agasalhe-se." É ela mesmo.'),
          f('rendeira-praca', 'Promessa é dívida. Este pergaminho era do meu avô. Ele dizia que ensina a criatura a brilhar feito renda no sol.'),
          ['dar', 'pt-13'], ['flag', 'm-carta-fim'],
        ], [
          se('flag:m-carta', [f('rendeira-praca', 'A carta é para a Vó Candinha, no sobrado amarelo de Serra Fumaça, do outro lado da Gruta Breu.\fNão molhe, não amasse e, por favor, não leia. Tem fofoca.')], [
            f('rendeira-praca', 'Ai, moço… moça… treinador! Você vai para os lados de Serra Fumaça? A minha mãe mora lá e o correio parou desde que a Gruta Breu ficou sem luz.'),
            ['simnao', 'Levar a carta da rendeira para Serra Fumaça?', 'a2-sim'],
            se('flag:a2-sim', [
              ['flag', 'm-carta'], ['sfx', 'item-obtido'],
              f(null, '{JOGADOR} guardou a Carta de Renda no bolso mais seco da mochila.'),
              f('rendeira-praca', 'É para a Vó Candinha, no sobrado amarelo logo depois da boca da gruta. Diga que a renda do enxoval está quase pronta. Faz dois anos que está quase pronta.'),
            ], [f('rendeira-praca', 'Tudo bem. Vou amarrar numa garrafa e jogar no mar. Deve chegar em uns quarenta anos.')]),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'a2-m-carta-entrega',
    passos: [
      se('flag:m-carta-entregue', [f('a7-candinha', 'Diga para a minha filha que aqui na serra a gente dorme de meia. E que eu quero ver essa renda pronta antes do meu centenário.')], [
        se('flag:m-carta', [
          f('a7-candinha', 'Carta? Para mim? De Cidade Coral?! Faz tanto tempo que o carteiro não atravessa a gruta que eu achei que o mar tinha acabado.'),
          f(null, 'A Vó Candinha lê a carta três vezes, ri duas e resmunga uma.'),
          f('a7-candinha', '"A renda do enxoval está quase pronta." Há! Essa menina puxou ao pai. Espere aí que eu vou responder.\fPronto. E isto é para você, pelo frete. Pedra da lua: achei no cemitério, mas juro que não estava sendo usada.'),
          ['flag', 'm-carta-entregue'], ['dar', 'pedra-lunar'],
          f(null, '{JOGADOR} guardou a Resposta da Vó Candinha junto com a receita de broa.'),
        ], [f('a7-candinha', 'Nesta casa só entra visita com notícia. Você tem notícia? Não? Então tome um café e vá procurar uma.\fMinha filha é rendeira lá em Cidade Coral. Se passar pela praça, diga que a mãe dela ainda está viva e brava.')]),
      ]),
    ],
  },
  {
    id: 'a2-m-carta',
    passos: [
      se('flag:m-carta-entregue', [f('a7-carteiro', 'Soube que você entregou uma carta que veio pela Gruta Breu! Você me deixou sem desculpa para não trabalhar.\fDeixa eu ao menos carimbar a sua mochila. Pronto: "ENTREGUE COM CARINHO".')], [
        f('a7-carteiro', 'Sou o carteiro de Serra Fumaça. Na neblina eu entrego carta pelo tato: bato na porta e pergunto quem é.'),
        f('a7-carteiro', 'De Cidade Coral não chega nada desde que a gruta escureceu. A Vó Candinha, do sobrado amarelo ali em cima, pergunta por carta todo santo dia.'),
      ]),
    ],
  },
  /* missão: a senhora do registro */
  {
    id: 'a2-m-registro',
    passos: [
      f('a5-bilro', 'Eu sou a Dona Bilro, do registro. Toda parceira que passa por esta ilha eu anoto: de onde veio e de que tamanho chegou.\fDeixa eu ver as suas. De óculos. Onde estão os meus óculos?'),
      ['a2-registro'],
      se('!flag:m-registro', [
        f('a5-bilro', 'Tudo anotado. Pela ficha limpa, tome: é mel do meu quintal. Criatura bem registrada merece agrado.'),
        ['dar', 'mel-puro', 2], ['flag', 'm-registro'],
      ], [f('a5-bilro', 'Volte quando tiver parceira nova. O caderno aguenta.')]),
    ],
  },
  /* remédio do farol: a boticária de Cidade Coral */
  {
    id: 'a2-m-xarope-alga',
    passos: [
      se('flag:farol-remedio', [f('a5-boticaria', 'Soube que a Faísca do Volta já está acendendo o farol de novo. Xarope de Algas: receita da minha bisavó, que era sereia nas horas vagas.')], [
        se('flag:m-xarope', [
          se('flag:xarope-na-mao', [f('a5-boticaria', 'O xarope não vai se entregar sozinho, criatura! A Faísca está esperando lá no alto do farol.')], [
            f('a5-boticaria', 'O Volta mandou pedir Xarope de Algas? Para a Faísca? Coitadinha da Poraquê, sugaram a bateria dela até o osso. Se é que peixe-elétrico tem osso.'),
            f('a5-boticaria', 'Espere… alga-parda, uma pitada de sal grosso, mel para descer… Pronto! Sacuda antes de dar. O frasco, não a Poraquê.'),
            ['flag', 'xarope-na-mao'], ['sfx', 'item-obtido'],
            f(null, '{JOGADOR} recebeu o Xarope de Algas! O frasco é morno e faz "glub".'),
          ]),
        ], [f('a5-boticaria', 'Sou a Moça Sargaço, boticária. Remédio de mar é comigo: xarope de alga, pomada de concha, chá de espuma.\fSe alguém da baía adoecer, é só mandar me chamar. Ou mandar buscar, que eu enjoo em canoa.')]),
      ]),
    ],
  },

  /* ============================== ILHA DO FAROL ============================== */
  {
    id: 'a2-farol-alavanca',
    passos: [
      se('flag:farol-grade', [f(null, 'A alavanca já está puxada. O cabo que desce para o térreo está esticado.')], [
        f(null, 'Uma alavanca com um cabo de aço que some pelo assoalho. Etiqueta com a letra do Volta: "GRADE DA ESCADA 2 (não esquecer aberta!!)".'),
        ['simnao', 'Puxar a alavanca?', 'a2-sim'],
        se('flag:a2-sim', [['sfx', 'empurrar'], ['tremor', 300], ['flag', 'farol-grade'], f(null, 'RRRRÉC! Lá embaixo, uma grade sobe e bate no teto.')]),
      ]),
    ],
  },
  {
    id: 'a2-rival-4',
    passos: [
      se('!flag:rival-4', [
        ['emote', 'taina', '!'],
        f('taina', '{JOGADOR}?! Eu falei para não colar na minha canoa e você veio de escada!'),
        f('taina', 'Lá em cima tem um tenente do Cartel com as criaturas de Trovão da baía inteira em jaula. Eu ia resolver sozinha, mas…\fMas nada. Antes de subir, você vai me mostrar que não vai atrapalhar!'),
        ...batalhaRival4,
      ]),
      se('flag:rival-4', [
        se('flag:batalha-perdida', [f(TAINA, 'Ganhei. Então fica combinado: eu fui a favorita e você deu sorte de eu estar com pressa.')],
          [f(TAINA, 'Tá bom, tá bom. Você melhorou. Um pouco. Não conta para ninguém que eu disse.')]),
        f(TAINA, 'Escuta: eu já derrubei meia escada de capanga e as minhas estão no fim do fôlego. As suas também, depois dessa.\fDeixa eu dar um jeito.'),
        ['curar'],
        f(TAINA, 'Pronto, novas em folha. Remédio da minha avó, não pergunte o que tem dentro.\fSobe você. Eu fico aqui segurando a escada: se descer capanga correndo, tropeça em mim.'),
        f(TAINA, 'E {JOGADOR}… solta todas as jaulas, tá? Todas.'),
        ['esconder', 'taina'],
      ]),
    ],
  },
  {
    id: 'a2-farol-jaula',
    passos: [
      se('flag:farol-ok', [f(null, 'Jaula aberta e vazia. Sobrou uma pena chamuscada e um zumbido feliz no ar.')], [
        ['grito', 115],
        f(null, 'Jaulas do Cartel empilhadas até o teto: Poraquins, Vagalumins e Grilinhos, todos ligados por fios à lanterna do farol.\fO Cartel está usando as criaturas como pilha!'),
      ]),
    ],
  },
  {
    id: 'a2-farol-faisca',
    passos: [
      se('flag:farol-remedio', [['grito', 116], f(null, 'A Faísca nada em oito dentro do aquário. A cada volta, a lanterna do farol pisca mais forte.')], [
        se('flag:farol-ok', [f(null, 'O aquário da lanterna. A Faísca, a Poraquê do Volta, está deitada no fundo, apagada feito lâmpada queimada.')],
          [f(null, 'Um aquário enorme, cheio de fios do Cartel. No fundo, uma Poraquê quase sem brilho.')]),
      ]),
    ],
  },
  {
    id: 'a2-farol-rebite',
    passos: [
      // em dois tempos: primeiro os dois capangas; o tenente espera o jogador se arrumar (menu, remédios) e só então luta.
      // Quem já caiu não volta a lutar: perdendo para o tenente, a revanche começa direto nele.
      se('!flag:farol-ok&!flag:venceu:A6-FA-9', [
        ['emote', 'rebite', '!'],
        f(REBITE, 'Parado aí. Mais um passo e você pisa no meu chão limpo.'),
        f(REBITE, 'Tenente Rebite, Cartel Ferrugem. Este farol agora é uma antena: com a força dessas criaturas, o Coronel Garrote vai falar com a costa inteira. E a costa inteira vai obedecer.'),
        f(VOLTA, 'Mmmf! Mmmmf mmf MMF!'),
        f(REBITE, 'O faroleiro discorda. O faroleiro está amarrado. Capangas: parafusem a visita!'),
        se('!flag:venceu:A6-FA-8', [['batalha', 'A6-FA-8']]),
        ['batalha', 'A6-FA-9'],
        f(REBITE, 'Incompetentes. Tudo eu, tudo eu.\fArrume as suas criaturas, se quiser: eu gosto de apertar parafuso inteiro. Quando chegar perto, eu aperto você pessoalmente.'),
      ], [se('!flag:farol-ok', [
        f(REBITE, 'Pronto? Venha, então. Eu aperto você pessoalmente.'),
        ['batalha', 'A6-rebite'],
        f(REBITE, 'Soltou… Tudo o que eu prendo, solta. A Lata tinha razão: esta costa dá azar.'),
        f(REBITE, 'Fique com o seu farol. O Coronel tem planos maiores no Sertão, e lá não tem criança com canoa.\fCartel Ferrugem: recolher!'),
        ['fade', 'fora'], ['esconder', 'rebite'], ['flag', 'farol-ok'], ['flag', 'm-xarope'], ['esperar', 500], ['fade', 'dentro'],
        f(null, 'O tenente Rebite e os capangas descem a escada aos tropeços.\fUma por uma, as jaulas se abrem. As criaturas de Trovão saem pela janela da lanterna, piscando de alívio.'),
        f(VOLTA, 'Ufa! Obrigado, obrigado! Três dias amarrado, e o pior: sem poder mexer em nada!\fEu sou o Volta, faroleiro, inventor e, nas horas vagas, líder do ginásio da ilha.'),
        f(VOLTA, 'Você merece mais que um aperto de mão. Tome o meu Lampião: fui eu que fiz. Com uma parceira de Brasa, Trovão ou Encanto na equipe, ele espanta qualquer breu. Até o da Gruta Breu!'),
        ['amuleto', 'lampiao'], // o item-chave `amuleto-lampiao` entra na mochila junto com o Amuleto (garantirItensDeAmuleto)
        f(VOLTA, 'Agora, o ginásio… Eu adoraria um desafio, mas olhe a Faísca, a minha Poraquê. É ela que acende a lanterna do farol, e esses brutos sugaram a bateria dela.\fSem a Faísca eu não saio daqui. E líder preocupado luta mal.'),
        f(VOLTA, 'Só o Xarope de Algas da Moça Sargaço, a boticária de Cidade Coral, levanta peixe-elétrico. Você remaria até lá por mim?\fTraga o xarope e eu abro o ginásio na mesma hora. Palavra de inventor: quase nunca falha!'),
      ])]),
    ],
  },
  {
    id: 'a2-farol-volta',
    passos: [
      se('!flag:farol-ok', [f(VOLTA, 'Mmmf! Mmf mmf!'), f(null, 'O Faroleiro Volta está amarrado com fio de telefone. Ele aponta o queixo para o tenente.')], [
        se('flag:xarope-na-mao', [
          f(VOLTA, 'É o Xarope de Algas?! Dá aqui! Sacudiu? A Sargaço sempre manda sacudir.'),
          f(null, 'O Volta pinga o xarope no aquário. A água fica verde, depois azul, depois… faísca!'),
          ['grito', 116], ['sfx', 'trovao'], ['tremor', 400],
          f(null, 'A Faísca dá um salto e a lanterna do farol acende de uma vez. O facho de luz varre a Baía Azul inteira!'),
          ['flag', 'farol-remedio'], ['flag', 'xarope-na-mao', false],
          f(VOLTA, 'Ela voltou! Olha esse brilho! Dá para ler jornal em Porto Sereia com essa luz!'),
          f(VOLTA, 'Promessa de inventor se cumpre: o ginásio está aberto. Eu desço na frente para ligar os circuitos. Traga borracha na sola do sapato!'),
          ['dar', 'cuia-rapida', 5],
          f(VOLTA, 'E leve mais um invento meu: o Chocalho do Mutirão. Ele espalha o que uma criatura aprende na luta para quem ficou para trás.\fQuem está na reserva, dois níveis ou mais abaixo da sua mais forte, ganha metade da experiência só de escutar. Daqui para a serra os treinadores engrossam: ninguém sobe aquilo com uma criatura só.'),
          ['dar', 'chocalho-mutirao'],
          ['fade', 'fora'], ['esconder', 'volta-2'], ['esperar', 300], ['fade', 'dentro'],
        ], [f(VOLTA, 'A Faísca continua apagadinha… O Xarope de Algas é com a Moça Sargaço, a boticária de Cidade Coral. Ela fica perto da Venda.\fVá remando pelo oeste e depois para o sul. Eu fico aqui cantando para a Faísca. Ela finge que gosta.')]),
      ]),
    ],
  },
  {
    id: 'a2-m-xarope',
    passos: [
      se('flag:farol-remedio', [f('a6-aprendiz', 'O farol acendeu e o mestre voltou para o ginásio! A oficina está uma bagunça, então está tudo normal.\fA Faísca mandou um choquinho de agradecimento. Eu repasso: bzzt.')], [
        se('flag:farol-ok', [f('a6-aprendiz', 'O mestre não desce do farol enquanto a Faísca não melhorar. Poraquê é assim: sem bateria, murcha.\fO remédio é o Xarope de Algas da boticária de Cidade Coral. Ela fica na rua da Venda de lá.')],
          [f('a6-aprendiz', 'Sou a Centelha, aprendiz do Volta. Ele subiu ao farol há três dias "para dar uma olhadinha" e não voltou.\fDepois subiu uma gente de macacão cor de ferrugem. Eu tranquei a oficina e estou fingindo que não tem ninguém. Você não me viu.')]),
      ]),
    ],
  },
  /* missão: o rádio da Ilha do Farol */
  {
    id: 'a2-m-radio',
    passos: [
      se('flag:m-radio', [f('a6-radialista', 'Rádio Farol no ar! Hoje: previsão da maré, modinhas de viola e o quadro "Quem viu a Tartaruga-Gigante?".\fDizem que ela sobe para respirar no Recife Submerso toda sexta-feira. Só às sextas.')], [
        f('a6-radialista', 'Eu sou o Zé Dial, radioamador. O meu transmissor pifou no dia em que o farol apagou: queimou a engrenagem do dínamo.'),
        ['temItens', 'engrenagem-velha', 1, 'a2-tem'],
        se('flag:a2-tem', [
          ['simnao', 'Dar uma Engrenagem Velha para o Zé Dial?', 'a2-sim'],
          se('flag:a2-sim', [
            ['tirar', 'engrenagem-velha', 1], ['sfx', 'radio'],
            f('a6-radialista', 'Serve certinho! Escuta só: chhh… "Rádio Farol chamando a Baía Azul"… FUNCIONA!\fVocê acaba de salvar o único programa de modinha de viola do litoral. Tome, é do baú de prêmios dos ouvintes.'),
            ['dar', 'pt-22'], ['contato', 'radio-farol'], ['flag', 'm-radio'],
          ], [f('a6-radialista', 'Sem engrenagem, sem rádio. Sem rádio, a ilha não sabe nem que horas é a maré.')]),
        ], [f('a6-radialista', 'Se achar uma Engrenagem Velha por aí, me traga. Em Vila Ferrugem dizem que tem até pelo chão, mas é longe que só.')]),
      ]),
    ],
  },

  /* ============================== SERRA FUMAÇA ============================== */
  /* missão: o galho que se mexe (a árvore que se mexe das regras clássicas) */
  {
    id: 'a2-m-arvore',
    passos: [
      se('flag:m-arvore', [f('a7-jardineira', 'Então o galho do portão era um Urutauzim fingindo de pau? Vinte anos de jardinagem e eu regando passarinho.\fFique com o Regador. Canteiro regado dá fruto mais depressa.')], [
        f('a7-jardineira', 'Sou a jardineira do cemitério. Tem um galho seco fincado bem no portão que eu não plantei, não podo e não consigo arrancar.\fE o esquisito: toda vez que eu rego, ele se mexe.'),
        se('item:regador', [f('a7-jardineira', 'Você tem um Regador? Então regue você. Eu é que não chego perto de novo.')], [
          f('a7-jardineira', 'Tome o meu Regador reserva. Se o galho morder, a culpa é do galho.'),
          ['dar', 'regador'],
        ]),
        ['flag', 'm-arvore-dica'],
      ]),
    ],
  },
  {
    id: 'a2-m-arvore-galho',
    passos: [
      f(null, 'Um galho seco, fincado bem no meio do portão do cemitério. Tem dois nós na madeira que parecem olhos fechados.'),
      se('item:regador', [
        ['simnao', 'Regar o galho?', 'a2-sim'],
        se('flag:a2-sim', [
          ['sfx', 'passo-agua'], ['esperar', 400], ['emote', 'galho', '!'], ['grito', 169],
          f(null, 'O galho arregala os olhos e abre um bico do tamanho de uma gaveta!'),
          ['selvagem', 169, 31, { semFuga: true }],
          ['flag', 'm-arvore'], ['esconder', 'galho'],
          f(null, 'O portão do cemitério ficou livre.'),
        ]),
      ], [f(null, 'Ele não sai do lugar por nada. Talvez com um pouco de água…')]),
    ],
  },

  /* ============================== VILA FERRUGEM ============================== */
  {
    id: 'a2-m-sucata',
    passos: [
      se('flag:m-sucata', [f('a8-sucateiro', 'Com as suas engrenagens eu terminei o meu relógio de sol a manivela. Funciona até de noite. Não me pergunte como.')], [
        f('a8-sucateiro', 'Eu sou o Seu Ferro-Velho. Coleciono Engrenagem Velha da fábrica antiga: cada uma lembra um colega de turno.\fMe traga três e eu dou em troca uma coisa que brilha de verdade.'),
        ['temItens', 'engrenagem-velha', 3, 'a2-tem'],
        se('flag:a2-tem', [
          ['simnao', 'Entregar 3 Engrenagens Velhas?', 'a2-sim'],
          se('flag:a2-sim', [
            ['tirar', 'engrenagem-velha', 3],
            f('a8-sucateiro', 'Uma do torno, uma da prensa, uma da esteira três… Você trouxe a turma inteira de volta!\fTrato é trato: Cuia de Ouro, forjada aqui mesmo. E uma rapadura, que ninguém é de ferro.'),
            ['dar', 'cuia-ouro', 2], ['dar', 'rapadura'], ['flag', 'm-sucata'],
          ]),
        ], [f('a8-sucateiro', 'Ainda não tem três? Procure na Encosta da Fumaça, perto do pedregulho da saída leste e no fundo do meu quintal, que eu mesmo já perdi uma lá.')]),
      ]),
    ],
  },

  /* ============================== PRAIA DAS TARTARUGAS ============================== */
  {
    id: 'a2-pr-ovo',
    passos: [
      se('flag:inicial-extra-2', [f('pr-chefe', 'E o ovo, já nasceu? Ande bastante com ele: ovo gosta de balanço de mochila.\fO Projeto Tartaruí agradece. Volte de noite para ver as mães subirem a areia.')], [
        f('pr-chefe', 'Bem-vindo ao Projeto Tartaruí! Eu sou a Drª Maré, coordenadora. Você veio com a insígnia Estrela, então sabe pisar leve.'),
        f('pr-chefe', 'Preciso de alguém de confiança. Achamos um ovo num ninho de tartaruga, mas não é de tartaruga: é quente, pinta diferente e veio com uma etiqueta do laboratório da Profª Ipê Amarelo.\fAlgum contrabandista do Cartel deve ter largado na fuga.'),
        f('pr-chefe', 'A Profª Ipê disse pelo rádio que é irmão da criatura que ela te confiou, e que não há mãos melhores que as suas. Você cuida dele?'),
        ['simnao', 'Ficar com o ovo do ninho?', 'a2-sim'],
        se('flag:a2-sim', [
          se('flag:inicial-rio', [['darOvo', 4]], [['darOvo', 7]]),
          ['flag', 'inicial-extra-2'],
          f('pr-chefe', 'Ele vai nascer depois de uma boa caminhada. Ou remada: balanço de canoa também conta, eu acho. A ciência ainda está discutindo.'),
        ], [f('pr-chefe', 'Sem pressa. Ele fica aquecido na areia até você voltar.')]),
      ]),
    ],
  },
  {
    id: 'a2-pr-ninho',
    passos: [
      ['a2-calendario'],
      se('periodo:noite', [f(null, 'Um ninho na areia. No escuro, dá para ouvir os ovos estalando baixinho.\fUma Tartaruí recém-nascida põe a cabeça para fora, olha a lua e corre para o mar.')],
        [f(null, 'Um ninho de tartaruga cercado por estacas e fitas do Projeto Tartaruí.\fPlaquinha: "Desova nº 37. Não pise. As mães sobem a praia de noite."')]),
    ],
  },
  {
    id: 'a2-pr-vigia',
    passos: [
      ['a2-calendario'],
      se('flag:estacao-fria', [f('pr-vigia', 'Estação fria! Chegaram os visitantes do sul: tem Pinguinzinho perdido no capim da ponta e baleia com filhote lá na baía.\fPinguim a gente não devolve na marra. Ele vai embora quando esquenta. Ou fica, se gostar de você.')],
        [f('pr-vigia', 'No calor só tem tartaruga, siri e turista. Na estação fria, de junho a setembro, é que chegam os pinguins e as baleias.\fVolte quando esfriar. Traga casaco: para você, não para o pinguim.')]),
    ],
  },

  /* ============================== RECIFE SUBMERSO ============================== */
  {
    id: 'a2-rs-sexta',
    passos: [
      ['a2-calendario'],
      se('flag:hoje-sexta&!flag:sexta-capturada', [se('!flag:sexta-avisou', [['flag', 'sexta-avisou'], f(null, 'A água do recife está diferente hoje. Uma sombra larga e lenta passa perto da clareira de areia…')])]),
    ],
  },
  {
    id: 'a2-rs-tartaruga',
    passos: [
      ['grito', 80],
      f(null, 'A Tartaruga-Gigante das sextas-feiras! O casco dela é um recife ambulante: tem coral, craca e um peixinho inquilino.\fEla olha para você devagar. Muito devagar.'),
      ['selvagem', 80, 50, {}],
      ['a2-sexta-fim'],
    ],
  },
  {
    id: 'a2-rs-boiuna',
    passos: [
      se('flag:boiuna-ok', [f(null, 'A gruta do fundo está vazia. Na areia ficou o risco de um corpo comprido, do tamanho de um rio.')], [
        se('insignia:12', [
          f(null, 'No fundo da gruta, dois faróis verdes se acendem. Não são faróis.\fA água inteira do recife começa a girar devagar em volta de você.'),
          ['tremor', 600], ['grito', 174],
          f(null, 'A BOIÚNA, a cobra-grande das águas, desenrola o corpo e ergue a cabeça!'),
          ['selvagem', 174, 52, { lendario: true }],
          ['a2-lenda-fim', 'boiuna-ok'],
          se('flag:a2-lenda-vencida', [f(null, 'A Boiúna afunda no redemoinho e a água do recife para de girar. A cobra-grande não foi mais vista.')]),
        ], [
          f(null, 'Algo imenso dorme enrolado no fundo da gruta. Cada respiração dele empurra você um palmo para trás.\fNão acorda com barulho, nem com luz. Parece esperar um ritmo… um toque de berimbau que você ainda não conhece.'),
        ]),
      ]),
    ],
  },

  /* ============================== MONTE TUPÃ E ALDEIA TUPÃ ============================== */
  {
    id: 'a2-mt-guardiao',
    passos: [
      se('insignias:15', [f('mt-guardiao', 'Quinze insígnias, contei uma por uma. O monte reconhece você.\fSuba com respeito: paredão, breu e cascata, nessa ordem. Lá no alto, o Pajé Trovão-Velho espera há muito tempo por alguém assim.')], [
        f('mt-guardiao', 'Alto. Eu sou Abaeté, guardião do Monte Tupã. Esta trilha leva à Aldeia e ao último ginásio de Pindorama.'),
        f('mt-guardiao', 'O monte só se abre para quem carrega quinze insígnias. Deixe-me contar as suas… uma… duas…\fNão dá quinze. Volte quando o Sertão das Névoas inteiro conhecer o seu nome.'),
      ]),
    ],
  },
  {
    id: 'a2-a9-paje-fora',
    passos: [
      se('insignia:16', [f('a9-anciao', 'A Escama está com você. O céu sobre a Aldeia mudou: escute.\fNa pedra mais alta, ao norte, o Gavião-Tupã pousa para ver de perto quem o trovão escolheu.')],
        [f('a9-anciao', 'Bem-vindo à Aldeia Tupã, o lugar mais perto do céu em toda Pindorama.\fO Pajé Trovão-Velho guarda a insígnia da Escama. As quatro provas do ginásio pedem o que você aprendeu nos dois mapas: mata, fogo, água e vento.')]),
    ],
  },
  {
    id: 'a2-a9-gaviao',
    passos: [
      se('flag:gaviao-ok', [f(null, 'A pedra mais alta do Monte Tupã. Ficou uma pena comprida, que estala quando se toca.')], [
        se('insignia:16', [
          f(null, 'O ar fica parado. Os pelos do braço se arrepiam. Longe, um trovão sem nuvem.'),
          ['sfx', 'trovao'], ['tremor', 600], ['grito', 178],
          f(null, 'O GAVIÃO-TUPÃ desce do céu e pousa na pedra! Cada batida de asa é um relâmpago.'),
          ['selvagem', 178, 60, { lendario: true }],
          ['a2-lenda-fim', 'gaviao-ok'],
          se('flag:a2-lenda-vencida', [f(null, 'O Gavião-Tupã cai, se ergue num estalo de trovão e some acima das nuvens. Ele não foi mais visto no Monte Tupã.')]),
        ], [f(null, 'A pedra mais alta do Monte Tupã. Está riscada de raio de cima a baixo.\fO céu aqui parece esperar alguém. Ainda não é você: falta a insígnia do Pajé.')]),
      ]),
    ],
  },
];

/**
 * lendário de evento: aparece uma vez só (decisão do autor; spec 6.4). Capturado ou vencido sem captura, some para sempre
 * (`a2-lenda-vencida` = foi vencido, para a fala de despedida); fuga e derrota do jogador deixam o encontro para outra vez.
 */
registrarComando('a2-lenda-fim', ([flagOk]) => { const r = jogo.save.flags['ultima-batalha']; setFlag('a2-lenda-vencida', r === 'vitoria'); if (r === 'captura' || r === 'vitoria') setFlag(String(flagOk)); });
/** tartaruga das sextas: capturada ou vencida, só volta na outra semana (a flag guarda a sexta em que saiu) */
registrarComando('a2-sexta-fim', () => { const r = jogo.save.flags['ultima-batalha']; if (r === 'captura' || r === 'vitoria') { setFlag('sexta-semana', semana()); setFlag('sexta-capturada'); } });
