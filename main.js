/* ============================================================
   BRIAN RIDLEY GOLF — MAIN JS
   ============================================================ */

/* ============================================================
   1. NAVBAR — scroll-triggered background
   ============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ============================================================
   2. HAMBURGER — mobile nav toggle
   ============================================================ */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ============================================================
   3. FADE-IN — IntersectionObserver
   ============================================================ */
(function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ============================================================
   4. MEDIA GRID — rows shift opposite directions as you scroll
   ============================================================ */
(function initMediaGrid() {
  const section = document.getElementById('videos');
  const row1    = document.getElementById('mediaRow1');
  const row2    = document.getElementById('mediaRow2');
  if (!section || !row1 || !row2) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const RANGE = 220; // max px each row shifts in either direction
  let ticking = false;

  function update() {
    ticking = false;
    const rect  = section.getBoundingClientRect();
    const vh    = window.innerHeight;
    const total = vh + rect.height;

    // 0 as the section enters from the bottom, 1 as it exits the top
    let progress = (vh - rect.top) / total;
    progress = Math.max(0, Math.min(1, progress));

    const offset = (progress - 0.5) * 2 * RANGE; // -RANGE .. +RANGE

    row1.style.transform = 'translateX(' + offset + 'px)';
    row2.style.transform = 'translateX(' + (-offset) + 'px)';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();


/* ============================================================
   6. FAQ ACCORDION — one open at a time
   ============================================================ */
(function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(function (item) {
    const trigger = item.querySelector('.faq-item__trigger');
    const content = item.querySelector('.faq-item__content');
    if (!trigger || !content) return;

    trigger.addEventListener('click', function () {
      const isOpen = item.classList.contains('is-open');

      items.forEach(function (other) {
        const otherContent = other.querySelector('.faq-item__content');
        other.classList.remove('is-open');
        other.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false');
        if (otherContent) {
          otherContent.style.maxHeight = '0';
          otherContent.hidden = false;
        }
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });

    content.style.maxHeight = '0';
  });
})();


/* ============================================================
   7b. SERVICES — click accordion with image swap
   ============================================================ */
(function initServices() {
  const items   = document.querySelectorAll('.service-item');
  const images  = document.querySelectorAll('.services-img');
  let current   = 0;

  if (!items.length) return;

  function goTo(index) {
    items[current].classList.remove('active');
    items[current].querySelector('.service-item__trigger').setAttribute('aria-expanded', 'false');

    images.forEach(function (img) { img.classList.remove('active'); });

    items[index].classList.add('active');
    items[index].querySelector('.service-item__trigger').setAttribute('aria-expanded', 'true');

    const img = document.querySelector('.services-img[data-index="' + index + '"]');
    if (img) img.classList.add('active');

    current = index;
  }

  items.forEach(function (item, i) {
    item.querySelector('.service-item__trigger').addEventListener('click', function () {
      if (i !== current) goTo(i);
    });
  });

  goTo(0);
})();


/* ============================================================
   7. TESTIMONIALS — click-and-drag horizontal rail
   ============================================================ */
(function initTestimonialRail() {
  const rail = document.getElementById('testimonialRail');
  if (!rail) return;

  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  rail.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return; /* touch already scrolls natively */
    isDown = true;
    startX = e.clientX;
    startScroll = rail.scrollLeft;
    rail.classList.add('is-dragging');
    rail.setPointerCapture(e.pointerId);
  });

  rail.addEventListener('pointermove', function (e) {
    if (!isDown) return;
    rail.scrollLeft = startScroll - (e.clientX - startX);
  });

  function stopDrag() {
    isDown = false;
    rail.classList.remove('is-dragging');
  }

  rail.addEventListener('pointerup', stopDrag);
  rail.addEventListener('pointercancel', stopDrag);
})();


/* ============================================================
   8. SMOOTH SCROLL — enhanced anchor navigation
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      const bannerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--banner-h')) * 16;
      const navH    = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) * 16;
      const offset  = bannerH + navH;

      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
})();
