import type { ArenaDef } from './nucleo';
import { mata } from './biomas/mata';
import { restinga, praia, baia, mangue, recife } from './biomas/costa';
import { cerrado, pantanal, chapada, brejo, geada, planalto, pico } from './biomas/sertao';
import { caverna, usina, vulcao } from './biomas/subsolo';
import { GINASIOS } from './ginasios';

/** Todas as arenas de batalha (biomas + ginásios). */
export const ARENAS: ArenaDef[] = [restinga, mata, praia, baia, caverna, usina, mangue, cerrado, pantanal, chapada, vulcao, brejo, geada, planalto, recife, pico, ...GINASIOS];
