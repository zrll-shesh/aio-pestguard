/**
 * lib/model/kelasHama.ts
 *
 * Daftar 24 kelas hama yang dikenali model, URUTANNYA SAMA PERSIS dengan indeks
 * keluaran model ONNX (data.yaml pada FINAL_OBJECT_DETECTION_AIGRA.ipynb, SUBSET_NAMES).
 * Jangan mengubah urutan array ini, karena class_id dari model langsung dipakai
 * sebagai indeks.
 *
 * Sumber:
 *   - Nama Inggris, ilmiah, Indonesia, komoditas: notebook bagian 2 dan 2.1 (glosarium).
 *   - idLamaIp102: SUBSET_OLD_IDS, dipakai untuk membaca label asli dari nama file IP102
 *     (contoh "IP014000480.jpg" berarti kelas IP102 nomor 14 = grub).
 *   - Angka uji per kelas: notebook bagian "Tabel kesehatan deteksi per kelas"
 *     (model yolo11l, data uji 110 gambar, ambang 0,35) dan "Lima kelas AP50 terendah".
 *   - Gejala dan pengendalian: ringkasan umum pengendalian hama terpadu (PHT), bukan
 *     resep. Selalu konfirmasi ke penyuluh pertanian lapangan (PPL).
 */

import type { JenisKomoditas } from "@/lib/types";

export type StatusKeandalanKelas = "teruji_baik" | "perlu_verifikasi" | "belum_teruji";

export interface KelasHama {
  classId: number;
  idLamaIp102: number;
  namaIp102: string;
  namaIlmiah: string;
  namaIndonesia: string;
  komoditas: JenisKomoditas;
  /** true untuk kelas bawang yang sebenarnya hama tanah umum (proksi), lihat notebook bagian 5.3 */
  kelasProksi: boolean;
  kelompok: string;
  gejala: string;
  pengendalian: string[];
  uji: { tp: number; fn: number; fp: number };
  /** Rata-rata AP50 lintas 3 model, hanya diisi untuk 5 kelas terendah yang dilaporkan notebook */
  ap50RataRataTerendah: number | null;
  catatanKhusus: string | null;
}

const PENGENDALIAN_WERENG = [
  "Pantau pangkal batang padi, wereng berkumpul di sana dan mudah terlewat dari atas.",
  "Kurangi pupuk nitrogen berlebih karena tanaman yang terlalu subur disukai wereng.",
  "Jaga musuh alami (laba-laba, kepik predator) dengan tidak menyemprot sebelum populasi tinggi.",
];
const PENGENDALIAN_PENGGEREK = [
  "Kumpulkan dan musnahkan kelompok telur di daun sebelum menetas.",
  "Cabut dan musnahkan batang yang mati di bagian tengah (sundep atau beluk).",
  "Setelah panen, potong rendah atau benamkan tunggul agar larva tidak bertahan.",
];
const PENGENDALIAN_ULAT_DAUN = [
  "Periksa daun yang tergulung atau berlubang, ambil larva secara manual bila jumlahnya sedikit.",
  "Hindari pupuk nitrogen berlebih dan jarak tanam terlalu rapat.",
  "Utamakan pengendalian hayati, misalnya parasitoid telur, sebelum memakai insektisida.",
];
const PENGENDALIAN_LALAT = [
  "Atur air: genangan yang terus-menerus pada fase awal memudahkan serangan.",
  "Tanam serempak dengan lahan sekitar agar siklus hama terputus.",
  "Cabut dan musnahkan anakan yang rusak berat.",
];
const PENGENDALIAN_ULAT_TANAH = [
  "Periksa pangkal tanaman muda pada pagi atau malam hari, ulat bersembunyi di tanah pada siang hari.",
  "Bersihkan gulma sebelum tanam karena menjadi tempat bertelur.",
  "Olah tanah dengan baik agar larva dan pupa di dalam tanah terpapar.",
];
const PENGENDALIAN_HAMA_TANAH = [
  "Olah tanah lebih dalam sebelum tanam agar larva terangkat dan dimakan burung.",
  "Kumpulkan larva secara manual saat mengolah tanah.",
  "Pertimbangkan jamur entomopatogen (misalnya Metarhizium) sesuai anjuran PPL.",
];
const PENGENDALIAN_THRIPS = [
  "Pasang perangkap lekat berwarna biru atau kuning untuk memantau populasi.",
  "Penyiraman dari atas pada musim kemarau membantu menekan thrips di daun.",
  "Gilir bahan aktif bila terpaksa menyemprot, thrips cepat menjadi kebal.",
];

export const DAFTAR_KELAS_HAMA: KelasHama[] = [
  {
    classId: 0, idLamaIp102: 0, namaIp102: "rice leaf roller", namaIlmiah: "Cnaphalocrocis medinalis",
    namaIndonesia: "Penggulung daun padi", komoditas: "Padi", kelasProksi: false, kelompok: "Ulat daun",
    gejala: "Daun padi tergulung memanjang dan tampak bergaris putih karena jaringan hijaunya dimakan dari dalam gulungan.",
    pengendalian: PENGENDALIAN_ULAT_DAUN, uji: { tp: 5, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 1, idLamaIp102: 1, namaIp102: "rice leaf caterpillar", namaIlmiah: "Naranga aenescens",
    namaIndonesia: "Ulat daun padi", komoditas: "Padi", kelasProksi: false, kelompok: "Ulat daun",
    gejala: "Daun dimakan dari tepi sehingga tampak bergerigi, pada serangan berat hanya tulang daun yang tersisa.",
    pengendalian: PENGENDALIAN_ULAT_DAUN, uji: { tp: 0, fn: 2, fp: 1 }, ap50RataRataTerendah: 0.6605,
    catatanKhusus: "Pada data uji, kedua contoh kelas ini tidak terdeteksi oleh YOLO11l.",
  },
  {
    classId: 2, idLamaIp102: 2, namaIp102: "paddy stem maggot", namaIlmiah: "Hydrellia sasakii",
    namaIndonesia: "Lalat penggerek pucuk padi", komoditas: "Padi", kelasProksi: false, kelompok: "Lalat",
    gejala: "Daun muda yang baru membuka tampak rusak atau berlubang, anakan bisa layu.",
    pengendalian: PENGENDALIAN_LALAT, uji: { tp: 0, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 3, idLamaIp102: 3, namaIp102: "asiatic rice borer", namaIlmiah: "Chilo suppressalis",
    namaIndonesia: "Penggerek batang padi bergaris", komoditas: "Padi", kelasProksi: false, kelompok: "Penggerek batang",
    gejala: "Pucuk tengah mati dan mudah dicabut (sundep) pada fase vegetatif, malai hampa berwarna putih (beluk) pada fase generatif.",
    pengendalian: PENGENDALIAN_PENGGEREK, uji: { tp: 4, fn: 1, fp: 1 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 4, idLamaIp102: 4, namaIp102: "yellow rice borer", namaIlmiah: "Scirpophaga incertulas",
    namaIndonesia: "Penggerek batang padi kuning", komoditas: "Padi", kelasProksi: false, kelompok: "Penggerek batang",
    gejala: "Gejala sundep dan beluk seperti penggerek lain. Ngengat betina meletakkan kelompok telur berbulu cokelat di ujung daun.",
    pengendalian: PENGENDALIAN_PENGGEREK, uji: { tp: 1, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 5, idLamaIp102: 5, namaIp102: "rice gall midge", namaIlmiah: "Orseolia oryzae",
    namaIndonesia: "Ganjur (uret bengkak batang padi)", komoditas: "Padi", kelasProksi: false, kelompok: "Lalat",
    gejala: "Daun pucuk berubah menjadi tabung mirip daun bawang (puru) sehingga anakan tidak membentuk malai.",
    pengendalian: PENGENDALIAN_LALAT, uji: { tp: 2, fn: 1, fp: 1 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 6, idLamaIp102: 6, namaIp102: "Rice Stemfly", namaIlmiah: "Chlorops oryzae",
    namaIndonesia: "Lalat batang padi", komoditas: "Padi", kelasProksi: false, kelompok: "Lalat",
    gejala: "Larva merusak titik tumbuh di dalam batang, daun yang muncul tampak robek atau berlubang memanjang.",
    pengendalian: PENGENDALIAN_LALAT, uji: { tp: 0, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 7, idLamaIp102: 7, namaIp102: "brown plant hopper", namaIlmiah: "Nilaparvata lugens",
    namaIndonesia: "Wereng batang coklat", komoditas: "Padi", kelasProksi: false, kelompok: "Wereng",
    gejala: "Menghisap cairan di pangkal batang. Serangan berat membuat tanaman mengering melingkar (hopperburn) dan dapat menularkan virus kerdil.",
    pengendalian: PENGENDALIAN_WERENG, uji: { tp: 1, fn: 0, fp: 0 }, ap50RataRataTerendah: 0.3869,
    catatanKhusus: "Termasuk lima kelas dengan AP50 terendah lintas model.",
  },
  {
    classId: 8, idLamaIp102: 8, namaIp102: "white backed plant hopper", namaIlmiah: "Sogatella furcifera",
    namaIndonesia: "Wereng punggung putih", komoditas: "Padi", kelasProksi: false, kelompok: "Wereng",
    gejala: "Menghisap cairan tanaman muda, daun menguning dari ujung dan pertumbuhan terhambat.",
    pengendalian: PENGENDALIAN_WERENG, uji: { tp: 1, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 9, idLamaIp102: 9, namaIp102: "small brown plant hopper", namaIlmiah: "Laodelphax striatellus",
    namaIndonesia: "Wereng coklat kecil", komoditas: "Padi", kelasProksi: false, kelompok: "Wereng",
    gejala: "Kerusakan langsung relatif kecil, bahaya utamanya sebagai penular virus bergaris pada padi.",
    pengendalian: PENGENDALIAN_WERENG, uji: { tp: 0, fn: 0, fp: 1 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 10, idLamaIp102: 10, namaIp102: "rice water weevil", namaIlmiah: "Lissorhoptrus oryzophilus",
    namaIndonesia: "Kumbang moncong air padi", komoditas: "Padi", kelasProksi: false, kelompok: "Kumbang",
    gejala: "Kumbang dewasa meninggalkan goresan memanjang di daun, larvanya merusak akar di lahan tergenang.",
    pengendalian: [
      "Keringkan lahan sementara bila anjuran setempat memungkinkan, larva bergantung pada genangan.",
      "Hindari tanam terlalu awal saat populasi kumbang dewasa sedang tinggi.",
      "Bersihkan gulma di pematang yang menjadi tempat berlindung kumbang.",
    ],
    uji: { tp: 5, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 11, idLamaIp102: 11, namaIp102: "rice leafhopper", namaIlmiah: "Nephotettix spp.",
    namaIndonesia: "Wereng hijau", komoditas: "Padi", kelasProksi: false, kelompok: "Wereng",
    gejala: "Menghisap cairan daun dan menjadi penular utama penyakit tungro (daun menguning oranye, tanaman kerdil).",
    pengendalian: PENGENDALIAN_WERENG, uji: { tp: 4, fn: 0, fp: 0 }, ap50RataRataTerendah: 0.5669,
    catatanKhusus: "Termasuk lima kelas dengan AP50 terendah lintas model.",
  },
  {
    classId: 12, idLamaIp102: 12, namaIp102: "grain spreader thrips", namaIlmiah: "Stenchaetothrips biformis",
    namaIndonesia: "Thrips bulir padi", komoditas: "Padi", kelasProksi: false, kelompok: "Thrips",
    gejala: "Ujung daun menggulung dan mengering, terutama pada persemaian dan tanaman muda saat kering.",
    pengendalian: PENGENDALIAN_THRIPS, uji: { tp: 0, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 13, idLamaIp102: 13, namaIp102: "rice shell pest", namaIlmiah: "Pomacea canaliculata",
    namaIndonesia: "Keong mas (siput murbei)", komoditas: "Padi", kelasProksi: false, kelompok: "Keong",
    gejala: "Bibit muda terpotong di pangkal dan hilang dalam semalam. Telurnya berwarna merah muda menempel di batang atau pematang.",
    pengendalian: [
      "Pungut keong dan kelompok telur merah muda secara rutin, terutama pagi dan sore.",
      "Buat parit kecil di pinggir petak agar keong berkumpul dan mudah dipungut.",
      "Tanam bibit yang lebih tua (lebih dari 21 hari) agar tidak mudah terpotong.",
    ],
    uji: { tp: 0, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 14, idLamaIp102: 22, namaIp102: "corn borer", namaIlmiah: "Ostrinia furnacalis",
    namaIndonesia: "Penggerek batang jagung", komoditas: "Jagung", kelasProksi: false, kelompok: "Penggerek batang",
    gejala: "Daun berlubang kecil berderet, ada serbuk gerekan di ketiak daun, batang patah dan tongkol bisa ikut digerek.",
    pengendalian: [
      "Periksa ketiak daun dan rambut tongkol untuk mencari lubang gerekan dan kotoran larva.",
      "Potong dan musnahkan bunga jantan sebagian (bila anjuran setempat) karena menjadi tempat awal larva.",
      "Manfaatkan parasitoid telur Trichogramma bila tersedia dari dinas setempat.",
    ],
    uji: { tp: 6, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 15, idLamaIp102: 23, namaIp102: "army worm", namaIlmiah: "Mythimna separata",
    namaIndonesia: "Ulat grayak tentara", komoditas: "Jagung", kelasProksi: false, kelompok: "Ulat daun",
    gejala: "Daun habis dimakan dalam waktu singkat, ulat bergerak bergerombol dan aktif pada malam hari.",
    pengendalian: PENGENDALIAN_ULAT_DAUN, uji: { tp: 1, fn: 1, fp: 0 }, ap50RataRataTerendah: 0.4597,
    catatanKhusus: "Termasuk lima kelas dengan AP50 terendah lintas model.",
  },
  {
    classId: 16, idLamaIp102: 24, namaIp102: "aphids", namaIlmiah: "Rhopalosiphum maidis",
    namaIndonesia: "Kutu daun jagung", komoditas: "Jagung", kelasProksi: false, kelompok: "Kutu daun",
    gejala: "Koloni kutu hijau kebiruan di pucuk dan bunga jantan, daun keriting dan berembun madu yang ditumbuhi jamur jelaga.",
    pengendalian: [
      "Lindungi kumbang koksi dan larva lalat bunga, keduanya pemakan kutu daun.",
      "Semprotan air bertekanan dapat merontokkan koloni kecil.",
      "Kurangi nitrogen berlebih karena memicu pertumbuhan koloni.",
    ],
    uji: { tp: 31, fn: 14, fp: 9 }, ap50RataRataTerendah: null,
    catatanKhusus: "Kelas dengan contoh uji terbanyak (45). Koloni rapat membuat sebagian individu tidak terhitung terpisah.",
  },
  {
    classId: 17, idLamaIp102: 18, namaIp102: "black cutworm", namaIlmiah: "Agrotis ipsilon",
    namaIndonesia: "Ulat tanah (potong hitam)", komoditas: "Jagung", kelasProksi: false, kelompok: "Ulat tanah",
    gejala: "Tanaman muda terpotong di pangkal batang pada malam hari, ulat bersembunyi di tanah dan menggulung bila disentuh.",
    pengendalian: PENGENDALIAN_ULAT_TANAH, uji: { tp: 5, fn: 0, fp: 0 }, ap50RataRataTerendah: null,
    catatanKhusus: "Ulat tanah besar sering terprediksi sebagai kelas ini (7 kali di matriks kebingungan).",
  },
  {
    classId: 18, idLamaIp102: 19, namaIp102: "large cutworm", namaIlmiah: "Agrotis tokionis",
    namaIndonesia: "Ulat tanah besar", komoditas: "Jagung", kelasProksi: false, kelompok: "Ulat tanah",
    gejala: "Gejala serupa ulat tanah lain: tanaman muda rebah karena pangkal batang terpotong.",
    pengendalian: PENGENDALIAN_ULAT_TANAH, uji: { tp: 0, fn: 0, fp: 1 }, ap50RataRataTerendah: null,
    catatanKhusus: "Pasangan kelas yang paling sering tertukar: terprediksi sebagai Ulat tanah (potong hitam) 7 kali.",
  },
  {
    classId: 19, idLamaIp102: 20, namaIp102: "yellow cutworm", namaIlmiah: "Agrotis segetum",
    namaIndonesia: "Ulat tanah kuning", komoditas: "Jagung", kelasProksi: false, kelompok: "Ulat tanah",
    gejala: "Memotong tanaman muda di pangkal dan memakan bagian tanaman di dalam tanah.",
    pengendalian: PENGENDALIAN_ULAT_TANAH, uji: { tp: 1, fn: 0, fp: 0 }, ap50RataRataTerendah: 0,
    catatanKhusus: "AP50 rata-rata lintas model 0, kelas paling lemah pada evaluasi.",
  },
  {
    classId: 20, idLamaIp102: 14, namaIp102: "grub", namaIlmiah: "(larva Scarabaeidae)",
    namaIndonesia: "Uret (larva kumbang tanah)", komoditas: "Bawang", kelasProksi: true, kelompok: "Hama tanah",
    gejala: "Larva putih berbentuk huruf C memakan akar dan umbi, tanaman layu dan mudah dicabut.",
    pengendalian: PENGENDALIAN_HAMA_TANAH, uji: { tp: 18, fn: 2, fp: 1 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 21, idLamaIp102: 15, namaIp102: "mole cricket", namaIlmiah: "Gryllotalpa spp.",
    namaIndonesia: "Anjing tanah / orong-orong", komoditas: "Bawang", kelasProksi: true, kelompok: "Hama tanah",
    gejala: "Membuat lorong di permukaan tanah dan memotong akar serta pangkal tanaman muda.",
    pengendalian: [
      "Genangi lahan sebentar sebelum tanam bila memungkinkan agar orong-orong keluar.",
      "Gunakan umpan atau perangkap lampu sesuai anjuran setempat.",
      "Olah tanah dengan baik untuk merusak lorong dan sarang telurnya.",
    ],
    uji: { tp: 12, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 22, idLamaIp102: 16, namaIp102: "wireworm", namaIlmiah: "(larva Elateridae)",
    namaIndonesia: "Uret kawat", komoditas: "Bawang", kelasProksi: true, kelompok: "Hama tanah",
    gejala: "Larva ramping keras berwarna kuning kecokelatan melubangi umbi dan akar.",
    pengendalian: [
      "Lakukan rotasi tanaman, populasi cenderung tinggi setelah lahan berumput atau bera lama.",
      "Olah tanah beberapa kali sebelum tanam.",
      "Pasang umpan potongan umbi di dalam tanah untuk memantau keberadaan larva.",
    ],
    uji: { tp: 10, fn: 0, fp: 0 }, ap50RataRataTerendah: null, catatanKhusus: null,
  },
  {
    classId: 23, idLamaIp102: 54, namaIp102: "Thrips", namaIlmiah: "Thrips tabaci",
    namaIndonesia: "Thrips bawang", komoditas: "Bawang", kelasProksi: false, kelompok: "Thrips",
    gejala: "Daun bawang berbercak putih keperakan, ujung daun mengering dan umbi mengecil.",
    pengendalian: PENGENDALIAN_THRIPS, uji: { tp: 0, fn: 0, fp: 0 }, ap50RataRataTerendah: null,
    catatanKhusus: "Kelas bawang masih umum (IP102), sehingga keyakinan cenderung lebih rendah.",
  },
];

export function ambilKelasHama(classId: number): KelasHama | null {
  return DAFTAR_KELAS_HAMA[classId] ?? null;
}

/** Mengelompokkan kelas menjadi tiga status keandalan berdasarkan hasil uji notebook */
export function tentukanStatusKeandalan(kelas: KelasHama): StatusKeandalanKelas {
  const jumlahContohUji = kelas.uji.tp + kelas.uji.fn;
  if (jumlahContohUji === 0) return "belum_teruji";
  const recall = kelas.uji.tp / jumlahContohUji;
  if (kelas.ap50RataRataTerendah !== null || recall < 0.75) return "perlu_verifikasi";
  return "teruji_baik";
}

export function jelaskanKeandalanKelas(kelas: KelasHama): string {
  const status = tentukanStatusKeandalan(kelas);
  const jumlahContohUji = kelas.uji.tp + kelas.uji.fn;
  if (status === "belum_teruji") {
    return `Kelas ini tidak punya contoh di data uji (110 gambar), jadi ketepatannya belum terukur.${kelas.uji.fp > 0 ? ` Model pernah ${kelas.uji.fp} kali salah menebak kelas ini pada gambar lain.` : ""}`;
  }
  const bagianDasar = `Pada data uji, YOLO11l menemukan ${kelas.uji.tp} dari ${jumlahContohUji} contoh kelas ini${kelas.uji.fp > 0 ? ` dan ${kelas.uji.fp} kali salah menebak kelas ini` : " tanpa salah tebak"}.`;
  return kelas.catatanKhusus ? `${bagianDasar} ${kelas.catatanKhusus}` : bagianDasar;
}

/**
 * Membaca label asli dari nama file IP102. Format nama file IP102 adalah "IP" + 3 digit
 * nomor kelas asli + nomor urut, misalnya IP014000480.jpg = kelas 14 (grub).
 * Mengembalikan null bila nama file tidak berpola IP102 atau kelasnya di luar 24 kelas.
 */
export function bacaLabelDariNamaFileIp102(namaFile: string): KelasHama | null {
  const cocok = /^IP(\d{3})\d{3,}/i.exec(namaFile);
  if (!cocok) return null;
  const idLama = Number.parseInt(cocok[1], 10);
  return DAFTAR_KELAS_HAMA.find((kelas) => kelas.idLamaIp102 === idLama) ?? null;
}

/** Mencari kelas dari nama Inggris IP102 atau nama Indonesia, dipakai untuk keterangan.json */
export function cariKelasDariNama(nama: string): KelasHama | null {
  const kunci = nama.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    DAFTAR_KELAS_HAMA.find(
      (kelas) =>
        kelas.namaIp102.toLowerCase().replace(/[^a-z0-9]/g, "") === kunci ||
        kelas.namaIndonesia.toLowerCase().replace(/[^a-z0-9]/g, "") === kunci
    ) ?? null
  );
}

export const WARNA_KOMODITAS: Record<JenisKomoditas, string> = {
  Padi: "#1f8a52",
  Jagung: "#a8790b",
  Bawang: "#7a4d8c",
};

// ---------------------------------------------------------------------------
// Panduan lapangan per kelompok hama, ditulis untuk petani.
// Isi bersifat umum (PHT) dan sengaja tidak memuat angka ambang ekonomi, karena
// ambang berbeda per daerah dan umur tanaman. Untuk angka pasti, tanyakan ke PPL.
// ---------------------------------------------------------------------------
export interface PanduanKelompok {
  tempatPeriksa: string;
  waktuPeriksa: string;
  musuhAlami: string;
  tandaHarusBertindak: string;
  ikonEmoji: string;
}

export const PANDUAN_KELOMPOK: Record<string, PanduanKelompok> = {
  Wereng: {
    tempatPeriksa: "Pangkal batang padi dekat permukaan air. Sibak rumpun dan ketuk pelan, wereng akan berloncatan.",
    waktuPeriksa: "Pagi hari, minimal seminggu sekali sejak tanaman muda.",
    musuhAlami: "Laba-laba serigala dan kepik predator. Hindari semprot dini agar mereka tidak ikut mati.",
    tandaHarusBertindak: "Jumlah wereng terus naik dari pemeriksaan ke pemeriksaan, atau mulai ada tanaman menguning mengering melingkar.",
    ikonEmoji: "🦗",
  },
  "Penggerek batang": {
    tempatPeriksa: "Ujung daun (kelompok telur), pucuk tengah yang mati, dan lubang kecil di batang.",
    waktuPeriksa: "Saat tanaman muda dan menjelang bunting, ngengat aktif di malam hari.",
    musuhAlami: "Tawon parasitoid telur (Trichogramma) dan laba-laba.",
    tandaHarusBertindak: "Banyak kelompok telur di daun, atau pucuk mati (sundep) mulai menyebar.",
    ikonEmoji: "🐛",
  },
  "Ulat daun": {
    tempatPeriksa: "Daun yang tergulung, berlubang, atau habis dari tepi. Buka gulungan daun untuk melihat ulat.",
    waktuPeriksa: "Pagi atau sore. Ulat grayak lebih aktif di malam hari.",
    musuhAlami: "Tawon parasitoid, burung, dan kepik predator.",
    tandaHarusBertindak: "Kerusakan daun makin luas dalam beberapa hari, atau ulat terlihat bergerombol.",
    ikonEmoji: "🐛",
  },
  Lalat: {
    tempatPeriksa: "Daun muda yang baru membuka dan pucuk anakan.",
    waktuPeriksa: "Fase persemaian sampai anakan maksimum.",
    musuhAlami: "Tawon parasitoid dan laba-laba.",
    tandaHarusBertindak: "Banyak anakan dengan daun rusak atau berubah bentuk.",
    ikonEmoji: "🪰",
  },
  Kumbang: {
    tempatPeriksa: "Daun dengan goresan memanjang, dan akar pada tanaman yang pertumbuhannya tertinggal.",
    waktuPeriksa: "Awal tanam di lahan tergenang.",
    musuhAlami: "Burung, katak, dan ikan di lahan sawah.",
    tandaHarusBertindak: "Banyak daun bergores dan tanaman muda tampak kerdil.",
    ikonEmoji: "🪲",
  },
  Thrips: {
    tempatPeriksa: "Lipatan dan pangkal daun. Ketuk daun di atas kertas putih untuk melihat serangga kecil yang jatuh.",
    waktuPeriksa: "Musim kemarau, saat udara panas dan kering.",
    musuhAlami: "Kepik predator kecil (Orius) dan tungau predator.",
    tandaHarusBertindak: "Bercak keperakan meluas dan ujung daun mulai mengering.",
    ikonEmoji: "🔬",
  },
  Keong: {
    tempatPeriksa: "Pinggir petak, saluran air, dan pematang. Cari juga telur merah muda di batang.",
    waktuPeriksa: "Pagi dan sore, terutama 2 minggu pertama setelah tanam.",
    musuhAlami: "Itik yang digembalakan setelah tanaman cukup besar.",
    tandaHarusBertindak: "Bibit hilang atau terpotong, dan telur merah muda mudah ditemukan.",
    ikonEmoji: "🐌",
  },
  "Kutu daun": {
    tempatPeriksa: "Pucuk, balik daun, dan bunga jantan jagung. Cari juga semut yang naik turun batang.",
    waktuPeriksa: "Saat cuaca kering dan menjelang berbunga.",
    musuhAlami: "Kumbang koksi (kepik bulat berbintik), larva lalat bunga, dan tawon parasitoid.",
    tandaHarusBertindak: "Koloni meluas ke banyak tanaman dan daun mulai keriting atau menghitam.",
    ikonEmoji: "🐜",
  },
  "Ulat tanah": {
    tempatPeriksa: "Tanah di sekitar tanaman yang rebah. Gali dangkal 2 sampai 5 cm, ulat bersembunyi menggulung.",
    waktuPeriksa: "Pagi sekali atau malam, pada 2 sampai 4 minggu pertama setelah tanam.",
    musuhAlami: "Burung, kumbang tanah, dan tawon parasitoid.",
    tandaHarusBertindak: "Setiap pagi ada tanaman muda baru yang rebah terpotong.",
    ikonEmoji: "🐛",
  },
  "Hama tanah": {
    tempatPeriksa: "Tanah di sekitar akar atau umbi tanaman yang layu. Gali dan periksa akar.",
    waktuPeriksa: "Saat mengolah tanah dan ketika tanaman layu tanpa sebab jelas.",
    musuhAlami: "Burung yang mengikuti bajak, dan jamur Metarhizium di tanah.",
    tandaHarusBertindak: "Tanaman layu berkelompok dan mudah dicabut karena akarnya habis.",
    ikonEmoji: "🪱",
  },
};

export function ambilPanduanKelompok(kelas: KelasHama): PanduanKelompok {
  return PANDUAN_KELOMPOK[kelas.kelompok] ?? PANDUAN_KELOMPOK["Ulat daun"];
}
