import { createFileRoute } from '@tanstack/react-router'
import { getCategories, getCategoryCounts } from '@/data/catalog'
import { CategoryCard } from '@/components/CategoryCard'
import { ChevronRight, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/categorias/')({
  loader: async () => {
    const [categories, counts] = await Promise.all([
      getCategories(),
      getCategoryCounts(),
    ])
    return { categories, counts }
  },
  component: CategoriesPage,
})

function CategoriesPage() {
  const { categories, counts } = Route.useLoaderData()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-ink-3">
        <a href="/" className="hover:text-ink">Início</a>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-ink">Coleções</span>
      </nav>

      {/* Cabeçalho */}
      <div className="mb-10 max-w-2xl">
        <span className="label-mono mb-2 inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-2 px-3 py-1 text-xs text-ink-2">
          <Sparkles className="h-3.5 w-3.5 text-ember" />
          Coleções & Temáticas
        </span>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          Explora por Coleção
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Peças organizadas por contexto — desde decorações temáticas de época até utilitários e peças funcionais para a tua casa ou escritório.
        </p>
      </div>

      {/* Grelha de Categorias */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            count={counts[category.id] ?? 0}
            size={index === 0 ? 'lg' : 'md'}
            delay={0.04 * index}
          />
        ))}
      </div>
    </div>
  )
}