#!/bin/bash
pkill -f "integ/vite.mjs" 2>/dev/null; sleep 0.5
cd /home/user/adventures-of-pingo && (nohup npx vite --config /tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/integ/vite.mjs --port 5193 --strictPort > /tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/integ/vite.log 2>&1 &)
sleep 3
cd /tmp/claude-0/-home-user/58474daf-1a50-5b1b-8bec-0786b708dc45/scratchpad/integ && timeout ${2:-600} node $1
