import type { ProductColor } from '@/data/types'

/**
 * Cores disponiveis de um produto.
 *
 * Nos cartoes mostra so os circulos (compacto); na pagina do produto mostra
 * tambem o nome de cada cor. Os circulos sao decorativos — o nome das cores
 * segue sempre em texto para leitores de ecra.
 */
export function ColorDots({
  colors,
  showNames = false,
  size = 'sm',
}: {
  colors: Array<ProductColor>
  showNames?: boolean
  size?: 'sm' | 'lg'
}) {
  if (colors.length === 0) return null

  const dot = size === 'lg' ? 'h-7 w-7' : 'h-[18px] w-[18px]'

  if (showNames) {
    return (
      <ul className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <li
            key={color.name}
            className="flex items-center gap-2 rounded-card border border-paper-3 bg-paper px-2.5 py-1.5"
          >
            <span
              className={`${dot} shrink-0 rounded-full border border-ink/15 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.18)]`}
              style={{ backgroundColor: color.hex }}
              aria-hidden="true"
            />
            <span className="text-[0.8rem] text-ink-2">{color.name}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="flex -space-x-1.5" aria-hidden="true">
        {colors.slice(0, 4).map((color) => (
          <span
            key={color.name}
            className={`${dot} rounded-full border-2 border-paper shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </span>
      <span className="sr-only">
        Cores disponíveis: {colors.map((c) => c.name).join(', ')}.
      </span>
      <span className="label-mono text-ink-3" aria-hidden="true">
        {colors.length} {colors.length === 1 ? 'cor' : 'cores'}
      </span>
    </div>
  )
}
