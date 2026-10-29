/* HargaUMKM — simulation history */
window.Views = window.Views || {};

(function () {
  const typeMeta = (type) =>
    type === 'promo'
      ? { label: 'Simulasi promo', icon: 'percent', cls: 'badge-blue', tile: 'bg-brand-50 text-brand-600' }
      : { label: 'Kalkulasi harga', icon: 'calculator', cls: 'badge-slate', tile: 'bg-slate-100 text-slate-500' };

  Views.history = function () {
    const data = App.data;
    const premium = data.user.premium;
    const filter = App.ui.historyFilter || 'all';
    const all = data.history.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const items = filter === 'all' ? all : all.filter((h) => h.type === filter);
    const promoCount = all.filter((h) => h.type === 'promo').length;

    const chips = [
      ['all', 'Semua', all.length],
      ['kalkulasi', 'Kalkulasi', all.length - promoCount],
      ['promo', 'Promo', promoCount]
    ].map(([value, label, count]) =>
      '<button class="chip ' + (filter === value ? 'chip-active' : '') + '" data-action="history-filter" data-value="' + value + '">' +
        label + ' <span class="text-[10px] ' + (filter === value ? 'text-brand-500' : 'text-slate-400') + ' num">' + count + '</span>' +
      '</button>'
    ).join('');

    const rows = items.map((h) => {
      const meta = typeMeta(h.type);
      return (
        '<tr>' +
          '<td>' +
            '<div class="flex items-center gap-3">' +
              '<span class="w-9 h-9 rounded-xl ' + meta.tile + ' grid place-items-center shrink-0">' + U.icon(meta.icon, 'w-4 h-4') + '</span>' +
              '<div class="min-w-0"><p class="font-semibold text-slate-800 truncate max-w-[200px]">' + U.esc(h.productName) + '</p>' +
              '<p class="text-[11px] text-slate-400">' + (h.type === 'promo' ? 'Diskon ' + U.pct(h.discount, 0) + ' · ' : '') + U.timeAgo(h.createdAt) + '</p></div>' +
            '</div>' +
          '</td>' +
          '<td><span class="badge ' + meta.cls + '">' + meta.label + '</span></td>' +
          '<td class="num font-semibold text-slate-700">' + U.rupiah(h.price) + '</td>' +
          '<td class="num font-semibold text-emerald-600">' + U.rupiah(h.profit) + '</td>' +
          '<td><span class="text-[12px] font-semibold ' + (h.margin >= 15 ? 'text-slate-700' : 'text-amber-600') + '">' + U.pct(h.margin) + '</span></td>' +
          '<td class="text-right">' +
            '<div class="inline-flex items-center gap-0.5">' +
              '<button class="icon-btn !w-8 !h-8" data-action="view-history" data-id="' + h.id + '" title="Lihat detail" aria-label="Lihat detail">' + U.icon('eye', 'w-4 h-4') + '</button>' +
              '<button class="icon-btn !w-8 !h-8 hover:!text-red-600 hover:!bg-red-50" data-action="delete-history" data-id="' + h.id + '" title="Hapus" aria-label="Hapus riwayat">' + U.icon('trash-2', 'w-4 h-4') + '</button>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    const cards = items.map((h) => {
      const meta = typeMeta(h.type);
      return (
        '<div class="rounded-xl border border-slate-100 p-3.5">' +
          '<div class="flex items-start gap-2.5">' +
            '<span class="w-8 h-8 rounded-lg ' + meta.tile + ' grid place-items-center shrink-0">' + U.icon(meta.icon, 'w-4 h-4') + '</span>' +
            '<div class="min-w-0 flex-1"><p class="text-[13px] font-semibold text-slate-800 truncate">' + U.esc(h.productName) + '</p>' +
              '<p class="text-[10.5px] text-slate-400">' + meta.label + ' · ' + U.timeAgo(h.createdAt) + '</p></div>' +
            '<span class="text-[12px] font-bold text-slate-700 num">' + U.pct(h.margin) + '</span>' +
          '</div>' +
          '<div class="mt-2.5 flex items-center justify-between text-[11px]">' +
            '<span class="text-slate-400">Harga <strong class="text-slate-700 num">' + U.rupiah(h.price) + '</strong></span>' +
            '<span class="text-slate-400">Untung <strong class="text-emerald-600 num">' + U.rupiah(h.profit) + '</strong></span>' +
          '</div>' +
          '<div class="mt-2.5 pt-2 border-t border-slate-100 flex justify-end gap-1">' +
            '<button class="btn btn-ghost !py-1 !px-2 !text-[11px]" data-action="view-history" data-id="' + h.id + '">' + U.icon('eye', 'w-3.5 h-3.5') + 'Detail</button>' +
            '<button class="btn btn-ghost !py-1 !px-2 !text-[11px] hover:!text-red-600 hover:!bg-red-50" data-action="delete-history" data-id="' + h.id + '">' + U.icon('trash-2', 'w-3.5 h-3.5') + 'Hapus</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="space-y-5">' +
        '<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">' +
          '<div>' +
            '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">Riwayat Simulasi</h1>' +
            '<p class="mt-1 text-[12.5px] text-slate-500">Semua kalkulasi harga dan simulasi promo yang pernah disimpan.</p>' +
          '</div>' +
          '<div class="flex gap-2 self-start sm:self-auto">' +
            (premium
              ? '<span class="badge badge-green self-center">' + U.icon('infinity', 'w-3 h-3') + 'Tanpa batas</span>'
              : '<span class="badge badge-slate self-center">' + all.length + '/' + UI.LIMITS.history + ' tersimpan</span>') +
            (all.length
              ? '<button data-action="clear-history" class="btn btn-secondary">' + U.icon('trash-2', 'w-4 h-4') + 'Bersihkan</button>'
              : '') +
          '</div>' +
        '</div>' +

        (all.length
          ? '<div class="card overflow-hidden">' +
              '<div class="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center gap-2">' + chips + '</div>' +
              (items.length
                ? '<div class="hidden md:block overflow-x-auto"><table class="tbl min-w-[760px]"><thead><tr>' +
                    '<th>Produk</th><th>Jenis</th><th>Harga</th><th>Keuntungan</th><th>Margin</th><th class="!text-right">Aksi</th>' +
                  '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
                  '<div class="md:hidden p-4 space-y-2.5">' + cards + '</div>'
                : '<div class="p-10 text-center"><div class="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 grid place-items-center mx-auto">' + U.icon('search-x', 'w-5 h-5') + '</div>' +
                    '<p class="mt-3 text-[13px] font-semibold text-slate-600">Belum ada riwayat untuk filter ini</p>' +
                    '<p class="text-[12px] text-slate-400 mt-1">Coba pilih jenis simulasi lain.</p></div>') +
            '</div>'
          : UI.empty({
              icon: 'history',
              title: 'Riwayat masih kosong',
              description: 'Setiap kali Anda menyimpan produk atau simulasi promo, catatannya muncul di sini.',
              actionHtml: '<a href="#/app/kalkulator" class="btn btn-primary">' + U.icon('calculator', 'w-4 h-4') + 'Mulai Hitung</a>'
            })) +

        (!premium
          ? '<div class="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 flex flex-col sm:flex-row sm:items-center gap-3">' +
              '<span class="w-8 h-8 rounded-lg bg-white text-brand-600 grid place-items-center shrink-0">' + U.icon('crown', 'w-4 h-4') + '</span>' +
              '<p class="text-[12px] text-brand-900/70 leading-5 flex-1">Paket gratis menyimpan maksimal ' + UI.LIMITS.history + ' riwayat. Premium membuka riwayat tanpa batas.</p>' +
              '<button data-action="open-upgrade" class="btn btn-primary !py-1.5 !text-[12px] shrink-0">Upgrade</button>' +
            '</div>'
          : '') +
      '</div>'
    );
  };

  Views.historyFilter = function (value) {
    App.ui.historyFilter = value === 'promo' || value === 'kalkulasi' ? value : 'all';
    App.refresh();
  };

  Views.historyModal = function (id) {
    const h = App.data.history.find((x) => x.id === id);
    if (!h) return;
    const meta = typeMeta(h.type);
    const product = App.data.products.find((p) => p.id === h.productId);

    U.openModal(
      '<div class="p-6 sm:p-7">' +
        '<div class="flex items-start justify-between gap-4">' +
          '<div class="flex items-start gap-3">' +
            '<span class="w-11 h-11 rounded-2xl ' + meta.tile + ' grid place-items-center shrink-0">' + U.icon(meta.icon, 'w-5 h-5') + '</span>' +
            '<div>' +
              '<p class="text-[10px] font-bold tracking-[0.1em] text-slate-400">' + meta.label.toUpperCase() + '</p>' +
              '<h3 class="text-lg font-bold tracking-tight text-slate-900 leading-tight">' + U.esc(h.productName) + '</h3>' +
              '<p class="text-[11.5px] text-slate-400 mt-0.5">' + U.dateTime(h.createdAt) + '</p>' +
            '</div>' +
          '</div>' +
          '<button class="icon-btn !w-9 !h-9" data-action="close-modal" aria-label="Tutup">' + U.icon('x', 'w-4 h-4') + '</button>' +
        '</div>' +

        '<div class="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-4">' +
          '<p class="text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">Harga jual saat simulasi</p>' +
          '<p class="text-[28px] font-extrabold tracking-tight text-slate-900 num leading-none mt-1">' + U.rupiah(h.price) + '</p>' +
          (h.type === 'promo' ? '<p class="text-[11.5px] text-brand-600 font-semibold mt-1.5">Setelah diskon ' + U.pct(h.discount, 0) + '</p>' : '<p class="text-[11.5px] text-slate-400 mt-1.5">Kalkulasi harga jual ideal</p>') +
        '</div>' +

        '<div class="mt-4 grid grid-cols-2 gap-3">' +
          '<div class="rounded-xl border border-slate-100 p-3.5"><p class="text-[10.5px] text-slate-400">Keuntungan</p><p class="text-[15px] font-bold ' + (h.profit <= 0 ? 'text-red-600' : 'text-emerald-600') + ' num mt-0.5">' + U.rupiah(h.profit) + '</p></div>' +
          '<div class="rounded-xl border border-slate-100 p-3.5"><p class="text-[10.5px] text-slate-400">Margin</p><p class="text-[15px] font-bold text-slate-800 num mt-0.5">' + U.pct(h.margin) + '</p></div>' +
        '</div>' +

        '<div class="mt-5 flex flex-col sm:flex-row gap-2.5">' +
          (product ? '<button class="btn btn-secondary flex-1" data-action="edit-product" data-id="' + product.id + '">' + U.icon('pencil', 'w-4 h-4') + 'Buka Produk</button>' : '') +
          '<button class="btn btn-danger flex-1" data-action="delete-history" data-id="' + h.id + '">' + U.icon('trash-2', 'w-4 h-4') + 'Hapus Riwayat</button>' +
        '</div>' +
      '</div>',
      { label: 'Detail Riwayat', size: 'max-w-md' }
    );
  };

  Views.deleteHistory = function (id) {
    const h = App.data.history.find((x) => x.id === id);
    if (!h) return;
    U.closeModal();
    U.confirm({
      title: 'Hapus riwayat ini?',
      message: 'Catatan simulasi "' + h.productName + '" akan dihapus permanen dari riwayat.',
      confirmText: 'Hapus riwayat',
      onConfirm: function () {
        App.data.history = App.data.history.filter((x) => x.id !== id);
        App.save();
        App.refresh();
        U.toast('Riwayat dihapus.');
      }
    });
  };

  Views.clearHistory = function () {
    if (!App.data.history.length) return;
    U.confirm({
      title: 'Bersihkan semua riwayat?',
      message: 'Seluruh catatan kalkulasi dan simulasi promo akan dihapus. Produk yang tersimpan tidak terpengaruh.',
      confirmText: 'Bersihkan riwayat',
      onConfirm: function () {
        App.data.history = [];
        App.save();
        App.refresh();
        U.toast('Semua riwayat dibersihkan.');
      }
    });
  };
})();
