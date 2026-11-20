/**
 * Eventos dos sistemas de CAPTURA E CRIAÇÃO (diário: docs/CAPTURA-CRIACAO.md):
 *  - cuieiras (spec 10A-6): objeto `cuieira` nas zonas (campo `cor`), 1 cabaça por árvore por dia → evento `cuieira`;
 *  - Mestre Cabaceiro, o artesão de Vila Caiçara (A2): transforma as cabaças em cuias artesanais no dia seguinte → `artesao-cuias`;
 *  - Viveiro do Seu Aroeira (spec 10-9 e 10A-11), depois de 6 insígnias: deixar/retirar criaturas e recolher ovos →
 *    `criadouro-aroeira` (no ninho da sala de A2-casa-aroeira); o casal avisa pelo Rádio Cipó quando aparece um ovo;
 *  - trocas com moradores do mapa A (spec 10A-12, src/data/trocas.ts) → `troca-a3`, `troca-a5`, `troca-a8`;
 *  - a Pelagem Rara garantida (spec 10A-5, "a do Lago, evento do Cartel"): depois da Liga, um capanga do Cartel tenta
 *    pegar um Mandizinho de cor rara no Lago do Fundo da Gruta Breu (A-GB-2) → `cartel-lago` (flag `lago-raro-ok`);
 *  - Diário: `rara:<nº>` marca a espécie cuja Pelagem Rara o jogador já viu (em batalha ou nascida de ovo).
 * Como `comuns.ts`, este arquivo só importa o núcleo, dados e o registro do mundo; o resto do mundo vem na hora.
 */
import type { CriaturaInst, EventoDef, Comando, TreinadorDef } from '../../core/tipos';
import { jogo, setFlag, cond, darItem, tirarItem, qtdItem } from '../../core/estado';
import { bus } from '../../core/events';
import { registrarComando, registrarTreinador } from '../../world/registro';
import { diaCorrido } from '../revancha';
import { TROCAS, troca } from '../trocas';
import { NOME_GRUPO, gruposDe } from '../ninhos';
import { NOTICIAS } from '../radio';

const deps = () => import('../../world/deps');
const hoje = () => diaCorrido(jogo.save.relogio.deslocamentoMin);
const AROEIRA = { nome: 'Seu Aroeira', retrato: 'seu-aroeira' };
const JUREMA = { nome: 'Dona Jurema', retrato: 'npc-idosa' };
const CABACEIRO = { nome: 'Mestre Cabaceiro', retrato: 'npc-idoso' };

/* ============================== Pelagem Rara no Diário ============================== */
function marcarRaras(lista: CriaturaInst[]) { for (const c of lista) if (c.rara && !c.ovo) setFlag('rara:' + c.especie); }
bus.on('batalha-fim', (d: unknown) => { const p = (d as { pedido?: { inimigos?: CriaturaInst[] } })?.pedido; if (p?.inimigos) marcarRaras(p.inimigos); });
bus.on('ovo-chocou', () => marcarRaras(jogo.save.equipe));

/* ============================== cuieiras ============================== */
/** cor do fruto → item da cabaça e cuia que o artesão faz dela */
export const CABACAS: Record<string, { fruto: string; cuia: string }> = {
  amarela: { fruto: 'cabaca-amarela', cuia: 'cuia-ligeira' }, preta: { fruto: 'cabaca-preta', cuia: 'cuia-pesada' },
  branca: { fruto: 'cabaca-branca', cuia: 'cuia-lua' }, verde: { fruto: 'cabaca-verde', cuia: 'cuia-amiga' },
  azul: { fruto: 'cabaca-azul', cuia: 'cuia-isca' }, vermelha: { fruto: 'cabaca-vermelha', cuia: 'cuia-nivel' },
  rosa: { fruto: 'cabaca-rosa', cuia: 'cuia-amor' },
};
/** ['cuieira']: colhe a cabaça da cuieira à frente do jogador (uma por árvore por dia; flag `cuieira:<zona>:<x>,<y>` = dia) */
registrarComando('cuieira', async () => {
  const { mundo } = await import('../../world/index'), { falar, nomeItem } = await deps();
  const DX = { n: 0, s: 0, l: 1, o: -1 }, DY = { n: -1, s: 1, l: 0, o: 0 };
  const j = mundo.jogador, x = j.x + DX[j.dir], y = j.y + DY[j.dir];
  const o = mundo.zona.objetos?.find((b) => b.o === 'cuieira' && b.x === x && b.y === y);
  if (!o) return;
  const cor = String(o.cor ?? 'verde'), c = CABACAS[cor] ?? CABACAS.verde, chave = `cuieira:${mundo.zona.id}:${x},${y}`;
  if (jogo.save.flags[chave] === hoje()) { await falar('Uma cuieira de galhos tortos. Os frutos que sobraram ainda estão verdes demais.\nAmanhã tem mais.'); return; }
  setFlag(chave, hoje()); darItem(c.fruto);
  bus.emit('sfx', { id: 'item-obtido' }); bus.emit('item-obtido', { id: c.fruto, qtd: 1 });
  await falar(`Uma cuieira carregada! {JOGADOR} colheu uma ${nomeItem(c.fruto)}.`);
  if (!jogo.save.flags['cuieira-dica']) { setFlag('cuieira-dica'); await falar('Dizem que em Vila Caiçara mora um artesão que transforma cabaça em cuia especial.'); }
});

/* ============================== artesão (Mestre Cabaceiro, A2) ============================== */
/** ['artesao']: entrega as cuias prontas (do dia seguinte) ou recebe as cabaças de uma cor. Flags: `artesao-cuia`, `artesao-qtd`, `artesao-dia`. */
registrarComando('artesao', async () => {
  const { falar, escolher, nomeItem } = await deps(), f = jogo.save.flags;
  const cuia = typeof f['artesao-cuia'] === 'string' ? (f['artesao-cuia'] as string) : '', qtd = Number(f['artesao-qtd'] ?? 0), dia = Number(f['artesao-dia'] ?? 0);
  if (cuia && qtd > 0) {
    if (hoje() <= dia) { await falar(`A cuia ainda está secando ao sol, de boca para baixo. Cuia apressada racha!\fVolte amanhã para buscar ${qtd > 1 ? `as ${qtd}` : 'a'} ${nomeItem(cuia)}${qtd > 1 ? 's' : ''}.`, CABACEIRO); return; }
    darItem(cuia, qtd); setFlag('artesao-cuia', ''); setFlag('artesao-qtd', 0);
    bus.emit('sfx', { id: 'item-obtido' }); bus.emit('item-obtido', { id: cuia, qtd });
    await falar(`Prontinha, lixada e encerada! Aqui ${qtd > 1 ? `estão as suas ${qtd} ${nomeItem(cuia)}s` : `está a sua ${nomeItem(cuia)}`}.`, CABACEIRO);
    await falar(`{JOGADOR} recebeu ${qtd > 1 ? qtd + '× ' : ''}${nomeItem(cuia)}!`);
    return;
  }
  const tem = Object.entries(CABACAS).filter(([, c]) => qtdItem(c.fruto) > 0);
  if (!tem.length) { await falar('Cuia boa nasce de cabaça boa. As cuieiras dão fruto de sete cores, cada cor uma cuia diferente.\fTraga as cabaças que eu faço o resto: amanhã está pronto.', CABACEIRO); return; }
  const i = await escolher('Qual cabaça vamos trabalhar?', [...tem.map(([, c]) => `${nomeItem(c.fruto)} ×${qtdItem(c.fruto)}`), 'Nenhuma']);
  if (i < 0 || i >= tem.length) { await falar('Quando quiser, a faca está afiada.', CABACEIRO); return; }
  const c = tem[i][1], n = qtdItem(c.fruto);
  tirarItem(c.fruto, n); setFlag('artesao-cuia', c.cuia); setFlag('artesao-qtd', n); setFlag('artesao-dia', hoje());
  await falar(`${n > 1 ? `${n} cabaças` : 'Uma cabaça'} dessas vira${n > 1 ? 'm' : ''} ${nomeItem(c.cuia)}.\fAgora é cortar, raspar, deixar secar a noite inteira e encerar. Volte amanhã!`, CABACEIRO);
});

/* ============================== Viveiro do Seu Aroeira (ninhos e ovos) ============================== */
if (!NOTICIAS.some((n) => n.id === 'criadouro')) NOTICIAS.push({ id: 'criadouro', titulo: 'Ninho aberto em Vila Caiçara', se: 'insignias:6', texto: 'O Seu Aroeira avisa: o ninho da sala do viveiro agora aceita casais de treinador. Deixe duas criaturas que combinam e, com sorte, aparece ovo!' });
const fraseCasal = (p: number) => (p >= 0.5 ? 'Os dois são unha e carne: não desgrudam um do outro.' : p > 0 ? 'Os dois se dão bem. Às vezes dividem o mesmo galho.' : 'Os dois nem se olham. Cada um no seu canto.');
/** ['criadouro']: o ninho da sala — deixar e retirar criaturas e recolher o ovo */
registrarComando('criadouro', async () => {
  const { falar, escolher, nomeCriatura } = await deps();
  const N = await import('../../world/ninhos');
  if (!cond(N.CRIADOURO_ABRE)) { await falar('Este ninho é dos meus bichos de estimação. Criar casal de treinador é serviço sério!\fQuando você tiver seis insígnias, a gente conversa sobre cria e ovo.', AROEIRA); return; }
  const s = jogo.save, cr = N.criadouro();
  if (!s.flags['criadouro-visto']) {
    setFlag('criadouro-visto');
    await falar('Seis insígnias! Então já posso confiar o ninho da sala a você.\fDeixe até duas criaturas comigo. Se forem de sexos diferentes e do mesmo grupo de ninho, de vez em quando aparece um ovo.\fA Jurema cuida da comida, eu cuido do café. E aviso pelo Rádio Cipó quando tiver novidade!', AROEIRA);
  }
  for (;;) {
    if (cr.ovo) {
      await falar('Olhe só o que apareceu no ninho! Um ovo quentinho. O casal fez bonito.', AROEIRA);
      const o = N.recolherOvo();
      if (o) { bus.emit('sfx', { id: 'item-obtido' }); await falar('{JOGADOR} recebeu o ovo!\nEle vai chocar depois de uma boa caminhada.'); }
      else await falar('Mas a sua equipe está cheia. Abra espaço que eu guardo o ovo até lá.', AROEIRA);
    }
    const casal = cr.casal;
    const estado = casal.length === 0 ? 'O ninho está vazio.' : casal.length === 1 ? `${nomeCriatura(casal[0])} está sozinho no ninho.` : `${nomeCriatura(casal[0])} e ${nomeCriatura(casal[1])} estão no ninho. ${fraseCasal(N.afinidade(casal[0], casal[1]))}`;
    const ops: string[] = [], acoes: ('deixar' | 'retirar' | 'grupo' | 'sair')[] = [];
    if (casal.length < 2) { ops.push('Deixar criatura'); acoes.push('deixar'); }
    if (casal.length) { ops.push('Retirar criatura'); acoes.push('retirar'); ops.push('Grupos de ninho'); acoes.push('grupo'); }
    ops.push('Até logo'); acoes.push('sair');
    const i = await escolher(estado, ops);
    const a = acoes[i] ?? 'sair';
    if (a === 'sair') { await falar('Volte sempre! Ovo gosta de visita.', AROEIRA); return; }
    if (a === 'grupo') { for (const c of casal) await falar(`${nomeCriatura(c)}: ${gruposDe(c.especie).map((g) => NOME_GRUPO[g]).join(' e ')}.`, JUREMA); continue; }
    if (a === 'deixar') {
      const cand = s.equipe.map((c, k) => ({ c, k })).filter(({ c }) => !c.ovo);
      const j = await escolher('Quem fica no ninho?', [...cand.map(({ c }) => `${nomeCriatura(c)} Nv${c.nivel}${c.sexo === 'F' ? ' ♀' : c.sexo === 'M' ? ' ♂' : ''}`), 'Ninguém']);
      if (j < 0 || j >= cand.length) continue;
      if (!N.deixar(cand[j].k)) { await falar('Assim você fica sem ninguém para lutar na estrada! Leve pelo menos uma criatura disposta.', AROEIRA); continue; }
      await falar(`Pode deixar: ${nomeCriatura(cand[j].c)} fica bem cuidado aqui. Cada passo que você der lá fora, ele treina um pouquinho aqui dentro.`, JUREMA);
      continue;
    }
    // retirar: 100 patacas mais 100 por nível ganho
    const j = await escolher('Quem volta com você?', [...casal.map((c) => { const g = N.niveisGanhos(c); return `${nomeCriatura(c)} Nv${c.nivel + g}${g ? ` (+${g})` : ''}`; }), 'Ninguém']);
    if (j < 0 || j >= casal.length) continue;
    const c = casal[j], g = N.niveisGanhos(c), preco = 100 + 100 * g;
    if (s.equipe.length >= 6) { await falar('A sua equipe está cheia. Guarde alguém no Viveiro de Cuias primeiro.', AROEIRA); continue; }
    if (s.jogador.dinheiro < preco) { await falar(`São ${preco} patacas pela hospedagem e pela comida. Volte quando tiver.`, JUREMA); continue; }
    s.jogador.dinheiro -= preco; N.retirar(j);
    await falar(`${preco} patacas, certinho. ${g ? `${nomeCriatura(c)} cresceu ${g} nível${g > 1 ? 'is' : ''} aqui com a gente!` : `${nomeCriatura(c)} descansou bastante.`}`, JUREMA);
  }
});
/** o casal avisa pelo Rádio Cipó quando aparece um ovo (só quem tem o rádio; quem não tem vê o ovo ao passar no viveiro) */
bus.on('criadouro-ovo', () => {
  if (!qtdItem('radio-cipo')) return;
  void (async () => {
    const { ocupar, sfx } = await import('../../world/vivo'), { falar } = await deps();
    await ocupar(async () => {
      sfx('radio');
      await falar('Trim, trim! Chamada no Rádio Cipó…', { nome: 'Rádio Cipó' });
      await falar('Alô, {JOGADOR}? Aqui é a Jurema, mulher do Aroeira! O casal que você deixou no ninho da sala…', JUREMA);
      await falar('…deixou um ovo! Bonito, pintadinho, batendo por dentro. Passe no viveiro em Vila Caiçara para buscar!', AROEIRA);
      const cr = jogo.save.criadouro; if (cr) cr.avisado = true;
    });
  })();
});

/* ============================== trocas com moradores do mapa A ============================== */
/** ['troca', id]: roteiro único das trocas de src/data/trocas.ts (flag `troca:<id>` depois de feita) */
registrarComando('troca', async ([id]) => {
  const t = troca(String(id)); if (!t) return;
  const { falar, simNao, criarCriatura, especie, nomeCriatura } = await deps(), s = jogo.save, quem = { nome: t.morador, retrato: t.retrato };
  if (s.flags['troca:' + t.id]) { await falar(t.falas.depois, quem); return; }
  if (!cond(t.requer)) { await falar('Hum… tenho uma proposta de troca, mas você ainda está começando. Volte com mais insígnias no estojo!', quem); return; }
  await falar(t.falas.pedido, quem);
  const nQuer = especie(t.quer)?.nome ?? `nº ${t.quer}`, nDa = especie(t.da)?.nome ?? `nº ${t.da}`;
  if (!(await simNao(`Trocar um ${nQuer} pelo ${nDa} ${t.apelido}?`))) { await falar(t.falas.recusa, quem); return; }
  const i = s.equipe.findIndex((c) => c.especie === t.quer && !c.ovo);
  if (i < 0) { await falar(t.falas.semCriatura, quem); return; }
  const dada = s.equipe[i];
  const nova = criarCriatura(t.da, t.nivel, { apelido: t.apelido, item: t.item, treinadorOriginal: t.morador, localCaptura: t.local, nivelCaptura: t.nivel });
  s.equipe.splice(i, 1, nova);
  const v = s.diario; if (!v.visto.includes(t.da)) v.visto.push(t.da); if (!v.capturado.includes(t.da)) v.capturado.push(t.da);
  setFlag('troca:' + t.id);
  bus.emit('sfx', { id: 'evolucao' });
  await falar(`{JOGADOR} entregou ${nomeCriatura(dada)} e recebeu ${t.apelido}!`);
  await falar(t.falas.feito, quem);
});

/* ============================== a Pelagem Rara do Lago (pós-Liga, A-GB-2) ============================== */
const CAPANGA_LAGO: TreinadorDef = {
  id: 'cartel-lago', classe: 'Capanga do Cartel', nome: 'Ferrolho', sprite: 'capanga-m', ia: 'treinador', contato: false, musica: 'batalha-cartel',
  equipe: [{ e: 31, nv: 40 }, { e: 145, nv: 40 }, { e: 116, nv: 42 }], premio: 2600,
  desafio: 'Xi, um treinador! Vai embora: esse bicho de cor esquisita vale uma fortuna no porto!', derrota: 'Ferrou! O Cartel nem existe mais e eu ainda apanho…',
};
registrarTreinador(CAPANGA_LAGO);
export const TREINADORES_CAPTURA: TreinadorDef[] = [CAPANGA_LAGO];
/**
 * ['lagoDuelo']: o duelo com o capanga (como `['batalha', id, { segue: true }]`: perder cura e segue, `batalha-perdida`
 * diz o resultado). Comando próprio porque o treinador nasce aqui (registrarTreinador) e não em src/data/treinadores/,
 * onde os verificadores procuram o alvo de `['batalha', id]`.
 */
registrarComando('lagoDuelo', async () => {
  const [{ desafiar }, { M }] = await Promise.all([import('../../world/npcs'), import('../../world/vivo')]);
  const venceu = await desafiar(CAPANGA_LAGO, M.npcs.find((n) => n.def.id === 'cartel-lago'), { semDerrota: true });
  setFlag('batalha-perdida', !venceu);
});
/** ['lagoRaro']: o Mandizinho de Pelagem Rara salta do lago (batalha selvagem com a variante garantida). Capturado ou vencido → `lago-raro-ok`; se fugir, volta ao fundo e o capanga ensina a chamá-lo de novo. */
registrarComando('lagoRaro', async () => {
  const { criarCriatura, falar } = await deps(), { lutar } = await import('../../world/encontros'), { M } = await import('../../world/vivo');
  await falar('A água borbulha… Um Mandizinho de escamas furta-cor salta para a margem!');
  const c = criarCriatura(39, 38, { localCaptura: 'Gruta Breu' }); c.rara = true; c.item = 'concha-rara';
  const r = await lutar({ tipo: 'selvagem', inimigos: [c], arena: M.zv.def.arena, clima: M.zv.def.clima });
  setFlag('ultima-batalha', r.resultado);
  if (r.resultado === 'derrota') return;
  // aparece uma vez só, como os lendários (decisão do autor; spec 6.4): vencido sem captura, some para sempre
  if (r.resultado === 'vitoria') await falar('O Mandizinho furta-cor afunda no lago escuro e não foi mais visto.');
  if (r.resultado === 'captura' || r.resultado === 'vitoria') { setFlag('lago-raro-ok'); await falar('O lago volta a ficar quieto. Ninguém mais vai caçar bicho por aqui.'); }
  else await falar('O Mandizinho mergulhou de volta no lago escuro. Ele ainda está por aí…');
});

const f = (quem: unknown, texto: string): Comando => ['falar', quem, texto];
const se = (c: string, entao: Comando[], senao?: Comando[]): Comando => (senao ? ['se', c, entao, senao] : ['se', c, entao]);
const FERROLHO = { nome: 'Capanga Ferrolho', retrato: 'capanga-m' };

export const EVENTOS_CAPTURA: EventoDef[] = [
  { id: 'cuieira', passos: [['cuieira']] },
  { id: 'artesao-cuias', passos: [['artesao']] },
  { id: 'criadouro-aroeira', passos: [['criadouro']] },
  ...TROCAS.map((t): EventoDef => ({ id: t.id, passos: [['troca', t.id]] })),
  {
    id: 'cartel-lago',
    passos: [
      se('flag:lago-ferrolho-fugiu', [
        f(FERROLHO, 'Eu desisti, tá? Só fico olhando. O bicho mergulhou de novo… Joga uma pedrinha na água que ele sobe.'),
        ['lagoRaro'],
      ], [
        ['emote', 'cartel-lago', '!'],
        f(FERROLHO, 'Psiu! Não faz barulho! Tem um Mandizinho de uma cor que ninguém nunca viu nesse lago…\fO chefe foi preso, mas eu ainda sei para quem vender. Rede no lago e lucro no bolso!'),
        ['lagoDuelo'],
        se('flag:batalha-perdida', [f(FERROLHO, 'Rá! Volta pra casa, criança. O bicho é meu.')], [
          f(FERROLHO, 'Tá bom, tá bom! Desisto do bicho. Mas olha lá: ele vai pular na sua cara!'),
          ['flag', 'lago-ferrolho-fugiu'],
          ['lagoRaro'],
        ]),
      ]),
    ],
  },
];
