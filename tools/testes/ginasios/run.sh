#!/bin/bash
# reinicia o Vite do time de ginásios (sem vigiar arquivos: outros agentes editam o projeto) e roda um roteiro
G=/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/gin18
pkill -f "vite.gin.mjs" 2>/dev/null; sleep 0.5
cd /home/user/adventures-of-pingo && (nohup npx vite --config $G/vite.gin.mjs --strictPort > $G/vite.log 2>&1 &)
sleep 3
cd $G && timeout ${2:-900} node $1
