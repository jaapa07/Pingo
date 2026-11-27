/**
 * BATALHA DE SAFÁRI (spec 10A item 33) — tela própria `safari-encontro`, sem golpes e sem mexer no motor de batalha.
 * Reaproveita o palco da batalha (arena em camadas, sombras, FX) e a fórmula de captura do motor
 * (`valorCaptura`/`tentarCaptura`), com as regras do parque em src/data/safari.ts (REGRA):
 *   CUIA (Cuia-Safári) · ISCA (come: foge menos, pega pior) · PEDRA (brava: pega melhor, foge mais) · PERTO · FUGIR.
 * Args `{ especie, nivel, arena, setor }`; devolve `{ resultado: 'captura' | 'fuga' | 'fugiu' | 'sem-cuias', criatura? }`.
 * Teclado (setas, A, B) e toque (botões do menu e "toque para seguir" na caixa de texto).
 */
import '../../styles/batalha.css';
import '../../styles/gincana.css';
import type { CriaturaInst } from '../../core/tipos';
import { jogo, qtdItem, tirarItem, marcarVisto, marcarCapturado, receberCriatura, flag, setFlag } from '../../core/estado';
import { rng } from '../../core/rng';
import { bus } from '../../core/events';
import { input, tocavel } from '../../core/input';
import { vista } from '../../core/assets';
import { criarCriatura, atributos, especie as especieDe } from '../../battle/index';
import { valorCaptura, tentarCaptura } from '../../battle/engine';
import { Palco } from '../../battle/view/palco';
import { precarregarFx, temFx } from '../../battle/view/cena';
import { SAFARI, REGRA, SETORES } from '../../data/safari';
import { registrarTela, type Tela } from '../telas';
import { registrarComando } from '../../world/registro';
import { item as itemDef } from '../../data/itens';
import { falar, avisar } from '../dialogo';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, botao, cursorMao, som } from '../kit';
import { sexoTxt } from './comum';
import { tr } from '../../i18n';

export interface ArgsSafari { especie: number; nivel: number; arena?: string; setor?: number }
export interface ResultadoSafari { resultado: 'captura' | 'fuga' | 'fugiu' | 'sem-cuias'; criatura?: CriaturaInst; destino?: string }

function criarSafari(args: ArgsSafari): Tela {
  const c = criarCriatura(args.especie, args.nivel), e = especieDe(args.especie);
  const vidaMax = atributos(c).vida; c.vida = vidaMax;
  const el = elTela('ui', 'tela-safari');
  const palco = new Palco(false); el.append(palco.el);
  const cena = palco.cena, rel = cena.rel;
  // caixa da criatura
  const cx = moldura('tinta', 136, 32, 4, 4); el.append(cx);
  const tNome = texto(tr('{nome} {n} {c:amarelo}Nv {nivel}{/c}', { nome: e.nome, n: sexoTxt(c), nivel: c.nivel }), { cor: 'creme', sombra: true }); cx.append(em(tNome, 6, 5));
  const tEst = texto('', { cor: 'cinza', sombra: true }); cx.append(em(tEst, 6, 17));
  const setor = SETORES.find((s) => s.n === args.setor);
  if (setor) { const ps = moldura('placa', 120, 15, 196, 4); ps.append(em(texto(setor.nome, { cor: 'amarelo', sombra: true, largura: 112, alinhar: 'centro' }), 4, 4)); el.append(ps); }
  // caixa de texto e menu
  const caixa = moldura('texto', 196, 48, 0, 132); el.append(caixa);
  const tMsg = texto('', { cor: 'tinta', largura: 178, entrelinha: 11 }); caixa.append(em(tMsg, 9, 8));
  const menu = moldura('tinta', 124, 48, 196, 132); menu.classList.add('sf-menu'); el.append(menu);
  const ROT = ['CUIA', 'ISCA', 'PEDRA', 'PERTO', 'FUGIR'];
  const bts = ROT.map((r, i) => { const b = botao(r, i === 0 ? 112 : 55); menu.append(em(b.el, i === 0 ? 6 : i % 2 ? 6 : 63, i === 0 ? 4 : i < 3 ? 18 : 32)); tocavel(b.el, () => { if (pronto) { sel = i; pintarMenu(); void agir(i); } }, () => { if (pronto) { sel = i; pintarMenu(); } }); return b; });
  const tCuias = texto('', { cor: 'marrom' }); bts[0].el.append(tCuias);
  const mao = cursorMao(); menu.append(mao);
  let sel = 0, pronto = false, fim = false, comendo = 0, raiva = 0, perto = 0, esperaA: (() => void) | null = null;
  const pintarMenu = () => {
    bts.forEach((b, i) => b.definirFoco(i === sel && pronto));
    escrever(tCuias, `×${qtdItem(SAFARI.item)}`); em(tCuias, 96 - parseInt(tCuias.style.width), 3);
    const r = [[6, 4], [6, 18], [63, 18], [6, 32], [63, 32]][sel];
    em(mao, r[0] - 8, r[1] + 1); mao.style.visibility = pronto ? '' : 'hidden';
  };
  const pintarEstado = () => {
    const est = comendo > 0 ? '{c:verde}Comendo{/c}' : raiva > 0 ? '{c:vermelho}Brava{/c}' : 'Atenta';
    escrever(tEst, tr('{est}   Perto {perto}/2', { est, perto }));
  };
  /** mostra uma mensagem; espera A/toque (ou some sozinha em `auto` s) */
  const msg = (s: string, auto = 0): Promise<void> => {
    escrever(tMsg, s); bus.emit('babble', { voz: 'narrador', texto: s });
    return new Promise((ok) => {
      let feito = false; const fim = () => { if (!feito) { feito = true; esperaA = null; ok(); } };
      esperaA = fim; if (auto > 0) void rel.dormir(auto).then(fim);
    });
  };
  tocavel(caixa, () => esperaA?.());
  const a = () => palco.ator(1, 0), treino = () => palco.treinador[0];

  async function lancar(id: string, alvo: [number, number], arco = 30, dur = 0.42) {
    const ok = temFx(id) ? id : 'cuia';
    const de: [number, number] = [70 + perto * 12, 118 - perto * 6];
    const f = cena.fx(ok, de[0], de[1], { parado: true, quadro: 0 });
    await rel.entre(dur, (k) => { f.x = Math.round(de[0] + (alvo[0] - de[0]) * k); f.y = Math.round(de[1] + (alvo[1] - de[1]) * k - Math.sin(k * Math.PI) * arco); });
    return f;
  }
  async function jogarCuia(): Promise<boolean> {
    if (!tirarItem(SAFARI.item, 1)) { await msg('Acabaram as Cuias-Safári!'); return false; }
    pintarMenu();
    void treino()?.tocar('arremessar');
    som('cuia-arremesso');
    const al = a(), chao = al.y - 6;
    await msg('Você arremessou a Cuia-Safári!', 0.5);
    const f = await lancar('cuia', [al.x, al.y - al.alt / 2 - 6], 44, 0.5);
    f.quadro = 3; som('cuia-abrir'); cena.fx('cap-luz', ...al.centro);
    al.branco = true; await rel.dormir(0.16); al.visivel = false; al.branco = false; f.quadro = 0;
    await cena.mover(f, al.x, chao, 0.2); som('cuia-quique'); await cena.mover(f, al.x, chao, 0.22, 8);
    // a fórmula do motor: vida cheia (no safári não se luta), bônus da cuia × pedra/isca/aproximação
    const fator = (raiva > 0 ? REGRA.pedraCaptura : 1) * (comendo > 0 ? REGRA.iscaCaptura : 1) * REGRA.pertoCaptura[perto];
    const base = valorCaptura(vidaMax, vidaMax, e.taxaCaptura, REGRA.bonusCuia, 1);
    const r = tentarCaptura(Math.max(1, Math.floor(base * fator)));
    for (let i = 0; i < r.balancos; i++) {
      await rel.dormir(0.45); som('cuia-balanco'); cena.fx('cap-folhas', al.x, chao - 4, { atras: true, fps: 14 });
      for (const q of [1, 0, 2, 0]) { f.quadro = q; f.x = al.x + (q === 1 ? -1 : q === 2 ? 1 : 0); await rel.dormir(0.09); }
    }
    await rel.dormir(0.45);
    if (r.sucesso) {
      som('cuia-sucesso'); bus.emit('jingle', 'captura');
      cena.fx('cap-estrelas', al.x, chao - 16); cena.fx('st-brilho', al.x - 12, chao - 6);
      await msg(tr('Parceria firmada! {nome} agora anda com você.', { nome: e.nome }));
      return true;
    }
    som('cuia-falha'); f.quadro = 3; cena.fx('cap-fumaca', al.x, chao - 6);
    al.visivel = true; al.branco = true; await rel.dormir(0.14); f.remover(); al.branco = false;
    bus.emit('grito', { especie: e.num });
    await msg(['Ah, não! Escapou da cuia!', 'Puxa! Parecia que ia dar certo!', 'Quase! Faltou tão pouco!', 'Aaah! Foi por um triz!'][r.balancos]);
    return false;
  }
  async function agir(i: number) {
    if (!pronto || fim) return; pronto = false; pintarMenu(); som('ui-ok');
    const al = a();
    if (i === 4) { await msg('Você se afastou devagarinho e deixou a criatura em paz.'); return terminar({ resultado: 'fuga' }); }
    if (i === 0) {
      if (await jogarCuia()) return capturar();
      if (!qtdItem(SAFARI.item)) { await msg('Sem Cuias-Safári, o passeio acaba aqui.'); return terminar({ resultado: 'sem-cuias' }); }
    } else if (i === 1) {
      void treino()?.tocar('arremessar');
      const f = await lancar('mata-semente', [al.x - 14, al.y - 4], 26, 0.4); f.remover();
      comendo = rng.int(1, 5); raiva = 0; pintarEstado();
      cena.fx('st-brilho', al.x - 10, al.y - 10);
      await msg(tr('Você jogou uma isca de capim-doce. {nome} está comendo!', { nome: e.nome }));
    } else if (i === 2) {
      void treino()?.tocar('arremessar');
      const f = await lancar('pedra-lasca', [al.x, al.y - al.alt + 6], 20, 0.35); f.remover();
      cena.fx('fis-impacto', al.x, al.y - al.alt + 6); al.branco = true; void al.tocar('dano'); await rel.dormir(0.12); al.branco = false;
      raiva = rng.int(1, 5); comendo = 0; pintarEstado();
      await msg(tr('Você jogou uma pedrinha. {nome} ficou brava!', { nome: e.nome }));
    } else {
      if (perto >= 2) await msg('Mais perto que isso, só fazendo carinho.');
      else {
        perto++; const t = treino();
        if (t) await rel.entre(0.4, (k) => { t.dx = Math.round((perto - 1 + k) * 12); t.dy = Math.round(-(perto - 1 + k) * 6); });
        pintarEstado();
        await msg(perto === 2 ? 'Você chegou bem pertinho, sem fazer barulho…' : 'Você deu uns passos à frente, devagar…');
      }
    }
    // vez da criatura
    const vel = atributos(c).vel;
    const fuga = Math.max(REGRA.fugaMin, Math.min(REGRA.fugaMax, ((vel + 30) / 640) * (comendo > 0 ? REGRA.iscaFuga : 1) * (raiva > 0 ? REGRA.pedraFuga : 1) * REGRA.pertoFuga[perto]));
    if (rng.chance(fuga)) {
      som('fuga'); await rel.entre(0.35, (k) => { al.dx = Math.round(k * 90); al.opacidade = 1 - Math.round(k * 3) / 3; });
      al.visivel = false; await msg(tr('{nome} fugiu!', { nome: e.nome })); return terminar({ resultado: 'fugiu' });
    }
    if (comendo > 0 && --comendo === 0) await msg(tr('{nome} terminou de comer e olha em volta.', { nome: e.nome }), 1.2);
    else if (raiva > 0 && --raiva === 0) await msg(tr('{nome} se acalmou.', { nome: e.nome }), 1.2);
    else if (comendo > 0) await msg(tr('{nome} continua comendo.', { nome: e.nome }), 0.9);
    else if (raiva > 0) await msg(tr('{nome} está de olho em você!', { nome: e.nome }), 0.9);
    else await msg(tr('{nome} espera, atenta.', { nome: e.nome }), 0.9);
    pintarEstado(); pedirAcao();
  }
  function pedirAcao() { pronto = true; escrever(tMsg, tr('O que fazer com {nome}?', { nome: e.nome })); pintarMenu(); }
  function capturar() {
    const s = jogo.save;
    c.cuia = SAFARI.item; c.treinadorOriginal = s.jogador.nome; c.localCaptura = s.jogador.zona; c.nivelCaptura = c.nivel;
    marcarCapturado(c.especie);
    const destino = receberCriatura(c);
    return terminar({ resultado: 'captura', criatura: c, destino });
  }
  function terminar(r: ResultadoSafari) { fim = true; pronto = false; pintarMenu(); fechar(tela, r); }

  const tela: Tela = {
    el,
    async entrar() {
      await Promise.all([palco.carregar(args.arena ?? 'cerrado'), precarregarFx(), palco.precarregarCriatura(c.especie)]);
      const al = a(); al.definirCriatura(c.especie); al.visivel = true;
      const av = jogo.save.jogador.avatar;
      if (vista(av, 'costas')) { const t = palco.criarTreinador(0, av); t.x = 70; t.y = 136; }
      marcarVisto(c.especie);
      bus.emit('grito', { especie: c.especie });
      if (al.tem('entrada')) void al.tocar('entrada');
      pintarEstado(); pintarMenu();
      await msg(tr('Apareceu no capim: {nome} selvagem!', { nome: e.nome }));
      pedirAcao();
    },
    atualizar(dt) {
      palco.atualizar(dt);
      if (esperaA && (input.apertou('a') || input.apertou('b'))) { esperaA(); return; }
      if (!pronto) return;
      const L = [[0, 0], [1, 2], [3, 4]];
      const lin = L.findIndex((l) => l.includes(sel)), col = L[lin].indexOf(sel);
      let novo = sel;
      if (input.apertou('cima')) novo = L[Math.max(0, lin - 1)][Math.min(col, L[Math.max(0, lin - 1)].length - 1)];
      if (input.apertou('baixo')) novo = L[Math.min(2, lin + 1)][Math.min(col, L[Math.min(2, lin + 1)].length - 1)];
      if (input.apertou('esq') && L[lin].length > 1) novo = L[lin][0];
      if (input.apertou('dir') && L[lin].length > 1) novo = L[lin][1];
      if (novo !== sel) { sel = novo; som('ui-mover'); pintarMenu(); }
      if (input.apertou('a')) void agir(sel);
      else if (input.apertou('b')) { sel = 4; pintarMenu(); }
    },
    desenhar() { palco.desenhar(); },
  };
  return tela;
}
registrarTela('safari-encontro', criarSafari);

/* ------------------------------ o dono do parque ------------------------------ */
const DONO = { nome: 'Seu Jatobá', retrato: 'npc-idoso' };
const DICA: Record<string, string> = {
  'pedra-de-rio': 'Pedra de rio, lisinha, de correnteza. Um pescador da Trilha dos Cipós vive juntando seixo na beira do rio.',
  'muda-de-buriti': 'Muda de buriti. A viveirista de Vila Buriti tem canteiro de muda perto das hortas.',
  'tronco-oco': 'Tronco oco, caído e seco. O lenhador da Estrada do Buriti só corta árvore que já caiu.',
};
registrarComando('safariDono', async () => {
  if (!flag('safari-dono-conheceu')) {
    setFlag('safari-dono-conheceu');
    await falar('Ora, visita! Eu sou o Jatobá. Comprei um pasto cansado e estou devolvendo ele para os bichos, setor por setor.', DONO);
    await falar('A Vereda dos Buritis já está pronta. Para os outros três setores, preciso de material que só se acha pela Costa do Sol.', DONO);
  }
  let pend = SETORES.filter((s) => s.objeto && !flag(s.flag));
  while (pend.length && qtdItem(pend[0].objeto!)) {
    const s = pend[0], obj = s.objeto!;
    await falar(tr('Isso é {obj}! Me dá aqui!', { obj: itemDef(obj).nome }), DONO);
    tirarItem(obj, 1); setFlag(s.flag); setFlag(`safari-${obj}-entregue`); som('insignia');
    await falar(s.pedido, DONO);
    avisar(tr('Setor aberto: {nome}', { nome: s.nome }));
    pend = SETORES.filter((x) => x.objeto && !flag(x.flag));
  }
  if (!pend.length) { await falar(tr('O parque está completo: Vereda, Lagoa, Mata e Toca. Já foram {n} parcerias firmadas aqui por você. Obrigado, Campeão!', { n: Number(flag('safari-capturas') ?? 0) }), DONO); return; }
  const prox = pend[0], outro = pend.slice(1).find((s) => qtdItem(s.objeto!));
  if (outro) await falar(tr('{objeto}? Guarde, que é para depois! Primeiro preciso de {proximo} para {setor}.', { objeto: itemDef(outro.objeto!).nome, proximo: itemDef(prox.objeto!).nome, setor: prox.nome }), DONO);
  else await falar(tr('O próximo setor é {setor}. Para ele eu preciso de: {objeto}', { setor: prox.nome, objeto: DICA[prox.objeto!] ?? itemDef(prox.objeto!).nome }), DONO);
});
registrarComando('safariMaquete', async () => {
  const linhas = SETORES.map((s) => !s.objeto || flag(s.flag) ? tr('{setor}: aberto', { setor: s.nome }) : tr('{setor}: falta {objeto}', { setor: s.nome, objeto: itemDef(s.objeto).nome }));
  await falar(tr('A maquete do parque, de barro e palitinho:\n{linhas}', { linhas: linhas.slice(0, 2).join('\n') }));
  await falar(linhas.slice(2).join('\n'));
});
