/* ============================================================
   BRIAN RIDLEY GOLF — MAIN JS
   ============================================================ */

/* ============================================================
   1. NAVBAR — scroll-triggered background
   ============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hero   = document.getElementById('hero');
  if (!navbar) return;

  /* Delay the flip until the hero has actually scrolled past, not just
     a small fixed distance — so the nav (and its buttons) stay in their
     "over the hero" look until the next section arrives. */
  function getThreshold() {
    return hero ? hero.offsetHeight - navbar.offsetHeight : 80;
  }

  function onScroll() {
    if (window.scrollY > getThreshold()) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
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
   3. BANNER — hide on scroll
   ============================================================ */
(function initBannerHide() {
  const banner = document.querySelector('.banner');
  const navbar = document.getElementById('navbar');
  if (!banner) return;

  let bannerHidden = false;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 10 && !bannerHidden) {
      bannerHidden = true;
      banner.classList.add('banner--hidden');
      navbar && navbar.classList.add('navbar--no-banner');
    } else if (window.scrollY <= 10 && bannerHidden) {
      bannerHidden = false;
      banner.classList.remove('banner--hidden');
      navbar && navbar.classList.remove('navbar--no-banner');
    }
  }, { passive: true });
})();


/* ============================================================
   4. FADE-IN — IntersectionObserver
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
   5. MEDIA GRID — rows shift opposite directions as you scroll
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
   7. TESTIMONIALS — click a name tab to switch testimonial
   ============================================================ */
(function initTestimonials() {
  const tabs   = document.querySelectorAll('.testimonial-tab');
  const panels = document.querySelectorAll('.testimonial-panel');
  const media  = document.querySelectorAll('.testimonial-media');
  if (!tabs.length) return;

  const FADE_MS = 250;
  let switching = false;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const index = tab.dataset.index;
      const nextPanel = Array.prototype.find.call(panels, function (p) { return p.dataset.index === index; });
      const currentPanel = Array.prototype.find.call(panels, function (p) { return !p.hidden; });
      if (switching || !nextPanel || nextPanel === currentPanel) return;
      switching = true;

      tabs.forEach(function (t) {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      media.forEach(function (m) {
        m.classList.toggle('active', m.dataset.index === index);
      });

      /* Crossfade the quote text out, swap it, then fade the new one in */
      currentPanel.classList.add('is-transitioning');

      window.setTimeout(function () {
        currentPanel.hidden = true;
        currentPanel.classList.remove('is-transitioning', 'active');

        nextPanel.hidden = false;
        nextPanel.classList.add('active', 'is-transitioning');
        void nextPanel.offsetWidth; /* force reflow so the fade-in actually transitions */
        nextPanel.classList.remove('is-transitioning');

        switching = false;
      }, FADE_MS);
    });
  });
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

      const bannerHidden = document.querySelector('.banner--hidden');
      const bannerH = bannerHidden ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--banner-h')) * 16;
      const navH    = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) * 16;
      const offset  = bannerH + navH;

      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
})();
