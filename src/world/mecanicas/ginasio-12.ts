/**
 * Ginásio 12 (Ginga, B5) — roda de capoeira: duelos no ritmo do berimbau (minijogo).
 * Cada roda tem um camarada parado na passagem da parede. O jogo é por voltas: o berimbau dá a entrada (duas batidas),
 * o camarada "chama" uma sequência de golpes, uma seta por batida, e depois de uma batida de pausa o jogador responde
 * com as mesmas setas, cada uma dentro da janela da sua batida. Seta errada, fora do tempo ou batida sem resposta é
 * tropeço; mais de um tropeço na volta e a roda recomeça. Vencidas as voltas, o camarada abre a passagem.
 * O estado do minijogo fica também em atributos `data-roda-*` do marcador de batida (leitura para testes).
 * Vencido o líder, as passagens ficam abertas. Ao sair, as rodas recomeçam.
 */
import type { Dir } from '../../core/tipos';
import { flag } from '../../core/estado';
import { bus } from '../../core/events';
import { rng } from '../../core/rng';
import { entrada, simNao } from '../deps';
import { registrarMecanica } from '../registro';
import type { Pix } from '../pixel';
import { M, Enfeites, DIVISAS, cena, falar, avisar, sfx, quadros } from './_pecas';
import { tr } from '../../i18n';

const ZONA = 'B5-ginasio';
interface Roda {
  camarada: string; nome: string; toque: string;
  porta: [number, number]; lado: [number, number];
  /** quadros por batida, meia-janela de acerto (quadros) e golpes por volta */
  batida: number; janela: number; voltas: number[];
}
const RODAS: Roda[] = [
  { camarada: 'camarada-1', nome: 'Camarada Sabiá', toque: 'Angola', porta: [14, 12], lado: [15, 11], batida: 44, janela: 13, voltas: [3, 4] },
  { camarada: 'camarada-2', nome: 'Camarada Corisco', toque: 'Benguela', porta: [5, 7], lado: [6, 6], batida: 36, janela: 11, voltas: [3, 4, 5] },
  { camarada: 'camarada-3', nome: 'Contramestre Gavião', toque: 'São Bento Grande', porta: [10, 3], lado: [12, 2], batida: 30, janela: 9, voltas: [4, 5, 6] },
];
const ACAO: Record<Dir, 'cima' | 'baixo' | 'esq' | 'dir'> = { n: 'cima', s: 'baixo', o: 'esq', l: 'dir' };
const GOLPE: Record<Dir, string> = { n: 'Armada', s: 'Meia-lua', o: 'Queixada', l: 'Martelo' };
const SETA_COR = '#fcd834', OK = '#5cd06c', ERRO = '#f0503c';
const enf = new Enfeites();
let aberta: boolean[] = [];

const vencido = () => !!flag('ginasio-12-vencido');
const npc = (id: string) => M.npcs.find((n) => n.id === id);
function abrir(k: number) {
  const r = RODAS[k], n = npc(r.camarada);
  aberta[k] = true;
  if (n) { n.ator.teleportar(r.lado[0], r.lado[1], 's'); n.ox = r.lado[0]; n.oy = r.lado[1]; }
}
const BOLINHA = [['.kkk.', 'kwwwk', 'kwwwk', 'kwwwk', '.kkk.']];
const QUADRADO = [['kkkk', 'kwwk', 'kwwk', 'kkkk']];

/** toques do berimbau: "dom" (batida forte) e "tchi" (chiado) */
const dom = () => bus.emit('sfx', { id: 'bike-sino', pitch: 0.32 });
const tchi = () => bus.emit('sfx', { id: 'passo-madeira', pitch: 1.6 });

/** uma volta: chamada de `n` golpes e resposta; devolve o número de tropeços */
async function volta(r: Roda, n: number, cam: { x: number; y: number }, num: number, total: number): Promise<number> {
  const j = M.jog, B = r.batida;
  const seq: Dir[] = Array.from({ length: n }, () => (['n', 's', 'o', 'l'] as Dir[])[rng.int(0, 3)]);
  avisar(tr('Volta {num} de {total}: {nome} golpes', { num, total, nome: n }));
  const marca = enf.pix('marca', BOLINHA, { k: '#201420', w: '#6c5c4c' }, j.x, j.y, { dx: 5, dy: -22, z: 5000 }) as Pix;
  marca.el.dataset.rodaFase = 'entrada';
  const respostas: (boolean | null)[] = seq.map(() => null);
  const pintarRespostas = () => respostas.forEach((v, i) => enf.pix('r' + i, QUADRADO, { k: '#201420', w: v === null ? '#e4c078' : v ? OK : ERRO }, j.x, j.y, { dx: 8 - 3 * n + 6 * i, dy: -30, z: 5000 }));
  // entrada: duas batidas, a chamada (n batidas), uma batida de pausa e a resposta (n batidas)
  const inicioResp = (2 + n + 1) * B;
  let fim = false, ultimo = -1;
  await new Promise<void>((resolve) => {
    let q = 0;
    M.vigias.push(() => {
      if (fim) return true;
      const k = Math.floor(q / B), fase = q % B;
      if (fase === 0) {
        if (k < 2) tchi();
        else if (k < 2 + n) { dom(); enf.pix('seta', [DIVISAS[seq[k - 2]]], { w: SETA_COR }, cam.x, cam.y, { dx: 3, dy: -26, z: 5000 }); avisar(tr('{golpe}!', { golpe: GOLPE[seq[k - 2]] })); }
        else if (k === 2 + n) { tchi(); enf.tirar('seta'); pintarRespostas(); }
        else dom();
      }
      if (fase === Math.floor(B * 0.6) && k >= 2 && k < 2 + n) enf.tirar('seta');
      // marcador de batida: acende no tempo
      const perto = Math.min(fase, B - fase);
      marca.quadro(0); marca.el.style.filter = perto <= 3 ? 'brightness(2.4)' : '';
      // resposta
      const qr = q - inicioResp;
      if (qr >= -r.janela) {
        const alvo = Math.round(qr / B);
        const dentro = alvo >= 0 && alvo < n && Math.abs(qr - alvo * B) <= r.janela && respostas[alvo] === null;
        marca.el.dataset.rodaFase = 'resposta';
        marca.el.dataset.rodaJanela = dentro ? '1' : '0';
        marca.el.dataset.rodaSeta = dentro ? seq[alvo] : '';
        marca.el.dataset.rodaAlvo = String(alvo);
        const e = entrada();
        const apertada = (['n', 's', 'o', 'l'] as Dir[]).find((d) => e.apertou(ACAO[d]));
        if (apertada) {
          if (dentro) { respostas[alvo] = apertada === seq[alvo]; sfx(respostas[alvo] ? 'ui-ok' : 'ui-erro'); j.virar(apertada); }
          else if (alvo !== ultimo && alvo >= 0 && alvo < n && respostas[alvo] === null) { respostas[alvo] = false; sfx('ui-erro'); }
          ultimo = alvo;
          pintarRespostas();
        }
        // a janela da batida passou sem resposta
        for (let i = 0; i < n; i++) if (respostas[i] === null && qr > i * B + r.janela) { respostas[i] = false; pintarRespostas(); }
        if (qr > (n - 1) * B + r.janela + 6) { fim = true; resolve(); return true; }
      }
      q++;
    });
  });
  const erros = respostas.filter((v) => !v).length;
  await quadros(24);
  enf.tirarGrupo('r'); enf.tirar('marca'); enf.tirar('seta');
  return erros;
}

async function jogar(k: number) {
  const r = RODAS[k], n = npc(r.camarada);
  if (!n) return;
  n.ator.olharPara(M.jog.x, M.jog.y);
  if (aberta[k]) { await falar('Iê, camará! A roda já está aberta para você. Siga em frente.', { nome: r.nome }); return; }
  await falar(tr('Iê! Sou {nome}. Aqui só passa quem joga comigo no toque de {toque}.\fEu chamo os golpes, uma seta em cada batida do berimbau. Depois da pausa, você devolve as mesmas setas, cada uma na batida dela.', { nome: r.nome, toque: r.toque }), { nome: r.nome });
  if (!(await simNao('Entrar na roda?'))) { await falar('A roda fica esperando. Ninguém tem pressa na capoeira.', { nome: r.nome }); return; }
  const musicaAntes = M.musica;
  bus.emit('musica', { id: 'nenhuma', fade: 0.4 });
  await quadros(30);
  for (let v = 0; v < r.voltas.length; v++) {
    const erros = await volta(r, r.voltas[v], { x: n.ator.x, y: n.ator.y }, v + 1, r.voltas.length);
    if (erros > 1) {
      bus.emit('musica', musicaAntes);
      await falar(tr('Opa, {erros} tropeços! A roda pede volta ao mundo: o jogo recomeça do princípio.\nRespire e fale comigo de novo quando quiser.', { erros }), { nome: r.nome });
      return;
    }
    avisar(erros ? 'Um tropeço, mas a roda segue!' : 'Jogo limpo!');
    await quadros(30);
  }
  bus.emit('musica', musicaAntes);
  sfx('item-obtido');
  await falar('Iê, viva meu mestre! Jogou bonito, camará. A roda abre para você.', { nome: r.nome });
  abrir(k);
  M.cena.tremer(3);
}

bus.on('insignia', (n: number) => { if (n === 12 && M.zv?.def.id === ZONA) RODAS.forEach((_, k) => abrir(k)); });

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer();
    aberta = RODAS.map(() => false);
    if (vencido()) RODAS.forEach((_, k) => abrir(k));
  },
  interagir(x, y) {
    const k = RODAS.findIndex((r) => { const n = npc(r.camarada); return n && n.ator.x === x && n.ator.y === y; });
    if (k >= 0) { cena(() => jogar(k)); return true; }
    return false;
  },
  sair() { enf.esquecer(); aberta = []; },
});
