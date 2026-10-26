"use client";

import type { TingkatKeyakinanDeteksi, TingkatRisikoLahan } from "@/lib/types";
import type { Teks3 } from "@/lib/i18n/bahasa";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

export const LABEL_RISIKO: Record<TingkatRisikoLahan, Teks3> = {
  tinggi: { id: "Perlu tindakan", en: "Action needed", ko: "조치 필요" },
  sedang: { id: "Waspada", en: "Watch", ko: "주의" },
  rendah: { id: "Aman", en: "Safe", ko: "안전" },
};

const KELAS_RISIKO: Record<TingkatRisikoLahan, string> = {
  tinggi: "bg-red-50 text-pestguardMerahPeringatan border-red-200",
  sedang: "bg-amber-50 text-pestguardKuningPeringatan border-amber-200",
  rendah: "bg-pestguardHijauLembut text-pestguardHijauUtama border-green-200",
};

const LABEL_KEYAKINAN: Record<TingkatKeyakinanDeteksi, Teks3> = {
  tinggi: { id: "Yakin", en: "Confident", ko: "확실" },
  sedang: { id: "Cukup yakin", en: "Fairly sure", ko: "보통" },
  rendah: { id: "Kurang yakin", en: "Unsure", ko: "불확실" },
};

const KELAS_KEYAKINAN: Record<TingkatKeyakinanDeteksi, string> = {
  tinggi: "bg-pestguardHijauLembut text-pestguardHijauUtama border-green-200",
  sedang: "bg-amber-50 text-pestguardKuningPeringatan border-amber-200",
  rendah: "bg-red-50 text-pestguardMerahPeringatan border-red-200",
};

const KELAS_DASAR_LENCANA = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

export function LencanaRisiko({ tingkatRisiko }: { tingkatRisiko: TingkatRisikoLahan }) {
  const { p } = useBahasa();
  return <span className={gabungkanNamaKelas(KELAS_DASAR_LENCANA, KELAS_RISIKO[tingkatRisiko])}>{p(LABEL_RISIKO[tingkatRisiko])}</span>;
}

export function LencanaKeyakinan({ tingkatKeyakinan }: { tingkatKeyakinan: TingkatKeyakinanDeteksi }) {
  const { p } = useBahasa();
  return <span className={gabungkanNamaKelas(KELAS_DASAR_LENCANA, KELAS_KEYAKINAN[tingkatKeyakinan])}>{p(LABEL_KEYAKINAN[tingkatKeyakinan])}</span>;
}

export function LencanaKomoditas({ namaKomoditas }: { namaKomoditas: string }) {
  return <span className={gabungkanNamaKelas(KELAS_DASAR_LENCANA, "border-pestguardAbuGaris bg-white text-pestguardHijauTua")}>{namaKomoditas}</span>;
}
