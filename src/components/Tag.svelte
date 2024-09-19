<script>
    import { createEventDispatcher } from 'svelte';
    import Tag from './Tag.svelte';

    export let isAll = false;
    export let tag;
    export let selectedTag;
  
    const dispatch = createEventDispatcher();

    const tagColors = {
      "遊戲實況": "bg-red-500",
      "遊戲心得": "bg-red-500",
      "程式實況": "bg-orange-500",
      "程式教學": "bg-orange-500",
      "工具程式": "bg-orange-500",
      "遊戲作品": "bg-orange-500",
      "作曲實況": "bg-blue-500",
      "歌回實況": "bg-blue-500",
      "Cover": "bg-blue-500",
      "3D 實況": "bg-cyan-500",
      "3D 作品": "bg-cyan-500",
      "繪圖實況": "bg-pink-500",
      "繪圖作品": "bg-pink-500",
      "雜談實況": "bg-green-500",
      "小說短文": "bg-green-500",
      "活動合作": "bg-purple-500",
      "直播影片": "bg-purple-500",
      "翼友作品": "bg-gray-500"
    };
  
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
        <Tag isAll={false} {tag} {selectedTag} 
        on:filter={() => dispatch('filter', { tag })} 
        on:clear={() => dispatch('clear')}/>
    {/each}
{:else}
    <a href = {isSeletedTag(tag) ? '/posts' : `/posts?tag=${tag}`}
    class = "tag {isSeletedTag(tag) ? getSelectedTagColor(tag) : getTagColor(tag)}">
    {tag}
    </a>
{/if}
