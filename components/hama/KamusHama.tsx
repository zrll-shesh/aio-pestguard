"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Clock3, MapPin, ScanSearch, Search, Users } from "lucide-react";
import {
  DAFTAR_KELAS_HAMA,
  WARNA_KOMODITAS,
  ambilPanduanKelompok,
  tentukanStatusKeandalan,
} from "@/lib/model/kelasHama";
import { ambilReferensiPengendalian } from "@/lib/model/referensiPestisida";
import BlokPengendalian from "@/components/pengendalian/BlokPengendalian";
import { InfoLarangan, ReferensiUlatBawang } from "./InfoPestisida";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import type { Teks3 } from "@/lib/i18n/bahasa";

const PILIHAN_KOMODITAS = ["Semua", "Padi", "Jagung", "Bawang"] as const;

const LABEL_KEANDALAN = {
  teruji_baik: { teks: { id: "Sistem sudah mahir", en: "System is reliable", ko: "인식 우수" } as Teks3, kelas: "bg-pestguardHijauLembut text-pestguardHijauUtama" },
  perlu_verifikasi: { teks: { id: "Sistem kadang keliru", en: "System sometimes wrong", ko: "가끔 오인식" } as Teks3, kelas: "bg-amber-50 text-pestguardKuningPeringatan" },
  belum_teruji: { teks: { id: "Belum diuji", en: "Not yet tested", ko: "미검증" } as Teks3, kelas: "bg-gray-100 text-pestguardAbuTeks" },
} as const;

export default function KamusHama() {
  const { p, tk, komoditas: namaKom } = useBahasa();
  const [kataCari, setKataCari] = useState("");
  const [komoditas, setKomoditas] = useState<(typeof PILIHAN_KOMODITAS)[number]>("Semua");
  const [terbuka, setTerbuka] = useState<number | null>(null);

  const daftar = useMemo(() => {
    const kunci = kataCari.trim().toLowerCase();
    return DAFTAR_KELAS_HAMA.filter(
      (k) =>
        (komoditas === "Semua" || k.komoditas === komoditas) &&
        (!kunci ||
          [
            k.namaIndonesia,
            tk(k.namaIndonesia),
            k.namaIlmiah,
            k.namaIp102,
            tk(k.kelompok),
            k.gejala,
            tk(k.gejala),
            ...ambilReferensiPengendalian(k.classId).alami.flatMap((a) => [a.nama, tk(a.nama)]),
            ...ambilReferensiPengendalian(k.classId).kimia.map((b) => b.bahanAktif),
          ].some((t) => t.toLowerCase().includes(kunci)))
    );
  }, [kataCari, komoditas, tk]);

  return (
    <div className="space-y-4">
      <InfoLarangan />
      <div className="flex flex-col gap-3 rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-4 shadow-pestguardKartu sm:flex-row sm:items-center">
        <label className="flex min-h-[46px] flex-1 items-center gap-2 rounded-xl border border-pestguardAbuGaris px-3 focus-within:border-pestguardHijauSedang">
          <Search className="h-4 w-4 text-pestguardAbuTeks" aria-hidden />
          <span className="sr-only">{p({ id: "Cari hama", en: "Search pests", ko: "해충 검색" })}</span>
          <input
            value={kataCari}
            onChange={(e) => setKataCari(e.target.value)}
            placeholder={p({ id: "Cari hama, gejala, atau bahan, misalnya: mimba", en: "Search pest, symptom, or ingredient, e.g. neem", ko: "해충, 증상, 성분 검색 (예: 님)" })}
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-pestguardAbuTeks/70"
          />
        </label>
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-pestguardHijauPudar p-1 sm:flex" role="tablist" aria-label={p({ id: "Saring komoditas", en: "Filter by crop", ko: "작물별 보기" })}>
          {PILIHAN_KOMODITAS.map((pil) => (
            <button
              key={pil}
              type="button"
              role="tab"
              aria-selected={komoditas === pil}
              onClick={() => setKomoditas(pil)}
              className={gabungkanNamaKelas(
                "min-h-[40px] whitespace-nowrap rounded-lg px-2 text-[14px] font-semibold sm:px-4",
                komoditas === pil ? "bg-white text-pestguardHijauTua shadow-sm" : "text-pestguardAbuTeks"
              )}
            >
              {pil === "Semua" ? p({ id: "Semua", en: "All", ko: "전체" }) : namaKom(pil)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[13.5px] text-pestguardAbuTeks">{p({
          id: `${daftar.length} jenis hama ditampilkan. Ketuk kartu untuk melihat cara memeriksa dan mengendalikannya.`,
          en: `${daftar.length} pests shown. Tap a card to see how to check and control it.`,
          ko: `해충 ${daftar.length}종 표시. 카드를 누르면 확인·방제 방법이 나옵니다.`,
        })}</p>

      {daftar.length === 0 && (
        <div className="rounded-pestguardKartu border border-dashed border-pestguardAbuGaris bg-white p-6 text-center text-[14px] text-pestguardAbuTeks">
          {p({
            id: "Tidak ada hama yang cocok. Coba kata lain, misalnya “batang”, “daun”, atau “akar”.",
            en: "No matching pests. Try another word, such as “stem”, “leaf”, or “root”.",
            ko: "맞는 해충이 없습니다. “줄기”, “잎”, “뿌리” 같은 다른 단어로 찾아보세요.",
          })}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {daftar.map((kelas) => {
          const panduan = ambilPanduanKelompok(kelas);
          const keandalan = LABEL_KEANDALAN[tentukanStatusKeandalan(kelas)];
          const jumlahAlami = ambilReferensiPengendalian(kelas.classId).alami.length;
          const buka = terbuka === kelas.classId;
          return (
            <article key={kelas.classId} className={gabungkanNamaKelas("rounded-pestguardKartu border bg-white shadow-pestguardKartu", buka ? "border-pestguardHijauSedang md:col-span-2 xl:col-span-3" : "border-pestguardAbuGaris")}>
              <button type="button" onClick={() => setTerbuka(buka ? null : kelas.classId)} aria-expanded={buka} className="flex w-full items-start gap-3 p-4 text-left">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pestguardHijauLembut text-xl" aria-hidden>
                  {panduan.ikonEmoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">{tk(kelas.namaIndonesia)}</span>
                  <span className="block text-[12.5px] italic text-pestguardAbuTeks">{kelas.namaIlmiah}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-pestguardAbuGaris px-2 py-0.5 text-[11.5px] font-semibold">
                      <span className="h-2 w-2 rounded-full" style={{ background: WARNA_KOMODITAS[kelas.komoditas] }} aria-hidden />
                      {namaKom(kelas.komoditas)}
                    </span>
                    <span className={gabungkanNamaKelas("rounded-full px-2 py-0.5 text-[11.5px] font-semibold", keandalan.kelas)}>{p(keandalan.teks)}</span>
                    {jumlahAlami > 0 && (
                      <span className="rounded-full bg-pestguardHijauUtama/10 px-2 py-0.5 text-[11.5px] font-semibold text-pestguardHijauUtama">{p({ id: `${jumlahAlami} cara alami`, en: `${jumlahAlami} natural method(s)`, ko: `친환경 방법 ${jumlahAlami}개` })}</span>
                    )}
                  </span>
                  {!buka && <span className="mt-2 line-clamp-2 block text-[13.5px] leading-relaxed text-pestguardAbuTeks">{tk(kelas.gejala)}</span>}
                </span>
                <ChevronDown className={gabungkanNamaKelas("mt-1 h-5 w-5 shrink-0 text-pestguardAbuTeks transition-transform", buka && "rotate-180")} aria-hidden />
              </button>
              {buka && (
                <div className="space-y-4 border-t border-pestguardAbuGaris p-4 sm:p-5">
                  <p className="text-[15px] leading-relaxed text-pestguardTeksUtama">{tk(kelas.gejala)}</p>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3">
                    {[
                      { Ikon: MapPin, judul: p({ id: "Di mana mencarinya", en: "Where to look", ko: "찾아볼 곳" }), isi: tk(panduan.tempatPeriksa) },
                      { Ikon: Clock3, judul: p({ id: "Kapan memeriksa", en: "When to check", ko: "확인할 때" }), isi: tk(panduan.waktuPeriksa) },
                      { Ikon: Users, judul: p({ id: "Teman petani (musuh alami)", en: "Farmer's allies (natural enemies)", ko: "농부의 친구 (천적)" }), isi: tk(panduan.musuhAlami) },
                    ].map(({ Ikon, judul, isi }) => (
                      <div key={judul} className="rounded-xl bg-pestguardHijauPudar p-3">
                        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-pestguardHijauTua">
                          <Ikon className="h-4 w-4" aria-hidden /> {judul}
                        </p>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-pestguardAbuTeks">{isi}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-pestguardHijauTua">{p({ id: "Cara mengendalikan tanpa obat", en: "Control without chemicals", ko: "약 없이 방제하기" })}</h3>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-pestguardTeksUtama">
                      {kelas.pengendalian.map((langkah) => (
                        <li key={langkah}>{tk(langkah)}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-[13.5px] text-pestguardAbuTeks">
                      <span className="font-semibold text-pestguardTeksUtama">{p({ id: "Kapan harus bertindak: ", en: "When to act: ", ko: "조치할 때: " })}</span>
                      {tk(panduan.tandaHarusBertindak)}
                    </p>
                  </div>
                  <BlokPengendalian classId={kelas.classId} namaKomoditas={kelas.komoditas} />
                  <p className="text-[12.5px] leading-relaxed text-pestguardAbuTeks">{p({ id: "Kemampuan sistem mengenali hama ini", en: "System recognition of this pest", ko: "이 해충에 대한 시스템 인식 수준" })}: {p(keandalan.teks).toLowerCase()}.</p>
                  <Link href="/deteksi" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-pestguardHijauUtama px-4 text-[14px] font-semibold text-white hover:bg-pestguardHijauTua">
                    <ScanSearch className="h-4 w-4" aria-hidden /> {p({ id: "Cek foto hama sekarang", en: "Check a pest photo now", ko: "지금 해충 사진 확인" })}
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <ReferensiUlatBawang />
    </div>
  );
}
