/**
 * Testes do save e da transferência entre aparelhos (`npm run test:save`, também dentro de `npm test`). Roda em Node, sem DOM:
 * gravar/carregar com cópia .bak, save corrompido, ponto de retomada e o código PINGO1 (limpo, com espaços e quebras de
 * linha de mensageiro, truncado, adulterado, de versão nova e lixo) sem estragar os saves existentes.
 * O caminho completo pela interface (web PC/iPhone e app de PC) está descrito em docs/UI-CORRECOES.md.
 */
import { jogo, novoSave } from '../../src/core/estado';
import * as save from '../../src/core/save';
import { plataforma } from '../../src/core/plataforma';

let falhas = 0, feitos = 0;
async function teste(nome: string, fn: () => void | Promise<void>) {
  try { await fn(); feitos++; console.log('  ok  ' + nome); } catch (e) { falhas++; console.log('FALHA ' + nome + '\n      ' + (e instanceof Error ? e.message : String(e))); }
}
function afirmar(c: unknown, msg: string): asserts c { if (!c) throw new Error(msg); }
const erroDe = (f: () => unknown) => { try { f(); return null; } catch (e) { return e instanceof Error ? e.message : String(e); } };
const semTempo = (s: unknown) => JSON.stringify({ ...(s as object), tempoJogo: 0, rng: 0 });

function jogoDeExemplo() {
  const s = novoSave();
  s.jogador.nome = 'Ayra'; s.jogador.zona = 'A3'; s.jogador.x = 12; s.jogador.y = 7; s.jogador.dinheiro = 4321;
  s.mochila['cuia'] = 9; s.insignias = [1, 2, 5]; s.flags['intro-ok'] = true; s.flags['contador'] = 3;
  s.diario.visto = [1, 4, 7, 177]; s.diario.capturado = [1, 4]; s.relogio.deslocamentoMin = 333; s.tempoJogo = 3600;
  return s;
}

await save.iniciarSave();
const arm = plataforma.armazenamento;

await teste('gravar e carregar devolve o mesmo jogo; a versão anterior vira .bak', async () => {
  jogo.carregar(jogoDeExemplo()); afirmar(save.gravarSlot(0), 'gravou');
  const primeiro = semTempo(jogo.save);
  jogo.save.jogador.dinheiro += 10; save.gravarSlot(0);
  const segundo = semTempo(jogo.save);
  jogo.carregar(novoSave());
  afirmar(save.carregarSlot(0), 'carregou'); afirmar(semTempo(jogo.save) === segundo, 'mesmo jogo do slot');
  afirmar(JSON.parse((await arm.ler('pingo.slot.0.bak'))!).dados.jogador.dinheiro === JSON.parse(primeiro).jogador.dinheiro, '.bak tem a versão anterior');
});

await teste('slot corrompido abre pela cópia; os dois corrompidos aparecem como danificados (não como vazio)', async () => {
  const bom = (await arm.ler('pingo.slot.0'))!;
  // o cache em memória é a fonte da API síncrona: estraga por um caminho que o recarrega
  await arm.gravar('pingo.slot.0', bom.replace('"dinheiro":', '"dinheiro":9'));
  await save.iniciarSave();
  afirmar(save.carregarSlot(0), 'abre pela cópia'); afirmar(jogo.save.jogador.nome === 'Ayra', 'jogo certo');
  await arm.gravar('pingo.slot.0', '{lixo'); await arm.gravar('pingo.slot.0.bak', 'PINGO1:x');
  await save.iniciarSave();
  afirmar(!save.carregarSlot(0) && save.listarSlots()[0] === null, 'sem jogo legível'); afirmar(save.slotDanificado(0), 'marcado como danificado');
  afirmar(!save.slotDanificado(1), 'slot nunca usado não é danificado');
  await arm.gravar('pingo.slot.0', bom); await save.iniciarSave(); afirmar(save.carregarSlot(0), 'restaurado');
});

await teste('ponto de retomada: só em jogo, devolve o momento exato e some depois de usado', () => {
  jogo.carregar(jogoDeExemplo()); jogo.slot = 0;
  save.marcarEmJogo(false); save.gravarRetomada(); afirmar(save.lerRetomada() === null, 'fora do jogo não grava');
  save.marcarEmJogo(true); jogo.save.jogador.x = 30; save.gravarRetomada(); save.marcarEmJogo(false);
  const r = save.lerRetomada(); afirmar(r?.slot === 0, 'retomada do slot 0');
  jogo.carregar(novoSave()); afirmar(save.carregarRetomada() && jogo.save.jogador.x === 30, 'volta ao ponto');
  save.limparRetomada(); afirmar(save.lerRetomada() === null, 'limpa');
});

await teste('código de transferência: ida e volta idêntica, com espaços/quebras/invisíveis de mensageiro', () => {
  jogo.carregar(jogoDeExemplo()); save.gravarSlot(0);
  const cod = save.exportar(0);
  afirmar(/^PINGO1:[0-9a-f]{8}:[A-Za-z0-9_-]+$/.test(cod), 'formato');
  const ref = semTempo(save.lerExportado(cod));
  const sujos = [
    `  ${cod}  \n`,
    cod.replace(/(.{40})/g, '$1\n'),
    cod.replace(/(.{25})/g, '$1 \r\n '),
    '﻿' + cod.replace(/(.{30})/g, '$1​'),
    `Meu jogo do Pingo:\n${cod}\nAbraço!`,
    `"${cod}"`,
    `https://exemplo.invalid/#pingo=${cod.replace(/:/g, '%3A')}`,
  ];
  for (const s of sujos) afirmar(semTempo(save.lerExportado(s)) === ref, 'aceita: ' + JSON.stringify(s.slice(0, 30)));
});

await teste('código ruim: mensagem clara e nenhum save mexido', () => {
  jogo.carregar(jogoDeExemplo()); save.gravarSlot(0); save.apagarSlot(1);
  const cod = save.exportar(0);
  const antes = JSON.stringify(save.listarSlots().map((s) => s && { ...s, quando: 0 }));
  const casos: [string, string, RegExp][] = [
    ['truncado no fim', cod.slice(0, cod.length - 30), /incompleto/],
    ['truncado no começo', cod.slice(0, 15), /incompleto/],
    ['só a marca', 'PINGO1:', /incompleto/],
    ['adulterado', cod.slice(0, -5) + (cod.endsWith('AAAAA') ? 'BBBBB' : 'AAAAA'), /incompleto|alterado/],
    ['soma trocada', cod.replace(/^PINGO1:(.)/, (_, c: string) => 'PINGO1:' + (c === '0' ? '1' : '0')), /incompleto|alterado/],
    ['versão nova do código', cod.replace('PINGO1', 'PINGO2'), /versão mais nova/],
    ['lixo', 'oi, tudo bem?', /não é um código/],
    ['vazio', '   ', /não é um código/],
  ];
  for (const [rot, txt, re] of casos) {
    const m = erroDe(() => save.importar(txt, 1));
    afirmar(m && re.test(m), `${rot}: veio ${JSON.stringify(m)}`);
  }
  afirmar(JSON.stringify(save.listarSlots().map((s) => s && { ...s, quando: 0 })) === antes, 'saves intactos');
});

await teste('save de versão mais nova dentro de um código válido é recusado com aviso de atualizar', () => {
  // monta um código com soma certa mas save versão 2
  jogo.carregar({ ...jogoDeExemplo(), versao: 2 } as never);
  const cod = save.exportar();
  const m = erroDe(() => save.lerExportado(cod)); afirmar(m && /versão mais nova/.test(m), String(m));
});

await teste('importar num jogo ocupado guarda o anterior como .bak', async () => {
  jogo.carregar(jogoDeExemplo()); save.gravarSlot(0);
  const outro = { ...jogoDeExemplo() }; outro.jogador = { ...outro.jogador, nome: 'Kauê' };
  jogo.carregar(outro); const cod = save.exportar();
  afirmar(save.importar(cod, 0) === 0, 'slot 0');
  afirmar(save.listarSlots()[0]?.nome === 'Kauê', 'novo no slot');
  afirmar(JSON.parse((await arm.ler('pingo.slot.0.bak'))!).dados.jogador.nome === 'Ayra', 'anterior no .bak');
});

console.log(`\n${feitos} testes de save passaram, ${falhas} falharam.\n`);
if (falhas) process.exit(1);
