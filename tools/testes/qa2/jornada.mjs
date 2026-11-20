// QA 2 — jornada honesta do 4º ginásio (Cidade Coral) ao Platô da Liga, por etapas com checkpoint.
// Uso: run.sh jornada.mjs <seg> <etapa-inicial> [etapa-final]     etapas: farol xarope gin5 gruta gin6 encosta gin7 buriti gin8 plato
import { abrir, lerSave, temSave } from './lib.mjs';
import { GINASIOS } from './ginasios.mjs';
const ETAPAS = ['farol', 'xarope', 'gin5', 'gruta', 'gin6', 'encosta', 'gin7', 'buriti', 'gin8', 'plato'];
const DE = { farol: 'passo-4', xarope: 'farol-ok', gin5: 'farol-remedio', gruta: 'passo-5', gin6: 'serra', encosta: 'passo-6', gin7: 'ferrugem', buriti: 'passo-7', gin8: 'vila-buriti', plato: 'passo-8' };
const ini = process.argv[2] ?? 'farol', fim = process.argv[3] ?? 'plato';
const t = await abrir(lerSave(DE[ini]));
const Qr = (fn, arg) => t.q(fn, arg);
const MANT = { garrafada: 10, 'cha-guarana': 2, 'mel-puro': 2, unguento: 2 }, MANT2 = { garrafada: 12, 'cha-guarana': 3, 'elixir-andiroba': 2, 'pomada-copaiba': 1 };
const estat = { derrotas: [], treinoExtra: [], postos: 0 };
let nbRel = 0;
const relato = async (rot) => { const r = await t.resumo(); console.log(`== ${rot}: ${r.zona} $${r.dinheiro} | ${r.equipe.map((e) => e.replace(/ \[.*$/, '')).join(' · ')}`); const bs = await t.relato(nbRel); nbRel += bs.length; };
const viajar = (z) => Qr((z) => window.Q.viajar(z), z);
/** passa no Posto e na Venda da cidade (ids `<cidade>-posto` / `<cidade>-venda`) */
async function cidade(c, compras) {
  await viajar(`${c}-posto`); await Qr(() => window.Q.curarNoPosto()); estat.postos++;
  if (compras) { await viajar(`${c}-venda`); const m = (await t.resumo()).mochila; const lista = {}; for (const [id, alvo] of Object.entries(compras)) if ((m[id] ?? 0) < alvo) lista[id] = alvo - (m[id] ?? 0); if (Object.keys(lista).length) console.log('   compras:', JSON.stringify(await Qr((l) => window.Q.comprar(l), lista))); }
  await viajar(c);
}
/** roda `fn` até dar certo; cada DERROTA volta ao começo (o jogo já levou ao Posto). 2ª derrota em diante: treino extra. */
async function tentar(rotulo, fn, o = {}) {
  for (let n = 0; n < Number(process.env.MAXT ?? 8); n++) {
    try { await fn(n); return n; }
    catch (e) {
      if (!/DERROTA/.test(e.message)) throw e;
      const d = (await Qr(() => window.Q.derrotas.slice(-1)[0]));
      estat.derrotas.push({ etapa: rotulo, ...d }); console.log(`   !! DERROTA em ${rotulo}: ${JSON.stringify(d)} (tentativa ${n + 1})`);
      await relato('derrota');
      if (n >= 1 && o.treino) { const antes = (await t.batalhas()).length; try { await o.treino(); } catch (e2) { if (!/DERROTA/.test(e2.message)) throw e2; estat.derrotas.push({ etapa: rotulo + ' (treino)' }); } const depois = (await t.batalhas()).length; estat.treinoExtra.push({ etapa: rotulo, batalhas: depois - antes }); console.log(`   treino extra: ${depois - antes} batalhas`); await relato('treino'); }
    }
  }
  throw new Error('desisti de ' + rotulo + ' depois de 8 derrotas');
}
/** entre lutas no caminho: usa remédio se alguém está fraco; devolve a saúde */
const cuidar = (o) => Qr((o) => window.Q.cuidar(o), o ?? { limiar: 0.5, reanimar: false, guardar: { garrafada: 2 } });
/** equipe gasta? numa cidade passa no Posto; no caminho usa os remédios (reanima se caíram duas ou mais) */
async function recompor() {
  // o que conta é o núcleo (as 3 de maior nível): as atrasadas inteiras não podem esconder um ás no osso
  const sn = await Qr(() => window.Q.saudeNucleo(3));
  if (sn.caidas === 0 && sn.pior >= 0.55 && !sn.pgBaixo) return;
  const z = (await t.st()).zona;
  const temPosto = await Qr((z) => !!window.__pingo.mundo.zona.warps.some((w) => w.para.zona === z + '-posto'), z);
  if (temPosto) { await viajar(`${z}-posto`); await Qr(() => window.Q.curarNoPosto()); estat.postos++; await viajar(z); return; }
  await cuidar({ limiar: 0.6, reanimar: true, nucleo: 3 });
  // sem remédio e com o núcleo no osso: um jogador comum volta ao último Posto, compra remédio e retoma de onde parou
  const d2 = await Qr(() => window.Q.saudeNucleo(3));
  if (d2.caidas >= 1 || d2.pior < 0.4 || d2.pgBaixo) {
    const posto = await Qr(() => window.__pingo.jogo.save.ultimoPosto?.zona);
    if (posto && posto !== z) {
      console.log(`   (equipe gasta em ${z}: volta ao ${posto})`); estat.voltas = (estat.voltas ?? 0) + 1;
      await viajar(posto); await Qr(() => window.Q.curarNoPosto()); estat.postos++;
      const c = posto.replace(/-posto$/, '');
      await viajar(`${c}-venda`); const m = (await t.resumo()).mochila; const lista = {}; for (const [id, alvo] of Object.entries(MANT)) if ((m[id] ?? 0) < alvo) lista[id] = alvo - (m[id] ?? 0); if (Object.keys(lista).length) console.log('   compras:', JSON.stringify(await Qr((l) => window.Q.comprar(l), lista)));
      await viajar(z);
    }
  }
}
/** todos os treinadores e itens da zona atual, recompondo a equipe entre uma luta e outra */
const limpar = async (o) => {
  let n = 0;
  for (let i = 0; i < 20; i++) { await recompor(); await Qr(() => window.Q.rodizio('treino')); const k = await t.treinadores({ ...(o ?? {}), max: 1 }); if (!k) break; n += k; }
  await t.catar().catch((e) => { if (/DERROTA/.test(e.message)) throw e; console.log('   catar:', e.message); });
  await recompor();
  return n;
};
/** percorre um ginásio pelo roteiro (teclas + conferências de posição); `lider` = passo final */
async function ginasio(n) {
  const G = GINASIOS[n];
  const s = await t.st(); if (s.zona !== G.zona) throw new Error('não estou no ginásio ' + n);
  for (const p of G.passos) {
    if (p.ir) { const nb0 = (await t.st()).nb; await t.ir(p.ir); if ((await t.st()).nb > nb0) { await cuidar({ limiar: 0.5, reanimar: true, guardar: { garrafada: 3 } }); await Qr(() => window.Q.rodizio('treino')); } }
    else if (p.agir) await t.agir(p.agir);
    else if (p.cuidar) { await cuidar({ limiar: 0.7, reanimar: true }); await Qr(() => window.Q.rodizio('chefe')); }
    else if (p.em) { const q = await t.assentar(); if (q.x !== p.em[0] || q.y !== p.em[1]) { await t.foto(`gin${n}-fora`); throw new Error(`ginásio ${n}: esperava (${p.em}) em "${p.r}", estou em (${q.x},${q.y})`); } }
  }
}

const etapas = {
  async farol() {
    console.log('ajudantes:', JSON.stringify(await Qr(() => window.Q.ajudantes())));
    await cidade('A5', { garrafada: 10, 'cha-guarana': 2, cuia: 10, 'mel-puro': 2, unguento: 2 });
    await t.falarCom('rendeira-praca').catch((e) => console.log('   rendeira:', e.message));
    await tentar('farol', async () => {
      await viajar('A6'); await t.foto('a6-chegada');
      await limpar(); await cidade('A6', { garrafada: 10, 'cha-guarana': 2 });
      await limpar();
      // sobe o farol andar por andar; se a equipe gastar e o piloto voltar ao Posto, retoma do andar em que estava
      const temPlano = (x, y) => Qr(([x, y]) => window.Q.plano(x, y) !== null, [x, y]);
      const farolAte = async (alvo) => {
        for (let i = 0; i < 12; i++) {
          const s = await t.st();
          if (s.zona === alvo && (alvo !== 'A6-farol-2' || await temPlano(14, 11))) return;
          if (!/^A6-farol-/.test(s.zona)) { await viajar('A6-farol-1'); continue; }
          if (s.zona === 'A6-farol-1') { await t.irAte(14, 2); continue; }
          if (s.zona === 'A6-farol-2') { if (await temPlano(14, 11)) await t.irAte(14, 11); else await t.irZona('A6-farol-1'); continue; }
          if (s.zona === 'A6-farol-3') { if (alvo === 'A6-farol-4') await t.irAte(1, 2); else await t.irZona('A6-farol-2'); continue; }
          if (s.zona === 'A6-farol-4') { await t.irZona('A6-farol-3'); continue; }
        }
        throw new Error('não consegui chegar a ' + alvo);
      };
      const noAndar = async (alvo, fn) => { for (let i = 0; i < 6; i++) { await farolAte(alvo); await fn(); if ((await t.st()).zona === alvo) return; } throw new Error('não assentei em ' + alvo); };
      if (!(await t.flag('farol-grade'))) {
        await viajar('A6-farol-1'); await t.foto('farol-1'); await limpar();
        for (let i = 0; i < 4 && !(await t.flag('farol-grade')); i++) {
          if ((await t.st()).zona !== 'A6-farol-1') await viajar('A6-farol-1');
          await t.irAte(1, 2); await limpar(); if ((await t.st()).zona !== 'A6-farol-2') continue;
          await t.usar(1, 11);
        }
        await t.exige(await t.flag('farol-grade'), 'alavanca da grade puxada');
        await t.irAte(6, 9); await t.agir('s'); await t.ir('ss');
      }
      await noAndar('A6-farol-1', limpar);
      await noAndar('A6-farol-2', limpar); console.log('ok   2º andar pela escada leste');
      await noAndar('A6-farol-3', async () => {
        if (!(await t.flag('rival-4'))) { await t.foto('farol-3'); await cuidar({ limiar: 0.7, reanimar: true }); await Qr(() => window.Q.rodizio('chefe')); await t.falarCom('taina'); await t.exige(await t.flag('rival-4'), 'rival-4 feito'); }
        await limpar();
      });
      await farolAte('A6-farol-4'); console.log('ok   sala da lanterna');
      await cuidar({ limiar: 0.7, reanimar: true });
      if (!temSave('farol-topo')) await t.checkpoint('farol-topo');
      await t.foto('farol-4-antes'); await Qr(() => window.Q.rodizio('chefe'));
      await t.falarCom('rebite');
      if (!(await t.flag('farol-ok'))) {
        // o tenente espera: dá tempo de usar os remédios e pôr a mais forte na frente
        await t.exige(await t.flag('venceu:A6-FA-9'), 'capangas da lanterna vencidos; o tenente espera');
        await cuidar({ limiar: 0.9, reanimar: true }); await Qr(() => window.Q.rodizio('chefe'));
        await t.foto('farol-4-rebite-espera');
        await t.falarCom('rebite');
      }
      await t.exige(await t.flag('farol-ok'), 'Rebite vencido: farol-ok');
    }, { treino: async () => { await viajar('A6'); await Qr(() => window.Q.passear(6)); await cidade('A6', { garrafada: 10, 'cha-guarana': 2 }); } });
    await t.foto('farol-4-depois');
    await t.checkpoint('farol-ok');
  },
  async xarope() {
    await tentar('xarope', async () => {
      if (!(await t.flag('xarope-na-mao')) && !(await t.flag('farol-remedio'))) { await viajar('A5'); await t.falarCom('a5-boticaria'); await t.exige(await t.flag('xarope-na-mao'), 'xarope na mão'); await t.foto('a5-boticaria'); }
      if (!(await t.flag('farol-remedio'))) { await viajar('A6-farol-4'); await t.falarCom('volta-2'); await t.exige(await t.flag('farol-remedio'), 'farol-remedio'); }
      await viajar('A6');
    });
    await t.checkpoint('farol-remedio');
  },
  async gin5() {
    await tentar('gin5', async () => {
      await cidade('A6', { garrafada: 10, 'cha-guarana': 2, unguento: 3 });
      await viajar('A6-ginasio'); await t.foto('gin5-entrada');
      await ginasio(5);
      await t.exige((await t.resumo()).insignias.includes(5), 'insígnia 5');
    }, { treino: async () => { await viajar('A6'); await Qr(() => window.Q.passear(8)); } });
    await t.foto('gin5-fim'); await viajar('A6');
    await t.checkpoint('passo-5');
  },
  async gruta() {
    await Qr(() => { window.Q.capturar = (e, nv) => true; window.Q.maxCapturas = window.Q.capturadas.length + 2; });
    await tentar('gruta', async () => {
      console.log('ajudantes:', JSON.stringify(await Qr(() => window.Q.ajudantes())));
      if ((await t.st()).zona === 'A6' || /^A6-/.test((await t.st()).zona)) { await cidade('A6', MANT); await viajar('A5'); }
      await cidade('A5', MANT);
      if (!(await t.flag('visitou:A7'))) { await viajar('A-GB-1'); await t.foto('gruta-1'); await limpar(); await viajar('A-GB-2'); await t.foto('gruta-2'); await limpar(); }
      await viajar('A7'); await t.foto('a7-chegada');
      await cidade('A7', MANT); await limpar();
    }, { treino: async () => { await viajar('A-GB-1'); await Qr(() => window.Q.passear(8, { pisos: '.,"%' })).catch((e) => { if (/DERROTA/.test(e.message)) throw e; console.log('   passear:', e.message); }); } });
    await t.checkpoint('serra');
  },
  async gin6() {
    await tentar('gin6', async () => {
      await cidade('A7', MANT);
      await viajar('A7-ginasio'); await t.foto('gin6-entrada');
      await ginasio(6);
      await t.exige((await t.resumo()).insignias.includes(6), 'insígnia 6');
    }, { treino: async () => { await viajar('A7'); await Qr(() => window.Q.passear(8)); } });
    await t.foto('gin6-fim'); await viajar('A7');
    await t.checkpoint('passo-6');
  },
  async encosta() {
    await Qr(() => { window.Q.capturar = (e, nv) => true; window.Q.maxCapturas = window.Q.capturadas.length + 1; });
    await tentar('encosta', async () => {
      console.log('ajudantes:', JSON.stringify(await Qr(() => window.Q.ajudantes())));
      await cidade('A7', MANT);
      if (!(await t.flag('visitou:A8'))) { await viajar('A-R5'); await t.foto('encosta'); await limpar(); }
      await viajar('A8'); await t.foto('a8-chegada');
      await cidade('A8', MANT2); await limpar();
    }, { treino: async () => { await viajar('A-R5'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('ferrugem');
  },
  async gin7() {
    await tentar('gin7', async () => {
      await cidade('A8', MANT2);
      await viajar('A8-ginasio'); await t.foto('gin7-entrada');
      await ginasio(7);
      await t.exige((await t.resumo()).insignias.includes(7), 'insígnia 7');
    }, { treino: async () => { await viajar('A-R5'); await Qr(() => window.Q.passear(8)); } });
    await t.foto('gin7-fim'); await viajar('A8');
    await t.checkpoint('passo-7');
  },
  async buriti() {
    await Qr(() => { window.Q.capturar = (e, nv) => true; window.Q.maxCapturas = window.Q.capturadas.length + 1; });
    await tentar('buriti', async () => {
      console.log('ajudantes:', JSON.stringify(await Qr(() => window.Q.ajudantes())));
      if ((await t.st()).zona !== 'A-R7' && (await t.st()).zona !== 'A10') {
        await cidade('A8', MANT2);
        const s = await Qr(() => window.Q.irZonaForca('A-R7')); await t.exige(s.zona === 'A-R7', 'saiu de A8 pela estrada leste empurrando o pedregulho');
      }
      await t.foto('buriti-estrada'); await limpar({ forca: true });
      { const s = await Qr(() => window.Q.irZonaForca('A10')); await t.exige(s.zona === 'A10', 'chegou a Vila Buriti'); } await t.foto('a10-chegada');
      await cidade('A10', MANT2); await limpar();
    }, { treino: async () => { await viajar('A-R7'); await Qr(() => window.Q.passear(8)); } });
    await t.checkpoint('vila-buriti');
  },
  async gin8() {
    await tentar('gin8', async () => {
      await cidade('A10', MANT2);
      await viajar('A10-ginasio'); await t.foto('gin8-entrada');
      await ginasio(8);
      await t.exige((await t.resumo()).insignias.includes(8), 'insígnia 8');
    }, { treino: async () => { await viajar('A-R7'); await Qr(() => window.Q.passear(8)); } });
    await t.foto('gin8-fim'); await viajar('A10');
    await t.checkpoint('passo-8');
  },
  async plato() {
    await cidade('A10', MANT2);
    await viajar('A-LG'); await t.foto('plato-chegada');
    await limpar();
    await viajar('A-LG-posto'); await Qr(() => window.Q.curarNoPosto()); await viajar('A-LG');
    await t.checkpoint('plato');
  },
};

try {
  let i = ETAPAS.indexOf(ini);
  for (; i <= ETAPAS.indexOf(fim); i++) {
    const e = ETAPAS[i]; if (!etapas[e]) { console.log('etapa ainda não escrita:', e); break; }
    console.log(`\n######## ${e}`);
    await etapas[e]();
    await relato(e);
    console.log('   estat:', JSON.stringify(estat), 'compras:', JSON.stringify(await Qr(() => window.Q.compras)), 'itens no campo:', JSON.stringify(await Qr(() => window.Q.itensCampo)), 'capturas:', JSON.stringify(await Qr(() => window.Q.capturadas)));
  }
} catch (e) { console.log('FALHA', e.message.split('\n')[0], JSON.stringify(await t.st().catch(() => 0)), await t.falas(3).catch(() => 0)); await t.foto('erro'); await relato('falha').catch(() => 0); console.log((await Qr(() => window.Q.log.slice(-12)).catch(() => [])).join('\n')); }
await t.fim();
