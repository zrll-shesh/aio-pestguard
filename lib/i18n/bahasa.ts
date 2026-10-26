/**
 * lib/i18n/bahasa.ts
 *
 * Dasar tiga bahasa AIO PESTGUARD: Indonesia (bawaan), English, 한국어.
 * - Teks antarmuka ditulis langsung di komponen sebagai objek { id, en, ko } lalu dipilih
 *   dengan pilihTeks(). Dengan begitu teks dan terjemahannya selalu berdampingan.
 * - Isi data (nama hama, gejala, panduan) diterjemahkan lewat terjemahKonten(), yang
 *   memakai teks Indonesia sebagai kunci (lib/i18n/kontenTerjemahan.ts).
 */

import type { JenisKomoditas } from "@/lib/types";
import { TERJEMAHAN_KONTEN } from "./kontenTerjemahan";

export type Bahasa = "id" | "en" | "ko";
export type Teks3 = { id: string; en: string; ko: string };

export const DAFTAR_BAHASA: Array<{ kode: Bahasa; label: string; singkat: string }> = [
  { kode: "id", label: "Bahasa Indonesia", singkat: "ID" },
  { kode: "en", label: "English", singkat: "EN" },
  { kode: "ko", label: "한국어", singkat: "한" },
];

export const LOCALE_PER_BAHASA: Record<Bahasa, string> = { id: "id-ID", en: "en-US", ko: "ko-KR" };
export const KUNCI_PENYIMPANAN_BAHASA = "aio-pestguard-bahasa";

export function pilihTeks(bahasa: Bahasa, teks: Teks3): string {
  return teks[bahasa] || teks.id;
}

/** Menerjemahkan isi data. Bila terjemahan belum ada, teks Indonesia ditampilkan apa adanya. */
export function terjemahKonten(bahasa: Bahasa, teksIndonesia: string): string {
  if (bahasa === "id") return teksIndonesia;
  const pasangan = TERJEMAHAN_KONTEN[teksIndonesia];
  if (!pasangan) return teksIndonesia;
  return bahasa === "en" ? pasangan[0] : pasangan[1];
}

export const NAMA_KOMODITAS: Record<JenisKomoditas, Teks3> = {
  Padi: { id: "Padi", en: "Rice", ko: "벼" },
  Jagung: { id: "Jagung", en: "Corn", ko: "옥수수" },
  Bawang: { id: "Bawang", en: "Shallot", ko: "샬롯" },
};

export function namaKomoditas(bahasa: Bahasa, komoditas: JenisKomoditas): string {
  return pilihTeks(bahasa, NAMA_KOMODITAS[komoditas]);
}

/** Kadar pestisida memuat kata Indonesia seperti "sampai" dan "sesuai label" */
export function terjemahKadar(bahasa: Bahasa, kadar: string): string {
  if (bahasa === "id") return kadar;
  const ganti: Array<[RegExp, Teks3]> = [
    [/sesuai label/g, { id: "sesuai label", en: "as per label", ko: "라벨 기준" }],
    [/ sampai /g, { id: " sampai ", en: " to ", ko: "~" }],
    [/aplikasi/g, { id: "aplikasi", en: "application", ko: "살포량" }],
    [/atau/g, { id: "atau", en: "or", ko: "또는" }],
    [/SC lain/g, { id: "SC lain", en: "other SC", ko: "기타 SC" }],
  ];
  return ganti.reduce((teks, [pola, t]) => teks.replace(pola, pilihTeks(bahasa, t)), kadar).replace(/(\d),(\d)/g, "$1.$2");
}

export function formatAngka(bahasa: Bahasa, nilai: number, digit = 0): string {
  return new Intl.NumberFormat(LOCALE_PER_BAHASA[bahasa], { maximumFractionDigits: digit, minimumFractionDigits: digit }).format(nilai);
}

export function formatTanggal(bahasa: Bahasa, iso: string, opsi: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string {
  return new Intl.DateTimeFormat(LOCALE_PER_BAHASA[bahasa], { timeZone: "Asia/Jakarta", ...opsi }).format(new Date(iso));
}
