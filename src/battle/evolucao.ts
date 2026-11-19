/**
 * TELA 'evolucao' — só a cinemática: silhueta branca pulsando entre as duas formas, anéis e partículas de luz,
 * explosão de luz e a forma nova com o grito. B cancela enquanto a silhueta pulsa. Chama `args.concluir(cancelou)`.
 */
import { bus } from '../core/events';
import { input, tocavel } from '../core/input';
import type { Tela } from '../ui/telas';
import { CaixaTexto } from '../ui/dialogo';
import type { ArgsTelaEvolucao } from './index';
import { especie, nomeDe, temEspecie } from './criatura';
import { Cena, precarregarFx } from './view/cena';
import { Ator, div } from './view/palco';

const som = (id: string) => bus.emit('sfx', { id });

export function criarTelaEvolucao(args: ArgsTelaEvolucao): Tela {
  const el = document.createElement('div'); el.className = 'tela evolucao';
  const mundo = div('bt-mundo', el), fundo = div('ev-fundo', mundo), sombras = div('bt-sombras', mundo), tras = div('bt-fx', mundo), atores = div('bt-atores', mundo), frente = div('bt-fx bt-fx-frente', mundo);
  const veu = div('bt-veu', el), penumbra = div('bt-penumbra', mundo);
  const cena = new Cena(tras, frente, mundo, veu, penumbra), rel = cena.rel;
  const caixa = new CaixaTexto(4, 138, 312, 42); el.append(caixa.el); tocavel(caixa.el, () => input.pulsar('a'));
  const nome = nomeDe(args.criatura), nomeNovo = temEspecie(args.para) ? especie(args.para).nome : '???';
  const X = 160, Y = 112;
  const velha = new Ator(1, 0, atores, sombras, '#0b0818'), nova = new Ator(1, 1, atores, sombras, '#0b0818');
  velha.definirCriatura(args.de); nova.definirCriatura(args.para);
  for (const a of [velha, nova]) { a.x = X; a.y = Y; }
  velha.visivel = true;

  let fala: { fim: () => void; t: number; auto: number } | null = null, podeCancelar = false, cancelou = false, feito = false;
  const dizer = (str: string, auto: number): Promise<void> => new Promise((r) => { caixa.definir(str); fala = { fim: r, t: 0, auto }; });
  const concluir = (c: boolean) => { if (feito) return; feito = true; args.concluir(c); };

  async function roteiro() {
    await precarregarFx();
    await rel.entre(0.4, (k) => { el.style.opacity = String(Math.round(k * 4) / 4); });
    bus.emit('musica', 'evolucao');
    await dizer(`O quê?\n${nome} está evoluindo!`, 1.6);
    som('evolucao');
    velha.branco = nova.branco = true;
    fundo.classList.add('aceso');
    podeCancelar = true;
    // pulsa entre as duas silhuetas, cada vez mais depressa
    let passo = 0.42, t = 0, mostraNova = false, proxAnel = 0;
    const raios = cena.fx('evo-raios', X, Y - 30, { loop: true, atras: true, fps: 6 }); raios.opacidade = 0.35;
    while (t < 4.2 && !cancelou) {
      mostraNova = !mostraNova; velha.visivel = !mostraNova; nova.visivel = mostraNova;
      if (t >= proxAnel) { cena.fx('evo-anel', X, Y - 4, { atras: true }); proxAnel = t + 0.7; }
      for (let i = 0; i < 2; i++) cena.voar('evo-particula', [X + cena.var(46), Y - 4 - cena.var(6)], [X + cena.var(30), Y - 70 - cena.var(10)], 0.5 + cena.acaso() * 0.3);
      await rel.dormir(passo); t += passo; passo = Math.max(0.07, passo * 0.86);
      raios.opacidade = Math.min(1, 0.35 + t * 0.16);
    }
    podeCancelar = false; raios.remover();
    if (cancelou) {
      som('evolucao-cancelada');
      nova.visivel = false; velha.visivel = true; velha.branco = false; fundo.classList.remove('aceso');
      await dizer(`Hã? ${nome} parou de evoluir!`, 2.4);
      await rel.entre(0.3, (k) => { el.style.opacity = String(1 - Math.round(k * 4) / 4); });
      concluir(true); return;
    }
    // explosão de luz
    velha.visivel = false; nova.visivel = true;
    cena.fx('evo-raios', X, Y - 30, { atras: true, fps: 12 }); cena.fx('cap-luz', X, Y - 30); cena.fx('evo-anel', X, Y - 4);
    for (let i = 0; i < 10; i++) { const ang = (i / 10) * Math.PI * 2; cena.voar('evo-particula', [X, Y - 30], [Math.round(X + Math.cos(ang) * 70), Math.round(Y - 30 + Math.sin(ang) * 44)], 0.5); }
    void cena.tremor(3, 0.4);
    await cena.flash('#ffffff', 0.5, 1);
    nova.branco = false; fundo.classList.remove('aceso'); fundo.classList.add('novo');
    bus.emit('grito', args.para); bus.emit('jingle', 'vitoria-lider');
    if (nova.tem('entrada')) await nova.tocar('entrada');
    for (const dx of [-28, 24, -8]) { cena.fx('st-brilho', X + dx, Y - 50 + (dx % 9)); await rel.dormir(0.12); }
    await dizer(`Parabéns! ${nome} evoluiu para ${nomeNovo}!`, 4);
    await rel.entre(0.3, (k) => { el.style.opacity = String(1 - Math.round(k * 4) / 4); });
    concluir(false);
  }

  el.style.opacity = '0';
  return {
    el,
    entrar() { roteiro().catch((e) => { console.error('[evolucao] a tela falhou', e); concluir(false); }); },
    sair() { cena.limpar(); rel.limpar(); },
    atualizar(dt) {
      velha.atualizar(dt); nova.atualizar(dt); cena.tique(dt);
      if (podeCancelar && input.apertou('b')) { input.consumir('b'); cancelou = true; }
      caixa.atualizar(dt, input.segurando('a'));
      if (fala && caixa.completa) {
        fala.t += dt;
        if (input.apertou('a') || fala.t >= fala.auto) { input.consumir('a'); const f = fala.fim; fala = null; f(); }
      }
    },
    desenhar() { velha.desenhar(); nova.desenhar(); cena.desenhar(); },
  };
}
