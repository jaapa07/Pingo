/**
 * Textos das telas de menu (equipe, resumo, mochila, diário, viveiro, PC do quarto, insígnias, perfil, créditos…).
 * Ficam juntos aqui para revisão de português sem abrir o código das telas.
 */
export const T = {
  menu: {
    salvar: 'Salvar o jogo agora?', salvo: 'Jogo salvo! Bom descanso, {JOGADOR}.', naoSalvou: 'Não foi possível salvar. Tente de novo.',
    semSlot: 'Este é um jogo de teste: não há onde salvar.',
    sair: 'Voltar à tela de título? O que não foi salvo se perde.',
    dica: 'A: abrir   B: fechar',
  },
  equipe: {
    vazia: 'Você ainda não tem nenhuma criatura parceira. A Profª Ipê pode ajudar com isso!',
    dicaMenu: 'A: opções   SELECT: mover   B: voltar', dicaMover: 'Escolha o novo lugar.   B: cancelar',
    dicaEscolher: 'A: escolher   B: voltar', dicaUsar: 'A: usar nesta criatura   B: voltar',
  },
  resumo: {
    amizade: ['Ainda está se acostumando com você.', 'Já aceita um cafuné sem reclamar.', 'Gosta de andar ao seu lado.', 'Confia em você de olhos fechados.', 'Vocês são unha e carne!'],
    ovo: 'Um ovo. Quem será que está aí dentro? Caminhe bastante com ele na equipe para descobrir.',
    legendaAtributos: 'A barra mostra a força natural da espécie. {c:vermelho}Vermelho{/c}: o jeito ajuda. {c:azul}Azul{/c}: o jeito atrapalha.',
    dicaInfo: '←→: página   ↑↓: criatura   A: cafuné   B: voltar', dicaAtributos: '←→: página   ↑↓: criatura   B: voltar',
    dicaGolpes: '←→: página   A: pegar golpe   B: voltar', dicaTroca: 'A: trocar com este golpe   B: soltar',
    cafuneBom: 'adorou o cafuné!', cafuneRepetido: 'se espreguiça, contente.', cafuneDesmaiada: 'precisa descansar primeiro.',
  },
  mochila: {
    vazio: 'Este bolso está vazio.', dica: '←→: bolso   A: opções   SELECT: atalho   B: voltar', dicaEscolher: '←→: bolso   A: escolher   B: voltar',
    semEquipe: 'Não há criatura na equipe para isso.', naoAqui: 'Não dá para usar isso agora.', repelenteAtivo: 'A fumaça da outra ainda está no ar.',
    amuleto: 'Os Amuletos de Campo agem sozinhos: chegue perto do obstáculo com a parceira certa na equipe.',
    registrado: 'ficou no botão SELECT.', desregistrado: 'saiu do botão SELECT.',
  },
  diario: {
    naoVisto: 'Criatura ainda não avistada. Procure por pegadas novas!', soVisto: 'Avistada, mas ainda não capturada. Capture-a para a Profª Ipê completar a ficha.',
    semHabitat: 'Não aparece solta nos mapas: chega por evolução, ovo ou acontecimento especial.',
    dicaLista: 'A: ficha   SELECT: medalhas   ←→: pular 10   B: voltar', dicaFicha: '←→: página   ↑↓: espécie   A: ouvir o grito   B: voltar',
    medalhas: ['Medalha Broto', 'Medalha Trilha', 'Medalha Lupa', 'Medalha Bússola', 'Medalha Jequitibá', 'Medalha Pindorama'],
    medalhaDesc: ['30 espécies registradas', '60 espécies registradas', '90 espécies registradas', '120 espécies registradas', '150 espécies registradas', 'As 180 espécies registradas!'],
    // página extra dos Visitantes (spec 6.5): 181 e 182 não contam no total nem nas medalhas
    abaDiario: 'DIÁRIO', abaVisitantes: 'VISITANTES',
    dicaListaVis: 'A: ficha   SELECT: medalhas   MENU: visitantes   B: voltar', dicaPaginaVis: 'A: ficha   MENU: voltar às 180   B: sair',
    visitanteCurto: 'Visitante, fora das 180',
    ondeVisitante: {
      181: 'Ilhota do Encontro das Águas, aonde só o canoeiro Seu Tarumã leva, a partir de Porto Sereia. Missão "O Encontro das Águas": com as 16 insígnias, leve a ele um frasco de água escura (de noite, Poço do Breu, Rio Cachoeira-Véu) e um de água barrenta (de dia, poço da cascata da Estrada Vermelha).',
      182: 'Alto do Pico Pindorama, de noite, sob a aurora das quatro Lanternas Boreais. Missão "A Expedição Boreal": depois do Conselho, fale com a Drª Solveig no navio encalhado de Porto Pantaneiro.',
    } as Record<number, string>,
    notaSolveig: 'Nota da Drª Solveig: o Borealce é um visitante das montanhas do norte, trazido pela nossa expedição. Ele não pertence à fauna local.',
  },
  viveiro: {
    dica: 'A: opções   SELECT: próxima caixa   B: sair', dicaMover: 'A: soltar aqui   B: cancelar', dicaTopo: '←→: trocar de caixa   A: renomear   ↓: criaturas',
    ultima: 'Não dá: a equipe precisa de ao menos uma criatura de pé.', equipeCheia: 'A equipe já tem 6 criaturas.', caixaCheia: 'Esta caixa está cheia.',
    soltar: 'Soltar {N} de volta na natureza? Não dá para desfazer.', soltou: '{N} voltou para {H}. Boa sorte, amiga!', soltarOvo: 'Um ovo não pode ser solto.',
  },
  pc: {
    titulo: 'PC DO QUARTO', guardar: 'Guardar item', retirar: 'Retirar item', descartar: 'Descartar item', cartas: 'Cartas', decoracao: 'Decoração', desligar: 'Desligar',
    nadaGuardar: 'Não há nada na mochila que caiba no PC.', nadaPc: 'O PC não guarda nenhum item.', semCartas: 'Nenhuma carta por enquanto.',
    dica: 'A: escolher   B: voltar', aplicado: 'Pronto! O quarto vai ficar uma beleza.', naoTem: 'Você ainda não tem esta peça.',
  },
  insignias: { dica: 'Setas: escolher   B: voltar', falta: 'Ainda não conquistada.' },
  mapa: { dica: 'Setas: mover   SELECT: trocar de região   B: voltar', dicaVoo: 'Setas: escolher a cidade   A: voar para lá   B: desistir', voar: 'Voar para {L}?', semDestino: 'Nenhuma cidade visitada ainda.', desconhecido: 'Você ainda não passou por aqui.' },
  loja: {
    ola: 'Seja bem-vindo à Venda! Em que posso ajudar?', comprar: 'Comprar', vender: 'Vender', sair: 'Até logo',
    semDinheiro: 'As patacas não dão para isso.', nadaVender: 'Você não tem nada que eu possa comprar.', naoCompro: 'Isso eu não posso comprar.',
    comprou: 'Aqui está! Obrigado pela preferência.', vendeu: 'Negócio fechado!', brinde: 'E uma Cuia de brinde, por conta da casa!',
    dica: 'A: escolher   B: voltar',
  },
  foto: {
    dica: '←→: filtro   A: fotografar   SELECT: álbum   B: sair', dicaAlbum: 'Setas: escolher   A: opções   B: voltar à câmera',
    guardar: 'Ficou boa! Guardar no álbum?', cheio: 'O álbum está cheio (24 fotos). Apague alguma primeiro.', vazio: 'O álbum ainda está vazio.', apagar: 'Apagar esta foto?',
  },
  radio: { dica: '←→: aba   A: escolher   B: desligar', semContatos: 'Nenhum contato ainda. Treinadores que simpatizarem com você passam o número depois da batalha.', revancheHoje: 'Já batalhamos hoje. Me liga amanhã!', semEquipe: 'Sua equipe precisa descansar antes de uma revanche.' },
};

/** as 16 insígnias: líder, cidade (id do local no mapa) e frase do estojo */
export const LIDERES: { lider: string; cidade: string; local: string; frase: string }[] = [
  { lider: 'Mestre Gaivota', cidade: 'Vila Caiçara', local: 'A2', frase: 'Quem lê o vento nunca perde o rumo.' },
  { lider: 'Lia Teia', cidade: 'Bosque Alto', local: 'A3', frase: 'Paciência de casulo, voo de borboleta.' },
  { lider: 'Marujo Netuno Silva', cidade: 'Porto Sereia', local: 'A4', frase: 'Remo firme e maré a favor.' },
  { lider: 'Iracema Lua', cidade: 'Cidade Coral', local: 'A5', frase: 'Cada ponto da renda guarda uma estrela.' },
  { lider: 'Faroleiro Volta', cidade: 'Ilha do Farol', local: 'A6', frase: 'Ideia boa dá choque!' },
  { lider: 'Dona Benta Sombra', cidade: 'Serra Fumaça', local: 'A7', frase: 'Todo causo tem um fundo de verdade.' },
  { lider: 'Engenheira Bigorna', cidade: 'Vila Ferrugem', local: 'A8', frase: 'Toda engrenagem tem sua vez.' },
  { lider: 'Dona Buriti', cidade: 'Vila Buriti', local: 'A10', frase: 'Toda cura começa numa folha.' },
  { lider: 'Boiadeira Zefa', cidade: 'Pantanal Grande', local: 'B2', frase: 'Pé no barro e cabeça erguida.' },
  { lider: 'Garimpeiro Topázio', cidade: 'Chapada Rubra', local: 'B3', frase: 'Brilho de verdade se acha cavando.' },
  { lider: 'Ferreira Labareda', cidade: 'Arraial Brasa', local: 'B4', frase: 'Ferro bom se prova no fogo.' },
  { lider: 'Mestre Gingado', cidade: 'Cidade Ginga', local: 'B5', frase: 'Na roda, quem não ginga dança.' },
  { lider: 'Doutor Peçonha', cidade: 'Brejo Roxo', local: 'B6', frase: 'O veneno e o remédio moram na mesma dose.' },
  { lider: 'Gaúcha Pinhão', cidade: 'Serra da Geada', local: 'B7', frase: 'Frio de rachar, coração quente.' },
  { lider: 'Astrônoma Jaci', cidade: 'Planalto Lume', local: 'B8', frase: 'Quem olha para cima enxerga longe.' },
  { lider: 'Pajé Trovão-Velho', cidade: 'Aldeia Tupã', local: 'A9', frase: 'A lenda só respeita quem respeita a terra.' },
];

/** cartas do PC do quarto: aparecem conforme a história anda (`se` usa as condições de core/estado.ts) */
export const CARTAS: { id: string; de: string; assunto: string; se?: string; texto: string }[] = [
  { id: 'mae-1', de: 'Mãe', assunto: 'Não esqueça o casaco', texto: 'Filhote, deixei um Chá de Erva-Cidreira guardado neste PC. Coma direito, durma cedo e me ligue pelo Rádio Cipó. Com amor, Mãe.' },
  { id: 'ipe-1', de: 'Profª Ipê', assunto: 'Seu Diário de Campo', se: 'flag:ovo-entregue', texto: 'O Diário registra sozinho tudo o que você avista. Mas ficha completa, só capturando! A cada 30 espécies eu mando uma medalha de pesquisador.' },
  { id: 'aroeira-1', de: 'Seu Aroeira', assunto: 'Sobre o Faro', se: 'flag:faro-ok', texto: 'Bicho amigo fareja o que a gente não vê. Ande com a parceira mais chegada na frente da equipe e repare quando o chão brilhar.' },
  { id: 'taina-1', de: 'Tainá', assunto: 'Nem pense em relaxar', se: 'flag:rival-2', texto: 'Já tenho mais insígnias que você, viu? Mentira. Mas vou ter! Treine direito para a nossa próxima batalha não ser sem graça.' },
  { id: 'mae-2', de: 'Mãe', assunto: 'Vi você no jornal!', se: 'flag:usina-ok', texto: 'A cidade inteira comenta que a luz da Usina voltou por sua causa. Guardei um pouco das suas patacas na poupança, como combinamos. Juízo no trem!' },
  { id: 'buriti-1', de: 'Drª Buriti', assunto: 'Ninhos do Pantanal', se: 'flag:pantanal-ok', texto: 'Os tuiuiús voltaram a fazer ninho na palafita grande. Se passar por aqui, venha ver: é graças a você e às suas parceiras.' },
  { id: 'taina-2', de: 'Tainá', assunto: 'Obrigada (não espalha)', se: 'flag:farol-ok', texto: 'Tá, você ajudou lá no Farol. Fiquei devendo uma. Só uma! Na próxima batalha eu desconto.' },
  { id: 'ipe-2', de: 'Profª Ipê', assunto: 'Criaturas resgatadas', se: 'flag:mina-ok', texto: 'As criaturas tiradas das jaulas da Mina já foram soltas na Chapada. Passe por lá um dia desses: a paisagem agradece.' },
  { id: 'garrote', de: 'Coronel Garrote', assunto: 'Sem assunto', se: 'flag:garrote-vencido', texto: 'Perdi. Vendi o que não era meu e paguei o preço. Vou plantar árvore até o fim da vida, por ordem do Conselho. Não me escreva.' },
  { id: 'conselho', de: 'Guardião-Mor Arandu', assunto: 'À nova guardiã de Pindorama', se: 'pos-jogo', texto: 'O Pico Pindorama guarda o seu nome na pedra. Mas a trilha não acaba: a Floresta Ancestral abriu, e há lendas andando soltas por aí.' },
];

/** medalhas e papéis dos créditos (rolagem da tela `creditos`) */
export const CREDITOS: (string | [string, string])[] = [
  ['titulo', 'ADVENTURES OF PINGO'], 'Uma aventura por Pindorama', '',
  ['secao', 'HISTÓRIA E MUNDO'], 'Costa do Sol e Sertão das Névoas', '32 cidades, rotas, grutas e matas', '',
  ['secao', 'AS 180 CRIATURAS'], 'Inspiradas na fauna do Brasil', 'do tamanduá ao boto-cor-de-rosa', '',
  ['secao', 'ARTE EM PIXEL'], 'Modelos, cenários e interface', 'desenhados à mão, ponto por ponto', '',
  ['secao', 'MÚSICA E SONS'], 'Choro, baião, frevo, catira e maracatu', 'sintetizados dentro do próprio jogo', '',
  ['secao', 'BATALHAS'], '17 tipos, 16 insígnias', 'e um Conselho de Guardiões', '',
  ['secao', 'AGRADECIMENTOS'], 'À Profª Ipê, pelo Diário de Campo', 'À Mãe, pelo casaco e pelo chá', 'Ao Seu Aroeira, pelo Faro', 'À Tainá, pela teimosia', 'E a você, que cuidou de cada parceira', '',
  ['secao', 'LEMBRETE DA PROFESSORA'], 'Bicho solto é bicho feliz.', 'Na natureza de verdade, só se leva foto', 'e só se deixa pegada.', '', '',
  ['titulo', 'OBRIGADO POR JOGAR!'], '', 'A trilha continua…',
];
