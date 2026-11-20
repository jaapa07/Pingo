#!/bin/bash
# (re)inicia o Vite do QA do pós-Liga (porta 5208). Mata só o processo que ESTE script iniciou (PID guardado).
G=/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/posliga
if [ -f $G/vite.pid ]; then P=$(cat $G/vite.pid); kill -- -$P 2>/dev/null || kill $P 2>/dev/null; sleep 1; fi
[ "$1" = "parar" ] && exit 0
cd /home/user/adventures-of-pingo
setsid npx vite --config tools/testes/posliga/vite.mjs --port 5208 --strictPort > $G/vite.log 2>&1 < /dev/null &
echo $! > $G/vite.pid
for i in $(seq 1 30); do curl -s -o /dev/null http://localhost:5208/ && break; sleep 1; done
echo "vite 5208 pid $(cat $G/vite.pid)"
