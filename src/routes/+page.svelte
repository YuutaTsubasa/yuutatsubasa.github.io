<script>
  import { onMount, onDestroy } from 'svelte';
  import { NAV } from '$lib/data/nav.js';
  import { activeSection, setActiveFromScroll } from '$lib/stores/active.js';

  import Start from '$lib/components/sections/Start.svelte';
  import About from '$lib/components/sections/About.svelte';
  import Schedule from '$lib/components/sections/Schedule.svelte';
  import Videos from '$lib/components/sections/Videos.svelte';
  import Avatars from '$lib/components/sections/Avatars.svelte';
  import Gallery from '$lib/components/sections/Gallery.svelte';
  import Log from '$lib/components/sections/Log.svelte';
  import Connect from '$lib/components/sections/Connect.svelte';
  import Seo from '$lib/components/Seo.svelte';

  const title = '悠太翼官方網站 | 首頁';
  const description = '程式系台灣 Vtuber，主要實況遊戲、程式、歌回、雜談類型的直播。';

  const SITE_URL = 'https://yuuta-tsubasa.studio';
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: '悠太翼',
      alternateName: 'YUUTA TSUBASA',
      url: SITE_URL,
      image: `${SITE_URL}/images/yuuta-figure-1-1920.webp`,
      jobTitle: 'VTuber',
      description,
      nationality: 'Taiwanese',
      worksFor: {
        '@type': 'Organization',
        name: 'ULTIMATE-UTOPIA',
        alternateName: '終焉理想庭'
      },
      sameAs: [
        'https://yutaii.run/twitter',
        'https://yutaii.run/youtube',
        'https://yutaii.run/twitch'
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '悠太翼 YUUTA TSUBASA',
      url: SITE_URL,
      inLanguage: 'zh-Hant-TW'
    }
  ];

  function onScroll() {
    const ids = NAV.map((n) => n.id);
    let cur = ids[0];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < 200) cur = id;
    }
    setActiveFromScroll(cur);
  }

  // 陪伴模式：00 START 點一下進入；網址加上 #play，瀏覽器的「上一頁」就能離開
  const PLAY_HASH = '#play';
  let Companion = null;
  let companionOpen = false;

  async function openCompanion(push = true) {
    if (companionOpen) return;
    if (push && location.hash !== PLAY_HASH) history.pushState({ companion: true }, '', PLAY_HASH);
    Companion ??= (await import('$lib/components/companion/Companion.svelte')).default;
    // 第一次載入元件的途中按了上一頁，就不要打開
    if (location.hash !== PLAY_HASH) return;
    companionOpen = true;
    document.documentElement.style.overflow = 'hidden';
  }
  function closeCompanion() {
    if (!companionOpen) return;
    companionOpen = false;
    document.documentElement.style.overflow = '';
    if (location.hash !== PLAY_HASH) return;
    // 我們推進去的 #play 紀錄帶有 companion 標記（上一頁再下一頁回來也還在），用上一頁離開；
    // 直接開 /#play 的訪客沒有這個標記，用 history.back() 會離開網站，改成只拿掉 #play
    if (history.state?.companion) history.back();
    else history.replaceState(history.state, '', location.pathname + location.search);
  }
  function onPopState() {
    if (location.hash === PLAY_HASH) openCompanion(false);
    else if (companionOpen) {
      companionOpen = false;
      document.documentElement.style.overflow = '';
    }
  }

  onMount(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('popstate', onPopState);
    onScroll();
    if (location.hash === PLAY_HASH) openCompanion(false);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPopState);
      document.documentElement.style.overflow = '';
    }
  });
</script>

<Seo {title} {description} {jsonLd} />

<main id="main">
  <Start on:enter={() => openCompanion()} />
  <About />
  <Schedule />
  <Videos />
  <Avatars />
  <Gallery />
  <Log />
  <Connect />
</main>

{#if companionOpen && Companion}
  <svelte:component this={Companion} on:close={closeCompanion} />
{/if}

<style>
  main {
    padding-top: 88px;
  }
</style>
