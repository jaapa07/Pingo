/**
 * Eventos do time A1 (Costa do Sol, passos 1–3): a ABERTURA completa (nome, quarto, mãe, relógio, Rádio Cipó, Profª Ipê,
 * as três cuias, o Ovo Pintado, a rival Tainá, Diário de Campo e tutorial de captura), a missão do Faro, os encontros
 * 2 e 3 com a rival e as missões paralelas das zonas A1 → A4. Flags e marcos: docs/HISTORIA.md.
 */
import type { EventoDef, Comando } from '../../core/tipos';
import { jogo, setFlag } from '../../core/estado';
import { registrarComando } from '../../world/registro';
import { COLUNAS_CUIAS, LINHA_CUIAS } from '../zonas/A1-lab';
import './comuns'; // comandos extras: opcao, temEspecie, temItens, vitrine…

/** avatar escolhido na abertura (o nome padrão acompanha) */
registrarComando('avatar', ([a]) => { const j = jogo.save.jogador; j.avatar = a === 'ayra' ? 'ayra' : 'kaue'; j.nome = a === 'ayra' ? 'Ayra' : 'Kauê'; });
/** marca `cuia-0|1|2` conforme a cuia que está na frente do jogador na mesa do laboratório (e `cuia-alguma`) */
registrarComando('cuiaDaFrente', () => {
  const j = jogo.save.jogador;
  let alguma = false;
  COLUNAS_CUIAS.forEach((cx, i) => { const ok = j.zona === 'A1-lab' && j.y === LINHA_CUIAS + 1 && j.x === cx; setFlag(`cuia-${i}`, ok); alguma ||= ok; });
  setFlag('cuia-alguma', alguma);
});

const PROF = { nome: 'Profª Ipê', retrato: 'prof-ipe' };
const TAINA = { nome: 'Tainá', retrato: 'taina' };
const AROEIRA = { nome: 'Seu Aroeira', retrato: 'seu-aroeira' };
const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const f = (quem: unknown, texto: string): Comando => ['falar', quem, texto];
/** a Tainá usa o inicial que vence o do jogador */
const batalhaRival = (n: 1 | 2 | 3): Comando[] => [
  se('flag:inicial-mata', [['batalha', `rival-${n}-brasa`, { segue: true }]]),
  se('flag:inicial-brasa', [['batalha', `rival-${n}-rio`, { segue: true }]]),
  se('flag:inicial-rio', [['batalha', `rival-${n}-mata`, { segue: true }]]),
];
/** apresentação e confirmação de uma das três cuias do laboratório */
const cuia = (id: string, num: number, nome: string, tipo: string, flagTipo: string, descricao: string): EventoDef => ({
  id,
  passos: [
    ['sfx', 'cuia-balanco'],
    ['vitrine', num],
    f(null, descricao),
    ['simnao', `Você vai escolher ${nome}, do tipo ${tipo}?`, 'cuia-sim'],
    ['vitrineFim'],
    se('flag:cuia-sim', [
      ['flag', 'inicial', num], ['flag', flagTipo],
      ['darCriatura', num, 5, { apelidar: true }],
      ['chamar', 'lab-depois-da-escolha'],
    ], [f(PROF, 'Sem pressa. É a primeira parceira da sua vida: pense bem!')]),
  ],
});

export const EVENTOS_A1: EventoDef[] = [
  /* ============================== ABERTURA ============================== */
  {
    id: 'abertura',
    passos: [
      ['musica', 'laboratorio'],
      f(PROF, 'Opa, chegou gente! Seja bem-vindo a Pindorama!\fEu sou a Ipê Amarelo, mas todo mundo me chama de Profª Ipê.'),
      f(PROF, 'Esta terra é cheia de criaturas: no capim, nos rios, nas grutas, no alto das árvores.\fA gente vive com elas, aprende com elas e, de vez em quando, batalha ao lado delas. Eu? Eu estudo todas. Ou tento.'),
      f(PROF, 'Mas antes de falar de bicho, me fale de você.'),
      ['escolha', 'Quem é você?', ['Kauê', 'Ayra'], 'avatar-op'],
      ['opcao', 'avatar-op'],
      se('flag:avatar-op-1', [['avatar', 'ayra']], [['avatar', 'kaue']]),
      ['pedirNome', 'jogador'],
      f(PROF, '{JOGADOR}! Nome bom de gritar no meio do mato.\fPois então, {JOGADOR}: a sua história em Pindorama começa agora. E começa do jeito certo — atrasada para o café.'),
      ['fade', 'fora'],
      ['warp', 'A1-quarto', 5, 5, 's'],
      ['fade', 'dentro'],
      ['flag', 'abertura-ok'],
      ['emote', 'jogador', 'zzz'],
      f({ nome: 'Mãe' }, '{JOGADOR}! Acorda, criatura! O café está na mesa e a Profª Ipê já passou aqui duas vezes!'),
      ['emote', 'jogador', '!'],
      f(null, 'É o seu quarto, em Vila Jacarandá. O computador está ligado e a escada desce para a cozinha.'),
    ],
  },
  {
    id: 'mae-intro',
    passos: [
      ['emote', 'mae', '!'],
      ['virar', 'mae', 'l'],
      f('mae', 'Até que enfim, {JOGADOR}! Achei que você tinha virado Preguicim.\fA Profª Ipê quer falar com você lá no laboratório. Disse que é coisa importante — e ela só diz isso umas três vezes por dia.'),
      f('mae', 'Antes de sair, leva isto. Chegou do conserto hoje cedo.'),
      ['dar', 'radio-cipo'],
      f('mae', 'É o seu Rádio Cipó: pega os programas, guarda os contatos de quem você conhecer e mostra a hora.\fFalando em hora… o relógio dele zerou no conserto. Que dia é hoje, mesmo? E que horas são?'),
      ['tela', 'relogio', { titulo: 'Que dia e que horas são?' }],
      f('mae', 'Isso! Eu sabia. Só estava testando você.\fJá anotei o número de casa nos contatos. Me liga de vez em quando, viu? Mãe também é criatura que precisa de atenção.'),
      ['contato', 'mae'],
      f('mae', 'Ah, e mais uma coisa: quando você começar a ganhar patacas por aí, posso guardar uma parte para você. É só falar comigo.\fAgora vai, que a professora está esperando. E penteia esse cabelo!'),
      ['flag', 'intro-ok'],
      ['virar', 'mae', 's'],
    ],
  },
  {
    id: 'mae',
    passos: [
      se('!flag:intro-ok', [['chamar', 'mae-intro']], [
        se('!flag:inicial', [f('mae', 'A Profª Ipê está no laboratório, descendo a rua e virando à direita. Vai lá, não deixa ela esperando!')], [
          ['escolha', 'Mãe: "Oi, meu bem! Precisa de alguma coisa?"', ['Descansar um pouco', 'Guardar dinheiro', 'Só um abraço'], 'mae-op'],
          ['opcao', 'mae-op'],
          se('flag:mae-op-0', [
            f('mae', 'Senta aí, toma um suco de caju. As suas criaturas também: tem biscoito de polvilho para todo mundo.'),
            ['fade', 'fora'], ['curar'], ['fade', 'dentro'],
            f('mae', 'Pronto! Vocês estão com outra cara. Juízo na estrada!'),
          ]),
          se('flag:mae-op-1', [['chamar', 'mae-poupanca']]),
          se('flag:mae-op-2', [['emote', 'mae', 'coracao'], ['amizade', 2], f('mae', 'Vem cá. Pronto. Agora vai conquistar o mundo, mas volta para o almoço de domingo.')]),
        ]),
      ]),
    ],
  },

  /* ============================== LABORATÓRIO: as três cuias ============================== */
  {
    id: 'prof-ipe',
    passos: [
      ['cuiaDaFrente'],
      se('!flag:prof-conheceu', [
        ['emote', 'prof', '!'],
        f('prof', '{JOGADOR}! Bem na hora. Quer dizer, atrasado, mas na hora do atraso de sempre.\fPreciso de um favor que só dá para pedir a alguém de confiança.'),
        f('prof', 'Chegou às minhas mãos um ovo que eu nunca vi igual: o Ovo Pintado. Quem entende de ovo nesta costa é o Seu Aroeira, lá de Vila Caiçara.\fAlguém tem de levar o ovo até ele. Eu iria, mas se eu saio daqui o Juca mistura as amostras outra vez.'),
        f('prof', 'Só que a Trilha do Ipê é cheia de grama alta, e ninguém atravessa grama alta sozinho.\fEstá vendo as três cuias na mesa? Cada uma guarda uma criatura novinha, que eu mesma criei. Uma delas vai com você.'),
        f('prof', 'Chegue perto de cada cuia e examine. A criatura se apresenta sozinha — elas são exibidas.\fEscolha com calma. Pense bem: parceria é para a vida toda!'),
        ['flag', 'prof-conheceu'],
      ], [
        se('!flag:inicial', [
          se('flag:cuia-alguma', [['chamar', 'lab-cuias']], [f('prof', 'As três cuias estão na mesa: Mata à esquerda, Brasa no meio, Rio à direita.\fExamine cada uma de frente e escolha. Pense bem!')]),
        ], [
          se('!flag:ovo-no-aroeira', [f('prof', 'O Seu Aroeira mora em Vila Caiçara, ao norte, no fim da Trilha do Ipê. É a casa grande com cheiro de café.\fCuidado com o Ovo Pintado: nada de correr com ele debaixo do braço!')], [
            se('!flag:ovo-entregue', [['chamar', 'rival-1']], [
              se('!insignia:1', [f('prof', 'O Diário de Campo anota sozinho cada criatura que você encontra. As que você captura ganham ficha completa.\fO primeiro ginásio fica em Vila Caiçara. O Mestre Gaivota é do tipo Vento: Trovão e Pedra dão trabalho para ele.')], [
                se('!insignia:3', [f('prof', 'Insígnia no estojo e criatura bem cuidada: você está me saindo melhor que a encomenda!\fDepois de Bosque Alto, siga até Porto Sereia. A Capitã Marola, de lá, é quem entrega o Amuleto do Remo: a Costa do Sol continua pelo mar.')], [
                  f('prof', 'Três insígnias! Eu sabia que aquele atraso todo era só para tomar impulso.\fSão oito insígnias na Costa do Sol, e depois delas a Liga dos Guardiões, no Platô. Só Campeão da Liga embarca para o Sertão das Névoas.\fA última insígnia fica em Vila Buriti, onde trabalha a Drª Buriti, minha colega. Diga que eu mandei um abraço e que ela me deve um livro.'),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'lab-cuias',
    passos: [
      ['cuiaDaFrente'],
      se('flag:inicial', [f(null, 'As outras duas cuias continuam na mesa, esperando os seus treinadores.')], [
        se('!flag:prof-conheceu', [f(null, 'Três cuias de cabaça entalhada, com trançado de palha. Uma delas deu um pulinho.\fMelhor falar com a Profª Ipê antes de mexer.')], [
          se('flag:cuia-0', [['chamar', 'lab-cuia-mata']]),
          se('flag:cuia-1', [['chamar', 'lab-cuia-brasa']]),
          se('flag:cuia-2', [['chamar', 'lab-cuia-rio']]),
          se('!flag:cuia-alguma', [f(null, 'A mesa das três cuias. Para examinar uma delas, fique bem de frente para ela.')]),
        ]),
      ]),
    ],
  },
  cuia('lab-cuia-mata', 1, 'Tamanduí', 'Mata', 'inicial-mata', 'A cuia da esquerda se abre: é o Tamanduí, um tamanduá-mirim de pelagem de folhas!\fCalmo e carinhoso, abraça tudo o que vê. Criaturas do tipo Mata levam a melhor sobre Rio, Terra e Pedra.'),
  cuia('lab-cuia-brasa', 4, 'Guaraxim', 'Brasa', 'inicial-brasa', 'A cuia do meio se abre: é o Guaraxim, um filhote de lobo-guará com a crina em brasa!\fArisco e orgulhoso, esquenta a sala inteira. Criaturas do tipo Brasa levam a melhor sobre Mata, Geada, Inseto e Ferro.'),
  cuia('lab-cuia-rio', 7, 'Botinho', 'Rio', 'inicial-rio', 'A cuia da direita se abre: é o Botinho, um filhote de boto-cor-de-rosa!\fBrincalhão e esperto, já molhou o chão. Criaturas do tipo Rio levam a melhor sobre Brasa, Terra e Pedra.'),
  {
    id: 'lab-depois-da-escolha',
    passos: [
      f('prof', 'Olha só como vocês já se entenderam! Cuide bem dela: criatura feliz luta melhor e vai mais longe.\fSe ela se machucar, a sua mãe e qualquer Posto Guardião dão jeito de graça.'),
      f('prof', 'Agora, o favor. Aqui está o Ovo Pintado. Segure com as duas mãos!'),
      ['dar', 'ovo-pintado'],
      f(null, 'O ovo é morno e, de vez em quando, dá uma batidinha por dentro.'),
      ['flag', 'ovo-pintado'],
      f('prof', 'Leve ao Seu Aroeira, em Vila Caiçara: saia da vila pelo norte e siga a Trilha do Ipê até o fim.\fDepois volte aqui para me contar o que ele disse. Vou deixar um presente separado para você!'),
    ],
  },

  /* ============================== OVO PINTADO → SEU AROEIRA ============================== */
  {
    id: 'aroeira',
    passos: [
      se('flag:ovo-pintado&!flag:ovo-no-aroeira', [
        ['emote', 'aroeira', '!'],
        f('aroeira', 'Ora, ora! Visita da Vila Jacarandá — e trazendo ovo! Deixa eu ver isso de perto, com licença…'),
        f('aroeira', 'Hum. Casca pintadinha, morna, batendo por dentro… Menino, em sessenta anos de viveiro eu só vi dois assim.\fVêm de ninho de praia, enterrado na areia. Esse aqui tem história, e eu vou chocar ele com todo o capricho.'),
        ['tirar', 'ovo-pintado'], ['flag', 'ovo-no-aroeira'], ['flag', 'ovo-pintado', false],
        f(null, '{JOGADOR} entregou o Ovo Pintado ao Seu Aroeira.'),
        f('aroeira', 'Diga à Ipê que o ovo ficou em boas mãos e que, quando nascer, eu aviso pelo Rádio Cipó.\fE leve isto para a viagem de volta. Chá de erva-cidreira: bom para criatura e para gente.'),
        ['dar', 'cha-cidreira', 2],
        ['contato', 'seu-aroeira'],
        f('aroeira', 'Ah! E quando você tiver a insígnia do Mestre Gaivota, passe aqui de novo. Tenho um ensinamento antigo guardado para treinador de confiança.'),
      ], [
        se('!flag:ovo-no-aroeira', [f('aroeira', 'Bem-vindo ao viveiro! Aqui se choca ovo, se cria filhote e se serve café.\fNão repare na bagunça: é que o ninho da sala também é meu.')], [
          se('insignia:1&!flag:faro-missao', [['chamar', 'faro-pedido']], [
            se('flag:faro-missao&!flag:faro-ok', [['chamar', 'faro-volta']], [
              se('flag:faro-ok', [f('aroeira', 'O Faro só funciona com criatura que confia em você. Passeie com ela, cuide dela, e ela mostra o que o chão esconde.\fA Paçoca manda lembranças. Quer dizer, ela mandou um caroço. É o jeito dela.')], [
                f('aroeira', 'O Ovo Pintado está quietinho perto do fogão, batendo no compasso.\fVolte ao laboratório e conte à Ipê. E apareça quando tiver a Insígnia da Pena!'),
              ]),
            ]),
          ]),
        ]),
      ]),
    ],
  },

  /* ============================== RIVAL 1 + DIÁRIO DE CAMPO ============================== */
  {
    id: 'rival-1',
    passos: [
      se('!flag:rival-1', [
        ['emote', 'taina', '!'],
        ['virar', 'taina', 'o'],
        f('taina', 'Ah, olha quem voltou do passeio! {JOGADOR}, o entregador de ovo.'),
        f('prof', '{JOGADOR}, você conhece a Tainá, da casa do outro lado da rua. Ela também vai sair pelo mundo — e acabou de escolher a parceira dela.'),
        f('taina', 'Escolhi a que ganha da sua, é claro. Eu perguntei qual você tinha levado ANTES de escolher. Estratégia, meu bem.\fProfessora, posso testar? É rapidinho. Prometo não quebrar nada. Do laboratório.'),
        f('prof', 'Uma batalha de estreia? Só se for agora! Mas longe das minhas amostras!'),
        ...batalhaRival(1),
      ]),
      se('flag:rival-1', [
        se('flag:batalha-perdida', [f(TAINA, 'Ganhei! Eu disse que a minha já nasceu ganhando. Não fica assim, {JOGADOR}: perder para mim é quase um elogio.')]),
        f(TAINA, 'Tá bom, tá bom. Hoje foi só o começo. Mas eu vou conquistar as dezesseis insígnias antes de você decorar o caminho de Vila Caiçara!\fFui! Não me segue, que eu não gosto de plateia.'),
        ['esconder', 'taina'], ['esconder', 'taina-depois'],
        ['sfx', 'porta'],
        f('prof', 'Essa menina vai longe. Tomara que na direção certa.\fMas me conte: o Seu Aroeira ficou com o ovo? Ah, que alívio! Promessa é dívida: aqui estão os seus presentes.'),
        ['dar', 'diario-de-campo'],
        ['flag', 'diario'],
        f('prof', 'É o Diário de Campo. Ele anota sozinho cada criatura que você encontra e completa a ficha das que você captura.\fExistem 180 espécies em Pindorama. Eu registrei doze. Conto com você para as outras cento e sessenta e oito!'),
        ['dar', 'cuia', 5],
        f('prof', 'E estas são Cuias de Captura. Criatura selvagem cansada aceita melhor o convite: enfraqueça primeiro, arremesse depois.\fA cuia acolhe, não prende. Quem entra nela vira parceiro; e parceiro solto volta para casa quando quiser.'),
        ['flag', 'ovo-entregue'],
        f('prof', 'A Mateira Jurema está no começo da Trilha do Ipê. Peça a ela para mostrar como se captura — ela adora plateia.\fE procure o ginásio de Vila Caiçara: quem junta as dezesseis insígnias dos Guardiões pode desafiar o Conselho, lá no Pico Pindorama. Boa viagem, {JOGADOR}!'),
      ]),
    ],
  },

  /* ============================== TUTORIAL DE CAPTURA ============================== */
  {
    id: 'tutorial-chamada',
    passos: [
      ['emote', 'jurema', '!'],
      f('jurema', 'Ei, {JOGADOR}! Aqui! Cuia nova no cinto, é? Dá para ver de longe, você anda todo torto.'),
      ['chamar', 'tutorial-captura'],
    ],
  },
  {
    id: 'tutorial-captura',
    passos: [
      se('!flag:ovo-entregue', [f('jurema', 'Grama alta é casa de criatura selvagem. Entrou, pode aparecer uma a qualquer passo.\fSem cuia não se captura nada. Quando a Profª Ipê te der algumas, volta aqui que eu te ensino o pulo do gato.')], [
        se('!flag:tutorial-captura', [
          f('jurema', 'Capturar é fácil de explicar e difícil de fazer bonito. Escuta:\fUm: ache a criatura na grama alta. Dois: lute até a barra de vida dela ficar amarela ou vermelha, sem derrubar. Três: abra a MOCHILA, escolha a Cuia e arremesse.'),
          f('jurema', 'A cuia balança uma, duas, três vezes. Se fechar com um estalo, pronto: parceira nova no Diário de Campo.\fCriatura dormindo ou paralisada entra mais fácil. E de noite aparecem bichos que de dia nem dão as caras.'),
          f('jurema', 'Chega de conversa. Olha aquela moita mexendo… É uma Cotiazinha! Vai, é toda sua. Enfraquece e arremessa!'),
          ['flag', 'tutorial-captura'],
          ['selvagem', 13, 2, { tutorial: true }],
          f('jurema', 'Viu só? Com o tempo a mão acostuma. Toma mais duas cuias, por conta da aula.'),
          ['dar', 'cuia', 2],
          f('jurema', 'Vila Caiçara tem Venda: lá a cuia custa pouco e o conselho da Dona Cotinha sai de graça. Boa caçada — quer dizer, bom convite!'),
        ], [f('jurema', 'Lembrete da Jurema: enfraquecer, depois arremessar. E nunca arremesse cuia em criatura de outro treinador, que é falta de educação.')]),
      ]),
    ],
  },

  /* ============================== MISSÃO DO FARO (depois da insígnia 1) ============================== */
  {
    id: 'faro-chamada',
    passos: [
      ['sfx', 'radio'],
      f(null, 'O Rádio Cipó está chiando no seu bolso!'),
      f(AROEIRA, '…alô? Alô! {JOGADOR}? Aqui é o Aroeira. Soube da Insígnia da Pena — parabéns, menino!\fPasse no viveiro assim que puder. Tenho um ensinamento para você… e um probleminha de quatro patas.'),
    ],
  },
  {
    id: 'faro-pedido',
    passos: [
      f('aroeira', 'Chegou em boa hora! Lembra do ensinamento que eu prometi? Chama-se Faro.\fCriatura que confia no treinador fareja o que está escondido: fruto enterrado, concha na areia, pergaminho perdido. O chão de Pindorama é um baú.'),
      f('aroeira', 'Quem ia demonstrar era a Paçoca, minha Cotiazinha. Mas a danada farejou caju maduro e sumiu pelos Campos de Restinga, a leste da vila.\fEla gosta de se esconder em canto fechado de árvore, bem lá no fim dos campos, para o lado do nascente e do norte.'),
      f('aroeira', 'Traga a Paçoca de volta e o Amuleto do Faro é seu. Ela não morde. Quer dizer, morde caju.'),
      ['flag', 'faro-missao'],
    ],
  },
  {
    id: 'faro-pacoca',
    passos: [
      ['emote', 'pacoca', '!'],
      ['grito', 13],
      f(null, 'Uma Cotiazinha de lenço no pescoço, cercada de cascas de caju. Só pode ser a Paçoca!\fEla fareja a sua mão, reconhece o cheiro do viveiro e dá um pulo de alegria.'),
      ['emote', 'pacoca', 'coracao'],
      f(null, 'A Paçoca saiu disparada na direção de Vila Caiçara. Parece que ela sabe muito bem o caminho de casa.'),
      ['flag', 'faro-achou'],
      ['esconder', 'pacoca'],
    ],
  },
  {
    id: 'faro-volta',
    passos: [
      se('flag:faro-achou', [
        f('aroeira', 'A Paçoca chegou antes de você, de barriga cheia e sem um pingo de vergonha! Muito obrigado, {JOGADOR}.\fPromessa cumprida: estenda a mão.'),
        ['amuleto', 'faro'],
        ['flag', 'faro-ok'],
        f('aroeira', 'Com o Amuleto do Faro, a sua criatura avisa quando houver coisa escondida por perto: aparece um brilho no chão. Chegue junto e examine.\fSó funciona se ela gostar de você de verdade. Então trate bem, que amizade não se compra na Venda.'),
        f('aroeira', 'Agora siga para o leste, pelos mesmos campos, até a Mata dos Sabiás. Depois dela fica Bosque Alto, a cidade nas copas. Vá com o vento!'),
      ], [f('aroeira', 'Nada da Paçoca ainda? Ela se esconde nos Campos de Restinga, a leste daqui: procure um recanto fechado de árvores, lá no canto nordeste, perto da entrada da mata.')]),
    ],
  },

  /* ============================== RIVAL 2 (Bosque Alto) E RIVAL 3 (Porto Sereia) ============================== */
  {
    id: 'rival-2',
    passos: [
      se('!flag:rival-2', [
        ['emote', 'taina', '!'],
        ['virar', 'taina', 'o'],
        f('taina', 'Parado aí, {JOGADOR}! Eu vi você saindo do ginásio com cara de quem ganhou.'),
        ...batalhaRival(2),
      ]),
      se('flag:rival-2', [
        se('flag:batalha-perdida', [f(TAINA, 'Rá! Viu só? Treina mais, {JOGADOR}. Mas escuta, que isto é sério.')]),
        f(TAINA, 'Olha, vou te contar uma coisa, e não é para espalhar: vi uns sujeitos de macacão cor de ferrugem na Trilha dos Cipós.\fCarregavam gaiola. GAIOLA, {JOGADOR}. Quem é que põe criatura em gaiola?'),
        f(TAINA, 'Eles foram para os lados de Porto Sereia. Eu vou atrás. Você… faz o que quiser. Mas leva isto, que eu peguei duas sem querer.'),
        ['dar', 'cuia-rapida', 2],
        f(TAINA, 'Não é presente! É… excesso de bagagem. Tchau!'),
        ['esconder', 'taina'],
      ]),
    ],
  },
  {
    id: 'rival-3',
    passos: [
      se('!flag:rival-3', [
        ['emote', 'taina', '!'],
        ['virar', 'taina', 'o'],
        f('taina', '{JOGADOR}! Então foi VOCÊ que religou a Usina Velha? Eu cheguei lá e só achei capanga chorando e tomada funcionando.\fO guincho do cais voltou a descer canoa por sua causa. Antes de você zarpar, eu quero a minha revanche!'),
        ...batalhaRival(3),
      ]),
      se('flag:rival-3', [
        se('flag:batalha-perdida', [f(TAINA, 'Essa foi minha! Anota aí no seu Diário: "Tainá, espécie rara, invicta hoje".')]),
        f(TAINA, 'O tal Cartel Ferrugem não é brincadeira, {JOGADOR}. Ouvi um capanga dizer que a carga da Usina saiu de barco, para os lados da Ilha do Farol.\fEu vou remando atrás. Se você for também, não cola na minha canoa: eu gosto de espaço.'),
        ['dar', 'garrafada', 2],
        f(TAINA, 'Isso é para as suas criaturas, não para você. Elas lutaram bem. Você só apertou os botões.\fTe vejo na Cidade Coral. Ou no Farol. Ou não. Tanto faz!'),
        ['esconder', 'taina'],
      ]),
    ],
  },

  /* ============================== MISSÕES PARALELAS ============================== */
  /* 1 · O chapéu da Vó Zica (A1) */
  {
    id: 'm-chapeu',
    passos: [
      se('flag:m-chapeu-ok', [f('a1-zica', 'Chapéu na cabeça e cocada no tabuleiro: a vida voltou ao normal.\fPassa aqui quando quiser, que para você sempre sobra uma.')], [
        se('flag:m-chapeu-achou', [
          f('a1-zica', 'Meu chapéu de palha! Trinta anos comigo e nunca tinha ido tão longe sozinho.\fToma, meu bem: cocada de rapadura, receita de família. Dá uma energia que só vendo.'),
          ['tirar', 'chapeu-da-vo-zica'],
          ['dar', 'rapadura', 2],
          ['dar', 'cuia', 3],
          ['flag', 'm-chapeu-ok'],
        ], [
          f('a1-zica', 'Ai, {JOGADOR}, que vento! Levou meu chapéu de palha lá para as bandas do píer.\fMinhas pernas não descem mais aquela areia. Se você achar, eu faço uma cocada só para você.'),
          ['flag', 'm-chapeu'],
        ]),
      ]),
    ],
  },
  {
    id: 'm-chapeu-pier',
    passos: [
      se('flag:m-chapeu&!flag:m-chapeu-achou', [
        f(null, 'Um chapéu de palha enganchado no cabeço de amarração! Está um pouco salgado, mas inteiro.'),
        ['dar', 'chapeu-da-vo-zica'],
        ['flag', 'm-chapeu-achou'],
      ], [f(null, 'Um cabeço de amarração. A corda cheira a maresia e a peixe de ontem.')]),
    ],
  },
  /* 2 · A joaninha da Bela (A2) */
  {
    id: 'm-pintinhas',
    passos: [
      se('flag:m-pintinhas-ok', [f('a2-pintinhas', 'Desenhei a Pintinhas no meu caderno. Contei as pintas: sete de cada lado e uma de sobra, no nariz.')], [
        ['temEspecie', 27, 'tem-pintinhas'],
        se('flag:tem-pintinhas', [
          ['emote', 'a2-pintinhas', 'coracao'],
          f('a2-pintinhas', 'É UMA PINTINHAS! De verdade! Ela é mais bonita que a da figurinha!\fObrigada, obrigada! Toma, meu pai faz estas cuias com mel. Criatura que entra nela fica amiga mais depressa.'),
          ['dar', 'cuia-mel', 3],
          ['flag', 'm-pintinhas-ok'],
        ], [
          f('a2-pintinhas', 'Você viaja, né? Então me faz um favor: eu queria MUITO ver uma Pintinhas de perto. É uma joaninha de todas as cores.\fDizem que ela cai dos cajueiros dos Campos de Restinga, mas só de dia. Se pegar uma, traz na equipe para eu ver?'),
          ['flag', 'm-pintinhas'],
        ]),
      ]),
    ],
  },
  /* a Vara Velha do Pescador Raimundo (A2) */
  {
    id: 'pescador-vara',
    passos: [
      se('flag:vara-velha-ok', [f('a2-pescador', 'Fique de frente para a água e use a vara. Quando a boia afundar, puxe sem dó!\fCom Vara Velha só vem peixe miúdo. Mas peixe miúdo também cresce.')], [
        f('a2-pescador', 'Gosta de pescar? Não? É porque nunca pescou. Toma: esta vara me acompanhou a vida toda, mas meu braço cansou antes dela.'),
        ['dar', 'vara-velha'],
        ['flag', 'vara-velha-ok'],
        f('a2-pescador', 'É a Vara Velha. Fique de frente para qualquer água, use a vara e espere a fisgada.\fCada água tem o seu peixe. E cada peixe, a sua história — mas essa parte é por minha conta.'),
      ]),
    ],
  },
  /* 3 · A carta do Dudu (A1 → A4 → A1) */
  {
    id: 'm-carta',
    passos: [
      se('flag:m-carta-ok', [f('a1-neto', 'Li a resposta do meu pai umas dez vezes. Ele disse que volta no próximo saveiro!\fA vó já está fazendo cocada para a chegada. Vai sobrar para você, pode deixar.')], [
        se('flag:m-carta-resposta', [
          f('a1-neto', 'Uma resposta do meu pai?! Me dá, me dá! …Ele escreveu que está com saudade e que trouxe um presente de além-mar.\fVocê atravessou a costa inteira por causa de uma carta. Fica com isto: achei na praia e nunca soube usar.'),
          ['tirar', 'resposta-do-barto'],
          ['dar', 'pt-16'],
          ['flag', 'm-carta-ok'],
        ], [
          se('flag:m-carta', [f('a1-neto', 'Meu pai é o Marinheiro Bartô. Ele vive no cais de Porto Sereia, bem lá na ponta, olhando o mar.\fÉ longe: depois de Bosque Alto e da Gruta do Eco. Sem pressa — carta boa não azeda.')], [
            se('!flag:inicial', [f('a1-neto', 'Um dia eu vou a Porto Sereia visitar meu pai. Ele é marinheiro!\fMas a vó não deixa eu pisar na grama alta sem criatura.')], [
              f('a1-neto', 'Você vai viajar com a sua criatura? Então você pode ir aonde eu não posso!\fMeu pai é o Marinheiro Bartô, do cais de Porto Sereia. Escrevi uma carta para ele faz um mês e não tenho como mandar. Você leva?'),
              ['dar', 'carta-do-dudu'],
              ['flag', 'm-carta'],
            ]),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'm-carta-barto',
    passos: [
      se('flag:m-carta&!flag:m-carta-resposta', [
        ['emote', 'a4-marinheiro', '!'],
        f('a4-marinheiro', 'Carta? Para mim? Da Vila Jacarandá?! …É a letra do meu Dudu. Olha o tamanho desse "papai"!\fEspera. Espera aí, que homem do mar não chora, só marejou.'),
        f('a4-marinheiro', 'Vou responder agora mesmo. Pronto. Leve de volta para ele, por favor: diga que eu chego no próximo saveiro.\fE fique com isto pela viagem. Quem carrega carta merece carregar coisa boa.'),
        ['tirar', 'carta-do-dudu'],
        ['dar', 'cuia-rede', 5],
        ['dar', 'resposta-do-barto'],
        ['flag', 'm-carta-resposta'],
      ], [
        se('flag:m-carta-resposta', [f('a4-marinheiro', 'Entregou a resposta ao Dudu? Aquele menino escreve melhor que eu navego.\fQuando tiver o Remo, lembre: o cais é a porta da Baía Azul.')], [
          f('a4-marinheiro', 'Daqui do cais eu vejo a Baía Azul inteira. Lá longe, quando o tempo abre, pisca o Farol.\fTenho um filho em Vila Jacarandá. Faz tempo que não chega notícia de lá.'),
        ]),
      ]),
    ],
  },
  /* 4 · O menino perdido na Mata dos Sabiás (A-MS → A3) */
  {
    id: 'm-perdido',
    passos: [
      se('flag:m-perdido', [f('a-ms-perdido', 'Avisou a minha mãe? Ela mora na primeira casa de Bosque Alto, no alto, à esquerda.\fEu espero aqui. Já fiz amizade com um Quatinho. Ele rouba minha merenda, mas é amizade.')], [
        ['emote', 'a-ms-perdido', '!'],
        f('a-ms-perdido', 'GENTE! Uma pessoa! Eu entrei na mata atrás de um Saguinho e agora toda árvore é igual!\fEu sou o Nico, de Bosque Alto. Não consigo sair daqui, e se eu andar mais eu me perco pior.'),
        f('a-ms-perdido', 'Você avisa a minha mãe? Dona Graúna, a primeira casa lá no alto da cidade. Diz que eu estou bem, só… geograficamente confuso.'),
        ['flag', 'm-perdido'],
      ]),
    ],
  },
  {
    id: 'm-perdido-mae',
    passos: [
      se('flag:m-perdido-ok', [f('a3-grauna', 'O Nico está de castigo: uma semana sem estilingue e com aula de mapa todo dia.\fObrigada de novo, {JOGADOR}. Mãe nenhuma esquece um favor desses.')], [
        se('flag:m-perdido', [
          ['emote', 'a3-grauna', '!'],
          f('a3-grauna', 'O Nico?! Na Mata dos Sabiás?! Aquele menino me mata do coração e depois pede merenda!\fPai! PAI! Pega a lanterna e a corda, que o seu neto resolveu virar explorador!'),
          ['fade', 'fora'], ['esperar', 600], ['fade', 'dentro'],
          f('a3-grauna', 'Pronto: o avô já trouxe o fujão de volta, com um Quatinho pendurado na mochila. Agora são dois para dar banho.\fVocê foi um anjo. Aceite isto — era do tempo em que eu também corria atrás de criatura.'),
          ['dar', 'cuia-noturna', 3],
          ['dar', 'garrafada'],
          ['flag', 'm-perdido-ok'],
        ], [f('a3-grauna', 'Você viu um menino de estilingue por aí? O Nico saiu cedo "para ver um macaquinho" e até agora nada.\fSe ele estiver na Mata dos Sabiás de novo, eu juro que amarro um sino nele.')]),
      ]),
    ],
  },
  /* 5 · A ponte de corda do Mestre Imbuia (A3) */
  {
    id: 'm-ponte',
    passos: [
      se('flag:m-ponte-ok', [f('a3-imbuia', 'Firme como promessa de mãe! Pode atravessar sem medo.\fA casa-da-árvore tem canteiro de terra boa. O que você plantar lá, cresce cantando.')], [
        ['temItens', 'corda-de-cipo', 3, 'tem-cordas'],
        se('flag:tem-cordas', [
          f('a3-imbuia', 'Isso aí no seu cinto é Corda de Cipó? Três rolos?! Criatura, você caiu do céu — e sem precisar de ponte!'),
          ['simnao', 'Entregar 3 Cordas de Cipó ao Mestre Imbuia?', 'ponte-sim'],
          se('flag:ponte-sim', [
            ['tirar', 'corda-de-cipo', 3],
            f('a3-imbuia', 'Segura a ponta ali. Não, a outra. A OUTRA. Deixa, eu faço.'),
            ['fade', 'fora'], ['sfx', 'empurrar'], ['esperar', 500], ['sfx', 'empurrar'], ['esperar', 500], ['fade', 'dentro'],
            ['flag', 'm-ponte-ok'],
            f('a3-imbuia', 'Pronto! Ponte nova, nó de marinheiro e tábua de lei. A casa-da-árvore é sua para visitar quando quiser.\fTem coisa boa lá em cima que ninguém buscou desde que a ponte caiu.'),
          ], [f('a3-imbuia', 'Tudo bem, corda boa a gente não larga fácil. Mas se mudar de ideia, a ponte agradece.')]),
        ], [
          f('a3-imbuia', 'Está vendo essa ponte? Pois é. Nem eu. Arrebentou na última chuva e lá se foi o caminho da casa-da-árvore.\fTábua eu tenho. Falta corda: três rolos de Corda de Cipó, dos bons. A Venda do Galho vende, mas meu dinheiro foi todo em prego.'),
          ['flag', 'm-ponte'],
        ]),
      ]),
    ],
  },
  /* 6 · O morcego Eco (A-GE) */
  {
    id: 'm-eco',
    passos: [
      se('flag:m-eco-ok', [f('a-ge-espeleologa', 'O Eco está dormindo de cabeça para baixo no meu capacete. Não se mexe por nada.\fA galeria alta, atrás da rocha rachada, eu ainda mapeio um dia. Quando alguém quebrar a rocha.')], [
        se('flag:m-eco-achou', [
          f('a-ge-espeleologa', 'ECO! Seu fujão de asa! …Ele voltou sozinho e ficou me olhando com cara de quem foi encontrado.\fFoi você, não foi? Tome: copiei este pergaminho de uma inscrição da gruta. Ensina criatura a voar em bando.'),
          ['dar', 'pt-32'],
          ['flag', 'm-eco-ok'],
        ], [
          f('a-ge-espeleologa', 'Psiu… você viu um Morceguim com uma fitinha azul na pata? É o Eco, meu ajudante de mapeamento.\fEle se assustou com um desmoronamento e voou para o fundo da gruta, para lá do rio. Eu não posso largar os instrumentos aqui.'),
          f('a-ge-espeleologa', 'Se você atravessar a segunda ponte ou contornar o lago, deve achar o salão do fundo. Ele gosta de canto escuro e sem saída.'),
          ['flag', 'm-eco'],
        ]),
      ]),
    ],
  },
  {
    id: 'm-eco-morcego',
    passos: [
      ['grito', 30],
      ['emote', 'eco', '!'],
      f(null, 'Um Morceguim de fitinha azul na pata, encolhido no canto. É o Eco!\fVocê estende a mão devagar. Ele cheira, pisca… e levanta voo na direção da ponte.'),
      ['flag', 'm-eco-achou'],
      ['esconder', 'eco'],
    ],
  },
  /* 7 · O peixe de bigode do Feirante Deodato (A4) */
  {
    id: 'm-peixe',
    passos: [
      se('flag:m-peixe-ok', [f('a4-feirante', 'A Vara Boa alcança o fundo, onde mora o peixe graúdo. Experimente no cais e no Riacho da Piaba.\fE se pescar coisa esquisita, traga para eu ver. Eu não compro: eu admiro.')], [
        ['temEspecie', 39, 'tem-mandi'],
        se('flag:tem-mandi', [
          ['emote', 'a4-feirante', '!'],
          f('a4-feirante', 'Um Mandizinho! Olha o bigode! Olha o BIGODE! Trinta anos de feira e eu só tinha visto em gravura.\fNão, não, eu não quero comprar — isso é parceiro, não é mercadoria. Só queria ver. Promessa é promessa: a vara é sua.'),
          ['dar', 'vara-boa'],
          ['flag', 'm-peixe-ok'],
        ], [
          f('a4-feirante', 'Freguês, você tem cara de quem anda por gruta. Já viu um Mandizinho? Bagre de bigode, mora no escuro, na água da Gruta do Eco.\fSe um dia tiver um na equipe, traga para eu conhecer. Dou em troca uma Vara Boa, de bambu-mestre.'),
          ['flag', 'm-peixe'],
        ]),
      ]),
    ],
  },
];
