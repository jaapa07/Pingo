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
async function seq(t, zona, passos) {
  for (const p of passos) {
    const s = await t.resolver();
    if (s.zona !== zona) throw new Error('derrota');
    if (p[0] === 'ir') await t.ir(p[1]);
    else if (p[0] === 'agir') await t.agir(p[1]);
    else if (p[0] === 'em') { if (s.x !== p[1] || s.y !== p[2]) { t.log(`  [ginásio] posição (${s.x},${s.y}), esperado (${p[1]},${p[2]}) — ${p[3] ?? ''}`); await t.foto('gin-desvio'); throw new Error('desvio'); } }
  }
  const s = await t.resolver(); if (s.zona !== zona) throw new Error('derrota');
}
const R = (txt) => txt.trim().split(/\s+/).map((p) => { if (p.startsWith('@')) { const [x, y] = p.slice(1).split(',').map(Number); return ['em', x, y]; } if (p.startsWith('!')) return ['agir', p[1]]; return ['ir', p]; });

const GINASIOS = {
  1: { cidade: 'A2', zona: 'A2-ginasio', rota: R('nnn @8,11 ooo @5,11 n @5,10 noo @3,9 llll s @11,10 n @11,9 ll n @13,5 n @13,4 l !n os s @13,9 oo s @11,10 s oooooo @5,11 n noo n @3,5 n @3,4 l l @7,4 nnl !n') },
  2: { cidade: 'A3', zona: 'A3-ginasio', rota: R('nnnnnn @8,11 lll l @12,10 nll nnnn @14,5 lnnno') },
};

/** tenta o ginásio `n` até vencer; entre derrotas, treina um nível na rota indicada e anota */
async function ginasio(t, n, op) {
  const g = GINASIOS[n];
  for (let tent = 1; tent <= 6; tent++) {
    await t.curarSePreciso();
    await t.viajar(g.zona);
    t.log(`  ginásio ${n}, tentativa ${tent}: equipe ${JSON.stringify((await t.resumo()).equipe.map((c) => `${c.nome} ${c.nv}`))}`);
    try { await seq(t, g.zona, op?.rota ?? g.rota); } catch (e) { if (e.message !== 'derrota') throw e; }
    if ((await t.resumo()).insignias.includes(n)) { t.log(`  INSÍGNIA ${n} na tentativa ${tent}`); (t.tentativasGinasio ??= {})[n] = tent; return; }
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
];
export { ginasio, seq, R, GINASIOS, nivelMax, comecar };
