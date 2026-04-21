/* ============================================================
   SMOOTH SCROLL — Lenis
   ============================================================ */
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/* Smooth-scroll anchor links through Lenis */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      lenis.scrollTo(target);
    }
  });
});

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

   Thresholds > 0 so nothing is visible the moment the sticky
   panel first locks. Progress is NOT clamped from below, so
   negative values (section still below viewport) keep all lines
   hidden. Upper clamp at 1 keeps all lines visible once the
   section is fully scrolled past.
   ============================================================ */
const statsSection = document.querySelector('.stats-scroll');
const statsLines = document.querySelectorAll('.stats__line');

if (statsSection && statsLines.length) {
  const thresholds = [0.1, 0.4, 0.7];

  const revealStats = () => {
    const rect = statsSection.getBoundingClientRect();
    const scrolled = -rect.top;
    const max = statsSection.offsetHeight - window.innerHeight;
    const progress = Math.min(1, scrolled / max); // no lower clamp — negative = hidden

    statsLines.forEach((line, i) => {
      line.classList.toggle('visible', progress >= thresholds[i]);
    });
  };

  window.addEventListener('scroll', revealStats, { passive: true });
  revealStats();
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
