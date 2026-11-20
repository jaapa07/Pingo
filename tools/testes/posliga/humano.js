// JOGADOR "GENTE" das provas da Gincana — roda dentro da página (injetado por gincana.mjs). Não lê o estado interno
// da prova: só o que está na tela (posição dos obstáculos, da marca e da faixa no DOM) e aperta teclas com tempo de
// reação e erro de mira de uma pessoa (padrões: reação 0,25 s, erro de tempo 45 ms, 10% de distrações).
// Uso: await window.H.jogar('agilidade' | 'forca' | 'salto', { reacao, sigma, distrai, semente })
(() => {
  const CODE = { cima: 'ArrowUp', baixo: 'ArrowDown', a: 'KeyZ' };
  const ev = (tipo, code) => document.dispatchEvent(new KeyboardEvent(tipo, { code, key: code, bubbles: true }));
  const quadro = () => new Promise((r) => requestAnimationFrame(r));
  const tecla = async (k) => { ev('keydown', CODE[k]); await quadro(); ev('keyup', CODE[k]); };
  const tr = (el) => { const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(el.style.transform || ''); return m ? [Number(m[1]), Number(m[2])] : null; };
  function lcg(s) { let x = s >>> 0 || 1; return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; }
  const gauss = (r) => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  async function jogar(prova, o = {}) {
    const reacao = o.reacao ?? 0.25, sigma = o.sigma ?? 0.045, distrai = o.distrai ?? 0.1, r = lcg(o.semente ?? 1);
    const log = { teclas: 0, acoes: [] };
    const raiz = () => document.querySelector('.tela-gincana');
    // espera a contagem
    for (let i = 0; i < 2000 && !raiz(); i++) await quadro();
    let t0 = performance.now(), ant = performance.now();
    const agendadas = []; // { t, k }
    const agendar = (k, atraso) => agendadas.push({ t: performance.now() + atraso * 1000, k });
    // estado da pessoa
    let raia = 1, alvoRaia = 1, ultimoAperto = 0, mira = null, ultimaMarca = null, vel = null, obsAnt = new Map();
    const RAIAS = [112, 132, 152];
    while (raiz() && !document.querySelector('.tela-gincana .gn-res')) {
      await quadro();
      const agora = performance.now(), dt = (agora - ant) / 1000; ant = agora;
      for (let i = agendadas.length - 1; i >= 0; i--) if (agendadas[i].t <= agora) { const k = agendadas.splice(i, 1)[0].k; log.teclas++; await tecla(k); }
      const R = raiz(); if (!R) break;
      if (prova === 'agilidade') {
        const CX = 64, obs = [...R.querySelectorAll('.gn-ob')].map((el) => {
          const p = tr(el); if (!p) return null;
          if (el.classList.contains('gn-img')) { const w = parseInt(el.style.width), h = parseInt(el.style.height); const y = p[1] + h - 2; return { x: p[0] + w / 2, r: RAIAS.reduce((a, ry, i) => (Math.abs(ry - y) < Math.abs(RAIAS[a] - y) ? i : a), 0), estrela: false, w }; }
          const y = p[1] + 10; return { x: p[0], r: RAIAS.reduce((a, ry, i) => (Math.abs(ry - y) < Math.abs(RAIAS[a] - y) ? i : a), 0), estrela: true, w: 12 };
        }).filter(Boolean);
        const LOOK = 170;
        const perigo = (ra) => obs.some((q) => !q.estrela && q.r === ra && q.x > CX - q.w / 2 - 6 && q.x < CX + LOOK);
        const estrela = (ra) => obs.some((q) => q.estrela && q.r === ra && q.x > CX && q.x < CX + LOOK);
        let quer = alvoRaia;
        if (perigo(alvoRaia)) { const ops = [alvoRaia - 1, alvoRaia + 1].filter((x) => x >= 0 && x <= 2 && !perigo(x)); if (ops.length) quer = ops.find(estrela) ?? ops[Math.floor(r() * ops.length)]; }
        else if (!estrela(alvoRaia)) { const ops = [alvoRaia - 1, alvoRaia + 1].filter((x) => x >= 0 && x <= 2 && !perigo(x) && estrela(x)); if (ops.length) quer = ops[0]; }
        if (quer !== alvoRaia) {
          if (r() < distrai) { alvoRaia = alvoRaia; /* não viu a tempo: segue reto nesta olhada */ }
          else { const passo = quer < alvoRaia ? 'cima' : 'baixo'; alvoRaia += quer < alvoRaia ? -1 : 1; agendar(passo, reacao + Math.abs(gauss(r)) * sigma); log.acoes.push(passo); }
        }
      } else if (prova === 'forca') {
        const marca = R.querySelector('.gn-ritmo-marca'), zona = R.querySelector('.gn-ritmo-zona');
        if (!marca || !zona) continue;
        const p = tr(marca); if (!p) continue;
        const mx = p[0], zx = parseInt(zona.style.left), zw = parseInt(zona.style.width), centro = zx + zw / 2;
        if (ultimaMarca !== null && dt > 0) { const v = Math.abs(mx - ultimaMarca) / dt; if (v > 20 && v < 2000) vel = vel ? vel * 0.8 + v * 0.2 : v; }
        const dir = ultimaMarca === null ? 0 : Math.sign(mx - ultimaMarca);
        const zonaMudou = mira && mira.zx !== zx;
        if (!mira || zonaMudou) mira = { zx, alvo: centro + (vel ?? 150) * gauss(r) * sigma, pronto: agora + (zonaMudou ? reacao * 1000 : 0) };
        // aperta quando a marca vai cruzar o alvo neste quadro (a pessoa antecipa o movimento)
        if (agora >= mira.pronto && agora - ultimoAperto > 150 && dir !== 0 && vel) {
          const prox = mx + dir * vel * (1 / 60);
          if ((mx - mira.alvo) * (prox - mira.alvo) <= 0) {
            if (r() >= distrai) { log.teclas++; await tecla('a'); ultimoAperto = agora; }
            mira = { zx, alvo: centro + vel * gauss(r) * sigma, pronto: agora + 120 };
          }
        }
        ultimaMarca = mx;
      } else {
        const CX = 72, obs = [...R.querySelectorAll('.gn-ob')].map((el) => { const p = tr(el); return p ? { el, x: p[0] + parseInt(el.style.width) / 2, w: parseInt(el.style.width) } : null; }).filter(Boolean);
        for (const q of obs) { const a = obsAnt.get(q.el); if (a !== undefined && dt > 0) { const v = (a - q.x) / dt; if (v > 20 && v < 800) vel = vel ? vel * 0.8 + v * 0.2 : v; } }
        obsAnt = new Map(obs.map((q) => [q.el, q.x]));
        const dur = o.dur ?? 0.7;
        const prox = obs.filter((q) => q.x > CX).sort((a, b) => a.x - b.x)[0];
        if (prox && vel && agora - ultimoAperto > dur * 1000 + 60 && !prox.el.dataset.mirado) {
          // salta para estar no alto do pulo quando o tronco passar: aperta a v·dur/2 de distância (+ erro de tempo)
          if (!prox.el.dataset.erro) prox.el.dataset.erro = String(gauss(r) * sigma);
          const dist = vel * (dur / 2 + Number(prox.el.dataset.erro));
          if (prox.x - CX <= dist) { prox.el.dataset.mirado = '1'; if (r() >= distrai) { log.teclas++; await tecla('a'); ultimoAperto = agora; } }
        }
      }
    }
    log.seg = (performance.now() - t0) / 1000;
    return log;
  }
  window.H = { jogar };
})();
