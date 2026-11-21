/**
 * Saves: 3 slots, opções, ponto de retomada, autosave e transferência (.pingo com checksum + partes para QR).
 * O armazenamento vem de `plataforma.armazenamento` (assíncrono); um cache em memória carregado em
 * `iniciarSave()` deixa a API síncrona para o jogo. Toda gravação vai ao cache e segue para o adaptador.
 */
import type { Opcoes, SaveData } from './tipos';
import { jogo, novoSave, opcoesPadrao } from './estado';
import { rng } from './rng';
import { bus } from './events';
import { plataforma } from './plataforma';

export const N_SLOTS = 3;
export interface ResumoSlot { nome: string; avatar: 'kaue' | 'ayra'; insignias: number[]; diario: number; vistos: number; tempo: number; zona: string; quando: number; equipe: number[] }
interface Registro { v: 1; soma: string; quando: number; resumo: ResumoSlot; dados: SaveData }

const CH_SLOT = (i: number) => 'pingo.slot.' + i;
const CH_OPCOES = 'pingo.opcoes', CH_RETOMADA = 'pingo.retomada';
const cache = new Map<string, string>();
let pronto = false;

/* ------------------------------ checksum e compactação ------------------------------ */
const TAB = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(b: Uint8Array): string { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TAB[(c ^ b[i]) & 255] ^ (c >>> 8); return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0'); }
const utf8 = (s: string) => new TextEncoder().encode(s);
const deUtf8 = (b: Uint8Array) => new TextDecoder().decode(b);

/** LZSS em bytes: janela de 4095, cópias de 3 a 18; cada grupo de 8 itens leva 1 byte de marcas */
export function compactar(e: Uint8Array): Uint8Array {
  const s: number[] = []; const n = e.length;
  const cabeca = new Int32Array(65536).fill(-1), ant = new Int32Array(n).fill(-1);
  const chave = (i: number) => ((e[i] << 8) ^ (e[i + 1] << 4) ^ e[i + 2]) & 0xffff;
  let i = 0;
  while (i < n) {
    const pMarca = s.length; s.push(0); let marca = 0;
    for (let bit = 0; bit < 8 && i < n; bit++) {
      let melhor = 0, onde = 0;
      if (i + 2 < n) {
        let p = cabeca[chave(i)], passos = 0;
        while (p >= 0 && i - p <= 4095 && passos++ < 48) {
          let l = 0; while (l < 18 && i + l < n && e[p + l] === e[i + l]) l++;
          if (l > melhor) { melhor = l; onde = i - p; if (l === 18) break; }
          p = ant[p];
        }
      }
      const avanca = melhor >= 3 ? melhor : 1;
      if (melhor >= 3) { marca |= 1 << bit; s.push(((onde >> 8) << 4) | (melhor - 3), onde & 255); } else s.push(e[i]);
      for (let k = 0; k < avanca; k++, i++) if (i + 2 < n) { const c = chave(i); ant[i] = cabeca[c]; cabeca[c] = i; }
    }
    s[pMarca] = marca;
  }
  return Uint8Array.from(s);
}
export function descompactar(e: Uint8Array): Uint8Array {
  const s: number[] = []; let i = 0;
  while (i < e.length) {
    const marca = e[i++];
    for (let bit = 0; bit < 8 && i < e.length; bit++) {
      if (marca & (1 << bit)) {
        const a = e[i++], b = e[i++]; const dist = ((a >> 4) << 8) | b, l = (a & 15) + 3;
        if (dist <= 0 || dist > s.length) throw new Error('dados corrompidos');
        for (let k = 0; k < l; k++) s.push(s[s.length - dist]);
      } else s.push(e[i++]);
    }
  }
  return Uint8Array.from(s);
}
function b64(b: Uint8Array): string { let t = ''; for (let i = 0; i < b.length; i += 0x4000) t += String.fromCharCode(...b.subarray(i, i + 0x4000)); return btoa(t).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function deB64(s: string): Uint8Array { const t = atob(s.replace(/-/g, '+').replace(/_/g, '/')); const b = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i); return b; }

/* ------------------------------ validação ------------------------------ */
function saveValido(d: unknown): d is SaveData {
  const s = d as SaveData;
  return !!s && s.versao === 1 && !!s.jogador && typeof s.jogador.nome === 'string' && Array.isArray(s.equipe) && Array.isArray(s.viveiro)
    && !!s.diario && Array.isArray(s.insignias) && typeof s.mochila === 'object' && typeof s.flags === 'object';
}
/** completa campos que versões futuras venham a acrescentar, para um save antigo continuar abrindo */
function completar(s: SaveData): SaveData { const base = novoSave(); return { ...base, ...s, jogador: { ...base.jogador, ...s.jogador }, relogio: { ...base.relogio, ...s.relogio }, diario: { ...base.diario, ...s.diario } }; }
function resumir(s: SaveData): ResumoSlot {
  return { nome: s.jogador.nome, avatar: s.jogador.avatar, insignias: [...s.insignias], diario: s.diario.capturado.filter((n) => n <= 180).length, vistos: s.diario.visto.length, tempo: Math.floor(s.tempoJogo), zona: s.jogador.zona, quando: Date.now(), equipe: s.equipe.map((c) => c.especie) };
}
function embrulhar(s: SaveData): string {
  const dados = JSON.parse(JSON.stringify(s)) as SaveData;
  const r: Registro = { v: 1, soma: crc32(utf8(JSON.stringify(dados))), quando: Date.now(), resumo: resumir(dados), dados };
  return JSON.stringify(r);
}
function desembrulhar(txt: string | null | undefined): Registro | null {
  if (!txt) return null;
  try {
    const r = JSON.parse(txt) as Registro;
    if (r?.v !== 1 || !saveValido(r.dados) || crc32(utf8(JSON.stringify(r.dados))) !== r.soma) return null;
    return r;
  } catch { return null; }
}
function por(chave: string, valor: string) { cache.set(chave, valor); void plataforma.armazenamento.gravar(chave, valor).catch(() => undefined); }
function tirar(chave: string) { cache.delete(chave); void plataforma.armazenamento.apagar(chave).catch(() => undefined); }

/* ------------------------------ API ------------------------------ */
/** carrega slots e opções do adaptador da plataforma para o cache (chamar 1× na inicialização) */
export async function iniciarSave(): Promise<void> {
  const chaves = [CH_OPCOES, CH_RETOMADA, ...Array.from({ length: N_SLOTS }, (_, i) => [CH_SLOT(i), CH_SLOT(i) + '.bak']).flat()];
  await Promise.all(chaves.map(async (k) => { try { const v = await plataforma.armazenamento.ler(k); if (v != null) cache.set(k, v); } catch { /* chave ilegível: segue sem ela */ } }));
  try { const o = JSON.parse(cache.get(CH_OPCOES) ?? 'null') as Partial<Opcoes> | null; if (o) jogo.opcoes = { ...opcoesPadrao(), ...o, teclas: { ...(o.teclas ?? {}) } }; } catch { /* opções corrompidas: fica o padrão */ }
  if (!cache.has(CH_OPCOES) && plataforma.toque) jogo.opcoes.qualidade = 'celular';
  pronto = true;
  bus.on('autosave', () => autosalvar());
  bus.on('zona', () => autosalvar());
  bus.on('posto-entrou', () => autosalvar());
}
const registro = (i: number) => desembrulhar(cache.get(CH_SLOT(i))) ?? desembrulhar(cache.get(CH_SLOT(i) + '.bak'));

/** o slot tem dados gravados, mas nem o principal nem a cópia puderam ser lidos */
export const slotDanificado = (i: number) => !registro(i) && (cache.has(CH_SLOT(i)) || cache.has(CH_SLOT(i) + '.bak'));
/** resumo de cada slot (null = vazio) */
export function listarSlots(): (ResumoSlot | null)[] { return Array.from({ length: N_SLOTS }, (_, i) => registro(i)?.resumo ?? null); }
/** carrega o slot para `jogo` (com a semente do acaso). Devolve false se estiver vazio ou corrompido. */
export function carregarSlot(i: number): boolean {
  const r = registro(i); if (!r) return false;
  jogo.slot = i; jogo.carregar(completar(r.dados));
  return true;
}
/** grava o jogo atual no slot (padrão: o slot em uso), guardando a versão anterior como reserva */
export function gravarSlot(i: number = jogo.slot): boolean {
  if (i < 0 || i >= N_SLOTS) return false;
  jogo.save.rng = rng.estado();
  const antigo = cache.get(CH_SLOT(i));
  if (antigo && desembrulhar(antigo)) por(CH_SLOT(i) + '.bak', antigo);
  por(CH_SLOT(i), embrulhar(jogo.save));
  jogo.slot = i; limparRetomada();
  bus.emit('salvou', { slot: i });
  return true;
}
export function apagarSlot(i: number) { tirar(CH_SLOT(i)); tirar(CH_SLOT(i) + '.bak'); const r = lerRetomada(); if (r?.slot === i) limparRetomada(); }
/** gravação automática (troca de zona, Posto Guardião); ignorada antes de o jogo começar */
let emJogo = false;
export function marcarEmJogo(v: boolean) { emJogo = v; }
export const estaEmJogo = () => emJogo;
export function autosalvar(): boolean { return emJogo && pronto ? gravarSlot(jogo.slot) : false; }

export function gravarOpcoes() { por(CH_OPCOES, JSON.stringify(jogo.opcoes)); bus.emit('opcoes', jogo.opcoes); }

/* ----- ponto de retomada (app foi para segundo plano no meio do jogo) ----- */
export function gravarRetomada() { if (!emJogo) return; jogo.save.rng = rng.estado(); por(CH_RETOMADA, JSON.stringify({ slot: jogo.slot, reg: embrulhar(jogo.save) })); }
export function lerRetomada(): { slot: number; resumo: ResumoSlot } | null {
  try { const o = JSON.parse(cache.get(CH_RETOMADA) ?? 'null') as { slot: number; reg: string } | null; const r = desembrulhar(o?.reg); return o && r ? { slot: o.slot, resumo: r.resumo } : null; } catch { return null; }
}
export function carregarRetomada(): boolean {
  try { const o = JSON.parse(cache.get(CH_RETOMADA) ?? 'null') as { slot: number; reg: string } | null; const r = desembrulhar(o?.reg); if (!o || !r) return false; jogo.slot = o.slot; jogo.carregar(completar(r.dados)); return true; } catch { return false; }
}
export function limparRetomada() { if (cache.has(CH_RETOMADA)) tirar(CH_RETOMADA); }

/* ----- transferência entre aparelhos ----- */
const MARCA = 'PINGO1';
/** conteúdo do arquivo `.pingo`: MARCA:checksum:base64url(LZSS(JSON)). Sem argumento, exporta o jogo em memória. */
export function exportar(slot?: number): string {
  const dados = slot == null ? (jogo.save.rng = rng.estado(), jogo.save) : registro(slot)?.dados;
  if (!dados) throw new Error('Este jogo está vazio.');
  const bytes = utf8(JSON.stringify(dados));
  return `${MARCA}:${crc32(bytes)}:${b64(compactar(bytes))}`;
}
/** confere e abre um texto exportado, sem gravar nada. Lança Error com mensagem em português. */
export function lerExportado(txt: string): SaveData {
  // código colado de mensageiros e e-mail chega com espaços, quebras de linha, caracteres invisíveis,
  // aspas ou texto em volta (e às vezes como link #pingo=): tudo isso é descartado antes de conferir
  const bruto = String(txt ?? '').replace(/%3A/gi, ':').replace(/[\u00ad\u200b-\u200f\u2060\ufeff]+/g, '');
  const limpo = bruto.replace(/\s+/g, '');
  const outra = /PINGO(\d+):/.exec(limpo);
  if (outra && outra[1] !== '1') throw new Error('Este código é de uma versão mais nova do jogo. Atualize o jogo neste aparelho e tente de novo.');
  if (!/PINGO1:([0-9a-fA-F]{8}):([A-Za-z0-9_-]+)/.test(limpo)) throw new Error(/PINGO1:/.test(limpo) ? 'O código está incompleto: copie o código inteiro de novo.' : 'Isto não é um código de Adventures of Pingo.');
  // o texto depois do código numa linha nova ("Abraço!") se gruda nele quando os espaços somem: tenta cortar
  // nas quebras, do fim para o começo, até a soma conferir
  const pedacos = bruto.slice(bruto.indexOf('PINGO1')).split(/\s+/).filter(Boolean);
  let bytes: Uint8Array | null = null;
  for (let k = pedacos.length; k >= Math.max(1, pedacos.length - 8) && !bytes; k--) {
    const m = /^PINGO1:([0-9a-fA-F]{8}):([A-Za-z0-9_-]+)/.exec(pedacos.slice(0, k).join(''));
    if (!m) continue;
    try { const b = descompactar(deB64(m[2])); if (crc32(b) === m[1].toLowerCase()) bytes = b; } catch { /* tenta um corte menor */ }
  }
  if (!bytes) throw new Error('O código está incompleto ou foi alterado: copie o código inteiro de novo (ou use o arquivo .pingo).');
  let d: unknown;
  try { d = JSON.parse(deUtf8(bytes)); } catch { throw new Error('O arquivo está danificado.'); }
  if (!saveValido(d)) throw new Error((d as { versao?: number } | null)?.versao && (d as { versao: number }).versao > 1 ? 'Este código é de uma versão mais nova do jogo. Atualize o jogo neste aparelho e tente de novo.' : 'O código é de uma versão que este jogo não conhece.');
  return completar(d);
}
/** importa para um slot (padrão: o primeiro vazio; se não houver, lança erro pedindo para escolher) */
export function importar(txt: string, slot?: number): number {
  const dados = lerExportado(txt);
  const i = slot ?? listarSlots().findIndex((s) => !s);
  if (i < 0 || i >= N_SLOTS) throw new Error('Não há jogo vazio. Escolha um para substituir.');
  const antigo = cache.get(CH_SLOT(i)); if (antigo && desembrulhar(antigo)) por(CH_SLOT(i) + '.bak', antigo);
  por(CH_SLOT(i), embrulhar(dados));
  return i;
}
export const nomeArquivo = (r: ResumoSlot | null) => `pingo-${(r?.nome ?? 'jogo').normalize('NFD').replace(/[^A-Za-z0-9]/g, '').toLowerCase() || 'jogo'}.pingo`;

/** divide o texto exportado em partes para códigos QR: "i.n.id.pedaço" (id = checksum, une as partes) */
export function partesQr(txt: string, tamanho = 360): string[] {
  const id = txt.split(':')[1] ?? '0', n = Math.max(1, Math.ceil(txt.length / tamanho));
  return Array.from({ length: n }, (_, i) => `${i + 1}.${n}.${id}.${txt.slice(i * tamanho, (i + 1) * tamanho)}`);
}
/**
 * Recebe uma parte lida por QR (vinda do `#pingo=` da URL). Guarda as partes na sessão e devolve o texto
 * completo quando todas chegaram; antes disso, quantas faltam.
 */
export function receberParteQr(parte: string): { completo?: string; tem: number; total: number } | null {
  const m = /^(\d+)\.(\d+)\.([0-9a-f]{8})\.(.+)$/.exec(parte); if (!m) return null;
  const i = Number(m[1]), n = Number(m[2]), id = m[3];
  let guardado: { id: string; p: Record<number, string> } = { id, p: {} };
  try { const g = JSON.parse(cache.get('pingo.qr') ?? localStorage.getItem('pingo.qr') ?? 'null') as typeof guardado | null; if (g?.id === id) guardado = g; } catch { /* começa de novo */ }
  guardado.p[i] = m[4];
  const tem = Object.keys(guardado.p).length;
  if (tem >= n) { cache.delete('pingo.qr'); try { localStorage.removeItem('pingo.qr'); } catch { /* sem localStorage */ } return { completo: Array.from({ length: n }, (_, k) => guardado.p[k + 1] ?? '').join(''), tem, total: n }; }
  cache.set('pingo.qr', JSON.stringify(guardado)); try { localStorage.setItem('pingo.qr', JSON.stringify(guardado)); } catch { /* só nesta sessão */ }
  return { tem, total: n };
}
/** save de teste para os atalhos de URL (`?zona=`, `?batalha=`) */
export function saveDeTeste(): SaveData { const s = novoSave(); s.jogador.nome = 'Teste'; s.flags['teste'] = true; return s; }
