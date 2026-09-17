import type { Product } from './types'

/** Paleta de filamentos que temos habitualmente em stock. */
const filament = {
  laranja: { name: 'Laranja Abóbora', hex: '#c9622a' },
  preto: { name: 'Preto Mate', hex: '#2a2a2e' },
  brancoTrans: { name: 'Branco Translúcido', hex: '#f0ede6' },
  osso: { name: 'Branco Osso', hex: '#e8dfcd' },
  cinza: { name: 'Cinza Pedra', hex: '#8d8b86' },
  roxo: { name: 'Roxo Profundo', hex: '#4b2a52' },
  verde: { name: 'Verde Salva', hex: '#8a9a7b' },
  terracota: { name: 'Terracota', hex: '#b4633f' },
  areia: { name: 'Areia', hex: '#cbb79a' },
  creme: { name: 'Creme', hex: '#eee4d2' },
  teal: { name: 'Azul Petróleo', hex: '#2f5d63' },
  dourado: { name: 'Dourado Velho', hex: '#a8873f' },
}

/**
 * Catalogo de produtos.
 *
 * A primeira imagem de cada produto e a imagem principal (a que aparece nos
 * cartoes). As restantes alimentam o carrossel da pagina do produto.
 */
export const products: Array<Product> = [
  {
    id: 'p-001',
    slug: 'lanterna-jack-sorridente',
    name: 'Lanterna Jack Sorridente',
    categoryId: 'halloween',
    price: 14.5,
    shortDescription:
      'Abóbora de 12 cm com sorriso recortado, feita para uma vela LED.',
    description:
      'O clássico que não falha. A Jack é impressa em vaso espiral, o que deixa a parede fina o suficiente para a luz atravessar as nervuras e criar um brilho quente em toda a peça.\n\nO topo sai para se colocar uma vela LED de chá lá dentro (não incluída, usamos as normais de 37 mm). O pé é ligeiramente alargado para não cair com um encontrão, o que ajuda se houver crianças ou gatos por casa.\n\nImprimimos cada uma em cerca de cinco horas, por isso encomendas grandes para Halloween pedem alguns dias de antecedência.',
    images: [
      {
        src: '/img/jack-abobora-1.png',
        alt: 'Lanterna em forma de abóbora impressa em 3D, laranja mate, com olhos triangulares e sorriso recortado iluminados por dentro',
      },
      {
        src: '/img/jack-abobora-2.png',
        alt: 'Grande plano da lanterna abóbora mostrando as linhas de camada da impressão e a luz âmbar a sair do sorriso',
      },
    ],
    colors: [filament.laranja, filament.brancoTrans, filament.roxo],
    details: [
      { label: 'Altura', value: '12 cm' },
      { label: 'Diâmetro', value: '11 cm' },
      { label: 'Material', value: 'PLA mate' },
      { label: 'Vela', value: 'LED de chá, 37 mm (não incluída)' },
      { label: 'Tempo de impressão', value: 'cerca de 5 h' },
    ],
    featured: true,
    createdAt: '2026-09-02',
  },
  {
    id: 'p-002',
    slug: 'fantasma-boo',
    name: 'Fantasma Boo',
    categoryId: 'halloween',
    price: 9.8,
    shortDescription:
      'Fantasminha translúcido de 10 cm que acende por dentro.',
    description:
      'O Boo é o mais pequeno da colecção e o que mais sai. O filamento branco translúcido faz com que, com uma vela LED dentro, toda a peça fique acesa em vez de só a cara.\n\nA base ondulada é impressa sem suportes, por isso não há marcas de remoção na parte de baixo. Fica bem sozinho numa prateleira, mas a maioria das pessoas leva dois ou três de tamanhos diferentes.',
    images: [
      {
        src: '/img/fantasma-boo-1.png',
        alt: 'Figura de fantasma impressa em 3D, branco translúcido, com olhos ovais e boca pequena, iluminada por dentro',
      },
      {
        src: '/img/fantasma-boo-2.png',
        alt: 'Dois fantasmas impressos em 3D de tamanhos diferentes lado a lado com folhas secas de Outono',
      },
    ],
    colors: [filament.brancoTrans, filament.verde, filament.laranja],
    details: [
      { label: 'Altura', value: '10 cm' },
      { label: 'Material', value: 'PLA translúcido' },
      { label: 'Vela', value: 'LED de chá, 37 mm (não incluída)' },
      { label: 'Conjunto', value: 'Três unidades por 26 €' },
    ],
    featured: true,
    createdAt: '2026-09-05',
  },
  {
    id: 'p-003',
    slug: 'gato-preto-articulado',
    name: 'Gato Preto Articulado',
    categoryId: 'halloween',
    price: 12.4,
    shortDescription:
      'Flexi de 18 cm, sai da impressora já a mexer. Sem colagens.',
    description:
      'Impresso numa só peça, com as articulações já montadas — sai da máquina e mexe-se logo. A cauda tem dezoito segmentos, o que lhe dá aquele movimento de onda que faz as pessoas brincarem com ele durante cinco minutos seguidos.\n\nÉ resistente ao manuseamento normal, mas não é um brinquedo para bebés: as peças pequenas das orelhas partem se forem mordidas. A partir dos três anos, sem problemas.',
    images: [
      {
        src: '/img/gato-preto-1.png',
        alt: 'Gato articulado impresso em 3D em preto mate, sentado com a cauda enrolada, com segmentos visíveis',
      },
      {
        src: '/img/gato-preto-2.png',
        alt: 'O mesmo gato articulado dobrado numa forma ondulada a demonstrar as juntas flexíveis',
      },
    ],
    colors: [filament.preto, filament.roxo, filament.cinza],
    details: [
      { label: 'Comprimento', value: '18 cm' },
      { label: 'Segmentos', value: '32 articulações' },
      { label: 'Material', value: 'PLA mate' },
      { label: 'Montagem', value: 'Nenhuma, imprime-se já articulado' },
      { label: 'Idade', value: 'Recomendado a partir dos 3 anos' },
    ],
    featured: true,
    createdAt: '2026-09-08',
  },
  {
    id: 'p-004',
    slug: 'caveira-low-poly',
    name: 'Caveira Low-Poly',
    categoryId: 'halloween',
    price: 18.9,
    shortDescription:
      'Escultura facetada de 14 cm com base hexagonal.',
    description:
      'Uma caveira reduzida a triângulos. As facetas apanham a luz de maneiras diferentes ao longo do dia, o que a torna mais interessante do que uma réplica realista — e bastante menos macabra, por isso também fica na estante depois do Halloween.\n\nVem com base hexagonal separada, que se pode usar ou não. Em branco osso parece cerâmica; em preto mate parece basalto.',
    images: [
      {
        src: '/img/caveira-lowpoly-1.png',
        alt: 'Escultura de caveira facetada low-poly impressa em 3D em branco osso, sobre base hexagonal',
      },
      {
        src: '/img/caveira-lowpoly-2.png',
        alt: 'Vista de três quartos da caveira low-poly a destacar os planos triangulares e a textura das camadas',
      },
    ],
    colors: [filament.osso, filament.preto, filament.dourado],
    details: [
      { label: 'Altura', value: '14 cm com base' },
      { label: 'Material', value: 'PLA mate' },
      { label: 'Acabamento', value: 'Facetado, sem lixagem' },
      { label: 'Base', value: 'Hexagonal, removível' },
    ],
    featured: false,
    createdAt: '2026-08-28',
  },
  {
    id: 'p-005',
    slug: 'morcegos-de-parede',
    name: 'Morcegos de Parede',
    categoryId: 'halloween',
    price: 11.2,
    shortDescription:
      'Conjunto de três silhuetas em tamanhos diferentes, com fita adesiva.',
    description:
      'Três morcegos planos, de 8, 12 e 16 cm de envergadura, para colar em diagonal na parede ou no vidro. As asas têm um recorte serrilhado que projecta uma sombra bonita quando há luz de lado.\n\nVão com quadrados de fita de dupla face incluídos, do tipo que sai sem levar a pintura atrás. Também se podem pendurar com linha de pesca — há um furo discreto no topo de cada um.',
    images: [
      {
        src: '/img/morcegos-parede-1.png',
        alt: 'Três morcegos de silhueta plana impressos em 3D em preto mate, dispostos em diagonal numa parede clara',
      },
    ],
    colors: [filament.preto, filament.roxo],
    details: [
      { label: 'Envergaduras', value: '8, 12 e 16 cm' },
      { label: 'Conjunto', value: '3 peças' },
      { label: 'Material', value: 'PLA mate' },
      { label: 'Fixação', value: 'Fita dupla face incluída' },
    ],
    featured: false,
    createdAt: '2026-09-10',
  },
  {
    id: 'p-006',
    slug: 'aranha-articulada',
    name: 'Aranha Articulada',
    categoryId: 'halloween',
    price: 16.75,
    shortDescription:
      'Oito patas com juntas a sério, 15 cm de largura. Assusta mesmo.',
    description:
      'Cada uma das oito patas tem quatro segmentos independentes, por isso a aranha fica de pé em qualquer posição que se lhe dê — incluindo pousada na borda de uma prateleira, que é onde costuma causar mais reacção.\n\nO preto tem um brilho roxo subtil quando lhe bate luz directa. Os olhos são impressos em vermelho numa segunda passagem, sem pintura envolvida.',
    images: [
      {
        src: '/img/aranha-articulada-1.png',
        alt: 'Aranha articulada impressa em 3D em preto com brilho roxo, oito patas com segmentos, em posição de caminhada',
      },
    ],
    colors: [filament.preto, filament.roxo],
    details: [
      { label: 'Largura', value: '15 cm com patas abertas' },
      { label: 'Articulações', value: '32, quatro por pata' },
      { label: 'Material', value: 'PLA mate bicolor' },
      { label: 'Montagem', value: 'Nenhuma' },
    ],
    featured: false,
    createdAt: '2026-09-12',
  },
  {
    id: 'p-007',
    slug: 'mao-do-cemiterio',
    name: 'Mão do Cemitério',
    categoryId: 'halloween',
    price: 13.6,
    shortDescription:
      'Porta-velas em forma de mão a sair do chão, 13 cm.',
    description:
      'Uma mão esquelética a emergir da terra, com os dedos curvados para cima a segurar a vela. O acabamento é propositadamente irregular, com um efeito de pedra gasta que esconde as linhas de camada.\n\nO encaixe é para velas de chá padrão. Fica bem num grupo de três, em alturas diferentes, ao longo de uma mesa.',
    images: [
      {
        src: '/img/mao-cemiterio-1.png',
        alt: 'Porta-velas impresso em 3D em forma de mão esquelética cinzenta a sair do chão, a segurar uma vela de chá acesa',
      },
    ],
    colors: [filament.cinza, filament.osso, filament.preto],
    details: [
      { label: 'Altura', value: '13 cm' },
      { label: 'Material', value: 'PLA mate com efeito pedra' },
      { label: 'Vela', value: 'De chá, 37 mm (não incluída)' },
      { label: 'Nota', value: 'Usar apenas velas LED em superfícies de madeira' },
    ],
    featured: false,
    createdAt: '2026-09-14',
  },
  {
    id: 'p-008',
    slug: 'boneco-de-neve-articulado',
    name: 'Boneco de Neve Articulado',
    categoryId: 'natal',
    price: 13.2,
    shortDescription:
      'Flexi de 12 cm com cachecol impresso a duas cores.',
    description:
      'A versão natalícia do nosso flexi. Roda na cintura e nos braços, e o cachecol é impresso em verde salva na mesma peça — não é pintado nem colado.\n\nPassa bem pelo Natal e fica na prateleira o resto do ano sem parecer fora de época.',
    images: [
      {
        src: '/img/boneco-neve-1.png',
        alt: 'Boneco de neve articulado impresso em 3D em branco pérola, com nariz de cenoura laranja e cachecol verde salva',
      },
    ],
    colors: [filament.creme, filament.brancoTrans],
    details: [
      { label: 'Altura', value: '12 cm' },
      { label: 'Material', value: 'PLA mate, três cores' },
      { label: 'Articulações', value: 'Cintura e dois braços' },
    ],
    featured: false,
    createdAt: '2026-09-01',
  },
  {
    id: 'p-009',
    slug: 'estrela-lanterna',
    name: 'Estrela Lanterna',
    categoryId: 'natal',
    price: 21.4,
    shortDescription:
      'Estrela vazada de 15 cm que projecta padrões na parede.',
    description:
      'O recorte geométrico da superfície não é só decorativo: com uma vela LED dentro, a estrela projecta o padrão em toda a parede em volta. Num corredor escuro o efeito é melhor do que na fotografia.\n\nÉ a peça que leva mais tempo a imprimir de todo o catálogo, cerca de nove horas, por isso fazemos séries pequenas.',
    images: [
      {
        src: '/img/estrela-natal-1.png',
        alt: 'Lanterna em forma de estrela impressa em 3D em marfim, com recortes geométricos a projectar luz na parede',
      },
    ],
    colors: [filament.creme, filament.osso, filament.dourado],
    details: [
      { label: 'Largura', value: '15 cm' },
      { label: 'Material', value: 'PLA mate' },
      { label: 'Vela', value: 'LED de chá (não incluída)' },
      { label: 'Tempo de impressão', value: 'cerca de 9 h' },
    ],
    featured: true,
    createdAt: '2026-09-15',
  },
  {
    id: 'p-010',
    slug: 'organizador-favo',
    name: 'Organizador Favo',
    categoryId: 'casa',
    price: 19.5,
    shortDescription:
      'Células hexagonais que encaixam entre si. Começa com cinco.',
    description:
      'Cada célula hexagonal encaixa nas vizinhas por pressão, sem parafusos nem cola, por isso a configuração muda sempre que quiseres. O conjunto base leva cinco células de três alturas diferentes.\n\nCélulas extra saem a 2,80 € cada e podem ser em cores diferentes — fica bem alternar verde salva com areia.',
    images: [
      {
        src: '/img/organizador-hex-1.png',
        alt: 'Organizador de secretária modular com células hexagonais em verde salva e areia, com lápis e tesoura',
      },
    ],
    colors: [filament.verde, filament.areia, filament.preto, filament.terracota],
    details: [
      { label: 'Largura do conjunto', value: 'cerca de 20 cm' },
      { label: 'Conjunto base', value: '5 células, 3 alturas' },
      { label: 'Células extra', value: '2,80 € cada' },
      { label: 'Material', value: 'PETG (mais resistente ao calor)' },
    ],
    featured: true,
    createdAt: '2026-08-20',
  },
  {
    id: 'p-011',
    slug: 'suporte-onda',
    name: 'Suporte Onda',
    categoryId: 'casa',
    price: 8.9,
    shortDescription:
      'Suporte de telemóvel em curva contínua, 10 cm.',
    description:
      'Uma curva única que segura o telemóvel num ângulo de leitura confortável, na vertical ou na horizontal. A ranhura deixa passar o cabo de carregamento pela frente.\n\nA base é pesada para o tamanho, por isso não escorrega quando se toca no ecrã. Funciona com capa posta.',
    images: [
      {
        src: '/img/suporte-telemovel-1.png',
        alt: 'Suporte de telemóvel impresso em 3D em laranja terracota com curva ondulada, com um telemóvel encaixado',
      },
    ],
    colors: [filament.terracota, filament.preto, filament.verde, filament.creme],
    details: [
      { label: 'Altura', value: '10 cm' },
      { label: 'Material', value: 'PLA mate' },
      { label: 'Compatibilidade', value: 'Qualquer telemóvel, com capa' },
      { label: 'Cabo', value: 'Passagem frontal para carregamento' },
    ],
    featured: false,
    createdAt: '2026-08-14',
  },
  {
    id: 'p-012',
    slug: 'vaso-espiral-canelado',
    name: 'Vaso Espiral Canelado',
    categoryId: 'decoracao',
    price: 22.0,
    shortDescription:
      'Vaso de 25 cm impresso numa espiral contínua, sem costura.',
    description:
      'Impresso em modo espiral, o que significa que o bico nunca para: não há costura vertical em nenhum ponto da peça. As nervuras torcidas apanham a luz de lado e mudam de aspecto conforme se anda à volta.\n\nNão é estanque de origem. Para flores naturais, usa-se um tubo de ensaio ou um saco plástico lá dentro — ou então fica com secas, que é como a maioria das pessoas o usa.',
    images: [
      {
        src: '/img/vaso-espiral-1.png',
        alt: 'Vaso alto canelado impresso em 3D em terracota mate, com hastes de erva seca',
      },
    ],
    colors: [filament.terracota, filament.creme, filament.verde, filament.cinza],
    details: [
      { label: 'Altura', value: '25 cm' },
      { label: 'Diâmetro', value: '11 cm' },
      { label: 'Material', value: 'PLA mate' },
      { label: 'Impressão', value: 'Espiral contínua, sem costura' },
      { label: 'Água', value: 'Requer tubo interior para flores naturais' },
    ],
    featured: true,
    createdAt: '2026-08-30',
  },
  {
    id: 'p-013',
    slug: 'placa-de-nome',
    name: 'Placa de Nome',
    categoryId: 'personalizados',
    price: 16.0,
    shortDescription:
      'Placa de porta a duas cores, com o texto que quiseres.',
    description:
      'Escolhes o texto, a cor da moldura e a cor do fundo, e nós imprimimos. As letras são em relevo, impressas numa segunda cor em vez de pintadas, por isso não saem com o tempo.\n\nAté vinte caracteres no preço base. Nomes mais longos ou duas linhas levam mais 3 €. Leva fita de dupla face para colar na porta.',
    images: [
      {
        src: '/img/placa-nome-1.png',
        alt: 'Placa de porta impressa em 3D em creme e azul petróleo, com moldura geométrica em relevo',
      },
    ],
    colors: [filament.creme, filament.teal, filament.terracota, filament.preto],
    details: [
      { label: 'Tamanho', value: '14 x 7 cm' },
      { label: 'Texto', value: 'Até 20 caracteres no preço base' },
      { label: 'Duas linhas', value: '+3 €' },
      { label: 'Material', value: 'PLA mate, duas cores' },
      { label: 'Prazo', value: '3 a 5 dias, por ser feita à medida' },
    ],
    featured: false,
    createdAt: '2026-09-16',
  },
]
