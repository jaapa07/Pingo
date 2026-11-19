/** As 10 personalidades autorais: +10% num atributo e −10% em outro (a Vida nunca muda). Dono: time de batalha. */
import type { Stat } from '../core/tipos';

export interface PersonalidadeDef { id: string; nome: string; mais: Exclude<Stat, 'vida'>; menos: Exclude<Stat, 'vida'>; desc: string }

export const PERSONALIDADES: PersonalidadeDef[] = [
  { id: 'valente', nome: 'Valente', mais: 'atq', menos: 'vel', desc: 'Encara qualquer briga, mas não tem pressa.' },
  { id: 'brava', nome: 'Brava', mais: 'atq', menos: 'defEsp', desc: 'Bate forte e se irrita com facilidade.' },
  { id: 'teimosa', nome: 'Teimosa', mais: 'def', menos: 'atqEsp', desc: 'Não arreda o pé por nada.' },
  { id: 'mansa', nome: 'Mansa', mais: 'def', menos: 'atq', desc: 'Aguenta tudo com paciência e evita confusão.' },
  { id: 'curiosa', nome: 'Curiosa', mais: 'atqEsp', menos: 'atq', desc: 'Prefere descobrir truques a usar a força.' },
  { id: 'matreira', nome: 'Matreira', mais: 'atqEsp', menos: 'def', desc: 'Cheia de artimanhas, mas se descuida.' },
  { id: 'serena', nome: 'Serena', mais: 'defEsp', menos: 'atq', desc: 'Calma como um rio largo.' },
  { id: 'faceira', nome: 'Faceira', mais: 'defEsp', menos: 'vel', desc: 'Vaidosa: nada a abala, nada a apressa.' },
  { id: 'arisca', nome: 'Arisca', mais: 'vel', menos: 'def', desc: 'Some num piscar de olhos.' },
  { id: 'brincalhona', nome: 'Brincalhona', mais: 'vel', menos: 'defEsp', desc: 'Corre o dia inteiro e não leva nada a sério.' },
];

const mapa = new Map(PERSONALIDADES.map((p) => [p.id, p]));
export const personalidade = (id: string): PersonalidadeDef | undefined => mapa.get(id);
/** multiplicador (1,1 · 1 · 0,9) da personalidade num atributo */
export function multPersonalidade(id: string, s: Stat): number { const p = mapa.get(id); return !p || s === 'vida' ? 1 : p.mais === s ? 1.1 : p.menos === s ? 0.9 : 1; }
