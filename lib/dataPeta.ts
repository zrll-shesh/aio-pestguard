/**
 * lib/dataPeta.ts
 *
 * Koordinat lahan dan titik perangkap untuk peta sebaran di Beranda.
 * DATA CONTOH: lokasi diletakkan di Kabupaten Brebes, Jawa Tengah (sentra bawang merah
 * dan padi) supaya peta terlihat realistis. Saat backend asli siap, koordinat diambil dari
 * GPS perangkap dan jumlah per perangkap dari hasil POST /detect per sesi.
 */

import type { RingkasanLahan, TingkatRisikoLahan } from "./types";

export interface TitikPerangkap {
  idPerangkap: string;
  idLahan: string;
  label: string;
  lat: number;
  lng: number;
  /** Bagian dari total deteksi lahan hari ini (jumlah semua perangkap = totalDeteksiHariIni) */
  jumlahHariIni: number;
}

export interface LahanDiPeta {
  idLahan: string;
  pusat: [number, number];
  radiusMeter: number;
}

export const DAFTAR_LAHAN_DI_PETA: LahanDiPeta[] = [
  { idLahan: "lahan-a", pusat: [109.0015, -6.9055], radiusMeter: 860 },
  { idLahan: "lahan-b", pusat: [108.9845, -6.9685], radiusMeter: 520 },
  { idLahan: "lahan-c", pusat: [108.9545, -6.8765], radiusMeter: 540 },
];

export const DAFTAR_PERANGKAP: TitikPerangkap[] = [
  { idPerangkap: "A-1", idLahan: "lahan-a", label: "A-1", lat: -6.901, lng: 108.9965, jumlahHariIni: 7 },
  { idPerangkap: "A-2", idLahan: "lahan-a", label: "A-2", lat: -6.9055, lng: 109.003, jumlahHariIni: 5 },
  { idPerangkap: "A-3", idLahan: "lahan-a", label: "A-3", lat: -6.9095, lng: 108.998, jumlahHariIni: 4 },
  { idPerangkap: "A-4", idLahan: "lahan-a", label: "A-4", lat: -6.903, lng: 109.0075, jumlahHariIni: 2 },
  { idPerangkap: "B-1", idLahan: "lahan-b", label: "B-1", lat: -6.9655, lng: 108.9825, jumlahHariIni: 3 },
  { idPerangkap: "B-2", idLahan: "lahan-b", label: "B-2", lat: -6.969, lng: 108.988, jumlahHariIni: 3 },
  { idPerangkap: "B-3", idLahan: "lahan-b", label: "B-3", lat: -6.9715, lng: 108.983, jumlahHariIni: 1 },
  { idPerangkap: "C-1", idLahan: "lahan-c", label: "C-1", lat: -6.8735, lng: 108.952, jumlahHariIni: 1 },
  { idPerangkap: "C-2", idLahan: "lahan-c", label: "C-2", lat: -6.877, lng: 108.9575, jumlahHariIni: 1 },
  { idPerangkap: "C-3", idLahan: "lahan-c", label: "C-3", lat: -6.879, lng: 108.953, jumlahHariIni: 0 },
];

const TURUN_SATU_TINGKAT: Record<TingkatRisikoLahan, TingkatRisikoLahan> = { tinggi: "sedang", sedang: "rendah", rendah: "rendah" };

/**
 * Status perangkap mengikuti status lahannya. Perangkap yang tangkapannya di bawah
 * rata-rata perangkap lain di lahan yang sama diturunkan satu tingkat, supaya titik
 * paling padat langsung terlihat sebagai pusat serangan.
 */
export function tentukanStatusPerangkap(perangkap: TitikPerangkap, ringkasanLahan: RingkasanLahan): TingkatRisikoLahan {
  if (perangkap.jumlahHariIni === 0) return "rendah";
  const perangkapSeLahan = DAFTAR_PERANGKAP.filter((p) => p.idLahan === perangkap.idLahan);
  const rataRata = perangkapSeLahan.reduce((j, p) => j + p.jumlahHariIni, 0) / Math.max(1, perangkapSeLahan.length);
  return perangkap.jumlahHariIni >= rataRata ? ringkasanLahan.tingkatRisiko : TURUN_SATU_TINGKAT[ringkasanLahan.tingkatRisiko];
}
