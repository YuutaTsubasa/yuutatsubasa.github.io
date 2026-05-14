<script>
  export let color = 'var(--blue-bright)';
  export let solid = false;
</script>

<span
  class="tag tech"
  class:solid
  style:background={solid ? color : `${color}1f`}
  style:color={solid ? '#FFFFFF' : color}
  style:border={`1px solid ${color}55`}
>
  <slot />
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .tag.solid {
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.28);
  }
</style>
