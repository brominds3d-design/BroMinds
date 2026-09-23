import { supabase } from './supabase'

export interface CustomerUser {
  handle: string // sem o @
  displayName: string
}

const STORAGE_KEY = 'brominds_customer_user'

export function getCurrentUser(): CustomerUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCurrentUser(user: CustomerUser | null) {
  if (typeof window === 'undefined') return
  if (!user) {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }
  window.dispatchEvent(new Event('auth_changed'))
}

// Entra ou cria o perfil diretamente com @username
export async function loginOrRegisterHandle(rawHandle: string, rawName?: string): Promise<CustomerUser> {
  const cleanHandle = rawHandle.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_.-]/g, '')
  if (!cleanHandle) throw new Error('O @username não é válido.')

  // 1. Vê se já existe
  const { data: existing, error: findError } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('handle', cleanHandle)
    .maybeSingle()

  if (findError) throw findError

  if (existing) {
    const user: CustomerUser = { handle: existing.handle, displayName: existing.display_name }
    saveCurrentUser(user)
    return user
  }

  // 2. Se não existe, cria com o nome fornecido
  const finalName = rawName?.trim() || cleanHandle
  const { data: created, error: createError } = await supabase
    .from('customer_profiles')
    .insert([{ handle: cleanHandle, display_name: finalName }])
    .select()
    .single()

  if (createError) throw createError

  const user: CustomerUser = { handle: created.handle, displayName: created.display_name }
  saveCurrentUser(user)
  return user
}

// Obter IDs dos produtos favoritos do utilizador
export async function getFavoriteProductIds(handle: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_handle', handle)

  if (error || !data) return []
  return data.map((f) => String(f.product_id))
}

// Adicionar / Remover favorito
export async function toggleFavorite(handle: string, productId: string): Promise<boolean> {
  // Verifica se já é favorito
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_handle', handle)
    .eq('product_id', productId)
    .maybeSingle()

  if (data) {
    // Remover
    await supabase
      .from('favorites')
      .delete()
      .eq('user_handle', handle)
      .eq('product_id', productId)
    window.dispatchEvent(new Event('favorites_changed'))
    return false
  } else {
    // Adicionar
    await supabase
      .from('favorites')
      .insert([{ user_handle: handle, product_id: productId }])
    window.dispatchEvent(new Event('favorites_changed'))
    return true
  }
}