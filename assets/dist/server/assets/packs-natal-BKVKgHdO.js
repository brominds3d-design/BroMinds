import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { s as supabase } from "./router-Yi7VtT48.js";
import "@tanstack/react-router";
import "lucide-react";
import "@supabase/supabase-js";
import "zod";
const money = (value) => new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR"
}).format(value);
function extractSizeLetter(text) {
  const match = text.match(/\b([SML])\b/i) || text.match(/^([SML])/i);
  return match ? match[1].toUpperCase() : text;
}
function cleanDimensions(text) {
  if (!text) return "";
  return text.replace(/x/g, " × ").replace(/\s*×\s*/g, " × ").replace(/\(\s*/g, "(").replace(/\s*\)/g, ")").trim();
}
const LED_INCLUDED_SLUGS = ["casa-natal", "casa-natal-s", "casa-natal-m", "igreja-natal"];
const CONTACT_NUMBERS = {
  tiago: "351916175751",
  ines: "351912953266"
};
function PacksNatalPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [baseSize, setBaseSize] = useState("S");
  const [selectedPlates, setSelectedPlates] = useState({});
  const [houses, setHouses] = useState({});
  const [decorations, setDecorations] = useState({});
  const [selectedContactDesktop, setSelectedContactDesktop] = useState(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  useEffect(() => {
    async function loadProducts() {
      const {
        data,
        error: queryError
      } = await supabase.from("products").select("id, slug, name, base_price, images, variants, pack_eligible, pack_type, pack_size, pack_price").eq("category_id", "natal").eq("pack_eligible", true).order("name", {
        ascending: true
      });
      if (queryError) {
        console.error("Erro ao carregar produtos:", queryError);
        setError("Não foi possível carregar os produtos de Natal.");
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    }
    void loadProducts();
  }, []);
  const base = products.find((product) => product.pack_type === "base");
  const plaque = products.find((product) => product.pack_type === "placa");
  const isHouseProduct = (product) => {
    const s = product.slug.toLowerCase();
    const n = product.name.toLowerCase();
    if (s.includes("igreja") || n.includes("igreja")) return false;
    return product.pack_type === "casa" || s.includes("casa") || n.includes("casa");
  };
  const houseProducts = products.filter(isHouseProduct);
  const decorationProducts = products.filter((product) => product.pack_type !== "base" && product.pack_type !== "placa" && !isHouseProduct(product));
  function priceFor(product, sizeLabel) {
    if (!product) return 0;
    const variant = product.variants?.find((item) => extractSizeLetter(item.name) === sizeLabel || item.name === sizeLabel);
    return Number(variant?.price ?? product.base_price);
  }
  function updateSelection(setter, key, quantity) {
    setter((current) => {
      const next = {
        ...current
      };
      if (quantity <= 0) {
        delete next[key];
      } else {
        next[key] = Math.min(10, quantity);
      }
      return next;
    });
  }
  const basePrice = priceFor(base, baseSize);
  const selectedPlateItems = Object.entries(selectedPlates).map(([size, quantity]) => ({
    size,
    quantity,
    price: priceFor(plaque, size)
  }));
  const platesTotal = selectedPlateItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const houseItems = useMemo(() => {
    const items = [];
    const mainHouse = houseProducts[0];
    if (mainHouse) {
      if (mainHouse.variants && mainHouse.variants.length > 0) {
        mainHouse.variants.forEach((variant) => {
          const letter = extractSizeLetter(variant.name);
          const key = `casa_${letter}`;
          const label = cleanDimensions(variant.name);
          items.push({
            key,
            name: `Casa de Natal ${label}`,
            sizeLetter: letter,
            displayLabel: label,
            price: Number(variant.price),
            quantity: houses[key] ?? 0,
            image: mainHouse.images?.[0]?.src
          });
        });
      } else {
        houseProducts.forEach((prod) => {
          const letter = prod.slug.includes("-s") ? "S" : "M";
          const label = prod.pack_size ? `${letter} (${cleanDimensions(prod.pack_size)})` : letter;
          items.push({
            key: prod.id,
            name: `Casa de Natal ${label}`,
            sizeLetter: letter,
            displayLabel: label,
            price: Number(prod.base_price),
            quantity: houses[prod.id] ?? 0,
            image: prod.images?.[0]?.src
          });
        });
      }
    }
    return items;
  }, [houseProducts, houses]);
  const selectedHouses = houseItems.filter((item) => item.quantity > 0);
  const housesTotal = selectedHouses.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedDecorations = useMemo(() => decorationProducts.filter((product) => (decorations[product.id] ?? 0) > 0).map((product) => ({
    product,
    quantity: decorations[product.id],
    price: Number(product.base_price)
  })), [decorationProducts, decorations]);
  const decorationCount = selectedDecorations.reduce((sum, item) => sum + item.quantity, 0);
  const decorationsTotal = selectedDecorations.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotalBruto = basePrice + platesTotal + housesTotal + decorationsTotal;
  const discountRate = subtotalBruto >= 30 ? 0.12 : subtotalBruto >= 20 ? 0.08 : subtotalBruto >= 12 ? 0.05 : 0;
  const discount = subtotalBruto * discountRate;
  const total = subtotalBruto - discount;
  const nextTierMessage = subtotalBruto < 12 ? `Faltam ${money(12 - subtotalBruto)} para ativares 5% de desconto!` : subtotalBruto < 20 ? `Faltam ${money(20 - subtotalBruto)} para subires para 8% de desconto!` : subtotalBruto < 30 ? `Faltam ${money(30 - subtotalBruto)} para o desconto máximo de 12%!` : "🎉 Parabéns! Atingiste o desconto máximo de 12%!";
  function triggerOrder(contact) {
    if (!base) {
      setError("A base de Natal não está disponível.");
      return;
    }
    setError("");
    const baseVariant = base.variants?.find((v) => extractSizeLetter(v.name) === baseSize);
    const baseLabel = cleanDimensions(baseVariant?.name || baseSize);
    const lines = ["🎄 *Pedido de Natal — BROMINDS*", "", `Base: ${base.name} (${baseLabel}) — ${money(basePrice)}`, "", "*Placas:*", ...selectedPlateItems.length > 0 ? selectedPlateItems.map((item) => `${plaque?.name ?? "Placa"} (${item.size}) × ${item.quantity} — ${money(item.price * item.quantity)}`) : ["Sem placas"], "", "*Casas de Natal:*", ...selectedHouses.length > 0 ? selectedHouses.map((item) => `${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`) : ["Sem casas de Natal"], "", "*Mais decorações:*", ...selectedDecorations.length > 0 ? selectedDecorations.map((item) => `${item.product.name} × ${item.quantity} — ${money(item.price * item.quantity)}`) : ["Sem decorações adicionais"], "", `Subtotal: ${money(subtotalBruto)}`, ...discount > 0 ? [`Desconto especial (${Math.round(discountRate * 100)}%): −${money(discount)}`] : [], `*Total final: ${money(total)}*`, "", "Olá! Gostaria de confirmar esta encomenda. Qual é a disponibilidade?"];
    const message = encodeURIComponent(lines.join("\n"));
    const whatsappNumber = CONTACT_NUMBERS[contact];
    setContactModalOpen(false);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener,noreferrer");
  }
  function handleDesktopSend() {
    if (!selectedContactDesktop) {
      setError("Seleciona quem pretendes contactar (Tiago ou Inês).");
      return;
    }
    triggerOrder(selectedContactDesktop);
  }
  if (loading) {
    return /* @__PURE__ */ jsx("section", { className: "mx-auto max-w-6xl px-4 py-20 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-ink-2", children: "A preparar a coleção de Natal..." }) });
  }
  if (error && products.length === 0) {
    return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-6xl px-4 py-20 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-ink", children: "Packs de Natal" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-ink-2", children: error }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => window.location.reload(), className: "mt-6 rounded-card bg-ember px-5 py-3 font-semibold text-white", children: "Tentar novamente" })
    ] });
  }
  const renderSummaryDetails = () => /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-ink-2", children: [
          "Base · ",
          baseSize
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-ink", children: money(basePrice) })
      ] }),
      selectedPlateItems.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-ink-2", children: [
          "Placa ",
          item.size,
          " × ",
          item.quantity
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-ink", children: money(item.price * item.quantity) })
      ] }, item.size)),
      selectedHouses.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-ink-2", children: [
          item.name,
          " × ",
          item.quantity
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-ink", children: money(item.price * item.quantity) })
      ] }, item.key)),
      selectedDecorations.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-ink-2", children: [
          item.product.name,
          " × ",
          item.quantity
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-ink", children: money(item.price * item.quantity) })
      ] }, item.product.id)),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-ink/10 pt-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-ink-2", children: "Placas" }),
          /* @__PURE__ */ jsx("span", { className: "text-ink", children: money(platesTotal) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-ink-2", children: "Casas" }),
          /* @__PURE__ */ jsx("span", { className: "text-ink", children: money(housesTotal) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-ink-2", children: [
            "Outras decorações (",
            decorationCount,
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-ink", children: money(decorationsTotal) })
        ] }),
        discount > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-ink-2", children: [
            "Desconto (",
            Math.round(discountRate * 100),
            "%)"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium text-emerald-700", children: [
            "−",
            money(discount)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between gap-3 border-t border-ink/10 pt-4", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink", children: "Total estimado" }),
        /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-ink", children: money(total) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-lg bg-paper-2 p-3 text-xs font-medium text-ink-2", children: nextTierMessage })
  ] });
  const plaqueImage = plaque?.images?.[0]?.src;
  return /* @__PURE__ */ jsxs("div", { className: "bg-paper pb-36 lg:pb-12", children: [
    /* @__PURE__ */ jsx("section", { className: "border-b border-ink/10 bg-paper-2", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 py-12 sm:py-16", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-ember", children: "BROMINDS · Coleção de Natal" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl", children: "Cria o teu pack de Natal" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-2xl text-ink-2", children: "Dá vida à magia do Natal com uma combinação feita por ti. Escolhe a base, adiciona placas, casas e decorações para criar um pack único." }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-2xl font-medium text-ember", children: "Descontos diretos a partir de 12 €! Aproveita até 12% de desconto no teu conjunto." })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1fr_340px] lg:gap-10 lg:py-10", children: [
      /* @__PURE__ */ jsxs("aside", { className: "hidden h-fit rounded-card border border-ink/10 bg-white p-5 sm:p-6 lg:order-2 lg:block lg:sticky lg:top-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.15em] text-ember", children: "A tua escolha" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 text-2xl font-bold text-ink", children: "Resumo do pack" }),
        /* @__PURE__ */ jsx("div", { className: "mt-6", children: renderSummaryDetails() }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 border-t border-ink/10 pt-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-ink-2", children: "Contactar" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
              setSelectedContactDesktop("tiago");
              setError("");
            }, className: `rounded-card border p-3 text-left transition ${selectedContactDesktop === "tiago" ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600" : "border-ink/10 bg-white hover:border-ink/30"}`, children: /* @__PURE__ */ jsx("p", { className: "font-bold text-ink text-sm", children: "Tiago Costa" }) }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
              setSelectedContactDesktop("ines");
              setError("");
            }, className: `rounded-card border p-3 text-left transition ${selectedContactDesktop === "ines" ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600" : "border-ink/10 bg-white hover:border-ink/30"}`, children: /* @__PURE__ */ jsx("p", { className: "font-bold text-ink text-sm", children: "Inês Costa" }) })
          ] })
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm font-medium text-red-600", children: error }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: handleDesktopSend, disabled: !base || !selectedContactDesktop, className: "mt-6 w-full rounded-card bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50", children: "Encomendar pelo WhatsApp" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-center text-xs text-ink-2", children: "Envia o teu pack para confirmar a encomenda." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "order-1 min-w-0 space-y-10", children: [
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex size-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white", children: "1" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink", children: "Escolhe a base" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-2", children: "Seleciona o tamanho da tua base." })
            ] })
          ] }),
          !base ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-2", children: "Não foi encontrada uma base de Natal." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: (base.variants ?? []).map((variant) => {
            const letter = extractSizeLetter(variant.name);
            const label = cleanDimensions(variant.name);
            return /* @__PURE__ */ jsxs("button", { type: "button", "aria-pressed": baseSize === letter, onClick: () => setBaseSize(letter), className: `rounded-card border p-4 text-left transition ${baseSize === letter ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600" : "border-ink/10 bg-white hover:border-ink/30"}`, children: [
              /* @__PURE__ */ jsx("span", { className: "block text-base font-bold text-ink", children: label }),
              /* @__PURE__ */ jsx("span", { className: "mt-2 block text-sm font-semibold text-ink", children: money(Number(variant.price)) })
            ] }, variant.name);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex size-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white", children: "2" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink", children: "Escolhe as placas" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-2", children: "Podes adicionar várias unidades de cada tamanho." })
            ] })
          ] }),
          !plaque ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-2", children: "Não há placas disponíveis neste momento." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: (plaque.variants ?? []).map((variant) => {
            const label = cleanDimensions(variant.name);
            const quantity = selectedPlates[label] ?? 0;
            return /* @__PURE__ */ jsxs("article", { className: `overflow-hidden rounded-card border bg-white p-4 transition ${quantity > 0 ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600" : "border-ink/10"}`, children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper-2", children: plaqueImage ? /* @__PURE__ */ jsx("img", { src: plaqueImage, alt: variant.name, className: "size-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🪵" }) }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxs("h3", { className: "font-bold text-ink text-sm sm:text-base", children: [
                    "Placa ",
                    label
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs sm:text-sm font-semibold text-ink", children: [
                    money(Number(variant.price)),
                    " / unidade"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-end gap-3 border-t border-ink/5 pt-3", children: [
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => updateSelection(setSelectedPlates, label, quantity - 1), disabled: quantity === 0, "aria-label": `Remover placa ${label}`, className: "flex size-8 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30", children: "−" }),
                /* @__PURE__ */ jsx("span", { className: "min-w-5 text-center font-semibold text-ink", children: quantity }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: () => updateSelection(setSelectedPlates, label, quantity + 1), disabled: quantity >= 10, "aria-label": `Adicionar placa ${label}`, className: "flex size-8 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30", children: "+" })
              ] })
            ] }, variant.name);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex size-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white", children: "3" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink", children: "Casas de Natal" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-2", children: "Escolhe o tamanho da casa e a quantidade pretendida." })
            ] })
          ] }),
          houseItems.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-2", children: "Não foram encontradas casas de Natal." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: houseItems.map((item) => /* @__PURE__ */ jsxs("article", { className: `rounded-card border bg-white p-4 transition ${item.quantity > 0 ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600" : "border-ink/10"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper-2", children: item.image ? /* @__PURE__ */ jsx("img", { src: item.image, alt: item.name, className: "size-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-3xl", children: "🏠" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-ink", children: [
                  "Casa de Natal ",
                  item.displayLabel
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 font-medium text-ember", children: money(item.price) }),
                /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs font-medium text-emerald-700", children: "✓ Vela LED incluída" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => updateSelection(setHouses, item.key, item.quantity - 1), disabled: item.quantity === 0, "aria-label": `Remover ${item.name}`, className: "flex size-9 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30", children: "−" }),
              /* @__PURE__ */ jsx("span", { className: "min-w-5 text-center font-semibold text-ink", children: item.quantity }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: () => updateSelection(setHouses, item.key, item.quantity + 1), disabled: item.quantity >= 10, "aria-label": `Adicionar ${item.name}`, className: "flex size-9 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30", children: "+" })
            ] })
          ] }, item.key)) })
        ] }),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex size-9 items-center justify-center rounded-full bg-ember text-sm font-bold text-white", children: "4" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink", children: "Mais decorações" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-2", children: "Junta mais peças e aproveita os descontos por valor." })
            ] })
          ] }),
          decorationProducts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-2", children: "Não foram encontradas outras decorações de Natal." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: decorationProducts.map((product) => {
            const quantity = decorations[product.id] ?? 0;
            const image = product.images?.[0]?.src;
            const isChurch = product.slug.includes("igreja");
            const ledIncluded = isChurch || LED_INCLUDED_SLUGS.includes(product.slug);
            const dims = cleanDimensions(product.pack_size);
            return /* @__PURE__ */ jsx("article", { className: "overflow-hidden rounded-card border border-ink/10 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4 p-4", children: [
              /* @__PURE__ */ jsx("div", { className: "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper-2", children: image ? /* @__PURE__ */ jsx("img", { src: image, alt: product.images?.[0]?.alt || product.name, className: "size-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-3xl", children: isChurch ? "⛪" : "🎄" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-ink", children: product.name }),
                dims && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-ink-2", children: dims }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 font-medium text-ember", children: money(Number(product.base_price)) }),
                ledIncluded && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs font-medium text-emerald-700", children: "✓ Vela LED incluída" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: () => updateSelection(setDecorations, product.id, quantity - 1), disabled: quantity === 0, "aria-label": `Remover ${product.name}`, className: "flex size-8 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30", children: "−" }),
                  /* @__PURE__ */ jsx("span", { className: "min-w-4 text-center font-semibold text-ink", children: quantity }),
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: () => updateSelection(setDecorations, product.id, quantity + 1), disabled: quantity >= 10, "aria-label": `Adicionar ${product.name}`, className: "flex size-8 items-center justify-center rounded-full border border-ink/15 text-lg disabled:opacity-30", children: "+" })
                ] })
              ] })
            ] }) }, product.id);
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 p-4 shadow-xl backdrop-blur-md lg:hidden", children: [
      mobileSummaryOpen && /* @__PURE__ */ jsxs("div", { className: "mb-4 max-h-[60vh] overflow-y-auto rounded-card border border-ink/10 bg-paper p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-ink", children: "Detalhes do Pack" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMobileSummaryOpen(false), className: "text-xs font-semibold text-ink-2", children: "✕ Fechar" })
        ] }),
        renderSummaryDetails()
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setMobileSummaryOpen((prev) => !prev), className: "text-left", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-ink", children: money(total) }),
            discount > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-emerald-700", children: [
              "(−",
              Math.round(discountRate * 100),
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "block text-xs font-medium text-emerald-700 underline", children: mobileSummaryOpen ? "Esconder resumo" : "Ver resumo" })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setContactModalOpen(true), disabled: !base, className: "rounded-card bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition active:scale-95 disabled:opacity-50", children: "Encomendar WhatsApp" })
      ] })
    ] }),
    contactModalOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm rounded-card border border-ink/10 bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-ink", children: "Com quem queres falar?" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setContactModalOpen(false), className: "flex size-7 items-center justify-center rounded-full bg-paper-2 text-ink-2 hover:text-ink text-sm", children: "✕" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-xs text-ink-2", children: "Escolhe um dos contactos para enviar o teu pack pelo WhatsApp:" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => triggerOrder("tiago"), className: "w-full rounded-card border border-emerald-600/30 bg-emerald-50/50 p-3.5 text-left transition active:scale-98 hover:border-emerald-600 hover:bg-emerald-50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-bold text-ink", children: "Tiago Costa" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-2", children: "Modelação & Produção 3D" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-lg", children: "💬" })
        ] }) }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => triggerOrder("ines"), className: "w-full rounded-card border border-emerald-600/30 bg-emerald-50/50 p-3.5 text-left transition active:scale-98 hover:border-emerald-600 hover:bg-emerald-50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-bold text-ink", children: "Inês Costa" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-2", children: "Atendimento & Encomendas" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-lg", children: "💬" })
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  PacksNatalPage as component
};
