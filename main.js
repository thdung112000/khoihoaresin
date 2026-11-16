const shippingGuide = document.querySelector('#dong-goi');

function openShippingGuide() {
  if (window.location.hash === '#dong-goi') {
    shippingGuide.open = true;
  }
}

if (shippingGuide) {
  openShippingGuide();
  window.addEventListener('hashchange', openShippingGuide);
  document.querySelector('a[href="#dong-goi"]').addEventListener('click', () => {
    shippingGuide.open = true;
  });
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      entry.target.dataset.revealState = 'entered';
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -20px' });

  for (const element of document.querySelectorAll('[data-reveal]')) {
    element.dataset.revealState = 'pending';
    revealObserver.observe(element);
  }
}
