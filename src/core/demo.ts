/**
 * DEMO GRATUITA de Adventures of Pingo (docs/DEMO.md). Tudo o que a demo muda fica aqui: textos, lojas, zonas liberadas
 * e a regra de saves. A chave é `DEMO` (src/core/progresso.ts), ligada só no `npm run build:demo` (`VITE_DEMO=1`);
 * no build normal nada daqui tem efeito.
 *
 * Limite: o jogo segue normal até a 2ª insígnia (Lia Teia, Bosque Alto). Ao recebê-la aparece a tela "Fim da demo"
 * (src/ui/telas/fim-demo.ts). Depois disso o jogador continua livre em `ZONAS_DEMO` (pode capturar, treinar, cortar os
 * cipós da Trilha dos Cipós com o Facão), mas a entrada da Gruta do Eco — o único caminho de Bosque Alto para Porto
 * Sereia e o resto do mapa — tem um guarda (portão `requer: '!demo'` em src/data/zonas/A-R3.ts). Por segurança, a
 * troca de zona (`irPara`, src/world/index.ts) também recusa qualquer zona fora da lista, venha de warp, evento ou voo.
 */
import type { SaveData } from './tipos';
import { DEMO } from './progresso';

export { DEMO };

/** a demo vai até esta insígnia (inclusive) */
export const INSIGNIAS_DA_DEMO = 2;

/**
 * Zonas jogáveis na demo: as que a simulação de progressão alcança até a 2ª insígnia com o guarda da Gruta do Eco
 * fechado (`npm run check` confere: checagem "demo" em tools/verify/progressao.ts).
 */
export const ZONAS_DEMO: readonly string[] = [
  'A1-quarto', 'A1-casa-jogador', 'A1', 'A1-lab', 'A1-casa-1', 'A1-casa-2', 'A-R1',
  'A2', 'A2-ginasio', 'A2-casa-aroeira', 'A2-posto', 'A2-venda', 'A2-casa-1', 'A2-casa-2',
  'A-R2', 'A-MS', 'A3', 'A-R3', 'A3-ginasio', 'A3-posto', 'A3-venda', 'A3-casa-1', 'A3-casa-2', 'A3-casa-3',
];
/** a zona pode ser visitada neste pacote? (no jogo completo, sempre) */
export const zonaNaDemo = (id: string): boolean => !DEMO || ZONAS_DEMO.includes(id);

/**
 * Lojas onde o jogo completo vai estar. `url` vazio = ainda sem link (a tela mostra só o nome).
 * Quando as páginas existirem, preencha o `url` aqui e gere a demo de novo.
 */
export const LOJAS: { nome: string; url: string }[] = [
  { nome: 'App Store', url: '' },
  { nome: 'Google Play', url: '' },
  { nome: 'PC', url: '' },
];

/** textos da demo (tela de fim, guarda da gruta, recusas de save). `{JOGADOR}` vira o nome do jogador. */
export const TEXTOS_DEMO = {
  /** selo discreto no título e no menu */
  selo: 'Demo',
  titulo: 'FIM DA DEMO',
  agradecimento: 'Obrigado por jogar, {JOGADOR}! Você venceu a Lia Teia e ganhou a Insígnia Casulo.',
  completo: 'A aventura continua no jogo completo: mais 14 insígnias, a Liga dos Guardiões, o Sertão das Névoas e muito mais.',
  lojas: 'Em breve na App Store, no Google Play e no PC.',
  save: 'Seu jogo continua de onde parou: no menu de jogos use "Copiar código" ou "Exportar arquivo .pingo" e abra no jogo completo.',
  seguir: 'Até lá, dá para continuar explorando, capturando e treinando por aqui.',
  rodape: 'A: continuar explorando',
  /** fala do guarda na entrada da Gruta do Eco (A-R3) */
  guarda: 'Fim da demo!\fA Gruta do Eco, Porto Sereia e o resto de Pindorama estão no jogo completo, em breve na App Store, no Google Play e no PC.\fSeu jogo vai junto: no menu de jogos, use "Copiar código" ou "Exportar arquivo .pingo".\fAté lá, a Trilha dos Cipós e o Bosque Alto são todos seus!',
  /** recusa de troca de zona fora da demo (rede de segurança; o caminho normal para no guarda) */
  zonaFechada: 'Fim da demo! Este caminho fica para o jogo completo.',
  /** save que já passou do limite da demo (importado do jogo completo) */
  saveCompleto: 'Este jogo já passou do fim da demo (2ª insígnia). Ele abre no jogo completo, na App Store, no Google Play e no PC. Nada foi apagado.',
};

/** motivo para a demo NÃO abrir este save (null = pode abrir). Nunca altera o save. */
export function motivoForaDaDemo(s: Pick<SaveData, 'insignias' | 'jogador' | 'ultimoPosto'>): string | null {
  if (!DEMO) return null;
  if (s.insignias.some((n) => n > INSIGNIAS_DA_DEMO)) return TEXTOS_DEMO.saveCompleto;
  if (!ZONAS_DEMO.includes(s.jogador.zona) || (s.ultimoPosto && !ZONAS_DEMO.includes(s.ultimoPosto.zona))) return TEXTOS_DEMO.saveCompleto;
  return null;
}
