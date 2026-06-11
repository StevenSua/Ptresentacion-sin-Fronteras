/* ════════════════════════════════════════════════
   Deck controller — Sin Fronteras · Plan EE.UU.
   Teclado · botones · swipe táctil · hash · overview
   ════════════════════════════════════════════════ */
(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const total = slides.length;
  const fill = document.getElementById('progressFill');
  const navCur = document.getElementById('navCur');
  const navTot = document.getElementById('navTot');
  const overview = document.getElementById('overview');
  const ovGrid = document.getElementById('ovGrid');
  let cur = 0;
  let animating = false;

  navTot.textContent = String(total).padStart(2, '0');

  /* ── overview grid ── */
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'ov-item';
    b.innerHTML = `<span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${s.dataset.title}</span>`;
    b.addEventListener('click', () => { closeOverview(); go(i); });
    ovGrid.appendChild(b);
  });
  const ovItems = [...ovGrid.children];

  /* ── counters ── */
  function runCounters(slide) {
    slide.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec || '0', 10);
      const dur = 1400;
      const t0 = performance.now();
      function tick(t) {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = dec
          ? val.toFixed(dec).replace('.', ',')
          : Math.round(val).toLocaleString('es-CO');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ── bars ── */
  function runBars(slide) {
    slide.querySelectorAll('.bar[data-w]').forEach((b, i) => {
      b.style.width = '0';
      setTimeout(() => { b.style.width = b.dataset.w + '%'; }, 250 + i * 140);
    });
  }

  /* ── navigation ── */
  function go(i, instant = false) {
    if (i < 0 || i >= total || (i === cur && !instant)) return;
    if (animating && !instant) return;
    animating = true;
    setTimeout(() => { animating = false; }, 450);

    slides[cur].classList.remove('active');
    slides[cur].classList.toggle('prev', i > cur);
    cur = i;
    const s = slides[cur];
    slides.forEach((sl, j) => sl.classList.toggle('prev', j < cur));
    s.classList.add('active');
    s.scrollTop = 0;

    fill.style.width = ((cur + 1) / total * 100) + '%';
    navCur.textContent = String(cur + 1).padStart(2, '0');
    document.body.classList.toggle('s-paper-active', s.classList.contains('s-paper'));
    ovItems.forEach((it, j) => it.classList.toggle('cur', j === cur));
    history.replaceState(null, '', '#' + (cur + 1));

    runCounters(s);
    runBars(s);
  }

  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);

  document.getElementById('btnNext').addEventListener('click', next);
  document.getElementById('btnPrev').addEventListener('click', prev);

  /* ── keyboard ── */
  document.addEventListener('keydown', e => {
    if (overview.classList.contains('open')) {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'g') closeOverview();
      return;
    }
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': e.preventDefault(); prev(); break;
      case 'Home': go(0); break;
      case 'End': go(total - 1); break;
      case 'Escape': case 'g': case 'G': openOverview(); break;
      case 'f': case 'F':
        document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
        break;
    }
  });

  /* ── touch swipe (horizontal only, respects vertical scroll) ── */
  let tx = 0, ty = 0, tt = 0;
  document.addEventListener('touchstart', e => {
    if (overview.classList.contains('open')) return;
    tx = e.touches[0].clientX; ty = e.touches[0].clientY; tt = Date.now();
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (overview.classList.contains('open')) return;
    if (e.target.closest('button')) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    const dt = Date.now() - tt;
    if (dt < 600 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  /* ── wheel (trackpad horizontal / shift+wheel) ── */
  let wheelLock = 0;
  document.addEventListener('wheel', e => {
    if (overview.classList.contains('open')) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!d) return;
    const now = Date.now();
    if (now - wheelLock < 700 || Math.abs(d) < 25) return;
    wheelLock = now;
    d > 0 ? next() : prev();
  }, { passive: true });

  /* ── overview ── */
  function openOverview() { overview.classList.add('open'); overview.setAttribute('aria-hidden', 'false'); }
  function closeOverview() { overview.classList.remove('open'); overview.setAttribute('aria-hidden', 'true'); }
  document.getElementById('btnOverview').addEventListener('click', () =>
    overview.classList.contains('open') ? closeOverview() : openOverview());
  overview.addEventListener('click', e => { if (e.target === overview) closeOverview(); });

  /* ── init from hash ── */
  const h = parseInt(location.hash.slice(1), 10);
  const start = (h >= 1 && h <= total) ? h - 1 : 0;
  slides[start].classList.add('active');
  cur = start;
  fill.style.width = ((cur + 1) / total * 100) + '%';
  navCur.textContent = String(cur + 1).padStart(2, '0');
  document.body.classList.toggle('s-paper-active', slides[cur].classList.contains('s-paper'));
  ovItems[cur].classList.add('cur');
  runCounters(slides[cur]);
  runBars(slides[cur]);
})();
