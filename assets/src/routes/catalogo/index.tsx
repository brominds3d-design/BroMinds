import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { getProducts, getCategories } from '@/data/catalog'
import { ProductCard } from '@/components/ProductCard'
import { Search } from 'lucide-react'
import { z } from 'zod'

const catalogoSearchSchema = z.object({
  categoria: z.string().optional(),
})

export const Route = createFileRoute('/catalogo/')({
  validateSearch: (search) => catalogoSearchSchema.parse(search),
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
  const searchParams = Route.useSearch()
  const navigate = useNavigate({ from: '/catalogo/' })

  const currentCategoryParam = searchParams?.categoria || 'all'
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategoryParam)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (searchParams?.categoria) {
      setSelectedCategory(searchParams.categoria)
    } else {
      setSelectedCategory('all')
    }
  }, [searchParams?.categoria])

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId)
    navigate({
      search: (prev: any) => ({
        ...prev,
        categoria: catId === 'all' ? undefined : catId,
      }),
    })
  }

  // Função auxiliar segura para obter o identificador da categoria do produto
  const matchesCategory = (p: any, target: string) => {
    if (target === 'all') return true

    const t = target.toLowerCase()

    // 1. Verificar categoryId ou category_id direto
    if (p.categoryId && String(p.categoryId).toLowerCase() === t) return true
    if (p.category_id && String(p.category_id).toLowerCase() === t) return true

    // 2. Se p.category for string
    if (typeof p.category === 'string' && p.category.toLowerCase() === t) return true

    // 3. Se p.category for objeto (relação do Supabase: { id, name, slug })
    if (p.category && typeof p.category === 'object') {
      if (p.category.id && String(p.category.id).toLowerCase() === t) return true
      if (p.category.slug && String(p.category.slug).toLowerCase() === t) return true
      if (p.category.name && String(p.category.name).toLowerCase() === t) return true
    }

    return false
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchCat = matchesCategory(p, selectedCategory)
      const matchSearch =
        (p.name && String(p.name).toLowerCase().includes(search.toLowerCase())) ||
        (p.shortDescription && String(p.shortDescription).toLowerCase().includes(search.toLowerCase()))

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
          onClick={() => handleSelectCategory('all')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            selectedCategory === 'all'
              ? 'bg-ink text-paper'
              : 'border border-paper-3 bg-paper text-ink hover:bg-paper-2'
          }`}
        >
          Todos ({products.length})
        </button>

        {categories.map((cat: any) => {
          const count = products.filter((p: any) =>
            matchesCategory(p, cat.slug || cat.id)
          ).length

          const isSelected =
            String(selectedCategory).toLowerCase() === String(cat.id).toLowerCase() ||
            String(selectedCategory).toLowerCase() === String(cat.slug || '').toLowerCase()

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.slug || cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                isSelected
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
          {filteredProducts.map((product: any, idx: number) => (
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