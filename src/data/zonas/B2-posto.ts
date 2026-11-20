import { postoGuardiao } from './_b1-lib';

/** Posto Guardião de Pantanal Grande (porta em (12, 13) na cidade). */
export default postoGuardiao('B2', 'Pantanal Grande', 9, 'pantanal', [12, 14], [
  'MURAL DE MISSÕES — PANTANAL GRANDE',
  '• Dona Brejeira, da primeira palafita, precisa de alguém que vigie um ninho por um dia inteiro.',
  '• O Centro de Reabilitação procura quem adote filhotes resgatados (depois que o ninhal for salvo).',
  '• AVISO DA BOIADEIRA: ninhal do sul interditado. Gente estranha mexendo nos ovos.',
], [
  { sprite: 'cl-pescador', nome: 'Pescador Pacu', fala: ['Dizem que a Zefa enfrenta desafiante montada num Emaçu. Mentira: ela anda a pé, o Emaçu é que segue.', 'Bicho de Terra não sente choque. Deixe o seu de Trovão no Viveiro antes de entrar no ginásio.'] },
  { sprite: 'npc-mulher-3', nome: 'Turista Marta', mov: 'vagar', fala: ['Vim de trem de Porto Sereia para ver o Tuiuiú. Vi três! E um jacaré viu a mim.', 'Me disseram que de noite, na água, os bichos aparecem em dupla. Eu não fiquei para conferir.'] },
]);
