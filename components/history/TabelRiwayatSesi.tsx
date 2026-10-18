"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { RingkasanLahan, SesiPemantauanLahan } from "@/lib/types";
import KartuDasar from "@/components/ui/KartuDasar";
import { LencanaKomoditas } from "@/components/ui/LencanaStatus";
import { formatAngkaSebagaiPersen, formatTanggalDanJam, gabungkanNamaKelas } from "@/lib/utils";
import { hitungRataRataKeyakinan } from "@/lib/insightEngine";

interface PropsTabelRiwayatSesi {
  daftarSesiPemantauan: SesiPemantauanLahan[];
  daftarRingkasanLahan: RingkasanLahan[];
}

export default function TabelRiwayatSesi({ daftarSesiPemantauan, daftarRingkasanLahan }: PropsTabelRiwayatSesi) {
  const [idLahanFilter, setIdLahanFilter] = useState<string>("semua");

  const daftarSesiTersaring = useMemo(
    () => daftarSesiPemantauan.filter((sesi) => idLahanFilter === "semua" || sesi.idLahan === idLahanFilter),
    [daftarSesiPemantauan, idLahanFilter]
  );

  const cariLahan = (idLahan: string) => daftarRingkasanLahan.find((r) => r.idLahan === idLahan);

  return (
    <KartuDasar judulKartu="Semua sesi pemantauan" keteranganKartu="Setiap baris adalah satu kali foto perangkap beserta hasil deteksinya.">
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Saring berdasarkan lahan">
        {[{ idLahan: "semua", namaLahan: "Semua lahan" }, ...daftarRingkasanLahan].map((opsi) => (
          <button
            key={opsi.idLahan}
            type="button"
            onClick={() => setIdLahanFilter(opsi.idLahan)}
            aria-pressed={idLahanFilter === opsi.idLahan}
            className={gabungkanNamaKelas(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              idLahanFilter === opsi.idLahan
                ? "border-pestguardHijauUtama bg-pestguardHijauUtama text-white"
                : "border-pestguardAbuGaris bg-white text-pestguardHijauTua hover:bg-pestguardHijauLembut"
            )}
          >
            {opsi.namaLahan}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-pestguardAbuTeks">
              <th className="pb-2 font-semibold">Waktu</th>
              <th className="pb-2 font-semibold">Lahan</th>
              <th className="pb-2 font-semibold">Kamera</th>
              <th className="pb-2 text-right font-semibold">Hama</th>
              <th className="pb-2 font-semibold">Keyakinan rata-rata</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {daftarSesiTersaring.map((sesi) => {
              const lahan = cariLahan(sesi.idLahan);
              return (
                <tr key={sesi.idSesi} className="border-t border-pestguardAbuGaris">
                  <td className="py-3 text-pestguardTeksUtama">
                    {formatTanggalDanJam(sesi.waktuPengambilan)}
                    <p className="font-pestguardMono text-xs text-pestguardAbuTeks">{sesi.idSesi}</p>
                  </td>
                  <td className="py-3">
                    <p className="font-semibold">{lahan?.namaLahan}</p>
                    {lahan && <LencanaKomoditas namaKomoditas={lahan.komoditas} />}
                  </td>
                  <td className="py-3 text-pestguardAbuTeks">{sesi.labelKamera}</td>
                  <td className="py-3 text-right font-pestguardMono text-lg font-semibold text-pestguardHijauTua">{sesi.daftarDeteksi.length}</td>
                  <td className="py-3 font-pestguardMono">{formatAngkaSebagaiPersen(hitungRataRataKeyakinan(sesi.daftarDeteksi))}</td>
                  <td className="py-3 text-right">
                    <Link href={`/riwayat/${sesi.idSesi}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-pestguardHijauUtama hover:bg-pestguardHijauLembut">
                      Lihat <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </KartuDasar>
  );
}
