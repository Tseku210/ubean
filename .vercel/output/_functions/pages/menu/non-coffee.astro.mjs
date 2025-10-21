import '../../chunks/page-ssr_BwWVwiW0.mjs';
import { c as createComponent, r as renderComponent, b as renderTemplate } from '../../chunks/astro/server_Dnj5Tjv1.mjs';
import { C as Category, $ as $$MenuLayout } from '../../chunks/MenuLayout_81YkdgH0.mjs';
export { renderers } from '../../renderers.mjs';

const $$NonCoffee = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MenuLayout", $$MenuLayout, { "category": Category.nonCoffee })}`;
}, "/Users/tsekushi/dev/ubean/src/pages/menu/non-coffee.astro", void 0);

const $$file = "/Users/tsekushi/dev/ubean/src/pages/menu/non-coffee.astro";
const $$url = "/menu/non-coffee";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$NonCoffee,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
