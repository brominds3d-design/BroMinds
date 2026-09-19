import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { site } from '@/data/site'

import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${site.name} — ${site.tagline}` },
      { name: 'description', content: site.description },
      { name: 'theme-color', content: '#f7f3ec' },
      { property: 'og:site_name', content: site.name },
      { property: 'og:title', content: `${site.name} — ${site.tagline}` },
      { property: 'og:description', content: site.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/img/oficina-hero.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Instrument+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap',
      },
    ],
  }),
  notFoundComponent: NotFoundFallback,
  shellComponent: RootDocument,
})

function NotFoundFallback() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <span className="label-mono mb-2 rounded-full border border-ink/10 bg-paper-2 px-3 py-1 text-xs text-ink-3">
        404
      </span>
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Página não encontrada</h1>
      <p className="mt-2 text-sm text-ink-2">
        A página ou recurso que procuras não existe ou mudou de endereço.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-card bg-ember px-5 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-ember-deep"
      >
        Voltar à página inicial
      </a>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-card focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Saltar para o conteúdo
        </a>

        <Header />

        <main id="conteudo" className="flex-1">
          {children}
        </main>

        <Footer />
        <Scripts />
      </body>
    </html>
  )
}