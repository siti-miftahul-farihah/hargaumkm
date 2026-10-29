/* HargaUMKM — financial reports & PDF export (premium) */
window.Views = window.Views || {};

(function () {
  const monthName = (d) => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);

  function periodMeta(period) {
    const now = new Date();
    if (period === 'month') return { label: 'Bulan ' + monthName(now), short: 'Bulan ini' };
    if (period === 'year') return { label: 'Tahun ' + now.getFullYear(), short: 'Tahun ini' };
    if (period === 'all') return { label: 'Semua waktu', short: 'Semua' };
    return { label: '30 hari terakhir', short: '30 hari' };
  }

  function filterProducts(period, products) {
    const now = new Date();
    let from = null;
    if (period === '30') from = new Date(now.getTime() - 30 * 86400000);
    return products.filter((p) => {
      const d = new Date(p.createdAt);
      if (Number.isNaN(d.getTime())) return false;
      if (period === 'all') return true;
      if (period === 'year') return d.getFullYear() === now.getFullYear();
      if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return from ? d >= from : true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function totals(items) {
    return {
      count: items.length,
      revenue: items.reduce((s, p) => s + (Number(p.price) || 0), 0),
      cost: items.reduce((s, p) => s + (Number(p.totalCost) || 0), 0),
      profit: items.reduce((s, p) => s + (Number(p.profit) || 0), 0),
      avgMargin: items.length ? items.reduce((s, p) => s + (Number(p.margin) || 0), 0) / items.length : 0
    };
  }

  Views.reports = function () {
    if (!App.data.user.premium) {
      return UI.paywall({
        feature: 'Laporan Keuangan & Ekspor PDF',
        description: 'Rekap pendapatan, biaya, dan keuntungan per periode. Unduh sebagai PDF untuk arsip atau pengajuan modal.',
        benefits: [
          'Filter laporan per periode',
          'Ringkasan pendapatan, biaya, dan keuntungan',
          'Tabel rincian per produk',
          'Unduh laporan dalam format PDF'
        ]
      });
    }

    const period = App.ui.reportPeriod || '30';
    const all = App.data.products;
    const meta = periodMeta(period);
    const items = filterProducts(period, all);
    const t = totals(items);

    if (!all.length) {
      return (
        '<div class="space-y-5">' +
          '<div>' +
            '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950">Laporan</h1>' +
            '<p class="mt-1 text-[12.5px] text-slate-500">Rekap keuangan usaha berdasarkan produk yang tersimpan.</p>' +
          '</div>' +
          UI.empty({
            icon: 'file-text',
            title: 'Belum ada data laporan',
            description: 'Simpan produk terlebih dahulu. Setelah itu Anda bisa membuat laporan dan mengunduhnya sebagai PDF.',
            actionHtml: '<a href="#/app/kalkulator" class="btn btn-primary">' + U.icon('calculator', 'w-4 h-4') + 'Hitung Produk</a>'
          }) +
        '</div>'
      );
    }

    const summary = [
      ['Total produk', U.number(t.count), 'Produk pada periode ini', 'package', 'bg-brand-50 text-brand-600'],
      ['Pendapatan', U.rupiah(t.revenue), 'Nilai jual 1 unit/produk', 'wallet', 'bg-slate-100 text-slate-600'],
      ['Total biaya', U.rupiah(t.cost), 'Modal + biaya + komisi', 'receipt', 'bg-amber-50 text-amber-600'],
      ['Keuntungan', U.rupiah(t.profit), 'Margin rata-rata ' + U.pct(t.avgMargin), 'trending-up', 'bg-emerald-50 text-emerald-600']
    ].map(([label, value, note, ic, tone]) =>
      '<div class="card p-4 sm:p-5">' +
        '<div class="flex items-center justify-between gap-2">' +
          '<p class="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-slate-400">' + label + '</p>' +
          '<span class="w-8 h-8 rounded-lg ' + tone + ' grid place-items-center shrink-0">' + U.icon(ic, 'w-4 h-4') + '</span>' +
        '</div>' +
        '<p class="mt-2.5 text-[20px] sm:text-[22px] font-extrabold tracking-tight text-slate-900 num leading-none">' + value + '</p>' +
        '<p class="mt-1.5 text-[10.5px] text-slate-400 leading-4">' + note + '</p>' +
      '</div>'
    ).join('');

    const rows = items.map((p) =>
      '<tr>' +
        '<td><p class="font-semibold text-slate-800 truncate max-w-[230px]">' + U.esc(p.name) + '</p>' +
          '<p class="text-[11px] text-slate-400">' + U.esc(p.category || 'Tanpa kategori') + ' · ' + U.dateShort(p.createdAt) + '</p></td>' +
        '<td class="num text-slate-700">' + U.rupiah(p.price) + '</td>' +
        '<td class="num text-slate-500">' + U.rupiah(p.totalCost) + '</td>' +
        '<td class="num font-semibold text-emerald-600">' + U.rupiah(p.profit) + '</td>' +
        '<td class="num font-semibold ' + ((Number(p.margin) || 0) >= 15 ? 'text-slate-700' : 'text-amber-600') + '">' + U.pct(p.margin) + '</td>' +
      '</tr>'
    ).join('');

    return (
      '<div class="space-y-5">' +
        '<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">' +
          '<div>' +
            '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">Laporan</h1>' +
            '<p class="mt-1 text-[12.5px] text-slate-500">Ringkasan keuangan usaha untuk periode ' + meta.label.toLowerCase() + '.</p>' +
          '</div>' +
          '<button data-action="download-report" class="btn btn-primary self-start sm:self-auto"' + (items.length ? '' : ' disabled') + '>' +
            U.icon('download', 'w-4 h-4') + 'Unduh PDF' +
          '</button>' +
        '</div>' +

        '<div class="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">' +
          '<div class="flex items-center gap-2.5">' +
            '<span class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 grid place-items-center">' + U.icon('calendar', 'w-4 h-4') + '</span>' +
            '<div><p class="text-[11.5px] font-semibold text-slate-700">Periode laporan</p>' +
              '<p class="text-[10.5px] text-slate-400">Pilih rentang waktu data</p></div>' +
          '</div>' +
          '<select class="input sm:ml-auto sm:!w-[210px]" data-report-period aria-label="Periode laporan">' +
            [['30', '30 hari terakhir'], ['month', 'Bulan ini'], ['year', 'Tahun ini'], ['all', 'Semua waktu']]
              .map(([v, l]) => '<option value="' + v + '"' + (period === v ? ' selected' : '') + '>' + l + '</option>').join('') +
          '</select>' +
        '</div>' +

        '<div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">' + summary + '</div>' +

        (items.length
          ? '<div class="card overflow-hidden">' +
              '<div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">' +
                '<div><h2 class="text-[14px] font-bold text-slate-900">Rincian produk</h2>' +
                  '<p class="text-[11px] text-slate-400 mt-0.5">Periode: ' + meta.label + '</p></div>' +
                '<span class="badge badge-slate">' + items.length + ' produk</span>' +
              '</div>' +
              '<div class="overflow-x-auto"><table class="tbl min-w-[680px]"><thead><tr>' +
                '<th>Produk</th><th>Harga Jual</th><th>Total Biaya</th><th>Keuntungan</th><th>Margin</th>' +
              '</tr></thead><tbody>' + rows + '</tbody>' +
              '<tfoot><tr class="!bg-slate-50/80">' +
                '<td class="!font-bold !text-slate-800">Total</td>' +
                '<td class="num !font-bold !text-slate-800">' + U.rupiah(t.revenue) + '</td>' +
                '<td class="num !font-bold !text-slate-800">' + U.rupiah(t.cost) + '</td>' +
                '<td class="num !font-bold !text-emerald-700">' + U.rupiah(t.profit) + '</td>' +
                '<td class="num !font-bold !text-slate-800">' + U.pct(t.avgMargin) + '</td>' +
              '</tr></tfoot></table></div>' +
            '</div>'
          : UI.empty({
              icon: 'calendar-x',
              title: 'Tidak ada data pada periode ini',
              description: 'Coba pilih periode lain atau simpan produk baru untuk mulai mengisi laporan.',
              actionHtml: '<button data-action="report-period" data-value="all" class="btn btn-primary">Lihat semua waktu</button>'
            })) +

        '<p class="text-[11px] text-slate-400 leading-5">Laporan menghitung 1 unit per produk dan belum memperhitungkan transaksi aktual. Gunakan sebagai estimasi perencanaan harga.</p>' +
      '</div>'
    );
  };

  Views.setReportPeriod = function (period) {
    App.ui.reportPeriod = ['30', 'month', 'year', 'all'].includes(period) ? period : '30';
    App.refresh();
  };

  Views.downloadReport = function () {
    const items = filterProducts(App.ui.reportPeriod || '30', App.data.products);
    if (!items.length) return U.toast('Tidak ada data untuk diunduh pada periode ini.', 'error');

    const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) return U.toast('Pustaka PDF belum termuat. Periksa koneksi internet lalu coba lagi.', 'error');

    const meta = periodMeta(App.ui.reportPeriod || '30');
    const t = totals(items);
    const user = App.data.user;
    const doc = new jsPDFCtor({ unit: 'mm', format: 'a4' });
    const W = 210;
    const today = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    const brand = [37, 99, 235];
    const ink = [11, 27, 58];
    const slate = [100, 116, 139];

    /* Header */
    doc.setFillColor(ink[0], ink[1], ink[2]);
    doc.rect(0, 0, W, 34, 'F');
    doc.setFillColor(brand[0], brand[1], brand[2]);
    doc.rect(0, 32, W, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('HargaUMKM', 14, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(191, 219, 254);
    doc.text('Laporan Keuangan Ringkas', 14, 21);

    doc.setFontSize(8);
    doc.setTextColor(219, 234, 254);
    doc.text('Dibuat: ' + today, W - 14, 14, { align: 'right' });
    doc.text('Periode: ' + meta.label, W - 14, 19.5, { align: 'right' });

    /* Business identity */
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Ringkasan usaha', 14, 47);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.text('Usaha: ' + (user.businessName || user.name || '-'), 14, 53);
    doc.text('Pemilik: ' + (user.name || '-'), 14, 58);
    doc.text('Email: ' + (user.email || '-'), 14, 63);

    /* Summary cards */
    const cards = [
      ['Total Produk', String(t.count), [239, 246, 255]],
      ['Pendapatan', U.rupiah(t.revenue), [248, 250, 252]],
      ['Total Biaya', U.rupiah(t.cost), [255, 251, 235]],
      ['Keuntungan', U.rupiah(t.profit), [236, 253, 245]]
    ];
    const cardW = 42;
    const gap = 4;
    let x = 14;
    const y = 70;
    cards.forEach((c) => {
      doc.setFillColor(c[2][0], c[2][1], c[2][2]);
      doc.roundedRect(x, y, cardW, 23, 3, 3, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text(c[0], x + 4, y + 7.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(c[1], x + 4, y + 16.5);
      x += cardW + gap;
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(slate[0], slate[1], slate[2]);
    doc.text('Estimasi berdasarkan 1 unit per produk. Margin rata-rata ' + U.pct(t.avgMargin) + '.', 14, 100);

    /* Table */
    doc.autoTable({
      startY: 104,
      head: [['Produk', 'Harga Jual', 'Total Biaya', 'Keuntungan', 'Margin']],
      body: items.map((p) => [
        p.name + (p.category ? ' (' + p.category + ')' : ''),
        U.rupiah(p.price),
        U.rupiah(p.totalCost),
        U.rupiah(p.profit),
        U.pct(p.margin)
      ]),
      foot: [['Total', U.rupiah(t.revenue), U.rupiah(t.cost), U.rupiah(t.profit), U.pct(t.avgMargin)]],
      theme: 'grid',
      margin: { left: 14, right: 14 },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.6,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [239, 246, 255],
        textColor: [29, 78, 216],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      footStyles: {
        fillColor: [248, 250, 252],
        textColor: [15, 23, 42],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });

    /* Footer */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i += 1) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('HargaUMKM · Laporan dibuat otomatis dari data produk yang tersimpan.', 14, 290);
      doc.text('Halaman ' + i + ' dari ' + pages, W - 14, 290, { align: 'right' });
    }

    const stamp = new Date().toISOString().slice(0, 7);
    doc.save('HargaUMKM-Laporan-' + stamp + '.pdf');
    U.toast('Laporan PDF berhasil diunduh.');
  };
})();
