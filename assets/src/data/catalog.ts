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
}

const byOrder = (a: Category, b: Category) => a.order - b.order

function mapSupabaseProduct(row: any): ProductWithCategory {
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
    category: categories.find((c) => c.id === row.category_id),
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
  product: { id: string; categoryId: string },
  limit = 4,
): Promise<Array<ProductWithCategory>> {
  const products = await getProducts()
  const sameCategory = products.filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id,
  )

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)

  const fillers = products.filter(
    (p) => p.categoryId !== product.categoryId && p.id !== product.id,
  )

  return [...sameCategory, ...fillers].slice(0, limit)
}