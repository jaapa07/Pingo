import { venda } from './_a1-grade';

/** Venda do Galho (Bosque Alto): depois da Insígnia do Casulo chegam a Garrafada e a cuia de rede. */
export default venda('A3', 'Bosque Alto', [31, 14], { nome: 'Seu Cambará', fala: 'Bem-vindo à Venda do Galho! Aqui o preço não sobe: quem sobe é o freguês, pela escada.' }, [
  ['!insignia:2', ['cuia', 'cha-cidreira', 'mel-puro', 'unguento', 'fumaca-andiroba', 'corda-de-cipo']],
  ['insignia:2', ['cuia', 'cuia-rede', 'cha-cidreira', 'garrafada', 'mel-puro', 'unguento', 'pomada-copaiba', 'fumaca-andiroba', 'corda-de-cipo']],
], { sprite: 'cl-escoteira', nome: 'Escoteira Bia', fala: ['Corda de Cipó tira a gente de caverna num puxão só.', 'O Mestre Imbuia anda atrás de três rolos para consertar a ponte. Eu é que não empresto os meus.'] });
