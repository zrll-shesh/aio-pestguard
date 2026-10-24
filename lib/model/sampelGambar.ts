/**
 * lib/model/sampelGambar.ts  (HANYA SERVER, memakai fs)
 *
 * Membaca isi folder public/sample-images saat build (atau setiap request saat npm run dev).
 * Cukup taruh gambar .jpg, .jpeg, .png, atau .webp di folder itu, tidak perlu mendaftarkan
 * di kode. Label asli dibaca otomatis dari nama file IP102 (contoh IP014000480.jpg),
 * atau dari public/sample-images/keterangan.json bila nama file bebas.
 *
 * Format keterangan.json (semua kolom opsional):
 * {
 *   "kutu-daun-contoh.jpg": { "judul": "Kutu daun pada daun jagung", "labelAsli": "aphids", "sumber": "UC IPM" }
 * }
 * "labelAsli" boleh nama Inggris IP102 atau nama Indonesia dari glosarium.
 */

import { promises as fs } from "fs";
import path from "path";
import { bacaLabelDariNamaFileIp102, cariKelasDariNama } from "./kelasHama";

export interface SampelGambar {
  namaBerkas: string;
  alamat: string;
  judul: string;
  sumber: string | null;
  classIdLabelAsli: number | null;
  asalLabel: "nama_file_ip102" | "keterangan" | null;
}

interface IsiKeterangan {
  judul?: string;
  labelAsli?: string;
  sumber?: string;
}

const FOLDER_SAMPEL = path.join(process.cwd(), "public", "sample-images");
const EKSTENSI_GAMBAR = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function rapikanJudul(namaBerkas: string): string {
  const tanpaEkstensi = namaBerkas.replace(/\.[^.]+$/, "");
  return tanpaEkstensi.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

export async function bacaDaftarSampelGambar(): Promise<SampelGambar[]> {
  let daftarBerkas: string[] = [];
  try {
    daftarBerkas = await fs.readdir(FOLDER_SAMPEL);
  } catch {
    return [];
  }

  let keterangan: Record<string, IsiKeterangan> = {};
  try {
    keterangan = JSON.parse(await fs.readFile(path.join(FOLDER_SAMPEL, "keterangan.json"), "utf8"));
  } catch {
    keterangan = {};
  }

  return daftarBerkas
    .filter((nama) => EKSTENSI_GAMBAR.has(path.extname(nama).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "id"))
    .map((namaBerkas) => {
      const info = keterangan[namaBerkas] ?? {};
      const kelasDariKeterangan = info.labelAsli ? cariKelasDariNama(info.labelAsli) : null;
      const kelasDariNamaFile = bacaLabelDariNamaFileIp102(namaBerkas);
      const kelas = kelasDariKeterangan ?? kelasDariNamaFile;
      return {
        namaBerkas,
        alamat: `/sample-images/${encodeURIComponent(namaBerkas)}`,
        judul: info.judul ?? (kelas ? `${kelas.namaIndonesia}` : rapikanJudul(namaBerkas)),
        sumber: info.sumber ?? (kelasDariNamaFile ? "Data uji IP102" : null),
        classIdLabelAsli: kelas?.classId ?? null,
        asalLabel: kelasDariKeterangan ? "keterangan" : kelasDariNamaFile ? "nama_file_ip102" : null,
      };
    });
}
