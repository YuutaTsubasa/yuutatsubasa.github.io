<script>
    import Posts from "../../../components/Posts.svelte";

    export let data;
</script>
<Posts page={data.page} tag={null} totalPages={data.totalPages} posts={data.posts}/>