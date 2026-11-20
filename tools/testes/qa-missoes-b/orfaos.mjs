// Órfãos do Centro: um por dia, crescimento (b1-orfao-crescer), golpes e viveiro.
import { abrir, montar, avancarDias, conversar, mostra, fv, junto, escolhas } from './lib.mjs';
const sv = montar('B2-centro', 5, 5, { insignias: 11 });
sv.viveiro = sv.viveiro.map(() => []);
const t = await abrir(sv, { equipe: [[3, 70], [6, 66], [9, 64], [12, 60]], hora: 13 });
const ver = () => t.page.evaluate(() => { const s = window.__pingo.jogo.save; const d = (c) => `${c.especie}:${c.nivel}:cap${c.nivelCaptura}:${c.localCaptura ?? ''}:[${c.golpes.map((g) => g.id).join('/')}]`; return { eq: s.equipe.map(d), viv: s.viveiro.flat().filter(Boolean).map(d), fl: Object.keys(s.flags).filter((k) => /orfao|m-orfaos/.test(k) && s.flags[k] !== false).map((k) => k + '=' + s.flags[k]) }; });
try {
  await junto(t, 'B2-centro', 'b2-veterinaria');
  for (let dia = 1; dia <= 4; dia++) {
    if (dia === 3) await escolhas(t, [['Qual filhote', 3]]);
    mostra(`dia ${dia}`, (await conversar(t, 'b2-veterinaria')).slice(-5));
    console.log('  ', JSON.stringify(await ver()));
    mostra(`dia ${dia} de novo`, await conversar(t, 'b2-veterinaria'));
    await avancarDias(t, 1);
  }
  // equipe cheia: vai para o viveiro e cresce lá
  await t.page.evaluate(async () => { const { criarCriatura } = await import('/src/world/deps.ts'); const s = window.__pingo.jogo.save; while (s.equipe.length < 6) s.equipe.push(criarCriatura(14, 62)); });
  mostra('equipe cheia', (await conversar(t, 'b2-veterinaria')).slice(-4));
  console.log('  ', JSON.stringify(await ver()));
  await t.foto('orfaos');
} catch (e) { console.log('FALHOU:', e.message); await t.foto('orfaos-falha'); }
await t.fim();
