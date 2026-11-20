// QA 4 — jornada honesta do mapa B trecho 1 (depois da Liga → Cidade Ginga), por etapas com checkpoint.
// Ponto de partida: tools/testes/qa4/saves/campeao.json (cópia do checkpoint do QA 2). Daí em diante nada é injetado.
// Uso: qa4-run.sh qa4-jogar.mjs <seg> <etapa-inicial> [etapa-final]
//   etapas: trem vila pantanal-grande gin9 ninhal estrada mina gin10 chapada gin11 roda gin12
import { abrir, lerSave, temSave } from './qa4-lib.mjs';
import { GINASIOS_B } from './qa4-ginasios.mjs';
import { appendFileSync } from 'node:fs';
const ETAPAS = ['trem', 'vila', 'pantanal-grande', 'gin9', 'ninhal', 'estrada', 'mina', 'gin10', 'chapada', 'gin11', 'roda', 'gin12', 'tunel', 'lab', 'gin13', 'veredas', 'serra', 'gin14', 'nevoas', 'gin15', 'tupa', 'gin16', 'pico', 'conselho'];
const DE = { trem: 'campeao', vila: 'b1', 'pantanal-grande': 'cerrado', gin9: 'b2', ninhal: 'passo-9', estrada: 'b9', mina: 'b3', gin10: 'mina-ok', chapada: 'passo-10', gin11: 'b4', roda: 'passo-11', gin12: 'b5', tunel: 'passo-12', lab: 'b6', gin13: 'lab-ok', veredas: 'passo-13', serra: 'b-vv', gin14: 'b7', nevoas: 'passo-14', gin15: 'b8', tupa: 'passo-15', gin16: 'a9', pico: 'passo-16', conselho: 'pico' };
const ini = process.argv[2] ?? 'trem', fim = process.argv[3] ?? 'gin12';
const t = await abrir(lerSave(process.env.SAVE ?? DE[ini]), { semente: Number(process.env.SEMENTE ?? 7) });
const Qr = (fn, arg) => t.q(fn, arg);
const MANT = { garrafada: 10, 'elixir-andiroba': 2, 'cha-guarana': 2, 'mel-puro': 1, unguento: 2 };
const estat = { derrotas: [], treinoExtra: [], postos: 0, chefes: [] };
let nbRel = 0;
const REG = '/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qa4/marcos.log';
const marco = (s) => { console.log('>> ' + s); appendFileSync(REG, new Date().toISOString().slice(11, 19) + ' ' + s + '\n'); };
const relato = async (rot) => { const r = await t.resumo(); console.log(`== ${rot}: ${r.zona} $${r.dinheiro} | ${r.equipe.map((e) => e.replace(/ \[.*$/, '')).join(' · ')}`); const bs = await t.relato(nbRel); nbRel += bs.length; };
const viajar = (z) => Qr((z) => window.Q.viajar(z), z);
async function cidade(c, compras) {
  await viajar(`${c}-posto`); await Qr(() => window.Q.curarNoPosto()); estat.postos++;
  if (compras) await comprar(c, compras);
  await viajar(c);
}
async function comprar(c, compras) {
  await viajar(`${c}-venda`); const m = (await t.resumo()).mochila; const lista = {};
  for (const [id, alvo] of Object.entries(compras)) if ((m[id] ?? 0) < alvo) lista[id] = alvo - (m[id] ?? 0);
  if (Object.keys(lista).length) console.log('   compras:', JSON.stringify(await Qr((l) => window.Q.comprar(l), lista)));
}
async function tentar(rotulo, fn, o = {}) {
  for (let n = 0; n < Number(process.env.MAXT ?? 8); n++) {
    try { await fn(n); return n; }
    catch (e) {
      if (!/DERROTA/.test(e.message)) throw e;
      const d = (await Qr(() => window.Q.derrotas.slice(-1)[0]));
      estat.derrotas.push({ etapa: rotulo, ...d }); marco(`DERROTA em ${rotulo}: ${JSON.stringify(d)} (tentativa ${n + 1})`);
      await relato('derrota');
      if (n >= 1 && o.treino) { const antes = (await t.batalhas()).length; try { await o.treino(); } catch (e2) { if (!/DERROTA/.test(e2.message)) throw e2; estat.derrotas.push({ etapa: rotulo + ' (treino)' }); } const depois = (await t.batalhas()).length; estat.treinoExtra.push({ etapa: rotulo, batalhas: depois - antes }); marco(`treino extra antes de ${rotulo}: ${depois - antes} batalhas`); await relato('treino'); }
    }
  }
  throw new Error('desisti de ' + rotulo + ' depois de 8 derrotas');
}
const cuidar = (o) => Qr((o) => window.Q.cuidar(o), o ?? { limiar: 0.5, reanimar: false, guardar: { garrafada: 2 } });
let semVolta = false; // trecho sem caminho de volta ao Posto (leste do Túnel Alagado): segue em frente
async function recompor() {
  const sn = await Qr(() => window.Q.saudeNucleo(3));
  if (sn.caidas === 0 && sn.pior >= 0.55 && !sn.pgBaixo) return;
  const z = (await t.st()).zona;
  const temPosto = await Qr((z) => !!window.__pingo.mundo.zona.warps.some((w) => w.para.zona === z + '-posto'), z);
  if (temPosto) { await viajar(`${z}-posto`); await Qr(() => window.Q.curarNoPosto()); estat.postos++; await viajar(z); return; }
  await cuidar({ limiar: 0.6, reanimar: true, nucleo: 3 });
  if (semVolta) return;
  const d2 = await Qr(() => window.Q.saudeNucleo(3));
  if (d2.caidas >= 1 || d2.pior < 0.4 || d2.pgBaixo) {
    const posto = await Qr(() => window.__pingo.jogo.save.ultimoPosto?.zona);
    if (posto && posto !== z) {
      console.log(`   (equipe gasta em ${z}: volta ao ${posto})`); estat.voltas = (estat.voltas ?? 0) + 1;
      await viajar(posto); await Qr(() => window.Q.curarNoPosto()); estat.postos++;
      const c = posto.replace(/-posto$/, '');
      try { await comprar(c, MANT); } catch (e) { if (/DERROTA/.test(e.message)) throw e; console.log('   compra falhou:', e.message); }
      await viajar(z);
    }
  }
}
const limpar = async (o) => {
  let n = 0;
  for (let i = 0; i < 25; i++) { await recompor(); await Qr(() => window.Q.rodizio('treino')); const k = await t.treinadores({ ...(o ?? {}), max: 1 }); if (!k) break; n += k; }
  await t.catar().catch((e) => { if (/DERROTA/.test(e.message)) throw e; console.log('   catar:', e.message); });
  await recompor();
  return n;
};
/** nível da equipe e do ás ao chegar num chefe */
const chegada = async (quem, as) => { const s = await t.save(); const nv = s.equipe.filter((c) => !c.ovo).map((c) => c.nivel).sort((a, b) => b - a); const med = +(nv.reduce((a, b) => a + b, 0) / nv.length).toFixed(1); const rem = Object.fromEntries(Object.entries(s.mochila).filter(([k]) => /garrafada|elixir|cha-|mel|unguento|pomada|garapa/.test(k))); estat.chefes.push({ quem, as, equipe: nv, media: med, dif: nv[0] - as, dinheiro: s.jogador.dinheiro, nb: (await t.st()).nb }); marco(`chegada em ${quem} (ás ${as}): equipe ${nv.join('/')} média ${med} (Δ ás ${nv[0] - as}, Δ média ${(med - as).toFixed(1)}) $${s.jogador.dinheiro} remédios ${JSON.stringify(rem)}`); };
const ASL = { 9: 55, 10: 58, 11: 61, 12: 63, 13: 66, 14: 68, 15: 70, 16: 72 };
async function ginasio(n) {
  const G = GINASIOS_B[n];
  const s = await t.st(); if (s.zona !== G.zona) throw new Error('não estou no ginásio ' + n);
  for (const p of [...G.passos, ...(G.volta ?? [])]) {
    if (p.ir) { const nb0 = (await t.st()).nb; await t.ir(p.ir); if ((await t.st()).nb > nb0) { await cuidar({ limiar: 0.5, reanimar: true, guardar: { garrafada: 3 } }); await Qr(() => window.Q.rodizio('treino')); } }
    else if (p.ate) {
      const nb0 = (await t.st()).nb;
      await Qr(([x, y, ev]) => { const V = window.__pingo.mundo; const z = V.zona; const set = new Set(); for (let yy = 0; yy < z.mapaChars.length; yy++) for (let xx = 0; xx < z.mapaChars[yy].length; xx++) if (ev.includes(z.mapaChars[yy][xx]) && !(xx === x && yy === y)) set.add(xx + ',' + yy); return window.Q.irAte(x, y, { evitar: set }); }, [p.ate[0], p.ate[1], p.ev ?? '']);
      if ((await t.st()).nb > nb0) { await cuidar({ limiar: 0.5, reanimar: true, guardar: { garrafada: 3 } }); await Qr(() => window.Q.rodizio('treino')); }
    }
    else if (p.agir) await t.agir(p.agir);
    else if (p.pisar) {
      // portal/estrela (ginásio 15): chega a um vizinho sem pisar em portal nem estrela, e pisa no alvo
      const [x, y] = p.pisar;
      const viz = await Qr(([x, y]) => { const V = window.__pingo.mundo, z = V.zona, set = new Set(); for (let yy = 0; yy < z.mapaChars.length; yy++) for (let xx = 0; xx < z.mapaChars[yy].length; xx++) if ('o,'.includes(z.mapaChars[yy][xx])) set.add(xx + ',' + yy); return window.Q.irAte(x, y, { vizinho: true, evitar: set }); }, [x, y]);
      const d = x > viz.x ? 'l' : x < viz.x ? 'o' : y > viz.y ? 's' : 'n';
      await t.ir(d); await t.assentar(); await Qr(() => window.Q.quadros(20)); const q = await t.assentar();
      console.log(`   pisou (${x},${y}) → (${q.x},${q.y}) ${JSON.stringify(await t.falas(1))}`);
    }
    else if (p.cuidar) { await cuidar({ limiar: 0.8, reanimar: true }); await Qr(() => window.Q.rodizio('chefe')); await chegada(`líder ${n} (na frente dele)`, ASL[n]); }
    else if (p.em) { const q = await t.assentar(); if (q.x !== p.em[0] || q.y !== p.em[1]) { await t.foto(`gin${n}-fora`); throw new Error(`ginásio ${n}: esperava (${p.em}) em "${p.r}", estou em (${q.x},${q.y}) · falas: ${JSON.stringify(await t.falas(3))}`); } }
  }
}
/** prepara a equipe já parada junto do chefe (cura com remédios, reanima, abre com a mais forte) e registra a chegada */
async function prontoParaChefe(quem, as) {
  await recompor(); await cuidar({ limiar: 0.85, reanimar: true }); await Qr(() => window.Q.rodizio('chefe'));
  await chegada(quem, as);
}
/** mergulho/subida por poço (warp sem porta na água): vai até o poço e aperta A */
async function mergulhar(x, y, dest) {
  for (let k = 0; k < 4; k++) {
    await t.irAte(x, y); await t.agir(); await t.assentar();
    if ((await t.st()).zona === dest) return;
    await t.agir(); await t.assentar(); if ((await t.st()).zona === dest) return;
  }
  throw new Error(`mergulho em (${x},${y}) não levou a ${dest}: ${JSON.stringify(await t.st())} ${JSON.stringify(await t.falas(2))}`);
}
const querCapturar = (n) => Qr((n) => { window.Q.capturar = (e, nv) => true; window.Q.maxCapturas = window.Q.capturadas.length + n; }, n);
const naoCapturar = () => Qr(() => { window.Q.maxCapturas = 0; });

async function gin(n, cid, as, zonaG) {
  await tentar(`gin${n}`, async () => {
    await cidade(cid, MANT);
    await viajar(zonaG); await t.foto(`gin${n}-entrada`);
    await chegada(`líder ${n} (entrada)`, as);
    await ginasio(n);
    await t.exige((await t.resumo()).insignias.includes(n), `insígnia ${n}`);
  }, { treino: async () => { await viajar(cid); await Qr(() => window.Q.passear(8)).catch((e) => { if (/DERROTA/.test(e.message)) throw e; console.log('   passear:', e.message); }); } });
  await t.foto(`gin${n}-fim`); await viajar(cid);
}

const etapas = {
  async trem() {
    console.log('ajudantes:', JSON.stringify(await Qr(() => window.Q.ajudantes())));
    // Platô: Posto e Venda antes de descer o mapa A (a mochila do Campeão saiu da Liga sem garrafada)
    await viajar('A-LG-posto'); await Qr(() => window.Q.curarNoPosto());
    await comprar('A-LG', { garrafada: 10, 'cha-guarana': 3, 'elixir-andiroba': 2 });
    await naoCapturar();
    await viajar('A4-estacao'); await t.foto('a4-estacao');
    await t.falarCom('a4-viajante').catch(() => 0);
    marco('A4-estacao alcançada a pé: ' + JSON.stringify(await t.st()));
    await Qr(() => window.Q.irZona('B1-estacao'));
    await t.assentar(); await t.foto('b1-estacao');
    await t.exige((await t.st()).zona === 'B1-estacao', 'trem desceu a serra até B1-estacao');
    await Qr(() => window.Q.irAte(8, 7)); await t.assentar();
    await t.exige(await t.flag('b1-chegou'), 'evento de chegada (b1-chegou)');
    console.log('   falas da chegada:', JSON.stringify(await t.falas(6)));
    await viajar('B1'); await t.foto('b1-vila');
    await t.checkpoint('b1');
  },
  async vila() {
    await tentar('vila', async () => {
      await cidade('B1', MANT);
      await viajar('B1-salao'); await t.foto('b1-salao'); await t.falarCom('b1-sucupira').catch((e) => console.log('   raizeira:', e.message)); console.log('   salão:', JSON.stringify(await t.falas(3)));
      await viajar('B1'); await limpar();
      await querCapturar(1);
      await viajar('B-R1'); await t.foto('b-r1'); await limpar();
      await viajar('B-CE'); await t.foto('b-ce'); await limpar();
    }, { treino: async () => { await viajar('B-R1'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('cerrado');
  },
  async 'pantanal-grande'() {
    await tentar('pantanal-grande', async () => {
      await querCapturar(1);
      await viajar('B-PA'); await t.foto('b-pa'); await limpar();
      await viajar('B2'); await t.foto('b2-chegada');
      await cidade('B2', MANT); await limpar();
      await viajar('B2-centro'); await t.foto('b2-centro'); await t.falarCom('b2-veterinaria').catch((e) => console.log('   veterinária:', e.message)); console.log('   centro:', JSON.stringify(await t.falas(3)));
      await viajar('B2');
    }, { treino: async () => { await viajar('B-PA'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('b2');
  },
  async gin9() { await naoCapturar(); await gin(9, 'B2', 55, 'B2-ginasio'); await t.checkpoint('passo-9'); },
  async ninhal() {
    await tentar('ninhal', async () => {
      await cidade('B2', MANT);
      await viajar('B-PA'); await limpar();
      if (!(await t.flag('pantanal-ok'))) {
        const npc = await Qr(() => window.Q.npc('arame'));
        console.log('   arame em', JSON.stringify(npc));
        if (npc) await t.irAte(npc.x, npc.y, { vizinho: true });
        await prontoParaChefe('tenente Arame', 57);
        if (npc) await t.falarCom('arame');
        await t.assentar();
      }
      await t.exige(await t.flag('pantanal-ok'), 'Arame vencido: pantanal-ok');
      await t.foto('ninhal-depois');
      await limpar();
    }, { treino: async () => { await viajar('B-PA'); await Qr(() => window.Q.passear(8)); } });
    // filhote do Centro de Reabilitação (um por dia)
    await viajar('B2-centro'); await t.falarCom('b2-veterinaria').catch((e) => console.log('   veterinária:', e.message));
    console.log('   centro depois do ninhal:', JSON.stringify(await t.falas(4)), JSON.stringify(await t.flags('orfao')));
    await t.foto('b2-centro-filhote');
    await tentar('canal-sul', async () => {
      await cidade('B2', MANT);
      await viajar('B9'); await t.foto('b9-chegada');
      await cidade('B9', MANT); await limpar();
    });
    await t.checkpoint('b9');
  },
  async estrada() {
    await tentar('estrada', async () => {
      await querCapturar(1);
      await cidade('B9', MANT);
      await viajar('B-R2'); await t.foto('b-r2'); await limpar();
      await viajar('B3'); await t.foto('b3-chegada');
      await cidade('B3', MANT); await limpar();
    }, { treino: async () => { await viajar('B-R2'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('b3');
  },
  async mina() {
    await naoCapturar();
    await tentar('mina', async () => {
      await cidade('B3', MANT);
      await viajar('B3-mina-1'); await t.foto('mina-1'); await limpar();
      await viajar('B3-mina-2'); await t.foto('mina-2'); await limpar({ menos: ['rebite'] });
      if (!(await t.flag('mina-ok'))) {
        const npc = await Qr(() => window.Q.npc('rebite')); if (npc) await t.irAte(npc.x, npc.y, { vizinho: true });
        await prontoParaChefe('tenente Rebite (mina)', 56);
        await t.falarCom('rebite'); await t.assentar();
      }
      await t.exige(await t.flag('mina-ok'), 'Rebite vencido: mina-ok');
      await t.foto('mina-ok');
    }, { treino: async () => { await viajar('B-R2'); await Qr(() => window.Q.passear(8)); } });
    await viajar('B3'); await t.checkpoint('mina-ok');
  },
  async gin10() { await naoCapturar(); await gin(10, 'B3', 58, 'B3-ginasio'); await t.checkpoint('passo-10'); },
  async chapada() {
    await tentar('chapada', async () => {
      await querCapturar(1);
      await cidade('B3', MANT);
      await viajar('B-CH'); await t.foto('b-ch'); await limpar();
      if (!(await t.flag('boitata-ok'))) {
        await viajar('B-CV'); await t.foto('b-cv'); await limpar();
        await cidade('B3', MANT).catch(async () => 0);
        await viajar('B-CV');
        await Qr(() => { window.Q.capturar = (e) => true; window.Q.maxCapturas = window.Q.capturadas.length + 1; });
        await cuidar({ limiar: 0.9, reanimar: true }); await Qr(() => window.Q.rodizio('chefe'));
        const b = await Qr(() => window.Q.npc('boitata')); console.log('   boitatá em', JSON.stringify(b));
        if (b) await t.falarCom('boitata'); await t.assentar();
        console.log('   log do piloto:', JSON.stringify(await Qr(() => window.Q.log.filter((l) => /lendário/.test(l)).slice(-3))));
        console.log('   boitatá:', JSON.stringify(await t.flags('boitata|b1-')), JSON.stringify(await t.falas(3)));
        await t.foto('boitata-depois');
      }
      await viajar('B4'); await t.assentar(); await t.foto('b4-chegada');
      // a Tainá espera na estrada que sobe da chapada (gatilho na fila 31): segue pela estrada para o norte
      if (!(await t.flag('rival-6'))) { await prontoParaChefe('rival-6 (Tainá)', 59); await t.ir('n'); await t.assentar(); }
      if (!(await t.flag('rival-6'))) { console.log('   rival-6 ainda não aconteceu; falas:', JSON.stringify(await t.falas(3))); }
    }, { treino: async () => { await viajar('B-CH'); await Qr(() => window.Q.passear(8)); } });
    await t.exige(await t.flag('rival-6'), 'rival-6 feito');
    await cidade('B4', MANT); await limpar();
    await t.checkpoint('b4');
  },
  async gin11() { await naoCapturar(); await gin(11, 'B4', 61, 'B4-ginasio'); await t.checkpoint('passo-11'); },
  async roda() {
    await tentar('roda', async () => {
      await cidade('B4', MANT);
      await viajar('B-R3'); await t.foto('b-r3'); await limpar();
      await viajar('B5'); await t.foto('b5-chegada');
      await cidade('B5', MANT); await limpar();
    }, { treino: async () => { await viajar('B-R3'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('b5');
  },
  async gin12() {
    const existe = await Qr(async () => { const Z = await import('/src/world/zonas.ts'); return !!Z.zonaDef('B5-ginasio'); });
    if (!existe) { marco('ginásio 12 (B5-ginasio) ainda não existe: registrado e parado aqui'); await chegada('líder 12 (ginásio ausente)', 55); return; }
    await naoCapturar(); await gin(12, 'B5', 63, 'B5-ginasio'); await t.checkpoint('passo-12');
  },
  async tunel() {
    // Cidade Ginga → poço da Lagoa do Berimbau (Mergulho) → Túnel Alagado → Gruta do Fôlego → cascata (Cachoeira) → Brejo Roxo
    await tentar('tunel', async () => {
      await querCapturar(1);
      await cidade('B5', MANT);
      if ((await t.st()).zona === 'B5') await mergulhar(47, 14, 'B-TA');
      if ((await t.st()).zona === 'B-TA') { await t.foto('b-ta'); await limpar(); await mergulhar(26, 22, 'B-TA-gruta'); }
      if ((await t.st()).zona === 'B-TA-gruta') {
        await t.foto('b-ta-gruta'); await limpar({ forca: true });
        await Qr(() => window.Q.irAteForca(32, 10)); await t.irAte(33, 10); await t.agir('n'); await t.assentar();
        marco('cascata da gruta: ' + JSON.stringify(await t.st()) + ' ' + JSON.stringify(await t.falas(2)));
        await mergulhar(36, 4, 'B-TA');
      }
      if ((await t.st()).zona === 'B-TA') { semVolta = true; try { await limpar(); } finally { semVolta = false; } await mergulhar(54, 24, 'B6'); }
      await t.exige((await t.st()).zona === 'B6', 'chegou ao Brejo Roxo');
      await t.foto('b6-chegada');
      await cidade('B6', MANT); await limpar({ menos: ['porteiro-lab'] });
    }, { treino: async () => { await viajar('B6'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('b6');
  },
  async lab() {
    await naoCapturar();
    await tentar('lab', async () => {
      await cidade('B6', MANT);
      if (!(await t.flag('b2-lab-porteiro'))) { await chegada('capanga do curtume', 0); await t.usar(43, 9); await t.assentar(); }
      await viajar('B6-lab-1'); await t.foto('lab-1'); await limpar();
      if (!(await t.flag('b2-lab-alavanca'))) { await t.usar(26, 9); }
      console.log('   lab-1:', JSON.stringify(await t.flags('b2-lab')), JSON.stringify(await t.falas(2)));
      await viajar('B6-lab-2'); await t.foto('lab-2'); await limpar({ menos: ['peconha'] });
      await t.falarCom('peconha').catch((e) => console.log('   peçonha:', e.message));
      await t.usar(2, 19); await t.usar(28, 3);
      console.log('   lab-2:', JSON.stringify(await t.flags('b2-lab|peconha')), JSON.stringify(await t.falas(2)));
      await viajar('B6-lab-3');
      await prontoParaChefe('tenentes Zinabre e Lata (laboratório)', 63);
      await t.irAte(11, 6); await t.assentar();
      await t.exige(await t.flag('laboratorio-ok'), 'laboratorio-ok');
      await t.foto('lab-ok');
    }, { treino: async () => { await viajar('B6'); await Qr(() => window.Q.passear(8)); } });
    await viajar('B6'); await t.checkpoint('lab-ok');
  },
  async gin13() { await naoCapturar(); await gin(13, 'B6', 66, 'B6-ginasio'); await t.checkpoint('passo-13'); },
  async veredas() {
    await tentar('veredas', async () => {
      await querCapturar(1);
      await cidade('B6', MANT);
      await viajar('B-VV'); await t.foto('b-vv'); await limpar();
      await viajar('B6'); await cidade('B6', MANT);
    }, { treino: async () => { await viajar('B-VV'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('b-vv');
  },
  async serra() {
    await tentar('serra', async () => {
      await querCapturar(1);
      if ((await t.st()).zona !== 'B-R4' && (await t.st()).zona !== 'B7') { await cidade('B6', MANT); await viajar('B-R4'); }
      if ((await t.st()).zona === 'B-R4') {
        await t.foto('b-r4');
        for (const [x, y] of [[12, 60], [12, 57], [36, 46], [36, 43], [20, 32], [20, 30], [8, 18], [8, 16]]) { await Qr(([x, y]) => window.Q.irAteForca(x, y), [x, y]); await recompor(); }
        await limpar({ forca: true });
        await Qr(() => window.Q.irAteForca(38, 1)); await t.ir('n');
      }
      await t.assentar(); await t.exige((await t.st()).zona === 'B7', 'chegou à Serra da Geada');
      await t.foto('b7-chegada');
      if (!(await t.flag('rival-7'))) {
        await prontoParaChefe('rival-7 (Tainá)', 66);
        await t.irAte(24, 36); await t.assentar();
        console.log('   rival-7:', JSON.stringify(await t.flags('rival-7|batalha-perdida')), JSON.stringify(await t.falas(2)));
      }
      await cidade('B7', MANT); await limpar();
    }, { treino: async () => { await viajar('B7'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('b7');
  },
  async gin14() { await naoCapturar(); await gin(14, 'B7', 68, 'B7-ginasio'); await t.checkpoint('passo-14'); },
  async nevoas() {
    await tentar('nevoas', async () => {
      await querCapturar(1);
      if ((await t.st()).zona !== 'B-R5' && (await t.st()).zona !== 'B8') { await cidade('B7', MANT); await viajar('B-R5'); }
      if ((await t.st()).zona === 'B-R5') { await t.foto('b-r5'); await limpar(); await viajar('B8'); }
      await t.exige((await t.st()).zona === 'B8', 'chegou ao Planalto Lume');
      await t.foto('b8-chegada');
      await cidade('B8', MANT); await limpar();
    }, { treino: async () => { await viajar('B-R5'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('b8');
  },
  async gin15() { await naoCapturar(); await gin(15, 'B8', 70, 'B8-ginasio'); await t.checkpoint('passo-15'); },
  async tupa() {
    // insígnia 15: Voo até Vila Ferrugem (A8) e a pé pelo Monte Tupã (A-MT) até a Aldeia Tupã (A9)
    await tentar('tupa', async () => {
      await querCapturar(1);
      const z = (await t.st()).zona;
      if (/^B/.test(z)) { if (/-/.test(z) && z !== 'B8') await viajar('B8'); await Qr(() => window.Q.voar('A8')); marco('voou: ' + JSON.stringify(await t.st())); }
      await cidade('A8', MANT);
      await viajar('A-MT'); await t.foto('a-mt'); await limpar();
      await viajar('A9'); await t.foto('a9-chegada');
      await cidade('A9', MANT); await limpar();
    }, { treino: async () => { await viajar('A-MT'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('a9');
  },
  async gin16() { await naoCapturar(); await gin(16, 'A9', 72, 'A9-ginasio'); await t.checkpoint('passo-16'); },
  async pico() {
    await tentar('pico', async () => {
      await naoCapturar();
      if ((await t.st()).zona !== 'PP') { await cidade('A9', MANT); await viajar('PP'); }
      await t.foto('pp-acampamento');
      await cidade('PP', MANT);
      await t.falarCom('pp-tibirica').catch((e) => console.log('   tibiriçá:', e.message));
      console.log('   portão:', JSON.stringify(await t.falas(3)));
      await t.catar();
      await limpar({ menos: ['pp-garrote', 'pp-taina'] });
      if (!(await t.flag('garrote-vencido'))) {
        await t.irAte(19, 15); await prontoParaChefe('Coronel Garrote', 74);
        await t.irAte(19, 13); await t.assentar();
        console.log('   garrote:', JSON.stringify(await t.flags('garrote')), JSON.stringify(await t.falas(3)));
      }
      await t.exige(await t.flag('garrote-vencido'), 'garrote-vencido');
      if (!(await t.flag('rival-8'))) {
        await t.irAte(19, 10); await prontoParaChefe('rival-8 (Tainá)', 75);
        await t.irAte(19, 8); await t.assentar();
        console.log('   rival-8:', JSON.stringify(await t.flags('rival-8|batalha-perdida')), JSON.stringify(await t.falas(3)));
      }
      await t.foto('pp-cume');
    }, { treino: async () => { await viajar('PP'); await Qr(() => window.Q.passear(8)); } });
    await viajar('PP-posto'); await Qr(() => window.Q.curarNoPosto()); await viajar('PP');
    await t.checkpoint('pico');
  },
  async conselho() {
    estat.conselho = [];
    await tentar('conselho', async (n) => {
      if ((await t.st()).zona !== 'PP-conselho') {
        await viajar('PP-posto'); await Qr(() => window.Q.curarNoPosto()); await comprar('PP', { ...MANT, garrafada: 12, 'elixir-andiroba': 4, 'cha-guarana': 4 }); await viajar('PP');
        await viajar('PP-conselho');
      }
      await t.irAte(15, 52).catch(() => 0); await t.assentar();
      for (const [k, y] of [[1, 39], [2, 31], [3, 23], [4, 15], [5, 8]]) {
        if (await t.flag(`conselho-${k}`)) continue;
        await cuidar({ limiar: 0.85, reanimar: true }); await Qr(() => window.Q.rodizio('chefe'));
        await chegada(`Guardião ${k} (tentativa ${n + 1})`, [73, 74, 75, 76, 77][k - 1]);
        estat.conselho.push({ k, tentativa: n + 1 });
        await t.usar(15, y); await t.assentar();
        const s = await t.st(); marco(`sala ${k}: ${s.zona} (${s.x},${s.y}) ${JSON.stringify(await t.flags('conselho|pos-jogo'))}`);
        if (await t.flag('conselho-vencido')) break;
      }
      await t.assentar();
      await t.exige(await t.flag('conselho-vencido'), 'conselho-vencido');
    }, {});
    console.log('   depois do Conselho:', JSON.stringify(await t.st()), JSON.stringify(await t.flags('conselho|pos-jogo|misterioso|errante')), JSON.stringify(await t.falas(4)));
    await t.foto('pos-conselho');
    await t.checkpoint('campeao-b');
  },
};

try {
  let i = ETAPAS.indexOf(ini);
  for (; i <= ETAPAS.indexOf(fim); i++) {
    const e = ETAPAS[i];
    console.log(`\n######## ${e}`); marco('etapa ' + e);
    await etapas[e]();
    await relato(e);
    console.log('   estat:', JSON.stringify(estat), 'compras:', JSON.stringify(await Qr(() => window.Q.compras)), 'itens no campo:', JSON.stringify(await Qr(() => window.Q.itensCampo)), 'capturas:', JSON.stringify(await Qr(() => window.Q.capturadas)));
    marco(`fim ${e}: ${JSON.stringify(estat)} capturas ${JSON.stringify(await Qr(() => window.Q.capturadas))}`);
  }
} catch (e) { marco('FALHA ' + e.message.split('\n')[0]); console.log('FALHA', e.message.split('\n')[0], JSON.stringify(await t.st().catch(() => 0)), await t.falas(3).catch(() => 0)); await t.foto('erro'); await relato('falha').catch(() => 0); console.log((await Qr(() => window.Q.log.slice(-15)).catch(() => [])).join('\n')); }
await t.fim();
