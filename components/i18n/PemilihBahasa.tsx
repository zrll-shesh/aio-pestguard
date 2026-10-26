"use client";

import { Languages } from "lucide-react";
import { DAFTAR_BAHASA } from "@/lib/i18n/bahasa";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "./PenyediaBahasa";

/** Tombol ganti bahasa: ID, EN, 한. Varian "gelap" untuk sidebar hijau tua. */
export default function PemilihBahasa({ varian = "terang" }: { varian?: "terang" | "gelap" }) {
  const { bahasa, setBahasa, p } = useBahasa();
  const gelap = varian === "gelap";
  return (
    <div
      role="radiogroup"
      aria-label={p({ id: "Pilih bahasa", en: "Choose language", ko: "언어 선택" })}
      className={gabungkanNamaKelas(
        "inline-flex items-center gap-0.5 rounded-full p-0.5",
        gelap ? "bg-white/10" : "border border-pestguardAbuGaris bg-white"
      )}
    >
      <Languages className={gabungkanNamaKelas("mx-1.5 h-3.5 w-3.5", gelap ? "text-white/60" : "text-pestguardAbuTeks")} aria-hidden />
      {DAFTAR_BAHASA.map((pilihan) => {
        const aktif = pilihan.kode === bahasa;
        return (
          <button
            key={pilihan.kode}
            type="button"
            role="radio"
            aria-checked={aktif}
            aria-label={pilihan.label}
            title={pilihan.label}
            onClick={() => setBahasa(pilihan.kode)}
            className={gabungkanNamaKelas(
              "min-h-[30px] min-w-[34px] rounded-full px-2 text-[12px] font-bold transition-colors",
              aktif
                ? gelap
                  ? "bg-pestguardHijauMuda text-pestguardNampan"
                  : "bg-pestguardHijauUtama text-white"
                : gelap
                  ? "text-white/70 hover:text-white"
                  : "text-pestguardAbuTeks hover:text-pestguardHijauTua"
            )}
          >
            {pilihan.singkat}
          </button>
        );
      })}
    </div>
  );
}
