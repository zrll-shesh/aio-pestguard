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
import { normalisasiNamaHama, tentukanTingkatKeyakinan } from "@/lib/insightEngine";
import { keRekomendasiApi, ringkasPengendalian } from "./referensiPestisida";
import { formatAngka, namaKomoditas, pilihTeks, terjemahKonten, type Bahasa } from "@/lib/i18n/bahasa";
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
  akurasiEmpiris: { akurasi: number; bawah: number; atas: number; jumlahSampel: number };
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
  pengendalian: ReturnType<typeof ringkasPengendalian>;
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
          bawah: baris.bawah,
          atas: baris.atas,
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

function ringkasPerKelas(daftarDeteksi: DeteksiTerolah[], bahasa: Bahasa): RingkasanKelasTerdeteksi[] {
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
        penjelasanKeandalan: jelaskanKeandalanKelas(kelas, bahasa),
        pengendalian: ringkasPengendalian(kelas.classId),
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
  ringkasan: RingkasanKelasTerdeteksi[],
  bahasa: Bahasa
): WawasanPrediksi["cocokLabel"] {
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  const nama = (k: KelasHama) => terjemahKonten(bahasa, k.namaIndonesia);
  if (!labelAsli) return { hasil: "tidak_diketahui", labelAsli: null, kalimat: null, lintasKomoditas: false };
  if (!hamaUtama) {
    return {
      hasil: "tidak_terdeteksi",
      labelAsli,
      kalimat: t(
        `Label asli gambar ini ${nama(labelAsli)}, tetapi model tidak menemukan hama pada ambang ini. Coba turunkan ambang untuk melihat kandidat yang lebih lemah.`,
        `The true label is ${nama(labelAsli)}, but the model found no pest at this threshold. Lower the threshold to see weaker candidates.`,
        `실제 정답은 ${nama(labelAsli)}이지만 이 임계값에서는 해충을 찾지 못했습니다. 임계값을 낮춰 약한 후보를 확인해 보세요.`
      ),
      lintasKomoditas: false,
    };
  }
  if (hamaUtama.kelas.classId === labelAsli.classId) {
    return {
      hasil: "benar",
      labelAsli,
      kalimat: t(`Sesuai label asli: ${nama(labelAsli)}.`, `Matches the true label: ${nama(labelAsli)}.`, `실제 정답과 일치: ${nama(labelAsli)}.`),
      lintasKomoditas: false,
    };
  }
  const lintasKomoditas = hamaUtama.kelas.komoditas !== labelAsli.komoditas;
  if (ringkasan.some((r) => r.kelas.classId === labelAsli.classId)) {
    return {
      hasil: "sebagian",
      labelAsli,
      kalimat: t(
        `Label asli ${nama(labelAsli)} ikut terdeteksi, tetapi bukan hasil terbanyak.`,
        `The true label ${nama(labelAsli)} was also detected, but it is not the most frequent result.`,
        `실제 정답 ${nama(labelAsli)}도 탐지되었지만 가장 많이 나온 결과는 아닙니다.`
      ),
      lintasKomoditas,
    };
  }
  return {
    hasil: "salah",
    labelAsli,
    kalimat:
      t(
        `Label asli ${nama(labelAsli)}, model menebak ${nama(hamaUtama.kelas)}.`,
        `True label ${nama(labelAsli)}; the model guessed ${nama(hamaUtama.kelas)}.`,
        `실제 정답은 ${nama(labelAsli)}, 모델 예측은 ${nama(hamaUtama.kelas)}입니다.`
      ) +
      (lintasKomoditas
        ? t(
            " Kesalahan ini lintas komoditas, dampak praktisnya tinggi karena saran tindakannya bisa salah sasaran.",
            " This error crosses crops, so its practical impact is high: the advice may target the wrong crop.",
            " 작물이 다른 오류라서 방제 안내가 엉뚱한 곳을 향할 수 있어 실제 영향이 큽니다."
          )
        : ""),
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
  bahasa: Bahasa;
}): WawasanPrediksi {
  const { bahasa } = params;
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  const nama = (k: KelasHama) => terjemahKonten(bahasa, k.namaIndonesia);
  const persenB = (v: number) => `${formatAngka(bahasa, v * 100)}%`;

  const daftarDeteksi = olahDeteksi(params.deteksiMentahLolos, params.lebarGambar, params.tinggiGambar);
  const ringkasanPerKelas = ringkasPerKelas(daftarDeteksi, bahasa);
  const hamaUtama = ringkasanPerKelas[0] ?? null;
  const jumlahDeteksi = daftarDeteksi.length;
  const rataRataSkor = jumlahDeteksi ? daftarDeteksi.reduce((j, d) => j + d.skor, 0) / jumlahDeteksi : 0;
  const rataRataAkurasiEmpiris = jumlahDeteksi ? daftarDeteksi.reduce((j, d) => j + d.akurasiEmpiris.akurasi, 0) / jumlahDeteksi : null;
  const kepadatan = tentukanKepadatan(hamaUtama);
  const cocokLabel = cocokkanLabel(params.labelAsli, hamaUtama, ringkasanPerKelas, bahasa);
  const barisSapuan = cariBarisSapuanTerdekat(params.ambangKeyakinan);
  const komoditasTerlibat = Array.from(new Set(ringkasanPerKelas.map((r) => r.kelas.komoditas)));

  const kandidatDiBawah = params.deteksiMentahSemua.filter((d) => d.skor < params.ambangKeyakinan);
  const kandidatTerkuat = kandidatDiBawah.sort((a, b) => b.skor - a.skor)[0];
  const kelasKandidat = kandidatTerkuat ? ambilKelasHama(kandidatTerkuat.classId) ?? DAFTAR_KELAS_HAMA[0] : null;

  // --- Ukuran objek dibanding data latih ---
  let catatanUkuranObjek: string | null = null;
  if (jumlahDeteksi) {
    const rataLuas = daftarDeteksi.reduce((j, d) => j + d.luasRelatif, 0) / jumlahDeteksi;
    const adaObjekKecilSedang = daftarDeteksi.some((d) => d.kategoriUkuran !== "besar");
    const latih = persenB(PROFIL_DATA_LATIH.rataRataLuasObjekRelatif);
    catatanUkuranObjek = t(
      `Rata-rata objek menempati ${persenB(rataLuas)} luas gambar, data latih rata-rata ${latih}.`,
      `Objects take up ${persenB(rataLuas)} of the image on average; the training data average is ${latih}.`,
      `객체가 이미지의 평균 ${persenB(rataLuas)}를 차지합니다(학습 데이터 평균 ${latih}).`
    );
    if (adaObjekKecilSedang) {
      const sedang = persenB(PROFIL_DATA_LATIH.recallObjekSedang);
      const besar = persenB(PROFIL_DATA_LATIH.recallObjekBesar);
      catatanUkuranObjek += t(
        ` Ada objek berukuran kecil atau sedang. Pada data uji, recall objek sedang hanya ${sedang} dibanding ${besar} untuk objek besar, jadi mungkin ada hama yang terlewat.`,
        ` Some objects are small or medium. In the test data, recall for medium objects was only ${sedang} versus ${besar} for large ones, so some pests may be missed.`,
        ` 작거나 중간 크기의 객체가 있습니다. 시험 데이터에서 중간 객체의 재현율은 ${sedang}로 큰 객체(${besar})보다 낮아 놓친 해충이 있을 수 있습니다.`
      );
    } else if (rataLuas < 0.05) {
      catatanUkuranObjek += t(
        " Objek jauh lebih kecil di frame dibanding data latih yang didominasi foto close-up.",
        " Objects are much smaller in frame than in the mostly close-up training photos.",
        " 근접 사진 위주인 학습 데이터보다 객체가 화면에서 훨씬 작습니다."
      );
    }
  }

  // --- Judul dan narasi ---
  let judulHasil: string;
  let narasi: string;
  if (!hamaUtama) {
    judulHasil = t("Tidak ada hama di atas ambang", "No pests above the threshold", "임계값 이상의 해충 없음");
    narasi =
      kandidatTerkuat && kelasKandidat
        ? t(
            `Model tidak yakin menemukan hama pada ambang ${persenB(params.ambangKeyakinan)}. Kandidat terkuat adalah ${nama(kelasKandidat)} dengan keyakinan ${persenB(kandidatTerkuat.skor)}, masih di bawah ambang.`,
            `The model is not confident of any pest at the ${persenB(params.ambangKeyakinan)} threshold. The strongest candidate is ${nama(kelasKandidat)} at ${persenB(kandidatTerkuat.skor)}, still below the threshold.`,
            `${persenB(params.ambangKeyakinan)} 임계값에서는 확실한 해충이 없습니다. 가장 강한 후보는 ${nama(kelasKandidat)}(${persenB(kandidatTerkuat.skor)})로 임계값 미만입니다.`
          )
        : t(
            "Model tidak menemukan kandidat hama sama sekali, bahkan pada keyakinan 5%. Kemungkinan gambar tidak memuat 24 jenis hama yang dipelajari.",
            "The model found no pest candidates at all, even at 5% confidence. The image probably does not contain any of the 24 learned pests.",
            "신뢰도 5%에서도 해충 후보가 전혀 없습니다. 학습한 24종 해충이 사진에 없을 가능성이 큽니다."
          );
  } else {
    const jenisLain = ringkasanPerKelas.length - 1;
    const k = hamaUtama.kelas;
    const komoditas = namaKomoditas(bahasa, k.komoditas);
    judulHasil = t(
      `${hamaUtama.jumlah} ${nama(k)}${jenisLain > 0 ? ` dan ${jenisLain} jenis lain` : ""}`,
      `${hamaUtama.jumlah} ${nama(k)}${jenisLain > 0 ? ` and ${jenisLain} other type(s)` : ""}`,
      `${nama(k)} ${hamaUtama.jumlah}마리${jenisLain > 0 ? ` 외 ${jenisLain}종` : ""}`
    );
    narasi = t(
      `Model menemukan ${jumlahDeteksi} objek. Hama terbanyak adalah ${nama(k)} (${k.namaIlmiah}), hama ${komoditas.toLowerCase()}, dengan keyakinan rata-rata ${persenB(hamaUtama.rataRataSkor)}.`,
      `The model found ${jumlahDeteksi} object(s). The most frequent pest is ${nama(k)} (${k.namaIlmiah}), a ${komoditas.toLowerCase()} pest, with average confidence ${persenB(hamaUtama.rataRataSkor)}.`,
      `모델이 객체 ${jumlahDeteksi}개를 찾았습니다. 가장 많은 해충은 ${komoditas} 해충인 ${nama(k)}(${k.namaIlmiah})이며 평균 신뢰도는 ${persenB(hamaUtama.rataRataSkor)}입니다.`
    );
    if (rataRataAkurasiEmpiris !== null) {
      narasi += t(
        ` Pada data uji, deteksi dengan keyakinan serupa terbukti benar sekitar ${persenB(rataRataAkurasiEmpiris)} dari waktu.`,
        ` In the test data, detections with similar confidence were correct about ${persenB(rataRataAkurasiEmpiris)} of the time.`,
        ` 시험 데이터에서 비슷한 신뢰도의 탐지는 약 ${persenB(rataRataAkurasiEmpiris)} 정확했습니다.`
      );
    }
    if (k.kelasProksi) {
      narasi += t(
        " Kelas ini adalah hama tanah umum yang dipakai sebagai proksi hama bawang, bukan spesies khusus bawang.",
        " This class is a general soil pest used as a proxy for shallot pests, not a shallot-specific species.",
        " 이 종류는 샬롯 전용 종이 아니라 샬롯 해충의 대리로 쓰는 일반 토양 해충입니다."
      );
    }
  }

  // --- Langkah tindakan (versi teknis, dipakai laporan) ---
  const langkahTindakan: string[] = [];
  if (hamaUtama) {
    const k = hamaUtama.kelas;
    const gejala = terjemahKonten(bahasa, k.gejala);
    if (hamaUtama.rataRataSkor < 0.5 || hamaUtama.statusKeandalan !== "teruji_baik") {
      langkahTindakan.push(t(`Cocokkan dulu secara langsung: ${gejala}`, `Confirm in the field first: ${gejala}`, `먼저 현장에서 직접 확인하세요: ${gejala}`));
    } else {
      langkahTindakan.push(
        t(
          `Periksa tanaman ${namaKomoditas(bahasa, k.komoditas).toLowerCase()} di sekitar perangkap. Ciri serangan: ${gejala}`,
          `Inspect ${namaKomoditas(bahasa, k.komoditas).toLowerCase()} plants around the trap. Signs of attack: ${gejala}`,
          `트랩 주변의 ${namaKomoditas(bahasa, k.komoditas)}를 살피세요. 피해 특징: ${gejala}`
        )
      );
    }
    if (daftarDeteksi.some((d) => d.adaPesaingDekat || d.seringTertukarDengan)) {
      langkahTindakan.push(
        t(
          "Ada deteksi yang skornya bersaing dengan kelas lain. Lihat kolom kelas alternatif sebelum memilih tindakan.",
          "Some detections compete closely with another class. Check the alternative classes before acting.",
          "다른 종류와 점수가 비슷한 탐지가 있습니다. 조치 전에 대체 후보를 확인하세요."
        )
      );
    }
    langkahTindakan.push(...k.pengendalian.slice(0, 2).map((x) => terjemahKonten(bahasa, x)));
    const { kimiaBoleh, kimiaTerlarang, alami } = hamaUtama.pengendalian;
    if (alami.length > 0) {
      const daftarAlami = alami.map((a) => terjemahKonten(bahasa, a.nama)).join("; ");
      langkahTindakan.push(t(`Cara alami yang bisa dicoba lebih dulu: ${daftarAlami}.`, `Natural methods to try first: ${daftarAlami}.`, `먼저 시도할 친환경 방법: ${daftarAlami}.`));
    }
    if (kimiaBoleh.length > 0) {
      const daftarKimia = kimiaBoleh.slice(0, 4).map((x) => x.bahanAktif).join(", ");
      langkahTindakan.push(
        t(
          `Bila populasi di lahan melewati batas aman, pilihan bahan aktif: ${daftarKimia}. Gilir bahan aktif dan ikuti dosis label.`,
          `If field numbers pass the safe limit, active ingredient options: ${daftarKimia}. Rotate ingredients and follow label doses.`,
          `밭의 밀도가 안전 기준을 넘으면 쓸 수 있는 유효성분: ${daftarKimia}. 성분을 바꿔 가며 라벨 용량을 지키세요.`
        )
      );
    } else {
      langkahTindakan.push(
        t(
          "Belum ada pilihan obat kimia yang boleh dipakai di referensi. Konsultasikan dengan penyuluh pertanian lapangan (PPL).",
          "No permitted chemical option is listed in the reference yet. Consult your agricultural extension officer.",
          "참고 자료에 사용 가능한 화학 약제가 아직 없습니다. 농업 지도사와 상담하세요."
        )
      );
    }
    if (kimiaTerlarang.length > 0) {
      const daftarLarang = kimiaTerlarang.map((x) => x.bahanAktif).join(", ");
      langkahTindakan.push(
        t(
          `Jangan pakai di ${namaKomoditas(bahasa, k.komoditas).toLowerCase()}: ${daftarLarang}.`,
          `Do not use on ${namaKomoditas(bahasa, k.komoditas).toLowerCase()}: ${daftarLarang}.`,
          `${namaKomoditas(bahasa, k.komoditas)}에 사용 금지: ${daftarLarang}.`
        )
      );
    }
  } else {
    langkahTindakan.push(
      t(
        "Bila di lapangan memang terlihat hama, ambil foto lebih dekat dengan cahaya cukup lalu uji ulang.",
        "If pests are visible in the field, take a closer photo in good light and test again.",
        "현장에서 해충이 보인다면 밝은 곳에서 더 가까이 찍어 다시 확인하세요."
      )
    );
    langkahTindakan.push(
      t(
        `Coba turunkan ambang ke ${persenB(AMBANG_F1_TERTINGGI)} (titik F1 tertinggi di notebook) untuk melihat kandidat yang lebih lemah.`,
        `Try lowering the threshold to ${persenB(AMBANG_F1_TERTINGGI)} (the best-F1 point in the notebook) to see weaker candidates.`,
        `임계값을 ${persenB(AMBANG_F1_TERTINGGI)}(노트북의 최고 F1 지점)로 낮춰 약한 후보를 확인해 보세요.`
      )
    );
  }
  const catatanPerhatian = params.analisisCitra?.daftarCatatan.filter((c) => c.tingkat === "perhatian") ?? [];
  if (catatanPerhatian.length > 0) {
    const daftarJudul = catatanPerhatian.map((c) => c.judul.toLowerCase()).join(", ");
    langkahTindakan.push(
      t(
        `Perbaiki kualitas foto berikutnya (${daftarJudul}) agar hasil lebih bisa dipercaya.`,
        `Improve the next photo (${daftarJudul}) for more reliable results.`,
        `다음 사진의 품질(${daftarJudul})을 개선하면 결과를 더 믿을 수 있습니다.`
      )
    );
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
    kandidatTerkuatDiBawahAmbang: kandidatTerkuat && kelasKandidat ? { kelas: kelasKandidat, skor: kandidatTerkuat.skor } : null,
  };
}

// ---------------------------------------------------------------------------
// Keluaran untuk disalin, diunduh, atau dikirim ke backend
// ---------------------------------------------------------------------------

/** JSON dengan bentuk yang sama seperti respons POST /detect pada app.py (selalu bahasa Indonesia, sesuai kontrak) */
export function susunResponsDeteksi(params: {
  namaBerkas: string;
  model: KonfigurasiModel;
  ambangKeyakinan: number;
  daftarDeteksi: DeteksiTerolah[];
}): ResponsDeteksi {
  const deteksi: HasilDeteksiHama[] = params.daftarDeteksi.map((d) => {
    const pestisida = keRekomendasiApi(d.kelas.classId);
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
  bahasa: Bahasa;
}): string {
  const { wawasan, model, bahasa } = params;
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  const persenB = (v: number) => `${formatAngka(bahasa, v * 100)}%`;
  const baris: string[] = [];
  baris.push(t("AIO PESTGUARD - LAPORAN UJI DETEKSI", "AIO PESTGUARD - DETECTION TEST REPORT", "AIO PESTGUARD - 탐지 시험 보고서"));
  baris.push("=".repeat(44));
  baris.push(`${t("Gambar", "Image", "이미지")}: ${params.namaBerkas}`);
  baris.push(`${t("Model", "Model", "모델")}: ${model.namaTampilan} (ONNX, ${t("di browser", "in browser", "브라우저")}, ${params.mesin.toUpperCase()})`);
  baris.push(`${t("Ambang keyakinan", "Confidence threshold", "신뢰도 임계값")}: ${persenB(params.ambangKeyakinan)}`);
  baris.push(`${t("Waktu inferensi", "Inference time", "추론 시간")}: ${Math.round(params.waktuInferensiMs)} ms`);
  baris.push("");
  baris.push(`${t("HASIL", "RESULT", "결과")}: ${wawasan.judulHasil}`);
  baris.push(wawasan.narasi);
  if (wawasan.cocokLabel.kalimat) baris.push(`${t("Pembanding label asli", "True label check", "실제 정답 비교")}: ${wawasan.cocokLabel.kalimat}`);
  baris.push("");
  if (wawasan.daftarDeteksi.length) {
    baris.push(t("DAFTAR DETEKSI", "DETECTIONS", "탐지 목록"));
    for (const d of wawasan.daftarDeteksi) {
      const alternatif = d.alternatif.length
        ? ` | ${t("alternatif", "alternatives", "대체 후보")}: ${d.alternatif.map((a) => `${terjemahKonten(bahasa, a.kelas.namaIndonesia)} ${persenB(a.skor)}`).join(", ")}`
        : "";
      baris.push(`${d.nomor}. ${terjemahKonten(bahasa, d.kelas.namaIndonesia)} (${d.kelas.namaIp102}) ${persenB(d.skor)} | bbox [${d.kotak.map((n) => Math.round(n)).join(", ")}]${alternatif}`);
    }
    baris.push("");
  }
  baris.push(t("SEBERAPA BISA DIPERCAYA", "HOW RELIABLE", "신뢰도"));
  baris.push(
    t(
      `Pada ambang ${persenB(wawasan.tradeOffAmbang.ambang)}, hasil uji notebook: presisi ${persenB(wawasan.tradeOffAmbang.presisi)}, recall ${persenB(wawasan.tradeOffAmbang.recall)}, F1 ${formatAngka(bahasa, wawasan.tradeOffAmbang.f1, 3)}.`,
      `At the ${persenB(wawasan.tradeOffAmbang.ambang)} threshold, notebook test results: precision ${persenB(wawasan.tradeOffAmbang.presisi)}, recall ${persenB(wawasan.tradeOffAmbang.recall)}, F1 ${formatAngka(bahasa, wawasan.tradeOffAmbang.f1, 3)}.`,
      `${persenB(wawasan.tradeOffAmbang.ambang)} 임계값의 노트북 시험 결과: 정밀도 ${persenB(wawasan.tradeOffAmbang.presisi)}, 재현율 ${persenB(wawasan.tradeOffAmbang.recall)}, F1 ${formatAngka(bahasa, wawasan.tradeOffAmbang.f1, 3)}.`
    )
  );
  for (const ringkasan of wawasan.ringkasanPerKelas) {
    baris.push(`- ${terjemahKonten(bahasa, ringkasan.kelas.namaIndonesia)}: ${ringkasan.penjelasanKeandalan}`);
  }
  if (wawasan.catatanUkuranObjek) baris.push(`- ${wawasan.catatanUkuranObjek}`);
  for (const catatan of params.analisisCitra?.daftarCatatan ?? []) {
    baris.push(`- ${catatan.judul} (${catatan.nilai}): ${catatan.penjelasan}`);
  }
  baris.push("");
  baris.push(t("LANGKAH YANG DISARANKAN", "SUGGESTED STEPS", "권장 조치"));
  wawasan.langkahTindakan.forEach((langkah, i) => baris.push(`${i + 1}. ${langkah}`));
  baris.push("");
  baris.push(
    t(
      "Catatan: hasil ini adalah uji model pada gambar contoh, bukan pemantauan lahan. Pilihan obat berasal dari referensi tim dan bukan pengganti anjuran penyuluh pertanian lapangan.",
      "Note: this is a model test on a sample image, not field monitoring. Chemical options come from the team reference and do not replace advice from an agricultural extension officer.",
      "참고: 이 결과는 예시 이미지에 대한 모델 시험이며 현장 모니터링이 아닙니다. 약제 정보는 팀 참고 자료이며 농업 지도사의 안내를 대신하지 않습니다."
    )
  );
  return baris.join("\n");
}
