/**
 * lib/dataSource.ts
 *
 * TITIK SAMBUNG TUNGGAL antara antarmuka dan sumber data.
 *
 * Saat ini semua fungsi membaca data simulasi dari lib/mockData.ts.
 * Saat model dan API asli siap, ganti ISI fungsi-fungsi ini (bukan nama atau tipe
 * kembaliannya) agar memanggil endpoint FastAPI. Pemetaan yang disarankan:
 *
 *   ambilStatusKesehatanApi()   -> GET  /health
 *   ambilRingkasanSemuaLahan()  -> endpoint agregasi baru (rencana kerja nomor 3)
 *   ambilSesiPemantauan()       -> endpoint riwayat sesi baru (belum ada)
 *   kirimGambarUntukDeteksi()   -> POST /detect  (multipart, field "image")
 *
 * Komponen tidak boleh mengimpor mockData.ts langsung, cukup lewat file ini.
 */

import {
  DAFTAR_LAHAN_MENTAH,
  DAFTAR_SESI_PEMANTAUAN,
  STATUS_KESEHATAN_API_SIMULASI,
} from "./mockData";
import {
  buatSemuaRingkasanLahan,
  lengkapiDeteksiDenganStadium,
  normalisasiNamaHama,
  urutkanLahanBerdasarkanRisiko,
} from "./insightEngine";
import type { RingkasanLahan, SesiPemantauanLahan, StatusKesehatanApi } from "./types";

export function ambilStatusKesehatanApi(): StatusKesehatanApi {
  return STATUS_KESEHATAN_API_SIMULASI;
}

export function ambilRingkasanSemuaLahan(): RingkasanLahan[] {
  return urutkanLahanBerdasarkanRisiko(buatSemuaRingkasanLahan());
}

/** Semua sesi, sudah dilengkapi estimasi stadium, diurutkan dari yang terbaru */
export function ambilSesiPemantauan(): SesiPemantauanLahan[] {
  return [...DAFTAR_SESI_PEMANTAUAN]
    .map((sesi) => {
      const lahan = DAFTAR_LAHAN_MENTAH.find((l) => l.idLahan === sesi.idLahan);
      const kunciReferensiHama = lahan ? normalisasiNamaHama(lahan.namaHamaDominanInggris) : "";
      return { ...sesi, daftarDeteksi: lengkapiDeteksiDenganStadium(sesi.daftarDeteksi, kunciReferensiHama) };
    })
    .sort((a, b) => new Date(b.waktuPengambilan).getTime() - new Date(a.waktuPengambilan).getTime());
}

export function ambilSesiBerdasarkanId(idSesi: string): SesiPemantauanLahan | null {
  return ambilSesiPemantauan().find((sesi) => sesi.idSesi === idSesi) ?? null;
}

export function ambilRingkasanLahanBerdasarkanId(idLahan: string): RingkasanLahan | null {
  return ambilRingkasanSemuaLahan().find((ringkasan) => ringkasan.idLahan === idLahan) ?? null;
}
