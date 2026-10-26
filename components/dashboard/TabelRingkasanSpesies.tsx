"use client";

import type { HasilDeteksiHama } from "@/lib/types";
import KartuDasar from "@/components/ui/KartuDasar";
import { LencanaKeyakinan, LencanaKomoditas } from "@/components/ui/LencanaStatus";
import { formatAngkaSebagaiPersen } from "@/lib/utils";
import { hitungRataRataKeyakinan, tentukanTingkatKeyakinan } from "@/lib/insightEngine";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import { namaHamaDariDeteksi } from "@/lib/i18n/wawasanLahan";
import type { JenisKomoditas } from "@/lib/types";

interface BarisSpesies {
  namaIndonesia: string;
  namaIp102: string;
  komoditas: string;
  contoh: HasilDeteksiHama;
  jumlahTerdeteksi: number;
  rataRataKeyakinan: number;
}

/** Mengelompokkan deteksi per jenis hama, lalu mengurutkan dari yang paling banyak */
function kelompokkanDeteksiPerSpesies(daftarDeteksi: HasilDeteksiHama[]): BarisSpesies[] {
  const peta = new Map<number, HasilDeteksiHama[]>();
  for (const deteksi of daftarDeteksi) {
    peta.set(deteksi.class_id, [...(peta.get(deteksi.class_id) ?? []), deteksi]);
  }
  return Array.from(peta.values())
    .map((kelompok) => ({
      namaIndonesia: kelompok[0].nama_indonesia,
      namaIp102: kelompok[0].class_name_ip102,
      komoditas: kelompok[0].komoditas,
      contoh: kelompok[0],
      jumlahTerdeteksi: kelompok.length,
      rataRataKeyakinan: hitungRataRataKeyakinan(kelompok),
    }))
    .sort((a, b) => b.jumlahTerdeteksi - a.jumlahTerdeteksi);
}

export default function TabelRingkasanSpesies({ daftarDeteksi }: { daftarDeteksi: HasilDeteksiHama[] }) {
  const { bahasa, p, komoditas } = useBahasa();
  const daftarBaris = kelompokkanDeteksiPerSpesies(daftarDeteksi);

  return (
    <KartuDasar judulKartu={p({ id: "Jenis hama yang ditemukan", en: "Pest types found", ko: "발견된 해충 종류" })} keteranganKartu={p({ id: "Dikelompokkan per jenis pada foto ini.", en: "Grouped by type in this photo.", ko: "이 사진에서 종류별로 묶었습니다." })}>
      {daftarBaris.length === 0 ? (
        <p className="text-sm text-pestguardAbuTeks">{p({ id: "Tidak ada hama terdeteksi pada foto ini.", en: "No pests detected in this photo.", ko: "이 사진에서 해충이 탐지되지 않았습니다." })}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-[12px] text-pestguardAbuTeks">
                <th className="pb-2 font-semibold">{p({ id: "Hama", en: "Pest", ko: "해충" })}</th>
                <th className="pb-2 font-semibold">{p({ id: "Tanaman", en: "Crop", ko: "작물" })}</th>
                <th className="pb-2 text-right font-semibold">{p({ id: "Jumlah", en: "Count", ko: "수" })}</th>
                <th className="pb-2 font-semibold">{p({ id: "Keyakinan", en: "Confidence", ko: "신뢰도" })}</th>
              </tr>
            </thead>
            <tbody>
              {daftarBaris.map((baris) => (
                <tr key={baris.namaIp102} className="border-t border-pestguardAbuGaris">
                  <td className="py-3">
                    <p className="font-semibold text-pestguardTeksUtama">{namaHamaDariDeteksi(bahasa, baris.contoh)}</p>
                    <p className="font-pestguardMono text-xs text-pestguardAbuTeks">{baris.namaIp102}</p>
                  </td>
                  <td className="py-3">
                    <LencanaKomoditas namaKomoditas={komoditas(baris.komoditas as JenisKomoditas)} />
                  </td>
                  <td className="py-3 text-right font-pestguardMono text-lg font-semibold text-pestguardHijauTua">{baris.jumlahTerdeteksi}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-pestguardMono text-sm">{formatAngkaSebagaiPersen(baris.rataRataKeyakinan)}</span>
                      <LencanaKeyakinan tingkatKeyakinan={tentukanTingkatKeyakinan(baris.rataRataKeyakinan)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </KartuDasar>
  );
}
