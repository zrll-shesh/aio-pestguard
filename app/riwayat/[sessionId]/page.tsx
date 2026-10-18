import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AreaAnalisisSesi from "@/components/dashboard/AreaAnalisisSesi";
import TombolSalinDanUnduh from "@/components/ui/TombolSalinDanUnduh";
import { LencanaRisiko } from "@/components/ui/LencanaStatus";
import { ambilRingkasanLahanBerdasarkanId, ambilSesiBerdasarkanId, ambilSesiPemantauan } from "@/lib/dataSource";
import { susunTeksWawasanUntukSalinan } from "@/lib/insightEngine";
import { formatTanggalDanJam } from "@/lib/utils";

export function generateStaticParams() {
  return ambilSesiPemantauan().map((sesi) => ({ sessionId: sesi.idSesi }));
}

export default function HalamanDetailSesi({ params }: { params: { sessionId: string } }) {
  const sesiPemantauan = ambilSesiBerdasarkanId(params.sessionId);
  if (!sesiPemantauan) notFound();
  const ringkasanLahan = ambilRingkasanLahanBerdasarkanId(sesiPemantauan.idLahan);
  if (!ringkasanLahan) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Link href="/riwayat" className="inline-flex items-center gap-2 text-sm font-semibold text-pestguardHijauUtama hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke Riwayat Sesi
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-pestguardDisplay text-3xl font-semibold text-pestguardHijauTua">
            {ringkasanLahan.namaLahan}, {formatTanggalDanJam(sesiPemantauan.waktuPengambilan)}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-pestguardAbuTeks">
            <span className="font-pestguardMono text-sm">{sesiPemantauan.idSesi}</span>
            <span>Model {sesiPemantauan.modelYangDipakai.toUpperCase()}, ambang keyakinan {Math.round(sesiPemantauan.ambangBatasKeyakinan * 100)} persen</span>
            <LencanaRisiko tingkatRisiko={ringkasanLahan.tingkatRisiko} />
          </p>
        </div>
        <TombolSalinDanUnduh
          isiTeksWawasan={susunTeksWawasanUntukSalinan(ringkasanLahan, sesiPemantauan)}
          namaFileUnduhan={`wawasan-${sesiPemantauan.idSesi}.txt`}
        />
      </div>

      <AreaAnalisisSesi sesiPemantauan={sesiPemantauan} ringkasanLahan={ringkasanLahan} />
    </div>
  );
}
