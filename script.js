/* =====================================================================
   THE LEGACY OF OLUWAFEMI PAUL ABATI — SCRIPT
   Vanilla JS. No dependencies.
   ===================================================================== */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===================================================================
     1. CINEMATIC LOADER
     =================================================================== */
  function runLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loader-fill');
    const pct = document.getElementById('loader-pct');
    const site = document.getElementById('site');

    let progress = 0;
    const duration = reduceMotion ? 200 : 2200; // ms
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      progress = Math.min(100, Math.round((elapsed / duration) * 100));
      fill.style.width = progress + '%';
      pct.textContent = String(progress).padStart(2, '0') + '%';

      if (progress < 100) {
        requestAnimationFrame(tick);
      } else {
        finishLoad();
      }
    }

    function finishLoad() {
      setTimeout(() => {
        loader.classList.add('is-hidden');
        site.hidden = false;
        requestAnimationFrame(() => site.classList.add('is-visible'));
        loader.addEventListener('transitionend', () => {
          loader.remove();
        }, { once: true });
        document.body.style.overflow = '';
      }, reduceMotion ? 50 : 350);
    }

    document.body.style.overflow = 'hidden';
    requestAnimationFrame(tick);
  }

  /* ===================================================================
     2. NAV — scroll state + mobile menu
     =================================================================== */
  function initNav() {
    const nav = document.getElementById('nav');
    const menuBtn = document.getElementById('menu-btn');
    const mobileNav = document.getElementById('mobile-nav');

    function onScroll() {
      if (!nav) return;
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', () => {
        const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', String(!isOpen));
        mobileNav.hidden = isOpen;
        if (!isOpen) {
          requestAnimationFrame(() => mobileNav.classList.add('is-open'));
          document.body.style.overflow = 'hidden';
        } else {
          mobileNav.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });

      mobileNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          menuBtn.setAttribute('aria-expanded', 'false');
          mobileNav.classList.remove('is-open');
          document.body.style.overflow = '';
          setTimeout(() => { mobileNav.hidden = true; }, 400);
        });
      });
    }
  }

  /* ===================================================================
     3. ENTER BUTTON + SCROLL CUE
     =================================================================== */
  function initHeroControls() {
    const enterBtn = document.getElementById('enter-btn');
    const scrollCue = document.getElementById('scroll-cue');
    const target = document.getElementById('who-he-is');

    function goNext() {
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    if (enterBtn) enterBtn.addEventListener('click', goNext);
    if (scrollCue) scrollCue.addEventListener('click', goNext);
  }

  /* ===================================================================
     4. SCROLL-TRIGGERED REVEALS (IntersectionObserver)
     =================================================================== */
  function initReveals() {
    const items = document.querySelectorAll('.reveal-item');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    items.forEach((el) => observer.observe(el));
  }

  /* ===================================================================
     5. ANIMATED COUNTERS (By the Numbers)
     =================================================================== */
  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const dur = reduceMotion ? 1 : 1600;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function animateInfinity(el) {
    // Cycles a small set of glyphs to suggest "infinite" without a fixed number landing
    if (reduceMotion) { el.textContent = '∞'; return; }
    el.textContent = '∞';
    el.style.display = 'inline-block';
    let scale = 1;
    let growing = true;
    function pulse() {
      scale += growing ? 0.004 : -0.004;
      if (scale > 1.08) growing = false;
      if (scale < 1) growing = true;
      el.style.transform = `scale(${scale})`;
      requestAnimationFrame(pulse);
    }
    requestAnimationFrame(pulse);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count-to]');
    const infinities = document.querySelectorAll('[data-infinity]');
    if (!counters.length && !infinities.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCount);
      infinities.forEach(animateInfinity);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.hasAttribute('data-count-to')) animateCount(entry.target);
          if (entry.target.hasAttribute('data-infinity')) animateInfinity(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => observer.observe(el));
    infinities.forEach((el) => observer.observe(el));
  }

  /* ===================================================================
     6. TIMELINE PROGRESS LINE
     =================================================================== */
  function initTimelineProgress() {
    const track = document.querySelector('.timeline__track');
    const fill = document.getElementById('timeline-fill');
    if (!track || !fill) return;

    function update() {
      const rect = track.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = rect.height;
      const visible = Math.min(total, Math.max(0, viewportH * 0.7 - rect.top));
      const pct = total > 0 ? Math.min(100, Math.max(0, (visible / total) * 100)) : 0;
      fill.style.height = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ===================================================================
     6b. AUTO-LOAD PHOTOS (gallery + family frames)
     Checks each [data-src] element — if the image file actually exists
     and loads, it's set as the background. If it's missing (404), the
     element is left alone and keeps showing the gold placeholder pattern
     or initial letter. No console errors, no broken-image icons.
     =================================================================== */
  function initGalleryPhotos() {
    const targets = document.querySelectorAll('[data-src]');
    const extensionsToTry = ['.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.webp'];

    targets.forEach((el) => {
      const base = el.getAttribute('data-src');
      if (!base) return;

      // If the path already ends in a known extension, just try that exact path.
      const hasExtension = /\.(jpe?g|png|webp)$/i.test(base);
      const candidates = hasExtension ? [base] : extensionsToTry.map((ext) => base + ext);

      tryNext(el, candidates, 0);
    });

    function tryNext(el, candidates, index) {
      if (index >= candidates.length) return; // none worked — leave placeholder as-is
      const src = candidates[index];
      const img = new Image();
      img.onload = () => {
        el.style.backgroundImage = `url('${src}')`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.classList.add('has-photo');
      };
      img.onerror = () => tryNext(el, candidates, index + 1);
      img.src = src;
    }
  }

  /* ===================================================================
     7. PARALLAX (hero background layers)
     =================================================================== */
  function initParallax() {
    if (reduceMotion) return;
    const layer1 = document.querySelector('.hero__bg-layer--1');
    const lowerThird = document.querySelector('.hero__lower-third');
    const heroContent = document.querySelector('.hero__content');
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let ticking = false;

    function update() {
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
      if (layer1) layer1.style.transform = `translateY(${progress * 60}px)`;
      if (heroContent) heroContent.style.transform = `translateY(${progress * 40}px)`;
      if (lowerThird) lowerThird.style.opacity = String(Math.max(0, 1 - progress * 2.2));
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ===================================================================
     8. BACKGROUND MUSIC TOGGLE
     =================================================================== */
  function initMusic() {
    const btn = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-score');
    if (!btn || !audio) return;

    audio.volume = 0.35;

    btn.addEventListener('click', () => {
      const isPlaying = btn.getAttribute('aria-pressed') === 'true';
      if (isPlaying) {
        audio.pause();
        btn.setAttribute('aria-pressed', 'false');
      } else {
        audio.play().catch(() => {
          // Autoplay-style restrictions or missing file — fail silently.
          // Drop an instrumental track at /assets/score.mp3 to enable playback.
        });
        btn.setAttribute('aria-pressed', 'true');
      }
    });
  }

  /* ===================================================================
     9. DADGPT — rule-based response engine
     =================================================================== */
  function initDadGPT() {
    const screen = document.getElementById('dadgpt-screen');
    const form = document.getElementById('dadgpt-form');
    const input = document.getElementById('dadgpt-input');
    const suggestions = document.getElementById('dadgpt-suggestions');
    if (!screen || !form || !input) return;

    const responses = [
      {
        keys: ['success', 'successful', 'make it', 'achieve'],
        reply: "Success? It's not the title or the money, my friend. If your family is fed, your conscience is clean, and somebody's life is better because you showed up — that's success. Everything else is just decoration."
      },
      {
        keys: ['hard', 'difficult', 'struggling', 'tired', 'stress', 'depress', 'give up', 'can\'t do this'],
        reply: "When life gets hard, you pray, you plan, and then you put one foot in front of the other. I've been broke before. I've been afraid before. None of it was the end. Are you alright, really? Call me. Not text — call."
      },
      {
        keys: ['money', 'cash', 'fund', 'transfer', 'send me', 'allowance'],
        reply: "Ah-ah. You want money or you want to greet your father first? *laughs* It's my job to provide na — but tell me what it's for, and let's talk like responsible people. Send your account details."
      },
      {
        keys: ['are you alright', 'you ok', 'you good', 'how are you'],
        reply: "Me? I'm fine, I'm fine. Don't worry about me — focus on your studies. But thank you for asking. Are YOU alright though? That's the real question."
      },
      {
        keys: ['sorry', 'apologi', 'my fault', 'mistake'],
        reply: "Sorry. It's fine, it's fine — just don't do it again. We move forward, not backward. Have you eaten?"
      },
      {
        keys: ['love you', 'miss you', 'thank you', 'appreciate'],
        reply: "I love you too, my friend. Everything I've ever done was for you and your siblings. Now go and do something productive with that love — and call your mother."
      },
      {
        keys: ['chatgpt', 'ai', 'policy', 'violat'],
        reply: "Are you alright? What's violating anything? I just wanted a simple graphic. These computer people sha."
      },
      {
        keys: ['pray', 'prayer', 'god', 'faith', 'church'],
        reply: "Faith isn't something you perform on Sunday and forget by Monday. Pray like everything depends on God, then work like everything depends on you. That's the balance."
      },
      {
        keys: ['proud', 'proud of me'],
        reply: "Of course I'm proud of you. I may not always say it loud enough, but every single one of you is the proof that the work was worth it."
      }
    ];

    const fallback = "Hmm, let me think about that one. In the meantime — are you alright? Have you eaten today? Don't stress yourself too much, my friend.";

    function findResponse(text) {
      const lower = text.toLowerCase();
      for (const item of responses) {
        if (item.keys.some((k) => lower.includes(k))) return item.reply;
      }
      return fallback;
    }

    function addLine(sender, text, variant) {
      const p = document.createElement('p');
      p.className = `dadgpt__line dadgpt__line--${variant}`;
      const tag = document.createElement('span');
      tag.className = 'dadgpt__tag';
      tag.textContent = sender;
      p.appendChild(tag);
      p.appendChild(document.createTextNode(text));
      screen.appendChild(p);
      screen.scrollTop = screen.scrollHeight;
      return p;
    }

    function typeReply(text) {
      const p = addLine('DAD', '', 'bot');
      const textNode = p.lastChild;

      if (reduceMotion) {
        textNode.textContent = text;
        screen.scrollTop = screen.scrollHeight;
        return;
      }

      let i = 0;
      const speed = 14;
      function step() {
        if (i <= text.length) {
          textNode.textContent = text.slice(0, i);
          i++;
          screen.scrollTop = screen.scrollHeight;
          setTimeout(step, speed);
        }
      }
      step();
    }

    function ask(question) {
      if (!question.trim()) return;
      addLine('YOU', question, 'user');
      input.value = '';
      setTimeout(() => {
        typeReply(findResponse(question));
      }, reduceMotion ? 0 : 450);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      ask(input.value);
    });

    if (suggestions) {
      suggestions.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-q]');
        if (btn) ask(btn.getAttribute('data-q'));
      });
    }
  }

  /* ===================================================================
     10. INIT
     =================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    runLoader();
    initNav();
    initHeroControls();
    initReveals();
    initCounters();
    initTimelineProgress();
    initGalleryPhotos();
    initParallax();
    initMusic();
    initDadGPT();
  });

})();
