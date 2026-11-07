/**
 * Core Interactive Logic & SPA Multi-Page Navigation for Abhigraha 2K26
 */
document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Page Elements
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const pageViews = document.querySelectorAll('.page-view');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileClose = document.getElementById('mobile-drawer-close');
  const mobileBackdrop = document.getElementById('mobile-drawer-backdrop');

  /**
   * Open Mobile Drawer with Fluid Transition and Body Scroll Lock
   */
  function openMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('open');
    document.body.classList.add('drawer-open');
    document.documentElement.classList.add('drawer-open');
  }

  /**
   * Close Mobile Drawer and Restore Background Page Scrolling
   */
  function closeMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('open');
    document.body.classList.remove('drawer-open');
    document.documentElement.classList.remove('drawer-open');
  }

  // Valid Page IDs
  const validPages = ['home', 'events', 'schedule', 'team', 'crowns', 'gallery', 'sponsors'];

  /**
   * Navigate to a specific page view
   * @param {string} pageId - Target page identifier (e.g. 'home', 'events', etc.)
   */
  function navigateTo(pageId) {
    if (!validPages.includes(pageId)) {
      pageId = 'home';
    }

    // Hide all pages, show target page
    pageViews.forEach(page => {
      if (page.id === `page-${pageId}`) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    // Update active nav links (both desktop and mobile)
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${pageId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL hash without extra jump
    if (window.location.hash !== `#${pageId}`) {
      window.history.pushState(null, null, `#${pageId}`);
    }

    // Close mobile drawer if open
    closeMobileDrawer();
  }

  // Handle hash changes (back/forward buttons, direct bookmark URLs)
  function handleHashRoute() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (validPages.includes(hash)) {
      navigateTo(hash);
    } else {
      navigateTo('home');
    }
  }

  window.addEventListener('hashchange', handleHashRoute);
  // Initial page load route
  handleHashRoute();

  // Intercept all internal anchor clicks targeting valid pages
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href').replace('#', '').toLowerCase();
    if (validPages.includes(targetId)) {
      e.preventDefault();
      navigateTo(targetId);
    }
  });

  // Header scroll appearance
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Drawer Controls
  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      openMobileDrawer();
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileDrawer();
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileDrawer);
    // Prevent background scrolling when dragging finger over backdrop
    mobileBackdrop.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  // Prevent background bounce when scrolling inside the drawer
  if (mobileDrawer) {
    mobileDrawer.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  const mobileAdminBtn = document.getElementById('mobile-drawer-admin-btn');
  if (mobileAdminBtn) {
    mobileAdminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();
      const adminBtn = document.getElementById('admin-btn');
      if (adminBtn) adminBtn.click();
    });
  }

  // Event Filter Tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  const eventCards = document.querySelectorAll('.event-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      eventCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        const isMatch = filter === 'all' || category === filter || category.split(' ').includes(filter) || card.classList.contains('always-visible');
        if (isMatch) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Schedule Tabs (Day 1 / Day 2)
  const scheduleTabBtns = document.querySelectorAll('.schedule-tab-btn');
  const day1Timeline = document.getElementById('timeline-day1');
  const day2Timeline = document.getElementById('timeline-day2');

  scheduleTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scheduleTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetDay = btn.getAttribute('data-day');
      if (targetDay === 'day1') {
        if (day1Timeline) day1Timeline.style.display = 'block';
        if (day2Timeline) day2Timeline.style.display = 'none';
      } else {
        if (day1Timeline) day1Timeline.style.display = 'none';
        if (day2Timeline) day2Timeline.style.display = 'block';
      }
    });
  });

  // Toast Helper
  const toast = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  // Registration Modal
  const regModal = document.getElementById('reg-modal');
  const regCloseBtn = document.getElementById('reg-modal-close');
  const regForm = document.getElementById('reg-form');
  const regEventSelect = document.getElementById('reg-event-select');
  // Global Event delegation for Event Registration Modals / Google Forms
  document.addEventListener('click', (e) => {
    const regBtn = e.target.closest('.event-register-btn');
    if (regBtn) {
      e.preventDefault();
      const formUrl = regBtn.getAttribute('data-form-url');
      if (formUrl && formUrl.trim().length > 0 && /^https?:\/\//i.test(formUrl.trim())) {
        window.open(formUrl.trim(), '_blank', 'noopener,noreferrer');
        return;
      }
      const eventName = regBtn.getAttribute('data-event') || 'Festival Participation';
      if (regEventSelect) {
        regEventSelect.value = eventName;
      }
      if (regModal) regModal.classList.add('open');
      return;
    }
  });

  if (regCloseBtn && regModal) {
    regCloseBtn.addEventListener('click', () => {
      regModal.classList.remove('open');
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('reg-name').value.trim();
      const dept = document.getElementById('reg-dept').value.trim();
      const year = document.getElementById('reg-year').value;
      const eventName = regEventSelect.value;
      const phone = document.getElementById('reg-phone').value.trim();
      const email = document.getElementById('reg-email').value.trim();

      if (!name || !dept || !phone || !email) {
        alert('Please fill in all the required registration details.');
        return;
      }

      const regId = 'TNU-' + Math.floor(1000 + Math.random() * 9000);
      const dateStr = new Date().toISOString().slice(0, 10);

      const newRegistration = {
        id: regId,
        name: name,
        dept: dept,
        year: year,
        event: eventName,
        phone: phone,
        email: email,
        date: dateStr
      };

      let list = [];
      const saved = localStorage.getItem('abhigraha_registrations');
      if (saved) {
        try { list = JSON.parse(saved); } catch (err) { list = []; }
      }
      list.push(newRegistration);
      localStorage.setItem('abhigraha_registrations', JSON.stringify(list));

      regForm.reset();
      regModal.classList.remove('open');
      showToast(`🎉 Registration Confirmed! ID: ${regId}. Welcome to Abhigraha 2K26!`);
    });
  }

  // Contact Us Modal
  const contactModal = document.getElementById('contact-modal');
  const contactCloseBtn = document.getElementById('contact-modal-close');
  const contactBtn = document.getElementById('footer-contact-btn');
  const contactForm = document.getElementById('contact-form');

  if (contactBtn && contactModal) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      contactModal.classList.add('open');
    });
  }

  const sponsorPartnerBtn = document.getElementById('sponsor-partner-btn');
  if (sponsorPartnerBtn && contactModal) {
    sponsorPartnerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      contactModal.classList.add('open');
    });
  }

  if (contactCloseBtn && contactModal) {
    contactCloseBtn.addEventListener('click', () => {
      contactModal.classList.remove('open');
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      contactForm.reset();
      if (contactModal) contactModal.classList.remove('open');
      showToast(`✉️ Thank you, ${name || 'Friend'}! Your query has been received by our festival committee.`);
    });
  }

  // Team Poster Lightbox Modal
  const teamModal = document.getElementById('team-modal');
  const teamModalClose = document.getElementById('team-modal-close');
  const teamModalImg = document.getElementById('team-modal-img');
  const teamModalTitle = document.getElementById('team-modal-title');
  const teamModalNames = document.getElementById('team-modal-names');
  const teamCards = document.querySelectorAll('.team-card[data-poster]');

  teamCards.forEach(card => {
    card.addEventListener('click', () => {
      const poster = card.getAttribute('data-poster');
      const role = card.getAttribute('data-role') || 'Festival Leadership';
      const names = card.getAttribute('data-names') || '';

      if (teamModalImg && poster) teamModalImg.src = poster;
      if (teamModalTitle) teamModalTitle.textContent = role;
      if (teamModalNames) teamModalNames.textContent = names;
      if (teamModal) teamModal.classList.add('open');
    });
  });

  if (teamModalClose && teamModal) {
    teamModalClose.addEventListener('click', () => {
      teamModal.classList.remove('open');
    });
  }

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target === regModal) regModal.classList.remove('open');
    if (e.target === contactModal) contactModal.classList.remove('open');
    if (e.target === teamModal) teamModal.classList.remove('open');
    const adminModal = document.getElementById('admin-modal');
    if (e.target === adminModal) adminModal.classList.remove('open');
    if (e.target === mobileBackdrop) closeMobileDrawer();
  });

  // ==========================================================================
  // SPONSOR POSTERS (PC & MOBILE) MANAGEMENT
  // Supports pasting image links directly into index.html OR via SPONSOR_CONFIG
  // ==========================================================================
  window.SPONSOR_CONFIG = window.SPONSOR_CONFIG || {
    pcPosterUrl: '',     // e.g. 'https://.../sponsor-desktop.webp'
    mobilePosterUrl: ''  // e.g. 'https://.../sponsor-mobile.webp'
  };

  function syncSponsorPosters() {
    const desktopImg = document.getElementById('sponsor-poster-desktop');
    const mobileImg = document.getElementById('sponsor-poster-mobile');
    const placeholder = document.getElementById('sponsor-placeholder-wrapper');

    if (window.SPONSOR_CONFIG) {
      if (window.SPONSOR_CONFIG.pcPosterUrl && desktopImg && (!desktopImg.getAttribute('src') || desktopImg.getAttribute('src').startsWith('PASTE_'))) {
        desktopImg.src = window.SPONSOR_CONFIG.pcPosterUrl;
      }
      if (window.SPONSOR_CONFIG.mobilePosterUrl && mobileImg && (!mobileImg.getAttribute('src') || mobileImg.getAttribute('src').startsWith('PASTE_'))) {
        mobileImg.src = window.SPONSOR_CONFIG.mobilePosterUrl;
      }
    }

    const dSrc = desktopImg ? (desktopImg.getAttribute('src') || '').trim() : '';
    const mSrc = mobileImg ? (mobileImg.getAttribute('src') || '').trim() : '';
    const hasValidDesktop = dSrc !== '' && !dSrc.startsWith('PASTE_') && dSrc !== '#';
    const hasValidMobile = mSrc !== '' && !mSrc.startsWith('PASTE_') && mSrc !== '#';

    // If only one poster is specified, mirror it to the other screen size as a fallback
    if (hasValidDesktop && !hasValidMobile && mobileImg) {
      mobileImg.src = dSrc;
    } else if (hasValidMobile && !hasValidDesktop && desktopImg) {
      desktopImg.src = mSrc;
    }

    if (placeholder) {
      if (hasValidDesktop || hasValidMobile) {
        placeholder.style.display = 'none';
      } else {
        placeholder.style.display = 'block';
      }
    }
  }

  syncSponsorPosters();
});
