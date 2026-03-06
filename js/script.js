/* ============================================================
   APPOINTMENT SCHEDULING SYSTEM — SHARED JAVASCRIPT
   ============================================================ */

/* ---------- Navbar: scroll shadow + hamburger ---------- */
(function () {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      hamburger.classList.toggle('active');
    });
  }

  // Mark active nav link
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });
})();

/* ---------- Toast Notification ---------- */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

/* ---------- Modal Helpers ---------- */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// Close buttons
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal-overlay').classList.remove('open');
  });
});

/* ---------- Password Toggle ---------- */
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.textContent = isText ? '👁' : '🙈';
  });
});

/* ---------- Star Rating ---------- */
function initStarRating(container, callback) {
  if (!container) return;
  const stars = container.querySelectorAll('.star');
  let selected = 0;

  stars.forEach((star, i) => {
    star.addEventListener('mouseenter', () => highlightStars(stars, i));
    star.addEventListener('mouseleave', () => highlightStars(stars, selected - 1));
    star.addEventListener('click', () => {
      selected = i + 1;
      highlightStars(stars, i);
      if (callback) callback(selected);
    });
  });
}

function highlightStars(stars, upTo) {
  stars.forEach((s, i) => s.classList.toggle('filled', i <= upTo));
}

// Auto-init all star rating containers
document.querySelectorAll('.star-rating').forEach(container => {
  initStarRating(container);
});

/* ---------- Slot Picker ---------- */
function initSlotPicker(container, callback) {
  if (!container) return;
  container.querySelectorAll('.slot-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (callback) callback(btn.dataset.time || btn.textContent.trim());
    });
  });
}

/* ---------- Simple Tab Switcher ---------- */
function initTabs(tabsEl) {
  if (!tabsEl) return;
  const triggers = tabsEl.querySelectorAll('[data-tab]');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const target = trigger.dataset.tab;
      triggers.forEach(t => t.classList.remove('active'));
      trigger.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== target);
      });
    });
  });
}

/* ---------- Admin Sidebar Toggle (mobile) ---------- */
const sidebarToggle = document.querySelector('#sidebarToggle');
const sidebar = document.querySelector('.sidebar');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

/* Mark active sidebar link */
document.querySelectorAll('.sidebar-nav a').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});

/* ---------- Confirm Delete helper ---------- */
function confirmDelete(name, onConfirm) {
  if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
    onConfirm();
  }
}

/* ---------- Form validation helper ---------- */
function validateForm(formId, rules) {
  const form = document.getElementById(formId);
  if (!form) return false;
  let valid = true;
  rules.forEach(({ field, check, message }) => {
    const el = form.querySelector(`[name="${field}"]`);
    if (!el) return;
    el.classList.remove('error');
    if (!check(el.value)) {
      el.classList.add('error');
      showToast(message, 'error');
      valid = false;
    }
  });
  return valid;
}

/* ---------- Smooth scroll for anchors ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ---------- Number counter animation (dashboard stats) ---------- */
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  if (isNaN(target)) return;
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString();
    if (current >= target) clearInterval(timer);
  }, 16);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); observer.unobserve(e.target); } });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
