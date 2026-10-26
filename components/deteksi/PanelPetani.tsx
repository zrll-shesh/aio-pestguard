"use client";

import { CalendarClock, CheckCircle2, Clock3, MapPin, Sprout, TriangleAlert, Users, XCircle, Zap } from "lucide-react";
import type { JawabanPetani, WarnaStatus } from "@/lib/model/wawasanPetani";
import type { RingkasanKelasTerdeteksi } from "@/lib/model/wawasanPrediksi";
import { ambilPanduanKelompok, WARNA_KOMODITAS } from "@/lib/model/kelasHama";
import type { Teks3 } from "@/lib/i18n/bahasa";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import BlokPengendalian from "@/components/pengendalian/BlokPengendalian";

// ---------------------------------------------------------------------------
// Langkah bertingkat: sekarang, beberapa hari ke depan, mencegah ke depan
// ---------------------------------------------------------------------------
export function PanelLangkahPetani({ jawaban }: { jawaban: JawabanPetani }) {
  const { p } = useBahasa();
  const kolom = [
    {
      judul: p({ id: "Lakukan sekarang", en: "Do now", ko: "지금 할 일" }),
      keterangan: p({ id: "hari ini, sebelum memutuskan apa pun", en: "today, before deciding anything", ko: "오늘, 무엇을 결정하기 전에" }),
      Ikon: Zap,
      isi: jawaban.langkah.sekarang,
      aksen: "bg-pestguardHijauUtama text-white",
    },
    {
      judul: p({ id: "Beberapa hari ke depan", en: "Next few days", ko: "앞으로 며칠" }),
      keterangan: p({ id: "bila hama memang ada di tanaman", en: "if the pest is really on the plants", ko: "작물에 해충이 정말 있다면" }),
      Ikon: CalendarClock,
      isi: jawaban.langkah.beberapaHari,
      aksen: "bg-pestguardHijauLembut text-pestguardHijauUtama",
    },
    {
      judul: p({ id: "Mencegah ke depan", en: "Prevent next time", ko: "다음을 위한 예방" }),
      keterangan: p({ id: "supaya tidak terulang", en: "so it does not happen again", ko: "다시 생기지 않도록" }),
      Ikon: Sprout,
      isi: jawaban.langkah.pencegahan,
      aksen: "bg-pestguardHijauPudar text-pestguardHijauSedang",
    },
  ];
  return (
    <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <h2 className="font-pestguardDisplay text-[19px] font-semibold text-pestguardHijauTua">{p({ id: "Apa yang sebaiknya dilakukan", en: "What to do", ko: "무엇을 해야 할까" })}</h2>
      <p className="mt-1 text-[14px] text-pestguardAbuTeks">
        {p({ id: "Urut dari yang paling dulu. Mulai dari memastikan, baru mengendalikan.", en: "In order. Confirm first, then control.", ko: "순서대로 하세요. 먼저 확인하고, 그다음 방제합니다." })}
      </p>
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
// Daftar cek: lampu lalu lintas
// ---------------------------------------------------------------------------
export const GAYA_LAMPU: Record<WarnaStatus, { Ikon: typeof CheckCircle2; warna: string; latar: string; label: Teks3 }> = {
  hijau: { Ikon: CheckCircle2, warna: "text-pestguardHijauUtama", latar: "bg-pestguardHijauLembut", label: { id: "Baik", en: "Good", ko: "양호" } },
  kuning: { Ikon: TriangleAlert, warna: "text-pestguardKuningPeringatan", latar: "bg-amber-50", label: { id: "Perhatikan", en: "Note", ko: "주의" } },
  merah: { Ikon: XCircle, warna: "text-pestguardMerahPeringatan", latar: "bg-red-50", label: { id: "Hati-hati", en: "Careful", ko: "조심" } },
};

export function PanelCekPetani({ jawaban }: { jawaban: JawabanPetani }) {
  const { p } = useBahasa();
  const jumlahHijau = jawaban.daftarCek.filter((c) => c.status === "hijau").length;
  return (
    <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-pestguardDisplay text-[19px] font-semibold text-pestguardHijauTua">{p({ id: "Bisakah hasil ini dipercaya?", en: "Can this result be trusted?", ko: "이 결과를 믿어도 될까?" })}</h2>
          <p className="mt-1 text-[14px] text-pestguardAbuTeks">
            {p({ id: "Hijau berarti aman, kuning dan merah berarti perlu dicek langsung.", en: "Green is fine; yellow and red mean check in person.", ko: "초록은 괜찮음, 노랑과 빨강은 직접 확인이 필요하다는 뜻입니다." })}
          </p>
        </div>
        <span className="rounded-full bg-pestguardHijauPudar px-3 py-1 text-[13px] font-semibold text-pestguardHijauTua">
          {p({ id: `${jumlahHijau} dari ${jawaban.daftarCek.length} baik`, en: `${jumlahHijau} of ${jawaban.daftarCek.length} good`, ko: `${jawaban.daftarCek.length}개 중 ${jumlahHijau}개 양호` })}
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
                  {cek.judul} <span className={gabungkanNamaKelas("ml-1 text-[12px] font-bold", gaya.warna)}>{p(gaya.label)}</span>
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
// Kenali hamanya
// ---------------------------------------------------------------------------
function SiklusHidup({ ringkasan }: { ringkasan: RingkasanKelasTerdeteksi }) {
  const { p, tk } = useBahasa();
  const referensi = ringkasan.referensiSiklusHidup;
  if (!referensi) return null;
  const stadiumMuda = referensi.daftarStadiumUrut.filter((s) => !/dewasa/i.test(s.namaStadium));
  const minHari = stadiumMuda.reduce((j, s) => j + s.durasiMinimumHari, 0);
  const maksHari = stadiumMuda.reduce((j, s) => j + s.durasiMaksimumHari, 0);
  const pra = referensi.masaPraOviposisiHari;
  const teksPra = pra ? (pra[0] === pra[1] ? `${pra[0]}` : `${pra[0]}-${pra[1]}`) : null;
  return (
    <div className="mt-4 rounded-xl bg-pestguardHijauPudar p-3.5">
      <h4 className="flex items-center gap-2 text-[14px] font-semibold text-pestguardHijauTua">
        <Clock3 className="h-4 w-4" aria-hidden /> {p({ id: "Siklus hidup", en: "Life cycle", ko: "생활사" })}
      </h4>
      <p className="mt-1 text-[13.5px] leading-relaxed text-pestguardAbuTeks">
        {p({
          id: `Fase muda berlangsung sekitar ${minHari} sampai ${maksHari} hari${teksPra ? `, lalu setelah dewasa mulai bertelur dalam ${teksPra} hari` : ""}. Kendalikan saat masih muda, sebelum sempat bertelur.`,
          en: `The young stages last about ${minHari} to ${maksHari} days${teksPra ? `, and adults start laying eggs within ${teksPra} days` : ""}. Control them while young, before they lay eggs.`,
          ko: `어린 시기는 약 ${minHari}~${maksHari}일이며${teksPra ? `, 성충이 된 뒤 ${teksPra}일 안에 알을 낳기 시작합니다` : ""}. 알을 낳기 전, 어릴 때 방제하세요.`,
        })}
      </p>
      <ol className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {referensi.daftarStadiumUrut.map((stadium) => (
          <li key={stadium.namaStadium} className="min-w-[120px] flex-1 rounded-lg border border-pestguardAbuGaris bg-white p-2">
            <p className="text-[12px] font-semibold leading-tight text-pestguardTeksUtama">{tk(stadium.namaStadium)}</p>
            <p className="mt-1 text-[11.5px] text-pestguardAbuTeks">
              {stadium.durasiMinimumHari === stadium.durasiMaksimumHari ? stadium.durasiMinimumHari : `${stadium.durasiMinimumHari}-${stadium.durasiMaksimumHari}`}{" "}
              {p({ id: "hari", en: "days", ko: "일" })}
            </p>
            <p className="text-[11px] leading-snug text-pestguardAbuTeks">{tk(stadium.keteranganSingkat)}</p>
          </li>
        ))}
      </ol>
      <p className="mt-1 text-[11px] text-pestguardAbuTeks">
        {p({ id: "Sumber", en: "Source", ko: "출처" })}: {tk(referensi.catatanSumber)}
      </p>
    </div>
  );
}

export function PanelKenaliHama({ daftarRingkasan }: { daftarRingkasan: RingkasanKelasTerdeteksi[] }) {
  const { p, tk, komoditas } = useBahasa();
  if (daftarRingkasan.length === 0) return null;
  return (
    <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <h2 className="font-pestguardDisplay text-[19px] font-semibold text-pestguardHijauTua">{p({ id: "Kenali hamanya", en: "Know the pest", ko: "해충 알아보기" })}</h2>
      <p className="mt-1 text-[14px] text-pestguardAbuTeks">
        {p({
          id: "Ciri, tempat mencari, teman petani yang memangsa hama ini, cara alami dan organik, serta obat kimia bila terpaksa.",
          en: "Signs, where to look, the farmer's natural allies, natural and organic methods, and chemicals only if needed.",
          ko: "특징, 찾아볼 곳, 해충을 잡아먹는 농부의 친구(천적), 친환경·유기 방법, 꼭 필요할 때의 화학 약제.",
        })}
      </p>
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
                  <h3 className="font-pestguardDisplay text-[18px] font-semibold text-pestguardHijauTua">{tk(kelas.namaIndonesia)}</h3>
                  <p className="text-[13px] text-pestguardAbuTeks">
                    <span className="italic">{kelas.namaIlmiah}</span> &nbsp;|&nbsp; {tk(kelas.kelompok)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-pestguardAbuGaris px-2.5 py-1 text-[12px] font-semibold text-pestguardTeksUtama">
                  <span className="h-2 w-2 rounded-full" style={{ background: WARNA_KOMODITAS[kelas.komoditas] }} aria-hidden />
                  {komoditas(kelas.komoditas)}, {p({ id: `${ringkasan.jumlah} ekor di foto`, en: `${ringkasan.jumlah} in photo`, ko: `사진 속 ${ringkasan.jumlah}마리` })}
                </span>
              </header>

              <p className="mt-3 text-[14.5px] leading-relaxed text-pestguardTeksUtama">{tk(kelas.gejala)}</p>

              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { Ikon: MapPin, judul: p({ id: "Di mana mencarinya", en: "Where to look", ko: "찾아볼 곳" }), isi: tk(panduan.tempatPeriksa) },
                  { Ikon: Clock3, judul: p({ id: "Kapan memeriksa", en: "When to check", ko: "확인할 때" }), isi: tk(panduan.waktuPeriksa) },
                  { Ikon: Users, judul: p({ id: "Teman petani (musuh alami)", en: "Farmer's allies (natural enemies)", ko: "농부의 친구 (천적)" }), isi: tk(panduan.musuhAlami) },
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

              <div className="mt-5">
                <h4 className="mb-3 font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">{p({ id: "Cara mengendalikan", en: "How to control it", ko: "방제 방법" })}</h4>
                <BlokPengendalian classId={kelas.classId} namaKomoditas={kelas.komoditas} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
