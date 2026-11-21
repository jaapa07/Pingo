/**
 * Saves: 3 jogos (nome, insígnias, Diário, tempo), com novo/continuar/apagar e transferência entre
 * aparelhos (arquivo .pingo, código de texto e código QR em SVG).
 */
import { input, tocavel } from '../../core/input';
import { plataforma } from '../../core/plataforma';
import { listarSlots, apagarSlot, exportar, importar, lerExportado, lerRetomada, nomeArquivo, partesQr, slotDanificado, N_SLOTS, type ResumoSlot } from '../../core/save';
import { telas, type Tela } from '../telas';
import { elTela, retirar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, cursorMao, fileiraInsignias, fmtTempo, som, botao } from '../kit';
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

/**
 * Quadro com um campo de texto de verdade (do sistema) para o código de transferência: em "colar", o jogador
 * toca e segura e escolhe Colar no menu do iOS (ou Ctrl+V no PC) e o texto é devolvido; em "copiar", o código
 * fica selecionado no campo para Copiar à mão quando o navegador nega a área de transferência.
 * O texto do campo fica invisível (sem fontes do sistema na tela): o quadro mostra o estado na fonte do jogo.
 */
export function campoCodigo(modo: 'colar' | 'copiar', codigo = ''): Promise<string | null> {
  return new Promise((fim) => {
    const el = elTela('ui', 'tela-codigo');
    const cx = moldura('madeira', 296, 160, 12, 10); el.append(cx);
    cx.append(em(texto(modo === 'colar' ? 'COLAR CÓDIGO' : 'COPIAR CÓDIGO', { tamanho: 12, cor: 'tinta', largura: 280, alinhar: 'centro' }), 8, 9));
    cx.append(em(texto(modo === 'colar' ? 'Toque e segure no quadro abaixo e escolha Colar.\nNo PC: clique no quadro e aperte Ctrl+V.' : 'Toque e segure no quadro abaixo e escolha Copiar.\nNo PC: clique no quadro e aperte Ctrl+C.', { cor: 'chumbo', largura: 272, alinhar: 'centro' }), 12, 27));
    const quadro = moldura('bisel', 256, 44, 20, 50); cx.append(quadro);
    const ta = document.createElement('textarea');
    ta.className = 'campo-codigo'; ta.value = codigo; ta.readOnly = modo === 'copiar';
    ta.setAttribute('autocapitalize', 'off'); ta.setAttribute('autocomplete', 'off'); ta.setAttribute('autocorrect', 'off'); ta.spellcheck = false;
    ta.setAttribute('aria-label', modo === 'colar' ? 'Cole aqui o código do jogo' : 'Código do jogo');
    // no toque, só o menu de colar/copiar: o teclado virtual não abre
    if (input.modo === 'toque' || plataforma.toque) ta.setAttribute('inputmode', 'none');
    ta.style.cssText = 'left:6px;top:6px;width:244px;height:32px';
    const estado = texto('', { cor: 'tinta', largura: 236, alinhar: 'centro' }); estado.style.pointerEvents = 'none';
    quadro.append(ta, em(estado, 10, 12));
    const aviso = texto('', { cor: 'vermelho', largura: 272, alinhar: 'centro' }); aviso.style.pointerEvents = 'none'; cx.append(em(aviso, 12, 96)); // até 3 linhas, acima dos botões
    const rot = modo === 'colar' ? ['Colar', 'Usar código', 'Voltar'] : ['Copiar', 'Voltar'];
    const wb = modo === 'colar' ? 80 : 100, passo = wb + 8;
    const bts = rot.map((r) => botao(r, wb));
    const x0 = Math.floor((296 - (passo * (bts.length - 1) + wb)) / 2);
    bts.forEach((b, i) => cx.append(em(b.el, x0 + i * passo, 126)));
    let foco = modo === 'colar' ? 1 : 0, feito = false, visto = ta.value, abrir = 0;
    const pintarFoco = () => bts.forEach((b, i) => b.definirFoco(i === foco));
    /** devolve true se o texto do campo é um código completo */
    const pintar = (): boolean => {
      const v = ta.value.trim();
      if (modo === 'copiar') { escrever(estado, `Código do jogo: ${codigo.length} letras.`); return false; }
      if (!v) { escrever(estado, '— vazio —  Cole o código aqui.'); escrever(aviso, ''); return false; }
      try { const d = lerExportado(v); escrever(estado, `{c:verde}Jogo de ${d.jogador.nome}: código completo.{/c}`); escrever(aviso, ''); return true; }
      catch (e) { escrever(estado, `Recebido: ${v.length} letras.`); escrever(aviso, e instanceof Error ? e.message : 'Código inválido.'); return false; }
    };
    const sair = (r: string | null) => { if (feito) return; feito = true; clearInterval(vigia); clearTimeout(abrir); document.removeEventListener('selectionchange', tudo); ta.blur(); retirar(tela); fim(r); };
    const usar = () => {
      try { lerExportado(ta.value); som('ui-ok'); sair(ta.value); }
      catch (e) { som('ui-erro'); escrever(aviso, ta.value.trim() ? (e instanceof Error ? e.message : 'Código inválido.') : 'Cole o código no quadro primeiro.'); }
    };
    /**
     * O texto do campo mudou (colar pelo menu do sistema, Ctrl+V, botão "Colar"). O campo perde o foco na hora:
     * no iPhone, com o campo focado e o menu de colar aberto, o 1º toque fora dele só fecha o menu e não chega aos
     * botões — o jogador achava que nada tinha acontecido, colava de novo (o código ficava duplicado) e "Usar código"
     * passava a recusar. Código completo: "Usar código" fica em destaque e o jogo segue sozinho logo depois.
     */
    /** copiar: a seleção do campo é sempre o código inteiro */
    const tudo = () => { if (modo === 'copiar' && document.activeElement === ta && (ta.selectionStart !== 0 || ta.selectionEnd !== codigo.length)) ta.setSelectionRange(0, codigo.length); };
    const mudou = () => {
      if (feito || modo !== 'colar' || ta.value === visto) return;
      visto = ta.value; clearTimeout(abrir);
      const valido = pintar();
      if (valido || ta.value.trim()) ta.blur();
      if (valido) { foco = 1; pintarFoco(); som('ui-mover'); abrir = window.setTimeout(() => { if (!feito && pintar()) usar(); }, 700); }
    };
    const apertar = async (i: number) => {
      foco = i; pintarFoco();
      const r = rot[i];
      if (r === 'Voltar') { som('ui-voltar'); sair(null); }
      else if (r === 'Usar código') usar();
      else if (r === 'Colar') {
        // este toque é um gesto novo: o navegador pode liberar a leitura que antes negou
        const t = await plataforma.colar();
        if (feito) return;
        if (t) { ta.value = t; visto = ''; mudou(); }
        else { som('ui-erro'); escrever(aviso, 'O aparelho não deixou ler. Toque e segure no quadro e escolha Colar.'); }
      } else if (r === 'Copiar') {
        const ok = await plataforma.copiar(codigo);
        if (!ok) { ta.focus(); ta.select(); ta.setSelectionRange(0, codigo.length); }
        som(ok ? 'ui-ok' : 'ui-erro');
        escrever(aviso, ok ? '{c:verde}Copiado! No outro aparelho, use "Colar código".{/c}' : 'O aparelho não deixou. Toque e segure no quadro e escolha Copiar.');
      }
    };
    bts.forEach((b, i) => tocavel(b.el, () => void apertar(i), () => { foco = i; pintarFoco(); }));
    if (modo === 'colar') {
      // colar troca o texto inteiro do campo (não insere no meio do que já havia: colar duas vezes duplicava o código)
      ta.addEventListener('paste', (e) => {
        const t = e.clipboardData?.getData('text/plain') ?? e.clipboardData?.getData('text');
        if (!t) return; // sem dados no evento: deixa o navegador colar e o `input` (ou a vigia) pega
        e.preventDefault(); ta.value = t; mudou();
      });
      for (const ev of ['input', 'change', 'keyup', 'blur']) ta.addEventListener(ev, mudou);
    } else {
      // copiar: toque e segure no iPhone seleciona só uma "palavra" do código; a seleção volta a ser o código inteiro
      // copiou pelo menu do sistema: o campo solta o foco (no iPhone o 1º toque seguinte não chegaria a "Voltar")
      ta.addEventListener('copy', () => setTimeout(() => { if (feito) return; ta.blur(); som('ui-ok'); escrever(aviso, '{c:verde}Copiado! No outro aparelho, use "Colar código".{/c}'); }, 0));
      ta.addEventListener('focus', tudo); ta.addEventListener('select', tudo); ta.addEventListener('pointerup', () => setTimeout(tudo, 0));
      document.addEventListener('selectionchange', tudo);
    }
    // nem todo navegador avisa a mudança do mesmo jeito (o menu do iOS, extensões de teclado): confere o texto 4× por segundo
    const vigia = window.setInterval(mudou, 250);
    // enquanto o campo tem o foco, as teclas são dele (o jogo não as lê), menos Esc e Enter; o soltar (keyup)
    // segue para o jogo, senão a tecla que abriu este quadro ficaria presa como apertada
    ta.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); som('ui-voltar'); sair(null); }
      else if (e.key === 'Enter' && modo === 'colar') { e.preventDefault(); usar(); }
    });
    for (const ev of ['pointerdown', 'pointerup']) ta.addEventListener(ev, (e) => e.stopPropagation());
    const tela: Tela = {
      el, sobreposta: true,
      entrar() { pintar(); pintarFoco(); if (modo === 'colar' && input.modo !== 'toque' && !plataforma.toque) ta.focus(); },
      atualizar() {
        // as teclas digitadas no campo não chegam aqui (o keydown para nele); o que chega são os botões de toque
        // (A/B/setas da tela, que não tiram o foco do campo) e o controle: valem mesmo com o campo focado
        if (feito) return;
        if (input.apertou('esq') && foco > 0) { foco--; som('ui-mover'); pintarFoco(); }
        else if (input.apertou('dir') && foco < bts.length - 1) { foco++; som('ui-mover'); pintarFoco(); }
        else if (input.apertou('a')) { input.consumir('a'); ta.blur(); void apertar(foco); }
        else if (input.apertou('b')) { input.consumir('b'); som('ui-voltar'); sair(null); }
      },
    };
    telas.empilhar(tela);
  });
}
const pareceCodigo = (t: string | null): t is string => !!t && /PINGO\d/.test(t);

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
      } else if (slotDanificado(i)) c.append(em(texto('— danificado —  Este jogo não pôde ser lido.', { cor: 'vermelho' }), 50, 10));
      else c.append(em(texto('— vazio —  Comece uma aventura nova aqui.', { cor: 'chumbo' }), 50, 10));
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
        const ruim = slotDanificado(i);
        const r = await perguntar(`Jogo ${i + 1} ${ruim ? 'danificado' : 'vazio'}`, ['Novo jogo', 'Importar arquivo .pingo', 'Colar código', 'Voltar']);
        if (r === 0) { if (!ruim || (await confirmar('O que restou deste jogo danificado será apagado. Começar mesmo assim?', false))) args.aoNovo(i); }
        else if (r === 1) { const t = await plataforma.abrirArquivo(); if (t) await receber(t, i); }
        else if (r === 2) {
          // lê a área de transferência; se o aparelho negar (ou não houver código nela), abre o campo para colar à mão
          const lido = await plataforma.colar();
          const t = pareceCodigo(lido) ? lido : await campoCodigo('colar', lido ?? '');
          if (t) await receber(t, i);
        }
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
      } else if (r === 'Copiar código') {
        // sempre pelo quadro de copiar: o toque no botão "Copiar" é um gesto novo, e o Safari do iPhone só copia de
        // verdade assim (depois do menu, o recurso antigo dizia "copiado" sem copiar nada e o outro aparelho recebia
        // outro texto que estava na área de transferência)
        await campoCodigo('copiar', exportar(i));
      }
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
