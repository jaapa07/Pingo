/**
 * Testes do motor de batalha (npm test). Roda em Node, sem DOM.
 * Usa `ESPECIES` de src/data/criaturas.ts se o arquivo já existir; as espécies de exemplo abaixo (nº 9001+) servem aos
 * testes de regra (evolução, captura, fórmulas) e às batalhas enquanto o arquivo de dados não chega.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { TIPOS, STATS, type CriaturaInst, type EspecieDef, type TipoId, type TreinadorDef, type ClimaId } from '../src/core/tipos';
import { rng } from '../src/core/rng';
import { jogo, novoSave, forcarPeriodo } from '../src/core/estado';
import { GOLPES, DESESPERO, golpe, temGolpe, type Efeito } from '../src/data/golpes';
import { TABELA, eficaciaContra } from '../src/data/tabela-tipos';
import { ITENS, PERGAMINHOS, item, temItemDef } from '../src/data/itens';
import { PERSONALIDADES } from '../src/data/personalidades';
import { ANIMS_USADAS } from '../src/battle/anims-usadas';
import { Batalha, danoBase, valorCaptura, tentarCaptura, bonusCuia, bonusStatusCaptura, multClima, chanceFuga, type Acao, type ConfigBatalha, type EventoBatalha } from '../src/battle/engine';
import { escolherAcaoIA, nivelEfetivo, resolverComIA, iaUsaItens, NIVEIS_IA, type NivelIA } from '../src/battle/ia';
import { registrarEspecies, especie, criarCriatura, criarDeMembro, atributos, atributosDe, expParaNivel, nivelPorExp, podeEvoluir, evoluir, ganharEsforco, ganharExp, mudarAmizade, novoSlot, AMIZADE_EVOLUCAO, expDerrota, temEspecie } from '../src/battle/criatura';
import { iniciarBatalha, prepararBatalha, definirPiloto, curarEquipe, pilotoPadrao } from '../src/battle/index';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
let falhas = 0, feitos = 0;
const pendentes: Promise<void>[] = [];
function teste(nome: string, fn: () => void | Promise<void>) {
  const ok = () => { feitos++; console.log('  ok  ' + nome); };
  const erro = (e: unknown) => { falhas++; console.log('FALHA ' + nome + '\n      ' + (e instanceof Error ? e.stack ?? e.message : String(e)).split('\n').slice(0, 4).join('\n      ')); };
  try { const r = fn(); if (r instanceof Promise) pendentes.push(r.then(ok, erro)); else ok(); } catch (e) { erro(e); }
}
function afirmar(c: unknown, msg: string): asserts c { if (!c) throw new Error(msg); }
const igual = (a: unknown, b: unknown, msg: string) => afirmar(a === b, `${msg}: esperado ${String(b)}, veio ${String(a)}`);
const perto = (a: number, b: number, tol: number, msg: string) => afirmar(Math.abs(a - b) <= tol, `${msg}: esperado ${b.toFixed(4)} ± ${tol}, veio ${a.toFixed(4)}`);

/* ============================== espécies de exemplo ============================== */
const B = (vida: number, atq: number, def: number, atqEsp: number, defEsp: number, vel: number) => ({ vida, atq, def, atqEsp, defEsp, vel });
const ex = (num: number, nome: string, tipos: EspecieDef['tipos'], base: EspecieDef['base'], golpes: [number, string][], extra: Partial<EspecieDef> = {}): EspecieDef => ({
  num, id: nome.toLowerCase(), nome, tipos, base, golpes, pergaminhos: [], taxaCaptura: 120, expBase: 70, esforco: { vel: 1 }, crescimento: 'medio', femeas: 0.5,
  diario: 'Espécie de exemplo dos testes.', altura: 0.5, peso: 5, habitat: 'teste', porte: 'P', ...extra,
});
const EXEMPLOS: EspecieDef[] = [
  ex(9001, 'Folhim', ['mata'], B(50, 50, 50, 60, 55, 45), [[1, 'encontrao'], [1, 'berro'], [5, 'chicote-de-cipo'], [9, 'erva-de-passarinho'], [13, 'sorver-seiva'], [16, 'polen-dorminhoco'], [22, 'vendaval-de-folhas'], [30, 'raio-da-clareira']], { evolui: [{ para: 9002, nivel: 16 }], crescimento: 'lento', esforco: { atqEsp: 1 } }),
  ex(9002, 'Folhagao', ['mata', 'veneno'], B(75, 70, 75, 90, 80, 60), [[1, 'encontrao'], [1, 'chicote-de-cipo'], [16, 'bote-de-jararaca'], [22, 'vendaval-de-folhas'], [28, 'banho-de-sol'], [34, 'raio-da-clareira'], [40, 'borra-de-timbo'], [46, 'tapete-de-espinhos']], { esforco: { atqEsp: 2 }, expBase: 150, taxaCaptura: 45 }),
  ex(9003, 'Brasim', ['brasa'], B(45, 60, 45, 60, 45, 65), [[1, 'arranhao'], [1, 'cara-feia'], [5, 'fagulha'], [9, 'bote-ligeiro'], [13, 'brasa-viva'], [18, 'lume-errante'], [24, 'patada-ardente'], [32, 'labareda']], { evolui: [{ para: 9004, nivel: 16 }], crescimento: 'rapido', esforco: { vel: 1 } }),
  ex(9004, 'Brasao', ['brasa', 'ginga'], B(70, 95, 65, 80, 65, 90), [[1, 'arranhao'], [1, 'fagulha'], [16, 'rasteira'], [22, 'patada-ardente'], [28, 'sol-a-pino'], [34, 'armada'], [40, 'carreira-em-chamas'], [46, 'ginga']], { esforco: { atq: 2 }, expBase: 150, taxaCaptura: 45 }),
  ex(9005, 'Rioca', ['rio'], B(55, 50, 60, 50, 60, 40), [[1, 'encontrao'], [1, 'cara-feia'], [5, 'esguicho'], [10, 'espuma-do-mar'], [14, 'rabanada'], [19, 'agua-de-cacimba'], [25, 'cachoeirada'], [33, 'enxurrada']], { evolui: [{ para: 9006, nivel: 16 }], esforco: { def: 1 } }),
  ex(9006, 'Riozao', ['rio', 'geada'], B(90, 75, 90, 80, 85, 55), [[1, 'esguicho'], [1, 'encontrao'], [16, 'sopro-frio'], [22, 'cachoeirada'], [28, 'chuva-de-verao'], [34, 'vento-minuano'], [40, 'pororoca'], [46, 'manto-de-geada']], { esforco: { def: 2 }, expBase: 150, taxaCaptura: 45 }),
  ex(9007, 'Faiscudo', ['trovao'], B(40, 45, 40, 70, 50, 85), [[1, 'choquinho'], [1, 'berro'], [6, 'corisco'], [11, 'choque-de-poraque'], [16, 'esbarrao-eletrico'], [22, 'dinamo'], [28, 'relampago'], [36, 'trovoada']], { evolui: [{ para: 9008, item: 'pedra-solar' }], esforco: { vel: 1 } }),
  ex(9008, 'Faiscao', ['trovao', 'ferro'], B(65, 70, 85, 105, 75, 100), [[1, 'choquinho'], [1, 'unha-de-aco'], [1, 'relampago'], [30, 'bigornada'], [38, 'blindagem'], [44, 'curto-circuito'], [50, 'canhao-de-sucata'], [56, 'tempestade-de-raios']], { esforco: { atqEsp: 2 }, expBase: 160 }),
  ex(9009, 'Ventinho', ['vento', 'comum'], B(45, 50, 40, 45, 40, 70), [[1, 'bicada'], [1, 'jogar-areia'], [5, 'lufada'], [9, 'bote-ligeiro'], [14, 'golpe-de-asa'], [20, 'rodamoinho'], [26, 'pouso-no-galho'], [33, 'revoada']], { evolui: [{ para: 9010, amizade: true }], crescimento: 'rapido' }),
  ex(9010, 'Ventarola', ['vento', 'encanto'], B(75, 70, 65, 95, 85, 100), [[1, 'lufada'], [1, 'piscadela'], [1, 'canto-do-uirapuru'], [24, 'pe-de-vento'], [30, 'luar'], [36, 'canto-da-iara'], [42, 'ventania'], [50, 'serenata']], { esforco: { vel: 2 }, expBase: 155 }),
  ex(9011, 'Sombrim', ['assombro'], B(40, 45, 40, 75, 55, 70), [[1, 'lambida-fria'], [1, 'mau-agouro'], [6, 'susto'], [12, 'luz-de-lamparina'], [17, 'assombracao'], [23, 'cantiga-de-ninar'], [29, 'bola-de-breu'], [36, 'sonho-ruim']], { evolui: [{ para: 9012, nivel: 20, periodo: 'noite' }], esforco: { atqEsp: 1 } }),
  ex(9012, 'Sombrao', ['assombro', 'mente'], B(65, 60, 65, 115, 90, 95), [[1, 'lambida-fria'], [1, 'intuicao'], [20, 'cisma'], [26, 'bola-de-breu'], [32, 'nevoeiro'], [38, 'forca-do-pensamento'], [44, 'sumico'], [52, 'rasga-mortalha']], { esforco: { atqEsp: 2 }, expBase: 165 }),
  ex(9013, 'Pedrusco', ['pedra', 'terra'], B(70, 85, 100, 35, 45, 30), [[1, 'encontrao'], [1, 'couraca-de-pedra'], [6, 'pedrada'], [11, 'bola-de-barro'], [16, 'soterrar'], [22, 'tatu-bola'], [28, 'tremor-de-terra'], [36, 'cabeca-dura'], [42, 'poeirao']], { esforco: { def: 2 }, crescimento: 'lento', femeas: null }),
  ex(9014, 'Insetim', ['inseto'], B(40, 45, 45, 35, 40, 55), [[1, 'ferroada'], [1, 'teia-pegajosa'], [7, 'nuvem-de-mosquitos'], [12, 'casulo'], [18, 'mordida-de-sauva'], [24, 'voo-de-mamangava'], [30, 'sanguessuga'], [38, 'enxame']], { evolui: [{ para: 9015, nivel: 10, sexo: 'F' }], taxaCaptura: 255, crescimento: 'rapido' }),
  ex(9015, 'Rainhona', ['inseto', 'veneno'], B(80, 85, 80, 70, 80, 75), [[1, 'ferroada'], [1, 'espinho-peconhento'], [10, 'ferrao-duplo'], [20, 'leite-de-cururu'], [28, 'sanguessuga'], [36, 'peconha-forte'], [44, 'chifrada-de-besouro'], [50, 'danca-do-vaga-lume']], { esforco: { atq: 2 }, expBase: 150 }),
  ex(9016, 'Guardiao', ['lenda', 'mente'], B(100, 100, 95, 110, 95, 100), [[1, 'sopro-ancestral'], [1, 'ira-antiga'], [1, 'garra-ancestral'], [1, 'cabeca-fria'], [50, 'pulso-das-eras'], [60, 'voo-do-guardiao'], [70, 'estrela-cadente'], [80, 'juizo-da-floresta']], { taxaCaptura: 3, expBase: 220, lendario: true, femeas: null, crescimento: 'lento', porte: 'L' }),
  ex(9017, 'Gingador', ['ginga', 'ferro'], B(70, 95, 80, 45, 60, 70), [[1, 'chapa-de-costas'], [1, 'ginga'], [8, 'rasteira'], [14, 'unha-de-aco'], [20, 'meia-lua'], [26, 'esquiva'], [32, 'martelo'], [40, 'locomotiva']], { esforco: { atq: 1 } }),
  ex(9018, 'Geadinha', ['geada', 'encanto'], B(60, 40, 55, 85, 80, 65), [[1, 'escorregao'], [1, 'cafune'], [8, 'sopro-frio'], [14, 'poeira-de-estrela'], [20, 'garoa-gelada'], [26, 'geada-serrana'], [32, 'clarao-da-lua'], [40, 'friagem'], [44, 'simpatia']], { esforco: { defEsp: 1 } }),
];
registrarEspecies(EXEMPLOS);

/** espécies usadas nas batalhas simuladas: as 180 do jogo, se existirem; senão as de exemplo */
let NUMS_BATALHA = EXEMPLOS.map((e) => e.num);
let origemEspecies = 'espécies de exemplo do teste';
const caminhoDados = join(RAIZ, 'src/data/criaturas.ts');
if (existsSync(caminhoDados)) {
  try {
    const mod = (await import(pathToFileURL(caminhoDados).href)) as { ESPECIES?: EspecieDef[] };
    if (mod.ESPECIES?.length) { registrarEspecies(mod.ESPECIES); NUMS_BATALHA = mod.ESPECIES.map((e) => e.num).concat(EXEMPLOS.map((e) => e.num)); origemEspecies = `ESPECIES (${mod.ESPECIES.length}) + exemplos`; }
  } catch (e) { console.log('aviso: src/data/criaturas.ts existe mas não carregou: ' + (e as Error).message.split('\n')[0]); }
}
console.log(`\nAdventures of Pingo — testes de batalha · ${GOLPES.length} golpes · ${origemEspecies}\n`);

/* ============================== utilitários de batalha ============================== */
const cria = (num: number, nivel: number, o: Partial<CriaturaInst> = {}) => criarCriatura(num, nivel, o);
const comGolpes = (c: CriaturaInst, ...ids: string[]) => { c.golpes = ids.map(novoSlot); return c; };
const neutra = (num: number, nivel: number, ...ids: string[]) => { const c = cria(num, nivel, { gen: B(8, 8, 8, 8, 8, 8), personalidade: '' }); c.vida = atributos(c).vida; return ids.length ? comGolpes(c, ...ids) : c; };
function duelo(a: CriaturaInst[], b: CriaturaInst[], o: Partial<ConfigBatalha> = {}): Batalha {
  const bt = new Batalha({ tipo: 'treinador', lados: [{ equipe: a, itens: {}, nome: 'Teste' }, { equipe: b, itens: {}, nome: 'Rival' }], trocaGratis: false, ...o });
  bt.iniciar(); return bt;
}
const G = (slot: number): Acao => ({ tipo: 'golpe', slot });
/** roda um turno 1×1 com as duas ações dadas */
const turno = (b: Batalha, a0: Acao, a1: Acao) => b.executarTurno(b.pedidos().map((p) => ({ lado: p.lado, pos: p.pos, acao: p.lado === 0 ? a0 : a1 })));
const tem = <T extends EventoBatalha['t']>(evs: EventoBatalha[], t: T, f: (e: Extract<EventoBatalha, { t: T }>) => boolean = () => true) => evs.some((e) => e.t === t && f(e as Extract<EventoBatalha, { t: T }>));
const textos = (evs: EventoBatalha[]) => evs.filter((e) => e.t === 'msg').map((e) => (e as { texto: string }).texto).join(' | ');

/* ============================== 1. dados ============================== */
teste('tabela de tipos 17×17 idêntica ao spec 6.1', () => {
  const nomes: Record<string, TipoId> = { Comum: 'comum', Mata: 'mata', Brasa: 'brasa', Rio: 'rio', 'Trovão': 'trovao', Geada: 'geada', Ginga: 'ginga', Veneno: 'veneno', Terra: 'terra', Vento: 'vento', Mente: 'mente', Inseto: 'inseto', Pedra: 'pedra', Assombro: 'assombro', Lenda: 'lenda', Ferro: 'ferro', Encanto: 'encanto' };
  const spec = readFileSync(join(RAIZ, 'GAME_SPEC_PINGO.md'), 'utf8');
  const ini = spec.indexOf('| Ataque ↓ |'); afirmar(ini > 0, 'tabela não encontrada no spec');
  const linhas = spec.slice(ini).split('\n').slice(2); let n = 0;
  const lista = (s: string) => (s.trim() === '—' ? [] : s.split(',').map((x) => { const t = nomes[x.trim()]; afirmar(t, 'tipo desconhecido no spec: ' + x); return t; }));
  for (const l of linhas) {
    if (!l.startsWith('|')) break;
    const [, a, f, fr, nu] = l.split('|'); const atq = nomes[a.trim()]; afirmar(atq, 'linha inesperada: ' + l);
    const forte = lista(f), fraco = lista(fr), nulo = lista(nu);
    for (const d of TIPOS) igual(TABELA[atq][d], nulo.includes(d) ? 0 : forte.includes(d) ? 2 : fraco.includes(d) ? 0.5 : 1, `${atq} → ${d}`);
    n++;
  }
  igual(n, 17, 'linhas da tabela no spec');
  igual(Object.keys(TABELA).length, 17, 'linhas da matriz');
  for (const a of TIPOS) { igual(Object.keys(TABELA[a]).length, 17, 'colunas de ' + a); for (const d of TIPOS) afirmar([0, 0.5, 1, 2].includes(TABELA[a][d]), `valor inválido ${a}→${d}`); }
  igual(eficaciaContra('geada', ['mata', 'terra']), 4, 'dois tipos multiplicam');
  igual(eficaciaContra('trovao', ['rio', 'terra']), 0, 'nulo vence');
});
teste('golpes: ≥ 220, ≥ 10 por tipo, ids/nomes únicos, campos válidos e animação registrada', () => {
  afirmar(GOLPES.length >= 220, `só ${GOLPES.length} golpes`);
  const anims = new Set<string>(ANIMS_USADAS), ids = new Set<string>(), nomes = new Set<string>();
  const porTipo = Object.fromEntries(TIPOS.map((t) => [t, 0])) as Record<TipoId, number>;
  for (const g of [...GOLPES, DESESPERO]) {
    afirmar(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.id), 'id inválido: ' + g.id);
    afirmar(!ids.has(g.id), 'id repetido: ' + g.id); ids.add(g.id);
    afirmar(!nomes.has(g.nome), 'nome repetido: ' + g.nome); nomes.add(g.nome);
    afirmar(TIPOS.includes(g.tipo), 'tipo inválido em ' + g.id);
    afirmar(g.anim && anims.has(g.anim), `animação não registrada em ${g.id}: ${g.anim}`);
    afirmar(new RegExp(`^(${TIPOS.join('|')}|fisico|status)-[0-9]+$`).test(g.anim), 'formato de animação inválido: ' + g.anim);
    afirmar(g.pg >= 1 && g.pg <= 40, 'PG inválido em ' + g.id);
    afirmar(g.precisao >= 0 && g.precisao <= 100, 'precisão inválida em ' + g.id);
    afirmar(g.cat === 'status' ? g.poder === 0 : g.poder > 0, 'poder incoerente em ' + g.id);
    afirmar(g.cat !== 'status' || g.efeitos.length > 0, 'golpe de status sem efeito: ' + g.id);
    afirmar(g.desc.length > 8 && g.nome.length <= 24, 'texto inválido em ' + g.id);
    if (g !== DESESPERO) porTipo[g.tipo]++;
  }
  for (const t of TIPOS) afirmar(porTipo[t] >= 10, `tipo ${t} tem só ${porTipo[t]} golpes`);
  for (const a of ANIMS_USADAS) afirmar(GOLPES.some((g) => g.anim === a) || a === DESESPERO.anim, 'animação listada e não usada: ' + a);
  const tiposEf = new Set(GOLPES.flatMap((g) => g.efeitos.map((e: Efeito) => e.t)));
  afirmar(tiposEf.size >= 20, 'pouca variedade de efeitos: ' + tiposEf.size);
  console.log('      por tipo: ' + TIPOS.map((t) => `${t} ${porTipo[t]}`).join(' · '));
});
teste('itens: cuias, remédios, pedras, frutos, itens-chave e 50 pergaminhos apontando para golpes', () => {
  const obrig = ['cuia', 'cuia-trancada', 'cuia-ouro', 'cuia-rede', 'cuia-noturna', 'cuia-rapida', 'cuia-mel', 'cuia-guardia', 'cha-cidreira', 'garrafada', 'elixir-andiroba', 'mel-puro', 'unguento', 'pomada-copaiba',
    'pedra-solar', 'pedra-mare', 'pedra-lunar', 'folha-ancestral', 'engrenagem-velha', 'caju', 'pitanga', 'jabuticaba', 'cupuacu', 'pequi', 'buriti', 'acai', 'acerola', 'vara-velha', 'vara-boa', 'vara-mestra', 'fumaca-andiroba', 'bike-bambu', 'passe-trem', 'bilhete-saveiro', 'radio-cipo',
    ...['facao', 'remo', 'forca', 'lampiao', 'quebra-pedra', 'escalar', 'cachoeira', 'mergulho', 'voo', 'faro'].map((a) => 'amuleto-' + a)];
  for (const id of obrig) afirmar(temItemDef(id), 'falta o item ' + id);
  igual(ITENS.filter((i) => i.uso?.cuia).length, 8, 'nº de cuias');
  igual(new Set(ITENS.map((i) => i.id)).size, ITENS.length, 'ids de itens únicos');
  igual(Object.keys(PERGAMINHOS).length, 50, 'nº de pergaminhos');
  for (let n = 1; n <= 50; n++) { const id = 'pt-' + String(n).padStart(2, '0'); afirmar(temItemDef(id), 'falta ' + id); const gid = item(id).uso?.golpe; afirmar(gid && temGolpe(gid), `${id} aponta para golpe inexistente`); igual(item(id).bolso, 'pergaminhos', 'bolso de ' + id); }
  igual(new Set(Object.values(PERGAMINHOS)).size, 50, 'pergaminhos sem golpe repetido');
  for (const i of ITENS) afirmar(['itens', 'remedios', 'cuias', 'pergaminhos', 'frutos', 'chave'].includes(i.bolso) && i.nome && i.desc, 'item mal formado: ' + i.id);
});
teste('personalidades: 10, cada uma com +10% e −10% em atributos diferentes', () => {
  igual(PERSONALIDADES.length, 10, 'quantidade');
  igual(new Set(PERSONALIDADES.map((p) => p.id)).size, 10, 'ids únicos');
  for (const p of PERSONALIDADES) afirmar(p.mais !== p.menos, p.id);
  const a = atributosDe(B(100, 100, 100, 100, 100, 100), B(0, 0, 0, 0, 0, 0), B(0, 0, 0, 0, 0, 0), 50, 'valente'), n = atributosDe(B(100, 100, 100, 100, 100, 100), B(0, 0, 0, 0, 0, 0), B(0, 0, 0, 0, 0, 0), 50, '');
  igual(n.atq, 105, 'neutro'); igual(a.atq, 115, '+10%'); igual(a.vel, 94, '−10%'); igual(a.vida, n.vida, 'vida não muda');
});

/* ============================== 2. fórmulas ============================== */
teste('atributos, dano base, curvas de experiência e esforço seguem o contrato', () => {
  const a = atributosDe(B(80, 82, 83, 100, 100, 80), B(15, 15, 15, 15, 15, 15), B(252, 0, 0, 252, 0, 4), 50, '');
  igual(a.vida, Math.floor(((160 + 30 + 63) * 50) / 100) + 60, 'vida'); igual(a.atq, Math.floor(((164 + 30) * 50) / 100) + 5, 'ataque'); igual(a.atqEsp, Math.floor(((200 + 30 + 63) * 50) / 100) + 5, 'ataque especial');
  igual(danoBase(50, 80, 100, 100), Math.floor(Math.floor((22 * 80 * 100) / 100) / 50) + 2, 'dano base');
  igual(danoBase(5, 40, 12, 11), Math.floor(Math.floor((4 * 40 * 12) / 11) / 50) + 2, 'dano base nível baixo');
  igual(expParaNivel('medio', 10), 1000, 'médio'); igual(expParaNivel('rapido', 10), 800, 'rápido'); igual(expParaNivel('lento', 10), 1250, 'lento'); igual(expParaNivel('medio', 1), 0, 'nível 1');
  igual(nivelPorExp('medio', 999), 9, 'nível por exp'); igual(nivelPorExp('medio', 1000), 10, 'nível por exp');
  const c = neutra(9001, 20);
  ganharEsforco(c, { atq: 300 }); igual(c.esf.atq, 252, 'máx. por atributo');
  ganharEsforco(c, { def: 252 }); ganharEsforco(c, { vel: 252 }); igual(c.esf.atq + c.esf.def + c.esf.vel, 510, 'máx. total'); igual(c.esf.vel, 6, 'sobra');
  const inim = neutra(9002, 20); igual(expDerrota(inim, false), Math.floor((150 * 20) / 7), 'exp selvagem'); igual(expDerrota(inim, true), Math.floor(Math.floor((150 * 20) / 7) * 1.5), 'exp treinador');
  igual(multClima('sol', 'brasa'), 1.5, 'sol/brasa'); igual(multClima('sol', 'rio'), 0.5, 'sol/rio'); igual(multClima('chuva', 'rio'), 1.5, 'chuva/rio'); igual(multClima('chuva', 'brasa'), 0.5, 'chuva/brasa'); igual(multClima('nevoa', 'rio'), 1, 'névoa');
  igual(chanceFuga(50, 40, 0), 1, 'mais rápido sempre foge'); afirmar(chanceFuga(20, 80, 0) < chanceFuga(20, 80, 3), 'tentativas ajudam');
});
teste('criarCriatura: genes 0..15, personalidade, sexo, golpes do nível e vida cheia', () => {
  rng.seed(11);
  let f = 0;
  for (let i = 0; i < 300; i++) {
    const c = cria(9001, 14);
    for (const s of STATS) afirmar(c.gen[s] >= 0 && c.gen[s] <= 15 && c.esf[s] === 0, 'genes');
    afirmar(PERSONALIDADES.some((p) => p.id === c.personalidade), 'personalidade'); if (c.sexo === 'F') f++;
    igual(c.vida, atributos(c).vida, 'vida cheia'); igual(c.exp, expParaNivel('lento', 14), 'exp do nível');
    igual(c.golpes.map((g) => g.id).join(','), 'berro,chicote-de-cipo,erva-de-passarinho,sorver-seiva', 'últimos 4 golpes até o nível');
  }
  afirmar(f > 110 && f < 190, 'proporção de fêmeas ' + f); igual(cria(9013, 5).sexo, null, 'sem sexo');
  const m = criarDeMembro({ e: 9003, nv: 30, golpes: ['labareda', 'rasteira'] }, 'Rival'); igual(m.golpes.length, 2, 'golpes fixos do treinador'); igual(m.golpes[0].pg, golpe('labareda').pg, 'PG cheio');
});

/* ============================== 3. captura ============================== */
teste('captura: 4 testes clássicos com chance total ≈ a/255 (10 mil arremessos por valor)', () => {
  rng.seed(2024);
  for (const a of [12, 40, 85, 128, 190, 240]) {
    let ok = 0; const bal = [0, 0, 0, 0];
    for (let i = 0; i < 10000; i++) { const r = tentarCaptura(a); if (r.sucesso) ok++; else bal[r.balancos]++; }
    perto(ok / 10000, a / 255, 0.015, `a = ${a}`);
    afirmar(bal[0] > 0 && bal[1] > 0 && bal[2] > 0 && bal[3] > 0, 'todos os números de balanços aparecem');
  }
  igual(tentarCaptura(255).sucesso, true, 'a ≥ 255 captura'); igual(tentarCaptura(999).balancos, 3, '3 balanços no sucesso');
});
teste('captura: fórmula, bônus de status e das 8 cuias', () => {
  igual(valorCaptura(100, 100, 120, 1, 1), 40, 'vida cheia = taxa/3'); igual(valorCaptura(100, 1, 120, 1, 1), Math.floor((298 * 120) / 300), 'vida 1');
  igual(valorCaptura(100, 50, 90, 2, 1.5), Math.floor((200 * 90 * 2 * 1.5) / 300), 'bônus multiplicam');
  igual(bonusStatusCaptura('dormindo'), 2, 'dormindo'); igual(bonusStatusCaptura('congelado'), 2, 'congelado'); igual(bonusStatusCaptura('paralisado'), 1.5, 'outros'); igual(bonusStatusCaptura('encantado'), 1.5, 'encantado'); igual(bonusStatusCaptura(null), 1, 'sem status');
  igual(bonusCuia('cuia', ['mata'], 'dia', 3), 1, 'cuia'); igual(bonusCuia('cuia-trancada', ['mata'], 'dia', 3), 1.5, 'trançada'); igual(bonusCuia('cuia-ouro', ['mata'], 'dia', 3), 2, 'ouro');
  igual(bonusCuia('cuia-rede', ['rio'], 'dia', 3), 3, 'rede × rio'); igual(bonusCuia('cuia-rede', ['vento', 'inseto'], 'dia', 3), 3, 'rede × inseto'); igual(bonusCuia('cuia-rede', ['brasa'], 'dia', 3), 1, 'rede × outro');
  igual(bonusCuia('cuia-noturna', ['mata'], 'noite', 3), 3, 'noturna à noite'); igual(bonusCuia('cuia-noturna', ['mata'], 'dia', 3), 1, 'noturna de dia');
  igual(bonusCuia('cuia-rapida', ['mata'], 'dia', 1), 4, 'rápida no 1º turno'); igual(bonusCuia('cuia-rapida', ['mata'], 'dia', 2), 1, 'rápida depois'); igual(bonusCuia('cuia-mel', ['mata'], 'dia', 2), 1, 'mel');
});
teste('captura em batalha: 10 mil arremessos reais batem com a fórmula; cuia é gasta; Guardiã nunca falha', () => {
  rng.seed(77);
  const N = 10000; let ok = 0, esperado = 0;
  for (let i = 0; i < N; i++) {
    const meu = neutra(9016, 60, 'cabeca-fria'), alvo = neutra(9005, 12, 'cara-feia');
    alvo.vida = Math.max(1, Math.floor(atributos(alvo).vida / 2)); alvo.status = 'paralisado';
    const b = new Batalha({ tipo: 'selvagem', lados: [{ equipe: [meu], itens: { 'cuia-trancada': 1 } }, { equipe: [alvo] }], periodo: 'dia' }); b.iniciar();
    b.executarTurno([{ lado: 0, pos: 0, acao: { tipo: 'golpe', slot: 0 } }, { lado: 1, pos: 0, acao: G(0) }]); // 2º turno em diante: sem bônus de 1º turno
    const a = valorCaptura(atributos(alvo).vida, alvo.vida, 120, 1.5, 1.5); esperado = a / 255;
    const evs = b.executarTurno([{ lado: 0, pos: 0, acao: { tipo: 'item', item: 'cuia-trancada' } }, { lado: 1, pos: 0, acao: G(0) }]);
    afirmar(tem(evs, 'captura'), 'evento de captura'); igual(b.lados[0].itens['cuia-trancada'], undefined, 'cuia gasta');
    if (b.resultado === 'captura') { ok++; igual(b.capturada, alvo, 'capturada'); igual(alvo.cuia, 'cuia-trancada', 'cuia registrada'); afirmar(tem(evs, 'captura', (e) => e.sucesso && e.balancos === 3), '3 balanços'); }
  }
  perto(ok / N, esperado, 0.015, 'taxa de captura em batalha');
  for (let i = 0; i < 50; i++) {
    const lend = neutra(9016, 70); const b = new Batalha({ tipo: 'lendario', lados: [{ equipe: [neutra(9001, 5)], itens: { 'cuia-guardia': 1 } }, { equipe: [lend] }] }); b.iniciar();
    turno(b, { tipo: 'item', item: 'cuia-guardia' }, G(0)); igual(b.resultado, 'captura', 'Cuia Guardiã');
  }
  const t = duelo([neutra(9001, 20)], [neutra(9003, 20)]); t.lados[0].itens.cuia = 2;
  const evs = turno(t, { tipo: 'item', item: 'cuia' }, G(0)); afirmar(!tem(evs, 'captura') && t.lados[0].itens.cuia === 2 && t.resultado !== 'captura', 'não captura criatura de treinador');
  const s = new Batalha({ tipo: 'selvagem', semCaptura: true, lados: [{ equipe: [neutra(9001, 20)], itens: { cuia: 1 } }, { equipe: [neutra(9014, 3)] }] }); s.iniciar();
  turno(s, { tipo: 'item', item: 'cuia' }, G(0)); afirmar(s.resultado !== 'captura' && s.lados[0].itens.cuia === 1, 'semCaptura');
  const mel = neutra(9014, 2); const bm = new Batalha({ tipo: 'selvagem', lados: [{ equipe: [neutra(9001, 20)], itens: { 'cuia-mel': 60 } }, { equipe: [mel] }] }); bm.iniciar();
  while (!bm.resultado) turno(bm, { tipo: 'item', item: 'cuia-mel' }, G(1));
  igual(bm.resultado, 'captura', 'cuia de mel captura'); afirmar(mel.amizade >= 200, 'cuia de mel dá amizade');
});

/* ============================== 4. evolução e amizade ============================== */
teste('evolução: nível, item, amizade, período e sexo nos gatilhos certos', () => {
  rng.seed(5);
  const f = cria(9001, 15); igual(podeEvoluir(f), null, 'nível 15 ainda não'); f.nivel = 16; igual(podeEvoluir(f)?.para, 9002, 'nível 16 evolui');
  igual(podeEvoluir(f, { item: 'pedra-solar' }), null, 'item errado não evolui quem evolui por nível');
  const t = cria(9007, 40); igual(podeEvoluir(t), null, 'sem item não evolui'); igual(podeEvoluir(t, { item: 'pedra-mare' }), null, 'pedra errada'); igual(podeEvoluir(t, { item: 'pedra-solar' })?.para, 9008, 'pedra certa');
  const v = cria(9009, 12); v.amizade = AMIZADE_EVOLUCAO - 1; igual(podeEvoluir(v), null, 'amizade insuficiente'); v.amizade = AMIZADE_EVOLUCAO; igual(podeEvoluir(v)?.para, 9010, 'amizade alta');
  const s = cria(9011, 25); igual(podeEvoluir(s, { periodo: 'dia' }), null, 'de dia não'); igual(podeEvoluir(s, { periodo: 'noite' })?.para, 9012, 'à noite sim'); s.nivel = 19; igual(podeEvoluir(s, { periodo: 'noite' }), null, 'à noite mas sem nível');
  const i = cria(9014, 10, { sexo: 'M' }); igual(podeEvoluir(i), null, 'macho não'); i.sexo = 'F'; igual(podeEvoluir(i)?.para, 9015, 'fêmea sim');
  igual(podeEvoluir(cria(9002, 80)), null, 'forma final não evolui');
  // evoluir mantém o dano sofrido e ensina o golpe do nível
  const b = cria(9003, 16); const max = atributos(b).vida; b.vida = max - 7; b.golpes = b.golpes.slice(0, 3);
  const sobra = evoluir(b, 9004); igual(b.especie, 9004, 'espécie nova'); igual(atributos(b).vida - b.vida, 7, 'dano mantido'); afirmar(b.golpes.some((g) => g.id === 'rasteira') && sobra.length === 0, 'aprendeu o golpe do nível 16');
  mudarAmizade(v, 999); igual(v.amizade, 255, 'amizade máxima'); mudarAmizade(v, -999); igual(v.amizade, 0, 'amizade mínima');
  const mel = cria(9001, 5, { cuia: 'cuia-mel' }), com = cria(9001, 5); mudarAmizade(mel, 4); mudarAmizade(com, 4); afirmar(mel.amizade > com.amizade, 'Cuia de Mel acelera a amizade');
});
teste('experiência em batalha: subir de nível, aprender golpe, golpe pendente e evolução pendente no nível certo', () => {
  rng.seed(9);
  const meu = neutra(9003, 15, 'brasa-viva'); meu.exp = expParaNivel('rapido', 16) - 1;
  const b = duelo([meu], [neutra(9001, 4, 'berro')]);
  let evs: EventoBatalha[] = []; while (!b.resultado) evs = evs.concat(turno(b, G(0), G(0)));
  igual(b.resultado, 'vitoria', 'resultado'); igual(meu.nivel, 16, 'subiu para 16');
  afirmar(tem(evs, 'exp') && tem(evs, 'nivel', (e) => e.nivel === 16), 'eventos de exp e nível');
  afirmar(tem(evs, 'evolucao-pendente', (e) => e.para === 9004) && b.evolucoes.length === 1, 'evolução pendente no nível 16');
  igual(meu.especie, 9003, 'o motor não evolui sozinho'); igual(meu.esf.atqEsp, 1, 'esforço da espécie derrotada');
  // um nível antes não evolui
  const m2 = neutra(9003, 13, 'brasa-viva'); m2.exp = expParaNivel('rapido', 14) - 1;
  const b2 = duelo([m2], [neutra(9001, 4, 'berro')]); while (!b2.resultado) turno(b2, G(0), G(0));
  igual(m2.nivel, 14, 'subiu para 14'); igual(b2.evolucoes.length, 0, 'sem evolução antes do nível');
  // 4 golpes: fica pendente e a view decide
  const m3 = neutra(9003, 12, 'arranhao', 'cara-feia', 'fagulha', 'bote-ligeiro'); m3.exp = expParaNivel('rapido', 13) - 1;
  const b3 = duelo([m3], [neutra(9001, 4, 'berro')]); let e3: EventoBatalha[] = []; while (!b3.resultado) e3 = e3.concat(turno(b3, G(2), G(0)));
  afirmar(tem(e3, 'golpe-pendente', (e) => e.golpe === 'brasa-viva') && b3.golpesPendentes.length === 1, 'golpe pendente');
  const e4 = b3.aprender(m3.uid, 'brasa-viva', 1); afirmar(tem(e4, 'novo-golpe', (e) => e.esqueceu === 'cara-feia') && m3.golpes[1].id === 'brasa-viva' && b3.golpesPendentes.length === 0, 'aprender no lugar de outro');
  // experiência dividida entre participantes
  const a1 = neutra(9005, 20, 'toca-e-foge'), a2 = neutra(9005, 20, 'esguicho'); const x1 = a1.exp, x2 = a2.exp;
  const alvo = neutra(9003, 10, 'cara-feia'); const b5 = duelo([a1, a2], [alvo]);
  turno(b5, { tipo: 'golpe', slot: 0, trocaPara: 1 }, G(0)); while (!b5.resultado) turno(b5, G(0), G(0));
  const total = expDerrota(alvo, true); igual(a1.exp - x1, Math.floor(total / 2), 'metade para quem saiu'); igual(a2.exp - x2, Math.floor(total / 2), 'metade para quem ficou');
  // fora de batalha
  const r = neutra(9001, 5); const subidas = ganharExp(r, expParaNivel('lento', 9) - r.exp); igual(r.nivel, 9, 'ganharExp'); igual(subidas.length, 4, 'subidas'); afirmar(r.golpes.some((g) => g.id === 'erva-de-passarinho'), 'aprendeu no caminho');
});

/* ============================== 5. regras de batalha ============================== */
teste('ordem dos turnos: prioridade → Velocidade (paralisia ÷4) → empate no rng', () => {
  rng.seed(3);
  const ordem = (evs: EventoBatalha[]) => evs.filter((e) => e.t === 'golpe').map((e) => (e as { lado: number }).lado).join('');
  for (let i = 0; i < 20; i++) { const b = duelo([neutra(9013, 30, 'encontrao')], [neutra(9007, 30, 'berro')]); igual(ordem(turno(b, G(0), G(0))), '10', 'o mais veloz age antes'); }
  for (let i = 0; i < 20; i++) { const b = duelo([neutra(9013, 30, 'bote-ligeiro')], [neutra(9007, 30, 'berro')]); igual(ordem(turno(b, G(0), G(0))), '01', 'prioridade vence velocidade'); }
  let primeiro0 = 0;
  for (let i = 0; i < 400; i++) { const b = duelo([neutra(9001, 30, 'berro')], [neutra(9001, 30, 'berro')]); if (ordem(turno(b, G(0), G(0)))[0] === '0') primeiro0++; }
  afirmar(primeiro0 > 150 && primeiro0 < 250, 'empate decidido no rng: ' + primeiro0);
  const lento = neutra(9007, 30, 'berro'); lento.status = 'paralisado'; const b = duelo([neutra(9001, 30, 'berro')], [lento]);
  igual(b.stat({ lado: 1, pos: 0 }, 'vel'), Math.floor(atributos(lento).vel / 4), 'paralisado ÷4');
});
teste('dano: mesmo-tipo ×1,5, eficácia, crítico ×2 (≈1/16), variação 0,85–1,00, queimadura e clima', () => {
  rng.seed(4);
  const medir = (atq: CriaturaInst, def: CriaturaInst, o: Partial<ConfigBatalha> = {}, n = 3000) => {
    let min = 1e9, max = 0, crit = 0, total = 0;
    for (let i = 0; i < n; i++) {
      for (const g of atq.golpes) g.pg = g.pgMax; def.vida = atributos(def).vida;
      const b = duelo([atq], [def], o); const evs = turno(b, G(0), G(1));
      const d = evs.find((e) => e.t === 'dano' && e.lado === 1) as Extract<EventoBatalha, { t: 'dano' }> | undefined; if (!d) continue;
      total++; if (d.critico) { crit++; continue; } const v = d.de - d.para; min = Math.min(min, v); max = Math.max(max, v);
    }
    return { min, max, crit: crit / total };
  };
  const alvo = neutra(9013, 50, 'couraca-de-pedra', 'faro-fino'), A = (c: CriaturaInst) => atributos(c);
  const neutroAtq = neutra(9003, 50, 'estrondo'); // comum especial em pedra/terra: ×0,5, sem mesmo-tipo
  const base = danoBase(50, 90, A(neutroAtq).atqEsp, A(alvo).defEsp);
  const r1 = medir(neutroAtq, alvo); igual(r1.max, Math.floor(base * 0.5), 'máximo ×0,5'); igual(r1.min, Math.floor(base * 0.5 * 0.85), 'mínimo com variação 0,85'); perto(r1.crit, 1 / 16, 0.02, 'chance de crítico');
  const rio = neutra(9005, 50, 'esguicho'); const b2 = danoBase(50, 40, A(rio).atqEsp, A(alvo).defEsp);
  igual(medir(rio, alvo).max, Math.floor(b2 * 1.5 * 4), 'mesmo-tipo ×1,5 e eficácia ×4');
  igual(medir(rio, alvo, { clima: 'chuva' }).max, Math.floor(b2 * 1.5 * 4 * 1.5), 'chuva ×1,5 em Rio'); igual(medir(rio, alvo, { clima: 'sol' }).max, Math.floor(b2 * 1.5 * 4 * 0.5), 'sol ×0,5 em Rio');
  const fis = neutra(9017, 50, 'rasteira'); const b3 = danoBase(50, 50, A(fis).atq, A(alvo).def), semQueimar = medir(fis, alvo).max;
  igual(semQueimar, Math.floor(b3 * 1.5 * 2), 'físico com mesmo-tipo ×2'); fis.status = 'queimado'; igual(medir(fis, alvo).max, Math.floor(b3 * 1.5 * 2 * 0.5), 'queimado ×0,5 em físico'); fis.status = null;
  const cr = neutra(9003, 50, 'patada'); perto(medir(cr, neutra(9001, 50, 'berro', 'berro')).crit, 1 / 4, 0.03, 'alto crítico');
  const imune = duelo([neutra(9003, 50, 'encontrao')], [neutra(9011, 50, 'mau-agouro')]); const ev = turno(imune, G(0), G(0)); afirmar(!tem(ev, 'dano') && tem(ev, 'errou', (e) => e.motivo === 'imune'), 'Comum não afeta Assombro');
});
teste('os 6 status principais e os voláteis funcionam como no contrato', () => {
  rng.seed(6);
  // queimado 1/16 e envenenado 1/8 por turno; imunidades por tipo
  const q = neutra(9001, 40, 'berro'); q.status = 'queimado'; const e = neutra(9005, 40, 'cara-feia'); e.status = 'envenenado';
  const b = duelo([q], [e]); const evs = turno(b, G(0), G(0));
  afirmar(tem(evs, 'dano', (d) => d.lado === 0 && d.origem === 'status' && d.de - d.para === Math.floor(atributos(q).vida / 16)), 'queimadura 1/16');
  afirmar(tem(evs, 'dano', (d) => d.lado === 1 && d.origem === 'status' && d.de - d.para === Math.floor(atributos(e).vida / 8)), 'veneno 1/8');
  const imunes: [string, number][] = [['lume-errante', 9003], ['leite-de-cururu', 9002], ['choque-de-poraque', 9007], ['canto-do-uirapuru', 9010]];
  for (const [g, alvo] of imunes) for (let i = 0; i < 12; i++) { const a = neutra(alvo, 30, 'berro'); const bt = duelo([neutra(9016, 30, g)], [a]); turno(bt, G(0), G(0)); igual(a.status, null, `${g} não afeta a espécie ${alvo}`); }
  // dormindo: não age por 1–3 turnos e acorda
  let dormiu = 0, turnosDormindo: number[] = [];
  for (let i = 0; i < 200; i++) {
    const alvo = neutra(9013, 30, 'couraca-de-pedra'); const bt = duelo([neutra(9016, 30, 'olho-de-coruja', 'cabeca-fria')], [alvo]); turno(bt, G(0), G(0));
    if (alvo.status !== 'dormindo') continue; dormiu++;
    let n = 0; while (alvo.status === 'dormindo' && n < 9) { const ev = turno(bt, G(1), G(0)); if (alvo.status === 'dormindo') { n++; afirmar(!tem(ev, 'golpe', (x) => x.lado === 1), 'dormindo não age'); } }
    turnosDormindo.push(n);
  }
  afirmar(dormiu > 80 && dormiu < 160, 'precisão 60 do sono: ' + dormiu); afirmar(Math.min(...turnosDormindo) >= 1 && Math.max(...turnosDormindo) <= 3, 'sono dura 1 a 3 turnos: ' + Math.min(...turnosDormindo) + '–' + Math.max(...turnosDormindo));
  // paralisado: ~25% perde a vez
  let travou = 0; const par = neutra(9001, 30, 'berro'); par.status = 'paralisado';
  for (let i = 0; i < 1000; i++) { par.golpes[0].pg = 40; const bt = duelo([par], [neutra(9013, 30, 'couraca-de-pedra')]); if (!tem(turno(bt, G(0), G(0)), 'golpe', (x) => x.lado === 0)) travou++; }
  perto(travou / 1000, 0.25, 0.04, 'paralisia trava 25%');
  // congelado: não age; ~20% de descongelar; golpe de Brasa descongela
  let livre = 0; for (let i = 0; i < 1000; i++) { const c = neutra(9001, 30, 'berro'); c.status = 'congelado'; const bt = duelo([c], [neutra(9013, 30, 'couraca-de-pedra')]); turno(bt, G(0), G(0)); if (!c.status) livre++; }
  perto(livre / 1000, 0.2, 0.04, 'descongelar 20%');
  const gelo = neutra(9013, 40, 'couraca-de-pedra'); gelo.status = 'congelado'; const bg = duelo([neutra(9003, 20, 'fagulha')], [gelo]); for (let i = 0; i < 4 && gelo.status; i++) turno(bg, G(0), G(0)); igual(gelo.status, null, 'Brasa descongela');
  // encantado: ~50% imita o último golpe do adversário; cura em 2–4 turnos
  let imitou = 0, agiu = 0; const dur: number[] = [];
  for (let i = 0; i < 400; i++) {
    const enc = neutra(9013, 40, 'couraca-de-pedra'); const bt = duelo([neutra(9016, 40, 'canto-do-uirapuru', 'cabeca-fria')], [enc]);
    turno(bt, G(0), G(0)); if (enc.status !== 'encantado') continue;
    let n = 1; // o turno em que foi encantado conta
    while (enc.status === 'encantado' && n < 9) {
      const ev = turno(bt, G(1), G(0)); const g = ev.find((x) => x.t === 'golpe' && x.lado === 1) as Extract<EventoBatalha, { t: 'golpe' }> | undefined;
      if (g) { agiu++; if (g.golpe === 'cabeca-fria') imitou++; }
      if (enc.status === 'encantado') n++;
    }
    dur.push(n);
  }
  perto(imitou / agiu, 0.5, 0.06, 'encantado imita em 50%'); afirmar(Math.min(...dur) >= 2 && Math.max(...dur) <= 4, `encantado dura 2–4 turnos: ${Math.min(...dur)}–${Math.max(...dur)}`);
  // confusão, atordoado, preso
  let auto = 0, conf = 0;
  for (let i = 0; i < 300; i++) { const bt = duelo([neutra(9016, 30, 'cisma')], [neutra(9013, 30, 'couraca-de-pedra')]); turno(bt, G(0), G(0)); if (bt.vol({ lado: 1, pos: 0 }).confuso > 0) { conf++; if (tem(turno(bt, G(0), G(0)), 'dano', (d) => d.origem === 'confusao')) auto++; } }
  afirmar(conf === 300, 'Cisma sempre confunde'); perto(auto / conf, 1 / 3 * 0.8, 0.08, 'confuso se fere ~1/3 das vezes em que segue confuso');
  let atord = 0, acertos = 0;
  for (let i = 0; i < 400; i++) { const bt = duelo([neutra(9007, 30, 'cabecada')], [neutra(9013, 30, 'couraca-de-pedra')]); const ev = turno(bt, G(0), G(0)); if (tem(ev, 'dano', (d) => d.lado === 1)) { acertos++; if (!tem(ev, 'golpe', (x) => x.lado === 1)) atord++; } }
  perto(atord / acertos, 0.3, 0.06, 'atordoado 30% (só se o alvo ainda não agiu)');
  const preso = neutra(9013, 40, 'couraca-de-pedra'); const bp = duelo([neutra(9016, 40, 'redemoinho')], [preso, neutra(9001, 40)]);
  for (let i = 0; i < 6 && bp.vol({ lado: 1, pos: 0 }).preso <= 0; i++) turno(bp, G(0), G(0));
  afirmar(bp.vol({ lado: 1, pos: 0 }).preso > 0 && !bp.podeTrocar({ lado: 1, pos: 0 }), 'preso não troca'); const ep = turno(bp, G(0), { tipo: 'troca', para: 1 }); afirmar(!tem(ep, 'entra', (x) => x.lado === 1), 'troca bloqueada pela armadilha');
});
teste('estágios (−6…+6), precisão/evasão, proteção, carga de 2 turnos, recarga, troca forçada, clima e Desespero', () => {
  rng.seed(8);
  const a = neutra(9017, 40, 'grito-de-guerra', 'fincar-pe', 'jogar-areia'), d = neutra(9013, 40, 'cara-feia', 'encontrao');
  const b = duelo([a], [d]); const p0 = { lado: 0 as const, pos: 0 };
  const atq0 = b.stat(p0, 'atq'); for (let i = 0; i < 4; i++) turno(b, G(0), G(0));
  igual(b.vol(p0).est.atq, 6, 'máximo +6'); igual(b.stat(p0, 'atq'), Math.floor(atributos(a).atq * 4), '+6 = ×4'); afirmar(atq0 === atributos(a).atq, 'estágio 0 = ×1'); igual(b.vol(p0).est.def, -4, 'defesa caiu 4');
  // proteção bloqueia e falha mais se repetida
  let seguidas = 0; for (let i = 0; i < 300; i++) { const bt = duelo([neutra(9017, 40, 'fincar-pe')], [neutra(9013, 40, 'encontrao')]); const e1 = turno(bt, G(0), G(0)); afirmar(tem(e1, 'errou', (x) => x.motivo === 'protecao') && !tem(e1, 'dano'), '1ª proteção sempre funciona'); if (tem(turno(bt, G(0), G(0)), 'errou', (x) => x.motivo === 'protecao')) seguidas++; }
  perto(seguidas / 300, 0.5, 0.09, '2ª proteção seguida funciona em 50%');
  // precisão: Jogar Areia reduz a chance de acerto
  let erros = 0; for (let i = 0; i < 400; i++) { const bt = duelo([neutra(9017, 40, 'jogar-areia')], [neutra(9013, 40, 'encontrao')]); bt.vol({ lado: 1, pos: 0 }).est.prec = -6; if (tem(turno(bt, G(0), G(0)), 'errou', (x) => x.lado === 1 && x.motivo === 'precisao')) erros++; }
  perto(erros / 400, 1 - 3 / 9, 0.07, 'precisão −6 = ×1/3');
  let nevoa = 0; for (let i = 0; i < 600; i++) { const bt = duelo([neutra(9017, 40, 'ginga')], [neutra(9013, 40, 'encontrao')], { clima: 'nevoa' }); if (tem(turno(bt, G(0), G(0)), 'errou', (x) => x.lado === 1)) nevoa++; }
  perto(nevoa / 600, 0.2, 0.05, 'névoa: precisão ×0,8');
  for (let i = 0; i < 60; i++) { const bt = duelo([neutra(9017, 40, 'ginga')], [neutra(9011, 40, 'lambida-fria')], { clima: 'nevoa' }); afirmar(!tem(turno(bt, G(0), G(0)), 'errou', (x) => x.lado === 1), 'Assombro não erra na névoa'); }
  // carga: prepara, some e golpeia; fora de alcance enquanto isso
  const bc = duelo([neutra(9009, 40, 'revoada')], [neutra(9013, 40, 'encontrao')]); const c1 = turno(bc, G(0), G(0));
  afirmar(tem(c1, 'carga', (x) => x.some && !x.solta) && tem(c1, 'errou', (x) => x.motivo === 'fora') && !tem(c1, 'dano'), '1º turno: sobe e fica fora de alcance');
  igual(bc.pedidos().filter((p) => p.lado === 0).length, 0, 'não escolhe ação enquanto carrega'); igual(bc.criatura({ lado: 0, pos: 0 })!.golpes[0].pg, golpe('revoada').pg - 1, 'PG gasto uma vez');
  let golpeou = false; for (let i = 0; i < 1; i++) { const c2 = bc.executarTurno([{ lado: 1, pos: 0, acao: G(0) }]); golpeou = tem(c2, 'carga', (x) => !!x.solta); } afirmar(golpeou, '2º turno: desce');
  const sol = duelo([neutra(9001, 40, 'raio-da-clareira')], [neutra(9013, 40, 'encontrao')], { clima: 'sol' }); afirmar(!tem(turno(sol, G(0), G(0)), 'carga'), 'Raio da Clareira não carrega sob sol');
  // recarga
  const br = duelo([neutra(9016, 40, 'mutirao')], [neutra(9013, 60, 'couraca-de-pedra')]); let rec = false; for (let i = 0; i < 6 && !rec; i++) { turno(br, G(0), G(0)); rec = br.vol({ lado: 0, pos: 0 }).recarga; }
  afirmar(rec && br.pedidos().every((p) => p.lado === 1), 'depois do Mutirão não escolhe ação'); afirmar(textos(br.executarTurno([{ lado: 1, pos: 0, acao: G(0) }])).includes('precisa descansar'), 'turno de descanso');
  // troca forçada: treinador troca; selvagem encerra
  const bf = duelo([neutra(9009, 40, 'rodamoinho')], [neutra(9013, 40, 'encontrao'), neutra(9001, 40)]); const ef = turno(bf, G(0), G(0)); afirmar(tem(ef, 'entra', (x) => x.lado === 1 && x.indice === 1), 'arrastou para a reserva');
  const bw = new Batalha({ tipo: 'selvagem', lados: [{ equipe: [neutra(9009, 40, 'rodamoinho')] }, { equipe: [neutra(9013, 10, 'encontrao')] }] }); bw.iniciar(); turno(bw, G(0), G(0)); igual(bw.resultado, 'fuga', 'selvagem espantado encerra a batalha');
  // clima por golpe dura 5 turnos e volta ao da zona; dano de garoa e poeira com imunidades
  const bcl = duelo([neutra(9018, 40, 'garoa-gelada', 'simpatia')], [neutra(9013, 60, 'couraca-de-pedra')], { clima: 'nevoa' }); const e1 = turno(bcl, G(0), G(0));
  igual(bcl.clima, 'garoa', 'clima mudou'); afirmar(tem(e1, 'dano', (x) => x.origem === 'clima' && x.lado === 1) && !tem(e1, 'dano', (x) => x.origem === 'clima' && x.lado === 0), 'garoa fere quem não é Geada');
  for (let i = 0; i < 4; i++) turno(bcl, G(1), G(0)); igual(bcl.clima, 'nevoa', 'depois de 5 turnos volta ao clima da zona');
  const bpo = duelo([neutra(9001, 40, 'berro')], [neutra(9013, 40, 'couraca-de-pedra')], { clima: 'poeira' }); const epo = turno(bpo, G(0), G(0)); afirmar(tem(epo, 'dano', (x) => x.origem === 'clima' && x.lado === 0) && !tem(epo, 'dano', (x) => x.origem === 'clima' && x.lado === 1), 'poeira poupa Terra/Pedra/Ferro');
  // sem PG → Desespero (com recuo), e acerta até Assombro
  const sem = neutra(9003, 30, 'encontrao'); sem.golpes[0].pg = 0; const bd = duelo([sem], [neutra(9011, 30, 'mau-agouro')]); igual(bd.golpesValidos({ lado: 0, pos: 0 }).length, 0, 'sem golpes válidos');
  const ed = turno(bd, G(0), G(0)); afirmar(tem(ed, 'golpe', (x) => x.golpe === 'desespero') && tem(ed, 'dano', (x) => x.lado === 1) && tem(ed, 'dano', (x) => x.origem === 'recuo'), 'Desespero com recuo');
  // PG diminui e golpe fixo
  const bfx = duelo([neutra(9016, 37, 'ira-antiga', 'adivinhacao', 'badalada-da-meia-noite')], [neutra(9013, 60, 'couraca-de-pedra')]);
  afirmar(tem(turno(bfx, G(0), G(0)), 'dano', (x) => x.lado === 1 && x.de - x.para === 40), 'dano fixo 40'); afirmar(tem(turno(bfx, G(1), G(0)), 'dano', (x) => x.lado === 1 && x.de - x.para === 37), 'dano = nível');
  igual(bfx.criatura({ lado: 0, pos: 0 })!.golpes[0].pg, golpe('ira-antiga').pg - 1, 'PG gasto');
});
teste('trocas, itens em batalha, fuga, oferta de troca e frutos segurados', () => {
  rng.seed(10);
  const a1 = neutra(9001, 30, 'berro'), a2 = neutra(9005, 30, 'esguicho'); a1.vida = 5; a1.status = 'envenenado';
  const b = new Batalha({ tipo: 'treinador', lados: [{ equipe: [a1, a2], itens: { garrafada: 1, 'mel-puro': 1, 'cha-guarana': 1, 'elixir-andiroba': 1 }, nome: 'Teste' }, { equipe: [neutra(9013, 8, 'couraca-de-pedra'), neutra(9003, 8, 'cara-feia')], nome: 'Rival' }] }); b.iniciar();
  let ev = turno(b, { tipo: 'item', item: 'garrafada' }, G(0)); afirmar(tem(ev, 'cura', (x) => x.de === 5 && x.para === 55) && b.lados[0].itens.garrafada === undefined, 'Garrafada cura 50 e é gasta');
  ev = turno(b, { tipo: 'item', item: 'mel-puro' }, G(0)); igual(a1.status, null, 'Mel Puro cura veneno');
  ev = turno(b, { tipo: 'item', item: 'cha-guarana' }, G(0)); afirmar(b.lados[0].itens['cha-guarana'] === 1 && textos(ev).includes('não teria efeito'), 'item sem efeito não é gasto');
  ev = turno(b, { tipo: 'troca', para: 1 }, G(0)); afirmar(tem(ev, 'sai', (x) => x.lado === 0) && tem(ev, 'entra', (x) => x.lado === 0 && x.indice === 1), 'troca'); igual(b.criatura({ lado: 0, pos: 0 }), a2, 'ativa trocada');
  a1.vida = 0; ev = turno(b, { tipo: 'item', item: 'cha-guarana', alvo: 0 }, G(0)); igual(a1.vida, Math.floor(atributos(a1).vida / 2), 'Chá de Guaraná reanima com metade');
  ev = turno(b, { tipo: 'fuga' }, G(0)); afirmar(tem(ev, 'fuga', (x) => !x.sucesso) && !b.resultado, 'não se foge de treinador');
  // nocaute → oferta de troca (padrão) → rival entra
  while (b.fase === 'acoes') ev = turno(b, G(0), G(0));
  igual(b.fase, 'substituir', 'rival precisa repor'); ev = b.substituir([{ lado: 1, pos: 0, para: 1 }]);
  igual(b.fase, 'oferta', 'oferta de troca'); afirmar(tem(ev, 'oferta-troca', (x) => x.proxima.especie === 9003), 'mostra a próxima');
  ev = b.responderOferta(0); afirmar(tem(ev, 'entra', (x) => x.lado === 0 && x.indice === 0) && tem(ev, 'entra', (x) => x.lado === 1 && x.indice === 1) && b.fase === 'acoes', 'jogador troca e o rival entra');
  // sem troca grátis (veterano): entra direto
  const bv = duelo([neutra(9016, 50, 'garra-ancestral'), neutra(9001, 50)], [neutra(9014, 3), neutra(9014, 3)]); while (bv.fase === 'acoes') turno(bv, G(0), G(0));
  bv.substituir([{ lado: 1, pos: 0, para: 1 }]); igual(bv.fase, 'acoes', 'sem oferta no modo veterano');
  // fuga de selvagem: sempre com mais velocidade; semFuga bloqueia
  const bs = new Batalha({ tipo: 'selvagem', lados: [{ equipe: [neutra(9007, 30)] }, { equipe: [neutra(9013, 5)] }] }); bs.iniciar(); turno(bs, { tipo: 'fuga' }, G(0)); igual(bs.resultado, 'fuga', 'fuga garantida');
  const bn = new Batalha({ tipo: 'lendario', semFuga: true, lados: [{ equipe: [neutra(9007, 30)] }, { equipe: [neutra(9016, 50)] }] }); bn.iniciar(); turno(bn, { tipo: 'fuga' }, G(3)); igual(bn.resultado, null, 'semFuga'); igual(bn.podeFugir(), false, 'podeFugir');
  // fruto segurado
  const fr = neutra(9001, 30, 'berro'); fr.item = 'pitanga'; const bf = duelo([neutra(9016, 30, 'lume-errante')], [fr]); let comeu = false;
  for (let i = 0; i < 8 && !comeu; i++) comeu = tem(turno(bf, G(0), G(0)), 'item', (x) => x.item === 'pitanga'); afirmar(comeu && fr.status === null && fr.item === undefined, 'Pitanga cura a queimadura sozinha');
});
teste('dupla 2×2: quatro em campo, alvos, golpes em área (×0,75), reposição e fim', () => {
  rng.seed(12);
  const eq = (n: number[], nv: number) => n.map((x) => neutra(x, nv));
  const b = new Batalha({ tipo: 'treinador', dupla: true, lados: [{ equipe: eq([9003, 9005, 9001], 30), nome: 'Teste' }, { equipe: eq([9013, 9011, 9007], 30), nome: 'Rival' }] });
  const ini = b.iniciar(); igual(ini.filter((e) => e.t === 'entra').length, 4, 'quatro entram'); igual(b.pedidos().length, 4, 'quatro pedidos de ação');
  const tr = neutra(9013, 40, 'tremor-de-terra'), al = neutra(9009, 40, 'lufada'), i1 = neutra(9003, 40, 'fagulha'), i2 = neutra(9007, 40, 'choquinho');
  const bd = new Batalha({ tipo: 'treinador', dupla: true, lados: [{ equipe: [tr, al] }, { equipe: [i1, i2] }] }); bd.iniciar();
  const ev = bd.executarTurno(bd.pedidos().map((p) => ({ ...p, acao: p.lado === 0 && p.pos === 1 ? { tipo: 'golpe', slot: 0, alvo: { lado: 1, pos: 1 } } as Acao : G(0) })));
  const g = ev.find((e) => e.t === 'golpe' && e.golpe === 'tremor-de-terra') as Extract<EventoBatalha, { t: 'golpe' }>; afirmar(g && g.alvos.length === 2 && g.alvos.every((x) => x.lado === 1), 'Tremor acerta os dois rivais; a parceira de Vento é imune');
  afirmar(tem(ev, 'errou', (x) => x.motivo === 'imune' && x.alvo.lado === 0), 'aviso de imunidade da parceira');
  afirmar(tem(ev, 'golpe', (x) => x.golpe === 'lufada' && x.alvos[0].pos === 1), 'alvo escolhido respeitado');
  rng.seed(13);
  for (let k = 0; k < 10; k++) { const bt = new Batalha({ tipo: 'treinador', dupla: true, autoAprender: true, lados: [{ equipe: eq([9003, 9005, 9001, 9017], 30) }, { equipe: eq([9013, 9011, 9007], 28) }] }); resolverComIA(bt, ['lider', 'treinador']); afirmar(bt.resultado === 'vitoria' || bt.resultado === 'derrota', 'dupla termina'); }
});

/* ============================== 6. IA e dificuldade ============================== */
teste('dificuldade muda só a qualidade da IA e os recursos — nunca vida ou dano', () => {
  igual(nivelEfetivo('treinador', 'explorador'), 'novato', 'explorador: um abaixo'); igual(nivelEfetivo('treinador', 'aventureiro'), 'treinador', 'aventureiro: igual'); igual(nivelEfetivo('treinador', 'veterano'), 'lider', 'veterano: um acima');
  igual(nivelEfetivo('novato', 'explorador'), 'novato', 'piso'); igual(nivelEfetivo('conselho', 'veterano'), 'conselho', 'teto');
  igual(iaUsaItens('novato', 'veterano'), true, 'veterano: todos usam itens'); igual(iaUsaItens('treinador', 'aventureiro'), false, 'treinador comum não usa'); igual(iaUsaItens('lider', 'aventureiro'), true, 'líder usa'); igual(iaUsaItens('lider', 'explorador'), false, 'explorador rebaixa o líder');
  const t: TreinadorDef = { id: 't', classe: 'Pescador', nome: 'Tião', sprite: 'pescador', equipe: [{ e: 9005, nv: 20 }], ia: 'treinador', desafio: '', derrota: '', premio: 480 };
  const linha = (dif: 'explorador' | 'aventureiro' | 'veterano') => {
    jogo.save = novoSave(); jogo.opcoes.dificuldade = dif; rng.seed(321);
    jogo.save.equipe = [neutra(9001, 20)]; const inim = [neutra(9005, 20)];
    const c = prepararBatalha({ tipo: 'treinador', inimigos: inim, treinador: t, arena: 'teste' });
    return { vidaJ: atributos(jogo.save.equipe[0]).vida, vidaI: atributos(inim[0]).vida, atqI: atributos(inim[0]).atq, nivel: c.nivelIA, gratis: c.b.cfg.trocaGratis, itens: Object.keys(c.b.lados[1].itens).length };
  };
  const e = linha('explorador'), a = linha('aventureiro'), v = linha('veterano');
  afirmar(e.vidaJ === a.vidaJ && a.vidaJ === v.vidaJ && e.vidaI === a.vidaI && a.vidaI === v.vidaI && e.atqI === v.atqI, 'atributos idênticos nas 3 dificuldades');
  igual(e.nivel, 'novato', 'IA no explorador'); igual(a.nivel, 'treinador', 'IA no aventureiro'); igual(v.nivel, 'lider', 'IA no veterano');
  afirmar(a.gratis === true && v.gratis === false, 'veterano sem troca grátis'); afirmar(a.itens === 0 && v.itens === 1, 'veterano: treinador ganha item');
  jogo.opcoes.dificuldade = 'explorador'; jogo.save = novoSave(); jogo.save.equipe = [neutra(9001, 20)]; jogo.save.equipe[0].vida = 1; curarEquipe({ posto: true });
  afirmar(jogo.save.mochila['cha-cidreira'] === 1 && jogo.save.equipe[0].vida === atributos(jogo.save.equipe[0]).vida, 'explorador: +1 item de cura no Posto'); jogo.opcoes.dificuldade = 'aventureiro';
});
teste('IA: escolhas válidas, novato 70/30, treinador prefere super-eficaz, líder usa status e cura, conselho guarda o lendário', () => {
  rng.seed(14);
  // treinador escolhe o golpe de maior dano esperado
  const b = duelo([neutra(9013, 30, 'encontrao')], [neutra(9005, 30, 'encontrao', 'esguicho', 'cara-feia')]);
  for (let i = 0; i < 20; i++) { const a = escolherAcaoIA(b, { lado: 1, pos: 0 }, 'treinador'); afirmar(a.tipo === 'golpe' && a.slot === 1, 'treinador usa o super-eficaz'); }
  let forte = 0; for (let i = 0; i < 1000; i++) { const a = escolherAcaoIA(b, { lado: 1, pos: 0 }, 'novato'); if (a.tipo === 'golpe' && a.slot === 1) forte++; }
  perto(forte / 1000, 0.3 + 0.7 / 3, 0.05, 'novato: 30% o mais forte + 70% ao acaso');
  // treinador troca em desvantagem grave
  let trocou = 0; for (let i = 0; i < 100; i++) { const bt = duelo([neutra(9005, 40, 'enxurrada')], [neutra(9013, 30, 'encontrao'), neutra(9001, 30, 'sorver-seiva')]); bt.lados[0].revelados.set(bt.lados[0].equipe[0].uid, new Set(['enxurrada'])); if (escolherAcaoIA(bt, { lado: 1, pos: 0 }, 'treinador').tipo === 'troca') trocou++; }
  afirmar(trocou > 45 && trocou < 95, 'treinador troca em desvantagem grave (com acaso): ' + trocou);
  // líder: abre com status contra alvo saudável que não cai num golpe; cura com item quando está por um fio
  const bl = duelo([neutra(9013, 50, 'couraca-de-pedra')], [neutra(9011, 30, 'cantiga-de-ninar', 'lambida-fria')]);
  const al = escolherAcaoIA(bl, { lado: 1, pos: 0 }, 'lider'); afirmar(al.tipo === 'golpe' && al.slot === 0, 'líder usa status'); const at = escolherAcaoIA(bl, { lado: 1, pos: 0 }, 'treinador'); afirmar(at.tipo === 'golpe' && at.slot === 1, 'treinador comum só pensa em dano');
  bl.lados[1].itens.garrafada = 1; bl.lados[1].equipe[0].vida = 5; const ai = escolherAcaoIA(bl, { lado: 1, pos: 0 }, 'lider', { usaItens: true }); afirmar(ai.tipo === 'item' && ai.item === 'garrafada', 'líder cura com item');
  afirmar(escolherAcaoIA(bl, { lado: 1, pos: 0 }, 'lider', {}).tipo !== 'item', 'sem permissão não usa item');
  // líder usa clima quando compensa
  const bc = duelo([neutra(9013, 50, 'couraca-de-pedra')], [neutra(9006, 40, 'chuva-de-verao', 'cachoeirada', 'manto-de-geada'), neutra(9005, 40)]); bc.vol({ lado: 0, pos: 0 }).est.def = 6; bc.lados[1].equipe[0].golpes[1].pg = 0;
  const ac = escolherAcaoIA(bc, { lado: 1, pos: 0 }, 'lider'); afirmar(ac.tipo === 'golpe' && ac.slot === 0, 'líder chama a chuva para a equipe de Rio');
  // conselho guarda o lendário para o fim e escolhe nocaute com prioridade quando é mais lento
  rng.seed(15);
  for (let i = 0; i < 12; i++) {
    const eq = [neutra(9003, 50), neutra(9016, 55), neutra(9005, 50), neutra(9001, 50)]; const bt = duelo([neutra(9017, 70, 'martelo')], eq);
    const ordem: number[] = [0]; let guarda = 0;
    while (bt.fase !== 'fim' && guarda++ < 200) {
      if (bt.fase === 'acoes') bt.executarTurno(bt.pedidos().map((p) => ({ ...p, acao: p.lado === 0 ? G(bt.golpesValidos(p)[0] ?? -1) : escolherAcaoIA(bt, p, 'conselho') })));
      else if (bt.fase === 'substituir') { const ev = bt.substituir(bt.pedidos().map((p) => ({ lado: p.lado, pos: p.pos, para: p.lado === 1 ? ((): number => { const x = bt.reservas(1); return x.length > 1 ? x.filter((k) => k !== 1)[0] : x[0]; })() : 0 }))); for (const e of ev) if (e.t === 'entra' && e.lado === 1) ordem.push(e.indice); }
    }
    for (const e of bt.eventos) if (e.t === 'entra' && e.lado === 1 && !ordem.includes(e.indice)) ordem.push(e.indice);
    if (bt.lados[1].vistos.size === 4) { const vistas = bt.eventos.filter((e) => e.t === 'entra' && e.lado === 1).map((e) => (e as { indice: number }).indice); const primeiraDoAs = vistas.indexOf(1); afirmar(new Set(vistas.slice(0, primeiraDoAs)).size === 3, 'o lendário só entra depois das outras três'); }
  }
  const bk = duelo([neutra(9007, 40, 'choquinho')], [neutra(9013, 40, 'tremor-de-terra', 'estilingue')]); bk.lados[0].equipe[0].vida = 3; bk.lados[1].equipe[0].vida = 4; bk.lados[0].revelados.set(bk.lados[0].equipe[0].uid, new Set(['esguicho']));
  const ak = escolherAcaoIA(bk, { lado: 1, pos: 0 }, 'conselho'); afirmar(ak.tipo === 'golpe' && ak.slot === 1, 'conselho, mais lento e ameaçado, nocauteia com prioridade');
});
teste('IA não trapaceia: a decisão independe da ação do jogador e dos dados ocultos do adversário', () => {
  // mesma situação pública, genes/esforço/golpes ocultos diferentes → mesma decisão com a mesma semente
  const decisao = (oculto: boolean) => {
    rng.seed(999);
    const j = neutra(9005, 35, 'esguicho', 'cara-feia'); const r = neutra(9003, 35, 'brasa-viva', 'arranhao', 'cara-feia', 'lume-errante');
    if (oculto) { j.gen = B(8, 15, 15, 15, 15, 8); j.esf = B(0, 252, 0, 252, 0, 0); j.personalidade = 'curiosa'; j.golpes = ['pororoca', 'tremor-de-terra', 'soneca', 'fincar-pe'].map(novoSlot); j.item = 'caju'; }
    const b = duelo([j], [r]); rng.seed(4242);
    return NIVEIS_IA.map((n) => JSON.stringify(escolherAcaoIA(b, { lado: 1, pos: 0 }, n))).join(';');
  };
  igual(decisao(true), decisao(false), 'decisões idênticas');
  igual(escolherAcaoIA.length <= 4, true, 'a IA não recebe a ação do outro lado');
});
teste('qualidade da IA cresce com o nível (equipes espelhadas, 60 batalhas por confronto)', () => {
  const placar = (a: NivelIA, b: NivelIA, semente: number) => {
    let va = 0; rng.seed(semente);
    for (let i = 0; i < 60; i++) {
      const nums = Array.from({ length: 4 }, () => rng.escolha(EXEMPLOS).num), nv = 30 + rng.int(0, 20);
      const eq = () => nums.map((n) => neutra(n, nv)); const troca = i % 2 === 1;
      const bt = new Batalha({ tipo: 'treinador', ganhaExp: false, lados: [{ equipe: eq() }, { equipe: eq() }], trocaGratis: false });
      resolverComIA(bt, troca ? [b, a] : [a, b]); if ((bt.resultado === 'vitoria') !== troca) va++;
    }
    return va;
  };
  const tn = placar('treinador', 'novato', 100), ln = placar('lider', 'novato', 200), cn = placar('conselho', 'novato', 300), ct = placar('conselho', 'treinador', 400);
  console.log(`      vitórias em 60: treinador×novato ${tn} · líder×novato ${ln} · conselho×novato ${cn} · conselho×treinador ${ct}`);
  afirmar(tn >= 36, 'treinador deveria vencer o novato: ' + tn); afirmar(ln >= 38, 'líder deveria vencer o novato: ' + ln); afirmar(cn >= 40, 'conselho deveria vencer o novato: ' + cn); afirmar(ct >= 28, 'conselho não deveria perder feio do treinador: ' + ct);
});

/* ============================== 7. batalhas simuladas ============================== */
const CLIMAS: ClimaId[] = ['limpo', 'limpo', 'sol', 'chuva', 'garoa', 'nevoa', 'poeira'];
function conferirEventos(b: Batalha) {
  const evs = b.eventos; igual(evs[evs.length - 1].t, 'fim', 'último evento é o fim'); igual(evs.filter((e) => e.t === 'fim').length, 1, 'um único fim');
  for (const e of evs) {
    if (e.t === 'dano') afirmar(e.para >= 0 && e.para <= e.de && e.de <= e.max, 'dano coerente: ' + JSON.stringify(e));
    if (e.t === 'cura') afirmar(e.para >= e.de && e.para <= e.max, 'cura coerente: ' + JSON.stringify(e));
    if (e.t === 'estagio') afirmar(e.valor >= -6 && e.valor <= 6, 'estágio no limite');
    if (e.t === 'msg') afirmar(e.texto.length > 0 && !/undefined|NaN|\[object/.test(e.texto), 'mensagem inválida: ' + e.texto);
    if (e.t === 'golpe') afirmar((ANIMS_USADAS as readonly string[]).includes(e.anim), 'animação desconhecida: ' + e.anim);
  }
  for (const l of b.lados) for (const c of l.equipe) { afirmar(c.vida >= 0 && c.vida <= atributos(c).vida && Number.isInteger(c.vida), 'vida final válida'); for (const g of c.golpes) afirmar(g.pg >= 0 && g.pg <= g.pgMax, 'PG válido'); afirmar(c.nivel >= 1 && c.nivel <= 100, 'nível válido'); }
}
teste('80 batalhas IA×IA (1×1 e duplas, 4 níveis de IA, climas, itens) terminam sem exceção', () => {
  rng.seed(20241119);
  const res: Record<string, number> = {}; let turnos = 0, maior = 0, n = 0; const tiposEv = new Set<string>();
  for (let i = 0; i < 80; i++) {
    const tam = () => rng.int(1, 6), nv = rng.int(5, 70);
    const eq = () => Array.from({ length: tam() }, () => cria(rng.escolha(NUMS_BATALHA), Math.max(2, nv + rng.int(-4, 4))));
    const a = eq(), c = eq(); if (i % 9 === 0) a[0].item = 'caju'; if (i % 7 === 0) c[0].item = 'pequi';
    const tipo = i % 5 === 4 ? 'selvagem' : 'treinador';
    const b = new Batalha({ tipo, dupla: i % 4 === 3, clima: rng.escolha(CLIMAS), autoAprender: true, periodo: i % 2 ? 'noite' : 'dia', trocaGratis: i % 3 !== 0,
      lados: [{ equipe: a, itens: { garrafada: 2, 'pomada-copaiba': 1, 'cha-guarana': 1 }, nome: 'A' }, { equipe: tipo === 'selvagem' ? c.slice(0, i % 4 === 3 ? 2 : 1) : c, itens: { 'cha-cidreira': 2, 'elixir-andiroba': 1, unguento: 1 }, nome: 'B' }] });
    resolverComIA(b, [NIVEIS_IA[i % 4], NIVEIS_IA[(i >> 2) % 4]], { opcoes: [{ usaItens: true }, { usaItens: tipo === 'treinador' }] });
    conferirEventos(b); res[b.resultado!] = (res[b.resultado!] ?? 0) + 1; turnos += b.turno; maior = Math.max(maior, b.turno); n++; for (const e of b.eventos) tiposEv.add(e.t);
  }
  console.log(`      ${n} batalhas · resultados ${JSON.stringify(res)} · média ${(turnos / n).toFixed(1)} turnos · maior ${maior} · ${tiposEv.size} tipos de evento`);
  for (const t of ['msg', 'entra', 'sai', 'golpe', 'errou', 'dano', 'cura', 'status', 'estagio', 'desmaio', 'exp', 'nivel', 'item', 'fim']) afirmar(tiposEv.has(t), 'evento nunca emitido: ' + t);
});
teste('cobertura: todos os golpes e todos os tipos de efeito são executados em batalhas com golpes sorteados', () => {
  rng.seed(424242);
  const usados = new Set<string>(); let n = 0;
  const fila = GOLPES.map((g) => g.id);
  for (let i = 0; i < 140; i++) {
    const nv = rng.int(20, 60);
    const eq = () => Array.from({ length: rng.int(3, 5) }, () => { const c = cria(rng.escolha(NUMS_BATALHA), nv); c.golpes = Array.from({ length: 4 }, () => fila[(n++ * 7) % fila.length]).filter((x, k, arr) => arr.indexOf(x) === k).map(novoSlot); return c; });
    const b = new Batalha({ tipo: 'treinador', dupla: i % 3 === 0, clima: rng.escolha(CLIMAS), autoAprender: true, lados: [{ equipe: eq(), nome: 'A' }, { equipe: eq(), nome: 'B' }] });
    resolverComIA(b, [i % 2 ? 'novato' : 'lider', i % 3 ? 'novato' : 'conselho']); conferirEventos(b);
    for (const e of b.eventos) if (e.t === 'golpe' || e.t === 'carga') usados.add(e.golpe);
    for (const [, s] of [...b.lados[0].revelados, ...b.lados[1].revelados]) for (const g of s) usados.add(g);
  }
  const faltam = GOLPES.filter((g) => !usados.has(g.id)).map((g) => g.id);
  console.log(`      ${usados.size - (usados.has('') ? 1 : 0)} de ${GOLPES.length} golpes usados em 140 batalhas`);
  afirmar(faltam.length === 0, 'golpes nunca usados: ' + faltam.join(', '));
});
teste('determinismo: a mesma semente produz exatamente a mesma fila de eventos', () => {
  const rodar = (semente: number) => {
    rng.seed(semente);
    const eq = () => Array.from({ length: 4 }, () => cria(rng.escolha(EXEMPLOS).num, 35));
    const b = new Batalha({ tipo: 'treinador', dupla: semente % 2 === 0, autoAprender: true, lados: [{ equipe: eq(), nome: 'A' }, { equipe: eq(), nome: 'B' }] });
    resolverComIA(b, ['lider', 'conselho']); return JSON.stringify(b.eventos).replace(/"uid":"[^"]*"/g, '');
  };
  for (const s of [1, 2, 3, 4]) igual(rodar(s) === rodar(s), true, 'semente ' + s); afirmar(rodar(1) !== rodar(3), 'sementes diferentes dão batalhas diferentes');
});

/* ============================== 8. interface do contrato ============================== */
teste('iniciarBatalha (headless): aplica experiência, prêmio, Diário, evolução e captura no save', async () => {
  rng.seed(31); forcarPeriodo('dia'); jogo.opcoes.dificuldade = 'aventureiro';
  jogo.save = novoSave(); const meu = neutra(9003, 15, 'brasa-viva', 'arranhao'); meu.exp = expParaNivel('rapido', 16) - 1; jogo.save.equipe = [meu]; jogo.save.jogador.nome = 'Kauê'; jogo.save.jogador.zona = 'A-R1';
  const t: TreinadorDef = { id: 'teste', classe: 'Pescador', nome: 'Tião', sprite: 'pescador', equipe: [{ e: 9001, nv: 5 }, { e: 9014, nv: 4 }], ia: 'novato', desafio: '', derrota: '', premio: 480 };
  const dinheiro = jogo.save.jogador.dinheiro;
  const r = await iniciarBatalha({ tipo: 'treinador', inimigos: t.equipe.map((m) => criarDeMembro(m, t.nome)), treinador: t, arena: 'rota' });
  igual(r.resultado, 'vitoria', 'resultado'); igual(jogo.save.jogador.dinheiro, dinheiro + 480, 'prêmio em patacas');
  afirmar(jogo.save.diario.visto.includes(9001) && jogo.save.diario.visto.includes(9014), 'Diário: vistos'); afirmar(!jogo.save.diario.capturado.includes(9001), 'visto não é capturado');
  igual(meu.especie, 9004, 'evoluiu ao fim da batalha'); afirmar(meu.nivel >= 16 && jogo.save.diario.capturado.includes(9004), 'evolução registrada no Diário');
  // captura com piloto próprio
  jogo.save.mochila = { cuia: 40 }; jogo.save.equipe = [neutra(9016, 40, 'cabeca-fria')]; const selv = cria(9014, 3);
  definirPiloto((c) => { c.iniciar(); let n = 0; while (!c.terminou && n++ < 60) { if (c.fase === 'acoes') c.agir({ tipo: 'item', item: 'cuia' }); else pilotoPadrao(c); } });
  const r2 = await iniciarBatalha({ tipo: 'selvagem', inimigos: [selv], arena: 'grama' }); definirPiloto(null);
  igual(r2.resultado, 'captura', 'captura'); igual(r2.capturada, selv, 'capturada devolvida'); igual(r2.destino, 'equipe', 'foi para a equipe');
  afirmar(jogo.save.equipe.includes(selv) && jogo.save.diario.capturado.includes(9014) && selv.treinadorOriginal === 'Kauê' && selv.localCaptura === 'A-R1' && selv.nivelCaptura === 3, 'dados da captura'); afirmar(jogo.save.mochila.cuia < 40, 'cuias saem da mochila do save');
  // derrota e equipe sem condições
  jogo.save.equipe = [neutra(9014, 2, 'teia-pegajosa')]; const r3 = await iniciarBatalha({ tipo: 'lendario', inimigos: [neutra(9016, 60)], arena: 'pico', semFuga: true }); igual(r3.resultado, 'derrota', 'derrota');
  igual((await iniciarBatalha({ tipo: 'selvagem', inimigos: [neutra(9014, 2)], arena: 'grama' })).resultado, 'derrota', 'equipe desmaiada perde direto');
  curarEquipe(); igual(jogo.save.equipe[0].vida, atributos(jogo.save.equipe[0]).vida, 'curarEquipe');
  // errante foge no 1º turno; dupla de selvagens
  jogo.save.equipe = [neutra(9013, 30)]; igual((await iniciarBatalha({ tipo: 'selvagem', inimigos: [neutra(9007, 30)], arena: 'grama', errante: true })).resultado, 'fuga', 'errante foge');
  jogo.save.equipe = [neutra(9004, 40), neutra(9006, 40)]; igual((await iniciarBatalha({ tipo: 'selvagem', inimigos: [neutra(9014, 6), neutra(9001, 6)], arena: 'pantanal', dupla: true })).resultado, 'vitoria', 'dupla de selvagens');
  forcarPeriodo(null);
});

/* ============================== 9. regras do projeto ============================== */
teste('regras do projeto: sem Math.random e sem palavras proibidas nos arquivos de batalha', () => {
  const arquivos = [...readdirSync(join(RAIZ, 'src/battle')).filter((f) => f.endsWith('.ts')).map((f) => 'src/battle/' + f), 'src/data/golpes.ts', 'src/data/tabela-tipos.ts', 'src/data/itens.ts', 'src/data/personalidades.ts', 'tools/test-batalha.ts'];
  const proibidas = [['Math', 'random'].join('.'), ['TO', 'DO'].join(''), ['FIX', 'ME'].join(''), ['place', 'holder'].join(''), ['lo', 'rem'].join('')];
  for (const a of arquivos) { const txt = readFileSync(join(RAIZ, a), 'utf8'); for (const p of proibidas) afirmar(!(p === proibidas[0] || p === proibidas[1] || p === proibidas[2] ? txt.includes(p) : txt.toLowerCase().includes(p)), `${a} contém "${p}"`); }
  for (const e of EXEMPLOS) { afirmar(temEspecie(e.num), 'exemplo registrado'); for (const [, g] of e.golpes) afirmar(temGolpe(g), `golpe inexistente no exemplo ${e.nome}: ${g}`); }
  void especie;
});

await Promise.all(pendentes);
console.log(`\n${feitos} testes passaram, ${falhas} falharam.\n`);
if (falhas) process.exit(1);
