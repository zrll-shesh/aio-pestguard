/**
 * lib/model/analisisCitra.ts
 *
 * Pemeriksaan kualitas gambar sebelum hasil deteksi dipercaya. Angka pembanding diambil
 * dari karakteristik data latih dan uji ketahanan pada notebook (blur, gelap, resolusi
 * rendah), sehingga peringatan di layar punya dasar terukur, bukan tebakan.
 *
 * Ambang ketajaman (variansi Laplacian) bersifat heuristik dan dihitung pada gambar
 * yang diperkecil ke lebar 320 piksel supaya angkanya sebanding antar gambar.
 */

import { PROFIL_DATA_LATIH, UJI_KETAHANAN } from "./konfigurasiModel";
import { formatAngka, pilihTeks, type Bahasa } from "@/lib/i18n/bahasa";

export type TingkatCatatan = "baik" | "perhatian" | "info";

export interface CatatanKualitas {
  jenis: "cahaya" | "ketajaman" | "resolusi";
  judul: string;
  nilai: string;
  tingkat: TingkatCatatan;
  penjelasan: string;
}

export interface HasilAnalisisCitra {
  lebar: number;
  tinggi: number;
  kecerahan: number;
  kontras: number;
  ketajaman: number;
  rataRataWarna: { r: number; g: number; b: number };
  daftarCatatan: CatatanKualitas[];
}

const LEBAR_ANALISIS = 320;
const BATAS_KETAJAMAN_BURAM = 60;
const BATAS_SISI_PENDEK_RENDAH = 300;

export function analisisKualitasGambar(gambar: HTMLImageElement): HasilAnalisisCitra {
  const lebar = gambar.naturalWidth;
  const tinggi = gambar.naturalHeight;
  const skala = Math.min(1, LEBAR_ANALISIS / lebar);
  const lebarKecil = Math.max(8, Math.round(lebar * skala));
  const tinggiKecil = Math.max(8, Math.round(tinggi * skala));

  const kanvas = document.createElement("canvas");
  kanvas.width = lebarKecil;
  kanvas.height = tinggiKecil;
  const konteks = kanvas.getContext("2d", { willReadFrequently: true });
  if (!konteks) throw new Error("Canvas 2D tidak tersedia.");
  konteks.drawImage(gambar, 0, 0, lebarKecil, tinggiKecil);
  const { data } = konteks.getImageData(0, 0, lebarKecil, tinggiKecil);

  const jumlahPiksel = lebarKecil * tinggiKecil;
  const abu = new Float32Array(jumlahPiksel);
  let jumlahR = 0, jumlahG = 0, jumlahB = 0, jumlahAbu = 0;
  for (let i = 0; i < jumlahPiksel; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    jumlahR += r; jumlahG += g; jumlahB += b;
    const nilaiAbu = 0.299 * r + 0.587 * g + 0.114 * b;
    abu[i] = nilaiAbu;
    jumlahAbu += nilaiAbu;
  }
  const kecerahan = jumlahAbu / jumlahPiksel;
  let jumlahKuadratSelisih = 0;
  for (let i = 0; i < jumlahPiksel; i++) jumlahKuadratSelisih += (abu[i] - kecerahan) ** 2;
  const kontras = Math.sqrt(jumlahKuadratSelisih / jumlahPiksel);

  // Variansi Laplacian (kernel 4-tetangga): makin kecil, makin buram
  let jumlahLap = 0, jumlahLapKuadrat = 0, n = 0;
  for (let y = 1; y < tinggiKecil - 1; y++) {
    for (let x = 1; x < lebarKecil - 1; x++) {
      const i = y * lebarKecil + x;
      const lap = abu[i - 1] + abu[i + 1] + abu[i - lebarKecil] + abu[i + lebarKecil] - 4 * abu[i];
      jumlahLap += lap;
      jumlahLapKuadrat += lap * lap;
      n++;
    }
  }
  const rataLap = n > 0 ? jumlahLap / n : 0;
  const ketajaman = n > 0 ? jumlahLapKuadrat / n - rataLap * rataLap : 0;

  return {
    lebar,
    tinggi,
    kecerahan,
    kontras,
    ketajaman,
    rataRataWarna: { r: jumlahR / jumlahPiksel, g: jumlahG / jumlahPiksel, b: jumlahB / jumlahPiksel },
    daftarCatatan: susunCatatanKualitas({ lebar, tinggi, kecerahan, ketajaman }, "id"),
  };
}

export function susunCatatanKualitas(
  ukuran: { lebar: number; tinggi: number; kecerahan: number; ketajaman: number },
  bahasa: Bahasa
): CatatanKualitas[] {
  const daftar: CatatanKualitas[] = [];
  const { rataRataKecerahan, simpanganKecerahan, rataRataLebar, rataRataTinggi } = PROFIL_DATA_LATIH;
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  const n = (v: number, d = 0) => formatAngka(bahasa, v, d);
  const rataCahaya = n(rataRataKecerahan, 1);

  const judulCahaya = t("Pencahayaan", "Lighting", "밝기");
  const nilaiCahaya = t(`${Math.round(ukuran.kecerahan)} dari 255`, `${Math.round(ukuran.kecerahan)} of 255`, `255 중 ${Math.round(ukuran.kecerahan)}`);
  const skorZ = (ukuran.kecerahan - rataRataKecerahan) / simpanganKecerahan;
  if (skorZ < -1) {
    daftar.push({
      jenis: "cahaya", judul: judulCahaya, nilai: nilaiCahaya, tingkat: "perhatian",
      penjelasan: t(
        `Lebih gelap dari rata-rata data latih (${rataCahaya}). Pada uji ketahanan, gambar gelap menurunkan F1 sekitar ${UJI_KETAHANAN.gelap.penurunanPersen}%.`,
        `Darker than the training data average (${rataCahaya}). In robustness tests, dark images lowered F1 by about ${UJI_KETAHANAN.gelap.penurunanPersen}%.`,
        `학습 데이터 평균(${rataCahaya})보다 어둡습니다. 견고성 시험에서 어두운 이미지는 F1을 약 ${UJI_KETAHANAN.gelap.penurunanPersen}% 낮췄습니다.`
      ),
    });
  } else if (skorZ > 1.5) {
    daftar.push({
      jenis: "cahaya", judul: judulCahaya, nilai: nilaiCahaya, tingkat: "perhatian",
      penjelasan: t(
        `Jauh lebih terang dari data latih (${rataCahaya}). Bagian tubuh hama bisa kehilangan detail.`,
        `Much brighter than the training data (${rataCahaya}). Pest body details may be washed out.`,
        `학습 데이터(${rataCahaya})보다 훨씬 밝습니다. 해충 몸의 세부가 날아갈 수 있습니다.`
      ),
    });
  } else {
    daftar.push({
      jenis: "cahaya", judul: judulCahaya, nilai: nilaiCahaya, tingkat: "baik",
      penjelasan: t(
        `Masih dalam rentang data latih (rata-rata ${rataCahaya}, simpangan ${n(simpanganKecerahan, 1)}).`,
        `Within the training data range (mean ${rataCahaya}, SD ${n(simpanganKecerahan, 1)}).`,
        `학습 데이터 범위 안에 있습니다(평균 ${rataCahaya}, 표준편차 ${n(simpanganKecerahan, 1)}).`
      ),
    });
  }

  const judulTajam = t("Ketajaman", "Sharpness", "선명도");
  const nilaiTajam = t(`skor ${Math.round(ukuran.ketajaman)}`, `score ${Math.round(ukuran.ketajaman)}`, `점수 ${Math.round(ukuran.ketajaman)}`);
  if (ukuran.ketajaman < BATAS_KETAJAMAN_BURAM) {
    daftar.push({
      jenis: "ketajaman", judul: judulTajam, nilai: nilaiTajam, tingkat: "perhatian",
      penjelasan: t(
        `Gambar cenderung buram. Pada uji ketahanan, blur menurunkan F1 sekitar ${UJI_KETAHANAN.buram.penurunanPersen}%.`,
        `The image looks blurry. In robustness tests, blur lowered F1 by about ${UJI_KETAHANAN.buram.penurunanPersen}%.`,
        `이미지가 흐린 편입니다. 견고성 시험에서 흐림은 F1을 약 ${UJI_KETAHANAN.buram.penurunanPersen}% 낮췄습니다.`
      ),
    });
  } else {
    daftar.push({
      jenis: "ketajaman", judul: judulTajam, nilai: nilaiTajam, tingkat: "baik",
      penjelasan: t("Tepi objek cukup tegas untuk dikenali model.", "Object edges are sharp enough for the model.", "모델이 인식하기에 윤곽이 충분히 뚜렷합니다."),
    });
  }

  const judulResolusi = t("Resolusi", "Resolution", "해상도");
  const nilaiResolusi = `${ukuran.lebar} x ${ukuran.tinggi} px`;
  const sisiPendek = Math.min(ukuran.lebar, ukuran.tinggi);
  if (sisiPendek < BATAS_SISI_PENDEK_RENDAH) {
    daftar.push({
      jenis: "resolusi", judul: judulResolusi, nilai: nilaiResolusi, tingkat: "perhatian",
      penjelasan: t(
        `Lebih kecil dari rata-rata data latih (${rataRataLebar} x ${rataRataTinggi}). Resolusi rendah menurunkan F1 sekitar ${n(UJI_KETAHANAN.resolusiRendah.penurunanPersen, 1)}%, penurunan terbesar di uji ketahanan.`,
        `Smaller than the training data average (${rataRataLebar} x ${rataRataTinggi}). Low resolution lowered F1 by about ${n(UJI_KETAHANAN.resolusiRendah.penurunanPersen, 1)}%, the largest drop in robustness tests.`,
        `학습 데이터 평균(${rataRataLebar} x ${rataRataTinggi})보다 작습니다. 낮은 해상도는 F1을 약 ${n(UJI_KETAHANAN.resolusiRendah.penurunanPersen, 1)}% 낮춰 견고성 시험에서 가장 큰 하락을 보였습니다.`
      ),
    });
  } else {
    daftar.push({
      jenis: "resolusi", judul: judulResolusi, nilai: nilaiResolusi, tingkat: "baik",
      penjelasan: t(
        `Sebanding atau lebih besar dari rata-rata data latih (${rataRataLebar} x ${rataRataTinggi}).`,
        `Equal to or larger than the training data average (${rataRataLebar} x ${rataRataTinggi}).`,
        `학습 데이터 평균(${rataRataLebar} x ${rataRataTinggi})과 같거나 큽니다.`
      ),
    });
  }
  return daftar;
}
