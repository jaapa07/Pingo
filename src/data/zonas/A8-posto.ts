import { postoGuardiao } from './_a1-grade';

/** Posto Guardião de Vila Ferrugem. */
export default { ...postoGuardiao('A8', 'Vila Ferrugem', [16, 13], [
  { sprite: 'cl-ferreiro', nome: 'Ferreiro Malho', fala: ['No ginásio da Bigorna as esteiras mudam de lado quando alguém pisa na engrenagem do chão.', 'Minha dica? Olhe antes de pisar. Minha experiência? Eu não olhei.'] },
  { sprite: 'npc-mulher-3', nome: 'Dona Limalha', fala: ['Com a Força você empurra o pedregulho da saída leste e segue para Vila Buriti.', 'Lá fica o oitavo ginásio. Depois dele, só a Liga dos Guardiões.'], mov: 'parado' },
]), passo: 7 };
