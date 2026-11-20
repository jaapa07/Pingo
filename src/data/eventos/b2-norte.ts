/**
 * Eventos do time B2-norte (Campos de Altitude, Lagoa Gelada, Caminho das Névoas, Planalto Lume, Floresta Ancestral e o
 * Cume do Pico Pindorama). A sequência final (Garrote, rival 8, Conselho, créditos) fica em src/data/eventos/conselho.ts.
 * Missões paralelas (regras aprovadas do spec 10A):
 *   m-carta-lume    carta da aprendiz Estrela-d'Alva (B8) para o pai, o pescador Joca (Ilha do Joca, B-LG), e a resposta (10A-29)
 *   m-constelacoes  constelações vivas: registrar Urutau-Fantasma, Noitão e Corujão-Orelha no Diário; só de noite (10A-39)
 *   m-troca-sg      troca com o pastor Seu Lã-Grossa (B-SG): uma Gralha-Azul por um Maracajá-Nevado apelidado (10A-12)
 *   b2n-registro    a escrivã Dona Lembrança conta onde e em que nível cada criatura da equipe foi capturada (10A-36)
 *   pp-neve         a neve brilhante do Cume no dia 20 de novembro, uma vez por ano (10A-37)
 *   pp-misterioso   o Andarilho do Cume volta a cada vitória contra o Conselho (10A-22 e 10A-37; pós-jogo)
 * Lendários e raros: Uirapuru no Mirante dos Campos ao amanhecer com 150 no Diário (`b2n-uirapuru`, spec 6.4), o canto do
 * Jubartão no Trapiche Comprido (pós-jogo, uma vez por dia), os três Ninhos Raros da Floresta Ancestral (uma visita
 * por ninho por dia; forma final só de manhã) e o Mapinguari no Coração da Floresta (depois do Conselho).
 */
import type { EventoDef, Comando, CriaturaInst } from '../../core/tipos';
import { jogo, setFlag } from '../../core/estado';
import { registrarComando } from '../../world/registro';
import { ESPECIES } from '../criaturas';
import './comuns';

/* ------------------------------ comandos do time ------------------------------ */
/** número do dia no relógio do jogo (o deslocamento do relógio conta) */
const hoje = () => Math.floor((Date.now() / 60000 + jogo.save.relogio.deslocamentoMin) / 1440);
/** ['b2n-novo-dia', marca, saida] → saida = nunca marcado ou já virou o dia desde a marca; ['b2n-marcar', marca] grava hoje */
registrarComando('b2n-novo-dia', ([marca, saida]) => { const v = jogo.save.flags[String(marca)]; setFlag(String(saida), typeof v !== 'number' || hoje() > v); });
registrarComando('b2n-marcar', ([marca]) => { setFlag(String(marca), hoje()); });
/** `b2n-dia-da-neve`: hoje é 20 de novembro no relógio do aparelho; `b2n-neve-ano` guarda o ano da última visita */
registrarComando('b2n-data', () => {
  const d = new Date(Date.now() + jogo.save.relogio.deslocamentoMin * 60000);
  setFlag('b2n-dia-da-neve', d.getMonth() === 10 && d.getDate() === 20);
  setFlag('b2n-neve-ja', jogo.save.flags['b2n-neve-ano'] === d.getFullYear());
});
registrarComando('b2n-neve-visto', () => { setFlag('b2n-neve-ano', new Date(Date.now() + jogo.save.relogio.deslocamentoMin * 60000).getFullYear()); });
/** resultado da última batalha selvagem em flags booleanas */
registrarComando('b2n-resultado', () => { const r = jogo.save.flags['ultima-batalha']; setFlag('b2n-capturou', r === 'captura'); setFlag('b2n-venceu', r === 'vitoria'); });
/** a escrivã lê o registro de cada criatura da equipe (localCaptura e nivelCaptura) */
registrarComando('b2n-registro', async () => {
  const { falar } = await import('../../world/deps');
  const nome = (c: CriaturaInst) => c.apelido ?? ESPECIES.find((e) => e.num === c.especie)?.nome ?? `nº ${c.especie}`;
  for (const c of jogo.save.equipe.filter((x) => !x.ovo)) {
    const onde = c.localCaptura ? `em ${c.localCaptura}` : 'num lugar que o livro não guardou';
    const nv = c.nivelCaptura ? `no nível ${c.nivelCaptura}` : 'num nível que ninguém anotou';
    const dono = c.treinadorOriginal && c.treinadorOriginal !== jogo.save.jogador.nome ? ` Veio das mãos de ${c.treinadorOriginal}.` : '';
    await falar(`${nome(c)}: encontrada ${onde}, ${nv}. Hoje está no nível ${c.nivel}.${dono}`, { nome: 'Dona Lembrança' });
  }
});
/** ['b2n-trocar', dada, recebida, nivel, apelido, item, flagOk]: troca a primeira criatura da espécie dada pela recebida */
registrarComando('b2n-trocar', async ([dar, receber, nivel, apelido, it, ok]) => {
  const eq = jogo.save.equipe, i = eq.findIndex((c) => c.especie === Number(dar) && !c.ovo);
  setFlag(String(ok), i >= 0);
  if (i < 0) return;
  const { criarCriatura } = await import('../../world/deps');
  const nova = criarCriatura(Number(receber), Number(nivel), { apelido: String(apelido), item: String(it), treinadorOriginal: 'Lã-Grossa', localCaptura: 'Campos de Altitude', nivelCaptura: Number(nivel) });
  eq.splice(i, 1, nova);
  const v = jogo.save.diario; const n = Number(receber); if (!v.visto.includes(n)) v.visto.push(n); if (!v.capturado.includes(n)) v.capturado.push(n);
});
/** ['b2n-no-diario', [n…], flag] → flag = todas as espécies já foram capturadas (registradas no Diário) */
registrarComando('b2n-no-diario', ([ns, f]) => { setFlag(String(f), (ns as number[]).every((n) => jogo.save.diario.capturado.includes(n))); });

/* ------------------------------ atalhos de roteiro ------------------------------ */
const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const f = (quem: unknown, texto: string): Comando => ['falar', quem, texto];
const ALVA = { nome: "Aprendiz Estrela-d'Alva", retrato: 'npc-mulher-1' };
const JOCA = { nome: 'Pescador Joca' };
const VEGA = { nome: 'Astrônoma-assistente Vega' };
const PASTOR = { nome: 'Seu Lã-Grossa' };
const FLOCO = { nome: 'Seu Floco-Velho' };
const ANDARILHO = { nome: 'Andarilho do Cume', retrato: 'andarilho-cume' };

/** Ninho Raro: uma visita por dia; de manhã, a forma final (rara); fora dela, o filhote da forma do meio */
const ninho = (linha: string, meio: number, final: number, onde: string): EventoDef => ({
  id: `b2n-ninho-${linha}`,
  passos: [
    ['b2n-novo-dia', `b2n-ninho-${linha}-dia`, 'b2n-ninho-livre'],
    se('flag:b2n-ninho-livre', [
      ['b2n-marcar', `b2n-ninho-${linha}-dia`],
      se('periodo:manha', [
        f(null, `No ${onde}, o capim se abre. Uma criatura enorme se ergue sobre os ovos e encara você, protegendo o ninho.`),
        ['grito', final], ['selvagem', final, 66],
      ], [
        f(null, `No ${onde}, um filhote crescido pula para fora do ninho, eriçado, pronto para defender os ovos.`),
        ['grito', meio], ['selvagem', meio, 34],
      ]),
      ['b2n-resultado'],
      se('flag:b2n-capturou', [f(null, 'A parceria foi firmada. O ninho fica quieto, e os ovos continuam quentinhos.')]),
    ], [
      f(null, `O ${onde} está quieto. Só os ovos, quentes e pintados. A mãe não volta enquanto houver gente por perto hoje.\fVolte amanhã — e, se quiser ver o bicho crescido, venha de manhãzinha.`),
    ]),
  ],
});

export const EVENTOS_B2_NORTE: EventoDef[] = [
  /* ============================== MISSÃO: A CARTA DO LUME ============================== */
  {
    id: 'b2n-carta',
    passos: [
      se('flag:m-carta-lume-ok', [f(ALVA, 'O meu pai respondeu! Pela primeira vez em três meses! Ele disse que vai descer a serra para ver o céu comigo. Obrigada de novo.')], [
        se('flag:m-carta-lume-resposta', [
          f(ALVA, 'Uma carta do meu pai?! Dá aqui, dá aqui!'),
          f(ALVA, '"Filha, o céu da lagoa também é bonito. Mas o daí tem você." …Ele nunca escreveu tanto!\fToma, isto era do meu avô, o primeiro luneteiro do Lume. Ensina a criatura a congelar o ar à sua volta.'),
          ['dar', 'pt-21'], ['flag', 'm-carta-lume-ok'],
        ], [
          se('flag:m-carta-lume', [
            f(ALVA, 'Já levou a carta? O barraco do meu pai fica na ilha do meio da Lagoa Gelada. Só de canoa.'),
          ], [
            f(ALVA, 'Você vai passar pela Serra da Geada? Meu pai, o Joca, pesca na Lagoa Gelada e mora numa ilha no meio da água.\fEle não sobe nem desce a serra, e eu não saio do observatório. Pode levar esta carta para ele?'),
            ['simnao', 'Levar a carta ao pescador Joca?', 'b2n-sim'],
            se('flag:b2n-sim', [['flag', 'm-carta-lume'], ['sfx', 'item-obtido'], f(null, '{JOGADOR} guardou a carta da Estrela-d’Alva na mochila.'), f(ALVA, 'Obrigada! A Lagoa Gelada fica a leste da Serra da Geada. Leve o Remo: a ilha é no meio da água.')], [f(ALVA, 'Tudo bem. Se mudar de ideia, eu estou sempre aqui, olhando para cima.')]),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'b2n-joca',
    passos: [
      se('flag:m-carta-lume&!flag:m-carta-lume-resposta&!flag:m-carta-lume-ok', [
        f(JOCA, 'Uma carta? Para mim? …É a letra da minha Estrela!'),
        f(JOCA, 'Ela está bem… está contando estrelas… quatro mil cento e dezessete. Essa menina.\fEspere aí. Vou escrever de volta agora mesmo, antes que eu perca a coragem.'),
        ['esperar', 600],
        ['flag', 'm-carta-lume-resposta'], ['sfx', 'item-obtido'], f(null, '{JOGADOR} guardou a resposta do Joca na mochila.'),
        f(JOCA, 'Leve para ela, por favor. E leve também estas Cuias de Rede: pegam até peixe de água de geada.'),
        ['dar', 'cuia-rede', 3],
      ], [
        se('flag:m-carta-lume-ok', [f(JOCA, 'A minha Estrela escreveu de novo. Vou descer a serra no fim do mês. Faz tanto tempo que eu não vejo o céu do Lume…')], [
          se('flag:m-carta-lume-resposta', [f(JOCA, 'Já está com a resposta? Então corre, que carta velha esfria.')], [
            f(JOCA, 'Pescar no gelo é coisa de paciência. Eu tenho de sobra. O que me falta é notícia da minha filha, lá no Planalto Lume.'),
          ]),
        ]),
      ]),
    ],
  },

  /* ============================== MISSÃO: CONSTELAÇÕES VIVAS ============================== */
  {
    id: 'b2n-constelacoes',
    passos: [
      se('flag:m-constelacoes-ok', [f(VEGA, 'A sua constelação viva está no meu caderno: Urutau, Noitão e Corujão. A Jaci adorou. Volte de noite, que o céu do Lume nunca se repete.')], [
        se('!periodo:noite', [
          f(VEGA, 'De dia o observatório dorme. Volte de noite, quando a cúpula abre: tenho um pedido que só se entende olhando para cima.'),
        ], [
          ['b2n-no-diario', [170, 172, 44], 'b2n-tem-constelacao'],
          se('flag:b2n-tem-constelacao', [
            f(VEGA, 'Urutau-Fantasma, Noitão e Corujão-Orelha, os três no seu Diário! A Coruja, o Olho e o Galho Seco: as três estrelas da Constelação da Mata Noturna, como os antigos contavam.'),
            f(VEGA, 'Leve isto. A Jaci disse que é para quem enxerga no escuro.'),
            ['dar', 'pt-37'], ['dar', 'cuia-noturna', 5], ['flag', 'm-constelacoes-ok'],
          ], [
            f(VEGA, 'Os antigos do Lume desenhavam uma constelação chamada Mata Noturna: a Coruja, o Olho e o Galho Seco.\fNa terra, elas são o Corujão-Orelha, o Noitão e o Urutau-Fantasma. Registre os três no seu Diário de Campo e me mostre. Eles saem de noite, no Caminho das Névoas.'),
            ['flag', 'm-constelacoes'],
          ]),
        ]),
      ]),
    ],
  },

  /* ============================== SERVIÇO: A ESCRIVÃ ============================== */
  {
    id: 'b2n-registro',
    passos: [
      f('b8-escriva', 'Sou a escrivã da praça. Anoto tudo o que passa pelo Lume, até criatura.\fQuer saber de onde veio cada uma da sua equipe? Deixe-me ler.'),
      ['b2n-registro'],
      f('b8-escriva', 'Cada criatura tem uma história. A sua é a que junta todas elas.'),
    ],
  },

  /* ============================== MISSÃO: A TROCA DO PASTOR ============================== */
  {
    id: 'b2n-troca',
    passos: [
      se('flag:m-troca-sg-ok', [f(PASTOR, 'E o Geadinha, tchê? Cuide bem dele. Ele gosta de dormir em cima de lã quente.')], [
        f(PASTOR, 'Bah! Um treinador! Escuta: eu tenho um Maracajá-Nevado, o Geadinha, que não para de caçar as minhas ovelhas de brincadeira.\fQueria trocar por uma Gralha-Azul, que planta pinheiro e não assusta ninguém. Tem uma na equipe?'),
        ['temEspecie', 136, 'b2n-tem-gralha'],
        se('flag:b2n-tem-gralha', [
          ['simnao', 'Trocar a sua Gralha-Azul pelo Maracajá-Nevado do pastor?', 'b2n-sim'],
          se('flag:b2n-sim', [
            ['b2n-trocar', 136, 140, 57, 'Geadinha', 'buriti', 'b2n-trocou'],
            se('flag:b2n-trocou', [['sfx', 'item-obtido'], f(null, 'Troca feita! O Geadinha pulou para a equipe com um Buriti na boca.'), ['flag', 'm-troca-sg-ok'], f(PASTOR, 'Ele vem com um buriti: é o petisco dele. Quando o frio apertar, ele come sozinho.')]),
          ], [f(PASTOR, 'Tudo bem, tchê. A oferta fica de pé, como o capim.')]),
        ], [f(PASTOR, 'Sem Gralha-Azul? Elas vivem aqui nos campos, de dia. Volte com uma que a gente troca.')]),
      ]),
    ],
  },

  /* ============================== UIRAPURU (B-SG, ao amanhecer, 150 no Diário) ============================== */
  {
    id: 'b2n-uirapuru',
    passos: [
      se('flag:uirapuru-ok', [f(null, 'O mirante está em silêncio. Só o vento no capim dourado.')], [
        se('periodo:manha&diario:150', [
          f(null, 'O sol nasce atrás da serra. Um passarinho pequeno, cor de ferrugem, pousa no totem e abre o bico.\fO canto é tão bonito que os outros pássaros calam, um por um. Até o vento para para ouvir.'),
          ['grito', 177], ['tremor', 300],
          f(null, 'O UIRAPURU olha para você como quem reconhece um velho amigo dos bichos!'),
          ['selvagem', 177, 67, { lendario: true }],
          ['b2n-resultado'],
          se('flag:b2n-capturou', [['flag', 'uirapuru-ok'], ['esconder', 'b-sg-uirapuru'], f(null, 'O Uirapuru se aninhou na cuia. A mata volta a cantar, aos poucos.')]),
          se('flag:b2n-venceu', [['flag', 'uirapuru-ok'], ['esconder', 'b-sg-uirapuru'], f(null, 'O Uirapuru voou para dentro da mata. Os antigos dizem que, solto ou perdido, ele volta ao mirante depois do Conselho.')]),
          se('!flag:b2n-capturou&!flag:b2n-venceu', [f(null, 'O Uirapuru pousa de novo no totem e continua cantando, como se nada tivesse acontecido.')]),
        ], [f(null, 'Um totem de pinho com um passarinho entalhado. O silêncio aqui em cima é de quem espera alguém.')]),
      ]),
    ],
  },

  /* ============================== JUBARTÃO (B-LG, pós-jogo, uma vez por dia) ============================== */
  {
    id: 'b2n-jubarte',
    passos: [
      ['b2n-novo-dia', 'b2n-jubarte-dia', 'b2n-jubarte-livre'],
      se('flag:b2n-jubarte-livre', [
        ['b2n-marcar', 'b2n-jubarte-dia'],
        f(null, 'Na ponta do Trapiche Comprido, a madeira vibra. Lá do fundo da lagoa vem um canto grave, longo, que faz a água tremer em círculos.'),
        ['grito', 132],
        f(null, 'Um JUBARTÃO sobe à superfície, soprando um jato de água gelada!'),
        ['selvagem', 132, 73],
      ], [f(null, 'A lagoa está quieta. O canto da baleia já passou hoje. Volte amanhã.')]),
    ],
  },

  /* ============================== FLORESTA ANCESTRAL ============================== */
  ninho('mata', 2, 3, 'Ninho Raro da Mata'),
  ninho('brasa', 5, 6, 'Ninho Raro da Brasa'),
  ninho('rio', 8, 9, 'Ninho Raro do Rio'),
  {
    id: 'b2n-mapinguari',
    passos: [
      se('flag:mapinguari-ok', [f(null, 'Só sobraram as marcas de garra no tronco e um cheiro forte de mato molhado.')], [
        f(null, 'O chão treme. Do meio das árvores sai uma criatura enorme, de pelo vermelho-escuro e garras que parecem raízes.\fEla para na frente do tronco das marcas, como quem guarda a casa.'),
        ['grito', 175], ['tremor', 600],
        f(null, 'O MAPINGUARI, guardião da Floresta Ancestral, ruge!'),
        ['selvagem', 175, 70, { lendario: true }],
        ['b2n-resultado'],
        se('flag:b2n-capturou', [['flag', 'mapinguari-ok'], ['esconder', 'b-fa-mapinguari'], f(null, 'O Mapinguari aceitou a parceria. A floresta inteira solta um suspiro.')]),
        se('flag:b2n-venceu', [['flag', 'mapinguari-ok'], ['flag', 'mapinguari-dormiu'], ['esconder', 'b-fa-mapinguari'], f(null, 'O Mapinguari recua para o fundo da mata. Os antigos dizem que ele volta ao Coração da Floresta quando a lua troca.')]),
        se('!flag:b2n-capturou&!flag:b2n-venceu', [f(null, 'O Mapinguari continua de pé na frente do tronco, respirando fundo. Ele não vai a lugar nenhum.')]),
      ]),
    ],
  },

  /* ============================== O CUME (pós-jogo) ============================== */
  {
    id: 'pp-neve',
    passos: [
      ['b2n-data'],
      se('flag:b2n-dia-da-neve&pos-jogo', [
        se('flag:b2n-neve-ja', [f(FLOCO, 'Viu a neve brilhando? Volta só no ano que vem. Neve boa não se repete.')], [
          f(FLOCO, 'Hoje é vinte de novembro! O dia em que o Pico acorda brilhando.\fOlhe o chão do Cume: cada floco tem uma faísca de cor. Os antigos dizem que é a memória de todos os que subiram, cintilando de uma vez.'),
          f(null, 'A neve do Cume cintila em todas as cores. Entre os flocos, alguma coisa brilha mais que o resto.'),
          ['dar', 'pedra-lunar'], ['dar', 'rapadura'], ['dar', 'pena-colorida', 3],
          ['b2n-neve-visto'],
        ]),
      ], [
        f(FLOCO, 'Moro no acampamento há cinquenta invernos. Uma vez por ano, no dia vinte de novembro, a neve do Cume brilha em todas as cores.\fSó quem já foi recebido pelo Conselho consegue ver. Eu vi uma vez. Chorei feito criança.'),
      ]),
    ],
  },
  {
    id: 'pp-misterioso',
    passos: [
      f(ANDARILHO, '…'),
      f(ANDARILHO, 'Subi desde o mar. Dizem que alguém venceu o Conselho outra vez. Vim ver se é verdade.\fNão tenho nome para dar. Tenho uma equipe. Mostre-me a sua.'),
      ['batalha', 'PP-andarilho', { segue: true }],
      ['flag', 'misterioso-pode', false],
      se('flag:batalha-perdida', [f(ANDARILHO, 'Ainda não. Vença o Conselho de novo e eu volto.')], [
        f(ANDARILHO, '…É verdade.'),
        f(null, 'O andarilho ajeita o chapéu, vira as costas e desce a trilha da Costa do Sol sem olhar para trás. Na pedra, onde ele estava, a neve tem a marca de duas botas — e mais nada.'),
      ]),
      ['esconder', 'pp-misterioso'],
    ],
  },
];
export default EVENTOS_B2_NORTE;
