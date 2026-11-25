<script>
  import { onMount, onDestroy } from 'svelte';
  import { NAV } from '$lib/data/nav.js';
  import { activeSection, setActiveFromScroll } from '$lib/stores/active.js';
  import { page } from '$app/stores';
  import { afterNavigate, pushState, replaceState } from '$app/navigation';

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

  // 陪伴模式：00 START 點一下進入；網址加上 #play，瀏覽器的「上一頁」就能離開。
  // 用 SvelteKit 的 shallow routing（pushState／replaceState）記錄，開不開由 $page.state 決定，
  // 這樣路由器才追蹤得到這筆紀錄（換頁再按上一頁也會正確回到首頁）。
  const PLAY_HASH = '#play';
  let Companion = null;
  let companionError = false; // 陪伴模式的程式載不到
  let mounted = false;
  let importing = false;

  $: wanted = mounted && !!$page.state.companion;
  $: if (wanted && !Companion) loadCompanion();
  $: companionOpen = wanted && !!Companion;
  $: if (mounted) document.documentElement.style.overflow = companionOpen ? 'hidden' : '';

  async function loadCompanion() {
    if (importing) return;
    importing = true;
    companionError = false;
    try {
      Companion = (await import('$lib/components/companion/Companion.svelte')).default;
    } catch (e) {
      // 網路中斷，或網站更新後舊頁面要的檔案已經不在：離開 #play，請訪客重新整理
      console.error(e);
      companionError = true;
      leaveCompanion();
    } finally {
      importing = false;
    }
  }
  function enterCompanion() {
    // 上一頁還沒完成時（state 仍是 companion）再點，不要重複推紀錄
    if ($page.state.companion) return;
    pushState(PLAY_HASH, { companion: true, pushed: true });
  }
  function leaveCompanion() {
    if (!$page.state.companion) return;
    // 自己推進去的紀錄用上一頁離開；直接開 /#play 的訪客用上一頁會離開網站，改成只拿掉 #play
    if ($page.state.pushed) history.back();
    else replaceState(location.pathname + location.search, {});
  }

  onMount(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    mounted = true;
  });

  // 直接開 /#play：等路由器完成這次導覽才設定狀態（在 onMount 設定會被初始導覽蓋掉）
  afterNavigate(() => {
    if (location.hash === PLAY_HASH && !$page.state.companion) {
      replaceState(PLAY_HASH, { companion: true, pushed: false });
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', onScroll);
      document.documentElement.style.overflow = '';
    }
  });
</script>

<Seo {title} {description} {jsonLd} />

<main id="main">
  <Start error={companionError} on:enter={enterCompanion} />
  <About />
  <Schedule />
  <Videos />
  <Avatars />
  <Gallery />
  <Log />
  <Connect />
</main>

{#if companionOpen && Companion}
  <svelte:component this={Companion} on:close={leaveCompanion} />
{/if}

<style>
  main {
    padding-top: 88px;
  }
</style>
