"use client";

import { AlertTriangle, Gauge, Layers, ScanSearch, Target, Timer } from "lucide-react";
import type { DeteksiTerolah, WawasanPrediksi } from "@/lib/model/wawasanPrediksi";
import { WARNA_KOMODITAS } from "@/lib/model/kelasHama";
import { LencanaKeyakinan } from "@/components/ui/LencanaStatus";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import { WARNA_KOTAK } from "./PenampilDeteksi";

function persen(nilai: number, digit = 0) {
  return `${(nilai * 100).toFixed(digit)}%`;
}

export function KartuAngkaPrediksi({ wawasan, waktuInferensiMs, modelGpuMs }: { wawasan: WawasanPrediksi; waktuInferensiMs: number; modelGpuMs: number }) {
  const { p, komoditas } = useBahasa();
  const daftarKomoditas = wawasan.komoditasTerlibat.map((k) => komoditas(k).toLowerCase()).join(", ");
  const daftarKartu = [
    {
      Ikon: ScanSearch,
      judul: p({ id: "Objek terdeteksi", en: "Objects detected", ko: "탐지된 객체" }),
      nilai: String(wawasan.jumlahDeteksi),
      keterangan:
        wawasan.ringkasanPerKelas.length > 0
          ? p({ id: `${wawasan.ringkasanPerKelas.length} jenis hama, ${daftarKomoditas}`, en: `${wawasan.ringkasanPerKelas.length} pest type(s), ${daftarKomoditas}`, ko: `해충 ${wawasan.ringkasanPerKelas.length}종, ${daftarKomoditas}` })
          : wawasan.jumlahKandidatDiBawahAmbang > 0
            ? p({ id: `${wawasan.jumlahKandidatDiBawahAmbang} kandidat di bawah ambang`, en: `${wawasan.jumlahKandidatDiBawahAmbang} candidates below threshold`, ko: `임계값 미만 후보 ${wawasan.jumlahKandidatDiBawahAmbang}개` })
            : p({ id: "tidak ada kandidat", en: "no candidates", ko: "후보 없음" }),
    },
    {
      Ikon: Gauge,
      judul: p({ id: "Keyakinan rata-rata", en: "Average confidence", ko: "평균 신뢰도" }),
      nilai: wawasan.jumlahDeteksi ? persen(wawasan.rataRataSkor) : "-",
      keterangan: p({ id: "skor keluaran model", en: "model output score", ko: "모델 출력 점수" }),
    },
    {
      Ikon: Target,
      judul: p({ id: "Peluang benar (terkalibrasi)", en: "Chance correct (calibrated)", ko: "정답 확률(보정)" }),
      nilai: wawasan.rataRataAkurasiEmpiris !== null ? persen(wawasan.rataRataAkurasiEmpiris) : "-",
      keterangan: p({ id: "dari diagram kalibrasi data uji", en: "from the test-data calibration chart", ko: "시험 데이터 보정 도표 기준" }),
    },
    {
      Ikon: Timer,
      judul: p({ id: "Waktu inferensi", en: "Inference time", ko: "추론 시간" }),
      nilai: `${Math.round(waktuInferensiMs)} ms`,
      keterangan: p({ id: `di browser Anda, GPU T4 saat uji ${modelGpuMs} ms`, en: `in your browser; ${modelGpuMs} ms on a T4 GPU in testing`, ko: `내 브라우저 기준, 시험 시 T4 GPU ${modelGpuMs}ms` }),
    },
  ];
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {daftarKartu.map(({ Ikon, judul, nilai, keterangan }) => (
        <div key={judul} className="flex flex-col gap-1 rounded-pestguardKartu border border-pestguardAbuGaris bg-white px-[18px] py-4 shadow-pestguardKartu">
          <div className="flex items-center justify-between gap-2 text-[12px] font-semibold text-pestguardAbuTeks">
            {judul}
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] bg-pestguardHijauLembut text-pestguardHijauUtama">
              <Ikon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <strong className="font-pestguardDisplay text-[28px] font-semibold text-pestguardHijauTua">{nilai}</strong>
          <small className="text-[12px] leading-snug text-pestguardAbuTeks">{keterangan}</small>
        </div>
      ))}
    </div>
  );
}

function BarisDeteksi({ deteksi, terpilih, saatDipilih }: { deteksi: DeteksiTerolah; terpilih: boolean; saatDipilih: () => void }) {
  const { p, tk, komoditas } = useBahasa();
  const bawah = Math.round(deteksi.akurasiEmpiris.bawah * 100);
  const atas = Math.round(deteksi.akurasiEmpiris.atas * 100);
  const akurasi = persen(deteksi.akurasiEmpiris.akurasi);
  const n = deteksi.akurasiEmpiris.jumlahSampel;
  return (
    <li>
      <button
        type="button"
        onClick={saatDipilih}
        aria-pressed={terpilih}
        className={gabungkanNamaKelas(
          "w-full rounded-xl border p-3 text-left transition-colors",
          terpilih ? "border-pestguardHijauUtama bg-pestguardHijauPudar" : "border-pestguardAbuGaris hover:border-pestguardHijauMuda"
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-pestguardDisplay text-[13px] font-bold text-pestguardNampan"
            style={{ background: WARNA_KOTAK[deteksi.tingkatKeyakinan] }}
          >
            {deteksi.nomor}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-pestguardTeksUtama">{tk(deteksi.kelas.namaIndonesia)}</span>
              <span className="inline-flex items-center gap-1 text-[11.5px] text-pestguardAbuTeks">
                <span className="h-2 w-2 rounded-full" style={{ background: WARNA_KOMODITAS[deteksi.kelas.komoditas] }} aria-hidden />
                {komoditas(deteksi.kelas.komoditas)}
              </span>
            </div>
            <p className="text-[12px] italic text-pestguardAbuTeks">
              {deteksi.kelas.namaIlmiah} <span className="not-italic">({deteksi.kelas.namaIp102})</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-pestguardDisplay text-lg font-semibold text-pestguardHijauTua">{persen(deteksi.skor)}</p>
            <LencanaKeyakinan tingkatKeyakinan={deteksi.tingkatKeyakinan} />
          </div>
        </div>

        <div className="mt-3 space-y-1.5 pl-10">
          {[{ kelas: deteksi.kelas, skor: deteksi.skor, utama: true }, ...deteksi.alternatif.map((a) => ({ ...a, utama: false }))].map((baris) => (
            <div key={baris.kelas.classId} className="grid grid-cols-[minmax(0,1fr)_minmax(60px,110px)_40px] items-center gap-2 text-[11.5px]">
              <span className={gabungkanNamaKelas("truncate", baris.utama ? "font-semibold text-pestguardTeksUtama" : "text-pestguardAbuTeks")}>
                {baris.utama ? p({ id: "Tebakan utama", en: "Main guess", ko: "주 예측" }) : tk(baris.kelas.namaIndonesia)}
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-pestguardHijauLembut" aria-hidden>
                <span className={gabungkanNamaKelas("block h-full rounded-full", baris.utama ? "bg-pestguardHijauUtama" : "bg-pestguardHijauMuda")} style={{ width: `${Math.max(2, baris.skor * 100)}%` }} />
              </span>
              <span className="text-right text-pestguardAbuTeks">{persen(baris.skor)}</span>
            </div>
          ))}
        </div>

        <p className="mt-2.5 pl-10 text-[12px] leading-snug text-pestguardAbuTeks">
          {p({
            id: `Deteksi dengan keyakinan ${bawah} sampai ${atas}% benar ${akurasi} di data uji (${n} sampel).`,
            en: `Detections at ${bawah}-${atas}% confidence were correct ${akurasi} of the time in test data (${n} samples).`,
            ko: `신뢰도 ${bawah}~${atas}% 탐지는 시험 데이터에서 ${akurasi} 정확했습니다(표본 ${n}개).`,
          })}
        </p>
        {(deteksi.adaPesaingDekat || deteksi.seringTertukarDengan) && (
          <p className="mt-1.5 flex gap-1.5 pl-10 text-[12px] leading-snug text-pestguardKuningPeringatan">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {deteksi.adaPesaingDekat
              ? p({ id: "Skor kelas alternatif cukup dekat. Model ragu di antara keduanya.", en: "An alternative class scores close. The model is torn between them.", ko: "대체 후보 점수가 가깝습니다. 모델이 둘 사이에서 망설입니다." })
              : p({
                  id: `Kelas ini tercatat sering tertukar dengan ${tk(deteksi.seringTertukarDengan?.namaIndonesia ?? "")}.`,
                  en: `This class is often confused with ${tk(deteksi.seringTertukarDengan?.namaIndonesia ?? "")}.`,
                  ko: `이 종류는 ${tk(deteksi.seringTertukarDengan?.namaIndonesia ?? "")}와 자주 혼동됩니다.`,
                })}
          </p>
        )}
      </button>
    </li>
  );
}

export function DaftarDeteksi({ wawasan, idDeteksiTerpilih, saatDeteksiDipilih }: { wawasan: WawasanPrediksi; idDeteksiTerpilih: string | null; saatDeteksiDipilih: (id: string | null) => void }) {
  const { p, tk } = useBahasa();
  const kandidat = wawasan.kandidatTerkuatDiBawahAmbang;
  return (
    <section className="min-w-0 rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-pestguardDisplay text-[19px] font-semibold text-pestguardHijauTua">{p({ id: "Setiap objek yang ditemukan", en: "Every object found", ko: "찾은 객체 전체" })}</h2>
          <p className="mt-1 text-[13.5px] text-pestguardAbuTeks">
            {p({
              id: "Ketuk untuk menyorot kotaknya. Bilah menunjukkan kelas lain yang ikut dipertimbangkan model.",
              en: "Tap to highlight its box. Bars show other classes the model also considered.",
              ko: "누르면 상자가 강조됩니다. 막대는 모델이 함께 고려한 다른 후보입니다.",
            })}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pestguardHijauPudar px-2.5 py-1 text-[11.5px] font-semibold text-pestguardAbuTeks">
          <Layers className="h-3.5 w-3.5" aria-hidden /> {wawasan.jumlahDeteksi} {p({ id: "objek", en: "objects", ko: "개" })}
        </span>
      </header>
      {wawasan.daftarDeteksi.length === 0 ? (
        <div className="rounded-xl bg-pestguardHijauPudar p-4 text-[13.5px] leading-relaxed text-pestguardAbuTeks">
          {p({ id: "Tidak ada objek di atas ambang.", en: "No objects above the threshold.", ko: "임계값 이상의 객체가 없습니다." })}
          {kandidat &&
            " " +
              p({
                id: `Kandidat terkuat: ${tk(kandidat.kelas.namaIndonesia)} dengan keyakinan ${persen(kandidat.skor)}. Geser ambang ke bawah untuk melihatnya.`,
                en: `Strongest candidate: ${tk(kandidat.kelas.namaIndonesia)} at ${persen(kandidat.skor)}. Lower the threshold to see it.`,
                ko: `가장 강한 후보: ${tk(kandidat.kelas.namaIndonesia)}(${persen(kandidat.skor)}). 임계값을 낮추면 볼 수 있습니다.`,
              })}
        </div>
      ) : (
        <ul className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
          {wawasan.daftarDeteksi.map((deteksi) => (
            <BarisDeteksi
              key={deteksi.idDeteksi}
              deteksi={deteksi}
              terpilih={idDeteksiTerpilih === deteksi.idDeteksi}
              saatDipilih={() => saatDeteksiDipilih(idDeteksiTerpilih === deteksi.idDeteksi ? null : deteksi.idDeteksi)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
