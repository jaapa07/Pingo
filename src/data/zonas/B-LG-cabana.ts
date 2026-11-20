import { casa } from './_b2n-lib';

/** Barraco do pescador Joca, na Ilha do Joca (porta em (22, 20) na Lagoa Gelada). Fim da missão da carta (`b2n-carta`). */
export default casa({
  id: 'B-LG-cabana', nome: 'Barraco do Joca', tema: 'serrana', musica: 'agua', arena: 'geada', passo: 14, volta: [22, 21], cidade: 'B-LG',
  canto: 'fogao-lenha', parede: 'rede-pesca',
  estante: ['Anzóis em caixinhas de fósforo, uma lata de minhoca vazia e um retrato de uma menina olhando por uma luneta.'],
  bau: ['Cartas antigas amarradas com linha de pesca. Todas de Planalto Lume. A última tem três meses.'],
  cantoTexto: ['O fogão a lenha mantém o barraco quente. Em cima dele, uma panela de pinhão cozido que nunca acaba.'],
  moradores: [
    { id: 'b-lg-joca', sprite: 'cl-pescador', nome: 'Pescador Joca', dir: 's', script: 'b2n-joca' },
    { id: 'b-lg-gato', sprite: 'c:maracaja-nevado', nome: 'Maracajá do Joca', dir: 'l', fala: ['O Maracajá-Nevado do Joca se espreguiça perto do fogão e finge que você não existe.'] },
  ],
});
