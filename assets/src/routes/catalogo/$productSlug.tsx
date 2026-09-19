import { createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { getProductBySlug, getRelatedProducts } from '@/data/catalog'
import { ProductCard } from '@/components/ProductCard'
import { Section, SectionHeading } from '@/components/Section'
import { MessageCircle, Ruler, Check, ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/catalogo/$productSlug')({
  loader: async ({ params: { productSlug } }) => {
    const product = await getProductBySlug(productSlug)

    if (!product) throw notFound()

    const related = await getRelatedProducts(product, 4)

    return { product, related }
  },
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { product, related } = Route.useLoaderData()

  // Variantes do produto
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [{ name: 'Tamanho Único', price: product.price, dimensions: '' }]

  const [selectedVariant, setSelectedVariant] = useState(variants[0])
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? null)
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.src ?? ''
  )

  // Contactos WhatsApp
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

  const [selectedContact, setSelectedContact] = useState(
    whatsappContacts[0]
  )

  // Mensagem automática para o WhatsApp
  const messageText = encodeURIComponent(
    `Olá BroMinds! Gostava de encomendar a peça "${product.name}" no tamanho ${
      selectedVariant.name
    }${
      selectedColor ? ` e na cor ${selectedColor.name}` : ''
    }. (Preço: ${selectedVariant.price.toFixed(2)} €)`
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-ink-3">
        <a href="/" className="hover:text-ink">
          Início
        </a>

        <ChevronRight className="h-3 w-3" />

        <a href="/catalogo" className="hover:text-ink">
          Catálogo
        </a>

        <ChevronRight className="h-3 w-3" />

        <span className="font-medium text-ink">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">

        {/* Galeria de Fotos */}
        <div className="flex flex-col gap-4">

          <div className="relative aspect-square overflow-hidden rounded-2xl border border-paper-3 bg-paper-2">
            {selectedImage ? (
           <img
  src={selectedImage}
  alt={product.name}
  className="h-full w-full object-contain p-4 transition-all duration-300"
/>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-3">
                Sem imagem disponível
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img.src)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    selectedImage === img.src
                      ? 'border-ember'
                      : 'border-paper-3 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="flex flex-col gap-6">

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ember">
              {product.category?.name ?? 'Peça 3D'}
            </span>

            <h1 className="mt-1 text-3xl font-extrabold text-ink sm:text-4xl">
              {product.name}
            </h1>

            {/* Preço */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-ink">
                {selectedVariant.price.toFixed(2)} €
              </span>

              {selectedVariant.dimensions && (
                <span className="flex items-center gap-1 text-xs text-ink-3">
                  <Ruler className="h-3.5 w-3.5" />
                  {selectedVariant.dimensions}
                </span>
              )}
            </div>
          </div>

          {/* Descrição */}
          <p className="text-sm leading-relaxed text-ink-2">
            {product.description || product.shortDescription}
          </p>

          <hr className="border-paper-3" />

          {/* Seletor de Variantes */}
          {variants.length > 1 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  Tamanho:{' '}
                  <span className="font-normal text-ink-2">
                    {selectedVariant.name}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {variants.map((variant) => {
                  const isSelected =
                    selectedVariant.name === variant.name

                  return (
                    <button
                      key={variant.name}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                        isSelected
                          ? 'border-ink bg-ink text-paper shadow-sm'
                          : 'border-paper-3 bg-paper text-ink hover:border-ink/40'
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {variant.name}
                      </span>

                      <span
                        className={`text-xs ${
                          isSelected
                            ? 'text-paper/80'
                            : 'text-ink-3'
                        }`}
                      >
                        {variant.price.toFixed(2)} €
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Seletor de Cores */}
          {product.colors.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  Cor do Filamento:{' '}
                  <span className="font-normal text-ink-2">
                    {selectedColor?.name}
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color) => {
                  const isSelected =
                    selectedColor?.name === color.name

                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      title={color.name}
                      className={`group relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                        isSelected
                          ? 'scale-110 border-ink'
                          : 'border-transparent hover:scale-105'
                      }`}
                    >
                      <span
                        className="h-8 w-8 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      />

                      {isSelected && (
                        <Check className="absolute h-4 w-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pedido / WhatsApp */}
          <div className="pt-4">

            <div className="mb-3">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink">
                Falar com
              </span>

              <div className="grid grid-cols-2 gap-2">

                {whatsappContacts.map((contact) => {
                  const isSelected =
                    selectedContact.phone === contact.phone

                  return (
                    <button
                      key={contact.phone}
                      type="button"
                      onClick={() => setSelectedContact(contact)}
                      className={`rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-ink bg-ink text-paper shadow-sm'
                          : 'border-paper-3 bg-paper text-ink hover:border-ink/40'
                      }`}
                    >
                      <span className="block text-sm font-semibold">
                        {contact.name}
                      </span>

                      <span
                        className={`mt-0.5 block text-xs ${
                          isSelected
                            ? 'text-paper/70'
                            : 'text-ink-3'
                        }`}
                      >
                        {contact.role}
                      </span>
                    </button>
                  )
                })}

              </div>
            </div>

            <a
              href={`https://wa.me/${selectedContact.phone}?text=${messageText}`}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-ember px-6 py-4 font-semibold text-paper shadow-md transition hover:bg-ember-deep active:scale-[0.99]"
            >
              <MessageCircle className="h-5 w-5" />

              Pedir esta Peça ({selectedVariant.price.toFixed(2)} €)
            </a>

            <p className="mt-2 text-center text-xs text-ink-3">
              A mensagem será enviada diretamente para o WhatsApp de{' '}
              {selectedContact.name}.
            </p>

          </div>
        </div>
      </div>

      {/* Produtos Relacionados */}
      {related.length > 0 && (
        <Section className="mt-16 border-t border-paper-3 pt-12">
          <SectionHeading
            label="Mais Peças"
            title="Também Podes Gostar"
            description="Outros modelos da mesma coleção para combinar."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => (
              <ProductCard
                key={item.id}
                product={item}
                delay={0.04 * index}
              />
            ))}
          </div>
        </Section>
      )}

    </div>
  )
}