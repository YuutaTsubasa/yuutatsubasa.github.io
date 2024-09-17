<script>
  import { wrap } from "svelte-spa-router/wrap";
  import Router, { link } from "svelte-spa-router";
  import Home from "./routes/Home.svelte";
  import About from "./routes/About.svelte";
  import Posts from "./routes/Posts.svelte";
  import Post from "./routes/Post.svelte";

  const routes = {
    "/": Home,
    "/about": About,
    "/posts": Posts,
    "/posts/:filename": Post,
    "*": Home,
  };
</script>

<!-- 導覽列 -->
<nav class="fixed left-0 w-full backdrop-blur-lg bg-black/30 text-white z-30">
  <div class="h-[20px] w-full bg-repeat-x scroll-bg opacity-50" style="background-image: url('/images/title_background.webp');"></div>

  <div class="max-w-7xl mx-auto p-4 flex justify-between items-center">
    <!-- 替換成 Logo -->
    <a href="/">
      <img src="/images/logo.webp" alt="My Blog Logo" class="h-10 sm:h-12">
    </a>
    <ul class="flex space-x-2 sm:space-x-4">
      <li><a href="/" use:link>Home</a></li>
      <li><a href="/about" use:link>About</a></li>
      <li><a href="/posts" use:link>Posts</a></li>
      <li><a href="https://yutaii.run/twitter" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-x-twitter fa-lg"></i>
      </a></li>
      <li><a href="https://yutaii.run/youtube" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-youtube fa-lg"></i>
      </a></li>
    </ul>
  </div>
  </nav>

<!-- 路由器 -->
<Router {routes} />

<footer class="bg-gray-900 text-white py-6">
  <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
    <!-- 左側：版權聲明 -->
    <div class="text-center md:text-left mb-4 md:mb-0">
      <p>© 2024 悠太翼. All rights reserved.</p>
    </div>

    <!-- 中間和右側：導航連結與社交媒體合併 -->
    <div class="flex space-x-4">
      <a href="/" class="hover:underline" use:link>Home</a>
      <a href="/about" class="hover:underline" use:link>About</a>
      <a href="/posts" class="hover:underline" use:link>Posts</a>
      <a href="https://yutaii.run/twitter" target="_blank" class="hover:text-blue-500">
        <i class="fab fa-x-twitter fa-lg"></i>
      </a>
      <a href="https://yutaii.run/youtube" target="_blank" class="hover:text-red-500">
        <i class="fab fa-youtube fa-lg"></i>
      </a>
    </div>
  </div>
</footer>