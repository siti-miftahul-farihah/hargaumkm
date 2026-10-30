# HargaUMKM

Kalkulator harga jual dan pengelola keuangan untuk UMKM Indonesia. Aplikasi web statis yang membantu pemilik usaha menghitung harga jual, menyimpan produk, menyimulasikan promo, membandingkan keuntungan, dan mengekspor laporan PDF.

## Demo

- URL: https://siti-miftahul-farihah.github.io/hargaumkm/
- Email: `demo@hargaumkm.id`
- Kata sandi: `demo123`

Akun demo berstatus Premium dengan 5 produk dan 4 riwayat contoh. Data akun demo tersimpan terpusat di Supabase, jadi dapat dibuka dari perangkat mana pun.

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
- Supabase Auth + PostgreSQL (`hargaumkm_data`)
- GitHub Pages untuk hosting frontend

## Menyiapkan Supabase

1. Buat project di https://supabase.com.
2. Buka **SQL Editor → New query**.
3. Salin seluruh isi `supabase/schema.sql`, tempel, lalu klik **Run**.
4. Buka **Authentication → Providers → Email** dan pastikan email aktif.
5. Untuk mempermudah pengujian, matikan **Confirm email** pada **Authentication → Sign In / Providers**.
6. Buka **Authentication → URL Configuration**, lalu isi:
   - **Site URL**: `https://siti-miftahul-farihah.github.io/hargaumkm/`
   - **Redirect URLs**: tambahkan URL yang sama. Untuk pengembangan lokal, tambahkan juga `http://localhost:3000/` dan `http://localhost:4173/`.
7. Buka **Project Settings → API**, ambil **Project URL** dan **anon public key**. Masukkan keduanya ke `assets/js/config.js`.

Jangan pernah menaruh **service_role key** atau database password di frontend.

## Menjalankan secara lokal

Jalankan static server dari folder ini:

```bash
npx serve .
```

Lalu buka alamat yang ditampilkan (biasanya `http://localhost:3000`).

Aplikasi memerlukan koneksi internet untuk memuat Tailwind, font, ikon, jsPDF, dan Supabase dari CDN.

## Deploy ke GitHub Pages

1. Push folder ini ke repository GitHub.
2. Buka **Settings → Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch `main` dan folder `/ (root)`, lalu simpan.
5. Situs akan tersedia di `https://<username>.github.io/hargaumkm/`.
6. Pastikan **Site URL** dan **Redirect URLs** di Supabase memakai alamat GitHub Pages tersebut.

## Catatan data

- Akun dikelola oleh Supabase Auth (email dan kata sandi).
- Profil, produk, riwayat, dan pengaturan disimpan sebagai satu dokumen JSONB per pengguna di tabel `public.hargaumkm_data`.
- Row Level Security membatasi setiap pengguna agar hanya bisa membaca dan mengubah baris miliknya sendiri.
- Data tidak lagi disimpan di `localStorage`, sehingga akun dan data dapat dibuka dari perangkat lain.
- Data lama dari versi `localStorage` akan diimpor otomatis saat pengguna mendaftar/masuk pertama kali dengan email yang sama. Kata sandi lama tidak dapat dipindahkan, jadi pengguna perlu mendaftar ulang di Supabase Auth.
- Akun demo bersifat publik dan dipakai bersama. Jangan menyimpan data pribadi di akun demo.
