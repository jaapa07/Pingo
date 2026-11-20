/**
 * Eventos do PÓS-LIGA no mapa A: Gincana de Criaturas (spec 10A item 32) e Parque Safári (item 33).
 * Lugar: Vale do Buriti-Alto (`A-GN`), Portaria do Safári (`A-SF`, `A-SF-casa`) e o parque (`A-SF-parque`),
 * ligados ao terreiro do Platô (`A-LG`) pelo carreiro, só com `flag:liga-vencida` (registro em docs/HISTORIA.md).
 * Comandos com janela (falas de várias etapas, telas) ficam em src/ui/telas/gincana.ts e gincana-safari.ts:
 *   ['gincanaJuiza'] · ['gincanaSucos'] · ['gincanaTroca'] · ['gincanaRival', i] · ['safariDono'] · ['safariMaquete']
 * Comando registrado aqui (só núcleo):
 *   ['safariComecar'] → entrega as Cuias-Safári, liga `safari-ativo` e zera os passos do passeio
 */
import type { EventoDef, Comando } from '../../core/tipos';
import { setFlag, darItem, tirarItem, qtdItem, flag } from '../../core/estado';
import { registrarComando } from '../../world/registro';
import { SAFARI } from '../safari';

registrarComando('safariComecar', () => {
  const sobra = qtdItem(SAFARI.item); if (sobra) tirarItem(SAFARI.item, sobra);
  darItem(SAFARI.item, SAFARI.cuias);
  setFlag('safari-ativo'); setFlag('safari-passos', SAFARI.passos);
  setFlag('safari-visitas', Number(flag('safari-visitas') ?? 0) + 1);
});

const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const TIAO = { nome: 'Carreiro Tião', retrato: 'npc-idoso' };
const INGA = { nome: 'Bilheteira Dona Ingá', retrato: 'npc-mulher-1' };
const FIOTA = { nome: 'Benzedeira Dona Fiota', retrato: 'npc-idosa' };
const PATACA = { nome: 'Tesoureira Pataca', retrato: 'npc-mulher-4' };
const JACI = { nome: 'Guia Jaci', retrato: 'cl-observadora' };

/** quem dá um objeto de ambiente: conversa, entrega uma vez, depois só lembra o caminho */
const doador = (id: string, quem: { nome: string; retrato: string }, item: string, flagDado: string, fala: string[], depois: string): EventoDef => ({
  id,
  passos: [se(`flag:${flagDado}|flag:safari-${item}-entregue`, [['falar', quem, depois]], [
    ...fala.map((f): Comando => ['falar', quem, f]),
    ['dar', item], ['flag', flagDado],
    ['falar', quem, 'Leve ao Seu Jatobá, o dono do Parque Safári, lá no Vale do Buriti-Alto. O carreiro do Platô da Liga sobe para lá.'],
  ])],
});

export const EVENTOS_POSLIGA: EventoDef[] = [
  /* ------------------------------ caminho: Platô ↔ Vale do Buriti-Alto ------------------------------ */
  {
    id: 'carreiro-ida',
    passos: [
      se('!flag:gincana-aberta', [
        ['falar', TIAO, 'Ô, Campeão! Parabéns pela Liga! Eu sou o Tião, do carro de boi.'],
        ['falar', TIAO, 'Lá em cima, na trilha do leste, fica o Vale do Buriti-Alto: tem a Gincana de Criaturas e o Parque Safári do Seu Jatobá. Só Campeão sobe, que a trilha é braba.'],
        ['flag', 'gincana-aberta'],
      ]),
      ['simnao', 'Subir de carro de boi para o Vale do Buriti-Alto?', 'carreiro-sim'],
      se('flag:carreiro-sim', [['sfx', 'passo-terra'], ['warp', 'A-GN', 3, 11, 'l'], ['falar', TIAO, 'Chegamos! Quando quiser descer, é só falar comigo aqui na entrada.']], [['falar', TIAO, 'O boi espera. Ele é paciente; eu também.']]),
    ],
  },
  {
    id: 'carreiro-volta',
    passos: [
      ['simnao', 'Descer para o Platô da Liga?', 'carreiro-sim'],
      se('flag:carreiro-sim', [['sfx', 'passo-terra'], ['warp', 'A-LG', 27, 55, 'o']], [['falar', TIAO, 'Aproveite o vale. Dizem que a Juíza Bia corre mais que as criaturas.']]),
    ],
  },

  /* ------------------------------ Gincana ------------------------------ */
  { id: 'gincana-juiza', passos: [['gincanaJuiza']] },
  { id: 'gincana-sucos', passos: [['gincanaSucos']] },
  { id: 'gincana-quadro', passos: [['tela', 'gincana-ranking']] },
  {
    id: 'gincana-troca',
    passos: [
      ['falar', PATACA, 'Ponto de prova vale prêmio! Vitamina de fruta, pedra de evolução, pergaminho e rapadura. Nada de aposta: aqui só se ganha correndo.'],
      ['gincanaTroca'],
    ],
  },
  {
    id: 'gincana-cura',
    passos: [
      ['falar', FIOTA, 'Criatura cansada de prova não rende. Deixa eu benzer com arruda e água de buriti.'],
      ['curar'],
      ['falar', FIOTA, 'Pronto: todo mundo inteirinho. Vai com fé e com fôlego.'],
    ],
  },
  { id: 'gincana-rival-1', passos: [['gincanaRival', 0]] },
  { id: 'gincana-rival-2', passos: [['gincanaRival', 1]] },
  { id: 'gincana-rival-3', passos: [['gincanaRival', 2]] },

  /* ------------------------------ Safári ------------------------------ */
  {
    id: 'safari-porteira',
    passos: [
      se('!flag:safari-visitou', [
        ['falar', INGA, 'Bem-vindo ao Parque Safári do Buriti-Alto! Aqui não se luta: a criatura é selvagem e fica selvagem até você firmar parceria.'],
        ['falar', INGA, 'Lá dentro você tem ISCA (ela come e foge menos, mas a cuia pega pior), PEDRA (ela fica brava: a cuia pega melhor, mas ela foge mais) e PERTO (chegar devagarinho ajuda a cuia).'],
        ['flag', 'safari-visitou'],
      ]),
      ['temDinheiro', 500, 'safari-tem-dinheiro'],
      ['escolha', 'Entrada: 500 patacas, 30 Cuias-Safári e 500 passos. Vai entrar?', ['Entrar', 'Como funciona?', 'Agora não'], 'safari-op'],
      ['opcao', 'safari-op'],
      se('flag:safari-op-1', [
        ['falar', INGA, 'As criaturas só aparecem no capim alto do parque. Cada setor tem bicho próprio, de dia e de noite.'],
        ['falar', INGA, 'Os passos acabam? O passeio acaba. As cuias acabam? Idem. Saiu pela porteira? Também. As Cuias-Safári que sobrarem ficam aqui comigo.'],
        ['falar', INGA, 'O parque só tem a Vereda por enquanto. O Seu Jatobá monta os outros setores com o que o povo traz: pedra de rio, muda de buriti, tronco oco… Fala com ele ali na casa.'],
      ]),
      se('flag:safari-op-0', [
        se('flag:safari-tem-dinheiro', [
          ['dinheiro', -500], ['sfx', 'item-obtido'], ['safariComecar'],
          ['falar', INGA, 'Aqui estão as 30 Cuias-Safári. Boa caçada… quer dizer, boa parceria! Pííí, porteira aberta!'],
          ['warp', 'A-SF-parque', 10, 32, 'n'],
        ], [['falar', INGA, 'Faltam patacas, criatura. A entrada é 500, e o parque precisa de capim e de comida para os bichos.']]),
      ]),
      se('flag:safari-op-2', [['falar', INGA, 'Tá certo. A porteira fica aqui esperando.']]),
    ],
  },
  { id: 'safari-dono', passos: [['safariDono']] },
  { id: 'safari-maquete', passos: [['safariMaquete']] },
  {
    id: 'safari-guia',
    passos: [
      ['falar', JACI, 'Sou guia do parque. Dica de quem anda no capim: a Pedra deixa o bicho bravo e mais fácil de pegar, mas ele foge mais. Use quando tiver cuia sobrando.'],
      ['falar', JACI, 'E o Seu Jatobá quer material para os setores novos: pedra de rio, que um pescador da Trilha dos Cipós junta na beira do rio; muda de buriti, da viveirista de Vila Buriti; e tronco oco, do lenhador da Estrada do Buriti.'],
    ],
  },
  doador('safari-da-pedra', { nome: 'Pescador Seixo', retrato: 'cl-pescador' }, 'pedra-de-rio', 'safari-pedra-dada',
    ['Ô, Campeão! Sabe o que este rio faz? Rola pedra. Rola tanto que ela sai lisinha, redonda, boa de calçar margem.', 'O Seu Jatobá do Safári anda pedindo pedra de rio para a lagoa nova dele. Toma esta, a mais bonita que eu achei.'],
    'Essa pedra que te dei veio de três cachoeiras acima. Levou mais tempo que eu para chegar aqui.'),
  doador('safari-da-muda', { nome: 'Viveirista Carnaúba', retrato: 'npc-mulher-2' }, 'muda-de-buriti', 'safari-muda-dada',
    ['Buriti é a árvore da água: onde ele nasce, o brejo vem junto, e o bicho vem atrás.', 'Esta muda é das boas. Planta na beira de água corrente e conversa com ela de vez em quando.'],
    'A muda pegou? Buriti demora, mas quando firma não tem seca que derrube.'),
  doador('safari-do-tronco', { nome: 'Lenhador Seu Angico', retrato: 'npc-homem-3' }, 'tronco-oco', 'safari-tronco-dado',
    ['Eu só corto árvore que já caiu, viu? E esta aqui caiu oca: dentro, morava uma coruja.', 'Tronco oco é casa pronta. O Seu Jatobá falou que quer fazer uma toca para os bichos da noite no Safári. Leva, que é leve.'],
    'Tronco oco é casa de coruja, de urutau, de gambá… Bicho da noite gosta de escuro e de silêncio.'),
];
