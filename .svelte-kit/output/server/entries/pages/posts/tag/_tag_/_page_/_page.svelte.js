import { c as create_ssr_component, v as validate_component } from "../../../../../../chunks/ssr.js";
import { P as Posts } from "../../../../../../chunks/Posts.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  return `${validate_component(Posts, "Posts").$$render(
    $$result,
    {
      page: data.page,
      tag: data.tag,
      posts: data.posts,
      totalPages: data.totalPages
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
