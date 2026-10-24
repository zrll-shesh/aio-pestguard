/**
 * lib/model/pascaproses.ts
 *
 * Fungsi murni untuk mengolah keluaran mentah model YOLO (ekspor ONNX Ultralytics)
 * menjadi daftar deteksi. Tidak menyentuh DOM atau jaringan, sehingga bisa diuji
 * di Node dan dipindahkan ke backend bila perlu.
 *
 * Bentuk keluaran ekspor notebook: [1, 28, 8400]
 *   28   = 4 koordinat kotak (cx, cy, w, h dalam piksel kanvas 640) + 24 skor kelas
 *   8400 = jumlah titik jangkar dari tiga skala (80x80 + 40x40 + 20x20)
 *
 * Langkahnya meniru Ultralytics (ops.non_max_suppression + scale_boxes):
 *   1. ambil skor kelas tertinggi tiap jangkar, buang yang di bawah ambang minimum
 *   2. NMS per kelas dengan IoU 0,7
 *   3. kembalikan koordinat dari kanvas letterbox 640 ke ukuran gambar asli
 */

export interface InfoLetterbox {
  ukuranMasukan: number;
  lebarAsli: number;
  tinggiAsli: number;
  skala: number;
  lebarTerskala: number;
  tinggiTerskala: number;
  padKiri: number;
  padAtas: number;
}

/** Sama dengan LetterBox Ultralytics (auto=False, scaleup=True, center=True) */
export function hitungLetterbox(lebarAsli: number, tinggiAsli: number, ukuranMasukan: number): InfoLetterbox {
  const skala = Math.min(ukuranMasukan / tinggiAsli, ukuranMasukan / lebarAsli);
  const lebarTerskala = Math.round(lebarAsli * skala);
  const tinggiTerskala = Math.round(tinggiAsli * skala);
  const sisaLebar = (ukuranMasukan - lebarTerskala) / 2;
  const sisaTinggi = (ukuranMasukan - tinggiTerskala) / 2;
  return {
    ukuranMasukan,
    lebarAsli,
    tinggiAsli,
    skala,
    lebarTerskala,
    tinggiTerskala,
    padKiri: Math.round(sisaLebar - 0.1),
    padAtas: Math.round(sisaTinggi - 0.1),
  };
}

export interface SkorKelas {
  classId: number;
  skor: number;
}

export interface DeteksiMentah {
  classId: number;
  skor: number;
  /** x1, y1, x2, y2 dalam piksel gambar asli */
  kotak: [number, number, number, number];
  /** Tiga kelas dengan skor tertinggi pada jangkar yang sama, untuk melihat kelas alternatif */
  tigaKelasTeratas: SkorKelas[];
}

interface Kandidat {
  classId: number;
  skor: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tigaKelasTeratas: SkorKelas[];
}

export interface OpsiPascaproses {
  ambangKeyakinan: number;
  ambangIou: number;
  maksDeteksi: number;
  maksKandidatNms?: number;
}

function hitungIou(a: Kandidat, b: Kandidat): number {
  const lebarIrisan = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1));
  const tinggiIrisan = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
  const luasIrisan = lebarIrisan * tinggiIrisan;
  const luasA = Math.max(0, a.x2 - a.x1) * Math.max(0, a.y2 - a.y1);
  const luasB = Math.max(0, b.x2 - b.x1) * Math.max(0, b.y2 - b.y1);
  const luasGabungan = luasA + luasB - luasIrisan;
  return luasGabungan > 0 ? luasIrisan / luasGabungan : 0;
}

/**
 * Mengubah tensor keluaran mentah menjadi deteksi pada koordinat gambar asli.
 * Mendukung dua tata letak: [1, 4+nc, N] (bawaan Ultralytics) dan [1, N, 4+nc].
 */
export function uraikanKeluaranYolo(
  dataKeluaran: Float32Array,
  dimensiKeluaran: readonly number[],
  infoLetterbox: InfoLetterbox,
  opsi: OpsiPascaproses
): DeteksiMentah[] {
  if (dimensiKeluaran.length !== 3) {
    throw new Error(`Bentuk keluaran model tidak dikenali: [${dimensiKeluaran.join(", ")}]. Diharapkan [1, 4+jumlah_kelas, jumlah_jangkar].`);
  }
  const kanalDiDepan = dimensiKeluaran[1] < dimensiKeluaran[2];
  const jumlahKanal = kanalDiDepan ? dimensiKeluaran[1] : dimensiKeluaran[2];
  const jumlahJangkar = kanalDiDepan ? dimensiKeluaran[2] : dimensiKeluaran[1];
  const jumlahKelas = jumlahKanal - 4;
  if (jumlahKelas < 1) throw new Error("Keluaran model tidak memuat skor kelas.");

  const ambil = kanalDiDepan
    ? (kanal: number, jangkar: number) => dataKeluaran[kanal * jumlahJangkar + jangkar]
    : (kanal: number, jangkar: number) => dataKeluaran[jangkar * jumlahKanal + kanal];

  const daftarKandidat: Kandidat[] = [];
  for (let jangkar = 0; jangkar < jumlahJangkar; jangkar++) {
    // Tiga skor kelas tertinggi, cukup dengan satu kali lintasan
    let s1 = -1, c1 = -1, s2 = -1, c2 = -1, s3 = -1, c3 = -1;
    for (let kelas = 0; kelas < jumlahKelas; kelas++) {
      const skor = ambil(4 + kelas, jangkar);
      if (skor > s1) {
        s3 = s2; c3 = c2; s2 = s1; c2 = c1; s1 = skor; c1 = kelas;
      } else if (skor > s2) {
        s3 = s2; c3 = c2; s2 = skor; c2 = kelas;
      } else if (skor > s3) {
        s3 = skor; c3 = kelas;
      }
    }
    if (s1 < opsi.ambangKeyakinan) continue;

    const cx = ambil(0, jangkar);
    const cy = ambil(1, jangkar);
    const w = ambil(2, jangkar);
    const h = ambil(3, jangkar);
    const tigaKelasTeratas: SkorKelas[] = [{ classId: c1, skor: s1 }];
    if (c2 >= 0) tigaKelasTeratas.push({ classId: c2, skor: s2 });
    if (c3 >= 0) tigaKelasTeratas.push({ classId: c3, skor: s3 });
    daftarKandidat.push({ classId: c1, skor: s1, x1: cx - w / 2, y1: cy - h / 2, x2: cx + w / 2, y2: cy + h / 2, tigaKelasTeratas });
  }

  daftarKandidat.sort((a, b) => b.skor - a.skor);
  const kandidatTerbatas = daftarKandidat.slice(0, opsi.maksKandidatNms ?? 30000);

  // NMS per kelas (setara dengan offset kelas pada Ultralytics, agnostic=False)
  const terpilih: Kandidat[] = [];
  const sudahDibuang = new Uint8Array(kandidatTerbatas.length);
  for (let i = 0; i < kandidatTerbatas.length; i++) {
    if (sudahDibuang[i]) continue;
    const utama = kandidatTerbatas[i];
    terpilih.push(utama);
    if (terpilih.length >= opsi.maksDeteksi) break;
    for (let j = i + 1; j < kandidatTerbatas.length; j++) {
      if (sudahDibuang[j]) continue;
      const pembanding = kandidatTerbatas[j];
      if (pembanding.classId === utama.classId && hitungIou(utama, pembanding) > opsi.ambangIou) {
        sudahDibuang[j] = 1;
      }
    }
  }

  const { skala, padKiri, padAtas, lebarAsli, tinggiAsli } = infoLetterbox;
  const jepit = (nilai: number, batas: number) => Math.min(Math.max(nilai, 0), batas);
  return terpilih.map((kandidat) => ({
    classId: kandidat.classId,
    skor: kandidat.skor,
    kotak: [
      jepit((kandidat.x1 - padKiri) / skala, lebarAsli),
      jepit((kandidat.y1 - padAtas) / skala, tinggiAsli),
      jepit((kandidat.x2 - padKiri) / skala, lebarAsli),
      jepit((kandidat.y2 - padAtas) / skala, tinggiAsli),
    ],
    tigaKelasTeratas: kandidat.tigaKelasTeratas,
  }));
}

/**
 * Karena NMS hanya menekan kotak oleh kotak lain yang skornya LEBIH TINGGI, menjalankan
 * NMS sekali pada ambang rendah lalu menyaring dengan ambang yang lebih tinggi memberi
 * hasil yang identik dengan menjalankan ulang model pada ambang tersebut. Inilah yang
 * membuat penggeser ambang di layar bisa bekerja seketika tanpa inferensi ulang.
 */
export function saringBerdasarkanAmbang(daftarDeteksi: DeteksiMentah[], ambangKeyakinan: number): DeteksiMentah[] {
  return daftarDeteksi.filter((deteksi) => deteksi.skor >= ambangKeyakinan);
}

export function hitungIouKotak(a: [number, number, number, number], b: [number, number, number, number]): number {
  return hitungIou(
    { classId: 0, skor: 0, x1: a[0], y1: a[1], x2: a[2], y2: a[3], tigaKelasTeratas: [] },
    { classId: 0, skor: 0, x1: b[0], y1: b[1], x2: b[2], y2: b[3], tigaKelasTeratas: [] }
  );
}
