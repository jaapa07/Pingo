/**
 * NINHOS E OVOS (spec 10 item 9 e 10A item 11) — o Viveiro do Seu Aroeira (A2), depois da insígnia 6.
 * Regras puras sobre `jogo.save.criadouro` (sem DOM; o diálogo e o aviso pelo rádio ficam em src/data/eventos/captura.ts):
 *  - até 2 criaturas deixadas; cada passo do jogador dá 1 de experiência a cada uma (os níveis sobem na retirada);
 *  - a cada 256 passos, um casal compatível (sexos opostos e um grupo de ninho em comum, src/data/ninhos.ts) pode deixar
 *    um ovo: 50% se forem da mesma espécie, 25% se forem de espécies diferentes;
 *  - o ovo é da forma mais nova da linha da mãe; o filhote herda 3 genes (cada um de um dos pais, ao acaso) e os golpes
 *    do pai que a espécie dele aprende por nível ou por Pergaminho; choca com passos (`PASSOS_OVO`); 1 em 4096 nasce rara.
 * Todo acaso passa por `rng`. Avisa `bus 'criadouro-ovo'` quando aparece um ovo.
 */
import { STATS, type CriaturaInst, type Stat } from '../core/tipos';
import { jogo } from '../core/estado';
import { rng } from '../core/rng';
import { bus } from '../core/events';
import { especie, temEspecie, criarCriatura, novoSlot, ganharExp, golpesIniciais } from '../battle/criatura';
import { sortearRara } from '../battle/cuias';
import { temGolpe } from '../data/golpes';
import { PERGAMINHOS } from '../data/itens';
import { gruposDe, PASSOS_OVO } from '../data/ninhos';

/** só abre depois da insígnia 6 (seis insígnias) */
export const CRIADOURO_ABRE = 'insignias:6';
export const PASSOS_SORTEIO = 256;

export function criadouro(): NonNullable<typeof jogo.save.criadouro> {
  const s = jogo.save;
  if (!s.criadouro) s.criadouro = { casal: [], passos: 0, ovo: null };
  return s.criadouro;
}

/** chance de ovo a cada sorteio: 0 (não combinam), 0,25 (combinam) ou 0,5 (mesma espécie) */
export function afinidade(a: CriaturaInst, b: CriaturaInst): number {
  if (a.ovo || b.ovo || !a.sexo || !b.sexo || a.sexo === b.sexo) return 0;
  const ga = gruposDe(a.especie), gb = gruposDe(b.especie);
  if (ga.includes('sem-ninho') || gb.includes('sem-ninho') || !ga.some((g) => gb.includes(g))) return 0;
  return a.especie === b.especie ? 0.5 : 0.25;
}
/** a forma mais nova da linha evolutiva (quem nenhum outro vira) */
export function formaBase(num: number): number {
  const visto = new Set<number>();
  let atual = num;
  for (;;) {
    visto.add(atual);
    let antes: number | undefined;
    for (let n = 1; n <= 200 && antes === undefined; n++) if (temEspecie(n) && (especie(n).evolui ?? []).some((e) => e.para === atual)) antes = n;
    if (antes === undefined || visto.has(antes)) return atual;
    atual = antes;
  }
}
/** a espécie aprende este golpe por nível ou por Pergaminho de Técnica? */
function aprende(num: number, golpe: string): boolean {
  const e = especie(num);
  return e.golpes.some(([, g]) => g === golpe) || Object.entries(PERGAMINHOS).some(([pt, g]) => g === golpe && e.pergaminhos.includes(pt));
}
/** cria o ovo do casal (mãe = a fêmea): espécie base da mãe, 3 genes herdados, golpes do pai e Pelagem Rara 1/4096 */
export function gerarOvo(a: CriaturaInst, b: CriaturaInst): CriaturaInst {
  const mae = a.sexo === 'F' ? a : b, pai = mae === a ? b : a;
  const num = formaBase(mae.especie), e = especie(num);
  const c = criarCriatura(num, 1, { ovo: PASSOS_OVO[e.crescimento], treinadorOriginal: jogo.save.jogador.nome, localCaptura: 'Viveiro do Seu Aroeira', nivelCaptura: 1, amizade: 120 });
  // genes: três atributos diferentes, cada um copiado de um dos pais
  const herdados = [...STATS]; const escolhidos: Stat[] = [];
  while (escolhidos.length < 3) escolhidos.push(herdados.splice(rng.int(0, herdados.length - 1), 1)[0]);
  for (const st of escolhidos) c.gen[st] = (rng.chance(0.5) ? mae : pai).gen[st];
  // golpes: os do nível 1 e, por cima, os do pai que o filhote sabe aprender (os mais antigos saem primeiro)
  const ids = golpesIniciais(num, 1).map((g) => g.id);
  for (const g of pai.golpes) if (temGolpe(g.id) && aprende(num, g.id) && !ids.includes(g.id)) { ids.push(g.id); if (ids.length > 4) ids.shift(); }
  c.golpes = ids.map(novoSlot);
  if (sortearRara()) c.rara = true;
  return c;
}
/** um passo do jogador: experiência para quem está no viveiro e, a cada 256 passos, o sorteio do ovo */
export function passoCriadouro(): void {
  const cr = jogo.save.criadouro;
  if (!cr || !cr.casal.length) return;
  for (const c of cr.casal) c.exp += 1;
  if (cr.casal.length < 2 || cr.ovo) return;
  if (++cr.passos < PASSOS_SORTEIO) return;
  cr.passos = 0;
  const p = afinidade(cr.casal[0], cr.casal[1]);
  if (p > 0 && rng.chance(p)) { cr.ovo = gerarOvo(cr.casal[0], cr.casal[1]); cr.avisado = false; bus.emit('criadouro-ovo', { especie: cr.ovo.especie }); }
}
/** deixa uma criatura (tirada da equipe pelo índice); falso se já há duas ou se ficaria sem criatura apta */
export function deixar(indice: number): boolean {
  const s = jogo.save, cr = criadouro(), c = s.equipe[indice];
  if (!c || c.ovo || cr.casal.length >= 2) return false;
  if (s.equipe.filter((x, i) => i !== indice && !x.ovo && x.vida > 0).length === 0) return false;
  s.equipe.splice(indice, 1);
  cr.casal.push(c);
  return true;
}
/** níveis que a criatura ganharia se fosse retirada agora (a experiência acumulada já está em `exp`) */
export function niveisGanhos(c: CriaturaInst): number {
  const copia: CriaturaInst = JSON.parse(JSON.stringify(c));
  return ganharExp(copia, 0).length;
}
/** retira a criatura `i` do viveiro para a equipe (sobe os níveis da experiência acumulada); falso se a equipe está cheia */
export function retirar(i: number): CriaturaInst | null {
  const s = jogo.save, cr = criadouro(), c = cr.casal[i];
  if (!c || s.equipe.length >= 6) return null;
  ganharExp(c, 0);
  cr.casal.splice(i, 1); cr.passos = 0;
  s.equipe.push(c);
  return c;
}
/** recolhe o ovo à espera para a equipe; falso se não há ovo ou a equipe está cheia */
export function recolherOvo(): CriaturaInst | null {
  const s = jogo.save, cr = criadouro();
  if (!cr.ovo || s.equipe.length >= 6) return null;
  const o = cr.ovo; cr.ovo = null; cr.avisado = false;
  s.equipe.push(o);
  return o;
}
