import '../chunks/page-ssr_BwWVwiW0.mjs';
import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Dnj5Tjv1.mjs';
import { g as getLangFromUrl, u as useTranslations } from '../chunks/Footer_B4EnovnO.mjs';
import { $ as $$Layout } from '../chunks/Layout_DErERJ1q.mjs';
/* empty css                               */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$404 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$404;
  const lang = getLangFromUrl(Astro2.url);
  const t = useTranslations(lang);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "UBean - Page Not Found", "data-astro-cid-zetdm5md": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="mx-auto flex min-h-[calc(100vh-74px-122px)] max-w-4xl items-center justify-center" data-astro-cid-zetdm5md> <div class="flex flex-col items-center gap-8 text-center" data-astro-cid-zetdm5md> <div class="relative" data-astro-cid-zetdm5md> <div class="coffee-cup-container size-64 md:size-72" data-astro-cid-zetdm5md> <img src="/images/ubean-cup.webp" alt="Ubean Coffee Cup" class="coffee-cup size-full object-contain" data-astro-cid-zetdm5md> </div> </div> <h1 class="text-primary text-7xl font-bold" data-astro-cid-zetdm5md>404</h1> <h2 class="text-h3 text-secondary font-bold" data-astro-cid-zetdm5md>${t("error.404")}</h2> </div> </main> ` })} `;
}, "/Users/tsekushi/dev/ubean/src/pages/404.astro", void 0);

const $$file = "/Users/tsekushi/dev/ubean/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
