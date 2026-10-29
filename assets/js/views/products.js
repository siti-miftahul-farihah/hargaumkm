/* HargaUMKM — product management */
window.Views = window.Views || {};

(function () {
  const tone = (m) => {
    if (m >= 30) return { label: 'Sehat', cls: 'badge-green' };
    if (m >= 15) return { label: 'Cukup', cls: 'badge-amber' };
    return { label: 'Tipis', cls: 'badge-red' };
  };

  const iconBtn = (action, id, iconName, label, extra) =>
    '<button class="icon-btn !w-8 !h-8 ' + (extra || '') + '" data-action="' + action + '" data-id="' + U.esc(id) + '" title="' + label + '" aria-label="' + label + '">' +
      U.icon(iconName, 'w-4 h-4') +
    '</button>';

  Views.products = function () {
    const data = App.data;
    const products = data.products.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
    const premium = data.user.premium;
    const atLimit = !premium && products.length >= UI.LIMITS.products;

    const header =
      '<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">' +
        '<div>' +
          '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">Produk Saya</h1>' +
          '<p class="mt-1 text-[12.5px] text-slate-500">Semua produk yang sudah Anda hitung dan simpan.</p>' +
        '</div>' +
        '<a href="#/app/kalkulator" class="btn btn-primary">' + U.icon('plus', 'w-4 h-4') + 'Tambah Produk</a>' +
      '</div>';

    if (!products.length) {
      return (
        '<div class="space-y-6">' + header +
          UI.empty({
            icon: 'package-plus',
            title: 'Produk Anda masih kosong',
            description: 'Mulai dengan menghitung harga jual. Setelah disimpan, produk akan muncul di sini lengkap dengan rincian biaya dan margin.',
            actionHtml: '<a href="#/app/kalkulator" class="btn btn-primary">' + U.icon('calculator', 'w-4 h-4') + 'Hitung Produk Pertama</a>'
          }) +
        '</div>'
      );
    }

    const rows = products.map((p) => {
      const t = tone(Number(p.margin) || 0);
      return (
        '<tr data-product-row data-name="' + U.esc(String(p.name).toLowerCase()) + '" data-category="' + U.esc(p.category || '') + '">' +
          '<td>' +
            '<div class="flex items-center gap-3">' +
              '<span class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 grid place-items-center shrink-0">' + U.icon('package', 'w-4 h-4') + '</span>' +
              '<div class="min-w-0"><p class="font-semibold text-slate-800 truncate max-w-[210px]">' + U.esc(p.name) + '</p>' +
              '<p class="text-[11px] text-slate-400">' + U.esc(p.category || 'Tanpa kategori') + ' · ' + U.dateShort(p.createdAt) + '</p></div>' +
            '</div>' +
          '</td>' +
          '<td class="num font-semibold text-slate-800">' + U.rupiah(p.price) + '</td>' +
          '<td class="num font-semibold text-emerald-600">' + U.rupiah(p.profit) + '</td>' +
          '<td><span class="badge ' + t.cls + '">' + U.pct(p.margin) + '</span></td>' +
          '<td class="num text-slate-500">' + U.rupiah(p.totalCost) + '</td>' +
          '<td class="!text-right">' +
            '<div class="row-actions inline-flex items-center gap-0.5">' +
              iconBtn('view-product', p.id, 'eye', 'Lihat detail') +
              iconBtn('edit-product', p.id, 'pencil', 'Edit produk') +
              iconBtn('delete-product', p.id, 'trash-2', 'Hapus produk', 'hover:!text-red-600 hover:!bg-red-50') +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    const cards = products.map((p) => {
      const t = tone(Number(p.margin) || 0);
      return (
        '<div data-product-row data-name="' + U.esc(String(p.name).toLowerCase()) + '" data-category="' + U.esc(p.category || '') + '" class="card p-4">' +
          '<div class="flex items-start gap-3">' +
            '<span class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 grid place-items-center shrink-0">' + U.icon('package', 'w-5 h-5') + '</span>' +
            '<div class="min-w-0 flex-1">' +
              '<p class="font-semibold text-slate-800 truncate">' + U.esc(p.name) + '</p>' +
              '<p class="text-[11px] text-slate-400">' + U.esc(p.category || 'Tanpa kategori') + ' · ' + U.dateShort(p.createdAt) + '</p>' +
            '</div>' +
            '<span class="badge ' + t.cls + '">' + U.pct(p.margin) + '</span>' +
          '</div>' +
          '<div class="mt-3.5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50/80 p-3">' +
            '<div><p class="text-[10px] text-slate-400">Harga jual</p><p class="text-[13px] font-bold text-slate-800 num mt-0.5">' + U.rupiah(p.price) + '</p></div>' +
            '<div><p class="text-[10px] text-slate-400">Keuntungan</p><p class="text-[13px] font-bold text-emerald-600 num mt-0.5">' + U.rupiah(p.profit) + '</p></div>' +
          '</div>' +
          '<div class="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2.5">' +
            '<button class="btn btn-ghost !py-1.5 !px-2.5 !text-[11.5px]" data-action="view-product" data-id="' + p.id + '">' + U.icon('eye', 'w-3.5 h-3.5') + 'Detail</button>' +
            '<button class="btn btn-ghost !py-1.5 !px-2.5 !text-[11.5px]" data-action="edit-product" data-id="' + p.id + '">' + U.icon('pencil', 'w-3.5 h-3.5') + 'Edit</button>' +
            '<button class="btn btn-ghost !py-1.5 !px-2.5 !text-[11.5px] hover:!text-red-600 hover:!bg-red-50" data-action="delete-product" data-id="' + p.id + '">' + U.icon('trash-2', 'w-3.5 h-3.5') + 'Hapus</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="space-y-5">' + header +
        (atLimit
          ? '<div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">' +
              '<span class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 grid place-items-center shrink-0">' + U.icon('triangle-alert', 'w-4 h-4') + '</span>' +
              '<p class="text-[12.5px] text-amber-900 leading-5 flex-1">Anda sudah menyimpan ' + products.length + '/' + UI.LIMITS.products + ' produk di paket gratis. Upgrade untuk menyimpan tanpa batas.</p>' +
              '<button data-action="open-upgrade" class="btn btn-primary !py-1.5 !text-[12px] shrink-0">Upgrade Premium</button>' +
            '</div>'
          : '') +

        '<div class="card overflow-hidden">' +
          '<div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center">' +
            '<div class="relative flex-1 max-w-md">' +
              '<span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">' + U.icon('search', 'w-4 h-4') + '</span>' +
              '<input id="product-search" class="input !pl-9" type="search" placeholder="Cari nama produk..." data-product-search autocomplete="off">' +
            '</div>' +
            '<div class="flex items-center gap-2 sm:ml-auto">' +
              '<select id="product-category" class="input !w-auto min-w-[150px]" data-product-category aria-label="Filter kategori">' +
                '<option value="all">Semua kategori</option>' +
                categories.map((c) => '<option value="' + U.esc(c) + '">' + U.esc(c) + '</option>').join('') +
              '</select>' +
              '<span id="product-count" class="text-[11.5px] text-slate-400 whitespace-nowrap">' + products.length + ' produk</span>' +
            '</div>' +
          '</div>' +

          '<div class="hidden md:block overflow-x-auto">' +
            '<table class="tbl min-w-[760px]">' +
              '<thead><tr><th>Produk</th><th>Harga Jual</th><th>Keuntungan</th><th>Margin</th><th>Total Biaya</th><th class="!text-right">Aksi</th></tr></thead>' +
              '<tbody id="product-rows">' + rows + '</tbody>' +
            '</table>' +
          '</div>' +
          '<div id="product-cards" class="md:hidden p-4 space-y-3">' + cards + '</div>' +

          '<div id="product-no-match" class="hidden p-10 text-center">' +
            '<div class="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 grid place-items-center mx-auto">' + U.icon('search-x', 'w-5 h-5') + '</div>' +
            '<p class="mt-3 text-[13px] font-semibold text-slate-600">Produk tidak ditemukan</p>' +
            '<p class="text-[12px] text-slate-400 mt-1">Coba kata kunci atau kategori lain.</p>' +
          '</div>' +
        '</div>' +

        '<p class="text-[11px] text-slate-400 leading-5">Harga dan keuntungan dihitung per unit. Klik detail untuk melihat rincian seluruh biaya.</p>' +
      '</div>'
    );
  };

  Views.filterProducts = function () {
    const q = (document.getElementById('product-search') || {}).value || '';
    const cat = (document.getElementById('product-category') || {}).value || 'all';
    const needle = q.toLowerCase().trim();

    document.querySelectorAll('[data-product-row]').forEach((row) => {
      const matchName = !needle || (row.getAttribute('data-name') || '').indexOf(needle) !== -1;
      const matchCat = cat === 'all' || row.getAttribute('data-category') === cat;
      row.classList.toggle('hidden', !(matchName && matchCat));
    });

    /* Tabel desktop dan kartu mobile memuat produk yang sama — hitung satu per produk. */
    const visible = Array.from(document.querySelectorAll('tr[data-product-row]'))
      .filter((row) => !row.classList.contains('hidden')).length;

    const noMatch = document.getElementById('product-no-match');
    if (noMatch) noMatch.classList.toggle('hidden', visible !== 0);
    const count = document.getElementById('product-count');
    if (count) count.textContent = visible + ' produk';
  };

  Views.productModal = function (id) {
    const p = App.data.products.find((x) => x.id === id);
    if (!p) return U.toast('Produk tidak ditemukan.', 'error');

    const t = tone(Number(p.margin) || 0);
    const commissionLabel = p.commissionType === 'nominal'
      ? 'Komisi marketplace'
      : 'Komisi marketplace (' + U.pct(p.commissionValue, 1) + ')';
    const targetLabel = p.targetType === 'nominal'
      ? 'Target keuntungan ' + U.rupiah(p.targetValue)
      : 'Target margin ' + U.pct(p.targetValue);

    const row = (label, value, cls) =>
      '<div class="flex items-center justify-between gap-3 py-2">' +
        '<span class="text-[12.5px] text-slate-500">' + label + '</span>' +
        '<span class="text-[12.5px] font-semibold num ' + (cls || 'text-slate-700') + '">' + value + '</span>' +
      '</div>';

    U.openModal(
      '<div class="p-6 sm:p-7">' +
        '<div class="flex items-start justify-between gap-4">' +
          '<div class="flex items-start gap-3 min-w-0">' +
            '<span class="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center shrink-0">' + U.icon('package', 'w-5 h-5') + '</span>' +
            '<div class="min-w-0">' +
              '<p class="text-[10px] font-bold tracking-[0.1em] text-slate-400">DETAIL PRODUK</p>' +
              '<h3 class="text-lg font-bold tracking-tight text-slate-900 truncate">' + U.esc(p.name) + '</h3>' +
              '<p class="text-[11.5px] text-slate-400 mt-0.5">' + U.esc(p.category || 'Tanpa kategori') + ' · disimpan ' + U.dateShort(p.createdAt) + '</p>' +
            '</div>' +
          '</div>' +
          '<button class="icon-btn !w-9 !h-9" data-action="close-modal" aria-label="Tutup">' + U.icon('x', 'w-4 h-4') + '</button>' +
        '</div>' +

        '<div class="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-end justify-between gap-3">' +
          '<div>' +
            '<p class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">Harga jual</p>' +
            '<p class="text-[28px] font-extrabold tracking-tight text-slate-900 num leading-none mt-1">' + U.rupiah(p.price) + '</p>' +
            '<p class="text-[11.5px] text-slate-400 mt-1">' + targetLabel + '</p>' +
          '</div>' +
          '<span class="badge ' + t.cls + '">' + t.label + ' · ' + U.pct(p.margin) + '</span>' +
        '</div>' +

        '<div class="mt-5">' +
          '<p class="text-[10.5px] font-bold tracking-[0.08em] text-slate-400 mb-1">RINCIAN BIAYA</p>' +
          '<div class="divide-y divide-slate-100">' +
            row('Modal produk', U.rupiah(p.modal)) +
            row('Biaya kemasan', U.rupiah(p.packaging)) +
            row('Biaya operasional', U.rupiah(p.operational)) +
            row('Ongkos kirim', U.rupiah(p.shipping)) +
            row(commissionLabel, U.rupiah(p.commission)) +
          '</div>' +
          '<div class="mt-1 pt-2 border-t border-slate-200 flex items-center justify-between">' +
            '<span class="text-[12.5px] font-semibold text-slate-700">Total biaya</span>' +
            '<span class="text-[13px] font-bold text-slate-900 num">' + U.rupiah(p.totalCost) + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="mt-4 grid grid-cols-2 gap-3">' +
          '<div class="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3.5">' +
            '<p class="text-[10.5px] text-emerald-700/70">Keuntungan bersih</p>' +
            '<p class="text-[16px] font-extrabold text-emerald-700 num mt-0.5">' + U.rupiah(p.profit) + '</p>' +
          '</div>' +
          '<div class="rounded-xl bg-white border border-slate-200 p-3.5">' +
            '<p class="text-[10.5px] text-slate-400">Margin</p>' +
            '<p class="text-[16px] font-extrabold text-slate-800 num mt-0.5">' + U.pct(p.margin) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="mt-6 flex flex-col sm:flex-row gap-2.5">' +
          '<button class="btn btn-secondary flex-1" data-action="delete-product" data-id="' + p.id + '">' + U.icon('trash-2', 'w-4 h-4') + 'Hapus</button>' +
          '<button class="btn btn-primary flex-1" data-action="edit-product" data-id="' + p.id + '">' + U.icon('pencil', 'w-4 h-4') + 'Edit Produk</button>' +
        '</div>' +
      '</div>',
      { label: 'Detail Produk', size: 'max-w-xl' }
    );
  };

  Views.deleteProduct = function (id) {
    const p = App.data.products.find((x) => x.id === id);
    if (!p) return;
    U.closeModal();
    U.confirm({
      title: 'Hapus produk?',
      message: 'Produk "' + p.name + '" akan dihapus dari daftar. Riwayat simulasi yang sudah ada tetap tersimpan.',
      confirmText: 'Hapus produk',
      onConfirm: function () {
        App.data.products = App.data.products.filter((x) => x.id !== id);
        App.save();
        App.refresh();
        U.toast('Produk berhasil dihapus.');
      }
    });
  };
})();
