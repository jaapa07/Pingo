# GINASIOS-9-16.md — diário dos ginásios do mapa B e da Aldeia Tupã

Diário compartilhado por dois agentes: o lote 9–12 (B2/B3/B4/B5-ginasio) e o lote 13–16 (B6/B7/B8/A9-ginasio).
Cada lote escreve só na sua seção.

## 9–12

Numeração nova (docs/HISTORIA.md): ás dos líderes 9–12 = 49, 51, 53, 55; turma do ginásio = ás − 2 a − 6; líder com IA `lider` e remédios.
Sprites, temas e arenas seguem a numeração ANTIGA das artes: Zefa = `lider-05` / tema `g05` / arena `ginasio-05`; Topázio = `lider-09` / `g09`; Labareda = `lider-10` / `g10`; Gingado = `lider-11` / `g11`.
Arquivos meus: `src/data/zonas/{B2,B3,B4,B5}-ginasio.ts`, `src/world/mecanicas/ginasio-09..12.ts`, `src/data/treinadores/ginasio-09..12.ts`, `src/data/eventos/ginasio-09..12.ts`.

### Marcos
- (20/11) Pedra renumerada para o ginásio 10: os antigos `ginasio-09.*` (Pedra, ás 43) viraram `treinadores/ginasio-10.ts`, `eventos/ginasio-10.ts`, `mecanicas/ginasio-10.ts`; `B3-ginasio` com passo 10, ids `g10-*`, `lider-10`, flag `ginasio-10-vencido`, insígnia 10, Escalar. Equipe nova do Topázio com ás 51.

## 13–16

### Marco 0 (início)
- Arquivos meus: `src/data/zonas/{B6,B7,B8,A9}-ginasio.ts`, `src/world/mecanicas/ginasio-13..16.ts`, `src/data/treinadores/ginasio-13..16.ts`, `src/data/eventos/ginasio-13..16.ts`.
- Saídas: B6 (33, 12) (porta em (33, 11) em B6.ts) · A9 (25, 12) (PORTAS-GINASIO.md) · B7 e B8 ainda sem cidade: saída provisória pela convenção; reler PORTAS-GINASIO.md antes de terminar.
- Baseline do `npm run check -- --rapido`: 1 erro alheio (líder 1, Garcinha nv 6).
