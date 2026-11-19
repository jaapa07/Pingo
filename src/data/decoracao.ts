/**
 * Decoração do Quarto (spec 10.1): catálogo das peças que o PC do quarto oferece, por categoria.
 * Cada peça é um objeto de decoração de `catalogo-interiores.ts` (mesmo id). A escolha fica em
 * `jogo.save.decoracao[categoria] = id` ('' = sem peça); o quarto (`A1-quarto`) lê esse mapa ao montar a zona.
 * Peças que não são de fábrica entram na coleção pela flag `deco:<id>` (eventos, Venda, prêmios).
 */
import { CATALOGO_INTERIOR } from './catalogo-interiores';
import { jogo } from '../core/estado';

export type CategoriaDeco = 'tapete' | 'poster' | 'planta' | 'pelucia' | 'console' | 'movel';
export interface PecaDeco { id: string; categoria: CategoriaDeco; nome: string; desc: string; preco: number; /** já vem com o quarto */ padrao?: boolean; /** como se consegue */ origem: string }
export const CATEGORIAS: { id: CategoriaDeco; nome: string; vazio: string }[] = [
  { id: 'tapete', nome: 'Tapete', vazio: 'Sem tapete' }, { id: 'poster', nome: 'Pôster', vazio: 'Parede lisa' }, { id: 'planta', nome: 'Planta', vazio: 'Sem planta' },
  { id: 'pelucia', nome: 'Pelúcia', vazio: 'Sem pelúcia' }, { id: 'console', nome: 'Console', vazio: 'Sem console' }, { id: 'movel', nome: 'Cama', vazio: 'Cama simples' },
];
const EXTRA: Record<string, { nome: string; preco: number; padrao?: boolean; origem: string }> = {
  'tapete-a': { nome: 'Tapete de Retalhos', preco: 0, padrao: true, origem: 'Costurado pela Mãe.' },
  'tapete-b': { nome: 'Passadeira Listrada', preco: 1800, origem: 'À venda na Feira de Porto Sereia.' },
  'tapete-c': { nome: 'Tapete de Fuxico', preco: 2400, origem: 'Presente das rendeiras da Cidade Coral.' },
  'poster-a': { nome: 'Pôster do Conselho', preco: 0, origem: 'Prêmio por vencer o Conselho dos Guardiões.' },
  'poster-b': { nome: 'Pôster do Trem', preco: 900, origem: 'Lembrança da primeira viagem no Trem Serra-Sol.' },
  'poster-c': { nome: 'Pôster da Costa do Sol', preco: 0, padrao: true, origem: 'Veio com o quarto.' },
  planta: { nome: 'Espada-de-São-Jorge', preco: 0, padrao: true, origem: 'A Mãe diz que protege a casa.' },
  'planta-b': { nome: 'Samambaia de Xaxim', preco: 1200, origem: 'À venda na Venda da Vila Buriti.' },
  'planta-c': { nome: 'Vasinho de Violetas', preco: 800, origem: 'Presente da Drª Buriti.' },
  'cama-jogador': { nome: 'Cama de Estrela', preco: 0, padrao: true, origem: 'A sua cama de sempre.' },
  console: { nome: 'Videogame de Cartucho', preco: 0, padrao: true, origem: 'Presente de aniversário.' },
  'pelucia-a': { nome: 'Pelúcia de Tamanduá', preco: 1500, origem: 'Prêmio do festival de sábado.' },
  'pelucia-b': { nome: 'Pelúcia de Capivara', preco: 1500, origem: 'À venda na Feira da Cidade Ginga.' },
  'pelucia-c': { nome: 'Pelúcia de Arara', preco: 1500, origem: 'Presente da Observadora de Aves.' },
  'pelucia-d': { nome: 'Pelúcia de Boto', preco: 1500, origem: 'Lembrança do Saveiro.' },
};
/** todas as peças de decoração do catálogo de interiores, com nome e origem */
export const DECORACOES: PecaDeco[] = Object.entries(CATALOGO_INTERIOR).filter(([, o]) => o.decoracao).map(([id, o]) => {
  const x = EXTRA[id] ?? { nome: o.desc[0].toUpperCase() + o.desc.slice(1), preco: 1000, origem: 'Peça rara de colecionador.' };
  return { id, categoria: o.decoracao as CategoriaDeco, nome: x.nome, desc: o.desc, preco: x.preco, padrao: x.padrao, origem: x.origem };
});
export const pecasDe = (c: CategoriaDeco) => DECORACOES.filter((p) => p.categoria === c);
export const temPeca = (p: PecaDeco) => !!p.padrao || !!jogo.save.flags['deco:' + p.id];
/** peça em uso numa categoria ('' = nenhuma); sem escolha gravada vale a peça de fábrica */
export function decoracaoAtual(c: CategoriaDeco): string {
  const v = jogo.save.decoracao[c];
  return v !== undefined ? v : (pecasDe(c).find((p) => p.padrao)?.id ?? '');
}
