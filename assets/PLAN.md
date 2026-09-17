# DuoPixel — plano de desenvolvimento

Roteiro do site por etapas. Cada etapa é fechada e pode ser desenvolvida
isoladamente no VS Code.

---

## Etapa 1 — Base visual e página inicial ✅ concluída

- Identidade DuoPixel: logótipo (dois quadrados sobrepostos), paleta "oficina
  de filamento" (papel quente, tinta ameixa, laranja de filamento) e
  tipografia própria (Bricolage Grotesque, Instrument Sans, DM Mono) em
  `src/styles.css`.
- Navegação completa (Início, Catálogo, Categorias, Sobre nós, Contacto) com
  painel próprio para telemóvel — `src/components/Header.tsx`.
- Página inicial em `/`: apresentação da marca, categorias em destaque,
  produtos em destaque, "Chegaram agora", como funciona e chamada para
  encomendas.
- Modelo de dados do catálogo (`src/data/`) com 13 produtos e 6 categorias de
  exemplo, incluindo 7 peças de Halloween.
- 18 fotografias de produto próprias em `public/img`, servidas através do
  Netlify Image CDN.
- Componentes reutilizáveis: cartão de produto, cartão de categoria, círculos
  de cores, carrossel de imagens e botão "Encomendar".

## Etapa 2 — Páginas do catálogo

- `/catalogo` — grelha com todos os produtos e filtros por categoria.
- `/catalogo/:categoria` — página de cada categoria, com estado vazio próprio
  para categorias ainda sem peças.
- `/categorias` — índice de todas as categorias com contagem de peças.
- As funções de consulta já existem em `src/data/catalog.ts`
  (`getProductsByCategory`, `getCategoryCounts`, `getCategoryBySlug`), por isso
  estas páginas são sobretudo apresentação.

## Etapa 3 — Página individual do produto

- `/produtos/:produto` — nome, preço, carrossel (`src/components/Gallery.tsx`,
  já feito), cores com nome, descrição completa, tabela de informações
  adicionais e botão "Encomendar".
- Secção "Também podes gostar" no fim da página, alimentada por
  `getRelatedProducts()` (já feita, dá prioridade à mesma categoria).

## Etapa 4 — Sobre nós e Contacto

- `/sobre` — história da marca, como as peças são feitas, materiais.
- `/contacto` — contactos, prazos e condições (já em `src/data/site.ts`) e um
  formulário de contacto com Netlify Forms.
- Substituir os contactos de exemplo em `src/data/site.ts` pelos verdadeiros e
  escolher o canal do botão "Encomendar" (`orderChannel`: email, WhatsApp ou
  Instagram).

## Etapa 5 — Base de dados

- Esquema Drizzle em `db/schema.ts` para `categories`, `products`,
  `product_images` e `product_colors`, seguindo os tipos de `src/data/types.ts`.
- Netlify Database (Postgres) para persistência.
- Migrar os dados de exemplo de `src/data/products.ts` e `categories.ts` para a
  base de dados.
- Converter as funções de `src/data/catalog.ts` em funções de servidor
  (`createServerFn`) que leem da base de dados. As páginas públicas não mudam,
  porque já consomem apenas estas funções.

## Etapa 6 — Autenticação da área privada

- Netlify Identity com registo fechado (apenas por convite), para garantir que
  só as duas contas autorizadas entram.
- Guarda de rota em `/admin` e verificação também do lado do servidor em todas
  as operações de escrita.

## Etapa 7 — Área de administração

- `/admin` — lista de produtos com procura e filtro por categoria.
- `/admin/produtos/novo` e `/admin/produtos/:id` — formulário para nome,
  descrição, preço, categoria, cores e imagens; apagar produto com confirmação.
- `/admin/categorias` — criar, editar e apagar categorias, com aviso quando a
  categoria ainda tem peças associadas.
- Upload de imagens para Netlify Blobs, com as miniaturas a passarem pelo
  Image CDN.

## Etapa 8 — Acabamentos

- Sitemap e `robots.txt`.
- Imagens Open Graph por produto, para os links ficarem bem no Instagram.
- Página 404 com a identidade da marca.
