/* HargaUMKM — app shell & shared UI */
window.UI = (function () {
  const LIMITS = { products: 5, history: 10 };

  const premiumNav = ['promo', 'perbandingan', 'laporan'];

  const navGroups = [
    {
      label: 'Utama',
      items: [
        { key: 'beranda', label: 'Beranda', icon: 'layout-dashboard', path: '#/app/beranda' },
        { key: 'produk', label: 'Produk Saya', icon: 'package', path: '#/app/produk' },
        { key: 'kalkulator', label: 'Hitung Harga Jual', icon: 'calculator', path: '#/app/kalkulator' }
      ]
    },
    {
      label: 'Premium',
      items: [
        { key: 'promo', label: 'Simulasi Promo', icon: 'percent', path: '#/app/promo', premium: true },
        { key: 'perbandingan', label: 'Perbandingan Harga', icon: 'bar-chart-3', path: '#/app/perbandingan', premium: true },
        { key: 'laporan', label: 'Laporan', icon: 'file-text', path: '#/app/laporan', premium: true }
      ]
    },
    {
      label: 'Lainnya',
      items: [
        { key: 'riwayat', label: 'Riwayat Simulasi', icon: 'history', path: '#/app/riwayat' },
        { key: 'pengaturan', label: 'Pengaturan', icon: 'settings', path: '#/app/pengaturan' },
        { key: 'bantuan', label: 'Bantuan & FAQ', icon: 'circle-help', path: '#/app/bantuan' }
      ]
    }
  ];

  function navItem(item, active, premium) {
    const isActive = active === item.key;
    const locked = item.premium && !premium;
    return (
      '<a href="' + item.path + '" class="nav-item ' + (isActive ? 'nav-item-active' : '') + '"' +
        (isActive ? ' aria-current="page"' : '') + '>' +
        U.icon(item.icon, 'w-[18px] h-[18px] shrink-0 ' + (isActive ? 'text-brand-600' : 'text-slate-400')) +
        '<span class="flex-1 truncate">' + U.esc(item.label) + '</span>' +
        (locked
          ? U.icon('lock', 'w-3.5 h-3.5 text-slate-300 shrink-0')
          : (item.premium ? '<span class="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0"></span>' : '')) +
      '</a>'
    );
  }

  function planCard(data) {
    const premium = data.user.premium;
    const count = data.products.length;
    const limit = LIMITS.products;

    if (premium) {
      const since = data.user.premiumSince ? U.dateShort(data.user.premiumSince) : 'hari ini';
      return (
        '<div class="rounded-2xl p-4 text-white relative overflow-hidden" style="background:linear-gradient(135deg,#4f46e5 0%,#0d9488 52%,#141a2e 100%)">' +
          '<div class="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-amber-300/20 blur-sm"></div>' +
          '<div class="absolute -left-8 -bottom-10 w-24 h-24 rounded-full bg-white/10"></div>' +
          '<div class="relative">' +
            '<div class="flex items-center gap-2">' +
              U.icon('crown', 'w-4 h-4 text-amber-300') +
              '<span class="text-[10px] font-bold tracking-[0.12em] text-indigo-100">PREMIUM AKTIF</span>' +
            '</div>' +
            '<p class="text-[13px] font-semibold mt-2">Semua fitur terbuka</p>' +
            '<p class="text-[11px] text-teal-100/80 mt-0.5">Sejak ' + U.esc(since) + '</p>' +
            '<button data-action="nav" data-path="#/app/pengaturan?tab=keanggotaan" class="mt-3 w-full text-[12px] font-semibold bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg py-1.5 transition">Kelola paket</button>' +
          '</div>' +
        '</div>'
      );
    }

    const width = Math.min(100, Math.round((count / limit) * 100));
    return (
      '<div class="rounded-2xl border border-slate-200 bg-white p-4">' +
        '<div class="flex items-center gap-2">' +
          '<span class="w-5 h-5 rounded-md bg-brand-50 grid place-items-center">' + U.icon('sparkles', 'w-3 h-3 text-brand-600') + '</span>' +
          '<span class="text-[10px] font-bold tracking-[0.12em] text-slate-500">PAKET GRATIS</span>' +
        '</div>' +
        '<div class="flex items-center justify-between mt-2.5">' +
          '<span class="text-[12px] text-slate-600">Produk tersimpan</span>' +
          '<span class="text-[12px] font-bold text-slate-800 num">' + count + '/' + limit + '</span>' +
        '</div>' +
        '<div class="h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">' +
          '<div class="h-full rounded-full ' + (width >= 100 ? 'bg-amber-500' : 'bg-brand-600') + '" style="width:' + width + '%"></div>' +
        '</div>' +
        '<button data-action="open-upgrade" class="mt-3 w-full btn btn-primary !py-1.5 !text-[12px]">Upgrade Premium</button>' +
      '</div>'
    );
  }

  function sidebar(active, data) {
    const premium = data.user.premium;
    const groups = navGroups.map((group) =>
      '<div class="mb-5">' +
        '<p class="nav-label">' + group.label + '</p>' +
        '<div class="space-y-0.5">' +
          group.items.map((item) => navItem(item, active, premium)).join('') +
        '</div>' +
      '</div>'
    ).join('');

    return (
      '<aside id="sidebar" class="app-sidebar fixed inset-y-0 left-0 z-50 w-[264px] bg-white border-r border-slate-200 flex flex-col transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-out">' +
        '<div class="h-16 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">' +
          '<a href="#/app/beranda" class="flex items-center gap-2.5">' +
            '<span class="logo-mark grid place-items-center w-9 h-9 rounded-xl text-white shadow-sm">' + U.icon('trending-up', 'w-[18px] h-[18px]') + '</span>' +
            '<span class="font-extrabold tracking-tight text-[17px] text-slate-900">Harga<span class="text-brand-600">UMKM</span></span>' +
          '</a>' +
          '<button class="lg:hidden icon-btn !w-9 !h-9" data-action="close-menu" aria-label="Tutup menu">' + U.icon('x', 'w-4 h-4') + '</button>' +
        '</div>' +
        '<nav class="flex-1 overflow-y-auto scrollbar-slim px-3 py-4">' + groups + '</nav>' +
        '<div class="p-3 border-t border-slate-100 shrink-0">' +
          planCard(data) +
          '<div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2.5">' +
            '<div class="w-9 h-9 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-[11px] font-bold shrink-0">' +
              U.esc(U.initials(data.user.name)) +
            '</div>' +
            '<div class="min-w-0 flex-1">' +
              '<p class="text-[13px] font-semibold text-slate-800 truncate">' + U.esc(data.user.name || 'Pengguna') + '</p>' +
              '<p class="text-[11px] text-slate-400 truncate">' + U.esc(data.user.email) + '</p>' +
            '</div>' +
            '<button data-action="logout" class="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Keluar" aria-label="Keluar">' +
              U.icon('log-out', 'w-4 h-4') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</aside>'
    );
  }

  function topbar(title, data) {
    return (
      '<header class="app-topbar sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200/80 no-print">' +
        '<div class="h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-3">' +
          '<button class="lg:hidden icon-btn" data-action="open-menu" aria-label="Buka menu">' + U.icon('menu', 'w-5 h-5') + '</button>' +
          '<div class="min-w-0">' +
            '<p class="text-[10px] uppercase tracking-[0.12em] text-slate-400 font-bold">HargaUMKM</p>' +
            '<h1 class="text-sm sm:text-[15px] font-bold text-slate-900 truncate leading-tight">' + U.esc(title) + '</h1>' +
          '</div>' +
          '<div class="ml-auto flex items-center gap-1">' +
            '<button class="icon-btn relative" data-action="open-notifications" aria-label="Notifikasi" title="Notifikasi">' +
              U.icon('bell', 'w-[19px] h-[19px]') +
              '<span class="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-white"></span>' +
            '</button>' +
            '<a href="#/app/bantuan" class="icon-btn hidden sm:inline-flex" aria-label="Bantuan" title="Bantuan">' + U.icon('circle-help', 'w-[19px] h-[19px]') + '</a>' +
            '<details class="relative ml-1" data-menu>' +
              '<summary class="list-none cursor-pointer flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 transition">' +
                '<span class="w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center text-[11px] font-bold">' + U.esc(U.initials(data.user.name)) + '</span>' +
                '<span class="hidden md:block text-[13px] font-semibold text-slate-700 max-w-[110px] truncate">' + U.esc((data.user.name || 'Pengguna').split(' ')[0]) + '</span>' +
                U.icon('chevron-down', 'w-3.5 h-3.5 text-slate-400 hidden md:block') +
              '</summary>' +
              '<div class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-40">' +
                '<div class="px-3 py-2 border-b border-slate-100 mb-1">' +
                  '<p class="text-[13px] font-semibold text-slate-800 truncate">' + U.esc(data.user.name || 'Pengguna') + '</p>' +
                  '<p class="text-[11px] text-slate-400 truncate">' + U.esc(data.user.email) + '</p>' +
                '</div>' +
                '<a href="#/app/pengaturan?tab=profil" class="nav-item !py-2 !text-[13px]">' + U.icon('user', 'w-4 h-4 text-slate-400') + 'Profil Saya</a>' +
                '<a href="#/app/pengaturan?tab=keanggotaan" class="nav-item !py-2 !text-[13px]">' + U.icon('crown', 'w-4 h-4 text-slate-400') + 'Keanggotaan</a>' +
                '<a href="#/app/bantuan" class="nav-item !py-2 !text-[13px]">' + U.icon('circle-help', 'w-4 h-4 text-slate-400') + 'Bantuan</a>' +
                '<button data-action="logout" class="nav-item !py-2 !text-[13px] w-full text-left text-red-600 hover:!bg-red-50">' + U.icon('log-out', 'w-4 h-4') + 'Keluar</button>' +
              '</div>' +
            '</details>' +
          '</div>' +
        '</div>' +
      '</header>'
    );
  }

  function shell(active, title, content, data) {
    return (
      '<div class="app-shell min-h-screen">' +
        sidebar(active, data) +
        '<div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 hidden lg:hidden" data-action="close-menu"></div>' +
        '<div class="lg:pl-[264px] min-h-screen flex flex-col">' +
          topbar(title, data) +
          '<main class="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">' +
            '<div class="max-w-[1180px] mx-auto view-enter">' + content + '</div>' +
          '</main>' +
          '<footer class="px-4 sm:px-6 lg:px-8 py-5 text-[11px] text-slate-400 border-t border-slate-200/70 no-print">' +
            '<div class="max-w-[1180px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1">' +
              '<span>HargaUMKM versi demo. Data tersinkron aman di cloud.</span>' +
              '<span>Dibuat untuk UMKM Indonesia</span>' +
            '</div>' +
          '</footer>' +
        '</div>' +
      '</div>'
    );
  }

  function empty(opts) {
    const o = opts || {};
    return (
      '<div class="card p-8 sm:p-12 text-center">' +
        '<div class="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto">' +
          U.icon(o.icon || 'package', 'w-6 h-6') +
        '</div>' +
        '<h3 class="mt-4 text-lg font-bold tracking-tight text-slate-900">' + U.esc(o.title || 'Belum ada data') + '</h3>' +
        '<p class="mt-1.5 text-sm text-slate-500 max-w-[42ch] mx-auto leading-6">' + U.esc(o.description || '') + '</p>' +
        (o.actionHtml ? '<div class="mt-5 flex flex-col sm:flex-row justify-center gap-2.5">' + o.actionHtml + '</div>' : '') +
      '</div>'
    );
  }

  function upgradeModal(reason) {
    U.openModal(
      '<div class="p-6 sm:p-7">' +
        '<div class="flex items-start justify-between gap-4">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white grid place-items-center shadow-sm">' +
              U.icon('crown', 'w-5 h-5') +
            '</div>' +
            '<div>' +
              '<p class="text-[10px] font-bold tracking-[0.12em] text-brand-600">HARGAUMKM PREMIUM</p>' +
              '<h3 class="text-lg font-bold tracking-tight text-slate-900 leading-tight">Buka semua fitur</h3>' +
            '</div>' +
          '</div>' +
          '<button class="icon-btn !w-9 !h-9" data-action="close-modal" aria-label="Tutup">' + U.icon('x', 'w-4 h-4') + '</button>' +
        '</div>' +
        (reason ? '<p class="mt-4 text-sm text-slate-600 leading-6">' + U.esc(reason) + '</p>' : '') +
        '<div class="mt-4 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 flex items-end justify-between">' +
          '<div>' +
            '<p class="text-[11px] font-semibold text-brand-700">Paket Premium</p>' +
            '<p class="text-2xl font-extrabold tracking-tight text-slate-900 num mt-0.5">Rp 20.000 <span class="text-sm font-semibold text-slate-500">/bulan</span></p>' +
          '</div>' +
          '<span class="badge badge-blue">Hemat</span>' +
        '</div>' +
        '<ul class="mt-4 space-y-2.5 text-[13px] text-slate-600">' +
          [
            'Simulasi promo & kalkulator batas diskon',
            'Perbandingan keuntungan antar produk',
            'Ekspor laporan keuangan ke PDF',
            'Penyimpanan produk & riwayat tanpa batas'
          ].map((t) =>
            '<li class="flex items-start gap-2.5">' +
              '<span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center shrink-0 mt-0.5">' + U.icon('check', 'w-3 h-3') + '</span>' +
              '<span>' + t + '</span>' +
            '</li>'
          ).join('') +
        '</ul>' +
        '<button class="btn btn-primary btn-block mt-5" data-action="activate-premium">Aktifkan Premium (Demo)</button>' +
        '<button class="btn btn-ghost btn-block mt-1.5 !text-slate-500" data-action="close-modal">Nanti saja</button>' +
        '<p class="text-[11px] text-slate-400 text-center mt-3 leading-5">Mode demo: aktivasi instan tanpa pembayaran. Tidak ada tagihan nyata.</p>' +
      '</div>',
      { label: 'Upgrade Premium' }
    );
  }

  function paywall(opts) {
    const o = opts || {};
    const benefits = o.benefits || [
      'Simulasi promo & kalkulator batas diskon',
      'Perbandingan keuntungan antar produk',
      'Ekspor laporan keuangan ke PDF',
      'Penyimpanan produk & riwayat tanpa batas'
    ];

    return (
      '<div class="max-w-3xl mx-auto">' +
        '<div class="card overflow-hidden">' +
          '<div class="relative bg-ink p-6 sm:p-8 text-white overflow-hidden">' +
            '<div class="absolute inset-0 auth-grid opacity-60"></div>' +
            '<div class="absolute -right-10 -top-16 w-52 h-52 rounded-full bg-brand-500/20 blur-2xl"></div>' +
            '<div class="relative flex flex-col sm:flex-row sm:items-center gap-5">' +
              '<div class="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 grid place-items-center text-amber-300 shrink-0">' +
                U.icon('crown', 'w-6 h-6') +
              '</div>' +
              '<div>' +
                '<span class="badge badge-navy">FITUR PREMIUM</span>' +
                '<h2 class="mt-2.5 text-2xl font-extrabold tracking-tight leading-tight">' + U.esc(o.feature || 'Fitur Premium') + '</h2>' +
                '<p class="mt-1.5 text-sm text-blue-100/80 leading-6 max-w-[52ch]">' + U.esc(o.description || 'Tingkatkan cara Anda mengelola harga dan keuntungan.') + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="p-6 sm:p-8 grid sm:grid-cols-5 gap-6">' +
            '<div class="sm:col-span-3">' +
              '<p class="text-[11px] font-bold tracking-[0.1em] text-slate-400">YANG ANDA DAPATKAN</p>' +
              '<ul class="mt-3 space-y-2.5 text-[13px] text-slate-600">' +
                benefits.map((t) =>
                  '<li class="flex items-start gap-2.5">' +
                    '<span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center shrink-0 mt-0.5">' + U.icon('check', 'w-3 h-3') + '</span>' +
                    '<span>' + t + '</span>' +
                  '</li>'
                ).join('') +
              '</ul>' +
            '</div>' +
            '<div class="sm:col-span-2 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">' +
              '<p class="text-[11px] font-semibold text-brand-700">Premium</p>' +
              '<p class="text-[26px] font-extrabold tracking-tight text-slate-900 num mt-0.5">Rp 20.000</p>' +
              '<p class="text-[11px] text-slate-500">per bulan</p>' +
              '<button class="btn btn-primary btn-block mt-4" data-action="activate-premium">Upgrade Sekarang</button>' +
              '<p class="text-[10px] text-slate-400 mt-2.5 leading-4">Mode demo: aktivasi instan, tanpa pembayaran.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<p class="text-center text-[12px] text-slate-400 mt-4">Anda bisa kembali ke paket gratis kapan saja melalui Pengaturan.</p>' +
      '</div>'
    );
  }

  function notificationsModal() {
    U.openModal(
      '<div class="p-6">' +
        '<div class="flex items-center justify-between mb-4">' +
          '<h3 class="text-lg font-bold tracking-tight">Notifikasi</h3>' +
          '<button class="icon-btn !w-9 !h-9" data-action="close-modal" aria-label="Tutup">' + U.icon('x', 'w-4 h-4') + '</button>' +
        '</div>' +
        '<div class="space-y-2">' +
          [
            { icon: 'lightbulb', title: 'Perbarui harga saat biaya naik', text: 'Harga modal yang berubah bisa menekan margin. Cek ulang produk Anda bulan ini.', tone: 'bg-amber-50 text-amber-600' },
            { icon: 'sparkles', title: 'Coba simulasi promo', text: 'Ketahui batas diskon agar promo tetap menguntungkan.', tone: 'bg-brand-50 text-brand-600' },
            { icon: 'file-text', title: 'Laporan bulanan', text: 'Unduh laporan PDF dari menu Laporan untuk arsip usaha Anda.', tone: 'bg-emerald-50 text-emerald-600' }
          ].map((n) =>
            '<div class="flex gap-3 rounded-xl border border-slate-100 p-3">' +
              '<div class="w-9 h-9 rounded-lg ' + n.tone + ' grid place-items-center shrink-0">' + U.icon(n.icon, 'w-4 h-4') + '</div>' +
              '<div><p class="text-[13px] font-semibold text-slate-800">' + n.title + '</p>' +
              '<p class="text-[12px] text-slate-500 leading-5 mt-0.5">' + n.text + '</p></div>' +
            '</div>'
          ).join('') +
        '</div>' +
        '<button class="btn btn-secondary btn-block mt-4" data-action="close-modal">Tutup</button>' +
      '</div>',
      { label: 'Notifikasi' }
    );
  }

  return {
    LIMITS, navGroups, shell, empty, upgradeModal, paywall, notificationsModal, planCard
  };
})();
