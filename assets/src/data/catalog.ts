/**
 * Camada de consulta do catalogo integrada com o Supabase.
 */
import { supabase } from '@/lib/supabase'
import { categories } from './categories'
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
  model3d?: string
}

const byOrder = (a: Category, b: Category) => a.order - b.order

function mapSupabaseProduct(row: any): ProductWithCategory {
  const variants: Array<ProductVariant> = Array.isArray(row.variants) ? row.variants : []
  const basePrice = Number(row.base_price ?? (variants[0]?.price || 0))

  // Deteta se o produto tem modelo 3D no Supabase ou se é o Monopoly pelo slug/nome
  const isMonopoly =
    row.slug?.includes('monopoly') ||
    row.name?.toLowerCase().includes('monopoly')

  const model3d = row.model_3d || row.model3d || (isMonopoly ? '/Untitled.glb' : undefined)

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
    category: categories.find((c) => c.id === row.category_id),
    model3d,
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

/** Busca todos os produtos ativos do Supabase */
export async function getProducts(): Promise<Array<ProductWithCategory>> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Erro ao buscar produtos do Supabase:', error)
    return []
  }

  return data.map(mapSupabaseProduct)
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithCategory | undefined> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return undefined
  }

  return mapSupabaseProduct(data)
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