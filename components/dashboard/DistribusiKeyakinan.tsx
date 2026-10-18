import type { RingkasanLahan, TingkatKeyakinanDeteksi } from "@/lib/types";
import KartuDasar from "@/components/ui/KartuDasar";

const KONFIGURASI_TINGKAT: { kunci: TingkatKeyakinanDeteksi; label: string; warna: string; arti: string }[] = [
  { kunci: "tinggi", label: "Yakin", warna: "#16653f", arti: "75 persen ke atas, bisa langsung dipercaya" },
  { kunci: "sedang", label: "Cukup yakin", warna: "#b8800a", arti: "50 sampai 74 persen, sebaiknya dicek" },
  { kunci: "rendah", label: "Kurang yakin", warna: "#b3281e", arti: "di bawah 50 persen, wajib dicek langsung" },
];

export default function DistribusiKeyakinan({ ringkasanLahan }: { ringkasanLahan: RingkasanLahan }) {
  const distribusi = ringkasanLahan.distribusiKeyakinan;
  const totalDeteksi = distribusi.tinggi + distribusi.sedang + distribusi.rendah;

  return (
    <KartuDasar judulKartu="Seberapa yakin sistem" keteranganKartu="Dari foto perangkap terbaru. Semakin hijau, semakin bisa dipercaya.">
      {totalDeteksi === 0 ? (
        <p className="text-sm text-pestguardAbuTeks">Belum ada deteksi pada foto terbaru.</p>
      ) : (
        <>
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-pestguardHijauLembut" role="img" aria-label={`Yakin ${distribusi.tinggi}, cukup yakin ${distribusi.sedang}, kurang yakin ${distribusi.rendah}`}>
            {KONFIGURASI_TINGKAT.map(({ kunci, warna }) => (
              <div key={kunci} style={{ width: `${(distribusi[kunci] / totalDeteksi) * 100}%`, backgroundColor: warna }} />
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {KONFIGURASI_TINGKAT.map(({ kunci, label, warna, arti }) => (
              <li key={kunci} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: warna }} aria-hidden />
                <span>
                  <span className="font-semibold text-pestguardTeksUtama">
                    {label}: {distribusi[kunci]} hama
                  </span>
                  <span className="block text-pestguardAbuTeks">{arti}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </KartuDasar>
  );
}
