/**
 * Camada de consulta do catalogo.
 *
 * Todas as paginas leem os dados atraves destas funcoes e nunca importam
 * `products.ts` / `categories.ts` directamente. E o unico sitio a mudar
 * quando os dados passarem das listas de exemplo para a base de dados:
 * as funcoes tornam-se assincronas e as paginas passam a esperar por elas.
 */
import { categories } from './categories'
import { products } from './products'
import type { Category, Product } from './types'

/** Produto com a sua categoria ja resolvida, que e o que a interface precisa. */
export interface ProductWithCategory extends Product {
  category: Category | undefined
}

const byOrder = (a: Category, b: Category) => a.order - b.order
const byNewest = (a: Product, b: Product) =>
  b.createdAt.localeCompare(a.createdAt)

function withCategory(product: Product): ProductWithCategory {
  return {
    ...product,
    category: categories.find((c) => c.id === product.categoryId),
  }
}

export function getCategories(): Array<Category> {
  return [...categories].sort(byOrder)
}

export function getFeaturedCategories(): Array<Category> {
  return getCategories().filter((c) => c.featured)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

export function getProducts(): Array<ProductWithCategory> {
  return [...products].sort(byNewest).map(withCategory)
}

export function getProductBySlug(
  slug: string,
): ProductWithCategory | undefined {
  const product = products.find((p) => p.slug === slug)
  return product ? withCategory(product) : undefined
}

export function getProductsByCategory(
  categoryId: string,
): Array<ProductWithCategory> {
  return getProducts().filter((p) => p.categoryId === categoryId)
}

export function getFeaturedProducts(limit = 4): Array<ProductWithCategory> {
  return getProducts()
    .filter((p) => p.featured)
    .slice(0, limit)
}

export function getRecentProducts(limit = 4): Array<ProductWithCategory> {
  return getProducts().slice(0, limit)
}

/** Quantos produtos existem em cada categoria, para os contadores dos filtros. */
export function getCategoryCounts(): Record<string, number> {
  return products.reduce<Record<string, number>>((counts, product) => {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1
    return counts
  }, {})
}

/**
 * Produtos relacionados para a seccao "Também podes gostar": primeiro os da
 * mesma categoria e, se nao houver suficientes, completa-se com os mais
 * recentes de outras categorias para a seccao nunca aparecer vazia.
 */
export function getRelatedProducts(
  product: Product,
  limit = 3,
): Array<ProductWithCategory> {
  const sameCategory = getProducts().filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id,
  )

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)

  const fillers = getProducts().filter(
    (p) => p.categoryId !== product.categoryId && p.id !== product.id,
  )

  return [...sameCategory, ...fillers].slice(0, limit)
}
