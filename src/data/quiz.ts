/**
 * QUIZ DO RÁDIO (spec 10A, item 31) — perguntas de Sim/Não sobre a fauna brasileira, com a resposta explicada.
 * A locutora sorteia 5 (via `rng`); 4 acertos ou mais dão o Cartão do Rádio. Um jogo por dia.
 * Todas as afirmações são verificáveis em guias de campo e nos materiais do ICMBio, do Projeto Tamar e de zoológicos.
 */
export interface PerguntaQuiz { p: string; r: boolean; porque: string }

export const QUIZ_FAUNA: PerguntaQuiz[] = [
  { p: 'O tamanduá-bandeira tem dentes?', r: false, porque: 'Não tem nenhum dente! Ele cata formigas e cupins com uma língua comprida e grudenta, de uns 60 centímetros.' },
  { p: 'A preguiça é parente próxima dos macacos?', r: false, porque: 'Não. A preguiça é parente dos tamanduás e dos tatus: os três formam o grupo dos xenartros.' },
  { p: 'A preguiça desce da árvore mais ou menos uma vez por semana para fazer as necessidades?', r: true, porque: 'Isso mesmo. É praticamente a única hora em que ela pisa no chão, e é quando corre mais perigo.' },
  { p: 'A ariranha é a maior lontra do mundo?', r: true, porque: 'Sim! A ariranha passa de 1,5 metro com a cauda e vive em grupos familiares nos rios da Amazônia e do Pantanal.' },
  { p: 'O boto-cor-de-rosa vive no mar?', r: false, porque: 'Não. O boto-cor-de-rosa é de água doce: vive nos rios e lagos da bacia amazônica.' },
  { p: 'O tuiuiú é conhecido como a ave-símbolo do Pantanal?', r: true, porque: 'Sim. O tuiuiú, uma cegonha enorme de pescoço preto e vermelho, faz ninhos gigantes no alto das árvores do Pantanal.' },
  { p: 'A capivara é o maior roedor do mundo?', r: true, porque: 'É sim! Uma capivara adulta pode passar de 60 quilos e adora ficar perto da água.' },
  { p: 'O lobo-guará também come frutos, como a fruta-do-lobo?', r: true, porque: 'Sim. Cerca de metade do que ele come é fruta, principalmente a lobeira, a fruta-do-lobo do Cerrado.' },
  { p: 'A onça-pintada é o maior felino das Américas?', r: true, porque: 'Sim. A onça-pintada é o maior felino do continente e tem uma das mordidas mais fortes entre os felinos.' },
  { p: 'O mico-leão-dourado vive na Floresta Amazônica?', r: false, porque: 'Não. Ele só existe na Mata Atlântica do estado do Rio de Janeiro e quase foi extinto.' },
  { p: 'O peixe-boi-da-amazônia vive em água doce?', r: true, porque: 'Sim. É o único peixe-boi que vive só em água doce, nos rios e lagos da Amazônia.' },
  { p: 'O pirarucu precisa subir à superfície para respirar ar?', r: true, porque: 'Precisa! Ele respira ar com a bexiga natatória e sobe para respirar a cada poucos minutos.' },
  { p: 'O poraquê é uma enguia de verdade?', r: false, porque: 'Não. Apesar do apelido "enguia-elétrica", o poraquê é um peixe-elétrico de outro grupo, mais aparentado com os bagres do que com as enguias.' },
  { p: 'O tatu-bola consegue se fechar como uma bola completa?', r: true, porque: 'Consegue. O tatu-bola da Caatinga encaixa a cabeça e a cauda na carapaça e vira uma bola fechada.' },
  { p: 'O tatu-canastra é o maior tatu do mundo?', r: true, porque: 'Sim. Pode passar de 1,5 metro com a cauda, e a garra do meio da mão da frente é a maior entre todos os mamíferos vivos.' },
  { p: 'A sucuri é uma cobra peçonhenta?', r: false, porque: 'Não. A sucuri não tem peçonha: ela mata apertando a presa com o corpo (constrição).' },
  { p: 'A jararaca é uma cobra peçonhenta?', r: true, porque: 'Sim. A picada da jararaca é tratada com soro antibotrópico. Nunca mexa com ela!' },
  { p: 'A jiboia é uma cobra peçonhenta?', r: false, porque: 'Não. A jiboia, como a sucuri, mata por constrição e não tem peçonha.' },
  { p: 'O beija-flor consegue voar para trás?', r: true, porque: 'Consegue! Batendo as asas dezenas de vezes por segundo, ele paira no ar, sobe, desce e voa de ré.' },
  { p: 'O urubu-rei tem a cabeça colorida?', r: true, porque: 'Tem: a pele da cabeça mistura laranja, vermelho, roxo e amarelo. É a mais colorida dos urubus.' },
  { p: 'O guará, a ave vermelha do mangue, já nasce vermelho?', r: false, porque: 'Não. O filhote é escuro. O vermelho vem dos pigmentos dos caranguejinhos e camarões que ele come.' },
  { p: 'O jacaré-açu é o maior jacaré do Brasil?', r: true, porque: 'Sim. O jacaré-açu, da Amazônia, pode passar de 4 metros de comprimento.' },
  { p: 'A ema consegue voar?', r: false, porque: 'Não voa. A ema é a maior ave do Brasil e compensa correndo muito rápido.' },
  { p: 'Na ema, é o macho quem choca os ovos?', r: true, porque: 'Sim. Várias fêmeas põem os ovos no mesmo ninho e o macho choca e cuida dos filhotes sozinho.' },
  { p: 'No cavalo-marinho, é o macho quem carrega os ovos até os filhotes nascerem?', r: true, porque: 'Isso mesmo: a fêmea deposita os ovos numa bolsa na barriga do macho, que "dá à luz" os filhotes.' },
  { p: 'As baleias-jubarte vêm ao litoral da Bahia para ter filhotes?', r: true, porque: 'Sim. Entre o inverno e a primavera elas visitam o Banco dos Abrolhos para acasalar e ter filhotes.' },
  { p: 'A anta é o maior mamífero terrestre do Brasil?', r: true, porque: 'É sim. A anta pode passar de 250 quilos e espalha sementes pela floresta: é a "jardineira" da mata.' },
  { p: 'O gambá, também chamado de saruê, é um marsupial?', r: true, porque: 'Sim. Como o canguru, a mãe gambá leva os filhotes numa bolsa e, depois, nas costas.' },
  { p: 'Os morcegos são cegos?', r: false, porque: 'Não. Os morcegos enxergam; muitos também usam o eco dos próprios gritos para se orientar no escuro.' },
  { p: 'O urutau passa o dia parado imitando um galho quebrado?', r: true, porque: 'Sim. De olhos quase fechados e penas cor de casca, o urutau some no tronco. À noite ele caça insetos.' },
  { p: 'Jacarés e crocodilos são o mesmo bicho com nomes diferentes?', r: false, porque: 'Não. São famílias diferentes de répteis. Os do Brasil são jacarés: focinho mais largo e dentes de baixo escondidos com a boca fechada.' },
];

/** quantas perguntas por rodada e quantos acertos dão o Cartão do Rádio */
export const QUIZ_RODADA = 5, QUIZ_META = 4;
export const LOCUTORA = { nome: 'Locutora Sabiá', retrato: 'npc-mulher-3' };
