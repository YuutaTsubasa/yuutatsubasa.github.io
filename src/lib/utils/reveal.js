// 滾動進入畫面時觸發 fade-up reveal 動畫，離開畫面後會 reset，再進來時重新動畫。
// 用法：<div use:reveal>  或 <div use:reveal={{ delay: 120 }}>
//
// 支援 prefers-reduced-motion：使用者偏好減少動態時不執行 reveal。
export function reveal(node, options = {}) {
  const { delay = 0, threshold = 0.12, distance = 16, duration = 500 } = options;

  if (typeof window === 'undefined') return {};

  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return {};

  const hidden = `translateY(${distance}px)`;

  node.style.opacity = '0';
  node.style.transform = hidden;
  node.style.willChange = 'opacity, transform';
  node.style.transition = `opacity ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms`;

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          node.style.opacity = '1';
          node.style.transform = 'translateY(0)';
        } else {
          node.style.opacity = '0';
          node.style.transform = hidden;
        }
      }
    },
    { threshold, rootMargin: '0px 0px -10% 0px' }
  );

  obs.observe(node);

  return {
    destroy() {
      obs.disconnect();
    }
  };
}
