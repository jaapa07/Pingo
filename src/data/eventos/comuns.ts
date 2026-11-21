/**
 * Eventos COMUNS a todas as cidades (dono: time A1): `posto`, `viveiro`, `pc-quarto`, `radio`, `mae-poupanca` —
 * e os comandos extras de roteiro usados por eles e pelos eventos do time A1.
 *
 * Comandos extras (registrados aqui; só dependem do núcleo, nunca do motor de mundo):
 *   ['opcao', flag]                 → depois de ['escolha', …, flag]: marca `flag-0`, `flag-1`… (verdadeiro só o escolhido;
 *                                     cancelar com B deixa todos falsos) para usar em ['se', 'flag:<flag>-1', …]
 *   ['temEspecie', n, flag]         → flag = a equipe tem a espécie nº n
 *   ['temItens', item, qtd, flag]   → flag = a mochila tem pelo menos `qtd` do item
 *   ['temDinheiro', n, flag]        → flag = o jogador tem pelo menos n patacas na mão
 *   ['poupar', n | 'tudo']          → passa patacas da mão para a poupança da mãe
 *   ['sacar', n | 'tudo']           → traz patacas da poupança para a mão
 *   ['contato', id]                 → acrescenta um contato ao Rádio Cipó
 *   ['grito', n]                    → toca o grito da espécie
 *   ['vitrine', n] / ['vitrineFim'] → mostra (e tira) a criatura nº n numa moldura no alto da tela
 */
import type { EventoDef, Comando } from '../../core/tipos';
import { jogo, setFlag, qtdItem } from '../../core/estado';
import { bus } from '../../core/events';
import { registrarComando } from '../../world/registro';
import { precarregarModelo } from '../../core/assets';

registrarComando('opcao', ([f]) => { const v = jogo.save.flags[String(f)]; for (let i = 0; i < 8; i++) setFlag(`${String(f)}-${i}`, v === i); });
registrarComando('temEspecie', ([n, f]) => { setFlag(String(f), jogo.save.equipe.some((c) => c.especie === Number(n) && !c.ovo)); });
registrarComando('temItens', ([id, q, f]) => { setFlag(String(f), qtdItem(String(id)) >= Number(q ?? 1)); });
registrarComando('temDinheiro', ([n, f]) => { setFlag(String(f), jogo.save.jogador.dinheiro >= Number(n)); });
registrarComando('poupar', ([n]) => { const j = jogo.save.jogador, v = n === 'tudo' ? j.dinheiro : Math.min(j.dinheiro, Math.max(0, Number(n))); j.dinheiro -= v; j.poupanca += v; setFlag('poupanca-valor', j.poupanca); });
registrarComando('sacar', ([n]) => { const j = jogo.save.jogador, v = n === 'tudo' ? j.poupanca : Math.min(j.poupanca, Math.max(0, Number(n))); j.poupanca -= v; j.dinheiro += v; setFlag('poupanca-valor', j.poupanca); });
registrarComando('contato', ([id]) => { const c = jogo.save.contatos; if (!c.includes(String(id))) c.push(String(id)); });
registrarComando('grito', ([n]) => { bus.emit('grito', { especie: Number(n) }); });

/* a vitrine usa módulos de tela; são carregados só na hora (o arquivo continua importável fora do navegador) */
let vitrine: { el: HTMLElement; parar: () => void } | null = null;
function fecharVitrine() { if (vitrine) { vitrine.parar(); vitrine.el.remove(); vitrine = null; } }
registrarComando('vitrineFim', () => fecharVitrine());
registrarComando('vitrine', async ([n]) => {
  fecharVitrine();
  if (typeof document === 'undefined') return;
  const [{ Sprite }, { telas }, { ESPECIES }] = await Promise.all([import('../../render/sprite'), import('../../ui/telas'), import('../criaturas')]);
  const esp = ESPECIES.find((e) => e.num === Number(n));
  if (!esp || !telas.raiz) return;
  // a imagem chega junto com o quadro (src/world/precarga.ts já a pede ao entrar na zona; aqui só falta esperar o que
  // ainda estiver a caminho — no máximo 4 s, para uma rede ruim não prender o evento)
  await Promise.race([precarregarModelo(esp.id, ['frente']), new Promise((r) => setTimeout(r, 4000))]);
  const el = document.createElement('div');
  el.className = 'vitrine-criatura';
  el.style.cssText = 'position:absolute;left:116px;top:8px;width:88px;height:88px;z-index:60;background:#fff6e0;box-shadow:0 0 0 2px #141026,0 0 0 4px #f2c230,0 0 0 6px #141026;overflow:hidden';
  const chao = document.createElement('div');
  chao.style.cssText = 'position:absolute;left:0;top:60px;width:88px;height:28px;background:#e9d3a0;box-shadow:inset 0 2px 0 #c9ae74';
  el.append(chao);
  const s = new Sprite(esp.id, 'frente', el);
  s.x = 44; s.y = 70; s.tocar(s.tem('idle') ? 'idle' : 'entrada');
  telas.raiz.append(el);
  let vivo = true, antes = performance.now();
  const quadro = (agora: number) => { if (!vivo) return; s.atualizar(Math.min(0.1, (agora - antes) / 1000)); antes = agora; s.desenhar(); requestAnimationFrame(quadro); };
  s.desenhar(); requestAnimationFrame(quadro);
  vitrine = { el, parar: () => { vivo = false; } };
  bus.emit('grito', { especie: esp.num });
});

const GUARDIA = { nome: 'Guardiã do Posto', retrato: 'npc-atendente-posto' };
const MAE = { nome: 'Mãe', retrato: 'mae' };
const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);

export const EVENTOS_COMUNS: EventoDef[] = [
  {
    id: 'posto',
    passos: [
      ['falar', GUARDIA, 'Bem-vindo ao Posto Guardião! Aqui criatura cansada sai nova em folha.'],
      ['simnao', 'Quer que eu cuide das suas criaturas?', 'posto-sim'],
      se('flag:posto-sim', [
        ['falar', GUARDIA, 'Me empresta as cuias um instantinho…'],
        ['curar'],
        ['falar', GUARDIA, 'Prontinho! Todas descansadas, de pelo, pena e escama em dia.\fO Viveiro de Cuias fica no terminal do canto. Boa viagem, e volte sempre!'],
      ], [['falar', GUARDIA, 'Quando precisar, é só chegar. A porta do Posto não tem tranca.']]),
    ],
  },
  {
    id: 'viveiro',
    passos: [
      ['sfx', 'ui-ok'],
      ['falar', null, '{JOGADOR} ligou o terminal do Viveiro de Cuias.'],
      ['tela', 'viveiro'],
    ],
  },
  {
    id: 'pc-quarto',
    passos: [
      ['sfx', 'ui-ok'],
      ['falar', null, '{JOGADOR} ligou o computador do quarto.'],
      ['tela', 'pc-quarto'],
    ],
  },
  {
    id: 'radio',
    passos: [
      ['sfx', 'radio'],
      ['falar', null, 'O rádio chia e pega a Rádio Cipó:\n"…e segue o tempo firme em toda a Costa do Sol. A seguir, modas de viola e recados do sertão."'],
      se('item:radio-cipo', [['tela', 'radio']]),
    ],
  },
  {
    id: 'mae-poupanca',
    passos: [
      ['falar', MAE, 'Quer que eu guarde um pouco do seu dinheiro? Na minha mão ele não vira bala nem figurinha.'],
      ['escolha', 'O que você quer fazer?', ['Guardar 500 patacas', 'Guardar tudo', 'Retirar tudo', 'Deixa para depois'], 'poupanca-op'],
      ['opcao', 'poupanca-op'],
      se('flag:poupanca-op-0', [
        ['temDinheiro', 500, 'poupanca-tem'],
        se('flag:poupanca-tem', [['poupar', 500], ['sfx', 'item-obtido'], ['falar', MAE, 'Quinhentas patacas guardadinhas na lata de biscoito. Ninguém mexe!']], [['falar', MAE, 'Ué, filho, você não tem 500 patacas aí. Quer que eu te empreste um lanche?']]),
      ]),
      se('flag:poupanca-op-1', [
        ['temDinheiro', 1, 'poupanca-tem'],
        se('flag:poupanca-tem', [['poupar', 'tudo'], ['sfx', 'item-obtido'], ['falar', MAE, 'Tudo guardado. Assim você não perde metade se voltar desmaiado para o Posto.']], [['falar', MAE, 'Seu bolso está mais vazio que a geladeira antes da feira.']]),
      ]),
      se('flag:poupanca-op-2', [
        se('flag:poupanca-valor', [['sacar', 'tudo'], ['sfx', 'item-obtido'], ['falar', MAE, 'Aqui está, tudinho. Gaste com juízo — ou pelo menos com cuia boa.']], [['falar', MAE, 'A lata de biscoito está vazia. Quer dizer, tem biscoito. Dinheiro, não.']]),
      ]),
      se('flag:poupanca-op-3', [['falar', MAE, 'Tudo bem. A lata fica esperando.']]),
    ],
  },
];
