# AIO PESTGUARD

Antarmuka web sistem deteksi hama AIGRA untuk petani padi, jagung, dan bawang. Next.js 14, React, TypeScript, Tailwind CSS. Tema hijau putih, tampil baik di ponsel maupun desktop, dalam tiga bahasa: Indonesia, English, 한국어 (tombol ID / EN / 한 di bagian atas).

Fitur utama **Cek Hama dari Foto** (`/deteksi`) menjalankan model YOLO hasil notebook (format ONNX) **langsung di browser** memakai ONNX Runtime Web. Tidak perlu server inferensi, jadi cukup deploy statis ke Vercel.

## Langkah pertama setelah unzip

1. Salin model ONNX ke `public/models/` dengan nama persis:
   - `yolo11l_best.onnx` (wajib, model utama)
   - `yolov8m_best.onnx` dan `yolo11m_best.onnx` (opsional, untuk fitur bandingkan 3 model)
   Berkas `.pt` tidak dipakai dan sudah diabaikan `.gitignore`.
2. Taruh foto uji di `public/sample-images/`. Tidak perlu mengubah kode, galeri membaca isi folder otomatis.
   - Nama berkas pola IP102 (contoh `IP014000480.jpg`) otomatis dikenali label aslinya, sehingga web bisa menunjukkan apakah tebakan model benar.
   - Untuk nama bebas, isi judul dan label asli di `public/sample-images/keterangan.json`.
3. Jalankan:

```bash
npm install      # juga menyalin ONNX Runtime Web ke public/ort (otomatis)
npm run dev      # http://localhost:3000/deteksi
```

## Deploy ke Vercel

Push ke GitHub seperti biasa, Vercel mendeteksi Next.js otomatis. Tidak ada variabel lingkungan wajib.

- Tiap model sekitar 77 sampai 99 MB, masih di bawah batas 100 MB per berkas GitHub. GitHub menampilkan peringatan untuk berkas di atas 50 MB, itu normal.
- Bila nanti model ditaruh di luar repositori (misalnya Hugging Face), isi `NEXT_PUBLIC_MODEL_BASE_URL` dengan alamat foldernya. Server tersebut harus mengizinkan CORS.
- Bila model diganti dengan berkas baru bernama sama, browser pengguna otomatis mengunduh ulang (dicek lewat ETag).
- Peta memakai OpenFreeMap (gratis, tanpa API key). Untuk memakai gaya peta lain, isi `NEXT_PUBLIC_MAP_STYLE_URL`.

## Tiga bahasa

- Teks antarmuka ditulis langsung di komponen sebagai `{ id, en, ko }` dan dipilih lewat hook `useBahasa()`.
- Isi data (nama hama, gejala, panduan, cara alami, catatan larangan) diterjemahkan di `lib/i18n/kontenTerjemahan.ts` dengan teks Indonesia sebagai kunci. Bila menambah atau mengubah teks Indonesia di data, tambahkan juga terjemahannya di sana; bila lupa, teks Indonesia yang tampil.
- Pilihan bahasa disimpan di browser. JSON `POST /detect` tetap bahasa Indonesia sesuai kontrak backend.

## Data peta

Koordinat lahan dan perangkap ada di `lib/dataPeta.ts` (contoh di Brebes). Ganti dengan GPS perangkap asli saat uji lapangan.

## Halaman

| Rute | Isi |
|---|---|
| `/` | Beranda: peta sebaran hama (titik perangkap berwarna), kartu prediksi per lahan dengan linimasa bertelur (data contoh) |
| `/deteksi` | Cek Hama dari Foto: pilih foto, jalankan model, jawaban bahasa petani, langkah tindakan, kenali hama, bandingkan 3 model, detail teknis |
| `/hama` | Kamus 24 hama: gejala, tempat dan waktu memeriksa, musuh alami, pengendalian, pilihan obat |
| `/riwayat` | Riwayat sesi (data contoh) |
| `/panduan` | Cara kerja sistem, hasil evaluasi model, status, batasan |

Penjelasan lengkap arsitektur dan alur inferensi: `SYSTEM_OVERVIEW.md`.
