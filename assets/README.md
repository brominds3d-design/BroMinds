# DuoPixel

Catálogo público de peças impressas em 3D da DuoPixel, com uma área de
administração privada para gerir produtos e categorias sem mexer no código.

Não é uma loja online: não há carrinho, pagamentos nem stock. O botão
"Encomendar" abre o canal de contacto escolhido com a mensagem já preenchida,
para as encomendas chegarem por mensagem directa.

## Estado actual

A base visual e a página inicial estão prontas e a funcionar. As páginas de
catálogo, de produto e a área de administração são as etapas seguintes — o
plano completo está em [PLAN.md](./PLAN.md).

**Já funciona:**

- Identidade e sistema visual DuoPixel (cores, tipografia, logótipo, texturas).
- Navegação completa, pensada primeiro para telemóvel.
- Página inicial: apresentação da marca, categorias em destaque, produtos em
  destaque, peças recentes, como funciona e chamada para encomendas.
- Dados de exemplo: 13 produtos e 6 categorias, das quais Halloween com 7 peças.
- 18 fotografias de produto próprias, optimizadas pelo Netlify Image CDN.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Framework | TanStack Start (SSR) |
| Interface | React 19, TanStack Router |
| Build | Vite 7 |
| Estilos | Tailwind CSS 4 (tema em `src/styles.css`) |
| Ícones | lucide-react |
| Imagens | Netlify Image CDN |
| Linguagem | TypeScript, modo estrito |
| Alojamento | Netlify |

## Correr localmente

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Para ter as funcionalidades da Netlify (incluindo o Image CDN, de que as
fotografias dependem) usa-se a CLI:

```bash
netlify dev --port 8889
```

Sem a CLI, os pedidos a `/.netlify/images` não são tratados e as imagens não
aparecem — em produção funcionam sempre.

## Antes de divulgar o site

Os contactos são de exemplo. Estão todos em **`src/data/site.ts`**, num só
sítio:

- `contact.email`, `contact.instagram`, `contact.whatsapp` — substituir pelos
  verdadeiros.
- `orderChannel` — `'email'`, `'whatsapp'` ou `'instagram'`, define para onde
  vão todos os botões "Encomendar".
- O texto de apresentação na página inicial usa os nomes "Marta e Rita" como
  exemplo (`src/routes/index.tsx`).

## Estrutura

```
public/img/           Fotografias dos produtos
src/
  components/         Componentes de interface reutilizáveis
  data/               Catálogo e configuração da marca
  lib/                Formatação de preços e datas, helpers de imagem
  routes/             Páginas (encaminhamento por ficheiros)
  styles.css          Tema: cores, tipografia, texturas, animações
```

Mais detalhes de arquitectura em [AGENTS.md](./AGENTS.md).

## O que falta

Resumo das etapas seguintes (detalhe em [PLAN.md](./PLAN.md)):

2. Páginas de catálogo e de categoria
3. Página individual do produto, com carrossel e "Também podes gostar"
4. Sobre nós e Contacto
5. Base de dados (Netlify Database + Drizzle)
6. Autenticação da área privada (Netlify Identity, duas contas)
7. Área de administração: produtos e categorias
8. Acabamentos: SEO, imagens de partilha, página 404
