/* ============================================================
   LENIS — smooth scroll
   autoRaf: false so we drive it ourselves via requestAnimationFrame,
   keeping it in sync with all other rAF-based animations on the page.
   ============================================================ */
const lenis = new Lenis({
  lerp:            0.08,
  wheelMultiplier: 1,
  smoothTouch:     false,
  autoRaf:         false,
});

(function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
})(0);

/* ============================================================
   NAV — scroll state
   ============================================================ */
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ============================================================
   SCROLL REVEAL
   Any element with class="reveal" fades up when it enters view.
   Add data-delay="200" (ms) for staggered children.
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = entry.target.dataset.delay || 0;
    setTimeout(() => entry.target.classList.add('visible'), Number(delay));
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

/* ============================================================
   STATS — bidirectional scroll-triggered reveal

   Thresholds > 0 so nothing shows the moment the sticky panel
   first locks. Progress is NOT clamped from below, so while the
   section is still below the viewport all lines stay hidden.
   ============================================================ */
const statsSection = document.querySelector('.stats-scroll');
const statsLines = document.querySelectorAll('.stats__line');

if (statsSection && statsLines.length) {
  const thresholds = [0.1, 0.4, 0.7];

  const revealStats = () => {
    const rect = statsSection.getBoundingClientRect();
    const scrolled = -rect.top;
    const max = statsSection.offsetHeight - window.innerHeight;
    const progress = Math.min(1, scrolled / max);

    statsLines.forEach((line, i) => {
      line.classList.toggle('visible', progress >= thresholds[i]);
    });
  };

  window.addEventListener('scroll', revealStats, { passive: true });
  revealStats();
}

/* ============================================================
   SERVICES — rounded card expands to full-bleed on scroll

   margin-inline and border-radius start at MAX_MARGIN (48px) and
   both animate to 0 as the section scrolls into view. Keeping them
   equal means the corner arc always sits flush with the dark background,
   so you never see an awkward gap or overlap at the edge.
   ============================================================ */
const svcSection = document.querySelector('.services');

if (svcSection) {
  const MAX = 48;

  const animateServices = () => {
    if (window.innerWidth < 768) return;
    const rect = svcSection.getBoundingClientRect();
    const raw = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
    const eased = 1 - Math.pow(1 - raw, 2); // ease-out quad
    const m = MAX * (1 - eased);
    svcSection.style.marginInline = `${m}px`;
    svcSection.style.borderRadius = `${m}px ${m}px 0 0`;
  };

  window.addEventListener('scroll', animateServices, { passive: true });
  window.addEventListener('resize', animateServices);
  animateServices();
}

/* ============================================================
   FOOTER — rounded card expands to full-bleed on scroll
   Same mechanic as services: margin-inline + border-radius
   animate from MAX (48px) → 0 as the section enters view.
   ============================================================ */
const footerSection = document.querySelector('.footer');

if (footerSection) {
  const MAX = 48;

  const animateFooter = () => {
    if (window.innerWidth < 768) return;
    const rect = footerSection.getBoundingClientRect();
    const raw = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
    const eased = 1 - Math.pow(1 - raw, 2);
    const m = MAX * (1 - eased);
    footerSection.style.marginInline = `${m}px`;
    footerSection.style.borderRadius = `${m}px`;
  };

  window.addEventListener('scroll', animateFooter, { passive: true });
  window.addEventListener('resize', animateFooter);
  animateFooter();
}

/* ============================================================
   CAROUSEL — pixel-perfect seamless loop
   Measures the real width of the original slides, then translates
   by exact pixels and resets invisibly when it reaches the clone set.
   ============================================================ */
const carouselTrack = document.querySelector('.carousel__track');

if (carouselTrack) {
  const originalSlides = carouselTrack.querySelectorAll('.carousel__slide:not([aria-hidden])');
  let loopWidth = 0;

  const measureLoop = () => {
    loopWidth = 0;
    originalSlides.forEach(slide => {
      const style = getComputedStyle(slide);
      loopWidth += slide.offsetWidth + parseFloat(style.marginRight);
    });
  };

  measureLoop();
  window.addEventListener('resize', measureLoop);

  let offset = 0;
  let paused = false;
  const SPEED = 1; // px per frame

  carouselTrack.addEventListener('mouseenter', () => { paused = true; });
  carouselTrack.addEventListener('mouseleave', () => { paused = false; });

  const tick = () => {
    if (!paused) {
      offset += SPEED;
      if (offset >= loopWidth) offset -= loopWidth;
      carouselTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/* ============================================================
   TESTIMONIAL SLIDER — arrow-driven cross-fade with slide direction
   ============================================================ */
const tfSlider = document.querySelector('.tf-slider');

if (tfSlider) {
  const slides  = Array.from(tfSlider.querySelectorAll('.tf-slider__slide'));
  const prevBtn = tfSlider.querySelector('.tf-arrow--prev');
  const nextBtn = tfSlider.querySelector('.tf-arrow--next');
  const N       = slides.length;
  let current   = 0;
  let busy      = false;

  slides[0].classList.add('is-active');

  const go = (dir) => {
    if (busy) return;
    busy = true;
    const next     = (current + dir + N) % N;
    const outSlide = slides[current];
    const inSlide  = slides[next];

    // Fade + slide out (author animates with it, inside the slide)
    outSlide.style.cssText = 'transition: opacity 0.28s ease, transform 0.28s ease; opacity: 0; transform: translateX(' + (dir > 0 ? '-24px' : '24px') + ');';

    setTimeout(() => {
      outSlide.classList.remove('is-active');
      outSlide.style.cssText = '';

      inSlide.style.cssText = 'opacity: 0; transform: translateX(' + (dir > 0 ? '24px' : '-24px') + '); transition: none;';
      inSlide.classList.add('is-active');

      requestAnimationFrame(() => requestAnimationFrame(() => {
        inSlide.style.cssText = 'transition: opacity 0.32s ease, transform 0.32s ease; opacity: 1; transform: translateX(0);';

        setTimeout(() => {
          inSlide.style.cssText = '';
          current = next;
          busy    = false;
        }, 320);
      }));
    }, 280);
  };

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
}

