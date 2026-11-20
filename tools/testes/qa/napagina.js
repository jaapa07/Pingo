// Lado de dentro do piloto do QA (carregado na página pelo Vite): só LÊ o estado do jogo e decide; quem age é o teclado.
import { M } from '/src/world/vivo.ts';
import { listaZonas, SALIENCIA } from '/src/world/zonas.ts';
import { registrarTela, telas } from '/src/ui/telas.ts';
import { criarTelaBatalha } from '/src/battle/view/tela.ts';
import { pilotoEsperto, raiz } from '/tools/equilibrio-referencia.ts';
import { golpe as defGolpe } from '/src/data/golpes.ts';
import { ITENS, item as defItem, temItemDef } from '/src/data/itens.ts';
import { especie, atributos } from '/src/battle/criatura.ts';
import { danoBase } from '/src/battle/engine.ts';
import { cond, jogo } from '/src/core/estado.ts';
import { bus } from '/src/core/events.ts';
import { eficaciaContra } from '/src/data/tabela-tipos.ts';

const Q = (window.__qa = { bt: null, mem: null, pend: [], vistos: new WeakSet(), resultados: [], oferta: null, maxEquipe: 6, querCapturar: true, enfraquecer: 0 });
const D = { n: [0, -1], s: [0, 1], l: [1, 0], o: [-1, 0] };
const CODE = { n: 'ArrowUp', s: 'ArrowDown', l: 'ArrowRight', o: 'ArrowLeft' };
const tecla = (tipo, code) => document.dispatchEvent(new KeyboardEvent(tipo, { code, key: code, bubbles: true }));
const quadro = () => new Promise((r) => requestAnimationFrame(r));

/* ------------------------------ batalha: observa o controle ------------------------------ */
registrarTela('batalha', (args) => {
  Q.bt = args; Q.mem = { ultimaTroca: -9, curas: new Map() }; Q.pend = []; Q.oferta = null; Q.enfraquecer = 0; Q.turnos = [];
  const c = args.controle;
  for (const m of ['iniciar', 'agir', 'substituir', 'responderOferta', 'aprender']) {
    const o = c[m].bind(c);
    c[m] = (...a) => { const evs = o(...a); for (const e of evs) { if (Q.vistos.has(e)) continue; Q.vistos.add(e); if (e.t === 'golpe-pendente') Q.pend.push(e); if (e.t === 'oferta-troca') Q.oferta = e; } return evs; };
  }
  return criarTelaBatalha(args);
});
bus.on('batalha-fim', (e) => {
  const s = jogo.save;
  Q.resultados.push({ turnos: Q.turnos, tipo: e.tipo, resultado: e.resultado, treinador: e.pedido?.treinador?.id ?? null, inimigos: (e.pedido?.inimigos ?? []).map((c) => c.especie + ':' + c.nivel).join(','), equipe: s.equipe.map((c) => c.especie + ':' + c.nivel).join(','), zona: s.jogador.zona, dinheiro: s.jogador.dinheiro });
});

const valorGolpe = (id, e) => { const g = defGolpe(id); if (g.cat === 'status') return 18; return (g.poder * (g.precisao || 100)) / 100 * (g.efeitos.some((x) => x.t === 'carga' || x.t === 'recarga') ? 0.6 : 1) * (e.tipos.includes(g.tipo) ? 1.5 : 1); };
const cuiasNaMochila = () => ITENS.filter((it) => it.bolso === 'cuias' && it.uso?.emBatalha && (jogo.save.mochila[it.id] ?? 0) > 0);
const listaBolso = (bolso) => ITENS.filter((it) => it.bolso === bolso && it.uso?.emBatalha && (jogo.save.mochila[it.id] ?? 0) > 0);
const BOLSOS = ['remedios', 'cuias', 'frutos'];
function comoItem(id, alvo) { const it = defItem(id), bi = BOLSOS.indexOf(it.bolso); return { tipo: 'item', item: id, alvo, bolso: bi, indice: listaBolso(it.bolso).findIndex((x) => x.id === id), cuia: !!it.uso?.cuia }; }

/** decisão do turno (menu de ações aberto) */
Q.decidir = () => {
  const r = decidir0();
  try { const c = Q.bt.controle, b = c.b, p = c.pedidosJogador()[0], eu = p && b.criatura(p), q = p && b.adversarios(p)[0], ele = q && b.criatura(q);
    if (eu) Q.turnos.push(`${especie(eu.especie).nome}${eu.nivel} ${eu.vida}/${atributos(eu).vida} x ${ele ? especie(ele.especie).nome + ele.nivel + ' ' + ele.vida + '/' + atributos(ele).vida : '-'} → ${r.tipo}${r.tipo === 'golpe' ? ' ' + eu.golpes[r.slot]?.id : r.tipo === 'item' ? ' ' + r.item : r.tipo === 'troca' ? ' ' + r.para : ''}`); } catch (e) { /* só registro */ }
  return r;
};
const decidir0 = () => {
  const c = Q.bt.controle, b = c.b, ped = Q.bt.pedido, p = c.pedidosJogador()[0], s = jogo.save;
  if (!p) return { tipo: 'nada' };
  const eu = b.criatura(p), q = b.adversarios(p)[0], ele = q && b.criatura(q);
  if (ele && ped.tipo !== 'treinador' && b.podeCapturar() && !ped.semCaptura) {
    const cuias = cuiasNaMochila(), linha = raiz(ele.especie);
    const jaTem = s.diario.capturado.some((n) => raiz(n) === linha);
    const quer = ped.tutorial || (Q.querCapturar && !jaTem && s.equipe.length < Q.maxEquipe && (!Q.tipoQuer || especie(ele.especie).tipos.includes(Q.tipoQuer)));
    if (cuias.length && quer) {
      const frac = ele.vida / atributos(ele).vida;
      if (frac <= 0.5 || (!ped.tutorial && Q.enfraquecer >= 4)) return comoItem(cuias[0].id);
      // enfraquecer sem derrubar: o golpe de dano mais fraco que não nocauteia
      const a = atributos(eu), d = atributos(ele), te = especie(ele.especie).tipos, tm = especie(eu.especie).tipos;
      const ops = eu.golpes.map((g, i) => ({ i, g, def: defGolpe(g.id) })).filter((x) => x.g.pg > 0 && x.def.cat !== 'status').map((x) => {
        const fis = x.def.cat === 'fisico', ef = eficaciaContra(x.def.tipo, te);
        return { i: x.i, dano: ef === 0 ? 0 : danoBase(eu.nivel, x.def.poder, fis ? a.atq : a.atqEsp, fis ? d.def : d.defEsp) * ef * (tm.includes(x.def.tipo) ? 1.5 : 1) };
      }).filter((x) => x.dano > 0).sort((x, y) => x.dano - y.dano);
      const seguro = ops.filter((x) => x.dano * 1.6 < ele.vida).pop() ?? null;
      Q.enfraquecer++;
      if (seguro) return { tipo: 'golpe', slot: seguro.i };
      if (!ped.tutorial) return comoItem(cuias[0].id);
      if (ops.length) return { tipo: 'golpe', slot: ops[0].i };
    }
  }
  // selvagem que não interessa, com a criatura em campo machucada: um jogador prudente foge
  if (ele && ped.tipo === 'selvagem' && b.podeFugir() && eu.vida / atributos(eu).vida < 0.4 && ele.nivel >= eu.nivel - 3) return { tipo: 'fuga' };
  // contra treinador, o jogador esperto bebe o remédio quando a criatura fica abaixo da metade (até 3 por criatura)
  if (ele && ped.tipo === 'treinador' && eu.vida > 0 && eu.vida < atributos(eu).vida * 0.5) {
    const n = Q.mem.curas.get(eu.uid) ?? 0, rem = ['garrafada', 'cha-cidreira'].find((id) => (s.mochila[id] ?? 0) > 0);
    if (rem && n < 3) { Q.mem.curas.set(eu.uid, n + 1); return comoItem(rem, b.lados[0].ativos[p.pos]); }
  }
  const a = pilotoEsperto.acao(b, p, Q.mem);
  if (a.tipo === 'item') return comoItem(a.item, a.alvo);
  return a;
};
Q.substituto = () => pilotoEsperto.substituto(Q.bt.controle.b, Q.mem);
Q.responderOferta = () => {
  const b = Q.bt.controle.b, prox = Q.oferta;
  const idx = prox ? b.lados[1].equipe.findIndex((c) => c.uid === prox.proxima.uid) : -1;
  return idx >= 0 ? pilotoEsperto.oferta(b, idx, Q.mem) : null;
};
/** golpe novo com quatro já aprendidos: troca o pior se o novo for melhor; devolve o slot a esquecer ou −1 */
Q.aprender = () => {
  const e = Q.pend.shift(); if (!e) return -1;
  const c = jogo.save.equipe.find((x) => x.uid === e.uid); if (!c) return -1;
  const esp = especie(c.especie), novo = defGolpe(e.golpe);
  const nStatus = c.golpes.filter((g) => defGolpe(g.id).cat === 'status').length;
  const vals = c.golpes.map((g, i) => ({ i, v: valorGolpe(g.id, esp) * (defGolpe(g.id).cat === 'status' && nStatus > 1 ? 0.5 : 1) })).sort((x, y) => x.v - y.v);
  const vNovo = novo.cat === 'status' ? (nStatus >= 1 ? 5 : 18) : valorGolpe(e.golpe, esp);
  // não fica sem golpe do próprio tipo nem com dois de dano iguais de tipo
  return vNovo > vals[0].v ? vals[0].i : -1;
};

/* ------------------------------ retrato do estado ------------------------------ */
Q.snap = () => {
  const p = window.__pingo, topo = telas.topo, j = M.jog, s = jogo.save;
  const r = { pronto: M.pronto && !M.carregando, oc: M.ocupado > 0, mov: !!j?.movendo, zona: M.zv?.def.id, x: j?.x, y: j?.y, dir: j?.dir, modo: s.jogador.modo, telas: telas.pilha.length, topo: topo?.el.className ?? '', ocupada: telas.ocupada, nres: Q.resultados.length };
  if (topo && 'fase' in topo && topo.caixa) r.dlg = { fase: topo.fase, opcoes: topo.lista ? topo.lista.itens.map((i) => i.rotulo) : null, indice: topo.lista?.indice ?? 0, texto: topo.atual };
  if (topo?.el.classList.contains('batalha')) {
    const el = topo.el, c = Q.bt?.controle, tem = (sel) => !!el.querySelector(sel);
    const cels = [...el.querySelectorAll('.bt-golpes .bt-golpe')], cart = [...el.querySelectorAll('.bt-equipe .bt-cartao')];
    const abas = [...el.querySelectorAll('.bt-mochila [class*="mol-botao"]')].slice(0, 3);
    r.bat = {
      fase: c?.fase, terminou: c?.terminou, menu: tem('.bt-menu'), golpes: cels.length > 0, focoGolpe: cels.findIndex((x) => x.classList.contains('foco')),
      equipe: cart.length > 0, focoEquipe: cart.findIndex((x) => x.classList.contains('foco')), nEquipe: cart.length,
      mochila: tem('.bt-mochila'), aba: abas.findIndex((x) => /mol-botao-foco/.test(x.className)), esquecer: tem('.bt-esquecer'),
      lista: !!el.querySelector('.bt-hud > .lista') && !tem('.bt-mochila') && !tem('.bt-esquecer'), pend: Q.pend.length,
    };
  }
  return r;
};
Q.resumo = () => { const s = jogo.save; return { zona: s.jogador.zona, x: M.jog?.x, y: M.jog?.y, dinheiro: s.jogador.dinheiro, insignias: s.insignias, amuletos: s.amuletos, equipe: s.equipe.map((c) => ({ e: c.especie, nome: c.apelido || especie(c.especie).nome, nv: c.nivel, vida: c.vida, max: atributos(c).vida, st: c.status, golpes: c.golpes.map((g) => g.id + ' ' + g.pg) })), mochila: s.mochila, tempo: Math.round(s.tempoJogo), posto: s.ultimoPosto?.zona, capturado: s.diario.capturado.length }; };
Q.saude = () => {
  const eq = jogo.save.equipe.filter((c) => !c.ovo); if (!eq.length) return { ok: true, frac: 1, caidos: 0 };
  const fr = eq.map((c) => c.vida / atributos(c).vida), caidos = fr.filter((f) => f <= 0).length, media = fr.reduce((a, x) => a + x, 0) / fr.length;
  const lider = eq.reduce((a, c) => (c.nivel > a.nivel ? c : a)), fl = lider.vida / atributos(lider).vida;
  const semPg = lider.golpes.filter((g) => defGolpe(g.id).cat !== 'status').every((g) => g.pg <= 2);
  return { frac: media, caidos, lider: fl, liderCaido: lider.vida <= 0, semPg, n: eq.length };
};

/* ------------------------------ caminho dentro da zona ------------------------------ */
function busca(alvoFn, o = {}) {
  const z = M.zv, am = jogo.save.amuletos, j = M.jog;
  const ocup = new Set([...M.npcs.filter((n) => n.ator.visivel).map((n) => n.ator.x + ',' + n.ator.y), ...M.guardas.map((g) => g.ator.x + ',' + g.ator.y)]);
  const item = (x, y) => (z.def.itens ?? []).some((i) => i.x === x && i.y === y && !i.oculto && !jogo.save.flags[i.flag]);
  const evitar = o.evitar ?? (() => false);
  const k0 = j.x + ',' + j.y, ant = new Map([[k0, null]]), fila = [[j.x, j.y, jogo.save.jogador.modo === 'remo']];
  if (alvoFn(j.x, j.y)) return { passos: [], fim: [j.x, j.y] };
  let fim = null;
  while (fila.length && !fim) {
    const [x, y, naAgua] = fila.shift();
    for (const d of 'nslo') {
      let nx = x + D[d][0], ny = y + D[d][1], passo = null, agua = false;
      if (!z.dentro(nx, ny)) continue;
      const ch = z.ch(nx, ny), w = z.warp(nx, ny);
      if (ocup.has(nx + ',' + ny) || z.portao(nx, ny) || item(nx, ny) || evitar(nx, ny)) continue;
      const destino = alvoFn(nx, ny);
      if (w && !destino) continue;
      if (w && !cond(w.requer)) continue;
      if (z.agua(nx, ny)) { if (ch === 'w') continue; passo = naAgua ? d : am.includes('remo') ? 'A' + d : null; agua = true; }
      else if (SALIENCIA[ch]) {
        if (naAgua || SALIENCIA[ch] !== d) continue;
        const lx = nx + D[d][0], ly = ny + D[d][1];
        if (!z.chao(lx, ly) || ocup.has(lx + ',' + ly) || item(lx, ly) || z.warp(lx, ly)) continue;
        nx = lx; ny = ly; passo = d;
      }
      else if (z.chao(nx, ny) || (destino && w && w.tipo && w.tipo !== 'borda' && w.tipo !== 'buraco')) passo = d;
      else if (!naAgua && ((ch === 'c' && am.includes('facao')) || (ch === 'r' && am.includes('quebra-pedra')))) passo = 'A' + d;
      if (!passo) continue;
      const k = nx + ',' + ny; if (ant.has(k)) continue;
      ant.set(k, [x + ',' + y, passo]);
      if (alvoFn(nx, ny)) { fim = k; break; }
      fila.push([nx, ny, agua]);
    }
  }
  if (!fim) return null;
  const passos = []; for (let k = fim; ant.get(k); k = ant.get(k)[0]) passos.unshift(ant.get(k)[1]);
  return { passos, fim: fim.split(',').map(Number) };
}
Q.plano = (tx, ty, vizinho) => busca((x, y) => (vizinho ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty))?.passos ?? null;

/** anda uma sequência de passos simples pelo teclado, correndo (B) quando `correr`; para em qualquer surpresa */
Q.andar = async (passos, correr = true) => {
  const z0 = M.zv.def.id;
  const livre = () => M.pronto && !M.carregando && M.ocupado === 0 && telas.pilha.length === 1 && !telas.ocupada;
  if (correr) tecla('keydown', 'ShiftLeft');
  let feitos = 0, motivo = 'fim';
  try {
    for (const d of passos) {
      if (d.length !== 1) { motivo = 'acao'; break; }
      if (!livre()) { motivo = 'ocupado'; break; }
      const j = M.jog, x0 = j.x, y0 = j.y, t0 = performance.now();
      tecla('keydown', CODE[d]);
      while (!(j.movendo || j.x !== x0 || j.y !== y0 || !livre() || performance.now() - t0 > 2500)) await quadro();
      tecla('keyup', CODE[d]);
      const t1 = performance.now();
      while (M.jog === j && j.movendo && performance.now() - t1 < 20000) await quadro();
      await quadro();
      if (M.zv.def.id !== z0 || M.jog !== j) { motivo = 'zona'; feitos++; break; }
      if (j.x === x0 && j.y === y0) { motivo = livre() ? 'tranco' : 'ocupado'; break; }
      feitos++;
      if (!livre()) { motivo = 'ocupado'; break; }
    }
  } finally { if (correr) tecla('keyup', 'ShiftLeft'); }
  return { feitos, motivo, x: M.jog.x, y: M.jog.y, zona: M.zv.def.id };
};

/* ------------------------------ viagem entre zonas ------------------------------ */
const viaja = (w) => w.tipo !== 'trem' && w.tipo !== 'saveiro' && w.tipo !== 'buraco';
/** warp alcançável da zona atual que mais aproxima de `destino` (pelo grafo de zonas com os portões de agora) */
Q.proximoWarp = (destino, proibidas = []) => {
  const dist = new Map([[destino, 0]]), fila = [destino], zs = listaZonas();
  const entra = new Map();
  for (const z of zs) for (const w of z.warps) { if (!viaja(w) || !cond(w.requer)) continue; if (!entra.has(w.para.zona)) entra.set(w.para.zona, new Set()); entra.get(w.para.zona).add(z.id); }
  while (fila.length) { const a = fila.shift(); for (const de of entra.get(a) ?? []) if (!dist.has(de) && !proibidas.includes(de)) { dist.set(de, dist.get(a) + 1); fila.push(de); } }
  const z = M.zv;
  if (!dist.has(z.def.id)) return { erro: 'sem rota no grafo de ' + z.def.id + ' para ' + destino };
  const cands = z.def.warps.filter((w) => viaja(w) && cond(w.requer) && dist.has(w.para.zona) && dist.get(w.para.zona) < dist.get(z.def.id)).map((w) => {
    const r = busca((x, y) => x === w.x && y === w.y); return r ? { x: w.x, y: w.y, para: w.para.zona, d: dist.get(w.para.zona), n: r.passos.length, tipo: w.tipo ?? 'borda' } : null;
  }).filter(Boolean).sort((a, b) => a.d - b.d || a.n - b.n);
  if (cands.length) return cands[0];
  // nada que aproxime é alcançável: tenta qualquer warp alcançável que ainda tenha rota
  const outros = z.def.warps.filter((w) => viaja(w) && cond(w.requer) && dist.has(w.para.zona)).map((w) => { const r = busca((x, y) => x === w.x && y === w.y); return r ? { x: w.x, y: w.y, para: w.para.zona, d: dist.get(w.para.zona), n: r.passos.length, tipo: w.tipo ?? 'borda', desvio: true } : null; }).filter(Boolean).sort((a, b) => a.d - b.d || a.n - b.n);
  return outros[0] ?? { erro: 'nenhum warp alcançável em ' + z.def.id + ' rumo a ' + destino };
};

/* ------------------------------ o que há na zona ------------------------------ */
const venceu = (t) => !!jogo.save.flags[t.flag ?? 'venceu:' + t.id];
Q.treinadores = (todos) => M.npcs.filter((n) => n.treinador && n.ator.visivel && !venceu(n.treinador)).map((n) => { if (todos) return { id: n.id }; const r = busca((x, y) => Math.abs(x - n.ator.x) + Math.abs(y - n.ator.y) === 1); return r ? { id: n.id, t: n.treinador.id, x: n.ator.x, y: n.ator.y, n: r.passos.length, nv: Math.max(...n.treinador.equipe.map((m) => m.nv)), lider: n.treinador.insignia !== undefined } : null; }).filter(Boolean).sort((a, b) => a.n - b.n);
Q.itens = () => (M.zv.def.itens ?? []).filter((i) => !i.oculto && !jogo.save.flags[i.flag]).map((i) => { const r = busca((x, y) => Math.abs(x - i.x) + Math.abs(y - i.y) === 1); return r ? { x: i.x, y: i.y, item: i.item, n: r.passos.length } : null; }).filter(Boolean).sort((a, b) => a.n - b.n);
Q.npc = (id) => { const n = M.npcs.find((x) => x.id === id && x.ator.visivel); return n ? { x: n.ator.x, y: n.ator.y, dir: n.ator.dir } : null; };
Q.npcPor = (campo, valor) => { const n = M.npcs.find((x) => x.ator.visivel && (valor === undefined ? x.def[campo] : x.def[campo] === valor)); return n ? { id: n.id, x: n.ator.x, y: n.ator.y } : null; };
/** tiles de grama alta (ou chão de caverna com encontros) alcançáveis, do mais perto ao mais longe */
Q.grama = () => { const z = M.zv, r = []; for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) if (z.ch(x, y) === '"' && z.chao(x, y)) r.push([x, y]); return r; };
Q.tabelaLoja = (ids) => ids.filter(temItemDef).map((id) => ({ id, preco: defItem(id).preco }));
Q.pronto = true;
