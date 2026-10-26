"use client";

import type { ReactNode } from "react";
import type { Teks3 } from "@/lib/i18n/bahasa";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

/** Judul halaman tiga bahasa, dipakai halaman server yang tidak bisa memakai hook */
export default function JudulHalaman({ judul, keterangan, aksi }: { judul: Teks3; keterangan?: Teks3; aksi?: ReactNode }) {
  const { p } = useBahasa();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-pestguardDisplay text-[28px] font-semibold text-pestguardHijauTua sm:text-[32px]">{p(judul)}</h1>
        {keterangan && <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-pestguardAbuTeks">{p(keterangan)}</p>}
      </div>
      {aksi}
    </div>
  );
}
