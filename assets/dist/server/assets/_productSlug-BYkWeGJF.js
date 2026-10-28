import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, ShoppingBag, Heart, Minus, Plus, MessageCircle } from "lucide-react";
import { P as ProductCard } from "./ProductCard-DDma6q7r.js";
import { f as Route, A as AuthModal, g as getCurrentUser, b as getFavoriteProductIds, t as toggleFavorite } from "./router-Yi7VtT48.js";
import "@supabase/supabase-js";
import "zod";
function ProductPage() {
  const {
    product,
    relatedProducts
  } = Route.useLoaderData();
  const currentProduct = product;
  const variants = currentProduct.variants && currentProduct.variants.length > 0 ? currentProduct.variants : [{
    name: "Tamanho Único",
    price: currentProduct.price,
    dimensions: ""
  }];
  const whatsappContacts = [{
    name: "Tiago Costa",
    role: "Modelação & Produção 3D",
    phone: "351916175751"
  }, {
    name: "Inês Costa",
    role: "Atendimento & Encomendas",
    phone: "351911565367"
  }];
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [selectedColor, setSelectedColor] = useState(currentProduct.colors?.[0] ?? null);
  const [selectedImage, setSelectedImage] = useState(currentProduct.images?.[0]?.src ?? "");
  const [selectedContact, setSelectedContact] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const checkFavStatus = async () => {
    const user = getCurrentUser();
    if (user && currentProduct?.id) {
      const favs = await getFavoriteProductIds(user.handle);
      setIsFav(favs.includes(String(currentProduct.id)));
    } else {
      setIsFav(false);
    }
  };
  useEffect(() => {
    const newVariants = currentProduct.variants && currentProduct.variants.length > 0 ? currentProduct.variants : [{
      name: "Tamanho Único",
      price: currentProduct.price,
      dimensions: ""
    }];
    setSelectedVariant(newVariants[0]);
    setSelectedColor(currentProduct.colors?.[0] ?? null);
    setSelectedImage(currentProduct.images?.[0]?.src ?? "");
    setSelectedContact(null);
    setQuantity(1);
    checkFavStatus();
    const onFavChange = () => checkFavStatus();
    const onAuthChange = () => checkFavStatus();
    window.addEventListener("favorites_changed", onFavChange);
    window.addEventListener("auth_changed", onAuthChange);
    return () => {
      window.removeEventListener("favorites_changed", onFavChange);
      window.removeEventListener("auth_changed", onAuthChange);
    };
  }, [product]);
  const handleToggleFavorite = async () => {
    const user = getCurrentUser();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const nextState = await toggleFavorite(user.handle, String(currentProduct.id));
    setIsFav(nextState);
  };
  const handleLoginSuccess = async (user) => {
    const nextState = await toggleFavorite(user.handle, String(currentProduct.id));
    setIsFav(nextState);
  };
  const messageText = encodeURIComponent(`Olá BroMinds! Gostava de encomendar a peça "${currentProduct.name}" no tamanho ${selectedVariant.name}${selectedColor ? ` e na cor ${selectedColor.name}` : ""}. Quantidade: ${quantity}. (Preço: ${(selectedVariant.price * quantity).toFixed(2)} €)`);
  const totalPrice = selectedVariant.price * quantity;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-paper text-ink", children: [
      /* @__PURE__ */ jsx("header", { className: "border-b border-paper-3 bg-paper", children: /* @__PURE__ */ jsx("div", { className: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-[72px] items-center justify-between", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/catalogo", className: "flex items-center gap-2 text-sm font-semibold text-ink-2 transition hover:text-ink", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Voltar ao catálogo"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-2 text-sm text-ink-3 sm:flex", children: [
          /* @__PURE__ */ jsx(Link, { to: "/catalogo", className: "transition hover:text-ink", children: "Catálogo" }),
          /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "max-w-[220px] truncate text-ink", children: currentProduct.name })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("main", { className: "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-12 xl:gap-16", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden rounded-3xl border border-paper-3 bg-paper-2 shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "aspect-square w-full", children: selectedImage ? /* @__PURE__ */ jsx("img", { src: selectedImage, alt: currentProduct.name, className: "h-full w-full object-cover transition-all duration-300" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center text-sm text-ink-3", children: "Sem imagem disponível" }) }) }),
          currentProduct.images && currentProduct.images.length > 1 && /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5", children: currentProduct.images.map((image, index) => {
            const isSelected = selectedImage === image.src;
            return /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSelectedImage(image.src), className: `aspect-square overflow-hidden rounded-xl border bg-paper-2 transition ${isSelected ? "border-ember ring-2 ring-ember/20" : "border-paper-3 hover:border-ink-3"}`, children: /* @__PURE__ */ jsx("img", { src: image.src, alt: `${currentProduct.name} ${index + 1}`, className: "h-full w-full object-cover" }) }, `${image.src}-${index}`);
          }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxs("div", { className: "lg:sticky lg:top-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ember", children: [
            /* @__PURE__ */ jsx(ShoppingBag, { className: "h-4 w-4" }),
            "Impressão 3D"
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "mt-2 text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-5xl", children: currentProduct.name }),
          currentProduct.shortDescription && /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-ink-2 sm:text-lg", children: currentProduct.shortDescription }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-end gap-2", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-3xl font-extrabold text-ink", children: [
              totalPrice.toFixed(2),
              " €"
            ] }),
            quantity > 1 && /* @__PURE__ */ jsxs("span", { className: "pb-1 text-sm text-ink-3", children: [
              selectedVariant.price.toFixed(2),
              " € / unidade"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleToggleFavorite, className: `flex w-full items-center justify-center gap-2.5 rounded-2xl border px-5 py-3.5 text-sm font-bold transition shadow-sm active:scale-[0.99] ${isFav ? "border-ember/40 bg-ember/10 text-ember hover:bg-ember/15" : "border-paper-3 bg-paper hover:bg-paper-2 text-ink hover:border-ember"}`, children: [
            /* @__PURE__ */ jsx(Heart, { className: `h-5 w-5 transition duration-200 ${isFav ? "fill-ember text-ember scale-110" : "text-ink-2"}` }),
            /* @__PURE__ */ jsx("span", { children: isFav ? "Guardado nos teus Favoritos" : "Guardar nos Favoritos" })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "my-7 h-px bg-paper-3" }),
          currentProduct.description && /* @__PURE__ */ jsxs("div", { className: "mb-7", children: [
            /* @__PURE__ */ jsx("h2", { className: "mb-2 text-sm font-bold uppercase tracking-wide text-ink", children: "Sobre esta peça" }),
            /* @__PURE__ */ jsx("p", { className: "whitespace-pre-line text-sm leading-6 text-ink-2", children: currentProduct.description })
          ] }),
          variants.length > 1 && /* @__PURE__ */ jsxs("div", { className: "mb-7", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-ink", children: "Tamanho / Variante" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-ink-3", children: selectedVariant.name })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: variants.map((variant, index) => {
              const selected = selectedVariant.name === variant.name;
              return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setSelectedVariant(variant), className: `flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${selected ? "border-ember bg-ember/5" : "border-paper-3 bg-paper hover:bg-paper-2"}`, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-ink", children: variant.name }),
                  variant.dimensions && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-ink-3", children: variant.dimensions })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-ink", children: [
                  variant.price.toFixed(2),
                  " €"
                ] })
              ] }, `${variant.name}-${index}`);
            }) })
          ] }),
          currentProduct.colors && currentProduct.colors.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-7", children: [
            /* @__PURE__ */ jsx("h2", { className: "mb-3 text-sm font-bold text-ink", children: "Cor" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: currentProduct.colors.map((color, index) => {
              const selected = selectedColor?.name === color.name;
              return /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setSelectedColor(color), className: `rounded-full border px-4 py-2 text-sm font-medium transition ${selected ? "border-ember bg-ember text-paper" : "border-paper-3 bg-paper text-ink hover:bg-paper-2"}`, children: color.name }, `${color.name}-${index}`);
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-7", children: [
            /* @__PURE__ */ jsx("h2", { className: "mb-3 text-sm font-bold text-ink", children: "Quantidade" }),
            /* @__PURE__ */ jsxs("div", { className: "flex h-12 w-fit items-center overflow-hidden rounded-xl border border-paper-3 bg-paper", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setQuantity((value) => Math.max(1, value - 1)), className: "flex h-full w-12 items-center justify-center text-ink-2 transition hover:bg-paper-2", "aria-label": "Diminuir quantidade", children: /* @__PURE__ */ jsx(Minus, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx("span", { className: "flex w-12 justify-center text-sm font-bold text-ink", children: quantity }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setQuantity((value) => value + 1), className: "flex h-full w-12 items-center justify-center text-ink-2 transition hover:bg-paper-2", "aria-label": "Aumentar quantidade", children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "mb-3 text-sm font-bold text-ink", children: "Contactar" }),
            /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: whatsappContacts.map((contact) => {
              const selected = selectedContact?.phone === contact.phone;
              return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setSelectedContact(contact), className: `rounded-xl border p-3 text-left transition ${selected ? "border-ember bg-ember/5 ring-2 ring-ember/10" : "border-paper-3 bg-paper hover:bg-paper-2"}`, children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-ink", children: contact.name }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-ink-3", children: contact.role })
              ] }, contact.phone);
            }) })
          ] }),
          selectedContact ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("a", { href: `https://wa.me/${selectedContact.phone}?text=${messageText}`, target: "_blank", rel: "noreferrer", className: "mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-ember px-6 py-4 font-semibold text-paper shadow-md transition hover:bg-ember-deep active:scale-[0.99]", children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-5 w-5" }),
              "Pedir esta peça"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-3 text-center text-xs leading-5 text-ink-3", children: [
              "A mensagem será enviada diretamente para o WhatsApp de",
              " ",
              selectedContact.name,
              "."
            ] })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl border border-dashed border-paper-3 bg-paper-2 px-6 py-4 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-ink", children: "Escolhe quem contactar" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-5 text-ink-3", children: "Seleciona Tiago ou Inês antes de enviar o pedido." })
          ] }),
          selectedVariant.dimensions && /* @__PURE__ */ jsxs("div", { className: "mt-7 rounded-2xl border border-paper-3 bg-paper-2 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-wide text-ink-3", children: "Dimensões" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm font-semibold text-ink", children: selectedVariant.dimensions })
          ] })
        ] }) })
      ] }) }),
      relatedProducts && relatedProducts.length > 0 && /* @__PURE__ */ jsx("section", { className: "border-t border-paper-3 bg-paper-2", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-7 flex items-end justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-ember", children: "Descobre mais" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-1 text-2xl font-extrabold text-ink sm:text-3xl", children: "Também podes gostar" })
          ] }),
          /* @__PURE__ */ jsx(Link, { to: "/catalogo", className: "hidden text-sm font-semibold text-ink-2 transition hover:text-ink sm:block", children: "Ver catálogo" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: relatedProducts.slice(0, 4).map((relatedProduct, index) => /* @__PURE__ */ jsx(ProductCard, { product: relatedProduct, delay: 0.03 * index }, relatedProduct.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(AuthModal, { isOpen: showAuthModal, onClose: () => setShowAuthModal(false), onSuccess: handleLoginSuccess })
  ] });
}
export {
  ProductPage as component
};
