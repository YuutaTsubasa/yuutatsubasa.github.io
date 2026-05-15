<script>
  import { onMount, onDestroy } from 'svelte';
  import { NAV } from '$lib/data/nav.js';
  import { activeSection, setActiveFromScroll } from '$lib/stores/active.js';

  import Hero from '$lib/components/sections/Hero.svelte';
  import About from '$lib/components/sections/About.svelte';
  import Schedule from '$lib/components/sections/Schedule.svelte';
  import Videos from '$lib/components/sections/Videos.svelte';
  import Avatars from '$lib/components/sections/Avatars.svelte';
  import Gallery from '$lib/components/sections/Gallery.svelte';
  import Connect from '$lib/components/sections/Connect.svelte';
  import Seo from '$lib/components/Seo.svelte';

  const title = '悠太翼官方網站 | 首頁';
  const description = '程式系台灣 Vtuber，主要實況遊戲、程式、歌回、雜談類型的直播。';

  function onScroll() {
    const ids = NAV.map((n) => n.id);
    let cur = ids[0];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < 200) cur = id;
    }
    setActiveFromScroll(cur);
  }

  onMount(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', onScroll);
    }
  });
</script>

<Seo {title} {description} />

<main>
  <Hero />
  <About />
  <Schedule />
  <Videos />
  <Avatars />
  <Gallery />
  <Connect />
</main>

<style>
  main {
    padding-top: 88px;
  }
</style>
