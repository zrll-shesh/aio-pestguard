"use client";

import { useState } from "react";
import { AlertTriangle, BadgeCheck, Check, CircleHelp, Copy, Download, MessageCircle, Share2, XCircle } from "lucide-react";
import type { JawabanPetani as TipeJawabanPetani, WarnaStatus } from "@/lib/model/wawasanPetani";
import type { WawasanPrediksi } from "@/lib/model/wawasanPrediksi";
import { salinTeksKeClipboard, unduhTeksSebagaiFile, gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

export const GAYA_WARNA_STATUS: Record<WarnaStatus, { chip: string; titik: string; teks: string }> = {
  hijau: { chip: "bg-pestguardHijauMuda/20 text-pestguardHijauMuda border-pestguardHijauMuda/40", titik: "bg-pestguardHijauSedang", teks: "text-pestguardHijauUtama" },
  kuning: { chip: "bg-amber-300/15 text-amber-200 border-amber-200/40", titik: "bg-amber-500", teks: "text-pestguardKuningPeringatan" },
  merah: { chip: "bg-rose-300/15 text-rose-200 border-rose-200/40", titik: "bg-rose-500", teks: "text-pestguardMerahPeringatan" },
};

const GAYA_COCOK = {
  benar: { Ikon: BadgeCheck, kelas: "bg-pestguardHijauMuda/15 text-pestguardHijauMuda" },
  sebagian: { Ikon: CircleHelp, kelas: "bg-amber-300/15 text-amber-100" },
  salah: { Ikon: XCircle, kelas: "bg-rose-300/15 text-rose-100" },
  tidak_terdeteksi: { Ikon: XCircle, kelas: "bg-rose-300/15 text-rose-100" },
  tidak_diketahui: { Ikon: CircleHelp, kelas: "" },
} as const;

interface PropsJawabanPetani {
  jawaban: TipeJawabanPetani;
  wawasan: WawasanPrediksi;
  teksLaporanLengkap: string;
  namaBerkasLaporan: string;
}

export default function JawabanPetani({ jawaban, wawasan, teksLaporanLengkap, namaBerkasLaporan }: PropsJawabanPetani) {
  const { p } = useBahasa();
  const [statusSalin, setStatusSalin] = useState<"diam" | "ok">("diam");
  const gayaYakin = GAYA_WARNA_STATUS[jawaban.warnaYakin];
  const cocok = wawasan.cocokLabel;
  const gayaCocok = GAYA_COCOK[cocok.hasil];
  const bisaBagikanBawaan = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const salin = async () => {
    if (await salinTeksKeClipboard(jawaban.teksBagikan)) {
      setStatusSalin("ok");
      window.setTimeout(() => setStatusSalin("diam"), 2000);
    }
  };
  const bagikan = async () => {
    try {
      await navigator.share({ title: p({ id: "Hasil cek hama AIO PESTGUARD", en: "AIO PESTGUARD pest check", ko: "AIO PESTGUARD 해충 확인 결과" }), text: jawaban.teksBagikan });
    } catch {
      // dibatalkan pengguna
    }
  };

  const kelasTombol =
    "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20";

  return (
    <section className="pestguard-hero pestguard-muncul rounded-[22px] p-5 text-white shadow-pestguardKartuAngkat sm:p-8" aria-live="polite">
      <div className="relative z-[1]">
        <p className="text-[13px] font-semibold text-pestguardHijauMuda">{p({ id: "Jawaban untuk foto ini", en: "Answer for this photo", ko: "이 사진에 대한 답" })}</p>
        <h2 className="mt-2 max-w-3xl font-pestguardDisplay text-[24px] font-semibold leading-tight sm:text-[32px]">{jawaban.kalimatUtama}</h2>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={gabungkanNamaKelas("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold", gayaYakin.chip)}>
            {jawaban.warnaYakin === "hijau" ? <BadgeCheck className="h-4 w-4" aria-hidden /> : <AlertTriangle className="h-4 w-4" aria-hidden />}
            {jawaban.kataYakin}
          </span>
          {jawaban.komoditasTerdampak && (
            <span className="rounded-full border border-white/20 px-3 py-1.5 text-sm font-semibold text-white/85">{p({ id: `Hama tanaman ${jawaban.komoditasTerdampak.toLowerCase()}`, en: `${jawaban.komoditasTerdampak} pest`, ko: `${jawaban.komoditasTerdampak} 해충` })}</span>
          )}
        </div>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75">{jawaban.artiYakin}</p>

        {cocok.kalimat && (
          <p className={gabungkanNamaKelas("mt-4 inline-flex max-w-3xl items-start gap-2 rounded-xl px-3 py-2 text-[13px] leading-snug", gayaCocok.kelas)}>
            <gayaCocok.Ikon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold">{p({ id: "Uji dengan foto berlabel: ", en: "Labelled photo check: ", ko: "정답 사진 대조: " })}</span>
              {cocok.kalimat}
            </span>
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(jawaban.teksBagikan)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-pestguardHijauMuda px-4 py-2 text-sm font-bold text-pestguardNampan transition-colors hover:bg-white sm:col-span-1"
          >
            <MessageCircle className="h-4 w-4" aria-hidden /> {p({ id: "Kirim ke WhatsApp", en: "Send to WhatsApp", ko: "WhatsApp으로 보내기" })}
          </a>
          {bisaBagikanBawaan && (
            <button type="button" onClick={bagikan} className={kelasTombol}>
              <Share2 className="h-4 w-4" aria-hidden /> {p({ id: "Bagikan", en: "Share", ko: "공유" })}
            </button>
          )}
          <button type="button" onClick={salin} className={kelasTombol}>
            {statusSalin === "ok" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            {statusSalin === "ok" ? p({ id: "Tersalin", en: "Copied", ko: "복사됨" }) : p({ id: "Salin ringkasan", en: "Copy summary", ko: "요약 복사" })}
          </button>
          <button type="button" onClick={() => unduhTeksSebagaiFile(teksLaporanLengkap, namaBerkasLaporan)} className={kelasTombol}>
            <Download className="h-4 w-4" aria-hidden /> {p({ id: "Laporan lengkap", en: "Full report", ko: "전체 보고서" })}
          </button>
        </div>
      </div>
    </section>
  );
}
