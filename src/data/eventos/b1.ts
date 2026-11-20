/**
 * Eventos do time B1 (Sertão das Névoas, passos 9–11, depois da Liga).
 * História: chegada do trem a Vila Cascavel (`b1-chegada`), o ninhal do Pantanal e o tenente Arame (`b1-pantanal` →
 * `pantanal-ok`), a Mina Velha e o tenente Rebite (`b1-mina` → `mina-ok`), o Boitatá da Caverna Vulcânica
 * (`b1-boitata`, depois da insígnia 10) e a rival Tainá no encontro 6 (`b1-rival-6`, Arraial Brasa).
 * Serviço: a raizeira do Salão cura de graça (`b1-raizeira`).
 * Missões paralelas (regras aprovadas do spec 10A e exemplos da seção 9.3):
 *   m-carta-b1     carta na asa (10A-29): o violeiro de Vila Cascavel → Dona Açucena, em Porto Pantaneiro → resposta
 *   m-ninho        vigiar um ninho por um dia (10A-29, o contrário): Dona Brejeira, Pantanal Grande — relógio do jogo
 *   m-orfaos       adotar filhotes resgatados, um por dia (10A-29 + 10A-39): Centro de Reabilitação, depois de `pantanal-ok`
 *   m-fotos        fotografar cinco ninhos do Sertão para a observadora (seção 9.3)
 *   m-sao-joao     a quadrilha do São João no terreiro de Arraial Brasa, só aos sábados (10A-2 e 10A-39)
 *   m-troca-b1     troca com morador (10A-12): Seu Aroeirinha troca um Emaçu apelidado por um Tucanuçu
 *   m-pepitas      três pepitas por um pergaminho (Seu Cascalho, Chapada Rubra)
 *   m-doce         a receita de doce de buriti da Dona Mangaba (três frutos de buriti)
 *   m-raizes       as três raízes da raizeira (pequi, buriti e acerola)
 *   m-forja        a Cuia de Ouro forjada com pepita na Forja Grande (depois de ver o Boitatá)
 * Flags e marcos: docs/HISTORIA.md e docs/ZONAS-B1.md.
 */
import type { EventoDef, Comando } from '../../core/tipos';
import { jogo, setFlag, diaSemana } from '../../core/estado';
import { registrarComando } from '../../world/registro';
import { ESPECIES } from '../criaturas';
import './comuns'; // comandos extras: temItens, temEspecie, grito, vitrine…

/* ------------------------------ comandos do time ------------------------------ */
/** número do dia no relógio do jogo (o deslocamento do relógio conta) */
const hoje = () => Math.floor((Date.now() / 60000 + jogo.save.relogio.deslocamentoMin) / 1440);
/** `b1-sabado` (dia da semana do relógio do jogo) */
registrarComando('b1-calendario', () => { setFlag('b1-sabado', diaSemana() === 6); });
/** ['b1-marcar-dia', flag] guarda o dia de hoje na flag */
registrarComando('b1-marcar-dia', ([f]) => { setFlag(String(f), hoje()); });
/** ['b1-dia-passou', flagDoDia, flagSaida] → saída = já virou o dia desde o marcado */
registrarComando('b1-dia-passou', ([marca, saida]) => { const v = jogo.save.flags[String(marca)]; setFlag(String(saida), typeof v === 'number' && hoje() > v); });
/** resultado da última batalha selvagem em flags booleanas (`b1-capturou`, `b1-venceu`) */
registrarComando('b1-resultado', () => { const r = jogo.save.flags['ultima-batalha']; setFlag('b1-capturou', r === 'captura'); setFlag('b1-venceu', r === 'vitoria'); });
/**
 * ['b1-trocar', especieDada, especieRecebida, nivel, apelido, item, flagOk]: tira da equipe a primeira criatura da espécie
 * dada (que não seja ovo) e entrega a recebida, com apelido, item segurado e treinador original do morador.
 */
registrarComando('b1-trocar', async ([dar, receber, nivel, apelido, it, ok]) => {
  const eq = jogo.save.equipe, i = eq.findIndex((c) => c.especie === Number(dar) && !c.ovo);
  setFlag(String(ok), i >= 0);
  if (i < 0) return;
  const { criarCriatura } = await import('../../world/deps');
  const nova = criarCriatura(Number(receber), Number(nivel), { apelido: String(apelido), item: String(it), treinadorOriginal: 'Aroeirinha', localCaptura: 'Vila Cascavel', nivelCaptura: Number(nivel) });
  eq.splice(i, 1, nova);
  const v = jogo.save.diario; for (const n of [Number(receber)]) { if (!v.visto.includes(n)) v.visto.push(n); if (!v.capturado.includes(n)) v.capturado.push(n); }
});
/** filhotes do Centro de Reabilitação: os do ninhal (depois de `pantanal-ok`) e os da mina (depois de `mina-ok`) */
const ORFAOS_NINHAL = [105, 101, 103, 51, 71, 73, 86, 91, 97];
const ORFAOS_MINA = [165, 145, 159];
/** menu dos filhotes que ainda esperam adoção → marca `b1-orfao-sel-<n>` só no escolhido */
registrarComando('b1-orfao-menu', async () => {
  const { escolher } = await import('../../world/deps');
  const lista = [...ORFAOS_NINHAL, ...(jogo.save.flags['mina-ok'] ? ORFAOS_MINA : [])].filter((n) => !jogo.save.flags[`orfao-${n}`]);
  for (const n of [...ORFAOS_NINHAL, ...ORFAOS_MINA]) setFlag(`b1-orfao-sel-${n}`, false);
  setFlag('b1-orfao-algum', lista.length > 0);
  if (!lista.length) return;
  const nomes = lista.map((n) => ESPECIES.find((e) => e.num === n)?.nome ?? `nº ${n}`);
  const i = await escolher('Qual filhote você quer adotar hoje?', [...nomes, 'Agora não']);
  if (i >= 0 && i < lista.length) setFlag(`b1-orfao-sel-${lista[i]}`, true);
});

/**
 * O filhote cresce com quem adota: nasce na faixa do Pantanal (44, `darCriatura`) e logo depois sobe até 4 níveis abaixo
 * da média da equipe (nunca acima de 60), para ser útil numa equipe do mapa B (docs/EQUILIBRIO-MAPA-B.md). Não evolui
 * aqui: evolui na primeira subida de nível em batalha, como qualquer criatura que passou do nível da evolução.
 */
registrarComando('b1-orfao-crescer', async ([num]) => {
  const { ganharExp, expParaNivel, especie } = await import('../../battle/criatura');
  const eq = jogo.save.equipe.filter((c) => !c.ovo && !(c.especie === Number(num) && c.nivelCaptura === ORFAO_NV && c.nivel === ORFAO_NV));
  const media = eq.length ? Math.round(eq.reduce((a, c) => a + c.nivel, 0) / eq.length) : ORFAO_NV;
  const alvo = Math.min(60, Math.max(ORFAO_NV, media - 4));
  const todas = [...jogo.save.equipe, ...jogo.save.viveiro.flat()].filter((c): c is NonNullable<typeof c> => !!c);
  const f = todas.reverse().find((c) => c.especie === Number(num) && c.nivelCaptura === ORFAO_NV && c.nivel === ORFAO_NV);
  if (!f || alvo <= f.nivel) return;
  ganharExp(f, expParaNivel(especie(f.especie).crescimento, alvo) - f.exp);
  f.nivelCaptura = f.nivel;
});
/** nível em que o filhote sai do Centro (faixa dos selvagens do Pantanal, B-PA 44–47) */
const ORFAO_NV = 44;

/* ------------------------------ atalhos de roteiro ------------------------------ */
const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const f = (quem: unknown, texto: string): Comando => ['falar', quem, texto];
const TAINA = { nome: 'Tainá', retrato: 'taina' };
const ARAME = { nome: 'Tenente Arame', retrato: 'tenente-arame' };
const REBITE = { nome: 'Tenente Rebite', retrato: 'tenente-rebite' };
const TOPAZIO = { nome: 'Garimpeiro Topázio', retrato: 'lider-09' };
const MAQUINISTA = { nome: 'Maquinista Firmino', retrato: 'npc-maquinista' };
const SUCUPIRA = { nome: 'Dona Sucupira', retrato: 'npc-idosa' };
/** a Tainá usa o inicial que vence o do jogador */
const batalhaRival6: Comando[] = [
  se('flag:inicial-mata', [['batalha', 'rival-6-brasa', { segue: true }]]),
  se('flag:inicial-brasa', [['batalha', 'rival-6-rio', { segue: true }]]),
  se('flag:inicial-rio', [['batalha', 'rival-6-mata', { segue: true }]]),
  se('!flag:inicial-mata&!flag:inicial-brasa&!flag:inicial-rio', [['batalha', 'rival-6-brasa', { segue: true }]]),
];
/** foto de um dos cinco ninhos da observadora */
const foto = (n: number, onde: string): EventoDef => ({
  id: `b1-foto-${n}`,
  passos: [
    se(`flag:m-foto-${n}`, [f(null, `O ninho ${onde} já está no rolo de filme da observadora. Os filhotes nem olharam para a câmera.`)], [
      f(null, `Um ninho de gravetos ${onde}. Dentro, ovos quentinhos e um cheiro de capim.`),
      se('flag:m-fotos&!flag:m-fotos-ok', [
        ['sfx', 'ui-ok'], ['flag', `m-foto-${n}`],
        f(null, 'CLIQUE! {JOGADOR} fotografou o ninho com a câmera emprestada, sem encostar em nada.'),
      ], [f(null, 'Melhor não mexer. Ninho tocado é ninho abandonado.')]),
    ]),
  ],
});

export const EVENTOS_B1: EventoDef[] = [
  /* ============================== CHEGADA ============================== */
  {
    id: 'b1-chegada',
    passos: [
      ['flag', 'b1-chegou'],
      ['emote', 'b1-maquinista', '!'],
      f(MAQUINISTA, 'Chegamos, Campeão! Vila Cascavel, porta de entrada do Sertão das Névoas. Desça devagar: a plataforma é velha e a serra é nova.'),
      f(MAQUINISTA, 'Aqui o mato é outro e os bichos já nascem do tamanho da Liga. Nada de Tamanduí de nível cinco: aqui é Emaçu de quarenta e cinco para cima.\fO primeiro ginásio do Sertão é o da Boiadeira Zefa, em Pantanal Grande, a leste. Dá para ir a pé, pela Vereda, pelo Cerrado e pelas passarelas do Pantanal… ou de canoa, pela lagoa da vila.'),
      f(MAQUINISTA, 'E não estranhe: a Vila Cascavel não tem ginásio. O prédio de pedra virou o Salão da Raizeira. Lá a Dona Sucupira cura a sua equipe de graça.'),
      ['sfx', 'radio'],
      f({ nome: 'Rádio Cipó' }, 'Rádio Cipó, edição do Sertão! Notícia urgente: a Polícia Ambiental pede atenção com gente de macacão cor de ferrugem no Pantanal. Quem vir gaiola, avise a Boiadeira Zefa.'),
      ['salvar'],
    ],
  },

  /* ============================== SALÃO DA RAIZEIRA ============================== */
  {
    id: 'b1-raizeira',
    passos: [
      f(SUCUPIRA, 'Chegue, menino. Sente. Deixe as cuias aqui na bancada que eu passo um chá de casca em cada uma.'),
      ['curar'],
      f(SUCUPIRA, 'Pronto: jurubeba para o fígado, barbatimão para os cortes e um cafuné para a alma. A equipe está nova.'),
      se('flag:m-raizes-ok', [f(SUCUPIRA, 'E aquele pergaminho, você já ensinou? Força de raiz não se guarda: se usa.')], [
        se('flag:m-raizes', [
          ['temItens', 'pequi', 1, 'b1-tem-pequi'], ['temItens', 'buriti', 1, 'b1-tem-buriti'], ['temItens', 'acerola', 1, 'b1-tem-acerola'],
          se('flag:b1-tem-pequi&flag:b1-tem-buriti&flag:b1-tem-acerola', [
            f(SUCUPIRA, 'Pequi do cerrado, buriti da vereda e acerola do quintal! Era isso mesmo. Vou fazer o meu xarope das três raízes.'),
            ['tirar', 'pequi', 1], ['tirar', 'buriti', 1], ['tirar', 'acerola', 1],
            f(SUCUPIRA, 'Em troca, leve isto. Era da Dona Buriti, minha aluna, de antes de ela abrir o ginásio dela lá na Vila Buriti. Ensina a criatura a bater com a força das eras.'),
            ['dar', 'pt-45'], ['flag', 'm-raizes-ok'],
          ], [f(SUCUPIRA, 'Ainda faltam frutos: um pequi, um buriti e uma acerola. Tem pequi no cerrado e no Pantanal, buriti na Vereda e acerola por aí, escondida em moita.')]),
        ], [
          f(SUCUPIRA, 'Quer me ajudar, menino? Para o meu xarope das três raízes eu preciso de um pequi, um buriti e uma acerola. Minhas pernas não vão mais tão longe.'),
          ['simnao', 'Ajudar a raizeira com os três frutos?', 'b1-sim'],
          se('flag:b1-sim', [['flag', 'm-raizes'], f(SUCUPIRA, 'Deus lhe pague. Traga quando achar, sem pressa: planta que cura não tem pressa.')], [f(SUCUPIRA, 'Tudo bem. A porta fica aberta.')]),
        ]),
      ]),
    ],
  },

  /* ============================== MISSÃO: DOCE DE BURITI ============================== */
  {
    id: 'b1-doceira',
    passos: [
      se('flag:m-doce-ok', [f('b1-doceira', 'O tacho está cheio de doce de buriti graças a você! Volte sempre que a tristeza bater. Ou a fome.')], [
        ['temItens', 'buriti', 3, 'b1-tem-buriti3'],
        se('flag:b1-tem-buriti3', [
          f('b1-doceira', 'Três frutos de buriti, maduros que só! Agora sim sai o doce. Me dê aqui que eu já ponho no tacho.'),
          ['tirar', 'buriti', 3],
          f('b1-doceira', 'Leve rapadura para a viagem e garapa para a sede. Criatura cansada sobe de nível com rapadura, viu?'),
          ['dar', 'rapadura', 3], ['dar', 'garapa', 2], ['flag', 'm-doce-ok'],
        ], [
          f('b1-doceira', 'Ô, meu filho, a receita do doce de buriti pede três frutos e o buritizal da Vereda está cheio de bicho. Eu não tenho mais idade para brigar com Antão.'),
          f('b1-doceira', 'Se você achar três frutos de buriti por aí, traga aqui. Pago em rapadura, que é a moeda mais forte do Sertão.'),
        ]),
      ]),
    ],
  },

  /* ============================== MISSÃO: CARTA NA ASA (10A-29) ============================== */
  {
    id: 'b1-violeiro',
    passos: [
      se('flag:m-carta-b1-ok', [f('b1-violeiro', 'A Açucena mandou dizer que vem para a festa de São João no Arraial! Já estou afinando a viola. E o coração.')], [
        se('flag:m-carta-b1-resposta', [
          f('b1-violeiro', 'Resposta dela?! Deixa eu ler… "Volte quando a viola aprender a minha moda." Ela escreveu a moda embaixo!'),
          f('b1-violeiro', 'Vinte anos esperando essa moda. Tome, é o pergaminho que o meu pai ganhou numa cantoria. Ensina a sumir que nem saudade.'),
          ['dar', 'pt-44'], ['flag', 'm-carta-b1-ok'],
        ], [
          se('flag:m-carta-b1', [f('b1-violeiro', 'O meu Bem-te-viço está no seu ombro, com a carta no pé. Leve até Porto Pantaneiro, na casa larga ao lado do Posto. Ele só desce do seu ombro quando vir a Açucena.')], [
            f('b1-violeiro', 'Você vai para os lados de Porto Pantaneiro, Campeão? Eu tenho uma carta para a Dona Açucena. Escrevi faz vinte anos e nunca tive coragem de mandar.'),
            f('b1-violeiro', 'O correio do Sertão é por ave: o meu Bem-te-viço leva a carta presa no pé e vai no seu ombro até lá. Ele não luta, não come muito e canta de manhã.'),
            ['simnao', 'Levar a carta do violeiro para Porto Pantaneiro?', 'b1-sim'],
            se('flag:b1-sim', [
              ['flag', 'm-carta-b1'], ['sfx', 'item-obtido'],
              f(null, 'O Bem-te-viço do violeiro pousou no ombro de {JOGADOR}, com a carta enrolada no pé.'),
              f('b1-violeiro', 'Porto Pantaneiro fica no fim do canal do Pantanal, rio abaixo. Diga que é do Zabelê. Ela vai saber.'),
            ], [f('b1-violeiro', 'Tudo bem. Esperei vinte anos, espero mais uma semana.')]),
          ]),
        ]),
      ]),
    ],
  },
  {
    id: 'b1-acucena',
    passos: [
      se('flag:m-carta-b1&!flag:m-carta-b1-resposta', [
        ['emote', 'b9-acucena', '!'],
        f(null, 'O Bem-te-viço desce do ombro de {JOGADOR}, pousa na mesa e estica o pé com a carta.'),
        f('b9-acucena', 'Um Bem-te-viço de Vila Cascavel… essa letra eu conheço. É do Zabelê! Vinte anos e ele não muda a letra.'),
        f('b9-acucena', 'Espere aí, que eu escrevo a resposta agora. E vou mandar a moda que eu fiz para ele. Ele nunca soube tocar.'),
        ['esperar', 600], ['sfx', 'item-obtido'], ['flag', 'm-carta-b1-resposta'],
        f(null, 'O Bem-te-viço voltou para o ombro de {JOGADOR} com a resposta presa no pé.'),
      ], [
        se('flag:m-carta-b1-resposta', [f('b9-acucena', 'Já respondi. Agora é com ele. E com a viola.')], [
          f('b9-acucena', 'Moro aqui há vinte anos. Costuro, canto e espero carta de Vila Cascavel. A carta nunca vem.'),
        ]),
      ]),
    ],
  },

  /* ============================== MISSÃO: O NINHO DO TELHADO (um dia de relógio) ============================== */
  {
    id: 'b1-ninho',
    passos: [
      se('flag:m-ninho-ok', [f('b2-brejeira', 'O casal de Tuiuiú voltou ao ninho e os ovos estão inteiros. Graças a você, menino.')], [
        se('flag:m-ninho', [
          ['b1-dia-passou', 'm-ninho-dia', 'b1-ninho-pronto'],
          se('flag:b1-ninho-pronto', [
            f('b2-brejeira', 'Um dia inteiro e nenhum ovo sumiu! O pessoal disse que viu você rondando o telhado e espantando urubu.'),
            f('b2-brejeira', 'Tome: Cuia de Mel, que filhote ama, e este pergaminho que o meu finado marido ganhou num rodeio.'),
            ['dar', 'cuia-mel', 3], ['dar', 'pt-43'], ['flag', 'm-ninho-ok'],
          ], [f('b2-brejeira', 'Ainda não virou o dia, menino. Ninho de Tuiuiú se vigia de sol a sol. Volte amanhã e me conte.')]),
        ], [
          f('b2-brejeira', 'O casal de Tuiuiú do meu telhado saiu para pescar no Pantanal e eu preciso ir a Porto Pantaneiro. Quem vai vigiar os ovos?'),
          ['simnao', 'Vigiar o ninho da Dona Brejeira até amanhã?', 'b1-sim'],
          se('flag:b1-sim', [
            ['flag', 'm-ninho'], ['b1-marcar-dia', 'm-ninho-dia'],
            f('b2-brejeira', 'Fique de olho no céu: urubu, gavião e gente de macacão ferrugem. Volte amanhã, que eu já estarei de volta.'),
          ], [f('b2-brejeira', 'Tudo bem. Eu peço para a Jandira. Ela vai dormir em cima do telhado, mas vai.')]),
        ]),
      ]),
    ],
  },

  /* ============================== MISSÃO: FILHOTES RESGATADOS (um por dia) ============================== */
  {
    id: 'b1-orfaos',
    passos: [
      se('!flag:pantanal-ok', [
        f('b2-veterinaria', 'Sou a Drª Taiamã, veterinária do Centro. Estamos de mãos atadas: o Cartel Ferrugem está saqueando o ninhal do sul.'),
        f('b2-veterinaria', 'Quando os ninhos estiverem seguros, os filhotes que eles roubaram vão chegar aqui. E vão precisar de alguém que cuide.'),
      ], [
        ['b1-dia-passou', 'm-orfaos-dia', 'b1-orfao-novo-dia'],
        se('flag:m-orfaos-dia&!flag:b1-orfao-novo-dia', [f('b2-veterinaria', 'Hoje você já adotou um filhote. Um por dia, para cada um receber atenção de verdade. Volte amanhã!')], [
          f('b2-veterinaria', 'Os filhotes resgatados do Cartel estão crescendo! Soltos no mato eles não sobreviveriam: aprenderam a viver em gaiola.'),
          f('b2-veterinaria', 'Com um treinador eles aprendem a caçar, a nadar e a voar. Um filhote por dia, combinado? Assim cada um recebe atenção.'),
          f('b2-veterinaria', 'E não se preocupe com o tamanho: aqui eles comem bem e treinam com a gente. Saem quase no passo da sua equipe.'),
          ['b1-orfao-menu'],
          se('!flag:b1-orfao-algum', [f('b2-veterinaria', 'Todos os filhotes já têm treinador! Você foi incrível. O Centro nunca esteve tão vazio, e isso é ótimo.'), ['flag', 'm-orfaos-ok']]),
          ...[...ORFAOS_NINHAL, ...ORFAOS_MINA].map((n): Comando => se(`flag:b1-orfao-sel-${n}`, [
            ['darCriatura', n, ORFAO_NV, { apelidar: true }], ['b1-orfao-crescer', n], ['flag', `orfao-${n}`], ['b1-marcar-dia', 'm-orfaos-dia'], ['flag', 'm-orfaos'],
            f('b2-veterinaria', 'Cuide bem dele. E traga para visitar: a tratadora vai chorar de saudade.'),
          ])),
        ]),
      ]),
    ],
  },

  /* ============================== MISSÃO: CINCO NINHOS (observadora) ============================== */
  {
    id: 'b1-observadora',
    passos: [
      se('flag:m-fotos-ok', [f('observadora', 'As suas fotos estão no mural da Estação de Pesquisa! A Bióloga Ingá chorou. Eu também.')], [
        se('flag:m-fotos', [
          se('flag:m-foto-1&flag:m-foto-2&flag:m-foto-3&flag:m-foto-4&flag:m-foto-5', [
            f('observadora', 'Cinco ninhos! Vereda, cerrado duas vezes, o Morro do Urucum e o pasto de Pantanal Grande. Sem encostar em nenhum!'),
            f('observadora', 'Fique com a câmera, ela é sua. E com estas penas que eu juntei do chão: pena caída é presente.'),
            ['dar', 'camera-de-bolso'], ['dar', 'pena-colorida', 3], ['dar', 'pt-39'], ['flag', 'm-fotos-ok'],
          ], [f('observadora', 'Faltam ninhos! Um na Vereda dos Buritis, dois aqui no cerrado, um no Pantanal Alagado, perto do Morro do Urucum, e um no pasto de Pantanal Grande.')]),
        ], [
          f('observadora', 'Psiu! Estou fazendo o censo dos ninhos do Sertão para a Estação de Pesquisa, mas os meus joelhos não sobem mais em cupinzeiro.'),
          ['simnao', 'Fotografar cinco ninhos para a observadora?', 'b1-sim'],
          se('flag:b1-sim', [
            ['flag', 'm-fotos'],
            f('observadora', 'Leve a minha câmera. Regra de ouro: olhar, fotografar e ir embora. Ninho tocado é ninho abandonado.'),
            f('observadora', 'Tem um na Vereda dos Buritis, dois aqui no cerrado, um no Pantanal Alagado, perto do Morro do Urucum, e um no pasto de Pantanal Grande.'),
          ], [f('observadora', 'Quando mudar de ideia, estarei aqui. Imóvel. Observadora de ave aprende a esperar.')]),
        ]),
      ]),
    ],
  },
  foto(1, 'no buritizal da Vereda'),
  foto(2, 'na beira da lagoa do cerrado'),
  foto(3, 'no alto da mesa de pedra do cerrado'),
  foto(4, 'na ilha do Morro do Urucum'),
  foto(5, 'no pé de buriti do pasto de Pantanal Grande'),

  /* ============================== MISSÃO: TROCA COM O CRIADOR (10A-12) ============================== */
  {
    id: 'b1-troca',
    passos: [
      se('flag:m-troca-b1-ok', [f('b1-criador', 'E o Tucanuçu, como vai lá em Pantanal… ah, não, ele está comigo. O Corisco é que está com você! Ele obedece direitinho?')], [
        f('b1-criador', 'Viajante! Eu crio emas e troco com quem passa. Bicho que viaja aprende mais.'),
        f('b1-criador', 'Ando querendo um Tucanuçu, desses de bico em chamas. Em troca dou o meu Emaçu, o Corisco. Corre mais que o trem e vai segurando um Unguento.'),
        ['temEspecie', 50, 'b1-tem-tucanucu'],
        se('flag:b1-tem-tucanucu', [
          ['simnao', 'Trocar o seu Tucanuçu pelo Emaçu Corisco?', 'b1-sim'],
          se('flag:b1-sim', [
            ['b1-trocar', 50, 102, 46, 'Corisco', 'unguento', 'b1-trocou'],
            se('flag:b1-trocou', [
              ['sfx', 'cuia-sucesso'],
              f(null, '{JOGADOR} trocou o Tucanuçu pelo Emaçu Corisco!'),
              f('b1-criador', 'Cuide bem dele! Criatura trocada aprende mais rápido, mas só obedece se você tiver insígnias para isso. Você tem de sobra.'),
              ['flag', 'm-troca-b1-ok'],
            ]),
          ], [f('b1-criador', 'Tudo bem. Proposta não vence.')]),
        ], [f('b1-criador', 'Tucanuçu tem muito na Vereda dos Buritis, ao norte. Pegue um e volte que o Corisco espera.')]),
      ]),
    ],
  },

  /* ============================== PANTANAL: O NINHAL (pantanal-ok) ============================== */
  {
    id: 'b1-pantanal',
    passos: [
      se('!flag:pantanal-ok', [
        ['emote', 'arame', '!'],
        f(ARAME, 'Alto lá! Ninhal cercado: propriedade do Cartel Ferrugem, por ordem do Coronel Garrote. Arame farpado, ouviu? Farpado!'),
        f(ARAME, 'Esses ovos de tuiuiú vão descer o rio no próximo barco. Lá fora pagam uma fortuna por bicho do Pantanal em gaiola de ouro.\fE você… você é o tal Campeão que amassou a Lata e entortou o Rebite. Pois comigo o arame enrola!'),
        ['batalha', 'B-PA-arame'],
        f(ARAME, 'Desenrolou… Arame velho, esse meu.'),
        f(ARAME, 'Fique com o seu ninhal! A rede do canal sul eu deixo de lembrança. Ah, não: a Polícia vai tirar. Que seja!\fMas guarde o meu nome: o Rebite está esperando você na Chapada Rubra. E ele não esquece desaforo.'),
        ['fade', 'fora'], ['esconder', 'arame'], ['esconder', 'B-PA-5'], ['esconder', 'B-PA-6'], ['esconder', 'B-PA-7'],
        ['flag', 'pantanal-ok'], ['esperar', 500], ['fade', 'dentro'],
        f(null, 'O tenente Arame fugiu pelo canal, com os capangas atrás.\fOs peões da Zefa devolvem os ovos aos ninhos, um por um. Os tuiuiús voltam a pousar no ninhal.'),
        f({ nome: 'Peão Bastião', retrato: 'cl-vaqueiro' }, 'Campeão! A rede do Cartel saiu do canal sul e a porteira da Estrada Vermelha vai abrir. Porto Pantaneiro está livre de novo!\fA Zefa mandou isto de agradecimento. Ela disse que é para "quem não tem medo de lama".'),
        ['dar', 'elixir-andiroba', 2], ['dar', 'pt-40'],
        f({ nome: 'Peão Bastião', retrato: 'cl-vaqueiro' }, 'Os filhotes que o Cartel tirou dos ninhos foram para o Centro de Reabilitação de Pantanal Grande. A Drª Taiamã procura quem adote.'),
        ['musica', 'agua'], ['salvar'],
      ]),
    ],
  },

  /* ============================== CHAPADA RUBRA: A MINA VELHA (mina-ok) ============================== */
  {
    id: 'b1-mina-jaula',
    passos: [
      se('flag:mina-ok', [f(null, 'A gaiola está vazia e aberta. No fundo ficou só um fiapo de pena de arara.')], [
        ['grito', 51],
        f(null, 'Uma gaiola do Cartel Ferrugem com filhotes de Ararinha amontoados. O cadeado tem o símbolo de uma engrenagem enferrujada.\fQuem tem a chave é o tenente.'),
      ]),
    ],
  },
  {
    id: 'b1-mina',
    passos: [
      se('!flag:mina-ok', [
        ['emote', 'rebite', '!'],
        f(TOPAZIO, 'Ô menino! Desamarra aqui… não, primeiro tira esse aparafusado da minha mina!'),
        f(REBITE, 'Quieto aí, garimpeiro! VOCÊ! O moleque do Farol! Eu fui rebaixado a tenente de mina por sua culpa!\fAqui embaixo tem quarenta ovos do ninhal, doze filhotes de arara e um garimpeiro teimoso. Tudo meu. Saia ou vire parafuso!'),
        ['batalha', 'B3-rebite'],
        f(REBITE, 'Espanou… a rosca espanou de novo! O Coronel vai me mandar para o Brejo Roxo limpar tanque.'),
        f(REBITE, 'Fique com a mina, com o garimpeiro e com os bichos! Eu vou… eu vou para a superfície. Pela escada. Que eu odeio.'),
        ['fade', 'fora'], ['esconder', 'rebite'], ['esconder', 'B3-M-4'], ['esconder', 'B3-M-5'], ['esconder', 'B3-M-6'],
        ['flag', 'mina-ok'], ['sfx', 'quebrar'], ['esperar', 500], ['fade', 'dentro'],
        f(null, 'As gaiolas se abrem uma a uma. As Ararinhas saem voando pela galeria em direção à luz, e os ovos do ninhal vão para um cesto de palha forrado.'),
        f(TOPAZIO, 'Ufa! Três dias amarrado ouvindo esse sujeito assobiar fora do tom.\fObrigado, Campeão. A mina voltou a ser do povo da chapada. Os ovos voltam para o Pantanal no primeiro barco, e os filhotes que não sabem voar vão para o Centro de Reabilitação.'),
        f(TOPAZIO, 'Agora eu vou subir, tomar um banho de bateia e abrir o ginásio. Pode ir lá me desafiar quando quiser: vagonete, desvio e pedra bruta.\fE não pense que eu vou pegar leve só porque você me desamarrou!'),
        ['dar', 'pepita', 2], ['dar', 'garrafada', 2],
        ['musica', 'caverna'], ['salvar'],
      ]),
    ],
  },

  /* ============================== CAVERNA VULCÂNICA: BOITATÁ (depois da insígnia 10) ============================== */
  {
    id: 'b1-boitata',
    passos: [
      se('flag:boitata-ok', [f(null, 'O salão está quieto. O chão ainda é morno, e as paredes têm marcas de fogo em forma de serpente.')], [
        se('!insignia:10', [
          f(null, 'No fundo do salão, uma serpente de fogo dorme enrolada sobre a pedra. A respiração dela faz a lava borbulhar.\fEla nem abre os olhos. Parece esperar alguém com a força da Chapada Rubra.'),
        ], [
          ['grito', 173], ['tremor', 600],
          f(null, 'A serpente de fogo abre os olhos. O salão inteiro clareia como se o sol tivesse entrado na caverna.'),
          f(null, 'O BOITATÁ desperta, sentindo a Insígnia Cristal!'),
          ['selvagem', 173, 57, { lendario: true }],
          ['b1-resultado'],
          se('flag:b1-capturou', [['flag', 'boitata-ok'], ['esconder', 'boitata'], f(null, 'O Boitatá se acomodou na cuia, morno como brasa de fogão.')]),
          se('flag:b1-venceu', [
            // lendário derrotado sem captura some para sempre (decisão do autor; spec 6.4): `boitata-dormiu` = derrotado
            ['flag', 'boitata-ok'], ['flag', 'boitata-dormiu'], ['esconder', 'boitata'],
            f(null, 'O Boitatá se desfez em brasas e afundou na lava. A caverna esfriou de vez: ele não foi mais visto.'),
          ]),
          se('!flag:b1-capturou&!flag:b1-venceu', [f(null, 'O Boitatá se enrola de novo sobre a pedra, de olhos semiabertos. Ele continua ali, esperando.')]),
        ]),
      ]),
    ],
  },

  /* ============================== ARRAIAL BRASA: RIVAL 6 ============================== */
  {
    id: 'b1-rival-6',
    passos: [
      se('!flag:rival-6', [
        ['emote', 'taina-b4', '!'],
        f(TAINA, '{JOGADOR}!! Eu sabia que você ia subir a chapada por aqui. Eu subi pela trepadeira também, mas caí duas vezes.'),
        ...batalhaRival6,
        se('flag:batalha-perdida', [f(TAINA, 'Ganhei! Ganhei do Campeão da Liga! Anota aí, Rádio Cipó!\fMas… a sua equipe está cansada da subida. Não valeu tanto assim. Vá ao Posto e volte que eu ganho de novo.')], [
          f(TAINA, 'Sabe o que eu descobri no Sertão? Que perder de você não dói mais tanto. Dói só um pouco. É progresso.'),
          f(TAINA, 'A Labareda acende as fogueiras do ginásio na ordem de uma música. Eu errei a nota três vezes. Boa sorte, e não conte para ninguém que eu dei dica.'),
        ]),
        ['fade', 'fora'], ['esconder', 'taina-b4'], ['fade', 'dentro'],
      ]),
    ],
  },

  /* ============================== MISSÃO: SÃO JOÃO (sábados) ============================== */
  {
    id: 'b1-sao-joao',
    passos: [
      ['b1-calendario'],
      se('flag:m-sao-joao-ok', [f('b4-festeira', 'O melhor marcador de quadrilha que o Arraial já teve! Volte todo sábado: o quentão é de graça e a bandeirinha é de papel.')], [
        se('!flag:b1-sabado', [
          f('b4-festeira', 'A festa de São João é no sábado, no terreiro. Fogueira, quadrilha, pé-de-moleque e quentão.'),
          f('b4-festeira', 'Volte no sábado que eu preciso de um marcador para a quadrilha. O Seu Anarriê se aposentou e a sanfona não espera.'),
        ], [
          f('b4-festeira', 'É SÁBADO! Dia de São João! E o marcador da quadrilha sumiu. Você marca para a gente? É só responder certo a cada passo!'),
          ['escolha', 'O sanfoneiro puxa o baião. O que o marcador grita primeiro?', ['Balancê!', 'Olha a chuva!', 'Anarriê!'], 'b1-qd'], ['opcao', 'b1-qd'],
          se('flag:b1-qd-0', [
            ['escolha', 'Os pares balançaram. Agora vem a pegadinha da quadrilha:', ['Olha a cobra!', 'Todo mundo sentado!', 'Cadê o fole?'], 'b1-qd'], ['opcao', 'b1-qd'],
            se('flag:b1-qd-0', [
              ['escolha', 'Todos gritam "Olha a cobra!". E a resposta é…', ['É mentira!', 'Corre!', 'Chama o vaqueiro!'], 'b1-qd'], ['opcao', 'b1-qd'],
              se('flag:b1-qd-0', [
                ['sfx', 'insignia'],
                f('b4-festeira', 'É MENTIRA! Isso, marcador! O terreiro inteiro caiu na risada e a fogueira subiu alta!'),
                f('b4-festeira', 'Tome o seu prêmio de São João: Pedra Solar, que a Ferreira Labareda diz que guarda o calor da fogueira, e pé-de-moleque. Quer dizer, rapadura. Acabou o pé-de-moleque.'),
                ['dar', 'pedra-solar'], ['dar', 'rapadura', 2], ['flag', 'm-sao-joao-ok'],
              ], [f('b4-festeira', 'Não, não! Quando gritam "olha a cobra", a resposta é que é mentira! Respire e tente de novo.')]),
            ], [f('b4-festeira', 'A pegadinha é a cobra, marcador! Tente de novo, que a quadrilha espera.')]),
          ], [f('b4-festeira', 'Começa com o balancê, marcador! Balançar primeiro, correr depois. Tente de novo.')]),
        ]),
      ]),
    ],
  },

  /* ============================== MISSÃO: PEPITAS ============================== */
  {
    id: 'b1-pepitas',
    passos: [
      se('flag:m-pepitas-ok', [f('b3-cascalho', 'Três pepitas na minha coleção nova! Agora tenho onze. Quer dizer, tenho três e oito de pirita.')], [
        ['temItens', 'pepita', 3, 'b1-tem-pepitas'],
        se('flag:b1-tem-pepitas', [
          f('b3-cascalho', 'Três pepitas! Brilho de verdade, não é pirita! Deixe eu morder para conferir… é ouro!'),
          ['tirar', 'pepita', 3],
          f('b3-cascalho', 'Trato é trato: um pergaminho por três pepitas. Esse ensina a criatura a deslizar a terra em cima do inimigo.'),
          ['dar', 'pt-40'], ['dar', 'cuia-ouro', 2], ['flag', 'm-pepitas-ok'],
        ], [f('b3-cascalho', 'Eu troco um pergaminho raro por três pepitas. Pepita sai de rocha rachada: na Estrada Vermelha, aqui na chapada e na Mina Velha. Quebre e procure!')]),
      ]),
    ],
  },

  /* ============================== MISSÃO: A FORJA GRANDE ============================== */
  {
    id: 'b1-forja',
    passos: [
      se('flag:m-forja-ok', [f('b4-malho', 'As Cuias de Ouro saíram perfeitas. Brasa de Boitatá não erra.')], [
        se('flag:boitata-ok', [
          f('b4-malho', 'Você viu o Boitatá?! Então você sabe o que é fogo de verdade. Com a brasa que ele deixa na pedra eu forjo qualquer coisa.'),
          ['temItens', 'pepita', 1, 'b1-tem-pepita'],
          se('flag:b1-tem-pepita', [
            ['simnao', 'Dar uma pepita ao Ferreiro Malho para ele forjar cuias?', 'b1-sim'],
            se('flag:b1-sim', [
              ['tirar', 'pepita', 1], ['sfx', 'quebrar'], ['tremor', 300],
              f('b4-malho', 'Ouro derretido no fogo do Boitatá e moldado na casca da cuieira… Pronto! Cuia de Ouro, cinco de uma vez!'),
              ['dar', 'cuia-ouro', 5], ['flag', 'm-forja-ok'],
            ], [f('b4-malho', 'Guarde, então. Ouro guardado também é ouro.')]),
          ], [f('b4-malho', 'Traga uma pepita que eu derreto no fogo do Boitatá e faço cuia de ouro para você.')]),
        ], [
          f('b4-malho', 'A Forja Grande faz sino, ferradura e facão. Mas o fogo daqui é fraco para ouro.'),
          f('b4-malho', 'Dizem que o Boitatá, lá na Caverna Vulcânica, deixa brasa que não apaga. Quem encontrar a serpente de fogo e voltar inteiro, me procure.'),
        ]),
      ]),
    ],
  },
];
export default EVENTOS_B1;
