import type { RingkasanLahan } from "@/lib/types";
import KartuDasar from "@/components/ui/KartuDasar";
import { TANGGAL_ACUAN_SIMULASI_ISO } from "@/lib/mockData";
import { tambahHariKeTanggal } from "@/lib/utils";

const LEBAR_GRAFIK = 560;
const TINGGI_GRAFIK = 220;
const MARGIN_KIRI = 34;
const MARGIN_KANAN = 16;
const MARGIN_ATAS = 16;
const MARGIN_BAWAH = 30;

/** Grafik garis sederhana dengan SVG, tanpa pustaka tambahan, supaya ringan dan mudah dipahami */
export default function GrafikTrenTujuhHari({ ringkasanLahan }: { ringkasanLahan: RingkasanLahan }) {
  const daftarNilaiHarian = ringkasanLahan.trenTujuhHariTerakhir;
  const batasHarianAman = ringkasanLahan.ambangBatasMingguan / 7;
  const nilaiMaksimumSumbu = Math.max(...daftarNilaiHarian, batasHarianAman) * 1.2;

  const lebarArea = LEBAR_GRAFIK - MARGIN_KIRI - MARGIN_KANAN;
  const tinggiArea = TINGGI_GRAFIK - MARGIN_ATAS - MARGIN_BAWAH;
  const hitungPosisiX = (indeks: number) => MARGIN_KIRI + (indeks / (daftarNilaiHarian.length - 1)) * lebarArea;
  const hitungPosisiY = (nilai: number) => MARGIN_ATAS + tinggiArea - (nilai / nilaiMaksimumSumbu) * tinggiArea;

  const titikGaris = daftarNilaiHarian.map((nilai, indeks) => `${hitungPosisiX(indeks)},${hitungPosisiY(nilai)}`).join(" ");
  const titikAreaIsi = `${hitungPosisiX(0)},${MARGIN_ATAS + tinggiArea} ${titikGaris} ${hitungPosisiX(daftarNilaiHarian.length - 1)},${MARGIN_ATAS + tinggiArea}`;

  const labelHari = daftarNilaiHarian.map((_, indeks) => {
    const tanggal = tambahHariKeTanggal(TANGGAL_ACUAN_SIMULASI_ISO, indeks - (daftarNilaiHarian.length - 1));
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(new Date(tanggal));
  });

  const deskripsiGrafik = `Jumlah hama per hari di ${ringkasanLahan.namaLahan} selama 7 hari terakhir: ${daftarNilaiHarian.join(", ")}.`;

  return (
    <KartuDasar judulKartu="Perkembangan 7 hari terakhir" keteranganKartu="Garis putus-putus adalah batas aman harian. Bila garis hijau di atasnya, hama sedang banyak.">
      <svg viewBox={`0 0 ${LEBAR_GRAFIK} ${TINGGI_GRAFIK}`} className="h-auto w-full" role="img" aria-label={deskripsiGrafik}>
        {[0, 0.5, 1].map((bagian) => {
          const nilaiSumbu = Math.round(nilaiMaksimumSumbu * bagian);
          const posisiY = hitungPosisiY(nilaiSumbu);
          return (
            <g key={bagian}>
              <line x1={MARGIN_KIRI} x2={LEBAR_GRAFIK - MARGIN_KANAN} y1={posisiY} y2={posisiY} stroke="#dbe7df" strokeWidth={1} />
              <text x={MARGIN_KIRI - 6} y={posisiY + 4} textAnchor="end" fontSize={10} fill="#5b6b62">
                {nilaiSumbu}
              </text>
            </g>
          );
        })}

        <polygon points={titikAreaIsi} fill="#e4f3e8" opacity={0.8} />
        <line
          x1={MARGIN_KIRI}
          x2={LEBAR_GRAFIK - MARGIN_KANAN}
          y1={hitungPosisiY(batasHarianAman)}
          y2={hitungPosisiY(batasHarianAman)}
          stroke="#b3281e"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text x={LEBAR_GRAFIK - MARGIN_KANAN} y={hitungPosisiY(batasHarianAman) - 5} textAnchor="end" fontSize={10} fill="#b3281e">
          batas aman harian
        </text>
        <polyline points={titikGaris} fill="none" stroke="#16653f" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {daftarNilaiHarian.map((nilai, indeks) => (
          <g key={indeks}>
            <circle cx={hitungPosisiX(indeks)} cy={hitungPosisiY(nilai)} r={4} fill="#ffffff" stroke="#16653f" strokeWidth={2} />
            <text x={hitungPosisiX(indeks)} y={hitungPosisiY(nilai) - 9} textAnchor="middle" fontSize={10} fontWeight={600} fill="#0f3d2e">
              {nilai}
            </text>
            <text x={hitungPosisiX(indeks)} y={TINGGI_GRAFIK - 8} textAnchor="middle" fontSize={10} fill="#5b6b62">
              {labelHari[indeks]}
            </text>
          </g>
        ))}
      </svg>
    </KartuDasar>
  );
}
