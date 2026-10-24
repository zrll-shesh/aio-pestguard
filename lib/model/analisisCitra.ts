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

export type TingkatCatatan = "baik" | "perhatian" | "info";

export interface CatatanKualitas {
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
    daftarCatatan: susunCatatanKualitas({ lebar, tinggi, kecerahan, ketajaman }),
  };
}

export function susunCatatanKualitas(ukuran: { lebar: number; tinggi: number; kecerahan: number; ketajaman: number }): CatatanKualitas[] {
  const daftar: CatatanKualitas[] = [];
  const { rataRataKecerahan, simpanganKecerahan, rataRataLebar, rataRataTinggi } = PROFIL_DATA_LATIH;

  const skorZ = (ukuran.kecerahan - rataRataKecerahan) / simpanganKecerahan;
  if (skorZ < -1) {
    daftar.push({
      judul: "Pencahayaan",
      nilai: `${Math.round(ukuran.kecerahan)} dari 255`,
      tingkat: "perhatian",
      penjelasan: `Lebih gelap dari rata-rata data latih (${rataRataKecerahan}). Pada uji ketahanan, gambar gelap menurunkan F1 sekitar ${UJI_KETAHANAN.gelap.penurunanPersen}%.`,
    });
  } else if (skorZ > 1.5) {
    daftar.push({
      judul: "Pencahayaan",
      nilai: `${Math.round(ukuran.kecerahan)} dari 255`,
      tingkat: "perhatian",
      penjelasan: `Jauh lebih terang dari data latih (${rataRataKecerahan}). Bagian tubuh hama bisa kehilangan detail.`,
    });
  } else {
    daftar.push({
      judul: "Pencahayaan",
      nilai: `${Math.round(ukuran.kecerahan)} dari 255`,
      tingkat: "baik",
      penjelasan: `Masih dalam rentang data latih (rata-rata ${rataRataKecerahan}, simpangan ${simpanganKecerahan}).`,
    });
  }

  if (ukuran.ketajaman < BATAS_KETAJAMAN_BURAM) {
    daftar.push({
      judul: "Ketajaman",
      nilai: `skor ${Math.round(ukuran.ketajaman)}`,
      tingkat: "perhatian",
      penjelasan: `Gambar cenderung buram. Pada uji ketahanan, blur menurunkan F1 sekitar ${UJI_KETAHANAN.buram.penurunanPersen}%.`,
    });
  } else {
    daftar.push({
      judul: "Ketajaman",
      nilai: `skor ${Math.round(ukuran.ketajaman)}`,
      tingkat: "baik",
      penjelasan: "Tepi objek cukup tegas untuk dikenali model.",
    });
  }

  const sisiPendek = Math.min(ukuran.lebar, ukuran.tinggi);
  if (sisiPendek < BATAS_SISI_PENDEK_RENDAH) {
    daftar.push({
      judul: "Resolusi",
      nilai: `${ukuran.lebar} x ${ukuran.tinggi} px`,
      tingkat: "perhatian",
      penjelasan: `Lebih kecil dari rata-rata data latih (${rataRataLebar} x ${rataRataTinggi}). Kondisi resolusi rendah menurunkan F1 sekitar ${UJI_KETAHANAN.resolusiRendah.penurunanPersen}%, penurunan terbesar di uji ketahanan.`,
    });
  } else {
    daftar.push({
      judul: "Resolusi",
      nilai: `${ukuran.lebar} x ${ukuran.tinggi} px`,
      tingkat: "baik",
      penjelasan: `Sebanding atau lebih besar dari rata-rata data latih (${rataRataLebar} x ${rataRataTinggi}).`,
    });
  }
  return daftar;
}
