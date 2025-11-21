# Finance Class - Laporan Keuangan

File ini dibagi menjadi beberapa berkas agar mudah di-upload ke GitHub dan dapat langsung di-download:

- `index.html` — Halaman utama, mengimpor Tailwind dan Chart.js serta file `styles.css` dan `app.js`.
- `styles.css` — Semua gaya (CSS) diekstrak dari file sumber.
- `app.js` — Semua skrip JavaScript diekstrak dari file sumber.
- `README.md` — Penjelasan singkat (file ini).

Cara pakai:
1. Download semua file (`index.html`, `styles.css`, `app.js`, `README.md`) ke satu folder.
2. Buka `index.html` di browser untuk melihat aplikasi.
3. Untuk upload ke GitHub: buat repository baru, commit dan push ke repo; GitHub Pages bisa digunakan untuk hosting statis.

Catatan:
- File masih mereferensikan `/_sdk/data_sdk.js` dan `/_sdk/element_sdk.js` seperti di sumber asli. Jika tidak diperlukan, hapus atau sesuaikan referensinya.
- Chart.js dan Tailwind diambil dari CDN di header `index.html`.
- Jika ingin satu file HTML yang bisa langsung di-download tanpa dependensi eksternal, beri tahu saya — saya bisa meng-inline CSS dan JS ke `index-single.html`.
