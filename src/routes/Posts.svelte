<script>
  import { onMount } from 'svelte';
  import { push, querystring } from 'svelte-spa-router';
  import ErrorMessage from '../components/ErrorMessage.svelte';
  import PostCard from '../components/PostCard.svelte';
  import Tag from '../components/Tag.svelte';
  import { loadPosts } from '../utils/loadPosts';

  $: queryParams = new URLSearchParams($querystring);

  let posts = [];
  let filteredPosts = [];
  let allTags = [];
  let loading = true;
  let selectedTag = null;
  let currentPage = 1;
  let totalPages = 1;
  $: isFirstPage = currentPage <= 1;
  $: isLastPage = currentPage >= totalPages;
  const postsPerPage = 12;

  onMount(async () => {
    window.scrollTo(0, 0);

    posts = await loadPosts();
    allTags = posts.flatMap(post => post.tags);

    selectedTag = queryParams.get('tag') || null;
    console.log(selectedTag);
    currentPage = (queryParams.has('page') ? parseInt(queryParams.get('page')) : 1) ?? 1;

    // 過濾文章並設置分頁
    updateFilteredPosts();

    loading = false; // 加載完成
  });
  
  function updateFilteredPosts() {
    const filtered = selectedTag ? posts.filter(post => post.tags.includes(selectedTag)) : posts;
    totalPages = Math.ceil(filtered.length / postsPerPage);
    
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    filteredPosts = filtered.slice(start, end);
  }

  // 接收 Tag.svelte 發送的篩選事件
  function handleTagFilter(event) {
    selectedTag = event.detail.tag;
    currentPage = 1; // 每次篩選時回到第 1 頁
    push(`/posts?tag=${encodeURIComponent(selectedTag)}`);
    updateFilteredPosts();
  }

  // 接收 Tag.svelte 發送的清除篩選事件
  function handleTagClear() {
    selectedTag = null;
    currentPage = 1; // 清除篩選時回到第 1 頁
    push('/posts');  // 清除 URL 中的篩選參數
    updateFilteredPosts();
  }

  // 改變頁碼並更新 URL
  function changePage(newPage) {
    currentPage = newPage;
    push(`/posts?page=${newPage}${selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ''}`); // 更新 URL
    updateFilteredPosts();
  }
</script>

{#if loading}
  <!-- 使用 ErrorMessage 組件來顯示載入中狀態 -->
  <ErrorMessage message="載入中..." />
{:else if posts.length === 0}
  <!-- 使用 ErrorMessage 組件來顯示沒有文章的狀態 -->
  <ErrorMessage message="暫無內容" />
{:else}
  <section class="pb-12 fade-in-bg">
    <section class="relative bg-cover bg-center bg-no-repeat h-96 w-screen flex items-center justify-center mb-12"
      style="background-image: url('/images/background.webp');">
      <div class="flex flex-col items-center justify-center">
        <h2 class="flex-1 text-6xl font-bold text-white">
          {selectedTag ? `標籤篩選：${selectedTag}` : '內容總覽'}
        </h2>
      </div>
      <div class="absolute bottom-0 sm:flex flex-wrap mb-6 hidden px-4 gap-2">
        <Tag isAll={true} tag={null} {selectedTag} on:filter={handleTagFilter} on:clear={handleTagClear} />
      </div>
    </section>

    <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {#each filteredPosts as post}
            <PostCard {post} {selectedTag} {handleTagFilter} {handleTagClear} />
          {/each}
        </div>

        <!-- 分頁導航 -->
        <div class="flex justify-center gap-16 mt-6">
          <button on:click={() => changePage(currentPage - 1)} disabled={isFirstPage} class={isFirstPage ? 'text-gray-400' : 'text-blue-500 font-bold'}>上一頁</button>
          <p class="font-bold">第 {currentPage} 頁 / 共 {totalPages} 頁</p>
          <button on:click={() => changePage(currentPage + 1)} disabled={isLastPage} class={isLastPage ? 'text-gray-400' : 'text-blue-500 font-bold'}>下一頁</button>
        </div>
    </div>
  </section>
{/if}
