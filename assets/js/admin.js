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
  const ACCESS_HASH = '3ecc739cabde3ed0a536a0bc899959e01e17c2c96499cdfc2397d00addea3d59';

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
      desc: 'Eastern and Western solo & group dance choreography clash on the imperial amphitheatre stage.',
      venue: 'Amphitheatre Stage',
      time: 'Day 1 | 02:00 PM'
    },
    {
      id: 'evt-2',
      title: 'Sur Tarang - Battle of Bands',
      category: 'Cultural',
      desc: 'High-voltage live rock and fusion band showdown featuring collegiate bands across the region.',
      venue: 'Main Ground Pavilion',
      time: 'Day 1 | 05:00 PM'
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
      name: '',
      dept: '',
      imageUrl: ''
    },
    {
      id: 'crw-2',
      role: 'Ms. Freshers 2K26',
      name: '',
      dept: '',
      imageUrl: ''
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
      imageUrl: '',
      formUrl: 'https://forms.gle/abhigraha2k26-hoodie'
    },
    {
      id: 'mrc-2',
      title: 'Abhigraha 2K26 Graphic T-Shirt',
      price: '₹399',
      tag: 'Trending',
      desc: '100% bio-washed cotton tee with glowing lantern screenprint and TNU official event signature.',
      icon: '👕',
      imageUrl: '',
      formUrl: 'https://forms.gle/abhigraha2k26-tshirt'
    },
    {
      id: 'mrc-3',
      title: 'VIP Access Pass + Glow Wristband',
      price: '₹199',
      tag: 'Limited',
      desc: 'Front-row arena entry for celebrity star night, LED festival wristband, and holographic souvenir badge.',
      icon: '🎟️',
      imageUrl: '',
      formUrl: 'https://forms.gle/abhigraha2k26-vippass'
    }
  ];

  const DEFAULT_GALLERY = {
    driveUrl: 'https://drive.google.com',
    sections: [
      {
        id: 'sec-1',
        title: 'Flash Mob & Campus Street Teaser',
        images: [
          './assets/images/logo-crest.webp',
          './assets/images/dragon.webp',
          './assets/images/lantern_1.webp'
        ]
      },
      {
        id: 'sec-2',
        title: 'Imperial Fest & Stage Memories',
        images: [
          './assets/images/scroll_welcome_canvas.webp',
          './assets/images/lantern_2.webp',
          './assets/images/thank_you.webp'
        ]
      }
    ]
  };

  const DEFAULT_CONTACTS = [
    {
      id: 'cnt-1',
      name: 'Snigdha Sanyal',
      designation: 'President',
      phone: '+91 8159961776',
      email: 'sanyalsnigdho@gmail.com'
    },
    {
      id: 'cnt-2',
      name: 'Sahil Khan',
      designation: 'Vice President',
      phone: '+91 81339 78834',
      email: 'sahilaslamrr@gmail.com'
    }
  ];

  // ==========================================================================
  // STORAGE & CLOUD PERSISTENCE (CLOUDFLARE KV + LOCALSTORAGE HYBRID)
  // ==========================================================================
  const KEY_MAPPING = {
    'abhigraha_events': 'events',
    'abhigraha_schedule': 'schedule',
    'abhigraha_crowns': 'crowns',
    'abhigraha_merchandise': 'merchandise',
    'abhigraha_gallery': 'gallery',
    'abhigraha_contacts': 'contacts',
    'abhigraha_visibility': 'visibility'
  };

  const REVERSE_KEY_MAPPING = {
    'events': 'abhigraha_events',
    'schedule': 'abhigraha_schedule',
    'crowns': 'abhigraha_crowns',
    'merchandise': 'abhigraha_merchandise',
    'gallery': 'abhigraha_gallery',
    'contacts': 'abhigraha_contacts',
    'visibility': 'abhigraha_visibility'
  };

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

          // If the broadcast payload includes the actual batch data, write it to localStorage immediately in 0ms!
          if (payload.batch && typeof payload.batch === 'object') {
            const keys = ['events', 'schedule', 'crowns', 'merchandise', 'gallery', 'contacts'];
            keys.forEach(k => {
              const val = payload.batch[k];
              if (Array.isArray(val) || (k === 'gallery' && val && typeof val === 'object')) {
                let list = val;
                if (k === 'contacts' && Array.isArray(list) && list.some(c => c && (c.name === 'Subhadeep Nandy' || c.name === 'Sambit Bhattacharya'))) {
                  list = DEFAULT_CONTACTS;
                }
                const localKey = REVERSE_KEY_MAPPING[k];
                localStorage.setItem(localKey, JSON.stringify(list));
              }
            });
            if (payload.batch.visibility && typeof payload.batch.visibility === 'object') {
              localStorage.setItem('abhigraha_visibility', JSON.stringify(payload.batch.visibility));
            }
          } else if (payload.key && payload.data !== undefined) {
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
  let lastCheckTimestamp = 0;

  async function checkRemoteFestivalVersion(force = false) {
    if (isCheckingRemote || isAutoUpdating) return;

    const now = Date.now();
    // Throttle checks to at least 2.5 seconds apart unless forced
    if (!force && (now - lastCheckTimestamp < 2500)) return;

    // If admin portal is open on this tab, do not poll to avoid any interference
    const fsPortal = document.getElementById('admin-fullscreen-portal');
    if (fsPortal && fsPortal.classList.contains('open')) return;

    isCheckingRemote = true;
    lastCheckTimestamp = now;

    try {
      const cacheBuster = now + '_' + Math.random().toString(36).slice(2, 6);

      // Step 1: Ultra-lightweight version probe (only 1 single KV read!)
      const probeRes = await fetch(`/api/content?key=last_updated&_cb=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!probeRes.ok) return;
      const probeJson = await probeRes.json();
      if (!probeJson || probeJson.configured === false) return;

      const serverVersion = String(probeJson.last_updated || '0').replace(/"/g, '');

      // Baseline initialization on initial page load
      if (!lastHandledVersion || lastHandledVersion === '0') {
        lastHandledVersion = serverVersion;
        lastKnownVersion = serverVersion;
        if (serverVersion !== '0') {
          localStorage.setItem('abhigraha_last_updated', serverVersion);
        }
        return;
      }

      // If version hasn't changed, STOP HERE: zero further KV reads!
      if (serverVersion === lastHandledVersion) {
        return;
      }

      // Step 2: An update is actually published! Fetch the full dataset to update DOM
      console.log(`[AutoSync] New version detected (${serverVersion}), syncing full content...`);
      const fullRes = await fetch(`/api/content?_cb=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (fullRes.ok) {
        const fullJson = await fullRes.json();
        if (fullJson && fullJson.configured !== false) {
          const contentVersion = String(fullJson.last_updated || '0').replace(/"/g, '');

          // Verify edge consistency: if full payload is older than probeVersion, edge hasn't caught up
          if (contentVersion !== '0' && contentVersion < serverVersion) {
            console.warn(`[AutoSync] Edge replication delay (${contentVersion} < ${serverVersion}). Retrying in 1.5s...`);
            setTimeout(() => checkRemoteFestivalVersion(true), 1500);
            return;
          }

          const finalVersion = contentVersion !== '0' ? contentVersion : serverVersion;
          lastHandledVersion = finalVersion;
          lastKnownVersion = finalVersion;
          localStorage.setItem('abhigraha_last_updated', finalVersion);

          // Immediately load data into localStorage from response
          const keys = ['events', 'schedule', 'crowns', 'merchandise', 'gallery', 'contacts'];
          keys.forEach(k => {
            const val = fullJson[k];
            if (Array.isArray(val) || (k === 'gallery' && val && typeof val === 'object')) {
              let list = val;
              if (k === 'contacts' && Array.isArray(list) && list.some(c => c && (c.name === 'Subhadeep Nandy' || c.name === 'Sambit Bhattacharya'))) {
                list = DEFAULT_CONTACTS;
              }
              const localKey = REVERSE_KEY_MAPPING[k];
              localStorage.setItem(localKey, JSON.stringify(list));
            }
          });
          if (fullJson.visibility && typeof fullJson.visibility === 'object') {
            localStorage.setItem('abhigraha_visibility', JSON.stringify(fullJson.visibility));
          }

          // Trigger the auto-loading screen immediately for this active user
          triggerAutoLoadingUpdate({
            reason: 'remote_admin_update',
            source: 'cloud_ready',
            version: finalVersion
          });
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
    // Poll every 12 seconds when tab is active (reduces KV operations while keeping site live and responsive)
    pollerInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkRemoteFestivalVersion();
      }
    }, 12000);

    // Instant verification when user returns to tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkRemoteFestivalVersion(true);
      }
    });

    window.addEventListener('focus', () => {
      checkRemoteFestivalVersion(true);
    });

    window.addEventListener('online', () => {
      checkRemoteFestivalVersion(true);
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
        contacts: getContacts(),
        visibility: getVisibility()
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
              timestamp: updateTs,
              batch: batch
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
      const keys = ['events', 'schedule', 'crowns', 'merchandise', 'gallery', 'contacts'];
      keys.forEach(k => {
        const localKey = REVERSE_KEY_MAPPING[k];
        // Do not overwrite local keys that have pending draft changes!
        if (pendingKeys.has(k) || pendingKeys.has(localKey)) {
          return;
        }
        if (data && (Array.isArray(data[k]) || (k === 'gallery' && data[k] && typeof data[k] === 'object'))) {
          let list = data[k];
          if (k === 'contacts' && Array.isArray(list) && list.some(c => c && (c.name === 'Subhadeep Nandy' || c.name === 'Sambit Bhattacharya'))) {
            list = DEFAULT_CONTACTS;
          }
          localStorage.setItem(localKey, JSON.stringify(list));
          updatedAny = true;
        }
      });

      if (!pendingKeys.has('visibility') && !pendingKeys.has('abhigraha_visibility')) {
        if (data && data.visibility && typeof data.visibility === 'object') {
          localStorage.setItem('abhigraha_visibility', JSON.stringify(data.visibility));
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
      const parsed = JSON.parse(val);
      // Auto-migrate legacy contact placeholders if still in localStorage
      if (key === 'abhigraha_contacts' && Array.isArray(parsed)) {
        const hasLegacyPlaceholder = parsed.some(c => c && (c.name === 'Subhadeep Nandy' || c.name === 'Sambit Bhattacharya'));
        if (hasLegacyPlaceholder) {
          localStorage.setItem(key, JSON.stringify(fallback));
          return fallback;
        }
      }
      return parsed;
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
  function getGallery() {
    const raw = loadData('abhigraha_gallery', DEFAULT_GALLERY);
    if (Array.isArray(raw)) {
      const validImages = raw
        .filter(item => item && (item.src || item.imageUrl))
        .map(item => item.src || item.imageUrl);

      return {
        driveUrl: 'https://drive.google.com',
        sections: [
          {
            id: 'sec-1',
            title: 'Festival Moments & Highlights',
            images: validImages.length > 0 ? validImages : [
              './assets/images/logo-crest.webp',
              './assets/images/dragon.webp',
              './assets/images/lantern_1.webp'
            ]
          }
        ]
      };
    }
    if (raw && typeof raw === 'object') {
      if (!Array.isArray(raw.sections)) raw.sections = [];
      if (typeof raw.driveUrl !== 'string') raw.driveUrl = '';
      return raw;
    }
    return DEFAULT_GALLERY;
  }
  function getContacts() { return loadData('abhigraha_contacts', DEFAULT_CONTACTS); }

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
    renderPublicContacts();
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
                <svg class="btn-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Explore Schedule</span>
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
          <h3 class="event-title">${escapeHtml(evt.title)}</h3>
          <p class="event-desc">${escapeHtml(evt.desc)}</p>
          <div class="event-meta">
            <span class="event-meta-item">📍 ${escapeHtml(evt.venue || 'Campus Stage')}</span>
            <span class="event-meta-item">⏰ ${escapeHtml(evt.time || 'Festival Days')}</span>
          </div>
          <a href="#schedule" class="event-schedule-btn">
            <svg class="btn-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>View Schedule</span>
          </a>
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

    // Check if any fresher winner details have been entered
    const hasAnnounced = crowns.some(c => (c.name || '').trim() || (c.imageUrl || '').trim());

    if (!hasAnnounced) {
      container.innerHTML = `
        <div class="page-coming-soon-wrapper" style="grid-column: 1 / -1; width: 100%;">
          <div class="grand-coming-soon-tile">
            <div class="coming-soon-emblem-large">👑</div>
            <h3 class="grand-coming-soon-title">Mr. &amp; Ms. Freshers CROWNS <span>Announcing Soon</span></h3>
            <div class="grand-coming-soon-meta">
              <span class="meta-pill">🤴 Mr. Freshers 2K26</span>
              <span class="meta-pill">👸 Ms. Freshers 2K26</span>
              <span class="meta-pill">✨ Grand Coronation Ceremony</span>
            </div>
            <div class="grand-coming-soon-action">
              <a href="#schedule" class="cta-btn-primary" style="text-decoration: none;">
                <svg class="btn-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Explore Schedule</span>
              </a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = crowns.map(c => {
      const img = (c.imageUrl || '').trim();
      const name = (c.name || '').trim();
      const dept = (c.dept || '').trim();

      const avatarHtml = img
        ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(c.role)}" class="crown-avatar-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
           <div class="crown-avatar-placeholder" style="display:none;">👑</div>`
        : `<div class="crown-avatar-placeholder">👑</div>`;

      let detailHtml = '';
      if (!name) {
        detailHtml = `<p class="crown-announcing-soon">Announcing Soon</p>`;
      } else {
        detailHtml = `<p class="crown-fresher-name">${escapeHtml(name)}</p>`;
        if (dept) {
          detailHtml += `<div class="crown-dept-badge">${escapeHtml(dept)}</div>`;
        }
      }

      return `
        <div class="crown-card">
          <div class="crown-avatar-frame">
            ${avatarHtml}
          </div>
          <h3 class="crown-role">${escapeHtml(c.role)}</h3>
          ${detailHtml}
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

    container.innerHTML = merch.map(m => {
      const img = (m.imageUrl || '').trim();
      const visualContent = img
        ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(m.title)}" class="merch-img-preview" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';">
           <span class="merch-icon-preview" style="display:none;">${m.icon || '🛍️'}</span>`
        : `<span class="merch-icon-preview">${m.icon || '🛍️'}</span>`;

      return `
        <div class="merch-card">
          <div class="merch-visual">
            ${visualContent}
            <span class="merch-tag">${escapeHtml(m.tag || 'Official')}</span>
          </div>
          <div class="merch-info">
            <h4 class="merch-title">${escapeHtml(m.title)}</h4>
            <div class="merch-price">${escapeHtml(m.price)}</div>
            <p class="merch-desc">${escapeHtml(m.desc || '')}</p>
            <button class="merch-btn" data-merch="${escapeHtml(m.title)} (${escapeHtml(m.price)})" data-form-url="${escapeHtml(m.formUrl || '')}">
              <svg class="btn-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span>Pre-Order Now</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 5. Gallery Page (Redesigned with Sub-Headings, 3s Auto-Scroll Carousels & Google Drive Button)
  function renderPublicGallery() {
    const liveEl = document.getElementById('gallery-live-content');
    const csEl = document.getElementById('gallery-cs-content');
    const sectionsContainer = document.getElementById('gallery-sections-container');
    const driveLinkBtn = document.getElementById('gallery-drive-link-btn');

    if (window._galleryIntervals) {
      window._galleryIntervals.forEach(t => clearInterval(t));
    }
    window._galleryIntervals = [];

    const vis = getVisibility();
    if (vis.gallery_cs) {
      if (liveEl) liveEl.style.display = 'none';
      if (csEl) csEl.style.display = 'block';
      return;
    }

    if (liveEl) liveEl.style.display = 'block';
    if (csEl) csEl.style.display = 'none';

    const galleryData = getGallery();
    const sections = Array.isArray(galleryData.sections) ? galleryData.sections : [];
    const driveUrl = (galleryData.driveUrl || '').trim();

    // Configure Google Drive button
    if (driveLinkBtn) {
      if (driveUrl) {
        driveLinkBtn.href = driveUrl;
        driveLinkBtn.onclick = null;
      } else {
        driveLinkBtn.href = '#';
        driveLinkBtn.onclick = (e) => {
          e.preventDefault();
          showToast('Google Drive link has not been configured in Admin yet.');
        };
      }
    }

    if (!sectionsContainer) return;

    if (sections.length === 0) {
      sectionsContainer.innerHTML = '<p style="text-align:center; color: #a38c94; padding: 40px 20px;">Festival photo albums will be revealed soon.</p>';
      return;
    }

    sectionsContainer.innerHTML = sections.map((sec) => {
      const images = Array.isArray(sec.images) ? sec.images.filter(Boolean) : [];
      if (images.length === 0) {
        return `
          <div class="gallery-sub-block" data-section-id="${sec.id}">
            <div class="gallery-subheading-wrap">
              <h3 class="gallery-subheading">${escapeHtml(sec.title || 'Festival Moments')}</h3>
            </div>
            <div class="gallery-carousel-wrapper" style="height: 180px; display:flex; align-items:center; justify-content:center; color:#a38c94;">
              <span>No images added to this sub-heading yet.</span>
            </div>
          </div>
        `;
      }

      return `
        <div class="gallery-sub-block" data-section-id="${sec.id}">
          <div class="gallery-subheading-wrap">
            <h3 class="gallery-subheading">${escapeHtml(sec.title || 'Festival Moments')}</h3>
          </div>
          <div class="gallery-carousel-wrapper" data-carousel-sec="${sec.id}">
            <div class="gallery-carousel-viewport">
              <div class="gallery-carousel-track" id="track-${sec.id}">
                ${images.map((imgUrl, imgIdx) => `
                  <div class="gallery-slide" data-slide-idx="${imgIdx}">
                    <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(sec.title)} - Photo ${imgIdx + 1}" loading="lazy" onerror="this.onerror=null; this.src='./assets/images/logo-crest.webp';">
                  </div>
                `).join('')}
              </div>
            </div>
            ${images.length > 1 ? `
              <button type="button" class="gallery-arrow-btn prev" aria-label="Previous Photo" data-arrow-prev="${sec.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button type="button" class="gallery-arrow-btn next" aria-label="Next Photo" data-arrow-next="${sec.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            ` : ''}
          </div>
          ${images.length > 1 ? `
            <div class="gallery-dots-indicator" id="dots-${sec.id}">
              ${images.map((_, dotIdx) => `
                <button type="button" class="gallery-dot ${dotIdx === 0 ? 'active' : ''}" data-dot-sec="${sec.id}" data-dot-idx="${dotIdx}" aria-label="Photo ${dotIdx + 1}"></button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach Carousel Auto-scroll (3s right to left) and Controls
    sections.forEach(sec => {
      const images = Array.isArray(sec.images) ? sec.images.filter(Boolean) : [];
      if (images.length <= 1) return;

      const track = document.getElementById(`track-${sec.id}`);
      const dotsContainer = document.getElementById(`dots-${sec.id}`);
      const wrapper = document.querySelector(`[data-carousel-sec="${sec.id}"]`);
      if (!track) return;

      let currentIndex = 0;
      const total = images.length;
      let timer = null;

      function goToSlide(idx) {
        currentIndex = (idx + total) % total;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        if (dotsContainer) {
          const dots = dotsContainer.querySelectorAll('.gallery-dot');
          dots.forEach((d, i) => {
            if (i === currentIndex) d.classList.add('active');
            else d.classList.remove('active');
          });
        }
      }

      function startTimer() {
        stopTimer();
        timer = setInterval(() => {
          goToSlide(currentIndex + 1);
        }, 3000); // 3s auto scroll right to left
        window._galleryIntervals.push(timer);
      }

      function stopTimer() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      // Arrows
      if (wrapper) {
        const prevBtn = wrapper.querySelector(`[data-arrow-prev="${sec.id}"]`);
        const nextBtn = wrapper.querySelector(`[data-arrow-next="${sec.id}"]`);
        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentIndex - 1);
            startTimer();
          });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentIndex + 1);
            startTimer();
          });
        }

        // Pause on mouse hover
        wrapper.addEventListener('mouseenter', stopTimer);
        wrapper.addEventListener('mouseleave', startTimer);

        // Touch swipe support
        let touchStartX = 0;
        wrapper.addEventListener('touchstart', (e) => {
          stopTimer();
          if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
        }, { passive: true });

        wrapper.addEventListener('touchend', (e) => {
          if (e.changedTouches && e.changedTouches[0]) {
            const diffX = e.changedTouches[0].clientX - touchStartX;
            if (diffX < -35) {
              goToSlide(currentIndex + 1);
            } else if (diffX > 35) {
              goToSlide(currentIndex - 1);
            }
          }
          startTimer();
        }, { passive: true });
      }

      // Dots click
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.gallery-dot').forEach(dot => {
          dot.addEventListener('click', () => {
            const idx = parseInt(dot.getAttribute('data-dot-idx'), 10);
            goToSlide(idx);
            startTimer();
          });
        });
      }

      startTimer();
    });
  }

  // 6. Public Contact Us Representatives
  function renderPublicContacts() {
    const container = document.getElementById('contact-representatives-container');
    if (!container) return;

    const contacts = getContacts();
    if (!contacts || contacts.length === 0) {
      container.innerHTML = '<div class="contact-empty-state"><p>Official representative contacts will be announced shortly.</p></div>';
      return;
    }

    container.innerHTML = contacts.map(c => {
      const initial = (c.name || 'C').charAt(0).toUpperCase();
      const cleanPhone = (c.phone || '').replace(/[^\d+]/g, '');
      const hasEmail = Boolean(c.email && c.email.trim());
      const emailHtml = hasEmail ? `
            <a href="mailto:${encodeURIComponent(c.email.trim())}" class="contact-channel-pill" title="Email ${escapeHtml(c.name)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="contact-channel-icon">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span class="contact-channel-text">${escapeHtml(c.email.trim())}</span>
            </a>` : '';

      return `
        <div class="contact-representative-card">
          <div class="contact-rep-header">
            <div class="contact-rep-avatar">${escapeHtml(initial)}</div>
            <div class="contact-rep-info">
              <h4 class="contact-rep-name">${escapeHtml(c.name)}</h4>
              <span class="contact-rep-role">${escapeHtml(c.designation)}</span>
            </div>
          </div>
          <div class="contact-rep-channels">
            ${emailHtml}
            <a href="tel:${escapeHtml(cleanPhone)}" class="contact-channel-pill" title="Call ${escapeHtml(c.name)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="contact-channel-icon">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span class="contact-channel-text">${escapeHtml(c.phone)}</span>
            </a>
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
      renderPublicContent();
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
      const mobileBackdrop = document.getElementById('mobile-drawer-backdrop');
      if (mobileDrawer) mobileDrawer.classList.remove('open');
      if (mobileBackdrop) mobileBackdrop.classList.remove('open');
      document.body.classList.remove('drawer-open');
      document.documentElement.classList.remove('drawer-open');

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
    initContactsAdmin();
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
    else if (tab === 'contacts') renderAdminContactsList();
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
        document.getElementById('admin-event-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add Event</span>`;
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
        const venue = document.getElementById('admin-event-venue').value.trim();
        const time = document.getElementById('admin-event-time').value.trim();
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
            list[idx] = { ...list[idx], title, category, venue, time, desc };
          }
          showToast(`Event "${title}" updated!`);
        } else {
          // Add
          const newId = 'evt-' + Date.now();
          list.push({ id: newId, title, category, venue, time, desc });
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
          </div>
          <div class="admin-item-meta">
            📍 ${escapeHtml(evt.venue || 'Campus Arena')} &nbsp;|&nbsp; ⏰ ${escapeHtml(evt.time || 'Schedule Tab')}
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
        document.getElementById('admin-event-venue').value = evt.venue || '';
        document.getElementById('admin-event-time').value = evt.time || '';
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
        document.getElementById('admin-schedule-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add Schedule</span>`;
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
      const dayLabel = isDay1 ? 'Day 1: Flash Mob' : 'Day 2: Abhigraha';

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
          showToast(`Activity "${temp.title}" moved up to #${dayIdx} in ${item.day === 'day1' ? 'Day 1: Flash Mob' : 'Day 2: Abhigraha'}.`);
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
          showToast(`Activity "${temp.title}" moved down to #${dayIdx + 2} in ${item.day === 'day1' ? 'Day 1: Flash Mob' : 'Day 2: Abhigraha'}.`);
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
        document.getElementById('admin-crown-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add Crown</span>`;
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
        const name = (document.getElementById('admin-crown-name')?.value || '').trim();
        const dept = (document.getElementById('admin-crown-dept')?.value || '').trim();
        const imageUrl = (document.getElementById('admin-crown-image')?.value || '').trim();

        if (!role) {
          alert('Please enter the Award Role.');
          return;
        }

        const list = getCrowns();
        if (editId) {
          const idx = list.findIndex(i => i.id === editId);
          if (idx !== -1) list[idx] = { id: editId, role, name, dept, imageUrl };
          showToast(`Crown "${role}" updated!`);
        } else {
          list.push({ id: 'crw-' + Date.now(), role, name, dept, imageUrl });
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
            <span style="display:inline-block; width:30px; height:30px; border-radius:50%; overflow:hidden; vertical-align:middle; border:1.5px solid #f59e0b; background:#1a0b11;">
              ${c.imageUrl ? `<img src="${escapeHtml(c.imageUrl)}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="display:flex; width:100%; height:100%; align-items:center; justify-content:center; font-size:14px;">👑</span>'}
            </span>
            <span>${escapeHtml(c.role)}</span>
            ${c.name ? `<span style="color:#ffd899; font-weight:600;">(${escapeHtml(c.name)})</span>` : '<span style="color:#fbbf24; font-size:0.8rem; font-weight:600;">[Announcing Soon]</span>'}
            ${c.dept ? `<span class="admin-topbar-badge" style="font-size:0.75rem; text-transform:uppercase;">${escapeHtml(c.dept)}</span>` : ''}
          </div>
          <div class="admin-item-meta">
            ${c.dept ? `Dept: <strong>${escapeHtml(c.dept)}</strong> &nbsp;|&nbsp; ` : ''}${c.imageUrl ? `<a href="${escapeHtml(c.imageUrl)}" target="_blank" rel="noopener noreferrer" class="admin-form-link-badge">🖼️ Photo Link</a>` : '<span style="color:#888;">No photo uploaded</span>'}
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
        document.getElementById('admin-crown-role').value = c.role || '';
        const nameInput = document.getElementById('admin-crown-name');
        if (nameInput) nameInput.value = c.name || '';
        const deptInput = document.getElementById('admin-crown-dept');
        if (deptInput) deptInput.value = c.dept || '';
        const imgInput = document.getElementById('admin-crown-image');
        if (imgInput) imgInput.value = c.imageUrl || '';
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
        const imgInput = document.getElementById('admin-merch-image');
        if (imgInput) imgInput.value = '';
        const formUrlInput = document.getElementById('admin-merch-form-url');
        if (formUrlInput) formUrlInput.value = '';
        document.getElementById('admin-merch-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add Merchandise</span>`;
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
        const imageUrl = (document.getElementById('admin-merch-image')?.value || '').trim();
        const formUrl = (document.getElementById('admin-merch-form-url')?.value || '').trim();
        const desc = document.getElementById('admin-merch-desc').value.trim();

        if (!title || !price) {
          alert('Please enter Title and Price.');
          return;
        }

        const list = getMerch();
        if (editId) {
          const idx = list.findIndex(i => i.id === editId);
          if (idx !== -1) list[idx] = { id: editId, title, price, tag, icon, imageUrl, desc, formUrl };
          showToast(`Merchandise "${title}" updated!`);
        } else {
          list.push({ id: 'mrc-' + Date.now(), title, price, tag, icon, imageUrl, desc, formUrl });
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
            <span style="display:inline-block; width:34px; height:26px; border-radius:6px; overflow:hidden; vertical-align:middle; border:1px solid #f59e0b; background:#1a0b11; text-align:center;">
              ${m.imageUrl ? `<img src="${escapeHtml(m.imageUrl)}" style="width:100%; height:100%; object-fit:contain;">` : `<span style="font-size:1.1rem; line-height:26px;">${m.icon || '🛍️'}</span>`}
            </span>
            <span>${escapeHtml(m.title)}</span>
            <span class="admin-topbar-badge">${escapeHtml(m.price)}</span>
            <span style="font-size:0.75rem; color:#fde68a;">[${escapeHtml(m.tag || '-')}]</span>
          </div>
          <div class="admin-item-meta">
            ${escapeHtml(m.desc || '')}
            ${m.imageUrl ? `<div style="margin-top: 4px;"><a href="${escapeHtml(m.imageUrl)}" target="_blank" rel="noopener noreferrer" class="admin-form-link-badge">🖼️ Photo Link</a></div>` : ''}
            ${m.formUrl ? `<div style="margin-top: 4px;"><a href="${escapeHtml(m.formUrl)}" target="_blank" rel="noopener noreferrer" class="admin-form-link-badge">🔗 Order Form: ${escapeHtml(m.formUrl)}</a></div>` : ''}
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
        const imgInput = document.getElementById('admin-merch-image');
        if (imgInput) imgInput.value = m.imageUrl || '';
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
  // TAB 6: GALLERY MANAGEMENT (SUB-HEADINGS, IMAGE QUEUE, DRIVE LINK)
  // ==========================================================================
  let activeGalleryQueue = [];

  function renderAdminGalleryQueue() {
    const queueList = document.getElementById('admin-gallery-queue-list');
    const queueCount = document.getElementById('admin-queue-count');
    if (queueCount) queueCount.textContent = activeGalleryQueue.length;
    if (!queueList) return;

    if (activeGalleryQueue.length === 0) {
      queueList.innerHTML = '<p style="color: #a38c94; font-size: 0.85rem; text-align: center; margin: 12px 0;">No images in queue yet. Add single or multiple links above.</p>';
      return;
    }

    queueList.innerHTML = activeGalleryQueue.map((url, idx) => `
      <div class="admin-queue-item">
        <img src="${escapeHtml(url)}" alt="Thumbnail ${idx + 1}" class="admin-queue-thumb" onerror="this.src='./assets/images/logo-crest.webp';">
        <div class="admin-queue-url" title="${escapeHtml(url)}">
          <strong style="color: #ffd899; margin-right: 6px;">#${idx + 1}</strong>
          ${escapeHtml(url)}
        </div>
        <div class="admin-queue-actions">
          <button type="button" class="btn-order-circle" data-queue-up="${idx}" title="Move Up in Queue" ${idx === 0 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveUp}
          </button>
          <button type="button" class="btn-order-circle" data-queue-down="${idx}" title="Move Down in Queue" ${idx === activeGalleryQueue.length - 1 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveDown}
          </button>
          <button type="button" class="btn-action-delete" data-queue-del="${idx}" title="Remove from Queue" style="padding: 5px 8px;">
            ${ADMIN_ICONS.delete}
          </button>
        </div>
      </div>
    `).join('');

    queueList.querySelectorAll('[data-queue-up]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-queue-up'), 10);
        if (idx > 0) {
          const temp = activeGalleryQueue[idx];
          activeGalleryQueue[idx] = activeGalleryQueue[idx - 1];
          activeGalleryQueue[idx - 1] = temp;
          renderAdminGalleryQueue();
        }
      });
    });

    queueList.querySelectorAll('[data-queue-down]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-queue-down'), 10);
        if (idx < activeGalleryQueue.length - 1) {
          const temp = activeGalleryQueue[idx];
          activeGalleryQueue[idx] = activeGalleryQueue[idx + 1];
          activeGalleryQueue[idx + 1] = temp;
          renderAdminGalleryQueue();
        }
      });
    });

    queueList.querySelectorAll('[data-queue-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-queue-del'), 10);
        activeGalleryQueue.splice(idx, 1);
        renderAdminGalleryQueue();
      });
    });
  }

  function initGalleryAdmin() {
    const addBtn = document.getElementById('admin-add-gallery-btn');
    const resetBtn = document.getElementById('admin-reset-gallery-btn');
    const formPanel = document.getElementById('admin-gallery-form-panel');
    const form = document.getElementById('admin-gallery-form');
    const cancelBtn = document.getElementById('admin-gallery-cancel-btn');
    const saveDriveBtn = document.getElementById('admin-save-drive-btn');
    const queueAddSingleBtn = document.getElementById('admin-queue-add-btn');
    const queueAddBulkBtn = document.getElementById('admin-queue-bulk-btn');

    if (saveDriveBtn) {
      saveDriveBtn.addEventListener('click', () => {
        const driveInput = document.getElementById('admin-gallery-drive-url');
        const url = driveInput ? driveInput.value.trim() : '';
        const gData = getGallery();
        gData.driveUrl = url;
        saveData('abhigraha_gallery', gData);
        renderPublicGallery();
        renderAdminGalleryList();
        showToast('Google Drive album link saved!');
      });
    }

    if (addBtn && formPanel) {
      addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('admin-gallery-edit-id').value = '';
        activeGalleryQueue = [];
        renderAdminGalleryQueue();
        document.getElementById('admin-gallery-form-title').innerHTML = `${ADMIN_ICONS.plus} <span>Add Sub-heading & Images</span>`;
        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (cancelBtn && formPanel) {
      cancelBtn.addEventListener('click', () => {
        formPanel.style.display = 'none';
      });
    }

    if (queueAddSingleBtn) {
      queueAddSingleBtn.addEventListener('click', () => {
        const input = document.getElementById('admin-gallery-single-url');
        const val = input ? input.value.trim() : '';
        if (!val) {
          alert('Please enter a valid image URL.');
          return;
        }
        activeGalleryQueue.push(val);
        input.value = '';
        renderAdminGalleryQueue();
        showToast('Image added to queue.');
      });
    }

    if (queueAddBulkBtn) {
      queueAddBulkBtn.addEventListener('click', () => {
        const textarea = document.getElementById('admin-gallery-bulk-urls');
        const val = textarea ? textarea.value.trim() : '';
        if (!val) {
          alert('Please paste image URLs into the box.');
          return;
        }
        const links = val
          .split(/[\r\n,]+/)
          .map(s => s.trim())
          .filter(Boolean);

        if (links.length === 0) {
          alert('No valid URLs found in text.');
          return;
        }

        activeGalleryQueue.push(...links);
        textarea.value = '';
        renderAdminGalleryQueue();
        showToast(`Added ${links.length} image${links.length === 1 ? '' : 's'} to queue.`);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset gallery sub-headings & memories back to defaults?')) {
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
        const title = document.getElementById('admin-gallery-title').value.trim();

        if (!title) {
          alert('Please enter a sub-heading title.');
          return;
        }

        if (activeGalleryQueue.length === 0) {
          alert('Please add at least one image to the queue before saving.');
          return;
        }

        const gData = getGallery();
        if (!Array.isArray(gData.sections)) gData.sections = [];

        if (editId) {
          const idx = gData.sections.findIndex(s => s.id === editId);
          if (idx !== -1) {
            gData.sections[idx] = { id: editId, title, images: [...activeGalleryQueue] };
          }
          showToast(`Sub-heading "${title}" updated!`);
        } else {
          gData.sections.push({
            id: 'sec-' + Date.now(),
            title,
            images: [...activeGalleryQueue]
          });
          showToast(`Sub-heading "${title}" added!`);
        }

        saveData('abhigraha_gallery', gData);
        formPanel.style.display = 'none';
        renderPublicGallery();
        renderAdminGalleryList();
      });
    }
  }

  function renderAdminGalleryList() {
    const container = document.getElementById('admin-gallery-list');
    const countEl = document.getElementById('admin-gallery-count');
    const driveInput = document.getElementById('admin-gallery-drive-url');
    if (!container) return;

    const galleryData = getGallery();
    const sections = Array.isArray(galleryData.sections) ? galleryData.sections : [];

    if (driveInput && document.activeElement !== driveInput) {
      driveInput.value = galleryData.driveUrl || '';
    }

    const totalPhotos = sections.reduce((acc, s) => acc + (Array.isArray(s.images) ? s.images.length : 0), 0);
    if (countEl) countEl.textContent = `${sections.length} Sub-headings · ${totalPhotos} Photos`;

    if (sections.length === 0) {
      container.innerHTML = '<p style="color:#a38c94; text-align:center; padding:16px;">No gallery sub-headings added yet. Click &quot;Add Sub-heading & Images&quot; to create your first album section.</p>';
      return;
    }

    container.innerHTML = sections.map((sec, idx) => {
      const images = Array.isArray(sec.images) ? sec.images : [];
      const isFirst = idx === 0;
      const isLast = idx === sections.length - 1;

      const thumbsHtml = images.length > 0
        ? `<div class="admin-section-strip">
            ${images.slice(0, 10).map((img, i) => `
              <img src="${escapeHtml(img)}" alt="Thumb ${i + 1}" class="admin-section-thumb" loading="lazy" onerror="this.src='./assets/images/logo-crest.webp';">
            `).join('')}
            ${images.length > 10 ? `<span style="display:inline-flex; align-items:center; color:#ffd899; font-size:0.8rem; padding:0 8px;">+${images.length - 10} more</span>` : ''}
          </div>`
        : '<p style="color:#a38c94; font-size:0.8rem; margin-top:4px;">No images in this sub-heading</p>';

      return `
        <div class="admin-item-card" data-sec-id="${sec.id}">
          <div class="admin-item-order-corner">
            <button type="button" class="btn-order-circle" data-order-up-sec="${sec.id}" title="Move Up" aria-label="Move Up" ${isFirst ? 'disabled' : ''}>
              ${ADMIN_ICONS.moveUp}
            </button>
            <button type="button" class="btn-order-circle" data-order-down-sec="${sec.id}" title="Move Down" aria-label="Move Down" ${isLast ? 'disabled' : ''}>
              ${ADMIN_ICONS.moveDown}
            </button>
          </div>
          <div class="admin-item-main">
            <div class="admin-item-title">
              <span class="admin-order-badge">#${idx + 1}</span>
              <span style="font-size:1.15rem; font-weight:700; color:#ffd899;">${escapeHtml(sec.title || 'Untitled Section')}</span>
              <span class="admin-topbar-badge">${images.length} Photo${images.length === 1 ? '' : 's'}</span>
            </div>
            ${thumbsHtml}
          </div>
          <div class="admin-item-actions">
            <button class="btn-action-edit" data-edit-sec="${sec.id}">${ADMIN_ICONS.edit}<span>Edit</span></button>
            <button class="btn-action-delete" data-del-sec="${sec.id}">${ADMIN_ICONS.delete}<span>Delete</span></button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-order-up-sec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-up-sec');
        const gData = getGallery();
        const idx = gData.sections.findIndex(s => s.id === id);
        if (idx > 0) {
          const temp = gData.sections[idx];
          gData.sections[idx] = gData.sections[idx - 1];
          gData.sections[idx - 1] = temp;
          saveData('abhigraha_gallery', gData);
          renderPublicGallery();
          renderAdminGalleryList();
          showToast(`Sub-heading "${temp.title}" moved up to #${idx}.`);
        }
      });
    });

    container.querySelectorAll('[data-order-down-sec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-down-sec');
        const gData = getGallery();
        const idx = gData.sections.findIndex(s => s.id === id);
        if (idx !== -1 && idx < gData.sections.length - 1) {
          const temp = gData.sections[idx];
          gData.sections[idx] = gData.sections[idx + 1];
          gData.sections[idx + 1] = temp;
          saveData('abhigraha_gallery', gData);
          renderPublicGallery();
          renderAdminGalleryList();
          showToast(`Sub-heading "${temp.title}" moved down to #${idx + 2}.`);
        }
      });
    });

    container.querySelectorAll('[data-edit-sec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-sec');
        const gData = getGallery();
        const sec = gData.sections.find(s => s.id === id);
        if (!sec) return;

        const formPanel = document.getElementById('admin-gallery-form-panel');
        document.getElementById('admin-gallery-edit-id').value = sec.id;
        document.getElementById('admin-gallery-title').value = sec.title || '';
        const singleUrl = document.getElementById('admin-gallery-single-url');
        const bulkUrls = document.getElementById('admin-gallery-bulk-urls');
        if (singleUrl) singleUrl.value = '';
        if (bulkUrls) bulkUrls.value = '';
        activeGalleryQueue = [...(sec.images || [])];
        renderAdminGalleryQueue();

        document.getElementById('admin-gallery-form-title').innerHTML = `${ADMIN_ICONS.edit} <span>Edit Sub-heading: ${escapeHtml(sec.title)}</span>`;
        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    container.querySelectorAll('[data-del-sec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-sec');
        const gData = getGallery();
        const sec = gData.sections.find(s => s.id === id);
        if (confirm(`Remove sub-heading "${sec ? sec.title : id}" and all its photos?`)) {
          gData.sections = gData.sections.filter(s => s.id !== id);
          saveData('abhigraha_gallery', gData);
          renderPublicGallery();
          renderAdminGalleryList();
          showToast('Sub-heading deleted.');
        }
      });
    });
  }

  // ==========================================================================
  // TAB 7: CONTACTS MANAGEMENT (ADD, EDIT, REMOVE, REORDER)
  // ==========================================================================
  function initContactsAdmin() {
    const addBtn = document.getElementById('admin-add-contact-btn');
    const resetBtn = document.getElementById('admin-reset-contacts-btn');
    const formPanel = document.getElementById('admin-contact-form-panel');
    const form = document.getElementById('admin-contact-form');
    const cancelBtn = document.getElementById('admin-contact-cancel-btn');

    if (addBtn && formPanel) {
      addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('admin-contact-edit-id').value = '';
        document.getElementById('admin-contact-form-title').innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="admin-btn-svg"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          <span>Add Contact</span>
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
        if (confirm('Reset contact representatives back to defaults?')) {
          saveData('abhigraha_contacts', DEFAULT_CONTACTS);
          renderPublicContacts();
          renderAdminContactsList();
          showToast('Contacts reset to defaults.');
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('admin-contact-edit-id').value;
        const name = document.getElementById('admin-contact-name').value.trim();
        const designation = document.getElementById('admin-contact-role').value.trim();
        const email = document.getElementById('admin-contact-email').value.trim();
        const phone = document.getElementById('admin-contact-phone').value.trim();

        if (!name || !designation || !phone) {
          alert('Please fill in all required contact details (Name, Role, and Phone Number).');
          return;
        }

        const list = getContacts();
        if (editId) {
          const idx = list.findIndex(c => c.id === editId);
          if (idx !== -1) {
            list[idx] = { id: editId, name, designation, email, phone };
          }
          showToast(`Contact "${name}" updated!`);
        } else {
          list.push({
            id: 'cnt-' + Date.now(),
            name,
            designation,
            email,
            phone
          });
          showToast(`Contact "${name}" added!`);
        }

        saveData('abhigraha_contacts', list);
        formPanel.style.display = 'none';
        renderPublicContacts();
        renderAdminContactsList();
      });
    }
  }

  function renderAdminContactsList() {
    const container = document.getElementById('admin-contacts-list');
    const countEl = document.getElementById('admin-contacts-count');
    if (!container) return;

    const list = getContacts();
    if (countEl) countEl.textContent = `${list.length} Contact${list.length !== 1 ? 's' : ''}`;

    if (list.length === 0) {
      container.innerHTML = '<p style="color:#a38c94; text-align:center; padding:16px;">No contact representatives added yet.</p>';
      return;
    }

    container.innerHTML = list.map((c, idx) => `
      <div class="admin-item-card">
        <div class="admin-item-order-corner">
          <button type="button" class="btn-order-circle" data-order-up-cnt="${c.id}" title="Move Up" aria-label="Move Up" ${idx === 0 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveUp}
          </button>
          <button type="button" class="btn-order-circle" data-order-down-cnt="${c.id}" title="Move Down" aria-label="Move Down" ${idx === list.length - 1 ? 'disabled' : ''}>
            ${ADMIN_ICONS.moveDown}
          </button>
        </div>
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span class="admin-order-badge">#${idx + 1}</span>
            <span style="font-weight:700; color:#fff4db;">${escapeHtml(c.name)}</span>
            <span class="admin-topbar-badge">${escapeHtml(c.designation)}</span>
          </div>
          <div class="admin-item-meta">
            ${c.email && c.email.trim() ? `<span>✉️ ${escapeHtml(c.email.trim())}</span> &bull; ` : ''}<span>📞 ${escapeHtml(c.phone)}</span>
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-cnt="${c.id}">${ADMIN_ICONS.edit}<span>Edit</span></button>
          <button class="btn-action-delete" data-del-cnt="${c.id}">${ADMIN_ICONS.delete}<span>Delete</span></button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-order-up-cnt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-up-cnt');
        const cList = getContacts();
        const idx = cList.findIndex(c => c.id === id);
        if (idx > 0) {
          const temp = cList[idx];
          cList[idx] = cList[idx - 1];
          cList[idx - 1] = temp;
          saveData('abhigraha_contacts', cList);
          renderPublicContacts();
          renderAdminContactsList();
          showToast(`Contact "${temp.name}" moved up.`);
        }
      });
    });

    container.querySelectorAll('[data-order-down-cnt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-down-cnt');
        const cList = getContacts();
        const idx = cList.findIndex(c => c.id === id);
        if (idx !== -1 && idx < cList.length - 1) {
          const temp = cList[idx];
          cList[idx] = cList[idx + 1];
          cList[idx + 1] = temp;
          saveData('abhigraha_contacts', cList);
          renderPublicContacts();
          renderAdminContactsList();
          showToast(`Contact "${temp.name}" moved down.`);
        }
      });
    });

    container.querySelectorAll('[data-edit-cnt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit-cnt');
        const c = getContacts().find(item => item.id === id);
        if (!c) return;

        const formPanel = document.getElementById('admin-contact-form-panel');
        document.getElementById('admin-contact-edit-id').value = c.id;
        document.getElementById('admin-contact-name').value = c.name || '';
        document.getElementById('admin-contact-role').value = c.designation || '';
        document.getElementById('admin-contact-email').value = c.email || '';
        document.getElementById('admin-contact-phone').value = c.phone || '';
        document.getElementById('admin-contact-form-title').innerHTML = `${ADMIN_ICONS.edit} <span>Edit Contact: ${escapeHtml(c.name)}</span>`;

        formPanel.style.display = 'block';
        formPanel.scrollIntoView({ behavior: 'smooth' });
      });
    });

    container.querySelectorAll('[data-del-cnt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-cnt');
        const c = getContacts().find(item => item.id === id);
        if (confirm(`Remove representative "${c ? c.name : id}"?`)) {
          const updated = getContacts().filter(item => item.id !== id);
          saveData('abhigraha_contacts', updated);
          renderPublicContacts();
          renderAdminContactsList();
          showToast('Contact deleted.');
        }
      });
    });
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
    getContacts
  };
})();
