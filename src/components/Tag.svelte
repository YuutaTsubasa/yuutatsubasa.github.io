<script>
    import Tag from './Tag.svelte';
    import { tagColors } from '$lib/settings';

    export let isAll = false;
    export let tag;
    export let selectedTag;
  
    function getTagColor(tag) {
      return (tagColors[tag] || "bg-gray-500") + " hover:bg-gray-700";
    }

    function getSelectedTagColor(tag) {
        return "isSelected";
    }

    function isSeletedTag(tag) {
        return selectedTag === tag;
    }
</script>
  
<style>
    .tag {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      margin-right: 0.5rem;
      cursor: pointer;
      font-weight: bold;
      letter-spacing: 0.05rem;
      color: white; /* 默認文字為白色 */
    }

    .isSelected {
        background-color: #facc15;
        color: black;
    }
</style>
  
{#if isAll}
    {#each Object.keys(tagColors) as tag}
        <Tag isAll={false} {tag} {selectedTag} />
    {/each}
{:else}
    <a data-sveltekit-reload href = {isSeletedTag(tag) ? '/posts/1' : `/posts/tag/${encodeURIComponent(tag)}/1`}
    class = "tag {isSeletedTag(tag) ? getSelectedTagColor(tag) : getTagColor(tag)}">
    {tag}
    </a>
{/if}
