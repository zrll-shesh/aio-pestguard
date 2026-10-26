"use client";

import { useState } from "react";
import { ArrowRight, ChevronUp, FlaskConical, Leaf, MapPin, Ruler } from "lucide-react";
import type { HasilDeteksiHama, RingkasanLahan } from "@/lib/types";
import KartuDasar from "@/components/ui/KartuDasar";
import { LencanaKeyakinan } from "@/components/ui/LencanaStatus";
import BlokPengendalian from "@/components/pengendalian/BlokPengendalian";
import { ambilPanduanKelompok } from "@/lib/model/kelasHama";
import { ringkasPengendalian } from "@/lib/model/referensiPestisida";
import { normalisasiNamaHama } from "@/lib/insightEngine";
import { kelasDariKunciHama, namaHamaDariDeteksi, susunLinimasa, type TitikLinimasa } from "@/lib/i18n/wawasanLahan";
import { formatAngkaSebagaiPersen, gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

const WARNA_TITIK: Record<TitikLinimasa["jenis"], string> = {
  sekarang: "bg-pestguardHijauSedang",
  dewasa: "bg-amber-400",
  bertelur: "bg-amber-500",
  batas: "bg-pestguardMerahPeringatan",
};

/**
 * Wawasan untuk hama yang dipilih pada foto sesi, dibuat visual: linimasa prediksi
 * (sekarang, jadi dewasa, bertelur, batas bertindak) dan tiga ubin tindakan.
 * Penjelasan lengkap dan pilihan obat dibuka lewat tombol "Lihat detail".
 */
export default function PanelWawasanHama({ deteksiTerpilih, ringkasanLahan }: { deteksiTerpilih: HasilDeteksiHama | null; ringkasanLahan: RingkasanLahan }) {
  const { bahasa, p, tk, angka } = useBahasa();
  const [detailTerbuka, setDetailTerbuka] = useState(false);
  const judul = p({ id: "Prediksi & analisis hama terpilih", en: "Prediction & analysis for the selected pest", ko: "선택한 해충 예측 및 분석" });

  if (!deteksiTerpilih) {
    return (
      <KartuDasar judulKartu={judul}>
        <p className="text-sm text-pestguardAbuTeks">
          {p({
            id: "Ketuk salah satu kotak pada foto untuk melihat fase hidup hama, perkiraan waktu bertelur, dan cara mengendalikannya.",
            en: "Tap a box on the photo to see the pest's life stage, expected egg-laying time, and how to control it.",
            ko: "사진의 상자를 누르면 해충의 발육 단계, 예상 산란 시기, 방제 방법이 표시됩니다.",
          })}
        </p>
      </KartuDasar>
    );
  }

  const kelas = kelasDariKunciHama(normalisasiNamaHama(deteksiTerpilih.class_name_ip102));
  const panduan = kelas ? ambilPanduanKelompok(kelas) : null;
  const pengendalian = kelas ? ringkasPengendalian(kelas.classId) : null;
  const linimasa = susunLinimasa(bahasa, deteksiTerpilih);

  const ubin = [
    { Ikon: MapPin, warna: "bg-pestguardHijauUtama text-white", judul: p({ id: "Periksa", en: "Check", ko: "확인" }), isi: panduan ? tk(panduan.tempatPeriksa).split(/(?<=\.)\s/)[0] : "-" },
    {
      Ikon: Leaf,
      warna: "bg-pestguardHijauLembut text-pestguardHijauUtama",
      judul: p({ id: "Coba alami", en: "Try natural", ko: "친환경 먼저" }),
      isi: pengendalian?.alami[0] ? tk(pengendalian.alami[0].nama) : kelas ? tk(kelas.pengendalian[0]).split(/(?<=\.)\s/)[0] : "-",
    },
    {
      Ikon: FlaskConical,
      warna: "bg-pestguardHijauPudar text-pestguardHijauSedang",
      judul: p({ id: "Bila terpaksa", en: "If needed", ko: "필요할 때" }),
      isi: pengendalian?.kimiaBoleh[0]?.bahanAktif ?? p({ id: "Tanyakan ke PPL", en: "Ask an extension officer", ko: "지도사에게 문의" }),
    },
  ];

  return (
    <KartuDasar judulKartu={judul} keteranganKartu={`${namaHamaDariDeteksi(bahasa, deteksiTerpilih)}, ${ringkasanLahan.namaLahan}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-pestguardDisplay text-[18px] font-semibold text-pestguardHijauTua">{formatAngkaSebagaiPersen(deteksiTerpilih.confidence)}</span>
        <LencanaKeyakinan tingkatKeyakinan={deteksiTerpilih.tingkatKeyakinan} />
        {deteksiTerpilih.estimasiUkuranCm !== null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-pestguardHijauPudar px-2.5 py-0.5 text-[12px] font-semibold text-pestguardTeksUtama">
            <Ruler className="h-3.5 w-3.5" aria-hidden /> {angka(deteksiTerpilih.estimasiUkuranCm, 2)} cm
          </span>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-pestguardHijauPudar p-4">
        {linimasa.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-pestguardAbuTeks">
            {p({ id: "Belum ada data ukuran untuk memperkirakan umur hama ini.", en: "No size data yet to estimate this pest's age.", ko: "이 해충의 나이를 추정할 크기 자료가 없습니다." })}
          </p>
        ) : (
          <ol>
            {linimasa.map((titik, i) => (
              <li key={titik.judul} className="relative flex gap-3 pb-3 last:pb-0">
                {i < linimasa.length - 1 && <span className="absolute left-[7px] top-4 h-full w-0.5 bg-pestguardAbuGaris" aria-hidden />}
                <span className={gabungkanNamaKelas("relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white shadow", WARNA_TITIK[titik.jenis])} aria-hidden />
                <div className="min-w-0">
                  <p className={gabungkanNamaKelas("text-[14px] font-semibold", titik.jenis === "batas" ? "text-pestguardMerahPeringatan" : "text-pestguardTeksUtama")}>{titik.judul}</p>
                  <p className="text-[12.5px] leading-snug text-pestguardAbuTeks">{titik.keterangan}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="mt-3 grid gap-2">
        {ubin.map(({ Ikon, warna, judul: j, isi }) => (
          <div key={j} className="flex items-start gap-2.5 rounded-xl border border-pestguardAbuGaris p-2.5">
            <span className={gabungkanNamaKelas("grid h-9 w-9 shrink-0 place-items-center rounded-xl", warna)}>
              <Ikon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11.5px] font-semibold text-pestguardAbuTeks">{j}</p>
              <p className="text-[13px] font-semibold leading-snug text-pestguardTeksUtama">{isi}</p>
            </div>
          </div>
        ))}
      </div>

      {detailTerbuka && kelas && (
        <div className="pestguard-muncul mt-4 space-y-3 border-t border-pestguardAbuGaris pt-4">
          <p className="text-[13.5px] leading-relaxed text-pestguardTeksUtama">{tk(kelas.gejala)}</p>
          {deteksiTerpilih.estimasiStadium && (
            <p className="text-[12.5px] leading-relaxed text-pestguardAbuTeks">
              {p({ id: "Dasar perkiraan: ", en: "Basis of estimate: ", ko: "추정 근거: " })}
              {tk(deteksiTerpilih.estimasiStadium.catatanReferensiBiologis.split(". Sumber: ")[0])}.
            </p>
          )}
          <BlokPengendalian classId={kelas.classId} namaKomoditas={kelas.komoditas} />
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setDetailTerbuka((v) => !v)}
          aria-expanded={detailTerbuka}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-[13.5px] font-semibold text-pestguardHijauUtama hover:bg-pestguardHijauPudar"
        >
          {detailTerbuka ? p({ id: "Tutup detail", en: "Hide details", ko: "상세 닫기" }) : p({ id: "Lihat detail", en: "See details", ko: "상세 보기" })}
          {detailTerbuka ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </KartuDasar>
  );
}
