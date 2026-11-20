#!/bin/bash
# Vite do QA das missões do mapa B (porta 5207, sem vigia: reinicie depois de editar o jogo) e roda um roteiro:
#   tools/testes/qa-missoes-b/run.sh <roteiro.mjs> [segundos] [args...]      (VITE=manter reaproveita o servidor)
#   tools/testes/qa-missoes-b/run.sh parar                                   (desliga o Vite que ESTE script ligou)
G=/tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/qamb
D=/home/user/adventures-of-pingo/tools/testes/qa-missoes-b
mkdir -p $G
parar() { if [ -f $G/vite.pid ]; then kill -- -$(cat $G/vite.pid) 2>/dev/null; kill $(cat $G/vite.pid) 2>/dev/null; rm -f $G/vite.pid; sleep 0.5; fi; }
if [ "$1" = "parar" ]; then parar; exit 0; fi
if [ "$VITE" != "manter" ] || ! curl -s -o /dev/null http://127.0.0.1:5207/; then
  parar
  cd /home/user/adventures-of-pingo && { setsid nohup sh -c "echo \$\$ > $G/vite.pid; exec node node_modules/.bin/vite --config $D/vite.mjs --port 5207 --strictPort"; } > $G/vite.log 2>&1 < /dev/null &
  for i in $(seq 1 30); do curl -s -o /dev/null http://127.0.0.1:5207/ && break; sleep 1; done
fi
R=$1; T=${2:-900}; shift; shift
cd $D && timeout $T node $R "$@"
