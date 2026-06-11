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
   6. PRICING TOGGLE
   ============================================================ */
(function initPricing() {
  const toggleBtns   = document.querySelectorAll('.pricing-toggle .btn');
  const pricingCard  = document.querySelector('.pricing-card');
  const titleEl      = document.getElementById('pricingTitle');
  const subtitleEl   = document.getElementById('pricingSubtitle');
  const priceEl      = document.getElementById('pricingPrice');
  const descEl       = document.getElementById('pricingDesc');
  const listEl       = document.getElementById('pricingList');

  if (!toggleBtns.length || !pricingCard) return;

  const plans = {
    '4hr': {
      title:    'Focused Coaching Block',
      subtitle: '4 hours of one-to-one coaching',
      price:    '£320',
      desc:     'The perfect starting point. Brian begins with a full game assessment before building a structured programme across your sessions. You\'ll leave each one with clear, actionable drills to practise between visits.',
      features: [
        'Full swing &amp; game assessment',
        'Personalised practice plan',
        'Video analysis every session',
        'Trackman launch monitor data',
        'Session notes &amp; drill guide'
      ]
    },
    '10hr': {
      title:    'Elite Coaching Programme',
      subtitle: '10 hours of one-to-one coaching — best value',
      price:    '£750',
      desc:     'The complete transformation package. Ten hours gives Brian the time to address root causes, rebuild habits and measure your progress against real benchmarks. Includes an on-course playing lesson and ongoing support.',
      features: [
        'Everything in the 4-hour block',
        'Full game deep-dive analysis',
        'On-course playing lesson included',
        'Mental game coaching sessions',
        'Unlimited email &amp; WhatsApp support',
        'Progress report at 5 &amp; 10 hours'
      ]
    }
  };

  function buildList(features) {
    return features.map(function (f) {
      return '<li><span class="material-icons-round">check_circle</span>' + f + '</li>';
    }).join('');
  }

  function switchPlan(planKey) {
    const plan = plans[planKey];
    if (!plan) return;

    pricingCard.classList.add('transitioning');

    setTimeout(function () {
      titleEl.textContent    = plan.title;
      subtitleEl.textContent = plan.subtitle;
      priceEl.innerHTML      = plan.price;
      descEl.textContent     = plan.desc;
      listEl.innerHTML       = buildList(plan.features);
      pricingCard.classList.remove('transitioning');
    }, 200);
  }

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      switchPlan(btn.dataset.plan);
    });
  });
})();


/* ============================================================
   7. FAQ ACCORDION — one open at a time
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
   7b. SERVICES — timed accordion with image swap
   ============================================================ */
(function initServices() {
  const items    = document.querySelectorAll('.service-item');
  const images   = document.querySelectorAll('.services-img');
  const DURATION = 8000;
  let current    = 0;
  let timer      = null;

  if (!items.length) return;

  function goTo(index) {
    const prev = items[current];
    const next = items[index];

    prev.classList.remove('active');
    prev.querySelector('.service-item__trigger').setAttribute('aria-expanded', 'false');

    images.forEach(function (img) { img.classList.remove('active'); });

    next.classList.add('active');
    next.querySelector('.service-item__trigger').setAttribute('aria-expanded', 'true');

    const bar = next.querySelector('.service-item__progress-bar');
    bar.style.animation = 'none';
    bar.offsetHeight;
    bar.style.animation = '';

    const img = document.querySelector('.services-img[data-index="' + index + '"]');
    if (img) img.classList.add('active');

    current = index;

    clearTimeout(timer);
    timer = setTimeout(function () {
      goTo((current + 1) % items.length);
    }, DURATION);
  }

  items.forEach(function (item, i) {
    item.querySelector('.service-item__trigger').addEventListener('click', function () {
      if (i !== current) goTo(i);
    });
  });

  goTo(0);
})();


/* ============================================================
   8. TESTIMONIALS — infinite drag, snap-to-slide
   ============================================================ */
(function initTestimonials() {
  const viewport = document.querySelector('.testimonials__viewport');
  const track    = document.getElementById('testimonialsTrack');
  if (!track || !viewport) return;

  /* Clone originals for seamless infinite loop */
  Array.from(track.children).forEach(function (item) {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let posX      = 0;
  let startX    = 0;
  let startPosX = 0;
  let isDragging = false;
  let velocity  = 0;
  let lastX     = 0;
  let loopWidth = 0;

  function getLoopWidth() {
    if (!loopWidth) loopWidth = track.scrollWidth / 2;
    return loopWidth;
  }

  window.addEventListener('resize', function () { loopWidth = 0; }, { passive: true });

  /* Map posX to canonical range (-W, 0].
     Special-case 0 so we don't flip to -W on exact boundaries. */
  function normalise(x) {
    const W = getLoopWidth();
    const n = ((x % W) + W) % W;
    return n === 0 ? 0 : n - W;
  }

  function setPos(x) {
    posX = normalise(x);
    track.style.transform = 'translateX(' + posX + 'px)';
  }

  /* After releasing, snap posX to the nearest slide boundary */
  function snap() {
    const slideWidth = track.children[0].offsetWidth;
    const gap        = parseFloat(getComputedStyle(track).gap) || 0;
    const unit       = slideWidth + gap;

    /* Pick next or prev slide based on velocity direction; round otherwise */
    let idx = -posX / unit;
    if (velocity < -1.5)     idx = Math.ceil(idx);
    else if (velocity > 1.5) idx = Math.floor(idx);
    else                     idx = Math.round(idx);

    const target = -idx * unit;

    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    posX = target;
    track.style.transform = 'translateX(' + target + 'px)';

    /* Once animation ends, normalise back to canonical position (no visual jump) */
    track.addEventListener('transitionend', function () {
      track.style.transition = '';
      posX = normalise(posX);
      track.style.transform = 'translateX(' + posX + 'px)';
    }, { once: true });
  }

  /* — Mouse — */
  viewport.addEventListener('mousedown', function (e) {
    isDragging = true;
    startX     = e.clientX;
    startPosX  = posX;
    lastX      = e.clientX;
    velocity   = 0;
    track.style.transition = '';
    e.preventDefault();
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    velocity = e.clientX - lastX;
    lastX    = e.clientX;
    setPos(startPosX + (e.clientX - startX));
  });

  window.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    snap();
  });

  /* — Touch — */
  viewport.addEventListener('touchstart', function (e) {
    startX     = e.touches[0].clientX;
    startPosX  = posX;
    lastX      = e.touches[0].clientX;
    velocity   = 0;
    track.style.transition = '';
  }, { passive: true });

  viewport.addEventListener('touchmove', function (e) {
    velocity = e.touches[0].clientX - lastX;
    lastX    = e.touches[0].clientX;
    setPos(startPosX + (e.touches[0].clientX - startX));
  }, { passive: true });

  viewport.addEventListener('touchend', function () {
    snap();
  });
})();


/* ============================================================
   9. HOW IT WORKS — animated timeline line
   ============================================================ */
(function initHowItWorks() {
  const section  = document.getElementById('how-it-works');
  if (!section) return;

  const steps    = section.querySelectorAll('.how__step');
  const lineFill = section.querySelector('.how__line-fill');
  let animated   = false;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !animated) {
        animated = true;
        runAnimation();
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.35 });

  observer.observe(section);

  function runAnimation() {
    if (!lineFill) return;

    // Line fills from 0 → 100% over 9s
    lineFill.style.transition = 'width 9s linear';
    requestAnimationFrame(function () {
      lineFill.style.width = '100%';
    });

    // Activate step 2 at 3s (line at ~33%)
    setTimeout(function () {
      steps[1] && steps[1].classList.add('how__step--active');
    }, 3000);

    // Activate step 3 at 6s (line at ~66%)
    setTimeout(function () {
      steps[2] && steps[2].classList.add('how__step--active');
    }, 6000);
  }
})();


/* ============================================================
   10. SMOOTH SCROLL — enhanced anchor navigation
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
