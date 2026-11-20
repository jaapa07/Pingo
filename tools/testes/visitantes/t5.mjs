import { abrir } from './lib.mjs';
const Q = '?zona=X-EA&x=18&y=12&dir=n&modo=remo&insignias=16&amuletos=todos&equipe=9:70,100:70&flags=ea-rota&itens=cuia-guardia:1';
const t = await abrir(Q);
await t.pronto(); await t.espera(800);
console.log('pronto', JSON.stringify(await t.st()));
const r = await Promise.race([t.foto('xea-ilha-direto').then(() => 'foto ok'), t.espera(15000).then(() => 'foto TRAVOU')]);
console.log(r);
console.log('erros', t.erros);
await t.browser.close();
