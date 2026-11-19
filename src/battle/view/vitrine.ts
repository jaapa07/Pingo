/**
 * Galeria de conferência das animações de golpe (`?tela=vitrine-golpes&anim=brasa-3&lado=0&arena=mata`):
 * mostra a arena com duas criaturas e toca uma animação por vez. Esquerda/direita trocam, A repete, B inverte quem ataca.
 * `window.__pingoBatalha.medir()` mede a duração de todas em tempo simulado (teste do intervalo de 0,4 a 1,2 s).
 */
import { input } from '../../core/input';
import { bus } from '../../core/events';
import type { Tela } from '../../ui/telas';
import { em, escrever, texto } from '../../ui/fonte';
import { moldura } from '../../ui/kit';
import { ANIMS_MOTOR, ANIMS_USADAS } from '../anims-usadas';
import { ANIMS, type Golpeio } from '../anims';
import { Cena, precarregarFx } from './cena';
import { Palco, div, type Ator } from './palco';

const IDS: string[] = [...ANIMS_USADAS, ...ANIMS_MOTOR];
const ctx = (c: Cena, eu: Ator, outro: Ator, proprio: boolean): Golpeio => ({ c, eu, alvos: [proprio ? eu : outro], alvo: proprio ? eu : outro, outro, d: eu.lado === 0 ? 1 : -1, som: (id) => bus.emit('sfx', { id }) });
/** animações que recaem sobre quem usa (apoio, aura e efeitos do motor) */
const ehPropria = (id: string) => /^(status-[1347]|.*-4)$/.test(id) || (ANIMS_MOTOR as readonly string[]).includes(id);

/** mede todas as animações com um relógio próprio (sem esperar o tempo real) */
export async function medirAnimacoes(): Promise<Record<string, number>> {
  const palco = new Palco(false), a = palco.ator(0, 0), b = palco.ator(1, 0), r: Record<string, number> = {};
  a.definirCriatura(1); b.definirCriatura(4);
  for (const id of IDS) {
    const f = ANIMS[id]; if (!f) { r[id] = -1; continue; }
    let fim = false; const t0 = palco.cena.rel.tempo;
    void f(ctx(palco.cena, a, b, ehPropria(id))).then(() => { fim = true; }, () => { fim = true; r[id] = -2; });
    for (let i = 0; i < 600 && !fim; i++) { palco.cena.tique(1 / 60); for (let k = 0; k < 6; k++) await Promise.resolve(); }
    if (r[id] !== -2) r[id] = fim ? Math.round((palco.cena.rel.tempo - t0) * 100) / 100 : 99;
    palco.cena.limpar();
  }
  return r;
}

export function criarVitrineGolpes(): Tela {
  const q = new URLSearchParams(location.search);
  const el = document.createElement('div'); el.className = 'tela batalha';
  const palco = new Palco(false); el.append(palco.el);
  const hud = div('bt-hud', el), placa = moldura('placa', 200, 15, 60, 2), rot = texto('', { cor: 'amarelo', sombra: true, largura: 192, alinhar: 'centro' });
  placa.append(em(rot, 4, 4)); hud.append(placa);
  let i = Math.max(0, IDS.indexOf(q.get('anim') ?? '')), lado: 0 | 1 = q.get('lado') === '1' ? 1 : 0, tocando = false, pronto = false, auto = q.has('auto');
  const eu = () => palco.ator(lado, 0), outro = () => palco.ator(lado ? 0 : 1, 0);
  async function tocar() {
    if (tocando || !pronto) return; tocando = true;
    escrever(rot, `${IDS[i]}  (${i + 1}/${IDS.length})`);
    const t0 = palco.cena.rel.tempo;
    try { await ANIMS[IDS[i]]?.(ctx(palco.cena, eu(), outro(), ehPropria(IDS[i]))); } catch (e) { console.error(e); }
    escrever(rot, `${IDS[i]}  ${(palco.cena.rel.tempo - t0).toFixed(2)} s`);
    palco.cena.limparSegurados(); tocando = false;
    if (auto) { await palco.cena.espera(0.3); i = (i + 1) % IDS.length; void tocar(); }
  }
  return {
    el,
    entrar() {
      void Promise.all([palco.carregar(q.get('arena') ?? 'mata'), precarregarFx(), palco.precarregarCriatura(Number(q.get('a') ?? 1)), palco.precarregarCriatura(Number(q.get('b') ?? 4))]).then(() => {
        for (const l of [0, 1] as const) { const a = palco.ator(l, 0); [a.x, a.y] = palco.apoio(l, 0); a.definirCriatura(Number(q.get(l ? 'b' : 'a') ?? (l ? 4 : 1))); a.visivel = true; }
        pronto = true; void tocar();
      });
    },
    atualizar(dt) {
      palco.atualizar(dt);
      if (input.apertou('dir')) { i = (i + 1) % IDS.length; void tocar(); }
      else if (input.apertou('esq')) { i = (i + IDS.length - 1) % IDS.length; void tocar(); }
      else if (input.apertou('a')) void tocar();
      else if (input.apertou('b')) { lado = lado ? 0 : 1; void tocar(); }
      else if (input.apertou('select')) auto = !auto;
    },
    desenhar() { palco.desenhar(); },
  };
}
