# CAPTURA-CRIACAO.md — diário dos sistemas de captura e criação (spec 6.2, 6.3, 7, 8, 10-9, 10A-4/5/6/9/11/12/13)

Arquivos deste time: `src/battle/cuias.ts` (regras puras: rara, cuias artesanais, obediência, item segurado selvagem),
`src/data/ninhos.ts`, `src/data/trocas.ts`, `src/world/ninhos.ts`, `src/world/enxames.ts`, `src/data/eventos/captura.ts`,
`tools/build-raras.ts` (+ `public/assets/sprites/criatura/*/*-rara.png` e `public/assets/raras.json`).

## Marcos
- (início) leitura do spec, docs e código; plano abaixo.

## Plano
1. Pelagem Rara: 1/4096 por encontro selvagem (`rng`), `CriaturaInst.rara`; sprites `*-rara.png` gerados no build por troca de paleta; brilho na entrada; marca no Resumo e no Diário; rara garantida no Lago (evento do Cartel, spec 10A-5).
2. Cuias artesanais: cuieiras (objeto `cuieira` nas zonas), artesão, 7 cuias novas na fórmula.
3. Ovos e ninhos no Viveiro do Seu Aroeira (pós-insígnia 6).
4. Enxames do dia: `enxameDeHoje()` em `src/world/enxames.ts`.
5. Trocas com 6 moradores + obediência (20/30/50/70/todas).
