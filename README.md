# KELOLAIN

KELOLAIN membantu mencatat stok bahan makanan, memperkirakan masa simpan, dan menghitung kerugian dari makanan yang terbuang. Desain dashboard mengikuti prototipe KELOLAIN, sementara halaman masuk dan daftar mengikuti acuan laporan dengan opsi kecil **Lanjut sebagai tamu** di bawah formulir.

Aplikasi ini dibangun di atas repo KELOLAIN dengan Laravel 13, Fortify, Inertia 3, React 19, TypeScript, Tailwind CSS, dan SQLite. Mode tamu memulai sesi dengan data contoh. Akun baru memulai inventaris kosong. Sesi tamu kedaluwarsa setelah periode tidak aktif yang ditentukan oleh `SESSION_LIFETIME`. Memilih **Akhiri sesi tamu** langsung menghapus data sesi tersebut.

## Jalankan di komputer

Siapkan PHP 8.4 atau 8.5 dengan ekstensi PDO SQLite, DOM/XML, mbstring, cURL, dan ZIP, Composer 2, serta Node.js 22.12+ atau 24.

```sh
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm ci
npm run build
php artisan serve
```

Buka [http://localhost:8000](http://localhost:8000). Laravel membuat file SQLite saat menjalankan migrasi interaktif jika file tersebut belum ada. Di PowerShell, gunakan `Copy-Item .env.example .env` untuk menyalin konfigurasi. Untuk mengembangkan frontend, jalankan `npm run dev` di terminal kedua sambil mempertahankan server Laravel.

Jalankan `php artisan test` untuk tes backend dan `npm run types:check` untuk pemeriksaan TypeScript setelah build. `php artisan kelolain:reminders` menjalankan pengingat yang jatuh pada hari ini.

## Masukkan perubahan ke repo GitHub yang lama

Arsip distribusi berisi folder `kelolain/` untuk menjalankan aplikasi dari salinan baru dan `kelolain-fullstack.patch` untuk menerapkan perubahan pada [repo KELOLAIN](https://github.com/sheanmoulia/KELOLAIN). Patch dibuat dari commit `ad33d5e` pada `main`. Dari folder repo lokal dengan working tree bersih, gunakan:

```sh
git switch main
git pull --ff-only
git switch -c kelolain-fullstack
git apply --check /lokasi/kelolain-fullstack.patch
git apply /lokasi/kelolain-fullstack.patch
git add -A
git commit -m "Integrate KELOLAIN inventory, auth, and guest mode"
git push -u origin kelolain-fullstack
```

Buat pull request dari branch `kelolain-fullstack` ke `main` untuk meninjau dan menggabungkannya. Jika repo sudah berubah dan pemeriksaan patch gagal, terapkan perubahan dengan merge tiga arah melalui `git apply --3way /lokasi/kelolain-fullstack.patch` dari branch kerja tersebut, lalu tinjau konflik sebelum commit.

## Deploy di Railway dengan SQLite persisten

1. Buat service dari repo GitHub dan pilih branch yang ingin ditayangkan. Railway memakai `Dockerfile` dan mengecek `/up`.
2. Tambahkan volume pada service yang sama dan pasang di `/data`. File database disimpan di `/data/database.sqlite`. Gunakan satu replica untuk SQLite.
3. Buat domain publik di menu **Networking**. Tambahkan variabel `APP_URL` berisi URL HTTPS tersebut dan `APP_KEY` berisi kunci tetap. Untuk mendapatkan kunci, jalankan `php artisan key:generate --show` dari salinan lokal yang sudah dipasang dependensinya. Simpan kunci di pengaturan Railway.
4. Deploy ulang setelah volume dan variabel terpasang. Container menjalankan migrasi dan scheduler secara otomatis. Buka domain publik dan coba **Lanjut sebagai tamu**.

Panduan resmi [volume Railway](https://docs.railway.com/volumes) dan [deployment Laravel](https://laravel.com/docs/13.x/deployment).

### Aktifkan email

Isi `EMAIL_ENABLED=true`, `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, dan `MAIL_FROM_ADDRESS` dengan konfigurasi penyedia email. Isi `MAIL_SCHEME=smtps` untuk koneksi TLS langsung jika penyedia menggunakan port 465. Di Railway, pilih layanan yang mengizinkan koneksi SMTP keluar atau gunakan host lain dengan volume persisten. Penjadwal memeriksa pengingat H-2 dan H-1 setiap jam sesuai zona waktu aplikasi. Pengguna terdaftar dapat mengaktifkan atau mematikan pengingat dari Profil. Untuk uji lokal, gunakan `EMAIL_ENABLED=true` dan `MAIL_MAILER=log`, lalu periksa log aplikasi.

Estimasi masa simpan menggunakan aturan kategori dan lokasi penyimpanan dari SQLite. Periksa kondisi bahan serta petunjuk penyimpanan pada kemasan saat menentukan apakah bahan masih layak digunakan.
