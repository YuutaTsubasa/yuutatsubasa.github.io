<script>
    import { ItemGroup } from '$lib/utils/itemGroup';
    import { fly } from 'svelte/transition';
    import { cubicInOut } from 'svelte/easing';

    let showModal = false;
    let currentModalImage = '';

    function openModal(imageUrl) {
        if (imageUrl) {
            currentModalImage = imageUrl;
            showModal = true;
        }
    }

    function closeModal() {
        showModal = false;
    }

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
            "/images/about/1.0-03.webp",
        ]);

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
        [
            "/images/about/2.0-01.webp",
            "/images/about/2.0-02.webp",
        ]);

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
            "/images/about/3.0-02.webp",
        ]);

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
            "/images/about/4.0-07.webp",
        ]);

    let descriptions = [
        versionOneIntroduction, 
        versionTwoIntroduction,
        versionThreeIntroduction,
        versionFourIntroduction
    ];

    // 資源來源列表
    let resources = [
        { name: "1.0 實況面板：布魯諾", source: "https://x.com/applebrunoliu" },
        { name: "2.0 實況面板：Envato Elements", source: "https://elements.envato.com/cyberpunk-opener-RB4QDV9" },
        { name: "1.0 開頭待機 Q 版動畫：泡芙", source: "https://x.com/noodle890812" },
        { name: "1.0 結尾圖：鱷魚 Zavir Wani", source: "https://x.com/wanivtuber" },
        { name: "BGM 製作：SIHanatsuka", source: "https://x.com/sihanatsuka" },
        { name: "1.0 與 2.0 Logo 製作：緋千夜", source: "https://x.com/hisenya" },
        { name: "綠界贊助音效：フリー効果音素材 くらげ工匠", source: "http://www.kurage-kosho.info/" },
        { name: "無限版 3D 模型素材提供：神崎", source: "https://x.com/kannzakivtuber" },
        { name: "無限版 3D 模型參考：Midjourney", source: "https://www.midjourney.com/home?callbackUrl=%2Fapp%2F" },
        { name: "配信者のためのコメントアプリ「わんコメ」", source: "https://onecomme.com" },
    ];

    let communities = [
        { name: "X / Twitter", source: "https://yutaii.run/twitter" },
        { name: "Youtube", source: "https://yutaii.run/youtube" },
        { name: "Facebook", source: "https://yutaii.run/facebook" },
        { name: "Plurk", source: "https://yutaii.run/plurk" },
        { name: "Instagram", source: "https://yutaii.run/instagram" },
        { name: "Threads", source: "https://yutaii.run/threads" },
        { name: "Discord", source: "https://yutaii.run/discord" },
        { name: "棉花糖", source: "https://yutaii.run/marshmallow" },
    ];

    // 添加這個函數來更新組件狀態
    function updateState() {
        descriptions = descriptions;
    }

    function changeSlide(direction, itemGroup) {
        if (direction === 1) {
            itemGroup.next();
        } else {
            itemGroup.previous();
        }
        updateState();
    }
</script>
  
<section class="fade-in-bg">   
    <section class="relative bg-cover bg-center bg-no-repeat h-96 w-screen flex items-center justify-center mb-12"
      style="background-image: url('/images/background.webp');">
      <div class="flex flex-col items-center justify-center">
        <h2 class="flex-1 text-6xl font-bold text-white">
            關於我
        </h2>
      </div>
    </section>

    <div class="max-w-7xl mx-auto description">
        <!-- 圖片滑動與文字說明區塊 -->
        {#each descriptions as itemGroup}
            <div class="flex flex-col md:flex-row items-center mb-12 md:gap-12 bg-black/50 p-4 rounded-lg shadow-lg backdrop-blur-sm">
                <!-- 圖片滑動區 -->
                <div class="relative w-full md:w-1/2 h-64 md:h-80 mb-6 md:mb-0 shadow-lg flex items-center justify-center bg-white/50 rounded-lg backdrop-blur-sm">
                    <div class="relative w-full h-full overflow-hidden">
                        {#key itemGroup.getCurrentIndex()}
                            <div
                            class="w-full h-full"
                            in:fly={{x: 100 * itemGroup.getSlideDirection(), duration: 600, easing: cubicInOut}}
                            out:fly={{x: -100 * itemGroup.getSlideDirection(), duration: 300, easing: cubicInOut}}
                            >
                                {#if itemGroup.currentItem().type === 'youtube'}
                                    <iframe
                                        src={itemGroup.currentItem().url}
                                        title="YouTube video player"
                                        frameborder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowfullscreen
                                        class="w-full h-full object-contain rounded-lg shadow-lg"
                                    ></iframe>
                                {:else}
                                    <button class="w-full h-full bg-transparent border-0 p-0 focus:outline-none"
                                        on:click={() => openModal(itemGroup.currentItem().url)}>
                                        <img 
                                            src={itemGroup.currentItem().url} 
                                            alt="Slide" 
                                            class="w-full h-full object-contain rounded-lg shadow-lg"
                                        />
                                    </button>
                                {/if}
                            </div>
                        {/key}
                    </div>
                    <div class="absolute inset-0 flex justify-between items-center pointer-events-none">
                        <button on:click={() => changeSlide(-1, itemGroup)} class="bg-white/75 hover:bg-white/100 p-2 rounded-full shadow-lg m-[-10px] hover:bg-yellow-500 hover:text-white pointer-events-auto">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button on:click={() => changeSlide(1, itemGroup)} class="bg-white/75 hover:bg-white/100 p-2 rounded-full shadow-lg m-[-10px] hover:bg-yellow-500 hover:text-white pointer-events-auto">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <!-- 文字說明區 -->
                <div class="w-full md:w-1/2 text-white self-start">
                    <h2 class="text-3xl font-bold mb-4">{itemGroup.title}</h2>
                    <p class="text-lg text-gray-200">{@html itemGroup.content}</p>
                </div>
            </div>
        {/each}

        <!-- 資源來源區塊 -->
        <div class="mt-12 mb-6 bg-black/50 p-10 rounded-lg shadow-lg backdrop-blur-sm text-white">
            <h2 class="text-3xl font-bold mb-2">實況資源來源</h2>
            <ul class="list-disc list-inside text-lg text-gray-200">
                {#each resources as resource}
                    <li>
                        {resource.name}：<a href={resource.source} target="_blank" class="text-blue-200 hover:underline">{resource.source}</a>
                    </li>
                {/each}
            </ul>
        </div>

        <!-- 社群連結區塊 -->
        <div class="mt-6 mb-6 bg-black/50 p-10 rounded-lg shadow-lg backdrop-blur-sm text-white">
            <h2 class="text-3xl font-bold mb-2">社群連結</h2>
            <ul class="list-disc list-inside text-lg text-gray-200">
                {#each communities as community}
                    <li>
                        {community.name}：<a href={community.source} target="_blank" class="text-blue-200 hover:underline">{community.source}</a>
                    </li>
                {/each}
            </ul>
        </div>
    </div>
</section>

{#if showModal}
    <button class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" on:click={closeModal}>
        <div class="relative max-w-4xl max-h-full p-4">
            <img 
                src={currentModalImage} 
                alt="Enlarged view" 
                class="max-w-full max-h-full object-contain"
            />
            <button 
                class="absolute top-[-5px] right-[-5px] text-white bg-black bg-opacity-50 rounded-full w-10 h-10 hover:bg-yellow-500 hover:text-white"
                on:click={closeModal}
            >
                <i class="fas fa-times"></i>
            </button>
        </div>
    </button>
{/if}