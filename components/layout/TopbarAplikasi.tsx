"use client";

import Link from "next/link";
import { CalendarDays, Cpu, ShieldCheck } from "lucide-react";
import PemilihBahasa from "@/components/i18n/PemilihBahasa";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

export default function TopbarAplikasi({ modelUtama, tanggalAcuanIso }: { modelUtama: string; tanggalAcuanIso: string }) {
  const { p, tanggal } = useBahasa();
  const teksTanggal = tanggal(tanggalAcuanIso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-pestguardAbuGaris/80 bg-pestguardHijauPudar/90 px-4 py-2.5 backdrop-blur-md sm:px-6 lg:px-9">
      <div className="flex min-w-0 items-center gap-2 lg:hidden">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-pestguardHijauTua">
          <ShieldCheck className="h-4 w-4 text-pestguardHijauMuda" aria-hidden />
        </span>
        <span className="truncate font-pestguardDisplay text-[15px] font-bold text-pestguardHijauTua">AIO PESTGUARD</span>
      </div>

      <div className="hidden items-center gap-2 text-sm text-pestguardAbuTeks lg:flex">
        <CalendarDays className="h-4 w-4" aria-hidden />
        <span>
          {p({ id: "Tanggal acuan data contoh", en: "Sample data reference date", ko: "예시 데이터 기준일" })}: {teksTanggal}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/deteksi"
          className="hidden items-center gap-2 rounded-full border border-pestguardAbuGaris bg-white px-3 py-1.5 text-xs font-semibold text-pestguardHijauTua transition-colors hover:border-pestguardHijauMuda sm:flex"
        >
          <Cpu className="h-3.5 w-3.5 text-pestguardHijauSedang" aria-hidden />
          {p({ id: "Model utama", en: "Main model", ko: "주 모델" })} {modelUtama.toUpperCase()}
        </Link>
        <PemilihBahasa />
      </div>
    </header>
  );
}
