# DECISOES-FINAIS.md — diário do agente das decisões do autor antes de abrir o mapa B

Origem: relatórios docs/QA-MAPA-B-2.md, docs/QA-POSLIGA.md, docs/EQUILIBRIO-MAPA-B.md, docs/REGRAS-10A.md,
docs/GINCANA-SAFARI.md. `MAPA_B_ABERTO` continua `false` (o coordenador abre depois).
Testes de navegador: `tools/testes/decisoes/` (Vite próprio na porta 5211, sem HMR/vigia, mapa B ligado SÓ em memória
por plugin — mesmo método do docs/ZONAS-B1.md; `run.sh <roteiro> <seg> [args]`, `run.sh parar` desliga pelo PID).

## Marcos
- (20/11) Leitura dos relatórios; ferramentas: `tools/testes/decisoes/lib.mjs` (cópia da qa4-lib na porta 5211), `vite.mjs`, `run.sh`.

### 1. Líder 15 (Astrônoma Jaci)
- Antes: cinco membros 68 + ás 70. Medido com o checkpoint REAL do QA na frente da líder (`tools/testes/qa4/saves/b8.json`:
  Tatucanastra 64, Cotiadã 61, Pintinhas 61, Vampirinha 61, Iaraboto 65, Gaviãozão 65; mochila sem remédio de vida;
  $8 721) com `npx tsx tools/testes/qa4/qa4-sim-save.mts b8 lider-15 <n>`:
  | Membros (ás 70) | b8 como está | b8 + 1 nível | b8 + 4 Garrafadas Fortes + 1 Chá (o que $8,7 k compra) |
  |---|---|---|---|
  | 68 ×5 (antes) | **3%** | 4% | — |
  | 67 ×5 | 6% | 10% | — |
  | 66 ×5 | 9% | 15% | 21% |
  | 65 ×5 | 12% | 21% | 28% |
  | 65/65/64/64/64 | 18% | 29% | 43% |
  | **64 ×5 (aplicado)** | **25–26%** | 41% | 50% |
  | 63 ×5 | 42% | — | — |
  Baixar só um membro (62, resto 66) dá 11–17%: o muro é a equipe inteira, não um membro. Baixar o ás (todos 68, ás 68)
  não ajuda (3%). O exemplo "66–67" só levaria a 6–9%; para chegar à faixa pedida (25–40% com a equipe que chega abaixo)
  foi preciso 64. Fica abaixo de 55% mesmo com a mochila que o dinheiro do jogador compra (50%).
- `tools/sim-mapa-b.ts --so lider-15` (equipes de referência no Δ 2/3/4/5): antes ref 79/70/68 · qa 68/63/49; depois
  ref 97/94/87/84 · qa 94/92/86/77 (essas equipes chegam com a reserva 1–2 abaixo do ás; a do QA real chega 4–5 abaixo).
- Escada intacta: ás 70 (14 = 68, 16 = 72), seis criaturas.
