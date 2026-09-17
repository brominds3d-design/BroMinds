import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { LogoMark, Wordmark } from './Logo'

const nav = [
  { to: '/', label: 'Início' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/sobre', label: 'Sobre nós' },
  { to: '/contacto', label: 'Contacto' },
] as const

/**
 * Barra de navegacao.
 *
 * Pensada primeiro para telemovel: no telemovel e um painel que abre por cima
 * do conteudo e, a partir de `md`, os links passam a estar todos visiveis.
 */
export function Header() {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  /** Fecha o painel sempre que se navega para outra pagina. */
  useEffect(() => setOpen(false), [pathname])

  /** Impede o fundo de deslizar enquanto o painel esta aberto. */
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-paper-3 bg-paper/88 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-ink"
          aria-label="DuoPixel, página inicial"
        >
          <LogoMark className="h-[26px] w-[26px]" />
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-movel"
          className="grid h-10 w-10 place-items-center rounded-card border border-paper-3 text-ink transition-colors hover:bg-paper-2 md:hidden"
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
        </button>
      </div>

      {/* Painel movel */}
      <div
        id="menu-movel"
        hidden={!open}
        className="border-t border-paper-3 bg-paper md:hidden"
      >
        <nav className="flex flex-col px-4 py-2" aria-label="Navegação principal">
          {nav.map((item, index) => {
            const isActive =
              item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rise flex items-center justify-between border-b border-paper-2 py-3.5 font-display text-lg font-bold last:border-0 ${
                  isActive ? 'text-ember' : 'text-ink'
                }`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                {item.label}
                <span className="label-mono text-ink-3" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

function NavLink({ to, label }: { to: string; label: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={`relative rounded-card px-3 py-2 text-[0.88rem] font-medium transition-colors ${
        isActive ? 'text-ink' : 'text-ink-2 hover:text-ink'
      }`}
    >
      {label}
      {/* Sublinhado curto no item activo, em vez de um fundo pesado */}
      <span
        className={`absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-ember transition-transform duration-300 ease-[var(--ease-out-soft)] ${
          isActive ? 'scale-x-100' : 'scale-x-0'
        }`}
        aria-hidden="true"
      />
    </Link>
  )
}
