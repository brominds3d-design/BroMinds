import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Boxes, Palette, Sparkles } from 'lucide-react'
import { CategoryCard } from '@/components/CategoryCard'
import { OrderButton } from '@/components/OrderButton'
import { ProductCard } from '@/components/ProductCard'
import { Section, SectionHeading } from '@/components/Section'
import {
  getCategoryCounts,
  getFeaturedCategories,
  getFeaturedProducts,
  getProducts,
  getRecentProducts,
} from '@/data/catalog'
import { site } from '@/data/site'
import { img, imgSrcSet } from '@/lib/image'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: () => ({
    featuredCategories: getFeaturedCategories(),
    featuredProducts: getFeaturedProducts(4),
    recentProducts: getRecentProducts(4),
    counts: getCategoryCounts(),
    totalProducts: getProducts().length,
  }),
})

function HomePage() {
  const {
    featuredCategories,
    featuredProducts,
    recentProducts,
    counts,
    totalProducts,
  } = Route.useLoaderData()

  return (
    <>
      <Hero totalProducts={totalProducts} categoryCount={featuredCategories.length} />

      <Section id="categorias-destaque">
        <SectionHeading
          label="Categorias em destaque"
          title="Escolhe por onde começar"
          description="O catálogo está organizado por colecções. Novas categorias vão aparecendo aqui à medida que as criamos."
          action={{ to: '/categorias', label: 'Todas as categorias' }}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              count={counts[category.id] ?? 0}
              /* A primeira categoria ocupa duas colunas: quebra a grelha e dá
                 destaque à colecção da época. */
              size={index === 0 ? 'lg' : 'md'}
              delay={0.05 * index}
            />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          label="Produtos em destaque"
          title="As que saem mais de casa"
          description="As peças que mais nos pedem, e as que costumamos ter prontas mais depressa."
          action={{ to: '/catalogo', label: 'Ver catálogo' }}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 2}
              delay={0.05 * index}
            />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          label="Chegaram agora"
          title="Acabadas de sair da impressora"
          description="Os desenhos mais recentes. Se alguma te interessar, diz — as primeiras séries são pequenas."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} delay={0.05 * index} />
          ))}
        </div>
      </Section>

      <ComoFunciona />
      <CallToAction />
    </>
  )
}

function Hero({
  totalProducts,
  categoryCount,
}: {
  totalProducts: number
  categoryCount: number
}) {
  return (
    <div className="relative overflow-hidden border-b border-paper-3">
      {/* Camada de textura: linhas de camada a esvanecer para baixo */}
      <div
        className="layer-lines pointer-events-none absolute inset-0 opacity-45 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pb-20 lg:pt-20">
        <div className="flex flex-col items-start gap-6">
          <span className="rise label-mono flex items-center gap-2 rounded-full border border-ink/12 bg-paper px-3 py-1.5 text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
            Impressão 3D · {site.location}
          </span>

          <h1
            className="rise text-[2.5rem] leading-[1.02] sm:text-[3.4rem] lg:text-[3.9rem]"
            style={{ animationDelay: '0.06s' }}
          >
            Peças impressas
            <br />
            em casa,{' '}
            <span className="relative inline-block">
              <span className="relative z-10">duas a duas</span>
              {/* Sublinhado pintado à mão, em vez de um destaque rectangular */}
              <span
                className="absolute inset-x-0 bottom-1 z-0 h-[0.32em] -rotate-[0.6deg] rounded-[2px] bg-ember/32"
                aria-hidden="true"
              />
            </span>
            .
          </h1>

          <p
            className="rise max-w-[46ch] text-[1.02rem] leading-relaxed text-ink-2"
            style={{ animationDelay: '0.12s' }}
          >
            Somos a Marta e a Rita, duas irmãs com duas impressoras na sala.
            Desenhamos e imprimimos peças pequenas — decoração de época,
            organizadores para casa e encomendas à medida. Tudo o que está aqui
            já saiu da nossa máquina.
          </p>

          <div
            className="rise flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            style={{ animationDelay: '0.18s' }}
          >
            <Link
              to="/catalogo"
              className="group inline-flex items-center justify-center gap-2.5 rounded-card bg-ember px-6 py-4 font-semibold text-paper shadow-[0_10px_30px_-14px_oklch(0.658_0.169_46/0.9)] transition-[transform,background-color] duration-200 hover:bg-ember-deep active:scale-[0.985]"
            >
              Consultar catálogo
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/catalogo/$categorySlug"
              params={{ categorySlug: 'halloween' }}
              className="inline-flex items-center justify-center gap-2 rounded-card border border-ink/18 px-6 py-4 font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-paper-2"
            >
              <Sparkles className="h-4 w-4 text-plum" aria-hidden="true" />
              Colecção Halloween
            </Link>
          </div>

          <dl
            className="rise mt-2 flex flex-wrap gap-x-7 gap-y-3 border-t border-paper-3 pt-5 text-ink-2"
            style={{ animationDelay: '0.24s' }}
          >
            <Stat icon={Boxes} value={`${totalProducts} peças`} label="no catálogo" />
            <Stat icon={Palette} value={`${categoryCount} colecções`} label="a crescer" />
            <Stat icon={Sparkles} value="2 impressoras" label="a trabalhar" />
          </dl>
        </div>

        {/* Fotografia da oficina, ligeiramente rodada e sobreposta à grelha */}
        <div
          className="rise relative"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="relative overflow-hidden rounded-card-lg border border-paper-3 bg-paper-2 shadow-[0_28px_60px_-34px_rgba(32,20,40,0.5)] lg:rotate-[1.1deg]">
            <img
              src={img('/img/oficina-hero.png', { width: 1100, height: 760, fit: 'cover' })}
              srcSet={imgSrcSet('/img/oficina-hero.png', [520, 760, 1100, 1440], {
                aspect: 0.69,
              })}
              sizes="(min-width: 1024px) 34rem, 94vw"
              alt="Bancada da oficina DuoPixel com uma impressora 3D a imprimir, bobinas de filamento e peças acabadas"
              width={1100}
              height={760}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Cartão flutuante: prazo de entrega, a informação que mais perguntam */}
          <div className="absolute -bottom-4 left-4 max-w-[15rem] rounded-card border border-paper-3 bg-paper p-3.5 shadow-[0_14px_34px_-18px_rgba(32,20,40,0.45)] sm:-bottom-6 sm:left-6">
            <p className="label-mono mb-1 text-ember-deep">Prazo habitual</p>
            <p className="text-[0.84rem] leading-snug text-ink-2">{site.info.prazo}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Boxes
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-ember" aria-hidden="true" />
      <div>
        <dt className="font-mono text-[0.86rem] font-medium text-ink">{value}</dt>
        <dd className="text-[0.74rem] text-ink-3">{label}</dd>
      </div>
    </div>
  )
}

const passos = [
  {
    numero: '01',
    titulo: 'Escolhes a peça e a cor',
    texto:
      'Vês o catálogo, escolhes a peça e a cor de filamento que preferes. Todas as cores disponíveis estão na página de cada peça.',
  },
  {
    numero: '02',
    titulo: 'Mandas mensagem',
    texto:
      'O botão "Encomendar" abre uma mensagem já preenchida com o nome da peça. Só tens de dizer a quantidade e onde vives.',
  },
  {
    numero: '03',
    titulo: 'Imprimimos e enviamos',
    texto: `${site.info.prazo}. ${site.info.envio}`,
  },
]

function ComoFunciona() {
  return (
    <Section>
      <SectionHeading
        label="Como funciona"
        title="Encomendar é uma conversa, não um checkout"
        description="Não temos carrinho nem pagamentos no site. Preferimos combinar tudo por mensagem — é mais simples e ficamos a saber exactamente o que queres."
      />

      {/* Escada em zig-zag: cada passo desce um pouco mais que o anterior */}
      <ol className="grid gap-4 sm:grid-cols-3">
        {passos.map((passo, index) => (
          <li
            key={passo.numero}
            className={`relative flex flex-col gap-2.5 rounded-card-lg border border-paper-3 bg-paper-2/60 p-5 transition-colors hover:border-ink/20 sm:p-6 ${
              index === 1 ? 'sm:mt-6' : index === 2 ? 'sm:mt-12' : ''
            }`}
          >
            <span className="font-display text-[2.4rem] font-extrabold leading-none text-ember/28">
              {passo.numero}
            </span>
            <h3 className="text-[1.05rem]">{passo.titulo}</h3>
            <p className="text-[0.86rem] leading-relaxed text-ink-2">{passo.texto}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function CallToAction() {
  return (
    <Section>
      <div className="grain relative overflow-hidden rounded-card-lg bg-plum px-5 py-12 text-paper sm:px-10 sm:py-16">
        <div className="voxel-grid absolute inset-0 opacity-30" aria-hidden="true" />

        <div className="relative flex flex-col items-start gap-5 sm:max-w-[46ch]">
          <span className="label-mono text-paper/58">Encomendas</span>

          <h2 className="text-[1.8rem] sm:text-[2.3rem]">
            Viste uma peça que gostavas em outra cor?
          </h2>

          <p className="text-[0.94rem] leading-relaxed text-paper/76">
            Quase tudo o que está no catálogo pode ser impresso noutra cor ou
            noutro tamanho, e também fazemos peças a partir da tua ideia. Manda
            mensagem e vemos o que é possível.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <OrderButton size="lg" className="bg-paper text-ink hover:bg-ember hover:text-paper" />

            <Link
              to="/contacto"
              className="inline-flex items-center justify-center gap-2 rounded-card border border-paper/25 px-6 py-4 font-semibold text-paper transition-colors hover:bg-paper/10"
            >
              Ver contactos
            </Link>
          </div>
        </div>
      </div>
    </Section>
  )
}
