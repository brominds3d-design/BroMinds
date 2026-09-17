import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/data/types'
import { img, imgSrcSet } from '@/lib/image'

/**
 * Carrossel de imagens do produto.
 *
 * Usa `scroll-snap` nativo em vez de um carrossel em JavaScript: no telemovel
 * o arrastar com o dedo e o do proprio browser (fluido e com inercia) e no
 * computador as setas e as miniaturas deslocam a mesma faixa. Com uma so
 * imagem, esconde os controlos e comporta-se como uma fotografia simples.
 */
export function Gallery({ images, name }: { images: Array<ProductImage>; name: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const multiple = images.length > 1

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' })
  }, [])

  /** Mantem o indicador certo quando se arrasta com o dedo. */
  const onScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    setActive(Math.max(0, Math.min(images.length - 1, index)))
  }, [images.length])

  const step = useCallback(
    (direction: -1 | 1) => {
      const next = (active + direction + images.length) % images.length
      setActive(next)
      scrollTo(next)
    },
    [active, images.length, scrollTo],
  )

  /** Setas do teclado enquanto a galeria tem o foco. */
  useEffect(() => {
    const track = trackRef.current
    if (!track || !multiple) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
      }
    }

    track.addEventListener('keydown', onKey)
    return () => track.removeEventListener('keydown', onKey)
  }, [multiple, step])

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative overflow-hidden rounded-card-lg border border-paper-3 bg-paper-2">
        <div
          ref={trackRef}
          onScroll={onScroll}
          tabIndex={multiple ? 0 : -1}
          role={multiple ? 'group' : undefined}
          aria-label={multiple ? `Imagens de ${name}` : undefined}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <div
              key={image.src}
              className="aspect-square w-full shrink-0 snap-center"
            >
              <img
                src={img(image.src, { width: 900, height: 900, fit: 'cover' })}
                srcSet={imgSrcSet(image.src, [480, 700, 900, 1200], { aspect: 1 })}
                sizes="(min-width: 1024px) 34rem, 94vw"
                alt={image.alt}
                width={900}
                height={900}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {multiple ? (
          <>
            <GalleryArrow side="left" onClick={() => step(-1)} />
            <GalleryArrow side="right" onClick={() => step(1)} />

            <span className="label-mono absolute right-3 top-3 rounded-full bg-ink/72 px-2.5 py-1 text-paper backdrop-blur-sm">
              {active + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      {multiple ? (
        <div className="flex gap-2.5" role="tablist" aria-label="Escolher imagem">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Imagem ${index + 1} de ${images.length}`}
              onClick={() => {
                setActive(index)
                scrollTo(index)
              }}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-card border-2 transition-all duration-200 sm:h-[4.5rem] sm:w-[4.5rem] ${
                index === active
                  ? 'border-ember opacity-100'
                  : 'border-transparent opacity-58 hover:opacity-100'
              }`}
            >
              <img
                src={img(image.src, { width: 160, height: 160, fit: 'cover' })}
                alt=""
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function GalleryArrow({
  side,
  onClick,
}: {
  side: 'left' | 'right'
  onClick: () => void
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Imagem anterior' : 'Imagem seguinte'}
      className={`absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-paper-3 bg-paper/92 text-ink shadow-sm backdrop-blur-sm transition-[opacity,transform] duration-200 hover:scale-105 active:scale-95 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 ${
        side === 'left' ? 'left-3' : 'right-3'
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
