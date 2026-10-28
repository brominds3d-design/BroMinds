import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
function img(src, _options) {
  return src;
}
function imgSrcSet(src, _widths, _options) {
  return src;
}
function CategoryCard({
  category,
  count,
  delay,
  size = "md"
}) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: "/catalogo",
      search: { categoria: category.id || category.slug },
      className: `group relative flex overflow-hidden rounded-card-lg bg-ink transition-transform duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 ${size === "lg" ? "sm:col-span-2" : ""} ${delay === void 0 ? "" : "rise"}`,
      style: delay === void 0 ? void 0 : { animationDelay: `${delay}s` },
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: img(category.image),
            srcSet: imgSrcSet(category.image),
            sizes: size === "lg" ? "(min-width: 640px) 44rem, 92vw" : "(min-width: 640px) 22rem, 92vw",
            alt: `Peças da categoria ${category.name}`,
            className: "absolute inset-0 h-full w-full object-cover opacity-[0.82] transition-[transform,opacity] duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06] group-hover:opacity-100",
            loading: "lazy",
            decoding: "async"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent",
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `relative z-10 flex w-full flex-col justify-end gap-1.5 p-5 text-paper ${size === "lg" ? "min-h-[17rem] sm:min-h-[19rem]" : "min-h-[13.5rem]"}`,
            children: [
              /* @__PURE__ */ jsxs("span", { className: "label-mono text-paper/62", children: [
                count,
                " ",
                count === 1 ? "peça" : "peças"
              ] }),
              /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-display text-2xl font-bold", children: [
                category.name,
                /* @__PURE__ */ jsx(
                  ArrowUpRight,
                  {
                    className: "h-4 w-4 text-ember transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                    "aria-hidden": "true"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "max-w-[30ch] text-[0.86rem] leading-snug text-paper/78", children: category.tagline })
            ]
          }
        )
      ]
    }
  );
}
export {
  CategoryCard as C
};
