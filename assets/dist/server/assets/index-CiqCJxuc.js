import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { P as ProductCard } from "./ProductCard-DDma6q7r.js";
import { Search } from "lucide-react";
import { e as Route } from "./router-Yi7VtT48.js";
import "@supabase/supabase-js";
import "zod";
function CatalogoPage() {
  const {
    products,
    categories
  } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({
    from: "/catalogo/"
  });
  const currentCategoryParam = searchParams?.categoria || "all";
  const [selectedCategory, setSelectedCategory] = useState(currentCategoryParam);
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (searchParams?.categoria) {
      setSelectedCategory(searchParams.categoria);
    } else {
      setSelectedCategory("all");
    }
  }, [searchParams?.categoria]);
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    navigate({
      search: (prev) => ({
        ...prev,
        categoria: catId === "all" ? void 0 : catId
      })
    });
  };
  const matchesCategory = (p, target) => {
    if (target === "all") return true;
    const t = target.toLowerCase();
    if (p.categoryId && String(p.categoryId).toLowerCase() === t) return true;
    if (p.category_id && String(p.category_id).toLowerCase() === t) return true;
    if (typeof p.category === "string" && p.category.toLowerCase() === t) return true;
    if (p.category && typeof p.category === "object") {
      if (p.category.id && String(p.category.id).toLowerCase() === t) return true;
      if (p.category.slug && String(p.category.slug).toLowerCase() === t) return true;
      if (p.category.name && String(p.category.name).toLowerCase() === t) return true;
    }
    return false;
  };
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = matchesCategory(p, selectedCategory);
      const matchSearch = p.name && String(p.name).toLowerCase().includes(search.toLowerCase()) || p.shortDescription && String(p.shortDescription).toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold text-ink sm:text-4xl", children: "Catálogo BroMinds" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-ink-2", children: "Todas as nossas peças e decorações impressas em 3D." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:w-72", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" }),
        /* @__PURE__ */ jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Pesquisar peça...", className: "w-full rounded-xl border border-paper-3 bg-paper py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition focus:border-ember" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => handleSelectCategory("all"), className: `rounded-full px-4 py-1.5 text-xs font-semibold transition ${selectedCategory === "all" ? "bg-ink text-paper" : "border border-paper-3 bg-paper text-ink hover:bg-paper-2"}`, children: [
        "Todos (",
        products.length,
        ")"
      ] }),
      categories.map((cat) => {
        const count = products.filter((p) => matchesCategory(p, cat.slug || cat.id)).length;
        const isSelected = String(selectedCategory).toLowerCase() === String(cat.id).toLowerCase() || String(selectedCategory).toLowerCase() === String(cat.slug || "").toLowerCase();
        return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => handleSelectCategory(cat.slug || cat.id), className: `rounded-full px-4 py-1.5 text-xs font-semibold transition ${isSelected ? "bg-ink text-paper" : "border border-paper-3 bg-paper text-ink hover:bg-paper-2"}`, children: [
          cat.name,
          " (",
          count,
          ")"
        ] }, cat.id);
      })
    ] }),
    filteredProducts.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: filteredProducts.map((product, idx) => /* @__PURE__ */ jsx(ProductCard, { product, delay: 0.03 * idx }, product.id)) }) : /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-dashed border-paper-3 p-12 text-center text-ink-3", children: /* @__PURE__ */ jsx("p", { children: "Nenhuma peça encontrada com estes filtros." }) })
  ] });
}
export {
  CatalogoPage as component
};
