(() => {
  const slider = document.querySelector('.review-slider');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.review-slide')];
  const counter = slider.querySelector('.review-counter');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  slider.querySelector('.review-controls > div')?.remove();
  const hint = document.createElement('span');
  hint.className = 'review-scroll-hint';
  hint.textContent = 'Cuộn trong khung để xem tiếp ↓';
  slider.querySelector('.review-controls').append(hint);
  let index = 0;
  let busy = false;
  let wheelTotal = 0;
  let lastWheel = 0;
  let wheelUsed = false;

  async function show(target) {
    if (busy || target === index) return;
    busy = true;
    const outgoing = slides[index];
    outgoing.querySelectorAll('video').forEach(video => video.pause());
    const direction = target > index ? 1 : -1;
    const animate = (slide, entering) => Promise.all([...slide.children].map((panel, side) => {
      const offset = (side ? -1 : 1) * direction * 48;
      return panel.animate(entering ? [{ opacity: 0, transform: `translateY(${offset}px) scale(1.025)` }, { opacity: 1, transform: 'none' }] : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${-offset}px)` }], { duration: entering ? 650 : 260, easing: 'cubic-bezier(.22,.61,.36,1)' }).finished;
    }));
    try {
      if (!reduced.matches) await animate(outgoing, false);
      outgoing.hidden = true;
      slides[target].hidden = false;
      index = target;
      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      hint.textContent = index === slides.length - 1 ? 'Cuộn để tiếp tục ↓' : 'Cuộn trong khung để xem tiếp ↓';
      if (!reduced.matches) await animate(slides[index], true);
    } finally {
      busy = false;
    }
  }
  const canMove = direction => direction > 0 ? index < slides.length - 1 : index > 0;
  const isControl = target => target.closest('video, input, textarea, select, button, a');

  // Listen on the card itself: scrolling anywhere else always belongs to the page.
  slider.addEventListener('wheel', event => {
    if (event.ctrlKey || isControl(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const now = performance.now();
    if (now - lastWheel > 180) { wheelTotal = 0; wheelUsed = false; }
    lastWheel = now;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (!delta) return;
    const direction = Math.sign(delta);
    if (busy || wheelUsed) { event.preventDefault(); return; }
    if (!canMove(direction)) return;
    event.preventDefault();
    if (Math.sign(wheelTotal) !== direction) wheelTotal = 0;
    wheelTotal += delta;
    if (Math.abs(wheelTotal) >= 45) {
      wheelUsed = true;
      wheelTotal = 0;
      show(index + direction);
    }
  }, { passive: false });
  slider.addEventListener('pointerleave', () => { wheelTotal = 0; wheelUsed = false; lastWheel = 0; });

  let touchStart = null;
  let touchUsed = false;
  slider.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 && !isControl(event.target) ? event.touches[0] : null;
    touchUsed = false;
  }, { passive: true });
  slider.addEventListener('touchmove', event => {
    if (!touchStart || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const delta = touchStart.clientY - touch.clientY;
    if (Math.abs(delta) < Math.abs(touch.clientX - touchStart.clientX)) return;
    if (touchUsed || busy) { event.preventDefault(); return; }
    const direction = Math.sign(delta);
    if (!canMove(direction)) return;
    event.preventDefault();
    if (Math.abs(delta) >= 45) { touchUsed = true; show(index + direction); }
  }, { passive: false });
  slider.addEventListener('touchend', () => { touchStart = null; }, { passive: true });
  slider.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  slider.addEventListener('keydown', event => {
    if (isControl(event.target)) return;
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
      const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
      if (!canMove(direction)) return;
      event.preventDefault();
      show(index + direction);
    }
  });
})();
