import { abrir } from './lib.mjs';
const t = await abrir('?zona=PP&x=10&y=7&dir=n&periodo=noite&insignias=16&equipe=9:70&flags=conselho-vencido,boreal-missao,boreal-acesa');
await t.pronto(); await t.espera(4000);
const a = await t.ev(() => !!document.querySelector('.vis-aurora'));
t.ok(a, 'aurora no Pico à noite depois de acesa');
await t.foto('pp-aurora-noite');
console.log('erros', t.erros); await t.browser.close();
