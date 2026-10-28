import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { i as site } from "./router-Yi7VtT48.js";
import { ChevronRight, Sparkles, Send, Phone, MessageCircle, Mail, Clock } from "lucide-react";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "zod";
function ContactoPage() {
  const [nome, setNome] = useState("");
  const [contactoPref, setContactoPref] = useState("tiago");
  const [mensagem, setMensagem] = useState("");
  const [dimensoes, setDimensoes] = useState("");
  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const destinatario = contactoPref === "ines" ? site.team.ines.rawPhone : site.team.tiago.rawPhone;
    const texto = encodeURIComponent(`Olá ${contactoPref === "ines" ? "Inês" : "Tiago"} (BroMinds)!
Chamo-me ${nome || "um cliente"}.

Gostava de pedir informações / orçamento para um projeto 3D:
• Detalhes: ${mensagem}
` + (dimensoes ? `• Medidas pretendidas: ${dimensoes}
` : ""));
    window.open(`https://wa.me/${destinatario}?text=${texto}`, "_blank");
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12", children: [
    /* @__PURE__ */ jsxs("nav", { className: "mb-6 flex items-center gap-2 text-xs text-ink-3", children: [
      /* @__PURE__ */ jsx("a", { href: "/", className: "hover:text-ink", children: "Início" }),
      /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
      /* @__PURE__ */ jsx("span", { className: "font-medium text-ink", children: "Contacto & Orçamentos" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 max-w-2xl", children: [
      /* @__PURE__ */ jsxs("span", { className: "label-mono mb-2 inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-2 px-3 py-1 text-xs text-ink-2", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-ember" }),
        "Projetos & Apoio"
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold text-ink sm:text-4xl", children: "Fala connosco" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-ink-2", children: "Tens um ficheiro STL próprio ou queres uma peça com medidas e cores personalizadas? Fala connosco diretamente por WhatsApp ou Email." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-10 lg:grid-cols-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-paper-3 bg-paper p-6 sm:p-8 shadow-sm lg:col-span-7", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-ink", children: "Pedir Orçamento sem Compromisso" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-ink-3", children: "Preenche os detalhes para enviar a mensagem formatada para o nosso WhatsApp." }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleWhatsAppSubmit, className: "mt-6 flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5", children: "O teu Nome" }),
            /* @__PURE__ */ jsx("input", { type: "text", required: true, value: nome, onChange: (e) => setNome(e.target.value), placeholder: "Ex: João Silva", className: "w-full rounded-xl border border-paper-3 bg-paper-2 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ember focus:bg-paper" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5", children: "Falar com" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setContactoPref("tiago"), className: `rounded-xl border p-3 text-left transition ${contactoPref === "tiago" ? "border-ink bg-ink text-paper" : "border-paper-3 bg-paper hover:bg-paper-2 text-ink"}`, children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: site.team.tiago.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs opacity-75", children: site.team.tiago.role })
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setContactoPref("ines"), className: `rounded-xl border p-3 text-left transition ${contactoPref === "ines" ? "border-ink bg-ink text-paper" : "border-paper-3 bg-paper hover:bg-paper-2 text-ink"}`, children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: site.team.ines.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs opacity-75", children: site.team.ines.role })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5", children: "Dimensões estimadas (opcional)" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: dimensoes, onChange: (e) => setDimensoes(e.target.value), placeholder: "Ex: 15cm de altura, cerca de 10x10cm...", className: "w-full rounded-xl border border-paper-3 bg-paper-2 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ember focus:bg-paper" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5", children: "Descrição da ideia ou modelo" }),
            /* @__PURE__ */ jsx("textarea", { required: true, rows: 4, value: mensagem, onChange: (e) => setMensagem(e.target.value), placeholder: "Descreve a peça pretendida, cores ou acabamentos...", className: "w-full resize-none rounded-xl border border-paper-3 bg-paper-2 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ember focus:bg-paper" })
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "submit", className: "mt-2 flex items-center justify-center gap-2 rounded-xl bg-ember py-3.5 px-6 font-semibold text-paper shadow-md transition hover:bg-ember-deep active:scale-[0.99]", children: [
            /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
            "Enviar Mensagem pelo WhatsApp"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 lg:col-span-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-paper-3 bg-paper p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-ember/10 text-ember", children: /* @__PURE__ */ jsx(Phone, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-ink", children: site.team.tiago.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3", children: site.team.tiago.role })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between border-t border-paper-3 pt-3", children: [
            /* @__PURE__ */ jsx("a", { href: `tel:${site.team.tiago.rawPhone}`, className: "text-xs font-mono font-medium text-ink hover:text-ember", children: site.team.tiago.phone }),
            /* @__PURE__ */ jsxs("a", { href: `https://wa.me/${site.team.tiago.rawPhone}`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline", children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
              "WhatsApp"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-paper-3 bg-paper p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-ember/10 text-ember", children: /* @__PURE__ */ jsx(Phone, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-ink", children: site.team.ines.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3", children: site.team.ines.role })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between border-t border-paper-3 pt-3", children: [
            /* @__PURE__ */ jsx("a", { href: `tel:${site.team.ines.rawPhone}`, className: "text-xs font-mono font-medium text-ink hover:text-ember", children: site.team.ines.phone }),
            /* @__PURE__ */ jsxs("a", { href: `https://wa.me/${site.team.ines.rawPhone}`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-xs font-semibold text-ember hover:underline", children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
              "WhatsApp"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-paper-3 bg-paper p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-paper-3 text-ink", children: /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-ink", children: "Email Direto" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-ink-3", children: "Para envio de ficheiros STL/OBJ e orçamentos" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 border-t border-paper-3 pt-3", children: /* @__PURE__ */ jsx("a", { href: `mailto:${site.contact.email}`, className: "text-xs font-mono font-medium text-ink hover:text-ember", children: site.contact.email }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-paper-3 bg-paper-2 p-5 text-xs text-ink-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-semibold text-ink mb-2", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-ember" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Prazo de Produção: ",
              site.info.prazo
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "leading-relaxed", children: "Produzimos sob encomenda com filamento PLA/PETG de alta qualidade e fazemos verificação dimensional antes de enviar." })
        ] })
      ] })
    ] })
  ] });
}
export {
  ContactoPage as component
};
