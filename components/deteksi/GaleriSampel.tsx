"use client";

import { Check, FolderOpen } from "lucide-react";
import type { SampelGambar } from "@/lib/model/sampelGambar";
import { ambilKelasHama } from "@/lib/model/kelasHama";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

interface PropsGaleriSampel {
  daftarSampel: SampelGambar[];
  namaBerkasTerpilih: string | null;
  saatSampelDipilih: (namaBerkas: string) => void;
  terkunci: boolean;
}

export default function GaleriSampel({ daftarSampel, namaBerkasTerpilih, saatSampelDipilih, terkunci }: PropsGaleriSampel) {
  const { p, komoditas } = useBahasa();
  if (daftarSampel.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-pestguardAbuGaris bg-pestguardHijauPudar p-4 text-[13px] leading-relaxed text-pestguardAbuTeks">
        <FolderOpen className="mb-2 h-5 w-5 text-pestguardHijauSedang" aria-hidden />
        {p({ id: "Belum ada gambar uji. Taruh berkas .jpg atau .png di", en: "No test images yet. Put .jpg or .png files in", ko: "시험 이미지가 없습니다. .jpg 또는 .png 파일을" })}{" "}
        <code className="rounded bg-white px-1">public/sample-images</code>
        {p({ id: ", lalu muat ulang halaman.", en: ", then reload the page.", ko: "에 넣고 새로고침하세요." })}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={p({ id: "Gambar uji", en: "Test images", ko: "시험 이미지" })} className="grid max-h-[340px] grid-cols-3 gap-2 overflow-y-auto pr-1">
      {daftarSampel.map((sampel) => {
        const terpilih = sampel.namaBerkas === namaBerkasTerpilih;
        const kelasAsli = sampel.classIdLabelAsli !== null ? ambilKelasHama(sampel.classIdLabelAsli) : null;
        return (
          <button
            key={sampel.namaBerkas}
            type="button"
            role="radio"
            aria-checked={terpilih}
            disabled={terkunci}
            onClick={() => saatSampelDipilih(sampel.namaBerkas)}
            title={sampel.namaBerkas}
            className={gabungkanNamaKelas(
              "group relative overflow-hidden rounded-xl border-2 bg-pestguardHijauPudar text-left transition-colors disabled:cursor-not-allowed",
              terpilih ? "border-pestguardHijauUtama" : "border-transparent hover:border-pestguardHijauMuda"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sampel.alamat} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            <span className="block truncate px-1.5 py-1 text-[11px] font-semibold text-pestguardTeksUtama">{p(sampel.judul)}</span>
            {kelasAsli && (
              <span className="absolute left-1 top-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[9.5px] font-bold text-pestguardHijauTua">
                {komoditas(kelasAsli.komoditas)}
              </span>
            )}
            {terpilih && (
              <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-pestguardHijauUtama text-white">
                <Check className="h-3 w-3" aria-hidden />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
