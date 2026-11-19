/**
 * View da batalha: registra as telas 'batalha' (layout clássico, fila de eventos, menus) e 'evolucao' (cinemática),
 * além de 'vitrine-golpes' (galeria de conferência das animações: `?tela=vitrine-golpes`).
 * Peças: view/cena.ts (FX), view/palco.ts (arena e atores), view/hud.ts (caixas de status), view/menus.ts, view/tela.ts,
 * anims/ (uma animação por id de golpe) e evolucao.ts.
 */
import '../styles/batalha.css';
import { registrarTela } from '../ui/telas';
import { FX_SRC, idsFx, temFx } from './view/cena';
import { criarTelaBatalha } from './view/tela';
import { criarTelaEvolucao } from './evolucao';
import { criarVitrineGolpes, medirAnimacoes } from './view/vitrine';
import { ANIMS, animsFaltando } from './anims';

const css = document.createElement('style');
css.textContent = `.fx{background-image:url(${FX_SRC})}`;
document.head.append(css);

registrarTela('batalha', criarTelaBatalha);
registrarTela('evolucao', criarTelaEvolucao);
registrarTela('vitrine-golpes', criarVitrineGolpes);

const faltam = animsFaltando();
if (faltam.length) console.error('[batalha] animações sem registro:', faltam.join(', '));
/** inspeção em testes */
(window as unknown as { __pingoBatalha: unknown }).__pingoBatalha = { ANIMS, idsFx, temFx, animsFaltando, medir: medirAnimacoes };
