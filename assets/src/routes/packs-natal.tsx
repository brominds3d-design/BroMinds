import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, CustomerUser } from '@/lib/auth'
import { addToCart, WHATSAPP_CONTACTS } from '@/lib/cart'
import { AuthModal } from '@/components/AuthModal'

export const Route = createFileRoute('/packs-natal')({
  component: PacksNatalPage,
})

type Variant = {
  name: string
  price: number
  size?: string | null
}

type PackProduct = {
  id: string
  slug: string
  name: string
  base_price: number
  images: Array<{ src?: string; alt?: string }> | null
  variants: Variant[] | null
  pack_eligible: boolean
  pack_type: string | null
  pack_size: string | null
  pack_price: number | null
}

type Selection = Record<string, number>

type ContactPerson = 'tiago' | 'ines'

const money = (value: number) =>
  new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)

function extractSizeLetter(text: string): string {
  const match = text.match(/\b([SML])\b/i) || text.match(/^([SML])/i)
  return match ? match[1].toUpperCase() : text
}

function cleanDimensions(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/x/g, ' × ')
    .replace(/\s*×\s*/g, ' × ')
    .replace(/\(\s*/g, '(')
    .replace(/\s*\)/g, ')')
    .trim()
}

// Preço "padrão" das decorações dentro do pack (secção 4).
// O preço real de cada peça vem do campo pack_price no Supabase;
// esta constante serve apenas para o texto da secção e para decidir
// se é preciso mostrar o preço no cartão (só se for diferente).
const PACK_DECORATION_PRICE = 5.5

// Preço de uma decoração dentro do pack:
// usa pack_price se estiver preenchido no Supabase; caso contrário, 5,50 €.
// (O preço normal do catálogo, base_price, não é usado no pack.)
function packPriceOf(product: PackProduct): number {
  return product.pack_price != null
    ? Number(product.pack_price)
    : PACK_DECORATION_PRICE
}

const LED_INCLUDED_SLUGS = [
  'casa-natal',
  'casa-natal-s',
  'casa-natal-m',
  'igreja-natal',
]

// Remove acentos e passa para minúsculas, para comparar nomes e slugs
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// Peças maiores que vão para o ponto 3 ("Peças em destaque"),
// com o seu preço normal, junto das casas.
const FEATURED_KEYWORDS = ['arvore', 'presepio']

// Extrai as dimensões que estão entre parênteses, ex.: "S (5 x 4,7 x 7cm)"
function dimensionsFromLabel(text: string): string {
  const match = text.match(/\(([^)]+)\)/)
  return match ? cleanDimensions(match[1]) : ''
}

// Os números vêm de src/lib/cart.ts (iguais em todo o site)
const CONTACT_NUMBERS: Record<ContactPerson, string> = {
  tiago: WHATSAPP_CONTACTS[0].phone,
  ines: WHATSAPP_CONTACTS[1].phone,
}

function PacksNatalPage() {
  const [products, setProducts] = useState<PackProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [baseSize, setBaseSize] = useState('S')
  const [selectedPlates, setSelectedPlates] = useState<Selection>({})
  const [houses, setHouses] = useState<Selection>({})
  const [decorations, setDecorations] = useState<Selection>({})
  const [selectedContactDesktop, setSelectedContactDesktop] = useState<ContactPerson | null>(null)
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)

  // Carrinho
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [addingPack, setAddingPack] = useState(false)
  const [packAdded, setPackAdded] = useState(false)

  useEffect(() => {
    async function loadProducts() {
      const { data, error: queryError } = await supabase
        .from('products')
        .select(
          'id, slug, name, base_price, images, variants, pack_eligible, pack_type, pack_size, pack_price',
        )
        .eq('category_id', 'natal')
        .eq('pack_eligible', true)
        .eq('published', true) // os rascunhos não entram nos packs
        .order('name', { ascending: true })

      if (queryError) {
        console.error('Erro ao carregar produtos:', queryError)
        setError('Não foi possível carregar os produtos de Natal.')
      } else {
        setProducts((data ?? []) as PackProduct[])
      }

      setLoading(false)
    }

    void loadProducts()
  }, [])

  const base = products.find((product) => product.pack_type === 'base')
  const plaque = products.find((product) => product.pack_type === 'placa')

  const isHouseProduct = (product: PackProduct) => {
    const s = product.slug.toLowerCase()
    const n = product.name.toLowerCase()
    if (s.includes('igreja') || n.includes('igreja')) return false
    return (
      product.pack_type === 'casa' ||
      s.includes('casa') ||
      n.includes('casa')
    )
  }

  const isFeaturedProduct = (product: PackProduct) => {
    const text = normalizeText(`${product.slug} ${product.name}`)
    return FEATURED_KEYWORDS.some((keyword) => text.includes(keyword))
  }

  const houseProducts = products.filter(isHouseProduct)

  // Árvore de Natal e Presépio (ponto 3)
  const featuredProducts = products.filter(
    (product) =>
      product.pack_type !== 'base' &&
      product.pack_type !== 'placa' &&
      !isHouseProduct(product) &&
      isFeaturedProduct(product),
  )

  // Restantes decorações a 5,50 € (ponto 4)
  const decorationProducts = products.filter(
    (product) =>
      product.pack_type !== 'base' &&
      product.pack_type !== 'placa' &&
      !isHouseProduct(product) &&
      !isFeaturedProduct(product),
  )

  function priceFor(product: PackProduct | undefined, sizeLabel: string): number {
    if (!product) return 0
    const variant = product.variants?.find(
      (item) =>
        extractSizeLetter(item.name) === sizeLabel || item.name === sizeLabel,
    )
    return Number(variant?.price ?? product.base_price)
  }

  function updateSelection(
    setter: React.Dispatch<React.SetStateAction<Selection>>,
    key: string,
    quantity: number,
  ) {
    setter((current) => {
      const next = { ...current }
      if (quantity <= 0) {
        delete next[key]
      } else {
        next[key] = Math.min(10, quantity)
      }
      return next
    })
  }

  const basePrice = priceFor(base, baseSize)

  const selectedPlateItems = Object.entries(selectedPlates).map(
    ([size, quantity]) => ({
      size,
      quantity,
      price: priceFor(plaque, size),
    }),
  )

  const platesTotal = selectedPlateItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  // Ponto 3 — Peças em destaque: casas S/M + Árvore + Presépio (preço normal)
  const houseItems = useMemo(() => {
    const items: Array<{
      key: string
      name: string
      dims: string
      price: number
      quantity: number
      image?: string
      led: boolean
      isHouse: boolean
    }> = []

    const mainHouse = houseProducts[0]

    if (mainHouse) {
      if (mainHouse.variants && mainHouse.variants.length > 0) {
        mainHouse.variants.forEach((variant) => {
          const letter = extractSizeLetter(variant.name)
          const key = `casa_${letter}`
          items.push({
            key,
            name: `Casa de Natal ${letter}`,
            dims: dimensionsFromLabel(variant.name),
            price: Number(variant.price),
            quantity: houses[key] ?? 0,
            image: mainHouse.images?.[0]?.src,
            led: true,
            isHouse: true,
          })
        })
      } else {
        houseProducts.forEach((prod) => {
          const letter = prod.slug.includes('-s') ? 'S' : 'M'
          items.push({
            key: prod.id,
            name: `Casa de Natal ${letter}`,
            dims: cleanDimensions(prod.pack_size),
            price: Number(prod.base_price),
            quantity: houses[prod.id] ?? 0,
            image: prod.images?.[0]?.src,
            led: true,
            isHouse: true,
          })
        })
      }
    }

    featuredProducts.forEach((prod) => {
      items.push({
        key: prod.id,
        name: prod.name,
        dims: cleanDimensions(prod.pack_size),
        price: Number(prod.base_price),
        quantity: houses[prod.id] ?? 0,
        image: prod.images?.[0]?.src,
        led: LED_INCLUDED_SLUGS.includes(prod.slug),
        isHouse: false,
      })
    })

    return items
  }, [houseProducts, featuredProducts, houses])

  const selectedHouses = houseItems.filter((item) => item.quantity > 0)
  const housesTotal = selectedHouses.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const selectedDecorations = useMemo(
    () =>
      decorationProducts
        .filter((product) => (decorations[product.id] ?? 0) > 0)
        .map((product) => ({
          product,
          quantity: decorations[product.id],
          // Dentro do pack usa-se o preço de pack (ex.: 5,50 €)
          price: packPriceOf(product),
        })),
    [decorationProducts, decorations],
  )

  const decorationCount = selectedDecorations.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  const decorationsTotal = selectedDecorations.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const subtotalBruto = basePrice + platesTotal + housesTotal + decorationsTotal

  const discountRate =
    subtotalBruto >= 30
      ? 0.12
      : subtotalBruto >= 20
        ? 0.08
        : subtotalBruto >= 12
          ? 0.05
          : 0

  const discount = subtotalBruto * discountRate
  const total = subtotalBruto - discount

  const nextTierMessage =
    subtotalBruto < 12
      ? `Faltam ${money(12 - subtotalBruto)} para ativares 5% de desconto!`
      : subtotalBruto < 20
        ? `Faltam ${money(20 - subtotalBruto)} para subires para 8% de desconto!`
        : subtotalBruto < 30
          ? `Faltam ${money(30 - subtotalBruto)} para o desconto máximo de 12%!`
          : '🎉 Parabéns! Atingiste o desconto máximo de 12%!'

  function triggerOrder(contact: ContactPerson) {
    if (!base) {
      setError('A base de Natal não está disponível.')
      return
    }

    setError('')

    const baseVariant = base.variants?.find(
      (v) => extractSizeLetter(v.name) === baseSize,
    )
    const baseLabel = cleanDimensions(baseVariant?.name || baseSize)

    const lines = [
      '🎄 *Pedido de Natal — BROMINDS*',
      '',
      `Base: ${base.name} (${baseLabel}) — ${money(basePrice)}`,
      '',
      '*Placas:*',
      ...(selectedPlateItems.length > 0
        ? selectedPlateItems.map(
            (item) =>
              `${plaque?.name ?? 'Placa'} (${item.size}) × ${item.quantity} — ${money(item.price * item.quantity)}`,
          )
        : ['Sem placas']),
      '',
      '*Peças em destaque:*',
      ...(selectedHouses.length > 0
        ? selectedHouses.map(
            (item) =>
              `${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`,
          )
        : ['Sem peças em destaque']),
      '',
      '*Mais decorações:*',
      ...(selectedDecorations.length > 0
        ? selectedDecorations.map(
            (item) =>
              `${item.product.name} × ${item.quantity} (${money(item.price)}/un.) — ${money(item.price * item.quantity)}`,
          )
        : ['Sem decorações adicionais']),
      '',
      `Subtotal: ${money(subtotalBruto)}`,
      ...(discount > 0
        ? [`Desconto especial (${Math.round(discountRate * 100)}%): −${money(discount)}`]
        : []),
      `*Total final: ${money(total)}*`,
      '',
      'Olá! Gostaria de confirmar esta encomenda. Qual é a disponibilidade?',
    ]

    const message = encodeURIComponent(lines.join('\n'))
    const whatsappNumber = CONTACT_NUMBERS[contact]

    setContactModalOpen(false)

    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  // Lista do que o pack leva, para mostrar no carrinho e na mensagem
  function buildPackDetails(): string[] {
    const baseVariant = base?.variants?.find(
      (v) => extractSizeLetter(v.name) === baseSize,
    )
    const baseLabel = cleanDimensions(baseVariant?.name || baseSize)

    const details = [`Base ${baseLabel} — ${money(basePrice)}`]

    selectedPlateItems.forEach((item) =>
      details.push(
        `Placa ${item.size} × ${item.quantity} — ${money(item.price * item.quantity)}`,
      ),
    )

    selectedHouses.forEach((item) =>
      details.push(
        `${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`,
      ),
    )

    selectedDecorations.forEach((item) =>
      details.push(
        `${item.product.name} × ${item.quantity} — ${money(item.price * item.quantity)}`,
      ),
    )

    if (discount > 0) {
      details.push(
        `Desconto ${Math.round(discountRate * 100)}% aplicado (−${money(discount)})`,
      )
    }

    return details
  }

  async function addPackToCart(user: CustomerUser) {
    if (!base) {
      setError('A base de Natal não está disponível.')
      return
    }

    setAddingPack(true)
    setPackAdded(false)
    setError('')

    try {
      await addToCart(user.handle, {
        item_type: 'pack',
        name: 'Pack de Natal personalizado',
        unit_price: Number(total.toFixed(2)),
        quantity: 1,
        image: base.images?.[0]?.src ?? null,
        details: buildPackDetails(),
      })
      setPackAdded(true)
    } catch (err) {
      console.error('Erro ao adicionar pack ao carrinho:', err)
      setError('Não foi possível adicionar o pack ao carrinho.')
    } finally {
      setAddingPack(false)
    }
  }

  function handleAddPackToCart() {
    const user = getCurrentUser()
    if (!user) {
      setShowAuthModal(true)
      return
    }
    void addPackToCart(user)
  }

  function handleDesktopSend() {
    if (!selectedContactDesktop) {
      setError('Seleciona quem pretendes contactar (Tiago ou Inês).')
      return
    }
    triggerOrder(selectedContactDesktop)
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="text-ink-2">A preparar a coleção de Natal...</p>
      </section>
    )
  }

  if (error && products.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-ink">Packs de Natal</h1>
        <p className="mt-4 text-ink-2">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-card bg-ember px-5 py-3 font-semibold text-white"
        >
          Tentar novamente
        </button>
      </section>
    )
  }

  const renderSummaryDetails = () => (
    <>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-ink-2">Base · {baseSize}</span>
          <span className="font-medium text-ink">{money(basePrice)}</span>
        </div>

        {selectedPlateItems.map((item) => (
          <div key={item.size} className="flex justify-between gap-3">
            <span className="text-ink-2">
              Placa {item.size} × {item.quantity}
            </span>
            <span className="font-medium text-ink">
              {money(item.price * item.quantity)}
            </span>
          </div>
        ))}

        {selectedHouses.map((item) => (
          <div key={item.key} className="flex justify-between gap-3">
            <span className="text-ink-2">
              {item.name} × {item.quantity}
            </span>
            <span className="font-medium text-ink">
              {money(item.price * item.quantity)}
            </span>
          </div>
        ))}

        {selectedDecorations.map((item) => (
          <div key={item.product.id} className="flex justify-between gap-3">
            <span className="text-ink-2">
              {item.product.name} × {item.quantity}
            </span>
            <span className="font-medium text-ink">
              {money(item.price * item.quantity)}
            </span>
          </div>
        ))}

        <div className="border-t border-ink/10 pt-3">
          <div className="flex justify-between gap-3">
            <span className="text-ink-2">Placas</span>
            <span className="text-ink">{money(platesTotal)}</span>
          </div>

          <div className="mt-2 flex justify-between gap-3">
            <span className="text-ink-2">Peças em destaque</span>
            <span className="text-ink">{money(housesTotal)}</span>
          </div>

          <div className="mt-2 flex justify-between gap-3">
            <span className="text-ink-2">
              Outras decorações ({decorationCount})
            </span>
            <span className="text-ink">{money(decorationsTotal)}</span>
          </div>

          {discount > 0 && (
            <div className="mt-2 flex justify-between gap-3">
              <span className="text-ink-2">
                Desconto ({Math.round(discountRate * 100)}%)
              </span>
              <span className="font-medium text-emerald-700">
                −{money(discount)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-ink/10 pt-4">
          <span className="font-semibold text-ink">Total estimado</span>
          <span className="text-2xl font-bold text-ink">{money(total)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-paper-2 p-3 text-xs font-medium text-ink-2">
        {nextTierMessage}
      </div>
    </>
  )

  const plaqueImage = plaque?.images?.[0]?.src

  return (
    <div className="bg-paper pb-36 lg:pb-12">
      <section className="border-b border-ink/10 bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-ember">
            BROMINDS · Coleção de Natal
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Cria o teu pack de Natal
          </h1>

          <p className="mt-4 max-w-2xl text-ink-2">
            Dá vida à magia do Natal com uma combinação feita por ti.
            Escolhe a base, adiciona placas, casas e decorações para criar
            um pack único.
          </p>

          <p className="mt-4 max-w-2xl font-medium text-ember">
            Decorações a {money(PACK_DECORATION_PRICE)} cada e descontos diretos a partir de 12 €!
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1fr_340px] lg:gap-10 lg:py-10">
        {/* RESUMO LATERAL - DESKTOP */}
        <aside className="hidden h-fit rounded-card border border-ink/10 bg-white p-5 sm:p-6 lg:order-2 lg:block lg:sticky lg:top-6">
          <p className="text-xs uppercase tracking-[0.15em] text-ember">
            A tua escolha
          </p>

          <h2 className="mt-2 text-2xl font-bold text-ink">
            Resumo do pack
          </h2>

          <div className="mt-6">
            {renderSummaryDetails()}
          </div>

          {/* Contacto no PC */}
          <div className="mt-6 border-t border-ink/10 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-2">
              Contactar
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedContactDesktop('tiago')
                  setError('')
                }}
                className={`rounded-card border p-3 text-left transition ${
                  selectedContactDesktop === 'tiago'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-ink/10 bg-white hover:border-ink/30'
                }`}
              >
                <p className="font-bold text-ink text-sm">Tiago Costa</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedContactDesktop('ines')
                  setError('')
                }}
                className={`rounded-card border p-3 text-left transition ${
                  selectedContactDesktop === 'ines'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-ink/10 bg-white hover:border-ink/30'
                }`}
              >
                <p className="font-bold text-ink text-sm">Inês Costa</p>
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleDesktopSend}
            disabled={!base || !selectedContactDesktop}
            className="mt-6 w-full rounded-card bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Encomendar pelo WhatsApp
          </button>

          <p className="mt-3 text-center text-xs text-ink-2">
            Envia o teu pack para confirmar a encomenda.
          </p>

          <div className="my-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-ink-2">
            <span className="h-px flex-1 bg-ink/10" />
            ou
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <button
            type="button"
            onClick={handleAddPackToCart}
            disabled={!base || addingPack}
            className="flex w-full items-center justify-center gap-2 rounded-card border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-ember hover:text-ember disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            {addingPack ? 'A adicionar...' : 'Adicionar pack ao carrinho'}
          </button>

          {packAdded && (
            <p className="mt-3 text-center text-xs font-semibold text-emerald-700">
              ✓ Pack adicionado.{' '}
              <Link to="/carrinho" className="underline">
                Ver carrinho
              </Link>
            </p>
          )}
        </aside>

        {/* PASSOS DE SELEÇÃO */}
        <div className="order-1 min-w-0 space-y-10">
          {/* 1. ESCOLHE A BASE */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white">
                1
              </span>
              <div>
                <h2 className="text-xl font-bold text-ink">Escolhe a base</h2>
                <p className="text-sm text-ink-2">
                  Seleciona o tamanho da tua base.
                </p>
              </div>
            </div>

            {!base ? (
              <p className="text-sm text-ink-2">
                Não foi encontrada uma base de Natal.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(base.variants ?? []).map((variant) => {
                  const letter = extractSizeLetter(variant.name)
                  const label = cleanDimensions(variant.name)

                  return (
                    <button
                      key={variant.name}
                      type="button"
                      aria-pressed={baseSize === letter}
                      onClick={() => setBaseSize(letter)}
                      className={`rounded-card border p-4 text-left transition ${
                        baseSize === letter
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-ink/10 bg-white hover:border-ink/30'
                      }`}
                    >
                      <span className="block text-base font-bold text-ink">
                        {label}
                      </span>
                      <span className="mt-2 block text-sm font-semibold text-ink">
                        {money(Number(variant.price))}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* 2. ESCOLHE AS PLACAS (COM FOTO) */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white">
                2
              </span>
              <div>
                <h2 className="text-xl font-bold text-ink">
                  Escolhe as placas
                </h2>
                <p className="text-sm text-ink-2">
                  Podes adicionar várias unidades de cada tamanho.
                </p>
              </div>
            </div>

            {!plaque ? (
              <p className="text-sm text-ink-2">
                Não há placas disponíveis neste momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {(plaque.variants ?? []).map((variant) => {
                  const label = cleanDimensions(variant.name)
                  const quantity = selectedPlates[label] ?? 0

                  return (
                    <article
                      key={variant.name}
                      className={`overflow-hidden rounded-card border bg-white p-4 transition ${
                        quantity > 0
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-ink/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper-2">
                          {plaqueImage ? (
                            <img
                              src={plaqueImage}
                              alt={variant.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">🪵</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-ink text-sm sm:text-base">
                            Placa {label}
                          </h3>
                          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-ink">
                            {money(Number(variant.price))} / unidade
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-3 border-t border-ink/5 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateSelection(
                              setSelectedPlates,
                              label,
                              quantity - 1,
                            )
                          }
                          disabled={quantity === 0}
                          aria-label={`Remover placa ${label}`}
                          className="flex size-8 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="min-w-5 text-center font-semibold text-ink">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateSelection(
                              setSelectedPlates,
                              label,
                              quantity + 1,
                            )
                          }
                          disabled={quantity >= 10}
                          aria-label={`Adicionar placa ${label}`}
                          className="flex size-8 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* 3. PEÇAS EM DESTAQUE (casas, árvore, presépio) */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white">
                3
              </span>
              <div>
                <h2 className="text-xl font-bold text-ink">
                  Peças em destaque
                </h2>
                <p className="text-sm text-ink-2">
                  As peças principais do teu cenário, cada uma com o seu preço.
                </p>
              </div>
            </div>

            {houseItems.length === 0 ? (
              <p className="text-sm text-ink-2">
                Não foram encontradas peças em destaque.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {houseItems.map((item) => (
                  <article
                    key={item.key}
                    className={`rounded-card border bg-white p-4 transition ${
                      item.quantity > 0
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                        : 'border-ink/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper-2">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">
                            {item.isHouse ? '🏠' : '🎄'}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-ink">
                          {item.name}
                        </h3>
                        {item.dims && (
                          <p className="mt-0.5 text-xs text-ink-2">
                            {item.dims}
                          </p>
                        )}
                        <p className="mt-1 font-medium text-ember">
                          {money(item.price)}
                        </p>
                        {item.led && (
                          <p className="mt-1 text-xs font-medium text-emerald-700">
                            ✓ Vela LED incluída
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateSelection(setHouses, item.key, item.quantity - 1)
                        }
                        disabled={item.quantity === 0}
                        aria-label={`Remover ${item.name}`}
                        className="flex size-9 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30"
                      >
                        −
                      </button>

                      <span className="min-w-5 text-center font-semibold text-ink">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateSelection(setHouses, item.key, item.quantity + 1)
                        }
                        disabled={item.quantity >= 10}
                        aria-label={`Adicionar ${item.name}`}
                        className="flex size-9 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* 4. MAIS DECORAÇÕES */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white">
                4
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-ink">
                    Mais decorações
                  </h2>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    {money(PACK_DECORATION_PRICE)} cada
                  </span>
                </div>
                <p className="text-sm text-ink-2">
                  No pack, todas as decorações custam {money(PACK_DECORATION_PRICE)}.
                  Junta mais peças e aproveita os descontos por valor.
                </p>
              </div>
            </div>

            {decorationProducts.length === 0 ? (
              <p className="text-sm text-ink-2">
                Não foram encontradas outras decorações de Natal.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {decorationProducts.map((product) => {
                  const quantity = decorations[product.id] ?? 0
                  const image = product.images?.[0]?.src
                  const isChurch = product.slug.includes('igreja')
                  const ledIncluded =
                    isChurch || LED_INCLUDED_SLUGS.includes(product.slug)
                  const dims = cleanDimensions(product.pack_size)

                  const packPrice = packPriceOf(product)
                  // Só mostra o preço no cartão se for diferente dos 5,50 €
                  const showOwnPrice = packPrice !== PACK_DECORATION_PRICE

                  return (
                    <article
                      key={product.id}
                      className={`overflow-hidden rounded-card border bg-white transition ${
                        quantity > 0
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                          : 'border-ink/10'
                      }`}
                    >
                      <div className="flex gap-4 p-4">
                        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper-2">
                          {image ? (
                            <img
                              src={image}
                              alt={product.images?.[0]?.alt || product.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">
                              {isChurch ? '⛪' : '🎄'}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-ink">
                            {product.name}
                          </h3>
                          {dims && (
                            <p className="mt-0.5 text-xs text-ink-2">
                              {dims}
                            </p>
                          )}

                          {showOwnPrice && (
                            <p className="mt-1 font-medium text-ember">
                              {money(packPrice)}
                            </p>
                          )}

                          {ledIncluded && (
                            <p className="mt-1 text-xs font-medium text-emerald-700">
                              ✓ Vela LED incluída
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                updateSelection(
                                  setDecorations,
                                  product.id,
                                  quantity - 1,
                                )
                              }
                              disabled={quantity === 0}
                              aria-label={`Remover ${product.name}`}
                              className="flex size-8 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30"
                            >
                              −
                            </button>

                            <span className="min-w-4 text-center font-semibold text-ink">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateSelection(
                                  setDecorations,
                                  product.id,
                                  quantity + 1,
                                )
                              }
                              disabled={quantity >= 10}
                              aria-label={`Adicionar ${product.name}`}
                              className="flex size-8 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </section>

      {/* BARRA FIXA FLUTUANTE EM MOBILE */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 p-4 shadow-xl backdrop-blur-md lg:hidden">
        {mobileSummaryOpen && (
          <div className="mb-4 max-h-[60vh] overflow-y-auto rounded-card border border-ink/10 bg-paper p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-ink">Detalhes do Pack</h3>
              <button
                type="button"
                onClick={() => setMobileSummaryOpen(false)}
                className="text-xs font-semibold text-ink-2"
              >
                ✕ Fechar
              </button>
            </div>
            {renderSummaryDetails()}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen((prev) => !prev)}
            className="text-left"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-ink">{money(total)}</span>
              {discount > 0 && (
                <span className="text-xs font-medium text-emerald-700">
                  (−{Math.round(discountRate * 100)}%)
                </span>
              )}
            </div>
            <span className="block text-xs font-medium text-emerald-700 underline">
              {mobileSummaryOpen ? 'Esconder resumo' : 'Ver resumo'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddPackToCart}
              disabled={!base || addingPack}
              aria-label="Adicionar pack ao carrinho"
              className="flex size-11 items-center justify-center rounded-card border border-ink/15 bg-white text-ink shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              disabled={!base}
              className="rounded-card bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition active:scale-95 disabled:opacity-50"
            >
              Encomendar WhatsApp
            </button>
          </div>
        </div>

        {packAdded && (
          <p className="mt-2 text-center text-xs font-semibold text-emerald-700">
            ✓ Pack adicionado ao carrinho.{' '}
            <Link to="/carrinho" className="underline">
              Ver carrinho
            </Link>
          </p>
        )}
      </div>

      {/* POPUP / MODAL DE ESCOLHA DE CONTACTO EM MOBILE */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-card border border-ink/10 bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Com quem queres falar?</h3>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="flex size-7 items-center justify-center rounded-full bg-paper-2 text-ink-2 hover:text-ink text-sm"
              >
                ✕
              </button>
            </div>

            <p className="mt-1.5 text-xs text-ink-2">
              Escolhe um dos contactos para enviar o teu pack pelo WhatsApp:
            </p>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => triggerOrder('tiago')}
                className="w-full rounded-card border border-emerald-600/30 bg-emerald-50/50 p-3.5 text-left transition active:scale-98 hover:border-emerald-600 hover:bg-emerald-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-ink">Tiago Costa</p>
                    <p className="text-xs text-ink-2">Modelação & Produção 3D</p>
                  </div>
                  <span className="text-lg">💬</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => triggerOrder('ines')}
                className="w-full rounded-card border border-emerald-600/30 bg-emerald-50/50 p-3.5 text-left transition active:scale-98 hover:border-emerald-600 hover:bg-emerald-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-ink">Inês Costa</p>
                    <p className="text-xs text-ink-2">Atendimento & Encomendas</p>
                  </div>
                  <span className="text-lg">💬</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user: CustomerUser) => void addPackToCart(user)}
      />
    </div>
  )
}