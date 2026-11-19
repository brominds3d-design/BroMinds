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

// ============================================================
// CAMPANHAS (ex.: Black Friday)
// ============================================================

/**
 * Uma regra da campanha:
 *  - all:      todas as peças
 *  - category: peças da categoria (inclui as subcategorias dela)
 *  - price:    peças com preço normal entre min e max (qualquer um pode faltar)
 */
export type CampaignRule =
  | { type: 'all'; percent: number }
  | { type: 'category'; category_id: string; percent: number }
  | { type: 'price'; min?: number | null; max?: number | null; percent: number }
  /** Exclui da campanha as peças desta categoria (e das subcategorias dela) */
  | { type: 'exclude_category'; category_id: string; percent?: number }

export interface PromoCampaign {
  id: string
  name: string
  active: boolean
  starts_at: string | null
  ends_at: string | null
  rules: CampaignRule[]
  /** Tema do site enquanto a campanha decorre (ex.: 'black-friday') */
  theme?: string | null
  created_at?: string
}

export type CampaignStatus = 'live' | 'scheduled' | 'ended' | 'off'

export function campaignStatus(c: PromoCampaign, now = new Date()): CampaignStatus {
  if (!c.active) return 'off'
  if (c.ends_at && now >= new Date(c.ends_at)) return 'ended'
  if (c.starts_at && now < new Date(c.starts_at)) return 'scheduled'
  return 'live'
}

/** Dados da peça que as regras precisam de saber */
export interface CampaignTarget {
  categoryId: string | null
  parentCategoryId?: string | null
  /** Preço normal (sem descontos) */
  price: number
  /** Peça marcada como "Fora das campanhas" */
  excluded?: boolean
}

function inCategory(categoryId: string, target: CampaignTarget) {
  return categoryId === target.categoryId || categoryId === target.parentCategoryId
}

function ruleMatches(rule: CampaignRule, target: CampaignTarget) {
  if (rule.type === 'all') return true
  if (rule.type === 'exclude_category') return false
  if (rule.type === 'category') {
    return (
      rule.category_id === target.categoryId ||
      rule.category_id === target.parentCategoryId
    )
  }
  const min = rule.min ?? null
  const max = rule.max ?? null
  if (min !== null && target.price < min) return false
  if (max !== null && target.price > max) return false
  return true
}

/**
 * Maior desconto das campanhas ligadas para esta peça.
 * Devolve também o nome da campanha, para mostrar no selo.
 */
export function campaignDiscountFor(
  target: CampaignTarget,
  campaigns: PromoCampaign[],
  now = new Date(),
): { percent: number; name: string | null } {
  let best = { percent: 0, name: null as string | null }
  if (target.excluded) return best

  for (const campaign of campaigns) {
    if (campaignStatus(campaign, now) !== 'live') continue

    // Categoria excluída desta campanha?
    const excludedHere = (campaign.rules ?? []).some(
      (rule) => rule.type === 'exclude_category' && inCategory(rule.category_id, target),
    )
    if (excludedHere) continue

    for (const rule of campaign.rules ?? []) {
      const pct = toPercent(rule.percent) ?? 0
      if (pct > best.percent && ruleMatches(rule, target)) {
        best = { percent: pct, name: campaign.name }
      }
    }
  }

  return best
}

export function describeRule(rule: CampaignRule, categoryName: (id: string) => string) {
  if (rule.type === 'exclude_category') return `Exceto ${categoryName(rule.category_id)}`
  const pct = `−${Number(rule.percent)}%`
  if (rule.type === 'all') return `Todas as peças ${pct}`
  if (rule.type === 'category') return `${categoryName(rule.category_id)} ${pct}`
  const euro = (v: number) => `${v.toFixed(2).replace('.', ',')} €`
  const min = rule.min ?? null
  const max = rule.max ?? null
  if (min !== null && max !== null) return `De ${euro(min)} a ${euro(max)} ${pct}`
  if (max !== null) return `Até ${euro(max)} ${pct}`
  if (min !== null) return `Acima de ${euro(min)} ${pct}`
  return `Todas as peças ${pct}`
}