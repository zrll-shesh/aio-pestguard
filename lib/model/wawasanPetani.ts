/**
 * lib/model/wawasanPetani.ts
 *
 * Lapisan bahasa petani di atas wawasanPrediksi.ts, dalam tiga bahasa (id, en, ko).
 * Tidak ada istilah teknis seperti presisi, recall, atau confidence. Angka diterjemahkan
 * menjadi "seberapa mungkin benar", "apa yang dicek", dan "apa yang dilakukan kapan".
 */

import type { HasilAnalisisCitra } from "./analisisCitra";
import { ambilPanduanKelompok, type KelasHama } from "./kelasHama";
import type { WawasanPrediksi } from "./wawasanPrediksi";
import { formatAngka, namaKomoditas, pilihTeks, terjemahKonten, type Bahasa } from "@/lib/i18n/bahasa";

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
  peluangBenar: number | null;
  komoditasTerdampak: string | null;
  langkah: { sekarang: string[]; beberapaHari: string[]; pencegahan: string[] };
  daftarCek: ItemCekPetani[];
  teksBagikan: string;
}

/** Menerjemahkan peluang benar terkalibrasi menjadi kata dan warna yang mudah dipahami */
export function terjemahkanPeluangBenar(peluang: number | null, bahasa: Bahasa): { kata: string; warna: WarnaStatus; arti: string } {
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  if (peluang === null)
    return {
      kata: t("Tidak ada temuan", "Nothing found", "발견 없음"),
      warna: "kuning",
      arti: t("Model tidak menemukan hama yang cukup jelas di foto ini.", "The model found no clear pest in this photo.", "이 사진에서 뚜렷한 해충을 찾지 못했습니다."),
    };
  const dariSepuluh = Math.max(1, Math.round(peluang * 10));
  if (peluang >= 0.85)
    return {
      kata: t("Sangat mungkin benar", "Very likely correct", "매우 정확할 가능성"),
      warna: "hijau",
      arti: t(
        `Dari 10 temuan seyakin ini saat diuji, sekitar ${dariSepuluh} benar.`,
        `Of 10 findings this confident in testing, about ${dariSepuluh} were correct.`,
        `시험에서 이 정도 확신한 10건 중 약 ${dariSepuluh}건이 맞았습니다.`
      ),
    };
  if (peluang >= 0.6)
    return {
      kata: t("Kemungkinan benar", "Probably correct", "정확할 가능성 있음"),
      warna: "kuning",
      arti: t(
        `Dari 10 temuan seyakin ini saat diuji, sekitar ${dariSepuluh} benar. Cocokkan ciri-cirinya dulu.`,
        `Of 10 findings this confident in testing, about ${dariSepuluh} were correct. Check the signs first.`,
        `시험에서 이 정도 확신한 10건 중 약 ${dariSepuluh}건이 맞았습니다. 먼저 특징을 확인하세요.`
      ),
    };
  return {
    kata: t("Belum pasti", "Not certain", "불확실"),
    warna: "merah",
    arti: t(
      `Dari 10 temuan seyakin ini saat diuji, hanya sekitar ${dariSepuluh} yang benar. Wajib dicek langsung ke tanaman.`,
      `Of 10 findings this confident in testing, only about ${dariSepuluh} were correct. Check the plants yourself.`,
      `시험에서 이 정도 확신한 10건 중 약 ${dariSepuluh}건만 맞았습니다. 반드시 작물을 직접 확인하세요.`
    ),
  };
}

export function susunJawabanPetani(wawasan: WawasanPrediksi, analisisCitra: HasilAnalisisCitra | null, bahasa: Bahasa): JawabanPetani {
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  const tk = (teks: string) => terjemahKonten(bahasa, teks);
  const nama = (k: KelasHama) => tk(k.namaIndonesia);
  const kelas = wawasan.hamaUtama?.kelas ?? null;

  // Pertanyaan petani: "apakah hama ini benar ada?" Jawabannya ditentukan temuan terkuat jenis itu
  const deteksiJenisUtama = wawasan.hamaUtama ? wawasan.daftarDeteksi.filter((d) => d.kelas.classId === wawasan.hamaUtama!.kelas.classId) : [];
  const peluang = deteksiJenisUtama.length ? Math.max(...deteksiJenisUtama.map((d) => d.akurasiEmpiris.akurasi)) : null;
  const jumlahSamar = deteksiJenisUtama.filter((d) => d.skor < 0.5).length;
  const yakin = terjemahkanPeluangBenar(peluang, bahasa);
  if (jumlahSamar > 0 && deteksiJenisUtama.length > jumlahSamar) {
    yakin.arti += t(
      ` ${jumlahSamar} dari ${deteksiJenisUtama.length} temuan masih samar, jadi jumlah sebenarnya bisa sedikit berbeda.`,
      ` ${jumlahSamar} of ${deteksiJenisUtama.length} findings are faint, so the real count may differ slightly.`,
      ` ${deteksiJenisUtama.length}건 중 ${jumlahSamar}건은 희미해서 실제 수는 조금 다를 수 있습니다.`
    );
  }

  // ---------- Kalimat utama ----------
  let kalimatUtama: string;
  if (!kelas || !wawasan.hamaUtama) {
    const kandidat = wawasan.kandidatTerkuatDiBawahAmbang;
    kalimatUtama = kandidat
      ? t(
          `Belum ada hama yang jelas. Ada sedikit kemiripan dengan ${nama(kandidat.kelas)}, tapi terlalu lemah untuk dipercaya.`,
          `No clear pest yet. There is a slight resemblance to ${nama(kandidat.kelas)}, but it is too weak to trust.`,
          `아직 뚜렷한 해충은 없습니다. ${nama(kandidat.kelas)}와 약간 닮았지만 믿기에는 너무 약합니다.`
        )
      : t("Tidak terlihat hama yang dikenali sistem di foto ini.", "No pest the system knows is visible in this photo.", "이 사진에는 시스템이 아는 해충이 보이지 않습니다.");
  } else {
    const jumlah = wawasan.hamaUtama.jumlah;
    const ragu = yakin.warna === "merah";
    kalimatUtama = t(
      `Foto ini ${ragu ? "mungkin" : "kemungkinan besar"} berisi ${nama(kelas)}${jumlah > 1 ? `, terhitung ${jumlah} ekor` : ""}.`,
      `This photo ${ragu ? "may show" : "most likely shows"} ${nama(kelas)}${jumlah > 1 ? `, ${jumlah} counted` : ""}.`,
      `이 사진에는 ${ragu ? "" : "높은 확률로 "}${nama(kelas)}${jumlah > 1 ? ` ${jumlah}마리` : ""}가 ${ragu ? "있을 수 있습니다" : "있습니다"}.`
    );
    const lain = wawasan.ringkasanPerKelas.slice(1);
    if (lain.length > 0) {
      const daftarLain = lain.map((r) => `${nama(r.kelas)} (${r.jumlah})`).join(", ");
      kalimatUtama += t(` Juga terlihat ${daftarLain}.`, ` Also seen: ${daftarLain}.`, ` 함께 보이는 해충: ${daftarLain}.`);
    }
  }

  // ---------- Langkah bertingkat ----------
  const sekarang: string[] = [];
  const beberapaHari: string[] = [];
  const pencegahan: string[] = [];
  if (kelas) {
    const panduan = ambilPanduanKelompok(kelas);
    const komoditas = namaKomoditas(bahasa, kelas.komoditas);
    sekarang.push(
      t(
        `Datangi tanaman ${komoditas.toLowerCase()} di sekitar perangkap. Periksa di sini: ${tk(panduan.tempatPeriksa)}`,
        `Go to the ${komoditas.toLowerCase()} plants around the trap. Check here: ${tk(panduan.tempatPeriksa)}`,
        `트랩 주변의 ${komoditas}로 가세요. 살펴볼 곳: ${tk(panduan.tempatPeriksa)}`
      )
    );
    sekarang.push(t(`Cocokkan gejalanya: ${tk(kelas.gejala)}`, `Match the signs: ${tk(kelas.gejala)}`, `증상을 대조하세요: ${tk(kelas.gejala)}`));
    if (yakin.warna !== "hijau") {
      sekarang.push(
        t(
          "Jangan langsung menyemprot. Pastikan dulu hamanya memang ada di tanaman, karena hasil foto belum pasti.",
          "Do not spray straight away. First make sure the pest is really on the plants, because the photo result is not certain.",
          "바로 약을 치지 마세요. 사진 결과가 확실하지 않으니 먼저 작물에 해충이 정말 있는지 확인하세요."
        )
      );
    }
    beberapaHari.push(t(`Tanda harus bertindak: ${tk(panduan.tandaHarusBertindak)}`, `When to act: ${tk(panduan.tandaHarusBertindak)}`, `조치할 때: ${tk(panduan.tandaHarusBertindak)}`));
    beberapaHari.push(tk(kelas.pengendalian[0]));
    const pengendalian = wawasan.hamaUtama?.pengendalian;
    if (pengendalian && pengendalian.alami.length > 0) {
      const daftarAlami = pengendalian.alami
        .slice(0, 2)
        .map((a) => tk(a.nama).toLowerCase())
        .join(t(", atau ", ", or ", " 또는 "));
      beberapaHari.push(
        t(
          `Coba dulu cara alami: ${daftarAlami}. Lebih aman untuk musuh alami dan tidak meninggalkan residu.`,
          `Try natural methods first: ${daftarAlami}. Safer for natural enemies and leaves no residue.`,
          `먼저 친환경 방법을 써 보세요: ${daftarAlami}. 천적에게 더 안전하고 잔류물이 남지 않습니다.`
        )
      );
    }
    if (pengendalian && pengendalian.kimiaBoleh.length > 0) {
      const daftarKimia = pengendalian.kimiaBoleh.slice(0, 3).map((x) => x.bahanAktif).join(", ");
      beberapaHari.push(
        t(
          `Bila hama tetap banyak, baru pakai obat kimia. Pilih salah satu bahan aktif: ${daftarKimia}. Ganti-ganti bahan aktif tiap penyemprotan supaya hama tidak kebal.`,
          `Only if pests stay numerous, use a chemical. Pick one active ingredient: ${daftarKimia}. Switch ingredients each spray so pests do not become resistant.`,
          `해충이 계속 많을 때만 화학 약제를 쓰세요. 유효성분 하나를 고르세요: ${daftarKimia}. 저항성이 생기지 않게 살포할 때마다 성분을 바꾸세요.`
        )
      );
    } else {
      beberapaHari.push(
        t(
          "Belum ada obat kimia yang boleh dipakai untuk hama ini di referensi sistem. Tanyakan ke penyuluh pertanian (PPL) setempat.",
          "No permitted chemical for this pest is in the system reference yet. Ask your local agricultural extension officer.",
          "시스템 자료에 이 해충에 쓸 수 있는 화학 약제가 아직 없습니다. 지역 농업 지도사에게 문의하세요."
        )
      );
    }
    if (pengendalian && pengendalian.kimiaTerlarang.length > 0) {
      const daftarLarang = pengendalian.kimiaTerlarang.map((x) => x.bahanAktif).join(", ");
      beberapaHari.push(
        t(
          `Hati-hati, jangan pakai ${daftarLarang} di ${komoditas.toLowerCase()}. Bahan ini masuk daftar larangan, walau tercantum di sumber pengendalian.`,
          `Careful: do not use ${daftarLarang} on ${komoditas.toLowerCase()}. It is on the banned list even though it appears in control sources.`,
          `주의: ${komoditas}에 ${daftarLarang}을(를) 쓰지 마세요. 방제 자료에 나오더라도 금지 목록에 있습니다.`
        )
      );
    }
    pencegahan.push(...kelas.pengendalian.slice(1).map(tk));
    pencegahan.push(t(`Jaga musuh alaminya: ${tk(panduan.musuhAlami)}`, `Protect its natural enemies: ${tk(panduan.musuhAlami)}`, `천적을 보호하세요: ${tk(panduan.musuhAlami)}`));
    pencegahan.push(t(`Waktu periksa yang tepat: ${tk(panduan.waktuPeriksa)}`, `Best time to check: ${tk(panduan.waktuPeriksa)}`, `확인하기 좋은 때: ${tk(panduan.waktuPeriksa)}`));
  } else {
    sekarang.push(
      t(
        "Bila di lahan memang terlihat hama atau kerusakan, ambil foto lagi lebih dekat dengan cahaya cukup.",
        "If you see pests or damage in the field, take another closer photo in good light.",
        "밭에서 해충이나 피해가 보인다면 밝은 곳에서 더 가까이 다시 찍으세요."
      )
    );
    beberapaHari.push(
      t(
        "Coba mode Teliti pada pengaturan kepekaan untuk melihat temuan yang lebih lemah.",
        "Try the Thorough sensitivity setting to see weaker findings.",
        "민감도를 '꼼꼼히'로 바꿔 약한 발견도 확인해 보세요."
      )
    );
    pencegahan.push(
      t(
        "Tetap periksa lahan rutin seminggu sekali walau foto tidak menunjukkan hama.",
        "Keep checking the field once a week even if photos show no pests.",
        "사진에 해충이 없더라도 일주일에 한 번은 밭을 살피세요."
      )
    );
  }

  // ---------- Daftar cek kepercayaan ----------
  const daftarCek: ItemCekPetani[] = [];
  if (kelas && wawasan.hamaUtama) {
    daftarCek.push({ judul: t("Keyakinan sistem", "System confidence", "시스템 확신도"), status: yakin.warna, penjelasan: yakin.arti });
    const keandalan = wawasan.hamaUtama.statusKeandalan;
    daftarCek.push({
      judul: t("Pengalaman sistem dengan hama ini", "System track record for this pest", "이 해충에 대한 시스템 경험"),
      status: keandalan === "teruji_baik" ? "hijau" : keandalan === "perlu_verifikasi" ? "kuning" : "merah",
      penjelasan:
        keandalan === "teruji_baik"
          ? t(`Saat diuji, sistem hampir selalu benar mengenali ${nama(kelas)}.`, `In testing, the system almost always recognised ${nama(kelas)} correctly.`, `시험에서 시스템은 ${nama(kelas)}를 거의 항상 바르게 알아봤습니다.`)
          : keandalan === "perlu_verifikasi"
            ? t(`Saat diuji, sistem kadang keliru untuk ${nama(kelas)}. Cocokkan dengan ciri di lapangan.`, `In testing, the system was sometimes wrong about ${nama(kelas)}. Compare with field signs.`, `시험에서 ${nama(kelas)}를 가끔 잘못 알아봤습니다. 현장 특징과 대조하세요.`)
            : t(`Sistem belum pernah diuji khusus untuk ${nama(kelas)}, jadi belum tahu seberapa sering benar.`, `The system has not been tested on ${nama(kelas)} yet, so its accuracy is unknown.`, `${nama(kelas)}에 대해서는 아직 시험하지 않아 정확도를 알 수 없습니다.`),
    });
    const adaRagu = wawasan.daftarDeteksi.some((d) => d.adaPesaingDekat || d.seringTertukarDengan);
    const pesaing = Array.from(new Set(wawasan.daftarDeteksi.flatMap((d) => d.alternatif.filter((a) => a.pesaingDekat)).map((a) => nama(a.kelas))));
    const daftarPesaing = pesaing.slice(0, 2).join(t(" dan ", " and ", ", ")) || t("hama lain yang serupa", "a similar pest", "비슷한 해충");
    daftarCek.push({
      judul: t("Kemiripan dengan hama lain", "Resemblance to other pests", "다른 해충과의 유사성"),
      status: adaRagu ? "kuning" : "hijau",
      penjelasan: adaRagu
        ? t(`Sistem juga melihat kemiripan dengan ${daftarPesaing}. Pastikan dengan melihat langsung.`, `The system also sees a resemblance to ${daftarPesaing}. Confirm by looking yourself.`, `시스템이 ${daftarPesaing}와도 닮았다고 봅니다. 직접 보고 확인하세요.`)
        : t("Tidak ada hama lain yang mirip. Sistem cukup tegas memilih jenis ini.", "No other pest looks similar. The system is fairly decisive about this type.", "비슷한 다른 해충이 없습니다. 시스템이 이 종류를 꽤 확실히 골랐습니다."),
    });
    if (kelas.kelasProksi) {
      daftarCek.push({
        judul: t("Catatan untuk bawang", "Note for shallot", "샬롯 관련 참고"),
        status: "kuning",
        penjelasan: t("Jenis ini dikenali sebagai hama tanah umum, belum khusus hama bawang.", "This type is recognised as a general soil pest, not a shallot-specific pest.", "이 종류는 샬롯 전용이 아닌 일반 토양 해충으로 인식됩니다."),
      });
    }
  }
  for (const catatan of analisisCitra?.daftarCatatan ?? []) {
    const judul =
      catatan.jenis === "cahaya"
        ? t("Foto cukup terang", "Photo bright enough", "사진 밝기")
        : catatan.jenis === "ketajaman"
          ? t("Foto tidak buram", "Photo not blurry", "사진 선명도")
          : t("Foto cukup besar", "Photo large enough", "사진 크기");
    const saranPerbaikan =
      catatan.jenis === "cahaya"
        ? t("Foto terlalu gelap atau terlalu terang. Hama bisa terlewat. Ambil foto saat cahaya cukup.", "Too dark or too bright. Pests may be missed. Take photos in good light.", "너무 어둡거나 밝습니다. 해충을 놓칠 수 있으니 적당한 빛에서 찍으세요.")
        : catatan.jenis === "ketajaman"
          ? t("Foto agak buram. Tahan ponsel lebih stabil dan ketuk layar untuk fokus.", "A bit blurry. Hold the phone steady and tap the screen to focus.", "조금 흐립니다. 휴대폰을 고정하고 화면을 눌러 초점을 맞추세요.")
          : t("Foto kecil atau hama terlalu jauh. Dekatkan kamera ke hama.", "Small photo or the pest is too far. Move the camera closer.", "사진이 작거나 해충이 너무 멉니다. 카메라를 더 가까이 대세요.");
    daftarCek.push({
      judul,
      status: catatan.tingkat === "baik" ? "hijau" : "kuning",
      penjelasan: catatan.tingkat === "baik" ? t(`Sudah baik (${catatan.nilai}).`, `Good (${catatan.nilai}).`, `양호 (${catatan.nilai}).`) : saranPerbaikan,
    });
  }

  // ---------- Teks untuk dibagikan (WhatsApp) ----------
  const barisBagikan = [
    t("*AIO PESTGUARD - hasil cek foto hama*", "*AIO PESTGUARD - pest photo check*", "*AIO PESTGUARD - 해충 사진 확인 결과*"),
    kalimatUtama,
    `${t("Keyakinan", "Confidence", "확신도")}: ${yakin.kata}${
      peluang !== null ? t(` (sekitar ${formatAngka(bahasa, peluang * 100)}% benar saat diuji)`, ` (about ${formatAngka(bahasa, peluang * 100)}% correct in testing)`, ` (시험 정확도 약 ${formatAngka(bahasa, peluang * 100)}%)`) : ""
    }.`,
  ];
  if (sekarang.length) {
    barisBagikan.push("", t("*Yang perlu dilakukan sekarang:*", "*What to do now:*", "*지금 할 일:*"), ...sekarang.slice(0, 2).map((s, i) => `${i + 1}. ${s}`));
  }
  const alamiUtama = wawasan.hamaUtama?.pengendalian.alami[0];
  if (alamiUtama) {
    barisBagikan.push("", `${t("*Cara alami yang bisa dicoba:*", "*Natural method to try:*", "*시도할 친환경 방법:*")} ${tk(alamiUtama.nama)} (${alamiUtama.sumber}).`);
  }
  barisBagikan.push(
    "",
    t(
      "_Hasil ini bantuan awal, bukan pengganti pengecekan langsung dan saran PPL._",
      "_This is an early aid, not a replacement for checking in person or advice from an extension officer._",
      "_이 결과는 초기 도움일 뿐, 직접 확인과 농업 지도사의 조언을 대신하지 않습니다._"
    )
  );

  return {
    kalimatUtama,
    kataYakin: yakin.kata,
    warnaYakin: yakin.warna,
    artiYakin: yakin.arti,
    peluangBenar: peluang,
    komoditasTerdampak: kelas ? namaKomoditas(bahasa, kelas.komoditas) : null,
    langkah: { sekarang, beberapaHari, pencegahan },
    daftarCek,
    teksBagikan: barisBagikan.join("\n"),
  };
}
