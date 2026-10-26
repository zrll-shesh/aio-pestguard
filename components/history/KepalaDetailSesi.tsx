"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { RingkasanLahan, SesiPemantauanLahan } from "@/lib/types";
import { LencanaRisiko } from "@/components/ui/LencanaStatus";
import TombolSalinDanUnduh from "@/components/ui/TombolSalinDanUnduh";
import { namaHamaDariDeteksi, narasiDetailLahan } from "@/lib/i18n/wawasanLahan";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

export default function KepalaDetailSesi({ sesiPemantauan, ringkasanLahan }: { sesiPemantauan: SesiPemantauanLahan; ringkasanLahan: RingkasanLahan }) {
  const { bahasa, p, komoditas, tanggal } = useBahasa();
  const waktu = tanggal(sesiPemantauan.waktuPengambilan, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const teksSalin = [
    `AIO PESTGUARD - ${ringkasanLahan.namaLahan} (${komoditas(ringkasanLahan.komoditas)}), ${waktu}`,
    narasiDetailLahan(bahasa, ringkasanLahan),
    "",
    ...sesiPemantauan.daftarDeteksi.map((d, i) => `${i + 1}. ${namaHamaDariDeteksi(bahasa, d)} ${Math.round(d.confidence * 100)}%`),
  ].join("\n");

  return (
    <>
      <Link href="/riwayat" className="inline-flex min-h-[40px] items-center gap-2 text-sm font-semibold text-pestguardHijauUtama hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {p({ id: "Kembali ke Riwayat Sesi", en: "Back to Session History", ko: "촬영 기록으로 돌아가기" })}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-pestguardDisplay text-[28px] font-semibold text-pestguardHijauTua sm:text-3xl">
            {ringkasanLahan.namaLahan}, {waktu}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-pestguardAbuTeks">
            <span className="font-pestguardMono text-sm">{sesiPemantauan.idSesi}</span>
            <span>
              {p({ id: "Model", en: "Model", ko: "모델" })} {sesiPemantauan.modelYangDipakai.toUpperCase()}, {p({ id: "ambang keyakinan", en: "confidence threshold", ko: "신뢰도 임계값" })}{" "}
              {Math.round(sesiPemantauan.ambangBatasKeyakinan * 100)}%
            </span>
            <LencanaRisiko tingkatRisiko={ringkasanLahan.tingkatRisiko} />
          </p>
        </div>
        <TombolSalinDanUnduh isiTeksWawasan={teksSalin} namaFileUnduhan={`wawasan-${sesiPemantauan.idSesi}.txt`} />
      </div>
    </>
  );
}
