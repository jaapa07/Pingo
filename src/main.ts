/**
 * Inicialização de Adventures of Pingo: palco, kit, entrada, save, telas e laço de 60 Hz.
 * Fluxo: splash → título → saves → (novo jogo: abertura do time de eventos, se existir) → mundo.
 * Atalhos de teste por URL: `?zona=A1&x=10&y=8`, `?batalha=10,5` (src/world), `?tela=<id>` e `?vitrine=1` (kit).
 */
import './styles/base.css';
import './styles/kit.css';
import './styles/toque.css';
import { carregarAtlas } from './core/assets';
import { setLoopTarget, startLoop } from './core/loop';
import { bus } from './core/events';
import { jogo, novoSave } from './core/estado';
import { rng } from './core/rng';
import { input, iniciarInput, pollInput } from './core/input';
import { plataforma } from './core/plataforma';
import * as save from './core/save';
import { telas, registrarTela, criarTela, temTela } from './ui/telas';
import { iniciarPalco, palco } from './ui/palco';
import { iniciarKit } from './ui/kit';
import { iniciarToque } from './ui/toque';
import * as dialogo from './ui/dialogo';
import { criarSplash } from './ui/telas/splash';
import { criarTitulo } from './ui/telas/titulo';
import { criarSaves } from './ui/telas/saves';
import { criarTelaNome } from './ui/telas/nome';
import { criarRelogio } from './ui/telas/relogio';
import { criarOpcoes, aplicarVolumes } from './ui/telas/opcoes';
import { criarVitrine } from './ui/telas/vitrine';

type Modulo = Record<string, unknown>;
// módulos de outros times: carregados com tolerância (podem não existir ou falhar durante o desenvolvimento)
const gMundo = import.meta.glob('./world/index.ts'), gBatalha = import.meta.glob('./battle/index.ts'), gAudio = import.meta.glob('./audio/index.ts');
const gTelas = import.meta.glob(['./ui/telas/registro.ts', './battle/view/index.ts', './battle/view.ts']);
const gMec = import.meta.glob('./world/mecanicas/index.ts');
async function tentar(g: Record<string, () => Promise<unknown>>): Promise<Modulo | null> {
  const f = Object.values(g)[0]; if (!f) return null;
  try { return (await f()) as Modulo; } catch (e) { console.warn('[pingo] módulo indisponível:', Object.keys(g)[0], e); return null; }
}

let mundo: Modulo | null = null, audio: Modulo | null = null;
const musica = (id: string) => bus.emit('musica', id);
function musicaDoTitulo() {
  const lista = (audio?.audio as { listMusic?(): string[] } | undefined)?.listMusic?.() ?? [];
  const id = ['titulo', 'abertura', 'cidade-choro'].find((m) => lista.includes(m)); if (id) musica(id);
}

function irAoTitulo() {
  save.marcarEmJogo(false);
  void telas.trocar(criarTela('titulo', { aoJogar: irAosSaves, aoOpcoes: () => void dialogo.abrirTela('opcoes') }));
  musicaDoTitulo();
}
let pendenteQr: string | undefined;
function irAosSaves() {
  void telas.trocar(criarTela('saves', { aoNovo: novoJogo, aoContinuar: continuar, aoVoltar: irAoTitulo, pendente: pendenteQr }));
  pendenteQr = undefined;
}
async function entrarNoMundo() {
  save.marcarEmJogo(true);
  const j = jogo.save.jogador;
  try {
    if (mundo && typeof mundo.irPara === 'function') { await (mundo.irPara as (z: string, x: number, y: number, d?: string) => Promise<void>)(j.zona, j.x, j.y, j.dir); return; }
    if (temTela('mundo')) { await telas.trocar(criarTela('mundo')); return; }
  } catch (e) { console.error('[pingo] não foi possível entrar em', j.zona, e); }
  save.marcarEmJogo(false);
  await dialogo.falar(`O lugar "${j.zona}" não foi encontrado neste pacote do jogo.`);
  irAoTitulo();
}
async function novoJogo(slot: number) {
  jogo.slot = slot; jogo.carregar(novoSave()); rng.seed(jogo.save.rng);
  // a sequência de abertura é um evento do time de level design; se existir, ela cuida do nome e do relógio
  if (temTela('intro')) { await telas.trocar(criarTela('intro')); return; }
  const rodar = mundo?.rodarEvento as ((id: string) => Promise<void>) | undefined;
  await entrarNoMundo();
  if (rodar && save.estaEmJogo()) { try { await rodar('abertura'); } catch { /* sem evento de abertura neste pacote */ } }
}
async function continuar(slot: number, retomada: boolean) {
  const ok = retomada ? save.carregarRetomada() : save.carregarSlot(slot);
  if (!ok) { await dialogo.falar('Este jogo não pôde ser aberto.'); return; }
  save.limparRetomada();
  await entrarNoMundo();
}

async function iniciar() {
  const raiz = iniciarPalco();
  const avisos = document.createElement('div'); avisos.id = 'avisos'; raiz.append(avisos);
  telas.iniciar(raiz);
  await save.iniciarSave();
  iniciarInput(); input.recarregarTeclas();
  await Promise.all([carregarAtlas(), iniciarKit()]);
  iniciarToque();

  registrarTela('splash', criarSplash); registrarTela('titulo', criarTitulo); registrarTela('saves', criarSaves);
  registrarTela('nome', criarTelaNome); registrarTela('relogio', criarRelogio); registrarTela('opcoes', criarOpcoes);
  registrarTela('vitrine-kit', criarVitrine);

  [audio, mundo] = await Promise.all([tentar(gAudio), tentar(gMundo)]);
  await tentar(gMec); await tentar(gBatalha); for (const [k, f] of Object.entries(gTelas)) await tentar({ [k]: f });
  aplicarVolumes();
  // o primeiro gesto libera o áudio (exigência do iOS)
  const liberar = () => { (audio?.audio as { unlock?(): void } | undefined)?.unlock?.(); };
  for (const ev of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(ev, liberar, { passive: true });

  let relogioTempo = 0;
  setLoopTarget({
    update(dt) {
      pollInput(dt);
      if (!telas.ocupada) telas.atualizar(dt);
      if (save.estaEmJogo()) { relogioTempo += dt; if (relogioTempo >= 1) { relogioTempo -= 1; jogo.save.tempoJogo += 1; } }
    },
    render(alpha) { telas.desenhar(alpha); },
  });
  plataforma.aoMudarVisibilidade((visivel) => { if (!visivel) { input.soltarTudo(); save.gravarRetomada(); } bus.emit('visibilidade', { visivel }); });

  (window as unknown as { __pingo: unknown }).__pingo = { jogo, telas, mundo: mundo?.mundo, bus, input, save, dialogo, palco, plataforma, audio: audio?.audio };

  // save recebido por QR/link: #pingo=<parte>
  const m = /#pingo=(.+)$/.exec(location.hash);
  if (m) {
    history.replaceState(null, '', location.pathname + location.search);
    const parte = decodeURIComponent(m[1]);
    if (parte.startsWith('PINGO1:')) pendenteQr = parte;
    else { const r = save.receberParteQr(parte); if (r?.completo) pendenteQr = r.completo; else if (r) dialogo.avisar(`Código ${r.tem} de ${r.total} recebido. Leia os outros.`); }
  }

  startLoop();
  const q = new URLSearchParams(location.search);
  if (q.get('tela') && temTela(q.get('tela')!)) {
    const id = q.get('tela')!;
    const args: Record<string, unknown> = { titulo: 'Qual é o seu nome?', max: 8, aoJogar: irAosSaves, aoOpcoes: () => void dialogo.abrirTela('opcoes'), aoNovo: novoJogo, aoContinuar: continuar, aoVoltar: irAoTitulo, aoFim: irAoTitulo };
    telas.empilhar(criarTela(id, args)); return;
  }
  if (q.has('zona') || q.has('batalha')) {
    const porUrl = mundo?.iniciarPorUrl as ((p: URLSearchParams) => Promise<boolean>) | undefined;
    try { if (porUrl && (await porUrl(q))) { save.marcarEmJogo(true); jogo.slot = -1; return; } } catch (e) { console.error('[pingo] atalho de URL falhou', e); }
  }
  if (pendenteQr) { irAosSaves(); return; }
  telas.empilhar(criarTela('splash', { aoFim: irAoTitulo }));
}
void iniciar();
