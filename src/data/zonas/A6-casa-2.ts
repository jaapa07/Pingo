import { casaSimples } from './_a1-grade';

/** Palafita do Seu Maré-Baixa: a criatura das sextas (regra clássica aprovada) aparece no fundo da baía. */
export default casaSimples({
  id: 'A6-casa-2', nome: 'Palafita do Seu Maré-Baixa', tema: 'palafita', musica: 'cidade-choro', arena: 'praia', passo: 5, volta: [21, 19], parede: 'rede-pesca',
  estante: ['Tábua de marés anotada a lápis. Toda sexta-feira tem um círculo e a palavra "ELA".'],
  bau: ['Uma luneta de latão apontada para a janela.'],
  moradores: [
    { id: 'a6-mare', sprite: 'npc-idoso', nome: 'Seu Maré-Baixa', fala: ['Toda sexta-feira, uma Tartaruga-Gigante sobe para respirar numa clareira do Recife Submerso, debaixo da Baía Azul.', 'Só às sextas. Nos outros dias ela tem mais o que fazer, igual a gente.', 'Para descer lá precisa do Amuleto do Mergulho. Volte quando for Campeão e tiver andado pelo Sertão.'] },
    { id: 'a6-neta', sprite: 'cl-crianca-f', nome: 'Duda', mov: 'vagar', fala: ['O vô marca no calendário o dia da tartaruga. E o dia do pastel. São o mesmo dia.'] },
  ],
});
