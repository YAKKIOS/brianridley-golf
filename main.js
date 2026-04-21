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
    const m = Math.round(MAX * (1 - eased));
    svcSection.style.marginInline = `${m}px`;
    svcSection.style.borderRadius = `${m}px ${m}px 0 0`;
  };

  window.addEventListener('scroll', animateServices, { passive: true });
  window.addEventListener('resize', animateServices);
  animateServices();
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
