"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { salinTeksKeClipboard, unduhTeksSebagaiFile } from "@/lib/utils";
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
    <div className="flex flex-wrap gap-2" role="group" aria-label="Bagikan wawasan">
      <button
        type="button"
        onClick={tanganiKlikSalin}
        className={gabungkanNamaKelas(
          "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
          kelasTombol
        )}
      >
        {statusSalin === "berhasil" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {statusSalin === "berhasil" ? "Tersalin" : statusSalin === "gagal" ? "Gagal menyalin" : "Salin wawasan"}
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
        Unduh wawasan
      </button>
    </div>
  );
}
