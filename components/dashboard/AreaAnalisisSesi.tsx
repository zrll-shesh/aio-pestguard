"use client";

import { useState } from "react";
import type { RingkasanLahan, SesiPemantauanLahan } from "@/lib/types";
import PanelGambarDeteksi from "./PanelGambarDeteksi";
import TabelRingkasanSpesies from "./TabelRingkasanSpesies";
import PanelWawasanHama from "./PanelWawasanHama";

interface PropsAreaAnalisisSesi {
  sesiPemantauan: SesiPemantauanLahan;
  ringkasanLahan: RingkasanLahan;
}

/**
 * Gabungan foto, tabel spesies, dan wawasan hama untuk SATU sesi.
 * Dipakai di Beranda (sesi terbaru) dan di halaman detail Riwayat Sesi.
 * Pemilihan hama disimpan di sini agar foto dan panel wawasan selalu sinkron.
 */
export default function AreaAnalisisSesi({ sesiPemantauan, ringkasanLahan }: PropsAreaAnalisisSesi) {
  const [idDeteksiTerpilih, setIdDeteksiTerpilih] = useState<string | null>(sesiPemantauan.daftarDeteksi[0]?.idDeteksiUnik ?? null);
  const deteksiTerpilih = sesiPemantauan.daftarDeteksi.find((d) => d.idDeteksiUnik === idDeteksiTerpilih) ?? null;

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <div className="space-y-4 xl:col-span-3">
        <PanelGambarDeteksi
          sesiPemantauan={sesiPemantauan}
          komoditas={ringkasanLahan.komoditas}
          idDeteksiTerpilih={idDeteksiTerpilih}
          saatDeteksiDipilih={setIdDeteksiTerpilih}
        />
        <TabelRingkasanSpesies daftarDeteksi={sesiPemantauan.daftarDeteksi} />
      </div>
      <div className="xl:col-span-2">
        <PanelWawasanHama deteksiTerpilih={deteksiTerpilih} ringkasanLahan={ringkasanLahan} />
      </div>
    </div>
  );
}
