import Link from "next/link";
import { CalendarDays, Cpu, ShieldCheck } from "lucide-react";
import { ambilStatusKesehatanApi } from "@/lib/dataSource";
import { TANGGAL_ACUAN_SIMULASI_ISO } from "@/lib/mockData";

export default function TopbarAplikasi() {
  const statusApi = ambilStatusKesehatanApi();
  const teksTanggalHariIni = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(TANGGAL_ACUAN_SIMULASI_ISO));

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-pestguardAbuGaris/80 bg-pestguardHijauPudar/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-9">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-pestguardHijauTua">
          <ShieldCheck className="h-4 w-4 text-pestguardHijauMuda" aria-hidden />
        </span>
        <span className="font-pestguardDisplay text-[15px] font-bold text-pestguardHijauTua">AIO PESTGUARD</span>
      </div>

      <div className="hidden items-center gap-2 text-sm text-pestguardAbuTeks lg:flex">
        <CalendarDays className="h-4 w-4" aria-hidden />
        <span>Tanggal acuan data contoh: {teksTanggalHariIni}</span>
      </div>

      <Link
        href="/deteksi"
        className="flex items-center gap-2 rounded-full border border-pestguardAbuGaris bg-white px-3 py-1.5 text-xs font-semibold text-pestguardHijauTua transition-colors hover:border-pestguardHijauMuda"
      >
        <Cpu className="h-3.5 w-3.5 text-pestguardHijauSedang" aria-hidden />
        <span className="hidden sm:inline">Model utama</span> {statusApi.default_model.toUpperCase()} (ONNX)
      </Link>
    </header>
  );
}
