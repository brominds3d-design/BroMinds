/**
 * Tipos de dominio do catalogo DuoPixel.
 *
 * Estes tipos sao a fronteira entre os dados e a interface. Hoje as listas
 * vivem em `categories.ts` / `products.ts`; quando a area de administracao
 * passar a escrever numa base de dados, basta que as funcoes de `catalog.ts`
 * devolvam objectos com esta mesma forma e nenhuma pagina precisa de mudar.
 */

/** Uma cor de filamento disponivel para um produto. */
export interface ProductColor {
  /** Nome apresentado ao publico, ex. "Laranja Abobora". */
  name: string
  /** Cor CSS usada no circulo de pre-visualizacao. */
  hex: string
}

export interface ProductImage {
  /** Caminho dentro de `public/`, ex. `/img/jack-abobora-1.png`. */
  src: string
  /** Texto alternativo descritivo (obrigatorio, usado por leitores de ecra). */
  alt: string
}

/** Par de rotulo/valor para a tabela de informacoes adicionais. */
export interface ProductDetail {
  label: string
  value: string
}

export interface Category {
  id: string
  /** Usado no URL: /catalogo/halloween */
  slug: string
  name: string
  /** Frase curta para os cartoes de categoria. */
  tagline: string
  description: string
  /** Imagem de capa da categoria (normalmente a de um dos seus produtos). */
  image: string
  /** Ordem de apresentacao no catalogo e na navegacao. */
  order: number
  /** Aparece na seccao "Categorias em destaque" da pagina inicial. */
  featured: boolean
}

export interface Product {
  id: string
  /** Usado no URL: /produtos/jack-abobora-sorridente */
  slug: string
  name: string
  /** `Category.id` a que o produto pertence. */
  categoryId: string
  /** Preco em euros. */
  price: number
  /** Uma linha para os cartoes do catalogo. */
  shortDescription: string
  /** Texto completo para a pagina do produto (paragrafos separados por \n\n). */
  description: string
  /** A primeira imagem e a imagem principal usada nos cartoes. */
  images: Array<ProductImage>
  colors: Array<ProductColor>
  details: Array<ProductDetail>
  featured: boolean
  /** Data ISO de publicacao, usada na seccao "Chegaram agora". */
  createdAt: string
}
