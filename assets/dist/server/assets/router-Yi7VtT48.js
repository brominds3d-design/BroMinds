import { Link, useRouterState, createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { MapPin, Instagram, Mail, X, Heart, AtSign, User, LogOut, MessageCircle, Menu, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
function LogoMark({ className = "h-8 w-8" }) {
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: "/img/logo-brominds.png",
      alt: "BroMinds",
      className: `${className} object-contain`
    }
  );
}
function Wordmark({ className = "text-ink" }) {
  return /* @__PURE__ */ jsxs("span", { className: `font-display text-xl font-extrabold tracking-tight ${className}`, children: [
    "Bro",
    /* @__PURE__ */ jsx("span", { className: "text-ember", children: "Minds" })
  ] });
}
const site = {
  name: "BroMinds",
  tagline: "Impressão 3D & Design Criativo",
  description: "Catálogo de peças decorativas e utilitárias impressas em 3D pela BroMinds. Encomendas personalizadas com acabamento de alta qualidade.",
  location: "Portugal",
  /** Canal principal de encomenda ativado por defeito */
  orderChannel: "whatsapp",
  contact: {
    email: "brominds3d@gmail.com",
    instagram: "brominds.3d",
    // podes alterar se tiverem outro handle
    whatsapp: "351916175751"
    // Teu WhatsApp (Tiago) como principal de encomendas
  },
  /** Contactos individuais da equipa BroMinds */
  team: {
    tiago: {
      name: "Tiago Costa",
      phone: "+351 916 175 751",
      rawPhone: "351916175751",
      role: "Modelação & Produção 3D"
    },
    ines: {
      name: "Inês Costa",
      phone: "+351 911 565 367",
      rawPhone: "351911565367",
      role: "Atendimento & Encomendas"
    }
  },
  /** Informações de prazos, envios e pagamento */
  info: {
    prazo: "2 a 4 dias úteis para peças em catálogo"
  }
};
const instagramUrl = `https://instagram.com/${site.contact.instagram}`;
const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`;
const emailUrl = `mailto:${site.contact.email}`;
function orderLink(options) {
  const { productName, color, size, price } = options ?? {};
  const subject = productName ? `Encomenda: ${productName}` : `Pedido de Informação — ${site.name}`;
  const body = productName ? `Olá BroMinds! Gostaria de encomendar a seguinte peça:

• Peça: ${productName}
` + (size ? `• Tamanho: ${size}
` : "") + (color ? `• Cor: ${color}
` : "") + (price !== void 0 ? `• Valor: ${price.toFixed(2)} €
` : "") + `
Quantidade: 1
Nome:
Morada/Localidade:` : `Olá BroMinds! Gostaria de pedir informações sobre as vossas peças e impressões 3D.`;
  switch (site.orderChannel) {
    case "whatsapp":
      return `${whatsappUrl}?text=${encodeURIComponent(body)}`;
    case "instagram":
      return instagramUrl;
    case "email":
    default:
      return `${emailUrl}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
  }
}
function orderChannelLabel() {
  switch (site.orderChannel) {
    case "whatsapp":
      return "Pedir por WhatsApp";
    case "instagram":
      return "Pedir por Instagram";
    case "email":
    default:
      return "Pedir por Email";
  }
}
const categories = [
  { id: "halloween", name: "Halloween" },
  { id: "natal", name: "Natal" },
  { id: "organizacao", name: "Organização" },
  { id: "decoracao", name: "Decoração" }
];
function Footer() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsxs("footer", { className: "relative mt-20 overflow-hidden border-t border-paper-3 bg-ink text-paper", children: [
    /* @__PURE__ */ jsx("div", { className: "voxel-grid absolute inset-0 opacity-40", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs("div", { className: "relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx(LogoMark, { className: "h-7 w-7" }),
          /* @__PURE__ */ jsx(Wordmark, { className: "text-paper" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "max-w-[36ch] text-[0.88rem] leading-relaxed text-paper/68", children: "Dois irmãos, uma impressora 3D e a vontade de dar vida a ideias em filamento. Criamos peças e decorações únicas, modelo a modelo." }),
        /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-[0.84rem] text-paper/58", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5 text-ember", "aria-hidden": "true" }),
          site.location
        ] })
      ] }),
      /* @__PURE__ */ jsxs("nav", { "aria-label": "Categorias", children: [
        /* @__PURE__ */ jsx("h2", { className: "label-mono mb-3.5 text-paper/48", children: "Categorias" }),
        /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-2", children: categories.map((category) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "a",
          {
            href: `/catalogo?categoria=${category.id}`,
            className: "text-[0.88rem] text-paper/76 transition-colors hover:text-ember",
            children: category.name
          }
        ) }, category.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "label-mono mb-3.5 text-paper/48", children: "Falar connosco" }),
        /* @__PURE__ */ jsxs("ul", { className: "flex flex-col gap-2.5", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://instagram.com/bro.minds",
              target: "_blank",
              rel: "noreferrer",
              className: "flex items-center gap-2 text-[0.88rem] text-paper/76 transition-colors hover:text-ember",
              children: [
                /* @__PURE__ */ jsx(Instagram, { className: "h-4 w-4 text-ember", "aria-hidden": "true" }),
                "@bro.minds"
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: emailUrl,
              className: "flex items-center gap-2 text-[0.88rem] text-paper/76 transition-colors hover:text-ember",
              children: [
                /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 text-ember", "aria-hidden": "true" }),
                site.contact.email
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("li", { className: "pt-1.5", children: /* @__PURE__ */ jsx(
            Link,
            {
              to: "/contacto",
              className: "text-[0.88rem] text-paper/76 underline decoration-paper/25 underline-offset-4 transition-colors hover:text-ember",
              children: "Página de contacto"
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative border-t border-paper/10", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[0.76rem] text-paper/42 sm:flex-row sm:items-center sm:justify-between sm:px-6", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "© ",
        year,
        " ",
        site.name,
        ". Peças feitas por encomenda."
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Preços em euros, com IVA incluído." })
    ] }) })
  ] });
}
const supabaseUrl = "https://mylvjpabqpxpvizeywco.supabase.co";
const supabaseAnonKey = "sb_publishable_v9bIVfpGU92n2E7nwW9kbw_sE98RapD";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const STORAGE_KEY = "brominds_customer_user";
function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveCurrentUser(user) {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event("auth_changed"));
}
async function loginOrRegisterHandle(rawHandle, rawName) {
  const cleanHandle = rawHandle.trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_.-]/g, "");
  if (!cleanHandle) throw new Error("O @username não é válido.");
  const { data: existing, error: findError } = await supabase.from("customer_profiles").select("*").eq("handle", cleanHandle).maybeSingle();
  if (findError) throw findError;
  if (existing) {
    const user2 = { handle: existing.handle, displayName: existing.display_name };
    saveCurrentUser(user2);
    return user2;
  }
  const finalName = rawName?.trim() || cleanHandle;
  const { data: created, error: createError } = await supabase.from("customer_profiles").insert([{ handle: cleanHandle, display_name: finalName }]).select().single();
  if (createError) throw createError;
  const user = { handle: created.handle, displayName: created.display_name };
  saveCurrentUser(user);
  return user;
}
async function getFavoriteProductIds(handle) {
  const { data, error } = await supabase.from("favorites").select("product_id").eq("user_handle", handle);
  if (error || !data) return [];
  return data.map((f) => String(f.product_id));
}
async function toggleFavorite(handle, productId) {
  const { data } = await supabase.from("favorites").select("id").eq("user_handle", handle).eq("product_id", productId).maybeSingle();
  if (data) {
    await supabase.from("favorites").delete().eq("user_handle", handle).eq("product_id", productId);
    window.dispatchEvent(new Event("favorites_changed"));
    return false;
  } else {
    await supabase.from("favorites").insert([{ user_handle: handle, product_id: productId }]);
    window.dispatchEvent(new Event("favorites_changed"));
    return true;
  }
}
function AuthModal({ isOpen, onClose, onSuccess }) {
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const user = await loginOrRegisterHandle(handle, name);
      onSuccess(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-sm rounded-3xl border border-paper-3 bg-paper p-6 shadow-2xl", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute right-4 top-4 p-1.5 rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink transition",
        children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ember/10 text-ember", children: /* @__PURE__ */ jsx(Heart, { className: "h-6 w-6 fill-current" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-extrabold text-ink", children: "Guarda os teus Favoritos" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-ink-3", children: "Sem passwords nem emails chatos. Escolhe o teu @arroba para acederes à tua lista sempre que voltares." })
    ] }),
    errorMsg && /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-xl bg-red-50 p-2.5 text-center text-xs font-semibold text-red-600", children: errorMsg }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-5 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-bold uppercase tracking-wider text-ink-2", children: "O teu @ (Identificador)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center rounded-xl border border-paper-3 bg-paper-2 px-3 py-2 focus-within:border-ember", children: [
          /* @__PURE__ */ jsx(AtSign, { className: "mr-1.5 h-4 w-4 text-ink-3" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              required: true,
              value: handle,
              onChange: (e) => setHandle(e.target.value),
              placeholder: "ex: tiago ou martas",
              className: "w-full bg-transparent text-sm text-ink outline-none"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1 block text-xs font-bold uppercase tracking-wider text-ink-2", children: "O teu Nome (Opcional)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center rounded-xl border border-paper-3 bg-paper-2 px-3 py-2 focus-within:border-ember", children: [
          /* @__PURE__ */ jsx(User, { className: "mr-1.5 h-4 w-4 text-ink-3" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "ex: Tiago Costa",
              className: "w-full bg-transparent text-sm text-ink outline-none"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "mt-2 w-full rounded-xl bg-ember py-3 text-sm font-semibold text-paper shadow-md transition hover:bg-ember-deep disabled:opacity-50",
          children: loading ? "A validar..." : "Entrar / Guardar"
        }
      )
    ] })
  ] }) });
}
const nav = [
  { to: "/", label: "Início" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/categorias", label: "Categorias" },
  { to: "/contacto", label: "Contacto" }
];
function Header() {
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const updateAuth = () => {
    setUser(getCurrentUser());
  };
  useEffect(() => {
    updateAuth();
    window.addEventListener("auth_changed", updateAuth);
    return () => {
      window.removeEventListener("auth_changed", updateAuth);
    };
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  const handleLogout = () => {
    saveCurrentUser(null);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-50 border-b border-paper-3 bg-paper/90 backdrop-blur-md transition-colors", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/",
            className: "group flex items-center gap-2.5 transition-transform active:scale-95",
            "aria-label": "BroMinds, página inicial",
            children: [
              /* @__PURE__ */ jsx("div", { className: "relative flex items-center justify-center", children: /* @__PURE__ */ jsx(LogoMark, { className: "h-8 w-8 object-contain transition-transform group-hover:scale-105" }) }),
              /* @__PURE__ */ jsx(Wordmark, {})
            ]
          }
        ),
        /* @__PURE__ */ jsx("nav", { className: "hidden items-center gap-1.5 md:flex", "aria-label": "Navegação principal", children: nav.map((item) => /* @__PURE__ */ jsx(NavLink, { to: item.to, label: item.label }, item.to)) }),
        /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-2.5 md:flex", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/favoritos",
              className: "flex h-10 w-10 items-center justify-center rounded-xl border border-paper-3 bg-paper text-ink transition hover:border-ember hover:text-ember active:scale-95 shadow-sm",
              title: "Os meus favoritos",
              children: /* @__PURE__ */ jsx(Heart, { className: "h-4 w-4" })
            }
          ),
          user ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 rounded-xl border border-paper-3 bg-paper-2 px-3 py-1.5 text-xs", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-ink flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5 text-ember" }),
              "@",
              user.handle
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleLogout,
                className: "ml-1 text-ink-3 hover:text-red-600 transition",
                title: "Terminar sessão",
                children: /* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" })
              }
            )
          ] }) : /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowAuthModal(true),
              className: "flex items-center gap-1.5 rounded-xl border border-paper-3 bg-paper px-3 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-ember hover:text-ember active:scale-95",
              children: [
                /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5 text-ember" }),
                /* @__PURE__ */ jsx("span", { children: "Entrar com @" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `https://wa.me/${site.contact.whatsapp}`,
              target: "_blank",
              rel: "noreferrer",
              className: "flex items-center gap-2 rounded-xl border border-paper-3 bg-paper px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-ember hover:text-ember active:scale-95",
              children: [
                /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5 text-ember" }),
                /* @__PURE__ */ jsx("span", { children: "WhatsApp" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setOpen((value) => !value),
            "aria-expanded": open,
            "aria-controls": "menu-movel",
            className: "grid h-10 w-10 place-items-center rounded-xl border border-paper-3 text-ink transition hover:border-ember hover:bg-paper-2 md:hidden",
            children: [
              open ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-ember", "aria-hidden": "true" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5", "aria-hidden": "true" }),
              /* @__PURE__ */ jsx("span", { className: "sr-only", children: open ? "Fechar menu" : "Abrir menu" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          id: "menu-movel",
          hidden: !open,
          className: "border-t border-paper-3 bg-paper/98 px-5 py-6 shadow-xl backdrop-blur-lg md:hidden",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between pb-3 border-b border-paper-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-mono uppercase tracking-wider text-ink-3", children: "Menu de Navegação" }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-[11px] font-semibold text-ember", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-[var(--color-gold)]" }),
                " BroMinds 3D"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("nav", { className: "flex flex-col gap-1", "aria-label": "Navegação móvel", children: [
              nav.map((item, index) => {
                const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: item.to,
                    className: `rise flex items-center justify-between rounded-xl px-3 py-3 font-display text-base font-bold transition ${isActive ? "bg-ember/10 text-ember" : "text-ink hover:bg-paper-2 hover:text-ember"}`,
                    style: { animationDelay: `${index * 0.04}s` },
                    children: [
                      /* @__PURE__ */ jsx("span", { children: item.label }),
                      /* @__PURE__ */ jsx("span", { className: "font-mono text-xs opacity-40", children: String(index + 1).padStart(2, "0") })
                    ]
                  },
                  item.to
                );
              }),
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/favoritos",
                  className: "flex items-center justify-between rounded-xl px-3 py-3 font-display text-base font-bold text-ink hover:bg-paper-2 hover:text-ember transition",
                  children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Heart, { className: "h-4 w-4 text-ember" }),
                    "Os meus Favoritos"
                  ] })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-2 border-t border-paper-3 pt-5", children: [
              user ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl bg-paper-2 p-3 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-ember" }),
                  /* @__PURE__ */ jsxs("span", { className: "font-semibold text-ink", children: [
                    "@",
                    user.handle
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleLogout,
                    className: "text-xs text-red-600 font-semibold",
                    children: "Sair"
                  }
                )
              ] }) : /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setOpen(false);
                    setShowAuthModal(true);
                  },
                  className: "flex w-full items-center justify-center gap-2 rounded-xl border border-paper-3 bg-paper py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-ember",
                  children: [
                    /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-ember" }),
                    "Entrar com @username"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: `https://wa.me/${site.contact.whatsapp}`,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "flex w-full items-center justify-center gap-2 rounded-xl bg-ember py-3 text-sm font-semibold text-paper shadow-md transition hover:bg-ember-deep",
                  children: [
                    /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4 text-[var(--color-gold)]" }),
                    "Pedir Orçamento por WhatsApp"
                  ]
                }
              )
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      AuthModal,
      {
        isOpen: showAuthModal,
        onClose: () => setShowAuthModal(false),
        onSuccess: () => updateAuth()
      }
    )
  ] });
}
function NavLink({ to, label }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to,
      className: `relative rounded-xl px-3.5 py-2 text-[0.88rem] font-semibold transition-colors ${isActive ? "text-ember" : "text-ink-2 hover:text-ink"}`,
      children: [
        label,
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `absolute inset-x-3.5 -bottom-[1px] h-[2px] rounded-full bg-ember transition-all duration-300 ease-[var(--ease-out-soft)] ${isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`,
            "aria-hidden": "true"
          }
        )
      ]
    }
  );
}
const Route$8 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${site.name} — ${site.tagline}` },
      { name: "description", content: site.description },
      { name: "theme-color", content: "#f7f3ec" },
      { property: "og:site_name", content: site.name },
      { property: "og:title", content: `${site.name} — ${site.tagline}` },
      { property: "og:description", content: site.description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/img/oficina-hero.png" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Instrument+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
      }
    ]
  }),
  notFoundComponent: NotFoundFallback,
  shellComponent: RootDocument
});
function NotFoundFallback() {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center", children: [
    /* @__PURE__ */ jsx("span", { className: "label-mono mb-2 rounded-full border border-ink/10 bg-paper-2 px-3 py-1 text-xs text-ink-3", children: "404" }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-ink sm:text-3xl", children: "Página não encontrada" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ink-2", children: "A página ou recurso que procuras não existe ou mudou de endereço." }),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "/",
        className: "mt-6 inline-flex items-center justify-center rounded-card bg-ember px-5 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-ember-deep",
        children: "Voltar à página inicial"
      }
    )
  ] });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "pt-PT", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "flex min-h-screen flex-col", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "#conteudo",
          className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-card focus:bg-ink focus:px-4 focus:py-2 focus:text-paper",
          children: "Saltar para o conteúdo"
        }
      ),
      /* @__PURE__ */ jsx(Header, {}),
      /* @__PURE__ */ jsx("main", { id: "conteudo", className: "flex-1", children }),
      /* @__PURE__ */ jsx(Footer, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const byOrder = (a, b) => a.order - b.order;
function mapSupabaseProduct(row, categoriesList = []) {
  const variants = Array.isArray(row.variants) ? row.variants : [];
  const basePrice = Number(row.base_price ?? (variants[0]?.price || 0));
  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    price: basePrice,
    basePrice,
    shortDescription: row.short_description || "",
    description: row.description || "",
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [{ src: "/img/placeholder.png", alt: row.name }],
    colors: Array.isArray(row.colors) ? row.colors : [],
    variants,
    details: Array.isArray(row.details) ? row.details : [],
    featured: Boolean(row.featured),
    createdAt: row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    category: categoriesList.find((c) => c.id === row.category_id)
  };
}
async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("order", { ascending: true });
  if (error || !data) {
    console.error("Erro ao procurar categorias no Supabase:", error);
    return [];
  }
  return data.sort(byOrder);
}
async function getFeaturedCategories() {
  const all = await getCategories();
  return all.filter((c) => c.featured);
}
async function getProducts() {
  const [categoriesData, productsData] = await Promise.all([
    getCategories(),
    supabase.from("products").select("*").order("created_at", { ascending: false })
  ]);
  if (productsData.error || !productsData.data) {
    console.error("Erro ao procurar produtos no Supabase:", productsData.error);
    return [];
  }
  return productsData.data.map((row) => mapSupabaseProduct(row, categoriesData));
}
async function getProductBySlug(slug) {
  const [categoriesData, productData] = await Promise.all([
    getCategories(),
    supabase.from("products").select("*").eq("slug", slug).single()
  ]);
  if (productData.error || !productData.data) {
    return void 0;
  }
  return mapSupabaseProduct(productData.data, categoriesData);
}
async function getRecentProducts(limit = 4) {
  const products = await getProducts();
  return products.slice(0, limit);
}
async function getCategoryCounts() {
  const products = await getProducts();
  return products.reduce((counts, product) => {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    return counts;
  }, {});
}
async function getRelatedProducts(categoryIdOrProduct, productId, limit = 4) {
  const products = await getProducts();
  const targetCategoryId = typeof categoryIdOrProduct === "object" ? categoryIdOrProduct.categoryId : categoryIdOrProduct;
  const targetId = typeof categoryIdOrProduct === "object" ? categoryIdOrProduct.id : productId;
  const sameCategory = products.filter(
    (p) => p.categoryId === targetCategoryId && p.id !== targetId
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const fillers = products.filter(
    (p) => p.categoryId !== targetCategoryId && p.id !== targetId
  );
  return [...sameCategory, ...fillers].slice(0, limit);
}
const $$splitComponentImporter$7 = () => import("./index-ijSqWr-_.js");
const Route$7 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component"),
  loader: async () => {
    const [allCategories, recentProducts, counts, allProducts] = await Promise.all([getFeaturedCategories(), getRecentProducts(4), getCategoryCounts(), getProducts()]);
    const activeCategories = allCategories.filter((cat) => cat.id !== "natal" && !cat.slug?.toLowerCase().includes("natal") && !cat.name?.toLowerCase().includes("natal"));
    return {
      featuredCategories: activeCategories,
      recentProducts,
      counts,
      totalProducts: allProducts.length
    };
  }
});
const $$splitComponentImporter$6 = () => import("./admin-B_EfX8CA.js");
const Route$6 = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./favoritos-Dqy05d20.js");
const Route$5 = createFileRoute("/favoritos")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./packs-natal-BKVKgHdO.js");
const Route$4 = createFileRoute("/packs-natal")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./index-CiqCJxuc.js");
const catalogoSearchSchema = z.object({
  categoria: z.string().optional()
});
const Route$3 = createFileRoute("/catalogo/")({
  validateSearch: (search) => catalogoSearchSchema.parse(search),
  loader: async () => {
    const [products, categories2] = await Promise.all([getProducts(), getCategories()]);
    return {
      products,
      categories: categories2
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_productSlug-BYkWeGJF.js");
const Route$2 = createFileRoute("/catalogo/$productSlug")({
  loader: async ({
    params
  }) => {
    const product = await getProductBySlug(params.productSlug);
    if (!product) {
      throw new Error("Produto não encontrado");
    }
    const prod = product;
    const categoryId = prod.categoryId ?? prod.category_id;
    const relatedProducts = await getRelatedProducts(categoryId, prod.id);
    return {
      product,
      relatedProducts
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-BU677jOl.js");
const Route$1 = createFileRoute("/categorias/")({
  loader: async () => {
    const [categories2, counts] = await Promise.all([getCategories(), getCategoryCounts()]);
    return {
      categories: categories2,
      counts
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-DqOiUyhf.js");
const Route = createFileRoute("/contacto/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route$7.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$8
});
const AdminRoute = Route$6.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$8
});
const FavoritosRoute = Route$5.update({
  id: "/favoritos",
  path: "/favoritos",
  getParentRoute: () => Route$8
});
const PacksNatalRoute = Route$4.update({
  id: "/packs-natal",
  path: "/packs-natal",
  getParentRoute: () => Route$8
});
const CatalogoIndexRoute = Route$3.update({
  id: "/catalogo/",
  path: "/catalogo/",
  getParentRoute: () => Route$8
});
const CatalogoProductSlugRoute = Route$2.update({
  id: "/catalogo/$productSlug",
  path: "/catalogo/$productSlug",
  getParentRoute: () => Route$8
});
const CategoriasIndexRoute = Route$1.update({
  id: "/categorias/",
  path: "/categorias/",
  getParentRoute: () => Route$8
});
const ContactoIndexRoute = Route.update({
  id: "/contacto/",
  path: "/contacto/",
  getParentRoute: () => Route$8
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  FavoritosRoute,
  PacksNatalRoute,
  CatalogoProductSlugRoute,
  CatalogoIndexRoute,
  CategoriasIndexRoute,
  ContactoIndexRoute
};
const routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  AuthModal as A,
  Route$7 as R,
  orderLink as a,
  getFavoriteProductIds as b,
  getProducts as c,
  saveCurrentUser as d,
  Route$3 as e,
  Route$2 as f,
  getCurrentUser as g,
  Route$1 as h,
  site as i,
  orderChannelLabel as o,
  router as r,
  supabase as s,
  toggleFavorite as t
};
