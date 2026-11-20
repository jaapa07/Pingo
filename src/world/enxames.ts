/**
 * ENXAMES DO DIA (spec 10A item 4): todo dia, numa rota, a espécie mais rara do capim passa a ter 40% dos encontros.
 * A regra e o encaixe nos encontros são do agente das regras 10A (src/data/revancha.ts → `enxameDoDia`/`aplicarEnxame`,
 * aplicados pelo hook `ajustesDeEncontro` em src/data/eventos/regras.ts; ver docs/REGRAS-10A.md). Este arquivo é a
 * fachada única para quem só quer saber "qual é o enxame de hoje" (Rádio Cipó, Diário, testes), para todos
 * concordarem o dia inteiro.
 */
import type { MetodoEncontro } from '../core/tipos';
import { jogo } from '../core/estado';
import { MAPA_B_ABERTO } from '../core/progresso';
import { enxameDoDia, diaCorrido } from '../data/revancha';
import { listaZonas } from './zonas';
import { especie, temEspecie } from '../battle/criatura';

export interface Enxame { zona: string; zonaNome: string; especie: number; especieNome: string; nv: [number, number]; metodo: MetodoEncontro }
export const CHANCE_ENXAME = 0.4;

/** dia corrido do relógio do jogo (o mesmo da agenda do rádio) */
export const diaDoJogo = (): number => diaCorrido(jogo.save.relogio.deslocamentoMin);

/** o enxame de hoje (ou null se não houver rota candidata) */
export function enxameDeHoje(dia = diaDoJogo()): Enxame | null {
  const e = enxameDoDia(listaZonas(), dia, MAPA_B_ABERTO);
  if (!e) return null;
  return { zona: e.zona.id, zonaNome: e.zona.nome, especie: e.e, especieNome: temEspecie(e.e) ? especie(e.e).nome : `nº ${e.e}`, nv: e.nv, metodo: 'grama' };
}
/** frase pronta do locutor do Rádio Cipó para o enxame de hoje */
export function anuncioEnxame(): string | null {
  const e = enxameDeHoje();
  return e ? `Notícia quentinha do mato: hoje tem enxame de ${e.especieNome} no capim da ${e.zonaNome}! Quem tiver cuia sobrando, é a hora.` : null;
}
