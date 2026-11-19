# HargaUMKM

Kalkulator harga jual dan pengelola keuangan untuk UMKM Indonesia. Aplikasi web statis yang membantu pemilik usaha menghitung harga jual, menyimpan produk, menyimulasikan promo, membandingkan keuntungan, dan mengekspor laporan PDF.

## Demo

- URL: https://siti-miftahul-farihah.github.io/hargaumkm/
- Email: `demo@hargaumkm.id`
- Kata sandi: `demo123`

Akun demo berstatus Premium dengan produk dan riwayat contoh. Data akun demo tersimpan terpusat di Supabase, jadi dapat dibuka dari perangkat mana pun.

## Fitur

- Landing page dan kalkulator harga interaktif
- Registrasi, login, akun demo, dan lupa kata sandi
- Dashboard ringkasan usaha
- Kelola produk: tambah, lihat detail, edit, hapus, dan cari
- Hitung HPP batch dengan modal bahan, jumlah hasil produksi, biaya kemasan, operasional, ongkir, dan target keuntungan total
- Rincian bahan mentah/resep dengan konversi satuan dan total biaya bahan terpakai otomatis
- Simulasi promo dan kalkulator batas diskon aman (Premium)
- Perbandingan keuntungan antar produk (Premium)
- Riwayat simulasi
- Laporan dan ekspor PDF (Premium)
- Pengaturan profil, keamanan, notifikasi, dan keanggotaan
- Bantuan & FAQ dengan pencarian dan accordion
- Layout responsif untuk desktop, tablet, dan mobile

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
- Supabase Auth + PostgreSQL
- GitHub Pages atau Netlify untuk hosting frontend

## Struktur tabel Supabase

| Tabel | Isi |
| --- | --- |
| `hargaumkm_profiles` | Satu baris per pengguna: nama, email, telepon, usaha, kota, status premium. |
| `hargaumkm_settings` | Satu baris per pengguna: preferensi notifikasi, bahasa, dan penanda migrasi. |
| `hargaumkm_products` | Satu baris per produk: nama, modal bahan, jumlah hasil produksi, biaya batch, target keuntungan, rincian bahan, margin, harga jual. |
| `hargaumkm_history` | Satu baris per riwayat simulasi: produk, harga, untung, margin, diskon. |
| `hargaumkm_data` | Tabel lama berisi `payload` JSONB. Dipertahankan untuk migrasi otomatis. |

## Menyiapkan Supabase

1. Buat project di https://supabase.com.
2. Buka **SQL Editor → New query**.
3. Salin seluruh isi `supabase/schema.sql`, tempel, lalu klik **Run**.
   - Jika sebelumnya sudah pernah menjalankan schema lama, jalankan ulang berkas terbaru. Proses ini menambahkan kolom `production_qty`, `target_profit_total`, `materials`, `material_method`, `material_purchase_total`, dan `material_used_total`, serta menghapus kolom `category` yang sudah tidak dipakai. Data lama di `hargaumkm_data` tidak dihapus saat schema dijalankan; setelah pengguna masuk, datanya dipindahkan ke tabel baru lalu baris lama dibersihkan.
4. Buka **Authentication → Providers → Email** dan pastikan email aktif.
5. Untuk mempermudah pengujian, matikan **Confirm email** pada **Authentication → Sign In / Providers**.
6. Buka **Authentication → URL Configuration**, lalu isi:
   - **Site URL**: `https://siti-miftahul-farihah.github.io/hargaumkm/`
   - **Redirect URLs**: tambahkan URL yang sama. Untuk pengembangan lokal, tambahkan juga `http://localhost:3000/` dan `http://localhost:4173/`. Jika deploy ke Netlify, tambahkan pula `https://<nama-web>.netlify.app/`.
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

## Deploy ke Netlify

1. Buka https://app.netlify.com, masuk dengan GitHub, lalu pilih **Add new site → Import an existing project**.
2. Pilih repository `hargaumkm`. Karena `index.html` ada di root repo, Netlify akan mendeteksi sebagai static site.
3. Biarkan **Build command** kosong dan **Publish directory** sebagai `.`. Berkas `netlify.toml` di repo sudah mengatur ini otomatis.
4. Klik **Deploy site**. Secara default Netlify memberi URL acak seperti `https://random-name-123.netlify.app`.
5. Untuk URL yang lebih mudah diingat, buka **Site configuration → General → Site details → Change site name**, lalu misalnya pakai `hargaumkm-app`. URL-nya menjadi `https://hargaumkm-app.netlify.app`.
6. Buka **Authentication → URL Configuration** di Supabase, lalu tambahkan URL Netlify tersebut ke **Site URL** dan **Redirect URLs**. Tanpa ini, login bisa gagal setelah redirect.
7. Jika memakai domain sendiri, masuk ke **Domain management → Custom domains** di Netlify, tambahkan domain, lalu arahkan DNS sesuai petunjuk Netlify. Domain itu juga wajib ditambahkan ke **Redirect URLs** Supabase.

GitHub Pages dan Netlify bisa aktif bersamaan; keduanya memakai kode dan project Supabase yang sama.

## Catatan data

- Akun dikelola oleh Supabase Auth (email dan kata sandi).
- Profil, pengaturan, produk, dan riwayat disimpan di tabel terpisah: `hargaumkm_profiles`, `hargaumkm_settings`, `hargaumkm_products`, dan `hargaumkm_history`.
- Aplikasi memakai fungsi database `get_hargaumkm_data()`, `save_hargaumkm_data()`, dan `get_hargaumkm_schema_version()` agar pembacaan/penyimpanan keempat tabel berjalan konsisten.
- Jika versi schema di Supabase masih di bawah `2`, aplikasi menghentikan penyimpanan dan menampilkan pesan agar `supabase/schema.sql` dijalankan ulang. Ini mencegah data batch dan rincian bahan hilang tanpa peringatan.
- Row Level Security membatasi setiap pengguna agar hanya bisa membaca dan mengubah baris miliknya sendiri di semua tabel.
- Data tidak lagi disimpan di `localStorage`, sehingga akun dan data dapat dibuka dari perangkat lain.
- Data lama dari `payload` JSONB dan `localStorage` akan diimpor otomatis ke tabel baru saat pengguna masuk pertama kali. Kata sandi lama tidak dapat dipindahkan, jadi pengguna perlu mendaftar ulang di Supabase Auth.
- Akun demo bersifat publik dan dipakai bersama. Jangan menyimpan data pribadi di akun demo.
