import { c as create_ssr_component, e as escape, d as add_attribute, f as each, v as validate_component } from "./ssr.js";
import { f as formatDate, T as Tag_1 } from "./Tag.js";
const PostCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { post } = $$props;
  let { selectedTag } = $$props;
  if ($$props.post === void 0 && $$bindings.post && post !== void 0) $$bindings.post(post);
  if ($$props.selectedTag === void 0 && $$bindings.selectedTag && selectedTag !== void 0) $$bindings.selectedTag(selectedTag);
  return `<a href="${"/post/" + escape(post.filename, true)}" class="hover:scale-105 transition-transform duration-300"><div class="border rounded-lg p-6 shadow-lg bg-white/75 backdrop-blur-lg"><img${add_attribute("src", post.thumbnail, 0)}${add_attribute("alt", post.title, 0)} class="w-full h-48 object-cover mb-4"> <h3 class="text-2xl font-bold mb-2">${escape(post.title)}</h3> <p class="text-gray-700"><i class="fas fa-calendar-alt mr-1"></i>  發佈日期：${escape(formatDate(post.date))}</p> <p class="text-gray-700 mb-4"><i class="fas fa-user mr-1"></i> 作者：${escape(post.author)}</p>  <p class="text-black mb-4">${escape(post.excerpt)}</p> <div class="flex flex-wrap mb-4">${each(post.tags, (tag) => {
    return `${validate_component(Tag_1, "Tag").$$render($$result, { isAll: false, tag, selectedTag }, {}, {})}`;
  })}</div></div></a>`;
});
export {
  PostCard as P
};
