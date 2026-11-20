// Jogo retomado DENTRO dos ginásios 3 e 4 (Continuar / app que volta do segundo plano): os mecanismos recomeçam do zero,
// então o jogador tem de voltar à entrada em vez de ficar preso no salão do líder. uso: node retomada-ginasio.mjs
import { abrir } from './piloto.mjs';
const t = await abrir({ nome: 'retomada', turbo: 5 });
await t.carregar('mata-pre-lider-3');
let ok = true;
for (const [zona, x, y] of [['A4-ginasio', 9, 2], ['A4-ginasio', 8, 10], ['A5-ginasio', 9, 2], ['A4-ginasio', 8, 16], ['A2-ginasio', 8, 2]]) {
  await t.ev(([z, x, y]) => window.__pingo.mundo.irPara(z, x, y, 's', 'nenhuma'), [zona, x, y]);
  const s = await t.resolver();
  const esperado = zona === 'A2-ginasio' || y >= 14 ? [x, y] : [8, 16];
  const certo = s.zona === zona && s.x === esperado[0] && s.y === esperado[1];
  ok &&= certo;
  t.log(`${zona} retomado em (${x},${y}) → (${s.x},${s.y}) ${certo ? 'ok' : 'ERRADO, esperado ' + esperado} · ${JSON.stringify(await t.falas(1))}`);
}
t.log(ok ? 'RETOMADA OK' : 'RETOMADA FALHOU'); process.exitCode = ok ? 0 : 1;
await t.fim();
