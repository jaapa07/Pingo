/**
 * Chaves de progresso do pacote do jogo (uma constante por região/recurso ainda em construção).
 * `MAPA_B_ABERTO`: enquanto as zonas do Sertão das Névoas (mapa B) não estiverem completas, o Trem Serra-Sol e o
 * Saveiro não embarcam ninguém depois da Liga — o maquinista e o barqueiro dizem que a linha está em obras.
 * O save não muda: passe, bilhete e a flag `liga-vencida` continuam valendo quando a chave virar `true`.
 * Em condições (`Cond`) a chave é o termo `mapa-b` (ex.: `se: 'flag:liga-vencida&!mapa-b'`).
 */
export const MAPA_B_ABERTO = false;
/** falas de recusa enquanto a linha para o mapa B está fechada */
export const EM_OBRAS: Record<'trem' | 'saveiro', string> = {
  trem: 'O maquinista tira o boné e coça a cabeça:\n"Campeão, a linha da serra está em obras! Caiu barreira no túnel e a turma ainda está assentando trilho."\f"Guarde bem o seu Passe. Quando a Maria-Fumaça voltar a subir, o Rádio Cipó avisa."',
  saveiro: 'O mestre do Saveiro aponta o casco virado no estaleiro:\n— Rio acima, só depois da reforma, Campeão. O barco está em obras: tábua nova, vela nova, tudo.\f— Guarde o bilhete. Quando o Saveiro voltar para a água, o Rádio Cipó avisa.',
};
