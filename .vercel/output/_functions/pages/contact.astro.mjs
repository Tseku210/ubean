import '../chunks/page-ssr_BwWVwiW0.mjs';
import { c as createComponent, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_Dnj5Tjv1.mjs';
import { $ as $$ContactPage } from '../chunks/ContactPage_B62ZLgxK.mjs';
export { renderers } from '../renderers.mjs';

const $$Contact = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "ContactPage", $$ContactPage, {})}`;
}, "/Users/tsekushi/dev/ubean/src/pages/contact.astro", void 0);

const $$file = "/Users/tsekushi/dev/ubean/src/pages/contact.astro";
const $$url = "/contact";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Contact,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
