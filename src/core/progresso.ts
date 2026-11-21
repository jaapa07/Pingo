/**
 * Chaves de progresso do pacote do jogo (uma constante por região/recurso ainda em construção).
 * `MAPA_B_ABERTO`: enquanto as zonas do Sertão das Névoas (mapa B) não estiverem completas, o Trem Serra-Sol e o
 * Saveiro não embarcam ninguém depois da Liga — o maquinista e o barqueiro dizem que a linha está em obras.
 * O save não muda: passe, bilhete e a flag `liga-vencida` continuam valendo quando a chave virar `true`.
 * Em condições (`Cond`) a chave é o termo `mapa-b` (ex.: `se: 'flag:liga-vencida&!mapa-b'`).
 */
export const MAPA_B_ABERTO = true;
/** falas de recusa enquanto a linha para o mapa B está fechada */
export const EM_OBRAS: Record<'trem' | 'saveiro', string> = {
  trem: 'O maquinista tira o boné e coça a cabeça:\n"Campeão, a linha da serra está em obras! Caiu barreira no túnel e a turma ainda está assentando trilho."\f"Guarde bem o seu Passe. Quando a Maria-Fumaça voltar a subir, o Rádio Cipó avisa."',
  saveiro: 'O mestre do Saveiro aponta o casco virado no estaleiro:\n— Rio acima, só depois da reforma, Campeão. O barco está em obras: tábua nova, vela nova, tudo.\f— Guarde o bilhete. Quando o Saveiro voltar para a água, o Rádio Cipó avisa.',
};

/**
 * `DEMO`: pacote de DEMONSTRAÇÃO gratuita (`npm run build:demo` → `dist-demo/`, docs/DEMO.md). Vem da variável de build
 * `VITE_DEMO=1`; o `npm run build` normal (site, PC, iOS) não a define e continua o jogo completo, sem mudança nenhuma.
 * Na demo o jogo vai até a 2ª insígnia: textos, zonas liberadas e regras de save ficam em `src/core/demo.ts`.
 * Em condições (`Cond`) a chave é o termo `demo` (ex.: o portão da Gruta do Eco em A-R3 tem `requer: '!demo'`).
 * Fora do Vite (tsx, ferramentas) `import.meta.env` não existe: vale `false`.
 */
export const DEMO: boolean = (import.meta.env?.VITE_DEMO ?? '') === '1';
