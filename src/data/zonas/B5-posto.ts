/** Posto Guardião de Cidade Ginga. */
import { posto, npc } from './_b2-lib';

export default posto({
  id: 'B5-posto', nome: 'Posto Guardião de Cidade Ginga', saida: { zona: 'B5', x: 14, y: 18 }, passo: 11,
  mural: [
    'MURAL DE MISSÕES — CIDADE GINGA',
    '• O Mestre Cabaça procura três alunos que fugiram do treino para a Trilha da Roda.',
    '• Dona Dendê, da Feira, precisa de pequi, caju e açaí para o tabuleiro.',
    '• Aviso: gente de macacão ferrugem foi vista rumo ao Brejo Roxo. Quem souber de algo, fale com os Guardiões.',
  ],
  gente: [
    npc('capoeirista', 'Capoeirista Canjiquinha', 'cl-capoeirista', 3, 5, 'l', ['Minha Preguinho torceu o rabo num aú mal dado.', 'A máquina do Posto resolve em três acordes. É quase um berimbau com luzinha.']),
    npc('viajante', 'Viajante Otília', 'npc-mulher-1', 10, 5, 's', ['Depois da insígnia do Mestre Gingado, a gente ganha o Amuleto da Cachoeira.', 'Aí é voltar para a Costa do Sol e subir o Rio Cachoeira-Véu até Vila Ferrugem. O mundo dá voltas, e a gente junto.']),
  ],
});
