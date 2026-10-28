import { applyDiscount } from '@/lib/promo'

const money = (value: number) =>
  new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)

/**
 * Mostra o preço de uma peça.
 * Com promoção: preço antigo riscado e, por baixo, o novo a vermelho.
 */
export function PriceTag({
  price,
  discountPercent = 0,
  size = 'md',
  prefix,
  className = '',
}: {
  price: number
  discountPercent?: number
  size?: 'sm' | 'md' | 'lg'
  prefix?: string
  className?: string
}) {
  const finalPrice = applyDiscount(price, discountPercent)

  const mainSize =
    size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-sm' : 'text-lg'
  const oldSize = size === 'lg' ? 'text-base' : 'text-xs'

  if (!discountPercent || finalPrice >= price) {
    return (
      <span className={`font-extrabold text-ink ${mainSize} ${className}`}>
        {prefix ? `${prefix} ` : ''}
        {money(price)}
      </span>
    )
  }

  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={`flex items-center gap-2 text-ink-3 ${oldSize}`}>
        <span className="line-through">{money(price)}</span>
        <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
          −{Math.round(discountPercent)}%
        </span>
      </span>
      <span className={`font-extrabold text-red-600 ${mainSize}`}>
        {prefix ? `${prefix} ` : ''}
        {money(finalPrice)}
      </span>
    </span>
  )
}