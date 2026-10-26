/**
 * lib/i18n/wawasanLahan.ts
 *
 * Kalimat Beranda (ringkasan semua lahan, kartu prediksi per lahan) dalam tiga bahasa,
 * dibangun dari angka di RingkasanLahan dan estimasi stadium, bukan dari teks Indonesia
 * bawaan insightEngine. Dengan begitu Beranda bisa berganti bahasa sepenuhnya.
 */

import type { HasilDeteksiHama, RingkasanLahan, SesiPemantauanLahan } from "@/lib/types";
import { DAFTAR_KELAS_HAMA, type KelasHama } from "@/lib/model/kelasHama";
import { normalisasiNamaHama } from "@/lib/insightEngine";
import { formatAngka, formatTanggal, namaKomoditas, pilihTeks, terjemahKonten, type Bahasa } from "./bahasa";

export function kelasDariKunciHama(kunci: string): KelasHama | null {
  return DAFTAR_KELAS_HAMA.find((k) => normalisasiNamaHama(k.namaIp102) === kunci) ?? null;
}

/** Nama hama untuk ditampilkan dari nama IP102 mentah pada data deteksi */
export function namaHamaDariDeteksi(bahasa: Bahasa, deteksi: Pick<HasilDeteksiHama, "class_name_ip102" | "nama_indonesia">): string {
  const kelas = kelasDariKunciHama(normalisasiNamaHama(deteksi.class_name_ip102));
  return kelas ? terjemahKonten(bahasa, kelas.namaIndonesia) : deteksi.nama_indonesia;
}

export function namaHamaLahan(bahasa: Bahasa, ringkasan: RingkasanLahan): string {
  const kelas = kelasDariKunciHama(ringkasan.kunciReferensiHama);
  return kelas ? terjemahKonten(bahasa, kelas.namaIndonesia) : ringkasan.hamaDominan;
}

export function kalimatRingkasanSemuaLahan(bahasa: Bahasa, daftar: RingkasanLahan[]): string {
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  const tinggi = daftar.filter((r) => r.tingkatRisiko === "tinggi");
  const sedang = daftar.filter((r) => r.tingkatRisiko === "sedang");
  const utama = daftar[0];
  if (!utama) return t("Belum ada data lahan.", "No field data yet.", "아직 농지 데이터가 없습니다.");
  const namaUtama = `${utama.namaLahan} (${namaKomoditas(bahasa, utama.komoditas)})`;
  const hama = namaHamaLahan(bahasa, utama);
  if (tinggi.length > 0) {
    return t(
      `${tinggi.length} dari ${daftar.length} lahan perlu tindakan segera. Paling mendesak: ${namaUtama}, serangan ${hama}.`,
      `${tinggi.length} of ${daftar.length} fields need action now. Most urgent: ${namaUtama}, ${hama} outbreak.`,
      `농지 ${daftar.length}곳 중 ${tinggi.length}곳에 즉시 조치가 필요합니다. 가장 급한 곳: ${namaUtama}, ${hama} 발생.`
    );
  }
  if (sedang.length > 0) {
    return t(
      `Belum ada lahan yang kritis, tetapi ${sedang.length} lahan perlu diwaspadai. Pantau ${namaUtama}.`,
      `No field is critical yet, but ${sedang.length} need watching. Keep an eye on ${namaUtama}.`,
      `아직 위급한 농지는 없지만 ${sedang.length}곳은 주의가 필요합니다. ${namaUtama}을(를) 지켜보세요.`
    );
  }
  return t("Semua lahan dalam batas aman minggu ini.", "All fields are within safe limits this week.", "이번 주 모든 농지가 안전 범위 안에 있습니다.");
}

export interface TitikLinimasa {
  jenis: "sekarang" | "dewasa" | "bertelur" | "batas";
  judul: string;
  keterangan: string;
  tanggalIso: string | null;
}

/** Deteksi yang paling cepat bertelur dipakai sebagai acuan (skenario terburuk) */
export function pilihDeteksiAcuan(sesi: SesiPemantauanLahan | null): HasilDeteksiHama | null {
  if (!sesi) return null;
  const dengan = sesi.daftarDeteksi.filter((d) => d.estimasiStadium);
  if (!dengan.length) return null;
  return [...dengan].sort((a, b) => {
    const ta = a.estimasiStadium?.perkiraanTanggalMulaiOviposisi ?? "9999";
    const tb = b.estimasiStadium?.perkiraanTanggalMulaiOviposisi ?? "9999";
    return ta.localeCompare(tb) || (b.estimasiUkuranCm ?? 0) - (a.estimasiUkuranCm ?? 0);
  })[0];
}

export function susunLinimasa(bahasa: Bahasa, deteksi: HasilDeteksiHama | null): TitikLinimasa[] {
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  const est = deteksi?.estimasiStadium;
  if (!deteksi || !est) return [];
  const tgl = (iso: string) => formatTanggal(bahasa, iso, { day: "numeric", month: "short" });
  const stadium = terjemahKonten(bahasa, est.namaStadium);
  const ukuran = deteksi.estimasiUkuranCm !== null ? `${formatAngka(bahasa, deteksi.estimasiUkuranCm, 2)} cm` : "";
  const sudahDewasa = /dewasa/i.test(est.namaStadium);
  const titik: TitikLinimasa[] = [
    {
      jenis: "sekarang",
      judul: t(`Sekarang: ${stadium}`, `Now: ${stadium}`, `현재: ${stadium}`),
      keterangan: t(`Ukuran terukur ${ukuran}`, `Measured size ${ukuran}`, `측정 크기 ${ukuran}`),
      tanggalIso: null,
    },
  ];
  if (!sudahDewasa && est.masaPraOviposisi) {
    titik.push({
      jenis: "dewasa",
      judul: t(`Menjadi dewasa sekitar ${tgl(est.masaPraOviposisi.tanggalMulai)}`, `Becomes adult around ${tgl(est.masaPraOviposisi.tanggalMulai)}`, `${tgl(est.masaPraOviposisi.tanggalMulai)}경 성충이 됨`),
      keterangan: t("Perkiraan dari lama tiap fase", "Estimated from stage durations", "단계별 기간으로 추정"),
      tanggalIso: est.masaPraOviposisi.tanggalMulai,
    });
  }
  if (est.perkiraanTanggalMulaiOviposisi) {
    titik.push({
      jenis: "bertelur",
      judul: t(`Mulai bertelur sekitar ${tgl(est.perkiraanTanggalMulaiOviposisi)}`, `Starts laying eggs around ${tgl(est.perkiraanTanggalMulaiOviposisi)}`, `${tgl(est.perkiraanTanggalMulaiOviposisi)}경 산란 시작`),
      keterangan: t("Setelah itu populasi bisa melonjak", "After that, numbers can surge", "그 뒤로 개체 수가 급증할 수 있음"),
      tanggalIso: est.perkiraanTanggalMulaiOviposisi,
    });
    titik.push({
      jenis: "batas",
      judul: t(`Bertindak sebelum ${tgl(est.perkiraanTanggalMulaiOviposisi)}`, `Act before ${tgl(est.perkiraanTanggalMulaiOviposisi)}`, `${tgl(est.perkiraanTanggalMulaiOviposisi)} 이전에 조치`),
      keterangan: t("Waktu terbaik mengendalikan, sebelum telur menetas jadi generasi baru", "Best window for control, before eggs start a new generation", "알이 새 세대가 되기 전, 방제하기 가장 좋은 때"),
      tanggalIso: est.perkiraanTanggalMulaiOviposisi,
    });
  } else {
    titik.push({
      jenis: "batas",
      judul: t(`Hama dewasa dapat terus berkembang biak`, `Adults can keep breeding`, `성충이 계속 번식할 수 있음`),
      keterangan: t("Kendalikan secepatnya bila jumlahnya terus naik", "Control soon if numbers keep rising", "수가 계속 늘면 빨리 방제하세요"),
      tanggalIso: null,
    });
  }
  return titik;
}

export function narasiDetailLahan(bahasa: Bahasa, r: RingkasanLahan): string {
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  const hama = namaHamaLahan(bahasa, r);
  const naik = r.perubahanMingguanPersen;
  const arah =
    naik > 0
      ? t(`naik ${naik}%`, `up ${naik}%`, `${naik}% 증가`)
      : naik < 0
        ? t(`turun ${Math.abs(naik)}%`, `down ${Math.abs(naik)}%`, `${Math.abs(naik)}% 감소`)
        : t("tetap", "unchanged", "변화 없음");
  const yakin = formatAngka(bahasa, r.rataRataKeyakinanHariIni * 100);
  let kalimat = t(
    `Minggu ini perangkap di ${r.namaLahan} menangkap ${r.totalDeteksiMingguIni} ${hama}, ${arah} dibanding minggu lalu (${r.totalDeteksiMingguLalu}). Jumlah ini ${r.persenDariAmbangBatas}% dari batas aman mingguan (${r.ambangBatasMingguan}).`,
    `This week the traps in ${r.namaLahan} caught ${r.totalDeteksiMingguIni} ${hama}, ${arah} from last week (${r.totalDeteksiMingguLalu}). That is ${r.persenDariAmbangBatas}% of the weekly safe limit (${r.ambangBatasMingguan}).`,
    `이번 주 ${r.namaLahan}의 트랩에 ${hama} ${r.totalDeteksiMingguIni}마리가 잡혔고, 지난주(${r.totalDeteksiMingguLalu})보다 ${arah}했습니다. 주간 안전 기준(${r.ambangBatasMingguan})의 ${r.persenDariAmbangBatas}%입니다.`
  );
  kalimat += t(
    ` Keyakinan rata-rata deteksi hari ini ${yakin}%.`,
    ` Today's average detection confidence is ${yakin}%.`,
    ` 오늘 탐지의 평균 신뢰도는 ${yakin}%입니다.`
  );
  if (r.rataRataKeyakinanHariIni < 0.6) {
    kalimat += t(
      " Keyakinan masih rendah, jadi cocokkan dulu langsung di lahan.",
      " Confidence is still low, so confirm in the field first.",
      " 신뢰도가 아직 낮으니 먼저 현장에서 확인하세요."
    );
  }
  return kalimat;
}
