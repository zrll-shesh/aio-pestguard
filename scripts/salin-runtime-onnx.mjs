/**
 * scripts/salin-runtime-onnx.mjs
 *
 * Dijalankan otomatis setelah `npm install` (postinstall), termasuk saat build di Vercel.
 * Menyalin ONNX Runtime Web dari node_modules ke public/ort supaya model bisa dijalankan
 * di browser tanpa bergantung pada CDN pihak ketiga. Folder public/ort tidak perlu
 * di-commit (sudah ada di .gitignore) karena selalu dibuat ulang dari node_modules.
 *
 * Bila skrip ini gagal atau dilewati, halaman Uji Deteksi otomatis memakai CDN jsDelivr
 * sebagai cadangan.
 */

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const akarProyek = join(dirname(fileURLToPath(import.meta.url)), "..");
const folderSumber = join(akarProyek, "node_modules", "onnxruntime-web", "dist");
const folderTujuan = join(akarProyek, "public", "ort");

// ort.min.js memuat backend wasm dan webgpu, keduanya memakai berkas jsep di bawah ini
const daftarBerkas = ["ort.min.js", "ort-wasm-simd-threaded.jsep.mjs", "ort-wasm-simd-threaded.jsep.wasm"];

if (!existsSync(folderSumber)) {
  console.warn("[aio-pestguard] onnxruntime-web belum terpasang, salin runtime dilewati (CDN akan dipakai).");
  process.exit(0);
}

mkdirSync(folderTujuan, { recursive: true });
let jumlahDisalin = 0;
for (const namaBerkas of daftarBerkas) {
  const sumber = join(folderSumber, namaBerkas);
  if (!existsSync(sumber)) {
    console.warn(`[aio-pestguard] ${namaBerkas} tidak ditemukan di onnxruntime-web/dist, dilewati.`);
    continue;
  }
  copyFileSync(sumber, join(folderTujuan, namaBerkas));
  jumlahDisalin += 1;
}
console.log(`[aio-pestguard] ONNX Runtime Web disalin ke public/ort (${jumlahDisalin} berkas).`);
