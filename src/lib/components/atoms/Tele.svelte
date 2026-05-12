<script>
  export let label = '';
  export let value = '';
  export let accent = 'var(--silver-1)';
</script>

<div class="tele">
  <span class="lbl">{label}</span>
  <span class="dash"></span>
  <span class="val" style:color={accent}>{value}</span>
</div>

<style>
  .tele {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1.5;
  }
  .lbl {
    color: var(--silver-3);
    letter-spacing: 0.1em;
    flex-shrink: 0;
    padding-top: 1px;
  }
  .dash {
    flex: 1 0 12px;
    min-width: 12px;
    border-top: 1px dashed var(--line);
    margin-top: 9px;
    align-self: flex-start;
  }
  .val {
    font-weight: 500;
    text-align: right;
    flex-shrink: 1;
    min-width: 0;
    word-break: break-word;
  }
</style>
