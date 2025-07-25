import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_CQvYCsb-.mjs';
import { manifest } from './manifest_C4n9Iz_9.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/about-us.astro.mjs');
const _page3 = () => import('./pages/admin/_---params_.astro.mjs');
const _page4 = () => import('./pages/contact.astro.mjs');
const _page5 = () => import('./pages/menu/coffee.astro.mjs');
const _page6 = () => import('./pages/menu/grub.astro.mjs');
const _page7 = () => import('./pages/menu/non-coffee.astro.mjs');
const _page8 = () => import('./pages/menu/specialty.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.10.1_@types+node@24.0.4_jiti@2.4.2_lightningcss@1.30.1_rollup@4.44.1_typescript@5.8.3_yaml@2.8.0/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/about-us.astro", _page2],
    ["node_modules/.pnpm/@sanity+astro@3.2.6_@emotion+is-prop-valid@1.2.2_@sanity+client@7.6.0_@sanity+types@3.99.0_@t_uv5s3owjvdrcqhfkjrdsw2vtja/node_modules/@sanity/astro/dist/studio/studio-route.astro", _page3],
    ["src/pages/contact.astro", _page4],
    ["src/pages/menu/coffee.astro", _page5],
    ["src/pages/menu/grub.astro", _page6],
    ["src/pages/menu/non-coffee.astro", _page7],
    ["src/pages/menu/specialty.astro", _page8],
    ["src/pages/index.astro", _page9]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "af9c0709-ae09-451d-aebb-c3c55e42ec6a",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
