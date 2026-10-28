/**
 * Cálculo de custos de produção da BroMinds.
 *
 * As fórmulas são as mesmas da folha de Excel:
 *   Material        = peso (g) × preço do filamento (€/g)
 *   Eletricidade    = horas × custo de energia por hora
 *   Amortização     = horas × desgaste da impressora por hora
 *   Fabrico c/ falhas = (material + eletricidade + amortização) × 1,10
 *   Custo total     = fabrico + embalagem + corrente + custo adicional
 *   Preço sugerido  = fabrico × markup + embalagem + corrente + adicional,
 *                     arredondado aos 0,50 €
 *   Margem          = (preço − custo total) ÷ preço
 *
 * Para mudar um valor base (ex.: preço da luz), altera COST_SETTINGS.
 */

export const COST_SETTINGS = {
  /** Preço do filamento por defeito, em € por kg */
  filamentPricePerKg: 9,
  /** Eletricidade por hora de impressão (€) */
  electricityPerHour: 0.01125,
  /** Desgaste/amortização da impressora por hora (€) */
  amortizationPerHour: 0.15,
  /** Taxa de falhas de fabrico */
  failureRate: 0.1,
  /** Custo da embalagem (€) */
  packaging: 1.5,
  /** Custo da corrente dos porta-chaves (€ por peça) */
  chain: 0.06,
  /** Markup por defeito */
  markup: 4.2,
  /** O preço sugerido é arredondado a múltiplos deste valor (€) */
  priceStep: 0.5,
}

export interface CostInfo {
  weight_g: number | null
  print_hours: number | null
  filament_price_kg: number | null
  markup: number | null
  include_failures: boolean
  include_packaging: boolean
  include_chain: boolean
  extra_cost: number | null
  extra_note: string
  notes: string
}

export function emptyCostInfo(): CostInfo {
  return {
    weight_g: null,
    print_hours: null,
    filament_price_kg: COST_SETTINGS.filamentPricePerKg,
    markup: COST_SETTINGS.markup,
    include_failures: true,
    include_packaging: false,
    include_chain: false,
    extra_cost: null,
    extra_note: '',
    notes: '',
  }
}

export interface CostResult {
  material: number
  electricity: number
  amortization: number
  manufacturing: number
  packaging: number
  chain: number
  extra: number
  totalCost: number
  suggestedPrice: number
  /** true se houver peso ou tempo preenchidos */
  hasData: boolean
}

const n = (value: number | null | undefined) =>
  Number.isFinite(Number(value)) ? Number(value) : 0

export function roundToStep(value: number, step = COST_SETTINGS.priceStep) {
  if (step <= 0) return value
  return Math.round(value / step) * step
}

export function calculateCosts(info: CostInfo): CostResult {
  const weight = n(info.weight_g)
  const hours = n(info.print_hours)
  const pricePerKg = n(info.filament_price_kg ?? COST_SETTINGS.filamentPricePerKg)
  const markup = n(info.markup ?? COST_SETTINGS.markup)

  const material = weight * (pricePerKg / 1000)
  const electricity = hours * COST_SETTINGS.electricityPerHour
  const amortization = hours * COST_SETTINGS.amortizationPerHour

  const base = material + electricity + amortization
  const manufacturing = info.include_failures
    ? base * (1 + COST_SETTINGS.failureRate)
    : base

  const packaging = info.include_packaging ? COST_SETTINGS.packaging : 0
  const chain = info.include_chain ? COST_SETTINGS.chain : 0
  const extra = n(info.extra_cost)

  const totalCost = manufacturing + packaging + chain + extra
  const suggestedPrice = roundToStep(manufacturing * markup + packaging + chain + extra)

  return {
    material,
    electricity,
    amortization,
    manufacturing,
    packaging,
    chain,
    extra,
    totalCost,
    suggestedPrice,
    hasData: weight > 0 || hours > 0,
  }
}

/** Margem em % (0–100) para um preço de venda */
export function marginPercent(price: number, totalCost: number) {
  if (!price || price <= 0) return 0
  return ((price - totalCost) / price) * 100
}

/** Junta os dados guardados no Supabase com os valores por defeito */
export function normalizeCostInfo(raw: unknown): CostInfo {
  const base = emptyCostInfo()
  if (!raw || typeof raw !== 'object') return base
  return { ...base, ...(raw as Partial<CostInfo>) }
}