<script>
  import '$lib/styles/global.css';
  import { page } from '$app/stores';
  import Ticker from '$lib/components/chrome/Ticker.svelte';
  import Nav from '$lib/components/chrome/Nav.svelte';
  import LeftRail from '$lib/components/chrome/LeftRail.svelte';
  import RightRail from '$lib/components/chrome/RightRail.svelte';
  import Cursor from '$lib/components/atoms/Cursor.svelte';

  // 新版設計的頁面：首頁、/archive 等。/posts 舊頁面仍走舊 nav。
  $: isLegacy = $page.url.pathname.startsWith('/posts');
  $: isHome = $page.url.pathname === '/';
  // Gallery 詳細頁是 lightbox 全暗版型，要把主 chrome 全部關掉，由頁面內建迷你 bar
  $: isLightbox = /^\/gallery\/[^/]+$/.test($page.url.pathname);
</script>

<style>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

<a class="skip-link" href="#main">SKIP TO CONTENT</a>

{#if !isLegacy && !isLightbox}
  {#if isHome}
    <Cursor />
  {/if}
  <Ticker />
  <Nav />
  {#if isHome}
    <LeftRail />
    <RightRail />
  {/if}
{:else if isLegacy}
  <!-- 過渡期：/posts 等舊頁面保留原本的 nav -->
  <nav class="fixed left-0 w-full backdrop-blur-lg bg-black/30 text-white z-30">
    <div class="h-[20px] w-full bg-repeat-x scroll-bg opacity-50" style="background-image: url('/images/title_background.webp');"></div>

    <div class="max-w-7xl mx-auto p-4 flex justify-between items-center">
      <a href="/">
        <img src="/images/logo.webp" alt="悠太翼 YUUTA TSUBASA" class="h-10 sm:h-12">
      </a>
      <ul class="flex space-x-2 sm:space-x-4">
        <li><a href="/">Home</a></li>
        <li><a href="/posts/1">Posts</a></li>
        <li><a href="https://yutaii.run/twitter" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-x-twitter fa-lg"></i>
        </a></li>
        <li><a href="https://yutaii.run/youtube" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-youtube fa-lg"></i>
        </a></li>
        <li><a href="/rss.xml" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-rss fa-lg"></i>
        </a></li>
      </ul>
    </div>
  </nav>
{/if}

<slot />

{#if isLegacy}
  <footer class="bg-gray-900 text-white py-6">
    <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
      <div class="text-center md:text-left mb-4 md:mb-0">
        <p>© 2024 悠太翼. All rights reserved.</p>
      </div>
      <div class="flex space-x-4">
        <a href="/" class="hover:underline">Home</a>
        <a href="/posts" class="hover:underline">Posts</a>
        <a href="https://yutaii.run/twitter" target="_blank" class="hover:text-blue-500">
          <i class="fab fa-x-twitter fa-lg"></i>
        </a>
        <a href="https://yutaii.run/youtube" target="_blank" class="hover:text-red-500">
          <i class="fab fa-youtube fa-lg"></i>
        </a>
        <a href="/rss.xml" target="_blank" class="hover:text-yellow-500">
          <i class="fas fa-rss fa-lg"></i>
        </a>
      </div>
    </div>
  </footer>
{/if}
