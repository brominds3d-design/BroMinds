/**
 * Camada de consulta do catálogo integrada 100% com o Supabase.
 */
import { supabase } from '@/lib/supabase'
import type { Category, Product } from './types'

export interface ProductVariant {
  name: string
  price: number
  dimensions?: string
}

export interface ProductWithCategory extends Omit<Product, 'price'> {
  price: number
  basePrice: number
  variants?: Array<ProductVariant>
  category: Category | undefined
}

const byOrder = (a: Category, b: Category) => a.order - b.order

function mapSupabaseProduct(row: any, categoriesList: Array<Category> = []): ProductWithCategory {
  const variants: Array<ProductVariant> = Array.isArray(row.variants) ? row.variants : []
  const basePrice = Number(row.base_price ?? (variants[0]?.price || 0))

  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    price: basePrice,
    basePrice,
    shortDescription: row.short_description || '',
    description: row.description || '',
    images: Array.isArray(row.images) && row.images.length > 0 
      ? row.images 
      : [{ src: '/img/placeholder.png', alt: row.name }],
    colors: Array.isArray(row.colors) ? row.colors : [],
    variants,
    details: Array.isArray(row.details) ? row.details : [],
    featured: Boolean(row.featured),
    createdAt: row.created_at || new Date().toISOString(),
    category: categoriesList.find((c) => c.id === row.category_id),
  }
}

/** Busca todas as categorias do Supabase */
export async function getCategories(): Promise<Array<Category>> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true })

  if (error || !data) {
    console.error('Erro ao procurar categorias no Supabase:', error)
    return []
  }

  return (data as Array<Category>).sort(byOrder)
}

export async function getFeaturedCategories(): Promise<Array<Category>> {
  const all = await getCategories()
  return all.filter((c) => c.featured)
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return undefined
  return data as Category
}

/** Busca todos os produtos do Supabase */
export async function getProducts(): Promise<Array<ProductWithCategory>> {
  const [categoriesData, productsData] = await Promise.all([
    getCategories(),
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  if (productsData.error || !productsData.data) {
    console.error('Erro ao procurar produtos no Supabase:', productsData.error)
    return []
  }

  return productsData.data.map((row) => mapSupabaseProduct(row, categoriesData))
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithCategory | undefined> {
  const [categoriesData, productData] = await Promise.all([
    getCategories(),
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single(),
  ])

  if (productData.error || !productData.data) {
    return undefined
  }

  return mapSupabaseProduct(productData.data, categoriesData)
}

export async function getProductsByCategory(
  categoryId: string,
): Promise<Array<ProductWithCategory>> {
  const products = await getProducts()
  return products.filter((p) => p.categoryId === categoryId)
}

export async function getFeaturedProducts(limit = 8): Promise<Array<ProductWithCategory>> {
  const products = await getProducts()
  return products.filter((p) => p.featured).slice(0, limit)
}

export async function getRecentProducts(limit = 4): Promise<Array<ProductWithCategory>> {
  const products = await getProducts()
  return products.slice(0, limit)
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const products = await getProducts()
  return products.reduce<Record<string, number>>((counts, product) => {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1
    return counts
  }, {})
}

export async function getRelatedProducts(
  categoryIdOrProduct: string | { id: string; categoryId: string },
  productId?: string,
  limit = 4,
): Promise<Array<ProductWithCategory>> {
  const products = await getProducts()

  const targetCategoryId =
    typeof categoryIdOrProduct === 'object'
      ? categoryIdOrProduct.categoryId
      : categoryIdOrProduct

  const targetId =
    typeof categoryIdOrProduct === 'object'
      ? categoryIdOrProduct.id
      : productId

  const sameCategory = products.filter(
    (p) => p.categoryId === targetCategoryId && p.id !== targetId,
  )

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)

  const fillers = products.filter(
    (p) => p.categoryId !== targetCategoryId && p.id !== targetId,
  )

  return [...sameCategory, ...fillers].slice(0, limit)
}