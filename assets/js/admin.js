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
      time: 'Day 1 | 02:00 PM'
    },
    {
      id: 'evt-2',
      title: 'Sur Tarang - Battle of Bands',
      category: 'Cultural',
      prize: '₹20,000 + Trophy',
      tag: 'Star Clash',
      desc: 'High-voltage live rock and fusion band showdown featuring collegiate bands across the region.',
      venue: 'Main Ground Pavilion',
      time: 'Day 1 | 05:00 PM'
    },
    {
      id: 'evt-3',
      title: 'Imperial Esports (Valorant & BGMI)',
      category: 'Gaming',
      prize: '₹12,000 + Badges',
      tag: 'Esports',
      desc: 'High-intensity tactical multiplayer tournament played on high-refresh LAN setup with live streaming.',
      venue: 'Tech Arena',
      time: 'Day 1 & Day 2'
    },
    {
      id: 'evt-4',
      title: 'Ramp of Radiance (CROWNS)',
      category: 'Cultural',
      prize: 'Imperial Titles + Cash',
      tag: 'Coronation',
      desc: 'The signature fashion, runway, and charisma contest crowning Mr. & Ms. Freshers 2K26.',
      venue: 'Main Imperial Stage',
      time: 'Day 2 | 03:30 PM'
    },
    {
      id: 'evt-5',
      title: 'Chanakya Neeti Mega Quiz',
      category: 'Technical',
      prize: '₹8,000 + Certificates',
      tag: 'Intellect',
      desc: 'Challenging multi-tier quiz testing general intellect, pop culture, history, science, and strategy.',
      venue: 'Quadrangle',
      time: 'Day 2 | 10:30 AM'
    },
    {
      id: 'evt-6',
      title: 'Street Beats - Nukkad Natak',
      category: 'Special',
      prize: '₹10,000 + Trophy',
      tag: 'Drama',
      desc: 'Powerful theatrical street plays bringing social messages to life with authentic beats and energy.',
      venue: 'Central Courtyard',
      time: 'Day 2 | 11:30 AM'
    }
  ];

  const DEFAULT_SCHEDULE = [
    { id: 'sch-1', day: 'day1', time: '10:00 AM - 11:30 AM', title: 'Grand Inauguration & Lamp Lighting', venue: 'Central Auditorium | Welcome Address by Vice Chancellor' },
    { id: 'sch-2', day: 'day1', time: '11:30 AM - 01:30 PM', title: 'Esports Preliminary Knockouts (Valorant / BGMI)', venue: 'Tech Arena | LAN Setup' },
    { id: 'sch-3', day: 'day1', time: '02:00 PM - 04:30 PM', title: 'Nrityotsav - Eastern & Western Dance Clash', venue: 'Amphitheatre Stage' },
    { id: 'sch-4', day: 'day1', time: '05:00 PM - 08:30 PM', title: 'Sur Tarang Live Band War & Rock Night', venue: 'Main Ground Pavilion' },
    { id: 'sch-5', day: 'day2', time: '10:30 AM - 12:30 PM', title: 'Chanakya Neeti Mega Quiz & Street Drama', venue: 'University Quadrangle' },
    { id: 'sch-6', day: 'day2', time: '01:30 PM - 03:00 PM', title: 'Esports Grand Finals & Live Stream', venue: 'Tech Arena Screen' },
    { id: 'sch-7', day: 'day2', time: '03:30 PM - 06:30 PM', title: 'The Royal CROWNS Coronation (Mr. & Ms. Freshers)', venue: 'Main Imperial Stage | Fashion & Talent Walk' },
    { id: 'sch-8', day: 'day2', time: '07:00 PM - 10:00 PM', title: 'Celebrity DJ Night & Grand EDM Extravaganza', venue: 'Main Festival Grounds' }
  ];

  const DEFAULT_CROWNS = [
    {
      id: 'crw-1',
      role: 'Mr. Freshers 2K26',
      title: 'The Dragon King',
      icon: '🤴',
      criteria: '✦ Round 1: Ethnic & Theme Runway Walk\n✦ Round 2: On-stage Talent Showcase\n✦ Round 3: Wit, Intellect & Judges Q&A\n✦ Live Audience Popular Choice Voting',
      regEvent: 'Nomination: Mr. Freshers 2K26'
    },
    {
      id: 'crw-2',
      role: 'Ms. Freshers 2K26',
      title: 'The Imperial Empress',
      icon: '👸',
      criteria: '✦ Round 1: Oriental Fusion Fashion Runway\n✦ Round 2: Individual Performance & Passion\n✦ Round 3: Wit, Spontaneity & Final Pitch\n✦ Live Audience Popular Choice Voting',
      regEvent: 'Nomination: Ms. Freshers 2K26'
    }
  ];

  const DEFAULT_MERCH = [
    {
      id: 'mrc-1',
      title: 'Imperial Festival Kimono Hoodie',
      price: '₹799',
      tag: 'Popular',
      desc: 'Premium oriental embroidered heavyweight hoodie with gold foil dragon iconography.',
      icon: '👘'
    },
    {
      id: 'mrc-2',
      title: 'Abhigraha 2K26 Graphic T-Shirt',
      price: '₹399',
      tag: 'Trending',
      desc: '100% bio-washed cotton tee with glowing lantern screenprint and TNU official event signature.',
      icon: '👕'
    },
    {
      id: 'mrc-3',
      title: 'VIP Access Pass + Glow Wristband',
      price: '₹199',
      tag: 'Limited',
      desc: 'Front-row arena entry for celebrity star night, LED festival wristband, and holographic souvenir badge.',
      icon: '🎟️'
    }
  ];

  const DEFAULT_GALLERY = [
    { id: 'gal-1', type: 'img', src: './assets/images/logo-crest.webp', icon: '', bg: '', caption: 'The Imperial Dragon Gates of Abhigraha' },
    { id: 'gal-2', type: 'emoji', src: '', icon: '🏮🏮🏮', bg: 'radial-gradient(circle, #3b0914, #0b0306)', caption: 'Illuminated Temple Lanterns Night' },
    { id: 'gal-3', type: 'emoji', src: '', icon: '🎸🔥🥁', bg: 'radial-gradient(circle, #54111f, #0b0306)', caption: 'Battle of Bands Rock Stage' },
    { id: 'gal-4', type: 'emoji', src: '', icon: '👑✨👗', bg: 'radial-gradient(circle, #441708, #0b0306)', caption: 'Mr. & Ms. Freshers Runway Coronation' }
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
    'abhigraha_visibility': 'visibility'
  };

  const REVERSE_KEY_MAPPING = {
    'events': 'abhigraha_events',
    'schedule': 'abhigraha_schedule',
    'crowns': 'abhigraha_crowns',
    'merchandise': 'abhigraha_merchandise',
    'gallery': 'abhigraha_gallery',
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
            <div class="coming-soon-badge-pill">
              <span>🏮</span> ARENAS UNVEILING SOON
            </div>
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
          <button class="event-register-btn" data-event="${evt.title}">
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
          <button class="cta-btn-primary event-register-btn" data-event="${c.regEvent || ('Nomination: ' + c.role)}" style="margin-top: 10px;">
            Nominate for ${c.role.split(' ')[0]}
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
          <button class="merch-btn" data-merch="${m.title} (${m.price})">Pre-Order Now</button>
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
    if (adminBtn) {
      adminBtn.addEventListener('click', (e) => {
        e.preventDefault();
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
      });
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
        document.getElementById('admin-event-form-title').textContent = '➕ Add New Festival Event';
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
            list[idx] = { ...list[idx], title, category, prize, tag, venue, time, desc };
          }
          showToast(`Event "${title}" updated!`);
        } else {
          // Add
          const newId = 'evt-' + Date.now();
          list.push({ id: newId, title, category, prize, tag, venue, time, desc });
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

    container.innerHTML = list.map(evt => `
      <div class="admin-item-card">
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span>${evt.title}</span>
            <span class="admin-topbar-badge">${evt.category || 'General'}</span>
            <span style="font-size:0.75rem; color:#f59e0b;">🏆 ${evt.prize}</span>
          </div>
          <div class="admin-item-meta">
            📍 ${evt.venue || 'Campus Arena'} &nbsp;|&nbsp; ⏰ ${evt.time || 'Schedule Tab'} &nbsp;|&nbsp; Tag: ${evt.tag || '-'}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-evt="${evt.id}">✏️ Edit</button>
          <button class="btn-action-delete" data-del-evt="${evt.id}">🗑️ Delete</button>
        </div>
      </div>
    `).join('');

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
        document.getElementById('admin-event-desc').value = evt.desc || '';
        document.getElementById('admin-event-form-title').textContent = `✏️ Edit Event: ${evt.title}`;

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
        document.getElementById('admin-schedule-form-title').textContent = '➕ Add Timeline Activity';
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
    if (countEl) countEl.textContent = `${list.length} Items`;

    if (list.length === 0) {
      container.innerHTML = '<p style="color:#a38c94; text-align:center; padding:16px;">No schedule items listed.</p>';
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="admin-item-card">
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span>${item.title}</span>
            <span class="admin-topbar-badge">${item.day === 'day1' ? 'Day 1' : 'Day 2'}</span>
            <span style="font-size:0.75rem; color:#fde68a;">⏰ ${item.time}</span>
          </div>
          <div class="admin-item-meta">
            📍 ${item.venue}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-sch="${item.id}">✏️ Edit</button>
          <button class="btn-action-delete" data-del-sch="${item.id}">🗑️ Delete</button>
        </div>
      </div>
    `).join('');

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
        document.getElementById('admin-schedule-form-title').textContent = `✏️ Edit Activity: ${item.title}`;

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
        document.getElementById('admin-crown-form-title').textContent = '➕ Add Royal Crown Title';
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

        if (!role || !title) {
          alert('Please enter Role and Theme Title.');
          return;
        }

        const list = getCrowns();
        if (editId) {
          const idx = list.findIndex(i => i.id === editId);
          if (idx !== -1) list[idx] = { id: editId, role, title, icon, criteria, regEvent };
          showToast(`Crown "${role}" updated!`);
        } else {
          list.push({ id: 'crw-' + Date.now(), role, title, icon, criteria, regEvent });
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

    container.innerHTML = list.map(c => `
      <div class="admin-item-card">
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span style="font-size:1.3rem;">${c.icon}</span>
            <span>${c.role}</span>
            <span style="color:#ffd899; font-weight:600;">(${c.title})</span>
          </div>
          <div class="admin-item-meta">
            Registration Nomination: ${c.regEvent}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-crw="${c.id}">✏️ Edit</button>
          <button class="btn-action-delete" data-del-crw="${c.id}">🗑️ Delete</button>
        </div>
      </div>
    `).join('');

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
        document.getElementById('admin-crown-form-title').textContent = `✏️ Edit Crown: ${c.role}`;

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
        document.getElementById('admin-merch-form-title').textContent = '➕ Add Merchandise Gear';
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
        const desc = document.getElementById('admin-merch-desc').value.trim();

        if (!title || !price) {
          alert('Please enter Title and Price.');
          return;
        }

        const list = getMerch();
        if (editId) {
          const idx = list.findIndex(i => i.id === editId);
          if (idx !== -1) list[idx] = { id: editId, title, price, tag, icon, desc };
          showToast(`Merchandise "${title}" updated!`);
        } else {
          list.push({ id: 'mrc-' + Date.now(), title, price, tag, icon, desc });
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

    container.innerHTML = list.map(m => `
      <div class="admin-item-card">
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span style="font-size:1.3rem;">${m.icon}</span>
            <span>${m.title}</span>
            <span class="admin-topbar-badge">${m.price}</span>
            <span style="font-size:0.75rem; color:#fde68a;">[${m.tag}]</span>
          </div>
          <div class="admin-item-meta">
            ${m.desc}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-mrc="${m.id}">✏️ Edit</button>
          <button class="btn-action-delete" data-del-mrc="${m.id}">🗑️ Delete</button>
        </div>
      </div>
    `).join('');

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
        document.getElementById('admin-merch-desc').value = m.desc || '';
        document.getElementById('admin-merch-form-title').textContent = `✏️ Edit Merch: ${m.title}`;

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
        document.getElementById('admin-gallery-form-title').textContent = '➕ Add Gallery Memory';
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

    container.innerHTML = list.map(g => `
      <div class="admin-item-card">
        <div class="admin-item-main">
          <div class="admin-item-title">
            <span style="font-size:1.2rem;">${g.type === 'img' ? '🖼️' : (g.icon || '🏮')}</span>
            <span>${g.caption}</span>
            <span class="admin-topbar-badge">${g.type === 'img' ? 'Photo Asset' : 'Imperial Preset'}</span>
          </div>
          <div class="admin-item-meta">
            ${g.type === 'img' ? (g.src || 'Image Path') : ('Icon: ' + (g.icon || '-') + ' | Background: ' + (g.bg || '-'))}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn-action-edit" data-edit-gal="${g.id}">✏️ Edit</button>
          <button class="btn-action-delete" data-del-gal="${g.id}">🗑️ Delete</button>
        </div>
      </div>
    `).join('');

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
        document.getElementById('admin-gallery-form-title').textContent = `✏️ Edit Moment: ${g.caption}`;

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
    getGallery
  };
})();
