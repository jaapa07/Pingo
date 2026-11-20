import type { EventoDef } from '../../core/tipos';

const PECONHA = { nome: 'Doutor Peçonha', retrato: 'lider-13' };
/** Ginásio do Veneno: conversa, batalha e prêmios do líder (insígnia 13 Espinho, Pergaminho da Borra de Timbó; sem Amuleto). */
export const EVENTOS_GINASIO_13: EventoDef[] = [
  {
    id: 'ginasio-13-lider',
    passos: [
      ['se', 'flag:ginasio-13-vencido', [
        ['falar', PECONHA, 'Os exaustores estão ligados desde a sua vitória: pode passear pelos tanques sem prender a respiração.\fA Serra da Geada fica lá em cima, depois do passo da serra, ao norte da vila. Leve agasalho: a Gaúcha Pinhão não tem pena de quem treme.'],
      ], [
        ['falar', PECONHA, 'Ora, chegou inteiro! Contou as poças, poupou as plantas… Isso é ciência, meu jovem.\fSou o Doutor Peçonha. Estudo cobra, sapo e escorpião há trinta anos, e cada um deles me ensinou que veneno é só remédio na dose errada.\fE foi você quem fechou aquele laboratório do Cartel no curtume, não foi? Então vamos ver se a sua equipe tem o mesmo juízo!'],
        ['batalha', 'lider-13'],
        ['flag', 'venceu:lider-13'],
        ['musica', 'ginasio'],
        ['falar', PECONHA, 'Resultado conclusivo: você venceu. Tome, a Insígnia Espinho é sua!'],
        ['insignia', 13],
        ['falar', null, '{JOGADOR} recebeu a Insígnia Espinho!'],
        ['dar', 'pt-26'],
        ['falar', PECONHA, 'Esse pergaminho ensina a Borra de Timbó: o caldo do cipó que os pescadores antigos usavam para atordoar os peixes. Use com responsabilidade.\fAgora, uma coisa que me deixa feliz: desde que o laboratório caiu, o pessoal do brejo jura que viu um bicho enorme de cara de queixada andando pelas trilhas. Dizem que é a Caipora voltando para cuidar da mata.\fSe cruzar com ela, respeite. E siga viagem: com a Insígnia Espinho o guarda-serra libera o passo da serra, ao norte da vila. A Subida da Serra leva à Serra da Geada, onde a Gaúcha Pinhão guarda o ginásio do gelo.'],
      ]],
    ],
  },
];
