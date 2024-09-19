<script>
    import { formatDate } from '../lib/utils/formatDate';
    import Tag from './Tag.svelte';

    export let post;
    export let selectedTag;
</script>

<a href="/post/{post.filename}" class="hover:scale-105 transition-transform duration-300">
    <div class="border rounded-lg p-6 shadow-lg bg-white/75 backdrop-blur-lg">
        <img src={post.thumbnail} alt={post.title} class="w-full h-48 object-cover mb-4"/>
        <h3 class="text-2xl font-bold mb-2">
        {post.title}
        </h3>
        <p class="text-gray-700"><i class="fas fa-calendar-alt mr-1"></i>  發佈日期：{formatDate(post.date)}</p>
        <p class="text-gray-700 mb-4"><i class="fas fa-user mr-1"></i> 作者：{post.author}</p>

        <!-- 顯示摘要或截取的內容 -->
        <p class="text-black mb-4">{post.excerpt}</p>

        <div class="flex flex-wrap mb-4">
        {#each post.tags as tag}
            <Tag isAll={false} {tag} {selectedTag}  />
        {/each}
        </div>
    </div>
</a>