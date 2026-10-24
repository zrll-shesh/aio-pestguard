import { ArrowDownRight, ArrowUpRight, Bug, Gauge, ScanSearch } from "lucide-react";
import type { RingkasanLahan } from "@/lib/types";
import { formatAngkaSebagaiPersen, gabungkanNamaKelas } from "@/lib/utils";
import { BATAS_RATA_RATA_KEYAKINAN_DIPERCAYA } from "@/lib/insightEngine";

export default function KartuAngkaRingkas({ ringkasanLahan }: { ringkasanLahan: RingkasanLahan }) {
  const lebarBatangAmbang = Math.min(ringkasanLahan.persenDariAmbangBatas, 100);
  const hamaNaik = ringkasanLahan.perubahanMingguanPersen > 5;
  const hamaTurun = ringkasanLahan.perubahanMingguanPersen < -5;
  const keyakinanDipercaya = ringkasanLahan.rataRataKeyakinanHariIni >= BATAS_RATA_RATA_KEYAKINAN_DIPERCAYA;

  const kelasKartu = "rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu";
  const kelasJudul = "flex items-center gap-2 text-[12px] font-semibold text-pestguardAbuTeks";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className={kelasKartu}>
        <p className={kelasJudul}>
          <Bug className="h-4 w-4" aria-hidden /> Hama hari ini
        </p>
        <p className="mt-2 font-pestguardMono text-4xl font-semibold text-pestguardHijauTua">{ringkasanLahan.totalDeteksiHariIni}</p>
        <p className="mt-1 text-sm text-pestguardAbuTeks">total dari semua foto perangkap hari ini</p>
      </div>

      <div className={kelasKartu}>
        <p className={kelasJudul}>
          <Gauge className="h-4 w-4" aria-hidden /> Minggu ini dari batas aman
        </p>
        <p className="mt-2 font-pestguardMono text-4xl font-semibold text-pestguardHijauTua">
          {ringkasanLahan.totalDeteksiMingguIni}
          <span className="text-lg text-pestguardAbuTeks"> / {ringkasanLahan.ambangBatasMingguan}</span>
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-pestguardHijauLembut" aria-hidden>
          <div
            className={gabungkanNamaKelas(
              "h-full rounded-full",
              ringkasanLahan.tingkatRisiko === "tinggi" ? "bg-pestguardMerahPeringatan" : ringkasanLahan.tingkatRisiko === "sedang" ? "bg-pestguardKuningPeringatan" : "bg-pestguardHijauSedang"
            )}
            style={{ width: `${lebarBatangAmbang}%` }}
          />
        </div>
        <p className="mt-1 text-sm text-pestguardAbuTeks">{ringkasanLahan.persenDariAmbangBatas} persen dari batas</p>
      </div>

      <div className={kelasKartu}>
        <p className={kelasJudul}>
          {hamaNaik ? <ArrowUpRight className="h-4 w-4" aria-hidden /> : <ArrowDownRight className="h-4 w-4" aria-hidden />} Dibanding minggu lalu
        </p>
        <p
          className={gabungkanNamaKelas(
            "mt-2 font-pestguardMono text-4xl font-semibold",
            hamaNaik ? "text-pestguardMerahPeringatan" : "text-pestguardHijauTua"
          )}
        >
          {ringkasanLahan.perubahanMingguanPersen > 0 ? "+" : ""}
          {ringkasanLahan.perubahanMingguanPersen}%
        </p>
        <p className="mt-1 text-sm text-pestguardAbuTeks">
          {hamaNaik ? "Hama bertambah" : hamaTurun ? "Hama berkurang" : "Hampir sama"} (minggu lalu {ringkasanLahan.totalDeteksiMingguLalu})
        </p>
      </div>

      <div className={kelasKartu}>
        <p className={kelasJudul}>
          <ScanSearch className="h-4 w-4" aria-hidden /> Keyakinan sistem
        </p>
        <p className="mt-2 font-pestguardMono text-4xl font-semibold text-pestguardHijauTua">
          {formatAngkaSebagaiPersen(ringkasanLahan.rataRataKeyakinanHariIni)}
        </p>
        <p className="mt-1 text-sm text-pestguardAbuTeks">
          {keyakinanDipercaya ? "Cukup bisa dipercaya" : "Rendah, mohon cek langsung ke lahan"}
        </p>
      </div>
    </div>
  );
}
