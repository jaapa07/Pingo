/**
 * TELA 'batalha' — reproduz a fila de `EventoBatalha` do motor no layout clássico e recolhe as decisões do jogador.
 * Não decide nada: conduz tudo por `args.controle` e chama `args.concluir()` uma vez, quando a batalha termina.
 */
import type { CriaturaInst, StatusId, Stat } from '../../core/tipos';
import { jogo } from '../../core/estado';
import { bus } from '../../core/events';
import { input, tocavel } from '../../core/input';
import { hitStop } from '../../core/loop';
import { vista } from '../../core/assets';
import type { Tela } from '../../ui/telas';
import { CaixaTexto, pedirNome } from '../../ui/dialogo';
import { em, texto } from '../../ui/fonte';
import { golpe as defGolpe, temGolpe } from '../../data/golpes';
import { item as defItem, temItemDef } from '../../data/itens';
import { eficaciaContra } from '../../data/tabela-tipos';
import type { ArgsTelaBatalha } from '../index';
import type { Acao, EventoBatalha, Pedido, Pos, ResumoCriatura } from '../engine';
import { especie, expParaNivel, temEspecie } from '../criatura';
import { ANIMS, type Golpeio } from '../anims';
import { precarregarFx, temFx, type Fx } from './cena';
import { Palco, div, type Ator } from './palco';
import { Bolinhas, CaixaStatus, fracExp, numeroDano, painel } from './hud';
import { menuAcao, menuAlvo, menuEquipe, menuGolpeDe, menuGolpes, menuMochila, menuOpcoes, type InfoEficacia, type Modal } from './menus';

type Vis = ResumoCriatura;
const som = (id: string, o: { pitch?: number; vol?: number } = {}) => bus.emit('sfx', { id, ...o });
const NOME_ST: Record<Stat, string> = { vida: 'Vida', atq: 'Ataque', def: 'Defesa', atqEsp: 'Atq. Esp.', defEsp: 'Def. Esp.', vel: 'Velocidade' };
const SOM_STATUS: Record<StatusId, string> = { queimado: 'status-queimadura', envenenado: 'status-veneno', paralisado: 'status-paralisia', dormindo: 'status-sono', congelado: 'status-congelado', encantado: 'status-confusao' };
const SOM_CLIMA: Record<string, string> = { sol: 'clima-sol', chuva: 'clima-chuva', garoa: 'clima-geada', poeira: 'clima-areia', nevoa: 'vento' };

export function criarTelaBatalha(args: ArgsTelaBatalha): Tela {
  const { controle, pedido } = args, b = controle.b, dupla = b.porLado > 1;
  const el = document.createElement('div'); el.className = 'tela batalha';
  const palco = new Palco(dupla); el.append(palco.el);
  const hud = div('bt-hud', el);
  const cena = palco.cena, rel = cena.rel;
  const cortinas = [div('bt-cortina cima', el), div('bt-cortina baixo', el)];
  const abrirCortina = (k: number) => { const h = Math.round(90 * (1 - k)); cortinas[0].style.height = cortinas[1].style.height = h + 'px'; };

  /* ---------- estado mostrado (o motor já alterou as criaturas; a tela anda pelos eventos) ---------- */
  const vis = new Map<string, Vis>();
  const inst = new Map<string, CriaturaInst>();
  for (const l of b.lados) for (const c of l.equipe) { inst.set(c.uid, c); if (!c.ovo && temEspecie(c.especie)) vis.set(c.uid, b.resumo(c)); }
  const jaVistas = new Set([...jogo.save.diario.visto, ...jogo.save.diario.capturado]);
  const jaCapturadas = new Set(jogo.save.diario.capturado);
  const emCampo: (string | null)[][] = [[null, null], [null, null]];
  const caixas: CaixaStatus[][] = [[], []];
  for (const lado of [0, 1] as const) for (let pos = 0; pos < b.porLado; pos++) {
    const cx = new CaixaStatus(lado, dupla); caixas[lado][pos] = cx;
    em(cx.el, lado === 0 ? 194 : 4, lado === 0 ? (dupla ? 82 + pos * 26 : 94) : 6 + pos * 29);
    hud.append(cx.el);
  }
  const bolinhas = [new Bolinhas(314, dupla ? 72 : 84, true), new Bolinhas(6, 6 + b.porLado * 29 + 1, false)];
  hud.append(bolinhas[0].el, bolinhas[1].el); bolinhas[0].el.style.visibility = bolinhas[1].el.style.visibility = 'hidden';
  const pintarBolinhas = () => {
    for (const lado of [0, 1] as const) {
      const eq = b.lados[lado].equipe.filter((c) => !c.ovo);
      bolinhas[lado].definir(Array.from({ length: 6 }, (_, i) => { const v = eq[i] && vis.get(eq[i].uid); return !v ? 2 : v.vida <= 0 ? 1 : 0; }));
    }
  };
  const caixa = new CaixaTexto(4, 138, 312, 42); hud.append(caixa.el);
  tocavel(caixa.el, () => input.pulsar('a'));
  const posDe = (uid: string): Pos | null => { for (const lado of [0, 1] as const) for (let pos = 0; pos < 2; pos++) if (emCampo[lado][pos] === uid) return { lado, pos }; return null; };
  const atorDe = (p: Pos) => palco.ator(p.lado, p.pos);
  const tipoDe = (num: number) => (temEspecie(num) ? especie(num).tipos[0] : 'comum');

  /* ---------- fala ---------- */
  let fala: { fim: () => void; t: number; auto: number } | null = null;
  /** escreve na caixa sem esperar */
  const mostrar = (str: string) => { caixa.definir(str); caixa.el.style.visibility = ''; };
  /** escreve e espera: avança com A/B/toque ou sozinho depois de `auto` s */
  const dizer = (str: string, auto = 0.75): Promise<void> => new Promise((r) => { mostrar(str); fala = { fim: r, t: 0, auto }; });
  const esperarFala = (auto = 0.75): Promise<void> => new Promise((r) => { fala = { fim: r, t: 0, auto }; });

  /* ---------- menus ---------- */
  let modal: Modal | null = null;
  function abrir<T>(criar: (fechar: (v: T) => void) => Modal, pai: HTMLElement = hud): Promise<T> {
    return new Promise((r) => {
      input.limpar();
      const m = criar((v) => { if (modal !== m) return; m.el.remove(); modal = null; input.limpar(); r(v); });
      modal = m; pai.append(m.el);
    });
  }
  const simNao = (pergunta: string): Promise<boolean> => { mostrar(pergunta); caixa.completar(); return abrir<number>((f) => menuOpcoes({ opcoes: ['Sim', 'Não'], aoEscolher: f })).then((i) => i === 0); };

  /* ---------- barras e números ---------- */
  let andando = false; const numeros: { atualizar(dt: number): boolean }[] = [];
  const esperarBarras = async () => { await rel.dormir(0.05); await rel.ate(() => !andando); };
  const decor = new Map<string, Fx[]>();

  /* ---------- contexto das animações ---------- */
  const visiveis = (lado: 0 | 1) => [0, 1].filter((pos) => emCampo[lado][pos]).map((pos) => palco.ator(lado, pos));
  const ctx = (eu: Ator, alvos: Ator[]): Golpeio => ({ c: cena, eu, alvos, alvo: alvos[0] ?? eu, outro: visiveis(eu.lado === 0 ? 1 : 0)[0] ?? eu, d: eu.lado === 0 ? 1 : -1, som });
  async function animar(id: string, eu: Ator, alvos: Ator[] = [eu]) {
    const f = ANIMS[id]; if (!f || !eu.existe) return;
    try { await Promise.race([f(ctx(eu, alvos)), rel.dormir(2.4)]); } catch (e) { console.error('[batalha] animação falhou:', id, e); }
    cena.limparSegurados();
    for (const a of palco.atores.values()) { a.dx = a.dy = 0; a.branco = a.escuro = false; }
  }

  /* ---------- entradas e saídas ---------- */
  const cuiaDe = (uid: string) => { const id = inst.get(uid)?.cuia ?? 'cuia'; return temFx(id) ? id : 'cuia'; };
  /** cuia girando em arco de `de` até `para`; devolve o FX parado (aberto ou fechado) para quem chamou continuar */
  async function arremessar(idCuia: string, de: [number, number], para: [number, number], dur = 0.42, arco = 30): Promise<Fx> {
    const f = cena.fx(idCuia, de[0], de[1], { parado: true, quadro: 4 });
    som('cuia-arremesso');
    await rel.entre(dur, (k) => { f.x = Math.round(de[0] + (para[0] - de[0]) * k); f.y = Math.round(de[1] + (para[1] - de[1]) * k - Math.sin(k * Math.PI) * arco); f.quadro = 4 + (Math.floor(k * dur * 16) % 4); });
    f.quadro = 0; return f;
  }
  function definirBase(a: Ator, s: StatusId | null) { a.base(s === 'dormindo' || s === 'congelado' ? 'status' : 'idle'); }
  async function entrar(p: Pos, r: ResumoCriatura, modo: 'cuia' | 'selvagem' | 'pronto') {
    const a = atorDe(p); [a.x, a.y] = palco.apoio(p.lado, p.pos);
    const rara = !!inst.get(r.uid)?.rara;
    await palco.precarregarCriatura(r.especie, rara);
    if (modo !== 'pronto') a.definirCriatura(r.especie, rara);
    emCampo[p.lado][p.pos] = r.uid; vis.set(r.uid, { ...r });
    if (modo === 'cuia') {
      const t = palco.treinador[p.lado]; let de: [number, number];
      if (p.lado === 0 && t?.visivel) { void t.tocar('arremessar'); await rel.dormir(0.22); de = [t.x + 12, t.y - 40]; } else de = p.lado === 0 ? [-10, a.y - 20] : [330, a.y - 40];
      const f = await arremessar(cuiaDe(r.uid), de, [a.x, a.y - 18], 0.4, p.lado === 0 ? 34 : 22);
      f.quadro = 3; som('cuia-abrir'); cena.fx('cap-luz', a.x, a.y - 16);
      a.visivel = true; a.branco = true; await rel.dormir(0.14); f.remover(); a.branco = false;
    } else { a.visivel = true; a.escuro = false; }
    definirBase(a, r.status);
    if (rara) void brilhoRaro(a);
    som('entrada-criatura'); bus.emit('grito', r.especie);
    const cx = caixas[p.lado][p.pos]; cx.definir(r, tipoDe(r.especie), jaCapturadas.has(r.especie), rara);
    pintarBolinhas();
    if (a.tem('entrada') && r.status !== 'dormindo' && r.status !== 'congelado') await a.tocar('entrada'); else await rel.dormir(0.3);
  }
  /** Pelagem Rara (spec 10A-5): chuva de estrelas em volta da criatura ao entrar */
  async function brilhoRaro(a: Ator) {
    som('cuia-estrelas');
    const [cx, cy] = a.centro, r = Math.max(14, Math.round(a.alt * 0.55)), pontos: [number, number][] = [[-1, -0.7], [0.9, -1], [-0.4, 0.6], [1.1, 0.3], [0, -1.3], [-1.2, 0.1], [0.5, 0.9], [-0.8, -1.1]];
    cena.fx('cap-estrelas', cx, cy - 4);
    for (let volta = 0; volta < 2; volta++) for (const [dx, dy] of pontos) { cena.fx('st-brilho', cx + Math.round(dx * r * (volta ? 0.7 : 1)), cy + Math.round(dy * r * (volta ? 0.7 : 1))); await rel.dormir(0.05); }
    cena.fx('cap-estrelas', cx, cy - 4);
  }
  async function sair(p: Pos) {
    const a = atorDe(p); som('retorno-criatura');
    a.branco = true; await rel.dormir(0.1);
    await rel.entre(0.2, (k) => { a.opacidade = 1 - Math.round(k * 3) / 3; });
    a.visivel = false; a.opacidade = 1; a.branco = false;
    emCampo[p.lado][p.pos] = null; caixas[p.lado][p.pos].mostrar(false);
  }
  /** treinador desliza para fora (ou para dentro) da cena */
  async function deslizar(lado: 0 | 1, entrando: boolean, dur = 0.36) {
    const t = palco.treinador[lado]; if (!t) return;
    const base = palco.arena.apoios[lado ? 'inimigo' : 'jogador'].x, fora = lado === 0 ? -50 : 380;
    t.visivel = true;
    await rel.entre(dur, (k) => { t.x = Math.round(entrando ? fora + (base - fora) * k : base + (fora - base) * k); });
    if (!entrando) t.visivel = false;
  }

  /* ---------- reprodução dos eventos ---------- */
  let fila: EventoBatalha[] = [];
  /** se o próximo evento for uma mensagem, mostra-a já (para correr junto com a animação) */
  const adiantarMsg = (): boolean => { const e = fila[0]; if (e?.t !== 'msg') return false; fila.shift(); mostrar(e.texto); return true; };
  async function apanhar(a: Ator, forte: boolean) {
    void a.tocar('dano');
    const rec = a.lado === 1 ? 2 : -2;
    a.branco = true; a.dx = rec; await rel.dormir(0.07); a.branco = false;
    for (let i = 0; i < (forte ? 4 : 3); i++) { a.visivel = false; await rel.dormir(0.05); a.visivel = true; await rel.dormir(0.05); }
    a.dx = 0;
  }
  async function reproduzir(evs: EventoBatalha[]) {
    fila = [...evs, ...fila];
    while (fila.length) { const e = fila.shift()!; try { await evento(e); } catch (err) { console.error('[batalha] evento falhou:', e, err); } }
  }
  async function evento(e: EventoBatalha): Promise<void> {
    switch (e.t) {
      case 'msg': if (e.texto) await dizer(e.texto); return;
      case 'entra': {
        const ladoTreinador = e.lado === 1 && pedido.tipo === 'treinador';
        if (ladoTreinador && palco.treinador[1]?.visivel) await deslizar(1, false, 0.3);
        const temMsg = adiantarMsg();
        await entrar(e, e.criatura, e.lado === 0 || ladoTreinador ? 'cuia' : 'selvagem');
        if (e.lado === 0 && palco.treinador[0]?.visivel && !(fila[0]?.t === 'entra' && fila[0].lado === 0)) void deslizar(0, false);
        if (temMsg) await esperarFala(0.5);
        return;
      }
      case 'sai': await sair(e); return;
      case 'golpe': {
        const eu = atorDe(e), alvos = e.alvos.map(atorDe), g = temGolpe(e.golpe) ? defGolpe(e.golpe) : null;
        if (g) som('g-' + g.tipo);
        void eu.tocar(g?.cat === 'fisico' ? 'ataque-fisico' : 'ataque-especial');
        if (jogo.opcoes.animBatalha !== false) await animar(e.anim, eu, alvos);
        else { await rel.dormir(0.15); for (const a of alvos) if (a !== eu) cena.fx('comum-impacto', ...a.centro); await rel.dormir(0.15); }
        return;
      }
      case 'carga': {
        const a = atorDe(e);
        if (e.solta) { a.visivel = true; return; }
        som('carga'); cena.fx('comum-anel', ...a.centro, { atras: true }); await rel.dormir(0.3);
        if (e.some) { a.branco = true; await rel.dormir(0.08); a.branco = false; a.visivel = false; }
        return;
      }
      case 'errou': {
        const a = atorDe(e.alvo);
        if (e.motivo === 'protecao') { som('protecao'); const f = cena.fx('st-escudo', a.x + (a.lado === 0 ? 10 : -10), a.y - a.alt / 2, { segura: true }); await rel.dormir(0.4); f.remover(); }
        else if (e.motivo === 'imune') som('sem-efeito');
        else if (e.motivo === 'precisao') { som('errou'); const s = a.lado === 1 ? 1 : -1; await rel.entre(0.24, (k) => { a.dx = Math.round(Math.sin(k * Math.PI) * 7) * s; }); a.dx = 0; }
        else som('errou');
        return;
      }
      case 'dano': {
        const v = vis.get(e.uid), p = posDe(e.uid); if (v) { v.vida = e.para; v.vidaMax = e.max; }
        if (!p) return;
        const a = atorDe(p), cx = caixas[p.lado][p.pos], golpe = e.origem === 'golpe' || e.origem === 'confusao';
        if (golpe) som(e.eficacia > 1 ? 'golpe-forte' : e.eficacia < 1 ? 'golpe-fraco' : 'golpe-normal');
        if (e.eficacia > 1 && golpe) som('super-eficaz');
        if (e.critico) { som('critico'); hitStop(60); void cena.tremor(3, 0.28); input.vibrar(30, true); } else if (golpe && e.eficacia > 1) void cena.tremor(2, 0.18);
        if (jogo.opcoes.numerosDano && e.de > e.para) numeros.push(numeroDano(palco.mundo, a.x, a.y - a.alt - 10, e.de - e.para, e.critico ? 'amarelo' : 'branco'));
        cx.vida(e.para, e.max, true);
        await Promise.all([a.visivel ? apanhar(a, e.critico || e.eficacia > 1) : Promise.resolve(), esperarBarras()]);
        if (p.lado === 0 && e.para > 0 && e.para / e.max <= 0.2 && e.de / e.max > 0.2) som('vida-baixa');
        return;
      }
      case 'cura': {
        const v = vis.get(e.uid), p = posDe(e.uid); if (v) { v.vida = e.para; v.vidaMax = e.max; if (e.de <= 0) v.status = null; }
        pintarBolinhas();
        if (!p) { som('cura'); return; }
        const a = atorDe(p); som(e.para >= e.max ? 'cura-total' : 'cura');
        if (jogo.opcoes.numerosDano && e.para > e.de) numeros.push(numeroDano(palco.mundo, a.x, a.y - a.alt - 10, e.para - e.de, 'verde'));
        cena.fx('st-brilho', a.x - 8, a.y - a.alt / 2); cena.fx('st-cruz', a.x + 8, a.y - a.alt + 4, { fps: 6 });
        caixas[p.lado][p.pos].vida(e.para, e.max, true); await esperarBarras();
        return;
      }
      case 'status': {
        const v = vis.get(e.uid), p = posDe(e.uid); if (v) v.status = e.status;
        if (!p) return;
        const a = atorDe(p); caixas[p.lado][p.pos].status(e.status); definirBase(a, e.status);
        if (e.status) { som(SOM_STATUS[e.status]); await animar('status-' + e.status, a); } else { som('status-curado'); cena.fx('st-brilho', ...a.centro); await rel.dormir(0.2); }
        return;
      }
      case 'volatil': {
        const a = atorDe(e); if (!emCampo[e.lado][e.pos]) return;
        if (!e.ativo) { cena.fx('st-brilho', ...a.topo); await rel.dormir(0.15); return; }
        if (e.v === 'confuso') { som('status-confusao'); const f = cena.fx('st-confuso', a.x, a.y - a.alt - 2, { loop: true }); await rel.dormir(0.6); f.remover(); }
        else if (e.v === 'preso') await animar('armadilha', a);
        else if (e.v === 'semente') { cena.fx('mata-broto', a.x - 6, a.y + 2, { base: true }); cena.fx('mata-semente', ...a.centro); await rel.dormir(0.4); }
        return;
      }
      case 'estagio': { const a = atorDe(e); if (emCampo[e.lado][e.pos]) await animar(e.delta > 0 ? 'status-1' : 'status-2', a); return; }
      case 'clima': { palco.definirClima(e.clima); if (SOM_CLIMA[e.clima]) som(SOM_CLIMA[e.clima]); if (e.clima !== 'limpo') await cena.flash(e.clima === 'sol' ? '#fff07a' : e.clima === 'poeira' ? '#e0b080' : '#c8f0f4', 0.2, 0.4); return; }
      case 'campo': {
        const k = `${e.lado}:${e.efeito}`; for (const f of decor.get(k) ?? []) f.remover(); decor.delete(k);
        if (!e.ativo) return;
        const ap = palco.arena.apoios[e.lado ? 'inimigo' : 'jogador'], s = e.lado === 0 ? 1 : -1, fs: Fx[] = [];
        if (e.efeito === 'espinhos') for (const dx of [-26, 0, 26]) fs.push(cena.fx('st-espinho', ap.x + dx, ap.y + 6 + (dx ? 0 : 3), { base: true, fixo: true, atras: true }));
        else { som('protecao'); fs.push(cena.fx('st-barreira', ap.x + s * (34 + ['barreira-fisico', 'barreira-especial', 'barreira-status'].indexOf(e.efeito) * 7), ap.y - 22, { loop: true, atras: e.lado === 1 })); }
        decor.set(k, fs); await rel.dormir(0.3);
        return;
      }
      case 'anim': { if (emCampo[e.lado][e.pos]) await animar(e.anim, atorDe(e)); return; }
      case 'desmaio': {
        const v = vis.get(e.uid), p = posDe(e.uid); if (v) { v.vida = 0; v.status = null; }
        pintarBolinhas(); if (!p) return;
        const a = atorDe(p), temMsg = adiantarMsg();
        bus.emit('grito', { especie: v?.especie ?? a.especie, pitch: 0.8 });
        caixas[p.lado][p.pos].status('desmaiado');
        if (a.tem('desmaio')) await a.tocar('desmaio');
        som('desmaio');
        await rel.entre(0.3, (k) => { a.dy = Math.round(k * 6); a.opacidade = 1 - Math.round(k * 3) / 3; });
        a.visivel = false; a.opacidade = 1; a.dy = 0;
        if (temMsg) await esperarFala();
        emCampo[p.lado][p.pos] = null; caixas[p.lado][p.pos].mostrar(false);
        return;
      }
      case 'item': { const p = posDe(e.uid); if (p) await animar('item-cura', atorDe(p)); else { som('item-usar'); await rel.dormir(0.2); } return; }
      case 'exp': {
        const v = vis.get(e.uid), p = posDe(e.uid); if (!v) return; v.exp = e.para;
        if (!p || p.lado !== 0) return;
        const temMsg = adiantarMsg(); som('xp-barra');
        caixas[0][p.pos].exp(fracExp(v), true); await esperarBarras();
        if (temMsg) await esperarFala(0.5);
        return;
      }
      case 'nivel': {
        const v = vis.get(e.uid), p = posDe(e.uid); if (!v) return;
        const curva = especie(v.especie).crescimento;
        v.nivel = e.nivel; v.expNivel = expParaNivel(curva, e.nivel); v.expProx = expParaNivel(curva, Math.min(100, e.nivel + 1));
        if (v.vida > 0) v.vida = Math.min(e.depois.vida, v.vida + (e.depois.vida - e.antes.vida)); v.vidaMax = e.depois.vida;
        som('subir-nivel');
        const quadro = painel(104, 70, 'bt-nivel'); em(quadro.el, 212, 24);
        (Object.keys(NOME_ST) as Stat[]).forEach((s, i) => { quadro.miolo.append(em(texto(NOME_ST[s], { cor: 'tinta' }), 5, 4 + i * 10)); const t = texto(`${e.depois[s]} {c:verde}+${e.depois[s] - e.antes[s]}{/c}`, { cor: 'tinta' }); quadro.miolo.append(em(t, 98 - parseInt(t.style.width), 4 + i * 10)); });
        const temMsg = adiantarMsg();
        if (p && p.lado === 0) {
          const cx = caixas[0][p.pos]; cx.nivel(e.nivel); cx.vida(v.vida, v.vidaMax, false); cx.exp(0, false);
          hud.append(quadro.el);
          await animar('subir-nivel', atorDe(p));
          cx.exp(fracExp(v), true);
        } else hud.append(quadro.el);
        if (temMsg) await esperarFala(1.6); else await rel.dormir(1);
        quadro.el.remove();
        return;
      }
      case 'novo-golpe': som(e.esqueceu ? 'esquecer-golpe' : 'aprender-golpe'); return;
      case 'golpe-pendente': {
        const c = inst.get(e.uid); if (!c || !temGolpe(e.golpe)) return;
        const g = defGolpe(e.golpe), nome = vis.get(e.uid)?.nome ?? '';
        await dizer(`${nome} quer aprender ${g.nome}, mas já sabe quatro golpes.`, 1.6);
        for (;;) {
          if (!(await simNao(`Esquecer um golpe para aprender ${g.nome}?`))) { if (await simNao(`Desistir de aprender ${g.nome}?`)) { fila.unshift(...controle.aprender(e.uid, e.golpe, -1)); return; } continue; }
          caixa.el.style.visibility = 'hidden';
          const slot = await abrir<number>((f) => menuGolpeDe({ c, titulo: 'Qual golpe esquecer?', novo: e.golpe, aoEscolher: f }));
          caixa.el.style.visibility = '';
          if (slot >= 0 && slot < c.golpes.length) { await dizer('Um, dois e… pronto!', 0.6); fila.unshift(...controle.aprender(e.uid, e.golpe, slot)); return; }
        }
      }
      case 'evolucao-pendente': case 'oferta-troca': return;
      case 'captura': await captura(e); return;
      case 'fuga': {
        if (!e.sucesso) { som('fuga-falha'); return; }
        som('fuga');
        const fujoes = visiveis(e.lado), s = e.lado === 0 ? -1 : 1;
        await rel.entre(0.3, (k) => { for (const a of fujoes) a.dx = Math.round(k * 90) * s; });
        for (const a of fujoes) { a.visivel = false; a.dx = 0; }
        return;
      }
      case 'fim': await fim(e.resultado); return;
    }
  }

  /* ---------- captura ---------- */
  async function captura(e: Extract<EventoBatalha, { t: 'captura' }>) {
    const a = atorDe(e), idCuia = temFx(e.cuia) ? e.cuia : 'cuia', chao = a.y - 6;
    const f = await arremessar(idCuia, [34, 128], [a.x, a.y - a.alt / 2 - 6], 0.5, 44);
    if (!a.visivel) { await cena.mover(f, a.x + 30, chao + 20, 0.3); f.remover(); return; } // o alvo estava fora de alcance
    f.quadro = 3; som('cuia-abrir'); cena.fx('cap-luz', ...a.centro);
    a.branco = true; await rel.dormir(0.16);
    await rel.entre(0.16, (k) => { a.opacidade = 1 - Math.round(k * 3) / 3; });
    a.visivel = false; a.opacidade = 1; a.branco = false;
    f.quadro = 0; await rel.dormir(0.1);
    // cai, quica e assenta
    await cena.mover(f, a.x, chao, 0.2); som('cuia-quique');
    await cena.mover(f, a.x, chao, 0.22, 8); som('cuia-quique', { pitch: 1.2, vol: 0.6 });
    await cena.mover(f, a.x, chao, 0.12, 3);
    for (let i = 0; i < e.balancos; i++) {
      await rel.dormir(0.5);
      som('cuia-balanco');
      cena.fx('cap-folhas', a.x, chao - 4, { atras: true, fps: 14 });
      for (const q of [1, 0, 2, 0]) { f.quadro = q; f.x = a.x + (q === 1 ? -1 : q === 2 ? 1 : 0); await rel.dormir(0.09); }
    }
    await rel.dormir(0.55);
    if (e.sucesso) {
      if (pedido.tutorial) guiaDita = 'fim';
      som('cuia-sucesso'); bus.emit('jingle', 'captura');
      cena.fx('cap-estrelas', a.x, chao - 16); cena.fx('st-brilho', a.x - 12, chao - 6); cena.fx('st-brilho', a.x + 12, chao - 10);
      caixas[e.lado][e.pos].mostrar(false); emCampo[e.lado][e.pos] = null;
      const s = f; decor.set('cuia-capturada', [s]);
      await rel.dormir(0.7);
      return;
    }
    som('cuia-falha'); f.quadro = 3; cena.fx('cap-fumaca', a.x, chao - 6); cena.fx('cap-luz', ...a.centro);
    a.visivel = true; a.branco = true; await rel.dormir(0.14); f.remover(); a.branco = false;
    bus.emit('grito', a.especie);
    if (a.tem('entrada')) await a.tocar('entrada', 1.4); else await rel.dormir(0.2);
  }

  /* ---------- fim ---------- */
  let encerrando = false;
  async function fim(r: string) {
    const t = pedido.treinador, lider = t?.insignia !== undefined;
    if (r === 'vitoria') {
      bus.emit('musica', pedido.tipo === 'treinador' ? (lider ? 'vitoria-lider' : 'vitoria-treinador') : 'vitoria-selvagem');
      if (pedido.tipo === 'treinador' && palco.treinador[1]) {
        const a = palco.treinador[1]; a.base('derrota'); await deslizar(1, true, 0.4);
        if (t?.derrota) { bus.emit('babble', { voz: t.sprite, texto: t.derrota }); await dizer(t.derrota, 3.5); }
      }
    } else if (r === 'derrota') {
      bus.emit('musica', 'derrota');
      await rel.entre(0.5, (k) => { palco.penumbra.style.background = '#1a1423'; palco.penumbra.style.opacity = String(Math.round(k * 4) / 4 * 0.8); });
      await dizer(`${jogo.save.jogador.nome} ficou sem ação… Tudo escureceu!`, 2.2);
    }
  }
  async function encerramento() {
    encerrando = true;
    if (controle.resultado === 'captura' && b.capturada) {
      const c = b.capturada, nome = especie(c.especie).nome;
      if (!jaCapturadas.has(c.especie)) { som('diario-registro'); await dizer(`Os dados de ${nome} foram registrados no Diário de Campo.`, 2); }
      if (await simNao(`Quer dar um apelido a ${nome}?`)) {
        const apelido = (await pedirNome(`Apelido de ${nome}?`, 10, '')).trim();
        if (apelido && apelido !== nome) c.apelido = apelido;
      }
      const cheia = jogo.save.equipe.length >= 6, vaga = jogo.save.viveiro.some((cx) => cx.includes(null));
      await dizer(!cheia ? `${c.apelido || nome} entrou para a sua equipe!` : vaga ? `A equipe está cheia. ${c.apelido || nome} foi enviado ao Viveiro de Cuias.` : `A equipe e o Viveiro estão cheios! ${c.apelido || nome} não pôde ficar.`, 2.4);
    }
    caixa.mostrarSeta(false);
    await rel.entre(0.4, (k) => abrirCortina(1 - k));
    await rel.dormir(0.1);
    args.concluir();
  }

  /* ---------- decisões do jogador ---------- */
  function eficaciaConhecida(p: Pedido, idGolpe: string): InfoEficacia | null {
    const g = defGolpe(idGolpe); if (g.cat === 'status') return null;
    const alvos = b.adversarios(p).map((q) => b.criatura(q)!).filter((c) => jaVistas.has(c.especie));
    if (!alvos.length) return { texto: 'Eficácia: ?', cor: 'cinza' };
    const m = Math.max(...alvos.map((c) => eficaciaContra(g.tipo, especie(c.especie).tipos)));
    return m === 0 ? { texto: 'Sem efeito', cor: 'cinza' } : m > 1 ? { texto: 'Super eficaz!', cor: 'verde' } : m < 1 ? { texto: 'Pouco eficaz', cor: 'vermelho' } : { texto: 'Eficaz', cor: 'tinta' };
  }
  const motivoTroca = (i: number, reservados: number[], p?: Pos): true | string => {
    const c = b.lados[0].equipe[i];
    return c.ovo ? 'Um ovo não pode lutar.' : c.vida <= 0 ? 'Está desmaiada e não pode lutar.' : b.lados[0].ativos.includes(i) ? 'Já está em campo.' : reservados.includes(i) ? 'Já vai entrar em campo.' : p && b.vol(p).preso > 0 ? 'Quem está em campo está preso e não pode sair!' : true;
  };
  const telaEquipe = (titulo: string, pode: (i: number) => true | string, obrigatorio = false) => {
    hud.style.visibility = 'hidden';
    return abrir<number>((f) => menuEquipe({ equipe: b.lados[0].equipe, titulo, emCampo: b.lados[0].ativos.filter((i) => i >= 0 && b.lados[0].equipe[i]?.vida > 0), pode, obrigatorio, aoEscolher: f }), el).then((i) => { hud.style.visibility = ''; return i; });
  };
  /** modo tutorial (pedido.tutorial): guia de captura em dois passos — cansar com LUTAR, depois arremessar a cuia */
  let guiaDita = '';
  function faseTutorial(): 'lutar' | 'cuia' | null {
    if (!pedido.tutorial || !b.podeCapturar()) return null;
    const temCuia = Object.keys(b.lados[0].itens).some((id) => temItemDef(id) && defItem(id).uso?.cuia && b.lados[0].itens[id] > 0);
    if (!temCuia) return null;
    const alvo = b.ativosDe(1)[0], v = alvo && vis.get(b.criatura(alvo)!.uid);
    return v && v.vida / v.vidaMax > 0.5 ? 'lutar' : 'cuia';
  }
  async function escolherAcao(p: Pedido, podeVoltar: boolean, reservados: number[]): Promise<Acao | 'voltar'> {
    const c = b.criatura(p)!, nome = vis.get(c.uid)?.nome ?? '';
    for (;;) {
      const guia = faseTutorial();
      if (guia && guia !== guiaDita) { guiaDita = guia; await dizer(guia === 'lutar' ? 'Guia de captura, passo 1: escolha LUTAR e canse a criatura selvagem. Cansada, ela resiste menos à cuia.' : 'Passo 2: a criatura cansou! Abra a MOCHILA, vá ao bolso Cuias e arremesse uma cuia.', 4); }
      mostrar(`O que\n${nome} vai fazer?`); caixa.completar();
      const a = await abrir<string>((f) => { const m = menuAcao({ fugir: 'FUGIR', voltar: podeVoltar, aoEscolher: f }); em(m.el, 178, 135); return m; });
      if (a === 'voltar') return 'voltar';
      if (guia === 'lutar' && a !== 'lutar') { som('ui-erro'); await dizer('Ainda não: primeiro use LUTAR para cansar a criatura.', 2); continue; }
      if (guia === 'cuia' && a !== 'mochila') { som('ui-erro'); await dizer('Agora é a hora da cuia: abra a MOCHILA e escolha uma no bolso Cuias.', 2); continue; }
      if (a === 'lutar') {
        if (!b.golpesValidos(p).length) return { tipo: 'golpe', slot: -1 };
        caixa.el.style.visibility = 'hidden';
        const slot = await abrir<number>((f) => { const m = menuGolpes({ c, eficacia: (id) => eficaciaConhecida(p, id), aoEscolher: f }); em(m.el, 4, 135); return m; });
        caixa.el.style.visibility = '';
        if (slot < 0) continue;
        const adv = b.adversarios(p);
        if (dupla && defGolpe(c.golpes[slot].id).alvo === 'um' && adv.length > 1) {
          mostrar('Atacar quem?'); caixa.completar();
          const i = await abrir<number>((f) => menuAlvo({ alvos: adv.map(atorDe), camada: hud, aoEscolher: f }));
          if (i < 0) continue;
          return { tipo: 'golpe', slot, alvo: adv[i] };
        }
        return { tipo: 'golpe', slot };
      }
      if (a === 'mochila') {
        const motivo = pedido.tipo === 'treinador' ? 'Não se captura a criatura de outro treinador.' : !b.podeCapturar() ? 'Aqui não dá para arremessar cuias agora.' : '';
        const id = await abrir<string | null>((f) => menuMochila({ mochila: b.lados[0].itens, podeCuia: !motivo, motivoCuia: motivo, aoEscolher: f }));
        if (!id || !temItemDef(id)) continue;
        const u = defItem(id).uso ?? {};
        if (guia === 'cuia' && !u.cuia) { som('ui-erro'); await dizer('Esse não: escolha uma cuia no bolso Cuias.', 2); continue; }
        if (u.cuia) return { tipo: 'item', item: id };
        const alvo = await telaEquipe(`USAR ${defItem(id).nome.toUpperCase()}`, (i) => (b.itemServe(0, id, i) ? true : 'Não teria efeito.'));
        if (alvo < 0) continue;
        if (u.pg && !u.pgTodos) {
          const slot = await abrir<number>((f) => menuGolpeDe({ c: b.lados[0].equipe[alvo], titulo: 'Recuperar PG de qual golpe?', aoEscolher: f }));
          if (slot < 0) continue;
          if (!b.itemServe(0, id, alvo, slot)) { await dizer('Esse golpe já está com todo o PG.', 1.2); continue; }
          return { tipo: 'item', item: id, alvo, slot };
        }
        return { tipo: 'item', item: id, alvo };
      }
      if (a === 'equipe') {
        const i = await telaEquipe('TROCAR POR QUEM?', (j) => motivoTroca(j, reservados, p));
        if (i < 0) continue;
        return { tipo: 'troca', para: i };
      }
      if (pedido.tipo === 'treinador') { som('ui-erro'); await dizer('Não dá para fugir de uma batalha contra treinador!', 1.4); continue; }
      if (!b.podeFugir()) { som('ui-erro'); await dizer('Não dá para fugir desta batalha!', 1.4); continue; }
      return { tipo: 'fuga' };
    }
  }
  async function escolherAcoes(): Promise<Record<number, Acao>> {
    const peds = controle.pedidosJogador(), acoes: Record<number, Acao> = {};
    let i = 0;
    while (i < peds.length) {
      const reservados = Object.values(acoes).filter((a): a is Extract<Acao, { tipo: 'troca' }> => a.tipo === 'troca').map((a) => a.para);
      const r = await escolherAcao(peds[i], i > 0, reservados);
      if (r === 'voltar') { i--; delete acoes[peds[i].pos]; continue; }
      acoes[peds[i].pos] = r; i++;
      if (r.tipo === 'fuga') break;
    }
    caixa.limpar();
    return acoes;
  }
  async function escolherSubstitutos(): Promise<Record<number, number>> {
    const escolhas: Record<number, number> = {};
    for (const p of controle.pedidosJogador()) {
      const i = await telaEquipe('QUEM ENTRA EM CAMPO?', (j) => motivoTroca(j, Object.values(escolhas)), true);
      escolhas[p.pos] = i;
    }
    return escolhas;
  }

  /* ---------- roteiro ---------- */
  async function abertura(evs: EventoBatalha[]): Promise<EventoBatalha[]> {
    const t = pedido.treinador, avatar = jogo.save.jogador.avatar;
    abrirCortina(0); palco.definirDolly(1);
    await Promise.all([palco.carregar(pedido.arena), precarregarFx(), ...pedido.inimigos.map((c) => palco.precarregarCriatura(c.especie, !!c.rara)), ...jogo.save.equipe.map((c) => palco.precarregarCriatura(c.especie, !!c.rara))]);
    if (!pedido.musica && !t?.musica) bus.emit('musica', pedido.tipo === 'lendario' ? 'batalha-lendario' : pedido.tipo === 'treinador' ? (t?.insignia !== undefined ? 'batalha-lider' : 'batalha-treinador') : 'batalha-selvagem');
    if (vista(avatar, 'costas')) palco.criarTreinador(0, avatar);
    if (pedido.tipo === 'treinador' && t && vista(t.sprite, 'batalha')) palco.criarTreinador(1, t.sprite);
    // selvagens entram junto com a abertura, como vultos, e se revelam quando a cortina termina de abrir
    const selvagens = pedido.tipo === 'treinador' ? [] : evs.filter((e): e is Extract<EventoBatalha, { t: 'entra' }> => e.t === 'entra' && e.lado === 1 && !!e.inicial);
    const vultos = selvagens.map((e) => { const a = atorDe(e); a.definirCriatura(e.criatura.especie, !!inst.get(e.criatura.uid)?.rara); a.escuro = true; a.visivel = true; return a; });
    const bases = vultos.map((a) => a.x);
    if (pedido.tipo === 'lendario') som('lendario-aparece');
    await rel.entre(0.7, (k) => {
      abrirCortina(Math.min(1, k * 1.6)); palco.definirDolly(1 - k);
      for (const lado of [0, 1] as const) { const tr = palco.treinador[lado]; if (tr) { const base = palco.arena.apoios[lado ? 'inimigo' : 'jogador'].x; tr.x = Math.round(base + (lado === 0 ? -1 : 1) * 120 * (1 - k)); } }
      vultos.forEach((a, i) => { a.x = Math.round(bases[i] + 120 * (1 - k)); });
    });
    palco.definirDolly(0);
    if (pedido.tipo === 'treinador') { pintarBolinhas(); bolinhas[1].el.style.visibility = ''; }
    for (const e of selvagens) await entrar(e, e.criatura, 'pronto');
    pintarBolinhas(); bolinhas[0].el.style.visibility = '';
    if (b.clima !== 'limpo') palco.definirClima(b.clima);
    return evs.filter((e) => !selvagens.includes(e as never));
  }
  async function roteiro() {
    const evs = await abertura(controle.iniciar());
    await reproduzir(evs);
    let guarda = 0;
    while (!controle.terminou && ++guarda < 3000) {
      if (controle.fase === 'acoes') await reproduzir(controle.agir(await escolherAcoes()));
      else if (controle.fase === 'substituir') await reproduzir(controle.substituir(await escolherSubstitutos()));
      else if (controle.fase === 'oferta') {
        let para: number | null = null;
        if (await simNao('Quer trocar de criatura?')) { const i = await telaEquipe('TROCAR POR QUEM?', (j) => motivoTroca(j, [])); if (i >= 0) para = i; }
        await reproduzir(controle.responderOferta(para));
      } else break;
    }
    await encerramento();
  }

  const tela: Tela = {
    el,
    entrar() { roteiro().catch((e) => { console.error('[batalha] a tela falhou', e); if (encerrando || controle.terminou) { args.concluir(); return; } /* termina sem tela para não prender o jogo */ void import('../index').then((m) => { m.pilotoPadrao(controle); args.concluir(); }); }); },
    sair() { cena.limpar(); rel.limpar(); },
    atualizar(dt) {
      palco.atualizar(dt);
      andando = false; for (const l of caixas) for (const c of l) if (c.atualizar(dt)) andando = true;
      for (const n of [...numeros]) if (n.atualizar(dt)) numeros.splice(numeros.indexOf(n), 1);
      if (modal) { modal.atualizar(dt); return; }
      const pressa = input.segurando('a') || input.segurando('b');
      caixa.atualizar(dt, pressa);
      if (fala && caixa.completa) {
        fala.t += dt;
        const aperto = input.apertou('a') || input.apertou('b');
        if (!caixa.ultimaPagina) { caixa.mostrarSeta(true); if (aperto || fala.t >= fala.auto + 0.6) { input.consumir('a'); input.consumir('b'); caixa.proxima(); fala.t = 0; } }
        else if (aperto || fala.t >= (pressa ? 0.15 : fala.auto)) { input.consumir('a'); input.consumir('b'); const f = fala.fim; fala = null; f(); }
      }
    },
    desenhar() { palco.desenhar(); },
  };
  return tela;
}
