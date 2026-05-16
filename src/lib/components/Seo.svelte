<script>
  import { page } from '$app/stores';

  const SITE_URL = 'https://yuuta-tsubasa.studio';
  const SITE_NAME = '悠太翼 YUUTA TSUBASA';
  const SITE_TWITTER = '@yuutatsubasa';
  const DEFAULT_IMAGE = `${SITE_URL}/images/og-card.png`;
  const DEFAULT_DESCRIPTION = '程式系台灣 Vtuber，主要實況遊戲、程式、歌回、雜談類型的直播。';

  export let title;
  export let description = DEFAULT_DESCRIPTION;
  export let image = DEFAULT_IMAGE;
  export let imageAlt = '悠太翼 YUUTA TSUBASA · Taiwan VTuber';
  export let imageWidth = 1200;
  export let imageHeight = 630;
  export let type = 'website';
  /** schema.org JSON-LD: 單一物件或陣列 */
  export let jsonLd = null;

  $: fullUrl = `${SITE_URL}${$page.url.pathname}`;
  $: fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  $: jsonLdItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={fullUrl} />

  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:locale" content="zh_TW" />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={fullUrl} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={fullImage} />
  <meta property="og:image:width" content={String(imageWidth)} />
  <meta property="og:image:height" content={String(imageHeight)} />
  <meta property="og:image:alt" content={imageAlt} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={SITE_TWITTER} />
  <meta name="twitter:creator" content={SITE_TWITTER} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={fullImage} />
  <meta name="twitter:image:alt" content={imageAlt} />

  {#each jsonLdItems as item}
    {@html `<script type="application/ld+json">${JSON.stringify(item)}</script>`}
  {/each}
</svelte:head>
