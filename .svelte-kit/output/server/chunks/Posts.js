import { c as create_ssr_component, v as validate_component } from "./ssr.js";
import { E as ErrorMessage } from "./Tag.svelte_svelte_type_style_lang.js";
import "marked";
import "js-yaml";
const Posts = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { tag } = $$props;
  let { page } = $$props;
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0) $$bindings.tag(tag);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0) $$bindings.page(page);
  return `${` ${validate_component(ErrorMessage, "ErrorMessage").$$render($$result, { message: "載入中..." }, {}, {})}`}`;
});
export {
  Posts as P
};
