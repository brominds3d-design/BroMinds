import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

const money = (value: number) =>
  new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)

const LED_INCLUDED_SLUGS = [
  'casa-natal',
  'casa-natal-s',
  'casa-natal-m',
  'igreja-natal',
]

function PacksNatalPage() {
  const [products, setProducts] = useState<PackProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [baseSize, setBaseSize] = useState('S')
  const [selectedPlates, setSelectedPlates] = useState<Selection>({})
  const [houses, setHouses] = useState<Selection>({})
  const [decorations, setDecorations] = useState<Selection>({})
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)

  useEffect(() => {
    async function loadProducts() {
      const { data, error: queryError } = await supabase
        .from('products')
        .select(
          'id, slug, name, base_price, images, variants, pack_eligible, pack_type, pack_size, pack_price',
        )
        .eq('category_id', 'natal')
        .eq('pack_eligible', true)
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

  // Casas de Natal (exclui igreja)
  const houseProducts = products.filter(
    (product) =>
      product.pack_type === 'casa' ||
      product.slug === 'casa-natal' ||
      product.slug === 'casa-natal-s' ||
      product.slug === 'casa-natal-m',
  )

  // Mais decorações (inclui a igreja e exclui base, placa e casas)
  const decorationProducts = products.filter(
    (product) =>
      product.pack_type !== 'base' &&
      product.pack_type !== 'placa' &&
      !houseProducts.some((h) => h.id === product.id),
  )

  function priceFor(product: PackProduct | undefined, size: string): number {
    if (!product) return 0
    const variant = product.variants?.find((item) => item.name === size)
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

  // Casas de Natal
  const houseItems = useMemo(() => {
    const items: Array<{
      key: string
      name: string
      size: string
      size_cm: string | null
      price: number
      quantity: number
      image?: string
    }> = []

    const singleHouse = houseProducts.find(
      (p) => p.slug === 'casa-natal' && (p.variants?.length ?? 0) > 0,
    )

    if (singleHouse && singleHouse.variants) {
      singleHouse.variants
        .filter((v) => ['S', 'M'].includes(v.name.toUpperCase()))
        .forEach((variant) => {
          const key = `casa_${variant.name}`
          const sizeName = variant.name.toUpperCase()
          items.push({
            key,
            name: `Casa de Natal (${sizeName})`,
            size: sizeName,
            size_cm: variant.size || singleHouse.pack_size,
            price: Number(variant.price),
            quantity: houses[key] ?? 0,
            image: singleHouse.images?.[0]?.src,
          })
        })
    } else {
      houseProducts.forEach((prod) => {
        const isS = prod.slug.includes('-s') || prod.name.toUpperCase().includes('S')
        const sizeName = isS ? 'S' : 'M'
        items.push({
          key: prod.id,
          name: `Casa de Natal (${sizeName})`,
          size: sizeName,
          size_cm: prod.pack_size,
          price: Number(prod.base_price),
          quantity: houses[prod.id] ?? 0,
          image: prod.images?.[0]?.src,
        })
      })
    }

    return items
  }, [houseProducts, houses])

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
          price: Number(product.base_price),
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

  // Descontos por patamar de valor total bruto
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

  function sendOrder() {
    if (!base) {
      setError('A base de Natal não está disponível.')
      return
    }

    setError('')

    const lines = [
      '🎄 *Pedido de Natal — BROMINDS*',
      '',
      `Base: ${base.name} (${baseSize}) — ${money(basePrice)}`,
      '',
      '*Placas:*',
      ...(selectedPlateItems.length > 0
        ? selectedPlateItems.map(
            (item) =>
              `${plaque?.name ?? 'Placa'} (${item.size}) × ${item.quantity} — ${money(item.price * item.quantity)}`,
          )
        : ['Sem placas']),
      '',
      '*Casas de Natal:*',
      ...(selectedHouses.length > 0
        ? selectedHouses.map(
            (item) =>
              `${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`,
          )
        : ['Sem casas de Natal']),
      '',
      '*Mais decorações:*',
      ...(selectedDecorations.length > 0
        ? selectedDecorations.map(
            (item) =>
              `${item.product.name} × ${item.quantity} — ${money(item.price * item.quantity)}`,
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
    const whatsappNumber = '351916175751'

    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      '_blank',
      'noopener,noreferrer',
    )
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
            <span className="text-ink-2">Casas</span>
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

  return (
    <div className="bg-paper pb-32 lg:pb-12">
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
            Descontos diretos a partir de 12 €! Aproveita até 12% de desconto no teu conjunto.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1fr_340px] lg:gap-10 lg:py-10">
        {/* RESUMO LATERAL - DESKTOP (STICKY) */}
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

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={sendOrder}
            disabled={!base}
            className="mt-6 w-full rounded-card bg-ember px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Encomendar pelo WhatsApp
          </button>

          <p className="mt-3 text-center text-xs text-ink-2">
            Envia o teu pack para confirmar a encomenda.
          </p>
        </aside>

        {/* PRODUTOS / PASSOS */}
        <div className="order-1 min-w-0 space-y-10">
          {/* 1. BASE */}
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
              <div className="grid grid-cols-3 gap-3">
                {(base.variants ?? []).map((variant) => {
                  const sizeCm = variant.size || base.pack_size
                  return (
                    <button
                      key={variant.name}
                      type="button"
                      aria-pressed={baseSize === variant.name}
                      onClick={() => setBaseSize(variant.name)}
                      className={`rounded-card border p-4 text-left transition ${
                        baseSize === variant.name
                          ? 'border-ember bg-ember/5 ring-1 ring-ember'
                          : 'border-ink/10 bg-white hover:border-ink/30'
                      }`}
                    >
                      <span className="block text-lg font-bold text-ink">
                        {variant.name}
                      </span>
                      {sizeCm && (
                        <span className="mt-0.5 block text-xs text-ink-2">
                          {variant.name} ({sizeCm})
                        </span>
                      )}
                      <span className="mt-2 block text-sm font-semibold text-ink">
                        {money(Number(variant.price))}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* 2. PLACAS */}
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
                  const quantity = selectedPlates[variant.name] ?? 0
                  const sizeCm = variant.size || plaque.pack_size

                  return (
                    <article
                      key={variant.name}
                      className={`rounded-card border bg-white p-4 transition ${
                        quantity > 0
                          ? 'border-ember bg-ember/5 ring-1 ring-ember'
                          : 'border-ink/10'
                      }`}
                    >
                      <h3 className="text-lg font-bold text-ink">
                        Placa {variant.name}
                      </h3>
                      {sizeCm && (
                        <p className="mt-0.5 text-xs text-ink-2">
                          {variant.name} ({sizeCm})
                        </p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {money(Number(variant.price))} / unidade
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateSelection(
                              setSelectedPlates,
                              variant.name,
                              quantity - 1,
                            )
                          }
                          disabled={quantity === 0}
                          aria-label={`Remover placa ${variant.name}`}
                          className="flex size-9 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30"
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
                              variant.name,
                              quantity + 1,
                            )
                          }
                          disabled={quantity >= 10}
                          aria-label={`Adicionar placa ${variant.name}`}
                          className="flex size-9 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30"
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

          {/* 3. CASAS DE NATAL */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white">
                3
              </span>
              <div>
                <h2 className="text-xl font-bold text-ink">
                  Casas de Natal
                </h2>
                <p className="text-sm text-ink-2">
                  Escolhe o tamanho da casa e a quantidade pretendida.
                </p>
              </div>
            </div>

            {houseItems.length === 0 ? (
              <p className="text-sm text-ink-2">
                Não foram encontradas casas de Natal.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {houseItems.map((item) => (
                  <article
                    key={item.key}
                    className={`rounded-card border bg-white p-4 transition ${
                      item.quantity > 0
                        ? 'border-ember bg-ember/5 ring-1 ring-ember'
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
                          <span className="text-3xl">🏠</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-ink">
                          Casa de Natal ({item.size})
                        </h3>
                        {item.size_cm && (
                          <p className="mt-0.5 text-xs text-ink-2">
                            {item.size} ({item.size_cm})
                          </p>
                        )}
                        <p className="mt-1 font-medium text-ember">
                          {money(item.price)}
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-emerald-700">
                          ✓ Vela LED incluída
                        </p>
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
              <div>
                <h2 className="text-xl font-bold text-ink">
                  Mais decorações
                </h2>
                <p className="text-sm text-ink-2">
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

                  return (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-card border border-ink/10 bg-white"
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
                          {product.pack_size && (
                            <p className="mt-0.5 text-xs text-ink-2">
                              {product.pack_size}
                            </p>
                          )}
                          <p className="mt-1 font-medium text-ember">
                            {money(Number(product.base_price))}
                          </p>

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
        {/* Painel expansível com detalhes do resumo em mobile */}
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
            <span className="block text-xs font-medium text-ember underline">
              {mobileSummaryOpen ? 'Esconder resumo' : 'Ver resumo'}
            </span>
          </button>

          <button
            type="button"
            onClick={sendOrder}
            disabled={!base}
            className="rounded-card bg-ember px-5 py-3 text-sm font-semibold text-white shadow-md transition active:scale-95 disabled:opacity-50"
          >
            Encomendar WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}