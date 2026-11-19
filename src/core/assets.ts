/** Atlas de sprites (gerado no build) e pré-carga de imagens. */
export interface AnimMeta { i: number; n: number; fps: number; loop: boolean }
export interface VistaMeta { src: string; cw: number; ch: number; cols: number; px: number; py: number; anims: Record<string, AnimMeta>; cores: number }
export interface ModeloMeta { id: string; categoria: string; malhas: number; vistas: Record<string, VistaMeta> }

let atlas: Record<string, ModeloMeta> = {};
export async function carregarAtlas() { atlas = await fetch('assets/atlas.json').then((r) => r.json()).catch(() => ({})); }
export const modelo = (id: string): ModeloMeta | undefined => atlas[id];
export const vista = (id: string, v: string): VistaMeta | undefined => atlas[id]?.vistas[v];

const cache = new Map<string, Promise<void>>();
export function precarregar(src: string): Promise<void> {
  let p = cache.get(src);
  if (!p) { p = new Promise<void>((res) => { const i = new Image(); i.onload = () => (i.decode ? i.decode().then(() => res(), () => res()) : res()); i.onerror = () => res(); i.src = src; }); cache.set(src, p); }
  return p;
}
export function precarregarModelo(id: string, vistas?: string[]) {
  const m = atlas[id]; if (!m) return Promise.resolve();
  return Promise.all(Object.entries(m.vistas).filter(([k]) => !vistas || vistas.includes(k)).map(([, v]) => precarregar(v.src))).then(() => undefined);
}
