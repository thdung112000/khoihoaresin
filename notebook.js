(() => {
  const notebook = document.querySelector('#loi-nhan');
  if (!notebook) return;

  const book = notebook.querySelector('.notebook-book');
  const spreads = [...book.querySelectorAll('.notebook-spread')];
  const toolbar = notebook.querySelector('.notebook-toolbar');
  const previous = toolbar.querySelector('.notebook-previous');
  const next = toolbar.querySelector('.notebook-next');
  const count = toolbar.querySelector('.notebook-count');
  const toggleWriting = toolbar.querySelector('.notebook-writing-toggle');
  const pen = book.querySelector('.notebook-pen');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const narrowBook = matchMedia('(max-width: 675px)');

  let currentPage = 0;
  let pageTurn = null;
  let writingObserver = null;
  let writingFrame = 0;

  function pageInk() {
    return spreads[currentPage].querySelector('.notebook-ink');
  }

  function finishWriting() {
    writingObserver?.disconnect();
    writingObserver = null;
    cancelAnimationFrame(writingFrame);
    writingFrame = 0;
    pageInk().style.removeProperty('clip-path');
    pen.style.removeProperty('left');
    pen.style.removeProperty('top');
    pen.classList.add('is-resting');
    pen.hidden = false;
    toggleWriting.textContent = 'Xem hiệu ứng viết';
  }

  function writePage() {
    if (reducedMotion.matches) return;

    const ink = pageInk();
    // Measure in book coordinates so the pen follows the slanted page.
    book.style.rotate = "none";
    const bounds = ink.getBoundingClientRect();
    const bookBounds = book.getBoundingClientRect();
    const originX = bounds.left - bookBounds.left - book.clientLeft;
    const originY = bounds.top - bookBounds.top - book.clientTop;
    const range = document.createRange();
    const lines = [...ink.querySelectorAll('p')].flatMap(paragraph => {
      range.selectNodeContents(paragraph);
      return [...range.getClientRects()].map(line => ({
        left: line.left - bounds.left,
        right: line.right - bounds.left,
        top: Math.max(0, line.top - bounds.top - 1),
        bottom: Math.min(bounds.height, line.bottom - bounds.top + 1),
      }));
    });
    book.style.removeProperty("rotate");
    if (!lines.length) {
      finishWriting();
      return;
    }

    pen.classList.remove('is-resting');
    pen.hidden = false;
    toggleWriting.textContent = 'Hiện chữ ngay';
    const duration = Math.min(26000, Math.max(6500, lines.length * 1250));
    let started;

    function draw(now) {
      started ??= now;
      const progress = (now - started) / duration * lines.length;
      if (progress >= lines.length) {
        finishWriting();
        return;
      }

      const index = Math.floor(progress);
      const line = lines[index];
      const following = lines[index + 1];
      const time = progress - index;
      const writingShare = following ? .84 : 1;
      const written = Math.min(time / writingShare, 1);
      const inkEnd = line.left + (line.right - line.left + 1) * written;
      let tipX = inkEnd;
      let tipY = line.bottom - 3 + Math.sin(written * 19 * Math.PI) * 1.2;

      if (following && time > writingShare) {
        const lift = (time - writingShare) / (1 - writingShare);
        tipX += (following.left - tipX) * lift;
        tipY += (following.bottom - 3 - tipY) * lift - Math.sin(lift * Math.PI) * 7;
      }

      ink.style.clipPath = `polygon(0 0, 100% 0, 100% ${line.top}px, ${inkEnd}px ${line.top}px, ${inkEnd}px ${line.bottom}px, 0 ${line.bottom}px)`;
      pen.style.left = `${originX + tipX}px`;
      pen.style.top = `${originY + tipY}px`;
      writingFrame = requestAnimationFrame(draw);
    }

    draw(performance.now());
  }

  function watchForWriting() {
    if (reducedMotion.matches) return;
    if (!('IntersectionObserver' in window)) {
      writePage();
      return;
    }

    pageInk().style.clipPath = 'inset(0 100% 0 0)';
    toggleWriting.textContent = 'Hiện chữ ngay';
    const heading = spreads[currentPage].querySelector('.notebook-notes h3');
    const headerHeight = document.querySelector('.site-header').offsetHeight;
    writingObserver = new IntersectionObserver(([entry], observer) => {
      if (entry.intersectionRatio < .65) return;
      observer.disconnect();
      writingObserver = null;
      writePage();
    }, { rootMargin: `-${headerHeight}px 0px -48px`, threshold: .65 });
    // The ink itself is clipped until writing starts, so observe the heading.
    writingObserver.observe(heading);
  }

  function renderPage(index) {
    currentPage = index;
    for (const [pageIndex, spread] of spreads.entries()) {
      spread.hidden = pageIndex !== index;
    }
    previous.disabled = index === 0;
    next.disabled = index === spreads.length - 1;
    count.textContent = `Trang ${index + 1} / ${spreads.length}`;
  }

  function turnTo(index) {
    if (pageTurn || index < 0 || index >= spreads.length) return;
    finishWriting();

    if (reducedMotion.matches || typeof book.animate !== 'function') {
      renderPage(index);
      watchForWriting();
      return;
    }

    const forward = index > currentPage;
    const outgoing = spreads[currentPage];
    const selector = forward ? '.notebook-notes' : '.notebook-figure';
    const sheet = (narrowBook.matches ? outgoing : outgoing.querySelector(selector)).cloneNode(true);
    sheet.classList.add('notebook-turning-sheet', forward ? 'is-forward' : 'is-backward');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.inert = true;
    sheet.removeAttribute('aria-labelledby');
    for (const heading of sheet.querySelectorAll('[id]')) heading.removeAttribute('id');

    book.append(sheet);
    renderPage(index);
    pageInk().style.clipPath = 'inset(0 100% 0 0)';
    pen.hidden = true;
    pageTurn = sheet.animate([
      { transform: 'perspective(1300px) rotateY(0deg)', opacity: 1 },
      { transform: `perspective(1300px) rotateY(${forward ? -105 : 105}deg)`, opacity: .8 },
    ], { duration: 470, easing: 'cubic-bezier(.35,.08,.22,1)' });

    function completeTurn() {
      sheet.remove();
      pageTurn = null;
      finishWriting();
      watchForWriting();
    }
    pageTurn.finished.then(completeTurn, completeTurn);
  }

  previous.addEventListener('click', () => {
    turnTo(currentPage - 1);
    if (previous.disabled) next.focus({ preventScroll: true });
  });
  next.addEventListener('click', () => {
    turnTo(currentPage + 1);
    if (next.disabled) previous.focus({ preventScroll: true });
  });
  toggleWriting.addEventListener('click', () => {
    if (pageTurn) return;
    if (writingObserver || writingFrame) finishWriting();
    else writePage();
  });

  window.addEventListener('resize', () => {
    if (writingFrame) finishWriting();
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    pageTurn?.finish();
    finishWriting();
  });

  book.classList.add('is-interactive');
  renderPage(0);
  finishWriting();
  toolbar.hidden = false;
  watchForWriting();
})();
