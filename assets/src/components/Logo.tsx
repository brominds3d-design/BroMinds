/**
 * Marca DuoPixel: dois quadrados sobrepostos — o "duo" e o "pixel" — com o
 * deslocamento a sugerir duas camadas de impressao ligeiramente desalinhadas.
 */
export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="DuoPixel"
      fill="none"
    >
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <rect
        x="10.5"
        y="10.5"
        width="19"
        height="19"
        rx="3.5"
        fill="var(--color-ember)"
      />
      <rect x="14.6" y="14.6" width="10.8" height="10.8" rx="1.6" fill="var(--color-paper)" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display text-[1.34rem] font-extrabold leading-none tracking-[-0.03em] ${className}`}
    >
      Duo<span className="text-ember">Pixel</span>
    </span>
  )
}
