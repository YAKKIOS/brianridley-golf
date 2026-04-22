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
   TESTIMONIALS FEATURE — scroll-linked fade + image cross-fade
   Text scrolls naturally. First slide fades as it exits upward.
   Image cross-fades when the second slide reaches mid-viewport.
   ============================================================ */
const tfFeature = document.querySelector('.tf-feature');

if (tfFeature) {
  const slides = tfFeature.querySelectorAll('.tf-slide');
  const imgs   = tfFeature.querySelectorAll('.tf-img');

  // Initialise second slide invisible
  slides[1].style.opacity = 0;

  const updateTF = () => {
    const vh = window.innerHeight;

    // Slide 0 — fade out as its bottom half clears the viewport centre
    const r0 = slides[0].getBoundingClientRect();
    const exitFade = Math.min(1, Math.max(0, (vh * 0.5 - r0.bottom) / (vh * 0.35)));
    slides[0].style.opacity = 1 - exitFade;

    // Slide 1 — fade in as it rises from the bottom third of the viewport
    const r1 = slides[1].getBoundingClientRect();
    const enterFade = Math.min(1, Math.max(0, (vh * 0.85 - r1.top) / (vh * 0.4)));
    slides[1].style.opacity = enterFade;

    // Cross-fade image when the second slide's top reaches the image's bottom edge
    const imgBottom = tfFeature.querySelector('.tf-image-frame').getBoundingClientRect().bottom;
    const showSecond = r1.top < imgBottom;
    imgs[0].classList.toggle('tf-img--active', !showSecond);
    imgs[1].classList.toggle('tf-img--active',  showSecond);
  };

  window.addEventListener('scroll', updateTF, { passive: true });
  updateTF();
}

/* ============================================================
   FORM — basic submit handler (replace with real endpoint)
   ============================================================ */
const form = document.querySelector('.form');

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('[type="submit"]');
  btn.textContent = 'Sent!';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    form.reset();
  }, 3000);
});
