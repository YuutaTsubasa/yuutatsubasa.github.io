<script>
  export let color = 'var(--blue-bright)';
  export let size = 8;
  export let pulse = true;
</script>

<span
  class="dot"
  class:pulse
  style="width:{size}px;height:{size}px;background:{color};box-shadow:0 0 8px {color};"
></span>

<style>
  .dot {
    display: inline-block;
    border-radius: 50%;
  }
  .pulse {
    animation: pulse 1.6s ease-in-out infinite;
  }
</style>
