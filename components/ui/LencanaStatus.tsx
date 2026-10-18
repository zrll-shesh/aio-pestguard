import type { TingkatKeyakinanDeteksi, TingkatRisikoLahan } from "@/lib/types";
import { gabungkanNamaKelas } from "@/lib/utils";

const GAYA_LENCANA_RISIKO: Record<TingkatRisikoLahan, { label: string; kelas: string }> = {
  tinggi: { label: "Risiko Tinggi", kelas: "bg-red-50 text-pestguardMerahPeringatan border-red-200" },
  sedang: { label: "Waspada", kelas: "bg-amber-50 text-pestguardKuningPeringatan border-amber-200" },
  rendah: { label: "Aman", kelas: "bg-pestguardHijauLembut text-pestguardHijauUtama border-green-200" },
};

const GAYA_LENCANA_KEYAKINAN: Record<TingkatKeyakinanDeteksi, { label: string; kelas: string }> = {
  tinggi: { label: "Yakin", kelas: "bg-pestguardHijauLembut text-pestguardHijauUtama border-green-200" },
  sedang: { label: "Cukup yakin", kelas: "bg-amber-50 text-pestguardKuningPeringatan border-amber-200" },
  rendah: { label: "Kurang yakin", kelas: "bg-red-50 text-pestguardMerahPeringatan border-red-200" },
};

const KELAS_DASAR_LENCANA =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

export function LencanaRisiko({ tingkatRisiko }: { tingkatRisiko: TingkatRisikoLahan }) {
  const gaya = GAYA_LENCANA_RISIKO[tingkatRisiko];
  return <span className={gabungkanNamaKelas(KELAS_DASAR_LENCANA, gaya.kelas)}>{gaya.label}</span>;
}

export function LencanaKeyakinan({ tingkatKeyakinan }: { tingkatKeyakinan: TingkatKeyakinanDeteksi }) {
  const gaya = GAYA_LENCANA_KEYAKINAN[tingkatKeyakinan];
  return <span className={gabungkanNamaKelas(KELAS_DASAR_LENCANA, gaya.kelas)}>{gaya.label}</span>;
}

export function LencanaKomoditas({ namaKomoditas }: { namaKomoditas: string }) {
  return (
    <span className={gabungkanNamaKelas(KELAS_DASAR_LENCANA, "border-pestguardAbuGaris bg-white text-pestguardHijauTua")}>
      {namaKomoditas}
    </span>
  );
}
