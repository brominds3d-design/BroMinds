/**
 * Netlify Image CDN.
 *
 * As imagens em `public/img` estao em resolucao alta. Nunca as servimos
 * directamente: passam sempre pelo `/.netlify/images`, que as redimensiona,
 * converte para WebP e guarda em cache no edge.
 */
export interface ImageOptions {
  width: number
  height?: number
  /** `cover` recorta para as dimensoes exactas; precisa de altura. */
  fit?: 'cover' | 'contain'
  quality?: number
}

export function img(src: string, options: ImageOptions): string {
  const { width, height, fit, quality = 78 } = options

  const params = new URLSearchParams({
    url: src,
    w: String(width),
    fm: 'webp',
    q: String(quality),
  })

  if (height) params.set('h', String(height))
  if (fit && height) params.set('fit', fit)

  return `/.netlify/images?${params.toString()}`
}

/**
 * `srcset` para imagens responsivas: o browser escolhe a largura conforme o
 * ecra e o DPR, o que importa sobretudo no telemovel.
 */
export function imgSrcSet(
  src: string,
  widths: Array<number>,
  options?: { aspect?: number; quality?: number },
): string {
  const { aspect, quality } = options ?? {}

  return widths
    .map((width) => {
      const url = img(src, {
        width,
        height: aspect ? Math.round(width * aspect) : undefined,
        fit: aspect ? 'cover' : undefined,
        quality,
      })
      return `${url} ${width}w`
    })
    .join(', ')
}
