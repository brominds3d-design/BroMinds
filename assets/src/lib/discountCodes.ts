import { supabase } from './supabase'

/**
 * Códigos de desconto de uso único.
 * - Valem para UMA unidade de uma peça.
 * - Não acumulam com promoções: fica o melhor dos dois preços.
 */

export type DiscountKind = 'percent' | 'amount'

export interface DiscountCode {
  id: string
  code: string
  kind: DiscountKind
  value: number
  note: string | null
  used_at: string | null
  used_by: string | null
  used_on: string | null
  created_at: string
}

export interface ValidCode {
  code: string
  kind: DiscountKind
  value: number
}

// Sem letras/números que se confundem (0/O, 1/I/L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateCodeText(length = 6) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  bytes.forEach((b) => (out += ALPHABET[b % ALPHABET.length]))
  return `BRO-${out}`
}

export function normalizeCode(raw: string) {
  return raw.trim().toUpperCase()
}

export function describeCode(code: Pick<ValidCode, 'kind' | 'value'>) {
  return code.kind === 'percent'
    ? `−${Number(code.value)}%`
    : `−${Number(code.value).toFixed(2).replace('.', ',')} €`
}

/**
 * Preço de UMA unidade com o código.
 * normalPrice = preço sem promoção; currentPrice = preço atual (com promoção).
 * Fica o mais baixo dos dois (não acumula).
 */
export function priceWithCode(normalPrice: number, currentPrice: number, code: ValidCode) {
  const withCode =
    code.kind === 'percent'
      ? normalPrice * (1 - code.value / 100)
      : normalPrice - code.value
  const best = Math.min(currentPrice, Math.max(0, withCode))
  return Math.round(best * 100) / 100
}

// ============================================================
// CLIENTE
// ============================================================

/** Devolve o código se existir e estiver livre; senão null */
export async function checkDiscountCode(raw: string): Promise<ValidCode | null> {
  const code = normalizeCode(raw)
  if (!code) return null

  const { data, error } = await supabase.rpc('check_discount_code', { p_code: code })
  if (error) throw error

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  return { code: row.code, kind: row.kind, value: Number(row.value) }
}

/** Marca como usado. Devolve false se alguém já o usou entretanto. */
export async function redeemDiscountCode(code: string, handle: string | null, product: string) {
  const { data, error } = await supabase.rpc('redeem_discount_code', {
    p_code: normalizeCode(code),
    p_handle: handle,
    p_product: product,
  })
  if (error) throw error
  return Boolean(data)
}

export async function releaseDiscountCode(code: string) {
  const { error } = await supabase.rpc('release_discount_code', {
    p_code: normalizeCode(code),
  })
  if (error) throw error
}

// ============================================================
// ADMIN
// ============================================================

export async function listDiscountCodes(): Promise<DiscountCode[]> {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row: any) => ({ ...row, value: Number(row.value) }))
}

/** Cria um código novo (tenta outra vez se, por azar, já existir) */
export async function createDiscountCode(kind: DiscountKind, value: number, note: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCodeText()
    const { data, error } = await supabase
      .from('discount_codes')
      .insert([{ code, kind, value, note: note.trim() || null }])
      .select()
      .single()

    if (!error) return { ...data, value: Number(data.value) } as DiscountCode
    if (error.code !== '23505') throw error // 23505 = código repetido
  }
  throw new Error('Não foi possível gerar um código único. Tenta outra vez.')
}

export async function deleteDiscountCode(id: string) {
  const { error } = await supabase.from('discount_codes').delete().eq('id', id)
  if (error) throw error
}