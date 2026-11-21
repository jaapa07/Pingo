/**
 * PRÉ-CARGA de imagens de criaturas (feedback de jogador, docs/UI-CORRECOES.md): os sprites só eram baixados na hora em
 * que apareciam, e com rede lenta (celular; no pacote do itch.io cada criatura vem num `pacotes/criaturas-NN.bin` de
 * ~400 KB) o quadro da escolha do inicial ficava vazio por um tempo. Ao entrar numa zona, em segundo plano:
 *  - antes de ter o inicial: `frente` e `costas` dos três iniciais (quadro da mesa da Profª Ipê e a 1ª batalha);
 *  - a `costas` da equipe e a `frente` das criaturas da grama/caverna/água da zona, mais a arena dela e a folha de
 *    efeitos (a batalha espera essas imagens antes de abrir; assim ela abre sem demora no primeiro encontro).
 * Só pede; o navegador guarda. `precarregar` (src/core/assets.ts) não repete pedidos.
 */
import type { MetodoEncontro } from '../core/tipos';
import { jogo } from '../core/estado';
import { bus } from '../core/events';
import { precarregarModelo } from '../core/assets';
import { especie } from './deps';
import { zonaDef } from './zonas';
import { tabela } from './encontros';

/** os três iniciais da mesa do laboratório (src/data/eventos/a1.ts: Tamanduí, Guaraxim, Botinho) */
export const INICIAIS = [1, 4, 7] as const;
const METODOS: MetodoEncontro[] = ['grama', 'caverna', 'agua'];
/** no máximo tantas espécies da zona por vez (no itch cada uma pode puxar um pacote) */
const MAX_ZONA = 6;

const id = (n: number) => especie(n)?.id;
/** pré-carrega vistas de uma espécie pelo número (sem esperar) */
export function precarregarEspecie(n: number, vistas: string[] = ['frente']): Promise<void> {
  const i = id(n); return i ? precarregarModelo(i, vistas) : Promise.resolve();
}

function aoEntrar(zona: string) {
  const s = jogo.save;
  if (!s.flags['inicial']) for (const n of INICIAIS) void precarregarEspecie(n, ['frente', 'costas']);
  void precarregarModelo(s.jogador.avatar, ['costas']); // o treinador nas costas, na abertura de toda batalha
  // o resto espera a zona assentar (os bakes dela têm prioridade)
  setTimeout(() => {
    if (s !== jogo.save || s.jogador.zona !== zona) return;
    for (const c of s.equipe) if (!c.ovo) void precarregarEspecie(c.especie, ['costas']);
    const def = zonaDef(zona); if (!def) return;
    // as mais comuns primeiro (soma dos pesos nas tabelas da hora)
    const peso = new Map<number, number>();
    for (const m of METODOS) for (const e of tabela(def, m)?.t ?? []) peso.set(e.e, (peso.get(e.e) ?? 0) + e.peso);
    const nums = [...peso].sort((a, b) => b[1] - a[1]).map(([n]) => n);
    nums.slice(0, MAX_ZONA).forEach((n) => void precarregarEspecie(n));
    if (nums.length && def.arena) void import('../battle/view/palco').then((p) => p.precarregarArena(def.arena!)).catch(() => undefined);
    if (nums.length) void import('../battle/view/cena').then((c) => c.precarregarFx()).catch(() => undefined); // efeitos (a cuia, os golpes)
  }, 1200);
}

if (typeof document !== 'undefined') bus.on('zona', (e: unknown) => { const z = (e as { id?: string } | undefined)?.id; if (z) aoEntrar(z); });
