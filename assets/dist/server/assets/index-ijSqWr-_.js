import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { MessageCircle, ArrowRight, Layers, ShoppingBag, Sparkles, Boxes, Palette } from "lucide-react";
import { C as CategoryCard } from "./CategoryCard-euhC1HNj.js";
import { o as orderChannelLabel, a as orderLink, R as Route } from "./router-Yi7VtT48.js";
import { P as ProductCard } from "./ProductCard-DDma6q7r.js";
import "react";
import "@supabase/supabase-js";
import "zod";
function OrderButton({
  productName,
  className = "",
  size = "md"
}) {
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href: orderLink({ productName }),
      className: `group inline-flex items-center justify-center gap-2.5 rounded-card bg-ink font-semibold text-paper transition-[transform,background-color] duration-200 hover:bg-plum active:scale-[0.985] ${size === "lg" ? "px-6 py-4 text-[0.98rem]" : "px-5 py-3 text-[0.9rem]"} ${className}`,
      children: [
        /* @__PURE__ */ jsx(
          MessageCircle,
          {
            className: "h-4 w-4 text-ember transition-transform duration-300 group-hover:-rotate-12",
            "aria-hidden": "true"
          }
        ),
        productName ? "Encomendar" : orderChannelLabel()
      ]
    }
  );
}
function SectionHeading({
  label,
  title,
  description,
  action
}) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2.5", children: [
      /* @__PURE__ */ jsxs("span", { className: "label-mono flex items-center gap-2 text-ember-deep", children: [
        /* @__PURE__ */ jsx("span", { className: "h-[2px] w-6 bg-ember", "aria-hidden": "true" }),
        label
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "max-w-[24ch] text-[1.7rem] sm:text-[2.1rem]", children: title }),
      description ? /* @__PURE__ */ jsx("p", { className: "max-w-[52ch] text-[0.92rem] leading-relaxed text-ink-2", children: description }) : null
    ] }),
    action ? /* @__PURE__ */ jsxs(
      Link,
      {
        to: action.to,
        params: action.params,
        className: "group inline-flex shrink-0 items-center gap-2 self-start rounded-card border border-ink/18 px-4 py-2.5 text-[0.85rem] font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-paper-2 sm:self-auto",
        children: [
          action.label,
          /* @__PURE__ */ jsx(
            ArrowRight,
            {
              className: "h-3.5 w-3.5 text-ember transition-transform duration-300 group-hover:translate-x-1",
              "aria-hidden": "true"
            }
          )
        ]
      }
    ) : null
  ] });
}
function Section({
  children,
  className = "",
  id
}) {
  return /* @__PURE__ */ jsx(
    "section",
    {
      id,
      className: `mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 ${className}`,
      children
    }
  );
}
function HomePage() {
  const {
    featuredCategories,
    recentProducts,
    counts,
    totalProducts
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Hero, { totalProducts, categoryCount: featuredCategories.length }),
    /* @__PURE__ */ jsxs(Section, { id: "colecoes", children: [
      /* @__PURE__ */ jsx(SectionHeading, { label: "Coleções BroMinds", title: "Explora por Categoria", description: "Encontra modelos utilitários, peças decorativas e projetos especiais organizados por tema.", action: {
        href: "/categorias",
        label: "Ver todas as categorias"
      } }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: featuredCategories.map((category, index) => /* @__PURE__ */ jsx(CategoryCard, { category, count: counts[category.id] ?? 0, size: index === 0 ? "lg" : "md", delay: 0.05 * index }, category.id)) })
    ] }),
    recentProducts.length > 0 && /* @__PURE__ */ jsxs(Section, { id: "recentes", children: [
      /* @__PURE__ */ jsx(SectionHeading, { label: "Novidades da Oficina", title: "Adicionados Recentemente", description: "As últimas criações e peças acabadas de sair da nossa impressora 3D.", action: {
        href: "/catalogo",
        label: "Ver todo o catálogo"
      } }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: recentProducts.map((product, index) => /* @__PURE__ */ jsx(ProductCard, { product, delay: 0.05 * index }, product.id)) })
    ] }),
    /* @__PURE__ */ jsx(CustomOrderBanner, {})
  ] });
}
function Hero({
  totalProducts,
  categoryCount
}) {
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden border-b border-paper-3 bg-gradient-to-b from-paper to-paper-2/40", children: [
    /* @__PURE__ */ jsx("div", { className: "layer-lines pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]", "aria-hidden": "true" }),
    /* @__PURE__ */ jsx("div", { className: "relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14", children: /* @__PURE__ */ jsxs("div", { className: "grid items-center gap-8 lg:grid-cols-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-5 lg:col-span-7", children: [
        /* @__PURE__ */ jsxs("span", { className: "rise label-mono flex items-center gap-2 rounded-full border border-ember/25 bg-ember/10 px-3.5 py-1 text-xs font-semibold text-ember shadow-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "h-2 w-2 animate-pulse rounded-full bg-ember", "aria-hidden": "true" }),
          "BroMinds · Impressão 3D & Design Criativo"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "rise text-[2.4rem] font-extrabold leading-[1.05] text-ink sm:text-[3.2rem] lg:text-[3.8rem]", style: {
          animationDelay: "0.06s"
        }, children: [
          "Design, precisão e",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "relative inline-block text-ember", children: [
            /* @__PURE__ */ jsx("span", { className: "relative z-10", children: "ideias em 3D" }),
            /* @__PURE__ */ jsx("span", { className: "absolute inset-x-0 bottom-1 z-0 h-[0.3em] -rotate-[0.6deg] rounded-[2px] bg-[var(--color-gold)]/35", "aria-hidden": "true" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "rise max-w-[46ch] text-base leading-relaxed text-ink-2 sm:text-lg", style: {
          animationDelay: "0.12s"
        }, children: "Peças decorativas e utilitárias impressas sob encomenda com filamento premium. Feito à medida para a tua casa ou secretária." }),
        /* @__PURE__ */ jsxs("div", { className: "rise flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center", style: {
          animationDelay: "0.18s"
        }, children: [
          /* @__PURE__ */ jsxs("a", { href: "#colecoes", className: "group inline-flex items-center justify-center gap-2 rounded-card bg-ember px-6 py-3.5 font-semibold text-paper shadow-md transition hover:bg-ember-deep active:scale-[0.985]", children: [
            /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4 text-[var(--color-gold)]" }),
            "Explorar Coleções",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" })
          ] }),
          /* @__PURE__ */ jsxs(Link, { to: "/catalogo", className: "inline-flex items-center justify-center gap-2 rounded-card border border-paper-3 bg-paper px-6 py-3.5 font-semibold text-ink transition hover:border-ember hover:bg-paper-2", children: [
            /* @__PURE__ */ jsx(ShoppingBag, { className: "h-4 w-4 text-ink-3" }),
            "Ver Todo o Catálogo"
          ] }),
          /* @__PURE__ */ jsxs(Link, { to: "/packs-natal", className: "inline-flex items-center justify-center gap-2 rounded-card border border-ember/30 bg-[var(--color-gold)]/20 px-6 py-3.5 font-semibold text-ink transition hover:border-ember hover:bg-[var(--color-gold)]/35", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-ember" }),
            "Criar Pack de Natal",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "rise mt-1 flex flex-wrap gap-x-6 gap-y-2 border-t border-paper-3 pt-4 text-ink-2", style: {
          animationDelay: "0.24s"
        }, children: [
          /* @__PURE__ */ jsx(Stat, { icon: Boxes, value: `${totalProducts} modelos`, label: "disponíveis" }),
          /* @__PURE__ */ jsx(Stat, { icon: Palette, value: `${categoryCount} categorias`, label: "em catálogo" }),
          /* @__PURE__ */ jsx(Stat, { icon: Sparkles, value: "Personalização", label: "Cores e detalhes à tua escolha" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "hidden items-center justify-center lg:col-span-5 lg:flex", children: /* @__PURE__ */ jsxs("div", { className: "group relative flex aspect-square w-full max-w-[340px] flex-col items-center justify-center rounded-3xl border border-paper-3 bg-gradient-to-br from-paper via-paper to-ember/5 p-8 shadow-xl transition-all duration-500 hover:border-ember/30", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -inset-1 rounded-3xl bg-gradient-to-r from-ember/20 to-[var(--color-gold)]/20 opacity-50 blur-xl transition duration-500 group-hover:opacity-80" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsx("img", { src: "/img/logo-brominds.png", alt: "BroMinds 3D", className: "h-48 w-48 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" }),
          /* @__PURE__ */ jsx("span", { className: "mt-4 font-mono text-xs uppercase tracking-widest text-ink-3", children: "Oficina de Impressão 3D" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-ember", children: "BroMinds Oficial" })
        ] })
      ] }) })
    ] }) })
  ] });
}
function Stat({
  icon: Icon,
  value,
  label
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-ember", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("dt", { className: "font-mono text-[0.86rem] font-medium text-ink", children: value }),
      /* @__PURE__ */ jsx("dd", { className: "text-[0.74rem] text-ink-3", children: label })
    ] })
  ] });
}
function CustomOrderBanner() {
  return /* @__PURE__ */ jsx(Section, { children: /* @__PURE__ */ jsxs("div", { className: "grain relative overflow-hidden rounded-card-lg bg-ember-deep px-6 py-12 text-paper sm:px-10 sm:py-16", children: [
    /* @__PURE__ */ jsx("div", { className: "voxel-grid absolute inset-0 opacity-25", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-start gap-5 sm:max-w-[48ch]", children: [
      /* @__PURE__ */ jsx("span", { className: "label-mono text-[var(--color-gold)]", children: "Projetos Personalizados" }),
      /* @__PURE__ */ jsx("h2", { className: "text-[1.8rem] sm:text-[2.2rem]", children: "Precisas de uma peça com medidas ou cores personalizadas?" }),
      /* @__PURE__ */ jsx("p", { className: "text-[0.95rem] leading-relaxed text-paper/80", children: "Fazemos impressões sob encomenda a partir de ficheiros STL ou das tuas próprias ideias. Entra em contacto connosco para orçamentos sem compromisso." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
        /* @__PURE__ */ jsx(OrderButton, { size: "lg", className: "bg-paper !text-ink hover:bg-ember hover:!text-ink" }),
        /* @__PURE__ */ jsx(Link, { to: "/contacto", className: "inline-flex items-center justify-center gap-2 rounded-card border border-paper/25 px-6 py-4 font-semibold text-paper transition-colors hover:bg-paper/10", children: "Contactar" })
      ] })
    ] })
  ] }) });
}
export {
  HomePage as component
};
