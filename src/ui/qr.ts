/**
 * Código QR desenhado em SVG: modo byte, correção de erros nível L, versões 1 a 40.
 * Usado na transferência de save entre aparelhos.
 */
const EC_POR_BLOCO = [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30];
const BLOCOS = [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25];

function modulosCrus(v: number) { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; }
const palavrasDeDados = (v: number) => Math.floor(modulosCrus(v) / 8) - EC_POR_BLOCO[v] * BLOCOS[v];

/* aritmética em GF(256) com o polinômio 0x11D */
function mul(x: number, y: number) { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z; }
function divisor(grau: number) { const r = new Array<number>(grau).fill(0); r[grau - 1] = 1; let raiz = 1; for (let i = 0; i < grau; i++) { for (let j = 0; j < grau; j++) { r[j] = mul(r[j], raiz); if (j + 1 < grau) r[j] ^= r[j + 1]; } raiz = mul(raiz, 2); } return r; }
function resto(dados: number[], div: number[]) { const r = div.map(() => 0); for (const b of dados) { const f = b ^ (r.shift() as number); r.push(0); div.forEach((c, i) => { r[i] ^= mul(c, f); }); } return r; }

/** devolve a matriz de módulos (true = escuro) do menor QR que comporta o texto */
export function matrizQr(txt: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(txt));
  let v = 1;
  for (; v <= 40; v++) { const cap = palavrasDeDados(v) * 8; if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= cap) break; }
  if (v > 40) throw new Error('texto grande demais para um código QR');
  // fluxo de bits: modo byte (0100), tamanho, dados, terminador e enchimento
  const bits: number[] = []; const por = (val: number, n: number) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  por(4, 4); por(bytes.length, v < 10 ? 8 : 16); for (const b of bytes) por(b, 8);
  const cap = palavrasDeDados(v) * 8;
  por(0, Math.min(4, cap - bits.length)); por(0, (8 - (bits.length % 8)) % 8);
  for (let p = 0xec; bits.length < cap; p ^= 0xec ^ 0x11) por(p, 8);
  const dados: number[] = []; for (let i = 0; i < bits.length; i += 8) dados.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  // blocos com Reed–Solomon, entrelaçados
  const nb = BLOCOS[v], ec = EC_POR_BLOCO[v], cru = Math.floor(modulosCrus(v) / 8), curtos = nb - (cru % nb), tamCurto = Math.floor(cru / nb);
  const div = divisor(ec); const blocos: number[][] = [];
  for (let i = 0, k = 0; i < nb; i++) { const d = dados.slice(k, k + tamCurto - ec + (i < curtos ? 0 : 1)); k += d.length; const e = resto(d, div); if (i < curtos) d.push(0); blocos.push(d.concat(e)); }
  const final: number[] = [];
  for (let i = 0; i < blocos[0].length; i++) blocos.forEach((b, j) => { if (i !== tamCurto - ec || j >= curtos) final.push(b[i]); });
  // matriz e padrões de função
  const n = v * 4 + 17;
  const m: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const fn: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const set = (x: number, y: number, escuro: boolean) => { if (x < 0 || y < 0 || x >= n || y >= n) return; m[y][x] = escuro; fn[y][x] = true; };
  for (let i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  const localizador = (cx: number, cy: number) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)); set(cx + dx, cy + dy, d !== 2 && d !== 4); } };
  localizador(3, 3); localizador(n - 4, 3); localizador(3, n - 4);
  const pos: number[] = [];
  if (v > 1) { const q = Math.floor(v / 7) + 2, passo = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (q * 2 - 2)) * 2; pos.push(6); for (let p = n - 7; pos.length < q; p -= passo) pos.splice(1, 0, p); }
  pos.forEach((cx, i) => pos.forEach((cy, j) => { if ((i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0)) return; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }));
  const formato = (mascara: number) => {
    const d = (1 << 3) | mascara; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((d << 10) | r) ^ 0x5412, bit = (i: number) => ((b >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(n - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, n - 15 + i, bit(i));
    set(8, n - 8, true);
  };
  formato(0);
  if (v >= 7) { let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25); const b = (v << 12) | r; for (let i = 0; i < 18; i++) { const bit = ((b >>> i) & 1) !== 0, a = n - 11 + (i % 3), c = Math.floor(i / 3); set(a, c, bit); set(c, a, bit); } }
  // dados em ziguezague
  let k = 0;
  for (let dir = n - 1; dir >= 1; dir -= 2) {
    if (dir === 6) dir = 5;
    for (let vert = 0; vert < n; vert++) for (let j = 0; j < 2; j++) {
      const x = dir - j, sobe = ((dir + 1) & 2) === 0, y = sobe ? n - 1 - vert : vert;
      if (!fn[y][x] && k < final.length * 8) { m[y][x] = ((final[k >>> 3] >>> (7 - (k & 7))) & 1) !== 0; k++; }
    }
  }
  // escolhe a máscara de menor penalidade
  const MASCARAS: ((x: number, y: number) => boolean)[] = [
    (x, y) => (x + y) % 2 === 0, (_x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ];
  const aplicar = (i: number) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fn[y][x] && MASCARAS[i](x, y)) m[y][x] = !m[y][x]; };
  const penalidade = () => {
    let p = 0, escuros = 0;
    for (let y = 0; y < n; y++) {
      let corL = false, runL = 0, corC = false, runC = 0;
      for (let x = 0; x < n; x++) {
        if (m[y][x]) escuros++;
        if (x > 0 && m[y][x] === corL) { runL++; if (runL === 5) p += 3; else if (runL > 5) p++; } else { corL = m[y][x]; runL = 1; }
        if (x > 0 && m[x][y] === corC) { runC++; if (runC === 5) p += 3; else if (runC > 5) p++; } else { corC = m[x][y]; runC = 1; }
        if (x + 1 < n && y + 1 < n && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
        if (x + 10 < n) { const s = (a: boolean[][], hor: boolean) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (hor ? a[y][x + d] : a[x + d][y]) ? '1' : '0').join(''); for (const hor of [true, false]) { const t = s(m, hor); if (t === '10111010000' || t === '00001011101') p += 40; } }
      }
    }
    return p + Math.floor(Math.abs((escuros * 20) / (n * n) - 10)) * 10;
  };
  let melhor = 0, menor = Infinity;
  for (let i = 0; i < 8; i++) { aplicar(i); formato(i); const p = penalidade(); if (p < menor) { menor = p; melhor = i; } aplicar(i); }
  aplicar(melhor); formato(melhor);
  return m;
}

/** SVG do QR: um <path> com um quadrado por módulo escuro, mais a margem de silêncio de 4 módulos */
export function svgQr(txt: string, lado: number): string {
  const m = matrizQr(txt), n = m.length, t = n + 8;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) d += `M${x + 4} ${y + 4}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${t} ${t}"><rect width="${t}" height="${t}" fill="#fff8e7"/><path d="${d}" fill="#1a1423"/></svg>`;
}
