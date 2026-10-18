/**
 * lib/insightEngine.ts
 *
 * Mesin wawasan (insight) AIO PESTGUARD.
 *
 * Semua fungsi di sini adalah FUNGSI MURNI: masukan yang sama selalu menghasilkan
 * keluaran yang sama, tanpa akses jaringan atau penyimpanan. Karena itu logikanya
 * mudah diuji, dan nanti bisa dipindahkan ke backend tanpa perubahan besar bila
 * tim memutuskan agregasi dilakukan di server (rencana kerja nomor 3 pada README).
 *
 * Alur data:
 *   DataLahanMentah + SesiPemantauanLahan[]
 *     -> buatRingkasanLahan()
 *     -> RingkasanLahan (risiko, narasi, rekomendasi, langkah tindakan)
 *     -> urutkanLahanBerdasarkanRisiko()
 *     -> susunTeksWawasanUntukSalinan() untuk tombol salin dan unduh
 */

import {
  DAFTAR_LAHAN_MENTAH,
  DAFTAR_SESI_PEMANTAUAN,
  REFERENSI_PESTISIDA_PER_HAMA,
  REFERENSI_STADIUM_PER_HAMA,
  TANGGAL_ACUAN_SIMULASI_ISO,
  type DataLahanMentah,
} from "./mockData";
import type {
  EstimasiStadiumHama,
  HasilDeteksiHama,
  RekomendasiPestisida,
  RingkasanLahan,
  SesiPemantauanLahan,
  TingkatKeyakinanDeteksi,
  TingkatRisikoLahan,
} from "./types";
import { formatTanggalSaja, tambahHariKeTanggal } from "./utils";

// ---------------------------------------------------------------------------
// Konstanta aturan. Dikumpulkan di sini supaya mudah dibahas dan diubah tim.
// ---------------------------------------------------------------------------
export const BATAS_KEYAKINAN_TINGGI = 0.75;
export const BATAS_KEYAKINAN_SEDANG = 0.5;
export const BATAS_PERSEN_AMBANG_RISIKO_TINGGI = 1.0;
export const BATAS_PERSEN_AMBANG_RISIKO_SEDANG = 0.6;
export const BATAS_LONJAKAN_MINGGUAN_PERSEN = 50;
export const BATAS_RATA_RATA_KEYAKINAN_DIPERCAYA = 0.6;

// ---------------------------------------------------------------------------
// Fungsi dasar
// ---------------------------------------------------------------------------

/** Menyamakan format nama hama, sama seperti normalize_pest_name() di app.py */
export function normalisasiNamaHama(namaHama: string): string {
  return namaHama.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function jumlahkanDaftarAngka(daftarAngka: number[]): number {
  return daftarAngka.reduce((jumlahSementara, angka) => jumlahSementara + angka, 0);
}

/** Perubahan jumlah deteksi minggu ini dibanding minggu lalu, dalam persen */
export function hitungPerubahanMingguanPersen(
  totalMingguIni: number,
  totalMingguLalu: number
): number {
  if (totalMingguLalu === 0) {
    return totalMingguIni === 0 ? 0 : 100;
  }
  return Math.round(((totalMingguIni - totalMingguLalu) / totalMingguLalu) * 100);
}

export function tentukanTingkatKeyakinan(nilaiKeyakinan: number): TingkatKeyakinanDeteksi {
  if (nilaiKeyakinan >= BATAS_KEYAKINAN_TINGGI) return "tinggi";
  if (nilaiKeyakinan >= BATAS_KEYAKINAN_SEDANG) return "sedang";
  return "rendah";
}

/**
 * Aturan risiko:
 *  - total minggu ini mencapai atau melewati ambang batas: TINGGI
 *  - total minggu ini mencapai 60% ambang batas: SEDANG
 *  - bila SEDANG tetapi naik 50% atau lebih dari minggu lalu: dinaikkan menjadi TINGGI
 *  - selain itu: RENDAH
 */
export function tentukanTingkatRisiko(
  totalMingguIni: number,
  ambangBatasMingguan: number,
  perubahanMingguanPersen: number
): TingkatRisikoLahan {
  const persenDariAmbang = totalMingguIni / ambangBatasMingguan;
  if (persenDariAmbang >= BATAS_PERSEN_AMBANG_RISIKO_TINGGI) return "tinggi";
  if (persenDariAmbang >= BATAS_PERSEN_AMBANG_RISIKO_SEDANG) {
    return perubahanMingguanPersen >= BATAS_LONJAKAN_MINGGUAN_PERSEN ? "tinggi" : "sedang";
  }
  return "rendah";
}

export function hitungDistribusiKeyakinan(
  daftarDeteksi: HasilDeteksiHama[]
): Record<TingkatKeyakinanDeteksi, number> {
  const distribusiAwal: Record<TingkatKeyakinanDeteksi, number> = { tinggi: 0, sedang: 0, rendah: 0 };
  for (const deteksi of daftarDeteksi) {
    distribusiAwal[tentukanTingkatKeyakinan(deteksi.confidence)] += 1;
  }
  return distribusiAwal;
}

export function hitungRataRataKeyakinan(daftarDeteksi: HasilDeteksiHama[]): number {
  if (daftarDeteksi.length === 0) return 0;
  const totalKeyakinan = daftarDeteksi.reduce((jumlah, deteksi) => jumlah + deteksi.confidence, 0);
  return totalKeyakinan / daftarDeteksi.length;
}

// ---------------------------------------------------------------------------
// Estimasi stadium perkembangan hama (SIMULASI, belum ada di backend)
// ---------------------------------------------------------------------------

/**
 * Mencocokkan ukuran tubuh hama (mm) dengan stadium pada Data_Hama_AIGRA.csv.
 * Bila ukuran jatuh di dalam rentang sebuah stadium, stadium itu dipilih.
 * Bila tidak ada yang cocok, dipilih stadium dengan titik tengah ukuran paling dekat.
 */
export function perkirakanStadiumHama(
  kunciReferensiHama: string,
  ukuranTubuhMm: number | null,
  tanggalAcuanIso: string = TANGGAL_ACUAN_SIMULASI_ISO
): EstimasiStadiumHama | null {
  const referensi = REFERENSI_STADIUM_PER_HAMA[kunciReferensiHama];
  if (!referensi || ukuranTubuhMm === null) return null;

  const daftarStadium = referensi.daftarStadiumUrut;
  let indeksTerpilih = daftarStadium.findIndex(
    (stadium) => ukuranTubuhMm >= stadium.ukuranMinimumMm - 0.005 && ukuranTubuhMm <= stadium.ukuranMaksimumMm + 0.005
  );
  if (indeksTerpilih === -1) {
    let selisihTerkecil = Number.POSITIVE_INFINITY;
    daftarStadium.forEach((stadium, indeks) => {
      const titikTengah = (stadium.ukuranMinimumMm + stadium.ukuranMaksimumMm) / 2;
      const selisih = Math.abs(titikTengah - ukuranTubuhMm);
      if (selisih < selisihTerkecil) {
        selisihTerkecil = selisih;
        indeksTerpilih = indeks;
      }
    });
  }

  const stadiumSaatIni = daftarStadium[indeksTerpilih];
  const stadiumBerikutnya = daftarStadium[indeksTerpilih + 1] ?? null;
  const stadiumSaatIniAdalahDewasa = stadiumSaatIni.namaStadium.toLowerCase().startsWith("dewasa");

  // Hari menuju dewasa: jumlah durasi maksimum stadium saat ini sampai stadium sebelum dewasa
  let hariMenujuDewasa = 0;
  if (!stadiumSaatIniAdalahDewasa) {
    for (let indeks = indeksTerpilih; indeks < daftarStadium.length; indeks += 1) {
      if (daftarStadium[indeks].namaStadium.toLowerCase().startsWith("dewasa")) break;
      hariMenujuDewasa += daftarStadium[indeks].durasiMaksimumHari;
    }
  }

  let masaPraOviposisi: EstimasiStadiumHama["masaPraOviposisi"] = null;
  let perkiraanTanggalMulaiOviposisi: string | null = null;
  if (referensi.masaPraOviposisiHari) {
    const [praMinimum, praMaksimum] = referensi.masaPraOviposisiHari;
    const tanggalMulaiPra = tambahHariKeTanggal(tanggalAcuanIso, hariMenujuDewasa);
    masaPraOviposisi = {
      tanggalMulai: tanggalMulaiPra,
      tanggalSelesai: tambahHariKeTanggal(tanggalMulaiPra, praMaksimum),
    };
    perkiraanTanggalMulaiOviposisi = tambahHariKeTanggal(tanggalMulaiPra, praMinimum);
  }

  return {
    namaStadium: stadiumSaatIni.namaStadium,
    rentangUkuranCm: [stadiumSaatIni.ukuranMinimumMm / 10, stadiumSaatIni.ukuranMaksimumMm / 10],
    rentangDurasiHari: [stadiumSaatIni.durasiMinimumHari, stadiumSaatIni.durasiMaksimumHari],
    stadiumBerikutnya: stadiumBerikutnya ? stadiumBerikutnya.namaStadium : null,
    perkiraanHariMenujuStadiumBerikutnya: stadiumBerikutnya ? stadiumSaatIni.durasiMaksimumHari : null,
    masaPraOviposisi,
    perkiraanTanggalMulaiOviposisi,
    catatanReferensiBiologis: `${stadiumSaatIni.keteranganSingkat}. Sumber: ${referensi.catatanSumber}.`,
  };
}

/** Mengisi estimasiStadium pada setiap deteksi dalam satu sesi */
export function lengkapiDeteksiDenganStadium(
  daftarDeteksi: HasilDeteksiHama[],
  kunciReferensiHama: string
): HasilDeteksiHama[] {
  return daftarDeteksi.map((deteksi) => ({
    ...deteksi,
    estimasiStadium: perkirakanStadiumHama(
      kunciReferensiHama,
      deteksi.estimasiUkuranCm === null ? null : deteksi.estimasiUkuranCm * 10
    ),
  }));
}

// ---------------------------------------------------------------------------
// Pestisida
// ---------------------------------------------------------------------------
export function ambilRekomendasiPestisida(namaHamaInggris: string): RekomendasiPestisida[] {
  return REFERENSI_PESTISIDA_PER_HAMA[normalisasiNamaHama(namaHamaInggris)] ?? [];
}

// ---------------------------------------------------------------------------
// Narasi, rekomendasi, dan langkah tindakan (bahasa untuk petani)
// ---------------------------------------------------------------------------
const NAMA_HAMA_INDONESIA_PER_KUNCI: Record<string, string> = {
  brownplanthopper: "Wereng Batang Coklat",
  cornborer: "Penggerek Batang Jagung",
  thrips: "Thrips",
};

export function susunNarasiWawasan(params: {
  namaLahan: string;
  namaHamaIndonesia: string;
  totalMingguIni: number;
  ambangBatasMingguan: number;
  perubahanMingguanPersen: number;
  tingkatRisiko: TingkatRisikoLahan;
  rataRataKeyakinanHariIni: number;
}): string {
  const {
    namaLahan,
    namaHamaIndonesia,
    totalMingguIni,
    ambangBatasMingguan,
    perubahanMingguanPersen,
    tingkatRisiko,
    rataRataKeyakinanHariIni,
  } = params;

  const kalimatArah =
    perubahanMingguanPersen > 5
      ? `Jumlah hama naik ${perubahanMingguanPersen} persen dibanding minggu lalu.`
      : perubahanMingguanPersen < -5
        ? `Jumlah hama turun ${Math.abs(perubahanMingguanPersen)} persen dibanding minggu lalu.`
        : "Jumlah hama hampir sama dengan minggu lalu.";

  const kalimatAmbang =
    tingkatRisiko === "tinggi"
      ? `Minggu ini sudah tercatat ${totalMingguIni} hama, melewati batas aman ${ambangBatasMingguan} per minggu.`
      : `Minggu ini tercatat ${totalMingguIni} hama, masih di bawah batas aman ${ambangBatasMingguan} per minggu.`;

  const kalimatKeyakinan =
    rataRataKeyakinanHariIni < BATAS_RATA_RATA_KEYAKINAN_DIPERCAYA
      ? " Keyakinan sistem hari ini cukup rendah, jadi mohon cek langsung ke lahan sebelum mengambil tindakan."
      : "";

  return `${namaLahan}: hama yang paling banyak adalah ${namaHamaIndonesia}. ${kalimatAmbang} ${kalimatArah}${kalimatKeyakinan}`;
}

export function susunRekomendasiUtama(
  tingkatRisiko: TingkatRisikoLahan,
  daftarPestisida: RekomendasiPestisida[],
  namaHamaIndonesia: string
): string {
  if (tingkatRisiko === "rendah") {
    return `Belum perlu menyemprot. Lanjutkan pemantauan harian ${namaHamaIndonesia}, dan jaga kebersihan lahan.`;
  }
  if (daftarPestisida.length === 0) {
    return tingkatRisiko === "tinggi"
      ? `Segera lakukan pengendalian. Daftar obat untuk ${namaHamaIndonesia} belum ada di referensi AIGRA, mohon hubungi penyuluh pertanian lapangan untuk pilihan obat yang sesuai.`
      : `Pantau lebih sering. Daftar obat untuk ${namaHamaIndonesia} belum ada di referensi AIGRA, mohon tanyakan ke penyuluh pertanian lapangan bila jumlahnya terus naik.`;
  }
  const pilihanPertama = daftarPestisida[0];
  return tingkatRisiko === "tinggi"
    ? `Segera lakukan penyemprotan dalam 1 sampai 2 hari. Pilihan bahan aktif dari referensi: ${pilihanPertama.bahan_aktif} (dosis ${pilihanPertama.dosis}, contoh produk ${pilihanPertama.contoh_produk}). Selalu ikuti petunjuk di label kemasan.`
    : `Siapkan obat dan pantau setiap hari. Bila jumlah hama melewati batas aman, gunakan ${pilihanPertama.bahan_aktif} sesuai petunjuk label kemasan.`;
}

export function susunLangkahTindakan(
  tingkatRisiko: TingkatRisikoLahan,
  adaRekomendasiPestisida: boolean,
  rataRataKeyakinanHariIni: number
): string[] {
  const daftarLangkah: string[] = [];
  if (rataRataKeyakinanHariIni < BATAS_RATA_RATA_KEYAKINAN_DIPERCAYA) {
    daftarLangkah.push("Cek langsung beberapa titik di lahan untuk memastikan hama yang terdeteksi memang ada.");
  }
  if (tingkatRisiko === "tinggi") {
    daftarLangkah.push("Hari ini: periksa langsung bagian tanaman yang terserang dan tandai area terparah.");
    daftarLangkah.push(
      adaRekomendasiPestisida
        ? "Dalam 1 sampai 2 hari: semprot sesuai bahan aktif yang disarankan, dosis mengikuti label."
        : "Dalam 1 sampai 2 hari: hubungi penyuluh pertanian lapangan untuk pilihan obat yang sesuai."
    );
    daftarLangkah.push("Gunakan bahan aktif yang berbeda secara bergantian pada penyemprotan berikutnya agar hama tidak kebal.");
    daftarLangkah.push("Periksa ulang lahan 3 hari setelah penyemprotan dan bandingkan jumlah hama di sistem.");
  } else if (tingkatRisiko === "sedang") {
    daftarLangkah.push("Periksa lahan setiap pagi dan lihat angka terbaru di AIO PESTGUARD.");
    daftarLangkah.push("Siapkan obat dan alat semprot supaya bisa langsung dipakai bila status berubah menjadi tinggi.");
    daftarLangkah.push("Bersihkan gulma di sekitar tanaman karena bisa menjadi tempat hama bersembunyi.");
  } else {
    daftarLangkah.push("Lanjutkan pemantauan harian, belum perlu menyemprot.");
    daftarLangkah.push("Jaga kebersihan lahan dan saluran air.");
  }
  return daftarLangkah;
}

// ---------------------------------------------------------------------------
// Ringkasan per lahan
// ---------------------------------------------------------------------------
export function ambilSesiTerbaruPerLahan(
  idLahan: string,
  daftarSesi: SesiPemantauanLahan[] = DAFTAR_SESI_PEMANTAUAN
): SesiPemantauanLahan | null {
  const sesiMilikLahan = daftarSesi
    .filter((sesi) => sesi.idLahan === idLahan)
    .sort((a, b) => new Date(b.waktuPengambilan).getTime() - new Date(a.waktuPengambilan).getTime());
  return sesiMilikLahan[0] ?? null;
}

export function buatRingkasanLahan(
  dataLahan: DataLahanMentah,
  daftarSesi: SesiPemantauanLahan[] = DAFTAR_SESI_PEMANTAUAN
): RingkasanLahan {
  const totalMingguIni = jumlahkanDaftarAngka(dataLahan.jumlahDeteksiMingguIni);
  const totalMingguLalu = jumlahkanDaftarAngka(dataLahan.jumlahDeteksiMingguLalu);
  const totalDeteksiHariIni = dataLahan.jumlahDeteksiMingguIni[dataLahan.jumlahDeteksiMingguIni.length - 1];
  const perubahanMingguanPersen = hitungPerubahanMingguanPersen(totalMingguIni, totalMingguLalu);
  const tingkatRisiko = tentukanTingkatRisiko(totalMingguIni, dataLahan.ambangBatasMingguan, perubahanMingguanPersen);

  const sesiTerbaru = ambilSesiTerbaruPerLahan(dataLahan.idLahan, daftarSesi);
  const daftarDeteksiTerbaru = sesiTerbaru ? sesiTerbaru.daftarDeteksi : [];
  const rataRataKeyakinanHariIni = hitungRataRataKeyakinan(daftarDeteksiTerbaru);

  const kunciReferensiHama = normalisasiNamaHama(dataLahan.namaHamaDominanInggris);
  const namaHamaIndonesia = NAMA_HAMA_INDONESIA_PER_KUNCI[kunciReferensiHama] ?? dataLahan.namaHamaDominanInggris;
  const daftarPestisida = ambilRekomendasiPestisida(dataLahan.namaHamaDominanInggris);

  return {
    idLahan: dataLahan.idLahan,
    namaLahan: dataLahan.namaLahan,
    komoditas: dataLahan.komoditas,
    lokasi: dataLahan.lokasi,
    luasHektar: dataLahan.luasHektar,
    totalDeteksiHariIni: totalDeteksiHariIni,
    totalDeteksiMingguLalu: totalMingguLalu,
    totalDeteksiMingguIni: totalMingguIni,
    hamaDominan: namaHamaIndonesia,
    kunciReferensiHama,
    tingkatRisiko,
    ambangBatasMingguan: dataLahan.ambangBatasMingguan,
    persenDariAmbangBatas: Math.round((totalMingguIni / dataLahan.ambangBatasMingguan) * 100),
    trenTujuhHariTerakhir: dataLahan.jumlahDeteksiMingguIni,
    distribusiKeyakinan: hitungDistribusiKeyakinan(daftarDeteksiTerbaru),
    rataRataKeyakinanHariIni,
    perubahanMingguanPersen,
    narasiWawasanUtama: susunNarasiWawasan({
      namaLahan: dataLahan.namaLahan,
      namaHamaIndonesia,
      totalMingguIni,
      ambangBatasMingguan: dataLahan.ambangBatasMingguan,
      perubahanMingguanPersen,
      tingkatRisiko,
      rataRataKeyakinanHariIni,
    }),
    rekomendasiUtama: susunRekomendasiUtama(tingkatRisiko, daftarPestisida, namaHamaIndonesia),
    daftarLangkahTindakan: susunLangkahTindakan(tingkatRisiko, daftarPestisida.length > 0, rataRataKeyakinanHariIni),
  };
}

export function buatSemuaRingkasanLahan(): RingkasanLahan[] {
  return DAFTAR_LAHAN_MENTAH.map((dataLahan) => buatRingkasanLahan(dataLahan));
}

const URUTAN_BOBOT_RISIKO: Record<TingkatRisikoLahan, number> = { tinggi: 3, sedang: 2, rendah: 1 };

/** Mengurutkan lahan dari yang paling perlu perhatian, lalu berdasarkan persen terhadap ambang */
export function urutkanLahanBerdasarkanRisiko(daftarRingkasan: RingkasanLahan[]): RingkasanLahan[] {
  return [...daftarRingkasan].sort((a, b) => {
    const selisihRisiko = URUTAN_BOBOT_RISIKO[b.tingkatRisiko] - URUTAN_BOBOT_RISIKO[a.tingkatRisiko];
    return selisihRisiko !== 0 ? selisihRisiko : b.persenDariAmbangBatas - a.persenDariAmbangBatas;
  });
}

/** Kalimat pembuka halaman beranda, merangkum seluruh lahan dalam satu pandangan */
export function susunKalimatRingkasanSemuaLahan(daftarRingkasan: RingkasanLahan[]): string {
  const jumlahLahanRisikoTinggi = daftarRingkasan.filter((r) => r.tingkatRisiko === "tinggi").length;
  const lahanTerparah = urutkanLahanBerdasarkanRisiko(daftarRingkasan)[0];
  if (jumlahLahanRisikoTinggi === 0) {
    return "Semua lahan dalam kondisi aman hari ini. Lanjutkan pemantauan seperti biasa.";
  }
  return `${jumlahLahanRisikoTinggi} dari ${daftarRingkasan.length} lahan perlu tindakan segera. Yang paling mendesak adalah ${lahanTerparah.namaLahan} (${lahanTerparah.komoditas}) karena serangan ${lahanTerparah.hamaDominan}.`;
}

// ---------------------------------------------------------------------------
// Teks wawasan untuk tombol Salin dan Unduh
// ---------------------------------------------------------------------------
export function susunTeksWawasanUntukSalinan(
  ringkasan: RingkasanLahan,
  sesiTerbaru: SesiPemantauanLahan | null
): string {
  const labelRisiko = { tinggi: "TINGGI", sedang: "SEDANG", rendah: "RENDAH" }[ringkasan.tingkatRisiko];
  const baris: string[] = [
    "AIO PESTGUARD, Laporan Wawasan Lahan",
    `Tanggal laporan: ${formatTanggalSaja(TANGGAL_ACUAN_SIMULASI_ISO)}`,
    "",
    `Lahan: ${ringkasan.namaLahan} (${ringkasan.komoditas}), ${ringkasan.lokasi}, ${ringkasan.luasHektar} hektar`,
    `Tingkat risiko: ${labelRisiko}`,
    `Hama dominan: ${ringkasan.hamaDominan}`,
    `Deteksi minggu ini: ${ringkasan.totalDeteksiMingguIni} dari batas aman ${ringkasan.ambangBatasMingguan} (${ringkasan.persenDariAmbangBatas} persen)`,
    `Perubahan dibanding minggu lalu: ${ringkasan.perubahanMingguanPersen} persen`,
    "",
    "RINGKASAN",
    ringkasan.narasiWawasanUtama,
    "",
    "REKOMENDASI",
    ringkasan.rekomendasiUtama,
    "",
    "LANGKAH TINDAKAN",
    ...ringkasan.daftarLangkahTindakan.map((langkah, indeks) => `${indeks + 1}. ${langkah}`),
  ];

  if (sesiTerbaru) {
    const daftarDeteksiLengkap = lengkapiDeteksiDenganStadium(sesiTerbaru.daftarDeteksi, ringkasan.kunciReferensiHama);
    const deteksiDenganStadium = daftarDeteksiLengkap.find((d) => d.estimasiStadium !== null);
    baris.push("", `DATA SESI TERBARU (${sesiTerbaru.idSesi})`);
    baris.push(`Jumlah hama pada foto: ${sesiTerbaru.daftarDeteksi.length}`);
    baris.push(
      `Keyakinan sistem: tinggi ${ringkasan.distribusiKeyakinan.tinggi}, sedang ${ringkasan.distribusiKeyakinan.sedang}, rendah ${ringkasan.distribusiKeyakinan.rendah}`
    );
    if (deteksiDenganStadium && deteksiDenganStadium.estimasiStadium) {
      const stadium = deteksiDenganStadium.estimasiStadium;
      baris.push(`Perkiraan fase hama: ${stadium.namaStadium}`);
      if (stadium.perkiraanTanggalMulaiOviposisi) {
        baris.push(`Perkiraan mulai bertelur: ${formatTanggalSaja(stadium.perkiraanTanggalMulaiOviposisi)}`);
      }
    }
  }

  baris.push(
    "",
    "Catatan: ini hasil simulasi untuk keperluan pengembangan. Perkiraan fase hama berasal dari data literatur dan belum dikalibrasi dengan citra perangkap asli. Selalu ikuti petunjuk label kemasan pestisida."
  );
  return baris.join("\n");
}
