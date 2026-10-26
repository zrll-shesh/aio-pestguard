"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { salinTeksKeClipboard, unduhTeksSebagaiFile } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import { gabungkanNamaKelas } from "@/lib/utils";

interface PropsTombolSalinDanUnduh {
  /** Teks lengkap wawasan yang akan disalin atau diunduh */
  isiTeksWawasan: string;
  /** Nama file saat diunduh, contoh "wawasan-lahan-a-2026-10-19.txt" */
  namaFileUnduhan: string;
  /** Tampilan terang dipakai di atas latar hijau tua */
  tampilanTerang?: boolean;
}

/** Dua tombol: Salin wawasan ke clipboard, dan Unduh wawasan sebagai file teks */
export default function TombolSalinDanUnduh({
  isiTeksWawasan,
  namaFileUnduhan,
  tampilanTerang = false,
}: PropsTombolSalinDanUnduh) {
  const { p } = useBahasa();
  const [statusSalin, setStatusSalin] = useState<"diam" | "berhasil" | "gagal">("diam");

  const tanganiKlikSalin = async () => {
    const berhasil = await salinTeksKeClipboard(isiTeksWawasan);
    setStatusSalin(berhasil ? "berhasil" : "gagal");
    window.setTimeout(() => setStatusSalin("diam"), 2200);
  };

  const tanganiKlikUnduh = () => unduhTeksSebagaiFile(isiTeksWawasan, namaFileUnduhan);

  const kelasTombol = tampilanTerang
    ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
    : "border-pestguardAbuGaris bg-white text-pestguardHijauTua hover:bg-pestguardHijauLembut";

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={p({ id: "Bagikan wawasan", en: "Share insight", ko: "인사이트 공유" })}>
      <button
        type="button"
        onClick={tanganiKlikSalin}
        className={gabungkanNamaKelas(
          "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
          kelasTombol
        )}
      >
        {statusSalin === "berhasil" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {statusSalin === "berhasil" ? p({ id: "Tersalin", en: "Copied", ko: "복사됨" }) : statusSalin === "gagal" ? p({ id: "Gagal menyalin", en: "Copy failed", ko: "복사 실패" }) : p({ id: "Salin wawasan", en: "Copy insight", ko: "인사이트 복사" })}
      </button>
      <button
        type="button"
        onClick={tanganiKlikUnduh}
        className={gabungkanNamaKelas(
          "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
          kelasTombol
        )}
      >
        <Download className="h-4 w-4" aria-hidden />
        {p({ id: "Unduh wawasan", en: "Download insight", ko: "인사이트 내려받기" })}
      </button>
    </div>
  );
}
