/* HargaUMKM — shared utilities */
window.U = (function () {
  const idr = new Intl.NumberFormat('id-ID');

  const number = (v) => idr.format(Math.round(Number(v) || 0));

  const rupiah = (v) => 'Rp ' + number(v);

  const compact = (v) => {
    const n = Number(v) || 0;
    if (Math.abs(n) >= 1000000000) return 'Rp ' + (n / 1000000000).toFixed(1).replace('.', ',') + ' M';
    if (Math.abs(n) >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1).replace('.', ',') + ' jt';
    if (Math.abs(n) >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
    return rupiah(n);
  };

  const pct = (v, digits = 1) => {
    const n = Number(v) || 0;
    return n.toFixed(digits).replace('.', ',') + '%';
  };

  const toNum = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const n = parseFloat(String(v == null ? '' : v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

  const dateObj = (v) => {
    const d = v instanceof Date ? v : new Date(v);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  };

  const dateShort = (v) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(dateObj(v));

  const dateLong = (v) =>
    new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj(v));

  const dateTime = (v) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(dateObj(v));

  const timeAgo = (v) => {
    const diff = Date.now() - dateObj(v).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return mins + ' menit lalu';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + ' jam lalu';
    const days = Math.floor(hours / 24);
    if (days < 7) return days + ' hari lalu';
    return dateShort(v);
  };

  const uid = (prefix) =>
    (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const initials = (name) =>
    String(name || 'U')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s.charAt(0).toUpperCase())
      .join('') || 'U';

  const icon = (name, cls) =>
    '<i data-lucide="' + name + '" class="' + (cls || 'w-5 h-5') + '" aria-hidden="true"></i>';

  const refreshIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ attrs: { 'stroke-width': '1.8', 'aria-hidden': 'true' } });
    }
  };

  const toast = (message, type) => {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const kind = type || 'success';
    const map = {
      success: { icon: 'circle-check', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      error: { icon: 'circle-alert', color: 'text-red-600', bg: 'bg-red-50' },
      info: { icon: 'info', color: 'text-brand-600', bg: 'bg-brand-50' }
    };
    const cfg = map[kind] || map.info;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML =
      '<div class="w-8 h-8 rounded-lg ' + cfg.bg + ' ' + cfg.color + ' grid place-items-center shrink-0">' +
      icon(cfg.icon, 'w-4 h-4') + '</div>' +
      '<p class="text-[13px] leading-5 font-medium text-slate-700 pt-0.5">' + esc(message) + '</p>';
    root.appendChild(el);
    refreshIcons();
    requestAnimationFrame(() => el.classList.add('toast-in'));
    setTimeout(() => {
      el.classList.remove('toast-in');
      el.classList.add('toast-out');
      setTimeout(() => el.remove(), 260);
    }, 3400);
  };

  const openModal = (html, opts) => {
    const o = opts || {};
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML =
      '<div class="modal-backdrop" data-modal-backdrop>' +
      '<div class="modal-panel ' + (o.size || 'max-w-lg') + '" role="dialog" aria-modal="true" aria-label="' +
      esc(o.label || 'Dialog') + '">' + html + '</div>' +
      '</div>';
    document.body.style.overflow = 'hidden';
    const backdrop = root.querySelector('[data-modal-backdrop]');
    if (backdrop) {
      backdrop.addEventListener('mousedown', (e) => {
        if (e.target === backdrop) closeModal();
      });
    }
    refreshIcons();
    setTimeout(() => {
      const focusable = root.querySelector('input:not([type="hidden"]), select, textarea, button[data-autofocus]');
      if (focusable) focusable.focus();
    }, 60);
  };

  const closeModal = () => {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML = '';
    document.body.style.overflow = '';
    _confirmCb = null;
  };

  let _confirmCb = null;

  const confirm = (opts) => {
    const o = opts || {};
    _confirmCb = o.onConfirm || null;
    openModal(
      '<div class="p-6 sm:p-7">' +
        '<div class="flex items-start gap-4">' +
          '<div class="w-11 h-11 rounded-2xl ' + (o.danger === false ? 'bg-brand-50 text-brand-600' : 'bg-red-50 text-red-600') + ' grid place-items-center shrink-0">' +
            icon(o.danger === false ? 'circle-help' : 'triangle-alert', 'w-5 h-5') +
          '</div>' +
          '<div class="min-w-0">' +
            '<h3 class="text-lg font-bold tracking-tight text-slate-900">' + esc(o.title || 'Konfirmasi') + '</h3>' +
            '<p class="text-sm text-slate-600 mt-1.5 leading-6">' + esc(o.message || 'Lanjutkan tindakan ini?') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2.5">' +
          '<button type="button" class="btn btn-secondary" data-action="close-modal">Batal</button>' +
          '<button type="button" class="btn ' + (o.danger === false ? 'btn-primary' : 'btn-danger') + '" data-action="confirm-yes">' +
            esc(o.confirmText || 'Ya, lanjutkan') +
          '</button>' +
        '</div>' +
      '</div>',
      { label: o.title || 'Konfirmasi' }
    );
  };

  const runConfirm = () => {
    const cb = _confirmCb;
    _confirmCb = null;
    closeModal();
    if (typeof cb === 'function') cb();
  };

  const formError = (form, message) => {
    const box = form.querySelector('[data-form-error]');
    if (!box) return;
    box.textContent = message || '';
    box.classList.toggle('hidden', !message);
  };

  return {
    number, rupiah, compact, pct, toNum, clamp, esc, dateShort, dateLong, dateTime,
    timeAgo, uid, initials, icon, refreshIcons, toast, openModal, closeModal,
    confirm, runConfirm, formError
  };
})();
