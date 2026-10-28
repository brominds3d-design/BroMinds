/**
 * Promoções da BroMinds.
 *
 * Regras:
 *  - products.discount_percent preenchido → usa esse valor
 *    (0 = a peça fica fora da promoção da categoria)
 *  - products.discount_percent vazio → usa categories.discount_percent
 *  - nenhum dos dois → sem promoção
 *
 * O preço normal (base_price / variantes) nunca é alterado na base de dados.
 */

const MAX_DISCOUNT = 90

function toPercent(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.min(MAX_DISCOUNT, n)
}

/** Percentagem de desconto que se aplica a uma peça (0 se não houver) */
export function effectiveDiscount(
  productDiscount: unknown,
  categoryDiscount: unknown,
): number {
  const own = toPercent(productDiscount)
  if (own !== null) return own

  return toPercent(categoryDiscount) ?? 0
}

/** Preço com desconto, arredondado aos cêntimos */
export function applyDiscount(price: number | string, percent: number): number {
  const value = Number(price) || 0
  if (!percent) return value
  return Math.round(value * (1 - percent / 100) * 100) / 100
}

/** De onde vem a promoção, para mostrar no admin */
export function discountSource(
  productDiscount: unknown,
  categoryDiscount: unknown,
): 'own' | 'excluded' | 'category' | 'none' {
  const own = toPercent(productDiscount)
  if (own !== null) return own === 0 ? 'excluded' : 'own'
  return (toPercent(categoryDiscount) ?? 0) > 0 ? 'category' : 'none'
}