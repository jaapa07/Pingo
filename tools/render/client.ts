/**
 * Página de render do build (Chromium headless). Para cada modelo: passe de identidade + passe de luz
 * em 8× a resolução nativa, depois PIXELIZAÇÃO (moda por bloco, tons por limiar, limpeza de órfãos,
 * contorno de 1 px, carimbo de olhos e retoques à mão). Saída: PNG sem perdas na resolução nativa.
 * Nada daqui é carregado pelo jogo.
 */
import * as THREE from 'three';
import { storeRest, applyAnim, frameT } from './anim';
import { ID_OLHO_E, ID_OLHO_D } from './materials';
import type { PixModel, Paleta, Vista } from './types';
import { MODELOS } from '../models/index';

declare global { interface Window { ready: boolean; listar(): unknown[]; renderPix(id: string, vistas?: string[]): Promise<unknown> } }

const S = 8; // superamostragem
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

function luzes(scene: THREE.Scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5 * Math.PI);
  const key = new THREE.DirectionalLight(0xffffff, 0.62 * Math.PI);
  key.position.set(-3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.002; key.shadow.normalBias = 0.03;
  const sc = key.shadow.camera as THREE.OrthographicCamera;
  sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 0.1; sc.far = 40;
  const rim = new THREE.DirectionalLight(0xffffff, 0.55 * Math.PI);
  rim.position.set(2, 5, -6);
  const g = new THREE.Group();
  g.add(key, rim);
  scene.add(hemi, g);
  return g;
}

function camera(v: Vista, yaw: number, pitch: number) {
  const [cw, ch] = v.cell, [px, py] = v.pivot;
  const u = v.altura / ch;
  const cam = new THREE.OrthographicCamera(-px * u, (cw - px) * u, py * u, -(ch - py) * u, 0.1, 100);
  const a = (yaw * Math.PI) / 180, p = (pitch * Math.PI) / 180;
  cam.position.set(Math.cos(a) * Math.cos(p) * 30, Math.sin(p) * 30, Math.sin(a) * Math.cos(p) * 30);
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld();
  return cam;
}

const hex = (h: string): [number, number, number] => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

function ler(w: number, h: number) {
  const gl = renderer.getContext();
  const buf = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  return buf; // origem embaixo-esquerda
}

interface Pix { w: number; h: number; ramp: Int8Array; tone: Uint8Array; rgba: Uint8ClampedArray; eyes: { x: number; y: number; n: number }[] }

function pixelizar(idb: Uint8Array, lub: Uint8Array, cw: number, ch: number, pal: Paleta, lim: [number, number]): Pix {
  const W = cw * S;
  const ramp = new Int8Array(cw * ch).fill(-1);
  const tone = new Uint8Array(cw * ch);
  const eyes = [{ x: 0, y: 0, n: 0 }, { x: 0, y: 0, n: 0 }];
  const cnt = new Uint16Array(40), lsum = new Float32Array(40), flat = new Uint16Array(40), bias = new Float32Array(40);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    cnt.fill(0); lsum.fill(0); flat.fill(0); bias.fill(0);
    let cov = 0;
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const gx = x * S + sx, gy = (ch * S - 1) - (y * S + sy);
      const o = (gy * W + gx) * 4;
      if (idb[o + 3] < 128) continue;
      cov++;
      const id = Math.round(idb[o] / 8) - 1;
      if (id < 0 || id >= 40) continue;
      cnt[id]++; lsum[id] += lub[o] / 255; if (idb[o + 1] > 128) flat[id]++; bias[id] += idb[o + 2] / 255 * 2 - 1;
      if (id === ID_OLHO_E || id === ID_OLHO_D) { const e = eyes[id - ID_OLHO_E]; e.x += x + (sx + 0.5) / S; e.y += y + (sy + 0.5) / S; e.n++; }
    }
    if (cov < S * S * 0.5) continue;
    let best = -1, bn = 0;
    for (let i = 0; i < 40; i++) if (cnt[i] > bn) { bn = cnt[i]; best = i; }
    if (best < 0) continue;
    const i = y * cw + x;
    ramp[i] = best;
    const l = lsum[best] / bn + (bias[best] / bn) * 0.5;
    tone[i] = flat[best] > bn / 2 ? 1 : l < lim[0] ? 0 : l >= lim[1] ? 2 : 1;
  }
  for (const e of eyes) if (e.n) { e.x /= e.n; e.y /= e.n; }
  const opaque = (x: number, y: number) => x >= 0 && y >= 0 && x < cw && y < ch && ramp[y * cw + x] >= 0;
  // limpeza 1: pixels órfãos
  for (let pass = 0; pass < 2; pass++) for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    if (!opaque(x, y)) continue;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && opaque(x + dx, y + dy)) n++;
    if (n < 2) ramp[y * cw + x] = -1;
  }
  // limpeza 2: ilhas de 1 px de cor (troca pelo vizinho mais comum)
  const key = (i: number) => ramp[i] * 4 + tone[i];
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const i = y * cw + x;
    if (ramp[i] < 0 || ramp[i] >= ID_OLHO_E) continue;
    const m = new Map<number, number>(); let same = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (!opaque(x + dx, y + dy)) continue;
      const k = key((y + dy) * cw + x + dx);
      if (k === key(i)) same++; else m.set(k, (m.get(k) ?? 0) + 1);
    }
    if (same === 0 && m.size) {
      const [k, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
      if (n >= 3) { ramp[i] = k >> 2; tone[i] = k & 3; }
    }
  }
  // cores
  const rgba = new Uint8ClampedArray(cw * ch * 4);
  const cont = hex(pal.contorno);
  const put = (x: number, y: number, c: [number, number, number]) => { if (x < 0 || y < 0 || x >= cw || y >= ch) return; const o = (y * cw + x) * 4; rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255; };
  for (let i = 0; i < cw * ch; i++) {
    if (ramp[i] < 0) continue;
    const r = ramp[i] >= ID_OLHO_E ? null : pal.rampas[ramp[i]];
    const c = r ? hex(r[tone[i]]) : hex(pal.extras?.w ?? '#ffffff');
    if (!r && ramp[i] < ID_OLHO_E) throw new Error(`rampa ${ramp[i]} usada no modelo mas ausente na paleta`);
    put(i % cw, Math.floor(i / cw), c);
  }
  // contorno de 1 px por fora da silhueta
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    if (opaque(x, y)) continue;
    if (opaque(x + 1, y) || opaque(x - 1, y) || opaque(x, y + 1) || opaque(x, y - 1)) put(x, y, cont);
  }
  return { w: cw, h: ch, ramp, tone, rgba, eyes };
}

function cor(pal: Paleta, k: string): [number, number, number] | null {
  if (k === '.' || k === ' ') return null;
  if (k.startsWith('#')) return hex(k);
  if (k === 'k' || k === 'p') return hex(pal.extras?.[k] ?? pal.contorno);
  if (k === 'w') return hex(pal.extras?.w ?? '#ffffff');
  const e = pal.extras?.[k];
  if (!e) throw new Error(`cor '${k}' não definida em paleta.extras`);
  return hex(e);
}

function carimbar(p: Pix, pal: Paleta, stamp: string[] | undefined, facingRight: boolean) {
  p.eyes.forEach((e, idx) => {
    if (e.n < S * S * 0.35) return;
    const rows = stamp ?? ['k'];
    const hgt = rows.length, wid = Math.max(...rows.map((r) => r.length));
    // o carimbo é desenhado para o olho que olha para a DIREITA da tela; espelha quando o modelo olha para a esquerda
    const mirror = !facingRight;
    const x0 = Math.round(e.x - wid / 2), y0 = Math.round(e.y - hgt / 2);
    for (let y = 0; y < hgt; y++) for (let x = 0; x < wid; x++) {
      const ch = rows[y][mirror ? wid - 1 - x : x] ?? '.';
      const c = cor(pal, ch);
      if (!c) continue;
      const X = x0 + x, Y = y0 + y;
      if (X < 0 || Y < 0 || X >= p.w || Y >= p.h) continue;
      const o = (Y * p.w + X) * 4;
      p.rgba[o] = c[0]; p.rgba[o + 1] = c[1]; p.rgba[o + 2] = c[2]; p.rgba[o + 3] = 255;
    }
    void idx;
  });
}

window.listar = () => MODELOS.map((m) => ({ id: m.id, categoria: m.categoria, vistas: Object.keys(m.vistas) }));

window.renderPix = async (id, only) => {
  const def = MODELOS.find((m) => m.id === id) as PixModel;
  if (!def) throw new Error('modelo inexistente ' + id);
  const scene = new THREE.Scene();
  const rigLuz = luzes(scene);
  const rig = def.build();
  scene.add(rig.root);
  storeRest(rig.bones);
  const meshes: THREE.Mesh[] = [];
  rig.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) meshes.push(m); });
  for (const m of meshes) { if (!(m.material as THREE.Material).userData.idMat) throw new Error(`modelo ${id}: malha sem material tom()`); m.userData.luz = m.material; m.userData.idm = (m.material as THREE.Material).userData.idMat; }
  const out: Record<string, unknown> = {};
  const lim = def.limiares ?? [0.62, 0.98];
  for (const [vn, v] of Object.entries(def.vistas)) {
    if (only?.length && !only.includes(vn)) continue;
    const [cw, ch] = v.cell;
    renderer.setSize(cw * S, ch * S, false);
    const total = Object.values(v.anims).reduce((a, an) => a + an.frames, 0);
    const cols = Math.min(total, 8), rows = Math.ceil(total / cols);
    const sheet = document.createElement('canvas');
    sheet.width = cw * cols; sheet.height = ch * rows;
    const sctx = sheet.getContext('2d')!;
    const anims: Record<string, unknown> = {};
    const usadas = new Set<number>();
    let fi = 0;
    for (const [an, anim] of Object.entries(v.anims)) {
      const yaw = anim.yaw ?? v.yaw, pitch = anim.pitch ?? v.pitch;
      const cam = camera(v, yaw, pitch);
      // a luz principal acompanha a câmera: sempre de cima e da esquerda da tela
      rigLuz.rotation.y = ((90 - yaw) * Math.PI) / 180;
      rigLuz.updateMatrixWorld(true);
      const facingRight = Math.sin((yaw * Math.PI) / 180) >= 0;
      anims[an] = { i: fi, n: anim.frames, fps: anim.fps ?? 8, loop: anim.loop ?? true };
      for (let f = 0; f < anim.frames; f++, fi++) {
        applyAnim(rig.bones, anim, frameT(anim, f));
        rig.root.updateMatrixWorld(true);
        for (const m of meshes) m.material = m.userData.idm;
        renderer.shadowMap.enabled = false;
        renderer.render(scene, cam);
        const idb = ler(cw * S, ch * S);
        for (const m of meshes) m.material = m.userData.luz;
        renderer.shadowMap.enabled = true;
        renderer.render(scene, cam);
        const lub = ler(cw * S, ch * S);
        const p = pixelizar(idb, lub, cw, ch, def.paleta, lim);
        carimbar(p, def.paleta, anim.olho === 'fechado' ? (v.olhoFechado ?? ['kk']) : v.olho, facingRight);
        for (const r of def.retoques ?? []) {
          if (r.vista !== vn || r.anim !== an || (r.quadro !== '*' && r.quadro !== f)) continue;
          for (const [x, y, k] of r.px) { const c = cor(def.paleta, k); if (!c) continue; const o = (y * cw + x) * 4; p.rgba[o] = c[0]; p.rgba[o + 1] = c[1]; p.rgba[o + 2] = c[2]; p.rgba[o + 3] = 255; }
        }
        for (let i = 0; i < cw * ch; i++) if (p.rgba[i * 4 + 3]) usadas.add((p.rgba[i * 4] << 16) | (p.rgba[i * 4 + 1] << 8) | p.rgba[i * 4 + 2]);
        sctx.putImageData(new ImageData(p.rgba, cw, ch), (fi % cols) * cw, Math.floor(fi / cols) * ch);
      }
    }
    out[vn] = { png: sheet.toDataURL('image/png'), cw, ch, cols, px: v.pivot[0], py: v.pivot[1], anims, cores: usadas.size };
  }
  rig.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); });
  return { id, categoria: def.categoria, malhas: meshes.length, vistas: out };
};

window.ready = true;
