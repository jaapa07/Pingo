import type { TreinadorDef, MembroEquipe } from '../../core/tipos';

/**
 * Treinadores do time B2-norte: Campos de Altitude (B-SG), Lagoa Gelada (B-LG), Caminho das Névoas (B-R5), Planalto Lume
 * (B8), a Subida do Pico Pindorama (PP, com dois capangas do Cartel) e a Floresta Ancestral (B-FA, pós-jogo).
 * Curva (spec 4.5): líder 14 ás 59 → B-SG e B-LG nv 55–57 · líder 15 ás 61 → B-R5 e B8 nv 55–59 · Pico depois do
 * líder 16 (ás 63) nv 62–64 · Floresta Ancestral (pós-jogo) nv 66–72. Só estágios finais (todas as linhas por nível
 * já evoluíram abaixo de 46). Itens de cura só no Veterano (regra do motor; nenhum treinador comum tem `itens`).
 * O Conselho, o Garrote e a rival 8 ficam em src/data/treinadores/conselho.ts.
 */
const t = (id: string, classe: string, nome: string, sprite: string, equipe: MembroEquipe[], desafio: string, derrota: string, depois: string, extra: Partial<TreinadorDef> = {}): TreinadorDef =>
  ({ id, classe, nome, sprite, equipe, ia: 'treinador', premio: 40 * Math.max(...equipe.map((m) => m.nv)), desafio, derrota, depois, ...extra });
const m = (...xs: [number, number][]): MembroEquipe[] => xs.map(([e, nv]) => ({ e, nv }));

/* ------------------------------ B-SG · Campos de Altitude (nv 55–57) ------------------------------ */
const CAMPOS: TreinadorDef[] = [
  t('B-SG-1', 'Vaqueiro', 'Peão Charqueada', 'cl-vaqueiro', m([138, 55], [102, 56]),
    'Tchê! Campo de altitude é campo de peão. Aqui o vento é minuano e a luta é no laço!', 'Me derrubou do pingo, tchê.', 'Quando a geada pega o capim, o Maracajá-Nevado sai para caçar. Só de noite, e só quem tem paciência vê.'),
  t('B-SG-2', 'Observadora de Aves', 'Dona Gralha', 'cl-observadora', m([136, 55], [12, 56]),
    'A Gralha-Azul planta pinheiro sem querer: enterra o pinhão e esquece. Eu não esqueço desafiante!', 'Agora eu vou esquecer essa luta.', 'O beija-flor dos campos só aparece de dia, perto das flores amarelas. De noite ele dorme encolhido como uma noz.'),
  t('B-SG-3', 'Escoteira', 'Lobinha Pinhão', 'cl-escoteira', m([140, 55], [162, 55], [138, 56]),
    'Acampamento de inverno! Barraca, fogueira e uma batalha para esquentar!', 'Esquentou. Demais.', 'O lago congelado do campo tem um tesouro no meio. Pise no gelo e deixe deslizar — mas mire antes!'),
  t('B-SG-4', 'Montanhista', 'Seu Altitude', 'cl-montanhista', m([166, 56], [34, 57]),
    'Mil e oitocentos metros de altura e eu ainda subo correndo. Quer ver quem perde o fôlego primeiro?', 'Perdi eu. O ar daqui é fino.', 'Lá do mirante norte, de madrugada, já ouvi um canto que fez a mata inteira calar. Os antigos dizem que é o Uirapuru.'),
  t('B-SG-5', 'Mateira', 'Araucária', 'cl-mateira', m([138, 56], [60, 56]),
    'Cuido das araucárias desde menina. Quem pisa em pinhão verde leva bronca — e batalha!', 'Leva bronca de mim, isso sim.', 'Sacuda as araucárias de tronco grosso: às vezes cai um Serelepão junto com o pinhão.'),
  t('B-SG-6', 'Repentista', 'Gaiteiro Minuano', 'cl-repentista', m([46, 56], [136, 57]),
    'Gaita no peito e verso na língua: / quem cruza o campo de mim não se livra!', 'A gaita desafinou, / e o verso também acabou.', 'Rumo norte, depois das pedras, tem uma trilha velha cercada. O Guardião do Campo só abre depois do Conselho.'),
  t('B-SG-7', 'Bióloga', 'Drª Turfa', 'cl-biologa', m([162, 55], [60, 55], [140, 57]),
    'Estudo o solo dos campos de altitude: turfa, musgo e Tuco-Escavador. Vamos ver o que você tem por baixo!', 'Escavei e achei a minha derrota.', 'O Tuquim mora em túneis que parecem um labirinto. Quando evolui, vira um minerador de Ferro.'),
];

/* ------------------------------ B-LG · Lagoa Gelada (nv 55–57) ------------------------------ */
const LAGOA: TreinadorDef[] = [
  t('B-LG-1', 'Pescador', 'Seu Pacu-Frio', 'cl-pescador', m([134, 55], [76, 56]),
    'Pescar no gelo é arte: faz o furo, joga a linha e espera. Esperei você!', 'Peguei resfriado em vez de peixe.', 'O Pinguimar surfa nas ondinhas da lagoa. Ninguém sabe como ele chegou à serra. Ele também não conta.'),
  t('B-LG-2', 'Surfista', 'Maré-Fria', 'cl-surfista', m([76, 55], [134, 56], [58, 56]),
    'Onda de lagoa é pequena, mas é minha! Rema que eu te pego!', 'Caí da prancha. Na água gelada.', 'A Lontra-Veloz desce a cachoeira da lagoa de costas. Exibida.'),
  t('B-LG-3', 'Mergulhador', 'Mergulhador Neblina', 'cl-mergulhador', m([132, 57]),
    'Só tenho um parceiro. Mas ele canta debaixo d’água e a lagoa inteira treme!', 'O canto parou. Que silêncio.', 'Dizem que, depois que alguém vencer o Conselho, uma baleia de verdade vai cantar no fundo desta lagoa. Eu acredito.'),
  t('B-LG-4', 'Observadora de Aves', 'Dona Tuiuiú', 'cl-observadora', m([106, 55], [156, 56]),
    'O Tuiuiú subiu do Pantanal atrás de mim. Ou eu subi atrás dele. Não importa: luta!', 'O Tuiuiú voltou para o Pantanal. Eu fico.', 'A Lavadeira-Dragão pousa nos juncos da margem. As asas dela parecem vitral quando o sol bate.'),
  t('B-LG-5', 'Pescador', 'Velho Lambari', 'cl-pescador', m([58, 56], [134, 56], [76, 57]),
    'Cinquenta invernos nesta lagoa. Você é o primeiro peixe que fala!', 'O peixe me pescou.', 'Ilha do meio? Só de canoa. Lá tem o barraco do meu compadre Joca, pescador da família Alva.'),
];

/* ------------------------------ B-R5 · Caminho das Névoas (nv 55–59) ------------------------------ */
const NEVOAS: TreinadorDef[] = [
  t('B-R5-1', 'Montanhista', 'Guia Cerração', 'cl-montanhista', m([94, 55], [66, 56]),
    'Na névoa eu ando de olho fechado. Você anda de Lampião? Então é desafio justo!', 'Acendeu a luz em mim.', 'A trilha sobe pelo pinheiral e desce até a Ponte do Cânion. Não saia dela: o cânion não tem fundo de mentira.'),
  t('B-R5-2', 'Observadora de Aves', 'Dona Urutau', 'cl-observadora', m([170, 56], [44, 56]),
    'O Urutau-Fantasma imita um galho seco. Eu imito uma observadora calma. Até agora!', 'Voltei a ser galho seco.', 'De noite, sacuda os pinheiros do mirante: o Noitão desce para reclamar e o Urutau-Fantasma desce para assustar.'),
  t('B-R5-3', 'Repentista', 'Cantador Neblinado', 'cl-repentista', m([94, 56], [172, 57]),
    'Quem anda na névoa escuta o que não vê: / um verso de longe, e o verso é para você!', 'A névoa engoliu meu verso, / e me deixou do avesso.', 'O degrau de pedra do campo é atalho de mão única. Desceu, desceu. Para subir, dá a volta.'),
  t('B-R5-4', 'Bióloga', 'Drª Bruma', 'cl-biologa', m([162, 56], [60, 57], [140, 57]),
    'Pesquiso como os bichos se orientam na névoa. Hipótese: pelo cheiro de desafiante!', 'Hipótese confirmada. Resultado: derrota.', 'O Graxaim-da-Névoa é feito de neblina. Golpe de Assombro acerta; golpe Comum passa direto.'),
  t('B-R5-5', 'Escoteira', 'Coruja-Mirim', 'cl-escoteira', m([44, 57], [136, 57]),
    'Distintivo de orientação noturna: tenho. Distintivo de vitória contra Campeão: vou ganhar agora!', 'Ganhei o distintivo de humildade.', 'Do outro lado da ponte o capim é tão alto que a névoa fica presa. É onde a Jaguatiricão caça.'),
  t('B-R5-6', 'Vaqueiro', 'Tropeiro Garoa', 'cl-vaqueiro', m([102, 57], [66, 57], [12, 58]),
    'Tropa de mula na névoa só anda com sino no pescoço. A minha tropa anda com batalha!', 'Perdi a tropa e a batalha.', 'Planalto Lume é logo ali. A Astrônoma Jaci joga com bicho de Mente: leve Assombro e Inseto.'),
  t('B-R5-7', 'Mateira', 'Jaguatirica', 'cl-mateira', m([70, 58], [140, 58]),
    'Meu nome é de bicho e o meu bicho é de nome. A Jaguatiricão some na névoa… e aparece atrás de você!', 'Sumiu ela, sumi eu.', 'O mirante cercado do nordeste é dos Guardiões. O vigia diz que só depois do Conselho.'),
  t('B-R5-8', 'Capoeirista', 'Mestre Cerrado-Alto', 'cl-capoeirista', m([66, 58], [104, 58], [64, 59]),
    'Capoeira na névoa: o adversário não vê o golpe chegando. Nem eu, às vezes. Iê!', 'Iê, camarada. Bom jogo.', 'Na beira do Planalto Lume tem roda de choro, não de capoeira. Mas a ginga é a mesma.'),
];

/* ------------------------------ B8 · Planalto Lume (nv 57–59) ------------------------------ */
const LUME: TreinadorDef[] = [
  t('B8-1', 'Observadora de Aves', 'Dona Beija-Flor', 'cl-observadora', m([48, 57], [54, 58]),
    'Três anos para ver um Beija-Arco-Íris! Agora tenho um, e ele está louco para lutar!', 'Ele voou de volta para as flores.', 'Nos Campos do Lume, de dia, sacuda os ipês: a Jataí-Rainha mora no oco do tronco.'),
  t('B8-2', 'Bióloga', 'Drª Louva', 'cl-biologa', m([158, 58], [150, 58]),
    'O Louva-Mestre luta em kata: posição, respiração, golpe. Você está respirando?', 'Respirei fundo. Perdi do mesmo jeito.', 'A Astrônoma Jaci troca de criatura no meio da luta como quem troca de constelação. Tenha uma resposta para cada uma.'),
  t('B8-3', 'Repentista', 'Seresteiro Lunar', 'cl-repentista', m([54, 58], [56, 58], [172, 59]),
    'Serenata no coreto para a lua e para você: / se eu perder, eu canto; se ganhar, canto também!', 'Canto a derrota: tem mais rima.', 'O Papagálio aprende qualquer golpe que escuta. Não fale estratégia perto dele.'),
];

/* ------------------------------ PP · a Subida do Pico Pindorama (nv 62–64) ------------------------------ */
const PICO: TreinadorDef[] = [
  t('PP-1', 'Montanhista', 'Alpinista Cume-Raso', 'cl-montanhista', m([12, 62], [166, 62], [140, 63]),
    'Dezesseis insígnias? Bonito. Aqui em cima elas pesam o dobro. Vamos ver se você aguenta o peso!', 'Aguentou com folga.', 'A trilha sobe em zigue-zague. Cada curva tem um montanhista querendo provar alguma coisa. Inclusive eu.'),
  t('PP-2', 'Escoteira', 'Chefe-Escoteira Geada', 'cl-escoteira', m([136, 62], [52, 63], [66, 63]),
    'Lição de escoteira para o Pico: sempre leve remédio a mais. Lição dois: nunca recuse um desafio!', 'Lição três: perder também conta como experiência.', 'O campo de gelo do oeste tem um prêmio na beira. Deslize em linha reta e pare na rocha.'),
  t('PP-3', 'Observadora de Aves', 'Dona Harpia', 'cl-observadora', m([110, 63], [12, 63]),
    'A Harpia vê um tatu a um quilômetro. E vê você bem mais perto!', 'A Harpia piscou. Eu chorei um pouquinho.', 'A gruta do leste tem uma fenda que sai numa prateleira escondida. Morcego grande mora lá dentro.'),
  t('PP-4', 'Capoeirista', 'Mestre Cume', 'cl-capoeirista', m([66, 63], [72, 63], [104, 63]),
    'Roda de capoeira no topo do Brasil! O berimbau aqui ecoa até o mar!', 'Iê! Volta do mundo, camarada.', 'O Coronel Garrote passou por aqui com dois capangas e uma corrente. Foi direto para o Cume.'),
  t('PP-5', 'Mateira', 'Guardiã-Aprendiz Mbaé', 'cl-mateira', m([140, 63], [72, 64]),
    'Sou aprendiz do Guardião Cauã. Ele mandou eu testar quem sobe. Não leve para o lado pessoal!', 'Vou contar ao Cauã que você é bom. Ele vai sorrir. Ele quase nunca sorri.', 'O Conselho tem cinco Guardiões, um atrás do outro. Iara, Cauã, Jandaia, Moacir e o Guardião-Mor Arandu.'),
  t('PP-6', 'Montanhista', 'Escalador Vento-Norte', 'cl-montanhista', m([52, 63], [110, 63], [136, 64]),
    'Já subi o Pico quarenta vezes. Nunca entrei no Salão. Hoje vou ao menos ganhar de quem vai entrar!', 'Quarenta e uma subidas, nenhuma vitória hoje.', 'O Guardião Tibiriçá deixou dois Elixires e dois Chás de Guaraná na saída do Portão. É a oferenda para quem sobe.'),
  t('PP-7', 'Capanga do Cartel', 'Ferrolho', 'capanga-m', m([152, 62], [89, 63]),
    'O Coronel mandou ninguém subir! Principalmente VOCÊ!', 'O Coronel vai me demitir de novo.', 'Ele está lá em cima, na porta do Salão. Diz que lá dentro tem as criaturas mais raras de Pindorama.', { musica: 'batalha-cartel', contato: false }),
  t('PP-8', 'Capanga do Cartel', 'Ferrolha', 'capanga-f', m([146, 63], [26, 63]),
    'Última capanga antes do Coronel! Corrente nova, cuia nova, raiva velha!', 'Corrente arrebentada. Raiva também.', 'Eu só queria um emprego com vista para a serra. Arrumei um com vista para a derrota.', { musica: 'batalha-cartel', contato: false }),
];

/* ------------------------------ B-FA · Floresta Ancestral, pós-jogo (nv 66–72) ------------------------------ */
const FLORESTA: TreinadorDef[] = [
  t('B-FA-1', 'Mateira', 'Anciã Sumaúma', 'cl-mateira', m([98, 66], [62, 67], [144, 67]),
    'Esta floresta é mais velha que as cidades. Quem entra aqui, entra para aprender. Lição número um: respeito!', 'Lição aprendida. Por mim.', 'Os Ninhos Raros ficam nas clareiras: cada um com o filho de um dos três primeiros parceiros dos treinadores.'),
  t('B-FA-2', 'Bióloga', 'Drª Megafauna', 'cl-biologa', m([110, 67], [72, 68], [85, 68]),
    'Pesquiso a megafauna: preguiça-gigante, tatu do tamanho de carro… e o Mapinguari, que ninguém viu e todo mundo ouviu.', 'Megaderrota.', 'O Mapinguari só aparece no coração da floresta, depois que o Conselho reconhece um novo Campeão. Leve Cuia de Ouro e paciência.'),
  t('B-FA-3', 'Observadora de Aves', 'Dona Gavião-Real', 'cl-observadora', m([110, 68], [12, 68], [52, 69]),
    'A Harpia daqui tem penacho de rainha. A minha tem cara de quem vai ganhar!', 'Penacho caído.', 'De madrugada, a clareira dos ipês enche de beija-flor. Até o de arco-íris.'),
  t('B-FA-4', 'Capoeirista', 'Mestre Raiz', 'cl-capoeirista', m([72, 69], [66, 69], [158, 70]),
    'Capoeira de raiz, na floresta de raiz! Entra na roda, Campeão!', 'Raiz arrancada. Ainda bem que cresce de novo.', 'O revanche do Conselho vale a pena: cada vez que você vence, o andarilho do Cume volta para o topo.'),
  t('B-FA-5', 'Pescador', 'Seu Jacaré-Açu', 'cl-pescador', m([85, 70], [112, 71], [87, 72]),
    'O rio da floresta não tem nome no mapa. Tem jacaré do tamanho de canoa. E eu, do tamanho do desafio!', 'O jacaré me olhou com pena.', 'Na lagoa escura do sul, de canoa, às vezes passa um Jacaruçu. Não estique a mão.'),
];

export const TREINADORES_B2_NORTE: TreinadorDef[] = [...CAMPOS, ...LAGOA, ...NEVOAS, ...LUME, ...PICO, ...FLORESTA];
export default TREINADORES_B2_NORTE;
