import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio da Lenda (nº 16, Aldeia Tupã) — casa de provas do Pajé Trovão-Velho. Tema g16.
 * Quebra-cabeça (src/world/mecanicas/ginasio-16.ts): a trilha das QUATRO PROVAS. Cada ala acende um totem; a porta
 * de taquara da câmara do Pajé, em (15, 4), só abre com os quatro acesos (as provas vencidas ficam marcadas nas
 * flags `g16-fogo`, `g16-terra`, `g16-vento`, `g16-agua`; uma prova pela metade recomeça ao sair da ala).
 *  - FOGO (sudoeste, entrada (12, 12) → marca (2, 12)): as brasas (`x`) acendem em ondas; cada brasa tem uma fase
 *    0, 1 ou 2 e queima quando o número de passos dados na ala, contando o que chega, tem o resto da fase na divisão
 *    por 3. As brasas que vão queimar no próximo passo ficam vermelhas. Queimou: volta à entrada.
 *    Solução (busca em posição × passos mod 3): `onsssoooonnnlnolooossssonlsoonno` (32 passos).
 *  - TERRA (noroeste, entrada (10, 6) → marca (2, 2)): pedras que se empurram com A, um tile por vez; buraco engole
 *    a pedra e vira chão. Solução (busca em jogador × pedras × buracos): `o o A-n l l n A-o o A-o l n n o o A-s l l s s
 *    o A-o o A-o o A-o s o o A-n n A-n n l n A-o o A-o o A-o o o n`.
 *  - VENTO (nordeste, entrada (20, 8) → marca (30, 2)): na corrente (`g`) o jogador é levado na direção do VENTO
 *    (começa soprando para o norte) até sair da corrente ou bater; cada pena (`,`) gira o vento no sentido horário.
 *    Solução (busca em posição × vento): `llllllloloooolllnllnlll`.
 *  - ÁGUA (sudeste, entrada (20, 12)): o reflexo do jogador surge na outra margem, em (30, 12), e anda espelhado
 *    (leste vira oeste). A prova termina com o jogador na pedra (24, 14) e o reflexo na pedra (28, 13) ao mesmo
 *    tempo. Solução (busca em jogador × reflexo): `lsllnlssnoooolnonnlossslllnslnss` (32 passos).
 */
const zona: ZonaDef = {
  id: 'A9-ginasio', nome: 'Casa de Provas da Aldeia Tupã', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-16', passo: 16,
  mapaChars: [
    '################################',
    '##;#########;;;;;;;###########;#',
    '##lloll#lll#;;;;;;;#gggggg;,#g;#',
    '##ollll#lll#;;;;;;;#gggggg##;gg#',
    '##lllllll#l####;####ggggg#ggggg#',
    '##l#lllolll###;;;###gggg##gg,gg#',
    '##ll#llllll:::;;;#####g;gg;,ggg#',
    '##############;;;###gggg;;gggg##',
    '##############;;;:::;gggg;#ggg;#',
    '##############;;;###############',
    '##x#xxxxx#xxx#;;;###;;;;;~~;~;;#',
    '##xxxxxxxxxxx#;;;###;~~~;~;;;;~#',
    '#;;x#xxx#xxx;:;;;:::;;~;;~~;;;;#',
    '##xxxx#xxxxxx#;;;###;;;;;~;;;;;#',
    '##xxxx#xxxxxx#;;;###;;;~;~;~;;;#',
    '##############;;;########;######',
    '#;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;#',
    '#;;;;;;;+;;;;;;;;;;;;;;;;;;;;;;#',
    '########+#######################',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g16' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['CASA DE PROVAS DA ALDEIA TUPÃ\nGuardião: Pajé Trovão-Velho\n"Fogo, terra, vento e água: quem respeita os quatro, caminha."', 'A porta do Pajé só se abre quando os quatro totens estão acesos. Cada ala guarda uma prova, e a ordem é você quem escolhe.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Fogo: a brasa vermelha queima no próximo passo. Terra: a pedra só anda empurrada, e o buraco engole a pedra.', 'Vento: a corrente leva para onde o vento sopra, e a pena muda o vento. Água: o seu reflexo anda ao contrário de você.'] },
    { o: 'gin-pedestal', x: 15, y: 2 },
    { o: 'gin-totem-fogo', x: 1, y: 12 }, { o: 'gin-totem-terra', x: 2, y: 1 }, { o: 'gin-totem-vento', x: 30, y: 1 }, { o: 'gin-totem-agua', x: 25, y: 15 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'A9', x: 25, y: 12, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g16-1', sprite: 'cl-mateira', x: 12, y: 17, dir: 'n', treinador: 'g16-1', visao: 1 },
    { id: 'g16-2', sprite: 'cl-pescador', x: 16, y: 13, dir: 'o', treinador: 'g16-2', visao: 1 },
    { id: 'g16-3', sprite: 'cl-escoteira', x: 14, y: 10, dir: 'l', treinador: 'g16-3', visao: 1 },
    { id: 'g16-4', sprite: 'cl-repentista', x: 16, y: 6, dir: 'o', treinador: 'g16-4', visao: 1 },
    { id: 'g16-5', sprite: 'cl-mateira', x: 17, y: 3, dir: 'o', treinador: 'g16-5', visao: 2 },
    { id: 'lider', sprite: 'lider-16', x: 15, y: 1, dir: 's', script: 'ginasio-16-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
