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
    cards.forEach((card, i) => {
      const distance = ((i - position + count * 100 + count / 2) % count) - count / 2;
      const angle = Math.max(-1, Math.min(1, distance)) * -29;
      card.style.transform = `translateX(calc(-50% + ${distance * spacing()}px)) translateZ(${-Math.min(Math.abs(distance), 2) * 35}px) rotateY(${angle}deg)`;
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
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
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
