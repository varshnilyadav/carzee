/* ============================================================
   CARZEE — script.js
   All interactive JS: Nav, Scroll Animations, Marquee,
   Testimonials Carousel, Before/After Slider, Booking Form
   ============================================================ */

'use strict';

/* ═══════════════════════════════════════════════════════════
   0. PRELOADER — dismiss when fonts + page are ready
═══════════════════════════════════════════════════════════ */
(function initPreloader() {
  const loader = document.getElementById('carzee-preloader');
  if (!loader) return;

  /* Minimum display time so the animation completes */
  const MIN_MS = 2800;
  const startTime = Date.now();

  function dismiss() {
    const elapsed  = Date.now() - startTime;
    const remaining = Math.max(0, MIN_MS - elapsed);
    setTimeout(() => {
      loader.classList.add('hidden');
      /* Re-enable body scroll and trigger page-load opacity */
      document.body.style.opacity = '1';
      /* Remove from DOM after transition ends */
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, remaining);
  }

  /* Dismiss once page is fully loaded (fonts, images, etc.) */
  if (document.readyState === 'complete') {
    dismiss();
  } else {
    window.addEventListener('load', dismiss);
    /* Fallback: dismiss after 4.5s no matter what */
    setTimeout(dismiss, 4500);
  }
})();



/* ─── HELPER: DOM QUERY ───────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ═══════════════════════════════════════════════════════════
   1. STICKY NAVBAR
═══════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar   = $('#navbar');
  const toggle   = $('#nav-toggle');
  const navLinks = $('#nav-links');
  if (!navbar) return;

  /* Scroll → solid background */
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile hamburger */
  toggle && toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close on link click */
  $$('.nav-link, .btn-nav-cta', navLinks).forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle && toggle.classList.remove('open');
      toggle && toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Active link highlight on scroll */
  const sections  = $$('section[id]');
  const navItems  = $$('.nav-link[href^="#"]');
  const activateLink = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navItems.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', activateLink, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════
   2. SCROLL REVEAL ANIMATIONS
═══════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const items = $$('[data-animate]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('is-visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════
   3. COUNTER ANIMATION (Hero stats)
═══════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el, target, duration = 2000) => {
    const start = performance.now();
    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      animateCounter(el, target);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════════════
   4. BRANDS MARQUEE — Pause on hover
═══════════════════════════════════════════════════════════ */
(function initMarquee() {
  $$('.brands-marquee').forEach(marquee => {
    marquee.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    marquee.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   5. BEFORE / AFTER COMPARISON SLIDER
═══════════════════════════════════════════════════════════ */
(function initComparisonSlider() {
  const slider = $('#comparison-slider');
  if (!slider) return;

  const after  = slider.querySelector('.comparison-after');
  const handle = slider.querySelector('.comparison-handle');
  let isDragging = false;

  const setPosition = (clientX) => {
    const rect = slider.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(5, Math.min(95, pct));
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = `${pct}%`;
  };

  /* Mouse */
  slider.addEventListener('mousedown', e => { isDragging = true; setPosition(e.clientX); });
  window.addEventListener('mousemove', e => { if (isDragging) setPosition(e.clientX); });
  window.addEventListener('mouseup',   () => { isDragging = false; });

  /* Touch */
  slider.addEventListener('touchstart', e => {
    isDragging = true;
    setPosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (isDragging) setPosition(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  /* Initial position: 50% */
  setPosition(slider.getBoundingClientRect().left + slider.offsetWidth / 2);
})();

/* ═══════════════════════════════════════════════════════════
   6. TESTIMONIALS CAROUSEL
═══════════════════════════════════════════════════════════ */
(function initTestimonials() {
  const track   = $('#testimonials-track');
  const prevBtn = $('#t-prev');
  const nextBtn = $('#t-next');
  const dotsEl  = $('#t-dots');
  if (!track) return;

  const cards      = $$('.testimonial-card', track);
  const total      = cards.length;
  let current      = 0;
  let autoTimer    = null;
  let perView      = getPerView();

  function getPerView() {
    if (window.innerWidth < 640)  return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  const maxIndex = () => Math.max(0, total - perView);

  /* Build dots */
  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 't-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    }
  }

  function updateDots() {
    $$('.t-dot', dotsEl).forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardWidth = cards[0].offsetWidth + 24; // gap = 24px
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  }

  prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  /* Auto-slide */
  function startAuto() {
    autoTimer = setInterval(() => {
      const next = current >= maxIndex() ? 0 : current + 1;
      goTo(next);
    }, 4500);
  }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  /* Touch swipe on track */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goTo(current + 1) : goTo(current - 1); resetAuto(); }
  });

  /* Init */
  buildDots();
  goTo(0);
  startAuto();

  window.addEventListener('resize', () => {
    perView = getPerView();
    buildDots();
    goTo(Math.min(current, maxIndex()));
  });
})();

/* ═══════════════════════════════════════════════════════════
   7. BOOKING FORM → WhatsApp
═══════════════════════════════════════════════════════════ */
(function initBookingForm() {
  const form = $('#booking-form');
  if (!form) return;

  /* Set min date to today */
  const dateInput = $('#b-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name    = ($('#b-name')    || {}).value?.trim() || '';
    const phone   = ($('#b-phone')   || {}).value?.trim() || '';
    const vehicle = ($('#b-vehicle') || {}).value?.trim() || '';
    const date    = ($('#b-date')    || {}).value || '';
    const service = ($('#b-service') || {}).value || '';

    if (!name || !phone || !vehicle || !date || !service) {
      showFormMessage('Please fill in all fields before submitting.', 'error');
      return;
    }

    const formattedDate = date
      ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Not specified';

    const msg = encodeURIComponent(
      `Hi CARZEE! 🚗\n\n` +
      `I'd like to book a service:\n\n` +
      `👤 *Name:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `🚘 *Vehicle:* ${vehicle}\n` +
      `📅 *Date:* ${formattedDate}\n` +
      `🔧 *Service:* ${service}\n\n` +
      `Please confirm my slot. Thank you!`
    );

    /* Replace with actual WhatsApp number */
    const waNumber = '91XXXXXXXXXX';
    window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank', 'noopener,noreferrer');
    showFormMessage('Redirecting to WhatsApp... We\'ll confirm your slot shortly! ✅', 'success');
    form.reset();
  });

  function showFormMessage(text, type) {
    let msg = form.querySelector('.form-message');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'form-message';
      msg.style.cssText = `
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 0.9rem;
        margin-top: 4px;
        font-family: Inter, sans-serif;
        transition: opacity 0.3s;
      `;
      form.appendChild(msg);
    }
    msg.textContent  = text;
    msg.style.background = type === 'success' ? 'rgba(57,211,83,0.12)' : 'rgba(255,80,80,0.12)';
    msg.style.border     = `1px solid ${type === 'success' ? 'rgba(57,211,83,0.3)' : 'rgba(255,80,80,0.3)'}`;
    msg.style.color      = type === 'success' ? '#39d353' : '#ff6b6b';
    msg.style.opacity    = '1';
    setTimeout(() => { msg.style.opacity = '0'; }, 5000);
  }
})();

/* ═══════════════════════════════════════════════════════════
   8. SMOOTH SCROLL for anchor links
═══════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const targetId = link.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (!target) return;
    e.preventDefault();
    const offset = 80; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ═══════════════════════════════════════════════════════════
   9. GALLERY — Lightbox (simple)
═══════════════════════════════════════════════════════════ */
(function initGalleryLightbox() {
  const items = $$('.gallery-item');
  if (!items.length) return;

  /* Build lightbox */
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.style.cssText = `
    display:none; position:fixed; inset:0; z-index:99999;
    background:rgba(0,0,0,0.92); backdrop-filter:blur(8px);
    align-items:center; justify-content:center; cursor:zoom-out;
  `;
  const lbImg = document.createElement('img');
  lbImg.style.cssText = `
    max-width:90vw; max-height:90vh; border-radius:8px;
    box-shadow:0 20px 80px rgba(0,0,0,0.9);
    animation: lbFadeIn 0.3s ease;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes lbFadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
    #lightbox { display:none; }
    #lightbox.open { display:flex !important; }
  `;
  document.head.appendChild(style);

  lb.appendChild(lbImg);
  document.body.appendChild(lb);

  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      const alt = item.querySelector('img')?.alt || 'CARZEE Gallery';
      if (!src) return;
      lbImg.src = src;
      lbImg.alt = alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  lb.addEventListener('click', () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

/* ═══════════════════════════════════════════════════════════
   10. FLOATING BUTTONS — hover scale (already in CSS)
       + show/hide sticky book-now based on scroll
═══════════════════════════════════════════════════════════ */
(function initFloatingUX() {
  const stickyBook = $('.sticky-book-now');
  if (!stickyBook) return;
  let visible = false;

  window.addEventListener('scroll', () => {
    const shouldShow = window.scrollY > 400;
    if (shouldShow !== visible) {
      visible = shouldShow;
      stickyBook.style.opacity = visible ? '1' : '0';
      stickyBook.style.transform = visible ? 'translateY(0)' : 'translateY(20px)';
    }
  }, { passive: true });

  Object.assign(stickyBook.style, {
    opacity: '0',
    transform: 'translateY(20px)',
    transition: 'opacity 0.4s ease, transform 0.4s ease',
  });
})();

/* ═══════════════════════════════════════════════════════════
   11. CARD TILT EFFECT (desktop only)
═══════════════════════════════════════════════════════════ */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on mobile

  $$('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   12. PAGE LOAD — Remove initial load blur (nice touch)
═══════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  document.body.style.transition = 'opacity 0.4s ease';
  document.body.style.opacity    = '1';
});
/* Make body invisible until loaded */
document.body.style.opacity = '0';
