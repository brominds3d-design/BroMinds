import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Boxes,
  Palette,
  ShoppingBag,
  Sparkles,
  Layers,
} from 'lucide-react'
import { CategoryCard } from '@/components/CategoryCard'
import { OrderButton } from '@/components/OrderButton'
import { ProductCard } from '@/components/ProductCard'
import { Section, SectionHeading } from '@/components/Section'
import {
  getCategoryCounts,
  getFeaturedCategories,
  getProducts,
  getRecentProducts,
} from '@/data/catalog'
import { site } from '@/data/site'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => {
    const [allCategories, recentProducts, counts, allProducts] =
      await Promise.all([
        getFeaturedCategories(),
        getRecentProducts(4),
        getCategoryCounts(),
        getProducts(),
      ])

    // Filtra para remover temporariamente a coleção de Natal
    const activeCategories = allCategories.filter(
      (cat) =>
        cat.id !== 'natal' &&
        !cat.slug?.toLowerCase().includes('natal') &&
        !cat.name?.toLowerCase().includes('natal')
    )

    return {
      featuredCategories: activeCategories,
      recentProducts,
      counts,
      totalProducts: allProducts.length,
    }
  },
})

function HomePage() {
  const {
    featuredCategories,
    recentProducts,
    counts,
    totalProducts,
  } = Route.useLoaderData()

  return (
    <>
      <Hero
        totalProducts={totalProducts}
        categoryCount={featuredCategories.length}
      />

      {/* 1. COLEÇÕES EM PRIMEIRO LUGAR */}
      <Section id="colecoes">
        <SectionHeading
          label="Coleções BroMinds"
          title="Explora por Categoria"
          description="Encontra modelos utilitários, peças decorativas e projetos especiais organizados por tema."
          action={
            {
              href: '/categorias',
              label: 'Ver todas as categorias',
            } as any
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              count={counts[category.id] ?? 0}
              size={index === 0 ? 'lg' : 'md'}
              delay={0.05 * index}
            />
          ))}
        </div>
      </Section>

      {/* 2. NOVIDADES DA OFICINA */}
      {recentProducts.length > 0 && (
        <Section id="recentes">
          <SectionHeading
            label="Novidades da Oficina"
            title="Adicionados Recentemente"
            description="As últimas criações e peças acabadas de sair da nossa impressora 3D."
            action={
              {
                href: '/catalogo',
                label: 'Ver todo o catálogo',
              } as any
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                delay={0.05 * index}
              />
            ))}
          </div>
        </Section>
      )}

      {/* 3. BANNER DE ENCOMENDAS PERSONALIZADAS */}
      <CustomOrderBanner />
    </>
  )
}

function Hero({
  totalProducts,
  categoryCount,
}: {
  totalProducts: number
  categoryCount: number
}) {
  return (
    <div className="relative overflow-hidden border-b border-paper-3 bg-gradient-to-b from-paper to-paper-2/40">
      <div
        className="layer-lines pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          {/* Coluna Esquerda: Texto e Botões */}
          <div className="flex flex-col items-start gap-5 lg:col-span-7">
            <span className="rise label-mono flex items-center gap-2 rounded-full border border-ember/25 bg-ember/10 px-3.5 py-1 text-xs font-semibold text-ember shadow-sm">
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-ember"
                aria-hidden="true"
              />
              BroMinds · Impressão 3D & Design Criativo
            </span>

            <h1
              className="rise text-[2.4rem] font-extrabold leading-[1.05] text-ink sm:text-[3.2rem] lg:text-[3.8rem]"
              style={{ animationDelay: '0.06s' }}
            >
              Design, precisão e{' '}
              <span className="relative inline-block text-ember">
                <span className="relative z-10">ideias em 3D</span>
                <span
                  className="absolute inset-x-0 bottom-1 z-0 h-[0.3em] -rotate-[0.6deg] rounded-[2px] bg-[var(--color-gold)]/35"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <p
              className="rise max-w-[46ch] text-base leading-relaxed text-ink-2 sm:text-lg"
              style={{ animationDelay: '0.12s' }}
            >
              Peças decorativas e utilitárias impressas sob encomenda com
              filamento premium. Feito à medida para a tua casa ou secretária.
            </p>

            {/* BOTÕES PRINCIPAIS */}
            <div
              className="rise flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
              style={{ animationDelay: '0.18s' }}
            >
              <a
                href="#colecoes"
                className="group inline-flex items-center justify-center gap-2 rounded-card bg-ember px-6 py-3.5 font-semibold text-paper shadow-md transition hover:bg-ember-deep active:scale-[0.985]"
              >
                <Layers className="h-4 w-4 text-[var(--color-gold)]" />
                Explorar Coleções
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center gap-2 rounded-card border border-paper-3 bg-paper px-6 py-3.5 font-semibold text-ink transition hover:border-ember hover:bg-paper-2"
              >
                <ShoppingBag className="h-4 w-4 text-ink-3" />
                Ver Todo o Catálogo
              </Link>

              {/* NOVO BOTÃO: CRIAR PACK DE NATAL */}
              <Link
                to="/packs-natal"
                className="inline-flex items-center justify-center gap-2 rounded-card border border-ember/30 bg-[var(--color-gold)]/20 px-6 py-3.5 font-semibold text-ink transition hover:border-ember hover:bg-[var(--color-gold)]/35"
              >
                <Sparkles className="h-4 w-4 text-ember" />
                Criar Pack de Natal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* ESTATÍSTICAS */}
            <dl
              className="rise mt-1 flex flex-wrap gap-x-6 gap-y-2 border-t border-paper-3 pt-4 text-ink-2"
              style={{ animationDelay: '0.24s' }}
            >
              <Stat
                icon={Boxes}
                value={`${totalProducts} modelos`}
                label="disponíveis"
              />

              <Stat
                icon={Palette}
                value={`${categoryCount} categorias`}
                label="em catálogo"
              />

              <Stat
                icon={Sparkles}
                value="Personalização"
                label="Cores e detalhes à tua escolha"
              />
            </dl>
          </div>

          {/* Coluna Direita: Cartão com Logótipo */}
          <div className="hidden items-center justify-center lg:col-span-5 lg:flex">
            <div className="group relative flex aspect-square w-full max-w-[340px] flex-col items-center justify-center rounded-3xl border border-paper-3 bg-gradient-to-br from-paper via-paper to-ember/5 p-8 shadow-xl transition-all duration-500 hover:border-ember/30">
              <div
                className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-ember/20 to-[var(--color-gold)]/20 opacity-50 blur-xl transition duration-500 group-hover:opacity-80"
              />

              <div className="relative z-10 flex flex-col items-center text-center">
                <img
                  src="/img/logo-brominds.png"
                  alt="BroMinds 3D"
                  className="h-48 w-48 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                />

                <span className="mt-4 font-mono text-xs uppercase tracking-widest text-ink-3">
                  Oficina de Impressão 3D
                </span>

                <span className="text-xs font-semibold text-ember">
                  BroMinds Oficial
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Boxes
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-ember" aria-hidden="true" />

      <div>
        <dt className="font-mono text-[0.86rem] font-medium text-ink">
          {value}
        </dt>

        <dd className="text-[0.74rem] text-ink-3">{label}</dd>
      </div>
    </div>
  )
}

function CustomOrderBanner() {
  return (
    <Section>
      <div className="grain relative overflow-hidden rounded-card-lg bg-ember-deep px-6 py-12 text-paper sm:px-10 sm:py-16">
        <div
          className="voxel-grid absolute inset-0 opacity-25"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-start gap-5 sm:max-w-[48ch]">
          <span className="label-mono text-[var(--color-gold)]">
            Projetos Personalizados
          </span>

          <h2 className="text-[1.8rem] sm:text-[2.2rem]">
            Precisas de uma peça com medidas ou cores personalizadas?
          </h2>

          <p className="text-[0.95rem] leading-relaxed text-paper/80">
            Fazemos impressões sob encomenda a partir de ficheiros STL ou das
            tuas próprias ideias. Entra em contacto connosco para orçamentos
            sem compromisso.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <OrderButton
              size="lg"
              className="bg-paper !text-ink hover:bg-ember hover:!text-ink"
            />

            <Link
              to="/contacto"
              className="inline-flex items-center justify-center gap-2 rounded-card border border-paper/25 px-6 py-4 font-semibold text-paper transition-colors hover:bg-paper/10"
            >
              Contactar
            </Link>
          </div>
        </div>
      </div>
    </Section>
  )
}