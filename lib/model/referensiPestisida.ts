/**
 * lib/model/referensiPestisida.ts
 *
 * Referensi pengendalian kimia dan alami (organik, hayati, mekanis) untuk 24 kelas hama.
 * Sumber: dokumen tim "Referensi Pestisida Hama Tanaman: Padi, Jagung, dan Bawang Merah"
 * (Proposal_Deteksi_Hama_AIGRA_revisi.pdf). Isi tabel disalin apa adanya; yang ditambahkan
 * di sini hanya penanda larangan untuk padi dan catatan mutu data.
 *
 * Daftar larangan: 12 bahan aktif insektisida yang tidak boleh dipakai pada padi, dari
 * Tabloid Sinar Tani (pemaparan Prof. Dadang, Guru Besar Proteksi Tanaman IPB).
 * Endosulfan dilarang untuk semua tanaman.
 */

import type { JenisKomoditas, RekomendasiPestisida } from "@/lib/types";
import { DAFTAR_KELAS_HAMA } from "./kelasHama";

export interface BahanKimia {
  bahanAktif: string;
  kadar: string;
  contohProduk: string;
  sumber: string;
}

export type JenisCaraAlami = "nabati" | "hayati" | "mekanis";

export interface CaraAlami {
  nama: string;
  jenis: JenisCaraAlami;
  keterangan: string;
  sumber: string;
  /** false bila baru diuji pada hama kerabat, belum pada hama ini sendiri */
  diujiPadaHamaIni: boolean;
}

export interface ReferensiPengendalian {
  judulDokumen: string;
  kimia: BahanKimia[];
  alami: CaraAlami[];
  /** Bahan aktif yang dalam dokumen bersumber dari pesticideresistance.org (basis data kasus kekebalan) */
  bahanTercatatKebal: string[];
  catatanData: string[];
}

// ---------------------------------------------------------------------------
// Larangan
// ---------------------------------------------------------------------------
interface AturanLarangan {
  nama: string;
  /** Kata kunci pencocokan, sudah huruf kecil tanpa spasi dan tanda hubung */
  kunci: string[];
  lingkup: "padi" | "semua";
  catatan: string;
}

export const DAFTAR_LARANGAN: AturanLarangan[] = [
  { nama: "Deltametrin", kunci: ["deltametrin", "deltamethrin"], lingkup: "padi", catatan: "Masih boleh untuk bawang merah, cabai, kedelai, jagung, kapas, sawit, teh, semangka, kubis." },
  { nama: "Kartap hidroklorida", kunci: ["kartap", "cartap"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
  { nama: "Sipermetrin", kunci: ["sipermetrin", "cypermethrin"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
  { nama: "Klorpirifos", kunci: ["klorpirifos", "chlorpyrifos"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
  { nama: "Lambda sihalotrin", kunci: ["lambdasihalotrin", "lambdacyhalothrin"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
  { nama: "Profenofos", kunci: ["profenofos"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
  { nama: "Asefat", kunci: ["asefat", "acephate"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
  { nama: "Metomil", kunci: ["metomil", "methomyl"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
  { nama: "Diazinon", kunci: ["diazinon"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
  {
    nama: "Endosulfan",
    kunci: ["endosulfan"],
    lingkup: "semua",
    catatan: "Dilarang untuk semua tanaman. Golongan organoklorin (POPs) setara DDT, sangat beracun dan dapat mengganggu hormon, kekebalan, reproduksi, hingga memicu kanker.",
  },
  { nama: "Karbaril", kunci: ["karbaril", "carbaryl"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
  { nama: "Malation", kunci: ["malation", "malathion"], lingkup: "padi", catatan: "Dilarang khusus di padi." },
];

function rapikanKunci(teks: string) {
  return teks.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Memeriksa apakah sebuah bahan aktif (atau campurannya) mengandung bahan terlarang untuk
 * komoditas tertentu. Alfa-sipermetrin dan zeta-sipermetrin sengaja tidak dianggap sama
 * dengan sipermetrin karena daftar larangan hanya menyebut sipermetrin.
 */
export function cekLarangan(bahanAktif: string, komoditas: JenisKomoditas): AturanLarangan | null {
  const kunciBahan = rapikanKunci(bahanAktif);
  const bagianBahan = bahanAktif.split(/[+/]/).map((b) => rapikanKunci(b));
  for (const aturan of DAFTAR_LARANGAN) {
    if (aturan.lingkup === "padi" && komoditas !== "Padi") continue;
    const cocok = aturan.kunci.some((k) => {
      if (k === "sipermetrin" || k === "cypermethrin") return bagianBahan.some((b) => b === k);
      return kunciBahan.includes(k);
    });
    if (cocok) return aturan;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Data per kelas (indeks = classId model)
// ---------------------------------------------------------------------------
const NEMATODA_ATHERIGONA: CaraAlami = {
  nama: "Nematoda entomopatogen",
  jenis: "hayati",
  keterangan: "Pengendalian hayati. Diuji pada lalat bibit jagung Atherigona (genus sama).",
  sumber: "Repository UNEJ",
  diujiPadaHamaIni: false,
};
const MIMBA_WERENG_KERABAT: CaraAlami = {
  nama: "Ekstrak daun mimba",
  jenis: "nabati",
  keterangan: "Diuji pada wereng batang coklat (sama-sama wereng), belum diuji khusus pada hama ini.",
  sumber: "Jurnal UNPATTI",
  diujiPadaHamaIni: false,
};
const PERANGKAP_LAMPU: CaraAlami = {
  nama: "Perangkap lampu",
  jenis: "mekanis",
  keterangan: "Pengendalian mekanis, tanpa bahan kimia. Menarik serangga dewasa yang aktif di malam hari.",
  sumber: "Kementan, Panduan pengelolaan hama bawang merah",
  diujiPadaHamaIni: false,
};
const LUGEN: BahanKimia = { bahanAktif: "Buprofezin", kadar: "100 g/l", contohProduk: "Lugen 100 EC", sumber: "Nufarm" };
const PLENUM: BahanKimia = { bahanAktif: "Pimetrozin", kadar: "500 g/l", contohProduk: "Plenum 50 WG", sumber: "sadewa-agrijaya.com" };
const ALDES: BahanKimia = { bahanAktif: "Pimetrozin + Fipronil", kadar: "500 g/l + 100 g/l", contohProduk: "ALDES 50/10 WG", sumber: "PT Advansia Indotani" };
const KATANA: BahanKimia = { bahanAktif: "Flubendiamida", kadar: "200 g/l", contohProduk: "Katana 200 SC", sumber: "nufarm.com" };

const ULAT_TANAH: ReferensiPengendalian = {
  judulDokumen: "Black cutworm / Large cutworm / Yellow cutworm (Agrotis spp., ulat tanah)",
  kimia: [
    { bahanAktif: "Profenofos", kadar: "500 g/l", contohProduk: "Curacron 500 EC, Anwavin 500 EC, Celcron 500 EC", sumber: "Dinas KPTPH Lampung, Pustaka BPPSDMP, Tabloid Sinar Tani, Katalog CBA" },
    { bahanAktif: "Klorpirifos", kadar: "200 g/l", contohProduk: "Dursban 200 EC", sumber: "Insektisida DURSBAN 200 EC" },
    { bahanAktif: "Betasiflutrin", kadar: "25 g/l", contohProduk: "Buldok", sumber: "PT Bayer" },
    { bahanAktif: "Lambda-sihalotrin", kadar: "25 g/l", contohProduk: "Matador 25 EC", sumber: "Matador 25 EC" },
  ],
  alami: [PERANGKAP_LAMPU],
  bahanTercatatKebal: [],
  catatanData: ["Satu tabel dipakai bersama untuk tiga jenis ulat tanah (hitam, besar, kuning)."],
};

const REFERENSI_PER_KELAS: Record<number, ReferensiPengendalian> = {
  0: {
    judulDokumen: "Rice leaf roller (Cnaphalocrocis medinalis, hama putih palsu)",
    kimia: [
      { bahanAktif: "Fipronil", kadar: "50 g/l", contohProduk: "Agent 50 SC", sumber: "nufarm.com" },
      KATANA,
      { bahanAktif: "Emamektin benzoat + Heksaflumuron", kadar: "20 g/l + 50 g/l", contohProduk: "AMURON 70 EC", sumber: "Advansia" },
      { bahanAktif: "BPMC (fenobukarb)", kadar: "500 g/l", contohProduk: "Bassa 500 EC", sumber: "Petrokimia Kayaku" },
      { bahanAktif: "Lufenuron", kadar: "50 g/l", contohProduk: "Match 50 EC", sumber: "Syngenta" },
    ],
    alami: [{ nama: "Ekstrak daun pepaya dan daun sirsak", jenis: "nabati", keterangan: "Pestisida nabati untuk hama putih palsu.", sumber: "Jurnal Agrokreatif IPB", diujiPadaHamaIni: true }],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  1: {
    judulDokumen: "Rice leaf caterpillar (Naranga aenescens, ulat grayak hijau)",
    kimia: [
      { bahanAktif: "Metomil-Piretroid (formulasi WP)", kadar: "200 g/l", contohProduk: "-", sumber: "Effects of Different Insecticides on Controlling Naranga aenescens Moore in Rice Field (2010)" },
      { bahanAktif: "Metomil-Piretroid (formulasi EC)", kadar: "200 sampai 302 g/l", contohProduk: "-", sumber: "Effects of Different Insecticides on Controlling Naranga aenescens Moore in Rice Field (2010)" },
    ],
    alami: [{ nama: "Ekstrak daun sirsak", jenis: "nabati", keterangan: "Diuji pada ulat grayak Spodoptera frugiperda (kerabat dekat), belum diuji langsung pada Naranga.", sumber: "Repository UISU", diujiPadaHamaIni: false }],
    bahanTercatatKebal: [],
    catatanData: ["Kedua bahan kimia di tabel mengandung metomil, yang dilarang untuk padi. Praktis belum ada pilihan kimia yang boleh dipakai untuk hama ini."],
  },
  2: {
    judulDokumen: "Paddy stem maggot (lalat bibit padi)",
    kimia: [{ bahanAktif: "Karbosulfan", kadar: "200 sampai 250 g/l", contohProduk: "Marshal 25 STD, Marshal 20 EC", sumber: "repository.ipb.ac.id" }],
    alami: [NEMATODA_ATHERIGONA],
    bahanTercatatKebal: [],
    catatanData: ["Dokumen menulis nama ilmiah Chlorops/Atherigona oryzae, sedangkan glosarium model memakai Hydrellia sasakii."],
  },
  3: {
    judulDokumen: "Asiatic rice borer (Chilo suppressalis, penggerek batang bergaris)",
    kimia: [
      { bahanAktif: "Karbofuran", kadar: "30 g/l", contohProduk: "Petrofur 3 GR", sumber: "Petrokayaku" },
      { bahanAktif: "Fipronil", kadar: "200 g/l", contohProduk: "Fiproline 200 SC", sumber: "Medion Ardhika Bhakti" },
    ],
    alami: [{ nama: "Batang tembakau", jenis: "nabati", keterangan: "Dimanfaatkan petani sebagai pestisida nabati penggerek batang padi.", sumber: "Repository Kementan", diujiPadaHamaIni: true }],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  4: {
    judulDokumen: "Yellow rice borer (Scirpophaga incertulas, penggerek batang kuning)",
    kimia: [
      { bahanAktif: "Abamektin", kadar: "18 g/l", contohProduk: "ABACEL 18 EC", sumber: "Paper uji efektivitas insektisida, BisaTani, Happy Tani" },
      { bahanAktif: "Spinetoram + Metoksifenozida", kadar: "60 g/l + 300 g/l", contohProduk: "Tenano 360 SC", sumber: "BisaTani" },
      KATANA,
    ],
    alami: [{ nama: "Ekstrak daging buah maja (konsentrasi 60%)", jenis: "nabati", keterangan: "Diuji pada penggerek batang padi kuning.", sumber: "Digilib UIN Sunan Ampel", diujiPadaHamaIni: true }],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  5: {
    judulDokumen: "Rice gall midge (Orseolia oryzae, hama ganjur)",
    kimia: [{ bahanAktif: "Imidakloprid", kadar: "sesuai label", contohProduk: "Confidor, Avidor 25 WP", sumber: "bisatani.com" }],
    alami: [],
    bahanTercatatKebal: [],
    catatanData: ["Belum ditemukan sumber pestisida nabati terverifikasi untuk hama ini."],
  },
  6: {
    judulDokumen: "Rice Stemfly (Atherigona spp., lalat batang padi)",
    kimia: [
      { bahanAktif: "Karbosulfan", kadar: "250 g/l", contohProduk: "MARSHAL 25 DS", sumber: "PT Zona Agro Jaya" },
      { bahanAktif: "Dimehipo", kadar: "400 g/l", contohProduk: "SPONTAN 400 SL", sumber: "E-commerce" },
    ],
    alami: [NEMATODA_ATHERIGONA],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  7: {
    judulDokumen: "Brown plant hopper (Nilaparvata lugens, wereng batang coklat)",
    kimia: [
      { bahanAktif: "Dinotefuran", kadar: "250 g/l", contohProduk: "FLYTOP 250 OD", sumber: "repository.ub.ac.id" },
      PLENUM,
      LUGEN,
      ALDES,
    ],
    alami: [{ nama: "Ekstrak daun mimba 30%", jenis: "nabati", keterangan: "Diuji pada wereng batang coklat.", sumber: "Jurnal UNPATTI", diujiPadaHamaIni: true }],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  8: {
    judulDokumen: "White backed plant hopper (Sogatella furcifera, wereng punggung putih)",
    kimia: [PLENUM, { bahanAktif: "BPMC (fenobukarb)", kadar: "480 g/l", contohProduk: "Bassa 500 EC", sumber: "PT Petrokimia Kayaku" }, LUGEN, ALDES],
    alami: [MIMBA_WERENG_KERABAT],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  9: {
    judulDokumen: "Small brown plant hopper (Laodelphax striatellus, wereng kecil)",
    kimia: [{ bahanAktif: "Buprofezin", kadar: "200 g/l", contohProduk: "-", sumber: "Engebiotech" }],
    alami: [MIMBA_WERENG_KERABAT],
    bahanTercatatKebal: [
      "Asefat", "Karbaril", "Klorpirifos", "Deltametrin", "Deltametrin + PBO", "Diazinon", "Etiprol", "Fenitrotion", "Fention", "Fipronil",
      "Imidakloprid", "Imidakloprid + PBO", "Lindan", "Malation", "Metolkarb", "Paration-metil", "Fentoat", "Propoksur", "Triflumezopirim",
    ],
    catatanData: [
      "Daftar 19 bahan lain di dokumen bersumber dari pesticideresistance.org, yaitu basis data laporan KEKEBALAN hama. Artinya hama ini pernah tercatat kebal terhadap bahan tersebut, sehingga tidak ditampilkan sebagai rekomendasi.",
    ],
  },
  10: {
    judulDokumen: "Rice water weevil (Lissorhoptrus oryzophilus, kumbang air padi)",
    kimia: [
      { bahanAktif: "Klorantraniliprol", kadar: "625 g/l", contohProduk: "Lumivia", sumber: "J. Integrated Pest Management (academic.oup.com)" },
      { bahanAktif: "Lambda-sihalotrin", kadar: "-", contohProduk: "-", sumber: "lsuagcenter.com" },
      { bahanAktif: "Fipronil", kadar: "-", contohProduk: "-", sumber: "Oxford Academic" },
    ],
    alami: [],
    bahanTercatatKebal: [],
    catatanData: ["Belum ditemukan sumber pestisida nabati terverifikasi untuk hama ini."],
  },
  11: {
    judulDokumen: "Rice leafhopper (Nephotettix virescens, wereng hijau)",
    kimia: [
      { bahanAktif: "Pimetrozin", kadar: "500 g/l", contohProduk: "Plenum 50 WG", sumber: "saprodi.id" },
      { bahanAktif: "Lambda-sihalotrin", kadar: "-", contohProduk: "-", sumber: "Uji efektivitas pestisida" },
      { bahanAktif: "Pimetrozin + Dinotefuran", kadar: "400 g/l + 200 g/l", contohProduk: "Mestran 40/20 WG", sumber: "Asterindo" },
      { bahanAktif: "Tiametoksam", kadar: "sesuai label", contohProduk: "Actara 25 WG, Virtako 40 WG, Cruiser 350 FS, dan lainnya", sumber: "Uji efektivitas pestisida" },
    ],
    alami: [
      { nama: "Ekstrak daun mimba 20%", jenis: "nabati", keterangan: "Diuji pada wereng hijau.", sumber: "Jurnal UNMAS", diujiPadaHamaIni: true },
      { nama: "Ekstrak daun limau kuit dan daun gelinggang", jenis: "nabati", keterangan: "Diuji pada wereng hijau.", sumber: "Jurnal ULM (Mardiana dan Irianti, 2024)", diujiPadaHamaIni: true },
    ],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  12: {
    judulDokumen: "Grain spreader thrips (Stenchaetothrips biformis, thrips padi)",
    kimia: [
      { bahanAktif: "Azadiraktin", kadar: "1,5 g/l", contohProduk: "-", sumber: "Tamil Nadu Agricultural University" },
      { bahanAktif: "Tiametoksam", kadar: "226,3 g/l", contohProduk: "Cruiser", sumber: "Syngenta" },
    ],
    alami: [{ nama: "Ekstrak daun mimba (azadiraktin)", jenis: "nabati", keterangan: "Bahan aktif nabati yang juga tercantum di tabel kimia.", sumber: "Tamil Nadu Agricultural University", diujiPadaHamaIni: true }],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  13: {
    judulDokumen: "Rice shell pest (Pomacea canaliculata, keong mas)",
    kimia: [
      { bahanAktif: "Moluskisida ekstrak etanol biji pinang muda", kadar: "300 g/l", contohProduk: "-", sumber: "Universitas Samudra" },
      { bahanAktif: "Fentin asetat", kadar: "600 g/l", contohProduk: "Astana 60 WP", sumber: "Universitas Andalas, PT Petrokimia" },
      { bahanAktif: "Niklosamida", kadar: "250 g/l", contohProduk: "Seldene 250 EC", sumber: "Kayaku" },
      { bahanAktif: "Metaldehida", kadar: "60 g/l", contohProduk: "Goldensnail 6 PL", sumber: "Kayaku, E-commerce" },
    ],
    alami: [
      { nama: "Serbuk biji pinang muda + daun pepaya", jenis: "nabati", keterangan: "Diuji pada keong mas di tanaman padi.", sumber: "Jurnal UNIGA", diujiPadaHamaIni: true },
      { nama: "Serbuk atau ekstrak biji pinang", jenis: "nabati", keterangan: "Diuji pada keong mas di tanaman padi.", sumber: "Jurnal UNISDA", diujiPadaHamaIni: true },
      { nama: "Ekstrak kulit buah jengkol", jenis: "nabati", keterangan: "Diuji pada keong mas di tanaman padi.", sumber: "Jurnal UNMA (Agrivet)", diujiPadaHamaIni: true },
    ],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  14: {
    judulDokumen: "Corn borer (Ostrinia furnacalis, penggerek batang jagung)",
    kimia: [
      { bahanAktif: "Klorantraniliprol", kadar: "50 g/l (SC), atau 185 sampai 200 g/l (SC lain)", contohProduk: "Klorantraniliprol 18,5% SC, 200 g/l SC", sumber: "Chlorantraniliprole: a new insecticide effective for the control of Asian corn borer" },
      { bahanAktif: "Triazofos + Foksim", kadar: "50 g/l + 220 g/l (aplikasi 500 sampai 650 ml/ha)", contohProduk: "Triazophos 5% + Phoxim 22% EC", sumber: "Insektisida spektrum luas untuk perlindungan tanaman" },
    ],
    alami: [
      { nama: "Ekstrak umbi bawang", jenis: "nabati", keterangan: "Uji in vitro pada penggerek batang jagung.", sumber: "Repository UBB", diujiPadaHamaIni: true },
      { nama: "Pestisida nabati penggerek batang jagung", jenis: "nabati", keterangan: "Penerapan di petani jagung Karo.", sumber: "Jurnal UM Tapanuli Selatan", diujiPadaHamaIni: true },
    ],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  15: {
    judulDokumen: "Army worm (Spodoptera frugiperda, FAW / ulat grayak)",
    kimia: [{ bahanAktif: "Emamektin benzoat", kadar: "57 g/l", contohProduk: "Siklon 5,7 WG", sumber: "Nufarm, ulat FAW" }],
    alami: [
      { nama: "Ekstrak daun kemangi", jenis: "nabati", keterangan: "Mortalitas tertinggi 77,5% pada ulat grayak jagung.", sumber: "Repository UPN Jatim", diujiPadaHamaIni: false },
      { nama: "Ekstrak daun gamal", jenis: "nabati", keterangan: "Diuji pada ulat grayak jagung.", sumber: "Jurnal UNG", diujiPadaHamaIni: false },
      { nama: "Ekstrak rimpang kencur", jenis: "nabati", keterangan: "Diuji pada ulat grayak jagung.", sumber: "Jurnal Janabadra", diujiPadaHamaIni: false },
    ],
    bahanTercatatKebal: [],
    catatanData: ["Dokumen merujuk Spodoptera frugiperda (ulat grayak jagung), sedangkan kelas model adalah Mythimna separata. Keduanya ulat pemakan daun jagung, tetapi spesiesnya berbeda."],
  },
  16: {
    judulDokumen: "Aphids (Rhopalosiphum maidis, kutu daun)",
    kimia: [
      { bahanAktif: "Imidakloprid", kadar: "200 g/l", contohProduk: "Confidor 200 SL", sumber: "PT Bayer" },
      { bahanAktif: "Dimetoat", kadar: "400 g/l", contohProduk: "Dimethoate 400 EC", sumber: "MPLK Politani" },
      { bahanAktif: "Esfenvalerat", kadar: "84 g/l", contohProduk: "Asana XL", sumber: "MPLK Politani" },
    ],
    alami: [
      { nama: "Ekstrak daun pepaya", jenis: "nabati", keterangan: "Diuji pada kutu daun Aphis gossypii di terung (kerabat dekat).", sumber: "Repository UMA", diujiPadaHamaIni: false },
      { nama: "Ekstrak daun sirsak", jenis: "nabati", keterangan: "Diuji pada kutu daun Aphis gossypii (kerabat dekat).", sumber: "Jurnal UNPAS (Biosfer)", diujiPadaHamaIni: false },
    ],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  17: ULAT_TANAH,
  18: ULAT_TANAH,
  19: ULAT_TANAH,
  20: {
    judulDokumen: "Grub / uret (larva kumbang tanah)",
    kimia: [{ bahanAktif: "Karbofuran", kadar: "30 g/l", contohProduk: "Furadan 3 GR", sumber: "Saprodi Indonesia, Kliktani" }],
    alami: [],
    bahanTercatatKebal: [],
    catatanData: ["Belum ditemukan sumber pestisida nabati terverifikasi untuk hama ini."],
  },
  21: {
    judulDokumen: "Orong-orong / Mole cricket (Gryllotalpa spp.)",
    kimia: [
      { bahanAktif: "Karbosulfan", kadar: "200 g/l", contohProduk: "Marshal 200 EC", sumber: "Dinas Pertanian Buleleng, Politani" },
      { bahanAktif: "Fipronil", kadar: "3 g/l", contohProduk: "Regent 0,3 GR", sumber: "Balai Penelitian Kementan (2012)" },
    ],
    alami: [PERANGKAP_LAMPU],
    bahanTercatatKebal: [],
    catatanData: [],
  },
  22: {
    judulDokumen: "Wireworm (larva kumbang klik)",
    kimia: [
      { bahanAktif: "Fluksametamida", kadar: "103 g/l", contohProduk: "Gracia 103 EC", sumber: "Nufarm (halaman ulat grayak)" },
      { bahanAktif: "Emamektin benzoat", kadar: "57 g/l", contohProduk: "Siklon 5,7 WG", sumber: "Nufarm" },
    ],
    alami: [],
    bahanTercatatKebal: [],
    catatanData: [
      "Belum ditemukan sumber pestisida nabati terverifikasi untuk hama ini.",
      "Sumber kedua produk adalah halaman produk untuk ulat, bukan uret kawat. Efektivitasnya pada uret kawat perlu dikonfirmasi ke PPL.",
    ],
  },
  23: {
    judulDokumen: "Thrips / Trips (Thrips tabaci)",
    kimia: [
      { bahanAktif: "Diafentiuron", kadar: "500 g/l", contohProduk: "Pegasus 500 SC", sumber: "Syngenta, Kliktani" },
      { bahanAktif: "Tiametoksam + Abamektin", kadar: "72 g/l + 36 g/l", contohProduk: "SOLVIGO", sumber: "Syngenta" },
      { bahanAktif: "Spinetoram", kadar: "120 g/l", contohProduk: "Radiant", sumber: "Oxford Research, efektivitas spinetoram" },
      { bahanAktif: "Abamektin", kadar: "20 g/l", contohProduk: "Indomektin 20 EC", sumber: "Kementan (2012)" },
      { bahanAktif: "Alfa-sipermetrin", kadar: "100 g/l", contohProduk: "Fast 100 EC", sumber: "Kementan (2012)" },
      { bahanAktif: "Kartap hidroklorida", kadar: "500 g/l", contohProduk: "Padan 50 SP", sumber: "Kementan (2012)" },
      { bahanAktif: "Klorpirifos", kadar: "200 g/l", contohProduk: "Clobber 200 EC", sumber: "Kementan (2012)" },
      { bahanAktif: "Permetrin", kadar: "50 g/l", contohProduk: "Perkill 50 EC", sumber: "Kementan (2012)" },
      { bahanAktif: "Piraklofos", kadar: "560 g/l", contohProduk: "Voltage 560 EC", sumber: "Kementan (2012)" },
    ],
    alami: [
      { nama: "Campuran bawang putih, bawang merah, dan bubuk cabai", jenis: "nabati", keterangan: "Efek pengusir (repellent) dan penghambat makan.", sumber: "Kementan KIKP Bapeltan Lampung", diujiPadaHamaIni: true },
      { nama: "Ekstrak daun paitan (Tithonia)", jenis: "nabati", keterangan: "Diuji pada thrips di tanaman kentang.", sumber: "Jurnal UNRAM", diujiPadaHamaIni: false },
    ],
    bahanTercatatKebal: [],
    catatanData: [],
  },
};

/**
 * Referensi tambahan dari dokumen yang TIDAK termasuk 24 kelas model:
 * Ulat bawang (Spodoptera exigua). Dokumen bertanya "apakah wireworm?", jawabannya bukan:
 * wireworm adalah larva kumbang klik (Elateridae), sedangkan ulat bawang adalah larva ngengat.
 * Ditampilkan di Kamus Hama sebagai pengetahuan, bukan hasil deteksi.
 */
export const REFERENSI_ULAT_BAWANG: ReferensiPengendalian = {
  judulDokumen: "Ulat bawang (Spodoptera exigua)",
  kimia: [
    ["Alfa-sipermetrin", "36 sampai 100 g/l", "Alcove 50 EC, Fast 100 EC"],
    ["Asefat", "250 sampai 750 g/l", "Dafat 250 EC, Manthene 75 SP"],
    ["Bacillus thuringiensis", "sesuai label", "Delfin WG"],
    ["Beta-siflutrin", "25 sampai 250 g/l", "Betathrin 250 EC, Bissa 50 EC"],
    ["Bifentrin", "25 g/l", "Talstar 25 EC"],
    ["Deltametrin", "25 g/l", "Basic 25 EC, Decis 25 EC"],
    ["Deltametrin + Triazofos", "210 g/l", "Sidathion 210 EC"],
    ["Diafentiuron", "500 g/l", "Pegasus 500 EC"],
    ["Emamektin benzoat", "10 g/l", "Crumble 10 EC"],
    ["Esfenvalerat", "25 g/l", "Sumialpha 25 EC"],
    ["Etofenproks", "95 g/l", "Trebon 95 EC"],
    ["Fenitrotion", "500 g/l", "Sumithion 500 EC"],
    ["Fenobukarb", "110 sampai 500 g/l", "Dharmabas 500 EC, Gobang 110 EC"],
    ["Fenpropatrin", "50 g/l", "Fenthrin 50 EC, Meothrin 50 EC"],
    ["Fenvalerat", "200 g/l", "Fenval 200 EC"],
    ["Flufenoksuron", "50 g/l", "Cascade 50 EC"],
    ["Imidakloprid", "100 sampai 200 g/l", "Folidol 10 WP, Folidol 200 SL"],
    ["Indoksakarb", "150 g/l", "Ammate 150 SC"],
    ["Karbaril", "850 g/l", "Petrovin 85 WP"],
    ["Karbofuran", "30 sampai 50 g/l", "Dharmafur 3 GR, Ventura 5 GR"],
    ["Karbosulfan", "200 g/l", "Borsal 200 EC, Marshal 200 EC"],
    ["Kartap hidroklorida", "500 g/l", "Kristal 50 WP, Padan 50 SP"],
    ["Klorantraniliprol", "50 g/l", "Prevathon 50 SC"],
    ["Klorantraniliprol + Lambda-sihalotrin", "150 g/l", "Ampligo 150 ZC"],
    ["Klorantraniliprol + Tiametoksam", "300 g/l", "Virtako 300 SC"],
    ["Klorfenapir", "100 g/l", "Rampage 100 SC, Tumagon 100 EC"],
    ["Klorfluazuron", "50 g/l", "Atabron 50 EC"],
    ["Klorpirifos", "200 sampai 410 g/l", "Ban-drol 400 EC, Beliung 200 EC"],
    ["Lambda-sihalotrin", "25 sampai 55 g/l", "Buana 55 EC, Global 55 EC"],
    ["Lufenuron", "50 g/l", "Catapult 50 EC, Match 50 EC"],
    ["Metaflumizon", "240 g/l", "Alverde 240 SC"],
    ["Metidation", "250 g/l", "Supracide 25 WP"],
    ["Metomil", "80 sampai 400 g/l", "Bomba 25 WP, Dangke 40 WP"],
    ["Novaluron", "100 g/l", "Rimon 100 EC"],
    ["Permetrin", "20 sampai 200 g/l", "Klensect 200 EC, Pentatrin 20 EC"],
    ["Fentoat", "600 g/l", "Dharmasan 600 EC"],
    ["Profenofos", "500 sampai 510 g/l", "Biocron 500 EC, Indocron 500 EC"],
    ["Propoksur", "200 g/l", "Poksindo 200 EC"],
    ["Protiofos", "500 g/l", "Tokuthion 500 EC"],
    ["Piraklofos", "560 g/l", "Voltage 560 EC"],
    ["Siflutrin", "50 g/l", "Kastuba 50 EC"],
    ["Sipermetrin", "30 sampai 311 g/l", "Arrivo 30 EC, Copa 100 EC"],
    ["Spinosad", "120 g/l", "Tracer 120 SC"],
    ["Tiodikarb", "750 g/l", "Larvin 75 WP"],
    ["Triazofos", "200 g/l", "Arcodion 200 EC, Biothion 200 EC, Hostathion 200 EC"],
    ["Zeta-sipermetrin", "50 g/l", "Fury 50 EC"],
  ].map(([bahanAktif, kadar, contohProduk]) => ({ bahanAktif, kadar, contohProduk, sumber: "Kementan (2012)" })),
  alami: [
    {
      nama: "Ekoenzim dan bahan nabati lain (serai, tembakau, bawang putih, maja)",
      jenis: "nabati",
      keterangan: "Diuji pada budidaya bawang merah. Hasil efektivitasnya perlu dicek di jurnal.",
      sumber: "Jurnal UST",
      diujiPadaHamaIni: true,
    },
  ],
  bahanTercatatKebal: [],
  catatanData: ["Ulat bawang belum termasuk 24 kelas yang dikenali model, dan bukan wireworm (wireworm adalah larva kumbang klik)."],
};

// ---------------------------------------------------------------------------
// Fungsi bantu
// ---------------------------------------------------------------------------
export function ambilReferensiPengendalian(classId: number): ReferensiPengendalian {
  return REFERENSI_PER_KELAS[classId] ?? { judulDokumen: "", kimia: [], alami: [], bahanTercatatKebal: [], catatanData: [] };
}

export interface BahanKimiaTerperiksa extends BahanKimia {
  larangan: AturanLarangan | null;
}

export function periksaDaftarKimia(daftar: BahanKimia[], komoditas: JenisKomoditas): BahanKimiaTerperiksa[] {
  return daftar.map((b) => ({ ...b, larangan: cekLarangan(b.bahanAktif, komoditas) }));
}

/** Ringkasan siap pakai untuk satu kelas: kimia yang boleh, kimia terlarang, cara alami */
export function ringkasPengendalian(classId: number) {
  const kelas = DAFTAR_KELAS_HAMA[classId];
  const referensi = ambilReferensiPengendalian(classId);
  const terperiksa = periksaDaftarKimia(referensi.kimia, kelas?.komoditas ?? "Padi");
  return {
    referensi,
    kimiaBoleh: terperiksa.filter((b) => !b.larangan),
    kimiaTerlarang: terperiksa.filter((b) => b.larangan),
    alami: referensi.alami,
  };
}

/** Bentuk yang sama dengan rekomendasi_pestisida di POST /detect, hanya bahan yang boleh dipakai */
export function keRekomendasiApi(classId: number): RekomendasiPestisida[] {
  const kelas = DAFTAR_KELAS_HAMA[classId];
  if (!kelas) return [];
  return ringkasPengendalian(classId).kimiaBoleh.map((b) => ({
    nama_hama_inggris: kelas.namaIp102,
    nama_ilmiah: kelas.namaIlmiah,
    bahan_aktif: b.bahanAktif,
    dosis: b.kadar,
    contoh_produk: b.contohProduk,
  }));
}

export const LABEL_JENIS_ALAMI: Record<JenisCaraAlami, string> = {
  nabati: "Pestisida nabati",
  hayati: "Pengendalian hayati",
  mekanis: "Cara mekanis",
};
