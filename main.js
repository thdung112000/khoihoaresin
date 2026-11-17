const shippingGuide = document.querySelector('#dong-goi');
const siteHeader = document.querySelector('.site-header');

function updateHeaderSurface() {
  siteHeader.toggleAttribute('data-scrolled', window.scrollY > 8);
}

function updateHeaderHeight() {
  document.documentElement.style.setProperty('--header-height', `${siteHeader.offsetHeight}px`);
}

if (siteHeader) {
  updateHeaderHeight();
  updateHeaderSurface();
  window.addEventListener('scroll', updateHeaderSurface, { passive: true });
  window.addEventListener('pageshow', updateHeaderSurface);
  if ('ResizeObserver' in window) {
    new ResizeObserver(updateHeaderHeight).observe(siteHeader);
  } else {
    window.addEventListener('resize', updateHeaderHeight);
  }
}

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

const scrollSections = [...document.querySelectorAll('[data-reveal]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let scrollFrame = null;

const heroArt = document.querySelector('.hero-art');
if (heroArt) {
  const heroImage = heroArt.querySelector('img');
  const mirror = heroArt.querySelector('.hero-reflection');
  function syncBreezeImage() {
    if (heroImage.currentSrc) {
      heroArt.style.setProperty('--hero-breeze-image', `url("${heroImage.currentSrc}")`);
    }
  }

  heroImage.addEventListener('load', syncBreezeImage);
  syncBreezeImage();
  mirror.addEventListener('pointermove', event => {
    const bounds = mirror.getBoundingClientRect();
    mirror.style.setProperty('--mirror-x', `${100 * (event.clientX - bounds.left) / bounds.width}%`);
    mirror.style.setProperty('--mirror-y', `${100 * (event.clientY - bounds.top) / bounds.height}%`);
  });
}

function layoutTop(element) {
  // Use layout offsets so the current animation cannot change the next measurement.
  let top = element.offsetTop;
  for (let parent = element.offsetParent; parent; parent = parent.offsetParent) {
    top += parent.offsetTop + parent.clientTop;
  }
  return top;
}

function updateScrollEffects() {
  scrollFrame = null;
  if (reducedMotion.matches) return;

  const viewportHeight = document.documentElement.clientHeight;
  const scrollTop = window.scrollY;
  const enterDistance = Math.min(280, viewportHeight * .36);
  const leaveDistance = Math.min(96, viewportHeight * .15);
  const amounts = scrollSections.map(element => {
    const top = layoutTop(element) - scrollTop;
    const fromBottom = (viewportHeight - top) / enterDistance;
    const fromTop = (top + element.offsetHeight) / leaveDistance;
    const progress = Math.max(0, Math.min(1, fromBottom, fromTop));
    return {
      progress: progress.toFixed(3),
      direction: fromTop < fromBottom && progress < 1 ? -1 : 1,
    };
  });

  for (const [index, element] of scrollSections.entries()) {
    const { progress, direction } = amounts[index];
    if (element.style.getPropertyValue('--scroll-reveal') === progress &&
        element.style.getPropertyValue('--scroll-direction') === String(direction)) continue;
    element.style.setProperty('--scroll-reveal', progress);
    element.style.setProperty('--scroll-direction', direction);
  }
}

function scheduleScrollEffects() {
  if (!reducedMotion.matches && scrollFrame === null) {
    scrollFrame = requestAnimationFrame(updateScrollEffects);
  }
}

if (scrollSections.length) {
  window.addEventListener('scroll', scheduleScrollEffects, { passive: true });
  window.addEventListener('resize', scheduleScrollEffects);
  window.addEventListener('pageshow', scheduleScrollEffects);
  reducedMotion.addEventListener('change', scheduleScrollEffects);
  if ('ResizeObserver' in window) {
    new ResizeObserver(scheduleScrollEffects).observe(document.querySelector('main'));
  }
  scheduleScrollEffects();
}

const pearlSections = document.querySelectorAll('[data-pearl]');

for (const section of pearlSections) {
  const layer = document.createElement('div');
  layer.className = 'pearl-layer';
  layer.setAttribute('aria-hidden', 'true');

  for (let index = 0; index < 7; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'pearl-petal';
    layer.append(petal);
  }

  section.append(layer);
}
