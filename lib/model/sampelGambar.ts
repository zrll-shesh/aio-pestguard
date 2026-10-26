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
 *   "kutu-daun-contoh.jpg": { "judul": "Kutu daun", "judul_en": "Aphids", "judul_ko": "진딧물", "labelAsli": "aphids", "sumber": "UC IPM" }
 * }
 * "labelAsli" boleh nama Inggris IP102 atau nama Indonesia dari glosarium.
 */

import { promises as fs } from "fs";
import path from "path";
import { bacaLabelDariNamaFileIp102, cariKelasDariNama } from "./kelasHama";
import { terjemahKonten, type Teks3 } from "@/lib/i18n/bahasa";

export interface SampelGambar {
  namaBerkas: string;
  alamat: string;
  judul: Teks3;
  sumber: Teks3 | null;
  classIdLabelAsli: number | null;
  asalLabel: "nama_file_ip102" | "keterangan" | null;
}

interface IsiKeterangan {
  judul?: string;
  judul_en?: string;
  judul_ko?: string;
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
        judul: info.judul
          ? { id: info.judul, en: info.judul_en ?? info.judul, ko: info.judul_ko ?? info.judul }
          : kelas
            ? { id: kelas.namaIndonesia, en: terjemahKonten("en", kelas.namaIndonesia), ko: terjemahKonten("ko", kelas.namaIndonesia) }
            : { id: rapikanJudul(namaBerkas), en: rapikanJudul(namaBerkas), ko: rapikanJudul(namaBerkas) },
        sumber: info.sumber
          ? { id: info.sumber, en: info.sumber, ko: info.sumber }
          : kelasDariNamaFile
            ? { id: "Data uji IP102", en: "IP102 test data", ko: "IP102 시험 데이터" }
            : null,
        classIdLabelAsli: kelas?.classId ?? null,
        asalLabel: kelasDariKeterangan ? "keterangan" : kelasDariNamaFile ? "nama_file_ip102" : null,
      };
    });
}
