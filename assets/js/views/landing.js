/* HargaUMKM — landing page */
window.Views = window.Views || {};

(function () {
  const logo = (light) =>
    '<a href="#/" class="flex items-center gap-2.5">' +
      '<span class="logo-mark grid place-items-center w-9 h-9 rounded-xl text-white shadow-sm">' +
        U.icon('trending-up', 'w-[18px] h-[18px]') +
      '</span>' +
      '<span class="font-extrabold tracking-tight text-[17px] ' + (light ? 'text-white' : 'text-slate-900') + '">' +
        'Harga<span class="' + (light ? 'text-brand-300' : 'text-brand-600') + '">UMKM</span>' +
      '</span>' +
    '</a>';

  const check = (t, cls) =>
    '<li class="flex items-start gap-2.5 ' + (cls || '') + '">' +
      '<span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center shrink-0 mt-0.5">' +
        U.icon('check', 'w-3 h-3') +
      '</span><span>' + t + '</span>' +
    '</li>';

  const dash = '<span class="inline-flex w-6 h-6 rounded-full bg-slate-100 text-slate-400 items-center justify-center">' +
    U.icon('minus', 'w-3 h-3') + '</span>';

  Views.landing = function () {
    const logged = !!App.data;
    const startHref = logged ? '#/app/beranda' : '#/daftar';
    const startLabel = logged ? 'Buka Dashboard' : 'Mulai Sekarang';

    const sample = Calc.price({
      modal: 45000, packaging: 2000, operational: 4000, shipping: 0,
      commissionType: 'percent', commissionValue: 8,
      targetType: 'percent', targetValue: 30, roundTo: 500
    });
    const promo = Calc.discount({ price: sample.price, costBase: sample.costBase, commissionType: 'percent', commissionValue: 8, margin: sample.margin }, 15);

    const preview = Calc.price({ modal: 45000, targetType: 'percent', targetValue: 35, roundTo: 500 });

    return (
      '<div class="bg-white text-slate-900">' +
        '<header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200/70">' +
          '<div class="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-4">' +
            logo(false) +
            '<nav class="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-slate-600">' +
              '<button data-action="scroll" data-target="fitur" class="hover:text-slate-950 transition">Fitur</button>' +
              '<button data-action="scroll" data-target="cara-kerja" class="hover:text-slate-950 transition">Cara Kerja</button>' +
              '<button data-action="scroll" data-target="harga" class="hover:text-slate-950 transition">Harga</button>' +
              '<button data-action="scroll" data-target="faq" class="hover:text-slate-950 transition">FAQ</button>' +
            '</nav>' +
            '<div class="hidden sm:flex items-center gap-2">' +
              (logged
                ? '<a href="#/app/beranda" class="btn btn-primary">Buka Dashboard ' + U.icon('arrow-right', 'w-4 h-4') + '</a>'
                : '<a href="#/masuk" class="btn btn-ghost">Masuk</a>' +
                  '<a href="#/daftar" class="btn btn-primary">Coba Gratis</a>') +
            '</div>' +
            '<button class="lg:hidden icon-btn" data-action="toggle-landing-menu" aria-label="Buka menu" aria-expanded="false">' +
              U.icon('menu', 'w-5 h-5') +
            '</button>' +
          '</div>' +
          '<div id="landing-mobile-menu" class="hidden lg:hidden border-t border-slate-100 bg-white px-5 py-4">' +
            '<div class="flex flex-col gap-1 text-sm font-medium text-slate-700">' +
              '<button class="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50" data-action="scroll" data-target="fitur">Fitur</button>' +
              '<button class="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50" data-action="scroll" data-target="cara-kerja">Cara Kerja</button>' +
              '<button class="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50" data-action="scroll" data-target="harga">Harga</button>' +
              '<button class="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50" data-action="scroll" data-target="faq">FAQ</button>' +
            '</div>' +
            '<div class="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">' +
              (logged
                ? '<a href="#/app/beranda" class="btn btn-primary btn-block">Buka Dashboard</a>'
                : '<a href="#/masuk" class="btn btn-secondary btn-block">Masuk</a>' +
                  '<a href="#/daftar" class="btn btn-primary btn-block">Coba Gratis</a>') +
            '</div>' +
          '</div>' +
        '</header>' +

        '<main>' +
          /* HERO */
          '<section class="hero-section relative overflow-hidden">' +
            '<div class="absolute inset-0 hero-grid pointer-events-none"></div>' +
            '<div class="relative max-w-7xl mx-auto px-5 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20 grid lg:grid-cols-[1.02fr_.98fr] gap-12 lg:gap-14 items-center">' +
              '<div>' +
                '<div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11.5px] font-semibold text-slate-600 shadow-sm">' +
                  '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>' +
                  'Kalkulator harga untuk UMKM Indonesia' +
                '</div>' +
                '<h1 class="mt-5 text-[2.55rem] leading-[1.04] sm:text-5xl lg:text-[4rem] font-extrabold tracking-[-0.03em] text-slate-950 text-balance">' +
                  'Hitung harga jual,<br class="hidden sm:block"> <span class="text-gradient">raih keuntungan.</span>' +
                '</h1>' +
                '<p class="mt-5 text-[16.5px] sm:text-lg text-slate-600 leading-relaxed max-w-[46ch]">' +
                  'Tentukan harga jual dari modal, biaya operasional, dan target margin. Simpan produk, simulasi promo, dan pantau untung.' +
                '</p>' +
                '<div class="mt-8 flex flex-col sm:flex-row gap-3">' +
                  '<a href="' + startHref + '" class="btn btn-primary btn-lg">' + startLabel + ' ' + U.icon('arrow-right', 'w-4 h-4') + '</a>' +
                  '<button data-action="scroll" data-target="fitur" class="btn btn-secondary btn-lg">Lihat Fitur</button>' +
                '</div>' +
                '<p class="mt-4 text-[12px] text-slate-400">Gratis untuk mulai. Tanpa kartu kredit.</p>' +
              '</div>' +

              '<div class="relative">' +
                '<div class="absolute -inset-8 bg-gradient-to-tr from-brand-100/80 via-amber-50 to-emerald-50/70 blur-2xl rounded-full"></div>' +
                '<div class="relative card p-5 sm:p-6">' +
                  '<div class="flex items-center justify-between gap-3">' +
                    '<div class="flex items-center gap-2.5">' +
                      '<span class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">' + U.icon('calculator', 'w-[18px] h-[18px]') + '</span>' +
                      '<div>' +
                        '<p class="text-[13px] font-bold text-slate-800 leading-tight">Kalkulator cepat</p>' +
                        '<p class="text-[10.5px] text-slate-400">Coba langsung, tanpa daftar</p>' +
                      '</div>' +
                    '</div>' +
                    '<span class="badge badge-green"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Live</span>' +
                  '</div>' +
                  '<div class="grid grid-cols-2 gap-3 mt-5">' +
                    '<div>' +
                      '<label class="label !text-[11px]" for="hero-modal">Modal produk</label>' +
                      '<div class="input-wrap"><span class="prefix">Rp</span>' +
                        '<input id="hero-modal" class="input no-spin" type="number" min="0" step="500" value="45000" data-hero-field="modal" inputmode="numeric">' +
                      '</div>' +
                    '</div>' +
                    '<div>' +
                      '<label class="label !text-[11px]" for="hero-margin">Target margin</label>' +
                      '<div class="input-wrap"><input id="hero-margin" class="input has-suffix no-spin" type="number" min="0" max="90" step="1" value="35" data-hero-field="margin" inputmode="numeric"><span class="suffix">%</span></div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">' +
                    '<p class="text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-500">Harga jual ideal</p>' +
                    '<p id="hero-price" class="mt-1 text-[30px] sm:text-[34px] font-extrabold tracking-tight text-slate-900 num leading-none">' + U.rupiah(preview.price || 0) + '</p>' +
                    '<div class="mt-3.5 grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/80">' +
                      '<div><p class="text-[10.5px] text-slate-500">Keuntungan</p>' +
                        '<p id="hero-profit" class="text-[13.5px] font-bold text-emerald-700 num mt-0.5">' + U.rupiah(preview.profit || 0) + '</p></div>' +
                      '<div><p class="text-[10.5px] text-slate-500">Total biaya</p>' +
                        '<p id="hero-cost" class="text-[13.5px] font-bold text-slate-700 num mt-0.5">' + U.rupiah(preview.costBase || 0) + '</p></div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="mt-3 flex items-center justify-between text-[10.5px] text-slate-400">' +
                    '<span>Belum termasuk komisi marketplace</span>' +
                    '<a href="' + (logged ? '#/app/kalkulator' : '#/daftar') + '" class="font-semibold text-brand-600 hover:text-brand-700">Kalkulator lengkap ' + U.icon('arrow-up-right', 'w-3 h-3 inline -mt-0.5') + '</a>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          /* TRUST STRIP */
          '<section class="border-y border-slate-200/70 bg-white">' +
            '<div class="max-w-7xl mx-auto px-5 lg:px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[12.5px] font-medium text-slate-600">' +
              [
                ['shield-check', 'bg-brand-50 text-brand-600', 'Data tersinkron di cloud'],
                ['wallet', 'bg-amber-50 text-amber-600', 'Gratis untuk mulai'],
                ['smartphone', 'bg-emerald-50 text-emerald-600', 'Ramah mobile & desktop'],
                ['languages', 'bg-sky-50 text-sky-600', 'Bahasa Indonesia']
              ].map(([ic, tone, label]) =>
                '<div class="flex items-center gap-2.5">' +
                  '<span class="w-7 h-7 rounded-lg ' + tone + ' grid place-items-center shrink-0">' + U.icon(ic, 'w-3.5 h-3.5') + '</span>' +
                  '<span>' + label + '</span>' +
                '</div>'
              ).join('') +
            '</div>' +
          '</section>' +

          /* FEATURES / BENTO */
          '<section id="fitur" class="py-20 sm:py-24 bg-white scroll-mt-20">' +
            '<div class="max-w-7xl mx-auto px-5 lg:px-8">' +
              '<div class="max-w-2xl reveal">' +
                '<h2 class="text-3xl sm:text-4xl font-extrabold tracking-[-0.025em] text-slate-950 text-balance">Satu tempat untuk semua angka.</h2>' +
                '<p class="mt-3 text-[15px] text-slate-600 leading-7 max-w-[58ch]">Dari menghitung harga sampai menyiapkan laporan, semuanya dirancang untuk pemilik usaha yang tidak punya banyak waktu.</p>' +
              '</div>' +

              '<div class="mt-10 grid lg:grid-cols-12 gap-4">' +
                '<article class="reveal lg:col-span-7 card p-6 sm:p-7 flex flex-col">' +
                  '<div class="flex items-start justify-between gap-4">' +
                    '<div>' +
                      '<span class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">' + U.icon('calculator', 'w-5 h-5') + '</span>' +
                      '<h3 class="mt-4 text-lg font-bold tracking-tight text-slate-900">Hitung semua biaya, bukan hanya modal</h3>' +
                      '<p class="mt-1.5 text-[13px] text-slate-500 leading-6 max-w-[42ch]">Masukkan kemasan, operasional, ongkir, dan komisi marketplace. Harga jual dihitung otomatis.</p>' +
                    '</div>' +
                    '<span class="badge badge-slate">Contoh</span>' +
                  '</div>' +
                  '<div class="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-[12px]">' +
                    '<div class="space-y-2 text-slate-500">' +
                      '<div class="flex justify-between"><span>Modal produk</span><span class="font-semibold text-slate-700 num">' + U.rupiah(45000) + '</span></div>' +
                      '<div class="flex justify-between"><span>Kemasan + operasional</span><span class="font-semibold text-slate-700 num">' + U.rupiah(6000) + '</span></div>' +
                      '<div class="flex justify-between"><span>Komisi marketplace 8%</span><span class="font-semibold text-slate-700 num">' + U.rupiah(sample.commission) + '</span></div>' +
                    '</div>' +
                    '<div class="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">' +
                      '<span class="text-[11px] font-semibold text-slate-500">Harga jual ideal</span>' +
                      '<span class="text-[17px] font-extrabold text-brand-700 num">' + U.rupiah(sample.price) + '</span>' +
                    '</div>' +
                    '<div class="mt-1 flex items-center justify-between">' +
                      '<span class="text-[11px] text-slate-400">Margin ' + U.pct(sample.margin) + '</span>' +
                      '<span class="text-[11px] font-semibold text-emerald-600">Untung ' + U.rupiah(sample.profit) + '</span>' +
                    '</div>' +
                  '</div>' +
                '</article>' +

                '<article class="reveal lg:col-span-5 rounded-[22px] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-amber-50/70 p-6 sm:p-7" style="transition-delay:60ms">' +
                  '<div class="flex items-start justify-between gap-4">' +
                    '<div>' +
                      '<span class="w-10 h-10 rounded-xl bg-white text-brand-600 grid place-items-center shadow-sm">' + U.icon('percent', 'w-5 h-5') + '</span>' +
                      '<h3 class="mt-4 text-lg font-bold tracking-tight text-slate-900">Simulasi promo tanpa boncos</h3>' +
                      '<p class="mt-1.5 text-[13px] text-slate-600 leading-6">Lihat margin sebelum memberi diskon.</p>' +
                    '</div>' +
                    '<span class="badge badge-blue">Premium</span>' +
                  '</div>' +
                  '<div class="mt-5 flex gap-2">' +
                    ['5%', '10%', '15%', '20%'].map((d, i) =>
                      '<span class="px-2.5 py-1 rounded-lg text-[11px] font-semibold ' +
                        (i === 2 ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 border border-slate-200') + '">' + d + '</span>'
                    ).join('') +
                  '</div>' +
                  '<div class="mt-4 rounded-xl bg-white border border-brand-100/80 p-4">' +
                    '<div class="flex items-center justify-between text-[12px]">' +
                      '<span class="text-slate-500">Harga setelah diskon 15%</span>' +
                      '<span class="font-bold text-slate-800 num">' + U.rupiah(promo.newPrice) + '</span>' +
                    '</div>' +
                    '<div class="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden">' +
                      '<div class="h-full rounded-full bg-emerald-500" style="width:' + Math.max(6, Math.min(95, promo.margin * 2)) + '%"></div>' +
                    '</div>' +
                    '<div class="mt-2 flex items-center justify-between text-[11px]">' +
                      '<span class="text-slate-400">Margin baru</span>' +
                      '<span class="font-bold text-emerald-600">' + U.pct(promo.margin) + '</span>' +
                    '</div>' +
                  '</div>' +
                  '<p class="mt-3 text-[10.5px] text-slate-400">Angka contoh. Hasil aktual mengikuti biaya produk Anda.</p>' +
                '</article>' +

                '<article class="reveal lg:col-span-5 card p-6 sm:p-7" style="transition-delay:90ms">' +
                  '<span class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">' + U.icon('bar-chart-3', 'w-5 h-5') + '</span>' +
                  '<h3 class="mt-4 text-lg font-bold tracking-tight text-slate-900">Tahu produk paling untung</h3>' +
                  '<p class="mt-1.5 text-[13px] text-slate-500 leading-6">Bandingkan margin semua produk dalam satu tampilan.</p>' +
                  '<div class="mt-5 space-y-3.5">' +
                    [['Kaos Polos', 35, 'bg-brand-600'], ['Kopi Arabika', 30, 'bg-emerald-500'], ['Sambal Bawang', 25, 'bg-amber-500']].map(([n, v, c]) =>
                      '<div>' +
                        '<div class="flex justify-between text-[11.5px] mb-1"><span class="text-slate-500">' + n + '</span><span class="font-bold text-slate-700">' + v + '%</span></div>' +
                        '<div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ' + c + '" style="width:' + (v * 2.2) + '%"></div></div>' +
                      '</div>'
                    ).join('') +
                  '</div>' +
                  '<p class="mt-4 text-[10.5px] text-slate-400">Data ilustrasi.</p>' +
                '</article>' +

                '<article class="reveal lg:col-span-7 rounded-[20px] bg-ink p-6 sm:p-7 text-white relative overflow-hidden" style="transition-delay:120ms">' +
                  '<div class="absolute inset-0 auth-grid opacity-50"></div>' +
                  '<div class="absolute -right-8 -bottom-16 w-56 h-56 rounded-full bg-brand-500/15 blur-2xl"></div>' +
                  '<div class="relative flex flex-col sm:flex-row gap-6 sm:items-center">' +
                    '<div class="flex-1">' +
                      '<span class="w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-blue-200 grid place-items-center">' + U.icon('file-text', 'w-5 h-5') + '</span>' +
                      '<h3 class="mt-4 text-lg font-bold tracking-tight">Laporan rapi, siap diunduh</h3>' +
                      '<p class="mt-1.5 text-[13px] text-blue-100/70 leading-6 max-w-[38ch]">Ringkasan pendapatan, biaya, dan keuntungan per periode dalam satu PDF.</p>' +
                      '<span class="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-200">Fitur premium ' + U.icon('arrow-right', 'w-3.5 h-3.5') + '</span>' +
                    '</div>' +
                    '<div class="w-full sm:w-[170px] rounded-xl bg-white p-3.5 text-slate-800 shadow-2xl rotate-1">' +
                      '<div class="flex items-center justify-between">' +
                        '<span class="text-[8px] font-extrabold tracking-wide text-brand-700">HARGAUMKM</span>' +
                        '<span class="text-[7px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">PDF</span>' +
                      '</div>' +
                      '<p class="text-[9px] font-bold mt-2.5">Laporan Keuangan</p>' +
                      '<p class="text-[6.5px] text-slate-400">Periode Oktober 2026</p>' +
                      '<div class="mt-2 space-y-1">' +
                        '<div class="h-1 rounded bg-slate-100 w-full"></div>' +
                        '<div class="h-1 rounded bg-slate-100 w-5/6"></div>' +
                        '<div class="h-1 rounded bg-slate-100 w-2/3"></div>' +
                      '</div>' +
                      '<div class="mt-2.5 grid grid-cols-2 gap-1">' +
                        '<div class="rounded bg-slate-50 p-1.5"><p class="text-[5.5px] text-slate-400">Pendapatan</p><p class="text-[7px] font-bold num">Rp 384.500</p></div>' +
                        '<div class="rounded bg-emerald-50 p-1.5"><p class="text-[5.5px] text-emerald-500">Keuntungan</p><p class="text-[7px] font-bold text-emerald-700 num">Rp 119.180</p></div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</article>' +
              '</div>' +
            '</div>' +
          '</section>' +

          /* HOW IT WORKS */
          '<section id="cara-kerja" class="py-20 sm:py-24 bg-[#faf8ff] border-y border-slate-200/60 scroll-mt-20">' +
            '<div class="max-w-7xl mx-auto px-5 lg:px-8">' +
              '<div class="max-w-2xl reveal">' +
                '<h2 class="text-3xl sm:text-4xl font-extrabold tracking-[-0.025em] text-slate-950 text-balance">Tiga langkah, harga selesai.</h2>' +
                '<p class="mt-3 text-[15px] text-slate-600 leading-7">Tidak perlu spreadsheet rumit. Masukkan angka, lihat hasilnya, simpan.</p>' +
              '</div>' +
              '<div class="mt-10 grid md:grid-cols-3 gap-8 md:gap-6">' +
                [
                  ['01', 'Masukkan biaya', 'Catat modal, kemasan, biaya operasional, ongkir, dan komisi marketplace Anda.', 'bg-brand-50 text-brand-600 border-brand-100'],
                  ['02', 'Tentukan target', 'Pilih target keuntungan dalam nominal atau persentase margin. Harga jual langsung muncul.', 'bg-amber-50 text-amber-600 border-amber-100'],
                  ['03', 'Simpan & pantau', 'Simpan produk, bandingkan margin, dan ekspor laporan saat dibutuhkan.', 'bg-emerald-50 text-emerald-600 border-emerald-100']
                ].map(([n, t, d, tone], i) =>
                  '<div class="reveal relative" style="transition-delay:' + (i * 70) + 'ms">' +
                    '<div class="flex items-center gap-3">' +
                      '<span class="w-9 h-9 rounded-full border text-[11px] font-extrabold ' + tone + ' grid place-items-center num">' + n + '</span>' +
                      (i < 2 ? '<span class="hidden md:block h-px flex-1 bg-slate-200"></span>' : '') +
                    '</div>' +
                    '<h3 class="mt-4 text-[17px] font-bold tracking-tight text-slate-900">' + t + '</h3>' +
                    '<p class="mt-1.5 text-[13px] text-slate-500 leading-6 max-w-[34ch]">' + d + '</p>' +
                  '</div>'
                ).join('') +
              '</div>' +
            '</div>' +
          '</section>' +

          /* PRICING */
          '<section id="harga" class="py-20 sm:py-24 bg-white scroll-mt-20">' +
            '<div class="max-w-7xl mx-auto px-5 lg:px-8">' +
              '<div class="max-w-2xl reveal">' +
                '<h2 class="text-3xl sm:text-4xl font-extrabold tracking-[-0.025em] text-slate-950 text-balance">Mulai gratis, upgrade saat butuh.</h2>' +
                '<p class="mt-3 text-[15px] text-slate-600 leading-7">Fitur inti selalu gratis. Fitur pertumbuhan tersedia di paket Premium seharga Rp 20.000 per bulan.</p>' +
              '</div>' +

              '<div class="mt-10 grid lg:grid-cols-2 gap-4 max-w-4xl">' +
                '<div class="reveal card p-6 sm:p-7 flex flex-col">' +
                  '<div class="flex items-center justify-between">' +
                    '<h3 class="text-[15px] font-bold text-slate-900">Paket Gratis</h3>' +
                    '<span class="badge badge-slate">Selamanya</span>' +
                  '</div>' +
                  '<div class="mt-4 flex items-end gap-1">' +
                    '<span class="text-4xl font-extrabold tracking-tight text-slate-950 num">Rp 0</span>' +
                    '<span class="text-[12px] text-slate-400 mb-1.5">/bulan</span>' +
                  '</div>' +
                  '<p class="mt-2 text-[13px] text-slate-500 leading-6">Cukup untuk mulai menghitung dan menyimpan produk pertama Anda.</p>' +
                  '<ul class="mt-5 space-y-2.5 text-[13px] text-slate-600 flex-1">' +
                    check('Kalkulator harga jual dasar') +
                    check('Simpan hingga 5 produk') +
                    check('Riwayat 10 simulasi terakhir') +
                    check('Ringkasan dashboard') +
                  '</ul>' +
                  '<a href="' + startHref + '" class="btn btn-secondary btn-block mt-6">' + (logged ? 'Buka Dashboard' : 'Mulai Gratis') + '</a>' +
                '</div>' +

                '<div class="reveal rounded-[20px] bg-ink p-6 sm:p-7 text-white relative overflow-hidden flex flex-col" style="transition-delay:70ms">' +
                  '<div class="absolute inset-0 auth-grid opacity-40"></div>' +
                  '<div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-brand-500/20 blur-2xl"></div>' +
                  '<div class="relative flex-1 flex flex-col">' +
                    '<div class="flex items-center justify-between">' +
                      '<h3 class="text-[15px] font-bold flex items-center gap-2">Paket Premium ' + U.icon('crown', 'w-4 h-4 text-amber-300') + '</h3>' +
                      '<span class="badge badge-navy">Paling populer</span>' +
                    '</div>' +
                    '<div class="mt-4 flex items-end gap-1">' +
                      '<span class="text-4xl font-extrabold tracking-tight num">Rp 20.000</span>' +
                      '<span class="text-[12px] text-blue-200/60 mb-1.5">/bulan</span>' +
                    '</div>' +
                    '<p class="mt-2 text-[13px] text-blue-100/70 leading-6">Semua yang dibutuhkan untuk menjaga margin tetap sehat saat usaha tumbuh.</p>' +
                    '<ul class="mt-5 space-y-2.5 text-[13px] text-blue-50/90 flex-1">' +
                      [
                        'Semua fitur paket Gratis',
                        'Simulasi promo & batas diskon',
                        'Perbandingan keuntungan produk',
                        'Ekspor laporan keuangan PDF',
                        'Produk & riwayat tanpa batas'
                      ].map((t) =>
                        '<li class="flex items-start gap-2.5">' +
                          '<span class="w-5 h-5 rounded-full bg-emerald-400/15 text-emerald-300 grid place-items-center shrink-0 mt-0.5">' + U.icon('check', 'w-3 h-3') + '</span>' +
                          '<span>' + t + '</span>' +
                        '</li>'
                      ).join('') +
                    '</ul>' +
                    (logged
                      ? '<button data-action="open-upgrade" class="btn btn-block mt-6 bg-white text-ink hover:bg-blue-50">Upgrade ke Premium</button>'
                      : '<a href="#/daftar" class="btn btn-block mt-6 bg-white text-ink hover:bg-blue-50">Coba Premium</a>') +
                    '<p class="text-center text-[10px] text-blue-200/50 mt-2.5">Mode demo: aktivasi tanpa pembayaran.</p>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<div class="mt-6 card overflow-hidden max-w-4xl reveal">' +
                '<div class="px-5 sm:px-6 py-4 border-b border-slate-100">' +
                  '<h3 class="text-[13px] font-bold text-slate-900">Perbandingan fitur</h3>' +
                '</div>' +
                '<div class="overflow-x-auto">' +
                  '<table class="tbl min-w-[520px]">' +
                    '<thead><tr><th>Fitur</th><th class="!text-center">Gratis</th><th class="!text-center">Premium</th></tr></thead>' +
                    '<tbody>' +
                      [
                        ['Kalkulator harga jual', true, true],
                        ['Simpan produk', '5 produk', 'Tanpa batas'],
                        ['Riwayat simulasi', '10 terakhir', 'Tanpa batas'],
                        ['Simulasi promo & batas diskon', false, true],
                        ['Perbandingan keuntungan', false, true],
                        ['Ekspor laporan PDF', false, true]
                      ].map(([label, free, prem]) =>
                        '<tr><td class="font-medium text-slate-700">' + label + '</td>' +
                          '<td class="!text-center">' + (free === true ? '<span class="inline-flex w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center">' + U.icon('check', 'w-3 h-3') + '</span>' : (free === false ? dash : '<span class="text-[12px] text-slate-500">' + free + '</span>')) + '</td>' +
                          '<td class="!text-center">' + (prem === true ? '<span class="inline-flex w-6 h-6 rounded-full bg-brand-50 text-brand-600 items-center justify-center">' + U.icon('check', 'w-3 h-3') + '</span>' : '<span class="text-[12px] text-slate-500">' + prem + '</span>') + '</td>' +
                        '</tr>'
                      ).join('') +
                    '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          /* FAQ */
          '<section id="faq" class="py-20 sm:py-24 bg-[#faf8ff] border-y border-slate-200/60 scroll-mt-20">' +
            '<div class="max-w-3xl mx-auto px-5 lg:px-8">' +
              '<div class="reveal">' +
                '<h2 class="text-3xl sm:text-4xl font-extrabold tracking-[-0.025em] text-slate-950 text-balance">Pertanyaan yang sering muncul.</h2>' +
                '<p class="mt-3 text-[15px] text-slate-600 leading-7">Belum menemukan jawaban? Hubungi kami melalui halaman Bantuan.</p>' +
              '</div>' +
              '<div class="mt-8 space-y-2.5 reveal">' +
                [
                  ['Apakah data saya aman?', 'Akun, produk, dan riwayat disimpan di server Supabase. Setiap akun hanya dapat mengakses datanya sendiri, dan koneksi ke server menggunakan HTTPS.'],
                  ['Apakah paket gratis bisa dipakai selamanya?', 'Bisa. Paket gratis tidak memiliki batas waktu. Anda hanya dibatasi pada 5 produk dan 10 riwayat simulasi.'],
                  ['Bagaimana cara upgrade ke Premium?', 'Daftar akun, lalu buka Pengaturan > Keanggotaan atau klik tombol Upgrade. Pada mode demo, premium aktif secara instan tanpa pembayaran.'],
                  ['Apakah komisi marketplace diperhitungkan?', 'Ya. Komisi bisa dimasukkan sebagai nominal rupiah atau persentase dari harga jual, dan otomatis masuk ke total biaya.'],
                  ['Bisakah saya mengubah harga produk yang sudah disimpan?', 'Bisa. Buka Produk Saya, pilih produk, lalu klik Edit. Kalkulator akan terisi otomatis dengan data produk tersebut.'],
                  ['Apakah laporan PDF tersedia di paket gratis?', 'Tidak. Ekspor PDF adalah fitur Premium. Paket gratis tetap bisa melihat ringkasan di dashboard.']
                ].map(([q, a]) =>
                  '<details class="faq-item card-flat overflow-hidden">' +
                    '<summary>' + q + U.icon('plus', 'w-4 h-4 faq-plus') + '</summary>' +
                    '<div class="px-5 pb-5 -mt-1 text-[13px] text-slate-500 leading-6">' + a + '</div>' +
                  '</details>'
                ).join('') +
              '</div>' +
            '</div>' +
          '</section>' +

          /* CTA */
          '<section class="py-16 sm:py-20 bg-white">' +
            '<div class="max-w-7xl mx-auto px-5 lg:px-8">' +
              '<div class="reveal rounded-[24px] bg-ink px-6 py-10 sm:px-12 sm:py-12 relative overflow-hidden">' +
                '<div class="absolute inset-0 auth-grid opacity-40"></div>' +
                '<div class="absolute -right-16 -bottom-24 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl"></div>' +
                '<div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">' +
                  '<div class="max-w-xl">' +
                    '<h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">Siap menentukan harga yang menguntungkan?</h2>' +
                    '<p class="mt-2.5 text-[13.5px] text-blue-100/70 leading-6">Mulai dari produk pertama Anda. Gratis, tanpa kartu kredit.</p>' +
                  '</div>' +
                  '<div class="flex flex-col sm:flex-row gap-2.5 shrink-0">' +
                    '<a href="' + startHref + '" class="btn bg-white text-ink hover:bg-blue-50">' + startLabel + '</a>' +
                    '<button data-action="scroll" data-target="harga" class="btn border border-white/20 text-white hover:bg-white/10">Lihat Paket</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</section>' +
        '</main>' +

        /* FOOTER */
        '<footer class="border-t border-slate-200 bg-white">' +
          '<div class="max-w-7xl mx-auto px-5 lg:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">' +
            '<div>' +
              logo(false) +
              '<p class="mt-3 text-[12.5px] text-slate-500 leading-6 max-w-[32ch]">Alat bantu hitung harga dan kelola keuntungan untuk usaha mikro, kecil, dan menengah.</p>' +
            '</div>' +
            '<div>' +
              '<p class="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Produk</p>' +
              '<div class="mt-3 space-y-2 text-[12.5px] text-slate-500">' +
                '<button data-action="scroll" data-target="fitur" class="block hover:text-slate-900">Fitur</button>' +
                '<button data-action="scroll" data-target="harga" class="block hover:text-slate-900">Harga</button>' +
                '<button data-action="scroll" data-target="faq" class="block hover:text-slate-900">FAQ</button>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<p class="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Akun</p>' +
              '<div class="mt-3 space-y-2 text-[12.5px] text-slate-500">' +
                '<a href="#/masuk" class="block hover:text-slate-900">Masuk</a>' +
                '<a href="#/daftar" class="block hover:text-slate-900">Daftar</a>' +
                '<a href="' + (logged ? '#/app/pengaturan' : '#/daftar') + '" class="block hover:text-slate-900">Pengaturan</a>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<p class="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Bantuan</p>' +
              '<div class="mt-3 space-y-2 text-[12.5px] text-slate-500">' +
                '<a href="' + (logged ? '#/app/bantuan' : '#/daftar') + '" class="block hover:text-slate-900">Pusat Bantuan</a>' +
                '<a href="mailto:halo@hargaumkm.id" class="block hover:text-slate-900">halo@hargaumkm.id</a>' +
                '<span class="block">Senin–Jumat, 09.00–17.00 WIB</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="border-t border-slate-100">' +
            '<div class="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">' +
              '<span>© 2026 HargaUMKM. Semua hak dilindungi.</span>' +
              '<span>Dibuat untuk UMKM Indonesia · Versi demo</span>' +
            '</div>' +
          '</div>' +
        '</footer>' +
      '</div>'
    );
  };
})();
