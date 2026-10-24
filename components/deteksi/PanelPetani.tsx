"use client";

import { CalendarClock, CheckCircle2, Clock3, MapPin, ShieldAlert, ShieldCheck, Sprout, TriangleAlert, Users, XCircle, Zap } from "lucide-react";
import type { JawabanPetani, WarnaStatus } from "@/lib/model/wawasanPetani";
import type { RingkasanKelasTerdeteksi } from "@/lib/model/wawasanPrediksi";
import { ambilPanduanKelompok, WARNA_KOMODITAS } from "@/lib/model/kelasHama";
import { gabungkanNamaKelas } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Langkah bertingkat: sekarang, beberapa hari ke depan, mencegah ke depan
// ---------------------------------------------------------------------------
export function PanelLangkahPetani({ jawaban }: { jawaban: JawabanPetani }) {
  const kolom = [
    { judul: "Lakukan sekarang", keterangan: "hari ini, sebelum memutuskan apa pun", Ikon: Zap, isi: jawaban.langkah.sekarang, aksen: "bg-pestguardHijauUtama text-white" },
    { judul: "Beberapa hari ke depan", keterangan: "bila hama memang ada di tanaman", Ikon: CalendarClock, isi: jawaban.langkah.beberapaHari, aksen: "bg-pestguardHijauLembut text-pestguardHijauUtama" },
    { judul: "Mencegah ke depan", keterangan: "supaya tidak terulang", Ikon: Sprout, isi: jawaban.langkah.pencegahan, aksen: "bg-pestguardHijauPudar text-pestguardHijauSedang" },
  ];
  return (
    <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <h2 className="font-pestguardDisplay text-[19px] font-semibold text-pestguardHijauTua">Apa yang sebaiknya dilakukan</h2>
      <p className="mt-1 text-[14px] text-pestguardAbuTeks">Urut dari yang paling dulu. Mulai dari memastikan, baru mengendalikan.</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {kolom.map(({ judul, keterangan, Ikon, isi, aksen }) => (
          <div key={judul} className="rounded-2xl border border-pestguardAbuGaris p-4">
            <div className="flex items-center gap-3">
              <span className={gabungkanNamaKelas("grid h-10 w-10 shrink-0 place-items-center rounded-xl", aksen)}>
                <Ikon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-pestguardDisplay text-[15.5px] font-semibold text-pestguardHijauTua">{judul}</h3>
                <p className="text-[12px] text-pestguardAbuTeks">{keterangan}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-2.5">
              {isi.map((langkah) => (
                <li key={langkah} className="flex gap-2.5 text-[14px] leading-relaxed text-pestguardTeksUtama">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-pestguardHijauSedang" aria-hidden />
                  <span>{langkah}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Daftar cek: lampu lalu lintas yang menjelaskan apakah hasil bisa dipercaya
// ---------------------------------------------------------------------------
const GAYA_LAMPU: Record<WarnaStatus, { Ikon: typeof CheckCircle2; warna: string; latar: string; label: string }> = {
  hijau: { Ikon: CheckCircle2, warna: "text-pestguardHijauUtama", latar: "bg-pestguardHijauLembut", label: "Baik" },
  kuning: { Ikon: TriangleAlert, warna: "text-pestguardKuningPeringatan", latar: "bg-amber-50", label: "Perhatikan" },
  merah: { Ikon: XCircle, warna: "text-pestguardMerahPeringatan", latar: "bg-red-50", label: "Hati-hati" },
};

export function PanelCekPetani({ jawaban }: { jawaban: JawabanPetani }) {
  const jumlahHijau = jawaban.daftarCek.filter((c) => c.status === "hijau").length;
  return (
    <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-pestguardDisplay text-[19px] font-semibold text-pestguardHijauTua">Bisakah hasil ini dipercaya?</h2>
          <p className="mt-1 text-[14px] text-pestguardAbuTeks">Hijau berarti aman, kuning dan merah berarti perlu dicek langsung.</p>
        </div>
        <span className="rounded-full bg-pestguardHijauPudar px-3 py-1 text-[13px] font-semibold text-pestguardHijauTua">
          {jumlahHijau} dari {jawaban.daftarCek.length} baik
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {jawaban.daftarCek.map((cek) => {
          const gaya = GAYA_LAMPU[cek.status];
          return (
            <li key={cek.judul} className={gabungkanNamaKelas("flex gap-3 rounded-xl p-3", gaya.latar)}>
              <gaya.Ikon className={gabungkanNamaKelas("mt-0.5 h-5 w-5 shrink-0", gaya.warna)} aria-hidden />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-pestguardTeksUtama">
                  {cek.judul} <span className={gabungkanNamaKelas("ml-1 text-[12px] font-bold", gaya.warna)}>{gaya.label}</span>
                </p>
                <p className="mt-0.5 text-[13.5px] leading-relaxed text-pestguardAbuTeks">{cek.penjelasan}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Kenali hamanya: profil, tempat periksa, musuh alami, siklus hidup, pilihan obat
// ---------------------------------------------------------------------------
const TIPS_AMAN_PESTISIDA = [
  "Baca label dan ikuti dosisnya. Dosis lebih tinggi tidak membuat lebih ampuh, justru mempercepat hama kebal.",
  "Pakai masker, sarung tangan, baju lengan panjang, dan sepatu bot saat mencampur dan menyemprot.",
  "Semprot pagi atau sore, jangan saat angin kencang atau akan hujan.",
  "Perhatikan masa tunggu panen yang tertulis di label.",
];

function SiklusHidup({ ringkasan }: { ringkasan: RingkasanKelasTerdeteksi }) {
  const referensi = ringkasan.referensiSiklusHidup;
  if (!referensi) return null;
  const stadiumMuda = referensi.daftarStadiumUrut.filter((s) => !/dewasa/i.test(s.namaStadium));
  const minHari = stadiumMuda.reduce((j, s) => j + s.durasiMinimumHari, 0);
  const maksHari = stadiumMuda.reduce((j, s) => j + s.durasiMaksimumHari, 0);
  return (
    <div className="mt-4 rounded-xl bg-pestguardHijauPudar p-3.5">
      <h4 className="flex items-center gap-2 text-[14px] font-semibold text-pestguardHijauTua">
        <Clock3 className="h-4 w-4" aria-hidden /> Siklus hidup
      </h4>
      <p className="mt-1 text-[13.5px] leading-relaxed text-pestguardAbuTeks">
        Fase muda berlangsung sekitar <span className="font-semibold text-pestguardTeksUtama">{minHari} sampai {maksHari} hari</span>
        {referensi.masaPraOviposisiHari &&
          `, lalu setelah dewasa mulai bertelur dalam ${referensi.masaPraOviposisiHari[0]}${referensi.masaPraOviposisiHari[1] !== referensi.masaPraOviposisiHari[0] ? ` sampai ${referensi.masaPraOviposisiHari[1]}` : ""} hari`}
        . Kendalikan saat masih muda, sebelum sempat bertelur.
      </p>
      <ol className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {referensi.daftarStadiumUrut.map((stadium) => (
          <li key={stadium.namaStadium} className="min-w-[120px] flex-1 rounded-lg border border-pestguardAbuGaris bg-white p-2">
            <p className="text-[12px] font-semibold leading-tight text-pestguardTeksUtama">{stadium.namaStadium}</p>
            <p className="mt-1 text-[11.5px] text-pestguardAbuTeks">
              {stadium.durasiMinimumHari === stadium.durasiMaksimumHari ? stadium.durasiMinimumHari : `${stadium.durasiMinimumHari}-${stadium.durasiMaksimumHari}`} hari
            </p>
            <p className="text-[11px] leading-snug text-pestguardAbuTeks">{stadium.keteranganSingkat}</p>
          </li>
        ))}
      </ol>
      <p className="mt-1 text-[11px] text-pestguardAbuTeks">Sumber: {referensi.catatanSumber}</p>
    </div>
  );
}

export function PanelKenaliHama({ daftarRingkasan }: { daftarRingkasan: RingkasanKelasTerdeteksi[] }) {
  if (daftarRingkasan.length === 0) return null;
  return (
    <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <h2 className="font-pestguardDisplay text-[19px] font-semibold text-pestguardHijauTua">Kenali hamanya</h2>
      <p className="mt-1 text-[14px] text-pestguardAbuTeks">Ciri, tempat mencari, teman petani yang memangsa hama ini, dan pilihan obat bila terpaksa.</p>
      <div className="mt-4 space-y-4">
        {daftarRingkasan.map((ringkasan) => {
          const { kelas } = ringkasan;
          const panduan = ambilPanduanKelompok(kelas);
          return (
            <article key={kelas.classId} className="rounded-2xl border border-pestguardAbuGaris p-4 sm:p-5">
              <header className="flex flex-wrap items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pestguardHijauLembut text-2xl" aria-hidden>
                  {panduan.ikonEmoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-pestguardDisplay text-[18px] font-semibold text-pestguardHijauTua">{kelas.namaIndonesia}</h3>
                  <p className="text-[13px] text-pestguardAbuTeks">
                    <span className="italic">{kelas.namaIlmiah}</span> &nbsp;|&nbsp; kelompok {kelas.kelompok.toLowerCase()}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-pestguardAbuGaris px-2.5 py-1 text-[12px] font-semibold text-pestguardTeksUtama">
                  <span className="h-2 w-2 rounded-full" style={{ background: WARNA_KOMODITAS[kelas.komoditas] }} aria-hidden />
                  {kelas.komoditas}, {ringkasan.jumlah} ekor di foto
                </span>
              </header>

              <p className="mt-3 text-[14.5px] leading-relaxed text-pestguardTeksUtama">{kelas.gejala}</p>

              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { Ikon: MapPin, judul: "Di mana mencarinya", isi: panduan.tempatPeriksa },
                  { Ikon: Clock3, judul: "Kapan memeriksa", isi: panduan.waktuPeriksa },
                  { Ikon: Users, judul: "Teman petani (musuh alami)", isi: panduan.musuhAlami },
                ].map(({ Ikon, judul, isi }) => (
                  <div key={judul} className="rounded-xl border border-pestguardAbuGaris p-3">
                    <dt className="flex items-center gap-1.5 text-[13px] font-semibold text-pestguardHijauTua">
                      <Ikon className="h-4 w-4" aria-hidden /> {judul}
                    </dt>
                    <dd className="mt-1 text-[13.5px] leading-relaxed text-pestguardAbuTeks">{isi}</dd>
                  </div>
                ))}
              </dl>

              <SiklusHidup ringkasan={ringkasan} />

              <div className="mt-4">
                <h4 className="flex items-center gap-2 text-[14px] font-semibold text-pestguardHijauTua">
                  {ringkasan.pestisida.length ? <ShieldCheck className="h-4 w-4" aria-hidden /> : <ShieldAlert className="h-4 w-4" aria-hidden />}
                  Pilihan obat dari referensi AIGRA
                </h4>
                {ringkasan.pestisida.length === 0 ? (
                  <p className="mt-1 text-[13.5px] leading-relaxed text-pestguardAbuTeks">
                    Belum ada di referensi sistem. Utamakan cara tanpa obat di atas, dan tanyakan pilihan obat yang terdaftar ke penyuluh pertanian (PPL).
                  </p>
                ) : (
                  <>
                    <p className="mt-1 text-[13px] text-pestguardAbuTeks">Hanya bila hama terbukti banyak di lahan. Ganti-ganti bahan aktif antar penyemprotan.</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {ringkasan.pestisida.map((p) => (
                        <div key={p.bahan_aktif + p.contoh_produk} className="rounded-xl border border-pestguardAbuGaris p-3">
                          <p className="text-[14px] font-semibold text-pestguardTeksUtama">{p.bahan_aktif}</p>
                          <p className="mt-0.5 text-[12.5px] text-pestguardAbuTeks">Kadar {p.dosis}</p>
                          <p className="text-[12.5px] text-pestguardAbuTeks">Contoh merek: {p.contoh_produk}</p>
                        </div>
                      ))}
                    </div>
                    <ul className="mt-3 space-y-1.5 rounded-xl bg-amber-50 p-3">
                      {TIPS_AMAN_PESTISIDA.map((tip) => (
                        <li key={tip} className="flex gap-2 text-[13px] leading-relaxed text-amber-900">
                          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
