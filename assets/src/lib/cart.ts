import { supabase } from './supabase'

/**
 * Carrinho da BroMinds.
 *
 * Funciona como os favoritos: fica guardado no Supabase (tabela cart_items),
 * ligado ao @handle do cliente. Quando algo muda é disparado o evento
 * 'cart_changed', para o cabeçalho e as páginas se atualizarem sozinhos.
 */

export type CartItemType = 'product' | 'pack'

export interface CartItem {
  id: string
  user_handle: string
  item_type: CartItemType
  product_id: string | null
  product_slug: string | null
  name: string
  variant_name: string | null
  color_name: string | null
  unit_price: number
  quantity: number
  image: string | null
  details: string[]
  created_at: string
}

export interface NewCartItem {
  item_type?: CartItemType
  product_id?: string | null
  product_slug?: string | null
  name: string
  variant_name?: string | null
  color_name?: string | null
  unit_price: number
  quantity: number
  image?: string | null
  details?: string[]
}

/** Contactos para onde a encomenda pode ser enviada */
export const WHATSAPP_CONTACTS = [
  {
    id: 'tiago',
    name: 'Tiago Costa',
    role: 'Modelação & Produção 3D',
    phone: '351916175751',
  },
  {
    id: 'ines',
    name: 'Inês Costa',
    role: 'Atendimento & Encomendas',
    // ATENÇÃO: confirmar este número (a página do produto e a dos packs
    // tinham números diferentes para a Inês)
    phone: '351911565367',
  },
] as const

export type WhatsAppContact = (typeof WHATSAPP_CONTACTS)[number]

const MAX_QUANTITY = 99

export const money = (value: number) =>
  new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)

function notifyCartChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart_changed'))
  }
}

/** Nomes de variante que não vale a pena mostrar */
export function isDefaultVariant(name: string | null | undefined) {
  if (!name) return true
  const clean = name.trim().toLowerCase()
  return clean === 'único' || clean === 'unico' || clean === 'tamanho único'
}

/** Texto curto com tamanho e cor, ex.: "Tamanho M · Cor Branco" */
export function cartItemOptions(item: Pick<CartItem, 'variant_name' | 'color_name'>) {
  const parts: string[] = []
  if (!isDefaultVariant(item.variant_name)) parts.push(`Tamanho ${item.variant_name}`)
  if (item.color_name) parts.push(`Cor ${item.color_name}`)
  return parts.join(' · ')
}

// ============================================================
// LEITURA
// ============================================================

export async function getCartItems(handle: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_handle', handle)
    .order('created_at', { ascending: true })

  if (error || !data) {
    if (error) console.error('Erro ao carregar carrinho:', error.message)
    return []
  }

  return data.map((row: any) => ({
    ...row,
    unit_price: Number(row.unit_price),
    quantity: Number(row.quantity),
    details: Array.isArray(row.details) ? row.details : [],
  }))
}

export async function getCartCount(handle: string): Promise<number> {
  const items = await getCartItems(handle)
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
}

// ============================================================
// ESCRITA
// ============================================================

/**
 * Adiciona ao carrinho.
 * Se a mesma peça (mesmo tamanho e cor) já lá estiver, soma a quantidade.
 * Os packs entram sempre como um item novo.
 */
export async function addToCart(handle: string, item: NewCartItem) {
  const itemType = item.item_type ?? 'product'
  const variantName = item.variant_name ?? null
  const colorName = item.color_name ?? null

  if (itemType === 'product' && item.product_id) {
    let query = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_handle', handle)
      .eq('item_type', 'product')
      .eq('product_id', item.product_id)

    query = variantName
      ? query.eq('variant_name', variantName)
      : query.is('variant_name', null)

    query = colorName
      ? query.eq('color_name', colorName)
      : query.is('color_name', null)

    const { data: existing, error: findError } = await query
      .limit(1)
      .maybeSingle()

    if (findError) throw findError

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity: Math.min(MAX_QUANTITY, existing.quantity + item.quantity),
        })
        .eq('id', existing.id)

      if (error) throw error
      notifyCartChanged()
      return
    }
  }

  const { error } = await supabase.from('cart_items').insert([
    {
      user_handle: handle,
      item_type: itemType,
      product_id: item.product_id ?? null,
      product_slug: item.product_slug ?? null,
      name: item.name,
      variant_name: variantName,
      color_name: colorName,
      unit_price: Number(item.unit_price),
      quantity: Math.min(MAX_QUANTITY, Math.max(1, item.quantity)),
      image: item.image ?? null,
      details: item.details ?? [],
    },
  ])

  if (error) throw error
  notifyCartChanged()
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await removeCartItem(itemId)
    return
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity: Math.min(MAX_QUANTITY, quantity) })
    .eq('id', itemId)

  if (error) throw error
  notifyCartChanged()
}

export async function removeCartItem(itemId: string) {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId)
  if (error) throw error
  notifyCartChanged()
}

export async function clearCart(handle: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_handle', handle)

  if (error) throw error
  notifyCartChanged()
}

// ============================================================
// MENSAGEM DE WHATSAPP
// ============================================================

export function buildCartMessage(
  items: CartItem[],
  user: { handle: string; displayName: string },
) {
  const lines: string[] = [
    '🛒 *Encomenda — BROMINDS*',
    `Cliente: ${user.displayName} (@${user.handle})`,
    '',
  ]

  items.forEach((item, index) => {
    lines.push(`*${index + 1}. ${item.name}*`)

    const options = cartItemOptions(item)
    if (options) lines.push(`   ${options}`)

    item.details.forEach((detail) => lines.push(`   • ${detail}`))

    lines.push(
      `   ${item.quantity} × ${money(item.unit_price)} = ${money(
        item.unit_price * item.quantity,
      )}`,
    )
    lines.push('')
  })

  lines.push(`*Total: ${money(cartTotal(items))}*`)
  lines.push('')
  lines.push('Olá! Gostaria de confirmar esta encomenda. Qual é a disponibilidade?')

  return lines.join('\n')
}

export function whatsappLink(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}