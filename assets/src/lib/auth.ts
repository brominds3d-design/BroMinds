import { supabase } from './supabase'

/**
 * Login da BroMinds: só com e-mail, sem palavra-passe.
 *
 * - Se o e-mail já existe, entra logo.
 * - Se não existe, pede o @ e o nome e cria o perfil.
 * - A sessão fica guardada no browser até carregar em "Sair".
 */

export type UserRole = 'customer' | 'admin' | 'painter'

export interface CustomerUser {
  handle: string // sem o @
  displayName: string
  email?: string
  role: UserRole
}

const STORAGE_KEY = 'brominds_customer_user'

// ============================================================
// SESSÃO GUARDADA NO BROWSER
// ============================================================

export function getCurrentUser(): CustomerUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const user = JSON.parse(raw)
    return { ...user, role: user.role ?? 'customer' }
  } catch {
    return null
  }
}

export function saveCurrentUser(user: CustomerUser | null) {
  if (typeof window === 'undefined') return
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    }
  } catch {
    // sem acesso ao localStorage (ex.: modo privado)
  }
  window.dispatchEvent(new Event('auth_changed'))
}

export function isAdmin(user: CustomerUser | null) {
  return user?.role === 'admin'
}

export function canManagePaintings(user: CustomerUser | null) {
  return user?.role === 'admin' || user?.role === 'painter'
}

// ============================================================
// CONVERSÃO E VALIDAÇÃO
// ============================================================

function profileToUser(row: any): CustomerUser {
  return {
    handle: row.handle,
    displayName: row.display_name || row.handle,
    email: row.email || undefined,
    role: (row.role as UserRole) || 'customer',
  }
}

export function cleanEmail(raw: string) {
  return raw.trim().toLowerCase()
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function cleanHandle(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[^a-z0-9_.-]/g, '')
}

// ============================================================
// LOGIN
// ============================================================

/** Procura um perfil pelo e-mail. Devolve null se não existir. */
export async function findProfileByEmail(rawEmail: string) {
  const email = cleanEmail(rawEmail)
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('email', email) // os e-mails são sempre guardados em minúsculas
    .maybeSingle()

  if (error) throw error
  return data
}

/** Passo 1: tenta entrar só com o e-mail */
export async function loginWithEmail(
  rawEmail: string,
): Promise<{ user: CustomerUser } | { needsProfile: true }> {
  const email = cleanEmail(rawEmail)
  if (!isValidEmail(email)) throw new Error('Esse e-mail não parece válido.')

  const existing = await findProfileByEmail(email)
  if (existing) {
    const user = profileToUser(existing)
    saveCurrentUser(user)
    return { user }
  }

  return { needsProfile: true }
}

/** Passo 2 (só para e-mails novos): cria o perfil com @ e nome */
export async function registerWithEmail(
  rawEmail: string,
  rawHandle: string,
  rawName: string,
): Promise<CustomerUser> {
  const email = cleanEmail(rawEmail)
  const handle = cleanHandle(rawHandle)
  const name = rawName.trim() || handle

  if (!isValidEmail(email)) throw new Error('Esse e-mail não parece válido.')
  if (!handle) throw new Error('Escolhe um @ (só letras, números, _ . -).')

  // O @ já existe?
  const { data: sameHandle, error: findError } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('handle', handle)
    .maybeSingle()

  if (findError) throw findError

  if (sameHandle) {
    // Perfil antigo (do login só com @) ainda sem e-mail: liga-lhe este e-mail
    if (!sameHandle.email) {
      const { data: updated, error } = await supabase
        .from('customer_profiles')
        .update({ email, display_name: sameHandle.display_name || name })
        .eq('id', sameHandle.id)
        .select()
        .single()

      if (error) throw error
      const user = profileToUser(updated)
      saveCurrentUser(user)
      return user
    }

    throw new Error('Esse @ já está a ser usado. Escolhe outro.')
  }

  const { data: created, error: createError } = await supabase
    .from('customer_profiles')
    .insert([{ handle, display_name: name, email, role: 'customer' }])
    .select()
    .single()

  if (createError) throw createError

  const user = profileToUser(created)
  saveCurrentUser(user)
  return user
}

/**
 * Atualiza o perfil guardado com o que está no Supabase
 * (ex.: se mudaste o papel de alguém no admin).
 */
export async function refreshCurrentUser(): Promise<CustomerUser | null> {
  const current = getCurrentUser()
  if (!current) return null

  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('handle', current.handle)
    .maybeSingle()

  if (error) return current

  // O perfil foi apagado: termina a sessão
  if (!data) {
    saveCurrentUser(null)
    return null
  }

  const fresh = profileToUser(data)
  const changed =
    fresh.role !== current.role ||
    fresh.displayName !== current.displayName ||
    fresh.email !== current.email

  if (changed) saveCurrentUser(fresh)
  return fresh
}

/** Muda o papel de um perfil (usado no admin) */
export async function setProfileRole(profileId: string, role: UserRole) {
  const { error } = await supabase
    .from('customer_profiles')
    .update({ role })
    .eq('id', profileId)

  if (error) throw error
}

/**
 * Compatibilidade com o login antigo só com @.
 * Já não é usado pelo AuthModal, mas fica para não partir nada.
 */
export async function loginOrRegisterHandle(
  rawHandle: string,
  rawName?: string,
): Promise<CustomerUser> {
  const handle = cleanHandle(rawHandle)
  if (!handle) throw new Error('O @username não é válido.')

  const { data: existing, error: findError } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('handle', handle)
    .maybeSingle()

  if (findError) throw findError

  if (existing) {
    const user = profileToUser(existing)
    saveCurrentUser(user)
    return user
  }

  const { data: created, error: createError } = await supabase
    .from('customer_profiles')
    .insert([{ handle, display_name: rawName?.trim() || handle }])
    .select()
    .single()

  if (createError) throw createError

  const user = profileToUser(created)
  saveCurrentUser(user)
  return user
}

// ============================================================
// FAVORITOS (sem alterações)
// ============================================================

export async function getFavoriteProductIds(handle: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_handle', handle)

  if (error || !data) return []
  return data.map((f) => String(f.product_id))
}

export async function toggleFavorite(handle: string, productId: string): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_handle', handle)
    .eq('product_id', productId)
    .maybeSingle()

  if (data) {
    await supabase
      .from('favorites')
      .delete()
      .eq('user_handle', handle)
      .eq('product_id', productId)
    window.dispatchEvent(new Event('favorites_changed'))
    return false
  }

  await supabase
    .from('favorites')
    .insert([{ user_handle: handle, product_id: productId }])
  window.dispatchEvent(new Event('favorites_changed'))
  return true
}