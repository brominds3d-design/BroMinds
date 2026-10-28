import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, User, LogOut, Heart } from "lucide-react";
import { A as AuthModal, g as getCurrentUser, b as getFavoriteProductIds, c as getProducts, d as saveCurrentUser } from "./router-Yi7VtT48.js";
import { P as ProductCard } from "./ProductCard-DDma6q7r.js";
import "@supabase/supabase-js";
import "zod";
function FavoritesPage() {
  const [user, setUser] = useState(null);
  const [favProducts, setFavProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const loadData = async () => {
    setLoading(true);
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const [favIds, allProducts] = await Promise.all([getFavoriteProductIds(currentUser.handle), getProducts()]);
      const filtered = allProducts.filter((p) => favIds.includes(String(p.id)));
      setFavProducts(filtered);
    } else {
      setFavProducts([]);
    }
    setLoading(false);
  };
  useEffect(() => {
    loadData();
    const onFavChange = () => loadData();
    const onAuthChange = () => loadData();
    window.addEventListener("favorites_changed", onFavChange);
    window.addEventListener("auth_changed", onAuthChange);
    return () => {
      window.removeEventListener("favorites_changed", onFavChange);
      window.removeEventListener("auth_changed", onAuthChange);
    };
  }, []);
  const handleLogout = () => {
    saveCurrentUser(null);
    setUser(null);
    setFavProducts([]);
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-paper text-ink", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-paper-3 bg-paper", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/catalogo", className: "flex items-center gap-2 text-sm font-semibold text-ink-2 hover:text-ink transition", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        "Voltar ao catálogo"
      ] }),
      user && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-ink-2 flex items-center gap-1.5 bg-paper-2 px-3 py-1.5 rounded-full border border-paper-3", children: [
          /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5 text-ember" }),
          "@",
          user.handle,
          " (",
          user.displayName,
          ")"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: handleLogout, className: "text-xs text-ink-3 hover:text-red-600 transition flex items-center gap-1", title: "Sair desta sessão", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" }),
          "Sair"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ember", children: [
          /* @__PURE__ */ jsx(Heart, { className: "h-4 w-4 fill-current" }),
          "Lista Pessoal"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "mt-2 text-3xl font-extrabold sm:text-4xl", children: "Os teus Favoritos" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-ink-3", children: "Peças que guardaste para encomendar mais tarde ou acompanhar novidades." })
      ] }),
      !user ? /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-dashed border-paper-3 bg-paper-2 p-12 text-center max-w-md mx-auto", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ember/10 text-ember", children: /* @__PURE__ */ jsx(Heart, { className: "h-7 w-7" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-ink", children: "Entra para ver a tua lista" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-5 text-ink-3", children: "Inicia sessão com o teu @arroba para guardares e recuperares as tuas peças preferidas a qualquer altura." }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowAuth(true), className: "mt-6 rounded-xl bg-ember px-6 py-2.5 text-sm font-semibold text-paper hover:bg-ember-deep transition shadow-sm", children: "Identificar-me com o meu @" })
      ] }) : loading ? /* @__PURE__ */ jsx("div", { className: "py-20 text-center text-sm text-ink-3", children: "A carregar favoritos..." }) : favProducts.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-dashed border-paper-3 bg-paper-2 p-12 text-center max-w-md mx-auto", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-ink", children: "Ainda não guardaste peças favoritas" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-ink-3", children: "Explora o catálogo e clica no coração de qualquer peça para a guardares aqui." }),
        /* @__PURE__ */ jsx(Link, { to: "/catalogo", className: "mt-6 inline-block rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-paper hover:bg-ember transition", children: "Explorar Catálogo" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: favProducts.map((prod) => /* @__PURE__ */ jsx(ProductCard, { product: prod }, prod.id)) })
    ] }),
    /* @__PURE__ */ jsx(AuthModal, { isOpen: showAuth, onClose: () => setShowAuth(false), onSuccess: () => loadData() })
  ] });
}
export {
  FavoritesPage as component
};
