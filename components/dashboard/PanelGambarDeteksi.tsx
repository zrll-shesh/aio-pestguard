"use client";

import { useId } from "react";
import type { HasilDeteksiHama, JenisKomoditas, SesiPemantauanLahan } from "@/lib/types";
import { LEBAR_GAMBAR_SIMULASI_PIKSEL, TINGGI_GAMBAR_SIMULASI_PIKSEL } from "@/lib/mockData";
import KartuDasar from "@/components/ui/KartuDasar";
import { formatAngkaSebagaiPersen, formatTanggalDanJam, gabungkanNamaKelas } from "@/lib/utils";

const WARNA_KOTAK_PER_KEYAKINAN = { tinggi: "#16653f", sedang: "#b8800a", rendah: "#b3281e" } as const;

const WARNA_LATAR_PER_KOMODITAS: Record<JenisKomoditas, { atas: string; bawah: string }> = {
  Padi: { atas: "#e7f2d8", bawah: "#c5dfa4" },
  Jagung: { atas: "#eef2cf", bawah: "#d3dd98" },
  Bawang: { atas: "#eef0e6", bawah: "#d4d9c2" },
};

interface PropsPanelGambarDeteksi {
  sesiPemantauan: SesiPemantauanLahan;
  komoditas: JenisKomoditas;
  idDeteksiTerpilih: string | null;
  saatDeteksiDipilih: (idDeteksiUnik: string) => void;
}

/**
 * Foto perangkap SIMULASI. Latar digambar dengan SVG dan kotak deteksi memakai koordinat
 * bbox_xyxy dalam piksel, diubah menjadi persen terhadap ukuran gambar. Saat model asli
 * tersambung, latar diganti foto asli tetapi perhitungan kotaknya tetap sama.
 */
export default function PanelGambarDeteksi({
  sesiPemantauan,
  komoditas,
  idDeteksiTerpilih,
  saatDeteksiDipilih,
}: PropsPanelGambarDeteksi) {
  const idGradien = useId();
  const warnaLatar = WARNA_LATAR_PER_KOMODITAS[komoditas];

  return (
    <KartuDasar
      judulKartu="Foto perangkap dan hama yang ditemukan"
      keteranganKartu={`${sesiPemantauan.labelKamera}, ${formatTanggalDanJam(sesiPemantauan.waktuPengambilan)}. Klik kotak untuk melihat detail hama.`}
    >
      <div className="overflow-hidden rounded-xl border border-pestguardAbuGaris">
        <div className="relative w-full" style={{ aspectRatio: `${LEBAR_GAMBAR_SIMULASI_PIKSEL} / ${TINGGI_GAMBAR_SIMULASI_PIKSEL}` }}>
          <svg
            viewBox={`0 0 ${LEBAR_GAMBAR_SIMULASI_PIKSEL} ${TINGGI_GAMBAR_SIMULASI_PIKSEL}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id={idGradien} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={warnaLatar.atas} />
                <stop offset="100%" stopColor={warnaLatar.bawah} />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${idGradien})`} />
            {Array.from({ length: 16 }).map((_, indeks) => (
              <line key={indeks} x1={indeks * 90} y1={0} x2={indeks * 90 - 140} y2={TINGGI_GAMBAR_SIMULASI_PIKSEL} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={14} />
            ))}
            <rect x="40" y="40" width={LEBAR_GAMBAR_SIMULASI_PIKSEL - 80} height={TINGGI_GAMBAR_SIMULASI_PIKSEL - 80} rx="18" fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={4} strokeDasharray="14 10" />
            {sesiPemantauan.daftarDeteksi.map((deteksi) => {
              const [x1, y1, x2, y2] = deteksi.bbox_xyxy;
              return <ellipse key={deteksi.idDeteksiUnik} cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} rx={(x2 - x1) / 5} ry={(y2 - y1) / 6} fill="#5a3b24" opacity={0.85} />;
            })}
          </svg>

          {sesiPemantauan.daftarDeteksi.map((deteksi) => (
            <KotakDeteksi
              key={deteksi.idDeteksiUnik}
              deteksi={deteksi}
              sedangDipilih={deteksi.idDeteksiUnik === idDeteksiTerpilih}
              saatDipilih={() => saatDeteksiDipilih(deteksi.idDeteksiUnik)}
            />
          ))}
          <span className="absolute bottom-2 right-3 rounded bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white">Gambar contoh (simulasi)</span>
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-4 text-xs text-pestguardAbuTeks" aria-label="Arti warna kotak">
        {(["tinggi", "sedang", "rendah"] as const).map((tingkat) => (
          <li key={tingkat} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border-2" style={{ borderColor: WARNA_KOTAK_PER_KEYAKINAN[tingkat] }} aria-hidden />
            {tingkat === "tinggi" ? "Yakin" : tingkat === "sedang" ? "Cukup yakin" : "Kurang yakin"}
          </li>
        ))}
      </ul>
    </KartuDasar>
  );
}

function KotakDeteksi({
  deteksi,
  sedangDipilih,
  saatDipilih,
}: {
  deteksi: HasilDeteksiHama;
  sedangDipilih: boolean;
  saatDipilih: () => void;
}) {
  const [x1, y1, x2, y2] = deteksi.bbox_xyxy;
  const warna = WARNA_KOTAK_PER_KEYAKINAN[deteksi.tingkatKeyakinan];
  return (
    <button
      type="button"
      onClick={saatDipilih}
      aria-label={`${deteksi.nama_indonesia}, keyakinan ${formatAngkaSebagaiPersen(deteksi.confidence)}`}
      className={gabungkanNamaKelas("absolute rounded-sm border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pestguardHijauTua", sedangDipilih ? "bg-white/25" : "hover:bg-white/15")}
      style={{
        left: `${(x1 / LEBAR_GAMBAR_SIMULASI_PIKSEL) * 100}%`,
        top: `${(y1 / TINGGI_GAMBAR_SIMULASI_PIKSEL) * 100}%`,
        width: `${((x2 - x1) / LEBAR_GAMBAR_SIMULASI_PIKSEL) * 100}%`,
        height: `${((y2 - y1) / TINGGI_GAMBAR_SIMULASI_PIKSEL) * 100}%`,
        borderColor: warna,
        boxShadow: sedangDipilih ? `0 0 0 3px ${warna}55` : undefined,
      }}
    >
      <span className={gabungkanNamaKelas("absolute -top-5 whitespace-nowrap rounded px-1.5 py-0.5 font-pestguardMono text-[10px] font-semibold text-white", x1 / LEBAR_GAMBAR_SIMULASI_PIKSEL > 0.7 ? "right-0" : "left-0")} style={{ backgroundColor: warna }}>
        {deteksi.nama_indonesia} {formatAngkaSebagaiPersen(deteksi.confidence)}
      </span>
    </button>
  );
}
