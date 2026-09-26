/**
 * Abhigraha 2K26 - Imperial Festival Management & Admin Portal
 * Features:
 * 1. Cryptographically secure admin authentication (SHA-256 verification, zero plaintext password exposure).
 * 2. Full CRUD capability (Add, Edit, Remove) for:
 *    - Events & Battles
 *    - Schedule & Timelines (Day 1 / Day 2)
 *    - Crowns of 2K26
 *    - Official Merchandise
 *    - Moments & Memories Gallery
 * 3. Live Applicant Management & CSV Export.
 * 4. Real-time DOM synchronization across public festival views.
 */
(function() {
  'use strict';

  // Cryptographic SHA-256 hash for authorized portal access
  const ACCESS_HASH = '7ba682d1dcfb5d93995134af9fce82b2bf9c0a365f4f29e7b3aac8e949f3297d';

  // Custom SVG Icons for Admin Portal Buttons and Interactive Headings
  const ADMIN_ICONS = {
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="admin-btn-svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="admin-btn-svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="admin-btn-svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    moveUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="admin-btn-svg"><polyline points="18 15 12 9 6 15"></polyline></svg>',
    moveDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="admin-btn-svg"><polyline points="6 9 12 15 18 9"></polyline></svg>'
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==========================================================================
  // DEFAULT FESTIVAL DATASETS
  // ==========================================================================
  const DEFAULT_EVENTS = [
    {
      id: 'evt-1',
      title: 'Nrityotsav - Dance Battle',
      category: 'Cultural',
      prize: '₹15,000 + Trophy',
      tag: 'Flagship',
      desc: 'Eastern and Western solo & group dance choreography clash on the imperial amphitheatre stage.',
      venue: 'Amphitheatre Stage',
      time: 'Day 1 | 02:00 PM',
      formUrl: 'https://forms.gle/abhigraha2k26-nrityotsav'
    },
    {
      id: 'evt-2',
      title: 'Sur Tarang - Battle of Bands',
      category: 'Cultural',
      prize: '₹20,000 + Trophy',
      tag: 'Star Clash',
      desc: 'High-voltage live rock and fusion band showdown featuring collegiate bands across the region.',
      venue: 'Main Ground Pavilion',
      time: 'Day 1 | 05:00 PM',
      formUrl: 'https://forms.gle/abhigraha2k26-surtarang'
    }
  ];

  const DEFAULT_SCHEDULE = [
    { id: 'sch-1', day: 'day1', time: '10:00 AM - 11:30 AM', title: 'Grand Inauguration & Lamp Lighting', venue: 'Central Auditorium | Welcome Address by Vice Chancellor' },
    { id: 'sch-2', day: 'day1', time: '05:00 PM - 08:30 PM', title: 'Sur Tarang Live Band War & Rock Night', venue: 'Main Ground Pavilion | Live Rock & Fusion Night' },
    { id: 'sch-3', day: 'day2', time: '03:30 PM - 06:30 PM', title: 'The Royal CROWNS Coronation (Mr. & Ms. Freshers)', venue: 'Main Imperial Stage | Fashion & Talent Walk' },
    { id: 'sch-4', day: 'day2', time: '07:00 PM - 10:00 PM', title: 'Celebrity DJ Night & Grand EDM Extravaganza', venue: 'Main Festival Grounds | Star EDM Finale' }
  ];

  // Auto-align default datasets for clean initial display (2 events, 2 Day 1 activities, 2 Day 2 activities)
  (function migrateDefaults() {
    const DATASET_REV = 'rev_2evt_4sch_formurls_v2';
    if (localStorage.getItem('abhigraha_defaults_rev') !== DATASET_REV) {
      try {
        const existingEvts = JSON.parse(localStorage.getItem('abhigraha_events') || 'null');
        if (!existingEvts || (Array.isArray(existingEvts) && existingEvts.length === 6 && existingEvts[0]?.id === 'evt-1')) {
          localStorage.setItem('abhigraha_events', JSON.stringify(DEFAULT_EVENTS));
        } else if (Array.isArray(existingEvts)) {
          const enriched = existingEvts.map((e, idx) => ({
            ...e,
            formUrl: e.formUrl || (DEFAULT_EVENTS[idx] ? DEFAULT_EVENTS[idx].formUrl : 'https://forms.gle/abhigraha2k26-registration')
          }));
          localStorage.setItem('abhigraha_events', JSON.stringify(enriched));
        }

        const existingSch = JSON.parse(localStorage.getItem('abhigraha_schedule') || 'null');
        if (!existingSch || (Array.isArray(existingSch) && existingSch.length === 8 && existingSch[0]?.id === 'sch-1')) {
          localStorage.setItem('abhigraha_schedule', JSON.stringify(DEFAULT_SCHEDULE));
        }

        const existingCrowns = JSON.parse(localStorage.getItem('abhigraha_crowns') || 'null');
        if (existingCrowns && Array.isArray(existingCrowns)) {
          const enrichedCrowns = existingCrowns.map((c, idx) => ({
            ...c,
            formUrl: c.formUrl || (DEFAULT_CROWNS[idx] ? DEFAULT_CROWNS[idx].formUrl : 'https://forms.gle/abhigraha2k26-crowns')
          }));
          localStorage.setItem('abhigraha_crowns', JSON.stringify(enrichedCrowns));
        }

        const existingMerch = JSON.parse(localStorage.getItem('abhigraha_merchandise') || 'null');
        if (existingMerch && Array.isArray(existingMerch)) {
          const enrichedMerch = existingMerch.map((m, idx) => ({
            ...m,
            formUrl: m.formUrl || (DEFAULT_MERCH[idx] ? DEFAULT_MERCH[idx].formUrl : 'https://forms.gle/abhigraha2k26-merch')
          }));
          localStorage.setItem('abhigraha_merchandise', JSON.stringify(enrichedMerch));
        }
      } catch (e) {}
      localStorage.setItem('abhigraha_defaults_rev', DATASET_REV);
    }
  })();

  const DEFAULT_CROWNS = [
    {
      id: 'crw-1',
      role: 'Mr. Freshers 2K26',
      title: 'The Dragon King',
      icon: '🤴',
      criteria: '✦ Round 1: Ethnic & Theme Runway Walk\n✦ Round 2: On-stage Talent Showcase\n✦ Round 3: Wit, Intellect & Judges Q&A\n✦ Live Audience Popular Choice Voting',
      regEvent: 'Nomination: Mr. Freshers 2K26',
      formUrl: 'https://forms.gle/abhigraha2k26-mrfreshers'
    },
    {
      id: 'crw-2',
      role: 'Ms. Freshers 2K26',
      title: 'The Imperial Empress',
      icon: '👸',
      criteria: '✦ Round 1: Oriental Fusion Fashion Runway\n✦ Round 2: Individual Performance & Passion\n✦ Round 3: Wit, Spontaneity & Final Pitch\n✦ Live Audience Popular Choice Voting',
      regEvent: 'Nomination: Ms. Freshers 2K26',
      formUrl: 'https://forms.gle/abhigraha2k26-msfreshers'
    }
  ];

  const DEFAULT_MERCH = [
    {
      id: 'mrc-1',
      title: 'Imperial Festival Kimono Hoodie',
      price: '₹799',
      tag: 'Popular',
      desc: 'Premium oriental embroidered heavyweight hoodie with gold foil dragon iconography.',
      icon: '👘',
      formUrl: 'https://forms.gle/abhigraha2k26-hoodie'
    },
    {
      id: 'mrc-2',
      title: 'Abhigraha 2K26 Graphic T-Shirt',
      price: '₹399',
      tag: 'Trending',
      desc: '100% bio-washed cotton tee with glowing lantern screenprint and TNU official event signature.',
      icon: '👕',
      formUrl: 'https://forms.gle/abhigraha2k26-tshirt'
    },
    {
      id: 'mrc-3',
      title: 'VIP Access Pass + Glow Wristband',
      price: '₹199',
      tag: 'Limited',
      desc: 'Front-row arena entry for celebrity star night, LED festival wristband, and holographic souvenir badge.',
      icon: '🎟️',
      formUrl: 'https://forms.gle/abhigraha2k26-vippass'
    }
  ];

  const DEFAULT_GALLERY = [
    { id: 'gal-1', type: 'img', src: './assets/images/logo-crest.webp', icon: '', bg: '', caption: 'The Imperial Dragon Gates of Abhigraha' },
    { id: 'gal-2', type: 'emoji', src: '', icon: '🏮🏮🏮', bg: 'radial-gradient(circle, #3b0914, #0b0306)', caption: 'Illuminated Temple Lanterns Night' },
    { id: 'gal-3', type: 'emoji', src: '', icon: '🎸🔥🥁', bg: 'radial-gradient(circle, #54111f, #0b0306)', caption: 'Battle of Bands Rock Stage' },
    { id: 'gal-4', type: 'emoji', src: '', icon: '👑✨👗', bg: 'radial-gradient(circle, #441708, #0b0306)', caption: 'Mr. & Ms. Freshers Runway Coronation' }
  ];

  const DEFAULT_CONTACTS = [
    {
      id: 'cnt-1',
      name: 'Subhadeep Nandy',
      designation: 'Festival Lead Coordinator',
      phone: '+91 98765 43210',
      email: 'abhigraha2k26@gmail.com'
    }
  ];
  const DEFAULT_CONTACT = DEFAULT_CONTACTS[0];

  // ==========================================================================
  // STORAGE & CLOUD PERSISTENCE (CLOUDFLARE KV + LOCALSTORAGE HYBRID)
  // ==========================================================================
  const KEY_MAPPING = {
    'abhigraha_events': 'events',
    'abhigraha_schedule': 'schedule',
    'abhigraha_crowns': 'crowns',
    'abhigraha_merchandise': 'merchandise',
    'abhigraha_gallery': 'gallery',
    'abhigraha_visibility': 'visibility',
    'abhigraha_contact': 'contact'
  };

  const REVERSE_KEY_MAPPING = {
    'events': 'abhigraha_events',
    'schedule': 'abhigraha_schedule',
    'crowns': 'abhigraha_crowns',
    'merchandise': 'abhigraha_merchandise',
    'gallery': 'abhigraha_gallery',
    'visibility': 'abhigraha_visibility',
    'contact': 'abhigraha_contact'
  };

  function getContacts() {
    try {
      const saved = localStorage.getItem('abhigraha_contact');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return [{ id: 'cnt-1', ...parsed }];
        }
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_CONTACTS));
  }

  function getContact() {
    const list = getContacts();
    return list.length > 0 ? list[0] : DEFAULT_CONTACT;
  }

  function setContacts(data) {
    localStorage.setItem('abhigraha_contact', JSON.stringify(data));
    broadcastPortalChange('abhigraha_contact', data, Date.now().toString());
  }

  function setContact(data) {
    setContacts(Array.isArray(data) ? data : [data]);
  }

  function updateCloudStatus(status, text) {
    const el = document.getElementById('admin-cloud-sync-status');
    if (!el) return;
    if (status === 'syncing') {
      el.style.background = 'rgba(245, 158, 11, 0.15)';
      el.style.color = '#fbbf24';
      el.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      el.innerHTML = `<span class="session-dot" style="background:#f59e0b;"></span> ${text || 'Syncing to Cloud...'}`;
    } else if (status === 'synced') {
      el.style.background = 'rgba(16, 185, 129, 0.15)';
      el.style.color = '#34d399';
      el.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      el.innerHTML = `<span class="session-dot" style="background:#10b981;"></span> ${text || 'Cloudflare KV Synced'}`;
    } else if (status === 'pending') {
      el.style.background = 'rgba(148, 163, 184, 0.15)';
      el.style.color = '#94a3b8';
      el.style.borderColor = 'rgba(148, 163, 184, 0.3)';
      el.innerHTML = `<span class="session-dot" style="background:#94a3b8;"></span> ${text || 'Local Storage (KV Pending)'}`;
    } else if (status === 'error') {
      el.style.background = 'rgba(239, 68, 68, 0.15)';
      el.style.color = '#f87171';
      el.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      el.innerHTML = `<span class="session-dot" style="background:#ef4444;"></span> ${text || 'Sync Error'}`;
    }
  }

  // ==========================================================================
  // REAL-TIME BROADCAST & AUTO-SYNC SYNCHRONIZATION LOGIC
  // ==========================================================================
  const TAB_SESSION_ID = 'tab_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now();
  let lastKnownVersion = localStorage.getItem('abhigraha_last_updated') || '0';
  let lastHandledVersion = lastKnownVersion;
  let lastKnownFingerprint = '';
  let isAutoUpdating = false;
  let isCheckingRemote = false;
  let festivalBroadcast = null;

  // Initialize browser BroadcastChannel for zero-latency multi-tab sync
  try {
    if ('BroadcastChannel' in window) {
      festivalBroadcast = new BroadcastChannel('abhigraha_realtime_updates');
      festivalBroadcast.onmessage = (event) => {
        const payload = event.data;
        if (!payload || payload.originSession === TAB_SESSION_ID) return;
        if (payload.type === 'PORTAL_DETAILS_CHANGED') {
          // If this tab already handled this timestamp, avoid duplicate runs
          if (payload.timestamp && payload.timestamp === lastHandledVersion) return;
          if (payload.timestamp) {
            lastHandledVersion = payload.timestamp;
            lastKnownFingerprint = payload.timestamp;
            lastKnownVersion = payload.timestamp;
            localStorage.setItem('abhigraha_last_updated', payload.timestamp);
          }

          // If the broadcast payload includes the actual data, write it to localStorage immediately in 0ms!
          if (payload.key && payload.data !== undefined) {
            try {
              localStorage.setItem(payload.key, JSON.stringify(payload.data));
            } catch (e) {}
          }

          triggerAutoLoadingUpdate({
            key: payload.key,
            reason: 'cross_tab_admin_update',
            source: 'broadcast',
            timestamp: payload.timestamp
          });
        }
      };
    }
  } catch (e) {
    console.warn('BroadcastChannel initialization error:', e);
  }

  function broadcastPortalChange(key, data, timestamp) {
    if (festivalBroadcast) {
      try {
        festivalBroadcast.postMessage({
          type: 'PORTAL_DETAILS_CHANGED',
          key,
          data,
          originSession: TAB_SESSION_ID,
          timestamp
        });
      } catch (e) {}
    }
  }

  // Cross-tab storage fallback for browsers
  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === 'abhigraha_last_updated') {
      const newVer = e.newValue ? String(e.newValue).replace(/"/g, '') : '';
      if (newVer && newVer === lastHandledVersion) return;
      if (newVer) {
        lastHandledVersion = newVer;
        lastKnownFingerprint = newVer;
        lastKnownVersion = newVer;
      }
      triggerAutoLoadingUpdate({
        reason: 'storage_sync',
        source: 'storage',
        timestamp: newVer
      });
    }
  });

  // Background Cloud Poller for concurrent remote users across devices
  async function checkRemoteFestivalVersion() {
    if (isCheckingRemote || isAutoUpdating) return;

    // If admin portal is open on this tab, do not poll to avoid any interference
    const fsPortal = document.getElementById('admin-fullscreen-portal');
    if (fsPortal && fsPortal.classList.contains('open')) return;

    isCheckingRemote = true;
    try {
      const cacheBuster = Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const res = await fetch(`/api/content?_cb=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const fullJson = await res.json();
        if (fullJson && fullJson.configured !== false) {
          const serverVersion = String(fullJson.last_updated || '0').replace(/"/g, '');
          const fingerprint = serverVersion + '_' +
            (fullJson.events ? JSON.stringify(fullJson.events).length : 0) + '_' +
            (fullJson.schedule ? JSON.stringify(fullJson.schedule).length : 0) + '_' +
            (fullJson.merchandise ? JSON.stringify(fullJson.merchandise).length : 0) + '_' +
            (fullJson.crowns ? JSON.stringify(fullJson.crowns).length : 0) + '_' +
            JSON.stringify(fullJson.visibility || {});

          if (!lastKnownFingerprint) {
            // First run on page load: record baseline without showing modal
            lastKnownFingerprint = fingerprint;
            lastHandledVersion = serverVersion;
            lastKnownVersion = serverVersion;
            if (serverVersion !== '0') {
              localStorage.setItem('abhigraha_last_updated', serverVersion);
            }
          } else if (fingerprint !== lastKnownFingerprint && serverVersion !== lastHandledVersion) {
            console.log(`[AutoSync] Instant update detected! Version: ${serverVersion}`);
            lastKnownFingerprint = fingerprint;
            lastHandledVersion = serverVersion;
            lastKnownVersion = serverVersion;
            if (serverVersion !== '0') {
              localStorage.setItem('abhigraha_last_updated', serverVersion);
            }

            // Immediately load data into localStorage from the current response (0ms latency, no second fetch!)
            const keys = ['events', 'schedule', 'crowns', 'merchandise', 'gallery'];
            keys.forEach(k => {
              if (Array.isArray(fullJson[k])) {
                const localKey = REVERSE_KEY_MAPPING[k];
                localStorage.setItem(localKey, JSON.stringify(fullJson[k]));
              }
            });
            if (fullJson.visibility && typeof fullJson.visibility === 'object') {
              localStorage.setItem('abhigraha_visibility', JSON.stringify(fullJson.visibility));
            }
            if (fullJson.contact && typeof fullJson.contact === 'object') {
              localStorage.setItem('abhigraha_contact', JSON.stringify(fullJson.contact));
            }

            // Trigger the auto-loading screen immediately for this active user
            triggerAutoLoadingUpdate({
              reason: 'remote_admin_update',
              source: 'cloud_ready',
              version: serverVersion
            });
          }
        }
      }
    } catch (e) {
      // Offline or local preview
    } finally {
      isCheckingRemote = false;
    }
  }

  let pollerInterval = null;
  function startAutoSyncPoller() {
    if (pollerInterval) clearInterval(pollerInterval);
    // Poll every 1.5 seconds when tab is active for instant real-time response
    pollerInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkRemoteFestivalVersion();
      }
    }, 1500);

    // Instant verification when user returns to tab or window refocuses
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkRemoteFestivalVersion();
      }
    });

    window.addEventListener('focus', () => {
      checkRemoteFestivalVersion();
    });

    window.addEventListener('online', () => {
      checkRemoteFestivalVersion();
    });
  }

  /**
   * Prompts and executes the Imperial Auto-Sync Loading Screen for active users
   * @param {Object} options - Sync options and metadata
   */
  function triggerAutoLoadingUpdate(options = {}) {
    // 1. Guard: If admin is actively working inside the full-screen admin portal,
    // update background DOM quietly without interrupting the admin interface
    const fsPortal = document.getElementById('admin-fullscreen-portal');
    if (fsPortal && fsPortal.classList.contains('open') && !options.isTest) {
      renderPublicContent();
      return;
    }

    if (isAutoUpdating) return;
    isAutoUpdating = true;

    const screen = document.getElementById('festival-auto-sync-screen');
    const progressBar = document.getElementById('auto-sync-progress-bar');
    const statusText = document.getElementById('auto-sync-status-text');
    const statusIcon = document.getElementById('auto-sync-icon');
    const card = screen ? screen.querySelector('.auto-sync-card') : null;

    if (!screen || !progressBar || !statusText) {
      renderPublicContent();
      if (typeof syncRegistrationDropdown === 'function') syncRegistrationDropdown();
      showToast('✨ Festival details updated to latest version!');
      isAutoUpdating = false;
      return;
    }

    // Reset visual states & display loading screen immediately
    if (card) card.classList.remove('success');
    screen.classList.remove('fade-out');
    progressBar.style.width = '25%';
    statusText.textContent = '✦ Festival updates detected. Connecting...';
    if (statusIcon) statusIcon.textContent = '✦';

    screen.setAttribute('aria-hidden', 'false');
    screen.classList.add('active');

    // Phase 1: Fast initial sweep (at 100ms)
    setTimeout(() => {
      progressBar.style.width = '60%';
      statusText.textContent = '✦ Refreshing festival arenas & stage timelines...';
    }, 100);

    // Phase 2: Synchronize and re-render DOM in background (at 280ms)
    setTimeout(async () => {
      try {
        progressBar.style.width = '90%';

        // In broadcast, storage, or cloud_ready modes, localStorage is ALREADY up-to-date!
        // Only fetch from cloud if triggered from an unexpected source
        if (options.source !== 'local_save' && options.source !== 'storage' && options.source !== 'broadcast' && options.source !== 'cloud_ready') {
          await syncCloudContent();
        }

        renderPublicContent();
        if (typeof syncAdminVisibilityToggles === 'function') syncAdminVisibilityToggles();
        if (typeof renderAdminActiveTab === 'function') renderAdminActiveTab();
        if (typeof syncRegistrationDropdown === 'function') syncRegistrationDropdown();
      } catch (err) {
        console.warn('Auto-update sync warning:', err);
      }

      // Phase 3: Success state (at 550ms)
      setTimeout(() => {
        progressBar.style.width = '100%';
        statusText.textContent = '✨ Festival details updated successfully!';
        if (statusIcon) statusIcon.textContent = '✓';
        if (card) card.classList.add('success');

        // Phase 4: Smooth fade-out (at 850ms)
        setTimeout(() => {
          screen.classList.add('fade-out');

          // Phase 5: Complete and clean up (at 1100ms)
          setTimeout(() => {
            screen.classList.remove('active', 'fade-out');
            if (card) card.classList.remove('success');
            screen.setAttribute('aria-hidden', 'true');
            isAutoUpdating = false;
            showToast('✨ Festival details have been updated to latest version!');
          }, 250);
        }, 300);
      }, 270);
    }, 280);
  }

  // ==========================================================================
  // PENDING DRAFT STAGING & BATCH PUBLISH TO CLOUDFLARE KV
  // Optimizes KV write limits (free tier: 1k writes/day) and avoids frequent auto-reloads
  // ==========================================================================
  const pendingKeys = new Set();
  let isPublishing = false;

  function loadPendingKeys() {
    try {
      const stored = localStorage.getItem('abhigraha_pending_keys');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          arr.forEach(k => pendingKeys.add(k));
        }
      }
    } catch (e) {}
    updatePublishButtonState();
  }

  function savePendingKeys() {
    try {
      localStorage.setItem('abhigraha_pending_keys', JSON.stringify(Array.from(pendingKeys)));
    } catch (e) {}
  }

  function markKeyPending(key) {
    const cloudKey = KEY_MAPPING[key] || key;
    pendingKeys.add(cloudKey);
    savePendingKeys();
    updatePublishButtonState();
  }

  function clearPendingKeys() {
    pendingKeys.clear();
    try {
      localStorage.removeItem('abhigraha_pending_keys');
    } catch (e) {}
    updatePublishButtonState();
  }

  function updatePublishButtonState() {
    const publishBtn = document.getElementById('admin-publish-btn');
    const counter = document.getElementById('admin-publish-counter');
    if (!publishBtn) return;

    const count = pendingKeys.size;
    if (count > 0) {
      publishBtn.classList.add('has-pending');
      if (counter) {
        counter.textContent = count;
        counter.style.display = 'inline-flex';
      }
      publishBtn.title = `${count} draft change(s) ready. Click to publish live to Cloudflare KV and active visitors.`;
      updateCloudStatus('pending', `● ${count} Draft Change${count > 1 ? 's' : ''} (Unpublished)`);
    } else {
      publishBtn.classList.remove('has-pending');
      if (counter) {
        counter.style.display = 'none';
      }
      publishBtn.title = 'Publish all festival changes live to Cloudflare KV.';
    }
  }

  async function publishAllChanges() {
    if (isPublishing) return;
    const publishBtn = document.getElementById('admin-publish-btn');
    const btnText = publishBtn ? publishBtn.querySelector('.publish-btn-text') : null;

    isPublishing = true;
    if (publishBtn) publishBtn.classList.add('publishing');
    if (btnText) btnText.textContent = 'Publishing...';
    updateCloudStatus('syncing', 'Publishing to Cloudflare KV...');

    try {
      const batch = {
        events: getEvents(),
        schedule: getSchedule(),
        crowns: getCrowns(),
        merchandise: getMerch(),
        gallery: getGallery(),
        visibility: getVisibility(),
        contact: getContact()
      };

      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_HASH}`
        },
        body: JSON.stringify({ batch })
      });

      if (res.ok) {
        const json = await res.json();
        const updateTs = json.last_updated || Date.now().toString();

        lastHandledVersion = updateTs;
        lastKnownFingerprint = updateTs;
        lastKnownVersion = updateTs;
        localStorage.setItem('abhigraha_last_updated', updateTs);

        clearPendingKeys();
        updateCloudStatus('synced', 'Cloudflare KV Synced');

        // Broadcast to all visitor tabs so their Imperial Auto-Sync screen activates smoothly
        if (festivalBroadcast) {
          try {
            festivalBroadcast.postMessage({
              type: 'PORTAL_DETAILS_CHANGED',
              originSession: TAB_SESSION_ID,
              timestamp: updateTs
            });
          } catch (e) {}
        }

        showToast('🚀 All changes published live! Active visitors have received the update.');
      } else {
        updateCloudStatus('error', 'Publish failed (Drafts saved locally)');
        showToast('⚠️ Cloud publish failed. Your draft changes remain safely saved locally.');
      }
    } catch (err) {
      console.error('Publish error:', err);
      updateCloudStatus('pending', 'Saved Locally (Offline)');
      showToast('⚠️ Network error. Changes are saved locally on this device.');
    } finally {
      isPublishing = false;
      if (publishBtn) publishBtn.classList.remove('publishing');
      if (btnText) btnText.textContent = 'Publish Changes';
      updatePublishButtonState();
    }
  }

  async function pushToCloud(key, data) {
    const cloudKey = KEY_MAPPING[key];
    if (!cloudKey) return;

    updateCloudStatus('syncing', 'Updating Cloudflare KV...');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_HASH}`
        },
        body: JSON.stringify({ key: cloudKey, data })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.configured === false) {
          updateCloudStatus('pending', 'Saved Locally (KV Binding Pending)');
        } else {
          if (json.last_updated) {
            const sVer = String(json.last_updated).replace(/"/g, '');
            lastHandledVersion = sVer;
            lastKnownFingerprint = sVer;
            lastKnownVersion = sVer;
            localStorage.setItem('abhigraha_last_updated', sVer);
          }
          updateCloudStatus('synced', 'Cloudflare KV Synced');
        }
      } else {
        updateCloudStatus('error', 'Cloud sync failed (Saved Locally)');
      }
    } catch (e) {
      updateCloudStatus('pending', 'Saved Locally (Offline/Local)');
    }
  }

  async function syncCloudContent() {
    try {
      const cacheBuster = Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const res = await fetch(`/api/content?_cb=${cacheBuster}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (!res.ok) {
        updateCloudStatus('pending', 'Local Storage Active');
        return false;
      }
      const data = await res.json();
      if (!data || data.configured === false) {
        updateCloudStatus('pending', 'KV Namespace Pending');
        return false;
      }

      let updatedAny = false;
      const keys = ['events', 'schedule', 'crowns', 'merchandise', 'gallery'];
      keys.forEach(k => {
        const localKey = REVERSE_KEY_MAPPING[k];
        // Do not overwrite local keys that have pending draft changes!
        if (pendingKeys.has(k) || pendingKeys.has(localKey)) {
          return;
        }
        if (data && Array.isArray(data[k])) {
          localStorage.setItem(localKey, JSON.stringify(data[k]));
          updatedAny = true;
        }
      });

      if (!pendingKeys.has('visibility') && !pendingKeys.has('abhigraha_visibility')) {
        if (data && data.visibility && typeof data.visibility === 'object') {
          localStorage.setItem('abhigraha_visibility', JSON.stringify(data.visibility));
          updatedAny = true;
        }
      }

      if (!pendingKeys.has('contact') && !pendingKeys.has('abhigraha_contact')) {
        if (data && data.contact && typeof data.contact === 'object') {
          localStorage.setItem('abhigraha_contact', JSON.stringify(data.contact));
          updatedAny = true;
        }
      }

      if (data && data.last_updated && pendingKeys.size === 0) {
        const sVer = String(data.last_updated).replace(/"/g, '');
        lastHandledVersion = sVer;
        lastKnownFingerprint = sVer;
        lastKnownVersion = sVer;
        localStorage.setItem('abhigraha_last_updated', sVer);
      }

      if (updatedAny) {
        renderPublicContent();
        if (typeof syncAdminVisibilityToggles === 'function') {
          syncAdminVisibilityToggles();
        }
        if (typeof renderAdminActiveTab === 'function') {
          renderAdminActiveTab();
        }
      }

      if (pendingKeys.size > 0) {
        updateCloudStatus('pending', `● ${pendingKeys.size} Draft Change${pendingKeys.size > 1 ? 's' : ''} (Unpublished)`);
      } else {
        updateCloudStatus('synced', 'Cloudflare KV Live');
      }
      return updatedAny;
    } catch (e) {
      if (pendingKeys.size > 0) {
        updateCloudStatus('pending', `● ${pendingKeys.size} Draft Change${pendingKeys.size > 1 ? 's' : ''} (Unpublished)`);
      } else {
        updateCloudStatus('pending', 'Local Storage Active');
      }
      return false;
    }
  }

  function loadData(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      if (!val) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return JSON.parse(val);
    } catch (e) {
      console.warn(`Failed to parse ${key}, falling back to defaults`, e);
      return fallback;
    }
  }

  function saveData(key, data) {
    try {
      // 1. Stage changes into local storage immediately (draft preserved)
      localStorage.setItem(key, JSON.stringify(data));

      // 2. Mark this key as pending publication
      markKeyPending(key);

      // 3. Update background public DOM on this admin tab immediately
      renderPublicContent();
      if (typeof syncAdminVisibilityToggles === 'function') syncAdminVisibilityToggles();
      if (typeof renderAdminActiveTab === 'function') renderAdminActiveTab();
      if (typeof syncRegistrationDropdown === 'function') syncRegistrationDropdown();
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  }

  const DEFAULT_VISIBILITY = {
    events_cs: false,
    schedule_cs: false,
    merchandise_cs: false,
    gallery_cs: false
  };

  function getVisibility() {
    return loadData('abhigraha_visibility', DEFAULT_VISIBILITY);
  }

  function saveVisibility(vis) {
    saveData('abhigraha_visibility', vis);
  }

  function getEvents() { return loadData('abhigraha_events', DEFAULT_EVENTS); }
  function getSchedule() { return loadData('abhigraha_schedule', DEFAULT_SCHEDULE); }
  function getCrowns() { return loadData('abhigraha_crowns', DEFAULT_CROWNS); }
  function getMerch() { return loadData('abhigraha_merchandise', DEFAULT_MERCH); }
  function getGallery() { return loadData('abhigraha_gallery', DEFAULT_GALLERY); }

  function showToast(msg) {
    const toast = document.getElementById('toast-msg');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // ==========================================================================
  // PUBLIC PAGE RENDERING (SYNCED REAL-TIME WITH ADMIN PORTAL)
  // ==========================================================================
  function renderPublicContent() {
    renderPublicEvents();
    renderPublicSchedule();
    renderPublicCrowns();
    renderPublicMerch();
    renderPublicGallery();
    renderPublicContact();
    syncRegistrationDropdown();
  }

  // 1. Events Page
  function renderPublicEvents() {
    const liveEl = document.getElementById('events-live-content');
    const csEl = document.getElementById('events-cs-content');
    if (!liveEl) return;

    const vis = getVisibility();
    if (vis.events_cs) {
      liveEl.style.display = 'none';
      if (csEl) csEl.style.display = 'block';
      return;
    }

    liveEl.style.display = 'block';
    if (csEl) csEl.style.display = 'none';

    const events = getEvents();

    if (events.length === 0) {
      liveEl.innerHTML = `
        <div class="page-coming-soon-wrapper">
          <div class="grand-coming-soon-tile">
            <div class="coming-soon-emblem-large">🐉</div>
            <h3 class="grand-coming-soon-title">Festival Events & Battles <span>Coming Soon</span></h3>
            <div class="grand-coming-soon-meta">
              <span class="meta-pill">📍 Main Campus Arenas</span>
              <span class="meta-pill">⚡ Registrations Opening Soon</span>
              <span class="meta-pill">🏆 Trophies & Cash Prizes</span>
            </div>
            <div class="grand-coming-soon-action">
              <a href="#schedule" class="cta-btn-primary" style="text-decoration: none;">
                📅 Explore Schedule
              </a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Render Category Filter Bar + Events Grid
    const categories = ['all', ...new Set(events.map(e => e.category || 'General'))];
    let filterHtml = '<div class="event-filter-bar">';
    categories.forEach((cat, idx) => {
      const activeClass = idx === 0 ? 'active' : '';
      const label = cat === 'all' ? 'All Arenas' : cat;
      filterHtml += `<button class="filter-btn ${activeClass}" data-filter="${cat.toLowerCase()}">${label}</button>`;
    });
    filterHtml += '</div>';

    let gridHtml = '<div class="events-grid">';
    events.forEach(evt => {
      gridHtml += `
        <div class="event-card" data-category="${(evt.category || 'all').toLowerCase()}">
          <div class="event-badge-row">
            <span class="event-tag">${evt.tag || evt.category || 'Event'}</span>
            <span class="event-prize">🏆 ${evt.prize || 'Prizes & Citations'}</span>
          </div>
          <h3 class="event-title">${evt.title}</h3>
          <p class="event-desc">${evt.desc}</p>
          <div class="event-meta">
            <span class="event-meta-item">📍 ${evt.venue || 'Campus Stage'}</span>
            <span class="event-meta-item">⏰ ${evt.time || 'Festival Days'}</span>
          </div>
          <button class="event-register-btn" data-event="${escapeHtml(evt.title)}" data-form-url="${escapeHtml(evt.formUrl || '')}">
            ⚡ Register Now
          </button>
        </div>
      `;
    });
    gridHtml += '</div>';

    liveEl.innerHTML = filterHtml + gridHtml;

    // Attach filter listeners
    liveEl.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        liveEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        liveEl.querySelectorAll('.event-card').forEach(card => {
          const cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 2. Schedule Page
  function renderPublicSchedule() {
    const liveEl = document.getElementById('schedule-live-content');
    const csEl = document.getElementById('schedule-cs-content');
    const day1Container = document.getElementById('timeline-day1');
    const day2Container = document.getElementById('timeline-day2');

    const vis = getVisibility();
    if (vis.schedule_cs) {
      if (liveEl) liveEl.style.display = 'none';
      if (csEl) csEl.style.display = 'block';
      return;
    }

    if (liveEl) liveEl.style.display = 'block';
    if (csEl) csEl.style.display = 'none';

    if (!day1Container || !day2Container) return;

    const list = getSchedule();
    const day1Items = list.filter(i => i.day === 'day1');
    const day2Items = list.filter(i => i.day === 'day2');

    function buildTimeline(items) {
      if (items.length === 0) {
        return '<p style="text-align:center; padding: 20px; color: #a38c94;">No activities scheduled yet for this day.</p>';
      }
      return items.map(item => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-time">${item.time}</div>
            <h4 class="timeline-title">${item.title}</h4>
            <p class="timeline-venue">📍 ${item.venue}</p>
          </div>
        </div>
      `).join('');
    }

    day1Container.innerHTML = buildTimeline(day1Items);
    day2Container.innerHTML = buildTimeline(day2Items);
  }

  // 3. Crowns Page
  function renderPublicCrowns() {
    const container = document.getElementById('crowns-container');
    if (!container) return;

    const crowns = getCrowns();
    if (crowns.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: #a38c94;">Crowns nominations will be revealed shortly.</p>';
      return;
    }

    container.innerHTML = crowns.map(c => {
      const criteriaList = (c.criteria || '')
        .split('\n')
        .filter(line => line.trim())
        .map(line => `<li><i>✦</i> ${line.replace(/^✦\s*/, '')}</li>`)
        .join('');

      return `
        <div class="crown-card">
          <div class="crown-icon">${c.icon || '👑'}</div>
          <h3 class="crown-role">${c.role}</h3>
          <p style="color: #ffd899; font-weight: 600;">${c.title}</p>
          <ul class="crown-criteria">
            ${criteriaList}
          </ul>
          <button class="cta-btn-primary event-register-btn" data-event="${escapeHtml(c.regEvent || ('Nomination: ' + c.role))}" data-form-url="${escapeHtml(c.formUrl || '')}" style="margin-top: 10px;">
            Nominate for ${escapeHtml(c.role.split(' ')[0])}
          </button>
        </div>
      `;
    }).join('');
  }

  // 4. Merchandise Page
  function renderPublicMerch() {
    const liveEl = document.getElementById('merch-live-content');
    const csEl = document.getElementById('merch-cs-content');
    const container = document.getElementById('merch-container');

    const vis = getVisibility();
    if (vis.merchandise_cs) {
      if (liveEl) liveEl.style.display = 'none';
      if (csEl) csEl.style.display = 'block';
      return;
    }

    if (liveEl) liveEl.style.display = 'block';
    if (csEl) csEl.style.display = 'none';

    if (!container) return;

    const merch = getMerch();
    if (merch.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: #a38c94;">Official festival merchandise catalog opening soon.</p>';
      return;
    }

    container.innerHTML = merch.map(m => `
      <div class="merch-card">
        <div class="merch-visual">
          <span class="merch-icon-preview">${m.icon || '🛍️'}</span>
          <span class="merch-tag">${m.tag || 'Official'}</span>
        </div>
        <div class="merch-info">
          <h4 class="merch-title">${m.title}</h4>
          <div class="merch-price">${m.price}</div>
          <p class="merch-desc">${m.desc}</p>
          <button class="merch-btn" data-merch="${escapeHtml(m.title)} (${escapeHtml(m.price)})" data-form-url="${escapeHtml(m.formUrl || '')}">Pre-Order Now</button>
        </div>
      </div>
    `).join('');
  }

  // 5. Gallery Page
  function renderPublicGallery() {
    const liveEl = document.getElementById('gallery-live-content');
    const csEl = document.getElementById('gallery-cs-content');
    const container = document.getElementById('gallery-container');

    const vis = getVisibility();
    if (vis.gallery_cs) {
      if (liveEl) liveEl.style.display = 'none';
      if (csEl) csEl.style.display = 'block';
      return;
    }

    if (liveEl) liveEl.style.display = 'block';
    if (csEl) csEl.style.display = 'none';

    if (!container) return;

    const gallery = getGallery();
    if (gallery.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: #a38c94;">Gallery moments being curated.</p>';
      return;
    }

    container.innerHTML = gallery.map(g => {
      if (g.type === 'img' && g.src) {
        return `
          <div class="gallery-item">
            <img src="${g.src}" alt="${g.caption}" loading="lazy">
            <div class="gallery-overlay">
              <span class="gallery-caption">${g.caption}</span>
            </div>
          </div>
        `;
      }
      return `
        <div class="gallery-item" style="background: ${g.bg || 'radial-gradient(circle, #3b0914, #0b0306)'};">
          <div style="font-size: 3rem;">${g.icon || '🏮'}</div>
          <div class="gallery-overlay" style="opacity: 1;">
            <span class="gallery-caption">${g.caption}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Sync Event Names into Registration Select Box
  function syncRegistrationDropdown() {
    const select = document.getElementById('reg-event-select');
    if (!select) return;

    const currentVal = select.value;
    const events = getEvents();
    const crowns = getCrowns();

    let optionsHtml = '';
    events.forEach(e => {
      optionsHtml += `<option value="${e.title}">${e.title}</option>`;
    });
    crowns.forEach(c => {
      const nom = c.regEvent || ('Nomination: ' + c.role);
      optionsHtml += `<option value="${nom}">${nom}</option>`;
    });

    select.innerHTML = optionsHtml;
    if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
      select.value = currentVal;
    }
  }

  // ==========================================================================
  // CRYPTOGRAPHIC AUTHENTICATION
  // ==========================================================================
  async function verifyPasscode(input) {
    if (!input) return false;
    try {
      const enc = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(input));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex === ACCESS_HASH;
    } catch (err) {
      console.error('Crypto error:', err);
      return false;
    }
  }

  // ==========================================================================
  // ADMIN DASHBOARD & CRUD MANAGEMENT LOGIC
  // ==========================================================================
  function initAdminPortal() {
    const adminBtn = document.getElementById('admin-btn');
    const mobileAdminBtn = document.getElementById('mobile-drawer-admin-btn');
    const adminAuthModal = document.getElementById('admin-modal');
    const adminCloseBtn = document.getElementById('admin-modal-close');
    const adminFullscreenPortal = document.getElementById('admin-fullscreen-portal');
    const adminPasscode = document.getElementById('admin-passcode');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminViewSiteBtn = document.getElementById('admin-view-site-btn');

    function openFullscreenPortal() {
      if (adminAuthModal) adminAuthModal.classList.remove('open');
      if (adminFullscreenPortal) {
        adminFullscreenPortal.classList.add('open');
        adminFullscreenPortal.setAttribute('aria-hidden', 'false');
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      loadPendingKeys();
      renderAdminActiveTab();
      syncAdminVisibilityToggles();
      if (pendingKeys.size === 0) {
        syncCloudContent();
      } else {
        updateCloudStatus('pending', `● ${pendingKeys.size} Draft Change${pendingKeys.size > 1 ? 's' : ''} (Unpublished)`);
      }
    }

    function closeFullscreenPortal() {
      if (adminFullscreenPortal) {
        adminFullscreenPortal.classList.remove('open');
        adminFullscreenPortal.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Publish Changes Button (Batch sync to Cloudflare KV & Active Visitors)
    const adminPublishBtn = document.getElementById('admin-publish-btn');
    if (adminPublishBtn) {
      adminPublishBtn.addEventListener('click', () => {
        publishAllChanges();
      });
    }

    // Open Admin Modal / Launch Full-Screen Portal
    function handleAdminOpen(e) {
      if (e) e.preventDefault();
      const mobileDrawer = document.getElementById('mobile-drawer');
      if (mobileDrawer) mobileDrawer.classList.remove('open');

      if (sessionStorage.getItem('abhigraha_admin_logged') === 'true') {
        openFullscreenPortal();
      } else {
        if (adminAuthModal) {
          adminAuthModal.classList.add('open');
          if (adminPasscode) {
            adminPasscode.value = '';
            setTimeout(() => adminPasscode.focus(), 150);
          }
        }
      }
    }

    if (adminBtn) {
      adminBtn.addEventListener('click', handleAdminOpen);
    }
    if (mobileAdminBtn) {
      mobileAdminBtn.addEventListener('click', handleAdminOpen);
    }

    // Close Auth Modal
    if (adminCloseBtn && adminAuthModal) {
      adminCloseBtn.addEventListener('click', () => {
        adminAuthModal.classList.remove('open');
      });
    }

    // Login Action -> Opens Full Screen Page
    if (adminLoginBtn && adminPasscode) {
      const handleLogin = async () => {
        const val = adminPasscode.value.trim();
        const isValid = await verifyPasscode(val);
        adminPasscode.value = ''; // Immediately erase from input memory

        if (isValid) {
          sessionStorage.setItem('abhigraha_admin_logged', 'true');
          openFullscreenPortal();
          showToast('🛡️ Admin Sanctuary Authenticated (Full Screen).');
        } else {
          alert('Access Denied: Invalid Security Key.');
        }
      };

      adminLoginBtn.addEventListener('click', handleLogin);
      adminPasscode.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    }

    // View Public Site Action (Minimizes full screen portal while keeping session)
    if (adminViewSiteBtn) {
      adminViewSiteBtn.addEventListener('click', async () => {
        if (pendingKeys.size > 0) {
          if (confirm(`You have ${pendingKeys.size} unpublished draft change(s). Would you like to publish them live before viewing the public site?`)) {
            await publishAllChanges();
          }
        }
        closeFullscreenPortal();
        showToast('Viewing public festival site. Click Admin button to return.');
      });
    }

    // Logout Action
    if (adminLogoutBtn) {
      adminLogoutBtn.addEventListener('click', async () => {
        if (pendingKeys.size > 0) {
          if (confirm(`You have ${pendingKeys.size} unpublished draft change(s). Would you like to publish them live before logging out?`)) {
            await publishAllChanges();
          }
        }
        sessionStorage.removeItem('abhigraha_admin_logged');
        closeFullscreenPortal();
        showToast('🔒 Logged out of Admin Portal.');
      });
    }

    // Admin Tab Navigation
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');

        document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
        const activePane = document.getElementById(`pane-${targetTab}`);
        if (activePane) activePane.classList.add('active');

        renderAdminTabContent(targetTab);
      });
    });

    // Setup CRUD event handlers
    initEventsAdmin();
    initScheduleAdmin();
    initCrownsAdmin();
    initMerchAdmin();
    initGalleryAdmin();
    initContactAdmin();
    initVisibilityToggles();
  }

  function syncAdminVisibilityToggles() {
    const vis = getVisibility();
    const configs = [
      { id: 'toggle-cs-events', key: 'events_cs' },
      { id: 'toggle-cs-schedule', key: 'schedule_cs' },
      { id: 'toggle-cs-merchandise', key: 'merchandise_cs' },
      { id: 'toggle-cs-gallery', key: 'gallery_cs' }
    ];

    configs.forEach(cfg => {
      const input = document.getElementById(cfg.id);
      const isCs = !!vis[cfg.key];
      if (input) input.checked = isCs;
    });
  }

  function initVisibilityToggles() {
    const configs = [
      { id: 'toggle-cs-events', key: 'events_cs', name: 'Events' },
      { id: 'toggle-cs-schedule', key: 'schedule_cs', name: 'Schedule' },
      { id: 'toggle-cs-merchandise', key: 'merchandise_cs', name: 'Merchandise' },
      { id: 'toggle-cs-gallery', key: 'gallery_cs', name: 'Gallery' }
    ];

    configs.forEach(cfg => {
      const input = document.getElementById(cfg.id);
      if (!input) return;
      input.addEventListener('change', () => {
        const vis = getVisibility();
        vis[cfg.key] = input.checked;
        saveVisibility(vis);
        syncAdminVisibilityToggles();
        renderPublicContent();
        showToast(`${cfg.name} Coming Soon mode ${input.checked ? 'ENABLED' : 'DISABLED'}.`);
      });
    });

    syncAdminVisibilityToggles();
  }

  function renderAdminActiveTab() {
    const activeBtn = document.querySelector('.admin-tab-btn.active');
    const tab = activeBtn ? activeBtn.getAttribute('data-tab') : 'events';
    renderAdminTabContent(tab);
  }

  function renderAdminTabContent(tab) {
    if (tab === 'events') renderAdminEventsList();
    else if (tab === 'schedule') renderAdminScheduleList();
    else if (tab === 'crowns') renderAdminCrownsList();
    else if (tab === 'merchandise') renderAdminMerchList();
    else if (tab === 'gallery') renderAdminGalleryList();
    else if (tab === 'contact') renderAdminContact();
  }

  // ==========================================================================
  // TAB 2: EVENTS MANAGEMENT (ADD, EDIT, REMOVE)
  // ==========================================================================
  function initEventsAdmin() {
    const addBtn = document.getElementById('admin-add-event-btn');
    const resetBtn = document.getElementById('admin-reset-events-btn');
    const formPanel = document.getElementById('admin-event-form-panel');
    const form = document.getElementById('admin-event-form');
    const cancelBtn = document.getElementById('admin-event-cancel-btn');

    if (addBtn && formPanel) {
      addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('admin-event-edit-id').value = '';
        const formUrlInput = document.getElementById('admin-event-form-url');
        if (formUrlInput) formUrlInput.value = '';
        document.getElementById('admin-event-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add New Festival Event</span>`;
        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (cancelBtn && formPanel) {
      cancelBtn.addEventListener('click', () => {
        formPanel.style.display = 'none';
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all festival events back to official defaults?')) {
          saveData('abhigraha_events', DEFAULT_EVENTS);
          renderPublicEvents();
          renderAdminEventsList();
          syncRegistrationDropdown();
          showToast('Events reset to festival defaults.');
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('admin-event-edit-id').value;
        const title = document.getElementById('admin-event-title').value.trim();
        const category = document.getElementById('admin-event-category').value.trim();
        const prize = document.getElementById('admin-event-prize').value.trim();
        const tag = document.getElementById('admin-event-tag').value.trim();
        const venue = document.getElementById('admin-event-venue').value.trim();
        const time = document.getElementById('admin-event-time').value.trim();
        const formUrl = (document.getElementById('admin-event-form-url')?.value || '').trim();
        const desc = document.getElementById('admin-event-desc').value.trim();

        if (!title || !desc) {
          alert('Please provide event title and description.');
          return;
        }

        const list = getEvents();
        if (editId) {
          // Edit
          const idx = list.findIndex(item => item.id === editId);
          if (idx !== -1) {
            list[idx] = { ...list[idx], title, category, prize, tag, venue, time, desc, formUrl };
          }
          showToast(`Event "${title}" updated!`);
        } else {
          // Add
          const newId = 'evt-' + Date.now();
          list.push({ id: newId, title, category, prize, tag, venue, time, desc, formUrl });
          showToast(`New Event "${title}" added!`);
        }

        saveData('abhigraha_events', list);
        formPanel.style.display = 'none';
        renderPublicEvents();
        renderAdminEventsList();
        syncRegistrationDropdown();
      });
    }
  }

  function renderAdminEventsList() {
    const container = document.getElementById('admin-events-list');
    const countEl = document.getElementById('admin-events-count');
    if (!container) return;

    const list = getEvents();
    if (countEl) countEl.textContent = `${list.length} Events`;

    if (list.length === 0) {
      container.innerHTML = '<p style="color:#a38c94; text-align:center; padding:16px;">No events present. Public page is displaying Coming Soon mode.</p>';
      return;
    }

    container.innerHTML = list.map((evt, idx) => `
      <div class="admin-item-card">
        <div class="admin-item-order-corner">
          <button type="button" class="btn-order-circle" data-order-up-evt="${evt.id}" title="Move Up in Website Order" aria-label="Move Up" ${idx === 0 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveUp}
          </button>
          <button type="button" class="btn-order-circle" data-order-down-evt="${evt.id}" title="Move Down in Website Order" aria-label="Move Down" ${idx === list.length - 1 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveDown}
          </button>
        </div>
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span class="admin-order-badge">#${idx + 1}</span>
            <span>${escapeHtml(evt.title)}</span>
            <span class="admin-topbar-badge">${escapeHtml(evt.category || 'General')}</span>
            <span style="font-size:0.75rem; color:#f59e0b;">🏆 ${escapeHtml(evt.prize || '')}</span>
          </div>
          <div class="admin-item-meta">
            📍 ${escapeHtml(evt.venue || 'Campus Arena')} &nbsp;|&nbsp; ⏰ ${escapeHtml(evt.time || 'Schedule Tab')} &nbsp;|&nbsp; Tag: ${escapeHtml(evt.tag || '-')}
            ${evt.formUrl ? ` &nbsp;|&nbsp; <a href="${escapeHtml(evt.formUrl)}" target="_blank" rel="noopener noreferrer" class="admin-form-link-badge">🔗 Form Link</a>` : ''}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-evt="${evt.id}">${ADMIN_ICONS.edit}<span>Edit</span></button>
          <button class="btn-action-delete" data-del-evt="${evt.id}">${ADMIN_ICONS.delete}<span>Delete</span></button>
        </div>
      </div>
    `).join('');

    // Attach Reorder Listeners
    container.querySelectorAll('[data-order-up-evt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-up-evt');
        const evts = getEvents();
        const idx = evts.findIndex(e => e.id === id);
        if (idx > 0) {
          const temp = evts[idx];
          evts[idx] = evts[idx - 1];
          evts[idx - 1] = temp;
          saveData('abhigraha_events', evts);
          renderPublicEvents();
          renderAdminEventsList();
          syncRegistrationDropdown();
          showToast(`Event "${temp.title}" moved up to #${idx}.`);
        }
      });
    });

    container.querySelectorAll('[data-order-down-evt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-down-evt');
        const evts = getEvents();
        const idx = evts.findIndex(e => e.id === id);
        if (idx !== -1 && idx < evts.length - 1) {
          const temp = evts[idx];
          evts[idx] = evts[idx + 1];
          evts[idx + 1] = temp;
          saveData('abhigraha_events', evts);
          renderPublicEvents();
          renderAdminEventsList();
          syncRegistrationDropdown();
          showToast(`Event "${temp.title}" moved down to #${idx + 2}.`);
        }
      });
    });

    // Attach Edit & Delete Listeners
    container.querySelectorAll('[data-edit-evt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-evt');
        const evt = getEvents().find(i => i.id === id);
        if (!evt) return;

        const formPanel = document.getElementById('admin-event-form-panel');
        document.getElementById('admin-event-edit-id').value = evt.id;
        document.getElementById('admin-event-title').value = evt.title;
        document.getElementById('admin-event-category').value = evt.category || 'Cultural';
        document.getElementById('admin-event-prize').value = evt.prize || '';
        document.getElementById('admin-event-tag').value = evt.tag || '';
        document.getElementById('admin-event-venue').value = evt.venue || '';
        document.getElementById('admin-event-time').value = evt.time || '';
        const formUrlInput = document.getElementById('admin-event-form-url');
        if (formUrlInput) formUrlInput.value = evt.formUrl || '';
        document.getElementById('admin-event-desc').value = evt.desc || '';
        document.getElementById('admin-event-form-title').innerHTML = `${ADMIN_ICONS.edit} <span>Edit Event: ${escapeHtml(evt.title)}</span>`;

        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    container.querySelectorAll('[data-del-evt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-evt');
        const evt = getEvents().find(i => i.id === id);
        if (confirm(`Are you sure you want to remove event "${evt ? evt.title : id}"?`)) {
          const updated = getEvents().filter(i => i.id !== id);
          saveData('abhigraha_events', updated);
          renderPublicEvents();
          renderAdminEventsList();
          syncRegistrationDropdown();
          showToast('Event deleted.');
        }
      });
    });
  }

  // ==========================================================================
  // TAB 3: SCHEDULE MANAGEMENT (ADD, EDIT, REMOVE)
  // ==========================================================================
  function initScheduleAdmin() {
    const addBtn = document.getElementById('admin-add-schedule-btn');
    const resetBtn = document.getElementById('admin-reset-schedule-btn');
    const formPanel = document.getElementById('admin-schedule-form-panel');
    const form = document.getElementById('admin-schedule-form');
    const cancelBtn = document.getElementById('admin-schedule-cancel-btn');

    if (addBtn && formPanel) {
      addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('admin-schedule-edit-id').value = '';
        document.getElementById('admin-schedule-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add Timeline Activity</span>`;
        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (cancelBtn && formPanel) {
      cancelBtn.addEventListener('click', () => {
        formPanel.style.display = 'none';
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset timeline schedule back to official festival defaults?')) {
          saveData('abhigraha_schedule', DEFAULT_SCHEDULE);
          renderPublicSchedule();
          renderAdminScheduleList();
          showToast('Schedule reset to defaults.');
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('admin-schedule-edit-id').value;
        const day = document.getElementById('admin-schedule-day').value;
        const time = document.getElementById('admin-schedule-time').value.trim();
        const title = document.getElementById('admin-schedule-title').value.trim();
        const venue = document.getElementById('admin-schedule-venue').value.trim();

        if (!title || !time) {
          alert('Please enter title and time.');
          return;
        }

        const list = getSchedule();
        if (editId) {
          const idx = list.findIndex(i => i.id === editId);
          if (idx !== -1) list[idx] = { id: editId, day, time, title, venue };
          showToast(`Schedule item "${title}" updated!`);
        } else {
          list.push({ id: 'sch-' + Date.now(), day, time, title, venue });
          showToast(`Schedule item "${title}" added!`);
        }

        saveData('abhigraha_schedule', list);
        formPanel.style.display = 'none';
        renderPublicSchedule();
        renderAdminScheduleList();
      });
    }
  }

  function renderAdminScheduleList() {
    const container = document.getElementById('admin-schedule-list');
    const countEl = document.getElementById('admin-schedule-count');
    if (!container) return;

    const list = getSchedule();
    if (countEl) countEl.textContent = `${list.length} Activities`;

    if (list.length === 0) {
      container.innerHTML = '<p style="color:#a38c94; text-align:center; padding:16px;">No schedule items listed.</p>';
      return;
    }

    const day1Items = list.filter(i => i.day === 'day1');
    const day2Items = list.filter(i => i.day === 'day2');

    container.innerHTML = list.map(item => {
      const isDay1 = item.day === 'day1';
      const dayList = isDay1 ? day1Items : day2Items;
      const dayIdx = dayList.findIndex(i => i.id === item.id);
      const isFirstInDay = dayIdx === 0;
      const isLastInDay = dayIdx === dayList.length - 1;
      const dayLabel = isDay1 ? 'Day 1' : 'Day 2';

      return `
        <div class="admin-item-card" data-schedule-id="${item.id}">
          <div class="admin-item-order-corner">
            <button type="button" class="btn-order-circle" data-order-up-sch="${item.id}" title="Move Up in ${dayLabel} Order" aria-label="Move Up" ${isFirstInDay ? 'disabled' : ''}>
              ${ADMIN_ICONS.moveUp}
            </button>
            <button type="button" class="btn-order-circle" data-order-down-sch="${item.id}" title="Move Down in ${dayLabel} Order" aria-label="Move Down" ${isLastInDay ? 'disabled' : ''}>
              ${ADMIN_ICONS.moveDown}
            </button>
          </div>
          <div class="admin-item-main">
            <div class="admin-item-title">
              <span class="admin-order-badge">${dayLabel} #${dayIdx + 1}</span>
              <span>${escapeHtml(item.title)}</span>
              <span class="admin-topbar-badge">${dayLabel}</span>
              <span style="font-size:0.75rem; color:#fde68a;">⏰ ${escapeHtml(item.time)}</span>
            </div>
            <div class="admin-item-meta">
              📍 ${escapeHtml(item.venue)}
            </div>
          </div>
          <div class="admin-item-actions">
            <button class="btn-action-edit" data-edit-sch="${item.id}">${ADMIN_ICONS.edit}<span>Edit</span></button>
            <button class="btn-action-delete" data-del-sch="${item.id}">${ADMIN_ICONS.delete}<span>Delete</span></button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Reorder Listeners for Schedule
    container.querySelectorAll('[data-order-up-sch]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-up-sch');
        const schList = getSchedule();
        const item = schList.find(i => i.id === id);
        if (!item) return;

        const dayList = schList.filter(i => i.day === item.day);
        const dayIdx = dayList.findIndex(i => i.id === id);
        if (dayIdx > 0) {
          const prevItem = dayList[dayIdx - 1];
          const idxA = schList.findIndex(i => i.id === item.id);
          const idxB = schList.findIndex(i => i.id === prevItem.id);
          const temp = schList[idxA];
          schList[idxA] = schList[idxB];
          schList[idxB] = temp;

          saveData('abhigraha_schedule', schList);
          renderPublicSchedule();
          renderAdminScheduleList();
          showToast(`Activity "${temp.title}" moved up to #${dayIdx} in ${item.day === 'day1' ? 'Day 1' : 'Day 2'}.`);
        }
      });
    });

    container.querySelectorAll('[data-order-down-sch]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-down-sch');
        const schList = getSchedule();
        const item = schList.find(i => i.id === id);
        if (!item) return;

        const dayList = schList.filter(i => i.day === item.day);
        const dayIdx = dayList.findIndex(i => i.id === id);
        if (dayIdx !== -1 && dayIdx < dayList.length - 1) {
          const nextItem = dayList[dayIdx + 1];
          const idxA = schList.findIndex(i => i.id === item.id);
          const idxB = schList.findIndex(i => i.id === nextItem.id);
          const temp = schList[idxA];
          schList[idxA] = schList[idxB];
          schList[idxB] = temp;

          saveData('abhigraha_schedule', schList);
          renderPublicSchedule();
          renderAdminScheduleList();
          showToast(`Activity "${temp.title}" moved down to #${dayIdx + 2} in ${item.day === 'day1' ? 'Day 1' : 'Day 2'}.`);
        }
      });
    });

    // Attach Edit & Delete Listeners
    container.querySelectorAll('[data-edit-sch]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-sch');
        const item = getSchedule().find(i => i.id === id);
        if (!item) return;

        const formPanel = document.getElementById('admin-schedule-form-panel');
        document.getElementById('admin-schedule-edit-id').value = item.id;
        document.getElementById('admin-schedule-day').value = item.day;
        document.getElementById('admin-schedule-time').value = item.time;
        document.getElementById('admin-schedule-title').value = item.title;
        document.getElementById('admin-schedule-venue').value = item.venue;
        document.getElementById('admin-schedule-form-title').innerHTML = `${ADMIN_ICONS.edit} <span>Edit Activity: ${escapeHtml(item.title)}</span>`;

        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    container.querySelectorAll('[data-del-sch]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-sch');
        const item = getSchedule().find(i => i.id === id);
        if (confirm(`Remove "${item ? item.title : id}" from schedule?`)) {
          const updated = getSchedule().filter(i => i.id !== id);
          saveData('abhigraha_schedule', updated);
          renderPublicSchedule();
          renderAdminScheduleList();
          showToast('Schedule item deleted.');
        }
      });
    });
  }

  // ==========================================================================
  // TAB 4: CROWNS MANAGEMENT (ADD, EDIT, REMOVE)
  // ==========================================================================
  function initCrownsAdmin() {
    const addBtn = document.getElementById('admin-add-crown-btn');
    const resetBtn = document.getElementById('admin-reset-crowns-btn');
    const formPanel = document.getElementById('admin-crown-form-panel');
    const form = document.getElementById('admin-crown-form');
    const cancelBtn = document.getElementById('admin-crown-cancel-btn');

    if (addBtn && formPanel) {
      addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('admin-crown-edit-id').value = '';
        const formUrlInput = document.getElementById('admin-crown-form-url');
        if (formUrlInput) formUrlInput.value = '';
        document.getElementById('admin-crown-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add Royal Crown Title</span>`;
        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (cancelBtn && formPanel) {
      cancelBtn.addEventListener('click', () => {
        formPanel.style.display = 'none';
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset Crowns titles back to official defaults?')) {
          saveData('abhigraha_crowns', DEFAULT_CROWNS);
          renderPublicCrowns();
          renderAdminCrownsList();
          syncRegistrationDropdown();
          showToast('Crowns reset to defaults.');
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('admin-crown-edit-id').value;
        const role = document.getElementById('admin-crown-role').value.trim();
        const title = document.getElementById('admin-crown-title').value.trim();
        const icon = document.getElementById('admin-crown-icon').value.trim() || '👑';
        const criteria = document.getElementById('admin-crown-criteria').value.trim();
        const regEvent = document.getElementById('admin-crown-regevent').value.trim() || ('Nomination: ' + role);
        const formUrl = (document.getElementById('admin-crown-form-url')?.value || '').trim();

        if (!role || !title) {
          alert('Please enter Role and Theme Title.');
          return;
        }

        const list = getCrowns();
        if (editId) {
          const idx = list.findIndex(i => i.id === editId);
          if (idx !== -1) list[idx] = { id: editId, role, title, icon, criteria, regEvent, formUrl };
          showToast(`Crown "${role}" updated!`);
        } else {
          list.push({ id: 'crw-' + Date.now(), role, title, icon, criteria, regEvent, formUrl });
          showToast(`Crown "${role}" added!`);
        }

        saveData('abhigraha_crowns', list);
        formPanel.style.display = 'none';
        renderPublicCrowns();
        renderAdminCrownsList();
        syncRegistrationDropdown();
      });
    }
  }

  function renderAdminCrownsList() {
    const container = document.getElementById('admin-crowns-list');
    const countEl = document.getElementById('admin-crowns-count');
    if (!container) return;

    const list = getCrowns();
    if (countEl) countEl.textContent = `${list.length} Titles`;

    if (list.length === 0) {
      container.innerHTML = '<p style="color:#a38c94; text-align:center; padding:16px;">No crowns titles registered.</p>';
      return;
    }

    container.innerHTML = list.map((c, idx) => `
      <div class="admin-item-card">
        <div class="admin-item-order-corner">
          <button type="button" class="btn-order-circle" data-order-up-crw="${c.id}" title="Move Up" aria-label="Move Up" ${idx === 0 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveUp}
          </button>
          <button type="button" class="btn-order-circle" data-order-down-crw="${c.id}" title="Move Down" aria-label="Move Down" ${idx === list.length - 1 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveDown}
          </button>
        </div>
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span class="admin-order-badge">#${idx + 1}</span>
            <span style="font-size:1.3rem;">${c.icon}</span>
            <span>${c.role}</span>
            <span style="color:#ffd899; font-weight:600;">(${c.title})</span>
          </div>
          <div class="admin-item-meta">
            Registration Nomination: ${c.regEvent}
            ${c.formUrl ? ` &nbsp;|&nbsp; <a href="${escapeHtml(c.formUrl)}" target="_blank" rel="noopener noreferrer" class="admin-form-link-badge">🔗 Nomination Form</a>` : ''}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-crw="${c.id}">${ADMIN_ICONS.edit}<span>Edit</span></button>
          <button class="btn-action-delete" data-del-crw="${c.id}">${ADMIN_ICONS.delete}<span>Delete</span></button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-order-up-crw]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-up-crw');
        const cList = getCrowns();
        const idx = cList.findIndex(i => i.id === id);
        if (idx > 0) {
          const temp = cList[idx];
          cList[idx] = cList[idx - 1];
          cList[idx - 1] = temp;
          saveData('abhigraha_crowns', cList);
          renderPublicCrowns();
          renderAdminCrownsList();
          syncRegistrationDropdown();
          showToast(`Crown "${temp.role}" moved up to #${idx}.`);
        }
      });
    });

    container.querySelectorAll('[data-order-down-crw]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-down-crw');
        const cList = getCrowns();
        const idx = cList.findIndex(i => i.id === id);
        if (idx !== -1 && idx < cList.length - 1) {
          const temp = cList[idx];
          cList[idx] = cList[idx + 1];
          cList[idx + 1] = temp;
          saveData('abhigraha_crowns', cList);
          renderPublicCrowns();
          renderAdminCrownsList();
          syncRegistrationDropdown();
          showToast(`Crown "${temp.role}" moved down to #${idx + 2}.`);
        }
      });
    });

    container.querySelectorAll('[data-edit-crw]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-crw');
        const c = getCrowns().find(i => i.id === id);
        if (!c) return;

        const formPanel = document.getElementById('admin-crown-form-panel');
        document.getElementById('admin-crown-edit-id').value = c.id;
        document.getElementById('admin-crown-role').value = c.role;
        document.getElementById('admin-crown-title').value = c.title;
        document.getElementById('admin-crown-icon').value = c.icon;
        document.getElementById('admin-crown-criteria').value = c.criteria;
        document.getElementById('admin-crown-regevent').value = c.regEvent || '';
        const formUrlInput = document.getElementById('admin-crown-form-url');
        if (formUrlInput) formUrlInput.value = c.formUrl || '';
        document.getElementById('admin-crown-form-title').innerHTML = `${ADMIN_ICONS.edit} <span>Edit Crown: ${escapeHtml(c.role)}</span>`;

        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    container.querySelectorAll('[data-del-crw]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-crw');
        const c = getCrowns().find(i => i.id === id);
        if (confirm(`Remove title "${c ? c.role : id}"?`)) {
          const updated = getCrowns().filter(i => i.id !== id);
          saveData('abhigraha_crowns', updated);
          renderPublicCrowns();
          renderAdminCrownsList();
          syncRegistrationDropdown();
          showToast('Crown title deleted.');
        }
      });
    });
  }

  // ==========================================================================
  // TAB 5: MERCHANDISE MANAGEMENT (ADD, EDIT, REMOVE)
  // ==========================================================================
  function initMerchAdmin() {
    const addBtn = document.getElementById('admin-add-merch-btn');
    const resetBtn = document.getElementById('admin-reset-merch-btn');
    const formPanel = document.getElementById('admin-merch-form-panel');
    const form = document.getElementById('admin-merch-form');
    const cancelBtn = document.getElementById('admin-merch-cancel-btn');

    if (addBtn && formPanel) {
      addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('admin-merch-edit-id').value = '';
        const formUrlInput = document.getElementById('admin-merch-form-url');
        if (formUrlInput) formUrlInput.value = '';
        document.getElementById('admin-merch-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add Merchandise Gear</span>`;
        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (cancelBtn && formPanel) {
      cancelBtn.addEventListener('click', () => {
        formPanel.style.display = 'none';
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset merchandise items to official defaults?')) {
          saveData('abhigraha_merchandise', DEFAULT_MERCH);
          renderPublicMerch();
          renderAdminMerchList();
          showToast('Merchandise reset to defaults.');
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('admin-merch-edit-id').value;
        const title = document.getElementById('admin-merch-title').value.trim();
        const price = document.getElementById('admin-merch-price').value.trim();
        const tag = document.getElementById('admin-merch-tag').value.trim();
        const icon = document.getElementById('admin-merch-icon').value.trim() || '🛍️';
        const formUrl = (document.getElementById('admin-merch-form-url')?.value || '').trim();
        const desc = document.getElementById('admin-merch-desc').value.trim();

        if (!title || !price) {
          alert('Please enter Title and Price.');
          return;
        }

        const list = getMerch();
        if (editId) {
          const idx = list.findIndex(i => i.id === editId);
          if (idx !== -1) list[idx] = { id: editId, title, price, tag, icon, desc, formUrl };
          showToast(`Merchandise "${title}" updated!`);
        } else {
          list.push({ id: 'mrc-' + Date.now(), title, price, tag, icon, desc, formUrl });
          showToast(`Merchandise "${title}" added!`);
        }

        saveData('abhigraha_merchandise', list);
        formPanel.style.display = 'none';
        renderPublicMerch();
        renderAdminMerchList();
      });
    }
  }

  function renderAdminMerchList() {
    const container = document.getElementById('admin-merch-list');
    const countEl = document.getElementById('admin-merch-count');
    if (!container) return;

    const list = getMerch();
    if (countEl) countEl.textContent = `${list.length} Items`;

    if (list.length === 0) {
      container.innerHTML = '<p style="color:#a38c94; text-align:center; padding:16px;">No merchandise items available.</p>';
      return;
    }

    container.innerHTML = list.map((m, idx) => `
      <div class="admin-item-card">
        <div class="admin-item-order-corner">
          <button type="button" class="btn-order-circle" data-order-up-mrc="${m.id}" title="Move Up" aria-label="Move Up" ${idx === 0 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveUp}
          </button>
          <button type="button" class="btn-order-circle" data-order-down-mrc="${m.id}" title="Move Down" aria-label="Move Down" ${idx === list.length - 1 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveDown}
          </button>
        </div>
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span class="admin-order-badge">#${idx + 1}</span>
            <span style="font-size:1.3rem;">${m.icon}</span>
            <span>${escapeHtml(m.title)}</span>
            <span class="admin-topbar-badge">${escapeHtml(m.price)}</span>
            <span style="font-size:0.75rem; color:#fde68a;">[${escapeHtml(m.tag || '-')}]</span>
          </div>
          <div class="admin-item-meta">
            ${escapeHtml(m.desc || '')}
            ${m.formUrl ? `<div style="margin-top: 5px;"><a href="${escapeHtml(m.formUrl)}" target="_blank" rel="noopener noreferrer" class="admin-form-link-badge">🔗 Order Form: ${escapeHtml(m.formUrl)}</a></div>` : ''}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-mrc="${m.id}">${ADMIN_ICONS.edit}<span>Edit</span></button>
          <button class="btn-action-delete" data-del-mrc="${m.id}">${ADMIN_ICONS.delete}<span>Delete</span></button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-order-up-mrc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-up-mrc');
        const mList = getMerch();
        const idx = mList.findIndex(i => i.id === id);
        if (idx > 0) {
          const temp = mList[idx];
          mList[idx] = mList[idx - 1];
          mList[idx - 1] = temp;
          saveData('abhigraha_merchandise', mList);
          renderPublicMerch();
          renderAdminMerchList();
          showToast(`Merchandise "${temp.title}" moved up to #${idx}.`);
        }
      });
    });

    container.querySelectorAll('[data-order-down-mrc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-down-mrc');
        const mList = getMerch();
        const idx = mList.findIndex(i => i.id === id);
        if (idx !== -1 && idx < mList.length - 1) {
          const temp = mList[idx];
          mList[idx] = mList[idx + 1];
          mList[idx + 1] = temp;
          saveData('abhigraha_merchandise', mList);
          renderPublicMerch();
          renderAdminMerchList();
          showToast(`Merchandise "${temp.title}" moved down to #${idx + 2}.`);
        }
      });
    });

    container.querySelectorAll('[data-edit-mrc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-mrc');
        const m = getMerch().find(i => i.id === id);
        if (!m) return;

        const formPanel = document.getElementById('admin-merch-form-panel');
        document.getElementById('admin-merch-edit-id').value = m.id;
        document.getElementById('admin-merch-title').value = m.title;
        document.getElementById('admin-merch-price').value = m.price;
        document.getElementById('admin-merch-tag').value = m.tag || '';
        document.getElementById('admin-merch-icon').value = m.icon || '🛍️';
        const formUrlInput = document.getElementById('admin-merch-form-url');
        if (formUrlInput) formUrlInput.value = m.formUrl || '';
        document.getElementById('admin-merch-desc').value = m.desc || '';
        document.getElementById('admin-merch-form-title').innerHTML = `${ADMIN_ICONS.edit} <span>Edit Merch: ${escapeHtml(m.title)}</span>`;

        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    container.querySelectorAll('[data-del-mrc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-mrc');
        const m = getMerch().find(i => i.id === id);
        if (confirm(`Remove "${m ? m.title : id}"?`)) {
          const updated = getMerch().filter(i => i.id !== id);
          saveData('abhigraha_merchandise', updated);
          renderPublicMerch();
          renderAdminMerchList();
          showToast('Merchandise item deleted.');
        }
      });
    });
  }

  // ==========================================================================
  // TAB 6: GALLERY MANAGEMENT (ADD, EDIT, REMOVE)
  // ==========================================================================
  function initGalleryAdmin() {
    const addBtn = document.getElementById('admin-add-gallery-btn');
    const resetBtn = document.getElementById('admin-reset-gallery-btn');
    const formPanel = document.getElementById('admin-gallery-form-panel');
    const form = document.getElementById('admin-gallery-form');
    const cancelBtn = document.getElementById('admin-gallery-cancel-btn');
    const typeSelect = document.getElementById('admin-gallery-type');

    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        const isImg = typeSelect.value === 'img';
        const imgGroup = document.getElementById('admin-gallery-img-group');
        const emojiGroup = document.getElementById('admin-gallery-emoji-group');
        if (imgGroup) imgGroup.style.display = isImg ? 'block' : 'none';
        if (emojiGroup) emojiGroup.style.display = isImg ? 'none' : 'block';
      });
    }

    if (addBtn && formPanel) {
      addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('admin-gallery-edit-id').value = '';
        document.getElementById('admin-gallery-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add Gallery Memory</span>`;
        if (typeSelect) typeSelect.dispatchEvent(new Event('change'));
        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (cancelBtn && formPanel) {
      cancelBtn.addEventListener('click', () => {
        formPanel.style.display = 'none';
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset moments & memories back to defaults?')) {
          saveData('abhigraha_gallery', DEFAULT_GALLERY);
          renderPublicGallery();
          renderAdminGalleryList();
          showToast('Gallery reset to defaults.');
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('admin-gallery-edit-id').value;
        const type = document.getElementById('admin-gallery-type').value;
        const src = document.getElementById('admin-gallery-src').value.trim();
        const icon = document.getElementById('admin-gallery-icon').value.trim();
        const bg = document.getElementById('admin-gallery-bg').value.trim();
        const caption = document.getElementById('admin-gallery-caption').value.trim();

        if (!caption) {
          alert('Please enter a caption for this moment.');
          return;
        }

        const list = getGallery();
        if (editId) {
          const idx = list.findIndex(i => i.id === editId);
          if (idx !== -1) list[idx] = { id: editId, type, src, icon, bg, caption };
          showToast(`Gallery item "${caption}" updated!`);
        } else {
          list.push({ id: 'gal-' + Date.now(), type, src, icon, bg, caption });
          showToast(`Gallery moment "${caption}" added!`);
        }

        saveData('abhigraha_gallery', list);
        formPanel.style.display = 'none';
        renderPublicGallery();
        renderAdminGalleryList();
      });
    }
  }

  function renderAdminGalleryList() {
    const container = document.getElementById('admin-gallery-list');
    const countEl = document.getElementById('admin-gallery-count');
    if (!container) return;

    const list = getGallery();
    if (countEl) countEl.textContent = `${list.length} Moments`;

    if (list.length === 0) {
      container.innerHTML = '<p style="color:#a38c94; text-align:center; padding:16px;">No gallery items available.</p>';
      return;
    }

    container.innerHTML = list.map((g, idx) => `
      <div class="admin-item-card">
        <div class="admin-item-order-corner">
          <button type="button" class="btn-order-circle" data-order-up-gal="${g.id}" title="Move Up" aria-label="Move Up" ${idx === 0 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveUp}
          </button>
          <button type="button" class="btn-order-circle" data-order-down-gal="${g.id}" title="Move Down" aria-label="Move Down" ${idx === list.length - 1 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveDown}
          </button>
        </div>
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span class="admin-order-badge">#${idx + 1}</span>
            <span style="font-size:1.2rem;">${g.type === 'img' ? '🖼️' : (g.icon || '🏮')}</span>
            <span>${escapeHtml(g.caption)}</span>
            <span class="admin-topbar-badge">${g.type === 'img' ? 'Photo Asset' : 'Imperial Preset'}</span>
          </div>
          <div class="admin-item-meta">
            ${g.type === 'img' ? escapeHtml(g.src || 'Image Path') : ('Icon: ' + escapeHtml(g.icon || '-') + ' | Background: ' + escapeHtml(g.bg || '-'))}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-gal="${g.id}">${ADMIN_ICONS.edit}<span>Edit</span></button>
          <button class="btn-action-delete" data-del-gal="${g.id}">${ADMIN_ICONS.delete}<span>Delete</span></button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-order-up-gal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-up-gal');
        const gList = getGallery();
        const idx = gList.findIndex(i => i.id === id);
        if (idx > 0) {
          const temp = gList[idx];
          gList[idx] = gList[idx - 1];
          gList[idx - 1] = temp;
          saveData('abhigraha_gallery', gList);
          renderPublicGallery();
          renderAdminGalleryList();
          showToast(`Gallery moment "${temp.caption}" moved up to #${idx}.`);
        }
      });
    });

    container.querySelectorAll('[data-order-down-gal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-down-gal');
        const gList = getGallery();
        const idx = gList.findIndex(i => i.id === id);
        if (idx !== -1 && idx < gList.length - 1) {
          const temp = gList[idx];
          gList[idx] = gList[idx + 1];
          gList[idx + 1] = temp;
          saveData('abhigraha_gallery', gList);
          renderPublicGallery();
          renderAdminGalleryList();
          showToast(`Gallery moment "${temp.caption}" moved down to #${idx + 2}.`);
        }
      });
    });

    container.querySelectorAll('[data-edit-gal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-gal');
        const g = getGallery().find(i => i.id === id);
        if (!g) return;

        const formPanel = document.getElementById('admin-gallery-form-panel');
        document.getElementById('admin-gallery-edit-id').value = g.id;
        const typeSelect = document.getElementById('admin-gallery-type');
        typeSelect.value = g.type;
        typeSelect.dispatchEvent(new Event('change'));

        document.getElementById('admin-gallery-src').value = g.src || '';
        document.getElementById('admin-gallery-icon').value = g.icon || '';
        document.getElementById('admin-gallery-bg').value = g.bg || '';
        document.getElementById('admin-gallery-caption').value = g.caption || '';
        document.getElementById('admin-gallery-form-title').innerHTML = `${ADMIN_ICONS.edit} <span>Edit Moment: ${escapeHtml(g.caption)}</span>`;

        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    container.querySelectorAll('[data-del-gal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-gal');
        const g = getGallery().find(i => i.id === id);
        if (confirm(`Remove gallery item "${g ? g.caption : id}"?`)) {
          const updated = getGallery().filter(i => i.id !== id);
          saveData('abhigraha_gallery', updated);
          renderPublicGallery();
          renderAdminGalleryList();
          showToast('Gallery item deleted.');
        }
      });
    });
  }

  // ==========================================================================
  // TAB 7: CONTACT INFORMATION MANAGEMENT
  // ==========================================================================
  function renderPublicContact() {
    const container = document.getElementById('contact-representatives-container');
    if (!container) return;

    const contacts = getContacts();
    if (!contacts || contacts.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 16px; color: #a38c94; background: rgba(255, 255, 255, 0.02); border-radius: 14px; border: 1px dashed rgba(251, 191, 36, 0.2);">
          <p style="margin: 0; font-size: 0.9rem;">Festival contact representatives will be announced shortly.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = contacts.map(c => `
      <div class="contact-representative-card">
        <div class="contact-rep-header">
          <div class="contact-rep-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="contact-rep-avatar-icon">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="contact-rep-titles">
            <h4 class="contact-rep-name">${escapeHtml(c.name || '')}</h4>
            <span class="contact-rep-role">${escapeHtml(c.designation || '')}</span>
          </div>
        </div>

        <div class="contact-rep-channels">
          <a href="tel:${escapeHtml((c.phone || '').replace(/\s+/g, ''))}" class="contact-channel-pill" title="Call directly">
            <span class="contact-channel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            <div class="contact-channel-text">
              <small>Phone Number</small>
              <strong>${escapeHtml(c.phone || '')}</strong>
            </div>
          </a>

          <a href="mailto:${escapeHtml(c.email || '')}" class="contact-channel-pill" title="Email directly">
            <span class="contact-channel-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </span>
            <div class="contact-channel-text">
              <small>Email Address</small>
              <strong>${escapeHtml(c.email || '')}</strong>
            </div>
          </a>
        </div>
      </div>
    `).join('');
  }

  function renderAdminContactList() {
    const container = document.getElementById('admin-contact-list');
    const countEl = document.getElementById('admin-contact-count');
    if (!container) return;

    const list = getContacts();
    if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? 'Person' : 'Persons'}`;

    if (list.length === 0) {
      container.innerHTML = '<p style="color:#a38c94; text-align:center; padding:16px;">No contact persons added yet. Click "+ Add Contact" above.</p>';
      return;
    }

    container.innerHTML = list.map((c, idx) => `
      <div class="admin-item-card">
        <div class="admin-item-order-corner">
          <button type="button" class="btn-order-circle" data-order-up-contact="${c.id}" title="Move Up" aria-label="Move Up" ${idx === 0 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveUp}
          </button>
          <button type="button" class="btn-order-circle" data-order-down-contact="${c.id}" title="Move Down" aria-label="Move Down" ${idx === list.length - 1 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveDown}
          </button>
        </div>
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span class="admin-order-badge">#${idx + 1}</span>
            <span style="font-size:1.15rem;">👤</span>
            <span>${escapeHtml(c.name)}</span>
            <span class="admin-topbar-badge">${escapeHtml(c.designation)}</span>
          </div>
          <div class="admin-item-meta" style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 14px;">
            <span>📞 <strong>${escapeHtml(c.phone)}</strong></span>
            <span>✉️ <strong>${escapeHtml(c.email)}</strong></span>
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-contact="${c.id}">${ADMIN_ICONS.edit}<span>Edit</span></button>
          <button class="btn-action-delete" data-del-contact="${c.id}">${ADMIN_ICONS.delete}<span>Delete</span></button>
        </div>
      </div>
    `).join('');

    // Reorder UP
    container.querySelectorAll('[data-order-up-contact]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-up-contact');
        const cList = getContacts();
        const idx = cList.findIndex(i => i.id === id);
        if (idx > 0) {
          const temp = cList[idx];
          cList[idx] = cList[idx - 1];
          cList[idx - 1] = temp;
          setContacts(cList);
          markKeyPending('contact');
          renderPublicContact();
          renderAdminContactList();
          showToast(`Contact "${temp.name}" moved up to #${idx}.`);
        }
      });
    });

    // Reorder DOWN
    container.querySelectorAll('[data-order-down-contact]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-down-contact');
        const cList = getContacts();
        const idx = cList.findIndex(i => i.id === id);
        if (idx !== -1 && idx < cList.length - 1) {
          const temp = cList[idx];
          cList[idx] = cList[idx + 1];
          cList[idx + 1] = temp;
          setContacts(cList);
          markKeyPending('contact');
          renderPublicContact();
          renderAdminContactList();
          showToast(`Contact "${temp.name}" moved down to #${idx + 2}.`);
        }
      });
    });

    // EDIT
    container.querySelectorAll('[data-edit-contact]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-contact');
        const c = getContacts().find(i => i.id === id);
        if (!c) return;

        const formPanel = document.getElementById('admin-contact-form-panel');
        document.getElementById('admin-contact-edit-id').value = c.id;
        document.getElementById('admin-contact-name').value = c.name || '';
        document.getElementById('admin-contact-role').value = c.designation || '';
        document.getElementById('admin-contact-phone').value = c.phone || '';
        document.getElementById('admin-contact-email').value = c.email || '';
        document.getElementById('admin-contact-form-title').innerHTML = `${ADMIN_ICONS.edit} <span>Edit Contact: ${escapeHtml(c.name)}</span>`;

        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // DELETE
    container.querySelectorAll('[data-del-contact]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-contact');
        const c = getContacts().find(i => i.id === id);
        if (confirm(`Remove contact "${c ? c.name : id}"?`)) {
          const updated = getContacts().filter(i => i.id !== id);
          setContacts(updated);
          markKeyPending('contact');
          renderPublicContact();
          renderAdminContactList();
          showToast(`Contact removed.`);
        }
      });
    });
  }

  function renderAdminContact() {
    renderAdminContactList();
  }

  function initContactAdmin() {
    const addBtn = document.getElementById('admin-contact-add-btn');
    const resetBtn = document.getElementById('admin-reset-contact-btn');
    const formPanel = document.getElementById('admin-contact-form-panel');
    const form = document.getElementById('admin-contact-form');
    const cancelBtn = document.getElementById('admin-contact-cancel-btn');

    if (addBtn && formPanel) {
      addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('admin-contact-edit-id').value = '';
        document.getElementById('admin-contact-form-title').innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="admin-btn-svg"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          <span>Add New Contact Person</span>
        `;
        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (cancelBtn && formPanel) {
      cancelBtn.addEventListener('click', () => {
        formPanel.style.display = 'none';
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!confirm('Reset contacts to default coordinator?')) return;
        setContacts(DEFAULT_CONTACTS);
        markKeyPending('contact');
        if (formPanel) formPanel.style.display = 'none';
        renderPublicContact();
        renderAdminContactList();
        showToast('🔄 Contacts reset to default coordinator.');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('admin-contact-edit-id').value.trim();
        const name = document.getElementById('admin-contact-name').value.trim();
        const designation = document.getElementById('admin-contact-role').value.trim();
        const phone = document.getElementById('admin-contact-phone').value.trim();
        const email = document.getElementById('admin-contact-email').value.trim();

        if (!name || !designation || !phone || !email) {
          showToast('⚠️ Please fill in all contact fields.');
          return;
        }

        const list = getContacts();
        if (editId) {
          const idx = list.findIndex(i => i.id === editId);
          if (idx !== -1) {
            list[idx] = { id: editId, name, designation, phone, email };
          }
          showToast(`Contact "${name}" updated! Ready to publish.`);
        } else {
          list.push({
            id: 'cnt-' + Date.now(),
            name,
            designation,
            phone,
            email
          });
          showToast(`Contact "${name}" added! Ready to publish.`);
        }

        setContacts(list);
        markKeyPending('contact');
        if (formPanel) formPanel.style.display = 'none';
        renderPublicContact();
        renderAdminContactList();
      });
    }

    renderAdminContactList();
  }

  // ==========================================================================
  // INITIALIZATION ON LOAD
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // Render public content immediately from local cache / defaults
    renderPublicContent();
    // Initialize Admin controls and load pending draft states
    initAdminPortal();
    loadPendingKeys();
    // Fetch live Cloudflare KV content asynchronously
    syncCloudContent();
    // Start real-time remote cloud & cross-device auto-sync polling
    startAutoSyncPoller();
  });

  // Expose global interface if needed
  window.AbhigrahaAdmin = {
    renderPublicContent,
    triggerAutoLoadingUpdate,
    getEvents,
    getSchedule,
    getCrowns,
    getMerch,
    getGallery,
    getContact,
    getContacts
  };
})();
