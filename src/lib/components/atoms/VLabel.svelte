<script>
  export let color = 'var(--silver-3)';
</script>

<span class="vlabel mono" style:color>
  <slot />
</span>

<style>
  .vlabel {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
</style>
