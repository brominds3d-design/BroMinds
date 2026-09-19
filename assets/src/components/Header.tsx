import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Menu, X, Sparkles, MessageCircle } from 'lucide-react'
import { LogoMark, Wordmark } from './Logo'
import { site } from '@/data/site'

const nav = [
  { to: '/', label: 'Início' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/contacto', label: 'Contacto' },
] as const

/**
 * Barra de navegação BroMinds.
 * Desktop: logo à esquerda, links centrais e ação rápida à direita.
 * Mobile: menu drawer responsivo com animação suave.
 */
export function Header() {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  /** Fecha o painel ao navegar */
  useEffect(() => setOpen(false), [pathname])

  /** Previne scroll do fundo com menu móvel aberto */
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-paper-3 bg-paper/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Identidade / Logótipo */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-transform active:scale-95"
          aria-label="BroMinds, página inicial"
        >
          <div className="relative flex items-center justify-center">
            <LogoMark className="h-8 w-8 object-contain transition-transform group-hover:scale-105" />
          </div>
          <Wordmark />
        </Link>

        {/* Navegação Desktop */}
        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Navegação principal">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>

        {/* Ações Rápidas à Direita */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href={`https://wa.me/${site.contact.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-paper-3 bg-paper px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-ember hover:text-ember active:scale-95"
          >
            <MessageCircle className="h-3.5 w-3.5 text-ember" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>

        {/* Botão Hambúrguer Mobile */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-movel"
          className="grid h-10 w-10 place-items-center rounded-xl border border-paper-3 text-ink transition hover:border-ember hover:bg-paper-2 md:hidden"
        >
          {open ? (
            <X className="h-5 w-5 text-ember" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
        </button>
      </div>

      {/* Painel Móvel */}
      <div
        id="menu-movel"
        hidden={!open}
        className="border-t border-paper-3 bg-paper/98 px-5 py-6 shadow-xl backdrop-blur-lg md:hidden"
      >
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-paper-2">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Menu de Navegação</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-ember">
            <Sparkles className="h-3 w-3 text-[var(--color-gold)]" /> BroMinds 3D
          </span>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Navegação móvel">
          {nav.map((item, index) => {
            const isActive =
              item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rise flex items-center justify-between rounded-xl px-3 py-3 font-display text-base font-bold transition ${
                  isActive
                    ? 'bg-ember/10 text-ember'
                    : 'text-ink hover:bg-paper-2 hover:text-ember'
                }`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <span>{item.label}</span>
                <span className="font-mono text-xs opacity-40">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 border-t border-paper-3 pt-5">
          <a
            href={`https://wa.me/${site.contact.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ember py-3 text-sm font-semibold text-paper shadow-md transition hover:bg-ember-deep"
          >
            <MessageCircle className="h-4 w-4 text-[var(--color-gold)]" />
            Pedir Orçamento por WhatsApp
          </a>
        </div>
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
      className={`relative rounded-xl px-3.5 py-2 text-[0.88rem] font-semibold transition-colors ${
        isActive ? 'text-ember' : 'text-ink-2 hover:text-ink'
      }`}
    >
      {label}
      <span
        className={`absolute inset-x-3.5 -bottom-[1px] h-[2px] rounded-full bg-ember transition-all duration-300 ease-[var(--ease-out-soft)] ${
          isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
        }`}
        aria-hidden="true"
      />
    </Link>
  )
}