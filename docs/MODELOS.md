# MODELOS.md — modelos 3D → pixel art (contrato)

Leia antes: `GAME_SPEC_PINGO.md` seções 3 e 3A, e olhe `docs/referencias/qualidade-batalha.jpg` (régua de qualidade, nunca copiar).

## Pipeline (só no build; o jogo nunca usa canvas/WebGL)
1. Modelo esculpido em código com `tools/render/sculpt.ts` (`blob`, `limb`, `lathe`, `tube`, `slab`, `roundBox`, `ring`, `spike`, deformadores `taper/bulge/pull/bend/wobble/flattenBelow`, `Rig` com `bone/add/anchor`, `olho(lado, raio, pos)`).
2. **Materiais = rampas de paleta**: `tom(i)` aponta para `paleta.rampas[i] = [sombra, base, luz]` (hex escritos à mão). `tom(i, { plano: true })` usa sempre o tom base; `vies: +1/−1` puxa para luz/sombra. Não existem cores no modelo fora da paleta.
3. `tools/render/client.ts` renderiza em 8× e **pixeliza**: moda por bloco, tom por limiar de luz, remove pixels órfãos, contorno externo de 1 px (`paleta.contorno`), **carimba os olhos** desenhados à mão (`vista.olho`, linhas de caracteres: `k` contorno, `w` branco, `p` pupila, letras de `paleta.extras`; desenhe o olho olhando para a DIREITA da tela) e aplica `retoques` (pixels à mão por quadro).
4. Saída: `public/assets/sprites/<categoria>/<id>/<vista>.png` (PNG sem perdas, resolução nativa) + `meta.json`; `public/assets/atlas.json` é a união.

Render: `npx tsx tools/render-sprites.ts <id> [<id>…]` (aceita `prefixo*`, `--cat=criatura`, `--vista=frente`). Para **olhar** o resultado amplie sem suavizar:
`ffmpeg -v error -y -i public/assets/sprites/criatura/<id>/frente.png -vf "scale=iw*6:ih*6:flags=neighbor" -update 1 /caminho/scratch/x.png` e abra a imagem. **Olhe sempre** antes de seguir. Exemplo funcionando: `tools/models/teste/tamandui.ts`.

## Convenções
- Modelo olha para **+X**, +Y para cima; origem = ponto de apoio (pés). Lado D = +Z.
- Câmera por vista: `yaw` = azimute de +X para +Z (graus), `pitch` = elevação. `sin(yaw) ≥ 0` → o sprite olha para a direita da tela.
- Animações: keyframes à mão (`tools/render/anim.ts`), **poucos quadros bem escolhidos** (fps 5–10). `olho: 'fechado'` troca o carimbo. Cada animação pode ter `yaw/pitch` próprios.
- Proibido `Math.random`; proibidas as palavras TODO/FIXME/placeholder/lorem (o verificador reprova, inclusive em comentários).
- Paleta por criatura: **2 a 4 rampas** (6–12 cores) + contorno + extras de olho. Sombras puxam para o frio/roxo, luzes para o quente (hue shift), como na referência. Contorno escuro colorido, nunca preto puro.

## Criaturas (`tools/models/criaturas/<nnn>-<id>.ts`, id = slug do nome sem acento)
Use os helpers de `tools/models/criaturas/kits/` (anatomias + `criatura({...})` que monta as vistas padrão):

| Vista | Célula (porte P / M / G / L) | Câmera | Animações obrigatórias (nomes exatos) |
|---|---|---|---|
| `frente` | 64 / 80 / 96 / 96 | yaw −50, pitch 12 | `entrada` (4–6 q, sem loop), `idle` (4–6, loop, respiração), `ataque-fisico` (4–6), `ataque-especial` (4–6), `dano` (2–3), `desmaio` (4–5, olho fechado), `status` (2–4, loop, olho fechado) |
| `costas` | 64 / 80 / 80 / 96 | yaw 140, pitch 22 | `idle`, `ataque-fisico`, `ataque-especial`, `dano`, `desmaio` |
| `mapa` | 24×24 (L: 32×32) | pitch 40; `yaw` por animação | `andar-s` (yaw 0), `andar-l` (90), `andar-n` (180), `andar-o` (−90) — 4 q cada; `idle-s` (2 q) |

- O sprite deve **encher a célula** (básicas ~44–56 px de altura na célula 64; estágios finais ~70–90 na 96), com 2 px de folga nas bordas para o contorno.
- Malhas mínimas: 25 (básica), 40 (estágio final), 60 (lendário). Silhueta distinta e ≥ 3 traços únicos por criatura; evoluções mantêm cores/traços e crescem em detalhe.
- Identidade: fauna brasileira estilizada conforme a tabela 6.4 do spec (coluna "Inspiração"). Nada que lembre criaturas de franquias.
- Registro: cada lote exporta `export const modelos: PixModel[]` em `tools/models/criaturas/lote-<a>-<b>.ts`; `tools/models/index.ts` reúne os lotes.

## Pessoas (`tools/models/pessoas/`)
| Vista | Célula | Animações |
|---|---|---|
| `mapa` | 24×32 (personagem ~16×24) | `andar-s/l/n/o` (4 q), `idle-s/l/n/o` (1–2 q). Jogador: + `correr-*`, `bike-*`, `remar-*`, `escalar-n`, `mergulhar-*`, `arremessar` |
| `batalha` | 64×64, yaw −50 | `idle` (2 q), `derrota` (2 q) — treinadores e líderes |
| `costas` (só jogador) | 64×64, yaw 140 | `idle`, `arremessar` (5 q) |
| `retrato` | 48×48, busto, yaw −65 | `neutro`, `feliz`, `bravo` (1 q cada) — personagens com fala importante |

Ids: `kaue`, `ayra`, `mae`, `prof-ipe`, `taina` (rival), `seu-aroeira`, `dra-buriti`, `coronel-garrote`, `tenente-lata`, `tenente-arame`, `tenente-rebite`, `capanga-m`, `capanga-f`, 16 líderes (`lider-01`…`lider-16`), Liga dos Guardiões (`liga-mare`, `liga-brasa-viva`, `liga-neblina`, `liga-pampa`, `liga-arace` — `tools/models/pessoas/liga.ts`, com mapa, batalha e retrato), Conselho (`guardia-iara`, `guardiao-caua`, `guardia-jandaia`, `guardiao-moacir`, `guardiao-arandu`), pessoas próprias do Sertão e dos visitantes (`guardiao-tibirica`, `andarilho-cume`, `guarda-nevoa`, `guardia-floresta`, `dra-solveig`, `pesquisador-boreal` — os quatro da expedição —, `seu-taruma` — `tools/models/pessoas/sertao.ts`, com mapa, batalha e retrato), classes de treinador (`cl-pescador`, `cl-escoteira`, `cl-capoeirista`, `cl-vaqueiro`, `cl-rendeira`, `cl-surfista`, `cl-mateira`, `cl-garimpeiro`, `cl-observadora`, `cl-biologa`, `cl-repentista`, `cl-mergulhador`, `cl-ferreiro`, `cl-montanhista`, `cl-crianca-m`, `cl-crianca-f`), NPCs genéricos (`npc-homem-1..4`, `npc-mulher-1..4`, `npc-idoso`, `npc-idosa`, `npc-atendente-posto`, `npc-vendedor`, `npc-marinheiro`, `npc-maquinista`).

## Objetos, FX e cenário
- Objetos de mapa/itens/cuias: categoria `objeto`. FX de golpes: categoria `fx` (ids `fx-<tipo>-<n>`), células 32–64 px, 4–8 quadros.
- Tiles 16×16 podem ser **desenhados à mão** como grades de caracteres (ver `docs/ZONAS.md`) — preferível para chão, água, bordas; objetos volumosos (árvores, casas, pedras) podem vir do 3D pixelizado.
