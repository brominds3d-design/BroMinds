import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle,
  Gift,
  Image as ImageIcon,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  User,
} from 'lucide-react'
import { getCurrentUser, CustomerUser } from '@/lib/auth'
import {
  WHATSAPP_CONTACTS,
  WhatsAppContact,
  CartItem,
  buildCartMessage,
  cartItemOptions,
  cartTotal,
  clearCart,
  getCartItems,
  money,
  removeCartItem,
  updateCartQuantity,
  whatsappLink,
} from '@/lib/cart'
import { AuthModal } from '@/components/AuthModal'

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

function CartPage() {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null)
  const [askClear, setAskClear] = useState(false)
  const [orderSent, setOrderSent] = useState(false)

  const loadData = async () => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      setItems(await getCartItems(currentUser.handle))
    } else {
      setItems([])
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadData()

    const onChange = () => void loadData()
    window.addEventListener('cart_changed', onChange)
    window.addEventListener('auth_changed', onChange)

    return () => {
      window.removeEventListener('cart_changed', onChange)
      window.removeEventListener('auth_changed', onChange)
    }
  }, [])

  const changeQuantity = async (item: CartItem, quantity: number) => {
    setBusyId(item.id)
    setError('')
    try {
      await updateCartQuantity(item.id, quantity)
    } catch {
      setError('Não foi possível atualizar a quantidade.')
    } finally {
      setBusyId(null)
    }
  }

  const removeItem = async (item: CartItem) => {
    setBusyId(item.id)
    setError('')
    try {
      await removeCartItem(item.id)
    } catch {
      setError('Não foi possível remover a peça.')
    } finally {
      setBusyId(null)
    }
  }

  const handleClearCart = async () => {
    if (!user) return
    try {
      await clearCart(user.handle)
      setAskClear(false)
      setOrderSent(true)
    } catch {
      setError('Não foi possível limpar o carrinho.')
    }
  }

  const total = cartTotal(items)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const message = user ? buildCartMessage(items, user) : ''

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Topo */}
      <header className="border-b border-paper-3 bg-paper">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/catalogo"
            className="flex items-center gap-2 text-sm font-semibold text-ink-2 transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuar a comprar
          </Link>

          {user && (
            <span className="flex items-center gap-1.5 rounded-full border border-paper-3 bg-paper-2 px-3 py-1.5 text-xs font-bold text-ink-2">
              <User className="h-3.5 w-3.5 text-ember" />@{user.handle}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ember">
            <ShoppingCart className="h-4 w-4" />
            Encomenda
          </div>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">O teu carrinho</h1>
          <p className="mt-1 text-sm text-ink-3">
            Junta as peças que queres e envia tudo numa só mensagem pelo WhatsApp.
          </p>
        </div>

        {orderSent && (
          <div className="mx-auto mb-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            Obrigado pela encomenda! Vamos responder-te pelo WhatsApp o mais depressa possível.
          </div>
        )}

        {!user ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-paper-3 bg-paper-2 p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ember/10 text-ember">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-ink">Entra para ver o teu carrinho</h2>
            <p className="mt-1 text-xs leading-5 text-ink-3">
              Inicia sessão com o teu @ para guardares peças no carrinho e
              encomendares tudo de uma vez.
            </p>
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="mt-6 rounded-xl bg-ember px-6 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-ember-deep"
            >
              Identificar-me com o meu @
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-sm text-ink-3">A carregar o carrinho...</div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-paper-3 bg-paper-2 p-12 text-center">
            <p className="text-sm font-bold text-ink">O teu carrinho está vazio</p>
            <p className="mt-1 text-xs text-ink-3">
              Explora o catálogo ou monta um pack de Natal e adiciona as peças aqui.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link
                to="/catalogo"
                className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-ember"
              >
                Explorar catálogo
              </Link>
              <Link
                to="/packs-natal"
                className="rounded-xl border border-paper-3 bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ember"
              >
                Criar pack de Natal
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-10">
            {/* LISTA */}
            <div className="space-y-3">
              {items.map((item) => {
                const options = cartItemOptions(item)
                const busy = busyId === item.id
                const isPack = item.item_type === 'pack'

                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border border-paper-3 bg-white p-4 transition ${
                      busy ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper-2">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="size-full object-cover" />
                        ) : isPack ? (
                          <Gift className="h-7 w-7 text-ember" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-ink-3" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {item.product_slug && !isPack ? (
                              <Link
                                to="/catalogo/$productSlug"
                                params={{ productSlug: item.product_slug }}
                                className="font-semibold text-ink hover:text-ember"
                              >
                                {item.name}
                              </Link>
                            ) : (
                              <h3 className="font-semibold text-ink">{item.name}</h3>
                            )}

                            {options && <p className="mt-0.5 text-xs text-ink-3">{options}</p>}
                          </div>

                          <button
                            type="button"
                            onClick={() => void removeItem(item)}
                            disabled={busy}
                            className="shrink-0 rounded-lg p-1.5 text-ink-3 transition hover:bg-red-50 hover:text-red-600"
                            aria-label={`Remover ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {item.details.length > 0 && (
                          <ul className="mt-2 space-y-0.5 text-xs text-ink-2">
                            {item.details.map((detail, index) => (
                              <li key={index}>• {detail}</li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex h-9 items-center overflow-hidden rounded-lg border border-paper-3">
                            <button
                              type="button"
                              onClick={() => void changeQuantity(item, item.quantity - 1)}
                              disabled={busy}
                              className="flex h-full w-9 items-center justify-center text-ink-2 hover:bg-paper-2"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => void changeQuantity(item, item.quantity + 1)}
                              disabled={busy}
                              className="flex h-full w-9 items-center justify-center text-ink-2 hover:bg-paper-2"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-ink">
                              {money(item.unit_price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-[11px] text-ink-3">
                                {money(item.unit_price)} / unidade
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* RESUMO */}
            <aside className="h-fit rounded-2xl border border-paper-3 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-ink">Resumo</h2>

              <div className="mt-4 flex justify-between text-sm text-ink-2">
                <span>Peças</span>
                <span>{itemCount}</span>
              </div>

              <div className="mt-4 flex items-end justify-between border-t border-paper-3 pt-4">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-2xl font-extrabold text-ink">{money(total)}</span>
              </div>

              <div className="mt-6 border-t border-paper-3 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-2">
                  Enviar encomenda para
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {WHATSAPP_CONTACTS.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setSelectedContact(contact)}
                      className={`rounded-xl border p-3 text-left transition ${
                        selectedContact?.id === contact.id
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-paper-3 bg-white hover:border-ink/30'
                      }`}
                    >
                      <p className="text-sm font-bold text-ink">{contact.name}</p>
                      <p className="mt-0.5 text-[11px] text-ink-3">{contact.role}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

              {selectedContact ? (
                <a
                  href={whatsappLink(selectedContact.phone, message)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setAskClear(true)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-md transition hover:bg-emerald-700"
                >
                  <MessageCircle className="h-5 w-5" />
                  Encomendar pelo WhatsApp
                </a>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-paper-3 bg-paper-2 px-4 py-3 text-center text-xs text-ink-3">
                  Escolhe Tiago ou Inês para enviar a encomenda.
                </div>
              )}

              {askClear && (
                <div className="mt-4 rounded-xl border border-paper-3 bg-paper-2 p-4">
                  <p className="text-sm font-semibold text-ink">Já enviaste a mensagem?</p>
                  <p className="mt-1 text-xs text-ink-3">
                    Se sim, podemos esvaziar o carrinho.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleClearCart()}
                      className="flex-1 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-paper hover:bg-ember"
                    >
                      Sim, limpar carrinho
                    </button>
                    <button
                      type="button"
                      onClick={() => setAskClear(false)}
                      className="flex-1 rounded-lg border border-paper-3 bg-white px-3 py-2 text-xs font-semibold text-ink hover:bg-paper-2"
                    >
                      Ainda não
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => void loadData()}
      />
    </div>
  )
}