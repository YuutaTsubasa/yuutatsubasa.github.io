import { c as create_ssr_component, b as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as ErrorMessage } from "../../../chunks/Tag.svelte_svelte_type_style_lang.js";
import "marked";
import "js-yaml";
import { p as page } from "../../../chunks/stores.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  new URLSearchParams($page.url.search);
  $$unsubscribe_page();
  return `${` ${validate_component(ErrorMessage, "ErrorMessage").$$render($$result, { message: "載入中..." }, {}, {})}`}`;
});
export {
  Page as default
};
