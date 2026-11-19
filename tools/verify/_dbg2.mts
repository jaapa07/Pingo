import { carregar } from './dados';
import { encontrosDe } from './integridade';
const d = await carregar();
for (const t of d.treinadores.values()) if (t.insignia || /^liga/.test(t.id)) console.log(t.id, t.insignia ?? '', t.equipe.map((m) => `${m.e}@${m.nv}`).join(' '));
const porPasso = new Map<number, number[]>(), selv = new Map<number, number[]>();
const zonaDoTreinador = new Map<string, string>();
for (const z of d.zonas.values()) { if (z.mapa !== 'A') continue; for (const n of z.npcs ?? []) if (n.treinador) zonaDoTreinador.set(n.treinador, z.id);
  for (const n of z.npcs ?? []) { const t = n.treinador && d.treinadores.get(n.treinador); if (!t || z.passo === undefined) continue; const l = porPasso.get(z.passo) ?? []; l.push(...t.equipe.map((m) => m.nv)); porPasso.set(z.passo, l); }
  for (const h of z.habitats ?? []) { const base = [...(h.todos ?? []), ...(h.manha ?? []), ...(h.dia ?? []), ...(h.noite ?? [])]; if (z.passo === undefined) continue; const l = selv.get(z.passo) ?? []; for (const e of base) l.push(e.nv[0], e.nv[1]); selv.set(z.passo, l); } }
for (const [p, l] of [...porPasso].sort((a, b) => a[0] - b[0])) console.log('passo', p, 'treinadores nv', Math.min(...l), '–', Math.max(...l), '| selvagens', selv.get(p) ? Math.min(...selv.get(p)!) + '–' + Math.max(...selv.get(p)!) : '-');
console.log('zonas por passo', [...d.zonas.values()].filter((z) => z.mapa === 'A' && z.tipo !== 'interior').map((z) => z.id + ':' + z.passo).join(' '));
const semZona = [...d.treinadores.keys()].filter((t) => !zonaDoTreinador.has(t)); console.log('sem zona', semZona.join(' '));
