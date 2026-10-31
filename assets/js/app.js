/* HargaUMKM — router & app controller */
window.App = (function () {
  const VIEWS = {
    beranda: { fn: 'dashboard', title: 'Beranda' },
    produk: { fn: 'products', title: 'Produk Saya' },
    kalkulator: { fn: 'calculator', title: 'Hitung Harga Jual' },
    promo: { fn: 'promo', title: 'Simulasi Promo' },
    perbandingan: { fn: 'compare', title: 'Perbandingan Keuntungan' },
    riwayat: { fn: 'history', title: 'Riwayat Simulasi' },
    laporan: { fn: 'reports', title: 'Laporan' },
    pengaturan: { fn: 'settings', title: 'Pengaturan' },
    bantuan: { fn: 'help', title: 'Bantuan & FAQ' }
  };

  const defaultUi = () => ({
    calc: null,
    promo: null,
    historyFilter: 'all',
    reportPeriod: '30',
    settingsTab: 'profil'
  });

  const state = {
    email: '',
    data: null,
    route: { type: 'landing', name: 'landing', params: [], query: {} },
    ui: defaultUi(),

    init: function () {
      window.addEventListener('hashchange', () => {
        U.closeModal();
        this.closeMenus();
        this.render(true);
      });

      document.addEventListener('click', (e) => this.onClick(e));
      document.addEventListener('submit', (e) => this.onSubmit(e));
      document.addEventListener('input', (e) => this.onInput(e));
      document.addEventListener('change', (e) => this.onChange(e));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          U.closeModal();
          this.closeMenus();
        }
      });

      try {
        Store.init();
      } catch (err) {
        console.error('Supabase gagal dimuat:', err);
        this.showBootError(err);
        return;
      }

      Store.onPasswordRecovery(() => Views.resetPasswordModal());

      const appEl = document.getElementById('app');
      if (appEl) {
        appEl.innerHTML =
          '<div class="app-shell min-h-[100dvh] grid place-items-center px-5">' +
            '<div class="text-center">' +
              '<div class="logo-mark w-10 h-10 rounded-xl text-white grid place-items-center mx-auto animate-pulse">' +
                U.icon('trending-up', 'w-5 h-5') +
              '</div>' +
              '<p class="mt-3 text-[12.5px] font-medium text-slate-500">Memuat akun Anda...</p>' +
            '</div>' +
          '</div>';
        U.refreshIcons();
      }

      this.bootstrap();
    },

    bootstrap: function () {
      Store.getUser()
        .then((user) => {
          if (!user) return null;
          this.email = user.email || '';
          return Store.load().then((data) => {
            this.data = data;
          });
        })
        .then(() => {
          this.render(false);
        })
        .catch((err) => {
          console.error('Gagal memuat data akun:', err);
          this.data = null;
          this.showBootError(err);
        });
    },

    showBootError: function (err) {
      const appEl = document.getElementById('app');
      if (!appEl) return;

      const message = typeof Store !== 'undefined' && typeof Store.friendlyError === 'function'
        ? Store.friendlyError(err)
        : 'Terjadi kesalahan saat memuat aplikasi.';

      const isDatabaseIssue = /tabel|database|schema|RLS/i.test(message);

      appEl.innerHTML =
        '<div class="min-h-[100dvh] grid place-items-center bg-slate-50 px-5 py-10">' +
          '<div class="card p-6 sm:p-8 max-w-lg w-full">' +
            '<div class="w-11 h-11 rounded-2xl bg-red-50 text-red-600 grid place-items-center">' +
              U.icon('triangle-alert', 'w-5 h-5') +
            '</div>' +
            '<h1 class="mt-4 text-lg font-bold tracking-tight text-slate-900">Aplikasi belum dapat memuat data</h1>' +
            '<p class="mt-1.5 text-[12.5px] text-slate-500 leading-6">' + U.esc(message) + '</p>' +
            (isDatabaseIssue
              ? '<div class="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-[11.5px] text-slate-500 leading-5">' +
                  'Buka Supabase Dashboard → SQL Editor, lalu jalankan seluruh isi berkas ' +
                  '<code class="font-semibold text-slate-700">supabase/schema.sql</code> dari repositori ini.' +
                '</div>'
              : '') +
            '<div class="mt-5 flex flex-col sm:flex-row gap-2.5">' +
              '<button data-action="reload" class="btn btn-primary">Coba lagi</button>' +
              '<button data-action="logout" class="btn btn-secondary">Keluar dari akun</button>' +
            '</div>' +
          '</div>' +
        '</div>';

      U.refreshIcons();
    },


    parse: function () {
      const raw = location.hash.replace(/^#\/?/, '');
      const partsRaw = raw.split('?');
      const parts = partsRaw[0].split('/').filter(Boolean);
      const query = {};
      new URLSearchParams(partsRaw[1] || '').forEach((value, key) => {
        query[key] = value;
      });

      if (parts[0] === 'app') {
        return { type: 'app', name: parts[1] || 'beranda', params: parts.slice(2), query };
      }
      if (parts[0] === 'masuk' || parts[0] === 'daftar') {
        return { type: 'auth', name: parts[0], params: [], query };
      }
      return { type: 'landing', name: 'landing', params: [], query };
    },

    render: function (scrollToTop) {
      this.route = this.parse();
      const appEl = document.getElementById('app');
      if (!appEl) return;

      if (this.route.type === 'auth') {
        if (this.data) {
          location.replace('#/app/beranda');
          return;
        }
        document.title = (this.route.name === 'masuk' ? 'Masuk' : 'Daftar') + ' · HargaUMKM';
        appEl.innerHTML = this.route.name === 'masuk' ? Views.login() : Views.register();
      } else if (this.route.type === 'app') {
        if (!this.data) {
          location.replace('#/masuk');
          return;
        }

        const page = this.route.name;
        const meta = VIEWS[page];

        if (page === 'pengaturan') {
          const allowed = ['profil', 'keamanan', 'notifikasi', 'keanggotaan'];
          const tab = this.route.query.tab;
          this.ui.settingsTab = allowed.includes(tab) ? tab : 'profil';
        }

        let title = meta ? meta.title : 'Halaman tidak ditemukan';
        let content = '';

        if (!meta) {
          content = UI.empty({
            icon: 'circle-alert',
            title: 'Halaman tidak ditemukan',
            description: 'Alamat yang Anda buka tidak tersedia. Kembali ke beranda untuk melanjutkan.',
            actionHtml: '<a href="#/app/beranda" class="btn btn-primary">Kembali ke Beranda</a>'
          });
        } else {
          try {
            content = Views[meta.fn]();
          } catch (err) {
            console.error('Gagal merender halaman:', err);
            content =
              '<div class="card p-6">' +
                '<div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 grid place-items-center">' + U.icon('triangle-alert', 'w-5 h-5') + '</div>' +
                '<h2 class="mt-4 text-[15px] font-bold text-slate-900">Halaman gagal dimuat</h2>' +
                '<p class="mt-1.5 text-[12.5px] text-slate-500 leading-6">Terjadi kesalahan saat menampilkan halaman ini. Coba muat ulang atau kembali ke beranda.</p>' +
                '<div class="mt-4 flex gap-2">' +
                  '<button data-action="reload" class="btn btn-primary">Muat ulang</button>' +
                  '<a href="#/app/beranda" class="btn btn-secondary">Beranda</a>' +
                '</div>' +
              '</div>';
          }
        }

        document.title = title + ' · HargaUMKM';
        appEl.innerHTML = UI.shell(meta ? page : '', title, content, this.data);
      } else {
        document.title = 'HargaUMKM — Hitung Harga Jual, Raih Keuntungan';
        appEl.innerHTML = Views.landing();
      }

      U.refreshIcons();
      this.afterRender();

      if (scrollToTop) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    },

    afterRender: function () {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const nodes = document.querySelectorAll('.reveal');

      if (reduce || !('IntersectionObserver' in window)) {
        nodes.forEach((node) => node.classList.add('is-visible'));
      } else {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
        );
        nodes.forEach((node) => io.observe(node));
      }

      this.updateHero();
    },

    updateHero: function () {
      const modalEl = document.querySelector('[data-hero-field="modal"]');
      const marginEl = document.querySelector('[data-hero-field="margin"]');
      if (!modalEl || !marginEl) return;

      const res = Calc.price({
        modal: modalEl.value,
        targetType: 'percent',
        targetValue: marginEl.value,
        roundTo: 500
      });

      const priceEl = document.getElementById('hero-price');
      const profitEl = document.getElementById('hero-profit');
      const costEl = document.getElementById('hero-cost');
      if (!priceEl || !profitEl || !costEl) return;

      if (res.error) {
        priceEl.textContent = 'Rp 0';
        profitEl.textContent = 'Rp 0';
        costEl.textContent = 'Rp 0';
      } else {
        priceEl.textContent = U.rupiah(res.price);
        profitEl.textContent = U.rupiah(res.profit);
        costEl.textContent = U.rupiah(res.costBase);
      }
    },

    setSession: function (data) {
      this.data = data || null;
      this.email = data && data.user ? data.user.email : '';
      this.ui = defaultUi();
    },

    save: async function (opts) {
      if (!this.data) return false;
      const silent = opts && opts.silent;

      try {
        await Store.save(this.data);
        return true;
      } catch (err) {
        console.error('Gagal menyimpan data ke Supabase:', err);
        if (!silent) U.toast(Store.friendlyError(err), 'error');
        return false;
      }
    },

    refresh: function () {
      this.render(false);
    },

    openMenu: function () {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.remove('-translate-x-full');
      if (overlay) overlay.classList.remove('hidden');
    },

    closeMenus: function () {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.add('-translate-x-full');
      if (overlay) overlay.classList.add('hidden');
      this.closeLandingMenu();
    },

    closeLandingMenu: function () {
      const menu = document.getElementById('landing-mobile-menu');
      if (menu) menu.classList.add('hidden');
      const btn = document.querySelector('[data-action="toggle-landing-menu"]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    },

    logout: async function () {
      try {
        await Store.logout();
      } catch (err) {
        console.error('Gagal keluar dari Supabase:', err);
        U.toast('Gagal keluar dari akun. Silakan coba lagi.', 'error');
        return;
      }

      this.email = '';
      this.data = null;
      this.ui = defaultUi();

      U.closeModal();
      U.toast('Anda telah keluar dari akun.', 'info');

      if (location.hash === '#/' || location.hash === '') {
        this.render(true);
      } else {
        location.hash = '#/';
      }
    },


    onClick: function (e) {
      /* Tutup dropdown user saat klik di luar */
      const currentMenu = e.target.closest('details[data-menu]');
      document.querySelectorAll('details[data-menu][open]').forEach((menu) => {
        if (menu !== currentMenu) menu.open = false;
      });

      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.getAttribute('data-action');
      const val = el.getAttribute('data-value');

      switch (action) {
        case 'scroll': {
          const target = document.getElementById(el.getAttribute('data-target'));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.closeLandingMenu();
          break;
        }
        case 'toggle-landing-menu': {
          const menu = document.getElementById('landing-mobile-menu');
          if (!menu) break;
          const isHidden = menu.classList.toggle('hidden');
          el.setAttribute('aria-expanded', String(!isHidden));
          break;
        }
        case 'open-menu':
          this.openMenu();
          break;
        case 'close-menu':
          this.closeMenus();
          break;
        case 'nav': {
          const path = el.getAttribute('data-path');
          if (!path) break;
          U.closeModal();
          if (location.hash === path) this.refresh();
          else location.hash = path;
          break;
        }
        case 'reload':
          location.reload();
          break;
        case 'open-upgrade':
          if (!this.data) {
            location.hash = '#/daftar';
            break;
          }
          UI.upgradeModal();
          break;
        case 'activate-premium': {
          if (!this.data) {
            location.hash = '#/daftar';
            break;
          }
          const previousPremium = this.data.user.premium;
          const previousSince = this.data.user.premiumSince;
          this.data.user.premium = true;
          this.data.user.premiumSince = previousSince || new Date().toISOString();
          U.closeModal();
          this.save({ silent: true }).then((ok) => {
            if (!ok) {
              this.data.user.premium = previousPremium;
              this.data.user.premiumSince = previousSince;
              U.toast('Gagal mengaktifkan Premium. Periksa koneksi lalu coba lagi.', 'error');
              this.refresh();
              return;
            }
            U.toast('Premium aktif. Semua fitur sekarang terbuka.');
            this.refresh();
          });
          break;
        }
        case 'close-modal':
          U.closeModal();
          break;
        case 'confirm-yes':
          U.runConfirm();
          break;
        case 'logout':
          this.logout();
          break;
        case 'open-notifications':
          UI.notificationsModal();
          break;
        case 'forgot':
          Views.forgot();
          break;
        case 'demo-login':
          Views.demoLogin();
          break;
        case 'toggle-pass': {
          const input = document.getElementById(el.getAttribute('data-target'));
          if (!input) break;
          const show = input.type === 'password';
          input.type = show ? 'text' : 'password';
          el.innerHTML = U.icon(show ? 'eye-off' : 'eye', 'w-4 h-4');
          el.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
          U.refreshIcons();
          break;
        }
        case 'new-product':
          this.ui.calc = null;
          if (location.hash === '#/app/kalkulator') this.refresh();
          else location.hash = '#/app/kalkulator';
          break;
        case 'edit-product': {
          const id = el.getAttribute('data-id');
          const product = this.data.products.find((p) => p.id === id);
          if (!product) break;
          U.closeModal();
          this.ui.calc = Views.draftFromProduct(product);
          const path = '#/app/kalkulator/' + id;
          if (location.hash === path) this.refresh();
          else location.hash = path;
          break;
        }
        case 'view-product':
          Views.productModal(el.getAttribute('data-id'));
          break;
        case 'delete-product':
          Views.deleteProduct(el.getAttribute('data-id'));
          break;
        case 'save-product':
          Views.saveProduct();
          break;
        case 'calc-type':
          Views.setCalcType(el.getAttribute('data-kind'), el.getAttribute('data-value'));
          break;
        case 'promo-discount':
          Views.promoApply(val);
          break;
        case 'save-promo':
          Views.savePromo();
          break;
        case 'history-filter':
          Views.historyFilter(val);
          break;
        case 'view-history':
          Views.historyModal(el.getAttribute('data-id'));
          break;
        case 'delete-history':
          Views.deleteHistory(el.getAttribute('data-id'));
          break;
        case 'clear-history':
          Views.clearHistory();
          break;
        case 'download-report':
          Views.downloadReport();
          break;
        case 'report-period':
          Views.setReportPeriod(val);
          break;
        case 'settings-tab':
          Views.settingsTab(el.getAttribute('data-tab'));
          break;
        case 'verify-phone':
          Views.verifyPhone();
          break;
        case 'downgrade':
          Views.downgrade();
          break;
        case 'reset-data':
          Views.resetData();
          break;
        default:
          break;
      }
    },

    onSubmit: function (e) {
      const form = e.target.closest('form[data-form]');
      if (!form) return;
      e.preventDefault();
      const kind = form.getAttribute('data-form');
      if (kind === 'login') Views.loginSubmit(form);
      else if (kind === 'register') Views.registerSubmit(form);
      else if (kind === 'forgot') Views.forgotSubmit(form);
      else if (kind === 'calc') Views.saveProduct();
      else if (kind === 'profile') Views.saveProfile(form);
      else if (kind === 'password') Views.changePassword(form);
      else if (kind === 'reset-password') Views.resetPasswordSubmit(form);
    },

    onInput: function (e) {
      const el = e.target;

      if (el.matches('[data-calc-field]')) {
        if (!this.ui.calc) return;
        const field = el.getAttribute('data-calc-field');
        this.ui.calc[field] = el.value;
        if (field !== 'name' && field !== 'category' && el.tagName !== 'SELECT') {
          Views.calcUpdate();
        }
        return;
      }

      if (el.matches('[data-hero-field]')) {
        this.updateHero();
        return;
      }

      if (el.matches('[data-product-search]')) {
        Views.filterProducts();
        return;
      }

      if (el.matches('[data-discount-range]') || el.matches('[data-promo-custom]')) {
        Views.promoApply(el.value);
        return;
      }

      if (el.matches('[data-min-value]')) {
        if (this.ui.promo) this.ui.promo.minValue = el.value;
        Views.promoUpdateLimit();
        return;
      }

      if (el.matches('[data-faq-search]')) {
        Views.filterFaq();
      }
    },

    onChange: function (e) {
      const el = e.target;

      if (el.matches('[data-calc-field]') && el.tagName === 'SELECT') {
        if (!this.ui.calc) return;
        const field = el.getAttribute('data-calc-field');
        this.ui.calc[field] = el.value;
        Views.calcUpdate();
        return;
      }

      if (el.matches('[data-promo-product]')) {
        if (!this.ui.promo) return;
        this.ui.promo.productId = el.value;
        this.refresh();
        return;
      }

      if (el.matches('[data-min-type]')) {
        if (!this.ui.promo) return;
        this.ui.promo.minType = el.value;
        this.refresh();
        return;
      }

      if (el.matches('[data-report-period]')) {
        Views.setReportPeriod(el.value);
        return;
      }

      if (el.matches('[data-product-category]')) {
        Views.filterProducts();
        return;
      }

      if (el.matches('[data-setting]')) {
        Views.toggleSetting(el.getAttribute('data-setting'), el.checked);
      }
    }
  };

  return state;
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    App.init();
  });
} else {
  App.init();
}
