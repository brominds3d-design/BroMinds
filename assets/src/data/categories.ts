import type { Category } from './types'

/**
 * Categorias do catalogo.
 *
 * Adicionar uma categoria nova e apenas acrescentar um objecto a esta lista:
 * o catalogo, a navegacao, a pagina /categorias e os filtros passam a
 * mostra-la automaticamente. Uma categoria sem produtos aparece com o seu
 * proprio estado vazio, por isso pode ser criada antes de existirem pecas.
 */
export const categories: Array<Category> = [
  {
    id: 'halloween',
    slug: 'halloween',
    name: 'Halloween',
    tagline: 'Abóboras, fantasmas e sustos simpáticos',
    description:
      'A nossa primeira colecção. Peças pensadas para decorar a casa em Outubro sem assustar ninguém a sério — muitas delas funcionam com uma vela LED lá dentro.',
    image: '/img/jack-abobora-1.png',
    order: 1,
    featured: true,
  },
  {
    id: 'natal',
    slug: 'natal',
    name: 'Natal',
    tagline: 'Decoração quente para Dezembro',
    description:
      'Enfeites, lanternas e figuras articuladas para a árvore e para a mesa. A colecção cresce todos os anos.',
    image: '/img/estrela-natal-1.png',
    order: 2,
    featured: true,
  },
  {
    id: 'casa',
    slug: 'casa',
    name: 'Casa',
    tagline: 'Pequenas soluções para o dia a dia',
    description:
      'Organizadores, suportes e acessórios que resolvem um problema concreto na secretária, na cozinha ou na entrada.',
    image: '/img/organizador-hex-1.png',
    order: 3,
    featured: true,
  },
  {
    id: 'decoracao',
    slug: 'decoracao',
    name: 'Decoração',
    tagline: 'Formas e texturas para os cantos da casa',
    description:
      'Vasos, esculturas e objectos impressos em espiral contínua, onde as linhas de camada fazem parte do desenho.',
    image: '/img/vaso-espiral-1.png',
    order: 4,
    featured: true,
  },
  {
    id: 'porta-chaves',
    slug: 'porta-chaves',
    name: 'Porta-chaves',
    tagline: 'Leva contigo os teus designs favoritos',
    description:
      'Porta-chaves temáticos, figuras colecionáveis em miniatura e acessórios práticos e resistentes impressos em 3D.',
    image: '/img/placeholder.png',
    order: 5,
    featured: true,
  },
  {
    id: 'presentes',
    slug: 'presentes',
    name: 'Presentes',
    tagline: 'Para oferecer sem pensar muito',
    description:
      'Uma selecção de peças que funcionam bem como prenda, com embalagem simples incluída.',
    image: '/img/gato-preto-1.png',
    order: 6,
    featured: false,
  },
  {
    id: 'personalizados',
    slug: 'personalizados',
    name: 'Personalizados',
    tagline: 'Feito à medida, com o teu nome',
    description:
      'Placas, etiquetas e peças adaptadas ao que precisas. Dizes-nos o texto, as cores e o tamanho, e nós imprimimos.',
    image: '/img/placa-nome-1.png',
    order: 7,
    featured: false,
  },
]