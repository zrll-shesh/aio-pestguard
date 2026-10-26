"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { RingkasanLahan, SesiPemantauanLahan } from "@/lib/types";
import KartuDasar from "@/components/ui/KartuDasar";
import { LencanaKomoditas } from "@/components/ui/LencanaStatus";
import { formatAngkaSebagaiPersen, gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import { hitungRataRataKeyakinan } from "@/lib/insightEngine";

interface PropsTabelRiwayatSesi {
  daftarSesiPemantauan: SesiPemantauanLahan[];
  daftarRingkasanLahan: RingkasanLahan[];
}

export default function TabelRiwayatSesi({ daftarSesiPemantauan, daftarRingkasanLahan }: PropsTabelRiwayatSesi) {
  const { p, komoditas, tanggal } = useBahasa();
  const [idLahanFilter, setIdLahanFilter] = useState<string>("semua");

  const daftarSesiTersaring = useMemo(
    () => daftarSesiPemantauan.filter((sesi) => idLahanFilter === "semua" || sesi.idLahan === idLahanFilter),
    [daftarSesiPemantauan, idLahanFilter]
  );

  const cariLahan = (idLahan: string) => daftarRingkasanLahan.find((r) => r.idLahan === idLahan);

  return (
    <KartuDasar judulKartu={p({ id: "Semua sesi pemantauan", en: "All monitoring sessions", ko: "전체 관찰 기록" })} keteranganKartu={p({ id: "Setiap baris adalah satu kali foto perangkap beserta hasil deteksinya.", en: "Each row is one trap photo and its detection results.", ko: "한 줄이 트랩 사진 한 장과 그 탐지 결과입니다." })}>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={p({ id: "Saring berdasarkan lahan", en: "Filter by field", ko: "농지별 보기" })}>
        {[{ idLahan: "semua", namaLahan: p({ id: "Semua lahan", en: "All fields", ko: "전체 농지" }) }, ...daftarRingkasanLahan].map((opsi) => (
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
            <tr className="text-[12px] text-pestguardAbuTeks">
              <th className="pb-2 font-semibold">{p({ id: "Waktu", en: "Time", ko: "시간" })}</th>
              <th className="pb-2 font-semibold">{p({ id: "Lahan", en: "Field", ko: "농지" })}</th>
              <th className="pb-2 font-semibold">{p({ id: "Kamera", en: "Camera", ko: "카메라" })}</th>
              <th className="pb-2 text-right font-semibold">{p({ id: "Hama", en: "Pests", ko: "해충" })}</th>
              <th className="pb-2 font-semibold">{p({ id: "Keyakinan rata-rata", en: "Average confidence", ko: "평균 신뢰도" })}</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {daftarSesiTersaring.map((sesi) => {
              const lahan = cariLahan(sesi.idLahan);
              return (
                <tr key={sesi.idSesi} className="border-t border-pestguardAbuGaris">
                  <td className="py-3 text-pestguardTeksUtama">
                    {tanggal(sesi.waktuPengambilan, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    <p className="font-pestguardMono text-xs text-pestguardAbuTeks">{sesi.idSesi}</p>
                  </td>
                  <td className="py-3">
                    <p className="font-semibold">{lahan?.namaLahan}</p>
                    {lahan && <LencanaKomoditas namaKomoditas={komoditas(lahan.komoditas)} />}
                  </td>
                  <td className="py-3 text-pestguardAbuTeks">
                    {sesi.labelKamera
                      .replace("Perangkap", p({ id: "Perangkap", en: "Trap", ko: "트랩" }))
                      .replace("(pagi)", p({ id: "(pagi)", en: "(morning)", ko: "(아침)" }))
                      .replace("(sore)", p({ id: "(sore)", en: "(afternoon)", ko: "(오후)" }))}
                  </td>
                  <td className="py-3 text-right font-pestguardMono text-lg font-semibold text-pestguardHijauTua">{sesi.daftarDeteksi.length}</td>
                  <td className="py-3 font-pestguardMono">{formatAngkaSebagaiPersen(hitungRataRataKeyakinan(sesi.daftarDeteksi))}</td>
                  <td className="py-3 text-right">
                    <Link href={`/riwayat/${sesi.idSesi}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-pestguardHijauUtama hover:bg-pestguardHijauLembut">
                      {p({ id: "Lihat", en: "View", ko: "보기" })} <ChevronRight className="h-4 w-4" aria-hidden />
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
