/**
 * PNG puro em Node (só zlib): codifica RGBA ou indexado (PLTE + tRNS) e decodifica
 * imagens de 8 bits (tons de cinza, RGB, indexado, cinza+alfa, RGBA), sem entrelaçamento.
 * Sem perdas: o que entra é exatamente o que sai.
 */
import { deflateSync, inflateSync } from 'node:zlib';

export interface Bitmap { w: number; h: number; /** RGBA, 4 bytes por pixel */ rgba: Uint8Array }

const ASSINATURA = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABELA_CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function bloco(tipo: string, dados: Uint8Array): Buffer {
  const b = Buffer.alloc(12 + dados.length);
  b.writeUInt32BE(dados.length, 0);
  b.write(tipo, 4, 'latin1');
  Buffer.from(dados.buffer, dados.byteOffset, dados.length).copy(b, 8);
  b.writeUInt32BE(crc32(b.subarray(4, 8 + dados.length)), 8 + dados.length);
  return b;
}
function cabecalho(w: number, h: number, bits: number, tipoCor: number): Buffer {
  const d = Buffer.alloc(13);
  d.writeUInt32BE(w, 0); d.writeUInt32BE(h, 4);
  d[8] = bits; d[9] = tipoCor; d[10] = 0; d[11] = 0; d[12] = 0;
  return bloco('IHDR', d);
}

/** Codifica RGBA de 8 bits (tipo de cor 6). */
export function codificarRGBA(bm: Bitmap): Buffer {
  const { w, h, rgba } = bm;
  const cru = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    cru[y * (w * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(cru, y * (w * 4 + 1) + 1);
  }
  return Buffer.concat([ASSINATURA, cabecalho(w, h, 8, 6), bloco('IDAT', deflateSync(cru, { level: 9 })), bloco('IEND', new Uint8Array(0))]);
}

/**
 * Codifica indexado (tipo de cor 3) com a menor profundidade que couber (1, 2, 4 ou 8 bits).
 * `paleta` = lista de [r, g, b, a]; `indices` = um byte por pixel.
 */
export function codificarIndexado(w: number, h: number, indices: Uint8Array, paleta: [number, number, number, number][]): Buffer {
  const n = Math.max(1, paleta.length);
  const bits = n <= 2 ? 1 : n <= 4 ? 2 : n <= 16 ? 4 : 8;
  const larg = Math.ceil((w * bits) / 8);
  const cru = Buffer.alloc((larg + 1) * h);
  for (let y = 0; y < h; y++) {
    const o = y * (larg + 1) + 1;
    if (bits === 8) for (let x = 0; x < w; x++) cru[o + x] = indices[y * w + x];
    else for (let x = 0; x < w; x++) cru[o + ((x * bits) >> 3)] |= indices[y * w + x] << (8 - bits - ((x * bits) & 7));
  }
  const plte = new Uint8Array(n * 3);
  const trns = new Uint8Array(n);
  let ultimoTransp = -1;
  for (let i = 0; i < n; i++) {
    const c = paleta[i] ?? [0, 0, 0, 255];
    plte[i * 3] = c[0]; plte[i * 3 + 1] = c[1]; plte[i * 3 + 2] = c[2];
    trns[i] = c[3];
    if (c[3] < 255) ultimoTransp = i;
  }
  const partes = [ASSINATURA, cabecalho(w, h, bits, 3), bloco('PLTE', plte)];
  if (ultimoTransp >= 0) partes.push(bloco('tRNS', trns.subarray(0, ultimoTransp + 1)));
  partes.push(bloco('IDAT', deflateSync(cru, { level: 9 })), bloco('IEND', new Uint8Array(0)));
  return Buffer.concat(partes);
}

/** Escolhe sozinho: indexado se houver até 256 cores distintas, senão RGBA. */
export function codificar(bm: Bitmap): Buffer {
  const { w, h, rgba } = bm;
  const mapa = new Map<number, number>();
  const paleta: [number, number, number, number][] = [];
  const idx = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const a = rgba[i * 4 + 3];
    const chave = a === 0 ? 0 : ((rgba[i * 4] << 24) | (rgba[i * 4 + 1] << 16) | (rgba[i * 4 + 2] << 8) | a) >>> 0;
    let k = mapa.get(chave);
    if (k === undefined) {
      if (paleta.length === 256) return codificarRGBA(bm);
      k = paleta.length;
      mapa.set(chave, k);
      paleta.push(a === 0 ? [0, 0, 0, 0] : [rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2], a]);
    }
    idx[i] = k;
  }
  return codificarIndexado(w, h, idx, paleta);
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** Decodifica PNG de 8 bits ou indexado de 1/2/4/8 bits (sem entrelaçamento) para RGBA. */
export function decodificar(arquivo: Uint8Array): Bitmap {
  const buf = Buffer.from(arquivo.buffer, arquivo.byteOffset, arquivo.length);
  if (!buf.subarray(0, 8).equals(ASSINATURA)) throw new Error('não é PNG');
  let pos = 8, w = 0, h = 0, bits = 8, tipo = 6, entrelacado = 0;
  let plte: Buffer | null = null, trns: Buffer | null = null;
  const idat: Buffer[] = [];
  while (pos < buf.length) {
    const tam = buf.readUInt32BE(pos);
    const nome = buf.toString('latin1', pos + 4, pos + 8);
    const dados = buf.subarray(pos + 8, pos + 8 + tam);
    if (nome === 'IHDR') { w = dados.readUInt32BE(0); h = dados.readUInt32BE(4); bits = dados[8]; tipo = dados[9]; entrelacado = dados[12]; }
    else if (nome === 'PLTE') plte = dados;
    else if (nome === 'tRNS') trns = dados;
    else if (nome === 'IDAT') idat.push(dados);
    else if (nome === 'IEND') break;
    pos += 12 + tam;
  }
  if (entrelacado) throw new Error('PNG entrelaçado não é suportado');
  if (bits !== 8 && tipo !== 3) throw new Error(`profundidade ${bits} não suportada para o tipo ${tipo}`);
  const canais = tipo === 0 ? 1 : tipo === 2 ? 3 : tipo === 3 ? 1 : tipo === 4 ? 2 : 4;
  const bpp = Math.max(1, (canais * bits) >> 3);
  const larg = Math.ceil((w * canais * bits) / 8);
  const cru = inflateSync(Buffer.concat(idat));
  const linhas = Buffer.alloc(larg * h);
  for (let y = 0; y < h; y++) {
    const f = cru[y * (larg + 1)];
    const ent = y * (larg + 1) + 1, sai = y * larg;
    for (let x = 0; x < larg; x++) {
      const a = x >= bpp ? linhas[sai + x - bpp] : 0;
      const b = y > 0 ? linhas[sai - larg + x] : 0;
      const c = x >= bpp && y > 0 ? linhas[sai - larg + x - bpp] : 0;
      const v = cru[ent + x];
      linhas[sai + x] = (f === 0 ? v : f === 1 ? v + a : f === 2 ? v + b : f === 3 ? v + ((a + b) >> 1) : v + paeth(a, b, c)) & 255;
    }
  }
  const rgba = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4, s = y * larg;
    if (tipo === 3) {
      const i = bits === 8 ? linhas[s + x] : (linhas[s + ((x * bits) >> 3)] >> (8 - bits - ((x * bits) & 7))) & ((1 << bits) - 1);
      rgba[o] = plte![i * 3]; rgba[o + 1] = plte![i * 3 + 1]; rgba[o + 2] = plte![i * 3 + 2];
      rgba[o + 3] = trns && i < trns.length ? trns[i] : 255;
    } else if (tipo === 0) { rgba[o] = rgba[o + 1] = rgba[o + 2] = linhas[s + x]; rgba[o + 3] = 255; }
    else if (tipo === 4) { rgba[o] = rgba[o + 1] = rgba[o + 2] = linhas[s + x * 2]; rgba[o + 3] = linhas[s + x * 2 + 1]; }
    else if (tipo === 2) { rgba[o] = linhas[s + x * 3]; rgba[o + 1] = linhas[s + x * 3 + 1]; rgba[o + 2] = linhas[s + x * 3 + 2]; rgba[o + 3] = 255; }
    else { rgba[o] = linhas[s + x * 4]; rgba[o + 1] = linhas[s + x * 4 + 1]; rgba[o + 2] = linhas[s + x * 4 + 2]; rgba[o + 3] = linhas[s + x * 4 + 3]; }
  }
  return { w, h, rgba };
}
