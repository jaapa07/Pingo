#!/bin/bash
# reinicia o Vite do QA 2 (sem vigia de arquivos: tem de reiniciar depois de editar o jogo) e roda um roteiro:
#   tools/testes/qa2/run.sh <roteiro.mjs> [segundos] [args...]      (VITE=manter não reinicia o servidor)
G=/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qa2
D=/home/user/adventures-of-pingo/tools/testes/qa2
mkdir -p $G
if [ "$VITE" != "manter" ] || ! curl -s -o /dev/null http://localhost:5195/; then
  pkill -f "vite.qa2.mjs" 2>/dev/null; sleep 0.5
  cd /home/user/adventures-of-pingo && (setsid nohup npx vite --config $D/vite.qa2.mjs --port 5195 --strictPort > $G/vite.log 2>&1 &)
  for i in $(seq 1 20); do curl -s -o /dev/null http://localhost:5195/ && break; sleep 1; done
fi
R=$1; T=${2:-900}; shift; shift
cd $D && timeout $T node $R "$@"
