/* ============================================================
   APPOINTEASE — SHARED API HELPER
   All pages include this file to communicate with the backend.
   ============================================================ */

const API_BASE = 'http://localhost:5000/api';

// ── Token helpers ─────────────────────────────────────────────
function getToken()  { return localStorage.getItem('ae_token'); }
function getUser()   { const u = localStorage.getItem('ae_user'); return u ? JSON.parse(u) : null; }
function isAdmin()   { const u = getUser(); return u && u.role === 'admin'; }
function isLoggedIn(){ return !!getToken(); }

function saveAuth(token, user) {
  localStorage.setItem('ae_token', token);
  localStorage.setItem('ae_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('ae_token');
  localStorage.removeItem('ae_user');
}

// ── Core fetch wrapper ────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    window.location.href = 'login.html';
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// ── Convenience methods ───────────────────────────────────────
const api = {
  get:    (path)         => apiFetch(path),
  post:   (path, body)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' })
};

// ── Navbar state: show logged-in user info ────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;
  const user = getUser();
  if (user) {
    navActions.innerHTML = `
      <span style="font-size:0.85rem; color:var(--text-muted); margin-right:8px">Hi, ${user.name.split(' ')[0]}!</span>
      ${user.role === 'admin' ? `<a href="admin_dashboard.html" class="btn btn-outline btn-sm">⚙️ Admin</a>` : `<a href="history.html" class="btn btn-ghost btn-sm">My Bookings</a>`}
      <button class="btn btn-outline btn-sm" onclick="logout()">Sign Out</button>`;
  }
});

function logout() {
  clearAuth();
  showToast('Logged out successfully.', 'success');
  setTimeout(() => window.location.href = 'index.html', 800);
}
