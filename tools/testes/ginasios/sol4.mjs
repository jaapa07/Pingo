// verificador do labirinto de cipós: BFS em (x, y, t) com reinício nos vasos
export function resolver(mapa, vinhas, vasos, inicio, alvo, tmax = 120) {
  const D = { n: [0, -1], s: [0, 1], l: [1, 0], o: [-1, 0] };
  const livre = (x, y) => '.,:;+'.includes(mapa[y]?.[x] ?? '#');
  const tiles = vinhas.map((v) => { let [x, y] = v.de; const r = [[x, y]]; for (const c of v.rota) { x += D[c][0]; y += D[c][1]; r.push([x, y]); } return r; });
  for (const [i, r] of tiles.entries()) for (const [x, y] of r) if (!livre(x, y)) throw new Error(`vinha ${i} passa por tile não livre ${x},${y}`);
  // tile bloqueado no tempo t (t = passos desde o reinício): índice i cresce quando t >= atraso + i + 1
  const bloq = (x, y, t) => tiles.some((r, vi) => r.some(([a, b], i) => a === x && b === y && t >= (vinhas[vi].atraso ?? 0) + i + 1));
  const chave = (x, y, t) => `${x},${y},${t}`;
  const ini = [inicio[0], inicio[1], 0], visto = new Map([[chave(...ini), null]]);
  let fila = [ini], dist = new Map([[chave(...ini), 0]]);
  while (fila.length) {
    const [x, y, t] = fila.shift(), k = chave(x, y, t), d = dist.get(k);
    if (x === alvo[0] && y === alvo[1]) { const cam = []; let c = k; while (c) { cam.push(c); c = visto.get(c); } return { passos: d, caminho: cam.reverse() }; }
    const prox = [];
    if (t > 0 && vasos.some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) === 1)) prox.push([x, y, 0, 0]);
    if (t < tmax) for (const c of 'nslo') { const nx = x + D[c][0], ny = y + D[c][1]; if (livre(nx, ny) && !bloq(nx, ny, t) ) prox.push([nx, ny, t + 1, 1]); }
    for (const [nx, ny, nt, custo] of prox) { const nk = chave(nx, ny, nt); if (!visto.has(nk)) { visto.set(nk, k); dist.set(nk, d + custo); if (custo) fila.push([nx, ny, nt]); else fila.unshift([nx, ny, nt]); } }
  }
  return null;
}
