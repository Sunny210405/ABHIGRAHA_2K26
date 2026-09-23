/**
 * Live Countdown Timer for Abhigraha 2K26 Opening Ceremony
 */
(function() {
  // Festival inauguration date: November 20, 2026 10:00:00 AM IST
  // Adjusts dynamically if date is past to always display an active countdown
  let targetDate = new Date('2026-11-20T10:00:00+05:30').getTime();
  const now = new Date().getTime();
  
  if (targetDate - now <= 0) {
    // If the target is passed, set to 57 days from current date
    targetDate = now + 57 * 24 * 60 * 60 * 1000;
  }

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  function updateCountdown() {
    const current = new Date().getTime();
    const diff = targetDate - current;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = d < 10 ? '0' + d : d;
    if (hoursEl) hoursEl.textContent = h < 10 ? '0' + h : h;
    if (minutesEl) minutesEl.textContent = m < 10 ? '0' + m : m;
    if (secondsEl) secondsEl.textContent = s < 10 ? '0' + s : s;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
