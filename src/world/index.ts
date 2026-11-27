/**
 * MUNDO — API pública do motor de mapa (docs/MOTOR.md → "Mundo" e "Eventos").
 * Tela 'mundo', troca de zonas, relógio/período/clima no mapa, atalhos de URL para testes.
 */
import './registro'; // primeiro: zonas e eventos podem registrar extensões ao serem importados
import type { Dir, ZonaDef, Periodo, AmuletoId, ClimaId, MetodoEncontro } from '../core/tipos';
import { TILE } from '../core/tipos';
import { jogo, novoSave, periodo, forcarPeriodo, setFlag, darItem, diaSemana, estacaoFria, minutosAgora, temAmuleto } from '../core/estado';
import { rng } from '../core/rng';
import { bus } from '../core/events';
import { telas, registrarTela, type Tela } from '../ui/telas';
import { Cena } from './cena';
import { Ator } from './ator';
import { ZonaViva, zonaDef, listaZonas, AVISO_EM_OBRAS } from './zonas';
import { M, ajudante, musica, rodarVigias, quadros, type NpcVivo } from './vivo';
import { pollEntrada, avisar, falar, criarCriatura, iniciarBatalha, diarioBatalhas, diarioFalas, especie, nomeCriatura, temBatalha } from './deps';
import { mecanicas } from './registro';
import { zonaNaDemo, TEXTOS_DEMO } from '../core/demo';
import { sincronizarNpcs, limparNpcs, atualizarNpcs } from './npcs';
import { atualizarJogador, baseDoModo } from './jogador';
import { montarProps, atualizarCanteiros, farejar, usarAmuleto, usarItemNoCampo, pintarTile, pescar } from './campo';
import { moverErrantes, soltarErrante, batalhaSelvagem, tabela } from './encontros';
import { rodarEvento, rodarPassos, COMANDOS_PADRAO } from './eventos';
import { sincronizarParceira, atualizarParceira } from './parceira';
import { montarDecoracao } from './decoracao';
import { vigiarObstaculo, derrotaNoCampo } from './integracao';
import { tr } from '../i18n';
import './precarga'; // sprites dos iniciais e das criaturas da zona, em segundo plano

export { registrarComando, registrarMecanica, registrarCinematica, registrarTreinador, registrarEvento, type Mecanica } from './registro';
export { rodarEvento, rodarPassos } from './eventos';
export { usarAmuleto, usarItemNoCampo, pescar } from './campo';
export { derrotaNoCampo } from './integracao';
export { soltarErrante, batalhaSelvagem, tabela as tabelaDeEncontros } from './encontros';
export { zonaDef, listaZonas, objCat } from './zonas';
export type { NpcVivo } from './vivo';

const cena = new Cena();
M.cena = cena;
let pedido: { zona: string; x: number; y: number; dir?: Dir } | null = null;
let relogioT = 0, faroT = 0, luzAvisada = '';

/* ------------------------------ luz, clima, período ------------------------------ */
/** máscara de escuro/névoa conforme a zona e o Lampião (Amuleto + criatura Brasa/Trovão/Encanto) */
export function atualizarLuz(avisarUso = false) {
  const z = M.zv.def, lamp = (z.escuro || z.nevoa) && !!ajudante('lampiao');
  if (z.escuro) cena.definirEscuro(lamp ? 80 : 32);
  else if (z.nevoa) cena.definirEscuro(lamp ? 0 : 40, '#dfe8ee');
  else cena.definirEscuro(0);
  if (lamp && (avisarUso || luzAvisada !== z.id)) { luzAvisada = z.id; avisar(tr('{nome} acendeu o Lampião!', { nome: nomeCriatura(ajudante('lampiao')!) })); }
  else if ((z.escuro || z.nevoa) && !lamp && avisarUso) avisar(temAmuleto('lampiao') ? 'Nenhuma criatura da equipe consegue acender o Lampião.' : 'Está escuro demais.');
}
/** NPCs, guardas de portão e luz conforme as flags atuais (chamado após scripts e batalhas) */
export function reavaliar() { if (!M.pronto) return; sincronizarNpcs(); atualizarLuz(); }

/* ------------------------------ troca de zona ------------------------------ */
function garantirTela() {
  if (telas.pilha.includes(tela)) return;
  while (telas.pilha.length) { const t = telas.pilha.pop()!; t.sair?.(); t.el.remove(); }
  telas.empilhar(tela);
}
const cortina = (fechar: boolean, classe: string) => (telas.raiz && classe !== 'nenhuma' ? telas.cortina(fechar, classe, 250) : Promise.resolve());

async function carregar(id: string, x: number, y: number, dir: Dir) {
  const def = zonaDef(id);
  if (!def) throw new Error('zona desconhecida: ' + id);
  const antes = M.zv?.def;
  if (antes) mecanicas.get(antes.id)?.sair?.();
  M.pronto = false;
  limparNpcs(); M.vigias.length = 0; M.extras = [];
  const zv = new ZonaViva(def), s = jogo.save;
  await cena.montar(zv, periodo(), M.debugForcado);
  await cena.preCarregar(x * TILE + 8, y * TILE + 8, periodo());
  M.zv = zv;
  // modo de deslocamento coerente com o destino
  const j = s.jogador, agua = zv.agua(x, y);
  if (def.submerso) j.modo = 'mergulho';
  else if (j.modo === 'mergulho') j.modo = agua ? 'remo' : 'pe';
  else if (agua) j.modo = 'remo';
  else if (j.modo === 'remo') j.modo = 'pe';
  if (j.modo === 'bike' && ['interior', 'ginasio'].includes(def.tipo)) j.modo = 'pe';
  M.jog = new Ator(j.avatar, cena.sprites, x, y, dir);
  M.jog.base = baseDoModo(false); M.jog.pose();
  M.parceira = null; sincronizarParceira(true);
  M.forca = false; M.sacudidas.clear(); M.passosSeguros = 3; M.travaDir = null; M.viraT = 0;
  j.zona = id; j.x = x; j.y = y; j.dir = dir;
  sincronizarNpcs();
  montarProps();
  await montarDecoracao();
  cena.definirClima(def.clima ?? (def.nevoa ? 'nevoa' : 'limpo'));
  M.pronto = true;
  atualizarLuz();
  musica(def.musica);
  if (def.tipo === 'cidade') setFlag('visitou:' + id);
  if (id.endsWith('-posto')) s.ultimoPosto = { zona: id, x, y };
  if (antes && antes.id !== id) { moverErrantes(); if (antes.nome !== def.nome && def.tipo !== 'interior') avisar(def.nome); }
  cena.el.dataset.zona = id;
  bus.emit('zona', { id, de: antes?.id });
  mecanicas.get(id)?.entrar?.();
}
let filaIr: Promise<void> = Promise.resolve();
/** leva o jogador para (x, y) da zona, com cortina (`transicao` = classe CSS da cortina; 'nenhuma' = corte seco) */
export function irPara(zona: string, x: number, y: number, dir?: Dir, transicao = 'fade'): Promise<void> {
  const r = filaIr.then(async () => {
    // destino ausente (zona não escrita ou ignorada por defeito): o jogador fica onde está e vê o aviso
    if (!zonaDef(zona)) { console.error(`[mundo] irPara: zona "${zona}" não existe; viagem cancelada.`); if (M.zv) avisar(AVISO_EM_OBRAS); return; }
    // demo (src/core/demo.ts): nenhuma viagem sai das zonas liberadas, venha de warp, evento, voo ou atalho
    if (!zonaNaDemo(zona)) { console.warn(`[mundo] irPara: "${zona}" fica fora da demo; viagem cancelada.`); if (M.zv) avisar(TEXTOS_DEMO.zonaFechada); return; }
    M.ocupado++; M.carregando = true;
    try {
      garantirTela();
      await cortina(true, transicao);
      await carregar(zona, x, y, dir ?? jogo.save.jogador.dir ?? 's');
      desenhar();
      await cortina(false, transicao);
    } finally { M.ocupado--; M.carregando = false; }
  });
  filaIr = r.catch(() => undefined);
  return r;
}

/* ------------------------------ tela ------------------------------ */
function atualizar(dt: number) {
  pollEntrada();
  if (!M.pronto || M.pausado) return;
  M.quadro++;
  jogo.save.tempoJogo += dt;
  rodarVigias();
  atualizarJogador();
  atualizarNpcs();
  M.jog.atualizar(dt); atualizarParceira(dt); vigiarObstaculo();
  for (const n of M.npcs) n.ator.atualizar(dt);
  for (const g of M.guardas) g.ator.atualizar(dt);
  M.extras = M.extras.filter((a) => !a.removido);
  for (const a of M.extras) a.atualizar(dt);
  cena.atualizar();
  if (++relogioT >= 60) { relogioT = 0; cena.definirPeriodo(periodo()); atualizarCanteiros(); }
  if (++faroT >= 100) { faroT = 0; if (!M.ocupado && ajudante('faro')) farejar(6); }
}
function desenhar() {
  if (!M.pronto) return;
  const atores = [M.jog, ...M.npcs.map((n) => n.ator), ...M.guardas.map((g) => g.ator), ...M.extras];
  if (M.parceira) atores.push(M.parceira);
  for (const a of atores) a.desenhar();
  cena.desenhar(M.jog, atores);
}
const tela: Tela = {
  el: cena.el,
  entrar() {
    const p = pedido ?? jogo.save.jogador; pedido = null;
    if (!M.carregando && (!M.pronto || M.zv.def.id !== p.zona)) void irPara(p.zona, p.x, p.y, p.dir, 'nenhuma');
    expor();
  },
  sair() { M.pronto = false; M.musica = ''; },
  voltar() { if (M.pronto) musica(M.zv.def.musica); },
  atualizar, desenhar,
};
registrarTela('mundo', (args?: { zona?: string; x?: number; y?: number; dir?: Dir }) => { pedido = args?.zona ? { zona: args.zona, x: args.x ?? 0, y: args.y ?? 0, dir: args.dir } : null; return tela; });

/* ------------------------------ objeto público ------------------------------ */
export const mundo = {
  get zona(): ZonaDef { return M.zv?.def; },
  jogador: {
    get x() { return M.jog?.x ?? jogo.save.jogador.x; }, get y() { return M.jog?.y ?? jogo.save.jogador.y; },
    get dir(): Dir { return M.jog?.dir ?? jogo.save.jogador.dir; }, get modo() { return jogo.save.jogador.modo; },
    get movendo() { return !!M.jog?.movendo; }, get px() { return M.jog?.px ?? 0; }, get py() { return M.jog?.py ?? 0; },
    virar(d: Dir) { M.jog?.virar(d); },
  },
  npc(id: string): NpcVivo | undefined { return M.npcs.find((n) => n.id === id); },
  get npcs() { return M.npcs; },
  pausar(b: boolean) { M.pausado = b; },
  /** recarrega a zona atual no mesmo lugar (reaplica mapa, NPCs, itens) */
  recarregar() { if (M.zv) void irPara(M.zv.def.id, M.jog.x, M.jog.y, M.jog.dir, 'nenhuma'); },
  /** reavalia `se` dos NPCs e `requer` dos portões sem recarregar */
  reavaliar,
  get pronto() { return M.pronto && !M.carregando; },
  get ocupado() { return M.ocupado > 0; },
  get cena() { return cena; },
  get camera() { return { x: cena.camX, y: cena.camY }; },
  get debug() { return cena.debug; },
  /** caractere vivo do tile (obstáculos cortados/empurrados já aplicados) */
  tile(x: number, y: number) { return M.zv.ch(x, y); },
  /** troca o caractere de um tile nesta visita (mecânicas de ginásio); a arte do bake não muda */
  definirTile(x: number, y: number, c: string) { M.zv.set(x, y, c); pintarTile(x, y); },
  bloquear(x: number, y: number, b: boolean) { M.zv.bloquear(x, y, b); },
  /** camada de sprites do mapa (z-index = y em px) para props de mecânicas */
  get camadaSprites() { return cena.sprites; },
  criarAtor(modelo: string, x: number, y: number, dir: Dir = 's') { const a = new Ator(modelo, cena.sprites, x, y, dir); M.extras.push(a); return a; },
  esperarQuadros: (n: number) => quadros(n).then(() => undefined),
  get ultimaBatalha() { return diarioBatalhas[diarioBatalhas.length - 1]; },
  get batalhas() { return diarioBatalhas; },
  /** textos mostrados por falar/escolher/avisar (testes) */
  get falas() { return diarioFalas; },
  relogio: { periodo, diaSemana, estacaoFria, minutos: minutosAgora, forcarPeriodo },
  /** tabela de encontros em vigor nesta zona para o método (período, camada e estação aplicados) */
  tabela: (metodo: MetodoEncontro) => tabela(M.zv.def, metodo)?.t ?? [],
  definirClima(c: ClimaId) { cena.definirClima(c); bus.emit('clima', { id: c }); },
  derrotaNoCampo,
  get parceira() { return M.parceira; },
  comandos: COMANDOS_PADRAO,
  usarAmuleto: (id: AmuletoId) => usarAmuleto(id),
  usarItem: (id: string) => usarItemNoCampo(id),
  pescar, soltarErrante, batalhaSelvagem, irPara, rodarEvento, rodarPassos,
};
function expor() { const w = window as unknown as { __pingo?: Record<string, unknown> }; w.__pingo = Object.assign(w.__pingo ?? {}, { jogo, telas, mundo, bus }); }

/* ------------------------------ atalhos de URL (testes) ------------------------------ */
const AMULETOS_DE_TESTE: AmuletoId[] = ['facao', 'remo', 'forca', 'lampiao', 'quebra-pedra', 'escalar', 'cachoeira', 'mergulho', 'voo', 'faro'];
/**
 * Atalhos de teste: `?zona=A1&x=10&y=8` (abre a zona com um save de teste) e `?batalha=10,5` (selvagem nº 10 nv 5).
 * Extras: `debug` (mapa por caractere), `equipe=1:5,20:12`, `amuletos=todos|facao,remo`, `insignias=3`,
 * `itens=vara-boa,repelente:2`, `flags=a,b`, `periodo=noite`, `dinheiro=500`, `parceira=1`, `modo=bike`,
 * `dir=n`, `semente=123`, `save=manter` (não troca o save atual). Devolve true se assumiu a abertura do jogo.
 */
export async function iniciarPorUrl(params: URLSearchParams | string = location.search): Promise<boolean> {
  const p = typeof params === 'string' ? new URLSearchParams(params) : params;
  M.debugForcado = p.has('debug') && p.get('debug') !== '0';
  expor();
  const zona = p.get('zona'), bat = p.get('batalha');
  if (!zona && !bat) return false;
  if (p.get('save') !== 'manter') jogo.carregar(novoSave());
  const s = jogo.save;
  if (p.get('semente')) rng.seed(Number(p.get('semente')));
  const lista = (k: string) => (p.get(k) ?? '').split(',').map((t) => t.trim()).filter(Boolean);
  const equipe = lista('equipe');
  if (equipe.length || !s.equipe.length) { s.equipe = []; for (const t of equipe.length ? equipe : ['1:5']) { const [e, nv] = t.split(':').map(Number); if (e) s.equipe.push(criarCriatura(e, nv || 5)); } }
  const am = lista('amuletos');
  if (am.length) s.amuletos = am[0] === 'todos' ? [...AMULETOS_DE_TESTE] : (am as AmuletoId[]);
  if (p.get('insignias')) s.insignias = Array.from({ length: Number(p.get('insignias')) }, (_, i) => i + 1);
  for (const t of lista('itens')) { const [id, q] = t.split(':'); darItem(id, Number(q) || 1); }
  for (const f of lista('flags')) setFlag(f);
  if (p.get('periodo')) forcarPeriodo(p.get('periodo') as Periodo);
  if (p.get('dinheiro')) s.jogador.dinheiro = Number(p.get('dinheiro'));
  if (p.get('amizade')) for (const c of s.equipe) c.amizade = Number(p.get('amizade'));
  if (p.has('parceira')) jogo.opcoes.parceiraSegue = p.get('parceira') !== '0';
  if (p.get('modo')) s.jogador.modo = p.get('modo') as typeof s.jogador.modo;
  if (zona) {
    const def = zonaDef(zona);
    if (!def) { console.error('[mundo] zona desconhecida em ?zona=', zona, '— disponíveis:', listaZonas().map((z) => z.id).join(', ')); return false; }
    const [px, py] = def.pouso ?? [Math.floor(def.mapaChars[0].length / 2), Math.floor(def.mapaChars.length / 2)];
    await irPara(zona, Number(p.get('x') ?? px), Number(p.get('y') ?? py), (p.get('dir') as Dir) ?? 's', 'nenhuma');
  }
  if (bat) {
    const [e, nv] = bat.split(',').map(Number);
    if (zona) void batalhaSelvagem(e, nv || 5);
    else if (temBatalha()) void iniciarBatalha({ tipo: 'selvagem', inimigos: [criarCriatura(e, nv || 5)], arena: p.get('arena') ?? 'campo' });
    else void falar('O módulo de batalha ainda não está disponível.');
  }
  return true;
}
