# HargaUMKM

Kalkulator harga jual dan pengelola keuangan untuk UMKM Indonesia. Aplikasi web statis yang membantu pemilik usaha menghitung harga jual, menyimpan produk, menyimulasikan promo, membandingkan keuntungan, dan mengekspor laporan PDF.

## Demo

- URL: _(isi setelah GitHub Pages aktif)_
- Email: `demo@hargaumkm.id`
- Kata sandi: `demo123`

Akun demo berstatus Premium dengan 5 produk dan 4 riwayat contoh. Akun baru otomatis memakai paket Gratis.

## Fitur

- Landing page dan kalkulator harga interaktif
- Registrasi, login, akun demo, dan lupa kata sandi
- Dashboard ringkasan usaha
- Kelola produk: tambah, lihat detail, edit, hapus, cari, dan filter
- Hitung modal, biaya kemasan, operasional, ongkir, komisi marketplace, target margin, dan pembulatan harga
- Simulasi promo dan kalkulator batas diskon aman (Premium)
- Perbandingan keuntungan antar produk (Premium)
- Riwayat simulasi
- Laporan dan ekspor PDF (Premium)
- Pengaturan profil, keamanan, notifikasi, dan keanggotaan
- Bantuan & FAQ dengan pencarian dan accordion
- Layout responsif untuk desktop dan mobile

## Paket

| Fitur | Gratis | Premium |
| --- | --- | --- |
| Produk | 5 | Tanpa batas |
| Riwayat simulasi | 10 | Tanpa batas |
| Simulasi promo | - | Ya |
| Perbandingan keuntungan | - | Ya |
| Ekspor PDF | - | Ya |

Premium: Rp 20.000/bulan. Pada versi demo, aktivasi premium berlangsung langsung tanpa pembayaran.

## Teknologi

- HTML5
- Tailwind CSS (CDN)
- JavaScript vanilla, tanpa build step
- Lucide Icons
- jsPDF + AutoTable
- `localStorage` sebagai penyimpanan data

## Menjalankan secara lokal

Buka `index.html` langsung di browser, atau jalankan static server dari folder ini:

```bash
npx serve .
```

Aplikasi memerlukan koneksi internet untuk memuat Tailwind, font, ikon, dan jsPDF dari CDN.

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `hargaumkm`.
2. Push folder ini ke repository tersebut.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu simpan.
6. Situs akan tersedia di `https://<username>.github.io/hargaumkm/`.

## Catatan data

Aplikasi ini tidak memakai backend. Data akun, produk, dan riwayat disimpan di `localStorage` masing-masing browser. Artinya, data tidak tersinkron antarperangkat dan setiap pengunjung memiliki data lokalnya sendiri.
