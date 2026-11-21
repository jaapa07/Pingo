/**
 * A SEQUÊNCIA FINAL do Pico Pingorama (time B2-norte; spec 4.5, 5, 7A e 9.3; docs/HISTORIA.md).
 *  - `pp-tibirica`: o guardião do Portão dos Guardiões (o portão em si é `insignias:16` na zona PP).
 *  - `pp-garrote`: o Coronel Garrote acorrentou a porta do Salão; vencê-lo marca `garrote-vencido` (derrota = Posto).
 *  - `pp-rival-8`: a Tainá na porta do Salão (`rival-8`, vença ou perca).
 *  - `conselho-entrada` (porta sem volta) → `conselho-1`…`conselho-4` → `conselho-5` (Guardião-Mor Arandu) →
 *    `conselho-vitoria`: Sala da Memória, créditos (tela `creditos`), `conselho-vencido` + `pos-jogo`, errantes Lobo-Jaci e
 *    Onça-Guaraci, aviso do Rádio Cipó e o andarilho do Cume (`misterioso-pode`). Revanche: a porta reabre depois.
 *  - Derrota em qualquer sala: `conselho-derrota` leva ao Portão dos Guardiões e zera `conselho-1`…`conselho-4`.
 */
import type { EventoDef, Comando } from '../../core/tipos';
import './comuns';

const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const f = (quem: unknown, texto: string): Comando => ['falar', quem, texto];
const TAINA = { nome: 'Tainá', retrato: 'taina' };
const GARROTE = { nome: 'Coronel Garrote', retrato: 'coronel-garrote' };
const ARANDU = { nome: 'Guardião-Mor Arandu', retrato: 'guardiao-arandu' };
const RADIO = { nome: 'Rádio Cipó' };
const ESPERA = { nome: 'Guardiã da Sala de Espera' };
/** Portão dos Guardiões, do lado de dentro (o Posto do acampamento fica logo abaixo) */
export const PORTAO_DOS_GUARDIOES: [number, number] = [19, 41];
const zerar: Comando[] = [['flag', 'conselho-em-curso', false], ['flag', 'conselho-1', false], ['flag', 'conselho-2', false], ['flag', 'conselho-3', false], ['flag', 'conselho-4', false]];

/** sala de um Guardião: luta (a derrota leva ao Portão), porta seguinte e conselho para a próxima */
const sala = (n: 1 | 2 | 3 | 4, npc: string, antes: string, depois: string, jaVenceu: string): EventoDef => ({
  id: `conselho-${n}`,
  passos: [
    se(`flag:conselho-${n}`, [f(npc, jaVenceu)], [
      f(npc, antes),
      ['batalha', `conselho-${n}`, { segue: true, semMarca: true }],
      se('flag:batalha-perdida', [['chamar', 'conselho-derrota']], [
        ['flag', `conselho-${n}`],
        ['sfx', 'porta'],
        f(npc, depois),
        f(null, 'A porta ao norte se abriu. No Salão ninguém cura de graça: se precisar, use os remédios da mochila antes de seguir.'),
      ]),
    ]),
  ],
});
const batalhaRival8: Comando[] = [
  se('flag:inicial-mata', [['batalha', 'rival-8-brasa', { segue: true }]]),
  se('flag:inicial-brasa', [['batalha', 'rival-8-rio', { segue: true }]]),
  se('flag:inicial-rio', [['batalha', 'rival-8-mata', { segue: true }]]),
  se('!flag:inicial-mata&!flag:inicial-brasa&!flag:inicial-rio', [['batalha', 'rival-8-brasa', { segue: true }]]),
];

export const EVENTOS_CONSELHO: EventoDef[] = [
  /* ============================== PORTÃO DOS GUARDIÕES ============================== */
  {
    id: 'pp-tibirica',
    passos: [
      se('pos-jogo', [
        f('pp-tibirica', 'Os Guardiões falam de você com a voz baixa que se usa para os antigos, {JOGADOR}. O Salão continua aberto para quem quiser medir forças de novo.\fE dizem que, a cada vitória sua, um andarilho sobe até a pedra do Cume. Ninguém sabe de onde ele vem.'),
      ], [
        f('pp-tibirica', 'Dezesseis insígnias. O portão reconheceu você antes de mim.\fLá em cima fica o Salão do Conselho: cinco Guardiões, cinco lutas, nenhuma porta de volta. Deixei uma oferenda na saída do portão: dois Elixires e dois Chás de Guaraná. Leve.'),
        se('!flag:garrote-vencido', [f('pp-tibirica', 'Mais uma coisa. Hoje cedo passou um homem de chapéu de couro e botas de ferro, com dois capangas. Disse que vinha "fazer negócio com o Conselho". O Conselho não faz negócio. Tome cuidado no Cume.')]),
      ]),
    ],
  },

  /* ============================== CORONEL GARROTE ============================== */
  {
    id: 'pp-garrote',
    passos: [
      se('!flag:garrote-vencido', [
        ['musica', 'cartel-tema'],
        ['emote', 'pp-garrote', '!'],
        f(GARROTE, 'Ora, ora. O herói das dezesseis insígnias. A Usina, o Farol, o Pantanal, a Mina, o Laboratório… sempre você.\fSabe por que eu subi até aqui? Porque o Salão do Conselho guarda as criaturas mais antigas de Pingorama. Com uma delas numa gaiola, o Cartel Ferrugem nunca mais precisa de usina nenhuma.'),
        f(GARROTE, 'Acorrentei as argolas da porta. Os velhos lá dentro vão negociar comigo ou não saem mais.\fE você? Vai sair do meu caminho ou vai ser o último bicho da minha coleção?'),
        ['batalha', 'garrote'],
        ['flag', 'garrote-vencido'],
        ['musica', 'pico'],
        f(GARROTE, 'Perdi… para um moleque com um Diário de Campo e uma mochila de remédio.'),
        ['tremor', 400],
        f(null, 'As portas de pedra do Salão se abrem por dentro, com corrente e tudo. Quatro Guardiões descem a escada em silêncio.'),
        f({ nome: 'Guardião Moacir', retrato: 'guardiao-moacir' }, 'Garrote. A montanha avisou que você vinha. A montanha também avisou quem vinha atrás de você.'),
        f({ nome: 'Guardiã Iara Costa', retrato: 'guardia-iara' }, 'As criaturas que o Cartel prendeu nesses anos todos já voltaram para os rios, os ninhos e as matas. Só falta você voltar para a planície — e responder pelo que fez.'),
        f(GARROTE, '…O Cartel Ferrugem acabou. Mas o mundo é grande, Guardiã.'),
        ['fade', 'fora'],
        ['esconder', 'pp-garrote'],
        ['fade', 'dentro'],
        f({ nome: 'Guardiã Jandaia', retrato: 'guardia-jandaia' }, 'Os Guardiões da planície levaram o Coronel. As correntes ficaram no chão, onde é o lugar delas.\fNós voltamos para as nossas salas, {JOGADOR}. Quando estiver pronto, a porta está aberta. Lá dentro não se volta atrás.'),
        ['sfx', 'radio'],
        f(RADIO, '"Edição extraordinária do Rádio Cipó! O Coronel Garrote, chefe do Cartel Ferrugem, foi preso no Pico Pingorama! Os Guardiões confirmam: o Cartel acabou. Os pesquisadores dos dois mapas comemoram — e a Drª Buriti mandou dizer que vai dormir oito horas seguidas pela primeira vez em anos!"'),
        ['salvar'],
      ]),
    ],
  },

  /* ============================== RIVAL 8 ============================== */
  {
    id: 'pp-rival-8',
    passos: [
      se('!flag:rival-8', [
        ['emote', 'pp-taina', '!'],
        f(TAINA, '{JOGADOR}! Espera! Eu subi a trilha correndo desde a Serra da Geada!\fEu tenho as dezesseis também, sabia? Ganhei a última ontem. Mas eu não vou entrar antes de você. Não seria justo… e eu quero ver a sua cara quando você sair.'),
        ...batalhaRival8,
      ]),
      se('flag:rival-8', [
        se('flag:batalha-perdida', [f(TAINA, 'Ganhei! Ganhei na porta do Conselho! …Mas olha a sua equipe: cansada e sorrindo. Vai, descansa no Posto e volta. Eu espero o resultado aqui fora.')], [
          f(TAINA, 'Desde aquele dia no laboratório, cada vez que eu perdia para você eu ficava mais forte. Acho que foi o melhor presente que você me deu.'),
        ]),
        f(TAINA, 'Entra lá, Campeão da Costa e do Sertão. E quando sair, a gente vai juntos pescar na Lagoa Gelada. Eu pago o pinhão.'),
        ['esconder', 'pp-taina'],
      ]),
    ],
  },

  /* ============================== CONSELHO DOS GUARDIÕES ============================== */
  {
    id: 'conselho-entrada',
    passos: [
      f(ESPERA, 'Desafiante! Daqui para dentro é o Conselho dos Guardiões: a Guardiã do Mar, o Guardião da Mata, a Guardiã do Céu, o Guardião da Terra e o Guardião-Mor.\fA porta fecha às suas costas. Ninguém cura de graça lá dentro, só o que couber na sua mochila. Se a sua equipe cair, os Guardiões levam você de volta ao Portão, e o Conselho recomeça da primeira sala.'),
      ['simnao', 'Entrar no Salão do Conselho agora? (Não há volta.)', 'conselho-entrar'],
      se('flag:conselho-entrar', [
        ['mover', 'jogador', ['n', 'n']],
        ...zerar.slice(1),
        ['flag', 'conselho-em-curso'],
        ['sfx', 'porta'],
        ['musica', 'pico'],
        f(null, 'A porta de pedra fechou. Na sala de espera, a luz entra pelas frestas do teto como se fosse água.'),
      ], [
        f(ESPERA, 'Sem pressa. O Posto do acampamento fica logo abaixo do Portão. Volte quando estiver pronto.'),
        ['mover', 'jogador', ['s']],
      ]),
    ],
  },
  {
    id: 'conselho-recepcao',
    passos: [
      f('conselho-recepcao', 'Esta é a sala de espera. Olhe a equipe e a mochila com calma: daqui para cima, cada sala é uma luta.\fPrimeira sala: Iara Costa, Rio e Encanto. Segunda: Cauã, Mata e Inseto. Terceira: Jandaia, Vento e Trovão. Quarta: Moacir, Terra, Pedra e Ferro.'),
      f('conselho-recepcao', 'Na quinta sala está o Guardião-Mor Arandu. Ele luta com um pouco de tudo, e guarda para o fim uma criatura que só se vê nas histórias.\fBoa sorte. Pingorama inteira está ouvindo os seus passos.'),
    ],
  },
  sala(1, 'guardia-iara',
    'Chegou molhado de névoa. Bom: a água gosta de quem já está molhado.',
    'O Cauã luta com a mata inteira: raiz, casco e asa. Fogo e vento abrem caminho, mas ele tem casca grossa para isso.',
    'Já me venceu, desafiante. A porta está aberta: a mata do Cauã espera.'),
  sala(2, 'guardiao-caua',
    'Pisou na minha sala sem quebrar um galho. Já é um bom começo.',
    'A Jandaia manda no céu. Pedra e Geada derrubam o que voa; Terra só não alcança quem está no alto.',
    'A mata já abriu caminho. Siga para o céu.'),
  sala(3, 'guardia-jandaia',
    'Ventou lá fora quando você abriu a porta. O céu gosta de você. Eu ainda não decidi.',
    'O Moacir é a montanha. Água e raiz amolecem a pedra; e Brasa entorta o ferro dele — mas ele tem resposta para quase tudo.',
    'O céu está limpo para você. A terra espera na próxima sala.'),
  sala(4, 'guardiao-moacir',
    'Quatro salas, e você ainda caminha. A pedra respeita quem caminha.',
    'Atrás daquela porta está o Arandu. Ele não tem um tipo: tem a memória de todos. E guarda o gavião do trovão para o fim.',
    'A terra já tremeu por você. Vá: o Guardião-Mor não gosta de esperar.'),
  {
    id: 'conselho-5',
    passos: [
      f('guardiao-arandu', 'Entre, {JOGADOR}. Sente no chão um instante: aqui o chão é a coisa mais alta de Pingorama.\fQuatro Guardiões abriram as portas para você. Eu sou a última porta. E a última porta é sempre a que mais pesa.'),
      ['batalha', 'conselho-5', { segue: true, semMarca: true }],
      se('flag:batalha-perdida', [
        f('guardiao-arandu', 'Ainda não. Mas eu vi a sua equipe se colocar na sua frente, uma depois da outra. Isso é o que o Conselho procura.\fDesça, descanse e volte. A montanha não sai daqui.'),
        ['chamar', 'conselho-derrota'],
      ], [['chamar', 'conselho-vitoria']]),
    ],
  },
  {
    id: 'conselho-derrota',
    passos: [
      ['fade', 'fora'],
      ...zerar,
      ['warp', 'PP', PORTAO_DOS_GUARDIOES[0], PORTAO_DOS_GUARDIOES[1], 's'],
      ['fade', 'dentro'],
      f(null, 'Os Guardiões trouxeram você de volta ao Portão dos Guardiões e cuidaram da sua equipe.\fO Conselho recomeça da primeira sala. O Posto do acampamento fica logo depois do portão, se quiser reforçar a mochila.'),
    ],
  },
  {
    id: 'conselho-vitoria',
    passos: [
      ['musica', 'vitoria-lider'],
      ['flag', 'conselho-memoria'],
      se('flag:conselho-vencido', [
        // revanche: sem créditos; o andarilho do Cume volta
        f(ARANDU, 'De novo, {JOGADOR}. E melhor que da primeira vez. O Marco da Memória ganha mais um risco ao lado do seu nome.'),
        ['curar'],
        ['flag', 'misterioso-pode'],
        f(ARANDU, 'Dizem que o andarilho voltou a subir até a pedra do Cume. Ele sempre aparece depois que alguém nos vence. Vá ver.'),
      ], [
        f(ARANDU, 'Venha comigo. Há uma sala acima desta onde só entra quem o Conselho reconhece.'),
        ['fade', 'fora'],
        ['warp', 'PP-conselho', 14, 3, 'n'],
        ['fade', 'dentro'],
        ['sfx', 'insignia'],
        f(ARANDU, 'Este é o Marco da Memória. Cada nome aqui é de alguém que subiu por todos: pelos bichos dos rios, das matas, dos céus e das pedras.\fHoje o Marco ganha o seu nome, {JOGADOR}, e os nomes da sua equipe ao lado dele. A Costa do Sol e o Sertão das Névoas têm um Guardião novo.'),
        ['tela', 'creditos'],
        ['flag', 'conselho-vencido'],
        ['flag', 'pos-jogo'],
        ['flag', 'misterioso-pode'],
        ['curar'],
        f(null, 'Os Guardiões cuidaram da sua equipe: todas de pé, descansadas e orgulhosas.'),
        f(ARANDU, 'Agora as portas que estavam fechadas se abrem. A Guardiã da Floresta, no Planalto Lume, já sabe que você vem: a Floresta Ancestral vai receber você.\fE sente o chão? Duas criaturas que só andam pela terra depois que o Conselho reconhece alguém acabaram de acordar: o lobo da lua e a onça do sol. Elas vão vagar pelos dois mapas.'),
        ['errante', 179, 77],
        ['errante', 180, 77],
        ['sfx', 'radio'],
        f(RADIO, '"Atenção, Pingorama! O Rádio Cipó interrompe tudo — até a moda de viola — para anunciar: {JOGADOR}, de Vila Jacarandá, venceu o Conselho dos Guardiões no Pico Pingorama!\fA Profª Ipê chorou no microfone, a mãe já está fazendo bolo e a Tainá mandou dizer que vem buscar o título semana que vem. Parabéns, Guardião!"'),
      ]),
      ...zerar,
      ['flag', 'conselho-memoria', false],
      ['fade', 'fora'],
      ['warp', 'PP', 20, 7, 's'],
      ['fade', 'dentro'],
      ['salvar'],
    ],
  },
];
export default EVENTOS_CONSELHO;
