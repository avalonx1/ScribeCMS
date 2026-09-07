# 📖 ScribeCMS — Local Journal & Course Knowledge Hub (PostgreSQL)

Aplikasi CMS Jurnal & Kursus Online personal lokal bergaya WordPress/Ghost yang dirancang khusus untuk mencatat dengan format **Markdown**, terhubung ke database **PostgreSQL** lokal (`app_blog`), serta dilengkapi fitur **Smart Rich-Paste Engine** untuk menyalin materi kursus online secara utuh (lengkap dengan video embed, gambar, tautan, tabel, dan format kode).

---

## ✨ Fitur Unggulan

1. **Smart Course Rich-to-Markdown Paste Engine**:
   - Salin (*Copy All*) materi dari website kursus (misalnya Coursera, Udemy, Medium, Substack, YouTube notes, atau dokumentasi teknis).
   - Langsung lakukan **`Ctrl + V`** di editor: sistem secara otomatis mendeteksi HTML clipboard dan mengonversinya menjadi Markdown rapi.
   - **Video Embed Otomatis**: Menyematkan player YouTube, Vimeo, Loom, atau tag `<video>` HTML5 sehingga video bisa langsung diputar di jurnal Anda.
   - **Gambar & Tautan Utuh**: Menjaga seluruh gambar responsif dan link referensi aktif.

2. **Tampilan WordPress & Ghost Reader Mode**:
   - **Dashboard**: Melihat statistik jumlah jurnal, modul kursus, waktu baca, dan catatan favorit.
   - **Course Series Organizer**: Pengelompokan catatan berdasarkan Seri Kursus dan Bab/Modul.
   - **Reader Mode**: Tampilan baca yang elegan dan bersih dengan *Table of Contents* interaktif yang menyorot bagian yang sedang dibaca.
   - **1-Click Code Copy**: Tombol salin kode snippet instan.

3. **Integrasi PostgreSQL Lokal**:
   - Database: `app_blog`
   - User: `postgres`
   - Port: `5432`
   - Opsi backup data ke format JSON dan download file `.md` satuan kapan saja.

---

## 🚀 Cara Menjalankan

1. Pastikan PostgreSQL lokal Anda aktif.
2. Jalankan perintah:
   ```bash
   npm run dev
   ```
3. Buka browser di:
   - Frontend UI: `http://localhost:5173`
   - Backend API: `http://localhost:3001`
