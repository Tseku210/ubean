import '../chunks/page-ssr_BwWVwiW0.mjs';
import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Dnj5Tjv1.mjs';
import { $ as $$HomeLayout } from '../chunks/HomeLayout_BNlzTWII.mjs';
import { g as getLangFromUrl, u as useTranslations } from '../chunks/Footer_DCGX1fy9.mjs';
import { S as Smoke } from '../chunks/smoke_pfD68SCJ.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const lang = getLangFromUrl(Astro2.url);
  const t = useTranslations(lang);
  return renderTemplate`${renderComponent($$result, "HomeLayout", $$HomeLayout, { "title": `UBean - ${t("home.title")}` }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "HomePage", null, { "client:only": "react", "lang": lang, "client:component-hydration": "only", "client:component-path": "@/components/home/HomePage", "client:component-export": "default" }, { "fallback": ($$result3) => renderTemplate`${maybeRenderHead()}<div class="flex h-[calc(100vh-90px-90px)] items-center justify-center"> <!-- <div class="absolute inset-0 bg-black/40"></div> --> ${renderComponent($$result3, "Smoke", Smoke, { "width": 100, "height": 100, "class": "animate-pulse" })} </div>` })} ` })}`;
}, "/Users/tsekushi/dev/ubean/src/pages/index.astro", void 0);

const $$file = "/Users/tsekushi/dev/ubean/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
