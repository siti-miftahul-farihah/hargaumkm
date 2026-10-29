/* HargaUMKM — help center */
window.Views = window.Views || {};

(function () {
  const FAQS = [
    {
      q: 'Bagaimana cara menghitung harga jual yang benar?',
      a: 'Jumlahkan modal produk, kemasan, biaya operasional, dan ongkir. Lalu tentukan target margin dan komisi marketplace. HargaUMKM menghitung harga jual yang menutup semua biaya sekaligus mencapai target keuntungan Anda.'
    },
    {
      q: 'Apa bedanya target margin persen dan nominal?',
      a: 'Target margin persen dihitung dari harga jual, misalnya margin 30% berarti keuntungan adalah 30% dari harga jual. Target nominal adalah jumlah rupiah keuntungan yang ingin Anda dapat per unit, misalnya Rp 25.000.'
    },
    {
      q: 'Bagaimana komisi marketplace diperhitungkan?',
      a: 'Komisi bisa dimasukkan sebagai persen dari harga jual atau nominal tetap. Komisi persen dihitung dari harga jual final, sehingga harga jual otomatis disesuaikan agar target keuntungan tetap tercapai.'
    },
    {
      q: 'Kenapa harga jual yang dihasilkan terlihat tinggi?',
      a: 'Harga jual menutup seluruh biaya yang Anda masukkan, termasuk komisi dan ongkir. Jika terasa tinggi, periksa kembali biaya operasional atau target margin. Anda juga bisa menurunkan target margin dan melihat dampaknya lewat simulasi promo.'
    },
    {
      q: 'Apakah data saya tersimpan dengan aman?',
      a: 'Pada versi demo ini, data disimpan di localStorage perangkat Anda dan tidak dikirim ke server mana pun. Untuk penggunaan produksi, diperlukan backend dengan autentikasi, enkripsi, dan pencadangan data.'
    },
    {
      q: 'Bagaimana cara upgrade ke Premium?',
      a: 'Buka Pengaturan > Keanggotaan, lalu klik Aktifkan Premium. Pada mode demo, premium langsung aktif tanpa pembayaran. Anda bisa kembali ke paket gratis kapan saja.'
    },
    {
      q: 'Apakah laporan bisa diekspor ke PDF?',
      a: 'Bisa, khusus pengguna Premium. Buka menu Laporan, pilih periode, lalu klik Unduh PDF. Laporan berisi ringkasan pendapatan, biaya, keuntungan, dan rincian per produk.'
    },
    {
      q: 'Bagaimana cara menghapus produk atau riwayat?',
      a: 'Buka Produk Saya atau Riwayat Simulasi, lalu klik ikon hapus pada item yang ingin dihapus. Anda juga bisa membersihkan seluruh riwayat dari tombol Bersihkan. Tindakan ini tidak dapat dibatalkan.'
    }
  ];

  const faqItem = (item) => {
    const hay = (item.q + ' ' + item.a).toLowerCase();
    return (
      '<details class="faq-item border-b border-slate-100 last:border-0" data-faq data-faq-text="' + U.esc(hay) + '">' +
        '<summary>' + U.esc(item.q) + U.icon('plus', 'w-4 h-4 faq-plus') + '</summary>' +
        '<div class="px-5 pb-4 -mt-1 text-[12.5px] text-slate-500 leading-6">' + U.esc(item.a) + '</div>' +
      '</details>'
    );
  };

  Views.help = function () {
    const premium = App.data.user.premium;

    return (
      '<div class="space-y-5">' +
        '<div>' +
          '<h1 class="text-[26px] sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">Bantuan & FAQ</h1>' +
          '<p class="mt-1 text-[12.5px] text-slate-500">Panduan singkat dan jawaban untuk pertanyaan yang sering muncul.</p>' +
        '</div>' +

        '<div class="grid lg:grid-cols-[1fr_320px] gap-5 items-start">' +
          '<div class="space-y-4">' +
            '<div class="card overflow-hidden">' +
              '<div class="p-4 sm:p-5 border-b border-slate-100">' +
                '<div class="relative">' +
                  '<span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">' + U.icon('search', 'w-4 h-4') + '</span>' +
                  '<input class="input !pl-9" type="search" placeholder="Cari pertanyaan, misalnya: komisi..." data-faq-search autocomplete="off">' +
                '</div>' +
              '</div>' +
              '<div id="faq-list">' + FAQS.map(faqItem).join('') + '</div>' +
              '<div id="faq-empty" class="hidden p-10 text-center">' +
                '<div class="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 grid place-items-center mx-auto">' + U.icon('search-x', 'w-5 h-5') + '</div>' +
                '<p class="mt-3 text-[13px] font-semibold text-slate-600">Pertanyaan tidak ditemukan</p>' +
                '<p class="text-[12px] text-slate-400 mt-1">Coba kata kunci lain atau hubungi kami.</p>' +
              '</div>' +
            '</div>' +

            '<div class="card p-5 sm:p-6">' +
              '<h2 class="text-[14px] font-bold text-slate-900">Panduan cepat</h2>' +
              '<div class="mt-4 grid sm:grid-cols-3 gap-3">' +
                [
                  ['calculator', 'Hitung harga', 'Masukkan biaya dan target margin di kalkulator.', '#/app/kalkulator'],
                  ['package', 'Simpan produk', 'Lihat dan edit produk yang sudah dihitung.', '#/app/produk'],
                  ['history', 'Cek riwayat', 'Buka kembali simulasi yang pernah dibuat.', '#/app/riwayat']
                ].map(([ic, title, desc, href]) =>
                  '<a href="' + href + '" class="rounded-xl border border-slate-100 p-3.5 hover:border-brand-200 hover:bg-brand-50/40 transition group">' +
                    '<span class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 grid place-items-center transition">' + U.icon(ic, 'w-4 h-4') + '</span>' +
                    '<p class="mt-2.5 text-[12.5px] font-semibold text-slate-800">' + title + '</p>' +
                    '<p class="text-[10.5px] text-slate-400 leading-4 mt-0.5">' + desc + '</p>' +
                  '</a>'
                ).join('') +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="space-y-4">' +
            '<div class="rounded-[20px] bg-ink p-5 text-white relative overflow-hidden">' +
              '<div class="absolute inset-0 auth-grid opacity-40"></div>' +
              '<div class="absolute -right-8 -bottom-12 w-40 h-40 rounded-full bg-brand-500/20 blur-2xl"></div>' +
              '<div class="relative">' +
                '<div class="w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-blue-200 grid place-items-center">' + U.icon('headphones', 'w-5 h-5') + '</div>' +
                '<h2 class="mt-3.5 text-[15px] font-bold tracking-tight">Butuh bantuan lain?</h2>' +
                '<p class="mt-1.5 text-[11.5px] text-blue-100/65 leading-5">Tim kami siap membantu pada hari kerja, 09.00–17.00 WIB.</p>' +
                '<div class="mt-4 space-y-2">' +
                  '<a href="https://wa.me/6281234567890?text=Halo%20HargaUMKM%2C%20saya%20butuh%20bantuan." target="_blank" rel="noopener" class="btn btn-block bg-white/10 border border-white/15 text-white hover:bg-white/20 !justify-start !py-2 !text-[12px]">' + U.icon('message-circle', 'w-4 h-4 text-emerald-300') + 'WhatsApp</a>' +
                  '<a href="mailto:halo@hargaumkm.id" class="btn btn-block bg-white/10 border border-white/15 text-white hover:bg-white/20 !justify-start !py-2 !text-[12px]">' + U.icon('mail', 'w-4 h-4 text-blue-200') + 'halo@hargaumkm.id</a>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="card p-5">' +
              '<div class="flex items-center gap-2.5">' +
                '<span class="w-8 h-8 rounded-lg ' + (premium ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600') + ' grid place-items-center">' + U.icon('crown', 'w-4 h-4') + '</span>' +
                '<p class="text-[12.5px] font-bold text-slate-800">' + (premium ? 'Premium aktif' : 'Paket gratis') + '</p>' +
              '</div>' +
              '<p class="mt-2.5 text-[11.5px] text-slate-500 leading-5">' +
                (premium
                  ? 'Semua fitur terbuka, termasuk simulasi promo, perbandingan, dan laporan PDF.'
                  : 'Upgrade untuk membuka simulasi promo, perbandingan keuntungan, dan laporan PDF.') +
              '</p>' +
              (premium
                ? '<a href="#/app/pengaturan?tab=keanggotaan" class="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-600 hover:text-brand-700">Kelola paket ' + U.icon('arrow-right', 'w-3.5 h-3.5') + '</a>'
                : '<button data-action="open-upgrade" class="btn btn-primary btn-block mt-3 !py-1.5 !text-[12px]">Upgrade Premium</button>') +
            '</div>' +

            '<p class="text-[10.5px] text-slate-400 leading-5 px-1">Versi demo: kontak di atas hanya contoh dan tidak memproses pesan nyata.</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  };

  Views.filterFaq = function () {
    const input = document.querySelector('[data-faq-search]');
    const needle = input ? input.value.toLowerCase().trim() : '';
    let visible = 0;

    document.querySelectorAll('[data-faq]').forEach((item) => {
      const hay = item.getAttribute('data-faq-text') || '';
      const show = !needle || hay.indexOf(needle) !== -1;
      item.classList.toggle('hidden', !show);
      if (!show) item.removeAttribute('open');
      if (show) visible += 1;
    });

    const empty = document.getElementById('faq-empty');
    if (empty) empty.classList.toggle('hidden', visible !== 0);
  };
})();
