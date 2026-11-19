/**
 * GOLPES — 100% autorais, com sabor brasileiro. Dono: time de batalha.
 * Cada linha: g(id, nome, tipo, categoria, poder, precisão (0 = nunca erra), PG, animação, descrição, efeitos, opções).
 * Animações: `<tipo>-1..4` (1 projétil leve · 2 rajada média · 3 explosão forte · 4 efeito de ambiente),
 * `fisico-1..8` e `status-1..8` (legenda em src/battle/anims-usadas.ts).
 */
import type { GolpeDefBase, TipoId, StatusId, ClimaId } from '../core/tipos';

export type StatEst = 'atq' | 'def' | 'atqEsp' | 'defEsp' | 'vel' | 'prec' | 'eva';
export type Efeito =
  /** aplica um status principal (chance em %, padrão 100) */
  | { t: 'status'; s: StatusId; chance?: number }
  /** condição volátil: confuso (2–5 turnos), atordoado (perde a vez neste turno), semente (drena 1/8 por turno) */
  | { t: 'volatil'; v: 'confuso' | 'atordoado' | 'semente'; chance?: number; eu?: boolean }
  /** muda estágio de atributo (−6…+6) do alvo ou do próprio usuário (`eu`) */
  | { t: 'estagio'; s: StatEst; n: number; chance?: number; eu?: boolean }
  /** cura o usuário em % da vida máxima */
  | { t: 'cura'; pct: number }
  /** devolve ao usuário % do dano causado */
  | { t: 'dreno'; pct: number }
  /** o usuário sofre % do dano causado */
  | { t: 'recuo'; pct: number }
  /** acerta de `min` a `max` vezes */
  | { t: 'multi'; min: number; max: number }
  /** chance alta de crítico (1/4) */
  | { t: 'critico' }
  /** aumenta em um nível a chance de crítico do usuário até sair de campo */
  | { t: 'foco' }
  /** muda o clima por 5 turnos */
  | { t: 'clima'; c: ClimaId }
  /** protege de golpes neste turno (falha mais a cada uso seguido) */
  | { t: 'protecao' }
  /** prepara num turno e golpeia no seguinte; `some` = fica fora de alcance enquanto prepara; `semCargaNoClima` dispensa a espera */
  | { t: 'carga'; msg: string; some?: boolean; semCargaNoClima?: ClimaId }
  /** o usuário descansa no turno seguinte */
  | { t: 'recarga' }
  /** dano fixo: número, o nível do usuário ou metade da vida atual do alvo */
  | { t: 'fixo'; v: number | 'nivel' | 'metade' }
  /** obriga o alvo a sair (selvagem: encerra a batalha) */
  | { t: 'trocaForcada' }
  /** prende o alvo por 4–5 turnos (não troca nem foge) com dano de 1/16 por turno */
  | { t: 'armadilha' }
  /** o usuário volta para a cuia depois de golpear (se houver reserva) */
  | { t: 'bateVolta' }
  /** dorme 2 turnos e recupera toda a vida */
  | { t: 'descanso' }
  /** cura o status do usuário (ou da equipe inteira) */
  | { t: 'curaStatus'; equipe?: boolean }
  /** zera os estágios de todos em campo */
  | { t: 'limpaEstagios' }
  /** proteção de equipe por 5 turnos: dano físico ou especial pela metade, ou bloqueio de status */
  | { t: 'barreira'; b: 'fisico' | 'especial' | 'status' }
  /** espalha espinhos no lado adversário: quem entra perde 1/8 da vida (tipo Vento não é afetado) */
  | { t: 'espinhos' }
  /** poder dobrado em certas condições */
  | { t: 'poder'; modo: 'vidaBaixa' | 'alvoFerido' | 'alvoComStatus' | 'revide' | 'climaAtivo' }
  /** só funciona se a condição valer */
  | { t: 'exige'; cond: 'alvoDormindo' }
  /** nunca erra sob este clima */
  | { t: 'certeiroNoClima'; c: ClimaId }
  /** se errar, o usuário se machuca (1/8 da vida máxima) */
  | { t: 'tombo' };

export type AlvoGolpe = 'um' | 'adversarios' | 'todos' | 'proprio' | 'campo';
export interface GolpeDef extends GolpeDefBase {
  efeitos: Efeito[];
  /** quem o golpe atinge (importa nas duplas). Padrão: 'um' adversário. */
  alvo: AlvoGolpe;
}

type Cat = GolpeDefBase['cat'];
interface Op { prioridade?: number; alvo?: AlvoGolpe }
const P: Op = { alvo: 'proprio' }, ADV: Op = { alvo: 'adversarios' }, TDS: Op = { alvo: 'todos' }, CAMPO: Op = { alvo: 'campo' };
const S = (s: StatusId, chance = 100): Efeito => ({ t: 'status', s, chance });
const V = (v: 'confuso' | 'atordoado' | 'semente', chance = 100): Efeito => ({ t: 'volatil', v, chance });
const E = (s: StatEst, n: number, chance = 100): Efeito => ({ t: 'estagio', s, n, chance });
const EU = (s: StatEst, n: number, chance = 100): Efeito => ({ t: 'estagio', s, n, chance, eu: true });
const CRIT: Efeito = { t: 'critico' };
const recuo = (pct: number): Efeito => ({ t: 'recuo', pct });
const dreno = (pct: number): Efeito => ({ t: 'dreno', pct });
const multi = (min: number, max: number): Efeito => ({ t: 'multi', min, max });
const cura = (pct: number): Efeito => ({ t: 'cura', pct });
const dobra = (modo: 'vidaBaixa' | 'alvoFerido' | 'alvoComStatus' | 'revide' | 'climaAtivo'): Efeito => ({ t: 'poder', modo });

function g(id: string, nome: string, tipo: TipoId, cat: Cat, poder: number, precisao: number, pg: number, anim: string, desc: string, efeitos: Efeito[] = [], o: Op = {}): GolpeDef {
  return { id, nome, tipo, cat, poder, precisao, pg, anim, desc, efeitos, alvo: o.alvo ?? 'um', ...(o.prioridade ? { prioridade: o.prioridade } : {}) };
}

export const GOLPES: GolpeDef[] = [
  /* ================================ COMUM ================================ */
  g('encontrao', 'Encontrão', 'comum', 'fisico', 40, 100, 35, 'fisico-1', 'Joga o corpo inteiro contra o alvo.'),
  g('arranhao', 'Arranhão', 'comum', 'fisico', 40, 100, 35, 'fisico-2', 'Risca o alvo com as unhas.'),
  g('patada', 'Patada', 'comum', 'fisico', 55, 100, 25, 'fisico-2', 'Patada seca. Costuma acertar em cheio.', [CRIT]),
  g('dentada', 'Dentada', 'comum', 'fisico', 60, 100, 25, 'fisico-3', 'Morde com vontade. Pode atordoar.', [V('atordoado', 10)]),
  g('cabecada', 'Cabeçada', 'comum', 'fisico', 70, 100, 15, 'fisico-5', 'Baixa a cabeça e acerta de frente. Pode atordoar.', [V('atordoado', 30)]),
  g('bote-ligeiro', 'Bote Ligeiro', 'comum', 'fisico', 40, 100, 30, 'fisico-1', 'Um bote tão rápido que sempre sai na frente.', [], { prioridade: 1 }),
  g('pisoteio', 'Pisoteio', 'comum', 'fisico', 65, 100, 20, 'fisico-8', 'Passa por cima do alvo. Pode atordoar.', [V('atordoado', 30)]),
  g('atropelo', 'Atropelo', 'comum', 'fisico', 90, 85, 15, 'fisico-8', 'Carreira desembestada. Quem usa também se machuca.', [recuo(25)]),
  g('tabefes', 'Tabefes', 'comum', 'fisico', 18, 85, 15, 'fisico-7', 'Uma sequência de 2 a 5 tapas.', [multi(2, 5)]),
  g('rabada', 'Rabada', 'comum', 'fisico', 50, 100, 25, 'fisico-6', 'Chicoteia com a cauda e baixa a Defesa de vez em quando.', [E('def', -1, 20)]),
  g('toca-e-foge', 'Toca e Foge', 'comum', 'fisico', 50, 100, 20, 'fisico-1', 'Acerta e volta correndo para a cuia, dando lugar a uma parceira.', [{ t: 'bateVolta' }]),
  g('dar-o-troco', 'Dar o Troco', 'comum', 'fisico', 60, 100, 10, 'fisico-5', 'Espera a pancada e devolve em dobro se já apanhou no turno.', [dobra('revide')], { prioridade: -1 }),
  g('ultima-cartada', 'Última Cartada', 'comum', 'fisico', 60, 100, 10, 'comum-2', 'Poder dobrado quando quem usa está com menos da metade da vida.', [dobra('vidaBaixa')]),
  g('estrondo', 'Estrondo', 'comum', 'especial', 90, 100, 10, 'comum-3', 'Um barulho de rachar os ouvidos atinge os adversários.', [], ADV),
  g('eco-da-serra', 'Eco da Serra', 'comum', 'especial', 60, 100, 20, 'comum-1', 'Grito que volta das montanhas e acerta o alvo.'),
  g('mutirao', 'Mutirão', 'comum', 'fisico', 150, 90, 5, 'comum-3', 'Força de um mutirão inteiro. Precisa descansar no turno seguinte.', [{ t: 'recarga' }]),
  g('berro', 'Berro', 'comum', 'status', 0, 100, 40, 'status-5', 'Berra alto e baixa o Ataque dos adversários.', [E('atq', -1)], ADV),
  g('cara-feia', 'Cara Feia', 'comum', 'status', 0, 100, 30, 'status-6', 'Encara de cara amarrada e baixa a Defesa do alvo.', [E('def', -1)]),
  g('assobio-agudo', 'Assobio Agudo', 'comum', 'status', 0, 85, 20, 'status-5', 'Assobio que deixa o alvo confuso.', [V('confuso')]),
  g('cantiga-de-ninar', 'Cantiga de Ninar', 'comum', 'status', 0, 60, 15, 'status-5', 'Uma cantiga mansa que faz o alvo dormir.', [S('dormindo')]),
  g('esturro', 'Esturro', 'comum', 'status', 0, 100, 20, 'status-5', 'Urro que espanta o alvo de volta para a cuia. Selvagens fogem.', [{ t: 'trocaForcada' }], { prioridade: -6 }),
  g('espreguicar', 'Espreguiçar', 'comum', 'status', 0, 0, 10, 'status-3', 'Estica o corpo e recupera metade da vida.', [cura(50)], P),
  g('soneca', 'Soneca', 'comum', 'status', 0, 0, 10, 'status-3', 'Dorme por 2 turnos e acorda com a vida cheia.', [{ t: 'descanso' }], P),
  g('fincar-pe', 'Fincar Pé', 'comum', 'status', 0, 0, 10, 'status-4', 'Firma o corpo e não sofre nada neste turno. Falha se repetido.', [{ t: 'protecao' }], { prioridade: 4, alvo: 'proprio' }),
  g('faro-fino', 'Faro Fino', 'comum', 'status', 0, 0, 20, 'status-1', 'Aguça os sentidos: mais Precisão e mais golpes em cheio.', [EU('prec', 1), { t: 'foco' }], P),
  g('grito-de-guerra', 'Grito de Guerra', 'comum', 'status', 0, 0, 20, 'status-1', 'Enche o peito e sobe o Ataque em 2 níveis.', [EU('atq', 2)], P),

  /* ================================ MATA ================================ */
  g('chicote-de-cipo', 'Chicote de Cipó', 'mata', 'fisico', 45, 100, 25, 'mata-1', 'Estala um cipó comprido no alvo.'),
  g('folhas-ao-vento', 'Folhas ao Vento', 'mata', 'especial', 55, 95, 25, 'mata-1', 'Folhas afiadas voam no alvo. Costuma acertar em cheio.', [CRIT]),
  g('chuva-de-sementes', 'Chuva de Sementes', 'mata', 'fisico', 25, 100, 20, 'mata-1', 'Dispara de 2 a 5 sementes duras.', [multi(2, 5)]),
  g('sorver-seiva', 'Sorver Seiva', 'mata', 'especial', 40, 100, 20, 'mata-2', 'Suga a energia do alvo e recupera metade do dano.', [dreno(50)]),
  g('abraco-de-sumauma', 'Abraço de Sumaúma', 'mata', 'especial', 75, 100, 10, 'mata-2', 'Raízes enormes sugam o alvo. Recupera metade do dano.', [dreno(50)]),
  g('laco-de-cipo', 'Laço de Cipó', 'mata', 'fisico', 35, 90, 15, 'mata-2', 'Amarra o alvo por 4 a 5 turnos, apertando aos poucos.', [{ t: 'armadilha' }]),
  g('espinho-de-mandacaru', 'Espinho de Mandacaru', 'mata', 'fisico', 80, 100, 15, 'mata-2', 'Crava um espinho do sertão no alvo.'),
  g('vendaval-de-folhas', 'Vendaval de Folhas', 'mata', 'especial', 90, 100, 15, 'mata-3', 'Um turbilhão de folhas. Pode baixar a Defesa Especial.', [E('defEsp', -1, 10)]),
  g('queda-de-jequitiba', 'Queda de Jequitibá', 'mata', 'fisico', 120, 85, 10, 'mata-3', 'Desaba como uma árvore gigante. Quem usa sofre recuo.', [recuo(33)]),
  g('raio-da-clareira', 'Raio da Clareira', 'mata', 'especial', 120, 100, 10, 'mata-3', 'Junta luz num turno e dispara no outro. Sob sol forte, dispara direto.', [{ t: 'carga', msg: 'está juntando a luz da clareira!', semCargaNoClima: 'sol' }]),
  g('erva-de-passarinho', 'Erva-de-Passarinho', 'mata', 'status', 0, 90, 10, 'mata-4', 'Planta uma parasita no alvo, que perde vida a cada turno para quem usou.', [V('semente')]),
  g('polen-dorminhoco', 'Pólen Dorminhoco', 'mata', 'status', 0, 75, 15, 'status-8', 'Espalha um pólen que faz o alvo dormir.', [S('dormindo')]),
  g('po-de-urtiga', 'Pó de Urtiga', 'mata', 'status', 0, 75, 20, 'status-8', 'Pó que coça e trava o corpo: paralisa o alvo.', [S('paralisado')]),
  g('tapete-de-espinhos', 'Tapete de Espinhos', 'mata', 'status', 0, 0, 20, 'mata-4', 'Cobre o lado adversário de espinhos que ferem quem entrar.', [{ t: 'espinhos' }], CAMPO),
  g('banho-de-sol', 'Banho de Sol', 'mata', 'status', 0, 0, 10, 'mata-4', 'Abre as folhas ao sol e recupera metade da vida.', [cura(50)], P),
  g('floresta-em-flor', 'Floresta em Flor', 'mata', 'status', 0, 0, 15, 'status-1', 'Floresce: recupera um quarto da vida e sobe a Defesa Especial.', [cura(25), EU('defEsp', 1)], P),

  /* ================================ BRASA ================================ */
  g('fagulha', 'Fagulha', 'brasa', 'especial', 40, 100, 25, 'brasa-1', 'Solta uma fagulha. Pode queimar.', [S('queimado', 10)]),
  g('brasa-viva', 'Brasa Viva', 'brasa', 'especial', 60, 100, 20, 'brasa-1', 'Arremessa uma brasa acesa. Pode queimar.', [S('queimado', 20)]),
  g('cinzas-quentes', 'Cinzas Quentes', 'brasa', 'especial', 65, 100, 15, 'brasa-1', 'Cinzas no rosto do alvo. Pode baixar a Precisão.', [E('prec', -1, 30)]),
  g('bafo-quente', 'Bafo Quente', 'brasa', 'especial', 70, 100, 15, 'brasa-2', 'Poder dobrado contra alvos que já têm um status.', [dobra('alvoComStatus')]),
  g('patada-ardente', 'Patada Ardente', 'brasa', 'fisico', 75, 100, 15, 'brasa-2', 'Patada em brasa. Pode queimar.', [S('queimado', 10)]),
  g('pirueta-em-chamas', 'Pirueta em Chamas', 'brasa', 'fisico', 60, 100, 25, 'brasa-2', 'Gira envolto em fogo. Pode queimar.', [S('queimado', 10)]),
  g('labareda', 'Labareda', 'brasa', 'especial', 90, 100, 15, 'brasa-2', 'Uma língua de fogo comprida. Pode queimar.', [S('queimado', 10)]),
  g('queimada', 'Queimada', 'brasa', 'especial', 80, 100, 10, 'brasa-4', 'O fogo corre pelo chão e pega os adversários. Pode queimar.', [S('queimado', 10)], ADV),
  g('fogo-de-coivara', 'Fogo de Coivara', 'brasa', 'especial', 110, 85, 5, 'brasa-3', 'Fogaréu difícil de controlar. Boa chance de queimar.', [S('queimado', 30)]),
  g('carreira-em-chamas', 'Carreira em Chamas', 'brasa', 'fisico', 120, 100, 15, 'brasa-3', 'Corre pegando fogo. Sofre recuo e pode queimar.', [recuo(33), S('queimado', 10)]),
  g('fornalha', 'Fornalha', 'brasa', 'especial', 130, 90, 5, 'brasa-3', 'Calor de fornalha. Depois, o Ataque Especial de quem usa cai 2 níveis.', [EU('atqEsp', -2)]),
  g('lume-errante', 'Lume Errante', 'brasa', 'status', 0, 85, 15, 'brasa-4', 'Uma chama azulada persegue o alvo e o deixa queimado.', [S('queimado')]),
  g('sol-a-pino', 'Sol a Pino', 'brasa', 'status', 0, 0, 5, 'status-7', 'Chama o sol forte por 5 turnos.', [{ t: 'clima', c: 'sol' }], CAMPO),
  g('fogueira-de-sao-joao', 'Fogueira de São João', 'brasa', 'status', 0, 0, 15, 'brasa-4', 'Aquece o corpo na fogueira: sobe Ataque e Velocidade.', [EU('atq', 1), EU('vel', 1)], P),

  /* ================================ RIO ================================ */
  g('esguicho', 'Esguicho', 'rio', 'especial', 40, 100, 25, 'rio-1', 'Esguicha água no alvo.'),
  g('espuma-do-mar', 'Espuma do Mar', 'rio', 'especial', 55, 100, 20, 'rio-1', 'Espuma salgada nos olhos. Pode baixar a Precisão.', [E('prec', -1, 30)]),
  g('bolhas-do-mangue', 'Bolhas do Mangue', 'rio', 'especial', 60, 100, 20, 'rio-1', 'Bolhas pegajosas nos adversários. Podem baixar a Velocidade.', [E('vel', -1, 10)], ADV),
  g('jato-de-igarape', 'Jato de Igarapé', 'rio', 'especial', 65, 100, 20, 'rio-1', 'Jato de água fria. Pode baixar a Velocidade.', [E('vel', -1, 10)]),
  g('rabanada', 'Rabanada', 'rio', 'fisico', 60, 100, 20, 'fisico-6', 'Bate com a cauda molhada.'),
  g('canoa-virada', 'Canoa Virada', 'rio', 'fisico', 70, 100, 15, 'rio-2', 'Poder dobrado contra alvos com menos da metade da vida.', [dobra('alvoFerido')]),
  g('mordida-de-piranha', 'Mordida de Piranha', 'rio', 'fisico', 80, 100, 15, 'fisico-3', 'Dentes de navalha. Pode atordoar.', [V('atordoado', 20)]),
  g('cachoeirada', 'Cachoeirada', 'rio', 'fisico', 80, 100, 15, 'rio-2', 'Despenca como uma queda-d\'água. Pode atordoar.', [V('atordoado', 20)]),
  g('mergulho-fundo', 'Mergulho Fundo', 'rio', 'fisico', 80, 100, 10, 'rio-2', 'Some debaixo d\'água num turno e ataca no outro.', [{ t: 'carga', msg: 'mergulhou fundo!', some: true }]),
  g('enxurrada', 'Enxurrada', 'rio', 'especial', 90, 100, 15, 'rio-3', 'A água desce o morro e arrasta os adversários.', [], ADV),
  g('pororoca', 'Pororoca', 'rio', 'especial', 110, 80, 5, 'rio-3', 'A grande onda do encontro do rio com o mar.'),
  g('tromba-dagua', 'Tromba-d\'Água', 'rio', 'especial', 150, 90, 5, 'rio-3', 'Coluna de água devastadora. Precisa descansar no turno seguinte.', [{ t: 'recarga' }]),
  g('redemoinho', 'Redemoinho', 'rio', 'especial', 35, 85, 15, 'rio-4', 'Prende o alvo num redemoinho por 4 a 5 turnos.', [{ t: 'armadilha' }]),
  g('chuva-de-verao', 'Chuva de Verão', 'rio', 'status', 0, 0, 5, 'status-7', 'Chama a chuva por 5 turnos.', [{ t: 'clima', c: 'chuva' }], CAMPO),
  g('agua-de-cacimba', 'Água de Cacimba', 'rio', 'status', 0, 0, 10, 'rio-4', 'Bebe água fresca e recupera metade da vida.', [cura(50)], P),

  /* ================================ TROVÃO ================================ */
  g('choquinho', 'Choquinho', 'trovao', 'especial', 40, 100, 30, 'trovao-1', 'Um choque pequeno. Pode paralisar.', [S('paralisado', 10)]),
  g('corisco', 'Corisco', 'trovao', 'fisico', 40, 100, 30, 'trovao-1', 'Rápido como um corisco: sempre sai na frente.', [], { prioridade: 1 }),
  g('faisca-dupla', 'Faísca Dupla', 'trovao', 'fisico', 35, 100, 20, 'trovao-1', 'Duas faíscas seguidas.', [multi(2, 2)]),
  g('esbarrao-eletrico', 'Esbarrão Elétrico', 'trovao', 'fisico', 65, 100, 20, 'trovao-1', 'Encosta carregado de eletricidade. Boa chance de paralisar.', [S('paralisado', 30)]),
  g('mordida-eletrica', 'Mordida Elétrica', 'trovao', 'fisico', 65, 95, 15, 'trovao-2', 'Mordida que dá choque. Pode paralisar ou atordoar.', [S('paralisado', 10), V('atordoado', 10)]),
  g('zunido-de-alta-tensao', 'Zunido de Alta Tensão', 'trovao', 'especial', 60, 100, 15, 'trovao-4', 'Zunido de fio elétrico. Pode confundir.', [V('confuso', 30)]),
  g('relampago', 'Relâmpago', 'trovao', 'especial', 90, 100, 15, 'trovao-2', 'Um raio certeiro. Pode paralisar.', [S('paralisado', 10)]),
  g('fio-desencapado', 'Fio Desencapado', 'trovao', 'fisico', 90, 100, 15, 'trovao-2', 'Descarga perigosa até para quem usa.', [recuo(25)]),
  g('tempestade-de-raios', 'Tempestade de Raios', 'trovao', 'especial', 80, 100, 10, 'trovao-3', 'Raios caem sobre os adversários.', [], ADV),
  g('trovoada', 'Trovoada', 'trovao', 'especial', 110, 70, 10, 'trovao-3', 'Raio enorme. Nunca erra na chuva. Boa chance de paralisar.', [S('paralisado', 30), { t: 'certeiroNoClima', c: 'chuva' }]),
  g('curto-circuito', 'Curto-Circuito', 'trovao', 'especial', 130, 90, 5, 'trovao-3', 'Descarrega tudo. O Ataque Especial de quem usa cai 2 níveis.', [EU('atqEsp', -2)]),
  g('choque-de-poraque', 'Choque de Poraquê', 'trovao', 'status', 0, 90, 20, 'trovao-4', 'A descarga do peixe-elétrico paralisa o alvo.', [S('paralisado')]),
  g('dinamo', 'Dínamo', 'trovao', 'status', 0, 0, 20, 'status-1', 'Gira até zunir e sobe a Velocidade em 2 níveis.', [EU('vel', 2)], P),
  g('pelo-arrepiado', 'Pelo Arrepiado', 'trovao', 'status', 0, 0, 20, 'trovao-4', 'A estática arrepia o pelo: sobe Ataque Especial e Velocidade.', [EU('atqEsp', 1), EU('vel', 1)], P),

  /* ================================ GEADA ================================ */
  g('escorregao', 'Escorregão', 'geada', 'fisico', 40, 100, 30, 'geada-1', 'Desliza no gelo e sempre sai na frente.', [], { prioridade: 1 }),
  g('granizo-miudo', 'Granizo Miúdo', 'geada', 'fisico', 25, 100, 30, 'geada-1', 'De 2 a 5 pedrinhas de gelo.', [multi(2, 5)]),
  g('sopro-frio', 'Sopro Frio', 'geada', 'especial', 55, 95, 15, 'geada-1', 'Sopro gelado que sempre baixa a Velocidade do alvo.', [E('vel', -1)]),
  g('geada-serrana', 'Geada Serrana', 'geada', 'especial', 65, 100, 20, 'geada-2', 'A geada da serra cobre os adversários. Pode congelar.', [S('congelado', 10)], ADV),
  g('mordida-gelada', 'Mordida Gelada', 'geada', 'fisico', 65, 95, 15, 'geada-2', 'Presas de gelo. Pode congelar ou atordoar.', [S('congelado', 10), V('atordoado', 10)]),
  g('frio-de-rachar', 'Frio de Rachar', 'geada', 'especial', 70, 90, 10, 'geada-2', 'Poder dobrado contra alvos que já têm um status.', [dobra('alvoComStatus')]),
  g('estaca-de-gelo', 'Estaca de Gelo', 'geada', 'fisico', 85, 90, 10, 'geada-2', 'Crava uma estaca de gelo. Pode atordoar.', [V('atordoado', 30)]),
  g('vento-minuano', 'Vento Minuano', 'geada', 'especial', 90, 100, 10, 'geada-2', 'O vento frio do sul. Pode congelar.', [S('congelado', 10)]),
  g('gelo-que-desaba', 'Gelo que Desaba', 'geada', 'fisico', 60, 100, 10, 'geada-3', 'Age por último; poder dobrado se já apanhou no turno.', [dobra('revide')], { prioridade: -4 }),
  g('friagem', 'Friagem', 'geada', 'especial', 110, 70, 5, 'geada-3', 'Frente fria violenta sobre os adversários. Nunca erra na garoa gelada.', [S('congelado', 10), { t: 'certeiroNoClima', c: 'garoa' }], ADV),
  g('garoa-gelada', 'Garoa Gelada', 'geada', 'status', 0, 0, 5, 'status-7', 'Chama a garoa gelada por 5 turnos.', [{ t: 'clima', c: 'garoa' }], CAMPO),
  g('manto-de-geada', 'Manto de Geada', 'geada', 'status', 0, 0, 15, 'geada-4', 'Cobre-se de geada: sobe Defesa e Defesa Especial.', [EU('def', 1), EU('defEsp', 1)], P),
  g('bafo-de-inverno', 'Bafo de Inverno', 'geada', 'status', 0, 0, 20, 'geada-4', 'Um frio que zera as mudanças de atributo de todos em campo.', [{ t: 'limpaEstagios' }], CAMPO),

  /* ================================ GINGA ================================ */
  g('chapa-de-costas', 'Chapa de Costas', 'ginga', 'fisico', 40, 100, 30, 'fisico-4', 'Coice rápido de costas. Sempre sai na frente.', [], { prioridade: 1 }),
  g('rasteira', 'Rasteira', 'ginga', 'fisico', 50, 100, 25, 'fisico-4', 'Varre as pernas do alvo e baixa a Velocidade dele.', [E('vel', -1)]),
  g('au-giratorio', 'Aú Giratório', 'ginga', 'fisico', 40, 100, 15, 'fisico-7', 'Estrela de capoeira que acerta duas vezes.', [multi(2, 2)]),
  g('meia-lua', 'Meia-Lua', 'ginga', 'fisico', 65, 100, 20, 'ginga-1', 'Chute em arco. Costuma acertar em cheio.', [CRIT]),
  g('queixada', 'Queixada', 'ginga', 'fisico', 70, 100, 15, 'ginga-1', 'Chute no queixo. Pode confundir.', [V('confuso', 20)]),
  g('bencao', 'Bênção', 'ginga', 'fisico', 60, 90, 10, 'ginga-1', 'Empurrão com a sola do pé que manda o alvo de volta para a cuia.', [{ t: 'trocaForcada' }], { prioridade: -6 }),
  g('armada', 'Armada', 'ginga', 'fisico', 80, 100, 15, 'ginga-2', 'Giro completo com a perna estendida.'),
  g('rabo-de-arraia', 'Rabo de Arraia', 'ginga', 'fisico', 90, 100, 10, 'ginga-2', 'Chute giratório rasteiro. Pode baixar a Defesa.', [E('def', -1, 20)]),
  g('martelo', 'Martelo', 'ginga', 'fisico', 100, 90, 10, 'ginga-2', 'Chute lateral que desce como um martelo.'),
  g('roda-de-capoeira', 'Roda de Capoeira', 'ginga', 'fisico', 75, 100, 10, 'ginga-3', 'Gira no meio da roda e acerta os adversários.', [], ADV),
  g('arpao-de-cabeca', 'Arpão de Cabeça', 'ginga', 'fisico', 120, 100, 5, 'fisico-5', 'Mergulha de cabeça no alvo. Sofre recuo.', [recuo(33)]),
  g('voo-do-morcego', 'Voo do Morcego', 'ginga', 'fisico', 130, 90, 10, 'ginga-3', 'Voadora com os dois pés. Se errar, quem usa se machuca.', [{ t: 'tombo' }]),
  g('ginga', 'Ginga', 'ginga', 'status', 0, 0, 20, 'ginga-4', 'Entra no balanço: sobe Ataque e Velocidade.', [EU('atq', 1), EU('vel', 1)], P),
  g('toque-de-berimbau', 'Toque de Berimbau', 'ginga', 'status', 0, 0, 20, 'status-5', 'O berimbau chama para o jogo: sobe o Ataque em 2 níveis.', [EU('atq', 2)], P),
  g('esquiva', 'Esquiva', 'ginga', 'status', 0, 0, 10, 'status-4', 'Desvia de tudo neste turno. Falha se repetida.', [{ t: 'protecao' }], { prioridade: 4, alvo: 'proprio' }),

  /* ================================ VENENO ================================ */
  g('espinho-peconhento', 'Espinho Peçonhento', 'veneno', 'fisico', 35, 100, 30, 'veneno-1', 'Espinho com peçonha. Boa chance de envenenar.', [S('envenenado', 30)]),
  g('cuspe-acido', 'Cuspe Ácido', 'veneno', 'especial', 50, 100, 25, 'veneno-1', 'Cuspe que corrói. Pode baixar a Defesa Especial.', [E('defEsp', -1, 10)]),
  g('presa-dupla', 'Presa Dupla', 'veneno', 'fisico', 40, 100, 20, 'fisico-3', 'Duas mordidas seguidas. Podem envenenar.', [multi(2, 2), S('envenenado', 20)]),
  g('peconha-forte', 'Peçonha Forte', 'veneno', 'especial', 65, 100, 10, 'veneno-2', 'Poder dobrado contra alvos que já têm um status.', [dobra('alvoComStatus')]),
  g('curare', 'Curare', 'veneno', 'fisico', 70, 100, 15, 'veneno-2', 'Veneno de flecha que trava os músculos. Pode paralisar.', [S('paralisado', 20)]),
  g('bote-de-jararaca', 'Bote de Jararaca', 'veneno', 'fisico', 80, 100, 15, 'veneno-2', 'Bote certeiro. Boa chance de envenenar.', [S('envenenado', 30)]),
  g('gas-do-pantano', 'Gás do Pântano', 'veneno', 'especial', 65, 100, 15, 'veneno-4', 'Gás que sobe do brejo e pega os adversários. Pode envenenar.', [S('envenenado', 10)], ADV),
  g('borra-de-timbo', 'Borra de Timbó', 'veneno', 'especial', 90, 100, 10, 'veneno-3', 'Lança o caldo do timbó. Boa chance de envenenar.', [S('envenenado', 30)]),
  g('chorume', 'Chorume', 'veneno', 'especial', 120, 80, 5, 'veneno-3', 'Uma onda imunda. Boa chance de envenenar.', [S('envenenado', 30)]),
  g('leite-de-cururu', 'Leite de Cururu', 'veneno', 'status', 0, 90, 25, 'veneno-4', 'A secreção do sapo-cururu envenena o alvo.', [S('envenenado')]),
  g('fumaca-fedida', 'Fumaça Fedida', 'veneno', 'status', 0, 100, 20, 'status-8', 'Fedor que arde os olhos: baixa a Precisão do alvo.', [E('prec', -1)]),
  g('pele-amarga', 'Pele Amarga', 'veneno', 'status', 0, 0, 20, 'status-1', 'Solta toxinas na pele: sobe a Defesa em 2 níveis.', [EU('def', 2)], P),
  g('purga', 'Purga', 'veneno', 'status', 0, 0, 10, 'status-3', 'Expulsa o que faz mal: cura o próprio status e um quarto da vida.', [{ t: 'curaStatus' }, cura(25)], P),

  /* ================================ TERRA ================================ */
  g('bola-de-barro', 'Bola de Barro', 'terra', 'especial', 55, 95, 15, 'terra-1', 'Barro no rosto do alvo. Pode baixar a Precisão.', [E('prec', -1, 30)]),
  g('tatu-bola', 'Tatu-Bola', 'terra', 'fisico', 30, 90, 20, 'fisico-7', 'Enrola-se e quica de 2 a 5 vezes no alvo.', [multi(2, 5)]),
  g('pisao-de-anta', 'Pisão de Anta', 'terra', 'fisico', 60, 100, 20, 'terra-2', 'Pisão que faz o chão tremer e baixa a Velocidade dos adversários.', [E('vel', -1)], ADV),
  g('casco-pesado', 'Casco Pesado', 'terra', 'fisico', 75, 95, 15, 'terra-2', 'Coice de casco. Costuma acertar em cheio.', [CRIT]),
  g('toca-de-tatu', 'Toca de Tatu', 'terra', 'fisico', 80, 100, 10, 'terra-2', 'Cava num turno e surge debaixo do alvo no outro.', [{ t: 'carga', msg: 'cavou uma toca!', some: true }]),
  g('vocoroca', 'Voçoroca', 'terra', 'fisico', 90, 100, 10, 'terra-3', 'Abre um rasgo no chão sob o alvo.'),
  g('tremor-de-terra', 'Tremor de Terra', 'terra', 'fisico', 100, 100, 10, 'terra-3', 'Sacode o chão e atinge todos em campo, até a parceira.', [], TDS),
  g('desbarrancar', 'Desbarrancar', 'terra', 'fisico', 120, 85, 5, 'terra-3', 'Derruba um barranco inteiro. Sofre recuo.', [recuo(25)]),
  g('areia-movedica', 'Areia Movediça', 'terra', 'especial', 35, 85, 15, 'terra-4', 'Prende o alvo na areia por 4 a 5 turnos.', [{ t: 'armadilha' }]),
  g('jogar-areia', 'Jogar Areia', 'terra', 'status', 0, 100, 15, 'terra-1', 'Areia nos olhos: baixa a Precisão do alvo.', [E('prec', -1)]),
  g('atoleiro', 'Atoleiro', 'terra', 'status', 0, 95, 15, 'terra-4', 'Enche o chão de lama: a Velocidade do alvo cai 2 níveis.', [E('vel', -2)]),
  g('poeirao', 'Poeirão', 'terra', 'status', 0, 0, 5, 'status-7', 'Levanta poeira por 5 turnos.', [{ t: 'clima', c: 'poeira' }], CAMPO),
  g('terra-batida', 'Terra Batida', 'terra', 'status', 0, 0, 20, 'status-1', 'Firma os pés no chão: sobe Ataque e Defesa.', [EU('atq', 1), EU('def', 1)], P),
  g('barro-curativo', 'Barro Curativo', 'terra', 'status', 0, 0, 10, 'status-3', 'Cobre-se de argila medicinal e recupera metade da vida.', [cura(50)], P),

  /* ================================ VENTO ================================ */
  g('lufada', 'Lufada', 'vento', 'especial', 40, 100, 35, 'vento-1', 'Um sopro de vento no alvo.'),
  g('bicada', 'Bicada', 'vento', 'fisico', 35, 100, 35, 'fisico-3', 'Bica o alvo.'),
  g('brisa-da-serra', 'Brisa da Serra', 'vento', 'especial', 60, 100, 20, 'vento-1', 'Vento fresco que passa pelos adversários.', [], ADV),
  g('golpe-de-asa', 'Golpe de Asa', 'vento', 'fisico', 60, 100, 30, 'vento-2', 'Bate com a asa aberta.'),
  g('rasante', 'Rasante', 'vento', 'fisico', 60, 0, 20, 'vento-2', 'Voo rasteiro que nunca erra.'),
  g('pe-de-vento', 'Pé de Vento', 'vento', 'especial', 75, 95, 15, 'vento-2', 'Rajada repentina. Boa chance de atordoar.', [V('atordoado', 30)]),
  g('bico-furador', 'Bico Furador', 'vento', 'fisico', 80, 100, 20, 'fisico-3', 'Bico em broca. Costuma acertar em cheio.', [CRIT]),
  g('revoada', 'Revoada', 'vento', 'fisico', 90, 95, 15, 'vento-3', 'Sobe alto num turno e desce atacando no outro.', [{ t: 'carga', msg: 'voou bem alto!', some: true }]),
  g('ventania', 'Ventania', 'vento', 'especial', 110, 70, 10, 'vento-3', 'Vento de derrubar telhado. Nunca erra na chuva. Pode confundir.', [V('confuso', 30), { t: 'certeiroNoClima', c: 'chuva' }]),
  g('mergulho-de-gaviao', 'Mergulho de Gavião', 'vento', 'fisico', 120, 100, 15, 'vento-3', 'Despenca do céu sobre o alvo. Sofre recuo.', [recuo(33)]),
  g('rodamoinho', 'Rodamoinho', 'vento', 'status', 0, 0, 20, 'vento-4', 'Um rodamoinho carrega o alvo de volta para a cuia. Selvagens fogem.', [{ t: 'trocaForcada' }], { prioridade: -6 }),
  g('chuva-de-penas', 'Chuva de Penas', 'vento', 'status', 0, 100, 15, 'status-2', 'Cobre o alvo de penas: o Ataque dele cai 2 níveis.', [E('atq', -2)]),
  g('vento-a-favor', 'Vento a Favor', 'vento', 'status', 0, 0, 15, 'vento-4', 'Com o vento nas costas, a Velocidade sobe 2 níveis.', [EU('vel', 2)], P),
  g('pouso-no-galho', 'Pouso no Galho', 'vento', 'status', 0, 0, 10, 'status-3', 'Pousa para descansar e recupera metade da vida.', [cura(50)], P),

  /* ================================ MENTE ================================ */
  g('intuicao', 'Intuição', 'mente', 'especial', 50, 100, 25, 'mente-1', 'Um palpite que acerta. Pode confundir.', [V('confuso', 10)]),
  g('adivinhacao', 'Adivinhação', 'mente', 'especial', 1, 100, 15, 'mente-1', 'Causa dano igual ao nível de quem usa.', [{ t: 'fixo', v: 'nivel' }]),
  g('pressentimento', 'Pressentimento', 'mente', 'especial', 65, 100, 20, 'mente-1', 'Onda de pensamento. Pode baixar a Defesa Especial.', [E('defEsp', -1, 10)]),
  g('onda-mental', 'Onda Mental', 'mente', 'especial', 70, 100, 15, 'mente-3', 'O pensamento se espalha e atinge os adversários.', [], ADV),
  g('dor-de-cabeca', 'Dor de Cabeça', 'mente', 'especial', 80, 100, 15, 'mente-2', 'Uma pontada na cabeça do alvo. Pode atordoar.', [V('atordoado', 20)]),
  g('cabecada-certeira', 'Cabeçada Certeira', 'mente', 'fisico', 80, 90, 15, 'mente-2', 'Cabeçada com toda a concentração. Boa chance de atordoar.', [V('atordoado', 30)]),
  g('forca-do-pensamento', 'Força do Pensamento', 'mente', 'especial', 90, 100, 10, 'mente-2', 'Ergue o alvo só com a mente. Pode baixar a Defesa Especial.', [E('defEsp', -1, 10)]),
  g('premonicao', 'Premonição', 'mente', 'especial', 120, 100, 10, 'mente-3', 'Concentra-se num turno e acerta o que previu no outro.', [{ t: 'carga', msg: 'fechou os olhos e se concentrou!' }]),
  g('olho-de-coruja', 'Olho de Coruja', 'mente', 'status', 0, 60, 20, 'mente-4', 'Olhar fixo que faz o alvo dormir.', [S('dormindo')]),
  g('cisma', 'Cisma', 'mente', 'status', 0, 100, 10, 'mente-4', 'Enche a cabeça do alvo de dúvidas: fica confuso.', [V('confuso')]),
  g('matutar', 'Matutar', 'mente', 'status', 0, 0, 20, 'status-1', 'Pensa com calma e sobe o Ataque Especial em 2 níveis.', [EU('atqEsp', 2)], P),
  g('cabeca-fria', 'Cabeça Fria', 'mente', 'status', 0, 0, 20, 'status-1', 'Acalma a mente: sobe Ataque Especial e Defesa Especial.', [EU('atqEsp', 1), EU('defEsp', 1)], P),
  g('muro-invisivel', 'Muro Invisível', 'mente', 'status', 0, 0, 20, 'mente-4', 'Por 5 turnos, a equipe sofre metade do dano físico.', [{ t: 'barreira', b: 'fisico' }], CAMPO),
  g('cortina-de-brilho', 'Cortina de Brilho', 'mente', 'status', 0, 0, 20, 'mente-4', 'Por 5 turnos, a equipe sofre metade do dano especial.', [{ t: 'barreira', b: 'especial' }], CAMPO),

  /* ================================ INSETO ================================ */
  g('ferroada', 'Ferroada', 'inseto', 'fisico', 45, 100, 30, 'inseto-1', 'Ferrão certeiro. Pode envenenar.', [S('envenenado', 20)]),
  g('ferrao-duplo', 'Ferrão Duplo', 'inseto', 'fisico', 30, 100, 20, 'inseto-1', 'Duas ferroadas seguidas. Podem envenenar.', [multi(2, 2), S('envenenado', 20)]),
  g('nuvem-de-mosquitos', 'Nuvem de Mosquitos', 'inseto', 'especial', 20, 100, 20, 'inseto-1', 'De 2 a 5 ondas de mosquitos.', [multi(2, 5)]),
  g('formigueiro', 'Formigueiro', 'inseto', 'fisico', 40, 100, 15, 'inseto-4', 'Formigas sobem no alvo e o prendem por 4 a 5 turnos.', [{ t: 'armadilha' }]),
  g('mordida-de-sauva', 'Mordida de Saúva', 'inseto', 'fisico', 60, 100, 20, 'inseto-2', 'Mandíbulas de tesoura. Costuma acertar em cheio.', [CRIT]),
  g('voo-de-mamangava', 'Voo de Mamangava', 'inseto', 'fisico', 70, 100, 20, 'inseto-2', 'Acerta num zigue-zague e volta para a cuia.', [{ t: 'bateVolta' }]),
  g('zumbido', 'Zumbido', 'inseto', 'especial', 75, 100, 15, 'inseto-2', 'Zumbido insuportável. Pode confundir.', [V('confuso', 10)]),
  g('sanguessuga', 'Sanguessuga', 'inseto', 'fisico', 80, 100, 10, 'inseto-2', 'Gruda no alvo e recupera metade do dano.', [dreno(50)]),
  g('enxame', 'Enxame', 'inseto', 'especial', 90, 100, 10, 'inseto-3', 'Um enxame inteiro. Pode baixar a Defesa Especial.', [E('defEsp', -1, 10)]),
  g('chifrada-de-besouro', 'Chifrada de Besouro', 'inseto', 'fisico', 120, 85, 10, 'inseto-3', 'Levanta o alvo com o chifre e arremessa longe.'),
  g('teia-pegajosa', 'Teia Pegajosa', 'inseto', 'status', 0, 95, 20, 'inseto-4', 'Teia que gruda: a Velocidade dos adversários cai 2 níveis.', [E('vel', -2)], ADV),
  g('casulo', 'Casulo', 'inseto', 'status', 0, 0, 20, 'status-1', 'Fecha-se num casulo: a Defesa sobe 2 níveis.', [EU('def', 2)], P),
  g('danca-do-vaga-lume', 'Dança do Vaga-Lume', 'inseto', 'status', 0, 0, 10, 'inseto-4', 'Dança de luzes: sobe Ataque Especial, Defesa Especial e Velocidade.', [EU('atqEsp', 1), EU('defEsp', 1), EU('vel', 1)], P),
  g('mel-de-jatai', 'Mel de Jataí', 'inseto', 'status', 0, 0, 10, 'status-3', 'Prova um mel raro e recupera metade da vida.', [cura(50)], P),

  /* ================================ PEDRA ================================ */
  g('estilingue', 'Estilingue', 'pedra', 'fisico', 40, 100, 30, 'pedra-1', 'Pedrinha disparada tão rápido que sempre sai na frente.', [], { prioridade: 1 }),
  g('pedrada', 'Pedrada', 'pedra', 'fisico', 50, 90, 15, 'pedra-1', 'Atira uma pedra no alvo.'),
  g('chuva-de-cascalho', 'Chuva de Cascalho', 'pedra', 'fisico', 25, 90, 10, 'pedra-1', 'De 2 a 5 punhados de cascalho.', [multi(2, 5)]),
  g('brilho-de-cristal', 'Brilho de Cristal', 'pedra', 'especial', 60, 100, 20, 'pedra-2', 'Reflexo de cristal que ofusca. Pode baixar a Precisão.', [E('prec', -1, 20)]),
  g('soterrar', 'Soterrar', 'pedra', 'fisico', 60, 95, 15, 'pedra-2', 'Cobre o alvo de pedras e baixa a Velocidade dele.', [E('vel', -1)]),
  g('lasca-afiada', 'Lasca Afiada', 'pedra', 'fisico', 70, 100, 15, 'pedra-2', 'Lasca de pedra cortante. Costuma acertar em cheio.', [CRIT]),
  g('pedra-preciosa', 'Pedra Preciosa', 'pedra', 'especial', 80, 100, 20, 'pedra-2', 'Dispara a luz de uma gema da chapada.'),
  g('deslizamento', 'Deslizamento', 'pedra', 'fisico', 75, 90, 10, 'pedra-3', 'Pedras rolam sobre os adversários. Boa chance de atordoar.', [V('atordoado', 30)], ADV),
  g('pedregulho-rolante', 'Pedregulho Rolante', 'pedra', 'fisico', 100, 80, 5, 'pedra-3', 'Empurra um pedregulho ladeira abaixo.'),
  g('peso-da-serra', 'Peso da Serra', 'pedra', 'fisico', 120, 100, 5, 'pedra-3', 'Ergue um rochedo num turno e arremessa no outro.', [{ t: 'carga', msg: 'ergueu um rochedo!' }]),
  g('cabeca-dura', 'Cabeça Dura', 'pedra', 'fisico', 150, 80, 5, 'pedra-3', 'Cabeçada de quebrar rocha. O recuo é enorme.', [recuo(50)]),
  g('polir-casco', 'Polir Casco', 'pedra', 'status', 0, 0, 20, 'status-1', 'Alisa o corpo para cortar o ar: Velocidade sobe 2 níveis.', [EU('vel', 2)], P),
  g('couraca-de-pedra', 'Couraça de Pedra', 'pedra', 'status', 0, 0, 15, 'status-4', 'Veste-se de pedra: sobe a Defesa e recupera um quarto da vida.', [EU('def', 1), cura(25)], P),

  /* ================================ ASSOMBRO ================================ */
  g('susto', 'Susto', 'assombro', 'fisico', 40, 100, 15, 'assombro-1', 'Aparece de repente e sempre sai na frente.', [], { prioridade: 1 }),
  g('lambida-fria', 'Lambida Fria', 'assombro', 'fisico', 30, 100, 30, 'assombro-1', 'Lambida de dar arrepio. Boa chance de paralisar.', [S('paralisado', 30)]),
  g('corrente-arrastada', 'Corrente Arrastada', 'assombro', 'fisico', 35, 90, 15, 'assombro-4', 'Correntes prendem o alvo por 4 a 5 turnos.', [{ t: 'armadilha' }]),
  g('assombracao', 'Assombração', 'assombro', 'especial', 65, 100, 10, 'assombro-2', 'Poder dobrado contra alvos que já têm um status.', [dobra('alvoComStatus')]),
  g('sombra-rasteira', 'Sombra Rasteira', 'assombro', 'fisico', 70, 100, 15, 'assombro-2', 'Ataca pela sombra do alvo. Costuma acertar em cheio.', [CRIT]),
  g('bola-de-breu', 'Bola de Breu', 'assombro', 'especial', 80, 100, 15, 'assombro-2', 'Esfera de escuridão. Pode baixar a Defesa Especial.', [E('defEsp', -1, 20)]),
  g('sumico', 'Sumiço', 'assombro', 'fisico', 90, 100, 10, 'assombro-3', 'Desaparece num turno e ataca do nada no outro.', [{ t: 'carga', msg: 'sumiu sem deixar rastro!', some: true }]),
  g('sonho-ruim', 'Sonho Ruim', 'assombro', 'especial', 100, 100, 15, 'assombro-3', 'Só funciona em quem dorme. Recupera metade do dano.', [{ t: 'exige', cond: 'alvoDormindo' }, dreno(50)]),
  g('rasga-mortalha', 'Rasga-Mortalha', 'assombro', 'especial', 110, 85, 5, 'assombro-3', 'O grito da coruja da meia-noite. Pode baixar a Defesa Especial.', [E('defEsp', -1, 20)]),
  g('noite-sem-lua', 'Noite sem Lua', 'assombro', 'especial', 1, 100, 15, 'assombro-3', 'Causa dano igual ao nível de quem usa.', [{ t: 'fixo', v: 'nivel' }]),
  g('badalada-da-meia-noite', 'Badalada da Meia-Noite', 'assombro', 'especial', 1, 90, 10, 'assombro-3', 'Tira metade da vida atual do alvo.', [{ t: 'fixo', v: 'metade' }]),
  g('luz-de-lamparina', 'Luz de Lamparina', 'assombro', 'status', 0, 100, 10, 'assombro-4', 'Uma luzinha dançante deixa o alvo confuso.', [V('confuso')]),
  g('mau-agouro', 'Mau Agouro', 'assombro', 'status', 0, 100, 15, 'status-6', 'Um mau presságio baixa Ataque e Ataque Especial do alvo.', [E('atq', -1), E('atqEsp', -1)]),
  g('nevoeiro', 'Nevoeiro', 'assombro', 'status', 0, 0, 5, 'status-7', 'Cobre o campo de névoa por 5 turnos.', [{ t: 'clima', c: 'nevoa' }], CAMPO),

  /* ================================ LENDA ================================ */
  g('ira-antiga', 'Ira Antiga', 'lenda', 'especial', 1, 100, 10, 'lenda-1', 'Uma raiva de outros tempos: causa sempre 40 de dano.', [{ t: 'fixo', v: 40 }]),
  g('bote-duplo', 'Bote Duplo', 'lenda', 'fisico', 40, 100, 15, 'lenda-1', 'Dois botes seguidos.', [multi(2, 2)]),
  g('sopro-ancestral', 'Sopro Ancestral', 'lenda', 'especial', 60, 100, 20, 'lenda-1', 'Sopro das criaturas antigas. Boa chance de paralisar.', [S('paralisado', 30)]),
  g('cauda-de-boiuna', 'Cauda de Boiúna', 'lenda', 'fisico', 60, 90, 10, 'lenda-2', 'Rabada da cobra-grande que manda o alvo de volta para a cuia.', [{ t: 'trocaForcada' }], { prioridade: -6 }),
  g('garra-ancestral', 'Garra Ancestral', 'lenda', 'fisico', 80, 100, 15, 'lenda-2', 'Garras de uma linhagem antiga.'),
  g('pulso-das-eras', 'Pulso das Eras', 'lenda', 'especial', 85, 100, 10, 'lenda-2', 'Uma onda que vem do começo do mundo.'),
  g('voo-do-guardiao', 'Voo do Guardião', 'lenda', 'fisico', 100, 100, 10, 'lenda-3', 'Sobe além das nuvens num turno e desce no outro.', [{ t: 'carga', msg: 'subiu além das nuvens!', some: true }]),
  g('furia-lendaria', 'Fúria Lendária', 'lenda', 'fisico', 120, 100, 10, 'lenda-3', 'Ataca com fúria cega e fica confuso depois.', [{ t: 'volatil', v: 'confuso', eu: true }]),
  g('estrela-cadente', 'Estrela Cadente', 'lenda', 'especial', 130, 90, 5, 'lenda-3', 'Chama uma estrela do céu. O Ataque Especial de quem usa cai 2 níveis.', [EU('atqEsp', -2)]),
  g('juizo-da-floresta', 'Juízo da Floresta', 'lenda', 'especial', 150, 90, 5, 'lenda-3', 'A floresta inteira julga o alvo. Precisa descansar no turno seguinte.', [{ t: 'recarga' }]),
  g('danca-ancestral', 'Dança Ancestral', 'lenda', 'status', 0, 0, 20, 'lenda-4', 'Dança dos primeiros tempos: sobe Ataque e Velocidade.', [EU('atq', 1), EU('vel', 1)], P),
  g('escama-sagrada', 'Escama Sagrada', 'lenda', 'status', 0, 0, 20, 'lenda-4', 'Escamas que brilham: a Defesa Especial sobe 2 níveis.', [EU('defEsp', 2)], P),
  g('chamado-antigo', 'Chamado Antigo', 'lenda', 'status', 0, 0, 15, 'lenda-4', 'Ouve os ancestrais: sobe o Ataque Especial e a chance de golpe em cheio.', [EU('atqEsp', 1), { t: 'foco' }], P),

  /* ================================ FERRO ================================ */
  g('unha-de-aco', 'Unha de Aço', 'ferro', 'fisico', 50, 95, 35, 'ferro-1', 'Garras de metal. Pode subir o próprio Ataque.', [EU('atq', 1, 10)]),
  g('chuva-de-pregos', 'Chuva de Pregos', 'ferro', 'fisico', 20, 100, 20, 'ferro-1', 'De 2 a 5 punhados de pregos.', [multi(2, 5)]),
  g('engrenagem-girante', 'Engrenagem Girante', 'ferro', 'fisico', 50, 85, 15, 'ferro-1', 'Duas engrenagens acertam em sequência.', [multi(2, 2)]),
  g('piao-de-ferro', 'Pião de Ferro', 'ferro', 'fisico', 60, 100, 15, 'ferro-2', 'Gira como um pião. Pode subir a própria Defesa.', [EU('def', 1, 30)]),
  g('reflexo-de-lata', 'Reflexo de Lata', 'ferro', 'especial', 80, 100, 10, 'ferro-2', 'Luz refletida no metal. Pode baixar a Defesa Especial.', [E('defEsp', -1, 10)]),
  g('bigornada', 'Bigornada', 'ferro', 'fisico', 80, 100, 15, 'ferro-2', 'Pancada com peso de bigorna. Boa chance de atordoar.', [V('atordoado', 30)]),
  g('marretada', 'Marretada', 'ferro', 'fisico', 90, 90, 10, 'ferro-3', 'Marreta pesada. A Velocidade de quem usa cai.', [EU('vel', -1)]),
  g('rabo-de-corrente', 'Rabo de Corrente', 'ferro', 'fisico', 100, 75, 15, 'ferro-2', 'Corrente de ferro girando. Boa chance de baixar a Defesa.', [E('def', -1, 30)]),
  g('locomotiva', 'Locomotiva', 'ferro', 'fisico', 120, 100, 10, 'ferro-3', 'Avança como um trem sem freio. Sofre recuo.', [recuo(33)]),
  g('canhao-de-sucata', 'Canhão de Sucata', 'ferro', 'especial', 140, 90, 5, 'ferro-3', 'Dispara tudo o que tem. Precisa descansar no turno seguinte.', [{ t: 'recarga' }]),
  g('apito-de-trem', 'Apito de Trem', 'ferro', 'status', 0, 85, 20, 'status-5', 'Apito estridente: a Defesa Especial do alvo cai 2 níveis.', [E('defEsp', -2)]),
  g('amolar-garras', 'Amolar Garras', 'ferro', 'status', 0, 0, 15, 'status-1', 'Afia as garras: sobe Ataque e Precisão.', [EU('atq', 1), EU('prec', 1)], P),
  g('blindagem', 'Blindagem', 'ferro', 'status', 0, 0, 15, 'ferro-4', 'Fecha as placas de metal: a Defesa sobe 2 níveis.', [EU('def', 2)], P),

  /* ================================ ENCANTO ================================ */
  g('piscadela', 'Piscadela', 'encanto', 'especial', 40, 100, 30, 'encanto-1', 'Uma piscada marota. Pode deixar o alvo encantado.', [S('encantado', 10)]),
  g('poeira-de-estrela', 'Poeira de Estrela', 'encanto', 'especial', 60, 100, 20, 'encanto-1', 'Poeira brilhante cai sobre os adversários.', [], ADV),
  g('estrela-guia', 'Estrela-Guia', 'encanto', 'especial', 60, 0, 20, 'encanto-1', 'Uma estrelinha que segue o alvo e nunca erra.'),
  g('beijo-de-beija-flor', 'Beijo de Beija-Flor', 'encanto', 'especial', 50, 100, 10, 'encanto-2', 'Rouba a energia do alvo como néctar. Recupera 75% do dano.', [dreno(75)]),
  g('canto-da-iara', 'Canto da Iara', 'encanto', 'especial', 80, 100, 15, 'encanto-2', 'Canto das águas. Pode deixar o alvo encantado.', [S('encantado', 20)]),
  g('ciranda', 'Ciranda', 'encanto', 'especial', 80, 100, 10, 'encanto-3', 'Uma roda de luz gira em volta dos adversários.', [], ADV),
  g('clarao-da-lua', 'Clarão da Lua', 'encanto', 'especial', 95, 100, 10, 'encanto-3', 'A luz da lua cheia. Pode baixar o Ataque Especial do alvo.', [E('atqEsp', -1, 30)]),
  g('arraial-encantado', 'Arraial Encantado', 'encanto', 'especial', 120, 85, 5, 'encanto-3', 'Fogos e bandeirinhas mágicas. Pode deixar o alvo encantado.', [S('encantado', 10)]),
  g('canto-do-uirapuru', 'Canto do Uirapuru', 'encanto', 'status', 0, 85, 15, 'encanto-4', 'O canto mais raro da mata deixa o alvo encantado: ele passa a imitar golpes.', [S('encantado')]),
  g('cafune', 'Cafuné', 'encanto', 'status', 0, 100, 20, 'status-2', 'Um carinho que amolece: baixa Ataque e Defesa do alvo.', [E('atq', -1), E('def', -1)]),
  g('charme-do-boto', 'Charme do Boto', 'encanto', 'status', 0, 100, 20, 'status-6', 'Olhar galante: o Ataque Especial do alvo cai 2 níveis.', [E('atqEsp', -2)]),
  g('luar', 'Luar', 'encanto', 'status', 0, 0, 10, 'encanto-4', 'Banha-se na luz da lua e recupera metade da vida.', [cura(50)], P),
  g('serenata', 'Serenata', 'encanto', 'status', 0, 0, 5, 'status-5', 'Uma canção que cura os status de toda a equipe.', [{ t: 'curaStatus', equipe: true }], P),
  g('simpatia', 'Simpatia', 'encanto', 'status', 0, 0, 20, 'status-4', 'Uma simpatia das antigas protege a equipe de status por 5 turnos.', [{ t: 'barreira', b: 'status' }], CAMPO),
];

/** Usado automaticamente quando todos os golpes ficam sem PG. Não é aprendido por nenhuma espécie. */
export const DESESPERO: GolpeDef = g('desespero', 'Desespero', 'comum', 'fisico', 50, 0, 1, 'fisico-1', 'Sem PG, a criatura se debate. Quem usa também se machuca.', [recuo(25)]);

const mapa = new Map<string, GolpeDef>(GOLPES.map((x) => [x.id, x]));
mapa.set(DESESPERO.id, DESESPERO);
/** Busca um golpe pelo id (erro se não existir). */
export function golpe(id: string): GolpeDef { const x = mapa.get(id); if (!x) throw new Error('golpe desconhecido: ' + id); return x; }
export const temGolpe = (id: string) => mapa.has(id);
