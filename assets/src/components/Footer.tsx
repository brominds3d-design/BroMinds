import { Link } from '@tanstack/react-router'
import { Instagram, Mail, MapPin } from 'lucide-react'
import { LogoMark, Wordmark } from './Logo'
import { getCategories } from '@/data/catalog'
import { emailUrl, instagramUrl, site } from '@/data/site'

export function Footer() {
  const categories = getCategories()
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-paper-3 bg-ink text-paper">
      <div className="voxel-grid absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            <Wordmark className="text-paper" />
          </div>

          <p className="max-w-[34ch] text-[0.88rem] leading-relaxed text-paper/68">
            Duas irmãs, duas impressoras e uma sala que já não dá para mais
            bobinas. Fazemos peças pequenas, em tiragens pequenas.
          </p>

          <p className="flex items-center gap-2 text-[0.84rem] text-paper/58">
            <MapPin className="h-3.5 w-3.5 text-ember" aria-hidden="true" />
            {site.location}
          </p>
        </div>

        <nav aria-label="Categorias">
          <h2 className="label-mono mb-3.5 text-paper/48">Categorias</h2>
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to="/catalogo/$categorySlug"
                  params={{ categorySlug: category.slug }}
                  className="text-[0.88rem] text-paper/76 transition-colors hover:text-ember"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="label-mono mb-3.5 text-paper/48">Falar com nós</h2>
          <ul className="flex flex-col gap-2.5">
            <li>
              <a
                href={instagramUrl}
                className="flex items-center gap-2 text-[0.88rem] text-paper/76 transition-colors hover:text-ember"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />@
                {site.contact.instagram}
              </a>
            </li>
            <li>
              <a
                href={emailUrl}
                className="flex items-center gap-2 text-[0.88rem] text-paper/76 transition-colors hover:text-ember"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {site.contact.email}
              </a>
            </li>
            <li className="pt-1.5">
              <Link
                to="/contacto"
                className="text-[0.88rem] text-paper/76 underline decoration-paper/25 underline-offset-4 transition-colors hover:text-ember"
              >
                Página de contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[0.76rem] text-paper/42 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {site.name}. Peças feitas por encomenda.
          </p>
          <p>Preços em euros, com IVA incluído.</p>
        </div>
      </div>
    </footer>
  )
}
