import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_KeCr8NmY.mjs';
import { manifest } from './manifest_Dsieyca4.mjs';

const serverIslandMap = new Map([
	['MenuList', () => import('./chunks/MenuList_CPUqPGVs.mjs')],
]);;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/about-us.astro.mjs');
const _page3 = () => import('./pages/admin/_---params_.astro.mjs');
const _page4 = () => import('./pages/contact.astro.mjs');
const _page5 = () => import('./pages/menu/coffee.astro.mjs');
const _page6 = () => import('./pages/menu/grub.astro.mjs');
const _page7 = () => import('./pages/menu/non-coffee.astro.mjs');
const _page8 = () => import('./pages/menu/specialty.astro.mjs');
const _page9 = () => import('./pages/mn/about-us.astro.mjs');
const _page10 = () => import('./pages/mn/contact.astro.mjs');
const _page11 = () => import('./pages/mn/menu/coffee.astro.mjs');
const _page12 = () => import('./pages/mn/menu/grub.astro.mjs');
const _page13 = () => import('./pages/mn/menu/non-coffee.astro.mjs');
const _page14 = () => import('./pages/mn/menu/specialty.astro.mjs');
const _page15 = () => import('./pages/mn.astro.mjs');
const _page16 = () => import('./pages/index.astro.mjs');
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
    ["src/pages/mn/about-us.astro", _page9],
    ["src/pages/mn/contact.astro", _page10],
    ["src/pages/mn/menu/coffee.astro", _page11],
    ["src/pages/mn/menu/grub.astro", _page12],
    ["src/pages/mn/menu/non-coffee.astro", _page13],
    ["src/pages/mn/menu/specialty.astro", _page14],
    ["src/pages/mn/index.astro", _page15],
    ["src/pages/index.astro", _page16]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "221bb3ea-39e1-4143-bbfc-963661d4d4e4",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
