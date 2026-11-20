# ARTE-FINAL.md — diário da arte final das criaturas

Tarefa: auditar as 182 criaturas (180 + 2 visitantes) e retocar as ~30 mais fracas. Arquivos meus: `tools/models/criaturas/<nnn>-*.ts` que eu retocar + PNG/meta gerados. Não mexo em kits/, tools/render/, src/**.

## Marco 1 — auditoria (20/11)
- Folhas: `docs/capturas/todas-frente.png` (frente, idle q0, 3×, célula desenhada) e `docs/capturas/todas-mapa.png` (mapa idle-s, 4×).
- Cópia de segurança dos sprites de antes: scratchpad da sessão (`antes/criatura`).
- `checar.ts` em todas: 37 avisos (repouso < 68% em ~28; olho grande demais em noitim 6,1 px, noitao 6,3 px, urutau-fantasma 4,5 px).

### Lista priorizada (mais fracas primeiro)
1. 035 caranguejim / 036 guaiamuque — massa baixa e confusa; patas roxas viram franja; não lê caranguejo.
2. 171 noitim / 172 noitao — bolota cinza, olho grande demais, não lê macaco-da-noite.
3. 169 urutauzim / 170 urutau-fantasma — toco marrom chapado, asas como manchas.
4. 167 andorim / 168 andorinhão — preto chapado, asas tortas, pedestal confuso.
5. 129 sirizim / 130 siri-couraça — baixo e chato; casco verde/azul sem leitura de siri.
6. 145 escorpim / 146 escorpião-rei — fino (escorpim) e caótico (rei).
7. 149 jataí / 150 jataí-rainha — bolota com manchas; rainha sem leitura.
8. 153 cigarrim / 154 cigarrão — cigarra achatada; cigarrão com asas soltas.
9. 155 lavadeirim / 156 lavadeira-dragão — pequena na célula / confusa.
10. 101 ema-mirim / 102 emaçu — filhote minúsculo e fino.
11. 105 tuiuiuzim — minúsculo, fino.
12. 109 harpinha / 110 harpia — bolota branca sem rapina / penacho embolado.
13. 141 grilinho / 142 grilão-elétrico — chato, marrom.
14. 143 besourim — chato e escuro.
15. 165 mocozim — cinza chapado.
16. 119 hipocampim / 120 hipocampo.
17. 182 borealce — pequeno na célula.
18. 181 galo-manaó — divisão das cores (rio Negro × Solimões) não lê.
19. 028 vagalumim / 029 vagalampo — pequeno, peças soltas.
20. 077 manatim — pequeno, sem leitura de peixe-boi.
21. 055 urubuzim — branco demais para urubu.
22. 061 preguicim — pálido, sem contraste.
23. 027 pintinhas — pequena, confusa.
24. 147 caranguejeirinha / 148 caranguejeirão.
25. 079 tartaruí — chata.
26. 018 formigaço — pequeno na célula (58%).
27. 115 poraquim — pequeno.
28. 093 graxaim — pequeno, escuro.
29. 015 lagartim — pequeno.
30. 107 garcinha — pequena.

## Marco 2 — retoques em andamento (20/11)
Ferramentas no scratchpad: folha de contato (`folha.py`), antes/depois por id (`ver.py`), checagem de borda (`borda.py`).
- 035 caranguejim: câmera de batalha quase de frente (yaw −34 por animação, permitido no contrato), pinças roxas erguidas
  dos lados em "punho" (antes laranja sobre laranja), pedúnculos mais altos, desmaio que não abre as pinças → ocupa 75% da célula (era 64%).
- 036 guaiamuque: mesma câmera; garra gigante de PEDRA (cinza, contrasta com o azul) do lado de lá, rosto e olhos à mostra.
- 171 noitim / 172 noitão: cabeça virada para a câmera na batalha (`cabecaRetaNoMapa` desfaz no mapa), os dois olhões
  aparecem; barriga laranja grande no peito; sobrancelhas brancas.
- 169 urutauzim / 170 urutau-fantasma: cabeça para a câmera (dois olhos de pires), riscas de casca e líquen, plumagem mais clara que o toco.
- 167 andorim (e a paleta do 168): asas-foice varridas para trás (antes pareciam orelhas), fuligem mais clara com volume, sobrancelha e queixo brancos.
