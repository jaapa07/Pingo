// PILOTO do QA 4 (mapa B trecho 1; cópia adaptada de tools/testes/qa2/piloto-pagina.js) — roda DENTRO da página (injetado por lib.mjs). Joga pelo teclado: cada decisão vira eventos de tecla
// (KeyboardEvent em document, como o teclado físico) e o estado é lido do mapa vivo e do DOM dos menus.
// Batalha: política "esperta" de tools/equilibrio-referencia.ts (a mesma do simulador), executada pelos menus.
(async () => {
  const P = window.__pingo;
  const [V, REF, TEL, TB, CR, GO, IT, ZN, ES] = await Promise.all([
    import('/src/world/vivo.ts'), import('/tools/equilibrio-referencia.ts'), import('/src/ui/telas.ts'), import('/src/battle/view/tela.ts'),
    import('/src/battle/criatura.ts'), import('/src/data/golpes.ts'), import('/src/data/itens.ts'), import('/src/world/zonas.ts'), import('/src/core/estado.ts'),
  ]);
  const M = V.M, jogo = P.jogo;
  const DLG = await import('/src/ui/dialogo.ts');
  const Q = (window.Q = { log: [], batalhas: [], capturar: null, maxCapturas: 0, capturadas: [], semItensSelvagem: true, falhas: [], regrasEscolha: [], abortar: false, derrotas: [], derrotaPendente: false, curasPosto: 0, compras: {}, itensCampo: {} });
  const anota = (...a) => { Q.log.push(a.join(' ')); if (Q.log.length > 4000) Q.log.shift(); };

  // texto atual das caixas (fonte bitmap não se lê do DOM): anota o que cada CaixaTexto recebe
  { const def = DLG.CaixaTexto.prototype.definir; DLG.CaixaTexto.prototype.definir = function (str, ...r) { Q.ultimoTexto = String(str); return def.call(this, str, ...r); }; }

  /* ------------------------------ tempo e teclas ------------------------------ */
  const quadro = () => new Promise((r) => requestAnimationFrame(r));
  const quadros = async (n) => { for (let i = 0; i < n; i++) await quadro(); };
  const CODE = { n: 'ArrowUp', s: 'ArrowDown', l: 'ArrowRight', o: 'ArrowLeft', cima: 'ArrowUp', baixo: 'ArrowDown', dir: 'ArrowRight', esq: 'ArrowLeft', a: 'KeyZ', b: 'KeyX', menu: 'Escape' };
  const ev = (tipo, code) => document.dispatchEvent(new KeyboardEvent(tipo, { code, key: code, bubbles: true }));
  const toque = async (k) => { const c = CODE[k] ?? k; ev('keydown', c); await quadro(); ev('keyup', c); await quadro(); };
  Q.toque = toque; Q.quadros = quadros;

  /* ------------------------------ batalha: gancho no controle ------------------------------ */
  let ctl = null, mem = null, plano = null, pendentes = [], turnoDoPlano = -1, parado = 0, infoBat = null;
  TEL.registrarTela('batalha', (args) => {
    ctl = args.controle; mem = { ultimaTroca: -9, curas: new Map() }; plano = null; pendentes = []; turnoDoPlano = -1; parado = 0;
    const pega = (evs) => { for (const e of evs) if (e.t === 'golpe-pendente') pendentes.push({ uid: e.uid, golpe: e.golpe, fase: 0 }); return evs; };
    for (const k of ['iniciar', 'agir', 'substituir', 'responderOferta']) { const f = ctl[k].bind(ctl); ctl[k] = (...a) => pega(f(...a)); }
    const ap = ctl.aprender.bind(ctl); ctl.aprender = (uid, g, slot) => { pendentes = pendentes.filter((p) => !(p.uid === uid && p.golpe === g)); return pega(ap(uid, g, slot)); };
    const t = args.pedido.treinador;
    infoBat = { tipo: args.pedido.tipo, id: t?.id ?? null, zona: M.zv?.def.id, inimigos: args.pedido.inimigos.map((c) => `${c.especie}:${c.nivel}`).join(','), antes: jogo.save.equipe.map((c) => `${c.especie}:${c.nivel}:${c.vida}`).join(','), itensAntes: { ...jogo.save.mochila }, itensIA: 0 };
    return TB.criarTelaBatalha(args);
  });
  P.bus.on('batalha-fim', (e) => {
    if (!infoBat) return;
    const b = ctl?.b;
    const usados = {}; for (const [k, v] of Object.entries(infoBat.itensAntes)) { const d = v - (jogo.save.mochila[k] ?? 0); if (d > 0) usados[k] = d; }
    const iaUsou = b ? b.eventos.filter((x) => x.t === 'item' && b.lados[1].equipe.some((c) => c.uid === x.uid)).length : 0;
    Q.batalhas.push({ ...infoBat, itensAntes: undefined, resultado: e.resultado, turnos: b?.turno ?? 0, depois: jogo.save.equipe.map((c) => `${c.especie}:${c.nivel}:${c.vida}`).join(','), usados, iaUsou, iaTinhaItens: b ? Object.keys(ctl.opcoesIA?.usaItens ? (ctl.pedido.treinador?.itens ?? []) : []).length : 0 });
    if (e.resultado === 'captura' && e.capturada) Q.capturadas.push(e.capturada.especie);
    if (e.resultado === 'derrota') { Q.derrotas.push({ id: infoBat.id, tipo: infoBat.tipo, zona: infoBat.zona, semDerrota: !!e.pedido?.semDerrota }); if (!e.pedido?.semDerrota) Q.derrotaPendente = true; }
    infoBat = null;
  });

  /* ------------------------------ leitura dos menus da batalha ------------------------------ */
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const focoLista = (raiz) => { const ls = $$('.lista-item', raiz); return { n: ls.length, i: ls.findIndex((l) => l.classList.contains('foco')) }; };
  const passoGrade = (cur, tgt) => { if (cur === tgt) return null; const rc = cur >> 1, rt = tgt >> 1; if (rc !== rt) return cur % 2 === 1 ? 'esq' : rc < rt ? 'baixo' : 'cima'; return cur < tgt ? 'dir' : 'esq'; };
  const BOLSOS = ['remedios', 'cuias', 'frutos'];
  const itensDoBolso = (b) => IT.ITENS.filter((it) => it.bolso === b && it.uso?.emBatalha && (jogo.save.mochila[it.id] ?? 0) > 0);
  const vidaMax = (c) => CR.atributos(c).vida;
  const P0 = { lado: 0, pos: 0 };

  /** golpe de dano mais fraco que não derruba (para cansar a criatura que se quer capturar) */
  function golpeBrando(b, p) {
    const c = b.criatura(p), q = b.adversarios(p)[0], ini = b.criatura(q);
    let melhor = null;
    for (const [i, s] of c.golpes.entries()) {
      if (s.pg <= 0) continue; const g = GO.golpe(s.id); if (g.cat === 'status' || !g.poder) continue;
      if (!melhor || g.poder < melhor.poder) melhor = { i, poder: g.poder };
    }
    return melhor?.i ?? -1;
  }
  function cuiaBoa(b) {
    const m = jogo.save.mochila, z = M.zv.def, noite = P.mundo.relogio.periodo() === 'noite' || z.tipo === 'caverna';
    const ordem = [b.turno <= 0 && m['cuia-rapida'] ? 'cuia-rapida' : null, noite && m['cuia-noturna'] ? 'cuia-noturna' : null, 'cuia-rede', 'cuia', 'cuia-trancada', 'cuia-noturna', 'cuia-rapida', 'cuia-mel', 'cuia-ouro'];
    return ordem.find((id) => id && (m[id] ?? 0) > 0 && IT.temItemDef(id)) ?? null;
  }
  function decidir() {
    const b = ctl.b, p = ctl.pedidosJogador()[0];
    if (!p) return null;
    const selvagem = ctl.pedido.tipo !== 'treinador';
    const alvo = b.adversarios(p)[0] && b.criatura(b.adversarios(p)[0]);
    // captura: espécie desejada, ainda há vaga na cota e cuia na mochila
    if (ctl.pedido.tipo === 'lendario' && alvo) anota('lendário: ' + JSON.stringify({ esp: alvo.especie, pode: b.podeCapturar(), quer: !!Q.capturar, n: Q.capturadas.length, max: Q.maxCapturas, ja: jogo.save.diario.capturado.includes(alvo.especie), cuia: cuiaBoa(b) }));
    if (selvagem && alvo && b.podeCapturar() && Q.capturar && Q.capturadas.length < Q.maxCapturas && Q.capturar(alvo.especie, alvo.nivel) && !jogo.save.diario.capturado.includes(alvo.especie)) {
      // jogador comum desiste de capturar depois de ~6 cuias ou com a equipe pela metade (QA 4)
      const cuia = (mem.lancou ?? 0) < 6 && Q.saude().frac >= 0.5 ? cuiaBoa(b) : null;
      if (cuia) {
        const frac = alvo.vida / vidaMax(alvo);
        if (frac <= 0.4 || (b.turno <= 0 && cuia === 'cuia-rapida')) { mem.lancou = (mem.lancou ?? 0) + 1; return { tipo: 'item', item: cuia }; }
        const i = golpeBrando(b, p);
        // só bate se o golpe brando não derruba (estimativa pela conta do piloto: usa o dano do melhor golpe como teto)
        const eu = b.criatura(p);
        if (i >= 0 && alvo.nivel + 6 >= eu.nivel) return { tipo: 'golpe', slot: i };
        mem.lancou = (mem.lancou ?? 0) + 1; return { tipo: 'item', item: cuia };
      }
    }
    // selvagem que não interessa, com a equipe gasta: um jogador comum foge
    if (selvagem && alvo && b.podeFugir()) {
      const eu = b.criatura(p), sd = Q.saude();
      if (eu.vida / vidaMax(eu) < 0.3 || sd.frac < 0.45 || (alvo.nivel >= eu.nivel + 4 && sd.frac < 0.7)) return { tipo: 'fuga' };
    }
    let a = REF.pilotoEsperto.acao(b, p, mem);
    if (selvagem && Q.semItensSelvagem && a.tipo === 'item') { const ok = b.golpesValidos(p); a = { tipo: 'golpe', slot: ok[0] ?? -1 }; }
    return a;
  }
  /** quer aprender o golpe novo? devolve o slot a esquecer (ou -1): fica com os 4 que um jogador comum escolheria */
  function slotParaEsquecer(uid, novo) {
    const c = jogo.save.equipe.find((x) => x.uid === uid); if (!c) return -1;
    const ideal = REF.golpesDeJogador(c.especie, c.nivel);
    const atuais = c.golpes.map((g) => g.id);
    // o golpe novo pode não estar na lista "por nível" (evolução): avalia pelo valor
    const val = (id) => { const g = GO.golpe(id); if (g.cat === 'status') return 0; const stab = CR.especie(c.especie).tipos.includes(g.tipo) ? 1.5 : 1; return g.poder * (g.precisao || 100) / 100 * stab * (g.efeitos.some((e) => e.t === 'carga' || e.t === 'recarga') ? 0.6 : 1); };
    if (GO.golpe(novo).cat === 'status') return -1;
    if (!ideal.includes(novo) && val(novo) <= Math.min(...atuais.filter((id) => GO.golpe(id).cat !== 'status').map(val), 1e9)) return -1;
    // esquece: primeiro um status sobrando (mantém no máximo 1), senão o golpe de dano de menor valor
    const status = atuais.map((id, i) => ({ id, i })).filter((x) => GO.golpe(x.id).cat === 'status');
    if (status.length >= 2) return status[0].i;
    const dano = atuais.map((id, i) => ({ id, i, v: val(id) })).filter((x) => GO.golpe(x.id).cat !== 'status').sort((x, y) => x.v - y.v);
    if (dano.length && dano[0].v < val(novo)) return dano[0].i;
    return -1;
  }

  /** um passo da condução da batalha (no máximo um toque de tecla) */
  async function passoBatalha() {
    const raiz = $('.tela.batalha'); if (!raiz || !ctl) { await quadro(); return; }
    const b = ctl.b;
    const mEsq = $('.bt-esquecer', raiz), mEq = $('.bt-equipe', raiz), mMo = $('.bt-mochila', raiz), mGo = $('.bt-golpes', raiz), mAc = $('.bt-menu', raiz);
    const lista = !mEsq && !mMo ? $('.bt-hud > .lista, .tela.batalha > .lista', raiz) ?? $$('.lista', raiz).find((l) => !l.closest('.bt-mochila') && !l.closest('.bt-esquecer')) : null;
    if (++parado > 900) { anota('batalha parada: B'); parado = 0; plano = null; await toque('b'); return; }
    if (mEsq) {
      const pd = pendentes[0], f = focoLista(mEsq);
      if (!pd || pd.slot == null || pd.slot < 0) { await toque('b'); return; }
      if (f.i === pd.slot) { await toque('a'); return; }
      await toque(f.i < pd.slot ? 'baixo' : 'cima'); return;
    }
    if (mEq) {
      let alvo;
      if (ctl.fase === 'substituir') { if (plano?.subst == null) plano = { subst: REF.pilotoEsperto.substituto(b, mem) }; alvo = plano.subst; }
      else alvo = plano?.alvo ?? plano?.para;
      if (alvo == null || alvo < 0) { await toque('b'); plano = null; return; }
      const cs = $$('.bt-cartao', mEq), cur = cs.findIndex((c) => c.classList.contains('foco'));
      const t = passoGrade(cur, alvo);
      if (!t) { await toque('a'); await quadros(2); return; }
      await toque(t); return;
    }
    if (mMo) {
      if (!plano || plano.tipo !== 'item') { await toque('b'); return; }
      const def = IT.item(plano.item), bi = BOLSOS.indexOf(def.bolso);
      const abas = $$('.abas > div', mMo), cur = abas.findIndex((x) => /mol-botao-foco/.test(x.className));
      if (cur !== bi) { await toque(cur < bi ? 'dir' : 'esq'); return; }
      const its = itensDoBolso(def.bolso), alvo = its.findIndex((x) => x.id === plano.item), f = focoLista(mMo);
      if (alvo < 0) { anota('item sumiu da mochila', plano.item); plano = null; await toque('b'); return; }
      if (f.i === alvo) { await toque('a'); await quadros(2); return; }
      await toque(f.i < alvo ? 'baixo' : 'cima'); return;
    }
    if (mGo) {
      if (!plano || plano.tipo !== 'golpe') { await toque('b'); return; }
      const cs = $$('.bt-golpe', mGo), cur = cs.findIndex((c) => c.classList.contains('foco'));
      const t = passoGrade(cur, plano.slot);
      if (!t) { await toque('a'); await quadros(2); return; }
      await toque(t); return;
    }
    if (mAc) {
      if (ctl.fase !== 'acoes') { await quadro(); return; }
      if (turnoDoPlano !== b.turno || !plano) { plano = decidir(); turnoDoPlano = b.turno; parado = 0; if (!plano) { await quadro(); return; } }
      const alvo = plano.tipo === 'golpe' ? 0 : plano.tipo === 'item' ? 1 : plano.tipo === 'troca' ? 2 : 3;
      const cur = $('.bt-lutar', mAc).classList.contains('foco') ? 0 : 1 + $$('.bt-botao', mAc).findIndex((x) => /mol-botao-foco/.test(x.className));
      if (cur === alvo) { await toque('a'); await quadros(2); return; }
      if (alvo === 0) { await toque('esq'); return; }
      if (cur === 0) { await toque('dir'); return; }
      await toque(cur < alvo ? 'baixo' : 'cima'); return;
    }
    if (lista) {
      // sim/não da batalha: oferta de troca, golpe pendente ou apelido da capturada (decide pelo texto da caixa)
      const f = focoLista(lista), txt = Q.ultimoTexto ?? '';
      let quer = 1; // 0 = Sim, 1 = Não
      if (/trocar de criatura/.test(txt)) {
        if (!plano || plano.oferta === undefined) {
          const prox = b.eventos.slice().reverse().find((e) => e.t === 'oferta-troca');
          const idx = prox ? b.lados[1].equipe.findIndex((c) => c.uid === prox.proxima.uid) : -1;
          const para = idx >= 0 && ctl.fase === 'oferta' ? REF.pilotoEsperto.oferta(b, idx, mem) : null;
          plano = { oferta: para, para: para ?? undefined };
        }
        quer = plano.oferta == null ? 1 : 0;
      } else if (/^Esquecer um golpe/.test(txt)) {
        const pd = pendentes[0];
        if (pd && pd.slot === undefined) pd.slot = slotParaEsquecer(pd.uid, pd.golpe);
        quer = pd && pd.slot >= 0 ? 0 : 1;
      } else if (/^Desistir de aprender/.test(txt)) quer = 0;
      else if (/apelido/.test(txt)) quer = 1;
      if (f.i === quer) { await toque('a'); await quadros(3); return; }
      await toque(f.i < quer ? 'baixo' : 'cima'); return;
    }
    await toque('a');
  }

  /* ------------------------------ estado geral ------------------------------ */
  Q.st = () => { const m = P.mundo; const topo = P.telas.topo?.el.className ?? ''; return { x: m.jogador.x, y: m.jogador.y, dir: m.jogador.dir, modo: m.jogador.modo, mov: m.jogador.movendo, oc: m.ocupado, pronto: m.pronto, zona: m.zona?.id, telas: P.telas.pilha.length, topo, nb: Q.batalhas.length }; };
  const ultimaPergunta = () => { const f = P.mundo.falas; for (let i = f.length - 1; i >= 0 && i >= f.length - 3; i--) if (f[i].t === 'escolher') return f[i].texto; return ''; };
  /** índice da opção para uma pergunta do mapa (padrão: a primeira = "Sim") */
  function escolhaPara(pergunta) {
    for (const [re, i] of Q.regrasEscolha) if (re.test(pergunta)) return i;
    if (/apelido/i.test(pergunta)) return 1;
    return 0;
  }
  const rodaFeitos = new WeakMap(); Q.rodaErrar = 0;
  /** espera o jogo ficar livre no mapa, conduzindo batalhas e diálogos pelo teclado */
  Q.assentar = async (max = 200000) => {
    let livres = 0, n = 0;
    while (n++ < max) {
      if (Q.abortar) throw new Error('abortado');
      const s = Q.st();
      if (/batalha/.test(s.topo)) { livres = 0; await passoBatalha(); continue; }
      if (/evolucao/.test(s.topo)) { livres = 0; await toque('a'); continue; }
      if (/dialogo/.test(s.topo)) {
        livres = 0;
        const l = $('.tela.dialogo .lista');
        if (l) { const f = focoLista(l), quer = Math.min(f.n - 1, escolhaPara(ultimaPergunta())); if (f.i === quer) { await toque('a'); await quadros(2); } else await toque(f.i < quer ? 'baixo' : 'cima'); continue; }
        await toque('a'); continue;
      }
      if (/creditos|cinematica|confirmacao/.test(s.topo)) { livres = 0; await toque('a'); await quadros(2); continue; }
      if (/tela-loja|tela-menu|tela-mochila|tela-equipe|janela-qtd/.test(s.topo)) { livres = 0; if (Q.telaEsperada && Q.telaEsperada.test(s.topo)) return s; await toque('b'); await quadros(2); continue; }
      if (/nome/.test(s.topo)) { livres = 0; ev('keydown', 'Enter'); await quadro(); ev('keyup', 'Enter'); await quadros(3); continue; }
      // roda de capoeira do ginásio 12: devolve a seta chamada, na batida (o jogador vê a seta da chamada)
      { const mk = document.querySelector('[data-roda-fase]');
        if (mk) { livres = 0; const d = mk.dataset; if (!rodaFeitos.has(mk)) rodaFeitos.set(mk, new Set()); const fz = rodaFeitos.get(mk);
          if (d.rodaFase === 'resposta' && d.rodaJanela === '1' && d.rodaSeta && !fz.has(d.rodaAlvo)) { fz.add(d.rodaAlvo); let seta = d.rodaSeta; if (Q.rodaErrar > 0) { Q.rodaErrar--; seta = { n: 's', s: 'n', l: 'o', o: 'l' }[seta]; } await toque(seta); } else await quadro();
          continue; } }
      if (!s.pronto || s.oc || s.telas > 1) { livres = 0; await quadro(); continue; }
      if (s.mov) { livres = 0; await quadro(); continue; }
      if (++livres >= 3) { if (Q.derrotaPendente) { Q.derrotaPendente = false; throw new Error('DERROTA'); } return s; }
      await quadro();
    }
    throw new Error('assentar: tempo esgotado ' + JSON.stringify(Q.st()));
  };

  /* ------------------------------ caminho (BFS sobre a colisão viva) ------------------------------ */
  const D = { n: [0, -1], s: [0, 1], l: [1, 0], o: [-1, 0] };
  const itemVisivel = (x, y) => (M.zv.def.itens ?? []).some((i) => i.x === x && i.y === y && !i.oculto && !jogo.save.flags[i.flag]);
  const ocupados = () => new Set([...M.npcs.filter((n) => n.ator.visivel).map((n) => n.ator.x + ',' + n.ator.y), ...M.guardas.map((g) => g.ator.x + ',' + g.ator.y)]);
  const ehEntrada = (w) => !!w && w.tipo !== 'borda' && w.tipo !== 'buraco' && w.tipo !== undefined;
  /**
   * plano de passos até (tx, ty) ou até um vizinho dele. Letras = andar; 'A'+dir = interagir antes (embarcar, cipó, rocha).
   * `evitar`: conjunto de "x,y" proibidos. Estados = (x, y, naÁgua).
   */
  Q.plano = (tx, ty, o = {}) => {
    const z = M.zv, am = jogo.save.amuletos, j = P.mundo.jogador, oc = ocupados(), evitar = o.evitar ?? new Set();
    const pode = (id) => am.includes(id) && !!V.ajudante(id);
    const alvo = (x, y) => (o.vizinho ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty);
    const pisavel = (x, y) => (z.chao(x, y) || (ehEntrada(z.warp(x, y)) && z.dentro(x, y) && !z.agua(x, y))) && !itemVisivel(x, y);
    const ini = [j.x, j.y, jogo.save.jogador.modo === 'remo' ? 1 : 0];
    const chave = (s) => s[0] + ',' + s[1] + ',' + s[2];
    if (alvo(j.x, j.y)) return [];
    const ant = new Map([[chave(ini), null]]), fila = [ini];
    let fim = null;
    while (fila.length && !fim) {
      const e = fila.shift(), [x, y, ag] = e;
      for (const d of 'nslo') {
        let nx = x + D[d][0], ny = y + D[d][1], nag = ag, passo = null;
        if (!z.dentro(nx, ny) || oc.has(nx + ',' + ny) || z.portao(nx, ny) || evitar.has(nx + ',' + ny)) continue;
        const ch = z.ch(nx, ny), w = z.warp(nx, ny), destino = nx === tx && ny === ty && !o.vizinho;
        if (w && !destino) continue;
        if (ag) {
          if (z.agua(nx, ny)) { if (ch === 'w') continue; passo = d; }
          else if (pisavel(nx, ny) && !ZN.SALIENCIA[ch]) { passo = d; nag = 0; }
          else continue;
        } else {
          const sal = ZN.SALIENCIA[ch];
          if (sal) { if (sal !== d) continue; const lx = nx + D[d][0], ly = ny + D[d][1]; if (!pisavel(lx, ly) || oc.has(lx + ',' + ly) || z.warp(lx, ly)) continue; nx = lx; ny = ly; passo = d; }
          else if (z.agua(nx, ny)) { if (ch === 'w' || !pode('remo')) continue; passo = 'A' + d; nag = 1; }
          else if (pisavel(nx, ny) || (destino && w)) passo = d;
          else if (ch === 'c' && pode('facao')) passo = 'A' + d;
          else if (ch === 'r' && pode('quebra-pedra')) passo = 'A' + d;
          else if (ch === 'e' && pode('escalar') && (d === 'n' || d === 's')) { let k = 0; while (z.ch(x, y + D[d][1] * (k + 1)) === 'e') k++; const fy = y + D[d][1] * (k + 1); if (!pisavel(x, fy) || oc.has(x + ',' + fy)) continue; ny = fy; passo = 'A' + d; } // paredão (Escalar): sobe/desce a coluna inteira
          else if (ch === 'p' && o.fantasmaP && !z.warp(nx, ny)) passo = 'P' + d;
          else continue;
          if ((ch === 'g' || ch === 'o') && !destino) continue; // gelo e buracos: só por roteiro
        }
        // correnteza: o jogo empurra depois de chegar
        let guarda = 0, cz;
        while ((cz = z.correnteza(nx, ny)) && guarda++ < 40) {
          const cx = nx + D[cz][0], cy = ny + D[cz][1];
          if ((nag ? z.agua(cx, cy) && z.ch(cx, cy) !== 'w' : pisavel(cx, cy)) && !oc.has(cx + ',' + cy)) { nx = cx; ny = cy; if (z.warp(nx, ny)) break; } else break;
        }
        const ne = [nx, ny, nag], k = chave(ne);
        if (ant.has(k)) continue;
        ant.set(k, [chave(e), passo]);
        if (alvo(nx, ny)) { fim = k; break; }
        if (z.warp(nx, ny)) continue;
        fila.push(ne);
      }
    }
    if (!fim) return null;
    const passos = []; for (let k = fim; ant.get(k); k = ant.get(k)[0]) passos.unshift(ant.get(k)[1]);
    return passos;
  };
  /** um passo (ou tentativa) na direção: segura a tecla até o passo começar */
  Q.passo = async (d) => {
    const a = await Q.assentar();
    ev('keydown', CODE[d]);
    let i = 0;
    for (; i < 12; i++) { await quadro(); const s = Q.st(); if (s.mov || s.x !== a.x || s.y !== a.y || s.oc || s.telas > 1 || s.zona !== a.zona || !s.pronto) break; }
    ev('keyup', CODE[d]);
    await quadro();
    return Q.assentar();
  };
  Q.ir = async (seq) => { let s; for (const d of seq) s = await Q.passo(d); return s; };
  Q.virar = async (d) => {
    const s = await Q.assentar(); if (s.dir === d) return;
    ev('keydown', CODE[d]); await quadro(); ev('keyup', CODE[d]); await quadros(2);
    const b = await Q.assentar(); if (b.dir !== d) { P.mundo.jogador.virar(d); await quadro(); }
  };
  Q.agir = async (d) => { if (d) await Q.virar(d); await toque('a'); await quadros(3); return Q.assentar(); };
  /** anda até (tx, ty) (ou vizinho); replaneja depois de batalha, fala ou tranco; para se a zona mudar */
  Q.irAte = async (tx, ty, o = {}) => {
    const z0 = (await Q.assentar()).zona; let trancos = 0;
    for (let volta = 0; volta < 600; volta++) {
      const s = await Q.assentar();
      if (s.zona !== z0) return s;
      const pl = Q.plano(tx, ty, o);
      if (pl === null) { if (++trancos < 6) { await quadros(20); continue; } throw new Error(`sem caminho em ${s.zona} de (${s.x},${s.y}) até (${tx},${ty})${o.vizinho ? ' [vizinho]' : ''}`); }
      if (!pl.length) return s;
      for (const p of pl.slice(0, 8)) {
        const a = Q.st();
        if (p[0] === 'A') { await Q.agir(p[1]); const b = Q.st(); if (b.x === a.x && b.y === a.y && b.zona === a.zona) await Q.passo(p[1]); }
        else await Q.passo(p);
        const b = Q.st();
        if (b.zona !== z0) return b;
        if (b.x === a.x && b.y === a.y) { await quadros(6); break; }
        if (b.nb !== a.nb) break;
      }
    }
    throw new Error(`irAte: não chegou a (${tx},${ty}) em ${z0}: ${JSON.stringify(Q.st())}`);
  };
  /** interage com o que está em (tx, ty): vai a um vizinho, vira e aperta A */
  Q.usar = async (tx, ty, o = {}) => {
    let s = o.forca ? await Q.irAteForca(tx, ty, { vizinho: true }) : await Q.irAte(tx, ty, { vizinho: true });
    const d = tx > s.x ? 'l' : tx < s.x ? 'o' : ty > s.y ? 's' : 'n';
    return Q.agir(d);
  };
  /** warps da zona atual que levam a `dest` (o mais perto alcançável) */
  Q.irZona = async (dest, o = {}) => {
    const s0 = await Q.assentar();
    const ws = M.zv.def.warps.filter((w) => w.para.zona === dest && ES.cond(w.requer) && (!o.filtro || o.filtro(w)));
    if (!ws.length) throw new Error(`sem warp de ${s0.zona} para ${dest}`);
    let melhor = null;
    for (const w of ws) { const pl = Q.plano(w.x, w.y, o); if (pl && (!melhor || pl.length < melhor.pl.length)) melhor = { w, pl }; }
    // gente passeando pode tapar a passagem por uns segundos: espera um pouco antes de desistir
    for (let i = 0; i < 8 && !melhor; i++) { await quadros(25); for (const w of ws) { const pl = Q.plano(w.x, w.y, o); if (pl && (!melhor || pl.length < melhor.pl.length)) melhor = { w, pl }; } if (melhor) anota('esperei a passagem abrir em', s0.zona); }
    if (!melhor) throw new Error(`warp de ${s0.zona} para ${dest} inalcançável de (${s0.x},${s0.y})`);
    let s = await Q.irAte(melhor.w.x, melhor.w.y, o);
    if (s.zona === s0.zona && !melhor.w.tipo) {
      // poço de mergulho (subir/descer): parado em cima dele, o jogador aperta A e confirma
      for (let k = 0; k < 3 && s.zona === s0.zona; k++) s = await Q.agir();
    }
    if (s.zona === s0.zona) {
      // warp de borda sob os pés (chegou por correnteza ou já estava em cima): empurra para fora do mapa
      const z = M.zv, w = melhor.w;
      for (const d of 'nslo') if (!z.dentro(w.x + D[d][0], w.y + D[d][1])) { s = await Q.passo(d); if (s.zona !== s0.zona) break; }
    }
    if (s.zona !== dest) throw new Error(`esperava chegar a ${dest}, estou em ${s.zona} (${s.x},${s.y})`);
    return s;
  };
  Q.npc = (id) => { const n = M.npcs.find((q) => q.id === id); return n ? { x: n.ator.x, y: n.ator.y, id } : null; };
  Q.falarCom = async (id) => { const n = Q.npc(id); if (!n) throw new Error(`NPC ${id} não está em ${M.zv.def.id}`); return Q.usar(n.x, n.y); };
  /** desafia todos os treinadores não vencidos alcançáveis da zona (um jogador comum luta com todos) */
  Q.treinadores = async (o = {}) => {
    const z0 = M.zv.def.id; let n = 0;
    for (let volta = 0; volta < 40; volta++) {
      await Q.assentar(); if (M.zv.def.id !== z0) break;
      const livres = M.npcs.filter((q) => q.treinador && !jogo.save.flags[q.treinador.flag ?? 'venceu:' + q.treinador.id] && q.ator.visivel && !(o.menos ?? []).includes(q.id) && !q.def.script);
      let feito = false;
      for (const q of livres) {
        const pl = Q.plano(q.ator.x, q.ator.y, { vizinho: true }); if (!pl && !o.forca) continue;
        const nb = Q.batalhas.length;
        try { await Q.usar(q.ator.x, q.ator.y, { forca: o.forca && !pl }); } catch (e) { if (o.forca && /pedregulho|empurrei/.test(e.message)) { anota('treinador fora de alcance', q.id, e.message); (o.menos ??= []).push(q.id); feito = true; break; } throw e; }
        feito = true; if (Q.batalhas.length > nb) n++;
        break;
      }
      if (!feito) break;
      if (o.max && n >= o.max) break;
    }
    return n;
  };
  /** pega os itens visíveis alcançáveis da zona */
  Q.catar = async () => {
    const z0 = M.zv.def.id; let n = 0;
    for (let volta = 0; volta < 30; volta++) {
      await Q.assentar(); if (M.zv.def.id !== z0) break;
      const it = (M.zv.def.itens ?? []).find((i) => !i.oculto && !jogo.save.flags[i.flag] && Q.plano(i.x, i.y, { vizinho: true }));
      if (!it) break;
      await Q.usar(it.x, it.y); n++;
      if (!jogo.save.flags[it.flag]) break;
    }
    return n;
  };
  /** anda de um lado para o outro na grama/chão de encontro até ter `n` batalhas selvagens (treino ou captura) */
  Q.passear = async (n, o = {}) => {
    const z = M.zv, alvo = Q.batalhas.length + n, pisos = o.pisos ?? '"%';
    for (let volta = 0; volta < 4000 && Q.batalhas.length < alvo; volta++) {
      const s = await Q.assentar(); if (s.zona !== z.def.id) break;
      if (o.pare && o.pare()) break;
      // vizinho de encontro; senão vai até o tile de encontro mais perto
      const viz = 'nslo'.split('').filter((d) => pisos.includes(z.ch(s.x + D[d][0], s.y + D[d][1])) && z.chao(s.x + D[d][0], s.y + D[d][1]) && !z.warp(s.x + D[d][0], s.y + D[d][1]) && !ocupados().has((s.x + D[d][0]) + ',' + (s.y + D[d][1])));
      if (viz.length) { await Q.passo(viz[volta % viz.length === 0 ? 0 : viz.length - 1]); continue; }
      let melhor = null;
      for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) if (pisos.includes(z.ch(x, y)) && Math.abs(x - s.x) + Math.abs(y - s.y) < (melhor?.d ?? 60)) { const pl = Q.plano(x, y); if (pl && (!melhor || pl.length < melhor.d)) melhor = { x, y, d: pl.length }; }
      if (!melhor) throw new Error('sem chão de encontro alcançável em ' + z.def.id);
      await Q.irAte(melhor.x, melhor.y);
    }
  };


  /* ------------------------------ balcão, Posto e Venda ------------------------------ */
  /** posição para falar com (tx, ty): vizinho direto ou, se houver balcão no meio, a dois tiles */
  Q.usarPorBalcao = async (tx, ty) => {
    if (Q.plano(tx, ty, { vizinho: true })) return Q.usar(tx, ty);
    const z = M.zv;
    for (const d of 'nslo') {
      const mx = tx + D[d][0], my = ty + D[d][1], px = tx + 2 * D[d][0], py = ty + 2 * D[d][1];
      if (!('M#'.includes(z.ch(mx, my)) || z.temObjeto(mx, my)) || !z.chao(px, py)) continue;
      if (!Q.plano(px, py)) continue;
      await Q.irAte(px, py);
      return Q.agir({ n: 's', s: 'n', l: 'o', o: 'l' }[d]);
    }
    throw new Error(`não dá para falar com (${tx},${ty}) em ${z.def.id}`);
  };
  Q.falarCom = async (id) => { const n = Q.npc(id); if (!n) throw new Error(`NPC ${id} não está em ${M.zv.def.id}`); return Q.usarPorBalcao(n.x, n.y); };
  /** cura no Posto (já dentro da zona `<cidade>-posto`) */
  Q.curarNoPosto = async () => { if (!/-posto$/.test(M.zv.def.id)) throw new Error('não estou num Posto: ' + M.zv.def.id); await Q.falarCom('atendente'); Q.curasPosto++; return Q.resumo(); };
  /** compra na Venda (já dentro da zona `<cidade>-venda`): lista = { item: qtd } */
  Q.comprar = async (lista) => {
    await Q.assentar();
    const v = M.npcs.find((n) => n.def.loja); if (!v) throw new Error('sem vendedor em ' + M.zv.def.id);
    const itens = v.def.loja.filter((id) => IT.temItemDef(id)), antes = { ...jogo.save.mochila }, din0 = jogo.save.jogador.dinheiro;
    Q.telaEsperada = /tela-loja/;
    try {
      await Q.usarPorBalcao(v.ator.x, v.ator.y);
      const fila = Object.entries(lista).filter(([id, q]) => q > 0 && itens.includes(id));
      let fase = 'menu', guarda = 0, atual = null, apertos = 0;
      while (guarda++ < 3000) {
        const topo = P.telas.topo?.el.className ?? '';
        if (/dialogo/.test(topo)) { await toque('a'); continue; }
        if (/confirmacao/.test(topo)) { await toque('a'); await quadros(2); continue; }
        if (/janela-qtd/.test(topo)) {
          if (apertos < atual[1] - 1) { const falta = atual[1] - 1 - apertos; if (falta >= 10) { await toque('dir'); apertos += 10; } else { await toque('cima'); apertos++; } continue; }
          await toque('a'); await quadros(2); atual = null; continue;
        }
        if (!/tela-loja/.test(topo)) { if (fase === 'fim') break; await quadro(); continue; }
        const l = $('.tela-loja .lista'), f = focoLista(l);
        if (f.n === 3 && fase !== 'itens') {
          if (!fila.length) { fase = 'fim'; await toque('b'); await quadros(3); continue; }
          if (f.i === 0) { await toque('a'); fase = 'itens'; await quadros(2); } else await toque('cima');
          continue;
        }
        if (fase === 'itens') {
          if (!fila.length) { fase = 'menu'; await toque('b'); await quadros(2); continue; }
          const [id, q] = fila[0], alvo = itens.indexOf(id);
          const max = Math.floor(jogo.save.jogador.dinheiro / IT.item(id).preco);
          if (max < 1) { anota('sem dinheiro para', id); fila.shift(); continue; }
          if (f.i !== alvo) { await toque(f.i < alvo ? 'baixo' : 'cima'); continue; }
          atual = [id, Math.min(q, max)]; apertos = 0; fila.shift();
          await toque('a'); await quadros(2); continue;
        }
        await quadro();
      }
    } finally { Q.telaEsperada = null; }
    await Q.assentar();
    const comprou = {}; for (const id of Object.keys(lista)) { const d = (jogo.save.mochila[id] ?? 0) - (antes[id] ?? 0); if (d) { comprou[id] = d; Q.compras[id] = (Q.compras[id] ?? 0) + d; } }
    return { comprou, gasto: din0 - jogo.save.jogador.dinheiro };
  };

  /* ------------------------------ item pelo menu (fora de batalha) ------------------------------ */
  const BOLSOS_MENU = ['itens', 'remedios', 'cuias', 'pergaminhos', 'frutos', 'chave'];
  /** usa um item numa criatura da equipe pelo menu de pausa: Menu → Mochila → item → Usar → criatura */
  Q.usarItemMenu = async (id, alvo, slot = 0) => {
    await Q.assentar();
    const def = IT.item(id), q0 = jogo.save.mochila[id] ?? 0; if (!q0) return false;
    let feito = false, guarda = 0;
    Q.telaEsperada = /tela-menu|tela-mochila|tela-equipe/;
    try {
      while (guarda++ < 2000) {
        const topo = P.telas.topo?.el.className ?? '';
        if ((jogo.save.mochila[id] ?? 0) < q0) feito = true;
        if (/confirmacao/.test(topo)) {
          const l = $('.tela.confirmacao .lista'), f = focoLista(l);
          // "Usar" é a primeira opção; lista de golpes (PG): escolhe o slot; "OK": confirma
          const quer = f.n >= 4 && !feito && def.uso?.pg && !$('.tela-mochila ~ .tela-equipe') ? 0 : 0;
          const ehGolpes = !!def.uso?.pg && !def.uso?.pgTodos && P.telas.pilha.some((t) => /tela-equipe/.test(t.el.className)) && f.n >= 3 && !feito;
          const alvoL = ehGolpes ? slot : quer;
          if (f.i === alvoL) { await toque('a'); await quadros(2); } else await toque(f.i < alvoL ? 'baixo' : 'cima');
          continue;
        }
        if (/dialogo/.test(topo)) { await toque('a'); continue; }
        if (/tela-equipe/.test(topo)) {
          if (feito) { await toque('b'); await quadros(2); continue; }
          const sel = $('.tela-equipe .grade .mol-selecao'), cur = sel ? Math.round((parseInt(sel.style.top) + 2) / 48) * 2 + Math.round((parseInt(sel.style.left) + 2) / 158) : 0;
          const t = passoGrade(cur, alvo);
          if (!t) { await toque('a'); await quadros(3); if ((jogo.save.mochila[id] ?? 0) >= q0 && !def.uso?.pg && guarda > 400) feito = true; } else await toque(t);
          continue;
        }
        if (/tela-mochila/.test(topo)) {
          if (feito) { await toque('b'); await quadros(2); continue; }
          const bi = BOLSOS_MENU.indexOf(def.bolso), abas = $$('.tela-mochila .abas > div'), cur = abas.findIndex((x) => /mol-botao-foco/.test(x.className));
          if (cur !== bi) { await toque(cur < bi ? 'dir' : 'esq'); await quadro(); continue; }
          const its = IT.ITENS.filter((i) => i.bolso === def.bolso && (jogo.save.mochila[i.id] ?? 0) > 0), al = its.findIndex((i) => i.id === id), f = focoLista($('.tela-mochila'));
          if (al < 0) { feito = true; continue; }
          if (f.i === al) { await toque('a'); await quadros(2); } else await toque(f.i < al ? 'baixo' : 'cima');
          continue;
        }
        if (/tela-menu/.test(topo)) {
          if (feito) { await toque('b'); await quadros(2); continue; }
          const f = focoLista($('.tela-menu')), al = (jogo.save.mochila['diario-de-campo'] || jogo.save.flags['ovo-entregue'] || jogo.save.diario.visto.length ? 1 : 0) + (jogo.save.equipe.length ? 1 : 0);
          if (f.i === al) { await toque('a'); await quadros(2); } else await toque(f.i < al ? 'baixo' : 'cima');
          continue;
        }
        if (/mundo/.test(topo)) { const s = Q.st(); if (feito && !s.oc) break; if (!s.oc && !s.mov && s.pronto) { await toque('menu'); await quadros(2); } else await quadro(); continue; }
        await quadro();
      }
    } finally { Q.telaEsperada = null; }
    await Q.assentar();
    const usou = (jogo.save.mochila[id] ?? 0) < q0;
    if (usou) Q.itensCampo[id] = (Q.itensCampo[id] ?? 0) + 1;
    return usou;
  };
  /**
   * cuidados entre lutas com os remédios da mochila (mesma regra de `cuidarEntreLutas` do simulador, feita pelo menu).
   * o: { limiar (0.75), reanimar (true), guardar: { item: mínimo a deixar na mochila } }
   */
  Q.cuidar = async (o = {}) => {
    const lim = o.limiar ?? 0.75, guardar = o.guardar ?? {}, m = () => jogo.save.mochila;
    const tem = (id) => (m()[id] ?? 0) > (guardar[id] ?? 0);
    const usados = [];
    for (let volta = 0; volta < 60; volta++) {
      let acao = null;
      const nuc = o.nucleo ? new Set(jogo.save.equipe.filter((c) => !c.ovo).slice().sort((x, y) => y.nivel - x.nivel).slice(0, o.nucleo).map((c) => c.uid)) : null;
      for (const [i, c] of jogo.save.equipe.entries()) {
        if (c.ovo || (nuc && !nuc.has(c.uid))) continue; const max = vidaMax(c);
        if (c.vida <= 0) { if (o.reanimar !== false && tem('cha-guarana')) { acao = ['cha-guarana', i]; break; } continue; }
        if (c.status && tem('pomada-copaiba')) { acao = ['pomada-copaiba', i]; break; }
        if (c.status && ['envenenado', 'dormindo', 'encantado'].includes(c.status) && tem('mel-puro')) { acao = ['mel-puro', i]; break; }
        if (c.status && ['queimado', 'congelado', 'paralisado'].includes(c.status) && tem('unguento')) { acao = ['unguento', i]; break; }
        if (o.pg !== false) { const g = c.golpes.findIndex((x) => x.pg <= 2 && GO.golpe(x.id).cat !== 'status'); if (g >= 0 && tem('garapa')) { acao = ['garapa', i, g]; break; } }
        if (c.vida < max * lim) {
          if (max - c.vida > 90 && tem('elixir-andiroba')) { acao = ['elixir-andiroba', i]; break; }
          if (tem('garrafada')) { acao = ['garrafada', i]; break; }
          if (tem('cha-cidreira') && max - c.vida <= 40) { acao = ['cha-cidreira', i]; break; }
          if (tem('elixir-andiroba')) { acao = ['elixir-andiroba', i]; break; }
          if (tem('cha-cidreira')) { acao = ['cha-cidreira', i]; break; }
        }
      }
      if (!acao) break;
      const ok = await Q.usarItemMenu(acao[0], acao[1], acao[2] ?? 0);
      if (!ok) { anota('cuidar: não consegui usar', acao.join(' ')); break; }
      usados.push(acao[0]);
    }
    return usados;
  };

  /* ------------------------------ ordem da equipe (Menu → Equipe → Mover) ------------------------------ */
  /** troca de lugar as criaturas `a` e `b` da equipe pelo menu de pausa */
  Q.mover = async (a, b) => {
    await Q.assentar(); if (a === b) return true;
    const ua = jogo.save.equipe[a].uid, ub = jogo.save.equipe[b].uid;
    const feito = () => jogo.save.equipe[b]?.uid === ua && jogo.save.equipe[a]?.uid === ub;
    let guarda = 0, fase = 0; // 0 = escolher a, 1 = pediu Mover, 2 = escolher b
    Q.telaEsperada = /tela-menu|tela-equipe/;
    try {
      while (guarda++ < 1500) {
        const topo = P.telas.topo?.el.className ?? '';
        if (/confirmacao/.test(topo)) {
          const l = $('.tela.confirmacao .lista'), f = focoLista(l);
          if (f.i === 1) { await toque('a'); await quadros(2); fase = 2; } else await toque(f.i < 1 ? 'baixo' : 'cima');
          continue;
        }
        if (/dialogo/.test(topo)) { await toque('a'); continue; }
        if (/tela-equipe/.test(topo)) {
          if (feito()) { await toque('b'); await quadros(2); continue; }
          const sel = $('.tela-equipe .grade .mol-selecao'), cur = sel ? Math.round((parseInt(sel.style.top) + 2) / 48) * 2 + Math.round((parseInt(sel.style.left) + 2) / 158) : 0;
          const alvo = fase === 2 ? b : a, t = passoGrade(cur, alvo);
          if (!t) { await toque('a'); await quadros(3); } else await toque(t);
          continue;
        }
        if (/tela-menu/.test(topo)) {
          if (feito()) { await toque('b'); await quadros(2); continue; }
          const f = focoLista($('.tela-menu')), al = (jogo.save.mochila['diario-de-campo'] || jogo.save.flags['ovo-entregue'] || jogo.save.diario.visto.length ? 1 : 0);
          if (f.i === al) { await toque('a'); await quadros(2); } else await toque(f.i < al ? 'baixo' : 'cima');
          continue;
        }
        if (/mundo/.test(topo)) { const s = Q.st(); if (feito() && !s.oc) break; if (!s.oc && !s.mov && s.pronto) { await toque('menu'); await quadros(2); } else await quadro(); continue; }
        await quadro();
      }
    } finally { Q.telaEsperada = null; }
    await Q.assentar();
    if (!feito()) anota('mover: não consegui', a, b);
    return feito();
  };
  /** põe na frente a criatura escolhida por `nota` (maior nota = primeira) */
  Q.frente = async (nota) => {
    const e = jogo.save.equipe; let m = 0;
    for (let i = 1; i < e.length; i++) if (!e[i].ovo && nota(e[i], i) > nota(e[m], m)) m = i;
    if (m !== 0) return Q.mover(0, m);
    return true;
  };
  /** rodízio de jogador comum: contra treinador de rota abre a mais atrasada que esteja inteira; contra chefe abre a mais forte */
  Q.rodizio = async (modo = 'treino') => {
    const max = Math.max(...jogo.save.equipe.map((c) => c.nivel));
    if (modo === 'chefe') return Q.frente((c) => (c.vida > 0 ? c.nivel : -1));
    // núcleo = as 3 de maior nível (é o que o jogador comum de fato usa); abre a mais atrasada do núcleo que esteja inteira
    const nucleo = new Set(jogo.save.equipe.filter((c) => !c.ovo).slice().sort((x, y) => y.nivel - x.nivel).slice(0, Q.nucleo ?? 3).map((c) => c.uid));
    return Q.frente((c) => (c.vida >= vidaMax(c) * 0.6 && nucleo.has(c.uid) && c.nivel >= max - 4 ? 100 - c.nivel : c.vida > 0 ? c.nivel / 100 : -9));
  };

  /* ------------------------------ viagem entre zonas ------------------------------ */
  /** vai até a zona `dest` pelo grafo de warps (só passagens abertas agora); tenta outro caminho se um trecho não fecha */
  Q.viajar = async (dest, o = {}) => {
    const banidos = new Set(o.banir ?? []), warpsRuins = new Set();
    let veio = null; // { de, chave } = por qual warp entrei na zona atual
    const filtro = (zid) => (w) => !warpsRuins.has(zid + ':' + w.x + ',' + w.y);
    for (let volta = 0; volta < 80; volta++) {
      const s = await Q.assentar(); if (s.zona === dest) return s;
      const ant = new Map([[s.zona, null]]), fila = [s.zona];
      while (fila.length && !ant.has(dest)) {
        const zid = fila.shift(), def = ZN.zonaDef(zid); if (!def) continue;
        for (const w of def.warps) { const para = w.para.zona; if (ant.has(para) || banidos.has(zid + '>' + para) || !ES.cond(w.requer) || !ZN.zonaDef(para) || !(Q.mapas ?? ['A', 'B']).includes(ZN.zonaDef(para).mapa) || w.tipo === 'trem' || w.tipo === 'saveiro') continue; if (/^[X_]/.test(para)) continue; if (!filtro(zid)(w)) continue; ant.set(para, zid); fila.push(para); }
      }
      if (!ant.has(dest)) throw new Error(`sem rota de ${s.zona} para ${dest} (banidos: ${[...banidos].join(' ')} ${[...warpsRuins].join(' ')})`);
      let prox = dest; while (ant.get(prox) !== s.zona) prox = ant.get(prox);
      try {
        // registra por qual warp saí (o mais perto alcançável, como irZona escolhe)
        const ws = M.zv.def.warps.filter((w) => w.para.zona === prox && ES.cond(w.requer) && filtro(s.zona)(w));
        let melhor = null; for (const w of ws) { const pl = Q.plano(w.x, w.y); if (pl && (!melhor || pl.length < melhor.n)) melhor = { w, n: pl.length }; }
        await Q.irZona(prox, { filtro: filtro(s.zona) });
        veio = melhor ? { de: s.zona, chave: s.zona + ':' + melhor.w.x + ',' + melhor.w.y } : null;
      } catch (e) {
        if (/DERROTA|abortado/.test(e.message)) throw e;
        if (/inalcançável|sem caminho/.test(e.message) && jogo.save.amuletos.includes('forca') && V.ajudante('forca') && [...Array(M.zv.h)].some((_, y) => [...Array(M.zv.w)].some((__, x) => M.zv.ch(x, y) === 'p'))) {
          // pedregulho no caminho: empurra (Força)
          try { const r = await Q.irZonaForca(prox); if (r.zona === prox) { veio = null; continue; } } catch (e2) { if (/DERROTA|abortado/.test(e2.message)) throw e2; anota('viajar: Força não abriu', e2.message); }
        }
        if (/inalcançável|sem warp|sem caminho/.test(e.message)) {
          // entrei por uma porta que não leva adiante (escada do lado errado): volto e tento outra entrada
          if (veio && veio.de !== prox && !warpsRuins.has(veio.chave)) { warpsRuins.add(veio.chave); anota('viajar: entrada sem saída', veio.chave, '→ volto a', veio.de); const de = veio.de; veio = null; try { await Q.irZona(de); continue; } catch (e2) { if (/DERROTA|abortado/.test(e2.message)) throw e2; } }
          banidos.add(s.zona + '>' + prox); anota('viajar: trecho fechado', s.zona, '>', prox, e.message); continue;
        }
        throw e;
      }
    }
    throw new Error('viajar: não cheguei a ' + dest);
  };


  /* ------------------------------ pedregulhos (Força) ------------------------------ */
  /** como irAte, mas empurra pedregulhos do caminho quando não há rota (escolhe o empurrão que aproxima do alvo) */
  Q.irAteForca = async (tx, ty, o = {}) => {
    const z0 = M.zv.def.id;
    for (let n = 0; n < 16; n++) {
      const s = await Q.assentar(); if (s.zona !== z0) return s;
      if (Q.plano(tx, ty, o)) return Q.irAte(tx, ty, o);
      const z = M.zv, oc = ocupados(); let melhor = null;
      // caminho ideal fazendo de conta que os pedregulhos não existem: o 1º pedregulho dele é o que tem de sair
      const ideal = Q.plano(tx, ty, { ...o, fantasmaP: true });
      if (ideal) {
        let x = s.x, y = s.y;
        for (const p of ideal) {
          const d = p.length > 1 ? p[1] : p;
          if (p[0] === 'P') {
            const px = x + D[d][0], py = y + D[d][1];
            // empurra na direção da marcha; se não der, de lado
            for (const e of [d, ...'nslo'.split('').filter((q) => q !== d)]) {
              const sx = px - D[e][0], sy = py - D[e][1], bx = px + D[e][0], by = py + D[e][1];
              if (!z.chao(bx, by) || oc.has(bx + ',' + by) || z.warp(bx, by) || itemVisivel(bx, by)) continue;
              if (!(sx === s.x && sy === s.y) && !Q.plano(sx, sy)) continue;
              melhor = { x: px, y: py, d: e, sx, sy, nota: 0 }; break;
            }
            break;
          }
          x += D[d][0]; y += D[d][1];
          if (ZN.SALIENCIA[z.ch(x, y)]) { x += D[d][0]; y += D[d][1]; }
        }
      }
      if (!melhor) for (let y = 0; y < z.h; y++) for (let x = 0; x < z.w; x++) {
        if (z.ch(x, y) !== 'p') continue;
        for (const d of 'nslo') {
          const sx = x - D[d][0], sy = y - D[d][1], bx = x + D[d][0], by = y + D[d][1];
          if (!z.chao(bx, by) || oc.has(bx + ',' + by) || z.warp(bx, by) || itemVisivel(bx, by)) continue;
          const pl = sx === s.x && sy === s.y ? [] : Q.plano(sx, sy); if (!pl) continue;
          const ganho = (Math.abs(x - tx) + Math.abs(y - ty)) - (Math.abs(bx - tx) + Math.abs(by - ty));
          const nota = ganho * 10 - pl.length * 0.1 - (Math.abs(x - s.x) + Math.abs(y - s.y)) * 0.2;
          if (!melhor || nota > melhor.nota) melhor = { x, y, d, sx, sy, nota };
        }
      }
      if (!melhor) throw new Error(`sem caminho nem pedregulho útil em ${z0} até (${tx},${ty})`);
      await Q.irAte(melhor.sx, melhor.sy);
      if (!M.forca) await Q.agir(melhor.d); else await Q.virar(melhor.d);
      if (!M.forca) throw new Error('a Força não ligou (falta Amuleto ou criatura de Terra/Pedra/Ginga): ' + JSON.stringify(P.mundo.falas.slice(-1)));
      await Q.passo(melhor.d); await quadros(8); await Q.assentar();
      anota('empurrei pedregulho', melhor.x, melhor.y, melhor.d);
    }
    throw new Error('irAteForca: empurrei demais sem abrir caminho');
  };
  /** irZona com pedregulhos */
  Q.irZonaForca = async (dest) => {
    const s0 = await Q.assentar();
    const ws = M.zv.def.warps.filter((w) => w.para.zona === dest && ES.cond(w.requer));
    if (!ws.length) throw new Error(`sem warp de ${s0.zona} para ${dest}`);
    const w = ws[0];
    let s = await Q.irAteForca(w.x, w.y);
    if (s.zona === s0.zona) for (const d of 'nslo') if (!M.zv.dentro(w.x + D[d][0], w.y + D[d][1])) { s = await Q.passo(d); if (s.zona !== s0.zona) break; }
    return s;
  };
  /* ------------------------------ Voo (Amuleto da insígnia 14) ------------------------------ */
  /**
   * voa até a cidade `dest` como o jogador faz pelo menu (Amuleto Voo): confirma a pergunta, escolhe a cidade no
   * mapa-múndi tocando o marcador (1º toque seleciona, 2º confirma) e aceita a confirmação.
   */
  Q.voar = async (dest) => {
    await Q.assentar();
    const CAMPO = await import('/src/world/campo.ts'), MD = await import('/src/ui/telas/mapa-dados.ts');
    const idx = MD.LOCAIS.findIndex((l) => l.id === dest); if (idx < 0) throw new Error('voar: local desconhecido ' + dest);
    const z0 = M.zv.def.id; let fim = false, toques = 0;
    const pr = CAMPO.usarAmuleto('voo').then((r) => { fim = true; return r; });
    for (let g = 0; g < 4000 && !fim; g++) {
      const topo = P.telas.topo?.el.className ?? '';
      if (/tela-mapa/.test(topo)) {
        const alvos = $$('.tela-mapa .tocavel'); const el = alvos[idx];
        if (!el) throw new Error('voar: marcador não achado');
        if (toques < 2) { for (const t of ['pointerdown', 'pointerup']) el.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerType: 'touch' })); toques++; await quadros(4); continue; }
        await quadro(); continue;
      }
      if (/dialogo/.test(topo)) { const l = $('.tela.dialogo .lista'); if (l) { const f = focoLista(l); if (f.i === 0) await toque('a'); else await toque('cima'); } else await toque('a'); await quadros(2); continue; }
      if (/confirmacao/.test(topo)) { const l = $('.tela.confirmacao .lista'), f = l ? focoLista(l) : { i: 0 }; if (f.i === 0) await toque('a'); else await toque('cima'); await quadros(2); continue; }
      await quadro();
    }
    const ok = await pr; await Q.assentar();
    if (!ok || M.zv.def.id === z0) throw new Error(`voar: não voou para ${dest} (estou em ${M.zv.def.id}; falas ${JSON.stringify(P.mundo.falas.slice(-2).map((f) => f.texto))})`);
    anota('voou para', dest); return Q.st();
  };
  Q.ajudantes = () => Object.fromEntries(['facao', 'remo', 'forca', 'lampiao', 'quebra-pedra', 'faro', 'mergulho', 'escalar'].map((a) => [a, jogo.save.amuletos.includes(a) ? (V.ajudante(a) ? CR.especie(V.ajudante(a).especie).nome : 'SEM CRIATURA') : '-']));
  /** saúde só do núcleo (as `k` de maior nível): pior fração de vida e quantas caíram */
  Q.saudeNucleo = (k = 3) => { const e = jogo.save.equipe.filter((c) => !c.ovo).slice().sort((x, y) => y.nivel - x.nivel).slice(0, k); return { pior: Math.min(...e.map((c) => c.vida / vidaMax(c))), caidas: e.filter((c) => c.vida <= 0).length, pgBaixo: e.filter((c) => c.vida > 0 && c.golpes.filter((g) => GO.golpe(g.id).cat !== 'status').every((g) => g.pg <= 3)).length }; };
  Q.saude = () => { const e = jogo.save.equipe.filter((c) => !c.ovo); const tot = e.reduce((a, c) => a + vidaMax(c), 0), cur = e.reduce((a, c) => a + c.vida, 0); return { frac: cur / tot, caidas: e.filter((c) => c.vida <= 0).length, vivas: e.filter((c) => c.vida > 0).length, pgBaixo: e.filter((c) => c.vida > 0 && c.golpes.filter((g) => GO.golpe(g.id).cat !== 'status').every((g) => g.pg <= 3)).length }; };

  /* ------------------------------ resumo ------------------------------ */
  Q.resumo = () => { const s = jogo.save; return { zona: s.jogador.zona, x: s.jogador.x, y: s.jogador.y, dinheiro: s.jogador.dinheiro, insignias: s.insignias, amuletos: s.amuletos, equipe: s.equipe.map((c) => `${CR.especie(c.especie).nome} ${c.nivel} (${c.vida}/${vidaMax(c)}) [${c.golpes.map((g) => g.id + ':' + g.pg).join(',')}]`), mochila: s.mochila, nb: Q.batalhas.length }; };
  Q.pronto = true;
})().catch((e) => { window.Q = { erro: String(e?.stack ?? e) }; });
