import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { getProducts, getCategories } from '@/data/catalog'
import { ProductCard } from '@/components/ProductCard'
import { Search, SlidersHorizontal } from 'lucide-react'

export const Route = createFileRoute('/catalogo/')({
  loader: async () => {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ])
    return { products, categories }
  },
  component: CatalogoPage,
})

function CatalogoPage() {
  const { products, categories } = Route.useLoaderData()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, selectedCategory, search])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Catálogo BroMinds</h1>
          <p className="mt-1 text-sm text-ink-2">
            Todas as nossas peças e decorações impressas em 3D.
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar peça..."
            className="w-full rounded-xl border border-paper-3 bg-paper py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition focus:border-ember"
          />
        </div>
      </div>

      {/* Filtros de Categoria */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            selectedCategory === 'all'
              ? 'bg-ink text-paper'
              : 'border border-paper-3 bg-paper text-ink hover:bg-paper-2'
          }`}
        >
          Todos ({products.length})
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id).length
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-ink text-paper'
                  : 'border border-paper-3 bg-paper text-ink hover:bg-paper-2'
              }`}
            >
              {cat.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Grelha de Produtos */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} delay={0.03 * idx} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-paper-3 p-12 text-center text-ink-3">
          <p>Nenhuma peça encontrada com estes filtros.</p>
        </div>
      )}
    </div>
  )
}