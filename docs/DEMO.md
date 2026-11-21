# Demo gratuita e pacotes do itch.io

Três pacotes extras saem do mesmo código. O `npm run build` normal (site https://jaapa07.github.io/Pingo/, PC, iPhone)
**não muda**: continua o jogo completo, com Service Worker, e nada da demo ou do itch.io vale nele.

| Comando | Pasta / arquivo | Para quê | Base | Service Worker |
|---|---|---|---|---|
| `npm run build:demo` | `dist-demo/` | demo no GitHub Pages de **jaapa07/Pingo-demo1** | `/Pingo-demo1/` (mude com `DEMO_BASE`) | sim (offline, PWA) |
| `npm run build:itch` | `dist-itch/` + `pingo-demo-itch.zip` | demo no **itch.io** | `./` | não |
| `npm run build:itch:completo` | `dist-itch-completo/` + `pingo-completo-itch.zip` | jogo **completo** no itch.io | `./` | não |

As pastas e os .zip ficam fora do git (`.gitignore`). O script é `tools/build-pacote.ts`.

## Como a demo funciona

- A chave é `VITE_DEMO=1` (`DEMO` em `src/core/progresso.ts`). **Tudo o que a demo muda fica em `src/core/demo.ts`**:
  insígnia-limite, zonas liberadas, textos e as lojas.
- **Limite:** a demo vai até a **2ª insígnia** (Lia Teia, Bosque Alto). Ao ganhá-la, assim que o jogador fica livre,
  aparece uma vez a tela **"Fim da demo"** (`src/ui/telas/fim-demo.ts`): agradece, diz que o jogo completo vai estar
  na App Store, no Google Play e no PC e explica como levar o save ("Copiar código" ou "Exportar arquivo .pingo").
- Depois disso o jogador continua livre nas 24 zonas de `ZONAS_DEMO` (Vila inicial → Bosque Alto e Trilha dos Cipós):
  captura, treina, corta os cipós. O único caminho adiante, a **Gruta do Eco**, tem um guarda (portão `requer: '!demo'`
  em `src/data/zonas/A-R3.ts`; no jogo completo ele não existe).
- **Rede de segurança:** `irPara` (`src/world/index.ts`) recusa qualquer zona fora de `ZONAS_DEMO`, venha de warp,
  evento, voo, trem ou atalho; o enxame do dia do Rádio só sorteia zonas da demo; os atalhos de teste por URL
  (`?zona=`, `?tela=`) ficam desligados na demo. O pacote só leva os bakes das zonas da demo.
- **Verificador:** `npm run check` tem a checagem **demo**: simula a progressão com o guarda fechado e confere que só as
  insígnias 1 e 2 e só as zonas de `ZONAS_DEMO` são alcançáveis (se alguém abrir um caminho novo, ela falha).
- **Saves:** a demo grava em chaves próprias (`pingo-demo.*`) e usa caches com prefixo próprio (`pingodemo-`): no
  GitHub Pages ela divide o domínio `jaapa07.github.io` com o jogo completo, e um não mexe no save nem no cache offline
  do outro. Para levar o jogo: na demo, menu de jogos → "Copiar código" (ou "Exportar arquivo .pingo"); no jogo
  completo, um Jogo vazio → "Colar código" (ou "Importar arquivo .pingo"). Nada se perde.
- **Save do jogo completo na demo:** se já passou da 2ª insígnia ou está fora das zonas da demo, a demo recusa com a
  mensagem "Este jogo já passou do fim da demo…" e não grava nada.
- **Selo:** "Demo · v1.0" no canto do título e "Demo" no canto do menu.

### Textos e links das lojas
Em `src/core/demo.ts`: `TEXTOS_DEMO` (tela de fim, guarda, recusas) e `LOJAS`. Quando houver links, preencha os `url`
de `LOJAS` e gere a demo de novo; a tela de fim passa a mostrar cada link embaixo de "Em breve…".

## Publicar a demo no GitHub Pages (jaapa07/Pingo-demo1)

1. `npm run build:demo` (repositório com outro nome: `DEMO_BASE=/NomeDoRepo/ npm run build:demo`).
2. Envie o **conteúdo** de `dist-demo/` (inclusive o arquivo oculto `.nojekyll`) para a raiz da branch publicada do
   repositório Pingo-demo1 (por exemplo a branch `main`, ou `gh-pages`).
3. No repositório: Settings → Pages → Build and deployment → Source: **Deploy from a branch** → a branch e `/ (root)`.
   O `.nojekyll` é necessário: sem ele o GitHub descarta os arquivos que começam com `_` (há vários em `assets/`).
4. Endereço: https://jaapa07.github.io/Pingo-demo1/ . Funciona offline depois do primeiro acesso, como o site normal.

Para atualizar: gere de novo e substitua todo o conteúdo publicado (não misture arquivos de versões diferentes).

## Publicar no itch.io

O itch.io roda o jogo HTML dentro de um iframe de outro domínio, por isso esses pacotes:
- usam caminhos relativos (`./`) e não registram Service Worker (o jogo não fica offline no itch; é normal);
- juntam os ~15 mil arquivos de zonas, sprites e arenas em `pacotes/*.bin` (o itch.io aceita no máximo ~1000 arquivos
  por .zip). O jogo lê cada pacote na primeira vez que precisa dele (`src/core/pacotes.ts`), então começa rápido;
- demo: 390 arquivos, ~20 MB no .zip · completo: 579 arquivos, ~34 MB no .zip. O script recusa passar de 1000.

Limites do itch.io que valem conferir na página de ajuda deles (não consegui abri-la daqui): até 1000 arquivos,
até 500 MB descompactado, até 200 MB por arquivo, nomes até 240 caracteres. Os pacotes ficam bem abaixo.

### Passo a passo
1. `npm run build:itch` (demo) ou `npm run build:itch:completo` (jogo completo).
2. No itch.io: Create new project (ou Edit game) → **Kind of project: HTML**.
3. Uploads → envie `pingo-demo-itch.zip` (ou `pingo-completo-itch.zip`) → marque **This file will be played in the browser**.
4. **Embed options** (recomendado):
   - **Viewport dimensions: 960 × 540** (a tela do jogo é 320×180; 960×540 é a escala 3× exata, sem bordas).
   - ✔ **Mobile friendly** — orientação **Automatic** (o jogo se ajusta em pé e deitado, com controles de toque);
     deitado fica melhor, mas não é obrigatório.
   - ✔ **Fullscreen button** (em tela cheia o jogo escala para 1920×1080 com pixels inteiros).
   - ✔ **Click to launch in fullscreen** só se quiser forçar tela cheia no celular; sem ela o jogo também cabe.
   - ☐ Automatically start on page load: opcional (com ele o som só começa no primeiro toque/tecla, como no site).
   - Scrollbars: desligadas.
5. Textos prontos da página (descrição, tags, imagens): `docs/ITCH-PAGINA.md`.

### Saves no itch.io
O save fica no armazenamento do navegador **do domínio do itch** (localStorage/IndexedDB do iframe). Funciona e
continua entre visitas, mas alguns navegadores (Safari, modo anônimo, limpeza de dados) podem apagar o armazenamento de
iframes de terceiros. Vale dizer na página: "use Copiar código / Exportar arquivo .pingo para guardar o seu jogo".
O código funciona entre todas as versões (itch, site, PC, iPhone), e o save da demo do itch abre no jogo completo.
Demo e completo no itch usam chaves diferentes (`pingo-demo.*` × `pingo.*`).

## Testes (Playwright, `tools/testes/demo/`)
- `npx tsx tools/testes/demo/demo.mts` — dist-demo em /Pingo-demo1/ num iPhone 13 emulado (toque): Service Worker e
  caches próprios, save preparado antes da Lia Teia, vitória na tela, "Fim da demo", selo no menu, guarda da Gruta do
  Eco, `irPara` recusando A-GE/A4/B1/A-LG, exporta o código, recusa de um save pós-Liga do jogo completo.
- `npx tsx tools/testes/demo/importar.mts` — (depois de `npm run build`) cola o código da demo no jogo completo pelo
  menu de jogos e confere que nada se perdeu e que a Gruta do Eco abre.
- `npx tsx tools/testes/demo/itch.mts demo|completo` — extrai o .zip, serve em 127.0.0.1 e abre num iframe de
  960×540 em localhost (outra origem): sem Service Worker, mapa/sprites/arena vindos dos pacotes, anda, batalha,
  salva pelo menu, recarrega e continua; escala em tela cheia e no iPhone em pé/deitado; no completo, Vila Cascavel (B1),
  B2 e o Pico (PP) do mapa B carregam.
Ordem: `npm run build:demo && npm run build && npm run build:itch && npm run build:itch:completo`, depois demo.mts,
importar.mts, demo.mts de novo (para a recusa usar o save do completo) e itch.mts. Fotos no scratchpad (`FOTOS_DEMO`).
