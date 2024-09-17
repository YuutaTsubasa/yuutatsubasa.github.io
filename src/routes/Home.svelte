
<script>
  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { loadPosts } from '../utils/loadPosts';
  import ErrorMessage from '../components/ErrorMessage.svelte';
  import PostCard from '../components/PostCard.svelte';

  let latestPosts = [];
  let loading = true;

  onMount(async () => {
    window.scrollTo(0, 0);

    const allPosts = await loadPosts();
    latestPosts = allPosts.slice(0, 3);
    loading = false;
  });
</script>

<style>
    .slide-to-right {
      transform: translateX(-100%);
      opacity: 0;
      animation: slideToRight 1s forwards;
    }
  
    @keyframes slideToRight {
      0% {
        transform: translateX(-100%);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }
</style>

{#if loading}
  <ErrorMessage message="載入中..." />
{:else}

  <!-- 首頁滿版區 -->
  <section class="h-screen w-screen relative flex items-center justify-between bg-cover bg-center fade-in-bg overflow-x-hidden" style="background-image: url('/images/background.webp')">
    <div class="relative max-w-7xl mx-auto flex justify-between w-full h-full items-center md:pl-12">
      <div class="absolute md:relative mt-48 md:m-0 text-white max-w-lg relative z-20 bg-black/30 backdrop-blur-lg p-4">
        <h2 class="text-6xl font-bold border-l-8 border-blue-500 pl-4 pb-2">悠太翼</h2>
        <p class="mt-4 text-xl font-bold">程式系台灣 Vtuber，主要實況遊戲、程式、歌回、雜談類型的直播。<a href="/about" class="text-blue-500" use:link>了解更多</a></p>
      </div>

      <div class="absolute md:relative z-10 w-full md:w-3/4 h-full flex items-end pr-12">
        <img src="/images/character.webp" alt="Character" class="overflow-visible object-cover slide-to-right" style="height: calc(100vh - 4rem);">
      </div>
    </div>
  </section>
    
  <section class="bg-white py-12">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-4xl font-bold text-center mb-6">最新文章</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {#each latestPosts as post}
          <PostCard {post} selectedTag={null} handleTagFilter={() => {}} handleTagClear={() => {}} />
        {/each}
      </div>
      <div class="text-center mt-8">
        <a href="/posts" class="text-blue-500" use:link>查看全部文章</a>
      </div>
    </div>
  </section>
    
  <section class="bg-blue-500 text-white py-12">
    <div class="max-w-7xl mx-auto text-center">
      <h2 class="text-4xl font-bold mb-4">訂閱我的頻道</h2>
      <p class="text-xl mb-6">獲取最新的實況通知吧！</p>
      <div class="flex justify-center mb-12 gap-4">
        <a href="https://www.youtube.com/@YuutaTsubasa?sub_confirmation=1" target="_blank" 
          class="bg-white text-blue-500 px-6 py-3 font-bold rounded-lg shadow-lg hover:bg-blue-500 hover:text-white transition-colors duration-300">
          訂閱 YouTube 頻道
        </a>
        <a href="https://www.youtube.com/channel/UCTxs9vSVMBqAGQw-RiZR7UQ/join" target="_blank" 
          class="bg-white text-blue-500 px-6 py-3 font-bold rounded-lg shadow-lg hover:bg-blue-500 hover:text-white transition-colors duration-300">
          加入 YouTube會員
        </a>
      </div>
    </div>
  </section>
    
  <section class="bg-gray-800 text-white py-12">
    <div class="max-w-7xl mx-auto text-center">
      <h2 class="text-4xl font-bold mb-4">正在舉行的活動</h2>
      <p class="text-xl mb-1">Yuuta Tsubasa's Creative Game Challenge #1 - BBQ</p>
      <p class="text-l mb-4 text-gray-400">2024/09/01 ~ 2024/10/31</p>
      <div class="flex justify-center mb-12">
        <img src="/images/activities/1st-game-jam.webp" alt="Yuuta Tsubasa's Creative Game Challenge #1 - BBQ">
      </div>
      <a href="https://itch.io/jam/yuuta-tsubasa-creative-game-challenge-1" target="_blank" class="bg-blue-500 text-white px-6 py-3 font-bold rounded-lg shadow-lg hover:bg-white transition-colors duration-300 hover:text-blue-500">查看詳情</a>
    </div>
  </section>
{/if}
