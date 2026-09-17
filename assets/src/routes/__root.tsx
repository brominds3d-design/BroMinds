import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
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
  shellComponent: RootDocument,
})

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
