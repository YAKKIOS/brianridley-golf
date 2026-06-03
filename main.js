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
  onScroll(); // run on load in case page is already scrolled
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

  // Close nav when a link is clicked
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
   4. VIDEO CAROUSEL — infinite scroll, clone-based
   ============================================================ */
(function initCarousel() {
  const track   = document.getElementById('carouselTrack');
  const wrapper = track ? track.parentElement : null;
  if (!track || !wrapper) return;

  // Clone all original cards and append → seamless -50% loop
  const originals = Array.from(track.children);
  originals.forEach(function (card) {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  function startVideo(card) {
    if (card.classList.contains('is-playing')) return;
    const iframe = card.querySelector('iframe');
    if (!iframe) return;
    // Load src from data-src on first play
    if (!iframe.src || iframe.src === window.location.href) {
      iframe.src = iframe.dataset.src + '&autoplay=1&mute=1';
    } else if (!iframe.src.includes('autoplay=1')) {
      iframe.src = iframe.src + '&autoplay=1&mute=1';
    }
    card.classList.add('is-playing');
    track.classList.add('paused');
  }

  // Click / tap on play overlay
  wrapper.addEventListener('click', function (e) {
    const playBtn = e.target.closest('.carousel-play');
    if (!playBtn) return;
    startVideo(playBtn.closest('.carousel-card'));
  });

  // Hover to play on pointer devices
  wrapper.addEventListener('mouseover', function (e) {
    const card = e.target.closest('.carousel-card[data-type="video"]');
    if (!card) return;
    startVideo(card);
  });

  // Pause scroll on any hover; resume when leaving
  wrapper.addEventListener('mouseenter', function () {
    track.classList.add('paused');
  });

  wrapper.addEventListener('mouseleave', function () {
    track.classList.remove('paused');
  });

  wrapper.addEventListener('focusin', function () {
    track.classList.add('paused');
  });

  wrapper.addEventListener('focusout', function () {
    track.classList.remove('paused');
  });
})();


/* ============================================================
   5. PRICING TOGGLE
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

    // Brief fade for smooth transition
    pricingCard.classList.add('transitioning');

    setTimeout(function () {
      titleEl.textContent   = plan.title;
      subtitleEl.textContent = plan.subtitle;
      priceEl.innerHTML     = plan.price;
      descEl.textContent    = plan.desc;
      listEl.innerHTML      = buildList(plan.features);
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

      // Close all
      items.forEach(function (other) {
        const otherContent = other.querySelector('.faq-item__content');
        other.classList.remove('is-open');
        other.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false');
        if (otherContent) {
          otherContent.style.maxHeight = '0';
          otherContent.hidden = false; // keep in DOM for transition
        }
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });

    // CSS handles default collapsed state (max-height: 0)
    // Ensure inline style is set so transitions work correctly
    content.style.maxHeight = '0';
  });
})();


/* ============================================================
   6b. SERVICES — timed accordion with image swap
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

    // Deactivate previous
    prev.classList.remove('active');
    prev.querySelector('.service-item__trigger').setAttribute('aria-expanded', 'false');

    // Deactivate all images
    images.forEach(function (img) { img.classList.remove('active'); });

    // Activate new item
    next.classList.add('active');
    next.querySelector('.service-item__trigger').setAttribute('aria-expanded', 'true');

    // Force progress bar animation restart
    const bar = next.querySelector('.service-item__progress-bar');
    bar.style.animation = 'none';
    bar.offsetHeight; // trigger reflow
    bar.style.animation = '';

    // Swap image
    const img = document.querySelector('.services-img[data-index="' + index + '"]');
    if (img) img.classList.add('active');

    current = index;

    // Restart auto-advance timer
    clearTimeout(timer);
    timer = setTimeout(function () {
      goTo((current + 1) % items.length);
    }, DURATION);
  }

  // Click handlers
  items.forEach(function (item, i) {
    item.querySelector('.service-item__trigger').addEventListener('click', function () {
      if (i !== current) goTo(i);
    });
  });

  // Kick off
  goTo(0);
})();


/* ============================================================
   7. TESTIMONIAL SLIDER — prev/next, 2 visible, clips overflow
   ============================================================ */
(function initTestimonialSlider() {
  const track   = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');
  if (!track || !prevBtn || !nextBtn) return;

  const cards      = Array.from(track.children);
  const total      = cards.length;
  let currentIndex = 0;

  function visibleCount() {
    return 1;
  }

  function updateSlider() {
    const visible   = visibleCount();
    const maxIndex  = total - visible;
    const cardWidth = cards[0].offsetWidth;
    const gap       = parseFloat(getComputedStyle(track).gap) || 24;

    // Clamp index in case viewport resized
    if (currentIndex > maxIndex) currentIndex = Math.max(0, maxIndex);

    track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  prevBtn.addEventListener('click', function () {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });

  nextBtn.addEventListener('click', function () {
    const maxIndex = total - visibleCount();
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateSlider();
    }
  });

  window.addEventListener('resize', updateSlider, { passive: true });
  updateSlider();
})();


/* ============================================================
   8. SMOOTH SCROLL — enhanced anchor navigation
      (supplements CSS scroll-behavior: smooth)
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
