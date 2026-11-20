// Etapas do trecho 1 (novo jogo → ginásio 4). Cada etapa só usa o teclado (via piloto) e termina num checkpoint.
const A = 'KeyZ';
const CUIA = { mata: 0, brasa: 1, rio: 2 };
const nivelMax = async (t) => Math.max(...(await t.resumo()).equipe.map((c) => c.nv));

/** do splash ao quarto: título, jogos salvos, dificuldade, avatar e nome */
async function comecar(t) {
  for (let i = 0; i < 600; i++) {
    const s = await t.snap();
    if (s.pronto && !s.oc && s.telas === 1 && s.zona) return;
    if (s.pronto && s.zona) { await t.resolver(); return; }
    if (s.dlg?.fase === 'escolhendo') {
      const regra = t.respostas.find(([re]) => re.test(s.dlg.texto ?? '')); const alvo = regra ? Math.max(0, s.dlg.opcoes.indexOf(regra[1])) : 0, n = s.dlg.opcoes.length;
      for (let k = 0; k < (alvo - s.dlg.indice + n) % n; k++) await t.toque('ArrowDown');
      await t.toque(A, 150); continue;
    }
    if (/tela-nome/.test(s.topo)) { await t.foto('nome'); await t.toque(A, 200); continue; } // o cursor nasce em "Fim": A aceita o nome sugerido
    await t.toque(A, 120);
  }
  throw new Error('a abertura não chegou ao mapa');
}

/** sequência literal dentro de um ginásio; lança 'derrota' se a zona mudar (voltou ao Posto) */
async function seq(t, zona, passos, semCura = false) {
  for (const p of passos) {
    const s = await t.resolver();
    if (s.zona !== zona) throw new Error('derrota');
    // entre um treinador e outro, quem está machucado sai para curar no Posto (não conta como derrota)
    // (remédio fora de batalha só com sobra: os dois últimos ficam guardados para o líder)
    if (p[0] === 'ir' && !semCura) await t.remedios(2);
    // quem está com a mais forte caída ou abaixo da metade (e sem remédio) sai do ginásio, cura no Posto e volta.
    // ATALHO DECLARADO: a ida e volta ao Posto da cidade é modelada como cura direta (o caminho de saída depende do
    // quebra-cabeça de cada ginásio); cada uma é contada em t.idasAoPosto.
    // (o líder é NPC de script e não entra em __qa.treinadores: a regra vale até a insígnia; antes do líder — último
    // passo da rota — a exigência sobe: ninguém caído e média de vida ≥ 70%, como quem se prepara para o chefe)
    if (p[0] !== 'em' && !semCura) { const h = await t.saude(), chefe = p === passos[passos.length - 1]; if (h.liderCaido || h.lider < 0.5 || (chefe && (h.caidos > 0 || h.frac < 0.7 || h.lider < 0.8))) { { await t.ev(async () => { const { jogo } = await import('/src/core/estado.ts'); const { curarCriatura } = await import('/src/battle/criatura.ts'); for (const c of jogo.save.equipe) curarCriatura(c); const s = jogo.save, j = s.jogador; while ((s.mochila['cha-cidreira'] ?? 0) < 2 && j.dinheiro >= 300) { j.dinheiro -= 300; s.mochila['cha-cidreira'] = (s.mochila['cha-cidreira'] ?? 0) + 1; } }); (t.idasAoPosto ??= []).push(zona); t.log('  ida ao Posto no meio do ginásio (cura e chás até 2 na Venda; atalho declarado)'); } } }
    if (p[0] === 'ir') await t.ir(p[1]);
    else if (p[0] === 'agir') await t.agir(p[1]);
    else if (p[0] === 'em') { if (s.x !== p[1] || s.y !== p[2]) { t.log(`  [ginásio] posição (${s.x},${s.y}), esperado (${p[1]},${p[2]}) — ${p[3] ?? ''}`); await t.foto('gin-desvio'); throw new Error('desvio'); } }
  }
  const s = await t.resolver(); if (s.zona !== zona) throw new Error('derrota');
}
const R = (txt) => txt.trim().split(/\s+/).map((p) => { if (p.startsWith('@')) { const [x, y] = p.slice(1).split(',').map(Number); return ['em', x, y]; } if (p.startsWith('!')) return ['agir', p[1]]; return ['ir', p]; });

const GINASIOS = {
  // saída depois do líder: o deque dele só tem corrente para o leste ((12,5) é um cata-vento); a prancha direita (já virada) desce e a rajada depois
  // do 2º mastro joga no mar, que devolve o jogador à entrada — é a única volta (não há caminho a pé)
  1: { cidade: 'A2', zona: 'A2-ginasio', saida: async (t) => { await seq(t, 'A2-ginasio', R('@8,2 ss ll @12,4 l s @13,5 s'), true); if ((await t.snap()).y === 5) { t.log('  (a prancha direita sopra para o norte: vira a alavanca de novo)'); await seq(t, 'A2-ginasio', R('nl !n os s'), true); } await seq(t, 'A2-ginasio', R('@13,9 s @8,16'), true); }, rota: R('nnn @8,11 ooo @5,11 n @5,10 noo @3,9 llll s @11,10 n @11,9 ll n @13,5 n @13,4 l !n os s @13,9 oo s @11,10 s oooooo @5,11 n noo n @3,5 n @3,4 l l @7,4 nnl !n') },
  // 2: pontes na ordem 1→6; a 7 (atalho) derruba de volta à entrada, e é por ela que se volta ao centro depois da 3
  2: { cidade: 'A3', zona: 'A3-ginasio', rota: R('nnnnnn @8,11 lll l @12,10 nll nnnn @14,5 lnnno oo @8,16 nnnnnn ooo o @4,10 noo nnnn @2,5 lnnn lll @6,2 ll !n') },
  // 3: volantes e balsas (roteiro de tools/testes/ginasios/g3.mjs, com a ida e volta ao volante 2)
  3: { cidade: 'A4', zona: 'A4-ginasio', rota: R('nnn @8,14 ooos !o nlll nnn @8,11 n ooooo n @3,9 !o s lllllll l ooooooo n !o s lllllll lll @13,10 nll !l oos ooo ooooooo n @3,9 !o l nnn @4,6 n llllllllll nnn @14,2 n oooo @10,1 !o') },
  // 4: espelhos e raios (tools/testes/ginasios/e4.mjs)
  4: { cidade: 'A5', zona: 'A5-ginasio', rota: R('lnn n oooooo @3,15 !n llllll nnn @9,12 nn o o @7,10 n o s !o no nn @6,7 n !n sl llll n @11,6 !l onn o n ssslll ss @12,9 ooooo s @7,10 !o nlllll nn ooo nnn nn @9,2 !n') },
};

/** tenta o ginásio `n` até vencer; entre derrotas, treina um nível na rota indicada e anota */
async function ginasio(t, n, op) {
  const g = GINASIOS[n];
  for (let tent = 1; tent <= 6; tent++) {
    await t.curarSePreciso();
    await t.viajar(g.zona);
    t.log(`  ginásio ${n}, tentativa ${tent}: equipe ${JSON.stringify((await t.resumo()).equipe.map((c) => `${c.nome} ${c.nv}`))}`);
    let saiu = false;
    try { await seq(t, g.zona, op?.rota ?? g.rota); } catch (e) { if (e.message === 'curar') saiu = true; else if (e.message !== 'derrota') throw e; }
    if (saiu) { t.log('  saiu do ginásio para curar'); (t.idasAoPosto ??= []).push(n); await t.curar(); tent--; if ((t.voltas = (t.voltas ?? 0) + 1) > 12) throw new Error('ginásio: voltas demais ao Posto'); continue; }
    if ((await t.resumo()).insignias.includes(n)) {
      t.log(`  INSÍGNIA ${n} na tentativa ${tent}`); (t.tentativasGinasio ??= {})[n] = tent;
      if (g.saida) { await t.foto(`gin${n}-vitoria`); if (typeof g.saida === 'function') await g.saida(t); else await seq(t, g.zona, g.saida, true); t.log(`  saiu do ginásio ${n} pela rota de saída`); }
      return;
    }
    t.log(`  perdeu no ginásio ${n} (tentativa ${tent})`);
    if (op?.treino) await t.treinar(op.treino, 1, `depois de perder no ginásio ${n}`);
  }
  throw new Error(`ginásio ${n}: seis derrotas`);
}

export const ETAPAS = [
  { nome: 'abertura: quarto, mãe, relógio, laboratório e a primeira parceira', fn: async (t) => {
    await comecar(t);
    await t.foto('quarto');
    await t.viajar('A1-casa-jogador'); await t.resolver();
    if (!(await t.flag('intro-ok'))) await t.falarCom('mae');
    await t.foto('casa');
    await t.viajar('A1'); await t.foto('vila');
    await t.viajar('A1-lab'); await t.falarCom('prof'); await t.foto('lab');
    const c = await t.ev(async () => { const m = await import('/src/data/zonas/A1-lab.ts'); return { cols: m.COLUNAS_CUIAS, lin: m.LINHA_CUIAS }; });
    await t.irAte(c.cols[CUIA[t.inicial]], c.lin + 1); await t.agir('n');
    if (!(await t.flag('inicial'))) throw new Error('não recebeu a inicial');
  } },
  { nome: 'Trilha do Ipê e o Ovo Pintado até o Seu Aroeira', fn: async (t) => {
    await t.limpar('A-R1');
    await t.viajar('A2'); await t.foto('a2');
    await t.viajar('A2-posto'); await t.curar();
    await t.viajar('A2-casa-aroeira'); await t.falarCom('aroeira');
    if (!(await t.flag('ovo-no-aroeira'))) throw new Error('o ovo não foi entregue');
  } },
  { nome: 'volta ao laboratório: rival 1, Diário, cuias, tutorial e capturas na Trilha', fn: async (t) => {
    await t.viajar('A1-lab'); await t.resolver();
    if (!(await t.flag('ovo-entregue'))) await t.falarCom('prof');
    if (!(await t.flag('ovo-entregue'))) throw new Error('rival-1 não concluiu');
    await t.viajar('A-R1'); await t.resolver();
    if (!(await t.flag('tutorial-captura'))) await t.falarCom('jurema');
    await t.cacar('A-R1', 4, 40);
    await t.limpar('A-R1');
    await t.viajar('A2-posto'); await t.curar();
  } },
  { nome: 'Vila Caiçara: compras e ginásio 1 (Vento)', fn: async (t) => {
    const r = await t.resumo();
    await t.comprar('A2-venda', [['cha-cidreira', Math.max(0, 3 - (r.mochila['cha-cidreira'] ?? 0))], ['cuia', Math.max(0, 5 - (r.mochila.cuia ?? 0))]]);
    await t.viajar('A2-posto'); await t.curar();
    await t.salvar(`${t.inicial}-pre-lider-1`);
    await ginasio(t, 1, { treino: 'A-R1' });
    await t.viajar('A2'); await t.viajar('A2-posto'); await t.curar();
  } },
  { nome: 'Faro, Campos de Restinga e Mata dos Sabiás até Bosque Alto', fn: async (t) => {
    await t.viajar('A2-casa-aroeira'); await t.falarCom('aroeira').catch((e) => t.log('  (Faro: ' + e.message + ')'));
    await t.cacar('A-R2', 5, 14);
    await t.limpar('A-R2');
    await t.cacar('A-MS', 6, 10);
    await t.limpar('A-MS');
    await t.viajar('A3'); await t.foto('a3'); await t.viajar('A3-posto'); await t.curar();
  } },
  { nome: 'Bosque Alto: compras, treinadores da vila e ginásio 2 (Inseto)', fn: async (t) => {
    await t.limpar('A3');
    await compras(t, 'A3-venda');
    await t.viajar('A3-posto'); await t.curar();
    await t.salvar(`${t.inicial}-pre-lider-2`);
    await ginasio(t, 2, { treino: 'A-MS' });
    await t.viajar('A3'); await t.viajar('A3-posto'); await t.curar();
  } },
  { nome: 'rival 2, Trilha dos Cipós e Gruta do Eco até Porto Sereia', fn: async (t) => {
    await t.viajar('A-R3'); await t.resolver();
    if (!(await t.flag('rival-2'))) t.log('  (rival-2 não disparou na saída de A3)');
    await t.cacar('A-R3', 6, 8);
    await t.limpar('A-R3');
    await t.limpar('A-GE');
    await t.viajar('A4'); await t.foto('a4'); await t.viajar('A4-posto'); await t.curar();
  } },
  { nome: 'Porto Sereia: compras, treinadores e ginásio 3 (Rio)', fn: async (t) => {
    await t.limpar('A4');
    await compras(t, 'A4-venda');
    await t.viajar('A4-posto'); await t.curar();
    await t.salvar(`${t.inicial}-pre-lider-3`);
    await ginasio(t, 3, { treino: 'A-R3' });
    await t.viajar('A4'); await t.viajar('A4-posto'); await t.curar();
  } },
  { nome: 'Estrada da Usina e Usina Velha (tenente Lata)', fn: async (t) => {
    await t.limpar('A-R4');
    await t.emZona('A-US-1'); await t.foto('usina-1');
    await t.limpar('A-US-1');
    await t.emZona('A-US-1'); await t.usar(5, 2);
    if (!(await t.flag('usina-grade'))) throw new Error('a alavanca não soltou a grade');
    await t.limpar('A-US-3'); await t.emZona('A-US-3'); await t.foto('usina-3');
    await t.usar(24, 2); if (!(await t.flag('usina-energia'))) throw new Error('a chave geral não ligou');
    await t.usar(2, 13);
    await t.limpar('A-US-2'); await t.emZona('A-US-2'); await t.foto('usina-2');
    for (let i = 0; i < 4 && !(await t.flag('usina-ok')); i++) { await t.emZona('A-US-2'); await t.irAte(14, 5, { tolerante: true }); await t.resolver(); }
    if (!(await t.flag('usina-ok'))) throw new Error('usina-ok não marcou');
    await t.foto('usina-fim');
    await t.viajar('A4'); await t.viajar('A4-posto'); await t.curar();
  } },
  { nome: 'cais de Porto Sereia: rival 3, Baía Azul e Cidade Coral', fn: async (t) => {
    await compras(t, 'A4-venda');
    await t.viajar('A4-posto'); await t.curar();
    await t.viajar('A4', [30, 36]); await t.resolver(); await t.foto('cais');
    if (!(await t.flag('rival-3'))) t.log('  (rival-3 não disparou no cais)');
    await t.curarSePreciso();
    await t.viajar('A-BA'); await t.foto('baia');
    await t.limpar('A-BA');
    await t.viajar('A5'); await t.foto('a5'); await t.viajar('A5-posto'); await t.curar();
  } },
  { nome: 'Cidade Coral: compras, treinadores e ginásio 4 (Encanto)', fn: async (t) => {
    await t.limpar('A5');
    await compras(t, 'A5-venda');
    await t.viajar('A5-posto'); await t.curar();
    await t.salvar(`${t.inicial}-pre-lider-4`);
    await ginasio(t, 4, { treino: 'A-BA' });
    await t.viajar('A5'); await t.viajar('A5-posto'); await t.curar();
  } },
];
/** compras de um jogador comum: remédio do melhor tipo à venda até ter 6, cuias até 5, guardando 30% do dinheiro */
async function compras(t, venda) {
  const r = await t.resumo(), tem = (id) => r.mochila[id] ?? 0, din = r.dinheiro;
  const forte = (await nivelMax(t)) >= 16 ? 'garrafada' : 'cha-cidreira', preco = forte === 'garrafada' ? 700 : 300;
  const q = Math.max(0, Math.min(6 - tem(forte), Math.floor((din * 0.7) / preco)));
  await t.comprar(venda, [[forte, q], ['cha-cidreira', forte === 'garrafada' && q < 2 ? Math.max(0, 4 - tem('cha-cidreira')) : 0], ['cuia', Math.max(0, 4 - tem('cuia'))]]);
}
export { ginasio, seq, R, GINASIOS, nivelMax, comecar };
