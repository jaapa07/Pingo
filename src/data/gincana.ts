/**
 * GINCANA DE CRIATURAS (spec 10A item 32, pós-Liga) — dados e regras puras.
 * Três provas de 30–45 s com uma criatura da equipe (tela `gincana`, src/ui/telas/gincana.ts):
 * agilidade (pista com obstáculos: Velocidade), força (empurrar a tora no ritmo: Ataque, Defesa segura o recuo)
 * e salto (pular no tempo certo: Velocidade dá tempo no ar, Defesa amortece os tropeços).
 * Sucos de frutos (liquidificador do Seu Graviola) dão bônus a uma criatura até o fim do dia.
 * Ranking do dia com 3 rivais; pontos trocam por itens na tela `loja` (moeda da Gincana).
 * Nada de aposta: os pontos só vêm de jogar as provas.
 */
import type { CriaturaInst, Stat } from '../core/tipos';
import { jogo, flag, setFlag } from '../core/estado';

export type ProvaId = 'agilidade' | 'forca' | 'salto';
export const PROVAS: ProvaId[] = ['agilidade', 'forca', 'salto'];
export interface ProvaDef { id: ProvaId; nome: string; duracao: number; regra: string; atributos: Stat[] }
export const PROVA: Record<ProvaId, ProvaDef> = {
  agilidade: { id: 'agilidade', nome: 'Corrida da Vereda', duracao: 40, atributos: ['vel', 'def'], regra: 'Troque de raia com CIMA e BAIXO (ou toque na raia). Desvie de pedras e cupinzeiros, pegue as estrelas.' },
  forca: { id: 'forca', nome: 'Empurra-Tora', duracao: 30, atributos: ['atq', 'def'], regra: 'Aperte A (ou toque) quando a marca passar pela faixa verde. Ritmo certo empurra a tora morro acima.' },
  salto: { id: 'salto', nome: 'Salto do Riacho', duracao: 40, atributos: ['vel', 'def'], regra: 'Aperte A (ou toque) para pular os troncos. Pulo bem no limite vale salto perfeito.' },
};

/* ------------------------------ dia do jogo ------------------------------ */
/** número do dia pelo relógio do jogo (o deslocamento do relógio vale aqui também) */
export function diaDoJogo(): number {
  const d = new Date();
  const min = Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 60000) + (jogo.save?.relogio.deslocamentoMin ?? 0);
  return Math.floor(min / 1440);
}
/** número fixo a partir de um texto (rivais do dia; não consome o `rng` do jogo) */
export function hash(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ------------------------------ rivais ------------------------------ */
export interface RivalGincana { id: string; nome: string; sprite: string; especie: number; base: Record<ProvaId, number>; fala: string }
export const RIVAIS: RivalGincana[] = [
  { id: 'gn-lina', nome: 'Lina Ligeira', sprite: 'cl-mateira', especie: 23, base: { agilidade: 230, forca: 120, salto: 170 }, fala: 'Minha Saguinete não erra raia. Corrida é com a gente!' },
  { id: 'gn-marreta', nome: 'Dona Marreta', sprite: 'cl-ferreiro', especie: 98, base: { agilidade: 120, forca: 230, salto: 110 }, fala: 'O Antão empurra tora desde filhote. Quero ver você chegar perto.' },
  { id: 'gn-zeca', nome: 'Zeca Saltador', sprite: 'cl-capoeirista', especie: 102, base: { agilidade: 170, forca: 140, salto: 230 }, fala: 'Pulo é tempo, não força. O Emaçu sabe a hora certinha.' },
];
/** pontuação do rival na prova, no dia (varia ±30 de um dia para o outro) */
export const pontosRival = (r: RivalGincana, p: ProvaId, dia = diaDoJogo()) => r.base[p] - 30 + (hash(`${r.id}:${p}:${dia}`) % 61);

/* ------------------------------ recordes e ranking ------------------------------ */
const chaveRec = (p: ProvaId) => `gincana-recorde:${p}`;
/** melhor pontuação do jogador hoje na prova (0 se não jogou) */
export function recordeHoje(p: ProvaId): number {
  const v = String(flag(chaveRec(p)) ?? ''); const [d, pts] = v.split(':').map(Number);
  return d === diaDoJogo() ? pts || 0 : 0;
}
export interface LinhaRanking { nome: string; pontos: number; jogador?: boolean }
export function ranking(p: ProvaId): LinhaRanking[] {
  const l: LinhaRanking[] = RIVAIS.map((r) => ({ nome: r.nome, pontos: pontosRival(r, p) }));
  l.push({ nome: jogo.save.jogador.nome, pontos: recordeHoje(p), jogador: true });
  return l.sort((a, b) => b.pontos - a.pontos || (a.jogador ? -1 : 1));
}
export const posicao = (p: ProvaId) => ranking(p).findIndex((x) => x.jogador) + 1;
/** prêmio do pódio, pago uma vez por dia por posição melhorada: 1º 30, 2º 15, 3º 5 */
const PREMIO_POS = [0, 30, 15, 5, 0];
export interface FimDeProva { pontos: number; recorde: boolean; posAntes: number; pos: number; ganhos: number; premio: number }
/** registra uma prova jogada: soma os pontos da Gincana e paga o pódio */
export function registrarProva(p: ProvaId, pontos: number): FimDeProva {
  const dia = diaDoJogo(), posAntes = recordeHoje(p) > 0 ? posicao(p) : 5;
  const recorde = pontos > recordeHoje(p);
  if (recorde) setFlag(chaveRec(p), `${dia}:${pontos}`);
  const pos = posicao(p);
  // melhor posição já premiada hoje
  const v = String(flag(`gincana-podio:${p}`) ?? ''); const [dp, pp] = v.split(':').map(Number);
  const jaPago = dp === dia ? pp : 5;
  let premio = 0;
  if (pos < jaPago) { premio = PREMIO_POS[pos] - (jaPago <= 4 ? PREMIO_POS[jaPago] : 0); setFlag(`gincana-podio:${p}`, `${dia}:${pos}`); }
  const ganhos = Math.max(1, Math.floor(pontos / 10)) + Math.max(0, premio);
  setFlag('gincana-pontos', pontosGincana() + ganhos);
  setFlag('gincana-provas', Number(flag('gincana-provas') ?? 0) + 1);
  return { pontos, recorde, posAntes, pos, ganhos, premio: Math.max(0, premio) };
}
export const pontosGincana = () => Number(flag('gincana-pontos') ?? 0);
export function gastarPontos(n: number) { setFlag('gincana-pontos', Math.max(0, pontosGincana() - n)); }

/* ------------------------------ sucos ------------------------------ */
export type Alvo = ProvaId | 'todas';
export interface Suco { fruto: string; nome: string; alvo: Alvo; pct: number }
export const SUCOS: Suco[] = [
  { fruto: 'caju', nome: 'Suco de Caju', alvo: 'agilidade', pct: 15 },
  { fruto: 'pitanga', nome: 'Suco de Pitanga', alvo: 'agilidade', pct: 20 },
  { fruto: 'cupuacu', nome: 'Suco de Cupuaçu', alvo: 'forca', pct: 20 },
  { fruto: 'pequi', nome: 'Suco de Pequi', alvo: 'forca', pct: 15 },
  { fruto: 'jabuticaba', nome: 'Suco de Jabuticaba', alvo: 'salto', pct: 15 },
  { fruto: 'buriti', nome: 'Suco de Buriti', alvo: 'salto', pct: 20 },
  { fruto: 'acerola', nome: 'Suco de Acerola', alvo: 'todas', pct: 8 },
  { fruto: 'acai', nome: 'Vitamina de Açaí', alvo: 'todas', pct: 12 },
];
export const NOME_ALVO: Record<Alvo, string> = { agilidade: 'agilidade', forca: 'força', salto: 'salto', todas: 'todas as provas' };
/** suco tomado hoje pela criatura (só vale no dia) */
export function sucoDe(c: CriaturaInst): Suco | undefined {
  const v = String(flag(`gincana-suco:${c.uid}`) ?? ''); const [d, fruto] = v.split(':');
  if (Number(d) !== diaDoJogo()) return undefined;
  return SUCOS.find((s) => s.fruto === fruto);
}
export function tomarSuco(c: CriaturaInst, s: Suco) { setFlag(`gincana-suco:${c.uid}`, `${diaDoJogo()}:${s.fruto}`); }
/** bônus (fração, ex. 0.2) do suco da criatura na prova */
export function bonusSuco(c: CriaturaInst, p: ProvaId): number { const s = sucoDe(c); return s && (s.alvo === p || s.alvo === 'todas') ? s.pct / 100 : 0; }

/* ------------------------------ atributos → desempenho ------------------------------ */
/** atributo normalizado 0..1 (100 → ~0.4, 250 → 1) para criaturas do pós-Liga */
export const norma = (v: number) => Math.max(0, Math.min(1, (v - 30) / 220));

/* ------------------------------ loja de pontos ------------------------------ */
/** item → preço em pontos da Gincana */
export const TROCA: Record<string, number> = {
  'vitamina-vida': 30, 'vitamina-atq': 30, 'vitamina-def': 30, 'vitamina-atqesp': 30, 'vitamina-defesp': 30, 'vitamina-vel': 30,
  rapadura: 45, 'biscoito-de-polvilho': 8, 'garapa-com-limao': 25,
  'pedra-solar': 60, 'pedra-mare': 60, 'pedra-lunar': 60, 'folha-ancestral': 60, 'engrenagem-velha': 60,
  'pt-33': 80, 'pt-39': 80, 'pt-28': 90, 'pt-24': 90, 'pt-05': 70,
};
