import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

/**
 * Cabecalho de seccao: rotulo tecnico, titulo e, opcionalmente, um link
 * "ver todos" que no telemovel passa para baixo do titulo.
 */
export function SectionHeading({
  label,
  title,
  description,
  action,
}: {
  label: string
  title: string
  description?: string
  action?: { to: string; label: string; params?: Record<string, string> }
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2.5">
        <span className="label-mono flex items-center gap-2 text-ember-deep">
          <span className="h-[2px] w-6 bg-ember" aria-hidden="true" />
          {label}
        </span>

        <h2 className="max-w-[24ch] text-[1.7rem] sm:text-[2.1rem]">{title}</h2>

        {description ? (
          <p className="max-w-[52ch] text-[0.92rem] leading-relaxed text-ink-2">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          to={action.to}
          params={action.params}
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-card border border-ink/18 px-4 py-2.5 text-[0.85rem] font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-paper-2 sm:self-auto"
        >
          {action.label}
          <ArrowRight
            className="h-3.5 w-3.5 text-ember transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  )
}

/** Faixa de largura maxima e espacamento padrao das seccoes. */
export function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 ${className}`}
    >
      {children}
    </section>
  )
}
