/**
 * Busca de equipe de líder contra equipes HONESTAS (as que o piloto levou até o líder jogando), motor puro, piloto esperto.
 * `npx tsx tools/testes/qa/busca-honesta.ts <candidatos.json> <equipes.json> [--n 150] [--itens cha-cidreira:2]`
 * equipes.json: { "Mata": ["1:11,10:6,13:2,45:5", …], … }; candidato: "107:7:bicada:esguicho,49:10:bicada:cara-feia"
 */
import { readFileSync } from 'node:fs';
import { carregarDados, instanciar, lutarContra, pilotoEsperto, rng, type Piloto } from '../../equilibrio-referencia';
import { atributos } from '../../../src/battle/criatura';
import { criarDeMembro } from '../../../src/battle/criatura';
const arg = (k: string, d: string) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
await carregarDados();
const N = Number(arg('n', '150'));
const cands: string[] = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const grupos: Record<string, string[]> = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const itens = Object.fromEntries(arg('itens', 'cha-cidreira:2').split(',').map((x) => { const [id, q] = x.split(':'); return [id, Number(q)]; }));
// --cura-livre: o jogador que guarda os chás para o líder e bebe quando a criatura fica abaixo da metade (até 3 por criatura)
const curaLivre: Piloto = { ...pilotoEsperto, acao(b, p, m) {
  const c = b.criatura(p)!, max = atributos(c).vida, it = b.lados[0].itens, n = m.curas.get(c.uid) ?? 0, ind = b.lados[0].ativos[p.pos];
  if (c.vida > 0 && c.vida < max * 0.5 && n < 3 && (it['cha-cidreira'] ?? 0) > 0 && b.itemServe(0, 'cha-cidreira', ind)) { m.curas.set(c.uid, n + 1); return { tipo: 'item', item: 'cha-cidreira', alvo: ind }; }
  return pilotoEsperto.acao(b, p, m);
} };
const piloto = process.argv.includes('--cura-livre') ? curaLivre : pilotoEsperto;
const parse = (s: string) => s.split(',').map((x) => { const [e, nv, ...g] = x.split(':'); return { e: Number(e), nv: Number(nv), ...(g.length ? { golpes: g } : {}) }; });
const linhas: [number, string][] = [];
for (const c of cands) {
  const lid = parse(c);
  const r = Object.entries(grupos).map(([nome, eqs], k) => {
    let v = 0, tot = 0;
    for (const [j, eq] of eqs.entries()) for (let i = 0; i < N; i++) { rng.seed(1000 + i * 7919 + k * 31 + j * 131); tot++; if (lutarContra(instanciar(parse(eq) as never), { ...itens }, lid.map((m) => criarDeMembro(m as never, 'L')), 'L', piloto, 'lider', {}).vitoria) v++; }
    return [nome, Math.round((100 * v) / tot)] as const;
  });
  const fora = r.reduce((a, [, x]) => a + Math.max(0, 45 - x, x - 75), 0);
  linhas.push([fora, `${r.map(([n, x]) => n + ' ' + String(x).padStart(3)).join('  ')}  fora ${String(fora).padStart(3)}  ${c}`]);
}
linhas.sort((a, b) => a[0] - b[0]);
console.log(linhas.slice(0, Number(arg('top', '30'))).map((l) => l[1]).join('\n'));
