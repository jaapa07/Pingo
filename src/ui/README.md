# Kit de interface — Adventures of Pingo

Tudo em **px nativos inteiros** na tela 320×180 (`#tela`), DOM/CSS puro e sem fontes do sistema.
Veja tudo junto em `?tela=vitrine-kit` (código de exemplo: `src/ui/telas/vitrine.ts`).

## De onde vem a arte
- Grades de caracteres desenhadas à mão em `assets-src/ui/` (`paleta.ts`, `fontes.ts`, `molduras.ts`, `icones.ts`, `toque.ts`, `titulo.ts`).
- `npx tsx tools/build-ui.ts [--previa]` gera `public/assets/ui/` (`ui.png`, `fonte8.png`, `fonte12.png`, `camadas/*.png`) e o índice `src/ui/gerado/kit.json`. `--previa` grava folhas de conferência em `tools/.cache/`.
- Para acrescentar um ícone: ponha a grade em `ARTES` (`icones.ts`), rode o build e use `spr('nome')`.

## Texto — `fonte.ts`
```ts
texto(str, { tamanho: 8 | 12, cor, sombra, largura, alinhar: 'esq'|'centro'|'dir', entrelinha }) → HTMLElement
escrever(el, str, opts?)   // reescreve um elemento criado por texto()
medir(str, tamanho)        // largura em px
quebrar(str, largura, tamanho) → string[]
revelar(el, n)             // letra a letra
em(el, x, y)               // posiciona qualquer elemento em px nativos
```
- Cores: `branco creme tinta cinza chumbo vermelho verde azul amarelo laranja roxo rosa marrom ouro agua`. Trecho colorido: `{c:vermelho}…{/c}`.
- Fonte 8: traço fino, entrelinha 10 (rótulos, listas). Fonte 12: traço de 2 px, entrelinha 14 (falas, títulos).
- Glifos: A–Z, a–z, 0–9, `ÁÀÂÃÉÊÍÓÔÕÚÜÇ` e minúsculas, pontuação, `♂ ♀ ← → ↑ ↓ ▶ ◀ ▲ ▼ ♥ ★ ♪ • · … º ª × °`. Caractere sem glifo vira `?`.
- A largura/altura do elemento ficam em `el.style.width/height`; a origem é o topo da célula (acentos de maiúsculas sobem até 3 px).

## Peças — `kit.ts`
| Função | O que devolve |
|---|---|
| `moldura(tipo, w, h, x?, y?)` | 9-slice: `madeira` (menus), `cipo`, `azulejo`, `texto` (caixa de fala), `placa` (nomes/avisos), `tinta` (painel escuro de status), `botao`, `botao-foco`, `botao-ap`, `trilho`, `selecao` (cantoneiras), `bisel`. Anexe o conteúdo direto no elemento. Bordas: 8 px (madeira, cipo, azulejo, texto, bisel), 4 px (placa, tinta, botões, selecao). |
| `spr(nome)` / `trocarSpr(el, nome)` | sprite do atlas: `cursor`, `seta-cima/baixo/esq/dir`, `continuar`, `sol`, `lua`, `folha-cipo`, `tipo-<tipo>`, `status-<id>` e `status-<id>-mini`, `insignia-<1..16>` e `-vazia`, `bolso-<bolso>`, peças de toque. |
| `iconeTipo(t)` · `chipTipo(t, largura)` | ícone 12×12 · etiqueta com nome na cor do tipo. `CORES_TIPO[t] = [base, escura, clara]`, `NOME_TIPO`. |
| `iconeStatus(s, mini?)` | etiqueta com sigla (QMD ENV PAR SON GEL ENC DSM; em inglês BRN PSN PAR SLP FRZ CHM FNT, sprites `status-<id>-en`) ou mini 9×9. |
| `insignia(n, tem)` · `fileiraInsignias(lista, porLinha, passo)` | 16×16; sem a insígnia mostra a silhueta. `NOME_INSIGNIA`. |
| `iconeBolso(b)` | 16×16 (`itens remedios cuias pergaminhos frutos chave`), `NOME_BOLSO`. |
| `barra('vida' \| 'exp', largura, aoAndar?)` | `{ el, definir(frac, animar), atualizar(dt), px }`. Vida: 6 px de altura, verde > 50%, amarelo > 20%, vermelho; anda 1 px por vez (chame `atualizar` no passo; `aoAndar(px, max)` serve para os números descerem junto). Exp: 4 px. |
| `cursorMao()` · `seta(dir, pisca?)` · `botao(rotulo, largura?)` | cursor animado · seta · botão com `definirFoco/definirApertado`. |
| `camada(nome)` | camadas grandes/repetíveis (`palha`, `serra`, `morros`, `mata`, `mar`, `nuvem`, `sol`, logos). |
| `som(id)` · `fmtTempo(s)` · `PALETA` | utilidades. |

Classes CSS úteis (`styles/kit.css`): `.pisca`, `.quica`, `.fundo-noite/papel/mata/azul`.

## Componentes — `componentes/`
Passivos: a tela dona chama `atualizar(dt)` do componente que está em foco.
- `Lista` (`lista.ts`): `new Lista({ itens, x, y, largura, visiveis, tamanho, moldura, inicial, aoEscolher, aoCancelar, aoMover })`; itens `{ rotulo, valor?, icone?, desabilitado?, cor? }`; `definirItens`, `definirValor(i, txt)`, `selecionar`, `focar`. Cursor de mão, rolagem com setas, repetição ao segurar, toque e mouse.
- `Grade` (`grade.ts`): células prontas + cantoneiras de seleção; `aoSair(lado)` para ligar com outro componente.
- `Abas` (`abas.ts`): esquerda/direita ou toque; aceita ícones.
- `perguntar(pergunta, opcoes)`, `confirmar(pergunta)`, `informar(msg)` (`confirmacao.ts`): janelas centrais com Promise.

## Telas
```ts
import { elTela, fechar } from './base';
registrarTela('equipe', (args) => {
  const el = elTela('ui');                       // 320×180, recortado
  const tela: Tela = { el, atualizar(dt) { if (input.apertou('b')) fechar(tela, resultado); } };
  return tela;
});
const r = await abrirTela('equipe', args);       // resolve com o resultado passado a fechar()
```
- Só a tela do topo recebe `atualizar`. Use `sobreposta: true` para janelas sobre o mapa/batalha.
- Registradas por este módulo: `splash`, `titulo`, `saves`, `nome`, `relogio`, `opcoes`, `vitrine-kit`. Um arquivo `src/ui/telas/registro.ts`, se existir, é importado pelo `main.ts` na inicialização (lugar para registrar `menu`, `equipe`, `mochila`…).
- Transições de `telas.trocar(t, classe)`: `fade`, `branco`, `faixas`, `folhas` (em `styles/base.css`).

## Diálogo — `dialogo.ts` (contrato do MOTOR.md)
`falar`, `escolher`, `simNao`, `pedirNome`, `avisar`, `abrirTela`, mais `CaixaTexto` (a caixa letra a letra, para a batalha reaproveitar: `definir(str)`, `atualizar(dt, rapido)`, `completar()`, `proxima()`, `mostrarSeta(b)`) e `substituir(str)`.
Retrato: `quem.retrato` = id de modelo com vista `retrato` (48×48; animações `neutro/feliz/bravo`). Voz: `bus.emit('babble', { voz, texto })`.

## Entrada — `core/input.ts`
`input.apertou/segurando/soltou/repetiu(acao)`, `input.eixo()`, `input.consumir(acao)`, `input.pulsar(acao)`, `input.modo` (`teclado | controle | toque`), `input.vibrar(ms, forte?)`.
`tocavel(el, aoTocar, aoApontar?)` torna qualquer item clicável/tocável (só responde se estiver na tela do topo).
Controles de toque: `ui/toque.ts` (camada `#toque`, irmã de `#quadro`, com escala própria). `?toque=1` força no desktop.

## Save — `core/save.ts`
`listarSlots()`, `carregarSlot(i)`, `gravarSlot(i?)`, `apagarSlot(i)`, `autosalvar()`, `exportar(slot?)`, `importar(txt, slot?)`, `lerExportado(txt)`, `gravarOpcoes()`.
Autosave: escuta `bus` em `'zona'`, `'posto-entrou'` e `'autosave'` (só depois de o jogo começar; nos atalhos de URL o slot é −1 e nada é gravado).
