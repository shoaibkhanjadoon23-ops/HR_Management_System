// ============================================================
// CHANGE THIS TO YOUR HUGGING FACE SPACE API URL
// ============================================================
const API_BASE = 'https://HRhiringpro-HRPRO.hf.space';

// ============================================================
// GLOBAL API CLIENT
// ============================================================
const API = {
  token: () => localStorage.getItem('token'),

  async request(method, path, body = null, isFormData = false) {
    const headers = {
      'Authorization': `Bearer ${this.token()}`
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const opts = {
      method,
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
    };
    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
  },

  get: (path) => API.request('GET', path),
  post: (path, body, isFormData = false) => API.request('POST', path, body, isFormData),
  put: (path, body) => API.request('PUT', path, body),
  delete: (path) => API.request('DELETE', path)
};

// ============================================================
// AUTH GUARD
// ============================================================
function requireAuth() {
  if (!API.token()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(msg, type = 'success', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  const colors = {
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    info: '#2563eb'
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]};font-size:18px"></i><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
// FORMAT HELPERS
// ============================================================
function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function fmtDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function fmtCurrency(n) {
  return '$' + Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ============================================================
// STATUS BADGE GENERATOR
// ============================================================
function statusBadge(status) {
  const map = {
    pending: 'badge-pending',
    under_review: 'badge-shortlisted',
    shortlisted: 'badge-shortlisted',
    interview_scheduled: 'badge-interview',
    interview_passed: 'badge-passed',
    offer_sent: 'badge-offer',
    offer_accepted: 'badge-passed',
    hired: 'badge-hired',
    rejected: 'badge-rejected',
    withdrawn: 'badge-draft',
    active: 'badge-active',
    closed: 'badge-rejected',
    draft: 'badge-draft',
    paid: 'badge-paid',
    unpaid: 'badge-pending',
    scheduled: 'badge-interview',
    completed: 'badge-passed',
    passed: 'badge-passed',
    failed: 'badge-failed',
    sent: 'badge-sent',
    accepted: 'badge-active'
  };
  const labels = {
    pending: 'Pending',
    under_review: 'Under Review',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview Scheduled',
    interview_passed: 'Interview Passed',
    offer_sent: 'Offer Sent',
    offer_accepted: 'Offer Accepted',
    hired: 'Hired',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    active: 'Active',
    closed: 'Closed',
    draft: 'Draft',
    paid: 'Paid',
    unpaid: 'Unpaid',
    scheduled: 'Scheduled',
    completed: 'Completed',
    passed: 'Passed',
    failed: 'Failed',
    sent: 'Sent',
    accepted: 'Accepted'
  };
  return `<span class="badge ${map[status] || 'badge-draft'}">${labels[status] || status}</span>`;
}

// ============================================================
// SIDEBAR USER AND ACTIVE NAV
// ============================================================
function renderSidebarUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  const el = document.getElementById('sidebarUser');
  if (!el) return;
  const initials = (user.full_name || user.username || 'HR')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  el.innerHTML = `
    <div class="user-avatar">${initials}</div>
    <div class="user-info">
      <div class="name">${user.full_name || user.username}</div>
      <div class="role">${user.role || 'HR Manager'}</div>
    </div>
  `;
}

function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && path.includes(href.replace('.html', ''))) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// ============================================================
// MODAL HELPERS
// ============================================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

document.addEventListener('click', e => {
  if (e.target.classList && e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// ============================================================
// LOGOUT
// ============================================================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// ============================================================
// SIDEBAR TOGGLE (MOBILE)
// ============================================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// ============================================================
// COPY TO CLIPBOARD
// ============================================================
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast('Copied to clipboard!', 'success', 2000))
    .catch(() => showToast('Failed to copy', 'error'));
}

// ============================================================
// DEBOUNCE
// ============================================================
function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ============================================================
// TAGS INPUT
// ============================================================
function initTagsInput(inputId, tagsId, hiddenId) {
  const input = document.getElementById(inputId);
  const tagsContainer = document.getElementById(tagsId);
  let tags = [];

  function render() {
    tagsContainer.innerHTML = tags.map(t => `
      <span class="tag">${t} <i class="fas fa-times" onclick="removeTag('${t}', '${inputId}', '${tagsId}', '${hiddenId}')" style="cursor:pointer;margin-left:4px"></i></span>
    `).join('');
    if (hiddenId) document.getElementById(hiddenId).value = JSON.stringify(tags);
  }

  if (input) {
    input.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
        e.preventDefault();
        const val = input.value.trim().replace(/,/g, '');
        if (val && !tags.includes(val)) {
          tags.push(val);
          render();
        }
        input.value = '';
      }
    });
  }

  window[`getTags_${hiddenId}`] = () => tags;
  window[`setTags_${hiddenId}`] = (t) => { tags = t; render(); };
  window.removeTag = (t, inputId, tagsId, hiddenId) => {
    tags = tags.filter(x => x !== t);
    render();
  };
}

// ============================================================
// CHARTS
// ============================================================
function drawBarChart(canvasId, labels, data, color = '#6366f1') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = 200;
  ctx.clearRect(0, 0, W, H);
  const max = Math.max(...data, 1);
  const barW = (W - 60) / labels.length - 10;
  const padL = 40, padB = 40;
  const chartH = H - padB - 10;

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 10 + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - 10, y);
    ctx.stroke();
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(max - (max / 4) * i), padL - 6, y + 4);
  }

  labels.forEach((label, i) => {
    const x = padL + i * (barW + 10);
    const barH = (data[i] / max) * chartH;
    const y = 10 + chartH - barH;
    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '80');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 4);
    ctx.fill();
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + barW / 2, H - 8);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(data[i], x + barW / 2, y - 4);
  });
}

function drawDonutChart(canvasId, segments) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = 200;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) / 2 - 20;
  const innerR = r * 0.6;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  ctx.clearRect(0, 0, W, H);
  let angle = -Math.PI / 2;

  segments.forEach(seg => {
    const slice = (seg.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    angle += slice;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 20px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(total, cx, cy + 6);
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px system-ui';
  ctx.fillText('Total', cx, cy + 22);
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };
}

// Initialize sidebar on every page that uses it
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarUser();
  setActiveNav();
});
