"use client";

import { useCallback, useState } from "react";
import { AlertTriangle, Bug, Radar, Sprout } from "lucide-react";
import type { RingkasanLahan, SesiPemantauanLahan } from "@/lib/types";
import { DAFTAR_PERANGKAP } from "@/lib/dataPeta";
import { kalimatRingkasanSemuaLahan, namaHamaLahan } from "@/lib/i18n/wawasanLahan";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import AjakanCekFoto from "@/components/dashboard/AjakanCekFoto";
import PetaSebaran from "./PetaSebaran";
import KartuPrediksiLahan from "./KartuPrediksiLahan";

export default function BerandaLahan({ daftarRingkasan, daftarSesi }: { daftarRingkasan: RingkasanLahan[]; daftarSesi: SesiPemantauanLahan[] }) {
  const { bahasa, p, komoditas } = useBahasa();
  const [idLahanTerpilih, setIdLahanTerpilih] = useState<string | null>(null);

  const lihatDetail = useCallback((idLahan: string) => {
    document.getElementById(`prediksi-${idLahan}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const totalHariIni = daftarRingkasan.reduce((j, r) => j + r.totalDeteksiHariIni, 0);
  const perluTindakan = daftarRingkasan.filter((r) => r.tingkatRisiko === "tinggi").length;
  const utama = daftarRingkasan[0];
  const sesiTerbaruPerLahan = (idLahan: string) => daftarSesi.find((s) => s.idLahan === idLahan) ?? null;

  const kpi = [
    { Ikon: Bug, judul: p({ id: "Hama tertangkap hari ini", en: "Pests caught today", ko: "오늘 잡힌 해충" }), nilai: String(totalHariIni), ket: p({ id: `dari ${DAFTAR_PERANGKAP.length} perangkap`, en: `from ${DAFTAR_PERANGKAP.length} traps`, ko: `트랩 ${DAFTAR_PERANGKAP.length}개 기준` }) },
    {
      Ikon: AlertTriangle,
      judul: p({ id: "Lahan perlu tindakan", en: "Fields needing action", ko: "조치 필요 농지" }),
      nilai: `${perluTindakan}/${daftarRingkasan.length}`,
      ket: p({ id: "melewati batas aman mingguan", en: "over the weekly safe limit", ko: "주간 안전 기준 초과" }),
      bahaya: perluTindakan > 0,
    },
    {
      Ikon: Radar,
      judul: p({ id: "Hama paling mendesak", en: "Most urgent pest", ko: "가장 급한 해충" }),
      nilai: utama ? namaHamaLahan(bahasa, utama) : "-",
      ket: utama ? `${utama.namaLahan} · ${komoditas(utama.komoditas)}` : "",
      kecil: true,
    },
    {
      Ikon: Sprout,
      judul: p({ id: "Lahan dipantau", en: "Fields monitored", ko: "관찰 중인 농지" }),
      nilai: String(daftarRingkasan.length),
      ket: `${daftarRingkasan.reduce((j, r) => j + r.luasHektar, 0).toFixed(1)} ha`,
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <AjakanCekFoto />

      <section className="pestguard-hero rounded-[22px] p-6 text-white shadow-pestguardKartuAngkat sm:p-8">
        <div className="relative z-[1]">
          <p className="text-[13px] font-semibold text-pestguardHijauMuda">{p({ id: "Ringkasan hari ini (data contoh)", en: "Today's summary (sample data)", ko: "오늘의 요약 (예시 데이터)" })}</p>
          <h1 className="mt-2 max-w-4xl font-pestguardDisplay text-[24px] font-semibold leading-snug sm:text-[31px]">{kalimatRingkasanSemuaLahan(bahasa, daftarRingkasan)}</h1>
          {utama && (
            <button
              type="button"
              onClick={() => {
                setIdLahanTerpilih(utama.idLahan);
                document.getElementById("peta-sebaran")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-pestguardHijauMuda px-4 text-[14px] font-bold text-pestguardNampan hover:bg-white"
            >
              {p({ id: `Tunjukkan ${utama.namaLahan} di peta`, en: `Show ${utama.namaLahan} on the map`, ko: `지도에서 ${utama.namaLahan} 보기` })}
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {kpi.map(({ Ikon, judul, nilai, ket, bahaya, kecil }) => (
          <div key={judul} className="flex flex-col gap-1 rounded-pestguardKartu border border-pestguardAbuGaris bg-white px-[18px] py-4 shadow-pestguardKartu">
            <div className="flex items-center justify-between gap-2 text-[12.5px] font-semibold text-pestguardAbuTeks">
              {judul}
              <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] ${bahaya ? "bg-red-50 text-pestguardMerahPeringatan" : "bg-pestguardHijauLembut text-pestguardHijauUtama"}`}>
                <Ikon className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <strong className={`font-pestguardDisplay font-semibold text-pestguardHijauTua ${kecil ? "text-[19px] leading-tight" : "text-[28px]"}`}>{nilai}</strong>
            <small className="text-[12px] text-pestguardAbuTeks">{ket}</small>
          </div>
        ))}
      </div>

      <div id="peta-sebaran" className="scroll-mt-20">
        <PetaSebaran daftarRingkasan={daftarRingkasan} idLahanTerpilih={idLahanTerpilih} saatLahanDipilih={setIdLahanTerpilih} saatLihatDetail={lihatDetail} />
      </div>

      <section>
        <h2 className="font-pestguardDisplay text-[20px] font-semibold text-pestguardHijauTua">{p({ id: "Prediksi per lahan", en: "Forecast by field", ko: "농지별 예측" })}</h2>
        <p className="mt-0.5 text-[13.5px] text-pestguardAbuTeks">
          {p({
            id: "Diurutkan dari yang paling perlu perhatian. Tekan “Lihat detail” untuk penjelasan lengkap.",
            en: "Sorted from most to least urgent. Tap “See details” for the full explanation.",
            ko: "가장 급한 순서로 정렬했습니다. 자세한 설명은 '상세 보기'를 누르세요.",
          })}
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {daftarRingkasan.map((r) => (
            <KartuPrediksiLahan key={r.idLahan} ringkasan={r} sesiTerbaru={sesiTerbaruPerLahan(r.idLahan)} />
          ))}
        </div>
      </section>
    </div>
  );
}
