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
    if (window.scrollY > 80) {
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
   5. VIDEO CAROUSEL — infinite drag, momentum-based
   ============================================================ */
(function initCarousel() {
  const wrapper = document.querySelector('.carousel-wrapper');
  const track   = document.getElementById('carouselTrack');
  if (!track || !wrapper) return;

  /* — Clone originals for seamless looping — */
  const originals = Array.from(track.children);
  originals.forEach(function (card) {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let posX       = 0;
  let startX     = 0;
  let startPosX  = 0;
  let isDragging = false;
  let velocity   = 0;
  let lastX      = 0;
  let rafId      = null;
  let hasDragged = false;
  let loopWidth  = 0; // computed lazily after first render

  function getLoopWidth() {
    // Half of total scrollWidth = width of one full set of originals
    if (!loopWidth) loopWidth = track.scrollWidth / 2;
    return loopWidth;
  }

  window.addEventListener('resize', function () {
    loopWidth = 0; // recompute on next use
  }, { passive: true });

  /* Normalise posX so it always stays within one loop width.
     This is the infinite seam — when we cross the boundary we
     jump instantly (no transition) to the equivalent position
     in the original set, which looks identical visually. */
  function normalise(x) {
    const W = getLoopWidth();
    // Map x into the range (-W, 0]
    x = ((x % W) + W) % W; // to [0, W)
    x -= W;                  // to (-W, 0]
    return x;
  }

  function setPos(newX) {
    posX = normalise(newX);
    track.style.transform = 'translateX(' + posX + 'px)';
  }

  function momentum() {
    if (Math.abs(velocity) < 0.5) return;
    setPos(posX + velocity);
    velocity *= 0.94;
    rafId = requestAnimationFrame(momentum);
  }

  /* — Mouse — */
  wrapper.addEventListener('mousedown', function (e) {
    isDragging = true;
    hasDragged = false;
    startX     = e.clientX;
    startPosX  = posX;
    lastX      = e.clientX;
    velocity   = 0;
    cancelAnimationFrame(rafId);
    e.preventDefault();
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) hasDragged = true;
    velocity = e.clientX - lastX;
    lastX    = e.clientX;
    setPos(startPosX + dx);
  });

  window.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    momentum();
  });

  /* — Touch — */
  wrapper.addEventListener('touchstart', function (e) {
    hasDragged = false;
    startX     = e.touches[0].clientX;
    startPosX  = posX;
    lastX      = e.touches[0].clientX;
    velocity   = 0;
    cancelAnimationFrame(rafId);
  }, { passive: true });

  wrapper.addEventListener('touchmove', function (e) {
    const dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 4) hasDragged = true;
    velocity = e.touches[0].clientX - lastX;
    lastX    = e.touches[0].clientX;
    setPos(startPosX + dx);
  }, { passive: true });

  wrapper.addEventListener('touchend', function () {
    momentum();
  });

  /* — Play on click (not drag) — */
  wrapper.addEventListener('click', function (e) {
    if (hasDragged) return;
    const playBtn = e.target.closest('.carousel-play');
    if (playBtn) {
      toggleVideo(playBtn.closest('.carousel-card'));
      return;
    }
    // Click on a playing card pauses it
    const card = e.target.closest('.carousel-card.is-playing');
    if (card) toggleVideo(card);
  });

  /* — Hover to preview on desktop — */
  wrapper.addEventListener('mouseenter', function (e) {
    const card = e.target.closest('.carousel-card[data-type="video"]');
    if (card && !card.classList.contains('is-playing')) playVideo(card);
  }, true);

  wrapper.addEventListener('mouseleave', function (e) {
    const card = e.target.closest('.carousel-card[data-type="video"]');
    if (card && !card.classList.contains('is-playing-clicked')) pauseVideo(card);
  }, true);

  function playVideo(card) {
    if (!card) return;
    const video = card.querySelector('video');
    if (!video) return;
    video.muted = true;
    video.play().catch(function () {});
    card.classList.add('is-playing');
  }

  function pauseVideo(card) {
    if (!card) return;
    const video = card.querySelector('video');
    if (!video) return;
    video.pause();
    card.classList.remove('is-playing');
  }

  function toggleVideo(card) {
    if (!card) return;
    if (card.classList.contains('is-playing-clicked')) {
      // User-clicked play → pause
      card.classList.remove('is-playing-clicked');
      pauseVideo(card);
    } else {
      // First click — play with sound
      const video = card.querySelector('video');
      if (!video) return;
      video.muted = false;
      video.play().catch(function () { video.muted = true; video.play(); });
      card.classList.add('is-playing', 'is-playing-clicked');
    }
  }
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
