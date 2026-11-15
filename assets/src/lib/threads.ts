/**
 * Cores do fio metálico dos pendentes (fixas).
 * Para mudar uma cor, altera aqui o nome ou o hex.
 */
export interface ThreadColor {
  name: string
  hex: string
}

export const THREAD_COLORS: ThreadColor[] = [
  { name: 'Bege', hex: '#C9A97E' },
  { name: 'Laranja', hex: '#D9862B' },
  { name: 'Prata', hex: '#C7C9CC' },
  { name: 'Dourado', hex: '#D9B12C' },
  { name: 'Vermelho', hex: '#B5242E' },
  { name: 'Rosa choque', hex: '#B3226E' },
]

/** Fundo com brilho, para o quadradinho parecer fio metálico */
export function metallicBackground(hex: string) {
  return `linear-gradient(135deg, ${hex} 0%, #ffffff66 45%, ${hex} 55%, ${hex} 100%), ${hex}`
}