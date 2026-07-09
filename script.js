/* =========================================================
   VELVET CRUMBS BAKERY — PREMIUM MOTION SCRIPT
   ========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  initNav();
  initScrollProgress();
  initScrollSpy();
  initCounters();
  initQuoteCarousel();
  initScrollCue();
  initDragGallery();
  initMenuTabs();
  initQuickView();
  initLightbox();
  initOrderForm();
  initScrollTop();
  initProcess();
  initLiveStatus();
  if (!reduceMotion) {
    initHeroExit();
    initCrumbBurst();
  }

  if (!reduceMotion && !isTouch) {
    initMagnetic();
  }
  if (!reduceMotion) {
    initParallax();
    initHeroMouseParallax();
  }

  // Split lines need final font metrics before measuring line wraps.
  document.fonts.ready.then(() => {
    buildSplitLines();
    runPreloader(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('ready');
      // Reveal hero heading immediately; everything else on scroll.
      const heroSplit = document.querySelector('#hero .split');
      if (heroSplit) heroSplit.classList.add('in-view');
      initReveals();
      startViewportWatch();
    });
  });
});

/* ---------------- VIEWPORT WATCHER ----------------
   Rect-based enter-viewport triggers on scroll + timer.
   (IntersectionObserver and rAF are throttled to nothing in
   background/occluded windows — this keeps reveals reliable.) */
const _watchers = [];
function watchViewport(el, cb, margin = 0.08) {
  _watchers.push({ el, cb, margin });
}
function checkWatchers() {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  for (let i = _watchers.length - 1; i >= 0; i--) {
    const { el, cb, margin } = _watchers[i];
    const r = el.getBoundingClientRect();
    // Trigger once the element reaches the reveal line — including elements
    // already scrolled past (fast scrolls can jump straight over them).
    if (r.top < vh * (1 - margin)) {
      _watchers.splice(i, 1);
      cb(el);
    }
  }
}
let _lastCheck = 0;
function startViewportWatch() {
  const onScroll = () => {
    const now = performance.now();
    if (now - _lastCheck > 80) {
      _lastCheck = now;
      checkWatchers();
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  setInterval(checkWatchers, 400);
  checkWatchers();
}

/* ---------------- PRELOADER ---------------- */
function runPreloader(done) {
  const pre = document.getElementById('preloader');
  const word = document.getElementById('preWord');
  const bar = document.getElementById('preBar');

  if (reduceMotion || !pre) {
    if (pre) pre.remove();
    done();
    return;
  }

  // Wrap each letter for the stagger-in.
  const text = word.textContent;
  word.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ltr';
    s.innerHTML = ch === ' ' || ch === ' ' ? '&nbsp;' : ch;
    s.style.transitionDelay = `${i * 45}ms`;
    word.appendChild(s);
  });

  requestAnimationFrame(() => {
    word.classList.add('in');
    bar.style.width = '55%';
  });

  const MIN_SHOW = 1400;
  const start = performance.now();
  const finish = () => {
    const wait = Math.max(0, MIN_SHOW - (performance.now() - start));
    setTimeout(() => {
      bar.style.width = '100%';
      setTimeout(() => {
        pre.classList.add('done');
        done();
      }, 350);
    }, wait);
  };

  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
}

/* ---------------- SPLIT HEADINGS INTO MASKED LINES ---------------- */
function buildSplitLines() {
  document.querySelectorAll('[data-split]').forEach(el => {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.textContent = '';
    const spans = words.map(w => {
      const s = document.createElement('span');
      s.textContent = w + ' ';
      s.style.display = 'inline-block';
      el.appendChild(s);
      return s;
    });

    // Group words into visual lines by their rendered offsetTop.
    const lines = [];
    let currentTop = null;
    spans.forEach(s => {
      if (s.offsetTop !== currentTop) {
        currentTop = s.offsetTop;
        lines.push([]);
      }
      lines[lines.length - 1].push(s.textContent);
    });

    el.textContent = '';
    lines.forEach((lineWords, i) => {
      const line = document.createElement('span');
      line.className = 'split-line';
      const inner = document.createElement('span');
      inner.textContent = lineWords.join('');
      inner.style.transitionDelay = `${i * 110}ms`;
      line.appendChild(inner);
      el.appendChild(line);
    });
  });

  // Non-hero splits reveal when scrolled into view.
  document.querySelectorAll('.split:not(#hero .split)').forEach(el => {
    watchViewport(el, () => el.classList.add('in-view'), 0.12);
  });
}

/* ---------------- MAGNETIC BUTTONS ---------------- */
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });
}

/* ---------------- NAV ---------------- */
function initNav() {
  const nav = document.getElementById('siteNav');
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', false);
  }));
}

/* ---------------- SCROLLSPY ---------------- */
function initScrollSpy() {
  const pairs = [];
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) pairs.push([target, a]);
  });

  const update = () => {
    const probe = window.innerHeight * 0.45;
    let current = null;
    pairs.forEach(([section, link]) => {
      const r = section.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) current = link;
    });
    pairs.forEach(([, link]) => link.classList.toggle('active', link === current));
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------------- SCROLL PROGRESS ---------------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollBar');
  const update = () => {
    const h = document.documentElement;
    const height = h.scrollHeight - h.clientHeight;
    bar.style.width = `${height > 0 ? (h.scrollTop / height) * 100 : 0}%`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

/* ---------------- SCROLL REVEALS ---------------- */
function initReveals() {
  const groups = new Map();
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(list => list.forEach((el, i) => {
    el.style.transitionDelay = `${i * 90}ms`;
  }));

  document.querySelectorAll('.reveal').forEach(el => {
    watchViewport(el, () => el.classList.add('in-view'));
  });
  document.querySelectorAll('[data-mask]').forEach(el => {
    watchViewport(el, () => el.classList.add('is-open'), 0.15);
  });
}

/* ---------------- COUNT-UP STATS ---------------- */
function initCounters() {
  const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1400;
    const start = performance.now();
    let safety; // rAF stalls in occluded windows; timer guarantees the final value
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * easeOutExpo(progress));
      if (progress < 1) requestAnimationFrame(step);
      else clearTimeout(safety);
    };
    safety = setTimeout(() => { el.textContent = target; }, duration + 400);
    requestAnimationFrame(step);
  };

  document.querySelectorAll('[data-count]').forEach(el => {
    watchViewport(el, animate, 0.2);
  });
}

/* ---------------- SCROLL PARALLAX ---------------- */
function initParallax() {
  const layers = Array.from(document.querySelectorAll('[data-speed]'));
  if (!layers.length) return;

  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    layers.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0;
      const rect = el.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2) - vh / 2;
      el.style.transform = `translate3d(0, ${(centerOffset * speed * -1).toFixed(1)}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
}

/* ---------------- HERO MOUSE PARALLAX (layered depth) ---------------- */
function initHeroMouseParallax() {
  const hero = document.getElementById('hero');
  if (!hero || isTouch) return;
  const items = hero.querySelectorAll('[data-depth]');

  let mx = 0, my = 0, cx = 0, cy = 0, rafActive = false;

  hero.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!rafActive) { rafActive = true; requestAnimationFrame(tick); }
  });

  function tick() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    items.forEach(el => {
      const d = parseFloat(el.dataset.depth) || 0;
      // `transform` composes with the bob animation's `translate` property;
      // setting inline `translate` would be overridden by the animation.
      let t = `translate3d(${(cx * -22 * d).toFixed(1)}px, ${(cy * -16 * d).toFixed(1)}px, 0)`;
      if (el.hasAttribute('data-tilt3d')) {
        t = `perspective(900px) ${t} rotateY(${(cx * 14).toFixed(1)}deg) rotateX(${(cy * -10).toFixed(1)}deg)`;
      }
      el.style.transform = t;
    });
    if (Math.abs(mx - cx) > 0.001 || Math.abs(my - cy) > 0.001) {
      requestAnimationFrame(tick);
    } else {
      rafActive = false;
    }
  }
}

/* ---------------- DRAG GALLERY (momentum + skew) ---------------- */
function initDragGallery() {
  const strip = document.getElementById('filmstrip');
  if (!strip) return;

  let isDown = false, startX = 0, startScroll = 0, lastX = 0, vel = 0, momentumId = null;

  const setSkew = (v) => {
    const skew = Math.max(-6, Math.min(6, v * -0.08));
    strip.querySelectorAll('.frame').forEach(f => f.style.setProperty('--skew', `${skew.toFixed(2)}deg`));
  };

  strip.addEventListener('pointerdown', (e) => {
    isDown = true;
    strip.classList.add('dragging');
    startX = lastX = e.clientX;
    startScroll = strip.scrollLeft;
    vel = 0;
    if (momentumId) cancelAnimationFrame(momentumId);
    strip.setPointerCapture(e.pointerId);
  });

  strip.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    strip.scrollLeft = startScroll - dx;
    vel = e.clientX - lastX;
    lastX = e.clientX;
    if (!reduceMotion) setSkew(vel * 4);
  });

  const release = () => {
    if (!isDown) return;
    isDown = false;
    strip.classList.remove('dragging');
    if (reduceMotion) { setSkew(0); return; }
    // Momentum glide
    let v = vel * 3;
    const glide = () => {
      if (Math.abs(v) < 0.5) { setSkew(0); return; }
      strip.scrollLeft -= v;
      setSkew(v);
      v *= 0.94;
      momentumId = requestAnimationFrame(glide);
    };
    glide();
  };
  strip.addEventListener('pointerup', release);
  strip.addEventListener('pointercancel', release);
  strip.addEventListener('mouseleave', release);
}

/* ---------------- TESTIMONIAL CAROUSEL ---------------- */
function initQuoteCarousel() {
  const slides = document.querySelectorAll('[data-quote]');
  const dotsWrap = document.getElementById('quoteDots');
  if (!slides.length || !dotsWrap) return;

  let active = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('is-active');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    dot.setAttribute('data-hover', '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('button');

  function goTo(index) {
    slides[active].classList.remove('is-active');
    dots[active].classList.remove('is-active');
    active = index;
    slides[active].classList.add('is-active');
    dots[active].classList.add('is-active');
    restart();
  }

  function next() { goTo((active + 1) % slides.length); }

  function restart() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }
  restart();
}

/* ---------------- HERO SCROLL EXIT (cinematic pull-away) ---------------- */
function initHeroExit() {
  const bg = document.querySelector('.hero-bg');
  const copy = document.querySelector('.hero-copy');
  if (!bg || !copy) return;
  bg.style.transformOrigin = 'center 30%';

  const update = () => {
    const vh = window.innerHeight;
    if (window.scrollY > vh * 1.2) return;
    const p = Math.min(1, window.scrollY / (vh * 0.9));
    bg.style.transform = `scale(${(1 + p * 0.07).toFixed(4)})`;
    copy.style.transform = `translateY(${(-46 * p).toFixed(1)}px)`;
    copy.style.opacity = String(Math.max(0, 1 - p * 1.15));
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------------- PROCESS SECTION (pinned scroll story) ---------------- */
function initProcess() {
  const section = document.getElementById('process');
  if (!section) return;
  const steps = [...section.querySelectorAll('.process-step')];
  const imgs = [...section.querySelectorAll('.process-media img')];
  const bar = document.getElementById('processBar');

  const update = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height - vh;
    if (total <= 0) return;
    const p = Math.min(1, Math.max(0, -rect.top / total));
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
    steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    imgs.forEach((im, i) => im.classList.toggle('is-active', i === idx));
    if (bar) bar.style.width = `${(p * 100).toFixed(1)}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------------- CRUMB BURST ON BUTTON CLICKS ---------------- */
function initCrumbBurst() {
  const colors = ['#d9a05b', '#b06e3b', '#b96a4e', '#8a5a3b'];
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .nav-cta');
    if (!btn) return;
    const count = 12;
    for (let i = 0; i < count; i++) {
      const bit = document.createElement('span');
      bit.className = 'burst-bit';
      const size = 4 + Math.random() * 6;
      bit.style.left = `${e.clientX}px`;
      bit.style.top = `${e.clientY}px`;
      bit.style.width = `${size}px`;
      bit.style.height = `${size}px`;
      bit.style.background = colors[i % colors.length];
      document.body.appendChild(bit);

      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      const dist = 36 + Math.random() * 60;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist + 24; // slight gravity
      bit.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx.toFixed(0)}px), calc(-50% + ${dy.toFixed(0)}px)) scale(.3)`, opacity: 0 }
      ], {
        duration: 550 + Math.random() * 350,
        easing: 'cubic-bezier(.16,1,.3,1)'
      }).onfinish = () => bit.remove();
    }
  });
}

/* ---------------- LIVE OPEN/CLOSED STATUS ---------------- */
function initLiveStatus() {
  const pill = document.getElementById('liveStatus');
  if (!pill) return;
  const label = pill.querySelector('span');
  const now = new Date();
  const day = now.getDay(); // 0 Sun … 6 Sat
  const hour = now.getHours() + now.getMinutes() / 60;

  let open = false, msg;
  if (day === 1) {
    msg = 'Closed Mondays — back tomorrow from 7am';
  } else if (day >= 2 && day <= 5) {
    open = hour >= 7 && hour < 18;
    msg = open ? "Open now — today's bake is out of the oven"
        : hour < 7 ? 'Opens 7am — first bake lands warm'
        : 'Closed for today — back tomorrow 7am';
  } else {
    open = hour >= 8 && hour < 16;
    msg = open ? "Open now — today's bake is out of the oven"
        : hour < 8 ? 'Opens 8am — first bake lands warm'
        : day === 6 ? 'Closed for today — back tomorrow 8am'
        : 'Closed for today — back Tuesday 7am';
  }
  pill.classList.toggle('is-open', open);
  label.textContent = msg;
}

/* ---------------- HERO SCROLL CUE ---------------- */
function initScrollCue() {
  const cue = document.getElementById('scrollCue');
  if (!cue) return;
  cue.addEventListener('click', () => {
    document.getElementById('story').scrollIntoView({ behavior: 'smooth' });
  });
  window.addEventListener('scroll', () => {
    cue.style.opacity = window.scrollY > 120 ? '0' : '1';
  }, { passive: true });
}

/* ---------------- MENU TABS ---------------- */
function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => {
      t.classList.toggle('is-active', t === tab);
      t.setAttribute('aria-selected', t === tab);
    });
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab));
  }));
}

/* ---------------- QUICK-VIEW MODAL ---------------- */
function initQuickView() {
  const modal = document.getElementById('quickView');
  if (!modal) return;
  const img = document.getElementById('qvImg');
  const name = document.getElementById('qvName');
  const desc = document.getElementById('qvDesc');
  const allergens = document.getElementById('qvAllergens');
  const price = document.getElementById('qvPrice');
  let lastFocus = null;

  const open = (card) => {
    img.src = card.dataset.img;
    img.alt = card.dataset.name;
    name.textContent = card.dataset.name;
    desc.textContent = card.dataset.desc;
    allergens.textContent = card.dataset.allergens;
    price.textContent = card.dataset.price;
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  };
  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll('[data-item]').forEach(card => {
    card.addEventListener('click', () => open(card));
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
    });
  });
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
}

/* ---------------- GALLERY LIGHTBOX (drag-aware) ---------------- */
function initLightbox() {
  const box = document.getElementById('lightbox');
  const strip = document.getElementById('filmstrip');
  if (!box || !strip) return;
  const imgEl = document.getElementById('lbImg');
  const frames = [...strip.querySelectorAll('.frame img')];
  let index = 0;
  let downX = 0, downY = 0;

  const show = (i) => {
    index = (i + frames.length) % frames.length;
    imgEl.src = frames[index].src;
    imgEl.alt = frames[index].alt;
  };
  const open = (i) => {
    show(i);
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Only open when the pointer barely moved — a real click, not a drag.
  strip.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
  strip.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return;
    const frame = e.target.closest('.frame');
    if (!frame) return;
    const i = [...strip.querySelectorAll('.frame')].indexOf(frame);
    if (i > -1) open(i);
  });

  document.getElementById('lbPrev').addEventListener('click', () => show(index - 1));
  document.getElementById('lbNext').addEventListener('click', () => show(index + 1));
  box.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
}

/* ---------------- ORDER FORM ---------------- */
function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;
  const success = document.getElementById('orderSuccess');
  const summary = document.getElementById('successSummary');
  const waSuccess = document.getElementById('successWhatsApp');
  const waLive = document.getElementById('orderWhatsApp');

  // Pickup date can't be in the past.
  const dateInput = form.querySelector('#ofDate');
  dateInput.min = new Date().toISOString().split('T')[0];

  const validators = {
    name: v => v.trim().length >= 2 || 'Please tell us your name.',
    phone: v => /^[\d\s()+\-.]{7,}$/.test(v.trim()) || 'Enter a valid phone number.',
    item: v => !!v || 'Pick something delicious.',
    date: v => {
      if (!v) return 'Choose a pickup date.';
      return v >= dateInput.min || 'Pickup date can\'t be in the past.';
    }
  };

  const validateField = (input) => {
    const rule = validators[input.name];
    if (!rule) return true;
    const result = rule(input.value);
    const field = input.closest('.form-field');
    const errEl = field.querySelector('.field-error');
    if (result !== true) {
      field.classList.add('has-error');
      errEl.textContent = result;
      return false;
    }
    field.classList.remove('has-error');
    errEl.textContent = '';
    return true;
  };

  form.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.form-field').classList.contains('has-error')) validateField(input);
    });
  });

  const buildWaLink = (data) => {
    const msg = `Hi Velvet Crumbs! I'd like to order: ${data.item}` +
      ` for pickup on ${data.date}. Name: ${data.name}, phone: ${data.phone}.` +
      (data.notes ? ` Notes: ${data.notes}` : '');
    return `https://wa.me/15551234567?text=${encodeURIComponent(msg)}`;
  };

  // Keep the live WhatsApp button in sync as the form is filled.
  form.addEventListener('input', () => {
    const data = Object.fromEntries(new FormData(form));
    if (data.item || data.name) waLive.href = buildWaLink(data);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('input[required], select[required]')];
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) {
      form.querySelector('.has-error input, .has-error select')?.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    summary.textContent = `${data.item} for pickup on ${data.date}. ` +
      `We'll call ${data.phone} to confirm — usually within the hour.`;
    waSuccess.href = buildWaLink(data);
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('orderAgain').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ---------------- SCROLL TO TOP ---------------- */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 700);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
