(() => {
  const slider = document.querySelector('.review-slider');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.review-slide')];
  const counter = slider.querySelector('.review-counter');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let busy = false;
  async function show(direction) {
    if (busy || slides.length < 2) return;
    busy = true;
    const outgoing = slides[index];
    outgoing.querySelectorAll('video').forEach(video => video.pause());
    const next = (index + direction + slides.length) % slides.length;
    const animate = (slide, entering) => Promise.all([...slide.children].map((panel, side) => {
      const offset = (side ? -1 : 1) * direction * 38;
      return panel.animate(entering ? [{ opacity: 0, transform: `translateY(${offset}px) scale(1.025)` }, { opacity: 1, transform: 'none' }] : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${-offset}px)` }], { duration: entering ? 750 : 350, easing: 'cubic-bezier(.22,.61,.36,1)' }).finished;
    }));
    try {
      if (!reduced.matches) await animate(outgoing, false);
      outgoing.hidden = true;
      slides[next].hidden = false;
      index = next;
      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      if (!reduced.matches) await animate(slides[index], true);
    } finally { busy = false; }
  }
  slider.querySelector('.review-prev').addEventListener('click', () => show(-1));
  slider.querySelector('.review-next').addEventListener('click', () => show(1));
  slider.addEventListener('keydown', event => {
    if (event.target.matches('video, input, textarea, select')) return;
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
      event.preventDefault();
      show(['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1);
    }
  });
  let start;
  slider.addEventListener('touchstart', event => { start = event.changedTouches[0]; }, { passive: true });
  slider.addEventListener('touchend', event => {
    if (!start || event.target.closest('video, button')) return;
    const end = event.changedTouches[0], dx = end.clientX - start.clientX, dy = end.clientY - start.clientY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(dx < 0 ? 1 : -1);
    start = null;
  }, { passive: true });
})();
