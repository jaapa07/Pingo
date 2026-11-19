/** Posto Guardião de Brejo Roxo. */
import { posto, npc } from './_b2-lib';

export default posto({
  id: 'B6-posto', nome: 'Posto Guardião de Brejo Roxo', saida: { zona: 'B6', x: 16, y: 18 }, passo: 13,
  mural: [
    'MURAL DE MISSÕES — BREJO ROXO',
    '• PROCURA-SE: Doutor Peçonha, líder do ginásio. Visto pela última vez indo ao Curtume Abandonado com uma lanterna e uma cobra no pescoço.',
    '• Dona Rã, do charco, procura as cinco Pererequinhas que criava soltas no quintal.',
    '• No Vale do Veneno, o Seu Timbó troca antídotos por notícias do brejo.',
  ],
  gente: [
    npc('enfermo', 'Garimpeiro Verde', 'cl-garimpeiro', 3, 5, 'l', ['Fui lavar o rosto no riacho roxo. Agora estou assim, verde.', 'A atendente disse que passa. Disse rindo, mas disse.']),
    npc('guarda', 'Guardiã Sucupira', 'cl-mateira', 10, 5, 's', ['O Cartel Ferrugem rouba criatura para vender e, pelo jeito, para estudar veneno.', 'Capanga deles anda de macacão e adora batalha em dupla com criatura de Veneno e de Ferro. Leve tipo Terra.'], { se: '!flag:laboratorio-ok' }),
  ],
});
