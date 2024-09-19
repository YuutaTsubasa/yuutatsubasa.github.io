import { c as create_ssr_component, d as each, v as validate_component, f as add_attribute, e as escape } from "./ssr.js";
import { t as tagColors } from "./settings.js";
function formatDate(date) {
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
}
const css = {
  code: ".tag.svelte-jinnql{padding:0.25rem 0.5rem;border-radius:0.25rem;font-size:0.875rem;margin-right:0.5rem;cursor:pointer;font-weight:bold;letter-spacing:0.05rem;color:white}.isSelected.svelte-jinnql{background-color:#facc15;color:black}",
  map: `{"version":3,"file":"Tag.svelte","sources":["Tag.svelte"],"sourcesContent":["<script>\\n    import Tag from './Tag.svelte';\\n    import { tagColors } from '$lib/settings';\\n\\n    export let isAll = false;\\n    export let tag;\\n    export let selectedTag;\\n  \\n    function getTagColor(tag) {\\n      return (tagColors[tag] || \\"bg-gray-500\\") + \\" hover:bg-gray-700\\";\\n    }\\n\\n    function getSelectedTagColor(tag) {\\n        return \\"isSelected\\";\\n    }\\n\\n    function isSeletedTag(tag) {\\n        return selectedTag === tag;\\n    }\\n<\/script>\\n  \\n<style>\\n    .tag {\\n      padding: 0.25rem 0.5rem;\\n      border-radius: 0.25rem;\\n      font-size: 0.875rem;\\n      margin-right: 0.5rem;\\n      cursor: pointer;\\n      font-weight: bold;\\n      letter-spacing: 0.05rem;\\n      color: white; /* 默認文字為白色 */\\n    }\\n\\n    .isSelected {\\n        background-color: #facc15;\\n        color: black;\\n    }\\n</style>\\n  \\n{#if isAll}\\n    {#each Object.keys(tagColors) as tag}\\n        <Tag isAll={false} {tag} {selectedTag} />\\n    {/each}\\n{:else}\\n    <a data-sveltekit-reload href = {isSeletedTag(tag) ? '/posts/1' : \`/posts/tag/\${encodeURIComponent(tag)}/1\`}\\n    class = \\"tag {isSeletedTag(tag) ? getSelectedTagColor(tag) : getTagColor(tag)}\\">\\n    {tag}\\n    </a>\\n{/if}\\n"],"names":[],"mappings":"AAsBI,kBAAK,CACH,OAAO,CAAE,OAAO,CAAC,MAAM,CACvB,aAAa,CAAE,OAAO,CACtB,SAAS,CAAE,QAAQ,CACnB,YAAY,CAAE,MAAM,CACpB,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,IAAI,CACjB,cAAc,CAAE,OAAO,CACvB,KAAK,CAAE,KACT,CAEA,yBAAY,CACR,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,KACX"}`
};
function getSelectedTagColor(tag) {
  return "isSelected";
}
const Tag_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isAll = false } = $$props;
  let { tag } = $$props;
  let { selectedTag } = $$props;
  function getTagColor(tag2) {
    return (tagColors[tag2] || "bg-gray-500") + " hover:bg-gray-700";
  }
  function isSeletedTag(tag2) {
    return selectedTag === tag2;
  }
  if ($$props.isAll === void 0 && $$bindings.isAll && isAll !== void 0) $$bindings.isAll(isAll);
  if ($$props.tag === void 0 && $$bindings.tag && tag !== void 0) $$bindings.tag(tag);
  if ($$props.selectedTag === void 0 && $$bindings.selectedTag && selectedTag !== void 0) $$bindings.selectedTag(selectedTag);
  $$result.css.add(css);
  return `${isAll ? `${each(Object.keys(tagColors), (tag2) => {
    return `${validate_component(Tag_1, "Tag").$$render($$result, { isAll: false, tag: tag2, selectedTag }, {}, {})}`;
  })}` : `<a data-sveltekit-reload${add_attribute(
    "href",
    isSeletedTag(tag) ? "/posts/1" : `/posts/tag/${encodeURIComponent(tag)}/1`,
    0
  )} class="${"tag " + escape(
    isSeletedTag(tag) ? getSelectedTagColor() : getTagColor(tag),
    true
  ) + " svelte-jinnql"}">${escape(tag)}</a>`}`;
});
export {
  Tag_1 as T,
  formatDate as f
};
