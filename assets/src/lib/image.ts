export interface ImageOptions {
  width?: number
  height?: number
  fit?: 'cover' | 'contain'
  quality?: number
}

/**
 * Serve as imagens locais diretamente da pasta public sem depender do CDN do Netlify.
 */
export function img(src: string, _options?: ImageOptions): string {
  return src
}

/**
 * Retorna o caminho da imagem de forma compatível com os componentes existentes.
 */
export function imgSrcSet(
  src: string,
  _widths: Array<number>,
  _options?: { aspect?: number; quality?: number },
): string {
  return src
}