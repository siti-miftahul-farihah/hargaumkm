/* HargaUMKM — authentication views */
window.Views = window.Views || {};

(function () {
  const logo = () =>
    '<a href="#/" class="flex items-center gap-2.5">' +
      '<span class="logo-mark grid place-items-center w-9 h-9 rounded-xl text-white shadow-sm">' +
        U.icon('trending-up', 'w-[18px] h-[18px]') +
      '</span>' +
      '<span class="font-extrabold tracking-tight text-[17px] text-slate-900">Harga<span class="text-brand-600">UMKM</span></span>' +
    '</a>';

  const brandPanel = () =>
    '<aside class="hidden lg:flex lg:w-[45%] xl:w-[43%] auth-panel relative overflow-hidden p-10 xl:p-14 flex-col justify-between text-white">' +
      '<div class="absolute inset-0 auth-grid"></div>' +
      '<div class="absolute -right-24 top-10 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl"></div>' +
      '<div class="relative">' +
        '<a href="#/" class="flex items-center gap-2.5">' +
          '<span class="grid place-items-center w-9 h-9 rounded-xl bg-white/10 border border-white/15 text-white">' + U.icon('trending-up', 'w-[18px] h-[18px]') + '</span>' +
          '<span class="font-extrabold tracking-tight text-[17px]">Harga<span class="text-brand-300">UMKM</span></span>' +
        '</a>' +
      '</div>' +
      '<div class="relative max-w-[440px]">' +
        '<p class="text-[10.5px] font-bold tracking-[0.16em] text-teal-300">UNTUK UMKM YANG HITUNG DULU</p>' +
        '<h1 class="mt-4 text-[2.6rem] xl:text-[3rem] font-extrabold tracking-[-0.03em] leading-[1.05] text-balance">Harga benar,<br><span class="text-gradient-light">usaha tumbuh.</span></h1>' +
        '<p class="mt-4 text-[14px] text-blue-100/75 leading-7 max-w-[40ch]">Ketahui harga jual yang menutup semua biaya dan tetap memberi keuntungan. Tanpa spreadsheet, tanpa menebak.</p>' +
        '<ul class="mt-7 space-y-3 text-[13px] text-blue-50/90">' +
          [
            'Hitung modal, komisi, dan ongkir sekaligus',
            'Simpan produk dan riwayat simulasi',
            'Pantau margin sebelum memberi promo'
          ].map((t) =>
            '<li class="flex items-start gap-2.5">' +
              '<span class="w-5 h-5 rounded-full bg-emerald-400/15 text-emerald-300 grid place-items-center shrink-0 mt-0.5">' + U.icon('check', 'w-3 h-3') + '</span>' +
              '<span>' + t + '</span>' +
            '</li>'
          ).join('') +
        '</ul>' +
      '</div>' +
      '<div class="relative">' +
        '<div class="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur p-4 max-w-[330px]">' +
          '<div class="flex items-center justify-between">' +
            '<p class="text-[10px] font-bold tracking-[0.1em] text-blue-200/70">CONTOH PERHITUNGAN</p>' +
            '<span class="badge badge-navy">Ilustrasi</span>' +
          '</div>' +
          '<div class="mt-3 space-y-2 text-[11.5px]">' +
            '<div class="flex justify-between text-blue-100/60"><span>Modal + operasional</span><span class="text-blue-50 num">Rp 50.000</span></div>' +
            '<div class="flex justify-between text-blue-100/60"><span>Target margin</span><span class="text-blue-50 num">30%</span></div>' +
            '<div class="flex justify-between pt-2 border-t border-white/10"><span class="text-blue-100/60">Harga jual</span><span class="font-bold text-white num">Rp 71.500</span></div>' +
            '<div class="flex justify-between"><span class="text-blue-100/60">Keuntungan</span><span class="font-semibold text-emerald-300 num">Rp 21.500</span></div>' +
          '</div>' +
        '</div>' +
        '<p class="mt-4 text-[10.5px] text-blue-200/40">HargaUMKM · akun dan data tersinkron aman di cloud</p>' +
      '</div>' +
    '</aside>';

  const passwordToggle = (id) =>
    '<button type="button" class="absolute right-1.5 top-1/2 -translate-y-1/2 icon-btn !w-8 !h-8 !text-slate-400" ' +
      'data-action="toggle-pass" data-target="' + id + '" aria-label="Tampilkan kata sandi">' + U.icon('eye', 'w-4 h-4') + '</button>';

  function layout(formHtml) {
    return (
      '<div class="min-h-[100dvh] flex bg-white">' +
        brandPanel() +
        '<div class="flex-1 flex flex-col min-w-0">' +
          '<div class="h-16 px-5 sm:px-8 flex items-center justify-between border-b border-slate-100 lg:border-0">' +
            '<div class="lg:hidden">' + logo() + '</div>' +
            '<a href="#/" class="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-slate-900">' +
              U.icon('arrow-left', 'w-3.5 h-3.5') + 'Beranda' +
            '</a>' +
          '</div>' +
          '<main class="flex-1 flex items-center justify-center px-5 sm:px-8 py-8">' +
            '<div class="w-full max-w-[420px] view-enter">' + formHtml + '</div>' +
          '</main>' +
          '<div class="px-5 sm:px-8 py-5 text-center text-[11px] text-slate-500">© 2026 HargaUMKM · Versi demo</div>' +
        '</div>' +
      '</div>'
    );
  }

  function setBusy(button, busy) {
    if (!button) return;
    button.disabled = !!busy;
    button.classList.toggle('opacity-60', !!busy);
  }

  function enterApp(data) {
    App.setSession(data);
    if (location.hash === '#/app/beranda') App.render(true);
    else location.hash = '#/app/beranda';
  }

  Views.login = function () {
    return layout(
      '<div class="mb-7">' +
        '<h1 class="text-[26px] font-extrabold tracking-tight text-slate-950">Masuk ke akun Anda</h1>' +
        '<p class="mt-1.5 text-[13px] text-slate-500 leading-6">Lanjutkan mengelola harga dan keuntungan usaha Anda.</p>' +
      '</div>' +
      '<form data-form="login" novalidate class="space-y-4">' +
        '<div class="hidden rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-[12.5px] text-red-700 leading-5" data-form-error></div>' +
        '<div>' +
          '<label class="label" for="login-id">Email</label>' +
          '<input id="login-id" name="identifier" type="email" class="input" placeholder="nama@email.com" autocomplete="username" required>' +
        '</div>' +
        '<div>' +
          '<div class="flex items-center justify-between mb-1.5">' +
            '<label class="label !mb-0" for="login-password">Kata sandi</label>' +
            '<button type="button" data-action="forgot" class="text-[11.5px] font-semibold text-brand-600 hover:text-brand-700">Lupa kata sandi?</button>' +
          '</div>' +
          '<div class="relative">' +
            '<input id="login-password" name="password" type="password" class="input pr-11" placeholder="Masukkan kata sandi" autocomplete="current-password" required>' +
            passwordToggle('login-password') +
          '</div>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary btn-block !mt-6 !py-2.5">Masuk ' + U.icon('arrow-right', 'w-4 h-4') + '</button>' +
      '</form>' +
      '<div class="relative my-6">' +
        '<div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>' +
        '<div class="relative flex justify-center"><span class="bg-white px-3 text-[11px] text-slate-500">atau coba langsung</span></div>' +
      '</div>' +
      '<button type="button" data-action="demo-login" class="btn btn-secondary btn-block !py-2.5">' +
        U.icon('play-circle', 'w-4 h-4 text-brand-600') + 'Masuk dengan akun demo' +
      '</button>' +
      '<p class="mt-2.5 text-center text-[11px] text-slate-500">Demo: demo@hargaumkm.id · sandi demo123</p>' +
      '<p class="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-[11px] text-slate-500 leading-5">Punya data dari versi lama? Daftar ulang dengan email yang sama; produk dan riwayat lokal akan diimpor otomatis.</p>' +
      '<p class="mt-6 text-center text-[12.5px] text-slate-500">Belum punya akun? ' +
        '<a href="#/daftar" class="font-semibold text-brand-600 hover:text-brand-700">Daftar gratis</a>' +
      '</p>'
    );
  };

  Views.register = function () {
    return layout(
      '<div class="mb-7">' +
        '<h1 class="text-[26px] font-extrabold tracking-tight text-slate-950">Buat akun gratis</h1>' +
        '<p class="mt-1.5 text-[13px] text-slate-500 leading-6">Mulai hitung harga jual yang menguntungkan dalam beberapa menit.</p>' +
      '</div>' +
      '<form data-form="register" novalidate class="space-y-3.5">' +
        '<div class="hidden rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-[12.5px] text-red-700 leading-5" data-form-error></div>' +
        '<div>' +
          '<label class="label" for="reg-name">Nama lengkap</label>' +
          '<input id="reg-name" name="name" type="text" class="input" placeholder="Contoh: Rina Kusuma" autocomplete="name" required>' +
        '</div>' +
        '<div>' +
          '<label class="label" for="reg-email">Email</label>' +
          '<input id="reg-email" name="email" type="email" class="input" placeholder="nama@email.com" autocomplete="email" required>' +
        '</div>' +
        '<div>' +
          '<label class="label" for="reg-phone">Nomor HP</label>' +
          '<input id="reg-phone" name="phone" type="tel" class="input" placeholder="08xxxxxxxxxx" autocomplete="tel" inputmode="tel" required>' +
        '</div>' +
        '<div>' +
          '<label class="label" for="reg-password">Kata sandi</label>' +
          '<div class="relative">' +
            '<input id="reg-password" name="password" type="password" class="input pr-11" placeholder="Minimal 6 karakter" autocomplete="new-password" minlength="6" required>' +
            passwordToggle('reg-password') +
          '</div>' +
        '</div>' +
        '<label class="flex items-start gap-2.5 text-[12px] text-slate-500 leading-5 pt-1 select-none">' +
          '<input type="checkbox" name="terms" class="checkbox mt-0.5" required>' +
          '<span>Saya setuju dengan <span class="font-semibold text-slate-700">Syarat & Ketentuan</span> serta <span class="font-semibold text-slate-700">Kebijakan Privasi</span> HargaUMKM.</span>' +
        '</label>' +
        '<button type="submit" class="btn btn-primary btn-block !mt-6 !py-2.5">Daftar Sekarang ' + U.icon('arrow-right', 'w-4 h-4') + '</button>' +
      '</form>' +
      '<p class="mt-6 text-center text-[12.5px] text-slate-500">Sudah punya akun? ' +
        '<a href="#/masuk" class="font-semibold text-brand-600 hover:text-brand-700">Masuk di sini</a>' +
      '</p>'
    );
  };

  Views.forgot = function () {
    const input = document.getElementById('login-id');
    const prefill = input ? input.value : '';
    U.openModal(
      '<form data-form="forgot" class="p-6 sm:p-7" novalidate>' +
        '<div class="flex items-start justify-between gap-4">' +
          '<div class="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">' + U.icon('key-round', 'w-5 h-5') + '</div>' +
          '<button type="button" class="icon-btn !w-9 !h-9" data-action="close-modal" aria-label="Tutup">' + U.icon('x', 'w-4 h-4') + '</button>' +
        '</div>' +
        '<h3 class="mt-4 text-lg font-bold tracking-tight">Lupa kata sandi?</h3>' +
        '<p class="mt-1.5 text-[13px] text-slate-500 leading-6">Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.</p>' +
        '<div class="hidden mt-4 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-[12.5px] text-red-700" data-form-error></div>' +
        '<div class="mt-4">' +
          '<label class="label" for="forgot-email">Email</label>' +
          '<input id="forgot-email" name="email" type="email" class="input" value="' + U.esc(prefill) + '" placeholder="nama@email.com" required>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary btn-block mt-5">Kirim tautan reset</button>' +
        '<p class="mt-3 text-[10.5px] text-slate-400 text-center leading-4">Periksa kotak masuk dan folder spam Anda.</p>' +
      '</form>',
      { label: 'Lupa kata sandi' }
    );
  };

  Views.resetPasswordModal = function () {
    U.openModal(
      '<form data-form="reset-password" class="p-6 sm:p-7" novalidate>' +
        '<div class="flex items-start justify-between gap-4">' +
          '<div class="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">' + U.icon('shield-check', 'w-5 h-5') + '</div>' +
          '<button type="button" class="icon-btn !w-9 !h-9" data-action="close-modal" aria-label="Tutup">' + U.icon('x', 'w-4 h-4') + '</button>' +
        '</div>' +
        '<h3 class="mt-4 text-lg font-bold tracking-tight">Buat kata sandi baru</h3>' +
        '<p class="mt-1.5 text-[13px] text-slate-500 leading-6">Masukkan kata sandi baru untuk akun HargaUMKM Anda.</p>' +
        '<div class="hidden mt-4 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-[12.5px] text-red-700" data-form-error></div>' +
        '<div class="mt-4 space-y-4">' +
          '<div>' +
            '<label class="label" for="reset-password">Kata sandi baru</label>' +
            '<div class="relative">' +
              '<input id="reset-password" name="password" type="password" class="input pr-11" autocomplete="new-password" minlength="6" placeholder="Minimal 6 karakter" required>' +
              passwordToggle('reset-password') +
            '</div>' +
          '</div>' +
          '<div>' +
            '<label class="label" for="reset-confirm">Ulangi kata sandi baru</label>' +
            '<input id="reset-confirm" name="confirm" type="password" class="input" autocomplete="new-password" required>' +
          '</div>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary btn-block mt-5">Simpan kata sandi</button>' +
      '</form>',
      { label: 'Buat kata sandi baru' }
    );
  };

  Views.loginSubmit = async function (form) {
    const fd = new FormData(form);
    const email = String(fd.get('identifier') || '').trim();
    const password = String(fd.get('password') || '');

    U.formError(form, '');
    if (!email) return U.formError(form, 'Masukkan email Anda.');
    if (!password) return U.formError(form, 'Masukkan kata sandi.');

    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true);

    try {
      const res = await Store.login(email, password);
      if (!res.ok) return U.formError(form, res.error);

      enterApp(res.data);
      const name = (res.data.user.name || 'Pengguna').split(' ')[0];
      U.toast('Selamat datang kembali, ' + name + '.');
    } catch (err) {
      U.formError(form, Store.friendlyError(err));
    } finally {
      setBusy(button, false);
    }
  };

  Views.registerSubmit = async function (form) {
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      password: String(fd.get('password') || '')
    };

    U.formError(form, '');
    if (!payload.name) return U.formError(form, 'Nama lengkap wajib diisi.');
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return U.formError(form, 'Masukkan alamat email yang valid.');
    }
    if (payload.phone.replace(/\D/g, '').length < 9) {
      return U.formError(form, 'Nomor HP minimal 9 digit.');
    }
    if (payload.password.length < 6) {
      return U.formError(form, 'Kata sandi minimal 6 karakter.');
    }
    if (!fd.get('terms')) {
      return U.formError(form, 'Centang persetujuan Syarat & Ketentuan untuk melanjutkan.');
    }

    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true);

    try {
      const res = await Store.register(payload);
      if (!res.ok) return U.formError(form, res.error);

      if (res.needsConfirmation) {
        U.toast('Pendaftaran berhasil. Periksa email untuk verifikasi, lalu masuk.', 'info');
        location.hash = '#/masuk';
        return;
      }

      enterApp(res.data);
      U.toast('Akun berhasil dibuat. Selamat datang di HargaUMKM!');
    } catch (err) {
      U.formError(form, Store.friendlyError(err));
    } finally {
      setBusy(button, false);
    }
  };

  Views.demoLogin = async function () {
    const button = document.querySelector('[data-action="demo-login"]');
    setBusy(button, true);

    try {
      const res = await Store.demoLogin();
      if (!res.ok) {
        U.toast(res.error || 'Akun demo tidak tersedia. Coba lagi.', 'error');
        return;
      }

      enterApp(res.data);
      U.toast('Masuk sebagai akun demo Premium.');
    } catch (err) {
      U.toast(Store.friendlyError(err), 'error');
    } finally {
      setBusy(button, false);
    }
  };

  Views.forgotSubmit = async function (form) {
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    U.formError(form, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return U.formError(form, 'Masukkan email yang valid.');
    }

    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true);

    try {
      const res = await Store.forgotPassword(email);
      if (!res.ok) return U.formError(form, res.error);
      U.closeModal();
      U.toast('Tautan reset dikirim ke ' + email + '. Periksa kotak masuk dan folder spam.', 'info');
    } catch (err) {
      U.formError(form, Store.friendlyError(err));
    } finally {
      setBusy(button, false);
    }
  };

  Views.resetPasswordSubmit = async function (form) {
    const fd = new FormData(form);
    const password = String(fd.get('password') || '');
    const confirm = String(fd.get('confirm') || '');

    U.formError(form, '');
    if (password.length < 6) return U.formError(form, 'Kata sandi baru minimal 6 karakter.');
    if (password !== confirm) return U.formError(form, 'Ulangi kata sandi baru dengan benar.');

    const button = form.querySelector('button[type="submit"]');
    setBusy(button, true);

    try {
      const res = await Store.setPassword(password);
      if (!res.ok) return U.formError(form, res.error);

      U.closeModal();
      U.toast('Kata sandi berhasil diperbarui. Anda sudah masuk.');
      if (App.data) enterApp(App.data);
      else location.hash = '#/masuk';
    } catch (err) {
      U.formError(form, Store.friendlyError(err));
    } finally {
      setBusy(button, false);
    }
  };
})();
