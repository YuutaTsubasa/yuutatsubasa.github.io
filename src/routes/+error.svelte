<script>
  import { page } from '$app/stores';
  import Corners from '$lib/components/atoms/Corners.svelte';
  import Seo from '$lib/components/Seo.svelte';

  $: status = $page.status ?? 404;
  $: message = $page.error?.message ?? (status === 404 ? 'PAGE NOT FOUND' : 'SOMETHING WENT WRONG');
</script>

<Seo title={`${status} · 悠太翼 YUUTA TSUBASA`} description="找不到您所要尋找的頁面。" />

<section id="main" class="err">
  <div class="wrap">
    <div class="card">
      <Corners />
      <div class="mono lbl">// SIGNAL LOST</div>
      <div class="display num">{status}</div>
      <div class="display title">{message}</div>
      <div class="tech sub">DOSSIER NOT IN ARCHIVE / 連線中斷</div>

      <div class="hr"></div>

      <div class="grid">
        <div>
          <div class="mono cap">// PATH</div>
          <div class="mono path">{$page.url.pathname}</div>
        </div>
        <div>
          <div class="mono cap">// STATUS</div>
          <div class="mono path">{status}</div>
        </div>
      </div>

      <div class="actions">
        <a class="btn btn-primary" href="/">▸ RETURN TO BASE</a>
        <a class="btn" href="/archive">↗ BROWSE ARCHIVE</a>
        <a class="btn" href="/gallery">↗ BROWSE GALLERY</a>
      </div>
    </div>
  </div>
</section>

<style>
  .err {
    min-height: 100vh;
    padding: 160px 24px 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wrap { width: 100%; max-width: 720px; }
  .card {
    position: relative;
    padding: 56px 40px 44px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(234, 238, 246, 0.85));
    border: 1px solid var(--line);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 12px 60px rgba(15, 45, 120, 0.1);
  }
  .lbl {
    font-size: 11px;
    color: #DC2626;
    letter-spacing: 0.24em;
    margin-bottom: 6px;
  }
  .num {
    font-size: 124px;
    font-weight: 900;
    color: var(--silver-0);
    line-height: 0.92;
    letter-spacing: 0.02em;
  }
  .title {
    font-size: 22px;
    margin-top: 18px;
    font-weight: 700;
    color: var(--silver-0);
  }
  .sub {
    font-size: 13px;
    color: var(--silver-2);
    margin-top: 8px;
    letter-spacing: 0.18em;
  }
  .hr {
    height: 1px;
    background: var(--line);
    margin: 28px 0;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 120px;
    gap: 18px;
    margin-bottom: 28px;
  }
  .cap {
    font-size: 10px;
    color: var(--silver-3);
    letter-spacing: 0.2em;
  }
  .path {
    margin-top: 4px;
    font-size: 12px;
    color: var(--silver-1);
    word-break: break-all;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  @media (max-width: 560px) {
    .num { font-size: 88px; }
    .grid { grid-template-columns: 1fr; }
    .err { padding-top: 120px; }
  }
</style>
