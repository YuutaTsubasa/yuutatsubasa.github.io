<script>
  import ErrorMessage from '../../../components/ErrorMessage.svelte';
  import Tag from '../../../components/Tag.svelte';
  import { formatDate } from '$lib/utils/formatDate';

  export let data;
  $: post = data.post;

  let title = `悠太翼官方網站 | ${post.title}`;
  let description = post.excerpt;
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content="Vtuber, 悠太翼, 程式設計, 直播" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="article" />
    <meta property="og:url" content={`https://yuuta-tsubasa.studio/post/${post.filename}`} />
    <meta property="og:image" content={`https://yuuta-tsubasa.studio${post.thumbnail}`} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
</svelte:head>

<style>
  .post-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
    @apply shadow-lg bg-white/75 backdrop-blur-lg;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: bold;
    color: white;
  }

  .post-thumbnail {
    width: 100%;
    height: auto;
    border-radius: 10px;
    margin-bottom: 1.5rem;
  }

  .post-date {
    font-size: 0.9rem;
    color: #ddd;
    margin-bottom: 0.1rem;
  }

  .post-author {
    font-size: 0.9rem;
    color: #ddd;
    margin-bottom: 0.35rem;
  }

  .post-date i, .post-author i {
    margin-right: 0.5rem;
    color: #ddd;
  }

  .post-tags {
    display: flex;
    align-items: center;
    margin-bottom: 0.2rem;
  }

  .post-tags i {
    margin-right: 0.5rem;
    color: #ddd;
  }
  
  .post-tags span {
    background-color: #007bff;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    margin-right: 0.5rem;
    font-size: 0.75rem;
  }

  .post-header {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
    color: white;
    text-align: center;
  }

  
</style>

{#if post}
  <section class="fade-in-bg">
    <!-- 使用文章的 thumbnail 作為背景圖 -->
    <section class="post-header" style="background-image: url('{post.thumbnail}');">
      <div class="h-[20vh]"></div>
      <div class="max-w-full w-[800px] mx-auto flex-row bg-black/50 backdrop-blur-lg p-4 relative">
        <div class="w-full h-[20px] backdrop-blur-lg absolute top-[-20px] left-0 bg-repeat-x scroll-bg"
            style="background-image: url('/images/title_background.webp');">
        </div>
        <div class="flex justify-start items-end">
          <h1 class="text-2xl font-bold text-left leading-tight">{post.title}</h1>
        </div>
        <div class="flex justify-start items-end">
          <p class="post-date"><i class="fas fa-calendar-alt"></i> 發佈日期：{formatDate(post.date)}</p>
        </div>
        <div class="flex justify-start items-end">
          <p class="post-author"><i class="fas fa-user"></i> 作者：{post.author}</p>
        </div>
        <!-- 顯示標籤 -->
        {#if post.tags && post.tags.length > 0}
          <div class="post-tags">
            <i class="fas fa-tags"></i>
            {#each post.tags as tag}
              <Tag isAll={false} {tag} selectedTag={null} />
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <article class="post-container">
      <!-- 顯示文章的縮圖 -->
      <div class="flex justify-center items-center">
        <img src={post.thumbnail} alt="{post.title} thumbnail" class="post-thumbnail" />
      </div>

      <!-- 渲染文章內容，使用 {@html} 來顯示已轉換的 HTML -->
      <div class="post-content">{@html post.content}</div>

      <hr class="my-8"/>

      <div id="disqus_thread"></div>
      <script>
        (function() {
          var d = document, s = d.createElement('script');
          s.src = 'https://yuutatsubasawebsite.disqus.com/embed.js';
          s.setAttribute('data-timestamp', +new Date());
          (d.head || d.body).appendChild(s);
        })();
      </script>
    </article>
  </section>
{:else}
  <!-- 錯誤狀態使用 ErrorMessage 組件 -->
  <ErrorMessage message="未找到文章" />
{/if}
