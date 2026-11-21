import type { EspecieDef } from '../../core/tipos';

/**
 * Visitantes 181-182 (seção 6.5 do spec): duas criaturas secretas do pós-jogo, escritas à mão.
 * Ficam FORA das 180 do Diário de Campo (página extra "Visitantes") e são o prêmio de duas missões.
 * Regras de lendário: soma de atributos 580-620, taxaCaptura 3, sem sexo, sem evolução.
 */
export const especies: EspecieDef[] = [
  {
    num: 181, id: 'galo-manao', nome: 'Galo-Manaó', tipos: ['vento', 'rio'],
    base: { vida: 90, atq: 95, def: 80, atqEsp: 120, defEsp: 95, vel: 120 },
    golpes: [[1, 'bicada'], [1, 'esguicho'], [10, 'lufada'], [20, 'redemoinho'], [30, 'golpe-de-asa'], [40, 'jato-de-igarape'], [50, 'chuva-de-penas'], [56, 'pe-de-vento'], [61, 'cachoeirada'], [66, 'vento-a-favor'], [72, 'enxurrada'], [79, 'revoada'], [87, 'ventania'], [95, 'pororoca']],
    pergaminhos: ['pt-02', 'pt-03', 'pt-04', 'pt-06', 'pt-14', 'pt-15', 'pt-16', 'pt-31', 'pt-32', 'pt-33', 'pt-43', 'pt-49'],
    taxaCaptura: 3, expBase: 280, esforco: { atqEsp: 2, vel: 1 }, crescimento: 'lento', femeas: null,
    diario: 'O galo-da-serra vive nas serras ao norte de Manaus, e os machos dançam em arenas no chão da mata com a crista laranja aberta em leque. O Galo-Manaó só dança onde o rio Negro e o Solimões correm lado a lado sem se misturar, e traz uma água em cada metade das penas.',
    altura: 1.1, peso: 14, habitat: 'Ilhota do Encontro das Águas', porte: 'L', lendario: true,
  },
  {
    num: 182, id: 'borealce', nome: 'Borealce', tipos: ['geada', 'encanto'],
    base: { vida: 115, atq: 90, def: 100, atqEsp: 115, defEsp: 110, vel: 70 },
    golpes: [[1, 'encontrao'], [1, 'piscadela'], [10, 'sopro-frio'], [20, 'cabecada'], [30, 'poeira-de-estrela'], [40, 'geada-serrana'], [50, 'manto-de-geada'], [56, 'estaca-de-gelo'], [61, 'luar'], [66, 'vento-minuano'], [72, 'clarao-da-lua'], [79, 'garoa-gelada'], [87, 'friagem'], [95, 'arraial-encantado']],
    pergaminhos: ['pt-01', 'pt-02', 'pt-03', 'pt-04', 'pt-05', 'pt-20', 'pt-21', 'pt-22', 'pt-28', 'pt-36', 'pt-37', 'pt-43', 'pt-49'],
    taxaCaptura: 3, expBase: 290, esforco: { vida: 1, atqEsp: 1, defEsp: 1 }, crescimento: 'lento', femeas: null,
    diario: 'O alce é o maior dos cervos: o macho passa de dois metros no ombro e troca a cada ano a galhada em forma de pá. O Borealce veio do norte com uma expedição de pesquisa, e nas noites frias do Pico a galhada dele acende em verde e violeta, como a aurora boreal.',
    altura: 2.3, peso: 520, habitat: 'Alto do Pico Pingorama, sob a aurora', porte: 'L', lendario: true,
  },
];
