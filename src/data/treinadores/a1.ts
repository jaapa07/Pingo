import type { TreinadorDef, MembroEquipe } from '../../core/tipos';

/**
 * Treinadores do time A1 (Costa do Sol, passos 1–3): Trilha do Ipê, Campos de Restinga, Mata dos Sabiás, Bosque Alto,
 * Trilha dos Cipós, Gruta do Eco e Porto Sereia — e os três primeiros duelos com a rival Tainá.
 * Curva (tabela 4.5): líder 1 nv 10–12 → rota 1 nv 3–6 · líder 2 nv 15–17 → nv 8–13 · líder 3 nv 20–22 → nv 15–19.
 */
const t = (id: string, classe: string, nome: string, sprite: string, equipe: MembroEquipe[], premio: number, desafio: string, derrota: string, depois: string, extra: Partial<TreinadorDef> = {}): TreinadorDef =>
  ({ id, classe, nome, sprite, equipe, ia: 'novato', premio, desafio, derrota, depois, ...extra });

/* ------------------------------ A-R1 · Trilha do Ipê ------------------------------ */
const TRILHA_DO_IPE: TreinadorDef[] = [
  t('A-R1-1', 'Pipeiro', 'Juquinha', 'cl-crianca-m', [{ e: 10, nv: 3 }], 60,
    'Ei! Você pisou na sombra da minha pipa! Isso dá batalha!', 'Minha pipa murchou…', 'Pipirim é fraquinho, mas é o primeiro a acordar. Bom para treinar cedo.'),
  t('A-R1-2', 'Escoteira', 'Margarida', 'cl-escoteira', [{ e: 13, nv: 3 }, { e: 10, nv: 4 }], 96,
    'Sempre alerta! E alerta vermelho: treinador novato na trilha!', 'Vou perder a medalha de vigia.', 'As saliências só se pulam para baixo. Para subir, dá a volta pelo caminho.'),
  t('A-R1-3', 'Pipeira', 'Naná', 'cl-crianca-f', [{ e: 13, nv: 4 }], 80,
    'A minha Cotiazinha rói até casca de coco. Quer ver?', 'Ela roeu foi a corda…', 'Dizem que no canteiro ali de cima o fruto cresce mais rápido se regar.'),
  t('A-R1-4', 'Observadora de Aves', 'Dona Íris', 'cl-observadora', [{ e: 45, nv: 5 }, { e: 10, nv: 5 }], 160,
    'Psiu! Você espantou o Quero-querinho que eu estava anotando. Agora vai ter que batalhar com ele.', 'Anotado: "treinador promissor, 1 exemplar".', 'De noite a trilha muda: sai o Pipirim, entra o Gambazinho. E a Corujinha, se você tiver sorte.'),
  t('A-R1-5', 'Mateira', 'Jacira', 'cl-mateira', [{ e: 13, nv: 5 }, { e: 20, nv: 6 }], 192,
    'Estou guardando o canteiro. E guardando umas batalhas para quem passa.', 'Pois é. Guardei mal.', 'Gambazinho finge de morto quando perde. Não se preocupe, ele levanta sozinho.'),
  t('A-R1-6', 'Pescador', 'Seu Lambari', 'cl-pescador', [{ e: 37, nv: 6 }], 144,
    'Peixe hoje não deu. Vai ter que dar batalha!', 'Nem peixe, nem vitória. Que dia.', 'Vila Caiçara é logo ali. O ginásio de lá é do tipo Vento: Trovão e Pedra resolvem.'),
];

/* ------------------------------ A-R2 · Campos de Restinga ------------------------------ */
const CAMPOS_DE_RESTINGA: TreinadorDef[] = [
  t('A-R2-1', 'Escoteira', 'Violeta', 'cl-escoteira', [{ e: 15, nv: 8 }, { e: 13, nv: 9 }], 216,
    'Acampei aqui para ganhar a medalha de duna. Ganhar de você vale outra!', 'Fico só com a de duna, então.', 'Lagartim evolui cedo, no nível 7. Se o seu ainda não virou casulo, é teimosia dele.'),
  t('A-R2-2', 'Pipeiro', 'Tatu-Bolinha', 'cl-crianca-m', [{ e: 33, nv: 9 }], 144,
    'Meu apelido é por causa do meu Tatuzim. Ele se enrola e eu também!', 'A gente se enrolou feio.', 'Tatuzim é do tipo Terra: choque de Trovão nem faz cócegas nele.'),
  t('A-R2-3', 'Observadora de Aves', 'Dona Garça', 'cl-observadora', [{ e: 10, nv: 9 }, { e: 45, nv: 9 }, { e: 47, nv: 10 }], 320,
    'Avistei um Beija-florzim neste capim. Ele é meu — e você também vai ser, de freguês.', 'Voou tudo.', 'Beija-florzim só aparece de dia e é raro. Dizem que uma Pedra Solar faz ele mudar.'),
  t('A-R2-4', 'Surfista', 'Maré-Mansa', 'cl-surfista', [{ e: 41, nv: 10 }, { e: 37, nv: 10 }], 280,
    'Sem onda hoje, parceiro. Bora batalhar para não perder o costume.', 'Tomei um caldo em terra firme.', 'Essas dunas escondem coisa. Quem tem o Faro acha concha, fruto e até pergaminho.'),
  t('A-R2-5', 'Mateira', 'Araci', 'cl-mateira', [{ e: 81, nv: 10 }, { e: 20, nv: 10 }], 320,
    'Meu Jabutim anda devagar, mas chega. E quando chega, você vai ver!', 'Chegou atrasado.', 'Jabutim é Mata e Pedra: aguenta muita pancada, mas golpe de Ginga racha o casco.'),
  t('A-R2-6', 'Capoeirista', 'Mestre Pezinho', 'cl-capoeirista', [{ e: 13, nv: 10 }, { e: 41, nv: 11 }], 396,
    'Na areia fofa o jogo é outro. Entra na roda, camará!', 'Caí no rolê.', 'Calanguinho gosta de sol a pino. De noite ele some e a restinga fica do Gambazinho.'),
  t('A-R2-7', 'Bióloga', 'Drª Aroeirinha', 'cl-biologa', [{ e: 149, nv: 10 }, { e: 27, nv: 11 }], 440,
    'Estou catalogando o que cai dos cajueiros. Você acabou de cair na minha amostra!', 'Dado descartado.', 'Jataí e Pintinhas só caem das árvores de dia. De noite, quem cai é coisa de focinho comprido.'),
  t('A-R2-8', 'Pipeira', 'Sabiazinha', 'cl-crianca-f', [{ e: 15, nv: 9 }, { e: 16, nv: 10 }], 200,
    'A Mata dos Sabiás é logo ali, mas antes tem eu!', 'Tá, pode passar.', 'Lá dentro é um labirinto. Minha dica: vá pelo sul, depois leste, depois norte. Ou era o contrário?'),
];

/* ------------------------------ A-MS · Mata dos Sabiás ------------------------------ */
const MATA_DOS_SABIAS: TreinadorDef[] = [
  t('A-MS-1', 'Mateira', 'Sumaúma', 'cl-mateira', [{ e: 95, nv: 12 }, { e: 22, nv: 12 }, { e: 16, nv: 12 }], 480,
    'Quase na saída, hein? Quase. Antes passa por mim.', 'Passou. E com folga.', 'Bosque Alto é subindo por aqui. A líder de lá, Dona Seda, tece armadilha com criatura do tipo Inseto.'),
  t('A-MS-2', 'Pipeira', 'Flor-de-Maio', 'cl-crianca-f', [{ e: 13, nv: 10 }, { e: 15, nv: 10 }], 200,
    'Me perdi faz duas horas, mas não conta para ninguém. Batalha comigo?', 'Perdida e derrotada. Que tarde.', 'Se pular a saliência do capinzal lá de cima, cai bem aqui. É atalho só de vinda.'),
  t('A-MS-3', 'Escoteira', 'Bromélia', 'cl-escoteira', [{ e: 95, nv: 11 }, { e: 59, nv: 11 }], 396,
    'Este corredor é o único caminho para o leste. Pedágio: uma batalha!', 'Pedágio devolvido.', 'Ouriço-Mirim só sai de noite. De dia ele vira uma bola de espinho e ronca.'),
  t('A-MS-4', 'Bióloga', 'Drª Imbaúba', 'cl-biologa', [{ e: 157, nv: 12 }, { e: 17, nv: 12 }], 528,
    'Achei um Louvadeuzim! Raro! Vou testar os reflexos dele em você.', 'Reflexos anotados: os seus são melhores.', 'Tem uma Coralzinha nesta mata. Muito, muito rara. Se vir anéis brilhando no capim, prepare a cuia.'),
  t('A-MS-5', 'Pescador', 'Seu Traíra', 'cl-pescador', [{ e: 37, nv: 11 }, { e: 37, nv: 11 }, { e: 57, nv: 12 }], 432,
    'O Lago Parado não dá peixe grande. Dá é raiva. Desconta comigo!', 'Hoje nem a raiva rendeu.', 'Tem uma ilhota no meio do lago com alguma coisa brilhando. Só de canoa.'),
  t('A-MS-6', 'Capoeirista', 'Contramestre Cipó', 'cl-capoeirista', [{ e: 63, nv: 12 }, { e: 22, nv: 12 }], 468,
    'Meu Bugiozinho treina ginga pendurado no galho. Vem pro jogo!', 'O galho quebrou.', 'Bugiozinho é do tipo Ginga. Com o Facão na mão, ele corta cipó que é uma beleza.'),
  t('A-MS-7', 'Observadora de Aves', 'Dona Juriti', 'cl-observadora', [{ e: 49, nv: 12 }, { e: 43, nv: 12 }, { e: 10, nv: 13 }], 520,
    'Tucaninho de dia, Corujinha de noite: eu não durmo, eu anoto. E batalho!', 'Preciso dormir.', 'Atrás desses cipós aqui embaixo tem um bosque fechado. Sem Facão, só olhando.'),
  t('A-MS-8', 'Repentista', 'Zé Rima', 'cl-repentista', [{ e: 153, nv: 12 }, { e: 20, nv: 13 }], 572,
    'Neste beco sem saída / mora o verso e a peleja: / quem chegou perdido aqui / que vença ou que rasteje!', 'Fiquei sem rima / e sem criatura em cima.', 'Beco sem saída sempre tem tesouro. Regra de labirinto. Já olhou bem o chão?'),
];

/* ------------------------------ A3 · Bosque Alto ------------------------------ */
const BOSQUE_ALTO: TreinadorDef[] = [
  t('A3-1', 'Capoeirista', 'Jogo-de-Dentro', 'cl-capoeirista', [{ e: 63, nv: 13 }, { e: 157, nv: 13 }], 520,
    'Treino aqui no cantinho para não cair da passarela. Quer treinar junto?', 'Caí. Mas caí no chão firme.', 'Golpe de Ginga não funciona bem em Inseto. Contra a Dona Seda, eu só apanho.'),
  t('A3-2', 'Pipeiro', 'Grilo', 'cl-crianca-m', [{ e: 15, nv: 11 }, { e: 16, nv: 12 }, { e: 153, nv: 12 }], 264,
    'Vou ser líder de ginásio de Inseto quando crescer! Começo por você!', 'Vou crescer mais um pouco.', 'Cigarrim canta tão alto que atordoa. Já o meu só canta de madrugada, na minha janela.'),
];

/* ------------------------------ A-R3 · Trilha dos Cipós ------------------------------ */
const TRILHA_DOS_CIPOS: TreinadorDef[] = [
  t('A-R3-1', 'Observadora de Aves', 'Dona Saíra', 'cl-observadora', [{ e: 107, nv: 15 }, { e: 49, nv: 15 }, { e: 10, nv: 16 }], 640,
    'Uma Garcinha! Não se mexa! …Ah, você se mexeu. Batalha.', 'Vou observar treinadores, que dá menos prejuízo.', 'Garcinha é Vento e Rio. Um choque de Trovão nela dói em dobro do dobro.', { ia: 'treinador' }),
  t('A-R3-2', 'Escoteira', 'Trepadeira', 'cl-escoteira', [{ e: 57, nv: 15 }, { e: 18, nv: 15 }], 600,
    'Cortou o cipó? Então já pode apanhar de escoteira!', 'Quem apanhou fui eu.', 'O cipó cresce de novo quando você sai da trilha. A mata não guarda rancor, mas guarda cipó.', { ia: 'treinador' }),
  t('A-R3-3', 'Bióloga', 'Drª Samambaia', 'cl-biologa', [{ e: 155, nv: 16 }, { e: 18, nv: 16 }, { e: 28, nv: 16 }], 704,
    'Três insetos, três tipos diferentes. Vamos ver se você estudou.', 'Nota dez. Para você.', 'Lá no alto tem um platô com trepadeira. Só escala quem tem o Amuleto certo — e ele mora longe, no sertão.', { ia: 'treinador' }),
  t('A-R3-4', 'Capoeirista', 'Rabo-de-Arraia', 'cl-capoeirista', [{ e: 63, nv: 16 }, { e: 157, nv: 16 }], 640,
    'Estrada estreita, jogo apertado. Ginga, que eu quero ver!', 'Você gingou melhor.', 'Com o Amuleto da Força dá para empurrar pedregulho. Tem um cofre de pedra aqui perto esperando por isso.', { ia: 'treinador' }),
  t('A-R3-5', 'Mateira', 'Embira', 'cl-mateira', [{ e: 24, nv: 15 }, { e: 57, nv: 16 }, { e: 95, nv: 16 }], 640,
    'Quem atravessa a ponte paga com batalha. É costume antigo, de ontem.', 'Costume revogado.', 'As saliências do sul descem para o poção. Para voltar, só contornando pela beira do riacho.', { ia: 'treinador' }),
  t('A-R3-6', 'Repentista', 'Cego Aderaldo Neto', 'cl-repentista', [{ e: 153, nv: 16 }, { e: 153, nv: 17 }], 748,
    'Cantador que se preza / duela até com o eco: / prepare a sua criatura / que o meu verso é seco!', 'Perdi no verso e no bicho. / Me resta o capricho.', 'A Gruta do Eco repete tudo o que a gente fala. Já discuti com ela e perdi.', { ia: 'treinador' }),
  t('A-R3-7', 'Montanhista', 'Seu Penhasco', 'cl-montanhista', [{ e: 167, nv: 16 }, { e: 33, nv: 16 }, { e: 81, nv: 17 }], 748,
    'A gruta é ali. Mas antes de entrar em pedra, enfrente quem é de pedra!', 'Rolei morro abaixo.', 'Dentro da gruta só tem encontro onde o chão é de cascalho solto. No liso, pode andar sossegado.', { ia: 'treinador' }),
  t('A-R3-8', 'Pipeiro', 'Vaga-Lume', 'cl-crianca-m', [{ e: 28, nv: 15 }, { e: 28, nv: 15 }, { e: 24, nv: 15 }], 300,
    'Eu só saio de casa para caçar Vagalumim. E para ganhar de você!', 'Apagou a luz.', 'Vagalumim e Pererequinha só aparecem de noite. De dia eu fico aqui treinando a cara de mau.'),
];

/* ------------------------------ A-GE · Gruta do Eco ------------------------------ */
const GRUTA_DO_ECO: TreinadorDef[] = [
  t('A-GE-1', 'Garimpeiro', 'Zé Bateia', 'cl-garimpeiro', [{ e: 167, nv: 18 }, { e: 33, nv: 18 }, { e: 30, nv: 18 }], 864,
    'A saída é minha. Achei primeiro. Quer passar? Garimpa uma vitória!', 'Só achei cascalho.', 'Porto Sereia tem trem, tem cais e tem ginásio do tipo Rio. Leve Mata ou Trovão.', { ia: 'treinador' }),
  t('A-GE-2', 'Montanhista', 'Dona Estalactite', 'cl-montanhista', [{ e: 167, nv: 17 }, { e: 167, nv: 17 }, { e: 81, nv: 18 }], 792,
    'Ite ou ita? Stalactite desce, estalagmite sobe. E você, cai!', 'Caí eu. De cima.', 'O corredor ali ao norte leva ao salão da saída. O resto é passeio — com morcego.', { ia: 'treinador' }),
  t('A-GE-3', 'Pipeiro', 'Eco-Eco', 'cl-crianca-m', [{ e: 30, nv: 16 }, { e: 30, nv: 16 }], 320,
    'BATALHA! …alha! …lha! Ouviu? Até a gruta quer!', 'Perdi! …di! …di!', 'Morceguim é Vento e Assombro. Golpe Comum passa direto por ele, feito fumaça.'),
  t('A-GE-4', 'Garimpeiro', 'Chico Faísca', 'cl-garimpeiro', [{ e: 33, nv: 17 }, { e: 41, nv: 17 }, { e: 167, nv: 18 }], 864,
    'Dizem que tem pepita no lago. Enquanto não acho, acho briga.', 'Nem pepita, nem vitória.', 'A margem leste do lago dá a volta até o salão do fundo. A ponte também. Gruta boa é gruta com dois caminhos.', { ia: 'treinador' }),
  t('A-GE-5', 'Escoteira', 'Lanterninha', 'cl-escoteira', [{ e: 28, nv: 16 }, { e: 59, nv: 17 }], 612,
    'Minha tropa disse que eu não tinha coragem de entrar. Entrei! Agora batalha, que eu estou tremendo.', 'Tremendo e derrotada.', 'Pelo menos aqui dá para enxergar. Dizem que a Gruta Breu, do outro lado da baía, é um breu só.', { ia: 'treinador' }),
  t('A-GE-6', 'Pescador', 'Seu Bagre', 'cl-pescador', [{ e: 39, nv: 17 }, { e: 39, nv: 17 }, { e: 37, nv: 18 }], 648,
    'Mandizinho de gruta não tem olho, mas tem bigode que sente tudo. Sente só!', 'Sentiu que ia perder.', 'Mandizinho só se pesca aqui e no Pantanal. O Feirante de Porto Sereia paga bem para ver um.', { ia: 'treinador' }),
  t('A-GE-7', 'Bióloga', 'Drª Gotinha', 'cl-biologa', [{ e: 147, nv: 17 }, { e: 30, nv: 17 }, { e: 28, nv: 18 }], 792,
    'Estudo o que mora no escuro. E o que mora no escuro, hoje, vai estudar você!', 'O escuro perdeu.', 'Caranguejeirinha só sai da toca de noite. Aranha de gruta tem horário.', { ia: 'treinador' }),
];

/* ------------------------------ A4 · Porto Sereia ------------------------------ */
const PORTO_SEREIA: TreinadorDef[] = [
  t('A4-1', 'Surfista', 'Tubo', 'cl-surfista', [{ e: 37, nv: 18 }, { e: 57, nv: 18 }, { e: 24, nv: 19 }], 760,
    'Onda pequena, batalha grande. Cai dentro!', 'Vaca total.', 'A Capitã Marola treinou comigo quando era grumete. Hoje nem me cumprimenta — só de apito.', { ia: 'treinador' }),
  t('A4-2', 'Rendeira', 'Dona Bilro', 'cl-rendeira', [{ e: 17, nv: 18 }, { e: 27, nv: 18 }, { e: 149, nv: 19 }], 836,
    'Renda se faz com paciência. Batalha, também. Senta que lá vem ponto!', 'Embolou a linha.', 'Criatura do tipo Encanto não teme Lenda nenhuma. Guarde isso para o fim da sua viagem.', { ia: 'treinador' }),
  t('A4-3', 'Pescador', 'Seu Robalinho', 'cl-pescador', [{ e: 37, nv: 18 }, { e: 39, nv: 19 }, { e: 37, nv: 19 }], 760,
    'Este cais é do Clube do Anzol. Para pisar aqui, tem que fisgar uma vitória!', 'A linha arrebentou.', 'Do fim do cais para lá é a Baía Azul. Quando tiver o Remo, o mar é seu.', { ia: 'treinador' }),
];

/* ------------------------------ Rival Tainá (encontros 1 a 3) ------------------------------ */
/**
 * A Tainá sempre fica com o inicial que leva vantagem sobre o do jogador (Mata → ela leva Brasa; Brasa → Rio; Rio → Mata).
 * Sufixo do id = tipo do inicial DELA. Os três de cada encontro marcam a mesma flag (`rival-1`, `rival-2`, `rival-3`).
 */
const rival = (n: 1 | 2 | 3, dela: 'brasa' | 'rio' | 'mata', equipe: MembroEquipe[], premio: number, desafio: string, derrota: string): TreinadorDef => ({
  id: `rival-${n}-${dela}`, classe: 'Rival', nome: 'Tainá', sprite: 'taina', equipe, ia: n === 1 ? 'novato' : 'treinador', premio,
  desafio, derrota, musica: 'batalha-rival', flag: `rival-${n}`, ...(n === 3 ? { itens: ['garrafada'] } : {}),
});
const D1 = 'Então a professora te deu uma criatura também? Ótimo. A minha já nasceu ganhando de você!';
const P1 = 'Quê?! Isso foi… foi o sol no meu olho! Da próxima vez não tem desculpa. Nem para você!';
const D2 = 'Insígnia do Casulo? Eu peguei a minha ontem, de olho fechado. Vem, {JOGADOR}: vou mostrar o que é equipe de verdade!';
const P2 = 'De novo?! Tá, tá bom. Você treina… direitinho. Mas eu treino MAIS, ouviu?';
const D3 = 'Passe do Trem na mão, é? Antes de ir ver o sertão, {JOGADOR}, você vai ver estrela. Minha equipe evoluiu — e eu também!';
const P3 = 'Hunf. Perdi limpo, eu sei. …Aqueles capangas na Usina eram covardes com as criaturas. Você fez certo. Não conta para ninguém que eu disse isso.';
const RIVAL: TreinadorDef[] = [
  rival(1, 'brasa', [{ e: 4, nv: 5 }], 300, D1, P1),
  rival(1, 'rio', [{ e: 7, nv: 5 }], 300, D1, P1),
  rival(1, 'mata', [{ e: 1, nv: 5 }], 300, D1, P1),
  rival(2, 'brasa', [{ e: 10, nv: 13 }, { e: 24, nv: 14 }, { e: 5, nv: 16 }], 960, D2, P2),
  rival(2, 'rio', [{ e: 10, nv: 13 }, { e: 15, nv: 14 }, { e: 8, nv: 16 }], 960, D2, P2),
  rival(2, 'mata', [{ e: 10, nv: 13 }, { e: 41, nv: 14 }, { e: 2, nv: 16 }], 960, D2, P2),
  rival(3, 'brasa', [{ e: 11, nv: 20 }, { e: 24, nv: 20 }, { e: 28, nv: 21 }, { e: 5, nv: 23 }], 1380, D3, P3),
  rival(3, 'rio', [{ e: 11, nv: 20 }, { e: 17, nv: 20 }, { e: 28, nv: 21 }, { e: 8, nv: 23 }], 1380, D3, P3),
  rival(3, 'mata', [{ e: 11, nv: 20 }, { e: 41, nv: 20 }, { e: 28, nv: 21 }, { e: 2, nv: 23 }], 1380, D3, P3),
];

export const TREINADORES_A1: TreinadorDef[] = [
  ...TRILHA_DO_IPE, ...CAMPOS_DE_RESTINGA, ...MATA_DOS_SABIAS, ...BOSQUE_ALTO, ...TRILHA_DOS_CIPOS, ...GRUTA_DO_ECO, ...PORTO_SEREIA, ...RIVAL,
];
