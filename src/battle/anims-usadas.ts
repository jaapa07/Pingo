/**
 * Ids de animação usados pelos golpes de src/data/golpes.ts (campo `anim`). A view (src/battle/anims/) precisa registrar todos.
 * Por tipo — `<tipo>-1` projétil leve · `<tipo>-2` rajada/feixe médio · `<tipo>-3` explosão forte · `<tipo>-4` efeito de ambiente/aura do tipo.
 * Físicos — fisico-1 encontrão · fisico-2 garras/arranhão · fisico-3 mordida/bicada · fisico-4 chute/rasteira · fisico-5 cabeçada/soco
 *           fisico-6 cauda/chicotada · fisico-7 sequência de golpes · fisico-8 carreira pesada/pisoteio.
 * Status — status-1 aumento de atributo (setas para cima) · status-2 redução (setas para baixo) · status-3 cura (brilhos) · status-4 proteção (escudo)
 *          status-5 som/canto (notas e ondas) · status-6 olhar/intimidação · status-7 mudança de clima · status-8 pó/esporos.
 * Extras do motor (não são golpes): ver ANIMS_MOTOR.
 */
export const ANIMS_USADAS = [
  'assombro-1', 'assombro-2', 'assombro-3', 'assombro-4',
  'brasa-1', 'brasa-2', 'brasa-3', 'brasa-4',
  'comum-1', 'comum-2', 'comum-3',
  'encanto-1', 'encanto-2', 'encanto-3', 'encanto-4',
  'ferro-1', 'ferro-2', 'ferro-3', 'ferro-4',
  'fisico-1', 'fisico-2', 'fisico-3', 'fisico-4', 'fisico-5', 'fisico-6', 'fisico-7', 'fisico-8',
  'geada-1', 'geada-2', 'geada-3', 'geada-4',
  'ginga-1', 'ginga-2', 'ginga-3', 'ginga-4',
  'inseto-1', 'inseto-2', 'inseto-3', 'inseto-4',
  'lenda-1', 'lenda-2', 'lenda-3', 'lenda-4',
  'mata-1', 'mata-2', 'mata-3', 'mata-4',
  'mente-1', 'mente-2', 'mente-3', 'mente-4',
  'pedra-1', 'pedra-2', 'pedra-3',
  'rio-1', 'rio-2', 'rio-3', 'rio-4',
  'status-1', 'status-2', 'status-3', 'status-4', 'status-5', 'status-6', 'status-7', 'status-8',
  'terra-1', 'terra-2', 'terra-3', 'terra-4',
  'trovao-1', 'trovao-2', 'trovao-3', 'trovao-4',
  'veneno-1', 'veneno-2', 'veneno-3', 'veneno-4',
  'vento-1', 'vento-2', 'vento-3', 'vento-4',
] as const;
export type AnimId = (typeof ANIMS_USADAS)[number];
/** animações pedidas pelo motor fora de golpes (evento `anim`) */
export const ANIMS_MOTOR = ['confusao-auto', 'status-queimado', 'status-envenenado', 'status-paralisado', 'status-dormindo', 'status-congelado', 'status-encantado', 'clima-garoa', 'clima-poeira', 'semente', 'armadilha', 'espinhos', 'item-cura', 'subir-nivel'] as const;
