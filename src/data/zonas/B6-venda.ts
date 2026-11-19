/** Venda de Brejo Roxo: botica de antídotos. */
import { venda, npc, ESTOQUE_BASE } from './_b2-lib';

export default venda({
  id: 'B6-venda', nome: 'Botica do Brejo Roxo', saida: { zona: 'B6', x: 39, y: 18 }, passo: 13,
  loja: [...ESTOQUE_BASE, 'cuia-noturna', 'garapa'],
  fala: 'Botica do Brejo! Antídoto para tudo, menos para preço.',
  gente: [npc('aprendiz', 'Aprendiz de Boticário', 'cl-crianca-f', 8, 5, 'o', ['Estou decorando: Mel Puro para veneno, Unguento para queimadura, Pomada de Copaíba para tudo.', 'E Chá de Guaraná para quem desmaiou. Serve para criatura e para segunda-feira.'])],
  mimo: [{ o: 'pote-barro', x: 10, y: 6 }, { o: 'pote-barro', x: 10, y: 5 }, { o: 'estante-lab', x: 8, y: 4 }, { o: 'balanca', x: 4, y: 4 }, { o: 'quadro', x: 7, y: 1 }, { o: 'planta-b', x: 1, y: 7 }],
});
