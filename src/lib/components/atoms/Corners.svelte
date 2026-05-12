<script>
  export let color = 'var(--blue-bright)';
  export let size = 14;
  export let thickness = 1;
</script>

<span class="c tl" style="width:{size}px;height:{size}px;border-color:{color};border-width:{thickness}px;"></span>
<span class="c tr" style="width:{size}px;height:{size}px;border-color:{color};border-width:{thickness}px;"></span>
<span class="c bl" style="width:{size}px;height:{size}px;border-color:{color};border-width:{thickness}px;"></span>
<span class="c br" style="width:{size}px;height:{size}px;border-color:{color};border-width:{thickness}px;"></span>

<style>
  .c {
    position: absolute;
    border-style: solid;
    pointer-events: none;
  }
  .tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
  .tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
  .bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
  .br { bottom: -1px; right: -1px; border-left: none; border-top: none; }
</style>
