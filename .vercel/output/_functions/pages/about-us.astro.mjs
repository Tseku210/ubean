import '../chunks/page-ssr_BwWVwiW0.mjs';
import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_Dnj5Tjv1.mjs';
import { $ as $$AboutUsPage } from '../chunks/AboutUsPage_BWI8lglJ.mjs';
export { renderers } from '../renderers.mjs';

const $$AboutUs = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AboutUsPage", $$AboutUsPage, {})}`;
}, "/Users/tsekushi/dev/ubean/src/pages/about-us.astro", void 0);

const $$file = "/Users/tsekushi/dev/ubean/src/pages/about-us.astro";
const $$url = "/about-us";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$AboutUs,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
