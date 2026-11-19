/** Bancada de áudio (desenvolvimento): ouvir cada item e medir pico/RMS offline. Abrir /src/audio/teste.html no Vite. */
import { audio } from './index';
import { VOZES } from './babble';
import { medirGrito, medirMusica, medirSfx, type Medida } from './medir';
import { NIVEL_GRITO, NIVEL_MUSICA, NIVEL_SFX } from './niveis';
import { FAIXAS } from '../data/music';
import { SFX, SONS_AMB } from '../data/sfx';
import { TOTAL_GRITOS } from '../data/gritos';
import { bus } from '../core/events';

const el = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;
function botao(pai: string, rotulo: string, fn: () => void): void {
  const b = document.createElement('button');
  b.textContent = rotulo;
  b.addEventListener('click', fn);
  el(pai).appendChild(b);
}
for (const id of audio.listMusic()) botao('musicas', id, () => audio.playMusic(id));
for (const id of audio.listAmbience()) botao('ambientes', id, () => audio.playAmbience(id));
botao('ambientes', '(nenhum)', () => audio.playAmbience(null));
for (const v of Object.keys(VOZES)) botao('vozes', v, () => audio.babble(v, (el('fala') as HTMLInputElement).value));
for (const id of audio.listSfx()) botao('sfx', id, () => audio.playSfx(id));
for (let n = 1; n <= TOTAL_GRITOS; n++) botao('gritos', String(n), () => audio.grito(n));
el('parar').addEventListener('click', () => audio.stopMusic());

const db = (x: number): number => Math.round(200 * Math.log10(Math.max(1e-6, x))) / 10;

export interface Relatorio {
  musica: Record<string, Medida>; sfx: Record<string, Medida>; grito: Record<number, Medida>;
}

/** Mede tudo com os níveis atuais de `niveis.ts` (ou sem eles, para calcular a correção). */
async function medirTudo(comNiveis: boolean): Promise<Relatorio> {
  const r: Relatorio = { musica: {}, sfx: {}, grito: {} };
  const vistos = new Set<string>();
  for (const [id, f] of Object.entries(FAIXAS)) {
    if (vistos.has(f.id)) continue;
    vistos.add(f.id);
    r.musica[id] = await medirMusica(id, comNiveis ? NIVEL_MUSICA[id] ?? 1 : 1);
  }
  for (const id of [...Object.keys(SFX), ...Object.keys(SONS_AMB)]) r.sfx[id] = await medirSfx(id, comNiveis ? NIVEL_SFX[id] ?? 1 : 1);
  for (let n = 1; n <= TOTAL_GRITOS; n++) r.grito[n] = await medirGrito(n, comNiveis ? NIVEL_GRITO[n] ?? 1 : 1);
  return r;
}

el('nivelar').addEventListener('click', async () => {
  el('saida').textContent = 'medindo…';
  const r = await medirTudo(true);
  const linhas: string[] = [];
  for (const [grupo, itens] of Object.entries(r)) {
    linhas.push(`== ${grupo}`);
    for (const [id, m] of Object.entries(itens as Record<string, Medida>)) linhas.push(`${id.padEnd(22)} pico ${String(db(m.pico)).padStart(6)} dB  rms ${String(db(m.rms)).padStart(6)} dB`);
  }
  el('saida').textContent = linhas.join('\n');
});

(window as unknown as Record<string, unknown>).__audioTeste = { audio, bus, medirTudo, vozes: Object.keys(VOZES) };
