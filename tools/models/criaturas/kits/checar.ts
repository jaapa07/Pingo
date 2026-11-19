/**
 * Conferência rápida dos modelos de criatura SEM renderizar (roda em Node):
 *   npx tsx tools/models/criaturas/kits/checar.ts [id|prefixo* ...]
 * Mostra malhas × mínimo, cores da paleta, tamanho da pose de repouso em cada vista, se alguma
 * animação apertou o enquadramento e o tamanho do marcador de olho em px.
 */
import { MODELOS } from '../../index';
import type { PixCriatura } from './criatura';

const filtros = process.argv.slice(2);
const casa = (id: string) => !filtros.length || filtros.some((p) => (p.endsWith('*') ? id.startsWith(p.slice(0, -1)) : p === id));
let ruins = 0;
for (const mod of MODELOS as PixCriatura[]) {
  if (mod.categoria !== 'criatura' || mod.num === undefined || !casa(mod.id)) continue;
  const rig = mod.build();
  const info = mod.info!;
  const cores = new Set(mod.paleta.rampas.flat()).size;
  const avisos: string[] = [];
  if (info.malhas < (mod.minMalhas ?? 0)) avisos.push(`malhas ${info.malhas} < mínimo ${mod.minMalhas}`);
  if (cores < 6 || cores > 12) avisos.push(`paleta com ${cores} cores (contrato: 6–12)`);
  if (/^#(0{6}|000)$/.test(mod.paleta.contorno)) avisos.push('contorno preto puro');
  const linhas = Object.entries(info.vistas).map(([n, v]) => {
    const [cw, ch] = mod.vistas[n].cell;
    const fr = Math.max(v.repouso[0] / cw, v.repouso[1] / ch);
    if (n !== 'mapa' && fr < 0.68) avisos.push(`${n}: repouso ocupa só ${(fr * 100).toFixed(0)}% da célula (animação larga demais?)`);
    if (n === 'frente' && (v.olhoPx < 1.6 || v.olhoPx > 4.5)) avisos.push(`marcador de olho com ${v.olhoPx.toFixed(1)} px na frente (ideal 2–4)`);
    return `  ${n.padEnd(6)} célula ${cw}×${ch} · repouso ${v.repouso[0]}×${v.repouso[1]} px · ${v.escala.toFixed(1)} px/un · pivô ${mod.vistas[n].pivot.join(',')}${v.apertadoPorAnim ? ` · APERTADO por '${v.maisLarga}'` : ''}${n === 'frente' ? ` · olho ${v.olhoPx.toFixed(1)} px` : ''}`;
  });
  console.log(`${String(mod.num).padStart(3, '0')} ${mod.id} (${mod.porte}/${mod.estagio}) · ${info.malhas} malhas (mín ${mod.minMalhas}) · ${cores} cores · ossos ${Object.keys(rig.bones).length}`);
  console.log(linhas.join('\n'));
  for (const a of avisos) { console.log('  ⚠ ' + a); ruins++; }
}
console.log(ruins ? `${ruins} aviso(s)` : 'tudo certo');
