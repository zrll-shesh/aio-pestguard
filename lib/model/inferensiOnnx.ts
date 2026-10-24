/**
 * lib/model/inferensiOnnx.ts
 *
 * Menjalankan model ONNX LANGSUNG DI BROWSER memakai ONNX Runtime Web.
 * Tidak ada server inferensi, sehingga cocok untuk deploy statis di Vercel.
 *
 * Alur:
 *   muatRuntimeOrt()      -> memuat ort.min.js (dari /ort/, disalin otomatis saat npm install)
 *   unduhBerkasModel()    -> mengunduh .onnx dengan progres, lalu disimpan di Cache Storage
 *   siapkanSesiModel()    -> membuat InferenceSession (disimpan di memori per model + mesin)
 *   jalankanDeteksi()     -> praproses letterbox 640, inferensi, pascaproses (NMS)
 *
 * Hanya boleh dipanggil dari komponen client ("use client").
 */

import {
  AMBANG_IOU_NMS,
  AMBANG_KANDIDAT_MINIMUM,
  MAKS_DETEKSI,
  UKURAN_MASUKAN_MODEL,
  VERSI_CACHE_MODEL,
  susunUrlModel,
  type KonfigurasiModel,
} from "./konfigurasiModel";
import { hitungLetterbox, uraikanKeluaranYolo, type DeteksiMentah, type InfoLetterbox } from "./pascaproses";

/* eslint-disable @typescript-eslint/no-explicit-any */
type ModulOrt = any;

declare global {
  interface Window {
    ort?: ModulOrt;
  }
}

export type MesinInferensi = "wasm" | "webgpu";

const VERSI_ORT = "1.30.0";
const ALAMAT_ORT_LOKAL = "/ort/";
const ALAMAT_ORT_CDN = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${VERSI_ORT}/dist/`;
const NAMA_CACHE_MODEL = `aio-pestguard-model-${VERSI_CACHE_MODEL}`;

let janjiRuntime: Promise<{ ort: ModulOrt; sumber: "lokal" | "cdn" }> | null = null;
const peta_sesi = new Map<string, Promise<ModulOrt>>();

function muatSkrip(alamat: string): Promise<void> {
  return new Promise((selesai, gagal) => {
    const elemen = document.createElement("script");
    elemen.src = alamat;
    elemen.async = true;
    elemen.crossOrigin = "anonymous";
    elemen.onload = () => selesai();
    elemen.onerror = () => {
      elemen.remove();
      gagal(new Error(`Gagal memuat ${alamat}`));
    };
    document.head.appendChild(elemen);
  });
}

/** Memuat ONNX Runtime Web sekali saja. Mencoba salinan lokal dulu, lalu CDN sebagai cadangan. */
export function muatRuntimeOrt(): Promise<{ ort: ModulOrt; sumber: "lokal" | "cdn" }> {
  if (janjiRuntime) return janjiRuntime;
  janjiRuntime = (async () => {
    let sumber: "lokal" | "cdn" = "lokal";
    let alamatDasar = `${window.location.origin}${ALAMAT_ORT_LOKAL}`;
    if (!window.ort) {
      try {
        await muatSkrip(`${alamatDasar}ort.min.js`);
      } catch {
        sumber = "cdn";
        alamatDasar = ALAMAT_ORT_CDN;
        await muatSkrip(`${alamatDasar}ort.min.js`);
      }
    }
    const ort = window.ort;
    if (!ort) throw new Error("ONNX Runtime Web tidak tersedia setelah dimuat.");
    ort.env.wasm.wasmPaths = alamatDasar;
    // Multi-thread hanya aktif bila halaman cross-origin isolated (header diatur di next.config.mjs)
    const jumlahInti = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 2 : 2;
    ort.env.wasm.numThreads = window.crossOriginIsolated ? Math.min(4, Math.max(1, jumlahInti - 1)) : 1;
    ort.env.logLevel = "error";
    return { ort, sumber };
  })();
  janjiRuntime.catch(() => {
    janjiRuntime = null;
  });
  return janjiRuntime;
}

export function apakahWebGpuTersedia(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export function infoLingkunganRuntime() {
  if (typeof window === "undefined") return { multiThread: false, jumlahThread: 1 };
  const multiThread = window.crossOriginIsolated === true;
  return { multiThread, jumlahThread: multiThread ? Math.min(4, Math.max(1, (navigator.hardwareConcurrency || 2) - 1)) : 1 };
}

// ---------------------------------------------------------------------------
// Ketersediaan dan unduhan berkas model
// ---------------------------------------------------------------------------

export interface StatusBerkasModel {
  tersedia: boolean;
  sudahDiCache: boolean;
  ukuranByte: number | null;
  pesan: string | null;
}

export async function periksaBerkasModel(model: KonfigurasiModel): Promise<StatusBerkasModel> {
  const alamat = susunUrlModel(model);
  let sudahDiCache = false;
  try {
    if ("caches" in window) {
      const cache = await caches.open(NAMA_CACHE_MODEL);
      sudahDiCache = Boolean(await cache.match(alamat));
    }
  } catch {
    sudahDiCache = false;
  }
  try {
    const respons = await fetch(alamat, { method: "HEAD", cache: "no-store" });
    const jenisIsi = respons.headers.get("content-type") ?? "";
    if (!respons.ok || jenisIsi.includes("text/html")) {
      return {
        tersedia: sudahDiCache,
        sudahDiCache,
        ukuranByte: null,
        pesan: sudahDiCache ? null : `Berkas ${model.namaBerkas} belum ada di public/models.`,
      };
    }
    const panjang = Number(respons.headers.get("content-length"));
    return { tersedia: true, sudahDiCache, ukuranByte: Number.isFinite(panjang) && panjang > 0 ? panjang : null, pesan: null };
  } catch {
    return { tersedia: sudahDiCache, sudahDiCache, ukuranByte: null, pesan: sudahDiCache ? null : "Tidak bisa memeriksa berkas model." };
  }
}

function buatTandaBerkas(header: Headers): string | null {
  // ETag lebih andal; panjang berkas dipakai bila server tidak mengirim ETag
  const etag = header.get("etag");
  if (etag) return `etag:${etag.replace(/^W\//, "")}`;
  const panjang = header.get("content-length");
  return panjang ? `panjang:${panjang}` : null;
}

async function ambilTandaBerkasServer(alamat: string): Promise<string | null> {
  try {
    const respons = await fetch(alamat, { method: "HEAD", cache: "no-store" });
    if (!respons.ok) return null;
    return buatTandaBerkas(respons.headers);
  } catch {
    return null;
  }
}

function periksaIsiBukanPointerLfs(buffer: ArrayBuffer, namaBerkas: string) {
  if (buffer.byteLength > 2048) return;
  const teks = new TextDecoder().decode(buffer.slice(0, 200));
  if (teks.startsWith("version https://git-lfs")) {
    throw new Error(
      `${namaBerkas} masih berupa pointer Git LFS, bukan model asli. Aktifkan "Git LFS" di pengaturan proyek Vercel, atau simpan model tanpa LFS (setiap berkas di bawah 100 MB).`
    );
  }
  throw new Error(`${namaBerkas} terlalu kecil (${buffer.byteLength} byte) untuk sebuah model ONNX. Periksa kembali berkasnya.`);
}

export async function unduhBerkasModel(
  model: KonfigurasiModel,
  saatProgres: (byteDiterima: number, byteTotal: number | null) => void
): Promise<{ buffer: ArrayBuffer; dariCache: boolean }> {
  const alamat = susunUrlModel(model);
  let cache: Cache | null = null;
  try {
    if ("caches" in window) cache = await caches.open(NAMA_CACHE_MODEL);
  } catch {
    cache = null;
  }

  if (cache) {
    const tersimpan = await cache.match(alamat);
    if (tersimpan) {
      // Bila berkas di server sudah diganti (ETag atau ukuran berbeda), cache lama dibuang
      const tandaTersimpan = tersimpan.headers.get("x-tanda-berkas");
      const tandaServer = await ambilTandaBerkasServer(alamat);
      if (!tandaServer || !tandaTersimpan || tandaServer === tandaTersimpan) {
        const buffer = await tersimpan.arrayBuffer();
        saatProgres(buffer.byteLength, buffer.byteLength);
        return { buffer, dariCache: true };
      }
      await cache.delete(alamat);
    }
  }

  const respons = await fetch(alamat);
  const jenisIsi = respons.headers.get("content-type") ?? "";
  if (!respons.ok || jenisIsi.includes("text/html")) {
    throw new Error(
      respons.status === 404 || jenisIsi.includes("text/html")
        ? `Berkas ${model.namaBerkas} tidak ditemukan. Salin model ke folder public/models/ lalu jalankan ulang.`
        : `Gagal mengunduh ${model.namaBerkas} (status ${respons.status}).`
    );
  }

  const byteTotal = Number(respons.headers.get("content-length")) || null;
  let buffer: ArrayBuffer;
  if (respons.body && "getReader" in respons.body) {
    const pembaca = respons.body.getReader();
    const potongan: Uint8Array[] = [];
    let byteDiterima = 0;
    for (;;) {
      const { done, value } = await pembaca.read();
      if (done) break;
      if (value) {
        potongan.push(value);
        byteDiterima += value.byteLength;
        saatProgres(byteDiterima, byteTotal);
      }
    }
    const gabungan = new Uint8Array(byteDiterima);
    let posisi = 0;
    for (const bagian of potongan) {
      gabungan.set(bagian, posisi);
      posisi += bagian.byteLength;
    }
    buffer = gabungan.buffer;
  } else {
    buffer = await respons.arrayBuffer();
    saatProgres(buffer.byteLength, buffer.byteLength);
  }

  if (buffer.byteLength < 1_000_000) periksaIsiBukanPointerLfs(buffer, model.namaBerkas);

  if (cache) {
    try {
      const tanda = buatTandaBerkas(respons.headers) ?? "";
      await cache.put(
        alamat,
        new Response(buffer.slice(0), { headers: { "content-type": "application/octet-stream", "x-tanda-berkas": tanda } })
      );
    } catch {
      // Kuota penyimpanan penuh atau mode privat: abaikan, model tetap bisa dipakai
    }
  }
  return { buffer, dariCache: false };
}

export async function hapusCacheModel(): Promise<void> {
  peta_sesi.clear();
  if ("caches" in window) await caches.delete(NAMA_CACHE_MODEL);
}

// ---------------------------------------------------------------------------
// Sesi inferensi
// ---------------------------------------------------------------------------

export interface InfoSesi {
  sesi: ModulOrt;
  mesinTerpakai: MesinInferensi;
  namaInput: string;
  namaOutput: string;
}

export async function siapkanSesiModel(
  model: KonfigurasiModel,
  mesin: MesinInferensi,
  saatProgresUnduh: (byteDiterima: number, byteTotal: number | null) => void,
  saatTahap: (tahap: "runtime" | "unduh" | "sesi") => void
): Promise<InfoSesi & { dariCache: boolean }> {
  saatTahap("runtime");
  const { ort } = await muatRuntimeOrt();

  const kunci = `${model.idModel}:${mesin}`;
  let dariCache = true;
  if (!peta_sesi.has(kunci)) {
    saatTahap("unduh");
    const { buffer, dariCache: dariCacheBrowser } = await unduhBerkasModel(model, saatProgresUnduh);
    dariCache = dariCacheBrowser;
    saatTahap("sesi");
    const janjiSesi = (async () => {
      const penyedia = mesin === "webgpu" ? ["webgpu", "wasm"] : ["wasm"];
      return ort.InferenceSession.create(new Uint8Array(buffer), {
        executionProviders: penyedia,
        graphOptimizationLevel: "all",
      });
    })();
    peta_sesi.set(kunci, janjiSesi);
    janjiSesi.catch(() => peta_sesi.delete(kunci));
  } else {
    saatProgresUnduh(1, 1);
  }
  const sesi = await peta_sesi.get(kunci)!;
  return { sesi, mesinTerpakai: mesin, namaInput: sesi.inputNames[0], namaOutput: sesi.outputNames[0], dariCache };
}

export function lepaskanSesiLain(idModelDipertahankan: string) {
  for (const kunci of Array.from(peta_sesi.keys())) {
    if (!kunci.startsWith(`${idModelDipertahankan}:`)) {
      const janji = peta_sesi.get(kunci);
      peta_sesi.delete(kunci);
      janji?.then((sesi: ModulOrt) => sesi?.release?.()).catch(() => undefined);
    }
  }
}

// ---------------------------------------------------------------------------
// Praproses dan inferensi
// ---------------------------------------------------------------------------

export async function muatGambar(alamat: string): Promise<HTMLImageElement> {
  return new Promise((selesai, gagal) => {
    const gambar = new Image();
    gambar.decoding = "async";
    gambar.onload = () => selesai(gambar);
    gambar.onerror = () => gagal(new Error(`Gambar ${alamat} gagal dimuat.`));
    gambar.src = alamat;
  });
}

/** Letterbox ke 640x640 dengan latar abu 114, lalu ubah ke tensor float32 RGB 0..1 format NCHW */
export function praprosesGambar(gambar: HTMLImageElement, ukuranMasukan = UKURAN_MASUKAN_MODEL) {
  const lebarAsli = gambar.naturalWidth;
  const tinggiAsli = gambar.naturalHeight;
  const infoLetterbox = hitungLetterbox(lebarAsli, tinggiAsli, ukuranMasukan);

  const kanvas = document.createElement("canvas");
  kanvas.width = ukuranMasukan;
  kanvas.height = ukuranMasukan;
  const konteks = kanvas.getContext("2d", { willReadFrequently: true });
  if (!konteks) throw new Error("Browser tidak mendukung canvas 2D.");
  konteks.fillStyle = "rgb(114,114,114)";
  konteks.fillRect(0, 0, ukuranMasukan, ukuranMasukan);
  konteks.imageSmoothingEnabled = true;
  konteks.imageSmoothingQuality = "high";
  konteks.drawImage(gambar, infoLetterbox.padKiri, infoLetterbox.padAtas, infoLetterbox.lebarTerskala, infoLetterbox.tinggiTerskala);

  const { data: piksel } = konteks.getImageData(0, 0, ukuranMasukan, ukuranMasukan);
  const luas = ukuranMasukan * ukuranMasukan;
  const tensorData = new Float32Array(3 * luas);
  for (let i = 0; i < luas; i++) {
    tensorData[i] = piksel[i * 4] / 255;
    tensorData[luas + i] = piksel[i * 4 + 1] / 255;
    tensorData[2 * luas + i] = piksel[i * 4 + 2] / 255;
  }
  return { tensorData, infoLetterbox };
}

export interface HasilInferensi {
  deteksiMentah: DeteksiMentah[];
  infoLetterbox: InfoLetterbox;
  waktu: { praprosesMs: number; inferensiMs: number; pascaprosesMs: number };
  bentukKeluaran: number[];
  jumlahKelasModel: number;
}

export async function jalankanDeteksi(infoSesi: InfoSesi, gambar: HTMLImageElement): Promise<HasilInferensi> {
  const { ort } = await muatRuntimeOrt();

  const t0 = performance.now();
  const { tensorData, infoLetterbox } = praprosesGambar(gambar);
  const tensorMasukan = new ort.Tensor("float32", tensorData, [1, 3, UKURAN_MASUKAN_MODEL, UKURAN_MASUKAN_MODEL]);
  const t1 = performance.now();

  const hasil = await infoSesi.sesi.run({ [infoSesi.namaInput]: tensorMasukan });
  const tensorKeluaran = hasil[infoSesi.namaOutput];
  const t2 = performance.now();

  const dataKeluaran = tensorKeluaran.data as Float32Array;
  const bentukKeluaran = Array.from(tensorKeluaran.dims as number[]);
  const deteksiMentah = uraikanKeluaranYolo(dataKeluaran, bentukKeluaran, infoLetterbox, {
    ambangKeyakinan: AMBANG_KANDIDAT_MINIMUM,
    ambangIou: AMBANG_IOU_NMS,
    maksDeteksi: MAKS_DETEKSI,
  });
  const t3 = performance.now();

  tensorKeluaran.dispose?.();
  tensorMasukan.dispose?.();

  const kanalDiDepan = bentukKeluaran[1] < bentukKeluaran[2];
  return {
    deteksiMentah,
    infoLetterbox,
    waktu: { praprosesMs: t1 - t0, inferensiMs: t2 - t1, pascaprosesMs: t3 - t2 },
    bentukKeluaran,
    jumlahKelasModel: (kanalDiDepan ? bentukKeluaran[1] : bentukKeluaran[2]) - 4,
  };
}
