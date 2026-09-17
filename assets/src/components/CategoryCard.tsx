import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Category } from '@/data/types'
import { img, imgSrcSet } from '@/lib/image'

/** Cartao de categoria: imagem de capa, nome, frase curta e contagem de pecas. */
export function CategoryCard({
  category,
  count,
  delay,
  size = 'md',
}: {
  category: Category
  count: number
  delay?: number
  /** `lg` ocupa duas colunas na grelha e usa um recorte mais panoramico. */
  size?: 'md' | 'lg'
}) {
  const aspect = size === 'lg' ? 0.66 : 1.06

  return (
    <Link
      to="/catalogo/$categorySlug"
      params={{ categorySlug: category.slug }}
      className={`group relative flex overflow-hidden rounded-card-lg bg-ink transition-transform duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 ${
        size === 'lg' ? 'sm:col-span-2' : ''
      } ${delay === undefined ? '' : 'rise'}`}
      style={delay === undefined ? undefined : { animationDelay: `${delay}s` }}
    >
      <img
        src={img(category.image, {
          width: 760,
          height: Math.round(760 * aspect),
          fit: 'cover',
        })}
        srcSet={imgSrcSet(category.image, [380, 560, 760, 1040], { aspect })}
        sizes={
          size === 'lg'
            ? '(min-width: 640px) 44rem, 92vw'
            : '(min-width: 640px) 22rem, 92vw'
        }
        alt={`Peças da categoria ${category.name}`}
        className="absolute inset-0 h-full w-full object-cover opacity-[0.82] transition-[transform,opacity] duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06] group-hover:opacity-100"
        loading="lazy"
        decoding="async"
      />

      {/* Gradiente que garante contraste do texto sobre qualquer fotografia */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent"
        aria-hidden="true"
      />

      <div
        className={`relative z-10 flex w-full flex-col justify-end gap-1.5 p-5 text-paper ${
          size === 'lg' ? 'min-h-[17rem] sm:min-h-[19rem]' : 'min-h-[13.5rem]'
        }`}
      >
        <span className="label-mono text-paper/62">
          {count} {count === 1 ? 'peça' : 'peças'}
        </span>

        <h3 className="flex items-center gap-2 font-display text-2xl font-bold">
          {category.name}
          <ArrowUpRight
            className="h-4 w-4 text-ember transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </h3>

        <p className="max-w-[30ch] text-[0.86rem] leading-snug text-paper/78">
          {category.tagline}
        </p>
      </div>
    </Link>
  )
}
