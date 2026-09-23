import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Box,
  Image as ImageIcon,
} from 'lucide-react'
import { getProductBySlug, getRelatedProducts } from '@/data/catalog'
import { ProductCard } from '@/components/ProductCard'
import { ModelViewer } from '@/components/ModelViewer'

export const Route = createFileRoute('/catalogo/$productSlug')({
  loader: async ({ params }) => {
    const product = await getProductBySlug(params.productSlug)

    if (!product) {
      throw new Error('Produto não encontrado')
    }

    const prod = product as any
    const categoryId = prod.categoryId ?? prod.category_id

    const relatedProducts = await (getRelatedProducts as any)(
      categoryId,
      prod.id,
    )

    return {
      product,
      relatedProducts,
    }
  },
  component: ProductPage,
})

function ProductPage() {
  const { product, relatedProducts } = Route.useLoaderData()
  const currentProduct = product as any

  const variants =
    currentProduct.variants && currentProduct.variants.length > 0
      ? currentProduct.variants
      : [
          {
            name: 'Tamanho Único',
            price: currentProduct.price,
            dimensions: '',
          },
        ]

  const whatsappContacts = [
    {
      name: 'Tiago Costa',
      role: 'Modelação & Produção 3D',
      phone: '351916175751',
    },
    {
      name: 'Inês Costa',
      role: 'Atendimento & Encomendas',
      phone: '351911565367',
    },
  ]

  const [selectedVariant, setSelectedVariant] = useState(variants[0])
  const [selectedColor, setSelectedColor] = useState(
    currentProduct.colors?.[0] ?? null,
  )
  const [selectedImage, setSelectedImage] = useState(
    currentProduct.images?.[0]?.src ?? '',
  )
  const [selectedContact, setSelectedContact] = useState<
    (typeof whatsappContacts)[number] | null
  >(null)
  const [quantity, setQuantity] = useState(1)

  // Alternador entre modo Foto e 3D
  const [viewMode, setViewMode] = useState<'image' | '3d'>('image')

  // Caminho do ficheiro .glb existente em public/
  const model3dUrl = currentProduct.model3d || '/Untitled.glb'

  useEffect(() => {
    const newVariants =
      currentProduct.variants && currentProduct.variants.length > 0
        ? currentProduct.variants
        : [
            {
              name: 'Tamanho Único',
              price: currentProduct.price,
              dimensions: '',
            },
          ]

    setSelectedVariant(newVariants[0])
    setSelectedColor(currentProduct.colors?.[0] ?? null)
    setSelectedImage(currentProduct.images?.[0]?.src ?? '')
    setSelectedContact(null)
    setQuantity(1)
    setViewMode('image')
  }, [product])

  const messageText = encodeURIComponent(
    `Olá BroMinds! Gostava de encomendar a peça "${currentProduct.name}" no tamanho ${
      selectedVariant.name
    }${
      selectedColor ? ` e na cor ${selectedColor.name}` : ''
    }. Quantidade: ${quantity}. (Preço: ${(
      selectedVariant.price * quantity
    ).toFixed(2)} €)`,
  )

  const totalPrice = selectedVariant.price * quantity

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* =========================================================
          CABEÇALHO
      ========================================================== */}
      <header className="border-b border-paper-3 bg-paper">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[72px] items-center justify-between">
            <Link
              to="/catalogo"
              className="flex items-center gap-2 text-sm font-semibold text-ink-2 transition hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao catálogo
            </Link>

            <div className="hidden items-center gap-2 text-sm text-ink-3 sm:flex">
              <Link to="/catalogo" className="transition hover:text-ink">
                Catálogo
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="max-w-[220px] truncate text-ink">
                {currentProduct.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          PRODUTO
      ========================================================== */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-12 xl:gap-16">
          {/* =====================================================
              GALERIA COM SUPORTE 3D
          ====================================================== */}
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-3xl border border-paper-3 bg-paper-2 shadow-sm">
              {/* Botões alternadores no canto superior direito */}
              <div className="absolute right-4 top-4 z-10 flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('image')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                    viewMode === 'image'
                      ? 'bg-paper text-ink shadow-sm'
                      : 'bg-paper/60 text-ink-2 hover:bg-paper/80'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Foto
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                    viewMode === '3d'
                      ? 'bg-ember text-paper shadow-sm'
                      : 'bg-paper/60 text-ink-2 hover:bg-paper/80'
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  Ver em 3D
                </button>
              </div>

              {/* Área principal (Foto ou 3D) */}
              <div className="aspect-square w-full">
                {viewMode === '3d' ? (
                  <div className="h-full w-full">
                    <ModelViewer model={model3dUrl} />
                  </div>
                ) : selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={currentProduct.name}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-ink-3">
                    Sem imagem disponível
                  </div>
                )}
              </div>
            </div>

            {/* Miniaturas de seleção rápida */}
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border bg-paper-2 p-2 text-xs font-medium transition ${
                  viewMode === '3d'
                    ? 'border-ember text-ember ring-2 ring-ember/20'
                    : 'border-paper-3 text-ink-2 hover:border-ink-3'
                }`}
              >
                <Box className="h-6 w-6" />
                <span>3D</span>
              </button>

              {currentProduct.images &&
                currentProduct.images.map((image: any, index: number) => {
                  const isSelected =
                    viewMode === 'image' && selectedImage === image.src

                  return (
                    <button
                      key={`${image.src}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedImage(image.src)
                        setViewMode('image')
                      }}
                      className={`aspect-square overflow-hidden rounded-xl border bg-paper-2 transition ${
                        isSelected
                          ? 'border-ember ring-2 ring-ember/20'
                          : 'border-paper-3 hover:border-ink-3'
                      }`}
                    >
                      <img
                        src={image.src}
                        alt={`${currentProduct.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                })}
            </div>
          </div>

          {/* =====================================================
              INFORMAÇÃO DO PRODUTO
          ====================================================== */}
          <div className="min-w-0">
            <div className="lg:sticky lg:top-8">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ember">
                <ShoppingBag className="h-4 w-4" />
                Impressão 3D
              </div>

              <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-5xl">
                {currentProduct.name}
              </h1>

              {currentProduct.shortDescription && (
                <p className="mt-4 text-base leading-7 text-ink-2 sm:text-lg">
                  {currentProduct.shortDescription}
                </p>
              )}

              <div className="mt-6 flex items-end gap-2">
                <span className="text-3xl font-extrabold text-ink">
                  {totalPrice.toFixed(2)} €
                </span>

                {quantity > 1 && (
                  <span className="pb-1 text-sm text-ink-3">
                    {selectedVariant.price.toFixed(2)} € / unidade
                  </span>
                )}
              </div>

              <div className="my-7 h-px bg-paper-3" />

              {/* Descrição */}
              {currentProduct.description && (
                <div className="mb-7">
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink">
                    Sobre esta peça
                  </h2>
                  <p className="whitespace-pre-line text-sm leading-6 text-ink-2">
                    {currentProduct.description}
                  </p>
                </div>
              )}

              {/* Variantes */}
              {variants.length > 1 && (
                <div className="mb-7">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-ink">
                      Tamanho / Variante
                    </h2>
                    <span className="text-xs text-ink-3">
                      {selectedVariant.name}
                    </span>
                  </div>

                  <div className="grid gap-2">
                    {variants.map((variant: any, index: number) => {
                      const selected = selectedVariant.name === variant.name

                      return (
                        <button
                          key={`${variant.name}-${index}`}
                          type="button"
                          onClick={() => setSelectedVariant(variant)}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                            selected
                              ? 'border-ember bg-ember/5'
                              : 'border-paper-3 bg-paper hover:bg-paper-2'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {variant.name}
                            </p>
                            {variant.dimensions && (
                              <p className="mt-1 text-xs text-ink-3">
                                {variant.dimensions}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-bold text-ink">
                            {variant.price.toFixed(2)} €
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Cores */}
              {currentProduct.colors && currentProduct.colors.length > 0 && (
                <div className="mb-7">
                  <h2 className="mb-3 text-sm font-bold text-ink">Cor</h2>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.colors.map((color: any, index: number) => {
                      const selected = selectedColor?.name === color.name

                      return (
                        <button
                          key={`${color.name}-${index}`}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            selected
                              ? 'border-ember bg-ember text-paper'
                              : 'border-paper-3 bg-paper text-ink hover:bg-paper-2'
                          }`}
                        >
                          {color.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantidade */}
              <div className="mb-7">
                <h2 className="mb-3 text-sm font-bold text-ink">Quantidade</h2>
                <div className="flex h-12 w-fit items-center overflow-hidden rounded-xl border border-paper-3 bg-paper">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="flex h-full w-12 items-center justify-center text-ink-2 transition hover:bg-paper-2"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="flex w-12 justify-center text-sm font-bold text-ink">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="flex h-full w-12 items-center justify-center text-ink-2 transition hover:bg-paper-2"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Contactos */}
              <div className="mb-4">
                <h2 className="mb-3 text-sm font-bold text-ink">Contactar</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {whatsappContacts.map((contact) => {
                    const selected = selectedContact?.phone === contact.phone

                    return (
                      <button
                        key={contact.phone}
                        type="button"
                        onClick={() => setSelectedContact(contact)}
                        className={`rounded-xl border p-3 text-left transition ${
                          selected
                            ? 'border-ember bg-ember/5 ring-2 ring-ember/10'
                            : 'border-paper-3 bg-paper hover:bg-paper-2'
                        }`}
                      >
                        <p className="text-sm font-semibold text-ink">
                          {contact.name}
                        </p>
                        <p className="mt-1 text-xs text-ink-3">
                          {contact.role}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Botão WhatsApp */}
              {selectedContact ? (
                <>
                  <a
                    href={`https://wa.me/${selectedContact.phone}?text=${messageText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-ember px-6 py-4 font-semibold text-paper shadow-md transition hover:bg-ember-deep active:scale-[0.99]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Pedir esta peça
                  </a>
                  <p className="mt-3 text-center text-xs leading-5 text-ink-3">
                    A mensagem será enviada diretamente para o WhatsApp de{' '}
                    {selectedContact.name}.
                  </p>
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-paper-3 bg-paper-2 px-6 py-4 text-center">
                  <p className="text-sm font-semibold text-ink">
                    Escolhe quem contactar
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ink-3">
                    Seleciona Tiago ou Inês antes de enviar o pedido.
                  </p>
                </div>
              )}

              {/* Dimensões */}
              {selectedVariant.dimensions && (
                <div className="mt-7 rounded-2xl border border-paper-3 bg-paper-2 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-3">
                    Dimensões
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {selectedVariant.dimensions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================
          TAMBÉM PODES GOSTAR
      ========================================================== */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="border-t border-paper-3 bg-paper-2">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ember">
                  Descobre mais
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">
                  Também podes gostar
                </h2>
              </div>
              <Link
                to="/catalogo"
                className="hidden text-sm font-semibold text-ink-2 transition hover:text-ink sm:block"
              >
                Ver catálogo
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map(
                (relatedProduct: any, index: number) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    delay={0.03 * index}
                  />
                ),
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}