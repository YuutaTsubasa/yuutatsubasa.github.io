<script>
  import Corners from './Corners.svelte';
  export let glow = false;
  export let padding = 24;
  export let extraStyle = '';
  export let minHeight = null;
</script>

<div
  class="panel"
  class:glow
  style="padding:{padding}px;{minHeight ? `min-height:${minHeight}px;` : ''}{extraStyle}"
>
  <Corners />
  <slot />
</div>

<style>
  .panel {
    position: relative;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(234, 238, 246, 0.75));
    border: 1px solid var(--line);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 6px 24px rgba(15, 45, 120, 0.06);
  }
  .panel.glow {
    box-shadow:
      0 0 0 1px rgba(37, 99, 235, 0.18),
      0 1px 0 rgba(255, 255, 255, 0.9) inset,
      0 12px 60px rgba(15, 45, 120, 0.10);
  }
</style>
