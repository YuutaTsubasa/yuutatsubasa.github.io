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
  let title = "悠太翼官方網站 | 文章";
  let description = "程式系台灣 Vtuber，主要實況遊戲、程式、歌回、雜談類型的直播。";

  selectedTag = tag || null;
  currentPage = (page ? parseInt(page) : 1) ?? 1;
</script>

<svelte:head>
    <title>{`${title} | ${selectedTag ? `標籤篩選：${selectedTag}` : '內容總覽'}`}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content="Vtuber, 悠太翼, 程式設計, 直播" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="article" />
    <meta property="og:url" content={`https://yuuta-tsubasa.studio/posts/${selectedTag ? `tag/${encodeURIComponent(selectedTag)}/` : ""}${currentPage}`} />
    <meta property="og:image" content={`https://yuuta-tsubasa.studio/images/logo.webp`} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
</svelte:head>

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
