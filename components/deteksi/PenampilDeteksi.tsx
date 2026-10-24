"use client";

import { useState } from "react";
import { Download, Eye, EyeOff, ImageIcon, Loader2 } from "lucide-react";
import type { DeteksiTerolah } from "@/lib/model/wawasanPrediksi";
import { AMBANG_F1_TERTINGGI, AMBANG_KANDIDAT_MINIMUM, AMBANG_KEYAKINAN_DEFAULT } from "@/lib/model/konfigurasiModel";
import { gabungkanNamaKelas } from "@/lib/utils";

export const WARNA_KOTAK = { tinggi: "#4ade80", sedang: "#facc15", rendah: "#fb7185" } as const;

interface PropsPenampilDeteksi {
  alamatGambar: string;
  judulGambar: string;
  ukuranGambar: { lebar: number; tinggi: number } | null;
  daftarDeteksi: DeteksiTerolah[] | null;
  ambangKeyakinan: number;
  saatAmbangBerubah: (ambangBaru: number) => void;
  idDeteksiTerpilih: string | null;
  saatDeteksiDipilih: (idDeteksi: string | null) => void;
  sedangBerjalan: boolean;
  namaBerkasUnduhan: string;
}

/** "Uret (larva kumbang tanah)" menjadi "Uret" supaya label di foto tetap ringkas */
export function namaPendek(nama: string) {
  return nama.replace(/\s*\(.*\)\s*/, "").split(" / ")[0];
}

function persen(nilai: number) {
  return `${Math.round(nilai * 100)}%`;
}

export default function PenampilDeteksi({
  alamatGambar,
  judulGambar,
  ukuranGambar,
  daftarDeteksi,
  ambangKeyakinan,
  saatAmbangBerubah,
  idDeteksiTerpilih,
  saatDeteksiDipilih,
  sedangBerjalan,
  namaBerkasUnduhan,
}: PropsPenampilDeteksi) {
  const [tampilkanLabel, setTampilkanLabel] = useState(true);
  const adaHasil = daftarDeteksi !== null && ukuranGambar !== null;
  const sisiTerpanjang = ukuranGambar ? Math.max(ukuranGambar.lebar, ukuranGambar.tinggi) : 640;
  const tebalGaris = Math.max(2, sisiTerpanjang * 0.0045);
  const ukuranHuruf = Math.max(11, sisiTerpanjang * 0.03);

  const unduhGambarBeranotasi = async () => {
    if (!ukuranGambar || !daftarDeteksi) return;
    const gambar = new Image();
    gambar.src = alamatGambar;
    await gambar.decode();
    const kanvas = document.createElement("canvas");
    kanvas.width = ukuranGambar.lebar;
    kanvas.height = ukuranGambar.tinggi;
    const konteks = kanvas.getContext("2d");
    if (!konteks) return;
    konteks.drawImage(gambar, 0, 0);
    konteks.font = `600 ${ukuranHuruf}px system-ui, sans-serif`;
    konteks.textBaseline = "top";
    for (const deteksi of daftarDeteksi) {
      const [x1, y1, x2, y2] = deteksi.kotak;
      const warna = WARNA_KOTAK[deteksi.tingkatKeyakinan];
      konteks.strokeStyle = warna;
      konteks.lineWidth = tebalGaris;
      konteks.strokeRect(x1, y1, x2 - x1, y2 - y1);
      const teks = `${deteksi.nomor}. ${namaPendek(deteksi.kelas.namaIndonesia)} ${persen(deteksi.skor)}`;
      const lebarTeks = konteks.measureText(teks).width + ukuranHuruf * 0.6;
      const tinggiLabel = ukuranHuruf * 1.45;
      const yLabel = y1 - tinggiLabel >= 0 ? y1 - tinggiLabel : y1;
      konteks.fillStyle = warna;
      konteks.fillRect(x1, yLabel, lebarTeks, tinggiLabel);
      konteks.fillStyle = "#0a2e21";
      konteks.fillText(teks, x1 + ukuranHuruf * 0.3, yLabel + ukuranHuruf * 0.22);
    }
    const tautan = document.createElement("a");
    tautan.href = kanvas.toDataURL("image/png");
    tautan.download = namaBerkasUnduhan;
    tautan.click();
  };

  const persenIsiPenggeser = ((ambangKeyakinan - AMBANG_KANDIDAT_MINIMUM) / (0.95 - AMBANG_KANDIDAT_MINIMUM)) * 100;

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-pestguardKartu border border-pestguardAbuGaris bg-white shadow-pestguardKartu">
      <div className="pestguard-nampan relative flex min-h-[300px] flex-1 items-center justify-center p-4 sm:min-h-[420px] sm:p-6">
        <div className="relative max-h-[560px] w-full max-w-full" style={ukuranGambar ? { aspectRatio: `${ukuranGambar.lebar} / ${ukuranGambar.tinggi}`, maxWidth: `min(100%, ${(560 * ukuranGambar.lebar) / ukuranGambar.tinggi}px)` } : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={alamatGambar}
            alt={`Gambar uji: ${judulGambar}`}
            className={gabungkanNamaKelas(
              "block h-full w-full rounded-lg object-contain shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-opacity",
              sedangBerjalan && "opacity-60"
            )}
          />
          {adaHasil && (
            <svg
              viewBox={`0 0 ${ukuranGambar.lebar} ${ukuranGambar.tinggi}`}
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              role="img"
              aria-label={`${daftarDeteksi.length} kotak deteksi`}
            >
              {daftarDeteksi.map((deteksi) => {
                const [x1, y1, x2, y2] = deteksi.kotak;
                const warna = WARNA_KOTAK[deteksi.tingkatKeyakinan];
                const terpilih = idDeteksiTerpilih === deteksi.idDeteksi;
                const redup = idDeteksiTerpilih !== null && !terpilih;
                const teks = `${deteksi.nomor}. ${namaPendek(deteksi.kelas.namaIndonesia)} ${persen(deteksi.skor)}`;
                const tinggiLabel = ukuranHuruf * 1.45;
                const yLabel = y1 - tinggiLabel >= 0 ? y1 - tinggiLabel : y1;
                const lebarLabel = teks.length * ukuranHuruf * 0.62 + ukuranHuruf * 0.6;
                return (
                  <g
                    key={deteksi.idDeteksi}
                    opacity={redup ? 0.35 : 1}
                    className="cursor-pointer"
                    onClick={() => saatDeteksiDipilih(terpilih ? null : deteksi.idDeteksi)}
                  >
                    <rect
                      x={x1}
                      y={y1}
                      width={Math.max(1, x2 - x1)}
                      height={Math.max(1, y2 - y1)}
                      fill={terpilih ? "rgba(255,255,255,0.08)" : "transparent"}
                      stroke={warna}
                      strokeWidth={terpilih ? tebalGaris * 1.8 : tebalGaris}
                      vectorEffect="non-scaling-stroke"
                      style={{ strokeWidth: terpilih ? 3.5 : 2.25 }}
                    />
                    {(tampilkanLabel || terpilih) && (
                      <g>
                        <rect x={x1} y={yLabel} width={lebarLabel} height={tinggiLabel} fill={warna} rx={ukuranHuruf * 0.15} />
                        <text
                          x={x1 + ukuranHuruf * 0.3}
                          y={yLabel + tinggiLabel * 0.72}
                          fontSize={ukuranHuruf}
                          fontWeight={600}
                          fill="#0a2e21"
                          style={{ fontFamily: "var(--font-pestguard-teks), system-ui, sans-serif" }}
                        >
                          {teks}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {sedangBerjalan && (
          <div className="absolute inset-x-0 top-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-pestguardHijauTua shadow">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Model sedang bekerja di browser Anda
            </span>
          </div>
        )}
        {!adaHasil && !sedangBerjalan && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
              <ImageIcon className="h-3.5 w-3.5" aria-hidden /> Pratinjau. Kotak deteksi muncul setelah prediksi dijalankan.
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-pestguardAbuGaris p-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="penggeser-ambang" className="text-[13.5px] font-semibold text-pestguardTeksUtama">
              Kepekaan: tampilkan temuan dengan keyakinan minimal
            </label>
            <span className="font-pestguardDisplay text-lg font-semibold text-pestguardHijauUtama">{persen(ambangKeyakinan)}</span>
          </div>
          <input
            id="penggeser-ambang"
            type="range"
            min={AMBANG_KANDIDAT_MINIMUM}
            max={0.95}
            step={0.01}
            value={ambangKeyakinan}
            onChange={(e) => saatAmbangBerubah(Number(e.target.value))}
            className="pestguard-penggeser mt-2"
            style={{ ["--isi" as string]: `${persenIsiPenggeser}%` }}
            aria-describedby="keterangan-ambang"
          />
          <div id="keterangan-ambang" className="mt-2 flex flex-wrap gap-1.5">
            {[
              { nilai: AMBANG_F1_TERTINGGI, label: "Teliti (20%)", arti: "lebih banyak temuan, sebagian bisa keliru" },
              { nilai: AMBANG_KEYAKINAN_DEFAULT, label: "Seimbang (35%)", arti: "bawaan sistem" },
              { nilai: 0.6, label: "Ketat (60%)", arti: "hanya yang paling pasti" },
            ].map((pilihan) => (
              <button
                key={pilihan.nilai}
                type="button"
                onClick={() => saatAmbangBerubah(pilihan.nilai)}
                title={pilihan.arti}
                className={gabungkanNamaKelas(
                  "min-h-[36px] rounded-full border px-3 py-1 text-[12.5px] font-semibold transition-colors",
                  Math.abs(ambangKeyakinan - pilihan.nilai) < 0.005
                    ? "border-pestguardHijauUtama bg-pestguardHijauLembut text-pestguardHijauTua"
                    : "border-pestguardAbuGaris text-pestguardAbuTeks hover:border-pestguardHijauMuda"
                )}
              >
                {pilihan.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] leading-snug text-pestguardAbuTeks">
            Geser ke kiri untuk melihat temuan yang samar, ke kanan untuk hanya menampilkan yang paling pasti. Hasil berubah langsung.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setTampilkanLabel((nilai) => !nilai)}
            disabled={!adaHasil}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-pestguardAbuGaris px-3 py-2 text-[13px] font-semibold text-pestguardHijauTua hover:bg-pestguardHijauPudar disabled:opacity-40"
            aria-pressed={tampilkanLabel}
          >
            {tampilkanLabel ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            {tampilkanLabel ? "Sembunyikan label" : "Tampilkan label"}
          </button>
          <button
            type="button"
            onClick={unduhGambarBeranotasi}
            disabled={!adaHasil}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[10px] border border-pestguardAbuGaris px-3 py-2 text-[13px] font-semibold text-pestguardHijauTua hover:bg-pestguardHijauPudar disabled:opacity-40"
          >
            <Download className="h-4 w-4" aria-hidden /> PNG
          </button>
        </div>
      </div>
    </section>
  );
}
