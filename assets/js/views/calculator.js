/* HargaUMKM — core calculator */
window.Views = window.Views || {};

(function () {
  const CATEGORIES = ['Fashion', 'Makanan & Minuman', 'Kriya', 'Kecantikan', 'Elektronik', 'Rumah Tangga', 'Jasa', 'Lainnya'];

  Views.blankDraft = function () {
    return {
      editId: null,
      name: '',
      category: '',
      modal: '',
      packaging: '',
      operational: '',
      shipping: '',
      commissionType: 'percent',
      commissionValue: '0',
      targetType: 'percent',
      targetValue: '30',
      roundTo: '500'
    };
  };

  Views.draftFromProduct = function (p) {
    return {
      editId: p.id,
      name: p.name || '',
      category: p.category || '',
      modal: String(p.modal == null ? '' : p.modal),
      packaging: String(p.packaging == null ? '' : p.packaging),
      operational: String(p.operational == null ? '' : p.operational),
      shipping: String(p.shipping == null ? '' : p.shipping),
      commissionType: p.commissionType || 'percent',
      commissionValue: String(p.commissionValue == null ? 0 : p.commissionValue),
      targetType: p.targetType || 'percent',
      targetValue: String(p.targetValue == null ? 30 : p.targetValue),
      roundTo: String(p.roundTo == null ? 500 : p.roundTo)
    };
  };

  const segment = (kind, options, current) =>
    '<div class="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">' +
      options.map(([value, label]) =>
        '<button type="button" data-action="calc-type" data-kind="' + kind + '" data-value="' + value + '" ' +
          'class="rounded-lg py-1.5 text-[12px] font-semibold transition ' +
          (current === value ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700') + '">' +
          label +
        '</button>'
      ).join('') +
    '</div>';

  const moneyField = (field, label, value, opts) => {
    const o = opts || {};
    return (
      '<div>' +
        '<label class="label" for="calc-' + field + '">' + label +
          (o.optional ? ' <span class="optional">(opsional)</span>' : '') +
        '</label>' +
        '<div class="input-wrap"><span class="prefix">Rp</span>' +
          '<input id="calc-' + field + '" class="input no-spin" type="number" min="0" step="500" inputmode="numeric" ' +
            'data-calc-field="' + field + '" value="' + U.esc(value) + '" placeholder="0">' +
        '</div>' +
        (o.hint ? '<p class="hint">' + o.hint + '</p>' : '') +
      '</div>'
    );
  };

  Views.calcResult = function () {
    const d = App.ui.calc || Views.blankDraft();
    const res = Calc.price(d);
    const editing = !!d.editId;
    const commissionSuffix = d.commissionType === 'nominal' ? 'Rp' : '%';
    const targetSuffix = d.targetType === 'nominal' ? 'Rp' : '%';

    if (res.error) {
      return (
        '<div class="rounded-2xl border border-slate-200 bg-white p-6">' +
          '<div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">' + U.icon('calculator', 'w-5 h-5') + '</div>' +
          '<h3 class="mt-4 text-[15px] font-bold text-slate-900">Hasil muncul di sini</h3>' +
          '<p class="mt-1.5 text-[12.5px] text-slate-500 leading-6">' + U.esc(res.error) + '</p>' +
          '<div class="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-[11.5px] text-slate-400 leading-5">' +
            'Isi modal produk terlebih dahulu. Biaya lain boleh dikosongkan jika belum ada.' +
          '</div>' +
          '<div class="mt-4 flex items-center justify-between text-[11px] text-slate-400">' +
            '<span>Komisi</span><span id="calc-side-commission" class="font-semibold">' + commissionSuffix + '</span>' +
          '</div>' +
        '</div>'
      );
    }

    const rawNote = res.roundTo > 0 && Math.ceil(res.rawPrice) !== res.price
      ? 'Dibulatkan ke atas dari ' + U.rupiah(Math.ceil(res.rawPrice)) + ' ke kelipatan ' + U.rupiah(res.roundTo)
      : 'Perhitungan presisi tanpa pembulatan tambahan';

    return (
      '<div class="card overflow-hidden">' +
        '<div class="relative bg-ink p-5 sm:p-6 text-white overflow-hidden">' +
          '<div class="absolute inset-0 auth-grid opacity-40"></div>' +
          '<div class="absolute -right-10 -top-16 w-44 h-44 rounded-full bg-brand-500/25 blur-2xl"></div>' +
          '<div class="relative">' +
            '<div class="flex items-center justify-between gap-3">' +
              '<p class="text-[10.5px] font-bold tracking-[0.12em] text-blue-200/70">HARGA JUAL IDEAL</p>' +
              '<span class="badge ' + (res.achieved ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300') + '">' +
                U.icon(res.achieved ? 'circle-check' : 'triangle-alert', 'w-3 h-3') +
                (res.achieved ? 'Target tercapai' : 'Target belum tercapai') +
              '</span>' +
            '</div>' +
            '<p id="calc-price" class="mt-2 text-[36px] sm:text-[40px] font-extrabold tracking-tight num leading-none">' + U.rupiah(res.price) + '</p>' +
            '<p class="mt-2 text-[11px] text-blue-200/60">' + rawNote + '</p>' +
            '<div class="mt-5 grid grid-cols-2 gap-3">' +
              '<div class="rounded-xl bg-white/[0.07] border border-white/10 p-3">' +
                '<p class="text-[10px] text-blue-200/60">Keuntungan bersih</p>' +
                '<p id="calc-profit" class="text-[15px] font-bold text-emerald-300 num mt-0.5">' + U.rupiah(res.profit) + '</p>' +
              '</div>' +
              '<div class="rounded-xl bg-white/[0.07] border border-white/10 p-3">' +
                '<p class="text-[10px] text-blue-200/60">Margin</p>' +
                '<p id="calc-margin" class="text-[15px] font-bold num mt-0.5">' + U.pct(res.margin) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="p-5 sm:p-6">' +
          '<div class="space-y-1.5 text-[12.5px]">' +
            '<div class="flex justify-between gap-3"><span class="text-slate-500">Total biaya</span><span id="calc-total" class="font-semibold text-slate-800 num">' + U.rupiah(res.totalCost) + '</span></div>' +
            '<div class="flex justify-between gap-3"><span class="text-slate-500">Komisi marketplace</span><span id="calc-commission-total" class="font-semibold text-slate-800 num">' + U.rupiah(res.commission) + '</span></div>' +
            '<div class="flex justify-between gap-3"><span class="text-slate-500">Biaya tetap</span><span id="calc-fixed" class="font-semibold text-slate-800 num">' + U.rupiah(res.costBase) + '</span></div>' +
          '</div>' +

          '<details class="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5">' +
            '<summary class="flex items-center justify-between cursor-pointer list-none text-[11.5px] font-semibold text-slate-600">' +
              'Rincian biaya' + U.icon('chevron-down', 'w-3.5 h-3.5 text-slate-400') +
            '</summary>' +
            '<div class="mt-2.5 pt-2.5 border-t border-slate-200/70 space-y-1.5 text-[11.5px]">' +
              '<div class="flex justify-between"><span class="text-slate-400">Modal</span><span class="text-slate-600 num">' + U.rupiah(d.modal) + '</span></div>' +
              '<div class="flex justify-between"><span class="text-slate-400">Kemasan</span><span class="text-slate-600 num">' + U.rupiah(d.packaging) + '</span></div>' +
              '<div class="flex justify-between"><span class="text-slate-400">Operasional</span><span class="text-slate-600 num">' + U.rupiah(d.operational) + '</span></div>' +
              '<div class="flex justify-between"><span class="text-slate-400">Ongkir</span><span class="text-slate-600 num">' + U.rupiah(d.shipping) + '</span></div>' +
            '</div>' +
          '</details>' +

          '<div class="mt-5 space-y-2">' +
            '<button type="button" class="btn btn-primary btn-block" data-action="save-product">' +
              U.icon(editing ? 'save' : 'plus', 'w-4 h-4') + (editing ? 'Simpan Perubahan' : 'Simpan Produk') +
            '</button>' +
            '<a href="#/app/produk" class="btn btn-secondary btn-block">Lihat Produk</a>' +
            (editing
              ? '<a href="#/app/produk" class="btn btn-ghost btn-block !text-[12px] !text-slate-400">Batalkan edit</a>'
              : '') +
          '</div>' +
          '<p class="mt-3 text-[10.5px] text-slate-400 leading-4 text-center">Harga dan keuntungan dihitung per unit.</p>' +
        '</div>' +
      '</div>'
    );
  };

  Views.calculator = function () {
    const editId = App.route.params[0] || null;
    const existing = editId ? App.data.products.find((p) => p.id === editId) : null;

    if (!App.ui.calc || App.ui.calc.editId !== editId) {
      App.ui.calc = existing ? Views.draftFromProduct(existing) : Views.blankDraft();
    }

    const d = App.ui.calc;
    const editing = !!d.editId;
    const premium = App.data.user.premium;
    const atLimit = !premium && !editing && App.data.products.length >= UI.LIMITS.products;

    return (
      '<div class="space-y-5">' +
        '<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">' +
          '<div>' +
            '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">' +
              (editing ? 'Edit Produk' : 'Hitung Harga Jual') +
            '</h1>' +
            '<p class="mt-1 text-[12.5px] text-slate-500">' +
              (editing ? 'Perbarui biaya atau target, lalu simpan perubahannya.' : 'Masukkan semua biaya dan target keuntungan. Hasilnya langsung terlihat.') +
            '</p>' +
          '</div>' +
          (editing
            ? '<span class="badge badge-blue self-start sm:self-auto">Mode edit</span>'
            : '<a href="#/app/produk" class="btn btn-secondary self-start sm:self-auto">' + U.icon('package', 'w-4 h-4') + 'Produk Saya</a>') +
        '</div>' +

        (atLimit
          ? '<div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">' +
              '<span class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 grid place-items-center shrink-0">' + U.icon('triangle-alert', 'w-4 h-4') + '</span>' +
              '<p class="text-[12.5px] text-amber-900 leading-5 flex-1">Anda sudah menyimpan ' + App.data.products.length + '/' + UI.LIMITS.products + ' produk di paket gratis. Upgrade untuk menyimpan produk baru tanpa batas.</p>' +
              '<button data-action="open-upgrade" class="btn btn-primary !py-1.5 !text-[12px] shrink-0">Upgrade</button>' +
            '</div>'
          : '') +

        '<div class="grid lg:grid-cols-[1.12fr_.88fr] gap-5 items-start">' +
          '<form data-form="calc" novalidate class="card p-5 sm:p-6 space-y-6">' +
            '<section>' +
              '<div class="flex items-center gap-2.5 mb-4">' +
                '<span class="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 grid place-items-center text-[11px] font-bold">1</span>' +
                '<h2 class="text-[13.5px] font-bold text-slate-900">Informasi produk</h2>' +
              '</div>' +
              '<div class="grid sm:grid-cols-2 gap-4">' +
                '<div class="sm:col-span-2">' +
                  '<label class="label" for="calc-name">Nama produk <span class="text-red-500">*</span></label>' +
                  '<input id="calc-name" class="input" type="text" data-calc-field="name" value="' + U.esc(d.name) + '" placeholder="Contoh: Kaos Polos Premium" autocomplete="off">' +
                '</div>' +
                '<div class="sm:col-span-2">' +
                  '<label class="label" for="calc-category">Kategori <span class="optional">(opsional)</span></label>' +
                  '<select id="calc-category" class="input" data-calc-field="category">' +
                    '<option value="">Pilih kategori</option>' +
                    CATEGORIES.map((c) => '<option value="' + c + '"' + (d.category === c ? ' selected' : '') + '>' + c + '</option>').join('') +
                  '</select>' +
                '</div>' +
              '</div>' +
            '</section>' +

            '<div class="divider"></div>' +

            '<section>' +
              '<div class="flex items-center gap-2.5 mb-4">' +
                '<span class="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 grid place-items-center text-[11px] font-bold">2</span>' +
                '<h2 class="text-[13.5px] font-bold text-slate-900">Rincian biaya</h2>' +
              '</div>' +
              '<div class="grid sm:grid-cols-2 gap-4">' +
                moneyField('modal', 'Modal produk', d.modal) +
                moneyField('packaging', 'Biaya kemasan', d.packaging, { optional: true }) +
                moneyField('operational', 'Biaya operasional', d.operational, { optional: true, hint: 'Listrik, tenaga kerja, atau biaya produksi lain per unit.' }) +
                moneyField('shipping', 'Ongkir', d.shipping, { optional: true, hint: 'Isi jika Anda menanggung ongkir.' }) +
              '</div>' +
            '</section>' +

            '<div class="divider"></div>' +

            '<section>' +
              '<div class="flex items-center gap-2.5 mb-4">' +
                '<span class="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 grid place-items-center text-[11px] font-bold">3</span>' +
                '<h2 class="text-[13.5px] font-bold text-slate-900">Komisi marketplace</h2>' +
              '</div>' +
              '<div class="grid sm:grid-cols-2 gap-4">' +
                '<div>' +
                  '<span class="label">Jenis komisi</span>' +
                  segment('commissionType', [['percent', 'Persen (%)'], ['nominal', 'Nominal (Rp)']], d.commissionType) +
                '</div>' +
                '<div>' +
                  '<label class="label" for="calc-commission">Nilai komisi</label>' +
                  '<div class="input-wrap">' +
                    '<input id="calc-commission" class="input has-suffix no-spin" type="number" min="0" step="0.1" inputmode="decimal" data-calc-field="commissionValue" value="' + U.esc(d.commissionValue) + '">' +
                    '<span class="suffix" id="commission-suffix">' + (d.commissionType === 'nominal' ? 'Rp' : '%') + '</span>' +
                  '</div>' +
                  '<p class="hint">Komisi dihitung dari harga jual final.</p>' +
                '</div>' +
              '</div>' +
            '</section>' +

            '<div class="divider"></div>' +

            '<section>' +
              '<div class="flex items-center gap-2.5 mb-4">' +
                '<span class="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 grid place-items-center text-[11px] font-bold">4</span>' +
                '<h2 class="text-[13.5px] font-bold text-slate-900">Target keuntungan</h2>' +
              '</div>' +
              '<div class="grid sm:grid-cols-2 gap-4">' +
                '<div>' +
                  '<span class="label">Jenis target</span>' +
                  segment('targetType', [['percent', 'Margin (%)'], ['nominal', 'Nominal (Rp)']], d.targetType) +
                '</div>' +
                '<div>' +
                  '<label class="label" for="calc-target">Nilai target</label>' +
                  '<div class="input-wrap">' +
                    '<input id="calc-target" class="input has-suffix no-spin" type="number" min="0" step="1" inputmode="decimal" data-calc-field="targetValue" value="' + U.esc(d.targetValue) + '">' +
                    '<span class="suffix" id="target-suffix">' + (d.targetType === 'nominal' ? 'Rp' : '%') + '</span>' +
                  '</div>' +
                  '<p class="hint">Margin dihitung dari harga jual.</p>' +
                '</div>' +
                '<div class="sm:col-span-2">' +
                  '<label class="label" for="calc-round">Pembulatan harga</label>' +
                  '<select id="calc-round" class="input" data-calc-field="roundTo">' +
                    [['0', 'Tanpa pembulatan'], ['500', 'Ke atas kelipatan Rp 500'], ['1000', 'Ke atas kelipatan Rp 1.000'], ['5000', 'Ke atas kelipatan Rp 5.000']]
                      .map(([v, l]) => '<option value="' + v + '"' + (String(d.roundTo) === v ? ' selected' : '') + '>' + l + '</option>').join('') +
                  '</select>' +
                '</div>' +
              '</div>' +
            '</section>' +

            '<div class="rounded-xl bg-slate-50 border border-slate-100 p-3.5 flex items-start gap-2.5">' +
              '<span class="text-slate-400 mt-0.5">' + U.icon('info', 'w-4 h-4') + '</span>' +
              '<p class="text-[11.5px] text-slate-500 leading-5">Rumus: harga jual = biaya tetap ÷ (1 − margin − komisi). Biaya tetap mencakup modal, kemasan, operasional, dan ongkir.</p>' +
            '</div>' +
          '</form>' +

          '<div class="lg:sticky lg:top-24" id="calc-result">' + Views.calcResult() + '</div>' +
        '</div>' +
      '</div>'
    );
  };

  Views.calcUpdate = function () {
    const box = document.getElementById('calc-result');
    if (!box) return;
    box.innerHTML = Views.calcResult();
    U.refreshIcons();

    const cSuffix = document.getElementById('commission-suffix');
    const tSuffix = document.getElementById('target-suffix');
    const d = App.ui.calc;
    if (cSuffix) cSuffix.textContent = d.commissionType === 'nominal' ? 'Rp' : '%';
    if (tSuffix) tSuffix.textContent = d.targetType === 'nominal' ? 'Rp' : '%';
  };

  Views.setCalcType = function (kind, value) {
    const d = App.ui.calc;
    if (!d) return;
    if (kind === 'commissionType') d.commissionType = value === 'nominal' ? 'nominal' : 'percent';
    if (kind === 'targetType') d.targetType = value === 'nominal' ? 'nominal' : 'percent';
    App.refresh();
  };

  Views.saveProduct = function () {
    const d = App.ui.calc;
    if (!d) return;

    if (!String(d.name || '').trim()) {
      U.toast('Nama produk wajib diisi.', 'error');
      const input = document.getElementById('calc-name');
      if (input) input.focus();
      return;
    }

    const res = Calc.price(d);
    if (res.error) {
      U.toast(res.error, 'error');
      return;
    }

    const premium = App.data.user.premium;
    if (!d.editId && !premium && App.data.products.length >= UI.LIMITS.products) {
      UI.upgradeModal('Batas ' + UI.LIMITS.products + ' produk pada paket gratis sudah tercapai. Upgrade Premium untuk menyimpan produk baru tanpa batas.');
      return;
    }

    const payload = {
      name: String(d.name).trim(),
      category: d.category || '',
      modal: U.toNum(d.modal),
      packaging: U.toNum(d.packaging),
      operational: U.toNum(d.operational),
      shipping: U.toNum(d.shipping),
      commissionType: d.commissionType,
      commissionValue: U.toNum(d.commissionValue),
      targetType: d.targetType,
      targetValue: U.toNum(d.targetValue),
      roundTo: U.toNum(d.roundTo),
      price: res.price,
      costBase: res.costBase,
      commission: res.commission,
      totalCost: res.totalCost,
      profit: res.profit,
      margin: res.margin
    };

    let savedId = d.editId;
    if (d.editId) {
      const idx = App.data.products.findIndex((p) => p.id === d.editId);
      if (idx >= 0) {
        payload.id = d.editId;
        payload.createdAt = App.data.products[idx].createdAt;
        App.data.products[idx] = payload;
      }
    } else {
      payload.id = U.uid('p');
      payload.createdAt = new Date().toISOString();
      App.data.products.unshift(payload);
      savedId = payload.id;
    }

    if (premium || App.data.history.length < UI.LIMITS.history) {
      App.data.history.unshift({
        id: U.uid('h'),
        type: 'kalkulasi',
        productId: savedId,
        productName: payload.name,
        price: res.price,
        profit: res.profit,
        margin: res.margin,
        discount: null,
        createdAt: new Date().toISOString()
      });
    }

    App.save();
    App.ui.calc = null;
    U.toast(d.editId ? 'Perubahan produk berhasil disimpan.' : 'Produk berhasil disimpan.');
    if (location.hash === '#/app/produk') App.refresh();
    else location.hash = '#/app/produk';
  };
})();
