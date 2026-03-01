/* ══════════════════════════════════════════════════════════════
   CHARLEY ZHAO · PORTFOLIO · MAIN JS
   ══════════════════════════════════════════════════════════════ */

'use strict';

/* ── BOOT SEQUENCE ──────────────────────────────────────────── */
(function initBoot() {
  const typedEl    = document.getElementById('boot-typed');
  const bootScreen = document.getElementById('boot-screen');
  const mainLayout = document.getElementById('main-layout');

  const TEXT = "About me you ask...";
  let i = 0;

  function typeNext() {
    if (i < TEXT.length) {
      typedEl.textContent += TEXT[i++];
      setTimeout(typeNext, 55);
    } else {
      // Fully typed — wait 2 seconds then fade out
      setTimeout(() => {
        bootScreen.style.opacity = '0';
        bootScreen.style.transition = 'opacity 0.55s ease';
        setTimeout(() => {
          bootScreen.style.display = 'none';
          mainLayout.classList.remove('initially-hidden');
          onMainReady();
        }, 580);
      }, 2000);
    }
  }

  setTimeout(typeNext, 500);
})();

/* ── MAIN INIT (runs after boot) ────────────────────────────── */
function onMainReady() {
  initTypewriter();
  initReveal();
  initCommandPalette();
  setTimeout(initCarouselTitles, 120);
}

/* ── CAROUSEL TITLES (mobile overflow scroll) ───────────────── */
function initCarouselTitles() {
  if (window.innerWidth > 768) return;

  document.querySelectorAll('.pos-title').forEach(title => {
    if (title.scrollWidth <= title.clientWidth + 2) return;

    const dist = title.scrollWidth - title.clientWidth;
    const inner = document.createElement('span');
    inner.className = 'carousel-inner';
    inner.textContent = title.textContent;
    title.textContent = '';
    title.appendChild(inner);
    title.style.setProperty('--scroll-dist', `-${dist}px`);
    title.classList.add('carousel-active');
  });
}

/* ── TYPEWRITER ─────────────────────────────────────────────── */
function initTypewriter() {
  const summaryEl = document.getElementById('tw-summary');
  const tagCursor = document.getElementById('tag-cursor');

  const SUMMARY = 'Drove banking technology transformations from the core to experience layer for financial institutions. Now at Haas to build on the bleeding edge of financial infrastructure.';

  function typeInto(el, text, speed, onDone) {
    let i = 0;
    function step() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(step, speed);
      } else {
        onDone && onDone();
      }
    }
    step();
  }

  tagCursor.style.display = 'inline';
  typeInto(summaryEl, SUMMARY, 22, () => {
    setTimeout(() => { tagCursor.style.animationIterationCount = '3'; }, 2000);
  });
}

/* ── SPARKLINE ──────────────────────────────────────────────── */
function initSparkline() {
  const poly = document.getElementById('sparkline-poly');
  const fill = document.getElementById('sparkline-fill');
  if (!poly) return;

  // Animate the drawing after a brief pause
  setTimeout(() => {
    const len = poly.getTotalLength ? poly.getTotalLength() : 300;
    poly.style.strokeDasharray  = len;
    poly.style.strokeDashoffset = len;
    poly.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1), opacity 0.3s';
    poly.style.opacity = '1';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        poly.style.strokeDashoffset = '0';
      });
    });

    // Fade in fill area
    setTimeout(() => {
      fill.style.opacity = '1';
      fill.style.transition = 'opacity 0.6s ease';
    }, 800);
  }, 200);
}

/* ── COUNT-UP ANIMATIONS ────────────────────────────────────── */
function initCountUps() {
  const els = document.querySelectorAll('[data-target]');

  function animateEl(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = '1';

    const target    = parseFloat(el.dataset.target);
    const isDecimal = el.hasAttribute('data-decimal');
    const duration  = 1100;
    const start     = performance.now();

    // suffix comes from data-suffix attribute OR ::after pseudo via CSS
    // We'll write the number directly, suffix is rendered via CSS ::after

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const v = target * e;

      el.textContent = isDecimal ? v.toFixed(1) : Math.floor(v);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : target;
      }
    }
    requestAnimationFrame(tick);
  }

  // Hero metrics — trigger immediately after boot
  els.forEach(el => {
    if (el.closest('#hero')) {
      setTimeout(() => animateEl(el), 100);
    }
  });

  // Other sections — trigger on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateEl(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  els.forEach(el => {
    if (!el.closest('#hero')) observer.observe(el);
  });
}

/* ── REVEAL ON SCROLL ───────────────────────────────────────── */
function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  const observer  = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ── COMMAND PALETTE ────────────────────────────────────────── */
function initCommandPalette() {
  const palette   = document.getElementById('cmd-palette');
  const backdrop  = document.getElementById('cmd-backdrop');
  const input     = document.getElementById('cmd-input');
  const items     = document.querySelectorAll('.cmd-item');
  const openBtn   = document.getElementById('cmd-open-btn');

  let selectedIdx = -1;
  let visibleItems = [...items];

  function open() {
    palette.classList.remove('cmd-hidden');
    input.value = '';
    filterItems('');
    selectedIdx = 0;
    updateSelection();
    setTimeout(() => input.focus(), 40);
  }

  function close() {
    palette.classList.add('cmd-hidden');
    input.blur();
    selectedIdx = -1;
  }

  function navigate(href, external) {
    close();
    if (external) {
      window.open(href, '_blank', 'noopener');
    } else if (href.startsWith('#')) {
      const target = document.querySelector(href);
      target?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = href;
    }
  }

  function filterItems(query) {
    const q = query.toLowerCase().trim();
    visibleItems = [];
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const show = !q || text.includes(q);
      item.classList.toggle('cmd-hidden-item', !show);
      if (show) visibleItems.push(item);
    });
    selectedIdx = visibleItems.length > 0 ? 0 : -1;
    updateSelection();
  }

  function updateSelection() {
    items.forEach(i => i.classList.remove('cmd-selected'));
    if (selectedIdx >= 0 && visibleItems[selectedIdx]) {
      visibleItems[selectedIdx].classList.add('cmd-selected');
      visibleItems[selectedIdx].scrollIntoView({ block: 'nearest' });
    }
  }

  // Detect platform and update the kbd hint accordingly
  const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
  const kbdHint = document.getElementById('cmd-kbd-hint');
  if (kbdHint) kbdHint.textContent = isMac ? '⌘K' : 'Ctrl+K';

  // Open triggers
  openBtn?.addEventListener('click', open);
  document.getElementById('mobile-cmd-btn')?.addEventListener('click', open);

  // Use capture:true so the listener fires before the browser handles ⌘K
  document.addEventListener('keydown', e => {
    const trigger = isMac
      ? (e.metaKey && !e.ctrlKey && e.key === 'k')
      : (e.ctrlKey && !e.metaKey && e.key === 'k');

    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      palette.classList.contains('cmd-hidden') ? open() : close();
    }
    if (e.key === 'Escape' && !palette.classList.contains('cmd-hidden')) {
      close();
    }
  }, { capture: true });

  backdrop.addEventListener('click', close);

  // Input filtering
  input.addEventListener('input', () => filterItems(input.value));

  // Keyboard navigation inside palette
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, visibleItems.length - 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      updateSelection();
    } else if (e.key === 'Enter') {
      const sel = visibleItems[selectedIdx];
      if (sel) {
        navigate(sel.dataset.href, sel.dataset.external === 'true');
      }
    }
  });

  // Click on item
  items.forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.href, item.dataset.external === 'true');
    });
  });
}
