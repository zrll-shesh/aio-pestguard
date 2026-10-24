"use client";

import { useState } from "react";
import type { RingkasanLahan, SesiPemantauanLahan } from "@/lib/types";
import BannerWawasanUtama from "./BannerWawasanUtama";
import KartuAngkaRingkas from "./KartuAngkaRingkas";
import PeringkatPerbandinganLahan from "./PeringkatPerbandinganLahan";
import GrafikTrenTujuhHari from "./GrafikTrenTujuhHari";
import DistribusiKeyakinan from "./DistribusiKeyakinan";
import AreaAnalisisSesi from "./AreaAnalisisSesi";
import KartuDasar from "@/components/ui/KartuDasar";
import AjakanCekFoto from "./AjakanCekFoto";
import { susunKalimatRingkasanSemuaLahan } from "@/lib/insightEngine";

interface PropsDashboardBeranda {
  daftarRingkasanLahanTerurut: RingkasanLahan[];
  daftarSesiPemantauan: SesiPemantauanLahan[];
}

/** Halaman utama petani: ringkasan, perbandingan lahan, tren, dan analisis foto terbaru */
export default function DashboardBeranda({ daftarRingkasanLahanTerurut, daftarSesiPemantauan }: PropsDashboardBeranda) {
  const [idLahanTerpilih, setIdLahanTerpilih] = useState<string>(daftarRingkasanLahanTerurut[0].idLahan);

  const ringkasanLahanTerpilih =
    daftarRingkasanLahanTerurut.find((r) => r.idLahan === idLahanTerpilih) ?? daftarRingkasanLahanTerurut[0];
  const sesiTerbaruLahan = daftarSesiPemantauan.find((sesi) => sesi.idLahan === ringkasanLahanTerpilih.idLahan) ?? null;

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <AjakanCekFoto />
      <BannerWawasanUtama
        ringkasanLahanTerpilih={ringkasanLahanTerpilih}
        sesiTerbaruLahan={sesiTerbaruLahan}
        kalimatRingkasanSemuaLahan={susunKalimatRingkasanSemuaLahan(daftarRingkasanLahanTerurut)}
      />

      <KartuAngkaRingkas ringkasanLahan={ringkasanLahanTerpilih} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PeringkatPerbandinganLahan
            daftarRingkasanLahanTerurut={daftarRingkasanLahanTerurut}
            idLahanTerpilih={ringkasanLahanTerpilih.idLahan}
            saatLahanDipilih={setIdLahanTerpilih}
          />
        </div>
        <div className="lg:col-span-3">
          <GrafikTrenTujuhHari ringkasanLahan={ringkasanLahanTerpilih} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DistribusiKeyakinan ringkasanLahan={ringkasanLahanTerpilih} />
        </div>
        <div className="lg:col-span-3">
          <KartuDasar judulKartu="Langkah yang disarankan" keteranganKartu={`Untuk ${ringkasanLahanTerpilih.namaLahan}, urut dari yang paling dulu.`}>
            <ol className="space-y-3">
              {ringkasanLahanTerpilih.daftarLangkahTindakan.map((langkah, indeks) => (
                <li key={langkah} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pestguardHijauLembut font-pestguardMono text-xs font-semibold text-pestguardHijauTua">
                    {indeks + 1}
                  </span>
                  <span className="text-pestguardTeksUtama">{langkah}</span>
                </li>
              ))}
            </ol>
          </KartuDasar>
        </div>
      </div>

      {sesiTerbaruLahan ? (
        <AreaAnalisisSesi key={sesiTerbaruLahan.idSesi} sesiPemantauan={sesiTerbaruLahan} ringkasanLahan={ringkasanLahanTerpilih} />
      ) : (
        <KartuDasar judulKartu="Foto terbaru">
          <p className="text-sm text-pestguardAbuTeks">Belum ada foto perangkap untuk lahan ini.</p>
        </KartuDasar>
      )}
    </div>
  );
}
