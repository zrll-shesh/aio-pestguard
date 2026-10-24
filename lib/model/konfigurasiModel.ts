/**
 * lib/model/konfigurasiModel.ts
 *
 * Daftar model ONNX yang bisa dipilih di halaman Uji Deteksi, beserta seluruh angka
 * evaluasi dari FINAL_OBJECT_DETECTION_AIGRA.ipynb. Semua angka di file ini ASLI dari
 * keluaran notebook (data uji 110 gambar, 144 objek), bukan simulasi.
 *
 * Letak berkas model: public/models/<namaBerkas>. Nama berkas sengaja sama dengan
 * paket ekspor notebook (yolo11l_best.onnx, dst.) supaya tinggal disalin.
 *
 * Bila model ingin di-host di tempat lain (misalnya karena batas ukuran repositori),
 * isi variabel lingkungan NEXT_PUBLIC_MODEL_BASE_URL, contoh:
 *   NEXT_PUBLIC_MODEL_BASE_URL=https://huggingface.co/<akun>/<repo>/resolve/main
 * Server tersebut wajib mengizinkan CORS.
 */

export interface KonfigurasiModel {
  idModel: "yolo11l" | "yolov8m" | "yolo11m";
  namaTampilan: string;
  namaBerkas: string;
  peran: string;
  ringkasan: string;
  adalahDefault: boolean;
  /** Ukuran berkas ONNX dari log ekspor notebook, null bila tidak tercatat */
  perkiraanUkuranOnnxMb: number | null;
  jumlahParameterJuta: number;
  gflops: number;
  /** Kecepatan pada GPU Tesla T4 saat evaluasi notebook (ms per gambar) */
  kecepatanGpuT4Ms: number;
  metrikUji: {
    presisi: number;
    recall: number;
    f1: number;
    map50: number;
    map75: number;
    map50Sampai95: number;
  };
  map50Validasi: number;
  /** F1 pada ambang 0,35 (pencocokan IoU 0,5) dengan interval kepercayaan 95% bootstrap */
  f1Bootstrap: { titik: number; bawah: number; atas: number };
}

export const UKURAN_MASUKAN_MODEL = 640;
export const AMBANG_KEYAKINAN_DEFAULT = 0.35;
/** Ambang IoU NMS bawaan Ultralytics saat predict */
export const AMBANG_IOU_NMS = 0.7;
export const MAKS_DETEKSI = 300;
/** Kandidat di bawah ambang ini dibuang sejak awal; penggeser ambang di layar mulai dari sini */
export const AMBANG_KANDIDAT_MINIMUM = 0.05;
/** Naikkan angka ini bila mengganti berkas model dengan versi baru agar cache browser diperbarui */
export const VERSI_CACHE_MODEL = "v1";

export const DAFTAR_MODEL: KonfigurasiModel[] = [
  {
    idModel: "yolo11l",
    namaTampilan: "YOLO11l",
    namaBerkas: "yolo11l_best.onnx",
    peran: "Model utama",
    ringkasan: "mAP50 tertinggi dan paling jeli menemukan hama (recall 85%). Dipilih notebook sebagai model utama.",
    adalahDefault: true,
    perkiraanUkuranOnnxMb: 96.9,
    jumlahParameterJuta: 25.3,
    gflops: 86.9,
    kecepatanGpuT4Ms: 41.4,
    metrikUji: { presisi: 0.6533, recall: 0.8543, f1: 0.7404, map50: 0.7937, map75: 0.5637, map50Sampai95: 0.515 },
    map50Validasi: 0.8471,
    f1Bootstrap: { titik: 0.766, bawah: 0.6972, atas: 0.8311 },
  },
  {
    idModel: "yolov8m",
    namaTampilan: "YOLOv8m",
    namaBerkas: "yolov8m_best.onnx",
    peran: "Pembanding",
    ringkasan: "F1 bootstrap sedikit lebih tinggi pada ambang 35%, dengan selisih val ke uji paling kecil (paling konsisten).",
    adalahDefault: false,
    perkiraanUkuranOnnxMb: 98.9,
    jumlahParameterJuta: 25.85,
    gflops: 78.8,
    kecepatanGpuT4Ms: 31.4,
    metrikUji: { presisi: 0.5977, recall: 0.8201, f1: 0.6915, map50: 0.7603, map75: 0.5616, map50Sampai95: 0.4904 },
    map50Validasi: 0.8082,
    f1Bootstrap: { titik: 0.7751, bawah: 0.7112, atas: 0.8344 },
  },
  {
    idModel: "yolo11m",
    namaTampilan: "YOLO11m",
    namaBerkas: "yolo11m_best.onnx",
    peran: "Paling ringan",
    ringkasan: "Parameter dan komputasi paling kecil sehingga paling cepat, dengan akurasi sedikit di bawah YOLO11l.",
    adalahDefault: false,
    perkiraanUkuranOnnxMb: null,
    jumlahParameterJuta: 20.05,
    gflops: 67.9,
    kecepatanGpuT4Ms: 26.9,
    metrikUji: { presisi: 0.6271, recall: 0.763, f1: 0.6884, map50: 0.7538, map75: 0.518, map50Sampai95: 0.4788 },
    map50Validasi: 0.8123,
    f1Bootstrap: { titik: 0.7664, bawah: 0.6843, atas: 0.8497 },
  },
];

export function ambilKonfigurasiModel(idModel: string): KonfigurasiModel {
  return DAFTAR_MODEL.find((model) => model.idModel === idModel) ?? DAFTAR_MODEL[0];
}

export function susunUrlModel(model: KonfigurasiModel): string {
  const alamatDasar = (process.env.NEXT_PUBLIC_MODEL_BASE_URL ?? "/models").replace(/\/$/, "");
  return `${alamatDasar}/${model.namaBerkas}`;
}

// ---------------------------------------------------------------------------
// Bukti evaluasi tambahan dari notebook (model yolo11l, data uji)
// ---------------------------------------------------------------------------

/** Diagram kalibrasi: untuk tiap rentang keyakinan, berapa persen deteksi yang benar */
export const TABEL_KALIBRASI = [
  { bawah: 0.0, atas: 0.1, akurasi: 0.012, jumlah: 500 },
  { bawah: 0.1, atas: 0.2, akurasi: 0.1364, jumlah: 22 },
  { bawah: 0.2, atas: 0.3, akurasi: 0.4762, jumlah: 21 },
  { bawah: 0.3, atas: 0.4, akurasi: 0.2857, jumlah: 14 },
  { bawah: 0.4, atas: 0.5, akurasi: 0.4444, jumlah: 18 },
  { bawah: 0.5, atas: 0.6, akurasi: 0.7143, jumlah: 14 },
  { bawah: 0.6, atas: 0.7, akurasi: 0.9048, jumlah: 21 },
  { bawah: 0.7, atas: 0.8, akurasi: 0.8571, jumlah: 35 },
  { bawah: 0.8, atas: 0.9, akurasi: 0.9722, jumlah: 36 },
  { bawah: 0.9, atas: 1.0, akurasi: 0.75, jumlah: 4 },
];
export const NILAI_ECE = 0.0362;

/** Sapuan ambang keyakinan: presisi, recall, F1 pada data uji */
export const TABEL_SAPUAN_AMBANG = [
  { ambang: 0.05, presisi: 0.599, recall: 0.8611, f1: 0.7066 },
  { ambang: 0.1, presisi: 0.6595, recall: 0.8472, f1: 0.7416 },
  { ambang: 0.15, presisi: 0.6977, recall: 0.8333, f1: 0.7595 },
  { ambang: 0.2, presisi: 0.7301, recall: 0.8264, f1: 0.7752 },
  { ambang: 0.25, presisi: 0.7451, recall: 0.7917, f1: 0.7677 },
  { ambang: 0.3, presisi: 0.7676, recall: 0.7569, f1: 0.7622 },
  { ambang: 0.35, presisi: 0.7826, recall: 0.75, f1: 0.766 },
  { ambang: 0.4, presisi: 0.8203, recall: 0.7292, f1: 0.7721 },
  { ambang: 0.45, presisi: 0.8226, recall: 0.7083, f1: 0.7612 },
  { ambang: 0.5, presisi: 0.8818, recall: 0.6736, f1: 0.7638 },
  { ambang: 0.55, presisi: 0.8835, recall: 0.6319, f1: 0.7368 },
  { ambang: 0.6, presisi: 0.9063, recall: 0.6042, f1: 0.725 },
  { ambang: 0.65, presisi: 0.908, recall: 0.5486, f1: 0.684 },
  { ambang: 0.7, presisi: 0.9067, recall: 0.4722, f1: 0.621 },
  { ambang: 0.75, presisi: 0.9483, recall: 0.3819, f1: 0.5446 },
  { ambang: 0.8, presisi: 0.95, recall: 0.2639, f1: 0.413 },
  { ambang: 0.85, presisi: 0.8182, recall: 0.0625, f1: 0.1161 },
  { ambang: 0.9, presisi: 0.75, recall: 0.0208, f1: 0.0405 },
];
export const AMBANG_F1_TERTINGGI = 0.2;

/** Uji ketahanan gambar terganggu (F1 pada ambang 0,35) */
export const UJI_KETAHANAN = {
  bersih: 0.766,
  buram: { f1: 0.6512, penurunanPersen: 15.0 },
  gelap: { f1: 0.705, penurunanPersen: 8.0 },
  resolusiRendah: { f1: 0.6104, penurunanPersen: 20.3 },
};

/** Karakteristik data latih untuk dibandingkan dengan gambar yang diuji */
export const PROFIL_DATA_LATIH = {
  rataRataLebar: 554,
  rataRataTinggi: 438,
  rataRataKecerahan: 136.4,
  simpanganKecerahan: 45.1,
  /** Rata-rata luas objek relatif terhadap gambar (lebar x tinggi kotak / luas gambar) */
  rataRataLuasObjekRelatif: 0.372,
  rataRataLuasObjekRelatifUji: 0.335,
  recallObjekSedang: 0.5714,
  recallObjekBesar: 0.7692,
  persenObjekDiTengah: 85.9,
  rataRataObjekPerGambar: 1.17,
};

/** Hasil ensemble 3 model (Weighted Box Fusion) dibanding model tunggal terbaik */
export const HASIL_ENSEMBLE = {
  presisi: 0.7483,
  recall: 0.7639,
  f1: 0.756,
  f1ModelTunggal: 0.7404,
};

export const RINGKASAN_DATASET = {
  jumlahKelas: 24,
  gambarLatih: 5815,
  gambarValidasi: 256,
  gambarUji: 110,
  objekUji: 144,
};

export function cariBarisKalibrasi(keyakinan: number) {
  return TABEL_KALIBRASI.find((baris) => keyakinan >= baris.bawah && keyakinan < baris.atas) ?? TABEL_KALIBRASI[TABEL_KALIBRASI.length - 1];
}

export function cariBarisSapuanTerdekat(ambang: number) {
  return TABEL_SAPUAN_AMBANG.reduce((terdekat, baris) =>
    Math.abs(baris.ambang - ambang) < Math.abs(terdekat.ambang - ambang) ? baris : terdekat
  );
}
