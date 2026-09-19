import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react'
import { getProductBySlug, getRelatedProducts } from '@/data/catalog'
import { ProductCard } from '@/components/ProductCard'

export const Route = createFileRoute('/catalogo/$productSlug')({
  loader: async ({ params }) => {
    const product = await getProductBySlug(params.productSlug)

    if (!product) {
      throw new Error('Produto não encontrado')
    }

    const relatedProducts = await getRelatedProducts(
      product.categoryId ?? product.category_id,
      product.id,
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

  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            name: 'Tamanho Único',
            price: product.price,
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
    product.colors?.[0] ?? null,
  )
  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.src ?? '',
  )
  const [selectedContact, setSelectedContact] = useState(
    whatsappContacts[0],
  )
  const [quantity, setQuantity] = useState(1)

  /*
   * Quando se muda para outro produto através de
   * "Também podes gostar", atualiza tudo.
   */
  useEffect(() => {
    const newVariants =
      product.variants && product.variants.length > 0
        ? product.variants
        : [
            {
              name: 'Tamanho Único',
              price: product.price,
              dimensions: '',
            },
          ]

    setSelectedVariant(newVariants[0])
    setSelectedColor(product.colors?.[0] ?? null)
    setSelectedImage(product.images?.[0]?.src ?? '')
    setQuantity(1)
  }, [product])

  const messageText = encodeURIComponent(
    `Olá BroMinds! Gostava de encomendar a peça "${product.name}" no tamanho ${
      selectedVariant.name
    }${
      selectedColor
        ? ` e na cor ${selectedColor.name}`
        : ''
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
              <Link
                to="/catalogo"
                className="transition hover:text-ink"
              >
                Catálogo
              </Link>

              <ChevronRight className="h-4 w-4" />

              <span className="max-w-[220px] truncate text-ink">
                {product.name}
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
              GALERIA
          ====================================================== */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-paper-3 bg-paper-2 shadow-sm">
              <div className="aspect-square w-full">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-ink-3">
                    Sem imagem disponível
                  </div>
                )}
              </div>
            </div>

            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {product.images.map((image: any, index: number) => {
                  const isSelected = selectedImage === image.src

                  return (
                    <button
                      key={`${image.src}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image.src)}
                      className={`aspect-square overflow-hidden rounded-xl border bg-paper-2 transition ${
                        isSelected
                          ? 'border-ember ring-2 ring-ember/20'
                          : 'border-paper-3 hover:border-ink-3'
                      }`}
                    >
                      <img
                        src={image.src}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )}
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
                {product.name}
              </h1>

              {product.shortDescription && (
                <p className="mt-4 text-base leading-7 text-ink-2 sm:text-lg">
                  {product.shortDescription}
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
              {product.description && (
                <div className="mb-7">
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink">
                    Sobre esta peça
                  </h2>

                  <p className="whitespace-pre-line text-sm leading-6 text-ink-2">
                    {product.description}
                  </p>
                </div>
              )}

              {/* =================================================
                  VARIANTES
              ================================================== */}
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
                      const selected =
                        selectedVariant.name === variant.name

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

              {/* =================================================
                  CORES
              ================================================== */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-7">
                  <h2 className="mb-3 text-sm font-bold text-ink">
                    Cor
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: any, index: number) => {
                      const selected =
                        selectedColor?.name === color.name

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

              {/* =================================================
                  QUANTIDADE
              ================================================== */}
              <div className="mb-7">
                <h2 className="mb-3 text-sm font-bold text-ink">
                  Quantidade
                </h2>

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
                    onClick={() =>
                      setQuantity((value) => value + 1)
                    }
                    className="flex h-full w-12 items-center justify-center text-ink-2 transition hover:bg-paper-2"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* =================================================
                  CONTACTO
              ================================================== */}
              <div className="mb-4">
                <h2 className="mb-3 text-sm font-bold text-ink">
                  Contactar
                </h2>

                <div className="grid gap-2 sm:grid-cols-2">
                  {whatsappContacts.map((contact) => {
                    const selected =
                      selectedContact.phone === contact.phone

                    return (
                      <button
                        key={contact.phone}
                        type="button"
                        onClick={() => setSelectedContact(contact)}
                        className={`rounded-xl border p-3 text-left transition ${
                          selected
                            ? 'border-ember bg-ember/5'
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

              {/* WhatsApp */}
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