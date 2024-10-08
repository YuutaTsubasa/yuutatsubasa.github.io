import { c as create_ssr_component, e as escape, d as add_attribute, v as validate_component, f as each } from "./ssr.js";
import { P as PostCard } from "./PostCard.js";
import { T as Tag_1 } from "./Tag.js";
let title = "悠太翼官方網站 | 文章";
let description = "程式系台灣 Vtuber，主要實況遊戲、程式、歌回、雜談類型的直播。";
const Posts = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isFirstPage;
  let isLastPage;
  let { tag } = $$props;
  let { page } = $$props;
  let { posts } = $$props;
  let { totalPages } = $$props;
  let selectedTag = null;
  let currentPage = 1;
  selectedTag = tag || null;
  currentPage = (page ? parseInt(page) : 1) ?? 1;
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0) $$bindings.tag(tag);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0) $$bindings.page(page);
  if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0) $$bindings.posts(posts);
  if ($$props.totalPages === void 0 && $$bindings.totalPages && totalPages !== void 0) $$bindings.totalPages(totalPages);
  isFirstPage = currentPage <= 1;
  isLastPage = currentPage >= totalPages;
  return `${$$result.head += `<!-- HEAD_svelte-5ae32l_START -->${$$result.title = `<title>${escape(`${title} | ${selectedTag ? `標籤篩選：${selectedTag}` : "內容總覽"}`)} | 第 ${escape(currentPage)} 頁</title>`, ""}<meta name="description"${add_attribute("content", description, 0)}><meta name="keywords" content="Vtuber, 悠太翼, 程式設計, 直播"><meta property="og:title"${add_attribute("content", title, 0)}><meta property="og:description"${add_attribute("content", description, 0)}><meta property="og:type" content="article"><meta property="og:url"${add_attribute(
    "content",
    `https://yuuta-tsubasa.studio/posts/${selectedTag ? `tag/${encodeURIComponent(selectedTag)}/` : ""}${currentPage}`,
    0
  )}><meta property="og:image"${add_attribute("content", `https://yuuta-tsubasa.studio/images/logo.webp`, 0)}><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${add_attribute("content", title, 0)}><meta name="twitter:description"${add_attribute("content", description, 0)}><!-- HEAD_svelte-5ae32l_END -->`, ""} <section class="pb-12 fade-in-bg"><section class="relative bg-cover bg-center bg-no-repeat h-96 w-screen flex items-center justify-center mb-12" style="background-image: url('/images/background.webp');"><div class="flex flex-col items-center justify-center"><h2 class="flex-1 text-6xl font-bold text-white">${escape(selectedTag ? `標籤篩選：${selectedTag}` : "內容總覽")}</h2></div></section> <div class="max-w-7xl mx-auto"><div class="flex flex-wrap mb-6 px-4 gap-2">${validate_component(Tag_1, "Tag").$$render($$result, { isAll: true, tag: null, selectedTag }, {}, {})}</div> <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">${each(posts, (post) => {
    return `${validate_component(PostCard, "PostCard").$$render($$result, { post, selectedTag }, {}, {})}`;
  })}</div>  <div class="flex justify-center gap-16 mt-6">${isFirstPage ? `<p class="text-gray-400" data-svelte-h="svelte-19vgmjs">上一頁</p>` : `<a data-sveltekit-reload${add_attribute(
    "href",
    `/posts/${selectedTag ? `tag/${encodeURIComponent(selectedTag)}` : ""}${currentPage - 1}`,
    0
  )} class="text-blue-500 font-bold">上一頁</a>`} <p class="font-bold">第 ${escape(currentPage)} 頁 / 共 ${escape(totalPages)} 頁</p> ${isLastPage ? `<p class="text-gray-400" data-svelte-h="svelte-1fa0y9v">下一頁</p>` : `<a data-sveltekit-reload${add_attribute(
    "href",
    `/posts/${selectedTag ? `tag/${encodeURIComponent(selectedTag)}/` : ""}${currentPage + 1}`,
    0
  )} class="text-blue-500 font-bold">下一頁</a>`}</div></div></section>`;
});
export {
  Posts as P
};
