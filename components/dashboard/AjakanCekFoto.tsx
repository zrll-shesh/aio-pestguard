import Link from "next/link";
import { BookOpen, ScanSearch } from "lucide-react";

/** Pintu masuk ke fitur yang memakai model asli, ditaruh paling atas di Beranda */
export default function AjakanCekFoto() {
  return (
    <section className="grid gap-3 rounded-pestguardKartu md:grid-cols-[minmax(0,1fr)_auto] md:items-center border border-pestguardAbuGaris bg-white p-4 shadow-pestguardKartu sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pestguardHijauUtama text-white">
          <ScanSearch className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-pestguardDisplay text-[17px] font-semibold text-pestguardHijauTua">Punya foto hama? Cek langsung di sini</h2>
          <p className="mt-0.5 text-[14px] leading-relaxed text-pestguardAbuTeks">
            Model pengenal hama asli berjalan di ponsel atau laptop Anda dan memberi jawaban beserta langkah tindakan. Angka lahan di bawah masih data contoh.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/deteksi" className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-pestguardHijauUtama px-4 text-[14px] font-semibold text-white hover:bg-pestguardHijauTua sm:flex-none">
          <ScanSearch className="h-4 w-4" aria-hidden /> Cek foto hama
        </Link>
        <Link href="/hama" className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-pestguardAbuGaris px-4 text-[14px] font-semibold text-pestguardHijauTua hover:bg-pestguardHijauPudar sm:flex-none">
          <BookOpen className="h-4 w-4" aria-hidden /> Kamus hama
        </Link>
      </div>
    </section>
  );
}
