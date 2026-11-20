/** Atlas de sprites (gerado no build) e pré-carga de imagens. */
export interface AnimMeta { i: number; n: number; fps: number; loop: boolean }
export interface VistaMeta { src: string; cw: number; ch: number; cols: number; px: number; py: number; anims: Record<string, AnimMeta>; cores: number }
export interface ModeloMeta { id: string; categoria: string; malhas: number; vistas: Record<string, VistaMeta> }

let atlas: Record<string, ModeloMeta> = {};
/** criaturas com Pelagem Rara gerada no build (tools/build-raras.ts → assets/raras.json) */
let raras = new Set<string>();
export async function carregarAtlas() {
  const [a, r] = await Promise.all([fetch('assets/atlas.json').then((x) => x.json()).catch(() => ({})), fetch('assets/raras.json').then((x) => x.json()).catch(() => ({ ids: [] }))]);
  atlas = a; raras = new Set((r as { ids?: string[] }).ids ?? []);
}
export const modelo = (id: string): ModeloMeta | undefined => atlas[id];
/** `<vista>-rara` (Pelagem Rara) = a mesma folha e o mesmo meta da vista normal, com a imagem `<vista>-rara.png` */
export const vista = (id: string, v: string): VistaMeta | undefined => {
  const m = atlas[id]?.vistas[v];
  if (m || !v.endsWith('-rara') || !raras.has(id)) return m;
  const b = atlas[id]?.vistas[v.slice(0, -5)];
  return b && { ...b, src: b.src.replace(/\.png$/, '-rara.png') };
};
/** nome da vista a usar para uma criatura: a rara, se ela for rara e a variante existir */
export const vistaCriatura = (id: string, v: string, rara?: boolean): string => (rara && vista(id, v + '-rara') ? v + '-rara' : v);

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
