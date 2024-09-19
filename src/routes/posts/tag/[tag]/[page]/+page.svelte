<script>
    import Posts from "../../../../../components/Posts.svelte";

    export let data;
</script>
<Posts page={data.page} tag={data.tag} posts={data.posts} totalPages={data.totalPages} />