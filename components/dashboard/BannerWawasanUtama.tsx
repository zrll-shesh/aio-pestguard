import { Lightbulb } from "lucide-react";
import type { RingkasanLahan, SesiPemantauanLahan } from "@/lib/types";
import { susunTeksWawasanUntukSalinan } from "@/lib/insightEngine";
import { LencanaRisiko } from "@/components/ui/LencanaStatus";
import TombolSalinDanUnduh from "@/components/ui/TombolSalinDanUnduh";

interface PropsBannerWawasanUtama {
  ringkasanLahanTerpilih: RingkasanLahan;
  sesiTerbaruLahan: SesiPemantauanLahan | null;
  kalimatRingkasanSemuaLahan: string;
}

/** Bagian paling atas beranda: jawaban singkat "apa yang harus saya lakukan hari ini" */
export default function BannerWawasanUtama({
  ringkasanLahanTerpilih,
  sesiTerbaruLahan,
  kalimatRingkasanSemuaLahan,
}: PropsBannerWawasanUtama) {
  const teksWawasanLengkap = susunTeksWawasanUntukSalinan(ringkasanLahanTerpilih, sesiTerbaruLahan);
  const namaFileUnduhan = `wawasan-${ringkasanLahanTerpilih.idLahan}-2026-10-19.txt`;

  return (
    <section className="pestguard-hero rounded-[22px] p-6 text-white shadow-pestguardKartuAngkat sm:p-8">
      <p className="relative z-[1] text-[13px] font-semibold text-pestguardHijauMuda">Ringkasan hari ini (data contoh)</p>
      <p className="relative z-[1] mt-2 max-w-3xl font-pestguardDisplay text-2xl font-semibold leading-snug sm:text-[30px]">{kalimatRingkasanSemuaLahan}</p>

      <div className="relative z-[1] mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Lightbulb className="h-5 w-5 text-pestguardHijauMuda" aria-hidden />
          <h2 className="text-base font-semibold">
            Wawasan untuk {ringkasanLahanTerpilih.namaLahan} ({ringkasanLahanTerpilih.komoditas})
          </h2>
          <LencanaRisiko tingkatRisiko={ringkasanLahanTerpilih.tingkatRisiko} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/90">{ringkasanLahanTerpilih.narasiWawasanUtama}</p>
        <div className="mt-3 rounded-lg bg-white p-4 text-sm leading-relaxed text-pestguardTeksUtama">
          <p className="mb-1 text-[13px] font-semibold text-pestguardHijauUtama">Saran tindakan</p>
          {ringkasanLahanTerpilih.rekomendasiUtama}
        </div>
        <div className="mt-4">
          <TombolSalinDanUnduh isiTeksWawasan={teksWawasanLengkap} namaFileUnduhan={namaFileUnduhan} tampilanTerang />
        </div>
      </div>
    </section>
  );
}
