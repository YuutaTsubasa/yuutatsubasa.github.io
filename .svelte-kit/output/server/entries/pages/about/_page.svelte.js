import { c as create_ssr_component, d as each, f as add_attribute, e as escape } from "../../../chunks/ssr.js";
class ItemGroup {
  constructor(title, content, items) {
    this.title = title;
    this.content = content;
    this.items = items.map((item) => this.parseItem(item));
    this.currentIndex = 0;
    this.slideDirection = 1;
  }
  parseItem(item) {
    if (typeof item === "string") {
      if (item.includes("youtube.com") || item.includes("youtu.be")) {
        return { type: "youtube", url: this.getYoutubeEmbedUrl(item) };
      }
      return { type: "image", url: item };
    }
    return item;
  }
  getYoutubeEmbedUrl(url) {
    const videoId = this.getYoutubeVideoId(url);
    return `https://www.youtube.com/embed/${videoId}`;
  }
  getYoutubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }
  next() {
    this.slideDirection = 1;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
  }
  previous() {
    this.slideDirection = -1;
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
  }
  currentItem() {
    return this.items[this.currentIndex];
  }
  getCurrentIndex() {
    return this.currentIndex;
  }
  getSlideDirection() {
    return this.slideDirection;
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let versionOneIntroduction = new ItemGroup(
    "1.0 & 1.5 版本",
    `
        <ul class="list-disc list-inside">
            <li>
                繪師：<a href="https://x.com/nekosimayui" target="_blank">猫島羽依</a>
            </li>
            <li>
                Live2D 模型師：<a href="https://x.com/Yasa_661266" target="_blank">夜颯</a>
            </li>
            <li>
                3D 模型師：<a href="https://x.com/Gairaku_tw" target="_blank">がいらく</a>
            </li>
        </ul>
        `,
    [
      "/images/about/1.0-01.webp",
      "/images/about/1.0-02.webp",
      "https://www.youtube.com/watch?v=wgEHJeHnTBU",
      "/images/about/1.5-01.webp",
      "/images/about/1.5-02.webp",
      "https://www.youtube.com/watch?v=hDWDaYSErGU",
      "/images/about/1.0-03.webp"
    ]
  );
  let versionTwoIntroduction = new ItemGroup(
    "2.0 版本",
    `
        <ul class="list-disc list-inside">
            <li>
                繪師：<a href="https://x.com/etcelebi" target="_blank">CC</a>
            </li>
            <li>
                3D 模型師：<a href="https://x.com/COOKRICE6" target="_blank">策策</a>
            </li>
        </ul>
        `,
    ["/images/about/2.0-01.webp", "/images/about/2.0-02.webp"]
  );
  let versionThreeIntroduction = new ItemGroup(
    "3.0 版本",
    `
        <ul class="list-disc list-inside">
            <li>
                繪師：<a href="https://x.com/hikoumitsu" target="_blank">飛密</a>
            </li>
            <li>
                Live2D 模型師：<a href="https://x.com/mat_cha_m" target="_blank">宗茶</a>
            </li>
            <li>
                3D 模型師：<a href="https://x.com/COOKRICE6" target="_blank">策策</a>
            </li>
        </ul>
        `,
    [
      "/images/about/3.0-01.webp",
      "https://www.youtube.com/watch?v=q8UvhFnRJM8",
      "/images/about/3.0-02.webp"
    ]
  );
  let versionFourIntroduction = new ItemGroup(
    "4.0 版本",
    `
        <ul class="list-disc list-inside">
            <li>
                繪師：<a href="https://x.com/etcelebi" target="_blank">CC</a>
            </li>
            <li>
                3D 模型師（包含 1.0、2.0、3.0 版本衣服更換）：<a href="https://x.com/COOKRICE6" target="_blank">策策</a>
            </li>
        </ul>
        `,
    [
      "/images/about/4.0-01.webp",
      "/images/about/4.0-02.webp",
      "/images/about/4.0-03.webp",
      "/images/about/4.0-04.webp",
      "/images/about/4.0-05.webp",
      "/images/about/4.0-06.webp",
      "/images/about/4.0-07.webp"
    ]
  );
  let descriptions = [
    versionOneIntroduction,
    versionTwoIntroduction,
    versionThreeIntroduction,
    versionFourIntroduction
  ];
  let resources = [
    {
      name: "1.0 實況面板：布魯諾",
      source: "https://x.com/applebrunoliu"
    },
    {
      name: "2.0 實況面板：Envato Elements",
      source: "https://elements.envato.com/cyberpunk-opener-RB4QDV9"
    },
    {
      name: "1.0 開頭待機 Q 版動畫：泡芙",
      source: "https://x.com/noodle890812"
    },
    {
      name: "1.0 結尾圖：鱷魚 Zavir Wani",
      source: "https://x.com/wanivtuber"
    },
    {
      name: "綠界贊助音效：フリー効果音素材 くらげ工匠",
      source: "http://www.kurage-kosho.info/"
    },
    {
      name: "無限版 3D 模型素材提供：神崎",
      source: "https://x.com/kannzakivtuber"
    },
    {
      name: "無限版 3D 模型參考：Midjourney",
      source: "https://www.midjourney.com/home?callbackUrl=%2Fapp%2F"
    },
    {
      name: "配信者のためのコメントアプリ「わんコメ」",
      source: "https://onecomme.com"
    }
  ];
  let communities = [
    {
      name: "X / Twitter",
      source: "https://yutaii.run/twitter"
    },
    {
      name: "Youtube",
      source: "https://yutaii.run/youtube"
    },
    {
      name: "Facebook",
      source: "https://yutaii.run/facebook"
    },
    {
      name: "Plurk",
      source: "https://yutaii.run/plurk"
    },
    {
      name: "Instagram",
      source: "https://yutaii.run/instagram"
    },
    {
      name: "Threads",
      source: "https://yutaii.run/threads"
    },
    {
      name: "Discord",
      source: "https://yutaii.run/discord"
    },
    {
      name: "棉花糖",
      source: "https://yutaii.run/marshmallow"
    }
  ];
  return `<section class="fade-in-bg"><section class="relative bg-cover bg-center bg-no-repeat h-96 w-screen flex items-center justify-center mb-12" style="background-image: url('/images/background.webp');" data-svelte-h="svelte-fifltq"><div class="flex flex-col items-center justify-center"><h2 class="flex-1 text-6xl font-bold text-white">關於我</h2></div></section> <div class="max-w-7xl mx-auto description"> ${each(descriptions, (itemGroup) => {
    return `<div class="flex flex-col md:flex-row items-center mb-12 md:gap-12 bg-black/50 p-4 rounded-lg shadow-lg backdrop-blur-sm"> <div class="relative w-full md:w-1/2 h-64 md:h-80 mb-6 md:mb-0 shadow-lg flex items-center justify-center bg-white/50 rounded-lg backdrop-blur-sm"><div class="relative w-full h-full overflow-hidden"><div class="w-full h-full">${itemGroup.currentItem().type === "youtube" ? `<iframe${add_attribute("src", itemGroup.currentItem().url, 0)} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full object-contain rounded-lg shadow-lg"></iframe>` : `<button class="w-full h-full bg-transparent border-0 p-0 focus:outline-none"><img${add_attribute("src", itemGroup.currentItem().url, 0)} alt="Slide" class="w-full h-full object-contain rounded-lg shadow-lg"> </button>`} </div></div> <div class="absolute inset-0 flex justify-between items-center pointer-events-none"><button class="bg-white/75 hover:bg-white/100 p-2 rounded-full shadow-lg m-[-10px] hover:bg-yellow-500 hover:text-white pointer-events-auto" data-svelte-h="svelte-1g8gy9t"><i class="fas fa-chevron-left"></i></button> <button class="bg-white/75 hover:bg-white/100 p-2 rounded-full shadow-lg m-[-10px] hover:bg-yellow-500 hover:text-white pointer-events-auto" data-svelte-h="svelte-d3gqhr"><i class="fas fa-chevron-right"></i></button> </div></div>  <div class="w-full md:w-1/2 text-white self-start"><h2 class="text-3xl font-bold mb-4">${escape(itemGroup.title)}</h2> <p class="text-lg text-gray-200"><!-- HTML_TAG_START -->${itemGroup.content}<!-- HTML_TAG_END --></p></div> </div>`;
  })}  <div class="mt-12 mb-6 bg-black/50 p-10 rounded-lg shadow-lg backdrop-blur-sm text-white"><h2 class="text-3xl font-bold mb-2" data-svelte-h="svelte-8jj01t">實況資源來源</h2> <ul class="list-disc list-inside text-lg text-gray-200">${each(resources, (resource) => {
    return `<li>${escape(resource.name)}：<a${add_attribute("href", resource.source, 0)} target="_blank" class="text-blue-200 hover:underline">${escape(resource.source)}</a> </li>`;
  })}</ul></div>  <div class="mt-6 mb-6 bg-black/50 p-10 rounded-lg shadow-lg backdrop-blur-sm text-white"><h2 class="text-3xl font-bold mb-2" data-svelte-h="svelte-tvejc">社群連結</h2> <ul class="list-disc list-inside text-lg text-gray-200">${each(communities, (community) => {
    return `<li>${escape(community.name)}：<a${add_attribute("href", community.source, 0)} target="_blank" class="text-blue-200 hover:underline">${escape(community.source)}</a> </li>`;
  })}</ul></div></div></section> ${``}`;
});
export {
  Page as default
};
