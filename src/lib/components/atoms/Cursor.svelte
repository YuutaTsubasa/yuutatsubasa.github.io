<script>
  import { onMount } from 'svelte';

  onMount(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let rx = 0, ry = 0, dx = 0, dy = 0;
    let raf;

    const onMove = (e) => {
      dx = e.clientX;
      dy = e.clientY;
      dot.style.left = dx + 'px';
      dot.style.top = dy + 'px';
      const t = e.target;
      if (t.closest && t.closest('a,button,[role=button]')) {
        ring.classList.add('hover');
      } else {
        ring.classList.remove('hover');
      }
    };

    const tick = () => {
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      dot.remove();
      ring.remove();
    };
  });
</script>
