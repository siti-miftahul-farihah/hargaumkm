/* HargaUMKM — settings & account */
window.Views = window.Views || {};

(function () {
  const BUSINESS_TYPES = ['Fashion', 'Makanan & Minuman', 'Kriya', 'Kecantikan', 'Elektronik', 'Rumah Tangga', 'Jasa', 'Lainnya'];

  const tabs = [
    ['profil', 'Profil', 'user'],
    ['keamanan', 'Keamanan', 'shield'],
    ['notifikasi', 'Notifikasi', 'bell'],
    ['keanggotaan', 'Keanggotaan', 'crown']
  ];

  const passToggle = (id) =>
    '<button type="button" class="absolute right-1.5 top-1/2 -translate-y-1/2 icon-btn !w-8 !h-8 !text-slate-400" ' +
      'data-action="toggle-pass" data-target="' + id + '" aria-label="Tampilkan kata sandi">' + U.icon('eye', 'w-4 h-4') + '</button>';

  function toggleRow(setting, title, desc, checked) {
    return (
      '<label class="flex items-start justify-between gap-5 py-4 cursor-pointer select-none">' +
        '<div class="min-w-0">' +
          '<p class="text-[13px] font-semibold text-slate-800">' + title + '</p>' +
          '<p class="text-[11.5px] text-slate-500 leading-5 mt-0.5">' + desc + '</p>' +
        '</div>' +
        '<span class="relative inline-flex shrink-0 mt-0.5">' +
          '<input type="checkbox" class="sr-only peer" data-setting="' + setting + '"' + (checked ? ' checked' : '') + '>' +
          '<span class="w-10 h-6 rounded-full bg-slate-200 peer-checked:bg-brand-600 transition-colors"></span>' +
          '<span class="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"></span>' +
        '</span>' +
      '</label>'
    );
  }

  function profileTab(data) {
    const u = data.user;
    return (
      '<section class="card p-5 sm:p-6">' +
        '<div class="flex items-center gap-4 pb-5 border-b border-slate-100">' +
          '<div class="w-16 h-16 rounded-2xl bg-brand-600 text-white grid place-items-center text-lg font-extrabold shrink-0">' + U.esc(U.initials(u.name)) + '</div>' +
          '<div class="min-w-0">' +
            '<p class="text-[15px] font-bold text-slate-900 truncate">' + U.esc(u.name || 'Pengguna') + '</p>' +
            '<p class="text-[11.5px] text-slate-400 truncate">' + U.esc(u.email) + '</p>' +
            '<span class="badge ' + (u.premium ? 'badge-blue' : 'badge-slate') + ' mt-1.5">' + (u.premium ? 'Premium' : 'Paket Gratis') + '</span>' +
          '</div>' +
        '</div>' +
        '<form data-form="profile" novalidate class="pt-5">' +
          '<div class="hidden rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-[12.5px] text-red-700 mb-4" data-form-error></div>' +
          '<div class="grid sm:grid-cols-2 gap-4">' +
            '<div class="sm:col-span-2">' +
              '<label class="label" for="set-name">Nama lengkap</label>' +
              '<input id="set-name" name="name" class="input" type="text" value="' + U.esc(u.name) + '" required>' +
            '</div>' +
            '<div class="sm:col-span-2">' +
              '<label class="label" for="set-email">Email</label>' +
              '<input id="set-email" class="input" type="email" value="' + U.esc(u.email) + '" disabled>' +
              '<p class="hint">Email digunakan untuk masuk dan tidak dapat diubah pada versi demo.</p>' +
            '</div>' +
            '<div>' +
              '<label class="label" for="set-phone">Nomor HP</label>' +
              '<input id="set-phone" name="phone" class="input" type="tel" value="' + U.esc(u.phone) + '" placeholder="08xxxxxxxxxx">' +
            '</div>' +
            '<div>' +
              '<label class="label" for="set-city">Kota</label>' +
              '<input id="set-city" name="city" class="input" type="text" value="' + U.esc(u.city) + '" placeholder="Contoh: Bandung">' +
            '</div>' +
            '<div>' +
              '<label class="label" for="set-business">Nama usaha <span class="optional">(opsional)</span></label>' +
              '<input id="set-business" name="businessName" class="input" type="text" value="' + U.esc(u.businessName) + '" placeholder="Contoh: Dapur Rina">' +
            '</div>' +
            '<div>' +
              '<label class="label" for="set-type">Jenis usaha <span class="optional">(opsional)</span></label>' +
              '<select id="set-type" name="businessType" class="input">' +
                '<option value="">Pilih jenis usaha</option>' +
                BUSINESS_TYPES.map((t) => '<option value="' + t + '"' + (u.businessType === t ? ' selected' : '') + '>' + t + '</option>').join('') +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="mt-6 flex justify-end">' +
            '<button type="submit" class="btn btn-primary">' + U.icon('save', 'w-4 h-4') + 'Simpan Perubahan</button>' +
          '</div>' +
        '</form>' +
      '</section>' +

      '<section class="card p-5 sm:p-6 border-red-100">' +
        '<h2 class="text-[13.5px] font-bold text-red-700">Zona berbahaya</h2>' +
        '<p class="text-[11.5px] text-slate-500 leading-5 mt-1">Menghapus seluruh produk dan riwayat pada akun ini. Tindakan ini tidak bisa dibatalkan.</p>' +
        '<div class="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/50 p-3.5">' +
          '<p class="text-[11.5px] text-red-800/80 leading-5">Cadangkan data penting Anda sebelum melanjutkan.</p>' +
          '<button data-action="reset-data" class="btn btn-danger !py-1.5 !text-[12px] shrink-0">' + U.icon('trash-2', 'w-3.5 h-3.5') + 'Hapus semua data</button>' +
        '</div>' +
      '</section>'
    );
  }

  function securityTab(data) {
    const u = data.user;
    return (
      '<section class="card p-5 sm:p-6">' +
        '<h2 class="text-[14px] font-bold text-slate-900">Ubah kata sandi</h2>' +
        '<p class="text-[11.5px] text-slate-500 mt-0.5">Gunakan kata sandi yang kuat dan tidak dipakai di layanan lain.</p>' +
        '<form data-form="password" novalidate class="mt-5">' +
          '<div class="hidden rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-[12.5px] text-red-700 mb-4" data-form-error></div>' +
          '<div class="space-y-4 max-w-md">' +
            '<div>' +
              '<label class="label" for="pass-current">Kata sandi saat ini</label>' +
              '<div class="relative"><input id="pass-current" name="current" type="password" class="input pr-11" autocomplete="current-password" required>' + passToggle('pass-current') + '</div>' +
            '</div>' +
            '<div>' +
              '<label class="label" for="pass-new">Kata sandi baru</label>' +
              '<div class="relative"><input id="pass-new" name="next" type="password" class="input pr-11" autocomplete="new-password" minlength="6" placeholder="Minimal 6 karakter" required>' + passToggle('pass-new') + '</div>' +
            '</div>' +
            '<div>' +
              '<label class="label" for="pass-confirm">Ulangi kata sandi baru</label>' +
              '<input id="pass-confirm" name="confirm" type="password" class="input" autocomplete="new-password" required>' +
            '</div>' +
          '</div>' +
          '<div class="mt-6"><button type="submit" class="btn btn-primary">' + U.icon('key-round', 'w-4 h-4') + 'Perbarui Kata Sandi</button></div>' +
        '</form>' +
      '</section>' +

      '<section class="card p-5 sm:p-6">' +
        '<h2 class="text-[14px] font-bold text-slate-900">Verifikasi akun</h2>' +
        '<p class="text-[11.5px] text-slate-500 mt-0.5">Pastikan kontak Anda aktif untuk pemulihan akun.</p>' +
        '<div class="mt-4 divide-y divide-slate-100">' +
          '<div class="flex items-center justify-between gap-4 py-3.5">' +
            '<div class="flex items-center gap-3 min-w-0">' +
              '<span class="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 grid place-items-center shrink-0">' + U.icon('mail', 'w-4 h-4') + '</span>' +
              '<div class="min-w-0"><p class="text-[12.5px] font-semibold text-slate-800 truncate">' + U.esc(u.email) + '</p>' +
                '<p class="text-[10.5px] text-slate-400">Email</p></div>' +
            '</div>' +
            '<span class="badge badge-green">' + U.icon('circle-check', 'w-3 h-3') + 'Terverifikasi</span>' +
          '</div>' +
          '<div class="flex items-center justify-between gap-4 py-3.5">' +
            '<div class="flex items-center gap-3 min-w-0">' +
              '<span class="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 grid place-items-center shrink-0">' + U.icon('phone', 'w-4 h-4') + '</span>' +
              '<div class="min-w-0"><p class="text-[12.5px] font-semibold text-slate-800 truncate">' + U.esc(u.phone || 'Belum diisi') + '</p>' +
                '<p class="text-[10.5px] text-slate-400">Nomor HP</p></div>' +
            '</div>' +
            (u.phoneVerified
              ? '<span class="badge badge-green">' + U.icon('circle-check', 'w-3 h-3') + 'Terverifikasi</span>'
              : '<button data-action="verify-phone" class="btn btn-secondary !py-1.5 !text-[11.5px]">Verifikasi</button>') +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="card p-5 sm:p-6">' +
        '<h2 class="text-[14px] font-bold text-slate-900">Sesi aktif</h2>' +
        '<div class="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5">' +
          '<div class="flex items-center gap-3">' +
            '<span class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">' + U.icon('monitor', 'w-4 h-4') + '</span>' +
            '<div><p class="text-[12.5px] font-semibold text-slate-800">Perangkat ini</p>' +
              '<p class="text-[10.5px] text-slate-400">Sesi browser aktif · ' + U.dateShort(new Date()) + '</p></div>' +
          '</div>' +
          '<button data-action="logout" class="btn btn-secondary !py-1.5 !text-[12px]">Keluar</button>' +
        '</div>' +
      '</section>'
    );
  }

  function notificationTab(data) {
    const s = data.settings;
    return (
      '<section class="card p-5 sm:p-6">' +
        '<h2 class="text-[14px] font-bold text-slate-900">Preferensi notifikasi</h2>' +
        '<p class="text-[11.5px] text-slate-500 mt-0.5">Pilih pengingat yang ingin Anda terima.</p>' +
        '<div class="mt-3 divide-y divide-slate-100">' +
          toggleRow('notifEmail', 'Pengingat email', 'Ringkasan mingguan dan pengingat memperbarui harga.', s.notifEmail) +
          toggleRow('notifPromo', 'Tips promo & margin', 'Saran singkat saat margin produk turun di bawah batas aman.', s.notifPromo) +
          toggleRow('notifMonthly', 'Laporan bulanan', 'Pengingat mengunduh laporan keuangan setiap awal bulan.', s.notifMonthly) +
        '</div>' +
      '</section>' +

      '<section class="card p-5 sm:p-6">' +
        '<h2 class="text-[14px] font-bold text-slate-900">Tampilan & format</h2>' +
        '<p class="text-[11.5px] text-slate-500 mt-0.5">Pengaturan regional untuk seluruh tampilan aplikasi.</p>' +
        '<div class="mt-4 space-y-3 text-[12.5px]">' +
          [
            ['Bahasa', 'Indonesia', 'languages'],
            ['Mata uang', 'Rupiah (IDR)', 'wallet'],
            ['Zona waktu', 'WIB (GMT+7)', 'clock'],
            ['Format angka', '1.234.567', 'hash']
          ].map(([label, value, ic]) =>
            '<div class="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-3">' +
              '<div class="flex items-center gap-2.5"><span class="text-slate-400">' + U.icon(ic, 'w-4 h-4') + '</span>' +
                '<span class="text-slate-500">' + label + '</span></div>' +
              '<span class="font-semibold text-slate-700">' + value + '</span>' +
            '</div>'
          ).join('') +
        '</div>' +
        '<p class="mt-3 text-[10.5px] text-slate-400">Pilihan bahasa dan mata uang tambahan akan tersedia pada versi berikutnya.</p>' +
      '</section>'
    );
  }

  function membershipTab(data) {
    const u = data.user;
    const premium = u.premium;
    const products = data.products.length;
    const history = data.history.length;
    const productPct = premium ? 100 : Math.min(100, Math.round((products / UI.LIMITS.products) * 100));
    const historyPct = premium ? 100 : Math.min(100, Math.round((history / UI.LIMITS.history) * 100));

    const features = [
      ['Kalkulator harga jual', true],
      ['Simpan hingga 5 produk', true],
      ['Riwayat 10 simulasi', true],
      ['Simulasi promo & batas diskon', premium],
      ['Perbandingan keuntungan', premium],
      ['Ekspor laporan PDF', premium],
      ['Produk & riwayat tanpa batas', premium]
    ];

    const plan = premium
      ? '<div class="relative rounded-2xl bg-ink p-6 text-white overflow-hidden">' +
          '<div class="absolute inset-0 auth-grid opacity-40"></div>' +
          '<div class="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-brand-500/20 blur-3xl"></div>' +
          '<div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">' +
            '<div>' +
              '<div class="flex items-center gap-2">' + U.icon('crown', 'w-4 h-4 text-amber-300') +
                '<span class="text-[10px] font-bold tracking-[0.14em] text-blue-200">PAKET PREMIUM</span></div>' +
              '<p class="mt-2 text-2xl font-extrabold tracking-tight">Rp 20.000 <span class="text-[12px] font-medium text-blue-200/60">/bulan</span></p>' +
              '<p class="text-[11.5px] text-blue-100/60 mt-1">Aktif sejak ' + (u.premiumSince ? U.dateShort(u.premiumSince) : 'hari ini') + '</p>' +
            '</div>' +
            '<span class="badge badge-navy self-start sm:self-center">Semua fitur terbuka</span>' +
          '</div>' +
        '</div>'
      : '<div class="rounded-2xl border border-slate-200 bg-white p-6">' +
          '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">' +
            '<div>' +
              '<div class="flex items-center gap-2 text-slate-400">' + U.icon('sparkles', 'w-4 h-4') +
                '<span class="text-[10px] font-bold tracking-[0.14em]">PAKET GRATIS</span></div>' +
              '<p class="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Rp 0 <span class="text-[12px] font-medium text-slate-400">/bulan</span></p>' +
              '<p class="text-[11.5px] text-slate-400 mt-1">Fitur dasar untuk mulai menghitung.</p>' +
            '</div>' +
            '<button data-action="open-upgrade" class="btn btn-primary self-start sm:self-center">Upgrade Premium</button>' +
          '</div>' +
        '</div>';

    return (
      '<div class="space-y-5">' +
        plan +
        '<section class="card p-5 sm:p-6">' +
          '<h2 class="text-[14px] font-bold text-slate-900">Penggunaan paket</h2>' +
          '<div class="mt-4 grid sm:grid-cols-2 gap-5">' +
            '<div>' +
              '<div class="flex items-center justify-between text-[11.5px] mb-1.5">' +
                '<span class="text-slate-500">Produk tersimpan</span>' +
                '<span class="font-semibold text-slate-700">' + (premium ? 'Tanpa batas' : products + '/' + UI.LIMITS.products) + '</span>' +
              '</div>' +
              '<div class="h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ' + (productPct >= 100 ? 'bg-amber-500' : 'bg-brand-600') + '" style="width:' + productPct + '%"></div></div>' +
            '</div>' +
            '<div>' +
              '<div class="flex items-center justify-between text-[11.5px] mb-1.5">' +
                '<span class="text-slate-500">Riwayat simulasi</span>' +
                '<span class="font-semibold text-slate-700">' + (premium ? 'Tanpa batas' : history + '/' + UI.LIMITS.history) + '</span>' +
              '</div>' +
              '<div class="h-2 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ' + (historyPct >= 100 ? 'bg-amber-500' : 'bg-brand-600') + '" style="width:' + historyPct + '%"></div></div>' +
            '</div>' +
          '</div>' +
        '</section>' +

        '<section class="card p-5 sm:p-6">' +
          '<h2 class="text-[14px] font-bold text-slate-900">Rincian fitur</h2>' +
          '<p class="text-[11.5px] text-slate-500 mt-0.5">Perbandingan akses paket gratis dan premium.</p>' +
          '<div class="mt-4 divide-y divide-slate-100">' +
            features.map(([label, ok]) =>
              '<div class="flex items-center justify-between gap-4 py-2.5">' +
                '<span class="text-[12.5px] text-slate-600">' + label + '</span>' +
                (ok
                  ? '<span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">' + U.icon('check', 'w-3 h-3') + '</span>'
                  : '<span class="w-5 h-5 rounded-full bg-slate-100 text-slate-400 grid place-items-center shrink-0">' + U.icon('lock', 'w-3 h-3') + '</span>') +
              '</div>'
            ).join('') +
          '</div>' +
        '</section>' +

        '<section class="card p-5 sm:p-6">' +
          '<h2 class="text-[14px] font-bold text-slate-900">Langganan</h2>' +
          '<p class="text-[11.5px] text-slate-500 mt-0.5 leading-5">Versi demo ini tidak memproses pembayaran. Aktivasi dan pembatalan berlaku langsung di perangkat Anda.</p>' +
          '<div class="mt-4 flex flex-col sm:flex-row gap-2.5">' +
            (premium
              ? '<button data-action="downgrade" class="btn btn-secondary">Kembali ke paket gratis</button>'
              : '<button data-action="open-upgrade" class="btn btn-primary">Aktifkan Premium (Demo)</button>') +
            '<a href="#/app/bantuan" class="btn btn-ghost">Butuh bantuan?</a>' +
          '</div>' +
        '</section>' +
      '</div>'
    );
  }

  Views.settings = function () {
    const data = App.data;
    const tab = App.ui.settingsTab || 'profil';
    const content =
      tab === 'keamanan' ? securityTab(data) :
      tab === 'notifikasi' ? notificationTab(data) :
      tab === 'keanggotaan' ? membershipTab(data) :
      profileTab(data);

    return (
      '<div class="space-y-5">' +
        '<div>' +
          '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">Pengaturan</h1>' +
          '<p class="mt-1 text-[12.5px] text-slate-500">Kelola profil, keamanan, notifikasi, dan paket akun Anda.</p>' +
        '</div>' +

        '<div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">' +
          tabs.map(([key, label, ic]) =>
            '<button class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold whitespace-nowrap transition ' +
              (tab === key ? 'bg-ink text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50') + '" ' +
              'data-action="settings-tab" data-tab="' + key + '">' +
              U.icon(ic, 'w-4 h-4 ' + (tab === key ? 'text-blue-200' : 'text-slate-400')) + label +
            '</button>'
          ).join('') +
        '</div>' +

        '<div class="max-w-3xl space-y-5">' + content + '</div>' +
      '</div>'
    );
  };

  Views.settingsTab = function (tab) {
    const allowed = ['profil', 'keamanan', 'notifikasi', 'keanggotaan'];
    App.ui.settingsTab = allowed.includes(tab) ? tab : 'profil';
    location.hash = '#/app/pengaturan?tab=' + App.ui.settingsTab;
  };

  Views.saveProfile = function (form) {
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    U.formError(form, '');
    if (!name) return U.formError(form, 'Nama lengkap wajib diisi.');
    if (phone && phone.replace(/\D/g, '').length < 9) return U.formError(form, 'Nomor HP minimal 9 digit.');

    const user = App.data.user;
    user.name = name;
    user.phone = phone;
    user.city = String(fd.get('city') || '').trim();
    user.businessName = String(fd.get('businessName') || '').trim();
    user.businessType = String(fd.get('businessType') || '');

    Store.updateUserRecord(user.email, { name, phone });
    App.save();
    U.toast('Profil berhasil diperbarui.');
    App.refresh();
  };

  Views.changePassword = function (form) {
    const fd = new FormData(form);
    const current = String(fd.get('current') || '');
    const next = String(fd.get('next') || '');
    const confirm = String(fd.get('confirm') || '');
    U.formError(form, '');

    if (!current) return U.formError(form, 'Masukkan kata sandi saat ini.');
    if (!Store.verifyPassword(App.data.user.email, current)) return U.formError(form, 'Kata sandi saat ini tidak cocok.');
    if (next.length < 6) return U.formError(form, 'Kata sandi baru minimal 6 karakter.');
    if (next !== confirm) return U.formError(form, 'Ulangi kata sandi baru dengan benar.');
    if (next === current) return U.formError(form, 'Kata sandi baru harus berbeda dari yang lama.');

    Store.setPassword(App.data.user.email, next);
    form.reset();
    U.toast('Kata sandi berhasil diperbarui.');
  };

  Views.verifyPhone = function () {
    if (!App.data.user.phone) {
      U.toast('Isi nomor HP terlebih dahulu pada tab Profil.', 'error');
      return;
    }
    App.data.user.phoneVerified = true;
    App.save();
    U.toast('Nomor HP berhasil diverifikasi (demo).');
    App.refresh();
  };

  Views.toggleSetting = function (key, checked) {
    const allowed = ['notifEmail', 'notifPromo', 'notifMonthly'];
    if (!allowed.includes(key)) return;
    App.data.settings[key] = !!checked;
    App.save();
  };

  Views.downgrade = function () {
    U.confirm({
      title: 'Kembali ke paket gratis?',
      message: 'Anda akan kehilangan akses ke simulasi promo, perbandingan, dan ekspor PDF. Produk serta riwayat yang sudah ada tetap tersimpan, tetapi produk baru dibatasi 5.',
      confirmText: 'Ya, downgrade',
      onConfirm: function () {
        App.data.user.premium = false;
        App.data.user.premiumSince = null;
        App.save();
        App.refresh();
        U.toast('Akun kini menggunakan paket gratis.', 'info');
      }
    });
  };

  Views.resetData = function () {
    U.confirm({
      title: 'Hapus semua data usaha?',
      message: 'Seluruh produk, riwayat simulasi, dan preferensi akan dihapus. Akun dan profil tetap ada. Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Hapus semua data',
      onConfirm: function () {
        App.data.products = [];
        App.data.history = [];
        App.ui.calc = null;
        App.ui.promo = null;
        App.save();
        App.refresh();
        U.toast('Semua data produk dan riwayat telah dihapus.');
      }
    });
  };
})();
