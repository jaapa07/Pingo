/**
 * Parque Safári do Buriti-Alto (spec 10A item 33) — mecânica da zona `A-SF-parque`.
 * Conta os passos do passeio (flag `safari-passos`), sorteia os encontros da grama alta pela tabela do SETOR em que
 * o jogador está (src/data/safari.ts: o parque não tem `habitats`) e abre a tela `safari-encontro` (sem golpes).
 * O passeio acaba quando os passos ou as Cuias-Safári acabam, ou quando o jogador sai pela porteira: as cuias que
 * sobraram ficam na portaria e `safari-ativo` é desligada. Um placar fixo mostra passos e cuias no canto da tela.
 */
import { registrarMecanica } from '../registro';
import { jogo, flag, setFlag, qtdItem, tirarItem, periodo } from '../../core/estado';
import { rng } from '../../core/rng';
import { telas } from '../../ui/telas';
import { bus } from '../../core/events';
import { texto, escrever, em } from '../../ui/fonte';
import { moldura } from '../../ui/kit';
import { SAFARI, setorEm, tabelaSetor } from '../../data/safari';
import { M, mundo, cena, falar, avisar, sfx } from './_pecas';
import { musica } from '../vivo';
import { abrirTela, simNao, pedirNome, especie } from '../deps';
import type { ResultadoSafari } from '../../ui/telas/gincana-safari';
import { tr } from '../../i18n';

const ZONA = 'A-SF-parque';
export const SAIDA_SAFARI: [number, number] = [13, 3];
let seguros = 0, hud: HTMLElement | null = null, tHud: HTMLElement | null = null, encerrando = false;

function pintarHud() {
  if (!tHud) return;
  escrever(tHud, tr('Passos {c:amarelo}{passos}{/c}   Cuias {c:amarelo}{cuias}{/c}', { passos: Math.max(0, Number(flag('safari-passos') ?? 0)), cuias: qtdItem(SAFARI.item) }));
}
function montarHud() {
  tirarHud();
  if (!telas.raiz) return;
  hud = moldura('placa', 128, 15, 140, 2); hud.classList.add('sf-hud');
  tHud = texto('', { cor: 'creme', sombra: true }); hud.append(em(tHud, 6, 4));
  mundo.cena.el.append(hud); pintarHud();
}
function tirarHud() { hud?.remove(); hud = null; tHud = null; }

/** apaga o passeio: cuias de volta para a portaria, flags desligadas */
function encerrar(): number {
  const sobra = qtdItem(SAFARI.item);
  if (sobra) tirarItem(SAFARI.item, sobra);
  setFlag('safari-ativo', false); setFlag('safari-passos', 0);
  return sobra;
}
async function fimDoPasseio(motivo: string) {
  if (encerrando) return; encerrando = true;
  try {
    sfx('ui-ok');
    await falar(tr('PÍÍÍ! {motivo}\nA Dona Ingá chama todo mundo de volta para a porteira.', { motivo }));
    encerrar();
    await mundo.irPara('A-SF', SAIDA_SAFARI[0], SAIDA_SAFARI[1], 's');
    await falar('Fim do passeio! Volte quando quiser: o parque abre todos os dias.', { nome: 'Bilheteira Dona Ingá', retrato: 'npc-mulher-1' });
  } finally { encerrando = false; }
}
async function encontro(x: number, y: number) {
  const s = setorEm(x, y); if (!s) return;
  const t = tabelaSetor(s, periodo()); if (!t.length) return;
  const sorteio = rng.peso(t), nv = rng.int(sorteio.nv[0], sorteio.nv[1]);
  sfx('encontro'); musica('safari'); // encontro de safári não é luta: a música do passeio continua
  await M.cena.piscar(2);
  const r = (await abrirTela('safari-encontro', { especie: sorteio.e, nivel: nv, arena: s.arena, setor: s.n })) as ResultadoSafari | undefined;
  musica(M.zv.def.musica, true); seguros = 3; pintarHud();
  if (r?.resultado === 'captura' && r.criatura) {
    const c = r.criatura, nome = especie(c.especie)?.nome ?? 'A criatura';
    if (await simNao(tr('Quer dar um apelido para {nome}?', { nome }))) { const a = (await pedirNome('Apelido', 10, nome)).trim(); if (a && a !== nome) c.apelido = a; }
    if (r.destino === 'viveiro') await falar(tr('A equipe está cheia. {apelido} foi para o Viveiro de Cuias.', { apelido: c.apelido ?? nome }));
    setFlag('safari-capturas', Number(flag('safari-capturas') ?? 0) + 1);
  }
  if (flag('safari-ativo') && qtdItem(SAFARI.item) <= 0) await fimDoPasseio('Acabaram as Cuias-Safári.');
}

registrarMecanica(ZONA, {
  entrar() {
    encerrando = false; seguros = 2;
    if (!flag('safari-ativo')) {
      // chegou sem bilhete (save antigo ou atalho): de volta à portaria
      cena(async () => { await falar('Pííí! A Dona Ingá apita da porteira: "Passeio sem bilhete não vale! Volte aqui."'); await mundo.irPara('A-SF', SAIDA_SAFARI[0], SAIDA_SAFARI[1], 's'); });
      return;
    }
    montarHud();
  },
  passo(x, y) {
    if (!flag('safari-ativo') || encerrando) return false;
    const n = Number(flag('safari-passos') ?? 0) - 1;
    setFlag('safari-passos', Math.max(0, n)); pintarHud();
    if (n <= 0) { cena(() => fimDoPasseio('Acabaram os passos do passeio.')); return true; }
    if (M.zv.ch(x, y) === '"' && jogo.save.equipe.length) {
      if (seguros > 0) { seguros--; return false; }
      if (rng.chance(SAFARI.taxa)) { cena(() => encontro(x, y)); return true; }
    }
    return false;
  },
  sair() { tirarHud(); },
});
// saiu do parque para outra zona (porteira, Voo, corda): o passeio acaba e as cuias ficam na portaria.
// Recarregar o próprio parque (mundo.recarregar) não encerra nada.
bus.on('zona', (e: { id: string; de?: string }) => {
  if (e.de !== ZONA || e.id === ZONA || encerrando || !flag('safari-ativo')) return;
  const n = encerrar(); avisar(n ? tr('Passeio encerrado: {nome} Cuias-Safári ficaram na porteira.', { nome: n }) : 'Passeio encerrado.');
});
