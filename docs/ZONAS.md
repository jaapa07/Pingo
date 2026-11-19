# ZONAS.md — mapas, tiles e bake (contrato)

Tipos em `src/core/tipos.ts` (`ZonaDef`, `Warp`, `NpcDef`, `Habitat`, `Portao`…). Cada zona é um arquivo `src/data/zonas/<id>.ts` com `export default` de um `ZonaDef`, **escrito à mão** (pode montar a grade com segmentos/linhas auxiliares, sem sorteio). Lista de zonas, ligações e ordem de progressão: seções 4.1–4.5 do spec.

## Unidades
TILE = 16 px nativos. Tela = 20 × 11,25 tiles. Coordenadas (x, y) em tiles, origem no canto superior esquerdo. Movimento em grade, 4 direções.

## Legenda global de `mapaChars` (a COLISÃO é global; a ARTE vem do tileset da zona)
| Char | Significado | Colisão |
|---|---|---|
| `.` | chão padrão do tileset (grama, piso, areia de caverna…) | livre |
| `,` | chão decorado (flores, pedrinhas, tapete) | livre |
| `:` | caminho (terra batida, calçada, corredor) | livre |
| `;` | areia / chão alternativo | livre |
| `"` | **grama alta** (encontros do método `grama`; em caverna/dungeon use `%`) | livre |
| `%` | chão de encontro de caverna/dungeon/mergulho (método `caverna` ou `mergulho`) | livre |
| `~` | água (método `agua`; exige Amuleto **remo**) | água |
| `d` | água funda marcada (ponto de **mergulho**) | água |
| `w` | cascata (exige **cachoeira** para subir; desce livre) | água |
| `=` | ponte / píer / tábua (anda por cima da água) | livre |
| `#` | parede / rocha / paredão (autotile de penhasco ou parede) | bloqueia |
| `T` | árvore grande (1 tile de base; copa na camada alta) | bloqueia |
| `t` | árvore **sacudível** (método `arvore`) | bloqueia |
| `b` | arbusto / moita baixa | bloqueia |
| `f` | cerca / mureta | bloqueia |
| `c` | cipó grosso (obstáculo: **facao**) | bloqueia até cortar |
| `p` | pedregulho (obstáculo: **forca**; empurra 1 tile) | bloqueia |
| `r` | rocha rachada (obstáculo: **quebra-pedra**; método `rocha`) | bloqueia até quebrar |
| `e` | paredão com trepadeira (obstáculo: **escalar**; atravessa na vertical) | especial |
| `v` `<` `>` | saliência de mão única (pula para baixo / esquerda / direita) | só no sentido |
| `g` | gelo escorregadio (desliza até bater) | livre |
| `l` | lama/piso que atrasa | livre |
| `x` | perigo do tileset (piso tóxico, espinho, lava): dá dano ou bloqueia conforme o ginásio | livre* |
| `C` | canteiro de frutos | bloqueia (interage) |
| `o` | buraco/poço (cai para o andar de baixo se houver warp `buraco`) | livre |
| `+` | piso interno alternativo / tapete de entrada (warps de porta ficam sobre ele) | livre |
| `M` | móvel/balcão genérico de interior (use `objetos` para móveis específicos) | bloqueia |
| ` ` (espaço) | vazio fora do mapa (preto) | bloqueia |

Zonas `escuro: true` exigem **lampiao** para enxergar (sem ele, só um círculo pequeno). `nevoa: true` idem para a névoa.
Obstáculos cortados/quebrados/empurrados voltam ao trocar de zona (como no gênero), exceto os marcados por evento.

## Objetos grandes (`objetos: [{ o, x, y, … }]`)
Prédios, móveis e props com mais de 1 tile vêm do **catálogo** `src/data/catalogo-objetos.ts` (gerado pelo time de cenário): cada entrada tem `w`, `h` (tiles ocupados no chão), `alto` (linhas extras acima, desenhadas por cima do jogador), `colisao` (máscara) e `porta` (deslocamento do tile da porta, se houver). (x, y) = canto inferior esquerdo do rodapé. A porta de um prédio precisa de um `warp` no tile da porta.
Nomes do catálogo (mínimo): `casa-a..f`, `casa-palafita`, `casa-colonial-a..c`, `posto`, `venda`, `ginasio`, `laboratorio`, `estacao`, `cais`, `saveiro`, `trem`, `farol`, `igreja`, `coreto`, `mercado`, `oficina`, `observatorio`, `forja`, `usina-fachada`, `mina-entrada`, `caverna-entrada`, `placa`, `poste`, `banco`, `fonte`, `barco`, `jangada`, `canoa`, `fogueira`, `cupinzeiro`, `ipe-amarelo`, `ipe-roxo`, `coqueiro`, `araucaria`, `buriti`, `cacto`, `bromelia`, `tronco-caido`, `pedra-grande`, `estatua`, `ninho`, `totem`, e de interior: `cama`, `mesa`, `cadeira`, `estante`, `pc`, `tv`, `fogao-lenha`, `rede`, `filtro-barro`, `oratorio`, `maquina-costura`, `planta`, `tapete-a..c`, `balcao`, `maquina-cura`, `prateleira`, `mesa-lab`, `mesa-cuias`, `radio`, `escada-sobe`, `escada-desce`.

## Tilesets (`src/data/tilesets/<nome>.ts` + `public/assets/tiles/<nome>.png`)
Exteriores: `costa` (vila litorânea, restinga, praia), `mata`, `serra`, `ferrugem`, `cerrado`, `pantanal`, `chapada` (inclui vulcão), `brejo`, `geada`, `planalto`, `pico`. Subsolo/água: `caverna`, `submerso`. Interiores: `casa`, `predio` (posto, venda, laboratório, estação), `ginasio` (16 temas por `tema: 1..16` na zona via `objetos`/paleta), `industrial` (usina, mina, laboratório do Cartel).
Cada tileset desenha TODOS os caracteres da legenda no seu estilo, com autotile de bordas (caminho/grama, margem de água, penhasco), tiles animados (água 4–8 q, grama alta, flores, cascata, lava) e **4 paletas de período** (manhã, dia, tarde, noite) + versões de janelas/postes acesos à noite.

## Bake (`tools/bake-maps.ts`)
Gera em `public/assets/zonas/<id>/`: chunks de 160×160 px (10×10 tiles) `chao-<periodo>-<cx>_<cy>.png` (chão + objetos baixos), `alto-<periodo>-…png` (copas, telhados, topo de objetos: desenhado sobre o jogador), tiras `anim-<periodo>-…png` (4 quadros lado a lado dos tiles animados) e `zona.json` (dimensões, lista de chunks, tiles de grama alta para o efeito de passagem).
Interiores e cavernas não mudam com o período (um só conjunto: `dia`).

## Warps, portões e progressão
- Toda ligação entre zonas é um `warp` (porta, escada, caverna, `borda` = sair pela borda do mapa, `trem`, `saveiro`). Warps são de mão dupla: declare o par nas duas zonas.
- `requer` em warps e `portoes` usa a sintaxe de condição (`insignia:3`, `flag:usina-ok`, `amuleto:remo`, `&`). Portões são NPCs/barreiras com fala e motivo na história — nunca parede invisível.
- O verificador faz busca em grafo tile a tile com os Amuletos/flags de cada passo da tabela 4.5: cada ginásio N alcançável após o N−1 e inalcançável antes. Marque em cada zona `passo` (1–17).
- Cidades: `pouso` (tile em frente ao Posto). Posto Guardião = zona interior `<cidade>-posto`; Venda `<cidade>-venda`; Ginásio `<cidade>-ginasio`.

## Habitats
`habitats` segue `Habitat` (tipos.ts): tabelas por período escritas à mão, 6–16 espécies por zona, níveis coerentes com o `passo`, `camadas` pós-insígnia com novas espécies. Os locais de cada criatura estão na tabela 6.4 do spec (G grama, A árvore, Q rocha, C caverna, S água, P pesca, M mergulho, E evento) e **devem ser respeitados**: toda criatura precisa aparecer onde a tabela diz.
