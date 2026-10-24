# Folder model ONNX

Salin berkas model hasil notebook ke folder ini. Nama berkas harus persis seperti di bawah:

| Berkas | Keterangan |
|---|---|
| `yolo11l_best.onnx` | Model utama (dipakai bawaan) |
| `yolov8m_best.onnx` | Pembanding |
| `yolo11m_best.onnx` | Paling ringan |

Cukup berkas `.onnx`. Berkas `.pt` tidak dipakai web dan sudah diabaikan oleh `.gitignore`.

Minimal satu model (`yolo11l_best.onnx`) sudah cukup untuk menjalankan halaman Cek Hama.
Model lain hanya dibutuhkan untuk tombol "Bandingkan 3 model" dan pilihan di Pengaturan lanjutan.

Catatan ukuran: tiap berkas sekitar 77 sampai 99 MB, masih di bawah batas 100 MB per berkas
dari GitHub (GitHub akan menampilkan peringatan untuk berkas di atas 50 MB, itu normal).
Jika suatu saat model ditaruh di luar repositori (misalnya Hugging Face), isi variabel
lingkungan `NEXT_PUBLIC_MODEL_BASE_URL` di Vercel dengan alamat foldernya.
