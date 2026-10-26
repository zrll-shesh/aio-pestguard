import { notFound } from "next/navigation";
import AreaAnalisisSesi from "@/components/dashboard/AreaAnalisisSesi";
import KepalaDetailSesi from "@/components/history/KepalaDetailSesi";
import { ambilRingkasanLahanBerdasarkanId, ambilSesiBerdasarkanId, ambilSesiPemantauan } from "@/lib/dataSource";

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
      <KepalaDetailSesi sesiPemantauan={sesiPemantauan} ringkasanLahan={ringkasanLahan} />
      <AreaAnalisisSesi sesiPemantauan={sesiPemantauan} ringkasanLahan={ringkasanLahan} />
    </div>
  );
}
