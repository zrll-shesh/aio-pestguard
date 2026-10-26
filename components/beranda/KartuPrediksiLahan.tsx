"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronUp, FlaskConical, Leaf, MapPin, Minus } from "lucide-react";
import type { RingkasanLahan, SesiPemantauanLahan } from "@/lib/types";
import { ambilPanduanKelompok } from "@/lib/model/kelasHama";
import { ringkasPengendalian } from "@/lib/model/referensiPestisida";
import { kelasDariKunciHama, namaHamaLahan, narasiDetailLahan, pilihDeteksiAcuan, susunLinimasa, type TitikLinimasa } from "@/lib/i18n/wawasanLahan";
import { LencanaRisiko } from "@/components/ui/LencanaStatus";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import { WARNA_STATUS } from "./PetaSebaran";

const WARNA_TITIK: Record<TitikLinimasa["jenis"], string> = {
  sekarang: "bg-pestguardHijauSedang",
  dewasa: "bg-amber-400",
  bertelur: "bg-amber-500",
  batas: "bg-pestguardMerahPeringatan",
};

function GrafikMini({ nilai, warna }: { nilai: number[]; warna: string }) {
  const lebar = 140;
  const tinggi = 40;
  const maks = Math.max(...nilai, 1);
  const titik = nilai.map((v, i) => [(i / (nilai.length - 1)) * (lebar - 6) + 3, tinggi - 4 - (v / maks) * (tinggi - 10)]);
  const garis = titik.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${garis} L${titik[titik.length - 1][0].toFixed(1)},${tinggi} L${titik[0][0].toFixed(1)},${tinggi} Z`;
  return (
    <svg viewBox={`0 0 ${lebar} ${tinggi}`} className="h-10 w-[140px]" aria-hidden>
      <path d={area} fill={warna} opacity={0.12} />
      <path d={garis} fill="none" stroke={warna} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={titik[titik.length - 1][0]} cy={titik[titik.length - 1][1]} r={3} fill={warna} />
    </svg>
  );
}

export default function KartuPrediksiLahan({ ringkasan, sesiTerbaru }: { ringkasan: RingkasanLahan; sesiTerbaru: SesiPemantauanLahan | null }) {
  const { bahasa, p, tk, komoditas } = useBahasa();
  const [detailTerbuka, setDetailTerbuka] = useState(false);
  const warna = WARNA_STATUS[ringkasan.tingkatRisiko];
  const namaHama = namaHamaLahan(bahasa, ringkasan);
  const kelas = kelasDariKunciHama(ringkasan.kunciReferensiHama);
  const panduan = kelas ? ambilPanduanKelompok(kelas) : null;
  const pengendalian = kelas ? ringkasPengendalian(kelas.classId) : null;
  const deteksiAcuan = pilihDeteksiAcuan(sesiTerbaru);
  const linimasa = susunLinimasa(bahasa, deteksiAcuan);
  const naik = ringkasan.perubahanMingguanPersen;
  const IkonTren = naik > 5 ? ArrowUpRight : naik < -5 ? ArrowDownRight : Minus;
  const persenAmbang = Math.min(ringkasan.persenDariAmbangBatas, 150);

  const ubin = [
    {
      Ikon: MapPin,
      warna: "bg-pestguardHijauUtama text-white",
      judul: p({ id: "Periksa", en: "Check", ko: "확인" }),
      isi: panduan ? tk(panduan.tempatPeriksa).split(/(?<=\.)\s/)[0] : "-",
    },
    {
      Ikon: Leaf,
      warna: "bg-pestguardHijauLembut text-pestguardHijauUtama",
      judul: p({ id: "Coba alami", en: "Try natural", ko: "친환경 먼저" }),
      isi: pengendalian?.alami[0] ? tk(pengendalian.alami[0].nama) : kelas ? tk(kelas.pengendalian[0]).split(/(?<=\.)\s/)[0] : "-",
    },
    {
      Ikon: FlaskConical,
      warna: "bg-pestguardHijauPudar text-pestguardHijauSedang",
      judul: p({ id: "Bila terpaksa", en: "If needed", ko: "필요할 때" }),
      isi: pengendalian?.kimiaBoleh[0]?.bahanAktif ?? p({ id: "Tanyakan ke PPL", en: "Ask an extension officer", ko: "지도사에게 문의" }),
    },
  ];

  return (
    <article id={`prediksi-${ringkasan.idLahan}`} className="kartu-lahan flex min-w-0 scroll-mt-24 flex-col overflow-hidden rounded-pestguardKartu border border-pestguardAbuGaris bg-white shadow-pestguardKartu">
      <div className="h-1.5 shrink-0" style={{ background: warna }} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-[22px]">
        <header className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="break-words font-pestguardDisplay text-[18px] font-semibold text-pestguardHijauTua">
              {ringkasan.namaLahan} · {komoditas(ringkasan.komoditas)}
            </h3>
            <p className="break-words text-[12.5px] text-pestguardAbuTeks">
              {tk(ringkasan.lokasi)} · {ringkasan.luasHektar} ha
            </p>
          </div>
          <LencanaRisiko tingkatRisiko={ringkasan.tingkatRisiko} />
        </header>

        {/* Isi kartu: di kartu sempit (HP / tablet) tersusun ke bawah; di kartu lebar
            berjejer menyamping. Diatur lewat container query di globals.css (.kartu-lahan-isi),
            jadi patokannya lebar kartu itu sendiri, bukan lebar layar. */}
        <div className="kartu-lahan-isi mt-4">
        <div className="kartu-lahan-ringkas min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-pestguardAbuTeks">{p({ id: "Hama utama hari ini", en: "Main pest today", ko: "오늘의 주요 해충" })}</p>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-pestguardDisplay text-[32px] font-semibold leading-none text-pestguardHijauTua">{ringkasan.totalDeteksiHariIni}</span>
              <span className="min-w-0 break-words text-[15px] font-semibold text-pestguardTeksUtama">{namaHama}</span>
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: naik > 5 ? WARNA_STATUS.tinggi : naik < -5 ? WARNA_STATUS.rendah : "#56685d" }}>
              <IkonTren className="h-4 w-4" aria-hidden />
              {naik > 0 ? "+" : ""}
              {naik}% {p({ id: "dibanding minggu lalu", en: "vs last week", ko: "지난주 대비" })}
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <GrafikMini nilai={ringkasan.trenTujuhHariTerakhir} warna={warna} />
            <p className="text-[11px] text-pestguardAbuTeks">{p({ id: "7 hari terakhir", en: "last 7 days", ko: "최근 7일" })}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between gap-2 text-[12px] font-semibold text-pestguardAbuTeks">
            <span>{p({ id: "Dari batas aman mingguan", en: "Of the weekly safe limit", ko: "주간 안전 기준 대비" })}</span>
            <span className="shrink-0" style={{ color: warna }}>{ringkasan.persenDariAmbangBatas}%</span>
          </div>
          <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-pestguardHijauLembut">
            <div className="h-full rounded-full" style={{ width: `${(persenAmbang / 150) * 100}%`, background: warna }} />
            <div className="absolute inset-y-0 w-0.5 bg-pestguardHijauTua/60" style={{ left: `${(100 / 150) * 100}%` }} aria-hidden />
          </div>
          <p className="mt-1 text-[11px] text-pestguardAbuTeks">
            {p({
              id: `Garis tegak = batas aman (${ringkasan.ambangBatasMingguan} ekor/minggu)`,
              en: `Vertical line = safe limit (${ringkasan.ambangBatasMingguan}/week)`,
              ko: `세로선 = 안전 기준 (주 ${ringkasan.ambangBatasMingguan}마리)`,
            })}
          </p>
        </div>

        </div>

        <div className="kartu-lahan-linimasa min-w-0 rounded-2xl bg-pestguardHijauPudar p-4">
          <p className="text-[13px] font-semibold text-pestguardHijauTua">{p({ id: "Prediksi & analisis", en: "Prediction & analysis", ko: "예측 및 분석" })}</p>
          {linimasa.length === 0 ? (
            <p className="mt-1 text-[13px] leading-relaxed text-pestguardAbuTeks">
              {p({
                id: "Belum ada data ukuran hama untuk memperkirakan umur dan waktu bertelurnya.",
                en: "No size data yet to estimate the pest's age and egg-laying time.",
                ko: "해충의 나이와 산란 시기를 추정할 크기 자료가 아직 없습니다.",
              })}
            </p>
          ) : (
            <ol className="mt-3 space-y-0">
              {linimasa.map((titik, i) => (
                <li key={titik.judul} className="relative flex gap-3 pb-3 last:pb-0">
                  {i < linimasa.length - 1 && <span className="absolute left-[7px] top-4 h-full w-0.5 bg-pestguardAbuGaris" aria-hidden />}
                  <span className={gabungkanNamaKelas("relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white shadow", WARNA_TITIK[titik.jenis])} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className={gabungkanNamaKelas("break-words text-[14px] font-semibold", titik.jenis === "batas" ? "text-pestguardMerahPeringatan" : "text-pestguardTeksUtama")}>{titik.judul}</p>
                    <p className="break-words text-[12.5px] leading-snug text-pestguardAbuTeks">{titik.keterangan}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Langkah selalu satu kolom: tiap langkah berupa baris lebar (ikon kiri, isi kanan). */}
        <ul className="kartu-lahan-aksi flex min-w-0 flex-col gap-2">
          {ubin.map(({ Ikon, warna: w, judul, isi }) => (
            <li key={judul} className="flex min-w-0 items-center gap-3 rounded-xl border border-pestguardAbuGaris px-3 py-2.5">
              <span className={gabungkanNamaKelas("grid h-9 w-9 shrink-0 place-items-center rounded-xl", w)}>
                <Ikon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold leading-tight text-pestguardAbuTeks">{judul}</p>
                <p className="mt-0.5 text-[13px] font-semibold leading-snug text-pestguardTeksUtama [overflow-wrap:anywhere]">{isi}</p>
              </div>
            </li>
          ))}
        </ul>
        </div>

        {detailTerbuka && (
          <div className="kartu-lahan-detail pestguard-muncul mt-5 border-t border-pestguardAbuGaris pt-4">
            <div className="min-w-0 space-y-3">
            <p className="break-words text-[14px] leading-relaxed text-pestguardTeksUtama">{narasiDetailLahan(bahasa, ringkasan)}</p>
            {kelas && (
              <>
                <p className="text-[13.5px] leading-relaxed text-pestguardAbuTeks">
                  <span className="font-semibold text-pestguardTeksUtama">{p({ id: "Ciri serangan: ", en: "Signs of attack: ", ko: "피해 특징: " })}</span>
                  {tk(kelas.gejala)}
                </p>
                <p className="text-[13.5px] leading-relaxed text-pestguardAbuTeks">
                  <span className="font-semibold text-pestguardTeksUtama">{p({ id: "Kapan harus bertindak: ", en: "When to act: ", ko: "조치할 때: " })}</span>
                  {panduan ? tk(panduan.tandaHarusBertindak) : ""}
                </p>
              </>
            )}
            {deteksiAcuan?.estimasiStadium && (
              <p className="text-[12px] leading-relaxed text-pestguardAbuTeks">
                {p({ id: "Dasar perkiraan: ", en: "Basis of estimate: ", ko: "추정 근거: " })}
                {tk(deteksiAcuan.estimasiStadium.catatanReferensiBiologis.split(". Sumber: ")[0])}.
              </p>
            )}
            </div>
            <div className="min-w-0 space-y-3">
            {kelas && (
              <>
                <p className="text-[13.5px] font-semibold text-pestguardTeksUtama">{p({ id: "Cara mengendalikan", en: "How to control it", ko: "방제 방법" })}</p>
                <ul className="list-disc space-y-1 pl-5 text-[13.5px] leading-relaxed text-pestguardTeksUtama">
                  {kelas.pengendalian.map((x) => (
                    <li key={x}>{tk(x)}</li>
                  ))}
                </ul>
                {pengendalian && pengendalian.kimiaTerlarang.length > 0 && (
                  <p className="rounded-xl bg-red-50 p-3 text-[13px] text-red-900 [overflow-wrap:anywhere]">
                    {p({ id: "Jangan pakai: ", en: "Do not use: ", ko: "사용 금지: " })}
                    {pengendalian.kimiaTerlarang.map((b) => b.bahanAktif).join(", ")}
                  </p>
                )}
              </>
            )}
            <div className="flex flex-wrap gap-2">
              {sesiTerbaru && (
                <Link href={`/riwayat/${sesiTerbaru.idSesi}`} className="inline-flex min-h-[40px] items-center rounded-xl border border-pestguardAbuGaris px-3 text-[13px] font-semibold text-pestguardHijauTua hover:bg-pestguardHijauPudar">
                  {p({ id: "Lihat foto perangkap terbaru", en: "View latest trap photo", ko: "최근 트랩 사진 보기" })}
                </Link>
              )}
              <Link href="/hama" className="inline-flex min-h-[40px] items-center rounded-xl border border-pestguardAbuGaris px-3 text-[13px] font-semibold text-pestguardHijauTua hover:bg-pestguardHijauPudar">
                {p({ id: "Cara alami dan obat lengkap", en: "Full natural and chemical options", ko: "친환경·약제 전체 보기" })}
              </Link>
            </div>
            </div>
          </div>
        )}

        <div className="mt-auto flex justify-end pt-3">
          <button
            type="button"
            onClick={() => setDetailTerbuka((v) => !v)}
            aria-expanded={detailTerbuka}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-[13.5px] font-semibold text-pestguardHijauUtama hover:bg-pestguardHijauPudar"
          >
            {detailTerbuka ? p({ id: "Tutup detail", en: "Hide details", ko: "상세 닫기" }) : p({ id: "Lihat detail", en: "See details", ko: "상세 보기" })}
            {detailTerbuka ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>
    </article>
  );
}
