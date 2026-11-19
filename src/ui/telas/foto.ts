/**
 * MODO FOTO (Câmera de Bolso) — visor sobre a cena de baixo (o mapa), com filtros por CSS aplicados na hora.
 * `A` fotografa (clarão e som); a foto pode ir para o álbum (até 24). Sem canvas, a foto guardada é um cartão
 * recomposto: lugar, período, filtro, avatar e a primeira criatura da equipe (`flags['fotos']`, em JSON).
 * Cada foto emite `bus.emit('foto', { zona, local, periodo, filtro, especie })` para as missões de fotografia.
 */
import type { Periodo } from '../../core/tipos';
import { jogo, periodo } from '../../core/estado';
import { input, tocavel } from '../../core/input';
import { bus } from '../../core/events';
import { vista } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { telas, type Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, som, camada, spr, seta } from '../kit';
import { Grade } from '../componentes/grade';
import { perguntar, informar, confirmar } from '../componentes/confirmacao';
import { faixaDica, caixa, iconeCriatura, nomeEsp, placaTitulo, rotulo } from './comum';
import { local, baseZona, nomeLocal } from './mapa-dados';
import { T } from '../../data/textos-ui';

export interface Foto { z: string; p: Periodo; f: string; e: number; a: 'kaue' | 'ayra'; d: number }
export const FILTROS: { id: string; nome: string; css: string }[] = [
  { id: 'natural', nome: 'Natural', css: '' }, { id: 'sepia', nome: 'Sépia', css: 'sepia(0.9)' }, { id: 'pb', nome: 'Preto e branco', css: 'grayscale(1) contrast(1.15)' },
  { id: 'vivo', nome: 'Cores vivas', css: 'saturate(1.8)' }, { id: 'luar', nome: 'Luar', css: 'hue-rotate(200deg) saturate(1.2) brightness(0.8)' },
  { id: 'sonho', nome: 'Sonho', css: 'hue-rotate(-35deg) saturate(1.4) brightness(1.1)' }, { id: 'negativo', nome: 'Negativo', css: 'invert(1)' },
];
const MAX = 24;
export function lerAlbum(): Foto[] { try { const v = JSON.parse(String(jogo.save.flags['fotos'] ?? '[]')); return Array.isArray(v) ? v : []; } catch { return []; } }
const gravarAlbum = (a: Foto[]) => { jogo.save.flags['fotos'] = JSON.stringify(a); };
const CEU: Record<Periodo, [string, string]> = { manha: ['#f7c4e0', '#c8f0f4'], dia: ['#2f86c4', '#6fc7e8'], tarde: ['#a32638', '#f58a4b'], noite: ['#1a1423', '#1f4f7a'] };

/** cartão-postal recomposto de uma foto (w×h px) */
export function cartao(f: Foto, w: number, h: number): { el: HTMLElement; sprites: Sprite[] } {
  const el = caixa('recorte', w, h), tipo = local(baseZona(f.z) ?? '')?.tipo ?? 'rota', [c1, c2] = CEU[f.p];
  const chao = Math.round(h * 0.72);
  el.style.background = `linear-gradient(${c1} 0 ${Math.round(h * 0.3)}px, ${c2} ${Math.round(h * 0.3)}px)`;
  const astro = spr(f.p === 'noite' ? 'lua' : 'sol'); el.append(em(astro, f.p === 'manha' ? 6 : f.p === 'tarde' ? w - 20 : Math.round(w * 0.6), f.p === 'dia' ? 3 : 8));
  const fundo = tipo === 'agua' ? null : camada(tipo === 'mata' ? 'mata' : tipo === 'serra' || tipo === 'caverna' || tipo === 'ruina' ? 'serra' : 'morros');
  if (fundo) { const d = caixa('', w, fundo.h); d.style.background = `url(${fundo.url}) repeat-x`; el.append(em(d, 0, chao - fundo.h + 2)); }
  const piso = caixa('', w, h - chao);
  if (tipo === 'agua') { const m = camada('mar'); piso.style.background = `url(${m.url}) repeat`; } else piso.style.background = tipo === 'cidade' ? '#e8c07a' : tipo === 'caverna' || tipo === 'ruina' ? '#8a8aa0' : tipo === 'serra' ? '#c98f4e' : '#4fa346';
  piso.style.boxShadow = 'inset 0 1px 0 rgba(26,20,35,0.35)'; el.append(em(piso, 0, chao));
  const sprites: Sprite[] = [];
  const m = vista(f.a, 'mapa');
  if (m) { const s = new Sprite(f.a, 'mapa', el); s.x = m.px + Math.round(w / 2) - 22; s.y = m.py + chao + 6 - m.ch; s.tocar('idle-s'); s.desenhar(); sprites.push(s); }
  if (f.e) { const ic = iconeCriatura(f.e); el.append(em(ic.el, Math.round(w / 2) + 2, chao - 16)); }
  el.style.filter = FILTROS.find((x) => x.id === f.f)?.css ?? '';
  return { el, sprites };
}

export function criarFoto(): Tela {
  const s = jogo.save;
  const el = elTela('ui', 'tela-foto');
  let alvo: HTMLElement | null = null, propria: HTMLElement | null = null, filtro = 0, flash = 0, ocupado = false, viva = true, album: HTMLElement | null = null, grade: Grade | null = null, pagina = 0;
  const agora = (): Foto => ({ z: s.jogador.zona, p: periodo(), f: FILTROS[filtro].id, e: s.equipe.find((c) => !c.ovo)?.especie ?? 0, a: s.jogador.avatar, d: Date.now() });
  const visor = caixa('', 320, 180); el.append(visor);
  for (const [x, y, bx, by] of [[10, 22, 1, 1], [298, 22, -1, 1], [10, 140, 1, -1], [298, 140, -1, -1]] as const) { const c = caixa('', 12, 12); c.style.boxShadow = `inset ${bx * 2}px ${by * 2}px 0 #fff8e7`; c.style.pointerEvents = 'none'; visor.append(em(c, x, y)); }
  const mira = caixa('', 9, 9); mira.style.background = 'linear-gradient(#fff8e7,#fff8e7) 4px 0/1px 9px no-repeat, linear-gradient(#fff8e7,#fff8e7) 0 4px/9px 1px no-repeat'; mira.style.pointerEvents = 'none'; visor.append(em(mira, 155, 85));
  const placa = moldura('placa', 150, 15, 85, 2); visor.append(placa);
  const tFiltro = texto('', { cor: 'amarelo', sombra: true, largura: 118, alinhar: 'centro' }); placa.append(em(tFiltro, 16, 4));
  const sE = em(seta('esq'), 5, 4), sD = em(seta('dir'), 139, 4); placa.append(sE, sD);
  tocavel(sE, () => trocar(-1)); tocavel(sD, () => trocar(1));
  const btAlbum = moldura('botao', 44, 14, 272, 3); btAlbum.append(em(texto('Álbum', { cor: 'tinta' }), 8, 3)); visor.append(btAlbum); tocavel(btAlbum, abrirAlbum);
  const btFoto = moldura('botao-foco', 60, 14, 130, 148); btFoto.append(em(texto('A: Foto', { cor: 'tinta' }), 12, 3)); visor.append(btFoto); tocavel(btFoto, () => void fotografar());
  const clarao = caixa('', 320, 180); clarao.style.background = '#fff8e7'; clarao.style.display = 'none'; clarao.style.zIndex = '9'; clarao.style.pointerEvents = 'none'; el.append(clarao);
  const dica = faixaDica(el);
  function aplicar() { if (alvo) alvo.style.filter = FILTROS[filtro].css; escrever(tFiltro, FILTROS[filtro].nome); }
  function trocar(d: number) { if (ocupado || album) return; filtro = (filtro + d + FILTROS.length) % FILTROS.length; som('ui-mover'); aplicar(); }
  async function fotografar() {
    if (ocupado || album) return; ocupado = true;
    som('foto'); flash = 0.45; clarao.style.display = ''; clarao.style.opacity = '1';
    const f = agora(); bus.emit('foto', { zona: f.z, local: baseZona(f.z), periodo: f.p, filtro: f.f, especie: f.e });
    await new Promise<void>((r) => { espera = r; });
    const a = lerAlbum();
    if (await confirmar(T.foto.guardar)) { if (a.length >= MAX) await informar(T.foto.cheio); else { a.push(f); gravarAlbum(a); som('item-obtido'); await informar(`Foto guardada! O álbum tem ${a.length} de ${MAX}.`); } }
    ocupado = false;
  }
  let espera: (() => void) | null = null, anim: Sprite[] = [];
  function abrirAlbum() {
    if (ocupado || album) return;
    const a = lerAlbum(); if (!a.length) { ocupado = true; som('ui-erro'); void informar(T.foto.vazio).then(() => { ocupado = false; }); return; }
    som('ui-ok'); visor.style.display = 'none'; if (alvo) alvo.style.filter = '';
    montarAlbum(0);
  }
  function montarAlbum(ind: number) {
    album?.remove(); anim = [];
    const a = lerAlbum(); if (!a.length) { fecharAlbum(); return; }
    ind = Math.max(0, Math.min(a.length - 1, ind)); pagina = Math.floor(ind / 6);
    const cx = (album = caixa('fundo-roxo', 320, 164)); el.insertBefore(cx, clarao);
    placaTitulo(cx, `ÁLBUM  ${a.length}/${MAX}`, 2, 1, 130);
    const paginas = Math.ceil(a.length / 6); rotulo(cx, `Página ${pagina + 1} de ${paginas}`, 200, 5, 'creme', { largura: 114, alinhar: 'dir' });
    const fotos = a.slice(pagina * 6, pagina * 6 + 6);
    const cels = fotos.map((f) => { const m = moldura('tinta', 100, 62); const c = cartao(f, 92, 54); m.append(em(c.el, 4, 4)); anim.push(...c.sprites); return m; });
    const legenda = texto('', { cor: 'creme', largura: 312, alinhar: 'centro' }); cx.append(em(legenda, 4, 152));
    const pintar = () => { const f = fotos[grade!.indice]; escrever(legenda, `${nomeLocal(f.z)} · ${{ manha: 'manhã', dia: 'dia', tarde: 'tarde', noite: 'noite' }[f.p]} · ${FILTROS.find((x) => x.id === f.f)?.nome ?? ''}${f.e ? ' · com ' + nomeEsp(f.e) : ''}`); };
    grade = new Grade({ colunas: 3, celulas: cels, w: 100, h: 62, vao: 4, x: 6, y: 20, inicial: ind - pagina * 6, aoMover: pintar, aoCancelar: fecharAlbum,
      aoSair: (lado) => { if (lado === 'dir' && pagina + 1 < paginas) { montarAlbum((pagina + 1) * 6); return true; } if (lado === 'esq' && pagina > 0) { montarAlbum(pagina * 6 - 1); return true; } },
      aoEscolher: (i) => { if (ocupado) return; ocupado = true; void perguntar('O que fazer com a foto?', ['Apagar', 'Voltar'], 1).then(async (op) => { if (op === 0 && (await confirmar(T.foto.apagar, false))) { const b = lerAlbum(); b.splice(pagina * 6 + i, 1); gravarAlbum(b); montarAlbum(pagina * 6 + i); } ocupado = false; }); } });
    cx.append(grade.el); pintar(); dica(T.foto.dicaAlbum);
  }
  function fecharAlbum() { album?.remove(); album = null; grade = null; anim = []; visor.style.display = ''; aplicar(); dica(T.foto.dica); }
  const tela: Tela = {
    el, sobreposta: true,
    entrar() {
      const baixo = telas.pilha[telas.pilha.indexOf(tela) - 1];
      if (baixo) alvo = baixo.el;
      else { const c = cartao({ ...agora(), f: 'natural' }, 320, 180); propria = c.el; anim = c.sprites; el.insertBefore(propria, visor); alvo = propria; }
      aplicar(); dica(T.foto.dica);
    },
    sair() { viva = false; if (alvo && alvo !== propria) alvo.style.filter = ''; },
    atualizar(dt) {
      if (!viva) return;
      for (const sp of anim) { sp.atualizar(dt); sp.desenhar(); }
      if (flash > 0) { flash -= dt; clarao.style.opacity = flash > 0.3 ? '1' : flash > 0.15 ? '0.6' : '0.3'; if (flash <= 0) { clarao.style.display = 'none'; const f = espera; espera = null; f?.(); } return; }
      if (ocupado) return;
      if (album) { grade?.atualizar(dt); return; }
      if (input.repetiu('dir')) trocar(1); else if (input.repetiu('esq')) trocar(-1);
      if (input.apertou('a')) { input.consumir('a'); void fotografar(); }
      else if (input.apertou('select')) abrirAlbum();
      else if (input.apertou('b') || input.apertou('menu')) { input.consumir('b'); input.consumir('menu'); som('ui-voltar'); fechar(tela); }
    },
  };
  return tela;
}
