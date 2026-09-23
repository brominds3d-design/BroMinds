import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Heart, ArrowLeft, User, LogOut } from 'lucide-react'
import { getCurrentUser, saveCurrentUser, getFavoriteProductIds, CustomerUser } from '@/lib/auth'
import { getProducts, ProductWithCategory } from '@/data/catalog'
import { ProductCard } from '@/components/ProductCard'
import { AuthModal } from '@/components/AuthModal'

export const Route = createFileRoute('/favoritos')({
  component: FavoritesPage,
})

function FavoritesPage() {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [favProducts, setFavProducts] = useState<Array<ProductWithCategory>>([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      const [favIds, allProducts] = await Promise.all([
        getFavoriteProductIds(currentUser.handle),
        getProducts(),
      ])

      const filtered = allProducts.filter((p) => favIds.includes(String(p.id)))
      setFavProducts(filtered)
    } else {
      setFavProducts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()

    const onFavChange = () => loadData()
    const onAuthChange = () => loadData()

    window.addEventListener('favorites_changed', onFavChange)
    window.addEventListener('auth_changed', onAuthChange)

    return () => {
      window.removeEventListener('favorites_changed', onFavChange)
      window.removeEventListener('auth_changed', onAuthChange)
    }
  }, [])

  const handleLogout = () => {
    saveCurrentUser(null)
    setUser(null)
    setFavProducts([])
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Topo */}
      <header className="border-b border-paper-3 bg-paper">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/catalogo"
            className="flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao catálogo
          </Link>

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-ink-2 flex items-center gap-1.5 bg-paper-2 px-3 py-1.5 rounded-full border border-paper-3">
                <User className="h-3.5 w-3.5 text-ember" />
                @{user.handle} ({user.displayName})
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-ink-3 hover:text-red-600 transition flex items-center gap-1"
                title="Sair desta sessão"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ember">
            <Heart className="h-4 w-4 fill-current" />
            Lista Pessoal
          </div>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Os teus Favoritos</h1>
          <p className="mt-1 text-sm text-ink-3">
            Peças que guardaste para encomendar mais tarde ou acompanhar novidades.
          </p>
        </div>

        {!user ? (
          <div className="rounded-3xl border border-dashed border-paper-3 bg-paper-2 p-12 text-center max-w-md mx-auto">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ember/10 text-ember">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-ink">Entra para ver a tua lista</h2>
            <p className="mt-1 text-xs leading-5 text-ink-3">
              Inicia sessão com o teu @arroba para guardares e recuperares as tuas peças preferidas a qualquer altura.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="mt-6 rounded-xl bg-ember px-6 py-2.5 text-sm font-semibold text-paper hover:bg-ember-deep transition shadow-sm"
            >
              Identificar-me com o meu @
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-sm text-ink-3">A carregar favoritos...</div>
        ) : favProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-paper-3 bg-paper-2 p-12 text-center max-w-md mx-auto">
            <p className="text-sm font-bold text-ink">Ainda não guardaste peças favoritas</p>
            <p className="mt-1 text-xs text-ink-3">
              Explora o catálogo e clica no coração de qualquer peça para a guardares aqui.
            </p>
            <Link
              to="/catalogo"
              className="mt-6 inline-block rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-paper hover:bg-ember transition"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {favProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => loadData()}
      />
    </div>
  )
}