/**
 * Organizer Admin Portal for Abhigraha 2K26
 * Handles live attendee metrics, applicant table, and CSV export.
 */
(function() {
  const adminBtn = document.getElementById('admin-btn');
  const adminModal = document.getElementById('admin-modal');
  const adminCloseBtn = document.getElementById('admin-modal-close');
  const adminAuthCard = document.getElementById('admin-auth-card');
  const adminDashboard = document.getElementById('admin-dashboard');
  const adminPasscode = document.getElementById('admin-passcode');
  const adminLoginBtn = document.getElementById('admin-login-btn');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const regListBody = document.getElementById('admin-reg-list');
  const searchInput = document.getElementById('admin-search-input');

  // Initial Sample Registrations if none exist in LocalStorage
  function getRegistrations() {
    let list = localStorage.getItem('abhigraha_registrations');
    if (!list) {
      const sampleData = [
        { id: 'TNU-2026-001', name: 'Aarav Mukherjee', dept: 'B.Tech CSE', year: '1st Year', event: 'Valorant & BGMI Showdown', phone: '+91 9876543210', email: 'aarav.m@tnu.in', date: '2026-09-20' },
        { id: 'TNU-2026-002', name: 'Ishita Banerjee', dept: 'B.Pharm', year: '1st Year', event: 'Nrityotsav Dance Battle', phone: '+91 9831234567', email: 'ishita.b@tnu.in', date: '2026-09-21' },
        { id: 'TNU-2026-003', name: 'Rohan Sen', dept: 'BBA', year: '1st Year', event: 'Sur Tarang Battle of Bands', phone: '+91 9830987654', email: 'rohan.sen@tnu.in', date: '2026-09-21' },
        { id: 'TNU-2026-004', name: 'Priyanka Das', dept: 'B.Sc Agriculture', year: '1st Year', event: 'Ramp of Radiance (CROWNS)', phone: '+91 9874561230', email: 'priyanka.d@tnu.in', date: '2026-09-22' }
      ];
      localStorage.setItem('abhigraha_registrations', JSON.stringify(sampleData));
      return sampleData;
    }
    return JSON.parse(list);
  }

  function renderDashboard(query = '') {
    const list = getRegistrations();
    const countEl = document.getElementById('admin-total-count');
    if (countEl) countEl.textContent = list.length;

    if (!regListBody) return;
    regListBody.innerHTML = '';

    const filtered = list.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.event.toLowerCase().includes(query.toLowerCase()) ||
      item.dept.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      regListBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: #a38c94;">No registrations match your search.</td></tr>`;
      return;
    }

    filtered.forEach(item => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
      row.innerHTML = `
        <td style="padding: 10px 8px; font-weight:700; color: #fbbf24;">${item.id}</td>
        <td style="padding: 10px 8px; font-weight:600; color:#fff;">${item.name}</td>
        <td style="padding: 10px 8px; color: #d1b8c0;">${item.dept} (${item.year})</td>
        <td style="padding: 10px 8px; color: #ff7676; font-weight:600;">${item.event}</td>
        <td style="padding: 10px 8px; color: #d1b8c0;">${item.phone}</td>
        <td style="padding: 10px 8px; color: #a38c94; font-size:0.8rem;">${item.date}</td>
      `;
      regListBody.appendChild(row);
    });
  }

  // Admin Open
  if (adminBtn && adminModal) {
    adminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      adminModal.classList.add('open');
      if (sessionStorage.getItem('abhigraha_admin_logged') === 'true') {
        adminAuthCard.style.display = 'none';
        adminDashboard.style.display = 'block';
        renderDashboard();
      } else {
        adminAuthCard.style.display = 'block';
        adminDashboard.style.display = 'none';
      }
    });
  }

  // Admin Close
  if (adminCloseBtn && adminModal) {
    adminCloseBtn.addEventListener('click', () => {
      adminModal.classList.remove('open');
    });
  }

  // Admin Login (Passcode: tnu2026)
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
      const pass = adminPasscode.value.trim();
      if (pass === 'tnu2026') {
        sessionStorage.setItem('abhigraha_admin_logged', 'true');
        adminAuthCard.style.display = 'none';
        adminDashboard.style.display = 'block';
        renderDashboard();
      } else {
        alert('Invalid Access Key! Please enter the authorized festival passcode (tnu2026).');
      }
    });
  }

  // Admin Logout
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('abhigraha_admin_logged');
      adminAuthCard.style.display = 'block';
      adminDashboard.style.display = 'none';
      adminPasscode.value = '';
    });
  }

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderDashboard(e.target.value);
    });
  }

  // Export to CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const list = getRegistrations();
      if (list.length === 0) {
        alert('No registrations available to export.');
        return;
      }

      let csv = 'Registration ID,Full Name,Department,Year,Event,Phone,Email,Date\n';
      list.forEach(r => {
        csv += `"${r.id}","${r.name}","${r.dept}","${r.year}","${r.event}","${r.phone}","${r.email}","${r.date}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Abhigraha_2k26_Registrations_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
})();
