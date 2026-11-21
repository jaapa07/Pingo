/** Estado global da sessão: o save em memória + opções. Persistência em core/save.ts. */
import type { SaveData, Opcoes, CriaturaInst, AmuletoId, Cond, Periodo } from './tipos';
import { rng } from './rng';
import { MAPA_B_ABERTO, DEMO } from './progresso';

export const opcoesPadrao = (): Opcoes => ({ musica: 0.7, sfx: 0.85, velTexto: 2, dificuldade: 'aventureiro', animBatalha: true, numerosDano: false, vibrar: true, parceiraSegue: false, teclas: {}, qualidade: 'pc' });

export function novoSave(): SaveData {
  return {
    versao: 1,
    jogador: { nome: 'Kauê', avatar: 'kaue', id: String(10000 + Math.floor(Date.now() % 55535)), zona: 'A1-quarto', x: 5, y: 5, dir: 's', dinheiro: 3000, poupanca: 0, modo: 'pe' },
    equipe: [], viveiro: Array.from({ length: 16 }, () => Array.from({ length: 30 }, () => null)),
    mochila: {}, pcItens: { 'cha-cidreira': 1 }, flags: {}, insignias: [], amuletos: [],
    diario: { visto: [], capturado: [] }, relogio: { deslocamentoMin: 0, diaSemana0: 0 },
    rng: (Date.now() ^ 0x5f3759df) >>> 0, tempoJogo: 0, ultimoPosto: { zona: 'A1-casa-jogador', x: 4, y: 4 },
    decoracao: {}, contatos: [], canteiros: {}, repelente: 0,
  };
}

export const jogo = {
  save: novoSave(),
  opcoes: opcoesPadrao(),
  slot: 0,
  carregar(s: SaveData) { this.save = s; rng.seed(s.rng); },
};

/* ------------------------- consultas e mutações comuns ------------------------- */
export const flag = (k: string) => jogo.save.flags[k];
export function setFlag(k: string, v: number | boolean | string = true) { jogo.save.flags[k] = v; }
export const temInsignia = (n: number) => jogo.save.insignias.includes(n);
export const temAmuleto = (a: AmuletoId) => jogo.save.amuletos.includes(a);
export const qtdItem = (id: string) => jogo.save.mochila[id] ?? 0;
export function darItem(id: string, n = 1) { jogo.save.mochila[id] = qtdItem(id) + n; }
export function tirarItem(id: string, n = 1) { const q = qtdItem(id); if (q < n) return false; if (q === n) delete jogo.save.mochila[id]; else jogo.save.mochila[id] = q - n; return true; }
export function marcarVisto(e: number) { if (!jogo.save.diario.visto.includes(e)) jogo.save.diario.visto.push(e); }
export function marcarCapturado(e: number) { marcarVisto(e); if (!jogo.save.diario.capturado.includes(e)) jogo.save.diario.capturado.push(e); }
/** põe na equipe ou, se cheia, na primeira vaga do Viveiro. Retorna onde foi parar. */
export function receberCriatura(c: CriaturaInst): 'equipe' | 'viveiro' | 'cheio' {
  marcarCapturado(c.especie);
  if (jogo.save.equipe.length < 6) { jogo.save.equipe.push(c); return 'equipe'; }
  for (const cx of jogo.save.viveiro) { const i = cx.indexOf(null); if (i >= 0) { cx[i] = c; return 'viveiro'; } }
  return 'cheio';
}

/* ------------------------- relógio do jogo ------------------------- */
/** minutos desde meia-noite, pelo relógio do aparelho + deslocamento ajustado com a mãe */
export function minutosAgora(): number { const d = new Date(); return (((d.getHours() * 60 + d.getMinutes() + jogo.save.relogio.deslocamentoMin) % 1440) + 1440) % 1440; }
export function periodoAgora(): Periodo { const m = minutosAgora(); return m < 300 ? 'noite' : m < 600 ? 'manha' : m < 1020 ? 'dia' : m < 1140 ? 'tarde' : 'noite'; }
/** 0 = domingo */
export function diaSemana(): number { return (new Date(Date.now() + jogo.save.relogio.deslocamentoMin * 60000).getDay() + jogo.save.relogio.diaSemana0) % 7; } // o dia vira junto com o relógio do jogo
/** estação fria: junho a setembro do relógio do aparelho */
export function estacaoFria(): boolean { const m = new Date().getMonth(); return m >= 5 && m <= 8; }
let periodoForcado: Periodo | null = null;
export function forcarPeriodo(p: Periodo | null) { periodoForcado = p; }
export function periodo(): Periodo { return periodoForcado ?? periodoAgora(); }

/* ------------------------- condições ------------------------- */
function termo(t: string): boolean {
  t = t.trim();
  if (t.startsWith('!')) return !termo(t.slice(1));
  // o valor é tudo depois do PRIMEIRO dois-pontos: nomes de flag podem ter dois-pontos (`venceu:A6-FA-9`, `visitou:A5`)
  const corte = t.indexOf(':'), k = corte < 0 ? t : t.slice(0, corte), v = corte < 0 ? '' : t.slice(corte + 1);
  switch (k) {
    case 'insignia': return temInsignia(Number(v));
    case 'insignias': return jogo.save.insignias.length >= Number(v);
    case 'flag': return !!flag(v);
    case 'amuleto': return temAmuleto(v as AmuletoId);
    case 'item': return qtdItem(v) > 0;
    case 'diario': return jogo.save.diario.capturado.filter((n) => n <= 180).length >= Number(v);
    case 'periodo': return periodo() === v;
    case 'pos-jogo': return !!flag('conselho-vencido');
    case 'mapa-b': return MAPA_B_ABERTO;
    case 'demo': return DEMO;
    case 'sempre': return true;
    case 'nunca': return false;
    default: throw new Error('condição desconhecida: ' + t);
  }
}
export function cond(c: Cond | undefined): boolean {
  if (!c) return true;
  if (c.includes('|')) return c.split('|').some(termo);
  return c.split('&').every(termo);
}
