/**
 * LIGA DOS GUARDIÕES (Platô da Liga, A-LG) e Vila Buriti — eventos do time A1 (spec 4.5 e 5; docs/HISTORIA.md).
 * Sequência: `liga-entrada` (porta sem volta) → `liga-1`…`liga-4` (Mestres) → `liga-5` (Campeão) → `liga-vitoria`
 * (Hall da Fama, `liga-vencida`, Passe do Trem, Bilhete do Saveiro, pedra de evolução, aviso do Rádio Cipó) → `rival-5`.
 * Derrota em qualquer sala: `liga-derrota` devolve ao terreiro e zera `liga-1`…`liga-4` (a Liga recomeça do 1º Mestre).
 * Comandos extras: ['hallDaFama'] / ['hallFim'] — painel com a equipe campeã no alto da tela.
 */
import type { EventoDef, Comando } from '../../core/tipos';
import { jogo } from '../../core/estado';
import { registrarComando } from '../../world/registro';
import { LIGA_ENTRADA } from '../zonas/A-LG';
import './comuns';

let hall: { el: HTMLElement; parar: () => void } | null = null;
function fecharHall() { if (hall) { hall.parar(); hall.el.remove(); hall = null; } }
registrarComando('hallFim', () => fecharHall());
registrarComando('hallDaFama', async () => {
  fecharHall();
  if (typeof document === 'undefined') return;
  const [{ Sprite }, { telas }, { ESPECIES }, { texto }] = await Promise.all([import('../../render/sprite'), import('../../ui/telas'), import('../criaturas'), import('../../ui/fonte')]);
  if (!telas.raiz) return;
  const el = document.createElement('div');
  el.className = 'hall-da-fama';
  el.style.cssText = 'position:absolute;left:10px;top:6px;width:300px;height:104px;z-index:60;background:#141026;box-shadow:0 0 0 2px #f2c230,0 0 0 4px #141026;overflow:hidden';
  const pos = (e: HTMLElement, x: number, y: number) => { e.style.position = 'absolute'; e.style.left = x + 'px'; e.style.top = y + 'px'; return e; };
  el.append(pos(texto('HALL DA FAMA', { tamanho: 12, cor: 'creme', largura: 300, alinhar: 'centro' }), 0, 6));
  el.append(pos(texto(`Campeão da Costa do Sol: ${jogo.save.jogador.nome}`, { cor: 'creme', largura: 300, alinhar: 'centro' }), 0, 22));
  const equipe = jogo.save.equipe.filter((c) => !c.ovo).slice(0, 6), passo = 48, x0 = 150 - ((equipe.length - 1) * passo) / 2;
  const sprites = equipe.map((c, i) => {
    const esp = ESPECIES.find((e) => e.num === c.especie);
    const cx = Math.round(x0 + i * passo);
    const pedestal = document.createElement('div');
    pedestal.style.cssText = `position:absolute;left:${cx - 16}px;top:74px;width:32px;height:6px;background:#f2c230;box-shadow:0 2px 0 #a0522d`;
    el.append(pedestal);
    el.append(pos(texto(`${(c.apelido ?? esp?.nome ?? '').slice(0, 7)}`, { cor: 'creme', largura: 46, alinhar: 'centro' }), cx - 23, 84));
    el.append(pos(texto(`Nv${c.nivel}`, { cor: 'creme', largura: 46, alinhar: 'centro' }), cx - 23, 93));
    const s = new Sprite(esp?.id ?? '', 'mapa', el);
    s.x = cx; s.y = 72; s.tocar(s.tem('idle-s') ? 'idle-s' : 'andar-s');
    return s;
  });
  telas.raiz.append(el);
  let vivo = true, antes = performance.now();
  const quadro = (agora: number) => { if (!vivo) return; const dt = Math.min(0.1, (agora - antes) / 1000); antes = agora; for (const s of sprites) { s.atualizar(dt); s.desenhar(); } requestAnimationFrame(quadro); };
  for (const s of sprites) s.desenhar();
  requestAnimationFrame(quadro);
  hall = { el, parar: () => { vivo = false; } };
});

const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const f = (quem: unknown, texto: string): Comando => ['falar', quem, texto];
const TAINA = { nome: 'Tainá', retrato: 'taina' };
const RADIO = { nome: 'Rádio Cipó' };
const zerar: Comando[] = [['flag', 'liga-em-curso', false], ['flag', 'liga-1', false], ['flag', 'liga-2', false], ['flag', 'liga-3', false], ['flag', 'liga-4', false]];

/** sala de um Mestre: luta (a derrota recomeça a Liga), porta seguinte e conselho */
const sala = (n: 1 | 2 | 3 | 4, npc: string, antes: string, depois: string, jaVenceu: string): EventoDef => ({
  id: `liga-${n}`,
  passos: [
    se(`flag:liga-${n}`, [f(npc, jaVenceu)], [
      f(npc, antes),
      ['batalha', `liga-${n}`, { segue: true, semMarca: true }],
      se('flag:batalha-perdida', [['chamar', 'liga-derrota']], [
        ['flag', `liga-${n}`],
        ['sfx', 'porta'],
        f(npc, depois),
        f(null, 'A porta ao norte se abriu. Aqui dentro ninguém cura de graça: se precisar, use os itens da mochila antes de seguir.'),
      ]),
    ]),
  ],
});

export const EVENTOS_LIGA: EventoDef[] = [
  {
    id: 'liga-entrada',
    passos: [
      se('flag:liga-vencida', [
        f(null, 'Uma faixa na porta: "A Liga descansa. O Campeão {JOGADOR} já passou por aqui."\fRevanches com os Mestres, só com hora marcada pelo Rádio Cipó.'),
        ['mover', 'jogador', ['s']],
      ], [
        f({ nome: 'Guardiã da Sala de Espera' }, 'Desafiante! Daqui para dentro é a Liga dos Guardiões: quatro Mestres e o Campeão, um atrás do outro.\fA porta tranca às suas costas. Não há cura lá dentro, só o que você levar na mochila. Se a sua equipe cair, você volta para este terreiro e recomeça do primeiro Mestre.'),
        ['simnao', 'Entrar na Liga agora? (Não há volta.)', 'liga-entrar'],
        se('flag:liga-entrar', [
          ['mover', 'jogador', ['n', 'n']],
          ...zerar.slice(1),
          ['flag', 'liga-em-curso'],
          ['sfx', 'porta'],
          ['musica', 'pico'],
          f(null, 'A porta trancou. À frente, a sala de espera e, depois dela, a maré.'),
        ], [
          f({ nome: 'Guardiã da Sala de Espera' }, 'Sem pressa. O Posto e a Venda estão logo ali: cure a equipe, encha a mochila e salve a viagem.'),
          ['mover', 'jogador', ['s']],
        ]),
      ]),
    ],
  },
  {
    id: 'liga-recepcao',
    passos: [
      f('liga-recepcao', 'Esta é a sala de espera. Respire. Olhe a equipe, olhe a mochila.\fPrimeira sala: Mestra Maré, Rio e Veneno. Segunda: Ferreiro Brasa-Viva, Brasa e Ferro. Terceira: Pajé Neblina, Mente e Assombro. Quarta: Domadora Pampa, Comum e Ginga.'),
      f('liga-recepcao', 'Na quinta sala está o Cacique Aracê, Campeão da Costa do Sol há vinte anos.\fQuem vence o Cacique entra para o Hall da Fama e ganha o direito de cruzar a serra. Boa sorte, desafiante!'),
    ],
  },
  sala(1, 'liga-mare',
    'Pisou devagar, hein? Faz bem. No mangue quem corre afunda.',
    'Vá com a maré a favor. O Brasa-Viva bate forte, mas ferro quente também entorta: água, terra e um bom chute resolvem.',
    'Já me venceu, desafiante. A porta está aberta: não deixe o ferro do Brasa-Viva esfriar.'),
  sala(2, 'liga-brasa-viva',
    'Chegou cheirando a maresia. Venceu a Maré, então. Aqui dentro a água evapora!',
    'O Pajé Neblina não bate: ele embaralha. Criatura do tipo Assombro acerta as dele em cheio — mas as dele também têm Assombro.',
    'Sino rachado não toca duas vezes. Siga, que a neblina não espera.'),
  sala(3, 'liga-neblina',
    'Hum… duas vitórias e o passo ainda firme. Vamos ver se a cabeça acompanha as pernas.',
    'A Pampa luta de perto e no compasso. Vento, Mente e Encanto tiram o chão da Ginga. E Assombro… bem, ela tem resposta para Assombro.',
    'Você já ouviu a minha história até o fim. A próxima é a da Pampa.'),
  sala(4, 'liga-pampa',
    'Três Mestres no chão! Aqui o chão é meu, parceiro. Sobe na sela!',
    'Agora é com o Cacique. Ele não tem um tipo: tem um plano. E guarda o Pirarucão para o fim — Encanto e Geada pegam Lenda de jeito.',
    'Passa, passa! O Campeão não gosta de esperar e eu não gosto de ver gente boa parada.'),
  {
    id: 'liga-5',
    passos: [
      f('liga-arace', 'Entre. Tire o pó da estrada dos ombros e olhe em volta: cada estátua desta sala foi alguém que chegou onde você está.'),
      ['batalha', 'liga-5', { segue: true, semMarca: true }],
      se('flag:batalha-perdida', [
        f('liga-arace', 'Ainda não é o seu amanhecer, {JOGADOR}. Mas eu vi a sua equipe olhar para você antes de cair: isso não se treina.\fVolte. A Liga recomeça, e eu estarei aqui, como sempre.'),
        ['chamar', 'liga-derrota'],
      ], [['chamar', 'liga-vitoria']]),
    ],
  },
  {
    id: 'liga-derrota',
    passos: [
      ['fade', 'fora'],
      ...zerar,
      ['warp', 'A-LG', LIGA_ENTRADA[0], LIGA_ENTRADA[1], 's'],
      ['fade', 'dentro'],
      f(null, 'Os Guardiões levaram a sua equipe de volta ao terreiro do Platô e cuidaram dela.\fA Liga recomeça do primeiro Mestre. Passe no Posto, reforce a mochila e tente de novo quando estiver pronto.'),
    ],
  },
  {
    id: 'liga-vitoria',
    passos: [
      ['musica', 'vitoria-lider'],
      f('liga-arace', 'Venha comigo, {JOGADOR}. Há uma sala neste Platô onde só entram duas pessoas por geração: o Campeão que sai e o Campeão que chega.'),
      ['fade', 'fora'],
      ['warp', 'A-LG', 14, 3, 'n'],
      ['fade', 'dentro'],
      ['hallDaFama'],
      ['sfx', 'insignia'],
      f({ nome: 'Cacique Aracê' }, 'Este é o Hall da Fama. Hoje o Marco ganha um nome novo: {JOGADOR}, Campeão da Costa do Sol!\fE ao lado do seu nome ficam os delas — porque ninguém sobe este Platô sozinho.'),
      ['tela', 'creditos', { curto: true, titulo: 'Hall da Fama' }],
      ['flag', 'liga-vencida'],
      ...zerar,
      f({ nome: 'Cacique Aracê' }, 'O título abre o que estava fechado. A linha da serra e o rio grande são perigosos demais para quem não provou o que você provou hoje.'),
      ['dar', 'passe-trem'],
      ['dar', 'bilhete-saveiro'],
      se('mapa-b',
        [f({ nome: 'Cacique Aracê' }, 'O Passe vale no Trem Serra-Sol, em Porto Sereia. O Bilhete, no Saveiro da Cidade Coral. Os dois levam ao Sertão das Névoas, onde há outras oito insígnias — e gente pior que capanga de usina.\fE todo Campeão leva do Platô uma pedra da nossa coleção. Escolha a sua.')],
        [f({ nome: 'Cacique Aracê' }, 'O Passe é do Trem Serra-Sol, em Porto Sereia. O Bilhete, do Saveiro da Cidade Coral. Os dois levam ao Sertão das Névoas, onde há outras oito insígnias — e gente pior que capanga de usina.\fSó não corra para a estação: a linha da serra e o Saveiro estão em obras. Guarde os dois; valem assim que reabrirem. E todo Campeão leva do Platô uma pedra da nossa coleção. Escolha a sua.')]),
      ['escolha', 'Qual Pedra de Evolução você quer?', ['Pedra Solar', 'Pedra da Maré', 'Pedra Lunar', 'Folha Ancestral'], 'liga-pedra'],
      ['opcao', 'liga-pedra'],
      se('flag:liga-pedra-1', [['dar', 'pedra-mare']], [se('flag:liga-pedra-2', [['dar', 'pedra-lunar']], [se('flag:liga-pedra-3', [['dar', 'folha-ancestral']], [['dar', 'pedra-solar']])])]),
      ['hallFim'],
      ['sfx', 'radio'],
      se('mapa-b', [
        f(RADIO, '"Interrompemos a moda de viola para uma notícia do Platô: a Costa do Sol tem Campeão novo! {JOGADOR}, de Vila Jacarandá, venceu a Liga dos Guardiões!\fCom isso, a região do Sertão das Névoas agora está aberta: o Trem Serra-Sol e o Saveiro voltam a aceitar o Campeão a bordo. Boa viagem, e leve casaco!"'),
      ], [
        f(RADIO, '"Interrompemos a moda de viola para uma notícia do Platô: a Costa do Sol tem Campeão novo! {JOGADOR}, de Vila Jacarandá, venceu a Liga dos Guardiões!\fA viagem ao Sertão das Névoas fica para em breve: o Trem Serra-Sol e o Saveiro seguem em obras, e esta rádio avisa quando reabrirem. Até lá, a Costa do Sol inteira quer conhecer o Campeão!"'),
      ]),
      se('mapa-b', [f({ nome: 'Cacique Aracê' }, 'Ouviu? Agora é oficial. Vá ver o sol nascer do outro lado da serra, Campeão. O Platô fica comigo mais um pouco.')],
        [f({ nome: 'Cacique Aracê' }, 'Ouviu? Agora é oficial. Enquanto a serra não abre, ande pela Costa com o título no peito: há criatura que você ainda não viu e gente que vai querer revanche. O Platô fica comigo mais um pouco.')]),
      ['fade', 'fora'],
      ['warp', 'A-LG', LIGA_ENTRADA[0], LIGA_ENTRADA[1], 's'],
      ['fade', 'dentro'],
      ['mostrar', 'taina'],
      ['chamar', 'rival-5'],
    ],
  },
  {
    id: 'rival-5',
    passos: [
      se('!flag:rival-5', [
        ['emote', 'taina', '!'],
        se('flag:inicial-mata', [['batalha', 'rival-5-brasa', { segue: true }]]),
        se('flag:inicial-brasa', [['batalha', 'rival-5-rio', { segue: true }]]),
        se('flag:inicial-rio', [['batalha', 'rival-5-mata', { segue: true }]]),
      ]),
      se('flag:rival-5', [
        se('flag:batalha-perdida', [f(TAINA, 'GANHEI DO CAMPEÃO! Ouviu, Platô?! …Tá, você estava cansado de cinco lutas. Eu sei. Mas ganhei.')]),
        f(TAINA, 'Sabe o que eu descobri, {JOGADOR}? Que eu passei oito insígnias querendo ganhar de você, e você passou oito insígnias cuidando das suas criaturas.\fEu vou voltar lá dentro e vencer aquela Liga do meu jeito. E depois, quando a linha da serra reabrir, eu pego o trem. O Cartel Ferrugem fugiu para o sertão, e eu ainda tenho contas a acertar com quem enjaula criatura.'),
        f(TAINA, 'Te vejo do outro lado da serra, Campeão. E não vai se acostumando com o título: eu disse que sou a próxima.'),
        ['esconder', 'taina'],
      ]),
    ],
  },
  /* Drª Buriti (laboratório de campo de Vila Buriti): `inicial-extra-1` depois da insígnia 8 (spec 6.2) */
  {
    id: 'dra-buriti',
    passos: [
      se('flag:inicial-extra-1', [f('dra-buriti', 'Como vai a criatura que eu te confiei? Ela ficava na janela todo dia, olhando a estrada. Acho que esperava por você.\fQuando cruzar a serra, mande notícias: do Sertão das Névoas eu só conheço o que os tropeiros contam.')], [
        se('insignia:8', [
          f('dra-buriti', '{JOGADOR}! A Ipê falou tanto de você nas cartas que eu já te conhecia de letra. E agora com a Insígnia da Folha no estojo!\fTenho comigo, desde aquele dia no laboratório dela, uma das criaturas que ficaram na mesa. A Ipê pediu que eu só entregasse a quem cuidasse bem da primeira.'),
          se('flag:inicial-mata', [['darCriatura', 4, 10, { apelidar: true }]], [['darCriatura', 1, 10, { apelidar: true }]]),
          ['flag', 'inicial-extra-1'],
          f('dra-buriti', 'Ela ainda é pequena, mas aprende depressa ao lado de uma equipe como a sua.\fDizem que a terceira criatura daquela mesa nasceu de novo num ovo da Praia das Tartarugas. Mas isso já é assunto de maré, não de vereda.'),
        ], [
          f('dra-buriti', 'Bem-vindo ao laboratório de campo! Eu sou a Drª Buriti: estudo veredas, brejos e tudo o que canta de noite.\fTenho uma criatura guardada para um treinador de confiança. Volte com a Insígnia da Folha, do ginásio aqui da vila, e a gente conversa.'),
        ]),
      ]),
    ],
  },
];
