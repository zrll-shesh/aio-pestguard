import type { HasilDeteksiHama } from "@/lib/types";
import KartuDasar from "@/components/ui/KartuDasar";
import { LencanaKeyakinan, LencanaKomoditas } from "@/components/ui/LencanaStatus";
import { formatAngkaSebagaiPersen } from "@/lib/utils";
import { hitungRataRataKeyakinan, tentukanTingkatKeyakinan } from "@/lib/insightEngine";

interface BarisSpesies {
  namaIndonesia: string;
  namaIp102: string;
  komoditas: string;
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
      jumlahTerdeteksi: kelompok.length,
      rataRataKeyakinan: hitungRataRataKeyakinan(kelompok),
    }))
    .sort((a, b) => b.jumlahTerdeteksi - a.jumlahTerdeteksi);
}

export default function TabelRingkasanSpesies({ daftarDeteksi }: { daftarDeteksi: HasilDeteksiHama[] }) {
  const daftarBaris = kelompokkanDeteksiPerSpesies(daftarDeteksi);

  return (
    <KartuDasar judulKartu="Jenis hama yang ditemukan" keteranganKartu="Dikelompokkan per jenis pada foto ini.">
      {daftarBaris.length === 0 ? (
        <p className="text-sm text-pestguardAbuTeks">Tidak ada hama terdeteksi pada foto ini.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-[12px] text-pestguardAbuTeks">
                <th className="pb-2 font-semibold">Hama</th>
                <th className="pb-2 font-semibold">Tanaman</th>
                <th className="pb-2 text-right font-semibold">Jumlah</th>
                <th className="pb-2 font-semibold">Keyakinan</th>
              </tr>
            </thead>
            <tbody>
              {daftarBaris.map((baris) => (
                <tr key={baris.namaIp102} className="border-t border-pestguardAbuGaris">
                  <td className="py-3">
                    <p className="font-semibold text-pestguardTeksUtama">{baris.namaIndonesia}</p>
                    <p className="font-pestguardMono text-xs text-pestguardAbuTeks">{baris.namaIp102}</p>
                  </td>
                  <td className="py-3">
                    <LencanaKomoditas namaKomoditas={baris.komoditas} />
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
