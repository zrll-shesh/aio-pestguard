/**
 * lib/model/wawasanPetani.ts
 *
 * Lapisan bahasa petani di atas wawasanPrediksi.ts. Tidak ada istilah teknis seperti
 * presisi, recall, atau confidence di sini. Semua angka diterjemahkan menjadi kalimat
 * "seberapa mungkin benar", "apa yang dicek", dan "apa yang dilakukan kapan".
 */

import type { HasilAnalisisCitra } from "./analisisCitra";
import { ambilPanduanKelompok, type KelasHama } from "./kelasHama";
import type { WawasanPrediksi } from "./wawasanPrediksi";

export type WarnaStatus = "hijau" | "kuning" | "merah";

export interface ItemCekPetani {
  judul: string;
  status: WarnaStatus;
  penjelasan: string;
}

export interface JawabanPetani {
  kalimatUtama: string;
  kataYakin: string;
  warnaYakin: WarnaStatus;
  artiYakin: string;
  komoditasTerdampak: string | null;
  langkah: { sekarang: string[]; beberapaHari: string[]; pencegahan: string[] };
  daftarCek: ItemCekPetani[];
  teksBagikan: string;
}

function persenBulat(nilai: number) {
  return `${Math.round(nilai * 100)}%`;
}

/** Menerjemahkan peluang benar terkalibrasi menjadi kata dan warna yang mudah dipahami */
export function terjemahkanPeluangBenar(peluang: number | null): { kata: string; warna: WarnaStatus; arti: string } {
  if (peluang === null) return { kata: "Tidak ada temuan", warna: "kuning", arti: "Model tidak menemukan hama yang cukup jelas di foto ini." };
  if (peluang >= 0.85)
    return {
      kata: "Sangat mungkin benar",
      warna: "hijau",
      arti: `Dari 10 temuan seyakin ini saat diuji, sekitar ${Math.round(peluang * 10)} benar.`,
    };
  if (peluang >= 0.6)
    return {
      kata: "Kemungkinan benar",
      warna: "kuning",
      arti: `Dari 10 temuan seyakin ini saat diuji, sekitar ${Math.round(peluang * 10)} benar. Cocokkan ciri-cirinya dulu.`,
    };
  return {
    kata: "Belum pasti",
    warna: "merah",
    arti: `Dari 10 temuan seyakin ini saat diuji, hanya sekitar ${Math.max(1, Math.round(peluang * 10))} yang benar. Wajib dicek langsung ke tanaman.`,
  };
}

function kelasUtama(wawasan: WawasanPrediksi): KelasHama | null {
  return wawasan.hamaUtama?.kelas ?? null;
}

export function susunJawabanPetani(wawasan: WawasanPrediksi, analisisCitra: HasilAnalisisCitra | null): JawabanPetani {
  const kelas = kelasUtama(wawasan);
  // Pertanyaan petani: "apakah hama ini benar ada?" Jawabannya ditentukan temuan terkuat jenis itu
  const deteksiJenisUtama = wawasan.hamaUtama ? wawasan.daftarDeteksi.filter((d) => d.kelas.classId === wawasan.hamaUtama!.kelas.classId) : [];
  const peluang = deteksiJenisUtama.length ? Math.max(...deteksiJenisUtama.map((d) => d.akurasiEmpiris.akurasi)) : null;
  const jumlahSamar = deteksiJenisUtama.filter((d) => d.skor < 0.5).length;
  const yakin = terjemahkanPeluangBenar(peluang);
  if (jumlahSamar > 0 && deteksiJenisUtama.length > jumlahSamar) {
    yakin.arti += ` ${jumlahSamar} dari ${deteksiJenisUtama.length} temuan masih samar, jadi jumlah sebenarnya bisa sedikit berbeda.`;
  }

  // ---------- Kalimat utama ----------
  let kalimatUtama: string;
  if (!kelas || !wawasan.hamaUtama) {
    kalimatUtama = wawasan.kandidatTerkuatDiBawahAmbang
      ? `Belum ada hama yang jelas. Ada sedikit kemiripan dengan ${wawasan.kandidatTerkuatDiBawahAmbang.kelas.namaIndonesia}, tapi terlalu lemah untuk dipercaya.`
      : "Tidak terlihat hama yang dikenali sistem di foto ini.";
  } else {
    const jumlah = wawasan.hamaUtama.jumlah;
    kalimatUtama = `Foto ini ${yakin.warna === "merah" ? "mungkin" : "kemungkinan besar"} berisi ${kelas.namaIndonesia}${jumlah > 1 ? `, terhitung ${jumlah} ekor` : ""}.`;
    const lain = wawasan.ringkasanPerKelas.slice(1);
    if (lain.length > 0) kalimatUtama += ` Juga terlihat ${lain.map((r) => `${r.kelas.namaIndonesia} (${r.jumlah})`).join(", ")}.`;
  }

  // ---------- Langkah bertingkat ----------
  const sekarang: string[] = [];
  const beberapaHari: string[] = [];
  const pencegahan: string[] = [];
  if (kelas) {
    const panduan = ambilPanduanKelompok(kelas);
    sekarang.push(`Datangi tanaman ${kelas.komoditas.toLowerCase()} di sekitar perangkap. Periksa di sini: ${panduan.tempatPeriksa}`);
    sekarang.push(`Cocokkan gejalanya: ${kelas.gejala}`);
    if (yakin.warna !== "hijau") sekarang.push("Jangan langsung menyemprot. Pastikan dulu hamanya memang ada di tanaman, karena hasil foto belum pasti.");
    beberapaHari.push(`Tanda harus bertindak: ${panduan.tandaHarusBertindak}`);
    beberapaHari.push(kelas.pengendalian[0]);
    if (wawasan.hamaUtama?.pestisida.length) {
      beberapaHari.push(
        `Bila harus memakai obat, pilih salah satu bahan aktif ini: ${wawasan.hamaUtama.pestisida.map((p) => p.bahan_aktif).join(", ")}. Ganti-ganti bahan aktif tiap penyemprotan supaya hama tidak kebal.`
      );
    } else {
      beberapaHari.push("Referensi obat untuk hama ini belum ada di sistem. Tanyakan pilihan obat ke penyuluh pertanian (PPL) setempat.");
    }
    pencegahan.push(...kelas.pengendalian.slice(1));
    pencegahan.push(`Jaga musuh alaminya: ${panduan.musuhAlami}`);
    pencegahan.push(`Waktu periksa yang tepat: ${panduan.waktuPeriksa}`);
  } else {
    sekarang.push("Bila di lahan memang terlihat hama atau kerusakan, ambil foto lagi lebih dekat dengan cahaya cukup.");
    beberapaHari.push("Coba mode Teliti pada pengaturan kepekaan untuk melihat temuan yang lebih lemah.");
    pencegahan.push("Tetap periksa lahan rutin seminggu sekali walau foto tidak menunjukkan hama.");
  }

  // ---------- Daftar cek kepercayaan ----------
  const daftarCek: ItemCekPetani[] = [];
  if (kelas && wawasan.hamaUtama) {
    daftarCek.push({
      judul: "Keyakinan sistem",
      status: yakin.warna,
      penjelasan: yakin.arti,
    });
    const keandalan = wawasan.hamaUtama.statusKeandalan;
    daftarCek.push({
      judul: "Pengalaman sistem dengan hama ini",
      status: keandalan === "teruji_baik" ? "hijau" : keandalan === "perlu_verifikasi" ? "kuning" : "merah",
      penjelasan:
        keandalan === "teruji_baik"
          ? `Saat diuji, sistem hampir selalu benar mengenali ${kelas.namaIndonesia}.`
          : keandalan === "perlu_verifikasi"
            ? `Saat diuji, sistem kadang keliru untuk ${kelas.namaIndonesia}. Cocokkan dengan ciri di lapangan.`
            : `Sistem belum pernah diuji khusus untuk ${kelas.namaIndonesia}, jadi belum tahu seberapa sering benar.`,
    });
    const adaRagu = wawasan.daftarDeteksi.some((d) => d.adaPesaingDekat || d.seringTertukarDengan);
    const pesaing = wawasan.daftarDeteksi.flatMap((d) => d.alternatif.filter((a) => a.pesaingDekat)).map((a) => a.kelas.namaIndonesia);
    daftarCek.push({
      judul: "Kemiripan dengan hama lain",
      status: adaRagu ? "kuning" : "hijau",
      penjelasan: adaRagu
        ? `Sistem juga melihat kemiripan dengan ${Array.from(new Set(pesaing)).slice(0, 2).join(" dan ") || "hama lain yang serupa"}. Pastikan dengan melihat langsung.`
        : "Tidak ada hama lain yang mirip. Sistem cukup tegas memilih jenis ini.",
    });
    if (kelas.kelasProksi) {
      daftarCek.push({
        judul: "Catatan untuk bawang",
        status: "kuning",
        penjelasan: "Jenis ini dikenali sebagai hama tanah umum, belum khusus hama bawang.",
      });
    }
  }
  for (const catatan of analisisCitra?.daftarCatatan ?? []) {
    const judul = catatan.judul === "Pencahayaan" ? "Foto cukup terang" : catatan.judul === "Ketajaman" ? "Foto tidak buram" : "Foto cukup besar";
    daftarCek.push({
      judul,
      status: catatan.tingkat === "baik" ? "hijau" : "kuning",
      penjelasan:
        catatan.tingkat === "baik"
          ? `Sudah baik (${catatan.nilai}).`
          : catatan.judul === "Pencahayaan"
            ? "Foto terlalu gelap atau terlalu terang. Hama bisa terlewat. Ambil foto saat cahaya cukup."
            : catatan.judul === "Ketajaman"
              ? "Foto agak buram. Tahan ponsel lebih stabil dan ketuk layar untuk fokus."
              : "Foto kecil atau hama terlalu jauh. Dekatkan kamera ke hama.",
    });
  }

  // ---------- Teks untuk dibagikan (WhatsApp) ----------
  const barisBagikan = ["*AIO PESTGUARD - hasil cek foto hama*", kalimatUtama, `Keyakinan: ${yakin.kata}${peluang !== null ? ` (sekitar ${persenBulat(peluang)} benar saat diuji)` : ""}.`];
  if (sekarang.length) barisBagikan.push("", "*Yang perlu dilakukan sekarang:*", ...sekarang.slice(0, 2).map((s, i) => `${i + 1}. ${s}`));
  barisBagikan.push("", "_Hasil ini bantuan awal, bukan pengganti pengecekan langsung dan saran PPL._");

  return {
    kalimatUtama,
    kataYakin: yakin.kata,
    warnaYakin: yakin.warna,
    artiYakin: yakin.arti,
    komoditasTerdampak: kelas ? kelas.komoditas : null,
    langkah: { sekarang, beberapaHari, pencegahan },
    daftarCek,
    teksBagikan: barisBagikan.join("\n"),
  };
}
