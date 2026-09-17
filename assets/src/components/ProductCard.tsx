import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { ColorDots } from './ColorDots'
import type { ProductWithCategory } from '@/data/catalog'
import { formatPrice } from '@/lib/format'
import { img, imgSrcSet } from '@/lib/image'

/**
 * Cartao de produto do catalogo.
 *
 * Todo o cartao e clicavel (a etiqueta "Ver detalhes" e o alvo visivel, mas a
 * area de toque cobre o cartao inteiro, o que importa no telemovel).
 */
export function ProductCard({
  product,
  priority = false,
  delay,
}: {
  product: ProductWithCategory
  /** Desliga o lazy-loading nos primeiros cartoes visiveis. */
  priority?: boolean
  /** Atraso da animacao de entrada, em segundos. */
  delay?: number
}) {
  const cover = product.images[0]

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-card-lg border border-paper-3 bg-paper transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_18px_40px_-24px_rgba(32,20,40,0.45)] focus-within:-translate-y-1 ${
        delay === undefined ? '' : 'rise'
      }`}
      style={delay === undefined ? undefined : { animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-square overflow-hidden bg-paper-2">
        <img
          src={img(cover.src, { width: 620, height: 620, fit: 'cover' })}
          srcSet={imgSrcSet(cover.src, [320, 480, 620, 840], { aspect: 1 })}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 44vw, 90vw"
          alt={cover.alt}
          width={620}
          height={620}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.045]"
        />

        {product.category ? (
          <span className="label-mono absolute left-3 top-3 rounded-full bg-paper/88 px-2.5 py-1 text-ink-2 backdrop-blur-sm">
            {product.category.name}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.06rem] font-bold leading-tight sm:text-lg">
            {product.name}
          </h3>
          <span className="shrink-0 font-mono text-[0.95rem] font-medium text-ember-deep">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="text-[0.86rem] leading-relaxed text-ink-2">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-paper-3 pt-3.5">
          <ColorDots colors={product.colors} />

          <Link
            to="/produtos/$productSlug"
            params={{ productSlug: product.slug }}
            className="flex items-center gap-1.5 text-[0.84rem] font-semibold text-ink transition-colors hover:text-ember"
          >
            {/* Estende o alvo de clique a todo o cartao */}
            <span className="absolute inset-0 z-10" aria-hidden="true" />
            Ver detalhes
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
            <span className="sr-only"> de {product.name}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
