/* HargaUMKM — dashboard */
window.Views = window.Views || {};

(function () {
  const marginTone = (m) => {
    if (m >= 30) return { label: 'Sehat', cls: 'badge-green' };
    if (m >= 15) return { label: 'Cukup', cls: 'badge-amber' };
    return { label: 'Tipis', cls: 'badge-red' };
  };

  function statCard(iconName, tone, label, value, foot) {
    const toneKey = tone.includes('emerald') ? 'profit' : tone.includes('brand') ? 'brand' : 'neutral';
    return (
      '<div class="card stat-card stat-' + toneKey + ' p-5">' +
        '<div class="flex items-start justify-between gap-3">' +
          '<div class="w-10 h-10 rounded-xl ' + tone + ' grid place-items-center">' + U.icon(iconName, 'w-5 h-5') + '</div>' +
          '<span class="text-[10px] font-semibold text-slate-400">' + U.esc(foot.label) + '</span>' +
        '</div>' +
        '<p class="mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">' + label + '</p>' +
        '<p class="mt-1 text-[26px] font-extrabold tracking-tight text-slate-900 num leading-none">' + value + '</p>' +
        '<p class="mt-2 text-[11px] text-slate-400 leading-4">' + foot.text + '</p>' +
      '</div>'
    );
  }

  Views.dashboard = function () {
    const data = App.data;
    const products = data.products;
    const premium = data.user.premium;
    const hour = new Date().getHours();
    const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';
    const firstName = (data.user.name || 'Pengguna').split(' ')[0];

    const totalProfit = products.reduce((s, p) => s + (Number(p.profit) || 0), 0);
    const totalValue = products.reduce((s, p) => s + (Number(p.price) || 0), 0);
    const avgMargin = products.length
      ? products.reduce((s, p) => s + (Number(p.margin) || 0), 0) / products.length
      : 0;

    const recent = products.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const chartData = products.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-6);
    const maxProfit = Math.max.apply(null, chartData.map((p) => Number(p.profit) || 0).concat([1]));

    const sortedMargin = products.slice().sort((a, b) => (Number(b.margin) || 0) - (Number(a.margin) || 0));
    const best = sortedMargin[0];
    const worst = sortedMargin[sortedMargin.length - 1];
    const thin = products.filter((p) => (Number(p.margin) || 0) < 20).length;

    const recentRows = recent.map((p) => {
      const tone = marginTone(Number(p.margin) || 0);
      return (
        '<tr>' +
          '<td>' +
            '<div class="flex items-center gap-3">' +
              '<span class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 grid place-items-center shrink-0">' + U.icon('package', 'w-4 h-4') + '</span>' +
              '<div class="min-w-0"><p class="font-semibold text-slate-800 truncate max-w-[190px]">' + U.esc(p.name) + '</p>' +
              '<p class="text-[11px] text-slate-400">' + U.esc(p.category || 'Tanpa kategori') + '</p></div>' +
            '</div>' +
          '</td>' +
          '<td class="num font-semibold text-slate-700">' + U.rupiah(p.price) + '</td>' +
          '<td class="num text-emerald-600 font-semibold">' + U.rupiah(p.profit) + '</td>' +
          '<td><span class="badge ' + tone.cls + '">' + tone.label + ' · ' + U.pct(p.margin) + '</span></td>' +
          '<td class="text-right">' +
            '<button class="icon-btn !w-8 !h-8" data-action="view-product" data-id="' + p.id + '" title="Lihat detail" aria-label="Lihat detail ' + U.esc(p.name) + '">' + U.icon('eye', 'w-4 h-4') + '</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    const chart = chartData.length
      ? chartData.map((p, i) => {
          const h = Math.max(8, Math.round(((Number(p.profit) || 0) / maxProfit) * 100));
          const isBest = p.id === best.id;
          return (
            '<div class="flex-1 min-w-0 flex flex-col items-center gap-2 group" title="' + U.esc(p.name) + ' · ' + U.rupiah(p.profit) + '">' +
              '<div class="w-full flex-1 flex items-end">' +
                '<div class="w-full rounded-t-lg ' + (isBest ? 'bg-brand-600' : 'bg-brand-200 group-hover:bg-brand-300') + ' transition-colors bar-rise" style="height:' + h + '%; animation-delay:' + (i * 55) + 'ms"></div>' +
              '</div>' +
              '<p class="text-[9.5px] text-slate-400 truncate w-full text-center leading-tight">' + U.esc(p.name.split(' ').slice(0, 2).join(' ')) + '</p>' +
            '</div>'
          );
        }).join('')
      : '';

    return (
      '<div class="space-y-6">' +
        '<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">' +
          '<div>' +
            '<p class="text-[12.5px] text-slate-500">' + greeting + ',</p>' +
            '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">' + U.esc(firstName) + '</h1>' +
            '<p class="mt-1 text-[12px] text-slate-400">' + U.dateLong(new Date()) + '</p>' +
          '</div>' +
          '<div class="flex flex-wrap gap-2">' +
            '<a href="#/app/kalkulator" class="btn btn-primary">' + U.icon('plus', 'w-4 h-4') + 'Hitung Harga</a>' +
            '<button data-action="new-product" class="btn btn-secondary">' + U.icon('package-plus', 'w-4 h-4') + 'Tambah Produk</button>' +
          '</div>' +
        '</div>' +

        (!premium && products.length >= UI.LIMITS.products
          ? '<div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">' +
              '<span class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 grid place-items-center shrink-0">' + U.icon('triangle-alert', 'w-4 h-4') + '</span>' +
              '<p class="text-[12.5px] text-amber-900 leading-5 flex-1">Batas paket gratis tercapai (' + products.length + '/' + UI.LIMITS.products + ' produk). Upgrade untuk menyimpan produk tanpa batas.</p>' +
              '<button data-action="open-upgrade" class="btn btn-primary !py-1.5 !text-[12px] shrink-0">Upgrade</button>' +
            '</div>'
          : '') +

        '<div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">' +
          statCard('package', 'bg-brand-50 text-brand-600', 'Total Produk', U.number(products.length), {
            label: premium ? 'Tanpa batas' : 'Gratis',
            text: premium ? 'Penyimpanan produk tanpa batas.' : 'Maksimal ' + UI.LIMITS.products + ' produk di paket gratis.'
          }) +
          statCard('history', 'bg-amber-50 text-amber-600', 'Total Simulasi', U.number(data.history.length), {
            label: 'Riwayat',
            text: 'Kalkulasi harga dan simulasi promo tersimpan.'
          }) +
          statCard('wallet', 'bg-emerald-50 text-emerald-600', 'Perkiraan Keuntungan', U.rupiah(totalProfit), {
            label: 'Potensi',
            text: 'Jika semua produk terjual satu unit, sebelum promo.'
          }) +
        '</div>' +

        '<div class="grid lg:grid-cols-3 gap-5">' +
          '<section class="lg:col-span-2 card p-5 sm:p-6">' +
            '<div class="flex items-start justify-between gap-3">' +
              '<div>' +
                '<h2 class="text-[15px] font-bold tracking-tight text-slate-900">Potensi keuntungan produk</h2>' +
                '<p class="text-[11.5px] text-slate-400 mt-0.5">Per unit, berdasarkan produk terbaru</p>' +
              '</div>' +
              '<a href="#/app/perbandingan" class="text-[11.5px] font-semibold text-brand-600 hover:text-brand-700">Bandingkan</a>' +
            '</div>' +
            (chartData.length
              ? '<div class="mt-6 flex items-end gap-2 sm:gap-3 h-40">' + chart + '</div>' +
                '<div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-400">' +
                  '<span>Nilai jual total <strong class="text-slate-600 num">' + U.rupiah(totalValue) + '</strong></span>' +
                  '<span>Rata-rata margin <strong class="text-slate-600 num">' + U.pct(avgMargin) + '</strong></span>' +
                '</div>'
              : '<div class="mt-5 h-40 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 grid place-items-center text-center px-4">' +
                  '<div><p class="text-[13px] font-semibold text-slate-600">Belum ada produk untuk ditampilkan</p>' +
                  '<a href="#/app/kalkulator" class="text-[12px] font-semibold text-brand-600 mt-1 inline-block">Hitung produk pertama</a></div>' +
                '</div>') +
          '</section>' +

          '<section class="card p-5 sm:p-6">' +
            '<div class="flex items-center justify-between">' +
              '<h2 class="text-[15px] font-bold tracking-tight text-slate-900">Kesehatan margin</h2>' +
              '<span class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 grid place-items-center">' + U.icon('activity', 'w-4 h-4') + '</span>' +
            '</div>' +
            '<p class="mt-4 text-[34px] font-extrabold tracking-tight text-slate-900 num leading-none">' + U.pct(avgMargin) + '</p>' +
            '<p class="text-[11.5px] text-slate-400 mt-1">Rata-rata margin ' + products.length + ' produk</p>' +
            '<div class="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">' +
              '<div class="h-full rounded-full ' + (avgMargin >= 30 ? 'bg-emerald-500' : avgMargin >= 15 ? 'bg-amber-500' : 'bg-red-500') + '" style="width:' + Math.min(100, Math.max(3, avgMargin * 2)) + '%"></div>' +
            '</div>' +
            (products.length
              ? '<div class="mt-4 space-y-2.5 text-[12px]">' +
                  '<div class="flex items-center justify-between gap-3"><span class="text-slate-400">Margin tertinggi</span><span class="font-semibold text-slate-700 truncate max-w-[150px]">' + U.esc(best.name) + '</span></div>' +
                  '<div class="flex items-center justify-between gap-3"><span class="text-slate-400">Margin terendah</span><span class="font-semibold text-slate-700 truncate max-w-[150px]">' + U.esc(worst.name) + '</span></div>' +
                  '<div class="flex items-center justify-between gap-3"><span class="text-slate-400">Margin di bawah 20%</span><span class="font-semibold ' + (thin ? 'text-amber-600' : 'text-emerald-600') + '">' + thin + ' produk</span></div>' +
                '</div>'
              : '<p class="mt-4 text-[12px] text-slate-400 leading-5">Tambahkan produk untuk melihat ringkasan margin.</p>') +
            '<div class="mt-4 pt-3 border-t border-slate-100">' +
              '<p class="text-[11px] text-slate-400 leading-5">Rumus cepat: harga jual = biaya tetap ÷ (1 − margin − komisi).</p>' +
              '<a href="#/app/kalkulator" class="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-600 hover:text-brand-700">Buka kalkulator ' + U.icon('arrow-right', 'w-3.5 h-3.5') + '</a>' +
            '</div>' +
          '</section>' +
        '</div>' +

        '<section class="card overflow-hidden">' +
          '<div class="p-5 sm:p-6 flex items-center justify-between gap-3">' +
            '<div>' +
              '<h2 class="text-[15px] font-bold tracking-tight text-slate-900">Produk terbaru</h2>' +
              '<p class="text-[11.5px] text-slate-400 mt-0.5">Harga dan margin dari produk yang baru disimpan</p>' +
            '</div>' +
            '<a href="#/app/produk" class="btn btn-secondary !py-1.5 !text-[12px]">Lihat semua ' + U.icon('arrow-right', 'w-3.5 h-3.5') + '</a>' +
          '</div>' +
          (recent.length
            ? '<div class="overflow-x-auto"><table class="tbl min-w-[680px]"><thead><tr>' +
                '<th>Produk</th><th>Harga Jual</th><th>Keuntungan</th><th>Margin</th><th class="!text-right">Aksi</th>' +
              '</tr></thead><tbody>' + recentRows + '</tbody></table></div>'
            : '<div class="px-5 pb-5">' +
                UI.empty({
                  icon: 'package-plus',
                  title: 'Belum ada produk',
                  description: 'Hitung harga jual produk pertama Anda, lalu simpan agar muncul di sini.',
                  actionHtml: '<a href="#/app/kalkulator" class="btn btn-primary">' + U.icon('calculator', 'w-4 h-4') + 'Hitung Harga Jual</a>'
                }) +
              '</div>') +
        '</section>' +

        (!premium
          ? '<section class="rounded-[20px] bg-ink p-6 sm:p-7 text-white relative overflow-hidden">' +
              '<div class="absolute inset-0 auth-grid opacity-40"></div>' +
              '<div class="absolute -right-10 -bottom-20 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl"></div>' +
              '<div class="relative flex flex-col sm:flex-row sm:items-center gap-5">' +
                '<div class="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 text-amber-300 grid place-items-center shrink-0">' + U.icon('crown', 'w-5 h-5') + '</div>' +
                '<div class="flex-1">' +
                  '<h2 class="text-[16px] font-bold tracking-tight">Siap mengatur harga seperti pemilik usaha berpengalaman?</h2>' +
                  '<p class="text-[12px] text-blue-100/70 mt-1 leading-5">Buka simulasi promo, perbandingan keuntungan, dan laporan PDF seharga Rp 20.000/bulan.</p>' +
                '</div>' +
                '<button data-action="open-upgrade" class="btn bg-white text-ink hover:bg-blue-50 shrink-0">Upgrade Premium</button>' +
              '</div>' +
            '</section>'
          : '') +
      '</div>'
    );
  };
})();
