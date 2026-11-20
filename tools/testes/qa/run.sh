#!/bin/bash
# uso: tools/testes/qa/run.sh <roteiro.mjs> [args…]   (sobe o Vite do QA na 5194 se ainda não estiver no ar)
D=/home/user/adventures-of-pingo/tools/testes/qa
L=/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qa1
mkdir -p $L
# RESTART=1 derruba o Vite antes (sem watcher, ele não vê arquivo de src/ alterado)
if [ -n "$RESTART" ]; then for p in $(pgrep -f "$D/vite.qa.mjs"); do kill $p; done; sleep 0.7; fi
if ! curl -s -o /dev/null http://localhost:5194/; then
  cd /home/user/adventures-of-pingo && (nohup npx vite --config $D/vite.qa.mjs --port 5194 --strictPort > $L/vite.log 2>&1 &)
  for i in 1 2 3 4 5 6 7 8 9 10; do sleep 1; curl -s -o /dev/null http://localhost:5194/ && break; done
fi
cd $D && node "$@"
