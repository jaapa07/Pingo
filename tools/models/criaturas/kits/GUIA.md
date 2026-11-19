# GUIA — como criar uma criatura com os kits

Leia antes `docs/MODELOS.md` (contrato) e abra `001-tamandui.ts`, `004-guaraxim.ts`, `007-botinho.ts` e `010-pipirim.ts`:
são a régua de qualidade. Uma criatura básica cabe em 60–120 linhas; um estágio final, em 100–160.

## O que existe aqui

| Arquivo | O que dá |
|---|---|
| `criatura.ts` | `criatura({...})` → `PixModel` com as 3 vistas do contrato, `minMalhas` e enquadramento automático |
| `base.ts` | `novoRig`, `segmento`, `calota`, `perna`, `membro2`, `cauda`, `olhos`, `par`, atalho de materiais `m` |
| `partes.ts` | enfeites: `folha`, `folha3d`, `chama`, `chamaDupla`, `espuma`, `pena`, `tufo`, `listra`, `garra`, `bico`, `pinta` |
| `animacao.ts` | mini-linguagem de quadros (`qz/qr/qp/qs` sem loop, `lz/lr/lp/ls` com loop), `movBase`, `somar`, `montar` |
| `olhos.ts` | carimbos de olho de partida (`OLHOS.conta`, `oval`, `bravo`, `rapina`, `fechado4`…) |
| `checar.ts` | conferência sem render: malhas, cores, tamanho na célula, olho |
| `exemplos.ts` | um bicho-teste mínimo por kit (não entra em lote) |

| Anatomia | Kit + animações | Ossos (além de `base` → `corpo`) |
|---|---|---|
| Quadrúpede | `quadrupede` · `animsQuadrupede` | `pescoco`, `cabeca`, `orelha_d/e`, `cauda1..N`, `perna_fd/fe/td/te`, `canela_*` |
| Bípede | `bipede` · `animsBipede` | `pescoco`, `cabeca`, `orelha_d/e`, `braco_d/e`, `antebraco_d/e`, `perna_d/e`, `canela_d/e`, `cauda1..N` |
| Ave | `ave` · `animsAve` | `tronco`, `pescoco`, `cabeca`, `mandibula`, `asa_d/e`, `asa2_d/e`, `cauda1`, `perna_d/e`, `canela_d/e` |
| Peixe | `peixe` · `animsPeixe` | `tronco`, `mandibula`, `cauda1`, `cauda2`, `nad_d/e`, `dorsal`, `anal` |
| Serpente | `serpente` · `animsSerpente` | `pescoco1..N`, `cabeca`, `mandibula`, `cauda1..M` |
| Inseto (com/sem asas) | `inseto` · `animsInseto` | `cabeca`, `antena_d/e`, `abdomen`, `pata1..3_d/e`, `tarso1..3_d/e`, `asa_d/e`, `elitro_d/e` |
| Aracnídeo / crustáceo | `aracnideo` · `animsAracnideo` | `abdomen`, `pata1..4_d/e`, `tarso*`, `pinca_d/e`, `garra_d/e`, `dedo_d/e`, `cauda1..N`, `pedunculo_d/e` |
| Anfíbio | `anfibio` · `animsAnfibio` | `tronco`, `cabeca`, `mandibula`, `papo`, `perna_fd/fe`, `canela_f*`, `perna_td/te`, `canela_t*`, `pe_td/te` |
| Réptil | `lagarto` · `animsLagarto`; `tartaruga` · `animsTartaruga` | como o quadrúpede + `mandibula` |
| Arborícola | `arboricola` · `animsArboricola` | como o bípede + `tronco` |
| Aquático | `aquatico` · `animsAquatico` | `tronco`, `cabeca`, `mandibula`, `cauda1`, `cauda2`, `lobo_d/e`, `nad_d/e`, `dorsal` |

Todo kit devolve `{ rig, ref }`: `ref` são pontos úteis (`ref.topo`, `ref.dorso`, `ref.pontaFocinho`…) no espaço do osso
correspondente, para pendurar os traços únicos. Todos os olhos ficam nos ossos `olho_d`/`olho_e`.

## Exemplo comentado (uma básica completa)

```ts
/** 013 · COTIAZINHA (Comum) — cutia filhote. Traços: garupa arrebitada sem cauda · dentões · semente no colo. */
import { criatura, quadrupede, animsQuadrupede, blob, calota, par, m, lz, qz, OLHOS } from './kits';

// 1) PALETA: 2–4 rampas [sombra, base, luz] escritas à mão. Sombra puxa para o frio/roxo, luz para o quente.
const paleta = {
  rampas: [
    ['#7a4238', '#b9743f', '#e3a95c'], // 0 pelo castanho-alaranjado
    ['#c3a590', '#f4e3c7', '#fffaf0'], // 1 creme da barriga e do queixo
    ['#3a2638', '#5a3d4a', '#86606a'], // 2 patas, nariz e orelhas
    ['#4e7a2c', '#8fbf3d', '#d6ec7a'], // 3 a semente que ela carrega
  ] as [string, string, string][],
  contorno: '#2e1b2b', // escuro e colorido, nunca preto
  // extras do carimbo de olho: w brilho, p pupila, f = tom BASE do pelo em volta do olho (para o olho fechado)
  extras: { w: '#ffffff', p: '#2e1b2b', f: '#b9743f' },
};

// 2) BUILD: o kit monta esqueleto + corpo; você ajusta proporções e acrescenta os traços únicos.
function build() {
  const { rig, ref } = quadrupede({
    tronco: [0.26, 0.22, 0.2], peito: 0.9,            // peito < 1 = garupa mais cheia que o peito
    pernas: { alt: 0.2, r: 0.06, xF: 0.5, xT: -0.5 }, // alt = quadril até o chão
    pescoco: { len: 0.14, ang: 30, r: 0.12 },
    cabeca: [0.19, 0.17, 0.17],                       // cabeça grande = carisma
    focinho: { len: 0.1, r0: 0.09, r1: 0.06, nariz: 0.035 },
    orelha: { tipo: 'redonda', alt: 0.09, larg: 0.1 },
    olho: { r: 0.03, pos: [0.17, 0.04, 0.13] },       // marcador: meio enterrado na cabeça, ~2–4 px
    rampas: { pelo: 0, barriga: 1, canelaF: 2, canelaT: 2, pe: 2, nariz: 2, orelha: 2 },
  });
  // traço 1: garupa arrebitada mais clara (calota = mancha limpa por cima de um blob)
  rig.add('corpo', calota([0.2, 0.24, 0.21], m.luz(0), { de: 0, ate: 70, pos: [-0.12, 0, 0], rot: [0, 0, 40] }));
  // traço 2: dentões — peça chapada (m.plano) para não virar ruído de sombra
  rig.add('cabeca', blob([0.025, 0.04, 0.035], m.plano(1), { pos: [ref.pontaFocinho[0] - 0.02, ref.pontaFocinho[1] - 0.05, 0] }));
  // traço 3: semente num osso próprio, para poder animar
  rig.bone('semente', 'corpo', [0.3, -0.12, 0]);
  rig.add('semente', blob([0.07, 0.09, 0.07], m(3)));
  par((_, s) => rig.add('cabeca', blob([0.05, 0.04, 0.03], m(1), { pos: [0.12, -0.08, 0.13 * s] }))); // bochechas
  return rig;
}

// 3) ANIMAÇÕES: a biblioteca da anatomia dá os 17 nomes do contrato; você só soma o que é da criatura.
//    Um valor POR QUADRO: idle tem 4 (lz/lr/lp/ls), especial 6, físico 5, dano 3 (qz/qr/qp/qs).
const anims = animsQuadrupede({ u: 0.7, hPerna: 0.2, mole: 1.2 }, {
  idle: { semente: lz([0, 4, 8, 3]) },
  especial: { semente: qz([0, 10, 14, -30, -10, 0]) },
});

// 4) REGISTRO: criatura() cuida das células, câmeras, minMalhas e do enquadramento.
export const cotiazinha = criatura({
  num: 13, id: 'cotiazinha', nome: 'Cotiazinha', porte: 'P', estagio: 'basico', paleta, build, anims,
  olho: { frente: OLHOS.conta, fechado: OLHOS.fechado4, mapa: OLHOS.mapa }, // depois redesenhe à mão!
});
```
No lote: `import { cotiazinha } from './013-cotiazinha'` e acrescente ao array `modelos`.

## O helper `criatura`
- `porte`: `P` 64/64/24 · `M` 80/80/24 · `G` 96/80/24 · `L` 96/96/32 (frente/costas/mapa). `estagio`: `basico`/`medio` (25 malhas), `final` (40), `lendario` (60).
- `olho: { frente, fechado, costas?, costasFechado?, mapa? }`: carimbos olhando para a DIREITA (o pipeline espelha).
- **Enquadramento automático**: a pose de repouso ocupa ~80% da célula e nenhum quadro chega a menos de 2 px da borda. Se uma
  animação for larga demais, o sprite inteiro encolhe — o `checar.ts` avisa qual. Ajuste fino: `enquadre: { frente: { zoom: 0.95, dx: 2, dy: -1 } }`
  ou fixe `altura`/`pivot` à mão.
- **Mapa**: as animações de mapa aplicam proporções "de bolso" (corpo mais curto e largo, cabeça maior). Bicho comprido? passe
  `mapa: { comp: 0.6, larg: 1.5, frontal: 1.35 }` nas opções da biblioteca de animação.
- Parâmetros das animações: `u` = altura aproximada do bicho em unidades (escala os deslocamentos), `mole` = força do squash
  (pesado 0.6, molenga 1.4), `flutua` para quem paira. `extra` soma faixas por movimento (`entrada idle fisico especial dano desmaio status andar parado`);
  a chave `todas` entra em todos (ex.: chamas tremulando). Osso opcional começa com `?`.

## Ciclo de trabalho (obrigatório olhar!)
```
npx tsx tools/models/criaturas/kits/checar.ts <id>     # malhas, cores, % da célula, olho
npx tsx tools/render-sprites.ts <id>
ffmpeg -v error -y -i public/assets/sprites/criatura/<id>/frente.png -vf "scale=iw*5:ih*5:flags=neighbor" -update 1 /scratch/f.png
```
Abra `frente`, `costas` e `mapa`. Itere proporção → cor → traços → olho. Compare ao lado das criaturas 001–012.

## Receitas
- **Mancha limpa** (máscara, sela, boné, barriga): `calota` 4–8% maior que o blob de baixo, ou um `blob` achatado atravessando o corpo (faixas).
- **Cor exata sem sombra**: `m.plano(i)` (base), `m.luz(i)`, `m.sombra(i)`. Uma rampa pode ser um "trio de cores chapadas" (ex.: escuro/amarelo/marfim no Gaviãozão) se você só usar `plano/luz/sombra` nela.
- **Fogo**: `chamaDupla` com rampa clara e quente + `tremula([...ossos])` (ver `004-guaraxim.ts`). O fogo precisa contrastar com o pelo.
- **Espuma/bolhas**: `espuma` com `m.luz(rampa)` + `borbulha([...])` (ver `007-botinho.ts`).
- **Pose de repouso diferente**: depois do kit, gire o osso (`rig.bones.perna_fe.rotation.z = 70 * D2R`).
- **Evolução**: exporte a paleta do estágio básico e importe nos seguintes; repita 2–3 traços e aumente/adicione outros (cabeçalho de cada arquivo lista "mantém" e "cresce").

## Erros comuns
1. **Fino demais**: qualquer coisa com menos de ~1,5 px some ou pisca. Engrosse (pernas de ave, antenas, garras) ou use `plano`.
2. **Cor do traço igual à do corpo**: a chama laranja sobre pelo laranja sumiu no primeiro Guaraxim. Separe por valor (claro × escuro), não só por matiz.
3. **Marcador de olho errado**: escondido atrás de máscara/sobrancelha (o olho some), grande demais (sobra branco em volta do carimbo) ou no fundo da cabeça. Ideal 2–4 px, meio enterrado; `checar.ts` mostra o tamanho.
4. **Olho fechado com buraco branco**: o carimbo fechado precisa cobrir o marcador com `f` (cor base do pelo naquela região).
5. **Animação larga**: cauda/asa girando 60° estoura a silhueta e o sprite encolhe. Prefira mudar a pose a deslocar o bicho (o jogo já desloca o sprite no ataque).
6. **Silhueta "batata"**: tudo dentro do contorno do corpo. Ponha os traços para FORA (crista, cauda, orelhas, folhas) e confira a vista de costas.
7. **Detalhe demais no estágio final**: 6 chamas grandes viram uma mancha amarela. Poucas formas grandes > muitas pequenas.
8. **Osso inexistente na animação**: dá erro no render; use `?osso` para os opcionais. Lista de valores com tamanho diferente do nº de quadros não quebra, mas vira interpolação — evite.
9. **Rampa fora da paleta** (`tom(4)` com 4 rampas) ou mais de 4 rampas/12 cores: o helper e o render recusam.
10. Proibido `Math.random` e as palavras vetadas do contrato (inclusive em comentários). Nada que lembre criaturas de franquias.

## Checklist visual (antes de registrar no lote)
- [ ] Dá para dizer qual é o animal brasileiro só pela silhueta preta? E distinguir do estágio anterior/seguinte?
- [ ] 3+ traços únicos visíveis na FRENTE e pelo menos 2 nas COSTAS.
- [ ] Olho legível e com brilho; olhar combina com o temperamento (manso, sereno, bravo).
- [ ] 3 tons por rampa aparecem (luz de cima-esquerda), sem manchas soltas nem pixels órfãos.
- [ ] Repouso ≥ 68% da célula nas duas vistas de batalha (`checar.ts` sem avisos) e nada cortado em nenhum quadro.
- [ ] `idle` respira; ataque tem antecipação; `desmaio` e `status` com olho fechado; `mapa` legível nas 4 direções.
- [ ] Malhas ≥ mínimo; `npx tsc --noEmit -p .` limpo no seu arquivo.
