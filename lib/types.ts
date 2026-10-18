/**
 * lib/types.ts
 *
 * Definisi tipe data untuk AIO PESTGUARD.
 *
 * PENTING UNTUK TIM BACKEND:
 * Nama field di sini sengaja dibuat SAMA PERSIS dengan field yang sudah dikembalikan
 * oleh endpoint FastAPI yang sudah berjalan (app.py), yaitu:
 *   - GET  /health
 *   - GET  /models
 *   - GET  /pestisida dan GET /pestisida/{nama_hama}
 *   - POST /detect
 * Supaya ketika model asli sudah disambungkan, frontend ini tinggal mengganti
 * sumber data (lib/mockData.ts) dengan hasil fetch ke API asli, tanpa perlu
 * mengubah nama field di seluruh komponen.
 *
 * Field tambahan yang BELUM ada di backend saat ini (estimasi stadium hama,
 * agregasi harian per lahan, dan lain-lain) ditandai dengan komentar
 * "BELUM ADA DI BACKEND" supaya jelas mana kontrak yang sudah live dan mana
 * yang masih berupa simulasi/roadmap.
 */

// ---------------------------------------------------------------------------
// Jenis komoditas yang didukung sistem
// ---------------------------------------------------------------------------
export type JenisKomoditas = "Padi" | "Jagung" | "Bawang";

// Tingkat keyakinan model terhadap satu deteksi, dikelompokkan supaya mudah
// dibaca petani (bukan hanya angka persen mentah)
export type TingkatKeyakinanDeteksi = "tinggi" | "sedang" | "rendah";

// Tingkat risiko satu lahan, dihitung dari jumlah deteksi dan ambang batas mingguan
export type TingkatRisikoLahan = "tinggi" | "sedang" | "rendah";

// ---------------------------------------------------------------------------
// Kontrak yang SUDAH SESUAI dengan respons nyata endpoint POST /detect
// ---------------------------------------------------------------------------

/** Satu opsi rekomendasi pestisida, sesuai struktur Referensi_Pestisida_Hama.csv */
export interface RekomendasiPestisida {
  nama_hama_inggris: string;
  nama_ilmiah: string;
  bahan_aktif: string;
  dosis: string;
  contoh_produk: string;
}

/** Koordinat kotak pembatas (bounding box) dalam format x1,y1,x2,y2 piksel, sama seperti bbox_xyxy di app.py */
export type KoordinatKotakDeteksi = [number, number, number, number];

/** Satu hasil deteksi hama dari model, field-nya sama persis dengan respons nyata POST /detect */
export interface HasilDeteksiHama {
  class_id: number;
  class_name_ip102: string;
  nama_indonesia: string;
  komoditas: JenisKomoditas | "tidak diketahui";
  confidence: number;
  bbox_xyxy: KoordinatKotakDeteksi;
  rekomendasi_pestisida: RekomendasiPestisida[];
  ada_rekomendasi_pestisida: boolean;

  // --- Field tambahan hasil olahan frontend, dihitung dari field di atas ---
  idDeteksiUnik: string;
  tingkatKeyakinan: TingkatKeyakinanDeteksi;

  // --- BELUM ADA DI BACKEND: estimasi stadium perkembangan hama ---
  // Direncanakan memakai Data_Hama_AIGRA.csv setelah kalibrasi ukuran piksel selesai.
  estimasiUkuranCm: number | null;
  estimasiStadium: EstimasiStadiumHama | null;
}

/** Respons lengkap satu kali pemanggilan POST /detect, sama seperti respons nyata app.py */
export interface ResponsDeteksi {
  filename: string;
  model_used: string;
  confidence_threshold_used: number;
  jumlah_deteksi: number;
  deteksi: HasilDeteksiHama[];
}

// ---------------------------------------------------------------------------
// BELUM ADA DI BACKEND: estimasi stadium perkembangan hama
// Disiapkan di frontend dulu sebagai simulasi, berdasarkan Data_Hama_AIGRA.csv
// (213 baris data referensi biologis per spesies hama)
// ---------------------------------------------------------------------------
export interface EstimasiStadiumHama {
  namaStadium: string;
  rentangUkuranCm: [number, number];
  rentangDurasiHari: [number, number];
  stadiumBerikutnya: string | null;
  perkiraanHariMenujuStadiumBerikutnya: number | null;
  masaPraOviposisi: {
    tanggalMulai: string;
    tanggalSelesai: string;
  } | null;
  perkiraanTanggalMulaiOviposisi: string | null;
  catatanReferensiBiologis: string;
}

// ---------------------------------------------------------------------------
// BELUM ADA DI BACKEND: sesi pemantauan (hasil satu kali pengambilan citra di lahan)
// Menggabungkan satu gambar perangkap dengan hasil deteksi di atasnya
// ---------------------------------------------------------------------------
export interface SesiPemantauanLahan {
  idSesi: string;
  idLahan: string;
  waktuPengambilan: string;
  labelKamera: string;
  urlGambar: string;
  modelYangDipakai: string;
  ambangBatasKeyakinan: number;
  daftarDeteksi: HasilDeteksiHama[];
}

// ---------------------------------------------------------------------------
// BELUM ADA DI BACKEND: ringkasan per lahan, dihitung dari kumpulan sesi
// (rencana kerja nomor 3 pada README: "agregasi hasil deteksi harian")
// ---------------------------------------------------------------------------
export interface RingkasanLahan {
  idLahan: string;
  namaLahan: string;
  komoditas: JenisKomoditas;
  lokasi: string;
  totalDeteksiHariIni: number;
  totalDeteksiMingguLalu: number;
  hamaDominan: string;
  tingkatRisiko: TingkatRisikoLahan;
  ambangBatasMingguan: number;
  trenTujuhHariTerakhir: number[];
  distribusiKeyakinan: Record<TingkatKeyakinanDeteksi, number>;
  narasiWawasanUtama: string;
  rekomendasiUtama: string;
  perubahanMingguanPersen: number;
  luasHektar: number;
  totalDeteksiMingguIni: number;
  persenDariAmbangBatas: number;
  rataRataKeyakinanHariIni: number;
  daftarLangkahTindakan: string[];
  kunciReferensiHama: string;
}

// ---------------------------------------------------------------------------
// Status kesehatan API, sama seperti respons nyata GET /health
// ---------------------------------------------------------------------------
export interface StatusKesehatanApi {
  status: string;
  models_loaded: string[];
  default_model: string;
  confidence_threshold: number;
  pesticide_reference_loaded: boolean;
  pesticide_reference_entries: number;
}
