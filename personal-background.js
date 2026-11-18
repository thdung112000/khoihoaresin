(() => {
  const section = document.querySelector('#ca-nhan-hoa');
  const video = section?.querySelector('.personal-background-video');
  if (!video || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const connection = navigator.connection;
  let nearby = false, visible = false;
  let playPending = false;
  function allowed() { return !reduced.matches && !connection?.saveData; }
  function sync() {
    if (!allowed()) {
      video.pause();
      if (video.hasAttribute('src')) { video.removeAttribute('src'); video.load(); }
      return;
    }
    if (document.hidden) { video.pause(); return; }
    if (nearby && !video.hasAttribute('src')) {
      video.src = mobile.matches ? video.dataset.mobile : video.dataset.desktop;
      video.muted = true;
      video.load();
    }
    if (!visible) { video.pause(); return; }
    if (video.hasAttribute('src') && video.paused && !playPending) {
      playPending = true;
      video.play().catch(() => { video.classList.remove('is-playing'); }).finally(() => { playPending = false; });
    }
  }
  video.addEventListener('playing', () => {
    if (!allowed() || document.hidden || !visible) { video.pause(); return; }
    video.classList.add('is-playing');
  });
  video.addEventListener('pause', () => video.classList.remove('is-playing'));
  video.addEventListener('error', () => video.classList.remove('is-playing'));
  const nearObserver = new IntersectionObserver(([entry]) => {
    nearby = entry.isIntersecting;
    sync();
  }, { rootMargin: '300px 0px', threshold: 0 });
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRect.height > 0;
    sync();
  }, { threshold: 0 });
  nearObserver.observe(section);
  visibilityObserver.observe(section);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  connection?.addEventListener('change', sync);
  window.addEventListener('pagehide', () => video.pause());
  window.addEventListener('pageshow', sync);
})();
