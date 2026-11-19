# BATALHA.md — motor de batalha (contrato)

Spec: seções 6.1 (tipos), 7 (batalha), 8 (itens). Jogabilidade clássica 1×1 por turnos (2×2 em duplas), 4 golpes com PG.

## Arquitetura
- `src/battle/engine.ts`: **máquina de estados determinística e pura** (sem DOM, roda em Node). Recebe os dois lados (`CriaturaInst[]`, itens, IA, clima, tipo de batalha) e as escolhas do jogador; produz uma **fila de eventos** (`EventoBatalha[]`) que a view reproduz: mensagem, animação de golpe, dano (com vida antes/depois), status, troca, desmaio, experiência, subida de nível, novo golpe, evolução pendente, captura (com nº de balanços), fuga, fim.
- `src/battle/view.ts` (+ `src/battle/anims/`): apresentação no layout clássico (seção 11 e 3A do spec) e animações dos golpes. Não decide nada.
- Todo acaso usa `rng` de `src/core/rng.ts`.
- `tools/test-batalha.ts` (`npm test`): ≥ 50 batalhas simuladas IA×IA sem exceção, captura conforme a fórmula (estatística em 10 mil tentativas), evoluções nos níveis certos, tabela de tipos 17×17 completa, todo golpe com animação registrada.

## Fórmulas (obrigatórias)
- Atributos: `Vida = floor((2·base + gen·2 + floor(esf/4))·Nv/100) + Nv + 10`; demais `= floor((floor((2·base + gen·2 + floor(esf/4))·Nv/100) + 5)·personalidade)`.
- Dano: `floor(floor(floor(2·Nv/5 + 2)·Poder·A/D)/50) + 2`, × crítico (2; chance 1/16) × mesmo-tipo 1,5 × eficácia × variação 0,85–1,00 × queimado (0,5 em físico) × clima.
- Ordem: prioridade → Velocidade (paralisado ÷4) → empate no `rng`.
- Captura: `a = (3·VidaMáx − 2·Vida)·taxa·bônusCuia·bônusStatus / (3·VidaMáx)`; `a ≥ 255` captura; senão 3 balanços com probabilidade `b = 65536/(255/a)^(3/16)… ` (use o método clássico de 4 testes) — o importante: chance total ≈ `a/255`. bônusStatus: dormindo/congelado 2, outros 1,5.
- Experiência: `floor(expBase·Nv/7)` (×1,5 treinador), dividida entre participantes; curvas `rapido` (0,8·n³), `medio` (n³), `lento` (1,25·n³). Esforço: ganho da espécie derrotada, máx. 252 por atributo e 510 total.
- Estágios de atributo −6…+6; precisão/evasão; confusão, preso, atordoado; 6 status principais (o **encantado**: 50% de chance de, no lugar do seu golpe, imitar o último golpe usado pelo adversário; cura em 2–4 turnos).
- Climas: sol (Brasa ×1,5, Rio ×0,5), chuva (Rio ×1,5, Brasa ×0,5), garoa gelada (dano leve a não-Geada), névoa (precisão ×0,8, exceto Assombro/Mente), poeira (dano leve a não-Terra/Pedra/Ferro).
- Dificuldade (`jogo.opcoes.dificuldade`): muda a QUALIDADE da IA e os recursos (explorador: IA um nível abaixo, +1 item de cura ao jogador por posto; veterano: IA um nível acima, treinadores usam itens, sem trocar depois de nocaute "de graça"). Nunca altera vida/dano. DECISÃO DO AUTOR: **Aventureiro é o modo recomendado e o padrão** — luta equilibrada, em que é possível ganhar e perder, exige estratégia; rival, líderes e Conselho têm nível adequado à curva (seção 4.5) e usam itens de cura (quem tem `itens` definidos os usa em Aventureiro e Veterano, mas no Aventureiro só do 8º ginásio em diante: 7+ insígnias), como nos jogos clássicos. O esforço ganho no meio da batalha que aumenta a vida máxima leva a vida atual junto.

## Dados (dono: time de batalha)
- `src/data/tabela-tipos.ts`: matriz completa do spec 6.1.
- `src/data/golpes.ts`: **≥ 220 golpes autorais** (≥ 10 por tipo), com `GolpeDef` = `GolpeDefBase` + `efeitos` (dano, status com chance, estágios, cura, dreno, recuo, múltiplos acertos, prioridade, clima, proteção, carga de 2 turnos, alto crítico, golpe fixo, troca forçada, armadilha etc.). Nomes em português com sabor brasileiro (Rasteira, Ferroada, Enxurrada, Brasa Viva, Canto do Uirapuru…). `anim` aponta para uma animação existente.
- `src/data/itens.ts`: todos os itens do spec (8 cuias, remédios, pedras de evolução, 50 Pergaminhos `pt-01`…`pt-50`, frutos, itens-chave, varas, Amuletos como itens-chave, repelente, bicicleta `bike-bambu`).
- `src/data/personalidades.ts`: 10 personalidades.
- `src/data/criaturas.ts` (dono: time de dados de criaturas): `ESPECIES: EspecieDef[]` das 180, conforme a tabela 6.4.

## IA (4 níveis, nunca trapaceia nem lê a escolha do jogador)
`novato`: golpe válido ao acaso (70%) ou o mais forte (30%). `treinador`: prefere o golpe forte e super-eficaz (poder × eficácia × mesmo-tipo, sem conta de atributos), distrai-se uma vez em quatro, troca em desvantagem grave. `lider`: pensa o 1×1 como uma corrida (quem derruba quem primeiro) e valoriza status, reforços, cura e troca pelo que mudam nessa corrida; usa itens de cura quando a regra abaixo permite. `conselho`: a mesma conta sem deslizes, com estimativa mais fina do adversário, nocaute mais seguro (prioridade quando é mais lento), varridas preparadas e o ás guardado para o fim. Nenhum nível troca a criatura que acabou de entrar antes de ela agir um turno (quem abre é sempre a 1ª da lista do treinador). Números da escada e das metas de equilíbrio: `docs/EQUILIBRIO.md` (`npx tsx tools/sim-equilibrio.ts`).

Itens de cura (`iaUsaItens`, spec 7A): Veterano — todos, sempre; Aventureiro — só quem tem `itens` definidos e só com 7+ insígnias (do 8º ginásio em diante); Explorador — idem, mas só a IA de nível conselho.

Golpes dos treinadores: `MembroEquipe.golpes` (escolhidos à mão) valem no jogo — o mundo cria as equipes com `criarDeMembro`. Sem `golpes`, a criatura usa `golpesIniciais` (os 4 mais recentes, garantindo dois de dano e um do próprio tipo quando ela já os aprendeu).

## Interface com o resto
```ts
// src/battle/index.ts
export interface PedidoBatalha { tipo: 'selvagem' | 'treinador' | 'lendario'; inimigos: CriaturaInst[]; treinador?: TreinadorDef; arena: string; clima?: ClimaId; dupla?: boolean; semFuga?: boolean; semCaptura?: boolean; tutorial?: boolean; musica?: string }
export interface ResultadoBatalha { resultado: 'vitoria' | 'derrota' | 'fuga' | 'captura'; capturada?: CriaturaInst }
export function iniciarBatalha(p: PedidoBatalha): Promise<ResultadoBatalha>; // empilha a tela 'batalha', resolve ao terminar (já aplicou exp, evoluções, dinheiro, Diário)
export function criarCriatura(especie: number, nivel: number, o?: Partial<CriaturaInst>): CriaturaInst; // gera genes, personalidade, sexo, golpes do nível
export function atributos(c: CriaturaInst): Record<Stat, number>;
export function curarEquipe(): void;
```
