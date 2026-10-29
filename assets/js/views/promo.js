/* HargaUMKM — promo simulation (premium) */
window.Views = window.Views || {};

(function () {
  const statusOf = (sim) => {
    if (sim.profit <= 0) return { label: 'Rugi', cls: 'badge-red', text: 'Harga setelah diskon tidak menutup biaya.' };
    if (sim.margin < 15) return { label: 'Margin tipis', cls: 'badge-amber', text: 'Masih untung, tetapi margin di bawah 15%.' };
    return { label: 'Masih aman', cls: 'badge-green', text: 'Margin masih di atas batas aman 15%.' };
  };

  function chipState(active) {
    return 'chip ' + (active ? 'chip-active' : '');
  }

  Views.promoResults = function () {
    const products = App.data.products;
    const state = App.ui.promo;
    const p = products.find((x) => x.id === state.productId);
    if (!p) return '';

    const sim = Calc.discount(p, state.discount);
    const st = statusOf(sim);
    const delta = sim.profit - (Number(p.profit) || 0);

    return (
      '<div class="card overflow-hidden">' +
        '<div class="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">' +
          '<div>' +
            '<h2 class="text-[15px] font-bold tracking-tight text-slate-900">Hasil simulasi</h2>' +
            '<p class="text-[11.5px] text-slate-400 mt-0.5">' + U.esc(p.name) + '</p>' +
          '</div>' +
          '<span class="badge ' + st.cls + '">' + st.label + '</span>' +
        '</div>' +
        '<div class="p-5 sm:p-6">' +
          '<div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">' +
            '<div class="flex items-center justify-between gap-3">' +
              '<span class="text-[11px] text-slate-400">Harga jual normal</span>' +
              '<span class="text-[12px] font-semibold text-slate-500 line-through num">' + U.rupiah(sim.oldPrice) + '</span>' +
            '</div>' +
            '<p class="mt-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">Harga setelah diskon ' + U.pct(sim.discount, 0) + '</p>' +
            '<p class="text-[32px] font-extrabold tracking-tight text-slate-900 num leading-none mt-1">' + U.rupiah(sim.newPrice) + '</p>' +
            '<p class="mt-2 text-[11.5px] text-slate-500">Potongan harga <strong class="text-slate-700 num">' + U.rupiah(sim.discountAmount) + '</strong></p>' +
          '</div>' +

          '<div class="mt-4 grid grid-cols-2 gap-3">' +
            '<div class="rounded-xl border border-slate-100 p-3.5">' +
              '<p class="text-[10.5px] text-slate-400">Total biaya</p>' +
              '<p class="text-[14px] font-bold text-slate-800 num mt-1">' + U.rupiah(sim.totalCost) + '</p>' +
            '</div>' +
            '<div class="rounded-xl border border-slate-100 p-3.5">' +
              '<p class="text-[10.5px] text-slate-400">Keuntungan baru</p>' +
              '<p class="text-[14px] font-bold ' + (sim.profit <= 0 ? 'text-red-600' : 'text-emerald-600') + ' num mt-1">' + U.rupiah(sim.profit) + '</p>' +
            '</div>' +
            '<div class="rounded-xl border border-slate-100 p-3.5">' +
              '<p class="text-[10.5px] text-slate-400">Margin baru</p>' +
              '<p class="text-[14px] font-bold text-slate-800 num mt-1">' + U.pct(sim.margin) + '</p>' +
            '</div>' +
            '<div class="rounded-xl border border-slate-100 p-3.5">' +
              '<p class="text-[10.5px] text-slate-400">Perubahan margin</p>' +
              '<p class="text-[14px] font-bold ' + (sim.marginDelta < 0 ? 'text-amber-600' : 'text-emerald-600') + ' num mt-1">' +
                (sim.marginDelta >= 0 ? '+' : '') + U.pct(sim.marginDelta) +
              '</p>' +
            '</div>' +
          '</div>' +

          '<div class="mt-4">' +
            '<div class="flex items-center justify-between text-[11px] mb-1.5">' +
              '<span class="text-slate-400">Margin setelah diskon</span>' +
              '<span class="font-semibold text-slate-600">' + U.pct(sim.margin) + '</span>' +
            '</div>' +
            '<div class="h-2 rounded-full bg-slate-100 overflow-hidden">' +
              '<div class="h-full rounded-full ' + (sim.profit <= 0 ? 'bg-red-500' : sim.margin < 15 ? 'bg-amber-500' : 'bg-emerald-500') + '" style="width:' + Math.min(100, Math.max(2, sim.margin)) + '%"></div>' +
            '</div>' +
          '</div>' +

          '<p class="mt-3 text-[11px] ' + (sim.profit <= 0 ? 'text-red-600' : 'text-slate-400') + ' leading-5">' + st.text + '</p>' +

          '<button class="btn btn-primary btn-block mt-4" data-action="save-promo">' + U.icon('save', 'w-4 h-4') + 'Simpan Simulasi</button>' +
          '<p class="mt-2 text-[10.5px] text-slate-400 text-center">Tersimpan di Riwayat Simulasi.</p>' +
        '</div>' +
      '</div>'
    );
  };

  Views.promoLimit = function () {
    const p = App.data.products.find((x) => x.id === App.ui.promo.productId);
    if (!p) return '';
    const state = App.ui.promo;
    const limit = Calc.maxDiscount(p, state.minType, state.minValue);
    const minSim = Calc.discount(p, limit.pct);
    const typeLabel = state.minType === 'percent' ? 'margin minimum' : 'keuntungan minimum';

    return (
      '<div class="card p-5 sm:p-6">' +
        '<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">' +
          '<div>' +
            '<h2 class="text-[15px] font-bold tracking-tight text-slate-900">Kalkulator batas diskon</h2>' +
            '<p class="text-[11.5px] text-slate-400 mt-0.5">Berapa diskon maksimal agar ' + typeLabel + ' tetap terjaga?</p>' +
          '</div>' +
          '<span class="badge badge-blue">Premium</span>' +
        '</div>' +

        '<div class="mt-5 grid sm:grid-cols-[1fr_auto] gap-5 items-end">' +
          '<div class="grid grid-cols-2 gap-3">' +
            '<div>' +
              '<label class="label" for="promo-min-type">Batas minimum</label>' +
              '<select id="promo-min-type" class="input" data-min-type>' +
                '<option value="percent"' + (state.minType === 'percent' ? ' selected' : '') + '>Margin (%)</option>' +
                '<option value="nominal"' + (state.minType === 'nominal' ? ' selected' : '') + '>Keuntungan (Rp)</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="label" for="promo-min-value">Nilai minimum</label>' +
              '<div class="input-wrap">' +
                '<input id="promo-min-value" class="input has-suffix no-spin" type="number" min="0" step="1" inputmode="decimal" value="' + U.esc(state.minValue) + '" data-min-value>' +
                '<span class="suffix">' + (state.minType === 'percent' ? '%' : 'Rp') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="rounded-2xl bg-brand-50 border border-brand-100 px-5 py-3.5 text-center min-w-[140px]">' +
            '<p class="text-[10px] font-bold tracking-[0.08em] text-brand-700">DISKON MAKSIMAL</p>' +
            '<p class="text-[30px] font-extrabold tracking-tight text-brand-800 num leading-none mt-1">' + U.pct(limit.pct, 1) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">' +
          '<div class="h-full rounded-full bg-brand-600" style="width:' + Math.min(100, Math.max(1, limit.pct)) + '%"></div>' +
        '</div>' +

        '<div class="mt-4 grid sm:grid-cols-3 gap-3 text-[11.5px]">' +
          '<div class="rounded-xl bg-slate-50 border border-slate-100 p-3">' +
            '<p class="text-slate-400">Harga minimum</p>' +
            '<p class="font-bold text-slate-800 num mt-0.5">' + U.rupiah(limit.minPrice) + '</p>' +
          '</div>' +
          '<div class="rounded-xl bg-slate-50 border border-slate-100 p-3">' +
            '<p class="text-slate-400">Keuntungan di batas</p>' +
            '<p class="font-bold ' + (minSim.profit <= 0 ? 'text-red-600' : 'text-emerald-600') + ' num mt-0.5">' + U.rupiah(minSim.profit) + '</p>' +
          '</div>' +
          '<div class="rounded-xl bg-slate-50 border border-slate-100 p-3">' +
            '<p class="text-slate-400">Margin di batas</p>' +
            '<p class="font-bold text-slate-800 num mt-0.5">' + U.pct(minSim.margin) + '</p>' +
          '</div>' +
        '</div>' +

        (limit.pct <= 0
          ? '<div class="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-2.5 flex items-start gap-2.5">' +
              '<span class="text-amber-600 mt-0.5">' + U.icon('triangle-alert', 'w-4 h-4') + '</span>' +
              '<p class="text-[11.5px] text-amber-800 leading-5">Harga saat ini sudah menyentuh batas minimum. Memberi diskon akan melanggar target ' + typeLabel + ' Anda.</p>' +
            '</div>'
          : '<p class="mt-4 text-[11px] text-slate-400 leading-5">Dengan diskon maksimal ' + U.pct(limit.pct, 1) + ', harga turun ke ' + U.rupiah(limit.minPrice) + ' dan keuntungan menjadi ' + U.rupiah(minSim.profit) + '.</p>') +
      '</div>'
    );
  };

  Views.promo = function () {
    if (!App.data.user.premium) {
      return UI.paywall({
        feature: 'Simulasi Promo & Batas Diskon',
        description: 'Rencanakan diskon sebelum campaign berjalan. Lihat harga baru, keuntungan, dan margin tanpa menebak-nebak.',
        benefits: [
          'Simulasi diskon 5% hingga 20% atau nilai custom',
          'Perbandingan harga, biaya, keuntungan, dan margin',
          'Kalkulator batas diskon berdasarkan margin minimum',
          'Simpan hasil simulasi ke riwayat'
        ]
      });
    }

    const products = App.data.products;
    if (!products.length) {
      return (
        '<div class="space-y-5">' +
          '<div>' +
            '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950">Simulasi Promo</h1>' +
            '<p class="mt-1 text-[12.5px] text-slate-500">Uji diskon sebelum promo dijalankan.</p>' +
          '</div>' +
          UI.empty({
            icon: 'percent',
            title: 'Simulasi butuh produk',
            description: 'Simpan minimal satu produk terlebih dahulu. Setelah itu Anda bisa menguji berbagai skenario diskon.',
            actionHtml: '<a href="#/app/kalkulator" class="btn btn-primary">' + U.icon('calculator', 'w-4 h-4') + 'Hitung Produk</a>'
          }) +
        '</div>'
      );
    }

    if (!App.ui.promo || !products.some((p) => p.id === App.ui.promo.productId)) {
      App.ui.promo = {
        productId: products[0].id,
        discount: 10,
        minType: 'percent',
        minValue: 15
      };
    }

    const state = App.ui.promo;
    const p = products.find((x) => x.id === state.productId);
    const scenarios = [5, 10, 15, 20];

    return (
      '<div class="space-y-5">' +
        '<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">' +
          '<div>' +
            '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">Simulasi Promo</h1>' +
            '<p class="mt-1 text-[12.5px] text-slate-500">Atur diskon, lihat dampaknya ke keuntungan, lalu putuskan.</p>' +
          '</div>' +
          '<a href="#/app/riwayat" class="btn btn-secondary self-start sm:self-auto">' + U.icon('history', 'w-4 h-4') + 'Riwayat Simulasi</a>' +
        '</div>' +

        '<div class="grid lg:grid-cols-2 gap-5 items-start">' +
          '<div class="card p-5 sm:p-6">' +
            '<div class="flex items-center justify-between">' +
              '<h2 class="text-[15px] font-bold tracking-tight text-slate-900">Atur skenario</h2>' +
              '<span class="badge badge-slate">Diskon</span>' +
            '</div>' +

            '<div class="mt-4">' +
              '<label class="label" for="promo-product">Pilih produk</label>' +
              '<select id="promo-product" class="input" data-promo-product>' +
                products.map((x) =>
                  '<option value="' + x.id + '"' + (x.id === state.productId ? ' selected' : '') + '>' +
                    U.esc(x.name) + ' — ' + U.rupiah(x.price) +
                  '</option>'
                ).join('') +
              '</select>' +
            '</div>' +

            '<div class="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-[11.5px]">' +
              '<div><p class="text-slate-400">Harga jual</p><p class="font-bold text-slate-800 num mt-0.5">' + U.rupiah(p.price) + '</p></div>' +
              '<div><p class="text-slate-400">Keuntungan awal</p><p class="font-bold text-emerald-600 num mt-0.5">' + U.rupiah(p.profit) + '</p></div>' +
              '<div><p class="text-slate-400">Margin awal</p><p class="font-bold text-slate-800 num mt-0.5">' + U.pct(p.margin) + '</p></div>' +
              '<div><p class="text-slate-400">Total biaya</p><p class="font-bold text-slate-800 num mt-0.5">' + U.rupiah(p.totalCost) + '</p></div>' +
            '</div>' +

            '<div class="mt-5">' +
              '<div class="flex items-center justify-between mb-2">' +
                '<span class="label !mb-0">Besar diskon</span>' +
                '<span id="promo-discount-label" class="text-[13px] font-extrabold text-brand-700 num">' + U.pct(state.discount, 0) + '</span>' +
              '</div>' +
              '<div class="flex flex-wrap gap-2">' +
                scenarios.map((v) =>
                  '<button type="button" class="' + chipState(Number(state.discount) === v) + '" data-action="promo-discount" data-value="' + v + '" data-discount-chip="' + v + '">' + v + '%</button>'
                ).join('') +
                '<div class="relative">' +
                  '<input type="number" min="0" max="90" step="1" inputmode="decimal" value="' + U.esc(state.discount) + '" data-promo-custom ' +
                    'class="w-[92px] rounded-full border border-slate-200 bg-white px-3 py-1.5 pr-7 text-[12px] font-semibold text-slate-700 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100" aria-label="Diskon custom">' +
                  '<span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">%</span>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="mt-5">' +
              '<input type="range" min="0" max="50" step="1" value="' + U.esc(state.discount) + '" data-discount-range ' +
                'class="w-full h-1.5 accent-brand-600 cursor-pointer" aria-label="Geser besar diskon">' +
              '<div class="flex justify-between text-[10px] text-slate-400 mt-1.5"><span>0%</span><span>25%</span><span>50%</span></div>' +
            '</div>' +

            '<div class="mt-5 rounded-xl bg-brand-50/70 border border-brand-100 p-3.5 flex items-start gap-2.5">' +
              '<span class="text-brand-600 mt-0.5">' + U.icon('lightbulb', 'w-4 h-4') + '</span>' +
              '<p class="text-[11.5px] text-brand-900/70 leading-5">Gunakan skenario 10–20% untuk promo musiman. Cek batas diskon di bawah agar tidak menjual di bawah biaya.</p>' +
            '</div>' +
          '</div>' +

          '<div id="promo-results">' + Views.promoResults() + '</div>' +
        '</div>' +

        '<div id="promo-limit">' + Views.promoLimit() + '</div>' +
      '</div>'
    );
  };

  Views.promoApply = function (value) {
    const state = App.ui.promo;
    if (!state) return;
    state.discount = U.clamp(U.toNum(value), 0, 90);

    const label = document.getElementById('promo-discount-label');
    if (label) label.textContent = U.pct(state.discount, 0);

    const range = document.querySelector('[data-discount-range]');
    if (range) range.value = state.discount;

    document.querySelectorAll('[data-discount-chip]').forEach((chip) => {
      const active = Number(chip.getAttribute('data-discount-chip')) === Number(state.discount);
      chip.classList.toggle('chip-active', active);
    });

    const box = document.getElementById('promo-results');
    if (box) box.innerHTML = Views.promoResults();
    U.refreshIcons();
  };

  Views.promoUpdateLimit = function () {
    const box = document.getElementById('promo-limit');
    if (!box) return;
    box.innerHTML = Views.promoLimit();
    U.refreshIcons();
  };

  Views.savePromo = function () {
    const state = App.ui.promo;
    if (!state) return;
    const p = App.data.products.find((x) => x.id === state.productId);
    if (!p) return;

    const sim = Calc.discount(p, state.discount);
    if (App.data.user.premium || App.data.history.length < UI.LIMITS.history) {
      App.data.history.unshift({
        id: U.uid('h'),
        type: 'promo',
        productId: p.id,
        productName: p.name,
        price: sim.newPrice,
        profit: sim.profit,
        margin: sim.margin,
        discount: sim.discount,
        createdAt: new Date().toISOString()
      });
      App.save();
      U.toast('Simulasi promo disimpan ke riwayat.');
      App.refresh();
    } else {
      U.toast('Riwayat paket gratis sudah penuh (10). Upgrade untuk riwayat tanpa batas.', 'error');
    }
  };
})();
