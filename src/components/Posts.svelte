<script>
  import PostCard from './PostCard.svelte';
  import Tag from './Tag.svelte';

  export let tag;
  export let page;
  export let posts;
  export let totalPages;
  
  let selectedTag = null;
  let currentPage = 1;
  $: isFirstPage = currentPage <= 1;
  $: isLastPage = currentPage >= totalPages;

  selectedTag = tag || null;
  currentPage = (page ? parseInt(page) : 1) ?? 1;
</script>

<section class="pb-12 fade-in-bg">
  <section class="relative bg-cover bg-center bg-no-repeat h-96 w-screen flex items-center justify-center mb-12"
    style="background-image: url('/images/background.webp');">
    <div class="flex flex-col items-center justify-center">
      <h2 class="flex-1 text-6xl font-bold text-white">
        {selectedTag ? `標籤篩選：${selectedTag}` : '內容總覽'}
      </h2>
    </div>
  </section>

  <div class="max-w-7xl mx-auto">
    <div class="flex flex-wrap mb-6 px-4 gap-2">
      <Tag isAll={true} tag={null} {selectedTag} />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {#each posts as post}
        <PostCard {post} {selectedTag} />
      {/each}
    </div>

    <!-- 分頁導航 -->
    <div class="flex justify-center gap-16 mt-6">
      {#if isFirstPage}
        <p class="text-gray-400">上一頁</p>
      {:else}
      <a data-sveltekit-reload href={`/posts/${ selectedTag ? `tag/${encodeURIComponent(selectedTag)}` : ""}${currentPage - 1}` } class="text-blue-500 font-bold">上一頁</a>
      {/if}
      <p class="font-bold">第 {currentPage} 頁 / 共 {totalPages} 頁</p>
      {#if isLastPage}
        <p class="text-gray-400">下一頁</p>
      {:else}
        <a data-sveltekit-reload href={`/posts/${ selectedTag ? `tag/${encodeURIComponent(selectedTag)}/` : ""}${currentPage + 1}` } class="text-blue-500 font-bold">下一頁</a>
      {/if}
    </div>
  </div>
</section>
