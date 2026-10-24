/**
 * lib/model/wawasanPrediksi.ts
 *
 * Mesin wawasan untuk SATU hasil prediksi di halaman Uji Deteksi. Fungsi murni:
 * masukan berupa deteksi mentah + konteks (model, ambang, gambar), keluaran berupa
 * angka olahan, kalimat untuk petani, laporan teks, dan JSON berformat POST /detect.
 *
 * Semua aturan ditulis terbuka di bagian atas agar mudah dibahas tim.
 */

import type { HasilDeteksiHama, JenisKomoditas, ResponsDeteksi, TingkatKeyakinanDeteksi } from "@/lib/types";
import { ambilRekomendasiPestisida, normalisasiNamaHama, tentukanTingkatKeyakinan } from "@/lib/insightEngine";
import { REFERENSI_STADIUM_PER_HAMA, type ReferensiBiologisHama } from "@/lib/mockData";
import {
  DAFTAR_KELAS_HAMA,
  ambilKelasHama,
  jelaskanKeandalanKelas,
  tentukanStatusKeandalan,
  type KelasHama,
  type StatusKeandalanKelas,
} from "./kelasHama";
import {
  AMBANG_F1_TERTINGGI,
  PROFIL_DATA_LATIH,
  cariBarisKalibrasi,
  cariBarisSapuanTerdekat,
  type KonfigurasiModel,
} from "./konfigurasiModel";
import type { DeteksiMentah } from "./pascaproses";
import type { HasilAnalisisCitra } from "./analisisCitra";

// ---------------------------------------------------------------------------
// Aturan
// ---------------------------------------------------------------------------
/** Kelas alternatif dianggap "pesaing dekat" bila skornya minimal setengah skor kelas utama */
const RASIO_PESAING_DEKAT = 0.5;
/** Skor minimum kelas alternatif yang ditampilkan */
const SKOR_ALTERNATIF_MINIMUM = 0.05;
/** Batas jumlah individu satu jenis dalam satu foto untuk kepadatan tinggi dan sedang */
const BATAS_KEPADATAN_TINGGI = 5;
const BATAS_KEPADATAN_SEDANG = 2;
/** Pasangan kelas yang tercatat sering tertukar pada matriks kebingungan notebook */
const PASANGAN_SERING_TERTUKAR: Array<[number, number]> = [[18, 17]];

export type KategoriUkuranObjek = "kecil" | "sedang" | "besar";
export type TingkatKepadatan = "tinggi" | "sedang" | "rendah" | "nihil";
export type HasilCocokLabel = "benar" | "sebagian" | "salah" | "tidak_terdeteksi" | "tidak_diketahui";

export interface DeteksiTerolah {
  idDeteksi: string;
  nomor: number;
  kelas: KelasHama;
  skor: number;
  kotak: [number, number, number, number];
  tingkatKeyakinan: TingkatKeyakinanDeteksi;
  akurasiEmpiris: { akurasi: number; rentang: string; jumlahSampel: number };
  luasRelatif: number;
  kategoriUkuran: KategoriUkuranObjek;
  alternatif: Array<{ kelas: KelasHama; skor: number; pesaingDekat: boolean }>;
  adaPesaingDekat: boolean;
  seringTertukarDengan: KelasHama | null;
  statusKeandalan: StatusKeandalanKelas;
}

export interface RingkasanKelasTerdeteksi {
  kelas: KelasHama;
  jumlah: number;
  rataRataSkor: number;
  skorTertinggi: number;
  statusKeandalan: StatusKeandalanKelas;
  penjelasanKeandalan: string;
  pestisida: ReturnType<typeof ambilRekomendasiPestisida>;
  referensiSiklusHidup: ReferensiBiologisHama | null;
}

export interface WawasanPrediksi {
  daftarDeteksi: DeteksiTerolah[];
  ringkasanPerKelas: RingkasanKelasTerdeteksi[];
  hamaUtama: RingkasanKelasTerdeteksi | null;
  komoditasTerlibat: JenisKomoditas[];
  jumlahDeteksi: number;
  rataRataSkor: number;
  rataRataAkurasiEmpiris: number | null;
  kepadatan: TingkatKepadatan;
  cocokLabel: { hasil: HasilCocokLabel; labelAsli: KelasHama | null; kalimat: string | null; lintasKomoditas: boolean };
  tradeOffAmbang: { ambang: number; presisi: number; recall: number; f1: number };
  judulHasil: string;
  narasi: string;
  langkahTindakan: string[];
  catatanUkuranObjek: string | null;
  jumlahKandidatDiBawahAmbang: number;
  kandidatTerkuatDiBawahAmbang: { kelas: KelasHama; skor: number } | null;
}

function persen(nilai: number, digit = 0) {
  return `${(nilai * 100).toFixed(digit)}%`;
}

function tentukanKategoriUkuran(kotak: [number, number, number, number]): KategoriUkuranObjek {
  const luasPiksel = Math.max(0, kotak[2] - kotak[0]) * Math.max(0, kotak[3] - kotak[1]);
  if (luasPiksel < 32 * 32) return "kecil";
  if (luasPiksel < 96 * 96) return "sedang";
  return "besar";
}

export function olahDeteksi(daftarMentah: DeteksiMentah[], lebarGambar: number, tinggiGambar: number): DeteksiTerolah[] {
  return daftarMentah
    .map((mentah, indeks) => {
      const kelas = ambilKelasHama(mentah.classId) ?? DAFTAR_KELAS_HAMA[0];
      const baris = cariBarisKalibrasi(mentah.skor);
      const [x1, y1, x2, y2] = mentah.kotak;
      const luasRelatif = ((x2 - x1) * (y2 - y1)) / Math.max(1, lebarGambar * tinggiGambar);
      const alternatif = mentah.tigaKelasTeratas
        .slice(1)
        .filter((alt) => alt.skor >= SKOR_ALTERNATIF_MINIMUM)
        .map((alt) => ({
          kelas: ambilKelasHama(alt.classId) ?? DAFTAR_KELAS_HAMA[0],
          skor: alt.skor,
          pesaingDekat: alt.skor >= mentah.skor * RASIO_PESAING_DEKAT,
        }));
      const pasangan = PASANGAN_SERING_TERTUKAR.find(([a, b]) => a === mentah.classId || b === mentah.classId);
      const idPasangan = pasangan ? (pasangan[0] === mentah.classId ? pasangan[1] : pasangan[0]) : null;
      return {
        idDeteksi: `det-${indeks}-${mentah.classId}-${Math.round(x1)}-${Math.round(y1)}`,
        nomor: indeks + 1,
        kelas,
        skor: mentah.skor,
        kotak: mentah.kotak,
        tingkatKeyakinan: tentukanTingkatKeyakinan(mentah.skor),
        akurasiEmpiris: {
          akurasi: baris.akurasi,
          rentang: `${Math.round(baris.bawah * 100)} sampai ${Math.round(baris.atas * 100)}%`,
          jumlahSampel: baris.jumlah,
        },
        luasRelatif,
        kategoriUkuran: tentukanKategoriUkuran(mentah.kotak),
        alternatif,
        adaPesaingDekat: alternatif.some((alt) => alt.pesaingDekat),
        seringTertukarDengan: idPasangan !== null ? ambilKelasHama(idPasangan) : null,
        statusKeandalan: tentukanStatusKeandalan(kelas),
      };
    })
    .sort((a, b) => b.skor - a.skor)
    .map((deteksi, indeks) => ({ ...deteksi, nomor: indeks + 1 }));
}

function ringkasPerKelas(daftarDeteksi: DeteksiTerolah[]): RingkasanKelasTerdeteksi[] {
  const peta = new Map<number, DeteksiTerolah[]>();
  for (const deteksi of daftarDeteksi) {
    const daftar = peta.get(deteksi.kelas.classId) ?? [];
    daftar.push(deteksi);
    peta.set(deteksi.kelas.classId, daftar);
  }
  return Array.from(peta.values())
    .map((daftar) => {
      const kelas = daftar[0].kelas;
      const kunciReferensi = normalisasiNamaHama(kelas.namaIp102);
      return {
        kelas,
        jumlah: daftar.length,
        rataRataSkor: daftar.reduce((jumlah, d) => jumlah + d.skor, 0) / daftar.length,
        skorTertinggi: Math.max(...daftar.map((d) => d.skor)),
        statusKeandalan: tentukanStatusKeandalan(kelas),
        penjelasanKeandalan: jelaskanKeandalanKelas(kelas),
        pestisida: ambilRekomendasiPestisida(kelas.namaIp102),
        referensiSiklusHidup: REFERENSI_STADIUM_PER_HAMA[kunciReferensi] ?? null,
      };
    })
    .sort((a, b) => b.jumlah - a.jumlah || b.rataRataSkor - a.rataRataSkor);
}

function tentukanKepadatan(hamaUtama: RingkasanKelasTerdeteksi | null): TingkatKepadatan {
  if (!hamaUtama) return "nihil";
  if (hamaUtama.jumlah >= BATAS_KEPADATAN_TINGGI) return "tinggi";
  if (hamaUtama.jumlah >= BATAS_KEPADATAN_SEDANG) return "sedang";
  return "rendah";
}

function cocokkanLabel(
  labelAsli: KelasHama | null,
  hamaUtama: RingkasanKelasTerdeteksi | null,
  ringkasan: RingkasanKelasTerdeteksi[]
): WawasanPrediksi["cocokLabel"] {
  if (!labelAsli) return { hasil: "tidak_diketahui", labelAsli: null, kalimat: null, lintasKomoditas: false };
  if (!hamaUtama) {
    return {
      hasil: "tidak_terdeteksi",
      labelAsli,
      kalimat: `Label asli gambar ini ${labelAsli.namaIndonesia}, tetapi model tidak menemukan hama pada ambang ini. Coba turunkan ambang untuk melihat kandidat yang lebih lemah.`,
      lintasKomoditas: false,
    };
  }
  if (hamaUtama.kelas.classId === labelAsli.classId) {
    return { hasil: "benar", labelAsli, kalimat: `Sesuai label asli: ${labelAsli.namaIndonesia}.`, lintasKomoditas: false };
  }
  const lintasKomoditas = hamaUtama.kelas.komoditas !== labelAsli.komoditas;
  if (ringkasan.some((r) => r.kelas.classId === labelAsli.classId)) {
    return {
      hasil: "sebagian",
      labelAsli,
      kalimat: `Label asli ${labelAsli.namaIndonesia} ikut terdeteksi, tetapi bukan hasil terbanyak.`,
      lintasKomoditas,
    };
  }
  return {
    hasil: "salah",
    labelAsli,
    kalimat: `Label asli ${labelAsli.namaIndonesia}, model menebak ${hamaUtama.kelas.namaIndonesia}.${lintasKomoditas ? " Kesalahan ini lintas komoditas, dampak praktisnya tinggi karena saran tindakannya bisa salah sasaran." : ""}`,
    lintasKomoditas,
  };
}

export function susunWawasanPrediksi(params: {
  deteksiMentahLolos: DeteksiMentah[];
  deteksiMentahSemua: DeteksiMentah[];
  ambangKeyakinan: number;
  lebarGambar: number;
  tinggiGambar: number;
  labelAsli: KelasHama | null;
  analisisCitra: HasilAnalisisCitra | null;
}): WawasanPrediksi {
  const daftarDeteksi = olahDeteksi(params.deteksiMentahLolos, params.lebarGambar, params.tinggiGambar);
  const ringkasanPerKelas = ringkasPerKelas(daftarDeteksi);
  const hamaUtama = ringkasanPerKelas[0] ?? null;
  const jumlahDeteksi = daftarDeteksi.length;
  const rataRataSkor = jumlahDeteksi ? daftarDeteksi.reduce((j, d) => j + d.skor, 0) / jumlahDeteksi : 0;
  const rataRataAkurasiEmpiris = jumlahDeteksi
    ? daftarDeteksi.reduce((j, d) => j + d.akurasiEmpiris.akurasi, 0) / jumlahDeteksi
    : null;
  const kepadatan = tentukanKepadatan(hamaUtama);
  const cocokLabel = cocokkanLabel(params.labelAsli, hamaUtama, ringkasanPerKelas);
  const barisSapuan = cariBarisSapuanTerdekat(params.ambangKeyakinan);
  const komoditasTerlibat = Array.from(new Set(ringkasanPerKelas.map((r) => r.kelas.komoditas)));

  const kandidatDiBawah = params.deteksiMentahSemua.filter((d) => d.skor < params.ambangKeyakinan);
  const kandidatTerkuat = kandidatDiBawah.sort((a, b) => b.skor - a.skor)[0];

  // --- Catatan ukuran objek dibanding data latih ---
  let catatanUkuranObjek: string | null = null;
  if (jumlahDeteksi) {
    const rataLuas = daftarDeteksi.reduce((j, d) => j + d.luasRelatif, 0) / jumlahDeteksi;
    const adaObjekKecilSedang = daftarDeteksi.some((d) => d.kategoriUkuran !== "besar");
    catatanUkuranObjek = `Rata-rata objek menempati ${persen(rataLuas)} luas gambar, data latih rata-rata ${persen(PROFIL_DATA_LATIH.rataRataLuasObjekRelatif)}.`;
    if (adaObjekKecilSedang) {
      catatanUkuranObjek += ` Ada objek berukuran kecil atau sedang. Pada data uji, recall objek sedang hanya ${persen(PROFIL_DATA_LATIH.recallObjekSedang)} dibanding ${persen(PROFIL_DATA_LATIH.recallObjekBesar)} untuk objek besar, jadi mungkin ada hama yang terlewat.`;
    } else if (rataLuas < 0.05) {
      catatanUkuranObjek += " Objek jauh lebih kecil di frame dibanding data latih yang didominasi foto close-up.";
    }
  }

  // --- Judul dan narasi ---
  let judulHasil: string;
  let narasi: string;
  if (!hamaUtama) {
    judulHasil = "Tidak ada hama di atas ambang";
    narasi = kandidatTerkuat
      ? `Model tidak yakin menemukan hama pada ambang ${persen(params.ambangKeyakinan)}. Kandidat terkuat adalah ${(ambilKelasHama(kandidatTerkuat.classId) ?? DAFTAR_KELAS_HAMA[0]).namaIndonesia} dengan keyakinan ${persen(kandidatTerkuat.skor)}, masih di bawah ambang.`
      : `Model tidak menemukan kandidat hama sama sekali, bahkan pada keyakinan 5%. Kemungkinan gambar tidak memuat 24 jenis hama yang dipelajari.`;
  } else {
    const jenisLain = ringkasanPerKelas.length - 1;
    judulHasil = `${hamaUtama.jumlah} ${hamaUtama.kelas.namaIndonesia}${jenisLain > 0 ? ` dan ${jenisLain} jenis lain` : ""}`;
    narasi = `Model menemukan ${jumlahDeteksi} objek. Hama terbanyak adalah ${hamaUtama.kelas.namaIndonesia} (${hamaUtama.kelas.namaIlmiah}), hama ${hamaUtama.kelas.komoditas.toLowerCase()}, dengan keyakinan rata-rata ${persen(hamaUtama.rataRataSkor)}.`;
    if (rataRataAkurasiEmpiris !== null) {
      narasi += ` Pada data uji, deteksi dengan keyakinan serupa terbukti benar sekitar ${persen(rataRataAkurasiEmpiris)} dari waktu.`;
    }
    if (hamaUtama.kelas.kelasProksi) {
      narasi += " Kelas ini adalah hama tanah umum yang dipakai sebagai proksi hama bawang, bukan spesies khusus bawang.";
    }
  }

  // --- Langkah tindakan ---
  const langkahTindakan: string[] = [];
  if (hamaUtama) {
    if (hamaUtama.rataRataSkor < 0.5 || hamaUtama.statusKeandalan !== "teruji_baik") {
      langkahTindakan.push(`Cocokkan dulu secara langsung: ${hamaUtama.kelas.gejala}`);
    } else {
      langkahTindakan.push(`Periksa tanaman ${hamaUtama.kelas.komoditas.toLowerCase()} di sekitar perangkap. Ciri serangan: ${hamaUtama.kelas.gejala}`);
    }
    if (daftarDeteksi.some((d) => d.adaPesaingDekat || d.seringTertukarDengan)) {
      langkahTindakan.push("Ada deteksi yang skornya bersaing dengan kelas lain. Lihat kolom kelas alternatif sebelum memilih tindakan.");
    }
    langkahTindakan.push(...hamaUtama.kelas.pengendalian.slice(0, 2));
    if (hamaUtama.pestisida.length > 0) {
      langkahTindakan.push(
        `Bila populasi di lahan melewati batas aman, pilihan bahan aktif dari referensi AIGRA: ${hamaUtama.pestisida.map((p) => p.bahan_aktif).join(", ")}. Gilir bahan aktif dan ikuti dosis label.`
      );
    } else {
      langkahTindakan.push("Referensi pestisida AIGRA belum memuat hama ini. Konsultasikan pilihan obat dengan penyuluh pertanian lapangan (PPL).");
    }
  } else {
    langkahTindakan.push("Bila di lapangan memang terlihat hama, ambil foto lebih dekat dengan cahaya cukup lalu uji ulang.");
    langkahTindakan.push(`Coba turunkan ambang ke ${persen(AMBANG_F1_TERTINGGI)} (titik F1 tertinggi di notebook) untuk melihat kandidat yang lebih lemah.`);
  }
  const catatanPerhatian = params.analisisCitra?.daftarCatatan.filter((c) => c.tingkat === "perhatian") ?? [];
  if (catatanPerhatian.length > 0) {
    langkahTindakan.push(`Perbaiki kualitas foto berikutnya (${catatanPerhatian.map((c) => c.judul.toLowerCase()).join(", ")}) agar hasil lebih bisa dipercaya.`);
  }

  return {
    daftarDeteksi,
    ringkasanPerKelas,
    hamaUtama,
    komoditasTerlibat,
    jumlahDeteksi,
    rataRataSkor,
    rataRataAkurasiEmpiris,
    kepadatan,
    cocokLabel,
    tradeOffAmbang: { ambang: barisSapuan.ambang, presisi: barisSapuan.presisi, recall: barisSapuan.recall, f1: barisSapuan.f1 },
    judulHasil,
    narasi,
    langkahTindakan,
    catatanUkuranObjek,
    jumlahKandidatDiBawahAmbang: kandidatDiBawah.length,
    kandidatTerkuatDiBawahAmbang: kandidatTerkuat
      ? { kelas: ambilKelasHama(kandidatTerkuat.classId) ?? DAFTAR_KELAS_HAMA[0], skor: kandidatTerkuat.skor }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Keluaran untuk disalin, diunduh, atau dikirim ke backend
// ---------------------------------------------------------------------------

/** JSON dengan bentuk yang sama seperti respons POST /detect pada app.py */
export function susunResponsDeteksi(params: {
  namaBerkas: string;
  model: KonfigurasiModel;
  ambangKeyakinan: number;
  daftarDeteksi: DeteksiTerolah[];
}): ResponsDeteksi {
  const deteksi: HasilDeteksiHama[] = params.daftarDeteksi.map((d) => {
    const pestisida = ambilRekomendasiPestisida(d.kelas.namaIp102);
    return {
      class_id: d.kelas.classId,
      class_name_ip102: d.kelas.namaIp102,
      nama_indonesia: d.kelas.namaIndonesia,
      komoditas: d.kelas.komoditas,
      confidence: Number(d.skor.toFixed(4)),
      bbox_xyxy: d.kotak.map((n) => Math.round(n)) as [number, number, number, number],
      rekomendasi_pestisida: pestisida,
      ada_rekomendasi_pestisida: pestisida.length > 0,
      idDeteksiUnik: d.idDeteksi,
      tingkatKeyakinan: d.tingkatKeyakinan,
      estimasiUkuranCm: null,
      estimasiStadium: null,
    };
  });
  return {
    filename: params.namaBerkas,
    model_used: params.model.idModel,
    confidence_threshold_used: params.ambangKeyakinan,
    jumlah_deteksi: deteksi.length,
    deteksi,
  };
}

export function susunLaporanTeks(params: {
  namaBerkas: string;
  model: KonfigurasiModel;
  ambangKeyakinan: number;
  wawasan: WawasanPrediksi;
  analisisCitra: HasilAnalisisCitra | null;
  waktuInferensiMs: number;
  mesin: string;
}): string {
  const { wawasan, model } = params;
  const baris: string[] = [];
  baris.push("AIO PESTGUARD - LAPORAN UJI DETEKSI");
  baris.push("=".repeat(44));
  baris.push(`Gambar          : ${params.namaBerkas}`);
  baris.push(`Model           : ${model.namaTampilan} (ONNX, dijalankan di browser, ${params.mesin.toUpperCase()})`);
  baris.push(`Ambang keyakinan: ${persen(params.ambangKeyakinan)}`);
  baris.push(`Waktu inferensi : ${Math.round(params.waktuInferensiMs)} ms`);
  baris.push("");
  baris.push(`HASIL: ${wawasan.judulHasil}`);
  baris.push(wawasan.narasi);
  if (wawasan.cocokLabel.kalimat) baris.push(`Pembanding label asli: ${wawasan.cocokLabel.kalimat}`);
  baris.push("");
  if (wawasan.daftarDeteksi.length) {
    baris.push("DAFTAR DETEKSI");
    for (const d of wawasan.daftarDeteksi) {
      const alternatif = d.alternatif.length
        ? ` | alternatif: ${d.alternatif.map((a) => `${a.kelas.namaIndonesia} ${persen(a.skor)}`).join(", ")}`
        : "";
      baris.push(
        `${d.nomor}. ${d.kelas.namaIndonesia} (${d.kelas.namaIp102}) ${persen(d.skor)} | bbox [${d.kotak.map((n) => Math.round(n)).join(", ")}]${alternatif}`
      );
    }
    baris.push("");
  }
  baris.push("SEBERAPA BISA DIPERCAYA");
  baris.push(
    `Pada ambang ${persen(wawasan.tradeOffAmbang.ambang)}, hasil uji notebook: presisi ${persen(wawasan.tradeOffAmbang.presisi)}, recall ${persen(wawasan.tradeOffAmbang.recall)}, F1 ${wawasan.tradeOffAmbang.f1.toFixed(3)}.`
  );
  for (const ringkasan of wawasan.ringkasanPerKelas) {
    baris.push(`- ${ringkasan.kelas.namaIndonesia}: ${ringkasan.penjelasanKeandalan}`);
  }
  if (wawasan.catatanUkuranObjek) baris.push(`- ${wawasan.catatanUkuranObjek}`);
  if (params.analisisCitra) {
    for (const catatan of params.analisisCitra.daftarCatatan) {
      baris.push(`- ${catatan.judul} (${catatan.nilai}): ${catatan.penjelasan}`);
    }
  }
  baris.push("");
  baris.push("LANGKAH YANG DISARANKAN");
  wawasan.langkahTindakan.forEach((langkah, i) => baris.push(`${i + 1}. ${langkah}`));
  baris.push("");
  baris.push("Catatan: hasil ini adalah uji model pada gambar contoh, bukan pemantauan lahan. Pilihan obat berasal");
  baris.push("dari referensi AIGRA dan bukan pengganti anjuran penyuluh pertanian lapangan.");
  return baris.join("\n");
}
