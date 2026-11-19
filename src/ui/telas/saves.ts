/**
 * Saves: 3 jogos (nome, insígnias, Diário, tempo), com novo/continuar/apagar e transferência entre
 * aparelhos (arquivo .pingo, código de texto e código QR em SVG).
 */
import { input, tocavel } from '../../core/input';
import { plataforma } from '../../core/plataforma';
import { listarSlots, apagarSlot, exportar, importar, lerExportado, lerRetomada, nomeArquivo, partesQr, N_SLOTS, type ResumoSlot } from '../../core/save';
import { telas, type Tela } from '../telas';
import { elTela, retirar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, cursorMao, fileiraInsignias, fmtTempo, som } from '../kit';
import { perguntar, confirmar, informar } from '../componentes/confirmacao';
import { svgQr } from '../qr';
import { palco } from '../palco';

export interface ArgsSaves { aoNovo(slot: number): void; aoContinuar(slot: number, retomada: boolean): void; aoVoltar(): void; /** texto exportado que chegou por QR/link e espera um slot */ pendente?: string }

/** mostra as partes do save como códigos QR grandes (fora da escala do palco, para a câmera ler) */
export function mostrarQr(partes: string[]): Promise<void> {
  return new Promise((fim) => {
    const vitrine = document.getElementById('vitrine')!;
    const el = elTela('ui', 'tela-qr');
    const faixa = moldura('placa', 312, 26, 4, 2); el.append(faixa);
    const info = texto('', { cor: 'creme', sombra: true, largura: 300, alinhar: 'centro' }); faixa.append(em(info, 6, 4));
    let i = 0;
    const base = location.protocol.startsWith('http') ? location.origin + location.pathname + '#pingo=' : '';
    const pintar = () => {
      const retrato = palco.modo === 'retrato';
      const livre = retrato ? Math.min(palco.vw - 40, palco.vh - (palco.y + palco.h) - palco.seguro.b - 48) : Math.min(palco.vw, palco.vh - palco.h * 0.34) - 48;
      vitrine.innerHTML = `<div class="qr">${svgQr(base + partes[i], Math.max(120, Math.floor(livre)))}</div>`;
      vitrine.style.alignItems = retrato ? 'flex-start' : 'flex-end';
      vitrine.style.paddingTop = retrato ? palco.y + palco.h + 24 + 'px' : '0'; vitrine.style.paddingBottom = retrato ? '0' : '20px';
      vitrine.classList.add('aberta');
      (vitrine.firstElementChild as HTMLElement).onpointerup = () => proximo();
      escrever(info, `Código ${i + 1} de ${partes.length}. Aponte a câmera do outro aparelho.\n${partes.length > 1 ? '→ ou toque: próximo.  ' : ''}B: fechar.`);
    };
    const proximo = () => { if (i + 1 < partes.length) { i++; som('ui-mover'); pintar(); } else fechar(); };
    const fechar = () => { vitrine.classList.remove('aberta'); vitrine.innerHTML = ''; retirar(tela); fim(); };
    const tela: Tela = {
      el, sobreposta: true, entrar: pintar,
      atualizar() {
        if (input.apertou('dir') || input.apertou('a')) proximo();
        else if (input.apertou('esq') && i > 0) { i--; som('ui-mover'); pintar(); }
        else if (input.apertou('b') || input.apertou('menu')) { som('ui-voltar'); fechar(); }
      },
    };
    tocavel(faixa, fechar);
    telas.empilhar(tela);
  });
}

export function criarSaves(args: ArgsSaves): Tela {
  const el = elTela('ui', 'tela-saves', 'fundo-azul');
  el.style.backgroundImage = 'repeating-linear-gradient(to bottom, #1f4f7a 0 8px, #1c4870 8px 16px)';
  el.append(em(texto('ESCOLHA UM JOGO', { tamanho: 12, cor: 'creme', sombra: true, largura: 320, alinhar: 'centro' }), 0, 1));
  const cartoes: HTMLElement[] = [];
  const cursor = cursorMao(); const sel = moldura('selecao', 298, 50); sel.classList.add('quica'); sel.style.pointerEvents = 'none';
  let indice = 0, ocupado = false, pendente = args.pendente;
  let slots: (ResumoSlot | null)[] = [];
  const rodape = texto('', { cor: 'creme', largura: 320, alinhar: 'centro' }); el.append(em(rodape, 0, 169));

  function desenhar() {
    slots = listarSlots();
    for (const c of cartoes) c.remove(); cartoes.length = 0;
    const ret = lerRetomada();
    slots.forEach((s, i) => {
      const c = moldura('azulejo', 294, 46, 20, 17 + i * 50);
      c.append(em(texto(`JOGO ${i + 1}`, { cor: 'azul' }), 12, 10));
      if (s) {
        c.append(em(texto(s.nome, { tamanho: 12, cor: 'tinta' }), 50, 8));
        const dir = texto(`Diário ${s.diario}/180   Tempo ${fmtTempo(s.tempo)}`, { cor: 'chumbo' });
        c.append(em(dir, 282 - parseInt(dir.style.width), 10));
        c.append(em(fileiraInsignias(s.insignias, 16, 17), 12, 21));
        if (ret?.slot === i) c.append(em(texto('•', { cor: 'vermelho' }), 44, 10));
      } else c.append(em(texto('— vazio —  Comece uma aventura nova aqui.', { cor: 'chumbo' }), 50, 10));
      tocavel(c, () => { mover(i, true); void escolher(); }, () => mover(i, true));
      el.append(c); cartoes.push(c);
    });
    el.append(sel, cursor); pintar();
  }
  function pintar() {
    em(sel, 18, 15 + indice * 50); em(cursor, 3, 34 + indice * 50);
    const s = slots[indice];
    escrever(rodape, pendente ? 'Escolha onde guardar o jogo recebido.  B: desistir' : s ? 'A: abrir   B: voltar' : 'A: novo jogo ou importar   B: voltar');
  }
  function mover(i: number, quieto = false) { if (i === indice || ocupado) return; indice = i; if (!quieto) som('ui-mover'); pintar(); }

  async function receber(txt: string, i: number) {
    try {
      const d = lerExportado(txt);
      if (slots[i] && !(await confirmar(`Substituir o Jogo ${i + 1} (${slots[i]!.nome}) pelo jogo de ${d.jogador.nome}?`, false))) return;
      importar(txt, i); som('salvar'); desenhar();
      await informar(`Jogo de ${d.jogador.nome} guardado no Jogo ${i + 1}.`);
    } catch (e) { som('ui-erro'); await informar(e instanceof Error ? e.message : 'Não foi possível importar.'); }
  }
  async function escolher() {
    if (ocupado) return; ocupado = true;
    try {
      const i = indice, s = slots[i];
      if (pendente) { const p = pendente; pendente = undefined; await receber(p, i); return; }
      if (!s) {
        const r = await perguntar(`Jogo ${i + 1} vazio`, ['Novo jogo', 'Importar arquivo .pingo', 'Colar código', 'Voltar']);
        if (r === 0) args.aoNovo(i);
        else if (r === 1) { const t = await plataforma.abrirArquivo(); if (t) await receber(t, i); }
        else if (r === 2) { const t = await plataforma.colar(); if (t) await receber(t, i); else await informar('Não consegui ler a área de transferência. Use o arquivo .pingo.'); }
        return;
      }
      const ret = lerRetomada()?.slot === i;
      const ops = [...(ret ? ['Retomar de onde parou'] : []), 'Continuar', 'Exportar arquivo .pingo', 'Mostrar código QR', 'Copiar código', 'Apagar', 'Voltar'];
      const r = ops[await perguntar(`${s.nome} — ${s.insignias.length} insígnia${s.insignias.length === 1 ? '' : 's'}`, ops)];
      if (r === 'Retomar de onde parou') args.aoContinuar(i, true);
      else if (r === 'Continuar') args.aoContinuar(i, false);
      else if (r === 'Exportar arquivo .pingo') { const ok = await plataforma.salvarArquivo(nomeArquivo(s), exportar(i)); await informar(ok ? 'Arquivo gerado. Leve-o para o outro aparelho e use "Importar arquivo".' : 'Não foi possível gerar o arquivo.'); }
      else if (r === 'Mostrar código QR') {
        const partes = partesQr(exportar(i));
        if (partes.length > 12 && !(await confirmar(`Este jogo precisa de ${partes.length} códigos. O arquivo .pingo é mais prático. Mostrar mesmo assim?`, false))) return;
        await mostrarQr(partes);
      } else if (r === 'Copiar código') await informar((await plataforma.copiar(exportar(i))) ? 'Código copiado. No outro aparelho, use "Colar código" num jogo vazio.' : 'Não foi possível copiar. Use o arquivo .pingo.');
      else if (r === 'Apagar') {
        if ((await confirmar(`Apagar o Jogo ${i + 1} de ${s.nome}?`, false)) && (await confirmar('Tem certeza? Isso não tem volta.', false))) { apagarSlot(i); som('ui-voltar'); desenhar(); }
      }
    } finally { ocupado = false; }
  }
  return {
    el,
    entrar() { desenhar(); const v = slots.findIndex((s) => (pendente ? !s : !!s)); if (v > 0) { indice = v; pintar(); } },
    voltar() { pintar(); },
    atualizar() {
      if (ocupado) return;
      if (input.repetiu('baixo')) mover((indice + 1) % N_SLOTS);
      else if (input.repetiu('cima')) mover((indice + N_SLOTS - 1) % N_SLOTS);
      if (input.apertou('a')) { input.consumir('a'); som('ui-ok'); void escolher(); }
      else if (input.apertou('b')) { input.consumir('b'); som('ui-voltar'); if (pendente) { pendente = undefined; pintar(); } else args.aoVoltar(); }
    },
  };
}
