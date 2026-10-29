/* HargaUMKM — product profitability comparison (premium) */
window.Views = window.Views || {};

(function () {
  const tone = (m) => (m >= 30 ? 'bg-emerald-500' : m >= 15 ? 'bg-amber-500' : 'bg-red-500');

  Views.compare = function () {
    if (!App.data.user.premium) {
      return UI.paywall({
        feature: 'Perbandingan Harga & Keuntungan',
        description: 'Lihat produk mana yang paling menguntungkan dan mana yang perlu disesuaikan harganya.',
        benefits: [
          'Peringkat produk berdasarkan margin',
          'Perbandingan harga jual dan keuntungan',
          'Sorotan produk dengan margin tipis',
          'Rata-rata margin seluruh produk'
        ]
      });
    }

    const products = App.data.products.slice().sort((a, b) => (Number(b.margin) || 0) - (Number(a.margin) || 0));
    if (!products.length) {
      return (
        '<div class="space-y-5">' +
          '<div>' +
            '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950">Perbandingan Keuntungan</h1>' +
            '<p class="mt-1 text-[12.5px] text-slate-500">Bandingkan margin semua produk dalam satu tampilan.</p>' +
          '</div>' +
          UI.empty({
            icon: 'bar-chart-3',
            title: 'Belum ada produk untuk dibandingkan',
            description: 'Simpan minimal dua produk agar perbandingan margin terasa manfaatnya.',
            actionHtml: '<a href="#/app/kalkulator" class="btn btn-primary">' + U.icon('calculator', 'w-4 h-4') + 'Hitung Produk</a>'
          }) +
        '</div>'
      );
    }

    const avg = products.reduce((s, p) => s + (Number(p.margin) || 0), 0) / products.length;
    const best = products[0];
    const low = products.filter((p) => (Number(p.margin) || 0) < 15).length;
    const maxMargin = Math.max.apply(null, products.map((p) => Number(p.margin) || 0).concat([1]));

    const rows = products.map((p, i) => {
      const m = Number(p.margin) || 0;
      return (
        '<tr>' +
          '<td class="!w-12"><span class="w-6 h-6 rounded-lg ' + (i === 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400') + ' grid place-items-center text-[10.5px] font-bold num">' + (i + 1) + '</span></td>' +
          '<td>' +
            '<div class="flex items-center gap-2.5">' +
              '<span class="font-semibold text-slate-800 truncate max-w-[190px]">' + U.esc(p.name) + '</span>' +
              (i === 0 ? '<span class="badge badge-green">Tertinggi</span>' : '') +
            '</div>' +
            '<p class="text-[11px] text-slate-400 mt-0.5">' + U.esc(p.category || 'Tanpa kategori') + '</p>' +
          '</td>' +
          '<td class="num font-semibold text-slate-700">' + U.rupiah(p.price) + '</td>' +
          '<td class="num font-semibold text-emerald-600">' + U.rupiah(p.profit) + '</td>' +
          '<td class="!min-w-[160px]">' +
            '<div class="flex items-center justify-between text-[11px] mb-1"><span class="font-bold text-slate-700 num">' + U.pct(m) + '</span><span class="text-slate-400">' + (m >= 30 ? 'Sehat' : m >= 15 ? 'Cukup' : 'Tipis') + '</span></div>' +
            '<div class="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ' + tone(m) + '" style="width:' + Math.max(3, Math.min(100, (m / maxMargin) * 100)) + '%"></div></div>' +
          '</td>' +
          '<td class="!text-right">' +
            '<button class="icon-btn !w-8 !h-8" data-action="view-product" data-id="' + p.id + '" title="Lihat detail" aria-label="Lihat detail ' + U.esc(p.name) + '">' + U.icon('eye', 'w-4 h-4') + '</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    const cards = products.map((p, i) => {
      const m = Number(p.margin) || 0;
      return (
        '<div class="rounded-xl border border-slate-100 p-3.5">' +
          '<div class="flex items-start gap-2.5">' +
            '<span class="w-6 h-6 rounded-lg ' + (i === 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400') + ' grid place-items-center text-[10.5px] font-bold num shrink-0">' + (i + 1) + '</span>' +
            '<div class="min-w-0 flex-1"><p class="text-[13px] font-semibold text-slate-800 truncate">' + U.esc(p.name) + '</p>' +
              '<p class="text-[10.5px] text-slate-400">' + U.esc(p.category || 'Tanpa kategori') + '</p></div>' +
            '<span class="text-[12px] font-bold text-slate-700 num">' + U.pct(m) + '</span>' +
          '</div>' +
          '<div class="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ' + tone(m) + '" style="width:' + Math.max(3, Math.min(100, (m / maxMargin) * 100)) + '%"></div></div>' +
          '<div class="mt-2 flex items-center justify-between text-[10.5px] text-slate-400"><span>Untung <strong class="text-emerald-600 num">' + U.rupiah(p.profit) + '</strong></span><span class="num">' + U.rupiah(p.price) + '</span></div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="space-y-5">' +
        '<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">' +
          '<div>' +
            '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">Perbandingan Keuntungan</h1>' +
            '<p class="mt-1 text-[12.5px] text-slate-500">Urutan produk berdasarkan margin, dari yang paling menguntungkan.</p>' +
          '</div>' +
          '<a href="#/app/kalkulator" class="btn btn-primary self-start sm:self-auto">' + U.icon('plus', 'w-4 h-4') + 'Hitung Produk</a>' +
        '</div>' +

        '<div class="grid sm:grid-cols-3 gap-4">' +
          '<div class="card p-5">' +
            '<p class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">Margin rata-rata</p>' +
            '<p class="mt-1.5 text-[28px] font-extrabold tracking-tight text-slate-900 num leading-none">' + U.pct(avg) + '</p>' +
            '<p class="mt-1.5 text-[11px] text-slate-400">Dari ' + products.length + ' produk</p>' +
          '</div>' +
          '<div class="card p-5">' +
            '<p class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">Margin tertinggi</p>' +
            '<p class="mt-1.5 text-[28px] font-extrabold tracking-tight text-emerald-600 num leading-none">' + U.pct(best.margin) + '</p>' +
            '<p class="mt-1.5 text-[11px] text-slate-400 truncate">' + U.esc(best.name) + '</p>' +
          '</div>' +
          '<div class="card p-5">' +
            '<p class="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">Perlu perhatian</p>' +
            '<p class="mt-1.5 text-[28px] font-extrabold tracking-tight ' + (low ? 'text-amber-600' : 'text-slate-900') + ' num leading-none">' + low + '</p>' +
            '<p class="mt-1.5 text-[11px] text-slate-400">Produk dengan margin di bawah 15%</p>' +
          '</div>' +
        '</div>' +

        '<div class="card overflow-hidden">' +
          '<div class="p-5 sm:p-6 border-b border-slate-100">' +
            '<h2 class="text-[15px] font-bold tracking-tight text-slate-900">Peringkat margin produk</h2>' +
            '<p class="text-[11.5px] text-slate-400 mt-0.5">Bandingkan harga jual, keuntungan, dan margin secara visual.</p>' +
          '</div>' +
          '<div class="hidden md:block overflow-x-auto">' +
            '<table class="tbl min-w-[760px]">' +
              '<thead><tr><th>#</th><th>Produk</th><th>Harga Jual</th><th>Keuntungan</th><th>Margin</th><th class="!text-right">Aksi</th></tr></thead>' +
              '<tbody>' + rows + '</tbody>' +
            '</table>' +
          '</div>' +
          '<div class="md:hidden p-4 space-y-2.5">' + cards + '</div>' +
        '</div>' +

        '<div class="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-3">' +
          '<span class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0">' + U.icon('lightbulb', 'w-4 h-4') + '</span>' +
          '<p class="text-[12px] text-slate-500 leading-6">Produk dengan margin di bawah 15% sebaiknya dievaluasi: naikkan harga jual, tekan biaya produksi, atau jadikan produk pelengkap tanpa target margin tinggi.</p>' +
        '</div>' +
      '</div>'
    );
  };
})();
