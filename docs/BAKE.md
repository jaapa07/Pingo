# BAKE.md — tiles, catálogo e bake dos mapas (detalhes além de ZONAS.md)

Rodar: `npx tsx tools/bake-maps.ts [id|prefixo* ...] [--previa] [--so-tiles]` (`npm run bake` = tudo).
`--previa` grava `tools/.cache/previa/<id>-dia.png` e `-noite.png` (zona inteira, chão + camada alta) para conferir a olho:
`ffmpeg -v error -y -i tools/.cache/previa/<id>-dia.png -vf "scale=iw*3:ih*3:flags=neighbor" -update 1 x.png`.
O bake assa TODO arquivo de `src/data/zonas/*.ts` cujo `export default` tenha `mapaChars` (inclusive `_demo-*` e `_teste-*`); um arquivo que não carrega no Node vira aviso, não derruba o resto.

## Ferramentas (`tools/pixel/`)
- `png.ts`: `codificar(bitmap)` (indexado de 1/2/4/8 bits com PLTE+tRNS quando há ≤ 256 cores, senão RGBA), `codificarRGBA`, `codificarIndexado`, `decodificar` (8 bits e indexados, sem entrelaçamento). Só `node:zlib`.
- `tile.ts`: `Img` (cor 0xRRGGBB por pixel, alfa binário, `colar/recorte/trocar/salvar/ler`), `pix(linhas, cores)` (tile desenhado à mão), `folha(tiles, cols)`, `ruido(x, y, semente)` (variação fixa por posição), `corNoPeriodo` / `tabelaPeriodo` (troca de paleta por período, com cores "acesas" à noite).

## Tileset exterior (`src/data/tilesets/<nome>.ts`, `export default: TilesetExterior` — tipos em `tipos.ts`)
- `paleta`: 32 cores com letra fixa (`g G l L` chão · `t T U` caminho · `s S Z` areia/alternativo · `a A e E` água · `r R q Q` rocha · `f F v V` folhagem · `m M n` madeira · `y p w` flores · `x X o` perigo · `k` contorno).
- `arte`: grades de caracteres 16×16 desenhadas à mão. A arte comum fica em `_comum.ts`; cada bioma troca a decoração (`,`), texturas e arbustos próprios. `base` diz a letra do `.` de cada textura cheia.
- `arvore` / `arvoreSacudivel`: espécies de `tools/scenery/exterior/arvores.ts` (coqueiro, amendoeira, jequitibá, embaúba, manacá, ipês, araucária, pinheiro, árvore torta, buriti, mangue, mandacaru, árvore seca, barbada, estalagmite, cogumelo, coral, alga) — pintor 2D de pixel art (tufos com luz de cima-esquerda + contorno), não o pipeline 3D.
- `construcao`: cores do casario do bioma (os prédios do catálogo mudam de cara em cada tileset; `neve: true` cobre os telhados). `acesas`: letras que não escurecem à noite (lava, fungos, cristais).
- `public/assets/tiles/<nome>.png` + `.json`: todas as peças, um bloco por período empilhado na ordem de `periodos` (`alturaPeriodo` px cada); `pecas[nome] = { x, y, w, h, quadros }` (quadros lado a lado). O jogo precisa de: `din-c` (cipó), `din-p` (pedregulho), `din-r` (rocha rachada), `grama-passagem` (2 quadros, metade da frente da moita para desenhar sobre os pés) e, se quiser, `arvore-<especie>`.

## Autotile (tools/scenery/exterior/compositor.ts)
- Chão em camadas por prioridade: base `. , "` < `;` < `:` < `%` < `+` < `l` < `g` < `x` < água `~ d w` (e `=` sobre água). A borda é desenhada DENTRO do tile de maior prioridade, com ondulação fixa por posição e cantos arredondados (caminho `reta` = calçada com filete).
- Margem de água: barranco e sombra na margem norte, espuma animada nas outras; longe da margem (2 tiles) vira "mar aberto" com ondas escuras. `d` = mancha funda com bolhas; `w` = cascata de 4 quadros com crista e espuma no pé.
- `#`: topo de rocha com filete de luz + face de paredão no tile cuja vizinhança sul é livre; projeta sombra no chão ao sul e a leste. `e` = face com trepadeira. Espaço = preto `#0b0a14`.
- Objetos de 1 tile (`T t b f c p r v < > C o M`) herdam o chão mais comum dos 8 vizinhos (coqueiro na areia fica sobre areia).
- `T`/`t`: sprite com a base no tile; tudo acima do topo do tile vai para a camada alta; sombra elíptica no chão. `f` liga-se às cercas vizinhas. `=` escolhe o sentido das tábuas e põe guarda-corpo onde encosta em água.
- **`c`, `p`, `r` NÃO são assados** (somem/andam no jogo): o chão sob eles é assado e a posição vai em `zona.json.dinamicos`; o motor desenha o sprite `din-*` do tilesheet. Canteiro `C` é assado vazio (a planta é do motor).
- Sombras = cada cor desce um tom na própria rampa (sem cor nova). À noite, a `luz` dos objetos clareia o chão em dois anéis (cores entre a paleta da noite e a da tarde).

## Saída por zona (`public/assets/zonas/<id>/`)
- `chao-<periodo>-<cx>_<cy>.png` 160×160 (sempre existe; fora do mapa = preto), `alto-…png` (só se houver algo), `anim-…png` 640×160 = 4 quadros lado a lado, transparente fora dos tiles animados (só se houver). PNG indexado, alfa binário.
- Períodos: `manha dia tarde noite`; só `dia` quando o tileset tem `periodos: false` (caverna, submerso) ou a zona é `interior | caverna | ginasio | dungeon`.
- `zona.json`: `{ id, tileset, largura, altura (tiles; também w, h), tile: 16, chunk: 160 (px), chunkTiles: 10, colunas, linhas, periodos, quadros: 4 (= animQuadros), animMs: 250, chunks: [{ cx, cy, alto, anim }], gramaAlta: [[x, y]…], dinamicos: [{ c, x, y }…], luzes: [[xPx, yPx, raio]…] }`.

## Catálogo (`src/data/catalogo-objetos.ts` → `CATALOGO_EXTERIOR`)
`{ w, h, alto, colisao, porta?, animado?, luz?, desc }`. Objeto em (x, y) ocupa x..x+w−1 e y−h+1..y; `colisao` tem `h` linhas de cima para baixo (`#` bloqueia, `.` livre); `porta: [dx, dy]` → tile (x+dx, y−dy), sempre livre. O sprite tem (w·16)×((h+alto)·16) px; as `alto·16` linhas de cima vão para a camada alta. Árvores do catálogo podem passar da largura da célula (ficam centradas). `ginasio` aceita `cor: '#escuro,#base,#claro'` no spawn para a cor do tema.
O bake junta qualquer export de `src/data/catalogo-interiores.ts` que seja mapa nome → `{ w, h, alto }`.

## Gancho para interiores
Se existir `tools/scenery/interior/index.ts`, o bake importa dele:
- `TILESETS_INTERIOR: TilesetProprio[]` — `{ nome, periodos, pintarZona(zona, catalogo) }` devolvendo `{ larg, alt (tiles), quadros: Img[1..4] (chão inteiro), alto: Img }` e, se quiser, `animado`, `luzes`, `luz`, `acesas`, `gramaAlta`, `dinamicos` (tipos em `tools/scenery/exterior/compositor.ts`: `TilesetProprio`, `ZonaPintada`). Sem `animado`, o bake compara os quadros.
- `PINTORES_INTERIOR: Record<nome, PintorObjeto>` — para objetos de interior usados em zonas de tileset EXTERIOR (tipo em `tools/scenery/exterior/objetos.ts`).
