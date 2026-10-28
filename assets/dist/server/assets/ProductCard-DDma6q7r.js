import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { A as AuthModal, g as getCurrentUser, b as getFavoriteProductIds, t as toggleFavorite } from "./router-Yi7VtT48.js";
function ProductCard({ product, delay = 0 }) {
  const [isFav, setIsFav] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const firstImage = product.images?.[0]?.src || "/img/placeholder.png";
  const secondImage = product.images?.[1]?.src;
  const checkStatus = async () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const favs = await getFavoriteProductIds(currentUser.handle);
      setIsFav(favs.includes(String(product.id)));
    } else {
      setIsFav(false);
    }
  };
  useEffect(() => {
    checkStatus();
    const onFavChange = () => checkStatus();
    const onAuthChange = () => checkStatus();
    window.addEventListener("favorites_changed", onFavChange);
    window.addEventListener("auth_changed", onAuthChange);
    return () => {
      window.removeEventListener("favorites_changed", onFavChange);
      window.removeEventListener("auth_changed", onAuthChange);
    };
  }, [product.id]);
  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    const nextState = await toggleFavorite(currentUser.handle, String(product.id));
    setIsFav(nextState);
  };
  const handleLoginSuccess = async (loggedUser) => {
    setUser(loggedUser);
    const nextState = await toggleFavorite(loggedUser.handle, String(product.id));
    setIsFav(nextState);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "group relative flex flex-col overflow-hidden rounded-2xl border border-paper-3 bg-paper transition hover:shadow-md",
        style: { animationDelay: `${delay}s` },
        children: [
          /* @__PURE__ */ jsx(Link, { to: "/catalogo/$productSlug", params: { productSlug: product.slug }, className: "block overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "relative aspect-square w-full overflow-hidden bg-paper-2", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: firstImage,
                alt: product.name,
                className: `h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${secondImage ? "group-hover:opacity-0" : ""}`
              }
            ),
            secondImage && /* @__PURE__ */ jsx(
              "img",
              {
                src: secondImage,
                alt: `${product.name} alternate`,
                className: "absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleHeartClick,
              className: "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 backdrop-blur-md transition hover:scale-110 active:scale-95 shadow-sm",
              title: isFav ? "Remover dos favoritos" : "Adicionar aos favoritos",
              children: /* @__PURE__ */ jsx(
                Heart,
                {
                  className: `h-5 w-5 transition ${isFav ? "fill-ember text-ember" : "text-ink-2 hover:text-ember"}`
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col p-4", children: [
            /* @__PURE__ */ jsx(Link, { to: "/catalogo/$productSlug", params: { productSlug: product.slug }, children: /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-ink transition hover:text-ember line-clamp-1", children: product.name }) }),
            product.shortDescription && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-ink-3 line-clamp-2", children: product.shortDescription }),
            /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-3 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-extrabold text-ink", children: [
                (product.price || product.basePrice || 0).toFixed(2),
                " €"
              ] }),
              product.colors && product.colors.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex items-center -space-x-1.5", children: product.colors.slice(0, 4).map((c, i) => /* @__PURE__ */ jsx(
                "span",
                {
                  className: "h-3 w-3 rounded-full border border-paper",
                  style: { backgroundColor: c.hex },
                  title: c.name
                },
                i
              )) })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      AuthModal,
      {
        isOpen: showAuth,
        onClose: () => setShowAuth(false),
        onSuccess: handleLoginSuccess
      }
    )
  ] });
}
export {
  ProductCard as P
};
