<script>
  export let src = null;
  export let hue = 210;
  export let label = '';
  export let size = 72;
</script>

<div
  class="hex"
  style="
    width:{size}px;
    height:{size}px;
    background:linear-gradient(135deg, hsl({hue} 70% 35%), hsl({hue} 80% 18%));
  "
>
  {#if src}
    <img {src} alt={label} />
  {/if}
</div>

<style>
  .hex {
    position: relative;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    border: 1px solid var(--line-strong);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
