/** Catálogo de músicas (ids usados por zonas, eventos e batalha). Lista comentada em docs/AUDIO.md. */
import type { Faixa } from './types';
import { agua, caverna, mergulho, pico, rotaDiaA, rotaDiaB, rotaNoiteA, rotaNoiteB, temaTitulo, vilaJacaranda } from './cenario';
import { cidadeBaiao, cidadeCatira, cidadeChoro, cidadeForro, cidadeFrevo, cidadeGaucha, cidadeMaracatu, cidadeSamba } from './cidades';
import { batalhaCartel, batalhaConselho, batalhaLendario, batalhaLider, batalhaRival, batalhaSelvagem, batalhaTreinador, derrota, vitoriaLider, vitoriaSelvagem, vitoriaTreinador } from './batalhas';
import { captura, cartelTema, creditos, evolucao, ginasio, laboratorio, posto, saveiro, trem, venda } from './eventos';

export type { Faixa } from './types';

const LISTA: Faixa[] = [
  temaTitulo, vilaJacaranda,
  cidadeForro, cidadeFrevo, cidadeSamba, cidadeBaiao, cidadeMaracatu, cidadeChoro, cidadeCatira, cidadeGaucha,
  rotaDiaA, rotaNoiteA, rotaDiaB, rotaNoiteB, caverna, agua, mergulho, pico,
  posto, venda, laboratorio, ginasio,
  batalhaSelvagem, batalhaTreinador, batalhaRival, batalhaLider, batalhaCartel, batalhaConselho, batalhaLendario,
  vitoriaSelvagem, vitoriaTreinador, vitoriaLider, derrota,
  evolucao, captura, trem, saveiro, cartelTema, creditos,
];

export const FAIXAS: Record<string, Faixa> = Object.fromEntries(LISTA.map((f) => [f.id, f]));

/** Apelidos aceitos por compatibilidade. */
FAIXAS['game-over'] = derrota;
FAIXAS['titulo'] = temaTitulo;

/** Tema de cidade sugerido para cada cidade dos dois mapas. */
export const MUSICA_DA_CIDADE: Record<string, string> = {
  A1: 'vila-jacaranda', A2: 'cidade-samba', A3: 'cidade-choro', A4: 'cidade-frevo', A5: 'cidade-maracatu', A6: 'cidade-samba',
  A7: 'cidade-choro', A8: 'cidade-baiao', A9: 'cidade-catira',
  B1: 'cidade-catira', B2: 'cidade-baiao', B3: 'cidade-baiao', B4: 'cidade-forro', B5: 'cidade-samba', B6: 'cidade-maracatu',
  B7: 'cidade-gaucha', B8: 'cidade-choro', B9: 'cidade-frevo',
};
