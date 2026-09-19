import { Link } from '@tanstack/react-router'
import { Product } from '@/data/catalog'

interface ProductCardProps {
  product: Product
  priority?: boolean
  delay?: number
}

export function ProductCard({ product, priority = false, delay = 0 }: ProductCardProps) {
  const hasImages = product.images && product.images.length > 0 && product.images[0].src
  const hasHoverImage = product.images && product.images.length > 1 && product.images[1].src

  return (
    <Link
      to="/catalogo/$productSlug"
      params={{ productSlug: product.slug }}
      style={{ animationDelay: `${delay}s` }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-paper-3 bg-paper transition duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lg"
    >
      {/* Contetor da Imagem com suporte a Hover */}
      <div className="relative aspect-square w-full overflow-hidden bg-paper-2">
        {hasImages ? (
          <>
            {/* Foto 1 (Capa) */}
            <img
              src={product.images[0].src}
              alt={product.images[0].alt || product.name}
              loading={priority ? 'eager' : 'lazy'}
              className={`h-full w-full object-cover transition-all duration-500 ease-out ${
                hasHoverImage
                  ? 'group-hover:scale-105 group-hover:opacity-0'
                  : 'group-hover:scale-105'
              }`}
            />

            {/* Foto 2 (Revelada no Hover) */}
            {hasHoverImage && (
              <img
                src={product.images[1].src}
                alt={`${product.name} perspetiva secundária`}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-mono text-ink-3">
            Sem imagem
          </div>
        )}

        {/* Tag da Categoria */}
        {product.category && (
          <span className="label-mono absolute left-3 top-3 z-10 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] text-ink-2 shadow-sm backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Info da Peça */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold text-ink group-hover:text-ember transition-colors line-clamp-1">
          {product.name}
        </h3>

        {product.shortDescription && (
          <p className="mt-1 text-xs text-ink-3 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-paper-2">
          <span className="text-xs text-ink-3">A partir de</span>
          <span className="text-sm font-extrabold font-mono text-ink">
            {product.basePrice.toFixed(2)} €
          </span>
        </div>
      </div>
    </Link>
  )
}