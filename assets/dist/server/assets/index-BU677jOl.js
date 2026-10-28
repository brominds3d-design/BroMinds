import { jsxs, jsx } from "react/jsx-runtime";
import { C as CategoryCard } from "./CategoryCard-euhC1HNj.js";
import { ChevronRight, Sparkles } from "lucide-react";
import { h as Route } from "./router-Yi7VtT48.js";
import "@tanstack/react-router";
import "react";
import "@supabase/supabase-js";
import "zod";
function CategoriesPage() {
  const {
    categories,
    counts
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12", children: [
    /* @__PURE__ */ jsxs("nav", { className: "mb-6 flex items-center gap-2 text-xs text-ink-3", children: [
      /* @__PURE__ */ jsx("a", { href: "/", className: "hover:text-ink", children: "Início" }),
      /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
      /* @__PURE__ */ jsx("span", { className: "font-medium text-ink", children: "Coleções" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 max-w-2xl", children: [
      /* @__PURE__ */ jsxs("span", { className: "label-mono mb-2 inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-2 px-3 py-1 text-xs text-ink-2", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-ember" }),
        "Coleções & Temáticas"
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold text-ink sm:text-4xl", children: "Explora por Coleção" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-ink-2", children: "Peças organizadas por contexto — desde decorações temáticas de época até utilitários e peças funcionais para a tua casa ou escritório." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: categories.map((category, index) => /* @__PURE__ */ jsx(CategoryCard, { category, count: counts[category.id] ?? 0, size: index === 0 ? "lg" : "md", delay: 0.04 * index }, category.id)) })
  ] });
}
export {
  CategoriesPage as component
};
