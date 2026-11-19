/** Servidor estático mínimo para os testes: publica `dist/` numa SUBPASTA (como o GitHub Pages em /Pingo/). */
import { createServer, type Server } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
};
export interface Servidor { url: string; pedidos: number; bytes: number; fechar(): Promise<void>; srv: Server }

export function servir(raiz: string, porta: number, sub = '/Pingo/'): Promise<Servidor> {
  const s: Servidor = { url: `http://localhost:${porta}${sub}`, pedidos: 0, bytes: 0, srv: null as unknown as Server, fechar: () => new Promise((ok) => { s.srv.closeAllConnections?.(); s.srv.close(() => ok()); }) };
  s.srv = createServer((req, res) => {
    const caminho = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (!caminho.startsWith(sub)) { res.writeHead(caminho === sub.slice(0, -1) ? 301 : 404, caminho === sub.slice(0, -1) ? { location: sub } : {}); res.end(); return; }
    let arq = normalize(join(raiz, caminho.slice(sub.length)));
    if (!arq.startsWith(normalize(raiz))) { res.writeHead(403); res.end(); return; }
    if (existsSync(arq) && statSync(arq).isDirectory()) arq = join(arq, 'index.html');
    if (!existsSync(arq)) { res.writeHead(404); res.end('não encontrado'); return; }
    const dados = readFileSync(arq);
    s.pedidos++; s.bytes += dados.length;
    res.writeHead(200, { 'content-type': MIME[extname(arq)] ?? 'application/octet-stream', 'content-length': dados.length, 'cache-control': 'max-age=600' });
    res.end(dados);
  });
  return new Promise((ok, falha) => { s.srv.once('error', falha); s.srv.listen(porta, () => ok(s)); });
}
