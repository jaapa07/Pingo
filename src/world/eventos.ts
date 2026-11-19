/** Interpretador dos scripts declarativos (docs/MOTOR.md → Eventos). Cada comando é uma tupla ['nome', ...args]. */
import type { Comando, Dir, AmuletoId, CriaturaInst } from '../core/tipos';
import { jogo, cond, setFlag, darItem, tirarItem, receberCriatura, temAmuleto } from '../core/estado';
import { bus } from '../core/events';
import { telas } from '../ui/telas';
import { M, AMULETOS, ocupar, sfx, musica, espera, quadros } from './vivo';
import { comandosExtras, cinematicas, type FnComando } from './registro';
import { falar, escolher, simNao, pedirNome, avisar, abrirTela, criarCriatura, curarEquipe, gravar, evento, treinador, nomeItem, nomeCriatura, especie, type Quem } from './deps';
import type { Ator } from './ator';
import { desafiar, ocultarNpc } from './npcs';
import { lutar, soltarErrante } from './encontros';
import { irPara, reavaliar } from './index';

/** lançado para encerrar o script em curso (derrota em batalha) */
class Encerrar extends Error {}

function atorDe(q: unknown): Ator | undefined { return q === 'jogador' ? M.jog : M.npcs.find((n) => n.id === q)?.ator; }
function quemFala(q: unknown): Quem | undefined {
  if (q == null) return undefined;
  if (typeof q === 'object') return q as Quem;
  if (q === 'jogador') return { nome: jogo.save.jogador.nome, retrato: jogo.save.jogador.avatar };
  const n = M.npcs.find((x) => x.id === q);
  if (!n) return { nome: String(q) };
  return { nome: n.treinador ? `${n.treinador.classe} ${n.treinador.nome}` : (n.def as { nome?: string }).nome, retrato: n.def.sprite };
}
async function entregar(c: CriaturaInst, apelidar: boolean) {
  const nome = nomeCriatura(c);
  sfx('item-obtido');
  await falar(`{JOGADOR} recebeu ${nome}!`);
  if (apelidar && (await simNao(`Quer dar um apelido para ${nome}?`))) { const a = (await pedirNome('Apelido', 10, nome)).trim(); if (a && a !== nome) c.apelido = a; }
  const onde = receberCriatura(c);
  if (onde === 'viveiro') await falar(`A equipe está cheia. ${nomeCriatura(c)} foi para o Viveiro de Cuias.`);
}

const PADRAO: Record<string, FnComando> = {
  falar: ([q, t]) => falar(String(t), quemFala(q)),
  escolha: async ([p, ops, f]) => { const i = await escolher(String(p), ops as string[]); if (f) setFlag(String(f), i); },
  simnao: async ([p, f]) => { const s = await simNao(String(p)); if (f) setFlag(String(f), s); },
  mover: async ([q, dirs]) => {
    const a = atorDe(q); if (!a) return;
    for (const d of dirs as Dir[]) await a.mover(d, 16, { base: 'andar' });
    const n = M.npcs.find((x) => x.ator === a); if (n) { n.ox = a.x; n.oy = a.y; }
    if (a === M.jog) { const s = jogo.save.jogador; s.x = a.x; s.y = a.y; s.dir = a.dir; if (M.parceira) { M.parceira.teleportar(a.x, a.y); M.parceira.visivel = false; } }
  },
  virar: ([q, d]) => { atorDe(q)?.virar(d as Dir); },
  esperar: ([ms]) => espera(Number(ms)),
  emote: async ([q, e]) => { atorDe(q)?.emote(String(e), 50); await quadros(50); },
  dar: async ([id, q]) => { const n = Number(q ?? 1); darItem(String(id), n); sfx('item-obtido'); bus.emit('item-obtido', { id, qtd: n }); await falar(`{JOGADOR} recebeu ${n > 1 ? n + '× ' : ''}${nomeItem(String(id))}!`); },
  tirar: ([id, q]) => { tirarItem(String(id), Number(q ?? 1)); },
  dinheiro: ([n]) => { const j = jogo.save.jogador; j.dinheiro = Math.max(0, j.dinheiro + Number(n)); },
  darCriatura: async ([e, nv, o]) => entregar(criarCriatura(Number(e), Number(nv), { localCaptura: M.zv.def.nome, nivelCaptura: Number(nv) }), !!(o as { apelidar?: boolean } | undefined)?.apelidar),
  darOvo: async ([e]) => {
    const c = criarCriatura(Number(e), 1, { ovo: 1500, localCaptura: M.zv.def.nome, nivelCaptura: 1 }), s = jogo.save;
    sfx('item-obtido');
    if (s.equipe.length < 6) s.equipe.push(c); else { const cx = s.viveiro.find((x) => x.includes(null)); if (cx) cx[cx.indexOf(null)] = c; }
    await falar('{JOGADOR} recebeu um ovo!\nEle vai chocar depois de uma boa caminhada.');
  },
  // ['batalha', id, { segue: true }] = duelo de história: perder não encerra o roteiro (marca `batalha-perdida` e a flag do treinador)
  batalha: async ([id, o]) => {
    const t = treinador(String(id)), segue = !!(o as { segue?: boolean } | undefined)?.segue;
    if (!t) { console.warn('[mundo] treinador desconhecido:', id); return; }
    const venceu = await desafiar(t, M.npcs.find((n) => n.treinador === t), segue ? { semDerrota: true } : {});
    setFlag('batalha-perdida', !venceu);
    if (!venceu && !segue) throw new Encerrar();
    // `semMarca`: a derrota não marca a flag do treinador (sequências que recomeçam, como a Liga)
    if (!venceu && !(o as { semMarca?: boolean } | undefined)?.semMarca) setFlag(t.flag ?? 'venceu:' + t.id);
  },
  selvagem: async ([e, nv, o]) => {
    const op = (o ?? {}) as { lendario?: boolean; semFuga?: boolean; semCaptura?: boolean; tutorial?: boolean };
    const r = await lutar({ tipo: op.lendario ? 'lendario' : 'selvagem', inimigos: [criarCriatura(Number(e), Number(nv))], arena: M.zv.def.arena, clima: M.zv.def.clima, semFuga: op.semFuga, semCaptura: op.semCaptura, tutorial: op.tutorial });
    setFlag('ultima-batalha', r.resultado);
    if (r.resultado === 'derrota') throw new Encerrar();
  },
  flag: ([n, v]) => { setFlag(String(n), (v ?? true) as boolean | number | string); },
  insignia: ([n]) => { const k = Number(n); if (!jogo.save.insignias.includes(k)) jogo.save.insignias.push(k); sfx('insignia'); bus.emit('insignia', k); },
  amuleto: ([id]) => { const a = id as AmuletoId; if (!temAmuleto(a)) jogo.save.amuletos.push(a); sfx('item-obtido'); bus.emit('amuleto', a); avisar(`Amuleto de Campo: ${AMULETOS[a]?.nome ?? a}`); },
  se: async ([c, entao, senao]) => { await passos(cond(String(c)) ? (entao as Comando[]) : ((senao as Comando[] | undefined) ?? [])); },
  musica: ([id]) => { musica(String(id), true); },
  sfx: ([id]) => { sfx(String(id)); },
  tela: async ([id, args]) => { await abrirTela(String(id), args); musica(M.zv.def.musica); },
  // com a cortina fechada o mapa continua simulando (o laço principal pausa as telas enquanto `telas.ocupada`)
  fade: async ([como]) => { if (!telas.raiz) { await espera(350); return; } await telas.cortina(como === 'fora', 'fade', 350); telas.ocupada = false; },
  warp: ([z, x, y, d]) => irPara(String(z), Number(x), Number(y), d as Dir | undefined),
  camera: async ([x, y, ms]) => {
    if (x === 'jogador') { await M.cena.panPara(M.jog.x, M.jog.y, 300); M.cena.soltarCamera(); return; }
    await M.cena.panPara(Number(x), Number(y), Number(ms ?? 600));
  },
  tremor: async ([ms]) => { const q = Math.round(Number(ms ?? 300) / (1000 / 60)); M.cena.tremer(q); bus.emit('shake', { amp: 2, ms }); await quadros(q); },
  curar: async () => { curarEquipe({ posto: M.zv.def.id.endsWith('-posto') }); sfx('cura-posto'); const s = jogo.save; if (M.zv.def.id.endsWith('-posto')) s.ultimoPosto = { zona: M.zv.def.id, x: M.jog.x, y: M.jog.y }; await espera(900); },
  loja: async ([itens]) => { await abrirTela('loja', { itens }); },
  mostrar: ([id]) => { ocultarNpc(String(id), false); },
  esconder: ([id]) => { ocultarNpc(String(id), true); },
  cinematica: async ([id]) => { const c = cinematicas.get(String(id)); if (c) await c(); else { bus.emit('cinematica', id); await abrirTela('cinematica', { id }); } },
  salvar: async () => { await gravar(); sfx('salvar'); avisar('Jogo salvo.'); },
  chamar: ([id]) => chamar(String(id)),
  pedirNome: async ([q]) => {
    if (q === 'rival') { const n = (await pedirNome('Nome da rival?', 8, String(jogo.save.flags['rival'] ?? 'Tainá'))).trim(); setFlag('rival', n || 'Tainá'); return; }
    const j = jogo.save.jogador, n = (await pedirNome('Qual é o seu nome?', 8, j.nome)).trim(); if (n) j.nome = n;
  },
  errante: ([e, nv]) => { soltarErrante(Number(e), Number(nv ?? 50)); },
  repelente: ([n]) => { jogo.save.repelente = Number(n ?? 200); },
  amizade: ([n]) => { for (const c of jogo.save.equipe) c.amizade = Math.max(0, Math.min(255, c.amizade + Number(n ?? 10))); },
};
export const COMANDOS_PADRAO = Object.keys(PADRAO);

async function passos(lista: Comando[]) {
  for (const [nome, ...args] of lista) {
    const f = comandosExtras.get(nome) ?? PADRAO[nome];
    if (!f) { console.warn('[mundo] comando de evento desconhecido:', nome); continue; }
    await f(args);
  }
}
async function chamar(id: string) {
  const e = evento(id);
  if (!e) { console.warn('[mundo] evento desconhecido:', id); return; }
  await passos(e.passos);
}
/** roda uma lista de comandos com o jogador travado; ao fim reavalia NPCs e portões */
export function rodarPassos(lista: Comando[]): Promise<void> {
  return ocupar(async () => {
    try { await passos(lista); } catch (e) { if (!(e instanceof Encerrar)) throw e; }
    if (M.pronto) { M.cena.soltarCamera(); reavaliar(); }
  });
}
export function rodarEvento(id: string): Promise<void> {
  const e = evento(id);
  if (!e) { console.warn('[mundo] evento desconhecido:', id); return Promise.resolve(); }
  bus.emit('evento', { id });
  return rodarPassos(e.passos);
}
