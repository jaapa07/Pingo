#!/bin/bash
# reinicia o Vite do time A2 e roda um roteiro: tools/testes/a2/run.sh <roteiro.mjs> [segundos]
G=/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/a2
D=/home/user/adventures-of-pingo/tools/testes/a2
mkdir -p $G
pkill -f "vite.a2.mjs" 2>/dev/null; sleep 0.5
cd /home/user/adventures-of-pingo && (nohup npx vite --config $D/vite.a2.mjs --port 5192 --strictPort > $G/vite.log 2>&1 &)
sleep 3
cd $D && timeout ${2:-900} node $1
