/* ==========================================================================
   KALI LINUX CLONE — MAIN SCRIPT
   Author: Umer Qureshi
   Sections:
     1. Theme toggle (dark/light) + localStorage persistence
     2. Navbar scroll state + mobile menu
     3. Tools section — horizontal scroll driven by cursor position
     4. Kali Everywhere — crossfade "video style" image cycling
     5. Back-to-top button
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- 1. THEME TOGGLE ---------------- */
  // We store the choice in localStorage so it survives a page reload,
  // exactly like the real Kali site's light/dark switch in the footer.
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('kali-theme');

  if (savedTheme === 'light') {
    root.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.checked = true;
  }

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      const isLight = themeToggle.checked;
      root.setAttribute('data-theme', isLight ? 'light' : 'dark');
      localStorage.setItem('kali-theme', isLight ? 'light' : 'dark');
    });
  }

  /* ---------------- 2. NAVBAR ---------------- */
  const navbar = document.querySelector('.kali-navbar');
  const navToggleBtn = document.querySelector('.navbar-toggle');
  const navLinks = document.querySelector('.kali-nav-links');

  const onScroll = () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggleBtn) {
    navToggleBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  }
  // On mobile, tapping a dropdown label expands its submenu instead of navigating.
  document.querySelectorAll('.nav-drop > a').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.innerWidth <= 1100) {
        e.preventDefault();
        a.parentElement.classList.toggle('open');
      }
    });
  });

  /* Note: on purpose there's no scroll-triggered reveal-on-entry system
     here. All section content is visible in plain HTML/CSS from the start
     (works with JS off, and doesn't fight full-page screenshot tools).
     The only load animation is the one-time hero rise, done in pure CSS. */

  /* ---------------- 3. TOOLS — CURSOR HORIZONTAL SCROLL ----------------
     Moving the mouse left/right across the tools strip pans the track,
     mimicking the "hover to scroll" behaviour of the real site's tool row. */
  const toolsOuter = document.querySelector('.tools-track-outer');
  const toolsTrack = document.querySelector('.tools-track');

  if (toolsOuter && toolsTrack) {
    let maxScroll = 0;

    const computeMax = () => {
      maxScroll = Math.max(0, toolsTrack.scrollWidth - toolsOuter.clientWidth);
    };
    computeMax();
    window.addEventListener('resize', computeMax);

    toolsOuter.addEventListener('mousemove', (e) => {
      const rect = toolsOuter.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width; // 0 -> left edge, 1 -> right edge
      const clamped = Math.min(1, Math.max(0, ratio));
      const x = -clamped * maxScroll;
      toolsTrack.style.transform = `translateX(${x}px)`;
    });

    toolsOuter.addEventListener('mouseleave', () => {
      toolsTrack.style.transform = 'translateX(0px)';
    });

    // Touch devices: allow native swipe by translating a simple drag.
    let dragging = false, startX = 0, startTranslate = 0;
    toolsOuter.addEventListener('touchstart', (e) => {
      dragging = true; startX = e.touches[0].clientX;
      const m = toolsTrack.style.transform.match(/-?\d+\.?\d*/);
      startTranslate = m ? parseFloat(m[0]) : 0;
    }, { passive: true });
    toolsOuter.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const delta = e.touches[0].clientX - startX;
      let x = Math.min(0, Math.max(-maxScroll, startTranslate + delta));
      toolsTrack.style.transform = `translateX(${x}px)`;
    }, { passive: true });
    toolsOuter.addEventListener('touchend', () => dragging = false);
  }

  /* ---------------- 4. KALI EVERYWHERE — CROSSFADE CYCLING ----------------
     Each frame holds several stacked <img class="fade-img">. We cycle the
     "active" class on a timer per-frame so screenshots dissolve into one
     another smoothly, giving the "playing like a video" effect. */
  document.querySelectorAll('[data-fade-group]').forEach(group => {
    const imgs = group.querySelectorAll('.fade-img');
    if (imgs.length < 2) return;
    let idx = 0;
    // Stagger each group's start slightly so multiple frames don't flip in sync.
    const offset = Math.random() * 1500;
    setTimeout(() => {
      setInterval(() => {
        imgs[idx].classList.remove('active');
        idx = (idx + 1) % imgs.length;
        imgs[idx].classList.add('active');
      }, 2600);
    }, offset);
  });

  /* ---------------- 5. BACK TO TOP ---------------- */
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

});
