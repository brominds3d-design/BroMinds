/**
 * Camada de consulta do catálogo integrada 100% com o Supabase.
 */
import { supabase } from '@/lib/supabase'
import { campaignDiscountFor, effectiveDiscount, PromoCampaign } from '@/lib/promo'
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
  /** Desconto em % que se aplica a esta peça (0 = sem promoção) */
  discountPercent: number
  /** Nome da campanha que dá o desconto (ex.: "Black Friday"), se for o caso */
  promoLabel: string | null
  /** Subcategoria (ex.: 'pendentes'), se a peça estiver numa */
  subcategoryId: string | null
  /** true = o cliente tem de escolher a cor do fio */
  threadColors: boolean
  /** Packs disponíveis (ex.: 5 peças −10%, 10 peças −15%); vazio = sem packs */
  packOptions: PackOption[]
  /** Kits: quantas peças tem 1 kit (null = não é kit) */
  kitSize: number | null
}

/** Um pack de várias peças com desconto */
export interface PackOption {
  size: number
  discount: number
}

/** Lê os packs guardados na categoria, ignorando valores inválidos */
function normalizePackOptions(raw: unknown): PackOption[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((p: any) => ({ size: Math.round(Number(p?.size)), discount: Number(p?.discount) || 0 }))
    .filter((p) => p.size > 1 && p.discount >= 0 && p.discount < 90)
    .sort((a, b) => a.size - b.size)
}

const byOrder = (a: Category, b: Category) => a.order - b.order

function mapSupabaseProduct(
  row: any,
  categoriesList: Array<Category> = [],
  campaigns: PromoCampaign[] = [],
): ProductWithCategory {
  const variants: Array<ProductVariant> = Array.isArray(row.variants) ? row.variants : []
  const basePrice = Number(row.base_price ?? (variants[0]?.price || 0))

  // Se a peça estiver numa subcategoria (ex.: Pendentes), no site conta como
  // sendo da categoria-mãe (Natal). A subcategoria fica guardada à parte.
  const ownCategory = categoriesList.find((c) => c.id === row.category_id)
  const parentCategory = ownCategory?.parent_id
    ? categoriesList.find((c) => c.id === ownCategory.parent_id)
    : undefined
  const category = parentCategory ?? ownCategory

  // Promoção normal: da peça; senão da subcategoria; senão da categoria-mãe
  const ownPromo = effectiveDiscount(
    row.discount_percent,
    ownCategory?.discount_percent ?? parentCategory?.discount_percent,
  )
  // Campanha ligada (ex.: Black Friday): fica o maior dos dois descontos
  const campaign = campaignDiscountFor(
    {
      categoryId: row.category_id,
      parentCategoryId: parentCategory?.id ?? null,
      price: basePrice,
      excluded: Boolean(row.no_campaigns),
    },
    campaigns,
  )
  const useCampaign = campaign.percent > ownPromo

  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    categoryId: category?.id ?? row.category_id,
    subcategoryId: parentCategory ? row.category_id : null,
    threadColors: Boolean(ownCategory?.thread_colors),
    packOptions: normalizePackOptions(ownCategory?.pack_options),
    kitSize:
      ownCategory?.is_kit && Number(row.kit_size) > 0 ? Math.round(Number(row.kit_size)) : null,
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
    category,
    discountPercent: useCampaign ? campaign.percent : ownPromo,
    promoLabel: useCampaign ? campaign.name : null,
  }
}

/** Categorias visíveis no site (as subcategorias ficam escondidas) */
export async function getCategories(): Promise<Array<Category>> {
  const all = await getAllCategories()
  return all.filter((c) => !c.parent_id)
}

/** Todas as categorias, incluindo subcategorias */
export async function getAllCategories(): Promise<Array<Category>> {
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

/** Campanhas de promoção ligadas (a data é verificada peça a peça) */
export async function getActiveCampaigns(): Promise<PromoCampaign[]> {
  const { data, error } = await supabase
    .from('promo_campaigns')
    .select('*')
    .eq('active', true)

  // Se a tabela ainda não existir, o site continua a funcionar sem campanhas
  if (error || !data) return []
  return data.map((c: any) => ({ ...c, rules: Array.isArray(c.rules) ? c.rules : [] }))
}

/** Busca todos os produtos do Supabase */
export async function getProducts(): Promise<Array<ProductWithCategory>> {
  const [categoriesData, campaigns, productsData] = await Promise.all([
    getAllCategories(),
    getActiveCampaigns(),
    supabase
      .from('products')
      .select('*')
      .eq('published', true) // os rascunhos só aparecem no admin
      .order('created_at', { ascending: false }),
  ])

  if (productsData.error || !productsData.data) {
    console.error('Erro ao procurar produtos no Supabase:', productsData.error)
    return []
  }

  return productsData.data.map((row) => mapSupabaseProduct(row, categoriesData, campaigns))
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithCategory | undefined> {
  const [categoriesData, campaigns, productData] = await Promise.all([
    getAllCategories(),
    getActiveCampaigns(),
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('published', true) // rascunho = página não encontrada
      .single(),
  ])

  if (productData.error || !productData.data) {
    return undefined
  }

  return mapSupabaseProduct(productData.data, categoriesData, campaigns)
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