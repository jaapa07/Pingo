#!/bin/bash
# roda um roteiro do QA do pós-Liga com o Vite já de pé na porta 5208 (inicie com: vite.sh)
D=/home/user/adventures-of-pingo/tools/testes/posliga
R=$1; T=${2:-900}; shift; shift
cd $D && timeout $T node $R "$@"
