/**
 * lib/mockData.ts
 *
 * Data simulasi AIO PESTGUARD.
 *
 * PENTING UNTUK TIM BACKEND:
 * File ini adalah SATU-SATUNYA tempat data palsu berada. Ketika model dan API asli
 * siap, cukup ganti isi fungsi di lib/dataSource.ts agar memanggil API (POST /detect,
 * GET /health, GET /pestisida) lalu mengisi struktur yang sama. Semua komponen dan
 * mesin insight membaca tipe dari lib/types.ts, bukan dari file ini.
 *
 * Data pestisida dan stadium di bawah DIAMBIL dari file asli proyek:
 *   - Referensi_Pestisida_Hama.csv (bahan aktif, dosis, contoh produk)
 *   - Data_Hama_AIGRA.csv (ukuran tubuh dan durasi stadium, dari literatur entomologi)
 * Jumlah deteksi harian, gambar, dan posisi kotak deteksi adalah simulasi.
 */

import type {
  HasilDeteksiHama,
  JenisKomoditas,
  RekomendasiPestisida,
  SesiPemantauanLahan,
  StatusKesehatanApi,
} from "./types";

// Tanggal acuan simulasi: dianggap sebagai "hari ini" pada seluruh aplikasi
export const TANGGAL_ACUAN_SIMULASI_ISO = "2026-10-19T07:00:00+07:00";

// ---------------------------------------------------------------------------
// Data lahan mentah (sebelum diringkas oleh mesin insight)
// ---------------------------------------------------------------------------
export interface DataLahanMentah {
  idLahan: string;
  namaLahan: string;
  komoditas: JenisKomoditas;
  lokasi: string;
  luasHektar: number;
  ambangBatasMingguan: number;
  // Jumlah deteksi per hari, urutan dari 7 hari lalu sampai hari ini
  jumlahDeteksiMingguIni: number[];
  // Jumlah deteksi per hari pada 7 hari sebelumnya, dipakai untuk membandingkan minggu
  jumlahDeteksiMingguLalu: number[];
  namaHamaDominanInggris: string;
}

export const DAFTAR_LAHAN_MENTAH: DataLahanMentah[] = [
  {
    idLahan: "lahan-a",
    namaLahan: "Lahan A",
    komoditas: "Padi",
    lokasi: "Sawah Padi Wanasari, Brebes",
    luasHektar: 1.2,
    ambangBatasMingguan: 60,
    jumlahDeteksiMingguIni: [4, 6, 7, 9, 11, 14, 18],
    jumlahDeteksiMingguLalu: [3, 4, 4, 5, 6, 6, 7],
    namaHamaDominanInggris: "Brown planthopper",
  },
  {
    idLahan: "lahan-b",
    namaLahan: "Lahan B",
    komoditas: "Jagung",
    lokasi: "Kebun Jagung Larangan, Brebes",
    luasHektar: 0.8,
    ambangBatasMingguan: 40,
    jumlahDeteksiMingguIni: [3, 4, 4, 5, 5, 6, 7],
    jumlahDeteksiMingguLalu: [4, 4, 5, 5, 5, 6, 6],
    namaHamaDominanInggris: "Corn borer",
  },
  {
    idLahan: "lahan-c",
    namaLahan: "Lahan C",
    komoditas: "Bawang",
    lokasi: "Kebun Bawang Bulakamba, Brebes",
    luasHektar: 0.5,
    ambangBatasMingguan: 30,
    jumlahDeteksiMingguIni: [2, 2, 3, 2, 3, 2, 2],
    jumlahDeteksiMingguLalu: [3, 3, 2, 3, 3, 2, 3],
    namaHamaDominanInggris: "thrips",
  },
];

// ---------------------------------------------------------------------------
// Referensi pestisida asli dari Referensi_Pestisida_Hama.csv
// Kunci memakai nama hama Inggris yang sudah dinormalisasi (huruf kecil tanpa spasi),
// sama seperti normalize_pest_name() di app.py
// ---------------------------------------------------------------------------
export const REFERENSI_PESTISIDA_PER_HAMA: Record<string, RekomendasiPestisida[]> = {
  brownplanthopper: [
    { nama_hama_inggris: "Brown planthopper", nama_ilmiah: "Nilaparvata lugens", bahan_aktif: "Dinotefuran", dosis: "250 g/l", contoh_produk: "FLYTOP 250 OD" },
    { nama_hama_inggris: "Brown planthopper", nama_ilmiah: "Nilaparvata lugens", bahan_aktif: "Pimetrozin", dosis: "500 g/l", contoh_produk: "Plenum 50 WG" },
    { nama_hama_inggris: "Brown planthopper", nama_ilmiah: "Nilaparvata lugens", bahan_aktif: "Buprofezin", dosis: "100 g/l", contoh_produk: "Lugen 100 EC" },
    { nama_hama_inggris: "Brown planthopper", nama_ilmiah: "Nilaparvata lugens", bahan_aktif: "Pimetrozin + Fipronil", dosis: "500 g/l + 100 g/l", contoh_produk: "ALDES 50/10 WG" },
  ],
  cornborer: [
    { nama_hama_inggris: "Corn borer", nama_ilmiah: "Ostrinia furnacalis", bahan_aktif: "Chlorantraniliprole", dosis: "50 g/l (SC) / 185 g/l - 200 g/l (SC lain)", contoh_produk: "Klorantraniliprole 18.5% SC, 200 g/l SC" },
    { nama_hama_inggris: "Corn borer", nama_ilmiah: "Ostrinia furnacalis", bahan_aktif: "Triazophos + Phoxim", dosis: "50 g/l + 220 g/l (dosis aplikasi 500-650 ml/ha)", contoh_produk: "Triazophos 5% + Phoxim 22% EC" },
  ],
  // Thrips bawang SENGAJA kosong: CSV pestisida saat ini hanya memuat thrips padi
  // (Grain spreader thrips), bukan thrips bawang. Ini mendemonstrasikan kasus
  // ada_rekomendasi_pestisida = false pada kontrak backend.
};

// ---------------------------------------------------------------------------
// Referensi stadium asli dari Data_Hama_AIGRA.csv (ukuran dalam milimeter)
// ---------------------------------------------------------------------------
export interface BarisReferensiStadium {
  namaStadium: string;
  ukuranMinimumMm: number;
  ukuranMaksimumMm: number;
  durasiMinimumHari: number;
  durasiMaksimumHari: number;
  keteranganSingkat: string;
}

export interface ReferensiBiologisHama {
  daftarStadiumUrut: BarisReferensiStadium[];
  masaPraOviposisiHari: [number, number] | null;
  catatanSumber: string;
}

export const REFERENSI_STADIUM_PER_HAMA: Record<string, ReferensiBiologisHama> = {
  brownplanthopper: {
    daftarStadiumUrut: [
      { namaStadium: "Nimfa instar I", ukuranMinimumMm: 1.2, ukuranMaksimumMm: 1.2, durasiMinimumHari: 2, durasiMaksimumHari: 3, keteranganSingkat: "Baru menetas, putih seperti kapas" },
      { namaStadium: "Nimfa instar II", ukuranMinimumMm: 2.18, ukuranMaksimumMm: 2.18, durasiMinimumHari: 2, durasiMaksimumHari: 3, keteranganSingkat: "Membesar, bakal sayap mulai terlihat" },
      { namaStadium: "Nimfa instar III", ukuranMinimumMm: 2.63, ukuranMaksimumMm: 2.63, durasiMinimumHari: 2, durasiMaksimumHari: 3, keteranganSingkat: "Bakal sayap makin berkembang" },
      { namaStadium: "Nimfa instar IV", ukuranMinimumMm: 3.05, ukuranMaksimumMm: 3.05, durasiMinimumHari: 2, durasiMaksimumHari: 3, keteranganSingkat: "Bentuk tubuh makin mirip dewasa" },
      { namaStadium: "Nimfa instar V", ukuranMinimumMm: 3.32, ukuranMaksimumMm: 3.32, durasiMinimumHari: 4, durasiMaksimumHari: 4, keteranganSingkat: "Instar terakhir sebelum dewasa" },
      { namaStadium: "Dewasa betina bersayap pendek", ukuranMinimumMm: 3.21, ukuranMaksimumMm: 3.4, durasiMinimumHari: 10, durasiMaksimumHari: 21, keteranganSingkat: "Siap bertelur, pra-oviposisi sekitar 3 hari" },
    ],
    masaPraOviposisiHari: [3, 3],
    catatanSumber: "Data_Hama_AIGRA.csv, kelompok brown plant hopper (literatur entomologi)",
  },
  cornborer: {
    daftarStadiumUrut: [
      { namaStadium: "Larva instar I", ukuranMinimumMm: 1, ukuranMaksimumMm: 3, durasiMinimumHari: 3, durasiMaksimumHari: 6, keteranganSingkat: "Baru menetas, putih hampir transparan" },
      { namaStadium: "Larva instar V", ukuranMinimumMm: 4, ukuranMaksimumMm: 25, durasiMinimumHari: 5, durasiMaksimumHari: 11, keteranganSingkat: "Larva akhir, fase paling merusak batang" },
      { namaStadium: "Pupa", ukuranMinimumMm: 10, ukuranMaksimumMm: 10, durasiMinimumHari: 5, durasiMaksimumHari: 8, keteranganSingkat: "Pupa cokelat" },
    ],
    masaPraOviposisiHari: [1, 3],
    catatanSumber: "Data_Hama_AIGRA.csv, kelompok corn borer. Batas bawah ukuran larva instar V adalah perkiraan karena data sumber hanya mencantumkan batas atas 25 mm.",
  },
  thrips: {
    daftarStadiumUrut: [
      { namaStadium: "Larva instar I", ukuranMinimumMm: 0.35, ukuranMaksimumMm: 0.38, durasiMinimumHari: 2, durasiMaksimumHari: 3, keteranganSingkat: "Putih semi-transparan, mulai makan segera" },
      { namaStadium: "Larva instar II", ukuranMinimumMm: 0.7, ukuranMaksimumMm: 0.9, durasiMinimumHari: 3, durasiMaksimumHari: 6, keteranganSingkat: "Kuning, paling melimpah di lapangan" },
      { namaStadium: "Dewasa betina", ukuranMinimumMm: 1.1, ukuranMaksimumMm: 1.2, durasiMinimumHari: 20, durasiMaksimumHari: 30, keteranganSingkat: "Umumnya bereproduksi tanpa pejantan" },
    ],
    masaPraOviposisiHari: null,
    catatanSumber: "Data_Hama_AIGRA.csv, kelompok thrips bawang",
  },
};

// ---------------------------------------------------------------------------
// Pembuat data deteksi simulasi
// Nilai ukuran dan stadium TIDAK diisi di sini, melainkan dihitung oleh mesin insight
// ---------------------------------------------------------------------------
interface ParameterDeteksiSimulasi {
  idDeteksiUnik: string;
  classId: number;
  namaIp102: string;
  namaIndonesia: string;
  komoditas: JenisKomoditas;
  confidence: number;
  kotakXyxy: [number, number, number, number];
  kunciReferensi: string;
  estimasiUkuranMm: number | null;
}

function buatDeteksiSimulasi(parameter: ParameterDeteksiSimulasi): HasilDeteksiHama {
  const daftarPestisida = REFERENSI_PESTISIDA_PER_HAMA[parameter.kunciReferensi] ?? [];
  const tingkatKeyakinan =
    parameter.confidence >= 0.75 ? "tinggi" : parameter.confidence >= 0.5 ? "sedang" : "rendah";
  return {
    class_id: parameter.classId,
    class_name_ip102: parameter.namaIp102,
    nama_indonesia: parameter.namaIndonesia,
    komoditas: parameter.komoditas,
    confidence: parameter.confidence,
    bbox_xyxy: parameter.kotakXyxy,
    rekomendasi_pestisida: daftarPestisida,
    ada_rekomendasi_pestisida: daftarPestisida.length > 0,
    idDeteksiUnik: parameter.idDeteksiUnik,
    tingkatKeyakinan,
    estimasiUkuranCm: parameter.estimasiUkuranMm === null ? null : parameter.estimasiUkuranMm / 10,
    estimasiStadium: null,
  };
}

// Ukuran gambar simulasi, dipakai untuk menggambar kotak deteksi dengan persen
export const LEBAR_GAMBAR_SIMULASI_PIKSEL = 1280;
export const TINGGI_GAMBAR_SIMULASI_PIKSEL = 720;

// ---------------------------------------------------------------------------
// Sesi pemantauan simulasi (hasil pengambilan citra perangkap)
// ---------------------------------------------------------------------------
export const DAFTAR_SESI_PEMANTAUAN: SesiPemantauanLahan[] = [
  {
    idSesi: "SES-20261019-A1",
    idLahan: "lahan-a",
    waktuPengambilan: "2026-10-19T06:30:00+07:00",
    labelKamera: "Perangkap A1 (pagi)",
    urlGambar: "simulasi-lahan-a",
    modelYangDipakai: "yolo11l",
    ambangBatasKeyakinan: 0.35,
    daftarDeteksi: [
      buatDeteksiSimulasi({ idDeteksiUnik: "A1-D1", classId: 3, namaIp102: "brown planthopper", namaIndonesia: "Wereng Batang Coklat", komoditas: "Padi", confidence: 0.91, kotakXyxy: [180, 210, 330, 330], kunciReferensi: "brownplanthopper", estimasiUkuranMm: 3.05 }),
      buatDeteksiSimulasi({ idDeteksiUnik: "A1-D2", classId: 3, namaIp102: "brown planthopper", namaIndonesia: "Wereng Batang Coklat", komoditas: "Padi", confidence: 0.84, kotakXyxy: [520, 140, 650, 250], kunciReferensi: "brownplanthopper", estimasiUkuranMm: 3.3 }),
      buatDeteksiSimulasi({ idDeteksiUnik: "A1-D3", classId: 3, namaIp102: "brown planthopper", namaIndonesia: "Wereng Batang Coklat", komoditas: "Padi", confidence: 0.78, kotakXyxy: [760, 360, 880, 470], kunciReferensi: "brownplanthopper", estimasiUkuranMm: 2.63 }),
      buatDeteksiSimulasi({ idDeteksiUnik: "A1-D4", classId: 3, namaIp102: "brown planthopper", namaIndonesia: "Wereng Batang Coklat", komoditas: "Padi", confidence: 0.66, kotakXyxy: [950, 190, 1060, 290], kunciReferensi: "brownplanthopper", estimasiUkuranMm: 3.3 }),
      buatDeteksiSimulasi({ idDeteksiUnik: "A1-D5", classId: 3, namaIp102: "brown planthopper", namaIndonesia: "Wereng Batang Coklat", komoditas: "Padi", confidence: 0.47, kotakXyxy: [330, 480, 430, 570], kunciReferensi: "brownplanthopper", estimasiUkuranMm: 2.18 }),
    ],
  },
  {
    idSesi: "SES-20261018-A2",
    idLahan: "lahan-a",
    waktuPengambilan: "2026-10-18T17:10:00+07:00",
    labelKamera: "Perangkap A1 (sore)",
    urlGambar: "simulasi-lahan-a",
    modelYangDipakai: "yolo11l",
    ambangBatasKeyakinan: 0.35,
    daftarDeteksi: [
      buatDeteksiSimulasi({ idDeteksiUnik: "A2-D1", classId: 3, namaIp102: "brown planthopper", namaIndonesia: "Wereng Batang Coklat", komoditas: "Padi", confidence: 0.88, kotakXyxy: [250, 260, 370, 360], kunciReferensi: "brownplanthopper", estimasiUkuranMm: 3.05 }),
      buatDeteksiSimulasi({ idDeteksiUnik: "A2-D2", classId: 3, namaIp102: "brown planthopper", namaIndonesia: "Wereng Batang Coklat", komoditas: "Padi", confidence: 0.73, kotakXyxy: [640, 200, 760, 300], kunciReferensi: "brownplanthopper", estimasiUkuranMm: 2.63 }),
      buatDeteksiSimulasi({ idDeteksiUnik: "A2-D3", classId: 3, namaIp102: "brown planthopper", namaIndonesia: "Wereng Batang Coklat", komoditas: "Padi", confidence: 0.52, kotakXyxy: [880, 420, 990, 520], kunciReferensi: "brownplanthopper", estimasiUkuranMm: 2.18 }),
    ],
  },
  {
    idSesi: "SES-20261019-B1",
    idLahan: "lahan-b",
    waktuPengambilan: "2026-10-19T06:45:00+07:00",
    labelKamera: "Perangkap B1 (pagi)",
    urlGambar: "simulasi-lahan-b",
    modelYangDipakai: "yolo11l",
    ambangBatasKeyakinan: 0.35,
    daftarDeteksi: [
      buatDeteksiSimulasi({ idDeteksiUnik: "B1-D1", classId: 11, namaIp102: "corn borer", namaIndonesia: "Penggerek Batang Jagung", komoditas: "Jagung", confidence: 0.83, kotakXyxy: [300, 250, 520, 360], kunciReferensi: "cornborer", estimasiUkuranMm: 22 }),
      buatDeteksiSimulasi({ idDeteksiUnik: "B1-D2", classId: 11, namaIp102: "corn borer", namaIndonesia: "Penggerek Batang Jagung", komoditas: "Jagung", confidence: 0.71, kotakXyxy: [700, 330, 900, 430], kunciReferensi: "cornborer", estimasiUkuranMm: 18 }),
      buatDeteksiSimulasi({ idDeteksiUnik: "B1-D3", classId: 11, namaIp102: "corn borer", namaIndonesia: "Penggerek Batang Jagung", komoditas: "Jagung", confidence: 0.55, kotakXyxy: [940, 160, 1100, 250], kunciReferensi: "cornborer", estimasiUkuranMm: 10 }),
    ],
  },
  {
    idSesi: "SES-20261019-C1",
    idLahan: "lahan-c",
    waktuPengambilan: "2026-10-19T06:55:00+07:00",
    labelKamera: "Perangkap C1 (pagi)",
    urlGambar: "simulasi-lahan-c",
    modelYangDipakai: "yolo11l",
    ambangBatasKeyakinan: 0.35,
    daftarDeteksi: [
      buatDeteksiSimulasi({ idDeteksiUnik: "C1-D1", classId: 20, namaIp102: "thrips", namaIndonesia: "Thrips", komoditas: "Bawang", confidence: 0.58, kotakXyxy: [410, 300, 480, 360], kunciReferensi: "thrips", estimasiUkuranMm: 1.15 }),
      buatDeteksiSimulasi({ idDeteksiUnik: "C1-D2", classId: 20, namaIp102: "thrips", namaIndonesia: "Thrips", komoditas: "Bawang", confidence: 0.41, kotakXyxy: [820, 220, 880, 280], kunciReferensi: "thrips", estimasiUkuranMm: 0.8 }),
    ],
  },
];

// ---------------------------------------------------------------------------
// Status kesehatan API simulasi, bentuknya sama dengan respons GET /health
// ---------------------------------------------------------------------------
export const STATUS_KESEHATAN_API_SIMULASI: StatusKesehatanApi = {
  status: "ok",
  models_loaded: ["yolo11l", "yolo11m", "yolov8m"],
  default_model: "yolo11l",
  confidence_threshold: 0.35,
  pesticide_reference_loaded: true,
  pesticide_reference_entries: 24,
};

// ---------------------------------------------------------------------------
// Hasil evaluasi model asli (dari README dan executive_summary.txt)
// ---------------------------------------------------------------------------
export interface HasilEvaluasiModel {
  namaModel: string;
  presisi: number;
  recall: number;
  skorF1: number;
  map50: number;
  map50Sampai95: number;
  ukuranBerkasMb: number;
  adalahModelUtama: boolean;
}

export const HASIL_EVALUASI_MODEL: HasilEvaluasiModel[] = [
  { namaModel: "YOLO11l", presisi: 0.653, recall: 0.854, skorF1: 0.74, map50: 0.794, map50Sampai95: 0.515, ukuranBerkasMb: 48.9, adalahModelUtama: true },
  { namaModel: "YOLOv8m", presisi: 0.598, recall: 0.82, skorF1: 0.691, map50: 0.76, map50Sampai95: 0.49, ukuranBerkasMb: 49.6, adalahModelUtama: false },
  { namaModel: "YOLO11m", presisi: 0.627, recall: 0.763, skorF1: 0.688, map50: 0.754, map50Sampai95: 0.479, ukuranBerkasMb: 38.7, adalahModelUtama: false },
];

// ---------------------------------------------------------------------------
// Status pengerjaan proyek, dipakai halaman "Cara Kerja Sistem"
// ---------------------------------------------------------------------------
export interface TahapProyek {
  namaTahap: string;
  status: "selesai" | "berjalan" | "rencana";
  penjelasanUntukPetani: string;
  penjelasanTeknis: string;
}

export const DAFTAR_TAHAP_PROYEK: TahapProyek[] = [
  { namaTahap: "Persiapan data hama", status: "selesai", penjelasanUntukPetani: "Ribuan foto hama dikumpulkan dan dilabeli supaya sistem belajar mengenali 24 jenis hama.", penjelasanTeknis: "Dataset IP102, 24 kelas, dipetakan ke padi, jagung, bawang." },
  { namaTahap: "Pelatihan model pengenal hama", status: "selesai", penjelasanUntukPetani: "Tiga model dibandingkan, lalu dipilih yang paling jeli menemukan hama.", penjelasanTeknis: "YOLOv8m, YOLO11m, YOLO11l dilatih dan dievaluasi, YOLO11l terbaik dengan mAP50 0,794." },
  { namaTahap: "Layanan deteksi (API)", status: "selesai", penjelasanUntukPetani: "Foto dari perangkap dikirim ke sistem dan dijawab dengan jenis hama beserta saran obatnya.", penjelasanTeknis: "FastAPI dengan endpoint /health, /models, /pestisida, /detect, teruji lokal." },
  { namaTahap: "Antarmuka web AIO PESTGUARD", status: "berjalan", penjelasanUntukPetani: "Tampilan yang sedang Bapak dan Ibu lihat ini. Beranda dan riwayat masih memakai data contoh.", penjelasanTeknis: "Next.js, React, Tailwind. Kontrak data sama dengan API asli." },
  { namaTahap: "Cek hama dari foto di browser", status: "selesai", penjelasanUntukPetani: "Model pengenal hama asli bisa dicoba langsung di ponsel atau laptop, tanpa kirim foto ke server.", penjelasanTeknis: "Model ONNX (YOLO11l, YOLOv8m, YOLO11m) dijalankan dengan ONNX Runtime Web, pascaproses NMS meniru Ultralytics." },
  { namaTahap: "Kalibrasi ukuran piksel ke sentimeter", status: "rencana", penjelasanUntukPetani: "Supaya ukuran hama bisa dihitung dengan benar, sehingga umur hama bisa diperkirakan.", penjelasanTeknis: "Memakai dimensi wadah perangkap sebagai acuan skala." },
  { namaTahap: "Estimasi stadium dan waktu bertelur", status: "rencana", penjelasanUntukPetani: "Sistem memperkirakan hama masih muda atau sudah dewasa, dan kapan mulai bertelur.", penjelasanTeknis: "Data_Hama_AIGRA.csv, 213 baris referensi biologis, belum diimplementasi di backend." },
  { namaTahap: "Uji lapangan dengan perangkap asli", status: "rencana", penjelasanUntukPetani: "Alat dipasang di lahan sungguhan untuk menguji keakuratan.", penjelasanTeknis: "Citra asli perangkap, uji ketahanan terhadap cahaya dan gangguan citra." },
];
