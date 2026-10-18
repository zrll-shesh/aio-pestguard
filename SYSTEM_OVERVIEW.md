# AIO PESTGUARD: Penjelasan Sistem Lengkap

Dokumen ini menjelaskan apa itu AIO PESTGUARD, bagaimana alurnya dari foto sampai tindakan petani, bagaimana kode disusun, dan titik mana yang perlu disambungkan oleh tim backend. Status saat ini: **simulasi frontend**. Model deteksi asli belum disambungkan.

## 1. Tujuan

AIO PESTGUARD adalah antarmuka web untuk memantau hama di lahan padi, jagung, dan bawang. Pengguna utamanya petani, sehingga semua angka diterjemahkan menjadi kalimat sederhana, tingkat risiko, dan langkah tindakan. Tampilan dibuat hijau dan putih.

Simulasi ini menjawab tiga pertanyaan petani:

1. Lahan mana yang paling bermasalah hari ini?
2. Hamanya apa, seberapa banyak, dan apakah makin parah?
3. Apa yang harus saya lakukan, dan obat apa pilihannya?

## 2. Alur Sistem End to End

```
Perangkap di lahan memotret hama
  -> POST /detect (FastAPI, model YOLO11l, ambang keyakinan 0,35)
  -> daftar deteksi: jenis hama, keyakinan, kotak (bbox_xyxy), rekomendasi pestisida
  -> [BELUM ADA] kalibrasi piksel ke cm -> estimasi ukuran
  -> [BELUM ADA] estimasi stadium dan masa bertelur (Data_Hama_AIGRA.csv)
  -> [BELUM ADA] agregasi harian per lahan dan minggu
  -> mesin wawasan: risiko, narasi, rekomendasi, langkah tindakan
  -> antarmuka AIO PESTGUARD (Beranda, Riwayat Sesi, Cara Kerja Sistem)
  -> petani menyalin atau mengunduh wawasan
```

Pada simulasi ini, bagian "BELUM ADA" dihitung di frontend dari data contoh, agar petani dan PIC bisa menilai bentuk akhirnya lebih dulu.

## 3. Halaman

| Rute | Isi |
|---|---|
| `/` Beranda Lahan | Ringkasan hari ini, wawasan lahan terpilih (tombol Salin dan Unduh), 4 angka kunci, peringkat lahan, tren 7 hari, distribusi keyakinan, langkah tindakan, foto perangkap dengan kotak deteksi, tabel spesies, panel wawasan hama (fase hidup, perkiraan bertelur, pilihan obat) |
| `/riwayat` Riwayat Sesi | Tabel semua sesi foto, saring per lahan |
| `/riwayat/[sessionId]` | Detail satu sesi, memakai komponen analisis yang sama dengan Beranda, plus tombol Salin dan Unduh |
| `/panduan` Cara Kerja Sistem | Alur 5 langkah, arti istilah, hasil evaluasi 3 model, status pengerjaan, batasan sistem |

## 4. Struktur Kode

```
app/                      Rute Next.js (App Router)
  layout.tsx              Kerangka: sidebar, topbar, font
  page.tsx                Beranda
  riwayat/page.tsx        Daftar sesi
  riwayat/[sessionId]/    Detail sesi
  panduan/page.tsx        Cara kerja sistem
components/
  layout/                 SidebarNavigasi, TopbarAplikasi
  ui/                     KartuDasar, LencanaStatus, TombolSalinDanUnduh
  dashboard/              Komponen beranda dan analisis sesi
  history/                TabelRiwayatSesi
lib/
  types.ts                Kontrak data (sama dengan respons API asli)
  mockData.ts             SATU-SATUNYA tempat data simulasi
  insightEngine.ts        Fungsi murni penghitung wawasan
  dataSource.ts           Titik sambung ke backend
  utils.ts                Format tanggal, salin, unduh
```

Aturan arsitektur: komponen hanya mengimpor dari `lib/dataSource.ts` dan `lib/types.ts`, tidak langsung dari `mockData.ts`.

## 5. Kontrak Data untuk Tim Backend

Nama field di `lib/types.ts` bagian "SUDAH SESUAI" sama persis dengan respons `POST /detect` pada `app.py` yang sudah berjalan:

```json
{
  "filename": "...",
  "model_used": "yolo11l",
  "confidence_threshold_used": 0.35,
  "jumlah_deteksi": 5,
  "deteksi": [
    {
      "class_id": 3,
      "class_name_ip102": "brown planthopper",
      "nama_indonesia": "Wereng Batang Coklat",
      "komoditas": "Padi",
      "confidence": 0.91,
      "bbox_xyxy": [180, 210, 330, 330],
      "rekomendasi_pestisida": [
        { "nama_hama_inggris": "...", "nama_ilmiah": "...", "bahan_aktif": "...", "dosis": "...", "contoh_produk": "..." }
      ],
      "ada_rekomendasi_pestisida": true
    }
  ]
}
```

Field tambahan yang **belum ada di backend** dan dihitung sementara di frontend:

| Field | Keterangan | Kebutuhan backend |
|---|---|---|
| `estimasiUkuranCm` | Ukuran hama | Kalibrasi piksel ke cm memakai dimensi wadah perangkap |
| `estimasiStadium` | Fase hidup, hari ke fase berikutnya, masa pra-oviposisi, tanggal mulai bertelur | Endpoint atau modul yang membaca `Data_Hama_AIGRA.csv` |
| `SesiPemantauanLahan` | Satu foto beserta deteksinya, dengan `idSesi`, `idLahan`, `waktuPengambilan`, `labelKamera` | Penyimpanan riwayat sesi dan endpoint daftar sesi |
| `RingkasanLahan` | Total harian, mingguan, tren 7 hari, ambang batas | Agregasi harian per lahan |

Pemetaan penyambungan di `lib/dataSource.ts`:

| Fungsi frontend | Sambungan |
|---|---|
| `ambilStatusKesehatanApi()` | `GET /health` |
| `ambilSesiPemantauan()` | endpoint riwayat sesi (baru), isinya hasil `POST /detect` per foto |
| `ambilRingkasanSemuaLahan()` | endpoint agregasi (baru), atau tetap dihitung frontend dengan `buatRingkasanLahan()` |

Catatan: fungsi di `dataSource.ts` saat ini sinkron. Saat disambungkan ke API, ubah menjadi `async` dan sesuaikan pemanggilnya di `app/*.tsx` (server component dapat memakai `await` langsung).

## 6. Logika Wawasan (`lib/insightEngine.ts`)

Semua fungsi murni dan aturannya dikumpulkan sebagai konstanta di bagian atas file.

**Tingkat keyakinan satu deteksi**: 0,75 ke atas = tinggi (Yakin), 0,50 sampai 0,74 = sedang (Cukup yakin), di bawah 0,50 = rendah (Kurang yakin).

**Perubahan mingguan**: `(minggu ini - minggu lalu) / minggu lalu`, dalam persen.

**Tingkat risiko lahan**, dari total deteksi minggu ini dibanding `ambangBatasMingguan`:
- 100 persen atau lebih: Tinggi
- 60 sampai 99 persen: Waspada, naik menjadi Tinggi bila lonjakan mingguan 50 persen atau lebih
- di bawah 60 persen: Aman

**Estimasi stadium** (`perkirakanStadiumHama`): ukuran tubuh (mm) dicocokkan dengan rentang ukuran tiap stadium pada referensi. Bila tidak ada yang cocok, dipilih stadium dengan titik tengah terdekat. Hari menuju dewasa adalah jumlah durasi maksimum stadium dari yang sekarang sampai sebelum dewasa. Perkiraan mulai bertelur adalah tanggal tiba dewasa ditambah durasi minimum pra-oviposisi.

**Narasi dan rekomendasi**: kalimat disusun dari angka (total, ambang, perubahan, keyakinan rata-rata, risiko). Bila keyakinan rata-rata di bawah 0,60, sistem menambahkan permintaan cek langsung ke lahan. Bila tidak ada referensi pestisida, sistem mengarahkan ke penyuluh pertanian lapangan.

**Teks Salin dan Unduh** (`susunTeksWawasanUntukSalinan`): laporan teks polos berisi lahan, risiko, angka minggu ini, ringkasan, rekomendasi, langkah tindakan, data sesi terbaru, dan catatan batasan.

## 7. Data Simulasi: Mana yang Asli, Mana yang Contoh

**Asli dari proyek**
- Pilihan pestisida Wereng Batang Coklat dan Penggerek Batang Jagung (`Referensi_Pestisida_Hama.csv`).
- Ukuran dan durasi stadium (`Data_Hama_AIGRA.csv`): wereng coklat, penggerek jagung, thrips bawang. Batas bawah ukuran larva instar V penggerek jagung adalah perkiraan karena sumber hanya mencatat batas atas 25 mm.
- Hasil evaluasi tiga model (YOLO11l, YOLOv8m, YOLO11m) pada 110 gambar uji.
- Ambang keyakinan 0,35 dan model utama YOLO11l.

**Contoh (simulasi)**
- Jumlah deteksi harian dan mingguan, ambang batas mingguan tiap lahan, nama lahan dan lokasi.
- Foto perangkap (digambar dengan SVG), posisi kotak, ukuran hama.
- Tanggal acuan: 19 Oktober 2026.
- Nilai `pesticide_reference_entries` pada status API.

**Kasus uji yang sengaja dimasukkan**
- Lahan A (padi): risiko tinggi, wereng naik 97 persen.
- Lahan B (jagung): waspada, hampir stabil.
- Lahan C (bawang): aman, thrips dengan keyakinan rendah dan **tanpa** data pestisida, untuk memperlihatkan `ada_rekomendasi_pestisida: false` dan keterbatasan kelas bawang.

## 8. Keterbatasan yang Ditampilkan ke Pengguna

- Tampilan masih simulasi.
- Estimasi fase hama dan masa bertelur belum dikalibrasi dengan citra perangkap asli.
- Kelas bawang masih umum sehingga keyakinan cenderung lebih rendah.
- Pilihan obat berasal dari referensi AIGRA, bukan pengganti penyuluh pertanian lapangan.

## 9. Warna dan Aksesibilitas

Palet utama hijau dan putih (token `pestguard*` di `tailwind.config.ts`). Merah dan kuning dipakai sangat terbatas hanya untuk peringatan (risiko tinggi, waspada, keyakinan rendah) supaya mudah dibaca petani. Status tidak hanya dibedakan warna, selalu ada label teks. Grafik dan foto memiliki `aria-label`.

## 10. Menjalankan dan Deploy

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # validasi produksi
```

Deploy ke Vercel: push ke GitHub, impor repositori di Vercel, framework terdeteksi otomatis sebagai Next.js, tanpa variabel lingkungan. Font (Fraunces, IBM Plex Sans, IBM Plex Mono) dimuat dari Google Fonts saat build, jadi build membutuhkan akses internet, yang tersedia di Vercel.

## 11. Langkah Menuju Integrasi Model

1. Ubah `lib/dataSource.ts` menjadi `async` dan panggil API (`/health`, `/detect`, endpoint sesi dan agregasi).
2. Ganti latar SVG pada `PanelGambarDeteksi.tsx` dengan foto asli (`urlGambar`), kotak tetap memakai `bbox_xyxy` dibagi ukuran gambar asli (lebar dan tinggi gambar perlu dikirim API atau dibaca dari gambar).
3. Tambahkan estimasi ukuran dan stadium di backend, lalu hapus `lengkapiDeteksiDenganStadium` di frontend.
4. Pindahkan agregasi harian ke backend bila volume data besar.
5. Tambahkan unggah foto manual (`POST /detect`) bila dibutuhkan.
6. Aktifkan CORS di FastAPI untuk domain Vercel.
