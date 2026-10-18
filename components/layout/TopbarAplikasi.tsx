import { CalendarDays, CircleDot } from "lucide-react";
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
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-pestguardAbuGaris bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="font-pestguardDisplay text-base font-semibold text-pestguardHijauTua">AIO PESTGUARD</span>
      </div>

      <div className="hidden items-center gap-2 text-sm text-pestguardAbuTeks lg:flex">
        <CalendarDays className="h-4 w-4" aria-hidden />
        <span>{teksTanggalHariIni}</span>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-pestguardHijauLembut px-3 py-1.5 text-xs font-medium text-pestguardHijauTua">
        <CircleDot className="h-3.5 w-3.5 text-pestguardHijauSedang" aria-hidden />
        <span>
          Sistem {statusApi.status === "ok" ? "aktif" : "bermasalah"} (simulasi), model {statusApi.default_model.toUpperCase()}
        </span>
      </div>
    </header>
  );
}
