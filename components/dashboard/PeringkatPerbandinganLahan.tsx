"use client";

import { ChevronRight } from "lucide-react";
import type { RingkasanLahan } from "@/lib/types";
import KartuDasar from "@/components/ui/KartuDasar";
import { LencanaKomoditas, LencanaRisiko } from "@/components/ui/LencanaStatus";
import { gabungkanNamaKelas } from "@/lib/utils";

interface PropsPeringkatPerbandinganLahan {
  daftarRingkasanLahanTerurut: RingkasanLahan[];
  idLahanTerpilih: string;
  saatLahanDipilih: (idLahan: string) => void;
}

/** Daftar semua lahan, yang paling butuh perhatian ada di atas. Klik untuk berpindah lahan. */
export default function PeringkatPerbandinganLahan({
  daftarRingkasanLahanTerurut,
  idLahanTerpilih,
  saatLahanDipilih,
}: PropsPeringkatPerbandinganLahan) {
  return (
    <KartuDasar judulKartu="Lahan mana yang paling perlu dilihat" keteranganKartu="Diurutkan dari yang paling mendesak. Klik untuk melihat detailnya.">
      <ol className="space-y-2">
        {daftarRingkasanLahanTerurut.map((ringkasan, indeks) => {
          const sedangDipilih = ringkasan.idLahan === idLahanTerpilih;
          return (
            <li key={ringkasan.idLahan}>
              <button
                type="button"
                onClick={() => saatLahanDipilih(ringkasan.idLahan)}
                aria-pressed={sedangDipilih}
                className={gabungkanNamaKelas(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                  sedangDipilih ? "border-pestguardHijauSedang bg-pestguardHijauLembut" : "border-pestguardAbuGaris hover:bg-pestguardHijauPudar"
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pestguardHijauTua font-pestguardMono text-sm font-semibold text-white">
                  {indeks + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-pestguardTeksUtama">{ringkasan.namaLahan}</span>
                    <LencanaKomoditas namaKomoditas={ringkasan.komoditas} />
                    <LencanaRisiko tingkatRisiko={ringkasan.tingkatRisiko} />
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-pestguardAbuTeks">
                    {ringkasan.hamaDominan}, {ringkasan.totalDeteksiMingguIni} dari {ringkasan.ambangBatasMingguan} batas aman
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-pestguardAbuTeks" aria-hidden />
              </button>
            </li>
          );
        })}
      </ol>
    </KartuDasar>
  );
}
