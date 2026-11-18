(() => {
  const stage = document.querySelector('.personal-carousel');
  if (!stage) return;
  const cards = [...stage.children];
  const count = cards.length;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let position = 0, pointer = null, originX = 0, originY = 0, originPosition = 0;
  let dragging = false, frame = 0;
  const spacing = () => cards[0].offsetWidth * 1.04;
  function paint() {
    const cardSpacing = spacing();
    cards.forEach((card, i) => {
      const distance = ((i - position + count * 100 + count / 2) % count) - count / 2;
      const angle = Math.max(-1, Math.min(1, distance)) * -29;
      card.style.transform = `translateX(calc(-50% + ${distance * cardSpacing}px)) translateZ(${-Math.min(Math.abs(distance), 2) * 35}px) rotateY(${angle}deg)`;
      card.style.opacity = Math.abs(distance) > 1.75 ? '0' : '1';
      card.style.zIndex = String(Math.round((count - Math.abs(distance)) * 10));
    });
  }
  function settle() {
    cancelAnimationFrame(frame);
    const from = position, target = Math.round(position), started = performance.now();
    if (reduced.matches) { position = target; paint(); return; }
    function tick(now) {
      const t = Math.min(1, (now - started) / 360);
      position = from + (target - from) * (1 - (1 - t) ** 3);
      paint();
      if (t < 1) frame = requestAnimationFrame(tick);
      else position = ((target % count) + count) % count;
    }
    frame = requestAnimationFrame(tick);
  }
  let touch = null;
  stage.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    cancelAnimationFrame(frame);
    const point = event.touches[0];
    touch = { x: point.clientX, y: point.clientY, start: position, direction: null, dx: 0 };
  }, { passive: true });
  stage.addEventListener('touchmove', event => {
    if (!touch || event.touches.length !== 1) return;
    const point = event.touches[0];
    const dx = point.clientX - touch.x, dy = point.clientY - touch.y;
    if (!touch.direction && Math.max(Math.abs(dx), Math.abs(dy)) > 6)
      touch.direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    if (touch.direction !== 'horizontal') return;
    if (event.cancelable) event.preventDefault();
    touch.dx = dx;
    position = touch.start - dx / spacing();
    paint();
  }, { passive: false });
  function finishTouch() {
    if (!touch) return;
    if (touch.direction === 'horizontal' && Math.abs(touch.dx) > 35 && Math.abs(position - touch.start) < .5)
      position = Math.round(touch.start) - Math.sign(touch.dx);
    touch = null;
    settle();
  }
  stage.addEventListener('touchend', finishTouch);
  stage.addEventListener('touchcancel', finishTouch);
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || !event.isPrimary || event.button !== 0) return;
    cancelAnimationFrame(frame);
    pointer = event.pointerId;
    originX = event.clientX; originY = event.clientY; originPosition = position;
    dragging = false;
  });
  stage.addEventListener('pointermove', event => {
    if (pointer !== event.pointerId) return;
    const dx = event.clientX - originX, dy = event.clientY - originY;
    if (!dragging) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { pointer = null; settle(); return; }
      if (Math.abs(dx) < 6) return;
      dragging = true;
      stage.setPointerCapture(pointer);
      stage.classList.add('is-dragging');
    }
    position = originPosition - dx / spacing();
    paint();
  });
  function release(event) {
    if (event.pointerId !== pointer) return;
    const id = pointer;
    pointer = null; dragging = false;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
    settle();
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', release);
  stage.addEventListener('pointerleave', event => { if (!dragging) release(event); });
  stage.addEventListener('dragstart', event => event.preventDefault());
  stage.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); cancelAnimationFrame(frame);
    position = Math.round(position) + (event.key === 'ArrowRight' ? 1 : -1);
    paint();
  });
  new ResizeObserver(paint).observe(stage);
  paint();
})();
