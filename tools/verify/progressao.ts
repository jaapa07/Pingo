/**
 * SIMULAÇÃO DA PROGRESSÃO do mapa A: busca tile a tile sobre todas as zonas, do quarto até `liga-vencida`.
 * O estado é o próprio save do jogo (flags, itens, Amuletos, insígnias) e as condições são avaliadas pelo
 * `cond()` do jogo. A cada rodada: anda por tudo o que o estado permite, conversa com NPCs, pisa em gatilhos,
 * vence treinadores e executa os eventos de forma simbólica (flag, dar, amuleto, insígnia, batalha, warp…).
 * A insígnia N+1 fica retida até o fecho do passo N terminar; assim se comprova, na ordem do bloco do topo
 * de docs/HISTORIA.md, que cada ginásio só abre depois do anterior e com os Amuletos/flags já obtidos.
 *
 * Simplificações declaradas: ginásios (quebra-cabeça em código) contam como inteiros alcançáveis ao entrar;
 * pedregulho/cipó/rocha viram passagem com o Amuleto certo; toda batalha é vencida; `tirar` e flags
 * desligadas são ignorados (o estado só cresce); escolhas "sim/não" respondem sim.
 */
import type { AmuletoId, Comando, ZonaDef } from '../../src/core/tipos';
import { jogo, novoSave, cond, forcarPeriodo, setFlag, darItem } from '../../src/core/estado';
import { carregar, blocos, LIVRE, novoAchado, type Achado, type Dados } from './dados';

export const COMANDOS_CONHECIDOS = ['falar', 'escolha', 'simnao', 'mover', 'virar', 'esperar', 'emote', 'dar', 'tirar', 'dinheiro', 'darCriatura', 'darOvo', 'batalha', 'selvagem', 'flag', 'insignia', 'amuleto', 'se', 'musica', 'sfx', 'tela', 'fade', 'warp', 'camera', 'tremor', 'curar', 'loja', 'mostrar', 'esconder', 'cinematica', 'salvar', 'chamar', 'pedirNome', 'errante', 'repelente', 'amizade', 'opcao', 'avatar', 'grito', 'contato', 'temItens', 'temEspecie', 'temDinheiro', 'poupar', 'sacar', 'vitrine'];

/** contrato do bloco do topo de docs/HISTORIA.md: o que o jogador tem ao fim de cada passo (insígnias 0..8) */
const AMULETOS_NO_PASSO: AmuletoId[][] = [
  [], ['faro'], ['faro', 'facao'], ['faro', 'facao', 'remo'], ['faro', 'facao', 'remo', 'lampiao'], ['faro', 'facao', 'remo', 'lampiao'],
  ['faro', 'facao', 'remo', 'lampiao', 'quebra-pedra'], ['faro', 'facao', 'remo', 'lampiao', 'quebra-pedra', 'forca'], ['faro', 'facao', 'remo', 'lampiao', 'quebra-pedra', 'forca'],
];
/** flag → passo (nº de insígnias) em que aparece pela primeira vez */
const FLAGS_NO_PASSO: Record<string, number> = { inicial: 0, 'ovo-entregue': 0, 'rival-1': 0, 'faro-ok': 1, 'rival-2': 2, 'usina-ok': 3, 'rival-3': 3, 'farol-ok': 4, 'liga-vencida': 8 };
/** zona → passo em que fica alcançável pela primeira vez (caminho do mapa A) */
const ZONAS_NO_PASSO: Record<string, number> = {
  'A1-quarto': 0, A1: 0, 'A1-lab': 0, 'A-R1': 0, A2: 0, 'A2-ginasio': 0, 'A-R2': 1, 'A-MS': 1, A3: 1, 'A3-ginasio': 1, 'A-R3': 1, 'A-GE': 2, A4: 2, 'A4-ginasio': 2,
  'A-R4': 3, 'A-US-1': 3, 'A-BA': 3, A5: 3, 'A5-ginasio': 3, A6: 4, 'A6-ginasio': 4, 'A-GB-1': 5, A7: 5, 'A7-ginasio': 5, 'A-R5': 5, A8: 6, 'A8-ginasio': 6, 'A-R7': 7, A10: 7, 'A10-ginasio': 7, 'A-LG': 7,
};
const PERIODOS = ['manha', 'dia', 'tarde', 'noite'] as const;
/** a condição vale em algum período do dia (o jogador pode esperar) */
function vale(c: string | undefined): boolean {
  if (!c) return true;
  if (!c.includes('periodo')) { try { return cond(c); } catch { return false; } }
  try { return PERIODOS.some((p) => { forcarPeriodo(p); return cond(c); }); } catch { return false; } finally { forcarPeriodo(null); }
}
class Retida extends Error {}
const ehEnt = (t?: string) => !!t && t !== 'borda' && t !== 'buraco';

export interface Passo { insignias: number; zonasNovas: string[]; amuletos: string[]; disponiveis: number[]; flags: string[] }
export interface ResultadoProgressao extends Achado { passos: Passo[]; /** nº de insígnias com que cada treinador / zona fica alcançável pela primeira vez */ treinadorNoPasso: Map<string, number>; zonaNoPasso: Map<string, number> }

class Sim {
  alc = new Map<string, Set<number>>(); // zona → tiles alcançados (acumulado)
  inteiras = new Set<string>();
  teto = 0; // maior insígnia que pode ser recebida agora
  disponiveis = new Set<number>();
  mudou = false;
  treinadorNoPasso = new Map<string, number>();
  constructor(private d: Dados) {}
  private tem = (a: AmuletoId) => jogo.save.amuletos.includes(a);

  semear(zid: string, x: number, y: number) {
    const z = this.d.zonas.get(zid); if (!z) return;
    let s = this.alc.get(zid); if (!s) { s = new Set(); this.alc.set(zid, s); }
    const w = z.mapaChars[0].length, k = y * w + x;
    if (!s.has(k)) { s.add(k); this.mudou = true; }
    if (z.tipo === 'ginasio' || this.d.zonasComMecanica.has(zid)) this.inteiras.add(zid);
  }
  /** expande o alcance dentro de uma zona com o estado atual */
  expandir(z: ZonaDef) {
    const s = this.alc.get(z.id)!; const { w, h, b } = blocos(z);
    const ch = (x: number, y: number) => z.mapaChars[y]?.[x] ?? ' ';
    if (this.inteiras.has(z.id)) { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!s.has(y * w + x) && (LIVRE.has(ch(x, y)) || z.warps.some((q) => q.x === x && q.y === y))) { s.add(y * w + x); this.mudou = true; } return; }
    const fechado = (x: number, y: number) => (z.portoes ?? []).some((p) => x >= p.x && y >= p.y && x < p.x + (p.w ?? 1) && y < p.y + (p.h ?? 1) && !vale(p.requer));
    const passa = (x: number, y: number, dx: number, dy: number) => {
      if (x < 0 || y < 0 || x >= w || y >= h || b[y * w + x] || fechado(x, y)) return false;
      const c = ch(x, y);
      if (c === 'w') return this.tem('remo') && dx === 0 && (dy > 0 || this.tem('cachoeira'));
      if (c === 'e') return this.tem('escalar') && dx === 0;
      return LIVRE.has(c) || (c === 'c' && this.tem('facao')) || ('~d'.includes(c) && this.tem('remo')) || (c === 'p' && this.tem('forca')) || (c === 'r' && this.tem('quebra-pedra'));
    };
    const fila = [...s];
    while (fila.length) {
      const k = fila.pop()!, x = k % w, y = (k - x) / w;
      // tile de chegada bloqueado (porta de prédio): não se anda a partir dele, mas os vizinhos livres contam
      for (const [dx, dy, sal] of [[0, 1, 'v'], [0, -1, ''], [1, 0, '>'], [-1, 0, '<']] as [number, number, string][]) {
        let nx = x + dx, ny = y + dy;
        if (sal && ch(nx, ny) === sal) { nx += dx; ny += dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h || b[ny * w + nx] || !LIVRE.has(ch(nx, ny))) continue; }
        const wp = z.warps.find((q) => q.x === nx && q.y === ny);
        const ok = passa(nx, ny, dx, dy);
        if (!ok && !(wp && ehEnt(wp.tipo) && !fechado(nx, ny))) continue;
        const nk = ny * w + nx; if (s.has(nk)) continue;
        s.add(nk); this.mudou = true; if (ok) fila.push(nk);
      }
    }
  }
  perto(z: ZonaDef, x: number, y: number, raio = 1): boolean {
    const s = this.alc.get(z.id); if (!s) return false; const w = z.mapaChars[0].length, h = z.mapaChars.length;
    for (let dy = -raio; dy <= raio; dy++) for (let dx = -raio; dx <= raio; dx++) { if (Math.abs(dx) + Math.abs(dy) > raio) continue; const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && s.has(ny * w + nx)) return true; }
    return false;
  }
  insignia(n: number) {
    if (jogo.save.insignias.includes(n)) return;
    if (n > this.teto) { this.disponiveis.add(n); throw new Retida(); }
    jogo.save.insignias.push(n); this.mudou = true;
  }
  flag(k: string, v: unknown = true) { if (v === false || v === 0 && jogo.save.flags[k]) return; if (jogo.save.flags[k] !== v && !(jogo.save.flags[k] && v === true)) { setFlag(k, v as boolean | number | string); this.mudou = true; } }
  vencer(id: string, semMarca = false) {
    const t = this.d.treinadores.get(id); if (!t) return;
    if (!this.treinadorNoPasso.has(id)) this.treinadorNoPasso.set(id, this.teto);
    if (t.insignia) this.insignia(t.insignia);
    if (!semMarca) this.flag(t.flag ?? 'venceu:' + id);
  }
  rodar(id: string, fundo = 0) {
    const ev = this.d.eventos.get(id); if (!ev || fundo > 6) return;
    try { this.passos(ev.passos, fundo); } catch (e) { if (!(e instanceof Retida)) throw e; if (fundo) throw e; }
  }
  passos(l: Comando[], fundo: number) {
    for (const c of l) {
      if (!Array.isArray(c)) continue;
      const [n, x, y, z] = c as [string, unknown, unknown, unknown];
      switch (n) {
        case 'flag': this.flag(String(x), y ?? true); break;
        case 'simnao': if (y) this.flag(String(y), true); break;
        case 'dar': if (!jogo.save.mochila[String(x)]) { darItem(String(x), Number(y ?? 1)); this.mudou = true; } break;
        case 'amuleto': if (!this.tem(x as AmuletoId)) { jogo.save.amuletos.push(x as AmuletoId); this.mudou = true; } break;
        case 'insignia': this.insignia(Number(x)); break;
        case 'batalha': this.vencer(String(x), !!(y as { semMarca?: boolean } | undefined)?.semMarca); break;
        case 'darCriatura': if (!jogo.save.diario.capturado.includes(Number(x))) { jogo.save.diario.capturado.push(Number(x)); this.mudou = true; } break;
        case 'se': this.passos(((vale(String(x)) ? y : z) as Comando[] | undefined) ?? [], fundo); break;
        case 'chamar': this.rodar(String(x), fundo + 1); break;
        case 'warp': this.semear(String(x), Number(y), Number(z)); break;
        // comandos próprios dos roteiros (registrados em src/data/eventos): efeito simbólico, sempre a favor do jogador
        case 'cuiaDaFrente': this.flag('cuia-0'); this.flag('cuia-alguma'); break;
        case 'opcao': for (let i = 0; i < 8; i++) this.flag(`${String(x)}-${i}`); break;
        case 'temEspecie': case 'temDinheiro': this.flag(String(y)); break;
        case 'temItens': if (jogo.save.mochila[String(x)]) this.flag(String(z)); break;
        case 'a2-lenda-fim': this.flag(String(x)); break;
        default: break;
      }
    }
  }
  /** fecho: repete andar + interagir até nada mudar */
  fechar() {
    for (let volta = 0; volta < 400; volta++) {
      this.mudou = false;
      for (const zid of [...this.alc.keys()]) {
        const z = this.d.zonas.get(zid)!; this.expandir(z);
        const s = this.alc.get(zid)!, w = z.mapaChars[0].length;
        for (const wp of z.warps) { if (!s.has(wp.y * w + wp.x) || !vale(wp.requer) || !this.d.zonas.has(wp.para.zona)) continue; const destino = this.d.zonas.get(wp.para.zona)!; if (destino.mapa !== 'A' && !vale('mapa-b')) continue; this.semear(wp.para.zona, wp.para.x, wp.para.y); }
        for (const n of z.npcs ?? []) {
          if (!this.perto(z, n.x, n.y, n.treinador ? Math.max(1, n.visao ?? 4) : 1)) continue;
          // o passo do treinador vale mesmo que ele já tenha ido embora (NPCs do Cartel somem ao fim do evento)
          if (n.treinador && this.d.treinadores.has(n.treinador) && !this.treinadorNoPasso.has(n.treinador)) this.treinadorNoPasso.set(n.treinador, this.teto);
          if (!vale(n.se)) continue;
          if (n.treinador) { try { this.vencer(n.treinador); } catch (e) { if (!(e instanceof Retida)) throw e; } }
          if (n.script) this.rodar(n.script);
        }
        for (const o of z.objetos ?? []) if (typeof o.script === 'string' && this.perto(z, o.x, o.y, 2)) this.rodar(o.script);
        for (const g of z.gatilhos ?? []) { if (!vale(g.se)) continue; let pisa = false; for (let y = g.y; y < g.y + (g.h ?? 1) && !pisa; y++) for (let x = g.x; x < g.x + (g.w ?? 1); x++) if (s.has(y * w + x)) { pisa = true; break; } if (pisa) this.rodar(g.script); }
        for (const i of z.itens ?? []) if (this.perto(z, i.x, i.y) && !jogo.save.flags[i.flag]) { setFlag(i.flag); if (!jogo.save.mochila[i.item]) darItem(i.item, i.qtd ?? 1); this.mudou = true; }
      }
      if (!this.mudou) return;
    }
    throw new Error('a simulação não estabilizou em 400 rodadas');
  }
}

export async function progressao(): Promise<ResultadoProgressao> {
  const a: ResultadoProgressao = { ...novoAchado(), passos: [], treinadorNoPasso: new Map(), zonaNoPasso: new Map() }, d = await carregar();
  const guardado = jogo.save;
  try {
    jogo.save = novoSave();
    const sim = new Sim(d), ini = jogo.save.jogador;
    sim.semear(ini.zona, ini.x, ini.y);
    sim.rodar('abertura');
    const ARQ = 'src/data/zonas + src/data/eventos';
    let vistas = new Set<string>();
    const primeiraVez = new Map<string, number>(), primeiraFlag = new Map<string, number>();
    for (let k = 0; k <= 8; k++) {
      sim.teto = k; sim.disponiveis.clear();
      sim.fechar();
      const zonas = new Set(sim.alc.keys());
      const novas = [...zonas].filter((z) => !vistas.has(z)); vistas = zonas;
      for (const z of novas) primeiraVez.set(z, k);
      for (const f of Object.keys(FLAGS_NO_PASSO)) if (jogo.save.flags[f] && !primeiraFlag.has(f)) primeiraFlag.set(f, k);
      const disp = [...sim.disponiveis].sort((x, y) => x - y);
      a.passos.push({ insignias: k, zonasNovas: novas.filter((z) => !/-(casa|posto|venda)/.test(z)), amuletos: [...jogo.save.amuletos], disponiveis: disp, flags: Object.keys(FLAGS_NO_PASSO).filter((f) => jogo.save.flags[f]) });
      const tem = jogo.save.insignias.slice().sort((x, y) => x - y).join(',');
      const quer = Array.from({ length: k }, (_, i) => i + 1).join(',');
      if (tem !== quer) a.erros.push(`${ARQ}: no passo ${k} o jogador deveria ter as insígnias [${quer}] e tem [${tem}]`);
      if (k < 8) {
        if (!disp.includes(k + 1)) a.erros.push(`${ARQ}: com ${k} insígnia(s), o líder ${k + 1} NÃO é alcançável (falta caminho, Amuleto ou flag)`);
        for (const n of disp) if (n > k + 1) a.erros.push(`${ARQ}: quebra de sequência — com ${k} insígnia(s) já dá para ganhar a insígnia ${n}`);
        if (jogo.save.flags['liga-vencida']) a.erros.push(`${ARQ}: a Liga pode ser vencida com só ${k} insígnia(s)`);
      } else if (disp.length) a.pendentes.push(`insígnia(s) ${disp.join(', ')} alcançável(is) depois da 8ª sem passar pelo mapa B (conferir quando o mapa B abrir)`);
      const am = [...jogo.save.amuletos].sort().join(','), amQuer = [...AMULETOS_NO_PASSO[k]].sort().join(',');
      if (am !== amQuer) a.erros.push(`${ARQ}: Amuletos com ${k} insígnia(s): esperado [${amQuer}] (docs/HISTORIA.md), obtido [${am}]`);
    }
    for (const [f, k] of Object.entries(FLAGS_NO_PASSO)) { const p = primeiraFlag.get(f); if (p === undefined) a.erros.push(`${ARQ}: a flag "${f}" nunca é obtida no mapa A (esperada com ${k} insígnia(s))`); else if (p !== k) a.erros.push(`${ARQ}: a flag "${f}" aparece com ${p} insígnia(s); o roteiro manda com ${k}`); }
    for (const [z, k] of Object.entries(ZONAS_NO_PASSO)) { const p = primeiraVez.get(z); if (p === undefined) a.erros.push(`${d.arquivoDaZona.get(z) ?? z}: zona nunca alcançada na simulação (esperada com ${k} insígnia(s))`); else if (p !== k) a.erros.push(`${d.arquivoDaZona.get(z) ?? z}: zona alcançável com ${p} insígnia(s); o roteiro manda com ${k}`); }
    for (const i of ['passe-trem', 'bilhete-saveiro']) if (!jogo.save.mochila[i]) a.erros.push(`src/data/eventos/liga.ts: vencer a Liga não entrega o item "${i}"`);
    // trem, Saveiro e trilha do Pico: só com a Liga vencida
    for (const z of d.zonas.values()) if (z.mapa === 'A') for (const w of z.warps) {
      const alvo = d.zonas.get(w.para.zona);
      if ((alvo ? alvo.mapa !== 'A' : /^(B|PP)/.test(w.para.zona)) && !/liga-vencida|insignias:1[0-9]|nunca/.test(w.requer ?? '')) a.erros.push(`${d.arquivoDaZona.get(z.id)}: warp (${w.x},${w.y}) para ${w.para.zona} sai do mapa A sem exigir flag:liga-vencida`);
    }
    const foraDoA = [...sim.alc.keys()].filter((z) => d.zonas.get(z)!.mapa !== 'A');
    if (foraDoA.length) a.erros.push(`${ARQ}: zonas fora do mapa A alcançadas antes de o mapa B abrir: ${foraDoA.join(', ')}`);
    const nunca = [...d.zonas.values()].filter((z) => z.mapa === 'A' && !sim.alc.has(z.id)).map((z) => z.id);
    if (nunca.length) a.pendentes.push(`${nunca.length} zona(s) do mapa A só abrem com Amuletos/insígnias do mapa B (áreas de retorno): ${nunca.join(', ')}`);
    a.pendentes.push('mapa B, ginásios 9–16, Conselho e pós-jogo: fora da simulação até o mapa B abrir (MAPA_B_ABERTO = false)');
    a.treinadorNoPasso = sim.treinadorNoPasso; a.zonaNoPasso = primeiraVez;
    const tiles = [...sim.alc.values()].reduce((s, v) => s + v.size, 0);
    a.info.push(`${sim.alc.size} zonas e ${tiles} tiles alcançados do quarto até a Liga; ${Object.keys(jogo.save.flags).length} flags; Amuletos finais: ${jogo.save.amuletos.join(', ')}`);
  } catch (e) { a.erros.push('tools/verify/progressao.ts: a simulação parou — ' + String((e as Error).stack ?? e).slice(0, 400)); }
  finally { jogo.save = guardado; }
  return a;
}
