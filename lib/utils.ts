/**
 * lib/utils.ts
 * Fungsi bantu kecil yang dipakai di banyak komponen. Tidak ada logika bisnis di sini.
 */

import clsx, { type ClassValue } from "clsx";

/** Menggabungkan nama class Tailwind secara kondisional */
export function gabungkanNamaKelas(...daftarKelas: ClassValue[]): string {
  return clsx(daftarKelas);
}

/** Mengubah angka 0 sampai 1 menjadi teks persen bulat, contoh 0.8725 menjadi "87%" */
export function formatAngkaSebagaiPersen(nilaiDesimal: number): string {
  return `${Math.round(nilaiDesimal * 100)}%`;
}

/** Format tanggal dan jam bahasa Indonesia, contoh "19 Okt 2026, 06.30" */
export function formatTanggalDanJam(teksWaktuIso: string): string {
  const objekTanggal = new Date(teksWaktuIso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(objekTanggal);
}

/** Format tanggal saja, contoh "21 Okt 2026" */
export function formatTanggalSaja(teksWaktuIso: string): string {
  const objekTanggal = new Date(teksWaktuIso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(objekTanggal);
}

/** Menambahkan sejumlah hari ke sebuah tanggal ISO dan mengembalikan tanggal ISO baru */
export function tambahHariKeTanggal(teksWaktuIso: string, jumlahHari: number): string {
  const objekTanggal = new Date(teksWaktuIso);
  objekTanggal.setUTCDate(objekTanggal.getUTCDate() + jumlahHari);
  return objekTanggal.toISOString();
}

/** Mengunduh teks sebagai file di browser pengguna */
export function unduhTeksSebagaiFile(
  isiTeks: string,
  namaFile: string,
  jenisMime: string = "text/plain;charset=utf-8"
): void {
  const objekBlob = new Blob([isiTeks], { type: jenisMime });
  const alamatSementara = URL.createObjectURL(objekBlob);
  const elemenTautan = document.createElement("a");
  elemenTautan.href = alamatSementara;
  elemenTautan.download = namaFile;
  document.body.appendChild(elemenTautan);
  elemenTautan.click();
  document.body.removeChild(elemenTautan);
  URL.revokeObjectURL(alamatSementara);
}

/** Menyalin teks ke clipboard, mengembalikan true bila berhasil */
export async function salinTeksKeClipboard(isiTeks: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(isiTeks);
      return true;
    }
    const elemenAreaTeks = document.createElement("textarea");
    elemenAreaTeks.value = isiTeks;
    elemenAreaTeks.style.position = "fixed";
    elemenAreaTeks.style.opacity = "0";
    document.body.appendChild(elemenAreaTeks);
    elemenAreaTeks.select();
    const berhasilDisalin = document.execCommand("copy");
    document.body.removeChild(elemenAreaTeks);
    return berhasilDisalin;
  } catch {
    return false;
  }
}
